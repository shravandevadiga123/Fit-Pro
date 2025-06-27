import React, { useState, useEffect } from "react";
import "./../styles/Members.css";
import { FaPlus, FaSearch } from "react-icons/fa";
import axiosInstance from "../api/axiosInstance";

const Members = () => {
  const [members, setMembers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [formVisible, setFormVisible] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    age: "",
    gender: "",
    address: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const res = await axiosInstance.get("/members");
      setMembers(res.data);
      setFiltered(res.data);
    } catch (err) {
      console.error("Failed to fetch members:", err);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    setFiltered(
      members.filter(
        (m) =>
          m.name.toLowerCase().includes(term) ||
          m.email.toLowerCase().includes(term) ||
          m.phone.toLowerCase().includes(term)
      )
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axiosInstance.patch(`/members/${editingId}`, form);
      } else {
        await axiosInstance.post("/members", form);
      }
      fetchMembers();
      setForm({
        name: "",
        email: "",
        phone: "",
        age: "",
        gender: "",
        address: "",
      });
      setEditingId(null);
      setFormVisible(false);
    } catch (err) {
      console.error("Failed to save member:", err);
    }
  };

  const handleEdit = (member) => {
    setForm(member);
    setEditingId(member.id);
    setFormVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      const memberName = members.find((m) => m.id === id)?.name || "";
      await axiosInstance.delete(`/members/${id}`, {
        data: { name: memberName },
      });
      fetchMembers();
    } catch (err) {
      console.error("Failed to delete member:", err);
    }
  };

  return (
    <div className="members-wrapper">
      <div className="members-header">
        <div className="search-bar">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search members..."
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
              email: "",
              phone: "",
              age: "",
              gender: "",
              address: "",
            });
            setFormVisible(!formVisible);
          }}
        >
          <FaPlus /> Add Member
        </button>
      </div>

      {formVisible && (
        <form className="member-form-card" onSubmit={handleSubmit}>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Name"
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
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="Phone"
            required
          />
          <input
            name="age"
            type="number"
            value={form.age}
            onChange={handleChange}
            placeholder="Age"
            required
          />
          <select
            name="gender"
            value={form.gender}
            onChange={handleChange}
            required
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
          <input
            name="address"
            value={form.address}
            onChange={handleChange}
            placeholder="Address"
            required
          />
          <button type="submit">{editingId ? "Update" : "Add"}</button>
        </form>
      )}

      <table className="members-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Age</th>
            <th>Gender</th>
            <th>Address</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((m) => (
            <tr key={m.id}>
              <td>{m.name}</td>
              <td>{m.email}</td>
              <td>{m.phone}</td>
              <td>{m.age}</td>
              <td>{m.gender}</td>
              <td>{m.address}</td>
              <td>
                <div className="actions">
                  <button onClick={() => handleEdit(m)} className="edit">
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(m.id)}
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

export default Members;
