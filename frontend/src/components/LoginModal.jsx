import React, { useState, useEffect } from "react";
import "../styles/LoginModal.css";
import dumbbell from "../assets/dumbbell.png";
import { login, signup, forgotPassword, checkVerificationStatus } from "../api/auth";
import { useNavigate } from "react-router-dom";

const LoginModal = ({ onClose }) => {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [verifyMessage, setVerifyMessage] = useState("");
  const [loginError, setLoginError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    let countdown;
    if (loading && timer > 0) {
      countdown = setTimeout(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(countdown);
  }, [loading, timer]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const switchMode = (newMode) => {
    if (loading) return;
    setMode(newMode);
    setForm({ username: "", email: "", password: "" });
    setTimer(60);
    setVerifyMessage("");
    setLoginError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setTimer(60);
    setVerifyMessage("");
    setLoginError("");

    try {
      if (mode === "login") {
        const res = await login(form.email, form.password);
        localStorage.setItem("token", res.data.token);
        setLoading(false);
        navigate("/dashboard");
        onClose();
      } else if (mode === "signup") {
        await signup(form.username, form.email, form.password);

        let attempts = 0;
        const poll = setInterval(async () => {
          const { verified } = await checkVerificationStatus(form.email);
          if (verified) {
            clearInterval(poll);
            setLoading(false);
            setVerifyMessage("✅ Email verified! You can now log in.");
            setTimeout(() => switchMode("login"), 2000);
          } else if (++attempts >= 12) {
            clearInterval(poll);
            setLoading(false);
            setVerifyMessage("⏱️ Timeout. Email not verified. Please sign up again.");
          }
        }, 5000);
      } else if (mode === "reset") {
        await forgotPassword(form.email, form.password);

        let attempts = 0;
        const poll = setInterval(async () => {
          const { verified } = await checkVerificationStatus(form.email);
          if (verified) {
            clearInterval(poll);
            setLoading(false);
            setVerifyMessage("✅ Password reset successful! You can now log in.");
            setTimeout(() => switchMode("login"), 2000);
          } else if (++attempts >= 12) {
            clearInterval(poll);
            setLoading(false);
            setVerifyMessage("⏱️ Timeout. Please try reset again.");
          }
        }, 5000);
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
      const msg = err.response?.data?.error || "Something went wrong.";
      if (mode === "login") {
        setLoginError(msg);
      } else {
        setVerifyMessage(msg);
      }
    }
  };

  const renderSpinnerOrText = (text) =>
    loading ? (
      <div className="spinner-wrapper">
        <img src={dumbbell} alt="loading" className="spinner" />
      </div>
    ) : (
      text
    );

  const isDisabled = loading;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>×</button>

        {mode === "login" && (
          <>
            <h2>Sign In</h2>
            <form onSubmit={handleSubmit}>
              <input type="email" name="email" placeholder="Email" required onChange={handleChange} disabled={isDisabled} />
              <input type="password" name="password" placeholder="Password" required onChange={handleChange} disabled={isDisabled} />
              {loginError && <p className="verify-msg" style={{ color: "#e74c3c" }}>{loginError}</p>}
              <button type="submit" className="modal-button" disabled={isDisabled}>
                {renderSpinnerOrText("Login")}
              </button>
            </form>
            <p className={`link ${isDisabled ? "disabled-link" : ""}`} onClick={() => switchMode("signup")}>
              Don't have an account? <span>Sign Up</span>
            </p>
            <p className={`link ${isDisabled ? "disabled-link" : ""}`} onClick={() => switchMode("reset")}>
              Forgot Password?
            </p>
          </>
        )}

        {mode === "signup" && (
          <>
            <h2>Sign Up</h2>
            <form onSubmit={handleSubmit}>
              <input type="text" name="username" placeholder="Username" required onChange={handleChange} disabled={isDisabled} />
              <input type="email" name="email" placeholder="Email" required onChange={handleChange} disabled={isDisabled} />
              <input type="password" name="password" placeholder="Password" required onChange={handleChange} disabled={isDisabled} />
              {loading && !verifyMessage && <p className="verify-msg">Waiting for email verification ({timer}s)</p>}
              {verifyMessage && <p className="verify-msg">{verifyMessage}</p>}
              <button type="submit" className="modal-button" disabled={isDisabled}>
                {renderSpinnerOrText("Sign Up")}
              </button>
            </form>
            <p className={`link ${isDisabled ? "disabled-link" : ""}`} onClick={() => switchMode("login")}>
              Already have an account? <span>Login</span>
            </p>
          </>
        )}

        {mode === "reset" && (
          <>
            <h2>Reset Password</h2>
            <form onSubmit={handleSubmit}>
              <input type="email" name="email" placeholder="Email" required onChange={handleChange} disabled={isDisabled} />
              <input type="password" name="password" placeholder="New Password" required onChange={handleChange} disabled={isDisabled} />
              {loading && !verifyMessage && <p className="verify-msg">Waiting for reset confirmation ({timer}s)</p>}
              {verifyMessage && <p className="verify-msg">{verifyMessage}</p>}
              <button type="submit" className="modal-button" disabled={isDisabled}>
                {renderSpinnerOrText("Reset Password")}
              </button>
            </form>
            <p className={`link ${isDisabled ? "disabled-link" : ""}`} onClick={() => switchMode("login")}>
              Back to <span>Login</span>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default LoginModal;
