from __future__ import annotations

import sys
from datetime import UTC, datetime, timedelta
from decimal import Decimal

from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from src.db.session import SessionLocal
from src.models.purchasing_approval import PurchasingApproval
from src.models.purchasing_approval_event import PurchasingApprovalEvent
from src.models.purchasing_approval_status import PurchasingApprovalStatus
from src.models.user import User

TITLE_PREFIX = "[pagination-seed]"


def parse_count() -> int:
    if len(sys.argv) < 2:
        return 100

    try:
        count = int(sys.argv[1])
    except ValueError as exc:
        raise ValueError("件数は整数で指定してください。例: 100") from exc

    if count <= 0:
        raise ValueError("件数は 1 以上で指定してください。")

    return count


def find_seed_user(db: Session) -> User:
    user = db.execute(select(User).order_by(User.id.asc()).limit(1)).scalar_one_or_none()

    if user is None:
        raise ValueError("users テーブルにユーザーデータがありません。先に users seed を投入してください。")

    return user


def find_submitted_status(db: Session) -> PurchasingApprovalStatus:
    status = db.execute(
        select(PurchasingApprovalStatus).where(PurchasingApprovalStatus.code == "submitted").limit(1)
    ).scalar_one_or_none()

    if status is None:
        raise ValueError("purchasing_approval_statuses に code='submitted' のデータがありません。")

    return status


def cleanup_existing_seed_data(db: Session) -> tuple[int, int]:
    target_approvals = (
        db.execute(select(PurchasingApproval.id).where(PurchasingApproval.title.like(f"{TITLE_PREFIX}%")))
        .scalars()
        .all()
    )

    if not target_approvals:
        return (0, 0)

    target_events = (
        db.execute(
            select(PurchasingApprovalEvent.id).where(
                PurchasingApprovalEvent.subject_type == "approval",
                PurchasingApprovalEvent.subject_id.in_(target_approvals),
            )
        )
        .scalars()
        .all()
    )

    db.execute(delete(PurchasingApprovalEvent).where(PurchasingApprovalEvent.id.in_(target_events)))

    db.execute(delete(PurchasingApproval).where(PurchasingApproval.id.in_(target_approvals)))

    return (len(target_approvals), len(target_events))


def create_seed_approvals(db: Session, count: int) -> int:
    user = find_seed_user(db)
    submitted_status = find_submitted_status(db)

    now = datetime.now(UTC)

    for i in range(count):
        requested_at = now - timedelta(minutes=i)

        approval = PurchasingApproval(
            user_id=user.id,
            title=f"{TITLE_PREFIX} ページネーション確認用申請 {i + 1}",
            purchase_type="備品購入",
            amount=Decimal("1000") + Decimal(i * 100),
            reason=f"ページネーション確認用のテストデータ {i + 1}",
            current_status_id=submitted_status.id,
            current_event_id=None,
            requested_at=requested_at,
            approved_at=None,
        )
        db.add(approval)
        db.flush()

        event = PurchasingApprovalEvent(
            subject_type="approval",
            subject_id=approval.id,
            performed_by=user.id,
            status_id=submitted_status.id,
            action="submit",
            comment="pagination seed data",
            event_at=requested_at,
        )
        db.add(event)
        db.flush()

        approval.current_event_id = event.id

    return count


def main() -> None:
    count = parse_count()
    db = SessionLocal()

    try:
        deleted_approvals, deleted_events = cleanup_existing_seed_data(db)
        created_count = create_seed_approvals(db, count)

        db.commit()

        print("ページネーション確認用 seed の投入が完了しました。")
        print(f"削除した申請件数: {deleted_approvals}")
        print(f"削除したイベント件数: {deleted_events}")
        print(f"新規作成した申請件数: {created_count}")

    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
