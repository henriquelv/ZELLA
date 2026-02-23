"use client";

import { useState, useRef } from "react";
import { useUserStoreHydrated } from "@/store/useStore";
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
    TrendingUp,
    History,
    ShieldAlert,
    Star,
    Swords,
    Wallet
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BottomNav } from "@/components/ui/bottom-nav";
import { cn } from "@/lib/utils";
import { PageLoader } from "@/components/ui/page-loader";
import { AddTransactionModal } from "@/components/ui/add-transaction-modal";
import { AIFinancialChat } from "@/components/ui/ai-financial-chat";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function FinancesPage() {
    const user = useUserStoreHydrated((state) => state);
    const [isChatOpen, setIsChatOpen] = useState(false);

    // Smart Add State
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analyzeSuccess, setAnalyzeSuccess] = useState(false);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalAction, setModalAction] = useState<'select' | 'income' | 'expense' | 'scanner'>('select');

    // File upload state for Scanner
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!user) {
        return <PageLoader message="Carregando Base..." />;
    }

    // Calculando stats
    const totalXP = user.xp;
    const incomingXP = user.transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const damageTaken = user.transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    const netBalance = incomingXP - damageTaken;

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setModalAction('scanner'); // stay in scanner view
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

            if (!response.ok) {
                throw new Error(data.error || "Erro na extração");
            }

            if (data.transactions && data.transactions.length > 0) {
                let xpGain = 0;
                data.transactions.forEach((t: any) => {
                    user.addTransaction({
                        id: crypto.randomUUID(),
                        amount: Number(t.amount),
                        category: t.category,
                        type: t.type === 'income' ? 'income' : 'expense',
                        date: new Date().toISOString(),
                        isAiGenerated: true
                    });
                    xpGain += 10;
                });

                user.addXp(xpGain + 25);
                setAnalyzeSuccess(true);
                setTimeout(() => {
                    setAnalyzeSuccess(false);
                    setIsModalOpen(false); // fechar após sucesso
                }, 3000);
            } else {
                toast.error("Nenhum lançamento encontrado", {
                    description: "A IA não conseguiu identificar nenhuma transação válida no documento."
                });
            }

        } catch (error: any) {
            console.error('Error extracting file:', error);
            toast.error("Leitura Falhou", {
                description: error.message || "Falha na leitura."
            });
        } finally {
            setIsAnalyzing(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground pb-32 relative overflow-x-hidden">
            {/* Ambient Background Glow */}
            <div className="fixed top-0 left-0 right-0 h-96 bg-gradient-to-b from-primary/5 via-background to-background pointer-events-none z-0" />
            <div className="fixed top-20 -right-20 w-72 h-72 bg-primary/5 rounded-full blur-[100px] pointer-events-none z-0" />

            <div className="relative z-10">
                {/* Header (Status Bar RPG) */}
                <header className="px-6 pt-14 pb-4">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-3xl font-black font-heading tracking-tight flex items-center gap-2">
                                <Swords className="w-7 h-7 text-primary" /> Base
                            </h1>
                            <p className="text-xs text-muted-foreground/80 font-medium mt-1 uppercase tracking-[0.2em]">
                                Seu Registro de Batalha
                            </p>
                        </div>
                    </div>

                    {/* Main Stats Card (Glassmorphism) */}
                    <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-2xl overflow-hidden relative">
                        {/* Glow effect inside card */}
                        <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                        <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                                        Saldo Vital
                                    </p>
                                    <h2 className={cn("text-4xl font-black tracking-tighter drop-shadow-[0_0_15px_rgba(var(--primary),0.3)]", netBalance < 0 ? "text-destructive" : "text-foreground")}>
                                        R$ {netBalance.toFixed(2)}
                                    </h2>
                                </div>
                                <div className="text-right">
                                    <div className="inline-flex items-center justify-center bg-yellow-500/10 px-3 py-1.5 rounded-full border border-yellow-500/20">
                                        <Star className="w-4 h-4 text-yellow-500 mr-1.5" />
                                        <span className="font-bold text-yellow-500 text-sm">{totalXP} XP</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-emerald-500/10 rounded-2xl p-4 border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)] relative overflow-hidden group">
                                    <div className="absolute right-0 top-0 w-16 h-16 bg-emerald-500/10 rounded-full blur-xl group-hover:bg-emerald-500/20 transition-all" />
                                    <div className="flex items-center gap-2 mb-1 z-10 relative">
                                        <PlusCircle className="w-4 h-4 text-emerald-500" />
                                        <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">Loot (Ganhos)</p>
                                    </div>
                                    <p className="text-lg font-black text-emerald-600 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)] z-10 relative">
                                        R$ {incomingXP.toFixed(2)}
                                    </p>
                                </div>
                                <div className="bg-destructive/10 rounded-2xl p-4 border border-destructive/20 shadow-[0_0_20px_rgba(239,68,68,0.1)] relative overflow-hidden group">
                                    <div className="absolute right-0 top-0 w-16 h-16 bg-destructive/10 rounded-full blur-xl group-hover:bg-destructive/20 transition-all" />
                                    <div className="flex items-center gap-2 mb-1 z-10 relative">
                                        <ShieldAlert className="w-4 h-4 text-destructive" />
                                        <p className="text-[10px] text-destructive font-bold uppercase tracking-wider">Dano (Gastos)</p>
                                    </div>
                                    <p className="text-lg font-black text-destructive drop-shadow-[0_0_8px_rgba(239,68,68,0.5)] z-10 relative">
                                        R$ {damageTaken.toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </header>

                {/* Battle Log (Histórico) */}
                <main className="px-6 mt-4">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                            <History className="w-4 h-4" /> Últimas Ações
                        </h3>
                    </div>

                    {user.transactions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center px-4 bg-muted/30 backdrop-blur-md rounded-3xl border border-border/50 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
                            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-5 text-primary">
                                <Swords className="w-10 h-10" />
                            </div>
                            <h4 className="font-black text-xl mb-2 text-foreground">O Diário está limpo</h4>
                            <p className="text-sm text-muted-foreground/80 mb-6 max-w-[250px]">
                                Toda lenda começa com sua primeira ação. Registre um Loot (Ganho) ou um Dano (Gasto).
                            </p>
                            <Button
                                className="h-12 px-8 bg-primary text-primary-foreground font-black rounded-xl hover:scale-105 transition-transform shadow-lg shadow-primary/25"
                                onClick={() => { setModalAction('select'); setIsModalOpen(true); }}
                            >
                                Registrar Ação
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-3 pb-6">
                            {user.transactions.slice(0, 15).map((t, idx) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    key={t.id}
                                    className="flex justify-between items-center p-4 bg-card border border-border/50 hover:bg-muted/50 backdrop-blur-sm rounded-2xl transition-all cursor-pointer group active:scale-[0.98] shadow-sm"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-inner",
                                            t.type === 'expense'
                                                ? "bg-gradient-to-br from-destructive/20 to-destructive/5 text-red-400 border border-destructive/20"
                                                : "bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 text-emerald-400 border border-emerald-500/20"
                                        )}>
                                            {t.type === 'expense' ? <MinusCircle className="w-6 h-6" /> : <PlusCircle className="w-6 h-6" />}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="font-bold text-sm capitalize truncate text-foreground group-hover:text-primary transition-colors">{t.category}</p>
                                                {t.isAiGenerated && (
                                                    <Badge variant="outline" className="text-[9px] uppercase tracking-widest text-[#3b82f6] border-[#3b82f6]/30 px-1 py-0 h-4 bg-[#3b82f6]/10 shadow-[0_0_10px_rgba(59,130,246,0.3)]">✨ IA</Badge>
                                                )}
                                            </div>
                                            <p className="text-[10px] font-bold tracking-wider uppercase text-muted-foreground/70 mt-0.5">{new Date(t.date).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className={cn(
                                            "font-black text-base shrink-0 block",
                                            t.type === 'expense' ? "text-red-400" : "text-emerald-400"
                                        )}>
                                            {t.type === 'expense' ? "-" : "+"}R$ {t.amount.toFixed(2)}
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </main>
            </div>

            {/* ACTION MENU OVERLAY (The replacement for tabs) */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col justify-end p-4 pb-8"
                        onClick={() => setIsModalOpen(false)}
                    >
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="bg-[#18181b] border border-white/10 rounded-3xl p-6 relative w-full max-w-md mx-auto"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="absolute left-1/2 -top-3 w-12 h-1.5 bg-white/20 rounded-full -translate-x-1/2" />

                            <AnimatePresence mode="wait">
                                {modalAction === 'select' && (
                                    <motion.div key="select" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                                        <h2 className="text-xl font-black font-heading tracking-tight mb-6 text-foreground text-center">O que você fará?</h2>
                                        <div className="grid grid-cols-2 gap-4">
                                            <button
                                                onClick={() => { setModalAction('income'); }}
                                                className="bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 p-6 rounded-2xl flex flex-col items-center justify-center gap-3 transition-colors group"
                                            >
                                                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                    <PlusCircle className="w-6 h-6" />
                                                </div>
                                                <span className="font-bold text-sm text-emerald-600">Add Loot</span>
                                            </button>
                                            <button
                                                onClick={() => { setModalAction('expense'); }}
                                                className="bg-destructive/10 hover:bg-destructive/20 border border-destructive/20 p-6 rounded-2xl flex flex-col items-center justify-center gap-3 transition-colors group"
                                            >
                                                <div className="w-12 h-12 rounded-full bg-destructive/20 text-red-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                    <MinusCircle className="w-6 h-6" />
                                                </div>
                                                <span className="font-bold text-sm text-destructive">Add Dano</span>
                                            </button>
                                            <button
                                                onClick={() => { setModalAction('scanner'); }}
                                                className="col-span-2 bg-primary/10 hover:bg-primary/20 border border-primary/20 p-6 rounded-2xl flex flex-col items-center justify-center gap-3 transition-colors group relative overflow-hidden"
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none" />
                                                <div className="w-12 h-12 rounded-full bg-primary/20 text-primary flex items-center justify-center group-hover:scale-110 transition-transform relative z-10">
                                                    <Sparkles className="w-6 h-6" />
                                                </div>
                                                <span className="font-black text-sm text-primary relative z-10">Zella Scanner IA</span>
                                                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider relative z-10">Ler Nota ou Extrato</span>
                                            </button>
                                        </div>
                                    </motion.div>
                                )}

                                {modalAction === 'scanner' && (
                                    <motion.div key="scanner" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                                        <div className="flex justify-between items-center mb-6">
                                            <button onClick={() => setModalAction('select')} className="text-muted-foreground hover:text-white p-2 -ml-2">
                                                <ArrowRight className="w-5 h-5 rotate-180" />
                                            </button>
                                            <h2 className="text-xl font-black font-heading text-white">Scanner Mágico</h2>
                                            <div className="w-8" />
                                        </div>

                                        <div className="bg-primary/5 border border-primary/20 rounded-3xl p-6 text-center">
                                            {analyzeSuccess ? (
                                                <div className="py-6">
                                                    <div className="w-16 h-16 bg-emerald-500 rounded-full text-white mx-auto flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(16,185,129,0.4)]">
                                                        <CheckCircle2 className="w-8 h-8" />
                                                    </div>
                                                    <h4 className="font-black text-xl text-emerald-400">Loot Confirmado!</h4>
                                                    <p className="text-sm font-medium text-emerald-400/80 mt-1">+ XP Adicionado ao Perfil</p>
                                                </div>
                                            ) : isAnalyzing ? (
                                                <div className="py-8">
                                                    <div className="w-16 h-16 bg-primary/20 rounded-full text-primary mx-auto flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(37,99,235,0.4)]">
                                                        <Loader2 className="w-8 h-8 animate-spin" />
                                                    </div>
                                                    <h4 className="font-black text-xl text-primary">Decodificando...</h4>
                                                    <p className="text-sm font-medium text-primary/70 mt-2" style={{ textWrap: 'balance' }}>A IA está lendo seu artefato e registrando tudo.</p>
                                                </div>
                                            ) : (
                                                <div className="py-2">
                                                    <div className="w-16 h-16 bg-primary/10 rounded-full text-primary mx-auto flex items-center justify-center mb-4">
                                                        <FileText className="w-8 h-8" />
                                                    </div>
                                                    <p className="text-sm text-white/70 mb-6 px-4" style={{ textWrap: 'balance' }}>
                                                        Envie a foto ou PDF da fatura/cupom. A IA fará o trabalho sujo.
                                                    </p>
                                                    <input
                                                        type="file"
                                                        ref={fileInputRef}
                                                        className="hidden"
                                                        accept=".pdf,image/*"
                                                        onChange={handleFileUpload}
                                                    />
                                                    <Button
                                                        className="w-full h-14 bg-primary text-primary-foreground font-black text-base rounded-xl hover:scale-[1.02] transition-transform shadow-[0_0_20px_rgba(37,99,235,0.4)]"
                                                        onClick={() => fileInputRef.current?.click()}
                                                    >
                                                        <Upload className="w-5 h-5 mr-2" />
                                                        Abrir Artefato
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}

                                {/* Integrar via AddTransactionModal para entradas manuais - precisamos gerenciar estado se estavamos em 'income' ou 'expense' */}
                            </AnimatePresence>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Manual ADD via existing modal component if chosen */}
            <AddTransactionModal
                isOpen={(modalAction === 'income' || modalAction === 'expense') && isModalOpen}
                onClose={() => setIsModalOpen(false)}
                initialType={modalAction === 'income' ? 'income' : 'expense'}
            />

            {/* Floating Main Action Button */}
            {!isModalOpen && !isChatOpen && (
                <div className="fixed bottom-24 right-5 z-40 flex flex-col items-end gap-3">
                    <div className="flex items-center gap-3">
                        <span className="bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-border shadow-sm">IA Chat</span>
                        <button
                            onClick={() => setIsChatOpen(true)}
                            className="w-12 h-12 bg-primary/10 backdrop-blur-md border border-primary/20 rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all outline-none"
                        >
                            <Sparkles className="w-5 h-5 text-primary" />
                        </button>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="bg-primary px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-primary-foreground shadow-lg">Adicionar</span>
                        <button
                            onClick={() => { setModalAction('select'); setIsModalOpen(true); }}
                            className="w-16 h-16 bg-primary text-primary-foreground rounded-3xl flex items-center justify-center shadow-[0_10px_30px_rgba(var(--primary-rgb),0.3)] hover:scale-105 active:scale-95 transition-all outline-none border-t border-white/20 relative overflow-hidden"
                        >
                            <PlusCircle className="w-8 h-8 relative z-10" />
                            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />
                        </button>
                    </div>
                </div>
            )}

            {/* AI Chat */}
            <AIFinancialChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

            <BottomNav />
        </div>
    );
}
