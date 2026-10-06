import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
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
        <div style={{ fontSize: 'var(--text-caption)', lineHeight: 'var(--leading-snug)', letterSpacing: 'var(--tracking-normal)', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>{d.name}</div>
        <div style={{ fontSize: 'var(--text-h2)', lineHeight: 'var(--leading-tight)', letterSpacing: 'var(--tracking-tightest)', fontWeight: '700', fontFamily: 'var(--font-mono)', color: d.color }}>
          {d.displayValue}
        </div>
      </div>
    );
  }
  return null;
};

export const WaterfallChart = React.memo(({ result }) => {
  if (!result) return null;

  const valBefore = result.portfolioValueBefore || 585.0;
  const valAfter = result.portfolioValueAfter || 541.25;
  const assetClassPnl = result.assetClassPnl || {
    BOND: -18.5,
    LOAN: -8.25,
    EQUITY: -9.0,
    DERIVATIVE: -8.0,
  };

  const data = [
    {
      name: 'Initial Value',
      displayValue: `$${valBefore.toFixed(1)}M`,
      type: 'baseline',
      pnl: valBefore,
      base: 0,
      val: valBefore,
      color: '#2563eb', // Electric Blue baseline
    },
    {
      name: 'Bonds PnL',
      displayValue: `${assetClassPnl.BOND >= 0 ? '+' : ''}${(assetClassPnl.BOND || 0).toFixed(1)}M`,
      type: 'shock',
      pnl: assetClassPnl.BOND || 0,
      base: valBefore + Math.min(0, assetClassPnl.BOND || 0),
      val: Math.abs(assetClassPnl.BOND || 0),
      color: (assetClassPnl.BOND || 0) >= 0 ? '#10b981' : '#ef4444',
    },
    {
      name: 'Loans PnL',
      displayValue: `${assetClassPnl.LOAN >= 0 ? '+' : ''}${(assetClassPnl.LOAN || 0).toFixed(1)}M`,
      type: 'shock',
      pnl: assetClassPnl.LOAN || 0,
      base: valBefore + (assetClassPnl.BOND || 0) + Math.min(0, assetClassPnl.LOAN || 0),
      val: Math.abs(assetClassPnl.LOAN || 0),
      color: (assetClassPnl.LOAN || 0) >= 0 ? '#10b981' : '#f97316',
    },
    {
      name: 'Equities PnL',
      displayValue: `${assetClassPnl.EQUITY >= 0 ? '+' : ''}${(assetClassPnl.EQUITY || 0).toFixed(1)}M`,
      type: 'shock',
      pnl: assetClassPnl.EQUITY || 0,
      base: valBefore + (assetClassPnl.BOND || 0) + (assetClassPnl.LOAN || 0) + Math.min(0, assetClassPnl.EQUITY || 0),
      val: Math.abs(assetClassPnl.EQUITY || 0),
      color: (assetClassPnl.EQUITY || 0) >= 0 ? '#10b981' : '#f59e0b',
    },
    {
      name: 'Derivatives PnL',
      displayValue: `${assetClassPnl.DERIVATIVE >= 0 ? '+' : ''}${(assetClassPnl.DERIVATIVE || 0).toFixed(1)}M`,
      type: 'shock',
      pnl: assetClassPnl.DERIVATIVE || 0,
      base: valAfter,
      val: Math.abs(assetClassPnl.DERIVATIVE || 0),
      color: (assetClassPnl.DERIVATIVE || 0) >= 0 ? '#10b981' : '#0284c7', // Cyan instead of purple
    },
    {
      name: 'Stressed Value',
      displayValue: `$${valAfter.toFixed(1)}M`,
      type: 'stressed',
      pnl: valAfter,
      base: 0,
      val: valAfter,
      color: '#0284c7',
    },
  ];

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 15, right: 15, left: 5, bottom: 15 }}>
          <CartesianGrid strokeDasharray="2 2" stroke="#242731" vertical={false} />
          <XAxis
            dataKey="name"
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
            tickFormatter={(v) => `$${v}M`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="base" stackId="a" fill="transparent" />
          <Bar dataKey="val" stackId="a" radius={[3, 3, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
});

WaterfallChart.displayName = 'WaterfallChart';
