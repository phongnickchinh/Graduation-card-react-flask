import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import GuestPage from './pages/GuestPage';
// import Dashboard from './pages/Dashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        {/* <Route path="/" element={<Dashboard />} /> */}
        <Route path="/invitation/:nickname" element={<GuestPage />} />
        {/* Thêm các route khác tại đây */}
      </Routes>
    </Router>
  );
}

export default App
