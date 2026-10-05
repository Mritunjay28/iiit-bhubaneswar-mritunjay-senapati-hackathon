import React from 'react';
import { EventBadge, SentimentBadge, ImpactBadge } from '../common/Badge';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const RiskSignalCard = ({ signal }) => {
  const navigate = useNavigate();
  const isHighImpact = (signal.impactScore || 0) >= 7;

  return (
    <div
      className="glass-panel"
      style={{
        padding: '1.15rem 1.25rem',
        borderLeft: isHighImpact ? '4px solid #ef4444' : '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        transition: 'all var(--transition-fast)',
      }}
    >
      {/* Top Header Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span
            style={{
              fontSize: '0.7rem',
              fontFamily: 'var(--font-mono)',
              padding: '0.15rem 0.45rem',
              borderRadius: '4px',
              backgroundColor: signal.source === 'GDELT' ? 'rgba(6, 182, 212, 0.15)' : 'rgba(59, 130, 246, 0.15)',
              color: signal.source === 'GDELT' ? '#67e8f9' : '#93c5fd',
              border: `1px solid ${signal.source === 'GDELT' ? 'rgba(6, 182, 212, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`,
            }}
          >
            {signal.source || 'FEED'}
          </span>
          <EventBadge type={signal.eventType} />
          {signal.entity && (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
              • {signal.entity}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <SentimentBadge score={signal.sentimentScore} />
          <ImpactBadge score={signal.impactScore} />
        </div>
      </div>

      {/* Raw Text Body */}
      <p
        style={{
          fontSize: '0.85rem',
          lineHeight: '1.45',
          color: 'var(--text-primary)',
          margin: 0,
        }}
      >
        "{signal.rawText}"
      </p>

      {/* Footer Details & Stress Test Trigger Indicator */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '0.5rem',
          borderTop: '1px solid var(--border-subtle)',
          fontSize: '0.725rem',
          color: 'var(--text-muted)',
        }}
      >
        <span>{signal.timestamp ? new Date(signal.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Live'}</span>
        {isHighImpact ? (
          <button
            onClick={() => navigate('/stress-test')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              color: '#f87171',
              fontWeight: '600',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            <AlertTriangle size={13} />
            <span>Auto Stress Test Executed</span>
            <ArrowRight size={12} />
          </button>
        ) : (
          <span style={{ color: 'var(--text-muted)' }}>Monitored (Impact &lt; 7)</span>
        )}
      </div>
    </div>
  );
};
