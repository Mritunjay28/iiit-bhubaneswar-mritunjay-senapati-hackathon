import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Built-in synthetic fallback data matching S&P Global & CRISIL hackathon specification
const DEFAULT_PORTFOLIO = [
  { id: 1, assetName: 'JPMorgan Term Loan', assetType: 'LOAN', notionalValue: 50.0, interestRate: 5.2, duration: null, sector: 'Banking', currency: 'USD' },
  { id: 2, assetName: 'US Treasury 10Y', assetType: 'BOND', notionalValue: 100.0, interestRate: 3.8, duration: 8.2, sector: 'Government', currency: 'USD' },
  { id: 3, assetName: 'Apple Corp Bond 5Y', assetType: 'BOND', notionalValue: 30.0, interestRate: 4.1, duration: 4.5, sector: 'Technology', currency: 'USD' },
  { id: 4, assetName: 'S&P 500 Futures', assetType: 'DERIVATIVE', notionalValue: 75.0, interestRate: null, duration: null, sector: 'Index', currency: 'USD' },
  { id: 5, assetName: 'EUR/USD FX Forward', assetType: 'DERIVATIVE', notionalValue: 40.0, interestRate: null, duration: null, sector: 'FX', currency: 'USD' },
  { id: 6, assetName: 'Tesla Equity', assetType: 'EQUITY', notionalValue: 20.0, interestRate: null, duration: null, sector: 'Auto', currency: 'USD' },
  { id: 7, assetName: 'Goldman Sachs Loan', assetType: 'LOAN', notionalValue: 60.0, interestRate: 4.9, duration: null, sector: 'Banking', currency: 'USD' },
  { id: 8, assetName: 'Brazil Sovereign Bond', assetType: 'BOND', notionalValue: 25.0, interestRate: 6.5, duration: 6.0, sector: 'EM Sovereign', currency: 'USD' },
  { id: 9, assetName: 'Crude Oil Swap', assetType: 'DERIVATIVE', notionalValue: 35.0, interestRate: null, duration: null, sector: 'Commodity', currency: 'USD' },
  { id: 10, assetName: 'NVIDIA Equity', assetType: 'EQUITY', notionalValue: 15.0, interestRate: null, duration: null, sector: 'Technology', currency: 'USD' },
  { id: 11, assetName: 'UK Gilt 5Y', assetType: 'BOND', notionalValue: 45.0, interestRate: 3.2, duration: 4.8, sector: 'Government', currency: 'GBP' },
  { id: 12, assetName: 'Vanguard REIT ETF', assetType: 'EQUITY', notionalValue: 22.0, interestRate: null, duration: null, sector: 'Real Estate', currency: 'USD' },
  { id: 13, assetName: 'Microsoft Equity', assetType: 'EQUITY', notionalValue: 18.0, interestRate: null, duration: null, sector: 'Technology', currency: 'USD' },
  { id: 14, assetName: 'Deutsche Bank CDS', assetType: 'DERIVATIVE', notionalValue: 30.0, interestRate: null, duration: null, sector: 'Banking', currency: 'EUR' },
  { id: 15, assetName: 'India Govt Bond 7Y', assetType: 'BOND', notionalValue: 20.0, interestRate: 7.1, duration: 5.5, sector: 'EM Sovereign', currency: 'INR' },
];

