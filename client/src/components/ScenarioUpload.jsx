import { useRef } from 'react'
import ReactDOM from 'react-dom'
import YAML from 'yaml'
import writeIcon from '../assets/icons/write.svg'
import fileIcon from '../assets/icons/file.svg'
import './ScenarioUpload.css'

const ScenarioUpload = ({open, onClose, openScenFileUpl}) => {

  const fileInputRef = useRef(null)

  const openFileUpload = () => {
    openScenFileUpl()
    onClose()
  }

  if (!open) return null

  return ReactDOM.createPortal(
    <div id="scenario-modal-overlay" onClick={() => onClose()}>
      <div id="scenario-modal" onClick={(e) => e.stopPropagation()}>
        <div id="scenario-modal-header">
          <h2 id="scenario-modal-header-title">Create Scenario</h2>
        </div>
        <div id="scenario-modal-body">
          <button className="scenario-modal-button-large">
            <div className="scenario-modal-button-label">
              <img src={writeIcon} alt="Write Icon" className="scenario-modal-icon" />
              <h2 className="scenario-modal-button-label">Create New</h2>
            </div>
            <h4 className="scenario-modal-button-description">Create a new scenario from scratch</h4>
          </button>
          <button className="scenario-modal-button-large" onClick={() => openFileUpload()}>
            <div className="scenario-modal-button-label">
              <img src={fileIcon} alt="File Icon" className="scenario-modal-icon" />
              <h2 className="scenario-modal-button-label">Import From File</h2>
            </div>
            <h4 className="scenario-modal-button-description">Create a scenario from a .YAML file</h4>
          </button>
          <input type="file" ref={fileInputRef} style={{display: "none"}}/>
        </div>
      </div>
    </div>,
    document.getElementById('modal-root')
  )
}

export default ScenarioUpload