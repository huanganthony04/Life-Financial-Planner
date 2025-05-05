import { useState } from 'react'
import ReactDOM from 'react-dom'
import axios from 'axios'
import YAML from 'yaml'
import writeIcon from '/src/assets/icons/write.svg'
import fileIcon from '/src/assets/icons/file.svg'

const SharingScenarioModal = ({open, onClose, scenarioId,searchWarning,changeSearchedUserName}) => {

    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL
console.log(scenarioId+"from modal component")


  if (!open) return null


let error=false;

const [searchStatus,changeSearchStatus]=useState("")

const [permission,changePermission]=useState("");

const[targetUser,changeTargetUser]=useState("")

  const handleAddPermission=()=>{
    console.log(permission+"permisison")
    console.log(targetUser+"targetuser")
    if(permission==""){error=true; changeSearchStatus("field is blank")}
    if(targetUser==""){error=true;changeSearchStatus("target user is blank")}
    if(error==true){
        console.log("error is true"+error)
    }
    else{
        console.log("error is false"+error)
     let searchResult=addPermission(scenarioId);
     console.log(searchResult+"searchResult")
     if(searchResult==false){
        console.log(searchResult+"searchResult")
        changeSearchStatus("user not found")
        setTimeout(() => changeSearchStatus(""), 3000)
     }
     else{
        
     }
    }

  }


const handlePermissionChange=(e)=>{
    console.log(permission);
    changePermission(e.target.value);
    console.log(e.target.value);
}
  const addPermission= async (scenarioId)=>{
   

            //search for user first if user found then post //actually you can do this in one statement by querying for that user to push into that user's array but if failed then this returns false
           //in backend with the username
            await axios.post(`${BACKEND_URL}/api/scenario/share`, {targetUser,scenarioId,permission}, {withCredentials: true})
                .then(() => {
                    console.log("worked");
                    changeSearchStatus("shared")
                    setTimeout(() => changeSearchStatus(""), 4000)
                })
                .catch((error) => {
                    console.log("yooo")
                    changeSearchStatus(error.message)
                    
                    //if error is no user found you need to display this on front end 
                    console.log(error)
                    return false;
                })
                    
  }

  return ReactDOM.createPortal(
    <div id="scenario-modal-overlay" onClick={() => onClose()}>
      <div id="scenario-modal" onClick={(e) => e.stopPropagation()}>
        <div id="scenario-modal-header">
            {searchStatus &&<p style={{ color: 'red' }}>{searchStatus}</p>}
          <h2 id="scenario-modal-header-title">Share Scenario</h2>
         
        </div>

        <div id="scenario-modal-body">

           <input type="text" placeholder='email' onChange={(e)=>changeTargetUser(e.target.value)}></input>


        </div>
        <input type="radio" id="html" name="choice" value="Viewer" onChange={e=>handlePermissionChange(e)}></input>
    <label for="html">Viewer</label>
    <input type="radio" id="html" name="choice" value="Editor" onChange={e=>handlePermissionChange(e)}></input>
    <label for="html">Editor</label>
    <input type="radio" id="html" name="choice" value="None" onChange={e=>handlePermissionChange(e)}></input>
    <label for="html">None</label>
s
        <button onClick={handleAddPermission}>add access </button>
      </div>
    </div>,
    document.getElementById('modal-root')
  )
}

export default SharingScenarioModal