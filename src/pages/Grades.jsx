import React, { useEffect, useState } from 'react'
import { createApiClient } from '../api/client.js'
import { PageHeader, Card, Table, Th, Td, Badge, Btn, Modal, FormRow, Input, EmptyState, NoTenant, Alert } from './shared.jsx'

export default function Grades({ tenantId }) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [modal, setModal] = useState(null)
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const api = tenantId ? createApiClient(tenantId) : null

  useEffect(() => {
    if (!api) return
    setLoading(true)
    api.get('/api/grades').then(r => setRows(r.data)).catch(() => {}).finally(() => setLoading(false))
  }, [tenantId])

  function openAdd() { setName(''); setError(''); setModal({ mode: 'add' }) }
  function openEdit(row) { setName(row.name); setError(''); setModal({ mode: 'edit', row }) }

  async function save() {
    if (!name.trim()) { setError('Grade name is required'); return }
    setSaving(true); setError('')
    try {
      const body = { name: name.trim().toUpperCase() }
      if (modal.mode === 'add') {
        const r = await api.post('/api/grades', body)
        setRows(prev => [...prev, r.data])
      } else {
        const r = await api.put(`/api/grades/${modal.row.id}`, body)
        setRows(prev => prev.map(x => x.id === modal.row.id ? r.data : x))
      }
      setModal(null)
    } catch (e) {
      setError(e.response?.data?.error || 'Save failed')
    } finally { setSaving(false) }
  }

  async function del(id) {
    if (!confirm('Delete this grade? This will break any allowance/route matrix rows referencing it.')) return
    await api.delete(`/api/grades/${id}`)
    setRows(prev => prev.filter(x => x.id !== id))
  }

  if (!tenantId) return <NoTenant />

  return (
    <>
      <PageHeader
        icon="ri-award-line"
        title="Grades"
        sub="Employee grades used in allowance matrix and route matrix"
        action={<Btn onClick={openAdd}><i className="ri-add-line" /> Add Grade</Btn>}
      />
      <Card>
        {loading ? <EmptyState icon="ri-loader-4-line" text="Loading…" /> :
         rows.length === 0 ? <EmptyState icon="ri-award-line" text="No grades configured yet" /> : (
          <Table>
            <thead>
              <tr>
                <Th>#</Th><Th>Grade</Th><Th align="right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map(row => (
                <tr key={row.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <Td muted>{row.id}</Td>
                  <Td><Badge variant="purple">{row.name}</Badge></Td>
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
        <Modal title={modal.mode === 'add' ? 'Add Grade' : 'Edit Grade'} onClose={() => setModal(null)}>
          <FormRow label="Grade Name">
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. G1" />
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
