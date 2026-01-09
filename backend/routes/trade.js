const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

router.post('/order', protect, (req, res) => {
  res.json({ message: 'Trade order endpoint' });
});

module.exports = router;