import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ValueDist from './valueDistribution';
import InvestmentList from './investmentList';
import InvestmentEventList from './investmentEventList';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL

// Styles for form spacing
const styles = {
  formSection: { marginBottom: '2rem', border: '1px solid #e0e0e0', padding: '1rem', borderRadius: '0.5rem' },
  formGroup: { marginBottom: '1rem', display: 'flex', flexDirection: 'column' },
  submitButton: { padding: '0.75rem 1.5rem', fontSize: '1rem', borderRadius: '0.5rem', cursor: 'pointer' }
};

const InvestmentEvent = ({ scenarioId, scenarioName }) => {
  const navigate = useNavigate();

  // State hooks
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [glideStatus, setGlideStatus] = useState(true);
  const [maxCash, setMaxCash] = useState(0)

  // Distribution state (start)
  const [distMode1, setDistMode1] = useState('normal');
  const [fixedValue1, setFixedValue1] = useState('');
  const [mu1, setMu1] = useState('');
  const [sigma1, setSigma1] = useState('');
  const [upper1, setUpper1] = useState('');
  const [lower1, setLower1] = useState('');
  const [startsWith1, setStartsWith1] = useState('');

  // Distribution state (duration)
  const [distMode2, setDistMode2] = useState('normal');
  const [fixedValue2, setFixedValue2] = useState('');
  const [mu2, setMu2] = useState('');
  const [sigma2, setSigma2] = useState('');
  const [upper2, setUpper2] = useState('');
  const [lower2, setLower2] = useState('');

  // Asset allocations
  const [aAInitial, changeaAInitial] = useState(new Map());
  const [aAFinal, changeaAFinal] = useState(new Map());

  // Handlers
  const handleGlideChange = () => {
    setGlideStatus(!glideStatus);
    changeaAInitial(new Map());
    changeaAFinal(new Map());
  };

  // Build distributions
  const start =
    distMode1 === 'fixed'
      ? { startDistribution: { distType: distMode1, value: fixedValue1 }, startWith: startsWith1 }
      : distMode1 === 'uniform'
      ? { startDistribution: { distType: distMode1, lower: lower1, upper: upper1 }, startWith: startsWith1 }
      : { startDistribution: { distType: distMode1, mean: mu1, sigma: sigma1 }, startWith: startsWith1 };

  const duration =
    distMode2 === 'fixed'
      ? { distType: distMode2, value: fixedValue2 }
      : distMode2 === 'uniform'
      ? { distType: distMode2, lower: lower2, upper: upper2 }
      : { distType: distMode2, mean: mu2, sigma: sigma2 };

  // Validation
  const isNameValid = title.trim().length > 0;
  const isStartValid =
    (distMode1 === 'fixed' && fixedValue1) ||
    (distMode1 === 'uniform' && upper1 && lower1) ||
    (distMode1 === 'normal' && mu1 && sigma1);
  const isDurationValid =
    (distMode2 === 'fixed' && fixedValue2) ||
    (distMode2 === 'uniform' && upper2 && lower2) ||
    (distMode2 === 'normal' && mu2 && sigma2);
  const isFormValid = isNameValid && isStartValid && isDurationValid;

  // Submit
  const handleSubmit = async () => {
    if (!isFormValid) return;

    const assetAllocationI = {};
    const assetAllocationF = {};

    for (const [key, value] of aAInitial) {
      if (value !== '') assetAllocationI[key] = Number(value);
    }
    for (const [key, value] of aAFinal) {
      if (glideStatus && value !== '') assetAllocationF[key] = Number(value);
    }

    const newInvestEvent = {
      name: title,
      description: summary,
      start: start,
      duration: duration,
      assetAllocation: assetAllocationI,
      glidePath: glideStatus,
      assetAllocation2: assetAllocationF,
      maxCash: maxCash
    }

    try {
      await axios.post(`${BACKEND_URL}/api/events/create/invest`, { scenarioId: scenarioId, event: newInvestEvent }, { withCredentials: true });
      navigate('/scenario/detail?id=' + scenarioId, { state: { scenario: { name: scenarioName, scenarioId } } });
    } catch (error) {
      console.error('Error posting investment event:', error);
      alert('There was an error submitting the form. Please try again.');
    }
  };

  return (
    <div className='investment-event-container'>
      <h1>Create Investment Event</h1>

      <fieldset style={styles.formSection}>
        <legend>Event Details</legend>
        <div style={styles.formGroup}>
          <label>Name <span>*</span></label>
          <input
            type='text'
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder='Event name'
          />
        </div>
        <div style={styles.formGroup}>
          <label>Description <span>(optional)</span></label>
          <input
            type='text'
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder='Brief summary'
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
            type='text'
            value={startsWith1}
            onChange={(e) => setStartsWith1(e.target.value)}
            placeholder='Starts with event series name'
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
        <legend>Cash ($)</legend>
        <input
          type='number'
          value={maxCash}
          onChange={(e) => setMaxCash(e.target.value)}
          placeholder='Maximum Cash to Hold'
        />
      </fieldset>

      <fieldset style={styles.formSection}>
        <legend>Asset Allocation <span>*</span></legend>
        <div style={styles.formGroup}>
          <label><input type='checkbox' checked={glideStatus} onChange={handleGlideChange} /> Glide Path</label>
        </div>
        <InvestmentList
          changeaAFinal={changeaAFinal}
          changeaAInitial={changeaAInitial}
          aAFinal={aAFinal}
          aAInitial={aAInitial}
          glideStatus={glideStatus}
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

      <InvestmentEventList scenarioId={scenarioId} />
    </div>
  );
};

export default InvestmentEvent;
