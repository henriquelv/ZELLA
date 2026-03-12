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

    const getArenaTheme = (step: number) => {
        switch (step) {
            case 1: // Sobrevivente (Floresta Escura/Pedra)
                return "from-stone-900 via-stone-800 to-emerald-950";
            case 2: // Organizando (Mecânica/Ferro)
                return "from-slate-900 via-slate-800 to-blue-900";
            case 3: // Controlador (Céu/Prata)
                return "from-sky-500 via-blue-400 to-slate-200";
            case 4: // Construtor (Royale/Castelo)
                return "from-blue-700 via-blue-600 to-yellow-500";
            case 5: // Mestre (Cosmos)
                return "from-indigo-950 via-purple-900 to-fuchsia-900";
            default:
                return "from-[#e0f2fe] via-[#f0fdfa] to-blue-100";
        }
    };

    const isDarkArena = displayStep === 1 || displayStep === 2 || displayStep === 5;

    return (
        <div className="min-h-screen pb-24 relative overflow-x-hidden font-sans selection:bg-blue-500/30">
            {/* Dynamic Arena Background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className={cn("absolute inset-0 bg-gradient-to-br opacity-100 transition-colors duration-1000", getArenaTheme(displayStep))} />
                <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-black/[0.1] rounded-full blur-[120px]" />
                <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-white/[0.05] rounded-full blur-[120px]" />
            </div>

            <AppHeader />

            <main className="px-4 space-y-4 mt-4 max-w-lg mx-auto relative z-10">
                {/* 1. HERO ARENA BANNER (Profile) */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Link href="/profile" className="block group active:scale-95 transition-transform">
                        <div className="bg-white border-2 border-b-4 border-gray-300 rounded-3xl p-5 shadow-lg relative overflow-hidden">
                            <div className="flex justify-between items-start mb-5 relative">
                                <div className="flex gap-4 items-center">
                                    <div className="w-16 h-16 rounded-2xl border-2 border-b-4 border-[#1e3a8a] bg-[#2563eb] shadow-inner flex items-center justify-center shrink-0">
                                        <span className="text-2xl font-black text-white drop-shadow-md">{displayStep}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h2 className="font-black text-[22px] text-gray-900 tracking-tight leading-tight uppercase relative">
                                            {currentStepData.title}
                                            <span className="absolute -bottom-1 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 to-transparent rounded-full opacity-50"></span>
                                        </h2>
                                        <p className="text-[13px] text-gray-500 font-bold mt-1 uppercase tracking-wider">
                                            Arena {displayStep} <span className="mx-1 text-gray-300">•</span> Fase {displayPhase}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Secondary Gamification bar */}
                            <div className="bg-gray-100 rounded-2xl p-3 border-2 border-gray-200 border-b-4 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="bg-yellow-400 p-1.5 rounded-lg border-2 border-yellow-600 border-b-4">
                                        <Trophy className="w-4 h-4 text-yellow-900" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-wider">Jogador</p>
                                        <p className="text-[14px] font-black text-gray-900">Nível {currentLevel}</p>
                                    </div>
                                </div>
                                <div className="w-28 h-4 bg-gray-300 rounded-full border-2 border-gray-400 overflow-hidden relative shadow-inner">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${xpProgress}%` }}
                                        transition={{ duration: 1, ease: "easeOut" }}
                                        className="absolute top-0 left-0 h-full bg-blue-500 border-t border-white/40"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-[9px] font-black text-white drop-shadow-md z-10">{xpProgress}%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Link>
                </motion.div>

                {/* KPI SQUARES (Clash Royale Stats) */}
                <motion.section
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-4 gap-2"
                >
                    <div className="bg-white rounded-2xl p-3 flex flex-col items-center text-center border-2 border-b-4 border-gray-200 shadow-md">
                        <Flame className="w-6 h-6 text-orange-500 mb-1 drop-shadow-sm" />
                        <span className="text-[16px] font-black text-gray-900">{user.streak}d</span>
                        <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wide mt-0.5">Streak</span>
                    </div>
                    <div className="bg-white rounded-2xl p-3 flex flex-col items-center text-center border-2 border-b-4 border-gray-200 shadow-md">
                        <Zap className="w-6 h-6 text-blue-500 mb-1 drop-shadow-sm" />
                        <span className="text-[16px] font-black text-gray-900">{user.ie || 0}%</span>
                        <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wide mt-0.5">Eficien.</span>
                    </div>
                    <div className="bg-white rounded-2xl p-3 flex flex-col items-center text-center border-2 border-b-4 border-gray-200 shadow-md">
                        <ShieldCheck className="w-6 h-6 text-green-500 mb-1 drop-shadow-sm" />
                        <span className="text-[16px] font-black text-gray-900">{user.is || 0}%</span>
                        <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wide mt-0.5">Sobrev.</span>
                    </div>
                    <div className="bg-white rounded-2xl p-3 flex flex-col items-center text-center border-2 border-b-4 border-gray-200 shadow-md">
                        <TrendingUp className="w-6 h-6 text-red-500 rotate-180 mb-1 drop-shadow-sm" />
                        <span className="text-[16px] font-black text-gray-900">{user.idMetric || 0}%</span>
                        <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wide mt-0.5">Drenos</span>
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
                    <div className="bg-white border-2 border-b-4 border-gray-300 rounded-3xl p-5 shadow-lg relative overflow-hidden">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-black text-[16px] text-gray-900 uppercase">Jornada da Arena</h3>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.push('/journey')}
                                className="text-[12px] font-black uppercase text-blue-700 border-2 border-b-4 border-blue-200 rounded-xl hover:bg-blue-50 h-8"
                            >
                                Ver Mapa
                            </Button>
                        </div>

                        <div className="flex items-center gap-4 mb-4 p-4 bg-blue-50 rounded-2xl border-2 border-b-4 border-blue-200 shadow-inner">
                            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center border-2 border-b-4 border-black/20", currentStepData.color)}>
                                <currentStepData.icon className="w-6 h-6 text-white drop-shadow-md" />
                            </div>
                            <div className="flex-1">
                                <p className="font-black text-[15px] text-gray-900 uppercase">Degrau {displayStep}</p>
                                <p className="text-[12px] text-gray-600 font-bold mt-0.5 uppercase">Fase {displayPhase}</p>
                            </div>
                            <ArrowRight className="w-5 h-5 text-gray-400" />
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
                        className="group relative bg-[#16a34a] border-2 border-[#14532d] border-b-8 rounded-3xl p-6 overflow-hidden cursor-pointer shadow-xl active:translate-y-[4px] active:border-b-4 transition-all"
                    >
                        <div className="absolute inset-0 bg-white/10 shadow-[inset_0_4px_10px_rgba(255,255,255,0.4)] pointer-events-none" />

                        <div className="flex items-center gap-5 relative z-10">
                            <div className="w-16 h-16 bg-white/20 rounded-2xl border-2 border-white/40 border-b-4 shadow-inner flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Sparkles className="w-8 h-8 text-white drop-shadow-md" />
                            </div>

                            <div className="flex-1 min-w-0">
                                <h3 className="text-[18px] font-black text-white leading-snug mb-1 drop-shadow-md uppercase">
                                    Adicionar Recibo
                                </h3>
                                <p className="text-[13px] text-green-100 font-bold leading-snug">
                                    Escaneie e ganhe <span className="text-white font-black drop-shadow-md">+50 XP</span>
                                </p>
                            </div>

                            <ChevronRight className="w-6 h-6 text-white/80 group-hover:translate-x-1 transition-transform stroke-[3px]" />
                        </div>
                    </div>
                </motion.section>

                {/* 5. QUICK ACTIONS */}
                <motion.section
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <div className="grid grid-cols-2 gap-3">
                        {QUICK_ACTIONS.map((action) => (
                            <button
                                key={action.label}
                                onClick={() => router.push(action.href)}
                                className="group bg-white rounded-2xl p-4 flex items-center gap-3.5 border-2 border-b-4 border-gray-200 shadow-md active:border-b-2 active:translate-y-[2px] transition-all text-left"
                            >
                                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center border-2 border-b-4 border-black/10 shadow-inner", action.bg)}>
                                    <action.icon className={cn("w-6 h-6 drop-shadow-xs", action.color)} />
                                </div>
                                <span className="text-[15px] font-black text-gray-800 uppercase tracking-wide">
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
