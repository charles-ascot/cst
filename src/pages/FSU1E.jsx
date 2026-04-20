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

function fmtBytes(b) {
  if (b == null) return '—'
  if (b > 1e12) return `${(b / 1e12).toFixed(1)} TB`
  if (b > 1e9) return `${(b / 1e9).toFixed(1)} GB`
  if (b > 1e6) return `${(b / 1e6).toFixed(1)} MB`
  if (b > 1e3) return `${(b / 1e3).toFixed(1)} KB`
  return `${b} B`
}

function fmtTs(ts) {
  if (!ts) return '—'
  const d = new Date(ts)
  return d.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
}

function fmtEta(secs) {
  if (secs == null) return '—'
  if (secs < 60) return `${secs}s`
  if (secs < 3600) return `${Math.floor(secs / 60)}m ${secs % 60}s`
  const h = Math.floor(secs / 3600)
  const m = Math.floor((secs % 3600) / 60)
  if (h < 24) return `${h}h ${m}m`
  const d = Math.floor(h / 24)
  return `${d}d ${h % 24}h`
}

// ── Shared UI Components ─────────────────────────────────────────────────────

const MODE_COLOURS = {
  IDLE:                 GOLD,
  BACKFILL_RESULTS:     '#3ddc84',
  BACKFILL_RACECARDS:   '#3ddc84',
  BACKFILL_RACE_DETAIL: '#3ddc84',
  ENTITY_DISCOVERY:     '#64a0ff',
  BACKFILL_HORSES:      '#64a0ff',
  BACKFILL_JOCKEYS:     '#64a0ff',
  BACKFILL_TRAINERS:    '#64a0ff',
  BACKFILL_OWNERS:      '#64a0ff',
  BACKFILL_SIRES:       '#64a0ff',
  BACKFILL_DAMS:        '#64a0ff',
  BACKFILL_DAMSIRES:    '#64a0ff',
  SYNC:                 '#d4aa6a',
  ERROR:                '#c05050',
}

const HEALTH_COLOURS = {
  healthy:  '#3ddc84',
  degraded: '#e07030',
  error:    '#c05050',
}

const STATUS_COLOURS = {
  complete:    '#3ddc84',
  in_progress: '#64a0ff',
  not_started: TEXT_DIM,
}

function StatusPill({ mode }) {
  const colour = MODE_COLOURS[mode] || GOLD_DIM
  const active = mode && mode !== 'IDLE' && mode !== 'ERROR'
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
        animation: active ? 'blink 2s ease-in-out infinite' : 'none',
      }} />
      {(mode || 'UNKNOWN').replace(/_/g, ' ')}
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

