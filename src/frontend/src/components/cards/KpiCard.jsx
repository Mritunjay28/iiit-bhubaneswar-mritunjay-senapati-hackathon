import React from 'react';

export const KpiCard = ({
  title,
  value,
  subtitle,
  change,
  changeType = 'neutral', // 'positive', 'negative', 'neutral'
  icon: Icon,
  accent = 'blue', // 'blue', 'rose', 'emerald', 'amber', 'cyan'
  progress = null, // optional 0-100 percentage for Klips/Taskos style progress bar
  className = '',
}) => {
  const accentColors = {
    blue: '#2563eb',
    rose: '#ef4444',
    emerald: '#10b981',
    amber: '#f59e0b',
    cyan: '#0284c7',
  };

  const changeColors = {
    positive: '#10b981',
    negative: '#ef4444',
    neutral: '#9ca3af',
  };

  const activeAccent = accentColors[accent] || accentColors.blue;

  return (
    <div
      className={`institutional-card ${className}`}
      style={{
        padding: '1.25rem 1.35rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
      }}
    >
      {/* Top Header Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
        <span
          style={{
            fontSize: 'var(--text-overline)',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: 'var(--tracking-wider)',
            lineHeight: 'var(--leading-none)',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-sans)',
          }}
        >
          {title}
        </span>
        {Icon && (
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '4px',
              backgroundColor: '#131418',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: activeAccent,
            }}
          >
            <Icon size={15} />
          </div>
        )}
      </div>

      {/* Primary Value Readout */}
      <div
        style={{
          fontSize: 'var(--text-display-xl)',
          fontWeight: '800',
          fontFamily: 'var(--font-mono)',
          color: 'var(--text-primary)',
          letterSpacing: 'var(--tracking-tightest)',
          lineHeight: 'var(--leading-tight)',
        }}
      >
        {value}
      </div>

      {/* Progress Underline (Inspired by Reference 1 Taskos & Reference 2 Klips) */}
      <div
        style={{
          width: '100%',
          height: '4px',
          backgroundColor: '#242731',
          borderRadius: '2px',
          margin: '0.85rem 0 0.65rem 0',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: progress !== null ? `${Math.min(100, Math.max(8, progress))}%` : '45%',
            height: '100%',
            backgroundColor: activeAccent,
            borderRadius: '2px',
          }}
        />
      </div>

      {/* Sub-label and Comparison Trend */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 'var(--text-caption)', lineHeight: 'var(--leading-normal)', letterSpacing: 'var(--tracking-normal)' }}>
        <span style={{ color: 'var(--text-secondary)' }}>
          {subtitle}
        </span>
        {change && (
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-caption)',
              lineHeight: 'var(--leading-none)',
              letterSpacing: 'var(--tracking-normal)',
              fontWeight: '700',
              color: changeColors[changeType] || changeColors.neutral,
            }}
          >
            {change}
          </span>
        )}
      </div>
    </div>
  );
};
