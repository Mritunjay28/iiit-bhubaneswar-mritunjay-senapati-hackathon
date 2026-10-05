import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { Dashboard } from './pages/Dashboard';
import { StressTest } from './pages/StressTest';
import { RiskSignals } from './pages/RiskSignals';
import { Portfolio } from './pages/Portfolio';
import { History } from './pages/History';

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route
              path="/"
              element={
                <ErrorBoundary>
                  <Dashboard />
                </ErrorBoundary>
              }
            />
            <Route
              path="/stress-test"
              element={
                <ErrorBoundary>
                  <StressTest />
                </ErrorBoundary>
              }
            />
            <Route
              path="/signals"
              element={
                <ErrorBoundary>
                  <RiskSignals />
                </ErrorBoundary>
              }
            />
            <Route
              path="/portfolio"
              element={
                <ErrorBoundary>
                  <Portfolio />
                </ErrorBoundary>
              }
            />
            <Route
              path="/history"
              element={
                <ErrorBoundary>
                  <History />
                </ErrorBoundary>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
