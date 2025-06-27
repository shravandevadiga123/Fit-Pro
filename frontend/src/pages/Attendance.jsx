import React, { useEffect, useState } from "react";
import "../styles/Attendance.css"; // 👈 Updated CSS file
import { FaPlus, FaSearch } from "react-icons/fa";
import axiosInstance from "../api/axiosInstance";

const Attendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [formVisible, setFormVisible] = useState(false);
  const [form, setForm] = useState({ member_id: "", class_id: "" });
  const [members, setMembers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAttendance();
    fetchMembers();
    fetchClasses();
  }, []);

  const fetchAttendance = async () => {
    try {
      const res = await axiosInstance.get("/attendance");
      setAttendance(res.data);
      setFiltered(res.data);
    } catch (err) {
      console.error("Failed to fetch attendance:", err);
    }
  };

  const fetchMembers = async () => {
    try {
      const res = await axiosInstance.get("/members");
      setMembers(res.data);
    } catch (err) {
      console.error("Failed to fetch members:", err);
    }
  };

  const fetchClasses = async () => {
    try {
      const res = await axiosInstance.get("/classes");
      setClasses(res.data);
    } catch (err) {
      console.error("Failed to fetch classes:", err);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    setFiltered(
      attendance.filter(
        (a) =>
          a.member_name.toLowerCase().includes(term) ||
          a.class_title.toLowerCase().includes(term)
      )
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post("/attendance", form);
      fetchAttendance();
      setForm({ member_id: "", class_id: "" });
      setFormVisible(false);
      setError("");
    } catch (err) {
      if (err.response && err.response.data?.error) {
        setError(err.response.data.error);
      } else {
        setError("An unexpected error occurred.");
        console.error("Attendance error:", err);
      }
    }
  };

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/attendance/${id}`);
      fetchAttendance();
    } catch (err) {
      console.error("Failed to delete attendance:", err);
    }
  };

  return (
    <div className="classes-wrapper">
      <div className="classes-header">
        <div className="search-bar">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search attendance..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        <button
          className="add-btn"
          onClick={() => {
            setFormVisible(!formVisible);
            setError("");
            setForm({ member_id: "", class_id: "" });
          }}
        >
          <FaPlus /> Mark Attendance
        </button>
      </div>

      {formVisible && (
        <form className="class-form-card" onSubmit={handleSubmit}>
          <select
            name="member_id"
            value={form.member_id}
            onChange={handleChange}
            required
          >
            <option value="">Select Member</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>

          <select
            name="class_id"
            value={form.class_id}
            onChange={handleChange}
            required
          >
            <option value="">Select Class</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>

          {error && <p className="error-msg">{error}</p>}
          <button type="submit">Submit</button>
        </form>
      )}

      <table className="classes-table">
        <thead>
          <tr>
            <th>Member Name</th>
            <th>Class Title</th>
            <th>Attended On</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((a) => (
            <tr key={a.id}>
              <td>{a.member_name}</td>
              <td>{a.class_title}</td>
              <td>{new Date(a.attended_on).toLocaleString()}</td>
              <td>
                <div className="actions">
                  <button
                    onClick={() => handleDelete(a.id)}
                    className="delete"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Attendance;
