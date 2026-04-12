import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { patientApi, caretakerApi, medicationApi, logApi } from '@/services/api';
import { Patient, Caretaker, Medication, medications as defaultMedications } from '@/app/data/mockData';
import { useAuth } from './AuthContext';

interface PatientContextType {
    patients: Patient[];
    caretakers: Caretaker[];
    isLoadingData: boolean;
    addPatient: (caretakerId: string | null, patientData: Omit<Patient, 'id' | 'medications' | 'logs' | 'adherenceScore' | 'lastCheckIn' | 'missedMedsCount'> & { id?: string }) => Promise<void>;
    addCaretaker: (caretakerId: string, caretakerData: { name: string; email: string; role?: string; phone?: string; avatar?: string }) => Promise<void>;
    addMedication: (patientId: string, medication: Omit<Medication, 'id'>) => Promise<void>;
    updatePatient: (patientId: string, updates: Partial<Patient>) => Promise<void>;
    updateCaretaker: (caretakerId: string, updates: Partial<Caretaker>) => Promise<void>;
    deletePatient: (patientId: string, caretakerId: string) => Promise<void>;
    getPatientsByCaretaker: (caretakerId: string) => Patient[];
    linkPatientToCaretaker: (patientId: string, caretakerId: string) => Promise<{ success: boolean; message?: string }>;
    addLog: (patientId: string, logData: {
        medicationId: string;
        medicationName: string;
        status: 'taken' | 'missed' | 'pending' | 'verified';
        scheduledTime: string;
        actualTime?: string;
        verificationMethod?: 'scan' | 'manual' | 'voice';
        date: string;
    }) => Promise<void>;
    refreshData: () => Promise<void>;
}

const PatientContext = createContext<PatientContextType | undefined>(undefined);

