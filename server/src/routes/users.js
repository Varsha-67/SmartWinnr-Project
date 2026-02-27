const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { auth, requireRole } = require('../middleware/auth');
const { ADMIN_EMAIL } = require('../config');

const router = express.Router();

router.get('/', auth(), requireRole('admin'), async (req, res) => {
  const users = await User.find({}, { passwordHash: 0 }).lean();
  const mapped = users.map(u => ({ id: u._id.toString(), email: u.email, role: u.role, status: u.status, createdAt: u.createdAt }));
  res.json({ users: mapped });
});

router.post('/', auth(), requireRole('admin'), async (req, res) => {
  const { email, password, role, status } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'email and password are required' });
  const exists = await User.findOne({ email }).lean();
  if (exists) return res.status(409).json({ error: 'Email already exists' });
  const passwordHash = bcrypt.hashSync(password, 10);
  const doc = await User.create({ email, passwordHash, role, status });
  res.status(201).json({ user: { id: doc._id.toString(), email: doc.email, role: doc.role, status: doc.status, createdAt: doc.createdAt } });
});

router.patch('/:id', auth(), requireRole('admin'), async (req, res) => {
  const { role, status } = req.body || {};
  const doc = await User.findByIdAndUpdate(req.params.id, { role, status }, { new: true }).lean();
  if (!doc) return res.status(404).json({ error: 'User not found' });
  res.json({ user: { id: doc._id.toString(), email: doc.email, role: doc.role, status: doc.status, createdAt: doc.createdAt } });
});

router.delete('/:id', auth(), requireRole('admin'), async (req, res) => {
  const doc = await User.findById(req.params.id).lean();
  if (!doc) return res.status(404).json({ error: 'User not found or cannot delete' });
  if (doc.email === ADMIN_EMAIL) return res.status(403).json({ error: 'Cannot delete seeded admin' });
  await User.deleteOne({ _id: req.params.id });
  res.status(204).send();
});

module.exports = router;
