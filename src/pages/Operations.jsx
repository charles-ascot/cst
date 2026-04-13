import { useState, useEffect } from 'react'
import {
  GOLD, GOLD_LIGHT, GOLD_DIM, BG_PANEL, BORDER, BORDER_ACTIVE,
  TEXT, TEXT_DIM, FONT_UI, FONT_MONO, FONT_SERIF,
} from '../theme.js'

const FSU4_URL  = import.meta.env.VITE_FSU4_URL  || 'https://fsu4-lssrjnis3q-nw.a.run.app'
const FSU4C_URL = import.meta.env.VITE_FSU4C_URL || 'https://fsu4c-lssrjnis3q-nw.a.run.app'
const FSU4_KEY  = import.meta.env.VITE_FSU4_API_KEY
const FSU4C_KEY = import.meta.env.VITE_FSU4C_API_KEY

// ── Shared helpers ────────────────────────────────────────────────────────────

function StatusDot({ status }) {
  const colour = status === 'ok' ? '#3ddc84' : status === 'loading' ? GOLD : '#c05050'
  const label  = status === 'ok' ? 'LIVE' : status === 'loading' ? 'LOADING' : 'ERROR'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: FONT_MONO, fontSize: 9, letterSpacing: '0.15em', color: colour }}>
      <span style={{
        display: 'inline-block', width: 6, height: 6, borderRadius: '50%',
        background: colour, boxShadow: `0 0 5px ${colour}`,
        animation: status === 'ok' ? 'blink 2s ease-in-out infinite' : 'none',
      }} />
      {label}
    </div>
  )
}

function Panel({ label, fsu, status, children }) {
  return (
    <div style={{ border: `1px solid ${BORDER}`, background: BG_PANEL, marginBottom: 28 }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 20px', borderBottom: `1px solid ${BORDER}`,
        background: 'rgba(0,0,0,0.2)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ fontFamily: FONT_UI, fontSize: 11, fontWeight: 700, letterSpacing: '0.35em', color: TEXT }}>
            {label}
          </div>
          <div style={{ fontFamily: FONT_MONO, fontSize: 9, letterSpacing: '0.2em', color: GOLD_DIM, paddingLeft: 16, borderLeft: `1px solid ${BORDER}` }}>
            {fsu}
          </div>
        </div>
        <StatusDot status={status} />
      </div>
      {children}
    </div>
  )
}

function ErrorMsg({ msg }) {
  return (
    <div style={{ padding: '32px 20px', fontFamily: FONT_MONO, fontSize: 10, letterSpacing: '0.15em', color: '#c05050', textAlign: 'center' }}>
      ✕ {msg}
    </div>
  )
}

function Skeleton({ width = '60%', height = 10 }) {
  return (
    <div style={{ height, borderRadius: 2, background: 'rgba(184,146,74,0.06)', width }} />
  )
}

// ── Bar chart row ─────────────────────────────────────────────────────────────

const INTENT_COLOURS = {
  action_required: '#c05050',
  alert:           '#e07030',
  report:          '#d4aa6a',
  data_payload:    '#64a0ff',
  informational:   '#7a8a7a',
}

const URGENCY_COLOURS = {
  high:   '#c05050',
  medium: GOLD,
  low:    '#7a8a7a',
}

function BarRow({ label, value, total, colour }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontFamily: FONT_UI, fontSize: 11, color: TEXT_DIM, textTransform: 'capitalize', letterSpacing: '0.04em' }}>
          {label.replace(/_/g, ' ')}
        </span>
        <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: colour || GOLD }}>
          {value} <span style={{ color: TEXT_DIM, fontSize: 9 }}>({pct}%)</span>
        </span>
      </div>
      <div style={{ height: 3, background: 'rgba(255,255,255,0.05)', borderRadius: 2 }}>
        <div style={{
          height: '100%', borderRadius: 2,
          width: `${pct}%`,
          background: colour || GOLD,
          transition: 'width 0.8s ease',
        }} />
      </div>
    </div>
  )
}

// ── Stat tile ─────────────────────────────────────────────────────────────────

