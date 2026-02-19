"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, Check, Trophy, AlertTriangle, ShieldCheck, TrendingUp } from "lucide-react";
import { useUserStoreHydrated } from "@/store/useStore";
import { useRouter } from "next/navigation";
import { steps } from "@/data/steps";

// New Questions per User Spec
const questions = [
    {
        id: "feeling",
        question: "Como você se sente ao chegar no fim do mês?",
        options: [
            { label: "Sufocado / No Vermelho", value: "A", icon: AlertTriangle },
            { label: "No limite / Zero a zero", value: "B", icon: ShieldCheck },
            { label: "Sobra um pouco", value: "C", icon: TrendingUp },
        ],
    },
    {
        id: "resilience",
        question: "Se sua renda parasse hoje, por quanto tempo você manteria seu padrão de vida?",
        options: [
            { label: "Menos de 1 mês", value: "A" },
            { label: "1 a 3 meses", value: "B" },
            { label: "Mais de 3 meses", value: "C" },
        ],
    },
    {
        id: "goal",
        question: "Qual é a sua 'dor' mais urgente hoje?",
        options: [
            { label: "Sair das dívidas", value: "A" },
            { label: "Organizar a bagunça", value: "B" },
            { label: "Começar a guardar", value: "C" },
        ],
    },
];

