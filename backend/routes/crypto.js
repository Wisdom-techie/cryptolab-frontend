const express = require('express');
const router = express.Router();
const {
  getLivePrices,
  getSinglePrice,
  getMarketOverview
} = require('../controllers/cryptoController');

// @route   GET /api/crypto/prices
// @desc    Get live prices for all cryptos
// @access  Public
router.get('/prices', getLivePrices);

// @route   GET /api/crypto/price/:symbol
// @desc    Get single crypto price
// @access  Public
router.get('/price/:symbol', getSinglePrice);

// @route   GET /api/crypto/markets
// @desc    Get market overview
// @access  Public
router.get('/markets', getMarketOverview);

module.exports = router;

