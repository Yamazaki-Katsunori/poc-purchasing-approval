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
    assert len(body["items"]) == 10
    assert body["pagination"]["page"] == 1
    assert body["pagination"]["per_page"] == 10
    assert body["pagination"]["total"] == 12
    assert body["pagination"]["total_pages"] == 2
    assert body["pagination"]["has_prev"] is False
    assert body["pagination"]["has_next"] is True
