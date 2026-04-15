import React, { useEffect, useState } from 'react'
import { createApiClient } from '../api/client.js'
import { PageHeader, Card, Table, Th, Td, Badge, Btn, Modal, FormRow, Input, Select, EmptyState, NoTenant, Alert, Toggle } from './shared.jsx'

const CONDITIONS = ['ABSENT_DATE', 'DUPLICATE_BILL', 'VEHICLE_GRADE', 'BACKDATING']
const COND_COLORS = { ABSENT_DATE: 'amber', DUPLICATE_BILL: 'blue', VEHICLE_GRADE: 'purple', BACKDATING: 'danger' }
const EMPTY_FORM = { description: '', condition: 'ABSENT_DATE', ruleType: 'ALWAYS_ON', isActive: true }

export default function AntiFraudRules({ tenantId }) {
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
    api.get('/api/config/anti-fraud-rules').then(r => setRows(r.data)).catch(() => {}).finally(() => setLoading(false))
  }, [tenantId])

  function openAdd() { setForm(EMPTY_FORM); setError(''); setModal({ mode: 'add' }) }
  function openEdit(row) {
    setForm({ description: row.description, condition: row.condition, ruleType: row.ruleType, isActive: row.isActive })
    setError(''); setModal({ mode: 'edit', row })
  }

  async function save() {
    if (!form.description.trim()) { setError('Description is required'); return }
    setSaving(true); setError('')
    try {
      const body = { ...form, description: form.description.trim() }
      if (modal.mode === 'add') {
        const r = await api.post('/api/config/anti-fraud-rules', body)
        setRows(prev => [...prev, r.data])
      } else {
        const r = await api.put(`/api/config/anti-fraud-rules/${modal.row.id}`, body)
        setRows(prev => prev.map(x => x.id === modal.row.id ? r.data : x))
      }
      setModal(null)
    } catch (e) {
      setError(e.response?.data?.error || 'Save failed')
    } finally { setSaving(false) }
  }

  async function del(id) {
    if (!confirm('Delete this rule?')) return
    await api.delete(`/api/config/anti-fraud-rules/${id}`)
    setRows(prev => prev.filter(x => x.id !== id))
  }

  async function toggleActive(row) {
    try {
      const r = await api.put(`/api/config/anti-fraud-rules/${row.id}`, { ...row, isActive: !row.isActive })
      setRows(prev => prev.map(x => x.id === row.id ? r.data : x))
    } catch {}
  }

  if (!tenantId) return <NoTenant />

  return (
    <>
      <PageHeader
        icon="ri-shield-check-line"
        title="Anti-Fraud Rules"
        sub="Rules that auto-reject fraudulent expense submissions"
        action={<Btn onClick={openAdd}><i className="ri-add-line" /> Add Rule</Btn>}
      />
      <Card>
        {loading ? <EmptyState icon="ri-loader-4-line" text="Loading…" /> :
         rows.length === 0 ? <EmptyState icon="ri-shield-check-line" text="No anti-fraud rules configured yet" /> : (
          <Table>
            <thead>
              <tr>
                <Th>Condition</Th><Th>Description</Th><Th>Type</Th><Th>Status</Th><Th align="right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map(row => (
                <tr key={row.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <Td><Badge variant={COND_COLORS[row.condition] || 'muted'}>{row.condition}</Badge></Td>
                  <Td style={{ maxWidth: 300 }}>
                    <span style={{ fontSize: 13, color: 'var(--text-soft)' }}>{row.description}</span>
                  </Td>
                  <Td>
                    <Badge variant={row.ruleType === 'ALWAYS_ON' ? 'danger' : 'muted'}>{row.ruleType}</Badge>
                  </Td>
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
        <Modal title={modal.mode === 'add' ? 'Add Anti-Fraud Rule' : 'Edit Rule'} onClose={() => setModal(null)}>
          <FormRow label="Condition">
            <Select value={form.condition} onChange={e => setForm(f => ({ ...f, condition: e.target.value }))}>
              {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
            </Select>
          </FormRow>
          <FormRow label="Description">
            <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Describe what this rule checks" />
          </FormRow>
          <FormRow label="Rule Type">
            <Select value={form.ruleType} onChange={e => setForm(f => ({ ...f, ruleType: e.target.value }))}>
              <option value="ALWAYS_ON">ALWAYS_ON</option>
              <option value="CONFIGURABLE">CONFIGURABLE</option>
            </Select>
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
