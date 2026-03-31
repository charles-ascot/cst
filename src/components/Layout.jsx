import { useState, useEffect } from 'react'
import { useLocation, useNavigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import {
  GOLD, GOLD_DIM, BG, BG_PANEL, BORDER, TEXT, TEXT_DIM,
  FONT_SERIF, FONT_UI, FONT_MONO, NAV_ITEMS
} from '../theme.js'

export default function Layout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [time, setTime] = useState(new Date())
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const pad = n => String(n).padStart(2, '0')
  const timeStr = `${pad(time.getHours())}:${pad(time.getMinutes())}:${pad(time.getSeconds())}`
  const dateStr = time.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()

  const currentNav = NAV_ITEMS.find(n => location.pathname.startsWith(n.path))

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root { height: 100%; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${GOLD_DIM}; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes blink { 0%,100% { opacity:1; } 50% { opacity:0; } }
        @keyframes ticker { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
      `}</style>

      <div style={{
        display: 'flex', height: '100vh', width: '100vw',
        background: BG, fontFamily: FONT_UI, color: TEXT, overflow: 'hidden',
      }}>

        {/* Background grid */}
        <div style={{
          position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
          backgroundImage: `
            linear-gradient(rgba(184,146,74,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(184,146,74,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }} />

        {/* ── SIDEBAR ── */}
        <aside style={{
          width: collapsed ? 64 : 220,
          minWidth: collapsed ? 64 : 220,
          height: '100vh',
          borderRight: `1px solid ${BORDER}`,
          background: 'rgba(0,0,0,0.35)',
          backdropFilter: 'blur(12px)',
          display: 'flex', flexDirection: 'column',
          position: 'relative', zIndex: 20,
          transition: 'width 0.3s ease, min-width 0.3s ease',
        }}>

          {/* Logo */}
          <div style={{
            padding: collapsed ? '24px 0' : '28px 24px 24px',
            borderBottom: `1px solid ${BORDER}`,
            display: 'flex', flexDirection: 'column',
            alignItems: collapsed ? 'center' : 'flex-start',
          }}>
            <svg width="28" height="28" viewBox="0 0 52 52" fill="none" style={{ flexShrink: 0 }}>
              <polygon points="26,4 48,40 4,40" stroke={GOLD} strokeWidth="1.4" fill="none"/>
              <polygon points="26,14 40,38 12,38" stroke={GOLD_DIM} strokeWidth="0.9" fill="none"/>
              <circle cx="26" cy="26" r="3" fill={GOLD}/>
            </svg>
            {!collapsed && (
              <div style={{ marginTop: 10 }}>
                <div style={{
                  fontFamily: FONT_SERIF, fontSize: 18, fontWeight: 300,
                  letterSpacing: '0.22em', color: '#f0e8d8', lineHeight: 1,
                }}>CHIMERA</div>
                <div style={{
                  fontFamily: FONT_UI, fontSize: 8, fontWeight: 600,
                  letterSpacing: '0.35em', color: GOLD, marginTop: 3,
                }}>SPORTS TRADING</div>
              </div>
            )}
          </div>

          {/* Nav items */}
          <nav style={{ flex: 1, padding: '12px 0', overflowY: 'auto' }}>
            {NAV_ITEMS.map(item => {
              const active = location.pathname.startsWith(item.path)
              return (
                <button key={item.id}
                  onClick={() => navigate(item.path)}
                  title={collapsed ? item.label : undefined}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center',
                    gap: 12, padding: collapsed ? '12px 0' : '11px 24px',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    background: active ? 'rgba(184,146,74,0.08)' : 'transparent',
                    borderTop: 'none', borderRight: 'none', borderBottom: 'none',
                    borderLeft: active ? `2px solid ${GOLD}` : '2px solid transparent',
                    color: active ? GOLD : TEXT_DIM,
                    fontFamily: FONT_UI, fontSize: 13, fontWeight: active ? 600 : 400,
                    letterSpacing: '0.08em', cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.color = '#c8b890' }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.color = TEXT_DIM }}
                >
                  <span style={{ fontSize: 14, flexShrink: 0 }}>{item.icon}</span>
                  {!collapsed && <span>{item.label}</span>}
                </button>
              )
            })}
          </nav>

          {/* Bottom: user + logout */}
          <div style={{
            borderTop: `1px solid ${BORDER}`,
            padding: collapsed ? '16px 0' : '16px 24px',
            display: 'flex', flexDirection: 'column', gap: 10,
            alignItems: collapsed ? 'center' : 'flex-start',
          }}>
            {!collapsed && user && (
              <div style={{
                fontFamily: FONT_MONO, fontSize: 9, letterSpacing: '0.1em',
                color: GOLD_DIM, overflow: 'hidden', textOverflow: 'ellipsis',
                whiteSpace: 'nowrap', maxWidth: '100%',
              }}>
                {user.email}
              </div>
            )}
            <button onClick={logout}
              title={collapsed ? 'Sign Out' : undefined}
              style={{
                background: 'transparent', border: `1px solid ${BORDER}`,
                color: GOLD_DIM, fontFamily: FONT_UI, fontSize: 10,
                fontWeight: 600, letterSpacing: '0.25em', padding: collapsed ? '7px' : '7px 14px',
                cursor: 'pointer', transition: 'all 0.2s',
                width: collapsed ? 38 : '100%', textAlign: 'center',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = GOLD; e.currentTarget.style.color = GOLD }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.color = GOLD_DIM }}
            >
              {collapsed ? '↩' : 'SIGN OUT'}
            </button>
          </div>

          {/* Collapse toggle */}
          <button
            onClick={() => setCollapsed(c => !c)}
            style={{
              position: 'absolute', top: '50%', right: -12,
              transform: 'translateY(-50%)',
              width: 22, height: 22, borderRadius: '50%',
              background: BG, border: `1px solid ${BORDER}`,
              color: GOLD_DIM, fontSize: 9, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 30, transition: 'all 0.2s',
            }}
          >
            {collapsed ? '›' : '‹'}
          </button>
        </aside>

        {/* ── MAIN AREA ── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative', zIndex: 10 }}>

          {/* Top bar */}
          <header style={{
            height: 52, minHeight: 52,
            borderBottom: `1px solid ${BORDER}`,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 32px', background: 'rgba(0,0,0,0.2)',
          }}>
            <div style={{
              fontFamily: FONT_MONO, fontSize: 10, letterSpacing: '0.2em', color: GOLD_DIM,
            }}>
              {currentNav ? `// ${currentNav.label.toUpperCase()}` : '// HOME'}
            </div>

            <div style={{
              display: 'flex', gap: 24, alignItems: 'center',
              fontFamily: FONT_MONO, fontSize: 10, letterSpacing: '0.12em', color: GOLD_DIM,
            }}>
              <span>{dateStr}</span>
              <span style={{ color: GOLD }}>{timeStr}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: '#3ddc84', boxShadow: '0 0 6px #3ddc84', display: 'inline-block',
                  animation: 'blink 2s ease-in-out infinite',
                }} />
                SYSTEMS NOMINAL
              </span>
            </div>
          </header>

          {/* Page content */}
          <main style={{ flex: 1, overflow: 'auto', padding: '32px 36px' }}>
            <Outlet />
          </main>

          {/* Ticker */}
          <div style={{
            height: 28, borderTop: `1px solid ${BORDER}`,
            background: 'rgba(0,0,0,0.3)', overflow: 'hidden',
            display: 'flex', alignItems: 'center',
          }}>
            <div style={{
              display: 'flex', whiteSpace: 'nowrap',
              animation: 'ticker 40s linear infinite',
              fontFamily: FONT_MONO, fontSize: 8, letterSpacing: '0.2em', color: GOLD_DIM,
            }}>
              {[...Array(6)].map((_, i) => (
                <span key={i} style={{ paddingRight: 80 }}>
                  CHIMERA SIGNAL INTELLIGENCE PLATFORM    ◆    PROPRIETARY ALGORITHMIC ANALYSIS    ◆    EXCHANGE INTELLIGENCE LAYER ACTIVE    ◆    FRACTIONAL SERVICE UNITS ONLINE    ◆    AUTHORISED ACCESS ONLY    ◆    CHIMERA SPORTS TRADING LTD    ◆    
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
