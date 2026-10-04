import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  PieChart as PieIcon,
  Layers,
  RotateCcw,
  Search,
  Filter,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
} from 'lucide-react';
import { RiskEngineApi } from '../services/api';
import { AllocationDonut } from '../components/charts/AllocationDonut';
import { Loader } from '../components/common/Loader';

export const Portfolio = () => {
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
    return <Loader message="Analyzing synthetic multi-asset portfolio and exposures..." />;
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Portfolio Top Bar with Reset Action */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#ffffff', margin: 0 }}>
            Synthetic Multi-Asset Benchmark Portfolio
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.15rem 0 0 0' }}>
            $585.0M Total Notional configured with fixed income duration, loan spreads, and derivatives
          </p>
        </div>

        <button
          onClick={handleReset}
          disabled={resetting}
          className="btn btn-outline"
        >
          <RotateCcw size={14} className={resetting ? 'pulse-indicator' : ''} />
          <span>{resetting ? 'Resetting...' : 'Reset Default Portfolio'}</span>
        </button>
      </div>

      {/* Top Allocation & Metrics Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.4fr)',
          gap: '1.5rem',
        }}
      >
        {/* Allocation Donut Card */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <PieIcon size={18} color="#6366f1" />
              <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#ffffff', margin: 0 }}>
                Allocation Distribution
              </h3>
            </div>

            <div style={{ display: 'flex', gap: '0.35rem' }}>
              <button
                onClick={() => setDonutMode('assetType')}
                style={{
                  padding: '0.25rem 0.55rem',
                  borderRadius: '5px',
                  fontSize: '0.725rem',
                  fontWeight: '600',
                  backgroundColor: donutMode === 'assetType' ? 'rgba(99, 102, 241, 0.25)' : 'transparent',
                  color: donutMode === 'assetType' ? '#a5b4fc' : 'var(--text-secondary)',
                  border: donutMode === 'assetType' ? '1px solid rgba(99, 102, 241, 0.5)' : '1px solid transparent',
                  cursor: 'pointer',
                }}
              >
                By Asset Class
              </button>
              <button
                onClick={() => setDonutMode('sector')}
                style={{
                  padding: '0.25rem 0.55rem',
                  borderRadius: '5px',
                  fontSize: '0.725rem',
                  fontWeight: '600',
                  backgroundColor: donutMode === 'sector' ? 'rgba(99, 102, 241, 0.25)' : 'transparent',
                  color: donutMode === 'sector' ? '#a5b4fc' : 'var(--text-secondary)',
                  border: donutMode === 'sector' ? '1px solid rgba(99, 102, 241, 0.5)' : '1px solid transparent',
                  cursor: 'pointer',
                }}
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

        {/* Sector Concentration Overview */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Layers size={18} color="#06b6d4" />
            <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#ffffff', margin: 0 }}>
              Sector Concentration & Duration Profile
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', overflowY: 'auto', maxHeight: '240px' }}>
            {sectorChartData.map(item => {
              const pct = ((item.value / 585.0) * 100).toFixed(1);
              return (
                <div key={item.name} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.775rem' }}>
                    <span style={{ color: '#ffffff', fontWeight: '500' }}>{item.name}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                      ${item.value.toFixed(1)}M ({pct}%)
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '6px', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${pct}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #6366f1, #06b6d4)',
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

      {/* Holdings Table with Filter Controls */}
      <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          {/* Asset Type Filter Tabs */}
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {['ALL', 'BOND', 'LOAN', 'DERIVATIVE', 'EQUITY'].map(type => (
              <button
                key={type}
                onClick={() => setActiveType(type)}
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: activeType === type ? '600' : '500',
                  backgroundColor: activeType === type ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                  color: activeType === type ? '#a5b4fc' : 'var(--text-secondary)',
                  border: activeType === type ? '1px solid rgba(99, 102, 241, 0.5)' : '1px solid transparent',
                  cursor: 'pointer',
                }}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative', width: '260px' }}>
            <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search asset or sector..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-control"
              style={{ paddingLeft: '2.2rem' }}
            />
          </div>
        </div>

        {/* Holdings Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-medium)', textAlign: 'left', color: 'var(--text-muted)' }}>
                <th style={{ padding: '0.75rem 1rem' }}>#</th>
                <th style={{ padding: '0.75rem 1rem' }}>Asset Name</th>
                <th style={{ padding: '0.75rem 1rem' }}>Asset Class</th>
                <th style={{ padding: '0.75rem 1rem' }}>Sector</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Notional ($M)</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Interest Rate</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Duration (Yrs)</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Currency</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssets.map((asset, index) => (
                <tr
                  key={asset.id}
                  style={{
                    borderBottom: '1px solid var(--border-subtle)',
                    backgroundColor: index % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent',
                  }}
                >
                  <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {asset.id}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: '600', color: '#ffffff' }}>
                    {asset.assetName}
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span
                      style={{
                        padding: '0.15rem 0.45rem',
                        borderRadius: '4px',
                        fontSize: '0.7rem',
                        fontFamily: 'var(--font-mono)',
                        backgroundColor:
                          asset.assetType === 'BOND' ? 'rgba(59, 130, 246, 0.15)' :
                          asset.assetType === 'LOAN' ? 'rgba(16, 185, 129, 0.15)' :
                          asset.assetType === 'EQUITY' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(168, 85, 247, 0.15)',
                        color:
                          asset.assetType === 'BOND' ? '#93c5fd' :
                          asset.assetType === 'LOAN' ? '#6ee7b7' :
                          asset.assetType === 'EQUITY' ? '#fde68a' : '#d8b4fe',
                      }}
                    >
                      {asset.assetType}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>
                    {asset.sector}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: '700', color: '#ffffff' }}>
                    ${asset.notionalValue.toFixed(1)}M
                  </td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                    {asset.interestRate ? `${asset.interestRate.toFixed(1)}%` : '—'}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontFamily: 'var(--font-mono)', color: asset.duration ? '#38bdf8' : 'var(--text-muted)' }}>
                    {asset.duration ? `${asset.duration.toFixed(1)}` : '—'}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
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
