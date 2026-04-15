import React, { useEffect, useState } from 'react'
import { createApiClient } from '../api/client.js'
import { PageHeader, Card, Table, Th, Td, Badge, Btn, Modal, FormRow, Input, Select, EmptyState, NoTenant, Alert } from './shared.jsx'

const TIER_LABELS = { 1: 'Metro', 2: 'Tier 2', 3: 'Tier 3' }
const TIER_COLORS = { 1: 'accent', 2: 'blue', 3: 'muted' }

const EMPTY_FORM = { gradeId: '', tier: '1', daRate: '', taRate: '', mealLimit: '0', nightHaltLimit: '0' }

export default function AllowanceMatrix({ tenantId }) {
  const [rows, setRows] = useState([])
  const [grades, setGrades] = useState([])
  const [loading, setLoading] = useState(false)
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const api = tenantId ? createApiClient(tenantId) : null

  useEffect(() => {
    if (!api) return
    setLoading(true)
    Promise.all([
      api.get('/api/config/allowance-matrix'),
      api.get('/api/grades'),
    ]).then(([r1, r2]) => {
      setRows(r1.data)
      setGrades(r2.data)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [tenantId])

  function gradeName(id) {
    return grades.find(g => g.id === id)?.name || id
  }

  function openAdd() {
    setForm(EMPTY_FORM)
    setError('')
    setModal({ mode: 'add' })
  }

  function openEdit(row) {
    setForm({
      gradeId: String(row.gradeId), tier: String(row.tier),
      daRate: String(row.daRate), taRate: String(row.taRate),
      mealLimit: String(row.mealLimit), nightHaltLimit: String(row.nightHaltLimit),
    })
    setError('')
    setModal({ mode: 'edit', row })
  }

  async function save() {
    if (!form.gradeId) { setError('Grade is required'); return }
    if (!form.daRate || !form.taRate) { setError('DA Rate and TA Rate are required'); return }
    setSaving(true); setError('')
    try {
      const body = {
        gradeId: Number(form.gradeId),
        tier: Number(form.tier),
        daRate: Number(form.daRate),
        taRate: Number(form.taRate),
        mealLimit: Number(form.mealLimit || 0),
        nightHaltLimit: Number(form.nightHaltLimit || 0),
      }
      if (modal.mode === 'add') {
        const r = await api.post('/api/config/allowance-matrix', body)
        setRows(prev => [...prev, r.data])
      } else {
        const r = await api.put(`/api/config/allowance-matrix/${modal.row.id}`, body)
        setRows(prev => prev.map(x => x.id === modal.row.id ? r.data : x))
      }
      setModal(null)
    } catch (e) {
      setError(e.response?.data?.error || 'Save failed')
    } finally { setSaving(false) }
  }

  async function del(id) {
    if (!confirm('Delete this entry?')) return
    await api.delete(`/api/config/allowance-matrix/${id}`)
    setRows(prev => prev.filter(x => x.id !== id))
  }

  const f = (k) => e => setForm(prev => ({ ...prev, [k]: e.target.value }))

  if (!tenantId) return <NoTenant />

  return (
    <>
      <PageHeader
        icon="ri-money-dollar-circle-line"
        title="Allowance Matrix"
        sub="DA/TA rates per grade × city tier"
        action={<Btn onClick={openAdd}><i className="ri-add-line" /> Add Entry</Btn>}
      />
      <Card>
        {loading ? <EmptyState icon="ri-loader-4-line" text="Loading…" /> :
         rows.length === 0 ? <EmptyState icon="ri-grid-line" text="No allowance matrix configured yet" /> : (
          <Table>
            <thead>
              <tr>
                <Th>Grade</Th><Th>Tier</Th><Th>DA Rate</Th><Th>TA ₹/km</Th><Th>Meal Limit</Th><Th>Night Halt</Th><Th align="right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map(row => (
                <tr key={row.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <Td><Badge variant="purple">{gradeName(row.gradeId)}</Badge></Td>
                  <Td><Badge variant={TIER_COLORS[row.tier]}>{TIER_LABELS[row.tier]}</Badge></Td>
                  <Td>₹{row.daRate}</Td>
                  <Td>₹{row.taRate}</Td>
                  <Td>₹{row.mealLimit}</Td>
                  <Td>₹{row.nightHaltLimit}</Td>
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
        <Modal title={modal.mode === 'add' ? 'Add Allowance Entry' : 'Edit Allowance Entry'} onClose={() => setModal(null)}>
          <FormRow label="Grade">
            <Select value={form.gradeId} onChange={f('gradeId')}>
              <option value="">Select grade</option>
              {grades.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
            </Select>
          </FormRow>
          <FormRow label="City Tier">
            <Select value={form.tier} onChange={f('tier')}>
              <option value="1">Tier 1 — Metro</option>
              <option value="2">Tier 2</option>
              <option value="3">Tier 3 — Rural</option>
            </Select>
          </FormRow>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FormRow label="DA Rate ₹/day"><Input value={form.daRate} onChange={f('daRate')} placeholder="0.00" type="number" /></FormRow>
            <FormRow label="TA Rate ₹/km"><Input value={form.taRate} onChange={f('taRate')} placeholder="0.0000" type="number" /></FormRow>
            <FormRow label="Meal Limit ₹"><Input value={form.mealLimit} onChange={f('mealLimit')} placeholder="0" type="number" /></FormRow>
            <FormRow label="Night Halt ₹"><Input value={form.nightHaltLimit} onChange={f('nightHaltLimit')} placeholder="0" type="number" /></FormRow>
          </div>
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
