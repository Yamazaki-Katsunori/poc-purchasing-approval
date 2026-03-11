from sqlalchemy import select

from src.db.session import SessionLocal
from src.models.role import Role
from src.models.user import User
from src.models.user_role import UserRole


def seed_user_roles() -> None:
    seed_user_roles_data = [
        {"email": "admin@example.com", "role_name": "admin"},
        {"email": "approver@example.com", "role_name": "approver"},
        {"email": "applicant@example.com", "role_name": "applicant"},
    ]

    with SessionLocal() as session:
        with session.begin():
            for row in seed_user_roles_data:
                user = session.scalar(select(User).where(User.email == row["email"]))
                if user is None:
                    print(f"user not found: {row['email']}")
                    continue

                role = session.scalar(select(Role).where(Role.name == row["role_name"]))
                if role is None:
                    print(f"role not found: {row['role_name']}")
                    continue

                existing_user_role = session.scalar(
                    select(UserRole).where(
                        UserRole.user_id == user.id,
                        UserRole.role_id == role.id,
                    )
                )
                if existing_user_role:
                    print(f"user_role skipped: {row['email']} -> {row['role_name']}")
                    continue

                session.add(
                    UserRole(
                        user_id=user.id,
                        role_id=role.id,
                    )
                )
                print(f"user_role inserted: {row['email']} -> {row['role_name']}")


def main() -> None:
    seed_user_roles()


if __name__ == "__main__":
    main()
