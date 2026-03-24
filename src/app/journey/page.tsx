"use client";

import { useUserStoreHydrated } from "@/store/useStore";
import { BottomNav } from "@/components/ui/bottom-nav";
import { cn } from "@/lib/utils";
import { steps } from "@/data/steps";
import { Check, Lock, Star, Trophy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { PageLoader } from "@/components/ui/page-loader";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { X } from "lucide-react";

export default function JourneyPage() {
    const user = useUserStoreHydrated((state) => state);
    const [lockedStep, setLockedStep] = useState<{ title: string } | null>(null);
    const [shakeId, setShakeId] = useState<number | null>(null);

    if (!user) {
        return <PageLoader message="Mapeando jornada..." />;
    }

    const handleStepClick = (stepId: number) => {
        if (stepId > user.currentStep) {
            setShakeId(stepId);
            setTimeout(() => setShakeId(null), 500);
            const step = steps.find(s => s.id === stepId);
            if (step) {
                setLockedStep({ title: step.title });
            }
        }
    };

    return (
        <div className="min-h-screen bg-[#f4f6fb] pb-24 relative overflow-hidden flex flex-col font-sans selection:bg-blue-500/30">
            {/* Ambient Background Lights */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[10%] left-[-10%] w-[60%] h-[50%] bg-blue-400/[0.04] rounded-full blur-[120px]" />
                <div className="absolute top-[40%] right-[-10%] w-[50%] h-[40%] bg-emerald-400/[0.03] rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[20%] w-[60%] h-[30%] bg-purple-400/[0.03] rounded-full blur-[120px]" />
            </div>

            {/* Header */}
            <header className="px-6 pt-14 pb-4 text-center relative z-10 sticky top-0 bg-white/60 backdrop-blur-lg border-b border-white/40 ring-1 ring-black/[0.01]">
                <h1 className="text-xl font-extrabold text-gray-800 uppercase tracking-tight">Sua Caminhada para a Liberdade</h1>
                <div className="flex justify-center items-center gap-1.5 text-xs text-gray-500 font-bold mt-1.5 uppercase tracking-wider">
                    <Star className="w-3.5 h-3.5 text-amber-500 drop-shadow-sm" />
                    <span>{user.xp} XP Acumulado</span>
                </div>
            </header>

            {/* Locked Step Modal */}
            <AnimatePresence>
                {lockedStep && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-end sm:items-center justify-center"
                    >
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="w-full max-w-sm bg-white/90 backdrop-blur-xl border border-white/50 shadow-2xl rounded-t-3xl sm:rounded-3xl p-6 relative text-center ring-1 ring-black/[0.02]"
                        >
                            <button onClick={() => setLockedStep(null)} className="absolute top-4 right-4 p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>

                            <div className="w-16 h-16 bg-blue-50/80 ring-1 ring-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-500 shadow-sm">
                                <Lock className="w-8 h-8 drop-shadow-sm" />
                            </div>

                            <h4 className="font-extrabold text-2xl mb-2 text-gray-800">Calma lá, passo a passo!</h4>
                            <p className="text-[13px] text-gray-500 font-medium mb-6 leading-relaxed">
                                Falta só um pouquinho de <strong className="text-amber-500 font-black">XP</strong> para você descobrir o que te aguarda em <strong className="text-gray-800">&quot;{lockedStep.title}&quot;</strong>.
                            </p>

                            <div className="bg-gray-50 rounded-2xl p-4 mb-6 text-left border border-gray-100/50 shadow-inner">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Como acelerar sua jornada?</p>
                                <ul className="text-[13px] font-bold text-gray-700 space-y-3">
                                    <li className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm" /> Registrar gastos em Finanças (-20 XP)</li>
                                    <li className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-violet-500 shadow-sm" /> Jogar minigames (+80 XP)</li>
                                    <li className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-orange-500 shadow-sm" /> Completar Metas (até +200 XP)</li>
                                </ul>
                            </div>

                            <div className="flex flex-col gap-3">
                                <Button asChild className="h-12 w-full bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 rounded-xl font-extrabold text-[13px] shadow-sm uppercase tracking-wider">
                                    <Link href="/missions">
                                        Ver minhas Missões
                                    </Link>
                                </Button>
                                <Button variant="ghost" className="h-12 w-full font-bold text-gray-500 hover:text-gray-700" onClick={() => setLockedStep(null)}>
                                    Entendi
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Map Container */}
            <main className="flex-1 relative w-full max-w-md mx-auto py-10 px-4">

                {/* Vertical Path Line (Dashed) */}
                <div className="absolute left-1/2 top-10 bottom-10 w-[3px] border-l-[3px] border-dashed border-gray-300/50 -translate-x-1/2 z-0" />

                <div className="space-y-[4.5rem] relative z-10">
                    {steps.map((step, index) => {
                        const isLocked = step.id > user.currentStep;
                        const isCompleted = step.id < user.currentStep;
                        const isCurrent = step.id === user.currentStep;
                        const isRight = index % 2 !== 0; // Zig-zag

                        return (
                            <motion.div
                                key={step.id}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-50px" }}
                                className={cn(
                                    "flex items-center w-full relative",
                                    isRight ? "flex-row-reverse" : "flex-row"
                                )}
                            >
                                {/* Step Node */}
                                <motion.div
                                    animate={shakeId === step.id ? { x: [-8, 8, -8, 8, 0] } : {}}
                                    transition={{ duration: 0.4 }}
                                    onClick={() => handleStepClick(step.id)}
                                    className={cn(
                                        "relative w-[5.5rem] h-[5.5rem] flex-shrink-0 flex flex-col items-center justify-center rounded-full border-2 transition-all cursor-pointer z-20 mx-auto shadow-xl ring-1 ring-black/[0.02] backdrop-blur-md",
                                        isCompleted ? "border-white bg-[#2563eb] text-white shadow-blue-900/20" :
                                            isCurrent ? `${step.color} border-white ring-4 ring-blue-500/20 shadow-blue-900/10 scale-110 drop-shadow-xl` :
                                                "border-white/50 bg-gray-50 text-gray-400 grayscale shadow-sm"
                                    )}
                                >
                                    {isCompleted ? (
                                        <Check className="w-10 h-10 stroke-[3] drop-shadow-sm" />
                                    ) : isLocked ? (
                                        <Lock className="w-8 h-8 opacity-40 drop-shadow-sm" />
                                    ) : (
                                        <step.icon className="w-10 h-10 text-white fill-white/20 drop-shadow-md" />
                                    )}

                                    {/* Level Badge */}
                                    <div className={cn(
                                        "absolute -bottom-2 bg-white border border-white/50 ring-1 ring-black/[0.02] px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm whitespace-nowrap",
                                        isLocked ? "text-gray-400 bg-gray-50" : "text-[#2563eb]"
                                    )}>
                                        Nível {step.id}
                                    </div>
                                </motion.div>

                                {/* Connection Line to Text */}
                                <div className={cn(
                                    "absolute top-1/2 h-[3px] w-[25%] bg-gray-300/50 -z-10 rounded-full",
                                    isRight ? "right-[50%] mr-11" : "left-[50%] ml-11"
                                )} />

                                {/* Text Card */}
                                <div className={cn(
                                    "absolute w-[40%] text-center",
                                    isRight ? "left-0 text-right pr-2" : "right-0 text-left pl-2"
                                )}>
                                    <h3 className={cn(
                                        "font-extrabold text-[15px] leading-tight mb-1",
                                        isLocked ? "text-gray-400" : "text-gray-800"
                                    )}>{step.title}</h3>

                                    {isCurrent && (
                                        <Badge variant="secondary" className="text-[9px] h-5 px-2 bg-blue-50 border-blue-100 text-[#2563eb] shadow-sm uppercase tracking-widest font-black inline-flex">
                                            Conquistando agora
                                        </Badge>
                                    )}

                                    {!isLocked && !isCurrent && !isCompleted && (
                                        <span className="text-[11px] text-gray-500 font-medium block">
                                            {step.description}
                                        </span>
                                    )}

                                    {isCompleted && (
                                        <div className="flex justify-start gap-1 mt-1.5 opacity-60">
                                            {[1, 2, 3].map(i => (
                                                <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#2563eb] shadow-sm" />
                                            ))}
                                        </div>
                                    )}
                                </div>

                            </motion.div>
                        );
                    })}

                    {/* Final Trophy */}
                    <div className="flex flex-col items-center justify-center pt-8 pb-12 relative z-20">
                        <div className="w-24 h-24 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center shadow-xl border border-white ring-1 ring-black/[0.02] relative group">
                            <div className="absolute inset-2 bg-gradient-to-t from-yellow-100 to-amber-50 rounded-full flex items-center justify-center border border-yellow-200">
                                <Trophy className="w-10 h-10 text-amber-500 drop-shadow-sm group-hover:scale-110 transition-transform duration-500" />
                            </div>
                        </div>
                        <p className="mt-4 font-black text-amber-500 text-lg uppercase tracking-tight drop-shadow-sm">Liberdade!</p>
                    </div>
                </div>

            </main>

            <BottomNav />
        </div>
    );
}
