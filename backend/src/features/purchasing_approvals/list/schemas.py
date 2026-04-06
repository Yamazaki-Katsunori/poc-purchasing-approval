from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ApprovalListItemResponse(BaseModel):
    """申請リストアイテムのレスポンスモデル"""

    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    amount: int
    created_at: datetime


class ApprovalListResponse(BaseModel):
    """申請リストのレスポンスモデル"""

    # model_config = ConfigDict(from_attributes=True)
    items: list[ApprovalListItemResponse]
