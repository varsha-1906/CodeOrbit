const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  leetcodeUsername: String,
  codeforcesUsername: String
});

module.exports = mongoose.model("User", userSchema);