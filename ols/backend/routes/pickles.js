const express = require('express');
const router = express.Router();
const Pickle = require('../models/Pickle');
const { protect } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Multer setup for image uploads
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    if (ext) cb(null, true);
    else cb(new Error('Only images allowed'));
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// GET /api/pickles - public: get all pickles
router.get('/', async (req, res) => {
  try {
    const { category, bestseller } = req.query;
    const filter = {};
    if (category && category !== 'all') filter.category = category;
    if (bestseller === 'true') filter.isBestseller = true;

    const pickles = await Pickle.find(filter).sort({ createdAt: -1 });
    res.json(pickles);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/pickles/:id - public: get single pickle
router.get('/:id', async (req, res) => {
  try {
    const pickle = await Pickle.findById(req.params.id);
    if (!pickle) return res.status(404).json({ message: 'Pickle not found' });
    res.json(pickle);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/pickles - admin: add new pickle
router.post('/', protect, upload.single('image'), async (req, res) => {
  try {
    const { name, description, category, price250g, price500g, price1kg, stockInKg, spiceLevel, inStock, isBestseller, ingredients, tags } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : (req.body.imageUrl || '');

    const computedInStock = (Number(stockInKg) > 0);

    const pickle = new Pickle({
      name, description, category,
      price250g: Number(price250g),
      price500g: Number(price500g),
      price1kg: Number(price1kg),
      stockInKg: Number(stockInKg) || 0,
      spiceLevel, inStock: computedInStock,
      isBestseller: isBestseller === 'true' || isBestseller === true,
      ingredients,
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim())) : [],
      imageUrl
    });

    const saved = await pickle.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: 'Error adding pickle', error: err.message });
  }
});

// PUT /api/pickles/:id - admin: update pickle
router.put('/:id', protect, upload.single('image'), async (req, res) => {
  try {
    const { name, description, category, price250g, price500g, price1kg, stockInKg, spiceLevel, inStock, isBestseller, ingredients, tags } = req.body;

    const existing = await Pickle.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Pickle not found' });

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : (req.body.imageUrl || existing.imageUrl);
    
    const computedStock = stockInKg !== undefined ? Number(stockInKg) : existing.stockInKg;
    const computedInStock = (computedStock > 0);

    const updated = await Pickle.findByIdAndUpdate(
      req.params.id,
      {
        name, description, category,
        price250g: Number(price250g),
        price500g: Number(price500g),
        price1kg: Number(price1kg),
        stockInKg: computedStock,
        spiceLevel,
        inStock: computedInStock,
        isBestseller: isBestseller === 'true' || isBestseller === true,
        ingredients,
        tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim())) : [],
        imageUrl
      },
      { returnDocument: 'after', runValidators: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: 'Error updating pickle', error: err.message });
  }
});

// DELETE /api/pickles/:id - admin: delete pickle
router.delete('/:id', protect, async (req, res) => {
  try {
    const pickle = await Pickle.findByIdAndDelete(req.params.id);
    if (!pickle) return res.status(404).json({ message: 'Pickle not found' });
    res.json({ message: 'Pickle deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
