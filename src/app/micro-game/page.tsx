"use client";

import { useState } from "react";
import { useUserStoreHydrated } from "@/store/useStore";
import { BottomNav } from "@/components/ui/bottom-nav";
import { motion, useMotionValue, useTransform, useAnimation, PanInfo } from "framer-motion";
import { X, Check, AlertTriangle, Trophy, ArrowRight, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Mock Data for the Game
const EXPENSES = [
    { id: 1, title: "Netflix", value: 55.90, type: "lifestyle" },
    { id: 2, title: "Aluguel", value: 1200.00, type: "survival" },
    { id: 3, title: "iFood (Burger)", value: 89.00, type: "lifestyle" },
    { id: 4, title: "Conta de Luz", value: 150.00, type: "survival" },
    { id: 5, title: "Uber p/ Bar", value: 45.00, type: "lifestyle" },
];

export default function MicroGamePage() {
    const user = useUserStoreHydrated((state) => state);
    const [cards, setCards] = useState(EXPENSES);
    const [results, setResults] = useState<{ essential: number; optional: number }>({ essential: 0, optional: 0 });
    const [gameOver, setGameOver] = useState(false);
    const [nudge, setNudge] = useState<string | null>(null); // Puxão de Orelha state

    // Animation controls for the top card
    const x = useMotionValue(0);
    const rotate = useTransform(x, [-200, 200], [-30, 30]);
    const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);
    const bg = useTransform(x, [-100, 0, 100], ["rgba(239, 68, 68, 0.2)", "rgba(0,0,0,0)", "rgba(16, 185, 129, 0.2)"]);
    const controls = useAnimation();

    if (!user) return <div className="min-h-screen bg-background" />;

    // Game Over / Summary Screen
    if (gameOver) {
        const total = results.essential + results.optional;
        const lifestylePct = total > 0 ? Math.round((results.optional / total) * 100) : 0;
        const isGood = lifestylePct <= 30; // Mock goal: < 30% lifestyle

        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center space-y-6">
                <motion.div
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    className="w-24 h-24 bg-gradient-to-tr from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-xl shadow-yellow-500/30"
                >
                    <Trophy className="w-12 h-12 text-white" />
                </motion.div>

                <div className="space-y-2">
                    <h1 className="text-3xl font-bold font-heading">Raio-X Completo!</h1>
                    <p className="text-muted-foreground">Você classificou {total} gastos hoje.</p>
                </div>

                <Card className="w-full max-w-sm border-none bg-muted/30">
                    <CardContent className="p-6 space-y-4">
                        <div className="space-y-1">
                            <div className="flex justify-between text-sm font-medium">
                                <span>Gasto de Vida (Essencial)</span>
                                <span>R$ {results.essential.toFixed(2)}</span>
                            </div>
                            <Progress value={100 - lifestylePct} className="h-2 bg-muted" indicatorClassName="bg-emerald-500" />
                        </div>

                        <div className="space-y-1">
                            <div className="flex justify-between text-sm font-medium">
                                <span className={cn(isGood ? "text-primary" : "text-destructive")}>
                                    Estilo de Vida (Desejos)
                                </span>
                                <span>R$ {results.optional.toFixed(2)}</span>
                            </div>
                            <Progress value={lifestylePct} className="h-2 bg-muted" indicatorClassName={isGood ? "bg-primary" : "bg-destructive"} />
                            <p className="text-xs text-right text-muted-foreground pt-1">{lifestylePct}% do total</p>
                        </div>
                    </CardContent>
                </Card>

                <div className="bg-card border p-4 rounded-xl text-sm max-w-sm">
                    {isGood ? "Mandou bem! Você está vivendo dentro da meta." : "⚠️ Alerta Vermelho! Você está gastando muito com desejos. Tenta cortar um 'iFood'."}
                </div>

                <div className="flex gap-4 w-full max-w-sm">
                    <Link href="/dashboard" className="w-full">
                        <Button className="w-full" variant="outline"> <ArrowRight className="mr-2 w-4 h-4" /> Voltar </Button>
                    </Link>
                    <Button className="w-full" onClick={() => window.location.reload()}> <RotateCcw className="mr-2 w-4 h-4" /> Jogar + </Button>
                </div>
            </div>
        );
    }

    const currentCard = cards[0];

    const handleDragEnd = async (event: any, info: PanInfo) => {
        const offset = info.offset.x;
        const velocity = info.velocity.x;

        if (offset > 100 || velocity > 800) {
            await handleChoose("essential");
        } else if (offset < -100 || velocity < -800) {
            await handleChoose("optional");
        } else {
            controls.start({ x: 0, opacity: 1 });
        }
    };

    const handleChoose = async (choice: "essential" | "optional") => {
        // 1. Zella Nudge Logic (Puxão de Orelha)
        if (choice === "essential" && currentCard.type === "lifestyle" && !nudge) {
            // User put a luxury item in essential -> Trigger Nudge
            setNudge("Zella: Tem certeza que isso é essencial? Você morre sem isso?");
            controls.start({ x: 0 }); // Reset card
            return;
        }

        // 2. Animate out
        await controls.start({ x: choice === "essential" ? 500 : -500, opacity: 0 });

        // 3. Update Stats
        setResults(prev => ({
            ...prev,
            [choice]: prev[choice] + currentCard.value
        }));

        // 4. Remove Card or End Game
        setNudge(null);
        x.set(0);

        if (cards.length > 1) {
            setCards(prev => prev.slice(1));
        } else {
            setGameOver(true);
            user.addXp(150); // Reward
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-between py-12 px-6 overflow-hidden relative">
            <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-destructive via-background to-emerald-500 opacity-50" />

            {/* HUD */}
            <div className="w-full max-w-sm flex justify-between items-center">
                <div className="text-center">
                    <span className="text-xs font-bold text-destructive uppercase tracking-wider block">Desejo</span>
                    <ArrowRight className="w-4 h-4 text-destructive rotate-180 mx-auto" />
                </div>
                <Badge variant="outline" className="bg-background/50 backdrop-blur">
                    {cards.length} restantes
                </Badge>
                <div className="text-center">
                    <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider block">Essencial</span>
                    <ArrowRight className="w-4 h-4 text-emerald-500 mx-auto" />
                </div>
            </div>

            {/* CARD STACK */}
            <div className="relative w-full max-w-xs aspect-[3/4] flex items-center justify-center">
                {/* Visual Stack Back Cards */}
                {cards.length > 1 && (
                    <div className="absolute top-4 w-full h-full bg-card border rounded-3xl scale-[0.95] opacity-50 z-0 shadow-sm" />
                )}
                {cards.length > 2 && (
                    <div className="absolute top-8 w-full h-full bg-card border rounded-3xl scale-[0.9] opacity-30 -z-10 shadow-sm" />
                )}

                {/* Active Card */}
                {currentCard && (
                    <motion.div
                        style={{ x, rotate, opacity }}
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        onDragEnd={handleDragEnd}
                        animate={controls}
                        className="absolute w-full h-full z-10 cursor-grab active:cursor-grabbing"
                    >
                        <motion.div style={{ backgroundColor: bg }} className="w-full h-full rounded-3xl absolute inset-0 z-20 pointer-events-none transition-colors" />

                        <Card className="w-full h-full rounded-3xl border-2 shadow-2xl flex flex-col items-center justify-center p-8 text-center bg-card select-none">
                            {/* Nudge Overlay */}
                            {nudge && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                                    className="absolute inset-0 bg-background/95 z-50 flex flex-col items-center justify-center p-6 text-center rounded-3xl"
                                >
                                    <AlertTriangle className="w-12 h-12 text-yellow-500 mb-4" />
                                    <p className="font-bold text-lg mb-6">{nudge}</p>
                                    <div className="grid gap-3 w-full">
                                        <Button variant="destructive" onClick={() => handleChoose("optional")}>
                                            É Desejo (Menti)
                                        </Button>
                                        <Button variant="outline" onClick={() => { setNudge(null); handleChoose("essential"); }}>
                                            É Essencial (Juro!)
                                        </Button>
                                    </div>
                                </motion.div>
                            )}

                            <div className="flex-1 flex flex-col items-center justify-center space-y-6">
                                <div className="p-4 bg-muted rounded-2xl">
                                    <h2 className="text-3xl font-bold font-heading">{currentCard.title}</h2>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-sm text-muted-foreground font-medium uppercase">Valor</span>
                                    <p className="text-4xl font-bold text-primary">
                                        R$ {currentCard.value.toFixed(2)}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-auto pt-8 flex gap-2 w-full text-xs text-muted-foreground font-medium justify-center opacity-50">
                                <ArrowRight className="w-4 h-4 rotate-180" />
                                <span>Arraste para classificar</span>
                                <ArrowRight className="w-4 h-4" />
                            </div>
                        </Card>
                    </motion.div>
                )}
            </div>

            {/* CONTROLS (For accessibility/desktop) */}
            <div className="flex gap-6 z-10 mt-8">
                <Button size="lg" variant="outline" className="h-16 w-16 rounded-full border-destructive/50 text-destructive hover:bg-destructive/10" onClick={() => handleChoose("optional")}>
                    <X className="w-8 h-8" />
                </Button>
                <Button size="lg" variant="outline" className="h-16 w-16 rounded-full border-emerald-500/50 text-emerald-500 hover:bg-emerald-500/10" onClick={() => handleChoose("essential")}>
                    <Check className="w-8 h-8" />
                </Button>
            </div>
        </div>
    );
}
