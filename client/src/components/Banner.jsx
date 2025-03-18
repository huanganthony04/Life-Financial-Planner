import { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import './Banner.css'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL

const Banner = ({page}) => {

    const [username, setUsername] = useState(null)

    const navigate = useNavigate()

    useEffect(() => {

        //Check authorization
        axios.get(`${BACKEND_URL}/api/getuser`, {withCredentials: true})
            .then((response) => {
                if (response.data.user) {
                    setUsername(response.data.user)
                }
            })


    }, [])

    const logout = async function() {
        if (!username) {
            console.log('Not logged in')
        }
        else {
            await axios.post(`${BACKEND_URL}/api/logout`, {}, {withCredentials: true})
                .then((response) => {
                    console.log(response)
                    navigate("/login")
                })
        }
    }

    const renderLoginLogout = () => {
        if (!username) {
            return (
                <button id="sign-up-button" onClick={() => navigate("/login")}>
                    <h4 id="sign-up-button-label">Sign Up</h4>
                </button>
            )
        }
        else {
            return (
                <button id="sign-up-button" onClick={() => logout()}>
                    <h4 id="sign-up-button-label">Log Out</h4>
                </button>
            )
        }
    }


    return (
        <div id="banner">
            <h3 id="banner-text">{page}</h3>
            <div id="user-opts">
                <h4 id="user-login-text">Logged in as {username ? username : "Guest"}</h4>
                {renderLoginLogout()}
            </div>
        </div>
    )
}

export default Banner