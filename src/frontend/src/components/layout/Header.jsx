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
      case '/': return { title: 'Executive Risk Dashboard', subtitle: 'Real-time financial NLP signals and cross-asset portfolio exposure' };
      case '/stress-test': return { title: 'Strategic Stress Testing Engine', subtitle: 'Simulate macroeconomic and geopolitical shocks across bonds, loans, equities & derivatives' };
      case '/signals': return { title: 'Risk Signals & Intelligence Feed', subtitle: 'FinBERT sentiment and keyword-classified event taxonomy from GDELT & Twitter' };
      case '/portfolio': return { title: 'Portfolio Allocation & Risk Analytics', subtitle: 'Multi-asset synthetic portfolio ($585M notional) with duration and spread exposures' };
      case '/history': return { title: 'Stress Test Audit Trail', subtitle: 'Historical record of automated triggers and manual simulation runs' };
      default: return { title: 'RiskEngine AI', subtitle: 'Automated Portfolio Stress Testing' };
    }
  };

  const page = getPageTitle(location.pathname);

  return (
    <header
      style={{
        height: '72px',
        backgroundColor: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(12px)',
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
            fontSize: '1.25rem',
            fontWeight: '700',
            color: '#ffffff',
            letterSpacing: '-0.02em',
            margin: 0,
          }}
        >
          {page.title}
        </h1>
        <p
          style={{
            fontSize: '0.75rem',
            color: 'var(--text-secondary)',
            margin: '0.15rem 0 0 0',
          }}
        >
          {page.subtitle}
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Real-time System Pulse */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.4rem 0.75rem',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            borderRadius: '20px',
            fontSize: '0.75rem',
            fontFamily: 'var(--font-mono)',
            color: '#34d399',
          }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#10b981',
              boxShadow: '0 0 8px #10b981',
            }}
            className="pulse-indicator"
          />
          <span>Pipeline: {status.nlpServiceOnline ? 'FinBERT Live' : 'Fallback Active'}</span>
        </div>

        {/* Global Manual Refresh Button */}
        <button
          onClick={handleRefresh}
          className="btn btn-outline"
          title="Refresh real-time data"
          style={{ padding: '0.45rem 0.75rem' }}
        >
          <RefreshCw size={14} className={refreshing ? 'pulse-indicator' : ''} />
          <span>Sync</span>
        </button>

        {/* Hero Trigger Quick Action */}
        <button
          onClick={() => navigate('/stress-test')}
          className="btn btn-primary"
          style={{ padding: '0.45rem 0.95rem' }}
        >
          <Zap size={14} />
          <span>Launch Stress Test</span>
        </button>
      </div>
    </header>
  );
};
