"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserStoreHydrated, useUserStore } from "@/store/useStore";
import { BottomNav } from "@/components/ui/bottom-nav";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Flame,
    Trophy,
    PiggyBank,
    Map as MapIcon,
    GamepadIcon,
    Sparkles,
    Users,
    Zap,
    ArrowRight
} from "lucide-react";
import { motion } from "framer-motion";
import { steps } from "@/data/steps";
import { cn } from "@/lib/utils";
import { AppHeader } from "@/components/ui/app-header";
import { PageLoader } from "@/components/ui/page-loader";
import { InsightsWidget } from "@/components/ui/insights-widget";
import { AVATARS } from "@/components/ui/avatar-selector";

const QUICK_ACTIONS = [
    { label: "Finanças", icon: PiggyBank, href: "/finances", color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Jornada", icon: MapIcon, href: "/journey", color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Missões", icon: GamepadIcon, href: "/missions", color: "text-violet-500", bg: "bg-violet-500/10" },
    { label: "Social", icon: Users, href: "/social", color: "text-orange-500", bg: "bg-orange-500/10" },
];

export default function DashboardPage() {
    const router = useRouter();
    const user = useUserStoreHydrated((state) => state);
    const checkAndApplyStreak = useUserStore((state) => state.checkAndApplyStreak);

    useEffect(() => {
        // Ao carregar o dashboard, checamos o streak uma única vez.
        checkAndApplyStreak();
    }, [checkAndApplyStreak]);

    useEffect(() => {
        if (user && !user.hasOnboarded) {
            router.push("/onboarding");
        }
    }, [user, router]);

    if (!user) {
        return <PageLoader message="Carregando matriz..." />;
    }

    if (!user.hasOnboarded) {
        return null;
    }

    const currentStepData = steps.find((s) => s.id === user.currentStep) || steps[0];
    const nextStepData = steps.find((s) => s.id === user.currentStep + 1);
    const xpLevel = Math.floor(user.xp / 100) + 1;
    const xpProgress = user.xp % 100;

    return (
        <div className="min-h-screen bg-background pb-28 relative overflow-x-hidden selection:bg-primary/20">
            {/* Immersive Glass Background gradient */}
            <div className="absolute top-0 left-0 w-full h-[50vh] bg-gradient-to-b from-primary/10 via-background to-background -z-10 pointer-events-none" />
            <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute top-20 -left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none" />

            <AppHeader />

            <main className="px-6 space-y-8 mt-6">
                {/* 1. GAMIFIED PROFILE HEADER */}
                <motion.section
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative group flex items-center gap-5 bg-card/40 border border-white/5 backdrop-blur-md p-5 rounded-[2.25rem] shadow-xl shadow-primary/5 overflow-hidden"
                >
                    {/* Animated HUD Background */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors duration-500" />

                    <div className="relative shrink-0">
                        {/* Avatar Ring with Pulsing Effect */}
                        <motion.div
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="w-20 h-20 rounded-full bg-gradient-to-tr from-primary via-blue-500 to-emerald-400 p-[3px] shadow-[0_0_25px_rgba(59,130,246,0.4)]"
                        >
                            <div className="w-full h-full bg-card rounded-full flex items-center justify-center overflow-hidden">
                                {(() => {
                                    const av = AVATARS.find(a => a.id === user.activeAvatar) || AVATARS[0];
                                    return (
                                        <div className={`w-full h-full ${av.color} flex items-center justify-center text-3xl transition-transform group-hover:scale-110 duration-500`}>
                                            {av.icon}
                                        </div>
                                    );
                                })()}
                            </div>
                        </motion.div>
                        {/* Level Badge overlapping */}
                        <Badge className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[10px] font-black uppercase tracking-wider bg-primary border border-primary-foreground/20 shadow-lg h-auto py-1 px-3 rounded-full">
                            LVL {xpLevel}
                        </Badge>
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1.5">
                            <div>
                                <h1 className="text-xl font-bold font-heading truncate leading-none mb-1">
                                    {user.name.split(" ")[0]}
                                </h1>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Cód: Z-{(user as any).id?.substring(0, 4).toUpperCase() || 'EX01'}</p>
                            </div>
                            <div className="flex items-center gap-1.5 bg-orange-500/10 text-orange-500 px-2.5 py-1.5 rounded-xl border border-orange-500/20 shadow-sm">
                                <Flame className="w-4 h-4 fill-current" />
                                <span className="text-xs font-black leading-none">{user.streak}</span>
                            </div>
                        </div>

                        <div className="mt-4">
                            <div className="flex justify-between text-[9px] text-muted-foreground font-black tracking-widest uppercase mb-2">
                                <span className="flex items-center gap-1"><Trophy className="w-3 h-3" /> {xpProgress} / 100 XP</span>
                                <span className="truncate text-right max-w-[120px] text-primary">
                                    <span className="opacity-40 mr-1">DESTINO:</span>{nextStepData?.title || "Mestre"}
                                </span>
                            </div>
                            <div className="relative">
                                <Progress value={xpProgress} className="h-2.5 bg-muted/80 rounded-full overflow-hidden" indicatorClassName="bg-gradient-to-r from-primary via-blue-400 to-emerald-400 animate-pulse" />
                                {/* Micro-lines for HUD feel */}
                                <div className="absolute top-0 left-0 w-full h-full flex justify-between px-1 pointer-events-none opacity-20">
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <div key={i} className="w-[1px] h-full bg-white" />)}
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.section>

                {/* 1.5 PROACTIVE INSIGHT — ZELLA AI */}
                <motion.section
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <InsightsWidget transactions={user.transactions} currentStep={user.currentStep} />
                </motion.section>

                {/* 2. JOURNEY PROGRESS CARD */}
                <motion.section
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                >
                    <div className="relative p-5 rounded-[2.25rem] bg-card/60 border border-white/5 backdrop-blur-sm overflow-hidden group">
                        {/* Decorative HUD element */}
                        <div className="absolute -top-10 -left-10 w-24 h-24 bg-primary/5 rounded-full blur-2xl" />

                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transform group-hover:rotate-12 transition-transform duration-500", currentStepData.color)}>
                                    <currentStepData.icon className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm leading-none">Degrau {user.currentStep}</h3>
                                    <p className="text-[10px] text-muted-foreground font-bold uppercase mt-1 tracking-widest">{currentStepData.title}</p>
                                </div>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => router.push('/journey')} className="text-[10px] font-bold uppercase tracking-widest h-8 px-3 rounded-full hover:bg-white/5">
                                Ver Mapa <ArrowRight className="w-3 h-3 ml-1" />
                            </Button>
                        </div>

                        <div className="space-y-3">
                            {currentStepData.checkpoints.slice(0, 2).map((cp, i) => (
                                <div key={i} className="flex items-center gap-3 bg-muted/20 p-3 rounded-2xl border border-white/5 hover:border-white/10 transition-all cursor-default group/cp">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary/40 group-hover/cp:scale-150 transition-transform" />
                                    <span className="text-xs font-bold text-foreground/80">{cp}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.section>

                {/* 2.5 SMART HERO ACTION */}
                <motion.section
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <div
                        onClick={() => router.push("/finances")}
                        className="group relative bg-gradient-to-br from-primary/90 to-blue-700 rounded-[2.25rem] p-7 overflow-hidden cursor-pointer shadow-2xl shadow-primary/20 hover:scale-[1.02] transition-all duration-500 active:scale-[0.98]"
                    >
                        {/* Animated gradient background sweep */}
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                        {/* Floating elements inside card */}
                        <motion.div
                            animate={{ y: [0, -8, 0], rotate: [0, 5, 0] }}
                            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute -right-6 -top-6 w-32 h-32 bg-primary/20 rounded-full blur-3xl pointer-events-none"
                        />

                        <div className="flex flex-col items-center text-center relative z-10">
                            {/* Glowing Icon */}
                            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-5 ring-1 ring-primary/30 shadow-[0_0_30px_rgba(59,130,246,0.3)] group-hover:scale-110 transition-transform duration-500">
                                <Sparkles className="w-8 h-8 text-primary" />
                            </div>

                            <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider text-primary border-primary/50 mb-3 bg-primary/5">
                                Missão Especial
                            </Badge>

                            <h2 className="text-2xl font-black font-heading leading-tight bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70 mb-2">
                                Mapeie seu 1º Recibo
                            </h2>
                            <p className="text-sm text-muted-foreground font-medium mb-6 px-4">
                                Use a inteligência artificial do Zella para escanear uma nota fiscal. Nós fazemos o trabalho sujo.
                            </p>

                            <Button className="w-full h-14 rounded-2xl font-bold tracking-wide text-base shadow-lg shadow-primary/30 hover:shadow-primary/50 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white transition-all transform active:scale-95 flex items-center justify-center gap-2">
                                <Zap className="w-5 h-5 fill-current opacity-80" />
                                Iniciar Scanner
                            </Button>
                        </div>
                    </div>
                </motion.section>

                {/* 3. ESSENTIAL ACTIONS GRID */}
                <motion.section
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="flex items-center justify-between mb-4 px-2">
                        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                            Navegação
                        </h3>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        {QUICK_ACTIONS.map((action) => (
                            <motion.button
                                key={action.label}
                                whileTap={{ scale: 0.96 }}
                                onClick={() => router.push(action.href)}
                                className="group flex items-center p-4 rounded-3xl bg-card/80 border border-white/5 backdrop-blur-sm shadow-sm hover:bg-card hover:border-border transition-all gap-4"
                            >
                                <div className={cn("p-3 rounded-2xl flex-shrink-0 transition-transform group-hover:scale-105", action.bg)}>
                                    <action.icon className={cn("w-5 h-5", action.color)} />
                                </div>
                                <span className="text-sm font-bold text-foreground/90 leading-tight text-left">
                                    {action.label}
                                </span>
                            </motion.button>
                        ))}
                    </div>
                </motion.section>
            </main>
            <BottomNav />
        </div>
    );
}
