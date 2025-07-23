import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProtectedRoute from "./components/common/ProtectedRoute";
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import DashboardHome from './pages/DashboardHome';
import Members from './pages/Members';
import Trainers from './pages/Trainers';
import Classes from './pages/Classes';
import Attendance from './pages/Attendance'; // ✅ New import
import "./styles/theme.css";
import Settings from './pages/Settings';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />}>
            <Route index element={<DashboardHome />} />
            <Route path="members" element={<Members />} />
            <Route path="trainers" element={<Trainers />} />
            <Route path="classes" element={<Classes />} />
            <Route path="attendance" element={<Attendance />} /> {/* ✅ New route */}
            <Route path="settings" element={<Settings />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
