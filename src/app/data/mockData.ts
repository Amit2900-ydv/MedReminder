// Mock data for MedReminder application

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  times: string[];
  color: string;
  shape: 'round' | 'capsule' | 'oval';
  purpose: string;
  sideEffects: string[];
  instructions: string;
}

export interface MedicationLog {
  id: string;
  medicationId: string;
  medicationName: string;
  scheduledTime: string;
  actualTime?: string;
  status: 'taken' | 'missed' | 'pending' | 'verified';
  verificationMethod?: 'scan' | 'manual' | 'voice';
  date: string;
}

export interface AIInsight {
  id: string;
  type: 'warning' | 'info' | 'success';
  message: string;
  timestamp: string;
}

// New interfaces for dual-user system
export interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  age: number;
  avatar: string;
  medications: Medication[];
  logs: MedicationLog[];
  adherenceScore: number;
  lastCheckIn: string;
  missedMedsCount: number;
}

export interface Caretaker {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string;
  avatar: string;
  patientIds: string[];
}

export interface User {
  id: string;
  email: string;
  password: string;
  type: 'patient' | 'caretaker';
  patientId?: string;
  caretakerId?: string;
}

export const medications: Medication[] = [
  {
    id: '1',
    name: 'Metformin',
    dosage: '500mg',
    frequency: '2x daily',
    times: ['08:00', '20:00'],
    color: '#FFFFFF',
    shape: 'round',
    purpose: 'med.purpose.diabetes',
    sideEffects: ['med.side.nausea', 'med.side.diarrhea', 'med.side.stomach'],
    instructions: 'med.instr.meals'
  },
  {
    id: '2',
    name: 'Lisinopril',
    dosage: '10mg',
    frequency: '1x daily',
    times: ['08:00'],
    color: '#FFB3BA',
    shape: 'capsule',
    purpose: 'med.purpose.bp',
    sideEffects: ['med.side.dizziness', 'med.side.cough', 'med.side.headache'],
    instructions: 'med.instr.bp'
  },
  {
    id: '3',
    name: 'Atorvastatin',
    dosage: '20mg',
    frequency: '1x daily',
    times: ['20:00'],
    color: '#BAE1FF',
    shape: 'oval',
    purpose: 'med.purpose.cholesterol',
    sideEffects: ['med.side.muscle', 'med.side.fatigue', 'med.side.digestive'],
    instructions: 'med.instr.evening'
  },
  {
    id: '4',
    name: 'Aspirin',
    dosage: '81mg',
    frequency: '1x daily',
    times: ['08:00'],
    color: '#FFFFBA',
    shape: 'round',
    purpose: 'med.purpose.heart',
    sideEffects: ['med.side.irritation', 'med.side.bleeding'],
    instructions: 'med.instr.heart'
  },
  {
    id: 'demo-1',
    name: 'Amoxicillin',
    dosage: '500mg',
    frequency: '1x daily',
    times: ['18:00'],
    color: '#FF69B4',
    shape: 'capsule',
    purpose: 'Antibiotic for infection',
    sideEffects: ['Nausea', 'Diarrhea'],
    instructions: 'Take after food'
  },
  {
    id: 'demo-2',
    name: 'Vitamin D3',
    dosage: '2000 IU',
    frequency: '1x daily',
    times: ['08:00'],
    color: '#FFD700',
    shape: 'round',
    purpose: 'Bone health support',
    sideEffects: ['None'],
    instructions: 'Take with breakfast'
  },
  {
    id: 'demo-3',
    name: 'Omega 3',
    dosage: '1000mg',
    frequency: '1x daily',
    times: ['20:00'],
    color: '#4B0082',
    shape: 'oval',
    purpose: 'Heart health',
    sideEffects: ['None'],
    instructions: 'Take after dinner'
  },
  {
    id: 'demo-4',
    name: 'Melatonin',
    dosage: '5mg',
    frequency: '1x daily',
    times: ['22:30'],
    color: '#000080',
    shape: 'round',
    purpose: 'Sleep support',
    sideEffects: ['Drowsiness'],
    instructions: 'Take 30 mins before bed'
  }
];

