import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import {
  DynamoDBDocumentClient,
  ScanCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb'
import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm'
import axios from 'axios'
import * as cheerio from 'cheerio'

const dynamo = DynamoDBDocumentClient.from(new DynamoDBClient({}))
const ssm = new SSMClient({})
const TABLE = process.env.ARTISTS_TABLE

// SSMからシークレットを取得
async function getSecret(name) {
  const res = await ssm.send(
    new GetParameterCommand({ Name: name, WithDecryption: true })
  )
  return res.Parameter.Value
}

// Discord Webhookに送信
async function sendToDiscord(webhookUrl, message) {
  await axios.post(webhookUrl, { content: message })
}

// Gemini APIでテキスト生成 (Google Search Groundingを有効化)
async function generateWithGemini(apiKey, prompt, retries = 3) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`
  for (let i = 0; i < retries; i++) {
    try {
      const res = await axios.post(url, {
        contents: [{ parts: [{ text: prompt }] }],
        tools: [{ google_search: {} }]
      })
      return res.data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    } catch (err) {
      if (err.response?.status === 429 && i < retries - 1) {
        const wait = (i + 1) * 10000
        console.log(`Rate limited. Waiting ${wait/1000}s...`)
        await new Promise(r => setTimeout(r, wait))
      } else { throw err }
    }
  }
}

// eplus.jpからHTMLを取得
async function fetchEplusPage(keyword) {
  const url = `https://eplus.jp/sf/search?block=true&keyword=${keyword}`
  try {
    const res = await axios.get(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml',
        'Accept-Language': 'ja,en;q=0.9',
      },
      timeout: 15000,
    })
    // Cheerioでテキストのみ抽出（トークン節約）
    const $ = cheerio.load(res.data)
    $('script, style, nav, footer, header').remove()
    return $('body').text().replace(/\s+/g, ' ').trim().slice(0, 4000)
  } catch (err) {
    console.error(`eplus.jp fetch error for ${keyword}:`, err.message)
    return null
  }
}

export const handler = async (event) => {
  console.log('ticket_monitor started', JSON.stringify(event))

  const [apiKey, webhookUrl] = await Promise.all([
    getSecret(process.env.GEMINI_API_KEY_PARAM),
    getSecret(process.env.DISCORD_WEBHOOK_PARAM),
  ])

  // 特定アーティストのみ実行する場合（手動トリガー時）
  const targetArtistId = event.artistId || null

  // DynamoDBからアクティブなアーティストを取得
  const result = await dynamo.send(new ScanCommand({ TableName: TABLE }))
  let artists = (result.Items || []).filter((a) => a.status === 'active')

  if (targetArtistId) {
    artists = artists.filter((a) => a.artistId === targetArtistId)
  }

  if (artists.length === 0) {
    console.log('監視対象のアーティストがいません')
    return { statusCode: 200, body: 'No active artists' }
  }

  for (const artist of artists) {
    try {
      console.log(`Processing: ${artist.name}`)

      // eplus.jpのテキストを取得
      const pageText = await fetchEplusPage(artist.keyword)

      const prompt = `「${artist.name}」の2026年以降のライブスケジュールやチケット情報を調べて、Discordユーザー向けに分かりやすくまとめてください。
情報収集の際には、Google検索を利用して、イープラス（eplus.jp）、チケットぴあ（t.pia.jp）、ローチケ（l-tike.com）などの主要チケット販売サイトでの販売状況や受付期間、チケットの有無を網羅的に確認してください。

アーティスト名「${artist.name}」を冒頭に必ず明記し、各公演の『日程・会場・チケット販売サイト（イープラス/ぴあ/ローチケ等）・受付状況（先行受付中/一般発売中/受付終了等）』を箇条書きでリストアップしてください。

もし2026年以降のライブチケット情報が見つからない場合は、「現在${artist.name}の2026年以降のチケット情報は主要サイトに掲載されていません」と伝えてください。${
        pageText
          ? `\n\nまた、補助情報として、以下はeplus.jpの検索結果ページから抽出したテキストです。こちらも参考にしてください：\n${pageText}`
          : ''
      }`

      const summary = await generateWithGemini(apiKey, prompt)

      if (summary) {
        await sendToDiscord(webhookUrl, summary)
        console.log(`✅ Discord送信完了: ${artist.name}`)
      }

      // DynamoDBのlastCheckedAtを更新
      await dynamo.send(
        new UpdateCommand({
          TableName: TABLE,
          Key: { artistId: artist.artistId },
          UpdateExpression: 'SET lastCheckedAt = :now',
          ExpressionAttributeValues: { ':now': new Date().toISOString() },
        })
      )

      // レート制限対策
      await new Promise((r) => setTimeout(r, 2000))
    } catch (err) {
      console.error(`Error processing ${artist.name}:`, err)
    }
  }

  return { statusCode: 200, body: 'Done' }
}
