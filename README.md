# AI/NLP Financial Risk Engine & Strategic Portfolio Stress Testing - S&P Global & Crisil Campus Hackathon

**Candidate Name:** Mritunjay Senapati  
**College Email ID:** mritunjaysenapati.dev@gmail.com  
**College / Campus:** [Your College / Campus Name]  
**Demo Video Link:** [YouTube / Unlisted Demo Walkthrough Link]  
**Slide Deck Link (if hosted externally):** [docs/presentation.pdf](docs/presentation.pdf)  

---

## 1. Project Overview / Problem Statement & Approach

Financial institutions, credit rating agencies, and asset managers face a critical challenge: breaking news events, geopolitical conflicts, and regulatory crackdowns occur unpredictably and cascade rapidly across interconnected asset classes. Traditional quarterly or monthly stress tests are inherently reactive, lagging real-world market movements by weeks or months. Desk analysts cannot manually triage thousands of unstructured articles and social media signals in real time to quantify portfolio vulnerability.

To bridge this gap, we designed and built an **End-to-End AI/NLP Financial Risk Engine & Strategic Portfolio Stress Testing System** (Module B). The system ingests unstructured financial streams (from live GDELT 2.0 global news and Kaggle social feeds), performs contextual financial sentiment scoring (-1.0 to +1.0) using HuggingFace's `ProsusAI/FinBERT`, and maps headlines into a 7-tier financial event taxonomy (Geopolitical, Credit Event, Macroeconomic, Regulatory, Merger & Acquisition, Earnings, Product Launch).

A composite 1–10 Risk Impact Score is computed using an explainable multi-factor formula. Whenever a high-impact risk signal (`Impact Score >= 7`) is detected, the system **automatically triggers a strategic stress test** on a $585M institutional multi-asset portfolio (Loans, Bonds, Equities, Derivatives). The quantitative engine calculates first-order bond duration losses, corporate loan credit spread widenings, equity beta shocks, and commodity/FX derivative impacts—rendering interactive waterfall drawdowns, Value-at-Risk (VaR 95/99), and historical audit trails in real time.

---

## 2. Architecture & Tech Stack

The platform is designed as a distributed, containerized microservice ecosystem orchestrated via Docker Compose:

![System Architecture](docs/architecture.png)

### Key Frameworks, Databases & Libraries
- **Backend Core**: Java 21, Spring Boot 3.3.4, Spring Data JPA, Spring WebFlux (`WebClient`), HikariCP connection pooling.
- **NLP Microservice**: Python 3.11, FastAPI, HuggingFace Transformers (`ProsusAI/FinBERT`), PyTorch, Pandas.
- **Persistence Layer**: PostgreSQL 16 Alpine with relational schemas for portfolio assets, risk signals, and stress test audit trails (with zero-config H2 dev profile fallback).
- **Frontend Dashboard**: React 18, Vite 5, Recharts, Lucide Icons, Vanilla CSS design system with institutional dark theme and React Error Boundaries.
- **DevOps & Infrastructure**: Docker, Docker Compose, Nginx reverse proxy, multi-stage cached builds, bridge networking (`risk-network`).

---

## 3. Dataset Used

All data used in this prototype is publicly available or synthetically generated in accordance with hackathon submission guidelines (no proprietary client data):

1. **Synthetic Multi-Asset Portfolio (`data/synthetic_portfolio.json`)**:
   - 15 institutional assets with a total notional value of **$585.0M**.
   - Spans 4 core asset classes: **Bonds** ($220M - US Treasuries, Apple corporate bonds, UK Gilts, Brazil/India sovereigns), **Loans** ($110M - JPMorgan Term Loan, Goldman Sachs Facilities), **Equities** ($75M - Tesla, NVIDIA, Microsoft, Vanguard REIT ETF), and **Derivatives** ($180M - S&P 500 futures, EUR/USD forwards, Crude Oil swaps, Deutsche Bank CDS).
2. **Standard Shock Scenarios (`data/shock_scenarios.json`)**:
   - 7 institutional shock matrices modeling simultaneous shocks to Equity markets, Interest Rates (+bps), Credit Spreads (+bps), FX currencies, and Commodities.
3. **Curated Financial News Headlines (`data/sample_news.json`)**:
   - Structured macroeconomic and geopolitical events used for cold-start demo validation.
4. **Kaggle Financial Tweet Corpus (`data/sample_tweets.csv`)**:
   - Social sentiment dataset reflecting corporate credit events, rate speculation, and market sentiment.

---

## 4. Quickstart & Installation

**Runtime Requirements:** Docker & Docker Compose (or Java 21, Node 20+, Python 3.11+ for native local execution).  
**Tested Operating Systems:** Windows 11, Linux (Ubuntu 22.04), macOS.

### Option A: Standard Docker Compose (Recommended)
From the repository root, start all 4 services with a single command:
```bash
docker compose up --build
```
Once booted, access the services:
- **Frontend SPA Dashboard**: `http://localhost:5173`
- **Spring Boot REST API**: `http://localhost:8080/api`
- **FastAPI NLP Engine & Swagger Docs**: `http://localhost:8000/docs`
- **PostgreSQL Database**: `localhost:5432` (db: `riskengine`, user: `admin`, pass: `admin123`)

### Option B: Local Development Execution

1. **Start Python NLP Service**:
   ```bash
   cd src/nlp-service
   pip install -r requirements.txt
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```

2. **Start Spring Boot Backend** (Zero-config H2 profile):
   ```bash
   cd src/backend
   ./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
   ```

3. **Start React Frontend**:
   ```bash
   cd src/frontend
   
   npm install
   npm run dev
   ```

---

## 5. Key Results & Domain Impact

- **End-to-End Pipeline Automation**: Live text ingestion automatically routes to FinBERT, maps to event taxonomies, and triggers portfolio stress testing in `< 80ms`.
- **Accurate Multi-Asset Drawdown Modeling**: Simulating a severe Geopolitical Crisis on the $585M portfolio results in an immediate **-$55.44M (-9.48%) drawdown**, accurately identifying the US Treasury 10Y as the worst-hit asset (-$16.36M) due to yield spike duration impact.
- **Auditability & Explainability**: Unlike black-box models, every calculation provides complete traceability: extracted entities, token distribution, scenario parameters, and per-asset PnL breakdowns.
- **Resilience & Production Hardening**: 18/18 integration tests passing, tuned HikariCP connection pooling, open-in-view disabled, and React Error Boundaries protecting mission-critical trader views.
