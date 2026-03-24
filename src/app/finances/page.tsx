"use client";

import React, { useState, useRef } from "react";
import { useUserStoreHydrated, type Transaction } from "@/store/useStore";
import { motion, AnimatePresence } from "framer-motion";
import {
    PlusCircle,
    MinusCircle,
    Sparkles,
    FileText,
    Upload,
    ArrowRight,
    Loader2,
    CheckCircle2,
    History,
    ShieldAlert,
    Star,
    Wallet,
    ChevronRight,
    X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BottomNav } from "@/components/ui/bottom-nav";
import { cn } from "@/lib/utils";
import { PageLoader } from "@/components/ui/page-loader";
import { AddTransactionModal } from "@/components/ui/add-transaction-modal";
import { AIFinancialChat } from "@/components/ui/ai-financial-chat";
import { ExtractReviewModal, type ExtractedTransaction } from "@/components/ui/extract-review-modal";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function FinancesPage() {
    const user = useUserStoreHydrated((state) => state);
    const [isChatOpen, setIsChatOpen] = useState(false);

    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analyzeSuccess, setAnalyzeSuccess] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalAction, setModalAction] = useState<'select' | 'income' | 'expense' | 'scanner'>('select');
    const [extractedData, setExtractedData] = useState<ExtractedTransaction[] | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!user) {
        return <PageLoader message="Carregando Base..." />;
    }

    const incomingXP = user.transactions.filter(t => t.type === 'income').reduce((acc: number, t: Transaction) => acc + t.amount, 0);
    const damageTaken = user.transactions.filter(t => t.type === 'expense').reduce((acc: number, t: Transaction) => acc + t.amount, 0);
    const netBalance = user.totalBalance ?? (incomingXP - damageTaken);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setModalAction('scanner');
        setIsAnalyzing(true);
        setAnalyzeSuccess(false);

        try {
            const formData = new FormData();
            formData.append("file", file);

            const response = await fetch("/api/extract", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Erro na extração");

            if (data.transactions && data.transactions.length > 0) {
                // Ensure IDs exist for the UI list
                const withIds = data.transactions.map((t: any) => ({
                    ...t,
                    id: crypto.randomUUID(),
                    amount: Number(t.amount)
                }));

                setExtractedData(withIds);
                setIsModalOpen(false); // Close the scanner options modal to show the review modal

            } else {
                toast.error("Nenhum lançamento encontrado");
            }
        } catch (error: any) {
            toast.error("Leitura Falhou", { description: error.message || "Falha na leitura." });
        } finally {
            setIsAnalyzing(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleConfirmExtraction = (reviewedTransactions: ExtractedTransaction[]) => {
        let xpGain = 0;
        reviewedTransactions.forEach((t) => {
            user.addTransaction({
                id: t.id,
                amount: t.amount,
                category: t.category,
                type: t.type,
                date: t.date,
                description: t.description,
                isAiGenerated: true
            });
            xpGain += 10;
        });

        if (xpGain > 0) {
            user.addXp(xpGain + 25);
            toast.success(`${reviewedTransactions.length} lançamentos salvos! (+${xpGain + 25} XP)`);
        }

        setExtractedData(null);
    };

    return (
        <div className="min-h-screen bg-[#f4f6fb] text-gray-900 pb-24 relative overflow-x-hidden font-sans">
            {/* Ambient Background Lights */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[0%] left-[-10%] w-[70%] h-[60%] bg-blue-400/[0.04] rounded-full blur-[120px]" />
                <div className="absolute top-[20%] right-[-10%] w-[60%] h-[50%] bg-emerald-400/[0.03] rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 max-w-lg mx-auto">
                <header className="px-5 pt-14 pb-6 sticky top-0 z-40 bg-transparent flex justify-between items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-extrabold text-gray-800 flex items-center gap-2">
                            <Wallet className="w-6 h-6 text-[#2563eb]" />
                            Base Financeira
                        </h1>
                        <p className="text-[13px] text-gray-400 mt-1 font-medium">Sincronização de campo</p>
                    </div>
                    <div className="flex items-center gap-1.5 bg-white/80 backdrop-blur-md ring-1 ring-black/[0.03] px-3.5 py-2 rounded-xl shadow-sm">
                        <Star className="w-4 h-4 text-amber-500 drop-shadow-sm" />
                        <span className="text-[12px] font-black text-gray-700">{user.xp} XP</span>
                    </div>
                </header>

                <main className="px-5 mb-8">
                    {/* Balance Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white/80 backdrop-blur-md rounded-[2rem] p-6 shadow-xl shadow-blue-900/5 ring-1 ring-black/[0.02] relative overflow-hidden group mb-4"
                    >
                        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-400/10 to-emerald-400/10 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-110 duration-700" />
                        <p className="text-[12px] text-gray-400 font-bold tracking-widest uppercase mb-2">Saldo Atual</p>
                        <h2 className={cn("text-4xl font-black tracking-tighter", netBalance < 0 ? "text-red-500" : "text-gray-800")}>
                            {netBalance < 0 ? "-" : ""}<span className="text-xl text-gray-400 font-bold mr-1">R$</span>{Math.abs(netBalance).toFixed(2)}
                        </h2>

                        <div className="grid grid-cols-2 gap-3 mt-6">
                            <div className="bg-emerald-50/50 backdrop-blur-sm rounded-2xl p-4 ring-1 ring-emerald-100/50">
                                <div className="flex items-center gap-2 mb-2">
                                    <PlusCircle className="w-4 h-4 text-emerald-500" />
                                    <span className="text-[11px] text-emerald-600 font-black uppercase tracking-wider">Entradas</span>
                                </div>
                                <p className="text-[18px] font-black text-emerald-700">R$ {incomingXP.toFixed(2)}</p>
                            </div>
                            <div className="bg-red-50/50 backdrop-blur-sm rounded-2xl p-4 ring-1 ring-red-100/50">
                                <div className="flex items-center gap-2 mb-2">
                                    <ShieldAlert className="w-4 h-4 text-red-400" />
                                    <span className="text-[11px] text-red-500 font-black uppercase tracking-wider">Saídas</span>
                                </div>
                                <p className="text-[18px] font-black text-red-600">R$ {damageTaken.toFixed(2)}</p>
                            </div>
                        </div>
                    </motion.div>
                </main>

                {/* Transaction History */}
                <main className="px-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-[14px] text-gray-500 flex items-center gap-2">
                            <History className="w-4 h-4" /> Histórico
                        </h3>
                    </div>

                    {user.transactions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center bg-white/80 backdrop-blur-md rounded-[1.5rem] shadow-sm ring-1 ring-black/[0.02]">
                            <div className="w-16 h-16 bg-blue-50/80 rounded-[1.25rem] flex items-center justify-center mb-5 ring-1 ring-blue-100 border border-white">
                                <Wallet className="w-8 h-8 text-[#2563eb] drop-shadow-sm" />
                            </div>
                            <h4 className="font-extrabold text-[17px] text-gray-800 mb-2">Nenhuma transação</h4>
                            <p className="text-[13px] text-gray-400 font-bold mb-6 max-w-[230px] leading-relaxed">
                                Registre seu primeiro lançamento para começar.
                            </p>
                            <Button
                                className="h-12 px-8 bg-blue-50 text-blue-600 hover:bg-blue-100 font-extrabold tracking-wide uppercase text-[12px] rounded-xl shadow-sm border border-blue-200"
                                onClick={() => { setModalAction('select'); setIsModalOpen(true); }}
                            >
                                Adicionar
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-3 pb-20">
                            {user.transactions.slice(0, 15).map((t, idx) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.03 }}
                                    key={t.id}
                                    className="flex justify-between items-center p-4 bg-white/80 backdrop-blur-md rounded-[1.25rem] shadow-sm ring-1 ring-black/[0.02] active:scale-[0.98] transition-all group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "w-11 h-11 rounded-[0.75rem] flex items-center justify-center shadow-sm relative overflow-hidden border border-white/50 ring-1",
                                            t.type === 'expense' ? "bg-red-50 text-red-500 ring-red-100" : "bg-emerald-50 text-emerald-500 ring-emerald-100"
                                        )}>
                                            {t.type === 'expense' ? <MinusCircle className="w-5 h-5 drop-shadow-sm group-hover:scale-110 transition-transform" /> : <PlusCircle className="w-5 h-5 drop-shadow-sm group-hover:scale-110 transition-transform" />}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-extrabold text-[14px] text-gray-800 capitalize leading-tight">{t.description || t.category}</p>
                                                {t.isAiGenerated && (
                                                    <span className="text-[8px] font-black text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded-md uppercase tracking-wide border border-blue-100">✨ IA</span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[9px] font-black text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-md uppercase tracking-widest">{t.category}</span>
                                                <p className="text-[11px] text-gray-400 font-bold">{new Date(t.date).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <span className={cn(
                                        "font-black text-[15px]",
                                        t.type === 'expense' ? "text-red-500" : "text-emerald-500"
                                    )}>
                                        {t.type === 'expense' ? "-" : "+"} <span className="text-[12px] opacity-80">R$</span> {Number(t.amount).toFixed(2)}
                                    </span>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </main>
            </div>

            {/* Action Menu */}
            <AnimatePresence>
                {isModalOpen && modalAction === 'select' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex flex-col justify-end p-5 pb-8"
                        onClick={() => setIsModalOpen(false)}
                    >
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="bg-white rounded-3xl p-6 shadow-2xl w-full max-w-sm mx-auto"
                            onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="text-[18px] font-bold text-gray-900">Adicionar</h2>
                                <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
                                    <X className="w-4 h-4 text-gray-500" />
                                </button>
                            </div>
                            <div className="grid grid-cols-2 gap-3 mb-3">
                                <button
                                    onClick={() => setModalAction('income')}
                                    className="bg-emerald-50 hover:bg-emerald-100 p-5 rounded-2xl flex flex-col items-center gap-3 transition-colors active:scale-[0.97] border border-emerald-100"
                                >
                                    <PlusCircle className="w-7 h-7 text-emerald-600" />
                                    <span className="font-semibold text-[13px] text-emerald-700">Receita</span>
                                </button>
                                <button
                                    onClick={() => setModalAction('expense')}
                                    className="bg-red-50 hover:bg-red-100 p-5 rounded-2xl flex flex-col items-center gap-3 transition-colors active:scale-[0.97] border border-red-100"
                                >
                                    <MinusCircle className="w-7 h-7 text-red-500" />
                                    <span className="font-semibold text-[13px] text-red-600">Despesa</span>
                                </button>
                            </div>
                            <button
                                onClick={() => setModalAction('scanner')}
                                className="w-full bg-gradient-to-r from-[#2563eb] to-[#1e40af] hover:opacity-95 p-5 rounded-2xl flex items-center gap-4 transition-all active:scale-[0.98] text-white"
                            >
                                <Sparkles className="w-7 h-7" />
                                <div className="text-left">
                                    <span className="font-bold text-[14px] block">Scanner IA</span>
                                    <span className="text-[12px] text-white/70">Extrair dados de recibo</span>
                                </div>
                                <ChevronRight className="w-5 h-5 text-white/60 ml-auto" />
                            </button>
                        </motion.div>
                    </motion.div>
                )}

                {isModalOpen && modalAction === 'scanner' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex flex-col justify-end p-5 pb-8"
                        onClick={() => setIsModalOpen(false)}
                    >
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="bg-white rounded-3xl p-6 shadow-2xl w-full max-w-sm mx-auto"
                            onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
                        >
                            <div className="flex items-center gap-3 mb-5">
                                <button onClick={() => setModalAction('select')} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                                    <ArrowRight className="w-4 h-4 rotate-180 text-gray-500" />
                                </button>
                                <h2 className="text-[18px] font-bold text-gray-900">Scanner IA</h2>
                            </div>

                            <div className="bg-gray-50 rounded-2xl p-8 text-center border border-gray-100">
                                {analyzeSuccess ? (
                                    <div className="py-4">
                                        <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                                        <h4 className="font-bold text-[18px] text-emerald-600">Dados importados!</h4>
                                    </div>
                                ) : isAnalyzing ? (
                                    <div className="py-6">
                                        <Loader2 className="w-12 h-12 text-[#2563eb] animate-spin mx-auto mb-4" />
                                        <h4 className="font-bold text-[16px] text-gray-700">Analisando...</h4>
                                        <p className="text-[13px] text-gray-400 mt-2">A IA está lendo o documento</p>
                                    </div>
                                ) : (
                                    <div className="py-2">
                                        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                        <p className="text-[14px] text-gray-500 mb-6 leading-relaxed">
                                            Envie uma foto ou PDF do cupom.<br />
                                            <span className="text-[#2563eb] font-semibold">A IA fará a leitura automática.</span>
                                        </p>
                                        <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,image/*" onChange={handleFileUpload} />
                                        <Button
                                            className="w-full h-13 bg-gradient-to-r from-[#2563eb] to-[#1e40af] text-white font-bold rounded-xl shadow-md border-0"
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <Upload className="w-4 h-4 mr-2" /> Enviar arquivo
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Manual Transaction Modal */}
            <AddTransactionModal
                key={modalAction}
                isOpen={(modalAction === 'income' || modalAction === 'expense') && isModalOpen}
                onClose={() => setIsModalOpen(false)}
                initialType={modalAction === 'income' ? 'income' : 'expense'}
            />

            {/* Floating Buttons */}
            {!isModalOpen && !isChatOpen && (
                <div className="fixed bottom-28 right-5 z-40 flex flex-col items-end gap-3">
                    <button
                        onClick={() => setIsChatOpen(true)}
                        className="w-12 h-12 bg-white border border-black/[0.06] rounded-full flex items-center justify-center shadow-lg hover:shadow-xl active:scale-90 transition-all"
                    >
                        <Sparkles className="w-5 h-5 text-[#2563eb]" />
                    </button>
                    <button
                        onClick={() => { setModalAction('select'); setIsModalOpen(true); }}
                        className="w-16 h-16 bg-gradient-to-br from-[#2563eb] to-[#1e40af] text-white rounded-full flex items-center justify-center shadow-xl shadow-blue-500/20 hover:shadow-2xl active:scale-90 transition-all border-0"
                    >
                        <PlusCircle className="w-8 h-8" />
                    </button>
                </div>
            )}

            <ExtractReviewModal
                isOpen={extractedData !== null}
                onClose={() => setExtractedData(null)}
                initialTransactions={extractedData || []}
                onConfirm={handleConfirmExtraction}
            />
            <AIFinancialChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
            <BottomNav />
        </div>
    );
}
