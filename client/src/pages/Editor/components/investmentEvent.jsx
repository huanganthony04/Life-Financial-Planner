import { useState } from 'react';
import axios from 'axios';
import React from 'react';
import ValueDist from './valueDistribution';

function InvestmentEvent({ scenarioId}) {
    const [title, setTitle] = useState('name');
   
   
    const [glideStatus, setGlide] = useState(true);

    const [summary, setSummary] = useState('description');
    //const [start, setStart] = useState('');
    var start='';
    //const [duration, setDuration] = useState('');
    var duration='';
const[startsWith1,setStartWith]=useState('');



    const handleCheckbox=()=>{
        setGlide(!glideStatus)
    }


  

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
        
    

      

    async function post(){

       
        let response = await axios.post("http://localhost:8080/api/postInvestmentnew", {scenarioId:scenarioId,title:title, summary: summary, glideStatus:glideStatus, start: start, duration: duration});
            console.log("post sending");
      }

      const handlePostQuestion = () => {

        let errors = false;
        if(start==''||duration==''){
            errors=true;
            if(start==''){console.log("start is blank")}
            if(duration==''){console.log("duration is blank")}
            
            console.log("a field is blank");
        }


        if(!errors){
          post();
        }
      }

 
  
    return (
      <div id = "question_form_container" className = "container">
        <div id = "question_form" className = "form">
          <h2> Investment Event Name </h2>
          <p> Limit Name to 50 characters or less.</p>
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






            <form id = "duration">
                <h3>Add Asset Allocations (change here to assetAllocation inputs)</h3>
            <ValueDist setdistMode={setdistMode2} setUpper={setUpper2} setLower= {setLower2} setFixedValue={setFixedValue2} setMu={setMu2} setSigma={setSigma2}></ValueDist>

            </form>

            

            </div>

           







            

            <form id = "glidePath">
                <>glidepath:</>
                <> {glideStatus==true? "true":"false"}</>
            <input 

              type="checkbox" 
              name = "glidepath" 
              id ="glidepath"    
              
              //defaultChecked
              checked={glideStatus}//checked is vlaue of a checkbox
              onChange = {handleCheckbox}
              /> 
            </form>
          
            
    






            
          <p id = "q_tags_error" className = "error"></p>
          <button 
            id = "post_question_button" 
            className = "ask-post_button" 
            onClick={handlePostQuestion}
            
            >Post Question</button>
          <p className = "mandatory">
            *indicates mandatory fields
          </p>
        </div>
      </div>
    );

  }
  export default InvestmentEvent;