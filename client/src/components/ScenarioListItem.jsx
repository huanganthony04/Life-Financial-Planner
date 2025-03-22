import { useState } from 'react'
import dropdownLogo from '../assets/icons/chevron_down.svg'
import './ScenarioListItem.css'

const ScenarioListItem = ({index, name}) => {

    const [isDropdownOpen, setIsDropdownOpen] = useState(false)

    const handleDropdownClick = () => {
        setIsDropdownOpen(!isDropdownOpen)
    }

    const dropdownMenu = (isDropdownOpen) => {
        if (isDropdownOpen) {
            return (
                <div className="scenario-list-item-dropdown-menu">
                    <button className="dropdown-menu-button">
                        <h4 className="dropdown-menu-item-text">Edit</h4>
                    </button>
                    <button className="dropdown-menu-button">
                        <h4 className="dropdown-menu-item-text">Delete</h4>
                    </button>
                    <button className="dropdown-menu-button">
                        <h4 className="dropdown-menu-item-text">Share</h4>
                    </button>
                    <button className="dropdown-menu-button">
                        <h4 className="dropdown-menu-item-text">Export as YAML</h4>
                    </button>
                </div>
            )
        }
    }

    return (
        <div key={index} className="scenario-list-item">
            <h4 className="scenario-title">{name}</h4>
            <button className="scenario-list-show-dropdown-button" onClick={handleDropdownClick}>
                <img src={dropdownLogo} className="scenario-list-show-dropdown-button"/>
            </button>
            {dropdownMenu(isDropdownOpen)}
        </div>
    )
}

export default ScenarioListItem