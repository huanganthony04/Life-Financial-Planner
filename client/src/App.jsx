import { useState, useEffect } from 'react'
import { Routes, Route, Outlet, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Banner from './components/Banner'
import Home from './pages/Home'
import Login from './pages/Login'
import Scenario from './pages/Scenario'
import axios from 'axios'
import './App.css'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL

function Layout({page, user}) {
  return (
    <div id="main">
      <Navbar />
       <div id="page-content">
        <Banner page={page} user={user}/>
        <Outlet />
       </div>
    </div>
  )
}

function App() {
  const [user, setUser] = useState(null)
  const location = useLocation()

  useEffect(() => {
    //Check authorization
    axios.get(`${BACKEND_URL}/api/getuser`, {withCredentials: true})
      .then((response) => {
        if (response.data.userId) {
          setUser(response.data)
        }
        else {
          setUser(null)
        }
      })
  }, [location])

  return (
    <>
      <Routes>
        <Route path="/" element={<Layout page="Home" user={user}/>}>
          <Route index element={<Home user={user}/>} />
        </Route>

        <Route path="/scenario" element={<Layout page="Scenario" user={user}/>}>
          <Route path="/scenario" element={<Scenario user={user}/>} />
        </Route>

        <Route path="/login" element={<Login user={user}/>} />
      </Routes>
    </>
  )
}

export default App
