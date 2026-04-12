const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const connectDB = require('./config/db');

// Load env vars
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

// Connect to Database
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ─────────────────────────────────────────────
app.use(cors({
  origin: '*', // Allow all for development simplicity, or restrict to your frontend URL
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Log all requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ─── Routes ─────────────────────────────────────────────
const authRoutes = require('./routes/auth');
const patientRoutes = require('./routes/patients');
const caretakerRoutes = require('./routes/caretakers');
const medicationRoutes = require('./routes/medications');
const logRoutes = require('./routes/logs');
const aiRoutes = require('./routes/ai');

app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/caretakers', caretakerRoutes);
app.use('/api/medications', medicationRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/ai', aiRoutes);

// ─── AI Chat Route (Gemini Integration) ──────
const { protect } = require('./middleware/auth');
const geminiApi = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const aiModel = process.env.GEMINI_API_KEY ? geminiApi.getGenerativeModel({ model: "gemini-flash-latest" }) : null;

const Patient = require('./models/Patient');
const memDb = require('./db');
const mongoose = require('mongoose');

app.post('/api/chat', protect, async (req, res) => {
  try {
    const { history, message } = req.body;
    
    if (!process.env.GEMINI_API_KEY || !aiModel) {
      return res.json({ response: "Hello! I am MedReminder AI. To enable my real artificial intelligence, please set your GEMINI_API_KEY in the backend .env file and restart the server!" });
    }

    let systemPrompt = `You are the MedReminder AI Assistant, a helpful and empathetic voice-first medication intelligence companion. You provide brief, highly accurate, and helpful answers about medications, health routines, and side effects. Keep your responses short, simple, and direct. Always remind the user to consult their real doctor for critical medical issues. Do not hallucinate or guess dosages if not provided. Give short precise answers.`;
    
    // Inject patient's actual schedule into context
    if (req.user && req.user.type === 'patient') {
      const isMongoConnected = mongoose.connection.readyState === 1;
      let patient = null;
      if (isMongoConnected) {
         patient = await Patient.findOne({ id: req.user.patientId });
      } else {
         patient = memDb.patients.find(p => p.id === req.user.patientId);
      }

      if (patient && patient.medications && patient.medications.length > 0) {
        const today = new Date().toISOString().split('T')[0];
        const nowStr = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

        let medsStatusList = patient.medications.map(m => {
           let statusText = [];
           m.times.forEach(time => {
              const hasLog = (patient.logs || []).find(l => l.medicationId === m.id && l.date === today && l.scheduledTime === time && (l.status === 'taken' || l.status === 'verified'));
              const hasMissedLog = (patient.logs || []).find(l => l.medicationId === m.id && l.date === today && l.scheduledTime === time && l.status === 'missed');
              
              if (hasLog) {
                 statusText.push(`[${time}: TAKEN]`);
              } else if (hasMissedLog) {
                 statusText.push(`[${time}: MISSED]`);
              } else if (time < nowStr) {
                 statusText.push(`[${time}: MISSED (Forgot to log)]`);
              } else {
                 statusText.push(`[${time}: UPCOMING]`);
              }
           });
           return `- ${m.name} (${m.dosage}): ${m.frequency}\\n    Today's Status: ${statusText.join(', ')}`;
        }).join('\\n');

        systemPrompt += `\\n\\nCurrent Time: ${nowStr}. Here is the user's exact medication schedule and real-time status for today (TAKEN means they consumed it, MISSED means time passed and they forgot or marked missed, UPCOMING means it's for later today):\\n${medsStatusList}\\n\\nIf the user asks what they missed today, definitively list only the ones marked MISSED. If they have missed multiple doses, strongly advise them to adhere to their routine and warn them about health risks.`;
      } else {
        systemPrompt += `\\n\\nThe user currently has no medications scheduled.`;
      }
    }
    
    const formattedHistory = [];
    if (history && Array.isArray(history)) {
       history.forEach(msg => {
          if (msg.sender === 'user') {
             formattedHistory.push({ role: 'user', parts: [{ text: msg.text }] });
          } else if (msg.sender === 'ai' || msg.sender === 'model') {
             formattedHistory.push({ role: 'model', parts: [{ text: msg.text }] });
          }
       });
    }

    const chatSession = aiModel.startChat({
       history: [
          { role: 'user', parts: [{ text: systemPrompt }] },
          { role: 'model', parts: [{ text: 'Understood. I am MedReminder AI Assistant.' }] },
          ...formattedHistory
       ]
    });

    const result = await chatSession.sendMessage([{ text: message }]);
    const responseText = result.response.text();
    
    res.json({ response: responseText });
  } catch (error) {
    console.error("AI Chat Error:", error.message);
    res.status(500).json({ error: "Failed to generate AI response. Please ensure your Gemini API key is valid." });
  }
});

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'MedReminder backend running with MongoDB Atlas',
    timestamp: new Date()
  });
});

// 404 handler
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

// ─── Start Server ─────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 MedReminder Backend running on all interfaces at port ${PORT}`);
  console.log(`📦 Storage: MongoDB (Atlas)`);
});