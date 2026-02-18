const { validationResult } = require('express-validator');
const Expense = require('../models/Expsense');
const Group = require('../models/Group');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { sendExpenseNotificationEmail } = require('../services/emailService');

const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const groups = await Group.find({ memberIds: userId });
    const totalGroups = groups.length;

    const expenses = await Expense.find({ paidBy: userId })
      .populate('groupId', 'name')
      .sort({ createdAt: -1 });
    
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    const allExpenses = await Expense.find({
      groupId: { $in: groups.map(g => g._id) },
      settlementId: null
    });

    const netBalances = {};
    groups.forEach(group => {
      group.memberIds.forEach(memberId => {
        const id = memberId.toString();
        if (!netBalances[id]) netBalances[id] = 0;
      });
    });

    allExpenses.forEach(expense => {
      const paidById = expense.paidBy.toString();
      if (netBalances[paidById] !== undefined) {
        netBalances[paidById] += expense.amount;
      }

      expense.participants.forEach(participant => {
        const participantId = participant.userId.toString();
        if (netBalances[participantId] !== undefined) {
          netBalances[participantId] -= participant.share;
        }
      });
    });

    const userBalance = Math.round((netBalances[userId] || 0) * 100) / 100;

    res.json({
      success: true,
      stats: {
        totalGroups,
        totalExpenses: Math.round(totalExpenses * 100) / 100,
        userBalance,
        expenses: expenses.map(exp => ({
          _id: exp._id,
          title: exp.title,
          amount: exp.amount,
          currency: exp.currency,
          groupName: exp.groupId?.name,
          createdAt: exp.createdAt
        }))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error fetching dashboard stats',
      error: error.message
    });
  }
};

const addExpense = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { groupId, title, amount, splitMethod, participants, notes } = req.body;
    const paidBy = req.user.id;

    const group = await Group.findById(groupId).populate('memberIds', 'name email');
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    if (!group.memberIds.some(m => m._id.toString() === paidBy)) {
      return res.status(403).json({
        success: false,
        message: 'You are not a member of this group'
      });
    }

    const participantIds = participants.map(p => p.userId);
    const invalidMembers = participantIds.filter(
      id => !group.memberIds.some(m => m._id.toString() === id)
    );

    if (invalidMembers.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Some participants are not members of this group'
      });
    }

    let processedParticipants = [];
    
    if (splitMethod === 'equal') {
      const sharePerPerson = amount / participants.length;
      processedParticipants = participants.map(p => ({
        userId: p.userId,
        share: sharePerPerson
      }));
    } else if (splitMethod === 'amount') {
      const totalShares = participants.reduce((sum, p) => sum + p.share, 0);
      if (Math.abs(totalShares - amount) > 0.01) {
        return res.status(400).json({
          success: false,
          message: 'Sum of shares must equal total amount'
        });
      }
      processedParticipants = participants.map(p => ({
        userId: p.userId,
        share: p.share
      }));
    } else if (splitMethod === 'percentage') {
      const totalPercentage = participants.reduce((sum, p) => sum + p.share, 0);
      if (Math.abs(totalPercentage - 100) > 0.01) {
        return res.status(400).json({
          success: false,
          message: 'Sum of percentages must equal 100'
        });
      }
      processedParticipants = participants.map(p => ({
        userId: p.userId,
        share: (amount * p.share) / 100
      }));
    } else if (splitMethod === 'shares') {
      const totalShares = participants.reduce((sum, p) => sum + p.share, 0);
      processedParticipants = participants.map(p => ({
        userId: p.userId,
        share: (amount * p.share) / totalShares
      }));
    }

    const expense = await Expense.create({
      groupId,
      title,
      amount,
      currency: group.currency,
      paidBy,
      participants: processedParticipants,
      splitMethod,
      metadata: { notes },
      createdBy: paidBy
    });

    const populatedExpense = await Expense.findById(expense._id)
      .populate('paidBy', 'name username email')
      .populate('participants.userId', 'name username email');

    const payer = await User.findById(paidBy);
    const notificationPromises = [];

    for (const participant of processedParticipants) {
      if (participant.userId !== paidBy) {
        const user = group.memberIds.find(m => m._id.toString() === participant.userId);
        
        notificationPromises.push(
          Notification.create({
            userId: participant.userId,
            type: 'expense',
            message: `${payer.name} added "${title}" (${group.currency} ${amount}) in "${group.name}"`,
            groupId: group._id
          })
        );

        notificationPromises.push(
          sendExpenseNotificationEmail(
            user.email,
            user.name,
            payer.name,
            title,
            amount,
            group.currency,
            participant.share,
            group.name
          )
        );
      }
    }

    await Promise.all(notificationPromises);

    res.status(201).json({
      success: true,
      message: 'Expense added successfully',
      expense: populatedExpense
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error adding expense',
      error: error.message
    });
  }
};

