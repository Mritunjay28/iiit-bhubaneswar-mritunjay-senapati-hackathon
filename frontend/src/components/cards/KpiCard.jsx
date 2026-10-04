import React from 'react';

export const KpiCard = ({
  title,
  value,
  subtitle,
  change,
  changeType = 'neutral', // 'positive', 'negative', 'neutral'
  icon: Icon,
  glow = 'indigo',
}) => {
  const glowColors = {
    indigo: 'rgba(99, 102, 241, 0.15)',
    rose: 'rgba(239, 68, 68, 0.15)',
    emerald: 'rgba(16, 185, 129, 0.15)',
    amber: 'rgba(245, 158, 11, 0.15)',
    cyan: 'rgba(6, 182, 212, 0.15)',
  };

  const borderAccent = {
    indigo: 'rgba(99, 102, 241, 0.3)',
    rose: 'rgba(239, 68, 68, 0.3)',
    emerald: 'rgba(16, 185, 129, 0.3)',
    amber: 'rgba(245, 158, 11, 0.3)',
    cyan: 'rgba(6, 182, 212, 0.3)',
  };

  const changeColors = {
    positive: '#10b981',
    negative: '#ef4444',
    neutral: '#94a3b8',
  };

  return (
    <div
      className="glass-panel"
      style={{
        padding: '1.25rem 1.4rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
        border: `1px solid ${borderAccent[glow] || borderAccent.indigo}`,
        background: `radial-gradient(circle at top right, ${glowColors[glow] || glowColors.indigo} 0%, var(--bg-card) 70%)`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <span
          style={{
            fontSize: '0.8rem',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: 'var(--text-secondary)',
          }}
        >
          {title}
        </span>
        {Icon && (
          <div
            style={{
              padding: '0.45rem',
              borderRadius: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-primary)',
            }}
          >
            <Icon size={18} />
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginBottom: '0.35rem' }}>
        <span
          style={{
            fontSize: '1.85rem',
            fontWeight: '700',
            fontFamily: 'var(--font-mono)',
            color: '#ffffff',
            letterSpacing: '-0.02em',
          }}
        >
          {value}
        </span>
        {change && (
          <span
            style={{
              fontSize: '0.775rem',
              fontWeight: '700',
              fontFamily: 'var(--font-mono)',
              color: changeColors[changeType] || changeColors.neutral,
              padding: '0.15rem 0.4rem',
              borderRadius: '4px',
              backgroundColor: `${changeColors[changeType]}18`,
            }}
          >
            {change}
          </span>
        )}
      </div>

      {subtitle && (
        <span
          style={{
            fontSize: '0.775rem',
            color: 'var(--text-muted)',
            lineHeight: 1.4,
          }}
        >
          {subtitle}
        </span>
      )}
    </div>
  );
};
