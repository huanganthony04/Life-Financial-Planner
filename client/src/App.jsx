import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Scenario from './pages/Scenario'
import './App.css'

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/scenario" element={<Scenario />} />
        </Routes>
      </Router>
    </>
  )
}

export default App
