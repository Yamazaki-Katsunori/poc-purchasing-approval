from wireup import injectable

from src.features.purchasing_approvals.list.interfaces import IApprovalListRepository
from src.features.purchasing_approvals.list.schemas import ApprovalListItemResponse, ApprovalListResponse
from src.models.purchasing_approval import PurchasingApproval


@injectable(lifetime="scoped")
class PurchasingApprovalListService:
    """申請一覧リスト取得サービスクラス"""

    def __init__(self, repository: IApprovalListRepository) -> None:
        self.repository = repository

    def execute(self) -> ApprovalListResponse:
        approvals = self.repository.get_approval_list()

        items = [self._to_item_response(approval) for approval in approvals]

        return ApprovalListResponse(items=items)

    def _to_item_response(self, approval: PurchasingApproval) -> ApprovalListItemResponse:
        return ApprovalListItemResponse(
            id=approval.id,
            title=approval.title,
            approval_user=approval.user.name,
            approval_status=approval.current_status.name,
            requested_at=approval.requested_at,
            created_at=approval.created_at,
            approved_at=approval.approved_at,
        )
