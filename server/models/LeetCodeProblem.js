const mongoose = require("mongoose");

const leetcodeProblemSchema = new mongoose.Schema({
  titleSlug: { type: String, unique: true, index: true, required: true },
  title: { type: String },
  difficulty: { type: String, enum: ["Easy", "Medium", "Hard"] },
  topicTags: [{ type: String }],
  isPaidOnly: { type: Boolean, default: false },
  likes: { type: Number, default: 0 },
  dislikes: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now }
});

module.exports = mongoose.model("LeetCodeProblem", leetcodeProblemSchema);
