import PlaceholderPage from '../components/PlaceholderPage.jsx'
export default function Strategy() {
  return <PlaceholderPage
    title="Strategy" icon="◈"
    description="Rule family configuration, parameter management, and strategy governance. Mark's domain."
    modules={[
      { name: 'Rule Families', desc: 'Manage active rule sets including TOP2, SHORT_PRICE_CONTROL, RPR Overlay', status: 'pending' },
      { name: 'Rule Parameters', desc: 'Per-rule threshold and weight configuration', status: 'pending' },
      { name: 'Strategy Versioning', desc: 'Change history, SCN register, approval workflow', status: 'pending' },
      { name: 'Backtesting', desc: 'Historical performance simulation against rule families', status: 'pending' },
      { name: 'Configurator', desc: 'Chimera Drag & Drop Strategy Configurator', status: 'demo', path: '/strategy/configurator' },
    ]}
  />
}
