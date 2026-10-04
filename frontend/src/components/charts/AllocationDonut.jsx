import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export const AllocationDonut = ({ data = [], mode = 'assetType' }) => {
  const ASSET_COLORS = {
    BOND: '#3b82f6',
    DERIVATIVE: '#a855f7',
    LOAN: '#10b981',
    EQUITY: '#f59e0b',
  };

  const SECTOR_COLORS = [
    '#3b82f6', '#10b981', '#f59e0b', '#06b6d4',
    '#a855f7', '#ec4899', '#f97316', '#14b8a6', '#8b5cf6',
  ];

  const chartData = data.map((d, index) => ({
    name: d.name,
    value: Math.round(d.value * 10) / 10,
    color: mode === 'assetType'
      ? (ASSET_COLORS[d.name] || '#64748b')
      : SECTOR_COLORS[index % SECTOR_COLORS.length],
  }));

  const total = chartData.reduce((acc, curr) => acc + curr.value, 0);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      const share = total > 0 ? ((d.value / total) * 100).toFixed(1) : 0;
      return (
        <div
          style={{
            backgroundColor: '#0f172a',
            border: '1px solid var(--border-medium)',
            padding: '0.65rem 0.85rem',
            borderRadius: '8px',
            fontFamily: 'var(--font-sans)',
            boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
          }}
        >
          <div style={{ fontSize: '0.8rem', fontWeight: '600', color: d.color }}>
            {d.name}
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.2rem' }}>
            <span style={{ fontSize: '1.05rem', fontWeight: '700', fontFamily: 'var(--font-mono)', color: '#ffffff' }}>
              ${d.value.toFixed(1)}M
            </span>
            <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
              ({share}%)
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ width: '100%', height: 260 }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            align="center"
            iconType="circle"
            wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
          />
          <Pie
            data={chartData}
            cx="50%"
            cy="45%"
            innerRadius={65}
            outerRadius={95}
            paddingAngle={3}
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
};
