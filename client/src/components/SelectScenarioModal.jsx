import { useState, useEffect } from 'react'
import ReactDOM from 'react-dom'
import axios from 'axios'
import ScenarioModalListItem from './ScenarioModalListItem'
import './SelectScenarioModal.css'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL

const ScenarioCreate = ({open, onClose, user, selectScenario}) => {

  const [scenarios, setScenarios] = useState(null)

  const fetchUserScenarios = async (user) => {
    await axios.get(`${BACKEND_URL}/api/scenario/byuser?userId=${user.userId}`, {withCredentials: true})
    .then((response) => {
        if (response.data.scenarios) {
            setScenarios(response.data.scenarios)
        }
    })
    .catch((error) => {
        console.log(error)
    })
}

  useEffect(() => {
    if (user) {
        fetchUserScenarios(user)
    }
    else {
        console.log("User not logged in")
    }
  }, [user])

  const scenariosList = (scenario) => {
    return scenario.map((item) => {
        return (
            <ScenarioModalListItem
                key={item._id}
                name={item.name}
                scenario={item}
                onClose={onClose}
                selectScenario={selectScenario}
            />
        )
    })
  }

  if (!open) return null

  return ReactDOM.createPortal(
    <div id="scenario-modal-overlay" onClick={() => onClose()}>
      <div id="scenario-modal" onClick={(e) => e.stopPropagation()}>
        <div id="scenario-modal-header">
          <h2 id="scenario-modal-header-title">Select Scenario</h2>
        </div>
        <div id="scenario-select-modal-body">
          {scenariosList(scenarios)}
        </div>
        <div id="scenario-modal-footer">
          <button id="back-button" className="close-modal-button" onClick={() => {onClose()}}>
              <h4>Back</h4>
          </button>
        </div>
      </div>
    </div>,
    document.getElementById('modal-root')
  )
}

export default ScenarioCreate