const mongoose = require("mongoose");

const statHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  cfRating: {
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

  cfSolved: {
    type: Number,
    default: 0
  },

  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("StatHistory", statHistorySchema);