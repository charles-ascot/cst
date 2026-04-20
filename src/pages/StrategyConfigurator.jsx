import { useNavigate } from 'react-router-dom'
import { GOLD, GOLD_DIM, BORDER, FONT_MONO } from '../theme.js'

export default function StrategyConfigurator() {
  const navigate = useNavigate()

  return (
    <div style={{ animation: 'fadeIn 0.4s ease', display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Breadcrumb */}
      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button
          onClick={() => navigate('/strategy')}
          style={{
            background: 'transparent', border: 'none',
            fontFamily: FONT_MONO, fontSize: 9, letterSpacing: '0.15em',
            color: GOLD_DIM, cursor: 'pointer', padding: 0,
            transition: 'color 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = GOLD}
          onMouseLeave={e => e.currentTarget.style.color = GOLD_DIM}
        >
          ← STRATEGY
        </button>
        <span style={{ fontFamily: FONT_MONO, fontSize: 9, letterSpacing: '0.15em', color: GOLD_DIM }}>
          CONFIGURATOR DEMO
        </span>
      </div>

      {/* iframe */}
      <div style={{
        flex: 1,
        border: `1px solid ${BORDER}`,
        overflow: 'hidden',
        minHeight: 'calc(100vh - 180px)',
      }}>
        <iframe
          src="/drag-drop/configurator.html"
          style={{ width: '100%', height: '100%', border: 'none', minHeight: 'calc(100vh - 180px)' }}
          title="Chimera Drag & Drop Strategy Configurator"
        />
      </div>
    </div>
  )
}
