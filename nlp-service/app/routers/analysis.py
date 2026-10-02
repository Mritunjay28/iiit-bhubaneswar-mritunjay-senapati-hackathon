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

logger = logging.getLogger("riskengine.routers.analysis")

router = APIRouter(tags=["Sentiment & Risk Analysis"])

@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_text(request: AnalysisRequest, http_req: Request):
    if not request.text or not request.text.strip():
        raise HTTPException(status_code=400, detail="Input text cannot be empty")

    analyzer = getattr(http_req.app.state, "sentiment_analyzer", sentiment_analyzer)
    sent_result = analyzer.analyze(request.text)
    sent_score = sent_result["sentiment_score"]
    impact_score = max(1, min(10, round(abs(sent_score) * 7 + 2)))
    distribution = SentimentDistribution(**sent_result["distribution"])
    entities = [request.entity] if request.entity else []

    return AnalysisResponse(
        sentiment_score=sent_score,
        sentiment_label=sent_result["sentiment_label"],
        event_type="MACROECONOMIC",
        impact_score=impact_score,
        confidence=round(max(sent_result["distribution"].values()), 4),
        entities=entities,
        raw_text=request.text,
        source=request.source or "CUSTOM",
        stress_test_suggested=impact_score >= 7,
        distribution=distribution
    )

@router.post("/analyze/batch", response_model=BatchAnalysisResponse)
async def analyze_batch(request: BatchAnalysisRequest, http_req: Request):
    if not request.texts:
        raise HTTPException(status_code=400, detail="Texts list cannot be empty")

    analyzer = getattr(http_req.app.state, "sentiment_analyzer", sentiment_analyzer)
    results: List[AnalysisResponse] = []
    for text in request.texts:
        if not text or not text.strip():
            continue
        sent_result = analyzer.analyze(text)
        sent_score = sent_result["sentiment_score"]
        impact_score = max(1, min(10, round(abs(sent_score) * 7 + 2)))
        distribution = SentimentDistribution(**sent_result["distribution"])
        results.append(AnalysisResponse(
            sentiment_score=sent_score,
            sentiment_label=sent_result["sentiment_label"],
            event_type="MACROECONOMIC",
            impact_score=impact_score,
            confidence=round(max(sent_result["distribution"].values()), 4),
            entities=[],
            raw_text=text,
            source=request.source or "CUSTOM",
            stress_test_suggested=impact_score >= 7,
            distribution=distribution
        ))

    return BatchAnalysisResponse(total=len(results), results=results)
