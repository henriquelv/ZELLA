"use client";

import { steps } from "@/data/steps";
import { useUserStoreHydrated } from "@/store/useStore";
import { BottomNav } from "@/components/ui/bottom-nav";
import { cn } from "@/lib/utils";
import { Check, Lock } from "lucide-react";
import { motion } from "framer-motion";

export default function JourneyPage() {
    const user = useUserStoreHydrated((state) => state);

    if (!user) return <div className="flex h-screen items-center justify-center">Carregando mapa...</div>;

    return (
        <div className="min-h-screen bg-background pb-20 relative overflow-hidden">
            {/* Decorative path background (simplified for MVP) */}
            <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-border -translate-x-1/2 z-0" />

            <header className="px-6 pt-12 pb-6 text-center relative z-10 bg-background/80 backdrop-blur-sm sticky top-0">
                <h1 className="text-2xl font-bold font-heading">Sua Jornada</h1>
                <p className="text-sm text-muted-foreground">Do caos à liberdade</p>
            </header>

            <main className="px-6 space-y-12 py-8 relative z-10">
                {steps.map((step, index) => {
                    const isCompleted = step.id < user.currentStep;
                    const isCurrent = step.id === user.currentStep;
                    const isLocked = step.id > user.currentStep;
                    const isRight = index % 2 === 0; // Zig-zag layout alternate

                    return (
                        <div
                            key={step.id}
                            className={cn(
                                "flex items-center relative",
                                isRight ? "justify-start flex-row-reverse" : "justify-start"
                            )}
                        >
                            <div className={cn("w-1/2 flex", isRight ? "justify-start" : "justify-end")}>
                                {/* Empty space for zig zag */}
                            </div>

                            {/* Step Node */}
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                whileInView={{ scale: 1, opacity: 1 }}
                                viewport={{ once: true }}
                                className={cn(
                                    "absolute left-1/2 -translate-x-1/2 w-20 h-20 rounded-full flex items-center justify-center border-4 shadow-xl z-10 transition-all",
                                    isCompleted ? "bg-primary border-primary text-primary-foreground" :
                                        isCurrent ? `${step.color} border-white ring-4 ring-primary/20 scale-110` :
                                            "bg-muted border-muted-foreground/20 text-muted-foreground"
                                )}
                            >
                                {isCompleted ? (
                                    <Check className="w-8 h-8" />
                                ) : isLocked ? (
                                    <Lock className="w-6 h-6" />
                                ) : (
                                    <step.icon className="w-8 h-8 text-white" />
                                )}

                                {/* Level Number Badge */}
                                <div className="absolute -bottom-2 bg-background border px-2 py-0.5 rounded-full text-[10px] font-bold shadow-sm text-foreground">
                                    {step.id}
                                </div>
                            </motion.div>

                            {/* Text Card (Floating on side) */}
                            <div className={cn(
                                "w-1/2 p-4 pt-12 text-center",
                                isRight ? "text-left pl-12" : "text-right pr-12"
                            )}>
                                <h3 className={cn("font-bold text-sm", isLocked ? "text-muted-foreground" : "text-foreground")}>
                                    {step.title}
                                </h3>
                                <p className="text-[10px] text-muted-foreground leading-tight mt-1">
                                    {step.description}
                                </p>
                            </div>

                        </div>
                    );
                })}

                {/* End of path */}
                <div className="text-center pt-8">
                    <span className="text-4xl">🏆</span>
                    <p className="text-sm font-medium mt-2">Liberdade Financeira</p>
                </div>
            </main>

            <BottomNav />
        </div>
    );
}
