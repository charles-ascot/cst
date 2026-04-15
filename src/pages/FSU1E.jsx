import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  GOLD, GOLD_LIGHT, GOLD_DIM, BG_PANEL, BORDER, BORDER_ACTIVE,
  TEXT, TEXT_DIM, FONT_UI, FONT_MONO, FONT_SERIF,
} from '../theme.js'

const FSU1E_URL = import.meta.env.VITE_FSU1E_URL || ''
const FSU1E_KEY = import.meta.env.VITE_FSU1E_API_KEY

// ── Helpers ──────────────────────────────────────────────────────────────────

function apiFetch(path, options = {}) {
  const { method = 'GET', body } = options
  return fetch(`${FSU1E_URL}${path}`, {
    method,
    headers: {
      ...(FSU1E_KEY ? { 'X-API-Key': FSU1E_KEY } : {}),
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  }).then(r => r.ok ? r.json() : r.json().then(e => Promise.reject(e.detail || `HTTP ${r.status}`)))
}

function fmtNum(n) {
  if (n == null) return '—'
  return n.toLocaleString('en-GB')
}

function fmtTs(ts) {
  if (!ts) return '—'
  const d = new Date(ts)
  return d.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
}

function fmtDate(ds) {
  if (!ds) return '—'
  return ds
}

// ── Shared UI Components ─────────────────────────────────────────────────────

const MODE_COLOURS = {
  DOWNLOADING: '#3ddc84',
  BACKFILL:    '#3ddc84',
  SYNC:        '#64a0ff',
  SYNCING:     '#64a0ff',
  IDLE:        GOLD,
  ERROR:       '#c05050',
}

const HEALTH_COLOURS = {
  healthy:  '#3ddc84',
  degraded: '#e07030',
  error:    '#c05050',
}

function StatusPill({ mode }) {
  const colour = MODE_COLOURS[mode] || GOLD_DIM
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '3px 10px',
      border: `1px solid ${colour}44`,
      background: `${colour}14`,
      fontFamily: FONT_MONO, fontSize: 9, letterSpacing: '0.15em', color: colour,
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: '50%',
        background: colour, boxShadow: `0 0 5px ${colour}`,
        animation: (mode === 'DOWNLOADING' || mode === 'BACKFILL' || mode === 'SYNCING' || mode === 'SYNC')
          ? 'blink 2s ease-in-out infinite' : 'none',
      }} />
      {mode || 'UNKNOWN'}
    </span>
  )
}

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
          {fsu && (
            <div style={{ fontFamily: FONT_MONO, fontSize: 9, letterSpacing: '0.2em', color: GOLD_DIM, paddingLeft: 16, borderLeft: `1px solid ${BORDER}` }}>
              {fsu}
            </div>
          )}
        </div>
        {status && <StatusDot status={status} />}
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

function SectionLabel({ children }) {
  return (
    <div style={{
      fontFamily: FONT_MONO, fontSize: 9, letterSpacing: '0.2em',
      color: GOLD_DIM, marginBottom: 12,
    }}>
      {children}
    </div>
  )
}

function InfoRow({ label, value, colour }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '8px 0', borderBottom: `1px solid ${BORDER}`,
    }}>
      <span style={{ fontFamily: FONT_MONO, fontSize: 9, letterSpacing: '0.15em', color: TEXT_DIM }}>
        {label}
      </span>
      <span style={{ fontFamily: FONT_MONO, fontSize: 10, letterSpacing: '0.1em', color: colour || TEXT }}>
        {value}
      </span>
    </div>
  )
}

function ActionButton({ label, colour, onClick, confirm: confirmMsg, disabled }) {
  const clr = colour || GOLD
  const handleClick = () => {
    if (confirmMsg) {
      if (!window.confirm(confirmMsg)) return
    }
    onClick()
  }
  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      style={{
        background: 'transparent',
        border: `1px solid ${disabled ? BORDER : clr}44`,
        color: disabled ? TEXT_DIM : clr,
        fontFamily: FONT_UI, fontSize: 10, fontWeight: 600,
        letterSpacing: '0.2em', padding: '9px 18px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s', opacity: disabled ? 0.5 : 1,
      }}
      onMouseEnter={e => { if (!disabled) { e.currentTarget.style.background = `${clr}18`; e.currentTarget.style.borderColor = clr } }}
      onMouseLeave={e => { if (!disabled) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = `${clr}44` } }}
    >
      {label}
    </button>
  )
}

function FormInput({ label, value, onChange, readOnly, type = 'text', mono }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontFamily: FONT_MONO, fontSize: 8, letterSpacing: '0.2em', color: GOLD_DIM, marginBottom: 5 }}>
        {label} {readOnly && <span style={{ color: TEXT_DIM }}>(READ-ONLY)</span>}
      </div>
      <input
        type={type}
        value={value || ''}
        onChange={e => onChange && onChange(e.target.value)}
        readOnly={readOnly}
        style={{
          width: '100%',
          background: readOnly ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.25)',
          border: `1px solid ${readOnly ? BORDER : BORDER_ACTIVE}`,
          color: readOnly ? TEXT_DIM : TEXT,
          fontFamily: mono ? FONT_MONO : FONT_UI,
          fontSize: 11, letterSpacing: '0.04em',
          padding: '8px 12px', outline: 'none',
          transition: 'border-color 0.2s',
          opacity: readOnly ? 0.7 : 1,
        }}
        onFocus={e => { if (!readOnly) e.currentTarget.style.borderColor = GOLD }}
        onBlur={e => { if (!readOnly) e.currentTarget.style.borderColor = BORDER_ACTIVE }}
      />
    </div>
  )
}

