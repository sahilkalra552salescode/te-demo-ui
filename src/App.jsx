import React, { useMemo } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar.jsx'
import CityTiers from './pages/CityTiers.jsx'
import AllowanceMatrix from './pages/AllowanceMatrix.jsx'
import RouteMatrix from './pages/RouteMatrix.jsx'
import GlobalConfig from './pages/GlobalConfig.jsx'
import FrequencyRules from './pages/FrequencyRules.jsx'
import Grades from './pages/Grades.jsx'
import AntiFraudRules from './pages/AntiFraudRules.jsx'
import ValidationRules from './pages/ValidationRules.jsx'
import AutoApprovalRules from './pages/AutoApprovalRules.jsx'

// Tenant ID comes from URL query param: ?tenantId=org_1001
// In production, SalesHub injects this when loading the plugin.
function useTenantId() {
  return useMemo(() => {
    const params = new URLSearchParams(window.location.search)
    return params.get('tenantId') || ''
  }, [])
}

export default function App() {
  const tenantId = useTenantId()

  return (
    <BrowserRouter>
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar tenantId={tenantId} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {!tenantId && <NoTenantBanner />}
          <main style={{ flex: 1, padding: '24px', overflow: 'auto' }}>
            <Routes>
              <Route path="/" element={<Navigate to="/grades" replace />} />
              <Route path="/grades"             element={<Grades tenantId={tenantId} />} />
              <Route path="/city-tiers"         element={<CityTiers tenantId={tenantId} />} />
              <Route path="/allowance-matrix"   element={<AllowanceMatrix tenantId={tenantId} />} />
              <Route path="/route-matrix"       element={<RouteMatrix tenantId={tenantId} />} />
              <Route path="/global-config"      element={<GlobalConfig tenantId={tenantId} />} />
              <Route path="/frequency-rules"    element={<FrequencyRules tenantId={tenantId} />} />
              <Route path="/anti-fraud-rules"   element={<AntiFraudRules tenantId={tenantId} />} />
              <Route path="/validation-rules"   element={<ValidationRules tenantId={tenantId} />} />
              <Route path="/auto-approval-rules" element={<AutoApprovalRules tenantId={tenantId} />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  )
}

function NoTenantBanner() {
  return (
    <div style={{
      background: 'rgba(245,158,11,0.1)', borderBottom: '1px solid rgba(245,158,11,0.3)',
      padding: '10px 24px', display: 'flex', alignItems: 'center', gap: 10,
      fontSize: 13, color: '#f59e0b',
    }}>
      <i className="ri-alert-line" />
      No tenant configured. Append <code style={{ background: 'rgba(0,0,0,0.3)', padding: '1px 6px', borderRadius: 4 }}>?tenantId=org_1001</code> to the URL.
    </div>
  )
}
