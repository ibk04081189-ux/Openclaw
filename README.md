# OpenClaw - ライブチケット監視自動化システム

OpenClaw CLI (`openclaw`) を活用した、ライブチケット情報の自動監視・Discord通知システムです。  
AIエージェントがチケット販売サイトを定期的に確認し、新着情報を集約してDiscordへ自動通知します。

## システム概要

```text
openclaw (AIエージェントCLI)
    ├── agent         -> AIエージェントを実行（Web検索およびFetch対応）
    └── message send  -> Discordチャンネルにメッセージ送信
```

本システムは以下のフローで動作します：

```text
[シェルスクリプト] -> (1) プロンプト生成
                  -> (2) openclaw agent によるAI実行（Web Fetch / Web 検索）
                  -> (3) JSONレスポンスからの返答テキスト抽出（Node.js）
                  -> (4) openclaw message send によるDiscordへの通知送信
```

## ディレクトリ構成

```text
openclaw/
├── .gitignore             # Git除外設定
├── README.md              # 本ファイル
└── ticket_monitor.sh      # アーティストのチケット情報を監視してDiscordへ通知するスクリプト
```

## スクリプト詳細

### `ticket_monitor.sh` - チケット情報モニタリング

指定されたアーティストのチケット販売サイト（イープラス、チケットぴあ、ローチケなど）をAIエージェントが巡回し、現在販売中または販売予定のライブ・チケット情報を抽出します。

| 項目 | 内容 |
|------|------|
| トリガー | 手動実行、または cron による定期実行 |
| AI ツール | `web_fetch` / `web_search` |
| 監視ソース | イープラス、チケットぴあ、ローチケ等の主要プレイガイド |
| 通知先 | Discord チャンネル |
| 対象アーティスト | スクリプト内の `ARTISTS` 配列で管理 |
| レート制限対策 | 複数アーティスト処理時に `sleep 2` を挿入 |

**実行方法:**

```bash
bash ticket_monitor.sh
```

**アーティストの追加方法:**

`ticket_monitor.sh` 内の `ARTISTS` 配列に、以下の形式で要素を追加します：

```bash
ARTISTS=(
    "SUPER BEAVER|SUPER%20BEAVER"
    "アーティスト名|URLエンコード済み検索キーワード"
)
```

---

## 開発環境および依存関係

| ツール/環境 | 用途 |
|--------|------|
| `openclaw` | AIエージェント実行・メッセージ送信用のCLIツール |
| `node` | JSONレスポンスからテキストデータを抽出する際のスクリプト実行 |
| `bash` | モニタリングスクリプトの実行シェル |

## OpenClaw について

OpenClaw は、AIエージェントをCLIから操作できるツールです。DiscordやTelegramなどの外部チャットツールと連携し、WebSocket Gatewayを経由してAIエージェントを管理・実行します。詳細な設定や利用可能なコマンドについては、公式ドキュメントを参照してください。

```bash
openclaw --help       # コマンド一覧の表示
openclaw agent --help # エージェント実行オプションの表示
openclaw doctor       # 接続状態のヘルスチェック
```
