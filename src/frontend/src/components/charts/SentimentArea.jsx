import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const val = data.sentiment;
    const isBullish = val > 0;
    return (
      <div
        style={{
          backgroundColor: '#15171c',
          border: '1px solid #242731',
          padding: '0.65rem 0.85rem',
          borderRadius: '6px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.6)',
          fontFamily: 'var(--font-sans)',
        }}
      >
        <div style={{ fontSize: 'var(--text-caption)', lineHeight: 'var(--leading-snug)', letterSpacing: 'var(--tracking-normal)', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
          Time: <span style={{ color: '#fff', fontFamily: 'var(--font-mono)' }}>{label}</span> | Entity: {data.entity}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: 'var(--text-caption)', lineHeight: 'var(--leading-normal)', color: 'var(--text-secondary)' }}>FinBERT:</span>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontWeight: '700',
              color: isBullish ? '#10b981' : '#ef4444',
            }}
          >
            {val > 0 ? `+${val.toFixed(2)}` : val.toFixed(2)} ({isBullish ? 'Bullish' : 'Bearish'})
          </span>
        </div>
        <div style={{ fontSize: 'var(--text-micro)', lineHeight: 'var(--leading-normal)', letterSpacing: 'var(--tracking-normal)', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
          Impact Factor: <span style={{ color: '#f59e0b', fontWeight: '600' }}>{data.impact}/10</span>
        </div>
      </div>
    );
  }
  return null;
};

export const SentimentArea = React.memo(({ signals = [] }) => {
  const chartData = signals.length > 0
    ? signals.map((s, idx) => ({
        time: s.timestamp ? s.timestamp.substring(11, 16) : `T-${idx}`,
        sentiment: s.sentimentScore,
        impact: s.impactScore,
        entity: s.entity || 'Market',
      }))
    : [];

  return (
    <div style={{ width: '100%', height: 240 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="sentimentGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="2 2" stroke="#242731" vertical={false} />
          <XAxis
            dataKey="time"
            stroke="var(--text-muted)"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: '#242731' }}
          />
          <YAxis
            stroke="var(--text-muted)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            domain={[-1.0, 1.0]}
            ticks={[-1.0, -0.5, 0, 0.5, 1.0]}
          />
          <ReferenceLine y={0} stroke="#404450" strokeDasharray="2 2" />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="sentiment"
            stroke="#2563eb"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#sentimentGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
});

SentimentArea.displayName = 'SentimentArea';
