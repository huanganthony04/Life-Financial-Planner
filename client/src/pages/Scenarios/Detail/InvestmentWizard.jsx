import React, { useState } from 'react';

const VALID_TAX = ['non-retirement', 'pre-tax', 'after-tax'];

const InvestmentWizard = ({ onSubmit, onClose }) => {
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  // Step 1
  const [investmentName, setInvestmentName] = useState('');
  const [description, setDescription] = useState('');
  const [taxStatus, setTaxStatus] = useState('');
  const [value, setValue] = useState('');
  const [expenseRatio, setExpenseRatio] = useState('');

  // Step 2
  const [returnDistType, setReturnDistType] = useState('fixed');
  const [returnValue, setReturnValue] = useState('');
  const [returnMean, setReturnMean] = useState('');
  const [returnSigma, setReturnSigma] = useState('');
  const [returnLower, setReturnLower] = useState('');
  const [returnUpper, setReturnUpper] = useState('');

  // Step 3
  const [incomeDistType, setIncomeDistType] = useState('fixed');
  const [incomeValue, setIncomeValue] = useState('');
  const [incomeMean, setIncomeMean] = useState('');
  const [incomeSigma, setIncomeSigma] = useState('');
  const [incomeLower, setIncomeLower] = useState('');
  const [incomeUpper, setIncomeUpper] = useState('');

  // Error state
  const [error, setError] = useState('');

  // Helpers
  const toNumber = (str) => {
    const n = Number(str);
    return isNaN(n) ? null : n;
  };

  const buildDistribution = (distType, value, mean, sigma, lower, upper) => {
    if (distType === 'fixed') {
      return { distType, value: toNumber(value) };
    }
    if (distType === 'normal' || distType === 'GBM') {
      return { distType, mean: toNumber(mean), sigma: toNumber(sigma) };
    }
    // uniform
    return { distType, lower: toNumber(lower), upper: toNumber(upper) };
  };

  const validateStep = () => {
    setError('');
    if (step === 1) {
      if (!investmentName.trim()) return 'Name is required';
      if (!VALID_TAX.includes(taxStatus)) return 'Please select a valid tax status';
      if (toNumber(value) === null) return 'Value must be a number';
      if (toNumber(expenseRatio) === null) return 'Expense ratio must be a number';
    }
    if (step === 2) {
      if (returnDistType === 'fixed' && toNumber(returnValue) === null) return 'Return value is required';
      if ((returnDistType === 'normal' || returnDistType === 'GBM') && (toNumber(returnMean) === null || toNumber(returnSigma) === null)) {
        return 'Return mean & sigma are required';
      }
      if (returnDistType === 'uniform' && (toNumber(returnLower) === null || toNumber(returnUpper) === null)) {
        return 'Return lower & upper are required';
      }
    }
    if (step === 3) {
      if (incomeDistType === 'fixed' && toNumber(incomeValue) === null) return 'Income value is required';
      if ((incomeDistType === 'normal' || incomeDistType === 'GBM') && (toNumber(incomeMean) === null || toNumber(incomeSigma) === null)) {
        return 'Income mean & sigma are required';
      }
      if (incomeDistType === 'uniform' && (toNumber(incomeLower) === null || toNumber(incomeUpper) === null)) {
        return 'Income lower & upper are required';
      }
    }
    return '';
  };

  const handleNext = () => {
    const msg = validateStep();
    if (msg) return setError(msg);
    setError('');
    setStep((s) => Math.min(s + 1, totalSteps));
  };

  const handlePrev = () => {
    setError('');
    setStep((s) => Math.max(s - 1, 1));
  };

  const handleSubmit = () => {
    const msg = validateStep();
    if (msg) return setError(msg);

    const newInvestment = {
      name: investmentName.trim(),
      investmentType: {
        name: investmentName.trim(),
        description: description.trim(),
        expenseRatio: toNumber(expenseRatio),
        returnDistribution: buildDistribution(
          returnDistType,
          returnValue,
          returnMean,
          returnSigma,
          returnLower,
          returnUpper
        ),
        incomeDistribution: buildDistribution(
          incomeDistType,
          incomeValue,
          incomeMean,
          incomeSigma,
          incomeLower,
          incomeUpper
        ),
      },
      taxStatus,
      value: toNumber(value),
    };

    onSubmit(newInvestment);
  };

  return (
    <div style={modalStyle}>
      <div style={modalContentStyle}>
        <h2>Add Investment (Step {step}/{totalSteps})</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}

        {step === 1 && (
          <>
            <label>Name</label>
            <input value={investmentName} onChange={e => setInvestmentName(e.target.value)} />
            <label>Description</label>
            <input value={description} onChange={e => setDescription(e.target.value)} />
            <label>Tax Status</label>
            <select value={taxStatus} onChange={e => setTaxStatus(e.target.value)}>
              <option value="">— select —</option>
              <option value="non-retirement">Non‑Retirement</option>
              <option value="pre-tax">Pre‑Tax</option>
              <option value="after-tax">After‑Tax</option>
            </select>
            <label>Value</label>
            <input type="number" value={value} onChange={e => setValue(e.target.value)} />
            <label>Expense Ratio</label>
            <input type="number" value={expenseRatio} onChange={e => setExpenseRatio(e.target.value)} />
          </>
        )}

        {step === 2 && (
          <>
            <label>Return Dist Type</label>
            <select value={returnDistType} onChange={e => setReturnDistType(e.target.value)}>
              <option value="fixed">Fixed</option>
              <option value="normal">Normal</option>
              <option value="GBM">GBM</option>
              <option value="uniform">Uniform</option>
            </select>
            {returnDistType === 'fixed' && (
              <>
                <label>Return Value</label>
                <input type="number" value={returnValue} onChange={e => setReturnValue(e.target.value)} />
              </>
            )}
            {(returnDistType === 'normal' || returnDistType === 'GBM') && (
              <>
                <label>Mean</label>
                <input type="number" value={returnMean} onChange={e => setReturnMean(e.target.value)} />
                <label>Sigma</label>
                <input type="number" value={returnSigma} onChange={e => setReturnSigma(e.target.value)} />
              </>
            )}
            {returnDistType === 'uniform' && (
              <>
                <label>Lower</label>
                <input type="number" value={returnLower} onChange={e => setReturnLower(e.target.value)} />
                <label>Upper</label>
                <input type="number" value={returnUpper} onChange={e => setReturnUpper(e.target.value)} />
              </>
            )}
          </>
        )}

        {step === 3 && (
          <>
            <label>Income Dist Type</label>
            <select value={incomeDistType} onChange={e => setIncomeDistType(e.target.value)}>
              <option value="fixed">Fixed</option>
              <option value="normal">Normal</option>
              <option value="GBM">GBM</option>
              <option value="uniform">Uniform</option>
            </select>
            {incomeDistType === 'fixed' && (
              <>
                <label>Income Value</label>
                <input type="number" value={incomeValue} onChange={e => setIncomeValue(e.target.value)} />
              </>
            )}
            {(incomeDistType === 'normal' || incomeDistType === 'GBM') && (
              <>
                <label>Mean</label>
                <input type="number" value={incomeMean} onChange={e => setIncomeMean(e.target.value)} />
                <label>Sigma</label>
                <input type="number" value={incomeSigma} onChange={e => setIncomeSigma(e.target.value)} />
              </>
            )}
            {incomeDistType === 'uniform' && (
              <>
                <label>Lower</label>
                <input type="number" value={incomeLower} onChange={e => setIncomeLower(e.target.value)} />
                <label>Upper</label>
                <input type="number" value={incomeUpper} onChange={e => setIncomeUpper(e.target.value)} />
              </>
            )}
          </>
        )}

        {step === 4 && (
          <div>
            <h3>Review</h3>
            <p><strong>Name:</strong> {investmentName}</p>
            <p><strong>Tax Status:</strong> {taxStatus}</p>
            <p><strong>Value:</strong> {value}</p>
            <p><strong>Expense Ratio:</strong> {expenseRatio}</p>
            <p><strong>Return:</strong> {returnDistType}</p>
            <p><strong>Income:</strong> {incomeDistType}</p>
          </div>
        )}

        <div style={{ marginTop: 20 }}>
          {step > 1 && <button onClick={handlePrev}>Back</button>}
          {step < totalSteps && <button onClick={handleNext}>Next</button>}
          {step === totalSteps && <button onClick={handleSubmit}>Submit Investment</button>}
          <button onClick={onClose} style={{ marginLeft: 10 }}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

const modalStyle = {
  position: 'fixed',
  top: 0, left: 0, width: '100%', height: '100%',
  backgroundColor: 'rgba(0,0,0,0.5)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  zIndex: 1000
};

const modalContentStyle = {
  backgroundColor: '#fff',
  padding: 20,
  borderRadius: 4,
  width: '90%',
  maxWidth: 500
};

export default InvestmentWizard;
