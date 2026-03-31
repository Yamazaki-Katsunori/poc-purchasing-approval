from fastapi import APIRouter, Cookie, HTTPException, status
from starlette.status import HTTP_401_UNAUTHORIZED, HTTP_500_INTERNAL_SERVER_ERROR
from wireup import Injected

from src.features.purchasing_approvals.confirm.schemas import ConfirmApprovalRequest, ConfirmApprovalResponse
from src.features.purchasing_approvals.confirm.service import CreateApprovalService
from src.shared.security import decode_access_token

router = APIRouter(prefix="/approvals", tags=["approvals", "new", "confirm"])


@router.post("/confirm", response_model=ConfirmApprovalResponse)
def confirm_approvals(
    request: ConfirmApprovalRequest,
    confirm_service: Injected[CreateApprovalService],
    access_token: str | None = Cookie(default=None),
) -> ConfirmApprovalResponse:
    """新規申請確認画面から送信されたRequestを検証し、申請を新規作成する"""

    if access_token is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")

    # access_tokenを用いて認証ユーザーIDを取得
    payload = decode_access_token(access_token)

    if payload is None:
        raise HTTPException(status_code=HTTP_401_UNAUTHORIZED, detail="Invalid token")

    sub = payload.get("sub")
    if not isinstance(sub, str):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )
    user_id = int(sub)

    # db transaction block
    try:
        approval = confirm_service.create_approval_action(user_id=user_id, data=request)
        return ConfirmApprovalResponse.model_validate(approval)

    except ValueError as exc:
        print("unexpected error:", repr(exc))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(exc),
        ) from exc

    except Exception as exc:
        print("unexpected error:", repr(exc))
        raise HTTPException(
            status_code=HTTP_500_INTERNAL_SERVER_ERROR,
            detail="申請の作成に失敗しました",
        ) from exc
