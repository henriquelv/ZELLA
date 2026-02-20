"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, Trophy, AlertTriangle, ShieldCheck, TrendingUp, Flame, Target, Sparkles, Coins } from "lucide-react";
import { useUserStoreHydrated } from "@/store/useStore";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { steps } from "@/data/steps";
import dynamic from "next/dynamic";

const ZLogoScene = dynamic(
    () => import("@/components/ui/3d-scenes").then(m => ({ default: m.ZLogoScene })),
    { ssr: false }
);

const DIAGNOSTIC_QUESTIONS = [
    {
        id: "feeling",
        question: "Como você se sente quando chega o fim do mês?",
        options: [
            { label: "Sufocado e no vermelho", value: "A", icon: AlertTriangle, color: "text-red-500", bg: "bg-red-500/10" },
            { label: "No limite, quase empatando", value: "B", icon: ShieldCheck, color: "text-yellow-500", bg: "bg-yellow-500/10" },
            { label: "Tranquilo, sobra um pouco", value: "C", icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10" },
        ],
    },
    {
        id: "resilience",
        question: "Se sua principal fonte de renda parasse hoje, por quanto tempo você sobreviveria?",
        options: [
            { label: "Desespero imediato (< 1 mês)", value: "A", icon: Flame, color: "text-orange-500", bg: "bg-orange-500/10" },
            { label: "Consigo segurar uns 3 meses", value: "B", icon: Target, color: "text-blue-500", bg: "bg-blue-500/10" },
            { label: "Tenho reservas (> 6 meses)", value: "C", icon: Trophy, color: "text-violet-500", bg: "bg-violet-500/10" },
        ],
    },
    {
        id: "goal",
        question: "Qual é a sua Missão Principal agora?",
        options: [
            { label: "Apagar o incêndio das dívidas", value: "A", icon: AlertTriangle, color: "text-red-500", bg: "bg-red-500/10" },
            { label: "Tapar os vazamentos (organizar)", value: "B", icon: ShieldCheck, color: "text-yellow-500", bg: "bg-yellow-500/10" },
            { label: "Multiplicar meu ouro (investir)", value: "C", icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10" },
        ],
    },
];

export default function OnboardingPage() {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [step, setStep] = useState(1); // 1: Info, 2: Questions, 3: Analyzing, 4: Result, 5: Name
    const [resultData, setResultData] = useState<{ stepId: number, title: string, mission: string }>({ stepId: 1, title: "", mission: "" });
    const [name, setName] = useState("");
    const [isTransitioning, setIsTransitioning] = useState(false);

    const router = useRouter();
    const userStore = useUserStoreHydrated((state) => state);

    const currentSafeIndex = Math.min(currentQuestionIndex, DIAGNOSTIC_QUESTIONS.length - 1);
    const currentQ = DIAGNOSTIC_QUESTIONS[currentSafeIndex];
    const progress = ((currentSafeIndex + 1) / DIAGNOSTIC_QUESTIONS.length) * 100;

    const handleOptionSelect = (value: string) => {
        if (isTransitioning) return;
        setIsTransitioning(true);

        const newAnswers = { ...answers, [currentQ.id]: value };
        setAnswers(newAnswers);

        if (currentQuestionIndex < DIAGNOSTIC_QUESTIONS.length - 1) {
            setTimeout(() => {
                setCurrentQuestionIndex((prev) => prev + 1);
                setIsTransitioning(false);
            }, 300);
        } else {
            calculateResult(newAnswers);
        }
    };

    const calculateResult = (finalAnswers: Record<string, string>) => {
        setStep(3); // Analyzing

        setTimeout(() => {
            const q1 = finalAnswers["feeling"];
            const q2 = finalAnswers["resilience"];
            const q3 = finalAnswers["goal"];

            let calculatedStep = 2;
            let profileTitle = "Estrategista em Treinamento";
            let missionText = "Identificar fugas de dinheiro na sua rotina e construir sua primeira defesa.";

            // Diagnosis Logic
            if (q1 === "A" || q3 === "A") {
                calculatedStep = 1;
                profileTitle = "Sobrevivente";
                missionText = "Parar o sangramento. Vamos mapear para onde seu dinheiro está fugindo e conter os danos imediatos.";
            } else if (q1 === "C" && q2 === "C") {
                calculatedStep = 4;
                profileTitle = "Mestre do Ouro";
                missionText = "Otimizar suas reservas e começar a multiplicar seus ativos financeiros.";
            } else if (q3 === "C") {
                calculatedStep = 3;
                profileTitle = "Caçador de Rendimentos";
                missionText = "Acelerar sua capacidade de gerar sobras mensais para fortificar sua reserva.";
            }

            setResultData({ stepId: calculatedStep, title: profileTitle, mission: missionText });
            setStep(4); // Show Result
        }, 2500);
    };

    const handleFinish = async () => {
        if (!name.trim()) return;
        if (!userStore) return;

        // Try syncing with Supabase if logged in
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData.session) {
            await supabase.from('profiles').update({
                name: name,
                current_step: resultData.stepId
            }).eq('id', sessionData.session.user.id);
        }

        userStore.completeOnboarding(resultData.stepId, name);

        // Setup initial goal to guide them right away
        userStore.addGoal({
            id: crypto.randomUUID(),
            title: "Primeira Vitória",
            description: "Registre 3 vazamentos de dinheiro (despesas) para a Zella AI analisar o dano.",
            category: "habit",
            xpReward: 100,
            completed: false,
            createdAt: new Date().toISOString()
        });

        router.push("/dashboard");
    };

    const resultStepInfo = steps.find(s => s.id === resultData.stepId) || steps[0];

    return (
        <div className="flex min-h-screen flex-col bg-background p-6 max-w-md mx-auto relative overflow-hidden selection:bg-primary/20">
            {/* Immersive Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5 pointer-events-none -z-10" />

            {step === 2 && (
                <div className="w-full py-6 absolute top-0 left-0 px-6 z-20">
                    <div className="flex justify-between items-center text-xs text-muted-foreground mb-3 font-bold uppercase tracking-wider">
                        <span className="flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-primary" /> Diagnóstico Zella</span>
                        <span>{currentQuestionIndex + 1}/{DIAGNOSTIC_QUESTIONS.length}</span>
                    </div>
                    <Progress value={progress} className="h-2 bg-secondary/20" indicatorClassName="bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
                </div>
            )}

            <AnimatePresence mode="wait">
                {/* INTRO PHASE */}
                {step === 1 && (
                    <motion.div
                        key="intro"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="flex-1 flex flex-col items-center justify-center text-center space-y-8"
                    >
                        <div className="relative w-48 h-48">
                            <div className="absolute inset-0 bg-primary/20 blur-[50px] rounded-full animate-pulse" />
                            <ZLogoScene size={192} />
                        </div>

                        <div className="space-y-3 relative z-10">
                            <h1 className="text-3xl font-bold font-heading leading-tight">
                                Esqueça as <span className="text-primary italic">planilhas chatas.</span>
                            </h1>
                            <p className="text-muted-foreground font-medium text-base/relaxed max-w-[280px] mx-auto">
                                Zella é seu RPG financeiro. Para te equipar corretamente, preciso escanear sua saúde atual.
                            </p>
                        </div>

                        <Button
                            variant="premium"
                            size="lg"
                            className="w-full h-14 rounded-2xl text-lg font-bold shadow-xl shadow-primary/25 mt-8 hover:scale-[1.02] transition-transform"
                            onClick={() => setStep(2)}
                        >
                            <Sparkles className="w-5 h-5 mr-2" />
                            Iniciar Diagnóstico
                        </Button>
                    </motion.div>
                )}

                {/* QUESTIONS PHASE */}
                {step === 2 && (
                    <motion.div
                        key={`q-${currentQ.id}`}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3, type: "spring", damping: 25 }}
                        className="flex-1 flex flex-col justify-center space-y-8 pt-10"
                    >
                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold font-heading leading-tight text-foreground shadow-sm">
                                {currentQ.question}
                            </h2>
                        </div>

                        <div className="space-y-3">
                            {currentQ.options.map((option) => (
                                <motion.button
                                    whileTap={{ scale: 0.98 }}
                                    key={option.value}
                                    className={`w-full group relative overflow-hidden flex items-center p-4 rounded-2xl border-2 transition-all duration-200 text-left ${answers[currentQ.id] === option.value
                                            ? "border-primary bg-primary/10 shadow-[0_0_15px_rgba(var(--primary),0.15)]"
                                            : "border-border/50 bg-card/80 backdrop-blur hover:border-primary/40 hover:bg-card"
                                        }`}
                                    onClick={() => handleOptionSelect(option.value)}
                                >
                                    <div className={`p-3 rounded-xl mr-4 transition-colors ${answers[currentQ.id] === option.value ? "bg-primary text-primary-foreground shadow-inner" : option.bg
                                        }`}>
                                        <option.icon className={`w-5 h-5 ${answers[currentQ.id] === option.value ? "text-primary-foreground" : option.color}`} />
                                    </div>
                                    <span className="flex-1 font-bold text-foreground/90">{option.label}</span>
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* ANALYZING PHASE */}
                {step === 3 && (
                    <motion.div
                        key="analyzing"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex-1 flex flex-col items-center justify-center text-center space-y-8"
                    >
                        <div className="relative">
                            <div className="absolute inset-0 border-4 border-t-primary border-r-primary border-b-primary/20 border-l-primary/20 rounded-full w-24 h-24 animate-spin" />
                            <div className="w-24 h-24 flex items-center justify-center">
                                <Sparkles className="w-8 h-8 text-primary animate-pulse" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold font-heading">
                                Processando Aura...
                            </h2>
                            <p className="text-muted-foreground font-medium animate-pulse">
                                Mapeando vulnerabilidades financeiras
                            </p>
                        </div>
                    </motion.div>
                )}

                {/* RESULTS PHASE */}
                {step === 4 && (
                    <motion.div
                        key="result"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="flex-1 flex flex-col justify-center space-y-8"
                    >
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="relative inline-block">
                                <div className="absolute inset-0 bg-primary/30 blur-2xl rounded-full" />
                                <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-primary to-emerald-400 flex items-center justify-center shadow-2xl relative ring-4 ring-background z-10">
                                    <resultStepInfo.icon className="w-12 h-12 text-background" />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <Badge variant="outline" className="text-primary font-bold tracking-widest uppercase text-[10px] border-primary/30 bg-primary/5 mb-2">
                                    Diagnóstico Concluído
                                </Badge>
                                <h1 className="text-3xl font-bold font-heading text-foreground leading-tight">
                                    Aura: {resultData.title}
                                </h1>
                            </div>
                        </div>

                        <div className="bg-card/50 backdrop-blur-md border border-border/50 rounded-3xl p-6 shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none" />

                            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                                <Target className="w-4 h-4 text-primary" />
                                Sua Primeira Missão
                            </h3>
                            <p className="text-foreground/90 font-medium leading-relaxed mb-4">
                                {resultData.mission}
                            </p>

                            <div className="bg-background/80 rounded-2xl p-4 flex items-center justify-between border border-border/50">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center">
                                        <Coins className="w-5 h-5 text-yellow-500" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold truncate">Recompensa Inicial</p>
                                        <p className="text-xs text-muted-foreground">Desbloqueio Nível {resultData.stepId}</p>
                                    </div>
                                </div>
                                <span className="font-bold text-yellow-500">+100 XP</span>
                            </div>
                        </div>

                        <Button
                            size="lg"
                            variant="premium"
                            className="w-full h-14 text-lg rounded-2xl shadow-xl hover:scale-[1.02] transition-transform group"
                            onClick={() => setStep(5)}
                        >
                            Aceitar Missão
                            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </motion.div>
                )}

                {/* NAME COLLECTION */}
                {step === 5 && (
                    <motion.div
                        key="name"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex-1 flex flex-col justify-center space-y-8"
                    >
                        <div className="space-y-3 text-center">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2 text-primary">
                                <Trophy className="w-8 h-8" />
                            </div>
                            <h2 className="text-3xl font-bold font-heading">
                                Preparando o Terreno
                            </h2>
                            <p className="text-muted-foreground font-medium">As crônicas precisam de um herói. Qual o seu nome?</p>
                        </div>

                        <div className="relative max-w-xs mx-auto w-full">
                            <input
                                type="text"
                                placeholder="Nome do Jogador"
                                className="w-full text-center text-2xl font-bold border-b-2 border-border/50 bg-transparent py-4 focus:outline-none focus:border-primary placeholder:text-muted-foreground/30 transition-colors text-foreground"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                autoFocus
                            />
                        </div>

                        <div className="pt-8">
                            <Button
                                size="lg"
                                className="w-full h-14 rounded-2xl text-lg font-bold shadow-lg shadow-primary/20 relative overflow-hidden group"
                                onClick={handleFinish}
                                disabled={!name.trim()}
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    Adentrar Zella
                                    <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                                </span>
                                <div className="absolute inset-0 bg-primary-foreground/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function Badge({ children, variant, className }: any) {
    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${className}`}>
            {children}
        </span>
    );
}
