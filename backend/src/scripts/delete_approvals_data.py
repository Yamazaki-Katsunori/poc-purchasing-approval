from sqlalchemy import delete

from src.db.session import SessionLocal
from src.models.purchasing_approval import PurchasingApproval
from src.models.purchasing_approval_event import PurchasingApprovalEvent


def main() -> None:
    db = SessionLocal()
    try:
        db.execute(delete(PurchasingApprovalEvent))
        db.execute(delete(PurchasingApproval))
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
