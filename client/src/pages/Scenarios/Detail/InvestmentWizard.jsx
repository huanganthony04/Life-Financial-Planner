import React, { useState } from 'react'

const VALID_TAX = ['non-retirement', 'pre-tax', 'after-tax']
const AMT_OR_PCT = ['amount', 'percent']

// Reusable field component
const Field = ({ label, type = 'text', value, onChange, options = [], tooltip = "" }) => (
  <div style={styles.field} title={tooltip}>
    <label style={styles.label}>{label}</label>
    {options.length ? (
      <select value={value} onChange={onChange} style={styles.select}>
        <option value="">— select —</option>
        {options.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    ) : (
      <input type={type} value={value} onChange={onChange} style={styles.input} />
    )}
  </div>
)

export default function InvestmentWizard({ open, onSubmit, onClose }) {
  if (!open) return null;
  const [step, setStep] = useState(1)
  const totalSteps = 4
  const [error, setError] = useState('')

  // Step 1 fields
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [taxStatus, setTaxStatus] = useState('')
  const [value, setValue] = useState('')
  const [expenseRatio, setExpenseRatio] = useState('')

  // Step 2 fields
  const [returnType, setReturnType] = useState('fixed')
  const [returnAmtOrPct, setReturnAmtOrPct] = useState('amount')
  const [returnValue, setReturnValue] = useState('')
  const [returnMean, setReturnMean] = useState('')
  const [returnSigma, setReturnSigma] = useState('')
  const [returnLower, setReturnLower] = useState('')
  const [returnUpper, setReturnUpper] = useState('')

  // Step 3 fields
  const [incomeType, setIncomeType] = useState('fixed')
  const [incomeAmtOrPct, setIncomeAmtOrPct] = useState('amount')
  const [incomeValue, setIncomeValue] = useState('')
  const [incomeMean, setIncomeMean] = useState('')
  const [incomeSigma, setIncomeSigma] = useState('')
  const [incomeLower, setIncomeLower] = useState('')
  const [incomeUpper, setIncomeUpper] = useState('')

  // Utility functions
  const toNum = str => { const n = Number(str); return (isNaN(n) || str.length < 1) ? null : n }
  const buildDist = (type, val, mean, sigma, lower, upper) => {
    if (type === 'fixed') return { distType: 'fixed', value: toNum(val) }
    if (['normal','GBM'].includes(type)) return { distType: type, mean: toNum(mean), sigma: toNum(sigma) }
    return { distType: 'uniform', lower: toNum(lower), upper: toNum(upper) }
  }

  const validate = () => {
    setError('')
    if (step === 1) {
      if (!name.trim()) return 'Name is required.'
      if (!VALID_TAX.includes(taxStatus)) return 'Tax status is required.'
      if (toNum(value) == null || toNum(value) < 0) return 'Value must be a positive number.'
      if (toNum(expenseRatio) == null || toNum(expenseRatio) > 100 || toNum(expenseRatio) < 0) return 'Expense ratio must be a positive percentage.'
    }
    if (step === 2) {
      if (!AMT_OR_PCT.includes(returnAmtOrPct)) return 'Select an option for amount or percent.'
      if (returnType === 'fixed' && toNum(returnValue) == null) return 'Return value is required'
      if (['normal','GBM'].includes(returnType) && (toNum(returnMean)==null || toNum(returnSigma)==null)) return 'Mean & Sigma required'
      if (returnType === 'uniform' && (toNum(returnLower)==null || toNum(returnUpper)==null)) return 'Lower & Upper required'
    }
    if (step === 3) {
      if (!AMT_OR_PCT.includes(incomeAmtOrPct)) return 'Select an option for amount or percent.'
      if (incomeType === 'fixed' && toNum(incomeValue) == null) return 'Income value is required'
      if (['normal','GBM'].includes(incomeType) && (toNum(incomeMean)==null || toNum(incomeSigma)==null)) return 'Mean & Sigma required'
      if (incomeType === 'uniform' && (toNum(incomeLower)==null || toNum(incomeUpper)==null)) return 'Lower & Upper required'
    }
    return ''
  }

  const next = () => {
    const err = validate(); if (err) return setError(err)
    setError(''); setStep(s => Math.min(s+1, totalSteps))
  }
  const prev = () => { setError(''); setStep(s => Math.max(s-1,1)) }

  const submit = () => {
    const err = validate(); if (err) return setError(err)

    let [rvalue, rmean, rlower, rupper] = [toNum(returnValue), toNum(returnMean), toNum(returnLower), toNum(returnUpper)];
    
    if (returnAmtOrPct === 'percent') {
      rvalue = rvalue / 100
      rmean = rmean / 100
      rlower = rlower / 100
      rupper = rupper / 100
    }

    let [ivalue, imean, ilower, iupper] = [toNum(incomeValue), toNum(incomeMean), toNum(incomeLower), toNum(incomeUpper)];

    if (incomeAmtOrPct === 'percent') {
      ivalue = ivalue / 100
      imean = imean / 100
      ilower = ilower / 100
      iupper = iupper / 100
    }

    const inv = {
      name: name.trim(), taxStatus, value: toNum(value), costBasis: toNum(value),
      investmentType: {
        name: name.trim(), description: description.trim(), expenseRatio: toNum(expenseRatio) / 100,
        returnDistribution: buildDist(returnType, rvalue, rmean, returnSigma, rlower, rupper),
        returnAmtOrPct: returnAmtOrPct,
        incomeDistribution: buildDist(incomeType, ivalue, imean, incomeSigma, ilower, iupper),
        incomeAmtOrPct: incomeAmtOrPct
      }
    }
    onSubmit(inv)
  }

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h2 style={styles.title}>Add Investment</h2>
          <span style={styles.step}>{step}/{totalSteps}</span>
        </div>
        {error && <div style={styles.error}>{error}</div>}
        <div style={styles.body}>
          {step===1 && <>
            <p className="field-description">Enter general information about the investment.</p>
            <Field label="Name" value={name} onChange={e=>setName(e.target.value)} tooltip="The name of the investment."/>
            <Field label="Description" value={description} onChange={e=>setDescription(e.target.value)} tooltip="The description of the investment."/>
            <Field label="Tax Status" options={VALID_TAX} value={taxStatus} onChange={e=>setTaxStatus(e.target.value)} tooltip="The tax status of the investment, pre-tax, after-tax, or non-retirement."/>
            <Field label="Value ($)" type="number" value={value} onChange={e=>setValue(e.target.value)} tooltip="The current value, in USD, of the investment."/>
            <Field label="Expense Ratio (%)" type="number" value={expenseRatio} onChange={e=>setExpenseRatio(e.target.value)} tooltip="The cost of maintaining of the investment, expressed as a percentage of the current value."/>
          </>}
          {step===2 && <>
            <p className="field-description">Specify the rate that the investment grows or shrinks yearly.</p>
            <Field label="Return Amount or Percent" options={AMT_OR_PCT} value={returnAmtOrPct} onChange={e => setReturnAmtOrPct(e.target.value)} tooltip="Whether the growth of the investment is expressed in amount, or a percentage."/>
            <Field label="Return Type" options={['fixed','normal','GBM','uniform']} value={returnType} onChange={e=>setReturnType(e.target.value)} tooltip="How the growth of the investment should be modeled."/>
            {returnType==='fixed' && <Field label={returnAmtOrPct === 'amount' ? 'Return Value ($)' : 'Return Rate (%)'} type="number" value={returnValue} onChange={e=>setReturnValue(e.target.value)} 
              tooltip={returnAmtOrPct === 'amount' ? "The amount, in USD, this investment grows annually." : "The rate that this investment grows annually."}
            />}
            {['normal','GBM'].includes(returnType) && 
              <>
                <Field label={returnAmtOrPct === 'amount' ? 'Mean ($)' : 'Mean (%)'} type="number" value={returnMean} onChange={e=>setReturnMean(e.target.value)} 
                  tooltip={`The average growth${(returnAmtOrPct === 'amount') ? ', in USD,': ' rate'} of this investment's value annually.`}
                />
                <Field label="Sigma" type="number" value={returnSigma} onChange={e=>setReturnSigma(e.target.value)} tooltip="How much the growth amount/rate of the investment varies yearly."/>
              </>
            }
            {returnType==='uniform' && 
              <>
                <Field label={returnAmtOrPct === 'amount' ? 'Lower ($)' : 'Lower (%)'} type="number" value={returnLower} onChange={e=>setReturnLower(e.target.value)} 
                  tooltip={(returnAmtOrPct === 'amount' ? 'The maximum value' : 'The maximum rate') + ' that the investment grows annually.'}
                />
                <Field label={returnAmtOrPct === 'amount' ? 'Upper ($)' : 'Upper (%)'} type="number" value={returnUpper} onChange={e=>setReturnUpper(e.target.value)} 
                  tooltip={(returnAmtOrPct === 'amount' ? 'The maximum value' : 'The maximum rate') + ' that the investment grows annually.'}
                />
              </>
            }
          </>}
          {step===3 && <>
            <p className="field-description">Specify investment income, such as from dividends or interest. This income is automatically reinvested into the investment.</p>
            <Field label="Income Amount or Percent" options={AMT_OR_PCT} value={incomeAmtOrPct} onChange={e => setIncomeAmtOrPct(e.target.value)}/>
            <Field label="Income Type" options={['fixed','normal','GBM','uniform']} value={incomeType} onChange={e=>setIncomeType(e.target.value)} />
            {incomeType==='fixed' && <Field label={incomeAmtOrPct === 'amount' ? 'Value ($)' : 'Rate (%)'} type="number" value={incomeValue} onChange={e=>setIncomeValue(e.target.value)} />}
            {['normal','GBM'].includes(incomeType) && 
              <>
                <Field label={incomeAmtOrPct === 'amount' ? 'Mean ($)' : 'Mean (%)'} type="number" value={incomeMean} onChange={e=>setIncomeMean(e.target.value)} />
                <Field label='Sigma' type="number" value={incomeSigma} onChange={e=>setIncomeSigma(e.target.value)} />
              </>
            }
            {incomeType==='uniform' && 
              <>
                <Field label={incomeAmtOrPct === 'amount' ? 'Lower ($)' : 'Lower (%)'} type="number" value={incomeLower} onChange={e=>setIncomeLower(e.target.value)} 
                  tooltip={(incomeAmtOrPct === 'amount' ? 'The minimum value' : 'The minimum rate') + ' that the investment earns annually.'}
                />
                <Field label={incomeAmtOrPct === 'amount' ? 'Upper ($)' : 'Upper (%)'} type="number" value={incomeUpper} onChange={e=>setIncomeUpper(e.target.value)} 
                  tooltip={(incomeAmtOrPct === 'amount' ? 'The maximum value' : 'The maximum rate') + ' that the investment earns annually.'}
                />
              </>
            }
          </>}
          {step===4 && <div style={styles.review}>
            <p><strong>Name:</strong> {name}</p>
            <p><strong>Tax Status:</strong> {taxStatus}</p>
            <p><strong>Value:</strong> {value}</p>
            <p><strong>Expense Ratio:</strong> {expenseRatio}</p>
            <p><strong>Return:</strong> {returnType}</p>
            {returnType === 'fixed' && (returnAmtOrPct === 'amount' ? 
              <p><strong>Return Value: </strong>${returnValue}</p>
              :
              <p><strong>Return Rate: </strong>{returnValue}%</p>
            )}
            <p><strong>Income:</strong> {incomeType}</p>
            {incomeType === 'fixed' && (incomeAmtOrPct === 'amount' ? 
              <p><strong>Income Value: </strong>${incomeValue}</p>
              :
              <p><strong>Income Rate: </strong>{incomeValue}%</p>
            )}
          </div>}
        </div>
        <div style={styles.footer}>
          {step>1 && <button onClick={prev} style={styles.button}>Back</button>}
          {step<totalSteps && <button onClick={next} style={styles.button}>Next</button>}
          {step===totalSteps && <button onClick={submit} style={styles.primary}>Submit</button>}
          <button onClick={onClose} style={styles.cancel}>Cancel</button>
        </div>
      </div>
    </div>
  )
}

