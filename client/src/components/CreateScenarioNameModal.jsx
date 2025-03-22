import { useState } from 'react'
import ReactDOM from 'react-dom'
import './CreateScenarioModal.css'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL

const ScenarioCreateNameModal = ({open, onClose, openScenarioModal, user, createScenario}) => {

  const [name, setName] = useState("")


  const handleSubmit = async (e) => {
    e.preventDefault()
    if (user) {
      createScenario({name: name})
    }
  }

  if (!open) return null

  return ReactDOM.createPortal(
    <div id="scenario-modal-overlay" onClick={() => onClose()}>
      <div id="scenario-modal" onClick={(e) => e.stopPropagation()}>
        <div id="scenario-modal-header">
          <h2 id="scenario-modal-header-title">Create Scenario</h2>
        </div>
        <div id="scenario-modal-body">
          <form id='scenario-modal-form' onSubmit={handleSubmit}>
            <label htmlFor="scenario-modal-name-input">Name your scenario:</label>
            <input 
              type="text" 
              id="scenario-modal-name-input"
              className="scenario-modal-input" 
              placeholder="Scenario Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </form>
        </div>
        <div id="scenario-modal-footer">
          <button id="back-button" className="scenario-modal-button" onClick={() => {openScenarioModal(); onClose()}}>
              <h4>Back</h4>
          </button>
          <button id="create-button" className="scenario-modal-button" type="submit" form="scenario-modal-form">
              <h4>Create Scenario</h4>
          </button>
        </div>
      </div>
    </div>,
    document.getElementById('modal-root')
  )
}

export default ScenarioCreateNameModal