import { useState } from 'react';
import axios from 'axios';
import React from 'react';




function IncomeEventCard({ singleIncomeItem , editState,tog,togFunc}) {



const editToggle=()=>{
    togFunc(!tog);
    editState(
        singleIncomeItem
    );
    console.log("singleIncomeItem:\n")
    console.log(singleIncomeItem);
}
return(

           <div className="scenario-modal-list-item">
            <h4 className="scenario-title">{singleIncomeItem.name}</h4>
            <button className="scenario-modal-button" onClick={editToggle}>
                Edit
            </button>
        </div>
)

}

export default IncomeEventCard;