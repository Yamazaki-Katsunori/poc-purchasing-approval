from src.features.purchasing_approvals.list.repository import ApprovalListRepository


def test_find_all_returns_first_page_data(
    db_session,
    seed_user,
    submitted_status,
    create_approvals,
):
    """正常系: 申請一覧で1ページ目のデータが正常に取得できる"""
    create_approvals(
        user=seed_user,
        status=submitted_status,
        count=12,
    )

    repository = ApprovalListRepository(db_session)

    items = repository.get_approval_list(offset=0, limit=10)
    total = repository.approval_list_count_all()
    actual_titles = [item.title for item in items]
    expected_titles = [f"一覧確認用申請 {i}" for i in range(12, 2, -1)]

    assert len(items) == 10
    assert total == 12
    assert actual_titles == expected_titles


def test_find_all_returns_second_page_data(
    db_session,
    seed_user,
    submitted_status,
    create_approvals,
):
    """正常系: 申請一覧で2ページ目のデータが正常に取得できる"""
    create_approvals(
        user=seed_user,
        status=submitted_status,
        count=12,
    )

    repository = ApprovalListRepository(db_session)

    items = repository.get_approval_list(offset=10, limit=10)
    total = repository.approval_list_count_all()
    actual_titles = [item.title for item in items]
    expected_titles = [f"一覧確認用申請 {i}" for i in range(2, 0, -1)]

    assert len(items) == 2
    assert total == 12
    assert actual_titles == expected_titles
