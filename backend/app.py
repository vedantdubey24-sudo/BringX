"""
=============================================================
  Student Performance Prediction – Flask Backend API
  Author  : Data Science Project
  Routes  :
      GET  /          → health check
      POST /predict   → returns predicted marks & pass/fail
                         (also appends data to dataset.csv)
=============================================================
"""

import csv
import os
import pickle
from datetime import datetime

import numpy as np
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS

# ── App initialisation ───────────────────────────────────────
FRONTEND_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "frontend")
app = Flask(__name__, static_folder=FRONTEND_DIR, static_url_path="")
CORS(app)   # allow requests from the frontend (cross-origin)
# ── Paths ────────────────────────────────────────────────────
BASE_DIR      = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR     = os.path.join(BASE_DIR, "..", "models")
DATA_PATH     = os.path.join(BASE_DIR, "..", "data", "dataset.csv")

LINEAR_PATH   = os.path.join(MODEL_DIR, "linear.pkl")
LOGISTIC_PATH = os.path.join(MODEL_DIR, "logistic.pkl")
SCALER_PATH   = os.path.join(MODEL_DIR, "scaler.pkl")

# ── CSV column order ─────────────────────────────────────────
CSV_COLUMNS = ["Hours", "Attendance", "PreviousMarks", "Marks", "Result"]

# ── Load models once at startup ──────────────────────────────
def load_models():
    """Load pickled models; raise a clear error if files are missing."""
    missing = [p for p in [LINEAR_PATH, LOGISTIC_PATH, SCALER_PATH]
               if not os.path.exists(p)]
    if missing:
        raise FileNotFoundError(
            f"Model file(s) not found: {missing}\n"
            "Run  notebooks/train_model.py  first to generate them."
        )
    with open(LINEAR_PATH,   "rb") as f:
        lin = pickle.load(f)
    with open(LOGISTIC_PATH, "rb") as f:
        log = pickle.load(f)
    with open(SCALER_PATH,   "rb") as f:
        scaler = pickle.load(f)
    return lin, log, scaler

try:
    linear_model, logistic_model, scaler = load_models()
    MODELS_READY = True
    print("[OK] Models loaded successfully.")
except FileNotFoundError as e:
    MODELS_READY = False
    print(f"[WARN] {e}")


# ── Helper: append one row to dataset.csv ────────────────────
def append_to_csv(hours, attendance, previous, predicted_marks, result_int):
    """
    Appends a new data row to dataset.csv so the dataset grows
    with every real prediction made through the UI.

    Parameters
    ----------
    hours          : study hours entered by user
    attendance     : attendance % entered by user
    previous       : previous marks entered by user
    predicted_marks: marks predicted by Linear Regression (rounded)
    result_int     : 1 = Pass, 0 = Fail  (from Logistic Regression)
    """
    file_exists = os.path.isfile(DATA_PATH)
    row = {
        "Hours"        : int(hours),
        "Attendance"   : int(attendance),
        "PreviousMarks": int(previous),
        "Marks"        : round(predicted_marks),
        "Result"       : result_int,
    }
    with open(DATA_PATH, "a", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=CSV_COLUMNS)
        # Write header only if the file didn't exist before
        if not file_exists:
            writer.writeheader()
        writer.writerow(row)
    print(f"[{datetime.now().strftime('%H:%M:%S')}] Row saved -> {row}")


# ════════════════════════════════════════════════════════════
#   ROUTES
# ════════════════════════════════════════════════════════════

@app.route("/", methods=["GET"])
def index():
    """Serve the frontend."""
    return send_from_directory(FRONTEND_DIR, "index.html")


@app.route("/api/status", methods=["GET"])
def api_status():
    """Health-check endpoint."""
    return jsonify({
        "status"    : "running",
        "service"   : "Student Performance Prediction API",
        "models_ready": MODELS_READY,
        "endpoints" : {
            "predict": "POST /predict  ->  { hours, attendance, previous }"
        }
    })


@app.route("/predict", methods=["POST"])
def predict():
    """
    Accepts JSON:
        { "hours": <int/float>, "attendance": <float>, "previous": <float> }
    Returns:
        { "predicted_marks": <float>, "result": "Pass"/"Fail",
          "probability": <float> }
    """
    # ── Guard: models not loaded ─────────────────────────────
    if not MODELS_READY:
        return jsonify({
            "error": "Models not loaded. Run train_model.py first."
        }), 503

    # ── Parse request body ───────────────────────────────────
    data = request.get_json(silent=True)
    if data is None:
        return jsonify({"error": "Invalid JSON body."}), 400

    # ── Validate required fields ─────────────────────────────
    required = ["hours", "attendance", "previous"]
    missing  = [k for k in required if k not in data]
    if missing:
        return jsonify({
            "error"  : f"Missing field(s): {missing}",
            "example": {"hours": 5, "attendance": 75, "previous": 60}
        }), 422

    # ── Type-check and extract values ────────────────────────
    try:
        hours      = float(data["hours"])
        attendance = float(data["attendance"])
        previous   = float(data["previous"])
    except (ValueError, TypeError):
        return jsonify({
            "error": "All fields must be numeric (hours, attendance, previous)."
        }), 422

    # ── Range validation ─────────────────────────────────────
    if not (0 <= hours <= 24):
        return jsonify({"error": "hours must be between 0 and 24."}), 422
    if not (0 <= attendance <= 100):
        return jsonify({"error": "attendance must be between 0 and 100."}), 422
    if not (0 <= previous <= 100):
        return jsonify({"error": "previous must be between 0 and 100."}), 422

    # ── Prepare feature array ────────────────────────────────
    features = np.array([[hours, attendance, previous]])

    # ── Linear Regression → Predicted Marks ─────────────────
    predicted_marks = float(np.clip(linear_model.predict(features)[0], 0, 100))

    # ── Logistic Regression → Pass / Fail ────────────────────
    features_scaled  = scaler.transform(features)
    cls_prediction   = int(logistic_model.predict(features_scaled)[0])
    cls_probability  = float(
        logistic_model.predict_proba(features_scaled)[0][cls_prediction]
    )
    result_label     = "Pass" if cls_prediction == 1 else "Fail"

    # ── Save input + prediction to dataset.csv ───────────────
    try:
        append_to_csv(hours, attendance, previous, predicted_marks, cls_prediction)
        csv_saved = True
    except Exception as csv_err:
        print(f"[WARN] Could not save to CSV: {csv_err}")
        csv_saved = False

    # ── Response ─────────────────────────────────────────────
    return jsonify({
        "predicted_marks" : round(predicted_marks, 2),
        "result"          : result_label,
        "probability"     : round(cls_probability * 100, 1),
        "saved_to_csv"    : csv_saved,
        "inputs"          : {
            "hours"      : hours,
            "attendance" : attendance,
            "previous"   : previous
        }
    })


# ── Run ──────────────────────────────────────────────────────
if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
