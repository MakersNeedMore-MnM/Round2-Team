import pandas as pd
import os

def load_health_data(file_path="data/health_data.csv"):
    """
    Load the health dataset and validate expected columns.
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Health data file not found: {file_path}")
    
    df = pd.read_csv(file_path)
    
    expected_cols = [
        "user_id",
        "date", 
        "sleep_hours", 
        "hydration_liters", 
        "stress", 
        "activity_steps", 
        "caffeine", 
        "headache"
    ]
    
    for col in expected_cols:
        if col not in df.columns:
            raise ValueError(f"Missing expected column: {col}")
            
    return df
