from typing import List, Optional, Dict, Any

try:
    from pydantic import BaseModel, Field
except ImportError:
    class BaseModel:
        def __init__(self, **kwargs):
            for k, v in kwargs.items():
                setattr(self, k, v)
        def dict(self, *args, **kwargs):
            return self.__dict__
        def model_dump(self, *args, **kwargs):
            return self.__dict__

    def Field(default=None, **kwargs):
        if "default_factory" in kwargs and callable(kwargs["default_factory"]):
            return kwargs["default_factory"]()
        return default

class HealthResponse(BaseModel):
    status: str = "ok"
    service: str = "nlp-service"
    model_name: str
    model_loaded: bool
    version: str = "0.2.0"
    environment: str = "development"
    device: str = "cpu"

class SentimentDistribution(BaseModel):
    positive: float = Field(0.0, description="Positive probability (0.0 to 1.0)")
    negative: float = Field(0.0, description="Negative probability (0.0 to 1.0)")
    neutral: float = Field(0.0, description="Neutral probability (0.0 to 1.0)")

class AnalysisRequest(BaseModel):
    text: str = Field(..., min_length=1, description="Financial or macro text to analyze")
    source: Optional[str] = Field("CUSTOM", description="Source identifier e.g. GDELT, TWITTER, NEWS, CUSTOM")
    entity: Optional[str] = Field(None, description="Optional entity or ticker mention")

class AnalysisResponse(BaseModel):
    sentiment_score: float = Field(..., description="Net sentiment score from -1.0 to 1.0")
    sentiment_label: str = Field(..., description="Dominant sentiment: positive, negative, or neutral")
    event_type: str = Field(..., description="Classified risk event category")
    impact_score: int = Field(..., ge=1, le=10, description="Impact score from 1 to 10")
    confidence: float = Field(1.0, ge=0.0, le=1.0, description="Classification confidence")
    entities: List[str] = Field(default_factory=list, description="Extracted companies, tickers or agencies")
    raw_text: str = Field(..., description="Original input text")
    source: str = Field("CUSTOM", description="Source of input text")
    stress_test_suggested: bool = Field(False, description="Flag indicating if impact_score >= 7")
    distribution: Optional[SentimentDistribution] = None

class BatchAnalysisRequest(BaseModel):
    texts: List[str] = Field(..., min_items=1, description="List of texts to analyze")
    source: Optional[str] = Field("CUSTOM", description="Source identifier")

class BatchAnalysisResponse(BaseModel):
    total: int
    results: List[AnalysisResponse]

class TweetFetchRequest(BaseModel):
    file_path: Optional[str] = Field(None, description="Optional custom path to CSV file")
    limit: Optional[int] = Field(50, ge=1, le=1000, description="Max number of tweets to analyze")

class TweetRecordResponse(BaseModel):
    tweet_id: Optional[str] = None
    ticker: Optional[str] = None
    timestamp: Optional[str] = None
    text: str
    retweet_count: int = 0
    like_count: int = 0
    analysis: AnalysisResponse

class TweetFetchResponse(BaseModel):
    total: int
    results: List[TweetRecordResponse]

class GdeltFetchResponse(BaseModel):
    total: int
    query: str
    articles: List[AnalysisResponse]
