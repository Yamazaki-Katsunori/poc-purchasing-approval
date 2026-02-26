# ADR-004: Current Status Strategy（現在ステータス保持戦略）

## Status

Accepted

## Context

本PJ（poc-purchasing-approval）では、購買申請の承認フローを実装するにあたり、申請の「現在ステータス」をどのように保持・参照するかを決める必要がある。

要件/前提：

- 申請のタイムライン（誰が・いつ・何をしたか）を監査ログとして残したい
  - `purchasing_approval_events` を履歴（イベント）として保持する
- 一覧画面/検索で「承認待ち（PENDING）のみ」「金額範囲」などの参照が頻繁に発生する想定
- PoCではシンプルなフロー（PENDING / RETURNED / APPROVED）を主対象とし、取り消し等は一旦扱わない
- DBは PostgreSQL を想定し、API は FastAPI を想定
- 設計方針として「現場風（保守・運用・性能の観点）と、履歴の純粋性（監査性）」のバランスを取る
- AI要約は外部LLMにより生成され、**提出系イベント（submit/resubmit）に紐付けて保存**する方針（ADR-002）
  - 「どの時点の申請内容を要約したか」をイベント単位で追跡できることが重要

課題：

- 履歴（events）から毎回「最新ステータス」を導出する方式は、一覧や検索でクエリが複雑化しやすい（latest-per-group 等）
- 一方、申請テーブルに current_status を持たせると冗長性が生まれ、整合性担保が必要になる（更新漏れ、二重管理）

## Decision

以下の **併用戦略（スナップショット + 履歴）** を採用する。

- `purchasing_approval_events` を「監査ログ/履歴の真実（source of truth）」として保持する
- `purchasing_approvals` に `current_status_id`（および最適化用に `current_event_id`）を持たせ、「現在状態」をスナップショットとして保持する
- 状態遷移を伴う操作はすべて **同一トランザクション** で以下を行う
  1. approval 行をロック（`SELECT ... FOR UPDATE`）
  2. 遷移ガード（現在ステータス + ロール）を検証
  3. events にイベントを追加
  4. approvals の `current_status_id` / `current_event_id`（必要に応じて `requested_at` / `approved_at`）を更新
- 不整合が疑われる場合に備え、将来的に「events から approvals の current\_\* を再構築」できる運用/コマンドの導入余地を残す（PoCでは必須ではない）

### current_event_id の定義（明文化）

- `current_event_id` は **状態遷移を発生させた最新イベント** を指す
  - 対象 action: `submit`, `resubmit`, `return`, `approve`
  - `comment` 等の「状態を変えないイベント」は `current_event_id` 更新対象外（タイムラインには残す）
- 「最新の提出系イベント（submit/resubmit）」は、AI要約表示の起点として利用する（ADR-002）
  - 例：承認画面では「最新の提出系イベントに紐付くAI要約」を表示する

### 参照方針（普段の参照と“真実”の使い分け）

- 一覧/検索などの **通常参照は approvals.current_status_id を正**として扱う（性能優先）
- 監査・検証・再構築・障害調査では events を正として扱う（監査性優先）

採用理由（要点）：

- 一覧/検索の主要クエリをシンプル・高速に保つ（現場での実用性）
- 監査ログ（タイムライン）として履歴を完全に保持できる（説明責任・AI要約にも有利）
- 将来的にイベントソーシング寄りへ拡張する余地を残しつつ、PoCの実装コストを抑える
- AI要約をイベントに紐付ける方針（ADR-002）と整合し、「どの時点の申請内容か」を追跡できる

## Alternatives Considered

### A案: events から最新状態を導出（完全履歴型 / 参照時集計）

- 概要：
  - `purchasing_approvals` に current_status を持たず、`purchasing_approval_events` の最新イベントを参照して現在状態を決定する
- 採用しなかった理由：
  - 一覧/検索で latest-per-group のクエリが複雑化しやすい（ウィンドウ関数/サブクエリ等）
  - 「承認待ちのみ」「金額条件」等の条件検索が重くなりやすい
  - PoCでも実装・保守の難易度が上がり、他の価値（AI要約・フロー）に注力しにくい

### B案: approvals に current_status_id を保持（高速参照型）

- 概要：
  - 現在状態を `purchasing_approvals.current_status_id` に保持し、events は履歴として残す
- 評価：
  - 一覧/検索がシンプルで速い
  - ただし、events と approvals の二重管理になるため整合性担保が必須
- 結論：
  - **B案をベースにしつつ、events を監査ログとして“真実”として扱う併用戦略**として採用（本ADRのDecision）

## Consequences

### Positive

- 一覧/検索（例：PENDING のみ、金額範囲）のクエリが単純になり、パフォーマンスと実装容易性が向上する
- events により監査ログ/タイムラインを保持でき、説明責任・デバッグ・AI要約の材料として有効
- `current_event_id` により「最新の状態遷移イベント」へ即参照でき、APIレスポンス生成が容易になる
- AI要約を「提出系イベント」に紐付ける設計（ADR-002）と整合し、要約の対象時点が明確になる
- 将来、必要に応じて events から再構築する運用も選択できる（拡張余地）

### Negative

- approvals と events の二重管理となるため、整合性担保が必要（更新漏れリスク）
- 実装上、状態遷移の全操作をトランザクション化し、ロック・ガード・更新順を守る必要がある
- `current_event_id` の更新ルール（状態遷移イベントのみ）を守らないと、参照の整合性が崩れる
- 再構築（リビルド）や整合性チェックの仕組みを導入する場合、追加の実装コストが発生する

## Notes (Optional)

- PoCではステータスは最小（PENDING / RETURNED / APPROVED）で開始し、必要に応じて DRAFT / REJECTED / CANCELLED を追加する
- `requested_at` / `approved_at` は events から導出可能だが、一覧最適化（表示・検索）目的でスナップショットとして保持する（必要性が薄ければ将来削除も検討）
- 整合性担保の基本は「イベント追加 + current\_\* 更新を同一トランザクションで実行する」こと。サービス層（UseCase）に処理を集約し、直接更新を禁止する
- 並行更新は approvals 行の `SELECT ... FOR UPDATE` で防止する。events は append-only のため原則ロック不要
- 将来的な見直し条件：
  - 状態遷移が複雑化し、遷移表/権限/副作用が増える
  - 監査要件が強くなり、イベントソーシングをコアに据える必要が出た場合
  - AI要約の生成を非同期化し、再生成/品質切替など運用要件が増えた場合
