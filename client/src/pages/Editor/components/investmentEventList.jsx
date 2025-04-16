import { useEffect, useState } from "react";
import axios from 'axios';
import React from 'react';
import InvestmentCard from "./InvestmentCard";
import EditExpenseEvent from "./editExpenseEvent";
import InvestmentEventCard from "./investmentEventCard";

import EditInvestmentEvent from "./editInvestmentEvent";

function InvestmentEventList({ scenarioId, glideStatus, changeaAFinal, changeaAInitial,aAFinal,aAInitial,user}) {
//fetches expenses from database displays it 
//is there a data structure that holds copy of all the expense already so you don't need to refetch from database?


//1. fetch the scenarioId/scenario and grab its eventlist property
//2. put it into object
const [investmentEventList, setInvestmentEventList] = useState([]);

useEffect(() => {
    const fetchScenario = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/scenario/', {
                params: { id: scenarioId },
                withCredentials: true
            });
            console.log(response.data.scenario);
            setInvestmentEventList(response.data.scenario.investEvents);
            console.log("InvestmentEventList reached!");
        } catch (error) {
            console.error("Error:", error);
        }
    };

    if (scenarioId) {
        fetchScenario();
    }
}, [scenarioId]); // Run effect only when scenarioId changes





   const [eState,editState]= useState(false);
   const [toggle,edittog]= useState(false);

   const change=()=>{
    edittog(!toggle);
   }
    console.log("state of estate");
    console.log(eState);



    //const[aAFinal,changeaAFinal]=useState(new Map());
    //const[aAInitial,changeaAInitial]=useState(new Map());



return (
    <>
    <div>
    {investmentEventList.map((investmentEventItem)=>(<InvestmentEventCard key={investmentEventItem._id} singleInvestmentItem={investmentEventItem} editState={editState} tog={toggle} togFunc={edittog} glideStatus={glideStatus} aAInitial={aAInitial} aAFinal={aAFinal} changeaAFinal={changeaAFinal} changeaAInitial={changeaAInitial}/>))}
    {toggle&&<EditInvestmentEvent scenarioId={scenarioId} InvestEventId={eState._id} singleInvestMap={eState} tog={toggle} togFunc={edittog}></EditInvestmentEvent>}
    {/*not sure why without toggle turning true/false in expenseeventcard it wont rerender and put new eState in editExpensEvent form's autofill old data
    since eState should change state too */}
</div>
</>

);


}
export default InvestmentEventList;