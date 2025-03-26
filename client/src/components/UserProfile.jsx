import { useState } from 'react';
import axios from 'axios';
import React from 'react';
import ValueDist from './valueDistribution';
import { NavLink } from 'react-router-dom';

import './ProfilePage.css';
 // Import the CSS file
import { FaGoogle, FaArrowRight, FaUpload } from "react-icons/fa";

function UserProfile({ scenarioId,email1}) {
    
  
    const [email, setEmail] = useState(email1);

    return (
      <div className="profile-container">
        {/* Profile Section */}
        <div className="profile-header">
          <div className="profile-icon">👤</div>
          <h2>User Name</h2>
        </div>
  
        {/* Google Login */}
        <div className="card">
          <div className="card-left">
            <FaGoogle className="icon" />
            <span>Login With Google</span>
          </div>
          <span className="email-text">{email}</span>
          <FaArrowRight className="icon" />
        </div>
  
        {/* Saved Scenarios */}
        <div className="card">
        <NavLink 
                to="/scenario" 
                className={({isActive}) => (isActive ? 'nav-button current-variation' : 'nav-button')}
            >
       </NavLink>
          <span>Saved Scenarios</span>
          <FaArrowRight className="icon" />
        </div>
  

  
        {/* File Upload */}
        <div className="file-upload">
          <label>State Tax</label>
          <div className="upload-box">
            <input type="text" placeholder="Upload: YAML" readOnly />
            <FaUpload className="icon" />
          </div>
        </div>
  
        {/* Logout Button */}
        <button className="logout-btn">Logout</button>
      </div>
    );
  
  }
  export default UserProfile;