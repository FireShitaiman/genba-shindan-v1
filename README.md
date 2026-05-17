# 現場の真実診断

工場・製造業の現場で働く人向けの、キャリア・職場環境タイプ診断。  
4軸16タイプのいずれかに分類され、タイプ別プロフィール・相性診断・現場の声を読むことができる。

**本番URL:** https://factory.money-dash.com/

---

## 診断モード

| モード | 設問数 | 目安時間 | 表示内容 |
|--------|--------|----------|----------|
| 簡易版 | 12問   | 約1分    | タイプ名・説明・アドバイス |
| 詳細版 | 30問   | 約5分    | 上記 + 4軸スコア・相性診断・深層プロフィール・現場の声 |

---

## 16タイプ体系

4つの軸の組み合わせで16タイプを決定する。

| 軸 | 記号 | 意味 |
|----|------|------|
| 第1軸 | **E** / **P** | Engineering 重視 ／ Politics 重視 |
| 第2軸 | **A** / **C** | Active（変革・行動派）／ Cautious（現状維持・慎重派）|
| 第3軸 | **Q** / **D** | Quality 追求（品質・正論）／ Done 優先（速度・実用）|
| 第4軸 | **R** / **V** | Rational（論理・データ重視）／ Vague（感覚・空気重視）|

例: `EAQR` = Engineering / Active / Quality / Rational = **「孤高の現場守護神」**

全16タイプそれぞれに、ペルソナ文・詳細プロフィール・アドバイス・ベスト/ワースト相性・現場の声が定義されている。

---

## ファイル構成

```
/
├── index.html              # メインアプリ（診断UI全体）
├── privacy.html            # プライバシーポリシー
├── style.css               # カスタムCSS（アニメーション・floating等）
├── manifest.json           # PWAマニフェスト
├── icon.svg                # PWAアイコン（E/P左右分割デザイン）
├── CNAME                   # GitHub Pages カスタムドメイン設定
│
├── src/
│   ├── constants.js        # 16タイプ定義（ペルソナ・詳細・相性・アドバイス）
│   ├── questions.js        # 診断設問リスト（簡易12問 / 詳細30問）
│   └── app.js              # クイズロジック・スコア計算・結果表示
│
├── ogp/
│   ├── [TYPE].html         # タイプ別OGPページ（SNSシェア用、16ファイル）
│   └── images/
│       └── [TYPE].png      # タイプ別OGP画像（1200x630、16ファイル）
│
└── tools/                  # 開発用ユーティリティ（本番には不要）
    ├── generate-ogp.html   # OGP画像生成ツール（ブラウザでスクショ取得）
    └── preview_all_types.html  # 全16タイプ結果一覧プレビュー
```

---

## 技術スタック

- **言語**: バニラ HTML / CSS / JavaScript（フレームワーク・ビルドステップなし）
- **CSS**: Tailwind CSS（CDN）、カスタムアニメーションは `style.css`
- **フォント**: Noto Sans JP（Google Fonts）
- **ホスティング**: GitHub Pages + Cloudflare（DNS-only）+ カスタムドメイン
- **アナリティクス**: Google Analytics 4
- **アバター**: DiceBear API（MIT）
- **チャート**: Chart.js（MIT）
- **PWA対応**: `manifest.json` + SVGアイコン（ホーム画面追加・Android PWAインストール対応）

---

## 開発方法

ビルド不要。ファイルを編集してブラウザで確認し、push するだけ。

```bash
# ローカル確認（静的サーバーの例）
npx serve .
# または
python -m http.server 8000
```

GitHub Pages へのデプロイは `master` ブランチへの push で自動反映される（反映まで数分かかる場合あり）。

### OGP画像を更新する場合

1. `tools/generate-ogp.html` をブラウザで開く
2. 各タイプのOGPカードをスクリーンショット（1200×630）
3. `ogp/images/[TYPE].png` に上書き保存
4. 対応する `ogp/[TYPE].html` の meta タグを確認

---

## 姉妹サイト

- **FIREシミュレーター / NISA・iDeCoツール**: https://money-dash.com/
- **JP・US株 財務データ分析**: https://edinet.money-dash.com/