function StatTile({ label, value, sub, colour }) {
  return (
    <div style={{
      border: `1px solid ${BORDER}`, padding: '16px 20px',
      background: 'rgba(0,0,0,0.15)',
    }}>
      <div style={{ fontFamily: FONT_MONO, fontSize: 9, letterSpacing: '0.2em', color: GOLD_DIM, marginBottom: 8 }}>
        {label}
      </div>
      <div style={{ fontFamily: FONT_SERIF, fontSize: 32, fontWeight: 300, color: colour || GOLD, lineHeight: 1 }}>
        {value}
      </div>
      {sub && (
        <div style={{ fontFamily: FONT_MONO, fontSize: 9, letterSpacing: '0.12em', color: TEXT_DIM, marginTop: 6 }}>
          {sub}
        </div>
      )}
    </div>
  )
}

// ── FSU4 — Email Intelligence ─────────────────────────────────────────────────

function EmailIngestCard() {
  const [metrics, setMetrics] = useState(null)
  const [status, setStatus]   = useState('loading')
  const [error, setError]     = useState(null)

  useEffect(() => {
    if (!FSU4_KEY) { setStatus('error'); setError('VITE_FSU4_API_KEY not configured'); return }
    fetch(`${FSU4_URL}/v1/registry/metrics`, {
      headers: { 'X-Chimera-API-Key': FSU4_KEY },
    })
      .then(r => r.ok ? r.json() : r.json().then(e => Promise.reject(e.detail || 'FSU4 error')))
      .then(json => { setMetrics(json.data); setStatus('ok') })
      .catch(e => { setStatus('error'); setError(String(e)) })
  }, [])

  const total    = metrics?.total_records ?? 0
  const complete = metrics?.by_status?.complete ?? 0
  const skipped  = metrics?.by_status?.skipped ?? 0
  const high     = metrics?.by_urgency?.high ?? 0
  const actionRequired = metrics?.by_intent?.action_required ?? 0
  const completionPct  = total > 0 ? Math.round((complete / total) * 100) : 0

  return (
    <Panel label="CHIMERA EMAIL INGEST" fsu="FSU-4" status={status}>
      {status === 'error' && <ErrorMsg msg={error} />}

      {status === 'loading' && (
        <div style={{ padding: 24, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} style={{ border: `1px solid ${BORDER}`, padding: '16px 20px', height: 90 }}>
              <Skeleton width="50%" height={8} />
            </div>
          ))}
        </div>
      )}

      {status === 'ok' && metrics && (
        <>
          {/* Stat tiles */}
          <div style={{ padding: '20px 20px 0', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            <StatTile label="TOTAL RECORDS" value={total} sub="EMAILS INGESTED" />
            <StatTile label="PROCESSED" value={complete} sub={`${completionPct}% COMPLETION`} colour="#3ddc84" />
            <StatTile label="ACTION REQUIRED" value={actionRequired} sub="PENDING REVIEW" colour={actionRequired > 0 ? '#c05050' : TEXT_DIM} />
            <StatTile label="HIGH URGENCY" value={high} sub="CRITICAL ITEMS" colour={high > 0 ? '#e07030' : TEXT_DIM} />
          </div>

          {/* Breakdown charts */}
          <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {/* By intent */}
            <div style={{ border: `1px solid ${BORDER}`, padding: '16px 18px' }}>
              <div style={{ fontFamily: FONT_MONO, fontSize: 9, letterSpacing: '0.2em', color: GOLD_DIM, marginBottom: 16 }}>
                BY INTENT
              </div>
              {Object.entries(metrics.by_intent || {})
                .sort(([, a], [, b]) => b - a)
                .map(([key, val]) => (
                  <BarRow key={key} label={key} value={val} total={total} colour={INTENT_COLOURS[key]} />
                ))}
            </div>

            {/* By urgency */}
            <div style={{ border: `1px solid ${BORDER}`, padding: '16px 18px' }}>
              <div style={{ fontFamily: FONT_MONO, fontSize: 9, letterSpacing: '0.2em', color: GOLD_DIM, marginBottom: 16 }}>
                BY URGENCY
              </div>
              {Object.entries(metrics.by_urgency || {})
                .sort(([, a], [, b]) => b - a)
                .map(([key, val]) => (
                  <BarRow key={key} label={key} value={val} total={total} colour={URGENCY_COLOURS[key]} />
                ))}

              <div style={{ marginTop: 16, paddingTop: 14, borderTop: `1px solid ${BORDER}` }}>
                <div style={{ fontFamily: FONT_MONO, fontSize: 9, letterSpacing: '0.2em', color: GOLD_DIM, marginBottom: 12 }}>
                  BY STATUS
                </div>
                {Object.entries(metrics.by_status || {}).map(([key, val]) => (
                  <BarRow key={key} label={key} value={val} total={total}
                    colour={key === 'complete' ? '#3ddc84' : key === 'skipped' ? TEXT_DIM : GOLD}
                  />
                ))}
              </div>
            </div>
          </div>

          <div style={{
            padding: '8px 20px', borderTop: `1px solid ${BORDER}`,
            fontFamily: FONT_MONO, fontSize: 8, letterSpacing: '0.15em', color: GOLD_DIM,
          }}>
            SOURCE: GMAIL → CLAUDE AI → FIRESTORE VIA FSU-4
          </div>
        </>
      )}
    </Panel>
  )
}

