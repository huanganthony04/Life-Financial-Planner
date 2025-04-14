import { useEffect, useState } from "react";
import axios from 'axios';
import React from 'react';
import ExpenseEventCard from './expenseEventCard';
import EditExpenseEvent from "./editExpenseEvent";



function ExpenseEventList({ scenarioId,user}) {
//fetches expenses from database displays it 
//is there a data structure that holds copy of all the expense already so you don't need to refetch from database?


//1. fetch the scenarioId/scenario and grab its eventlist property
//2. put it into object
const [expenseList, setExpenseList] = useState([]);

useEffect(() => {
    const fetchScenario = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/scenario/', {
                params: { id: scenarioId },
                withCredentials: true
            });
            console.log(response.data.scenario);
            setExpenseList(response.data.scenario.expenseEvents);
            console.log("expenseList reached!");
        } catch (error) {
            console.error("Error:", error);
        }
    };

    if (scenarioId) {
        fetchScenario();
    }
}, [scenarioId]); // Run effect only when scenarioId changes

  for(let i=0; i <expenseList.length;i++){
    
  }
console.log("expenseList reached2");



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
    {expenseList.map((expenseItem)=>(<ExpenseEventCard key={expenseItem._id} singleExpenseItem={expenseItem} editState={editState} tog={toggle} togFunc={edittog}/>))}
    {toggle&&<EditExpenseEvent scenarioId={scenarioId} expenseEventId={eState._id} singleExpenseMap={eState} tog={toggle} togFunc={edittog}></EditExpenseEvent>}
    {/*not sure why without toggle turning true/false in expenseeventcard it wont rerender and put new eState in editExpensEvent form's autofill old data
    since eState should change state too */}
</div>
</>

);


}
export default ExpenseEventList;