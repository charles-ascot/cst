import { useState, useEffect } from 'react'
import {
  GOLD, GOLD_LIGHT, GOLD_DIM, BG_PANEL, BORDER, BORDER_ACTIVE,
  TEXT, TEXT_DIM, FONT_UI, FONT_MONO, FONT_SERIF,
} from '../theme.js'

const FSU1X_URL = import.meta.env.VITE_FSU1X_URL || 'https://beta-fsu1x-lssrjnis3q-nw.a.run.app'
const FSU1Y_URL = import.meta.env.VITE_FSU1Y_URL || 'https://beta-fsu1y-lssrjnis3q-nw.a.run.app'
const FSU1X_KEY = import.meta.env.VITE_FSU1X_API_KEY
const FSU1Y_KEY = import.meta.env.VITE_FSU1Y_API_KEY

// ── Shared panel shell ────────────────────────────────────────────────────────

function Panel({ label, fsu, status, count, countLabel, children }) {
  return (
    <div style={{
      border: `1px solid ${BORDER}`,
      background: BG_PANEL,
      marginBottom: 28,
    }}>
      {/* Panel header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 20px',
        borderBottom: `1px solid ${BORDER}`,
        background: 'rgba(0,0,0,0.2)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            fontFamily: FONT_UI, fontSize: 11, fontWeight: 700,
            letterSpacing: '0.35em', color: TEXT,
          }}>
            {label}
          </div>
          <div style={{
            fontFamily: FONT_MONO, fontSize: 9, letterSpacing: '0.2em',
            color: GOLD_DIM, paddingLeft: 16,
            borderLeft: `1px solid ${BORDER}`,
          }}>
            {fsu}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {count != null && (
            <div style={{
              fontFamily: FONT_MONO, fontSize: 9, letterSpacing: '0.15em', color: GOLD,
            }}>
              {count} {countLabel}
            </div>
          )}
          <StatusDot status={status} />
        </div>
      </div>
      {children}
    </div>
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

function LoadingRows({ cols }) {
  return (
    <>
      {[...Array(6)].map((_, i) => (
        <tr key={i}>
          {[...Array(cols)].map((__, j) => (
            <td key={j} style={{ padding: '11px 16px' }}>
              <div style={{
                height: 10, borderRadius: 2,
                background: `rgba(184,146,74,0.06)`,
                width: `${40 + Math.random() * 40}%`,
              }} />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}

function ErrorMsg({ msg }) {
  return (
    <div style={{ padding: '32px 20px', fontFamily: FONT_MONO, fontSize: 10, letterSpacing: '0.15em', color: '#c05050', textAlign: 'center' }}>
      ✕ {msg}
    </div>
  )
}

// ── FSU1Y — Racing Intelligence ───────────────────────────────────────────────

const REGION_COLOURS = {
  GB:  { bg: 'rgba(61,220,132,0.12)', text: '#3ddc84' },
  IRE: { bg: 'rgba(184,146,74,0.12)', text: GOLD },
  AUS: { bg: 'rgba(100,160,255,0.12)', text: '#64a0ff' },
  USA: { bg: 'rgba(255,100,100,0.12)', text: '#ff6464' },
  FR:  { bg: 'rgba(200,100,255,0.12)', text: '#c864ff' },
}

function RegionBadge({ region }) {
  const c = REGION_COLOURS[region] || { bg: 'rgba(255,255,255,0.06)', text: TEXT_DIM }
  return (
    <span style={{
      display: 'inline-block', padding: '1px 6px',
      background: c.bg, color: c.text,
      fontFamily: FONT_MONO, fontSize: 8, letterSpacing: '0.15em',
      border: `1px solid ${c.text}22`,
    }}>
      {region}
    </span>
  )
}

function RacingPanel() {
  const [cards, setCards] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!FSU1Y_KEY) { setStatus('error'); setError('VITE_FSU1Y_API_KEY not configured'); return }
    fetch(`${FSU1Y_URL}/v1/racecards?day=today`, {
      headers: { 'X-API-Key': FSU1Y_KEY },
    })
      .then(r => r.ok ? r.json() : r.json().then(e => Promise.reject(e.detail || 'FSU1Y error')))
      .then(json => {
        const racecards = json?.data?.racecards || []
        const sorted = [...racecards].sort((a, b) => a.off_time.localeCompare(b.off_time))
        setCards(sorted)
        setStatus('ok')
      })
      .catch(e => { setStatus('error'); setError(String(e)) })
  }, [])

  const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()

  return (
    <Panel label="RACING INTELLIGENCE" fsu="FSU-1Y" status={status} count={status === 'ok' ? cards.length : null} countLabel="RACES TODAY">
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
              {['TIME', 'REGION', 'COURSE', 'RACE', 'CLASS', 'DIST', 'GOING', 'PRIZE', 'FIELD'].map(h => (
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
            {status === 'loading' && <LoadingRows cols={9} />}
            {status === 'error' && (
              <tr><td colSpan={9}><ErrorMsg msg={error} /></td></tr>
            )}
            {status === 'ok' && cards.length === 0 && (
              <tr><td colSpan={9}>
                <div style={{ padding: '32px 20px', fontFamily: FONT_MONO, fontSize: 10, letterSpacing: '0.15em', color: TEXT_DIM, textAlign: 'center' }}>
                  NO RACES FOUND FOR TODAY
                </div>
              </td></tr>
            )}
            {status === 'ok' && cards.map((race, i) => (
              <tr key={race.race_id}
                style={{
                  borderBottom: `1px solid ${BORDER}`,
                  background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
                  transition: 'background 0.15s',
                  cursor: 'default',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(184,146,74,0.05)'}
                onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)'}
              >
                <td style={{ padding: '11px 16px', fontFamily: FONT_MONO, fontSize: 11, color: GOLD, whiteSpace: 'nowrap' }}>
                  {race.off_time}
                </td>
                <td style={{ padding: '11px 16px' }}>
                  <RegionBadge region={race.region} />
                </td>
                <td style={{ padding: '11px 16px', fontFamily: FONT_UI, fontSize: 12, color: TEXT, whiteSpace: 'nowrap' }}>
                  {race.course}
                </td>
                <td style={{ padding: '11px 16px', fontFamily: FONT_UI, fontSize: 12, color: TEXT, maxWidth: 280 }}>
                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {race.race_name}
                    {race.pattern && (
                      <span style={{ marginLeft: 8, fontFamily: FONT_MONO, fontSize: 8, color: GOLD_DIM, letterSpacing: '0.1em' }}>
                        {race.pattern}
                      </span>
                    )}
                  </div>
                </td>
                <td style={{ padding: '11px 16px', fontFamily: FONT_MONO, fontSize: 10, color: TEXT_DIM, whiteSpace: 'nowrap' }}>
                  {race.race_class || '—'}
                </td>
                <td style={{ padding: '11px 16px', fontFamily: FONT_MONO, fontSize: 10, color: TEXT, whiteSpace: 'nowrap' }}>
                  {race.distance_round || race.distance || '—'}
                </td>
                <td style={{ padding: '11px 16px', fontFamily: FONT_UI, fontSize: 11, color: TEXT_DIM, whiteSpace: 'nowrap' }}>
                  {race.going || '—'}
                </td>
                <td style={{ padding: '11px 16px', fontFamily: FONT_MONO, fontSize: 10, color: TEXT_DIM, whiteSpace: 'nowrap' }}>
                  {race.prize || '—'}
                </td>
                <td style={{ padding: '11px 16px', fontFamily: FONT_MONO, fontSize: 11, color: TEXT, textAlign: 'right', whiteSpace: 'nowrap' }}>
                  {race.field_size}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {status === 'ok' && cards.length > 0 && (
        <div style={{
          padding: '8px 20px', borderTop: `1px solid ${BORDER}`,
          fontFamily: FONT_MONO, fontSize: 8, letterSpacing: '0.15em', color: GOLD_DIM,
          display: 'flex', justifyContent: 'space-between',
        }}>
          <span>SOURCE: THE RACING API VIA FSU-1Y</span>
          <span>{today}</span>
        </div>
      )}
    </Panel>
  )
}

// ── FSU1X — Sports Intelligence ───────────────────────────────────────────────

function SportsPanel() {
  const [groups, setGroups]   = useState({})
  const [total, setTotal]     = useState(0)
  const [status, setStatus]   = useState('loading')
  const [error, setError]     = useState(null)
  const [expanded, setExpanded] = useState({})

  useEffect(() => {
    if (!FSU1X_KEY) { setStatus('error'); setError('VITE_FSU1X_API_KEY not configured'); return }
    fetch(`${FSU1X_URL}/v1/sports`, {
      headers: { 'X-API-Key': FSU1X_KEY },
    })
      .then(r => r.ok ? r.json() : r.json().then(e => Promise.reject(e.detail || 'FSU1X error')))
      .then(json => {
        const sports = json?.data || []
        const grouped = {}
        sports.forEach(s => {
          if (!grouped[s.group]) grouped[s.group] = []
          grouped[s.group].push(s)
        })
        // Sort groups alphabetically
        const sorted = Object.fromEntries(Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)))
        setGroups(sorted)
        setTotal(sports.length)
        // Expand first 4 groups by default
        const init = {}
        Object.keys(sorted).slice(0, 4).forEach(k => { init[k] = true })
        setExpanded(init)
        setStatus('ok')
      })
      .catch(e => { setStatus('error'); setError(String(e)) })
  }, [])

  const toggle = (group) => setExpanded(prev => ({ ...prev, [group]: !prev[group] }))

  return (
    <Panel label="SPORTS COVERAGE" fsu="FSU-1X" status={status} count={status === 'ok' ? total : null} countLabel="ACTIVE SPORTS">
      {status === 'loading' && (
        <div style={{ padding: '24px 20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
          {[...Array(8)].map((_, i) => (
            <div key={i} style={{ height: 72, border: `1px solid ${BORDER}`, background: 'rgba(184,146,74,0.03)' }} />
          ))}
        </div>
      )}
      {status === 'error' && <ErrorMsg msg={error} />}
      {status === 'ok' && (
        <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
          {Object.entries(groups).map(([group, sports]) => (
            <div key={group}
              style={{
                border: `1px solid ${expanded[group] ? BORDER_ACTIVE : BORDER}`,
                background: expanded[group] ? 'rgba(184,146,74,0.04)' : 'transparent',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onClick={() => toggle(group)}
            >
              {/* Group header */}
              <div style={{
                padding: '10px 14px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                borderBottom: expanded[group] ? `1px solid ${BORDER}` : 'none',
              }}>
                <div style={{ fontFamily: FONT_UI, fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', color: expanded[group] ? GOLD : TEXT }}>
                  {group}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontFamily: FONT_MONO, fontSize: 9, color: GOLD_DIM }}>
                    {sports.length}
                  </span>
                  <span style={{ fontFamily: FONT_MONO, fontSize: 9, color: GOLD_DIM }}>
                    {expanded[group] ? '▲' : '▼'}
                  </span>
                </div>
              </div>
              {/* Sport list */}
              {expanded[group] && (
                <div style={{ padding: '8px 14px 10px' }}>
                  {sports.map(s => (
                    <div key={s.key} style={{
                      padding: '4px 0',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      borderBottom: `1px solid rgba(184,146,74,0.05)`,
                    }}>
                      <span style={{ fontFamily: FONT_UI, fontSize: 11, color: TEXT_DIM }}>
                        {s.title}
                      </span>
                      {s.has_outrights && (
                        <span style={{ fontFamily: FONT_MONO, fontSize: 7, color: GOLD_DIM, letterSpacing: '0.1em' }}>
                          OUTRIGHT
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {status === 'ok' && total > 0 && (
        <div style={{
          padding: '8px 20px', borderTop: `1px solid ${BORDER}`,
          fontFamily: FONT_MONO, fontSize: 8, letterSpacing: '0.15em', color: GOLD_DIM,
        }}>
          SOURCE: THE ODDS API VIA FSU-1X · CLICK GROUP TO EXPAND
        </div>
      )}
    </Panel>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Dashboards() {
  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      <RacingPanel />
      <SportsPanel />
    </div>
  )
}
