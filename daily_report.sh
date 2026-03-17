#!/bin/bash

# Discord送信先チャンネルID
DISCORD_CHANNEL="channel:1481844545951105046"

# Directories
WORKSPACE="/Users/kimparaibuki/dev/openclaw"
LOG_DIR="$WORKSPACE/logs"
mkdir -p "$LOG_DIR"

echo "=========================================="
echo "Processing: Daily Weather and News"
echo "=========================================="

PROMPT="web_searchツールを使って、今日の東京の天気と、最新の主要なニュースを3つほど検索してください。
取得した情報を元に、Discordユーザー向けに分かりやすく絵文字を交えてレポートを作成してください。
以下のフォーマットを含めるようにしてください：

☀️ **今日の天気**
（天気の概要・気温など）

📰 **今日の最新ニュース**
・ニュース1
・ニュース2
・ニュース3"

# AIによる情報取得・要約
echo "Generating Daily Report..."
AI_JSON=$(openclaw agent --agent main --message "$PROMPT" --json)

# JSONからテキスト抽出
AI_REPLY=$(node -e "try { console.log(JSON.parse(process.argv[1]).result.payloads[0].text) } catch(e){}" "$AI_JSON")

if [ -n "$AI_REPLY" ]; then
    # Discordに送信
    openclaw message send --channel discord --target "$DISCORD_CHANNEL" --message "$AI_REPLY"
    echo "✅ Message delivered"
else
    echo "⚠️  Failed to extract AI reply"
fi
