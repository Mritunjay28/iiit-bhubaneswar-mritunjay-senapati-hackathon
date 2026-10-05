"""
Unit tests for NLP service components:
- Event classifier (keyword taxonomy & entity extraction)
- Impact calculator (composite 1-10 scoring & auto-trigger rules)
- Sentiment analyzer (lexical fallback scoring)
"""

from app.nlp.classifier import event_classifier
from app.nlp.impact import impact_calculator
from app.nlp.sentiment import sentiment_analyzer


def test_event_classification():
    # Geopolitical
    ev, conf, kws = event_classifier.classify("War sanctions escalate military tensions in eastern Europe.")
    assert ev == "GEOPOLITICAL", f"Expected GEOPOLITICAL, got {ev}"

    # Credit Event
    ev, conf, kws = event_classifier.classify("Corporate default and debt crisis causes credit rating downgrade.")
    assert ev == "CREDIT_EVENT", f"Expected CREDIT_EVENT, got {ev}"

    # Macroeconomic
    ev, conf, kws = event_classifier.classify("Central bank signals interest rate hike amid persistent inflation.")
    assert ev == "MACROECONOMIC", f"Expected MACROECONOMIC, got {ev}"


def test_impact_score_calculation():
    # Severe negative geopolitical event on GDELT -> Impact score >= 7 (auto-trigger)
    score = impact_calculator.calculate(
        sentiment_score=-0.85,
        event_type="GEOPOLITICAL",
        source="GDELT"
    )
    assert score >= 7, f"Expected impact >= 7, got {score}"
    assert impact_calculator.should_trigger_stress_test(score) is True

    # Mild positive earnings release on Twitter -> Impact score < 7 (no auto-trigger)
    score_low = impact_calculator.calculate(
        sentiment_score=0.25,
        event_type="EARNINGS",
        source="TWITTER"
    )
    assert score_low < 7, f"Expected impact < 7, got {score_low}"
    assert impact_calculator.should_trigger_stress_test(score_low) is False


def test_lexical_sentiment_scoring():
    res_neg = sentiment_analyzer.analyze("Company reports catastrophic loss and bankruptcy default.")
    assert res_neg["sentiment_score"] < 0, f"Expected negative score, got {res_neg['sentiment_score']}"

    res_pos = sentiment_analyzer.analyze("Record growth and surging quarterly profit beat all expectations.")
    assert res_pos["sentiment_score"] > 0, f"Expected positive score, got {res_pos['sentiment_score']}"


if __name__ == "__main__":
    test_event_classification()
    test_impact_score_calculation()
    test_lexical_sentiment_scoring()
    print("All Python NLP tests passed successfully!")
