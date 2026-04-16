from fastapi import APIRouter, Cookie, HTTPException, status
from starlette.status import HTTP_401_UNAUTHORIZED
from wireup import Injected

from src.features.purchasing_approvals.detail.schemas import (
    ApprovalDetailResponse,
    ApprovalReSubmitResponse,
    ApprovalReturnResponse,
    ApproveResponse,
)
from src.features.purchasing_approvals.detail.service import ApprovalDetailService
from src.shared.security import decode_access_token

router = APIRouter(prefix="/approvals", tags=["approvals", "detail"])


@router.get("/{approval_id}", response_model=ApprovalDetailResponse)
def get_approval_detail(
    approval_id: str,
    service: Injected[ApprovalDetailService],
    access_token: str | None = Cookie(default=None),
) -> ApprovalDetailResponse | None:
    """申請詳細画面のendpoint"""

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

    return service.execute(approval_id=int(approval_id))


@router.post("/{approval_id}/approve", response_model=ApproveResponse)
def approve(
    approval_id: int,
    service: Injected[ApprovalDetailService],
    access_token: str | None = Cookie(default=None),
) -> ApproveResponse:
    """申請詳細画面 承認ボタンのエンドポイント"""

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

    subject_approval = service.approve(approval_id=approval_id, user_id=user_id)

    return ApproveResponse.model_validate(subject_approval)


@router.post("/{approval_id}/return", response_model=ApprovalReturnResponse)
def approval_return(
    approval_id: int,
    service: Injected[ApprovalDetailService],
    access_token: str | None = Cookie(default=None),
) -> ApprovalReturnResponse:
    """申請詳細画面 差し戻しボタンのエンドポイント"""

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

    # NOTE: 差し戻し処理の作成
    # subject_approval = service

    return ApprovalReturnResponse(message="仮定義")


@router.post("/{approval_id}/resubmit", response_model=ApprovalReSubmitResponse)
def approval_re_submit(
    approval_id: int,
    service: Injected[ApprovalDetailService],
    access_token: str | None = Cookie(default=None),
) -> ApprovalReSubmitResponse:
    """申請詳細画面 編集後の再申請ボタンのエンドポイント"""
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

    return ApprovalReSubmitResponse(message="仮定義")
