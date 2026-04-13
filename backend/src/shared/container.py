import wireup

from src.db.session import make_db_session
from src.features.auth.repository import UserRepository
from src.features.auth.service import AuthService
from src.features.purchasing_approvals.confirm.repository import (
    PurchasingApprovalEventRepository,
    PurchasingApprovalRepository,
    PurchasingApprovalStatusRepository,
)
from src.features.purchasing_approvals.confirm.service import CreateApprovalService
from src.features.purchasing_approvals.detail.repository import ApprovalDetailRepository
from src.features.purchasing_approvals.detail.service import ApprovalDetailService
from src.features.purchasing_approvals.list.repository import ApprovalListRepository
from src.features.purchasing_approvals.list.service import PurchasingApprovalListService

container = wireup.create_async_container(
    injectables=[
        make_db_session,
        UserRepository,
        AuthService,
        PurchasingApprovalRepository,
        PurchasingApprovalEventRepository,
        PurchasingApprovalStatusRepository,
        CreateApprovalService,
        ApprovalListRepository,
        PurchasingApprovalListService,
        ApprovalDetailRepository,
        ApprovalDetailService,
    ]
)
