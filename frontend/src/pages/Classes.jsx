import React, { useEffect, useState } from "react";
import "../styles/Classes.css";
import { FaPlus, FaSearch } from "react-icons/fa";
import axiosInstance from "../api/axiosInstance";

const Classes = () => {
  const [classes, setClasses] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [formVisible, setFormVisible] = useState(false);
  const [form, setForm] = useState({ title: "", schedule: "", end_time: "", trainer_id: "" });
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [trainers, setTrainers] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchClasses();
    fetchTrainers();
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await axiosInstance.get("/classes");
      setClasses(res.data);
      setFiltered(res.data);
    } catch (err) {
      console.error("Failed to fetch classes:", err);
    }
  };

  const fetchTrainers = async () => {
    try {
      const res = await axiosInstance.get("/trainers");
      setTrainers(res.data);
    } catch (err) {
      console.error("Failed to fetch trainers:", err);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    setFiltered(
      classes.filter((c) =>
        c.title.toLowerCase().includes(term)
      )
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axiosInstance.patch(`/classes/${editingId}`, form);
      } else {
        await axiosInstance.post("/classes", form);
      }
      fetchClasses();
      setForm({ title: "", schedule: "", end_time: "", trainer_id: "" });
      setEditingId(null);
      setFormVisible(false);
      setError(""); // Clear any previous error
    } catch (err) {
      if (err.response && err.response.status === 400 && err.response.data?.message) {
        setError(err.response.data.message); // Show backend error
      } else {
        console.error("Failed to save class:", err);
        setError("An unexpected error occurred.");
      }
    }
  };

  const handleEdit = (cls) => {
    setForm({
      title: cls.title,
      schedule: cls.schedule,
      end_time: cls.end_time,
      trainer_id: cls.trainer_id
    });
    setEditingId(cls.id);
    setFormVisible(true);
    setError(""); // clear previous error
  };

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/classes/${id}`);
      fetchClasses();
    } catch (err) {
      console.error("Failed to delete class:", err);
    }
  };

  return (
    <div className="classes-wrapper">
      <div className="classes-header">
        <div className="search-bar">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search classes..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        <button
          className="add-btn"
          onClick={() => {
            setEditingId(null);
            setForm({ title: "", schedule: "", end_time: "", trainer_id: "" });
            setFormVisible(!formVisible);
            setError(""); // clear error on open
          }}
        >
          <FaPlus /> Add Class
        </button>
      </div>

      {formVisible && (
        <form className="class-form-card" onSubmit={handleSubmit}>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Class Title"
            required
          />
          <input
            type="datetime-local"
            name="schedule"
            value={form.schedule}
            onChange={handleChange}
            required
          />
          <input
            type="datetime-local"
            name="end_time"
            value={form.end_time}
            onChange={handleChange}
            required
          />
          <select
            name="trainer_id"
            value={form.trainer_id}
            onChange={handleChange}
            required
          >
            <option value="">Select Trainer</option>
            {trainers.map((trainer) => (
              <option key={trainer.id} value={trainer.id}>{trainer.name}</option>
            ))}
          </select>
          {error && <p className="error-msg">{error}</p>}
          <button type="submit">{editingId ? "Update" : "Add"}</button>
        </form>
      )}

      <table className="classes-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Schedule</th>
            <th>End Time</th>
            <th>Trainer Name</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((cls) => (
            <tr key={cls.id}>
              <td>{cls.title}</td>
              <td>{new Date(cls.schedule).toLocaleString()}</td>
              <td>{new Date(cls.end_time).toLocaleString()}</td>
              <td>{cls.trainer_name}</td>
              <td>
                <div className="actions">
                  <button onClick={() => handleEdit(cls)} className="edit">Edit</button>
                  <button onClick={() => handleDelete(cls.id)} className="delete">Delete</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Classes;