const getGroupExpenses = async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    if (!group.memberIds.some(m => m._id.toString() === req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const expenses = await Expense.find({ groupId })
      .populate('paidBy', 'name username email avatarUrl')
      .populate('participants.userId', 'name username email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      expenses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error fetching expenses',
      error: error.message
    });
  }
};

const getGroupBalances = async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findById(groupId).populate('memberIds', 'name username email avatarUrl');
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    if (!group.memberIds.some(m => m._id.toString() === req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const unsettledExpenses = await Expense.find({ groupId, settlementId: null });

    const netBalances = {};
    group.memberIds.forEach(member => {
      netBalances[member._id.toString()] = 0;
    });

    unsettledExpenses.forEach(expense => {
      const paidById = expense.paidBy.toString();
      netBalances[paidById] += expense.amount;

      expense.participants.forEach(participant => {
        const participantId = participant.userId.toString();
        netBalances[participantId] -= participant.share;
      });
    });

    const balances = group.memberIds.map(member => ({
      user: {
        _id: member._id,
        name: member.name,
        username: member.username,
        email: member.email,
        avatarUrl: member.avatarUrl
      },
      netBalance: Math.round(netBalances[member._id.toString()] * 100) / 100
    }));

    const transactions = [];
    const creditors = [];
    const debtors = [];

    Object.entries(netBalances).forEach(([userId, balance]) => {
      if (balance > 0.01) creditors.push({ userId, amount: balance });
      else if (balance < -0.01) debtors.push({ userId, amount: -balance });
    });

    creditors.sort((a, b) => b.amount - a.amount);
    debtors.sort((a, b) => b.amount - a.amount);

    let i = 0, j = 0;
    while (i < creditors.length && j < debtors.length) {
      const creditor = creditors[i];
      const debtor = debtors[j];
      const amount = Math.min(creditor.amount, debtor.amount);

      const fromUser = group.memberIds.find(m => m._id.toString() === debtor.userId);
      const toUser = group.memberIds.find(m => m._id.toString() === creditor.userId);

      transactions.push({
        from: { _id: fromUser._id, name: fromUser.name },
        to: { _id: toUser._id, name: toUser.name },
        amount: Math.round(amount * 100) / 100
      });

      creditor.amount -= amount;
      debtor.amount -= amount;

      if (creditor.amount < 0.01) i++;
      if (debtor.amount < 0.01) j++;
    }

    res.json({
      success: true,
      balances,
      transactions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error calculating balances',
      error: error.message
    });
  }
};

const deleteExpense = async (req, res) => {
  try {
    const { expenseId } = req.params;

    const expense = await Expense.findById(expenseId);
    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    if (expense.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only the creator can delete this expense'
      });
    }

    await Expense.findByIdAndDelete(expenseId);

    res.json({
      success: true,
      message: 'Expense deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error deleting expense',
      error: error.message
    });
  }
};

module.exports = {
  addExpense,
  getGroupExpenses,
  getGroupBalances,
  deleteExpense,
  getDashboardStats
};
