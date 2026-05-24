import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../App.css";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [cfData, setCfData] = useState(null);
  const [lcData, setLcData] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);

  const navigate = useNavigate();

  // ✅ STEP 1: Level function
  const getLevel = (score) => {
    if (score < 1000) return "🟢 Beginner";
    if (score < 2000) return "🟡 Intermediate";
    return "🔴 Advanced";
  };

  // 🔐 Fetch logged-in user
  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get("http://localhost:5000/me", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const currentUser = res.data;
      setUser(currentUser);

      // 🔥 Codeforces
      if (currentUser?.codeforcesUsername) {
        try {
          const cfRes = await axios.get(
            `http://localhost:5000/codeforces/${currentUser.codeforcesUsername}`
          );
          setCfData(cfRes.data);
        } catch {
          setCfData(null);
        }
      }

      // 💻 LeetCode
      if (currentUser?.leetcodeUsername) {
        try {
          const lcRes = await axios.get(
            `http://localhost:5000/leetcode/${currentUser.leetcodeUsername}`
          );
          setLcData(lcRes.data);
        } catch {
          setLcData(null);
        }
      }

    } catch (err) {
      console.log("User fetch error:", err);
    }
  };

  // 🏆 Leaderboard
  const fetchLeaderboard = async () => {
    try {
      const res = await axios.get("http://localhost:5000/users");
      const users = res.data;

      const delay = (ms) => new Promise(res => setTimeout(res, ms));

      const updatedUsers = [];

      for (let u of users) {
        let cfRating = 0;
        let lcScore = 0;

        // CF
        if (u.codeforcesUsername) {
          try {
            await delay(400);
            const cfRes = await axios.get(
              `http://localhost:5000/codeforces/${u.codeforcesUsername}`
            );
            cfRating = cfRes.data.rating || 0;
          } catch {
            cfRating = 0;
          }
        }

        // LC
        if (u.leetcodeUsername) {
          try {
            await delay(400);
            const lcRes = await axios.get(
              `http://localhost:5000/leetcode/${u.leetcodeUsername}`
            );
            // lcScore = lcRes.data.total || 0;
            lcScore = lcRes.data.rating || 0;
          } catch {
            lcScore = 0;
          }
        }

        const totalScore = cfRating + lcScore;

        updatedUsers.push({
          ...u,
          rating: totalScore,
          cfRating,
          lcScore
        });
      }

      const sorted = updatedUsers.sort((a, b) => b.rating - a.rating);
      setLeaderboard(sorted);

    } catch (err) {
      console.log("Leaderboard error:", err);
    }
  };

  useEffect(() => {
    fetchUser();
    fetchLeaderboard();
  }, []);

  // 🔓 Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="dashboard-container">
      <h1>🌌 CodeOrbit Dashboard</h1>

      {/* 👤 PROFILE */}
      {user ? (
        <div className="dashboard-card">
          <h2>👤 Profile</h2>
          <p><b>Name:</b> {user.name}</p>
          <p><b>Email:</b> {user.email}</p>
          <p><b>Codeforces:</b> {user.codeforcesUsername}</p>
          <p><b>LeetCode:</b> {user.leetcodeUsername}</p>

          <hr />

          {/* 📊 CF */}
          <h2>📊 Codeforces Stats</h2>
          {cfData ? (
            <div>
              <p>🔥 Rating: {cfData.rating}</p>
              <p>🏆 Rank: {cfData.rank}</p>
              <p>📈 Max Rating: {cfData.maxRating}</p>
            </div>
          ) : (
            <p>No CF data</p>
          )}

          {/* 💻 LC */}
          <h2>💻 LeetCode Stats</h2>
     {/* <h2>💻 LeetCode Stats</h2> */}
{lcData ? (
  <div>
    <p>🧩 Total: {lcData.total}</p>
    <p style={{ color: "#22c55e" }}>Easy: {lcData.easy}</p>
    <p style={{ color: "#facc15" }}>Medium: {lcData.medium}</p>
    <p style={{ color: "#ef4444" }}>Hard: {lcData.hard}</p>

    <hr />

    <p>🏆 Rating: {lcData.rating}</p>
    <p>📊 Contests: {lcData.contests}</p>
    <p>🌍 Global Rank: {lcData.globalRank}</p>
    <p>📉 Top %: {lcData.topPercentage}</p>
  </div>
) : (
  <p>No LeetCode data</p>
)}
        </div>
      ) : (
        <p>Loading user...</p>
      )}

      {/* ✅ STEP 2: Refresh Button */}
      <button onClick={fetchLeaderboard} className="refresh-btn">
        🔄 Refresh
      </button>

      {/* 🏆 LEADERBOARD */}
      <div className="leaderboard">
        <h2>🏆 Global Leaderboard</h2>

        {leaderboard.map((u, index) => (
          <div
            key={index}
            className={`leaderboard-item ${
              u.email === user?.email ? "current-user" : ""
            }`}
          >
            <div className="left">
              <span className="rank">
                {index === 0
                  ? "🥇"
                  : index === 1
                  ? "🥈"
                  : index === 2
                  ? "🥉"
                  : `#${index + 1}`}
              </span>

              <div className="avatar">
                {u.name?.charAt(0).toUpperCase()}
              </div>

              <span className="name">{u.name}</span>
            </div>

            {/* ✅ STEP 3: Level added */}
            <div className="right">
              <span className="cf">CF: {u.cfRating || 0}</span>
              <span className="lc">LC: {u.lcScore || 0}</span>
              <span className="level">{getLevel(u.rating)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* 🔘 ACTIONS */}
      <div className="dashboard-actions">
        <button onClick={() => navigate("/settings")}>
          ⚙ Settings
        </button>

        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}

export default Dashboard;