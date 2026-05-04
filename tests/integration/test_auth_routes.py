"""Integration tests for /api/v1/auth/* endpoints."""
import pytest

from rag_agent.core.security import hash_password
from rag_agent.db.repository import UserRepository


class TestRegister:
    def test_register_success(self, client):
        response = client.post("/api/v1/auth/register", json={
            "email": "newuser@example.com",
            "name": "New User",
            "password": "strongpassword",
        })
        assert response.status_code == 201
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert data["email"] == "newuser@example.com"
        assert data["name"] == "New User"
        assert "user_id" in data

    def test_register_duplicate_email(self, client, db):
        UserRepository(db).create(
            email="existing@example.com",
            name="Existing",
            hashed_password=hash_password("pass"),
        )
        response = client.post("/api/v1/auth/register", json={
            "email": "existing@example.com",
            "name": "Another",
            "password": "pass",
        })
        assert response.status_code == 400
        assert "already registered" in response.json()["detail"]

    def test_register_normalises_email_to_lowercase(self, client, db):
        response = client.post("/api/v1/auth/register", json={
            "email": "UPPER@EXAMPLE.COM",
            "name": "Upper",
            "password": "pass",
        })
        assert response.status_code == 201
        assert response.json()["email"] == "upper@example.com"


class TestLogin:
    def test_login_success(self, client, db):
        UserRepository(db).create(
            email="login@example.com",
            name="Login User",
            hashed_password=hash_password("mypassword"),
        )
        response = client.post("/api/v1/auth/login", json={
            "email": "login@example.com",
            "password": "mypassword",
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"

    def test_login_wrong_password(self, client, db):
        UserRepository(db).create(
            email="user@example.com",
            name="User",
            hashed_password=hash_password("correct"),
        )
        response = client.post("/api/v1/auth/login", json={
            "email": "user@example.com",
            "password": "wrong",
        })
        assert response.status_code == 401

    def test_login_unknown_email(self, client):
        response = client.post("/api/v1/auth/login", json={
            "email": "nobody@example.com",
            "password": "anypass",
        })
        assert response.status_code == 401

    def test_login_case_insensitive_email(self, client, db):
        UserRepository(db).create(
            email="case@example.com",
            name="Case",
            hashed_password=hash_password("pass"),
        )
        response = client.post("/api/v1/auth/login", json={
            "email": "CASE@EXAMPLE.COM",
            "password": "pass",
        })
        assert response.status_code == 200


class TestMe:
    def test_me_returns_user_info(self, client, auth_headers, test_user):
        response = client.get("/api/v1/auth/me", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == test_user.email
        assert data["name"] == test_user.name
        assert data["id"] == test_user.id

    def test_me_without_token_returns_403(self, client):
        response = client.get("/api/v1/auth/me")
        assert response.status_code in (401, 403)

    def test_me_with_invalid_token_returns_401(self, client):
        response = client.get("/api/v1/auth/me", headers={"Authorization": "Bearer invalid.token.here"})
        assert response.status_code == 401
