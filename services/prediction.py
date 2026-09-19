import pandas as pd
from sklearn.ensemble import RandomForestClassifier

FEATURES = [
    "sleep_hours",
    "hydration_liters",
    "stress",
    "activity_steps",
    "caffeine"
]

def train_model(df):
    """
    Train a simple model to estimate headache likelihood
    from the user's health variables.
    """
    X = df[FEATURES]
    y = df["headache"]

    model = RandomForestClassifier(
        n_estimators=150,
        random_state=42,
        class_weight="balanced"
    )
    model.fit(X, y)
    
    return model

def predict_headache(model, health_data):
    """
    Estimate headache likelihood for the supplied
    health values.
    """
    input_data = pd.DataFrame([health_data], columns=FEATURES)
    probability = model.predict_proba(input_data)[0][1]
    
    return probability

def explain_prediction(model, health_data):
    """
    Explain the prediction using the model's
    feature importances and the current values.
    """
    explanations = []
    
    for feature, importance in zip(FEATURES, model.feature_importances_):
        explanations.append({
            "feature": feature,
            "importance": round(float(importance), 3),
            "current_value": health_data[feature]
        })
        
    explanations.sort(key=lambda x: x["importance"], reverse=True)
    return explanations
