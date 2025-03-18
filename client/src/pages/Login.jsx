import React from 'react'
import axios from 'axios'
import { GoogleLogin } from '@react-oauth/google'
import { useNavigate } from 'react-router-dom'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL

const Login = () => {

    const navigate = useNavigate()

    return (
        <>
            <div>Login</div>
            <div id="google_login">
                <h2>Sign in with Google</h2>
                    <GoogleLogin
                        onSuccess={async (response) => {
                            await axios.post(`${BACKEND_URL}/api/login`, response, { withCredentials: true })
                                .then((res) => {
                                    console.log(res)
                                    navigate("/")
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
        </>
    )
}

export default Login