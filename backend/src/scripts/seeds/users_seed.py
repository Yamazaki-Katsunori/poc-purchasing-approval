from sqlalchemy import select

from src.db.session import SessionLocal
from src.models.user import User
from src.models.user_position import UserPosition
from src.shared.security import get_password_hash


def seed_users() -> None:
    seed_users_data = [
        {
            "name": "管理者ユーザー",
            "email": "admin@example.com",
            "password": "password",
            "position_name": "情報システム部 部長",
        },
        {
            "name": "承認者ユーザー",
            "email": "approver@example.com",
            "password": "password",
            "position_name": "購買部 マネージャー",
        },
        {
            "name": "申請者ユーザー",
            "email": "applicant@example.com",
            "password": "password",
            "position_name": "営業部 一般社員",
        },
    ]

    with SessionLocal() as session:
        with session.begin():
            for user_data in seed_users_data:
                existing_user = session.scalar(select(User).where(User.email == user_data["email"]))
                if existing_user:
                    print(f"skip user: {user_data['email']}")
                    continue

                position = session.scalar(select(UserPosition).where(UserPosition.name == user_data["position_name"]))
                if position is None:
                    print(f"position not found: {user_data['position_name']}")
                    continue

                session.add(
                    User(
                        name=user_data["name"],
                        email=user_data["email"],
                        password_hash=get_password_hash(user_data["password"]),
                        position_id=position.id,
                    )
                )
                print(f"insert user: {user_data['email']} position={user_data['position_name']}")


def main() -> None:
    seed_users()


if __name__ == "__main__":
    main()
