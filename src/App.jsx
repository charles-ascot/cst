import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Layout from './components/Layout.jsx'
import Login from './pages/Login.jsx'
import Strategy from './pages/Strategy.jsx'
import BettingEngine from './pages/BettingEngine.jsx'
import Operations from './pages/Operations.jsx'
import Dashboards from './pages/Dashboards.jsx'
import FSULibrary from './pages/FSULibrary.jsx'
import FSU1E from './pages/FSU1E.jsx'
import Reporting from './pages/Reporting.jsx'
import Accounting from './pages/Accounting.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/strategy" replace />} />
        <Route path="strategy"   element={<Strategy />} />
        <Route path="engine"     element={<BettingEngine />} />
        <Route path="operations" element={<Operations />} />
        <Route path="dashboards" element={<Dashboards />} />
        <Route path="fsu-library"      element={<FSULibrary />} />
        <Route path="fsu-library/fsu1e" element={<FSU1E />} />
        <Route path="reporting"  element={<Reporting />} />
        <Route path="accounting" element={<Accounting />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
