import './Editor.css'
import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import axios from 'axios'
import ExpenseEvent from './components/expenseEvent'
import IncomeEvent from './components/incomeEvent'
import { InvestEvent } from '../../../../server/classes'
import InvestmentEvent from './components/investmentEvent'
import RebalanceEvent from './components/rebalanceEvent'

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

  const[tabState,setTab]=useState('');
  

  const expenseSwitch=()=>{
    setTab('expense');
  }
  const incomeSwitch=()=>{
    setTab('income');
  }
  const investmentSwitch=()=>{
    setTab('investment');
  }
  const rebalanceSwitch=()=>{
    setTab('rebalance');
  }

  return (
    <div id="editor-page" className="page">
      <div id='tab_container'>
      <div id="expenseEventTab" className='tabs' onClick={expenseSwitch}>Expense</div>
      <div id="incomeEventTab" className='tabs'onClick={incomeSwitch}>Income</div>
      <div id="invesmentEventTab" className='tabs' onClick={investmentSwitch}>Investment</div>
      <div id="rebalanceEventTab" className='tabs'onClick={rebalanceSwitch}>Rebalance</div>
      </div>

      {tabState=='expense'&&(<div className='tabform'><ExpenseEvent className='tabform' scenarioId={scenarioId}></ExpenseEvent></div>)}
      {tabState=='income'&&(<div className='tabform'><IncomeEvent className='tabform' scenarioId={scenarioId}></IncomeEvent></div>)}
      {tabState=='investment'&&(<div className='tabform'><InvestmentEvent className='tabform' scenarioId={scenarioId}></InvestmentEvent></div>)}
      {tabState=='rebalance'&&(<div className='tabform'><RebalanceEvent className='tabform' scenarioId={scenarioId}></RebalanceEvent></div>)}
        <button onClick={() => navigate('/scenario')}>Return to scenarios</button>

    </div>
  )
}

export default Editor