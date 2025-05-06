// ValueDistEdit.jsx
import React, { useState, useEffect } from 'react';

const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  marginTop: '8px'
};
const inputStyle = {
  padding: '8px',
  borderRadius: '4px',
  border: '1px solid #ccc',
  width: '100%'
};
const errorStyle = {
  color: 'red',
  fontSize: '0.875rem'
};

export default function ValueDistEdit({ distribution, onChange }) {
  const [mode, setMode]           = useState('normal');
  const [fixedValue, setFixedValue] = useState('');
  const [mu, setMu]               = useState('');
  const [sigma, setSigma]         = useState('');
  const [lower, setLower]         = useState('');
  const [upper, setUpper]         = useState('');
  const [error, setError]         = useState('');

  // 1) Seed local state when parent distribution changes
  useEffect(() => {
    if (!distribution) return;
    setMode(distribution.distType);
    setFixedValue(distribution.value?.toString() ?? '');
    setMu((distribution.mean ?? '').toString());
    setSigma((distribution.sigma ?? '').toString());
    setLower((distribution.lower ?? '').toString());
    setUpper((distribution.upper ?? '').toString());
    setError('');
  }, [distribution]);

  // 2) Validate fields whenever relevant inputs change
  useEffect(() => {
    let err = '';
    if ((mode === 'normal' || mode === 'GBM') && sigma !== '' && Number(sigma) < 0) {
      err = 'Sigma must be ≥ 0';
    }
    if (mode === 'uniform' && lower !== '' && upper !== '' && Number(lower) >= Number(upper)) {
      err = 'Lower must be less than Upper';
    }
    setError(err);
  }, [mode, sigma, lower, upper]);

  // 3) Emit only valid distribution objects
  const emit = dist => {
    if (error) return;
    onChange(dist);
  };

  const handleModeChange = e => {
    const m = e.target.value;
    setMode(m);
    // clear all other fields when switching mode
    setFixedValue('');
    setMu('');
    setSigma('');
    setLower('');
    setUpper('');
    emit({ distType: m });
  };

  const handleFixedChange = e => {
    const v = e.target.value;
    setFixedValue(v);
    emit({ distType: 'fixed', value: Number(v) });
  };

  const handleMuChange = e => {
    const v = e.target.value;
    setMu(v);
    emit({ distType: mode, mean: Number(v), sigma: Number(sigma) });
  };

  const handleSigmaChange = e => {
    const v = e.target.value;
    setSigma(v);
    emit({ distType: mode, mean: Number(mu), sigma: Number(v) });
  };

  const handleLowerChange = e => {
    const v = e.target.value;
    setLower(v);
    emit({ distType: 'uniform', lower: Number(v), upper: Number(upper) });
  };

  const handleUpperChange = e => {
    const v = e.target.value;
    setUpper(v);
    emit({ distType: 'uniform', lower: Number(lower), upper: Number(v) });
  };

  return (
    <div style={formStyle}>
      <label>
        Distribution
        <select value={mode} onChange={handleModeChange} style={inputStyle}>
          <option value="normal">normal</option>
          <option value="fixed">fixed</option>
          <option value="GBM">GBM</option>
          <option value="uniform">uniform</option>
        </select>
      </label>

      {mode === 'fixed' && (
        <input
          type="number"
          placeholder="Value"
          value={fixedValue}
          onChange={handleFixedChange}
          style={inputStyle}
        />
      )}

      {(mode === 'normal' || mode === 'GBM') && (
        <>
          <input
            type="number"
            placeholder="Mean"
            value={mu}
            onChange={handleMuChange}
            style={inputStyle}
          />
          <input
            type="number"
            placeholder="Sigma"
            value={sigma}
            onChange={handleSigmaChange}
            style={inputStyle}
          />
        </>
      )}

      {mode === 'uniform' && (
        <>
          <input
            type="number"
            placeholder="Lower"
            value={lower}
            onChange={handleLowerChange}
            style={inputStyle}
          />
          <input
            type="number"
            placeholder="Upper"
            value={upper}
            onChange={handleUpperChange}
            style={inputStyle}
          />
        </>
      )}

      {error && <div style={errorStyle}>{error}</div>}
    </div>
  );
}
