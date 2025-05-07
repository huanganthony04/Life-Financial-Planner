import { useState, useEffect } from 'react'
import { Routes, Route, Outlet, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Banner from './components/Banner'
import Landing from './pages/Landing/Landing.jsx'
import Dashboard from './pages/Dashboard/Dashboard.jsx'
import Login from './pages/Login/Login.jsx'
import Scenario from './pages/Scenarios/Scenario.jsx'
import Editor from './pages/Editor/Editor.jsx'
import Results from './pages/Results/Results.jsx'
import ScenarioDetailPage from './pages/Scenarios/Detail/ScenarioDetailPage.jsx'
import axios from 'axios'
import './App.css'
import UserProfile from '/src/components/UserProfile'
import SharedScenario from './pages/Scenarios/sharedScenario.jsx'

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
        <Route path="/scenario" element={<Layout page="Scenario" user={user}/>}>
          <Route path="/scenario" element={<Scenario user={user}/>}/>
        </Route>

        <Route path="/scenario/detail" element={<Layout page="Scenario Detail" user={user}/>}>
          <Route index element={<ScenarioDetailPage />} />
        </Route>

        <Route path="/scenario/edit" element={<Editor user={user}/>}/>

        <Route path="/login" element={<Login user={user}/>} />
        <Route path="/" element={<Landing user={user}/>} />

        <Route path="/results" element={<Layout page="Results" user={user}/>}>
          <Route path="/results" element={<Results user={user}/>}/>
        </Route>

        <Route path="/sharedScenario" element={<Layout page="Shared with you " user={user}/>}>
          <Route index element={<SharedScenario user={user}/>} />
        </Route>

        {/* Uncomment this when the UserProfile page is ready}
        <Route path="/userprofile" element={<Layout page="userProfile" user={user}/>} >
        <Route path="/userprofile" element={<UserProfile user={user}/>}/>
        </Route>
        */}

      </Routes>
    </>
  )
}

export default App
