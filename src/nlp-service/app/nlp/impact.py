import logging
from typing import Optional, Dict
from app.config import settings

logger = logging.getLogger("riskengine.impact")

# Standard CRISIL / S&P Hackathon event severity weights
EVENT_SEVERITY_WEIGHTS: Dict[str, float] = {
    "GEOPOLITICAL": 0.90,
    "CREDIT_EVENT": 0.85,
    "MACROECONOMIC": 0.80,
    "REGULATORY": 0.60,
    "MERGER_ACQUISITION": 0.50,
    "EARNINGS": 0.40,
    "PRODUCT_LAUNCH": 0.30
}

# Credibility weights by data source
SOURCE_WEIGHTS: Dict[str, float] = {
    "GDELT": 1.00,
    "NEWS": 1.00,
    "BLOOMBERG": 1.00,
    "REUTERS": 1.00,
    "CUSTOM": 0.80,
    "TWITTER": 0.70,
    "TWEET": 0.70,
    "SOCIAL": 0.65
}


class ImpactCalculator:
    """
    Composite risk impact score calculator (1-10 integer scale)
    based on financial sentiment magnitude, event severity, and source credibility.
    """

    def __init__(self, high_impact_threshold: Optional[int] = None):
        self.high_impact_threshold = high_impact_threshold or settings.high_impact_threshold

    def calculate(
        self,
        sentiment_score: float,
        event_type: str,
        source: str = "CUSTOM",
        confidence: float = 1.0
    ) -> int:
        """
        Calculates composite impact score on 1-10 scale.
        Formula:
            raw = (0.35 * |sentiment| * 10) + (0.35 * event_severity * 10) + (0.30 * source_credibility * 10)
        """
        abs_sent = min(1.0, max(0.0, abs(sentiment_score)))
        severity = EVENT_SEVERITY_WEIGHTS.get(event_type.upper(), 0.50)

        source_upper = source.upper() if source else "CUSTOM"
        source_weight = SOURCE_WEIGHTS.get(source_upper, 0.75)

        # Confidence modulation factor (slight dampening if confidence is low)
        conf_mod = 0.85 + 0.15 * min(1.0, max(0.0, confidence))

        raw_score = (
            (0.35 * abs_sent * 10.0) +
            (0.35 * severity * 10.0) +
            (0.30 * source_weight * 10.0)
        ) * conf_mod

        impact = int(max(1, min(10, round(raw_score))))
        return impact

    def should_trigger_stress_test(self, impact_score: int) -> bool:
        """Determines if the risk signal warrants an immediate portfolio stress test (>= 7)."""
        return impact_score >= self.high_impact_threshold


impact_calculator = ImpactCalculator()
