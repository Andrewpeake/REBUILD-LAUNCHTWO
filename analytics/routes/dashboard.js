const express = require('express');
const router = express.Router();
const path = require('path');

// Serve dashboard HTML
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/enhanced-dashboard.html'));
});

// Serve original dashboard
router.get('/basic', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/dashboard.html'));
});

// Serve dashboard assets
router.use('/assets', express.static(path.join(__dirname, '../public/assets')));

module.exports = router;

