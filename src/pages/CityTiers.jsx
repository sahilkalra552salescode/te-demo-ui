import React, { useEffect, useState } from 'react'
import { createApiClient } from '../api/client.js'
import { PageHeader, Card, Table, Th, Td, Badge, Btn, Modal, FormRow, Input, Select, EmptyState, NoTenant } from './shared.jsx'

const TIER_LABELS = { 1: 'Metro', 2: 'Tier 2', 3: 'Tier 3' }
const TIER_COLORS = { 1: 'accent', 2: 'blue', 3: 'muted' }

export default function CityTiers({ tenantId }) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [modal, setModal] = useState(null) // null | { mode:'add' } | { mode:'edit', row }
  const [form, setForm] = useState({ cityName: '', tier: '1' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const api = tenantId ? createApiClient(tenantId) : null

  useEffect(() => {
    if (!api) return
    setLoading(true)
    api.get('/api/config/city-tiers')
      .then(r => setRows(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [tenantId])

  function openAdd() {
    setForm({ cityName: '', tier: '1' })
    setError('')
    setModal({ mode: 'add' })
  }

  function openEdit(row) {
    setForm({ cityName: row.cityName, tier: String(row.tier) })
    setError('')
    setModal({ mode: 'edit', row })
  }

  async function save() {
    if (!form.cityName.trim()) { setError('City name is required'); return }
    setSaving(true); setError('')
    try {
      const body = { cityName: form.cityName.trim(), tier: Number(form.tier) }
      if (modal.mode === 'add') {
        const r = await api.post('/api/config/city-tiers', body)
        setRows(prev => [...prev, r.data])
      } else {
        const r = await api.put(`/api/config/city-tiers/${modal.row.id}`, body)
        setRows(prev => prev.map(x => x.id === modal.row.id ? r.data : x))
      }
      setModal(null)
    } catch (e) {
      setError(e.response?.data?.error || 'Save failed')
    } finally { setSaving(false) }
  }

  async function del(id) {
    if (!confirm('Delete this city tier?')) return
    await api.delete(`/api/config/city-tiers/${id}`)
    setRows(prev => prev.filter(x => x.id !== id))
  }

  if (!tenantId) return <NoTenant />

  return (
    <>
      <PageHeader
        icon="ri-map-pin-2-line"
        title="City Tiers"
        sub="Map cities to Tier 1 / 2 / 3 for allowance calculations"
        action={<Btn onClick={openAdd}><i className="ri-add-line" /> Add City</Btn>}
      />

      <Card>
        {loading ? <EmptyState icon="ri-loader-4-line" text="Loading…" /> :
         rows.length === 0 ? <EmptyState icon="ri-map-pin-2-line" text="No city tiers configured yet" /> : (
          <Table>
            <thead>
              <tr>
                <Th>#</Th><Th>City</Th><Th>Tier</Th><Th align="right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map(row => (
                <tr key={row.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <Td muted>{row.id}</Td>
                  <Td><strong>{row.cityName}</strong></Td>
                  <Td><Badge variant={TIER_COLORS[row.tier]}>{TIER_LABELS[row.tier]}</Badge></Td>
                  <Td align="right">
                    <Btn size="sm" variant="ghost" onClick={() => openEdit(row)}>
                      <i className="ri-edit-line" />
                    </Btn>
                    <Btn size="sm" variant="danger" onClick={() => del(row.id)} style={{ marginLeft: 6 }}>
                      <i className="ri-delete-bin-line" />
                    </Btn>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      {modal && (
        <Modal title={modal.mode === 'add' ? 'Add City Tier' : 'Edit City Tier'} onClose={() => setModal(null)}>
          <FormRow label="City Name">
            <Input value={form.cityName} onChange={e => setForm(f => ({ ...f, cityName: e.target.value }))} placeholder="e.g. Mumbai" />
          </FormRow>
          <FormRow label="Tier">
            <Select value={form.tier} onChange={e => setForm(f => ({ ...f, tier: e.target.value }))}>
              <option value="1">Tier 1 — Metro</option>
              <option value="2">Tier 2</option>
              <option value="3">Tier 3 — Rural</option>
            </Select>
          </FormRow>
          {error && <p style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 12 }}>{error}</p>}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Btn variant="ghost" onClick={() => setModal(null)}>Cancel</Btn>
            <Btn onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Btn>
          </div>
        </Modal>
      )}
    </>
  )
}
