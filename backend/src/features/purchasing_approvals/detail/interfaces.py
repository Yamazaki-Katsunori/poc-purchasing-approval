from abc import ABC, abstractmethod

from src.models.purchasing_approval import PurchasingApproval
from src.models.purchasing_approval_event import PurchasingApprovalEvent
from src.models.purchasing_approval_status import PurchasingApprovalStatus


class IApprovalDetailRepository(ABC):
    """購買申請詳細用のApprovalインターフェース"""

    @abstractmethod
    def find_by_id(self, id: int) -> PurchasingApproval | None:
        """idを元に購買申請データを1件取得する"""
        raise NotImplementedError

    @abstractmethod
    def save(self, approval: PurchasingApproval) -> PurchasingApproval:
        """idを元に購買申請データを承認ステータスに更新する"""
        raise NotImplementedError

    @abstractmethod
    def update_current_event_id(self, approval: PurchasingApproval, approval_event_id: int) -> PurchasingApproval:
        """idを元に購買申請データを差し戻しステータスに更新する"""
        raise NotImplementedError


class IApprovalDetailEventRepository(ABC):
    """購買申請詳細画面用のApproval_Eventインターフェース"""

    @abstractmethod
    def create(self, approval_event: PurchasingApprovalEvent) -> PurchasingApprovalEvent:
        raise NotImplementedError


class IApprovalDetailStatusRepository(ABC):
    """購買申請詳細画面用のApproval_Statusインターフェース"""

    @abstractmethod
    def find_by_code(self, code: str) -> PurchasingApprovalStatus | None:
        raise NotImplementedError
