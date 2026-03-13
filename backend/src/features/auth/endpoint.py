from fastapi import APIRouter, Cookie, HTTPException, Response, status
from wireup import Injected

from src.features.auth.schemas import LoginRequest, LoginResponse, LoginUserResponse, LogoutResponse, MeResponse
from src.features.auth.service import AuthService

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=LoginResponse)
def login(
    auth_service: Injected[AuthService],
    request: LoginRequest,
    response: Response,
) -> LoginResponse:
    access_token, user = auth_service.login_user(request.email, request.password)

    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=False,  # 本番は True
        samesite="lax",
        path="/",
        max_age=60 * 60,
    )

    return LoginResponse(
        token_type="bearer",
        user=LoginUserResponse(
            id=user.id,
            name=user.name,
            email=user.email,
        ),
    )


@router.post("/logout", response_model=LogoutResponse)
def logout(response: Response) -> LogoutResponse:
    response.delete_cookie(
        key="access_token",
        path="/",
    )
    return LogoutResponse(message="logged out")


@router.get("/me", response_model=MeResponse)
def me(
    auth_service: Injected[AuthService],
    access_token: str | None = Cookie(default=None),
) -> MeResponse:
    if access_token is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")

    user = auth_service.get_me(access_token)

    return MeResponse(
        id=user.id,
        name=user.name,
        email=user.email,
        position_name=getattr(user, "position_name", None),
        role_name=getattr(user, "role_name", None),
    )
