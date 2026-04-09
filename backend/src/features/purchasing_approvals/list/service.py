import math

from wireup import injectable

from src.features.purchasing_approvals.list.interfaces import IApprovalListRepository
from src.features.purchasing_approvals.list.schemas import (
    ApprovalListItemResponse,
    ApprovalListQueryParams,
    ApprovalListResponse,
    PaginationResponse,
)
from src.models.purchasing_approval import PurchasingApproval


@injectable(lifetime="scoped")
class PurchasingApprovalListService:
    """申請一覧リスト取得サービスクラス"""

    def __init__(self, repository: IApprovalListRepository) -> None:
        self.repository = repository

    def execute(self, query_params: ApprovalListQueryParams) -> ApprovalListResponse:

        offset = (query_params.page - 1) * query_params.per_page

        approvals = self.repository.get_approval_list(offset=offset, limit=query_params.per_page)
        approvals_total = self.repository.approval_list_count_all()

        total_pages = math.ceil(approvals_total / query_params.per_page) if approvals_total > 0 else 0

        items = [self._to_item_response(approval) for approval in approvals]

        return self._add_pagination_response(items, query_params, approvals_total, total_pages)

    def _to_item_response(self, approval: PurchasingApproval) -> ApprovalListItemResponse:
        """申請一覧を取得し、レスポンスデータとしてまとめる処理"""
        return ApprovalListItemResponse(
            id=approval.id,
            title=approval.title,
            approval_user=approval.user.name,
            approval_status=approval.current_status.name,
            requested_at=approval.requested_at,
            created_at=approval.created_at,
            approved_at=approval.approved_at,
        )

    def _add_pagination_response(
        self, items: list[ApprovalListItemResponse], query_params: ApprovalListQueryParams, total: int, total_pages: int
    ) -> ApprovalListResponse:
        """ページネーション情報を追加したApprovalListResponseデータにする処理"""
        return ApprovalListResponse(
            items=items,
            pagination=PaginationResponse(
                page=query_params.page,
                per_page=query_params.per_page,
                total=total,
                total_pages=total_pages,
                has_prev=query_params.page > 1,
                has_next=query_params.page < total_pages,
            ),
        )
