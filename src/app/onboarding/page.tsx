"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, Check } from "lucide-react";
import { useUserStore } from "@/store/useStore";
import { useRouter } from "next/navigation";

const questions = [
    {
        id: "goal",
        question: "Qual é o seu principal objetivo agora?",
        options: [
            { label: "Sair das Dívidas", value: "debt", targetStep: 1 },
            { label: "Começar a Guardar", value: "save", targetStep: 2 },
            { label: "Investir Melhor", value: "invest", targetStep: 4 },
            { label: "Ter Liberdade Total", value: "freedom", targetStep: 5 },
        ],
    },
    {
        id: "feeling",
        question: "Como você se sente com seu dinheiro?",
        options: [
            { label: "Ansioso / Perdido", value: "anxious" },
            { label: "No Controle", value: "control" },
            { label: "Estagnado", value: "stagnant" },
        ],
    },
    {
        id: "capacity",
        question: "Quanto você consegue guardar por mês?",
        options: [
            { label: "Nada / Estou no negativo", value: "none" },
            { label: "Menos de R$ 100", value: "little" },
            { label: "Mais de R$ 500", value: "some" },
        ],
    },
];

export default function OnboardingPage() {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, any>>({});
    const [name, setName] = useState("");
    const [step, setStep] = useState(1); // Internal step of onboarding UI (questions -> name -> analyzing)

    const router = useRouter();
    const completeOnboarding = useUserStore((state) => state.completeOnboarding);

    const currentQ = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + (step === 2 ? 1 : 0)) / (questions.length + 1)) * 100;

    const handleOptionSelect = (option: any) => {
        setAnswers((prev) => ({ ...prev, [currentQ.id]: option }));

        // Simple logic to determine starting Degrau
        if (currentQ.id === "goal") {
            // Save the target step implied by the goal for later calculation
            // For now just storing the option
        }

        if (currentQuestionIndex < questions.length - 1) {
            setTimeout(() => setCurrentQuestionIndex((prev) => prev + 1), 300);
        } else {
            setStep(2); // Ask for name
        }
    };

    const handleFinish = () => {
        // Determine Logic
        let calculatedStep = 1;
        const goal = answers["goal"]?.value;
        const capacity = answers["capacity"]?.value;

        if (goal === "debt" || capacity === "none") calculatedStep = 1; // Respiração
        else if (goal === "save" && capacity === "little") calculatedStep = 2; // Organização
        else if (goal === "save" && capacity === "some") calculatedStep = 3; // Estabilidade
        else if (goal === "invest") calculatedStep = 4; // Segurança/Consciência
        else calculatedStep = 2; // Default fallback

        completeOnboarding(calculatedStep, name || "Viajante");
        router.push("/dashboard");
    };

    return (
        <div className="flex min-h-screen flex-col bg-background p-6 max-w-md mx-auto relative overflow-hidden">
            {/* Background blobs */}
            <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10" />
            <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-secondary/10 rounded-full blur-3xl -z-10" />

            <div className="w-full py-6">
                <Progress value={progress} className="h-2" />
            </div>

            <AnimatePresence mode="wait">
                {step === 1 && (
                    <motion.div
                        key={currentQ.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="flex-1 flex flex-col justify-center space-y-8"
                    >
                        <div className="space-y-2">
                            <h2 className="text-3xl font-bold font-heading tracking-tight">
                                {currentQ.question}
                            </h2>
                            <p className="text-muted-foreground">Seja sincero, ninguém vai ver isso.</p>
                        </div>

                        <div className="space-y-3">
                            {currentQ.options.map((option) => (
                                <Button
                                    key={option.label} // Using label as key for simplicity
                                    variant="outline"
                                    className={`w-full h-auto py-4 justify-start text-lg px-6 rounded-2xl border-2 transition-all ${answers[currentQ.id] === option
                                            ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                                            : "hover:border-primary/50"
                                        }`}
                                    onClick={() => handleOptionSelect(option)}
                                >
                                    <div className="flex items-center w-full">
                                        <span className="flex-1 text-left font-medium">{option.label}</span>
                                        {answers[currentQ.id] === option && (
                                            <Check className="h-5 w-5 text-primary" />
                                        )}
                                    </div>
                                </Button>
                            ))}
                        </div>
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div
                        key="name-step"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex-1 flex flex-col justify-center space-y-8"
                    >
                        <div className="space-y-2 text-center">
                            <span className="text-4xl">👋</span>
                            <h2 className="text-3xl font-bold font-heading">
                                Como devemos te chamar?
                            </h2>
                        </div>

                        <input
                            type="text"
                            placeholder="Seu nome ou apelido"
                            className="w-full text-center text-3xl font-bold border-b-2 border-border bg-transparent py-2 focus:outline-none focus:border-primary placeholder:text-muted-foreground/50 transition-colors"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            autoFocus
                        />

                        <Button size="lg" variant="premium" className="w-full h-14 rounded-2xl text-lg mt-8" onClick={handleFinish} disabled={!name.trim()}>
                            Criar meu Plano
                            <ArrowRight className="ml-2" />
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
