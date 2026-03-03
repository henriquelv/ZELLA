"use client";

import { useState, useEffect } from "react";
import { Sparkles, Loader2, ArrowRight } from "lucide-react";
import { Transaction } from "@/store/useStore";
import { cn } from "@/lib/utils";

const EMPTY_MESSAGES: Record<number, string> = {
    1: "🔍 Você está no começo da jornada. Registre sua primeira transação e eu identifico onde seu dinheiro está escapando.",
    2: "📊 Analisando seu perfil. Adicione um gasto e vejo onde cortar primeiro.",
    3: "⚡ Você tem potencial pra virar o jogo. Me dê os dados e eu mostro o plano.",
    4: "💡 Estrategistas como você economizam mais quando sabem os números exatos.",
    5: "🏆 Nível avançado detectado. Vamos identificar os últimos gastos desnecessários.",
};

interface InsightsWidgetProps {
    transactions: Transaction[];
    currentStep?: number;
    metrics?: {
        ie: number;
        is: number;
        id: number;
        rs: number;
    };
}

export function InsightsWidget({ transactions, currentStep = 1, metrics }: InsightsWidgetProps) {
    const [insight, setInsight] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (transactions.length === 0) {
            setInsight(EMPTY_MESSAGES[currentStep] || EMPTY_MESSAGES[1]);
            return;
        }

        const cacheKey = `zi_${transactions.length}_${transactions.reduce((acc, t) => acc + t.amount, 0).toFixed(0)}`;
        const cached = sessionStorage.getItem(cacheKey);
        if (cached) {
            setInsight(cached);
            return;
        }

        const fetchInsight = async () => {
            setLoading(true);
            try {
                const recent = transactions.slice(0, 20).map(t => ({
                    c: t.category,
                    a: t.amount,
                    t: t.type
                }));

                const res = await fetch("/api/insights", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        transactions: recent,
                        metrics: metrics
                    })
                });

                const data = await res.json();
                if (data.insight) {
                    setInsight(data.insight);
                    sessionStorage.setItem(cacheKey, data.insight);
                } else {
                    setInsight("Mantenha o controle de seus gastos diários para liberar dicas.");
                }
            } catch (error) {
                setInsight("Análise pausada. Volte mais tarde para novas dicas.");
            } finally {
                setLoading(false);
            }
        };

        const timer = setTimeout(() => {
            fetchInsight();
        }, 800);

        return () => clearTimeout(timer);
    }, [transactions.length]);

    return (
        <div className="bg-white/70 backdrop-blur-sm border border-black/[0.05] p-5 rounded-3xl shadow-sm relative group">
            {/* Ambient */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-400/[0.05] rounded-full blur-[40px] -z-10" />

            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-[#2563eb] to-[#16a34a] shadow-sm">
                        <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-[14px] text-gray-900 leading-none">Zella Intelligence</h3>
                        <p className="text-[11px] text-gray-400 mt-0.5">Pulsão da Matriz</p>
                    </div>
                </div>
                {loading && (
                    <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                )}
            </div>

            <div className="relative min-h-[3rem]">
                {loading ? (
                    <div className="flex flex-col gap-2">
                        <div className="h-4 w-full bg-gray-100 rounded-full animate-pulse" />
                        <div className="h-4 w-3/4 bg-gray-100 rounded-full animate-pulse" />
                    </div>
                ) : (
                    <p className="text-[14px] text-gray-600 leading-relaxed">
                        {insight}
                    </p>
                )}
            </div>

            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                <button className="flex items-center gap-1.5 text-[12px] font-semibold text-[#2563eb] hover:text-blue-700 transition-colors group/btn">
                    <span>Sincronizar Estratégia</span>
                    <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" />
                </button>
            </div>
        </div>
    );
}
