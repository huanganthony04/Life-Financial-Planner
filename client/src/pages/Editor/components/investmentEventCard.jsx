import { useState } from 'react';
import axios from 'axios';
import React from 'react';



function InvestmentEventCard({ singleInvestmentItem , editState,tog,togFunc}) {


const [inputValue, setInputValue] = useState('');
const [inputValue2, setInputValue2] = useState('');

const editToggle=()=>{
    togFunc(!tog);
    editState(
        singleInvestmentItem
    );
    console.log("singleInvestItem:\n")
    console.log(singleInvestmentItem);
}

return(
        
           <div className="scenario-modal-list-item" onClick={editToggle}>
            <h4 className="scenario-title">{singleInvestmentItem.name}</h4>
            <button className="scenario-modal-button" >
                Edit
            </button>

        </div>

)

}

export default InvestmentEventCard;