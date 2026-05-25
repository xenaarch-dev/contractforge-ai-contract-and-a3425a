from __future__ import annotations

import hashlib
import hmac
import json
import os

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import JSONResponse

router = APIRouter(tags=["billing"])

PER_CONTRACT_VARIANT = 1701390
MONTHLY_VARIANT = 1701481


def _verify_ls_signature(payload: bytes, signature: str, secret: str) -> bool:
    if not signature or not secret:
        return False
    expected = hmac.new(secret.encode(), payload, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, signature)


@router.post("/webhooks/lemonsqueezy")
async def ls_webhook(request: Request) -> JSONResponse:
    payload = await request.body()
    signature = request.headers.get("X-Signature", "")
    secret = os.getenv("LEMONSQUEEZY_WEBHOOK_SECRET", "")

    if not _verify_ls_signature(payload, signature, secret):
        raise HTTPException(status_code=400, detail="Invalid signature")

    try:
        data = json.loads(payload)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON")

    event = request.headers.get("X-Event-Name", "") or data.get("meta", {}).get("event_name", "")
    supabase = request.app.state.supabase

    if supabase is None:
        return JSONResponse({"status": "ok", "note": "supabase_not_configured"})

    if event == "order_created":
        attrs = data["data"]["attributes"]
        email = attrs.get("user_email", "")
        order_id = str(data["data"]["id"])
        customer_id = str(attrs.get("customer_id", ""))

        # Try first_order_item (real LS format), fall back to relationships (test format)
        first_item = attrs.get("first_order_item", {})
        variant_id = first_item.get("variant_id")
        if not variant_id:
            items_data = data["data"].get("relationships", {}).get("order-items", {}).get("data", [])
            variant_id = int(items_data[0]["id"]) if items_data else 0

        if int(variant_id) == PER_CONTRACT_VARIANT:
            plan, remaining = "per_contract", 1
        elif int(variant_id) == MONTHLY_VARIANT:
            plan, remaining = "monthly", 999
        else:
            return JSONResponse({"status": "unknown_variant", "variant_id": variant_id})

        supabase.table("subscriptions").upsert(
            {
                "user_email": email,
                "ls_order_id": order_id,
                "ls_customer_id": customer_id,
                "plan": plan,
                "contracts_remaining": remaining,
                "active": True,
            },
            on_conflict="user_email",
        ).execute()

    elif event == "subscription_created":
        attrs = data["data"]["attributes"]
        email = attrs.get("user_email", "")
        sub_id = str(data["data"]["id"])

        supabase.table("subscriptions").upsert(
            {
                "user_email": email,
                "ls_subscription_id": sub_id,
                "plan": "monthly",
                "contracts_remaining": 999,
                "active": True,
            },
            on_conflict="user_email",
        ).execute()

    elif event == "subscription_cancelled":
        attrs = data["data"]["attributes"]
        email = attrs.get("user_email", "")
        supabase.table("subscriptions").update({"active": False}).eq("user_email", email).execute()

    elif event == "subscription_updated":
        attrs = data["data"]["attributes"]
        email = attrs.get("user_email", "")
        active = attrs.get("status") == "active"
        supabase.table("subscriptions").update({"active": active}).eq("user_email", email).execute()

    return JSONResponse({"status": "ok"})
