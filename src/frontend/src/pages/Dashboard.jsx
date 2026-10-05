import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DollarSign,
  AlertTriangle,
  TrendingDown,
  ShieldAlert,
  ArrowRight,
  Radio,
  Activity,
  Layers,
  Sparkles,
} from 'lucide-react';
import { KpiCard } from '../components/cards/KpiCard';
import { RiskSignalCard } from '../components/cards/RiskSignalCard';
import { SentimentArea } from '../components/charts/SentimentArea';
import { Loader } from '../components/common/Loader';
import { RiskEngineApi } from '../services/api';

export const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [signals, setSignals] = useState([]);
  const [stats, setStats] = useState(null);
  const [portfolioSummary, setPortfolioSummary] = useState(null);
  const [activeFilter, setActiveFilter] = useState('ALL');

  const loadData = async () => {
    try {
      const [signalsData, statsData, summaryData] = await Promise.all([
        RiskEngineApi.getLatestSignals(),
        RiskEngineApi.getSignalStats(),
        RiskEngineApi.getPortfolioSummary(),
      ]);
      setSignals(signalsData || []);
      setStats(statsData || {});
      setPortfolioSummary(summaryData || {});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const handleRefresh = () => loadData();
    window.addEventListener('riskengine:refresh', handleRefresh);
    return () => window.removeEventListener('riskengine:refresh', handleRefresh);
  }, []);

  const filteredSignals = signals.filter(s => {
    if (activeFilter === 'HIGH_IMPACT') return s.impactScore >= 7;
    if (activeFilter === 'GDELT') return s.source === 'GDELT';
    if (activeFilter === 'TWITTER') return s.source === 'TWITTER';
    return true;
  });

  if (loading) {
    return <Loader message="Aggregating financial NLP telemetry and portfolio exposure..." />;
  }

  const highImpactCount = signals.filter(s => (s.impactScore || 0) >= 7).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* KPI Cards Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1.25rem',
        }}
      >
        <KpiCard
          title="Total Portfolio Notional"
          value={`$${(portfolioSummary?.totalNotionalValue || 585.0).toFixed(1)}M`}
          subtitle="15 Multi-Asset Holdings across 4 Classes"
          change="100% Allocated"
          changeType="positive"
          icon={DollarSign}
          glow="cyan"
        />

        <KpiCard
          title="High-Impact Signals"
          value={highImpactCount}
          subtitle="Impact Score ≥ 7 (Auto-Triggered Shocks)"
          change={`${highImpactCount} Critical`}
          changeType="negative"
          icon={AlertTriangle}
          glow="rose"
        />

        <KpiCard
          title="FinBERT Sentiment Index"
          value={(stats?.avgSentimentScore || -0.28) > 0 ? `+${(stats?.avgSentimentScore || -0.28).toFixed(2)}` : (stats?.avgSentimentScore || -0.28).toFixed(2)}
          subtitle="NLP Polarity (-1.0 Bearish to +1.0 Bullish)"
          change="Bearish Tilt"
          changeType="negative"
          icon={TrendingDown}
          glow="amber"
        />

        <KpiCard
          title="Est. 95% 1-Day VaR"
          value="$37.2M"
          subtitle="Parametric Value at Risk under Crisis"
          change="-6.36% Cap"
          changeType="negative"
          icon={ShieldAlert}
          glow="indigo"
        />
      </div>

      {/* Hero Automated Trigger Architecture Alert Banner */}
      <div
        className="glass-panel"
        style={{
          padding: '1.25rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(99, 102, 241, 0.12) 100%)',
          border: '1px solid rgba(239, 68, 68, 0.35)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              padding: '0.65rem',
              borderRadius: '10px',
              backgroundColor: 'rgba(239, 68, 68, 0.2)',
              color: '#ef4444',
            }}
          >
            <Sparkles size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
              <span style={{ fontWeight: '700', fontSize: '0.95rem', color: '#ffffff' }}>
                Module B Strategic Auto-Trigger Architecture Active
              </span>
              <span
                style={{
                  fontSize: '0.65rem',
                  fontFamily: 'var(--font-mono)',
                  padding: '0.15rem 0.45rem',
                  borderRadius: '4px',
                  backgroundColor: '#ef4444',
                  color: '#fff',
                  fontWeight: '700',
                }}
              >
                Threshold ≥ 7
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
              Whenever GDELT or Twitter news yields a FinBERT Impact Score ≥ 7 (e.g. Geopolitical conflict or Credit crunch),
              the system automatically runs the strategic stress test and computes multi-asset PnL loss.
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/stress-test')}
          className="btn btn-danger"
          style={{ padding: '0.6rem 1.15rem' }}
        >
          <span>Run Interactive Shock Simulation</span>
          <ArrowRight size={15} />
        </button>
      </div>

      {/* Main Two-Column Analytics Layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.35fr) minmax(0, 1fr)',
          gap: '1.5rem',
        }}
      >
        {/* Left Column: Live Risk Signals Feed */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Radio size={18} color="#06b6d4" />
              <h2 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#ffffff', margin: 0 }}>
                Real-Time Risk Signal Stream
              </h2>
            </div>

            {/* Filter Pills */}
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              {[
                { key: 'ALL', label: 'All' },
                { key: 'HIGH_IMPACT', label: 'Impact ≥ 7' },
                { key: 'GDELT', label: 'GDELT' },
                { key: 'TWITTER', label: 'Twitter' },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveFilter(tab.key)}
                  style={{
                    padding: '0.3rem 0.65rem',
                    borderRadius: '6px',
                    fontSize: '0.725rem',
                    fontWeight: activeFilter === tab.key ? '600' : '500',
                    fontFamily: 'var(--font-sans)',
                    backgroundColor: activeFilter === tab.key ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                    color: activeFilter === tab.key ? '#a5b4fc' : 'var(--text-secondary)',
                    border: activeFilter === tab.key ? '1px solid rgba(99, 102, 241, 0.5)' : '1px solid transparent',
                    cursor: 'pointer',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Signal Cards List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', maxHeight: '520px', overflowY: 'auto', paddingRight: '0.25rem' }}>
            {filteredSignals.length > 0 ? (
              filteredSignals.map(signal => (
                <RiskSignalCard key={signal.id} signal={signal} />
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                No signals match selected filter.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Sentiment Trajectory & Asset Exposure */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* FinBERT Sentiment Momentum */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Activity size={18} color="#6366f1" />
                <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#ffffff', margin: 0 }}>
                  FinBERT Sentiment Trajectory
                </h3>
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                Scale: -1.0 to +1.0
              </span>
            </div>
            <SentimentArea signals={signals} />
          </div>

          {/* Quick Portfolio Class Distribution */}
          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Layers size={18} color="#10b981" />
                <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#ffffff', margin: 0 }}>
                  Asset Class Exposure
                </h3>
              </div>
              <button
                onClick={() => navigate('/portfolio')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent-primary)',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                }}
              >
                <span>Full Portfolio</span>
                <ArrowRight size={13} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
              {[
                { type: 'BONDS', notional: '$220.0M', share: '37.6%', color: '#3b82f6', note: 'Duration sensitive' },
                { type: 'DERIVATIVES', notional: '$180.0M', share: '30.8%', color: '#a855f7', note: 'Index & Commodity' },
                { type: 'LOANS', notional: '$110.0M', share: '18.8%', color: '#10b981', note: 'Credit spread sensitive' },
                { type: 'EQUITIES', notional: '$75.0M', share: '12.8%', color: '#f59e0b', note: 'Direct equity beta' },
              ].map(item => (
                <div
                  key={item.type}
                  style={{
                    padding: '0.85rem 1rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '8px',
                    borderLeft: `3px solid ${item.color}`,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#ffffff' }}>{item.type}</span>
                    <span style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: item.color }}>{item.share}</span>
                  </div>
                  <div style={{ fontSize: '1.05rem', fontWeight: '700', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                    {item.notional}
                  </div>
                  <div style={{ fontSize: '0.675rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    {item.note}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
