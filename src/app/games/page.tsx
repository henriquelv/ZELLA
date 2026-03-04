"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Gamepad2, BrainCircuit, Sparkles, Trophy, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useUserStoreHydrated, useUserStore } from "@/store/useStore";
import { DailyQuiz } from "@/components/ui/daily-quiz";
import { SwipeCardGame } from "@/components/ui/swipe-card-game";
import { BottomNav } from "@/components/ui/bottom-nav";
import { cn } from "@/lib/utils";

export default function GamesPage() {
    const user = useUserStoreHydrated(state => state);
    const [activeTab, setActiveTab] = useState<'quiz' | 'swipe'>('quiz');
    const [swipeScore, setSwipeScore] = useState<number | null>(null);

    if (!user) return null;

    const handleSwipeFinish = (score: number, total: number) => {
        setSwipeScore(score);
        // Add some XP if not fully handled by the game component
        if (score > total * 0.7) {
            useUserStore.getState().addXp(30);
        }
    };

    return (
        <div className="min-h-screen bg-[#f4f6fb] pb-24">
            {/* Header */}
            <header className="px-6 pt-12 pb-6 bg-white shadow-sm border-b border-gray-100 sticky top-0 z-10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard" className="p-2 rounded-xl bg-gray-50 text-gray-400 hover:bg-gray-100 transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 tracking-tight">Mini Jogos</h1>
                        <p className="text-[13px] text-gray-500 font-medium">Aprenda e ganhe XP</p>
                    </div>
                </div>
                <div className="flex items-center gap-1.5 bg-blue-50 px-3.5 py-2 rounded-full border border-blue-100/50">
                    <Trophy className="w-4 h-4 text-blue-600" />
                    <span className="text-[12px] font-bold text-blue-700">{user.xp} XP</span>
                </div>
            </header>

            <main className="p-6 max-w-lg mx-auto space-y-6">

                {/* Tab Selector */}
                <div className="flex bg-white rounded-2xl p-1 border border-black/[0.05] shadow-sm">
                    <button
                        onClick={() => setActiveTab('quiz')}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-bold transition-all",
                            activeTab === 'quiz' ? "bg-blue-50 text-blue-700 shadow-sm" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                        )}
                    >
                        <BrainCircuit className="w-4 h-4" /> Quiz Diário
                    </button>
                    <button
                        onClick={() => setActiveTab('swipe')}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-bold transition-all",
                            activeTab === 'swipe' ? "bg-violet-50 text-violet-700 shadow-sm" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                        )}
                    >
                        <Gamepad2 className="w-4 h-4" /> Swipe Cards
                    </button>
                </div>

                <AnimatePresence mode="wait">
                    {activeTab === 'quiz' ? (
                        <motion.div
                            key="quiz"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            className="space-y-4"
                        >
                            <div className="bg-white rounded-3xl p-6 border border-black/[0.05] shadow-sm">
                                <h2 className="text-[15px] font-bold text-gray-900 mb-1 flex items-center gap-2">
                                    <BrainCircuit className="w-5 h-5 text-blue-600" />
                                    Desafio do Dia
                                </h2>
                                <p className="text-[12px] text-gray-500 mb-6 font-medium leading-relaxed">
                                    Responda a pergunta diária de educação financeira e ganhe experiência para subir de nível.
                                </p>
                                <DailyQuiz />
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="swipe"
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="space-y-4"
                        >
                            <div className="bg-white rounded-3xl p-6 border border-black/[0.05] shadow-sm text-center">
                                <h2 className="text-[16px] font-bold text-gray-900 mb-1 flex items-center justify-center gap-2">
                                    <Sparkles className="w-5 h-5 text-violet-600" />
                                    Necessidade vs Desejo
                                </h2>
                                <p className="text-[13px] text-gray-500 mb-8 font-medium leading-relaxed max-w-[280px] mx-auto">
                                    Arraste para classificar os gastos. Treine seu cérebro para evitar dívidas!
                                </p>

                                {swipeScore !== null ? (
                                    <div className="py-8 space-y-4">
                                        <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto">
                                            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-[18px] text-gray-900">Bom trabalho!</h3>
                                            <p className="text-[14px] text-gray-500 mt-1">
                                                Você acertou <strong className="text-gray-900">{swipeScore}</strong> de 10.
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => setSwipeScore(null)}
                                            className="mt-4 px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-full text-[13px] transition-colors"
                                        >
                                            Jogar Novamente
                                        </button>
                                    </div>
                                ) : (
                                    <SwipeCardGame onFinish={handleSwipeFinish} />
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

            </main>
            <BottomNav />
        </div>
    );
}
