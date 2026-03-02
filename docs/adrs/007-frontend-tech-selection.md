# ADR-007: Frontend Tech Selection for PoC (poc-purchasing-approval)

## Status

Accepted

## Context

`poc-purchasing-approval` のフロントエンドは、PoC でありつつも v1 の実装・検証をスムーズに進めるため、以下を満たす技術選定が必要だった。

- TypeScript + Next.js を前提に、実装の手戻りを減らす（型安全 / 実行時バリデーション）
- 「申請（入力）→確認→送信」「一覧→詳細→承認/差し戻し」など、画面遷移・状態管理が発生する
- API 通信（取得/更新）に伴うローディング・エラー・キャッシュを統一的に扱いたい
- TailwindCSS v4 を前提に、UI 実装の生産性を落とさない
- Next.js への依存が過剰に強くない（置き換え可能性を残す）構成にしたい

## Decision

以下のライブラリを採用する。

- バリデーション: `zod`
  - フォーム入力、API request/response の境界で実行時バリデーションを行い、型（TypeScript）と実データの乖離を防ぐ。
- フォーム: `react-hook-form` + `@hookform/resolvers`
  - フォーム状態・パフォーマンス・バリデーション連携を標準化する。
- サーバーステート（API データ）: `@tanstack/react-query`
  - API 取得/更新（query/mutation）、キャッシュ、再取得、ローディング/エラー制御を統一する。
- クライアントステート（UI/一時状態）: `jotai`
  - 入力中の下書き、画面跨ぎ状態、UI 状態など「ブラウザ内が正」の状態を atom 単位で管理する。
- Tailwind 補助: `clsx` + `tailwind-merge`
  - className の条件分岐と Tailwind クラス衝突の解消を簡潔にし、UI 実装の事故を減らす。

状態の境界は以下で統一する。

- Server State（API が正）: `@tanstack/react-query`
- Client/UI State（ブラウザが正）: `jotai`

## Alternatives Considered

- 状態管理: `Zustand`
  - 採用しなかった理由:
    - 本 PoC は「画面/機能ごとに状態が分割されやすい（申請の下書き・確認画面・選択中状態など）」ため、atom による分割と依存の明確化がしやすい `jotai` の方が扱いやすい。
    - Server State は React Query に寄せる方針のため、グローバルストアに集約しすぎる設計を避けたい。
  - ただし、グローバル状態を 1 ストアでまとめたい場合や状態が極小の場合は `Zustand` も有力。

- サーバーステート管理なし（fetch + useEffect 自前実装）
  - 採用しなかった理由:
    - キャッシュ、再取得、エラー/ローディング、更新後の整合性などを都度実装するコストが高い。
    - PoC でも「一覧/詳細/更新」が発生するため、最初から標準化した方が手戻りが少ない。

- バリデーション: `Yup` / `Valibot` 等
  - 採用しなかった理由:
    - TypeScript との相性（型推論）とエコシステム（resolver など）を優先し、採用事例が多い `zod` を選択。

- フォーム: `Formik` / 自前 state 管理
  - 採用しなかった理由:
    - パフォーマンス、実装量、zod 連携のしやすさの観点で `react-hook-form` を優先。

## Consequences

### Positive

- 型（TypeScript）と実行時（zod）を揃え、入力・API 境界の不具合を早期に検知できる
- Server State を React Query に集約し、取得/更新/キャッシュ/ローディング/エラーの実装を標準化できる
- Client/UI State を Jotai に分離し、画面跨ぎの下書きや UI 状態をシンプルに保てる
- フォーム実装が `react-hook-form` により統一され、開発速度と保守性が上がる
- Tailwind 運用（条件分岐・クラス衝突）を `clsx` / `tailwind-merge` で安定化できる

### Negative

- 依存ライブラリが増える（学習コスト・メンテコストが発生）
- 状態の責務分離（Server vs Client）を守らないと二重管理や整合性崩れが起きる
  - 例: React Query の結果を Jotai にコピーして二重管理する、など
- React Query のキャッシュキー設計、invalidate 方針などの運用ルールが必要

## Notes (Optional)

- ルール:
  - API 由来データは `@tanstack/react-query` に集約し、Jotai にコピーしない。
  - Jotai は「入力中/一時/UI 状態」に限定する。
- 見直し条件:
  - グローバル状態が増え、atom 分割よりストア集約が適する場合は `Zustand` への再検討を行う。
  - UI コンポーネントの再利用が増えた場合は、段階的に UI キット（例: shadcn/ui 等）の導入を検討する（PoC v1 では必須としない）。
