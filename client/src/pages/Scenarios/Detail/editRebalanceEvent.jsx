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
  width: '500px', maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto'
};
const formStyle = { display: 'flex', flexDirection: 'column', gap: '12px' };
const inputStyle = { padding: '8px', borderRadius: '4px', border: '1px solid #ccc', flex: 1 };
const buttonGroup = { display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' };

export default function EditRebalanceEvent({ open, rebalanceEvent, onClose, onSubmit }) {
  const [name, setName]             = useState('');
  const [description, setDescription] = useState('');
  const [startDist, setStartDist]   = useState(null);
  const [durationDist, setDurationDist] = useState(null);

  // Single allocation map
  const [allocation, setAllocation] = useState(new Map());

  useEffect(() => {
    if (!open || !rebalanceEvent) return;

    setName(rebalanceEvent.name || '');
    setDescription(rebalanceEvent.description || '');
    setStartDist(rebalanceEvent.start?.startDistribution || null);
    setDurationDist(rebalanceEvent.duration || null);
    setAllocation(new Map(Object.entries(rebalanceEvent.assetAllocation || {})));
  }, [open, rebalanceEvent]);

  if (!open) return null;

  const handleSave = e => {
    e.preventDefault();

    const alloc = {};
    for (let [k, v] of allocation) {
      if (v !== '') alloc[k] = Number(v);
    }

    onSubmit({
      ...rebalanceEvent,
      name:            name.trim(),
      description:     description.trim(),
      start:           { startDistribution: startDist },
      duration:        durationDist,
      assetAllocation: alloc
    });
  };

  return ReactDOM.createPortal(
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={e => e.stopPropagation()}>
        <h2>Edit Rebalance Event</h2>
        <form style={formStyle} onSubmit={handleSave}>
          <input
            style={inputStyle}
            placeholder="Name"
            value={name}
            onChange={e => setName(e.target.value)}
          />
          <input
            style={inputStyle}
            placeholder="Description"
            value={description}
            onChange={e => setDescription(e.target.value)}
          />

          <label>Start Distribution:</label>
          <ValueDistEdit distribution={startDist} onChange={setStartDist} />

          <label>Duration Distribution:</label>
          <ValueDistEdit distribution={durationDist} onChange={setDurationDist} />

          <fieldset style={{ border: '1px solid #ccc', padding: '12px', borderRadius: '4px' }}>
            <legend>Asset Allocation</legend>
            {Array.from(allocation.entries()).map(([key, val]) => (
              <div key={key} style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ width: '120px' }}>{key}</label>
                <input
                  type="number"
                  placeholder="Allocation %"
                  value={val}
                  onChange={e => {
                    const m = new Map(allocation);
                    m.set(key, e.target.value);
                    setAllocation(m);
                  }}
                  style={inputStyle}
                />
              </div>
            ))}
          </fieldset>

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
