import React, { useState } from 'react';
import "./../styles/Settings.css";
import axiosInstance from "../api/axiosInstance";

const Settings = () => {
  const [username, setUsername] = useState('');
  const [usernameMessage, setUsernameMessage] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');

  const handleUsernameUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosInstance.patch('/auth/update-username', { username }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setUsernameMessage({ text: res.data.message, success: true });
    } catch (err) {
      setUsernameMessage({ text: err.response?.data?.error || '❌ Failed to update username', success: false });
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosInstance.patch('/auth/change-password', {
        currentPassword: oldPassword,
        newPassword,
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setPasswordMessage({ text: res.data.message, success: true });
    } catch (err) {
      setPasswordMessage({ text: err.response?.data?.error || '❌ Failed to change password', success: false });
    }
  };

  return (
    <div className="settings-wrapper">
      <h2 className="settings-title">Settings</h2>

      <div className="settings-card">
        <form className="settings-form" onSubmit={handleUsernameUpdate}>
          <h3>Update Username</h3>
          <input
            type="text"
            placeholder="Enter the new username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <button type="submit">Update Username</button>
          {usernameMessage && (
            <p className={`response-msg ${usernameMessage.success ? 'success' : 'error'}`}>
              {usernameMessage.text}
            </p>
          )}
        </form>
      </div>

      <div className="settings-card">
        <form className="settings-form" onSubmit={handlePasswordChange}>
          <h3>Change Password</h3>
          <input
            type="password"
            placeholder="Enter current password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <button type="submit">Change Password</button>
          {passwordMessage && (
            <p className={`response-msg ${passwordMessage.success ? 'success' : 'error'}`}>
              {passwordMessage.text}
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default Settings;