function FormSelect({ label, value, onChange, options, readOnly }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontFamily: FONT_MONO, fontSize: 8, letterSpacing: '0.2em', color: GOLD_DIM, marginBottom: 5 }}>
        {label} {readOnly && <span style={{ color: TEXT_DIM }}>(READ-ONLY)</span>}
      </div>
      <select
        value={value || ''}
        onChange={e => onChange && onChange(e.target.value)}
        disabled={readOnly}
        style={{
          width: '100%',
          background: readOnly ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.25)',
          border: `1px solid ${readOnly ? BORDER : BORDER_ACTIVE}`,
          color: readOnly ? TEXT_DIM : TEXT,
          fontFamily: FONT_UI, fontSize: 11, letterSpacing: '0.04em',
          padding: '8px 12px', outline: 'none',
          opacity: readOnly ? 0.7 : 1,
        }}
      >
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )
}

function FormToggle({ label, value, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
      <span style={{ fontFamily: FONT_MONO, fontSize: 8, letterSpacing: '0.2em', color: GOLD_DIM }}>
        {label}
      </span>
      <button
        onClick={() => onChange && onChange(!value)}
        style={{
          width: 36, height: 18, borderRadius: 9,
          background: value ? `${GOLD}44` : 'rgba(255,255,255,0.06)',
          border: `1px solid ${value ? GOLD : BORDER}`,
          position: 'relative', cursor: 'pointer',
          transition: 'all 0.2s',
        }}
      >
        <span style={{
          position: 'absolute', top: 2, left: value ? 18 : 2,
          width: 12, height: 12, borderRadius: '50%',
          background: value ? GOLD : TEXT_DIM,
          transition: 'all 0.2s',
        }} />
      </button>
    </div>
  )
}

