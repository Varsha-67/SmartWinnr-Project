const express = require('express');
const store = require('../store/memory');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.get('/summary', auth(false), (req, res) => {
  res.json(store.getSummary());
});

router.get('/timeseries', auth(false), (req, res) => {
  res.json({ points: store.getTimeseries() });
});

module.exports = router;
