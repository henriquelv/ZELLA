"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Wallet, Target, ShieldCheck, Trophy, Lock, Loader2, CheckCircle2, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserStoreHydrated } from "@/store/useStore";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function OnboardingPage() {
    const [step, setStep] = useState(1);
    const [name, setName] = useState("");
    const [revenueInput, setRevenueInput] = useState("");
    const [fixedCostsInput, setFixedCostsInput] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    const router = useRouter();
    const userStore = useUserStoreHydrated((state) => state);

    const finalizeOnboarding = async (initialStep: number, parsedRevenue: number, parsedFixedCosts: number) => {
        if (!name.trim() || !userStore) return;

        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData?.session) {
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

    const calculateInitialDegrau = (revenue: number, fixedCosts: number) => {
        if (revenue <= 0) return 1;
        const ie = ((revenue - fixedCosts) / revenue) * 100;
        const is = (fixedCosts / revenue) * 100;

        if (ie >= 20 && is <= 50) return 6;
        if (ie >= 15 && is <= 60) return 5;
        if (ie >= 10 && is <= 70) return 4;
        if (ie >= 5 && is <= 75) return 3;
        if (ie > 0 && is <= 80) return 2;
        return 1;
    };

    const parseBr = (v: string) => parseFloat(v.replace(/\./g, "").replace(",", ".")) || 0;

    const handleSkip = async () => {
        setIsSaving(true);
        await finalizeOnboarding(1, 0, 0);
    };

    const handleSaveProfile = async () => {
        const revenue = parseBr(revenueInput);
        const fixedCosts = parseBr(fixedCostsInput);
        if (revenue <= 0) return;
        setIsSaving(true);
        const degrau = calculateInitialDegrau(revenue, fixedCosts);
        await finalizeOnboarding(degrau, revenue, fixedCosts);
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

                {/* STEP 3: Intro ao mapeamento */}
                {step === 3 && (
                    <motion.div
                        key="intelligence"
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -30 }}
                        className="flex-1 flex flex-col justify-center space-y-10 relative z-10"
                    >
                        <div className="space-y-4 text-center">
                            <div className="w-20 h-20 bg-blue-50/80 backdrop-blur-sm rounded-[2rem] flex items-center justify-center mx-auto shadow-sm ring-1 ring-blue-100/50 relative overflow-hidden">
                                <Sparkles className="w-10 h-10 text-blue-500 drop-shadow-sm z-10 relative" />
                                <div className="absolute inset-0 bg-white/20 blur-md rounded-full pointer-events-none" />
                            </div>
                            <h2 className="text-[26px] font-extrabold tracking-tight text-gray-800 leading-tight">
                                Vamos mapear<br />onde você está.
                            </h2>
                            <p className="text-gray-500 text-[14px] max-w-[280px] mx-auto font-medium leading-relaxed">
                                Uns minutinhos respondendo <span className="font-bold text-blue-600">renda</span> e <span className="font-bold text-blue-600">custos fixos</span> — isso é o que a Zella precisa pra calcular seu degrau inicial.
                            </p>
                        </div>

                        <div className="space-y-3">
                            <div className="bg-white/70 backdrop-blur-sm p-4 rounded-2xl flex items-start gap-4 shadow-sm border border-black/[0.02]">
                                <div className="p-2.5 bg-emerald-50 rounded-xl">
                                    <Target className="w-5 h-5 text-emerald-600" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-[14px] text-gray-800">Cálculo de Degrau</h4>
                                    <p className="text-[12px] text-gray-500 mt-0.5 leading-snug">A gente descobre em qual estágio financeiro você está hoje.</p>
                                </div>
                            </div>

                            <div className="bg-white/70 backdrop-blur-sm p-4 rounded-2xl flex items-start gap-4 shadow-sm border border-black/[0.02]">
                                <div className="p-2.5 bg-blue-50 rounded-xl">
                                    <Lock className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-[14px] text-gray-800">Privado por padrão</h4>
                                    <p className="text-[12px] text-gray-500 mt-0.5 leading-snug">Seus números ficam só com você. Nada é compartilhado com ninguém.</p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4">
                            <Button
                                className="w-full h-14 rounded-2xl text-[15px] font-extrabold tracking-wide shadow-md bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:opacity-95 active:scale-[0.98] transition-all group border-0"
                                onClick={() => setStep(4)}
                            >
                                Entendi, vamos lá
                                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </div>
                    </motion.div>
                )}

                {/* STEP 4: Renda + Custos Fixos (input real) */}
                {step === 4 && (
                    <motion.div
                        key="profile"
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -30 }}
                        className="flex-1 flex flex-col justify-center space-y-8 relative z-10"
                    >
                        <div className="space-y-3 text-center">
                            <div className="w-20 h-20 bg-white shadow-xl shadow-blue-900/5 rounded-[2rem] border border-black/[0.05] flex items-center justify-center mx-auto mb-4 relative">
                                <TrendingUp className="w-10 h-10 text-gray-800 drop-shadow-sm" />
                                <div className="absolute -bottom-2 -right-2 bg-emerald-500 rounded-full p-1.5 border-2 border-[#f4f6fb] shadow-sm">
                                    <CheckCircle2 className="w-4 h-4 text-white" />
                                </div>
                            </div>
                            <h2 className="text-[24px] font-extrabold tracking-tight text-gray-800 leading-tight">
                                Seu perfil financeiro
                            </h2>
                            <p className="text-gray-500 text-[13px] max-w-[280px] mx-auto font-medium leading-relaxed">
                                Preencha com os números aproximados. Você pode ajustar depois.
                            </p>
                        </div>

                        {isSaving ? (
                            <div className="py-8 space-y-6 flex flex-col items-center">
                                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                                <div className="text-center space-y-1">
                                    <h3 className="font-extrabold text-[15px] text-gray-800">Calculando seu degrau...</h3>
                                    <p className="text-[13px] text-gray-500">Montando seu Plano de Adaptação</p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-5">
                                <div>
                                    <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest block mb-1.5 ml-1">Renda mensal</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-[14px]">R$</span>
                                        <input
                                            type="text"
                                            inputMode="decimal"
                                            placeholder="5000"
                                            value={revenueInput}
                                            onChange={(e) => setRevenueInput(e.target.value)}
                                            className="w-full h-14 pl-12 pr-4 bg-white rounded-2xl text-[16px] font-bold text-gray-800 ring-1 ring-black/[0.04] focus:ring-blue-300 outline-none shadow-sm placeholder:text-gray-300"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest block mb-1.5 ml-1">Custos fixos mensais</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-[14px]">R$</span>
                                        <input
                                            type="text"
                                            inputMode="decimal"
                                            placeholder="2800"
                                            value={fixedCostsInput}
                                            onChange={(e) => setFixedCostsInput(e.target.value)}
                                            className="w-full h-14 pl-12 pr-4 bg-white rounded-2xl text-[16px] font-bold text-gray-800 ring-1 ring-black/[0.04] focus:ring-blue-300 outline-none shadow-sm placeholder:text-gray-300"
                                        />
                                    </div>
                                    <p className="text-[11px] text-gray-400 mt-1.5 ml-1 font-medium">Aluguel, contas, assinaturas, transporte fixo.</p>
                                </div>

                                <Button
                                    onClick={handleSaveProfile}
                                    disabled={!revenueInput || parseBr(revenueInput) <= 0}
                                    className="w-full h-14 rounded-2xl text-[15px] font-extrabold tracking-wide shadow-md bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:opacity-95 active:scale-[0.98] transition-all group border-0 disabled:opacity-50"
                                >
                                    Calcular meu degrau
                                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </Button>

                                <button
                                    onClick={handleSkip}
                                    className="w-full py-3 text-[12px] font-bold text-gray-400 hover:text-gray-600 transition-colors uppercase tracking-widest"
                                >
                                    Pular e adicionar depois
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
