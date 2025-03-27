import { useState, useEffect, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
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

  const runSimulation = async () => {
    await axios.get(`${BACKEND_URL}/api/scenario/run?id=${scenario._id}`, {withCredentials: true})
      .then((response) => {
          console.log(response.data)
          setResults(response.data)
      })
      .catch((error) => {
          console.log(error)
          return
      })
  }

  return (
    <>
      <div id="results-header">
        <div id="scenario-select">
          <div id="scenario-selection">
            <div id="selected-scenario-title">{scenario ? scenario.name : "No Scenario Selected"}</div>
            <button id="scenario-selection-button" onClick={() => setSelectScenarioOpen(true)}>
              <h4 id="scenario-selection-button-text">
                  Select Scenario
              </h4>
            </button>
          </div>
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

export default Results