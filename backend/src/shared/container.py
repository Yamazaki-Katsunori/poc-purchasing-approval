import wireup

from src.db.session import make_db_session
from src.features.auth.repository import UserRepository
from src.features.auth.service import AuthService

container = wireup.create_async_container(
    injectables=[
        make_db_session,
        UserRepository,
        AuthService,
    ]
)
