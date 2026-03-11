from sqlalchemy import select

from src.db.session import SessionLocal
from src.models.user_position import UserPosition


def seed_user_positions() -> None:
    seed_user_positions_data = [
        {"name": "情報システム部 部長"},
        {"name": "購買部 マネージャー"},
        {"name": "営業部 一般社員"},
    ]

    with SessionLocal() as session:
        with session.begin():
            for row in seed_user_positions_data:
                existing_position = session.scalar(select(UserPosition).where(UserPosition.name == row["name"]))
                if existing_position:
                    print(f"user_position skipped: {row['name']}")
                    continue

                session.add(
                    UserPosition(
                        name=row["name"],
                    )
                )
                print(f"user_position inserted: {row['name']}")


def main() -> None:
    seed_user_positions()


if __name__ == "__main__":
    main()
