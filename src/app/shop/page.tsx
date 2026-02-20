"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BottomNav } from "@/components/ui/bottom-nav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useUserStoreHydrated, useUserStore } from "@/store/useStore";
import { PageLoader } from "@/components/ui/page-loader";
import { Star, Coins, Lock, CheckCircle2, ShoppingBag, Package, Crown, Sparkles } from "lucide-react";

// ─── AVATARS ──────────────────────────────────────────────────────────────────
const AVATARS = [
    { id: "default", label: "Novato", emoji: "😊", cost: 0, costType: "xp", rarity: "common" },
    { id: "scholar", label: "Estudioso", emoji: "🧑‍💻", cost: 200, costType: "xp", rarity: "common" },
    { id: "saver", label: "Poupador", emoji: "🏦", cost: 500, costType: "xp", rarity: "rare" },
    { id: "investor", label: "Investidor", emoji: "📈", cost: 1000, costType: "xp", rarity: "rare" },
    { id: "diamond", label: "Diamante", emoji: "💎", cost: 2500, costType: "xp", rarity: "epic" },
    { id: "legendary", label: "Lendário", emoji: "👑", cost: 5000, costType: "xp", rarity: "legendary" },
    { id: "rocket", label: "Astronauta", emoji: "🚀", cost: 50, costType: "coins", rarity: "premium" },
    { id: "wolf", label: "Lobo de Wall St.", emoji: "🐺", cost: 100, costType: "coins", rarity: "premium" },
] as const;

// ─── BOOSTS / POWER-UPS ───────────────────────────────────────────────────────
const BOOSTS = [
    { id: "xp2x", label: "XP 2x", desc: "Dobra XP por 24h", cost: 200, costType: "coins", icon: "⚡" },
    { id: "shield", label: "Escudo de Streak", desc: "Protege sua sequência por 1 dia", cost: 100, costType: "coins", icon: "🛡️" },
    { id: "hint", label: "Dica de Quiz", desc: "Elimina 2 opções erradas no quiz", cost: 50, costType: "coins", icon: "💡" },
];

const RARITY_STYLES = {
    common: "border-border/50 bg-card",
    rare: "border-blue-500/40 bg-blue-500/5",
    epic: "border-violet-500/40 bg-violet-500/5",
    legendary: "border-yellow-500/40 bg-gradient-to-br from-yellow-500/10 to-orange-500/10",
    premium: "border-emerald-500/40 bg-emerald-500/5",
};

const RARITY_BADGE = {
    common: "text-muted-foreground",
    rare: "text-blue-500",
    epic: "text-violet-500",
    legendary: "text-yellow-500",
    premium: "text-emerald-500",
};

