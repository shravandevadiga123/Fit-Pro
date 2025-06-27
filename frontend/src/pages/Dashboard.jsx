import React from "react";
import Navbar from "../components/common/Navbar";
import Sidebar from "../components/common/Sidebar";
import { Outlet } from "react-router-dom";
import "../styles/Dashboard.css";

const Dashboard = () => {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-content">
        <div className="navbar">
          <Navbar />
        </div>
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
