import { useState } from 'react'
import dropdownLogo from '/src/assets/icons/chevron_down.svg'
import DropdownMenu from './DropdownMenu'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL


const ScenarioListItem = ({name, scenarioId, editScenario, deleteScenario}) => {

    const [isDropdownOpen, setIsDropdownOpen] = useState(false)


    return (
        <div className="scenario-list-item">
            <h4 className="scenario-title">{name}</h4>
            <button className="scenario-list-show-dropdown-button" onClick={() => setIsDropdownOpen(!isDropdownOpen)} disabled={isDropdownOpen}>
                <img src={dropdownLogo}/>
            </button>
            <DropdownMenu 
                open={isDropdownOpen} 
                setOpen={setIsDropdownOpen} 
                scenarioId={scenarioId}
                editScenario={editScenario}
                deleteScenario={deleteScenario}
            />
        </div>
    )
}

export default ScenarioListItem