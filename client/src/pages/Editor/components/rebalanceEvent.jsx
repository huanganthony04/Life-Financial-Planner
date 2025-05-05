import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ValueDist from './valueDistribution';
import InvestmentList from './investmentList';
import RebalanceEventList from './rebalanceEventList';

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

const RebalanceEvent = ({ scenarioId, scenarioName }) => {
  const navigate = useNavigate();

  // Event details
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');

  // Start distribution
  const [distMode1, setDistMode1] = useState('normal');
  const [fixedValue1, setFixedValue1] = useState('');
  const [mu1, setMu1] = useState('');
  const [sigma1, setSigma1] = useState('');
  const [upper1, setUpper1] = useState('');
  const [lower1, setLower1] = useState('');
  const [startsWith1, setStartsWith1] = useState('');

  // Duration distribution
  const [distMode2, setDistMode2] = useState('normal');
  const [fixedValue2, setFixedValue2] = useState('');
  const [mu2, setMu2] = useState('');
  const [sigma2, setSigma2] = useState('');
  const [upper2, setUpper2] = useState('');
  const [lower2, setLower2] = useState('');

  // Asset allocation inputs
  const [aAInitial, changeaAInitial] = useState(new Map());
  const [aAFinal, changeaAFinal]     = useState(new Map());

  // Build start object
  const start =
    distMode1 === 'fixed'
      ? { startDistribution: { distType: 'fixed', value: fixedValue1 }, startWith: startsWith1 }
      : distMode1 === 'uniform'
      ? { startDistribution: { distType: 'uniform', lower: lower1, upper: upper1 }, startWith: startsWith1 }
      : { startDistribution: { distType: 'normal', mean: mu1, sigma: sigma1 }, startWith: startsWith1 };

  // Build duration object
  const duration =
    distMode2 === 'fixed'
      ? { distType: 'fixed', value: fixedValue2 }
      : distMode2 === 'uniform'
      ? { distType: 'uniform', lower: lower2, upper: upper2 }
      : { distType: 'normal', mean: mu2, sigma: sigma2 };

  // Validation flags
  const isNameValid = title.trim().length > 0;
  const isStartValid =
    (distMode1 === 'fixed' && fixedValue1) ||
    (distMode1 === 'uniform' && lower1 && upper1) ||
    (distMode1 === 'normal' && mu1 && sigma1);
  const isDurationValid =
    (distMode2 === 'fixed' && fixedValue2) ||
    (distMode2 === 'uniform' && lower2 && upper2) ||
    (distMode2 === 'normal' && mu2 && sigma2);
  const isFormValid = isNameValid && isStartValid && isDurationValid;

  // Submit handler
  const handleSubmit = async () => {
    if (!isFormValid) return;

    // Build allocation object
    const assetAllocation = {};
    for (const [key, value] of aAInitial) {
      if (value !== '') assetAllocation[key] = Number(value);
    }

    try {
      await axios.post('http://localhost:8080/api/postRebalanceEventnew', {
        scenarioId,
        title,
        summary,
        start,
        duration,
        assetAllocation
      });
      navigate(
        '/scenario/detail?id=' + scenarioId,
        { state: { scenario: { name: scenarioName, scenarioId } } }
      );
    } catch (error) {
      console.error('Error posting rebalance event:', error);
      alert('There was an error submitting the form. Please try again.');
    }
  };

  return (
    <div className="rebalance-event-container">
      <h1>Create Rebalance Event</h1>

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
            placeholder="Starts with event series name"
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
        <legend>Asset Allocation <span>*</span></legend>
        <InvestmentList
          isRebalance={true}
          changeaAInitial={changeaAInitial}
          aAInitial={aAInitial}
          changeaAFinal={changeaAFinal}
          aAFinal={aAFinal}
          glideStatus={false}
          scenarioId={scenarioId}
          defaultValOfReveal={false}
        />
      </fieldset>

      <button
        style={styles.submitButton}
        onClick={handleSubmit}
        disabled={!isFormValid}
      >
        Create Event
      </button>

      <RebalanceEventList scenarioId={scenarioId} />
    </div>
  );
};

export default RebalanceEvent;
