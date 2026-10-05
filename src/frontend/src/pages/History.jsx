import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  History as HistoryIcon,
  ShieldCheck,
  Calendar,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { RiskEngineApi } from '../services/api';
import { EventBadge } from '../components/common/Badge';
import { Loader } from '../components/common/Loader';

export const History = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [selectedRun, setSelectedRun] = useState(null);

  const loadHistory = async () => {
    try {
      const data = await RiskEngineApi.getHistoricalStressTests();
      const list = data?.content || [];
      setHistory(list);
      if (list.length > 0) {
        setSelectedRun(list[0]);
      }
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
    return <Loader message="Retrieving historical stress test audit trail..." />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Top Header */}
      <div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#ffffff', margin: 0 }}>
          Stress Test Audit Trail & Scenario History
        </h2>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.15rem 0 0 0' }}>
          Historical record of automated risk triggers and manual portfolio shock evaluations
        </p>
      </div>

      {/* Two-Column Audit Layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)',
          gap: '1.5rem',
        }}
      >
        {/* Left: Historical Timeline List */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <HistoryIcon size={18} color="#6366f1" />
            <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#ffffff', margin: 0 }}>
              Chronological Audit Log ({history.length} Runs)
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {history.map((run) => {
              const isSelected = selectedRun?.id === run.id;
              const isLoss = (run.totalPnlImpact || 0) < 0;
              return (
                <div
                  key={run.id}
                  onClick={() => setSelectedRun(run)}
                  style={{
                    padding: '1rem 1.25rem',
                    borderRadius: '8px',
                    border: isSelected ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                    backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <span style={{ fontWeight: '700', color: '#ffffff', fontSize: '0.925rem' }}>
                        {run.scenarioName}
                      </span>
                      <EventBadge type={run.eventType} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Calendar size={13} />
                        {run.executedAt ? new Date(run.executedAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'Recent'}
                      </span>
                      <span>Run ID: #{run.id}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div
                        style={{
                          fontSize: '1.05rem',
                          fontWeight: '700',
                          fontFamily: 'var(--font-mono)',
                          color: isLoss ? '#ef4444' : '#10b981',
                        }}
                      >
                        {isLoss ? '-' : '+'}${Math.abs(run.totalPnlImpact).toFixed(2)}M
                      </div>
                      <div style={{ fontSize: '0.725rem', fontFamily: 'var(--font-mono)', color: isLoss ? '#f87171' : '#34d399' }}>
                        {run.percentageChange >= 0 ? '+' : ''}{run.percentageChange.toFixed(2)}%
                      </div>
                    </div>
                    <ChevronRight size={16} color="var(--text-muted)" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Run Detail Inspection Card */}
        {selectedRun ? (
          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={18} color="#10b981" />
                <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#ffffff', margin: 0 }}>
                  Audit Run #{selectedRun.id} Details
                </h3>
              </div>
              <button
                onClick={() => navigate('/stress-test')}
                className="btn btn-outline"
                style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
              >
                <Zap size={13} />
                <span>Rerun Test</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ padding: '0.85rem', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Event Category</div>
                <div style={{ marginTop: '0.3rem' }}>
                  <EventBadge type={selectedRun.eventType} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                <div style={{ padding: '0.85rem', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Portfolio Value Before</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: '700', fontFamily: 'var(--font-mono)', color: '#ffffff', marginTop: '0.2rem' }}>
                    ${selectedRun.portfolioValueBefore.toFixed(1)}M
                  </div>
                </div>

                <div style={{ padding: '0.85rem', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Stressed Portfolio Value</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: '700', fontFamily: 'var(--font-mono)', color: '#38bdf8', marginTop: '0.2rem' }}>
                    ${selectedRun.portfolioValueAfter.toFixed(1)}M
                  </div>
                </div>
              </div>

              <div style={{ padding: '0.85rem', backgroundColor: 'rgba(239, 68, 68, 0.08)', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.25)' }}>
                <div style={{ fontSize: '0.75rem', color: '#fca5a5' }}>Net PnL Impact Under Shock</div>
                <div style={{ fontSize: '1.35rem', fontWeight: '800', fontFamily: 'var(--font-mono)', color: '#ef4444', marginTop: '0.2rem' }}>
                  -${Math.abs(selectedRun.totalPnlImpact).toFixed(2)}M ({selectedRun.percentageChange.toFixed(2)}%)
                </div>
              </div>

              <div style={{ padding: '0.85rem', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Audit Execution Timestamp</div>
                <div style={{ fontSize: '0.85rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  {selectedRun.executedAt ? new Date(selectedRun.executedAt).toISOString() : 'Recent'}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Select an audit log entry to inspect parameters.
          </div>
        )}
      </div>
    </div>
  );
};
