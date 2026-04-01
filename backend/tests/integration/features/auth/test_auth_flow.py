from __future__ import annotations

from fastapi import status


def test_auth_flow_login_me_logout(client) -> None:
    """login -> me -> logout の認証フローが正常に動作すること."""

    login_payload = {
        "email": "applicant@example.com",
        "password": "password",
    }

    login_response = client.post("/auth/login", json=login_payload)
    assert login_response.status_code == status.HTTP_200_OK

    login_body = login_response.json()
    assert login_body["token_type"] == "bearer"
    assert login_body["user"]["email"] == "applicant@example.com"

    me_response = client.get("/auth/me")
    assert me_response.status_code == status.HTTP_200_OK

    me_body = me_response.json()
    assert me_body["email"] == "applicant@example.com"
    assert "role_name" in me_body

    csrf_token = client.cookies.get("csrf_token")
    assert csrf_token is not None

    logout_response = client.post(
        "/auth/logout",
        headers={"X-CSRF-Token": csrf_token},
    )
    assert logout_response.status_code == status.HTTP_200_OK
    assert logout_response.json() == {"message": "logged out"}

    me_after_logout_response = client.get("/auth/me")
    assert me_after_logout_response.status_code == status.HTTP_401_UNAUTHORIZED
    assert me_after_logout_response.json() == {"detail": "Not authenticated"}


def test_login_returns_401_when_email_does_not_exist(client) -> None:
    """存在しないメールアドレスの場合は 401 を返すこと."""

    payload = {
        "email": "notfound@example.com",
        "password": "password123",
    }

    response = client.post("/auth/login", json=payload)

    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert response.json() == {
        "detail": "メールアドレスまたはパスワードが不正です",
    }


def test_login_returns_401_when_password_is_invalid(client) -> None:
    """誤ったパスワードの場合は 401 を返すこと."""

    payload = {
        "email": "test@example.com",
        "password": "wrong-password",
    }

    response = client.post("/auth/login", json=payload)

    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert response.json() == {
        "detail": "メールアドレスまたはパスワードが不正です",
    }


def test_me_returns_401_when_not_authenticated(client) -> None:
    """未ログイン状態で /auth/me にアクセスした場合は 401 を返すこと."""

    response = client.get("/auth/me")

    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert response.json() == {
        "detail": "Not authenticated",
    }


def test_me_returns_401_after_logout(client) -> None:
    """logout 後は /auth/me が 401 を返すこと."""

    login_payload = {
        "email": "applicant@example.com",
        "password": "password",
    }

    login_response = client.post("/auth/login", json=login_payload)
    assert login_response.status_code == status.HTTP_200_OK

    csrf_token = client.cookies.get("csrf_token")
    assert csrf_token is not None

    logout_response = client.post(
        "/auth/logout",
        headers={"X-CSRF-Token": csrf_token},
    )
    assert logout_response.status_code == status.HTTP_200_OK

    me_response = client.get("/auth/me")
    assert me_response.status_code == status.HTTP_401_UNAUTHORIZED
    assert me_response.json() == {
        "detail": "Not authenticated",
    }
