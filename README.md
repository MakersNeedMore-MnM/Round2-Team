
# LifePrint 2.0 — Personalized Health Digital Twin

LifePrint 2.0 is a full-stack health digital twin prototype that transforms longitudinal health records into personalized baselines, historical patterns, machine-learning predictions, and interactive What-If simulations.

> **Round 2 Development Note:** The updated LifePrint 2.0 implementation has been pushed to a separate branch named `lifeprint-2` in the Morrow Round 2 repository. This allows the completed version to be reviewed separately from the earlier code on `main`.

## Live Deployment

| Service | Link |
|---|---|
| Frontend | https://lifeprint1.onrender.com |
| Backend | https://lifeprint-g5pn.onrender.com |
| API Documentation | https://lifeprint-g5pn.onrender.com/docs |
| GitHub Repository | https://github.com/MakersNeedMore-MnM/Round2-Team |
| LifePrint 2.0 Branch | https://github.com/MakersNeedMore-MnM/Round2-Team/tree/lifeprint-2 |

**Deployment Status:** The frontend is deployed on Render. The latest backend endpoints and end-to-end production integration require final verification.

---

## 1. The Problem

Modern health applications collect large amounts of data, including sleep, hydration, activity, heart rate, and stress. However, isolated measurements rarely explain how an individual's current health differs from their personal history.

LifePrint focuses on five challenges:

- Limited personalization of health measurements.
- Fragmented health data that is difficult to interpret.
- Underexplored patterns in historical health records.
- Limited transparency behind machine-learning predictions.
- Lack of interactive tools for exploring hypothetical lifestyle changes.

## 2. Our Solution

LifePrint 2.0 combines personalized health analytics and machine learning in a single interactive application.

The system establishes individual baselines, identifies deviations and trends, discovers temporal associations, estimates seven health outcomes, and allows users to explore hypothetical lifestyle scenarios.

Our objective is to move beyond simply tracking health measurements and demonstrate how historical health data can be transformed into personalized, interpretable, and interactive insights.

---

## 3. Implemented Features

### 3.1 Personalized Dashboard

A centralized dashboard displaying:

- Latest recorded health measurements.
- Personal baseline information.
- Experimental health-outcome estimates.
- Relevant historical patterns.
- An overview of the user's health profile.

### 3.2 Daily Logs

Allows users to inspect individual daily health records and review measurements recorded on specific dates.

### 3.3 Health Timeline

Provides a chronological visualization of historical health measurements, helping users explore changes in their health parameters over time.

### 3.4 Personal Baseline Engine

Calculates rolling personal baselines using a 30-day historical window.

The system analyzes 14 health signals and reports:

- Current measurement.
- Personal baseline.
- Percentage deviation.
- Recent trend.
- Trend change.
- Volatility.
- Number of historical observations.

Personal baselines describe an individual's recorded history and do not necessarily represent clinically healthy values.

### 3.5 Temporal Pattern Discovery

Investigates associations between deviations from personal baselines and health outcomes recorded the following day.

The system:

1. Identifies significant deviations from rolling personal baselines.
2. Compares observations with and without the deviation.
3. Calculates next-day outcome frequencies.
4. Identifies qualifying associations.
5. Reports supporting evidence and observation counts.

These relationships are exploratory and do not establish causation.

### 3.6 Interactive Health Graph

An interactive visualization built using React Flow.

The graph represents discovered relationships between health signals and modeled outcomes.

Users can inspect individual connections to view:

- Signal and outcome.
- Deviation condition.
- Observation counts.
- Event frequencies.
- Percentage-point differences.
- Time lag.

### 3.7 Machine-Learning Prediction Engine

Seven Random Forest classifiers have been implemented using scikit-learn.

The models estimate the following outcomes:

1. Headache.
2. Blood-pressure elevation.
3. Fatigue.
4. Dehydration risk.
5. Poor sleep.
6. Stress overload.
7. Recovery deterioration.

The current models use synthetic data and have not been clinically validated.

### 3.8 What-If Simulator

Allows users to explore hypothetical lifestyle scenarios by adjusting five inputs:

- Sleep duration.
- Hydration.
- Stress.
- Daily activity steps.
- Caffeine consumption.

The backend recalculates the seven modeled outcome estimates and displays the original and simulated results side by side.

The simulator demonstrates model sensitivity rather than proven real-world effects.

### 3.9 Personal Health Profile

Organizes health measurements into lifestyle and routine, vital measurements, and body and recovery.

The Profile displays personal baselines, deviations, trends, and evidence from discovered patterns.

---

## 4. Dataset

The current prototype uses synthetic longitudinal health data.

| Dataset Property | Value |
|---|---|
| Simulated users | 8 |
| Days per user | 150 |
| Total records | 1,200 |
| Total columns | 23 |
| Health signals | 14 |
| Modeled outcomes | 7 |

