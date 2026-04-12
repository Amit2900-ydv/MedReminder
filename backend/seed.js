/**
 * seed.js – Seeds the AdherAI MongoDB database with demo users, patients,
 * caretakers, and medications from the frontend's mockData.ts.
 *
 * Run with:  node seed.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const User = require('./models/User');
const Patient = require('./models/Patient');
const Caretaker = require('./models/Caretaker');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/medreminder';

// ---------------------------------------------------------------------------
// Demo medication catalogue (mirrors mockData.ts)
// ---------------------------------------------------------------------------
const medications = [
  {
    id: '1', name: 'Metformin', dosage: '500mg', frequency: '2x daily',
    times: ['08:00', '20:00'], color: '#FFFFFF', shape: 'round',
    purpose: 'Diabetes management', sideEffects: ['Nausea', 'Diarrhea', 'Stomach upset'],
    instructions: 'Take with meals'
  },
  {
    id: '2', name: 'Lisinopril', dosage: '10mg', frequency: '1x daily',
    times: ['08:00'], color: '#FFB3BA', shape: 'capsule',
    purpose: 'Blood pressure control', sideEffects: ['Dizziness', 'Cough', 'Headache'],
    instructions: 'Take in the morning'
  },
  {
    id: '3', name: 'Atorvastatin', dosage: '20mg', frequency: '1x daily',
    times: ['20:00'], color: '#BAE1FF', shape: 'oval',
    purpose: 'Cholesterol management', sideEffects: ['Muscle pain', 'Fatigue', 'Digestive issues'],
    instructions: 'Take in the evening'
  },
  {
    id: '4', name: 'Aspirin', dosage: '81mg', frequency: '1x daily',
    times: ['08:00'], color: '#FFFFBA', shape: 'round',
    purpose: 'Heart health', sideEffects: ['Stomach irritation', 'Bleeding risk'],
    instructions: 'Take with food for heart health'
  },
  {
    id: 'demo-1', name: 'Amoxicillin', dosage: '500mg', frequency: '1x daily',
    times: ['18:00'], color: '#FF69B4', shape: 'capsule',
    purpose: 'Antibiotic for infection', sideEffects: ['Nausea', 'Diarrhea'],
    instructions: 'Take after food'
  },
  {
    id: 'demo-2', name: 'Vitamin D3', dosage: '2000 IU', frequency: '1x daily',
    times: ['08:00'], color: '#FFD700', shape: 'round',
    purpose: 'Bone health support', sideEffects: ['None'],
    instructions: 'Take with breakfast'
  },
  {
    id: 'demo-3', name: 'Omega 3', dosage: '1000mg', frequency: '1x daily',
    times: ['20:00'], color: '#4B0082', shape: 'oval',
    purpose: 'Heart health', sideEffects: ['None'],
    instructions: 'Take after dinner'
  },
  {
    id: 'demo-4', name: 'Melatonin', dosage: '5mg', frequency: '1x daily',
    times: ['22:30'], color: '#000080', shape: 'round',
    purpose: 'Sleep support', sideEffects: ['Drowsiness'],
    instructions: 'Take 30 mins before bed'
  }
];

// ---------------------------------------------------------------------------
// Demo logs for patient p1
// ---------------------------------------------------------------------------
const todayLogs = [
  { id: 'log1', medicationId: '1', medicationName: 'Metformin 500mg', scheduledTime: '08:00', actualTime: '08:15', status: 'verified', verificationMethod: 'scan', date: '2026-01-17' },
  { id: 'log2', medicationId: '2', medicationName: 'Lisinopril 10mg', scheduledTime: '08:00', actualTime: '08:15', status: 'taken', verificationMethod: 'manual', date: '2026-01-17' },
  { id: 'log3', medicationId: '4', medicationName: 'Aspirin 81mg', scheduledTime: '08:00', status: 'missed', date: '2026-01-17' },
  { id: 'log4', medicationId: '1', medicationName: 'Metformin 500mg', scheduledTime: '20:00', status: 'pending', date: '2026-01-17' },
  { id: 'log5', medicationId: '3', medicationName: 'Atorvastatin 20mg', scheduledTime: '20:00', status: 'pending', date: '2026-01-17' }
];

// ---------------------------------------------------------------------------
// Seed function
// ---------------------------------------------------------------------------
async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB:', MONGO_URI);

    // Clear existing data
    await User.deleteMany({});
    await Patient.deleteMany({});
    await Caretaker.deleteMany({});
    console.log('🗑️  Cleared existing collections');

    // ------------------------------------------------------------------
    // Patients
    // ------------------------------------------------------------------
    const patient1 = await Patient.create({
      id: 'p1', name: 'Rajesh Kumar', email: 'test@test.com',
      phone: '+91 98765 43210', age: 65, avatar: '👨‍🦳',
      adherenceScore: 92, lastCheckIn: '2026-02-12T08:15:00',
      missedMedsCount: 1, medications: [...medications], logs: todayLogs
    });

    const patient2 = await Patient.create({
      id: 'p2', name: 'Sunita Sharma', email: 'sunita@test.com',
      phone: '+91 98765 43211', age: 58, avatar: '👩',
      adherenceScore: 78, lastCheckIn: '2026-02-12T07:00:00',
      missedMedsCount: 3,
      medications: [
        { id: '5', name: 'Levothyroxine', dosage: '50mcg', frequency: '1x daily', times: ['07:00'], color: '#E0BBE4', shape: 'round', purpose: 'Thyroid management', sideEffects: ['Weight changes', 'Insomnia'], instructions: 'Take on empty stomach' },
        medications[0], medications[2], medications[4], medications[5], medications[6], medications[7]
      ],
      logs: [
        { id: 'log-s1', medicationId: '5', medicationName: 'Levothyroxine 50mcg', scheduledTime: '07:00', actualTime: '07:45', status: 'taken', verificationMethod: 'manual', date: '2026-02-12' },
        { id: 'log-s2', medicationId: '1', medicationName: 'Metformin 500mg', scheduledTime: '08:00', status: 'missed', date: '2026-02-12' }
      ]
    });

    const patient3 = await Patient.create({
      id: 'p3', name: 'Amit Patel', email: 'amit@test.com',
      phone: '+91 98765 43212', age: 72, avatar: '👴',
      adherenceScore: 91, lastCheckIn: '2026-02-12T09:00:00',
      missedMedsCount: 0,
      medications: [medications[1], medications[3], medications[4], medications[5], medications[6], medications[7]],
      logs: [
        { id: 'log-a1', medicationId: '2', medicationName: 'Lisinopril 10mg', scheduledTime: '08:00', actualTime: '08:05', status: 'verified', verificationMethod: 'scan', date: '2026-02-12' },
        { id: 'log-a2', medicationId: '4', medicationName: 'Aspirin 81mg', scheduledTime: '08:00', actualTime: '08:05', status: 'taken', verificationMethod: 'manual', date: '2026-02-12' }
      ]
    });

    const patient4 = await Patient.create({
      id: 'p4', name: 'Priya Das', email: 'priya@test.com',
      phone: '+91 98765 43213', age: 45, avatar: '👩‍⚕️',
      adherenceScore: 98, lastCheckIn: '2026-02-12T10:00:00',
      missedMedsCount: 0,
      medications: [medications[4], medications[5]],
      logs: [
        { id: 'log-p4-1', medicationId: 'demo-1', medicationName: 'Amoxicillin 500mg', scheduledTime: '18:00', status: 'pending', date: '2026-02-12' }
      ]
    });

    const patient5 = await Patient.create({
      id: 'p5', name: 'Vikram Singh', email: 'vikram@test.com',
      phone: '+91 98765 43214', age: 70, avatar: '👴',
      adherenceScore: 62, lastCheckIn: '2026-02-12T11:00:00',
      missedMedsCount: 5,
      medications: [medications[0], medications[1], medications[2]],
      logs: [
        { id: 'log-v5-1', medicationId: '1', medicationName: 'Metformin 500mg', scheduledTime: '08:00', status: 'missed', date: '2026-02-12' },
        { id: 'log-v5-2', medicationId: '2', medicationName: 'Lisinopril 10mg', scheduledTime: '08:00', status: 'missed', date: '2026-02-12' }
      ]
    });

    const patient6 = await Patient.create({
      id: 'p6', name: 'Anjali Rao', email: 'anjali@test.com',
      phone: '+91 98765 43215', age: 32, avatar: '👩',
      adherenceScore: 85, lastCheckIn: '2026-02-12T09:30:00',
      missedMedsCount: 2,
      medications: [medications[5], medications[6], medications[7]],
      logs: [
        { id: 'log-an-1', medicationId: 'demo-2', medicationName: 'Vitamin D3 2000 IU', scheduledTime: '08:00', actualTime: '08:10', status: 'taken', verificationMethod: 'manual', date: '2026-02-12' }
      ]
    });

    console.log('👥 Created 6 demo patients');

    // ------------------------------------------------------------------
    // Caretaker
    // ------------------------------------------------------------------
    const caretaker1 = await Caretaker.create({
      id: 'c1', name: 'Dr. Sarah Johnson', email: 'caretaker@test.com',
      role: 'Primary Care Physician', phone: '+91 98765 43210',
      avatar: '👨‍⚕️', patientIds: ['p1', 'p2', 'p3', 'p4', 'p5', 'p6']
    });

    console.log('🩺 Created 1 demo caretaker');

    // ------------------------------------------------------------------
    // Users (passwords are hashed by the pre-save hook)
    // ------------------------------------------------------------------
    await User.create({
      email: 'test@test.com', passwordHash: 'password123',
      name: 'Rajesh Kumar', type: 'patient', patientId: 'p1'
    });

    await User.create({
      email: 'caretaker@test.com', passwordHash: 'password123',
      name: 'Dr. Sarah Johnson', type: 'caretaker', caretakerId: 'c1'
    });

    await User.create({
      email: 'amit@gmail.com', passwordHash: 'password',
      name: 'Amit Patel', type: 'patient', patientId: 'p3'
    });

    console.log('🔐 Created 3 demo users');
    console.log('');
    console.log('=== Demo Credentials ===');
    console.log('Patient:   test@test.com        / password123');
    console.log('Caretaker: caretaker@test.com   / password123');
    console.log('Patient:   amit@gmail.com       / password');
    console.log('========================');
    console.log('');
    console.log('✅ Database seeded successfully!');
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

seed();
