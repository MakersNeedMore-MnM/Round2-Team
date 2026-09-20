# LifePrint – Personalized Health Digital Twin

LifePrint is an AI-powered Personalized Health Digital Twin that analyzes longitudinal health data to learn an individual's personal health patterns, relationships, and trends. It provides personalized predictions, explainable insights, a Personal Health Knowledge Graph, and a What-If simulator.

## Problem Statement

Most health applications only display individual health metrics. They do not learn how different health factors interact for a specific person over time. LifePrint addresses this by continuously analyzing longitudinal health data and building a personalized representation of an individual's health.

## Key Features

- Personalized health baselines
- Longitudinal health pattern discovery
- Personalized health-event prediction
- Explainable prediction insights
- Personal Health Knowledge Graph
- What-If health scenario simulation
- Interactive health dashboard
- Historical health trend analysis

## Tech Stack

**Frontend:** React, TypeScript, Vite  
**Backend:** Python, FastAPI, Uvicorn  
**AI/ML:** Pandas, NumPy, Scikit-learn  
**Data & Graphs:** NetworkX, Plotly  
**Deployment:** GitHub, Render

## How to Run

### Backend


python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload

Backend runs at:

http://127.0.0.1:8000

##Frontend

Open another terminal:

cd frontend
npm install
npm run dev

Open the URL shown by Vite, usually:

http://localhost:5173

## Live Demo

Frontend: https://lifeprint1.onrender.com

Backend API: https://lifeprint-g5pn.onrender.com


## The prototype demonstrates:

Health dashboard
Personal health baselines
Pattern analysis
Personal Health Knowledge Graph
Personalized predictions
Explainable insights
What-If simulation


## Team Members
Kritika Parashar
Suchet Mahamuni
Rugved Kulkarno
Akanksha Kuvhare

## Future Scope
Wearable device integration
Real-time health data
Medical record integration
Larger longitudinal datasets
Advanced AI/ML models
Scalable health-data storage
Continuous personalization


## Disclaimer
LifePrint is an academic research prototype and is not intended for medical diagnosis or treatment. The current prototype uses synthetic health data and its predictions should not be considered medical advice.
