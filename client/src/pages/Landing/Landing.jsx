import { useNavigate } from 'react-router-dom'
import './Landing.css'

const Landing = () => {

  const navigate = useNavigate()

  return (
    <>
      <div id="landing-page">
        <div id="landing-page-header">
          <h3>Life Financial Planner</h3>
          <button id="landing-page-login-button" onClick={() => navigate("/login")}>
            Login or Sign Up
          </button>
        </div>
        <div id="landing-page-content">
          <h4>Welcome to</h4>
          <h1>Life Financial Planner</h1>
          <p>Have an account? <a href="/login">Login here</a></p> 
          <p>or <a href="/dashboard">continue as a guest</a></p>
        </div>
      </div>
    </>
  )
}

export default Landing