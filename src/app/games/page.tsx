"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Sparkles, Trophy, CheckCircle2, Brain, Target, Lock } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { toast } from "sonner";
import { useUserStoreHydrated, useUserStore } from "@/store/useStore";
import { SwipeCardGame } from "@/components/ui/swipe-card-game";
import { DrainHuntGame } from "@/components/ui/games/drain-hunt";
import { QuickQuizGame } from "@/components/ui/games/quick-quiz";
import { BottomNav } from "@/components/ui/bottom-nav";
import { cn } from "@/lib/utils";

type GameId = "swipe" | "drain" | "quiz" | null;

const GAMES = [
    {
        id: "swipe" as const,
        title: "Necessidade vs Desejo",
        desc: "Classifica 10 gastos arrastando",
        icon: Sparkles,
        color: "text-violet-600",
        bg: "bg-violet-50",
        reward: "+30 XP +10 coins",
    },
    {
        id: "drain" as const,
        title: "Caça ao Dreno",
        desc: "Acha os 4 drenos em 30 segundos",
        icon: Target,
        color: "text-emerald-600",
        bg: "bg-emerald-50",
        reward: "+25 XP +10 coins",
    },
    {
        id: "quiz" as const,
        title: "Quiz Relâmpago",
        desc: "5 perguntas, 10 segundos cada",
        icon: Brain,
        color: "text-blue-600",
        bg: "bg-blue-50",
        reward: "+40 XP +15 coins",
        daily: true,
    },
];

