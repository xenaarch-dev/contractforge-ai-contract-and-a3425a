"""Tests for ContractForgeMetricsAgent — daily metrics reader."""
from __future__ import annotations

from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from backend.app.agents.metrics_agent import ContractForgeMetricsAgent


# ── Mock factory ─────────────────────────────────────────────────────────────


def _make_supabase(
    users_count: int = 5,
    items_count: int = 2,
    subs_data: list[dict] | None = None,
) -> MagicMock:
    """Build a MagicMock supabase client with pre-configured responses."""
    if subs_data is None:
        subs_data = [
            {"plan": "monthly", "active": True},
            {"plan": "per_contract", "active": True},
        ]

    def _table(name: str) -> MagicMock:
        t = MagicMock()
        if name == "users":
            r = MagicMock()
            r.count = users_count
            r.data = []
            t.select.return_value.execute.return_value = r
        elif name == "items":
            r = MagicMock()
            r.count = items_count
            r.data = []
            t.select.return_value.gte.return_value.lt.return_value.execute.return_value = r
        elif name == "subscriptions":
            r = MagicMock()
            r.data = subs_data
            r.count = len(subs_data)
            t.select.return_value.eq.return_value.execute.return_value = r
        elif name == "agent_logs":
            t.insert.return_value.execute.return_value = MagicMock()
            t.select.return_value.eq.return_value.order.return_value.limit.return_value.execute.return_value = MagicMock(data=[])
        return t

    mock = MagicMock()
    mock.table.side_effect = _table
    return mock


# ── Tests ─────────────────────────────────────────────────────────────────────


async def test_run_returns_correct_structure():
    """Agent returns expected shape with agent/status/run_at/summary keys."""
    supabase = _make_supabase(users_count=10, items_count=3)
    agent = ContractForgeMetricsAgent(supabase)
    result = await agent.run()

    assert result["agent"] == "metrics"
    assert result["status"] == "success"
    assert "run_at" in result
    s = result["summary"]
    assert s["total_users"] == 10
    assert s["contracts_today"] == 3
    assert s["contracts_yesterday"] == 3  # same mock returns same count
    assert s["active_subscriptions"] == 2
    assert s["mrr_inr"] == 2499.0  # 1 monthly * ₹2499
    assert s["pdf_exports_today"] == 0
    assert "report_date" in s


async def test_run_logs_to_agent_logs_on_success():
    """Successful run writes a row to agent_logs with status=success."""
    supabase = _make_supabase()
    agent = ContractForgeMetricsAgent(supabase)
    await agent.run()

    table_names = [call.args[0] for call in supabase.table.call_args_list]
    assert "agent_logs" in table_names

    # Verify the inserted payload has status=success
    agent_logs_table = next(
        supabase.table.side_effect(n) for n in ["agent_logs"] if n == "agent_logs"
    )
    # Re-run with a fresh trackable mock to capture insert payload
    insert_payload: dict = {}

    def _tracking_table(name: str):
        t = MagicMock()
        if name == "agent_logs":
            def _capture_insert(data):
                insert_payload.update(data)
                m = MagicMock()
                m.execute.return_value = MagicMock()
                return m
            t.insert.side_effect = _capture_insert
        elif name == "users":
            r = MagicMock(); r.count = 1; r.data = []
            t.select.return_value.execute.return_value = r
        elif name == "items":
            r = MagicMock(); r.count = 0; r.data = []
            t.select.return_value.gte.return_value.lt.return_value.execute.return_value = r
        elif name == "subscriptions":
            r = MagicMock(); r.data = []; r.count = 0
            t.select.return_value.eq.return_value.execute.return_value = r
        return t

    supabase2 = MagicMock()
    supabase2.table.side_effect = _tracking_table
    agent2 = ContractForgeMetricsAgent(supabase2)
    await agent2.run()

    assert insert_payload.get("status") == "success"
    assert insert_payload.get("agent_name") == "metrics"
    assert "duration_ms" in insert_payload


async def test_run_logs_error_status_on_exception():
    """When _collect_metrics raises, agent_logs gets status=error and exception is re-raised."""
    insert_payload: dict = {}

    def _tracking_table(name: str):
        t = MagicMock()
        if name == "agent_logs":
            def _capture_insert(data):
                insert_payload.update(data)
                m = MagicMock()
                m.execute.return_value = MagicMock()
                return m
            t.insert.side_effect = _capture_insert
        return t

    supabase = MagicMock()
    supabase.table.side_effect = _tracking_table

    agent = ContractForgeMetricsAgent(supabase)
    agent._collect_metrics = AsyncMock(side_effect=RuntimeError("db down"))

    with pytest.raises(RuntimeError, match="db down"):
        await agent.run()

    assert insert_payload.get("status") == "error"
    assert "db down" in insert_payload.get("error_message", "")


async def test_subscription_metrics_calculates_mrr_correctly():
    """MRR = monthly plan count * ₹2499; per_contract plans excluded from MRR."""
    subs = [
        {"plan": "monthly", "active": True},
        {"plan": "monthly", "active": True},
        {"plan": "per_contract", "active": True},
    ]
    supabase = _make_supabase(subs_data=subs)
    agent = ContractForgeMetricsAgent(supabase)
    active, mrr = agent._subscription_metrics()

    assert active == 3
    assert mrr == 2 * 2499.0
