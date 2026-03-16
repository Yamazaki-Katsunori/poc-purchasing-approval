from fastapi import status
from fastapi.testclient import TestClient


def test_logout_success(client: TestClient) -> None:
    """ログアウト時に cookie 削除レスポンスを返すこと."""

    response = client.post("/auth/logout")

    assert response.status_code == status.HTTP_200_OK
    assert response.json() == {"message": "logged out"}

    set_cookie = response.headers.get("set-cookie")
    assert set_cookie is not None
    assert "access_token=" in set_cookie
    assert "Max-Age=0" in set_cookie or "expires=" in set_cookie.lower()