function Panel({ label, fsu, status, extra, children }) {
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {extra}
          {status && <StatusDot status={status} />}
        </div>
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

function ProgressBar({ pct, colour }) {
  const p = Math.min(Math.max(pct || 0, 0), 100)
  return (
    <div style={{ height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 1, flex: 1 }}>
      <div style={{
        height: '100%', borderRadius: 1,
        width: `${p}%`,
        background: colour || GOLD,
        transition: 'width 1s ease',
      }} />
    </div>
  )
}

function ActionButton({ label, colour, onClick, confirm: confirmMsg, disabled }) {
  const clr = colour || GOLD
  const handleClick = () => {
    if (confirmMsg && !window.confirm(confirmMsg)) return
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
    FETCH_ERROR:     '#c05050',
    RATE_LIMITED:    '#e07030',
    RETRY:          GOLD,
    BACKOFF:        GOLD_DIM,
    ERROR:          '#c05050',
    SYNC_COMPLETE:  '#64a0ff',
  }
  return (
    <span style={{ fontFamily: FONT_MONO, fontSize: 8, letterSpacing: '0.1em', color: colours[action] || TEXT_DIM }}>
      {action}
    </span>
  )
}

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

// ── Dynamic Field Renderer (for /admin/settings contract) ────────────────────

function DynamicField({ field, value, onChange }) {
  const readOnly = !field.editable

  const baseInput = {
    width: '100%',
    background: readOnly ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.25)',
    border: `1px solid ${readOnly ? BORDER : BORDER_ACTIVE}`,
    color: readOnly ? TEXT_DIM : TEXT,
    fontFamily: FONT_MONO, fontSize: 11, letterSpacing: '0.04em',
    padding: '8px 12px', outline: 'none',
    transition: 'border-color 0.2s',
    opacity: readOnly ? 0.7 : 1,
  }

  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontFamily: FONT_MONO, fontSize: 8, letterSpacing: '0.2em', color: GOLD_DIM, marginBottom: 5, display: 'flex', gap: 8, alignItems: 'center' }}>
        {field.label.toUpperCase()}
        {readOnly && <span style={{ color: TEXT_DIM }}>(READ-ONLY)</span>}
      </div>

      {field.type === 'boolean' ? (
        <button
          onClick={() => !readOnly && onChange(!value)}
          disabled={readOnly}
          style={{
            width: 36, height: 18, borderRadius: 9,
            background: value ? `${GOLD}44` : 'rgba(255,255,255,0.06)',
            border: `1px solid ${value ? GOLD : BORDER}`,
            position: 'relative', cursor: readOnly ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s', opacity: readOnly ? 0.5 : 1,
          }}
        >
          <span style={{
            position: 'absolute', top: 2, left: value ? 18 : 2,
            width: 12, height: 12, borderRadius: '50%',
            background: value ? GOLD : TEXT_DIM,
            transition: 'all 0.2s',
          }} />
        </button>
      ) : field.type === 'secret' ? (
        <input type="password" value={value || ''} readOnly style={baseInput} />
      ) : field.type === 'select' ? (
        <select
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          disabled={readOnly}
          style={baseInput}
        >
          {(field.options || []).map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input
          type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
          value={value ?? ''}
          onChange={e => {
            if (readOnly) return
            const v = field.type === 'number' ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value
            onChange(v)
          }}
          readOnly={readOnly}
          style={baseInput}
          onFocus={e => { if (!readOnly) e.currentTarget.style.borderColor = GOLD }}
          onBlur={e => { if (!readOnly) e.currentTarget.style.borderColor = BORDER_ACTIVE }}
        />
      )}

      {field.hint && (
        <div style={{ fontFamily: FONT_MONO, fontSize: 8, color: TEXT_DIM, marginTop: 4, letterSpacing: '0.08em' }}>
          {field.hint}
        </div>
      )}
    </div>
  )
}

// ── Header Strip ─────────────────────────────────────────────────────────────

function HeaderStrip({ health, status, fetchStatus, onSync, onBackfillAll }) {
  const now = new Date()
  const utc = now.toISOString().replace('T', ' ').slice(0, 19) + ' UTC'

  return (
    <div style={{
      border: `1px solid ${BORDER}`,
      background: 'rgba(0,0,0,0.25)',
      padding: '14px 20px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      marginBottom: 20, flexWrap: 'wrap', gap: 12,
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
        {fetchStatus === 'ok' && <StatusPill mode={status?.mode} />}
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
            <ActionButton label="SYNC" colour={GOLD} onClick={onSync} />
            <ActionButton label="BACKFILL ALL" colour="#3ddc84" onClick={onBackfillAll} confirm="Start full coverage backfill across all endpoint groups?" />
          </div>
        )}
      </div>
    </div>
  )
}

// ── Status Panel ─────────────────────────────────────────────────────────────

