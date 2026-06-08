# OpenClaw - ライブチケット監視自動化プラットフォーム

本プロジェクトは、ライブチケット情報の自動監視・Discord通知を行う統合プラットフォームです。ローカルまたはサーバー上で実行可能なCLIスクリプトに加え、管理用のWebフロントエンド（React）およびAWSサーバーレスバックエンド（AWS SAM）を同一リポジトリに内包したモノレポ構成となっています。

## システム概要

システムは以下の3つのコンポーネントで構成されています。

```text
openclaw/
├── cli/          # 監視実行スクリプト（ローカル/サーバー実行用）
├── frontend/     # Web管理画面（React / Vite）
└── backend/      # サーバーレスバックエンド（AWS SAM）
```

### アーキテクチャ

#### 1. Web / SAMバックエンド構成
Web管理画面から監視対象アーティストを追加・編集し、AWS上でスケジュール実行を行います。

```text
[ユーザー] -> [Web管理画面 (React/Vite)]
                  | (HTTPS / REST API)
                  v
         [API Gateway]
                  |
                  v
         [Lambda (openclaw-artists)] <-> [DynamoDB (openclaw-artists)]
                                                 ^
                                                 |
[EventBridge Scheduler] -> [Lambda (openclaw-ticket-monitor)] -> [Gemini API / Discord]
```

#### 2. CLI構成
ローカルPCや仮想サーバーのcronを利用し、シンプルにコマンドラインから監視を実行します。

```text
[シェルスクリプト] -> (1) プロンプト生成
                  -> (2) openclaw agent によるAI実行（Web Fetch / Web 検索）
                  -> (3) JSONレスポンスからの返答テキスト抽出（Node.js）
                  -> (4) openclaw message send によるDiscordへの通知送信
```

---

## ディレクトリ構成

```text
openclaw/
├── cli/
│   ├── ticket_monitor.sh        # チケット情報監視スクリプト
│   └── logs/                    # 一時キャッシュログ（Git除外）
├── frontend/
│   ├── src/                     # React ソースコード
│   ├── public/                  # 静的アセット
│   ├── index.html               # エントリーHTML
│   ├── package.json             # フロントエンド依存関係
│   └── vite.config.js           # Vite設定
└── backend/
    ├── template.yaml            # AWS SAM テンプレート定義ファイル
    └── functions/
        ├── artists/             # 管理用API担当のLambda関数（Node.js）
        └── ticket_monitor/      # スクレイピング・要約・通知担当のLambda関数（Node.js）
```

---

## 各コンポーネントのセットアップ

### CLIの実行

1. **移動**
   ```bash
   cd cli
   ```

2. **実行**
   ```bash
   bash ticket_monitor.sh
   ```

3. **監視アーティストの編集**
   `ticket_monitor.sh` 内の `ARTISTS` 配列に対象を追加します。
   ```bash
   ARTISTS=(
       "SUPER BEAVER|SUPER%20BEAVER"
       "アーティスト名|URLエンコード済み検索キーワード"
   )
   ```

### バックエンドのデプロイ (AWS SAM)

AWS CLI および AWS SAM CLI がセットアップされている必要があります。

1. **依存関係のインストール**
   ```bash
   cd backend/functions/artists && npm install
   cd ../ticket_monitor && npm install
   ```

2. **ビルドとデプロイ**
   ```bash
   cd ../../
   sam build
   sam deploy --guided
   ```

3. **パラメータ設定**
   以下のパラメータを AWS Systems Manager (SSM) Parameter Store に登録してください。
   - `/openclaw/gemini-api-key`
   - `/openclaw/discord-webhook-url`

### フロントエンドのローカル開発

1. **依存関係のインストール**
   ```bash
   cd frontend && npm install
   ```

2. **環境変数の設定**
   `frontend/.env.local` を作成し、デプロイしたAPI GatewayのURLを指定します。
   ```env
   VITE_API_BASE_URL=https://<your-api-id>.execute-api.<region>.amazonaws.com/Prod
   ```

3. **起動とビルド**
   ```bash
   npm run dev      # 開発サーバー起動
   npm run build    # 本番ビルド
   ```
