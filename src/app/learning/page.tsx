"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowLeft,
    ArrowRight,
    CheckCircle2,
    XCircle,
    BookOpen,
    Star,
    Coins,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useUserStoreHydrated } from "@/store/useStore";

// --- Types ---
interface Lesson {
    id: string;
    concept: string;
    explanation: string;
    question: string;
    options: string[];
    correctIndex: number;
    xpReward: number;
}

// --- Lessons Data ---
const LESSONS: Lesson[] = [
    {
        id: "l1",
        concept: "Juros Compostos",
        explanation:
            'Juros compostos são o "juros sobre juros". Quando você não paga uma dívida, o banco cobra juros sobre o valor que você já deve de juros. É exponencial — por isso dívidas de cartão crescem tão rápido.',
        question: "Se você deve R$ 1.000 com 10% de juro ao mês, quanto deve após 2 meses sem pagar?",
        options: ["R$ 1.100", "R$ 1.200", "R$ 1.210", "R$ 1.020"],
        correctIndex: 2,
        xpReward: 30,
    },
    {
        id: "l2",
        concept: "Fundo de Emergência",
        explanation:
            "Um fundo de emergência é uma reserva em dinheiro fácil de acessar (não em investimento), usada só em situações reais como perda de emprego ou doença. O objetivo é ter de 3 a 6 meses dos seus gastos fixos guardados.",
        question: "Qual é a finalidade CORRETA de um Fundo de Emergência?",
        options: [
            "Comprar algo caro que você quer mas não precisa",
            "Cobrir gastos imprevistos e urgentes",
            "Investir em ações de alto risco",
            "Pagar parcelas atrasadas de cartão",
        ],
        correctIndex: 1,
        xpReward: 25,
    },
    {
        id: "l3",
        concept: "Regra 50/30/20",
        explanation:
            "A regra 50/30/20 diz: 50% da sua renda vai para necessidades (aluguel, comida, contas), 30% vai para desejos (lazer, roupas) e 20% vai para poupança ou pagamento de dívidas.",
        question: "Com renda de R$ 3.000, quanto deveria ir para poupança segundo a regra 50/30/20?",
        options: ["R$ 150", "R$ 300", "R$ 600", "R$ 1.500"],
        correctIndex: 2,
        xpReward: 20,
    },
];

type LessonPhase = "reading" | "question" | "result";

