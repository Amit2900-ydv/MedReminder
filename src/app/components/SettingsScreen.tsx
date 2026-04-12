import { useState } from 'react';
import { motion } from 'motion/react';
import { Settings, Globe, Volume2, Bell, Moon, User, Shield, HelpCircle, LogOut, ChevronRight } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/app/components/ui/dialog";
import { useAuth } from '@/app/context/AuthContext';
import { usePatientContext } from '@/app/context/PatientContext';
import { useLanguage } from '@/app/context/LanguageContext';
import { Medication } from '@/app/data/mockData';

interface SettingsScreenProps {
  onLogout?: () => void;
}

export function SettingsScreen({ onLogout }: SettingsScreenProps = {}) {
  const { user, updateUser, voiceEnabled, setVoiceEnabled } = useAuth();
  const { patients, caretakers, updatePatient, updateCaretaker, addPatient, addCaretaker } = usePatientContext();
  const { language, setLanguage, t } = useLanguage();

  // Profile state
  const [isEditing, setIsEditing] = useState(false);
  const [profileName, setProfileName] = useState(() => {
    if (!user) return t('settings.guest_user');
    if (user.type === 'patient') {
      const patient = patients.find((p: any) => p.id === user.patientId);
      return patient?.name || t('common.patient');
    }
    const caretaker = caretakers.find((c: any) => c.id === user.caretakerId);
    return caretaker?.name || t('common.caretaker');
  });
  const [profileEmail, setProfileEmail] = useState(user?.email || 'guest@example.com');


  // Local state for other toggles
  const [audioReminders, setAudioReminders] = useState(true);
  const [medicationReminders, setMedicationReminders] = useState(true);
  const [aiInsightsEnabled, setAiInsightsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState<'Automatic' | 'Light' | 'Dark'>('Automatic');

  // Dialog states
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(language);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const cycleDarkMode = () => {
    const modes: ('Automatic' | 'Light' | 'Dark')[] = ['Automatic', 'Light', 'Dark'];
    const currentIndex = modes.indexOf(darkMode);
    setDarkMode(modes[(currentIndex + 1) % modes.length]);
  };

  const modeStyles = {
    Dark: 'bg-slate-900 text-white border-slate-800',
    Light: 'bg-gray-50 text-gray-900 border-gray-100',
    Automatic: 'bg-white text-gray-900 border-gray-100'
  };

  return (
    <div className={`min-h-screen pb-24 px-4 pt-6 transition-colors duration-500 ${darkMode === 'Dark' ? 'bg-slate-900' : 'bg-gray-50'}`}>
      <div className="mb-6">
        <h1 className="text-2xl mb-2" style={{ fontWeight: 700 }}>{t('settings.title')}</h1>
        <p className="text-gray-600">{t('settings.subtitle')}</p>
      </div>

      {/* Profile Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl p-6 mb-6 text-white shadow-xl"
      >
        {!isEditing ? (
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-3xl">
              {user?.type === 'patient' ? '👨‍🦳' : '👨‍⚕️'}
            </div>
            <div className="flex-1">
              <h3 className="text-lg mb-1" style={{ fontWeight: 700 }}>{profileName}</h3>
              <p className="text-sm opacity-90">{profileEmail}</p>
            </div>
            <Button
              onClick={() => setIsEditing(true)}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/10"
            >
              {t('common.edit')}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold">{t('settings.edit_profile')}</h3>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-white/10"
                  onClick={() => setIsEditing(false)}
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  size="sm"
                  className="bg-white text-blue-600 hover:bg-blue-50 shadow-md transform active:scale-95 transition-all"
                  onClick={() => {
                    const updates = { name: profileName, email: profileEmail };

                    if (user?.type === 'patient' && user.patientId) {
                      const existingPatient = patients.find((p: any) => p.id === user.patientId);
                      if (existingPatient) {
                        updatePatient(user.patientId, updates);
                      } else {
                        // Create missing profile
                        addPatient(null, {
                          id: user.patientId,
                          name: profileName,
                          email: profileEmail,
                          phone: '',
                          age: 0,
                          avatar: '👤'
                        });
                      }
                    } else if (user?.type === 'caretaker' && user.caretakerId) {
                      const existingCaretaker = caretakers.find((c: any) => c.id === user.caretakerId);
                      if (existingCaretaker) {
                        updateCaretaker(user.caretakerId, updates);
                      } else {
                        // Create missing profile
                        addCaretaker(user.caretakerId, {
                          name: profileName,
                          email: profileEmail,
                          role: 'Family Caregiver'
                        });
                      }
                    }

                    // Update the auth session too so it persists on refresh
                    updateUser({ email: profileEmail });
                    setIsEditing(false);
                    toast.success(t('settings.profile_updated'));
                  }}
                >
                  {t('common.save_changes')}
                </Button>
              </div>
            </div>
            <div className="space-y-3 text-gray-800">
              <div className="space-y-1">
                <label className="text-xs text-white/80 font-semibold ml-1">{t('settings.name_label')}</label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full bg-white/90 backdrop-blur-sm rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white/50 transition-all font-medium"
                  placeholder={t('settings.name_placeholder')}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-white/80 font-semibold ml-1">{t('settings.email_label')}</label>
                <input
                  type="email"
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
                  className="w-full bg-white/90 backdrop-blur-sm rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white/50 transition-all font-medium"
                  placeholder={t('settings.email_placeholder')}
                />
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Voice & Language Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <h3 className="text-sm text-gray-600 mb-3 px-1" style={{ fontWeight: 600 }}>{t('settings.voice_lang_section')}</h3>
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <Dialog open={isLanguageOpen} onOpenChange={setIsLanguageOpen}>
            <DialogTrigger asChild>
              <button
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b border-gray-100"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Globe className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm" style={{ fontWeight: 600 }}>{t('settings.language')}</p>
                    <p className="text-xs text-gray-600">{language}</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{t('settings.select_language')}</DialogTitle>
                <DialogDescription>
                  {t('settings.language_desc')}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                {['English (US)', 'English (India)', 'Hinglish', 'Hindi', 'Gujarati', 'Marathi'].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => {
                      setLanguage(lang as any);
                      setIsLanguageOpen(false);
                      toast.success(t('settings.lang_changed').replace('{lang}', lang));
                    }}
                    className={`flex items-center justify-between p-3 rounded-xl border ${selectedLanguage === lang ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:bg-gray-50'}`}
                  >
                    <span className="font-medium">{lang}</span>
                    {selectedLanguage === lang && <div className="w-3 h-3 bg-blue-500 rounded-full" />}
                  </button>
                ))}
              </div>
            </DialogContent>
          </Dialog>

          <div className="w-full flex items-center justify-between p-4 bg-white transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Volume2 className="w-5 h-5 text-purple-600" />
              </div>
              <div className="text-left">
                <p className="text-sm" style={{ fontWeight: 600 }}>{t('settings.voice_assistant')}</p>
                <p className="text-xs text-gray-600">{voiceEnabled ? t('settings.voice_status_on') : t('settings.voice_status_off')}</p>
              </div>
            </div>
            <button
              onClick={() => {
                setVoiceEnabled(!voiceEnabled);
                toast.success(!voiceEnabled ? t('settings.voice_enabled_toast') : t('settings.voice_disabled_toast'));
              }}
              className={`w-12 h-6 rounded-full transition-colors relative ${voiceEnabled ? 'bg-purple-600' : 'bg-gray-200'}`}
            >
              <motion.div
                animate={{ x: voiceEnabled ? 26 : 2 }}
                className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
              />
            </button>
          </div>

          <div className="border-t border-gray-100" />

          <button
            onClick={() => {
              setAudioReminders(!audioReminders);
              toast.success(!audioReminders ? t('settings.audio_enabled_toast') : t('settings.audio_disabled_toast'));
            }}
            className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Volume2 className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-left">
                <p className="text-sm" style={{ fontWeight: 600 }}>{t('settings.audio_reminders')}</p>
                <p className="text-xs text-gray-600">{audioReminders ? t('common.enabled') : t('common.disabled')}</p>
              </div>
            </div>
            <div className={`w-12 h-6 rounded-full relative transition-colors ${audioReminders ? 'bg-green-500' : 'bg-gray-200'}`}>
              <motion.div
                animate={{ x: audioReminders ? 26 : 2 }}
                className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
              />
            </div>
          </button>
        </div>
      </motion.div>

      {/* Notifications */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-6"
      >
        <h3 className="text-sm text-gray-600 mb-3 px-1" style={{ fontWeight: 600 }}>{t('settings.notifications_section')}</h3>
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <button
            onClick={() => {
              setMedicationReminders(!medicationReminders);
              toast.success(t('settings.med_reminders_toast'));
            }}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b border-gray-100"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Bell className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-left">
                <p className="text-sm" style={{ fontWeight: 600 }}>{t('settings.med_reminders')}</p>
                <p className="text-xs text-gray-600">{t('settings.med_reminders_desc')}</p>
              </div>
            </div>
            <div className={`w-12 h-6 rounded-full relative transition-colors ${medicationReminders ? 'bg-green-500' : 'bg-gray-200'}`}>
              <motion.div
                animate={{ x: medicationReminders ? 26 : 2 }}
                className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
              />
            </div>
          </button>

          <button
            onClick={() => {
              setAiInsightsEnabled(!aiInsightsEnabled);
              toast.success(t('settings.ai_insights_toast'));
            }}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b border-gray-100"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Bell className="w-5 h-5 text-purple-600" />
              </div>
              <div className="text-left">
                <p className="text-sm" style={{ fontWeight: 600 }}>{t('ai.insights')}</p>
                <p className="text-xs text-gray-600">{t('settings.ai_insights_desc')}</p>
              </div>
            </div>
            <div className={`w-12 h-6 rounded-full relative transition-colors ${aiInsightsEnabled ? 'bg-green-500' : 'bg-gray-200'}`}>
              <motion.div
                animate={{ x: aiInsightsEnabled ? 26 : 2 }}
                className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
              />
            </div>
          </button>

          <div className="w-full flex items-center justify-between p-4 bg-gray-50/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                <Bell className="w-5 h-5 text-amber-600" />
              </div>
              <div className="text-left">
                <p className="text-sm" style={{ fontWeight: 600 }}>{t('settings.caregiver_alerts')}</p>
                <p className="text-xs text-gray-600">{t('settings.caregiver_alerts_desc')}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full">
              <Shield className="w-3.5 h-3.5" />
              <span className="text-[10px]" style={{ fontWeight: 700 }}>{t('settings.always_on')}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Preferences */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-6"
      >
        <h3 className="text-sm text-gray-600 mb-3 px-1" style={{ fontWeight: 600 }}>{t('settings.preferences_section')}</h3>
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <button
            onClick={cycleDarkMode}
            className={`w-full flex items-center justify-between p-4 transition-colors border-b border-gray-100 ${darkMode === 'Dark' ? 'bg-slate-800/50 hover:bg-slate-800' : 'bg-white hover:bg-gray-50'}`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${darkMode === 'Dark' ? 'bg-indigo-900/50' : 'bg-indigo-100'}`}>
                <Moon className={`w-5 h-5 ${darkMode === 'Dark' ? 'text-indigo-400' : 'text-indigo-600'}`} />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold">{t('settings.appearance_mode')}</p>
                <p className={`text-xs ${darkMode === 'Dark' ? 'text-slate-400' : 'text-gray-600'}`}>{darkMode}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase transition-colors ${darkMode === 'Dark' ? 'bg-indigo-900/50 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>{t('settings.cycle')}</span>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </button>

          <Dialog open={isPasswordOpen} onOpenChange={setIsPasswordOpen}>
            <DialogTrigger asChild>
              <button
                className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Shield className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm" style={{ fontWeight: 600 }}>{t('settings.change_password')}</p>
                    <p className="text-xs text-gray-600">{t('settings.privacy_security')}</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{t('settings.change_password')}</DialogTitle>
                <DialogDescription>
                  {t('settings.password_desc')}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <label htmlFor="current" className="text-sm font-medium">{t('settings.current_password')}</label>
                  <input
                    id="current"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="new" className="text-sm font-medium">{t('settings.new_password')}</label>
                  <input
                    id="new"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="confirm" className="text-sm font-medium">{t('settings.confirm_password')}</label>
                  <input
                    id="confirm"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsPasswordOpen(false)}>{t('common.cancel')}</Button>
                <Button onClick={() => {
                  if (!currentPassword || !newPassword || !confirmPassword) {
                    toast.error(t('settings.fill_all'));
                    return;
                  }
                  if (newPassword !== confirmPassword) {
                    toast.error(t('settings.pass_mismatch'));
                    return;
                  }
                  setIsPasswordOpen(false);
                  setCurrentPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                  toast.success(t('settings.pass_success'));
                }}>{t('settings.update_password')}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      {/* Support & Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-6"
      >
        <h3 className="text-sm text-gray-600 mb-3 px-1" style={{ fontWeight: 600 }}>{t('settings.support_section')}</h3>
        <div className={`rounded-2xl border transition-colors overflow-hidden ${darkMode === 'Dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-100'}`}>
          <button
            onClick={() => toast.success('Live Support', { description: t('settings.live_support_toast') })}
            className={`w-full flex items-center justify-between p-4 transition-colors border-b ${darkMode === 'Dark' ? 'hover:bg-slate-800 border-slate-700' : 'bg-white hover:bg-gray-50 border-gray-100'}`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${darkMode === 'Dark' ? 'bg-blue-900/50' : 'bg-blue-100'}`}>
                <HelpCircle className={`w-5 h-5 ${darkMode === 'Dark' ? 'text-blue-400' : 'text-blue-600'}`} />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold">{t('settings.help_center')}</p>
                <p className={`text-xs ${darkMode === 'Dark' ? 'text-slate-400' : 'text-gray-600'}`}>{t('settings.live_support')}</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>

          <button
            onClick={() => toast.info('System Update', { description: t('settings.version_toast') })}
            className={`w-full flex items-center justify-between p-4 transition-colors ${darkMode === 'Dark' ? 'hover:bg-slate-800' : 'bg-white hover:bg-gray-50'}`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${darkMode === 'Dark' ? 'bg-purple-900/50' : 'bg-purple-100'}`}>
                <Settings className={`w-5 h-5 ${darkMode === 'Dark' ? 'text-purple-400' : 'text-purple-600'}`} />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold">{t('settings.about')}</p>
                <p className={`text-xs ${darkMode === 'Dark' ? 'text-slate-400' : 'text-gray-600'}`}>{t('settings.version_label')}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </button>
        </div>
      </motion.div>

      {/* Logout */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Button
          variant="outline"
          className="w-full h-12 border-2 border-red-200 text-red-600 hover:bg-red-50"
          onClick={onLogout}
        >
          <LogOut className="w-5 h-5 mr-2" />
          {t('settings.logout')}
        </Button>
      </motion.div>

      {/* App Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-6 text-center"
      >
        <p className="text-xs text-gray-500 mb-1">MedReminder - Voice-First Medication Intelligence</p>
        <p className="text-xs text-gray-400">Made with ❤️ for better health outcomes</p>
      </motion.div>
    </div>
  );
}