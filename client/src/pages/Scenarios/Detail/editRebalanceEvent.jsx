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
const textAreaStyle = { ...inputStyle, height: '80px', fontFamily: 'monospace' };
const buttonGroup = { display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' };

export default function EditRebalanceEvent({ open, rebalanceEvent, onClose, onSubmit }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDist, setStartDist] = useState(null);
  const [durationDist, setDurationDist] = useState(null);
  const [assetAllocJson, setAssetAllocJson] = useState('{}');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open || !rebalanceEvent) return;
    setName(rebalanceEvent.name || '');
    setDescription(rebalanceEvent.description || '');
    setStartDist(rebalanceEvent.start?.startDistribution || null);
    setDurationDist(rebalanceEvent.duration || null);
    setAssetAllocJson(JSON.stringify(rebalanceEvent.assetAllocation || {}, null, 2));
    setError('');
  }, [open, rebalanceEvent]);

  if (!open) return null;
  const validate = () => {
    if (!name.trim()) return 'Name is required';
    if (!startDist) return 'Start distribution required';
    if (!durationDist) return 'Duration distribution required';
    try { JSON.parse(assetAllocJson); } catch { return 'Asset allocation JSON invalid'; }
    return '';
  };

  const handleSubmit = e => {
    e.preventDefault();
    const err = validate();
    if (err) return setError(err);
    const updated = {
      ...rebalanceEvent,
      name: name.trim(),
      description: description.trim(),
      start: { startDistribution: startDist },
      duration: durationDist,
      assetAllocation: JSON.parse(assetAllocJson)
    };
    onSubmit(updated);
  };

  return ReactDOM.createPortal(
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={e => e.stopPropagation()}>
        <h2>Edit Rebalance Event</h2>
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