function MultiSelect({ label, options, selected, onChange }) {
  const toggle = (opt) => {
    if (selected.includes(opt)) {
      onChange(selected.filter(s => s !== opt))
    } else {
      onChange([...selected, opt])
    }
  }
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontFamily: FONT_MONO, fontSize: 8, letterSpacing: '0.2em', color: GOLD_DIM, marginBottom: 8 }}>
        {label}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {options.map(opt => {
          const active = selected.includes(opt)
          return (
            <button
              key={opt}
              onClick={() => toggle(opt)}
              style={{
                background: active ? `${GOLD}18` : 'transparent',
                border: `1px solid ${active ? GOLD : BORDER}`,
                color: active ? GOLD : TEXT_DIM,
                fontFamily: FONT_MONO, fontSize: 8, letterSpacing: '0.1em',
                padding: '4px 10px', cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {opt.toUpperCase()}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── HTTP Status Badge ────────────────────────────────────────────────────────

function HttpBadge({ code }) {
  const c = code >= 200 && code < 300 ? '#3ddc84'
    : code >= 400 && code < 500 ? '#e07030'
    : code >= 500 ? '#c05050'
    : TEXT_DIM
  return (
    <span style={{
      fontFamily: FONT_MONO, fontSize: 9, color: c,
      padding: '1px 6px', border: `1px solid ${c}33`,
      background: `${c}11`,
    }}>
      {code}
    </span>
  )
}

function ActionBadge({ action }) {
  const colours = {
    FETCH_AND_STORE: '#3ddc84',
    RATE_LIMITED:    '#e07030',
    RETRY:          GOLD,
    BACKOFF:        GOLD_DIM,
    ERROR:          '#c05050',
    SYNC_COMPLETE:  '#64a0ff',
  }
  const c = colours[action] || TEXT_DIM
  return (
    <span style={{
      fontFamily: FONT_MONO, fontSize: 8, letterSpacing: '0.1em', color: c,
    }}>
      {action}
    </span>
  )
}

// ── Toast ────────────────────────────────────────────────────────────────────

function Toast({ message, type, onDismiss }) {
  const colour = type === 'success' ? '#3ddc84' : '#c05050'
  useEffect(() => {
    const t = setTimeout(onDismiss, 3500)
    return () => clearTimeout(t)
  }, [onDismiss])
  return (
    <div style={{
      position: 'fixed', top: 68, right: 36, zIndex: 100,
      background: 'rgba(6,6,10,0.95)',
      border: `1px solid ${colour}55`,
      padding: '10px 20px',
      fontFamily: FONT_MONO, fontSize: 10, letterSpacing: '0.12em', color: colour,
      animation: 'fadeIn 0.3s ease',
      backdropFilter: 'blur(8px)',
    }}>
      {type === 'success' ? '✓' : '✕'} {message}
    </div>
  )
}

// ── Header Strip ─────────────────────────────────────────────────────────────

function HeaderStrip({ dashboard, fetchStatus, onStop, onResume, onSync }) {
  const mode = dashboard?.status?.mode
  const now = new Date()
  const utc = now.toISOString().replace('T', ' ').slice(0, 19) + ' UTC'

  return (
    <div style={{
      border: `1px solid ${BORDER}`,
      background: 'rgba(0,0,0,0.25)',
      padding: '14px 20px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      marginBottom: 20,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{
          fontFamily: FONT_MONO, fontSize: 11, fontWeight: 700,
          letterSpacing: '0.2em', color: GOLD,
          padding: '3px 10px',
          border: `1px solid ${GOLD_DIM}`,
          background: 'rgba(184,146,74,0.08)',
        }}>
          FSU-1E
        </div>
        <div style={{
          fontFamily: FONT_UI, fontSize: 13, fontWeight: 600,
          letterSpacing: '0.12em', color: TEXT,
        }}>
          Racing API Historic Ingest
        </div>
        {fetchStatus === 'ok' && <StatusPill mode={mode} />}
        {fetchStatus === 'loading' && (
          <span style={{ fontFamily: FONT_MONO, fontSize: 9, color: GOLD_DIM }}>CONNECTING...</span>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <span style={{ fontFamily: FONT_MONO, fontSize: 9, letterSpacing: '0.12em', color: GOLD_DIM }}>
          {utc}
        </span>
        {fetchStatus === 'ok' && (
          <div style={{ display: 'flex', gap: 8 }}>
            <ActionButton label="STOP" colour="#c05050" onClick={onStop} confirm="Stop the ingest process?" />
            <ActionButton label="RESUME" colour="#3ddc84" onClick={onResume} />
            <ActionButton label="SYNC TODAY" colour={GOLD} onClick={onSync} />
          </div>
        )}
      </div>
    </div>
  )
}

// ── Status Panel ─────────────────────────────────────────────────────────────

function StatusPanel({ status }) {
  if (!status) return null
  const healthColour = HEALTH_COLOURS[status.health] || TEXT_DIM
  const modeColour = MODE_COLOURS[status.mode] || TEXT_DIM

  return (
    <Panel label="SERVICE STATUS" fsu="FSU-1E">
      <div style={{ padding: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
          <InfoRow label="MODE" value={status.mode || '—'} colour={modeColour} />
          <InfoRow label="HEALTH" value={(status.health || '—').toUpperCase()} colour={healthColour} />
          <InfoRow label="UPTIME" value={status.uptime_hours != null ? `${status.uptime_hours}h` : '—'} />
          <InfoRow label="CURRENT TASK" value={status.current_task || '—'} colour={GOLD_LIGHT} />
          <InfoRow label="ETA" value={status.eta || '—'} />
          <InfoRow label="LAST ACTIVITY" value={fmtTs(status.last_activity)} colour="#3ddc84" />
        </div>
        {status.last_error && status.last_error.timestamp && (
          <div style={{
            marginTop: 16, padding: '12px 16px',
            border: `1px solid rgba(192,80,80,0.25)`,
            background: 'rgba(192,80,80,0.05)',
          }}>
            <SectionLabel>LAST ERROR</SectionLabel>
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_DIM }}>
                {fmtTs(status.last_error.timestamp)}
              </span>
              {status.last_error.status_code && (
                <HttpBadge code={status.last_error.status_code} />
              )}
              <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_DIM }}>
                Retry: {status.last_error.retry_outcome || '—'}
              </span>
            </div>
          </div>
        )}
      </div>
    </Panel>
  )
}

// ── Metrics Row ──────────────────────────────────────────────────────────────

function MetricsRow({ metrics }) {
  if (!metrics) return null
  const errRate = metrics.api_error_rate != null ? `${(metrics.api_error_rate * 100).toFixed(1)}%` : '—'

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 28 }}>
      <StatTile
        label="RECORDS DOWNLOADED"
        value={fmtNum(metrics.records_downloaded)}
        sub={`OF ~${fmtNum(metrics.records_estimated)} EST.`}
      />
      <StatTile
        label="DAYS PROCESSED"
        value={fmtNum(metrics.days_processed)}
        sub={`OF ${fmtNum(metrics.days_total)} TOTAL`}
        colour="#3ddc84"
      />
      <StatTile
        label="GCS OBJECTS WRITTEN"
        value={fmtNum(metrics.gcs_objects)}
        sub={metrics.gcs_bucket || '—'}
        colour="#64a0ff"
      />
      <StatTile
        label="API CALLS / ERRORS"
        value={fmtNum(metrics.api_calls)}
        sub={`${fmtNum(metrics.api_errors)} ERRORS · ${errRate}`}
        colour={metrics.api_errors > 0 ? '#e07030' : TEXT_DIM}
      />
    </div>
  )
}

// ── Progress Panel ───────────────────────────────────────────────────────────

function ProgressPanel({ progress }) {
  if (!progress) return null
  const pct = progress.percentage != null ? progress.percentage : 0

  return (
    <Panel label="BACKFILL PROGRESS">
      <div style={{ padding: 20 }}>
        {/* Progress bar */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: TEXT_DIM }}>PROGRESS</span>
            <span style={{ fontFamily: FONT_SERIF, fontSize: 22, fontWeight: 300, color: GOLD, lineHeight: 1 }}>
              {pct.toFixed(1)}%
            </span>
          </div>
          <div style={{ height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 1 }}>
            <div style={{
              height: '100%', borderRadius: 1,
              width: `${Math.min(pct, 100)}%`,
              background: `linear-gradient(90deg, ${GOLD_DIM}, ${GOLD})`,
              transition: 'width 1s ease',
              boxShadow: `0 0 8px ${GOLD}33`,
            }} />
          </div>
        </div>

        {/* Date range and rate */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
          <InfoRow label="START DATE" value={fmtDate(progress.start_date)} />
          <InfoRow label="CURRENT DATE" value={fmtDate(progress.current_date)} colour={GOLD_LIGHT} />
          <InfoRow label="TARGET END DATE" value={fmtDate(progress.target_date)} />
          <InfoRow label="RATE" value={`${progress.rate_actual ?? '—'} / ${progress.rate_max ?? '—'} req/s`} />
          <InfoRow label="EST. COMPLETION" value={fmtTs(progress.est_completion)} colour="#3ddc84" />
        </div>
      </div>
    </Panel>
  )
}

// ── Data Coverage Panel ──────────────────────────────────────────────────────

function CoveragePanel({ coverage, fetchStatus }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <Panel label="DATA COVERAGE" status={fetchStatus}>
      {fetchStatus === 'error' && <ErrorMsg msg="Failed to load coverage data" />}
      {fetchStatus === 'loading' && (
        <div style={{ padding: 20 }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} style={{ height: 10, borderRadius: 2, background: 'rgba(184,146,74,0.06)', width: `${50 + i * 10}%`, marginBottom: 10 }} />
          ))}
        </div>
      )}
      {fetchStatus === 'ok' && coverage && (
        <div style={{ padding: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12, marginBottom: 16 }}>
            <InfoRow label="DATE RANGE" value={`${fmtDate(coverage.earliest_date)} → ${fmtDate(coverage.latest_date)}`} />
            <InfoRow label="REGIONS COVERED" value={fmtNum(coverage.regions_count)} />
            <InfoRow label="BUCKET SIZE" value={coverage.bucket_size_gb != null ? `${coverage.bucket_size_gb} GB` : '—'} />
            <InfoRow
              label="GAPS DETECTED"
              value={fmtNum(coverage.gaps_count)}
              colour={coverage.gaps_count > 0 ? '#e07030' : '#3ddc84'}
            />
          </div>

          {/* Records per region (collapsible) */}
          {coverage.records_per_region && coverage.records_per_region.length > 0 && (
            <div style={{ border: `1px solid ${BORDER}`, marginTop: 12 }}>
              <button
                onClick={() => setExpanded(!expanded)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 16px', background: 'rgba(0,0,0,0.15)',
                  border: 'none', cursor: 'pointer',
                  borderBottom: expanded ? `1px solid ${BORDER}` : 'none',
                }}
              >
                <span style={{ fontFamily: FONT_MONO, fontSize: 9, letterSpacing: '0.2em', color: GOLD_DIM }}>
                  RECORDS PER REGION
                </span>
                <span style={{ fontFamily: FONT_MONO, fontSize: 9, color: GOLD_DIM }}>
                  {expanded ? '▲' : '▼'}
                </span>
              </button>
              {expanded && (
                <div style={{ padding: '8px 0' }}>
                  {coverage.records_per_region.map(r => (
                    <div key={r.region} style={{
                      display: 'flex', justifyContent: 'space-between',
                      padding: '6px 16px', borderBottom: `1px solid ${BORDER}`,
                    }}>
                      <span style={{ fontFamily: FONT_UI, fontSize: 11, color: TEXT }}>{r.region}</span>
                      <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: GOLD }}>{fmtNum(r.count)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </Panel>
  )
}

// ── Settings Panel ───────────────────────────────────────────────────────────

function SettingsPanel({ settings, fetchStatus, onSave }) {
  const [form, setForm] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState(null)

  useEffect(() => {
    if (settings) {
      setForm(JSON.parse(JSON.stringify(settings)))
    }
  }, [settings])

  const update = (group, key, val) => {
    setForm(prev => ({
      ...prev,
      [group]: { ...prev[group], [key]: val },
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    setSaveMsg(null)
    try {
      await onSave(form)
      setSaveMsg({ type: 'success', text: 'Settings saved' })
    } catch (e) {
      setSaveMsg({ type: 'error', text: String(e) })
    }
    setSaving(false)
  }

  const handleCancel = () => {
    if (settings) setForm(JSON.parse(JSON.stringify(settings)))
    setSaveMsg(null)
  }

  const handleTestConnection = async () => {
    setSaveMsg({ type: 'success', text: 'Testing connection...' })
    try {
      await apiFetch('/ui/test-connection')
      setSaveMsg({ type: 'success', text: 'Connection successful' })
    } catch (e) {
      setSaveMsg({ type: 'error', text: `Connection failed: ${e}` })
    }
  }

  if (!form) return null

  const BACKFILL_ENDPOINTS = ['results', 'racecards', 'horses', 'courses', 'jockeys', 'trainers']

  return (
    <Panel label="SETTINGS" fsu="FSU-1E" status={fetchStatus}>
      <div style={{ padding: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>

          {/* API Connection */}
          <div>
            <SectionLabel>API CONNECTION</SectionLabel>
            <FormInput label="BASE URL" value={form.api?.base_url} onChange={v => update('api', 'base_url', v)} mono />
            <FormInput label="USERNAME" value={form.api?.username} readOnly mono />
            <FormInput label="PASSWORD" value="••••••••" readOnly type="password" mono />
            <FormInput label="AUTH METHOD" value={form.api?.auth_method} readOnly />
            <ActionButton label="TEST CONNECTION" colour={GOLD} onClick={handleTestConnection} />
          </div>

          {/* Storage */}
          <div>
            <SectionLabel>STORAGE</SectionLabel>
            <FormInput label="GCS BUCKET" value={form.storage?.gcs_bucket} onChange={v => update('storage', 'gcs_bucket', v)} mono />
            <FormInput label="GCP PROJECT" value={form.storage?.gcp_project} readOnly mono />
            <FormInput label="REGION" value={form.storage?.region} readOnly />
            <FormInput label="STORAGE PATH PATTERN" value={form.storage?.path_pattern} readOnly mono />
            <FormInput label="STORAGE TIER POLICY" value={form.storage?.storage_tier} readOnly />
          </div>

          {/* Rate Control */}
          <div>
            <SectionLabel>RATE CONTROL</SectionLabel>
            <FormInput label="MAX REQUESTS/SECOND" value={form.rate?.max_rps} onChange={v => update('rate', 'max_rps', parseFloat(v) || 0)} type="number" />
            <FormInput label="BACKOFF STRATEGY" value={form.rate?.backoff_strategy} readOnly />
            <FormInput label="MAX RETRIES" value={form.rate?.max_retries} onChange={v => update('rate', 'max_retries', parseInt(v) || 0)} type="number" />
          </div>

          {/* Backfill Configuration */}
          <div>
            <SectionLabel>BACKFILL CONFIGURATION</SectionLabel>
            <FormInput label="START DATE" value={form.backfill?.start_date} onChange={v => update('backfill', 'start_date', v)} type="date" />
            <FormInput label="END DATE" value={form.backfill?.end_date} onChange={v => update('backfill', 'end_date', v)} type="date" />
            <FormToggle label="SKIP EXISTING" value={form.backfill?.skip_existing} onChange={v => update('backfill', 'skip_existing', v)} />
            <MultiSelect
              label="ENDPOINTS TO BACKFILL"
              options={BACKFILL_ENDPOINTS}
              selected={form.backfill?.endpoints || []}
              onChange={v => update('backfill', 'endpoints', v)}
            />
          </div>
        </div>

        {/* Sync Configuration (full width) */}
        <div style={{ marginTop: 20, paddingTop: 20, borderTop: `1px solid ${BORDER}` }}>
          <SectionLabel>SYNC CONFIGURATION</SectionLabel>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>
            <FormSelect
              label="SYNC SCHEDULE"
              value={form.sync?.schedule}
              onChange={v => update('sync', 'schedule', v)}
              options={['daily', 'hourly', 'manual']}
            />
            <FormInput label="SYNC WINDOW TIME" value={form.sync?.window_time} onChange={v => update('sync', 'window_time', v)} type="time" />
            <FormToggle label="AUTO-START ON DEPLOY" value={form.sync?.auto_start} onChange={v => update('sync', 'auto_start', v)} />
          </div>
        </div>

        {/* Save / Cancel */}
        <div style={{ marginTop: 20, paddingTop: 16, borderTop: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', gap: 12 }}>
          <ActionButton label={saving ? 'SAVING...' : 'SAVE'} colour="#3ddc84" onClick={handleSave} disabled={saving} />
          <ActionButton label="CANCEL" colour={TEXT_DIM} onClick={handleCancel} />
          {saveMsg && (
            <span style={{
              fontFamily: FONT_MONO, fontSize: 9, letterSpacing: '0.12em',
              color: saveMsg.type === 'success' ? '#3ddc84' : '#c05050',
              marginLeft: 8,
            }}>
              {saveMsg.type === 'success' ? '✓' : '✕'} {saveMsg.text}
            </span>
          )}
        </div>
      </div>
    </Panel>
  )
}

// ── Activity Log Panel ───────────────────────────────────────────────────────

function ActivityPanel({ fetchStatus }) {
  const [entries, setEntries] = useState([])
  const [total, setTotal]     = useState(0)
  const [page, setPage]       = useState(1)
  const [pages, setPages]     = useState(1)
  const [status, setStatus]   = useState('loading')
  const [error, setError]     = useState(null)
  const [filterAction, setFilterAction] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  const loadActivity = useCallback((p = 1) => {
    if (!FSU1E_URL) { setStatus('error'); setError('FSU1E not configured'); return }
    setStatus('loading')
    let path = `/ui/activity?page=${p}&limit=30`
    if (filterAction) path += `&action=${filterAction}`
    if (filterStatus) path += `&status=${filterStatus}`
    apiFetch(path)
      .then(json => {
        const d = json.data || json
        setEntries(d.entries || [])
        setTotal(d.total || 0)
        setPages(d.pages || 1)
        setPage(p)
        setStatus('ok')
      })
      .catch(e => { setStatus('error'); setError(String(e)) })
  }, [filterAction, filterStatus])

  useEffect(() => { loadActivity(1) }, [loadActivity])

  const ACTION_TYPES = ['', 'FETCH_AND_STORE', 'RATE_LIMITED', 'RETRY', 'BACKOFF', 'ERROR', 'SYNC_COMPLETE']
  const STATUS_CODES = ['', '200', '201', '400', '401', '429', '500']

  return (
    <Panel label="ACTIVITY LOG" fsu="FSU-1E" status={fetchStatus === 'ok' ? status : fetchStatus}>
      {/* Filters */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 16, padding: '12px 20px',
        borderBottom: `1px solid ${BORDER}`, background: 'rgba(0,0,0,0.1)',
      }}>
        <span style={{ fontFamily: FONT_MONO, fontSize: 8, letterSpacing: '0.2em', color: GOLD_DIM }}>FILTER:</span>
        <select
          value={filterAction}
          onChange={e => setFilterAction(e.target.value)}
          style={{
            background: 'rgba(0,0,0,0.25)', border: `1px solid ${BORDER}`,
            color: TEXT, fontFamily: FONT_MONO, fontSize: 9, padding: '4px 8px', outline: 'none',
          }}
        >
          <option value="">ALL ACTIONS</option>
          {ACTION_TYPES.filter(Boolean).map(a => <option key={a} value={a}>{a}</option>)}
        </select>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          style={{
            background: 'rgba(0,0,0,0.25)', border: `1px solid ${BORDER}`,
            color: TEXT, fontFamily: FONT_MONO, fontSize: 9, padding: '4px 8px', outline: 'none',
          }}
        >
          <option value="">ALL STATUS</option>
          {STATUS_CODES.filter(Boolean).map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <button
          onClick={() => loadActivity(1)}
          style={{
            background: 'transparent', border: `1px solid ${BORDER}`,
            color: GOLD_DIM, fontFamily: FONT_MONO, fontSize: 8, letterSpacing: '0.15em',
            padding: '4px 12px', cursor: 'pointer', transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = GOLD; e.currentTarget.style.color = GOLD }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.color = GOLD_DIM }}
        >
          REFRESH
        </button>
        <span style={{ fontFamily: FONT_MONO, fontSize: 8, color: TEXT_DIM, marginLeft: 'auto' }}>
          {fmtNum(total)} ENTRIES
        </span>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
              {['TIMESTAMP', 'ACTION', 'DETAIL', 'RECORDS', 'SIZE', 'STATUS', 'DURATION'].map(h => (
                <th key={h} style={{
                  padding: '9px 16px', textAlign: 'left',
                  fontFamily: FONT_MONO, fontSize: 8, letterSpacing: '0.2em',
                  color: GOLD_DIM, fontWeight: 400, whiteSpace: 'nowrap',
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {status === 'loading' && (
              [...Array(6)].map((_, i) => (
                <tr key={i}>
                  {[...Array(7)].map((__, j) => (
                    <td key={j} style={{ padding: '11px 16px' }}>
                      <div style={{ height: 10, borderRadius: 2, background: 'rgba(184,146,74,0.06)', width: `${40 + Math.random() * 40}%` }} />
                    </td>
                  ))}
                </tr>
              ))
            )}
            {status === 'error' && (
              <tr><td colSpan={7}><ErrorMsg msg={error} /></td></tr>
            )}
            {status === 'ok' && entries.length === 0 && (
              <tr><td colSpan={7}>
                <div style={{ padding: '32px 20px', fontFamily: FONT_MONO, fontSize: 10, letterSpacing: '0.15em', color: TEXT_DIM, textAlign: 'center' }}>
                  NO ACTIVITY ENTRIES
                </div>
              </td></tr>
            )}
            {status === 'ok' && entries.map((e, i) => (
              <tr key={i} style={{
                borderBottom: `1px solid ${BORDER}`,
                background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
              }}>
                <td style={{ padding: '9px 16px', fontFamily: FONT_MONO, fontSize: 9, color: TEXT_DIM, whiteSpace: 'nowrap' }}>
                  {fmtTs(e.timestamp)}
                </td>
                <td style={{ padding: '9px 16px' }}>
                  <ActionBadge action={e.action} />
                </td>
                <td style={{ padding: '9px 16px', fontFamily: FONT_UI, fontSize: 11, color: TEXT, maxWidth: 260 }}>
                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {e.detail || '—'}
                  </div>
                </td>
                <td style={{ padding: '9px 16px', fontFamily: FONT_MONO, fontSize: 10, color: TEXT, textAlign: 'right' }}>
                  {e.records != null ? fmtNum(e.records) : '—'}
                </td>
                <td style={{ padding: '9px 16px', fontFamily: FONT_MONO, fontSize: 9, color: TEXT_DIM, whiteSpace: 'nowrap' }}>
                  {e.size_bytes != null ? `${(e.size_bytes / 1024).toFixed(1)} KB` : '—'}
                </td>
                <td style={{ padding: '9px 16px' }}>
                  {e.status_code ? <HttpBadge code={e.status_code} /> : '—'}
                </td>
                <td style={{ padding: '9px 16px', fontFamily: FONT_MONO, fontSize: 9, color: TEXT_DIM, textAlign: 'right', whiteSpace: 'nowrap' }}>
                  {e.duration_ms != null ? `${e.duration_ms}ms` : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {status === 'ok' && pages > 1 && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 8, padding: '12px 20px', borderTop: `1px solid ${BORDER}`,
        }}>
          <button
            onClick={() => loadActivity(page - 1)}
            disabled={page <= 1}
            style={{
              background: 'transparent', border: `1px solid ${BORDER}`,
              color: page <= 1 ? TEXT_DIM : GOLD_DIM, fontFamily: FONT_MONO, fontSize: 9,
              padding: '4px 10px', cursor: page <= 1 ? 'not-allowed' : 'pointer',
              opacity: page <= 1 ? 0.4 : 1,
            }}
          >
            ←
          </button>
          <span style={{ fontFamily: FONT_MONO, fontSize: 9, letterSpacing: '0.12em', color: TEXT_DIM }}>
            {page} / {pages}
          </span>
          <button
            onClick={() => loadActivity(page + 1)}
            disabled={page >= pages}
            style={{
              background: 'transparent', border: `1px solid ${BORDER}`,
              color: page >= pages ? TEXT_DIM : GOLD_DIM, fontFamily: FONT_MONO, fontSize: 9,
              padding: '4px 10px', cursor: page >= pages ? 'not-allowed' : 'pointer',
              opacity: page >= pages ? 0.4 : 1,
            }}
          >
            →
          </button>
        </div>
      )}
    </Panel>
  )
}

// ── Configuration Reference Panel ────────────────────────────────────────────

function ConfigPanel({ config, fetchStatus }) {
  return (
    <Panel label="CONFIGURATION REFERENCE" status={fetchStatus}>
      {fetchStatus === 'error' && <ErrorMsg msg="Failed to load configuration" />}
      {fetchStatus === 'loading' && (
        <div style={{ padding: 20 }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{ height: 10, borderRadius: 2, background: 'rgba(184,146,74,0.06)', width: `${50 + i * 8}%`, marginBottom: 12 }} />
          ))}
        </div>
      )}
      {fetchStatus === 'ok' && config && (
        <div style={{ padding: 20 }}>
          <InfoRow label="REPO" value={config.repo || '—'} />
          <InfoRow label="SERVICE ACCOUNT" value={config.service_account || '—'} />
          <InfoRow label="CLOUD RUN URL" value={config.cloud_run_url || '—'} />
          <InfoRow label="DEPLOYED AT" value={fmtTs(config.deployed_at)} />
          <InfoRow label="BUILD VERSION" value={config.build_version || '—'} colour={GOLD_LIGHT} />
          <InfoRow label="FIRESTORE COLLECTION" value={config.firestore_collection || '—'} />
          <InfoRow label="SECRET MANAGER SECRET" value={config.secret_name || '—'} />
        </div>
      )}
    </Panel>
  )
}

// ── Controls Panel ───────────────────────────────────────────────────────────

function ControlsPanel({ onStop, onResume, onSync, onForceBackfill, onRestart, gcsConsoleUrl }) {
  const [backfillDate, setBackfillDate] = useState('')

  return (
    <Panel label="CONTROLS" fsu="FSU-1E">
      <div style={{ padding: 20 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
          <ActionButton label="STOP INGEST" colour="#c05050" onClick={onStop} confirm="Are you sure you want to stop the ingest process?" />
          <ActionButton label="RESUME INGEST" colour="#3ddc84" onClick={onResume} />
          <ActionButton label="SYNC TODAY" colour={GOLD} onClick={onSync} />
          <ActionButton label="RESTART SERVICE" colour="#e07030" onClick={onRestart} confirm="Are you sure you want to restart the service?" />
          {gcsConsoleUrl && (
            <a
              href={gcsConsoleUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center',
                background: 'transparent',
                border: `1px solid ${BORDER}`,
                color: GOLD_DIM, fontFamily: FONT_UI, fontSize: 10, fontWeight: 600,
                letterSpacing: '0.2em', padding: '9px 18px',
                textDecoration: 'none', transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = GOLD; e.currentTarget.style.color = GOLD }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.color = GOLD_DIM }}
            >
              VIEW RAW GCS BUCKET ↗
            </a>
          )}
        </div>

        {/* Force backfill */}
        <div style={{ paddingTop: 16, borderTop: `1px solid ${BORDER}` }}>
          <SectionLabel>FORCE BACKFILL FROM DATE</SectionLabel>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <input
                type="date"
                value={backfillDate}
                onChange={e => setBackfillDate(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(0,0,0,0.25)',
                  border: `1px solid ${BORDER_ACTIVE}`,
                  color: TEXT, fontFamily: FONT_MONO, fontSize: 11,
                  padding: '8px 12px', outline: 'none',
                }}
              />
            </div>
            <ActionButton
              label="FORCE BACKFILL"
              colour="#e07030"
              onClick={() => onForceBackfill(backfillDate)}
              confirm={`Force backfill from ${backfillDate}? This will re-download all data from this date forward.`}
              disabled={!backfillDate}
            />
          </div>
        </div>
      </div>
    </Panel>
  )
}

// ── Footer Strip ─────────────────────────────────────────────────────────────

function FooterStrip({ config }) {
  return (
    <div style={{
      border: `1px solid ${BORDER}`,
      background: 'rgba(0,0,0,0.2)',
      padding: '10px 20px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      marginTop: 8,
    }}>
      <span style={{ fontFamily: FONT_MONO, fontSize: 8, letterSpacing: '0.15em', color: GOLD_DIM }}>
        CHIMERA SPORTS TRADING · FRACTIONAL SERVICE UNIT
      </span>
      <div style={{ display: 'flex', gap: 20 }}>
        <span style={{ fontFamily: FONT_MONO, fontSize: 8, letterSpacing: '0.12em', color: TEXT_DIM }}>
          FSU-1E
        </span>
        {config?.repo && (
          <span style={{ fontFamily: FONT_MONO, fontSize: 8, letterSpacing: '0.12em', color: TEXT_DIM }}>
            {config.repo}
          </span>
        )}
        {config?.build_version && (
          <span style={{ fontFamily: FONT_MONO, fontSize: 8, letterSpacing: '0.12em', color: TEXT_DIM }}>
            v{config.build_version}
          </span>
        )}
      </div>
    </div>
  )
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function FSU1E() {
  const navigate = useNavigate()

  // Dashboard (status + metrics + progress) — polled
  const [dashboard, setDashboard]     = useState(null)
  const [dashStatus, setDashStatus]   = useState('loading')
  const [dashError, setDashError]     = useState(null)

  // Coverage
  const [coverage, setCoverage]       = useState(null)
  const [covStatus, setCovStatus]     = useState('loading')

  // Settings
  const [settings, setSettings]       = useState(null)
  const [setStatus, setSetStatus]     = useState('loading')

  // Config reference
  const [config, setConfig]           = useState(null)
  const [cfgStatus, setCfgStatus]     = useState('loading')

  // Toast
  const [toast, setToast]             = useState(null)
  const showToast = (message, type = 'success') => setToast({ message, type })

  // ── Fetch functions ──────────────────────────────────────────────────────

  const fetchDashboard = useCallback(() => {
    if (!FSU1E_URL) {
      setDashStatus('error')
      setDashError('VITE_FSU1E_URL not configured')
      return
    }
    apiFetch('/ui/dashboard')
      .then(json => {
        setDashboard(json.data || json)
        setDashStatus('ok')
      })
      .catch(e => { setDashStatus('error'); setDashError(String(e)) })
  }, [])

  const fetchCoverage = useCallback(() => {
    if (!FSU1E_URL) { setCovStatus('error'); return }
    apiFetch('/ui/coverage')
      .then(json => { setCoverage(json.data || json); setCovStatus('ok') })
      .catch(() => setCovStatus('error'))
  }, [])

  const fetchSettings = useCallback(() => {
    if (!FSU1E_URL) { setSetStatus('error'); return }
    apiFetch('/ui/settings')
      .then(json => { setSettings(json.data || json); setSetStatus('ok') })
      .catch(() => setSetStatus('error'))
  }, [])

  const fetchConfig = useCallback(() => {
    if (!FSU1E_URL) { setCfgStatus('error'); return }
    apiFetch('/ui/config')
      .then(json => { setConfig(json.data || json); setCfgStatus('ok') })
      .catch(() => setCfgStatus('error'))
  }, [])

  // ── Initial load + polling ───────────────────────────────────────────────

  useEffect(() => {
    fetchDashboard()
    fetchCoverage()
    fetchSettings()
    fetchConfig()
  }, [fetchDashboard, fetchCoverage, fetchSettings, fetchConfig])

  useEffect(() => {
    if (!FSU1E_URL) return
    const interval = setInterval(fetchDashboard, 10000)
    return () => clearInterval(interval)
  }, [fetchDashboard])

  // ── Control actions ──────────────────────────────────────────────────────

  const controlAction = async (action, body) => {
    try {
      await apiFetch(`/ui/control/${action}`, { method: 'POST', body })
      showToast(`${action.replace(/-/g, ' ').toUpperCase()} — command sent`)
      setTimeout(fetchDashboard, 1000)
    } catch (e) {
      showToast(`Failed: ${e}`, 'error')
    }
  }

  const handleSaveSettings = async (form) => {
    const json = await apiFetch('/ui/settings', { method: 'PUT', body: form })
    setSettings(json.data || json)
    showToast('Settings saved')
  }

  // ── GCS console URL ──────────────────────────────────────────────────────

  const bucket = dashboard?.metrics?.gcs_bucket || settings?.storage?.gcs_bucket
  const gcsConsoleUrl = bucket
    ? `https://console.cloud.google.com/storage/browser/${bucket}`
    : null

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}

      {/* Breadcrumb */}
      <div style={{ marginBottom: 20 }}>
        <button
          onClick={() => navigate('/fsu-library')}
          style={{
            background: 'transparent', border: 'none',
            fontFamily: FONT_MONO, fontSize: 9, letterSpacing: '0.15em',
            color: GOLD_DIM, cursor: 'pointer', padding: 0,
            transition: 'color 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = GOLD}
          onMouseLeave={e => e.currentTarget.style.color = GOLD_DIM}
        >
          ← FSU LIBRARY
        </button>
      </div>

      {/* Header strip */}
      <HeaderStrip
        dashboard={dashboard}
        fetchStatus={dashStatus}
        onStop={() => controlAction('stop')}
        onResume={() => controlAction('resume')}
        onSync={() => controlAction('sync-today')}
      />

      {/* Error state — show if FSU not configured */}
      {dashStatus === 'error' && (
        <Panel label="RACING API HISTORIC INGEST" fsu="FSU-1E" status="error">
          <ErrorMsg msg={dashError} />
        </Panel>
      )}

      {/* Loading state */}
      {dashStatus === 'loading' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 28 }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} style={{ border: `1px solid ${BORDER}`, padding: '16px 20px', height: 100 }}>
              <div style={{ height: 8, borderRadius: 2, background: 'rgba(184,146,74,0.06)', width: '50%', marginBottom: 12 }} />
              <div style={{ height: 28, borderRadius: 2, background: 'rgba(184,146,74,0.06)', width: '70%' }} />
            </div>
          ))}
        </div>
      )}

      {/* Live data panels */}
      {dashStatus === 'ok' && dashboard && (
        <>
          <StatusPanel status={dashboard.status} />
          <MetricsRow metrics={dashboard.metrics} />
          <ProgressPanel progress={dashboard.progress} />
        </>
      )}

      <CoveragePanel coverage={coverage} fetchStatus={covStatus} />
      <SettingsPanel settings={settings} fetchStatus={setStatus} onSave={handleSaveSettings} />
      <ActivityPanel fetchStatus={dashStatus} />
      <ConfigPanel config={config} fetchStatus={cfgStatus} />
      <ControlsPanel
        onStop={() => controlAction('stop')}
        onResume={() => controlAction('resume')}
        onSync={() => controlAction('sync-today')}
        onForceBackfill={(date) => controlAction('force-backfill', { from_date: date })}
        onRestart={() => controlAction('restart')}
        gcsConsoleUrl={gcsConsoleUrl}
      />
      <FooterStrip config={config} />
    </div>
  )
}
