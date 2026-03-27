from pydantic import BaseModel, Field


class ConfirmApprovalRequest(BaseModel):
    """購買新規申請確認画面リクエストスキーマ"""

    title: str = Field(min_length=1, description="購買新規申請: タイトル", examples=["事務所の備品の購入"])
    purchase_type: str = Field(min_length=1, description="購買新規申請: 購買種別", examples=["備品"])
    amount: int = Field(ge=1, description="購買新規申請: 購入金額", examples=[1_000])
    reason: str = Field(
        min_length=1, description="購買新規申請: 申請理由", examples=["新入社員の受け入れによるPC電源コードの購入"]
    )


class ConfirmApprovalResponse(BaseModel):
    """購買新規申請確認画面レスポンススキーマ"""

    title: str
    purchase_type: str
    amount: int
    reason: str
