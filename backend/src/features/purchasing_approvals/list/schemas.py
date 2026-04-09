from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


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


class PaginationResponse(BaseModel):
    """申請リストのページネーションレスポンスモデル"""

    page: int = Field(..., ge=1)
    per_page: int = Field(..., ge=1)
    total: int = Field(..., ge=1)
    total_pages: int = Field(..., ge=1)
    has_prev: bool
    has_next: bool


class ApprovalListQueryParams(BaseModel):
    """申請一覧ページでリクエストされるpaginationのクエリパラメータモデル"""

    page: int = Field(default=1, ge=1, description="現在ページ")
    per_page: int = Field(default=10, ge=1, le=100, description="1ページあたりの件数")


class ApprovalListResponse(BaseModel):
    """申請リストのレスポンスモデル"""

    # model_config = ConfigDict(from_attributes=True)
    items: list[ApprovalListItemResponse]
    pagination: PaginationResponse
