from fastapi import APIRouter

from src.features.purchasing_approvals.new.schemas import NewApprovalRequest, NewApprovalResponse


router = APIRouter(prefix='/approvals', tags=['approvals', 'new'])

@router.post("/new",response_model=NewApprovalResponse)
def new_approvals(request: NewApprovalRequest):
    """新規申請フォームで入力されたRequestを検証し、結果を返す"""

    print(f"request_data: {request}")

    return NewApprovalResponse(
        title=request.title,
        purchase_type=request.purchase_type,
        amount=request.amount,
        reason=request.reason
    )


@router.get("draft")
def get_draft_approvals():
    """Draft Approval の取得"""
    pass
