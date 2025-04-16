import { useEffect, useState } from "react";
import axios from 'axios';
import React from 'react';

import IncomeEventCard from "./incomeEventCard";

import EditIncomeEvent from "./editIncomeEvent";



function IncomeEventList({ scenarioId,user}) {
//fetches expenses from database displays it 
//is there a data structure that holds copy of all the expense already so you don't need to refetch from database?


//1. fetch the scenarioId/scenario and grab its eventlist property
//2. put it into object
const [incomeList, setIncomeList] = useState([]);

useEffect(() => {
    const fetchScenario = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/scenario/', {
                params: { id: scenarioId },
                withCredentials: true
            });
            console.log(response.data.scenario);
            setIncomeList(response.data.scenario.incomeEvents);
            console.log("expenseList reached!");
        } catch (error) {
            console.error("Error:", error);
        }
    };

    if (scenarioId) {
        fetchScenario();
    }
}, [scenarioId]); // Run effect only when scenarioId changes


console.log("incomeList reached2");



   const [eState,editState]= useState(false);
   const [toggle,edittog]= useState(false);

   const change=()=>{
    edittog(!toggle);
   }
    console.log("state of estate");
    console.log(eState);

return (
    <>
    <div>
    {incomeList.map((incomeItem)=>(<IncomeEventCard key={incomeItem._id} singleIncomeItem={incomeItem} editState={editState} tog={toggle} togFunc={edittog}        />))}
    {toggle&&<EditIncomeEvent scenarioId={scenarioId} IncomeEventId={eState._id} singleIncomeMap={eState} tog={toggle} togFunc={edittog}></EditIncomeEvent>}
    {/*not sure why without toggle turning true/false in expenseeventcard it wont rerender and put new eState in editExpensEvent form's autofill old data
    since eState should change state too */}
</div>
</>

);


}
export default IncomeEventList;