const mongoose = require("mongoose");

const GroupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  memberIds: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ],
  currency: {
    type: String,
    default: "INR"
  },
  type: {
    type: String,
    enum: ["roommates", "trip", "general"],
    default: "general"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Group", GroupSchema);
