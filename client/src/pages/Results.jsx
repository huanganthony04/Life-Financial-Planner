import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import SelectScenarioModal from '../components/SelectScenarioModal'
import './Results.css'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL

const Results = ({user}) => {

  const [selectScenarioOpen, setSelectScenarioOpen] = useState(false)
  const [scenario, setScenario] = useState(null)
  const [results, setResults] = useState(null)

  const selectScenario = (useCallback((scenario) => {
      setScenario(scenario)
  }, []))

  const runSimulation = async (scenarioId) => {
    await axios.get(`${BACKEND_URL}/api/scenario/run?id=${scenarioId}`, {withCredentials: true})
      .then((response) => {
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
          setResults(response.data)
      })
      .catch((error) => {
          console.log(error)
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

  return (
    <>
      <div id="results-header">
        <div id="scenario-select">
          <div id="scenario-selection">
            <div id="selected-scenario-title">{scenario ? scenario.name : "No Scenario Selected"}</div>
            <button className="green-button" onClick={() => setSelectScenarioOpen(true)}>
              <h4>
                  Select Scenario
              </h4>
            </button>
          </div>
        </div>
      </div>
      <div id="results-body">
        {scenario ? (results ? null : noResults()) : noScenario()}
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

export default Results