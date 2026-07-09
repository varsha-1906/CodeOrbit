import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../App.css";

// ✅ CHART IMPORTS
import { Pie, Doughnut, Radar, Bar, Line } from "react-chartjs-2";
import { 
  Chart as ChartJS, 
  ArcElement, 
  Tooltip, 
  Legend,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  CategoryScale,
  LinearScale,
  BarElement
} from "chart.js";

ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  CategoryScale,
  LinearScale,
  BarElement
);

function Dashboard() {
  const isDark = document.documentElement.getAttribute("data-theme") !== "light";
  const textColor = isDark ? "#e2e8f0" : "#0f172a";
  const textMuted = isDark ? "#94a3b8" : "#475569";
  const gridColor = isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)";
  const angleLinesColor = isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)";

  const [user, setUser] = useState(null);
  const [cfData, setCfData] = useState(null);
  const [lcData, setLcData] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);

  const [search, setSearch] = useState("");
  const [sortType, setSortType] = useState("total");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [readinessReport, setReadinessReport] = useState(null);

  const navigate = useNavigate();

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get("http://localhost:5000/me", {
        headers: { Authorization: `Bearer ${token}` }
      });

      const currentUser = res.data;

      setUser(currentUser);

      setCfData({
        rating: currentUser.cfRating || 0,
        maxRating: currentUser.cfMaxRating || 0,
        rank: currentUser.cfRank || "unrated"
      });

      setLcData({
        total: currentUser.lcSolved || 0,
        easy: currentUser.lcEasy || 0,
        medium: currentUser.lcMedium || 0,
        hard: currentUser.lcHard || 0,

        rating: currentUser.lcRating || 0,
        contests: currentUser.lcContests || 0,

        globalRanking: currentUser.lcGlobalRanking || 0,
        topPercentage: currentUser.lcTopPercentage || 0
      });

      // Fetch advanced AI Interview Readiness Report
      const username = currentUser.leetcodeUsername || currentUser.codeforcesUsername || currentUser.name;
      if (username) {
        const readinessRes = await axios.get(`http://localhost:5000/ai/interview-readiness/${username}`);
        setReadinessReport(readinessRes.data);
      }

    } catch (err) {
      console.log(err);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);

      const res = await axios.get("http://localhost:5000/users");

      setLeaderboard(res.data);

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
      return (b.readinessScore || 0) - (a.readinessScore || 0);
    });

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="dashboard-container">
      <h1>🌌 CodeOrbit Dashboard</h1>

      {/* Tab Switcher */}
      <div className="tab-switcher">
        <button
          className={activeTab === "general" ? "active-tab-btn" : "tab-btn"}
          onClick={() => setActiveTab("general")}
        >
          📊 Platform Stats
        </button>
        <button
          className={activeTab === "readiness" ? "active-tab-btn" : "tab-btn"}
          onClick={() => setActiveTab("readiness")}
        >
          🎯 AI Interview Readiness
        </button>
      </div>

      {activeTab === "general" && user && cfData && lcData && (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <h3>📊 CF Rating</h3>
              <p>{cfData.rating}</p>
            </div>

            <div className="stat-card">
              <h3>💻 LC Rating</h3>
              <p>{Math.round(lcData.rating)}</p>
            </div>

            <div className="stat-card">
              <h3>🧩 Solved</h3>
              <p>{lcData.total}</p>
            </div>

            <div className="stat-card">
              <h3>🏆 Contests</h3>
              <p>{lcData.contests}</p>
            </div>
          </div>

          {/* ⚠️ Profile Warning */}
          {user && (!user.codeforcesUsername || !user.leetcodeUsername) && (
            <p style={{ color: "orange", textAlign: "center", marginBottom: "20px" }}>
              ⚠️ Complete your profile in settings
            </p>
          )}

          {/* 👤 PROFILE CARD */}
          <div className="dashboard-card">
            <h2>👤 Profile</h2>
            <p><b>Name:</b> {user.name}</p>
            <p><b>Email:</b> {user.email}</p>
            <p><b>Codeforces:</b> {user.codeforcesUsername || "Not linked"}</p>
            <p><b>LeetCode:</b> {user.leetcodeUsername || "Not linked"}</p>
            <p>
              🕒 Last Updated:{" "}
              {user.lastUpdated
                ? new Date(user.lastUpdated).toLocaleString()
                : "Never"}
            </p>

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

            <hr />

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

                <h3>📊 Problem Distribution</h3>
                <div style={{ width: "300px", margin: "auto" }}>
                  <Pie data={pieData} />
                </div>
              </div>
            ) : <p>No LeetCode data</p>}
          </div>
        </>
      )}

      {activeTab === "readiness" && (
        <div className="readiness-section">
          {readinessReport ? (
            <>
              {/* 🚀 Interview Readiness Header Card */}
              <div className="readiness-card">
                <div className="readiness-card-content">
                  <div className="readiness-score-section">
                    <div className="circular-progress" style={{ width: "160px", height: "160px" }}>
                      <Doughnut
                        data={{
                          labels: ["Readiness", "Remaining"],
                          datasets: [{
                            data: [readinessReport.score, 100 - readinessReport.score],
                            backgroundColor: ["#38bdf8", "rgba(255, 255, 255, 0.05)"],
                            borderWidth: 0,
                            circumference: 180,
                            rotation: 270,
                            cutout: "75%"
                          }]
                        }}
                        options={{
                          plugins: { legend: { display: false }, tooltip: { enabled: false } },
                          aspectRatio: 2,
                          maintainAspectRatio: true
                        }}
                      />
                      <div className="score-text" style={{ bottom: "20px", fontSize: "36px" }}>
                        {readinessReport.score}%
                      </div>
                    </div>
                    <div className="readiness-level-badge" style={{ marginTop: "10px" }}>
                      {readinessReport.level}
                    </div>
                  </div>

                  <div className="readiness-details-section">
                    <h3 className="readiness-title">
                      🎯 AI Interview Readiness Diagnostic
                    </h3>
                    <p className="readiness-explanation">
                      {readinessReport.explanation}
                    </p>
                    <div className="diagnostics-grid">
                      <div className="diagnostic-col">
                        <h4>✔ Strengths</h4>
                        <ul className="diagnostic-list">
                          {readinessReport.recommendations && 
                           (readinessReport.components?.topicMastery > 50 ? ["Concept Mastery", "Coding Base"] : ["Starting foundations"]).concat(
                             readinessReport.components?.consistency > 50 ? ["Consistency"] : []
                           ).map((str, idx) => (
                            <li key={idx} className="strength-item">
                              <span className="icon">✔</span> {str}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="diagnostic-col">
                        <h4>💡 Top Actionable Recommendations</h4>
                        <ul className="diagnostic-list">
                          {readinessReport.recommendations?.map((sug, idx) => (
                            <li key={idx} className="improvement-item">
                              <span className="icon">•</span> {sug}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 📊 8 Visualizations Grid */}
              <div className="readiness-charts-grid">
                
                {/* 1. Concept Mastery Radar Chart */}
                <div className="chart-card">
                  <h3>🕸 Topic Mastery Overview</h3>
                  <div className="chart-wrapper" style={{ width: "280px", height: "280px" }}>
                    <Radar 
                      data={readinessReport.charts.radar} 
                      options={{
                        scales: {
                          r: {
                            angleLines: { color: angleLinesColor },
                            grid: { color: gridColor },
                            pointLabels: { color: textColor, font: { size: 10 } },
                            ticks: { display: false }
                          }
                        },
                        plugins: { legend: { display: false } }
                      }}
                    />
                  </div>
                </div>

                {/* 2. Topic Contributions Bar Chart */}
                <div className="chart-card">
                  <h3>📊 Topic Weight Contributions</h3>
                  <div className="chart-wrapper">
                    <Bar 
                      data={readinessReport.charts.bar} 
                      options={{
                        scales: {
                          x: { grid: { display: false }, ticks: { color: textColor, font: { size: 9 } } },
                          y: { grid: { color: gridColor }, ticks: { color: textMuted } }
                        },
                        plugins: { legend: { display: false } }
                      }}
                    />
                  </div>
                </div>

                {/* 3. Problems by Topic Pie Chart */}
                <div className="chart-card">
                  <h3>🍕 Solved Problems by Topic</h3>
                  <div className="chart-wrapper" style={{ width: "260px", height: "260px" }}>
                    <Pie data={readinessReport.charts.pie} />
                  </div>
                </div>

                {/* 4. Readiness Over Time Line Chart */}
                <div className="chart-card">
                  <h3>📈 Readiness Score Trend</h3>
                  <div className="chart-wrapper">
                    <Line 
                      data={readinessReport.charts.line} 
                      options={{
                        scales: {
                          x: { grid: { display: false }, ticks: { color: textMuted, font: { size: 9 } } },
                          y: { grid: { color: gridColor }, ticks: { color: textColor } }
                        }
                      }}
                    />
                  </div>
                </div>

                {/* 5. LeetCode vs Codeforces Comparison */}
                <div className="chart-card">
                  <h3>⚔ Codeforces vs LeetCode</h3>
                  <div className="chart-wrapper">
                    <Bar 
                      data={{
                        labels: readinessReport.charts.cfVsLc.platforms,
                        datasets: [
                          {
                            label: "Attended Contests",
                            data: readinessReport.charts.cfVsLc.contests,
                            backgroundColor: "rgba(96, 165, 250, 0.8)"
                          },
                          {
                            label: "Platform Rating",
                            data: readinessReport.charts.cfVsLc.ratings,
                            backgroundColor: "rgba(168, 85, 247, 0.8)"
                          }
                        ]
                      }}
                      options={{
                        scales: {
                          x: { ticks: { color: textColor }, grid: { display: false } },
                          y: { ticks: { color: textMuted }, grid: { color: gridColor } }
                        }
                      }}
                    />
                  </div>
                </div>

                {/* 6. Daily Activity Heatmap */}
                <div className="chart-card">
                  <h3>🔥 Learning Consistency (Past 30 Days)</h3>
                  <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "10px" }}>
                    GitHub style calendar tracking your database updates and updates activity.
                  </p>
                  <div className="heatmap-container">
                    {readinessReport.charts.heatmap.map((cell, idx) => (
                      <div 
                        key={idx}
                        className="heatmap-day"
                        title={`${cell.date}: ${cell.count ? "Active Coding Record" : "No Activity"}`}
                        style={{
                          backgroundColor: cell.count ? "#10b981" : "rgba(255, 255, 255, 0.05)",
                          border: "1px solid rgba(255, 255, 255, 0.02)",
                          boxShadow: cell.count ? "0 0 8px rgba(16, 185, 129, 0.4)" : "none"
                        }}
                      />
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: "10px", fontSize: "12px", marginTop: "10px", color: "var(--text-muted)" }}>
                    <span>Less</span>
                    <div style={{ width: "14px", height: "14px", backgroundColor: "rgba(255, 255, 255, 0.05)", borderRadius: "2px" }} />
                    <div style={{ width: "14px", height: "14px", backgroundColor: "#10b981", borderRadius: "2px" }} />
                    <span>More</span>
                  </div>
                </div>

                {/* 7. Components Breakdown Radar/Polar Area */}
                <div className="chart-card">
                  <h3>💎 Readiness Components Breakdown</h3>
                  <div className="chart-wrapper" style={{ width: "240px", height: "240px" }}>
                    <Radar 
                      data={{
                        labels: [
                          "Topic Mastery", 
                          "Difficulty Coverage", 
                          "Codeforces Strength", 
                          "Consistency", 
                          "Growth", 
                          "Contest Performance"
                        ],
                        datasets: [{
                          label: "Component Scores",
                          data: [
                            readinessReport.components.topicMastery,
                            readinessReport.components.problemDifficulty,
                            readinessReport.components.codeforces,
                            readinessReport.components.consistency,
                            readinessReport.components.growth,
                            readinessReport.components.contestPerformance
                          ],
                          backgroundColor: "rgba(168, 85, 247, 0.15)",
                          borderColor: "#a855f7",
                          pointBackgroundColor: "#a855f7"
                        }]
                      }}
                      options={{
                        scales: {
                          r: {
                            angleLines: { color: angleLinesColor },
                            grid: { color: gridColor },
                            pointLabels: { color: textColor, font: { size: 9 } },
                            ticks: { display: false }
                          }
                        },
                        plugins: { legend: { display: false } }
                      }}
                    />
                  </div>
                </div>

                {/* 8. Target Progress Bar Chart */}
                <div className="chart-card">
                  <h3>🎯 Target Progress Metrics</h3>
                  <div className="chart-wrapper">
                    <Bar 
                      data={{
                        labels: ["Easy Target", "Medium Target", "Hard Target"],
                        datasets: [
                          {
                            label: "Solved",
                            data: [lcData?.easy || 0, lcData?.medium || 0, lcData?.hard || 0],
                            backgroundColor: "#10b981"
                          },
                          {
                            label: "Target Goals",
                            data: [200, 300, 100],
                            backgroundColor: "rgba(255, 255, 255, 0.05)",
                            borderColor: "rgba(255, 255, 255, 0.2)",
                            borderWidth: 1
                          }
                        ]
                      }}
                      options={{
                        scales: {
                          x: { ticks: { color: textColor }, grid: { display: false } },
                          y: { ticks: { color: textMuted }, grid: { color: gridColor } }
                        }
                      }}
                    />
                  </div>
                </div>

              </div>
            </>
          ) : (
            <p style={{ textAlign: "center" }}>Loading AI Readiness report...</p>
          )}
        </div>
      )}

      {/* CONTROLS */}
      <div style={{ textAlign: "center", margin: "20px 0" }}>
        <input
          placeholder="Search user..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <br /><br />

        <button onClick={() => setSortType("total")}>Readiness Score</button>
        <button onClick={() => setSortType("cf")}>CF Rating</button>
        <button onClick={() => setSortType("lc")}>LC Rating</button>

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
            className={`leaderboard-item ${u.email === user?.email ? "current-user" : ""
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

            <div className="right" style={{ gap: "20px" }}>
              <span className="cf">CF: {u.cfRating}</span>
              <span className="lc">LC: {u.lcScore}</span>
              <span className="level" style={{ whiteSpace: "nowrap" }}>{u.readinessLevel || "Beginner"}</span>
              <span style={{ fontSize: "14px", fontWeight: "bold", opacity: 0.8, color: "var(--primary-color)", whiteSpace: "nowrap" }}>
                Score: {u.readinessScore || 0}/100
              </span>
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