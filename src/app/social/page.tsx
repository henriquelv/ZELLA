"use client";

import React, { useState } from "react";
import { useUserStoreHydrated, useUserStore } from "@/store/useStore";
import { BottomNav } from "@/components/ui/bottom-nav";
import { AppHeader } from "@/components/ui/app-header";
import { PageLoader } from "@/components/ui/page-loader";
import {
    ShoppingCart,
    Trophy,
    Snowflake,
    Zap,
    Paintbrush,
    Package,
    Coins,
    Crown,
    TrendingUp,
    Flame
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { AVATARS } from "@/components/ui/avatar-selector";

type Tab = "store" | "ranking";

const MOCK_LEADERBOARD = [
    { id: 1, name: "Lucas F.", score: 98, streak: 12, isCurrentUser: false },
    { id: 2, name: "Mariana R.", score: 92, streak: 15, isCurrentUser: false },
    { id: 3, name: "Você", score: 85, streak: 8, isCurrentUser: true },
    { id: 4, name: "Rafael M.", score: 79, streak: 4, isCurrentUser: false },
    { id: 5, name: "Ana P.", score: 71, streak: 2, isCurrentUser: false },
];

export default function SocialPage() {
    const user = useUserStoreHydrated((state) => state);
    const spendCoins = useUserStore((state) => state.spendCoins);
    const [activeTab, setActiveTab] = useState<Tab>("store");

    if (!user) return <PageLoader message="Carregando Arsenal..." />;

    const handlePurchase = (cost: number, itemType: "freezeStreak" | "xpMultiplier" | "avatar", itemName: string) => {
        if (user.coins < cost) {
            toast.error("Z-Coins insuficientes!");
            return;
        }

        const success = spendCoins(cost, itemType);
        if (success) {
            toast.success(`Compra concluída: ${itemName}`);
        } else {
            toast.error("Erro ao processar compra.");
        }
    };

    const StoreContent = () => (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
        >
            <section>
                <div className="flex items-center gap-2 mb-4">
                    <Zap className="w-5 h-5 text-yellow-500" />
                    <h3 className="text-[18px] font-extrabold text-gray-800 uppercase tracking-tight">Power-Ups</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/80 backdrop-blur-md rounded-[1.5rem] p-5 ring-1 ring-black/[0.02] shadow-lg shadow-blue-900/5 flex flex-col items-center text-center group cursor-pointer active:scale-95 transition-all"
                         onClick={() => handlePurchase(40, "freezeStreak", "Freeze Streak")}
                    >
                        <div className="w-14 h-14 bg-blue-50/80 rounded-[1.25rem] flex items-center justify-center mb-4 group-hover:bg-blue-100/50 transition-colors">
                            <Snowflake className="w-7 h-7 text-blue-500 drop-shadow-sm group-hover:scale-110 transition-transform" />
                        </div>
                        <h4 className="font-extrabold text-[14px] text-gray-800 leading-tight">Congelar Streak</h4>
                        <p className="text-[11px] text-gray-400 font-medium mb-3 mt-1.5 px-1">Salva sua ofensiva por 1 dia.</p>
                        <div className="mt-auto bg-amber-50 px-3.5 py-1.5 rounded-full border border-amber-100 flex items-center gap-1.5">
                            <Coins className="w-4 h-4 text-amber-500" />
                            <span className="text-[13px] font-black text-amber-600">40</span>
                        </div>
                    </div>

                    <div className="bg-white/80 backdrop-blur-md rounded-[1.5rem] p-5 ring-1 ring-black/[0.02] shadow-lg shadow-blue-900/5 flex flex-col items-center text-center group cursor-pointer active:scale-95 transition-all"
                         onClick={() => handlePurchase(30, "xpMultiplier", "Multiplicador XP")}
                    >
                        <div className="w-14 h-14 bg-purple-50/80 rounded-[1.25rem] flex items-center justify-center mb-4 group-hover:bg-purple-100/50 transition-colors">
                            <TrendingUp className="w-7 h-7 text-purple-600 drop-shadow-sm group-hover:scale-110 transition-transform" />
                        </div>
                        <h4 className="font-extrabold text-[14px] text-gray-800 leading-tight">Dobro de XP</h4>
                        <p className="text-[11px] text-gray-400 font-medium mb-3 mt-1.5 px-1">Ganha 2x XP Pelas próximas 24h.</p>
                        <div className="mt-auto bg-amber-50 px-3.5 py-1.5 rounded-full border border-amber-100 flex items-center gap-1.5">
                            <Coins className="w-4 h-4 text-amber-500" />
                            <span className="text-[13px] font-black text-amber-600">30</span>
                        </div>
                    </div>
                </div>
            </section>

            <section>
                <div className="flex items-center gap-2 mb-4">
                    <Paintbrush className="w-5 h-5 text-emerald-500" />
                    <h3 className="text-[18px] font-extrabold text-gray-800 uppercase tracking-tight">Cosméticos</h3>
                </div>
                <div className="space-y-3">
                    {AVATARS.map((avatar) => {
                        // Skipping default as it's free
                        if (avatar.id === 'default') return null;
                        const isUnlocked = user.unlockedAvatars.includes(avatar.id);

                        return (
                            <div key={avatar.id} className="bg-white/80 backdrop-blur-md rounded-[1.5rem] p-4 ring-1 ring-black/[0.02] shadow-sm flex items-center gap-4">
                                <div className={cn("w-14 h-14 rounded-[1.25rem] flex items-center justify-center shrink-0 shadow-sm ring-1 ring-black/5", avatar.color)}>
                                    {avatar.icon}
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-extrabold text-[15px] text-gray-800 uppercase">{avatar.name}</h4>
                                    <p className="text-[11px] font-bold text-gray-400 uppercase mt-0.5">Avatar Especial</p>
                                </div>
                                <button
                                    onClick={() => handlePurchase(100, "avatar", avatar.name)}
                                    disabled={isUnlocked}
                                    className={cn(
                                        "px-4 py-2.5 rounded-[1rem] text-[13px] font-black transition-all flex items-center gap-1.5 active:scale-95",
                                        isUnlocked
                                            ? "bg-gray-100/50 text-gray-400 cursor-not-allowed border border-gray-200/50"
                                            : "bg-amber-50 text-amber-600 border border-amber-200 hover:bg-amber-100"
                                    )}
                                >
                                    {isUnlocked ? (
                                        "Comprado"
                                    ) : (
                                        <>
                                            <Coins className="w-4 h-4" /> 100
                                        </>
                                    )}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </section>
        </motion.div>
    );

    const RankingContent = () => (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
        >
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[2rem] p-6 shadow-[0_8px_30px_rgba(79,70,229,0.2)] relative overflow-hidden text-center mb-6 border border-white/20">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-10 -translate-y-10" />
                 <Crown className="w-12 h-12 text-yellow-300 mx-auto mb-3 drop-shadow-md relative z-10" />
                 <h2 className="text-[20px] font-black text-white uppercase tracking-tight relative z-10">Liga Degrau {user.currentStep}</h2>
                 <p className="text-[12px] text-indigo-100 font-bold uppercase tracking-widest mt-1 relative z-10">Temporada Atual</p>
            </div>

            <div className="space-y-3">
                {MOCK_LEADERBOARD.map((player, index) => {
                    const isTop1 = index === 0;
                    const isTop2 = index === 1;
                    const isTop3 = index === 2;

                    return (
                        <div
                            key={player.id}
                            className={cn(
                                "flex items-center gap-4 p-4 rounded-[1.25rem] transition-all",
                                player.isCurrentUser
                                    ? "bg-blue-50/80 border border-blue-200 ring-1 ring-blue-500/20 shadow-md shadow-blue-900/5"
                                    : "bg-white/80 backdrop-blur-md border border-white/50 ring-1 ring-black/[0.02] shadow-sm"
                            )}
                        >
                            <span className={cn(
                                "text-[18px] font-black w-6 text-center drop-shadow-sm",
                                isTop1 ? "text-amber-400" : isTop2 ? "text-slate-400" : isTop3 ? "text-amber-700" : "text-gray-300"
                            )}>
                                #{index + 1}
                            </span>
                            
                            <div className="flex-1">
                                <h4 className="font-extrabold text-[15px] text-gray-800">{player.name}</h4>
                            </div>

                            <div className="flex gap-5 items-center">
                                <div className="flex flex-col items-center">
                                    <span className="text-[14px] font-black text-gray-800">{player.score}</span>
                                    <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Eficien.</span>
                                </div>
                                <div className="flex flex-col items-center">
                                    <div className="flex items-center gap-0.5">
                                        <Flame className="w-3.5 h-3.5 text-orange-500" />
                                        <span className="text-[14px] font-black text-gray-800">{player.streak}</span>
                                    </div>
                                    <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Streak</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            
            <p className="text-center text-[10px] text-gray-400 font-bold mt-6 px-8 uppercase tracking-wider">A liga é reiniciada todo dia 1° do mês e o pareamento é feito pela sua eficiência.</p>
        </motion.div>
    );

    return (
        <div className="min-h-screen bg-[#f4f6fb] pb-24 font-sans selection:bg-blue-500/30">
            {/* Ambient Base Light */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-400/[0.03] rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10">
                <AppHeader />

                <main className="px-5 mt-2 max-w-lg mx-auto">
                    {/* Economy Header */}
                    <div className="bg-white/80 backdrop-blur-md rounded-[2rem] p-5 shadow-xl shadow-blue-900/5 ring-1 ring-black/[0.02] flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-amber-50 rounded-[1.25rem] flex items-center justify-center shadow-sm ring-1 ring-amber-100">
                                <Coins className="w-7 h-7 text-amber-500 drop-shadow-sm" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Saldo Atual</p>
                                <p className="text-[24px] font-black text-gray-800 leading-none">
                                    {user.coins} <span className="text-[13px] text-gray-400 font-bold ml-0.5">Z-Coins</span>
                                </p>
                            </div>
                        </div>
                        <div className="bg-blue-50/80 rounded-[1rem] px-3.5 py-2.5 border border-blue-100/50 text-center">
                            <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-1">Baú de Nível</p>
                            <p className="text-[12px] font-extrabold text-blue-800 leading-none">Em Breve</p>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-2 p-1.5 bg-gray-200/50 rounded-[1.25rem] mb-6 backdrop-blur-sm">
                        <button
                            onClick={() => setActiveTab("store")}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-extrabold text-[13px] uppercase tracking-wide transition-all",
                                activeTab === "store"
                                    ? "bg-white text-blue-600 shadow-sm ring-1 ring-black/[0.02]"
                                    : "text-gray-400 hover:text-gray-600"
                            )}
                        >
                            <ShoppingCart className="w-4 h-4" /> Loja
                        </button>
                        <button
                            onClick={() => setActiveTab("ranking")}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-extrabold text-[13px] uppercase tracking-wide transition-all",
                                activeTab === "ranking"
                                    ? "bg-white text-indigo-600 shadow-sm ring-1 ring-black/[0.02]"
                                    : "text-gray-400 hover:text-gray-600"
                            )}
                        >
                            <Trophy className="w-4 h-4" /> Ligas
                        </button>
                    </div>

                    <AnimatePresence mode="wait">
                        {activeTab === "store" ? <StoreContent key="store" /> : <RankingContent key="ranking" />}
                    </AnimatePresence>
                </main>
                
                <BottomNav />
            </div>
        </div>
    );
}
