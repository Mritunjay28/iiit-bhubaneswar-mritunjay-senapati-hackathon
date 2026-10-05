import React from 'react';

const EVENT_CONFIG = {
  GEOPOLITICAL: { label: 'Geopolitical', bg: 'rgba(239, 68, 68, 0.15)', border: '#ef4444', text: '#fca5a5' },
  CREDIT_EVENT: { label: 'Credit Event', bg: 'rgba(249, 115, 22, 0.15)', border: '#f97316', text: '#fdba74' },
  MACROECONOMIC: { label: 'Macroeconomic', bg: 'rgba(245, 158, 11, 0.15)', border: '#f59e0b', text: '#fde68a' },
  REGULATORY: { label: 'Regulatory', bg: 'rgba(168, 85, 247, 0.15)', border: '#a855f7', text: '#d8b4fe' },
  MERGER_ACQUISITION: { label: 'M&A', bg: 'rgba(6, 182, 212, 0.15)', border: '#06b6d4', text: '#67e8f9' },
  EARNINGS: { label: 'Earnings', bg: 'rgba(59, 130, 246, 0.15)', border: '#3b82f6', text: '#93c5fd' },
  PRODUCT_LAUNCH: { label: 'Product Launch', bg: 'rgba(16, 185, 129, 0.15)', border: '#10b981', text: '#6ee7b7' },
};

export const EventBadge = ({ type }) => {
  const config = EVENT_CONFIG[type] || {
    label: type || 'Unknown',
    bg: 'rgba(148, 163, 184, 0.15)',
    border: '#94a3b8',
    text: '#cbd5e1',
  };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '0.2rem 0.55rem',
        borderRadius: '6px',
        fontSize: '0.75rem',
        fontWeight: '600',
        letterSpacing: '0.025em',
        backgroundColor: config.bg,
        border: `1px solid ${config.border}`,
        color: config.text,
      }}
    >
      {config.label}
    </span>
  );
};

export const SentimentBadge = ({ score }) => {
  const num = typeof score === 'number' ? score : parseFloat(score || 0);
  let bg = 'rgba(100, 116, 139, 0.15)';
  let border = '#64748b';
  let text = '#94a3b8';
  let label = 'NEUTRAL';

  if (num > 0.15) {
    bg = 'rgba(16, 185, 129, 0.15)';
    border = '#10b981';
    text = '#34d399';
    label = `+${num.toFixed(2)} BULLISH`;
  } else if (num < -0.15) {
    bg = 'rgba(239, 68, 68, 0.15)';
    border = '#ef4444';
    text = '#f87171';
    label = `${num.toFixed(2)} BEARISH`;
  } else {
    label = `${num.toFixed(2)} NEUTRAL`;
  }

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '0.2rem 0.55rem',
        borderRadius: '6px',
        fontSize: '0.725rem',
        fontFamily: 'var(--font-mono)',
        fontWeight: '600',
        backgroundColor: bg,
        border: `1px solid ${border}`,
        color: text,
      }}
    >
      {label}
    </span>
  );
};

export const ImpactBadge = ({ score }) => {
  const num = parseInt(score, 10) || 1;
  const isHigh = num >= 7;

  let bg = 'rgba(16, 185, 129, 0.15)';
  let border = '#10b981';
  let text = '#6ee7b7';

  if (num >= 7) {
    bg = 'rgba(239, 68, 68, 0.2)';
    border = '#ef4444';
    text = '#f87171';
  } else if (num >= 5) {
    bg = 'rgba(245, 158, 11, 0.2)';
    border = '#f59e0b';
    text = '#fde68a';
  }

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '28px',
          height: '24px',
          borderRadius: '6px',
          fontSize: '0.8rem',
          fontFamily: 'var(--font-mono)',
          fontWeight: '700',
          backgroundColor: bg,
          border: `1px solid ${border}`,
          color: text,
          boxShadow: isHigh ? '0 0 10px rgba(239, 68, 68, 0.4)' : 'none',
        }}
      >
        {num}
      </span>
      {isHigh && (
        <span
          style={{
            fontSize: '0.65rem',
            fontWeight: '700',
            letterSpacing: '0.05em',
            padding: '0.15rem 0.4rem',
            borderRadius: '4px',
            background: 'linear-gradient(90deg, #ef4444, #dc2626)',
            color: '#fff',
            textTransform: 'uppercase',
          }}
        >
          Auto Shock
        </span>
      )}
    </div>
  );
};
