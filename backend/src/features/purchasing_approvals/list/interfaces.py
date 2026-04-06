from abc import ABC, abstractmethod

from src.models.purchasing_approval import PurchasingApproval


class IApprovalListRepository(ABC):
    """申請一覧取得インターフェース"""

    @abstractmethod
    def get_approval_list(self) -> list[PurchasingApproval]:
        raise NotImplementedError
