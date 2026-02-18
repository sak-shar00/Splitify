const Settlement = require('../models/Settlement');
const Expense = require('../models/Expsense');
const Group = require('../models/Group');
const Notification = require('../models/Notification');
const { sendSettlementEmail } = require('../services/emailService');

const createSettlement = async (req, res) => {
  try {
    const { groupId, notes } = req.body;

    const group = await Group.findById(groupId).populate('memberIds', 'name email');
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    if (group.ownerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only group admin can create settlements'
      });
    }

    const unsettledExpenses = await Expense.find({ groupId, settlementId: null });

    if (unsettledExpenses.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No unsettled expenses found'
      });
    }

    const paidBy = {};
    const owedBy = {};

    group.memberIds.forEach(member => {
      const memberId = member._id.toString();
      paidBy[memberId] = 0;
      owedBy[memberId] = 0;
    });

    unsettledExpenses.forEach(expense => {
      const payerId = expense.paidBy.toString();
      paidBy[payerId] = (paidBy[payerId] || 0) + expense.amount;

      expense.participants.forEach(participant => {
        const participantId = participant.userId.toString();
        owedBy[participantId] = (owedBy[participantId] || 0) + participant.share;
      });
    });

    const balances = [];
    const netBalances = {};

    group.memberIds.forEach(member => {
      const memberId = member._id.toString();
      const netBalance = Math.round(((paidBy[memberId] || 0) - (owedBy[memberId] || 0)) * 100) / 100;
      netBalances[memberId] = netBalance;

      let status = 'even';
      if (netBalance > 0.01) status = 'owed';
      else if (netBalance < -0.01) status = 'owes';

      balances.push({
        userId: member._id,
        netBalance,
        status
      });
    });

    const totalBalance = Object.values(netBalances).reduce((sum, val) => sum + val, 0);
    if (Math.abs(totalBalance) > 0.01) {
      const memberIds = Object.keys(netBalances);
      const randomMemberId = memberIds[Math.floor(Math.random() * memberIds.length)];
      netBalances[randomMemberId] -= totalBalance;
    }

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

      transactions.push({
        from: debtor.userId,
        to: creditor.userId,
        amount: Math.round(amount * 100) / 100
      });

      creditor.amount -= amount;
      debtor.amount -= amount;

      if (creditor.amount < 0.01) i++;
      if (debtor.amount < 0.01) j++;
    }

    const settlement = await Settlement.create({
      groupId,
      createdBy: req.user.id,
      type: 'final',
      notes,
      balances,
      transactions,
      status: 'pending'
    });

    await Expense.updateMany(
      { _id: { $in: unsettledExpenses.map(e => e._id) } },
      { settlementId: settlement._id }
    );

    const populatedSettlement = await Settlement.findById(settlement._id)
      .populate('createdBy', 'name username')
      .populate('balances.userId', 'name username email')
      .populate('transactions.from', 'name username')
      .populate('transactions.to', 'name username');

    const notificationPromises = [];
    group.memberIds.forEach(member => {
      notificationPromises.push(
        Notification.create({
          userId: member._id,
          type: 'settlement',
          message: `${req.user.name} created a settlement for "${group.name}"`,
          groupId: group._id
        })
      );

      notificationPromises.push(
        sendSettlementEmail(
          member.email,
          member.name,
          req.user.name,
          group.name,
          'created',
          'final'
        )
      );
    });

    await Promise.all(notificationPromises);

    res.status(201).json({
      success: true,
      message: 'Settlement created successfully',
      data: {
        settlementId: populatedSettlement._id,
        balances: populatedSettlement.balances.map(b => ({
          user: b.userId.name,
          netBalance: b.netBalance
        })),
        transactions: populatedSettlement.transactions.map(t => ({
          from: t.from.name,
          to: t.to.name,
          amount: t.amount
        }))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error creating settlement',
      error: error.message
    });
  }
};

const getGroupSettlements = async (req, res) => {
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

    const settlements = await Settlement.find({ groupId })
      .populate('createdBy', 'name username')
      .populate('balances.userId', 'name username email avatarUrl')
      .populate('transactions.from', 'name username')
      .populate('transactions.to', 'name username')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      settlements
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error fetching settlements',
      error: error.message
    });
  }
};

const getSettlementById = async (req, res) => {
  try {
    const { settlementId } = req.params;

    const settlement = await Settlement.findById(settlementId)
      .populate('groupId', 'name')
      .populate('createdBy', 'name username email')
      .populate('balances.userId', 'name username email avatarUrl')
      .populate('transactions.from', 'name username email')
      .populate('transactions.to', 'name username email');

    if (!settlement) {
      return res.status(404).json({
        success: false,
        message: 'Settlement not found'
      });
    }

    const group = await Group.findById(settlement.groupId);
    if (!group.memberIds.some(m => m._id.toString() === req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      settlement
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error fetching settlement',
      error: error.message
    });
  }
};

const completeSettlement = async (req, res) => {
  try {
    const { settlementId } = req.params;

    const settlement = await Settlement.findById(settlementId).populate('groupId');
    if (!settlement) {
      return res.status(404).json({
        success: false,
        message: 'Settlement not found'
      });
    }

    const group = await Group.findById(settlement.groupId).populate('memberIds', 'name email');
    if (group.ownerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only group admin can complete settlements'
      });
    }

    if (settlement.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Settlement already completed'
      });
    }

    settlement.status = 'completed';
    await settlement.save();

    const notificationPromises = [];
    group.memberIds.forEach(member => {
      notificationPromises.push(
        Notification.create({
          userId: member._id,
          type: 'settlement',
          message: `Settlement for "${group.name}" has been marked as completed`,
          groupId: group._id
        })
      );

      notificationPromises.push(
        sendSettlementEmail(
          member.email,
          member.name,
          req.user.name,
          group.name,
          'completed',
          'final'
        )
      );
    });

    await Promise.all(notificationPromises);

    res.json({
      success: true,
      message: 'Settlement marked as completed'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error completing settlement',
      error: error.message
    });
  }
};

module.exports = {
  createSettlement,
  getGroupSettlements,
  getSettlementById,
  completeSettlement
};
