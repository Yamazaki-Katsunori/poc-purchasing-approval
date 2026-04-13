from fastapi import HTTPException
from starlette.status import HTTP_404_NOT_FOUND
from wireup import injectable

from src.features.purchasing_approvals.detail.interfaces import IApprovalDetailRepository
from src.features.purchasing_approvals.detail.schemas import (
    ApprovalDetailResponse,
)


@injectable(lifetime="scoped")
class ApprovalDetailService:
    def __init__(self, repository: IApprovalDetailRepository):
        self.repository = repository

    def execute(self, approval_id: int) -> ApprovalDetailResponse:
        approval = self.repository.find_by_id(approval_id)

        if approval is None:
            raise HTTPException(status_code=HTTP_404_NOT_FOUND, detail="対象の申請データが見つかりませんでした。")

        print(f"approval.id: {approval.id}")
        print(f"approval.current_status: {vars(approval.current_status)}")
        print(f"approval.current_event: {vars(approval.current_event)}")

        return ApprovalDetailResponse.model_validate(approval)
