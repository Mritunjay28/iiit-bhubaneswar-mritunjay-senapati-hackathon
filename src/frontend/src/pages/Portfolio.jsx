import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PieChart as PieIcon,
  Layers,
  RotateCcw,
  Search,
  Briefcase,
  Zap,
  X,
} from 'lucide-react';
import { RiskEngineApi } from '../services/api';
import { AllocationDonut } from '../components/charts/AllocationDonut';
import { AssetBadge } from '../components/common/Badge';
import { Loader } from '../components/common/Loader';

const SECTOR_BAR_COLORS = [
  '#2563eb', // Blue
  '#10b981', // Green
  '#f59e0b', // Amber
  '#0284c7', // Cyan
  '#059669', // Darker emerald
  '#d97706', // Darker amber
  '#38bdf8', // Sky blue
];

export const Portfolio = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [assets, setAssets] = useState([]);
  const [summary, setSummary] = useState(null);
  const [activeType, setActiveType] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [donutMode, setDonutMode] = useState('assetType'); // 'assetType' | 'sector'
  const [resetting, setResetting] = useState(false);

  const loadData = async () => {
    try {
      const [assetsData, summaryData] = await Promise.all([
        RiskEngineApi.getPortfolio(),
        RiskEngineApi.getPortfolioSummary(),
      ]);
      setAssets(assetsData || []);
      setSummary(summaryData || {});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const handleRefresh = () => loadData();
    window.addEventListener('riskengine:refresh', handleRefresh);
    return () => window.removeEventListener('riskengine:refresh', handleRefresh);
  }, []);

  const handleReset = async () => {
    setResetting(true);
    try {
      const defaultAssets = await RiskEngineApi.resetPortfolio();
      setAssets(defaultAssets);
      const summaryData = await RiskEngineApi.getPortfolioSummary();
      setSummary(summaryData);
    } finally {
      setResetting(false);
    }
  };

  if (loading) {
    return <Loader message="Analyzing multi-asset portfolio exposures, duration profiles, and credit spreads..." />;
  }

  const filteredAssets = assets.filter(a => {
    const matchesType = activeType === 'ALL' || a.assetType === activeType;
    const matchesQuery = a.assetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         a.sector.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesQuery;
  });

  const assetTypeChartData = summary?.notionalByType
    ? Object.entries(summary.notionalByType).map(([name, value]) => ({ name, value }))
    : [
        { name: 'BOND', value: 220.0 },
        { name: 'DERIVATIVE', value: 180.0 },
        { name: 'LOAN', value: 110.0 },
        { name: 'EQUITY', value: 75.0 },
      ];

  const sectorChartData = summary?.notionalBySector
    ? Object.entries(summary.notionalBySector).map(([name, value]) => ({ name, value }))
    : [
        { name: 'Government', value: 145.0 },
        { name: 'Banking', value: 140.0 },
        { name: 'Index', value: 75.0 },
        { name: 'Technology', value: 63.0 },
        { name: 'EM Sovereign', value: 45.0 },
        { name: 'FX', value: 40.0 },
        { name: 'Commodity', value: 35.0 },
      ];

  const totalNotional = summary?.totalNotional || 585.0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Portfolio Top Bar with Reset Action & The ONE CTA */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: 'var(--text-h1)', lineHeight: 'var(--leading-snug)', letterSpacing: 'var(--tracking-tighter)', fontWeight: '800', color: '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-display)' }}>
            <span style={{
              width: '26px',
              height: '26px',
              borderRadius: '4px',
              backgroundColor: '#10b981',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Briefcase size={15} color="#ffffff" />
            </span>
            Multi-Asset Benchmark Portfolio
          </h2>
          <p style={{ fontSize: 'var(--text-caption)', lineHeight: 'var(--leading-relaxed)', letterSpacing: 'var(--tracking-normal)', color: 'var(--text-secondary)', margin: '0.2rem 0 0 0' }}>
            15 institutional positions across sovereign bonds, corporate loans, equity indices, and derivatives
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <button
            onClick={handleReset}
            disabled={resetting}
            className="btn btn-outline"
            style={{ fontSize: 'var(--text-body-sm)', padding: '0.45rem 0.8rem' }}
          >
            <RotateCcw size={13} className={resetting ? 'spin-icon' : ''} />
            <span>{resetting ? 'Resetting...' : 'Reset Default'}</span>
          </button>

          {/* The ONE Repeated CTA */}
          <button
            onClick={() => navigate('/stress-test')}
            className="btn btn-cta"
            style={{ fontSize: 'var(--text-body-sm)', padding: '0.45rem 0.95rem' }}
          >
            <Zap size={14} />
            <span>Simulate Shock</span>
          </button>
        </div>
      </div>

      {/* KPI Exposure Metric Cards (Modeled after Ref 3 Xero & Ref 4 Cash Balance) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
        }}
      >
        <div className="institutional-card scroll-reveal reveal-delay-1" style={{ padding: '1.15rem', borderLeft: '3px solid #2563eb' }}>
          <div style={{ fontSize: 'var(--text-overline)', lineHeight: 'var(--leading-none)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-widest)', fontWeight: '700' }}>
            Total Portfolio Notional
          </div>
          <div style={{ fontSize: 'var(--text-display-lg)', lineHeight: 'var(--leading-tight)', letterSpacing: 'var(--tracking-tightest)', fontWeight: '900', fontFamily: 'var(--font-mono)', color: '#ffffff', marginTop: '0.2rem' }}>
            ${totalNotional.toFixed(1)}M
          </div>
          <div style={{ fontSize: 'var(--text-caption)', lineHeight: 'var(--leading-snug)', letterSpacing: 'var(--tracking-normal)', color: '#93c5fd', marginTop: '0.15rem' }}>
            15 institutional positions
          </div>
        </div>

        <div className="institutional-card scroll-reveal reveal-delay-2" style={{ padding: '1.15rem', borderLeft: '3px solid #3b82f6' }}>
          <div style={{ fontSize: 'var(--text-overline)', lineHeight: 'var(--leading-none)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-widest)', fontWeight: '700' }}>
            Fixed Income Allocation
          </div>
          <div style={{ fontSize: 'var(--text-display-lg)', lineHeight: 'var(--leading-tight)', letterSpacing: 'var(--tracking-tightest)', fontWeight: '900', fontFamily: 'var(--font-mono)', color: '#bfdbfe', marginTop: '0.2rem' }}>
            $220.0M
          </div>
          <div style={{ fontSize: 'var(--text-caption)', lineHeight: 'var(--leading-snug)', letterSpacing: 'var(--tracking-normal)', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
            Govt & corporate duration
          </div>
        </div>

        <div className="institutional-card scroll-reveal reveal-delay-3" style={{ padding: '1.15rem', borderLeft: '3px solid #10b981' }}>
          <div style={{ fontSize: 'var(--text-overline)', lineHeight: 'var(--leading-none)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-widest)', fontWeight: '700' }}>
            Corporate & EM Loans
          </div>
          <div style={{ fontSize: 'var(--text-display-lg)', lineHeight: 'var(--leading-tight)', letterSpacing: 'var(--tracking-tightest)', fontWeight: '900', fontFamily: 'var(--font-mono)', color: '#6ee7b7', marginTop: '0.2rem' }}>
            $110.0M
          </div>
          <div style={{ fontSize: 'var(--text-caption)', lineHeight: 'var(--leading-snug)', letterSpacing: 'var(--tracking-normal)', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
            Subject to spread widening
          </div>
        </div>

        <div className="institutional-card scroll-reveal reveal-delay-4" style={{ padding: '1.15rem', borderLeft: '3px solid #0284c7' }}>
          <div style={{ fontSize: 'var(--text-overline)', lineHeight: 'var(--leading-none)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-widest)', fontWeight: '700' }}>
            Derivatives & Equity
          </div>
          <div style={{ fontSize: 'var(--text-display-lg)', lineHeight: 'var(--leading-tight)', letterSpacing: 'var(--tracking-tightest)', fontWeight: '900', fontFamily: 'var(--font-mono)', color: '#7dd3fc', marginTop: '0.2rem' }}>
            $255.0M
          </div>
          <div style={{ fontSize: 'var(--text-caption)', lineHeight: 'var(--leading-snug)', letterSpacing: 'var(--tracking-normal)', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
            Convexity & beta sensitivity
          </div>
        </div>
      </div>

      {/* Allocation Donut & Sector Concentration */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.35fr)',
          gap: '1.5rem',
        }}
      >
        {/* Allocation Donut Card */}
        <div className="institutional-card scroll-reveal" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <PieIcon size={17} color="#2563eb" />
              <h3 style={{ fontSize: 'var(--text-h3)', lineHeight: 'var(--leading-snug)', letterSpacing: 'var(--tracking-tight)', fontWeight: '700', color: '#ffffff', margin: 0 }}>
                Allocation Distribution
              </h3>
            </div>

            <div style={{ display: 'flex', gap: '0.35rem' }}>
              <button
                onClick={() => setDonutMode('assetType')}
                className={`tab-btn ${donutMode === 'assetType' ? 'active' : ''}`}
                style={{ padding: '0.25rem 0.6rem', fontSize: 'var(--text-caption)' }}
              >
                Asset Class
              </button>
              <button
                onClick={() => setDonutMode('sector')}
                className={`tab-btn ${donutMode === 'sector' ? 'active' : ''}`}
                style={{ padding: '0.25rem 0.6rem', fontSize: 'var(--text-caption)' }}
              >
                By Sector
              </button>
            </div>
          </div>

          <AllocationDonut
            data={donutMode === 'assetType' ? assetTypeChartData : sectorChartData}
            mode={donutMode}
          />
        </div>

        {/* Sector Concentration Overview (Modeled after Ref 3 Xero Expenses & Ref 2 Klips MRR) */}
        <div className="institutional-card scroll-reveal" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Layers size={17} color="#0284c7" />
            <h3 style={{ fontSize: 'var(--text-h3)', lineHeight: 'var(--leading-snug)', letterSpacing: 'var(--tracking-tight)', fontWeight: '700', color: '#ffffff', margin: 0 }}>
              Sector Concentration & Duration Profiles
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', overflowY: 'auto', maxHeight: '250px', paddingRight: '0.25rem' }}>
            {sectorChartData.map((item, index) => {
              const pct = ((item.value / totalNotional) * 100).toFixed(1);
              const barColor = SECTOR_BAR_COLORS[index % SECTOR_BAR_COLORS.length];
              return (
                <div key={item.name} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-caption)', lineHeight: 'var(--leading-snug)' }}>
                    <span style={{ color: '#ffffff', fontWeight: '600' }}>{item.name}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                      ${item.value.toFixed(1)}M <span style={{ color: '#38bdf8', fontWeight: '700' }}>({pct}%)</span>
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '5px', backgroundColor: '#242731', borderRadius: '3px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${pct}%`,
                        height: '100%',
                        backgroundColor: barColor,
                        borderRadius: '3px',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Holdings Table with Filter Controls (Ref 1 Taskos style) */}
      <div className="institutional-card scroll-reveal" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          {/* Asset Type Filter Tabs with Count Pills */}
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {[
              { type: 'ALL', label: 'All Holdings', count: assets.length },
              { type: 'BOND', label: 'Bonds', count: assets.filter(a => a.assetType === 'BOND').length },
              { type: 'LOAN', label: 'Loans', count: assets.filter(a => a.assetType === 'LOAN').length },
              { type: 'DERIVATIVE', label: 'Derivatives', count: assets.filter(a => a.assetType === 'DERIVATIVE').length },
              { type: 'EQUITY', label: 'Equities', count: assets.filter(a => a.assetType === 'EQUITY').length },
            ].map(item => (
              <button
                key={item.type}
                onClick={() => setActiveType(item.type)}
                className={`filter-chip ${activeType === item.type ? 'active' : ''}`}
              >
                <span>{item.label}</span>
                <span style={{
                  padding: '0.1rem 0.35rem',
                  borderRadius: '3px',
                  fontSize: 'var(--text-micro)',
                  lineHeight: 'var(--leading-none)',
                  letterSpacing: 'var(--tracking-wide)',
                  fontFamily: 'var(--font-mono)',
                  backgroundColor: activeType === item.type ? '#1d4ed8' : '#242731',
                  color: activeType === item.type ? '#ffffff' : 'var(--text-secondary)',
                }}>
                  {item.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative', width: '250px' }}>
            <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search asset or sector..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-control"
              style={{ paddingLeft: '2.1rem' }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Holdings Table */}
        <div style={{ overflowX: 'auto' }}>
          <table className="fintech-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Asset Name</th>
                <th>Class</th>
                <th>Sector</th>
                <th style={{ textAlign: 'right' }}>Notional ($M)</th>
                <th style={{ textAlign: 'right' }}>Coupon / Rate</th>
                <th style={{ textAlign: 'right' }}>Duration (Yrs)</th>
                <th style={{ textAlign: 'center' }}>Currency</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssets.map((asset, index) => (
                <tr key={asset.id || index}>
                  <td style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    #{asset.id}
                  </td>
                  <td style={{ fontWeight: '700', color: '#ffffff' }}>
                    {asset.assetName}
                  </td>
                  <td>
                    <AssetBadge type={asset.assetType} />
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>
                    {asset.sector}
                  </td>
                  <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: '800', color: '#ffffff' }}>
                    ${asset.notionalValue.toFixed(1)}M
                  </td>
                  <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                    {asset.interestRate ? `${asset.interestRate.toFixed(2)}%` : '—'}
                  </td>
                  <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: '700', color: asset.duration ? '#0284c7' : 'var(--text-muted)' }}>
                    {asset.duration ? `${asset.duration.toFixed(1)}y` : '—'}
                  </td>
                  <td style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-micro)', lineHeight: 'var(--leading-none)', letterSpacing: 'var(--tracking-wide)', color: '#93c5fd' }}>
                    {asset.currency || 'USD'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
