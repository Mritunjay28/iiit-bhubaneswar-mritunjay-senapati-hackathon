import logging
import re
from typing import Dict, List, Any, Optional
from app.config import settings

logger = logging.getLogger("riskengine.sentiment")

# Financial domain lexicon for resilient fallback sentiment scoring
FINANCIAL_POSITIVE_LEXICON = {
    "beat": 0.8, "profit": 0.75, "record": 0.7, "growth": 0.65, "surge": 0.75,
    "jump": 0.6, "rebound": 0.65, "gain": 0.6, "strong": 0.55, "outperform": 0.85,
    "upgrade": 0.8, "bullish": 0.8, "expansion": 0.6, "rally": 0.7, "dividend": 0.5,
    "breakthrough": 0.75, "innovative": 0.6, "soar": 0.8, "higher": 0.4, "success": 0.65
}

FINANCIAL_NEGATIVE_LEXICON = {
    "default": 0.95, "bankruptcy": 0.95, "crisis": 0.9, "recession": 0.85, "inflation": 0.7,
    "downgrade": 0.85, "decline": 0.6, "loss": 0.75, "drop": 0.6, "plunge": 0.85,
    "slump": 0.75, "crash": 0.9, "sanction": 0.8, "sanctions": 0.85, "tariffs": 0.7, "tariff": 0.7,
    "war": 0.9, "conflict": 0.8, "investigation": 0.7, "fine": 0.75, "penalty": 0.75, "scrutiny": 0.65,
    "antitrust": 0.7, "debt": 0.6, "distressed": 0.85, "liquidity": 0.65, "hike": 0.55,
    "military": 0.8, "escalation": 0.85, "embargo": 0.85, "missile": 0.85, "strikes": 0.8, "strike": 0.75
}


