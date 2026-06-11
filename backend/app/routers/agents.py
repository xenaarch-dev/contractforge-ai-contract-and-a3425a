from __future__ import annotations

import logging

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import JSONResponse

from ..agents.metrics_agent import ContractForgeMetricsAgent
from ..config import settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/agents", tags=["agents"])


@router.post("/metrics/run")
async def run_metrics_agent(request: Request) -> JSONResponse:
    key = request.headers.get("X-Agent-Key", "")
    if not key or not settings.agent_trigger_key or key != settings.agent_trigger_key:
        raise HTTPException(status_code=401, detail="Unauthorized")

    supabase = request.app.state.supabase
    agent = ContractForgeMetricsAgent(supabase)
    result = await agent.run()
    return JSONResponse(result)


@router.get("/metrics/latest")
async def get_metrics_latest(request: Request) -> JSONResponse:
    supabase = request.app.state.supabase
    if supabase is None:
        raise HTTPException(status_code=404, detail="No runs yet")

    result = (
        supabase.table("agent_logs")
        .select("*")
        .eq("agent_name", "metrics")
        .order("run_at", desc=True)
        .limit(1)
        .execute()
    )

    if not result.data:
        raise HTTPException(status_code=404, detail="No runs yet")

    return JSONResponse(result.data[0])
