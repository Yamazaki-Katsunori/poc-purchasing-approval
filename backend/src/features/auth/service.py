from fastapi import HTTPException, status
from wireup import injectable

from src.features.auth.interfaces import IUserRepository
from src.models.user import User
from src.shared.security import create_access_token, decode_access_token, verify_password


@injectable(lifetime="scoped")
class AuthService:
    """認証関連のビジネスロジックを提供するサービスクラス"""

    def __init__(self, user_repository: IUserRepository) -> None:
        self.user_repository = user_repository

    def login_user(self, email: str, password: str) -> tuple[str, User]:
        """ユーザー認証を行い、JWTを発行する。

        Args:
            email: ログイン用メールアドレス
            password: 平文パスワード

        Returns:
            tuple[str,User]: 発行した JWTトークン と ユーザー情報

        Raises:
            HTTPException: 認証に失敗した場合 (HTTP_401_UNAUTHORIZED)
        """

        user = self.user_repository.find_by_email(email)

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

    def get_me(self, access_token: str) -> User:
        """認証中のユーザーを取得

        Args:
            access_token: Cookieに保存しているアクセストークン

        Returns:
            User: アクセストークンのユーザーIDに該当するユーザー情報

        Raises:
            HTTPException: 認証中のユーザーが存在しない場合 (HTTP_401_UNAUTHORIZED)

        """
        payload = decode_access_token(access_token)

        if payload is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token",
            )

        user_id = payload.get("sub")

        print(f"user_id {user_id}")
        print(f"user_id type: {type(user_id)}")

        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload",
            )

        user = self.user_repository.find_by_id(int(user_id))

        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found",
            )

        return user
