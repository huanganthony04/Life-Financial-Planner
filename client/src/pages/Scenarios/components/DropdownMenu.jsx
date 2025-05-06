import { useEffect, useRef } from 'react'

const DropdownMenu = ({open, setOpen, accessStatus, scenarioId, editScenario, deleteScenario, exportScenario,changeSharedId, shareScenario}) => {

    const dropdownRef = useRef(null)

    const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setOpen(false)
        }
    }
    const handleShare=()=>{
        if(accessStatus=="viewer"){
            return
        }
        console.log("handling sharing click test"+scenarioId);
        shareScenario(scenarioId);
        changeSharedId(scenarioId);

    }

    const handleEdit = () => {
        if(accessStatus=="viewer"){
            return
        }
        
        editScenario(scenarioId)
    
    }

    const handleDelete = () => {
        console.log("handleDeleye here")
        if(accessStatus=="viewer"){
            return
        }
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
                <h4 className="dropdown-menu-item-text">Add/Edit Event</h4>
            </button>
            <button className="dropdown-menu-button" onClick={handleDelete}>
                <h4 className="dropdown-menu-item-text">Delete</h4>
            </button>
            <button className="dropdown-menu-button">
                <h4 className="dropdown-menu-item-text" onClick={handleShare}>Share</h4>
            </button>
            <button className="dropdown-menu-button" onClick={handleExport}>
                <h4 className="dropdown-menu-item-text">Export as YAML</h4>
            </button>
        </div>
    )
}

export default DropdownMenu