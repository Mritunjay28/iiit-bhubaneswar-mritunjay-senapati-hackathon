import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  History as HistoryIcon,
  ShieldCheck,
  Calendar,
  ChevronRight,
  Zap,
  TrendingDown,
  FileText,
  Activity,
} from 'lucide-react';
import { RiskEngineApi } from '../services/api';
import { EventBadge } from '../components/common/Badge';
import { Loader } from '../components/common/Loader';

export const History = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [selectedRun, setSelectedRun] = useState(null);

  const loadHistory = async () => {
    try {
      setError(null);
      const data = await RiskEngineApi.getHistoricalStressTests();
      const list = data?.content || [];
      setHistory(list);
      if (list.length > 0) {
        setSelectedRun(list[0]);
      }
    } catch (err) {
      setError("Backend unreachable");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
    const handleRefresh = () => loadHistory();
    window.addEventListener('riskengine:refresh', handleRefresh);
    return () => window.removeEventListener('riskengine:refresh', handleRefresh);
  }, []);

  if (loading) {
    return <Loader message="Retrieving institutional audit trail of historical stress test evaluations..." />;
  }

  const averageLoss = history.length > 0
    ? (history.reduce((acc, h) => acc + (h.totalPnlImpact || 0), 0) / history.length).toFixed(2)
    : '0.00';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {error && (
        <div style={{ padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#ef4444', borderRadius: '6px', textAlign: 'center', fontWeight: 'bold' }}>
          {error}
        </div>
      )}
      {/* Top Header & Summary Stats */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: 'var(--text-h1)', lineHeight: 'var(--leading-snug)', letterSpacing: 'var(--tracking-tighter)', fontWeight: '800', color: '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-display)' }}>
            <span style={{
              width: '26px',
              height: '26px',
              borderRadius: '4px',
              backgroundColor: '#2563eb',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <HistoryIcon size={15} color="#ffffff" />
            </span>
            Stress Testing Audit Trail & Run History
          </h2>
          <p style={{ fontSize: 'var(--text-caption)', lineHeight: 'var(--leading-relaxed)', letterSpacing: 'var(--tracking-normal)', color: 'var(--text-secondary)', margin: '0.2rem 0 0 0' }}>
            Historical record of automated market shock triggers and manual quantitative simulations
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.35rem 0.75rem',
            borderRadius: '4px',
            backgroundColor: '#131418',
            border: '1px solid var(--border-subtle)',
            fontSize: 'var(--text-caption)',
            lineHeight: 'var(--leading-none)',
            letterSpacing: 'var(--tracking-wide)',
            color: '#93c5fd',
            fontWeight: '600',
          }}>
            <Activity size={13} color="#2563eb" />
            <span>{error ? '--' : history.length} Certified Runs</span>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.35rem 0.75rem',
            borderRadius: '4px',
            backgroundColor: '#131418',
            border: '1px solid var(--border-subtle)',
            fontSize: 'var(--text-caption)',
            lineHeight: 'var(--leading-none)',
            letterSpacing: 'var(--tracking-wide)',
            color: '#f87171',
            fontWeight: '600',
          }}>
            <TrendingDown size={13} color="#ef4444" />
            <span>Avg Drawdown: {error ? '--' : `$${Math.abs(averageLoss)}M`}</span>
          </div>

          {/* The ONE Repeated CTA */}
          <button
            onClick={() => navigate('/stress-test', { state: { signal: selectedRun ? { eventType: selectedRun.eventType, entity: selectedRun.scenarioName } : null } })}
            className="btn btn-cta"
            style={{ fontSize: 'var(--text-body-sm)', padding: '0.45rem 0.95rem' }}
          >
            <Zap size={14} />
            <span>Simulate Shock</span>
          </button>
        </div>
      </div>

      {/* Two-Column Audit Inspection Layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.35fr) minmax(0, 1fr)',
          gap: '1.5rem',
        }}
      >
        {/* Left: Chronological Historical Timeline List (Ref 2 Klips style) */}
        <div className="institutional-card scroll-reveal" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={17} color="#2563eb" />
              <h3 style={{ fontSize: 'var(--text-h3)', lineHeight: 'var(--leading-snug)', letterSpacing: 'var(--tracking-tight)', fontWeight: '700', color: '#ffffff', margin: 0 }}>
                Chronological Execution Log
              </h3>
            </div>
            <span style={{ fontSize: 'var(--text-caption)', lineHeight: 'var(--leading-none)', letterSpacing: 'var(--tracking-normal)', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              Select run to inspect parameters
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {history.map((run) => {
              const isSelected = selectedRun?.id === run.id;
              const isLoss = (run.totalPnlImpact || 0) < 0;
              return (
                <div
                  key={run.id}
                  onClick={() => setSelectedRun(run)}
                  className="history-run-card"
                  style={{
                    padding: '0.85rem 1.15rem',
                    borderRadius: '6px',
                    border: isSelected ? '1px solid #2563eb' : '1px solid var(--border-subtle)',
                    borderLeft: isSelected ? '4px solid #2563eb' : '1px solid var(--border-subtle)',
                    backgroundColor: isSelected ? '#191b22' : '#14151a',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: '800', color: '#ffffff', fontSize: 'var(--text-h3)', lineHeight: 'var(--leading-snug)', letterSpacing: 'var(--tracking-tight)' }}>
                        {run.scenarioName}
                      </span>
                      <EventBadge type={run.eventType} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: 'var(--text-caption)', lineHeight: 'var(--leading-none)', letterSpacing: 'var(--tracking-normal)', color: 'var(--text-muted)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Calendar size={12} color="var(--text-secondary)" />
                        {run.executedAt ? new Date(run.executedAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'Recent'}
                      </span>
                      <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                        Run #{run.id}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div
                        style={{
                          fontSize: 'var(--text-display-md)',
                          lineHeight: 'var(--leading-tight)',
                          letterSpacing: 'var(--tracking-tightest)',
                          fontWeight: '800',
                          fontFamily: 'var(--font-mono)',
                          color: isLoss ? '#ef4444' : '#10b981',
                        }}
                      >
                        {isLoss ? '-' : '+'}${Math.abs(run.totalPnlImpact ?? 0).toFixed(2)}M
                      </div>
                      <div style={{ fontSize: 'var(--text-caption)', lineHeight: 'var(--leading-snug)', letterSpacing: 'var(--tracking-tight)', fontFamily: 'var(--font-mono)', fontWeight: '700', color: isLoss ? '#f87171' : '#34d399' }}>
                        {(run.percentageChange ?? 0) >= 0 ? '+' : ''}{(run.percentageChange ?? 0).toFixed(2)}%
                      </div>
                    </div>
                    <ChevronRight size={16} color={isSelected ? '#2563eb' : 'var(--text-muted)'} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Run Detail Inspection Card */}
        {selectedRun ? (
          <div className="institutional-card scroll-reveal" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.15rem', height: 'fit-content' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.65rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={17} color="#10b981" />
                <h3 style={{ fontSize: 'var(--text-h3)', lineHeight: 'var(--leading-snug)', letterSpacing: 'var(--tracking-tight)', fontWeight: '700', color: '#ffffff', margin: 0 }}>
                  Audit Run #{selectedRun.id} Inspector
                </h3>
              </div>

              {/* The ONE Repeated CTA */}
              <button
                onClick={() => navigate('/stress-test', { state: { signal: selectedRun ? { eventType: selectedRun.eventType, entity: selectedRun.scenarioName } : null } })}
                className="btn btn-cta"
                style={{ padding: '0.3rem 0.75rem', fontSize: 'var(--text-caption)' }}
              >
                <Zap size={13} />
                <span>Simulate Shock</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {/* Event Category Details */}
              <div style={{ padding: '0.85rem', backgroundColor: '#131418', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: 'var(--text-overline)', lineHeight: 'var(--leading-none)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-widest)', fontWeight: '600' }}>
                  Shock Blueprint & Category
                </div>
                <div style={{ fontSize: 'var(--text-h2)', lineHeight: 'var(--leading-snug)', letterSpacing: 'var(--tracking-tighter)', fontWeight: '800', color: '#ffffff', marginTop: '0.2rem' }}>
                  {selectedRun.scenarioName}
                </div>
                <div style={{ marginTop: '0.35rem' }}>
                  <EventBadge type={selectedRun.eventType} />
                </div>
              </div>

              {/* Before vs After Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                <div style={{ padding: '0.85rem', backgroundColor: '#131418', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: 'var(--text-overline)', lineHeight: 'var(--leading-none)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-widest)', fontWeight: '600' }}>
                    Baseline Portfolio
                  </div>
                  <div style={{ fontSize: 'var(--text-h1)', lineHeight: 'var(--leading-tight)', letterSpacing: 'var(--tracking-tightest)', fontWeight: '800', fontFamily: 'var(--font-mono)', color: '#ffffff', marginTop: '0.2rem' }}>
                    ${(selectedRun.portfolioValueBefore ?? 585.0).toFixed(1)}M
                  </div>
                </div>

                <div style={{ padding: '0.85rem', backgroundColor: '#131418', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: 'var(--text-overline)', lineHeight: 'var(--leading-none)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-widest)', fontWeight: '600' }}>
                    Stressed Portfolio
                  </div>
                  <div style={{ fontSize: 'var(--text-h1)', lineHeight: 'var(--leading-tight)', letterSpacing: 'var(--tracking-tightest)', fontWeight: '800', fontFamily: 'var(--font-mono)', color: '#0284c7', marginTop: '0.2rem' }}>
                    ${(selectedRun.portfolioValueAfter ?? 541.25).toFixed(1)}M
                  </div>
                </div>
              </div>

              {/* Net PnL Impact Banner */}
              <div style={{
                padding: '0.85rem',
                backgroundColor: 'rgba(239, 68, 68, 0.08)',
                borderRadius: '6px',
                border: '1px solid rgba(239, 68, 68, 0.3)',
              }}>
                <div style={{ fontSize: 'var(--text-overline)', lineHeight: 'var(--leading-none)', color: '#fca5a5', textTransform: 'uppercase', letterSpacing: 'var(--tracking-widest)', fontWeight: '700' }}>
                  Quantitative PnL Drawdown
                </div>
                <div style={{ fontSize: 'var(--text-display-lg)', lineHeight: 'var(--leading-tight)', letterSpacing: 'var(--tracking-tightest)', fontWeight: '900', fontFamily: 'var(--font-mono)', color: '#ef4444', marginTop: '0.2rem' }}>
                  -${Math.abs(selectedRun.totalPnlImpact ?? 0).toFixed(2)}M
                </div>
                <div style={{ fontSize: 'var(--text-caption)', lineHeight: 'var(--leading-snug)', letterSpacing: 'var(--tracking-tight)', fontFamily: 'var(--font-mono)', color: '#fda4af', marginTop: '0.1rem' }}>
                  Erosion: {(selectedRun.percentageChange ?? 0).toFixed(2)}% of notional
                </div>
              </div>

              {/* Execution Timestamp */}
              <div style={{ padding: '0.85rem', backgroundColor: '#131418', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: 'var(--text-overline)', lineHeight: 'var(--leading-none)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-widest)', fontWeight: '600' }}>
                  Audit Trail Timestamp & Signature
                </div>
                <div style={{ fontSize: 'var(--text-body-sm)', lineHeight: 'var(--leading-snug)', letterSpacing: 'var(--tracking-normal)', fontFamily: 'var(--font-mono)', color: '#94a3b8', marginTop: '0.2rem' }}>
                  {selectedRun.executedAt ? new Date(selectedRun.executedAt).toUTCString() : 'Recent Session'}
                </div>
                <div style={{ fontSize: 'var(--text-micro)', lineHeight: 'var(--leading-normal)', letterSpacing: 'var(--tracking-normal)', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  Engine: RiskEngine Module B (Factor Model + Delta Normal)
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="institutional-card" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Select an audit entry from the execution log to inspect quantitative parameters.
          </div>
        )}
      </div>
    </div>
  );
};
