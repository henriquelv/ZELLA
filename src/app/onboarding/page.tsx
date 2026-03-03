"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Wallet, Target, ShieldCheck, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserStoreHydrated } from "@/store/useStore";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import dynamic from "next/dynamic";

const ZLogoScene = dynamic(
    () => import("@/components/ui/3d-scenes").then(m => ({ default: m.ZLogoScene })),
    { ssr: false }
);

export default function OnboardingPage() {
    const [step, setStep] = useState(1);
    const [name, setName] = useState("");

    const router = useRouter();
    const userStore = useUserStoreHydrated((state) => state);

    const handleFinish = async () => {
        if (!name.trim()) return;
        if (!userStore) return;

        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData.session) {
            await supabase.from('profiles').update({
                name: name,
                current_step: 1
            }).eq('id', sessionData.session.user.id);
        }

        userStore.completeOnboarding(1, name);

        userStore.addGoal({
            id: crypto.randomUUID(),
            title: "Primeira Vitória",
            description: "Registre 3 gastos para a Zella AI analisar seus padrões.",
            category: "habit",
            xpReward: 100,
            completed: false,
            createdAt: new Date().toISOString()
        });

        router.push("/dashboard");
    };

    return (
        <div className="flex min-h-screen flex-col bg-[#f4f6fb] p-6 max-w-md mx-auto relative overflow-hidden">
            {/* Ambient Glow */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-0 right-0 w-[60%] h-[50%] bg-blue-400/[0.06] rounded-full blur-[120px]" />
                <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-green-400/[0.04] rounded-full blur-[100px]" />
            </div>

            <AnimatePresence mode="wait">
                {/* STEP 1: Welcome */}
                {step === 1 && (
                    <motion.div
                        key="intro"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="flex-1 flex flex-col justify-center space-y-8 relative z-10"
                    >
                        <div className="text-center space-y-4">
                            <div className="relative w-28 h-28 mx-auto mb-4">
                                <div className="absolute inset-0 bg-blue-400/10 blur-[40px] rounded-full" />
                                <div className="bg-white/70 backdrop-blur-sm border border-black/[0.05] p-3 rounded-3xl shadow-sm relative z-10">
                                    <ZLogoScene size={88} />
                                </div>
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900 leading-tight">
                                Liberdade Financeira<br />
                                <span className="bg-gradient-to-r from-[#2563eb] to-[#16a34a] bg-clip-text text-transparent">Estratégica.</span>
                            </h1>
                            <p className="text-gray-500 text-[15px] leading-relaxed max-w-[280px] mx-auto">
                                A Zella transforma o caos em resiliência com inteligência artificial.
                            </p>
                        </div>

                        {/* Features grid */}
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { title: "Gastar Melhor", icon: Wallet, color: "text-blue-600", bg: "bg-blue-50" },
                                { title: "Microvitórias", icon: Sparkles, color: "text-emerald-600", bg: "bg-emerald-50" },
                                { title: "Crédito Elite", icon: Target, color: "text-purple-600", bg: "bg-purple-50" },
                                { title: "Plano Zella", icon: ShieldCheck, color: "text-orange-600", bg: "bg-orange-50" },
                            ].map(p => (
                                <div key={p.title} className="bg-white/70 backdrop-blur-sm border border-black/[0.05] p-4 rounded-2xl flex items-center gap-3 shadow-sm">
                                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", p.bg)}>
                                        <p.icon className={cn("w-5 h-5", p.color)} />
                                    </div>
                                    <span className="font-semibold text-[13px] text-gray-700">{p.title}</span>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-3 pt-4">
                            <p className="text-center text-[12px] text-gray-400">
                                🔒 Privacidade blindada. Dados criptografados.
                            </p>

                            <Button
                                className="w-full h-14 rounded-2xl text-[15px] font-bold shadow-md bg-gradient-to-r from-[#2563eb] to-[#1e40af] text-white hover:opacity-95 active:scale-[0.98] transition-all border-0"
                                onClick={() => setStep(2)}
                            >
                                <Sparkles className="w-4 h-4 mr-2" />
                                Começar
                            </Button>
                        </div>
                    </motion.div>
                )}

                {/* STEP 2: Name */}
                {step === 2 && (
                    <motion.div
                        key="name"
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -30 }}
                        className="flex-1 flex flex-col justify-center space-y-10 relative z-10"
                    >
                        <div className="space-y-3 text-center">
                            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Trophy className="w-8 h-8 text-[#2563eb]" />
                            </div>
                            <h2 className="text-3xl font-bold text-gray-900 leading-tight">
                                Como devemos te chamar?
                            </h2>
                            <p className="text-gray-500 text-[14px] max-w-[250px] mx-auto">
                                Sua jornada lendária começa agora.
                            </p>
                        </div>

                        <div className="max-w-xs mx-auto w-full">
                            <input
                                type="text"
                                placeholder="Seu nome"
                                className="w-full text-center text-2xl font-bold border-b-2 border-gray-200 bg-transparent py-4 focus:outline-none focus:border-[#2563eb] placeholder:text-gray-300 transition-colors text-gray-900"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                autoFocus
                            />
                        </div>

                        <div className="pt-6">
                            <Button
                                className="w-full h-14 rounded-2xl text-[15px] font-bold shadow-md bg-gradient-to-r from-[#2563eb] to-[#1e40af] text-white hover:opacity-95 active:scale-[0.98] transition-all group border-0"
                                onClick={handleFinish}
                                disabled={!name.trim()}
                            >
                                Construir Legado
                                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
