"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Shield, Target, TrendingUp, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// --- Mock Data ---
const GOAL_AMOUNT = 6000; // 3x monthly fixed costs (~R$2000/mo)
const CURRENT_AMOUNT = 1800;
const MONTHLY_CONTRIBUTION = 200;
const MONTHS_TO_GO = Math.ceil((GOAL_AMOUNT - CURRENT_AMOUNT) / MONTHLY_CONTRIBUTION);

const MILESTONES = [
    { label: "1 semana", amount: 700, unlocked: CURRENT_AMOUNT >= 700 },
    { label: "1 mês", amount: 2000, unlocked: CURRENT_AMOUNT >= 2000 },
    { label: "3 meses", amount: 6000, unlocked: CURRENT_AMOUNT >= 6000 },
];

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const staggerItem = {
    hidden: { opacity: 0, x: -16 },
    visible: { opacity: 1, x: 0 },
};

export default function EmergencyFundPage() {
    const router = useRouter();
    const [isAdding, setIsAdding] = useState(false);
    const progress = Math.min(100, (CURRENT_AMOUNT / GOAL_AMOUNT) * 100);

    const fmt = (n: number) =>
        new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);

    return (
        <div className="min-h-screen bg-background pb-24">
            {/* Ambient glow */}
            <div className="absolute top-0 left-0 w-full h-80 bg-gradient-to-b from-primary/15 via-primary/5 to-transparent -z-10 pointer-events-none" />

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
                    <h1 className="text-2xl font-bold font-heading">Reserva de Emergência</h1>
                    <p className="text-sm text-muted-foreground">Seu castelo de segurança</p>
                </div>
            </header>

            <main className="px-6 space-y-6">
                {/* ─── Shield Visualizer ─── */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="flex flex-col items-center py-8"
                >
                    {/* Layered Shield */}
                    <div className="relative flex items-center justify-center w-44 h-44 mb-6">
                        {/* Outer ring */}
                        <div
                            className="absolute inset-0 rounded-full border-4 opacity-20"
                            style={{
                                borderColor: "hsl(var(--primary))",
                                background: `conic-gradient(hsl(var(--primary)) ${progress * 3.6}deg, transparent 0deg)`,
                            }}
                        />
                        {/* Middle layer */}
                        <div
                            className="absolute inset-4 rounded-full opacity-30 bg-primary"
                            style={{ opacity: 0.1 + (progress / 100) * 0.25 }}
                        />
                        {/* Icon and percent */}
                        <div className="flex flex-col items-center justify-center gap-1 z-10">
                            <Shield
                                className="w-12 h-12 text-primary drop-shadow-[0_0_12px_rgba(0,102,204,0.6)]"
                                strokeWidth={1.5}
                                fill="rgba(0,102,204,0.15)"
                            />
                            <span className="text-2xl font-bold font-heading text-primary">
                                {Math.round(progress)}%
                            </span>
                        </div>
                    </div>

                    {/* Amounts */}
                    <div className="text-center space-y-1">
                        <p className="text-4xl font-bold font-heading">{fmt(CURRENT_AMOUNT)}</p>
                        <p className="text-sm text-muted-foreground">
                            de <span className="font-semibold text-foreground">{fmt(GOAL_AMOUNT)}</span> (3 meses de sobrevivência)
                        </p>
                    </div>

                    {/* Animated progress bar */}
                    <div className="w-full mt-4 h-3 bg-muted rounded-full overflow-hidden">
                        <motion.div
                            className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
                            initial={{ width: "0%" }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                        />
                    </div>
                </motion.div>

                {/* ─── Stats Row ─── */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-card rounded-2xl border border-border p-4 space-y-1">
                        <p className="text-xs text-muted-foreground">Contribuição Mensal</p>
                        <p className="text-xl font-bold text-primary">{fmt(MONTHLY_CONTRIBUTION)}</p>
                    </div>
                    <div className="bg-card rounded-2xl border border-border p-4 space-y-1">
                        <p className="text-xs text-muted-foreground">Tempo Restante</p>
                        <p className="text-xl font-bold">
                            {MONTHS_TO_GO} <span className="text-sm font-normal text-muted-foreground">meses</span>
                        </p>
                    </div>
                </div>

                {/* ─── Milestones ─── */}
                <section>
                    <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                        Marcos de Proteção
                    </h2>
                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                        className="space-y-3"
                    >
                        {MILESTONES.map((m) => (
                            <motion.div
                                key={m.label}
                                variants={staggerItem}
                                className={cn(
                                    "rounded-2xl border p-4 flex items-center gap-4 transition-colors",
                                    m.unlocked
                                        ? "bg-secondary/10 border-secondary/30"
                                        : "bg-card border-border opacity-50"
                                )}
                            >
                                <div
                                    className={cn(
                                        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                                        m.unlocked ? "bg-secondary/20" : "bg-muted"
                                    )}
                                >
                                    {m.unlocked ? (
                                        <Shield className="w-5 h-5 text-secondary" />
                                    ) : (
                                        <Lock className="w-5 h-5 text-muted-foreground" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-sm">{m.label} de sobrevivência</p>
                                    <p className="text-xs text-muted-foreground">{fmt(m.amount)}</p>
                                </div>
                                {m.unlocked && (
                                    <span className="text-xs font-bold text-secondary bg-secondary/10 px-2 py-1 rounded-full">
                                        ✓ Conquistado
                                    </span>
                                )}
                            </motion.div>
                        ))}
                    </motion.div>
                </section>

                {/* ─── Tip / Alert ─── */}
                <div className="rounded-2xl bg-card border border-border p-4 flex gap-3 items-start">
                    <Target className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-semibold text-foreground mb-1">Bloqueio de Degrau</p>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Você só subirá para o <strong>Degrau 4</strong> quando sua reserva cobrir pelo menos{" "}
                            <strong>1 mês de gastos fixos</strong>. Isso não é opcional — é resiliência real.
                        </p>
                    </div>
                </div>

                {/* ─── CTA ─── */}
                <Button
                    className="w-full h-14 rounded-2xl font-bold text-base gap-2 bg-primary shadow-lg shadow-primary/20"
                    onClick={() => setIsAdding(!isAdding)}
                >
                    <TrendingUp className="w-5 h-5" />
                    Adicionar à Reserva
                </Button>
            </main>
        </div>
    );
}
