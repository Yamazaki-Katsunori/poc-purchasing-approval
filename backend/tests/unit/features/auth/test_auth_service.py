# tests/unit/features/auth/test_auth_service.py
from __future__ import annotations

from types import SimpleNamespace

import pytest
from fastapi import HTTPException, status

from src.features.auth.interfaces import IUserRepository
from src.features.auth.service import AuthService


class StubUserRepository(IUserRepository):
    """AuthService テスト用の簡易 repository."""

    def __init__(self, user_by_email=None, user_by_id=None) -> None:
        self._user_by_email = user_by_email
        self._user_by_id = user_by_id

    def find_by_email(self, _email: str):
        return self._user_by_email

    def find_by_id(self, _user_id: int):
        return self._user_by_id


def _make_user(
    user_id: int = 1,
    name: str = "Test User",
    email: str = "test@example.com",
    password_hash: str = "hashed-password",
):
    return SimpleNamespace(
        id=user_id,
        name=name,
        email=email,
        password_hash=password_hash,
    )


def test_login_user_returns_access_token_and_user_when_credentials_are_valid(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """認証成功時に access_token と user を返すこと."""

    user = _make_user()
    repository = StubUserRepository(user_by_email=user)
    service = AuthService(repository)

    monkeypatch.setattr("src.features.auth.service.verify_password", lambda _plain, _hashed: True)
    monkeypatch.setattr("src.features.auth.service.create_access_token", lambda subject: "dummy-token")

    access_token, result_user = service.login_user("test@example.com", "password123")

    assert access_token == "dummy-token"
    assert result_user == user


def test_login_user_raises_401_when_user_is_not_found() -> None:
    """email に一致する user が存在しない場合は 401 を送出すること."""

    repository = StubUserRepository(user_by_email=None)
    service = AuthService(repository)

    with pytest.raises(HTTPException) as exc_info:
        service.login_user("notfound@example.com", "password123")

    assert exc_info.value.status_code == status.HTTP_401_UNAUTHORIZED
    assert exc_info.value.detail == "メールアドレスまたはパスワードが不正です"


def test_login_user_raises_401_when_password_is_invalid(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """パスワード不一致の場合は 401 を送出すること."""

    user = _make_user()
    repository = StubUserRepository(user_by_email=user)
    service = AuthService(repository)

    monkeypatch.setattr("src.features.auth.service.verify_password", lambda _plain, _hashed: False)

    with pytest.raises(HTTPException) as exc_info:
        service.login_user("test@example.com", "wrong-password")

    assert exc_info.value.status_code == status.HTTP_401_UNAUTHORIZED
    assert exc_info.value.detail == "メールアドレスまたはパスワードが不正です"


def test_get_me_returns_user_when_access_token_is_valid(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """有効な access_token の場合は user を返すこと."""

    user = _make_user(user_id=1)
    repository = StubUserRepository(user_by_id=user)
    service = AuthService(repository)

    monkeypatch.setattr(
        "src.features.auth.service.decode_access_token",
        lambda _access_token: {"sub": "1"},
    )

    result = service.get_me("dummy-token")

    assert result == user


def test_get_me_raises_401_when_token_payload_does_not_have_sub(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """payload に sub がない場合は 401 を送出すること."""

    repository = StubUserRepository(user_by_id=None)
    service = AuthService(repository)

    monkeypatch.setattr(
        "src.features.auth.service.decode_access_token",
        lambda _access_token: {},
    )

    with pytest.raises(HTTPException) as exc_info:
        service.get_me("dummy-token")

    assert exc_info.value.status_code == status.HTTP_401_UNAUTHORIZED
    assert exc_info.value.detail == "Invalid token payload"


def test_get_me_raises_401_when_user_is_not_found(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """token の user_id に一致する user が存在しない場合は 401 を送出すること."""

    repository = StubUserRepository(user_by_id=None)
    service = AuthService(repository)

    monkeypatch.setattr(
        "src.features.auth.service.decode_access_token",
        lambda _access_token: {"sub": "1"},
    )

    with pytest.raises(HTTPException) as exc_info:
        service.get_me("dummy-token")

    assert exc_info.value.status_code == status.HTTP_401_UNAUTHORIZED
    assert exc_info.value.detail == "User not found"
