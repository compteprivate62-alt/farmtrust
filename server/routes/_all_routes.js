// ─────────────────────────────────────────────
//  products.js
// ─────────────────────────────────────────────
const router1 = require('express').Router();
const { Product, Promotion } = require('../models');
const { auth, adminOnly } = require('../middleware/auth');

router1.get('/', async (req, res) => {
  try {
    const products = await Product.find().populate('animal_id', 'name type');
    // attach active promotion to each product
    const now = new Date();
    const promos = await Promotion.find({ active: true, start_date: { $lte: now }, end_date: { $gte: now } });
    const promoMap = {};
    promos.forEach(p => promoMap[p.product_id.toString()] = p);
    const result = products.map(p => {
      const obj = p.toObject();
      const promo = promoMap[p._id.toString()];
      if (promo) {
        obj.discount = promo.discount_percentage;
        obj.final_price = +(p.price * (1 - promo.discount_percentage / 100)).toFixed(2);
      }
      return obj;
    });
    res.json(result);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router1.get('/:id', async (req, res) => {
  const p = await Product.findById(req.params.id).populate('animal_id');
  res.json(p);
});

router1.post('/', auth, adminOnly, async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router1.put('/:id', auth, adminOnly, async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(product);
});

router1.delete('/:id', auth, adminOnly, async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

module.exports.productsRouter = router1;

// ─────────────────────────────────────────────
//  orders.js
// ─────────────────────────────────────────────
const router2 = require('express').Router();
const { Order, Notification, Animal } = require('../models');
// Note: Notification reused below in router7 via same variable — no redeclare needed

router2.get('/', auth, async (req, res) => {
  const filter = req.user.role === 'admin' ? {} : { user_id: req.user.id };
  const orders = await Order.find(filter).populate('user_id', 'name email').sort({ createdAt: -1 });
  res.json(orders);
});

router2.post('/', auth, async (req, res) => {
  try {
    const order = await Order.create({ user_id: req.user.id, ...req.body });
    // mark animal as sold if applicable
    for (const item of order.items) {
      if (item.item_type === 'animal' && item.animal_id) {
        await Animal.findByIdAndUpdate(item.animal_id, { status: 'sold', for_sale: false });
      }
    }
    // notify user
    await Notification.create({ user_id: req.user.id, type: 'order', text: `Your order #${order._id} was placed successfully!` });
    res.status(201).json(order);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router2.put('/:id/status', auth, adminOnly, async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    await Notification.create({ user_id: order.user_id, type: 'order', text: `Your order #${order._id} is now ${req.body.status}.` });
    res.json(order);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports.ordersRouter = router2;

// ─────────────────────────────────────────────
//  cart.js  (in-memory per user via JWT, stored client-side; server just validates)
// ─────────────────────────────────────────────
const router3 = require('express').Router();
// Cart is managed client-side in localStorage / React state.
// This endpoint validates items and returns updated prices.
router3.post('/validate', auth, async (req, res) => {
  try {
    const { items } = req.body; // [{ product_id, quantity }]
    const validated = [];
    for (const item of items) {
      const p = await Product.findById(item.product_id);
      if (!p) continue;
      const now = new Date();
      const promo = await Promotion.findOne({ product_id: p._id, active: true, start_date: { $lte: now }, end_date: { $gte: now } });
      const final_price = promo ? +(p.price * (1 - promo.discount_percentage / 100)).toFixed(2) : p.price;
      validated.push({ ...item, name: p.name, price: p.price, final_price, unit: p.unit });
    }
    res.json(validated);
  } catch (err) { res.status(500).json({ message: err.message }); }
});
module.exports.cartRouter = router3;

// ─────────────────────────────────────────────
//  comments.js
// ─────────────────────────────────────────────
const router4 = require('express').Router();
const { Comment } = require('../models');

router4.get('/:animalId', async (req, res) => {
  const comments = await Comment.find({ animal_id: req.params.animalId }).populate('user_id', 'name avatar').sort({ createdAt: -1 });
  res.json(comments);
});

router4.post('/', auth, async (req, res) => {
  try {
    const comment = await Comment.create({ user_id: req.user.id, ...req.body });
    res.status(201).json(comment);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router4.delete('/:id', auth, async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) return res.status(404).json({ message: 'Not found' });
  if (comment.user_id.toString() !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  await comment.deleteOne();
  res.json({ message: 'Deleted' });
});
module.exports.commentsRouter = router4;

// ─────────────────────────────────────────────
//  messages.js
// ─────────────────────────────────────────────
const router5 = require('express').Router();
const { Message } = require('../models');

// user: get own conversation
router5.get('/my', auth, async (req, res) => {
  const msgs = await Message.find({ user_id: req.user.id }).sort({ createdAt: 1 });
  res.json(msgs);
});

// admin: get all conversations grouped by user
router5.get('/all', auth, adminOnly, async (req, res) => {
  const msgs = await Message.find().populate('user_id', 'name email').sort({ createdAt: -1 });
  res.json(msgs);
});

// admin: get conversation with specific user
router5.get('/user/:userId', auth, adminOnly, async (req, res) => {
  const msgs = await Message.find({ user_id: req.params.userId }).sort({ createdAt: 1 });
  res.json(msgs);
});

router5.post('/', auth, async (req, res) => {
  try {
    const msg = await Message.create({
      user_id: req.user.role === 'admin' ? req.body.user_id : req.user.id,
      text: req.body.text,
      sender: req.user.role
    });
    res.status(201).json(msg);
  } catch (err) { res.status(500).json({ message: err.message }); }
});
module.exports.messagesRouter = router5;

// ─────────────────────────────────────────────
//  promotions.js
// ─────────────────────────────────────────────
const router6 = require('express').Router();

router6.get('/', async (req, res) => {
  const now = new Date();
  const promos = await Promotion.find({ active: true, start_date: { $lte: now }, end_date: { $gte: now } }).populate('product_id');
  res.json(promos);
});

router6.post('/', auth, adminOnly, async (req, res) => {
  try {
    const promo = await Promotion.create(req.body);
    res.status(201).json(promo);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router6.delete('/:id', auth, adminOnly, async (req, res) => {
  await Promotion.findByIdAndUpdate(req.params.id, { active: false });
  res.json({ message: 'Deactivated' });
});
module.exports.promotionsRouter = router6;

// ─────────────────────────────────────────────
//  notifications.js
// ─────────────────────────────────────────────
const router7 = require('express').Router();
// Notification already declared above (line 57)

router7.get('/', auth, async (req, res) => {
  const notifs = await Notification.find({ user_id: req.user.id }).sort({ createdAt: -1 }).limit(30);
  res.json(notifs);
});

router7.put('/read-all', auth, async (req, res) => {
  await Notification.updateMany({ user_id: req.user.id }, { read: true });
  res.json({ message: 'All read' });
});
module.exports.notificationsRouter = router7;

// ─────────────────────────────────────────────
//  logs.js  (standalone route — separate from animals/:id/logs for admin panel)
// ─────────────────────────────────────────────
const router8 = require('express').Router();
const { AnimalLog } = require('../models');

router8.get('/', auth, adminOnly, async (req, res) => {
  const { animal_id, type } = req.query;
  const filter = {};
  if (animal_id) filter.animal_id = animal_id;
  if (type) filter.type = type;
  const logs = await AnimalLog.find(filter).populate('animal_id', 'name type').sort({ date: -1 });
  res.json(logs);
});
module.exports.logsRouter = router8;
