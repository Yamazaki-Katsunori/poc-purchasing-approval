# 購買申請ステータス遷移（PoC最小）

## ステータス一覧

| code     | 日本語名 | 説明                             |
| -------- | -------- | -------------------------------- |
| PENDING  | 承認待ち | 申請者が提出し、承認者の判断待ち |
| RETURNED | 差し戻し | 承認者から修正依頼が返っている   |
| APPROVED | 承認済み | 承認完了。購入手続きへ進める     |

## 遷移表

| from_status | action   | actor  | to_status | guard（遷移条件）          | side effects（更新/記録）                                                                                                        |
| ----------- | -------- | ------ | --------- | -------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| PENDING     | approve  | 承認者 | APPROVED  | current_status == PENDING  | eventsに`approve`追加 / approvals.current_status=APPROVED / approvals.approved_at=event_at / approvals.current_event_id=event.id |
| PENDING     | return   | 承認者 | RETURNED  | current_status == PENDING  | eventsに`return`追加 / approvals.current_status=RETURNED / approvals.current_event_id=event.id                                   |
| RETURNED    | resubmit | 申請者 | PENDING   | current_status == RETURNED | eventsに`resubmit`追加 / approvals.current_status=PENDING / approvals.current_event_id=event.id                                  |

## 不変条件（整合性）

- status 更新と event 追加は同一トランザクションで実施する
- approval 行をロックして並行更新を防止する（SELECT ... FOR UPDATE）
