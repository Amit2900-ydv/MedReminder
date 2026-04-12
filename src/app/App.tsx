import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Toaster } from "@/app/components/ui/sonner";
import { LoginScreen } from '@/app/components/LoginScreen';
import { AIAssistantScreen } from '@/app/components/AIAssistantScreen';
import { HomeScreen } from '@/app/components/HomeScreen';
import { ScanScreen } from '@/app/components/ScanScreen';
import { ScheduleScreen } from '@/app/components/ScheduleScreen';
import { LogsScreen } from '@/app/components/LogsScreen';
import { MedicineKnowledgeScreen } from '@/app/components/MedicineKnowledgeScreen';
import { AIDashboardScreen } from '@/app/components/AIDashboardScreen';
import { ReportsScreen } from '@/app/components/ReportsScreen';
import { CaregiverScreen } from '@/app/components/CaregiverScreen';
import { SettingsScreen } from '@/app/components/SettingsScreen';
import { BottomNav } from '@/app/components/BottomNav';
import { FloatingAIOrb } from '@/app/components/FloatingAIOrb';
import { MenuDrawer } from '@/app/components/MenuDrawer';
import { NotificationCenter } from '@/app/components/MedicationNotification';
import { NotificationBell } from '@/app/components/NotificationBell';
import { NotificationSound } from '@/app/components/NotificationSound';
import { NotificationPermissionModal, useNotificationPermission, scheduleLocalNotification } from '@/app/components/NotificationPermission';
import { registerServiceWorker, scheduleNotificationWithServiceWorker } from '@/app/utils/serviceWorkerUtils';
import { NotificationScheduler } from '@/app/components/NotificationScheduler';
import { NotificationsScreen } from '@/app/components/NotificationsScreen';
import { CaretakerDashboard } from '@/app/components/CaretakerDashboard';
import { PatientDetailView } from '@/app/components/PatientDetailView';
import { CaretakerBottomNav } from '@/app/components/CaretakerBottomNav';
import { CaretakerReportsScreen } from '@/app/components/CaretakerReportsScreen';
import { CaretakerSettingsScreen } from '@/app/components/CaretakerSettingsScreen';
import { CaretakerPatientsScreen } from '@/app/components/CaretakerPatientsScreen';
import { Button } from '@/app/components/ui/button';
import { Bell, Menu, User, AlertCircle } from 'lucide-react';
import { SOSButton } from '@/app/components/SOSButton';
import { User as UserType, Patient, Medication } from '@/app/data/mockData';
import { usePatientContext } from '@/app/context/PatientContext';
import { useAuth } from '@/app/context/AuthContext';
import { AIChatbot } from '@/app/components/AIChatbot';
import { useLanguage } from '@/app/context/LanguageContext';

type Screen = 'login' | 'ai-assistant' | 'home' | 'scan' | 'schedule' | 'logs' | 'notifications' | 'knowledge' | 'ai-dashboard' | 'reports' | 'caregiver' | 'settings' | 'caretaker-dashboard' | 'patient-detail' | 'caretaker-reports' | 'caretaker-settings' | 'caretaker-patients';

interface NotificationData {
  id: string;
  medicineName: string;
  dosage: string;
  scheduledTime: string;
  color: string;
  instructions?: string;
}

