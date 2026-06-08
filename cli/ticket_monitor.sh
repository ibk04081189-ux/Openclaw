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

    PROMPT="あなたはweb_searchツールとweb_fetchツールを使用して、「${ARTIST_NAME}」の2026年のライブチケット販売情報を調べてください。
具体的には、イープラス(eplus.jp)、チケットぴあ(t.pia.jp)、ローチケ(l-tike.com)などの主要チケット販売サイトを横断的に検索し、現在販売中または販売予定の情報をDiscordユーザーに分かりやすくリストアップして報告してください。
アーティスト名「${ARTIST_NAME}」を冒頭に必ず明記し、各公演の『日程・会場・チケット販売サイト（イープラス/ぴあ/ローチケ等）・受付状況（先行受付中/一般発売中/受付終了等）』を箇条書きでリストアップしてください。
もし新しい情報が見当たらない場合は、直近の最新情報があればそれを伝えたうえで、『2026年の情報はまだ掲載されていません』と添えてください。
イープラス(eplus.jp)の直接検索用として、次のURLも確認してください: ${URL_EPLUS}"

    # 2. AI要約
    echo "Generating AI summary for $ARTIST_NAME..."
    AI_JSON=$(openclaw agent --agent main --message "$PROMPT" --json)

    # 3. JSONからテキスト抽出
    AI_REPLY=$(node -e "try { console.log(JSON.parse(process.argv[1]).result.payloads[0].text) } catch(e){}" "$AI_JSON")

    if [ -n "$AI_REPLY" ]; then
        # 4. Discordに送信
        openclaw message send --channel discord --target "$DISCORD_CHANNEL" --message "$AI_REPLY"
        echo "[SUCCESS] Message delivered for $ARTIST_NAME"
    else
        echo "[ERROR] Failed to extract AI reply for $ARTIST_NAME"
    fi

    # API制限対策: アーティスト間に2秒の間隔を置く
    sleep 2
done

echo ""
echo "[INFO] All artists processed!"
