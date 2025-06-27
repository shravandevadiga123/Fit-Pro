import React from "react";
import "../styles/DashboardHome.css";

const DashboardHome = () => {
  return (
    <div className="dashboard-home">
      <div className="welcome-card">
        <h1>Welcome to <span>FitPro Manager</span> 💪</h1>
        <p>Your one-stop solution to manage members, trainers, classes, and more.</p>
        <div className="tagline">Stay fit, stay organized!</div>
      </div>
    </div>
  );
};

export default DashboardHome;
