# 🦞 OpenClaw Automation Scripts

OpenClaw CLI (`openclaw`) を活用した自動化スクリプト集です。AIエージェントを呼び出してWebから情報を収集し、Discordチャンネルへ自動通知します。

## サービス概要

```
openclaw (AIエージェントCLI)
    ├── agent         → AIエージェントをワンターンで実行（Web検索・Fetch対応）
    └── message send  → Discord / Telegram などのチャンネルにメッセージ送信
```

スクリプトは以下のフローで動作します：

```
[シェルスクリプト] → (1) プロンプト生成
                  → (2) openclaw agent でAI実行（Web検索 / Fetch）
                  → (3) JSON レスポンスから返答テキスト抽出（Node.js）
                  → (4) openclaw message send でDiscordへ通知
```

## ディレクトリ構成

```
openclaw/
├── README.md              # このファイル
├── daily_report.sh        # 毎日の天気・ニュースレポートをDiscordへ送信
├── ticket_monitor.sh      # アーティストのライブチケット情報を監視してDiscordへ通知
└── logs/                  # 各スクリプトが生成するキャッシュ・ログファイル
    ├── ticket_cache.txt
    ├── ticket_current.txt
    └── ticket_current_<アーティスト名>.txt
```

## スクリプト詳細

### `daily_report.sh` — 日次天気・ニュースレポート

AIに東京の天気と主要ニュース3件を検索させ、Discordへ通知します。

| 項目 | 内容 |
|------|------|
| トリガー | 手動 or cron |
| AI ツール | `web_search` |
| 通知先 | Discord チャンネル (`channel:1481844545951105046`) |
| 出力形式 | 天気 ☀️ + ニュース 📰 の絵文字フォーマット |

**実行方法:**
```bash
bash daily_report.sh
```

---

### `ticket_monitor.sh` — チケット情報モニタリング

指定アーティストの eplus.jp ページをAIが取得し、ライブスケジュール・チケット情報をDiscordへ通知します。

| 項目 | 内容 |
|------|------|
| トリガー | 手動 or cron |
| AI ツール | `web_fetch` / `web_search`（フォールバック） |
| 監視ソース | [eplus.jp](https://eplus.jp) |
| 通知先 | Discord チャンネル (`channel:1481844545951105046`) |
| 対象アーティスト | スクリプト内 `ARTISTS` 配列で管理 |
| レート制限対策 | アーティスト間に `sleep 2` |

**実行方法:**
```bash
bash ticket_monitor.sh
```

**アーティストの追加方法:**

`ticket_monitor.sh` の `ARTISTS` 配列に以下の形式で追記します：

```bash
ARTISTS=(
    "SUPER BEAVER|SUPER%20BEAVER"
    "アーティスト名|URLエンコード済みキーワード"
)
```

---

## 依存関係

| ツール | 用途 |
|--------|------|
| `openclaw` | AIエージェント実行・メッセージ送信 |
| `node` | JSONレスポンスからテキスト抽出 |
| `bash` | スクリプト実行環境 |

## OpenClaw について

[OpenClaw](https://docs.openclaw.ai/cli) は、AIエージェントをCLIから操作できるツールです。Discord・Telegram などのチャットチャンネルと連携し、WebSocket Gateway 経由でエージェントを管理します。

```bash
openclaw --help       # コマンド一覧
openclaw agent --help # エージェント実行オプション
openclaw doctor       # 接続状態のヘルスチェック
```
