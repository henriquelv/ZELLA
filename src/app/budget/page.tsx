"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    Home,
    Car,
    Utensils,
    Smartphone,
    ShoppingBag,
    Zap,
    CalendarDays,
    TrendingDown,
    CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// --- Types ---
interface BudgetCategory {
    id: string;
    label: string;
    budgeted: number;
    spent: number;
    icon: React.ElementType;
    type: "fixed" | "lifestyle";
}

// --- Mock Data ---
const BUDGET_CATEGORIES: BudgetCategory[] = [
    { id: "rent", label: "Aluguel", budgeted: 1200, spent: 1200, icon: Home, type: "fixed" },
    { id: "transport", label: "Transporte", budgeted: 300, spent: 220, icon: Car, type: "fixed" },
    { id: "bills", label: "Contas Fixas", budgeted: 350, spent: 350, icon: Zap, type: "fixed" },
    { id: "phone", label: "Celular/Internet", budgeted: 120, spent: 120, icon: Smartphone, type: "fixed" },
    { id: "food", label: "Alimentação", budgeted: 800, spent: 620, icon: Utensils, type: "lifestyle" },
    { id: "shopping", label: "Compras/Lazer", budgeted: 400, spent: 310, icon: ShoppingBag, type: "lifestyle" },
];

const MONTHLY_INCOME = 4800;
const DAYS_IN_MONTH = 30;
const CURRENT_DAY = 19; // mocked current day
const DAYS_REMAINING = DAYS_IN_MONTH - CURRENT_DAY;

function ProgressBar({
    value,
    className,
}: {
    value: number;
    className?: string;
}) {
    const clamped = Math.min(100, Math.max(0, value));
    const color =
        clamped < 60
            ? "bg-secondary"
            : clamped < 85
                ? "bg-yellow-500"
                : "bg-destructive";

    return (
        <div className={cn("h-2 bg-muted rounded-full overflow-hidden", className)}>
            <motion.div
                className={cn("h-full rounded-full", color)}
                initial={{ width: 0 }}
                animate={{ width: `${clamped}%` }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
            />
        </div>
    );
}

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const staggerItem = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0 },
};

export default function BudgetPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<"fixed" | "lifestyle">("fixed");

    const totalBudgeted = BUDGET_CATEGORIES.reduce((a, c) => a + c.budgeted, 0);
    const totalSpent = BUDGET_CATEGORIES.reduce((a, c) => a + c.spent, 0);
    const remaining = MONTHLY_INCOME - totalSpent;
    const safeToSpendPerDay = remaining / DAYS_REMAINING;

    const filtered = useMemo(
        () => BUDGET_CATEGORIES.filter((c) => c.type === activeTab),
        [activeTab]
    );

    const fmt = (n: number) =>
        new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);

    const safeColor =
        safeToSpendPerDay > 50
            ? "text-secondary"
            : safeToSpendPerDay > 15
                ? "text-yellow-400"
                : "text-destructive";

    return (
        <div className="min-h-screen bg-background pb-24">
            {/* Background glow */}
            <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-secondary/10 to-transparent -z-10 pointer-events-none" />

            {/* Header */}
            <header className="px-6 pt-12 pb-4 flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.back()}
                    className="rounded-full shrink-0"
                    aria-label="Voltar"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold font-heading">Orçamento</h1>
                    <p className="text-sm text-muted-foreground">Fevereiro 2026</p>
                </div>
            </header>

            <main className="px-6 space-y-6">
                {/* ─── Safe to Spend Hero ─── */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="rounded-2xl bg-card border border-border p-6 text-center space-y-2"
                >
                    <div className="w-10 h-10 rounded-2xl bg-secondary/20 flex items-center justify-center mx-auto mb-3">
                        <CalendarDays className="w-5 h-5 text-secondary" />
                    </div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                        Seguro para Gastar Hoje
                    </p>
                    <p className={cn("text-5xl font-bold font-heading", safeColor)}>
                        {fmt(safeToSpendPerDay)}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                        Você tem{" "}
                        <span className="font-bold text-foreground">{fmt(remaining)}</span> e{" "}
                        <span className="font-bold text-foreground">{DAYS_REMAINING} dias</span> para o próximo salário.
                    </p>
                </motion.div>

                {/* ─── Monthly Overview Bar ─── */}
                <div className="space-y-2">
                    <div className="flex justify-between text-xs font-medium text-muted-foreground">
                        <span>Gasto: {fmt(totalSpent)}</span>
                        <span>Renda: {fmt(MONTHLY_INCOME)}</span>
                    </div>
                    <ProgressBar value={(totalSpent / MONTHLY_INCOME) * 100} />
                    <div className="flex justify-between text-xs font-medium">
                        <span className="text-muted-foreground">Orçado: {fmt(totalBudgeted)}</span>
                        <span className={cn("font-bold", remaining >= 0 ? "text-secondary" : "text-destructive")}>
                            {remaining >= 0 ? "+" : ""}{fmt(remaining)} livre
                        </span>
                    </div>
                </div>

                {/* ─── Tab Selector ─── */}
                <div className="bg-muted rounded-2xl p-1 grid grid-cols-2 gap-1">
                    {(["fixed", "lifestyle"] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={cn(
                                "py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer",
                                activeTab === tab
                                    ? "bg-card text-foreground shadow-sm"
                                    : "text-muted-foreground"
                            )}
                        >
                            {tab === "fixed" ? "Custos Fixos" : "Estilo de Vida"}
                        </button>
                    ))}
                </div>

                {/* ─── Category Cards ─── */}
                <motion.div
                    key={activeTab}
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                    className="space-y-3"
                >
                    {filtered.map((cat) => {
                        const pct = (cat.spent / cat.budgeted) * 100;
                        const leftover = cat.budgeted - cat.spent;
                        const isExceeded = leftover < 0;
                        const isComplete = pct >= 100;

                        return (
                            <motion.div
                                key={cat.id}
                                variants={staggerItem}
                                className="bg-card rounded-2xl border border-border p-4 space-y-3"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                            <cat.icon className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm">{cat.label}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {fmt(cat.spent)} / {fmt(cat.budgeted)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        {isComplete ? (
                                            <CheckCircle2 className="w-5 h-5 text-secondary" />
                                        ) : (
                                            <p className={cn("text-sm font-bold", isExceeded ? "text-destructive" : "text-secondary")}>
                                                {isExceeded ? "−" : "+"}{fmt(Math.abs(leftover))}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <ProgressBar value={pct} />
                            </motion.div>
                        );
                    })}
                </motion.div>

                {/* ─── Tip ─── */}
                <div className="rounded-2xl bg-primary/5 border border-primary/20 p-4 flex gap-3 items-start">
                    <TrendingDown className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        <span className="font-semibold text-primary">Dica Zella:</span> Se você gastar{" "}
                        {fmt(safeToSpendPerDay)} ou menos por dia, fechará o mês no azul.
                    </p>
                </div>
            </main>
        </div>
    );
}
