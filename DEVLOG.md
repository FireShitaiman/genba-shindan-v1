# genba_shindan_v1 開発ログ

## セッション 2026-04-27

---

### 1. app.js / index.html リファクタリング

Geminiの指摘をベースに以下を実施。

#### セキュリティ
- **`innerHTML` を全廃** → `textContent` + `createElement` によるDOM操作に変更
  - 対象: `updateQuotesUI`, `updateMatchUI`, `updateAffiliateUI`, `showQuestion` の4箇所
  - XSSリスクをゼロに
- **グローバル変数を IIFE でカプセル化**
  - 変数6個（`currentQuestionIndex`, `answers`, `activeQuestions` 等）を `AppState` オブジェクトに集約
  - コンソールからのスコア改ざんを抑制
- **`window.open` に `noopener,noreferrer` を追加**
  - SNSシェア・アフィリエイトリンクのタブハイジャック・リファラ漏えいを防止
- **`onclick=` 属性を HTML から削除**
  - イベント登録を `app.js` の `init()` に一元化

#### パフォーマンス・構造
- **DOM要素を `initElements()` で起動時に一括キャッシュ** (`El` オブジェクト)
  - 各関数内で毎回 `getElementById` を呼ぶ実装を排除
- **`applyTier()` で市場価値・生存率の処理を共通化** (DRY原則)
  - 重複していた if/else ブロックをデータ駆動の純粋関数1つに集約
- **`buildMatchCard()`, `buildAffiliateCard()` を純粋関数化**
  - ロジックとビュー生成を分離
- **`showOnly()` でセクション表示を一元管理**

#### 法的・ブランド
- 免責事項に「独自アルゴリズム」「MBTI®との無関係」を明記
- `localStorage` 非保存の旨を免責事項に追記
- フッターに Chart.js / DiceBear のクレジット追加
- 「粉塵」→「油と汗」など、特定業界固有の残骸用語を除去

---

### 2. ignore ファイル整備

#### .gitignore
- ビルドシステムなしの静的サイトに合わせて `node_modules/`, `dist/`, `build/` を削除
- `debug_all_types.html` を追加（デバッグファイルをコミット対象外に）
- `*.md` を追加（ローカルメモをコミット対象外に）
- `.DS_Store`, `Thumbs.db` を追加
- `.claude/` を追加（パーミッション設定はローカル管理）

#### .claudeignore
- `debug_all_types.html`, `.git/`, `.vscode/` を除外
- 役割: git管理外だがディスクに存在するファイルをClaudeのスキャンから除外

---

### 3. Claude Code パーミッション設定

`.claude/settings.json` を作成:

```json
{
  "permissions": {
    "allow": [
      "Read(c:/genba_shindan_v1/**)"
    ]
  }
}
```

- このプロジェクト内でのRead権限を `c:/genba_shindan_v1/` 以下のみに制限
- 操作ミスで他プロジェクト・他フォルダを読みに行くことを防止
- 設定はプロジェクトスコープなので他プロジェクトへの影響なし
- `.gitignore` で `.claude/` を除外済み（git管理外）

---

### 現在のファイル構成

```
genba_shindan_v1/
├── index.html        # メインHTML（onclick属性なし）
├── app.js            # ロジック（IIFE・DOMキャッシュ・純粋関数）
├── style.css         # スタイル（変更なし）
├── questions.js      # 質問データ（変更なし）
├── constants.js      # 定数・ペルソナデータ（変更なし）
├── debug_all_types.html  # デバッグ用（gitignore・claudeignore対象）
├── .gitignore
├── .claudeignore
└── .claude/
    └── settings.json  # Claudeパーミッション設定
```
