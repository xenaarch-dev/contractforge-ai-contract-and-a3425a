from __future__ import annotations

import logging
import time
from datetime import date, datetime, timedelta

logger = logging.getLogger(__name__)

# Monthly plan price in INR — hardcoded until subscriptions table gains an amount column
_MONTHLY_PLAN_PRICE_INR = 2499.0


class ContractForgeMetricsAgent:
    def __init__(self, supabase_client):
        self.supabase = supabase_client
        self.agent_name = "metrics"

    async def run(self) -> dict:
        start = time.time()
        try:
            summary = await self._collect_metrics()
            result = {
                "agent": self.agent_name,
                "run_at": datetime.utcnow().isoformat(),
                "status": "success",
                "summary": summary,
            }
            await self._log_run(result, int((time.time() - start) * 1000))
            return result
        except Exception as e:
            await self._log_run(
                {
                    "agent": self.agent_name,
                    "status": "error",
                    "error_message": str(e),
                },
                int((time.time() - start) * 1000),
            )
            raise

    async def _collect_metrics(self) -> dict:
        today = date.today()
        yesterday = today - timedelta(days=1)

        total_users = self._count_users()
        contracts_today = self._count_items_on_date(today)
        contracts_yesterday = self._count_items_on_date(yesterday)
        active_subscriptions, mrr_inr = self._subscription_metrics()
        # Sprint Day 2: add PDF export event tracking to count exports
        pdf_exports_today = 0

        return {
            "total_users": total_users,
            "contracts_today": contracts_today,
            "contracts_yesterday": contracts_yesterday,
            "active_subscriptions": active_subscriptions,
            "mrr_inr": mrr_inr,
            "pdf_exports_today": pdf_exports_today,
            "report_date": today.isoformat(),
        }

    def _count_users(self) -> int:
        users = self.supabase.auth.admin.list_users()
        return len(users) if users else 0

    def _count_items_on_date(self, d) -> int:
        # contracts table not yet created — Sprint Day 3
        return 0

    def _subscription_metrics(self) -> tuple[int, float]:
        result = (
            self.supabase.table("subscriptions")
            .select("*")
            .eq("active", True)
            .execute()
        )
        rows = result.data or []
        active_count = len(rows)
        monthly_count = sum(1 for r in rows if r.get("plan") == "monthly")
        mrr_inr = monthly_count * _MONTHLY_PLAN_PRICE_INR
        return active_count, mrr_inr

    async def _log_run(self, result: dict, duration_ms: int) -> None:
        if self.supabase is None:
            return
        try:
            self.supabase.table("agent_logs").insert({
                "agent_name": self.agent_name,
                "status": result.get("status", "error"),
                "summary": result.get("summary"),
                "error_message": result.get("error_message"),
                "duration_ms": duration_ms,
            }).execute()
        except Exception as exc:
            logger.error("agent_logs insert failed: %s", exc)
