import React, { useState, useEffect } from "react";
import "./../styles/Trainers.css";
import { FaPlus, FaSearch } from "react-icons/fa";
import axiosInstance from "../api/axiosInstance";

const Trainers = () => {
  const [trainers, setTrainers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [formVisible, setFormVisible] = useState(false);
  const [form, setForm] = useState({
    name: "",
    specialty: "",
    phone: "",
    email: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchTrainers();
  }, []);

  const fetchTrainers = async () => {
    try {
      const res = await axiosInstance.get("/trainers");
      setTrainers(res.data);
      setFiltered(res.data);
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
      trainers.filter(
        (t) =>
          t.name.toLowerCase().includes(term) ||
          t.specialty.toLowerCase().includes(term) ||
          t.phone.toLowerCase().includes(term) ||
          t.email.toLowerCase().includes(term)
      )
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axiosInstance.patch(`/trainers/${editingId}`, form);
      } else {
        await axiosInstance.post("/trainers", form);
      }
      fetchTrainers();
      setForm({
        name: "",
        specialty: "",
        phone: "",
        email: "",
      });
      setEditingId(null);
      setFormVisible(false);
    } catch (err) {
      console.error("Failed to save trainer:", err);
    }
  };

  const handleEdit = (trainer) => {
    setForm(trainer);
    setEditingId(trainer.id);
    setFormVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/trainers/${id}`);
      fetchTrainers();
    } catch (err) {
      console.error("Failed to delete trainer:", err);
    }
  };

  return (
    <div className="trainers-wrapper">
      <div className="trainers-header">
        <div className="search-bar">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search trainers..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        <button
          className="add-btn"
          onClick={() => {
            setEditingId(null);
            setForm({
              name: "",
              specialty: "",
              phone: "",
              email: "",
            });
            setFormVisible(!formVisible);
          }}
        >
          <FaPlus /> Add Trainer
        </button>
      </div>

      {formVisible && (
        <form className="trainer-form-card" onSubmit={handleSubmit}>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Name"
            required
          />
          <input
            name="specialty"
            value={form.specialty}
            onChange={handleChange}
            placeholder="Specialty"
            required
          />
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="Phone"
            required
          />
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            required
          />
          <button type="submit">{editingId ? "Update" : "Add"}</button>
        </form>
      )}

      <table className="trainers-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Specialty</th>
            <th>Phone</th>
            <th>Email</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((t) => (
            <tr key={t.id}>
              <td>{t.name}</td>
              <td>{t.specialty}</td>
              <td>{t.phone}</td>
              <td>{t.email}</td>
              <td>
                <div className="actions">
                  <button onClick={() => handleEdit(t)} className="edit">
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(t.id)}
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

export default Trainers;
