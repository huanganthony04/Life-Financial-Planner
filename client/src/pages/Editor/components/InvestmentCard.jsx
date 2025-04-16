import { useState } from 'react';
import axios from 'axios';
import React from 'react';




function InvestmentCard({ singleInvestmentItem , isRebalance ,editState,tog,togFunc,changeaAInitial,changeaAFinal,glideStatus,aAInitial, aAFinal, defaultValOfReveal}) {
    const[rebalanceStatus,changeRebalanceStatus]=useState(isRebalance);

        const[reveal, setReveal]=useState(defaultValOfReveal);
        const[revealFixed,setRevealFixed]=useState(defaultValOfReveal);
    console.log(reveal);
const openForm=()=>{
    if(glideStatus==true){
        setReveal(prev => {
            const newReveal = !prev;
      
    
      
            if (newReveal==false) {
              aAInitial.delete(singleInvestmentItem.id);
              aAFinal.delete(singleInvestmentItem.id);
              console.log("form toggled deleted:", newReveal,singleInvestmentItem.id);
              console.log(aAInitial,"see if initial deleted")
            
              console.log(aAFinal,"see if final deleted")
            } else {
              aAInitial.set(singleInvestmentItem.id, "");
              aAFinal.set(singleInvestmentItem.id, "");

              console.log(aAInitial,"see if initial is empty")
            
              console.log(aAFinal,"see if final is empty")
            }

      
            console.log("form toggled:", newReveal,singleInvestmentItem.id);
            return newReveal;
          });

          const updatedMapI = new Map(aAInitial);
         
          
        const updatedMapF = new Map(aAFinal);
        changeaAInitial(updatedMapI);
        changeaAFinal(updatedMapF);
    }
    else if(glideStatus==false){
        setRevealFixed(prev => {
            const newReveal = !prev;
      
    
      
            if (newReveal==false) {
              aAInitial.delete(singleInvestmentItem.id);
              aAFinal.delete(singleInvestmentItem.id);
            } else {
              aAInitial.set(singleInvestmentItem.id, "");
              aAFinal.set(singleInvestmentItem.id, "");
            }

      
            console.log("form toggled:", newReveal,singleInvestmentItem.id);
            return newReveal;
          });


          const updatedMapI = new Map(aAInitial);
         

        const updatedMapF = new Map(aAFinal);
        changeaAInitial(updatedMapI);
        changeaAFinal(updatedMapF);


        console.log("form fixed opened");
    }

  
}






const onChangeHandleInitial=(event)=>{
    //setInputValue(event.target.value);
    const updatedMapI = new Map(aAInitial);
    aAInitial.set(singleInvestmentItem.id, event.target.value);
    updatedMapI.set(singleInvestmentItem.id, event.target.value);
    changeaAInitial(updatedMapI);

  
}
const onChangeHandleFinal=(event)=>{
    const updatedMapF = new Map(aAFinal);
    //setInputValue2(event.target.value);
    aAFinal.set(singleInvestmentItem.id, event.target.value);
    updatedMapF.set(singleInvestmentItem.id, event.target.value);
    changeaAFinal(updatedMapF);



}


const [inputValue, setInputValue] = useState('');
const [inputValue2, setInputValue2] = useState('');

const editToggle=()=>{
    togFunc(!tog);
    editState(
        singleInvestItem
    );
    console.log("singleInvestItem:\n")
    console.log(singleInvestItem);
}


return(
            <div>
           <div className="scenario-modal-list-item" onClick={openForm}>
            <h4 className="scenario-title">{singleInvestmentItem.id}</h4>
            <button className="scenario-modal-button" >
                Add asset Allocation (%)
            </button>

        </div>
        {glideStatus&&reveal==true&&<input placeholder="initial" type="number" onChange={onChangeHandleInitial}></input>}
        {glideStatus&&reveal==true&&<input type="number" placeholder='final'  onChange={onChangeHandleFinal}></input>}
        {!glideStatus&&revealFixed==true&&<input type="number" placeholder='fixed'  onChange={onChangeHandleInitial}></input>}
        </div>
)

}

export default InvestmentCard;