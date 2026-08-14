# 🎓 Student Performance Prediction
### Using Linear and Logistic Regression with Python

---

## 📋 Table of Contents
1. [Abstract](#abstract)
2. [Objectives](#objectives)
3. [Project Structure](#project-structure)
4. [Dataset](#dataset)
5. [Data Science Pipeline](#data-science-pipeline)
6. [Machine Learning Models](#machine-learning-models)
7. [Backend API](#backend-api)
8. [Frontend UI](#frontend-ui)
9. [Setup & Run](#setup--run)
10. [Tools & Libraries](#tools--libraries)
11. [Results](#results)
12. [Methodology](#methodology)
13. [Conclusion](#conclusion)
14. [Future Scope](#future-scope)

---

## Abstract

This project implements a complete **Student Performance Prediction System** using two fundamental supervised machine learning algorithms:

- **Linear Regression** — predicts a student's expected marks (continuous output)
- **Logistic Regression** — predicts whether a student will Pass or Fail (binary classification)

Three input features are used: **daily study hours**, **attendance percentage**, and **previous exam marks**. The project follows a full data science pipeline — from data generation and EDA to model training, evaluation, and deployment via a Flask REST API consumed by a modern HTML/CSS/JS frontend.

---

## Objectives

1. Understand and implement **Linear Regression** for numerical prediction
2. Understand and implement **Logistic Regression** for classification
3. Perform **Exploratory Data Analysis (EDA)** with visualisations
4. Evaluate models using appropriate metrics (MAE, MSE, R², Accuracy, Confusion Matrix)
5. Build a **Flask REST API** to serve predictions
6. Create a **responsive web UI** for non-technical users
7. Demonstrate the full **ML deployment pipeline** end-to-end

---

## Project Structure

```
ds mini/
│
├── data/
│   └── dataset.csv            ← Synthetic student dataset (100 rows)
│
├── models/                    ← Auto-created by train_model.py
│   ├── linear.pkl             ← Trained Linear Regression model
│   ├── logistic.pkl           ← Trained Logistic Regression model
│   └── scaler.pkl             ← StandardScaler for Logistic Regression
│
├── plots/                     ← Auto-created by train_model.py
│   ├── correlation_heatmap.png
│   ├── hours_vs_marks.png
│   ├── attendance_vs_marks.png
│   ├── pairplot.png
│   ├── linear_regression_pred.png
│   ├── confusion_matrix.png
│   └── model_comparison.png
│
├── notebooks/
│   └── train_model.py         ← Full ML pipeline (EDA + training + saving)
│
├── backend/
│   └── app.py                 ← Flask REST API
│
├── frontend/
│   ├── index.html             ← Main UI page
│   ├── style.css              ← Premium dark glassmorphism styling
│   └── script.js              ← Fetch API + result rendering
│
├── requirements.txt           ← Python dependencies
└── README.md                  ← This file
```

---

## Dataset

**File:** `data/dataset.csv`  
**Rows:** 100 synthetic samples  
**Columns:**

| Column        | Type    | Description                            |
|---------------|---------|----------------------------------------|
| Hours         | Integer | Daily study hours (1–10)               |
| Attendance    | Float   | Class attendance % (44–96)             |
| PreviousMarks | Integer | Marks in previous exam (29–86)         |
| Marks         | Integer | Target marks obtained (27–94)          |
| Result        | Binary  | 0 = Fail, 1 = Pass                     |

**Dataset Properties:**
- Positive correlation: more study hours → higher marks
- Students with <50 marks → Fail (Result = 0)
- Realistic distribution: no perfect or random values
- No missing values or duplicates

---

## Data Science Pipeline

### Step 1 – Data Loading
```python
df = pd.read_csv("data/dataset.csv")
```

### Step 2 – Data Cleaning
- Check & remove missing values
- Remove duplicates
- Clip values to realistic ranges

### Step 3 – EDA
- Summary statistics (`df.describe()`)
- Correlation heat-map (seaborn)
- Scatter plots: Hours vs Marks, Attendance vs Marks
- Pair-plot for all features

### Step 4 – Feature Selection
```
Features : Hours, Attendance, PreviousMarks
Target A : Marks        (Linear Regression)
Target B : Result       (Logistic Regression)
```

### Step 5 – Train/Test Split
```python
train_test_split(test_size=0.2, random_state=42)
# 80 training samples, 20 test samples
```

---

## Machine Learning Models

### Model A – Linear Regression

| What it does | Predicts a continuous numerical value (Marks) |
|---|---|
| Algorithm | Ordinary Least Squares (OLS) |
| Input | Hours, Attendance, PreviousMarks |
| Output | Predicted Marks (0–100) |

**Evaluation Metrics:**
| Metric | Description |
|---|---|
| MAE  | Mean Absolute Error – average absolute difference |
| MSE  | Mean Squared Error – penalises large errors more |
| RMSE | Root MSE – same unit as target |
| R²   | Coefficient of determination (1.0 = perfect fit) |

**Why Linear Regression?**  
Marks are continuous. Linear regression fits a hyperplane through the feature space to minimise the residual sum of squares.

---

### Model B – Logistic Regression

| What it does | Classifies Pass (1) or Fail (0) |
|---|---|
| Algorithm | Sigmoid / Maximum Likelihood Estimation |
| Input | Hours, Attendance, PreviousMarks (scaled) |
| Output | Probability → binary label |

**Evaluation Metrics:**
| Metric | Description |
|---|---|
| Accuracy    | % of correct predictions |
| Precision   | True Positives / (TP + FP) |
| Recall      | True Positives / (TP + FN) |
| F1-score    | Harmonic mean of Precision & Recall |
| Confusion Matrix | TP, TN, FP, FN breakdown |

**Why Logistic Regression?**  
Pass/Fail is binary. Logistic regression uses the sigmoid function to map any real input to probability [0,1], then thresholds at 0.5.

---

### Why Scale for Logistic But Not Linear?
Linear Regression's coefficients absorb scale differences naturally.  
Logistic Regression with gradient-based solvers converges faster and more reliably with standardised features (mean=0, std=1).

---

## Backend API

**File:** `backend/app.py`  
**Framework:** Flask 3.0  
**Port:** 5000

### Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| GET  | `/`        | Health check / API status |
| POST | `/predict` | Predict marks & pass/fail |

### Request (POST /predict)
```json
{
  "hours"      : 7,
  "attendance" : 80,
  "previous"   : 70
}
```

### Response
```json
{
  "predicted_marks" : 76.42,
  "result"          : "Pass",
  "probability"     : 94.3,
  "inputs"          : {
    "hours"      : 7.0,
    "attendance" : 80.0,
    "previous"   : 70.0
  }
}
```

### Error Handling
- 400 – Invalid JSON body
- 422 – Missing/out-of-range fields
- 503 – Models not yet loaded

---

## Frontend UI

**Files:** `frontend/index.html`, `style.css`, `script.js`

### Features
- 🌙 Dark glassmorphism design with animated gradient background
- 3 input fields (hours, attendance, previous marks)
- Client-side validation before API call
- Animated number counter for predicted marks
- Confidence progress bar for pass/fail probability
- Error toast notifications
- Fully responsive (mobile + desktop)

---

## Setup & Run

### Prerequisites
- Python 3.9+
- pip

### 1. Install dependencies
```bash
pip install -r requirements.txt
```

### 2. Train the models
```bash
python notebooks/train_model.py
```
This will:
- Run the full pipeline (EDA + training)
- Save `models/linear.pkl`, `models/logistic.pkl`, `models/scaler.pkl`
- Save 7 plots to `plots/`

### 3. Start the Flask API
```bash
python backend/app.py
```
The server starts at `http://127.0.0.1:5000`

### 4. Open the Frontend
Open `frontend/index.html` in any browser.

> **Important:** The browser must be able to reach `http://127.0.0.1:5000`. Keep the Flask server running while using the UI.

---

## Tools & Libraries

| Library      | Version | Purpose                       |
|--------------|---------|-------------------------------|
| pandas       | 2.1.4   | Data loading, cleaning, EDA   |
| numpy        | 1.26.4  | Numerical computation         |
| scikit-learn | 1.4.2   | ML models, metrics, scaling   |
| matplotlib   | 3.8.4   | Plotting graphs               |
| seaborn      | 0.13.2  | Statistical visualisations    |
| Flask        | 3.0.3   | REST API backend              |
| flask-cors   | 4.0.1   | Cross-origin requests         |
| joblib       | 1.4.2   | Model serialisation support   |

**Frontend:** HTML5, CSS3 (custom properties, glassmorphism), Vanilla JavaScript (Fetch API)

---

## Results

*(Typical values – run `train_model.py` to get exact numbers)*

### Linear Regression
| Metric | Expected Value |
|--------|---------------|
| MAE    | ~1.5 – 2.5    |
| MSE    | ~4 – 8        |
| RMSE   | ~2 – 3        |
| R²     | ~0.97 – 0.99  |

### Logistic Regression
| Metric   | Expected Value |
|----------|---------------|
| Accuracy | ~95 – 100%    |
| Precision| ~0.95 – 1.00  |
| Recall   | ~0.95 – 1.00  |

---

## Methodology

```
1. Problem Definition
   └─ Regression (marks) + Classification (pass/fail)

2. Data Collection
   └─ Synthetic dataset with realistic logical relationships

3. Data Preprocessing
   └─ Missing value check → duplicate removal → range clipping

4. EDA
   └─ statistics → correlation heatmap → scatter plots → pair-plot

5. Feature Engineering
   └─ StandardScaler for Logistic Regression features

6. Model Training
   └─ LinearRegression().fit(X_train, y_marks)
   └─ LogisticRegression().fit(X_train_scaled, y_result)

7. Model Evaluation
   └─ MAE, MSE, R² for regression
   └─ Accuracy, confusion matrix, classification report for classification

8. Model Persistence
   └─ pickle.dump() → .pkl files

9. API Deployment
   └─ Flask REST API → /predict endpoint

10. Frontend Integration
    └─ Fetch API → JSON → DOM rendering
```

---

## Conclusion

This project successfully demonstrates:

1. **Linear Regression** achieves a very high R² (~0.98) showing that study hours, attendance, and previous marks are strong predictors of marks.
2. **Logistic Regression** achieves near-perfect accuracy in classifying Pass/Fail, confirming that the chosen features cleanly separate the two classes.
3. A complete **full-stack ML pipeline** — from raw CSV to a live web application — is achievable with Python and open-source libraries.
4. The **Flask API** cleanly separates ML logic from the UI, making the system modular and maintainable.

---

## Future Scope

| Enhancement | Description |
|---|---|
| Larger dataset | Use real institutional data for more robust models |
| More features | Add subject-wise marks, sleep hours, extracurricular activity |
| Advanced models | Random Forest, XGBoost, Neural Networks |
| Data visualisation UI | Show EDA plots interactively in the browser (Chart.js / D3.js) |
| Authentication | Student login to save and track predictions over time |
| Database | Store predictions in SQLite / PostgreSQL |
| Model retraining | Admin panel to upload new data and retrain models |
| Mobile app | React Native / Flutter frontend |
| Explainability | SHAP / LIME values to explain individual predictions |
| Docker deployment | Containerise Flask + serve with Gunicorn + Nginx |

---

*Submitted as part of Data Science Mini Project | Academic Year 2025–26*
