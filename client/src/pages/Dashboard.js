import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../App.css";

// ✅ CHART IMPORTS
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

function Dashboard() {
  const [user, setUser] = useState(null);
  const [cfData, setCfData] = useState(null);
  const [lcData, setLcData] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);

  const [search, setSearch] = useState("");
  const [sortType, setSortType] = useState("total");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const getLevel = (score) => {
    if (score < 1000) return "🟢 Beginner";
    if (score < 2000) return "🟡 Intermediate";
    return "🔴 Advanced";
  };

  // 🔐 Fetch user
  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get("http://localhost:5000/me", {
        headers: { Authorization: `Bearer ${token}` }
      });

      const currentUser = res.data;
      setUser(currentUser);

      if (currentUser?.codeforcesUsername) {
        const cfRes = await axios.get(
          `http://localhost:5000/codeforces/${currentUser.codeforcesUsername}`
        );
        setCfData(cfRes.data);
      }

      if (currentUser?.leetcodeUsername) {
        const lcRes = await axios.get(
          `http://localhost:5000/leetcode/${currentUser.leetcodeUsername}`
        );
        setLcData(lcRes.data);
      }

    } catch (err) {
      console.log(err);
    }
  };

  // 🏆 Leaderboard
  const fetchLeaderboard = async () => {
    try {
      setLoading(true);

      const res = await axios.get("http://localhost:5000/users");
      const users = res.data;

      const updatedUsers = await Promise.all(
        users.map(async (u) => {
          let cfRating = 0;
          let lcScore = 0;

          if (u.codeforcesUsername) {
            try {
              const cfRes = await axios.get(
                `http://localhost:5000/codeforces/${u.codeforcesUsername}`
              );
              cfRating = cfRes.data.rating || 0;
            } catch {}
          }

          if (u.leetcodeUsername) {
            try {
              const lcRes = await axios.get(
                `http://localhost:5000/leetcode/${u.leetcodeUsername}`
              );
              lcScore = lcRes.data.rating || 0;
            } catch {}
          }

          return {
            ...u,
            rating: cfRating + lcScore,
            cfRating,
            lcScore
          };
        })
      );

      setLeaderboard(updatedUsers);
      setLoading(false);

    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
    fetchLeaderboard();
  }, []);

  // 🧠 Chart Data (NEW)
  const pieData = {
    labels: ["Easy", "Medium", "Hard"],
    datasets: [
      {
        data: [
          lcData?.easy || 0,
          lcData?.medium || 0,
          lcData?.hard || 0
        ],
        backgroundColor: ["#22c55e", "#facc15", "#ef4444"],
        borderWidth: 1
      }
    ]
  };

  // 🧠 Sort + Search
  const filteredUsers = leaderboard
    .filter((u) =>
      u.name.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortType === "cf") return b.cfRating - a.cfRating;
      if (sortType === "lc") return b.lcScore - a.lcScore;
      return b.rating - a.rating;
    });

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="dashboard-container">
      <h1>🌌 CodeOrbit Dashboard</h1>

      {/* ⚠️ Profile Warning */}
      {user && (!user.codeforcesUsername || !user.leetcodeUsername) && (
        <p style={{ color: "orange", textAlign: "center" }}>
          ⚠️ Complete your profile in settings
        </p>
      )}

      {/* 👤 PROFILE */}
      {user ? (
        <div className="dashboard-card">
          <h2>👤 Profile</h2>
          <p><b>Name:</b> {user.name}</p>
          <p><b>Email:</b> {user.email}</p>
          <p><b>Codeforces:</b> {user.codeforcesUsername}</p>
          <p><b>LeetCode:</b> {user.leetcodeUsername}</p>

          <hr />

          {/* CF */}
          <h2>📊 Codeforces Stats</h2>
          {cfData ? (
            <div>
              <p>🔥 Rating: {cfData.rating}</p>
              <p>🏆 Rank: {cfData.rank}</p>
              <p>📈 Max Rating: {cfData.maxRating}</p>
            </div>
          ) : <p>No CF data</p>}

          {/* LC */}
          <h2>💻 LeetCode Stats</h2>
          {lcData ? (
            <div>
              <p>🧩 Total: {lcData.total}</p>
              <p style={{ color: "#22c55e" }}>Easy: {lcData.easy}</p>
              <p style={{ color: "#facc15" }}>Medium: {lcData.medium}</p>
              <p style={{ color: "#ef4444" }}>Hard: {lcData.hard}</p>

              <hr />

              <p>🏆 Rating: {lcData.rating}</p>
              <p>📊 Contests: {lcData.contests}</p>
              <p>🌍 Global Rank: {lcData.globalRanking}</p>
              <p>📉 Top %: {lcData.topPercentage}</p>

              {/* ✅ CHART ADDED */}
              <h3>📊 Problem Distribution</h3>
              <div style={{ width: "300px", margin: "auto" }}>
                <Pie data={pieData} />
              </div>
            </div>
          ) : <p>No LeetCode data</p>}
        </div>
      ) : <p>Loading user...</p>}

      {/* CONTROLS */}
      <div style={{ textAlign: "center", margin: "20px 0" }}>
        <input
          placeholder="Search user..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <br /><br />

        <button onClick={() => setSortType("total")}>Total</button>
        <button onClick={() => setSortType("cf")}>CF</button>
        <button onClick={() => setSortType("lc")}>LC</button>

        <br /><br />

        <button onClick={fetchLeaderboard} disabled={loading}>
          {loading ? "Loading..." : "🔄 Refresh"}
        </button>
      </div>

      {/* LEADERBOARD */}
      <div className="leaderboard">
        <h2>🏆 Global Leaderboard</h2>

        {filteredUsers.map((u, index) => (
          <div
            key={index}
            className={`leaderboard-item ${
              u.email === user?.email ? "current-user" : ""
            }`}
            style={{
              background:
                index === 0
                  ? "#FFD700"
                  : index === 1
                  ? "#C0C0C0"
                  : index === 2
                  ? "#CD7F32"
                  : ""
            }}
          >
            <div className="left">
              <span className="rank">
                {index === 0 ? "🥇" :
                 index === 1 ? "🥈" :
                 index === 2 ? "🥉" :
                 `#${index + 1}`}
              </span>

              <div className="avatar">
                {u.name?.charAt(0).toUpperCase()}
              </div>

              <span className="name">{u.name}</span>
            </div>

            <div className="right">
              <span className="cf">CF: {u.cfRating}</span>
              <span className="lc">LC: {u.lcScore}</span>
              <span className="level">{getLevel(u.rating)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ACTIONS */}
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