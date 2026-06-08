require("dotenv").config(); // ✅ ENV

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const axios = require("axios");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const StatHistory = require("./models/StatHistory");

const app = express();

// 🧠 Cache
const cache = {};

// Middleware
app.use(cors());
app.use(express.json());

// 🔐 Auth Middleware
const auth = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];

  if (!token) return res.status(401).send("No token");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).send("Invalid token");
  }
};

// ✅ MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// User Model
const User = require("./models/User");
require("./cron/updateStats");

// ================= AUTH =================

// ✅ SIGNUP
app.post("/signup", async (req, res) => {
  try {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send("User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      ...req.body,
      password: hashedPassword
    });

    await user.save();

    res.json({ message: "Signup successful" });
  } catch (err) {
    res.status(500).send(err);
  }
});

// ✅ LOGIN
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).send("User not found");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).send("Wrong password");

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token });
  } catch (err) {
    res.status(500).send(err);
  }
});

// ================= USER =================

// 🏆 Get ALL users
// 🏆 Get ALL users
app.get("/users", async (req, res) => {
  try {
    const users = await User.find().select("-password");

    const leaderboard = users.map((u) => ({
      name: u.name,
      email: u.email,

      cfRating: u.cfRating || 0,
      cfMax: u.cfMaxRating || 0,
      cfRank: u.cfRank || "unrated",

      lcScore: u.lcRating || 0,
      lcTotal: u.lcSolved || 0,
      lcContests: u.lcContests || 0,

      rating: (u.cfRating || 0) + (u.lcRating || 0),

      lastUpdated: u.lastUpdated
    }));

    leaderboard.sort((a, b) => b.rating - a.rating);

    res.json(leaderboard);

  } catch (err) {
    res.status(500).send(err);
  }
});

// 🔐 Get CURRENT user
app.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).send(err);
  }
});

// ✅ UPDATE USER
app.put("/update-user", auth, async (req, res) => {
  try {
    const userId = req.user.userId;

    let updateData = { ...req.body };

    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    await User.findByIdAndUpdate(userId, updateData);

    res.send("Updated successfully");
  } catch (err) {
    res.status(500).send(err);
  }
});

// ================= CODEFORCES =================

app.get("/codeforces/:username", async (req, res) => {
  try {
    const username = req.params.username;
    const key = `cf_${username}`;

    // ✅ Cache check
    if (cache[key]) {
      return res.json(cache[key]);
    }

    const response = await axios.get(
      `https://codeforces.com/api/user.info?handles=${username}`
    );

    if (response.data.status !== "OK") {
      return res.json({
        rating: 0,
        rank: "unrated",
        maxRating: 0
      });
    }

    const result = response.data.result[0];

    // ✅ Store cache
    cache[key] = result;

    // ⏱ Expire after 10 mins
    setTimeout(() => delete cache[key], 10 * 60 * 1000);

    res.json(result);

  } catch (err) {
    res.json({
      rating: 0,
      rank: "error",
      maxRating: 0
    });
  }
});

// ================= LEETCODE =================

app.get("/leetcode/:username", async (req, res) => {
  try {
    const username = req.params.username;
    const key = `lc_${username}`;

    // ✅ Cache check
    if (cache[key]) {
      return res.json(cache[key]);
    }

    const response = await axios.post(
      "https://leetcode.com/graphql",
      {
        query: `
        query getUserProfile($username: String!) {
          matchedUser(username: $username) {
            submitStats {
              acSubmissionNum {
                difficulty
                count
              }
            }
          }
          userContestRanking(username: $username) {
            rating
            globalRanking
            attendedContestsCount
            topPercentage
          }
        }
        `,
        variables: { username }
      }
    );

    const user = response.data.data.matchedUser;
    const contest = response.data.data.userContestRanking;

    const stats = user?.submitStats?.acSubmissionNum || [];

    const result = {
      total: stats.find(s => s.difficulty === "All")?.count || 0,
      easy: stats.find(s => s.difficulty === "Easy")?.count || 0,
      medium: stats.find(s => s.difficulty === "Medium")?.count || 0,
      hard: stats.find(s => s.difficulty === "Hard")?.count || 0,
      rating: contest?.rating || 0,
      globalRanking: contest?.globalRanking || 0,
      contests: contest?.attendedContestsCount || 0,
      topPercentage: contest?.topPercentage || 0
    };

    // ✅ Store cache
    cache[key] = result;

    // ⏱ Expire after 10 mins
    setTimeout(() => delete cache[key], 10 * 60 * 1000);

    res.json(result);

  } catch (err) {
    res.json({
      total: 0,
      easy: 0,
      medium: 0,
      hard: 0,
      rating: 0,
      globalRanking: 0,
      contests: 0,
      topPercentage: 0
    });
  }
});

// 📈 Get user rating history
app.get("/history/:userId", async (req, res) => {
  try {
    const history = await StatHistory.find({
      userId: req.params.userId
    }).sort({ timestamp: 1 });

    res.json(history);
  } catch (err) {
    res.status(500).send(err);
  }
});
// ================= SERVER =================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});