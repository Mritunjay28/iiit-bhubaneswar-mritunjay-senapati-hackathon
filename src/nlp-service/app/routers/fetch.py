import logging
from typing import Optional
from fastapi import APIRouter, Query
from app.models.schemas import (
    GdeltFetchResponse,
    TweetFetchRequest,
    TweetFetchResponse
)
from app.nlp.gdelt import gdelt_fetcher
from app.nlp.tweet_loader import tweet_loader

logger = logging.getLogger("riskengine.routers.fetch")

router = APIRouter(prefix="/fetch", tags=["Data Ingestion & Ingest Pipelines"])

@router.get("/gdelt", response_model=GdeltFetchResponse)
async def fetch_gdelt_news(
    query: str = Query('("bank crisis" OR "interest rate" OR default)', description="GDELT search query"),
    days: int = Query(1, ge=1, le=30, description="Lookback window in days"),
    max_records: int = Query(10, ge=1, le=50, description="Max articles to fetch")
):
    """
    Fetches latest financial and macro news from GDELT API (or fallback)
    and processes each article through FinBERT sentiment, event classification,
    and impact score calculation.
    """
    results = gdelt_fetcher.fetch_and_analyze(query=query, days=days, max_records=max_records)
    return GdeltFetchResponse(
        total=len(results),
        query=query,
        articles=results
    )

@router.post("/gdelt", response_model=GdeltFetchResponse)
async def fetch_gdelt_news_post(
    query: Optional[str] = '("bank crisis" OR "interest rate" OR default)',
    days: Optional[int] = 1,
    max_records: Optional[int] = 10
):
    """POST alternate for GDELT fetch endpoint."""
    results = gdelt_fetcher.fetch_and_analyze(query=query, days=days, max_records=max_records)
    return GdeltFetchResponse(
        total=len(results),
        query=query,
        articles=results
    )

@router.post("/tweets", response_model=TweetFetchResponse)
async def fetch_tweets_post(request: Optional[TweetFetchRequest] = None):
    """
    Loads financial tweets from Kaggle/sample CSV file and runs batch
    sentiment analysis, event classification, and impact score calculations.
    """
    file_path = request.file_path if request else None
    limit = request.limit if request and request.limit else 50
    results = tweet_loader.load_and_analyze(file_path=file_path, limit=limit)
    return TweetFetchResponse(
        total=len(results),
        results=results
    )

@router.get("/tweets", response_model=TweetFetchResponse)
async def fetch_tweets_get(
    file_path: Optional[str] = Query(None, description="Optional path to tweets CSV"),
    limit: int = Query(50, ge=1, le=1000, description="Max tweets to process")
):
    """GET endpoint to ingest and score tweets from CSV."""
    results = tweet_loader.load_and_analyze(file_path=file_path, limit=limit)
    return TweetFetchResponse(
        total=len(results),
        results=results
    )
