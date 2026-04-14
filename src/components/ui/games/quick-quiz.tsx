"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Timer, Brain, CheckCircle2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { pickRandomQuestions, QuizQuestion } from "@/data/quiz-questions";

interface Props {
    onFinish: (correct: number, total: number) => void;
}

const QUESTIONS_PER_SESSION = 5;
const SECONDS_PER_QUESTION = 10;

export function QuickQuizGame({ onFinish }: Props) {
    const questions = useMemo<QuizQuestion[]>(() => pickRandomQuestions(QUESTIONS_PER_SESSION), []);
    const [index, setIndex] = useState(0);
    const [correct, setCorrect] = useState(0);
    const [picked, setPicked] = useState<number | null>(null);
    const [timeLeft, setTimeLeft] = useState(SECONDS_PER_QUESTION);
    const [done, setDone] = useState(false);

    const q = questions[index];

    const next = useCallback(() => {
        if (index + 1 >= questions.length) {
            setDone(true);
            onFinish(correct + (picked === q?.correctIndex ? 1 : 0), questions.length);
            return;
        }
        setIndex(i => i + 1);
        setPicked(null);
        setTimeLeft(SECONDS_PER_QUESTION);
    }, [index, questions, correct, picked, q, onFinish]);

    useEffect(() => {
        if (done || picked !== null) return;
        if (timeLeft <= 0) { next(); return; }
        const t = setTimeout(() => setTimeLeft(s => s - 1), 1000);
        return () => clearTimeout(t);
    }, [timeLeft, picked, done, next]);

    const handlePick = (i: number) => {
        if (picked !== null || done) return;
        setPicked(i);
        if (i === q.correctIndex) setCorrect(c => c + 1);
        setTimeout(next, 900);
    };

    if (done) {
        const passed = correct >= 4;
        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn("rounded-[1rem] p-6 text-center", passed ? "bg-emerald-50 ring-1 ring-emerald-200" : "bg-amber-50 ring-1 ring-amber-200")}
            >
                <Brain className={cn("w-10 h-10 mx-auto mb-3 drop-shadow-sm", passed ? "text-emerald-500" : "text-amber-500")} />
                <p className={cn("font-black text-[18px]", passed ? "text-emerald-700" : "text-amber-700")}>
                    {passed ? "Mente afiada!" : "Boa tentativa!"}
                </p>
                <p className="text-[13px] text-gray-600 font-bold mt-1">
                    {correct} de {questions.length} acertos
                </p>
            </motion.div>
        );
    }

    if (!q) return null;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between bg-gray-50 rounded-[1rem] px-4 py-3">
                <div className="flex items-center gap-2 text-[13px] font-black text-gray-700">
                    <Brain className="w-4 h-4 text-violet-500" /> {index + 1}/{questions.length}
                </div>
                <div className="flex items-center gap-2 text-[13px] font-black text-gray-700">
                    <Timer className={cn("w-4 h-4", timeLeft <= 3 ? "text-red-500" : "text-orange-500")} />
                    <span className={cn(timeLeft <= 3 && "text-red-500")}>{timeLeft}s</span>
                </div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-3"
                >
                    <div className="bg-white rounded-[1.25rem] p-5 ring-1 ring-black/[0.04] shadow-sm">
                        <p className="text-[15px] font-extrabold text-gray-800 leading-snug">{q.question}</p>
                    </div>

                    <div className="space-y-2">
                        {q.options.map((opt, i) => {
                            const isPicked = picked === i;
                            const isCorrectAnswer = i === q.correctIndex;
                            const showResult = picked !== null;
                            return (
                                <button
                                    key={i}
                                    onClick={() => handlePick(i)}
                                    disabled={picked !== null}
                                    className={cn(
                                        "w-full text-left px-4 py-3 rounded-[1rem] font-bold text-[13px] transition-all ring-1 flex items-center justify-between",
                                        showResult && isCorrectAnswer
                                            ? "bg-emerald-50 ring-emerald-300 text-emerald-700"
                                            : showResult && isPicked
                                                ? "bg-red-50 ring-red-300 text-red-700"
                                                : "bg-white ring-black/[0.04] text-gray-700 hover:bg-gray-50 active:scale-[0.98]"
                                    )}
                                >
                                    <span>{opt}</span>
                                    {showResult && isCorrectAnswer && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                                    {showResult && isPicked && !isCorrectAnswer && <X className="w-4 h-4 text-red-500" />}
                                </button>
                            );
                        })}
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
