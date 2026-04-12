const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const memDb = require('../db');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ error: 'Not authorized – no token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (mongoose.connection.readyState !== 1) {
        // Mock fallback logic
        const user = memDb.users.find(u => u.id === decoded.id);
        if (!user) {
            return res.status(401).json({ error: 'User not found (Mock Mode)' });
        }
        req.user = user;
        return next();
    }

    // Attach user (without passwordHash) to request
    req.user = await User.findById(decoded.id).select('-passwordHash');
    if (!req.user) {
      return res.status(401).json({ error: 'User not found' });
    }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token is invalid or expired' });
  }
};

// Only allow caretakers
const caretakerOnly = (req, res, next) => {
  if (req.user && req.user.type === 'caretaker') return next();
  return res.status(403).json({ error: 'Access denied – caretakers only' });
};

// Only allow patients
const patientOnly = (req, res, next) => {
  if (req.user && req.user.type === 'patient') return next();
  return res.status(403).json({ error: 'Access denied – patients only' });
};

module.exports = { protect, caretakerOnly, patientOnly };
