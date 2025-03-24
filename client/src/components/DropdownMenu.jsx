import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import './DropdownMenu.css'

const DropdownMenu = ({open, setOpen, scenarioId}) => {

    const navigate = useNavigate()

    const dropdownRef = useRef(null)

    const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setOpen(false)
        }
    }

    const handleEdit = () => {
        navigate(`/scenario/edit?id=${scenarioId}`)
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

export default DropdownMenu