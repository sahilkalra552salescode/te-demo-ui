import React, { useEffect, useState } from 'react'
import { createApiClient } from '../api/client.js'
import { PageHeader, Card, Table, Th, Td, Badge, Btn, Modal, FormRow, Input, Select, EmptyState, NoTenant, Alert, Toggle } from './shared.jsx'

const CHECK_TYPES = ['GEO_FENCE', 'GRADE_LIMIT', 'ODOMETER_VARIANCE', 'NIGHT_HALT_VERIFY']
const CHECK_COLORS = { GEO_FENCE: 'accent', GRADE_LIMIT: 'blue', ODOMETER_VARIANCE: 'amber', NIGHT_HALT_VERIFY: 'purple' }
const EMPTY_FORM = { category: '', checkType: 'GEO_FENCE', isActive: true }

export default function ValidationRules({ tenantId }) {
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
    api.get('/api/config/validation-rules').then(r => setRows(r.data)).catch(() => {}).finally(() => setLoading(false))
  }, [tenantId])

  function openAdd() { setForm(EMPTY_FORM); setError(''); setModal({ mode: 'add' }) }
  function openEdit(row) {
    setForm({ category: row.category, checkType: row.checkType, isActive: row.isActive })
    setError(''); setModal({ mode: 'edit', row })
  }

  async function save() {
    if (!form.category.trim()) { setError('Category is required'); return }
    setSaving(true); setError('')
    try {
      const body = { ...form, category: form.category.trim() }
      if (modal.mode === 'add') {
        const r = await api.post('/api/config/validation-rules', body)
        setRows(prev => [...prev, r.data])
      } else {
        const r = await api.put(`/api/config/validation-rules/${modal.row.id}`, body)
        setRows(prev => prev.map(x => x.id === modal.row.id ? r.data : x))
      }
      setModal(null)
    } catch (e) {
      setError(e.response?.data?.error || 'Save failed')
    } finally { setSaving(false) }
  }

  async function del(id) {
    if (!confirm('Delete this rule?')) return
    await api.delete(`/api/config/validation-rules/${id}`)
    setRows(prev => prev.filter(x => x.id !== id))
  }

  async function toggleActive(row) {
    try {
      const r = await api.put(`/api/config/validation-rules/${row.id}`, { ...row, isActive: !row.isActive })
      setRows(prev => prev.map(x => x.id === row.id ? r.data : x))
    } catch {}
  }

  if (!tenantId) return <NoTenant />

  return (
    <>
      <PageHeader
        icon="ri-checkbox-circle-line"
        title="Validation Rules"
        sub="Checks that flag expenses without auto-rejecting them"
        action={<Btn onClick={openAdd}><i className="ri-add-line" /> Add Rule</Btn>}
      />
      <Card>
        {loading ? <EmptyState icon="ri-loader-4-line" text="Loading…" /> :
         rows.length === 0 ? <EmptyState icon="ri-checkbox-circle-line" text="No validation rules configured yet" /> : (
          <Table>
            <thead>
              <tr>
                <Th>Check Type</Th><Th>Category</Th><Th>Status</Th><Th align="right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map(row => (
                <tr key={row.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <Td><Badge variant={CHECK_COLORS[row.checkType] || 'muted'}>{row.checkType}</Badge></Td>
                  <Td><strong>{row.category}</strong></Td>
                  <Td><Toggle value={row.isActive} onChange={() => toggleActive(row)} /></Td>
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
        <Modal title={modal.mode === 'add' ? 'Add Validation Rule' : 'Edit Rule'} onClose={() => setModal(null)}>
          <FormRow label="Check Type">
            <Select value={form.checkType} onChange={e => setForm(f => ({ ...f, checkType: e.target.value }))}>
              {CHECK_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </Select>
          </FormRow>
          <FormRow label="Category">
            <Input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="e.g. FUEL, TRAVEL_ALLOWANCE" />
          </FormRow>
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
