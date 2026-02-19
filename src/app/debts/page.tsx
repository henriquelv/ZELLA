"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowLeft,
    AlertTriangle,
    TrendingDown,
    Trophy,
    ChevronRight,
    Plus,
    Flame,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

// --- Types ---
interface Debt {
    id: string;
    name: string;
    totalAmount: number;
    paidAmount: number;
    interestRate: number; // monthly %
    minimumPayment: number;
    category: "cartao" | "emprestimo" | "financiamento" | "cheque";
}

// --- Mock Data ---
const INITIAL_DEBTS: Debt[] = [
    {
        id: "1",
        name: "Cartão Nubank",
        totalAmount: 3200,
        paidAmount: 800,
        interestRate: 12.8,
        minimumPayment: 220,
        category: "cartao",
    },
    {
        id: "2",
        name: "Crédito Pessoal Caixa",
        totalAmount: 8500,
        paidAmount: 2100,
        interestRate: 3.4,
        minimumPayment: 380,
        category: "emprestimo",
    },
    {
        id: "3",
        name: "Parcelamento Celular",
        totalAmount: 1200,
        paidAmount: 900,
        interestRate: 0,
        minimumPayment: 100,
        category: "financiamento",
    },
];

type PlanType = "snowball" | "avalanche";

const categoryLabel: Record<Debt["category"], string> = {
    cartao: "Cartão",
    emprestimo: "Empréstimo",
    financiamento: "Financiamento",
    cheque: "Cheque Especial",
};

