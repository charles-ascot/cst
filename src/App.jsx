import { useState, useEffect } from 'react'

const GOLD = '#b8924a'
const GOLD_LIGHT = '#d4aa6a'
const GOLD_DIM = '#7a5f30'

const styles = {
  reset: `
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body, #root { height: 100%; width: 100%; }
  `,
  globals: `
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(24px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
    @keyframes scanline {
      0%   { transform: translateY(-100%); }
      100% { transform: translateY(100vh); }
    }
    @keyframes pulse-border {
      0%, 100% { border-color: rgba(184,146,74,0.25); }
      50%       { border-color: rgba(184,146,74,0.6); }
    }
    @keyframes ticker {
      0%   { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }
    @keyframes blink {
      0%, 100% { opacity: 1; }
      50%       { opacity: 0; }
    }
  `
}

const tickerItems = [
  'CHIMERA SIGNAL INTELLIGENCE PLATFORM',
  '◆',
  'PROPRIETARY ALGORITHMIC ANALYSIS',
  '◆',
  'EXCHANGE INTELLIGENCE LAYER ACTIVE',
  '◆',
  'FRACTIONAL SERVICE UNITS ONLINE',
  '◆',
  'AUTHORISED ACCESS ONLY',
  '◆',
  'CHIMERA SPORTS TRADING LTD',
  '◆',
]