class SentimentAnalyzer:
    """
    Financial sentiment analyzer powered by ProsusAI/finbert with a high-fidelity
    lexical fallback for resilience and offline support.
    """

    def __init__(self, model_name: Optional[str] = None):
        self.model_name = model_name or settings.model_name
        self.pipe = None
        self.is_loaded = False
        self.is_fallback = False

    def load_model(self) -> bool:
        """Attempts to load FinBERT pipeline via HuggingFace Transformers."""
        try:
            logger.info("Loading FinBERT model from '%s'...", self.model_name)
            from transformers import AutoTokenizer, AutoModelForSequenceClassification, pipeline
            import torch

            device = 0 if torch.cuda.is_available() and settings.device == "cuda" else -1

            self.pipe = pipeline(
                "sentiment-analysis",
                model=self.model_name,
                tokenizer=self.model_name,
                top_k=None,
                device=device,
                truncation=True,
                max_length=512
            )
            self.is_loaded = True
            self.is_fallback = False
            logger.info("FinBERT model '%s' successfully loaded on device '%s'.", self.model_name, device)
            return True
        except Exception as exc:
            logger.warning(
                "Could not load HuggingFace FinBERT model (%s). Activating resilient financial lexicon fallback engine.",
                str(exc)
            )
            self.is_loaded = True
            self.is_fallback = True
            return False

    def analyze(self, text: str) -> Dict[str, Any]:
        """
        Analyzes financial sentiment of input text.
        Returns:
            dict containing sentiment_score (-1.0 to 1.0), dominant label,
            and class probability distribution.
        """
        if not text or not text.strip():
            return {
                "sentiment_score": 0.0,
                "sentiment_label": "neutral",
                "distribution": {"positive": 0.0, "negative": 0.0, "neutral": 1.0},
                "model": self.model_name if not self.is_fallback else "finbert-lexicon-fallback",
                "is_fallback": self.is_fallback
            }

        if self.is_loaded and not self.is_fallback and self.pipe is not None:
            try:
                # Truncate text to 512 chars/tokens for safety
                raw_results = self.pipe(text[:512], top_k=None)
                if isinstance(raw_results, list) and len(raw_results) > 0 and isinstance(raw_results[0], list):
                    raw_results = raw_results[0]
                # FinBERT returns labels: positive, negative, neutral
                scores = {r["label"].lower(): float(r["score"]) for r in raw_results}
                pos = scores.get("positive", 0.0)
                neg = scores.get("negative", 0.0)
                neu = scores.get("neutral", 0.0)

                # Net score bounded between -1.0 and 1.0
                net_score = round(max(-1.0, min(1.0, pos - neg)), 4)
                dominant = max(scores, key=scores.get)

                return {
                    "sentiment_score": net_score,
                    "sentiment_label": dominant,
                    "distribution": {
                        "positive": round(pos, 4),
                        "negative": round(neg, 4),
                        "neutral": round(neu, 4)
                    },
                    "model": self.model_name,
                    "is_fallback": False
                }
            except Exception as e:
                logger.warning("FinBERT inference failed: %s. Using lexical fallback.", str(e))

        # Lexical financial fallback
        return self._lexical_analyze(text)

    def analyze_batch(self, texts: List[str]) -> List[Dict[str, Any]]:
        """High-throughput batch analysis supporting native FinBERT pipeline batching."""
        if not texts:
            return []

        if self.is_loaded and not self.is_fallback and self.pipe is not None:
            try:
                truncated_texts = [t[:512] if t else "" for t in texts]
                batch_results = self.pipe(truncated_texts, batch_size=16, top_k=None)
                outputs = []
                for res in batch_results:
                    scores = {r["label"].lower(): float(r["score"]) for r in res}
                    pos = scores.get("positive", 0.0)
                    neg = scores.get("negative", 0.0)
                    neu = scores.get("neutral", 0.0)
                    net_score = round(max(-1.0, min(1.0, pos - neg)), 4)
                    dominant = max(scores, key=scores.get)
                    outputs.append({
                        "sentiment_score": net_score,
                        "sentiment_label": dominant,
                        "distribution": {
                            "positive": round(pos, 4),
                            "negative": round(neg, 4),
                            "neutral": round(neu, 4)
                        },
                        "model": self.model_name,
                        "is_fallback": False
                    })
                return outputs
            except Exception as e:
                logger.warning("FinBERT batch inference error: %s. Reverting to sequential lexical pass.", str(e))

        return [self.analyze(t) for t in texts]

    def _lexical_analyze(self, text: str) -> Dict[str, Any]:
        """High-precision financial lexicon sentiment scorer."""
        cleaned = re.sub(r"[^\w\s]", " ", text.lower())
        words = cleaned.split()

        pos_score = sum(FINANCIAL_POSITIVE_LEXICON[w] for w in words if w in FINANCIAL_POSITIVE_LEXICON)
        neg_score = sum(FINANCIAL_NEGATIVE_LEXICON[w] for w in words if w in FINANCIAL_NEGATIVE_LEXICON)

        total_weight = pos_score + neg_score
        if total_weight == 0:
            return {
                "sentiment_score": 0.0,
                "sentiment_label": "neutral",
                "distribution": {"positive": 0.1, "negative": 0.1, "neutral": 0.8},
                "model": "finbert-lexicon-fallback",
                "is_fallback": True
            }

        raw_net = (pos_score - neg_score) / max(total_weight, 1.0)
        net_score = round(max(-1.0, min(1.0, raw_net)), 4)

        norm_pos = round(pos_score / (pos_score + neg_score + 1.0), 4)
        norm_neg = round(neg_score / (pos_score + neg_score + 1.0), 4)
        norm_neu = round(max(0.0, 1.0 - (norm_pos + norm_neg)), 4)

        if net_score > 0.15:
            label = "positive"
        elif net_score < -0.15:
            label = "negative"
        else:
            label = "neutral"

        return {
            "sentiment_score": net_score,
            "sentiment_label": label,
            "distribution": {
                "positive": norm_pos,
                "negative": norm_neg,
                "neutral": norm_neu
            },
            "model": "finbert-lexicon-fallback",
            "is_fallback": True
        }


# Global singleton instance
sentiment_analyzer = SentimentAnalyzer()
