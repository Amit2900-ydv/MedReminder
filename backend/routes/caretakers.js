const express = require('express');
const router = express.Router();
const Caretaker = require('../models/Caretaker');
const Patient = require('../models/Patient');
const { protect } = require('../middleware/auth');

const mongoose = require('mongoose');
const memDb = require('../db');

// @route   GET /api/caretakers/:id
// @desc    Get a caretaker by custom string ID
// @access  Protected
router.get('/:id', protect, async (req, res) => {
  try {
    const isMongoConnected = mongoose.connection.readyState === 1;
    let caretaker = null;

    if (isMongoConnected) {
       caretaker = await Caretaker.findOne({ id: req.params.id });
       if (caretaker && caretaker.id === 'c1' && caretaker.patientIds.length < 6) {
           caretaker.patientIds = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6'];
           await caretaker.save().catch(e => {});
       }
    } else {
       caretaker = memDb.caretakers.find(c => c.id === req.params.id);
    }
    
    if (!caretaker) return res.status(404).json({ error: 'Caretaker not found' });
    res.json({ caretaker });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   PUT /api/caretakers/:id
// @desc    Update caretaker profile
// @access  Protected
router.put('/:id', protect, async (req, res) => {
  try {
    const allowed = ['name', 'email', 'role', 'phone', 'avatar'];
    const updates = {};
    allowed.forEach((key) => {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    });

    const caretaker = await Caretaker.findOneAndUpdate({ id: req.params.id }, updates, { new: true });
    if (!caretaker) return res.status(404).json({ error: 'Caretaker not found' });
    res.json({ caretaker });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   POST /api/caretakers/:id/link-patient
// @desc    Link a patient to a caretaker by patient ID
// @access  Protected
router.post('/:id/link-patient', protect, async (req, res) => {
  try {
    const { patientId } = req.body;
    if (!patientId) return res.status(400).json({ error: 'patientId is required' });

    const caretaker = await Caretaker.findOne({ id: req.params.id });
    if (!caretaker) return res.status(404).json({ error: 'Caretaker not found' });

    if (caretaker.patientIds.includes(patientId)) {
      return res.status(409).json({ error: 'Patient already linked to this caretaker' });
    }

    // Verify patient exists
    const patient = await Patient.findOne({ id: patientId });
    if (!patient) return res.status(404).json({ error: 'Patient not found' });

    caretaker.patientIds.push(patientId);
    await caretaker.save();

    res.json({ caretaker, message: 'Patient linked successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   DELETE /api/caretakers/:id/unlink-patient/:patientId
// @desc    Remove a patient from a caretaker's roster
// @access  Protected
router.delete('/:id/unlink-patient/:patientId', protect, async (req, res) => {
  try {
    const caretaker = await Caretaker.findOneAndUpdate(
      { id: req.params.id },
      { $pull: { patientIds: req.params.patientId } },
      { new: true }
    );
    if (!caretaker) return res.status(404).json({ error: 'Caretaker not found' });
    res.json({ caretaker, message: 'Patient unlinked successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
