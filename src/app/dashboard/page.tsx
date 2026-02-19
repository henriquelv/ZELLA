"use client";

import { useUserStoreHydrated } from "@/store/useStore";
import { BottomNav } from "@/components/ui/bottom-nav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Flame, Coins, Trophy, Clock, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

import Link from "next/link";
import { steps } from "@/data/steps";

export default function DashboardPage() {
    const user = useUserStoreHydrated((state) => state);

    // Fallback for hydration
    if (!user) return <div className="min-h-screen bg-background" />;

    const currentStepData = steps.find((s) => s.id === user.currentStep) || steps[0];
    const nextStepData = steps.find((s) => s.id === user.currentStep + 1);

    // Simulated Logic for 48h check (Mocked)
    const lastEntryTime = new Date().getTime(); // ongoing mock
    const hoursSinceEntry = 0; // Mock: 0 hours
    const isNudgeMode = hoursSinceEntry > 48;

    const mission = isNudgeMode
        ? { title: "Sinal de Vida!", desc: "Registre qualquer coisa. Sério. Só pra saber que você tá vivo.", reward: 20, time: "30s", icon: AlertCircle }
        : { title: "Onde está o ralo?", desc: "Identifique 1 gasto que você fez hoje e não precisava.", reward: 50, time: "1 min", icon: Trophy };

    return (
        <div className="min-h-screen bg-background pb-24 relative overflow-x-hidden">
            {/* Dynamic Background */}
            <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-primary/10 to-transparent -z-10" />

            {/* Header / Greeting */}
            <header className="px-6 pt-12 pb-6 flex justify-between items-center">
                <div>
                    <p className="text-sm text-muted-foreground/80 font-medium">Bora, {user.name} 🚀</p>
                    <h1 className="text-2xl font-bold font-heading">Visão Geral</h1>
                </div>
                <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="gap-1.5 py-1.5 px-3 bg-card/50 backdrop-blur border-border/50">
                        <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
                        <span className="font-bold">{user.streak} dias</span>
                    </Badge>
                    <Badge variant="secondary" className="gap-1.5 py-1.5 px-3 bg-card/50 backdrop-blur border-border/50">
                        <Coins className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="font-bold">{user.coins}</span>
                    </Badge>
                </div>
            </header>

            <main className="px-6 space-y-6">
                {/* 1. LEVEL STATUS CARD */}
                <section>
                    <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/50 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-center mb-1">
                                <Badge variant="outline" className="text-[10px] uppercase tracking-wider border-primary/30 text-primary">
                                    Degrau {user.currentStep}
                                </Badge>
                                <span className="text-xs text-muted-foreground font-medium">
                                    Próx: {nextStepData?.title || "Liberdade"}
                                </span>
                            </div>
                            <CardTitle className="text-xl">{currentStepData.title}</CardTitle>
                            <CardDescription className="line-clamp-1">{currentStepData.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <Progress value={user.xp % 100} className="h-2.5 bg-secondary/20" indicatorClassName="bg-gradient-to-r from-primary to-emerald-400" />
                                <div className="flex justify-between text-xs text-muted-foreground font-medium">
                                    <span>{user.xp % 100} / 100 XP</span>
                                    <span>Nível {Math.floor(user.xp / 100) + 1}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                {/* 2. MISSION OF THE DAY (HERO) */}
                <section>
                    <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 ml-1">
                        Sua Missão Hoje
                    </h2>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Card className="border-primary/20 shadow-xl shadow-primary/5 bg-gradient-to-br from-card to-primary/5 relative overflow-hidden ring-1 ring-primary/10">
                            <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                                {/* 3D Icon Placeholder */}
                                <div className="w-16 h-16 bg-gradient-to-tr from-yellow-400 to-orange-500 rounded-2xl rotate-3 shadow-lg flex items-center justify-center mb-2">
                                    <mission.icon className="w-8 h-8 text-white stroke-[2.5]" />
                                </div>

                                <div className="space-y-1">
                                    <h3 className="text-xl font-bold font-heading">{mission.title}</h3>
                                    <p className="text-sm text-muted-foreground max-w-[240px] mx-auto leading-relaxed">
                                        {mission.desc}
                                    </p>
                                </div>

                                <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground w-full justify-center pt-2">
                                    <div className="flex items-center gap-1.5 bg-background/50 px-3 py-1.5 rounded-full">
                                        <Coins className="w-3.5 h-3.5 text-yellow-500" />
                                        +{mission.reward}
                                    </div>
                                    <div className="flex items-center gap-1.5 bg-background/50 px-3 py-1.5 rounded-full">
                                        <Clock className="w-3.5 h-3.5 text-blue-500" />
                                        {mission.time}
                                    </div>
                                </div>

                                <Button className="w-full mt-4 bg-primary text-primary-foreground font-bold rounded-xl h-12 shadow-lg shadow-primary/20">
                                    Aceitar Desafio
                                </Button>
                            </CardContent>
                        </Card>
                    </motion.div>
                </section>

                {/* 3. QUICK ACTIONS */}
                {/*  <div className="grid grid-cols-2 gap-4">
             Placeholder for future widgets 
        </div> */}
            </main>

            {/* FLOATING ACTION BUTTON */}
            <div className="fixed bottom-24 right-6 z-40">
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-14 h-14 bg-gradient-to-r from-primary to-emerald-500 rounded-full shadow-2xl shadow-primary/30 flex items-center justify-center text-white"
                >
                    <Plus className="w-8 h-8" />
                </motion.button>
            </div>

            <BottomNav />
        </div>
    );
}
