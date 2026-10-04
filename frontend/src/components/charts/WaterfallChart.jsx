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
  ReferenceLine,
} from 'recharts';

export const WaterfallChart = ({ result }) => {
  if (!result) return null;

  const valBefore = result.portfolioValueBefore || 585.0;
  const valAfter = result.portfolioValueAfter || 541.25;
  const assetClassPnl = result.assetClassPnl || {
    BOND: -18.5,
    LOAN: -8.25,
    EQUITY: -9.0,
    DERIVATIVE: -8.0,
  };

  // Construct waterfall bars: base (invisible spacer) + impact bar
  // Initial Portfolio Value starts at 0 to valBefore
  // Then each asset class subtracts or adds
  // Final Portfolio Value shows the remaining balance
  const data = [
    {
      name: 'Initial Value',
      displayValue: `$${valBefore.toFixed(1)}M`,
      type: 'baseline',
      pnl: valBefore,
      base: 0,
      val: valBefore,
      color: '#6366f1',
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
      color: (assetClassPnl.EQUITY || 0) >= 0 ? '#10b981' : '#eab308',
    },
    {
      name: 'Derivatives PnL',
      displayValue: `${assetClassPnl.DERIVATIVE >= 0 ? '+' : ''}${(assetClassPnl.DERIVATIVE || 0).toFixed(1)}M`,
      type: 'shock',
      pnl: assetClassPnl.DERIVATIVE || 0,
      base: valAfter,
      val: Math.abs(assetClassPnl.DERIVATIVE || 0),
      color: (assetClassPnl.DERIVATIVE || 0) >= 0 ? '#10b981' : '#a855f7',
    },
    {
      name: 'Stressed Value',
      displayValue: `$${valAfter.toFixed(1)}M`,
      type: 'stressed',
      pnl: valAfter,
      base: 0,
      val: valAfter,
      color: '#06b6d4',
    },
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
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
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>{d.name}</div>
          <div style={{ fontSize: '1rem', fontWeight: '700', fontFamily: 'var(--font-mono)', color: d.color }}>
            {d.displayValue}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ width: '100%', height: 320 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 20, left: 10, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
          <XAxis
            dataKey="name"
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
            tickFormatter={(v) => `$${v}M`}
          />
          <Tooltip content={<CustomTooltip />} />
          {/* Transparent bottom spacer to make waterfall effect */}
          <Bar dataKey="base" stackId="a" fill="transparent" />
          <Bar dataKey="val" stackId="a" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
