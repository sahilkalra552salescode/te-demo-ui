import React, { useEffect, useState } from 'react'
import { createApiClient } from '../api/client.js'
import { PageHeader, Card, EmptyState, NoTenant, Alert, Btn, Input } from './shared.jsx'

export default function GlobalConfig({ tenantId }) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState({}) // { [key]: draftValue }
  const [saving, setSaving] = useState({})
  const [alerts, setAlerts] = useState({})
  const [newKey, setNewKey] = useState('')
  const [newVal, setNewVal] = useState('')
  const [addError, setAddError] = useState('')

  const api = tenantId ? createApiClient(tenantId) : null

  useEffect(() => {
    if (!api) return
    setLoading(true)
    api.get('/api/config/global-config')
      .then(r => setRows(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [tenantId])

  function startEdit(row) {
    setEditing(prev => ({ ...prev, [row.configKey]: row.configValue }))
  }

  function cancelEdit(key) {
    setEditing(prev => { const n = { ...prev }; delete n[key]; return n })
    setAlerts(prev => { const n = { ...prev }; delete n[key]; return n })
  }

  async function saveEdit(key) {
    setSaving(prev => ({ ...prev, [key]: true }))
    try {
      const r = await api.put(`/api/config/global-config/${key}`, { configValue: editing[key] })
      setRows(prev => prev.map(x => x.configKey === key ? r.data : x))
      cancelEdit(key)
      setAlerts(prev => ({ ...prev, [key + '_ok']: true }))
      setTimeout(() => setAlerts(prev => { const n = { ...prev }; delete n[key + '_ok']; return n }), 2000)
    } catch (e) {
      setAlerts(prev => ({ ...prev, [key]: e.response?.data?.error || 'Save failed' }))
    } finally {
      setSaving(prev => { const n = { ...prev }; delete n[key]; return n })
    }
  }

  async function addNew() {
    if (!newKey.trim()) { setAddError('Key is required'); return }
    if (!newVal.trim()) { setAddError('Value is required'); return }
    setAddError('')
    try {
      const r = await api.put(`/api/config/global-config/${newKey.trim()}`, { configValue: newVal.trim() })
      setRows(prev => {
        const exists = prev.find(x => x.configKey === newKey.trim())
        return exists ? prev.map(x => x.configKey === newKey.trim() ? r.data : x) : [...prev, r.data]
      })
      setNewKey(''); setNewVal('')
    } catch (e) {
      setAddError(e.response?.data?.error || 'Add failed')
    }
  }

  if (!tenantId) return <NoTenant />

  return (
    <>
      <PageHeader
        icon="ri-settings-4-line"
        title="Global Config"
        sub="Key-value configuration — geo-fence params, tolerances, fallback rates"
      />

      {/* Add new key-value */}
      <Card style={{ marginBottom: 16, padding: 16 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Add / Update Key</p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: '1 1 180px' }}>
            <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Config Key</label>
            <Input value={newKey} onChange={e => setNewKey(e.target.value)} placeholder="e.g. activity_radius_meters" />
          </div>
          <div style={{ flex: '1 1 180px' }}>
            <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Value</label>
            <Input value={newVal} onChange={e => setNewVal(e.target.value)} placeholder="e.g. 500" />
          </div>
          <Btn onClick={addNew}><i className="ri-add-line" /> Add</Btn>
        </div>
        {addError && <p style={{ color: 'var(--danger)', fontSize: 12, marginTop: 8 }}>{addError}</p>}
      </Card>

      <Card>
        {loading ? <EmptyState icon="ri-loader-4-line" text="Loading…" /> :
         rows.length === 0 ? <EmptyState icon="ri-settings-4-line" text="No config keys yet. Add your first key above." /> : (
          <div>
            {rows.map((row, i) => {
              const isEditing = editing[row.configKey] !== undefined
              return (
                <div key={row.configKey} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                  borderBottom: i < rows.length - 1 ? '1px solid var(--border)' : 'none',
                }}>
                  <span style={{
                    fontFamily: 'monospace', fontSize: 13, fontWeight: 600,
                    color: 'var(--accent)', minWidth: 240, flexShrink: 0,
                  }}>{row.configKey}</span>

                  {isEditing ? (
                    <>
                      <Input
                        value={editing[row.configKey]}
                        onChange={e => setEditing(prev => ({ ...prev, [row.configKey]: e.target.value }))}
                        style={{ flex: 1, minWidth: 0 }}
                      />
                      {alerts[row.configKey] && <span style={{ color: 'var(--danger)', fontSize: 12 }}>{alerts[row.configKey]}</span>}
                      <Btn size="sm" onClick={() => saveEdit(row.configKey)} disabled={saving[row.configKey]}>
                        {saving[row.configKey] ? '…' : <><i className="ri-check-line" /></>}
                      </Btn>
                      <Btn size="sm" variant="ghost" onClick={() => cancelEdit(row.configKey)}><i className="ri-close-line" /></Btn>
                    </>
                  ) : (
                    <>
                      <span style={{ flex: 1, fontSize: 13, color: 'var(--text-soft)' }}>{row.configValue}</span>
                      {alerts[row.configKey + '_ok'] && <span style={{ color: 'var(--accent)', fontSize: 12 }}>Saved</span>}
                      <Btn size="sm" variant="ghost" onClick={() => startEdit(row)}><i className="ri-edit-line" /></Btn>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </Card>
    </>
  )
}
