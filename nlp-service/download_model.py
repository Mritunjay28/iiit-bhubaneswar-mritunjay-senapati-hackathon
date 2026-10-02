"""
Pre-download HuggingFace model weights for offline execution and container image caching.
"""
import os
import sys

def preload_finbert():
    model_name = os.getenv("MODEL_NAME", "ProsusAI/finbert")
    print(f"Caching FinBERT weights from '{model_name}'...")
    try:
        from transformers import AutoTokenizer, AutoModelForSequenceClassification
        AutoTokenizer.from_pretrained(model_name)
        AutoModelForSequenceClassification.from_pretrained(model_name)
        print("FinBERT model cache completed successfully.")
    except Exception as exc:
        print(f"Model pre-download skipped or failed ({exc}). Service will use fallback or download on first run.")

if __name__ == "__main__":
    preload_finbert()
