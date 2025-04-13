import { useState } from 'react';
import axios from 'axios';
import React from 'react';




function ExpenseEventCard({ singleExpenseEvent}) {



return(

           <div className="scenario-modal-list-item">
            <h4 className="scenario-title">{singleExpenseEvent.name}</h4>
            <button className="scenario-modal-button" onClick={() => {/*selectScenario(scenario); onClose()*/}}>
                Select
            </button>
        </div>
)

}

export default ExpenseEventCard;