import logging
from typing import Optional
from fastapi import APIRouter, Query
from app.models.schemas import GdeltFetchResponse
from app.nlp.gdelt import gdelt_fetcher

logger = logging.getLogger("riskengine.routers.fetch")

router = APIRouter(prefix="/fetch", tags=["Data Ingestion & Ingest Pipelines"])

@router.get("/gdelt", response_model=GdeltFetchResponse)
async def fetch_gdelt_news(
    query: str = Query("bank crisis OR interest rate OR default", description="GDELT search query"),
    days: int = Query(1, ge=1, le=30, description="Lookback window in days"),
    max_records: int = Query(10, ge=1, le=50, description="Max articles to fetch")
):
    results = gdelt_fetcher.fetch_and_analyze(query=query, days=days, max_records=max_records)
    return GdeltFetchResponse(total=len(results), query=query, articles=results)

@router.post("/gdelt", response_model=GdeltFetchResponse)
async def fetch_gdelt_news_post(
    query: Optional[str] = "bank crisis OR interest rate OR default",
    days: Optional[int] = 1,
    max_records: Optional[int] = 10
):
    results = gdelt_fetcher.fetch_and_analyze(query=query, days=days, max_records=max_records)
    return GdeltFetchResponse(total=len(results), query=query, articles=results)
