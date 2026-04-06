from fastapi import APIRouter
from wireup import Injected

from src.features.purchasing_approvals.list.schemas import ApprovalListResponse
from src.features.purchasing_approvals.list.service import PurchasingApprovalListService

router = APIRouter(tags=["approvals", "list"])


@router.get("/approvals", response_model=ApprovalListResponse)
def get_approval_list(service: Injected[PurchasingApprovalListService]) -> ApprovalListResponse:
    print("エンドポイント到達確認")

    return service.execute()
