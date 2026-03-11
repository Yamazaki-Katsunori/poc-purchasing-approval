from sqlalchemy import select

from src.db.session import SessionLocal
from src.models.purchasing_approval_status import PurchasingApprovalStatus


def seed_purchasing_approval_statuses() -> None:
    seed_statuses = [
        {"code": "draft", "name": "下書き", "sort_order": 1},
        {"code": "submitted", "name": "申請中", "sort_order": 2},
        {"code": "approved", "name": "承認済み", "sort_order": 3},
        {"code": "rejected", "name": "却下", "sort_order": 4},
    ]

    with SessionLocal() as session:
        with session.begin():
            for status in seed_statuses:
                existing_status = session.scalar(
                    select(PurchasingApprovalStatus).where(PurchasingApprovalStatus.code == status["code"])
                )
                if existing_status:
                    print(f"skip status: {status['code']}")
                    continue

                session.add(
                    PurchasingApprovalStatus(
                        code=status["code"],
                        name=status["name"],
                        sort_order=status["sort_order"],
                    )
                )
                print(f"insert status: {status['code']}")


def main() -> None:
    seed_purchasing_approval_statuses()


if __name__ == "__main__":
    main()
