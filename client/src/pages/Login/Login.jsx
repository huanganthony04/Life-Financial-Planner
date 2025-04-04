import { useEffect } from 'react'
import axios from 'axios'
import { GoogleLogin } from '@react-oauth/google'
import { useNavigate } from 'react-router-dom'
import './Login.css'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL

const Login = () => {

    const navigate = useNavigate()

    useEffect(() => {
        //Check authorization
        axios.get(`${BACKEND_URL}/api/getuser`, {withCredentials: true})
          .then((response) => {
            if (response.data) {
                navigate("/dashboard")
            }
        })
    })

    return (
        <div id="login-page" className="page">
            <h1 id="title">Life Financial Planner</h1>
            <div id="login">
                <h3>Login</h3>
                <div id="google-login">
                        <GoogleLogin
                            shape='pill'
                            onSuccess={async (response) => {
                                await axios.post(`${BACKEND_URL}/api/login`, response, { withCredentials: true })
                                    .then((res) => {
                                        console.log(res)
                                        navigate("/dashboard")
                                    })
                                    .catch((error) => {
                                        console.log(error)
                                    })
                            }}
                            onError={() => {
                                console.log("Login Failed");
                            }}
                        />
                </div>
            </div>
        </div>
    )
}

export default Login