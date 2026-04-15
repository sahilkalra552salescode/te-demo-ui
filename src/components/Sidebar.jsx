import React from 'react'
import { NavLink } from 'react-router-dom'

const sections = [
  {
    label: 'Master Data',
    items: [
      { to: '/grades',           icon: 'ri-award-line',               label: 'Grades' },
      { to: '/city-tiers',       icon: 'ri-map-pin-2-line',           label: 'City Tiers' },
    ],
  },
  {
    label: 'Allowances',
    items: [
      { to: '/allowance-matrix', icon: 'ri-money-dollar-circle-line', label: 'Allowance Matrix' },
      { to: '/route-matrix',     icon: 'ri-road-map-line',            label: 'Route Matrix' },
      { to: '/global-config',    icon: 'ri-settings-4-line',          label: 'Global Config' },
    ],
  },
  {
    label: 'Rules',
    items: [
      { to: '/anti-fraud-rules',    icon: 'ri-shield-check-line',       label: 'Anti-Fraud' },
      { to: '/validation-rules',    icon: 'ri-checkbox-circle-line',    label: 'Validation' },
      { to: '/auto-approval-rules', icon: 'ri-robot-line',              label: 'Auto-Approval' },
      { to: '/frequency-rules',     icon: 'ri-repeat-line',             label: 'Frequency' },
    ],
  },
]

export default function Sidebar({ tenantId }) {
  return (
    <aside style={{
      width: 'var(--sidebar-w)', minHeight: '100vh', flexShrink: 0,
      background: 'var(--card)', borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Brand */}
      <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8, flexShrink: 0,
            background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <i className="ri-route-line" style={{ color: '#000', fontSize: 16 }} />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', lineHeight: 1.2 }}>Smart T&amp;E</div>
            <div style={{ fontSize: 10, color: 'var(--accent)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Admin Portal</div>
          </div>
        </div>

        {/* Active tenant badge */}
        <div style={{
          marginTop: 12, padding: '6px 10px', borderRadius: 8,
          background: tenantId ? 'rgba(0,212,170,0.08)' : 'rgba(139,157,195,0.08)',
          border: `1px solid ${tenantId ? 'rgba(0,212,170,0.2)' : 'var(--border)'}`,
          display: 'flex', alignItems: 'center', gap: 7,
        }}>
          <span style={{
            width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
            background: tenantId ? 'var(--accent)' : 'var(--text-muted)',
          }} />
          <span style={{
            fontSize: 11, color: tenantId ? 'var(--accent)' : 'var(--text-muted)',
            fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {tenantId || 'No tenant'}
          </span>
        </div>
      </div>

      {/* Nav sections */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 12px' }}>
        {sections.map(section => (
          <div key={section.label} style={{ marginBottom: 8 }}>
            <div style={{
              fontSize: 10, fontWeight: 700, color: 'var(--text-muted)',
              textTransform: 'uppercase', letterSpacing: '0.1em',
              padding: '8px 8px 4px',
            }}>
              {section.label}
            </div>
            {section.items.map(item => <SideLink key={item.to} {...item} />)}
          </div>
        ))}
      </div>
    </aside>
  )
}

function SideLink({ to, icon, label }) {
  return (
    <NavLink
      to={to}
      style={({ isActive }) => ({
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '7px 10px', borderRadius: 'var(--radius-sm)',
        marginBottom: 1, textDecoration: 'none',
        fontSize: 13, fontWeight: 500,
        color: isActive ? 'var(--accent)' : 'var(--text-soft)',
        background: isActive ? 'rgba(0,212,170,0.1)' : 'transparent',
        transition: 'all 0.15s',
      })}
    >
      <i className={icon} style={{ fontSize: 15 }} />
      {label}
    </NavLink>
  )
}
