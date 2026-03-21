from fastapi import status
from fastapi.testclient import TestClient


def test_logout_success(client: TestClient) -> None:
    """CSRF トークン付きのログアウトが成功すること"""

    login_payload = {
        "email": "applicant@example.com",
        "password": "password",
    }

    login_response = client.post("auth/login", json=login_payload)
    assert login_response.status_code == status.HTTP_200_OK

    csrf_token = client.cookies.get("csrf_token")
    assert csrf_token is not None

    response = client.post("/auth/logout", headers={"X-CSRF-Token": csrf_token})

    assert response.status_code == status.HTTP_200_OK
    assert response.json() == {"message": "logged out"}

    set_cookie = response.headers.get("set-cookie")
    assert set_cookie is not None
    assert "access_token=" in set_cookie
    assert "Max-Age=0" in set_cookie or "expires=" in set_cookie.lower()
