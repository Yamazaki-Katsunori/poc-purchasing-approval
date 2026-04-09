from abc import ABC, abstractmethod

from src.models.purchasing_approval import PurchasingApproval


class IApprovalListRepository(ABC):
    """申請一覧取得インターフェース"""

    @abstractmethod
    def get_approval_list(self, offset: int, limit: int) -> list[PurchasingApproval]:
        raise NotImplementedError

    @abstractmethod
    def approval_list_count_all(self) -> int:
        raise NotImplementedError
