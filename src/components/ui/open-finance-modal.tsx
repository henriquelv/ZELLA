"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Check, Loader2, Info, Wand2 } from "lucide-react";
import { Button } from "./button";
import { useUserStore, type Transaction } from "@/store/useStore";
import { toast } from "sonner";

interface OpenFinanceModalProps {
    isOpen: boolean;
    onClose: () => void;
}

// Sample transactions used for the "tour" / demo mode.
// These are clearly fictitious and labeled as such.
const DEMO_TRANSACTIONS: Omit<Transaction, "id">[] = [
    { description: "Supermercado (exemplo)", amount: 154.2, category: "Alimentação", type: "expense", date: new Date().toISOString() },
    { description: "Streaming (exemplo)", amount: 55.9, category: "Assinaturas", type: "expense", date: new Date().toISOString() },
    { description: "Combustível (exemplo)", amount: 200.0, category: "Transporte", type: "expense", date: new Date().toISOString() },
    { description: "Farmácia (exemplo)", amount: 48.7, category: "Saúde", type: "expense", date: new Date().toISOString() },
    { description: "Salário (exemplo)", amount: 4500.0, category: "Renda", type: "income", date: new Date().toISOString() },
];

export function OpenFinanceModal({ isOpen, onClose }: OpenFinanceModalProps) {
    const [step, setStep] = useState<"intro" | "loading" | "success">("intro");
    const addTransaction = useUserStore((s) => s.addTransaction);
    const setFinancialData = useUserStore((s) => s.setFinancialData);

    if (!isOpen) return null;

    const handleLoadDemo = () => {
        setStep("loading");
        setTimeout(() => {
            DEMO_TRANSACTIONS.forEach((t) =>
                addTransaction({ ...t, id: crypto.randomUUID() })
            );
            setFinancialData(4500, 2500);
            setStep("success");
            toast.success("Dados de exemplo carregados!", {
                description: "Você pode editar ou apagar quando quiser.",
            });
        }, 1800);
    };

    const handleClose = () => {
        setStep("intro");
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-md flex items-center justify-center p-4"
                    onClick={handleClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                        className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl relative overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-100 rounded-full blur-3xl opacity-50" />

                        {step === "intro" && (
                            <div className="text-center relative z-10">
                                {/* Demo badge */}
                                <div className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full mb-4">
                                    <Info className="w-3.5 h-3.5 text-amber-600" />
                                    <span className="text-[10px] font-black text-amber-700 uppercase tracking-wider">
                                        Modo demonstração
                                    </span>
                                </div>

                                <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-[1.5rem] flex items-center justify-center mx-auto mb-5 shadow-lg shadow-amber-200">
                                    <Wand2 className="w-8 h-8 text-white" />
                                </div>

                                <h3 className="text-2xl font-black text-gray-800 mb-2 leading-tight">
                                    Quer dar uma espiada?
                                </h3>
                                <p className="text-[13px] text-gray-500 font-medium leading-relaxed mb-6">
                                    Carrego uns <strong className="text-gray-700">lançamentos de exemplo</strong> pra
                                    você ver como a Zella funciona sem precisar cadastrar nada agora.
                                    Você pode apagar depois e começar do zero.
                                </p>

                                <div className="bg-gray-50 rounded-2xl p-4 mb-6 border border-gray-100 text-left">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                                        O que vai entrar
                                    </p>
                                    <ul className="text-[12px] font-semibold text-gray-700 space-y-1">
                                        <li>· 4 despesas fictícias (mercado, streaming…)</li>
                                        <li>· 1 receita fictícia (salário exemplo)</li>
                                        <li>· Um orçamento de teste pra dar contexto</li>
                                    </ul>
                                </div>

                                <Button
                                    className="w-full h-14 bg-gray-900 hover:bg-black text-white font-bold rounded-2xl shadow-xl flex items-center justify-center gap-2"
                                    onClick={handleLoadDemo}
                                >
                                    <Sparkles className="w-5 h-5 text-amber-300" />
                                    Carregar exemplo
                                </Button>
                                <button
                                    onClick={handleClose}
                                    className="w-full mt-3 h-11 text-[13px] font-bold text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    Agora não
                                </button>

                                <p className="text-[10px] text-gray-400 font-medium mt-3 leading-relaxed">
                                    Integração real com bancos via Open Finance do Banco Central vem
                                    em breve.
                                </p>
                            </div>
                        )}

                        {step === "loading" && (
                            <div className="text-center py-10 relative z-10">
                                <Loader2 className="w-12 h-12 text-amber-500 animate-spin mx-auto mb-6" />
                                <h3 className="text-xl font-bold text-gray-800 mb-2">Preparando tudo…</h3>
                                <p className="text-[13px] text-gray-400 font-medium">
                                    Carregando os exemplos
                                </p>
                            </div>
                        )}

                        {step === "success" && (
                            <div className="text-center relative z-10">
                                <div className="w-16 h-16 bg-emerald-500 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-200">
                                    <Check className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-2xl font-black text-gray-800 mb-2 leading-tight">
                                    Pronto!
                                </h3>
                                <p className="text-[14px] text-gray-500 font-medium leading-relaxed mb-6">
                                    Os exemplos já estão no seu histórico. Dá uma olhada nas suas
                                    finanças e veja como a Zella analisa tudo.
                                </p>

                                <Button
                                    className="w-full h-14 bg-gray-900 hover:bg-black text-white font-bold rounded-2xl flex items-center justify-center gap-2"
                                    onClick={handleClose}
                                >
                                    <Sparkles className="w-5 h-5 text-yellow-400" />
                                    Explorar agora
                                </Button>
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
