"""
Shared fixtures for the entire test suite.

Env vars are set here BEFORE any app imports so that pydantic_settings
reads them correctly at import time.
"""
import os

os.environ.update({
    "GROQ_API_KEY": "test-groq-key",
    "GEMINI_API_KEY": "test-gemini-key",
    "COHERE_API_KEY": "test-cohere-key",
    "CHROMA_API_KEY": "test-chroma-key",
    "CHROMA_TENANT": "test-tenant",
    "CHROMA_DATABASE": "test-database",
    "CHROMA_COLLECTION": "test-collection",
    "SECRET_KEY": "test-secret-key-must-be-long-enough-32c",
    "DATABASE_URL": "sqlite:///./test_rag_agent.db",
    "APP_ENV": "test",
})

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

_TEST_DB_URL = "sqlite:///./test_rag_agent.db"
_engine = create_engine(_TEST_DB_URL, connect_args={"check_same_thread": False})
_Session = sessionmaker(autocommit=False, autoflush=False, bind=_engine)


@pytest.fixture(scope="session", autouse=True)
def _create_tables():
    from rag_agent.db.database import Base
    import rag_agent.db.models  # noqa: F401 — registers ORM models with Base
    Base.metadata.create_all(bind=_engine)
    yield
    Base.metadata.drop_all(bind=_engine)
    _engine.dispose()
    try:
        if os.path.exists("test_rag_agent.db"):
            os.remove("test_rag_agent.db")
    except PermissionError:
        pass  # Windows may still hold the file handle; safe to leave


@pytest.fixture()
def db():
    """Transactional test DB session — rolls back after each test."""
    connection = _engine.connect()
    transaction = connection.begin()
    session = _Session(bind=connection)
    yield session
    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture()
def app(db):
    from rag_agent.api.app import create_app
    from rag_agent.db.database import get_db

    _app = create_app()

    def _override_db():
        yield db

    _app.dependency_overrides[get_db] = _override_db
    return _app


@pytest.fixture()
def client(app):
    with TestClient(app, raise_server_exceptions=True) as c:
        yield c


@pytest.fixture()
def test_user(db):
    from rag_agent.db.repository import UserRepository
    from rag_agent.core.security import hash_password

    return UserRepository(db).create(
        email="test@example.com",
        name="Test User",
        hashed_password=hash_password("password123"),
    )


@pytest.fixture()
def auth_headers(test_user):
    from rag_agent.core.security import create_access_token

    token = create_access_token(test_user.id)
    return {"Authorization": f"Bearer {token}"}
