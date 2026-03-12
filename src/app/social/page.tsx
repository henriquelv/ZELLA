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
                <div className="flex items-center gap-2 mb-3">
                    <Zap className="w-5 h-5 text-yellow-500" />
                    <h3 className="text-[18px] font-black text-gray-900 uppercase">Power-Ups</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white rounded-2xl p-4 border-2 border-b-4 border-gray-200 shadow-sm flex flex-col items-center text-center group cursor-pointer active:border-b-2 active:translate-y-[2px] transition-all"
                         onClick={() => handlePurchase(40, "freezeStreak", "Freeze Streak")}
                    >
                        <div className="w-12 h-12 bg-blue-100 rounded-xl border-2 border-b-4 border-blue-200 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                            <Snowflake className="w-6 h-6 text-blue-500 drop-shadow-sm" />
                        </div>
                        <h4 className="font-bold text-[13px] text-gray-900 leading-tight">Congelar Streak</h4>
                        <p className="text-[10px] text-gray-500 mb-2 mt-1 px-1">Salva sua ofensiva por 1 dia.</p>
                        <div className="mt-auto bg-yellow-100 px-3 py-1 rounded-full border border-yellow-300 flex items-center gap-1">
                            <Coins className="w-3.5 h-3.5 text-yellow-600" />
                            <span className="text-[12px] font-black text-yellow-700">40</span>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-4 border-2 border-b-4 border-gray-200 shadow-sm flex flex-col items-center text-center group cursor-pointer active:border-b-2 active:translate-y-[2px] transition-all"
                         onClick={() => handlePurchase(30, "xpMultiplier", "Multiplicador XP")}
                    >
                        <div className="w-12 h-12 bg-purple-100 rounded-xl border-2 border-b-4 border-purple-200 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                            <TrendingUp className="w-6 h-6 text-purple-600 drop-shadow-sm" />
                        </div>
                        <h4 className="font-bold text-[13px] text-gray-900 leading-tight">Dobro de XP</h4>
                        <p className="text-[10px] text-gray-500 mb-2 mt-1 px-1">Ganha 2x XP Pelas próximas 24h.</p>
                        <div className="mt-auto bg-yellow-100 px-3 py-1 rounded-full border border-yellow-300 flex items-center gap-1">
                            <Coins className="w-3.5 h-3.5 text-yellow-600" />
                            <span className="text-[12px] font-black text-yellow-700">30</span>
                        </div>
                    </div>
                </div>
            </section>

            <section>
                <div className="flex items-center gap-2 mb-3">
                    <Paintbrush className="w-5 h-5 text-emerald-500" />
                    <h3 className="text-[18px] font-black text-gray-900 uppercase">Cosméticos</h3>
                </div>
                <div className="space-y-3">
                    {AVATARS.map((avatar) => {
                        // Skipping default as it's free
                        if (avatar.id === 'default') return null;
                        const isUnlocked = user.unlockedAvatars.includes(avatar.id);

                        return (
                            <div key={avatar.id} className="bg-white rounded-2xl p-3 border-2 border-b-4 border-gray-200 shadow-sm flex items-center gap-4">
                                <div className={cn("w-14 h-14 rounded-xl border-2 border-b-4 border-gray-300 flex items-center justify-center shrink-0 shadow-inner", avatar.color)}>
                                    {avatar.icon}
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-black text-[15px] text-gray-900 uppercase">{avatar.name}</h4>
                                    <p className="text-[11px] font-bold text-gray-400 uppercase mt-0.5">Avatar Especial</p>
                                </div>
                                <button
                                    onClick={() => handlePurchase(100, "avatar", avatar.name)}
                                    disabled={isUnlocked}
                                    className={cn(
                                        "px-4 py-2 rounded-xl text-[13px] font-black transition-all flex items-center gap-1.5 active:translate-y-[2px] active:border-b-2",
                                        isUnlocked
                                            ? "bg-gray-100 text-gray-400 border-2 border-b-4 border-gray-200 cursor-not-allowed"
                                            : "bg-white text-yellow-600 border-2 border-b-4 border-yellow-400 hover:bg-yellow-50"
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
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-5 border-2 border-b-4 border-indigo-900 shadow-xl relative overflow-hidden text-center mb-6">
                 <Crown className="w-12 h-12 text-yellow-400 mx-auto mb-2 drop-shadow-md" />
                 <h2 className="text-[20px] font-black text-white uppercase drop-shadow-md">Liga Degrau {user.currentStep}</h2>
                 <p className="text-[12px] text-indigo-200 font-bold uppercase tracking-widest mt-1">Temporada Atual</p>
            </div>

            <div className="space-y-2">
                {MOCK_LEADERBOARD.map((player, index) => {
                    const isTop1 = index === 0;
                    const isTop2 = index === 1;
                    const isTop3 = index === 2;

                    return (
                        <div
                            key={player.id}
                            className={cn(
                                "flex items-center gap-4 p-3 rounded-2xl border-2 border-b-4 transition-all",
                                player.isCurrentUser
                                    ? "bg-blue-50 border-blue-300"
                                    : "bg-white border-gray-200"
                            )}
                        >
                            <span className={cn(
                                "text-[18px] font-black w-6 text-center drop-shadow-sm",
                                isTop1 ? "text-yellow-500" : isTop2 ? "text-gray-400" : isTop3 ? "text-amber-700" : "text-gray-300"
                            )}>
                                #{index + 1}
                            </span>
                            
                            <div className="flex-1">
                                <h4 className="font-bold text-[15px] text-gray-900">{player.name}</h4>
                            </div>

                            <div className="flex gap-4 items-center">
                                <div className="flex flex-col items-center">
                                    <span className="text-[13px] font-black text-gray-900">{player.score}</span>
                                    <span className="text-[9px] font-bold text-gray-400 uppercase">Eficien.</span>
                                </div>
                                <div className="flex flex-col items-center">
                                    <div className="flex items-center gap-0.5">
                                        <Flame className="w-3.5 h-3.5 text-orange-500" />
                                        <span className="text-[13px] font-black text-gray-900">{player.streak}</span>
                                    </div>
                                    <span className="text-[9px] font-bold text-gray-400 uppercase">Streak</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            
            <p className="text-center text-[11px] text-gray-400 font-bold mt-4 px-8 uppercase">A liga é reiniciada todo dia 1° do mês e o pareamento é feito pela sua eficiência.</p>
        </motion.div>
    );

    return (
        <div className="min-h-screen bg-[#f8fafc] pb-24 font-sans selection:bg-blue-500/30">
            <AppHeader />

            <main className="px-5 mt-2 max-w-lg mx-auto">
                {/* Economy Header */}
                <div className="bg-white rounded-3xl p-4 border-2 border-b-4 border-gray-200 shadow-sm flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-yellow-100 rounded-2xl border-2 border-b-4 border-yellow-300 shadow-inner flex items-center justify-center">
                            <Coins className="w-6 h-6 text-yellow-600 drop-shadow-sm" />
                        </div>
                        <div>
                            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Saldo Atual</p>
                            <p className="text-[22px] font-black text-gray-900 leading-tight">
                                {user.coins} <span className="text-[14px] text-gray-500 font-bold">Z-Coins</span>
                            </p>
                        </div>
                    </div>
                    <div className="bg-blue-50 rounded-xl px-3 py-2 border-2 border-blue-100 text-center">
                         <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-0.5">Baú de Nível</p>
                         <p className="text-[12px] font-black text-blue-800">Em Breve</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 p-1.5 bg-gray-200/60 rounded-2xl mb-6">
                    <button
                        onClick={() => setActiveTab("store")}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-black text-[13px] uppercase tracking-wide transition-all",
                            activeTab === "store"
                                ? "bg-white text-[#2563eb] shadow-sm border-2 border-b-4 border-gray-200"
                                : "text-gray-500 hover:text-gray-700"
                        )}
                    >
                        <ShoppingCart className="w-4 h-4" /> Loja
                    </button>
                    <button
                        onClick={() => setActiveTab("ranking")}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-black text-[13px] uppercase tracking-wide transition-all",
                            activeTab === "ranking"
                                ? "bg-white text-indigo-600 shadow-sm border-2 border-b-4 border-gray-200"
                                : "text-gray-500 hover:text-gray-700"
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
    );
}
