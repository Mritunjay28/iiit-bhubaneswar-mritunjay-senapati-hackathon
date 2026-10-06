import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DollarSign,
  AlertTriangle,
  TrendingDown,
  ShieldAlert,
  Radio,
  Activity,
  Layers,
  Zap,
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* KPI Cards Row (Styled like Reference 1 Taskos, Ref 2 Klips, Ref 4 Cash Balance) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.25rem',
        }}
      >
        <KpiCard
          className="scroll-reveal reveal-delay-1"
          title="Total Portfolio Notional"
          value={`$${(portfolioSummary?.totalNotionalValue ?? portfolioSummary?.totalNotional ?? 585.0).toFixed(1)}M`}
          subtitle="15 Multi-Asset Positions"
          change="100% Allocated"
          changeType="positive"
          icon={DollarSign}
          accent="blue"
          progress={100}
        />

        <KpiCard
          className="scroll-reveal reveal-delay-2"
          title="Critical Risk Signals"
          value={highImpactCount}
          subtitle="Impact Score ≥ 7 (Auto Shock)"
          change={`${highImpactCount} Critical`}
          changeType="negative"
          icon={AlertTriangle}
          accent="rose"
          progress={Math.round((highImpactCount / Math.max(1, signals.length)) * 100)}
        />

        <KpiCard
          className="scroll-reveal reveal-delay-3"
          title="FinBERT Sentiment Index"
          value={(() => {
            const val = stats?.avgSentimentScore ?? stats?.averageSentiment ?? -0.28;
            return val > 0 ? `+${val.toFixed(2)}` : val.toFixed(2);
          })()}
          subtitle="Scale: -1.0 to +1.0 Polarity"
          change="Bearish Tilt"
          changeType="negative"
          icon={TrendingDown}
          accent="amber"
          progress={64}
        />

        <KpiCard
          className="scroll-reveal reveal-delay-4"
          title="1-Day Parametric VaR (95%)"
          value="$37.2M"
          subtitle="Crisis Horizon Loss Boundary"
          change="-6.36% Cap"
          changeType="negative"
          icon={ShieldAlert}
          accent="cyan"
          progress={72}
        />
      </div>

      {/* Hero Automated Trigger Alert Banner */}
      <div
        className="institutional-card scroll-reveal"
        style={{
          padding: '1.25rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          backgroundColor: '#16181f',
          borderLeft: '4px solid #ef4444',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div
            style={{
              padding: '0.5rem',
              borderRadius: '6px',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              color: '#ef4444',
            }}
          >
            <AlertTriangle size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
              <span style={{ fontWeight: '700', fontSize: 'var(--text-h3)', lineHeight: 'var(--leading-snug)', letterSpacing: 'var(--tracking-tight)', color: '#ffffff' }}>
                Module B Auto-Stress Trigger Engine Active
              </span>
              <span
                style={{
                  fontSize: 'var(--text-micro)',
                  lineHeight: 'var(--leading-none)',
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: 'var(--tracking-wide)',
                  padding: '0.15rem 0.4rem',
                  borderRadius: '3px',
                  backgroundColor: '#dc2626',
                  color: '#fff',
                  fontWeight: '700',
                }}
              >
                Threshold ≥ 7
              </span>
            </div>
            <p style={{ fontSize: 'var(--text-caption)', lineHeight: 'var(--leading-relaxed)', letterSpacing: 'var(--tracking-normal)', color: 'var(--text-secondary)', margin: 0 }}>
              Incoming GDELT news or tweets with FinBERT Impact Score ≥ 7 automatically calibrate macro risk factor shocks and evaluate cross-asset portfolio drawdown.
            </p>
          </div>
        </div>

        {/* The ONE Repeated CTA */}
        <button
          onClick={() => navigate('/stress-test', { state: { signal: signals.find(s => (s.impactScore || 0) >= 7) } })}
          className="btn btn-cta"
          style={{ padding: '0.55rem 1.15rem' }}
        >
          <Zap size={14} />
          <span>Simulate Shock</span>
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
        {/* Left Column: Real-Time Risk Signals Stream */}
        <div className="institutional-card scroll-reveal" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Radio size={17} color="#0284c7" />
              <h2 style={{ fontSize: 'var(--text-h2)', lineHeight: 'var(--leading-snug)', letterSpacing: 'var(--tracking-tighter)', fontWeight: '700', color: '#ffffff', margin: 0 }}>
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
                  className={`filter-chip ${activeFilter === tab.key ? 'active' : ''}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Signal Cards List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', maxHeight: '520px', overflowY: 'auto', paddingRight: '0.25rem' }}>
            {filteredSignals.length > 0 ? (
              filteredSignals.map(signal => (
                <RiskSignalCard key={signal.id} signal={signal} />
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)', fontSize: 'var(--text-body-sm)', lineHeight: 'var(--leading-normal)' }}>
                No signals match selected filter criteria.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Sentiment Trajectory & Asset Exposure */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* FinBERT Sentiment Momentum */}
          <div className="institutional-card scroll-reveal" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Activity size={17} color="#2563eb" />
                <h3 style={{ fontSize: 'var(--text-h3)', lineHeight: 'var(--leading-snug)', letterSpacing: 'var(--tracking-tight)', fontWeight: '700', color: '#ffffff', margin: 0 }}>
                  FinBERT Sentiment Trajectory
                </h3>
              </div>
              <span style={{ fontSize: 'var(--text-caption)', lineHeight: 'var(--leading-none)', letterSpacing: 'var(--tracking-normal)', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                Scale: -1.0 to +1.0
              </span>
            </div>
            <SentimentArea signals={signals} />
          </div>

          {/* Quick Portfolio Class Distribution (Ref 3 Xero style cards) */}
          <div className="institutional-card scroll-reveal" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Layers size={17} color="#10b981" />
                <h3 style={{ fontSize: 'var(--text-h3)', lineHeight: 'var(--leading-snug)', letterSpacing: 'var(--tracking-tight)', fontWeight: '700', color: '#ffffff', margin: 0 }}>
                  Asset Class Exposure
                </h3>
              </div>
              <button
                onClick={() => navigate('/portfolio')}
                className="btn btn-outline"
                style={{ padding: '0.25rem 0.6rem', fontSize: 'var(--text-caption)' }}
              >
                <span>Full Portfolio</span>
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
              {[
                { type: 'BONDS', notional: '$220.0M', share: '37.6%', color: '#3b82f6', note: 'Duration sensitive' },
                { type: 'DERIVATIVES', notional: '$180.0M', share: '30.8%', color: '#0284c7', note: 'Index & Commodity' },
                { type: 'LOANS', notional: '$110.0M', share: '18.8%', color: '#10b981', note: 'Credit spread sensitive' },
                { type: 'EQUITIES', notional: '$75.0M', share: '12.8%', color: '#f59e0b', note: 'Direct equity beta' },
              ].map(item => (
                <div
                  key={item.type}
                  style={{
                    padding: '0.85rem',
                    backgroundColor: '#131418',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '6px',
                    borderLeft: `3px solid ${item.color}`,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: 'var(--text-caption)', lineHeight: 'var(--leading-snug)', letterSpacing: 'var(--tracking-wider)', fontWeight: '700', color: '#ffffff' }}>{item.type}</span>
                    <span style={{ fontSize: 'var(--text-caption)', lineHeight: 'var(--leading-none)', letterSpacing: 'var(--tracking-normal)', fontFamily: 'var(--font-mono)', color: item.color, fontWeight: '700' }}>{item.share}</span>
                  </div>
                  <div style={{ fontSize: 'var(--text-h2)', lineHeight: 'var(--leading-tight)', letterSpacing: 'var(--tracking-tightest)', fontWeight: '800', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                    {item.notional}
                  </div>
                  <div style={{ fontSize: 'var(--text-micro)', lineHeight: 'var(--leading-normal)', letterSpacing: 'var(--tracking-normal)', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
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
