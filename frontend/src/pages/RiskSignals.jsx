import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Download,
  Send,
  Zap,
  Sparkles,
} from 'lucide-react';
import { RiskEngineApi } from '../services/api';
import { EventBadge, SentimentBadge, ImpactBadge } from '../components/common/Badge';
import { Loader } from '../components/common/Loader';

export const RiskSignals = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [signals, setSignals] = useState([]);
  const [eventTypeFilter, setEventTypeFilter] = useState('ALL');
  const [sourceFilter, setSourceFilter] = useState('ALL');
  const [impactFilter, setImpactFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [ingesting, setIngesting] = useState(false);
  const [customText, setCustomText] = useState('');
  const [showCustomBox, setShowCustomBox] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  const loadSignals = async () => {
    try {
      const data = await RiskEngineApi.getSignals();
      setSignals(data?.content || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSignals();
    const handleRefresh = () => loadSignals();
    window.addEventListener('riskengine:refresh', handleRefresh);
    return () => window.removeEventListener('riskengine:refresh', handleRefresh);
  }, []);

  const handleFetchGdelt = async () => {
    setIngesting(true);
    setStatusMessage('Fetching and analyzing live GDELT financial articles with FinBERT...');
    try {
      const newItems = await RiskEngineApi.fetchGdelt();
      setStatusMessage(`Ingested ${newItems.length} news articles from GDELT.`);
      await loadSignals();
    } finally {
      setIngesting(false);
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  const handleFetchTweets = async () => {
    setIngesting(true);
    setStatusMessage('Loading Kaggle financial tweets batch into FinBERT pipeline...');
    try {
      const newItems = await RiskEngineApi.fetchTweets();
      setStatusMessage(`Ingested ${newItems.length} tweets from Kaggle dataset.`);
      await loadSignals();
    } finally {
      setIngesting(false);
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  const handleCustomIngest = async (e) => {
    e.preventDefault();
    if (!customText.trim()) return;
    setIngesting(true);
    try {
      const res = await RiskEngineApi.ingestSignal(customText, 'ANALYST', 'Custom Entity');
      setStatusMessage(res.message || 'Signal evaluated successfully!');
      setCustomText('');
      setShowCustomBox(false);
      await loadSignals();
    } finally {
      setIngesting(false);
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  if (loading) {
    return <Loader message="Fetching FinBERT risk signals and news events..." />;
  }

  const filteredSignals = signals.filter(s => {
    const matchEvent = eventTypeFilter === 'ALL' || s.eventType === eventTypeFilter;
    const matchSource = sourceFilter === 'ALL' || s.source === sourceFilter;
    const matchImpact = impactFilter === 'ALL' ||
      (impactFilter === 'HIGH' ? s.impactScore >= 7 : s.impactScore < 7);
    const matchSearch = (s.rawText || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (s.entity || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchEvent && matchSource && matchImpact && matchSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Top Header & Ingestion Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#ffffff', margin: 0 }}>
            Risk Signals & Financial NLP Stream
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.15rem 0 0 0' }}>
            Unstructured news from GDELT and Kaggle Twitter categorized by FinBERT and keyword taxonomies
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <button
            onClick={handleFetchGdelt}
            disabled={ingesting}
            className="btn btn-outline"
          >
            <Download size={14} />
            <span>Ingest GDELT News</span>
          </button>

          <button
            onClick={handleFetchTweets}
            disabled={ingesting}
            className="btn btn-outline"
          >
            <Download size={14} />
            <span>Load Kaggle Tweets</span>
          </button>

          <button
            onClick={() => setShowCustomBox(!showCustomBox)}
            className="btn btn-primary"
          >
            <Sparkles size={14} />
            <span>Analyze Custom Text</span>
          </button>
        </div>
      </div>

      {/* Ingestion Toast Status Message */}
      {statusMessage && (
        <div
          style={{
            padding: '0.75rem 1.25rem',
            borderRadius: '8px',
            backgroundColor: 'rgba(99, 102, 241, 0.15)',
            border: '1px solid rgba(99, 102, 241, 0.4)',
            color: '#a5b4fc',
            fontSize: '0.825rem',
            fontFamily: 'var(--font-mono)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <Sparkles size={15} />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Custom Text Analysis Drawer */}
      {showCustomBox && (
        <div
          className="glass-panel"
          style={{
            padding: '1.25rem',
            border: '1px solid var(--accent-primary)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}
        >
          <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#ffffff' }}>
            Interactive FinBERT NLP Sandbox
          </div>
          <form onSubmit={handleCustomIngest} style={{ display: 'flex', gap: '0.75rem' }}>
            <input
              type="text"
              placeholder="e.g. Hostilities break out in major shipping channel threatening global crude and shipping supply chains..."
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              className="input-control"
              style={{ flex: 1 }}
            />
            <button
              type="submit"
              disabled={ingesting || !customText.trim()}
              className="btn btn-primary"
            >
              <Send size={14} />
              <span>Evaluate</span>
            </button>
          </form>
        </div>
      )}

      {/* Filter Bar */}
      <div
        className="glass-panel"
        style={{
          padding: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Event Type Filter */}
          <select
            value={eventTypeFilter}
            onChange={(e) => setEventTypeFilter(e.target.value)}
            className="input-control"
            style={{ width: '180px' }}
          >
            <option value="ALL">All Event Types</option>
            <option value="GEOPOLITICAL">Geopolitical</option>
            <option value="CREDIT_EVENT">Credit Event</option>
            <option value="MACROECONOMIC">Macroeconomic</option>
            <option value="MERGER_ACQUISITION">M&A</option>
            <option value="REGULATORY">Regulatory</option>
            <option value="EARNINGS">Earnings</option>
            <option value="PRODUCT_LAUNCH">Product Launch</option>
          </select>

          {/* Source Filter */}
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="input-control"
            style={{ width: '140px' }}
          >
            <option value="ALL">All Sources</option>
            <option value="GDELT">GDELT</option>
            <option value="TWITTER">Twitter</option>
            <option value="ANALYST">Analyst</option>
          </select>

          {/* Impact Filter */}
          <select
            value={impactFilter}
            onChange={(e) => setImpactFilter(e.target.value)}
            className="input-control"
            style={{ width: '170px' }}
          >
            <option value="ALL">All Impact Levels</option>
            <option value="HIGH">Impact ≥ 7 (Auto Trigger)</option>
            <option value="LOW">Impact &lt; 7</option>
          </select>
        </div>

        {/* Keyword Search Box */}
        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search headline or entity..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-control"
            style={{ paddingLeft: '2.2rem' }}
          />
        </div>
      </div>

      {/* Signals Feed Table */}
      <div className="glass-panel" style={{ padding: '1.25rem', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-medium)', textAlign: 'left', color: 'var(--text-muted)' }}>
              <th style={{ padding: '0.75rem 1rem' }}>Source / Time</th>
              <th style={{ padding: '0.75rem 1rem' }}>Event Category</th>
              <th style={{ padding: '0.75rem 1rem' }}>Entity</th>
              <th style={{ padding: '0.75rem 1rem', width: '40%' }}>Raw Content</th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>FinBERT Sentiment</th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Impact Score</th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredSignals.map((signal, idx) => (
              <tr
                key={signal.id || idx}
                style={{
                  borderBottom: '1px solid var(--border-subtle)',
                  backgroundColor: idx % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent',
                }}
              >
                <td style={{ padding: '0.75rem 1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontWeight: '700',
                        fontSize: '0.725rem',
                        color: signal.source === 'GDELT' ? '#06b6d4' : '#60a5fa',
                      }}
                    >
                      {signal.source || 'FEED'}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      {signal.timestamp ? new Date(signal.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Live'}
                    </span>
                  </div>
                </td>

                <td style={{ padding: '0.75rem 1rem' }}>
                  <EventBadge type={signal.eventType} />
                </td>

                <td style={{ padding: '0.75rem 1rem', fontWeight: '500', color: '#ffffff' }}>
                  {signal.entity || 'Market Wide'}
                </td>

                <td style={{ padding: '0.75rem 1rem', lineHeight: '1.4', color: 'var(--text-secondary)' }}>
                  "{signal.rawText}"
                </td>

                <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                  <SentimentBadge score={signal.sentimentScore} />
                </td>

                <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                  <ImpactBadge score={signal.impactScore} />
                </td>

                <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                  <button
                    onClick={() => navigate('/stress-test')}
                    className="btn btn-outline"
                    style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                    title="Simulate shock scenario for this event"
                  >
                    <Zap size={13} color="#f59e0b" />
                    <span>Stress</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
