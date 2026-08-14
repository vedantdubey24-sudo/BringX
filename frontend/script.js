/**
 * ============================================================
 *  Student Performance Predictor – Frontend Logic
 *  Handles form validation, API call, and result rendering.
 * ============================================================
 */

// ── Configuration ────────────────────────────────────────────
const API_URL   = "http://127.0.0.1:5000/predict";
const TOAST_MS  = 4000;   // toast auto-hide duration

// ── DOM References ───────────────────────────────────────────
const form          = document.getElementById("predict-form");
const submitBtn     = document.getElementById("submit-btn");
const resultsSection= document.getElementById("results-section");
const predictedMarks= document.getElementById("predicted-marks");
const resultLabel   = document.getElementById("result-label");
const resultCard    = document.getElementById("result-card");
const resultSubtitle= document.getElementById("result-subtitle");
const probBar       = document.getElementById("prob-bar");
const probLabel     = document.getElementById("prob-label");
const inputSummary  = document.getElementById("input-summary");
const errorToast    = document.getElementById("error-toast");

// ── Utility: Show error toast ────────────────────────────────
let toastTimer = null;

function showError(message) {
  clearTimeout(toastTimer);
  errorToast.textContent = "⚠️  " + message;
  errorToast.style.display = "block";
  toastTimer = setTimeout(() => {
    errorToast.style.display = "none";
  }, TOAST_MS);
}

// ── Utility: Set loading state ───────────────────────────────
function setLoading(isLoading) {
  submitBtn.disabled = isLoading;
  submitBtn.classList.toggle("loading", isLoading);
}

// ── Utility: Validate form inputs ────────────────────────────
function validateInputs(hours, attendance, previous) {
  if (isNaN(hours) || isNaN(attendance) || isNaN(previous)) {
    return "Please fill in all three fields with valid numbers.";
  }
  if (hours < 0 || hours > 24) {
    return "Study hours must be between 0 and 24.";
  }
  if (attendance < 0 || attendance > 100) {
    return "Attendance must be between 0 and 100.";
  }
  if (previous < 0 || previous > 100) {
    return "Previous marks must be between 0 and 100.";
  }
  return null; // no error
}

// ── Utility: Animate a number counter ────────────────────────
function animateCounter(element, targetValue, unit = "", duration = 800) {
  const start     = performance.now();
  const startVal  = 0;

  function step(timestamp) {
    const elapsed  = timestamp - start;
    const progress = Math.min(elapsed / duration, 1);
    // Ease-out cubic
    const eased    = 1 - Math.pow(1 - progress, 3);
    const current  = startVal + (targetValue - startVal) * eased;

    element.innerHTML = `${current.toFixed(1)}${unit}`;

    if (progress < 1) requestAnimationFrame(step);
    else element.innerHTML = `${targetValue.toFixed(2)}${unit}`;
  }

  requestAnimationFrame(step);
}

// ── Render results ───────────────────────────────────────────
function renderResults(data, inputHours, inputAtt, inputPrev) {
  const { predicted_marks, result, probability } = data;

  // --- Predicted Marks ---
  const marksSpan = document.createElement("span");
  marksSpan.innerHTML = `0.00<span class="metric-unit">/ 100</span>`;
  predictedMarks.innerHTML = "";
  predictedMarks.appendChild(marksSpan);
  // Animate the number
  animateCounter(marksSpan, predicted_marks, `<span class="metric-unit">/ 100</span>`);
  // Override the counter target at end
  setTimeout(() => {
    marksSpan.innerHTML = `${predicted_marks.toFixed(2)}<span class="metric-unit">/ 100</span>`;
  }, 850);

  // --- Pass / Fail label ---
  const isPass = result === "Pass";
  resultLabel.textContent = isPass ? "✅ Pass" : "❌ Fail";
  resultCard.className    = `metric-card ${isPass ? "pass-card" : "fail-card"}`;

  // --- Confidence bar ---
  probBar.className   = `prob-bar ${isPass ? "pass" : "fail"}`;
  setTimeout(() => { probBar.style.width = probability + "%"; }, 50);
  probLabel.textContent = `Confidence: ${probability}%`;

  // --- Subtitle ---
  resultSubtitle.textContent =
    `The model predicts you will ${result} with ${probability}% confidence.`;

  // --- Input summary tags ---
  inputSummary.innerHTML = `
    <span class="tag">⏱️ Hours: <strong>${inputHours}</strong></span>
    <span class="tag">📅 Attendance: <strong>${inputAtt}%</strong></span>
    <span class="tag">📝 Previous: <strong>${inputPrev}</strong></span>
  `;

  // --- Show results section ---
  resultsSection.style.display = "block";
  // Smooth scroll to results
  setTimeout(() => {
    resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 100);
}

// ── Form submit handler ──────────────────────────────────────
form.addEventListener("submit", async function (event) {
  event.preventDefault();

  // Read values
  const hours      = parseFloat(document.getElementById("hours").value);
  const attendance = parseFloat(document.getElementById("attendance").value);
  const previous   = parseFloat(document.getElementById("previous").value);

  // Validate
  const validationError = validateInputs(hours, attendance, previous);
  if (validationError) {
    showError(validationError);
    return;
  }

  // Start loading
  setLoading(true);
  resultsSection.style.display = "none";

  try {
    // ── API Call ────────────────────────────────────────────
    const response = await fetch(API_URL, {
      method : "POST",
      headers: { "Content-Type": "application/json" },
      body   : JSON.stringify({
        hours      : hours,
        attendance : attendance,
        previous   : previous
      })
    });

    const data = await response.json();

    if (!response.ok) {
      // API returned an error (4xx / 5xx)
      const msg = data.error || "Server error. Please try again.";
      showError(msg);
      return;
    }

    // ── Render results ──────────────────────────────────────
    renderResults(data, hours, attendance, previous);

  } catch (err) {
    // Network failure or JSON parse error
    if (err instanceof TypeError && err.message.includes("fetch")) {
      showError(
        "Cannot connect to the API server. " +
        "Make sure Flask is running on http://127.0.0.1:5000"
      );
    } else {
      showError("An unexpected error occurred: " + err.message);
    }
  } finally {
    setLoading(false);
  }
});

// ── Keyboard accessibility: submit on Enter ──────────────────
document.addEventListener("keydown", function (e) {
  if (e.key === "Enter" && document.activeElement.tagName === "INPUT") {
    form.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
  }
});

// ── Input field: clear error when user starts typing ─────────
["hours", "attendance", "previous"].forEach(id => {
  document.getElementById(id).addEventListener("input", () => {
    errorToast.style.display = "none";
  });
});

// ── Log API status on page load ──────────────────────────────
(async function checkAPIStatus() {
  try {
    const res  = await fetch("http://127.0.0.1:5000/");
    const data = await res.json();
    if (data.models_ready) {
      console.info("✅ Flask API is running – models loaded.");
    } else {
      console.warn("⚠️  Flask API running but models not loaded yet.");
    }
  } catch (_) {
    console.warn(
      "⚠️  Flask API is not reachable. Start it with:  python backend/app.py"
    );
  }
})();
