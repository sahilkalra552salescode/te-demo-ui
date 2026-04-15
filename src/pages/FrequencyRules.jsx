import React, { useEffect, useState } from 'react'
import { createApiClient } from '../api/client.js'
import { PageHeader, Card, Table, Th, Td, Badge, Btn, Modal, FormRow, Input, Select, EmptyState, NoTenant, Alert, Toggle } from './shared.jsx'

const FREQ_TYPES = ['CUMULATIVE_CAP', 'MAX_COUNT', 'UNLIMITED']
const FREQ_COLORS = { CUMULATIVE_CAP: 'amber', MAX_COUNT: 'blue', UNLIMITED: 'accent' }
const EMPTY_FORM = { category: '', frequencyType: 'UNLIMITED', maxPerDay: '', isActive: true }

export default function FrequencyRules({ tenantId }) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const api = tenantId ? createApiClient(tenantId) : null

  useEffect(() => {
    if (!api) return
    setLoading(true)
    api.get('/api/config/expense-frequency-rules')
      .then(r => setRows(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [tenantId])

  function openAdd() { setForm(EMPTY_FORM); setError(''); setModal({ mode: 'add' }) }
  function openEdit(row) {
    setForm({ category: row.category, frequencyType: row.frequencyType, maxPerDay: row.maxPerDay ?? '', isActive: row.isActive })
    setError(''); setModal({ mode: 'edit', row })
  }

  async function save() {
    if (!form.category.trim()) { setError('Category is required'); return }
    setSaving(true); setError('')
    try {
      const body = {
        category: form.category.trim(),
        frequencyType: form.frequencyType,
        maxPerDay: form.maxPerDay !== '' ? Number(form.maxPerDay) : null,
        isActive: form.isActive,
      }
      if (modal.mode === 'add') {
        const r = await api.post('/api/config/expense-frequency-rules', body)
        setRows(prev => [...prev, r.data])
      } else {
        const r = await api.put(`/api/config/expense-frequency-rules/${modal.row.id}`, body)
        setRows(prev => prev.map(x => x.id === modal.row.id ? r.data : x))
      }
      setModal(null)
    } catch (e) {
      setError(e.response?.data?.error || 'Save failed')
    } finally { setSaving(false) }
  }

  async function del(id) {
    if (!confirm('Delete this rule?')) return
    await api.delete(`/api/config/expense-frequency-rules/${id}`)
    setRows(prev => prev.filter(x => x.id !== id))
  }

  async function toggleActive(row) {
    try {
      const r = await api.put(`/api/config/expense-frequency-rules/${row.id}`, { ...row, isActive: !row.isActive })
      setRows(prev => prev.map(x => x.id === row.id ? r.data : x))
    } catch {}
  }

  if (!tenantId) return <NoTenant />

  return (
    <>
      <PageHeader
        icon="ri-repeat-line"
        title="Expense Frequency Rules"
        sub="Control how often each expense category can be submitted"
        action={<Btn onClick={openAdd}><i className="ri-add-line" /> Add Rule</Btn>}
      />
      <Card>
        {loading ? <EmptyState icon="ri-loader-4-line" text="Loading…" /> :
         rows.length === 0 ? <EmptyState icon="ri-repeat-line" text="No frequency rules configured yet" /> : (
          <Table>
            <thead>
              <tr>
                <Th>Category</Th><Th>Frequency Type</Th><Th>Max / Day</Th><Th>Status</Th><Th align="right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map(row => (
                <tr key={row.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <Td><strong>{row.category}</strong></Td>
                  <Td><Badge variant={FREQ_COLORS[row.frequencyType]}>{row.frequencyType}</Badge></Td>
                  <Td muted>{row.maxPerDay ?? '—'}</Td>
                  <Td><Toggle value={row.isActive} onChange={() => toggleActive(row)} labelOn="Active" labelOff="Inactive" /></Td>
                  <Td align="right">
                    <Btn size="sm" variant="ghost" onClick={() => openEdit(row)}><i className="ri-edit-line" /></Btn>
                    <Btn size="sm" variant="danger" onClick={() => del(row.id)} style={{ marginLeft: 6 }}><i className="ri-delete-bin-line" /></Btn>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      {modal && (
        <Modal title={modal.mode === 'add' ? 'Add Frequency Rule' : 'Edit Frequency Rule'} onClose={() => setModal(null)}>
          <FormRow label="Expense Category">
            <Input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="e.g. FUEL, TRAVEL_ALLOWANCE" />
          </FormRow>
          <FormRow label="Frequency Type">
            <Select value={form.frequencyType} onChange={e => setForm(f => ({ ...f, frequencyType: e.target.value }))}>
              {FREQ_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </Select>
          </FormRow>
          {form.frequencyType !== 'UNLIMITED' && (
            <FormRow label="Max Per Day">
              <Input value={form.maxPerDay} onChange={e => setForm(f => ({ ...f, maxPerDay: e.target.value }))} type="number" placeholder="e.g. 1" />
            </FormRow>
          )}
          <FormRow label="Status">
            <Toggle value={form.isActive} onChange={v => setForm(f => ({ ...f, isActive: v }))} />
          </FormRow>
          {error && <Alert type="error">{error}</Alert>}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Btn variant="ghost" onClick={() => setModal(null)}>Cancel</Btn>
            <Btn onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Btn>
          </div>
        </Modal>
      )}
    </>
  )
}
