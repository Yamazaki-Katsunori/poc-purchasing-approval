from fastapi import APIRouter

from src.features.purchasing_approvals.confirm.schemas import ConfirmApprovalRequest, ConfirmApprovalResponse

router = APIRouter(prefix="/approvals", tags=["approvals", "new", "confirm"])


@router.post("/confirm", response_model=ConfirmApprovalResponse)
def confirm_approvals(request: ConfirmApprovalRequest):
    """新規申請確認画面から送信されたRequestを検証し、申請を新規作成する"""

    print(f"request_data: {request}")

    return ConfirmApprovalResponse(
        title=request.title, purchase_type=request.purchase_type, amount=request.amount, reason=request.reason
    )
