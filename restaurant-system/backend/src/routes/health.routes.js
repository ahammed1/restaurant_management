const router = require('express').Router();
const mongoose = require('mongoose');
router.get('/', (_req, res) => res.json({
  success: true,
  service: 'Aura Dining API',
  database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  timestamp: new Date().toISOString()
}));
module.exports = router;