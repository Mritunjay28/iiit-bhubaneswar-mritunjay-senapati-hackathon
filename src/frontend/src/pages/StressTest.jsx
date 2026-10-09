import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Zap,
  BarChart2,
  Table,
  Layers,
  RotateCcw,
  Sliders,
  Activity,
} from 'lucide-react';
import { RiskEngineApi } from '../services/api';
import { WaterfallChart } from '../components/charts/WaterfallChart';
import { AssetImpactBar } from '../components/charts/AssetImpactBar';
import { Loader, Spinner } from '../components/common/Loader';
import { EventBadge, AssetBadge } from '../components/common/Badge';

export const StressTest = () => {
  const location = useLocation();
  const targetSignal = location.state?.signal;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [executing, setExecuting] = useState(false);
  const [scenarios, setScenarios] = useState([]);
  const [selectedScenario, setSelectedScenario] = useState('GEOPOLITICAL');
  const [customShocks, setCustomShocks] = useState({
    equityShock: -0.12,
    interestRateShock: 0.0050,
    creditSpreadShock: 150.0,
    creditSpreadShockBps: 150.0,
    fxShock: -0.05,
    commodityShock: 0.15,
  });
  const [activeTab, setActiveTab] = useState('waterfall'); // 'waterfall' | 'bars' | 'table'
  const [result, setResult] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        setError(null);
        const scenarioList = await RiskEngineApi.getScenarios();
        setScenarios(scenarioList || []);

        let defaultEvent = 'GEOPOLITICAL';
        let defaultScen = scenarioList.find(s => s.eventType === 'GEOPOLITICAL') || scenarioList[0];
        let overrideName = null;

        if (targetSignal) {
          defaultEvent = targetSignal.eventType || 'GEOPOLITICAL';
          defaultScen = scenarioList.find(s => s.eventType === defaultEvent) || scenarioList[0];
          overrideName = `Signal Impact: ${targetSignal.entity || 'Broad Market'}`;
        }
        
        setSelectedScenario(defaultEvent);

        const spread = defaultScen.creditSpreadShock != null
          ? defaultScen.creditSpreadShock
          : (defaultScen.creditSpreadShockBps != null ? defaultScen.creditSpreadShockBps : 150.0);

        setCustomShocks({
          equityShock: defaultScen.equityShock ?? -0.12,
          interestRateShock: defaultScen.interestRateShock ?? 0.005,
          creditSpreadShock: spread,
          creditSpreadShockBps: spread,
          fxShock: defaultScen.fxShock ?? -0.05,
          commodityShock: defaultScen.commodityShock ?? 0.15,
        });

        // Run initial test based on signal or default
        const payload = {
          eventType: defaultEvent,
          scenarioName: overrideName || defaultScen.scenarioName || defaultEvent,
          equityShock: defaultScen.equityShock ?? -0.12,
          interestRateShock: defaultScen.interestRateShock ?? 0.005,
          creditSpreadShock: spread,
          creditSpreadShockBps: spread,
          fxShock: defaultScen.fxShock ?? -0.05,
          commodityShock: defaultScen.commodityShock ?? 0.15,
        };

        if (targetSignal?.id) {
          payload.triggerSignalId = targetSignal.id;
        }

        const initialResult = await RiskEngineApi.runStressTest(payload);
        setResult(initialResult);
      } catch (err) {
        console.error('Failed to initialize stress test:', err);
        setError("Backend unreachable");
      } finally {
        setLoading(false);
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetSignal?.id]);

  const applyScenarioPreset = (eventType) => {
    setSelectedScenario(eventType);
    const scen = scenarios.find(s => s.eventType === eventType);
    if (scen) {
      const spread = scen.creditSpreadShock != null
        ? scen.creditSpreadShock
        : (scen.creditSpreadShockBps != null ? scen.creditSpreadShockBps : 150.0);
      setCustomShocks({
        equityShock: scen.equityShock ?? -0.12,
        interestRateShock: scen.interestRateShock ?? 0.005,
        creditSpreadShock: spread,
        creditSpreadShockBps: spread,
        fxShock: scen.fxShock ?? -0.05,
        commodityShock: scen.commodityShock ?? 0.15,
      });
    }
  };

  const handleScenarioChange = (e) => {
    applyScenarioPreset(e.target.value);
  };

  const handleRunTest = async () => {
    setExecuting(true);
    try {
      const spread = customShocks.creditSpreadShock != null
        ? customShocks.creditSpreadShock
        : (customShocks.creditSpreadShockBps != null ? customShocks.creditSpreadShockBps : 150.0);
      const scen = scenarios.find(s => s.eventType === selectedScenario);
      const payload = {
        eventType: selectedScenario,
        scenarioName: scen?.scenarioName || selectedScenario,
        equityShock: customShocks.equityShock ?? -0.12,
        interestRateShock: customShocks.interestRateShock ?? 0.005,
        creditSpreadShock: spread,
        creditSpreadShockBps: spread,
        fxShock: customShocks.fxShock ?? -0.05,
        commodityShock: customShocks.commodityShock ?? 0.15,
      };
      const res = await RiskEngineApi.runStressTest(payload);
      if (res) {
        setResult(res);
        const isLoss = (res.totalPnlImpact || 0) < 0;
        const impactText = isLoss ? `drawdown of $${Math.abs(res.totalPnlImpact).toFixed(2)}M` : `gain of $${res.totalPnlImpact.toFixed(2)}M`;
        await RiskEngineApi.ingestSignal(
          `Simulated shock: ${res.scenarioName}. Portfolio experienced a ${impactText} (${res.percentageChange}%). Worst hit asset: ${res.worstHitAsset || 'Unknown'}.`,
          'SYSTEM',
          'Portfolio Engine'
        );
        window.dispatchEvent(new CustomEvent('riskengine:refresh'));
      }
    } catch (err) {
      console.error('Failed to run stress test:', err);
      setError("Failed to simulate shock: Backend unreachable");
    } finally {
      setExecuting(false);
    }
  };

  const handleResetToPreset = () => {
    applyScenarioPreset(selectedScenario);
  };

  if (loading) {
    return <Loader message="Initializing quantitative risk engine and loading historical stress scenarios..." />;
  }

  const isLoss = (result?.totalPnlImpact || 0) < 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {error && (
        <div style={{ padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#ef4444', borderRadius: '6px', textAlign: 'center', fontWeight: 'bold' }}>
          {error}
        </div>
      )}
      {/* Top Header & Overview */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: 'var(--text-h1)', lineHeight: 'var(--leading-snug)', letterSpacing: 'var(--tracking-tighter)', fontWeight: '800', color: '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-display)' }}>
            <span style={{
              width: '26px',
              height: '26px',
              borderRadius: '4px',
              backgroundColor: '#2563eb',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Zap size={15} color="#ffffff" />
            </span>
            Module B: Strategic Portfolio Stress Engine
          </h2>
          <p style={{ fontSize: 'var(--text-caption)', lineHeight: 'var(--leading-relaxed)', letterSpacing: 'var(--tracking-normal)', color: 'var(--text-secondary)', margin: '0.2rem 0 0 0' }}>
            Multi-factor macroeconomic shock simulation, parametric VaR, and delta-normal asset valuation
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <button
            onClick={handleResetToPreset}
            className="btn btn-outline"
            title="Reset shock factor sliders to preset baseline"
            style={{ padding: '0.5rem 0.85rem', fontSize: 'var(--text-body-sm)' }}
          >
            <RotateCcw size={14} />
            <span>Reset Sliders</span>
          </button>

          {/* The ONE Repeated CTA */}
          <button
            onClick={handleRunTest}
            disabled={executing}
            className="btn btn-cta"
            style={{ minWidth: '175px' }}
          >
            {executing ? <Spinner size={14} color="#ffffff" /> : <Zap size={15} />}
            <span>{executing ? 'Simulating...' : 'Simulate Shock'}</span>
          </button>
        </div>
      </div>

      {/* Preset Scenario Selector Bar */}
      <div
        className="institutional-card scroll-reveal"
        style={{
          padding: '1.25rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          borderLeft: '4px solid #2563eb',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sliders size={16} color="#3b82f6" />
            <span style={{ fontSize: 'var(--text-body-sm)', lineHeight: 'var(--leading-snug)', letterSpacing: 'var(--tracking-tight)', fontWeight: '700', color: '#ffffff' }}>
              Select Shock Scenario Blueprint:
            </span>
          </div>

          <select
            value={selectedScenario}
            onChange={handleScenarioChange}
            className="input-control"
            style={{ width: '260px', fontWeight: '600' }}
            disabled={scenarios.length === 0}
          >
            {scenarios.length === 0 && <option value="">No scenarios available</option>}
            {scenarios.map(s => (
              <option key={s.eventType} value={s.eventType}>
                {s.scenarioName} ({s.eventType})
              </option>
            ))}
          </select>
        </div>

        {/* Quick Scenario Preset Chips */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {scenarios.map(scen => {
            const isSelected = selectedScenario === scen.eventType;
            return (
              <button
                key={scen.eventType}
                onClick={() => applyScenarioPreset(scen.eventType)}
                className={`filter-chip ${isSelected ? 'active' : ''}`}
                style={{
                  padding: '0.35rem 0.75rem',
                  fontSize: 'var(--text-caption)',
                }}
              >
                <span>{scen.scenarioName}</span>
                <span style={{
                  padding: '0.1rem 0.35rem',
                  borderRadius: '3px',
                  fontSize: 'var(--text-micro)',
                  lineHeight: 'var(--leading-none)',
                  letterSpacing: 'var(--tracking-wide)',
                  fontFamily: 'var(--font-mono)',
                  backgroundColor: isSelected ? '#1d4ed8' : '#242731',
                  color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                }}>
                  {scen.eventType}
                </span>
              </button>
            );
          })}
        </div>

        {/* 5-Factor Shock Sensitivity Sliders */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            paddingTop: '0.75rem',
            borderTop: '1px solid var(--border-subtle)',
          }}
        >
          {/* 1. Equity Shock */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', padding: '0.65rem', backgroundColor: '#131418', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 'var(--text-overline)', lineHeight: 'var(--leading-none)', letterSpacing: 'var(--tracking-widest)', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Equity Shock</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: '800', color: '#ef4444', fontSize: 'var(--text-body-sm)', lineHeight: 'var(--leading-tight)' }}>
                {(((customShocks.equityShock ?? -0.12)) * 100).toFixed(1)}%
              </span>
            </div>
            <input
              type="range"
              min="-35"
              max="15"
              step="1"
              value={Math.round((customShocks.equityShock ?? -0.12) * 100)}
              onChange={(e) => {
                const val = parseFloat(e.target.value) / 100;
                setCustomShocks(prev => ({ ...prev, equityShock: isNaN(val) ? -0.12 : val }));
              }}
              className="range-rose"
              style={{ cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-micro)', lineHeight: 'var(--leading-none)', letterSpacing: 'var(--tracking-wide)', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              <span>-35% Crash</span>
              <span>+15% Rally</span>
            </div>
          </div>

          {/* 2. Interest Rate Shock */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', padding: '0.65rem', backgroundColor: '#131418', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 'var(--text-overline)', lineHeight: 'var(--leading-none)', letterSpacing: 'var(--tracking-widest)', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Interest Rate Δ</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: '800', color: '#0284c7', fontSize: 'var(--text-body-sm)', lineHeight: 'var(--leading-tight)' }}>
                +{(((customShocks.interestRateShock ?? 0.005)) * 10000).toFixed(0)} bps
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="400"
              step="25"
              value={Math.round((customShocks.interestRateShock ?? 0.005) * 10000)}
              onChange={(e) => {
                const val = parseFloat(e.target.value) / 10000;
                setCustomShocks(prev => ({ ...prev, interestRateShock: isNaN(val) ? 0.005 : val }));
              }}
              className="range-cyan"
              style={{ cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-micro)', lineHeight: 'var(--leading-none)', letterSpacing: 'var(--tracking-wide)', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              <span>0 bps (Flat)</span>
              <span>+400 bps (Hike)</span>
            </div>
          </div>

          {/* 3. Credit Spread Shock */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', padding: '0.65rem', backgroundColor: '#131418', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 'var(--text-overline)', lineHeight: 'var(--leading-none)', letterSpacing: 'var(--tracking-widest)', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Credit Spreads</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: '800', color: '#f59e0b', fontSize: 'var(--text-body-sm)', lineHeight: 'var(--leading-tight)' }}>
                +{Number(customShocks.creditSpreadShock ?? customShocks.creditSpreadShockBps ?? 150).toFixed(0)} bps
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="450"
              step="25"
              value={Number(customShocks.creditSpreadShock ?? customShocks.creditSpreadShockBps ?? 150)}
              onChange={(e) => {
                const val = parseFloat(e.target.value) || 0;
                setCustomShocks(prev => ({
                  ...prev,
                  creditSpreadShock: val,
                  creditSpreadShockBps: val,
                }));
              }}
              className="range-amber"
              style={{ cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-micro)', lineHeight: 'var(--leading-none)', letterSpacing: 'var(--tracking-wide)', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              <span>0 bps</span>
              <span>+450 bps High-Yield</span>
            </div>
          </div>

          {/* 4. FX Shock */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', padding: '0.65rem', backgroundColor: '#131418', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 'var(--text-overline)', lineHeight: 'var(--leading-none)', letterSpacing: 'var(--tracking-widest)', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>FX Devaluation</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: '800', color: '#38bdf8', fontSize: 'var(--text-body-sm)', lineHeight: 'var(--leading-tight)' }}>
                {(((customShocks.fxShock ?? -0.05)) * 100).toFixed(1)}%
              </span>
            </div>
            <input
              type="range"
              min="-20"
              max="15"
              step="2.5"
              value={Math.round((customShocks.fxShock ?? -0.05) * 100)}
              onChange={(e) => {
                const val = parseFloat(e.target.value) / 100;
                setCustomShocks(prev => ({ ...prev, fxShock: isNaN(val) ? -0.05 : val }));
              }}
              className="range-cyan"
              style={{ cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-micro)', lineHeight: 'var(--leading-none)', letterSpacing: 'var(--tracking-wide)', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              <span>-20% Devaluation</span>
              <span>+15% FX Boost</span>
            </div>
          </div>

          {/* 5. Commodity Shock */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', padding: '0.65rem', backgroundColor: '#131418', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 'var(--text-overline)', lineHeight: 'var(--leading-none)', letterSpacing: 'var(--tracking-widest)', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Commodity Shock</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: '800', color: (customShocks.commodityShock ?? 0.15) >= 0 ? '#10b981' : '#ef4444', fontSize: 'var(--text-body-sm)', lineHeight: 'var(--leading-tight)' }}>
                {(customShocks.commodityShock ?? 0.15) >= 0 ? '+' : ''}{(((customShocks.commodityShock ?? 0.15)) * 100).toFixed(1)}%
              </span>
            </div>
            <input
              type="range"
              min="-25"
              max="40"
              step="5"
              value={Math.round((customShocks.commodityShock ?? 0.15) * 100)}
              onChange={(e) => {
                const val = parseFloat(e.target.value) / 100;
                setCustomShocks(prev => ({ ...prev, commodityShock: isNaN(val) ? 0.15 : val }));
              }}
              className="range-emerald"
              style={{ cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-micro)', lineHeight: 'var(--leading-none)', letterSpacing: 'var(--tracking-wide)', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              <span>-25% Deflation</span>
              <span>+40% Oil Spike</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stress Test Executive Output Banner (Modeled after Reference 2 Klips & Ref 4 Cash Balance) */}
      {result && (
        <div
          className="institutional-card scroll-reveal"
          style={{
            padding: '1.35rem 1.5rem',
            backgroundColor: '#16181f',
            border: isLoss ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(16, 185, 129, 0.4)',
            borderLeft: isLoss ? '4px solid #ef4444' : '4px solid #10b981',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {/* Card 1: Scenario Meta */}
          <div>
            <div style={{ fontSize: 'var(--text-overline)', lineHeight: 'var(--leading-none)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-widest)', fontWeight: '700' }}>
              Simulated Scenario
            </div>
            <div style={{ fontSize: 'var(--text-h2)', lineHeight: 'var(--leading-snug)', letterSpacing: 'var(--tracking-tighter)', fontWeight: '800', color: '#ffffff', marginTop: '0.25rem', fontFamily: 'var(--font-display)' }}>
              {result.scenarioName}
            </div>
            <div style={{ marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <EventBadge type={result.eventType} />
              <span style={{ fontSize: 'var(--text-micro)', lineHeight: 'var(--leading-none)', letterSpacing: 'var(--tracking-wide)', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                {result.assetDetails?.length || 15} Assets
              </span>
            </div>
          </div>

          {/* Card 2: Total Loss / Gain (Ref 2 Klips style bold metric) */}
          <div>
            <div style={{ fontSize: 'var(--text-overline)', lineHeight: 'var(--leading-none)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-widest)', fontWeight: '700' }}>
              Total Portfolio Impact
            </div>
            <div
              style={{
                fontSize: 'var(--text-display-lg)',
                lineHeight: 'var(--leading-tight)',
                letterSpacing: 'var(--tracking-tightest)',
                fontWeight: '900',
                fontFamily: 'var(--font-mono)',
                color: isLoss ? '#ef4444' : '#10b981',
                marginTop: '0.15rem',
              }}
            >
              {isLoss ? '-' : '+'}${Math.abs(result.totalPnlImpact ?? 0).toFixed(2)}M
            </div>
            <div style={{ fontSize: 'var(--text-caption)', lineHeight: 'var(--leading-snug)', letterSpacing: 'var(--tracking-tight)', fontFamily: 'var(--font-mono)', fontWeight: '700', color: isLoss ? '#f87171' : '#34d399' }}>
              {(result.percentageChange ?? 0) >= 0 ? '+' : ''}{(result.percentageChange ?? 0).toFixed(2)}% Drawdown
            </div>
          </div>

          {/* Card 3: Portfolio Valuation Transition */}
          <div>
            <div style={{ fontSize: 'var(--text-overline)', lineHeight: 'var(--leading-none)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-widest)', fontWeight: '700' }}>
              Valuation Transition
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.25rem' }}>
              <span style={{ fontSize: 'var(--text-body-sm)', lineHeight: 'var(--leading-tight)', letterSpacing: 'var(--tracking-tight)', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', textDecoration: 'line-through' }}>
                ${(result.portfolioValueBefore ?? 585.0).toFixed(1)}M
              </span>
              <span style={{ fontSize: 'var(--text-display-md)', lineHeight: 'var(--leading-tight)', letterSpacing: 'var(--tracking-tightest)', fontFamily: 'var(--font-mono)', fontWeight: '800', color: '#38bdf8' }}>
                → ${(result.portfolioValueAfter ?? 529.56).toFixed(1)}M
              </span>
            </div>
            <div style={{ fontSize: 'var(--text-micro)', lineHeight: 'var(--leading-none)', letterSpacing: 'var(--tracking-wide)', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Delta-normal factor model
            </div>
          </div>

          {/* Card 4: Worst Hit Asset */}
          <div>
            <div style={{ fontSize: 'var(--text-overline)', lineHeight: 'var(--leading-none)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-widest)', fontWeight: '700' }}>
              Primary Vulnerability
            </div>
            <div style={{ fontSize: 'var(--text-h3)', lineHeight: 'var(--leading-snug)', letterSpacing: 'var(--tracking-tight)', fontWeight: '800', color: '#ffffff', marginTop: '0.25rem' }}>
              {result.worstHitAsset || 'US Treasury 10Y'}
            </div>
            <div style={{ fontSize: 'var(--text-caption)', lineHeight: 'var(--leading-snug)', letterSpacing: 'var(--tracking-tight)', fontFamily: 'var(--font-mono)', fontWeight: '700', color: '#ef4444', marginTop: '0.15rem' }}>
              -${Math.abs(result.worstHitAssetPnl ?? 18.5).toFixed(2)}M PnL Loss
            </div>
          </div>

          {/* Card 5: Parametric VaR */}
          <div>
            <div style={{ fontSize: 'var(--text-overline)', lineHeight: 'var(--leading-none)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-widest)', fontWeight: '700' }}>
              Parametric VaR (1-Day)
            </div>
            <div style={{ fontSize: 'var(--text-display-md)', lineHeight: 'var(--leading-tight)', letterSpacing: 'var(--tracking-tightest)', fontFamily: 'var(--font-mono)', fontWeight: '800', color: '#f59e0b', marginTop: '0.25rem' }}>
              ${(result.valueAtRisk95 ?? 37.2).toFixed(1)}M <span style={{ fontSize: 'var(--text-caption)', color: 'var(--text-muted)' }}>/ 95%</span>
            </div>
            <div style={{ fontSize: 'var(--text-caption)', lineHeight: 'var(--leading-snug)', letterSpacing: 'var(--tracking-tight)', fontFamily: 'var(--font-mono)', color: '#fb923c' }}>
              ${(result.valueAtRisk99 ?? 54.7).toFixed(1)}M at 99%
            </div>
          </div>
        </div>
      )}

      {/* Visualizations & Data Exploration Panel */}
      <div className="institutional-card scroll-reveal" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button
              onClick={() => setActiveTab('waterfall')}
              className={`tab-btn ${activeTab === 'waterfall' ? 'active' : ''}`}
            >
              <BarChart2 size={15} />
              <span>PnL Waterfall Attribution</span>
            </button>

            <button
              onClick={() => setActiveTab('bars')}
              className={`tab-btn ${activeTab === 'bars' ? 'active' : ''}`}
            >
              <Layers size={15} />
              <span>Asset Valuation Deltas</span>
            </button>

            <button
              onClick={() => setActiveTab('table')}
              className={`tab-btn ${activeTab === 'table' ? 'active' : ''}`}
            >
              <Table size={15} />
              <span>Asset Breakdown Table ({result?.assetDetails?.length || 15})</span>
            </button>
          </div>

          <span style={{ fontSize: 'var(--text-micro)', lineHeight: 'var(--leading-none)', letterSpacing: 'var(--tracking-wide)', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Activity size={13} color="#2563eb" />
            Executed: {result ? (result.executedAt ? new Date(result.executedAt).toLocaleTimeString() : 'Live') : '--'}
          </span>
        </div>

        {/* Tab 1: PnL Waterfall */}
        {activeTab === 'waterfall' && (
          <div>
            <div style={{ marginBottom: '0.75rem', fontSize: 'var(--text-caption)', lineHeight: 'var(--leading-relaxed)', letterSpacing: 'var(--tracking-normal)', color: 'var(--text-secondary)' }}>
              Decomposition of total portfolio loss across fixed income bond durations, loan spread widenings, equity draws, and derivatives.
            </div>
            <WaterfallChart result={result} />
          </div>
        )}

        {/* Tab 2: Asset Level Comparison Bars */}
        {activeTab === 'bars' && (
          <div>
            <div style={{ marginBottom: '0.75rem', fontSize: 'var(--text-caption)', lineHeight: 'var(--leading-relaxed)', letterSpacing: 'var(--tracking-normal)', color: 'var(--text-secondary)' }}>
              Pre-shock baseline notional vs. post-shock stressed valuation across all 15 portfolio holdings.
            </div>
            <AssetImpactBar assetDetails={result?.assetDetails} />
          </div>
        )}

        {/* Tab 3: Detailed Asset Breakdown Table (Ref 1 Taskos / Ref 2 Klips style) */}
        {activeTab === 'table' && (
          <div style={{ overflowX: 'auto' }}>
            <table className="fintech-table">
              <thead>
                <tr>
                  <th>Asset Name</th>
                  <th>Class</th>
                  <th>Sector</th>
                  <th style={{ textAlign: 'right' }}>Before ($M)</th>
                  <th style={{ textAlign: 'right' }}>Shock Delta</th>
                  <th style={{ textAlign: 'right' }}>After ($M)</th>
                  <th style={{ textAlign: 'right' }}>Net PnL ($M)</th>
                </tr>
              </thead>
              <tbody>
                {result?.assetDetails?.map((asset, idx) => {
                  const loss = (asset.pnlImpact ?? 0) < 0;
                  const shockVal = asset.shockAppliedPercent ?? asset.shockApplied ?? asset.percentageChange ?? 0;
                  const valBefore = asset.valueBefore ?? asset.notionalValue ?? 0;
                  const valAfter = asset.valueAfter ?? 0;
                  const pnlVal = asset.pnlImpact ?? 0;
                  return (
                    <tr
                      key={asset.assetId || asset.id || idx}
                      className={loss && Math.abs(pnlVal) > 5 ? 'high-impact-row' : ''}
                    >
                      <td style={{ fontWeight: '700', color: '#ffffff' }}>
                        {asset.assetName}
                      </td>
                      <td>
                        <AssetBadge type={asset.assetType} />
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>
                        {asset.sector}
                      </td>
                      <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                        ${valBefore.toFixed(2)}M
                      </td>
                      <td
                        style={{
                          textAlign: 'right',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: '700',
                          color: shockVal >= 0 ? '#10b981' : '#ef4444',
                        }}
                      >
                        {shockVal >= 0 ? '+' : ''}{shockVal.toFixed(2)}%
                      </td>
                      <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: '700', color: '#38bdf8' }}>
                        ${valAfter.toFixed(2)}M
                      </td>
                      <td
                        style={{
                          textAlign: 'right',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: '800',
                          color: loss ? '#ef4444' : '#10b981',
                        }}
                      >
                        {pnlVal >= 0 ? '+' : ''}${pnlVal.toFixed(2)}M
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
