"use client";

import { useState, useEffect } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Transaction } from "@/store/useStore";

interface InsightsWidgetProps {
    transactions: Transaction[];
}

export function InsightsWidget({ transactions }: InsightsWidgetProps) {
    const [insight, setInsight] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (transactions.length === 0) {
            setInsight("Adicione algumas transações para que a inteligência artificial possa gerar dicas personalizadas.");
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
        <Card className="border-primary/20 bg-primary/5 shadow-sm">
            <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <h3 className="font-bold text-sm text-primary">IA Insights</h3>
                </div>
                {loading ? (
                    <div className="flex items-center gap-2 py-1 text-primary/70 text-xs font-medium">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Analisando padrão de gastos...
                    </div>
                ) : (
                    <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                        {insight}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
