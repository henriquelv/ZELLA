"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, CheckCircle2, BrainCircuit } from "lucide-react";
import { useUserStore } from "@/store/useStore";
import { cn } from "@/lib/utils";

interface QuizData {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
}

export function DailyQuiz() {
    const { dailyQuizCompletedAt, completeDailyQuiz, xp } = useUserStore();
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

        // Cache quiz by date + level so API is never called twice in the same day
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
                    // Fallback in case of AI error
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
            <Card className="border-border/50 shadow-lg bg-card/60 backdrop-blur-md relative overflow-hidden h-48 animate-pulse">
                <CardContent className="p-5 flex flex-col justify-center h-full">
                    <div className="w-full h-4 bg-muted mb-4 rounded-full"></div>
                    <div className="space-y-2">
                        <div className="w-full h-8 bg-muted rounded-xl"></div>
                        <div className="w-full h-8 bg-muted rounded-xl"></div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (isCompleted || !selectedQ) {
        return (
            <Card className="border-border/50 shadow-sm bg-card/40 backdrop-blur-sm overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent z-0" />
                <CardContent className="p-5 flex flex-col items-center text-center relative z-10">
                    <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mb-3 text-emerald-500">
                        <CheckCircle2 strokeWidth={2.5} className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold">Quiz Diário Concluído!</h3>
                    <p className="text-xs text-muted-foreground mt-1">Volte amanhã para mais desafios e XP.</p>
                </CardContent>
            </Card>
        );
    }

    const handleSelect = (idx: number) => {
        if (answered || !selectedQ) return;
        setSelectedOpt(idx);
        setAnswered(true);

        // Se acertou, ganha +50 XP
        if (idx === selectedQ.correctIndex) {
            setTimeout(() => {
                completeDailyQuiz(50);
            }, 2500);
        } else {
            // Se errou, ganha consolação +10 XP
            setTimeout(() => {
                completeDailyQuiz(10);
            }, 3500);
        }
    };

    return (
        <Card className="border-border/50 shadow-lg bg-card/60 backdrop-blur-md relative overflow-hidden group">
            {/* Decal */}
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all pointer-events-none" />

            <CardContent className="p-5 relative z-10">
                <div className="flex items-center gap-2 mb-3">
                    <div className="p-1.5 rounded-md bg-primary/10 text-primary">
                        <BrainCircuit className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-bold uppercase tracking-wider">Quiz do Dia <span className="text-[10px] text-muted-foreground normal-case ml-1">(IA Gerado)</span></h3>
                    <span className="ml-auto text-[10px] bg-yellow-500/10 text-yellow-600 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                        <Trophy className="w-3 h-3" /> +50 XP
                    </span>
                </div>

                <p className="font-semibold text-[15px] mb-4 leading-snug">{selectedQ.question}</p>

                <div className="space-y-2">
                    {selectedQ.options.map((opt, idx) => {
                        const isCorrect = idx === selectedQ.correctIndex;
                        const isSelected = selectedOpt === idx;

                        let stateStyles = "bg-muted/50 hover:bg-muted border-transparent text-foreground/80 hover:text-foreground";
                        if (answered) {
                            if (isCorrect) stateStyles = "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 font-bold";
                            else if (isSelected) stateStyles = "bg-destructive/10 border-destructive/30 text-destructive font-bold";
                            else stateStyles = "bg-muted/30 opacity-50 border-transparent";
                        } // If not answered but hover
                        else {
                            stateStyles = "bg-muted/50 hover:bg-muted border-transparent text-foreground/80 hover:text-foreground hover:scale-[1.01] active:scale-95";
                        }

                        return (
                            <button
                                key={idx}
                                disabled={answered}
                                onClick={() => handleSelect(idx)}
                                className={cn(
                                    "w-full text-left px-3 py-2.5 rounded-xl border transition-all text-sm outline-none ring-primary/20 focus-visible:ring-2",
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
                                "p-3 rounded-xl text-xs",
                                selectedOpt === selectedQ.correctIndex ? "bg-emerald-500/10 text-emerald-700" : "bg-muted text-muted-foreground"
                            )}>
                                <span className="font-bold block mb-1 flex items-center gap-1">
                                    {selectedOpt === selectedQ.correctIndex ? "🎉 Resposta Exata!" : "❌ Educação Financeira na prática..."}
                                </span>
                                {selectedQ.explanation}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </CardContent>
        </Card>
    );
}
