import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import SuccessChart from './components/SuccessChart'
import ShadedAssetChart from './components/ShadedAssetChart'
import AssetChart from './components/AssetChart'
import SelectScenarioModal from './components/SelectScenarioModal'
import './Results.css'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL

const Results = ({user}) => {

  const [selectScenarioOpen, setSelectScenarioOpen] = useState(false)
  const [scenario, setScenario] = useState(null)
  /**
 * @type {[{scenarioId: String, financialGoal: number, startYear: Number, simulationResults: {String, Number}[][]}, React.Dispatch<React.SetStateAction<string|null>>]}
 */
  const [results, setResults] = useState(null)

  const selectScenario = (useCallback((scenario) => {
      setScenario(scenario)
  }, []))

  const runSimulation = async (scenarioId) => {
    await axios.get(`${BACKEND_URL}/api/scenario/run?id=${scenarioId}`, {withCredentials: true})
      .then((response) => {
          console.log(response.data)
          setResults(response.data)
      })
      .catch((error) => {
          console.log(error)
          return
      })
  }

  const getResults = async (scenarioId) => {
    await axios.get(`${BACKEND_URL}/api/results?id=${scenarioId}`, {withCredentials: true})
      .then((response) => {
          console.log(response.data)
          setResults(response.data)
      })
      .catch(() => {
          console.log('Results not found')
          return
      })
  }

  const noScenario = () => {
    return (
      <div id="no-results-container">
        <h3>Select a scenario from above to see its results!</h3>
      </div>
    )
  }

  const noResults = () => {
    return (
      <div id="no-results-container">
        <h3>No results were found for this scenario.</h3>
        <h3>Click the button below to run a new simulation!</h3>
        <button className="green-button" onClick={() => runSimulation(scenario._id)}>
          Run Simulation
        </button>
      </div>
    )
  }

  useEffect(() => {
    if (scenario) {
      getResults(scenario._id)
    }
  }, [scenario])

  if (!scenario) {
    return (
      <>
        <div id="results-header">
          <div id="scenario-selection">
            <div id="selected-scenario-title">No Scenario Selected</div>
            <button className="green-button" onClick={() => setSelectScenarioOpen(true)}>
              <h4>
                  Select Scenario
              </h4>
            </button>
          </div>
        </div>
        <div id="results-body">
          {noScenario()}
        </div>

        <SelectScenarioModal
            open={selectScenarioOpen} 
            onClose={() => setSelectScenarioOpen(false)} 
            user={user}
            selectScenario={selectScenario}
        />
      </>
    )
  }
  else if (!results) {
    return (
      <>
        <div id="results-header">
          <div id="scenario-selection">
            <div id="selected-scenario-title">{scenario.name}</div>
            <button className="green-button" onClick={() => setSelectScenarioOpen(true)}>
              <h4>
                  Select Scenario
              </h4>
            </button>
          </div>
        </div>
        <div id="results-body">
          {noResults()}
        </div>

        <SelectScenarioModal
            open={selectScenarioOpen} 
            onClose={() => setSelectScenarioOpen(false)} 
            user={user}
            selectScenario={selectScenario}
        />
      </>
    )
  }

  else {
    return (
      <>
        <div id="results-header">
          <div id="scenario-selection">
            <div id="selected-scenario-title">{scenario ? scenario.name : "No Scenario Selected"}</div>
            <button className="green-button" onClick={() => setSelectScenarioOpen(true)}>
              <h4>
                  Select Scenario
              </h4>
            </button>
          </div>
        </div>
        <div id="results-body">
          <h4>Probability of Success by Year</h4>
          <div id="success-chart-container" className="chart-container">
            <div className="chart-wrapper">
              <SuccessChart result={results}/>
            </div>
          </div>
          <h4>Asset Value by Year</h4>
          <div id="shaded-asset-chart-container" className="chart-container">
            <div className="chart-wrapper">
              <ShadedAssetChart result={results}/>
            </div>
            <fieldset className="chart-selection">
                <input type="radio" id="investments" name="chart-select" value="Investments" checked />
                <label for="investments">Investments</label>

                <input type="radio" id="income" name="chart-select" value="Income" />
                <label for="income">Income</label>

                <input type="radio" id="expenses" name="chart-select" value="Expenses" />
                <label for="expenses">Expenses</label>
              </fieldset>
          </div>
          <h4>Median Asset Values by Year</h4>
          <div className="chart-wrapper">
            <AssetChart result={results}/>
          </div>
        </div>

        <SelectScenarioModal
            open={selectScenarioOpen} 
            onClose={() => setSelectScenarioOpen(false)} 
            user={user}
            selectScenario={selectScenario}
        />
      </>
    )
  }
}

export default Results