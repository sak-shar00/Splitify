const express = require('express');
const { addExpense, getGroupExpenses, getGroupBalances, deleteExpense, getDashboardStats } = require('../controllers/expenseController');
const { addExpenseValidation } = require('../middlewares/validation');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware, addExpenseValidation, async (req, res) => {
  addExpense(req, res);
});

router.get('/group/:groupId', authMiddleware, async (req, res) => {
  getGroupExpenses(req, res);
});

router.get('/group/:groupId/balances', authMiddleware, async (req, res) => {
  getGroupBalances(req, res);
});

router.delete('/:expenseId', authMiddleware, async (req, res) => {
  deleteExpense(req, res);
});

router.get('/dashboard/stats', authMiddleware, async (req, res) => {
  getDashboardStats(req, res);
});

module.exports = router;
