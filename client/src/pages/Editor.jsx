import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import axios from 'axios'
import ExpenseEvent from '../components/expenseEvent'
import UserProfile from '../components/UserProfile'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL

const Editor = () => {

  //State to hold the scenario data
  const [scenario, setScenario] = useState(null)

  //Get the scenario ID from the URL
  const [ searchParams ] = useSearchParams()
  const scenarioId = searchParams.get('id')

  useEffect(() => {
    //Fetch the full scenario data from the backend
    axios.get(`${BACKEND_URL}/api/scenario?id=${scenarioId}`, {withCredentials: true})
      .then((response) => {

        //The response contains the scenario data in response.data.scenario.
        //Right now, it is just being logged to the console.
        console.log(response)
        if (response.data.scenario) {
          setScenario(response.data.scenario)
        }
      })
      .catch((error) => {
        console.log(error)
      })

  }, [scenarioId])

  const navigate = useNavigate()

  return (
    <div id="editor-page" className="page">
      
      <ExpenseEvent scenarioId={scenarioId}></ExpenseEvent>
        <button onClick={() => navigate('/scenario')}>Return to scenarios</button>

    </div>
  )
}

export default Editor