import { useState, useEffect, useCallback } from 'react'
import ScenarioSelector from './components/ScenarioSelector'
import ResultBody from './components/ResultBody'
import SelectScenarioModal from './components/SelectScenarioModal'
import './Results.css'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL

const Results = ({user}) => {

  // For scenario selection
  const [selectScenarioOpen, setSelectScenarioOpen] = useState(false)
  const [scenario, setScenario] = useState(null)

  const selectScenario = (useCallback((scenario) => {
      setScenario(scenario)
  }, []))

  return (
    <>
      <ScenarioSelector setSelectScenarioOpen={setSelectScenarioOpen} scenario={scenario}/>
      <ResultBody
        scenario={scenario}
      />
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