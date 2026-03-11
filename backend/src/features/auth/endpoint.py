from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from src.db.session import get_db
from src.features.auth.schemas import LoginRequest, LoginResponse, LoginUserResponse
from src.features.auth.service import login_user

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=LoginResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)) -> LoginResponse:
    access_token, user = login_user(db, request.email, request.password)
    return LoginResponse(
        access_token=access_token,
        token_type="bearer",
        user=LoginUserResponse(
            id=user.id,
            name=user.name,
            email=user.email,
        ),
    )


@router.get("/me")
def me():
    return {"message": "get me test"}
