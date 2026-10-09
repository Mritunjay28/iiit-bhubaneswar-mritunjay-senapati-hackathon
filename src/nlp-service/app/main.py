import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.config import settings
from app.models.schemas import HealthResponse
from app.nlp.sentiment import sentiment_analyzer

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("riskengine.nlp")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing %s v%s...", settings.app_name, settings.app_version)
    sentiment_analyzer.load_model()
    app.state.sentiment_analyzer = sentiment_analyzer
    app.state.model_loaded = sentiment_analyzer.is_loaded and not sentiment_analyzer.is_fallback
    yield
    logger.info("Shutting down %s...", settings.app_name)

app = FastAPI(
    title=settings.app_name,
    description="Dedicated microservice for financial sentiment analysis, keyword event classification, and risk signal extraction",
    version=settings.app_version,
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error("Unhandled error processing %s: %s", request.url, str(exc), exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"error": "InternalServerError", "message": str(exc), "path": str(request.url.path)}
    )

@app.get("/health", response_model=HealthResponse, tags=["System"])
def health_check():
    model_loaded = getattr(app.state, "model_loaded", False)
    return HealthResponse(
        status="ok",
        service="nlp-service",
        model_name=settings.model_name,
        model_loaded=model_loaded,
        version=settings.app_version,
        environment=settings.environment,
        device=settings.device
    )

from app.routers.analysis import router as analysis_router
from app.routers.fetch import router as fetch_router
app.include_router(analysis_router)
app.include_router(fetch_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
