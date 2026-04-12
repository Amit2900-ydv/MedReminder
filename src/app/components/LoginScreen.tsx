import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, Eye, EyeOff, Fingerprint, AlertCircle, HeartPulse, Shield, User, Users } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { useAuth } from '@/app/context/AuthContext';
import { usePatientContext } from '@/app/context/PatientContext';
import { useLanguage } from '@/app/context/LanguageContext';

export function LoginScreen() {
    const { login, signup, isLoading } = useAuth();
    const { addPatient, addCaretaker } = usePatientContext();
    const { t } = useLanguage();
    const [isLoginMode, setIsLoginMode] = useState(true);
    const [userType, setUserType] = useState<'patient' | 'caretaker'>('patient');

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');

    const handleDemoFill = (demoEmail: string, demoPass: string) => {
        setEmail(demoEmail);
        setPassword(demoPass);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!email || !password || (!isLoginMode && !name)) {
            setError(t('login.error_fields'));
            return;
        }

        try {
            if (isLoginMode) {
                const res = await login(email, password);
                if (!res.success) {
                    setError(res.message || 'Login failed');
                }
            } else {
                if (!name.trim()) {
                    setError(t('login.error_name'));
                    return;
                }
                const res = await signup(email, password, name, userType);
                if (res.success && res.user) {
                    // Create corresponding profile in PatientContext
                    if (userType === 'patient' && res.user.patientId) {
                        addPatient(null, {
                            id: res.user.patientId, // Ensure ID matches
                            name: name,
                            email: email,
                            phone: '',
                            age: 0,
                            avatar: '👤'
                        });
                    } else if (userType === 'caretaker' && res.user.caretakerId) {
                        addCaretaker(res.user.caretakerId, {
                            name: name,
                            email: email,
                            role: 'Family Caregiver'
                        });
                    }
                } else if (!res.success) {
                    setError(res.message || 'Signup failed');
                }
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        }
    };

    return (
        <div className="h-full flex flex-col bg-gradient-to-br from-blue-50 via-white to-purple-50 overflow-y-auto">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="pt-16 pb-8 px-6 text-center"
            >
                <div className="flex justify-center mb-4">
                    <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-2xl">
                        <HeartPulse className="w-10 h-10 text-white" />
                    </div>
                </div>

                <h1 className="text-3xl mb-2" style={{ fontWeight: 700 }}>{t('login.welcome')}</h1>
                <p className="text-gray-600">{t('login.tagline')}</p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex-1 px-6"
            >
                {/* Toggle Login/Signup */}
                <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
                    <button
                        onClick={() => setIsLoginMode(true)}
                        className={`flex-1 py-3 rounded-lg text-sm transition-all ${isLoginMode ? 'bg-white shadow-sm text-gray-900 font-bold' : 'text-gray-500'}`}
                    >
                        {t('login.sign_in')}
                    </button>
                    <button
                        onClick={() => setIsLoginMode(false)}
                        className={`flex-1 py-3 rounded-lg text-sm transition-all ${!isLoginMode ? 'bg-white shadow-sm text-gray-900 font-bold' : 'text-gray-500'}`}
                    >
                        {t('login.sign_up')}
                    </button>
                </div>

                {/* User Type Toggle */}
                <div className="mb-6">
                    <p className="text-sm text-gray-700 mb-3 text-center">{t('login.i_am_a')}</p>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <button
                            type="button"
                            onClick={() => setUserType('patient')}
                            className={`h-14 rounded-2xl border-2 transition-all ${userType === 'patient'
                                ? 'bg-blue-50 border-blue-500 text-blue-700'
                                : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                                }`}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <User className="w-5 h-5" />
                                <span style={{ fontWeight: userType === 'patient' ? 600 : 400 }}>{t('login.patient')}</span>
                            </div>
                        </button>
                        <button
                            type="button"
                            onClick={() => setUserType('caretaker')}
                            className={`h-14 rounded-2xl border-2 transition-all ${userType === 'caretaker'
                                ? 'bg-purple-50 border-purple-500 text-purple-700'
                                : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                                }`}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <Users className="w-5 h-5" />
                                <span style={{ fontWeight: userType === 'caretaker' ? 600 : 400 }}>{t('login.caretaker')}</span>
                            </div>
                        </button>
                    </div>

                    {/* Demo Credentials Hint */}
                    <AnimatePresence>
                        {userType === 'caretaker' && isLoginMode && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                onClick={() => handleDemoFill('caretaker@demo.com', 'demo123')}
                                className="bg-purple-50 border border-purple-100 rounded-xl p-3 text-xs text-purple-700 overflow-hidden cursor-pointer active:scale-95 transition-transform"
                            >
                                <div className="flex items-center gap-2 font-bold mb-1">
                                    <Shield className="w-3 h-3" />
                                    {t('login.demo_caretaker')}
                                </div>
                                <div className="flex justify-between">
                                    <span>{t('login.email_label')}: <span className="font-mono">caretaker@demo.com</span></span>
                                    <span>Pass: <span className="font-mono">demo123</span></span>
                                </div>
                            </motion.div>
                        )}
                        {/* Demo Credentials Hint for Patient */}
                        {userType === 'patient' && isLoginMode && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                onClick={() => handleDemoFill('patient@demo.com', 'patient123')}
                                className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-700 overflow-hidden cursor-pointer active:scale-95 transition-transform"
                            >
                                <div className="flex items-center gap-2 font-bold mb-1">
                                    <Shield className="w-3 h-3" />
                                    {t('login.demo_patient')}
                                </div>
                                <div className="flex justify-between">
                                    <span>{t('login.email_label')}: <span className="font-mono">patient@demo.com</span></span>
                                    <span>Pass: <span className="font-mono">patient123</span></span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLoginMode && (
                        <div>
                            <label className="block text-sm text-gray-700 mb-2">{t('login.full_name')}</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder={t('login.full_name_placeholder')}
                                    className="w-full pl-12 h-14 bg-white border border-gray-200 rounded-2xl shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                                />
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm text-gray-700 mb-2">{t('login.email_label')}</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder={t('login.email_placeholder')}
                                className="w-full pl-12 h-14 bg-white border border-gray-200 rounded-2xl shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm text-gray-700 mb-2">{t('login.password_label')}</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder={t('login.password_placeholder')}
                                className="w-full pl-12 pr-12 h-14 bg-white border border-gray-200 rounded-2xl shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-xl text-sm"
                        >
                            <AlertCircle className="w-4 h-4" />
                            {error}
                        </motion.div>
                    )}

                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-14 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-2xl shadow-lg font-semibold"
                    >
                        {isLoading ? t('login.processing') : isLoginMode ? t('login.sign_in') : t('login.create_account')}
                    </Button>
                </form>

                <div className="mt-8 text-center px-4 mb-8">
                    <div className="flex items-center justify-center gap-2 text-blue-600 bg-blue-50 p-3 rounded-xl border border-blue-100">
                        <Shield className="w-5 h-5" />
                        <span className="text-sm font-semibold">{t('login.secure_hint')}</span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
