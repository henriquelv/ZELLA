"use client";

import { motion } from "framer-motion";
import { useUserStoreHydrated } from "@/store/useStore";
import { ArrowLeft, Shield, TrendingUp, AlertTriangle, Target, Lock, Unlock } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Definições visuais para cada degrau (LogicaBack Base)
const DEGRAUS_INFO = [
    { id: 1, name: "Sobrevivente", color: "text-gray-500", bg: "bg-gray-100", border: "border-gray-200" },
    { id: 2, name: "Organizando", color: "text-blue-500", bg: "bg-blue-50", border: "border-blue-100" },
    { id: 3, name: "Controlador", color: "text-emerald-500", bg: "bg-emerald-50", border: "border-emerald-100" },
    { id: 4, name: "Construtor", color: "text-indigo-500", bg: "bg-indigo-50", border: "border-indigo-100" },
    { id: 5, name: "Estrategista", color: "text-purple-500", bg: "bg-purple-50", border: "border-purple-100" },
    { id: 6, name: "Mestre", color: "text-amber-500", bg: "bg-amber-50", border: "border-amber-100" },
];

export default function ProfilePage() {
    const user = useUserStoreHydrated((state) => state);

    if (!user) return null;

    const currentDegrauIdx = Math.max(0, Math.min(5, user.currentStep - 1));
    const nextDegrauIdx = Math.min(5, currentDegrauIdx + 1);

    const currentDegrau = DEGRAUS_INFO[currentDegrauIdx];
    const nextDegrau = DEGRAUS_INFO[nextDegrauIdx];

    // Helper para determinar se a métrica está boa para o PRÓXIMO degrau
    const checkMetric = (metric: 'ie' | 'is' | 'id' | 'rs', value: number) => {
        const rules = [
            { ie: 0, is: 100, id: 100, rs: 0 }, // D1 Target
            { ie: 0.1, is: 80, id: 20, rs: 0 }, // D2 Target
            { ie: 5, is: 75, id: 15, rs: 0.5 }, // D3 Target
            { ie: 10, is: 70, id: 10, rs: 1 },  // D4 Target
            { ie: 15, is: 100, id: 7, rs: 3 },  // D5 Target
            { ie: 20, is: 100, id: 5, rs: 6 },  // D6 Target
        ];
        const target = rules[nextDegrauIdx] || rules[currentDegrauIdx];

        if (metric === 'ie' || metric === 'rs') return value >= target[metric];
        return value <= target[metric]; // is, id devem ser MENORES ou iguais
    };

    const getMetricStatus = (metric: 'ie' | 'is' | 'id' | 'rs', value: number) => {
        const isSatisfied = checkMetric(metric, value);
        if (isSatisfied) return { color: "text-emerald-600", bg: "bg-emerald-50" };
        return { color: "text-red-500", bg: "bg-red-50" };
    };

    return (
        <div className="min-h-screen bg-[#f4f6fb] pb-24 font-sans selection:bg-blue-500/30">
            {/* Ambient Background Lights */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[10%] left-[-10%] w-[60%] h-[50%] bg-blue-400/[0.04] rounded-full blur-[120px]" />
                <div className="absolute top-[40%] right-[-10%] w-[50%] h-[40%] bg-emerald-400/[0.03] rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[20%] w-[60%] h-[30%] bg-purple-400/[0.03] rounded-full blur-[120px]" />
            </div>

            {/* Header */}
            <header className="px-6 pt-14 pb-4 bg-white/60 backdrop-blur-lg border-b border-white/40 ring-1 ring-black/[0.01] sticky top-0 z-10 flex items-center gap-4">
                <Link href="/dashboard" className="p-2 rounded-[1rem] bg-gray-50/80 text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-all active:scale-95 shadow-sm ring-1 ring-black/[0.02]">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-xl font-extrabold text-gray-800 tracking-tight leading-tight">Perfil & Maturidade</h1>
                    <p className="text-[12px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">Sua evolução financeira real</p>
                </div>
            </header>

            <main className="p-6 max-w-lg mx-auto space-y-8">
                {/* Separação: Level vs Degrau */}
                <div className="grid grid-cols-2 gap-4">
                    {/* Gamification Level */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/80 backdrop-blur-md rounded-[2rem] p-6 ring-1 ring-black/[0.02] shadow-xl shadow-blue-900/5 flex flex-col items-center justify-center text-center relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-20 h-20 bg-blue-100/50 rounded-bl-full -z-0 blur-xl" />
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 z-10">O Jogador</span>
                        <div className="w-16 h-16 rounded-[1.25rem] bg-blue-50/80 ring-1 ring-blue-100/50 text-blue-500 flex items-center justify-center font-black text-3xl z-10 shadow-sm mb-3">
                            {user.level}
                        </div>
                        <p className="text-[12px] text-gray-500 font-bold z-10 border-t border-gray-100/50 pt-3 w-full uppercase tracking-wider">Medida de Hábito</p>
                    </motion.div>

                    {/* Financial Degrau */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className={cn("backdrop-blur-md rounded-[2rem] p-6 shadow-xl shadow-blue-900/5 flex flex-col items-center justify-center text-center relative overflow-hidden ring-1 ring-black/[0.02]", currentDegrau.bg)}
                    >
                        <div className="absolute top-0 left-0 w-20 h-20 bg-white/40 rounded-br-full -z-0 blur-xl" />
                        <span className={cn("text-[10px] font-black uppercase tracking-widest mb-3 z-10 opacity-70", currentDegrau.color)}>A Carteira</span>
                        <div className={cn("w-16 h-16 rounded-[1.25rem] flex items-center justify-center shadow-sm mb-3 z-10 bg-white/80 backdrop-blur-sm ring-1 ring-black/[0.02]", currentDegrau.color)}>
                            <Shield className="w-8 h-8 drop-shadow-sm" />
                        </div>
                        <p className={cn("text-[12px] font-black uppercase tracking-wider z-10 border-t border-black/[0.05] pt-3 w-full", currentDegrau.color)}>
                            Degrau {currentDegrau.id}
                        </p>
                    </motion.div>
                </div>

                <div className="text-center px-4">
                    <h2 className={cn("text-2xl font-black mb-1", currentDegrau.color)}>{currentDegrau.name}</h2>
                    <p className="text-[14px] text-gray-500 leading-relaxed font-medium">
                        Seu degrau reflete a <strong>saúde objetiva</strong> do seu dinheiro nos últimos 30 dias.
                    </p>
                </div>

                {/* Métricas Trindade Zella */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white/80 backdrop-blur-md rounded-[2rem] p-6 ring-1 ring-black/[0.02] shadow-xl shadow-blue-900/5 relative"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-extrabold text-[15px] text-gray-800 flex items-center gap-2 tracking-tight">
                            <Target className="w-5 h-5 text-blue-500 drop-shadow-sm" />
                            Análise de Travas
                        </h3>
                        {currentDegrauIdx < 5 && (
                            <span className="text-[10px] bg-gray-50/80 backdrop-blur-sm px-3 py-1.5 rounded-full font-black text-gray-500 ring-1 ring-black/[0.05] uppercase tracking-widest shadow-sm">
                                Alvo: D{nextDegrau.id}
                            </span>
                        )}
                    </div>

                    <div className="space-y-3">
                        {/* IE: ÍNDICE DE EFICIÊNCIA */}
                        <div className="flex items-center justify-between p-4 rounded-[1.25rem] bg-white/60 border border-white ring-1 ring-black/[0.02] shadow-sm backdrop-blur-sm transition-all hover:shadow-md hover:ring-blue-500/10">
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Índice de Eficiência (IE)</p>
                                <div className="flex items-end gap-2">
                                    <span className="text-[22px] font-black text-gray-800 leading-tight tracking-tighter">{user.ie.toFixed(1)}%</span>
                                    <span className="text-[11px] text-gray-500 font-bold mb-1 opacity-80">Média: Reserva Gerada</span>
                                </div>
                            </div>
                            <div className={cn("w-11 h-11 rounded-[0.85rem] flex items-center justify-center shadow-sm border border-white/50 ring-1 ring-black/[0.02]", getMetricStatus('ie', user.ie).bg, getMetricStatus('ie', user.ie).color)}>
                                {checkMetric('ie', user.ie) ? <Unlock className="w-5 h-5 drop-shadow-sm" /> : <Lock className="w-5 h-5 drop-shadow-sm opacity-80" />}
                            </div>
                        </div>

                        {/* IS: ÍNDICE DE SOBREVIVÊNCIA */}
                        <div className="flex items-center justify-between p-4 rounded-[1.25rem] bg-white/60 border border-white ring-1 ring-black/[0.02] shadow-sm backdrop-blur-sm transition-all hover:shadow-md hover:ring-blue-500/10">
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Sobrevivência (IS)</p>
                                <div className="flex items-end gap-2">
                                    <span className="text-[22px] font-black text-gray-800 leading-tight tracking-tighter">{user.is.toFixed(1)}%</span>
                                    <span className="text-[11px] text-gray-500 font-bold mb-1 opacity-80">Gastos Essenciais</span>
                                </div>
                            </div>
                            <div className={cn("w-11 h-11 rounded-[0.85rem] flex items-center justify-center shadow-sm border border-white/50 ring-1 ring-black/[0.02]", getMetricStatus('is', user.is).bg, getMetricStatus('is', user.is).color)}>
                                {checkMetric('is', user.is) ? <Unlock className="w-5 h-5 drop-shadow-sm" /> : <Lock className="w-5 h-5 drop-shadow-sm opacity-80" />}
                            </div>
                        </div>

                        {/* ID: ÍNDICE DE DRENOS */}
                        <div className="flex items-center justify-between p-4 rounded-[1.25rem] bg-white/60 border border-white ring-1 ring-black/[0.02] shadow-sm backdrop-blur-sm transition-all hover:shadow-md hover:ring-blue-500/10">
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Drenos (ID)</p>
                                <div className="flex items-end gap-2">
                                    <span className="text-[22px] font-black text-gray-800 leading-tight tracking-tighter">{user.idMetric.toFixed(1)}%</span>
                                    <span className="text-[11px] text-gray-500 font-bold mb-1 opacity-80">Desperdícios / Ruim</span>
                                </div>
                            </div>
                            <div className={cn("w-11 h-11 rounded-[0.85rem] flex items-center justify-center shadow-sm border border-white/50 ring-1 ring-black/[0.02]", getMetricStatus('id', user.idMetric).bg, getMetricStatus('id', user.idMetric).color)}>
                                {checkMetric('id', user.idMetric) ? <Unlock className="w-5 h-5 drop-shadow-sm" /> : <AlertTriangle className="w-5 h-5 drop-shadow-sm opacity-80" />}
                            </div>
                        </div>

                        {/* RS: RESERVA DE SEGURANÇA */}
                        <div className="flex items-center justify-between p-4 rounded-[1.25rem] bg-white/60 border border-white ring-1 ring-black/[0.02] shadow-sm backdrop-blur-sm transition-all hover:shadow-md hover:ring-blue-500/10">
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Reserva (RS)</p>
                                <div className="flex items-end gap-2">
                                    <span className="text-[22px] font-black text-gray-800 leading-tight tracking-tighter">{user.rs.toFixed(1)}x</span>
                                    <span className="text-[11px] text-gray-500 font-bold mb-1 opacity-80">Meses Cobertos</span>
                                </div>
                            </div>
                            <div className={cn("w-11 h-11 rounded-[0.85rem] flex items-center justify-center shadow-sm border border-white/50 ring-1 ring-black/[0.02]", getMetricStatus('rs', user.rs).bg, getMetricStatus('rs', user.rs).color)}>
                                {checkMetric('rs', user.rs) ? <Unlock className="w-5 h-5 drop-shadow-sm" /> : <Lock className="w-5 h-5 drop-shadow-sm opacity-80" />}
                            </div>
                        </div>
                    </div>

                    <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wide leading-relaxed mt-6 text-center px-4">
                        O Zella avalia seus últimos 30 dias continuamente.
                    </p>
                </motion.div>

            </main>
        </div>
    );
}
