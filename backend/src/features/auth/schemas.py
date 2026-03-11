from pydantic import BaseModel, EmailStr, Field


class LoginRequest(BaseModel):
    email: EmailStr = Field(
        description="ログイン用メールアドレス",
        examples=["test@example.com"],
    )
    password: str = Field(min_length=8, max_length=255, description="ログイン用パスワード", examples=["password1234"])
