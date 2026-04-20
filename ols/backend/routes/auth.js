const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

// POST /api/auth/admin-login
router.post('/admin-login', async (req, res) => {
  const { secretKey } = req.body;

  if (!secretKey) {
    return res.status(400).json({ message: 'Secret key is required.' });
  }

  try {
    const adminUser = await Admin.findOne({ secretKey: secretKey });
    
    if (!adminUser) {
      return res.status(401).json({ message: 'Invalid authentication key.' });
    }

    const token = jwt.sign(
      { role: 'admin', timestamp: Date.now() },
      "dhakshitha_jwt_super_secret_2024",
      { expiresIn: '24h' }
    );

    res.json({ token, message: 'Login successful.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error during authentication.' });
  }
});

// POST /api/auth/verify
router.post('/verify', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ valid: false });

  try {
    jwt.verify(token, "dhakshitha_jwt_super_secret_2024");
    res.json({ valid: true });
  } catch {
    res.json({ valid: false });
  }
});

// POST /api/auth/change-key
router.post('/change-key', async (req, res) => {
  const { oldKey, newKey } = req.body;
  
  if (!oldKey || !newKey) {
    return res.status(400).json({ message: 'Both old and new keys are required.' });
  }

  try {
    const adminUser = await Admin.findOne({ secretKey: oldKey });
    
    if (!adminUser) {
      return res.status(401).json({ message: 'The old secret key is incorrect.' });
    }

    adminUser.secretKey = newKey;
    await adminUser.save();

    res.json({ success: true, message: 'Authentication key updated successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Server error while updating key.' });
  }
});

// POST /api/auth/add-admin (Protected)
router.post('/add-admin', async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Authentication required.' });

  try {
    jwt.verify(token, "dhakshitha_jwt_super_secret_2024");
    
    const { newSecretKey } = req.body;
    if (!newSecretKey) return res.status(400).json({ message: 'New secret key is required.' });

    const exists = await Admin.findOne({ secretKey: newSecretKey });
    if (exists) return res.status(400).json({ message: 'This secret key is already in use.' });

    const newAdmin = new Admin({ secretKey: newSecretKey });
    await newAdmin.save();

    res.json({ success: true, message: 'New admin added successfully!' });
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired session.' });
  }
});

// GET /api/auth/admins (Protected)
router.get('/admins', async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Auth required.' });

  try {
    jwt.verify(token, "dhakshitha_jwt_super_secret_2024");
    const admins = await Admin.find({}, 'secretKey');
    res.json(admins);
  } catch {
    res.status(401).json({ message: 'Invalid token.' });
  }
});

module.exports = router;
