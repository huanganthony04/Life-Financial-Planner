import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import searchLogo from '/src/assets/icons/search.svg'
import addfileLogo from '/src/assets/icons/add_file.svg'
import CreateScenarioFileModal from './components/CreateScenarioFileModal'
import CreateScenarioNameModal from './components/CreateScenarioNameModal'
import CreateScenarioModal from './components/CreateScenarioModal'
import ScenarioListItem from './components/ScenarioListItem'
import './Scenario.css'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL

const Scenario = ({user}) => {

    const navigate = useNavigate()

    const [scenarios, setScenarios] = useState([])

    //States for opening and closing the modals
    const [ScenModalOpen, setScenModalOpen] = useState(false)
    const [ScenFileModalOpen, setScenFileModalOpen] = useState(false)
    const [ScenNameModalOpen, setScenNameModalOpen] = useState(false)

    const fetchUserScenarios = async (user) => {
        await axios.get(`${BACKEND_URL}/api/scenario/byuser?userId=${user.userId}`, {withCredentials: true})
        .then((response) => {
            if (response.data.scenarios) {
                setScenarios(response.data.scenarios)
            }
        })
        .catch((error) => {
            console.log(error)
        })
    }

    // Function to create a scenario
    // This function is passed down to the Child Modals
    // Defining it here allows Scenarios page to refresh the list of scenarios
    const createScenario = useCallback(async (scenario) => {
        await axios.post(`${BACKEND_URL}/api/scenario/create`, scenario, {withCredentials: true})
            .then(() => {
                setScenModalOpen(false)
                setScenFileModalOpen(false)
                setScenNameModalOpen(false)
                fetchUserScenarios(user)
            })
            .catch((error) => {
                console.log(error)
                return
            })
    }, [user])

    const editScenario = useCallback((scenarioId) => {
        navigate(`/scenario/edit?id=${scenarioId}`)
    }, [navigate])

    const deleteScenario = useCallback(async (scenarioId) => {
        await axios.post(`${BACKEND_URL}/api/scenario/delete`, {scenarioId}, {withCredentials: true})
        .then(() => {
            fetchUserScenarios(user)
        })
        .catch((error) => {
            console.log(error)
        })
    }, [user])

    const exportScenario = useCallback(async (scenarioId, name = 'scenario') => {
        await axios.get(`${BACKEND_URL}/api/scenario/export?id=${scenarioId}`, {withCredentials: true})
        .then((response) => {
            const blob = new Blob([response.data], { type: 'text/yaml' })
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `${name}.yaml`
            a.click()
            window.URL.revokeObjectURL(url)
        })
        .catch((error) => {
            console.log(error)
        })
    }, [user])
  
    useEffect(() => {
        if (user) {
            fetchUserScenarios(user)
        }
    }, [user])

    const scenariosList = (scenario) => {
        return scenario.map((item) => {
            return (
                <ScenarioListItem
                    key={item._id}
                    name={item.name}
                    scenarioId={item._id}
                    // Function to edit/delete scenarios
                    editScenario={editScenario}
                    deleteScenario={deleteScenario}
                    exportScenario={exportScenario}
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
                createScenario={createScenario}
            />
            <CreateScenarioNameModal
                open={ScenNameModalOpen} 
                onClose={() => setScenNameModalOpen(false)} 
                openScenarioModal={() => setScenModalOpen(true)}
                user={user}
                createScenario={createScenario}
            />
        </>
    )


}

export default Scenario