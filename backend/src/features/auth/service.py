from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from src.models.user import User
from src.shared.security import create_access_token, verify_password


def login_user(db: Session, email: str, password: str) -> tuple[str, User]:
    stmt = select(User).where(User.email == email)
    user = db.execute(stmt).scalar_one_or_none()

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="メールアドレスまたはパスワードが不正です",
        )

    if not verify_password(password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="メールアドレスまたはパスワードが不正です",
        )

    access_token = create_access_token(subject=str(user.id))
    return access_token, user
