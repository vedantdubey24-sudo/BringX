"""
=============================================================
  Student Performance Prediction - Model Training Script
  Author  : Data Science Project
  Purpose : Train Linear + Logistic Regression models,
            save to disk, and produce EDA visualisations.
=============================================================
"""

# ── 1. IMPORTS ──────────────────────────────────────────────
import os
import pickle
import warnings

import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")          # headless backend – no display needed
import matplotlib.pyplot as plt
import seaborn as sns

from sklearn.linear_model import LinearRegression, LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    mean_absolute_error,
    mean_squared_error,
    r2_score,
    accuracy_score,
    confusion_matrix,
    classification_report,
)
from sklearn.preprocessing import StandardScaler

warnings.filterwarnings("ignore")

# ── 2. DIRECTORY SETUP ──────────────────────────────────────
BASE_DIR   = os.path.dirname(os.path.abspath(__file__))
DATA_PATH  = os.path.join(BASE_DIR, "..", "data", "dataset.csv")
MODEL_DIR  = os.path.join(BASE_DIR, "..", "models")
PLOT_DIR   = os.path.join(BASE_DIR, "..", "plots")

os.makedirs(MODEL_DIR, exist_ok=True)
os.makedirs(PLOT_DIR,  exist_ok=True)

# ── 3. DATA LOADING ─────────────────────────────────────────
print("\n" + "="*60)
print("  STEP 1 – DATA LOADING")
print("="*60)

df = pd.read_csv(DATA_PATH)
print(f"\n✔  Dataset loaded  →  {df.shape[0]} rows, {df.shape[1]} columns")
print(df.head(10).to_string())

# ── 4. DATA CLEANING ────────────────────────────────────────
print("\n" + "="*60)
print("  STEP 2 – DATA CLEANING")
print("="*60)

# Check missing values
print(f"\n▸ Missing values per column:\n{df.isnull().sum()}")
df.dropna(inplace=True)             # drop any NaN rows (none expected)

# Check for duplicates
dup_count = df.duplicated().sum()
print(f"▸ Duplicate rows found: {dup_count}")
df.drop_duplicates(inplace=True)

# Clip values to realistic ranges
df["Hours"]         = df["Hours"].clip(1, 12)
df["Attendance"]    = df["Attendance"].clip(0, 100)
df["PreviousMarks"] = df["PreviousMarks"].clip(0, 100)
df["Marks"]         = df["Marks"].clip(0, 100)
df["Result"]        = df["Result"].clip(0, 1)

print(f"✔  Clean dataset shape: {df.shape}")

# ── 5. EXPLORATORY DATA ANALYSIS (EDA) ──────────────────────
print("\n" + "="*60)
print("  STEP 3 – EXPLORATORY DATA ANALYSIS")
print("="*60)

# 5a. Summary statistics
print("\n▸ Summary Statistics:")
print(df.describe().to_string())

# 5b. Class distribution
print(f"\n▸ Result distribution (0=Fail, 1=Pass):")
print(df["Result"].value_counts().to_string())

# ── PLOT 1: Correlation Heat-map ─────────────────────────────
plt.figure(figsize=(8, 6))
sns.heatmap(
    df.corr(numeric_only=True),
    annot=True,
    fmt=".2f",
    cmap="coolwarm",
    linewidths=0.5,
    square=True,
)
plt.title("Feature Correlation Heat-map", fontsize=14, fontweight="bold")
plt.tight_layout()
plt.savefig(os.path.join(PLOT_DIR, "correlation_heatmap.png"), dpi=150)
plt.close()
print("✔  Saved: correlation_heatmap.png")

# ── PLOT 2: Scatter – Study Hours vs Marks ───────────────────
plt.figure(figsize=(8, 5))
scatter = plt.scatter(
    df["Hours"], df["Marks"],
    c=df["Result"], cmap="RdYlGn", edgecolors="k", linewidth=0.4, s=60, alpha=0.85
)
plt.colorbar(scatter, label="Result (0=Fail, 1=Pass)")
plt.xlabel("Study Hours", fontsize=12)
plt.ylabel("Marks Obtained", fontsize=12)
plt.title("Study Hours vs Marks (coloured by Pass/Fail)", fontsize=13, fontweight="bold")
plt.tight_layout()
plt.savefig(os.path.join(PLOT_DIR, "hours_vs_marks.png"), dpi=150)
plt.close()
print("✔  Saved: hours_vs_marks.png")