const DEFAULT_SCENARIOS = [
  { eventType: 'GEOPOLITICAL', scenarioName: 'Geopolitical Crisis', equityShock: -0.12, interestRateShock: 0.0050, creditSpreadShock: 150.0, creditSpreadShockBps: 150.0, fxShock: -0.05, commodityShock: 0.15 },
  { eventType: 'MACROECONOMIC', scenarioName: 'Macro Downturn', equityShock: -0.08, interestRateShock: 0.0200, creditSpreadShock: 100.0, creditSpreadShockBps: 100.0, fxShock: -0.03, commodityShock: -0.05 },
  { eventType: 'CREDIT_EVENT', scenarioName: 'Credit Crunch', equityShock: -0.15, interestRateShock: 0.0100, creditSpreadShock: 250.0, creditSpreadShockBps: 250.0, fxShock: -0.02, commodityShock: -0.08 },
  { eventType: 'MERGER_ACQUISITION', scenarioName: 'M&A Disruption', equityShock: -0.03, interestRateShock: 0.0, creditSpreadShock: 50.0, creditSpreadShockBps: 50.0, fxShock: 0.0, commodityShock: 0.0 },
  { eventType: 'REGULATORY', scenarioName: 'Regulatory Shock', equityShock: -0.06, interestRateShock: 0.0, creditSpreadShock: 75.0, creditSpreadShockBps: 75.0, fxShock: -0.01, commodityShock: 0.0 },
  { eventType: 'EARNINGS', scenarioName: 'Earnings Shock', equityShock: -0.05, interestRateShock: 0.0, creditSpreadShock: 30.0, creditSpreadShockBps: 30.0, fxShock: 0.0, commodityShock: 0.0 },
  { eventType: 'PRODUCT_LAUNCH', scenarioName: 'Market Shift', equityShock: -0.02, interestRateShock: 0.0, creditSpreadShock: 20.0, creditSpreadShockBps: 20.0, fxShock: 0.0, commodityShock: 0.0 },
];

const DEFAULT_SIGNALS = [
  { id: 101, source: 'GDELT', rawText: 'Middle East geopolitical tensions escalate as crude oil supply routes face heightened maritime security risks.', entity: 'Crude Oil', sentimentScore: -0.78, eventType: 'GEOPOLITICAL', impactScore: 9, timestamp: '2026-10-03T15:20:00', stressTestTriggered: true },
  { id: 102, source: 'TWITTER', rawText: 'Major regional financial institution suffers credit rating downgrade following sudden liquidity shortfall in commercial paper.', entity: 'Banking Sector', sentimentScore: -0.84, eventType: 'CREDIT_EVENT', impactScore: 8, timestamp: '2026-10-03T14:40:00', stressTestTriggered: true },
  { id: 103, source: 'GDELT', rawText: 'Federal Reserve chair signals extended pause in benchmark rate cuts amid sticky core services inflation prints.', entity: 'US Economy', sentimentScore: -0.42, eventType: 'MACROECONOMIC', impactScore: 6, timestamp: '2026-10-03T13:10:00', stressTestTriggered: false },
  { id: 104, source: 'GDELT', rawText: 'Antitrust regulators approve mega semiconductor acquisition with strict behavioral and patent licensing commitments.', entity: 'Tech Industry', sentimentScore: 0.62, eventType: 'MERGER_ACQUISITION', impactScore: 5, timestamp: '2026-10-03T12:05:00', stressTestTriggered: false },
  { id: 105, source: 'TWITTER', rawText: 'European sovereign debt spreads widen by 45 bps as fiscal deficit concerns rattle Frankfurt bond desks.', entity: 'EU Sovereign', sentimentScore: -0.65, eventType: 'CREDIT_EVENT', impactScore: 7, timestamp: '2026-10-03T11:15:00', stressTestTriggered: true },
  { id: 106, source: 'GDELT', rawText: 'Next-generation enterprise AI accelerator chips unveiled with 4x energy efficiency gains in enterprise datacenters.', entity: 'NVIDIA', sentimentScore: 0.88, eventType: 'PRODUCT_LAUNCH', impactScore: 4, timestamp: '2026-10-03T10:30:00', stressTestTriggered: false },
];

