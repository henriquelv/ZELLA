"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BottomNav } from "@/components/ui/bottom-nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useUserStoreHydrated, useUserStore, Goal } from "@/store/useStore";
import { PageLoader } from "@/components/ui/page-loader";
import { cn } from "@/lib/utils";
import {
    Target, CheckCircle2, Plus, Zap, TrendingUp, PiggyBank, Brain,
    Flame, ChevronLeft
} from "lucide-react";
import Link from "next/link";

// ─── Category config ─────────────────────────────────────────────────────────
const CAT_CONFIG = {
    saving: { label: "Poupança", icon: PiggyBank, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/30" },
    spending: { label: "Gastos", icon: Target, color: "text-violet-500", bg: "bg-violet-500/10", border: "border-violet-500/30" },
    investing: { label: "Investimento", icon: TrendingUp, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/30" },
    habit: { label: "Hábito", icon: Brain, color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/30" },
};

// ─── Suggested goals that users can quickly add ────────────────────────────
const SUGGESTED: Omit<Goal, "id" | "createdAt" | "completed">[] = [
    { title: "Cortar gastos desnecessários", description: "Eliminar pelo menos 1 desperdício esta semana.", category: "spending", xpReward: 50 },
    { title: "Criar fundo de emergência", description: "Guardar 3 meses de despesas em conta separada.", category: "saving", xpReward: 100 },
    { title: "Primeiro investimento", description: "Investir qualquer valor no Tesouro Direto.", category: "investing", xpReward: 80 },
    { title: "Controlar gastos por 7 dias", description: "Registrar todas as despesas durante 7 dias.", category: "habit", xpReward: 60 },
    { title: "Poupar 20% da renda", description: "Separar 20% do salário assim que receber.", category: "saving", xpReward: 90 },
    { title: "Cancelar uma assinatura desnecessária", description: "Rever serviços recorrentes e cancelar um.", category: "spending", xpReward: 40 },
];

function GoalCard({ goal }: { goal: Goal }) {
    const toggleGoal = useUserStore(s => s.toggleGoal);
    const addXp = useUserStore(s => s.addXp);
    const cat = CAT_CONFIG[goal.category];
    const Icon = cat.icon;

    const handleToggle = () => {
        const wasCompleted = goal.completed;
        toggleGoal(goal.id);
        if (!wasCompleted) addXp(goal.xpReward);
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
        >
            <Card className={cn(
                "border transition-all",
                goal.completed ? "opacity-60 border-border/30" : `${cat.border} border`,
            )}>
                <CardContent className="p-4 flex items-start gap-4">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5", cat.bg)}>
                        <Icon className={cn("w-5 h-5", cat.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className={cn("font-bold text-sm leading-tight", goal.completed && "line-through text-muted-foreground")}>
                            {goal.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">{goal.description}</p>
                        <div className="flex items-center gap-1 mt-1.5">
                            <Zap className="w-3 h-3 text-yellow-500" />
                            <span className="text-xs font-bold text-yellow-500">+{goal.xpReward} XP ao concluir</span>
                        </div>
                    </div>
                    <button
                        onClick={handleToggle}
                        className={cn(
                            "w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
                            goal.completed
                                ? "bg-emerald-500 border-emerald-500"
                                : "border-border hover:border-emerald-500"
                        )}
                        aria-label={goal.completed ? "Marcar como pendente" : "Concluir meta"}
                    >
                        {goal.completed && <CheckCircle2 className="w-4 h-4 text-white" />}
                    </button>
                </CardContent>
            </Card>
        </motion.div>
    );
}

export default function MetasPage() {
    const user = useUserStoreHydrated(s => s);
    const addGoal = useUserStore(s => s.addGoal);
    const [showSuggested, setShowSuggested] = useState(false);

    if (!user) return <PageLoader message="Carregando metas..." />;

    const active = user.goals.filter(g => !g.completed);
    const done = user.goals.filter(g => g.completed);

    const handleAddSuggested = (sg: typeof SUGGESTED[0]) => {
        addGoal({
            id: crypto.randomUUID(),
            ...sg,
            createdAt: new Date().toISOString(),
            completed: false,
        });
        setShowSuggested(false);
    };

    return (
        <div className="min-h-screen bg-background pb-28">
            {/* Header */}
            <header className="px-6 pt-12 pb-4 sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-border/50">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold font-heading flex items-center gap-2">
                            <Target className="w-5 h-5 text-primary" /> Metas
                        </h1>
                        <p className="text-xs text-muted-foreground font-medium">
                            {active.length} ativa{active.length !== 1 ? "s" : ""} · {done.length} concluída{done.length !== 1 ? "s" : ""}
                        </p>
                    </div>
                    <Button onClick={() => setShowSuggested(true)} size="sm" className="h-9 gap-1.5 rounded-xl">
                        <Plus className="w-4 h-4" /> Nova Meta
                    </Button>
                </div>
            </header>

            <main className="px-6 mt-6 space-y-6">
                {/* Suggested goals modal */}
                <AnimatePresence>
                    {showSuggested && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-end"
                            onClick={e => e.target === e.currentTarget && setShowSuggested(false)}
                        >
                            <motion.div
                                initial={{ y: "100%" }}
                                animate={{ y: 0 }}
                                exit={{ y: "100%" }}
                                transition={{ type: "spring", damping: 28, stiffness: 200 }}
                                className="w-full bg-card border-t border-border rounded-t-3xl pb-safe-area"
                            >
                                <div className="px-6 pt-5 pb-3 flex items-center gap-3 border-b border-border/50">
                                    <button onClick={() => setShowSuggested(false)}>
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                    <h2 className="font-bold font-heading text-lg">Sugestões de Metas</h2>
                                </div>
                                <div className="px-6 py-4 space-y-3 max-h-[70vh] overflow-y-auto">
                                    {SUGGESTED.map((sg, i) => {
                                        const cat = CAT_CONFIG[sg.category];
                                        const Icon = cat.icon;
                                        const alreadyAdded = user.goals.some(g => g.title === sg.title);
                                        return (
                                            <button
                                                key={i}
                                                onClick={() => !alreadyAdded && handleAddSuggested(sg)}
                                                disabled={alreadyAdded}
                                                className={cn(
                                                    "w-full text-left border rounded-2xl p-4 flex items-start gap-3 transition-colors",
                                                    alreadyAdded
                                                        ? "opacity-40 cursor-not-allowed border-border/30"
                                                        : `${cat.border} hover:${cat.bg} cursor-pointer`
                                                )}
                                            >
                                                <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0", cat.bg)}>
                                                    <Icon className={cn("w-4 h-4", cat.color)} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm">{sg.title}</p>
                                                    <p className="text-xs text-muted-foreground mt-0.5">{sg.description}</p>
                                                    <p className="text-xs font-bold text-yellow-500 mt-1">+{sg.xpReward} XP</p>
                                                </div>
                                                {alreadyAdded && (
                                                    <CheckCircle2 className="w-5 h-5 text-emerald-500 ml-auto shrink-0" />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Empty state */}
                {user.goals.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-16 space-y-4"
                    >
                        <div className="w-20 h-20 bg-primary/10 rounded-3xl mx-auto flex items-center justify-center">
                            <Target className="w-10 h-10 text-primary" />
                        </div>
                        <div>
                            <h2 className="font-bold text-xl font-heading">Nenhuma meta ainda</h2>
                            <p className="text-muted-foreground text-sm mt-1">
                                Adicione metas financeiras e complete os games para receber sugestões.
                            </p>
                        </div>
                        <Button onClick={() => setShowSuggested(true)} className="gap-2">
                            <Plus className="w-4 h-4" /> Adicionar minha primeira meta
                        </Button>
                    </motion.div>
                )}

                {/* Active goals */}
                {active.length > 0 && (
                    <section className="space-y-3">
                        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                            <Flame className="w-3.5 h-3.5 text-orange-500" /> Em andamento ({active.length})
                        </h2>
                        <AnimatePresence>
                            {active.map(g => <GoalCard key={g.id} goal={g} />)}
                        </AnimatePresence>
                    </section>
                )}

                {/* Completed goals */}
                {done.length > 0 && (
                    <section className="space-y-3">
                        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Concluídas ({done.length})
                        </h2>
                        <AnimatePresence>
                            {done.map(g => <GoalCard key={g.id} goal={g} />)}
                        </AnimatePresence>
                    </section>
                )}

                {/* Link to games */}
                <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex items-center gap-3">
                    <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0">
                        <Zap className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                        <p className="font-bold text-sm">Ganhe metas jogando!</p>
                        <p className="text-xs text-muted-foreground">Complete os games em Missões para receber sugestões personalizadas.</p>
                    </div>
                    <Link href="/missions" className="text-xs font-bold text-primary whitespace-nowrap">
                        Jogar →
                    </Link>
                </div>
            </main>

            <BottomNav />
        </div>
    );
}
