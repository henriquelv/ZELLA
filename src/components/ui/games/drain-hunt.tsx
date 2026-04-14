"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Timer, Target, CheckCircle2, X } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
    { emoji: "🍕", label: "Delivery", drain: false },
    { emoji: "🏠", label: "Aluguel", drain: false },
    { emoji: "📱", label: "Assinatura", drain: true },
    { emoji: "🚗", label: "Transporte", drain: false },
    { emoji: "💅", label: "Impulso", drain: true },
    { emoji: "🛒", label: "Mercado", drain: false },
    { emoji: "🎲", label: "Aposta", drain: true },
    { emoji: "🎬", label: "Cinema", drain: false },
    { emoji: "💊", label: "Saúde", drain: false },
    { emoji: "💸", label: "Juros", drain: true },
    { emoji: "📚", label: "Educação", drain: false },
    { emoji: "🏋️", label: "Academia", drain: false },
    { emoji: "👟", label: "Tênis novo", drain: false },
    { emoji: "⚡", label: "Energia", drain: false },
    { emoji: "🎰", label: "Bingo", drain: true },
    { emoji: "🧾", label: "Conta", drain: false },
];

interface Props {
    onFinish: (hits: number, misses: number) => void;
}

export function DrainHuntGame({ onFinish }: Props) {
    const [tapped, setTapped] = useState<Record<number, "hit" | "miss">>({});
    const [timeLeft, setTimeLeft] = useState(30);
    const [finished, setFinished] = useState(false);

    const hits = Object.values(tapped).filter(v => v === "hit").length;
    const misses = Object.values(tapped).filter(v => v === "miss").length;

    const finish = useCallback(() => {
        if (finished) return;
        setFinished(true);
        onFinish(hits, misses);
    }, [finished, hits, misses, onFinish]);

    useEffect(() => {
        if (finished) return;
        if (timeLeft <= 0) { finish(); return; }
        const t = setTimeout(() => setTimeLeft(s => s - 1), 1000);
        return () => clearTimeout(t);
    }, [timeLeft, finished, finish]);

    useEffect(() => {
        if (hits >= 4 && !finished) finish();
    }, [hits, finished, finish]);

    const handleTap = (idx: number) => {
        if (tapped[idx] !== undefined || finished) return;
        const item = ITEMS[idx];
        setTapped(prev => ({ ...prev, [idx]: item.drain ? "hit" : "miss" }));
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between bg-gray-50 rounded-[1rem] px-4 py-3">
                <div className="flex items-center gap-2 text-[13px] font-black text-gray-700">
                    <Timer className="w-4 h-4 text-orange-500" /> {timeLeft}s
                </div>
                <div className="flex items-center gap-2 text-[13px] font-black text-emerald-600">
                    <Target className="w-4 h-4" /> {hits}/4 drenos
                </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
                {ITEMS.map((item, idx) => {
                    const state = tapped[idx];
                    return (
                        <button
                            key={idx}
                            onClick={() => handleTap(idx)}
                            disabled={state !== undefined || finished}
                            className={cn(
                                "aspect-square rounded-[1rem] flex flex-col items-center justify-center gap-0.5 text-[22px] transition-all ring-1 active:scale-95",
                                state === "hit"
                                    ? "bg-emerald-100 ring-emerald-300"
                                    : state === "miss"
                                        ? "bg-red-100 ring-red-200"
                                        : "bg-white ring-black/[0.04] hover:bg-gray-50"
                            )}
                        >
                            <span>{item.emoji}</span>
                            {state === "hit" && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                            {state === "miss" && <X className="w-3.5 h-3.5 text-red-500" />}
                            <span className="text-[8px] font-bold text-gray-500 leading-none px-1 text-center truncate max-w-full">
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </div>

            <AnimatePresence>
                {finished && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                            "rounded-[1rem] p-4 text-center",
                            hits >= 3 ? "bg-emerald-50 ring-1 ring-emerald-200" : "bg-amber-50 ring-1 ring-amber-200"
                        )}
                    >
                        <p className={cn("font-black text-[15px]", hits >= 3 ? "text-emerald-700" : "text-amber-700")}>
                            {hits >= 3 ? "Caçada boa!" : "Tenta de novo!"}
                        </p>
                        <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">
                            {hits} acertos / {misses} erros
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
