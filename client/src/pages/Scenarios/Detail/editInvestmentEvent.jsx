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
  width: '520px', maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto'
};
const formStyle = { display: 'flex', flexDirection: 'column', gap: '12px' };
const inputStyle = { padding: '8px', borderRadius: '4px', border: '1px solid #ccc', flex: 1 };
const buttonGroup = { display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' };

export default function EditInvestmentEvent({ open, investEvent, onClose, onSubmit }) {
  const [name, setName]               = useState('');
  const [description, setDescription] = useState('');
  const [startDist, setStartDist]     = useState(null);
  const [durationDist, setDurationDist] = useState(null);
  const [glidePath, setGlidePath]     = useState(false);

  // Two maps for allocation
  const [initialAlloc, setInitialAlloc] = useState(new Map());
  const [finalAlloc, setFinalAlloc]     = useState(new Map());

  useEffect(() => {
    if (!open || !investEvent) return;

    setName(investEvent.name || '');
    setDescription(investEvent.description || '');
    setStartDist(investEvent.start?.startDistribution || null);
    setDurationDist(investEvent.duration || null);

    const isGlide = !!investEvent.glidePath;
    setGlidePath(isGlide);

    // If glidePath is on, use assetAllocation for 'initial' and assetAllocation2 for 'final'.
    // Otherwise treat assetAllocation (or assetAllocation2 if you store statics there) as the single allocation.
    if (isGlide) {
      setInitialAlloc(new Map(Object.entries(investEvent.assetAllocation || {})));
      setFinalAlloc(new Map(Object.entries(investEvent.assetAllocation2 || {})));
    } else {
      const staticAlloc = investEvent.assetAllocation2 || investEvent.assetAllocation || {};
      setInitialAlloc(new Map(Object.entries(staticAlloc)));
      setFinalAlloc(new Map()); // no final map when off
    }
  }, [open, investEvent]);

  if (!open) return null;

  const handleSave = e => {
    e.preventDefault();

    // turn your maps back into plain objects
    const allocI = {};
    for (let [k, v] of initialAlloc) {
      if (v !== '') allocI[k] = Number(v);
    }
    const allocF = {};
    for (let [k, v] of finalAlloc) {
      if (v !== '') allocF[k] = Number(v);
    }

    onSubmit({
      ...investEvent,
      name:             name.trim(),
      description:      description.trim(),
      start:            { startDistribution: startDist },
      duration:         durationDist,
      glidePath,
      assetAllocation:  allocI,
      assetAllocation2: glidePath ? allocF : {}   // clear out when off, if you like
    });
  };

  return ReactDOM.createPortal(
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={e => e.stopPropagation()}>
        <h2>Edit Investment Event</h2>
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

          <label>
            <input
              type="checkbox"
              checked={glidePath}
              onChange={e => setGlidePath(e.target.checked)}
            /> Glide Path
          </label>

          <fieldset style={{ border: '1px solid #ccc', padding: '12px', borderRadius: '4px' }}>
            <legend>
              Asset Allocation{glidePath ? ' (Initial & Final)' : ''}
            </legend>
            {Array.from(initialAlloc.entries()).map(([key, val]) => (
              <div
                key={key}
                style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}
              >
                <label style={{ width: '100px' }}>{key}</label>
                <input
                  type="number"
                  placeholder={glidePath ? 'Initial %' : 'Allocation %'}
                  value={val}
                  onChange={e => {
                    const m = new Map(initialAlloc);
                    m.set(key, e.target.value);
                    setInitialAlloc(m);
                  }}
                  style={inputStyle}
                />
                {glidePath && (
                  <input
                    type="number"
                    placeholder="Final %"
                    value={finalAlloc.get(key) ?? ''}
                    onChange={e => {
                      const m2 = new Map(finalAlloc);
                      m2.set(key, e.target.value);
                      setFinalAlloc(m2);
                    }}
                    style={inputStyle}
                  />
                )}
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
