import { useState, useEffect } from 'react'
import { Routes, Route, Outlet, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Banner from './components/Banner'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Scenario from './pages/Scenario'
import Editor from './pages/Editor'
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
  const [user, setUser] = useState()
  const location = useLocation()

  useEffect(() => {
    //Check authorization
    axios.get(`${BACKEND_URL}/api/getuser`, {withCredentials: true})
      .then((response) => {
        setUser(response.data)
      })
  }, [location])

  return (
    <>
      <Routes>
        <Route path="/dashboard" element={<Layout page="Dashboard" user={user}/>}>
          <Route index element={<Dashboard user={user}/>} />
        </Route>

        <Route path="/scenario" element={<Layout page="Scenario" user={user}/>}>
          <Route path="/scenario" element={<Scenario user={user}/>}/>
        </Route>

        <Route path="/scenario/edit" element={<Editor user={user}/>}/>

        <Route path="/login" element={<Login user={user}/>} />
        <Route path="/" element={<Landing user={user}/>} />
      </Routes>
    </>
  )
}

export default App
