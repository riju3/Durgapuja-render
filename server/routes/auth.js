import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

const generateToken = (user) =>
  jwt.sign({ id: user._id, role: user.role, name: user.name, email: user.email },
    process.env.JWT_SECRET, { expiresIn: '7d' });

// Register - DISABLED (admin-only system)
router.post('/register', async (req, res) => {
  return res.status(403).json({ message: 'Registration is not allowed.' });
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: 'Invalid credentials' });
    res.json({ token: generateToken(user), user: { id: user._id, name: user.name, email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get me
router.get('/me', protect, async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  res.json(user);
});

// Seed admin (run once) - works via GET or POST for easy browser access
router.get('/seed-admin', async (req, res) => {
  try {
    const exists = await User.findOne({ role: 'admin' });
    if (exists) return res.json({ message: 'Admin already exists', email: exists.email });
    const admin = await User.create({
      name: 'Admin',
      email: process.env.ADMIN_EMAIL || 'admin@durgapuja.com',
      password: process.env.ADMIN_PASSWORD || 'Admin@1234',
      role: 'admin'
    });
    res.json({ message: '✅ Admin created successfully!', email: admin.email, password: process.env.ADMIN_PASSWORD || 'Admin@1234' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/seed-admin', async (req, res) => {
  try {
    const exists = await User.findOne({ role: 'admin' });
    if (exists) return res.json({ message: 'Admin already exists' });
    const admin = await User.create({
      name: 'Admin',
      email: process.env.ADMIN_EMAIL || 'admin@durgapuja.com',
      password: process.env.ADMIN_PASSWORD || 'Admin@1234',
      role: 'admin'
    });
    res.json({ message: 'Admin created', email: admin.email });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create new admin (existing admin only)
router.post('/create-admin', protect, adminOnly, async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'Name, email and password are required.' });
    if (password.length < 6)
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    const exists = await User.findOne({ email });
    if (exists)
      return res.status(409).json({ message: 'An account with this email already exists.' });
    const admin = await User.create({ name, email, password, role: 'admin' });
    res.status(201).json({ message: '✅ New admin created successfully!', admin: { id: admin._id, name: admin.name, email: admin.email, role: admin.role, createdAt: admin.createdAt } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// List all admins (existing admin only)
router.get('/admins', protect, adminOnly, async (req, res) => {
  try {
    const admins = await User.find({ role: 'admin' }).select('-password').sort({ createdAt: -1 });
    res.json(admins);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete an admin by ID (existing admin only, cannot delete yourself)
router.delete('/admins/:id', protect, adminOnly, async (req, res) => {
  try {
    if (req.params.id === req.user.id)
      return res.status(400).json({ message: 'You cannot delete your own account.' });
    const admin = await User.findByIdAndDelete(req.params.id);
    if (!admin) return res.status(404).json({ message: 'Admin not found.' });
    res.json({ message: '✅ Admin removed successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;

