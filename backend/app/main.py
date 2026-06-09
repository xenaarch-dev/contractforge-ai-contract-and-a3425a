from __future__ import annotations

import logging
from contextlib import asynccontextmanager
from datetime import datetime

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .routers import billing, contracts, health, items
from .sentry import init_sentry

logging.basicConfig(level=settings.log_level)
init_sentry()


@asynccontextmanager
async def lifespan(app: FastAPI):
    if settings.supabase_url and settings.supabase_service_role_key:
        from supabase import create_client
        app.state.supabase = create_client(
            settings.supabase_url,
            settings.supabase_service_role_key,
        )
    else:
        app.state.supabase = None
    yield


app = FastAPI(
    title="ContractForge API",
    version="0.2.0",
    docs_url="/api/docs",
    redoc_url=None,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root() -> dict:
    return {"app": "ContractForge API", "version": "0.2.0", "status": "running"}


@app.get("/healthz")
def healthz() -> dict:
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}


app.include_router(health.router)
app.include_router(billing.router)          # /webhooks/lemon-squeezy (no prefix)
app.include_router(contracts.router)        # /contracts/...
app.include_router(items.router, prefix="/api")
