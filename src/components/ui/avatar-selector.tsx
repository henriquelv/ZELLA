"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Lock, X, Trophy } from "lucide-react";
import { useUserStore } from "@/store/useStore";
import { cn } from "@/lib/utils";

export const AVATARS = [
    { id: "default", name: "Iniciante", icon: "👤", color: "bg-slate-500", cost: 0 },
    { id: "dog", name: "Parceiro", icon: "🐶", color: "bg-orange-500", cost: 150 },
    { id: "lion", name: "Rei da Selva", icon: "🦁", color: "bg-yellow-500", cost: 400 },
    { id: "dragon", name: "Mítico", icon: "🐲", color: "bg-red-500", cost: 800 },
    { id: "robot", name: "Futuro", icon: "🤖", color: "bg-blue-500", cost: 1500 },
    { id: "alien", name: "Outro Mundo", icon: "👽", color: "bg-emerald-500", cost: 3000 },
];

export function AvatarSelector({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const { activeAvatar, setActiveAvatar, unlockedAvatars, unlockAvatar, xp } = useUserStore();

    if (!isOpen) return null;

    const handleAvatarClick = (avId: string, cost: number, isUnlocked: boolean) => {
        if (isUnlocked) {
            setActiveAvatar(avId);
            onClose();
        } else {
            if (xp >= cost) {
                const success = unlockAvatar(avId, cost);
                if (success) {
                    setActiveAvatar(avId);
                    // could trigger a toast here if configured: toast.success("Avatar Desbloqueado!")
                }
            } else {
                // Not enough XP
                // alert or toast "XP Insuficiente!"
            }
        }
    }

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />

                {/* Modal / Bottom Sheet */}
                <motion.div
                    initial={{ y: "100%", opacity: 0.5 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: "100%", opacity: 0.5 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="relative w-full max-w-md bg-background rounded-t-[2rem] sm:rounded-[2rem] p-6 pb-20 sm:pb-6 shadow-2xl border border-border/50"
                >
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-xl font-bold font-heading">Loja de Avatares</h2>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">Seu saldo: <Trophy className="w-3 h-3 text-yellow-500" /> <span className="font-bold text-foreground">{xp} XP</span></p>
                        </div>
                        <button onClick={onClose} className="p-2 bg-muted rounded-full hover:bg-muted/80 transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {AVATARS.map((av) => {
                            const isUnlocked = unlockedAvatars.includes(av.id) || av.id === "default";
                            const isActive = activeAvatar === av.id;
                            const canAfford = xp >= av.cost;

                            return (
                                <div key={av.id} className="flex flex-col items-center gap-2 relative">
                                    <button
                                        onClick={() => handleAvatarClick(av.id, av.cost, isUnlocked)}
                                        className={cn(
                                            "w-20 h-20 rounded-2xl flex items-center justify-center text-3xl shadow-sm transition-all outline-none",
                                            av.color,
                                            isUnlocked ? "hover:scale-105 active:scale-95" : (canAfford ? "hover:scale-105 active:scale-95 cursor-pointer ring-2 ring-primary/50" : "opacity-50 grayscale cursor-not-allowed"),
                                            isActive && "ring-4 ring-primary ring-offset-2 ring-offset-background scale-110 shadow-primary/20"
                                        )}
                                    >
                                        {av.icon}
                                    </button>

                                    {!isUnlocked && (
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[8px] w-8 h-8 bg-background/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg">
                                            <Lock className="w-4 h-4 text-foreground/70" />
                                        </div>
                                    )}

                                    <div className="text-center mt-1">
                                        <span className="block text-[11px] font-bold text-foreground truncate w-full px-1">{av.name}</span>
                                        <span className={cn(
                                            "text-[10px] uppercase font-bold tracking-wider flex items-center justify-center gap-1",
                                            isUnlocked ? "text-muted-foreground" : (canAfford ? "text-primary" : "text-destructive")
                                        )}>
                                            {isUnlocked ? (isActive ? "Equipado" : "Usar") : <><Trophy className="w-3 h-3" /> {av.cost}</>}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
