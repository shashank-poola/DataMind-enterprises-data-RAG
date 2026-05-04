"""Unit tests for JWT + password hashing in core/security.py."""
import pytest
from jose import JWTError

from rag_agent.core.security import (
    create_access_token,
    decode_token,
    hash_password,
    verify_password,
)


class TestPasswordHashing:
    def test_hash_is_not_plaintext(self):
        hashed = hash_password("secret")
        assert hashed != "secret"

    def test_hash_starts_with_bcrypt_prefix(self):
        hashed = hash_password("secret")
        assert hashed.startswith("$2b$")

    def test_same_password_produces_different_hashes(self):
        # bcrypt uses a random salt each time
        h1 = hash_password("secret")
        h2 = hash_password("secret")
        assert h1 != h2

    def test_verify_correct_password(self):
        hashed = hash_password("correct-password")
        assert verify_password("correct-password", hashed) is True

    def test_verify_wrong_password(self):
        hashed = hash_password("correct-password")
        assert verify_password("wrong-password", hashed) is False

    def test_verify_empty_string_fails(self):
        hashed = hash_password("password")
        assert verify_password("", hashed) is False


class TestJWT:
    def test_create_and_decode_token(self):
        user_id = "user-123"
        token = create_access_token(user_id)
        assert decode_token(token) == user_id

    def test_token_is_string(self):
        token = create_access_token("user-abc")
        assert isinstance(token, str)
        assert len(token) > 0

    def test_different_users_produce_different_tokens(self):
        t1 = create_access_token("user-1")
        t2 = create_access_token("user-2")
        assert t1 != t2

    def test_invalid_token_raises(self):
        with pytest.raises(JWTError):
            decode_token("this.is.not.a.valid.token")

    def test_tampered_token_raises(self):
        token = create_access_token("user-123")
        tampered = token[:-5] + "XXXXX"
        with pytest.raises(JWTError):
            decode_token(tampered)

    def test_empty_token_raises(self):
        with pytest.raises(JWTError):
            decode_token("")