function StatusPanel({ health, status }) {
  if (!health && !status) return null
  const healthColour = HEALTH_COLOURS[health?.status] || TEXT_DIM
  const modeColour = MODE_COLOURS[status?.mode] || TEXT_DIM

  return (
    <Panel label="SERVICE STATUS" fsu="FSU-1E">
      <div style={{ padding: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
          <InfoRow label="MODE" value={(status?.mode || '—').replace(/_/g, ' ')} colour={modeColour} />
          <InfoRow label="HEALTH" value={(health?.status || '—').toUpperCase()} colour={healthColour} />
          <InfoRow label="UPTIME" value={health?.uptime_seconds != null ? fmtEta(health.uptime_seconds) : '—'} />
          <InfoRow label="VERSION" value={health?.version || '—'} colour={GOLD_LIGHT} />
          <InfoRow label="LAST ACTIVITY" value={fmtTs(status?.last_activity)} colour="#3ddc84" />
          <InfoRow label="ERROR RATE" value={status?.error_rate != null ? `${(status.error_rate * 100).toFixed(1)}%` : '—'} colour={status?.error_rate > 0.05 ? '#e07030' : TEXT_DIM} />
        </div>

        {/* Current progress */}
        {status?.progress && (
          <div style={{
            marginTop: 16, padding: '12px 16px',
            border: `1px solid ${BORDER}`,
            background: 'rgba(0,0,0,0.1)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <SectionLabel>
                CURRENT: {status.progress.current_group ? status.progress.current_group.toUpperCase() : 'BACKFILL'}
              </SectionLabel>
              <span style={{ fontFamily: FONT_SERIF, fontSize: 20, fontWeight: 300, color: GOLD, lineHeight: 1 }}>
                {status.progress.percentage != null ? `${status.progress.percentage.toFixed(1)}%` : '—'}
              </span>
            </div>
            <ProgressBar pct={status.progress.percentage} colour={modeColour} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12, marginTop: 12 }}>
              <InfoRow label="PROGRESS" value={`${fmtNum(status.progress.current)} / ${fmtNum(status.progress.total)}`} />
              <InfoRow label="CURRENT ITEM" value={status.progress.current_item || '—'} colour={GOLD_LIGHT} />
              <InfoRow label="ETA" value={fmtEta(status.progress.eta_seconds)} />
            </div>
          </div>
        )}

        {/* Last error */}
        {health?.last_error && (
          <div style={{
            marginTop: 16, padding: '12px 16px',
            border: `1px solid rgba(192,80,80,0.25)`,
            background: 'rgba(192,80,80,0.05)',
          }}>
            <SectionLabel>LAST ERROR</SectionLabel>
            <div style={{ fontFamily: FONT_MONO, fontSize: 10, color: '#c05050' }}>
              {health.last_error}
            </div>
          </div>
        )}
      </div>
    </Panel>
  )
}

// ── Metrics Row ──────────────────────────────────────────────────────────────

function MetricsRow({ status, stats, coverage }) {
  const totals = coverage?.totals
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 28 }}>
      <StatTile
        label="RECORDS PROCESSED"
        value={fmtNum(status?.records_processed)}
        sub={`${fmtNum(status?.errors_total || 0)} ERRORS`}
      />
      <StatTile
        label="FILES IN BUCKET"
        value={fmtNum(stats?.total_files || totals?.total_files_in_bucket)}
        sub={stats?.date_range ? `${stats.date_range.first} → ${stats.date_range.last}` : '—'}
        colour="#3ddc84"
      />
      <StatTile
        label="STORAGE SIZE"
        value={fmtBytes(totals?.total_size_bytes)}
        sub={totals ? `${totals.endpoints_complete || 0} GROUPS COMPLETE` : '—'}
        colour="#64a0ff"
      />
      <StatTile
        label="GAPS DETECTED"
        value={fmtNum(stats?.gaps_count)}
        sub={stats?.gaps?.length > 0 ? stats.gaps.slice(0, 3).join(', ') : 'NONE'}
        colour={stats?.gaps_count > 0 ? '#e07030' : TEXT_DIM}
      />
    </div>
  )
}

// ── Coverage Panel ───────────────────────────────────────────────────────────

