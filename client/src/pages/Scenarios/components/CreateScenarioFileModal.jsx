import { useState, useRef } from 'react'
import ReactDOM from 'react-dom'
import YAML from 'yaml'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL

const CreateScenarioFileModal = ({open, onClose, openScenarioModal, user, createScenario}) => {

  const fileInputRef = useRef(null)
  const [file, setFile] = useState(null)

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0]
    if (selectedFile) {
      setFile(selectedFile)
      console.log("Selected file:", selectedFile)
    }
  }

  const handleFileUpload = async () => {
    if (file) {
      const reader = new FileReader()
      reader.onload = async (event) => {

        const fileContent = event.target.result
        const parsedData = YAML.parse(fileContent)
        createScenario(parsedData)

      }
      reader.readAsText(file)
    } else {
      console.log("No file selected for upload.")
    }
  }

  if (!open) return null

  return ReactDOM.createPortal(
    <div id="scenario-modal-overlay" onClick={() => onClose()}>
      <div id="scenario-modal" onClick={(e) => e.stopPropagation()}>
        <div id="scenario-modal-header">
          <h2 id="scenario-modal-header-title">Create Scenario</h2>
        </div>
        <div id="scenario-modal-file-upload-body">
          <div id="scenario-modal-file-upload-area" onClick={() => fileInputRef.current.click()}>
            <h4>Drag and Drop Your Scenario File Here</h4>
            <h4 id="scenario-modal-file-upload-description">Or click here to select a file</h4>
            <h4 style={{color: "black"}}>{file ? `File selected: ${file.name}` : `No file selected`}</h4>
            <input 
              ref={fileInputRef} 
              style={{display: "none"}}
              type="file" 
              id="scenario-file-input" 
              accept=".yaml, .yml"
              onChange={handleFileChange}
            />
          </div>
        </div>

        <div id="scenario-modal-footer">
          <button id="back-button" className="scenario-modal-button" onClick={() => {openScenarioModal(); onClose()}}>
              <h4>Back</h4>
          </button>
          <button id="upload-button" className="scenario-modal-button" onClick={handleFileUpload}>
              <h4>Upload</h4>
          </button>
        </div>
      </div>
    </div>,
    document.getElementById('modal-root')
  )
}

export default CreateScenarioFileModal