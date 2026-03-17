#!/bin/bash

# ============================================================
# 監視対象のアーティスト設定
# 形式: "表示名|eプラス検索キーワード（URLエンコード済み）"
# ============================================================
ARTISTS=(
    "SUPER BEAVER|SUPER%20BEAVER"
    # 追加したいアーティストはここに行を足してください
    # "アーティスト名|eプラス検索キーワード（URLエンコード済み）"
)

# Discord送信先チャンネルID
DISCORD_CHANNEL="channel:1481844545951105046"

# Directories
WORKSPACE="/Users/kimparaibuki/dev/openclaw"
LOG_DIR="$WORKSPACE/logs"
mkdir -p "$LOG_DIR"

# ============================================================
# 各アーティストをループして処理
# ============================================================
for ARTIST_ENTRY in "${ARTISTS[@]}"; do
    # 表示名とURLエンコード済みキーワードを分割
    ARTIST_NAME="${ARTIST_ENTRY%%|*}"
    ARTIST_KEYWORD="${ARTIST_ENTRY##*|}"

    echo "=========================================="
    echo "Processing: $ARTIST_NAME"
    echo "=========================================="

    URL_EPLUS="https://eplus.jp/sf/search?block=true&keyword=${ARTIST_KEYWORD}"

    PROMPT="あなたはweb_fetchツールを使って次のURLにアクセスしてください: ${URL_EPLUS}
そのページに掲載されている「${ARTIST_NAME}」の2026年のライブスケジュールやチケット情報を調べて、Discordユーザーに分かりやすくリストアップして報告してください。アーティスト名「${ARTIST_NAME}」を冒頭に必ず明記してください。
もし2026年の情報が見当たらない場合は、直近の最新情報があればそれを伝えたうえで、『2026年の情報はまだ掲載されていません』と添えてください。
ページにアクセスできない場合は、web_searchツールで「${ARTIST_NAME} ライブ 2026 チケット」を検索して情報を補完してください。"

    # 2. AI要約
    echo "Generating AI summary for $ARTIST_NAME..."
    AI_JSON=$(openclaw agent --agent main --message "$PROMPT" --json)

    # 3. JSONからテキスト抽出
    AI_REPLY=$(node -e "try { console.log(JSON.parse(process.argv[1]).result.payloads[0].text) } catch(e){}" "$AI_JSON")

    if [ -n "$AI_REPLY" ]; then
        # 4. Discordに送信
        openclaw message send --channel discord --target "$DISCORD_CHANNEL" --message "$AI_REPLY"
        echo "✅ Message delivered for $ARTIST_NAME"
    else
        echo "⚠️  Failed to extract AI reply for $ARTIST_NAME"
    fi

    # API制限対策: アーティスト間に2秒の間隔を置く
    sleep 2
done

echo ""
echo "✅ All artists processed!"
