import { useState } from 'react';
import axios from 'axios';
import React from 'react';
import ValueDist from './valueDistribution';

function ExpenseEvent({ scenarioId}) {
    const [title, setTitle] = useState('name');
   
    const [discretionaryStatus, setDiscretionary] = useState(true);
    const [inflationStatus, setInflation] = useState(true);

    const [summary, setSummary] = useState('description');
    const [startyear, setStartYear] = useState('');
    const [duration, setDuration] = useState('');
    const [userFrac, setUserFrac] = useState(1.0);
    const [amountOrPercent, setAP] = useState("amount");
    const [initial, setInitial] = useState('');

    const handleCheckbox=()=>{
        setInflation(!inflationStatus)
    }
    const handleDiscretion=()=>{
        setDiscretionary(!discretionaryStatus)
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

    async function post(){

        if(distMode1=="fixed"){
        const start={
            distType: distMode1,
            value:fixedValue1,

        }
        if(distMode=="uniform"){
            const start={
                distType: distMode1,
               upper:upper1,
                lower:lower1,

            }
        }
        if(distMode=="normal"){
            const start={
                distType: distMode1,
                mean:mu1,
                sigma:sigma1,

            }
        }


        if(distMode2=="fixed"){
            const start={
                distType: distMode2,
                value:fixedValue2,
    
            }
            if(distMode=="uniform"){
                const start={
                    distType: distMode2,
                   upper:upper2,
                    lower:lower2,
    
                }
            }
            if(distMode=="normal"){
                const start={
                    distType: distMode2,
                    mean:mu2,
                    sigma:sigma2,
    
                }
            }
        
    }

        console.log("post reached");
        console.log(distMode);
        if(distMode=="fixed"){
        let response = await axios.post("http://localhost:8080/api/postEventnew", {scenarioId:scenarioId, title:title,  distMode:distMode, fixedValue:fixedValue, summary: summary, discretionaryStatus:discretionaryStatus,inflationStatus:inflationStatus, startyear: startyear, duration: duration, userFrac: userFrac,amountOrPercent:amountOrPercent, initial:initial});
        }

        if(distMode=="uniform"){
            let response = await axios.post("http://localhost:8080/api/postEventnew", {scenarioId:scenarioId, title:title, distMode:distMode, upper:upper,lower:lower, summary: summary, discretionaryStatus:discretionaryStatus,inflationStatus:inflationStatus, startyear: startyear, duration: duration, userFrac: userFrac,amountOrPercent:amountOrPercent, initial:initial});
        }

        if(distMode=="normal"){
            console.log("normal sending");
            let response = await axios.post("http://localhost:8080/api/postEventnew", {scenarioId:scenarioId,title:title, mu:mu, sigma:sigma, summary: summary, discretionaryStatus:discretionaryStatus,inflationStatus:inflationStatus, startyear: startyear, duration: duration, userFrac: userFrac,amountOrPercent:amountOrPercent, initial:initial});
            }

      }

      const handlePostQuestion = () => {

        let errors = false;


        if(userFrac>1||userFrac<0){
            errors=true;
        }
        if(amountOrPercent!=='amount'&&amountOrPercent!='percent'){
            errors=true;
        }
        if(!errors){
          post();
        }
      }

    /*
    const [title, setTitle] = useState('');
    
    const [text, setText] = useState('');
    const [tags, setTags] = useState('');
  
    const [titleError, setTitleError] = useState('');
    const [summaryError, setSummaryError] = useState('');
    const [textError, setTextError] = useState('');
    const [tagsError, setTagsError] = useState('');

    async function post({tagsArray}){
      let response = await axios.post("http://localhost:8000/addQuestion", {title:title, summary: summary, text: text, tagsArray: tagsArray, user: user});
      await setSearchValue();
      let  query = "q/" + response.data;
      await setqueryString(query);
      await setQuestionWithTag();
      await pageChange("Questions");
    }

    const handlePostQuestion = () => {
      setTitleError ('');
      setSummaryError ('');
      setTextError ('');
      setTagsError('');
      let errors = false;
      let tagsArray = tags.split(" ");
      if (title.length > 50 || title.length === 0){
        setTitleError('Invalid Title Length');
        errors = true;
      }
      if (summary.length === 0 || summary.length > 140) {
        setSummaryError('Invalid Summary length');
        errors = true;
      }
      if (text.length === 0) {
        setTextError('Text should not be empty');
        errors = true;
      } 
      if (tagsArray.length > 5 || tags.length === 0){
        setTagsError("Invalid number of tags");
        errors = true;
      }
      if(!errors){
        post({tagsArray});
      }
    }
      */
  
    return (
      <div id = "question_form_container" className = "container">
        <div id = "question_form" className = "form">
          <h2> Expense Event Name </h2>
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
            <ValueDist setdistMode={setdistMode1} setUpper={setUpper1} setLower= {setLower1} setFixedValue={setFixedValue1} setMu={setMu1} setSigma={setSigma1}></ValueDist>
            
            <input 
              type="number" 
              name = "start_year" 
              id ="startyear" 
              placeholder='start year'
              value = {startyear}
              onChange = {(e) => setStartYear(e.target.value)}
              />
            </form>
            
            

            <form id = "duration">
            <input 
              type="number" 
              name = "duration" 
              id ="duration" 
              placeholder='duration'
              value = {duration}
              onChange = {(e) => setDuration(e.target.value)}
              />
              <>{duration}</>
            </form>
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
          

            <form id = "Discretionary">
                <>Discretionary:</>
                <>{discretionaryStatus?"true":"false"}</>
            <input 

              type="checkbox" 
              name = "Discretionary" 
              id ="Discretionary" 
              value={discretionaryStatus}
              defaultChecked 
              onChange = {handleDiscretion}
              />
            </form>
            <h4>User Fraction:(Default 1.0 if not specified) </h4>
            
            <input
                type="number"
                placeholder="user fraction"
                value={userFrac}
                onChange={(e)=>setUserFrac(e.target.value)}
            ></input>
            


            <ValueDist setdistMode={setdistMode} setUpper={setUpper} setLower= {setLower} setFixedValue={setFixedValue} setMu={setMu} setSigma={setSigma}></ValueDist>
            {//distMode=="fixed"&&(<div>Broooo</div>)
           // <p>{distMode}</p>
            }
            </div>






            
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
  export default ExpenseEvent;