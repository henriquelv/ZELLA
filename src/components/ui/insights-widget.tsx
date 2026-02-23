"use client";

import { useState, useEffect } from "react";
import { Sparkles, Loader2, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Transaction } from "@/store/useStore";
import { cn } from "@/lib/utils";

// Messages when user has no transactions yet — personalized by their diagnosed step
const EMPTY_MESSAGES: Record<number, string> = {
    1: "🔍 Você está no começo da jornada. Registre sua primeira transação e eu identifico onde seu dinheiro está escapando.",
    2: "📊 Analisando seu perfil de Sobrevivente Financeiro. Adicione um gasto e vejo onde cortar primeiro.",
    3: "⚡ Você tem potencial pra virar o jogo. Me dê os dados e eu mostro o plano.",
    4: "💡 Estrategistas como você economizam mais quando sabem os números exatos. Adicione uma transação!",
    5: "🏆 Nível avançado detectado. Vamos identificar os últimos gastos desnecessários.",
};

interface InsightsWidgetProps {
    transactions: Transaction[];
    currentStep?: number;
}

export function InsightsWidget({ transactions, currentStep = 1 }: InsightsWidgetProps) {
    const [insight, setInsight] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (transactions.length === 0) {
            setInsight(EMPTY_MESSAGES[currentStep] || EMPTY_MESSAGES[1]);
            return;
        }

        // Cache key based on transaction count + total amount to avoid re-fetching on same data
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
                    body: JSON.stringify({ transactions: recent })
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
    }, [transactions.length]);  // Only re-fetch when transaction count changes

    return (
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-blue-500/5 shadow-sm">
            <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Sparkles className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <h3 className="font-black text-sm text-primary tracking-wide">Zella detectou</h3>
                </div>
                {loading ? (
                    <div className="flex items-center gap-2 py-1 text-primary/70 text-xs font-medium">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Analisando seus padrões...
                    </div>
                ) : (
                    <p className="text-sm text-foreground/80 leading-relaxed font-medium">
                        {insight}
                    </p>
                )}
                <div className="flex items-center gap-1 mt-3 text-xs font-bold text-primary/60 hover:text-primary transition-colors cursor-pointer">
                    <span>Perguntar à Zella AI</span>
                    <ArrowRight className="w-3 h-3" />
                </div>
            </CardContent>
        </Card>
    );
}
