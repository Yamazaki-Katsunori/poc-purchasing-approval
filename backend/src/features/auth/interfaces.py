from abc import ABC, abstractmethod

from src.models.user import User


class IUserRepository(ABC):
    @abstractmethod
    def find_by_email(self, email: str) -> User | None:
        raise NotImplementedError

    @abstractmethod
    def find_by_id(self, user_id: int) -> User | None:
        raise NotImplementedError
