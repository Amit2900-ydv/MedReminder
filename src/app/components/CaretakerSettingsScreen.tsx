import { motion } from 'motion/react';
import { Bell, Moon, Globe, Shield, LogOut, User, Mail, Phone } from 'lucide-react';
import { Button } from '@/app/components/ui/button';

interface CaretakerSettingsScreenProps {
    caretaker: {
        name: string;
        email: string;
        phone: string;
        avatar: string;
    };
    onLogout: () => void;
}

export function CaretakerSettingsScreen({ caretaker, onLogout }: CaretakerSettingsScreenProps) {
    return (
        <div className="pb-24 px-4 pt-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
            >
                <h1 className="text-2xl mb-1" style={{ fontWeight: 700 }}>Settings</h1>
                <p className="text-gray-600">Manage your preferences</p>
            </motion.div>

            {/* Profile Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl p-5 mb-4 border border-gray-100 shadow-sm"
            >
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl">
                        {caretaker.avatar || '👨‍⚕️'}
                    </div>
                    <div className="flex-1">
                        <h2 className="text-lg mb-1" style={{ fontWeight: 700 }}>{caretaker.name}</h2>
                        <p className="text-sm text-gray-600">Caretaker Account</p>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                        <Mail className="w-4 h-4 text-gray-600" />
                        <span className="text-sm">{caretaker.email}</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                        <Phone className="w-4 h-4 text-gray-600" />
                        <span className="text-sm">{caretaker.phone || 'No phone added'}</span>
                    </div>
                </div>
            </motion.div>

            {/* Notification Settings */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-3xl p-5 mb-4 border border-gray-100 shadow-sm"
            >
                <h3 className="text-base mb-4" style={{ fontWeight: 700 }}>Notifications</h3>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Bell className="w-5 h-5 text-blue-600" />
                            <div>
                                <p className="text-sm" style={{ fontWeight: 600 }}>Patient Alerts</p>
                                <p className="text-xs text-gray-600">Get notified when patients miss medications</p>
                            </div>
                        </div>
                        <div className="w-12 h-6 bg-blue-600 rounded-full relative cursor-pointer">
                            <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Bell className="w-5 h-5 text-gray-400" />
                            <div>
                                <p className="text-sm" style={{ fontWeight: 600 }}>Daily Summary</p>
                                <p className="text-xs text-gray-600">Receive daily adherence reports</p>
                            </div>
                        </div>
                        <div className="w-12 h-6 bg-gray-200 rounded-full relative cursor-pointer">
                            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Appearance Settings */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-3xl p-5 mb-4 border border-gray-100 shadow-sm"
            >
                <h3 className="text-base mb-4" style={{ fontWeight: 700 }}>Appearance</h3>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Moon className="w-5 h-5 text-gray-400" />
                            <div>
                                <p className="text-sm" style={{ fontWeight: 600 }}>Dark Mode</p>
                                <p className="text-xs text-gray-600">Switch to dark theme</p>
                            </div>
                        </div>
                        <div className="w-12 h-6 bg-gray-200 rounded-full relative cursor-pointer">
                            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Globe className="w-5 h-5 text-blue-600" />
                            <div>
                                <p className="text-sm" style={{ fontWeight: 600 }}>Language</p>
                                <p className="text-xs text-gray-600">English (India)</p>
                            </div>
                        </div>
                        <span className="text-xs text-gray-400">›</span>
                    </div>
                </div>
            </motion.div>

            {/* Privacy & Security */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-3xl p-5 mb-4 border border-gray-100 shadow-sm"
            >
                <h3 className="text-base mb-4" style={{ fontWeight: 700 }}>Privacy & Security</h3>

                <div className="space-y-3">
                    <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
                        <div className="flex items-center gap-3">
                            <Shield className="w-5 h-5 text-green-600" />
                            <span className="text-sm" style={{ fontWeight: 600 }}>Change Password</span>
                        </div>
                        <span className="text-xs text-gray-400">›</span>
                    </button>

                    <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
                        <div className="flex items-center gap-3">
                            <User className="w-5 h-5 text-purple-600" />
                            <span className="text-sm" style={{ fontWeight: 600 }}>Privacy Policy</span>
                        </div>
                        <span className="text-xs text-gray-400">›</span>
                    </button>
                </div>
            </motion.div>

            {/* Logout Button */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                <Button
                    onClick={onLogout}
                    variant="outline"
                    className="w-full h-12 border-2 border-red-200 text-red-600 hover:bg-red-50"
                >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                </Button>
            </motion.div>

            {/* App Version */}
            <p className="text-center text-xs text-gray-400 mt-6">MedReminder v1.0.0</p>
        </div>
    );
}
