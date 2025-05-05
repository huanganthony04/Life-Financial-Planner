import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

// Helper functions
const toNum = str => {
  const n = Number(str);
  return isNaN(n) ? null : n;
};
const buildDist = (type, val, mean, sigma, lower, upper) => {
  if (type === 'fixed') return { distType: 'fixed', value: toNum(val) };
  if (['normal','GBM'].includes(type)) return { distType: type, mean: toNum(mean), sigma: toNum(sigma) };
  return { distType: 'uniform', lower: toNum(lower), upper: toNum(upper) };
};

// Styles
const overlayStyle = {
  position: 'fixed', top: 0, left: 0,
  width: '100vw', height: '100vh',
  backgroundColor: 'rgba(0,0,0,0.5)',
  display: 'flex', justifyContent: 'center', alignItems: 'center',
  zIndex: 1000
};
const modalStyle = {
  background: '#fff', padding: '20px', borderRadius: '6px',
  width: '600px', maxWidth: '95vw', maxHeight: '85vh', overflowY: 'auto'
};
const formStyle = { display: 'flex', flexDirection: 'column', gap: '10px' };
const inputStyle = { padding: '8px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '1rem' };
const selectStyle = { ...inputStyle };
const buttonStyle = { padding: '8px 16px', borderRadius: '4px', fontSize: '1rem', margin: '0 4px' };

export default function InvestmentEditModal({ open, investment, onClose, onSubmit }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [taxStatus, setTaxStatus] = useState('');
  const [value, setValue] = useState('');
  const [expenseRatio, setExpenseRatio] = useState('');

  const [returnType, setReturnType] = useState('fixed');
  const [returnValue, setReturnValue] = useState('');
  const [returnMean, setReturnMean] = useState('');
  const [returnSigma, setReturnSigma] = useState('');
  const [returnLower, setReturnLower] = useState('');
  const [returnUpper, setReturnUpper] = useState('');

  const [incomeType, setIncomeType] = useState('fixed');
  const [incomeValue, setIncomeValue] = useState('');
  const [incomeMean, setIncomeMean] = useState('');
  const [incomeSigma, setIncomeSigma] = useState('');
  const [incomeLower, setIncomeLower] = useState('');
  const [incomeUpper, setIncomeUpper] = useState('');

  const [error, setError] = useState('');

  // Prefill when opened
  useEffect(() => {
    if (open && investment) {
      setName(investment.investmentType?.name || investment.name || '');
      setDescription(investment.investmentType?.description || investment.description || '');
      setTaxStatus(investment.taxStatus || '');
      setValue(investment.value?.toString() || '');
      setExpenseRatio(investment.expenseRatio?.toString() || '');

      const ret = investment.investmentType?.returnDistribution || {};
      setReturnType(ret.distType || 'fixed');
      setReturnValue(ret.value?.toString() || '');
      setReturnMean(ret.mean?.toString() || '');
      setReturnSigma(ret.sigma?.toString() || '');
      setReturnLower(ret.lower?.toString() || '');
      setReturnUpper(ret.upper?.toString() || '');

      const inc = investment.investmentType?.incomeDistribution || {};
      setIncomeType(inc.distType || 'fixed');
      setIncomeValue(inc.value?.toString() || '');
      setIncomeMean(inc.mean?.toString() || '');
      setIncomeSigma(inc.sigma?.toString() || '');
      setIncomeLower(inc.lower?.toString() || '');
      setIncomeUpper(inc.upper?.toString() || '');

      setError('');
    }
  }, [open, investment]);

  if (!open) return null;

  const validate = () => {
    if (!name.trim()) return 'Name is required';
    if (!taxStatus) return 'Tax status is required';
    if (toNum(value) == null) return 'Value must be numeric';
    if (toNum(expenseRatio) == null) return 'Expense ratio must be numeric';

    if (returnType === 'fixed' && toNum(returnValue) == null) return 'Return value is required';
    if (['normal','GBM'].includes(returnType) && (toNum(returnMean) == null || toNum(returnSigma) == null)) {
      return 'Return mean & sigma required';
    }
    if (returnType === 'uniform' && (toNum(returnLower) == null || toNum(returnUpper) == null)) {
      return 'Return lower & upper required';
    }

    if (incomeType === 'fixed' && toNum(incomeValue) == null) return 'Income value is required';
    if (['normal','GBM'].includes(incomeType) && (toNum(incomeMean) == null || toNum(incomeSigma) == null)) {
      return 'Income mean & sigma required';
    }
    if (incomeType === 'uniform' && (toNum(incomeLower) == null || toNum(incomeUpper) == null)) {
      return 'Income lower & upper required';
    }

    return '';
  };

  const handleSubmit = e => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }

    const updated = {
      ...investment,
      investmentType: {
        name: name.trim(),
        description: description.trim(),
        expenseRatio: toNum(expenseRatio),
        returnDistribution: buildDist(returnType, returnValue, returnMean, returnSigma, returnLower, returnUpper),
        incomeDistribution: buildDist(incomeType, incomeValue, incomeMean, incomeSigma, incomeLower, incomeUpper)
      },
      taxStatus,
      value: toNum(value),
      expenseRatio: toNum(expenseRatio)
    };

    onSubmit(updated);
  };

  return ReactDOM.createPortal(
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={e => e.stopPropagation()}>
        <h2>Edit Investment</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <form style={formStyle} onSubmit={handleSubmit}>
          <label>Name:</label>
          <input style={inputStyle} value={name} onChange={e => setName(e.target.value)} />

          <label>Description:</label>
          <input style={inputStyle} value={description} onChange={e => setDescription(e.target.value)} />

          <label>Tax Status:</label>
          <select style={selectStyle} value={taxStatus} onChange={e => setTaxStatus(e.target.value)}>
            <option value="">— select —</option>
            <option value="non-retirement">non-retirement</option>
            <option value="pre-tax">pre-tax</option>
            <option value="after-tax">after-tax</option>
          </select>

          <label>Value:</label>
          <input type="number" style={inputStyle} value={value} onChange={e => setValue(e.target.value)} />

          <label>Expense Ratio:</label>
          <input type="number" style={inputStyle} value={expenseRatio} onChange={e => setExpenseRatio(e.target.value)} />

          <h3>Return Distribution</h3>
          <select style={selectStyle} value={returnType} onChange={e => setReturnType(e.target.value)}>
            <option value="fixed">Fixed</option>
            <option value="normal">Normal</option>
            <option value="GBM">GBM</option>
            <option value="uniform">Uniform</option>
          </select>
          {returnType === 'fixed' && (
            <input type="number" placeholder="Value" style={inputStyle} value={returnValue} onChange={e => setReturnValue(e.target.value)} />
          )}
          {['normal','GBM'].includes(returnType) && (
            <>             
              <input type="number" placeholder="Mean" style={inputStyle} value={returnMean} onChange={e => setReturnMean(e.target.value)} />
              <input type="number" placeholder="Sigma" style={inputStyle} value={returnSigma} onChange={e => setReturnSigma(e.target.value)} />
            </>
          )}
          {returnType === 'uniform' && (
            <>             
              <input type="number" placeholder="Lower" style={inputStyle} value={returnLower} onChange={e => setReturnLower(e.target.value)} />
              <input type="number" placeholder="Upper" style={inputStyle} value={returnUpper} onChange={e => setReturnUpper(e.target.value)} />
            </>
          )}

          <h3>Income Distribution</h3>
          <select style={selectStyle} value={incomeType} onChange={e => setIncomeType(e.target.value)}>
            <option value="fixed">Fixed</option>
            <option value="normal">Normal</option>
            <option value="GBM">GBM</option>
            <option value="uniform">Uniform</option>
          </select>
          {incomeType === 'fixed' && (
            <input type="number" placeholder="Value" style={inputStyle} value={incomeValue} onChange={e => setIncomeValue(e.target.value)} />
          )}
          {['normal','GBM'].includes(incomeType) && (
            <>             
              <input type="number" placeholder="Mean" style={inputStyle} value={incomeMean} onChange={e => setIncomeMean(e.target.value)} />
              <input type="number" placeholder="Sigma" style={inputStyle} value={incomeSigma} onChange={e => setIncomeSigma(e.target.value)} />
            </>
          )}
          {incomeType === 'uniform' && (
            <>             
              <input type="number" placeholder="Lower" style={inputStyle} value={incomeLower} onChange={e => setIncomeLower(e.target.value)} />
              <input type="number" placeholder="Upper" style={inputStyle} value={incomeUpper} onChange={e => setIncomeUpper(e.target.value)} />
            </>
          )}

          <div style={{ textAlign: 'right', marginTop: '1rem' }}>
            <button type="button" onClick={onClose} style={buttonStyle}>Cancel</button>
            <button type="submit" style={buttonStyle}>Update</button>
          </div>
        </form>
      </div>
    </div>,
    document.getElementById('modal-root')
  );
}
