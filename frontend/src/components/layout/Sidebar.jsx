import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Zap,
  Radio,
  PieChart,
  History,
  ShieldAlert,
  Server,
} from 'lucide-react';

export const Sidebar = () => {
  const navItems = [
    { to: '/', label: 'Executive Dashboard', icon: LayoutDashboard },
    { to: '/stress-test', label: 'Stress Test Engine', icon: Zap, badge: 'Hero' },
    { to: '/signals', label: 'Risk Signal Feed', icon: Radio },
    { to: '/portfolio', label: 'Portfolio Analytics', icon: PieChart },
    { to: '/history', label: 'Audit History', icon: History },
  ];

  return (
    <aside
      style={{
        width: '260px',
        backgroundColor: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        height: '100vh',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      {/* Brand & Platform Header */}
      <div
        style={{
          padding: '1.5rem 1.25rem 1.25rem',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
        }}
      >
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '9px',
            background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(99, 102, 241, 0.4)',
          }}
        >
          <ShieldAlert size={20} color="#ffffff" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span
            style={{
              fontWeight: '800',
              fontSize: '1.05rem',
              letterSpacing: '-0.02em',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            RiskEngine <span style={{ color: 'var(--accent-cyan)', fontSize: '0.8rem', fontWeight: '600' }}>AI</span>
          </span>
          <span
            style={{
              fontSize: '0.675rem',
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            S&P / CRISIL Module B
          </span>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav style={{ padding: '1.25rem 0.75rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        <div
          style={{
            fontSize: '0.675rem',
            color: 'var(--text-muted)',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            padding: '0 0.6rem 0.5rem',
          }}
        >
          Core Platform
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.65rem 0.75rem',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: isActive ? '600' : '500',
                color: isActive ? '#ffffff' : 'var(--text-secondary)',
                backgroundColor: isActive ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                border: isActive ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
                textDecoration: 'none',
                transition: 'all var(--transition-fast)',
              })}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Icon size={18} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  style={{
                    fontSize: '0.65rem',
                    fontWeight: '700',
                    fontFamily: 'var(--font-mono)',
                    backgroundColor: 'rgba(99, 102, 241, 0.3)',
                    color: '#a5b4fc',
                    padding: '0.1rem 0.4rem',
                    borderRadius: '4px',
                    border: '1px solid rgba(99, 102, 241, 0.5)',
                  }}
                >
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Microservice Architecture Telemetry Card */}
      <div
        style={{
          margin: '0.75rem',
          padding: '0.85rem',
          backgroundColor: 'rgba(0, 0, 0, 0.25)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <Server size={14} color="#06b6d4" />
          <span style={{ fontSize: '0.725rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
            Service Mesh Telemetry
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.7rem', fontFamily: 'var(--font-mono)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
            <span>Spring API:</span>
            <span style={{ color: '#10b981' }}>:8080 Active</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
            <span>FinBERT NLP:</span>
            <span style={{ color: '#10b981' }}>:8000 Loaded</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
            <span>PostgreSQL:</span>
            <span style={{ color: '#10b981' }}>:5432 Ready</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
