const mongoose = require("mongoose");

const ExpenseSchema = new mongoose.Schema({
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Group",
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: "INR"
  },
  paidBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  participants: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      share: { type: Number, default: 1 }
    }
  ],
  splitMethod: {
    type: String,
    enum: ["equal", "amount", "shares", "percentage"],
    default: "equal"
  },
  metadata: {
    receiptUrl: { type: String },
    notes: { type: String }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  settlementId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Settlement"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Expense", ExpenseSchema);
