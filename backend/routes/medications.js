const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Patient = require('../models/Patient');
const { protect } = require('../middleware/auth');
const memDb = require('../db');

// @route   POST /api/medications/:patientId
// @desc    Add a medication to a patient
// @access  Protected
router.post('/:patientId', protect, async (req, res) => {
  const isMongoConnected = mongoose.connection.readyState === 1;

  try {
    const { name, dosage, frequency, times, color, shape, purpose, sideEffects, instructions } = req.body;
    if (!name || !dosage || !frequency) {
      return res.status(400).json({ error: 'Name, dosage, and frequency are required' });
    }

    const newMed = {
      id: `med-${Date.now()}`,
      name,
      dosage,
      frequency,
      times: times || [],
      color: color || '#FFFFFF',
      shape: shape || 'round',
      purpose: purpose || '',
      sideEffects: sideEffects || [],
      instructions: instructions || ''
    };

    if (!isMongoConnected) {
        const patient = memDb.patients.find(p => p.id === req.params.patientId);
        if (!patient) return res.status(404).json({ error: 'Patient not found (Mock Mode)' });
        patient.medications.push(newMed);
        return res.status(201).json({ medication: newMed, patient });
    }

    const patient = await Patient.findOneAndUpdate(
      { id: req.params.patientId },
      { $push: { medications: newMed } },
      { new: true }
    );
    if (!patient) return res.status(404).json({ error: 'Patient not found' });

    res.status(201).json({ medication: newMed, patient });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   PUT /api/medications/:patientId/:medId
// @desc    Update a specific medication for a patient
// @access  Protected
router.put('/:patientId/:medId', protect, async (req, res) => {
  const isMongoConnected = mongoose.connection.readyState === 1;

  try {
    if (!isMongoConnected) {
        const patient = memDb.patients.find(p => p.id === req.params.patientId);
        if (!patient) return res.status(404).json({ error: 'Patient not found (Mock Mode)' });
        const medIndex = patient.medications.findIndex(m => m.id === req.params.medId);
        if (medIndex === -1) return res.status(404).json({ error: 'Medication not found' });
        
        const allowed = ['name', 'dosage', 'frequency', 'times', 'color', 'shape', 'purpose', 'sideEffects', 'instructions'];
        allowed.forEach(key => { if (req.body[key] !== undefined) patient.medications[medIndex][key] = req.body[key]; });
        return res.json({ medication: patient.medications[medIndex], patient });
    }

    const patient = await Patient.findOne({ id: req.params.patientId });
    if (!patient) return res.status(404).json({ error: 'Patient not found' });

    const medIndex = patient.medications.findIndex((m) => m.id === req.params.medId);
    if (medIndex === -1) return res.status(404).json({ error: 'Medication not found' });

    const allowed = ['name', 'dosage', 'frequency', 'times', 'color', 'shape', 'purpose', 'sideEffects', 'instructions'];
    allowed.forEach((key) => {
      if (req.body[key] !== undefined) {
        patient.medications[medIndex][key] = req.body[key];
      }
    });

    await patient.save();
    res.json({ medication: patient.medications[medIndex], patient });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   DELETE /api/medications/:patientId/:medId
// @desc    Remove a medication from a patient
// @access  Protected
router.delete('/:patientId/:medId', protect, async (req, res) => {
  const isMongoConnected = mongoose.connection.readyState === 1;

  try {
    if (!isMongoConnected) {
        const patient = memDb.patients.find(p => p.id === req.params.patientId);
        if (!patient) return res.status(404).json({ error: 'Patient not found (Mock Mode)' });
        patient.medications = patient.medications.filter(m => m.id !== req.params.medId);
        return res.json({ message: 'Medication removed', patient });
    }

    const patient = await Patient.findOneAndUpdate(
      { id: req.params.patientId },
      { $pull: { medications: { id: req.params.medId } } },
      { new: true }
    );
    if (!patient) return res.status(404).json({ error: 'Patient not found' });
    res.json({ message: 'Medication removed', patient });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
