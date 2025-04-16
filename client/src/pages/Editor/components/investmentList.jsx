import { useEffect, useState } from "react";
import axios from 'axios';
import React from 'react';
import InvestmentCard from "./InvestmentCard";
import EditExpenseEvent from "./editExpenseEvent";
import InvestmentCard2 from "./InvestmentCard2";



function InvestmentList({ scenarioId, glideStatus, changeaAFinal, changeaAInitial,aAFinal,aAInitial,user,defaultValOfReveal}) {
//fetches expenses from database displays it 
//is there a data structure that holds copy of all the expense already so you don't need to refetch from database?


//1. fetch the scenarioId/scenario and grab its eventlist property
//2. put it into object
const [investmentList, setInvestmentList] = useState([]);

useEffect(() => {
    const fetchScenario = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/scenario/', {
                params: { id: scenarioId },
                withCredentials: true
            });
            console.log(response.data.scenario);
            setInvestmentList(response.data.scenario.investments);
            console.log("InvestmentList reached!");
        } catch (error) {
            console.error("Error:", error);
        }
    };

    if (scenarioId) {
        fetchScenario();
    }
}, [scenarioId]); // Run effect only when scenarioId changes

let map1=new Map();
investmentList.map((investment)=>{
    map1.set(investment.id,false);
})

const [investmentStatus,changeInvestmentStatus]=useState(map1);

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
    {defaultValOfReveal==false&&investmentList.map((investmentItem)=>(<InvestmentCard key={investmentItem._id} singleInvestmentItem={investmentItem} editState={editState} tog={toggle} togFunc={edittog} glideStatus={glideStatus} aAInitial={aAInitial} aAFinal={aAFinal} changeaAFinal={changeaAFinal} changeaAInitial={changeaAInitial} defaultValOfReveal={defaultValOfReveal}/>))}
   {defaultValOfReveal==true&&investmentList.map((investmentItem)=>(<InvestmentCard2 key={investmentItem._id} singleInvestmentItem={investmentItem} editState={editState} tog={toggle} togFunc={edittog} glideStatus={glideStatus} aAInitial={aAInitial} aAFinal={aAFinal} changeaAFinal={changeaAFinal} changeaAInitial={changeaAInitial} defaultValOfReveal={defaultValOfReveal}/>))}
    {/*not sure why without toggle turning true/false in expenseeventcard it wont rerender and put new eState in editExpensEvent form's autofill old data
    since eState should change state too */}
</div>
</>

);


}
export default InvestmentList;