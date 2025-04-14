import { useEffect, useRef } from 'react'

const DropdownMenu = ({open, setOpen, scenarioId, editScenario, deleteScenario, exportScenario}) => {

    const dropdownRef = useRef(null)

    const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setOpen(false)
        }
    }

    const handleEdit = () => {
        editScenario(scenarioId)
    }

    const handleDelete = () => {
        deleteScenario(scenarioId)
    }  

    const handleExport = () => {
        exportScenario(scenarioId)
    }

    useEffect(() => {
        if (open) {
            document.addEventListener('mousedown', handleClickOutside)
        }
        else {
            document.removeEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    })

    if (!open) {
        return null
    }

    return (
        <div className="scenario-list-item-dropdown-menu" ref={dropdownRef}>
            <button className="dropdown-menu-button" onClick={handleEdit}>
                <h4 className="dropdown-menu-item-text">Edit</h4>
            </button>
            <button className="dropdown-menu-button" onClick={handleDelete}>
                <h4 className="dropdown-menu-item-text">Delete</h4>
            </button>
            <button className="dropdown-menu-button">
                <h4 className="dropdown-menu-item-text">Share</h4>
            </button>
            <button className="dropdown-menu-button" onClick={handleExport}>
                <h4 className="dropdown-menu-item-text">Export as YAML</h4>
            </button>
        </div>
    )
}

export default DropdownMenu