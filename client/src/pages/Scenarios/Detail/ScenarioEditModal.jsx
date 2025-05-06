import { useState, useEffect } from 'react'
import ReactDOM from 'react-dom'

/**
 * ScenarioEditModal
 *
 * A single-page, scrollable modal to edit an existing Scenario.
 * On submission, it calls updateScenario(updatedScenario) to persist changes.
 */
const ScenarioEditModal = ({ open, onClose, scenario, updateScenario }) => {
  // Local state for all form fields
  const [name, setName] = useState('')
  const [maritalStatus, setMaritalStatus] = useState(false)
  const [birthYear, setBirthYear] = useState('')
  const [spouseBirthYear, setSpouseBirthYear] = useState('')
  const [lifeExpDistType, setLifeExpDistType] = useState('fixed')
  const [lifeExpectancy, setLifeExpectancy] = useState('')
  const [lifeExpMean, setLifeExpMean] = useState('')
  const [lifeExpSigma, setLifeExpSigma] = useState('')
  const [lifeExpLower, setLifeExpLower] = useState('')
  const [lifeExpUpper, setLifeExpUpper] = useState('')
  const [spouseLifeExpDistType, setSpouseLifeExpDistType] = useState('fixed')
  const [spouseLifeExpectancy, setSpouseLifeExpectancy] = useState('')
  const [spouseLifeExpMean, setSpouseLifeExpMean] = useState('')
  const [spouseLifeExpSigma, setSpouseLifeExpSigma] = useState('')
  const [spouseLifeExpLower, setSpouseLifeExpLower] = useState('')
  const [spouseLifeExpUpper, setSpouseLifeExpUpper] = useState('')
  const [financialGoal, setFinancialGoal] = useState('')
  const [inflationDistType, setInflationDistType] = useState('fixed')
  const [inflationAssumption, setInflationAssumption] = useState('')
  const [inflationMean, setInflationMean] = useState('')
  const [inflationSigma, setInflationSigma] = useState('')
  const [inflationLower, setInflationLower] = useState('')
  const [inflationUpper, setInflationUpper] = useState('')
  const [afterTaxContributionLimit, setAfterTaxContributionLimit] = useState('')
  const [residenceState, setResidenceState] = useState('')
  const [error, setError] = useState('')

  // Initialize form state when modal opens or scenario changes
  useEffect(() => {
    if (open && scenario) {
      setName(scenario.name || '')
      setMaritalStatus(scenario.maritalStatus || false)
      setBirthYear(scenario.birthYears?.[0]?.toString() || '')
      setSpouseBirthYear(scenario.birthYears?.[1]?.toString() || '')
      // your life expectancy
      const yourLife = scenario.lifeExpectancy?.[0] || {}
      setLifeExpDistType(yourLife.distType || 'fixed')
      setLifeExpectancy(yourLife.value?.toString() || yourLife.mean?.toString() || '')
      setLifeExpMean(yourLife.mean?.toString() || '')
      setLifeExpSigma(yourLife.sigma?.toString() || '')
      setLifeExpLower(yourLife.lower?.toString() || '')
      setLifeExpUpper(yourLife.upper?.toString() || '')
      // spouse life expectancy
      const spLife = scenario.lifeExpectancy?.[1] || {}
      setSpouseLifeExpDistType(spLife.distType || 'fixed')
      setSpouseLifeExpectancy(spLife.value?.toString() || spLife.mean?.toString() || '')
      setSpouseLifeExpMean(spLife.mean?.toString() || '')
      setSpouseLifeExpSigma(spLife.sigma?.toString() || '')
      setSpouseLifeExpLower(spLife.lower?.toString() || '')
      setSpouseLifeExpUpper(spLife.upper?.toString() || '')
      // financial & inflation
      setFinancialGoal(scenario.financialGoal?.toString() || '')
      const infl = scenario.inflationAssumption || {}
      setInflationDistType(infl.distType || 'fixed')
      setInflationAssumption(infl.value?.toString() || infl.mean?.toString() || '')
      setInflationMean(infl.mean?.toString() || '')
      setInflationSigma(infl.sigma?.toString() || '')
      setInflationLower(infl.lower?.toString() || '')
      setInflationUpper(infl.upper?.toString() || '')
      setAfterTaxContributionLimit(scenario.afterTaxContributionLimit?.toString() || '')
      setResidenceState(scenario.residenceState || '')
      setError('')
    }
  }, [open, scenario])

  // Build distribution helper
  const buildDistribution = (type, base, mean, sigma, lower, upper) => {
    const num = Number(base)
    if (type === 'fixed') return { distType: 'fixed', value: num }
    if (type === 'normal') return { distType: 'normal', mean: Number(mean || base), sigma: Number(sigma || 1) }
    // uniform
    return { distType: 'uniform', lower: Number(lower || base * 0.9), upper: Number(upper || base * 1.1) }
  }

  // Validate before submit
  const validate = () => {
    if (!name.trim()) return 'Name is required.'
    if (!birthYear) return 'Your birth year is required.'
    if (maritalStatus && !spouseBirthYear) return 'Spouse birth year is required.'
    if (!lifeExpectancy) return 'Life expectancy is required.'
    if (maritalStatus && !spouseLifeExpectancy) return 'Spouse life expectancy is required.'
    if (!financialGoal) return 'Financial goal is required.'
    if (!inflationAssumption) return 'Inflation assumption is required.'
    if (!afterTaxContributionLimit) return 'After-tax contribution limit is required.'
    if (residenceState.length !== 2) return 'Residence state must be two letters.'
    return ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const err = validate()
    if (err) {
      setError(err)
      return
    }
    // build updated scenario
    const birthYears = [Number(birthYear)]
    const lifeArr = [ buildDistribution(lifeExpDistType, lifeExpectancy, lifeExpMean, lifeExpSigma, lifeExpLower, lifeExpUpper) ]
    if (maritalStatus) {
      birthYears.push(Number(spouseBirthYear))
      lifeArr.push(buildDistribution(spouseLifeExpDistType, spouseLifeExpectancy, spouseLifeExpMean, spouseLifeExpSigma, spouseLifeExpLower, spouseLifeExpUpper))
    }
    const inflDist = buildDistribution(inflationDistType, inflationAssumption, inflationMean, inflationSigma, inflationLower, inflationUpper)
    const updated = {
      name: name.trim(), maritalStatus,
      birthYears, lifeExpectancy: lifeArr,
      financialGoal: Number(financialGoal), inflationAssumption: inflDist,
      afterTaxContributionLimit: Number(afterTaxContributionLimit), residenceState: residenceState.toUpperCase()
    }
    await updateScenario(updated)
    onClose()
  }

  if (!open) return null

  return ReactDOM.createPortal(
    <div style={overlayStyle} onClick={() => error || onClose()}>
      <div style={modalStyle} onClick={e => e.stopPropagation()}>
        <h2>Edit Scenario</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <form style={formStyle} onSubmit={handleSubmit}>
          {/* General */}
          <label>Name:</label>
          <input value={name} onChange={e => setName(e.target.value)} style={inputStyle} />

          <label>Marital Status:</label>
          <select value={maritalStatus ? 'married' : 'individual'} onChange={e => setMaritalStatus(e.target.value === 'married')} style={inputStyle}>
            <option value="individual">Individual</option>
            <option value="married">Married</option>
          </select>

          <label>Your Birth Year:</label>
          <input type="number" value={birthYear} onChange={e => setBirthYear(e.target.value)} style={inputStyle} />

          {maritalStatus && (
            <>
              <label>Spouse Birth Year:</label>
              <input type="number" value={spouseBirthYear} onChange={e => setSpouseBirthYear(e.target.value)} style={inputStyle} />
            </>
          )}

          {/* Life Expectancy */}
          <label>Life Expectancy:</label>
          <input type="number" value={lifeExpectancy} onChange={e => setLifeExpectancy(e.target.value)} style={inputStyle} />
          <label>Distribution Type:</label>
          <select value={lifeExpDistType} onChange={e => setLifeExpDistType(e.target.value)} style={inputStyle}>
            <option value="fixed">Fixed</option>
            <option value="normal">Normal</option>
            <option value="uniform">Uniform</option>
          </select>
          {lifeExpDistType === 'normal' && (
            <>
              <input placeholder="Mean (opt)" value={lifeExpMean} onChange={e => setLifeExpMean(e.target.value)} style={inputStyle} />
              <input placeholder="Sigma (opt)" value={lifeExpSigma} onChange={e => setLifeExpSigma(e.target.value)} style={inputStyle} />
            </>
          )}
          {lifeExpDistType === 'uniform' && (
            <>
              <input placeholder="Lower (opt)" value={lifeExpLower} onChange={e => setLifeExpLower(e.target.value)} style={inputStyle} />
              <input placeholder="Upper (opt)" value={lifeExpUpper} onChange={e => setLifeExpUpper(e.target.value)} style={inputStyle} />
            </>
          )}

          {maritalStatus && (
            <>
              <label>Spouse Life Expectancy:</label>
              <input type="number" value={spouseLifeExpectancy} onChange={e => setSpouseLifeExpectancy(e.target.value)} style={inputStyle} />
              <label>Distribution Type:</label>
              <select value={spouseLifeExpDistType} onChange={e => setSpouseLifeExpDistType(e.target.value)} style={inputStyle}>
                <option value="fixed">Fixed</option>
                <option value="normal">Normal</option>
                <option value="uniform">Uniform</option>
              </select>
              {spouseLifeExpDistType === 'normal' && (
                <>
                  <input placeholder="Mean (opt)" value={spouseLifeExpMean} onChange={e => setSpouseLifeExpMean(e.target.value)} style={inputStyle} />
                  <input placeholder="Sigma (opt)" value={spouseLifeExpSigma} onChange={e => setSpouseLifeExpSigma(e.target.value)} style={inputStyle} />
                </>
              )}
              {spouseLifeExpDistType === 'uniform' && (
                <>
                  <input placeholder="Lower (opt)" value={spouseLifeExpLower} onChange={e => setSpouseLifeExpLower(e.target.value)} style={inputStyle} />
                  <input placeholder="Upper (opt)" value={spouseLifeExpUpper} onChange={e => setSpouseLifeExpUpper(e.target.value)} style={inputStyle} />
                </>
              )}
            </>
          )}

          {/* Financial & Inflation */}
          <label>Financial Goal ($):</label>
          <input type="number" value={financialGoal} onChange={e => setFinancialGoal(e.target.value)} style={inputStyle} />
          <label>Inflation Assumption (%):</label>
          <input type="number" value={inflationAssumption} onChange={e => setInflationAssumption(e.target.value)} style={inputStyle} />
          <label>Distribution Type:</label>
          <select value={inflationDistType} onChange={e => setInflationDistType(e.target.value)} style={inputStyle}>
            <option value="fixed">Fixed</option>
            <option value="normal">Normal</option>
            <option value="uniform">Uniform</option>
          </select>
          {inflationDistType === 'normal' && (
            <>
              <input placeholder="Mean (opt)" value={inflationMean} onChange={e => setInflationMean(e.target.value)} style={inputStyle} />
              <input placeholder="Sigma (opt)" value={inflationSigma} onChange={e => setInflationSigma(e.target.value)} style={inputStyle} />
            </>
          )}
          {inflationDistType === 'uniform' && (
            <>
              <input placeholder="Lower (opt)" value={inflationLower} onChange={e => setInflationLower(e.target.value)} style={inputStyle} />
              <input placeholder="Upper (opt)" value={inflationUpper} onChange={e => setInflationUpper(e.target.value)} style={inputStyle} />
            </>
          )}

          <label>After-Tax Contribution Limit ($):</label>
          <input type="number" value={afterTaxContributionLimit} onChange={e => setAfterTaxContributionLimit(e.target.value)} style={inputStyle} />
          <label>Residence State (2 letters):</label>
          <input value={residenceState} onChange={e => setResidenceState(e.target.value)} style={inputStyle} />

          <div style={{ marginTop: '1rem', textAlign: 'right' }}>
            <button type="button" onClick={onClose} style={buttonStyle}>Cancel</button>
            <button type="submit" style={buttonStyle}>Update Scenario</button>
          </div>
        </form>
      </div>
    </div>,
    document.getElementById('modal-root')
  )
}

// Styles
const overlayStyle = {
  position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
  backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
}
const modalStyle = {
  background: '#fff', padding: '20px', borderRadius: '6px', width: '500px', maxWidth: '90vw', maxHeight: '80vh', overflowY: 'auto'
}
const formStyle = { display: 'flex', flexDirection: 'column', gap: '10px' }
const inputStyle = { padding: '8px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '1rem' }
const buttonStyle = { padding: '10px 20px', borderRadius: '4px', fontSize: '1rem', marginLeft: '10px' }

export default ScenarioEditModal
