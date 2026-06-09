from __future__ import annotations

import hashlib
import hmac
import json
import os
from unittest.mock import MagicMock, patch

import pytest
from fastapi.testclient import TestClient

from backend.app.main import app


# ── In-memory Supabase mock ───────────────────────────────────────────────────


class _QB:
    """Minimal chainable query-builder backed by a Python list."""

    def __init__(self, rows: list[dict]) -> None:
        self._rows = rows
        self._filters: dict = {}
        self._pending_update: dict | None = None

    def select(self, *_: str) -> "_QB":
        return self

    def eq(self, col: str, val: object) -> "_QB":
        self._filters[col] = val
        return self

    def execute(self) -> object:
        matched = [
            r for r in self._rows
            if all(r.get(k) == v for k, v in self._filters.items())
        ]
        if self._pending_update is not None:
            for r in matched:
                r.update(self._pending_update)

        class _R:
            data = matched

        return _R()

    def insert(self, data: dict) -> object:
        row = dict(data)
        self._rows.append(row)

        class _Chain:
            def execute(self_inner) -> object:
                class _R:
                    pass
                r = _R()
                r.data = [row]
                return r

        return _Chain()

    def update(self, values: dict) -> "_QB":
        qb = _QB(self._rows)
        qb._pending_update = values
        return qb

    def upsert(self, data: dict, on_conflict: str | None = None) -> object:
        key = on_conflict
        if key:
            existing = next(
                (r for r in self._rows if r.get(key) == data.get(key)), None
            )
            if existing:
                existing.update(data)
            else:
                self._rows.append(dict(data))
        else:
            self._rows.append(dict(data))

        class _Chain:
            def execute(self_inner) -> object:
                class _R:
                    pass
                r = _R()
                r.data = [data]
                return r

        return _Chain()


class MockSupabase:
    def __init__(self) -> None:
        self.free_trials: list[dict] = []
        self.subscriptions: list[dict] = []
        self.webhooks_log: list[dict] = []

    def table(self, name: str) -> _QB:
        if name == "free_trials":
            return _QB(self.free_trials)
        if name == "subscriptions":
            return _QB(self.subscriptions)
        if name == "webhooks_log":
            return _QB(self.webhooks_log)
        raise KeyError(name)

    def reset(self) -> None:
        self.free_trials.clear()
        self.subscriptions.clear()
        self.webhooks_log.clear()


_mock_sb = MockSupabase()


# ── Fixtures ──────────────────────────────────────────────────────────────────


@pytest.fixture(autouse=True)
def setup_mocks():
    """Reset mock state and inject test doubles before every test."""
    _mock_sb.reset()

    from backend.app.config import settings as _s

    _s.anthropic_api_key = "sk-ant-test"
    _s.lemonsqueezy_checkout_per_contract = "https://store.test/checkout/per"
    _s.lemonsqueezy_checkout_monthly = "https://store.test/checkout/monthly"

    mock_msg = MagicMock()
    mock_msg.content = [MagicMock(text="Mock contract content.")]
    mock_client = MagicMock()
    mock_client.messages.create.return_value = mock_msg

    with patch("anthropic.Anthropic", return_value=mock_client):
        yield

    _s.anthropic_api_key = ""


@pytest.fixture
def client():
    with TestClient(app) as c:
        # Lifespan runs and sets app.state.supabase = None (no real creds in tests).
        # Override with in-memory mock.
        app.state.supabase = _mock_sb
        yield c


def _ls_sig(secret: str, body: bytes) -> str:
    return hmac.new(secret.encode(), body, hashlib.sha256).hexdigest()


# ── Tests ─────────────────────────────────────────────────────────────────────


def test_generate_fresh_email_grants_free_trial(client):
    """First generate call for a new email → 200, free_trials row created."""
    resp = client.post(
        "/contracts/generate",
        json={
            "user_email": "fresh@test.com",
            "project_type": "website",
            "client_name": "Acme Corp",
            "client_company": "Acme Ltd",
            "scope": "5-page responsive website",
            "fee": 50000,
            "payment_terms": "50% advance, 50% on delivery",
            "timeline": "30 days",
        },
    )
    assert resp.status_code == 200
    trials = [t for t in _mock_sb.free_trials if t["user_email"] == "fresh@test.com"]
    assert len(trials) == 1


def test_generate_second_use_returns_402(client):
    """Same email after free trial is consumed → 402 with subscription_required and checkout URLs."""
    _mock_sb.free_trials.append({"user_email": "used@test.com"})

    resp = client.post(
        "/contracts/generate",
        json={
            "user_email": "used@test.com",
            "project_type": "mobile app",
            "client_name": "Beta Inc",
            "client_company": "Beta",
            "scope": "iOS app",
            "fee": 150000,
            "payment_terms": "monthly",
            "timeline": "90 days",
        },
    )
    assert resp.status_code == 402
    detail = resp.json()["detail"]
    assert detail["error"] == "subscription_required"
    assert detail["upgrade_url"] == "/pricing"
    assert detail["checkout_per_contract"] == "https://store.test/checkout/per"
    assert detail["checkout_monthly"] == "https://store.test/checkout/monthly"
    assert "₹2,499" in detail["message"]


