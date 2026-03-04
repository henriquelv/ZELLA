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

    const currentStepData = steps.find((s) => s.id === user.currentStep) || steps[0];
    const nextStepData = steps.find((s) => s.id === user.currentStep + 1);
    const currentLevel = user.level || 1;
    const xpNeeded = Math.floor(100 * Math.pow(currentLevel, 1.2));
    const xpProgress = Math.min(100, Math.floor((user.xp / xpNeeded) * 100));

    return (
        <div className="min-h-screen bg-[#f4f6fb] pb-24 relative overflow-x-hidden">
            {/* Aurora ambient — very subtle */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] bg-blue-400/[0.06] rounded-full blur-[100px]" />
                <div className="absolute bottom-[10%] right-[-10%] w-[40%] h-[40%] bg-green-400/[0.04] rounded-full blur-[100px]" />
            </div>

            <AppHeader />

            <main className="px-5 space-y-5 mt-4 max-w-lg mx-auto relative z-10">
                {/* 1. HERO MISSION SUMMARY */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Link href="/profile" className="block bg-white/70 backdrop-blur-sm border border-black/[0.05] rounded-3xl p-5 shadow-sm hover:border-[#2563eb]/30 transition-colors">
                        <div className="flex items-center gap-4">
                            {/* Level circle like mockup */}
                            <div className="w-14 h-14 rounded-full border-[3px] border-[#2563eb] flex items-center justify-center shrink-0">
                                <span className="text-lg font-bold text-[#2563eb]">{currentLevel}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-0.5">
                                    <div>
                                        <h3 className="font-bold text-[15px] text-gray-900 leading-tight">
                                            {currentStepData.title}
                                        </h3>
                                        <p className="text-[12px] text-gray-400 mt-0.5">
                                            Level {currentLevel}, <span className="font-medium text-gray-500">{user.xp}/{xpNeeded} XP</span>
                                        </p>
                                    </div>
                                    <span className="text-[13px] font-bold text-[#2563eb]">{xpProgress}%</span>
                                </div>
                                {/* Progress bar */}
                                <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden mt-2">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${xpProgress}%` }}
                                        transition={{ duration: 1, ease: "easeOut" }}
                                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#2563eb] to-[#16a34a] rounded-full"
                                    />
                                </div>
                                <div className="flex items-center justify-between mt-2">
                                    <p className="text-[11px] text-gray-400">
                                        Degrau Atual: <span className="font-semibold text-gray-600">{currentStepData.title}</span>
                                    </p>
                                    <span className="text-[10px] uppercase font-bold text-[#2563eb] bg-blue-50 px-2 py-0.5 rounded-full">Ver Perfil</span>
                                </div>
                            </div>
                        </div>
                    </Link>
                </motion.div>

                {/* 1.1 — STREAK + METRICS ROW */}
                <motion.section
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08 }}
                    className="grid grid-cols-4 gap-2.5"
                >
                    <div className="bg-white/70 backdrop-blur-sm border border-black/[0.05] rounded-2xl p-3.5 flex flex-col items-center text-center shadow-sm">
                        <Flame className="w-5 h-5 text-orange-500 mb-1.5" />
                        <span className="text-[15px] font-bold text-gray-900">{user.streak}d</span>
                        <span className="text-[9px] text-gray-400 font-medium uppercase tracking-wide mt-0.5">Streak</span>
                    </div>
                    <div className="bg-white/70 backdrop-blur-sm border border-black/[0.05] rounded-2xl p-3.5 flex flex-col items-center text-center shadow-sm">
                        <Zap className="w-5 h-5 text-[#2563eb] mb-1.5" />
                        <span className="text-[15px] font-bold text-gray-900">{user.ie || 0}%</span>
                        <span className="text-[9px] text-gray-400 font-medium uppercase tracking-wide mt-0.5">Eficiência</span>
                    </div>
                    <div className="bg-white/70 backdrop-blur-sm border border-black/[0.05] rounded-2xl p-3.5 flex flex-col items-center text-center shadow-sm">
                        <ShieldCheck className="w-5 h-5 text-[#16a34a] mb-1.5" />
                        <span className="text-[15px] font-bold text-gray-900">{user.is || 0}%</span>
                        <span className="text-[9px] text-gray-400 font-medium uppercase tracking-wide mt-0.5">Sobreviv.</span>
                    </div>
                    <div className="bg-white/70 backdrop-blur-sm border border-black/[0.05] rounded-2xl p-3.5 flex flex-col items-center text-center shadow-sm">
                        <TrendingUp className="w-5 h-5 text-red-500 rotate-180 mb-1.5" />
                        <span className="text-[15px] font-bold text-gray-900">{user.idMetric || 0}%</span>
                        <span className="text-[9px] text-gray-400 font-medium uppercase tracking-wide mt-0.5">Drenos</span>
                    </div>
                </motion.section>

                {/* 2. AI INSIGHTS */}
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

                {/* 3. JOURNEY PROGRESS — Like mockup mission cards */}
                <motion.section
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="bg-white/70 backdrop-blur-sm border border-black/[0.05] rounded-3xl p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-[15px] text-gray-900">Sua Jornada</h3>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.push('/journey')}
                                className="text-[12px] font-semibold text-[#2563eb] h-8 px-3 rounded-full hover:bg-blue-50"
                            >
                                Ver mapa <ChevronRight className="w-3.5 h-3.5 ml-1" />
                            </Button>
                        </div>

                        <div className="flex items-center gap-4 mb-4 p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm", currentStepData.color)}>
                                <currentStepData.icon className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                                <p className="font-bold text-[14px] text-gray-900">Degrau {user.currentStep}</p>
                                <p className="text-[12px] text-gray-500 mt-0.5">{currentStepData.title}</p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-gray-300" />
                        </div>

                        <div className="space-y-2">
                            {currentStepData.checkpoints.slice(0, 3).map((cp, i) => (
                                <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50/50 transition-colors">
                                    <div className="w-5 h-5 rounded-full border-2 border-gray-200 shrink-0" />
                                    <span className="text-[13px] text-gray-600">{cp}</span>
                                </div>
                            ))}
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
                        className="group relative bg-gradient-to-br from-[#2563eb] to-[#1e40af] rounded-3xl p-6 overflow-hidden cursor-pointer shadow-lg shadow-blue-500/15 hover:shadow-xl transition-all active:scale-[0.98]"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-transparent pointer-events-none" />

                        <div className="flex items-center gap-5 relative z-10">
                            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform border border-white/20">
                                <Sparkles className="w-7 h-7 text-white" />
                            </div>

                            <div className="flex-1 min-w-0">
                                <h3 className="text-[16px] font-bold text-white leading-snug mb-1">
                                    Mapeie seu 1º Recibo
                                </h3>
                                <p className="text-[13px] text-white/70 leading-snug">
                                    Escaneie e ganhe <span className="text-white font-bold">50 XP</span>
                                </p>
                            </div>

                            <ChevronRight className="w-5 h-5 text-white/60 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>
                </motion.section>

                {/* 5. QUICK ACTIONS */}
                <motion.section
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <div className="grid grid-cols-2 gap-2.5">
                        {QUICK_ACTIONS.map((action) => (
                            <button
                                key={action.label}
                                onClick={() => router.push(action.href)}
                                className="group bg-white/70 backdrop-blur-sm border border-black/[0.05] flex items-center gap-3.5 p-4 rounded-2xl shadow-sm hover:shadow-md hover:bg-white/90 transition-all text-left active:scale-[0.97]"
                            >
                                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", action.bg)}>
                                    <action.icon className={cn("w-5 h-5", action.color)} />
                                </div>
                                <span className="text-[14px] font-semibold text-gray-700">
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
