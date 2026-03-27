from fastapi import APIRouter

from src.features.purchasing_approvals.confirm.schemas import ConfirmApprovalRequest, ConfirmApprovalResponse

router = APIRouter(prefix="/approvals", tags=["approvals", "new"])


@router.post("/new", response_model=ConfirmApprovalResponse)
def new_approvals(request: ConfirmApprovalRequest):
    """新規申請フォームで入力されたRequestを検証し、結果を返す"""

    print(f"request_data: {request}")

    return ConfirmApprovalResponse(
        title=request.title, purchase_type=request.purchase_type, amount=request.amount, reason=request.reason
    )


@router.get("draft")
def get_draft_approvals():
    """Draft Approval の取得"""
    pass
