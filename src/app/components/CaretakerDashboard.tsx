import { motion } from 'motion/react';
import { Users, TrendingUp, AlertCircle, Phone, Eye } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Patient } from '@/app/data/mockData';
import { usePatientContext } from '@/app/context/PatientContext';

interface CaretakerDashboardProps {
    patientIds: string[];
    caretakerName: string;
    onViewPatient: (patientId: string) => void;
}

export function CaretakerDashboard({ patientIds, caretakerName, onViewPatient }: CaretakerDashboardProps) {
    const { patients: allPatients } = usePatientContext();
    const patients = patientIds.map(id => allPatients.find(p => p.id === id)).filter(Boolean) as Patient[];

    // Calculate overall statistics
    const avgAdherence = patients.length > 0
        ? Math.round(patients.reduce((sum, p) => sum + p.adherenceScore, 0) / patients.length)
        : 0;
    const totalMissedMeds = patients.reduce((sum, p) => sum + p.missedMedsCount, 0);
    const patientsWithIssues = patients.filter(p => p.adherenceScore < 80 || p.missedMedsCount > 2).length;

    const getAdherenceColor = (score: number) => {
        if (score >= 90) return 'from-green-500 to-emerald-600';
        if (score >= 75) return 'from-yellow-500 to-orange-500';
        return 'from-red-500 to-pink-600';
    };

    const getAdherenceTextColor = (score: number) => {
        if (score >= 90) return 'text-green-700';
        if (score >= 75) return 'text-orange-700';
        return 'text-red-700';
    };

    const formatLastCheckIn = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

        if (diffHours < 1) return 'Just now';
        if (diffHours < 24) return `${diffHours}h ago`;
        return `${Math.floor(diffHours / 24)}d ago`;
    };

    return (
        <div className="pb-10 px-4 pt-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
            >
                <h1 className="text-2xl mb-1" style={{ fontWeight: 700 }}>
                    Welcome, {caretakerName}
                </h1>
                <p className="text-gray-600">Managing {patients.length} patients</p>
            </motion.div>

            {/* Overall Statistics */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-3 gap-3 mb-6"
            >
                <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-blue-600" />
                        <p className="text-xs text-gray-600">Avg Adherence</p>
                    </div>
                    <p className="text-2xl" style={{ fontWeight: 700 }}>{avgAdherence}%</p>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="w-4 h-4 text-orange-600" />
                        <p className="text-xs text-gray-600">Missed</p>
                    </div>
                    <p className="text-2xl" style={{ fontWeight: 700 }}>{totalMissedMeds}</p>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                        <Users className="w-4 h-4 text-purple-600" />
                        <p className="text-xs text-gray-600">Alerts</p>
                    </div>
                    <p className="text-2xl" style={{ fontWeight: 700 }}>{patientsWithIssues}</p>
                </div>
            </motion.div>

            {/* Patients List */}
            <div className="mb-4">
                <h2 className="text-lg mb-3" style={{ fontWeight: 700 }}>Your Patients</h2>
            </div>

            <div className="space-y-4">
                {patients.map((patient, index) => (
                    <motion.div
                        key={patient.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm"
                    >
                        {/* Patient Header */}
                        <div className="flex items-start gap-4 mb-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center text-3xl flex-shrink-0">
                                {patient.avatar}
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg mb-1" style={{ fontWeight: 700 }}>{patient.name}</h3>
                                <p className="text-sm text-gray-600 mb-2">{patient.age} years old</p>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <span>Last check-in: {formatLastCheckIn(patient.lastCheckIn)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Adherence Score */}
                        <div className="mb-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-gray-600">Adherence Score</span>
                                <span className={`text-lg ${getAdherenceTextColor(patient.adherenceScore)}`} style={{ fontWeight: 700 }}>
                                    {patient.adherenceScore}%
                                </span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${patient.adherenceScore}%` }}
                                    transition={{ duration: 1, delay: index * 0.1 + 0.3 }}
                                    className={`h-full bg-gradient-to-r ${getAdherenceColor(patient.adherenceScore)}`}
                                />
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 gap-3 mb-4">
                            <div className="bg-blue-50 rounded-xl p-3">
                                <p className="text-xs text-blue-700 mb-1">Medications</p>
                                <p className="text-lg text-blue-900" style={{ fontWeight: 700 }}>
                                    {patient.medications.length}
                                </p>
                            </div>
                            <div className={`rounded-xl p-3 ${patient.missedMedsCount > 0 ? 'bg-red-50' : 'bg-green-50'}`}>
                                <p className={`text-xs mb-1 ${patient.missedMedsCount > 0 ? 'text-red-700' : 'text-green-700'}`}>
                                    Missed Today
                                </p>
                                <p className={`text-lg ${patient.missedMedsCount > 0 ? 'text-red-900' : 'text-green-900'}`} style={{ fontWeight: 700 }}>
                                    {patient.missedMedsCount}
                                </p>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                            <Button
                                onClick={() => onViewPatient(patient.id)}
                                className="flex-1 h-11 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                            >
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                            </Button>
                            <Button
                                variant="outline"
                                className="h-11 px-4 border-2 border-gray-200"
                            >
                                <Phone className="w-4 h-4" />
                            </Button>
                        </div>

                        {/* Alert Badge */}
                        {(patient.adherenceScore < 80 || patient.missedMedsCount > 2) && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.1 + 0.5 }}
                                className="mt-3 flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl"
                            >
                                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                                <p className="text-xs text-amber-800">
                                    {patient.adherenceScore < 80
                                        ? 'Low adherence - needs attention'
                                        : 'Multiple missed medications'}
                                </p>
                            </motion.div>
                        )}
                    </motion.div>
                ))}
            </div>

            {/* Empty State */}
            {patients.length === 0 && (
                <div className="text-center py-12">
                    <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No patients assigned</p>
                </div>
            )}
        </div>
    );
}
