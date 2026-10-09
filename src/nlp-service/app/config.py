import os
from pathlib import Path
try:
    from pydantic import BaseModel
except ImportError:
    class BaseModel:
        def __init__(self, **kwargs):
            for k, v in kwargs.items():
                setattr(self, k, v)

class Settings(BaseModel):
    app_name: str = "AI/NLP Financial Risk Engine"
    app_version: str = "0.2.0"
    environment: str = os.getenv("ENVIRONMENT", "development")
    model_name: str = os.getenv("MODEL_NAME", "ProsusAI/finbert")
    data_dir: str = os.getenv("DATA_DIR", "")
    high_impact_threshold: int = int(os.getenv("HIGH_IMPACT_THRESHOLD", "7"))
    device: str = os.getenv("DEVICE", "cpu")

    def resolve_data_dir(self) -> Path:
        if self.data_dir and Path(self.data_dir).exists():
            return Path(self.data_dir)
        # Search candidate paths for data directory
        candidates = [
            Path("/app/data"),
            Path(__file__).resolve().parent.parent.parent / "data",
            Path(__file__).resolve().parent.parent / "data",
            Path(__file__).resolve().parents[3] / "data",
            Path("data"),
            Path("../data"),
        ]
        for c in candidates:
            if c.exists() and c.is_dir():
                return c
        return Path("data")

settings = Settings()
