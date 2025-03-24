import { useState } from 'react'
import dropdownLogo from '../assets/icons/chevron_down.svg'
import DropdownMenu from './DropdownMenu'
import './ScenarioListItem.css'

const ScenarioListItem = ({key, name, scenarioId}) => {

    const [isDropdownOpen, setIsDropdownOpen] = useState(false)

    return (
        <div key={key} className="scenario-list-item">
            <h4 className="scenario-title">{name}</h4>
            <button className="scenario-list-show-dropdown-button" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                <img src={dropdownLogo} className="scenario-list-show-dropdown-button"/>
            </button>
            <DropdownMenu open={isDropdownOpen} setOpen={setIsDropdownOpen} scenarioId={scenarioId}/>
        </div>
    )
}

export default ScenarioListItem