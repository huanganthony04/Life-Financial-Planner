import { useState } from 'react';
import axios from 'axios';
import React from 'react';



function ExpenseEventList({ scenarioId}) {
//fetches expenses from database displays it 
//is there a data structure that holds copy of all the expense already so you don't need to refetch from database?


//1. fetch the scenarioId/scenario and grab its eventlist property
//2. put it into object
const [expenseList, setExpenseList] = useState([]);

let scenarios= axios.get('http://localhost:8080//api/scenario/',{params:{scenarioId:scenarioId}})  .then(response => {
    console.log(response.data.expenseEventList); // The actual data from the response
    setExpenseList(response.data.expenseEventList);
    console.log("expenseList reached1");
  })
  .catch(error => {
    console.error('Error:', error);
  });

  for(let i=0; i <expenseList.length;i++){

  }
console.log("expenseList reached2");

return (
    <>
    <div>
    {Array.isArray(expenseList)&&expenseList.map((expenseItem)=>(<ExpenseEventcard key={expenseItem._id} singleExpenseItem={expenseItem} />))}
</div>
</>

);


}
export default ExpenseEventList;