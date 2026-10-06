import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('[ErrorBoundary] Caught runtime exception in component tree:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          style={{
            minHeight: '400px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            width: '100%',
          }}
        >
          <div
            style={{
              maxWidth: '650px',
              width: '100%',
              backgroundColor: 'var(--bg-card, #131722)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '12px',
              padding: '2rem',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(239, 68, 68, 0.1)',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(239, 68, 68, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ef4444',
                  fontSize: 'var(--text-h2)',
                  lineHeight: 'var(--leading-none)',
                  fontWeight: 'bold',
                }}
              >
                !
              </div>
              <div>
                <h3
                  style={{
                    margin: 0,
                    fontSize: 'var(--text-h2)',
                    lineHeight: 'var(--leading-snug)',
                    letterSpacing: 'var(--tracking-tighter)',
                    fontWeight: 700,
                    color: '#ffffff',
                    fontFamily: 'var(--font-sans)',
                  }}
                >
                  Application View Error
                </h3>
                <p
                  style={{
                    margin: 0,
                    fontSize: 'var(--text-caption)',
                    lineHeight: 'var(--leading-relaxed)',
                    letterSpacing: 'var(--tracking-normal)',
                    color: 'var(--text-secondary, #94a3b8)',
                  }}
                >
                  An unexpected exception was intercepted by the risk UI error boundary.
                </p>
              </div>
            </div>

            {/* Error Message */}
            <div
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
                borderRadius: '8px',
                padding: '1rem',
                margin: '1.25rem 0',
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-body-sm)',
                lineHeight: 'var(--leading-normal)',
                letterSpacing: 'var(--tracking-normal)',
                color: '#f87171',
                wordBreak: 'break-word',
              }}
            >
              {this.state.error?.toString() || 'Unknown runtime error'}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={this.handleReset}
                style={{
                  backgroundColor: '#6366f1',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0.6rem 1.25rem',
                  fontSize: 'var(--text-body-sm)',
                  lineHeight: 'var(--leading-none)',
                  letterSpacing: 'var(--tracking-wide)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
                onMouseOver={(e) => (e.target.style.backgroundColor = '#4f46e5')}
                onMouseOut={(e) => (e.target.style.backgroundColor = '#6366f1')}
              >
                Recover View
              </button>
              <button
                onClick={this.handleReload}
                style={{
                  backgroundColor: 'transparent',
                  color: 'var(--text-secondary, #94a3b8)',
                  border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.15))',
                  borderRadius: '6px',
                  padding: '0.6rem 1.25rem',
                  fontSize: 'var(--text-body-sm)',
                  lineHeight: 'var(--leading-none)',
                  letterSpacing: 'var(--tracking-wide)',
                  cursor: 'pointer',
                }}
              >
                Reload Window
              </button>
              <button
                onClick={() => this.setState((prev) => ({ showDetails: !prev.showDetails }))}
                style={{
                  backgroundColor: 'transparent',
                  color: 'var(--text-muted, #64748b)',
                  border: 'none',
                  fontSize: 'var(--text-caption)',
                  lineHeight: 'var(--leading-none)',
                  letterSpacing: 'var(--tracking-normal)',
                  cursor: 'pointer',
                  marginLeft: 'auto',
                  textDecoration: 'underline',
                }}
              >
                {this.state.showDetails ? 'Hide Stack Trace' : 'Show Stack Trace'}
              </button>
            </div>

            {/* Collapsible Stack Trace */}
            {this.state.showDetails && this.state.errorInfo && (
              <pre
                style={{
                  marginTop: '1.25rem',
                  padding: '0.85rem',
                  backgroundColor: '#0a0d14',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: '6px',
                  fontSize: 'var(--text-caption)',
                  lineHeight: 'var(--leading-relaxed)',
                  letterSpacing: 'var(--tracking-normal)',
                  color: '#94a3b8',
                  maxHeight: '200px',
                  overflowY: 'auto',
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {this.state.errorInfo.componentStack}
              </pre>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
