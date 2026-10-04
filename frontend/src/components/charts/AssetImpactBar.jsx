import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    return (
      <div
        style={{
          backgroundColor: '#0f172a',
          border: '1px solid var(--border-medium)',
          padding: '0.75rem 1rem',
          borderRadius: '8px',
          fontFamily: 'var(--font-sans)',
          boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
        }}
      >
        <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#ffffff', marginBottom: '0.35rem' }}>
          {d.fullName} <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>({d.type})</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', fontSize: '0.775rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', color: '#94a3b8' }}>
            <span>Notional Before:</span>
            <span style={{ fontFamily: 'var(--font-mono)', color: '#ffffff' }}>${d.before.toFixed(2)}M</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', color: '#94a3b8' }}>
            <span>Stressed Value:</span>
            <span style={{ fontFamily: 'var(--font-mono)', color: '#38bdf8' }}>${d.after.toFixed(2)}M</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', color: '#94a3b8' }}>
            <span>Net PnL Impact:</span>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontWeight: '700',
                color: d.loss >= 0 ? '#34d399' : '#f87171',
              }}
            >
              {d.loss >= 0 ? '+' : ''}${d.loss.toFixed(2)}M ({d.shock.toFixed(1)}%)
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export const AssetImpactBar = ({ assetDetails = [] }) => {
  const data = (assetDetails.length > 0 ? assetDetails : [])
    .slice(0, 10)
    .map(a => ({
      name: a.assetName.length > 14 ? a.assetName.substring(0, 14) + '...' : a.assetName,
      fullName: a.assetName,
      type: a.assetType,
      before: a.valueBefore,
      after: a.valueAfter,
      loss: a.pnlImpact,
      shock: a.shockAppliedPercent,
    }));

  return (
    <div style={{ width: '100%', height: 320 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 20, left: 10, bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
          <XAxis
            dataKey="name"
            stroke="var(--text-muted)"
            fontSize={10}
            angle={-25}
            textAnchor="end"
            interval={0}
            tickLine={false}
          />
          <YAxis
            stroke="var(--text-muted)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `$${v}M`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="top"
            align="right"
            wrapperStyle={{ paddingBottom: '10px', fontSize: '11px' }}
          />
          <Bar name="Initial Notional ($M)" dataKey="before" fill="#6366f1" radius={[3, 3, 0, 0]} />
          <Bar name="Stressed Value ($M)" dataKey="after" fill="#06b6d4" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
