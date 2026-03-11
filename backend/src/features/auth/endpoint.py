from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session

from src.db.session import get_db
from src.features.auth.schemas import LoginRequest, LoginResponse, LoginUserResponse, LogoutResponse
from src.features.auth.service import login_user

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=LoginResponse)
def login(request: LoginRequest, response: Response, db: Session = Depends(get_db)) -> LoginResponse:
    access_token, user = login_user(db, request.email, request.password)

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


@router.get("/me")
def me():
    return {"message": "get me test"}
