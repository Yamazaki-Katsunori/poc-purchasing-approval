from wireup import injectable

from src.features.purchasing_approvals.list.interfaces import IApprovalListRepository
from src.features.purchasing_approvals.list.schemas import ApprovalListItemResponse, ApprovalListResponse


@injectable(lifetime="scoped")
class PurchasingApprovalListService:
    """申請一覧リスト取得サービスクラス"""

    def __init__(self, repository: IApprovalListRepository) -> None:
        self.repository = repository

    def execute(self) -> ApprovalListResponse:
        approvals = self.repository.get_approval_list()

        items = [ApprovalListItemResponse.model_validate(approval) for approval in approvals]
        print(f"{items}")
        return ApprovalListResponse(items=items)
