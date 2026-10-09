import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});



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
        signalCount: 6,
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
