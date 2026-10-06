import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Send,
  Zap,
  Sparkles,
  Flame,
  Radio,
  X,
  Globe,
  MessageSquare,
} from 'lucide-react';
import { RiskEngineApi } from '../services/api';
import { EventBadge, SentimentBadge, ImpactBadge } from '../components/common/Badge';
import { Loader, Spinner } from '../components/common/Loader';

const SAMPLE_PROMPTS = [
  'Hostilities escalate in Red Sea as commercial oil tanker is struck by anti-ship missile.',
  'Federal Reserve unexpectedly raises benchmark interest rates by 75 bps to counter inflation.',
  'Major regional banking institution reports severe liquidity squeeze and defaults on debt.',
  'OPEC+ announces surprise emergency crude production cuts of 2.2 million barrels per day.',
];

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
    setStatusMessage('Querying GDELT Project v2 API and parsing financial geopolitical feeds...');
    try {
      const newItems = await RiskEngineApi.fetchGdelt();
      setStatusMessage(`Ingested ${newItems.length} news articles from GDELT into FinBERT.`);
      await loadSignals();
    } finally {
      setIngesting(false);
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  const handleFetchTweets = async () => {
    setIngesting(true);
    setStatusMessage('Streaming Kaggle financial tweets batch into FinBERT NLP pipeline...');
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
    e?.preventDefault();
    if (!customText.trim()) return;
    setIngesting(true);
    try {
      const res = await RiskEngineApi.ingestSignal(customText, 'ANALYST', 'Custom Entity');
      setStatusMessage(res.message || 'Signal evaluated by FinBERT and indexed in risk stream!');
      setCustomText('');
      setShowCustomBox(false);
      await loadSignals();
    } finally {
      setIngesting(false);
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  if (loading) {
    return <Loader message="Connecting to FinBERT NLP stream and fetching market risk signals..." />;
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

  const highImpactCount = signals.filter(s => s.impactScore >= 7).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Header & Ingestion Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: 'var(--text-h1)', lineHeight: 'var(--leading-snug)', letterSpacing: 'var(--tracking-tighter)', fontWeight: '800', color: '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-display)' }}>
            <span style={{
              width: '26px',
              height: '26px',
              borderRadius: '4px',
              backgroundColor: '#0284c7',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Radio size={15} color="#ffffff" />
            </span>
            Real-Time Risk Signal & FinBERT Intelligence Stream
          </h2>
          <p style={{ fontSize: 'var(--text-caption)', lineHeight: 'var(--leading-relaxed)', letterSpacing: 'var(--tracking-normal)', color: 'var(--text-secondary)', margin: '0.2rem 0 0 0' }}>
            Unstructured news from GDELT 2.0 and Twitter classified via FinBERT with sentiment score & auto-shock triggers
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            onClick={handleFetchGdelt}
            disabled={ingesting}
            className="btn btn-outline"
            style={{ fontSize: 'var(--text-body-sm)', padding: '0.45rem 0.75rem' }}
          >
            {ingesting ? <Spinner size={13} color="#38bdf8" /> : <Globe size={13} color="#38bdf8" />}
            <span>Ingest GDELT News</span>
          </button>

          <button
            onClick={handleFetchTweets}
            disabled={ingesting}
            className="btn btn-outline"
            style={{ fontSize: 'var(--text-body-sm)', padding: '0.45rem 0.75rem' }}
          >
            {ingesting ? <Spinner size={13} color="#60a5fa" /> : <MessageSquare size={13} color="#60a5fa" />}
            <span>Load Kaggle Tweets</span>
          </button>

          <button
            onClick={() => setShowCustomBox(!showCustomBox)}
            className="btn btn-outline"
            style={{ fontSize: 'var(--text-body-sm)', padding: '0.45rem 0.75rem' }}
          >
            <Sparkles size={13} color="#f59e0b" />
            <span>{showCustomBox ? 'Hide Sandbox' : 'FinBERT Sandbox'}</span>
          </button>

          {/* The ONE Repeated CTA */}
          <button
            onClick={() => navigate('/stress-test')}
            className="btn btn-cta"
            style={{ fontSize: 'var(--text-body-sm)', padding: '0.45rem 0.95rem' }}
          >
            <Zap size={13} />
            <span>Simulate Shock</span>
          </button>
        </div>
      </div>

      {/* Ingestion Toast Status Message */}
      {statusMessage && (
        <div
          style={{
            padding: '0.75rem 1.25rem',
            borderRadius: '6px',
            backgroundColor: '#16181f',
            border: '1px solid #2563eb',
            color: '#93c5fd',
            fontSize: 'var(--text-body-sm)',
            lineHeight: 'var(--leading-snug)',
            fontFamily: 'var(--font-mono)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <Sparkles size={15} color="#3b82f6" />
            <span>{statusMessage}</span>
          </div>
          <button
            onClick={() => setStatusMessage(null)}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* Interactive FinBERT Sandbox Drawer */}
      {showCustomBox && (
        <div
          className="institutional-card scroll-reveal"
          style={{
            padding: '1.25rem 1.5rem',
            border: '1px solid #2563eb',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={16} color="#60a5fa" />
              <h3 style={{ fontSize: 'var(--text-h3)', lineHeight: 'var(--leading-snug)', letterSpacing: 'var(--tracking-tight)', fontWeight: '700', color: '#ffffff', margin: 0 }}>
                Interactive FinBERT NLP Sandbox (Test Custom Risk Events)
              </h3>
            </div>
            <span style={{ fontSize: 'var(--text-caption)', lineHeight: 'var(--leading-none)', letterSpacing: 'var(--tracking-normal)', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              Model: ProsusAI/finbert
            </span>
          </div>

          <form onSubmit={handleCustomIngest} style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="e.g. Armed conflict threatens crude export terminals, prompting emergency rate defense..."
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              className="input-control"
              style={{ flex: 1, minWidth: '320px', fontSize: 'var(--text-body-sm)' }}
            />
            <button
              type="submit"
              disabled={ingesting || !customText.trim()}
              className="btn btn-cta"
              style={{ minWidth: '130px' }}
            >
              {ingesting ? <Spinner size={14} color="#ffffff" /> : <Send size={14} />}
              <span>{ingesting ? 'Analyzing...' : 'Evaluate NLP'}</span>
            </button>
          </form>

          {/* Quick Clickable Sample Prompts */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <span style={{ fontSize: 'var(--text-overline)', lineHeight: 'var(--leading-none)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-widest)', fontWeight: '700' }}>
              Sample Shock Scenarios:
            </span>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {SAMPLE_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCustomText(prompt)}
                  style={{
                    padding: '0.3rem 0.6rem',
                    borderRadius: '4px',
                    fontSize: 'var(--text-caption)',
                    lineHeight: 'var(--leading-normal)',
                    letterSpacing: 'var(--tracking-normal)',
                    textAlign: 'left',
                    backgroundColor: '#131418',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                  }}
                >
                  "{prompt.slice(0, 48)}..."
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filter and Query Tool Bar */}
      <div
        className="institutional-card scroll-reveal"
        style={{
          padding: '1rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {/* Event Category Filter */}
          <select
            value={eventTypeFilter}
            onChange={(e) => setEventTypeFilter(e.target.value)}
            className="input-control"
            style={{ width: '180px', fontWeight: '600' }}
          >
            <option value="ALL">All Event Categories</option>
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
            style={{ width: '140px', fontWeight: '600' }}
          >
            <option value="ALL">All Sources</option>
            <option value="GDELT">GDELT News</option>
            <option value="TWITTER">Twitter Feed</option>
            <option value="ANALYST">Analyst Custom</option>
          </select>

          {/* Impact Filter */}
          <select
            value={impactFilter}
            onChange={(e) => setImpactFilter(e.target.value)}
            className="input-control"
            style={{ width: '175px', fontWeight: '600' }}
          >
            <option value="ALL">All Impact Levels</option>
            <option value="HIGH">Impact ≥ 7 (Auto Shock)</option>
            <option value="LOW">Impact &lt; 7 (Informational)</option>
          </select>
        </div>

        {/* Search and High Impact Counter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.35rem 0.65rem',
            borderRadius: '4px',
            backgroundColor: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            fontSize: 'var(--text-caption)',
            lineHeight: 'var(--leading-none)',
            letterSpacing: 'var(--tracking-wide)',
            color: '#f87171',
            fontWeight: '700',
          }}>
            <Flame size={14} color="#ef4444" />
            <span>{highImpactCount} Critical Signals</span>
          </div>

          <div style={{ position: 'relative', width: '250px' }}>
            <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search headline or entity..."
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
      </div>

      {/* Signals Feed Table (Ref 1 Taskos / Ref 2 Klips style) */}
      <div className="institutional-card scroll-reveal" style={{ padding: '1.25rem', overflowX: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem', padding: '0 0.25rem' }}>
          <span style={{ fontSize: 'var(--text-caption)', lineHeight: 'var(--leading-none)', letterSpacing: 'var(--tracking-normal)', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            Showing {filteredSignals.length} of {signals.length} Signals
          </span>
          <span style={{ fontSize: 'var(--text-caption)', lineHeight: 'var(--leading-none)', letterSpacing: 'var(--tracking-normal)', color: 'var(--text-muted)' }}>
            * Signals with Impact ≥ 7 trigger Module B auto-stress simulation
          </span>
        </div>

        <table className="fintech-table">
          <thead>
            <tr>
              <th>Source / Time</th>
              <th>Category</th>
              <th>Entity</th>
              <th style={{ width: '44%' }}>Headline & Context</th>
              <th style={{ textAlign: 'center' }}>FinBERT Sentiment</th>
              <th style={{ textAlign: 'center' }}>Impact Score</th>
              <th style={{ textAlign: 'right' }}>Engine Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredSignals.map((signal, idx) => {
              const isHighImpact = signal.impactScore >= 7;
              return (
                <tr
                  key={signal.id || idx}
                  className={isHighImpact ? 'high-impact-row' : ''}
                >
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontWeight: '800',
                          fontSize: 'var(--text-micro)',
                          lineHeight: 'var(--leading-none)',
                          letterSpacing: 'var(--tracking-wide)',
                          color: signal.source === 'GDELT' ? '#38bdf8' : signal.source === 'TWITTER' ? '#60a5fa' : '#a78bfa',
                        }}
                      >
                        {signal.source || 'FEED'}
                      </span>
                      <span style={{ fontSize: 'var(--text-micro)', lineHeight: 'var(--leading-none)', letterSpacing: 'var(--tracking-normal)', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: '0.2rem' }}>
                        {signal.timestamp ? new Date(signal.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Live'}
                      </span>
                    </div>
                  </td>

                  <td>
                    <EventBadge type={signal.eventType} />
                  </td>

                  <td style={{ fontWeight: '700', color: '#ffffff' }}>
                    {signal.entity || 'Broad Market'}
                  </td>

                  <td style={{ lineHeight: 'var(--leading-relaxed)', letterSpacing: 'var(--tracking-normal)', color: isHighImpact ? '#ffffff' : 'var(--text-secondary)', fontSize: 'var(--text-body-sm)' }}>
                    "{signal.rawText}"
                  </td>

                  <td style={{ textAlign: 'center' }}>
                    <SentimentBadge score={signal.sentimentScore} />
                  </td>

                  <td style={{ textAlign: 'center' }}>
                    <ImpactBadge score={signal.impactScore} />
                  </td>

                  {/* The ONE Repeated CTA */}
                  <td style={{ textAlign: 'right' }}>
                    <button
                      onClick={() => navigate('/stress-test')}
                      className={isHighImpact ? 'btn btn-danger' : 'btn btn-outline'}
                      style={{ padding: '0.3rem 0.65rem', fontSize: 'var(--text-caption)' }}
                      title="Simulate shock scenario for this event"
                    >
                      <Zap size={12} />
                      <span>Simulate Shock</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
