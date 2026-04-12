import axios from 'axios';

// Base URL – uses Vite proxy in dev, direct URL in production
const BASE_URL = '/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Attach JWT token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adheai_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally (token expired / invalid)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adheai_token');
      localStorage.removeItem('adheai_user');
    }
    return Promise.reject(error);
  }
);

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }).then((r) => r.data),

  register: (data: { email: string; password: string; name: string; type: 'patient' | 'caretaker'; phone?: string }) =>
    api.post('/auth/register', data).then((r) => r.data),

  me: () =>
    api.get('/auth/me').then((r) => r.data),

  updateMe: (updates: { name?: string; phone?: string }) =>
    api.put('/auth/me', updates).then((r) => r.data)
};

// ---------------------------------------------------------------------------
// Patients
// ---------------------------------------------------------------------------
export const patientApi = {
  getAll: () =>
    api.get('/patients').then((r) => r.data.patients),

  getOne: (id: string) =>
    api.get(`/patients/${id}`).then((r) => r.data.patient),

  getByCaretaker: (caretakerId: string) =>
    api.get(`/patients/by-caretaker/${caretakerId}`).then((r) => r.data.patients),

  create: (data: object) =>
    api.post('/patients', data).then((r) => r.data.patient),

  update: (id: string, updates: object) =>
    api.put(`/patients/${id}`, updates).then((r) => r.data.patient),

  delete: (id: string) =>
    api.delete(`/patients/${id}`).then((r) => r.data)
};

// ---------------------------------------------------------------------------
// Caretakers
// ---------------------------------------------------------------------------
export const caretakerApi = {
  getOne: (id: string) =>
    api.get(`/caretakers/${id}`).then((r) => r.data.caretaker),

  update: (id: string, updates: object) =>
    api.put(`/caretakers/${id}`, updates).then((r) => r.data.caretaker),

  linkPatient: (caretakerId: string, patientId: string) =>
    api.post(`/caretakers/${caretakerId}/link-patient`, { patientId }).then((r) => r.data),

  unlinkPatient: (caretakerId: string, patientId: string) =>
    api.delete(`/caretakers/${caretakerId}/unlink-patient/${patientId}`).then((r) => r.data)
};

// ---------------------------------------------------------------------------
// Medications
// ---------------------------------------------------------------------------
export const medicationApi = {
  add: (patientId: string, medData: object) =>
    api.post(`/medications/${patientId}`, medData).then((r) => r.data),

  update: (patientId: string, medId: string, updates: object) =>
    api.put(`/medications/${patientId}/${medId}`, updates).then((r) => r.data),

  delete: (patientId: string, medId: string) =>
    api.delete(`/medications/${patientId}/${medId}`).then((r) => r.data)
};

// ---------------------------------------------------------------------------
// Medication Logs
// ---------------------------------------------------------------------------
export const logApi = {
  getAll: (patientId: string, params?: { date?: string; status?: string }) =>
    api.get(`/logs/${patientId}`, { params }).then((r) => r.data),

  add: (patientId: string, logData: {
    medicationId: string;
    medicationName: string;
    status: 'taken' | 'missed' | 'pending' | 'verified';
    scheduledTime: string;
    actualTime?: string;
    verificationMethod?: 'scan' | 'manual' | 'voice';
    date: string;
  }) =>
    api.post(`/logs/${patientId}`, logData).then((r) => r.data),

  delete: (patientId: string, logId: string) =>
    api.delete(`/logs/${patientId}/${logId}`).then((r) => r.data)
};

// Health check
export const checkHealth = () =>
  api.get('/health').then((r) => r.data);

export default api;
