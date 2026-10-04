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

export const SentimentArea = ({ signals = [] }) => {
  // Generate chronological sentiment trajectory from signals
  const chartData = signals.length > 0
    ? signals.map((s, idx) => ({
        time: s.timestamp ? s.timestamp.substring(11, 16) : `T-${idx}`,
        sentiment: s.sentimentScore,
        impact: s.impactScore,
        entity: s.entity || 'Market',
      }))
    : [
        { time: '10:00', sentiment: 0.15, impact: 3, entity: 'S&P 500' },
        { time: '11:00', sentiment: -0.25, impact: 5, entity: 'US Treasury' },
        { time: '12:00', sentiment: 0.45, impact: 4, entity: 'Tech Sector' },
        { time: '13:00', sentiment: -0.65, impact: 7, entity: 'Credit Default' },
        { time: '14:00', sentiment: -0.84, impact: 8, entity: 'Banking' },
        { time: '15:00', sentiment: -0.78, impact: 9, entity: 'Crude Oil' },
      ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const val = data.sentiment;
      const isBullish = val > 0;
      return (
        <div
          style={{
            backgroundColor: '#0f172a',
            border: '1px solid var(--border-medium)',
            padding: '0.65rem 0.85rem',
            borderRadius: '8px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
            fontFamily: 'var(--font-sans)',
          }}
        >
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
            Time: <span style={{ color: '#fff', fontFamily: 'var(--font-mono)' }}>{label}</span> | Entity: {data.entity}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Sentiment:</span>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontWeight: '700',
                color: isBullish ? '#34d399' : '#f87171',
              }}
            >
              {val > 0 ? `+${val.toFixed(2)}` : val.toFixed(2)} ({isBullish ? 'Bullish' : 'Bearish'})
            </span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Impact Score: <span style={{ color: '#f59e0b', fontWeight: '600' }}>{data.impact}/10</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ width: '100%', height: 260 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="sentimentGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.6} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="bearishGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.5} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
          <XAxis
            dataKey="time"
            stroke="var(--text-muted)"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
          />
          <YAxis
            stroke="var(--text-muted)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            domain={[-1.0, 1.0]}
            ticks={[-1.0, -0.5, 0, 0.5, 1.0]}
          />
          <ReferenceLine y={0} stroke="rgba(255, 255, 255, 0.2)" strokeDasharray="2 2" />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="sentiment"
            stroke="#6366f1"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#sentimentGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
