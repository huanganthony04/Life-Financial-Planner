import { useState, useEffect } from 'react'
import axios from 'axios'
import searchLogo from '../assets/icons/search.svg'
import addfileLogo from '../assets/icons/add_file.svg'
import CreateScenarioFileModal from '../components/CreateScenarioFileModal'
import CreateScenarioNameModal from '../components/CreateScenarioNameModal'
import CreateScenarioModal from '../components/CreateScenarioModal'
import ScenarioListItem from '../components/ScenarioListItem'
import './Scenario.css'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL

const Scenario = ({user}) => {

    const [scenarios, setScenarios] = useState([])

    //States for opening and closing the modals
    const [ScenModalOpen, setScenModalOpen] = useState(false)
    const [ScenFileModalOpen, setScenFileModalOpen] = useState(false)
    const [ScenNameModalOpen, setScenNameModalOpen] = useState(false)
  
    useEffect(() => {

        //Get user scenarios
        if (user) {
            axios.get(`${BACKEND_URL}/api/scenario/${user.userId}`, {withCredentials: true})
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

    const scenariosList = (scenario) => {
        return scenario.map((item) => {
            return (
                <ScenarioListItem
                    key={item._id}
                    name={item.name}
                />
            )
        })
    }

    return (
        <>
            <div id="scenario-utils">
                <div id="scenario-search">
                    <img src={searchLogo} id="scenario-search-icon"/>
                    <input type="text" id="scenario-search-input" placeholder="Search..."/>
                </div>
                <button id="scenario-create-button" onClick={() => setScenModalOpen(true)}>
                    <img src={addfileLogo} id="scenario-create-icon"/>
                    <h4>Create</h4>
                </button>
            </div>
            {scenariosList(scenarios)}

            {/* Modals for creating scenarios */}
            <CreateScenarioModal
                open={ScenModalOpen} 
                onClose={() => setScenModalOpen(false)} 
                openScenarioFileModal={() => setScenFileModalOpen(true)}
                openScenarioNameModal={() => setScenNameModalOpen(true)}
                user={user}
            />
            <CreateScenarioFileModal 
                open={ScenFileModalOpen} 
                onClose={() => setScenFileModalOpen(false)}
                openScenarioModal={() => setScenModalOpen(true)}
                user={user}
            />
            <CreateScenarioNameModal
                open={ScenNameModalOpen} 
                onClose={() => setScenNameModalOpen(false)} 
                openScenarioModal={() => setScenModalOpen(true)}
                user={user}
            />
        </>
    )


}

export default Scenario