export default function GamesPage() {
    const user = useUserStoreHydrated(state => state);
    const addXp = useUserStore(state => state.addXp);
    const addCoins = useUserStore(state => state.addCoins);
    const completeDailyQuiz = useUserStore(state => state.completeDailyQuiz);
    const [active, setActive] = useState<GameId>(null);
    const [swipeResult, setSwipeResult] = useState<{ score: number; total: number } | null>(null);
    const [drainResult, setDrainResult] = useState<{ hits: number; misses: number } | null>(null);
    const [quizResult, setQuizResult] = useState<{ correct: number; total: number } | null>(null);

    if (!user) return null;

    const today = format(new Date(), "yyyy-MM-dd");
    const quizDoneToday = user.dailyQuizCompletedAt === today;

    const handleSwipeFinish = (score: number, total: number) => {
        setSwipeResult({ score, total });
        if (score > total * 0.7) {
            addXp(30);
            addCoins(10);
            toast.success("+30 XP, +10 coins!");
        } else {
            toast.info("Tenta de novo pra ganhar XP!");
        }
    };

    const handleDrainFinish = (hits: number, misses: number) => {
        setDrainResult({ hits, misses });
        if (hits >= 3) {
            addXp(25);
            addCoins(10);
            toast.success("+25 XP, +10 coins!");
        }
    };

    const handleQuizFinish = (correct: number, total: number) => {
        setQuizResult({ correct, total });
        if (correct >= 4) {
            completeDailyQuiz(40);
            addCoins(15);
            toast.success("+40 XP, +15 coins!");
        } else {
            completeDailyQuiz(0);
            toast.info("Volta amanhã pra tentar de novo!");
        }
    };

    const closeGame = () => {
        setActive(null);
        setSwipeResult(null);
        setDrainResult(null);
        setQuizResult(null);
    };

    return (
        <div className="min-h-screen bg-[#f4f6fb] pb-24 font-sans selection:bg-blue-500/30">
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[10%] left-[-10%] w-[60%] h-[50%] bg-blue-400/[0.04] rounded-full blur-[120px]" />
                <div className="absolute top-[40%] right-[-10%] w-[50%] h-[40%] bg-emerald-400/[0.03] rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[20%] w-[60%] h-[30%] bg-purple-400/[0.03] rounded-full blur-[120px]" />
            </div>

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

            <main className="p-6 max-w-lg mx-auto space-y-4">
                <AnimatePresence mode="wait">
                    {active === null && (
                        <motion.div
                            key="hub"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="grid grid-cols-1 gap-3"
                        >
                            {GAMES.map(g => {
                                const locked = g.daily && quizDoneToday;
                                return (
                                    <button
                                        key={g.id}
                                        onClick={() => !locked && setActive(g.id)}
                                        disabled={locked}
                                        className={cn(
                                            "text-left bg-white/95 rounded-[1.5rem] p-5 ring-1 ring-black/[0.02] border border-white/50 shadow-lg flex items-center gap-4 transition-all",
                                            locked ? "opacity-60 cursor-not-allowed" : "active:scale-[0.98] hover:shadow-xl"
                                        )}
                                    >
                                        <div className={cn("w-14 h-14 rounded-[1.25rem] flex items-center justify-center shadow-sm ring-1 ring-black/[0.02]", g.bg)}>
                                            <g.icon className={cn("w-7 h-7 drop-shadow-sm", g.color)} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-extrabold text-[15px] text-gray-800 leading-tight">{g.title}</h3>
                                            <p className="text-[11px] text-gray-500 font-medium mt-0.5 leading-snug">{g.desc}</p>
                                            <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mt-1.5">
                                                {locked ? "Volte amanhã" : g.reward}
                                            </p>
                                        </div>
                                        {locked ? (
                                            <Lock className="w-5 h-5 text-gray-300 shrink-0" />
                                        ) : (
                                            <div className={cn("text-[11px] font-black uppercase tracking-widest", g.color)}>Jogar</div>
                                        )}
                                    </button>
                                );
                            })}
                        </motion.div>
                    )}

                    {active === "swipe" && (
                        <motion.div key="swipe" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                            <GameHeader title="Necessidade vs Desejo" color="text-violet-600" bg="bg-violet-50" onBack={closeGame} />
                            <div className="bg-white/95 rounded-[2rem] p-6 ring-1 ring-black/[0.02] shadow-xl">
                                {swipeResult ? (
                                    <ResultCard
                                        passed={swipeResult.score > swipeResult.total * 0.7}
                                        headline={`${swipeResult.score} de ${swipeResult.total} acertos`}
                                        onReplay={() => setSwipeResult(null)}
                                    />
                                ) : (
                                    <SwipeCardGame onFinish={handleSwipeFinish} />
                                )}
                            </div>
                        </motion.div>
                    )}

                    {active === "drain" && (
                        <motion.div key="drain" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                            <GameHeader title="Caça ao Dreno" color="text-emerald-600" bg="bg-emerald-50" onBack={closeGame} />
                            <div className="bg-white/95 rounded-[2rem] p-5 ring-1 ring-black/[0.02] shadow-xl">
                                {drainResult ? (
                                    <ResultCard
                                        passed={drainResult.hits >= 3}
                                        headline={`${drainResult.hits} drenos / ${drainResult.misses} erros`}
                                        onReplay={() => setDrainResult(null)}
                                    />
                                ) : (
                                    <DrainHuntGame onFinish={handleDrainFinish} />
                                )}
                            </div>
                        </motion.div>
                    )}

                    {active === "quiz" && (
                        <motion.div key="quiz" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                            <GameHeader title="Quiz Relâmpago" color="text-blue-600" bg="bg-blue-50" onBack={closeGame} />
                            <div className="bg-white/95 rounded-[2rem] p-5 ring-1 ring-black/[0.02] shadow-xl">
                                {quizResult ? (
                                    <ResultCard
                                        passed={quizResult.correct >= 4}
                                        headline={`${quizResult.correct} de ${quizResult.total} acertos`}
                                        onReplay={closeGame}
                                        replayLabel="Voltar ao hub"
                                    />
                                ) : (
                                    <QuickQuizGame onFinish={handleQuizFinish} />
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

function GameHeader({ title, color, bg, onBack }: { title: string; color: string; bg: string; onBack: () => void }) {
    return (
        <div className="flex items-center justify-between">
            <button onClick={onBack} className="flex items-center gap-2 text-[12px] font-black text-gray-500 uppercase tracking-widest hover:text-gray-800">
                <ArrowLeft className="w-4 h-4" /> Hub
            </button>
            <span className={cn("text-[12px] font-black uppercase tracking-widest px-3 py-1 rounded-full ring-1 ring-black/[0.02]", bg, color)}>{title}</span>
        </div>
    );
}

function ResultCard({ passed, headline, onReplay, replayLabel = "Jogar novamente" }: { passed: boolean; headline: string; onReplay: () => void; replayLabel?: string }) {
    return (
        <div className="py-8 space-y-4 text-center">
            <div className={cn("w-20 h-20 rounded-[1.5rem] flex items-center justify-center mx-auto shadow-sm ring-1", passed ? "bg-emerald-50 ring-emerald-100/50" : "bg-amber-50 ring-amber-100/50")}>
                <CheckCircle2 className={cn("w-10 h-10 drop-shadow-sm", passed ? "text-emerald-500" : "text-amber-500")} />
            </div>
            <div className="space-y-1">
                <h3 className={cn("font-extrabold text-[20px] tracking-tight", passed ? "text-emerald-600" : "text-amber-600")}>
                    {passed ? "Muito bem!" : "Quase lá!"}
                </h3>
                <p className="text-[14px] text-gray-500 font-medium">{headline}</p>
            </div>
            <button
                onClick={onReplay}
                className="mt-6 px-8 py-3 bg-gray-50 border border-gray-200 hover:bg-gray-100 hover:border-gray-300 text-gray-600 font-black rounded-xl text-[12px] uppercase tracking-widest transition-all shadow-sm active:scale-95"
            >
                {replayLabel}
            </button>
        </div>
    );
}
