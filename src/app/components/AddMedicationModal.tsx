import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Clock, Trash2, Pill, Mic, MicOff, Loader2 } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Medication } from '@/app/data/mockData';
import { useLanguage } from '@/app/context/LanguageContext';

interface AddMedicationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (medication: Omit<Medication, 'id'>) => void;
}

export function AddMedicationModal({ isOpen, onClose, onAdd }: AddMedicationModalProps) {
    const { t } = useLanguage();
    const [step, setStep] = useState(1);
    const [name, setName] = useState('');
    const [dosage, setDosage] = useState('');
    const [frequency, setFrequency] = useState('1x daily');
    const [times, setTimes] = useState<string[]>(['08:00']);
    const [color, setColor] = useState('#FFFFFF');
    const [shape, setShape] = useState<'round' | 'capsule' | 'oval'>('round');
    const [instructions, setInstructions] = useState('');
    const [purpose, setPurpose] = useState('');
    const [sideEffects, setSideEffects] = useState<string[]>([]);
    const [newSideEffect, setNewSideEffect] = useState('');
    const [isListening, setIsListening] = useState(false);

    const startListening = () => {
        if (!('webkitSpeechRecognition' in window) && !('speechRecognition' in window)) {
            alert('Voice recognition not supported in this browser.');
            return;
        }

        const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).speechRecognition;
        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onerror = () => setIsListening(false);

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setName(transcript.charAt(0).toUpperCase() + transcript.slice(1));
        };

        recognition.start();
    };

    if (!isOpen) return null;

    const handleAddTime = () => {
        setTimes([...times, '08:00']);
    };

    const handleRemoveTime = (index: number) => {
        setTimes(times.filter((_, i) => i !== index));
    };

    const handleTimeChange = (index: number, value: string) => {
        const newTimes = [...times];
        newTimes[index] = value;
        setTimes(newTimes);
    };

    const handleAddSideEffect = () => {
        if (newSideEffect.trim()) {
            setSideEffects([...sideEffects, newSideEffect.trim()]);
            setNewSideEffect('');
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAdd({
            name,
            dosage,
            frequency,
            times,
            color,
            shape,
            purpose,
            instructions,
            sideEffects
        });
        onClose();
        // Reset form
        setStep(1);
        setName('');
        setDosage('');
        setTimes(['08:00']);
    };

    const steps = [
        {
            title: t('addmed.basic'),
            content: (
                <div className="space-y-4">
                    <div>
                        <div className="relative">
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full p-4 pr-12 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500 transition-all font-medium"
                                placeholder={t('scan.med_name')}
                                required
                            />
                            <button
                                type="button"
                                onClick={startListening}
                                className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all ${isListening
                                    ? 'bg-red-100 text-red-600 animate-pulse'
                                    : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                                    }`}
                            >
                                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('addmed.dosage_label')}</label>
                        <input
                            type="text"
                            value={dosage}
                            onChange={(e) => setDosage(e.target.value)}
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                            placeholder="e.g. 500mg"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('addmed.purpose_label')}</label>
                        <input
                            type="text"
                            value={purpose}
                            onChange={(e) => setPurpose(e.target.value)}
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                            placeholder="e.g. Blood Pressure"
                        />
                    </div>
                </div>
            )
        },
        {
            title: t('addmed.schedule'),
            content: (
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('addmed.freq_label')}</label>
                        <select
                            value={frequency}
                            onChange={(e) => setFrequency(e.target.value)}
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                        >
                            <option value="1x daily">{t('addmed.freq_1x')}</option>
                            <option value="2x daily">{t('addmed.freq_2x')}</option>
                            <option value="3x daily">{t('addmed.freq_3x')}</option>
                            <option value="4x daily">{t('addmed.freq_4x')}</option>
                            <option value="as needed">{t('addmed.freq_needed')}</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('addmed.times_label')}</label>
                        <div className="space-y-2">
                            {times.map((time, index) => (
                                <div key={index} className="flex gap-2">
                                    <input
                                        type="time"
                                        value={time}
                                        onChange={(e) => handleTimeChange(index, e.target.value)}
                                        className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                                    />
                                    {times.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveTime(index)}
                                            className="p-3 text-red-500 hover:bg-red-50 rounded-xl"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={handleAddTime}
                                className="text-sm text-blue-600 font-medium flex items-center gap-1 mt-2"
                            >
                                <Plus className="w-4 h-4" /> {t('addmed.add_time')}
                            </button>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: t('addmed.appearance'),
            content: (
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('addmed.color_label')}</label>
                        <div className="flex gap-2">
                            {['#FFFFFF', '#FFB3BA', '#BAE1FF', '#FFFFBA', '#E0BBE4', '#BFFCC6'].map((c) => (
                                <button
                                    key={c}
                                    type="button"
                                    onClick={() => setColor(c)}
                                    className={`w-8 h-8 rounded-full border-2 ${color === c ? 'border-gray-900 scale-110' : 'border-gray-200'}`}
                                    style={{ backgroundColor: c }}
                                />
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('addmed.shape_label')}</label>
                        <div className="flex gap-2">
                            {(['round', 'capsule', 'oval'] as const).map((s) => (
                                <button
                                    key={s}
                                    type="button"
                                    onClick={() => setShape(s)}
                                    className={`px-3 py-2 rounded-lg border-2 text-sm capitalize ${shape === s ? 'border-blue-500 text-blue-700 bg-blue-50' : 'border-gray-200 text-gray-600'}`}
                                >
                                    {t(`scan.shape.${s}`)}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('addmed.instr_label')}</label>
                        <textarea
                            value={instructions}
                            onChange={(e) => setInstructions(e.target.value)}
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 h-24 resize-none"
                            placeholder="e.g. Take with food"
                        />
                    </div>
                </div>
            )
        }
    ];

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl"
                >
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-bold">{t('addmed.title')}</h2>
                            <p className="text-sm text-gray-500">{t('addmed.step_info').replace('{current}', step.toString()).replace('{total}', steps.length.toString()).replace('{title}', steps[step - 1].title)}</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6">
                        <div className="mb-8">
                            {steps[step - 1].content}
                        </div>

                        <div className="flex gap-3">
                            {step > 1 && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setStep(step - 1)}
                                    className="flex-1"
                                >
                                    {t('common.cancel')}
                                </Button>
                            )}
                            {step < steps.length ? (
                                <Button
                                    type="button"
                                    onClick={() => setStep(step + 1)}
                                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                                >
                                    {t('settings.profile.next')}
                                </Button>
                            ) : (
                                <Button
                                    type="submit"
                                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                                >
                                    {t('addmed.title')}
                                </Button>
                            )}
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
