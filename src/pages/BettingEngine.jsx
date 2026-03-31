import PlaceholderPage from '../components/PlaceholderPage.jsx'
export default function BettingEngine() {
  return <PlaceholderPage
    title="Betting Engine" icon="⬡"
    description="Core execution layer. Lay engine control, stake management, spread control, and Betfair Exchange interface."
    modules={[
      { name: 'Engine Status', desc: 'Live engine state, mode (DRY_RUN / LIVE), active markets', status: 'pending' },
      { name: 'Stake Control', desc: 'Point value, multiplier, spread control configuration', status: 'pending' },
      { name: 'Betfair Interface', desc: 'Exchange connection status, API health, market access', status: 'pending' },
      { name: 'Bet Queue', desc: 'Pending, placed, and matched bet monitoring', status: 'pending' },
      { name: 'JOFS Control', desc: 'Joint odds / favourite suppression settings', status: 'pending' },
    ]}
  />
}
