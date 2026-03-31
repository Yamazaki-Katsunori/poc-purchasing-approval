from enum import StrEnum


class ApprovalStatusCode(StrEnum):
    DRAFT = "draft"
    SUBMITTED = "submitted"
    APPROVED = "approved"
    REJECTED = "rejected"

    @property
    def label(self) -> str:
        return {
            ApprovalStatusCode.DRAFT: "下書き",
            ApprovalStatusCode.SUBMITTED: "申請中",
            ApprovalStatusCode.APPROVED: "承認済み",
            ApprovalStatusCode.REJECTED: "却下",
        }[self]
