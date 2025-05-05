import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import ValueDistEdit from './valDistEdit';

const overlayStyle = {
  position: 'fixed', top: 0, left: 0,
  width: '100vw', height: '100vh',
  backgroundColor: 'rgba(0,0,0,0.5)',
  display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
};
const modalStyle = {
  background: '#fff', padding: '20px', borderRadius: '6px',
  width: '500px', maxWidth: '90vw', maxHeight: '90vh', overflowY: 'auto'
};
const formStyle = { display: 'flex', flexDirection: 'column', gap: '12px' };
const inputStyle = { padding: '8px', borderRadius: '4px', border: '1px solid #ccc' };
const buttonGroup = { display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' };

export default function EditIncomeEvent({ open, incomeEvent, onClose, onSubmit }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDist, setStartDist] = useState(null);
  const [durationDist, setDurationDist] = useState(null);
  const [initialAmount, setInitialAmount] = useState('');
  const [changeAmtOrPct, setChangeAmtOrPct] = useState('');
  const [changeDist, setChangeDist] = useState(null);
  const [inflationAdjusted, setInflationAdjusted] = useState(false);
  const [userFraction, setUserFraction] = useState('1.0');
  const [socialSecurity, setSocialSecurity] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open || !incomeEvent) return;
    setName(incomeEvent.name || '');
    setDescription(incomeEvent.description || '');
    setStartDist(incomeEvent.start?.startDistribution || null);
    setDurationDist(incomeEvent.duration || null);
    setInitialAmount(incomeEvent.initialAmount?.toString() || '');
    setChangeAmtOrPct(incomeEvent.changeAmtOrPct?.toString() || '');
    setChangeDist(incomeEvent.changeDistribution || null);
    setInflationAdjusted(!!incomeEvent.inflationAdjusted);
    setUserFraction(incomeEvent.userFraction?.toString() || '1.0');
    setSocialSecurity(!!incomeEvent.socialSecurity);
    setError('');
  }, [open, incomeEvent]);

  if (!open) return null;
  const validate = () => {
    if (!name.trim()) return 'Name is required';
    if (isNaN(Number(initialAmount))) return 'Initial amount must be numeric';
    if (!changeAmtOrPct.trim()) return 'Change amount/pct is required';
    if (!startDist) return 'Start distribution required';
    if (!durationDist) return 'Duration distribution required';
    if (!changeDist) return 'Change distribution required';
    if (isNaN(Number(userFraction))) return 'User fraction must be numeric';
    return '';
  };

  const handleSubmit = e => {
    e.preventDefault();
    const err = validate();
    if (err) return setError(err);
    const updated = {
      ...incomeEvent,
      name: name.trim(),
      description: description.trim(),
      start: { startDistribution: startDist },
      duration: durationDist,
      initialAmount: Number(initialAmount),
      changeAmtOrPct: changeAmtOrPct.trim(),
      changeDistribution: changeDist,
      inflationAdjusted,
      userFraction: Number(userFraction),
      socialSecurity
    };
    onSubmit(updated);
  };

  return ReactDOM.createPortal(
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={e => e.stopPropagation()}>
        <h2>Edit Income Event</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <form style={formStyle} onSubmit={handleSubmit}>
          <input style={inputStyle} placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
          <input style={inputStyle} placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
          <div>
            <label>Start Distribution:</label>
            <ValueDistEdit distribution={startDist} onChange={setStartDist} />
          </div>
          <div>
            <label>Duration Distribution:</label>
            <ValueDistEdit distribution={durationDist} onChange={setDurationDist} />
          </div>
          <input style={inputStyle} placeholder="Initial Amount" value={initialAmount} onChange={e => setInitialAmount(e.target.value)} />
          <input style={inputStyle} placeholder="Change Amount or %" value={changeAmtOrPct} onChange={e => setChangeAmtOrPct(e.target.value)} />
          <div>
            <label>Change Distribution:</label>
            <ValueDistEdit distribution={changeDist} onChange={setChangeDist} />
          </div>
          <label>
            <input type="checkbox" checked={inflationAdjusted} onChange={e => setInflationAdjusted(e.target.checked)} /> Inflation Adjusted
          </label>
          <input style={inputStyle} placeholder="User Fraction" value={userFraction} onChange={e => setUserFraction(e.target.value)} />
          <label>
            <input type="checkbox" checked={socialSecurity} onChange={e => setSocialSecurity(e.target.checked)} /> Social Security
          </label>
          <div style={buttonGroup}>
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit">Save</button>
          </div>
        </form>
      </div>
    </div>,
    document.getElementById('modal-root')
  );
}
