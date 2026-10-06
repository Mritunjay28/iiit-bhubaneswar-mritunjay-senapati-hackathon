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
          backgroundColor: '#15171c',
          border: '1px solid #242731',
          padding: '0.75rem 1rem',
          borderRadius: '6px',
          fontFamily: 'var(--font-sans)',
          boxShadow: '0 4px 15px rgba(0,0,0,0.6)',
        }}
      >
        <div style={{ fontSize: 'var(--text-body-sm)', lineHeight: 'var(--leading-snug)', letterSpacing: 'var(--tracking-tight)', fontWeight: '700', color: '#ffffff', marginBottom: '0.35rem' }}>
          {d.fullName} <span style={{ fontSize: 'var(--text-micro)', color: 'var(--text-muted)' }}>({d.type})</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', fontSize: 'var(--text-caption)', lineHeight: 'var(--leading-normal)', letterSpacing: 'var(--tracking-normal)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', color: '#9ca3af' }}>
            <span>Baseline Notional:</span>
            <span style={{ fontFamily: 'var(--font-mono)', color: '#ffffff' }}>${(d.before ?? 0).toFixed(2)}M</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', color: '#9ca3af' }}>
            <span>Stressed Valuation:</span>
            <span style={{ fontFamily: 'var(--font-mono)', color: '#38bdf8' }}>${(d.after ?? 0).toFixed(2)}M</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', color: '#9ca3af' }}>
            <span>Net PnL Impact:</span>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontWeight: '700',
                color: (d.loss ?? 0) >= 0 ? '#10b981' : '#ef4444',
              }}
            >
              {(d.loss ?? 0) >= 0 ? '+' : ''}${(d.loss ?? 0).toFixed(2)}M ({(d.shock ?? 0).toFixed(1)}%)
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export const AssetImpactBar = React.memo(({ assetDetails = [] }) => {
  const data = (assetDetails.length > 0 ? assetDetails : [])
    .slice(0, 10)
    .map(a => {
      const shockVal = a.shockAppliedPercent ?? a.shockApplied ?? a.percentageChange ?? 0;
      return {
        name: (a.assetName || '').length > 14 ? (a.assetName || '').substring(0, 14) + '...' : (a.assetName || 'Asset'),
        fullName: a.assetName || 'Asset',
        type: a.assetType || 'N/A',
        before: a.valueBefore ?? a.notionalValue ?? 0,
        after: a.valueAfter ?? 0,
        loss: a.pnlImpact ?? 0,
        shock: shockVal,
      };
    });

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 15, right: 15, left: 5, bottom: 35 }}>
          <CartesianGrid strokeDasharray="2 2" stroke="#242731" vertical={false} />
          <XAxis
            dataKey="name"
            stroke="var(--text-muted)"
            fontSize={11}
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
            wrapperStyle={{ paddingBottom: '10px', fontSize: 'var(--text-micro)', letterSpacing: 'var(--tracking-wide)' }}
          />
          <Bar name="Initial Notional ($M)" dataKey="before" fill="#2563eb" radius={[2, 2, 0, 0]} />
          <Bar name="Stressed Value ($M)" dataKey="after" fill="#0284c7" radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
});

AssetImpactBar.displayName = 'AssetImpactBar';
