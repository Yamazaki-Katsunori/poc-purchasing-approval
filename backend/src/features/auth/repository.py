from sqlalchemy.orm import Session
from wireup import injectable

from src.features.auth.interfaces import IUserRepository
from src.models.user import User


@injectable(lifetime="scoped", as_type=IUserRepository)
class UserRepository(IUserRepository):
    """ユーザー情報を取得する処理をまとめたリポジトリクラス"""

    def __init__(self, db: Session) -> None:
        self.db = db

    def find_by_email(self, email: str) -> User | None:
        """メールアドレスを元にユーザーを取得する処理

        Args:
           email: 検索するメールアドレス

        Returns:
           User | None: 検索結果
        """
        return self.db.query(User).filter(User.email == email).first()

    def find_by_id(self, user_id: int) -> User | None:
        """ユーザーIDを元にユーザー情報を取得する処理

        Args:
          user_id: 検索するユーザーID

        Returns:
          User | None: 検索結果
        """
        return self.db.query(User).filter(User.id == user_id).first()
