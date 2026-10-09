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
    const params = {};
    if (assetType) params.assetType = assetType;
    if (sector) params.sector = sector;
    const res = await apiClient.get('/portfolio', { params });
    return res.data;
  },

  async getPortfolioSummary() {
    const res = await apiClient.get('/portfolio/summary');
    return res.data;
  },

  async resetPortfolio() {
    const res = await apiClient.post('/portfolio/reset');
    return res.data;
  },

  // --- Signals ---
  async getSignals(eventType = null, source = null, minImpact = null, page = 0, size = 20) {
    const params = { page, size };
    if (eventType) params.eventType = eventType;
    if (source) params.source = source;
    if (minImpact) params.minImpact = minImpact;
    const res = await apiClient.get('/signals', { params });
    return res.data;
  },

  async getLatestSignals() {
    const res = await apiClient.get('/signals/latest');
    return res.data;
  },

  async getSignalStats() {
    const res = await apiClient.get('/signals/stats');
    return res.data;
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
  },

  async runStressTest(request) {
    const spread = request.creditSpreadShock ?? request.creditSpreadShockBps ?? 150.0;
    const normalizedRequest = {
      ...request,
      creditSpreadShock: spread,
      creditSpreadShockBps: spread,
    };
    const res = await apiClient.post('/stress-tests/run', normalizedRequest);
    return res.data;
  },

  async getHistoricalStressTests(page = 0, size = 10) {
    const res = await apiClient.get('/stress-tests', { params: { page, size } });
    return res.data;
  },

  async getLatestStressTest() {
    const res = await apiClient.get('/stress-tests/latest');
    return res.data;
  },

  async getStressTestById(id) {
    const res = await apiClient.get(`/stress-tests/${id}`);
    return res.data;
  },
};
