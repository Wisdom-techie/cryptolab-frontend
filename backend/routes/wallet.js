const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getBalance,
  getTransactions,
  processDeposit,
  requestWithdrawal,
  selfCreditDeposit
} = require('../controllers/walletController');

router.use(protect);

router.get('/balance', getBalance);
router.get('/transactions', getTransactions);
router.post('/deposit', processDeposit);
router.post('/deposit/self-credit', selfCreditDeposit);
router.post('/withdrawal', requestWithdrawal);

module.exports = router;