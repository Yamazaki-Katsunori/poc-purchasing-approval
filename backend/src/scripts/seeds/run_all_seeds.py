from src.scripts.seeds.purchasing_approval_statuses_seed import (
    seed_purchasing_approval_statuses,
)
from src.scripts.seeds.roles_seed import seed_roles
from src.scripts.seeds.user_positions_seed import seed_user_positions
from src.scripts.seeds.user_roles_seed import seed_user_roles
from src.scripts.seeds.users_seed import seed_users


def main() -> None:
    seed_roles()
    seed_user_positions()
    seed_users()
    seed_purchasing_approval_statuses()
    seed_user_roles()


if __name__ == "__main__":
    main()
