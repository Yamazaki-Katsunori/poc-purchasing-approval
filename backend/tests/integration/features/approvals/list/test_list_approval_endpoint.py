def test_get_approval_list_returns_paginated_response(
    authenticated_client,
    seed_user,
    submitted_status,
    create_approvals,
):
    """正常系: 申請一覧のendpoint test"""
    create_approvals(
        user=seed_user,
        status=submitted_status,
        count=12,
    )

    response = authenticated_client.get("/approvals?page=1&per_page=10")

    assert response.status_code == 200

    body = response.json()
    assert body["items"][0]["approval_user"] == seed_user.name
    assert body["items"][0]["approval_status"] == submitted_status.name

    assert body["pagination"] == {
        "page": 1,
        "per_page": 10,
        "total": 12,
        "total_pages": 2,
        "has_prev": False,
        "has_next": True,
    }

    assert [item["title"] for item in body["items"]] == [f"一覧確認用申請 {i}" for i in range(12, 2, -1)]


def test_get_approval_list_returns_zero_paginated_response(
    authenticated_client,
):
    """正常系: 申請一覧のendpoint test(0件取得時)"""

    response = authenticated_client.get("/approvals?page=1&per_page=10")

    assert response.status_code == 200

    body = response.json()
    assert body["items"] == []

    assert body["pagination"] == {
        "page": 1,
        "per_page": 10,
        "total": 0,
        "total_pages": 0,
        "has_prev": False,
        "has_next": False,
    }
