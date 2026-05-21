const router  = require('express').Router();
const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');
const { auth, adminOnly } = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads/videos');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `video_${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 200 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) cb(null, true);
    else cb(new Error('Video files only'));
  },
});

let videoData = { type: null, src: null };

router.get('/', (req, res) => res.json(videoData));

router.post('/', auth, adminOnly, (req, res) => {
  const { type, src } = req.body;
  if (!src) return res.status(400).json({ message: 'src required' });
  videoData = { type: type || 'url', src };
  res.json(videoData);
});

router.post('/upload', auth, adminOnly, upload.single('video'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file' });
  const src = `/uploads/videos/${req.file.filename}`;
  videoData = { type: 'upload', src };
  res.json(videoData);
});

router.delete('/', auth, adminOnly, (req, res) => {
  if (videoData.type === 'upload' && videoData.src) {
    fs.unlink(path.join(__dirname, '..', videoData.src), () => {});
  }
  videoData = { type: null, src: null };
  res.json({ message: 'Removed' });
});

module.exports = router;
