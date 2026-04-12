const mongoose = require('mongoose');

const medicationSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true, trim: true },
  dosage: { type: String, required: true },
  frequency: { type: String, required: true },
  times: [{ type: String }],
  color: { type: String, default: '#FFFFFF' },
  shape: { type: String, enum: ['round', 'capsule', 'oval'], default: 'round' },
  purpose: { type: String, default: '' },
  sideEffects: [{ type: String }],
  instructions: { type: String, default: '' }
}, { _id: false });

const medicationLogSchema = new mongoose.Schema({
  id: { type: String, required: true },
  medicationId: { type: String, required: true },
  medicationName: { type: String, required: true },
  scheduledTime: { type: String, required: true },
  actualTime: { type: String },
  status: {
    type: String,
    enum: ['taken', 'missed', 'pending', 'verified'],
    required: true
  },
  verificationMethod: {
    type: String,
    enum: ['scan', 'manual', 'voice', null],
    default: null
  },
  date: { type: String, required: true }
}, { _id: false });

const patientSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, default: '' },
    age: { type: Number, default: 0 },
    avatar: { type: String, default: '👤' },
    adherenceScore: { type: Number, default: 100, min: 0, max: 100 },
    lastCheckIn: { type: String, default: () => new Date().toISOString() },
    missedMedsCount: { type: Number, default: 0 },
    medications: [medicationSchema],
    logs: [medicationLogSchema]
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Index for fast lookup by email
patientSchema.index({ email: 1 });

module.exports = mongoose.model('Patient', patientSchema);
