import csv
import logging
from pathlib import Path
from typing import List, Optional
from app.config import settings
from app.models.schemas import (
    TweetRecordResponse,
    AnalysisResponse,
    SentimentDistribution
)
from app.nlp.sentiment import sentiment_analyzer
from app.nlp.classifier import event_classifier
from app.nlp.impact import impact_calculator

logger = logging.getLogger("riskengine.tweets")


class TweetLoader:
    """
    Loads financial tweets from Kaggle/sample CSV datasets and executes
    batch sentiment analysis, event tagging, and impact scoring.
    """

    def resolve_csv_path(self, custom_path: Optional[str] = None) -> Optional[Path]:
        """Resolves target CSV location."""
        if custom_path:
            p = Path(custom_path)
            if p.exists() and p.is_file():
                return p

        # Check candidate locations
        data_dir = settings.resolve_data_dir()
        candidates = [
            data_dir / "sample_tweets.csv",
            data_dir / "tweets.csv",
            Path("data/sample_tweets.csv"),
            Path("../data/sample_tweets.csv"),
            Path("/app/data/sample_tweets.csv"),
            Path("/app/data/tweets.csv")
        ]
        for c in candidates:
            if c.exists() and c.is_file():
                return c
        return None

    def load_and_analyze(
        self,
        file_path: Optional[str] = None,
        limit: int = 100
    ) -> List[TweetRecordResponse]:
        """Reads CSV file and processes rows through NLP risk pipeline."""
        target_path = self.resolve_csv_path(file_path)
        if not target_path:
            logger.warning("No tweet CSV file found. Returning synthetic sample tweets.")
            return self._fallback_synthetic_tweets(limit)

        records: List[TweetRecordResponse] = []
        try:
            with open(target_path, "r", encoding="utf-8", errors="replace") as f:
                reader = csv.DictReader(f)
                count = 0
                for row in reader:
                    if count >= limit:
                        break

                    text = (
                        row.get("text") or
                        row.get("tweet") or
                        row.get("rawText") or
                        row.get("content") or
                        ""
                    ).strip()

                    if not text:
                        continue

                    tweet_id = str(row.get("tweet_id") or row.get("id") or f"tw-{count+1}")
                    ticker = row.get("ticker") or row.get("symbol") or row.get("entity")
                    timestamp = row.get("timestamp") or row.get("date") or row.get("created_at")
                    try:
                        retweets = int(row.get("retweet_count") or row.get("retweets") or 0)
                    except ValueError:
                        retweets = 0
                    try:
                        likes = int(row.get("like_count") or row.get("likes") or 0)
                    except ValueError:
                        likes = 0

                    # NLP Processing
                    sent_res = sentiment_analyzer.analyze(text)
                    sent_score = sent_res["sentiment_score"]
                    distribution = SentimentDistribution(**sent_res["distribution"])

                    event_type, confidence, matched_kws = event_classifier.classify(text)
                    extracted_entities = event_classifier.extract_entities(text)
                    if ticker and ticker not in extracted_entities:
                        extracted_entities.insert(0, ticker)

                    impact_score = impact_calculator.calculate(
                        sentiment_score=sent_score,
                        event_type=event_type,
                        source="TWITTER",
                        confidence=confidence
                    )

                    analysis = AnalysisResponse(
                        sentiment_score=sent_score,
                        sentiment_label=sent_res["sentiment_label"],
                        event_type=event_type,
                        impact_score=impact_score,
                        confidence=confidence,
                        entities=extracted_entities,
                        raw_text=text,
                        source="TWITTER",
                        stress_test_suggested=impact_calculator.should_trigger_stress_test(impact_score),
                        distribution=distribution
                    )

                    records.append(TweetRecordResponse(
                        tweet_id=tweet_id,
                        ticker=ticker,
                        timestamp=timestamp,
                        text=text,
                        retweet_count=retweets,
                        like_count=likes,
                        analysis=analysis
                    ))
                    count += 1

            logger.info("Successfully loaded and analyzed %d tweets from %s", len(records), target_path)
            return records
        except Exception as exc:
            logger.error("Failed to read tweets CSV (%s): %s", target_path, str(exc))
            return self._fallback_synthetic_tweets(limit)

    def _fallback_synthetic_tweets(self, limit: int) -> List[TweetRecordResponse]:
        """Provides instant fallback if CSV is absent."""
        samples = [
            ("1001", "JPM", "Breaking: JPMorgan discusses emergency liquidity backstop as debt spreads spike.", 1400, 5000),
            ("1002", "TSLA", "Tesla announces massive new Gigafactory battery launch and automated robotaxi.", 900, 4200),
            ("1003", "NVDA", "NVIDIA reports stellar quarterly earnings beat! EPS +45% YoY and record guidance.", 2500, 12000),
            ("1004", "SPY", "Fed rate hike expectations jump to 92% following core inflation release.", 3100, 7400),
            ("1005", "AAPL", "Apple faces stringent European regulatory scrutiny and compliance fines.", 670, 2900)
        ]
        results = []
        for tid, ticker, text, rts, likes in samples[:limit]:
            sent_res = sentiment_analyzer.analyze(text)
            event_type, conf, _ = event_classifier.classify(text)
            impact = impact_calculator.calculate(sent_res["sentiment_score"], event_type, "TWITTER", conf)
            results.append(TweetRecordResponse(
                tweet_id=tid,
                ticker=ticker,
                timestamp="2026-09-30 12:00:00",
                text=text,
                retweet_count=rts,
                like_count=likes,
                analysis=AnalysisResponse(
                    sentiment_score=sent_res["sentiment_score"],
                    sentiment_label=sent_res["sentiment_label"],
                    event_type=event_type,
                    impact_score=impact,
                    confidence=conf,
                    entities=[ticker],
                    raw_text=text,
                    source="TWITTER",
                    stress_test_suggested=impact >= 7,
                    distribution=SentimentDistribution(**sent_res["distribution"])
                )
            ))
        return results


tweet_loader = TweetLoader()
