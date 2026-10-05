import logging
from typing import List, Optional
from fastapi import APIRouter, Request, HTTPException
from app.models.schemas import (
    AnalysisRequest,
    AnalysisResponse,
    BatchAnalysisRequest,
    BatchAnalysisResponse,
    SentimentDistribution
)
from app.nlp.sentiment import sentiment_analyzer
from app.nlp.classifier import event_classifier
from app.nlp.impact import impact_calculator

logger = logging.getLogger("riskengine.routers.analysis")

router = APIRouter(tags=["Sentiment & Risk Analysis"])

@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_text(request: AnalysisRequest, http_req: Request):
    """
    Performs full NLP risk pipeline on a single unstructured text:
    1. Financial sentiment scoring (-1.0 to 1.0) via FinBERT
    2. Deterministic keyword taxonomy event classification
    3. Composite risk impact score calculation (1-10 scale)
    4. Auto-trigger evaluation for portfolio stress test (impact >= 7)
    """
    if not request.text or not request.text.strip():
        raise HTTPException(status_code=400, detail="Input text cannot be empty")

    source = request.source or "CUSTOM"
    analyzer = getattr(http_req.app.state, "sentiment_analyzer", sentiment_analyzer)
    sent_result = analyzer.analyze(request.text)
    sent_score = sent_result["sentiment_score"]

    event_type, cls_confidence, matched_kws = event_classifier.classify(request.text)
    entities = event_classifier.extract_entities(request.text)
    if request.entity and request.entity not in entities:
        entities.insert(0, request.entity)

    impact_score = impact_calculator.calculate(
        sentiment_score=sent_score,
        event_type=event_type,
        source=source,
        confidence=cls_confidence
    )
    stress_test_suggested = impact_calculator.should_trigger_stress_test(impact_score)

    distribution = SentimentDistribution(**sent_result["distribution"])

    return AnalysisResponse(
        sentiment_score=sent_score,
        sentiment_label=sent_result["sentiment_label"],
        event_type=event_type,
        impact_score=impact_score,
        confidence=cls_confidence,
        entities=entities,
        raw_text=request.text,
        source=source,
        stress_test_suggested=stress_test_suggested,
        distribution=distribution
    )

@router.post("/analyze/batch", response_model=BatchAnalysisResponse)
async def analyze_batch(request: BatchAnalysisRequest, http_req: Request):
    """
    High-throughput batch sentiment analysis and event risk classification.
    """
    if not request.texts:
        raise HTTPException(status_code=400, detail="Texts list cannot be empty")

    source = request.source or "CUSTOM"
    analyzer = getattr(http_req.app.state, "sentiment_analyzer", sentiment_analyzer)
    results: List[AnalysisResponse] = []

    for text in request.texts:
        if not text or not text.strip():
            continue
        sent_result = analyzer.analyze(text)
        sent_score = sent_result["sentiment_score"]

        event_type, cls_confidence, matched_kws = event_classifier.classify(text)
        entities = event_classifier.extract_entities(text)

        impact_score = impact_calculator.calculate(
            sentiment_score=sent_score,
            event_type=event_type,
            source=source,
            confidence=cls_confidence
        )
        stress_test_suggested = impact_calculator.should_trigger_stress_test(impact_score)
        distribution = SentimentDistribution(**sent_result["distribution"])

        results.append(AnalysisResponse(
            sentiment_score=sent_score,
            sentiment_label=sent_result["sentiment_label"],
            event_type=event_type,
            impact_score=impact_score,
            confidence=cls_confidence,
            entities=entities,
            raw_text=text,
            source=source,
            stress_test_suggested=stress_test_suggested,
            distribution=distribution
        ))

    return BatchAnalysisResponse(
        total=len(results),
        results=results
    )