export default function ShopPage() {
    const user = useUserStoreHydrated(s => s);
    const [activeTab, setActiveTab] = useState<"avatars" | "boosts">("avatars");
    const [buying, setBuying] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<{ id: string; success: boolean } | null>(null);

    if (!user) return <PageLoader message="Abrindo loja..." />;

    const { addXp, addCoins, unlockAvatar, setActiveAvatar, xp, coins, unlockedAvatars, activeAvatar } = user;

    const handleBuyAvatar = (avatar: typeof AVATARS[number]) => {
        if (unlockedAvatars.includes(avatar.id)) {
            setActiveAvatar(avatar.id);
            setFeedback({ id: avatar.id, success: true });
            setTimeout(() => setFeedback(null), 2000);
            return;
        }

        setBuying(avatar.id);
        setTimeout(() => {
            let success = false;
            if (avatar.costType === "xp") {
                success = unlockAvatar(avatar.id, avatar.cost);
            } else {
                const { coins: currentCoins } = useUserStore.getState();
                if (currentCoins >= avatar.cost) {
                    useUserStore.setState(s => ({ coins: s.coins - avatar.cost }));
                    // directly unlock
                    useUserStore.setState(s => ({ unlockedAvatars: [...s.unlockedAvatars, avatar.id] }));
                    setActiveAvatar(avatar.id);
                    success = true;
                }
            }
            setFeedback({ id: avatar.id, success });
            setBuying(null);
            setTimeout(() => setFeedback(null), 2500);
        }, 600);
    };

    return (
        <div className="min-h-screen bg-background pb-28">
            {/* Header */}
            <div className="bg-gradient-to-br from-[#1a3fa8] via-[#2563eb] to-[#16a34a] px-6 pt-14 pb-6 relative overflow-hidden">
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 70% 30%, #60a5fa 0, transparent 60%)" }} />
                <div className="flex justify-between items-center relative z-10">
                    <div>
                        <h1 className="text-2xl font-bold text-white font-heading">Loja Zella</h1>
                        <p className="text-blue-100/80 text-sm mt-0.5 font-medium">Gaste seus pontos com sabedoria</p>
                    </div>
                    <div className="flex gap-3">
                        <div className="bg-white/15 backdrop-blur-sm rounded-2xl px-3 py-2 text-white text-sm font-bold flex items-center gap-1.5 border border-white/20">
                            <Star className="w-4 h-4 text-yellow-300" /> {xp.toLocaleString()} XP
                        </div>
                        <div className="bg-white/15 backdrop-blur-sm rounded-2xl px-3 py-2 text-white text-sm font-bold flex items-center gap-1.5 border border-white/20">
                            <Coins className="w-4 h-4 text-amber-300" /> {coins}
                        </div>
                    </div>
                </div>

                {/* Tab */}
                <div className="flex bg-white/10 backdrop-blur-sm p-1 rounded-2xl mt-4 border border-white/20 relative z-10">
                    {(["avatars", "boosts"] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={cn(
                                "flex-1 py-2 text-sm font-bold rounded-xl transition-all",
                                activeTab === tab ? "bg-white text-[#1a3fa8] shadow-md" : "text-white/80 hover:text-white"
                            )}
                        >
                            {tab === "avatars" ? "🎭 Avatares" : "⚡ Boosts"}
                        </button>
                    ))}
                </div>
            </div>

            <main className="px-6 pt-6 space-y-4">
                <AnimatePresence mode="wait">
                    {activeTab === "avatars" ? (
                        <motion.div
                            key="avatars"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="grid grid-cols-2 gap-4"
                        >
                            {AVATARS.map((avatar, i) => {
                                const owned = unlockedAvatars.includes(avatar.id);
                                const isActive = activeAvatar === avatar.id;
                                const isBuying = buying === avatar.id;
                                const fb = feedback?.id === avatar.id;
                                const canAfford = avatar.costType === "xp" ? xp >= avatar.cost : coins >= avatar.cost;

                                return (
                                    <motion.div
                                        key={avatar.id}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: i * 0.05 }}
                                    >
                                        <button
                                            onClick={() => handleBuyAvatar(avatar)}
                                            disabled={isBuying}
                                            className="w-full text-left"
                                        >
                                            <Card className={cn(
                                                "border-2 transition-all hover:shadow-lg active:scale-[0.98] cursor-pointer",
                                                RARITY_STYLES[avatar.rarity],
                                                isActive && "ring-2 ring-primary ring-offset-2 ring-offset-background",
                                                fb && feedback?.success && "ring-2 ring-emerald-500 ring-offset-2 ring-offset-background"
                                            )}>
                                                <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                                                    <div className="relative">
                                                        <div className="text-5xl mt-1">{avatar.emoji}</div>
                                                        {isActive && (
                                                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                                                                <CheckCircle2 className="w-3 h-3 text-white" />
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div>
                                                        <p className="font-bold text-sm">{avatar.label}</p>
                                                        <p className={cn("text-[10px] font-bold uppercase tracking-wider", RARITY_BADGE[avatar.rarity])}>
                                                            {avatar.rarity}
                                                        </p>
                                                    </div>

                                                    {owned ? (
                                                        <div className={cn(
                                                            "w-full py-1.5 rounded-xl text-xs font-bold",
                                                            isActive ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                                                        )}>
                                                            {isActive ? "✓ Ativo" : "Selecionar"}
                                                        </div>
                                                    ) : (
                                                        <div className={cn(
                                                            "w-full py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1",
                                                            canAfford ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground/60"
                                                        )}>
                                                            {!canAfford && <Lock className="w-3 h-3" />}
                                                            {avatar.costType === "xp" ? (
                                                                <><Star className="w-3 h-3" /> {avatar.cost.toLocaleString()} XP</>
                                                            ) : (
                                                                <><Coins className="w-3 h-3" /> {avatar.cost} coins</>
                                                            )}
                                                        </div>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        </button>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="boosts"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-3"
                        >
                            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 text-center">
                                <Crown className="w-6 h-6 text-amber-500 mx-auto mb-1" />
                                <p className="text-sm font-bold">Moedas são ganhas completando jogos e missões!</p>
                                <p className="text-xs text-muted-foreground mt-0.5">Você tem <strong>{coins} moedas</strong> disponíveis.</p>
                            </div>

                            {BOOSTS.map((boost, i) => (
                                <motion.div
                                    key={boost.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                >
                                    <Card className="border-border/50">
                                        <CardContent className="p-4 flex items-center gap-4">
                                            <div className="text-3xl shrink-0">{boost.icon}</div>
                                            <div className="flex-1">
                                                <p className="font-bold">{boost.label}</p>
                                                <p className="text-xs text-muted-foreground">{boost.desc}</p>
                                            </div>
                                            <Button size="sm" variant="outline" className="shrink-0 font-bold gap-1 border-amber-500/50 text-amber-600 hover:bg-amber-500/10">
                                                <Coins className="w-3.5 h-3.5" /> {boost.cost}
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}

                            <div className="mt-6">
                                <div className="text-center p-6 border-2 border-dashed border-border/50 rounded-2xl">
                                    <ShoppingBag className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                                    <p className="font-bold text-muted-foreground/60 text-sm">Em breve</p>
                                    <p className="text-xs text-muted-foreground/40 mt-1">Temas premium, pacotes e mais conteúdo</p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Buy feedback toast */}
            <AnimatePresence>
                {feedback && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        className={cn(
                            "fixed bottom-24 left-6 right-6 z-50 rounded-2xl p-4 text-center shadow-xl border",
                            feedback.success
                                ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-600"
                                : "bg-destructive/10 border-destructive/50 text-destructive"
                        )}
                    >
                        <p className="font-bold">
                            {feedback.success ? "🎉 Parabéns! Avatar desbloqueado!" : "❌ XP ou moedas insuficientes"}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            <BottomNav />
        </div>
    );
}
