import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Pill, Clock, Check, AlarmClock, Calendar } from 'lucide-react';
import { Button } from '@/app/components/ui/button';

interface MedicationNotificationProps {
  isVisible: boolean;
  onDismiss: () => void;
  onMarkTaken: () => void;
  onSnooze: () => void;
  medicineName: string;
  dosage: string;
  scheduledTime: string;
  color?: string;
  instructions?: string;
}

export function MedicationNotification({
  isVisible,
  onDismiss,
  onMarkTaken,
  onSnooze,
  medicineName,
  dosage,
  scheduledTime,
  color = '#60A5FA',
  instructions
}: MedicationNotificationProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
            onClick={onDismiss}
          />

          {/* Notification Card */}
          <motion.div
            initial={{ opacity: 0, y: -100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -100, scale: 0.9 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="fixed top-4 left-4 right-4 z-50"
          >
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <Pill className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-white text-xs opacity-90">MedReminder</p>
                    <p className="text-white text-xs" style={{ fontWeight: 600 }}>Medication Time</p>
                  </div>
                </div>
                <button
                  onClick={onDismiss}
                  className="w-6 h-6 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>

              {/* Main Content */}
              <div className="p-4">
                <div className="flex items-start gap-4 mb-4">
                  {/* Medicine Icon */}
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-md flex-shrink-0"
                    style={{ backgroundColor: color }}
                  >
                    <Pill className="w-8 h-8 text-gray-700" />
                  </div>

                  {/* Medicine Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg mb-1 truncate" style={{ fontWeight: 700 }}>
                      {medicineName}
                    </h3>
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                        <span className="text-sm text-gray-700" style={{ fontWeight: 600 }}>
                          {dosage}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">{scheduledTime}</span>
                      </div>
                      {instructions && (
                        <div className="flex items-start gap-2 mt-1">
                          <Calendar className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                          <span className="text-xs text-gray-600 leading-relaxed">{instructions}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    onClick={onMarkTaken}
                    className="flex-1 h-11 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-md"
                  >
                    <Check className="w-5 h-5 mr-2" />
                    Mark Taken
                  </Button>
                  <Button
                    onClick={onSnooze}
                    variant="outline"
                    className="h-11 px-4 bg-white border-2 border-gray-200 hover:bg-gray-50"
                  >
                    <AlarmClock className="w-5 h-5" />
                  </Button>
                </div>

                {/* Quick Info */}
                <div className="mt-3 p-3 bg-blue-50 rounded-xl">
                  <p className="text-xs text-blue-900">
                    <span style={{ fontWeight: 600 }}>Reminder:</span> Take this medication as prescribed. 
                    Tap "Mark Taken" after consuming.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Multiple Notifications Container
interface NotificationData {
  id: string;
  medicineName: string;
  dosage: string;
  scheduledTime: string;
  color: string;
  instructions?: string;
}

interface NotificationCenterProps {
  notifications: NotificationData[];
  onDismiss: (id: string) => void;
  onMarkTaken: (id: string) => void;
  onSnooze: (id: string) => void;
}

export function NotificationCenter({
  notifications,
  onDismiss,
  onMarkTaken,
  onSnooze
}: NotificationCenterProps) {
  const [currentNotificationIndex, setCurrentNotificationIndex] = useState(0);

  useEffect(() => {
    if (notifications.length === 0) {
      setCurrentNotificationIndex(0);
    }
  }, [notifications.length]);

  const currentNotification = notifications[currentNotificationIndex];

  const handleDismiss = () => {
    if (currentNotification) {
      onDismiss(currentNotification.id);
      // Show next notification if available
      if (currentNotificationIndex < notifications.length - 1) {
        setCurrentNotificationIndex(currentNotificationIndex + 1);
      } else {
        setCurrentNotificationIndex(0);
      }
    }
  };

  const handleMarkTaken = () => {
    if (currentNotification) {
      onMarkTaken(currentNotification.id);
      // Show next notification if available
      if (currentNotificationIndex < notifications.length - 1) {
        setCurrentNotificationIndex(currentNotificationIndex + 1);
      } else {
        setCurrentNotificationIndex(0);
      }
    }
  };

  const handleSnooze = () => {
    if (currentNotification) {
      onSnooze(currentNotification.id);
      // Show next notification if available
      if (currentNotificationIndex < notifications.length - 1) {
        setCurrentNotificationIndex(currentNotificationIndex + 1);
      } else {
        setCurrentNotificationIndex(0);
      }
    }
  };

  if (!currentNotification) return null;

  return (
    <MedicationNotification
      isVisible={true}
      onDismiss={handleDismiss}
      onMarkTaken={handleMarkTaken}
      onSnooze={handleSnooze}
      medicineName={currentNotification.medicineName}
      dosage={currentNotification.dosage}
      scheduledTime={currentNotification.scheduledTime}
      color={currentNotification.color}
      instructions={currentNotification.instructions}
    />
  );
}