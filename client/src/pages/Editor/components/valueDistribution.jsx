import { useState } from 'react';
import axios from 'axios';
import React from 'react';

function ValueDist({ setdistMode,setMu,setSigma,setUpper,setLower,setFixedValue}) {
    const title="Title";
    const summary= "description";

    const [visibleDiv,setVisibleDiv]=useState("normal");
    const handleValDist=(event)=> {
        
        const selectedValue= event.target.value;
        setdistMode(selectedValue);
        setVisibleDiv((prev)=>(prev===selectedValue?null :selectedValue));//is prevValue==selected if it is set val to null which hides? if its not then sets visibleDiv to selectedValue to show div corresponding to new selection option
    }
    
    /*
    if(visibleDiv=='fixed'){
        setdistMode("fixed");
    }
    if(visibleDiv=='normal'){
        setdistMode("normal");
    }
    if(visibleDiv=='uniform'){
        setdistMode("uniform");
    }
        
    */

  
    return (
  
        <div id = "valDist_form" className = "form">
          
          
          <div>
            Select distribution
          <select name="valDist" id="valDist" onChange={handleValDist}>
            <option value="normal">normal</option>
            <option value="fixed">fixed</option>
            <option value="gbm">GBM</option>
            <option value="uniform">uniform</option>
        </select>
        {visibleDiv==="fixed"&& (
            <div>
            <input
              type="number"
              name="fixed_value"
              id="fixed_value"
              placeholder="value"
              onChange = {(e) => setFixedValue(e.target.value)}
            ></input>
            
            </div>
           

        )}
        {visibleDiv==="normal"&& (
            <div>
            <input
              type="number"
              name="mu"
              id="mu"
              placeholder="mean (enter decimal)"
            
            ></input>
            <input
              type="number"
              name="sigma"
              id="sigma"
              placeholder="sigma (decimal)"
              onChange = {(e) => setSigma(e.target.value)}
            ></input>
            </div>

        )}

{visibleDiv==="uniform"&& (
            <div>
            <input
              type="number"
              name="lower"
              id="lower"
              placeholder="lower"
              onChange = {(e) => setLower(e.target.value)}
            
            ></input>
            <input
              type="number"
              name="upper"
              id="upper"
              placeholder="upper"
              onChange = {(e) => setUpper(e.target.value)}
            
            ></input>
            </div>

        )}
          </div>
        </div>
     
    );
  }
  export default ValueDist;