function CoverageGroupRow({ group, onBackfill }) {
  const statusColour = STATUS_COLOURS[group.status] || TEXT_DIM
  const isDateRange = group.type === 'date_range'
  const isEntity = group.type === 'entity'

  let pct = 0
  if (isDateRange && group.days_total > 0) pct = (group.days_done / group.days_total) * 100
  if (isEntity && group.discovered > 0) {
    const fetched = Math.min(group.fetched_profiles || 0, group.fetched_results || 0)
    pct = (fetched / group.discovered) * 100
  }

  return (
    <div style={{
      padding: '12px 16px',
      borderBottom: `1px solid ${BORDER}`,
    }}>
      {/* Row header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontFamily: FONT_UI, fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', color: TEXT }}>
            {group.name.toUpperCase().replace(/_/g, ' ')}
          </span>
          <span style={{
            fontFamily: FONT_MONO, fontSize: 8, letterSpacing: '0.12em',
            color: statusColour, padding: '1px 8px',
            border: `1px solid ${statusColour}33`,
            background: `${statusColour}11`,
          }}>
            {(group.status || 'unknown').replace(/_/g, ' ').toUpperCase()}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: GOLD }}>
            {pct.toFixed(1)}%
          </span>
          {onBackfill && group.status !== 'complete' && (
            <button
              onClick={() => onBackfill(group.name)}
              style={{
                background: 'transparent', border: `1px solid ${BORDER}`,
                color: GOLD_DIM, fontFamily: FONT_MONO, fontSize: 7, letterSpacing: '0.15em',
                padding: '3px 8px', cursor: 'pointer', transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = GOLD; e.currentTarget.style.color = GOLD }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.color = GOLD_DIM }}
            >
              BACKFILL
            </button>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <ProgressBar pct={pct} colour={statusColour} />

      {/* Detail row */}
      <div style={{ display: 'flex', gap: 20, marginTop: 8, flexWrap: 'wrap' }}>
        {isDateRange && (
          <>
            <span style={{ fontFamily: FONT_MONO, fontSize: 9, color: TEXT_DIM }}>
              {group.earliest || '—'} → {group.latest || '—'}
            </span>
            <span style={{ fontFamily: FONT_MONO, fontSize: 9, color: TEXT_DIM }}>
              {fmtNum(group.days_done)} / {fmtNum(group.days_total)} days
            </span>
            {group.gaps && group.gaps.length > 0 && (
              <span style={{ fontFamily: FONT_MONO, fontSize: 9, color: '#e07030' }}>
                {group.gaps.length} GAPS
              </span>
            )}
          </>
        )}
        {isEntity && (
          <>
            <span style={{ fontFamily: FONT_MONO, fontSize: 9, color: TEXT_DIM }}>
              {fmtNum(group.discovered)} DISCOVERED
            </span>
            {Object.entries(group).filter(([k]) => k.startsWith('fetched_')).map(([k, v]) => (
              <span key={k} style={{ fontFamily: FONT_MONO, fontSize: 9, color: TEXT_DIM }}>
                {fmtNum(v)} {k.replace('fetched_', '').toUpperCase()}
              </span>
            ))}
            {group.failed > 0 && (
              <span style={{ fontFamily: FONT_MONO, fontSize: 9, color: '#c05050' }}>
                {fmtNum(group.failed)} FAILED
              </span>
            )}
            <span style={{ fontFamily: FONT_MONO, fontSize: 9, color: GOLD_DIM }}>
              {fmtNum(group.remaining)} REMAINING
            </span>
          </>
        )}
      </div>
    </div>
  )
}

function CoveragePanel({ coverage, fetchStatus, onBackfillGroup }) {
  return (
    <Panel label="ENDPOINT COVERAGE" fsu="FSU-1E" status={fetchStatus}>
      {fetchStatus === 'error' && <ErrorMsg msg="Failed to load coverage data" />}
      {fetchStatus === 'loading' && (
        <div style={{ padding: 20 }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{ height: 10, borderRadius: 2, background: 'rgba(184,146,74,0.06)', width: `${50 + i * 8}%`, marginBottom: 14 }} />
          ))}
        </div>
      )}
      {fetchStatus === 'ok' && coverage && (
        <>
          {(coverage.endpoint_groups || []).map(g => (
            <CoverageGroupRow key={g.name} group={g} onBackfill={onBackfillGroup} />
          ))}

          {/* Totals */}
          {coverage.totals && (
            <div style={{
              padding: '12px 20px',
              display: 'flex', gap: 24, flexWrap: 'wrap',
              fontFamily: FONT_MONO, fontSize: 9, letterSpacing: '0.12em',
            }}>
              <span style={{ color: '#3ddc84' }}>
                {coverage.totals.endpoints_complete || 0} COMPLETE
              </span>
              <span style={{ color: '#64a0ff' }}>
                {coverage.totals.endpoints_in_progress || 0} IN PROGRESS
              </span>
              <span style={{ color: TEXT_DIM }}>
                {coverage.totals.endpoints_not_started || 0} NOT STARTED
              </span>
              <span style={{ color: GOLD_DIM, marginLeft: 'auto' }}>
                {fmtNum(coverage.totals.total_files_in_bucket)} FILES · {fmtBytes(coverage.totals.total_size_bytes)}
              </span>
            </div>
          )}
        </>
      )}
    </Panel>
  )
}

// ── Settings Panel (dynamic from /admin/settings) ────────────────────────────

