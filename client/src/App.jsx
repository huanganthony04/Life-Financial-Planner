import React from 'react'
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom'
import Navbar from './components/Navbar'
import Banner from './components/Banner'
import Home from './pages/Home'
import Login from './pages/Login'
import Scenario from './pages/Scenario'
import './App.css'

function Layout({page}) {
  return (
    <div id="main">
      <Navbar />
       <div id="page-content">
        <Banner page={page}/>
        <Outlet />
       </div>
    </div>
  )
}

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Layout page="Home"/>}>
            <Route index element={<Home />} />
          </Route>

          <Route path="/scenario" element={<Layout page="Scenario"/>}>
            <Route path="/scenario" element={<Scenario />} />
          </Route>

          <Route path="/login" element={<Login />} />
        </Routes>
      </Router>
    </>
  )
}

export default App