export const todayLogs: MedicationLog[] = [
  {
    id: 'log1',
    medicationId: '1',
    medicationName: 'Metformin 500mg',
    scheduledTime: '08:00',
    actualTime: '08:15',
    status: 'verified',
    verificationMethod: 'scan',
    date: '2026-01-17'
  },
  {
    id: 'log2',
    medicationId: '2',
    medicationName: 'Lisinopril 10mg',
    scheduledTime: '08:00',
    actualTime: '08:15',
    status: 'taken',
    verificationMethod: 'manual',
    date: '2026-01-17'
  },
  {
    id: 'log3',
    medicationId: '4',
    medicationName: 'Aspirin 81mg',
    scheduledTime: '08:00',
    status: 'missed',
    date: '2026-01-17'
  },
  {
    id: 'log4',
    medicationId: '1',
    medicationName: 'Metformin 500mg',
    scheduledTime: '20:00',
    status: 'pending',
    date: '2026-01-17'
  },
  {
    id: 'log5',
    medicationId: '3',
    medicationName: 'Atorvastatin 20mg',
    scheduledTime: '20:00',
    status: 'pending',
    date: '2026-01-17'
  }
];

export const weeklyAdherence = [
  { day: 'Mon', adherence: 95 },
  { day: 'Tue', adherence: 100 },
  { day: 'Wed', adherence: 85 },
  { day: 'Thu', adherence: 90 },
  { day: 'Fri', adherence: 75 },
  { day: 'Sat', adherence: 88 },
  { day: 'Sun', adherence: 92 }
];

export const aiInsights: AIInsight[] = [
  {
    id: 'insight1',
    type: 'warning',
    message: 'ai.insight.delay',
    timestamp: '2026-01-17T14:30:00'
  },
  {
    id: 'insight2',
    type: 'info',
    message: 'ai.insight.improve',
    timestamp: '2026-01-17T09:00:00'
  },
  {
    id: 'insight3',
    type: 'success',
    message: 'ai.insight.streak',
    timestamp: '2026-01-16T20:00:00'
  }
];

export const adherenceHistory = [
  { month: 'Aug', score: 78 },
  { month: 'Sep', score: 82 },
  { month: 'Oct', score: 85 },
  { month: 'Nov', score: 88 },
  { month: 'Dec', score: 91 },
  { month: 'Jan', score: 89 }
];

