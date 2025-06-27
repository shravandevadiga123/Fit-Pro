import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import avatar from "../../assets/avatar.png";
import logo from "../../assets/fitpro-navbar.png";
import "../../styles/Navbar.css";

const Navbar = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const name = payload?.username || payload?.email?.split("@")[0] || "Admin";
        setUsername(name.charAt(0).toUpperCase() + name.slice(1));
      } catch {
        setUsername("Admin");
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <nav className="navbar">
      <img src={logo} alt="FitPro Logo" className="navbar-logo-img" />
      <div className="navbar-avatar-wrapper">
        <img
          src={avatar}
          alt="Avatar"
          className="navbar-avatar"
          onClick={() => setShowDropdown(!showDropdown)}
        />
        {showDropdown && (
          <div className="navbar-dropdown">
            <p className="username">Hi, <strong>{username}</strong></p>
            <button className="logout-button" onClick={handleLogout}>
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
