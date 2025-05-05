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

}

export default IncomeEventCard;