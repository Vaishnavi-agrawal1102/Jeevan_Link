
import os
import joblib
import numpy as np
import pandas as pd

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from pathlib import Path

app = FastAPI(title="Jeevan Link ML API")

BASE_DIR = Path(__file__).resolve().parent
MODEL_DIR = BASE_DIR / "Models"

def load_pickle(path):
    return joblib.load(path)

# Load trained models
try:
    # Assistance model
    assistance_dir = MODEL_DIR / "Assistance_Model"

    assistance_model = load_pickle(
        assistance_dir / "assistance_model.pkl"
    )
    assistance_vectorizer = load_pickle(
        assistance_dir / "assistance_tfidf_vectorizer.pkl"
    )
    assistance_labels = load_pickle(
        assistance_dir / "assistance_label_names.pkl"
    )

    assistance_thresholds = load_pickle(
        assistance_dir / "assistance_thresholds.json"
    ) if False else None

    import json
    with open(assistance_dir / "assistance_thresholds.json") as f:
        assistance_thresholds = json.load(f)

    # ETA model
    eta_dir = MODEL_DIR / "ETA_Model"

    eta_model = load_pickle(eta_dir / "eta_model.pkl")
    eta_features = load_pickle(
        eta_dir / "eta_feature_names.pkl"
    )

    # Urgency model
    urgency_dir = MODEL_DIR / "Urgency_Model"

    urgency_model = load_pickle(
        urgency_dir / "urgency_model.pkl"
    )
    urgency_features = load_pickle(
        urgency_dir / "urgency_feature_names.pkl"
    )

    print("All three ML models loaded successfully!")

except Exception as e:
    raise RuntimeError(f"Model loading failed: {e}")


class AssistanceInput(BaseModel):
    message: str


class FeatureInput(BaseModel):
    features: dict


def prepare_features(input_features, expected_features):
    missing = [
        feature for feature in expected_features
        if feature not in input_features
    ]

    if missing:
        raise HTTPException(
            status_code=400,
            detail={"missing_features": missing}
        )

    return pd.DataFrame(
        [[input_features[f] for f in expected_features]],
        columns=expected_features
    )


@app.get("/")
def home():
    return {
        "message": "Jeevan Link ML API is running",
        "models": ["Urgency", "Assistance", "ETA"]
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "models_loaded": True
    }


@app.post("/predict/assistance")
def predict_assistance(data: AssistanceInput):
    try:
        vector = assistance_vectorizer.transform([data.message])

        probabilities = assistance_model.predict_proba(vector)[0]

        labels = list(assistance_labels)

        if isinstance(assistance_thresholds, dict):
            thresholds = [
                assistance_thresholds.get(label, 0.5)
                for label in labels
            ]
        else:
            thresholds = [0.5] * len(labels)

        predictions = [
            labels[i]
            for i, probability in enumerate(probabilities)
            if probability >= thresholds[i]
        ]

        return {
            "predictions": predictions,
            "probabilities": {
                labels[i]: float(probabilities[i])
                for i in range(len(labels))
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/predict/eta")
def predict_eta(data: FeatureInput):
    try:
        X = prepare_features(data.features, eta_features)
        prediction = eta_model.predict(X)[0]

        return {
            "predicted_travel_minutes": round(float(prediction), 2)
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/predict/urgency")
def predict_urgency(data: FeatureInput):
    try:
        X = prepare_features(data.features, urgency_features)

        prediction = urgency_model.predict(X)[0]

        result = {"urgency": str(prediction)}

        if hasattr(urgency_model, "predict_proba"):
            probabilities = urgency_model.predict_proba(X)[0]
            result["probabilities"] = {
                str(label): float(probability)
                for label, probability in zip(
                    urgency_model.classes_, probabilities
                )
            }

        return result

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
