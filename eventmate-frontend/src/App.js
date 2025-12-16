import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import EventDetails from './pages/EventDetails';
import Booking from './pages/Booking';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import CreateEvent from './pages/CreateEvent';
import ManageLayouts from './pages/ManageLayouts';
import CreateSeatingLayout from './pages/CreateSeatingLayout';
import ProtectedRoute from './components/ProtectedRoute';
import ChatInterface from './components/ChatInterface';
import { Toaster } from 'react-hot-toast';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/event/:id" element={<EventDetails />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/booking/:eventId" element={<Booking />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/create-event" element={<CreateEvent />} />
            <Route path="/admin/edit-event/:id" element={<CreateEvent />} />
            <Route path="/admin/layouts" element={<ManageLayouts />} />
            <Route path="/admin/create-layout" element={<CreateSeatingLayout />} />
          </Route>

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        <ChatInterface />
        <Toaster position="bottom-right" toastOptions={{
          style: {
            background: '#333',
            color: '#fff',
          },
        }} />
      </div>
    </Router>
  );
}

export default App;
