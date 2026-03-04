import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, FileText, Trash2 } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

export type ExtractedTransaction = {
    id: string;
    description: string;
    amount: number;
    category: string;
    type: "income" | "expense";
    date: string;
};

interface ExtractReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (transactions: ExtractedTransaction[]) => void;
    initialTransactions: ExtractedTransaction[];
}

export function ExtractReviewModal({ isOpen, onClose, onConfirm, initialTransactions }: ExtractReviewModalProps) {
    const [transactions, setTransactions] = useState<ExtractedTransaction[]>([]);

    // Reset when opened with new data
    React.useEffect(() => {
        if (isOpen) {
            setTransactions(initialTransactions);
        }
    }, [isOpen, initialTransactions]);

    if (!isOpen) return null;

    const handleSave = () => {
        onConfirm(transactions);
    };

    const handleDelete = (id: string) => {
        setTransactions(prev => prev.filter(t => t.id !== id));
    };

    const handleEditAmount = (id: string, newAmount: string) => {
        const parsed = parseFloat(newAmount.replace(',', '.'));
        setTransactions(prev => prev.map(t => t.id === id ? { ...t, amount: isNaN(parsed) ? 0 : parsed } : t));
    };

    const handleEditDescription = (id: string, newDesc: string) => {
        setTransactions(prev => prev.map(t => t.id === id ? { ...t, description: newDesc } : t));
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex flex-col justify-end p-2 pb-6 sm:p-5"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="bg-white rounded-[32px] overflow-hidden shadow-2xl w-full max-w-md mx-auto flex flex-col max-h-[85vh]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-5 text-white flex justify-between items-center relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
                            <div className="relative z-10">
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <FileText className="w-5 h-5" /> Revisar Extrato
                                </h2>
                                <p className="text-blue-100 text-sm mt-0.5">Confirme os lançamentos detectados pela IA</p>
                            </div>
                            <button onClick={onClose} className="relative z-10 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* List */}
                        <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-[#f8fafc]">
                            {transactions.length === 0 ? (
                                <div className="text-center py-10 text-gray-500">
                                    Todos os itens foram removidos.
                                </div>
                            ) : (
                                transactions.map((t) => (
                                    <div key={t.id} className="bg-white rounded-2xl p-4 shadow-sm border border-black/[0.04] relative group">
                                        <button
                                            onClick={() => handleDelete(t.id)}
                                            className="absolute top-3 right-3 text-gray-300 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>

                                        <div className="pr-6 mb-3">
                                            <input
                                                type="text"
                                                value={t.description}
                                                onChange={(e) => handleEditDescription(t.id, e.target.value)}
                                                className="font-bold text-gray-900 border-b border-transparent hover:border-gray-200 focus:border-blue-500 focus:outline-none bg-transparent w-full transition-colors"
                                            />
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wide bg-gray-100 px-2 py-0.5 rounded-md">
                                                    {t.category}
                                                </span>
                                                <span className={cn(
                                                    "text-[11px] font-bold px-2 py-0.5 rounded-md",
                                                    t.type === 'income' ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                                                )}>
                                                    {t.type === 'income' ? 'Entrada' : 'Saída'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-500">{new Date(t.date).toLocaleDateString()}</span>
                                            <div className="flex items-center gap-1">
                                                <span className={cn("font-bold", t.type === 'income' ? "text-emerald-600" : "text-red-500")}>
                                                    R$
                                                </span>
                                                <input
                                                    type="number"
                                                    value={t.amount}
                                                    onChange={(e) => handleEditAmount(t.id, e.target.value)}
                                                    className={cn(
                                                        "font-bold text-lg border-b border-transparent hover:border-gray-200 focus:border-blue-500 focus:outline-none bg-transparent w-24 text-right transition-colors",
                                                        t.type === 'income' ? "text-emerald-600" : "text-red-500"
                                                    )}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-5 bg-white border-t border-black/[0.04]">
                            <Button
                                className="w-full h-14 text-[16px] bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/25 hover:shadow-xl active:scale-[0.98] transition-all"
                                onClick={handleSave}
                                disabled={transactions.length === 0}
                            >
                                <Check className="w-5 h-5 mr-2" />
                                Confirmar {transactions.length} Lançamentos
                            </Button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
