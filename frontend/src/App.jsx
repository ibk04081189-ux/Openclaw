import { useState, useEffect, useCallback } from 'react'

const API = import.meta.env.VITE_API_BASE_URL

// API hooks
function useArtists() {
  const [artists, setArtists] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchArtists = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch(`${API}/artists`)
      const data = await res.json()
      setArtists(data.artists || [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchArtists() }, [fetchArtists])

  const addArtist = async (name, keyword) => {
    const res = await fetch(`${API}/artists`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, keyword }),
    })
    const data = await res.json()
    if (res.ok) { setArtists(prev => [data.artist, ...prev]) }
    return res.ok
  }

  const deleteArtist = async (artistId) => {
    await fetch(`${API}/artists/${artistId}`, { method: 'DELETE' })
    setArtists(prev => prev.filter(a => a.artistId !== artistId))
  }

  const runArtist = async (artistId) => {
    await fetch(`${API}/artists/${artistId}/run`, { method: 'POST' })
  }

  return { artists, loading, error, addArtist, deleteArtist, runArtist, refetch: fetchArtists }
}

function useSettings() {
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch(`${API}/settings`)
      const data = await res.json()
      setSettings(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchSettings() }, [fetchSettings])

  const updateGeneralSettings = async (updates) => {
    const res = await fetch(`${API}/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
    if (res.ok) fetchSettings()
    return res.ok
  }

  const updateSchedule = async (type, expression, enabled) => {
    const res = await fetch(`${API}/settings/schedule`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, expression, enabled }),
    })
    if (res.ok) fetchSettings()
    return res.ok
  }

  return { settings, loading, error, updateGeneralSettings, updateSchedule, refetch: fetchSettings }
}

const IconDashboard = () => (
  <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10-3a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1v-7z"/></svg>
)
const IconArtists = () => (
  <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
)
const IconSchedule = () => (
  <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
)
const IconIntegrations = () => (
  <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>
)
const IconCheck = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
)
const IconPlus = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
)
const IconSearch = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
)
const IconZap = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
)

const SPARK_DATA = [30, 55, 40, 70, 50, 90, 65, 80, 45, 95, 75, 88]

function SparkLine() {
  const max = Math.max(...SPARK_DATA)
  return (
    <div className="chart-sparkline">
      {SPARK_DATA.map((v, i) => (
        <div
          key={i}
          className="chart-bar"
          style={{ height: `${(v / max) * 100}%`, animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  )
}

function StatusBadge({ label = '正常稼働' }) {
  return (
    <span className="badge badge-green">
      <span className="status-dot" style={{ color: '#38e7b4', display: 'inline-block', width: 8, height: 8 }}>
        <span className="status-dot-inner" style={{ width: 8, height: 8 }} />
      </span>
      {label}
    </span>
  )
}

function DashboardContent({ artists, loading }) {
  return (
    <div style={{ maxWidth: 900 }}>
      <div className="section-header animate-fade-in-up">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <span className="badge badge-green">LIVE</span>
          <span className="mono" style={{ fontSize: 12, color: 'var(--text-muted)' }}>最終同期: 1分前</span>
        </div>
        <h2 className="section-title">ダッシュボード</h2>
        <p className="section-subtitle">チケット監視AIエージェントの稼働状況とスケジュールされたタスクの概要</p>
      </div>

      <div className="metrics-grid" style={{ marginBottom: 28 }}>
        <div className="metric-card animate-fade-in-up delay-100">
          <div className="card-glow" />
          <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>監視中アーティスト</p>
          <p style={{ fontSize: 48, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.04em', lineHeight: 1 }}>{artists.length}</p>
          <SparkLine />
        </div>

        <div className="metric-card animate-fade-in-up delay-200" style={{ background: 'rgba(99,102,241,0.06)', borderColor: 'rgba(99,102,241,0.15)' }}>
          <div className="card-glow" style={{ background: 'radial-gradient(ellipse at top left, rgba(99,102,241,0.08), transparent 60%)' }} />
          <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>本日の実行回数</p>
          <p style={{ fontSize: 48, fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1 }} className="gradient-text">12</p>
          <div style={{ marginTop: 16 }}>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: '72%' }} />
            </div>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>目標: 16回/日</p>
          </div>
        </div>

        <div className="metric-card animate-fade-in-up delay-300">
          <div className="card-glow" />
          <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>システムステータス</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div className="status-dot" style={{ color: '#38e7b4' }}>
              <div className="status-dot-inner" />
            </div>
            <span style={{ fontSize: 22, fontWeight: 700, color: '#38e7b4', letterSpacing: '-0.02em' }}>正常稼働中</span>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>稼働時間: <span style={{ color: 'var(--text-secondary)' }}>99.9%</span> (30日間)</p>
        </div>
      </div>

      <div className="content-panel animate-fade-in-up delay-400">
        <div className="panel-header">
          <span className="panel-title">最新のアクティビティ</span>
          <span className="badge badge-purple">リアルタイム</span>
        </div>
        {[
          { icon: <IconCheck />, color: '#38e7b4', bg: 'rgba(56,231,180,0.1)', title: '監視タスク: SUPER BEAVER', desc: 'チケット販売サイト (イープラス/ぴあ/ローチケ等) を確認しました。新しいチケット情報は検知されませんでした。', time: '10:02:14 AM' },
          { icon: <IconCheck />, color: '#818cf8', bg: 'rgba(99,102,241,0.1)', title: '監視タスク: King Gnu', desc: 'チケット販売サイト (イープラス/ぴあ/ローチケ等) を確認しました。新しいチケット情報は検知されませんでした。', time: '10:01:58 AM' },
          { icon: <IconCheck />, color: '#38e7b4', bg: 'rgba(56,231,180,0.1)', title: '監視タスク: Vaundy', desc: 'チケット販売サイト (イープラス/ぴあ/ローチケ等) を確認しました。新規公演「Vaundy one man live 2026」を検知しました。', time: '09:45:30 AM' },
        ].map((entry, i) => (
          <div key={i} className="log-entry">
            <div className="log-icon" style={{ background: entry.bg, color: entry.color }}>
              {entry.icon}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{entry.title}</p>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{entry.desc}</p>
              <p className="mono" style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>{entry.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ArtistsContent({ artists, loading, addArtist, deleteArtist, runArtist }) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', keyword: '' })
  const [submitting, setSubmitting] = useState(false)
  const [runningId, setRunningId] = useState(null)

  const handleAdd = async () => {
    if (!form.name || !form.keyword) return
    setSubmitting(true)
    const ok = await addArtist(form.name, form.keyword)
    if (ok) { setForm({ name: '', keyword: '' }); setShowForm(false) }
    setSubmitting(false)
  }

  const handleRun = async (artistId) => {
    setRunningId(artistId)
    await runArtist(artistId)
    setTimeout(() => setRunningId(null), 2000)
  }
  return (
    <div style={{ maxWidth: 900 }}>
      <div className="section-header animate-fade-in-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h2 className="section-title">アーティスト管理</h2>
          <p className="section-subtitle">AIによる自動監視の対象となるアーティストリスト</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(v => !v)}>
          <IconPlus />{showForm ? 'キャンセル' : '新規追加'}
        </button>
      </div>

      {showForm && (
        <div className="content-panel animate-fade-in-up" style={{ padding: 24, marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <input className="input-dark" placeholder="アーティスト名 (例: SUPER BEAVER)" value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))} style={{ flex: 1, minWidth: 200 }} />
            <input className="input-dark mono" placeholder="URLキーワード (例: SUPER%20BEAVER)" value={form.keyword}
              onChange={e => setForm(p => ({ ...p, keyword: e.target.value }))} style={{ flex: 1, minWidth: 200 }} />
            <button className="btn-primary" onClick={handleAdd} disabled={submitting}>
              {submitting ? '追加中...' : '追加'}
            </button>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {artists.map((artist, idx) => (
          <div key={artist.artistId || idx} className="artist-card animate-fade-in-up" style={{ animationDelay: `${idx * 100}ms` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <div style={{
                width: 56, height: 56, borderRadius: 16,
                background: idx % 2 === 0
                  ? 'linear-gradient(135deg, rgba(56,231,180,0.2), rgba(99,102,241,0.2))'
                  : 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(245,158,11,0.2))',
                border: '1px solid rgba(255,255,255,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20, fontWeight: 800, color: idx % 2 === 0 ? '#38e7b4' : '#818cf8',
                flexShrink: 0,
              }}>
                {artist.name.slice(0, 1)}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>{artist.name}</h3>
                  <StatusBadge label={artist.status === 'active' ? '稼働中' : '停止中'} />
                </div>
                <p className="mono" style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <IconSearch />{artist.keyword}
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>最終確認</p>
                <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>
                  {artist.lastCheckedAt ? new Date(artist.lastCheckedAt).toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '未実行'}
                </p>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn-secondary" style={{ padding: '8px 16px' }}
                  onClick={() => deleteArtist(artist.artistId)}>削除</button>
                <button className="btn-primary" style={{ padding: '8px 16px' }}
                  onClick={() => handleRun(artist.artistId)}
                  disabled={runningId === artist.artistId}>
                  {runningId === artist.artistId ? '実行中...' : '今すぐ実行'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ScheduleContent({ settings, updateSchedule }) {
  const [saving, setSaving] = useState(false)
  const [ticketExp, setTicketExp] = useState('')

  useEffect(() => {
    if (settings?.schedules) {
      setTicketExp(settings.schedules.ticketMonitor.expression)
    }
  }, [settings])

  const handleSave = async (exp, enabled) => {
    setSaving(true)
    await updateSchedule('ticketMonitor', exp, enabled)
    setSaving(false)
    alert('スケジュールを更新しました')
  }

  if (!settings) return <div className="animate-pulse" style={{ padding: 40, color: 'var(--text-muted)' }}>読み込み中...</div>

  return (
    <div style={{ maxWidth: 720 }}>
      <div className="section-header animate-fade-in-up">
        <h2 className="section-title">スケジュール設定</h2>
        <p className="section-subtitle">AWS EventBridgeを用いたチケット監視タスクの自動実行頻度を設定します。</p>
      </div>

      <div className="content-panel animate-fade-in-up delay-100">
        <div className="panel-header">
          <div>
            <span className="panel-title">チケット監視ジョブ</span>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>登録アーティストのチケット情報を定期的にスクレイピングします</p>
          </div>
          <label className="toggle">
            <input 
              type="checkbox" 
              checked={settings.schedules.ticketMonitor.state === 'ENABLED'} 
              onChange={(e) => handleSave(ticketExp, e.target.checked)}
            />
            <div className="toggle-track" />
            <div className="toggle-thumb" />
          </label>
        </div>

        <div style={{ padding: '28px' }}>
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>実行間隔</label>
            <div style={{ display: 'flex', gap: 12 }}>
              <select 
                className="input-dark select-dark" 
                value={ticketExp}
                onChange={(e) => setTicketExp(e.target.value)}
                style={{ flex: 1 }}
              >
                <option value="rate(1 minute)">1分に1回 (テスト用)</option>
                <option value="rate(1 hour)">1時間に1回</option>
                <option value="rate(3 hours)">3時間に1回</option>
                <option value="cron(0 10 * * ? *)">毎日 10:00 JST</option>
              </select>
              <button className="btn-primary" onClick={() => handleSave(ticketExp)} disabled={saving}>
                保存
              </button>
            </div>
          </div>

          <div style={{ padding: '20px', background: 'rgba(56,231,180,0.04)', border: '1px solid rgba(56,231,180,0.12)', borderRadius: 12 }}>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>現在の設定</p>
            <p className="mono" style={{ fontSize: 15, color: '#38e7b4', fontWeight: 600 }}>{settings.schedules.ticketMonitor.expression}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function IntegrationsContent({ settings, updateGeneralSettings }) {
  const [saving, setSaving] = useState(false)
  const [webhook, setWebhook] = useState('')
  const [apiKey, setApiKey] = useState('')

  useEffect(() => {
    if (settings) {
      setWebhook(settings.discordWebhookUrl)
      setApiKey(settings.geminiApiKey)
    }
  }, [settings])

  const handleSave = async () => {
    setSaving(true)
    await updateGeneralSettings({ discordWebhookUrl: webhook, geminiApiKey: apiKey })
    setSaving(false)
    alert('設定を保存しました')
  }

  if (!settings) return <div className="animate-pulse" style={{ padding: 40, color: 'var(--text-muted)' }}>読み込み中...</div>

  return (
    <div style={{ maxWidth: 720 }}>
      <div className="section-header animate-fade-in-up">
        <h2 className="section-title">連携・Webhook</h2>
        <p className="section-subtitle">外部サービスへの通知先や連携設定を管理します。</p>
      </div>

      <div className="content-panel animate-fade-in-up delay-100" style={{ marginBottom: 24 }}>
        <div className="panel-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(88,101,242,0.15)', border: '1px solid rgba(88,101,242,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="20" height="20" fill="#7289da" viewBox="0 0 24 24"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z"/></svg>
            </div>
            <div>
              <span className="panel-title">Discord Webhook</span>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>レポートやチケットの通知を受け取るチャンネル</p>
            </div>
          </div>
          <StatusBadge label={webhook ? "接続済み" : "未設定"} />
        </div>

        <div style={{ padding: '28px' }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Webhook URL</label>
          <input
            type="password"
            value={webhook}
            onChange={(e) => setWebhook(e.target.value)}
            placeholder="https://discord.com/api/webhooks/..."
            className="input-dark input-mono"
            style={{ width: '100%' }}
          />
        </div>
      </div>

      <div className="content-panel animate-fade-in-up delay-200">
        <div className="panel-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(56,231,180,0.1)', border: '1px solid rgba(56,231,180,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <IconZap />
            </div>
            <div>
              <span className="panel-title">Gemini API Key</span>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>情報の要約に使用するGoogle AIのAPIキー</p>
            </div>
          </div>
          <StatusBadge label={apiKey ? "設定済み" : "未設定"} />
        </div>

        <div style={{ padding: '28px' }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>API Key</label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="AIzaSy..."
            className="input-dark input-mono"
            style={{ width: '100%', marginBottom: 24 }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? '保存中...' : '設定を保存'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const NAV = [
  { id: 'dashboard', label: 'ダッシュボード', Icon: IconDashboard },
  { id: 'artists', label: 'アーティスト管理', Icon: IconArtists },
  { id: 'schedule', label: 'スケジュール設定', Icon: IconSchedule },
  { id: 'integrations', label: '連携・Webhook', Icon: IconIntegrations },
]

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const { artists, loading, error, addArtist, deleteArtist, runArtist } = useArtists()
  const { settings, updateGeneralSettings, updateSchedule } = useSettings()

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardContent artists={artists} loading={loading} />
      case 'artists': return <ArtistsContent artists={artists} loading={loading} addArtist={addArtist} deleteArtist={deleteArtist} runArtist={runArtist} />
      case 'schedule': return <ScheduleContent settings={settings} updateSchedule={updateSchedule} />
      case 'integrations': return <IntegrationsContent settings={settings} updateGeneralSettings={updateGeneralSettings} />
      default: return null
    }
  }

  return (
    <>
      <div className="bg-mesh" />

      {/* Sidebar */}
      <aside className="sidebar">
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 40, padding: '0 4px' }}>
          <div style={{
            width: 38, height: 38, borderRadius: 12,
            background: 'linear-gradient(135deg, #38e7b4, #6366f1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px rgba(56,231,180,0.3)',
          }}>
            <IconZap />
          </div>
          <div>
            <span style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em', display: 'block' }}>OpenClaw</span>
            <span className="mono" style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>v2.0 · BETA</span>
          </div>
        </div>

        {/* Nav label */}
        <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '0 14px', marginBottom: 8 }}>メニュー</p>

        {/* Nav items */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
          {NAV.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`nav-item ${activeTab === id ? 'active' : ''}`}
            >
              <Icon />
              {label}
            </button>
          ))}
        </nav>

        {/* User profile */}
        <div style={{
          marginTop: 'auto',
          padding: '14px',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 14,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, rgba(99,102,241,0.4), rgba(56,231,180,0.2))',
            border: '1px solid rgba(99,102,241,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 800, color: '#818cf8', flexShrink: 0,
          }}>IK</div>
          <div style={{ overflow: 'hidden' }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Ibuki Kimpara</p>
            <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Admin</p>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="main-content">
        {renderContent()}
      </main>
    </>
  )
}

export default App
