import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, Phone, X, Siren, MapPin, BellRing } from 'lucide-react';
import { Button } from '@/app/components/ui/button';

export function SOSButton() {
    const [isSOSActive, setIsSOSActive] = useState(false);
    const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

    useEffect(() => {
        // Prepare SOS sound
        const sosAudio = new Audio('https://assets.mixkit.co/active_storage/sfx/1005/1005-preview.mp3'); 
        sosAudio.loop = true;
        setAudio(sosAudio);
        
        return () => {
            sosAudio.pause();
        };
    }, []);

    const toggleSOS = () => {
        if (!isSOSActive) {
            setIsSOSActive(true);
            audio?.play().catch(e => console.log('Audio play failed', e));
            // In a real app, this would trigger an actual API call to notify emergency contacts
        } else {
            setIsSOSActive(false);
            audio?.pause();
        }
    };

    return (
        <>
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleSOS}
                className="w-14 h-14 bg-red-600 text-white rounded-2xl shadow-xl shadow-red-200 flex items-center justify-center border-4 border-white z-[60]"
            >
                <AlertCircle className={`w-8 h-8 ${isSOSActive ? 'animate-pulse' : ''}`} />
            </motion.button>

            <AnimatePresence>
                {isSOSActive && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-red-600/90 backdrop-blur-md"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="bg-white w-full max-w-sm rounded-[3rem] p-8 text-center shadow-2xl overflow-hidden relative"
                        >
                            <div className="absolute top-0 left-0 w-full h-2 bg-red-500 animate-pulse" />
                            
                            <div className="mb-6 relative">
                                <motion.div 
                                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                                    transition={{ duration: 1, repeat: Infinity }}
                                    className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto"
                                >
                                    <Siren className="w-12 h-12 text-red-600" />
                                </motion.div>
                            </div>

                            <h2 className="text-3xl font-black text-red-600 mb-2">EMERGENCY SOS</h2>
                            <p className="text-gray-600 mb-8 font-medium">Sending alert and location to your caretaker and emergency services...</p>

                            <div className="space-y-3">
                                <Button className="w-full h-16 bg-red-600 hover:bg-red-700 rounded-2xl text-lg font-bold shadow-lg shadow-red-100">
                                    <Phone className="w-5 h-5 mr-3" /> Call Ambulance (102)
                                </Button>
                                <Button variant="outline" className="w-full h-16 rounded-2xl border-2 border-gray-100 font-bold text-gray-500">
                                    <MapPin className="w-5 h-5 mr-3" /> Find Nearby Hospital
                                </Button>
                                <Button
                                    onClick={toggleSOS}
                                    variant="ghost"
                                    className="w-full h-12 mt-4 text-gray-400 font-medium"
                                >
                                    I am safe, Cancel SOS
                                </Button>
                            </div>
                            
                            <div className="mt-8 pt-8 border-t border-gray-100 flex items-center justify-center gap-2 text-xs text-gray-400 font-bold uppercase tracking-widest">
                                <BellRing className="w-3 h-3" /> Alerting Caretaker
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
