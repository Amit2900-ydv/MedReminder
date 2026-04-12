import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '@/services/api';

// Re-export the User type that the rest of the app uses
export interface User {
    id: string;
    email: string;
    type: 'patient' | 'caretaker';
    patientId?: string;
    caretakerId?: string;
    name?: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
    signup: (email: string, password: string, name: string, type: 'patient' | 'caretaker') => Promise<{ success: boolean; message?: string; user?: User }>;
    logout: () => void;
    updateUser: (updates: Partial<User>) => void;
    voiceEnabled: boolean;
    setVoiceEnabled: (enabled: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [voiceEnabled, setVoiceEnabled] = useState<boolean>(() => {
        try {
            const saved = localStorage.getItem('voice_enabled');
            return saved !== null ? JSON.parse(saved) : true;
        } catch {
            return true;
        }
    });

    // Save voice preference
    useEffect(() => {
        localStorage.setItem('voice_enabled', JSON.stringify(voiceEnabled));
    }, [voiceEnabled]);

    // Restore session from stored token on mount
    useEffect(() => {
        const restoreSession = async () => {
            const token = localStorage.getItem('adheai_token');
            if (!token) {
                setIsLoading(false);
                return;
            }
            try {
                const data = await authApi.me();
                const u = data.user;
                setUser({
                    id: u._id || u.id,
                    email: u.email,
                    type: u.type,
                    patientId: u.patientId,
                    caretakerId: u.caretakerId,
                    name: u.name
                });
            } catch {
                localStorage.removeItem('adheai_token');
                localStorage.removeItem('adheai_user');
            } finally {
                setIsLoading(false);
            }
        };
        restoreSession();
    }, []);

    const login = async (email: string, password: string) => {
        try {
            const data = await authApi.login(email.trim(), password.trim());
            const u = data.user;
            const mappedUser: User = {
                id: u._id || u.id,
                email: u.email,
                type: u.type,
                patientId: u.patientId,
                caretakerId: u.caretakerId,
                name: u.name
            };
            localStorage.setItem('adheai_token', data.token);
            localStorage.setItem('adheai_user', JSON.stringify(mappedUser));
            setUser(mappedUser);
            return { success: true };
        } catch (err: any) {
            let message = 'Invalid email or password';
            const status = err?.response?.status;
            
            // If it's a 400 or 401, it's an actual authentication error from our backend.
            if (status === 401 || status === 400) {
                if (err?.response?.data?.error) {
                    message = err.response.data.error;
                }
            } else {
                // For 500, 502, 504 or Network Errors (no response), assume the backend is down.
                message = 'Backend server is not running. Please run "npm run dev:all" instead of "npm run dev".';
            }
            return { success: false, message };
        }
    };

    const signup = async (email: string, password: string, name: string, type: 'patient' | 'caretaker') => {
        try {
            const data = await authApi.register({ email: email.trim(), password, name, type });
            const u = data.user;
            const mappedUser: User = {
                id: u._id || u.id,
                email: u.email,
                type: u.type,
                patientId: u.patientId,
                caretakerId: u.caretakerId,
                name: u.name
            };
            localStorage.setItem('adheai_token', data.token);
            localStorage.setItem('adheai_user', JSON.stringify(mappedUser));
            setUser(mappedUser);
            return { success: true, user: mappedUser };
        } catch (err: any) {
            let message = 'Registration failed';
            const status = err?.response?.status;
            
            if (status === 400 || status === 409) {
                if (err?.response?.data?.error) {
                    message = err.response.data.error;
                }
            } else {
                message = 'Backend server is not running. Please run "npm run dev:all" instead of "npm run dev".';
            }
            return { success: false, message };
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('adheai_token');
        localStorage.removeItem('adheai_user');
    };

    const updateUser = (updates: Partial<User>) => {
        if (!user) return;
        const updatedUser = { ...user, ...updates };
        setUser(updatedUser);
        localStorage.setItem('adheai_user', JSON.stringify(updatedUser));
        // Optionally persist to backend
        if (updates.name || (updates as any).phone) {
            authApi.updateMe({ name: updates.name, phone: (updates as any).phone }).catch(console.error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, signup, logout, updateUser, voiceEnabled, setVoiceEnabled }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
}
