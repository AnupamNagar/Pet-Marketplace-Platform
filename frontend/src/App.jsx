import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AuthService from "./services/auth.service";

import Navbar from "./components/Navbar";
import Login from "./components/Login";
import Register from "./components/Register";
import PetDashboard from "./components/PetDashboard";
import PetDetails from "./components/PetDetails";
import CreatePetListing from "./components/CreatePetListing";

const Home = () => {
  return <Navigate to="/pets" />;
};

const Profile = ({ currentUser }) => (
  <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-sm border">
    <h2 className="text-2xl font-bold mb-4">Profile Dashboard</h2>
    <div className="space-y-3">
      <p><strong>Username:</strong> {currentUser?.username}</p>
      <p><strong>Email:</strong> {currentUser?.email}</p>
      <p><strong>Role:</strong> {currentUser?.roles && currentUser.roles.join(', ')}</p>
    </div>
  </div>
);

function App() {
  const [currentUser, setCurrentUser] = useState(undefined);

  useEffect(() => {
    const user = AuthService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900 antialiased">
        <Navbar currentUser={currentUser} />

        <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/pets" element={<PetDashboard />} />
            <Route 
              path="/pets/create" 
              element={currentUser && (currentUser.roles.includes("ROLE_SELLER") || currentUser.roles.includes("ROLE_ADMIN")) ? <CreatePetListing /> : <Navigate to="/login" />} 
            />
            <Route path="/pets/:id" element={<PetDetails />} />
            <Route path="/login" element={<Login setAuth={setCurrentUser} />} />
            <Route path="/register" element={<Register />} />
            <Route 
              path="/profile" 
              element={currentUser ? <Profile currentUser={currentUser} /> : <Navigate to="/login" />} 
            />
          </Routes>
        </main>
        
        <footer className="bg-white border-t mt-auto py-6">
          <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
            &copy; 2026 PetVerse Marketplace. All rights reserved.
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