const styles = {
  overlay: {
    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
  },
  modal: {
    background: '#fff', borderRadius: '8px', width: '400px', maxHeight: '80%', overflowY: 'auto',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column'
  },
  header: { padding: '16px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  title: { margin: 0, fontSize: '1.25rem' },
  step: { fontSize: '0.9rem', color: '#666' },
  error: { padding: '8px 16px', backgroundColor: '#fdecea', color: '#611a15' },
  body: { padding: '16px', flexGrow: 1 },
  footer: { padding: '16px', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'flex-end', gap: '8px' },
  field: { marginBottom: '12px', display: 'flex', flexDirection: 'column' },
  label: { marginBottom: '4px', fontSize: '0.9rem', color: '#333' },
  input: { padding: '8px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '0.9rem' },
  select: { padding: '8px', border: '1px solid #ccc', borderRadius: '4px', background: '#fff', fontSize: '0.9rem' },
  button: { padding: '8px 12px', border: '1px solid #ccc', borderRadius: '4px', background: '#fff', cursor: 'pointer' },
  primary: { padding: '8px 12px', border: 'none', borderRadius: '4px', background: '#1976d2', color: '#fff', cursor: 'pointer' },
  cancel: { padding: '8px 12px', border: 'none', background: 'transparent', color: '#888', cursor: 'pointer' },
  review: { padding: '8px', background: '#f9f9f9', borderRadius: '4px' }
}
