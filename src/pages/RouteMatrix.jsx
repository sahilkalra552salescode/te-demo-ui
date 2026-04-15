import React, { useEffect, useRef, useState } from 'react'
import { createApiClient } from '../api/client.js'
import { PageHeader, Card, Table, Th, Td, Badge, Btn, Modal, FormRow, Input, Select, EmptyState, NoTenant, Alert } from './shared.jsx'

const EMPTY_FORM = { routeCode: '', fromTown: '', toTown: '', distanceKm: '', gradeId: '', taPerKm: '', daPerDay: '', nhPerNight: '0' }

export default function RouteMatrix({ tenantId }) {
  const [rows, setRows] = useState([])
  const [grades, setGrades] = useState([])
  const [loading, setLoading] = useState(false)
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [uploadResult, setUploadResult] = useState(null)
  const fileRef = useRef()

  const api = tenantId ? createApiClient(tenantId) : null

  useEffect(() => {
    if (!api) return
    setLoading(true)
    Promise.all([
      api.get('/api/config/route-matrix'),
      api.get('/api/grades'),
    ]).then(([r1, r2]) => {
      setRows(r1.data); setGrades(r2.data)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [tenantId])

  function gradeName(id) { return grades.find(g => g.id === id)?.name || id }
  const f = (k) => e => setForm(prev => ({ ...prev, [k]: e.target.value }))

  function openAdd() { setForm(EMPTY_FORM); setError(''); setModal({ mode: 'add' }) }
  function openEdit(row) {
    setForm({
      routeCode: row.routeCode, fromTown: row.fromTown, toTown: row.toTown,
      distanceKm: String(row.distanceKm), gradeId: String(row.gradeId),
      taPerKm: String(row.taPerKm), daPerDay: String(row.daPerDay), nhPerNight: String(row.nhPerNight),
    })
    setError(''); setModal({ mode: 'edit', row })
  }

  async function save() {
    if (!form.routeCode || !form.fromTown || !form.toTown || !form.gradeId) {
      setError('Route code, towns, and grade are required'); return
    }
    setSaving(true); setError('')
    try {
      const body = {
        routeCode: form.routeCode, fromTown: form.fromTown, toTown: form.toTown,
        distanceKm: Number(form.distanceKm), gradeId: Number(form.gradeId),
        taPerKm: Number(form.taPerKm), daPerDay: Number(form.daPerDay),
        nhPerNight: Number(form.nhPerNight || 0),
      }
      if (modal.mode === 'add') {
        const r = await api.post('/api/config/route-matrix', body)
        setRows(prev => [...prev, r.data])
      } else {
        const r = await api.put(`/api/config/route-matrix/${modal.row.id}`, body)
        setRows(prev => prev.map(x => x.id === modal.row.id ? r.data : x))
      }
      setModal(null)
    } catch (e) {
      setError(e.response?.data?.error || 'Save failed')
    } finally { setSaving(false) }
  }

  async function del(id) {
    if (!confirm('Delete this route?')) return
    await api.delete(`/api/config/route-matrix/${id}`)
    setRows(prev => prev.filter(x => x.id !== id))
  }

  async function handleUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    const fd = new FormData(); fd.append('file', file)
    try {
      const r = await api.post('/api/config/route-matrix/bulk-upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setUploadResult(r.data)
      const fresh = await api.get('/api/config/route-matrix')
      setRows(fresh.data)
    } catch (e) {
      setUploadResult({ error: e.response?.data?.error || 'Upload failed' })
    } finally { fileRef.current.value = '' }
  }

  function downloadTemplate() {
    const csv = 'route_code,from_town,to_town,distance_km,grade_name,ta_per_km,da_per_day,nh_per_night\nRT001,Mumbai,Pune,150,G1,2.50,300.00,500.00\n'
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv])); a.download = 'route_matrix_template.csv'; a.click()
  }

  if (!tenantId) return <NoTenant />

  return (
    <>
      <PageHeader
        icon="ri-road-map-line"
        title="Route Matrix"
        sub="Town-to-town TA/DA rates by grade"
        action={
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn variant="ghost" onClick={downloadTemplate}><i className="ri-download-line" /> Template</Btn>
            <Btn variant="ghost" onClick={() => fileRef.current.click()}><i className="ri-upload-cloud-line" /> CSV Upload</Btn>
            <Btn onClick={openAdd}><i className="ri-add-line" /> Add Route</Btn>
            <input ref={fileRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={handleUpload} />
          </div>
        }
      />

      {uploadResult && (
        <div style={{ marginBottom: 16 }}>
          {uploadResult.error
            ? <Alert type="error">{uploadResult.error}</Alert>
            : <Alert type="success">
                Imported {uploadResult.imported} / {uploadResult.total} rows.
                {uploadResult.skipped > 0 && ` Skipped: ${uploadResult.skipped}.`}
                {uploadResult.errors?.length > 0 && (
                  <ul style={{ marginTop: 6, paddingLeft: 16 }}>
                    {uploadResult.errors.map((e, i) => <li key={i}>Row {e.row}: {e.reason}</li>)}
                  </ul>
                )}
              </Alert>
          }
        </div>
      )}

      <Card>
        {loading ? <EmptyState icon="ri-loader-4-line" text="Loading…" /> :
         rows.length === 0 ? <EmptyState icon="ri-road-map-line" text="No routes configured yet. Add manually or upload CSV." /> : (
          <Table>
            <thead>
              <tr>
                <Th>Route</Th><Th>From → To</Th><Th>Grade</Th><Th>Dist km</Th><Th>TA ₹/km</Th><Th>DA ₹/day</Th><Th>NH ₹/night</Th><Th align="right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map(row => (
                <tr key={row.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <Td><Badge variant="blue">{row.routeCode}</Badge></Td>
                  <Td>{row.fromTown} → {row.toTown}</Td>
                  <Td><Badge variant="purple">{gradeName(row.gradeId)}</Badge></Td>
                  <Td muted>{row.distanceKm}</Td>
                  <Td>₹{row.taPerKm}</Td>
                  <Td>₹{row.daPerDay}</Td>
                  <Td>₹{row.nhPerNight}</Td>
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
        <Modal title={modal.mode === 'add' ? 'Add Route' : 'Edit Route'} onClose={() => setModal(null)} width={520}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FormRow label="Route Code"><Input value={form.routeCode} onChange={f('routeCode')} placeholder="RT001" /></FormRow>
            <FormRow label="Grade">
              <Select value={form.gradeId} onChange={f('gradeId')}>
                <option value="">Select</option>
                {grades.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </Select>
            </FormRow>
            <FormRow label="From Town"><Input value={form.fromTown} onChange={f('fromTown')} placeholder="Mumbai" /></FormRow>
            <FormRow label="To Town"><Input value={form.toTown} onChange={f('toTown')} placeholder="Pune" /></FormRow>
            <FormRow label="Distance (km)"><Input value={form.distanceKm} onChange={f('distanceKm')} type="number" /></FormRow>
            <FormRow label="TA ₹/km"><Input value={form.taPerKm} onChange={f('taPerKm')} type="number" /></FormRow>
            <FormRow label="DA ₹/day"><Input value={form.daPerDay} onChange={f('daPerDay')} type="number" /></FormRow>
            <FormRow label="NH ₹/night"><Input value={form.nhPerNight} onChange={f('nhPerNight')} type="number" /></FormRow>
          </div>
          {error && <Alert type="error">{error}</Alert>}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
            <Btn variant="ghost" onClick={() => setModal(null)}>Cancel</Btn>
            <Btn onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Btn>
          </div>
        </Modal>
      )}
    </>
  )
}