# ── PLOT 3: Scatter – Attendance vs Marks ────────────────────
plt.figure(figsize=(8, 5))
scatter2 = plt.scatter(
    df["Attendance"], df["Marks"],
    c=df["Result"], cmap="RdYlGn", edgecolors="k", linewidth=0.4, s=60, alpha=0.85
)
plt.colorbar(scatter2, label="Result (0=Fail, 1=Pass)")
plt.xlabel("Attendance (%)", fontsize=12)
plt.ylabel("Marks Obtained", fontsize=12)
plt.title("Attendance vs Marks (coloured by Pass/Fail)", fontsize=13, fontweight="bold")
plt.tight_layout()
plt.savefig(os.path.join(PLOT_DIR, "attendance_vs_marks.png"), dpi=150)
plt.close()
print("✔  Saved: attendance_vs_marks.png")

# ── PLOT 4: Pair-plot ────────────────────────────────────────
pairplot_df = df[["Hours", "Attendance", "PreviousMarks", "Marks"]].copy()
pair_fig = sns.pairplot(pairplot_df, diag_kind="kde", plot_kws={"alpha": 0.6})
pair_fig.figure.suptitle("Feature Pair-Plot", y=1.02, fontsize=14, fontweight="bold")
pair_fig.savefig(os.path.join(PLOT_DIR, "pairplot.png"), dpi=120)
plt.close("all")
print("✔  Saved: pairplot.png")

# ── 6. FEATURE SELECTION ────────────────────────────────────
print("\n" + "="*60)
print("  STEP 4 – FEATURE SELECTION")
print("="*60)

FEATURES = ["Hours", "Attendance", "PreviousMarks"]
TARGET_REG   = "Marks"          # continuous  → Linear Regression
TARGET_CLASS = "Result"         # binary 0/1 → Logistic Regression

X = df[FEATURES]
y_reg   = df[TARGET_REG]
y_class = df[TARGET_CLASS]

print(f"✔  Features      : {FEATURES}")
print(f"✔  Reg target    : {TARGET_REG}")
print(f"✔  Class target  : {TARGET_CLASS}")

# ── 7. TRAIN-TEST SPLIT ─────────────────────────────────────
print("\n" + "="*60)
print("  STEP 5 – TRAIN / TEST SPLIT")
print("="*60)

X_train, X_test, y_reg_train, y_reg_test, y_cls_train, y_cls_test = train_test_split(
    X, y_reg, y_class,
    test_size=0.2,
    random_state=42
)

print(f"✔  Training set  : {X_train.shape[0]} samples")
print(f"✔  Testing  set  : {X_test.shape[0]} samples")

# ── 8. FEATURE SCALING (for Logistic Regression) ────────────
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled  = scaler.transform(X_test)

# ═══════════════════════════════════════════════════════════
#   MODEL A  →  LINEAR REGRESSION  (Predict Marks)
# ═══════════════════════════════════════════════════════════
print("\n" + "="*60)
print("  MODEL A – LINEAR REGRESSION")
print("="*60)

lin_reg = LinearRegression()
lin_reg.fit(X_train, y_reg_train)

# Predictions
y_reg_pred = lin_reg.predict(X_test)

# Evaluation
mae  = mean_absolute_error(y_reg_test, y_reg_pred)
mse  = mean_squared_error(y_reg_test, y_reg_pred)
rmse = np.sqrt(mse)
r2   = r2_score(y_reg_test, y_reg_pred)

print(f"\n  Intercept      : {lin_reg.intercept_:.4f}")
for feat, coef in zip(FEATURES, lin_reg.coef_):
    print(f"  Coefficient [{feat}] : {coef:.4f}")

print(f"\n  ── Evaluation Metrics ──")
print(f"  MAE  : {mae:.4f}")
print(f"  MSE  : {mse:.4f}")
print(f"  RMSE : {rmse:.4f}")
print(f"  R²   : {r2:.4f}")

# ── PLOT 5: Actual vs Predicted (Linear Reg) ─────────────────
plt.figure(figsize=(8, 5))
plt.scatter(y_reg_test, y_reg_pred, color="#2ecc71", edgecolors="k", linewidth=0.4, s=70)
plt.plot(
    [y_reg_test.min(), y_reg_test.max()],
    [y_reg_test.min(), y_reg_test.max()],
    "r--", linewidth=2, label="Perfect Prediction"
)
plt.xlabel("Actual Marks", fontsize=12)
plt.ylabel("Predicted Marks", fontsize=12)
plt.title("Linear Regression – Actual vs Predicted Marks", fontsize=13, fontweight="bold")
plt.legend()
plt.tight_layout()
plt.savefig(os.path.join(PLOT_DIR, "linear_regression_pred.png"), dpi=150)
plt.close()
print("✔  Saved: linear_regression_pred.png")