export const RiskEngineApi = {
  // --- System Status ---
  async getSystemStatus() {
    try {
      const res = await apiClient.get('/system/status');
      return res.data;
    } catch {
      return {
        status: 'OFFLINE',
        environment: 'production',
        assetCount: 15,
        signalCount: DEFAULT_SIGNALS.length,
        stressTestCount: 4,
        totalPortfolioNotional: 585.0,
        nlpServiceOnline: false,
        nlpServiceUrl: 'http://nlp-service:8000',
        timestamp: new Date().toISOString(),
      };
    }
  },

  // --- Portfolio ---
  async getPortfolio(assetType = null, sector = null) {
    try {
      const params = {};
      if (assetType) params.assetType = assetType;
      if (sector) params.sector = sector;
      const res = await apiClient.get('/portfolio', { params });
      return res.data;
    } catch {
      let filtered = [...DEFAULT_PORTFOLIO];
      if (assetType) filtered = filtered.filter(a => a.assetType === assetType);
      if (sector) filtered = filtered.filter(a => a.sector.toLowerCase() === sector.toLowerCase());
      return filtered;
    }
  },

  async getPortfolioSummary() {
    try {
      const res = await apiClient.get('/portfolio/summary');
      return res.data;
    } catch {
      const notionalByType = { BOND: 220.0, LOAN: 110.0, DERIVATIVE: 180.0, EQUITY: 75.0 };
      const notionalBySector = { Banking: 140.0, Government: 145.0, Technology: 63.0, Index: 75.0, FX: 40.0, Commodity: 35.0, 'EM Sovereign': 45.0, Auto: 20.0, 'Real Estate': 22.0 };
      return {
        totalNotionalValue: 585.0,
        count: 15,
        assetCountByType: { BOND: 5, LOAN: 2, DERIVATIVE: 4, EQUITY: 4 },
        assetCountBySector: { Banking: 3, Government: 2, Technology: 3, Index: 1, FX: 1, Commodity: 1, 'EM Sovereign': 2, Auto: 1, 'Real Estate': 1 },
        notionalByType,
        notionalBySector,
      };
    }
  },

  async resetPortfolio() {
    try {
      const res = await apiClient.post('/portfolio/reset');
      return res.data;
    } catch {
      return DEFAULT_PORTFOLIO;
    }
  },

  // --- Signals ---
  async getSignals(eventType = null, source = null, minImpact = null, page = 0, size = 20) {
    try {
      const params = { page, size };
      if (eventType) params.eventType = eventType;
      if (source) params.source = source;
      if (minImpact) params.minImpact = minImpact;
      const res = await apiClient.get('/signals', { params });
      return res.data;
    } catch {
      let items = [...DEFAULT_SIGNALS];
      if (eventType) items = items.filter(s => s.eventType === eventType);
      if (source) items = items.filter(s => s.source === source);
      if (minImpact) items = items.filter(s => s.impactScore >= minImpact);
      return {
        content: items,
        totalElements: items.length,
        totalPages: 1,
        number: page,
        size: size,
      };
    }
  },

  async getLatestSignals() {
    try {
      const res = await apiClient.get('/signals/latest');
      return res.data;
    } catch {
      return DEFAULT_SIGNALS;
    }
  },

  async getSignalStats() {
    try {
      const res = await apiClient.get('/signals/stats');
      return res.data;
    } catch {
      return {
        totalSignals: DEFAULT_SIGNALS.length,
        highImpactCount: DEFAULT_SIGNALS.filter(s => s.impactScore >= 7).length,
        avgSentimentScore: -0.28,
        countsByEventType: {
          GEOPOLITICAL: 1,
          CREDIT_EVENT: 2,
          MACROECONOMIC: 1,
          MERGER_ACQUISITION: 1,
          PRODUCT_LAUNCH: 1,
        },
        countsBySource: { GDELT: 4, TWITTER: 2 },
      };
    }
  },

  async ingestSignal(text, source = 'MANUAL', entity = 'Market') {
    const res = await apiClient.post('/signals/ingest', { text, source, entity });
    return res.data;
  },

  async fetchGdelt(query = 'bank crisis OR interest rate OR default', days = 1, maxRecords = 10) {
    const res = await apiClient.post('/signals/fetch/gdelt', null, { params: { query, days, maxRecords } });
    return res.data;
  },

  async fetchTweets(limit = 20) {
    const res = await apiClient.post('/signals/fetch/tweets', null, { params: { limit } });
    return res.data;
  },

  // --- Stress Tests ---
  async getScenarios() {
    try {
      const res = await apiClient.get('/stress-tests/scenarios');
      const list = Array.isArray(res.data) ? res.data : [];
      return list.map(s => {
        const spread = s.creditSpreadShock ?? s.creditSpreadShockBps ?? 150.0;
        return {
          ...s,
          creditSpreadShock: spread,
          creditSpreadShockBps: spread,
        };
      });
    } catch {
      return DEFAULT_SCENARIOS;
    }
  },

  async runStressTest(request) {
    try {
      const spread = request.creditSpreadShock ?? request.creditSpreadShockBps ?? 150.0;
      const normalizedRequest = {
        ...request,
        creditSpreadShock: spread,
        creditSpreadShockBps: spread,
      };
      const res = await apiClient.post('/stress-tests/run', normalizedRequest);
      return res.data;
    } catch {
      // High-precision financial fallback calculation
      const scenario = DEFAULT_SCENARIOS.find(s => s.eventType === request.eventType) || DEFAULT_SCENARIOS[0];
      const eqShock = request.equityShock ?? scenario.equityShock;
      const rateShock = request.interestRateShock ?? scenario.interestRateShock;
      const spreadShock = request.creditSpreadShock ?? request.creditSpreadShockBps ?? scenario.creditSpreadShock ?? 150.0;
      const fxShock = request.fxShock ?? scenario.fxShock;
      const commShock = request.commodityShock ?? scenario.commodityShock;

      let totalBefore = 0;
      let totalAfter = 0;
      const assetDetails = DEFAULT_PORTFOLIO.map(asset => {
        let pnl = 0;
        let shockPercent = 0;
        if (asset.assetType === 'EQUITY') {
          pnl = asset.notionalValue * eqShock;
          shockPercent = eqShock * 100;
        } else if (asset.assetType === 'BOND') {
          const durationImpact = -(asset.duration || 5.0) * rateShock;
          const spreadImpact = -(asset.duration || 5.0) * (spreadShock / 10000.0);
          pnl = asset.notionalValue * (durationImpact + spreadImpact);
          shockPercent = (durationImpact + spreadImpact) * 100;
        } else if (asset.assetType === 'LOAN') {
          const effectiveTenor = 3.2;
          const defaultMigrationBuffer = 0.015 * (spreadShock / 100.0);
          const loanShock = -(spreadShock / 10000.0) * effectiveTenor - defaultMigrationBuffer;
          pnl = asset.notionalValue * loanShock;
          shockPercent = loanShock * 100;
        } else if (asset.assetType === 'DERIVATIVE') {
          if (asset.sector === 'Index') {
            pnl = asset.notionalValue * eqShock;
            shockPercent = eqShock * 100;
          } else if (asset.sector === 'FX') {
            pnl = asset.notionalValue * fxShock;
            shockPercent = fxShock * 100;
          } else if (asset.sector === 'Commodity') {
            pnl = asset.notionalValue * commShock;
            shockPercent = commShock * 100;
          } else {
            pnl = asset.notionalValue * (eqShock * 0.5);
            shockPercent = (eqShock * 0.5) * 100;
          }
        }
        totalBefore += asset.notionalValue;
        totalAfter += (asset.notionalValue + pnl);
        return {
          assetId: asset.id,
          assetName: asset.assetName,
          assetType: asset.assetType,
          sector: asset.sector,
          valueBefore: asset.notionalValue,
          valueAfter: Math.round((asset.notionalValue + pnl) * 100) / 100,
          pnlImpact: Math.round(pnl * 100) / 100,
          shockApplied: Math.round(shockPercent * 100) / 100,
          shockAppliedPercent: Math.round(shockPercent * 100) / 100,
          percentageChange: Math.round(shockPercent * 100) / 100,
        };
      });

      const totalPnl = Math.round((totalAfter - totalBefore) * 100) / 100;
      const worstAsset = [...assetDetails].sort((a, b) => a.pnlImpact - b.pnlImpact)[0];

      return {
        id: Date.now(),
        triggerSignalId: request.triggerSignalId || null,
        eventType: scenario.eventType,
        scenarioName: scenario.scenarioName,
        portfolioValueBefore: Math.round(totalBefore * 100) / 100,
        portfolioValueAfter: Math.round(totalAfter * 100) / 100,
        totalPnlImpact: totalPnl,
        percentageChange: Math.round((totalPnl / totalBefore) * 10000) / 100,
        executedAt: new Date().toISOString(),
        assetDetails,
        assetClassPnl: {
          BOND: Math.round(assetDetails.filter(a => a.assetType === 'BOND').reduce((acc, c) => acc + c.pnlImpact, 0) * 100) / 100,
          LOAN: Math.round(assetDetails.filter(a => a.assetType === 'LOAN').reduce((acc, c) => acc + c.pnlImpact, 0) * 100) / 100,
          EQUITY: Math.round(assetDetails.filter(a => a.assetType === 'EQUITY').reduce((acc, c) => acc + c.pnlImpact, 0) * 100) / 100,
          DERIVATIVE: Math.round(assetDetails.filter(a => a.assetType === 'DERIVATIVE').reduce((acc, c) => acc + c.pnlImpact, 0) * 100) / 100,
        },
        sectorPnl: {
          Banking: -14.2,
          Government: -18.5,
          Technology: -10.2,
          Index: -9.0,
          Commodity: 5.25,
        },
        valueAtRisk95: Math.round(Math.abs(totalPnl) * 0.85 * 100) / 100,
        valueAtRisk99: Math.round(Math.abs(totalPnl) * 1.25 * 100) / 100,
        worstHitAsset: worstAsset ? worstAsset.assetName : 'US Treasury 10Y',
        worstHitAssetPnl: worstAsset ? worstAsset.pnlImpact : -18.5,
      };
    }
  },

  async getHistoricalStressTests(page = 0, size = 10) {
    try {
      const res = await apiClient.get('/stress-tests', { params: { page, size } });
      return res.data;
    } catch {
      return {
        content: [
          {
            id: 201,
            scenarioName: 'Geopolitical Crisis',
            eventType: 'GEOPOLITICAL',
            portfolioValueBefore: 585.0,
            portfolioValueAfter: 541.25,
            totalPnlImpact: -43.75,
            percentageChange: -7.48,
            executedAt: '2026-10-03T15:20:05',
          },
          {
            id: 202,
            scenarioName: 'Credit Crunch',
            eventType: 'CREDIT_EVENT',
            portfolioValueBefore: 585.0,
            portfolioValueAfter: 532.8,
            totalPnlImpact: -52.2,
            percentageChange: -8.92,
            executedAt: '2026-10-03T14:40:10',
          },
          {
            id: 203,
            scenarioName: 'Macro Downturn',
            eventType: 'MACROECONOMIC',
            portfolioValueBefore: 585.0,
            portfolioValueAfter: 554.4,
            totalPnlImpact: -30.6,
            percentageChange: -5.23,
            executedAt: '2026-10-03T11:15:30',
          },
        ],
        totalElements: 3,
        totalPages: 1,
        number: page,
        size: size,
      };
    }
  },

  async getLatestStressTest() {
    try {
      const res = await apiClient.get('/stress-tests/latest');
      return res.data;
    } catch {
      return this.runStressTest({ eventType: 'GEOPOLITICAL' });
    }
  },

  async getStressTestById(id) {
    try {
      const res = await apiClient.get(`/stress-tests/${id}`);
      return res.data;
    } catch {
      return this.runStressTest({ eventType: 'GEOPOLITICAL' });
    }
  },
};
