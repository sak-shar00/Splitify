const express = require('express');
const { createSettlement, getGroupSettlements, getSettlementById, completeSettlement } = require('../controllers/settlementController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware, async (req, res) => {
  createSettlement(req, res);
});

router.get('/group/:groupId', authMiddleware, async (req, res) => {
  getGroupSettlements(req, res);
});

router.get('/:settlementId', authMiddleware, async (req, res) => {
  getSettlementById(req, res);
});

router.patch('/:settlementId/complete', authMiddleware, async (req, res) => {
  completeSettlement(req, res);
});

module.exports = router;
