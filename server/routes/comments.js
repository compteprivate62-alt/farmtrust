const router = require('express').Router();
const { Comment } = require('../models');
const { auth, adminOnly } = require('../middleware/auth');

// GET recent 5 comments (public - for landing page)
router.get('/recent', async (req, res) => {
  try {
    const comments = await Comment.find()
      .populate('user_id', 'name')
      .populate('animal_id', 'name type')
      .sort({ createdAt: -1 })
      .limit(5);
    res.json(comments);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET comments for animal
router.get('/:animalId', async (req, res) => {
  try {
    const comments = await Comment.find({ animal_id: req.params.animalId })
      .populate('user_id', 'name avatar')
      .sort({ createdAt: -1 });
    res.json(comments);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST add comment (auth required)
router.post('/', auth, async (req, res) => {
  try {
    const comment = await Comment.create({ user_id: req.user.id, ...req.body });
    const populated = await Comment.findById(comment._id).populate('user_id', 'name');
    res.status(201).json(populated);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE comment (owner or admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Not found' });
    if (comment.user_id.toString() !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Forbidden' });
    await comment.deleteOne();
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