// Demo Patients Data
export const patients: Patient[] = [
  {
    id: 'p1',
    name: 'Rajesh Kumar',
    email: 'rajesh@test.com',
    phone: '+91 98765 43210',
    age: 65,
    avatar: '👨‍🦳',
    adherenceScore: 92,
    lastCheckIn: '2026-02-12T08:15:00',
    missedMedsCount: 1,
    medications: [...medications],
    logs: todayLogs
  },
  {
    id: 'p2',
    name: 'Sunita Sharma',
    email: 'sunita@test.com',
    phone: '+91 98765 43211',
    age: 58,
    avatar: '👩',
    adherenceScore: 78,
    lastCheckIn: '2026-02-12T07:00:00',
    missedMedsCount: 3,
    medications: [
      {
        id: '5',
        name: 'Levothyroxine',
        dosage: '50mcg',
        frequency: '1x daily',
        times: ['07:00'],
        color: '#E0BBE4',
        shape: 'round',
        purpose: 'med.purpose.thyroid',
        sideEffects: ['med.side.weight', 'med.side.insomnia'],
        instructions: 'med.instr.thyroid'
      },
      medications[0],
      medications[2],
      medications[4],
      medications[5],
      medications[6],
      medications[7]
    ],
    logs: [
      {
        id: 'log-s1',
        medicationId: '5',
        medicationName: 'Levothyroxine 50mcg',
        scheduledTime: '07:00',
        actualTime: '07:45',
        status: 'taken',
        verificationMethod: 'manual',
        date: '2026-02-12'
      },
      {
        id: 'log-s2',
        medicationId: '1',
        medicationName: 'Metformin 500mg',
        scheduledTime: '08:00',
        status: 'missed',
        date: '2026-02-12'
      }
    ]
  },
  {
    id: 'p3',
    name: 'Amit Patel',
    email: 'amit@test.com',
    phone: '+91 98765 43212',
    age: 72,
    avatar: '👴',
    adherenceScore: 91,
    lastCheckIn: '2026-02-12T09:00:00',
    missedMedsCount: 0,
    medications: [medications[1], medications[3], medications[4], medications[5], medications[6], medications[7]],
    logs: [
      {
        id: 'log-a1',
        medicationId: '2',
        medicationName: 'Lisinopril 10mg',
        scheduledTime: '08:00',
        actualTime: '08:05',
        status: 'verified',
        verificationMethod: 'scan',
        date: '2026-02-12'
      },
      {
        id: 'log-a2',
        medicationId: '4',
        medicationName: 'Aspirin 81mg',
        scheduledTime: '08:00',
        actualTime: '08:05',
        status: 'taken',
        verificationMethod: 'manual',
        date: '2026-02-12'
      }
      ]
    },
    {
      id: 'p4',
      name: 'Priya Das',
      email: 'priya@test.com',
      phone: '+91 98765 43213',
      age: 45,
      avatar: '👩‍⚕️',
      adherenceScore: 98,
      lastCheckIn: '2026-02-12T10:00:00',
      missedMedsCount: 0,
      medications: [medications[4], medications[5]],
      logs: [
        {
          id: 'log-p4-1',
          medicationId: 'demo-1',
          medicationName: 'Amoxicillin 500mg',
          scheduledTime: '18:00',
          status: 'pending',
          date: '2026-02-12'
        }
      ]
    },
    {
      id: 'p5',
      name: 'Vikram Singh',
      email: 'vikram@test.com',
      phone: '+91 98765 43214',
      age: 70,
      avatar: '👴',
      adherenceScore: 62,
      lastCheckIn: '2026-02-12T11:00:00',
      missedMedsCount: 5,
      medications: [medications[0], medications[1], medications[2]],
      logs: [
        {
          id: 'log-v5-1',
          medicationId: '1',
          medicationName: 'Metformin 500mg',
          scheduledTime: '08:00',
          status: 'missed',
          date: '2026-02-12'
        },
        {
          id: 'log-v5-2',
          medicationId: '2',
          medicationName: 'Lisinopril 10mg',
          scheduledTime: '08:00',
          status: 'missed',
          date: '2026-02-12'
        }
      ]
    },
    {
      id: 'p6',
      name: 'Anjali Rao',
      email: 'anjali@test.com',
      phone: '+91 98765 43215',
      age: 32,
      avatar: '👩',
      adherenceScore: 85,
      lastCheckIn: '2026-02-12T09:30:00',
      missedMedsCount: 2,
      medications: [medications[5], medications[6], medications[7]],
      logs: [
        {
          id: 'log-an-1',
          medicationId: 'demo-2',
          medicationName: 'Vitamin D3 2000 IU',
          scheduledTime: '08:00',
          actualTime: '08:10',
          status: 'taken',
          verificationMethod: 'manual',
          date: '2026-02-12'
        }
      ]
    }
];

// Demo Caretaker Data
export const caretakers: Caretaker[] = [
  {
    id: 'c1',
    name: 'Dr. Sarah Johnson',
    email: 'caretaker@test.com',
    role: 'Primary Care Physician',
    phone: '+91 98765 43210',
    avatar: '👨‍⚕️',
    patientIds: ['p1', 'p2', 'p3', 'p4', 'p5', 'p6']
  }
];

// Demo User Accounts
export const users: User[] = [
  {
    id: 'u1',
    email: 'test@test.com',
    password: 'password123',
    type: 'patient',
    patientId: 'p1'
  },
  {
    id: 'u2',
    email: 'caretaker@test.com',
    password: 'password123',
    type: 'caretaker',
    caretakerId: 'c1'
  },
  {
    id: 'u3',
    email: 'amit@gmail.com',
    password: 'password',
    type: 'patient',
    patientId: 'p3'
  }
];

// Helper function to get patient by ID
export const getPatientById = (id: string): Patient | undefined => {
  return patients.find(p => p.id === id);
};

// Helper function to get caretaker by ID
export const getCaretakerById = (id: string): Caretaker | undefined => {
  return caretakers.find(c => c.id === id);
};

// Helper function to authenticate user
export const authenticateUser = (email: string, password: string): User | null => {
  const user = users.find(u => u.email === email && u.password === password);
  return user || null;
};