def test_webhook_invalid_hmac_returns_200(client):
    """Webhook with wrong HMAC signature → 200 (LS must not see error), logged internally."""
    from backend.app.config import settings as _s
    _s.lemonsqueezy_webhook_secret = "real-secret-abc"

    body = json.dumps({"meta": {}, "data": {"id": "x", "attributes": {}}}).encode()
    wrong_sig = _ls_sig("wrong-secret", body)

    resp = client.post(
        "/webhooks/lemon-squeezy",
        content=body,
        headers={
            "Content-Type": "application/json",
            "X-Signature": wrong_sig,
            "X-Event-Name": "order_created",
        },
    )
    assert resp.status_code == 200
    assert resp.json().get("note") == "invalid_signature"
    # Must be logged with error
    logs = [e for e in _mock_sb.webhooks_log if e.get("error") == "invalid_signature"]
    assert len(logs) == 1

    _s.lemonsqueezy_webhook_secret = ""


def test_webhook_order_created_inserts_subscription(client):
    """HMAC-signed order_created webhook → subscriptions row inserted, webhooks_log recorded."""
    from backend.app.config import settings as _s
    secret = "test-webhook-secret-12345678901234"
    _s.lemonsqueezy_webhook_secret = secret

    body = json.dumps({
        "meta": {"custom_data": {"user_email": "webhook@test.com"}},
        "data": {
            "id": "order-9001",
            "attributes": {
                "user_email": "webhook@test.com",
                "customer_id": "cust-42",
                "first_order_item": {"variant_id": 1701390},
            },
        },
    }).encode()

    sig = _ls_sig(secret, body)

    resp = client.post(
        "/webhooks/lemon-squeezy",
        content=body,
        headers={
            "Content-Type": "application/json",
            "X-Signature": sig,
            "X-Event-Name": "order_created",
        },
    )
    assert resp.status_code == 200
    subs = [s for s in _mock_sb.subscriptions if s["user_email"] == "webhook@test.com"]
    assert len(subs) == 1
    assert subs[0]["plan"] == "per_contract"
    # Must be logged as processed
    logs = [e for e in _mock_sb.webhooks_log if e.get("processed") is True]
    assert len(logs) == 1

    _s.lemonsqueezy_webhook_secret = ""


def test_generate_with_active_subscription_returns_200(client):
    """Active per_contract subscription → 200, contracts_remaining decremented."""
    _mock_sb.subscriptions.append({
        "id": "sub-abc-123",
        "user_email": "vip@test.com",
        "plan": "per_contract",
        "contracts_remaining": 3,
        "active": True,
    })

    resp = client.post(
        "/contracts/generate",
        json={
            "user_email": "vip@test.com",
            "project_type": "consulting",
            "client_name": "Delta Co",
            "client_company": "Delta",
            "scope": "6-month retainer",
            "fee": 200000,
            "payment_terms": "monthly invoice",
            "timeline": "180 days",
        },
    )
    assert resp.status_code == 200
    sub = next(s for s in _mock_sb.subscriptions if s["user_email"] == "vip@test.com")
    assert sub["contracts_remaining"] == 2


def test_billing_status_free_plan_new_user(client):
    """New user with no subscription → plan=free, subscription_active=False."""
    resp = client.get("/billing/status?user_email=newuser@test.com")
    assert resp.status_code == 200
    data = resp.json()
    assert data["plan"] == "free"
    assert data["subscription_active"] is False
    assert data["credits_remaining"] == 0
    assert data["checkout_monthly"] == "https://store.test/checkout/monthly"
    assert data["checkout_per_contract"] == "https://store.test/checkout/per"


def test_billing_status_monthly_subscribed_user(client):
    """Active monthly subscriber → plan=monthly, subscription_active=True."""
    _mock_sb.subscriptions.append({
        "id": "sub-monthly-1",
        "user_email": "monthly@test.com",
        "plan": "monthly",
        "contracts_remaining": 999,
        "active": True,
        "subscription_ends_at": "2026-07-03T00:00:00Z",
    })

    resp = client.get("/billing/status?user_email=monthly@test.com")
    assert resp.status_code == 200
    data = resp.json()
    assert data["plan"] == "monthly"
    assert data["subscription_active"] is True
    assert data["credits_remaining"] == 999
    assert data["subscription_ends_at"] == "2026-07-03T00:00:00Z"
