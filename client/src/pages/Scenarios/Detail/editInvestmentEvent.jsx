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
  width: '520px', maxWidth: '90vw', maxHeight: '90vh', overflowY: 'auto'
};
const formStyle = { display: 'flex', flexDirection: 'column', gap: '12px' };
const inputStyle = { padding: '8px', borderRadius: '4px', border: '1px solid #ccc' };
const textAreaStyle = { ...inputStyle, height: '80px', fontFamily: 'monospace' };
const buttonGroup = { display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' };

export default function EditInvestmentEvent({ open, investEvent, onClose, onSubmit }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDist, setStartDist] = useState(null);
  const [durationDist, setDurationDist] = useState(null);
  const [assetAllocJson, setAssetAllocJson] = useState('{}');
  const [glidePath, setGlidePath] = useState(false);
  const [assetAlloc2Json, setAssetAlloc2Json] = useState('{}');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open || !investEvent) return;
    setName(investEvent.name || '');
    setDescription(investEvent.description || '');
    setStartDist(investEvent.start?.startDistribution || null);
    setDurationDist(investEvent.duration || null);
    setAssetAllocJson(JSON.stringify(investEvent.assetAllocation || {}, null, 2));
    setGlidePath(!!investEvent.glidePath);
    setAssetAlloc2Json(JSON.stringify(investEvent.assetAllocation2 || {}, null, 2));
    setError('');
  }, [open, investEvent]);

  if (!open) return null;
  const validate = () => {
    if (!name.trim()) return 'Name is required';
    if (!startDist) return 'Start distribution required';
    if (!durationDist) return 'Duration distribution required';
    try { JSON.parse(assetAllocJson); } catch { return 'Asset allocation JSON invalid'; }
    try { JSON.parse(assetAlloc2Json); } catch { return 'Asset allocation 2 JSON invalid'; }
    return '';
  };

  const handleSubmit = e => {
    e.preventDefault();
    const err = validate();
    if (err) return setError(err);
    const updated = {
      ...investEvent,
      name: name.trim(),
      description: description.trim(),
      start: { startDistribution: startDist },
      duration: durationDist,
      assetAllocation: JSON.parse(assetAllocJson),
      glidePath,
      assetAllocation2: JSON.parse(assetAlloc2Json)
    };
    onSubmit(updated);
  };

  return ReactDOM.createPortal(
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={e => e.stopPropagation()}>
        <h2>Edit Invest Event</h2>
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
          <label>Asset Allocation (JSON):</label>
          <textarea style={textAreaStyle} value={assetAllocJson} onChange={e => setAssetAllocJson(e.target.value)} />
          <label><input type="checkbox" checked={glidePath} onChange={e => setGlidePath(e.target.checked)} /> Glide Path</label>
          <label>Asset Allocation 2 (JSON):</label>
          <textarea style={textAreaStyle} value={assetAlloc2Json} onChange={e => setAssetAlloc2Json(e.target.value)} />
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
