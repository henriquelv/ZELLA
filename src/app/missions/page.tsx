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
        <div className="min-h-screen bg-[#f4f6fb] pb-24">
            {/* Header */}
            <header className="px-6 pt-12 pb-6 bg-white shadow-sm border-b border-gray-100 sticky top-0 z-10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard" className="p-2 rounded-xl bg-gray-50 text-gray-400 hover:bg-gray-100 transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 tracking-tight">Missões da Carteira</h1>
                        <p className="text-[13px] text-gray-500 font-medium">Metas inteligentes do Zella</p>
                    </div>
                </div>
            </header>

            <main className="p-6 max-w-lg mx-auto space-y-6">

                {/* Info Card */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-blue-50 border border-blue-100/50 rounded-2xl p-4 flex gap-3 shadow-sm relative overflow-hidden"
                >
                    <div className="absolute -right-4 -top-4 w-16 h-16 bg-blue-100 rounded-full opacity-50 blur-xl" />
                    <Target className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                        <h3 className="text-[13px] font-bold text-blue-900 mb-1">Metas Baseadas em Dados</h3>
                        <p className="text-[12px] text-blue-700/80 leading-relaxed font-medium">
                            O Zella analisa seu extrato a cada transação e cria desafios automáticos focados nos seus maiores gargalos financeiros (Drenos).
                        </p>
                    </div>
                </motion.div>

                {/* Active Goals */}
                <section>
                    <h2 className="text-[15px] font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-orange-500" />
                        Desafios Ativos
                    </h2>

                    {activeGoals.length === 0 ? (
                        <div className="bg-white rounded-3xl p-8 border border-black/[0.05] shadow-sm text-center flex flex-col items-center">
                            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                                <CheckCircle2 className="w-6 h-6 text-gray-300" />
                            </div>
                            <p className="text-[14px] font-bold text-gray-900 mb-1">Tudo limpo por aqui!</p>
                            <p className="text-[12px] text-gray-500 font-medium leading-relaxed max-w-[250px]">
                                Continue registrando suas despesas. Se o Zella detectar um Dreno, uma nova meta aparecerá aqui.
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
                                    className="bg-white rounded-2xl p-4 border border-black/[0.05] shadow-sm flex items-start gap-3"
                                >
                                    <button
                                        onClick={() => toggleGoal(goal.id)}
                                        className="mt-0.5 text-gray-300 hover:text-[#2563eb] transition-colors"
                                    >
                                        <Circle className="w-6 h-6" />
                                    </button>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2 mb-1">
                                            <h3 className="font-bold text-[14px] text-gray-900 leading-tight">
                                                {goal.title}
                                            </h3>
                                            <span className="shrink-0 text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                                                +{goal.xpReward} XP
                                            </span>
                                        </div>
                                        <p className="text-[12px] text-gray-500 leading-relaxed font-medium mb-2">
                                            {goal.description}
                                        </p>
                                        <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                                            Criado em {format(new Date(goal.createdAt), "dd MMM", { locale: ptBR })}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Completed Goals */}
                {completedGoals.length > 0 && (
                    <section className="mt-8 opacity-70">
                        <h2 className="text-[13px] font-bold text-gray-500 mb-3 flex items-center gap-2 uppercase tracking-wide">
                            Histórico (Concluídas / Falhas)
                        </h2>
                        <div className="space-y-2">
                            {completedGoals.map((goal) => (
                                <div
                                    key={goal.id}
                                    className={cn(
                                        "rounded-xl p-3 border flex items-center gap-3",
                                        goal.title.includes("Falhou")
                                            ? "bg-red-50/50 border-red-100"
                                            : "bg-emerald-50/50 border-emerald-100"
                                    )}
                                >
                                    <CheckCircle2 className={cn("w-5 h-5", goal.title.includes("Falhou") ? "text-red-400" : "text-emerald-500")} />
                                    <div className="flex-1 min-w-0">
                                        <h3 className={cn("font-bold text-[13px]", goal.title.includes("Falhou") ? "text-red-900" : "text-emerald-900")}>
                                            {goal.title}
                                        </h3>
                                        <p className={cn("text-[11px]", goal.title.includes("Falhou") ? "text-red-700/70" : "text-emerald-700/70")}>
                                            {goal.title.includes("Falhou") ? "Quebrou a regra da meta." : "Desafio superado!"}
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
