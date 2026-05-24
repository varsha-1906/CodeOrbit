import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../App.css";

function Settings() {
  const [form, setForm] = useState({
    codeforcesUsername: "",
    leetcodeUsername: "",
    password: ""
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem("token");

      await axios.put("http://localhost:5000/update-user", form, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      alert("Profile updated ✅");
      navigate("/dashboard"); // 👉 go back after update
    } catch (err) {
      console.log(err);
      alert("Update failed ❌");
    }
  };

  return (
    <div className="settings-container">
      <div className="settings-card">
        <h2>⚙ Profile Settings</h2>
        <p className="subtitle">Update your coding profiles</p>

        <input
          name="codeforcesUsername"
          placeholder="Codeforces Username"
          onChange={handleChange}
        />

        <input
          name="leetcodeUsername"
          placeholder="LeetCode Username"
          onChange={handleChange}
        />

        <input
          type="password"
          name="password"
          placeholder="New Password"
          onChange={handleChange}
        />

        <button onClick={handleUpdate}>Save Changes</button>

        <button
          className="back-btn"
          onClick={() => navigate("/dashboard")}
        >
          ⬅ Back
        </button>
      </div>
    </div>
  );
}

export default Settings;