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
        <div className="min-h-screen bg-[#f4f6fb] pb-24">
            {/* Header */}
            <header className="px-6 pt-12 pb-6 bg-white shadow-sm border-b border-gray-100 sticky top-0 z-10 flex items-center gap-4">
                <Link href="/dashboard" className="p-2 rounded-xl bg-gray-50 text-gray-400 hover:bg-gray-100 transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-xl font-bold text-gray-900 tracking-tight">Perfil & Maturidade</h1>
                    <p className="text-[13px] text-gray-500 font-medium">Sua evolução financeira real</p>
                </div>
            </header>

            <main className="p-6 max-w-lg mx-auto space-y-8">
                {/* Separação: Level vs Degrau */}
                <div className="grid grid-cols-2 gap-4">
                    {/* Gamification Level */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-3xl p-5 border border-black/[0.05] shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-16 h-16 bg-blue-50 rounded-bl-3xl -z-0 opacity-50" />
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 z-10">O Jogador</span>
                        <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-black text-2xl z-10 shadow-inner mb-2">
                            {user.level}
                        </div>
                        <p className="text-[13px] text-gray-500 font-semibold z-10 border-t border-gray-100 pt-2 w-full">Medida de Hábito</p>
                    </motion.div>

                    {/* Financial Degrau */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className={cn("rounded-3xl p-5 border shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden", currentDegrau.bg, currentDegrau.border)}
                    >
                        <div className="absolute top-0 left-0 w-16 h-16 bg-white/40 rounded-br-3xl -z-0" />
                        <span className={cn("text-[11px] font-bold uppercase tracking-wider mb-2 z-10 opacity-70", currentDegrau.color)}>A Carteira</span>
                        <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center font-black shadow-sm mb-2 z-10 bg-white", currentDegrau.color)}>
                            <Shield className="w-7 h-7" />
                        </div>
                        <p className={cn("text-[13px] font-bold z-10 border-t pt-2 w-full", currentDegrau.color, currentDegrau.border)}>
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
                    className="bg-white rounded-3xl p-6 border border-black/[0.05] shadow-sm relative"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                            <Target className="w-5 h-5 text-gray-400" />
                            Análise de Travas
                        </h3>
                        {currentDegrauIdx < 5 && (
                            <span className="text-[12px] bg-gray-50 px-3 py-1 rounded-full font-bold text-gray-500 border border-gray-200">
                                Alvo: Degrau {nextDegrau.id} ({nextDegrau.name})
                            </span>
                        )}
                    </div>

                    <div className="space-y-4">
                        {/* IE: ÍNDICE DE EFICIÊNCIA */}
                        <div className="flex items-center justify-between p-4 rounded-2xl border border-gray-50 bg-gray-50/50">
                            <div>
                                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Índice de Eficiência (IE)</p>
                                <div className="flex items-end gap-2">
                                    <span className="text-xl font-bold text-gray-900">{user.ie.toFixed(1)}%</span>
                                    <span className="text-[12px] text-gray-500 font-medium mb-1">Média: Reserva Gerada</span>
                                </div>
                            </div>
                            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", getMetricStatus('ie', user.ie).bg, getMetricStatus('ie', user.ie).color)}>
                                {checkMetric('ie', user.ie) ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                            </div>
                        </div>

                        {/* IS: ÍNDICE DE SOBREVIVÊNCIA */}
                        <div className="flex items-center justify-between p-4 rounded-2xl border border-gray-50 bg-gray-50/50">
                            <div>
                                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Sobrevivência (IS)</p>
                                <div className="flex items-end gap-2">
                                    <span className="text-xl font-bold text-gray-900">{user.is.toFixed(1)}%</span>
                                    <span className="text-[12px] text-gray-500 font-medium mb-1">Gastos Essenciais</span>
                                </div>
                            </div>
                            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", getMetricStatus('is', user.is).bg, getMetricStatus('is', user.is).color)}>
                                {checkMetric('is', user.is) ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                            </div>
                        </div>

                        {/* ID: ÍNDICE DE DRENOS */}
                        <div className="flex items-center justify-between p-4 rounded-2xl border border-gray-50 bg-gray-50/50">
                            <div>
                                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Drenos (ID)</p>
                                <div className="flex items-end gap-2">
                                    <span className="text-xl font-bold text-gray-900">{user.idMetric.toFixed(1)}%</span>
                                    <span className="text-[12px] text-gray-500 font-medium mb-1">Desperdícios / Gasto Ruim</span>
                                </div>
                            </div>
                            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", getMetricStatus('id', user.idMetric).bg, getMetricStatus('id', user.idMetric).color)}>
                                {checkMetric('id', user.idMetric) ? <Unlock className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                            </div>
                        </div>

                        {/* RS: RESERVA DE SEGURANÇA */}
                        <div className="flex items-center justify-between p-4 rounded-2xl border border-gray-50 bg-gray-50/50">
                            <div>
                                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Reserva (RS)</p>
                                <div className="flex items-end gap-2">
                                    <span className="text-xl font-bold text-gray-900">{user.rs.toFixed(1)}x</span>
                                    <span className="text-[12px] text-gray-500 font-medium mb-1">Meses Cobertos</span>
                                </div>
                            </div>
                            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", getMetricStatus('rs', user.rs).bg, getMetricStatus('rs', user.rs).color)}>
                                {checkMetric('rs', user.rs) ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                            </div>
                        </div>
                    </div>

                    <p className="text-[12px] text-gray-400 font-medium leading-relaxed mt-5 text-center px-4">
                        O Zella avalia seus últimos 30 dias continuamente. Melhore as métricas com cadeado para evoluir de Degrau.
                    </p>
                </motion.div>

            </main>
        </div>
    );
}
