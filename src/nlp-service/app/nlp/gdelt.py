import json
import logging
from typing import List, Dict, Any, Optional
from urllib.parse import quote_plus
from app.config import settings
from app.models.schemas import AnalysisResponse, SentimentDistribution
from app.nlp.sentiment import sentiment_analyzer
from app.nlp.classifier import event_classifier
from app.nlp.impact import impact_calculator

logger = logging.getLogger("riskengine.gdelt")

GDELT_DOC_API_URL = "https://api.gdeltproject.org/api/v2/doc/doc"


class GdeltFetcher:
    """
    Fetches real-time financial and macro news from the GDELT 2.0 Document API
    and processes each article through the NLP risk analysis pipeline.
    Includes seamless local fallback for offline/air-gapped resilience.
    """

    def __init__(self, timeout_seconds: int = 5):
        self.timeout_seconds = timeout_seconds

    def fetch_and_analyze(
        self,
        query: str = "financial crisis OR interest rate OR default",
        days: int = 1,
        max_records: int = 10
    ) -> List[AnalysisResponse]:
        """
        Fetches GDELT articles and scores them through the NLP risk engine.
        Falls back to curated sample_news.json if GDELT API is unreachable.
        """
        raw_articles = self._fetch_gdelt_raw(query, days, max_records)
        if not raw_articles:
            logger.info("Using local curated news data as fallback for query '%s'...", query)
            raw_articles = self._load_fallback_news(max_records)

        analyzed: List[AnalysisResponse] = []
        for item in raw_articles:
            text = item.get("title") or item.get("rawText") or item.get("text", "")
            if not text or not text.strip():
                continue

            entity = item.get("entity")

            sent_res = sentiment_analyzer.analyze(text)
            sent_score = sent_res["sentiment_score"]
            distribution = SentimentDistribution(**sent_res["distribution"])

            event_type, confidence, matched_kws = event_classifier.classify(text)
            entities = event_classifier.extract_entities(text)
            if entity and entity not in entities:
                entities.insert(0, entity)

            impact_score = impact_calculator.calculate(
                sentiment_score=sent_score,
                event_type=event_type,
                source="GDELT",
                confidence=confidence
            )

            analyzed.append(AnalysisResponse(
                sentiment_score=sent_score,
                sentiment_label=sent_res["sentiment_label"],
                event_type=event_type,
                impact_score=impact_score,
                confidence=confidence,
                entities=entities,
                raw_text=text,
                source="GDELT",
                stress_test_suggested=impact_calculator.should_trigger_stress_test(impact_score),
                distribution=distribution
            ))

        return analyzed

    def _fetch_gdelt_raw(self, query: str, days: int, max_records: int) -> List[Dict[str, Any]]:
        """Queries the live GDELT 2.0 API."""
        import urllib.request
        import urllib.error

        encoded_query = quote_plus(query)
        timespan = f"{days}d" if days > 0 else "1d"
        url = f"{GDELT_DOC_API_URL}?query={encoded_query}&mode=artlist&format=json&maxrecords={max_records}&timespan={timespan}"

        try:
            logger.info("Querying GDELT API: %s", url)
            req = urllib.request.Request(
                url,
                headers={"User-Agent": "Mozilla/5.0 (compatible; RiskEngineBot/1.0)"}
            )
            with urllib.request.urlopen(req, timeout=self.timeout_seconds) as response:
                if response.status == 200:
                    payload = json.loads(response.read().decode("utf-8"))
                    articles = payload.get("articles", [])
                    logger.info("Retrieved %d articles from GDELT.", len(articles))
                    return articles
        except Exception as exc:
            logger.warning("GDELT API live fetch failed or timed out: %s. Using local fallback.", str(exc))

        return []

    def _load_fallback_news(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Loads curated sample news from data directory."""
        data_dir = settings.resolve_data_dir()
        sample_path = data_dir / "sample_news.json"
        if sample_path.exists():
            try:
                with open(sample_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    return data[:limit]
            except Exception as e:
                logger.error("Error reading sample_news.json: %s", str(e))

        # Built-in synthetic fallback if file not on disk
        return [
            {
                "title": "Federal Reserve Chair signals aggressive interest rate hike as inflation surges",
                "entity": "Federal Reserve"
            },
            {
                "title": "Major sovereign developer defaults on offshore credit debt obligations",
                "entity": "Global Property Group"
            },
            {
                "title": "Geopolitical border conflict escalates trade sanctions on strategic commodities",
                "entity": "Central Banks"
            }
        ][:limit]


gdelt_fetcher = GdeltFetcher()
