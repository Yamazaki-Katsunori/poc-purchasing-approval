from pydantic import BaseModel, EmailStr, Field


class LoginRequest(BaseModel):
    """ログイン認証リクエストスキーマ"""

    email: EmailStr = Field(
        description="ログイン用メールアドレス",
        examples=["test@example.com"],
    )
    password: str = Field(min_length=6, max_length=255, description="ログイン用パスワード", examples=["password1234"])


class LoginUserResponse(BaseModel):
    """ログイン認証レスポンススキーマに含めるログインユーザースキーマ"""

    id: int
    name: str
    email: EmailStr


class LoginResponse(BaseModel):
    """ログイン認証レスポンススキーマ"""

    token_type: str
    user: LoginUserResponse


class LogoutResponse(BaseModel):
    """ログアウトレスポンススキーマ"""

    message: str


class MeResponse(BaseModel):
    """認証確認レスポンススキーマ"""

    id: int
    name: str
    email: EmailStr
    position_name: str | None = None
    role_name: str | None = None
