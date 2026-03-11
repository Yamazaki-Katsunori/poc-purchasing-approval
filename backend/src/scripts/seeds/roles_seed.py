from sqlalchemy import select

from src.db.session import SessionLocal
from src.models.role import Role


def seed_roles() -> None:
    role_names = [
        "admin",
        "approver",
        "applicant",
    ]

    with SessionLocal() as session:
        with session.begin():
            for role_name in role_names:
                existing_role = session.scalar(select(Role).where(Role.name == role_name))
                if existing_role:
                    print(f"skip role: {role_name}")
                    continue

                session.add(Role(name=role_name))
                print(f"insert role: {role_name}")


def main() -> None:
    seed_roles()


if __name__ == "__main__":
    main()
