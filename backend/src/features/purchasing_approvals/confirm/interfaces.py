from abc import ABC, abstractmethod

from src.models.purchasing_approval import PurchasingApproval
from src.models.purchasing_approval_event import PurchasingApprovalEvent


class IPurchasingApprovalRepository(ABC):
    """購買新規申請インターフェース"""

    @abstractmethod
    def create_approval(self, approval: PurchasingApproval) -> PurchasingApproval:
        """購買新規申請登録処理"""
        raise NotImplementedError

    @abstractmethod
    def update_current_event_id(self, approval: PurchasingApproval, approval_event_id: int) -> PurchasingApproval:
        """登録した購買新規申請データのcurrent_event_idを更新する処理"""
        raise NotImplementedError


class IPurchasingApprovalEventRepository(ABC):
    """購買申請イベントインターフェース"""

    @abstractmethod
    def create_approval_event(self, approval_event: PurchasingApprovalEvent) -> PurchasingApprovalEvent:
        """購買新規申請時のevent登録処理"""
        raise NotImplementedError
