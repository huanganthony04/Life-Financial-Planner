import React from 'react'
import { NavLink } from 'react-router-dom'
import homeLogo from '../assets/icons/home.svg'
import listLogo from '../assets/icons/list.svg'
import resultsLogo from '../assets/icons/bar_chart.svg'

import './Navbar.css'

const Navbar = () => {
  return (
    <nav id="navbar">
        <div id="navbar-label">
            <h3>Life Financial Planner</h3>
        </div>
        <div id="nav-buttons">
            <NavLink 
                to="/dashboard" 
                className={({isActive}) => (isActive ? 'nav-button current-variation' : 'nav-button')}
            >
                <img className="nav-button-icon" src={homeLogo}/>
                Dashboard
            </NavLink>
            <NavLink 
                to="/scenario" 
                className={({isActive}) => (isActive ? 'nav-button current-variation' : 'nav-button')}
            >
                <img className="nav-button-icon" src={listLogo}/>
                Scenarios
            </NavLink>

            <NavLink 
                to="/results" 
                className={({isActive}) => (isActive ? 'nav-button current-variation' : 'nav-button')}
            >
                <img className="nav-button-icon" src={resultsLogo}/>
                Results
            </NavLink>

            {/* Uncomment this when the UserProfile page is ready
            <NavLink 
                to="/userprofile" 
                className={({isActive}) => (isActive ? 'nav-button current-variation' : 'nav-button')}
            >
                <img className="nav-button-icon" src={listLogo}/>
                UserProfile
            </NavLink>
            */}
        </div>
    </nav>
  )
}

export default Navbar