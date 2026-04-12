const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Patient = require('../models/Patient');
const { protect } = require('../middleware/auth');
const memDb = require('../db');

const geminiApi = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const aiModel = process.env.GEMINI_API_KEY ? geminiApi.getGenerativeModel({ model: "gemini-1.5-flash" }) : null;

// @route   GET /api/ai/health-coach
// @desc    Analyze patient logs and provide health coach summary
// @access  Protected
router.get('/health-coach', protect, async (req, res) => {
    const isMongoConnected = mongoose.connection.readyState === 1;

    try {
        if (!aiModel) return res.status(503).json({ error: 'AI Service currently unavailable' });

        let patient;
        if (!isMongoConnected) {
            patient = memDb.patients.find(p => p.id === req.user.patientId || p.id === req.params.patientId);
        } else {
            patient = await Patient.findOne({ id: req.user.patientId || req.user.caretakerId }); // Logic varies for caretaker
        }
        
        if (!patient) return res.status(404).json({ error: 'Patient profile not found' });

        // Get logs from the last 7 days
        const last7DaysLogs = patient.logs.slice(-20); // Simple slice for now, could be date-filtered

        const prompt = `
            Analyze the following medication adherence data for patient ${patient.name}:
            Adherence Score: ${patient.adherenceScore}%
            Logs (Last 20 entries): ${JSON.stringify(last7DaysLogs)}
            
            Provide a brief (2-3 sentences) health coach summary including:
            1. Any patterns noticed (e.g., missing morning doses).
            2. Encouragement or advice to improve adherence.
            3. Use an empathetic tone.
        `;

        const result = await aiModel.generateContent(prompt);
        const response = result.response.text();

        res.json({ coachSummary: response });
    } catch (err) {
        console.error('Health Coach Error:', err);
        res.status(500).json({ error: 'Failed to generate coach summary' });
    }
});

// @route   POST /api/ai/check-interaction
// @desc    Check for interactions between two medications
// @access  Protected
router.post('/check-interaction', protect, async (req, res) => {
    try {
        const { med1, med2 } = req.body;
        if (!med1 || !med2) return res.status(400).json({ error: 'Both medications are required' });

        if (!aiModel) return res.status(503).json({ error: 'AI Service currently unavailable' });

        const prompt = `
            As a medical assistant, check if there are any known interactions between these two medications:
            1. ${med1}
            2. ${med2}
            
            Provide a concise answer (max 3 sentences). 
            Warning: Always include a disclaimer at the end saying "Always consult your doctor before taking medications."
        `;

        const result = await aiModel.generateContent(prompt);
        const response = result.response.text();

        res.json({ interactionInfo: response });
    } catch (err) {
        console.error('Interaction Checker Error:', err);
        res.status(500).json({ error: 'Failed to check interactions' });
    }
});

module.exports = router;