export default function LearningPage() {
    const router = useRouter();
    const user = useUserStoreHydrated((state) => state);

    const [lessonIndex, setLessonIndex] = useState(0);
    const [phase, setPhase] = useState<LessonPhase>("reading");
    const [selected, setSelected] = useState<number | null>(null);
    const [completed, setCompleted] = useState<string[]>([]);

    const lesson = LESSONS[lessonIndex];
    const isCorrect = selected === lesson?.correctIndex;
    const totalXp = completed.length * 25; // simplified

    const handleAnswer = (idx: number) => {
        if (phase !== "question") return;
        setSelected(idx);
        setPhase("result");
        if (idx === lesson.correctIndex) {
            user?.addXp(lesson.xpReward);
            user?.addCoins(5);
        }
    };

    const handleNext = () => {
        if (!completed.includes(lesson.id)) {
            setCompleted((prev) => [...prev, lesson.id]);
        }
        if (lessonIndex < LESSONS.length - 1) {
            setLessonIndex((i) => i + 1);
            setPhase("reading");
            setSelected(null);
        } else {
            router.back();
        }
    };

    const progressPct = ((lessonIndex + (phase === "result" ? 1 : 0)) / LESSONS.length) * 100;

    if (!user) return <div className="min-h-screen bg-background" />;

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Top bar */}
            <header className="px-6 pt-12 pb-2 space-y-3">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.back()}
                        className="rounded-full shrink-0"
                        aria-label="Fechar"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                        <motion.div
                            className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
                            animate={{ width: `${progressPct}%` }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                        />
                    </div>
                    <div className="flex items-center gap-1 text-sm font-bold text-yellow-400">
                        <Coins className="w-4 h-4" />
                        {user.coins}
                    </div>
                </div>

                {/* Lesson counter */}
                <div className="flex justify-center gap-2">
                    {LESSONS.map((l, i) => (
                        <div
                            key={l.id}
                            className={cn(
                                "h-1.5 rounded-full transition-all duration-300",
                                i < lessonIndex ? "bg-secondary w-6" : i === lessonIndex ? "bg-primary w-8" : "bg-muted w-4"
                            )}
                        />
                    ))}
                </div>
            </header>

            {/* Content */}
            <main className="flex-1 px-6 py-4 flex flex-col">
                <AnimatePresence mode="wait">
                    {phase === "reading" && (
                        <motion.div
                            key={`reading-${lessonIndex}`}
                            initial={{ opacity: 0, x: 40 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -40 }}
                            transition={{ duration: 0.25, ease: "easeOut" }}
                            className="flex flex-col gap-6 flex-1"
                        >
                            {/* Concept header */}
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center">
                                    <BookOpen className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
                                        Conceito
                                    </p>
                                    <h2 className="text-xl font-bold font-heading">{lesson.concept}</h2>
                                </div>
                            </div>

                            {/* "Zella" explanation card — glassmorphism */}
                            <div className="bg-card rounded-3xl border border-border p-6 relative overflow-hidden flex-1">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
                                {/* Zella avatar placeholder */}
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-sm shadow-lg">
                                        Z
                                    </div>
                                    <p className="text-sm font-semibold">Zella explica</p>
                                </div>
                                <p className="text-base leading-relaxed text-foreground">
                                    {lesson.explanation}
                                </p>
                            </div>

                            <Button
                                className="w-full h-14 rounded-2xl font-bold text-base gap-2 bg-primary shadow-lg shadow-primary/20"
                                onClick={() => setPhase("question")}
                            >
                                Entendi, quero responder
                                <ArrowRight className="w-5 h-5" />
                            </Button>
                        </motion.div>
                    )}

                    {phase === "question" && (
                        <motion.div
                            key={`question-${lessonIndex}`}
                            initial={{ opacity: 0, x: 40 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -40 }}
                            transition={{ duration: 0.25, ease: "easeOut" }}
                            className="flex flex-col gap-6 flex-1"
                        >
                            <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-2">
                                    Pergunta
                                </p>
                                <h2 className="text-lg font-bold font-heading leading-snug">
                                    {lesson.question}
                                </h2>
                            </div>

                            <div className="space-y-3 flex-1">
                                {lesson.options.map((opt, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleAnswer(idx)}
                                        className="w-full text-left p-4 rounded-2xl border-2 border-border bg-card hover:border-primary hover:bg-primary/5 transition-all duration-200 cursor-pointer min-h-[56px] font-medium"
                                    >
                                        <span className="text-xs font-bold text-muted-foreground mr-2">
                                            {["A", "B", "C", "D"][idx]}.
                                        </span>
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {phase === "result" && (
                        <motion.div
                            key={`result-${lessonIndex}`}
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -24 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className="flex flex-col gap-6 flex-1"
                        >
                            {/* Result header */}
                            <motion.div
                                initial={{ scale: 0.8 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 300, damping: 18 }}
                                className={cn(
                                    "rounded-3xl border p-6 flex flex-col items-center text-center gap-3",
                                    isCorrect
                                        ? "bg-secondary/10 border-secondary/30"
                                        : "bg-destructive/10 border-destructive/30"
                                )}
                            >
                                {isCorrect ? (
                                    <>
                                        <CheckCircle2 className="w-14 h-14 text-secondary" />
                                        <h3 className="text-2xl font-bold font-heading text-secondary">
                                            Acertou! 🎉
                                        </h3>
                                        <div className="flex items-center gap-2 text-sm font-bold">
                                            <Star className="w-4 h-4 text-yellow-400" />
                                            +{lesson.xpReward} XP
                                            <Coins className="w-4 h-4 text-yellow-400" />
                                            +5 moedas
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <XCircle className="w-14 h-14 text-destructive" />
                                        <h3 className="text-2xl font-bold font-heading text-destructive">
                                            Quase lá!
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            A resposta certa era:{" "}
                                            <span className="font-bold text-foreground">
                                                {lesson.options[lesson.correctIndex]}
                                            </span>
                                        </p>
                                    </>
                                )}
                            </motion.div>

                            {/* All options with correct/wrong highlighted */}
                            <div className="space-y-2">
                                {lesson.options.map((opt, idx) => (
                                    <div
                                        key={idx}
                                        className={cn(
                                            "w-full text-left p-4 rounded-2xl border-2 font-medium text-sm",
                                            idx === lesson.correctIndex && "border-secondary bg-secondary/10 text-secondary",
                                            idx === selected && idx !== lesson.correctIndex && "border-destructive bg-destructive/10 text-destructive",
                                            idx !== lesson.correctIndex && idx !== selected && "border-border opacity-40"
                                        )}
                                    >
                                        <span className="text-xs font-bold mr-2 opacity-60">
                                            {["A", "B", "C", "D"][idx]}.
                                        </span>
                                        {opt}
                                    </div>
                                ))}
                            </div>

                            <Button
                                className="w-full h-14 rounded-2xl font-bold text-base gap-2 bg-primary shadow-lg shadow-primary/20"
                                onClick={handleNext}
                            >
                                {lessonIndex < LESSONS.length - 1 ? "Próxima Lição" : "Concluir Módulo"}
                                <ArrowRight className="w-5 h-5" />
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}
