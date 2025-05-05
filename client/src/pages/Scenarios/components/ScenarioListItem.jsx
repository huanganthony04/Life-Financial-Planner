import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import dropdownLogo from '/src/assets/icons/chevron_down.svg'
import DropdownMenu from './DropdownMenu'

// Reusable style for action buttons
const buttonStyle = {
  padding: '8px 16px',
  backgroundColor: 'rgb(175, 244, 198)',
  color: '#fff',
  border: '1px solid rgb(175, 244, 198)',
  borderRadius: '4px',
  fontSize: '0.9rem',
  cursor: 'pointer',
  transition: 'background-color 0.2s ease',
}

const dropdownButtonStyle = {
  backgroundColor: 'transparent',
  border: 'none',
  padding: '8px',
  cursor: 'pointer',
}

const ScenarioListItem = ({ name, scenarioId, editScenario, deleteScenario, exportScenario }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const navigate = useNavigate()

  const handleViewScenario = () => {
    navigate(`/scenario/detail?id=${scenarioId}`, { state: { scenario: { name, scenarioId } } })
  }

  return (
    <div className="scenario-list-item" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', borderBottom: '1px solid #e0e0e0' }}>
      <h4 className="scenario-title" style={{ margin: 0, fontSize: '1rem', color: '#333' }}>{name}</h4>

      {/* View/Edit Button */}
      <button
        style={buttonStyle}
        onClick={handleViewScenario}
      >
        View/Edit
      </button>

      {/* Dropdown menu toggle button */}
      <button
        style={dropdownButtonStyle}
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        aria-label="Open actions menu"
      >
        <img src={dropdownLogo} alt="Toggle Dropdown" />
      </button>

      <DropdownMenu
        open={isDropdownOpen}
        setOpen={setIsDropdownOpen}
        scenarioId={scenarioId}
        editScenario={editScenario}
        deleteScenario={deleteScenario}
        exportScenario={exportScenario}
      />
    </div>
  )
}

export default ScenarioListItem
