import joblib
import pandas as pd
import os

# Model 1: First report
MODEL1_PATH = os.path.join(os.path.dirname(__file__), "liver_disease_staging_model.pkl")
model1 = joblib.load(MODEL1_PATH)

def predict_first_report(data: dict):
    df = pd.DataFrame([data])
    pred = model1.predict(df)[0]
    probs = model1.predict_proba(df)[0]
    classes = model1.classes_
    return {
        "predicted_stage": str(pred),
        "stage_probabilities": {str(c): float(p) for c, p in zip(classes, probs)}
    }

# Model 2: Follow-up
MODEL2_PATH = os.path.join(os.path.dirname(__file__), "liver_disease_stage_model.pkl")
model2 = joblib.load(MODEL2_PATH)

def predict_followup_report(data: dict):
    df = pd.DataFrame([data])
    pred = model2.predict(df)[0]
    probs = model2.predict_proba(df)[0]
    classes = model2.classes_
    return {
        "predicted_stage": str(pred),
        "stage_probabilities": {str(c): float(p) for c, p in zip(classes, probs)}
    }
