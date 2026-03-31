from enum import StrEnum


class ApprovalActionState(StrEnum):
    APPROVE = "APPROVE"
    DRAFT = "DRAFT"
    REQUEST = "REQUEST"
    REMAND = "REMAND"
    CANCEL = "CANCEL"

    @property
    def label(self) -> str:
        return {
            ApprovalActionState.APPROVE: "承認",
            ApprovalActionState.DRAFT: "下書き",
            ApprovalActionState.REQUEST: "要請",
            ApprovalActionState.REMAND: "差し戻す",
            ApprovalActionState.CANCEL: "取り消す",
        }[self]
