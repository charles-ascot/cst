import { useNavigate } from 'react-router-dom'
import { GOLD, GOLD_DIM, BORDER, BORDER_ACTIVE, BG_PANEL, FONT_SERIF, FONT_UI, FONT_MONO, TEXT, TEXT_DIM } from '../theme.js'

export default function PlaceholderPage({ title, icon, description, modules = [] }) {
  const navigate = useNavigate()
  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      {/* Page header */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 10 }}>
          <span style={{ fontSize: 22, color: GOLD }}>{icon}</span>
          <h1 style={{
            fontFamily: FONT_SERIF, fontSize: 32, fontWeight: 300,
            letterSpacing: '0.16em', color: '#f0e8d8',
          }}>{title.toUpperCase()}</h1>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12,
        }}>
          <div style={{ height: 1, width: 48, background: GOLD }} />
          <div style={{ fontFamily: FONT_MONO, fontSize: 9, letterSpacing: '0.2em', color: GOLD_DIM }}>
            MODULE PENDING ACTIVATION
          </div>
        </div>
        <p style={{
          fontFamily: FONT_UI, fontSize: 14, color: TEXT_DIM,
          letterSpacing: '0.04em', maxWidth: 540,
        }}>{description}</p>
      </div>

      {/* Module grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: 16,
      }}>
        {modules.map((mod, i) => (
          <div key={i} style={{
            background: BG_PANEL,
            border: `1px solid ${BORDER}`,
            padding: '20px 22px',
            position: 'relative',
            cursor: mod.path ? 'pointer' : 'default',
            transition: 'border-color 0.2s',
          }}
          onClick={() => mod.path && navigate(mod.path)}
          onMouseEnter={e => e.currentTarget.style.borderColor = mod.path ? BORDER_ACTIVE : 'rgba(184,146,74,0.45)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = BORDER}
          >
            {/* Corner accent */}
            <div style={{
              position: 'absolute', top: -1, left: -1,
              width: 10, height: 10,
              borderTop: `1px solid ${GOLD}`, borderLeft: `1px solid ${GOLD}`,
            }} />

            <div style={{
              fontFamily: FONT_MONO, fontSize: 8, letterSpacing: '0.2em',
              color: GOLD_DIM, marginBottom: 8,
            }}>
              {String(i + 1).padStart(2, '0')}
            </div>
            <div style={{
              fontFamily: FONT_UI, fontSize: 13, fontWeight: 600,
              letterSpacing: '0.08em', color: '#d8d0c0', marginBottom: 6,
            }}>
              {mod.name}
            </div>
            <div style={{
              fontFamily: FONT_UI, fontSize: 12, color: TEXT_DIM,
              letterSpacing: '0.02em', lineHeight: 1.5,
            }}>
              {mod.desc}
            </div>

            <div style={{
              marginTop: 14, display: 'inline-flex', alignItems: 'center', gap: 6,
              fontFamily: FONT_MONO, fontSize: 8, letterSpacing: '0.15em',
              color: mod.status === 'live' ? '#3ddc84' : GOLD_DIM,
            }}>
              <span style={{
                width: 5, height: 5, borderRadius: '50%',
                background: mod.status === 'live' ? '#3ddc84' : mod.status === 'demo' ? GOLD : GOLD_DIM,
                display: 'inline-block',
              }} />
              {mod.status === 'live' ? 'LIVE' : mod.status === 'demo' ? 'DEMO  →' : 'PENDING'}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
