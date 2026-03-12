import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, PlusCircle, MinusCircle, Loader2, AlertTriangle, ScanLine, FileText } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";
import { useUserStoreHydrated } from "@/store/useStore";
import { useGameSound } from "@/hooks/use-game-sound";
import { toast } from "sonner";

interface AddTransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialType?: 'income' | 'expense';
}

export function AddTransactionModal({ isOpen, onClose, initialType = 'expense' }: AddTransactionModalProps) {
    const user = useUserStoreHydrated((state) => state);
    const { playSound } = useGameSound();
    const [type, setType] = useState<'income' | 'expense'>(initialType);
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [missionTriggered, setMissionTriggered] = useState<{ category: string, amount: number } | null>(null);

    useEffect(() => {
        if (isOpen) {
            setMissionTriggered(null);
            setType(initialType);
            setAmount("");
            setCategory("");
            setIsSubmitting(false);
        }
    }, [isOpen, initialType]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen || !user) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || !category) return;

        const numAmount = parseFloat(amount.replace(",", "."));
        if (isNaN(numAmount) || numAmount <= 0) return;

        setIsSubmitting(true);

        setTimeout(() => {
            user.addTransaction({
                id: crypto.randomUUID(),
                amount: numAmount,
                category,
                type,
                date: new Date().toISOString()
            });

            user.addXp(10);

            const nonEssentialCategories = ["Lazer", "Roupas", "Tecnologia", "Festas"];
            if (type === 'expense' && numAmount > 100 && nonEssentialCategories.includes(category)) {
                setIsSubmitting(false);
                setMissionTriggered({ category, amount: numAmount });
                playSound('error');
                user.addGoal({
                    id: crypto.randomUUID(),
                    title: `Freiar gastos com ${category}`,
                    description: `Compra alta (R$ ${numAmount.toFixed(2)}) detectada. Evite gastar com ${category} por 7 dias.`,
                    category: 'spending',
                    xpReward: 150,
                    completed: false,
                    createdAt: new Date().toISOString()
                });
                setTimeout(() => {
                    setAmount("");
                    setCategory("");
                    setMissionTriggered(null);
                    onClose();
                }, 3000);
                return;
            }

            setIsSubmitting(false);
            setAmount("");
            setCategory("");
            playSound('coin');
            onClose();
        }, 500);
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    transition={{ type: "spring", damping: 30, stiffness: 300 }}
                    className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl p-8 sm:p-10 relative overflow-hidden shadow-2xl"
                    onClick={(e: React.MouseEvent) => e.stopPropagation()}
                >
                    <button onClick={onClose} className="absolute top-5 right-5 p-2.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors z-20 group">
                        <X className="w-5 h-5 text-gray-500 group-hover:rotate-90 transition-transform" />
                    </button>

                    <AnimatePresence>
                        {missionTriggered && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 z-30 bg-white rounded-t-3xl sm:rounded-3xl flex flex-col items-center justify-center p-8 text-center border-2 border-red-100"
                            >
                                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-5">
                                    <AlertTriangle className="w-8 h-8" />
                                </div>
                                <h3 className="font-bold text-2xl text-red-600 mb-2">Alarme de Gasto!</h3>
                                <p className="text-gray-600 text-[15px] leading-relaxed mb-6">
                                    R$ {missionTriggered.amount.toFixed(2)} em <strong className="text-[#2563eb]">{missionTriggered.category}</strong>
                                </p>
                                <div className="bg-orange-50 border border-orange-100 p-5 rounded-2xl">
                                    <p className="font-bold text-orange-600 text-[11px] uppercase tracking-wider mb-1">Missão Contextual</p>
                                    <p className="text-[14px] text-gray-600 leading-relaxed">
                                        Sobreviva 7 dias sem compras nesta categoria e ganhe <span className="text-orange-500 font-bold">150 XP</span>.
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className={missionTriggered ? "opacity-0 pointer-events-none scale-95" : "opacity-100 transition-all duration-500"}>
                        <div className="mb-8 flex justify-between items-start">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Nova Transação</h2>
                                <p className="text-[13px] text-gray-400 mt-1">Adicione sua receita ou despesa</p>
                            </div>
                            <label className="relative flex flex-col items-center justify-center p-3 rounded-2xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors cursor-pointer group shadow-sm border border-indigo-100">
                                {isScanning ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <ScanLine className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                )}
                                <span className="text-[10px] font-bold mt-1 uppercase tracking-wider">Scanner</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    capture="environment"
                                    className="hidden"
                                    disabled={isScanning || isSubmitting}
                                    onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;

                                        setIsScanning(true);
                                        toast.loading("Zella IA está lendo o documento...", { id: "scan" });
                                        try {
                                            const formData = new FormData();
                                            formData.append("file", file);

                                            const res = await fetch("/api/extract", {
                                                method: "POST",
                                                body: formData
                                            });

                                            if (!res.ok) throw new Error("Erro na IA do Scanner");

                                            const data = await res.json();
                                            if (data.transactions && data.transactions.length > 0) {
                                                const firstTx = data.transactions[0];
                                                setAmount(firstTx.amount.toString());
                                                setCategory(firstTx.category || "Outros");
                                                setType(firstTx.type === "income" ? "income" : "expense");
                                                toast.success("Dados preenchidos pela IA!", { id: "scan" });
                                                playSound("coin");
                                            } else {
                                                throw new Error("Não achou nada válido");
                                            }
                                        } catch (err: any) {
                                            toast.error(err.message || "Erro ao ler extrato.", { id: "scan" });
                                        } finally {
                                            setIsScanning(false);
                                            e.target.value = ""; // reset input
                                        }
                                    }}
                                />
                            </label>
                        </div>

                        <div className="flex bg-gray-100 p-1.5 rounded-2xl mb-8">
                            <button
                                type="button"
                                onClick={() => { setType('income'); playSound('click'); }}
                                className={cn(
                                    "flex-1 py-3.5 text-[12px] font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50",
                                    type === 'income' ? "bg-emerald-500 text-white shadow-md" : "text-gray-500 hover:text-gray-700"
                                )}
                                disabled={isSubmitting}
                            >
                                <PlusCircle className="w-4 h-4" /> Receita
                            </button>
                            <button
                                type="button"
                                onClick={() => { setType('expense'); playSound('click'); }}
                                className={cn(
                                    "flex-1 py-3.5 text-[12px] font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50",
                                    type === 'expense' ? "bg-red-500 text-white shadow-md" : "text-gray-500 hover:text-gray-700"
                                )}
                                disabled={isSubmitting}
                            >
                                <MinusCircle className="w-4 h-4" /> Despesa
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Valor (R$)</label>
                                <div className="flex items-baseline">
                                    <span className="text-2xl font-bold text-gray-300 mr-2">R$</span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        inputMode="decimal"
                                        placeholder="0,00"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="w-full text-5xl font-bold bg-transparent border-none focus:ring-0 focus:outline-none py-2 text-gray-900 placeholder:text-gray-200"
                                        required
                                        disabled={isSubmitting}
                                        autoFocus
                                    />
                                </div>
                                <div className="h-px w-full bg-gray-100 mt-2" />
                            </div>

                            <div>
                                <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Categoria</label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full text-[15px] font-semibold bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 focus:border-blue-200 focus:outline-none appearance-none cursor-pointer disabled:opacity-50 text-gray-800"
                                    required
                                    disabled={isSubmitting}
                                >
                                    <option value="">Selecionar...</option>
                                    {(type === 'income' ? ['Salário', 'Freelance', 'Investimentos', 'Presente', 'Venda', 'Outros'] : ['Alimentação', 'Moradia', 'Transporte', 'Saúde', 'Educação', 'Lazer', 'Roupas', 'Tecnologia', 'Assinaturas', 'Festas', 'Outros']).map(opt => (
                                        <option key={opt}>{opt}</option>
                                    ))}
                                </select>
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-14 text-[14px] font-bold rounded-2xl mt-4 shadow-md active:scale-[0.98] transition-all bg-gradient-to-r from-[#2563eb] to-[#1e40af] text-white border-0"
                                disabled={isSubmitting || !amount || !category}
                            >
                                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <PlusCircle className="w-5 h-5 mr-2" />}
                                {isSubmitting ? "Salvando..." : "Registrar"}
                            </Button>
                        </form>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
