import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import {
  DynamoDBDocumentClient,
  ScanCommand,
  PutCommand,
  DeleteCommand,
} from '@aws-sdk/lib-dynamodb'
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda'
import { SSMClient, GetParameterCommand, PutParameterCommand } from '@aws-sdk/client-ssm'
import { SchedulerClient, GetScheduleCommand, UpdateScheduleCommand } from '@aws-sdk/client-scheduler'
import { randomUUID } from 'crypto'

const dynamo = DynamoDBDocumentClient.from(new DynamoDBClient({}))
const lambda = new LambdaClient({})
const ssm = new SSMClient({})
const scheduler = new SchedulerClient({})

const TABLE = process.env.ARTISTS_TABLE
const GEMINI_API_KEY_PARAM = process.env.GEMINI_API_KEY_PARAM
const DISCORD_WEBHOOK_PARAM = process.env.DISCORD_WEBHOOK_PARAM
const TICKET_MONITOR_SCHEDULE_NAME = process.env.TICKET_MONITOR_SCHEDULE_NAME

const response = (statusCode, body) => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS',
  },
  body: JSON.stringify(body),
})

async function getSSM(name) {
  try {
    const res = await ssm.send(new GetParameterCommand({ Name: name, WithDecryption: true }))
    return res.Parameter.Value
  } catch (e) {
    console.warn(`SSM Parameter ${name} not found or inaccessible:`, e.message)
    return ''
  }
}

async function getSchedule(name) {
  try {
    const res = await scheduler.send(new GetScheduleCommand({ Name: name }))
    return {
      expression: res.ScheduleExpression,
      state: res.State // 'ENABLED' or 'DISABLED'
    }
  } catch (e) {
    console.warn(`Schedule ${name} not found:`, e.message)
    return { expression: 'rate(1 hour)', state: 'DISABLED' }
  }
}

export const handler = async (event) => {
  const method = event.httpMethod
  const path = event.path
  const artistId = event.pathParameters?.artistId

  try {
    // GET /artists — 一覧取得
    if (method === 'GET' && path === '/artists') {
      const result = await dynamo.send(new ScanCommand({ TableName: TABLE }))
      const items = (result.Items || []).sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      )
      return response(200, { artists: items })
    }

    // POST /artists — 新規追加
    if (method === 'POST' && path === '/artists') {
      const body = JSON.parse(event.body || '{}')
      if (!body.name || !body.keyword) {
        return response(400, { error: 'name と keyword は必須です' })
      }
      const now = new Date().toISOString()
      const item = {
        artistId: randomUUID(),
        name: body.name,
        keyword: body.keyword,
        status: 'active',
        lastCheckedAt: null,
        createdAt: now,
      }
      await dynamo.send(new PutCommand({ TableName: TABLE, Item: item }))
      return response(201, { artist: item })
    }

    // DELETE /artists/{artistId} — 削除
    if (method === 'DELETE' && artistId) {
      await dynamo.send(
        new DeleteCommand({ TableName: TABLE, Key: { artistId } })
      )
      return response(200, { message: '削除しました' })
    }

    // POST /artists/{artistId}/run — 手動実行
    if (method === 'POST' && path.endsWith('/run') && artistId) {
      await lambda.send(
        new InvokeCommand({
          FunctionName: 'openclaw-ticket-monitor',
          InvocationType: 'Event', // 非同期
          Payload: JSON.stringify({ artistId }),
        })
      )
      return response(202, { message: '実行を開始しました' })
    }

    // GET /settings — 設定取得
    if (method === 'GET' && path === '/settings') {
      const [geminiApiKey, discordWebhookUrl, ticketMonitor] = await Promise.all([
        getSSM(GEMINI_API_KEY_PARAM),
        getSSM(DISCORD_WEBHOOK_PARAM),
        getSchedule(TICKET_MONITOR_SCHEDULE_NAME),
      ])
      return response(200, {
        geminiApiKey,
        discordWebhookUrl,
        schedules: {
          ticketMonitor,
        }
      })
    }

    // POST /settings — SSM更新
    if (method === 'POST' && path === '/settings') {
      const body = JSON.parse(event.body || '{}')
      const ops = []
      if (body.geminiApiKey !== undefined) {
        ops.push(ssm.send(new PutParameterCommand({
          Name: GEMINI_API_KEY_PARAM,
          Value: body.geminiApiKey,
          Type: 'SecureString',
          Overwrite: true
        })))
      }
      if (body.discordWebhookUrl !== undefined) {
        ops.push(ssm.send(new PutParameterCommand({
          Name: DISCORD_WEBHOOK_PARAM,
          Value: body.discordWebhookUrl,
          Type: 'SecureString',
          Overwrite: true
        })))
      }
      await Promise.all(ops)
      return response(200, { message: '設定を更新しました' })
    }

    // POST /settings/schedule — スケジュール更新
    if (method === 'POST' && path === '/settings/schedule') {
      const body = JSON.parse(event.body || '{}')
      const { type, expression, enabled } = body
      const name = TICKET_MONITOR_SCHEDULE_NAME

      // 現在のスケジュール設定を取得して Target などを維持する
      const current = await scheduler.send(new GetScheduleCommand({ Name: name }))
      
      await scheduler.send(new UpdateScheduleCommand({
        Name: name,
        ScheduleExpression: expression || current.ScheduleExpression,
        State: enabled === undefined ? current.State : (enabled ? 'ENABLED' : 'DISABLED'),
        Target: current.Target,
        FlexibleTimeWindow: current.FlexibleTimeWindow
      }))

      return response(200, { message: 'スケジュールを更新しました' })
    }

    // OPTIONS — CORS preflight
    if (method === 'OPTIONS') {
      return response(200, {})
    }

    return response(404, { error: 'Not found' })
  } catch (err) {
    console.error('Error:', err)
    return response(500, { error: err.message })
  }
}
