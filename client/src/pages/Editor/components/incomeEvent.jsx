// IncomeEvent.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ValueDist from "./valueDistribution";
import IncomeEventList from "./incomeEventList";

// Styles for form spacing
const styles = {
  formSection: {
    marginBottom: '2rem',
    border: '1px solid #e0e0e0',
    padding: '1rem',
    borderRadius: '0.5rem'
  },
  formGroup: {
    marginBottom: '1rem',
    display: 'flex',
    flexDirection: 'column'
  },
  submitButton: {
    padding: '0.75rem 1.5rem',
    fontSize: '1rem',
    borderRadius: '0.5rem',
    cursor: 'pointer'
  }
};

const IncomeEvent = ({ scenarioId, scenarioName }) => {
  const navigate = useNavigate();

  // State hooks
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [socialSecurityStatus, setSSN] = useState(true);
  const [inflationStatus, setInflation] = useState(true);
  const [userFrac, setUserFrac] = useState(1.0);
  const [amountOrPercent, setAmountOrPercent] = useState("amount");
  const [initial, setInitial] = useState("");

  // Distribution state hooks (start)
  const [distMode1, setDistMode1] = useState("normal");
  const [fixedValue1, setFixedValue1] = useState("");
  const [mu1, setMu1] = useState("");
  const [sigma1, setSigma1] = useState("");
  const [upper1, setUpper1] = useState("");
  const [lower1, setLower1] = useState("");
  const [startsWith1, setStartsWith1] = useState("");
  // Distribution state hooks (duration)
  const [distMode2, setDistMode2] = useState("normal");
  const [fixedValue2, setFixedValue2] = useState("");
  const [mu2, setMu2] = useState("");
  const [sigma2, setSigma2] = useState("");
  const [upper2, setUpper2] = useState("");
  const [lower2, setLower2] = useState("");
  // Distribution state hooks (change)
  const [distMode, setDistMode] = useState("normal");
  const [fixedValue, setFixedValue] = useState("");
  const [mu, setMu] = useState("");
  const [sigma, setSigma] = useState("");
  const [upper, setUpper] = useState("");
  const [lower, setLower] = useState("");

  // Handlers
  const handleCheckbox = () => setInflation(!inflationStatus);
  const handleSSN = () => setSSN(!socialSecurityStatus);

  // Build distributions
  const start =
    distMode1 === "fixed"
      ? { startDistribution: { distType: distMode1, value: fixedValue1 }, startWith: startsWith1 }
      : distMode1 === "uniform"
      ? { startDistribution: { distType: distMode1, lower: lower1, upper: upper1 }, startWith: startsWith1 }
      : { startDistribution: { distType: distMode1, mean: mu1, sigma: sigma1 }, startWith: startsWith1 };

  const duration =
    distMode2 === "fixed"
      ? { distType: distMode2, value: fixedValue2 }
      : distMode2 === "uniform"
      ? { distType: distMode2, lower: lower2, upper: upper2 }
      : { distType: distMode2, mean: mu2, sigma: sigma2 };

  const changeDistribution =
    distMode === "fixed"
      ? { distType: distMode, value: fixedValue }
      : distMode === "uniform"
      ? { distType: distMode, lower, upper }
      : { distType: distMode, mean: mu, sigma };

  // Validation checks
  const isNameValid = title.trim().length > 0;
  const isStartValid =
    (distMode1 === "fixed" && fixedValue1) ||
    (distMode1 === "uniform" && upper1 && lower1) ||
    (distMode1 === "normal" && mu1 && sigma1);
  const isDurationValid =
    (distMode2 === "fixed" && fixedValue2) ||
    (distMode2 === "uniform" && upper2 && lower2) ||
    (distMode2 === "normal" && mu2 && sigma2);
  const isChangeValid =
    (distMode === "fixed" && fixedValue) ||
    (distMode === "uniform" && upper && lower) ||
    (distMode === "normal" && mu && sigma);
  const isMiscValid =
    initial !== "" && ["amount", "percent"].includes(amountOrPercent) && userFrac >= 0 && userFrac <= 1;

  const isFormValid =
    isNameValid && isStartValid && isDurationValid && isChangeValid && isMiscValid;

  // Submit
  const handleSubmit = async () => {
    if (!isFormValid) return;
    try {
      await axios.post("http://localhost:8080/api/postIncomenew", {
        scenarioId,
        title,
        changeDistribution,
        summary,
        socialSecurityStatus,
        inflationStatus,
        start,
        duration,
        userFrac,
        amountOrPercent,
        initial,
      });
      navigate(
        `/scenario/detail?id=${scenarioId}`,
        { state: { scenario: { name: scenarioName, scenarioId } } }
      );
    } catch (error) {
      console.error("Error posting income event:", error);
      alert("There was an error submitting the form. Please try again.");
    }
  };

  return (
    <div className="income-event-container">
      <h1>Create Income Event</h1>

      <fieldset style={styles.formSection}>
        <legend>Event Details</legend>
        <div style={styles.formGroup}>
          <label>Name <span>*</span></label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Event name"
          />
        </div>
        <div style={styles.formGroup}>
          <label>Description <span>(optional)</span></label>
          <input
            type="text"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Brief summary"
          />
        </div>
      </fieldset>

      <fieldset style={styles.formSection}>
        <legend>Timing</legend>
        <div style={styles.formGroup}>
          <label>Start <span>*</span></label>
          <ValueDist
            setdistMode={setDistMode1}
            setUpper={setUpper1}
            setLower={setLower1}
            setFixedValue={setFixedValue1}
            setMu={setMu1}
            setSigma={setSigma1}
          />
          <input
            type="text"
            value={startsWith1}
            onChange={(e) => setStartsWith1(e.target.value)}
            placeholder="Starts with event series name (optional)"
          />
        </div>
        <div style={styles.formGroup}>
          <label>Duration <span>*</span></label>
          <ValueDist
            setdistMode={setDistMode2}
            setUpper={setUpper2}
            setLower={setLower2}
            setFixedValue={setFixedValue2}
            setMu={setMu2}
            setSigma={setSigma2}
          />
        </div>
      </fieldset>

      <fieldset style={styles.formSection}>
        <legend>Change Distribution <span>*</span></legend>
        <div style={styles.formGroup}>
          <ValueDist
            setdistMode={setDistMode}
            setUpper={setUpper}
            setLower={setLower}
            setFixedValue={setFixedValue}
            setMu={setMu}
            setSigma={setSigma}
          />
        </div>
      </fieldset>

      <fieldset style={styles.formSection}>
        <legend>Miscellaneous <span>*</span></legend>
        <div style={styles.formGroup}>
          <label>Initial Amount</label>
          <input
            type="number"
            value={initial}
            onChange={(e) => setInitial(e.target.value)}
            placeholder="Initial amount"
          />
        </div>
        <div style={styles.formGroup}>
          <label>Amount or Percent</label>
          <select
            value={amountOrPercent}
            onChange={(e) => setAmountOrPercent(e.target.value)}
          >
            <option value="amount">Amount</option>
            <option value="percent">Percent</option>
          </select>
        </div>
        <div style={styles.formGroup}>
          <label>
            <input
              type="checkbox"
              checked={inflationStatus}
              onChange={handleCheckbox}
            /> Inflation Adjusted
          </label>
        </div>
        <div style={styles.formGroup}>
          <label>
            <input
              type="checkbox"
              checked={socialSecurityStatus}
              onChange={handleSSN}
            /> Social Security
          </label>
        </div>
        <div style={styles.formGroup}>
          <label>User Fraction (0–1)</label>
          <input
            type="number"
            step="0.01"
            value={userFrac}
            onChange={(e) => setUserFrac(e.target.value)}
            placeholder="User fraction"
          />
        </div>
      </fieldset>

      <button
        style={styles.submitButton}
        onClick={handleSubmit}
        disabled={!isFormValid}
      >
        Create Event
      </button>

      <IncomeEventList scenarioId={scenarioId} />
    </div>
  );
};

export default IncomeEvent;
