import wireup

from src.db.session import make_db_session
from src.features.auth.repository import UserRepository
from src.features.auth.service import AuthService
from src.features.purchasing_approvals.confirm.repository import (
    PurchasingApprovalEventRepository,
    PurchasingApprovalRepository,
)
from src.features.purchasing_approvals.confirm.service import CreateApprovalService

container = wireup.create_async_container(
    injectables=[
        make_db_session,
        UserRepository,
        AuthService,
        PurchasingApprovalRepository,
        PurchasingApprovalEventRepository,
        CreateApprovalService,
    ]
)
