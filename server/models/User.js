const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  leetcodeUsername: String,
  codeforcesUsername: String,
  weakTopics: [String],
  futurePlans: String,

  // Cron-updated stats
  cfRating: {
    type: Number,
    default: 0
  },

  cfMaxRating: {
    type: Number,
    default: 0
  },

  lcRating: {
    type: Number,
    default: 0
  },

  lcSolved: {
    type: Number,
    default: 0
  },

  lcContests: {
    type: Number,
    default: 0
  },

  cfRank: {
  type: String,
  default: "unrated"
},

lcEasy: {
  type: Number,
  default: 0
},

lcMedium: {
  type: Number,
  default: 0
},

lcHard: {
  type: Number,
  default: 0
},

lcGlobalRanking: {
  type: Number,
  default: 0
},

lcTopPercentage: {
  type: Number,
  default: 0
},

  lastUpdated: {
    type: Date,
    default: null
  }
});

module.exports = mongoose.model("User", userSchema);