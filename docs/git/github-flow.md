# GitHub Flow（Rebase 運用）手順書

本ドキュメントは、poc-purchasing-approval における **GitHub Flow + Rebase and merge** の実手順をまとめる。

---

## 前提（運用方針）

- 長期ブランチは `main` のみ
- 作業は短命ブランチで行う（`feat/*`, `fix/*` など）
- **必ず PR 経由で `main` に統合**する（個人開発でも PR を履歴として残す）
- `main` は常に安定（CI が通る）状態を維持する
- マージ方式は **Rebase and merge** を採用し、履歴を直線化する

---

## ブランチ命名規則

用途別に prefix を付ける。

- `feat/<topic>` : 機能追加
- `fix/<topic>` : バグ修正
- `refactor/<topic>` : リファクタ
- `docs/<topic>` : ドキュメント
- `chore/<topic>` : 雑務（設定、依存更新など）
- `test/<topic>` : テスト追加/修正

例:

- `feat/purchase-request-form`
- `fix/api-timeout`
- `chore/update-deps`

---

## 基本フロー（ブランチ作成 → PR → Rebase → Merge）

### 1) 最新の `main` を取得する

```
git switch main
git pull origin main
```

### 2) 作業ブランチを作成する

```
git switch -c feat/<topic>
```

例:

```
git switch -c feat/purchase-request-form
```

### 3) 実装してコミットする

```
git status
git add -A
git commit -m "feat: add purchase request form"
```

ポイント:

- コミットは「小さく・意味のある単位」で分ける
- PR も小さく保つ（衝突・レビュー負荷を減らす）

### 4) リモートへ push して PR を作成する

```
git push -u origin feat/<topic>
```

GitHub 上で PR を作成する。

---

## PR 作成時のチェックリスト（最低限）

PR の本文に以下を含める（テンプレがあるなら合わせる）

- 目的（Why）
- 変更点（What）
- 動作確認方法（How to test）
- 関連 Issue / ADR / 設計メモ（あれば）

---

## PR を `main` に追従させる（Rebase 手順）

PR を出している間に `main` が進んだ場合は、マージ前に rebase して追従する。

### 1) `main` を最新化（fetch）

```
git fetch origin
```

（`git switch main && git pull origin main` でもOK）

### 2) 作業ブランチへ戻って rebase

```
git switch feat/<topic>
git rebase origin/main
```

### 3) コンフリクトが出た場合

1. どのファイルが衝突しているか確認

```
git status
```

1. 衝突を解消して add

```
git add <conflicted-file>
```

1. rebase を続行

```
git rebase --continue
```

やり直したい場合（rebase を中止）

```
git rebase --abort
```

### 4) rebase 後は push（安全に）

rebase 後は履歴が書き換わるため、force push が必要。

```
git push --force-with-lease
```

- `--force` ではなく **`--force-with-lease`** を使う（事故防止）

---

## GitHub でのマージ（Rebase and merge）

PR がレビュー/CI OK になったら、GitHub のマージ方式は以下を選ぶ。

- ✅ **Rebase and merge**

これにより `main` のコミット履歴が一直線になり、追跡しやすい。

---

## 作業後の後始末

### 1) ローカルで `main` を最新にしておく

```
git switch main
git pull origin main
```

### 2) 不要になったローカルブランチを削除

```
git branch -d feat/<topic>
```

### 3) 不要になったリモートブランチを削除（必要に応じて）

```
git push origin --delete feat/<topic>
```

※ GitHub 側の設定で「PR マージ後に自動削除」を ON にしているなら不要

---

## 推奨設定（GitHub / ローカル）

### GitHub（推奨）

- Branch protection（`main`）
  - PR 必須
  - CI 必須（lint/test/build）
  - 直 push 禁止
- PR マージ後のブランチ自動削除 ON

### ローカル（任意）

pull 時の戦略を明確にする（merge を避ける例）

```
git config --global pull.rebase true
```

---

## よくある運用パターン（例）

### 依存更新（chore）

```
git switch main
git pull origin main
git switch -c chore/update-deps
# update...
git add -A
git commit -m "chore: update dependencies"
git push -u origin chore/update-deps
```

（PR → rebase → Rebase and merge）

---

## 参考（コマンド早見）

- ブランチ作成: `git switch -c feat/x`
- main 追従: `git fetch origin && git rebase origin/main`
- rebase 続行: `git rebase --continue`
- rebase 中止: `git rebase --abort`
- rebase 後 push: `git push --force-with-lease`
