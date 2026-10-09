import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Zap, RefreshCw } from 'lucide-react';
import { RiskEngineApi } from '../../services/api';

export const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState({ status: 'ONLINE', nlpServiceOnline: true });
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    RiskEngineApi.getSystemStatus().then(res => setStatus(res));
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const res = await RiskEngineApi.getSystemStatus();
      setStatus(res);
      window.dispatchEvent(new CustomEvent('riskengine:refresh'));
    } finally {
      setTimeout(() => setRefreshing(false), 500);
    }
  };

  const getPageTitle = (path) => {
    switch (path) {
      case '/': return { title: 'Executive Risk Dashboard', subtitle: 'Live NLP sentiment triggers and cross-asset portfolio exposure' };
      case '/stress-test': return { title: 'Portfolio Stress Engine', subtitle: 'Simulate macroeconomic and geopolitical shocks across bonds, loans, equities & derivatives' };
      case '/signals': return { title: 'Risk Signals & Intelligence Stream', subtitle: 'FinBERT sentiment and keyword-classified event taxonomy from GDELT & Twitter' };
      case '/portfolio': return { title: 'Multi-Asset Portfolio Allocation', subtitle: 'Synthetic $585.0M benchmark portfolio with duration and spread sensitivities' };
      case '/history': return { title: 'Stress Test Audit Trail', subtitle: 'Chronological execution log of automated triggers and quantitative scenarios' };
      default: return { title: 'RiskEngine AI', subtitle: 'Institutional Portfolio Stress Testing' };
    }
  };

  const page = getPageTitle(location.pathname);

  return (
    <>
      {status.status === 'OFFLINE' && (
        <div style={{ backgroundColor: '#ef4444', color: 'white', padding: '0.5rem', textAlign: 'center', fontSize: '14px', fontWeight: 'bold' }}>
          Backend offline.
        </div>
      )}
    <header
      style={{
        height: '68px',
        backgroundColor: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2rem',
        position: 'sticky',
        top: 0,
        zIndex: 40,
      }}
    >
      <div>
        <h1
          style={{
            fontSize: 'var(--text-h1)',
            fontWeight: '700',
            lineHeight: 'var(--leading-snug)',
            letterSpacing: 'var(--tracking-tighter)',
            color: 'var(--text-primary)',
            margin: 0,
            fontFamily: 'var(--font-display)',
          }}
        >
          {page.title}
        </h1>
        <p
          style={{
            fontSize: 'var(--text-caption)',
            lineHeight: 'var(--leading-normal)',
            letterSpacing: 'var(--tracking-normal)',
            color: 'var(--text-secondary)',
            margin: '0.2rem 0 0 0',
          }}
        >
          {page.subtitle}
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        {/* Real-time Telemetry Status */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.35rem 0.75rem',
            backgroundColor: status.status === 'OFFLINE' ? 'rgba(239, 68, 68, 0.08)' : (status.nlpServiceOnline ? 'rgba(16, 185, 129, 0.08)' : 'rgba(245, 158, 11, 0.08)'),
            border: status.status === 'OFFLINE' ? '1px solid rgba(239, 68, 68, 0.25)' : (status.nlpServiceOnline ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid rgba(245, 158, 11, 0.25)'),
            borderRadius: '4px',
            fontSize: 'var(--text-caption)',
            lineHeight: 'var(--leading-none)',
            letterSpacing: 'var(--tracking-normal)',
            fontFamily: 'var(--font-mono)',
            color: status.status === 'OFFLINE' ? '#ef4444' : (status.nlpServiceOnline ? '#10b981' : '#f59e0b'),
          }}
        >
          <span
            style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              backgroundColor: status.status === 'OFFLINE' ? '#ef4444' : (status.nlpServiceOnline ? '#10b981' : '#f59e0b'),
            }}
            className={status.status !== 'OFFLINE' ? "pulse-indicator" : ""}
          />
          <span>{status.status === 'OFFLINE' ? 'Offline' : (status.nlpServiceOnline ? 'FinBERT Live' : 'Fallback Active')}</span>
        </div>

        {/* Global Manual Refresh Button */}
        <button
          onClick={handleRefresh}
          className="btn btn-outline"
          title="Refresh real-time telemetry"
          style={{ padding: '0.45rem 0.75rem' }}
        >
          <RefreshCw size={14} className={refreshing ? 'spin-icon' : ''} />
          <span>Sync</span>
        </button>

        {/* The ONE Repeated CTA */}
        <button
          onClick={() => navigate('/stress-test')}
          className="btn btn-cta"
          style={{ padding: '0.45rem 0.95rem' }}
        >
          <Zap size={14} />
          <span>Simulate Shock</span>
        </button>
      </div>
    </header>
    </>
  );
};