// ── FSU4C — Chat Intelligence ─────────────────────────────────────────────────

function ChatIngestCard() {
  const [metrics, setMetrics] = useState(null)
  const [status, setStatus]   = useState('loading')
  const [error, setError]     = useState(null)

  useEffect(() => {
    if (!FSU4C_KEY) { setStatus('error'); setError('VITE_FSU4C_API_KEY not configured'); return }
    fetch(`${FSU4C_URL}/v1/registry/metrics`, {
      headers: { 'X-Chimera-API-Key': FSU4C_KEY },
    })
      .then(r => r.ok ? r.json() : r.json().then(e => Promise.reject(e.detail || 'FSU4C error')))
      .then(json => { setMetrics(json.data); setStatus('ok') })
      .catch(e => { setStatus('error'); setError(String(e)) })
  }, [])

  const total    = metrics?.total_records ?? 0
  const complete = metrics?.by_status?.complete ?? 0
  const completionPct = total > 0 ? Math.round((complete / total) * 100) : 0
  const spaces   = Object.entries(metrics?.by_space || {})
  const topSpace = spaces.length > 0 ? spaces.sort(([,a],[,b]) => b - a)[0] : null

  return (
    <Panel label="CHIMERA GOOGLE CHAT INGEST" fsu="FSU-4C" status={status}>
      {status === 'error' && <ErrorMsg msg={error} />}

      {status === 'loading' && (
        <div style={{ padding: 24, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {[...Array(3)].map((_, i) => (
            <div key={i} style={{ border: `1px solid ${BORDER}`, padding: '16px 20px', height: 90 }}>
              <Skeleton width="50%" height={8} />
            </div>
          ))}
        </div>
      )}

      {status === 'ok' && metrics && (
        <>
          {/* Stat tiles */}
          <div style={{ padding: '20px 20px 0', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            <StatTile label="TOTAL MESSAGES" value={total} sub="CHAT RECORDS" />
            <StatTile label="PROCESSED" value={complete} sub={`${completionPct}% COMPLETION`} colour="#3ddc84" />
            <StatTile label="ACTIVE SPACES" value={spaces.length} sub={topSpace ? topSpace[0].toUpperCase() : 'NO SPACES'} colour={GOLD_LIGHT} />
          </div>

          {/* By space */}
          <div style={{ padding: '20px' }}>
            <div style={{ border: `1px solid ${BORDER}`, padding: '16px 18px' }}>
              <div style={{ fontFamily: FONT_MONO, fontSize: 9, letterSpacing: '0.2em', color: GOLD_DIM, marginBottom: 16 }}>
                BY CHAT SPACE
              </div>
              {spaces
                .sort(([,a],[,b]) => b - a)
                .map(([space, count]) => (
                  <BarRow key={space} label={space} value={count} total={total} colour={GOLD} />
                ))}
            </div>
          </div>

          <div style={{
            padding: '8px 20px', borderTop: `1px solid ${BORDER}`,
            fontFamily: FONT_MONO, fontSize: 8, letterSpacing: '0.15em', color: GOLD_DIM,
          }}>
            SOURCE: GOOGLE CHAT → OCR + CLASSIFICATION → FIRESTORE VIA FSU-4C
          </div>
        </>
      )}
    </Panel>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Operations() {
  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      <EmailIngestCard />
      <ChatIngestCard />
    </div>
  )
}
