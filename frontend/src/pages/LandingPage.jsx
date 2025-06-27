import React, { useState } from "react";
import "./../styles/LandingPage.css";
import logo from "../assets/fitpro-logo.png";
import LoginModal from "../components/LoginModal"; // Make sure it's created

const LandingPage = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className={`landing-container ${showModal ? "blurred" : ""}`}>
        <div className="landing-left">
          <h1>Ready to Level Up Your Fitness Journey?</h1>
          <p>
            FitPro Manager helps you track members, trainers, classes, and
            attendance—all in one place. Smart, simple, and built for your gym.
          </p>
          <button className="start-button" onClick={() => setShowModal(true)}>
            Get Started
          </button>
        </div>
        <div className="landing-right">
          <img src={logo} alt="FitPro Logo" className="fitpro-logo" />
          <h3>Fitness Management Made Simple</h3>
        </div>
      </div>

      {showModal && <LoginModal onClose={() => setShowModal(false)} />}
    </>
  );
};

export default LandingPage;
