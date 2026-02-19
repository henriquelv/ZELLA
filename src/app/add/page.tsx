"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUserStoreHydrated } from "@/store/useStore";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Check, Coffee, Bus, Home, ShoppingBag, Zap, HeartPulse, MoreHorizontal, Delete } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const CATEGORIES = [
    { id: "food", label: "Alimentação", icon: Coffee, color: "text-orange-500", bg: "bg-orange-500/10" },
    { id: "transport", label: "Transporte", icon: Bus, color: "text-blue-500", bg: "bg-blue-500/10" },
    { id: "home", label: "Casa", icon: Home, color: "text-purple-500", bg: "bg-purple-500/10" },
    { id: "shopping", label: "Compras", icon: ShoppingBag, color: "text-pink-500", bg: "bg-pink-500/10" },
    { id: "bills", label: "Contas", icon: Zap, color: "text-yellow-500", bg: "bg-yellow-500/10" },
    { id: "health", label: "Saúde", icon: HeartPulse, color: "text-red-500", bg: "bg-red-500/10" },
    { id: "other", label: "Outros", icon: MoreHorizontal, color: "text-gray-500", bg: "bg-gray-500/10" },
];

export default function AddExpensePage() {
    const router = useRouter();
    const user = useUserStoreHydrated((state) => state);
    const [amount, setAmount] = useState<string>("0");
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    if (!user) return <div className="min-h-screen bg-background" />;

    const handleNumberClick = (num: string) => {
        if (amount === "0") {
            setAmount(num);
        } else if (amount.length < 9) {
            setAmount(amount + num);
        }
    };

    const handleDelete = () => {
        if (amount.length > 1) {
            setAmount(amount.slice(0, -1));
        } else {
            setAmount("0");
        }
    };

    const handleSave = () => {
        if (!selectedCategory || amount === "0") return;

        const value = parseFloat(amount) / 100; // Assuming input is in cents or plain logic depending on UX

        // For this keypad, let's treat input as raw integers that shift in. 
        // E.g., type 5 -> 0.05, type 0 -> 0.50 ? 
        // OR standard calc style: type 50 -> 50. Let's do standard integer for simplicity first, or simplified cents.
        // Let's implement "Money Input" logic: 123 -> 1.23

        // Actually, for "Speed", simple integer is often faster unless cents matter a lot. 
        // Let's stick to the prompt: "R$ 150". 
        // Let's assume the user types the full number. 

        user.addTransaction({
            id: crypto.randomUUID(),
            amount: parseFloat(amount), // Simple integer approach for MVP speed
            category: selectedCategory,
            type: "expense",
            date: new Date().toISOString(),
        });

        // Feedback & Return
        user.addXp(10); // Reward for registering
        router.back();
    };

    // Formatted Value for Display
    // Using simple integer input for speed: "15" = R$ 15,00
    const formattedValue = new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(parseFloat(amount));

    return (
        <div className="min-h-screen bg-background flex flex-col pt-safe-area">
            {/* Header */}
            <div className="px-6 py-4 flex items-center">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
                    <ArrowLeft className="w-6 h-6" />
                </Button>
                <h1 className="flex-1 text-center font-bold text-lg">Novo Gasto</h1>
                <div className="w-10" /> {/* Spacer */}
            </div>

            {/* Display */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-2">
                <span className="text-muted-foreground font-medium text-sm uppercase tracking-wider">Valor</span>
                <motion.div
                    key={amount}
                    initial={{ scale: 0.9, opacity: 0.5 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-6xl font-bold font-heading text-primary"
                >
                    {formattedValue}
                </motion.div>
            </div>

            {/* Categories */}
            <div className="px-4 pb-4">
                <div className="flex gap-3 overflow-x-auto py-2 scrollbar-none px-2">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={cn(
                                "flex flex-col items-center gap-2 min-w-[72px] p-2 rounded-2xl transition-all border-2",
                                selectedCategory === cat.id
                                    ? "border-primary bg-primary/5 scale-105"
                                    : "border-transparent opacity-60 hover:opacity-100"
                            )}
                        >
                            <div className={cn("w-12 h-12 rounded-full flex items-center justify-center", cat.bg, cat.color)}>
                                <cat.icon className="w-6 h-6" />
                            </div>
                            <span className="text-[10px] font-bold truncate w-full text-center">{cat.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Keypad */}
            <div className="bg-card rounded-t-[32px] p-6 shadow-2xl border-t">
                <div className="grid grid-cols-3 gap-4 mb-6">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, ".", 0].map((num) => (
                        <button
                            key={num}
                            onClick={() => handleNumberClick(num.toString())}
                            className="h-16 rounded-2xl text-2xl font-bold bg-background hover:bg-muted active:scale-95 transition-all outline-none focus:outline-none"
                        >
                            {num}
                        </button>
                    ))}
                    <button
                        onClick={handleDelete}
                        className="h-16 rounded-2xl text-2xl font-bold flex items-center justify-center bg-background/50 hover:bg-destructive/10 text-destructive active:scale-95 transition-all"
                    >
                        <Delete className="w-8 h-8" />
                    </button>
                </div>

                <Button
                    className={cn(
                        "w-full h-16 rounded-2xl text-lg font-bold shadow-lg transition-all",
                        selectedCategory && amount !== "0"
                            ? "bg-primary hover:bg-primary/90 shadow-primary/25"
                            : "bg-muted text-muted-foreground opacity-50"
                    )}
                    disabled={!selectedCategory || amount === "0"}
                    onClick={handleSave}
                >
                    Confirmar Gasto
                </Button>
            </div>
        </div>
    );
}
