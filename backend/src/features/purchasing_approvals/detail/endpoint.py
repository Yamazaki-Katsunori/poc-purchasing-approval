from fastapi import APIRouter
from wireup import Injected

from src.features.purchasing_approvals.detail.schemas import ApprovalDetailResponse
from src.features.purchasing_approvals.detail.service import ApprovalDetailService

router = APIRouter(prefix="/approvals", tags=["approvals", "detail"])


@router.get("/{approval_id}", response_model=ApprovalDetailResponse)
def get_approval_detail(approval_id: str, service: Injected[ApprovalDetailService]) -> ApprovalDetailResponse | None:
    """申請詳細画面のendpoint"""
    return service.execute(approval_id=int(approval_id))
