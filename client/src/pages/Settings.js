import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../App.css";

function Settings() {
  const [form, setForm] = useState({
    name: "",
    codeforcesUsername: "",
    leetcodeUsername: "",
    password: ""
  });

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // 🔥 Fetch current user (PRE-FILL)
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get("http://localhost:5000/me", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const user = res.data;

        setForm({
          name: user.name || "",
          codeforcesUsername: user.codeforcesUsername || "",
          leetcodeUsername: user.leetcodeUsername || "",
          password: "" // never prefill password
        });

      } catch (err) {
        console.log(err);
      }
    };

    fetchUser();
  }, []);

  // ✏️ Handle change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 🧠 VALIDATION
  const validate = () => {
    if (!form.name.trim()) {
      alert("Name is required");
      return false;
    }

    if (
      form.codeforcesUsername &&
      form.codeforcesUsername.length < 2
    ) {
      alert("Invalid Codeforces username");
      return false;
    }

    if (
      form.leetcodeUsername &&
      form.leetcodeUsername.length < 2
    ) {
      alert("Invalid LeetCode username");
      return false;
    }

    if (form.password && form.password.length < 6) {
      alert("Password must be at least 6 characters");
      return false;
    }

    return true;
  };

  // 💾 Update
  const handleUpdate = async () => {
    if (!validate()) return;

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      // 🧠 send only non-empty fields
      const updateData = {};
      if (form.name) updateData.name = form.name;
      if (form.codeforcesUsername)
        updateData.codeforcesUsername = form.codeforcesUsername;
      if (form.leetcodeUsername)
        updateData.leetcodeUsername = form.leetcodeUsername;
      if (form.password) updateData.password = form.password;

      await axios.put(
        "http://localhost:5000/update-user",
        updateData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      alert("Profile updated ✅");
      navigate("/dashboard");

    } catch (err) {
      console.log(err);
      alert("Update failed ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="settings-container">
      <div className="settings-card">
        <h2>⚙ Profile Settings</h2>
        <p className="subtitle">Edit your profile details</p>

        {/* 👤 NAME */}
        <input
          name="name"
          value={form.name}
          placeholder="Your Name"
          onChange={handleChange}
        />

        {/* CF */}
        <input
          name="codeforcesUsername"
          value={form.codeforcesUsername}
          placeholder="Codeforces Username"
          onChange={handleChange}
        />

        {/* LC */}
        <input
          name="leetcodeUsername"
          value={form.leetcodeUsername}
          placeholder="LeetCode Username"
          onChange={handleChange}
        />

        {/* PASSWORD */}
        <input
          type="password"
          name="password"
          value={form.password}
          placeholder="New Password (optional)"
          onChange={handleChange}
        />

        <button onClick={handleUpdate} disabled={loading}>
          {loading ? "Saving..." : "Save Changes"}
        </button>

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