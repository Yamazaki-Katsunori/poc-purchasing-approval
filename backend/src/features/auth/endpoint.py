from fastapi import APIRouter

from src.features.auth.schemas import LoginRequest

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login")
def login(request: LoginRequest):

    return {
        "access_token": "dummy-token",
        "token_type": "bearer",
        "user": {
            "id": 1,
            "name": "test endpoint",
            "email": request.email,
        },
    }


@router.get("/me")
def me():
    return {"message": "get me test"}
