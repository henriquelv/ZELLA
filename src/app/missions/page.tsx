"use client";

import { motion } from "framer-motion";
import { useUserStoreHydrated, useUserStore } from "@/store/useStore";
import { ArrowLeft, Target, CheckCircle2, Circle, AlertCircle, Plus } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { BottomNav } from "@/components/ui/bottom-nav";

export default function MissionsPage() {
    const user = useUserStoreHydrated((state) => state);
    const toggleGoal = useUserStore((state) => state.toggleGoal);

    if (!user) return null;

    const activeGoals = user.goals.filter(g => !g.completed);
    const completedGoals = user.goals.filter(g => g.completed);

    return (
        <div className="min-h-screen bg-[#f4f6fb] pb-24 font-sans selection:bg-blue-500/30">
            {/* Ambient Background Lights */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[10%] left-[-10%] w-[60%] h-[50%] bg-blue-400/[0.04] rounded-full blur-[120px]" />
                <div className="absolute top-[40%] right-[-10%] w-[50%] h-[40%] bg-emerald-400/[0.03] rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[20%] w-[60%] h-[30%] bg-purple-400/[0.03] rounded-full blur-[120px]" />
            </div>

            {/* Header */}
            <header className="px-6 pt-14 pb-4 bg-white/60 backdrop-blur-lg border-b border-white/40 ring-1 ring-black/[0.01] sticky top-0 z-10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard" className="p-2 rounded-[1rem] bg-gray-50/80 text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-all active:scale-95 shadow-sm ring-1 ring-black/[0.02]">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-extrabold text-gray-800 tracking-tight leading-tight">Missões da sua Carteira</h1>
                        <p className="text-[12px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">Aceleradores da sua Liberdade</p>
                    </div>
                </div>
            </header>

            <main className="p-6 max-w-lg mx-auto space-y-6">

                {/* Info Card */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/80 backdrop-blur-md rounded-[2rem] p-6 ring-1 ring-black/[0.02] shadow-xl shadow-blue-900/5 flex gap-4 relative overflow-hidden"
                >
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-100/50 rounded-full blur-2xl" />
                    <div className="w-12 h-12 bg-blue-50/80 rounded-[1.25rem] flex items-center justify-center shrink-0 ring-1 ring-blue-100/50 shadow-sm z-10">
                        <Target className="w-6 h-6 text-blue-500 drop-shadow-sm" />
                    </div>
                    <div className="z-10 relative">
                        <h3 className="text-[15px] font-extrabold text-gray-800 mb-1 leading-tight tracking-tight">Desafios sob Medida para Você</h3>
                        <p className="text-[13px] text-gray-500 leading-relaxed font-medium">
                            Eu olho de perto as suas movimentações e crio desafios especiais para ajudar você a tapar os ralos da sua vida financeira.
                        </p>
                    </div>
                </motion.div>

                {/* Active Goals */}
                <section>
                    <h2 className="text-[14px] font-extrabold text-gray-800 mb-4 flex items-center gap-2 tracking-tight">
                        <AlertCircle className="w-4 h-4 text-orange-500 drop-shadow-sm" />
                        🔥 Suas Missões Atuais
                    </h2>

                    {activeGoals.length === 0 ? (
                        <div className="bg-white/80 backdrop-blur-md rounded-[2rem] p-8 ring-1 ring-black/[0.02] shadow-lg shadow-blue-900/5 text-center flex flex-col items-center">
                            <div className="w-16 h-16 bg-blue-50 rounded-[1.25rem] flex items-center justify-center mb-4 ring-1 ring-blue-100 border border-white shadow-sm">
                                <CheckCircle2 className="w-8 h-8 text-blue-300 drop-shadow-sm" />
                            </div>
                            <p className="text-[16px] font-extrabold text-gray-800 mb-1 tracking-tight">Tudo sob controle por aqui! 🥳</p>
                            <p className="text-[13px] text-gray-500 font-medium leading-relaxed max-w-[250px]">
                                Continue acompanhando seus gastos. Se eu perceber qualquer desvio na sua conta, te chamo aqui para mais um desafio.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {activeGoals.map((goal, i) => (
                                <motion.div
                                    key={goal.id}
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="bg-white/80 backdrop-blur-md rounded-[1.25rem] p-5 ring-1 ring-black/[0.02] shadow-sm hover:shadow-md hover:ring-blue-500/10 transition-all flex items-start gap-4 group"
                                >
                                    {!goal.conditionType ? (
                                        <button
                                            onClick={() => toggleGoal(goal.id)}
                                            className="mt-0.5 text-gray-300 hover:text-blue-500 transition-colors shrink-0"
                                        >
                                            <Circle className="w-6 h-6 drop-shadow-sm group-hover:scale-110 transition-transform" />
                                        </button>
                                    ) : (
                                        <div className="mt-1.5 w-6 h-6 shrink-0 flex items-center justify-center">
                                            <div className="w-3 h-3 rounded-full bg-blue-400 animate-pulse" />
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-3 mb-1.5">
                                            <h3 className="font-extrabold text-[15px] text-gray-800 leading-tight">
                                                {goal.title}
                                            </h3>
                                            <span className="shrink-0 text-[10px] font-black bg-amber-50 text-amber-600 border border-amber-200 px-2 py-0.5 rounded-full uppercase tracking-widest shadow-sm">
                                                +{goal.xpReward} XP
                                            </span>
                                        </div>
                                        <p className="text-[13px] text-gray-500 leading-relaxed font-medium mb-2.5 pr-2">
                                            {goal.description}
                                        </p>

                                        {/* Barra de Progresso — metas de limite de gasto */}
                                        {goal.conditionType === 'spending_limit' && goal.targetAmount != null && (
                                            <div className="mb-3">
                                                <div className="flex justify-between items-center mb-1.5">
                                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                        Gasto: R$ {(goal.spentSoFar || 0).toFixed(0)} / R$ {goal.targetAmount.toFixed(0)}
                                                    </span>
                                                    <span className={cn(
                                                        "text-[10px] font-black uppercase tracking-widest",
                                                        (goal.spentSoFar || 0) / goal.targetAmount > 0.85 ? "text-red-500" : "text-emerald-500"
                                                    )}>
                                                        {Math.min(100, Math.round(((goal.spentSoFar || 0) / goal.targetAmount) * 100))}%
                                                    </span>
                                                </div>
                                                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                                    <div
                                                        className={cn(
                                                            "h-full rounded-full transition-all duration-500",
                                                            (goal.spentSoFar || 0) / goal.targetAmount > 0.85
                                                                ? "bg-gradient-to-r from-red-400 to-red-500"
                                                                : "bg-gradient-to-r from-emerald-400 to-emerald-500"
                                                        )}
                                                        style={{ width: `${Math.min(100, ((goal.spentSoFar || 0) / goal.targetAmount) * 100)}%` }}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between gap-2">
                                            <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">
                                                Recebido em {format(new Date(goal.createdAt), "dd MMM", { locale: ptBR })}
                                            </p>
                                            {goal.conditionType && (
                                                <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                                                    ⚡ Auto-rastreada
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Completed Goals */}
                {completedGoals.length > 0 && (
                    <section className="mt-8 opacity-80">
                        <h2 className="text-[12px] font-black text-gray-400 mb-4 flex items-center gap-2 uppercase tracking-widest pl-1">
                            🏆 Suas Conquistas Passadas
                        </h2>
                        <div className="space-y-3">
                            {completedGoals.map((goal) => (
                                <div
                                    key={goal.id}
                                    className={cn(
                                        "rounded-[1.25rem] p-4 flex items-center gap-4 border ring-1 ring-black/[0.02] shadow-sm backdrop-blur-sm",
                                        goal.title.includes("Falhou")
                                            ? "bg-red-50/50 border-red-100"
                                            : "bg-emerald-50/50 border-emerald-100"
                                    )}
                                >
                                    <CheckCircle2 className={cn("w-6 h-6 drop-shadow-sm", goal.title.includes("Falhou") ? "text-red-400" : "text-emerald-500")} />
                                    <div className="flex-1 min-w-0">
                                        <h3 className={cn("font-extrabold text-[14px] tracking-tight mb-0.5", goal.title.includes("Falhou") ? "text-red-800" : "text-emerald-800")}>
                                            {goal.title}
                                        </h3>
                                        <p className={cn("text-[12px] font-medium", goal.title.includes("Falhou") ? "text-red-600/80" : "text-emerald-600/80")}>
                                            {goal.title.includes("Falhou") ? "Poxa, essa regra escapou. Mas seguimos em frente!" : "Incrível! Você mandou muito bem nesse desafio!"}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </main>
            <BottomNav />
        </div>
    );
}
