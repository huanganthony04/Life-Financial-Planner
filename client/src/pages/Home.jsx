import { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL
const Home = () => {

    const [username, setUsername] = useState(null)

    const navigate = useNavigate()

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

    useEffect(() => {

        //Check authorization
        axios.get(`${BACKEND_URL}/api/getuser`, {withCredentials: true})
            .then((response) => {
                console.log(response.data)
                if (response.data.user) {
                    setUsername(response.data.user)
                }
            })


    }, [])

    return (
        <>
            <div>
                <h1>Home</h1>
                <h2>Logged in as {username ? username : "Guest"}</h2>
            </div>
            {username ?
                <a onClick={() => logout()}>logout</a>
                :
                <a onClick={() => navigate("/login")}>login</a>
            }
            <br/>
            <a onClick={() => navigate("/scenario")}>Scenario</a>

        </>
        )
    }

export default Home