import os
from pydantic import BaseModel

class Settings(BaseModel):
    app_name: str = "AI/NLP Financial Risk Engine"
    environment: str = os.getenv("ENVIRONMENT", "development")
    model_name: str = os.getenv("MODEL_NAME", "ProsusAI/finbert")
    data_dir: str = os.getenv("DATA_DIR", "/app/data")
    high_impact_threshold: int = int(os.getenv("HIGH_IMPACT_THRESHOLD", "7"))

settings = Settings()
