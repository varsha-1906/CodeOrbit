import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../App.css";

function Signup() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    leetcodeUsername: "",
    codeforcesUsername: ""
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSignup = async () => {
    try {
      await axios.post("http://localhost:5000/signup", form);

      alert("Signup successful ✅");
      navigate("/");
    } catch (err) {
      console.log(err);
      alert("Signup failed ❌");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>📝 Create Account</h2>
        <p className="subtitle">Join CodeOrbit 🚀</p>

        <input
          name="name"
          placeholder="Full Name"
          onChange={handleChange}
        />

        <input
          name="email"
          placeholder="Email"
          onChange={handleChange}
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
        />

        <input
          name="leetcodeUsername"
          placeholder="LeetCode Username"
          onChange={handleChange}
        />

        <input
          name="codeforcesUsername"
          placeholder="Codeforces Username"
          onChange={handleChange}
        />

        <button onClick={handleSignup}>Signup</button>

        <p className="link-text">
          Already have an account?{" "}
          <span onClick={() => navigate("/")}>
            Login
          </span>
        </p>
      </div>
    </div>
  );
}

export default Signup;