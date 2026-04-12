import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, Pill, Search, Info, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Alert, AlertTitle, AlertDescription } from '@/app/components/ui/alert';

export function DrugInteractionChecker() {
    const [med1, setMed1] = useState('');
    const [med2, setMed2] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleCheck = async () => {
        if (!med1 || !med2) {
            setError('Please enter both medication names.');
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const token = localStorage.getItem('adheai_token');
            const res = await fetch('/api/ai/check-interaction', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify({ med1, med2 })
            });

            const data = await res.json();
            if (data.interactionInfo) {
                setResult(data.interactionInfo);
            } else {
                setError(data.error || 'Failed to get interaction info.');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="w-full border-none shadow-xl bg-gradient-to-br from-white to-blue-50/30 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-white/20 rounded-lg">
                        <ShieldAlert className="w-6 h-6" />
                    </div>
                    <CardTitle className="text-xl">AI Interaction Checker</CardTitle>
                </div>
                <CardDescription className="text-blue-100">
                    Check if two medications are safe to take together.
                </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <Pill className="w-4 h-4 text-blue-500" /> Medication 1
                            </label>
                            <Input
                                placeholder="e.g. Aspirin"
                                value={med1}
                                onChange={(e) => setMed1(e.target.value)}
                                className="rounded-xl border-gray-200 focus:ring-blue-500"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <Pill className="w-4 h-4 text-indigo-500" /> Medication 2
                            </label>
                            <Input
                                placeholder="e.g. Ibuprofen"
                                value={med2}
                                onChange={(e) => setMed2(e.target.value)}
                                className="rounded-xl border-gray-200 focus:ring-indigo-500"
                            />
                        </div>
                    </div>

                    <Button
                        onClick={handleCheck}
                        disabled={loading}
                        className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all rounded-xl shadow-md"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                Checking Interactions...
                            </>
                        ) : (
                            <>
                                <Search className="w-5 h-5 mr-2" />
                                Run Safety Check
                            </>
                        )}
                    </Button>

                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                            >
                                <Alert variant="destructive" className="rounded-xl bg-red-50 border-red-100">
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertTitle>Error</AlertTitle>
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            </motion.div>
                        )}

                        {result && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="mt-4"
                            >
                                <div className={`p-5 rounded-2xl border ${result.toLowerCase().includes('caution') || result.toLowerCase().includes('warning') || result.toLowerCase().includes('interaction')
                                    ? 'bg-amber-50 border-amber-200 text-amber-900'
                                    : 'bg-green-50 border-green-200 text-green-900'
                                    }`}>
                                    <div className="flex items-start gap-4">
                                        {result.toLowerCase().includes('warning') ? (
                                            <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
                                        ) : (
                                            <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                                        )}
                                        <div className="space-y-2">
                                            <h4 className="font-bold flex items-center gap-2">
                                                AI Analysis Insight
                                            </h4>
                                            <p className="text-sm leading-relaxed whitespace-pre-line">
                                                {result}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="pt-4 flex items-start gap-3 text-[10px] text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <p>
                            Important: This tool uses artificial intelligence for informational purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment. Always consult your healthcare provider before taking any new medications together.
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