The health signals include:

- Sleep duration.
- Hydration.
- Stress.
- Activity steps.
- Caffeine consumption.
- Heart rate.
- Resting heart rate.
- Systolic blood pressure.
- Diastolic blood pressure.
- Weight.
- Body temperature.
- Calories.
- Sleep quality.
- Recovery.

The synthetic dataset enables development and demonstration without collecting sensitive real-world medical records.

---

## 5. Technology Stack

| Component | Technology |
|---|---|
| Frontend | React, TypeScript |
| Styling | Tailwind CSS |
| Backend | Python, FastAPI |
| Data Processing | Pandas, NumPy |
| Machine Learning | Scikit-learn |
| Prediction Algorithm | Random Forest |
| Graph Visualization | React Flow |
| API Communication | REST APIs, JSON |
| Current Data Storage | CSV |
| Version Control | Git, GitHub |
| Deployment | Render |

---

## 6. System Architecture

```text
           Synthetic Health Dataset
                     |
                     v
              Data Processing
              Python / Pandas
                     |
          +----------+-----------+
          |                      |
          v                      v
   Personal Baseline       Pattern Discovery
        Engine                    |
          |                      v
          |               Personal Health
          |                    Graph
          |                      |
          +----------+-----------+
                     |
                     v
            Prediction Engine
             Random Forest
                     |
                     v
                FastAPI
                REST API
                     |
                     v
            React Application
                     |
       +-------------+-------------+
       |             |             |
       v             v             v
    Dashboard    Health Graph    What-If
       |
       v
  Daily Logs / Timeline / Profile
```

### Backend

The Python backend provides services for:

- Loading and processing health records.
- Calculating personal baselines.
- Discovering temporal patterns.
- Generating machine-learning predictions.
- Preparing interactive graph data.
- Running What-If simulations.

### Frontend

The React and TypeScript frontend communicates with the FastAPI backend through REST APIs and displays the processed information in an interactive interface.

---

## 7. Installation and Local Setup

### Prerequisites

- Python 3.
- Node.js and npm.
- Git.

### Step 1: Clone the LifePrint 2.0 branch

```bash
git clone --branch lifeprint-2 https://github.com/MakersNeedMore-MnM/Round2-Team.git
cd Round2-Team
```

### Step 2: Create and activate a virtual environment

For Windows PowerShell:

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

### Step 3: Install backend dependencies

```powershell
pip install -r requirements.txt
```

### Step 4: Start the FastAPI backend

```powershell
python -m uvicorn main:app --reload
```

The backend should be available at:

http://127.0.0.1:8000

API documentation:

http://127.0.0.1:8000/docs

### Step 5: Install frontend dependencies

Open a second terminal:

```powershell
cd frontend
npm install
```

### Step 6: Configure the frontend environment

Create a file named `.env.local` inside the `frontend` directory.

Add:

```env
VITE_API_URL=http://127.0.0.1:8000
```

### Step 7: Start the frontend

```powershell
npm run dev
```

Open the local URL displayed in the terminal, usually:

http://localhost:5173

---

## 8. Repository and Branch Information

**GitHub Repository:**

https://github.com/MakersNeedMore-MnM/Round2-Team

**Updated LifePrint 2.0 Branch:**

https://github.com/MakersNeedMore-MnM/Round2-Team/tree/lifeprint-2

### Important Note

The completed LifePrint 2.0 project has been uploaded to a separate branch named `lifeprint-2`.

The `main` branch contains the earlier Round 2 repository code, while `lifeprint-2` contains the updated implementation developed for the current prototype.

This separate branch allows the latest version to be reviewed and tested before merging it into `main`.

---

## 9. Current Project Status

The functional LifePrint 2.0 prototype has been developed and integrated locally.

Completed components include:

- Responsive React frontend.
- FastAPI backend.
- Synthetic longitudinal dataset.
- Personal baseline engine.
- Temporal pattern discovery.
- Seven Random Forest prediction models.
- Interactive health graph.
- What-If Simulator.
- Personal Health Profile.
- Frontend–backend integration.

The frontend has been deployed on Render. Final verification of the latest production backend endpoints and end-to-end deployment remains pending.

---

## 10. Future Scope

Planned improvements include:

- Completing production deployment verification.
- Conducting systematic functional and integration testing.
- Evaluating predictive-model performance.
- Investigating baseline stability and pattern-discovery thresholds.
- Integrating consented real-world health data.
- Exploring wearable-device integration.
- Implementing secure authentication and data privacy controls.
- Conducting external validation before any real-world healthcare use.

---

## 11. Disclaimer

LifePrint 2.0 is an educational and research prototype developed using synthetic health data.

Its predictions are experimental, its discovered associations do not establish causation, and its What-If simulations do not demonstrate proven health effects.

The application is not intended to provide medical diagnoses, treatment recommendations, or clinically validated risk assessments.
