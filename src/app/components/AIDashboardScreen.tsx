import { motion } from 'motion/react';
import { Brain, TrendingUp, AlertCircle, CheckCircle2, Target, Zap, Calendar, Clock, Trophy, ShieldCheck, Pill } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Cell } from 'recharts';
import { useLanguage } from '@/app/context/LanguageContext';
import { usePatientContext } from '@/app/context/PatientContext';
import { useAuth } from '@/app/context/AuthContext';
import { DrugInteractionChecker } from './DrugInteractionChecker';

export function AIDashboardScreen() {
  const { t } = useLanguage();
  const { patients } = usePatientContext();
  const { user } = useAuth();

  const currentPatient = patients.find(p => p.id === user?.patientId) || patients[0];

  // Adherence Data Transformation for Charts
  const chartData = [
    { day: 'Mon', adherence: 85 },
    { day: 'Tue', adherence: 92 },
    { day: 'Wed', adherence: 88 },
    { day: 'Thu', adherence: 100 },
    { day: 'Fri', adherence: 75 },
    { day: 'Sat', adherence: 90 },
    { day: 'Sun', adherence: currentPatient.adherenceScore },
  ];

  const monthlyData = [
    { month: 'Jan', score: 82 },
    { month: 'Feb', score: 85 },
    { month: 'Mar', score: 88 },
    { month: 'Apr', score: 92 },
    { month: 'May', score: 89 },
    { month: 'Jun', score: currentPatient.adherenceScore },
  ];

  const streakDays = 7; // In a real app, calculate from logs

  return (
    <div className="pb-24 px-4 pt-6 bg-gray-50/30">
      <div className="mb-6">
        <h1 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-700 mb-2">
          {t('ai.title')}
        </h1>
        <p className="text-gray-500 font-medium">{t('ai.subtitle')}</p>
      </div>

      {/* Hero AI Score Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative rounded-[2.5rem] p-8 mb-8 text-white shadow-2xl overflow-hidden group"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-blue-600 to-violet-600" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-5 mb-8">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-[1.5rem] flex items-center justify-center border border-white/30 shadow-inner group-hover:rotate-6 transition-transform">
              <Brain className="w-8 h-8" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-white/70 mb-1">{t('ai.health_score')}</p>
              <h2 className="text-5xl font-black">{currentPatient.adherenceScore}<span className="text-2xl opacity-60 ml-1">/100</span></h2>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-4 border border-white/10 hover:bg-white/15 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/80">{t('ai.streak')}</span>
              </div>
              <p className="text-2xl font-black">{streakDays} Days</p>
              <p className="text-[10px] text-white/60 font-medium">Personal Best: 14d</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-4 border border-white/10 hover:bg-white/15 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/80">Reliability</span>
              </div>
              <p className="text-2xl font-black">High</p>
              <p className="text-[10px] text-white/60 font-medium">98.2% Accuracy</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Weekly Visual Analytics */}
      <div className="grid grid-cols-1 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-blue-50/50 border border-gray-100"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-black text-gray-900">{t('ai.weekly_stats')}</h3>
              <p className="text-xs text-gray-400 font-bold uppercase mt-1 tracking-widest">Performance Matrix</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-600 rounded-full text-xs font-black">
              <TrendingUp className="w-3 h-3" />
              +12.4%
            </div>
          </div>

          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData}>
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4F46E5" />
                  <stop offset="100%" stopColor="#3B82F6" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
              <XAxis 
                dataKey="day" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#9CA3AF', fontSize: 10, fontWeight: 700 }} 
                dy={10}
              />
              <YAxis hide />
              <Tooltip 
                cursor={{ fill: 'transparent' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-gray-900 text-white px-3 py-1.5 rounded-xl text-[10px] font-bold shadow-xl">
                        {payload[0].value}% Adherence
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="adherence" radius={[10, 10, 10, 10]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.adherence < 80 ? '#F87171' : 'url(#barGradient)'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Global Progress Chart */}
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-blue-50/50 border border-gray-100"
        >
           <h3 className="text-xl font-black text-gray-900 mb-8">{t('ai.monthly_progress')}</h3>
           <ResponsiveContainer width="100%" height={180}>
             <AreaChart data={monthlyData}>
               <defs>
                 <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                   <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.1}/>
                   <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                 </linearGradient>
               </defs>
               <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
               <XAxis 
                dataKey="month" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#9CA3AF', fontSize: 10, fontWeight: 700 }} 
               />
               <Tooltip />
               <Area 
                type="monotone" 
                dataKey="score" 
                stroke="#4F46E5" 
                strokeWidth={4} 
                fillOpacity={1} 
                fill="url(#areaGradient)" 
                dot={{ r: 6, fill: '#4F46E5', strokeWidth: 3, stroke: '#FFF' }}
               />
             </AreaChart>
           </ResponsiveContainer>
        </motion.div>
      </div>

      {/* AI Drug Interaction Tool Integration */}
      <div className="mb-10">
        <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-blue-600" />
            Safety Intelligence
        </h3>
        <DrugInteractionChecker />
      </div>

      {/* AI Predications & Gamification */}
      <div className="space-y-4 mb-4">
        <h3 className="text-xl font-black text-gray-900 mb-2 flex items-center gap-2">
            <Target className="w-6 h-6 text-purple-600" />
            AI Forecasts
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-purple-50 to-white rounded-3xl p-6 border border-purple-100 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center text-white">
                        <Zap className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-gray-900">Pattern Detected</h4>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed italic">
                    "You miss your morning Metformin dose mostly on weekends. Try setting a specific Saturday alarm."
                </p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-white rounded-3xl p-6 border border-blue-100 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                        <Pill className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-gray-900">Optimization Goal</h4>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed italic">
                    "Take Atorvastatin right before bedtime for maximum efficacy based on your sleep patterns."
                </p>
            </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-8 pt-8 border-t border-gray-100 text-center">
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed px-10">
            AdherAI uses medical intelligence for informational purposes. Consult your physician for medical changes.
        </p>
      </div>
    </div>
  );
}
