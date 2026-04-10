import math
from datetime import UTC, datetime

from src.features.purchasing_approvals.list.interfaces import IApprovalListRepository
from src.features.purchasing_approvals.list.schemas import ApprovalListQueryParams
from src.features.purchasing_approvals.list.service import PurchasingApprovalListService


class StubUser:
    def __init__(self, name: str) -> None:
        self.name = name


class StubStatus:
    def __init__(self, name: str) -> None:
        self.name = name


class StubApproval:
    def __init__(
        self,
        *,
        id: int,
        title: str,
        approval_user: str,
        approval_status: str,
        requested_at: datetime | None,
        created_at: datetime,
        approved_at: datetime | None,
    ) -> None:
        self.id = id
        self.title = title
        self.user = StubUser(approval_user)
        self.current_status = StubStatus(approval_status)
        self.requested_at = requested_at
        self.created_at = created_at
        self.approved_at = approved_at


class StubApprovalListRepository(IApprovalListRepository):
    def __init__(self) -> None:
        self.find_all_args: tuple[int, int] | None = None

    def get_approval_list(self, offset: int, limit: int):
        self.find_all_args = (offset, limit)
        now = datetime.now(UTC)
        return [
            StubApproval(
                id=1,
                title="申請A",
                approval_user="山田 太郎",
                approval_status="申請中",
                requested_at=now,
                created_at=now,
                approved_at=None,
            ),
            StubApproval(
                id=2,
                title="申請B",
                approval_user="佐藤 花子",
                approval_status="承認済み",
                requested_at=now,
                created_at=now,
                approved_at=now,
            ),
        ]

    def approval_list_count_all(self) -> int:
        return 12


def test_execute_returns_paginated_response() -> None:
    """正常系: 申請一覧を取得するServiceクラス処理"""
    repository = StubApprovalListRepository()
    service = PurchasingApprovalListService(repository)

    params = ApprovalListQueryParams(page=1, per_page=10)
    result = service.execute(query_params=params)

    assert repository.find_all_args == (0, 10)

    assert len(result.items) == 2
    assert result.items[0].title == "申請A"
    assert result.items[0].approval_user == "山田 太郎"
    assert result.items[0].approval_status == "申請中"

    assert result.pagination.page == 1
    assert result.pagination.per_page == 10
    assert result.pagination.total == 12
    assert result.pagination.total_pages == math.ceil(12 / 10)
    assert result.pagination.has_prev is False
    assert result.pagination.has_next is True


def test_execute_second_page_returns_correct_pagination() -> None:
    """正常系: pagination２ページ目の正常取得処理"""

    repository = StubApprovalListRepository()
    service = PurchasingApprovalListService(repository)

    params = ApprovalListQueryParams(page=2, per_page=10)
    result = service.execute(query_params=params)

    assert repository.find_all_args == (10, 10)
    assert result.pagination.page == 2
    assert result.pagination.has_prev is True
    assert result.pagination.has_next is False
