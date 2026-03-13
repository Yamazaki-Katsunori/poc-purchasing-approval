from pydantic import BaseModel, EmailStr, Field


class LoginRequest(BaseModel):
    email: EmailStr = Field(
        description="ログイン用メールアドレス",
        examples=["test@example.com"],
    )
    password: str = Field(min_length=6, max_length=255, description="ログイン用パスワード", examples=["password1234"])


class LoginUserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr


class LoginResponse(BaseModel):
    token_type: str
    user: LoginUserResponse


class LogoutResponse(BaseModel):
    message: str


class MeResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    position_name: str | None = None
    role_name: str | None = None
