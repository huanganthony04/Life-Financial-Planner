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
import SharingScenarioModal from './components/SharingScenarioModal'
import SharedScenarioListItem from './components/sharedScenarioListItem'
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL

const SharedScenario = ({user}) => {

    const navigate = useNavigate()

    const [scenarios, setScenarios] = useState([])
    const [sharedscenarios, setSharedScenarios] = useState([])

    //States for opening and closing the modals
    const [ScenModalOpen, setScenModalOpen] = useState(false)
    const [ScenFileModalOpen, setScenFileModalOpen] = useState(false)
    const [ScenNameModalOpen, setScenNameModalOpen] = useState(false)
    const [shareModalState,setSharingModalState]=useState(false)
    const [searchedUserName,changeSearchedUserName]=useState("")
    const[sharedScenarioId,changeSharedId]=useState("")
    //fetch user and get its sharedScenario as a state then for loop again to fetch each individual

    const fetchUserScenarios = async (user) => {
        await axios.get(`${BACKEND_URL}/api/sharedscenario/byuser?userId=${user.userId}`, {withCredentials: true})
        .then((response) => {
            console.log(response.data.sharedScenarios)
            if (response.data.sharedscenarios) {
                setSharedScenarios(response.data.sharedscenarios)
                console.log(sharedscenarios+"sharedscenarios id list")
            }
        })
        .catch((error) => {
            console.log(error)
        })
    }


    const fetchEachScenario= async (user) => {
        let tempScenarioList=[]
        for(let i=0; i<sharedscenarios.length;i++){
            try {
                const response = await axios.get('http://localhost:8080/api/scenario2/', {
                    params: { id: sharedscenarios[i] },
                    withCredentials: true
                });
                console.log(response.data.scenario);
                tempScenarioList.push(response.data.scenario)
                console.log("expenseList reached!");
            } catch (error) {
                console.error("Error:", error);
            }
        }
        setScenarios(tempScenarioList);

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
                fetchEachScenario(user)
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
        await axios.post(`${BACKEND_URL}/api/scenario/Editordelete`, {scenarioId, user}, {withCredentials: true})
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
            fetchEachScenario(user)
        }
    }, [user])

    const scenariosList = (scenario) => {
        return scenario.map((item) => {
            return (
                <SharedScenarioListItem
                    key={item._id}
                    name={item.name}
                    scenarioId={item._id}
                    // Function to edit/delete scenarios
                    editScenario={editScenario}
                    deleteScenario={deleteScenario}
                    exportScenario={exportScenario}
                    shareScenario={shareScenario}
                    changeSharedId={changeSharedId}
                    owner={item.owner}
                    accessStatus={item.editors.includes(user.userId)?"editor":"viewer"}
                />
            )
        })
    }

const [userFoundStatus,changeUserFoundStatus]=useState("")

const [searchWarning,changeSW]=useState(false)
    const shareScenario = useCallback(async (scenarioId) => {
        //opens modal 
        setSharingModalState(true);

    }, [user])

   


    
   
    
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
            <SharingScenarioModal                 
                open={shareModalState} 
                scenarioId={sharedScenarioId}
                searchWarning={searchWarning}
                changeSearchedUserName={changeSearchedUserName}
                onClose={() => setSharingModalState(false)} 
                shareScenario={shareScenario}
               
                user={user}/>
        </>
    )


}

export default SharedScenario