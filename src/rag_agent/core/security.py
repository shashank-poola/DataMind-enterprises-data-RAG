from datetime import datetime, timedelta, timezone

import bcrypt
from jose import JWTError, jwt

from rag_agent.core.config import settings

_ALGORITHM = "HS256"
_TOKEN_EXPIRE_DAYS = 30


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode(), hashed.encode())


def create_access_token(user_id: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(days=_TOKEN_EXPIRE_DAYS)
    return jwt.encode(
        {"sub": user_id, "exp": expire},
        settings.secret_key,
        algorithm=_ALGORITHM,
    )


def decode_token(token: str) -> str:
    payload = jwt.decode(token, settings.secret_key, algorithms=[_ALGORITHM])
    return payload["sub"]
