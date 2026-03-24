"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Gamepad2, Sparkles, Trophy, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useUserStoreHydrated, useUserStore } from "@/store/useStore";
import { SwipeCardGame } from "@/components/ui/swipe-card-game";
import { BottomNav } from "@/components/ui/bottom-nav";
import { cn } from "@/lib/utils";

export default function GamesPage() {
    const user = useUserStoreHydrated(state => state);
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
                        <h1 className="text-xl font-extrabold text-gray-800 tracking-tight leading-tight">Mini Jogos</h1>
                        <p className="text-[12px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">Aprenda e ganhe XP</p>
                    </div>
                </div>
                <div className="flex items-center gap-1.5 bg-blue-50/80 backdrop-blur-sm px-3.5 py-2 rounded-xl ring-1 ring-blue-100/50 shadow-sm">
                    <Trophy className="w-4 h-4 text-blue-500 drop-shadow-sm" />
                    <span className="text-[12px] font-black text-blue-600 uppercase tracking-widest">{user.xp} XP</span>
                </div>
            </header>

            <main className="p-6 max-w-lg mx-auto space-y-6">

                <motion.div
                    key="swipe"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="space-y-4"
                >
                    <div className="bg-white/80 backdrop-blur-md rounded-[2rem] p-6 ring-1 ring-black/[0.02] shadow-xl shadow-blue-900/5 text-center relative overflow-hidden">
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-violet-400/10 rounded-full blur-2xl" />
                        <h2 className="text-[16px] font-extrabold text-gray-800 mb-1 flex items-center justify-center gap-2 tracking-tight relative z-10">
                            <Sparkles className="w-5 h-5 text-violet-500 drop-shadow-sm" />
                            Necessidade vs Desejo
                        </h2>
                        <p className="text-[13px] text-gray-500 mb-8 font-medium leading-relaxed max-w-[280px] mx-auto relative z-10">
                            Arraste para classificar os gastos. Treine seu cérebro para evitar dívidas!
                        </p>

                        {swipeScore !== null ? (
                            <div className="py-8 space-y-4 relative z-10">
                                <div className="w-20 h-20 bg-emerald-50/80 ring-1 ring-emerald-100/50 rounded-[1.5rem] flex items-center justify-center mx-auto shadow-sm">
                                    <CheckCircle2 className="w-10 h-10 text-emerald-500 drop-shadow-sm" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="font-extrabold text-[20px] text-emerald-600 tracking-tight">Bom trabalho!</h3>
                                    <p className="text-[14px] text-gray-500 font-medium">
                                        Você acertou <strong className="text-gray-800 font-black">{swipeScore}</strong> de 10.
                                    </p>
                                </div>
                                <button
                                    onClick={() => setSwipeScore(null)}
                                    className="mt-6 px-8 py-3 bg-gray-50 border border-gray-200 hover:bg-gray-100 hover:border-gray-300 text-gray-600 font-black rounded-xl text-[12px] uppercase tracking-widest transition-all shadow-sm active:scale-95"
                                >
                                    Jogar Novamente
                                </button>
                            </div>
                        ) : (
                            <div className="relative z-10">
                                <SwipeCardGame onFinish={handleSwipeFinish} />
                            </div>
                        )}
                    </div>
                </motion.div>

            </main>
            <BottomNav />
        </div>
    );
}
