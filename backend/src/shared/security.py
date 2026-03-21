import os
from datetime import UTC, datetime, timedelta
from typing import Final, cast

from fastapi import Cookie, Header, HTTPException, status
from jose import JWTError, jwt
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

SECRET_KEY: Final[str] = os.getenv("JWT_SECRET_KEY", "your-secret-key")
ALGORITHM: Final[str] = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES: Final[int] = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRE_MINUTES", "60"))


def get_password_hash(password: str) -> str:
    """ハッシュ化したパスワードを取得する

    Args:
       password: 平文パスワード

    Returns:
       str: ハッシュ化したパスワード
    """
    return cast(str, pwd_context.hash(password))


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """平文パスワードを元にハッシュ化したパスワードを検証

    Args:
       plain_password: 平文パスワード
       hashed_password: ハッシュ済みパスワード

    Returns:
       bool: 検証結果
    """
    return cast(bool, pwd_context.verify(plain_password, hashed_password))


def create_access_token(subject: str) -> str:
    """JWTアクセストークン発行処理

    Args:
       subject: アクセストークンに含める件名

    Returns:
       str: アクセストークン
    """
    expire = datetime.now(UTC) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {
        "sub": subject,
        "exp": int(expire.timestamp()),
    }
    return cast(str, jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM))


def decode_access_token(access_token: str) -> dict:
    """発行したJWTアクセストークンのデコード処理

    Args:
       access_token: 発行したJWTアクセストークン
       SECRET_KEY: JWTのシークレットキー
       algorithm: JWTの署名アルゴリズム

    Returns:
       dict: デコードした情報

    Raises:
       HTTPException: 無効なトークンの場合 (HTTP_401_UNAUTHORIZED)
    """
    try:
        payload = jwt.decode(access_token, SECRET_KEY, algorithms=[ALGORITHM])
        return cast("dict", payload)
    except JWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        ) from exc


def verify_csrf(
    csrf_cookie: str | None = Cookie(default=None, alias="csrf_token"),
    csrf_header: str | None = Header(default=None, alias="X-CSRF-Token"),
) -> None:
    """CSRFトークンの検証処理

    Args:
       csrf_cookie: 送られてきたCSRFトークン
       csrf_header: 送られてきたCSRFトークン

    Returns:
       None: 検証で問題なければNone

    Raises:
       HTTPException: 検証で問題が起きれば HTTP_403_FORBIDDEN
    """
    if not csrf_cookie or not csrf_header or csrf_cookie != csrf_header:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="CSRF validation failed")
