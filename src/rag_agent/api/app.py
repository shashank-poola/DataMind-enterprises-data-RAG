from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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
        docs_url="/docs" if settings.app_env != "production" else None,
        redoc_url=None,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    from rag_agent.api.routes.documents import router as documents_router
    from rag_agent.api.routes.query import router as query_router

    app.include_router(documents_router, prefix="/api/v1")
    app.include_router(query_router, prefix="/api/v1")

    @app.get("/health", tags=["ops"])
    def health():
        return {"status": "ok", "version": settings.app_version, "env": settings.app_env}

    return app
