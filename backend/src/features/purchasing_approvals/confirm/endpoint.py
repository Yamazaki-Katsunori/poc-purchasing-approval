from fastapi import APIRouter

from src.features.purchasing_approvals.new.schemas import NewApprovalRequest, NewApprovalResponse

router = APIRouter(prefix="/approvals", tags=["approvals", "new", "confirm"])


@router.post("/confirm", response_model=NewApprovalResponse)
def confirm_approvals(request: NewApprovalRequest):
    """新規申請確認画面から送信されたRequestを検証し、申請を新規作成する"""

    print(f"request_data: {request}")

    return NewApprovalResponse(
        title=request.title, purchase_type=request.purchase_type, amount=request.amount, reason=request.reason
    )
