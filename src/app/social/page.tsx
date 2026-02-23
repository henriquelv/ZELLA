"use client";

import { useState, useEffect } from "react";
import { Search, Trophy, UserPlus, Users, Star, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BottomNav } from "@/components/ui/bottom-nav";
import { motion, AnimatePresence } from "framer-motion";
import { useUserStoreHydrated } from "@/store/useStore";
import { AvatarSelector, AVATARS } from "@/components/ui/avatar-selector";
import { cn } from "@/lib/utils";
import { PageLoader } from "@/components/ui/page-loader";
import { supabase } from "@/lib/supabase";

const AVATAR_COLORS = [
    "bg-blue-500", "bg-purple-500", "bg-emerald-500",
    "bg-amber-500", "bg-rose-500", "bg-indigo-500",
    "bg-orange-500", "bg-cyan-500", "bg-pink-500"
];

export default function SocialPage() {
    const user = useUserStoreHydrated(s => s);
    const [activeTab, setActiveTab] = useState<'ranking' | 'friends'>('ranking');
    const [searchQuery, setSearchQuery] = useState("");
    const [isAvatarOpen, setIsAvatarOpen] = useState(false);
    const [ranking, setRanking] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchRanking() {
            setLoading(true);
            const { data } = await supabase
                .from('profiles')
                .select('id, name, xp, active_avatar')
                .order('xp', { ascending: false })
                .limit(20);

            if (data) {
                setRanking(data.map((p, i) => ({
                    id: p.id,
                    name: p.name || "Misterioso",
                    xp: p.xp || 0,
                    avatar: p.active_avatar || "default",
                    level: Math.floor((p.xp || 0) / 100) + 1,
                    rank: i + 1,
                    isMe: p.id === (user as any)?.id // Just in case id is missing in UserState type
                })));
            }
            setLoading(false);
        }

        fetchRanking();
    }, [user]);

    if (!user) return <PageLoader message="Conectando à comunidade..." />;

    const activeAvatarRecord = AVATARS.find(a => a.id === user.activeAvatar) || AVATARS[0];

    const filteredRanking = ranking.filter(u =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-background pb-28">
            <header className="px-6 pt-12 pb-4 bg-background/80 backdrop-blur-md sticky top-0 z-40 border-b border-border/50">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsAvatarOpen(true)}
                            className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-sm border border-white/10 ring-2 ring-primary/20",
                                activeAvatarRecord.color
                            )}
                        >
                            {activeAvatarRecord.icon}
                        </button>
                        <div>
                            <h1 className="text-xl font-bold font-heading">Social</h1>
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Level {Math.floor(user.xp / 100) + 1} • Estrela do Mês</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" className="rounded-full">
                        <UserPlus className="w-5 h-5 text-muted-foreground" />
                    </Button>
                </div>

                <div className="flex bg-muted/50 p-1 rounded-xl border border-border/50">
                    <button
                        onClick={() => setActiveTab('ranking')}
                        className={cn(
                            "flex-1 py-2 text-xs font-bold rounded-lg transition-all",
                            activeTab === 'ranking' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        🏆 Ranking
                    </button>
                    <button
                        onClick={() => setActiveTab('friends')}
                        className={cn(
                            "flex-1 py-2 text-xs font-bold rounded-lg transition-all",
                            activeTab === 'friends' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        👥 Amigos (0)
                    </button>
                </div>
            </header>

            <main className="px-6 mt-6">
                <div className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Buscar por nome ou ID..."
                        className="w-full bg-muted/30 border border-border/50 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 ring-primary/20 transition-all font-medium"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                            <Trophy className="w-8 h-8 opacity-20" />
                        </motion.div>
                        <p className="text-xs mt-4 font-bold uppercase tracking-widest opacity-50">Sincronizando Ranking...</p>
                    </div>
                ) : activeTab === 'ranking' ? (
                    <div className="space-y-3">
                        {filteredRanking.map((u, i) => (
                            <motion.div
                                key={u.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className={cn(
                                    "flex items-center gap-4 p-4 rounded-2xl border transition-all",
                                    u.isMe ? "bg-primary/5 border-primary/30 ring-1 ring-primary/20" : "bg-card border-border/50 hover:border-border"
                                )}
                            >
                                <div className="w-6 text-xs font-black text-muted-foreground flex justify-center">
                                    {u.rank === 1 ? '🥇' : u.rank === 2 ? '🥈' : u.rank === 3 ? '🥉' : u.rank}
                                </div>
                                <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-sm shadow-sm", AVATAR_COLORS[i % AVATAR_COLORS.length])}>
                                    {(AVATARS.find(a => a.id === u.avatar) || AVATARS[0]).icon}
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-sm flex items-center gap-2">
                                        {u.name}
                                        {u.isMe && <span className="text-[9px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full uppercase">Você</span>}
                                    </h4>
                                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Level {u.level}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-black text-sm text-foreground">{u.xp} XP</p>
                                    <p className="text-[10px] text-emerald-500 font-bold">↑ Sobe</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground text-center">
                        <Users className="w-12 h-12 mb-4 opacity-10" />
                        <h3 className="font-bold text-base text-foreground">Sua guilda está vazia</h3>
                        <p className="text-xs max-w-[200px] mt-1 leading-relaxed">Convide amigos para comparar seu progresso e ganhar bônus de XP.</p>
                        <Button variant="outline" className="mt-6 rounded-xl border-border/50 font-bold h-10">
                            Convidar Amigos
                        </Button>
                    </div>
                )}
            </main>

            <AvatarSelector isOpen={isAvatarOpen} onClose={() => setIsAvatarOpen(false)} />
            <BottomNav />
        </div>
    );
}
