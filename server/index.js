const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());

mongoose.connect("mongodb+srv://saivarshathelukonti_db_user:test123@cluster0.ocpv8ui.mongodb.net/codeorbit?retryWrites=true&w=majority")
.then(() => console.log("MongoDB Connected"))
.catch((err) => console.log(err));

const User = require("./models/User");

app.post("/add-user", async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.send("User saved");
  } catch (err) {
    res.status(500).send(err);
  }
});
const cors = require("cors");
app.use(cors());

app.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).send(err);
  }
});

const axios = require("axios");

app.get("/codeforces/:username", async (req, res) => {
  try {
    const username = req.params.username;

    const response = await axios.get(
      `https://codeforces.com/api/user.info?handles=${username}`
    );

    res.json(response.data.result[0]);
  } catch (err) {
    res.status(500).send(err);
  }
});

app.listen(5000, () => console.log("Server running"));