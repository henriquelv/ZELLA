"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, CheckCircle2, BrainCircuit } from "lucide-react";
import { useUserStore } from "@/store/useStore";
import { cn } from "@/lib/utils";
import { useGameSound } from "@/hooks/use-game-sound";

interface QuizData {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
}

export function DailyQuiz() {
    const { dailyQuizCompletedAt, completeDailyQuiz, xp } = useUserStore();
    const { playSound } = useGameSound();
    const [selectedQ, setSelectedQ] = useState<QuizData | null>(null);
    const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
    const [answered, setAnswered] = useState(false);
    const [loading, setLoading] = useState(true);

    const today = new Date().toISOString().split('T')[0];
    const isCompleted = dailyQuizCompletedAt === today;
    const currentLevel = Math.floor(xp / 100) + 1;

    useEffect(() => {
        if (isCompleted) {
            setLoading(false);
            return;
        }

        const cacheKey = `zq_${today}_lvl${currentLevel}`;
        const cachedRaw = localStorage.getItem(cacheKey);
        if (cachedRaw) {
            try {
                setSelectedQ(JSON.parse(cachedRaw));
                setLoading(false);
                return;
            } catch { }
        }

        async function fetchQuiz() {
            try {
                const res = await fetch(`/api/quiz?level=${currentLevel}`);
                const data = await res.json();
                if (data.question) {
                    setSelectedQ(data);
                    localStorage.setItem(cacheKey, JSON.stringify(data));
                } else {
                    const fallback = {
                        question: "Qual o primeiro passo para organizar a vida financeira?",
                        options: ["Gastar tudo", "Fazer um orçamento", "Pedir empréstimo", "Ignorar as contas"],
                        correctIndex: 1,
                        explanation: "O orçamento é a base para entender para onde seu dinheiro vai."
                    };
                    setSelectedQ(fallback);
                    localStorage.setItem(cacheKey, JSON.stringify(fallback));
                }
            } catch (error) {
                console.error("Failed to fetch quiz:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchQuiz();
    }, [isCompleted, currentLevel]);

    if (loading) {
        return (
            <div className="bg-white/70 backdrop-blur-sm border border-black/[0.05] rounded-3xl p-5 shadow-sm h-48 animate-pulse">
                <div className="w-full h-4 bg-gray-100 mb-4 rounded-full" />
                <div className="space-y-2">
                    <div className="w-full h-10 bg-gray-100 rounded-xl" />
                    <div className="w-full h-10 bg-gray-100 rounded-xl" />
                </div>
            </div>
        );
    }

    if (isCompleted || !selectedQ) {
        return (
            <div className="bg-white/70 backdrop-blur-sm border border-black/[0.05] rounded-3xl p-5 shadow-sm overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-transparent z-0" />
                <div className="flex flex-col items-center text-center relative z-10 py-2">
                    <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mb-3 text-emerald-500">
                        <CheckCircle2 strokeWidth={2.5} className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-[15px] text-gray-900">Quiz Diário Concluído!</h3>
                    <p className="text-[12px] text-gray-400 mt-1">Volte amanhã para mais desafios e XP.</p>
                </div>
            </div>
        );
    }

    const handleSelect = (idx: number) => {
        if (answered || !selectedQ) return;
        setSelectedOpt(idx);
        setAnswered(true);

        if (idx === selectedQ.correctIndex) {
            playSound('success');
            setTimeout(() => {
                completeDailyQuiz(50);
            }, 2500);
        } else {
            playSound('error');
            setTimeout(() => {
                completeDailyQuiz(10);
            }, 3500);
        }
    };

    return (
        <div className="bg-white/70 backdrop-blur-sm border border-black/[0.05] rounded-3xl p-5 shadow-sm relative overflow-hidden group">
            {/* Decal */}
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-400/[0.06] rounded-full blur-[30px] pointer-events-none" />

            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                        <BrainCircuit className="w-5 h-5 text-[#2563eb]" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-[13px] font-bold text-gray-900">Quiz do Dia</h3>
                        <span className="text-[10px] text-gray-400">IA Gerado</span>
                    </div>
                    <span className="text-[11px] bg-yellow-50 text-yellow-600 px-3 py-1.5 rounded-full font-bold flex items-center gap-1 border border-yellow-100">
                        <Trophy className="w-3 h-3" /> +50 XP
                    </span>
                </div>

                <p className="font-semibold text-[15px] text-gray-900 mb-4 leading-snug">{selectedQ.question}</p>

                <div className="space-y-2">
                    {selectedQ.options.map((opt, idx) => {
                        const isCorrect = idx === selectedQ.correctIndex;
                        const isSelected = selectedOpt === idx;

                        let stateStyles = "bg-gray-50 hover:bg-gray-100 border-gray-100 text-gray-700";
                        if (answered) {
                            if (isCorrect) stateStyles = "bg-emerald-50 border-emerald-200 text-emerald-700 font-bold";
                            else if (isSelected) stateStyles = "bg-red-50 border-red-200 text-red-600 font-bold";
                            else stateStyles = "bg-gray-50 opacity-40 border-gray-100";
                        } else {
                            stateStyles = "bg-gray-50 hover:bg-gray-100 border-gray-100 text-gray-700 active:scale-[0.98]";
                        }

                        return (
                            <button
                                key={idx}
                                disabled={answered}
                                onClick={() => handleSelect(idx)}
                                className={cn(
                                    "w-full text-left px-4 py-3 rounded-2xl border transition-all text-[14px] outline-none",
                                    stateStyles
                                )}
                            >
                                {opt}
                            </button>
                        );
                    })}
                </div>

                <AnimatePresence>
                    {answered && (
                        <motion.div
                            initial={{ opacity: 0, height: 0, marginTop: 0 }}
                            animate={{ opacity: 1, height: "auto", marginTop: 16 }}
                            className="overflow-hidden"
                        >
                            <div className={cn(
                                "p-4 rounded-2xl text-[13px] leading-relaxed",
                                selectedOpt === selectedQ.correctIndex ? "bg-emerald-50 text-emerald-700" : "bg-gray-50 text-gray-600"
                            )}>
                                <span className="font-bold block mb-1">
                                    {selectedOpt === selectedQ.correctIndex ? "🎉 Resposta Exata!" : "❌ Educação Financeira na prática..."}
                                </span>
                                {selectedQ.explanation}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
