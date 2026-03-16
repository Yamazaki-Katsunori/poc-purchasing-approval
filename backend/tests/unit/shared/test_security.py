# tests/unit/shared/test_security.py
from __future__ import annotations

import pytest
from fastapi import HTTPException, status

from src.shared.security import (
    create_access_token,
    decode_access_token,
    get_password_hash,
    verify_password,
)


def test_get_password_hash_returns_hashed_value() -> None:
    """get_password_hash が平文と異なるハッシュ文字列を返すこと."""

    plain_password = "password123"

    hashed_password = get_password_hash(plain_password)

    assert isinstance(hashed_password, str)
    assert hashed_password != plain_password
    assert len(hashed_password) > 0


def test_verify_password_returns_true_when_password_matches() -> None:
    """verify_password は正しい平文パスワードで True を返すこと."""

    plain_password = "password123"
    hashed_password = get_password_hash(plain_password)

    result = verify_password(plain_password, hashed_password)

    assert result is True


def test_verify_password_returns_false_when_password_does_not_match() -> None:
    """verify_password は誤った平文パスワードで False を返すこと."""

    plain_password = "password123"
    wrong_password = "wrong-password"
    hashed_password = get_password_hash(plain_password)

    result = verify_password(wrong_password, hashed_password)

    assert result is False


def test_create_access_token_returns_token_string() -> None:
    """create_access_token が JWT 文字列を返すこと."""

    subject = "test@example.com"

    access_token = create_access_token(subject)

    assert isinstance(access_token, str)
    assert len(access_token) > 0


def test_decode_access_token_returns_payload() -> None:
    """decode_access_token が payload を返し sub を取得できること."""

    subject = "test@example.com"
    access_token = create_access_token(subject)

    payload = decode_access_token(access_token)

    assert isinstance(payload, dict)
    assert payload["sub"] == subject
    assert "exp" in payload


def test_decode_access_token_raises_http_exception_when_token_is_invalid() -> None:
    """不正な token の場合は HTTPException(401) を送出すること."""

    invalid_token = "invalid-token"

    with pytest.raises(HTTPException) as exc_info:
        decode_access_token(invalid_token)

    assert exc_info.value.status_code == status.HTTP_401_UNAUTHORIZED
    assert exc_info.value.detail == "Invalid token"
