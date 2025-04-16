import { useState } from 'react';
import axios from 'axios';
import React from 'react';
import ValueDist from './valueDistribution';
import IncomeEventList from './incomeEventList';
function EditIncomeEvent({ scenarioId, IncomeEventId,singleIncomeMap}) {
    console.log(IncomeEventId,"income id")
    const [title, setTitle] = useState(singleIncomeMap.name);
   
    const [socialSecurityStatus, setSSN] = useState(singleIncomeMap.socialSecurityStatus);
    const [inflationStatus, setInflation] = useState(singleIncomeMap.inflationAdjusted);

    const [summary, setSummary] = useState(singleIncomeMap.description);
    //const [start, setStart] = useState('');
    var start='';
    //const [duration, setDuration] = useState('');
    var duration='';
const[startsWith1,setStartWith]=useState('');

    const [userFrac, setUserFrac] = useState(1.0);
    const [amountOrPercent, setAP] = useState(singleIncomeMap.changeAmtOrPct);
    const [initial, setInitial] = useState(singleIncomeMap.initialAmount);

    const handleCheckbox=()=>{
        setInflation(!inflationStatus)
    }
    const handleSSN=()=>{
        setSSN(!socialSecurityStatus)
    }

    const [distMode,setdistMode]=useState('normal');
    const [fixedValue, setFixedValue] = useState('');
    const [mu,setMu]=useState('');
    const [sigma,setSigma]=useState('');
    const [upper,setUpper]=useState('');
    const [lower,setLower]=useState('');

    const [distMode1,setdistMode1]=useState('normal');
    const [fixedValue1, setFixedValue1] = useState('');
    const [mu1,setMu1]=useState('');
    const [sigma1,setSigma1]=useState('');
    const [upper1,setUpper1]=useState('');
    const [lower1,setLower1]=useState('');

    const [distMode2,setdistMode2]=useState('normal');
    const [fixedValue2, setFixedValue2] = useState('');
    const [mu2,setMu2]=useState('');
    const [sigma2,setSigma2]=useState('');
    const [upper2,setUpper2]=useState('');
    const [lower2,setLower2]=useState('');

    //const [changeDistribution,setChangeDist]=useState('');
    var changeDistribution='';
     //dist1 is distType for value valDist of eventstart
     if(distMode1=="fixed"){
        start={
          startDistribution:{
            distType: distMode1,
            value:fixedValue1,
          },
          startWith:startsWith1

        }
    }
        
        if(distMode1=="uniform"){
          start={
            startDistribution:{
              distType: distMode1,
              upper:upper1,
               lower:lower1,
            },
            startWith:startsWith1
  
          }

        }
        if(distMode1=="normal"){
            start={
              startDistribution:{
                distType: distMode1,
                mean:mu1,
                sigma:sigma1,
              },
              startsWith:startsWith1
            

            }
        }


        if(distMode2=="fixed"){
            duration={
                distType: distMode2,
                value:fixedValue2,
    
            }
        }
            if(distMode2=="uniform"){
                duration={
                    distType: distMode2,
                   upper:upper2,
                    lower:lower2,
    
                }
            }
            if(distMode2=="normal"){
                duration={
                    distType: distMode2,
                    mean:mu2,
                    sigma:sigma2,
    
                }
            }
        
    

        if(distMode=="normal"){
             changeDistribution={
                distType: distMode,
                mean:mu,
                sigma:sigma,

            }
       
        }
        if(distMode=="fixed"){
             changeDistribution={
                distType: distMode,
                value:fixedValue,

            }

        }
        if(distMode=="uniform"){
             changeDistribution={
                distType: distMode,
                upper:upper,
                lower:lower,

            }
           
           
            }

    async function post(){

       
        let response = await axios.post("http://localhost:8080/api/postIncomeUpdate", {IncomeEventId:IncomeEventId, scenarioId:scenarioId,title:title,changeDistribution:changeDistribution, summary: summary, socialSecurityStatus:socialSecurityStatus,inflationStatus:inflationStatus, start: start, duration: duration, userFrac: userFrac,amountOrPercent:amountOrPercent, initial:initial});
            console.log("post sending");
      }

      const handlePostQuestion = () => {

        let errors = false;


        if(distMode1=="fixed"&&fixedValue1==''){
            errors=true;
        }
    if(distMode1=="uniform"&&(upper1==''||lower1=='')){errors=true}
    if(distMode1=="normal"&&(mu1==''||sigma1=='')){errors=true}
  
    if(distMode2=="fixed"&&fixedValue2==''){errors=true}
    if(distMode2=="uniform"&&(upper2==''||lower=='')){errors=true}
    if(distMode2=="normal"&&(mu2==''||sigma2=='')){errors=true}
  
    if(distMode=="normal"&&(mu==''||sigma=='')){errors=true}
      if(distMode=="fixed"&&fixedValue==''){errors=true}
    if(distMode=="uniform"&&(upper==''||lower=='')){
        errors=true;
    }
        if(start==''||duration==''||changeDistribution==''||initial==''){
            errors=true;
            if(start==''){console.log("start is blank")}
            if(duration==''){console.log("duration is blank")}
            if(changeDistribution==''){console.log("changeDuration is blank")}
            console.log("a field is blank");
        }

        if(userFrac>1||userFrac<0){
            errors=true;
            console.log("userFrac less than one");
        }
        if(amountOrPercent!=='amount'&&amountOrPercent!='percent'){
            errors=true;
        }
        if(!errors){
          post();
        }
        if(errors==true){console.log("field is blank")}
      }

 
  
    return (
      <div id = "question_form_container" className = "container">
        <div id = "question_form" className = "form">
          <h2> Income Event Name </h2>
          <p> Limit Name to 50 characters or less</p>
          <form id = "q_title_form">
            <input 
              type="text" 
              name = "q_title_input" 
              id ="q_title_input" 
              required
              value = {title}
              onChange = {(e) => setTitle(e.target.value)}
            />
          </form>
          <h2> Description </h2>
          <p> Limit Summary to 300 characters or less</p>
          <form id = "summary_form">
            <input 
              type="text" 
              name = "summary_inputs" 
              id ="summary_input" 
              value = {summary}
              onChange = {(e) => setSummary(e.target.value)}
              
              />
            </form>
            <p>{summary}</p>

            <div> 
                <h2>Specification Parameters*</h2>
            <form id = "start_year">
                <h3>Start</h3>
            <ValueDist setdistMode={setdistMode1} setUpper={setUpper1} setLower= {setLower1} setFixedValue={setFixedValue1} setMu={setMu1} setSigma={setSigma1}></ValueDist>
            <input type="text"
            name="startWith"
            value={startsWith1}
            onChange = {(e) => setStartWith(e.target.value)}
            placeholder="startsWith eventSeries name"
            ></input>

            </form>
            
            

            <form id = "duration">
                <h3>Duration</h3>
            <ValueDist setdistMode={setdistMode2} setUpper={setUpper2} setLower= {setLower2} setFixedValue={setFixedValue2} setMu={setMu2} setSigma={setSigma2}></ValueDist>

              
            </form>

            

        <h3>Change Distribution</h3>
            <ValueDist setdistMode={setdistMode} setUpper={setUpper} setLower= {setLower} setFixedValue={setFixedValue} setMu={setMu} setSigma={setSigma}></ValueDist>
            {//distMode=="fixed"&&(<div>Broooo</div>)
           // <p>{distMode}</p>
            }
            </div>

            <h3>Misc</h3>
            <div> Initial Amount </div>
            <form id = "inital_amount">
            <input 
              type="number" 
              name = "initial_amount" 
              id ="initial_amount" 
              placeholder='initial amount'
              value = {initial}
              onChange = {(e) => setInitial(e.target.value)}

              />
             
            </form>


            <div>Amount or Percent</div>
            <select name="amount_or_percent" id="amount_or_percent"  onChange={(e)=>setAP(e.target.value)}>
                
            <option value="amount">amount</option>
            <option value="percent">percent</option>
    
            </select>
            
            
            

            <form id = "inflation adjusted">
                <>Inflation Adjusted:</>
                <> {inflationStatus==true? "true":"false"}</>
            <input 

              type="checkbox" 
              name = "inflation-adjusted" 
              id ="inflation-adjusted"    
              
              //defaultChecked
              checked={inflationStatus}//checked is vlaue of a checkbox
              onChange = {handleCheckbox}
              /> 
            </form>
          
            
            <form id = "SocialSecurity">
                <>Social Security:</>
                <>{socialSecurityStatus?"true":"false"}</>
            <input 

              type="checkbox" 
              name = "ssn" 
              id ="ssn" 
              value={socialSecurityStatus}
              defaultChecked 
              onChange = {handleSSN}
              />
            </form>
            <h4>User Fraction:(Default 1.0 if not specified) </h4>
            
            <input
                type="number"
                placeholder="user fraction"
                value={userFrac}
                onChange={(e)=>setUserFrac(e.target.value)}
            ></input>






            
          <p id = "q_tags_error" className = "error"></p>
          <button 
            id = "post_question_button" 
            className = "ask-post_button" 
            onClick={handlePostQuestion}
            
            >Post </button>
          <p className = "mandatory">
            *indicates mandatory fields
          </p>
        </div>
      </div>
    );

  }
  export default EditIncomeEvent;