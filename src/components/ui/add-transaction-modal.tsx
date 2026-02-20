import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, PlusCircle, MinusCircle } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";
import { useUserStoreHydrated } from "@/store/useStore";

interface AddTransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialType?: 'income' | 'expense';
}

export function AddTransactionModal({ isOpen, onClose, initialType = 'expense' }: AddTransactionModalProps) {
    const user = useUserStoreHydrated((state) => state);
    const [type, setType] = useState<'income' | 'expense'>(initialType);
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState("");
    const [missionTriggered, setMissionTriggered] = useState<{ category: string, amount: number } | null>(null);

    // Reset when modal opens
    useState(() => {
        if (isOpen) setMissionTriggered(null);
    });

    if (!isOpen || !user) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || !category) return;

        const numAmount = parseFloat(amount.replace(",", "."));
        if (isNaN(numAmount) || numAmount <= 0) return;

        user.addTransaction({
            id: crypto.randomUUID(),
            amount: numAmount,
            category,
            type,
            date: new Date().toISOString()
        });

        // Gamification reward for logging
        user.addXp(10);

        // Check for Contextual Mission Trigger
        const nonEssentialCategories = ["Lazer", "Roupas", "Tecnologia", "Festas"];
        if (type === 'expense' && numAmount > 100 && nonEssentialCategories.includes(category)) {
            setMissionTriggered({ category, amount: numAmount });
            user.addGoal({
                id: crypto.randomUUID(),
                title: `Freiar gastos com ${category}`,
                description: `Compra alta (R$ ${numAmount.toFixed(2)}) detectada. Evite gastar com ${category} por 7 dias.`,
                category: 'spending',
                xpReward: 150,
                completed: false,
                createdAt: new Date().toISOString()
            });
            // Auto close after showing the mission overlay
            setTimeout(() => {
                setAmount("");
                setCategory("");
                setMissionTriggered(null);
                onClose();
            }, 3000);
            return;
        }

        setAmount("");
        setCategory("");
        onClose();
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-end sm:items-center justify-center"
            >
                <motion.div
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="w-full max-w-md bg-card border border-border/50 shadow-2xl rounded-t-3xl sm:rounded-3xl p-6 relative"
                >
                    <button onClick={onClose} className="absolute top-4 right-4 p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors z-20">
                        <X className="w-5 h-5" />
                    </button>

                    <AnimatePresence>
                        {missionTriggered && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 z-10 bg-card rounded-t-3xl sm:rounded-3xl flex flex-col items-center justify-center p-6 text-center border-4 border-destructive/20"
                            >
                                <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mb-4">
                                    <MinusCircle className="w-8 h-8" />
                                </div>
                                <h3 className="font-heading font-bold text-2xl text-destructive mb-2">Alerta de Gasto Alto!</h3>
                                <p className="text-muted-foreground font-medium mb-6">
                                    Identificamos R$ {missionTriggered.amount.toFixed(2)} em <strong className="text-foreground">{missionTriggered.category}</strong>.
                                </p>
                                <div className="bg-orange-500/10 border border-orange-500/30 p-4 rounded-2xl">
                                    <p className="font-bold text-orange-600 uppercase tracking-wider text-[10px] mb-1">Missão Contextual Ativada</p>
                                    <p className="text-sm font-medium text-orange-600/90 gap-1 flex items-center justify-center">
                                        Fique 7 dias sem gastar nesta categoria para ganhar 150 XP. Nova meta adicionada na aba Metas!
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className={missionTriggered ? "opacity-0 pointer-events-none" : "opacity-100 transition-opacity"}>
                        <h2 className="text-xl font-bold font-heading mb-6">Nova Transação</h2>

                        <div className="flex bg-muted/50 p-1 rounded-2xl mb-6">
                            <button
                                type="button"
                                onClick={() => setType('income')}
                                className={cn(
                                    "flex-1 py-2.5 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2",
                                    type === 'income' ? "bg-emerald-500 text-white shadow-md" : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <PlusCircle className="w-4 h-4" /> Receita
                            </button>
                            <button
                                type="button"
                                onClick={() => setType('expense')}
                                className={cn(
                                    "flex-1 py-2.5 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2",
                                    type === 'expense' ? "bg-destructive text-white shadow-md" : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <MinusCircle className="w-4 h-4" /> Despesa
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 block">Valor (R$)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full text-3xl font-bold bg-transparent border-b-2 border-border/50 focus:border-primary focus:outline-none py-2 transition-colors"
                                    required
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 block">Categoria</label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full text-base bg-muted/30 border border-border/50 rounded-xl px-4 py-3 focus:border-primary focus:outline-none transition-colors cursor-pointer"
                                    required
                                >
                                    <option value="">Selecione uma categoria...</option>
                                    {type === 'income' ? (
                                        <>
                                            <option>Salário</option>
                                            <option>Freelance</option>
                                            <option>Investimentos</option>
                                            <option>Presente</option>
                                            <option>Venda</option>
                                            <option>Outro</option>
                                        </>
                                    ) : (
                                        <>
                                            <option>Alimentação</option>
                                            <option>Moradia</option>
                                            <option>Transporte</option>
                                            <option>Saúde</option>
                                            <option>Educação</option>
                                            <option>Lazer</option>
                                            <option>Roupas</option>
                                            <option>Tecnologia</option>
                                            <option>Assinaturas</option>
                                            <option>Festas</option>
                                            <option>Outros</option>
                                        </>
                                    )}
                                </select>
                            </div>

                            <Button type="submit" className="w-full h-14 text-base font-bold rounded-xl mt-4 shadow-lg active:scale-95 transition-all">
                                Confirmar Lançamento
                            </Button>
                        </form>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
