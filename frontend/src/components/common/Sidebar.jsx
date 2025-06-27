import React from "react";
import { NavLink } from "react-router-dom";
import {
  FaUsers,
  FaChalkboardTeacher,
  FaCalendarAlt,
  FaCheckCircle,
  FaCog,
} from "react-icons/fa";
import "../../styles/Sidebar.css";

const Sidebar = () => {
  const links = [
    { to: "/dashboard/members", label: "Members", icon: <FaUsers /> },
    { to: "/dashboard/trainers", label: "Trainers", icon: <FaChalkboardTeacher /> },
    { to: "/dashboard/classes", label: "Classes", icon: <FaCalendarAlt /> },
    { to: "/dashboard/attendance", label: "Attendance", icon: <FaCheckCircle /> },
    { to: "/dashboard/settings", label: "Settings", icon: <FaCog /> },
  ];

  return (
    <div className="sidebar">
      <nav>
        {links.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            {icon}
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
