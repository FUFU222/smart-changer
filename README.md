# Smart Changer

画像の形式とサイズをまとめて変換するWebアプリです。変換はすべてブラウザの中で行い、画像をサーバーへ送信しません。

A browser-only image converter: JPEG / PNG / WEBP / HEIC in, JPEG / PNG / WEBP out. Images never leave the device.

## できること

- JPEG・PNG・WEBP・HEIC を JPEG・PNG・WEBP に変換（最大20枚・1枚50MBまで）
- 決まったサイズへの切り抜き・縮小、または元のサイズのまま形式だけ変換
- よく使うサイズを「既定」にしておくと、次に開いたときもそのサイズで始まる
- 保存方法をワンタップで切り替え：ZIPでまとめて／1枚ずつ（選んだ方法は次回も保持）
- スマートフォンでは共有シートから写真アプリへ保存（Web Share API 対応端末のみ）

## 技術構成

| 用途 | 使用しているもの |
| --- | --- |
| 画面 | React 19、React Router 7 |
| ビルド | Vite 8 |
| テスト | Vitest、Testing Library |
| HEIC の読み込み | heic-to（CSP 対応版。Safari では使わずブラウザ標準の機能で読む） |
| ZIP 作成 | JSZip（ZIP を使うときだけ読み込む） |
| 配信 | Vercel（`vercel.json` でセキュリティヘッダーと SPA のルーティングを設定） |

## 開発

Node.js 22.12 以上が必要です。

```sh
npm ci          # 依存関係のインストール（lockfile どおり）
npm run dev     # 開発サーバー http://localhost:5173
npm test        # テスト
npm run lint    # Lint
npm run build   # 本番ビルド（dist/）
npm run preview # 本番ビルドを本番と同じセキュリティヘッダー付きで確認 http://localhost:4173
```

## セキュリティ

- **CSP**：外部オリジンを一切許可しない設定（`default-src 'none'`）。Trusted Types も有効。
- **依存関係**：`.npmrc` でインストール時スクリプトを無効化。CI で `npm audit` を実行し、既知の脆弱性があれば失敗させる。Dependabot は公開から7日たったバージョンだけを提案する。
- **CI**：GitHub Actions は読み取り権限のみで、使うアクションはコミットSHAで固定。

設定は `vercel.json`、`.npmrc`、`.github/` を参照してください。

## デプロイ

`main` ブランチへのマージで Vercel が自動デプロイします。
