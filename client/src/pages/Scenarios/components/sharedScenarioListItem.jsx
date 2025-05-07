import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import dropdownLogo from '/src/assets/icons/chevron_down.svg'
import DropdownMenu from './DropdownMenu'

const SharedScenarioListItem = ({ name, owner, accessStatus, scenarioId, editScenario, deleteScenario, exportScenario, shareScenario,changeSharedId }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const navigate = useNavigate()

  // Updated: Navigate to the detail route using a query string.
  const handleViewScenario = () => {
    navigate(`/scenario/detail?id=${scenarioId}`, { state: { scenario: { name, scenarioId } } })
  }

  return (
    <div className="scenario-list-item">
      <h4 className="scenario-title">{name}</h4>

    <div>
      <h5>{accessStatus=="viewer"?accessStatus+"(can't edit, share, delete)":accessStatus}</h5>
      <h5>{"OwnerID:"+owner}</h5>
      </div>
      
      {/* View Button: now goes to "/scenario/detail?id=..." */}
      <button className="scenario-list-view-button" onClick={handleViewScenario}>
        View
      </button>

      {/* Dropdown menu toggle button */}
      <button
        className="scenario-list-show-dropdown-button"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        disabled={isDropdownOpen}
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
        shareScenario={shareScenario}
        changeSharedId={changeSharedId}
        accessStatus={accessStatus}
      />
    </div>
  )
}

export default SharedScenarioListItem
