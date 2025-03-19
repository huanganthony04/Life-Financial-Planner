import { useState, useEffect } from 'react'
import axios from 'axios'
import searchLogo from '../assets/icons/search.svg'
import addfileLogo from '../assets/icons/add_file.svg'
import ScenarioUpload from '../components/ScenarioUpload'
import './Scenario.css'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL

const Scenario = ({user}) => {

    const [scenarios, setScenarios] = useState([])
    const [isOpen, setIsOpen] = useState(false)
  
    useEffect(() => {

        //Get user scenarios
        if (user) {
            axios.get(`${BACKEND_URL}/api/scenarios/${user.userId}`, {withCredentials: true})
                .then((response) => {
                    console.log(response)
                    if (response.data.scenarios) {
                        setScenarios(response.data.scenarios)
                    }
                })
                .catch((error) => {
                    console.log(error)
                })
        }
        
        //Not logged in, get scenarios from local storage
        else {
            const localScenarios = localStorage.getItem("scenarios")
            if (localScenarios) {
                setScenarios(JSON.parse(localScenarios))
            }
        }


    }, [user])

    const scenarioList = (scenarios) => {
        if (scenarios.length === 0) {
            return (
                <div id="no-scenarios">
                    <h3>You have no scenarios</h3>
                </div>
            )
        }
        else {
            return (
                <div id="scenario-list">
                    {scenarios.map((scenario, index) => {
                        return (
                            <div key={index} className="scenario-item">
                                <h4>{scenario.name}</h4>
                            </div>
                        )
                    })}
                </div>
            )
        }
    }

    return (
        <>
            <div id="scenario-utils">
                <div id="scenario-search">
                    <img src={searchLogo} id="scenario-search-icon"/>
                    <input type="text" id="scenario-search-input" placeholder="Search..."/>
                </div>
                <button id="scenario-create-button" onClick={() => setIsOpen(true)}>
                    <img src={addfileLogo} id="scenario-create-icon"/>
                    <h4>Create</h4>
                </button>
            </div>
            <div>
                {scenarioList(scenarios)}
            </div>
            <ScenarioUpload open={isOpen} onClose={() => setIsOpen(false)}/>
        </>
    )


}

export default Scenario