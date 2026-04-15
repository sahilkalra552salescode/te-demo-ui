import React from 'react'

// ── Page Header ──────────────────────────────────────────
export function PageHeader({ icon, title, sub, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: 'linear-gradient(135deg, rgba(0,212,170,0.2), rgba(59,130,246,0.2))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '1px solid rgba(0,212,170,0.3)',
        }}>
          <i className={icon} style={{ fontSize: 18, color: 'var(--accent)' }} />
        </div>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>{title}</h1>
          {sub && <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>{sub}</p>}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}

// ── Card ─────────────────────────────────────────────────
export function Card({ children, style: extra }) {
  return (
    <div style={{
      background: 'var(--card)', borderRadius: 'var(--radius)',
      border: '1px solid var(--border)', overflow: 'hidden', ...extra
    }}>
      {children}
    </div>
  )
}

// ── Table primitives ─────────────────────────────────────
export function Table({ children }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>{children}</table>
    </div>
  )
}
export function Th({ children, align }) {
  return (
    <th style={{
      padding: '10px 16px', textAlign: align || 'left',
      fontSize: 11, fontWeight: 700, color: 'var(--text-muted)',
      textTransform: 'uppercase', letterSpacing: '0.07em',
      borderBottom: '1px solid var(--border)', background: 'var(--card2)',
    }}>{children}</th>
  )
}
export function Td({ children, align, muted }) {
  return (
    <td style={{
      padding: '11px 16px', textAlign: align || 'left',
      fontSize: 13, color: muted ? 'var(--text-muted)' : 'var(--text)',
    }}>{children}</td>
  )
}

// ── Badge ─────────────────────────────────────────────────
const BADGE_STYLES = {
  accent: { background: 'rgba(0,212,170,0.15)', color: 'var(--accent)', border: '1px solid rgba(0,212,170,0.3)' },
  blue:   { background: 'rgba(59,130,246,0.15)', color: '#60a5fa',       border: '1px solid rgba(59,130,246,0.3)' },
  amber:  { background: 'rgba(245,158,11,0.15)', color: 'var(--amber)',   border: '1px solid rgba(245,158,11,0.3)' },
  danger: { background: 'rgba(239,68,68,0.15)',  color: 'var(--danger)',  border: '1px solid rgba(239,68,68,0.3)' },
  purple: { background: 'rgba(139,92,246,0.15)', color: 'var(--purple)',  border: '1px solid rgba(139,92,246,0.3)' },
  muted:  { background: 'rgba(139,157,195,0.1)', color: 'var(--text-muted)', border: '1px solid var(--border)' },
}
export function Badge({ children, variant = 'muted' }) {
  return (
    <span style={{
      display: 'inline-block', padding: '3px 9px', borderRadius: 99,
      fontSize: 11, fontWeight: 600, letterSpacing: '0.04em',
      ...BADGE_STYLES[variant],
    }}>{children}</span>
  )
}

// ── Button ────────────────────────────────────────────────
export function Btn({ children, onClick, variant = 'primary', size, disabled, style: extra }) {
  const base = {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
    borderRadius: 'var(--radius-sm)', fontWeight: 600,
    padding: size === 'sm' ? '5px 8px' : '8px 16px',
    fontSize: size === 'sm' ? 12 : 13,
    transition: 'opacity 0.15s',
    opacity: disabled ? 0.5 : 1,
  }
  const variants = {
    primary: { background: 'var(--accent)', color: '#000' },
    ghost:   { background: 'var(--bg2)', color: 'var(--text-soft)', border: '1px solid var(--border)' },
    danger:  { background: 'rgba(239,68,68,0.15)', color: 'var(--danger)', border: '1px solid rgba(239,68,68,0.3)' },
  }
  return <button style={{ ...base, ...variants[variant], ...extra }} onClick={onClick} disabled={disabled}>{children}</button>
}

// ── Modal ─────────────────────────────────────────────────
export function Modal({ title, onClose, children, width = 440 }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center',
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: 'var(--card)', borderRadius: 'var(--radius)',
        border: '1px solid var(--border)', width, maxWidth: '95vw',
        padding: 24, boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700 }}>{title}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18 }}>
            <i className="ri-close-line" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

// ── Form helpers ──────────────────────────────────────────
export function FormRow({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</label>
      {children}
    </div>
  )
}

export function Input(props) {
  return (
    <input {...props} style={{
      width: '100%', background: 'var(--bg2)', border: '1px solid var(--border)',
      color: 'var(--text)', borderRadius: 'var(--radius-sm)', padding: '8px 12px',
      fontSize: 13, outline: 'none', ...props.style,
    }} />
  )
}

export function Select({ children, ...props }) {
  return (
    <select {...props} style={{
      width: '100%', background: 'var(--bg2)', border: '1px solid var(--border)',
      color: 'var(--text)', borderRadius: 'var(--radius-sm)', padding: '8px 12px',
      fontSize: 13, outline: 'none', ...props.style,
    }}>{children}</select>
  )
}

// ── Empty / No-tenant ─────────────────────────────────────
export function EmptyState({ icon, text }) {
  return (
    <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
      <i className={icon} style={{ fontSize: 32, display: 'block', marginBottom: 10 }} />
      <p style={{ fontSize: 14 }}>{text}</p>
    </div>
  )
}

export function NoTenant() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
        <i className="ri-building-line" style={{ fontSize: 40, display: 'block', marginBottom: 12, color: 'var(--amber)' }} />
        <p style={{ fontSize: 15, fontWeight: 600 }}>No tenant configured</p>
        <p style={{ fontSize: 13, marginTop: 6 }}>
          Append <code style={{ background: 'rgba(0,0,0,0.3)', padding: '1px 6px', borderRadius: 4, color: 'var(--accent)' }}>?tenantId=org_1001</code> to the URL
        </p>
      </div>
    </div>
  )
}

// ── Toggle pill ───────────────────────────────────────────
export function Toggle({ value, onChange, labelOn = 'Active', labelOff = 'Inactive' }) {
  return (
    <div
      onClick={() => onChange(!value)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: '4px 10px', borderRadius: 99, cursor: 'pointer',
        background: value ? 'rgba(0,212,170,0.15)' : 'rgba(139,157,195,0.1)',
        border: `1px solid ${value ? 'rgba(0,212,170,0.3)' : 'var(--border)'}`,
        fontSize: 12, fontWeight: 600,
        color: value ? 'var(--accent)' : 'var(--text-muted)',
        userSelect: 'none', transition: 'all 0.2s',
      }}
    >
      <span style={{
        width: 14, height: 14, borderRadius: '50%',
        background: value ? 'var(--accent)' : 'var(--text-muted)',
        display: 'inline-block', transition: 'background 0.2s',
      }} />
      {value ? labelOn : labelOff}
    </div>
  )
}

// ── Alert ─────────────────────────────────────────────────
export function Alert({ type = 'error', children }) {
  const colors = {
    error:   { bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.3)',   color: 'var(--danger)' },
    success: { bg: 'rgba(0,212,170,0.1)',    border: 'rgba(0,212,170,0.3)',   color: 'var(--accent)' },
    info:    { bg: 'rgba(59,130,246,0.1)',   border: 'rgba(59,130,246,0.3)',  color: '#60a5fa' },
  }
  const c = colors[type]
  return (
    <div style={{
      padding: '10px 14px', borderRadius: 'var(--radius-sm)',
      background: c.bg, border: `1px solid ${c.border}`,
      color: c.color, fontSize: 13, marginBottom: 14,
    }}>{children}</div>
  )
}
