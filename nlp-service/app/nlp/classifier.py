import re
import logging
from typing import Dict, List, Tuple, Set, Optional

logger = logging.getLogger("riskengine.classifier")

EVENT_TAXONOMY: Dict[str, List[str]] = {
    "GEOPOLITICAL": [
        "geopolitical", "war", "sanction", "sanctions", "tariff", "tariffs",
        "invasion", "conflict", "diplomacy", "military", "strait", "straits",
        "blockade", "embargo", "tensions", "sovereign accounts", "border conflict",
        "geopolitical tensions", "trade war"
    ],
    "MACROECONOMIC": [
        "interest rate", "rate hike", "rate cut", "inflation", "cpi", "gdp",
        "recession", "fed", "federal reserve", "central bank", "central banks",
        "unemployment", "monetary policy", "yield curve", "liquidity",
        "macro downturn", "stagflation", "stimulus", "tightening"
    ],
    "CREDIT_EVENT": [
        "default", "defaults", "downgrade", "downgrades", "bankruptcy",
        "debt crisis", "restructuring", "credit default", "credit spread",
        "spread spike", "liquidity backstop", "insolvency", "distressed debt",
        "cds", "credit facilities", "debt obligations", "credit crunch"
    ],
    "MERGER_ACQUISITION": [
        "merger", "acquisition", "takeover", "buyout", "deal", "stake",
        "acquired", "amalgamation", "consolidation", "all-cash transaction",
        "purchase agreement", "strategic stake", "mega-deal"
    ],
    "PRODUCT_LAUNCH": [
        "launch", "launches", "release", "unveil", "unveils", "new product",
        "innovation", "hardware", "gigafactory", "breakthrough", "robotaxi",
        "product showcase", "announces massive new", "next-generation"
    ],
    "REGULATORY": [
        "regulation", "regulatory", "compliance", "fine", "fines", "penalty",
        "penalties", "sec", "antitrust", "doj", "ftc", "scrutiny", "probe",
        "investigation", "enforcement", "subpoena", "watchdogs", "capital requirements"
    ],
    "EARNINGS": [
        "earnings", "revenue", "profit", "quarterly", "eps", "guidance",
        "earnings beat", "earnings miss", "margin", "fiscal", "ebitda",
        "sales beat", "dividend", "financial results"
    ]
}

# Recognized financial entities and ticker symbols
KNOWN_ENTITIES = {
    "Federal Reserve": ["federal reserve", "fed", "central bank", "chair powell"],
    "US Treasury": ["us treasury", "treasury"],
    "JPMorgan": ["jpmorgan", "jpm", "jp morgan"],
    "Tesla": ["tesla", "tsla"],
    "NVIDIA": ["nvidia", "nvda"],
    "Apple": ["apple", "aapl"],
    "Microsoft": ["microsoft", "msft"],
    "Deutsche Bank": ["deutsche bank", "db"],
    "Goldman Sachs": ["goldman sachs", "goldman"],
    "S&P 500": ["s&p 500", "s&p", "spy", "wall street"],
    "DOJ & FTC": ["doj", "ftc", "antitrust watchdogs"],
    "Crude Oil": ["crude oil", "uso", "oil swap"]
}

TICKER_SET = {"JPM", "TSLA", "NVDA", "AAPL", "MSFT", "SPY", "USO", "DB", "GOOG", "AMZN", "META"}


class EventClassifier:
    """
    Deterministic, explainable keyword taxonomy event classifier for financial text.
    Classifies into 7 standard risk categories and extracts entities/tickers.
    """

    def __init__(self, taxonomy: Optional[Dict[str, List[str]]] = None):
        self.taxonomy = taxonomy or EVENT_TAXONOMY

    def classify(self, text: str) -> Tuple[str, float, List[str]]:
        """
        Classifies input text into one of the standard EventType categories.
        Returns:
            Tuple of (event_type, confidence, matched_keywords)
        """
        if not text or not text.strip():
            return "MACROECONOMIC", 0.5, []

        text_lower = text.lower()
        category_scores: Dict[str, float] = {}
        matched_by_cat: Dict[str, List[str]] = {}

        for category, keywords in self.taxonomy.items():
            cat_score = 0.0
            matched = []
            for kw in keywords:
                # Give higher weight to exact multi-word phrase matches
                if " " in kw:
                    pattern = r"\b" + re.escape(kw) + r"\b"
                    count = len(re.findall(pattern, text_lower))
                    if count > 0:
                        cat_score += count * 2.5
                        matched.append(kw)
                else:
                    pattern = r"\b" + re.escape(kw) + r"\b"
                    count = len(re.findall(pattern, text_lower))
                    if count > 0:
                        cat_score += count * 1.0
                        matched.append(kw)

            if cat_score > 0:
                category_scores[category] = cat_score
                matched_by_cat[category] = matched

        if not category_scores:
            # Fallback to MACROECONOMIC with low baseline confidence
            return "MACROECONOMIC", 0.5, []

        best_category = max(category_scores, key=category_scores.get)
        best_score = category_scores[best_category]
        total_score = sum(category_scores.values())

        # Confidence: ratio bounded between 0.60 and 0.98
        ratio = best_score / total_score
        confidence = round(min(0.98, max(0.60, 0.5 + 0.5 * ratio)), 4)

        return best_category, confidence, matched_by_cat.get(best_category, [])

    def extract_entities(self, text: str) -> List[str]:
        """Extracts recognized financial entities and tickers from text."""
        if not text:
            return []

        found_entities: Set[str] = set()

        # Check for explicit ticker mentions (e.g. $AAPL or standalone AAPL)
        words = re.findall(r"\b[A-Z]{2,5}\b", text)
        for w in words:
            if w in TICKER_SET:
                found_entities.add(w)

        dollar_tickers = re.findall(r"\$([A-Za-z]{2,5})\b", text)
        for dt in dollar_tickers:
            found_entities.add(dt.upper())

        # Check known entities
        text_lower = text.lower()
        for canonical_name, aliases in KNOWN_ENTITIES.items():
            for alias in aliases:
                pattern = r"\b" + re.escape(alias) + r"\b"
                if re.search(pattern, text_lower):
                    found_entities.add(canonical_name)
                    break

        return sorted(list(found_entities))


event_classifier = EventClassifier()
