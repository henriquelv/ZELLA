"use client";

import { useState, useRef } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle } from "lucide-react";

// ─── Card data ─────────────────────────────────────────────────────────────
const CARDS = [
    { id: 1, label: "Remédio", category: "Necessidade", example: "Saúde não tem preço!" },
    { id: 2, label: "Netflix", category: "Desejo", example: "Entretenimento é agradável, mas opcional." },
    { id: 3, label: "Aluguel", category: "Necessidade", example: "Moradia é fundamental." },
    { id: 4, label: "Novo iPhone", category: "Desejo", example: "Querer um aparelho premium é desejo, não necessidade." },
    { id: 5, label: "Conta de Água", category: "Necessidade", example: "Serviço essencial de higiene e vida." },
    { id: 6, label: "Maquiagem nova", category: "Desejo", example: "Belo, mas não é essencial para sobreviver." },
    { id: 7, label: "Comida básica", category: "Necessidade", example: "Alimentação é necessidade primária." },
    { id: 8, label: "Viagem de lazer", category: "Desejo", example: "Experiências enriquecedoras, mas opcionais." },
    { id: 9, label: "Plano de saúde", category: "Necessidade", example: "Proteção médica é essencial." },
    { id: 10, label: "Console de vídeo game", category: "Desejo", example: "Diversão, mas definitivamente opcional." },
];

interface SwipeCardGameProps {
    onFinish: (score: number, total: number) => void;
}

function SwipeCard({ card, onSwipe, isTop }: {
    card: typeof CARDS[0];
    onSwipe: (dir: "left" | "right") => void;
    isTop: boolean;
}) {
    const x = useMotionValue(0);
    const rotate = useTransform(x, [-200, 200], [-25, 25]);
    const leftOpacity = useTransform(x, [-120, -20, 0], [1, 0.5, 0]);
    const rightOpacity = useTransform(x, [0, 20, 120], [0, 0.5, 1]);
    const cardOpacity = useTransform(x, [-300, -150, 0, 150, 300], [0, 1, 1, 1, 0]);

    const handleDragEnd = (_: unknown, info: { offset: { x: number } }) => {
        if (info.offset.x < -80) onSwipe("left");
        else if (info.offset.x > 80) onSwipe("right");
    };

    if (!isTop) {
        return (
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full max-w-[320px] h-48 bg-card border border-border/50 rounded-3xl shadow-sm scale-95 opacity-60" />
            </div>
        );
    }

    return (
        <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
                style={{ x, rotate, opacity: cardOpacity }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.8}
                onDragEnd={handleDragEnd}
                whileTap={{ cursor: "grabbing" }}
                className="w-full max-w-[320px] cursor-grab touch-none select-none"
            >
                {/* Left label: NECESSIDADE */}
                <motion.div
                    style={{ opacity: leftOpacity }}
                    className="absolute top-6 left-4 z-10 rotate-[-15deg] border-4 border-emerald-500 text-emerald-500 rounded-lg px-3 py-1 font-black text-base uppercase tracking-wider"
                >
                    ✅ Necessidade
                </motion.div>

                {/* Right label: DESEJO */}
                <motion.div
                    style={{ opacity: rightOpacity }}
                    className="absolute top-6 right-4 z-10 rotate-[15deg] border-4 border-violet-500 text-violet-500 rounded-lg px-3 py-1 font-black text-base uppercase tracking-wider"
                >
                    💜 Desejo
                </motion.div>

                {/* Card body */}
                <div className="bg-card border-2 border-border/60 rounded-3xl shadow-2xl p-8 text-center space-y-4 min-h-[220px] flex flex-col items-center justify-center">
                    <p className="text-4xl">💳</p>
                    <h3 className="text-2xl font-bold font-heading">{card.label}</h3>
                    <p className="text-xs text-muted-foreground">Arraste ← Necessidade &nbsp;|&nbsp; Desejo →</p>
                </div>
            </motion.div>
        </div>
    );
}

export function SwipeCardGame({ onFinish }: SwipeCardGameProps) {
    const [index, setIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [lastResult, setLastResult] = useState<{ label: string; correct: boolean; exp: string } | null>(null);

    const current = CARDS[index];

    const handleSwipe = (dir: "left" | "right") => {
        const correctDir = current.category === "Necessidade" ? "left" : "right";
        const correct = dir === correctDir;
        if (correct) setScore(s => s + 1);

        setLastResult({ label: current.label, correct, exp: current.example });

        setTimeout(() => {
            setLastResult(null);
            if (index === CARDS.length - 1) {
                onFinish(score + (correct ? 1 : 0), CARDS.length);
            } else {
                setIndex(i => i + 1);
            }
        }, 900);
    };

    return (
        <div className="space-y-6">
            {/* Progress */}
            <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1 font-bold uppercase tracking-wider">
                    {index + 1} / {CARDS.length}
                </p>
                <div className="w-full bg-muted/50 h-2 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-primary rounded-full"
                        animate={{ width: `${((index + 1) / CARDS.length) * 100}%` }}
                    />
                </div>
            </div>

            {/* Legend */}
            <div className="flex justify-between text-sm font-bold">
                <span className="text-emerald-500 flex items-center gap-1">← Necessidade</span>
                <span className="text-violet-500 flex items-center gap-1">Desejo →</span>
            </div>

            {/* Stack area */}
            <div className="relative h-64">
                {/* Background card (next) */}
                {index < CARDS.length - 1 && (
                    <SwipeCard card={CARDS[index + 1]} onSwipe={() => { }} isTop={false} />
                )}
                {/* Top card */}
                <SwipeCard card={current} onSwipe={handleSwipe} isTop={true} />

                {/* Feedback overlay */}
                {lastResult && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className={cn(
                            "absolute inset-0 rounded-3xl flex flex-col items-center justify-center gap-2 bg-card border-2",
                            lastResult.correct ? "border-emerald-500 bg-emerald-500/10" : "border-destructive bg-destructive/10"
                        )}
                    >
                        {lastResult.correct
                            ? <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                            : <XCircle className="w-12 h-12 text-destructive" />}
                        <p className="text-sm font-bold text-center px-4">
                            {lastResult.correct ? "✅ Correto!" : `Resposta: ${CARDS[index]?.category ?? "..."}`}
                        </p>
                        <p className="text-xs text-muted-foreground text-center px-6">{lastResult.exp}</p>
                    </motion.div>
                )}
            </div>

            {/* Tap buttons for non-touch */}
            <div className="grid grid-cols-2 gap-3">
                <button
                    onClick={() => handleSwipe("left")}
                    className="py-3 rounded-2xl font-bold text-sm border-2 border-emerald-500/50 text-emerald-600 bg-emerald-500/10 hover:bg-emerald-500/20 transition-colors"
                >
                    ← Necessidade
                </button>
                <button
                    onClick={() => handleSwipe("right")}
                    className="py-3 rounded-2xl font-bold text-sm border-2 border-violet-500/50 text-violet-600 bg-violet-500/10 hover:bg-violet-500/20 transition-colors"
                >
                    Desejo →
                </button>
            </div>
        </div>
    );
}
