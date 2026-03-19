from secrets import token_urlsafe

from fastapi import APIRouter, Cookie, Depends, HTTPException, Response, status
from wireup import Injected

from src.features.auth.schemas import LoginRequest, LoginResponse, LoginUserResponse, LogoutResponse, MeResponse
from src.features.auth.service import AuthService
from src.shared.security import verify_csrf

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=LoginResponse)
def login(
    auth_service: Injected[AuthService],
    request: LoginRequest,
    response: Response,
) -> LoginResponse:
    """ログイン認証エンドポイント

    Args:
       auth_service: ログイン認証用のサービスクラス
       request: ログイン用リクエスト | email / password の受け取り
       response: cookie にアクセストークンをセットする用

    Returns:
       LoginResponse: ログイン結果のレスポンス
    """
    access_token, user = auth_service.login_user(request.email, request.password)

    csrf_token = token_urlsafe(32)

    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=False,  # 本番は True
        samesite="lax",
        path="/",
        max_age=60 * 60,
    )

    response.set_cookie(
        key="csrf_token",
        value=csrf_token,
        httponly=False,
        secure=False,
        samesite="lax",
        path="/",
    )

    return LoginResponse(
        token_type="bearer",
        user=LoginUserResponse(
            id=user.id,
            name=user.name,
            email=user.email,
        ),
    )


@router.post("/logout", response_model=LogoutResponse, dependencies=[Depends(verify_csrf)])
def logout(response: Response) -> LogoutResponse:
    """ログアウトエンドポイント

    Args:
       response: cokkie 削除用

    Returns:
        LoginResponse: ログアウト結果

    """

    response.delete_cookie(
        key="access_token",
        path="/",
    )

    response.delete_cookie(
        key="csrf_token",
        path="/",
    )
    return LogoutResponse(message="logged out")


@router.get("/me", response_model=MeResponse)
def me(
    auth_service: Injected[AuthService],
    access_token: str | None = Cookie(default=None),
) -> MeResponse:
    """認証中のユーザーを取得するエンドポイント

    Args:
      auth_service: ログイン認証用のサービスクラス
      access_token: 認証で利用しているアクセストークン

    Returns:
      MeResponse: 認証中のユーザー情報を返却

    Raises:
      HTTPException: アクセストークンが存在いない場合 (HTTP_401_UNAUTHORIZED)
    """

    if access_token is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")

    user = auth_service.get_me(access_token)

    return MeResponse(
        id=user.id,
        name=user.name,
        email=user.email,
        position_name=user.position.name if user.position else None,
        role_name="|".join(role.name for role in user.roles),
    )
