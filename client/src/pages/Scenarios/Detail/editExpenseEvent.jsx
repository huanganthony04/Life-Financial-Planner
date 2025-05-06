// EditExpenseEvent.jsx
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import ValueDistEdit from './valDistEdit';

const overlayStyle = {
  position: 'fixed',
  top: 0, left: 0,
  width: '100vw', height: '100vh',
  backgroundColor: 'rgba(0,0,0,0.5)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000
};
const modalStyle = {
  background: '#fff',
  padding: '20px',
  borderRadius: '6px',
  width: '500px',
  maxWidth: '90vw',
  maxHeight: '90vh',
  overflowY: 'auto'
};
const formStyle = { display: 'flex', flexDirection: 'column', gap: '12px' };
const inputStyle = { padding: '8px', borderRadius: '4px', border: '1px solid #ccc' };
const buttonGroup = { display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' };
const errorMsg = { color: 'red', fontSize: '0.9rem' };

export default function EditExpenseEvent({ open, expenseEvent, onClose, onSubmit }) {
  const [name, setName]                     = useState('');
  const [description, setDescription]       = useState('');
  const [startDist, setStartDist]           = useState(null);
  const [durationDist, setDurationDist]     = useState(null);
  const [initialAmount, setInitialAmount]   = useState('');
  const [changeAmtOrPct, setChangeAmtOrPct] = useState('');
  const [changeDist, setChangeDist]         = useState(null);
  const [inflationAdjusted, setInflationAdjusted] = useState(false);
  const [userFraction, setUserFraction]     = useState('1.0');
  const [discretionary, setDiscretionary]   = useState(false);

  // 1) Seed state on open
  useEffect(() => {
    if (!open || !expenseEvent) return;
    setName(expenseEvent.name || '');
    setDescription(expenseEvent.description || '');
    setStartDist(expenseEvent.start?.startDistribution || null);
    setDurationDist(expenseEvent.duration || null);
    setInitialAmount(expenseEvent.initialAmount?.toString() || '');
    setChangeAmtOrPct(expenseEvent.changeAmtOrPct?.toString() || '');
    setChangeDist(expenseEvent.changeDistribution || null);
    setInflationAdjusted(!!expenseEvent.inflationAdjusted);
    setUserFraction(expenseEvent.userFraction?.toString() || '1.0');
    setDiscretionary(!!expenseEvent.discretionary);
  }, [open, expenseEvent]);

  if (!open) return null;

  // 2) Validation flags (copied from your Create form)
  const isNameValid = name.trim().length > 0;

  const isStartValid = !!startDist && (
    (startDist.distType === 'fixed'   && typeof startDist.value === 'number') ||
    (['normal','GBM'].includes(startDist.distType) &&
       typeof startDist.mean  === 'number' &&
       typeof startDist.sigma === 'number') ||
    (startDist.distType === 'uniform' &&
       typeof startDist.lower === 'number' &&
       typeof startDist.upper === 'number')
  );

  const isDurationValid = !!durationDist && (
    (durationDist.distType === 'fixed'   && typeof durationDist.value === 'number') ||
    (['normal','GBM'].includes(durationDist.distType) &&
       typeof durationDist.mean  === 'number' &&
       typeof durationDist.sigma === 'number') ||
    (durationDist.distType === 'uniform' &&
       typeof durationDist.lower === 'number' &&
       typeof durationDist.upper === 'number')
  );

  const isChangeValid = !!changeDist && (
    (changeDist.distType === 'fixed'   && typeof changeDist.value === 'number') ||
    (['normal','GBM'].includes(changeDist.distType) &&
       typeof changeDist.mean  === 'number' &&
       typeof changeDist.sigma === 'number') ||
    (changeDist.distType === 'uniform' &&
       typeof changeDist.lower === 'number' &&
       typeof changeDist.upper === 'number')
  );

  const isMiscValid =
    initialAmount !== '' &&
    !isNaN(Number(initialAmount)) &&
    ['amount','percent'].includes(typeof changeAmtOrPct === 'string' ? changeAmtOrPct : '') &&
    userFraction !== '' &&
    !isNaN(Number(userFraction)) &&
    Number(userFraction) >= 0 &&
    Number(userFraction) <= 1;

  const isFormValid =
    isNameValid &&
    isStartValid &&
    isDurationValid &&
    isChangeValid &&
    isMiscValid;

  // 3) Submit handler
  const handleSubmit = e => {
    e.preventDefault();
    if (!isFormValid) return;
    onSubmit({
      ...expenseEvent,
      name:               name.trim(),
      description:        description.trim(),
      start:              { startDistribution: startDist },
      duration:           durationDist,
      initialAmount:      Number(initialAmount),
      changeAmtOrPct:     changeAmtOrPct.trim(),
      changeDistribution: changeDist,
      inflationAdjusted,
      userFraction:       Number(userFraction),
      discretionary
    });
  };

  return ReactDOM.createPortal(
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={e => e.stopPropagation()}>
        <h2>Edit Expense Event</h2>

        <form style={formStyle} onSubmit={handleSubmit}>
          <input
            style={inputStyle}
            placeholder="Name *"
            value={name}
            onChange={e => setName(e.target.value)}
          />
          {!isNameValid && <div style={errorMsg}>Name is required.</div>}

          <input
            style={inputStyle}
            placeholder="Description"
            value={description}
            onChange={e => setDescription(e.target.value)}
          />

          <label>Start Distribution *</label>
          <ValueDistEdit distribution={startDist} onChange={setStartDist} />
          {!isStartValid && <div style={errorMsg}>Please complete start distribution.</div>}

          <label>Duration Distribution *</label>
          <ValueDistEdit distribution={durationDist} onChange={setDurationDist} />
          {!isDurationValid && <div style={errorMsg}>Please complete duration distribution.</div>}

          <label>Change Distribution *</label>
          <ValueDistEdit distribution={changeDist} onChange={setChangeDist} />
          {!isChangeValid && <div style={errorMsg}>Please complete change distribution.</div>}

          <input
            style={inputStyle}
            placeholder="Initial Amount *"
            value={initialAmount}
            onChange={e => setInitialAmount(e.target.value)}
          />
          {!(!isNaN(Number(initialAmount))) && <div style={errorMsg}>Must be a number.</div>}

          <input
            style={inputStyle}
            placeholder="Change Amount or % *"
            value={changeAmtOrPct}
            onChange={e => setChangeAmtOrPct(e.target.value)}
          />

          <label>
            <input
              type="checkbox"
              checked={inflationAdjusted}
              onChange={e => setInflationAdjusted(e.target.checked)}
            /> Inflation Adjusted
          </label>

          <input
            style={inputStyle}
            placeholder="User Fraction (0–1) *"
            value={userFraction}
            onChange={e => setUserFraction(e.target.value)}
          />
          {!(userFraction !== '' &&
             !isNaN(Number(userFraction)) &&
             Number(userFraction) >=0 &&
             Number(userFraction) <=1) &&
            <div style={errorMsg}>Enter a fraction between 0 and 1.</div>
          }

          <label>
            <input
              type="checkbox"
              checked={discretionary}
              onChange={e => setDiscretionary(v => !v)}
            /> Discretionary
          </label>

          <div style={buttonGroup}>
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit" disabled={!isFormValid}>Save</button>
          </div>
        </form>
      </div>
    </div>,
    document.getElementById('modal-root')
  );
}
