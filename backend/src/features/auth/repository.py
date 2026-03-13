from sqlalchemy.orm import Session
from wireup import injectable

from src.features.auth.interfaces import IUserRepository
from src.models.user import User


@injectable(lifetime="scoped", as_type=IUserRepository)
class UserRepository(IUserRepository):
    def __init__(self, db: Session) -> None:
        self.db = db

    def find_by_email(self, email: str) -> User | None:
        return self.db.query(User).filter(User.email == email).first()

    def find_by_id(self, user_id: int) -> User | None:
        return self.db.query(User).filter(User.id == user_id).first()