function SettingsPanel({ settings, fetchStatus, onSave }) {
  const [formValues, setFormValues] = useState({})
  const [originalValues, setOriginalValues] = useState({})
  const [saving, setSaving] = useState(false)
  const [saveResult, setSaveResult] = useState(null)

  useEffect(() => {
    if (!settings?.groups) return
    const vals = {}
    settings.groups.forEach(g => g.fields.forEach(f => { vals[f.key] = f.value }))
    setFormValues(vals)
    setOriginalValues(vals)
  }, [settings])

  const handleChange = (key, val) => {
    setFormValues(prev => ({ ...prev, [key]: val }))
    setSaveResult(null)
  }

  const getChangedEditable = () => {
    if (!settings?.groups) return {}
    const updates = {}
    settings.groups.forEach(g => g.fields.forEach(f => {
      if (f.editable && formValues[f.key] !== originalValues[f.key]) {
        updates[f.key] = formValues[f.key]
      }
    }))
    return updates
  }

  const handleSave = async () => {
    const updates = getChangedEditable()
    if (Object.keys(updates).length === 0) {
      setSaveResult({ type: 'info', text: 'No changes to save' })
      return
    }
    setSaving(true)
    setSaveResult(null)
    try {
      const json = await onSave(updates)
      setSaveResult({
        type: 'success',
        text: `Saved: ${(json.applied || []).join(', ')}${json.rejected?.length ? ` | Rejected: ${json.rejected.map(r => r.key || r).join(', ')}` : ''}`,
      })
    } catch (e) {
      setSaveResult({ type: 'error', text: String(e) })
    }
    setSaving(false)
  }

  const handleCancel = () => {
    setFormValues({ ...originalValues })
    setSaveResult(null)
  }

  if (!settings?.groups) return null

  return (
    <Panel label="SETTINGS" fsu="FSU-1E" status={fetchStatus}
      extra={settings.version != null && (
        <span style={{ fontFamily: FONT_MONO, fontSize: 8, color: TEXT_DIM, letterSpacing: '0.12em' }}>
          v{settings.version} · {fmtTs(settings.updated_at)}
        </span>
      )}
    >
      <div style={{ padding: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
          {settings.groups.map(group => (
            <div key={group.id}>
              <SectionLabel>{group.label.toUpperCase()}</SectionLabel>
              {group.fields.map(field => (
                <DynamicField
                  key={field.key}
                  field={field}
                  value={formValues[field.key]}
                  onChange={v => handleChange(field.key, v)}
                />
              ))}
            </div>
          ))}
        </div>

        {/* Save / Cancel */}
        <div style={{ marginTop: 20, paddingTop: 16, borderTop: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', gap: 12 }}>
          <ActionButton label={saving ? 'SAVING...' : 'SAVE'} colour="#3ddc84" onClick={handleSave} disabled={saving} />
          <ActionButton label="CANCEL" colour={TEXT_DIM} onClick={handleCancel} />
          {saveResult && (
            <span style={{
              fontFamily: FONT_MONO, fontSize: 9, letterSpacing: '0.12em', marginLeft: 8,
              color: saveResult.type === 'success' ? '#3ddc84' : saveResult.type === 'error' ? '#c05050' : GOLD_DIM,
            }}>
              {saveResult.type === 'success' ? '✓' : saveResult.type === 'error' ? '✕' : '—'} {saveResult.text}
            </span>
          )}
        </div>
      </div>
    </Panel>
  )
}

// ── Activity Log Panel ───────────────────────────────────────────────────────

function ActivityPanel({ liveEntries }) {
  const [entries, setEntries]   = useState([])
  const [total, setTotal]       = useState(0)
  const [offset, setOffset]     = useState(0)
  const [status, setStatus]     = useState('loading')
  const [error, setError]       = useState(null)
  const [filterAction, setFilterAction] = useState('')
  const limit = 30

  const loadLogs = useCallback((off = 0) => {
    if (!FSU1E_URL) { setStatus('error'); setError('FSU1E not configured'); return }
    setStatus('loading')
    let path = `/admin/logs?limit=${limit}&offset=${off}`
    apiFetch(path)
      .then(json => {
        setEntries(json.entries || [])
        setTotal(json.total || 0)
        setOffset(off)
        setStatus('ok')
      })
      .catch(e => { setStatus('error'); setError(String(e)) })
  }, [])

  useEffect(() => { loadLogs(0) }, [loadLogs])

  const pages = Math.ceil(total / limit)
  const page = Math.floor(offset / limit) + 1

  const ACTION_TYPES = ['FETCH_AND_STORE', 'FETCH_ERROR']

  // Merge live SSE entries at the top when on first page
  const displayEntries = offset === 0
    ? [...liveEntries.filter(le => !entries.find(e => e.timestamp === le.timestamp)), ...entries].slice(0, limit)
    : entries

  const filtered = filterAction
    ? displayEntries.filter(e => e.action === filterAction)
    : displayEntries

  return (
    <Panel label="ACTIVITY LOG" fsu="FSU-1E" status={status}
      extra={
        <span style={{ fontFamily: FONT_MONO, fontSize: 8, color: TEXT_DIM }}>
          {liveEntries.length > 0 && <span style={{ color: '#3ddc84', marginRight: 8 }}>SSE LIVE</span>}
          {fmtNum(total)} ENTRIES
        </span>
      }
    >
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
          {ACTION_TYPES.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
        <button
          onClick={() => loadLogs(0)}
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
            {status === 'ok' && filtered.length === 0 && (
              <tr><td colSpan={7}>
                <div style={{ padding: '32px 20px', fontFamily: FONT_MONO, fontSize: 10, letterSpacing: '0.15em', color: TEXT_DIM, textAlign: 'center' }}>
                  NO ACTIVITY ENTRIES
                </div>
              </td></tr>
            )}
            {status === 'ok' && filtered.map((e, i) => (
              <tr key={`${e.timestamp}-${i}`} style={{
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
                  {e.size_bytes != null ? fmtBytes(e.size_bytes) : '—'}
                </td>
                <td style={{ padding: '9px 16px' }}>
                  {e.status ? <HttpBadge code={e.status} /> : '—'}
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
            onClick={() => loadLogs(offset - limit)}
            disabled={offset <= 0}
            style={{
              background: 'transparent', border: `1px solid ${BORDER}`,
              color: offset <= 0 ? TEXT_DIM : GOLD_DIM, fontFamily: FONT_MONO, fontSize: 9,
              padding: '4px 10px', cursor: offset <= 0 ? 'not-allowed' : 'pointer',
              opacity: offset <= 0 ? 0.4 : 1,
            }}
          >
            ←
          </button>
          <span style={{ fontFamily: FONT_MONO, fontSize: 9, letterSpacing: '0.12em', color: TEXT_DIM }}>
            {page} / {pages}
          </span>
          <button
            onClick={() => loadLogs(offset + limit)}
            disabled={offset + limit >= total}
            style={{
              background: 'transparent', border: `1px solid ${BORDER}`,
              color: offset + limit >= total ? TEXT_DIM : GOLD_DIM, fontFamily: FONT_MONO, fontSize: 9,
              padding: '4px 10px', cursor: offset + limit >= total ? 'not-allowed' : 'pointer',
              opacity: offset + limit >= total ? 0.4 : 1,
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
          <InfoRow label="FSU ID" value={config.fsu_id || '—'} colour={GOLD_LIGHT} />
          <InfoRow label="REPO" value={config.repo || '—'} />
          <InfoRow label="GCP PROJECT" value={config.gcp_project || '—'} />
          <InfoRow label="REGION" value={config.region || '—'} />
          <InfoRow label="GCS BUCKET" value={config.bucket || '—'} />
          <InfoRow label="FIRESTORE COLLECTION" value={config.firestore_collection || '—'} />
          <InfoRow label="SERVICE ACCOUNT" value={config.service_account || '—'} />
          <InfoRow label="CLOUD RUN URL" value={config.cloud_run_url || '—'} />
          <InfoRow label="DEPLOYED AT" value={fmtTs(config.deployed_at)} />
        </div>
      )}
    </Panel>
  )
}

// ── Controls Panel ───────────────────────────────────────────────────────────

const ENDPOINT_GROUPS = [
  'reference', 'results', 'racecards', 'race_detail',
  'entities', 'horses', 'jockeys', 'trainers', 'owners', 'sires', 'dams', 'damsires',
]

function ControlsPanel({ onBackfillAll, onBackfillGroup, onSync, onDiscoverEntities, gcsConsoleUrl }) {
  const [selectedGroup, setSelectedGroup] = useState('results')

  return (
    <Panel label="CONTROLS" fsu="FSU-1E">
      <div style={{ padding: 20 }}>
        {/* Primary actions */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
          <ActionButton label="BACKFILL ALL" colour="#3ddc84" onClick={onBackfillAll} confirm="Start full coverage backfill across all endpoint groups in dependency order?" />
          <ActionButton label="DAILY SYNC" colour={GOLD} onClick={onSync} />
          <ActionButton label="DISCOVER ENTITIES" colour="#64a0ff" onClick={onDiscoverEntities} confirm="Scan all results files and populate entity discovery collections?" />
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
              VIEW GCS BUCKET ↗
            </a>
          )}
        </div>

        {/* Per-group backfill */}
        <div style={{ paddingTop: 16, borderTop: `1px solid ${BORDER}` }}>
          <SectionLabel>BACKFILL SINGLE GROUP</SectionLabel>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12 }}>
            <select
              value={selectedGroup}
              onChange={e => setSelectedGroup(e.target.value)}
              style={{
                flex: 1,
                background: 'rgba(0,0,0,0.25)',
                border: `1px solid ${BORDER_ACTIVE}`,
                color: TEXT, fontFamily: FONT_MONO, fontSize: 11,
                padding: '8px 12px', outline: 'none',
              }}
            >
              {ENDPOINT_GROUPS.map(g => (
                <option key={g} value={g}>{g.toUpperCase().replace(/_/g, ' ')}</option>
              ))}
            </select>
            <ActionButton
              label="START"
              colour="#3ddc84"
              onClick={() => onBackfillGroup(selectedGroup)}
              confirm={`Start backfill for ${selectedGroup.toUpperCase()}?`}
            />
          </div>
        </div>
      </div>
    </Panel>
  )
}

// ── Footer Strip ─────────────────────────────────────────────────────────────

function FooterStrip({ config, health }) {
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
        {health?.version && (
          <span style={{ fontFamily: FONT_MONO, fontSize: 8, letterSpacing: '0.12em', color: TEXT_DIM }}>
            v{health.version}
          </span>
        )}
        {config?.region && (
          <span style={{ fontFamily: FONT_MONO, fontSize: 8, letterSpacing: '0.12em', color: TEXT_DIM }}>
            {config.region}
          </span>
        )}
      </div>
    </div>
  )
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function FSU1E() {
  const navigate = useNavigate()

  // ── State ────────────────────────────────────────────────────────────────
  const [health, setHealth]       = useState(null)
  const [status, setStatus]       = useState(null)
  const [stats, setStats]         = useState(null)
  const [coverage, setCoverage]   = useState(null)
  const [settings, setSettings]   = useState(null)
  const [config, setConfig]       = useState(null)

  const [healthFetch, setHealthFetch] = useState('loading')
  const [statusFetch, setStatusFetch] = useState('loading')
  const [statsFetch, setStatsFetch]   = useState('loading')
  const [covFetch, setCovFetch]       = useState('loading')
  const [setFetch, setSetFetch]       = useState('loading')
  const [cfgFetch, setCfgFetch]       = useState('loading')

  const [liveEntries, setLiveEntries] = useState([])
  const [toast, setToast]             = useState(null)
  const sseRef                        = useRef(null)

  const showToast = useCallback((message, type = 'success') => setToast({ message, type }), [])

  // ── Fetch functions ──────────────────────────────────────────────────────

  const fetchHealth = useCallback(() => {
    if (!FSU1E_URL) { setHealthFetch('error'); return }
    apiFetch('/admin/health')
      .then(json => { setHealth(json); setHealthFetch('ok') })
      .catch(() => setHealthFetch('error'))
  }, [])

  const fetchStatus = useCallback(() => {
    if (!FSU1E_URL) { setStatusFetch('error'); return }
    apiFetch('/admin/status')
      .then(json => { setStatus(json); setStatusFetch('ok') })
      .catch(() => setStatusFetch('error'))
  }, [])

  const fetchStats = useCallback(() => {
    if (!FSU1E_URL) { setStatsFetch('error'); return }
    apiFetch('/api/stats')
      .then(json => { setStats(json); setStatsFetch('ok') })
      .catch(() => setStatsFetch('error'))
  }, [])

  const fetchCoverage = useCallback(() => {
    if (!FSU1E_URL) { setCovFetch('error'); return }
    apiFetch('/api/coverage')
      .then(json => { setCoverage(json); setCovFetch('ok') })
      .catch(() => setCovFetch('error'))
  }, [])

  const fetchSettings = useCallback(() => {
    if (!FSU1E_URL) { setSetFetch('error'); return }
    apiFetch('/admin/settings')
      .then(json => { setSettings(json); setSetFetch('ok') })
      .catch(() => setSetFetch('error'))
  }, [])

  const fetchConfig = useCallback(() => {
    if (!FSU1E_URL) { setCfgFetch('error'); return }
    apiFetch('/admin/config')
      .then(json => { setConfig(json); setCfgFetch('ok') })
      .catch(() => setCfgFetch('error'))
  }, [])

  // ── Initial load ─────────────────────────────────────────────────────────

  useEffect(() => {
    fetchHealth()
    fetchStatus()
    fetchStats()
    fetchCoverage()
    fetchSettings()
    fetchConfig()
  }, [fetchHealth, fetchStatus, fetchStats, fetchCoverage, fetchSettings, fetchConfig])

  // ── SSE live stream ──────────────────────────────────────────────────────

  useEffect(() => {
    if (!FSU1E_URL) return

    const connect = () => {
      const es = new EventSource(`${FSU1E_URL}/admin/stream`)

      es.addEventListener('status', (e) => {
        try {
          const data = JSON.parse(e.data)
          setStatus(prev => prev ? { ...prev, ...data, progress: data.progress || prev.progress } : data)
          setStatusFetch('ok')
        } catch {}
      })

      es.addEventListener('health', (e) => {
        try {
          const data = JSON.parse(e.data)
          setHealth(prev => prev ? { ...prev, ...data } : data)
          setHealthFetch('ok')
        } catch {}
      })

      es.addEventListener('log', (e) => {
        try {
          const data = JSON.parse(e.data)
          setLiveEntries(prev => [data, ...prev].slice(0, 100))
        } catch {}
      })

      es.onerror = () => {
        es.close()
        setTimeout(connect, 5000)
      }

      sseRef.current = es
    }

    connect()
    return () => { if (sseRef.current) sseRef.current.close() }
  }, [])

  // ── Fallback polling (in case SSE disconnects) ───────────────────────────

  useEffect(() => {
    if (!FSU1E_URL) return
    const interval = setInterval(() => {
      fetchHealth()
      fetchStatus()
    }, 15000)
    return () => clearInterval(interval)
  }, [fetchHealth, fetchStatus])

  // ── Control actions ──────────────────────────────────────────────────────

  const postAction = async (path, confirmMsg) => {
    try {
      const json = await apiFetch(path, { method: 'POST' })
      showToast(json.message || `${path} — command sent`)
      setTimeout(() => { fetchStatus(); fetchCoverage() }, 2000)
    } catch (e) {
      showToast(`Failed: ${e}`, 'error')
    }
  }

  const handleSaveSettings = async (updates) => {
    const json = await apiFetch('/admin/settings', { method: 'PUT', body: { updates } })
    // Refresh settings from response
    if (json.settings) {
      fetchSettings()
    }
    return json
  }

  // ── Derived ──────────────────────────────────────────────────────────────

  const bucket = config?.bucket || 'fsu1e-racingapi-historic-raw'
  const gcsConsoleUrl = `https://console.cloud.google.com/storage/browser/${bucket}?project=${config?.gcp_project || 'chiops'}`
  const combinedFetch = healthFetch === 'ok' || statusFetch === 'ok' ? 'ok' : healthFetch === 'error' && statusFetch === 'error' ? 'error' : 'loading'

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
        health={health}
        status={status}
        fetchStatus={combinedFetch}
        onSync={() => postAction('/api/sync')}
        onBackfillAll={() => postAction('/api/backfill/all')}
      />

      {/* Error state — show if FSU not configured */}
      {!FSU1E_URL && (
        <Panel label="RACING API HISTORIC INGEST" fsu="FSU-1E" status="error">
          <ErrorMsg msg="VITE_FSU1E_URL not configured" />
        </Panel>
      )}

      {/* Loading state */}
      {FSU1E_URL && combinedFetch === 'loading' && (
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
      {FSU1E_URL && combinedFetch !== 'loading' && (
        <>
          <StatusPanel health={health} status={status} />
          <MetricsRow status={status} stats={stats} coverage={coverage} />
        </>
      )}

      <CoveragePanel
        coverage={coverage}
        fetchStatus={covFetch}
        onBackfillGroup={(group) => postAction(`/api/backfill/${group}`)}
      />
      <SettingsPanel settings={settings} fetchStatus={setFetch} onSave={handleSaveSettings} />
      <ActivityPanel liveEntries={liveEntries} />
      <ConfigPanel config={config} fetchStatus={cfgFetch} />
      <ControlsPanel
        onBackfillAll={() => postAction('/api/backfill/all')}
        onBackfillGroup={(group) => postAction(`/api/backfill/${group}`)}
        onSync={() => postAction('/api/sync')}
        onDiscoverEntities={() => postAction('/api/discover-entities')}
        gcsConsoleUrl={gcsConsoleUrl}
      />
      <FooterStrip config={config} health={health} />
    </div>
  )
}
