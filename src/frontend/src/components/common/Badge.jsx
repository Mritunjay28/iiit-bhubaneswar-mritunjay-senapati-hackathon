import React from 'react';

const EVENT_CONFIG = {
  GEOPOLITICAL: { label: 'Geopolitical', bg: 'rgba(239, 68, 68, 0.12)', border: '#ef4444', text: '#fca5a5' },
  CREDIT_EVENT: { label: 'Credit Event', bg: 'rgba(249, 115, 22, 0.12)', border: '#f97316', text: '#fdba74' },
  MACROECONOMIC: { label: 'Macroeconomic', bg: 'rgba(245, 158, 11, 0.12)', border: '#f59e0b', text: '#fde68a' },
  REGULATORY: { label: 'Regulatory', bg: 'rgba(2, 132, 199, 0.12)', border: '#0284c7', text: '#7dd3fc' },
  MERGER_ACQUISITION: { label: 'M&A', bg: 'rgba(14, 165, 233, 0.12)', border: '#0ea5e9', text: '#bae6fd' },
  EARNINGS: { label: 'Earnings', bg: 'rgba(59, 130, 246, 0.12)', border: '#3b82f6', text: '#bfdbfe' },
  PRODUCT_LAUNCH: { label: 'Product Launch', bg: 'rgba(16, 185, 129, 0.12)', border: '#10b981', text: '#a7f3d0' },
};

const ASSET_CONFIG = {
  BOND: { bg: 'rgba(59, 130, 246, 0.12)', border: '#3b82f6', text: '#93c5fd' },
  LOAN: { bg: 'rgba(16, 185, 129, 0.12)', border: '#10b981', text: '#6ee7b7' },
  EQUITY: { bg: 'rgba(245, 158, 11, 0.12)', border: '#f59e0b', text: '#fde68a' },
  DERIVATIVE: { bg: 'rgba(2, 132, 199, 0.12)', border: '#0284c7', text: '#7dd3fc' },
};

export const EventBadge = ({ type }) => {
  const config = EVENT_CONFIG[type] || {
    label: type || 'Unknown',
    bg: 'rgba(148, 163, 184, 0.12)',
    border: '#94a3b8',
    text: '#cbd5e1',
  };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '0.2rem 0.55rem',
        borderRadius: '4px',
        fontSize: 'var(--text-micro)',
        lineHeight: 'var(--leading-none)',
        fontWeight: '600',
        letterSpacing: 'var(--tracking-wide)',
        backgroundColor: config.bg,
        border: `1px solid ${config.border}`,
        color: config.text,
      }}
    >
      {config.label}
    </span>
  );
};

export const AssetBadge = ({ type }) => {
  const config = ASSET_CONFIG[type] || {
    bg: 'rgba(148, 163, 184, 0.12)',
    border: '#94a3b8',
    text: '#cbd5e1',
  };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '0.15rem 0.5rem',
        borderRadius: '4px',
        fontSize: 'var(--text-micro)',
        lineHeight: 'var(--leading-none)',
        fontFamily: 'var(--font-mono)',
        fontWeight: '700',
        letterSpacing: 'var(--tracking-wider)',
        backgroundColor: config.bg,
        border: `1px solid ${config.border}`,
        color: config.text,
      }}
    >
      {type}
    </span>
  );
};

export const SentimentBadge = ({ score }) => {
  const num = typeof score === 'number' ? score : parseFloat(score || 0);
  let bg = 'rgba(100, 116, 139, 0.12)';
  let border = '#64748b';
  let text = '#94a3b8';
  let label = 'NEUTRAL';

  if (num > 0.15) {
    bg = 'rgba(16, 185, 129, 0.12)';
    border = '#10b981';
    text = '#34d399';
    label = `+${num.toFixed(2)} BULLISH`;
  } else if (num < -0.15) {
    bg = 'rgba(239, 68, 68, 0.12)';
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
        padding: '0.2rem 0.5rem',
        borderRadius: '4px',
        fontSize: 'var(--text-micro)',
        lineHeight: 'var(--leading-none)',
        fontFamily: 'var(--font-mono)',
        fontWeight: '600',
        letterSpacing: 'var(--tracking-wide)',
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

  let bg = 'rgba(16, 185, 129, 0.12)';
  let border = '#10b981';
  let text = '#6ee7b7';

  if (num >= 7) {
    bg = 'rgba(239, 68, 68, 0.15)';
    border = '#ef4444';
    text = '#f87171';
  } else if (num >= 5) {
    bg = 'rgba(245, 158, 11, 0.15)';
    border = '#f59e0b';
    text = '#fde68a';
  }

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0.15rem 0.45rem',
          borderRadius: '4px',
          fontSize: 'var(--text-micro)',
          lineHeight: 'var(--leading-none)',
          fontFamily: 'var(--font-mono)',
          fontWeight: '700',
          letterSpacing: 'var(--tracking-normal)',
          backgroundColor: bg,
          border: `1px solid ${border}`,
          color: text,
        }}
      >
        {num}/10
      </span>
      {isHigh && (
        <span
          style={{
            fontSize: 'var(--text-micro)',
            lineHeight: 'var(--leading-none)',
            fontWeight: '700',
            padding: '0.15rem 0.35rem',
            borderRadius: '3px',
            backgroundColor: '#dc2626',
            color: '#fff',
            textTransform: 'uppercase',
            letterSpacing: 'var(--tracking-widest)',
          }}
        >
          Auto Shock
        </span>
      )}
    </div>
  );
};
