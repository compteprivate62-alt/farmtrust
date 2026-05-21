// server/routes/stats.js
const router = require('express').Router();
const { Animal, Order, User, Comment } = require('../models');

router.get('/', async (req, res) => {
  try {
    const [animals, orders, clients] = await Promise.all([
      Animal.countDocuments(),
      Order.countDocuments(),
      User.countDocuments({ role: 'client' }),
    ]);
    res.json({ animals, orders, clients, farmers: Math.max(1, Math.floor(animals / 4)) });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
