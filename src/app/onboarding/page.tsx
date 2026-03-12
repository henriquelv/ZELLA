"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Wallet, Target, ShieldCheck, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserStoreHydrated } from "@/store/useStore";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { supabase } from "@/lib/supabase";


export default function OnboardingPage() {
    const [step, setStep] = useState(1);
    const [name, setName] = useState("");
    const [revenue, setRevenue] = useState("");
    const [fixedCosts, setFixedCosts] = useState("");

    const router = useRouter();
    const userStore = useUserStoreHydrated((state) => state);

    const handleFinish = async () => {
        if (!name.trim() || !revenue.trim() || !fixedCosts.trim()) return;
        if (!userStore) return;

        const parsedRevenue = parseFloat(revenue.replace(/[^\d.,]/g, "").replace(",", "."));
        const parsedFixedCosts = parseFloat(fixedCosts.replace(/[^\d.,]/g, "").replace(",", "."));
        if (isNaN(parsedRevenue) || parsedRevenue <= 0 || isNaN(parsedFixedCosts) || parsedFixedCosts < 0) return;

        // --- Lógica Inicial de Pareamento (LogicaBack Simplificada para Onboarding) ---
        const ie = ((parsedRevenue - parsedFixedCosts) / parsedRevenue) * 100;
        const is = (parsedFixedCosts / parsedRevenue) * 100;

        let initialStep = 1;
        if (ie >= 20 && is <= 50) initialStep = 5;
        else if (ie >= 10 && is <= 70) initialStep = 4;
        else if (ie >= 5 && is <= 75) initialStep = 3;
        else if (ie > 0 && is <= 80) initialStep = 2;

        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData.session) {
            await supabase.from('profiles').update({
                name: name,
                revenue: parsedRevenue,
                fixed_costs: parsedFixedCosts,
                current_step: initialStep
            }).eq('id', sessionData.session.user.id);
        }

        userStore.completeOnboarding(initialStep, name, parsedRevenue, parsedFixedCosts);

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
                                <div className="absolute inset-0 bg-gradient-to-tr from-blue-500 to-green-400 blur-[30px] rounded-full opacity-60 animate-pulse" />
                                <div className="bg-white border-2 border-b-4 border-gray-200 p-4 rounded-3xl shadow-lg relative z-10 flex flex-col items-center justify-center h-full w-full transform transition-transform hover:scale-105">
                                    <Sparkles className="w-12 h-12 text-[#2563eb] drop-shadow-md mb-1" />
                                    <span className="font-black text-2xl tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-500">
                                        Zella
                                    </span>
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
                                onClick={() => setStep(3)}
                                disabled={!name.trim()}
                            >
                                Continuar
                                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </div>
                    </motion.div>
                )}

                {/* STEP 3: Revenue */}
                {step === 3 && (
                    <motion.div
                        key="revenue"
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -30 }}
                        className="flex-1 flex flex-col justify-center space-y-10 relative z-10"
                    >
                        <div className="space-y-3 text-center">
                            <div className="w-20 h-20 bg-emerald-100 rounded-[28px] border-2 border-b-6 border-emerald-300 flex items-center justify-center mx-auto mb-6 shadow-inner relative overflow-hidden">
                                <Wallet className="w-10 h-10 text-emerald-600 drop-shadow-sm z-10 relative" />
                                <div className="absolute inset-0 bg-white/20 blur-md rounded-full pointer-events-none" />
                            </div>
                            <h2 className="text-[28px] font-black tracking-tight text-gray-900 leading-tight">
                                Qual sua Renda Mensal?
                            </h2>
                            <p className="text-gray-500 text-[14px] max-w-[260px] mx-auto font-medium">
                                Usamos esse valor para desbloquear o seu <span className="text-emerald-600 font-bold">Arena Zella</span> com precisão.
                            </p>
                        </div>

                        <div className="w-full">
                            <div className="bg-white rounded-[24px] p-6 border-2 border-b-4 border-gray-200 shadow-sm relative overflow-hidden group focus-within:border-emerald-400 focus-within:shadow-md transition-all">
                                <div className="absolute inset-0 bg-emerald-50/30 opacity-0 group-focus-within:opacity-100 transition-opacity" />
                                <div className="relative z-10 flex flex-col items-center">
                                    <span className="text-[14px] font-bold text-gray-400 uppercase tracking-wider mb-2">Salário Líquido Estimado</span>
                                    <div className="flex items-center justify-center w-full">
                                        <span className="text-3xl font-black text-emerald-600 mr-2 drop-shadow-sm">R$</span>
                                        <input
                                            type="text"
                                            inputMode="decimal"
                                            placeholder="5.000,00"
                                            className="w-full text-left text-4xl font-black bg-transparent focus:outline-none placeholder:text-gray-300 text-gray-900 tracking-tight"
                                            value={revenue}
                                            onChange={(e) => setRevenue(e.target.value)}
                                            autoFocus
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6">
                            <Button
                                className="w-full h-14 rounded-2xl text-[16px] font-black uppercase tracking-wide shadow-[0_4px_0_rgb(21,128,61)] bg-[#16a34a] text-white hover:bg-[#15803d] active:shadow-none active:translate-y-[4px] border-2 border-[#14532d] transition-all group"
                                onClick={() => setStep(4)}
                                disabled={!revenue.trim()}
                            >
                                Continuar
                                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </div>
                    </motion.div>
                )}

                {/* STEP 4: Fixed Costs */}
                {step === 4 && (
                    <motion.div
                        key="fixedCosts"
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -30 }}
                        className="flex-1 flex flex-col justify-center space-y-10 relative z-10"
                    >
                        <div className="space-y-3 text-center">
                            <div className="w-20 h-20 bg-red-100 rounded-[28px] border-2 border-b-6 border-red-300 flex items-center justify-center mx-auto mb-6 shadow-inner relative overflow-hidden">
                                <ShieldCheck className="w-10 h-10 text-red-600 drop-shadow-sm z-10 relative" />
                                <div className="absolute inset-0 bg-white/20 blur-md rounded-full pointer-events-none" />
                            </div>
                            <h2 className="text-[28px] font-black tracking-tight text-gray-900 leading-tight">
                                E seus Custos Fixos?
                            </h2>
                            <p className="text-gray-500 text-[14px] max-w-[260px] mx-auto font-medium">
                                Aluguel, contas base e mercado vital. Qual o custo apenas para <span className="font-bold text-red-600">sobreviver</span>?
                            </p>
                        </div>

                        <div className="w-full">
                            <div className="bg-white rounded-[24px] p-6 border-2 border-b-4 border-gray-200 shadow-sm relative overflow-hidden group focus-within:border-red-400 focus-within:shadow-md transition-all">
                                <div className="absolute inset-0 bg-red-50/30 opacity-0 group-focus-within:opacity-100 transition-opacity" />
                                <div className="relative z-10 flex flex-col items-center">
                                    <span className="text-[14px] font-bold text-gray-400 uppercase tracking-wider mb-2">Sua base mensal</span>
                                    <div className="flex items-center justify-center w-full">
                                        <span className="text-3xl font-black text-red-600 mr-2 drop-shadow-sm">R$</span>
                                        <input
                                            type="text"
                                            inputMode="decimal"
                                            placeholder="2.500,00"
                                            className="w-full text-left text-4xl font-black bg-transparent focus:outline-none placeholder:text-gray-300 text-gray-900 tracking-tight"
                                            value={fixedCosts}
                                            onChange={(e) => setFixedCosts(e.target.value)}
                                            autoFocus
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6">
                            <Button
                                className="w-full h-14 rounded-2xl text-[16px] font-black uppercase tracking-wide shadow-[0_4px_0_rgb(30,64,175)] bg-[#2563eb] text-white hover:bg-[#1e40af] active:shadow-none active:translate-y-[4px] border-2 border-[#1e3a8a] transition-all group"
                                onClick={handleFinish}
                                disabled={!fixedCosts.trim()}
                            >
                                Iniciar Jornada Real
                                <Sparkles className="ml-2 w-4 h-4" />
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
