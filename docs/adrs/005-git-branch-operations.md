# ADR-005: Git ブランチ運用に GitHub Flow（Rebase 運用）を採用する

## Status

Accepted

## Context

poc-purchasing-approval は PoC（学習/検証目的）として開発し、開発体制は個人開発（少人数）を前提とする。  
この状況では以下が重要となる。

- 運用コストを最小化し、迷いなく開発を進められること
- `main` を常にデプロイ可能（＝壊れにくい）な状態に保つこと
- 変更の経緯を追いやすく、後から振り返れること（PR を議事録として活用したい）
- 将来的に人数が増えても破綻しにくいこと

上記の観点から、複雑なブランチ階層や儀式的な手順を必要とする運用は避けたい。

## Decision

Git のブランチ運用は **GitHub Flow + Rebase 運用** を採用する。

- 長期ブランチは `main` のみとする（`develop` 等は作らない）
- 作業は短命ブランチで行い、必ず PR 経由で `main` に統合する
- `main` は常に安定（CI が通る）状態を維持する
- PR のマージ方法は **Rebase and merge** を採用し、履歴を直線化する
- ブランチ命名は用途別の prefix を付与する（例: `feat/`, `fix/`, `chore/`, `docs/` など）
- PR には最小限の説明（目的・変更点・確認方法）を記載し、レビュー可能な粒度を保つ

## Alternatives Considered

### git-flow

- **不採用理由**
  - `develop` / `release` / `hotfix` 等のブランチを前提とし、PoC / 少人数に対して運用が重い
  - リリース運用が定期的に必要なプロダクト向きで、現状の目的（PoC）に過剰

### Trunk-Based Development（TBD）

- **不採用理由**
  - 「小さく頻繁に trunk（main）へ統合」するためには、強い自動化（CI/CD）、テスト整備、Feature Flag などの前提が必要になりやすい
  - 個人 PoC でも成立はするが、最初から TBD の厳格さを採用するより GitHub Flow の方が運用の説明・定着が容易

### GitHub Flow（Squash 運用）

- **不採用理由**
  - 履歴を単純化できる一方、コミット単位の経緯が残りにくい
  - PoC の振り返りを重視するため、PR 単位で直線化しつつコミットも残す Rebase を優先する

## Consequences

### Positive

- 運用が単純で、PoC 開発の速度を落としにくい
- `main` を常に安定させやすく、いつでも動く状態を維持できる
- PR を履歴・議事録として使え、意思決定や変更の理由が残る
- Rebase により履歴が直線化され、原因調査（bisect 等）や追跡がしやすい

### Negative

- Rebase を行うため、Git の基本操作に慣れていないと衝突解消や手順ミスのリスクがある
- PR が大きいと rebase/衝突が増えるため、変更を小さく分ける規律が必要
- 「履歴を整える」意識が必要で、コミット粒度・メッセージ規約を守らないと逆に追跡しづらくなる

## Notes (Optional)

- CI（lint / test / build）の整備が進んだら「PR マージ条件」として必須化する（Branch protection を設定する）
- 将来的にチーム開発・定期リリース運用が必要になった場合は、`release/*` などの導入を再検討する
- ブランチ命名、PR テンプレ、コミット規約（Conventional Commits）などは `docs/git/git-flow.md` に具体手順として別途まとめる
