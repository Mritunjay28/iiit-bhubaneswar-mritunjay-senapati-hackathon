import React from 'react';
import { EventBadge, SentimentBadge, ImpactBadge } from '../common/Badge';
import { Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const RiskSignalCard = ({ signal }) => {
  const navigate = useNavigate();
  const isHighImpact = (signal.impactScore || 0) >= 7;

  return (
    <div
      className="institutional-card risk-signal-card"
      style={{
        padding: '1.1rem 1.25rem',
        borderLeft: isHighImpact ? '4px solid #ef4444' : '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.65rem',
        background: 'var(--bg-card)',
      }}
    >
      {/* Top Header Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span
            style={{
              fontSize: 'var(--text-micro)',
              lineHeight: 'var(--leading-none)',
              letterSpacing: 'var(--tracking-wide)',
              fontFamily: 'var(--font-mono)',
              fontWeight: '700',
              padding: '0.15rem 0.45rem',
              borderRadius: '3px',
              backgroundColor: '#121317',
              color: signal.source === 'GDELT' ? '#38bdf8' : '#93c5fd',
              border: '1px solid var(--border-subtle)',
            }}
          >
            {signal.source || 'FEED'}
          </span>
          <EventBadge type={signal.eventType} />
          {signal.entity && (
            <span style={{ fontSize: 'var(--text-caption)', lineHeight: 'var(--leading-none)', letterSpacing: 'var(--tracking-normal)', color: 'var(--text-secondary)', fontWeight: '600' }}>
              • {signal.entity}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <SentimentBadge score={signal.sentimentScore} />
          <ImpactBadge score={signal.impactScore} />
        </div>
      </div>

      {/* Raw Text Body */}
      <p
        style={{
          fontSize: 'var(--text-body)',
          lineHeight: 'var(--leading-relaxed)',
          letterSpacing: 'var(--tracking-normal)',
          color: isHighImpact ? '#ffffff' : 'var(--text-primary)',
          margin: 0,
        }}
      >
        "{signal.rawText}"
      </p>

      {/* Footer Details & The ONE Repeated Action */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '0.5rem',
          borderTop: '1px solid var(--border-subtle)',
          fontSize: 'var(--text-caption)',
          lineHeight: 'var(--leading-none)',
          letterSpacing: 'var(--tracking-normal)',
          color: 'var(--text-muted)',
        }}
      >
        <span>{signal.timestamp ? new Date(signal.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Live'}</span>
        
        {/* The ONE CTA Repeated */}
        <button
          onClick={() => navigate('/stress-test', { state: { signal } })}
          className={isHighImpact ? 'btn btn-danger' : 'btn btn-outline'}
          style={{ padding: '0.25rem 0.6rem', fontSize: 'var(--text-caption)' }}
          title="Simulate shock test under this event"
        >
          <Zap size={12} />
          <span>Simulate Shock</span>
        </button>
      </div>
    </div>
  );
};
