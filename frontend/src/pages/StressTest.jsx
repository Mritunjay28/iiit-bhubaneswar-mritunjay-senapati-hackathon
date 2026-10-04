import React, { useState, useEffect } from 'react';
import {
  Zap,
  BarChart2,
  Table,
  Layers,
} from 'lucide-react';
import { RiskEngineApi } from '../services/api';
import { WaterfallChart } from '../components/charts/WaterfallChart';
import { AssetImpactBar } from '../components/charts/AssetImpactBar';
import { Loader } from '../components/common/Loader';
import { EventBadge } from '../components/common/Badge';

export const StressTest = () => {
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);
  const [scenarios, setScenarios] = useState([]);
  const [selectedScenario, setSelectedScenario] = useState('GEOPOLITICAL');
  const [customShocks, setCustomShocks] = useState({
    equityShock: -0.12,
    interestRateShock: 0.0050,
    creditSpreadShock: 150.0,
    fxShock: -0.05,
    commodityShock: 0.15,
  });
  const [activeTab, setActiveTab] = useState('waterfall'); // 'waterfall' | 'bars' | 'table'
  const [result, setResult] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        const scenarioList = await RiskEngineApi.getScenarios();
        setScenarios(scenarioList || []);
        // Run initial default geopolitical stress test
        const initialResult = await RiskEngineApi.runStressTest({ eventType: 'GEOPOLITICAL' });
        setResult(initialResult);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const handleScenarioChange = (e) => {
    const eventType = e.target.value;
    setSelectedScenario(eventType);
    const scen = scenarios.find(s => s.eventType === eventType);
    if (scen) {
      setCustomShocks({
        equityShock: scen.equityShock,
        interestRateShock: scen.interestRateShock,
        creditSpreadShock: scen.creditSpreadShock,
        fxShock: scen.fxShock,
        commodityShock: scen.commodityShock,
      });
    }
  };

  const handleRunTest = async () => {
    setExecuting(true);
    try {
      const payload = {
        eventType: selectedScenario,
        ...customShocks,
      };
      const res = await RiskEngineApi.runStressTest(payload);
      setResult(res);
    } finally {
      setExecuting(false);
    }
  };

  if (loading) {
    return <Loader message="Loading shock scenarios and initializing stress testing engine..." />;
  }

  const isLoss = (result?.totalPnlImpact || 0) < 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Top Configuration & Control Section */}
      <div
        className="glass-panel"
        style={{
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: 'rgba(99, 102, 241, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#6366f1',
              }}
            >
              <Zap size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#ffffff', margin: 0 }}>
                Strategic Shock Scenario Configurator
              </h2>
              <p style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', margin: '0.15rem 0 0 0' }}>
                Select a predefined hackathon shock event or tune risk factor sensitivities
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <select
              value={selectedScenario}
              onChange={handleScenarioChange}
              className="input-control"
              style={{ width: '240px', fontWeight: '600' }}
            >
              {scenarios.map(s => (
                <option key={s.eventType} value={s.eventType}>
                  {s.scenarioName} ({s.eventType})
                </option>
              ))}
            </select>

            <button
              onClick={handleRunTest}
              disabled={executing}
              className="btn btn-primary"
              style={{ minWidth: '170px' }}
            >
              <Zap size={16} />
              <span>{executing ? 'Executing Shock...' : 'Execute Stress Test'}</span>
            </button>
          </div>
        </div>

        {/* Shock Factor Controls Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            paddingTop: '0.75rem',
            borderTop: '1px solid var(--border-subtle)',
          }}
        >
          {/* Equity Shock */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              <span>Equity Shock</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: '700', color: '#f87171' }}>
                {(customShocks.equityShock * 100).toFixed(1)}%
              </span>
            </div>
            <input
              type="range"
              min="-30"
              max="15"
              step="1"
              value={Math.round(customShocks.equityShock * 100)}
              onChange={(e) => setCustomShocks({ ...customShocks, equityShock: parseFloat(e.target.value) / 100 })}
              style={{ accentColor: '#ef4444', width: '100%', cursor: 'pointer' }}
            />
          </div>

          {/* Interest Rate Shock */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              <span>Interest Rate Δ</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: '700', color: '#38bdf8' }}>
                +{(customShocks.interestRateShock * 10000).toFixed(0)} bps
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="350"
              step="25"
              value={Math.round(customShocks.interestRateShock * 10000)}
              onChange={(e) => setCustomShocks({ ...customShocks, interestRateShock: parseFloat(e.target.value) / 10000 })}
              style={{ accentColor: '#06b6d4', width: '100%', cursor: 'pointer' }}
            />
          </div>

          {/* Credit Spread Shock */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              <span>Credit Spread Δ</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: '700', color: '#fb923c' }}>
                +{customShocks.creditSpreadShock.toFixed(0)} bps
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="400"
              step="25"
              value={customShocks.creditSpreadShock}
              onChange={(e) => setCustomShocks({ ...customShocks, creditSpreadShock: parseFloat(e.target.value) })}
              style={{ accentColor: '#f97316', width: '100%', cursor: 'pointer' }}
            />
          </div>

          {/* Commodity Shock */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              <span>Commodity Shock</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: '700', color: customShocks.commodityShock >= 0 ? '#34d399' : '#f87171' }}>
                {customShocks.commodityShock >= 0 ? '+' : ''}{(customShocks.commodityShock * 100).toFixed(1)}%
              </span>
            </div>
            <input
              type="range"
              min="-25"
              max="35"
              step="5"
              value={Math.round(customShocks.commodityShock * 100)}
              onChange={(e) => setCustomShocks({ ...customShocks, commodityShock: parseFloat(e.target.value) / 100 })}
              style={{ accentColor: '#10b981', width: '100%', cursor: 'pointer' }}
            />
          </div>
        </div>
      </div>

      {/* Stress Test Executive Output Banner */}
      {result && (
        <div
          className="glass-panel"
          style={{
            padding: '1.5rem',
            background: 'linear-gradient(135deg, rgba(20, 30, 51, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: '1.25rem',
          }}
        >
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Simulated Scenario
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#ffffff', marginTop: '0.25rem' }}>
              {result.scenarioName}
            </div>
            <div style={{ marginTop: '0.35rem' }}>
              <EventBadge type={result.eventType} />
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Total Portfolio Loss
            </div>
            <div
              style={{
                fontSize: '1.55rem',
                fontWeight: '800',
                fontFamily: 'var(--font-mono)',
                color: isLoss ? '#ef4444' : '#10b981',
                marginTop: '0.2rem',
              }}
            >
              {isLoss ? '-' : '+'}${Math.abs(result.totalPnlImpact).toFixed(2)}M
            </div>
            <div style={{ fontSize: '0.775rem', fontFamily: 'var(--font-mono)', color: isLoss ? '#f87171' : '#34d399' }}>
              {result.percentageChange >= 0 ? '+' : ''}{result.percentageChange.toFixed(2)}% of Notional
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Portfolio Value Impact
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.25rem' }}>
              <span style={{ fontSize: '1.1rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', textDecoration: 'line-through' }}>
                ${result.portfolioValueBefore.toFixed(1)}M
              </span>
              <span style={{ fontSize: '1.35rem', fontFamily: 'var(--font-mono)', fontWeight: '700', color: '#38bdf8' }}>
                → ${result.portfolioValueAfter.toFixed(1)}M
              </span>
            </div>
            <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
              15 assets stressed
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Worst Hit Asset
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: '700', color: '#ffffff', marginTop: '0.25rem' }}>
              {result.worstHitAsset || 'US Treasury 10Y'}
            </div>
            <div style={{ fontSize: '0.775rem', fontFamily: 'var(--font-mono)', color: '#f87171' }}>
              -${Math.abs(result.worstHitAssetPnl || 18.5).toFixed(2)}M PnL
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Parametric VaR (95% / 99%)
            </div>
            <div style={{ fontSize: '1.15rem', fontFamily: 'var(--font-mono)', fontWeight: '700', color: '#fb923c', marginTop: '0.25rem' }}>
              ${(result.valueAtRisk95 || 37.2).toFixed(1)}M / ${(result.valueAtRisk99 || 54.7).toFixed(1)}M
            </div>
            <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
              1-day horizon loss
            </div>
          </div>
        </div>
      )}

      {/* Visualizations & Data Exploration Panel */}
      <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={() => setActiveTab('waterfall')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 0.85rem',
                borderRadius: '6px',
                fontSize: '0.825rem',
                fontWeight: activeTab === 'waterfall' ? '600' : '500',
                backgroundColor: activeTab === 'waterfall' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                color: activeTab === 'waterfall' ? '#ffffff' : 'var(--text-secondary)',
                border: activeTab === 'waterfall' ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid transparent',
                cursor: 'pointer',
              }}
            >
              <BarChart2 size={16} />
              <span>PnL Waterfall Attribution</span>
            </button>

            <button
              onClick={() => setActiveTab('bars')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 0.85rem',
                borderRadius: '6px',
                fontSize: '0.825rem',
                fontWeight: activeTab === 'bars' ? '600' : '500',
                backgroundColor: activeTab === 'bars' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                color: activeTab === 'bars' ? '#ffffff' : 'var(--text-secondary)',
                border: activeTab === 'bars' ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid transparent',
                cursor: 'pointer',
              }}
            >
              <Layers size={16} />
              <span>Asset Shock Comparison</span>
            </button>

            <button
              onClick={() => setActiveTab('table')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 0.85rem',
                borderRadius: '6px',
                fontSize: '0.825rem',
                fontWeight: activeTab === 'table' ? '600' : '500',
                backgroundColor: activeTab === 'table' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                color: activeTab === 'table' ? '#ffffff' : 'var(--text-secondary)',
                border: activeTab === 'table' ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid transparent',
                cursor: 'pointer',
              }}
            >
              <Table size={16} />
              <span>Asset Level Breakdown Table ({result?.assetDetails?.length || 15})</span>
            </button>
          </div>

          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            Executed: {result?.executedAt ? new Date(result.executedAt).toLocaleTimeString() : 'Live'}
          </span>
        </div>

        {/* Tab Content Display */}
        {activeTab === 'waterfall' && (
          <div>
            <div style={{ marginBottom: '0.75rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Flow shows baseline notional ($585.0M) eroded by bond duration shifts, credit spread widenings, equity beta draws, and derivative revaluations.
            </div>
            <WaterfallChart result={result} />
          </div>
        )}

        {activeTab === 'bars' && (
          <div>
            <div style={{ marginBottom: '0.75rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Before vs. After valuation across key portfolio holdings under the {result?.scenarioName}.
            </div>
            <AssetImpactBar assetDetails={result?.assetDetails} />
          </div>
        )}

        {activeTab === 'table' && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.825rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-medium)', textAlign: 'left', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Asset Name</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Class</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Sector</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Before ($M)</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Shock %</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>After ($M)</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Net PnL ($M)</th>
                </tr>
              </thead>
              <tbody>
                {result?.assetDetails?.map((asset, idx) => {
                  const loss = asset.pnlImpact < 0;
                  return (
                    <tr
                      key={asset.assetId || idx}
                      style={{
                        borderBottom: '1px solid var(--border-subtle)',
                        backgroundColor: idx % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent',
                      }}
                    >
                      <td style={{ padding: '0.75rem 1rem', fontWeight: '600', color: '#ffffff' }}>
                        {asset.assetName}
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span
                          style={{
                            padding: '0.15rem 0.4rem',
                            borderRadius: '4px',
                            fontSize: '0.7rem',
                            fontFamily: 'var(--font-mono)',
                            backgroundColor: 'rgba(255,255,255,0.06)',
                            color: 'var(--text-secondary)',
                          }}
                        >
                          {asset.assetType}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>
                        {asset.sector}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                        ${asset.valueBefore.toFixed(2)}M
                      </td>
                      <td
                        style={{
                          padding: '0.75rem 1rem',
                          textAlign: 'right',
                          fontFamily: 'var(--font-mono)',
                          color: asset.shockAppliedPercent >= 0 ? '#34d399' : '#f87171',
                        }}
                      >
                        {asset.shockAppliedPercent >= 0 ? '+' : ''}{asset.shockAppliedPercent.toFixed(2)}%
                      </td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontFamily: 'var(--font-mono)', color: '#38bdf8' }}>
                        ${asset.valueAfter.toFixed(2)}M
                      </td>
                      <td
                        style={{
                          padding: '0.75rem 1rem',
                          textAlign: 'right',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: '700',
                          color: loss ? '#ef4444' : '#10b981',
                        }}
                      >
                        {asset.pnlImpact >= 0 ? '+' : ''}${asset.pnlImpact.toFixed(2)}M
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
