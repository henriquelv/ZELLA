"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserStoreHydrated, useUserStore } from "@/store/useStore";
import { BottomNav } from "@/components/ui/bottom-nav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Flame,
    Coins,
    Trophy,
    Clock,
    AlertCircle,
    PiggyBank,
    Map as MapIcon,
    GamepadIcon,
    Sparkles,
    Users,
    CheckCircle2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { steps } from "@/data/steps";
import { cn } from "@/lib/utils";
import { AppHeader } from "@/components/ui/app-header";

import { PageLoader } from "@/components/ui/page-loader";

const QUICK_ACTIONS = [
    { label: "Controle", icon: PiggyBank, href: "/finances", color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Jornada", icon: MapIcon, href: "/journey", color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Missões", icon: GamepadIcon, href: "/missions", color: "text-violet-500", bg: "bg-violet-500/10" },
    { label: "Social", icon: Users, href: "/social", color: "text-orange-500", bg: "bg-orange-500/10" },
    { label: "IA Finanças", icon: Sparkles, href: "/finances", color: "text-primary", bg: "bg-primary/10" },
    { label: "Perfil", icon: Trophy, href: "/profile", color: "text-yellow-500", bg: "bg-yellow-500/10" },
];

export default function DashboardPage() {
    const router = useRouter();
    const user = useUserStoreHydrated((state) => state);
    const checkAndApplyStreak = useUserStore((state) => state.checkAndApplyStreak);
    const [acceptedMission, setAcceptedMission] = useState(false);

    useEffect(() => {
        if (user) {
            checkAndApplyStreak();
        }
    }, [user, checkAndApplyStreak]);

    if (!user) {
        return <PageLoader message="Carregando seus dados..." />;
    }

    const currentStepData = steps.find((s) => s.id === user.currentStep) || steps[0];
    const nextStepData = steps.find((s) => s.id === user.currentStep + 1);

    const handleAcceptMission = () => {
        setAcceptedMission(true);
        // Simulate API call
        setTimeout(() => {
            // Here we would confirm with backend
        }, 500);
    };

    return (
        <div className="min-h-screen bg-background pb-28 relative overflow-x-hidden selection:bg-primary/20">
            {/* Subtle Gradient Background */}
            <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-primary/5 via-background to-background -z-10" />

            <AppHeader />

            {/* Header / Greeting */}
            <header className="px-6 pt-6 pb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold font-heading">Olá, {user.name.split(" ")[0]} 👋</h1>
                    <p className="text-sm text-muted-foreground font-medium">Vamos cuidar das suas finanças hoje.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="gap-1.5 py-1.5 px-3 bg-card border-border/50 shadow-sm">
                        <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
                        <span className="font-bold">{user.streak}</span>
                    </Badge>
                </div>
            </header>

            <main className="px-6 space-y-8">
                {/* 1. FOCUS / NEXT STEP CARD */}
                <section>
                    <Card className="border-primary/20 shadow-xl shadow-primary/5 bg-gradient-to-br from-card to-primary/5 ring-1 ring-primary/10 overflow-hidden relative">
                        <div className="absolute -right-10 -top-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
                        <CardHeader className="pb-3 relative z-10">
                            <div className="flex items-center gap-2 mb-2">
                                <Badge variant="default" className="text-[10px] uppercase tracking-wider font-bold bg-primary text-primary-foreground">
                                    Missão Atual
                                </Badge>
                            </div>
                            <CardTitle className="text-xl leading-tight">Registre o seu dia</CardTitle>
                            <CardDescription className="text-sm mt-1">
                                Anote pelo menos 1 despesa ou receita hoje para manter o controle e ganhar +20 XP.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="relative z-10">
                            <Button
                                className="w-full h-12 font-bold text-base shadow-lg shadow-primary/25 rounded-xl"
                                onClick={() => router.push("/finances")}
                            >
                                <PiggyBank className="w-5 h-5 mr-2" />
                                Adicionar Registro
                            </Button>
                        </CardContent>
                    </Card>
                </section>

                {/* 2. LEVEL STATUS CARD */}
                <section>
                    <Card className="border-border/50 shadow-md bg-card/80 backdrop-blur-sm">
                        <CardHeader className="pb-3">
                            <div className="flex justify-between items-center mb-1">
                                <Badge variant="outline" className="text-[10px] uppercase tracking-wider font-bold border-primary/20 text-primary">
                                    Nível {Math.floor(user.xp / 100) + 1}
                                </Badge>
                                <span className="text-xs text-muted-foreground font-medium">
                                    Próximo: {nextStepData?.title || "Liberdade"}
                                </span>
                            </div>
                            <CardTitle className="text-base leading-tight">{currentStepData.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <Progress value={user.xp % 100} className="h-2 bg-muted" indicatorClassName="bg-primary" />
                                <div className="flex justify-between text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                                    <span>{user.xp % 100} / 100 XP</span>
                                    <span>{100 - (user.xp % 100)} para upar</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                {/* 3. QUICK ACTIONS GRID */}
                <section>
                    <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4 px-1">
                        Acesso Rápido
                    </h2>
                    <div className="grid grid-cols-3 gap-3">
                        {QUICK_ACTIONS.map((action) => (
                            <motion.button
                                key={action.label}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => router.push(action.href)}
                                className="flex flex-col items-center justify-center py-5 px-2 rounded-2xl bg-card border border-border/50 shadow-sm hover:border-primary/30 hover:shadow-md transition-all gap-2.5 cursor-pointer min-h-[88px]"
                            >
                                <div className={cn("p-2.5 rounded-xl", action.bg)}>
                                    <action.icon className={cn("w-5 h-5", action.color)} />
                                </div>
                                <span className="text-[11px] font-bold text-foreground/80 leading-tight text-center">{action.label}</span>
                            </motion.button>
                        ))}
                    </div>
                </section>
            </main>
            <BottomNav />
        </div>
    );
}
