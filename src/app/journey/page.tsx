"use client";

import { useUserStoreHydrated } from "@/store/useStore";
import { BottomNav } from "@/components/ui/bottom-nav";
import { cn } from "@/lib/utils";
import { steps } from "@/data/steps";
import { Check, Lock, Star, Trophy } from "lucide-react";
import { motion } from "framer-motion";

// Actually, I don't have sonner installed. I'll use a simple state for alert.
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

export default function JourneyPage() {
    const user = useUserStoreHydrated((state) => state);
    const [alert, setAlert] = useState<string | null>(null);

    if (!user) return <div className="min-h-screen bg-background" />;

    const handleStepClick = (stepId: number) => {
        if (stepId > user.currentStep) {
            const step = steps.find(s => s.id === stepId);
            setAlert(`🔒 Bloqueado! Complete o Degrau ${user.currentStep} para acessar "${step?.title}".`);
            setTimeout(() => setAlert(null), 3000);
        }
    };

    return (
        <div className="min-h-screen bg-background pb-24 relative overflow-hidden flex flex-col">
            {/* Background */}
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background -z-10" />

            {/* Header */}
            <header className="px-6 pt-12 pb-2 text-center relative z-10 sticky top-0 bg-background/80 backdrop-blur-md border-b border-border/50">
                <h1 className="text-xl font-bold font-heading">Sua Jornada</h1>
                <div className="flex justify-center items-center gap-2 text-xs text-muted-foreground mt-1">
                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                    <span>{user.xp} XP acumulado</span>
                </div>
            </header>

            {/* Alert Toast */}
            {alert && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="fixed top-28 left-6 right-6 z-50 bg-destructive text-destructive-foreground px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-center"
                >
                    {alert}
                </motion.div>
            )}

            {/* Map Container */}
            <main className="flex-1 relative w-full max-w-md mx-auto py-10 px-4">

                {/* Vertical Path Line (Dashed) */}
                <div className="absolute left-1/2 top-10 bottom-10 w-0.5 border-l-2 border-dashed border-border/50 -translate-x-1/2 z-0" />

                <div className="space-y-16 relative z-10">
                    {steps.map((step, index) => {
                        const isLocked = step.id > user.currentStep;
                        const isCompleted = step.id < user.currentStep;
                        const isCurrent = step.id === user.currentStep;
                        const isRight = index % 2 !== 0; // Zig-zag

                        return (
                            <motion.div
                                key={step.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-50px" }}
                                className={cn(
                                    "flex items-center w-full relative",
                                    isRight ? "flex-row-reverse" : "flex-row"
                                )}
                            >
                                {/* Step Node */}
                                <div
                                    onClick={() => handleStepClick(step.id)}
                                    className={cn(
                                        "relative w-24 h-24 flex-shrink-0 flex flex-col items-center justify-center rounded-full border-4 shadow-2xl transition-all cursor-pointer z-20 mx-auto bg-background",
                                        isCompleted ? "border-primary text-primary" :
                                            isCurrent ? `${step.color} border-white ring-4 ring-primary/20 scale-110` :
                                                "border-muted-foreground/20 bg-muted text-muted-foreground grayscale"
                                    )}
                                >
                                    {isCompleted ? (
                                        <Check className="w-10 h-10 stroke-[3]" />
                                    ) : isLocked ? (
                                        <Lock className="w-8 h-8 opacity-50" />
                                    ) : (
                                        <step.icon className="w-10 h-10 text-white fill-white/20" />
                                    )}

                                    {/* Level Badge */}
                                    <div className="absolute -bottom-3 bg-card border px-2 py-0.5 rounded-full text-[10px] font-bold shadow-sm whitespace-nowrap">
                                        Nível {step.id}
                                    </div>
                                </div>

                                {/* Connection Line to Text */}
                                <div className={cn(
                                    "absolute top-1/2 h-0.5 w-[30%] bg-border/50 -z-10",
                                    isRight ? "right-[50%] mr-12" : "left-[50%] ml-12"
                                )} />

                                {/* Text Card */}
                                <div className={cn(
                                    "absolute w-[40%] text-center",
                                    isRight ? "left-0 text-right pr-2" : "right-0 text-left pl-2"
                                )}>
                                    <h3 className={cn(
                                        "font-bold text-sm leading-tight mb-1",
                                        isLocked && "text-muted-foreground"
                                    )}>{step.title}</h3>

                                    {isCurrent && (
                                        <Badge variant="secondary" className="text-[10px] h-5 px-1.5 bg-primary/10 text-primary border-primary/20">
                                            Em progresso
                                        </Badge>
                                    )}

                                    {!isLocked && !isCurrent && !isCompleted && (
                                        <span className="text-[10px] text-muted-foreground block">
                                            {step.description}
                                        </span>
                                    )}

                                    {isCompleted && (
                                        <div className="flex justify-start gap-0.5 mt-1">
                                            {[1, 2, 3].map(i => (
                                                <div key={i} className="w-1.5 h-1.5 rounded-full bg-primary" />
                                            ))}
                                        </div>
                                    )}
                                </div>

                            </motion.div>
                        );
                    })}

                    {/* Final Trophy */}
                    <div className="flex flex-col items-center justify-center pt-8 pb-12 relative z-20">
                        <div className="w-20 h-20 bg-gradient-to-t from-yellow-400 to-yellow-200 rounded-full flex items-center justify-center shadow-xl shadow-yellow-500/20 animate-pulse">
                            <Trophy className="w-10 h-10 text-yellow-700" />
                        </div>
                        <p className="mt-4 font-bold text-yellow-500 font-heading text-lg">Liberdade!</p>
                    </div>
                </div>

            </main>

            <BottomNav />
        </div>
    );
}
