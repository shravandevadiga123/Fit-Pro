import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

// Check if user is verified (used after signup or reset)
export const checkVerificationStatus = async (email) => {
  const response = await axios.get(`${API_URL}/is-verified?email=${email}`);
  return response.data; // returns { verified: true/false }
};

// Login request
export const login = async (email, password) => {
  return await axios.post(`${API_URL}/login`, { email, password });
};

// Signup request
export const signup = async (username, email, password) => {
  return await axios.post(`${API_URL}/signup`, { username, email, password });
};

// Request password reset
export const forgotPassword = async (email, password) => {
  return await axios.post(`${API_URL}/request-reset`, { email, password });
};
