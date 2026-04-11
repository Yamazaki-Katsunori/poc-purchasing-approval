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

    print(f"items_Len: {len(items)}")
    print(f"total: {total}")
    print(f"items[0].title:  {items[0].title}")
    print(f"items[1].title: {items[1].title}")

    assert len(items) == 10
    assert total == 12
    assert items[0].title == "一覧確認用申請 12"
    assert items[1].title == "一覧確認用申請 11"


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

    assert len(items) == 2
    assert total == 12
    assert items[0].title == "一覧確認用申請 2"
    assert items[1].title == "一覧確認用申請 1"
