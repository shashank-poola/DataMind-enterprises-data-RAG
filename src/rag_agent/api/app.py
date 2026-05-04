import traceback
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from rag_agent.core.config import settings
from rag_agent.core.logging import setup_logging
from rag_agent.db.database import create_tables


@asynccontextmanager
async def lifespan(app: FastAPI):
    setup_logging(settings.debug)
    create_tables()
    yield


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        lifespan=lifespan,
        debug=True,
        docs_url="/docs" if settings.app_env != "production" else None,
        redoc_url=None,
    )

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception):
        tb = traceback.format_exc()
        return JSONResponse(status_code=500, content={"detail": str(exc), "traceback": tb})

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    from rag_agent.api.routes.analytics import router as analytics_router
    from rag_agent.api.routes.auth import router as auth_router
    from rag_agent.api.routes.documents import router as documents_router
    from rag_agent.api.routes.query import router as query_router

    app.include_router(auth_router, prefix="/api/v1")
    app.include_router(documents_router, prefix="/api/v1")
    app.include_router(query_router, prefix="/api/v1")
    app.include_router(analytics_router, prefix="/api/v1")

    @app.get("/health", tags=["ops"])
    def health():
        return {"status": "ok", "version": settings.app_version, "env": settings.app_env}

    return app
