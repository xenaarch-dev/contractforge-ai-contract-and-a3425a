from __future__ import annotations

import hashlib
import hmac
import json
import logging

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import JSONResponse

from ..config import settings

logger = logging.getLogger(__name__)

router = APIRouter(tags=["billing"])

PER_CONTRACT_VARIANT = 1701390
MONTHLY_VARIANT = 1701481


def _verify_ls_signature(payload: bytes, signature: str, secret: str) -> bool:
    if not signature or not secret:
        return False
    expected = hmac.new(secret.encode(), payload, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, signature)


def _log_webhook(
    supabase,
    event_type: str,
    ls_id: str | None,
    payload: dict,
    processed: bool,
    error: str | None = None,
) -> None:
    if supabase is None:
        return
    try:
        supabase.table("webhooks_log").insert({
            "event_type": event_type,
            "lemon_squeezy_id": ls_id,
            "payload": payload,
            "processed": processed,
            "error": error,
        }).execute()
    except Exception as exc:
        logger.error("webhooks_log insert failed: %s", exc)


@router.post("/webhooks/lemon-squeezy")
async def ls_webhook(request: Request) -> JSONResponse:
    payload = await request.body()
    signature = request.headers.get("X-Signature", "")
    secret = settings.lemonsqueezy_webhook_secret

    event_type = request.headers.get("X-Event-Name", "")
    supabase = request.app.state.supabase

    if not _verify_ls_signature(payload, signature, secret):
        logger.warning("LS webhook invalid signature for event=%s", event_type)
        _log_webhook(supabase, event_type or "unknown", None, {}, processed=False, error="invalid_signature")
        return JSONResponse({"status": "ok", "note": "invalid_signature"})

    try:
        data = json.loads(payload)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON")

    if not event_type:
        event_type = data.get("meta", {}).get("event_name", "unknown")

    ls_id = str(data.get("data", {}).get("id", "")) or None

    if supabase is None:
        _log_webhook(supabase, event_type, ls_id, data, processed=True)
        return JSONResponse({"status": "ok", "note": "supabase_not_configured"})

    error_msg: str | None = None
    try:
        attrs = data.get("data", {}).get("attributes", {})
        email = (
            data.get("meta", {}).get("custom_data", {}).get("user_email")
            or attrs.get("user_email", "")
        )

        if event_type == "subscription_created":
            supabase.table("subscriptions").upsert(
                {
                    "user_email": email,
                    "ls_subscription_id": ls_id,
                    "plan": "monthly",
                    "contracts_remaining": 999,
                    "active": True,
                    "subscription_ends_at": attrs.get("renews_at"),
                },
                on_conflict="user_email",
            ).execute()

        elif event_type == "subscription_cancelled":
            supabase.table("subscriptions").update({
                "active": False,
                "subscription_ends_at": attrs.get("ends_at"),
            }).eq("user_email", email).execute()

        elif event_type == "subscription_updated":
            new_ends_at = attrs.get("renews_at") or attrs.get("ends_at")
            if new_ends_at:
                active = attrs.get("status") == "active"
                supabase.table("subscriptions").update({
                    "active": active,
                    "subscription_ends_at": new_ends_at,
                }).eq("user_email", email).execute()

        elif event_type == "order_created":
            order_id = str(data.get("data", {}).get("id", ""))
            customer_id = str(attrs.get("customer_id", ""))

            first_item = attrs.get("first_order_item", {})
            variant_id = first_item.get("variant_id")
            if not variant_id:
                items_data = data["data"].get("relationships", {}).get("order-items", {}).get("data", [])
                variant_id = int(items_data[0]["id"]) if items_data else 0

            if int(variant_id) not in (PER_CONTRACT_VARIANT, MONTHLY_VARIANT):
                _log_webhook(supabase, event_type, ls_id, data, processed=True)
                return JSONResponse({"status": "unknown_variant", "variant_id": variant_id})

            existing = (
                supabase.table("subscriptions")
                .select("contracts_remaining")
                .eq("user_email", email)
                .execute()
            )
            if existing.data:
                current = existing.data[0].get("contracts_remaining", 0) or 0
                supabase.table("subscriptions").update({
                    "contracts_remaining": current + 1,
                    "plan": "per_contract",
                    "active": True,
                    "ls_order_id": order_id,
                    "ls_customer_id": customer_id,
                }).eq("user_email", email).execute()
            else:
                supabase.table("subscriptions").upsert(
                    {
                        "user_email": email,
                        "ls_order_id": order_id,
                        "ls_customer_id": customer_id,
                        "plan": "per_contract",
                        "contracts_remaining": 1,
                        "active": True,
                    },
                    on_conflict="user_email",
                ).execute()

    except Exception as exc:
        error_msg = str(exc)
        logger.error("LS webhook processing error event=%s: %s", event_type, exc)

    _log_webhook(supabase, event_type, ls_id, data, processed=(error_msg is None), error=error_msg)
    return JSONResponse({"status": "ok"})


@router.get("/billing/status")
async def billing_status(user_email: str, request: Request) -> JSONResponse:
    checkout_monthly = settings.lemonsqueezy_checkout_monthly
    checkout_per_contract = settings.lemonsqueezy_checkout_per_contract

    supabase = request.app.state.supabase
    if supabase is None:
        return JSONResponse({
            "subscription_active": False,
            "subscription_ends_at": None,
            "credits_remaining": 0,
            "plan": "free",
            "checkout_monthly": checkout_monthly,
            "checkout_per_contract": checkout_per_contract,
        })

    result = (
        supabase.table("subscriptions")
        .select("*")
        .eq("user_email", user_email)
        .eq("active", True)
        .execute()
    )

    if result.data:
        row = result.data[0]
        return JSONResponse({
            "subscription_active": True,
            "subscription_ends_at": row.get("subscription_ends_at") or row.get("expires_at"),
            "credits_remaining": row.get("contracts_remaining", 0),
            "plan": row.get("plan", "free"),
            "checkout_monthly": checkout_monthly,
            "checkout_per_contract": checkout_per_contract,
        })

    return JSONResponse({
        "subscription_active": False,
        "subscription_ends_at": None,
        "credits_remaining": 0,
        "plan": "free",
        "checkout_monthly": checkout_monthly,
        "checkout_per_contract": checkout_per_contract,
    })
