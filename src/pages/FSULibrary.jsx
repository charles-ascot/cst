import { useNavigate } from 'react-router-dom'
import {
  GOLD, GOLD_LIGHT, GOLD_DIM, BG_PANEL, BORDER, BORDER_ACTIVE,
  TEXT, TEXT_DIM, FONT_UI, FONT_MONO, FONT_SERIF,
} from '../theme.js'

const FSU_REGISTRY = [
  {
    id: 'fsu1e',
    fsu: 'FSU-1E',
    name: 'Racing API Historic Ingest',
    description: 'Historic data downloader for The Racing API. Backfills and syncs racecards, results, horses, courses, jockeys and trainers to GCS.',
    path: '/fsu-library/fsu1e',
    tags: ['RACING', 'GCS', 'BACKFILL'],
  },
]

function FSUCard({ item, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        border: `1px solid ${BORDER}`,
        background: BG_PANEL,
        cursor: 'pointer',
        transition: 'all 0.2s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = BORDER_ACTIVE
        e.currentTarget.style.background = 'rgba(184,146,74,0.04)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = BORDER
        e.currentTarget.style.background = BG_PANEL
      }}
    >
      {/* Card header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 20px',
        borderBottom: `1px solid ${BORDER}`,
        background: 'rgba(0,0,0,0.2)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            fontFamily: FONT_MONO, fontSize: 11, fontWeight: 700,
            letterSpacing: '0.2em', color: GOLD,
            padding: '3px 10px',
            border: `1px solid ${GOLD_DIM}`,
            background: 'rgba(184,146,74,0.08)',
          }}>
            {item.fsu}
          </div>
          <div style={{
            fontFamily: FONT_UI, fontSize: 12, fontWeight: 600,
            letterSpacing: '0.15em', color: TEXT,
          }}>
            {item.name}
          </div>
        </div>
        <div style={{
          fontFamily: FONT_MONO, fontSize: 10, color: GOLD_DIM,
          letterSpacing: '0.1em',
        }}>
          →
        </div>
      </div>

      {/* Card body */}
      <div style={{ padding: '16px 20px' }}>
        <div style={{
          fontFamily: FONT_UI, fontSize: 12, color: TEXT_DIM,
          letterSpacing: '0.04em', lineHeight: 1.6, marginBottom: 14,
        }}>
          {item.description}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {item.tags.map(tag => (
            <span key={tag} style={{
              fontFamily: FONT_MONO, fontSize: 8, letterSpacing: '0.15em',
              color: GOLD_DIM, padding: '2px 8px',
              border: `1px solid ${BORDER}`,
            }}>
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function FSULibrary() {
  const navigate = useNavigate()

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      {/* Page header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{
          fontFamily: FONT_SERIF, fontSize: 28, fontWeight: 300,
          letterSpacing: '0.18em', color: TEXT, lineHeight: 1,
        }}>
          FSU LIBRARY
        </div>
        <div style={{
          fontFamily: FONT_MONO, fontSize: 9, letterSpacing: '0.2em',
          color: GOLD_DIM, marginTop: 8,
        }}>
          FRACTIONAL SERVICE UNIT REGISTRY
        </div>
      </div>

      {/* FSU listing */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {FSU_REGISTRY.map(item => (
          <FSUCard
            key={item.id}
            item={item}
            onClick={() => navigate(item.path)}
          />
        ))}
      </div>

      {/* Footer note */}
      <div style={{
        marginTop: 32,
        fontFamily: FONT_MONO, fontSize: 8, letterSpacing: '0.15em',
        color: GOLD_DIM,
      }}>
        {FSU_REGISTRY.length} SERVICE{FSU_REGISTRY.length !== 1 ? 'S' : ''} REGISTERED
      </div>
    </div>
  )
}
