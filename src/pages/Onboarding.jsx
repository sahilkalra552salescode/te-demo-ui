import React, { useState } from 'react'
import { adminClient } from '../api/client.js'
import { PageHeader, Card, FormRow, Input, Btn, Alert } from './shared.jsx'

export default function Onboarding() {
  const [tenantId, setTenantId] = useState('')
  const [clientName, setClientName] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  async function submit() {
    if (!tenantId.trim()) { setError('Tenant ID is required'); return }
    if (!clientName.trim()) { setError('Client name is required'); return }
    setLoading(true); setError(''); setResult(null)
    try {
      const r = await adminClient.post('/admin/clients/onboard', {
        tenantId: tenantId.trim(),
        clientName: clientName.trim(),
      })
      setResult(r.data)
      setTenantId(''); setClientName('')
    } catch (e) {
      setError(e.response?.data?.error || 'Onboarding failed')
    } finally { setLoading(false) }
  }

  return (
    <>
      <PageHeader
        icon="ri-user-add-line"
        title="Onboard Client"
        sub="Create a new tenant schema and run all migrations"
      />
      <div style={{ maxWidth: 480 }}>
        <Card style={{ padding: 24 }}>
          <FormRow label="Tenant ID">
            <Input
              value={tenantId}
              onChange={e => setTenantId(e.target.value)}
              placeholder="e.g. org_1001"
            />
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 5 }}>
              This becomes the Postgres schema name. Use format: <code style={{ color: 'var(--accent)' }}>org_&#123;id&#125;</code>
            </p>
          </FormRow>
          <FormRow label="Client Name">
            <Input
              value={clientName}
              onChange={e => setClientName(e.target.value)}
              placeholder="e.g. Acme Corp"
            />
          </FormRow>

          {error && <Alert type="error">{error}</Alert>}
          {result && (
            <Alert type="success">
              <strong>{result.clientName}</strong> onboarded successfully.
              Schema: <code style={{ color: 'var(--accent)' }}>{result.schemaName}</code> — Status: {result.status}
            </Alert>
          )}

          <Btn onClick={submit} disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
            {loading ? <><i className="ri-loader-4-line" /> Creating schema…</> : <><i className="ri-rocket-line" /> Onboard Client</>}
          </Btn>
        </Card>

        <Card style={{ padding: 20, marginTop: 16 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
            What this does
          </p>
          <ul style={{ fontSize: 13, color: 'var(--text-soft)', lineHeight: 1.8, paddingLeft: 16 }}>
            <li>Creates Postgres schema <code style={{ color: 'var(--accent)' }}>&#123;tenantId&#125;</code></li>
            <li>Registers tenant in <code style={{ color: 'var(--accent)' }}>public.tenants</code></li>
            <li>Runs Flyway migrations V1–V8 (18 tables)</li>
            <li>Registers HikariCP connection pool</li>
            <li>All config starts empty — no pre-seeded data</li>
          </ul>
        </Card>
      </div>
    </>
  )
}
