import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    Bell,
    Calendar,
    Clock,
    Activity,
    CheckCircle2,
    AlertCircle,
    ChevronRight,
    TrendingUp,
    Brain,
    MessageCircle,
    Send,
    Pill,
    Scan
} from 'lucide-react';
import { useAuth } from '@/app/context/AuthContext';
import { usePatientContext } from '@/app/context/PatientContext';
import { useLanguage } from '@/app/context/LanguageContext';
import { Button } from '@/app/components/ui/button';
import { Medication } from '@/app/data/mockData';

interface HomeScreenProps {
    onNavigate: (screen: 'home' | 'scan' | 'schedule' | 'logs' | 'notifications' | 'knowledge' | 'ai-dashboard' | 'reports') => void;
    onSelectMedication: (med: Medication) => void;
    onOpenChat: () => void;
}

export function HomeScreen({ onNavigate, onSelectMedication, onOpenChat }: HomeScreenProps) {
    const { patients, updatePatient, addLog } = usePatientContext();
    const { user } = useAuth();
    const { t } = useLanguage();


    const [showNotification, setShowNotification] = useState(true);
    const [isTaken, setIsTaken] = useState(false);
    const [coachSummary, setCoachSummary] = useState<string | null>(null);
    const [loadingCoach, setLoadingCoach] = useState(false);

    // Get current patient data from context
    const currentPatient = patients.find(p => p.id === user?.patientId) || patients[0];

    // Find the next scheduled medication (prioritize overdue, then upcoming)
    const getNextMedication = () => {
        const now = new Date();
        const currentTimeMinutes = now.getHours() * 60 + now.getMinutes();

        let overdueMeds: { med: Medication, time: string, diff: number }[] = [];
        let upcomingMeds: { med: Medication, time: string, diff: number }[] = [];

        for (const med of currentPatient.medications) {
            // Check if already taken today
            // Note: This logic assumes if ANY log exists for today/time it's taken. 
            // Better: Check specifically for this time slot.

            for (const time of med.times) {
                const [h, m] = time.split(':').map(Number);
                const medTimeMinutes = h * 60 + m;

                // Check if this specific slot is logged
                const isTaken = currentPatient.logs.some(
                    log => log.medicationId === med.id &&
                        log.date === now.toISOString().split('T')[0] &&
                        log.scheduledTime === time &&
                        (log.status === 'taken' || log.status === 'verified')
                );

                if (!isTaken) {
                    const diff = medTimeMinutes - currentTimeMinutes;
                    if (diff < 0) {
                        // Overdue (past time)
                        overdueMeds.push({ med, time, diff });
                    } else {
                        // Upcoming
                        upcomingMeds.push({ med, time, diff });
                    }
                }
            }
        }

        // Sort overdue by most recent (or most overdue? usually most overdue needs attention)
        // Let's sort overdue by time asc (earliest missed first)
        overdueMeds.sort((a, b) => a.diff - b.diff);

        // Sort upcoming by time asc (soonest first)
        upcomingMeds.sort((a, b) => a.diff - b.diff);

        // Return earliest overdue, or soonest upcoming
        if (overdueMeds.length > 0) return { ...overdueMeds[0], status: 'overdue' };
        if (upcomingMeds.length > 0) return { ...upcomingMeds[0], status: 'upcoming' };

        return null; // All caught up
    };

    const nextMedData = getNextMedication();
    const activeMed = nextMedData?.med;
    const activeTime = nextMedData?.time || '08:00';
    const isOverdue = nextMedData?.status === 'overdue';

    // Format time for display (e.g., "8:00 AM")
    const formatDisplayTime = (time: string) => {
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        return `${displayHour}:${minutes} ${ampm}`;
    };

    const handleMarkAsTaken = () => {
        if (!activeMed) return;

        setIsTaken(true);

        // Add log with actual time
        if (user?.patientId) {
            const now = new Date();
            addLog(user.patientId, {
                medicationId: activeMed.id,
                medicationName: `${activeMed.name} ${activeMed.dosage}`,
                status: 'taken',
                scheduledTime: activeTime,
                actualTime: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
                verificationMethod: 'manual',
                date: now.toISOString().split('T')[0]
            });

            // toast.success(`Marked ${activeMed.name} as taken!`);
        }

        setTimeout(() => {
            setShowNotification(false);
            // Re-mount notification after delay to show next med if any (simple reset)
            setTimeout(() => {
                setIsTaken(false);
                setShowNotification(true);
            }, 500);
        }, 1500);
    };

    const todayStatus = {
        taken: currentPatient.logs.filter(l => l.status === 'taken' || l.status === 'verified').length,
        total: currentPatient.medications.reduce((acc, med) => acc + med.times.length, 0),
        missed: currentPatient.missedMedsCount
    };

    const adherencePercentage = currentPatient.adherenceScore;

    // Calculate remaining meds for the list
    const getRemainingMeds = () => {
        const now = new Date();
        const currentTimeMinutes = now.getHours() * 60 + now.getMinutes();
        const meds = [];

        for (const med of currentPatient.medications) {
            for (const time of med.times) {
                const [h, m] = time.split(':').map(Number);
                const t = h * 60 + m;

                // Check if valid time parsing
                if (isNaN(t)) continue;

                // Check if already taken
                const isTaken = currentPatient.logs.some(
                    log => log.medicationId === med.id &&
                        log.date === now.toISOString().split('T')[0] &&
                        log.scheduledTime === time &&
                        (log.status === 'taken' || log.status === 'verified')
                );

                if (!isTaken && t > currentTimeMinutes) {
                    meds.push({ ...med, scheduledTime: time, timeVal: t });
                }
            }
        }
        return meds.sort((a, b) => a.timeVal - b.timeVal).slice(0, 3);
    };

    const remainingMeds = getRemainingMeds();

    // Check if patient has ANY medications at all
    const hasMedications = currentPatient.medications.length > 0;

    // Fetch AI Health Coach Summary
    useEffect(() => {
        const fetchCoachSummary = async () => {
            if (!user) return;
            setLoadingCoach(true);
            try {
                const token = localStorage.getItem('adheai_token');
                const res = await fetch('/api/ai/health-coach', {
                    headers: {
                        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                    }
                });
                const data = await res.json();
                if (data.coachSummary) {
                    setCoachSummary(data.coachSummary);
                }
            } catch (err) {
                console.error('Failed to fetch AI coach summary');
            } finally {
                setLoadingCoach(false);
            }
        };

        fetchCoachSummary();
    }, [user, currentPatient.logs.length]); // Refresh when logs change

    return (
        <div className="pb-10 px-4 pt-6 bg-gray-50 min-h-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl" style={{ fontWeight: 700 }}>{t('home.greeting')} {currentPatient.name.split(' ')[0]}!</h1>
                    <p className="text-gray-500 text-sm">{t('home.healthy_day')}</p>
                </div>
                <button
                    onClick={() => onNavigate('notifications')}
                    className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center border border-gray-100 active:scale-95 transition-transform relative"
                >
                    <Bell className="w-6 h-6 text-gray-400" />
                    {/* Show badge if there are notifications or overdue meds */}
                    {(isOverdue || showNotification) && (
                        <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
                    )}
                </button>
            </div>

            {/* High Risk Alert Banner */}
            <AnimatePresence>
                {todayStatus.missed > 0 && (
                    <motion.div
                        initial={{ opacity: 0, height: 0, mb: 0 }}
                        animate={{ opacity: 1, height: 'auto', mb: 32 }}
                        exit={{ opacity: 0, height: 0, mb: 0 }}
                        className="bg-red-50 border-l-4 border-red-600 p-4 rounded-r-2xl shadow-sm cursor-pointer relative overflow-hidden"
                        onClick={() => onNavigate('logs')}
                    >
                        {/* Pulse effect background */}
                        <div className="absolute inset-0 bg-red-600/5 animate-pulse" />
                        
                        <div className="flex items-start relative z-10 text-left">
                            <div className="flex-shrink-0 bg-red-100 p-2 rounded-full">
                                <AlertCircle className="h-6 w-6 text-red-600" />
                            </div>
                            <div className="ml-4">
                                <h3 className="text-sm font-black text-red-800 uppercase tracking-wide">Health Risk Alert</h3>
                                <div className="mt-1 text-xs text-red-700 font-medium">
                                    <p>You have <strong className="text-red-900 text-sm">{todayStatus.missed}</strong> missed medication{todayStatus.missed > 1 ? 's' : ''} today. Missing doses increases your health risk. Please take action immediately or consult your doctor.</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Smart Notification Card */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeMed ? activeMed.id + activeTime : 'empty'}
                    initial={{ opacity: 0, scale: 0.9, y: -20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -20 }}
                    className="relative mb-8 rounded-[2.5rem] overflow-hidden border border-white/40 shadow-2xl"
                >
                    {activeMed ? (
                        <>
                            {/* Glassmorphism Background */}
                            <div className="absolute inset-0 bg-white/40 backdrop-blur-xl" />
                            <div className={`absolute inset-0 bg-gradient-to-br ${isOverdue ? 'from-red-500/10 to-orange-500/10' : 'from-blue-500/10 to-purple-500/10'}`} />

                            <div className="relative p-6">
                                <div className="flex items-center gap-4 mb-5">
                                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${isOverdue ? 'from-red-500 to-orange-600' : 'from-blue-500 to-indigo-600'} flex items-center justify-center shadow-lg transform rotate-3`}>
                                        <Pill className="w-7 h-7 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-lg font-bold text-gray-900">{activeMed.name}</h4>
                                            <span className={`text-xs font-bold ${isOverdue ? 'text-red-600 bg-red-100' : 'text-blue-600 bg-blue-100'} px-2 py-0.5 rounded-full uppercase tracking-tighter`}>
                                                {isOverdue ? t('home.overdue') + ' ' : t('home.due') + ' '}{formatDisplayTime(activeTime)}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 font-medium tracking-tight">{activeMed.dosage} • {activeMed.instructions}</p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <Button
                                        onClick={handleMarkAsTaken}
                                        disabled={isTaken}
                                        className={`flex-1 h-14 rounded-2xl text-sm font-bold transition-all duration-500 ${isTaken
                                            ? 'bg-green-500 hover:bg-green-500 text-white border-none'
                                            : isOverdue
                                                ? 'bg-red-600 hover:bg-red-700 text-white'
                                                : 'bg-gray-900 text-white hover:bg-gray-800'
                                            }`}
                                    >
                                        {isTaken ? (
                                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-2">
                                                <CheckCircle2 className="w-5 h-5" />
                                                {t('home.taken')}
                                            </motion.div>
                                        ) : (
                                            t('notif.mark_taken')
                                        )}
                                    </Button>
                                    <Button
                                        onClick={() => onNavigate('scan')}
                                        variant="outline"
                                        className="flex-1 h-14 rounded-2xl border-2 border-gray-200 text-gray-900 font-bold hover:bg-gray-50 bg-white/50"
                                    >
                                        <Scan className="w-4 h-4 mr-2" />
                                        {t('nav.scan')}
                                    </Button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="relative p-8 text-center bg-white/60 backdrop-blur-xl">
                            {hasMedications ? (
                                <>
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle2 className="w-8 h-8 text-green-600" />
                                    </div>
                                    <h4 className="text-lg font-bold text-gray-900 mb-1">{t('home.no_meds_title')}</h4>
                                    <p className="text-sm text-gray-500">{t('home.no_meds')}</p>
                                    <Button
                                        variant="link"
                                        onClick={() => onNavigate('schedule')}
                                        className="mt-2 text-blue-600 font-semibold"
                                    >
                                        {t('home.view_tomorrow')}
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Pill className="w-8 h-8 text-blue-600" />
                                    </div>
                                    <h4 className="text-lg font-bold text-gray-900 mb-1">{t('home.no_meds_yet')}</h4>
                                    <p className="text-sm text-gray-500 mb-4">{t('home.add_first_med')}</p>
                                    <Button
                                        onClick={() => onNavigate('schedule')}
                                        className="bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-200"
                                    >
                                        {t('common.add')} {t('nav.schedule')}
                                    </Button>
                                </>
                            )}
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

            {/* AI Chat Bar */}
            < motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <div
                    onClick={onOpenChat}
                    className="w-full h-14 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center px-4 gap-3 cursor-pointer group hover:border-blue-200 transition-all"
                >
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                        <MessageCircle className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="text-sm text-gray-400 flex-1">{t('kb.ask_ai')}</span>
                    <Send className="w-4 h-4 text-gray-300" />
                </div>
            </motion.div >

            {/* Adherence Card */}
            < motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => onNavigate('reports')}
                className="relative rounded-[2.5rem] p-7 text-white shadow-[0_20px_50px_rgba(0,0,0,0.1)] mb-8 overflow-hidden cursor-pointer active:scale-[0.98] transition-all group"
            >
                {/* Mesh Gradient Background */}
                < div className="absolute inset-0 bg-gradient-to-br from-indigo-700 via-violet-600 to-blue-600" />
                <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-400/30 rounded-full blur-[60px] animate-pulse" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-purple-400/30 rounded-full blur-[60px] animate-pulse delay-700" />

                {/* Content Overlay */}
                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
                                <Activity className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <span className="text-xs font-bold uppercase tracking-wider text-white/70">{t('ai.health_score')}</span>
                                <h3 className="text-sm font-semibold">{t('home.adherence_summary')}</h3>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 bg-white/15 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold border border-white/10">
                            <TrendingUp className="w-3 h-3" />
                            +4%
                        </div>
                    </div>

                    <div className="flex items-end justify-between">
                        <div>
                            <div className="flex items-baseline gap-1">
                                <p className="text-5xl" style={{ fontWeight: 800 }}>{adherencePercentage}</p>
                                <span className="text-2xl font-bold text-white/60">%</span>
                            </div>
                            <p className="text-white/80 text-sm mt-2 font-medium tracking-wide">
                                {t('home.excellent_progress').replace('{name}', currentPatient.name.split(' ')[0])}
                            </p>
                        </div>
                        <div className="w-24 h-24 relative group-hover:scale-105 transition-transform duration-500">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle
                                    cx="48"
                                    cy="48"
                                    r="42"
                                    fill="none"
                                    stroke="rgba(255,255,255,0.1)"
                                    strokeWidth="10"
                                />
                                <motion.circle
                                    cx="48"
                                    cy="48"
                                    r="42"
                                    fill="none"
                                    stroke="white"
                                    strokeWidth="10"
                                    strokeDasharray="264"
                                    initial={{ strokeDashoffset: 264 }}
                                    animate={{ strokeDashoffset: 264 - (adherencePercentage / 100) * 264 }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
                                    <CheckCircle2 className="w-6 h-6 text-white" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div >

            {/* Stats Quick Grid */}
            < div className="grid grid-cols-2 gap-4 mb-8" >
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    onClick={() => onNavigate('logs')}
                    className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm cursor-pointer active:scale-95 transition-all"
                >
                    <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center mb-3">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{todayStatus.taken}</p>
                    <p className="text-gray-500 text-xs mt-1">{t('home.taken')}</p>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    onClick={() => onNavigate('logs')}
                    className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm cursor-pointer active:scale-95 transition-all"
                >
                    <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center mb-3">
                        <AlertCircle className="w-5 h-5 text-amber-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{todayStatus.missed}</p>
                    <p className="text-gray-500 text-xs mt-1">{t('home.missed')}</p>
                </motion.div>
            </div >

            {/* AI Insight Overlay - Now Dynamic Health Coach */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                onClick={() => onNavigate('ai-dashboard')}
                className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-100 rounded-3xl p-6 mb-8 flex gap-5 items-start cursor-pointer active:scale-[0.98] transition-all shadow-sm hover:shadow-md"
            >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-200">
                    <Brain className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-bold text-purple-900">{t('ai.insights')}</h4>
                        <span className="text-[10px] font-bold text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full uppercase tracking-tighter">AI Coach</span>
                    </div>
                    {loadingCoach ? (
                        <div className="space-y-2">
                            <div className="w-full h-3 bg-purple-100 animate-pulse rounded-full" />
                            <div className="w-2/3 h-3 bg-purple-100 animate-pulse rounded-full" />
                        </div>
                    ) : (
                        <p className="text-xs text-purple-800 leading-relaxed font-medium italic">
                            {coachSummary || "Hello! I'm analyzing your health patterns. Log your meds to see personalized insights here."}
                        </p>
                    )}
                </div>
            </motion.div >

            {/* Today's Schedule (Remaining only) */}
            < div className="mb-4" >
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900">{t('home.upcoming')} {t('common.today')}</h3>
                    <button
                        onClick={() => onNavigate('schedule')}
                        className="text-sm font-semibold text-blue-600 flex items-center active:underline"
                    >
                        {t('home.view_all')} <ChevronRight className="w-4 h-4 ml-0.5" />
                    </button>
                </div>

                {remainingMeds.length > 0 ? (
                    <div className="space-y-4">
                        {remainingMeds.map((med, index) => (
                            <motion.div
                                key={`${med.id}-${med.scheduledTime}`}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 + index * 0.1 }}
                                className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4 group hover:border-blue-100 transition-colors"
                            >
                                <div
                                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl shadow-inner group-hover:scale-110 transition-transform"
                                    style={{ backgroundColor: `${med.color}20`, color: med.color }}
                                >
                                    {med.shape === 'round' ? '💊' : '🧪'}
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-sm font-bold text-gray-900">{med.name}</h4>
                                    <div className="flex items-center gap-3 mt-1 text-gray-500 text-xs">
                                        <span className="flex items-center gap-1 font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                                            <Clock className="w-3 h-3" />
                                            {formatDisplayTime(med.scheduledTime)}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Activity className="w-3 h-3" />
                                            {med.dosage}
                                        </span>
                                    </div>
                                </div>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="rounded-xl border-gray-200 text-xs h-9 hover:border-blue-500 hover:text-blue-600 transition-colors"
                                    onClick={() => onSelectMedication(med)}
                                >
                                    {t('caretaker.view_details')}
                                </Button>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-6 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                        <CheckCircle2 className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">{t('home.no_meds')}</p>
                    </div>
                )}
            </div >
        </div >
    );
}
