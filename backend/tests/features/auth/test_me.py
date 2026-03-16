from types import SimpleNamespace

import pytest
from fastapi import status
from fastapi.testclient import TestClient

from src.features.auth.service import AuthService


def _mock_get_me(_self: AuthService, access_token: str):
    """ログイン中のユーザーを返すAuchService.get_me処理のモック"""

    assert access_token == "dummy-access-token"

    position = SimpleNamespace(name="購買部 マネージャー")
    roles = [
        SimpleNamespace(name="approver"),
        SimpleNamespace(name="applicant"),
    ]

    user = SimpleNamespace(
        id=1,
        name="Test User",
        email="test@example.com",
        position=position,
        roles=roles,
    )
    return user


def test_me_returns_current_user_when_cookie_exists(
    client: TestClient,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """access_token cookie がある場合にログイン中ユーザーを返すこと."""

    monkeypatch.setattr(AuthService, "get_me", _mock_get_me)

    client.cookies.set("access_token", "dummy-access-token")

    response = client.get("/auth/me")

    assert response.status_code == status.HTTP_200_OK

    assert response.json() == {
        "id": 1,
        "name": "Test User",
        "email": "test@example.com",
        "position_name": "購買部 マネージャー",
        "role_name": "approver|applicant",
    }


def test_me_returns_401_when_cookie_does_not_exist(client: TestClient) -> None:
    """access_token cookie がない場合に 401 を返すこと."""

    response = client.get("/auth/me")

    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert response.json() == {"detail": "Not authenticated"}
