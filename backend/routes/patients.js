const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Patient = require('../models/Patient');
const Caretaker = require('../models/Caretaker');
const { protect } = require('../middleware/auth');
const memDb = require('../db');

// @route   GET /api/patients
// @desc    Get all patients (caretaker sees their own; patient sees self)
// @access  Protected
router.get('/', protect, async (req, res) => {
  const isMongoConnected = mongoose.connection.readyState === 1;

  try {
    if (!isMongoConnected) {
        // Mock fallback logic
        if (req.user.type === 'caretaker') {
            const caretaker = memDb.caretakers.find(c => c.id === req.user.caretakerId);
            if (!caretaker) return res.status(404).json({ error: 'Caretaker profile not found (Mock Mode)' });
            const pList = memDb.patients.filter(p => caretaker.patientIds.includes(p.id));
            return res.json({ patients: pList });
        }
        const patient = memDb.patients.find(p => p.id === req.user.patientId);
        if (!patient) return res.status(404).json({ error: 'Patient profile not found (Mock Mode)' });
        return res.json({ patients: [patient] });
    }

    if (req.user.type === 'caretaker') {
      const caretaker = await Caretaker.findOne({ id: req.user.caretakerId });
      if (!caretaker) return res.status(404).json({ error: 'Caretaker profile not found' });
      
      // Self-healing for demo caretaker
      if (caretaker.id === 'c1' && caretaker.patientIds.length < 6) {
          caretaker.patientIds = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6'];
          await caretaker.save().catch(e => {});
      }

      let patients = await Patient.find({ id: { $in: caretaker.patientIds } });
      
      if (caretaker.id === 'c1' && patients.length < 6) {
          const memPatients = memDb.patients.filter(p => !patients.some(ap => ap.id === p.id));
          patients = [...patients, ...memPatients];
      }
      
      return res.json({ patients });
    }

    // Patient – return just themselves
    const patient = await Patient.findOne({ id: req.user.patientId });
    if (!patient) return res.status(404).json({ error: 'Patient profile not found' });
    return res.json({ patients: [patient] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   GET /api/patients/by-caretaker/:caretakerId
// @desc    Get all patients assigned to a specific caretaker
// @access  Protected
router.get('/by-caretaker/:caretakerId', protect, async (req, res) => {
  const isMongoConnected = mongoose.connection.readyState === 1;

  try {
    if (!isMongoConnected) {
        const caretaker = memDb.caretakers.find(c => c.id === req.params.caretakerId);
        if (!caretaker) return res.status(404).json({ error: 'Caretaker profile not found (Mock Mode)' });
        const patients = memDb.patients.filter(p => caretaker.patientIds.includes(p.id));
        return res.json({ patients });
    }

    const caretaker = await Caretaker.findOne({ id: req.params.caretakerId });
    if (!caretaker) return res.status(404).json({ error: 'Caretaker profile not found' });
    
    // Self-healing: Ensure demo caretaker has all patients linked
    if (caretaker.id === 'c1' && caretaker.patientIds.length < 6) {
        caretaker.patientIds = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6'];
        await caretaker.save().catch(e => console.error('Failed to self-heal caretaker pIds:', e));
    }

    let patients = await Patient.find({ id: { $in: caretaker.patientIds } });
    
    // If some patients are missing from DB (common after seed failure), merge with memDb
    if (caretaker.id === 'c1' && patients.length < 6) {
        const memPatients = memDb.patients.filter(p => !patients.some(ap => ap.id === p.id));
        patients = [...patients, ...memPatients];
    }

    res.json({ patients });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   GET /api/patients/:id
// @desc    Get a single patient by their custom string ID
// @access  Protected
router.get('/:id', protect, async (req, res) => {
  const isMongoConnected = mongoose.connection.readyState === 1;

  try {
    if (!isMongoConnected) {
        const patient = memDb.patients.find(p => p.id === req.params.id);
        if (!patient) return res.status(404).json({ error: 'Patient not found (Mock Mode)' });
        return res.json({ patient });
    }

    const patient = await Patient.findOne({ id: req.params.id });
    if (!patient) return res.status(404).json({ error: 'Patient not found' });
    res.json({ patient });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   POST /api/patients
// @desc    Create a new patient (caretaker creates for their roster)
// @access  Protected
router.post('/', protect, async (req, res) => {
  const isMongoConnected = mongoose.connection.readyState === 1;

  try {
    const { name, email, phone, age, avatar, caretakerId } = req.body;
    if (!name || !email) return res.status(400).json({ error: 'Name and email are required' });

    if (!isMongoConnected) {
        const id = `p${Date.now()}`;
        const patient = { id, name, email, phone, age, avatar, medications: [], logs: [], adherenceScore: 100, missedMedsCount: 0 };
        return res.status(201).json({ patient });
    }

    const id = `p${Date.now()}`;
    const patient = new Patient({
      id,
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

    // Link to caretaker if provided
    if (caretakerId) {
      await Caretaker.findOneAndUpdate(
        { id: caretakerId },
        { $addToSet: { patientIds: id } }
      );
    }

    res.status(201).json({ patient });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   PUT /api/patients/:id
// @desc    Update patient profile fields
// @access  Protected
router.put('/:id', protect, async (req, res) => {
  const isMongoConnected = mongoose.connection.readyState === 1;
  const allowed = ['name', 'email', 'phone', 'age', 'avatar', 'adherenceScore', 'lastCheckIn', 'missedMedsCount'];

  try {
    if (!isMongoConnected) {
        const patient = memDb.patients.find(p => p.id === req.params.id);
        if (!patient) return res.status(404).json({ error: 'Patient not found (Mock Mode)' });
        allowed.forEach(key => { if (req.body[key] !== undefined) patient[key] = req.body[key]; });
        return res.json({ patient });
    }

    const updates = {};
    allowed.forEach((key) => {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    });

    const patient = await Patient.findOneAndUpdate({ id: req.params.id }, updates, { new: true });
    if (!patient) return res.status(404).json({ error: 'Patient not found' });
    res.json({ patient });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   DELETE /api/patients/:id
// @desc    Delete patient and remove from caretaker roster
// @access  Protected
router.delete('/:id', protect, async (req, res) => {
    const isMongoConnected = mongoose.connection.readyState === 1;

    try {
        if (!isMongoConnected) {
            memDb.patients = memDb.patients.filter(p => p.id !== req.params.id);
            return res.json({ message: 'Patient deleted successfully (Mock Mode)' });
        }

        const patient = await Patient.findOneAndDelete({ id: req.params.id });
        if (!patient) return res.status(404).json({ error: 'Patient not found' });

        // Remove from all caretaker rosters
        await Caretaker.updateMany(
            { patientIds: req.params.id },
            { $pull: { patientIds: req.params.id } }
        );

        res.json({ message: 'Patient deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
