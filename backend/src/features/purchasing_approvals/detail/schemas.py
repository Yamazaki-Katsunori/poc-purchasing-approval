from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class ApprovalDetailStatusResponse(BaseModel):
    """申請データに紐づく最新のステータスモデルのレスポンスモデル"""

    id: int
    code: str
    name: str

    model_config = ConfigDict(from_attributes=True)


class ApprovalDetailUserRoleResponse(BaseModel):
    """ユーザーに紐づくRoleレスポンスモデル"""

    id: int
    name: str

    model_config = ConfigDict(from_attributes=True)


class ApprovalDetailUserResponse(BaseModel):
    """申請確認画面ユーザーレスポンスモデル"""

    id: int
    name: str
    roles: list[ApprovalDetailUserRoleResponse] = []

    model_config = ConfigDict(from_attributes=True)


class ApprovalDetailEventPerformerResponse(BaseModel):
    """申請データに紐づいている申請イベントのイベント実行者情報のレスポンスモデル"""

    id: int
    name: str
    roles: list[ApprovalDetailUserRoleResponse] = []

    model_config = ConfigDict(from_attributes=True)


class ApprovalDetailEventResponse(BaseModel):
    """申請データに紐づいている申請イベントのレスポンスモデル"""

    id: int
    subject_type: str
    subject_id: int
    performed_by: int | None
    status_id: int
    action: str
    comment: str | None
    event_at: datetime
    performer: ApprovalDetailEventPerformerResponse | None

    model_config = ConfigDict(from_attributes=True)


class ApprovalDetailResponse(BaseModel):
    """申請確認画面のレスポンスモデル"""

    id: int
    title: str
    purchase_type: str
    amount: Decimal
    reason: str
    requested_at: datetime | None
    created_at: datetime
    approved_at: datetime | None
    current_status: ApprovalDetailStatusResponse | None
    current_event: ApprovalDetailEventResponse
    user: ApprovalDetailUserResponse

    model_config = ConfigDict(from_attributes=True)


class ApproveResponse(BaseModel):
    """申請確認画面の承認処理のレスポンスモデル"""

    model_config = ConfigDict(from_attributes=True)

    id: int
    current_status_id: int
    current_event_id: int | None
    approved_at: datetime | None


class ApprovalReturnResponse(BaseModel):
    """申請確認画面の差し戻し処理のレスポンスモデル"""

    message: str


class ApprovalReSubmitResponse(BaseModel):
    """申請確認画面の再提出処理のレスポンスモデル"""

    message: str
