from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ApprovalListItemResponse(BaseModel):
    """申請リストアイテムのレスポンスモデル"""

    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    approval_user: str
    approval_status: str
    requested_at: datetime | None
    created_at: datetime
    approved_at: datetime | None


class ApprovalListResponse(BaseModel):
    """申請リストのレスポンスモデル"""

    # model_config = ConfigDict(from_attributes=True)
    items: list[ApprovalListItemResponse]
