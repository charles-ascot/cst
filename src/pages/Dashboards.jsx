import PlaceholderPage from '../components/PlaceholderPage.jsx'
export default function Dashboards() {
  return <PlaceholderPage
    title="Dashboards" icon="▦"
    description="Live market intelligence views. Odds grids, signal feeds, in-play monitoring, and market analytics."
    modules={[
      { name: 'Odds Grid', desc: 'Bookmaker odds matrix — bookmakers as columns, events as rows', status: 'pending' },
      { name: 'Signal Feed', desc: 'Live rule firings, signal strength, trigger monitoring', status: 'pending' },
      { name: 'Market Monitor', desc: 'Active markets, price drift, in-play status', status: 'pending' },
      { name: 'Racing Intelligence', desc: 'UK/Ireland racing data — RPR, form, market movers', status: 'pending' },
    ]}
  />
}
