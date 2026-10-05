import React from 'react';

export const Loader = ({ message = 'Computing quantitative risk metrics...' }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1.5rem',
        gap: '1rem',
      }}
    >
      <div
        style={{
          width: '42px',
          height: '42px',
          borderRadius: '50%',
          border: '3px solid rgba(99, 102, 241, 0.2)',
          borderTopColor: '#6366f1',
          borderRightColor: '#06b6d4',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
      <span
        style={{
          fontSize: '0.875rem',
          color: 'var(--text-secondary)',
          fontFamily: 'var(--font-mono)',
          letterSpacing: '0.02em',
        }}
      >
        {message}
      </span>
    </div>
  );
};

export const Spinner = ({ size = 16, color = '#ffffff' }) => {
  return (
    <span
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        border: '2px solid rgba(255, 255, 255, 0.25)',
        borderTopColor: color,
        display: 'inline-block',
        animation: 'spin 0.6s linear infinite',
        flexShrink: 0,
      }}
    />
  );
};

export const TableSkeleton = ({ rows = 5, cols = 5 }) => {
  return (
    <div style={{ width: '100%', padding: '1rem 0' }}>
      {Array.from({ length: rows }).map((_, rIdx) => (
        <div
          key={rIdx}
          style={{
            display: 'flex',
            gap: '1rem',
            padding: '0.85rem 1rem',
            borderBottom: '1px solid var(--border-subtle)',
            opacity: 1 - rIdx * 0.15,
          }}
        >
          {Array.from({ length: cols }).map((_, cIdx) => (
            <div
              key={cIdx}
              style={{
                flex: cIdx === 1 ? 2 : 1,
                height: '16px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '4px',
                animation: 'pulseGlow 1.5s infinite ease-in-out',
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export const CardSkeleton = ({ count = 4 }) => {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fit, minmax(220px, 1fr))`,
        gap: '1.25rem',
        width: '100%',
      }}
    >
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="glass-panel"
          style={{
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}
        >
          <div
            style={{
              width: '40%',
              height: '14px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '4px',
            }}
          />
          <div
            style={{
              width: '70%',
              height: '28px',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              borderRadius: '6px',
            }}
          />
          <div
            style={{
              width: '50%',
              height: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              borderRadius: '4px',
            }}
          />
        </div>
      ))}
    </div>
  );
};