export function PatientProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const [patients, setPatients] = useState<Patient[]>([]);
    const [caretakers, setCaretakers] = useState<Caretaker[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(false);

    // ---------------------------------------------------------------------------
    // Data fetching – runs whenever the logged-in user changes
    // ---------------------------------------------------------------------------
    const fetchData = useCallback(async () => {
        if (!user) {
            setPatients([]);
            setCaretakers([]);
            return;
        }
        setIsLoadingData(true);
        try {
            if (user.type === 'caretaker' && user.caretakerId) {
                const [fetchedPatients, caretaker] = await Promise.all([
                    patientApi.getByCaretaker(user.caretakerId),
                    caretakerApi.getOne(user.caretakerId)
                ]);
                setPatients(fetchedPatients || []);
                setCaretakers(caretaker ? [caretaker] : []);
            } else if (user.type === 'patient' && user.patientId) {
                const patient = await patientApi.getOne(user.patientId);
                setPatients(patient ? [patient] : []);
            }
        } catch (err) {
            console.error('Failed to fetch data from backend, falling back to empty state:', err);
            // Graceful degradation – keep whatever we already had
        } finally {
            setIsLoadingData(false);
        }
    }, [user]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const refreshData = useCallback(() => fetchData(), [fetchData]);

    // ---------------------------------------------------------------------------
    // Mutations
    // ---------------------------------------------------------------------------
    const addPatient = async (
        caretakerId: string | null,
        patientData: Omit<Patient, 'id' | 'medications' | 'logs' | 'adherenceScore' | 'lastCheckIn' | 'missedMedsCount'> & { id?: string }
    ) => {
        try {
            const newPatient = await patientApi.create({
                ...patientData,
                caretakerId: caretakerId || undefined
            });
            setPatients(prev => {
                if (prev.some(p => p.id === newPatient.id)) return prev;
                return [...prev, { ...newPatient, medications: defaultMedications, logs: [] }];
            });
            if (caretakerId) {
                setCaretakers(prev =>
                    prev.map(c =>
                        c.id === caretakerId && !c.patientIds.includes(newPatient.id)
                            ? { ...c, patientIds: [...c.patientIds, newPatient.id] }
                            : c
                    )
                );
            }
        } catch (err: any) {
            console.error('addPatient error:', err?.response?.data?.error || err);
        }
    };

    const addCaretaker = async (
        caretakerId: string,
        caretakerData: { name: string; email: string; role?: string; phone?: string; avatar?: string }
    ) => {
        // Caretaker created on backend during register; just fetch and add locally
        try {
            const existing = await caretakerApi.getOne(caretakerId);
            if (existing) {
                setCaretakers(prev => prev.some(c => c.id === caretakerId) ? prev : [...prev, existing]);
            }
        } catch {
            // If not found, create a local representation
            const local: Caretaker = {
                id: caretakerId,
                name: caretakerData.name,
                email: caretakerData.email,
                role: caretakerData.role || 'Caretaker',
                phone: caretakerData.phone || '',
                avatar: caretakerData.avatar || '👤',
                patientIds: []
            };
            setCaretakers(prev => prev.some(c => c.id === caretakerId) ? prev : [...prev, local]);
        }
    };

    const addMedication = async (patientId: string, medication: Omit<Medication, 'id'>) => {
        try {
            const result = await medicationApi.add(patientId, medication);
            const newMed: Medication = result.medication;
            setPatients(prev =>
                prev.map(p =>
                    p.id === patientId ? { ...p, medications: [...p.medications, newMed] } : p
                )
            );
        } catch (err: any) {
            console.error('addMedication error:', err?.response?.data?.error || err);
        }
    };

    const updatePatient = async (patientId: string, updates: Partial<Patient>) => {
        try {
            const updated = await patientApi.update(patientId, updates);
            setPatients(prev =>
                prev.map(p => p.id === patientId ? { ...p, ...updated } : p)
            );
        } catch (err: any) {
            console.error('updatePatient error:', err?.response?.data?.error || err);
            // Optimistic update fallback
            setPatients(prev =>
                prev.map(p => p.id === patientId ? { ...p, ...updates } : p)
            );
        }
    };

    const updateCaretaker = async (caretakerId: string, updates: Partial<Caretaker>) => {
        try {
            const updated = await caretakerApi.update(caretakerId, updates);
            setCaretakers(prev =>
                prev.map(c => c.id === caretakerId ? { ...c, ...updated } : c)
            );
        } catch (err: any) {
            console.error('updateCaretaker error:', err?.response?.data?.error || err);
            setCaretakers(prev =>
                prev.map(c => c.id === caretakerId ? { ...c, ...updates } : c)
            );
        }
    };

    const deletePatient = async (patientId: string, caretakerId: string) => {
        try {
            await patientApi.delete(patientId);
            setPatients(prev => prev.filter(p => p.id !== patientId));
            setCaretakers(prev =>
                prev.map(c =>
                    c.id === caretakerId
                        ? { ...c, patientIds: c.patientIds.filter((id: string) => id !== patientId) }
                        : c
                )
            );
        } catch (err: any) {
            console.error('deletePatient error:', err?.response?.data?.error || err);
        }
    };

    const getPatientsByCaretaker = (caretakerId: string) => {
        const caretaker = caretakers.find(c => c.id === caretakerId);
        if (!caretaker) return [];
        return patients.filter(p => caretaker.patientIds.includes(p.id));
    };

    const linkPatientToCaretaker = async (patientId: string, caretakerId: string) => {
        try {
            await caretakerApi.linkPatient(caretakerId, patientId);
            setCaretakers(prev =>
                prev.map(c =>
                    c.id === caretakerId && !c.patientIds.includes(patientId)
                        ? { ...c, patientIds: [...c.patientIds, patientId] }
                        : c
                )
            );
            // Fetch that patient if not already loaded
            const alreadyLoaded = patients.some(p => p.id === patientId);
            if (!alreadyLoaded) {
                const patient = await patientApi.getOne(patientId);
                if (patient) setPatients(prev => [...prev, patient]);
            }
            return { success: true };
        } catch (err: any) {
            const message = err?.response?.data?.error || 'Failed to link patient';
            return { success: false, message };
        }
    };

    const addLog = async (
        patientId: string,
        logData: {
            medicationId: string;
            medicationName: string;
            status: 'taken' | 'missed' | 'pending' | 'verified';
            scheduledTime: string;
            actualTime?: string;
            verificationMethod?: 'scan' | 'manual' | 'voice';
            date: string;
        }
    ) => {
        try {
            const result = await logApi.add(patientId, logData);
            // Backend returns updated patient with recalculated adherence
            const updatedPatient: Patient = result.patient;
            setPatients(prev =>
                prev.map(p => p.id === patientId ? { ...p, ...updatedPatient } : p)
            );
        } catch (err: any) {
            console.error('addLog error:', err?.response?.data?.error || err);
            // Optimistic local fallback so UI still updates
            setPatients(prev =>
                prev.map(p => {
                    if (p.id !== patientId) return p;
                    const newLogs = [...p.logs, { id: `log-${Date.now()}`, ...logData }];
                    const takenCount = newLogs.filter(l => l.status === 'taken' || l.status === 'verified').length;
                    return {
                        ...p,
                        logs: newLogs,
                        adherenceScore: Math.round((takenCount / newLogs.length) * 100),
                        lastCheckIn: new Date().toISOString()
                    };
                })
            );
        }
    };

    return (
        <PatientContext.Provider
            value={{
                patients,
                caretakers,
                isLoadingData,
                addPatient,
                addCaretaker,
                addMedication,
                updatePatient,
                updateCaretaker,
                deletePatient,
                getPatientsByCaretaker,
                linkPatientToCaretaker,
                addLog,
                refreshData
            }}
        >
            {children}
        </PatientContext.Provider>
    );
}

export function usePatientContext() {
    const context = useContext(PatientContext);
    if (!context) throw new Error('usePatientContext must be used within PatientProvider');
    return context;
}
