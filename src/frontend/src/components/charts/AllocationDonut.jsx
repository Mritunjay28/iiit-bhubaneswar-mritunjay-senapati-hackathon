import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    return (
      <div
        style={{
          backgroundColor: '#15171c',
          border: '1px solid #242731',
          padding: '0.65rem 0.85rem',
          borderRadius: '6px',
          fontFamily: 'var(--font-sans)',
          boxShadow: '0 4px 15px rgba(0,0,0,0.6)',
        }}
      >
        <div style={{ fontSize: 'var(--text-caption)', lineHeight: 'var(--leading-snug)', letterSpacing: 'var(--tracking-normal)', fontWeight: '600', color: d.color }}>
          {d.name}
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.2rem' }}>
          <span style={{ fontSize: 'var(--text-h2)', lineHeight: 'var(--leading-tight)', letterSpacing: 'var(--tracking-tightest)', fontWeight: '700', fontFamily: 'var(--font-mono)', color: '#ffffff' }}>
            ${d.value.toFixed(1)}M
          </span>
        </div>
      </div>
    );
  }
  return null;
};

export const AllocationDonut = React.memo(({ data = [], mode = 'assetType' }) => {
  const ASSET_COLORS = {
    BOND: '#3b82f6',
    DERIVATIVE: '#0284c7', // Cyan instead of purple
    LOAN: '#10b981',
    EQUITY: '#f59e0b',
  };

  const SECTOR_COLORS = [
    '#2563eb', '#10b981', '#f59e0b', '#0284c7',
    '#059669', '#d97706', '#0891b2', '#64748b', '#475569',
  ];

  const chartData = data.map((d, index) => ({
    name: d.name,
    value: Math.round(d.value * 10) / 10,
    color: mode === 'assetType'
      ? (ASSET_COLORS[d.name] || '#64748b')
      : SECTOR_COLORS[index % SECTOR_COLORS.length],
  }));

  return (
    <div style={{ width: '100%', height: 260 }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            align="left"
            iconType="circle"
            wrapperStyle={{ fontSize: 'var(--text-micro)', letterSpacing: 'var(--tracking-wide)', paddingTop: '10px' }}
          />
          <Pie
            data={chartData}
            cx="50%"
            cy="45%"
            innerRadius={65}
            outerRadius={92}
            paddingAngle={2}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} stroke="var(--bg-card)" strokeWidth={2} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
});

AllocationDonut.displayName = 'AllocationDonut';