export default function DebtsPage() {
    const router = useRouter();
    const [debts] = useState<Debt[]>(INITIAL_DEBTS);
    const [activePlan, setActivePlan] = useState<PlanType>("avalanche");
    const [paidDebtId, setPaidDebtId] = useState<string | null>(null);

    const totalOwed = debts.reduce((acc, d) => acc + (d.totalAmount - d.paidAmount), 0);
    const totalInterestPerMonth = debts.reduce(
        (acc, d) => acc + ((d.totalAmount - d.paidAmount) * d.interestRate) / 100,
        0
    );

    // Sorted order for each plan
    const sortedDebts =
        activePlan === "snowball"
            ? [...debts].sort((a, b) => (a.totalAmount - a.paidAmount) - (b.totalAmount - b.paidAmount))
            : [...debts].sort((a, b) => b.interestRate - a.interestRate);

    const handleMarkPaid = (id: string) => {
        setPaidDebtId(id);
    };

    return (
        <div className="min-h-screen bg-background pb-24">
            {/* Dynamic background glow */}
            <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-destructive/10 to-transparent -z-10 pointer-events-none" />

            {/* Header */}
            <header className="px-6 pt-12 pb-4 flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.back()}
                    className="rounded-full shrink-0"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold font-heading">Suas Dívidas</h1>
                    <p className="text-sm text-muted-foreground">A verdade dói, mas liberta.</p>
                </div>
            </header>

            <main className="px-6 space-y-6">
                {/* ─── Summary Card ─── */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl bg-destructive/10 border border-destructive/20 p-5 space-y-4"
                >
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">
                                Total em aberto
                            </p>
                            <p className="text-4xl font-bold text-destructive">
                                {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(totalOwed)}
                            </p>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-destructive/20 flex items-center justify-center">
                            <AlertTriangle className="w-6 h-6 text-destructive" />
                        </div>
                    </div>

                    <div className="flex items-center gap-2 bg-destructive/20 rounded-xl px-4 py-3">
                        <Flame className="w-5 h-5 text-orange-400 shrink-0" />
                        <p className="text-sm">
                            <span className="font-bold text-orange-400">
                                {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(totalInterestPerMonth)}
                            </span>
                            <span className="text-muted-foreground"> sendo queimados em juros todo mês.</span>
                        </p>
                    </div>
                </motion.div>

                {/* ─── Plan Selector ─── */}
                <section>
                    <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                        Plano de Ataque
                    </h2>
                    <div className="grid grid-cols-2 gap-3">
                        {(["snowball", "avalanche"] as PlanType[]).map((plan) => (
                            <button
                                key={plan}
                                onClick={() => setActivePlan(plan)}
                                className={cn(
                                    "p-4 rounded-2xl border-2 text-left transition-all",
                                    activePlan === plan
                                        ? "border-primary bg-primary/10"
                                        : "border-border bg-card opacity-60"
                                )}
                            >
                                <div className={cn("text-lg mb-1", activePlan === plan ? "grayscale-0" : "grayscale")}>
                                    {plan === "snowball" ? "⛄" : "🌊"}
                                </div>
                                <p className="font-bold text-sm capitalize">
                                    {plan === "snowball" ? "Bola de Neve" : "Avalanche"}
                                </p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    {plan === "snowball"
                                        ? "Menor dívida primeiro — motivação rápida."
                                        : "Maior juro primeiro — paga menos no total."}
                                </p>
                            </button>
                        ))}
                    </div>
                </section>

                {/* ─── Debt List ─── */}
                <section className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                            Prioridade ({activePlan === "snowball" ? "Menor Valor" : "Maior Juros"})
                        </h2>
                        <button className="flex items-center gap-1 text-xs text-primary font-semibold">
                            <Plus className="w-3.5 h-3.5" />
                            Adicionar
                        </button>
                    </div>

                    <AnimatePresence>
                        {sortedDebts.map((debt, index) => {
                            const remaining = debt.totalAmount - debt.paidAmount;
                            const progress = (debt.paidAmount / debt.totalAmount) * 100;
                            const monthlyInterest = (remaining * debt.interestRate) / 100;
                            const isPaid = paidDebtId === debt.id;
                            const isHighPriority = index === 0;

                            if (isPaid) return null;

                            return (
                                <motion.div
                                    key={debt.id}
                                    layout
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 200, transition: { duration: 0.4 } }}
                                    transition={{ delay: index * 0.08 }}
                                    className={cn(
                                        "rounded-2xl border p-5 space-y-4 bg-card",
                                        isHighPriority && "border-destructive/40 ring-1 ring-destructive/20",
                                        !isHighPriority && "border-border"
                                    )}
                                >
                                    {/* Top row */}
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                {isHighPriority && (
                                                    <span className="text-[10px] font-bold bg-destructive/20 text-destructive px-2 py-0.5 rounded-full uppercase tracking-wider">
                                                        Atacar Agora
                                                    </span>
                                                )}
                                                <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                                                    {categoryLabel[debt.category]}
                                                </span>
                                            </div>
                                            <p className="font-bold text-base truncate">{debt.name}</p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="text-lg font-bold">
                                                {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(remaining)}
                                            </p>
                                            <p className="text-[11px] text-muted-foreground">restante</p>
                                        </div>
                                    </div>

                                    {/* Progress bar */}
                                    <div className="space-y-1.5">
                                        <Progress
                                            value={progress}
                                            className="h-2 bg-secondary/10"
                                        />
                                        <div className="flex justify-between text-xs text-muted-foreground">
                                            <span>{Math.round(progress)}% pago</span>
                                            <span>
                                                {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(debt.totalAmount)} total
                                            </span>
                                        </div>
                                    </div>

                                    {/* Stats row */}
                                    <div className="flex gap-3">
                                        {debt.interestRate > 0 && (
                                            <div className="flex-1 bg-destructive/10 rounded-xl px-3 py-2 text-center">
                                                <p className="text-[10px] text-muted-foreground">Juros/mês</p>
                                                <p className="text-sm font-bold text-destructive">
                                                    {debt.interestRate}%
                                                </p>
                                                <p className="text-[10px] text-muted-foreground">
                                                    = {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(monthlyInterest)}
                                                </p>
                                            </div>
                                        )}
                                        <div className="flex-1 bg-muted rounded-xl px-3 py-2 text-center">
                                            <p className="text-[10px] text-muted-foreground">Parcela mín.</p>
                                            <p className="text-sm font-bold">
                                                {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(debt.minimumPayment)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            className="flex-1 rounded-xl gap-1.5 text-sm h-11 border-border"
                                            onClick={() => handleMarkPaid(debt.id)}
                                        >
                                            <Trophy className="w-4 h-4 text-yellow-500" />
                                            Quitei! 🎉
                                        </Button>
                                        <Button
                                            className="flex-1 rounded-xl gap-1.5 text-sm h-11 bg-primary"
                                        >
                                            Pagar Mais
                                            <ChevronRight className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </section>

                {/* ─── Tip ─── */}
                <div className="rounded-2xl bg-secondary/10 border border-secondary/20 p-4 flex gap-3 items-start">
                    <TrendingDown className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        <span className="font-semibold text-secondary">Dica Zella:</span> Pague R$ 100 a mais no {sortedDebts[0]?.name || "cartão"} esse mês e economize meses de juro.
                    </p>
                </div>
            </main>
        </div>
    );
}
