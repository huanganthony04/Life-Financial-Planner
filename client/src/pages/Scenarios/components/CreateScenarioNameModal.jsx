import { useState } from 'react'
import ReactDOM from 'react-dom'

/**
 * ScenarioCreateNameModal
 *
 * This modal collects enough information to create a new Scenario according to
 * our Mongoose schema. The form is split into multiple steps.
 *
 * Steps:
 * 1: Scenario Name
 * 2: Marital Status
 * 3: Birth Year (and Spouse Birth Year if married)
 * 4: Life Expectancy & Distribution Parameters (separate for you and spouse)
 * 5: Financial Goal and Inflation Assumption with distribution parameters
 * 6: After-Tax Contribution Limit
 * 7: Residence State
 *
 * The overlay does not close on an accidental click.
 */
const ScenarioCreateNameModal = ({ open, onClose, user, createScenario }) => {
  // Step tracking
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 7

  // Global form fields
  const [name, setName] = useState("")
  const [maritalStatus, setMaritalStatus] = useState('single') // false = individual, true = married
  const [birthYear, setBirthYear] = useState("")
  const [spouseBirthYear, setSpouseBirthYear] = useState("")
  const [lifeExpectancy, setLifeExpectancy] = useState("")
  const [spouseLifeExpectancy, setSpouseLifeExpectancy] = useState("")
  const [financialGoal, setFinancialGoal] = useState("")
  const [inflationAssumption, setInflationAssumption] = useState("")
  const [afterTaxContributionLimit, setAfterTaxContributionLimit] = useState("")
  const [residenceState, setResidenceState] = useState("")

  // Distribution fields for life expectancy (for you)
  const [lifeExpDistType, setLifeExpDistType] = useState("fixed")
  const [lifeExpMean, setLifeExpMean] = useState("")
  const [lifeExpSigma, setLifeExpSigma] = useState("")
  const [lifeExpLower, setLifeExpLower] = useState("")
  const [lifeExpUpper, setLifeExpUpper] = useState("")
  // Distribution fields for spouse (if married)
  const [spouseLifeExpDistType, setSpouseLifeExpDistType] = useState("fixed")
  const [spouseLifeExpMean, setSpouseLifeExpMean] = useState("")
  const [spouseLifeExpSigma, setSpouseLifeExpSigma] = useState("")
  const [spouseLifeExpLower, setSpouseLifeExpLower] = useState("")
  const [spouseLifeExpUpper, setSpouseLifeExpUpper] = useState("")
  // Distribution fields for inflation
  const [inflationDistType, setInflationDistType] = useState("fixed")
  const [inflationMean, setInflationMean] = useState("")
  const [inflationSigma, setInflationSigma] = useState("")
  const [inflationLower, setInflationLower] = useState("")
  const [inflationUpper, setInflationUpper] = useState("")

  // Use a separate error state for step-level errors
  const [stepError, setStepError] = useState("")

  // Inline style objects for improved appearance
  const labelStyle = {
    marginBottom: '4px',
    fontWeight: 'bold',
    display: 'block'
  }
  const inputStyle = {
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    marginBottom: '10px',
    width: '100%',
    fontSize: '1rem'
  }
  const selectStyle = {
    ...inputStyle,
    appearance: 'none',
    backgroundColor: '#fff'
  }

  // Cancel confirmation handler
  const handleCancel = () => {
    if (window.confirm("Are you sure you want to cancel? Your unsaved changes will be lost.")) {
      resetForm()
      onClose()
    }
  }

  // Prevent accidental dismissal by ignoring overlay clicks.
  const handleOverlayClick = () => {
    setStepError("Please use the Cancel button to close this modal.")
    setTimeout(() => setStepError(""), 3000)
  }
  // Stops propagation so that clicks inside the modal aren’t handled by the overlay.
  const stopPropagation = (e) => {
    e.stopPropagation()
  }

  // Helper function for building a distribution object.
  // For non-fixed types, remove the "value" property.
  const buildDistribution = (distType, baseValue, meanOpt, sigmaOpt, lowerOpt, upperOpt) => {
    const numValue = Number(baseValue)
    if (distType === "fixed") {
      return { distType: "fixed", value: numValue }
    } else if (distType === "normal") {
      return {
        distType: "normal",
        mean: meanOpt !== "" ? Number(meanOpt) : numValue,
        sigma: sigmaOpt !== "" ? Number(sigmaOpt) : 1.0
      }
    } else if (distType === "uniform") {
      return {
        distType: "uniform",
        lower: lowerOpt !== "" ? Number(lowerOpt) : numValue * 0.9,
        upper: upperOpt !== "" ? Number(upperOpt) : numValue * 1.1
      }
    }
  }

  // Per-step validation
  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1:
        if (name.trim() === "") return "Please provide a scenario name."
        break
      case 3:
        if (birthYear === "") return "Please provide your birth year."
        if (maritalStatus === 'couple' && spouseBirthYear === "") return "Please provide spouse's birth year."
        break
      case 4:
        if (lifeExpectancy === "") return "Please provide your life expectancy."
        if (maritalStatus === 'couple' && spouseLifeExpectancy === "") return "Please provide spouse's life expectancy."
        break
      case 5:
        if (financialGoal === "" || Number(financialGoal) < 0) return "Financial goal must be a non-negative number."
        if (inflationAssumption === "") return "Please provide inflation assumption."
        break
      case 6:
        if (afterTaxContributionLimit === "") return "Please provide after-tax contribution limit."
        break
      case 7:
        if (residenceState.length !== 2) return "Residence state must be 2 letters."
        break
      default:
        return ""
    }
    return ""
  }

  // Navigation for steps: Validate when clicking Next
  const handleNext = () => {
    const errorMsg = validateCurrentStep()
    if (errorMsg !== "") {
      setStepError(errorMsg)
      return
    } else {
      setStepError("")
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1)
      }
    }
  }
  const handleBack = () => {
    if (currentStep > 1) {
      setStepError("")
      setCurrentStep(currentStep - 1)
    }
  }

  // Function to reset the form state
  const resetForm = () => {
    setCurrentStep(1)
    setName("")
    setMaritalStatus('single')
    setBirthYear("")
    setSpouseBirthYear("")
    setLifeExpectancy("")
    setSpouseLifeExpectancy("")
    setFinancialGoal("")
    setInflationAssumption("")
    setAfterTaxContributionLimit("")
    setResidenceState("")
    
    setLifeExpDistType("fixed")
    setLifeExpMean("")
    setLifeExpSigma("")
    setLifeExpLower("")
    setLifeExpUpper("")
    
    setSpouseLifeExpDistType("fixed")
    setSpouseLifeExpMean("")
    setSpouseLifeExpSigma("")
    setSpouseLifeExpLower("")
    setSpouseLifeExpUpper("")
    
    setInflationDistType("fixed")
    setInflationMean("")
    setInflationSigma("")
    setInflationLower("")
    setInflationUpper("")
    
    setStepError("")
  }

  // KEYBOARD HANDLER: onKeyDown for Enter and Escape.
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault()
      if (currentStep < totalSteps) {
        handleNext()
      } else {
        // On final step, allow submission.
        handleSubmit(e)
      }
    } else if (e.key === "Escape") {
      e.preventDefault()
      handleCancel()
    }
  }

  // Handle form submission.
  const handleSubmit = async (e) => {
    e.preventDefault()
    const errorMsg = validateCurrentStep()
    if (errorMsg !== "") {
      setStepError(errorMsg)
      return
    }
    let birthYears, lifeExpectancyArray
    if (maritalStatus === 'couple') {
      birthYears = [Number(birthYear), Number(spouseBirthYear)]
      lifeExpectancyArray = [
        buildDistribution(lifeExpDistType, lifeExpectancy, lifeExpMean, lifeExpSigma, lifeExpLower, lifeExpUpper),
        buildDistribution(spouseLifeExpDistType, spouseLifeExpectancy, spouseLifeExpMean, spouseLifeExpSigma, spouseLifeExpLower, spouseLifeExpUpper)
      ]
    } else {
      birthYears = [Number(birthYear)]
      lifeExpectancyArray = [
        buildDistribution(lifeExpDistType, lifeExpectancy, lifeExpMean, lifeExpSigma, lifeExpLower, lifeExpUpper)
      ]
    }
    const inflationDistribution = buildDistribution(inflationDistType, inflationAssumption, inflationMean, inflationSigma, inflationLower, inflationUpper)
    const scenarioData = {
      name: name.trim(),
      owner: user ? user.userId : "",
      maritalStatus,
      birthYears,
      lifeExpectancy: lifeExpectancyArray,
      financialGoal: Number(financialGoal),
      inflationAssumption: inflationDistribution,
      afterTaxContributionLimit: Number(afterTaxContributionLimit),
      residenceState: residenceState.toUpperCase()
    }
    await createScenario(scenarioData)
    resetForm()
    onClose()
  }

  if (!open) return null

  return ReactDOM.createPortal(
    <div 
      id="scenario-modal-overlay" 
      onClick={handleOverlayClick}
      style={overlayStyle}
    >
      <div 
        id="scenario-modal" 
        onClick={stopPropagation}
        style={modalStyle}
      >
        <div id="scenario-modal-header">
          <h2>Create Scenario (Step {currentStep} of {totalSteps})</h2>
          {stepError && <p style={{ color: 'red' }}>{stepError}</p>}
        </div>
        <div id="scenario-modal-body">
          <form id="scenario-modal-form" onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
            {currentStep === 1 && (
              <div>
                <label style={labelStyle} htmlFor="scenario-name-input">Scenario Name:</label>
                <input 
                  style={inputStyle}
                  type="text" 
                  id="scenario-name-input"
                  placeholder="Scenario Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            )}
            {currentStep === 2 && (
              <div>
                <label style={labelStyle} htmlFor="marital-status-select">Marital Status:</label>
                <select
                  style={selectStyle}
                  id="marital-status-select"
                  value={maritalStatus === 'couple' ? "couple" : "individual"}
                  onChange={(e) => setMaritalStatus(e.target.value)}
                >
                  <option value="individual">Individual</option>
                  <option value="couple">Married Couple</option>
                </select>
              </div>
            )}
            {currentStep === 3 && (
              <div>
                <label style={labelStyle} htmlFor="birth-year-input">Your Birth Year:</label>
                <input 
                  style={inputStyle}
                  type="number" 
                  id="birth-year-input"
                  placeholder="e.g., 1980"
                  value={birthYear}
                  onChange={(e) => setBirthYear(e.target.value)}
                />
                {maritalStatus === 'couple' && (
                  <>
                    <label style={labelStyle} htmlFor="spouse-birth-year-input">Spouse Birth Year:</label>
                    <input 
                      style={inputStyle}
                      type="number" 
                      id="spouse-birth-year-input"
                      placeholder="e.g., 1982"
                      value={spouseBirthYear}
                      onChange={(e) => setSpouseBirthYear(e.target.value)}
                    />
                  </>
                )}
              </div>
            )}
            {currentStep === 4 && (
              <div>
                {maritalStatus === 'couple' ? (
                  <>
                    <h3>Your Life Expectancy</h3>
                    <label style={labelStyle} htmlFor="life-expectancy-input">Your Life Expectancy:</label>
                    <input 
                      style={inputStyle}
                      type="number" 
                      id="life-expectancy-input"
                      placeholder="e.g., 85"
                      value={lifeExpectancy}
                      onChange={(e) => setLifeExpectancy(e.target.value)}
                    />
                    <label style={labelStyle} htmlFor="life-exp-dist-select">Your Distribution Type:</label>
                    <select
                      style={selectStyle}
                      id="life-exp-dist-select"
                      value={lifeExpDistType}
                      onChange={(e) => setLifeExpDistType(e.target.value)}
                    >
                      <option value="fixed">Fixed</option>
                      <option value="normal">Normal</option>
                      <option value="uniform">Uniform</option>
                    </select>
                    {lifeExpDistType === "normal" && (
                      <>
                        <label style={labelStyle} htmlFor="life-exp-mean-input">Mean (optional):</label>
                        <input 
                          style={inputStyle}
                          type="number"
                          id="life-exp-mean-input"
                          placeholder="Mean (default: entered value)"
                          value={lifeExpMean}
                          onChange={(e) => setLifeExpMean(e.target.value)}
                        />
                        <label style={labelStyle} htmlFor="life-exp-sigma-input">Sigma (optional):</label>
                        <input 
                          style={inputStyle}
                          type="number"
                          id="life-exp-sigma-input"
                          placeholder="Sigma (default: 1.0)"
                          value={lifeExpSigma}
                          onChange={(e) => setLifeExpSigma(e.target.value)}
                        />
                      </>
                    )}
                    {lifeExpDistType === "uniform" && (
                      <>
                        <label style={labelStyle} htmlFor="life-exp-lower-input">Lower Bound (optional):</label>
                        <input 
                          style={inputStyle}
                          type="number"
                          id="life-exp-lower-input"
                          placeholder="Lower (default: 90% of value)"
                          value={lifeExpLower}
                          onChange={(e) => setLifeExpLower(e.target.value)}
                        />
                        <label style={labelStyle} htmlFor="life-exp-upper-input">Upper Bound (optional):</label>
                        <input 
                          style={inputStyle}
                          type="number"
                          id="life-exp-upper-input"
                          placeholder="Upper (default: 110% of value)"
                          value={lifeExpUpper}
                          onChange={(e) => setLifeExpUpper(e.target.value)}
                        />
                      </>
                    )}

                    <h3>Spouse Life Expectancy</h3>
                    <label style={labelStyle} htmlFor="spouse-life-expectancy-input">Spouse Life Expectancy:</label>
                    <input 
                      style={inputStyle}
                      type="number" 
                      id="spouse-life-expectancy-input"
                      placeholder="e.g., 87"
                      value={spouseLifeExpectancy}
                      onChange={(e) => setSpouseLifeExpectancy(e.target.value)}
                    />
                    <label style={labelStyle} htmlFor="spouse-life-exp-dist-select">Spouse Distribution Type:</label>
                    <select
                      style={selectStyle}
                      id="spouse-life-exp-dist-select"
                      value={spouseLifeExpDistType}
                      onChange={(e) => setSpouseLifeExpDistType(e.target.value)}
                    >
                      <option value="fixed">Fixed</option>
                      <option value="normal">Normal</option>
                      <option value="uniform">Uniform</option>
                    </select>
                    {spouseLifeExpDistType === "normal" && (
                      <>
                        <label style={labelStyle} htmlFor="spouse-life-exp-mean-input">Mean (optional):</label>
                        <input 
                          style={inputStyle}
                          type="number"
                          id="spouse-life-exp-mean-input"
                          placeholder="Mean (default: entered value)"
                          value={spouseLifeExpMean}
                          onChange={(e) => setSpouseLifeExpMean(e.target.value)}
                        />
                        <label style={labelStyle} htmlFor="spouse-life-exp-sigma-input">Sigma (optional):</label>
                        <input 
                          style={inputStyle}
                          type="number"
                          id="spouse-life-exp-sigma-input"
                          placeholder="Sigma (default: 1.0)"
                          value={spouseLifeExpSigma}
                          onChange={(e) => setSpouseLifeExpSigma(e.target.value)}
                        />
                      </>
                    )}
                    {spouseLifeExpDistType === "uniform" && (
                      <>
                        <label style={labelStyle} htmlFor="spouse-life-exp-lower-input">Lower Bound (optional):</label>
                        <input 
                          style={inputStyle}
                          type="number"
                          id="spouse-life-exp-lower-input"
                          placeholder="Lower (default: 90% of value)"
                          value={spouseLifeExpLower}
                          onChange={(e) => setSpouseLifeExpLower(e.target.value)}
                        />
                        <label style={labelStyle} htmlFor="spouse-life-exp-upper-input">Upper Bound (optional):</label>
                        <input 
                          style={inputStyle}
                          type="number"
                          id="spouse-life-exp-upper-input"
                          placeholder="Upper (default: 110% of value)"
                          value={spouseLifeExpUpper}
                          onChange={(e) => setSpouseLifeExpUpper(e.target.value)}
                        />
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <label style={labelStyle} htmlFor="life-expectancy-input">Life Expectancy:</label>
                    <input 
                      style={inputStyle}
                      type="number" 
                      id="life-expectancy-input"
                      placeholder="e.g., 85"
                      value={lifeExpectancy}
                      onChange={(e) => setLifeExpectancy(e.target.value)}
                    />
                    <label style={labelStyle} htmlFor="life-exp-dist-select">Distribution Type:</label>
                    <select
                      style={selectStyle}
                      id="life-exp-dist-select"
                      value={lifeExpDistType}
                      onChange={(e) => setLifeExpDistType(e.target.value)}
                    >
                      <option value="fixed">Fixed</option>
                      <option value="normal">Normal</option>
                      <option value="uniform">Uniform</option>
                    </select>
                    {lifeExpDistType === "normal" && (
                      <>
                        <label style={labelStyle} htmlFor="life-exp-mean-input">Mean (optional):</label>
                        <input 
                          style={inputStyle}
                          type="number"
                          id="life-exp-mean-input"
                          placeholder="Mean (default: entered value)"
                          value={lifeExpMean}
                          onChange={(e) => setLifeExpMean(e.target.value)}
                        />
                        <label style={labelStyle} htmlFor="life-exp-sigma-input">Sigma (optional):</label>
                        <input 
                          style={inputStyle}
                          type="number"
                          id="life-exp-sigma-input"
                          placeholder="Sigma (default: 1.0)"
                          value={lifeExpSigma}
                          onChange={(e) => setLifeExpSigma(e.target.value)}
                        />
                      </>
                    )}
                    {lifeExpDistType === "uniform" && (
                      <>
                        <label style={labelStyle} htmlFor="life-exp-lower-input">Lower Bound (optional):</label>
                        <input 
                          style={inputStyle}
                          type="number"
                          id="life-exp-lower-input"
                          placeholder="Lower (default: 90% of value)"
                          value={lifeExpLower}
                          onChange={(e) => setLifeExpLower(e.target.value)}
                        />
                        <label style={labelStyle} htmlFor="life-exp-upper-input">Upper Bound (optional):</label>
                        <input 
                          style={inputStyle}
                          type="number"
                          id="life-exp-upper-input"
                          placeholder="Upper (default: 110% of value)"
                          value={lifeExpUpper}
                          onChange={(e) => setLifeExpUpper(e.target.value)}
                        />
                      </>
                    )}
                  </>
                )}
              </div>
            )}
            {currentStep === 5 && (
              <div>
                <label style={labelStyle} htmlFor="financial-goal-input">Financial Goal ($):</label>
                <input 
                  style={inputStyle}
                  type="number" 
                  id="financial-goal-input"
                  placeholder="0"
                  value={financialGoal}
                  onChange={(e) => setFinancialGoal(e.target.value)}
                />
                <label style={labelStyle} htmlFor="inflation-assumption-input">Inflation Assumption (%):</label>
                <input 
                  style={inputStyle}
                  type="number" 
                  id="inflation-assumption-input"
                  placeholder="e.g., 2"
                  value={inflationAssumption}
                  onChange={(e) => setInflationAssumption(e.target.value)}
                />
                <label style={labelStyle} htmlFor="inflation-dist-select">Inflation Distribution Type:</label>
                <select
                  style={selectStyle}
                  id="inflation-dist-select"
                  value={inflationDistType}
                  onChange={(e) => setInflationDistType(e.target.value)}
                >
                  <option value="fixed">Fixed</option>
                  <option value="normal">Normal</option>
                  <option value="uniform">Uniform</option>
                </select>
                {inflationDistType === "normal" && (
                  <>
                    <label style={labelStyle} htmlFor="inflation-mean-input">Mean (optional):</label>
                    <input 
                      style={inputStyle}
                      type="number"
                      id="inflation-mean-input"
                      placeholder="Mean (default: entered value)"
                      value={inflationMean}
                      onChange={(e) => setInflationMean(e.target.value)}
                    />
                    <label style={labelStyle} htmlFor="inflation-sigma-input">Sigma (optional):</label>
                    <input 
                      style={inputStyle}
                      type="number"
                      id="inflation-sigma-input"
                      placeholder="Sigma (default: 1.0)"
                      value={inflationSigma}
                      onChange={(e) => setInflationSigma(e.target.value)}
                    />
                  </>
                )}
                {inflationDistType === "uniform" && (
                  <>
                    <label style={labelStyle} htmlFor="inflation-lower-input">Lower Bound (optional):</label>
                    <input 
                      style={inputStyle}
                      type="number"
                      id="inflation-lower-input"
                      placeholder="Lower (default: 90% of value)"
                      value={inflationLower}
                      onChange={(e) => setInflationLower(e.target.value)}
                    />
                    <label style={labelStyle} htmlFor="inflation-upper-input">Upper Bound (optional):</label>
                    <input 
                      style={inputStyle}
                      type="number"
                      id="inflation-upper-input"
                      placeholder="Upper (default: 110% of value)"
                      value={inflationUpper}
                      onChange={(e) => setInflationUpper(e.target.value)}
                    />
                  </>
                )}
              </div>
            )}
            {currentStep === 6 && (
              <div>
                <label style={labelStyle} htmlFor="after-tax-limit-input">After-Tax Contribution Limit ($):</label>
                <input 
                  style={inputStyle}
                  type="number" 
                  id="after-tax-limit-input"
                  placeholder="e.g., 6000"
                  value={afterTaxContributionLimit}
                  onChange={(e) => setAfterTaxContributionLimit(e.target.value)}
                />
              </div>
            )}
            {currentStep === 7 && (
              <div>
                <label style={labelStyle} htmlFor="residence-state-input">Residence State (2 letters):</label>
                <input 
                  style={inputStyle}
                  type="text" 
                  id="residence-state-input"
                  placeholder="e.g., NY"
                  value={residenceState}
                  onChange={(e) => setResidenceState(e.target.value)}
                />
              </div>
            )}
          </form>
        </div>
        <div id="scenario-modal-footer" style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button 
            type="button" 
            className="scenario-modal-button" 
            onClick={handleCancel}
            style={{ padding: '10px 20px', borderRadius: '4px', fontSize: '1rem' }}
          >
            Cancel
          </button>
          <div>
            {currentStep > 1 && (
              <button 
                type="button" 
                className="scenario-modal-button" 
                onClick={handleBack}
                style={{ padding: '10px 20px', borderRadius: '4px', fontSize: '1rem', marginRight: '10px' }}
              >
                Back
              </button>
            )}
            {currentStep < totalSteps ? (
              <button 
                type="button" 
                className="scenario-modal-button" 
                onClick={handleNext}
                style={{ padding: '10px 20px', borderRadius: '4px', fontSize: '1rem' }}
              >
                Next
              </button>
            ) : (
              <button 
                id="create-button" 
                className="scenario-modal-button" 
                type="submit" 
                form="scenario-modal-form"
                style={{ padding: '10px 20px', borderRadius: '4px', fontSize: '1rem' }}
              >
                Create Scenario
              </button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.getElementById('modal-root')
  )
}

const overlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  backgroundColor: 'rgba(0,0,0,0.5)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000
}

const modalStyle = {
  background: '#fff',
  padding: '20px',
  borderRadius: '6px',
  width: '500px',
  maxWidth: '90vw'
}

export default ScenarioCreateNameModal