export default function OnboardingPage() {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [step, setStep] = useState(1); // 1: Questions, 2: Analyzing, 3: Result, 4: Name
    const [resultStepId, setResultStepId] = useState(1);
    const [name, setName] = useState("");

    const router = useRouter();
    const userStore = useUserStoreHydrated((state) => state);

    const currentQ = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

    const handleOptionSelect = (value: string) => {
        const newAnswers = { ...answers, [currentQ.id]: value };
        setAnswers(newAnswers);

        if (currentQuestionIndex < questions.length - 1) {
            setTimeout(() => setCurrentQuestionIndex((prev) => prev + 1), 250);
        } else {
            calculateResult(newAnswers);
        }
    };

    const calculateResult = (finalAnswers: Record<string, string>) => {
        setStep(2); // Analyzing animation

        setTimeout(() => {
            // Business Logic (The "Puxada de Orelha")
            const q1 = finalAnswers["feeling"];
            const q2 = finalAnswers["resilience"];
            const q3 = finalAnswers["goal"];

            let calculatedStep = 2; // Default fallback

            // Rule 1: Se Perg1=A ou Perg3=A → Degrau 1
            if (q1 === "A" || q3 === "A") {
                calculatedStep = 1;
            }
            // Rule 2: Se Perg1=B e Perg2=A → Degrau 2
            else if (q1 === "B" && q2 === "A") {
                calculatedStep = 2;
            }
            // Rule 3: Se Perg1=C e Perg2=B → Degrau 3
            else if (q1 === "C" && q2 === "B") {
                calculatedStep = 3;
            }
            // Implicit Rule: If Q1=C and Q2=C -> Advanced?
            else if (q1 === "C" && q2 === "C") {
                calculatedStep = 4;
            }
            else {
                // Smart Fallback based on goal
                if (q3 === "B") calculatedStep = 2;
                else if (q3 === "C") calculatedStep = 3;
            }

            setResultStepId(calculatedStep);
            setStep(3); // Show Result
        }, 2000);
    };

    const handleFinish = () => {
        if (!name.trim()) return;
        if (userStore) {
            userStore.completeOnboarding(resultStepId, name);
            router.push("/dashboard");
        }
    };

    const resultStepData = steps.find(s => s.id === resultStepId) || steps[0];

    return (
        <div className="flex min-h-screen flex-col bg-background p-6 max-w-md mx-auto relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute top-0 right-0 w-full h-1/2 bg-gradient-to-b from-primary/5 to-transparent -z-10" />

            {step === 1 && (
                <div className="w-full py-8">
                    <div className="flex justify-between text-xs text-muted-foreground mb-2 font-medium">
                        <span>Diagnóstico Financeiro</span>
                        <span>{currentQuestionIndex + 1}/{questions.length}</span>
                    </div>
                    <Progress value={progress} className="h-1.5 bg-secondary/10" indicatorClassName="bg-primary" />
                </div>
            )}

            <AnimatePresence mode="wait">
                {/* QUESTIONS PHASE */}
                {step === 1 && (
                    <motion.div
                        key={`q-${currentQ.id}`}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="flex-1 flex flex-col justify-center space-y-8"
                    >
                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold font-heading leading-tight text-foreground">
                                {currentQ.question}
                            </h2>
                        </div>

                        <div className="space-y-3">
                            {currentQ.options.map((option) => (
                                <Button
                                    key={option.value}
                                    variant="outline"
                                    className={`w-full h-auto py-5 px-6 justify-start text-left text-base rounded-2xl border transition-all ${answers[currentQ.id] === option.value
                                            ? "border-primary bg-primary/10 ring-1 ring-primary text-foreground"
                                            : "bg-card hover:bg-accent/50 hover:border-primary/30 border-border/50"
                                        }`}
                                    onClick={() => handleOptionSelect(option.value)}
                                >
                                    <div className="flex items-center w-full">
                                        {/* @ts-ignore icon property check */}
                                        {option.icon && <option.icon className="w-5 h-5 mr-3 text-primary" />}
                                        <span className="flex-1 font-medium">{option.label}</span>
                                    </div>
                                </Button>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* ANALYZING PHASE */}
                {step === 2 && (
                    <motion.div
                        key="analyzing"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex-1 flex flex-col items-center justify-center text-center space-y-6"
                    >
                        <div className="relative">
                            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
                            <Trophy className="w-20 h-20 text-primary animate-bounce relative z-10" />
                        </div>
                        <h2 className="text-xl font-medium font-heading animate-pulse">
                            Analisando seu perfil...
                        </h2>
                    </motion.div>
                )}

                {/* RESULTS PHASE */}
                {step === 3 && (
                    <motion.div
                        key="result"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex-1 flex flex-col justify-center items-center text-center space-y-6 py-10"
                    >
                        <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-primary to-emerald-400 flex items-center justify-center shadow-2xl shadow-primary/20 mb-4">
                            <resultStepData.icon className="w-12 h-12 text-background" />
                        </div>

                        <div className="space-y-2">
                            <p className="text-sm font-semibold uppercase tracking-widest text-primary">Seu Ponto de Partida</p>
                            <h1 className="text-4xl font-bold font-heading text-foreground">
                                Degrau {resultStepId}
                            </h1>
                            <h2 className="text-2xl font-medium text-foreground/90">
                                {resultStepData.title}
                            </h2>
                        </div>

                        <p className="text-muted-foreground max-w-xs mx-auto leading-relaxed">
                            {resultStepId === 1 && "Vamos sair do vermelho e organizar a casa. O primeiro passo é parar de cavar."}
                            {resultStepId === 2 && "Você já tem uma ideia, mas precisa de método. Vamos transformar intenção em ação."}
                            {resultStepId >= 3 && "Você está no caminho certo. Agora é hora de construir blindagem e acelerar."}
                        </p>

                        <div className="w-full pt-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500 fill-mode-forwards">
                            <Button size="lg" variant="premium" className="w-full h-14 text-lg rounded-2xl shadow-xl shadow-primary/20" onClick={() => setStep(4)}>
                                Continuar
                                <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>
                        </div>
                    </motion.div>
                )}

                {/* NAME COLLECTION (Final Friction) */}
                {step === 4 && (
                    <motion.div
                        key="name"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex-1 flex flex-col justify-center space-y-8"
                    >
                        <div className="space-y-2 text-center">
                            <h2 className="text-3xl font-bold font-heading">
                                Para salvar seu progresso...
                            </h2>
                            <p className="text-muted-foreground">Como você quer ser chamado?</p>
                        </div>

                        <input
                            type="text"
                            placeholder="Seu Nome"
                            className="w-full text-center text-3xl font-bold border-b-2 border-border bg-transparent py-4 focus:outline-none focus:border-primary placeholder:text-muted-foreground/30 transition-colors text-foreground"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            autoFocus
                        />

                        <Button
                            size="lg"
                            variant="default" // Using default primary instead of premium for "signup" feel
                            className="w-full h-14 rounded-2xl text-lg mt-8 font-semibold"
                            onClick={handleFinish}
                            disabled={!name.trim()}
                        >
                            Começar Degrau {resultStepId}
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
