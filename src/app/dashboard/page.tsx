"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserStoreHydrated, useUserStore } from "@/store/useStore";
import { BottomNav } from "@/components/ui/bottom-nav";
import { Button } from "@/components/ui/button";
import {
    Flame,
    Trophy,
    PiggyBank,
    Map as MapIcon,
    GamepadIcon,
    Sparkles,
    Users,
    Zap,
    ArrowRight,
    ShieldCheck,
    TrendingUp,
    ChevronRight
} from "lucide-react";
import { motion } from "framer-motion";
import { steps } from "@/data/steps";
import { cn } from "@/lib/utils";
import { AppHeader } from "@/components/ui/app-header";
import { PageLoader } from "@/components/ui/page-loader";
import { InsightsWidget } from "@/components/ui/insights-widget";
import { AVATARS } from "@/components/ui/avatar-selector";
import Link from "next/link";

const QUICK_ACTIONS = [
    { label: "Finanças", icon: PiggyBank, href: "/finances", color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Jornada", icon: MapIcon, href: "/journey", color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Missões", icon: GamepadIcon, href: "/missions", color: "text-violet-600", bg: "bg-violet-50" },
    { label: "Social", icon: Users, href: "/social", color: "text-orange-600", bg: "bg-orange-50" },
];

export default function DashboardPage() {
    const router = useRouter();
    const user = useUserStoreHydrated((state) => state);
    const checkAndApplyStreak = useUserStore((state) => state.checkAndApplyStreak);

    useEffect(() => {
        checkAndApplyStreak();
    }, [checkAndApplyStreak]);

    useEffect(() => {
        if (user && !user.hasOnboarded) {
            router.push("/onboarding");
        }
    }, [user, router]);

    if (!user) {
        return <PageLoader message="Carregando..." />;
    }

    if (!user.hasOnboarded) {
        return null;
    }

    const displayStep = Math.min(user.currentStep, 5);
    const displayPhase = user.currentPhase || 1;
    const currentStepData = steps.find((s) => s.id === displayStep) || steps[0];
    const nextStepData = steps.find((s) => s.id === displayStep + 1);
    const currentLevel = user.level || 1;
    const xpNeeded = Math.floor(100 * Math.pow(currentLevel, 1.2));
    const xpProgress = Math.min(100, Math.floor((user.xp / xpNeeded) * 100));

    const ARENA_THEMES: Record<number, any> = {
        1: {
            bg: "from-red-50 via-[#fcf5f5] to-orange-50",
            glow1: "bg-red-400/[0.06]", glow2: "bg-orange-400/[0.05]", glow3: "bg-rose-300/[0.04]",
            heroNumberBg: "from-red-500 to-red-600 shadow-[0_8px_16px_-6px_rgba(239,68,68,0.4)]",
            heroText: "text-red-600",
            ctaBg: "from-red-600 to-red-800 shadow-[0_8px_30px_rgba(220,38,38,0.3)]",
        },
        2: {
            bg: "from-orange-50 via-[#fcfaf7] to-amber-50",
            glow1: "bg-orange-400/[0.06]", glow2: "bg-amber-400/[0.05]", glow3: "bg-yellow-300/[0.04]",
            heroNumberBg: "from-orange-500 to-orange-600 shadow-[0_8px_16px_-6px_rgba(249,115,22,0.4)]",
            heroText: "text-orange-600",
            ctaBg: "from-orange-500 to-orange-700 shadow-[0_8px_30px_rgba(234,88,12,0.3)]",
        },
        3: {
            bg: "from-blue-50 via-[#f6f9fc] to-sky-50",
            glow1: "bg-blue-400/[0.06]", glow2: "bg-sky-400/[0.05]", glow3: "bg-cyan-300/[0.04]",
            heroNumberBg: "from-blue-500 to-blue-600 shadow-[0_8px_16px_-6px_rgba(59,130,246,0.4)]",
            heroText: "text-blue-600",
            ctaBg: "from-blue-600 to-blue-800 shadow-[0_8px_30px_rgba(37,99,235,0.3)]",
        },
        4: {
            bg: "from-purple-50 via-[#faf5fc] to-fuchsia-50",
            glow1: "bg-purple-400/[0.06]", glow2: "bg-fuchsia-400/[0.05]", glow3: "bg-violet-300/[0.04]",
            heroNumberBg: "from-purple-500 to-purple-600 shadow-[0_8px_16px_-6px_rgba(168,85,247,0.4)]",
            heroText: "text-purple-600",
            ctaBg: "from-purple-600 to-purple-800 shadow-[0_8px_30px_rgba(147,51,234,0.3)]",
        },
        5: {
            bg: "from-amber-50 via-[#fcfbf5] to-yellow-50",
            glow1: "bg-amber-400/[0.08]", glow2: "bg-yellow-400/[0.06]", glow3: "bg-orange-300/[0.05]",
            heroNumberBg: "from-amber-400 to-amber-600 shadow-[0_8px_16px_-6px_rgba(245,158,11,0.5)]",
            heroText: "text-amber-600",
            ctaBg: "from-amber-500 to-amber-700 shadow-[0_8px_30px_rgba(217,119,6,0.4)]",
        },
        6: {
            bg: "from-emerald-50 via-[#f5fcf8] to-teal-50",
            glow1: "bg-emerald-400/[0.08]", glow2: "bg-teal-400/[0.06]", glow3: "bg-green-300/[0.05]",
            heroNumberBg: "from-emerald-500 to-emerald-600 shadow-[0_8px_16px_-6px_rgba(16,185,129,0.5)]",
            heroText: "text-emerald-600",
            ctaBg: "from-emerald-600 to-emerald-800 shadow-[0_8px_30px_rgba(5,150,105,0.4)]",
        }
    };

    const currentTheme = ARENA_THEMES[displayStep] || ARENA_THEMES[1];

    return (
        <div className="min-h-screen pb-24 relative overflow-x-hidden font-sans selection:bg-blue-500/30 bg-[#f4f6fb] transition-colors duration-1000">
            {/* Dynamic Arena Background - Premium Light */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className={cn("absolute inset-0 bg-gradient-to-br transition-colors duration-1000 opacity-80", currentTheme.bg)} />
                
                {/* Subtle Ambient Glows - dynamically themed */}
                <div className={cn("absolute top-[-10%] left-[-10%] w-[60%] h-[50%] rounded-full blur-[120px] transition-colors duration-1000", currentTheme.glow1)} />
                <div className={cn("absolute top-[20%] right-[-20%] w-[50%] h-[50%] rounded-full blur-[100px] transition-colors duration-1000", currentTheme.glow2)} />
                <div className={cn("absolute bottom-[10%] left-[10%] w-[40%] h-[40%] rounded-full blur-[120px] transition-colors duration-1000", currentTheme.glow3)} />
            </div>

            <AppHeader />

            <main className="px-4 space-y-4 mt-4 max-w-lg mx-auto relative z-10">
                {/* 1. HERO ARENA BANNER (Profile) */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Link href="/profile" className="block group active:scale-95 transition-transform">
                        <div className="bg-white/80 backdrop-blur-md rounded-[2rem] p-5 shadow-xl shadow-blue-900/5 relative overflow-hidden border border-white/50 ring-1 ring-black/[0.02]">
                            {/* Subtle internal gradient */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100/40 to-green-100/20 blur-2xl rounded-full" />
                            
                            <div className="flex justify-between items-start mb-5 relative z-10">
                                <div className="flex gap-4 items-center">
                                    <div className={cn("w-16 h-16 rounded-[1.25rem] bg-gradient-to-br flex items-center justify-center shrink-0 border border-white/20 transition-all duration-700", currentTheme.heroNumberBg)}>
                                        <span className="text-2xl font-black text-white drop-shadow-sm">{displayStep}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h2 className="font-extrabold text-[22px] text-gray-900 tracking-tight leading-tight uppercase transition-colors duration-700">
                                            {currentStepData.title}
                                        </h2>
                                        <p className="text-[13px] text-gray-400 font-bold mt-0.5 tracking-wider uppercase flex items-center gap-1.5 transition-colors duration-700">
                                            <span className={currentTheme.heroText}>Arena {displayStep}</span> 
                                            <span>•</span> 
                                            <span className="text-emerald-500">Fase {displayPhase}</span>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Secondary Gamification bar */}
                            <div className="bg-gray-50/50 rounded-2xl p-4 flex items-center justify-between relative z-10 border border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="bg-orange-50 p-2 rounded-xl border border-orange-100/50">
                                        <Trophy className="w-5 h-5 text-orange-500 drop-shadow-sm" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Jogador</p>
                                        <p className="text-[15px] font-black text-gray-800 leading-none">Nível {currentLevel}</p>
                                    </div>
                                </div>
                                <div className="w-32 h-2.5 bg-gray-200/50 rounded-full overflow-hidden relative shadow-inner">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${xpProgress}%` }}
                                        transition={{ duration: 1, ease: "easeOut" }}
                                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                        <span className="text-[8px] font-bold text-gray-700">{xpProgress}%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Link>
                </motion.div>

                {/* KPI SQUARES (Métricas) */}
                <motion.section
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-4 gap-3 z-10 relative"
                >
                    <div className="bg-white/80 backdrop-blur-md rounded-[1.25rem] p-3.5 flex flex-col items-center justify-center text-center shadow-lg shadow-blue-900/5 ring-1 ring-black/[0.02]">
                        <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center mb-2">
                            <Flame className="w-5 h-5 text-orange-500 drop-shadow-sm" />
                        </div>
                        <span className="text-[17px] font-black text-gray-800 leading-none">{user.streak}d</span>
                        <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wide mt-1">Streak</span>
                    </div>
                    <div className="bg-white/80 backdrop-blur-md rounded-[1.25rem] p-3.5 flex flex-col items-center justify-center text-center shadow-lg shadow-blue-900/5 ring-1 ring-black/[0.02]">
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mb-2">
                            <Zap className="w-5 h-5 text-blue-500 drop-shadow-sm" />
                        </div>
                        <span className="text-[17px] font-black text-gray-800 leading-none">{user.ie || 0}%</span>
                        <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wide mt-1">Eficien.</span>
                    </div>
                    <div className="bg-white/80 backdrop-blur-md rounded-[1.25rem] p-3.5 flex flex-col items-center justify-center text-center shadow-lg shadow-blue-900/5 ring-1 ring-black/[0.02]">
                        <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center mb-2">
                            <ShieldCheck className="w-5 h-5 text-emerald-500 drop-shadow-sm" />
                        </div>
                        <span className="text-[17px] font-black text-gray-800 leading-none">{user.is || 0}%</span>
                        <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wide mt-1">Sobrev.</span>
                    </div>
                    <div className="bg-white/80 backdrop-blur-md rounded-[1.25rem] p-3.5 flex flex-col items-center justify-center text-center shadow-lg shadow-blue-900/5 ring-1 ring-black/[0.02]">
                        <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center mb-2">
                            <TrendingUp className="w-5 h-5 text-red-500 rotate-180 drop-shadow-sm" />
                        </div>
                        <span className="text-[17px] font-black text-gray-800 leading-none">{user.idMetric || 0}%</span>
                        <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wide mt-1">Drenos</span>
                    </div>
                </motion.section>

                <motion.section
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                >
                    <InsightsWidget
                        transactions={user.transactions}
                        currentStep={user.currentStep}
                        metrics={{
                            ie: user.ie || 0,
                            is: user.is || 0,
                            id: user.idMetric || 0,
                            rs: user.rs || 0
                        }}
                    />
                </motion.section>

                {/* NEXT ARENA REQUIREMENT */}
                <motion.section
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="bg-white/80 backdrop-blur-md rounded-[2rem] p-5 shadow-xl shadow-blue-900/5 ring-1 ring-black/[0.02]">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-extrabold text-[16px] text-gray-800 uppercase tracking-tight">Jornada da Arena</h3>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.push('/journey')}
                                className="text-[12px] font-bold uppercase text-blue-600 hover:bg-blue-50 h-8 rounded-xl px-4"
                            >
                                Ver Mapa
                            </Button>
                        </div>

                        <div className="flex items-center gap-4 p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                            <div className={cn("w-12 h-12 rounded-[1rem] flex items-center justify-center bg-white shadow-sm ring-1 ring-black/5", currentStepData.color)}>
                                <currentStepData.icon className="w-6 h-6 drop-shadow-sm" />
                            </div>
                            <div className="flex-1">
                                <p className="font-black text-[15px] text-gray-800 uppercase">Degrau {displayStep}</p>
                                <p className="text-[13px] text-gray-400 font-bold mt-0.5 uppercase tracking-wide">Fase {displayPhase}</p>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                                <ArrowRight className="w-4 h-4 text-gray-400" />
                            </div>
                        </div>
                    </div>
                </motion.section>

                {/* 4. SMART HERO ACTION */}
                <motion.section
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                >
                    <div
                        onClick={() => router.push("/finances")}
                        className={cn("group relative bg-gradient-to-br rounded-[2rem] p-6 overflow-hidden cursor-pointer active:scale-[0.98] transition-all duration-700", currentTheme.ctaBg)}
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-10 -translate-y-10" />

                        <div className="flex items-center gap-5 relative z-10">
                            <div className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-[1.25rem] flex items-center justify-center border border-white/20 group-hover:scale-105 transition-transform">
                                <Sparkles className="w-7 h-7 text-white drop-shadow-sm" />
                            </div>

                            <div className="flex-1 min-w-0">
                                <h3 className="text-[19px] font-black text-white leading-tight mb-1 tracking-tight">
                                    Adicionar Recibo
                                </h3>
                                <p className="text-[13px] text-blue-100 font-medium">
                                    Escaneie via IA e ganhe <span className="font-bold text-white bg-blue-500/30 px-2 py-0.5 rounded-md ml-1">+50 XP</span>
                                </p>
                            </div>

                            <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/10 group-hover:bg-white/20 transition-colors">
                                <ChevronRight className="w-5 h-5 text-white" />
                            </div>
                        </div>
                    </div>
                </motion.section>

                {/* 5. QUICK ACTIONS */}
                <motion.section
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <div className="grid grid-cols-2 gap-3 z-10 relative">
                        {QUICK_ACTIONS.map((action) => (
                            <button
                                key={action.label}
                                onClick={() => router.push(action.href)}
                                className="group bg-white/80 backdrop-blur-md rounded-[1.5rem] p-4 flex items-center gap-3.5 shadow-lg shadow-blue-900/5 ring-1 ring-black/[0.02] active:scale-[0.97] transition-all text-left"
                            >
                                <div className={cn("w-12 h-12 rounded-[1rem] flex items-center justify-center bg-opacity-50", action.bg)}>
                                    <action.icon className={cn("w-6 h-6", action.color)} />
                                </div>
                                <span className="text-[15px] font-bold text-gray-700 uppercase tracking-wide">
                                    {action.label}
                                </span>
                            </button>
                        ))}
                    </div>
                </motion.section>
            </main>
            <BottomNav />
        </div>
    );
}
