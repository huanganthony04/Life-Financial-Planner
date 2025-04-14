import { useState } from 'react';
import axios from 'axios';
import React from 'react';




function ExpenseEventCard({ singleExpenseItem , editState,tog,togFunc}) {



const editToggle=()=>{
    togFunc(!tog);
    editState(
        singleExpenseItem
    );
    console.log("singleExpenseItem:\n")
    console.log(singleExpenseItem);
}
return(

           <div className="scenario-modal-list-item">
            <h4 className="scenario-title">{singleExpenseItem.name}</h4>
            <button className="scenario-modal-button" onClick={editToggle}>
                Edit
            </button>
        </div>
)

}

export default ExpenseEventCard;