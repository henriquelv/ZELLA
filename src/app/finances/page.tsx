"use client";

import { useState, useRef } from "react";
import { useUserStoreHydrated } from "@/store/useStore";
import { supabase } from "@/lib/supabase";
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
    History
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BottomNav } from "@/components/ui/bottom-nav";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { PageLoader } from "@/components/ui/page-loader";
import { ExpenseDistributionChart } from "@/components/ui/expense-distribution-chart";
import { InsightsWidget } from "@/components/ui/insights-widget";
import { AddTransactionModal } from "@/components/ui/add-transaction-modal";
import { AIFinancialChat } from "@/components/ui/ai-financial-chat";

export default function FinancesPage() {
    const user = useUserStoreHydrated((state) => state);
    const [activeTab, setActiveTab] = useState<"overview" | "transactions" | "import">("overview");
    const [isChatOpen, setIsChatOpen] = useState(false);

    // Smart Add State
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analyzeSuccess, setAnalyzeSuccess] = useState(false);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState<'income' | 'expense'>('expense');

    // File upload state
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);

    if (!user) {
        return <PageLoader message="Carregando carteira..." />;
    }

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            // Simulated Supabase Upload
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = `uploads/${fileName}`;

            await supabase.storage.from('documents').upload(filePath, file);
        } catch (error) {
            console.error('Error uploading file:', error);
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }

        // --- Simulated OCR Extraction instead of text area ---
        setIsAnalyzing(true);
        setAnalyzeSuccess(false);

        // Fake network/AI processing delay
        setTimeout(() => {
            // Mocked Extracted Data
            const mockTransactions = [
                { category: "Mercado IA", amount: 145.90, type: "expense" as const },
                { category: "Uber IA", amount: 22.50, type: "expense" as const },
                { category: "Lanche IA", amount: 35.00, type: "expense" as const }
            ];

            mockTransactions.forEach(t => {
                user.addTransaction({
                    id: crypto.randomUUID(),
                    amount: t.amount,
                    category: t.category,
                    type: t.type,
                    date: new Date().toISOString()
                });
            });

            user.addXp(35); // Reward for using AI Import
            setIsAnalyzing(false);
            setAnalyzeSuccess(true);

            setTimeout(() => setAnalyzeSuccess(false), 4000);
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-background pb-28 relative overflow-x-hidden selection:bg-primary/20">
            {/* Header */}
            <header className="px-6 pt-14 pb-4">
                <div className="flex justify-between items-end mb-6">
                    <div>
                        <h1 className="text-3xl font-bold font-heading">Sua Base</h1>
                        <p className="text-sm text-muted-foreground font-medium mt-1">Controle de Recursos e Vazamentos</p>
                    </div>
                </div>

                {/* 3 Tabs Navigation */}
                <div className="flex bg-muted/50 p-1 rounded-2xl w-full">
                    <button
                        onClick={() => setActiveTab("overview")}
                        className={cn(
                            "flex-1 py-2 text-[11px] font-bold rounded-xl transition-all flex items-center justify-center gap-1.5",
                            activeTab === "overview" ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <History className="w-3.5 h-3.5" /> Visão Geral
                    </button>
                    <button
                        onClick={() => setActiveTab("transactions")}
                        className={cn(
                            "flex-1 py-2 text-[11px] font-bold rounded-xl transition-all flex items-center justify-center gap-1.5",
                            activeTab === "transactions" ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <PlusCircle className="w-3.5 h-3.5" /> Transações
                    </button>
                    <button
                        onClick={() => setActiveTab("import")}
                        className={cn(
                            "flex-1 py-2 text-[11px] font-bold rounded-xl transition-all flex items-center justify-center gap-1.5",
                            activeTab === "import" ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <Sparkles className="w-3.5 h-3.5" /> Importação IA
                    </button>
                </div>
            </header>

            <main className="px-6">
                <AnimatePresence mode="wait">
                    {/* --- ABA 1: VISÃO GERAL (OVERVIEW) --- */}
                    {activeTab === "overview" && (
                        <motion.div
                            key="overview"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-6"
                        >
                            <Card className="border-border/50 shadow-md">
                                <CardContent className="p-6">
                                    <p className="text-sm text-muted-foreground font-medium mb-1">Saldo Atual</p>
                                    <h2 className="text-3xl font-bold tracking-tight">
                                        R$ {user.transactions.reduce((acc, t) => t.type === 'income' ? acc + t.amount : acc - t.amount, 0).toFixed(2)}
                                    </h2>

                                    <div className="flex gap-4 mt-6">
                                        <div className="flex-1 bg-emerald-500/10 rounded-xl p-3 border border-emerald-500/20">
                                            <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider mb-1">Conquistas</p>
                                            <p className="text-sm font-bold text-emerald-500">
                                                + R$ {user.transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0).toFixed(2)}
                                            </p>
                                        </div>
                                        <div className="flex-1 bg-destructive/10 rounded-xl p-3 border border-destructive/20">
                                            <p className="text-[10px] text-destructive font-bold uppercase tracking-wider mb-1">Vazamentos</p>
                                            <p className="text-sm font-bold border-destructive text-destructive">
                                                - R$ {user.transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0).toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <InsightsWidget transactions={user.transactions} />

                            <div className="pb-4">
                                <ExpenseDistributionChart transactions={user.transactions} />
                            </div>
                        </motion.div>
                    )}

                    {/* --- ABA 2: TRANSAÇÕES (MANUAL) --- */}
                    {activeTab === "transactions" && (
                        <motion.div
                            key="transactions"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-6"
                        >
                            <div className="grid grid-cols-2 gap-4">
                                <Card
                                    onClick={() => { setModalType('income'); setIsModalOpen(true); }}
                                    className="border-border/50 hover:border-emerald-500/50 transition-colors cursor-pointer group active:scale-95 shadow-sm"
                                >
                                    <CardContent className="p-6 flex flex-col items-center justify-center text-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <PlusCircle className="w-6 h-6" />
                                        </div>
                                        <h3 className="font-bold text-sm">Registrar Conquista</h3>
                                    </CardContent>
                                </Card>

                                <Card
                                    onClick={() => { setModalType('expense'); setIsModalOpen(true); }}
                                    className="border-border/50 hover:border-destructive/50 transition-colors cursor-pointer group active:scale-95 shadow-sm"
                                >
                                    <CardContent className="p-6 flex flex-col items-center justify-center text-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <MinusCircle className="w-6 h-6" />
                                        </div>
                                        <h3 className="font-bold text-sm">Registrar Vazamento</h3>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="pt-2 space-y-4">
                                <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Histórico Recente</h3>

                                {user.transactions.length === 0 ? (
                                    <div className="text-center py-10 opacity-50">
                                        <p className="text-sm font-medium">Nenhum lançamento no histórico ainda.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {user.transactions.slice(0, 10).map(t => (
                                            <div key={t.id} className="flex justify-between items-center p-4 bg-card rounded-2xl border border-border/50 shadow-sm cursor-pointer hover:border-primary/20 hover:shadow-md transition-all active:scale-[0.99]">
                                                <div className="flex items-center gap-3">
                                                    <div className={cn(
                                                        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                                                        t.type === 'expense' ? "bg-destructive/10 text-destructive" : "bg-emerald-500/10 text-emerald-600"
                                                    )}>
                                                        {t.type === 'expense' ? <MinusCircle className="w-5 h-5" /> : <PlusCircle className="w-5 h-5" />}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-bold text-sm capitalize truncate pr-2">{t.category}</p>
                                                        <p className="text-xs text-muted-foreground">{new Date(t.date).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                <span className={cn(
                                                    "font-bold shrink-0",
                                                    t.type === 'expense' ? "text-foreground" : "text-emerald-500"
                                                )}>
                                                    {t.type === 'expense' ? "-" : "+"}R$ {t.amount.toFixed(2)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* --- ABA 3: IMPORTAÇÃO IA (SMART) --- */}
                    {activeTab === "import" && (
                        <motion.div
                            key="import"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-6"
                        >
                            <Card className="border-primary/20 shadow-xl shadow-primary/5 bg-gradient-to-br from-card to-primary/5 ring-1 ring-primary/10 overflow-hidden relative group">
                                <div className="absolute -right-10 -top-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

                                <CardContent className="p-5 relative z-10">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                                            <Sparkles className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-base">Leitura Inteligente</h3>
                                            <p className="text-xs text-muted-foreground mt-0.5">Extraia transações de textos, faturas e arquivos com IA.</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        {/* Dynamic Success State */}
                                        <AnimatePresence mode="popLayout">
                                            {analyzeSuccess ? (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.95 }}
                                                    className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6 text-center"
                                                >
                                                    <div className="w-14 h-14 bg-emerald-500 rounded-full text-white mx-auto flex items-center justify-center mb-3 shadow-lg shadow-emerald-500/25">
                                                        <CheckCircle2 className="w-8 h-8" />
                                                    </div>
                                                    <h4 className="font-bold text-lg text-emerald-600">Nota Processada!</h4>
                                                    <p className="text-sm font-medium text-emerald-600/80 mt-1">Lançamentos inseridos com sucesso (+35 XP)</p>
                                                </motion.div>
                                            ) : isAnalyzing ? (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.95 }}
                                                    className="bg-primary/5 border border-primary/20 rounded-2xl p-6 text-center"
                                                >
                                                    <div className="w-14 h-14 bg-primary/20 rounded-full text-primary mx-auto flex items-center justify-center mb-3">
                                                        <Loader2 className="w-8 h-8 animate-spin" />
                                                    </div>
                                                    <h4 className="font-bold text-lg text-primary">Analisando Imagem...</h4>
                                                    <p className="text-sm font-medium text-muted-foreground mt-1">Nossa IA está lendo cada item do comprovante.</p>
                                                </motion.div>
                                            ) : (
                                                <motion.div
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                >
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <input
                                                            type="file"
                                                            ref={fileInputRef}
                                                            className="hidden"
                                                            accept=".pdf,image/*"
                                                            onChange={handleFileUpload}
                                                        />
                                                        <Button
                                                            variant="outline"
                                                            className="h-20 bg-card border-dashed border-2 hover:bg-primary/5 hover:border-primary/30 flex flex-col gap-2 font-bold cursor-pointer transition-all"
                                                            onClick={() => fileInputRef.current?.click()}
                                                            disabled={isUploading}
                                                        >
                                                            {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-6 h-6 text-primary" />}
                                                            {isUploading ? "Enviando..." : "Nota Fiscal"}
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            className="h-20 bg-card border-dashed border-2 hover:bg-primary/5 hover:border-primary/30 flex flex-col gap-2 font-bold cursor-pointer transition-all"
                                                            onClick={() => fileInputRef.current?.click()}
                                                            disabled={isUploading}
                                                        >
                                                            <FileText className="w-6 h-6 text-indigo-500" /> Importar PDF
                                                        </Button>
                                                    </div>

                                                    <p className="text-[10px] text-center text-muted-foreground uppercase tracking-wider font-bold mt-4">
                                                        {isUploading ? "Conectando ao Supabase Storage..." : "Basta enviar a foto da nota ou pdf do extrato"}
                                                    </p>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Modal for adding manual transactions */}
            <AddTransactionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                initialType={modalType}
            />

            {/* AI Chat */}
            <AIFinancialChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

            {/* Floating AI Chat button */}
            {!isChatOpen && (
                <button
                    onClick={() => setIsChatOpen(true)}
                    className="fixed bottom-24 right-5 z-40 w-14 h-14 bg-gradient-to-tr from-[#1a3fa8] to-[#2563eb] rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 hover:scale-110 active:scale-95 transition-all"
                    aria-label="Abrir Zella AI"
                >
                    <Sparkles className="w-6 h-6 text-white" />
                </button>
            )}

            <BottomNav />
        </div>
    );
}
