const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Patient = require('../models/Patient');
const { protect } = require('../middleware/auth');
const memDb = require('../db');

// @route   GET /api/logs/:patientId
// @desc    Get all medication logs for a patient
// @access  Protected
router.get('/:patientId', protect, async (req, res) => {
  const isMongoConnected = mongoose.connection.readyState === 1;

  try {
    let logs = [];
    if (!isMongoConnected) {
        const patient = memDb.patients.find(p => p.id === req.params.patientId);
        if (!patient) return res.status(404).json({ error: 'Patient not found (Mock Mode)' });
        logs = patient.logs;
    } else {
        const patient = await Patient.findOne({ id: req.params.patientId });
        if (!patient) return res.status(404).json({ error: 'Patient not found' });
        logs = patient.logs;
    }

    // Optional date filter
    if (req.query.date) {
      logs = logs.filter((l) => l.date === req.query.date);
    }
    if (req.query.status) {
      logs = logs.filter((l) => l.status === req.query.status);
    }

    res.json({ logs, total: logs.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   POST /api/logs/:patientId
// @desc    Add a medication log entry for a patient
// @access  Protected
router.post('/:patientId', protect, async (req, res) => {
  const isMongoConnected = mongoose.connection.readyState === 1;

  try {
    const { medicationId, medicationName, status, scheduledTime, actualTime, verificationMethod, date } = req.body;

    if (!medicationId || !medicationName || !status || !scheduledTime || !date) {
      return res.status(400).json({ error: 'medicationId, medicationName, status, scheduledTime, and date are required' });
    }

    const newLog = {
      id: `log-${Date.now()}`,
      medicationId,
      medicationName,
      scheduledTime,
      actualTime: actualTime || undefined,
      status,
      verificationMethod: verificationMethod || null,
      date
    };

    if (!isMongoConnected) {
        const patient = memDb.patients.find(p => p.id === req.params.patientId);
        if (!patient) return res.status(404).json({ error: 'Patient not found (Mock Mode)' });
        
        patient.logs.push(newLog);
        // Recalculate adherence
        const takenCount = patient.logs.filter(l => l.status === 'taken' || l.status === 'verified').length;
        patient.adherenceScore = patient.logs.length > 0 ? Math.round((takenCount / patient.logs.length) * 100) : 100;
        patient.lastCheckIn = new Date().toISOString();
        patient.missedMedsCount = patient.logs.filter(l => l.status === 'missed').length;
        
        return res.status(201).json({ log: newLog, patient });
    }

    const patient = await Patient.findOne({ id: req.params.patientId });
    if (!patient) return res.status(404).json({ error: 'Patient not found' });

    patient.logs.push(newLog);

    // Recalculate adherence score
    const takenCount = patient.logs.filter(
      (l) => l.status === 'taken' || l.status === 'verified'
    ).length;
    const totalCount = patient.logs.length;
    patient.adherenceScore = totalCount > 0 ? Math.round((takenCount / totalCount) * 100) : 100;
    patient.lastCheckIn = new Date().toISOString();

    // Update missed count
    patient.missedMedsCount = patient.logs.filter((l) => l.status === 'missed').length;

    await patient.save();

    res.status(201).json({ log: newLog, patient });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   DELETE /api/logs/:patientId/:logId
// @desc    Remove a log entry (admin/correction use)
// @access  Protected
router.delete('/:patientId/:logId', protect, async (req, res) => {
  const isMongoConnected = mongoose.connection.readyState === 1;

  try {
    if (!isMongoConnected) {
        const patient = memDb.patients.find(p => p.id === req.params.patientId);
        if (!patient) return res.status(404).json({ error: 'Patient not found (Mock Mode)' });
        patient.logs = patient.logs.filter(l => l.id !== req.params.logId);
        return res.json({ message: 'Log removed', patient });
    }

    const patient = await Patient.findOneAndUpdate(
      { id: req.params.patientId },
      { $pull: { logs: { id: req.params.logId } } },
      { new: true }
    );
    if (!patient) return res.status(404).json({ error: 'Patient not found' });
    res.json({ message: 'Log removed', patient });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
