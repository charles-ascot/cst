import PlaceholderPage from '../components/PlaceholderPage.jsx'
export default function Reporting() {
  return <PlaceholderPage
    title="Reporting" icon="◱"
    description="Historical performance analytics, P&L analysis, rule family attribution, and bet-level reconciliation."
    modules={[
      { name: 'P&L Summary', desc: 'Net P&L by period, rule family, odds band, and market type', status: 'pending' },
      { name: 'Bet Analysis', desc: 'Individual bet records, outcome attribution, drift analysis', status: 'pending' },
      { name: 'Rule Performance', desc: 'Per-rule win rate, ROI, average win vs loss, firing frequency', status: 'pending' },
      { name: 'Battery Reports', desc: 'Data battery summaries — current battery from 21 Feb 2026', status: 'pending' },
      { name: 'Export', desc: 'CSV / PDF export for reconciliation and external review', status: 'pending' },
    ]}
  />
}
