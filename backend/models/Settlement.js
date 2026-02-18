const mongoose = require("mongoose");

const SettlementSchema = new mongoose.Schema({
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Group",
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  type: {
    type: String,
    default: "final"
  },

  notes: {
    type: String,
    trim: true
  },
  balances: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      netBalance: { type: Number, required: true },
      status: { type: String, enum: ["owed", "owes", "even"], required: true }
    }
  ],
  transactions: [
    {
      from: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      to: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      amount: { type: Number, required: true }
    }
  ],
  status: {
    type: String,
    enum: ["pending", "completed"],
    default: "pending"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Settlement", SettlementSchema);
