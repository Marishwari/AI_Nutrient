// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import PostPage from "./components/PostPage";
// Import your pages
import Login from "./components/Login";
import Register from "./components/Register";
import ResetPassword from "./components/ResetPassword";
// protected page after login

// Simulate auth state (replace with Redux or Context later)
const isAuthenticated = () => {
  return localStorage.getItem("token") ? true : false;
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Routes>
          {/* Default route */}
          <Route path="/" element={<Navigate to="/login" />} />
             <Route path="/post" element={<PostPage />} />
          {/* Auth routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset-password" element={<ResetPassword />} />

      

          {/* Catch all */}
          <Route path="*" element={<h1 className="text-center text-red-500">404 - Page Not Found</h1>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
