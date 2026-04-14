"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useUserStoreHydrated } from "@/store/useStore";
import { BottomNav } from "@/components/ui/bottom-nav";
import { AppHeader } from "@/components/ui/app-header";
import { PageLoader } from "@/components/ui/page-loader";
import { Coins, Crown, Flame, ArrowLeft, Trophy, Users } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

interface LeaderRow {
    id: string;
    name: string;
    xp: number;
    streak: number;
    current_step: number;
    level: number;
}

export default function SocialPage() {
    const user = useUserStoreHydrated((state) => state);
    const [rows, setRows] = useState<LeaderRow[] | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            const { data, error } = await supabase
                .from("leaderboard_view")
                .select("id,name,xp,streak,current_step,level")
                .order("xp", { ascending: false })
                .limit(20);
            if (cancelled) return;
            if (error) { setError(error.message); setRows([]); return; }
            setRows((data as LeaderRow[]) || []);
        })();
        return () => { cancelled = true; };
    }, []);

    if (!user) return <PageLoader message="Carregando ranking..." />;

    const userInList = rows?.some(r => r.id === user.id) ?? false;
    const xpToNextLevel = Math.floor(100 * Math.pow(user.level, 1.2)) - user.xp;

    return (
        <div className="min-h-screen bg-[#f4f6fb] pb-24 font-sans selection:bg-blue-500/30">
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-400/[0.04] rounded-full blur-[120px]" />
                <div className="absolute bottom-[10%] left-[-10%] w-[50%] h-[50%] bg-purple-400/[0.03] rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10">
                <AppHeader />

                <main className="px-5 mt-2 pb-4 max-w-lg mx-auto space-y-5">
                    <Link href="/dashboard" className="inline-flex items-center gap-2 text-[12px] font-black text-gray-500 uppercase tracking-widest hover:text-gray-800">
                        <ArrowLeft className="w-4 h-4" /> Voltar
                    </Link>

                    {/* Level progress card (replaces Baú de Nível mock) */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/95 backdrop-blur-md rounded-[2rem] p-5 ring-1 ring-black/[0.02] shadow-xl shadow-blue-900/5 flex items-center justify-between"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-amber-50 rounded-[1.25rem] flex items-center justify-center shadow-sm ring-1 ring-amber-100">
                                <Coins className="w-7 h-7 text-amber-500 drop-shadow-sm" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Saldo</p>
                                <p className="text-[22px] font-black text-gray-800 leading-none">
                                    {user.coins} <span className="text-[12px] text-gray-400 font-bold ml-0.5">Z-Coins</span>
                                </p>
                            </div>
                        </div>
                        <div className="bg-blue-50/80 rounded-[1rem] px-3.5 py-2.5 border border-blue-100/50 text-center">
                            <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-1">Próximo nível</p>
                            <p className="text-[13px] font-extrabold text-blue-800 leading-none">+{Math.max(0, xpToNextLevel)} XP</p>
                        </div>
                    </motion.div>

                    {/* League header */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 }}
                        className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[2rem] p-6 shadow-[0_8px_30px_rgba(79,70,229,0.2)] relative overflow-hidden text-center border border-white/20"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-10 -translate-y-10" />
                        <Crown className="w-11 h-11 text-yellow-300 mx-auto mb-2 drop-shadow-md relative z-10" />
                        <h2 className="text-[20px] font-black text-white uppercase tracking-tight relative z-10">Ranking Global</h2>
                        <p className="text-[12px] text-indigo-100 font-bold uppercase tracking-widest mt-1 relative z-10">Top 20 por XP</p>
                    </motion.div>

                    {rows === null && (
                        <div className="bg-white/80 rounded-[1.5rem] p-8 text-center">
                            <Trophy className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                            <p className="text-[13px] text-gray-500 font-bold">Carregando jogadores...</p>
                        </div>
                    )}

                    {rows && rows.length === 0 && (
                        <div className="bg-white/80 rounded-[1.5rem] p-8 text-center ring-1 ring-black/[0.02]">
                            <Users className="w-10 h-10 text-indigo-300 mx-auto mb-3" />
                            <p className="text-[15px] font-extrabold text-gray-800 mb-1">Seja dos primeiros a se destacar!</p>
                            <p className="text-[12px] text-gray-500 font-medium">Convide amigos pra encher o ranking.</p>
                            {error && <p className="text-[10px] text-red-400 font-bold mt-3">{error}</p>}
                        </div>
                    )}

                    {rows && rows.length > 0 && (
                        <div className="space-y-2.5">
                            {rows.map((player, index) => {
                                const isCurrentUser = player.id === user.id;
                                const isTop1 = index === 0;
                                const isTop2 = index === 1;
                                const isTop3 = index === 2;
                                return (
                                    <div
                                        key={player.id}
                                        className={cn(
                                            "flex items-center gap-4 p-4 rounded-[1.25rem] transition-all",
                                            isCurrentUser
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
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-extrabold text-[15px] text-gray-800 truncate">
                                                {isCurrentUser ? "Você" : player.name}
                                            </h4>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Degrau {player.current_step}</p>
                                        </div>
                                        <div className="flex gap-4 items-center">
                                            <div className="flex flex-col items-center">
                                                <span className="text-[14px] font-black text-gray-800">{player.xp}</span>
                                                <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">XP</span>
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
                            {!userInList && user.xp > 0 && (
                                <div className="pt-3 text-center">
                                    <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">
                                        Você ainda não está no top 20. Ganhe mais XP pra aparecer!
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </main>

                <BottomNav />
            </div>
        </div>
    );
}
