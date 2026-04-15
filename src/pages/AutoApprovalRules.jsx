import React, { useEffect, useState } from 'react'
import { createApiClient } from '../api/client.js'
import { PageHeader, Card, Table, Th, Td, Badge, Btn, Modal, FormRow, Input, Select, EmptyState, NoTenant, Alert, Toggle } from './shared.jsx'

const OPS = ['EQUAL_TO', 'LESS_THAN_OR_EQUAL', 'GREATER_THAN']
const EMPTY_FORM = { category: '', conditionField: '', conditionOp: 'LESS_THAN_OR_EQUAL', thresholdValue: '', mode: 'AUTO', isActive: true }

export default function AutoApprovalRules({ tenantId }) {
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
    api.get('/api/config/auto-approval-rules').then(r => setRows(r.data)).catch(() => {}).finally(() => setLoading(false))
  }, [tenantId])

  function openAdd() { setForm(EMPTY_FORM); setError(''); setModal({ mode: 'add' }) }
  function openEdit(row) {
    setForm({
      category: row.category, conditionField: row.conditionField || '',
      conditionOp: row.conditionOp || 'LESS_THAN_OR_EQUAL',
      thresholdValue: row.thresholdValue || '', mode: row.mode, isActive: row.isActive,
    })
    setError(''); setModal({ mode: 'edit', row })
  }

  async function save() {
    if (!form.category.trim()) { setError('Category is required'); return }
    setSaving(true); setError('')
    try {
      const body = {
        category: form.category.trim(),
        conditionField: form.conditionField || null,
        conditionOp: form.conditionOp || null,
        thresholdValue: form.thresholdValue || null,
        mode: form.mode,
        isActive: form.isActive,
      }
      if (modal.mode === 'add') {
        const r = await api.post('/api/config/auto-approval-rules', body)
        setRows(prev => [...prev, r.data])
      } else {
        const r = await api.put(`/api/config/auto-approval-rules/${modal.row.id}`, body)
        setRows(prev => prev.map(x => x.id === modal.row.id ? r.data : x))
      }
      setModal(null)
    } catch (e) {
      setError(e.response?.data?.error || 'Save failed')
    } finally { setSaving(false) }
  }

  async function del(id) {
    if (!confirm('Delete this rule?')) return
    await api.delete(`/api/config/auto-approval-rules/${id}`)
    setRows(prev => prev.filter(x => x.id !== id))
  }

  async function toggleMode(row) {
    const newMode = row.mode === 'AUTO' ? 'MANUAL' : 'AUTO'
    try {
      const r = await api.put(`/api/config/auto-approval-rules/${row.id}`, { ...row, mode: newMode })
      setRows(prev => prev.map(x => x.id === row.id ? r.data : x))
    } catch {}
  }

  if (!tenantId) return <NoTenant />

  return (
    <>
      <PageHeader
        icon="ri-robot-line"
        title="Auto-Approval Rules"
        sub="Conditions under which expenses are automatically approved"
        action={<Btn onClick={openAdd}><i className="ri-add-line" /> Add Rule</Btn>}
      />
      <Card>
        {loading ? <EmptyState icon="ri-loader-4-line" text="Loading…" /> :
         rows.length === 0 ? <EmptyState icon="ri-robot-line" text="No auto-approval rules configured yet" /> : (
          <Table>
            <thead>
              <tr>
                <Th>Category</Th><Th>Condition</Th><Th>Threshold</Th><Th>Mode</Th><Th align="right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map(row => (
                <tr key={row.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <Td><strong>{row.category}</strong></Td>
                  <Td muted>{row.conditionField ? `${row.conditionField} ${row.conditionOp}` : '—'}</Td>
                  <Td muted>{row.thresholdValue || '—'}</Td>
                  <Td>
                    <div
                      onClick={() => toggleMode(row)}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        padding: '4px 10px', borderRadius: 99, cursor: 'pointer', userSelect: 'none',
                        background: row.mode === 'AUTO' ? 'rgba(0,212,170,0.15)' : 'rgba(139,157,195,0.1)',
                        border: `1px solid ${row.mode === 'AUTO' ? 'rgba(0,212,170,0.3)' : 'var(--border)'}`,
                        fontSize: 12, fontWeight: 600,
                        color: row.mode === 'AUTO' ? 'var(--accent)' : 'var(--text-muted)',
                      }}
                    >
                      <i className={row.mode === 'AUTO' ? 'ri-robot-line' : 'ri-user-line'} />
                      {row.mode}
                    </div>
                  </Td>
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
        <Modal title={modal.mode === 'add' ? 'Add Auto-Approval Rule' : 'Edit Rule'} onClose={() => setModal(null)}>
          <FormRow label="Expense Category">
            <Input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="e.g. FUEL, TRAVEL_ALLOWANCE" />
          </FormRow>
          <FormRow label="Condition Field (optional)">
            <Input value={form.conditionField} onChange={e => setForm(f => ({ ...f, conditionField: e.target.value }))} placeholder="e.g. claimed_amount, gps_variance" />
          </FormRow>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FormRow label="Operator">
              <Select value={form.conditionOp} onChange={e => setForm(f => ({ ...f, conditionOp: e.target.value }))}>
                {OPS.map(o => <option key={o} value={o}>{o}</option>)}
              </Select>
            </FormRow>
            <FormRow label="Threshold">
              <Input value={form.thresholdValue} onChange={e => setForm(f => ({ ...f, thresholdValue: e.target.value }))} placeholder="e.g. 500" />
            </FormRow>
          </div>
          <FormRow label="Mode">
            <Select value={form.mode} onChange={e => setForm(f => ({ ...f, mode: e.target.value }))}>
              <option value="AUTO">AUTO — auto-approve if condition passes</option>
              <option value="MANUAL">MANUAL — always send to approval chain</option>
            </Select>
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
