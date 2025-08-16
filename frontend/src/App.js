import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import LoginSignupPage from './components/LoginSignupPage';
import AboutPage from './components/AboutPage';
import Logout from './components/Logout';
import HomePage from './components/HomePage';
import ProtectedRoute from './components/ProtectedRoute'; // A higher-order component to protect routes
import MngFamily from './components/MngFamily';
import SharedStorage from './components/storage/SharedStorage';
import PlanList from './components/plan/PlanList';
import VaultDashboard from './components/medical/VaultDashboard';


function App() {
  const user = JSON.parse(localStorage.getItem('user'));
  return (
    
    <BrowserRouter>
        <div className="container mx-auto min-w-[100%] min-h-[10%] flex justify-between items-center bg-gradient-to-r from-purple-600 to-orange-400 text-white">
        <div className="flex items-center ">
          <img
            src="LifeSync.png"
            alt="LifeSync Logo"
            className="h-10 w-auto mr-4"
          />
          <h1 className="text-lg font-semibold">LifeSync</h1>
        </div>
        </div>
      <Routes>
        <Route path="/login" element={<LoginSignupPage />} />
        <Route path="/signup" element={<LoginSignupPage />} />
        <Route path="/logout" element={<Logout />} />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <HomePage user={user} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manage-family"
          element={
            <ProtectedRoute>
              <MngFamily user={user} />
            </ProtectedRoute>
          }></Route>
          <Route
          path="/shared-storage"
          element={
            <ProtectedRoute>
              <SharedStorage user={user} />
            </ProtectedRoute>
          }></Route>
          <Route
          path="/plan-list"
          element={
            <ProtectedRoute>
              <PlanList user={user} />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/vault" 
          element={
            <ProtectedRoute>
              <VaultDashboard user={user} />
            </ProtectedRoute>
            
          } />

        <Route path="/about" element={<AboutPage />} />
        <Route path="/" element={<LoginSignupPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
