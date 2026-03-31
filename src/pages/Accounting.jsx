import PlaceholderPage from '../components/PlaceholderPage.jsx'
export default function Accounting() {
  return <PlaceholderPage
    title="Accounting" icon="◇"
    description="Financial reconciliation, bank and exchange balance tracking, P&L statements, and Nasheetah's financial ops interface."
    modules={[
      { name: 'Exchange Balances', desc: 'Betfair account balance, available funds, exposure', status: 'pending' },
      { name: 'Reconciliation', desc: 'Bet P&L vs bank movements, period close', status: 'pending' },
      { name: 'P&L Statements', desc: 'Formal profit & loss by period for financial records', status: 'pending' },
      { name: 'Withdrawals & Deposits', desc: 'Fund movement history and scheduling', status: 'pending' },
    ]}
  />
}
