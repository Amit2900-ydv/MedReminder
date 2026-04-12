const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const Patient = require('../models/Patient');
const Caretaker = require('../models/Caretaker');
const { protect } = require('../middleware/auth');
const memDb = require('../db');

// Helper: sign a JWT
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '30d' });

// @route   POST /api/auth/register
// @desc    Register new user + create patient/caretaker profile
// @access  Public
router.post('/register', async (req, res) => {
  const isMongoConnected = mongoose.connection.readyState === 1;

  try {
    const { email, password, name, type, phone, age, avatar } = req.body;

    if (!email || !password || !name || !type) {
      return res.status(400).json({ error: 'Email, password, name, and type are required' });
    }

    if (!isMongoConnected) {
        // Mock register logic
        const user = { 
            id: `u${Date.now()}`, 
            email, 
            type, 
            name, 
            patientId: type === 'patient' ? `p${Date.now()}` : undefined,
            caretakerId: type === 'caretaker' ? `c${Date.now()}` : undefined
        };
        const token = signToken(user.id);
        return res.status(201).json({ token, user });
    }

    if (!['patient', 'caretaker'].includes(type)) {
      return res.status(400).json({ error: 'Type must be patient or caretaker' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check duplicate email
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const timestamp = Date.now();
    let profileId;

    if (type === 'patient') {
      profileId = `p${timestamp}`;
      const patient = new Patient({
        id: profileId,
        name,
        email: email.toLowerCase(),
        phone: phone || '',
        age: age || 0,
        avatar: avatar || '👤',
        medications: [],
        logs: [],
        adherenceScore: 100,
        missedMedsCount: 0
      });
      await patient.save();
    } else {
      profileId = `c${timestamp}`;
      const caretaker = new Caretaker({
        id: profileId,
        name,
        email: email.toLowerCase(),
        role: 'Caretaker',
        phone: phone || '',
        avatar: avatar || '👤',
        patientIds: []
      });
      await caretaker.save();
    }

    const user = new User({
      email: email.toLowerCase(),
      passwordHash: password,
      name,
      type,
      ...(type === 'patient' ? { patientId: profileId } : { caretakerId: profileId })
    });
    await user.save();

    const token = signToken(user._id);
    res.status(201).json({
      token,
      user: user.toSafeObject()
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: err.message || 'Server error during registration' });
  }
});

// @route   POST /api/auth/login
// @desc    Login and return JWT
// @access  Public
router.post('/login', async (req, res) => {
  const isMongoConnected = mongoose.connection.readyState === 1;

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (!isMongoConnected) {
      const user = memDb.users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
      if (!user) return res.status(401).json({ error: 'Invalid email or password (Mock Mode)' });
      
      const token = signToken(user.id);
      return res.json({ token, user });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = signToken(user._id);
    res.json({
      token,
      user: user.toSafeObject()
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// @route   GET /api/auth/me
// @desc    Get current logged-in user
// @access  Protected
router.get('/me', protect, async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
        // Mock me logic
        return res.json({ user: req.user });
    }
    res.json({ user: req.user.toSafeObject() });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PUT /api/auth/me
// @desc    Update current user's profile
// @access  Protected
router.put('/me', protect, async (req, res) => {
  try {
    const { name, phone } = req.body;
    
    if (mongoose.connection.readyState !== 1) {
        // Mock update logic
        if (name) req.user.name = name;
        return res.json({ user: req.user });
    }

    const updates = {};
    if (name) updates.name = name;
    if (phone) updates.phone = phone;

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-passwordHash');
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
