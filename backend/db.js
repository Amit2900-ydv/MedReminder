/**
 * MedReminder In-Memory Database Fallback
 * Used when MongoDB is unreachable to ensure the app stays "Viva-ready".
 */

const mockData = {
    medications: [
        {
            id: '1',
            name: 'Metformin',
            dosage: '500mg',
            frequency: '2x daily',
            times: ['08:00', '20:00'],
            color: '#FFFFFF',
            shape: 'round',
            purpose: 'Diabetes management',
            sideEffects: ['Nausea', 'Diarrhea', 'Stomach upset'],
            instructions: 'Take with meals'
        },
        {
            id: '2',
            name: 'Lisinopril',
            dosage: '10mg',
            frequency: '1x daily',
            times: ['08:00'],
            color: '#FFB3BA',
            shape: 'capsule',
            purpose: 'Blood pressure control',
            sideEffects: ['Dizziness', 'Dry cough', 'Headache'],
            instructions: 'Take at the same time every morning'
        },
        {
            id: '3',
            name: 'Atorvastatin',
            dosage: '20mg',
            frequency: '1x daily',
            times: ['20:00'],
            color: '#BAE1FF',
            shape: 'oval',
            purpose: 'Cholesterol management',
            sideEffects: ['Muscle pain', 'Fatigue', 'Digestive issues'],
            instructions: 'Take in the evening'
        }
    ],
    patients: [
        {
            id: 'p1',
            name: 'Rajesh Kumar',
            email: 'test@test.com',
            phone: '+91 98765 43210',
            age: 65,
            avatar: '👨‍🦳',
            adherenceScore: 92,
            lastCheckIn: new Date().toISOString(),
            missedMedsCount: 1,
            medications: [], // Will be populated
            logs: []
        },
        {
            id: 'p2',
            name: 'Sunita Sharma',
            email: 'sunita@test.com',
            phone: '+91 98765 43211',
            age: 58,
            avatar: '👩',
            adherenceScore: 78,
            lastCheckIn: new Date().toISOString(),
            missedMedsCount: 3,
            medications: [],
            logs: []
        },
        {
            id: 'p3',
            name: 'Amit Patel',
            email: 'amit@test.com',
            phone: '+91 98765 43212',
            age: 72,
            avatar: '👴',
            adherenceScore: 91,
            lastCheckIn: new Date().toISOString(),
            missedMedsCount: 0,
            medications: [],
            logs: []
        },
        {
            id: 'p4',
            name: 'Priya Das',
            email: 'priya@test.com',
            phone: '+91 98765 43213',
            age: 45,
            avatar: '👩‍⚕️',
            adherenceScore: 98,
            lastCheckIn: new Date().toISOString(),
            missedMedsCount: 0,
            medications: [],
            logs: []
        },
        {
            id: 'p5',
            name: 'Vikram Singh',
            email: 'vikram@test.com',
            phone: '+91 98765 43214',
            age: 70,
            avatar: '👴',
            adherenceScore: 62,
            lastCheckIn: new Date().toISOString(),
            missedMedsCount: 5,
            medications: [],
            logs: []
        },
        {
            id: 'p6',
            name: 'Anjali Rao',
            email: 'anjali@test.com',
            phone: '+91 98765 43215',
            age: 32,
            avatar: '👩',
            adherenceScore: 85,
            lastCheckIn: new Date().toISOString(),
            missedMedsCount: 2,
            medications: [],
            logs: []
        }
    ],
    caretakers: [
        {
            id: 'c1',
            name: 'Dr. Sarah Johnson',
            email: 'caretaker@test.com',
            role: 'Primary Care Physician',
            phone: '+91 98765 43210',
            avatar: '👨‍⚕️',
            patientIds: ['p1', 'p2', 'p3', 'p4', 'p5', 'p6']
        }
    ],
    users: [
        {
            id: 'u1',
            email: 'test@test.com',
            password: 'password123',
            type: 'patient',
            patientId: 'p1',
            name: 'Rajesh Kumar'
        },
        {
            id: 'u2',
            email: 'caretaker@test.com',
            password: 'password123',
            type: 'caretaker',
            caretakerId: 'c1',
            name: 'Dr. Sarah Johnson'
        },
        {
            id: 'u3',
            email: 'amit@gmail.com',
            password: 'password',
            type: 'patient',
            patientId: 'p1',
            name: 'Amit Patel'
        },
        // Demo credentials shown on the login screen
        {
            id: 'u4',
            email: 'patient@demo.com',
            password: 'patient123',
            type: 'patient',
            patientId: 'p1',
            name: 'Demo Patient'
        },
        {
            id: 'u5',
            email: 'caretaker@demo.com',
            password: 'demo123',
            type: 'caretaker',
            caretakerId: 'c1',
            name: 'Demo Caretaker'
        }
    ]
};

// Auto-link medications to patients
mockData.patients.forEach(p => {
    p.medications = [...mockData.medications];
});

module.exports = mockData;
