import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Zap,
  Radio,
  PieChart,
  History,
  ShieldCheck,
  Server,
} from 'lucide-react';
import { RiskEngineApi } from '../../services/api';

export const Sidebar = () => {
  const navItems = [
    { to: '/', label: 'Executive Dashboard', icon: LayoutDashboard },
    { to: '/stress-test', label: 'Portfolio Stress Engine', icon: Zap, badge: 'Target' },
    { to: '/signals', label: 'Risk Signal Stream', icon: Radio },
    { to: '/portfolio', label: 'Portfolio Holdings', icon: PieChart },
    { to: '/history', label: 'Audit History', icon: History },
  ];

  const [status, setStatus] = React.useState(null);
  React.useEffect(() => {
    RiskEngineApi.getSystemStatus().then(res => setStatus(res)).catch(() => {});
  }, []);

  return (
    <aside
      style={{
        width: '250px',
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
          padding: '1.25rem 1.25rem',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
        }}
      >
        <div
          style={{
            width: '34px',
            height: '34px',
            borderRadius: '6px',
            backgroundColor: '#2563eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ShieldCheck size={20} color="#ffffff" />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span
            style={{
              fontWeight: '800',
              fontSize: 'var(--text-h2)',
              lineHeight: 'var(--leading-snug)',
              letterSpacing: 'var(--tracking-tighter)',
              color: '#ffffff',
              fontFamily: 'var(--font-display)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            RiskEngine <span style={{ color: '#38bdf8', fontSize: 'var(--text-micro)', letterSpacing: 'var(--tracking-wider)', fontWeight: '700' }}>TERMINAL</span>
          </span>
          <span
            style={{
              fontSize: 'var(--text-overline)',
              lineHeight: 'var(--leading-none)',
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
              textTransform: 'uppercase',
              letterSpacing: 'var(--tracking-wider)',
              marginTop: '0.15rem',
            }}
          >
            S&P / CRISIL Module B
          </span>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav style={{ padding: '1.25rem 0.65rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        <div
          style={{
            fontSize: 'var(--text-overline)',
            lineHeight: 'var(--leading-none)',
            color: 'var(--text-muted)',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: 'var(--tracking-wider)',
            padding: '0 0.6rem 0.5rem',
          }}
        >
          Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className="sidebar-nav-link"
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.6rem 0.75rem',
                borderRadius: '6px',
                fontSize: 'var(--text-body-sm)',
                lineHeight: 'var(--leading-none)',
                letterSpacing: 'var(--tracking-normal)',
                fontWeight: isActive ? '700' : '500',
                color: isActive ? '#ffffff' : 'var(--text-secondary)',
                backgroundColor: isActive ? 'var(--bg-subtle)' : 'transparent',
                border: isActive ? '1px solid var(--border-medium)' : '1px solid transparent',
                textDecoration: 'none',
              })}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Icon size={17} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  style={{
                    fontSize: 'var(--text-micro)',
                    lineHeight: 'var(--leading-none)',
                    letterSpacing: 'var(--tracking-wide)',
                    fontWeight: '700',
                    fontFamily: 'var(--font-mono)',
                    backgroundColor: '#1d4ed8',
                    color: '#ffffff',
                    padding: '0.15rem 0.4rem',
                    borderRadius: '3px',
                  }}
                >
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Institutional Microservice Telemetry Card */}
      <div
        style={{
          margin: '0.75rem',
          padding: '0.85rem',
          backgroundColor: '#131418',
          border: '1px solid var(--border-subtle)',
          borderRadius: '6px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <Server size={14} color="#3b82f6" />
          <span style={{ fontSize: 'var(--text-overline)', lineHeight: 'var(--leading-none)', fontWeight: '700', color: 'var(--text-secondary)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase' }}>
            System Infrastructure
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: 'var(--text-micro)', lineHeight: 'var(--leading-normal)', letterSpacing: 'var(--tracking-normal)', fontFamily: 'var(--font-mono)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
            <span>Spring Boot Core:</span>
            <span style={{ color: status?.status === 'OK' ? '#10b981' : '#ef4444', fontWeight: '600' }}>:8080 {status?.status === 'OK' ? 'Active' : 'Offline'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
            <span>FinBERT NLP:</span>
            <span style={{ color: status?.nlpServiceOnline ? '#10b981' : '#f59e0b', fontWeight: '600' }}>:8000 {status?.nlpServiceOnline ? 'Online' : 'Fallback'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
            <span>PostgreSQL:</span>
            <span style={{ color: status?.status === 'OK' ? '#10b981' : '#ef4444', fontWeight: '600' }}>:5432 {status?.status === 'OK' ? 'Ready' : 'Offline'}</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
