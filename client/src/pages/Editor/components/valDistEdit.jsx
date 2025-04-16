import { useState } from 'react';
import axios from 'axios';
import React from 'react';

function ValueDistEdit({ setdistMode,setMu,setSigma,setUpper,setLower,setFixedValue,isEdit,type,valType,distType,upper,lower,mean,sigma,value}) {
console.log(isEdit,"isEdit object")
console.log(valType,"valType is blank?")
 //let valType;
  if(isEdit!=undefined&&type=='duration'){
    
    //valType=isEdit.duration;
    console.log("hi",valType,"valType exists")
/*
    if(valType.distType=='fixed'){
        
        setFixedValue(valType.value);
        //setdistMode("fixed");
    }
    if(valType.distType=='normal'){
        //setdistMode("normal");
        setMu(valType.mean);
        setMu(valType.sigma);
    }
    if(valType.distType=='uniform'){
        //setdistMode("uniform");
        setLower(valType.lower);
        setUpper(valType.upper);
    }
        */
    console.log(valType,"duration valType map");
  }


  if(isEdit!=undefined&&type=='changeDistribution'){
    //valType=isEdit.changeDistribution;
    console.log(valType,"valTYpe")
    
    if(valType.distType=='fixed'){
        //setFixedValue(valType.value);
        //setdistMode("fixed");
    }
    if(valType.distType=='normal'){
        //setdistMode("normal");
        //setMu(valType.mean);
        //setMu(valType.sigma);
    }
    if(valType.distType=='uniform'){
        //setdistMode("uniform");
        //setLower(valType.lower);
        //setUpper(valType.upper);
    }
        
    
    console.log(valType,"changeDist valType map");
  }
  if(isEdit!=undefined&&type=='start'){
    
    //valType=isEdit.start.startDistribution;
    /*
    console.log("hi",valType,"valType exists")
    if(valType.distType=='fixed'){
        setFixedValue(valType.value);
        //setdistMode("fixed");
    }
    if(valType.distType=='normal'){
        //setdistMode("normal");
        setMu(valType.mean);
        setMu(valType.sigma);
    }
    if(valType.distType=='uniform'){


        //setdistMode("uniform");
        setLower(valType.lower);
        setUpper(valType.upper);
    }
        */
    //console.log(valType,"start valType map");
  }


    const title="Title";
    const summary= "description";
    if(valType!=undefined){
console.log(valType.distType,'distTye tets');}
if(valType==undefined){
    console.log("how is distType undefined")
}
    const [visibleDiv,setVisibleDiv]=useState( 'normal');

    const handleValDist=(event)=> {
        
        const selectedValue= event.target.value;
        setdistMode(selectedValue);
        console.log("selected value is ",selectedValue);
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
              //value={value}
              //value={valType!=undefined&&valType.distType=="fixed" ?valType.value : ""}
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
              value={mean}
             // value={valType!=undefined&&valType.distType=="normal" ?valType.mean : ""}
              placeholder="mean (enter decimal)"
              onChange = {(e) => setMu(e.target.value)}
            
            ></input>
            <input
              type="number"
              name="sigma"
              id="sigma"
              value={sigma}
              //value={valType!=undefined&&valType.distType=="normal" ?valType.sigma : ""}
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
              //value={lower}
              //value={valType!=undefined&&valType.distType=="uniform" ?valType.lower : ""}
              onChange = {(e) => setLower(e.target.value)}
            
            ></input>
            <input
              type="number"
              name="upper"
              id="upper"
              //value={upper}
              //value={valType!=undefined&&valType.distType=="uniform" ?valType.upper : ""}
              placeholder="upper"
              onChange = {(e) => setUpper(e.target.value)}
            
            ></input>
            </div>

        )}
          </div>
        </div>
     
    );
  }
  export default ValueDistEdit;