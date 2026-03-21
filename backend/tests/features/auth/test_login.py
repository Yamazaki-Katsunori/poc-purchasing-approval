from __future__ import annotations

from types import SimpleNamespace

import pytest
from fastapi import HTTPException, status
from fastapi.testclient import TestClient

from src.features.auth.service import AuthService


def _mock_login_user_success(
    _self: AuthService,
    _email: str,
    _password: str,
) -> tuple[str, SimpleNamespace]:
    """ログイン成功用のモック."""

    user = SimpleNamespace(
        id=1,
        name="Test User",
        email="test@example.com",
    )
    access_token = "dummy-access-token"
    return access_token, user


def _mock_login_user_unauthorized(
    _self: AuthService,
    _email: str,
    _password: str,
) -> tuple[str, SimpleNamespace]:
    """ログイン失敗用のモック."""

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid email or password",
    )


def test_login_success(client: TestClient, monkeypatch: pytest.MonkeyPatch) -> None:
    """正しい認証情報でログイン成功すること"""

    monkeypatch.setattr(AuthService, "login_user", _mock_login_user_success)

    payload = {
        "email": "test@example.com",
        "password": "password",
    }

    response = client.post("/auth/login", json=payload)

    assert response.status_code == status.HTTP_200_OK

    assert response.json() == {
        "token_type": "bearer",
        "user": {
            "id": 1,
            "name": "Test User",
            "email": "test@example.com",
        },
    }

    set_cookie = response.headers.get("set-cookie")
    assert set_cookie is not None
    assert "access_token=dummy-access-token" in set_cookie
    assert "HttpOnly" in set_cookie


def test_login_failed_when_service_raises_unauthorized(client: TestClient, monkeypatch: pytest.MonkeyPatch) -> None:
    """認証失敗時に 401 を返すこと"""

    monkeypatch.setattr(AuthService, "login_user", _mock_login_user_unauthorized)

    payload = {"email": "test@example.com", "password": "wrong-password"}

    response = client.post("/auth/login", json=payload)

    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert response.json() == {"detail": "Invalid email or password"}