# ═══════════════════════════════════════════════════════════
#   MODEL B  →  LOGISTIC REGRESSION  (Predict Pass/Fail)
# ═══════════════════════════════════════════════════════════
print("\n" + "="*60)
print("  MODEL B – LOGISTIC REGRESSION")
print("="*60)

log_reg = LogisticRegression(max_iter=1000, random_state=42)
log_reg.fit(X_train_scaled, y_cls_train)

# Predictions
y_cls_pred = log_reg.predict(X_test_scaled)

# Evaluation
acc = accuracy_score(y_cls_test, y_cls_pred)
cm  = confusion_matrix(y_cls_test, y_cls_pred)
cr  = classification_report(y_cls_test, y_cls_pred, target_names=["Fail", "Pass"])

print(f"\n  Accuracy        : {acc*100:.2f}%")
print(f"\n  Classification Report:\n{cr}")

# ── PLOT 6: Confusion Matrix ──────────────────────────────────
plt.figure(figsize=(6, 5))
sns.heatmap(
    cm, annot=True, fmt="d", cmap="Blues",
    xticklabels=["Fail", "Pass"],
    yticklabels=["Fail", "Pass"],
    linewidths=0.5
)
plt.xlabel("Predicted", fontsize=12)
plt.ylabel("Actual", fontsize=12)
plt.title("Logistic Regression – Confusion Matrix", fontsize=13, fontweight="bold")
plt.tight_layout()
plt.savefig(os.path.join(PLOT_DIR, "confusion_matrix.png"), dpi=150)
plt.close()
print("✔  Saved: confusion_matrix.png")

# ── PLOT 7: Model Comparison Bar Chart ───────────────────────
fig, axes = plt.subplots(1, 2, figsize=(12, 5))

# Left – Linear Regression metrics
metrics_lin = {"MAE": mae, "MSE": mse, "RMSE": rmse}
bars = axes[0].bar(
    metrics_lin.keys(),
    metrics_lin.values(),
    color=["#3498db", "#e74c3c", "#f39c12"],
    edgecolor="k", linewidth=0.6
)
axes[0].set_title("Linear Regression – Error Metrics", fontsize=12, fontweight="bold")
axes[0].set_ylabel("Value")
for bar in bars:
    axes[0].text(
        bar.get_x() + bar.get_width() / 2,
        bar.get_height() + 0.1,
        f"{bar.get_height():.2f}",
        ha="center", va="bottom", fontsize=10
    )

# Right – Logistic Regression accuracy vs R²
metrics_log = {"Log.Reg Accuracy": acc, "Lin.Reg R²": r2}
bars2 = axes[1].bar(
    metrics_log.keys(),
    metrics_log.values(),
    color=["#2ecc71", "#9b59b6"],
    edgecolor="k", linewidth=0.6
)
axes[1].set_ylim(0, 1.1)
axes[1].set_title("Model Performance Comparison", fontsize=12, fontweight="bold")
axes[1].set_ylabel("Score")
for bar in bars2:
    axes[1].text(
        bar.get_x() + bar.get_width() / 2,
        bar.get_height() + 0.01,
        f"{bar.get_height():.3f}",
        ha="center", va="bottom", fontsize=10
    )

plt.tight_layout()
plt.savefig(os.path.join(PLOT_DIR, "model_comparison.png"), dpi=150)
plt.close()
print("✔  Saved: model_comparison.png")

# ── 9. SAVE MODELS ──────────────────────────────────────────
print("\n" + "="*60)
print("  STEP 6 – SAVING MODELS")
print("="*60)

with open(os.path.join(MODEL_DIR, "linear.pkl"),   "wb") as f:
    pickle.dump(lin_reg, f)
print("✔  Saved: models/linear.pkl")

with open(os.path.join(MODEL_DIR, "logistic.pkl"), "wb") as f:
    pickle.dump(log_reg, f)
print("✔  Saved: models/logistic.pkl")

with open(os.path.join(MODEL_DIR, "scaler.pkl"),   "wb") as f:
    pickle.dump(scaler, f)
print("✔  Saved: models/scaler.pkl")

# ── 10. SUMMARY ─────────────────────────────────────────────
print("\n" + "="*60)
print("  TRAINING COMPLETE – SUMMARY")
print("="*60)
print(f"""
  Linear  Regression   →  R²={r2:.3f}  |  MAE={mae:.3f}  |  RMSE={rmse:.3f}
  Logistic Regression  →  Accuracy={acc*100:.1f}%
  Models saved to  : {MODEL_DIR}
  Plots  saved to  : {PLOT_DIR}
""")
