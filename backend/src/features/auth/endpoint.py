from fastapi import APIRouter

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login")
def login():
    return {
        "access_token": "dummy-token",
        "token_type": "bearer",
        "user": {
            "id": 1,
            "name": "test endpoint",
            "email": "text@example.com",
        },
    }


@router.get("/me")
def me():
    return {"message": "get me test"}
