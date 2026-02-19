"use client";

import { useUserStoreHydrated } from "@/store/useStore";
import { BottomNav } from "@/components/ui/bottom-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { steps } from "@/data/steps";
import { Flame, Coins, Trophy, CalendarCheck } from "lucide-react";
import { motion } from "framer-motion";

export default function Dashboard() {
    const user = useUserStoreHydrated((state) => state);

    if (!user) return <div className="flex h-screen items-center justify-center">Carregando...</div>;

    const currentStepData = steps.find((s) => s.id === user.currentStep) || steps[0];
    const nextStepData = steps.find((s) => s.id === user.currentStep + 1);

    // Mock progression for demo
    const progressValue = 35;

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Header */}
            <header className="px-6 pt-12 pb-6 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-b-3xl">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <p className="text-muted-foreground font-medium">Olá, {user.name || "Viajante"}!</p>
                        <h1 className="text-2xl font-bold font-heading">Vamos evoluir hoje?</h1>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Badge variant="secondary" className="px-3 py-1 space-x-1 h-8">
                            <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
                            <span>{user.streak}</span>
                        </Badge>
                        <Badge variant="outline" className="px-3 py-1 space-x-1 h-8 bg-background">
                            <Coins className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            <span>{user.coins}</span>
                        </Badge>
                    </div>
                </div>

                {/* Challenge/Daily Mission Card */}
                <Card className="border-none shadow-lg bg-gradient-to-r from-primary to-emerald-600 text-white overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Trophy className="w-32 h-32" />
                    </div>
                    <CardContent className="p-6 relative z-10">
                        <Badge className="bg-white/20 hover:bg-white/20 text-white border-none mb-3">
                            Missão do Dia
                        </Badge>
                        <h3 className="text-xl font-bold mb-2">Resistir ao impulso</h3>
                        <p className="text-primary-foreground/90 text-sm mb-4">
                            Não compre nada não essencial hoje. Você ganha 50 moedas!
                        </p>
                        <Button size="sm" variant="secondary" className="w-full font-bold text-primary">
                            Aceitar Desafio
                        </Button>
                    </CardContent>
                </Card>
            </header>

            <main className="px-6 space-y-6 mt-4">
                {/* Current Step Progress */}
                <section>
                    <div className="flex justify-between items-baseline mb-3">
                        <h2 className="text-lg font-bold font-heading">Seu Degrau Atual</h2>
                        <Link href="/journey" className="text-sm text-primary font-medium hover:underline">
                            Ver mapa
                        </Link>
                    </div>

                    <Card>
                        <CardHeader className="pb-3 flex flex-row items-center space-y-0 gap-4">
                            <div className={`p-3 rounded-xl ${currentStepData.color} bg-opacity-10`}>
                                <currentStepData.icon className={`w-6 h-6 ${currentStepData.color.replace("bg-", "text-")}`} />
                            </div>
                            <div className="flex-1">
                                <CardTitle className="text-xl">{user.currentStep}. {currentStepData.title}</CardTitle>
                                <p className="text-xs text-muted-foreground font-medium">{currentStepData.description}</p>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-medium">
                                    <span>Progresso do nível</span>
                                    <span>{progressValue}%</span>
                                </div>
                                <Progress value={progressValue} className="h-3" />
                                <p className="text-xs text-muted-foreground pt-2">
                                    Complete 2 checklists para ir ao próximo degrau.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                {/* Quick Actions / Micro-learning */}
                <section>
                    <h2 className="text-lg font-bold font-heading mb-3">Para você</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <Card className="bg-secondary/5 border-none hover:bg-secondary/10 transition-colors cursor-pointer">
                            <CardContent className="p-4 flex flex-col items-center text-center space-y-3">
                                <div className="p-3 bg-background rounded-full shadow-sm text-secondary">
                                    <CalendarCheck className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm">Check-in</h4>
                                    <p className="text-xs text-muted-foreground">Registre gastos</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-primary/5 border-none hover:bg-primary/10 transition-colors cursor-pointer">
                            <CardContent className="p-4 flex flex-col items-center text-center space-y-3">
                                <div className="p-3 bg-background rounded-full shadow-sm text-primary">
                                    <Trophy className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm">Conquistas</h4>
                                    <p className="text-xs text-muted-foreground">Ver badges</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </section>
            </main>

            <BottomNav />
        </div>
    );
}

import Link from "next/link";
