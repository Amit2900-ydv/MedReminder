const mongoose = require('mongoose');

const caretakerSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    role: { type: String, default: 'Caretaker' },
    phone: { type: String, default: '' },
    avatar: { type: String, default: '👤' },
    patientIds: [{ type: String }]
  },
  {
    timestamps: true
  }
);

caretakerSchema.index({ email: 1 });

module.exports = mongoose.model('Caretaker', caretakerSchema);
