from fastapi import APIRouter, Depends
from wireup import Injected

from src.features.purchasing_approvals.list.schemas import ApprovalListQueryParams, ApprovalListResponse
from src.features.purchasing_approvals.list.service import PurchasingApprovalListService

router = APIRouter(tags=["approvals", "list"])


@router.get("/approvals", response_model=ApprovalListResponse)
def get_approval_list(
    service: Injected[PurchasingApprovalListService], params: ApprovalListQueryParams = Depends()
) -> ApprovalListResponse:

    return service.execute(query_params=params)