function App() {
  const { patients, caretakers, addCaretaker } = usePatientContext();
  const { user: currentUser, isLoading } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [hasCompletedIntro, setHasCompletedIntro] = useState(() => {
    return localStorage.getItem('has_completed_intro') === 'true';
  });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isAuthenticated = !!currentUser;
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [playNotificationSound, setPlayNotificationSound] = useState(false);

  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [caretakerActiveScreen, setCaretakerActiveScreen] = useState<'dashboard' | 'patients' | 'reports' | 'settings'>('dashboard');
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null);
  const { t } = useLanguage();

  // Notification permission hook
  const {
    permission,
    showModal: showPermissionModal,
    showPermissionModal: triggerPermissionModal,
    handleAllow,
    handleDeny,
    requestPermission
  } = useNotificationPermission();

  // Register service worker on mount
  useEffect(() => {
    // Only try to register service worker if supported and not in iframe/preview
    if (
      'serviceWorker' in navigator &&
      window.location.hostname !== 'localhost' &&
      !window.location.hostname.includes('figma')
    ) {
      registerServiceWorker().then((registration) => {
        if (registration) {
          console.log('Service Worker registered for background notifications');
        }
      }).catch((error) => {
        console.log('Service Worker registration skipped:', error.message);
      });
    } else {
      console.log('Service Worker not supported in this environment');
    }
  }, []);

  // Demo: Add sample notifications after login
  const addDemoNotification = () => {
    const demoNotifications: NotificationData[] = [
      {
        id: '1',
        medicineName: 'Metformin 500mg',
        dosage: '1 tablet',
        scheduledTime: '8:00 AM',
        color: '#93C5FD',
        instructions: 'Take with breakfast'
      },
      {
        id: '2',
        medicineName: 'Lisinopril 10mg',
        dosage: '1 tablet',
        scheduledTime: '8:30 AM',
        color: '#C4B5FD',
        instructions: 'Take with water'
      },
      {
        id: '3',
        medicineName: 'Atorvastatin 20mg',
        dosage: '1 tablet',
        scheduledTime: '9:00 PM',
        color: '#FCA5A5',
        instructions: 'Take before dinner'
      }
    ];
    setNotifications(demoNotifications);
    setPlayNotificationSound(true);
    setTimeout(() => setPlayNotificationSound(false), 100);
  };

  // Handle screen navigation when user logs in
  useEffect(() => {
    if (currentUser) {
      if (currentUser.type === 'caretaker') {
        setHasCompletedIntro(true);
        setCurrentScreen('caretaker-dashboard');
      } else {
        setCurrentScreen('ai-assistant');
      }
    } else {
      setCurrentScreen('login');
    }
  }, [currentUser]);

  // Real-time Medication Reminder Check
  useEffect(() => {
    if (!currentUser || currentUser.type !== 'patient' || !currentUser.patientId) return;

    const checkMedications = () => {
      const now = new Date();
      const currentTime = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

      // Get latest patient data
      const currentPatient = patients.find(p => p.id === currentUser.patientId);
      if (!currentPatient) return;

      currentPatient.medications.forEach(med => {
        if (med.times.includes(currentTime)) {
          // Check if already taken today
          const today = new Date().toISOString().split('T')[0];
          const hasLog = currentPatient.logs.find(l =>
            l.medicationId === med.id &&
            l.date === today &&
            l.scheduledTime === currentTime &&
            (l.status === 'taken' || l.status === 'verified')
          );

          if (!hasLog) {
            // Trigger Notification
            const notificationTitle = `Time for ${med.name}`;
            const notificationBody = `It's ${currentTime}. Take ${med.dosage} as prescribed.`;

            // 1. Browser Notification
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification(notificationTitle, {
                body: notificationBody,
                icon: '/icons/pill-icon.png', // Fallback icon path
                requireInteraction: true
              });
            }

            // 2. In-App Toast
            // Use a custom ID to prevent duplicate toasts for the same time slot
            const toastId = `med-${med.id}-${currentTime}`;
            // We use Sonner's toast
            // Note: Sonner triggers might dedup automatically or we can rely on it not being annoying 
            // since this runs once per minute. To be safe, we could track "last notified" state, 
            // but for this MVP, the minute granularity is acceptable.

            // Add to Notification Center (local state)
            const newNotification: NotificationData = {
              id: `${Date.now()}-${med.id}`,
              medicineName: med.name,
              dosage: med.dosage,
              scheduledTime: currentTime,
              color: med.color,
              instructions: med.instructions
            };

            // Avoid adding duplicates to state if check runs multiple times in same minute
            setNotifications(prev => {
              const isDuplicate = prev.some(n => n.medicineName === med.name && n.scheduledTime === currentTime);
              if (isDuplicate) return prev;
              // Play sound only on new notification
              setPlayNotificationSound(true);
              setTimeout(() => setPlayNotificationSound(false), 100);
              return [...prev, newNotification];
            });

            setShowNotifications(true); // Auto-open notification center or just show badge? 
            // Let's just show a toast instead of forcing the screen open, simpler for user.
            // But we update the state so the badge shows up.
          }
        }
      });
    };

    // Check immediately on mount/login
    checkMedications();

    // Poll every minute
    const interval = setInterval(checkMedications, 60000);
    return () => clearInterval(interval);
  }, [currentUser, patients]);

  // Auto-create caretaker profile if missing (with loop prevention)
  const caretakerCreatedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (currentUser && currentUser.type === 'caretaker' && currentUser.caretakerId) {
      // Don't recreate if we already tried for this session
      if (caretakerCreatedRef.current.has(currentUser.caretakerId)) {
        return;
      }

      const caretaker = caretakers.find(c => c.id === currentUser.caretakerId);

      if (!caretaker) {
        console.log('Creating missing caretaker profile for:', currentUser.caretakerId);
        caretakerCreatedRef.current.add(currentUser.caretakerId);
        // Fetch from backend — profile created during registration
        addCaretaker(currentUser.caretakerId, {
          name: currentUser.name || currentUser.email.split('@')[0],
          email: currentUser.email,
          role: 'Caretaker'
        });
      }
    }
  }, [currentUser, caretakers]);

  const { logout } = useAuth();

  const handleAIComplete = () => {
    setHasCompletedIntro(true);
    localStorage.setItem('has_completed_intro', 'true');

    // Navigate based on user type
    if (currentUser?.type === 'caretaker') {
      setCurrentScreen('caretaker-dashboard');
    } else {
      setCurrentScreen('home');
    }

    // Request notification permission after intro (patients only)
    if (currentUser?.type === 'patient' && permission === 'default') {
      triggerPermissionModal();
    }

    // Show demo notifications after intro (patients only)
    if (currentUser?.type === 'patient') {
      setTimeout(() => {
        addDemoNotification();
        setShowNotifications(true);
      }, 2000);
    }
  };

  const handleNavigate = (screen: 'home' | 'scan' | 'schedule' | 'logs' | 'notifications' | 'knowledge' | 'ai-dashboard' | 'reports') => {
    setCurrentScreen(screen as any);
  };

  const handleSelectMedication = (med: Medication) => {
    setSelectedMedication(med);
    setCurrentScreen('knowledge');
  };

  const handleMenuNavigate = (screen: string) => {
    setCurrentScreen(screen as Screen);
  };

  const handleAIOrbClick = () => {
    setCurrentScreen('ai-assistant');
  };

  const handleMenuClick = () => {
    setIsMenuOpen(true);
  };

  const handleLogout = () => {
    logout();
    setHasCompletedIntro(false);
    localStorage.removeItem('has_completed_intro');
    setCurrentScreen('login');
    setIsMenuOpen(false);
    setNotifications([]); // Clear notifications on logout
    setSelectedPatientId(null);
  };

  const handleViewPatient = (patientId: string) => {
    setSelectedPatientId(patientId);
    setCurrentScreen('patient-detail');
  };

  const handleBackToPatients = () => {
    setSelectedPatientId(null);
    setCurrentScreen('caretaker-dashboard');
  };

  const handleNotificationDismiss = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
    if (notifications.length <= 1) {
      setShowNotifications(false);
    }
  };

  const handleNotificationMarkTaken = (id: string) => {
    // Remove notification and you can add logic to update logs here
    setNotifications(notifications.filter(n => n.id !== id));
    if (notifications.length <= 1) {
      setShowNotifications(false);
    }
    // You could also show a success toast here
  };

  const handleNotificationSnooze = (id: string) => {
    // Remove notification temporarily (in real app, reschedule it)
    setNotifications(notifications.filter(n => n.id !== id));
    if (notifications.length <= 1) {
      setShowNotifications(false);
    }
    // You could reschedule this notification for 10 minutes later
  };

  const handleNotificationBellClick = () => {
    setShowNotifications(true);
  };

  // Handle scheduled notification from scheduler panel
  const handleScheduleNotification = (notification: {
    medicineName: string;
    dosage: string;
    time: string;
    scheduledFor: Date;
  }) => {
    // Request permission if not granted
    if (permission !== 'granted') {
      triggerPermissionModal();
      return;
    }

    // Schedule browser notification
    const delay = notification.scheduledFor.getTime() - Date.now();

    if (delay > 0) {
      setTimeout(() => {
        // Show browser notification
        if ('Notification' in window && Notification.permission === 'granted') {
          const notif = new Notification('💊 Medication Reminder', {
            body: `${notification.medicineName} - ${notification.dosage}\nScheduled for ${notification.time}`,
            icon: '/notification-icon.png',
            badge: '/badge-icon.png',
            tag: `scheduled-${Date.now()}`,
            requireInteraction: true,
            vibrate: [200, 100, 200],
          });

          notif.onclick = () => {
            window.focus();
            notif.close();
            setCurrentScreen('schedule'); // Navigate to schedule screen
          };
        }

        // Also add to in-app notifications
        const newNotification: NotificationData = {
          id: `scheduled-${Date.now()}`,
          medicineName: notification.medicineName,
          dosage: notification.dosage,
          scheduledTime: notification.time,
          color: '#93C5FD',
          instructions: 'Scheduled reminder'
        };

        setNotifications(prev => [...prev, newNotification]);
        setShowNotifications(true);
        setPlayNotificationSound(true);
        setTimeout(() => setPlayNotificationSound(false), 100);
      }, delay);

      console.log(`Notification scheduled for ${notification.scheduledFor.toLocaleTimeString()}`);
    }
  };

  const renderScreen = () => {
    if (isLoading) {
      return (
        <div className="h-full flex flex-col items-center justify-center bg-white p-8">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mb-4"
          />
          <p className="text-gray-500 font-medium animate-pulse">Launching MedReminder...</p>
        </div>
      );
    }

    // Show login screen if not authenticated
    if (!isAuthenticated) {
      return (
        <motion.div
          key="login"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <LoginScreen />
        </motion.div>
      );
    }

    switch (currentScreen) {
      case 'ai-assistant':
        return (
          <motion.div
            key="ai-assistant"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <AIAssistantScreen onComplete={handleAIComplete} />
          </motion.div>
        );
      case 'caretaker-dashboard':
        if (!currentUser || currentUser.type !== 'caretaker') return null;

        // Find caretaker by ID or email as fallback
        const caretaker = caretakers.find(c =>
          c.id === currentUser.caretakerId || c.email === currentUser.email
        );

        if (!caretaker) {
          return (
            <div className="h-full flex flex-col items-center justify-center bg-white p-8">
              <div className="text-6xl mb-4">⚠️</div>
              <h2 className="text-xl font-bold mb-2">Caretaker Profile Not Found</h2>
              <p className="text-gray-600 text-center mb-4">
                Unable to load caretaker data for {currentUser.email}. Please log out and try again.
              </p>
              <button
                onClick={handleLogout}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Logout
              </button>
            </div>
          );
        }

        return (
          <motion.div
            key="caretaker-dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="h-full overflow-y-auto"
          >
            <CaretakerDashboard
              patientIds={caretaker.patientIds}
              caretakerName={caretaker.name}
              onViewPatient={handleViewPatient}
            />
          </motion.div>
        );
      case 'patient-detail':
        if (!selectedPatientId) return null;
        const patient = patients.find(p => p.id === selectedPatientId);
        if (!patient) return null;

        return (
          <motion.div
            key="patient-detail"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="h-full overflow-y-auto"
          >
            <PatientDetailView
              patient={patient}
              onBack={handleBackToPatients}
            />
          </motion.div>
        );
      case 'caretaker-patients':
        if (!currentUser || currentUser.type !== 'caretaker') return null;
        const caretakerForPatients = caretakers.find(c =>
          c.id === currentUser.caretakerId || c.email === currentUser.email
        );
        if (!caretakerForPatients) {
          return (
            <div className="h-full flex flex-col items-center justify-center bg-white p-8">
              <div className="text-6xl mb-4">⚠️</div>
              <h2 className="text-xl font-bold mb-2">Caretaker Profile Not Found</h2>
              <p className="text-gray-600 text-center mb-4">Unable to load caretaker data. Please log out and try again.</p>
              <button
                onClick={handleLogout}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Logout
              </button>
            </div>
          );
        }

        return (
          <motion.div
            key="caretaker-patients"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="h-full overflow-y-auto"
          >
            <CaretakerPatientsScreen
              caretakerId={caretakerForPatients.id}
              onViewPatient={handleViewPatient}
            />
          </motion.div>
        );
      case 'caretaker-reports':
        if (!currentUser || currentUser.type !== 'caretaker') return null;
        const caretakerForReports = caretakers.find(c =>
          c.id === currentUser.caretakerId || c.email === currentUser.email
        );
        if (!caretakerForReports) {
          return (
            <div className="h-full flex flex-col items-center justify-center bg-white p-8">
              <div className="text-6xl mb-4">⚠️</div>
              <h2 className="text-xl font-bold mb-2">Caretaker Profile Not Found</h2>
              <p className="text-gray-600 text-center mb-4">Unable to load caretaker data. Please log out and try again.</p>
              <button
                onClick={handleLogout}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Logout
              </button>
            </div>
          );
        }

        return (
          <motion.div
            key="caretaker-reports"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="h-full overflow-y-auto"
          >
            <CaretakerReportsScreen patientIds={caretakerForReports.patientIds} />
          </motion.div>
        );
      case 'caretaker-settings':
        if (!currentUser || currentUser.type !== 'caretaker') return null;
        const caretakerForSettings = caretakers.find(c =>
          c.id === currentUser.caretakerId || c.email === currentUser.email
        );
        if (!caretakerForSettings) {
          return (
            <div className="h-full flex flex-col items-center justify-center bg-white p-8">
              <div className="text-6xl mb-4">⚠️</div>
              <h2 className="text-xl font-bold mb-2">Caretaker Profile Not Found</h2>
              <p className="text-gray-600 text-center mb-4">Unable to load caretaker data. Please log out and try again.</p>
              <button
                onClick={handleLogout}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Logout
              </button>
            </div>
          );
        }

        return (
          <motion.div
            key="caretaker-settings"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="h-full overflow-y-auto"
          >
            <CaretakerSettingsScreen
              caretaker={caretakerForSettings}
              onLogout={handleLogout}
            />
          </motion.div>
        );
      case 'home':
        return (
          <motion.div
            key="home"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="h-full overflow-y-auto bg-gray-50"
          >
            <HomeScreen
              onNavigate={handleNavigate}
              onSelectMedication={handleSelectMedication}
              onOpenChat={() => setIsChatbotOpen(true)}
            />
          </motion.div>
        );
      case 'scan':
        return (
          <motion.div
            key="scan"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="h-full overflow-y-auto bg-gray-50"
          >
            <ScanScreen />
          </motion.div>
        );
      case 'schedule':
        return (
          <motion.div
            key="schedule"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="h-full overflow-y-auto bg-gray-50"
          >
            <ScheduleScreen
              onNavigate={handleNavigate}
              onSelectMedication={handleSelectMedication}
            />
          </motion.div>
        );
      case 'logs':
        return (
          <motion.div
            key="logs"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="h-full overflow-y-auto bg-gray-50"
          >
            <LogsScreen />
          </motion.div>
        );
      case 'notifications':
        return (
          <motion.div
            key="notifications"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="h-full overflow-y-auto bg-gray-50"
          >
            <NotificationsScreen
              currentNotifications={notifications}
              onScheduleNotification={handleScheduleNotification}
              onDismissNotification={handleNotificationDismiss}
              onMarkTaken={handleNotificationMarkTaken}
              onSnooze={handleNotificationSnooze}
              onAddTestNotifications={addDemoNotification}
            />
          </motion.div>
        );
      case 'knowledge':
        return (
          <motion.div
            key="knowledge"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="h-full overflow-y-auto bg-gray-50"
          >
            <MedicineKnowledgeScreen
              initialMedication={selectedMedication || undefined}
              onOpenChat={() => setIsChatbotOpen(true)}
            />
          </motion.div>
        );
      case 'ai-dashboard':
        return (
          <motion.div
            key="ai-dashboard"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="h-full overflow-y-auto bg-gray-50"
          >
            <AIDashboardScreen />
          </motion.div>
        );
      case 'reports':
        return (
          <motion.div
            key="reports"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="h-full overflow-y-auto bg-gray-50"
          >
            <ReportsScreen />
          </motion.div>
        );
      case 'caregiver':
        return (
          <motion.div
            key="caregiver"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="h-full overflow-y-auto bg-gray-50"
          >
            <CaregiverScreen />
          </motion.div>
        );
      case 'settings':
        return (
          <motion.div
            key="settings"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="h-full overflow-y-auto bg-gray-50"
          >
            <SettingsScreen onLogout={handleLogout} />
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* iPhone 14/15 Frame - 390 × 844 */}
      <div className="mx-auto bg-white shadow-2xl flex flex-col relative w-full h-full min-h-screen sm:max-w-md sm:min-h-0 sm:h-[844px] sm:my-8 sm:rounded-[3rem] overflow-hidden">
        {/* Header - Menu and Profile */}
        {isAuthenticated && currentScreen !== 'login' && currentScreen !== 'ai-assistant' && (
          <header className="flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-gray-100">
            {currentUser?.type === 'patient' && (
              <button
                onClick={handleMenuClick}
                className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors text-gray-700 active:scale-95"
                aria-label="Open Menu"
              >
                <Menu size={24} />
              </button>
            )}
            {currentUser?.type !== 'patient' && <div className="w-10" />} {/* Spacer for balance */}

            <div className="flex-1 text-center">
              <span className="text-sm font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 uppercase tracking-widest">
                {t('app.name')}
              </span>
            </div>

            <button
              onClick={() => setCurrentScreen('settings')}
              className="p-2 -mr-2 rounded-full hover:bg-gray-100 transition-colors text-gray-700 active:scale-95"
              aria-label="Profile Settings"
            >
              <User size={24} />
            </button>
          </header>
        )}
        <main className="flex-1 overflow-y-auto relative bg-gray-50">
          <AnimatePresence mode="wait">
            {renderScreen()}
          </AnimatePresence>
        </main>

        {/* Bottom Navigation - Only show for patients after AI intro */}
        {hasCompletedIntro && currentUser?.type === 'patient' && currentScreen !== 'ai-assistant' && currentScreen !== 'caretaker-dashboard' && currentScreen !== 'patient-detail' && (
          <BottomNav
            activeScreen={currentScreen as 'home' | 'scan' | 'schedule' | 'logs' | 'notifications'}
            onNavigate={handleNavigate}
            onMenuClick={handleMenuClick}
            notificationCount={notifications.length}
          />
        )}

        {/* Bottom Navigation for Caretakers */}
        {hasCompletedIntro && currentUser?.type === 'caretaker' && currentScreen !== 'ai-assistant' && currentScreen !== 'patient-detail' && (
          <CaretakerBottomNav
            activeScreen={caretakerActiveScreen}
            onNavigate={(screen) => {
              setCaretakerActiveScreen(screen);
              if (screen === 'dashboard') {
                setCurrentScreen('caretaker-dashboard');
              } else if (screen === 'patients') {
                setCurrentScreen('caretaker-patients');
              } else if (screen === 'reports') {
                setCurrentScreen('caretaker-reports');
              } else if (screen === 'settings') {
                setCurrentScreen('caretaker-settings');
              }
            }}
          />
        )}

        {/* Floating SOS Button for Patients */}
        {isAuthenticated && currentUser?.type === 'patient' && currentScreen !== 'login' && currentScreen !== 'ai-assistant' && (
          <div className="fixed bottom-24 left-6 z-[60]">
            <SOSButton />
          </div>
        )}

        {/* Floating AI Orb - Only show after AI intro and not on AI screen */}
        {hasCompletedIntro && currentScreen !== 'ai-assistant' && currentScreen !== 'notifications' && (
          <FloatingAIOrb onClick={handleAIOrbClick} />
        )}

        {/* Menu Drawer */}
        <MenuDrawer
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
          onNavigate={handleMenuNavigate}
        />

        {/* Notification Sound */}
        <NotificationSound play={playNotificationSound} />

        {/* Notification Permission Modal */}
        <NotificationPermissionModal
          isOpen={showPermissionModal}
          onAllow={handleAllow}
          onDeny={handleDeny}
        />

        <AIChatbot
          isOpen={isChatbotOpen}
          onClose={() => setIsChatbotOpen(false)}
        />
        <Toaster />
      </div>
    </div>
  );
}

export default App;