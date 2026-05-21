const router  = require('express').Router();
const multer  = require('multer');
const { Animal, AnimalLog } = require('../models');
const { auth, adminOnly }   = require('../middleware/auth');

// 20MB limit - no disk needed
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Images only'));
  },
});

// Convert to base64 - resize if sharp available
const toBase64 = async (files) => {
  if (!files || files.length === 0) return [];
  let sharp = null;
  try { sharp = require('sharp'); } catch {}
  const results = [];
  for (const f of files) {
    try {
      if (sharp) {
        const buf = await sharp(f.buffer)
          .resize(600, 600, { fit:'inside', withoutEnlargement:true })
          .jpeg({ quality: 70 })
          .toBuffer();
        results.push('data:image/jpeg;base64,' + buf.toString('base64'));
      } else {
        results.push('data:' + f.mimetype + ';base64,' + f.buffer.toString('base64'));
      }
    } catch {
      results.push('data:' + f.mimetype + ';base64,' + f.buffer.toString('base64'));
    }
  }
  return results;
};

// GET all - no sort to avoid memory limit
router.get('/', async (req, res) => {
  try {
    const { type, status } = req.query;
    const filter = {};
    if (type)   filter.type = type;
    if (status) filter.status = status;
    // Use _id sort instead of createdAt to avoid memory issues
    const animals = await Animal.find(filter)
      .select('name type status for_sale sale_price sale_age sale_weight description birth_date images')
      .sort({ _id: -1 })
      .limit(50);
    res.json(animals);
  } catch (err) {
    console.error('GET /animals:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// GET single
router.get('/:id', async (req, res) => {
  try {
    const animal = await Animal.findById(req.params.id);
    if (!animal) return res.status(404).json({ message: 'Not found' });
    res.json(animal);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create
router.post('/', auth, adminOnly, upload.array('images', 5), async (req, res) => {
  try {
    const images = await toBase64(req.files);
    const animal = await Animal.create({ ...req.body, images });
    res.status(201).json(animal);
  } catch (err) {
    console.error('POST /animals:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// PUT update
router.put('/:id', auth, adminOnly, upload.array('images', 5), async (req, res) => {
  try {
    const update = { ...req.body };
    if (req.files?.length) {
      update.images = await toBase64(req.files);
    }
    const animal = await Animal.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json(animal);
  } catch (err) {
    console.error('PUT /animals:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// DELETE
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    await Animal.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// LOGS
router.get('/:id/logs', auth, async (req, res) => {
  try {
    const logs = await AnimalLog.find({ animal_id: req.params.id }).sort({ _id: -1 });
    res.json(logs);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/:id/logs', auth, adminOnly, async (req, res) => {
  try {
    const log = await AnimalLog.create({ animal_id: req.params.id, ...req.body });
    res.status(201).json(log);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
