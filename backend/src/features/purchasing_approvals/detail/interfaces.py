from abc import ABC, abstractmethod

from src.models.purchasing_approval import PurchasingApproval


class IApprovalDetailRepository(ABC):
    """購買申請詳細インターフェース"""

    @abstractmethod
    def find_by_id(self, id: int) -> PurchasingApproval | None:
        """idを元に購買申請データを1件取得する"""
        raise NotImplementedError
