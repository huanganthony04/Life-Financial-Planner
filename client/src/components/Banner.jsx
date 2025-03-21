import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import './Banner.css'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL

const Banner = ({page, user}) => {

    const username = user ? user.email : "Guest"

    const navigate = useNavigate()

    const logout = async () => {
        if (username === "Guest") {
            console.log('Not logged in')
            return
        }
        else {
            await axios.post(`${BACKEND_URL}/api/logout`, {}, {withCredentials: true})

            navigate('/')
        }
    }

    const renderLoginLogout = () => {
        if (username === "Guest") {
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