export default function App() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mounted, setMounted] = useState(false)
  const [focusedField, setFocusedField] = useState(null)
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    setMounted(true)
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const pad = n => String(n).padStart(2, '0')
  const timeStr = `${pad(time.getHours())}:${pad(time.getMinutes())}:${pad(time.getSeconds())}`
  const dateStr = time.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()

  const tickerText = tickerItems.join('    ')
  const fullTicker = `${tickerText}    ${tickerText}    `

  return (
    <>
      <style>{styles.reset + styles.globals}</style>

      <div style={{
        minHeight: '100vh',
        width: '100%',
        background: '#06060a',
        fontFamily: "'Rajdhani', sans-serif",
        color: '#e8e0d0',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}>

        {/* Background grid */}
        <div style={{
          position: 'fixed', inset: 0, zIndex: 0,
          backgroundImage: `
            linear-gradient(rgba(184,146,74,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(184,146,74,0.04) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
          backgroundPosition: 'center center',
        }} />

        {/* Radial vignette */}
        <div style={{
          position: 'fixed', inset: 0, zIndex: 0,
          background: 'radial-gradient(ellipse 80% 70% at 50% 50%, transparent 30%, #06060a 100%)',
        }} />

        {/* Subtle scanline sweep */}
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0,
          height: '2px',
          background: 'linear-gradient(90deg, transparent, rgba(184,146,74,0.15), transparent)',
          animation: 'scanline 8s linear infinite',
          zIndex: 1, pointerEvents: 'none',
        }} />

        {/* Corner decorations */}
        {[
          { top: 24, left: 24, borderTop: `1px solid ${GOLD_DIM}`, borderLeft: `1px solid ${GOLD_DIM}` },
          { top: 24, right: 24, borderTop: `1px solid ${GOLD_DIM}`, borderRight: `1px solid ${GOLD_DIM}` },
          { bottom: 24, left: 24, borderBottom: `1px solid ${GOLD_DIM}`, borderLeft: `1px solid ${GOLD_DIM}` },
          { bottom: 24, right: 24, borderBottom: `1px solid ${GOLD_DIM}`, borderRight: `1px solid ${GOLD_DIM}` },
        ].map((s, i) => (
          <div key={i} style={{
            position: 'fixed', width: 32, height: 32, zIndex: 2, ...s,
          }} />
        ))}

        {/* Top bar */}
        <div style={{
          position: 'relative', zIndex: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 48px',
          borderBottom: `1px solid rgba(184,146,74,0.12)`,
        }}>
          <div style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10, letterSpacing: '0.15em',
            color: GOLD_DIM, opacity: mounted ? 1 : 0,
            transition: 'opacity 0.8s ease 0.2s',
          }}>
            SYS // PORTAL v2.1
          </div>

          <div style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11, letterSpacing: '0.12em',
            color: GOLD_DIM, display: 'flex', gap: 24, alignItems: 'center',
            opacity: mounted ? 1 : 0,
            transition: 'opacity 0.8s ease 0.3s',
          }}>
            <span>{dateStr}</span>
            <span style={{ color: GOLD, fontWeight: 400 }}>{timeStr}</span>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
            }}>
              <span style={{
                display: 'inline-block', width: 6, height: 6, borderRadius: '50%',
                background: '#3ddc84', boxShadow: '0 0 6px #3ddc84',
                animation: 'blink 2s ease-in-out infinite',
              }} />
              SYSTEMS NOMINAL
            </span>
          </div>
        </div>

        {/* Main content */}
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 24px',
          position: 'relative', zIndex: 5,
        }}>
          <div style={{
            width: '100%',
            maxWidth: 420,
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(32px)',
            transition: 'opacity 0.9s ease 0.4s, transform 0.9s ease 0.4s',
          }}>

            {/* Logo block */}
            <div style={{ textAlign: 'center', marginBottom: 52 }}>
              {/* Chimera sigil / mark */}
              <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'center' }}>
                <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
                  <polygon
                    points="26,4 48,40 4,40"
                    stroke={GOLD}
                    strokeWidth="1.2"
                    fill="none"
                  />
                  <polygon
                    points="26,14 40,38 12,38"
                    stroke={GOLD_DIM}
                    strokeWidth="0.8"
                    fill="none"
                  />
                  <line x1="26" y1="4" x2="26" y2="40" stroke={GOLD} strokeWidth="0.6" opacity="0.4" />
                  <line x1="4" y1="40" x2="48" y2="40" stroke={GOLD} strokeWidth="0.6" opacity="0.4" />
                  <line x1="4" y1="40" x2="26" y2="4" stroke={GOLD} strokeWidth="0.6" opacity="0.4" />
                  <line x1="48" y1="40" x2="26" y2="4" stroke={GOLD} strokeWidth="0.6" opacity="0.4" />
                  <circle cx="26" cy="26" r="3" fill={GOLD} opacity="0.9" />
                </svg>
              </div>

              <div style={{
                fontFamily: "'Cormorant Garant', serif",
                fontSize: 42,
                fontWeight: 300,
                letterSpacing: '0.22em',
                color: '#f0e8d8',
                lineHeight: 1,
                marginBottom: 6,
              }}>
                CHIMERA
              </div>

              <div style={{
                fontFamily: "'Rajdhani', sans-serif",
                fontSize: 11,
                fontWeight: 500,
                letterSpacing: '0.42em',
                color: GOLD,
                marginBottom: 14,
              }}>
                SPORTS TRADING
              </div>

              {/* Gold rule */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12,
                justifyContent: 'center', marginBottom: 14,
              }}>
                <div style={{ flex: 1, height: 1, background: `linear-gradient(to right, transparent, ${GOLD_DIM})` }} />
                <div style={{ width: 4, height: 4, background: GOLD, transform: 'rotate(45deg)' }} />
                <div style={{ flex: 1, height: 1, background: `linear-gradient(to left, transparent, ${GOLD_DIM})` }} />
              </div>

              <div style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 9, letterSpacing: '0.22em',
                color: GOLD_DIM, textTransform: 'uppercase',
              }}>
                Signal Intelligence Platform
              </div>
            </div>

            {/* Login card */}
            <div style={{
              background: 'rgba(255,255,255,0.022)',
              border: `1px solid rgba(184,146,74,0.2)`,
              backdropFilter: 'blur(12px)',
              padding: '40px 36px 36px',
              position: 'relative',
            }}>
              {/* Card corner accents */}
              {[
                { top: -1, left: -1, borderTop: `1px solid ${GOLD}`, borderLeft: `1px solid ${GOLD}`, width: 16, height: 16 },
                { top: -1, right: -1, borderTop: `1px solid ${GOLD}`, borderRight: `1px solid ${GOLD}`, width: 16, height: 16 },
                { bottom: -1, left: -1, borderBottom: `1px solid ${GOLD}`, borderLeft: `1px solid ${GOLD}`, width: 16, height: 16 },
                { bottom: -1, right: -1, borderBottom: `1px solid ${GOLD}`, borderRight: `1px solid ${GOLD}`, width: 16, height: 16 },
              ].map((s, i) => (
                <div key={i} style={{ position: 'absolute', ...s }} />
              ))}

              <div style={{
                fontFamily: "'Rajdhani', sans-serif",
                fontSize: 10, fontWeight: 600, letterSpacing: '0.35em',
                color: GOLD_DIM, marginBottom: 28, textTransform: 'uppercase',
              }}>
                Authorised Access
              </div>

              {/* Email field */}
              <div style={{ marginBottom: 16 }}>
                <label style={{
                  display: 'block',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 9, letterSpacing: '0.2em',
                  color: GOLD_DIM, marginBottom: 8,
                  textTransform: 'uppercase',
                }}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  style={{
                    width: '100%',
                    background: 'rgba(0,0,0,0.4)',
                    border: `1px solid ${focusedField === 'email' ? GOLD : 'rgba(184,146,74,0.2)'}`,
                    outline: 'none',
                    padding: '12px 14px',
                    color: '#f0e8d8',
                    fontFamily: "'Rajdhani', sans-serif",
                    fontSize: 15, fontWeight: 400, letterSpacing: '0.04em',
                    transition: 'border-color 0.25s ease',
                    borderRadius: 0,
                  }}
                />
              </div>

              {/* Password field */}
              <div style={{ marginBottom: 32 }}>
                <label style={{
                  display: 'block',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 9, letterSpacing: '0.2em',
                  color: GOLD_DIM, marginBottom: 8,
                  textTransform: 'uppercase',
                }}>
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  style={{
                    width: '100%',
                    background: 'rgba(0,0,0,0.4)',
                    border: `1px solid ${focusedField === 'password' ? GOLD : 'rgba(184,146,74,0.2)'}`,
                    outline: 'none',
                    padding: '12px 14px',
                    color: '#f0e8d8',
                    fontFamily: "'Rajdhani', sans-serif",
                    fontSize: 15, fontWeight: 400,
                    transition: 'border-color 0.25s ease',
                    borderRadius: 0,
                  }}
                />
              </div>

              {/* Submit button */}
              <button
                onClick={() => {}}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: 'transparent',
                  border: `1px solid ${GOLD}`,
                  color: GOLD,
                  fontFamily: "'Rajdhani', sans-serif",
                  fontSize: 12, fontWeight: 600,
                  letterSpacing: '0.4em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  transition: 'background 0.2s ease, color 0.2s ease',
                  borderRadius: 0,
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = GOLD
                  e.currentTarget.style.color = '#06060a'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = GOLD
                }}
              >
                Access Platform
              </button>

              <div style={{
                marginTop: 20, textAlign: 'center',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 9, letterSpacing: '0.12em',
                color: 'rgba(184,146,74,0.3)',
              }}>
                Restricted system — unauthorised access prohibited
              </div>
            </div>

          </div>
        </div>

        {/* Ticker tape */}
        <div style={{
          position: 'relative', zIndex: 10,
          borderTop: `1px solid rgba(184,146,74,0.1)`,
          background: 'rgba(0,0,0,0.3)',
          overflow: 'hidden',
          height: 32,
          display: 'flex',
          alignItems: 'center',
          opacity: mounted ? 1 : 0,
          transition: 'opacity 1s ease 1s',
        }}>
          <div style={{
            display: 'flex',
            whiteSpace: 'nowrap',
            animation: 'ticker 40s linear infinite',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 9, letterSpacing: '0.2em',
            color: GOLD_DIM,
          }}>
            {[...Array(4)].map((_, i) => (
              <span key={i} style={{ paddingRight: 80 }}>{fullTicker}</span>
            ))}
          </div>
        </div>

      </div>
    </>
  )
}
