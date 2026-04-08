"use client";

import React, { useState } from "react";
import { useUserStoreHydrated, useUserStore } from "@/store/useStore";
import { BottomNav } from "@/components/ui/bottom-nav";
import { AppHeader } from "@/components/ui/app-header";
import { PageLoader } from "@/components/ui/page-loader";
import {
    Coins, Snowflake, Zap, ShieldCheck, Lock,
    Sparkles, Crown, Palette, Star, HelpCircle, X, Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { CHARACTERS, SpeechBubble } from "@/components/ui/character-3d";

// ─── Store Data ───────────────────────────────────────────────────────────────
const POWER_UPS = [
    {
        id: "freezeStreak",
        name: "Freeze Streak",
        desc: "Salva sua ofensiva por 1 dia sem logar.",
        icon: Snowflake,
        iconBg: "bg-blue-50",
        iconColor: "text-blue-500",
        cost: 40,
        type: "freezeStreak" as const,
    },
    {
        id: "xpMultiplier",
        name: "XP Duplo",
        desc: "Ganha 2x XP pelas próximas 24 horas.",
        icon: Zap,
        iconBg: "bg-violet-50",
        iconColor: "text-violet-500",
        cost: 30,
        type: "xpMultiplier" as const,
    },
    {
        id: "shield",
        name: "Escudo Financeiro",
        desc: "Protege seu degrau por 3 dias caso as métricas piorem.",
        icon: ShieldCheck,
        iconBg: "bg-emerald-50",
        iconColor: "text-emerald-500",
        cost: 60,
        type: "freezeStreak" as const, // mapped to freezeStreak inventory
    },
];

const ARENA_THEMES = [
    { id: "classic", name: "Clássico", desc: "Tema padrão do app", cost: 0, unlockStep: 1, preview: "bg-[#f4f6fb]" },
    { id: "ember", name: "Ember", desc: "Laranja intenso de batalha", cost: 80, unlockStep: 2, preview: "bg-gradient-to-br from-orange-400 to-red-600" },
    { id: "ocean", name: "Oceano", desc: "Azul profundo e calmo", cost: 120, unlockStep: 3, preview: "bg-gradient-to-br from-blue-400 to-cyan-600" },
    { id: "forest", name: "Floresta", desc: "Verde de prosperidade", cost: 150, unlockStep: 4, preview: "bg-gradient-to-br from-green-400 to-emerald-600" },
    { id: "galaxy", name: "Galáxia", desc: "Roxo do universo financeiro", cost: 250, unlockStep: 5, preview: "bg-gradient-to-br from-violet-600 to-indigo-800" },
    { id: "elite", name: "Elite Black", desc: "O tema dos mestres", cost: 500, unlockStep: 6, preview: "bg-gradient-to-br from-gray-900 to-black" },
];

const SPECIAL_TITLES = [
    { id: "saver", title: "O Poupador", desc: "Mostra no seu perfil", cost: 80 },
    { id: "hunter", title: "Caçador de Drenos", desc: "Para os especialistas", cost: 100 },
    { id: "analyst", title: "Analista Financeiro", desc: "Quem entende de números", cost: 120 },
    { id: "master", title: "Mestre da Eficiência", desc: "Eficiência acima de 20%", cost: 200 },
    { id: "elite", title: "Guardião do Patrimônio", desc: "Reserva acima de 6 meses", cost: 300 },
];

// ─── How to Earn More Modal ───────────────────────────────────────────────────
function HowToEarnModal({ onClose }: { onClose: () => void }) {
    const tips = [
        { icon: "🎮", label: "Completar Mini Jogos", coins: "+10–30" },
        { icon: "🔥", label: "Manter streak diário", coins: "+5/dia" },
        { icon: "📊", label: "Registrar transações", coins: "+2/tx" },
        { icon: "🎯", label: "Completar Missões", coins: "variável" },
        { icon: "✅", label: "Completar Metas", coins: "+20" },
        { icon: "🧠", label: "Quiz Diário", coins: "+10" },
    ];
    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-end justify-center">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                <motion.div
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    transition={{ type: "spring", damping: 28, stiffness: 300 }}
                    className="relative w-full max-w-md bg-white rounded-t-[2rem] p-6 pb-10 shadow-2xl"
                >
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="font-extrabold text-[18px] text-gray-800">Como Ganhar Z-Coins</h2>
                        <button onClick={onClose} className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center">
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>
                    <div className="space-y-3">
                        {tips.map(t => (
                            <div key={t.label} className="flex items-center justify-between p-3.5 bg-amber-50 rounded-[1.25rem] border border-amber-100">
                                <div className="flex items-center gap-3">
                                    <span className="text-xl">{t.icon}</span>
                                    <span className="text-[14px] font-bold text-gray-700">{t.label}</span>
                                </div>
                                <span className="text-[14px] font-black text-amber-600">{t.coins}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function StorePage() {
    const user = useUserStoreHydrated((state) => state);
    const spendCoins = useUserStore((state) => state.spendCoins);
    const setActiveCharacter = useUserStore((state) => state.setActiveCharacter);
    const unlockCharacter = useUserStore((state) => state.unlockCharacter);
    const setActiveTheme = useUserStore((state) => state.setActiveTheme);
    const unlockTheme = useUserStore((state) => state.unlockTheme);
    const [showHowTo, setShowHowTo] = useState(false);

    if (!user) return <PageLoader message="Carregando lojinha..." />;

    const handlePurchasePowerUp = (cost: number, type: "freezeStreak" | "xpMultiplier", name: string) => {
        if (user.coins < cost) { toast.error("Z-Coins insuficientes!"); return; }
        const ok = spendCoins(cost, type);
        if (ok) toast.success(`${name} ativado!`);
        else toast.error("Erro ao processar compra.");
    };

    const handleSelectCharacter = (id: string, cost: number, name: string) => {
        const isOwned = user.unlockedCharacters.includes(id);
        if (isOwned) {
            setActiveCharacter(id);
            toast.success(`${name} agora é seu parceiro!`);
            return;
        }
        if (user.coins < cost) {
            toast.error("Z-Coins insuficientes — joga um pouco mais!");
            return;
        }
        const ok = unlockCharacter(id, cost);
        if (ok) toast.success(`${name} desbloqueado e equipado!`);
    };

    const handleSelectTheme = (id: string, cost: number, name: string, isLocked: boolean) => {
        if (isLocked) {
            toast.error("Avance de fase pra liberar esse tema");
            return;
        }
        const isOwned = user.unlockedThemes.includes(id);
        if (isOwned) {
            setActiveTheme(id);
            toast.success(`Tema ${name} aplicado!`);
            return;
        }
        if (user.coins < cost) {
            toast.error("Z-Coins insuficientes!");
            return;
        }
        const ok = unlockTheme(id, cost);
        if (ok) toast.success(`Tema ${name} aplicado!`);
    };

    const handlePurchaseTitle = (cost: number, title: string) => {
        if (user.coins < cost) { toast.error("Z-Coins insuficientes!"); return; }
        const ok = spendCoins(cost, "freezeStreak"); // Using freezeStreak as generic token
        if (ok) toast.success(`Título "${title}" equipado!`);
    };

    // Featured character of the week — Lion
    const featured = CHARACTERS.find(c => c.id === "lion") || CHARACTERS[2];
    const FeaturedScene = featured.Scene;
    const featuredOwned = user.unlockedCharacters.includes(featured.id);

    return (
        <div className="min-h-screen bg-[#f4f6fb] pb-24 font-sans selection:bg-amber-500/30">
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-5%] right-[-5%] w-[60%] h-[40%] bg-amber-400/[0.04] rounded-full blur-[120px]" />
                <div className="absolute bottom-[10%] left-[-10%] w-[50%] h-[40%] bg-yellow-400/[0.03] rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10">
                <AppHeader />

                <main className="px-5 mt-2 pb-4 max-w-lg mx-auto space-y-6">

                    {/* 1. Header: Z-Coins Balance */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-br from-amber-400 to-yellow-600 rounded-[2rem] p-5 shadow-xl shadow-amber-900/20 relative overflow-hidden border border-amber-300/30"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-10 -translate-y-10" />
                        <div className="relative z-10 flex items-center justify-between">
                            <div>
                                <p className="text-amber-100 text-[11px] font-bold uppercase tracking-widest mb-1">Sua carteirinha</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-[36px] font-black text-white leading-none">{user.coins}</span>
                                    <span className="text-amber-100 font-bold text-[15px]">Z-Coins</span>
                                </div>
                            </div>
                            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-[1.5rem] flex items-center justify-center border border-white/30">
                                <Coins className="w-8 h-8 text-white drop-shadow-md" />
                            </div>
                        </div>
                        <button
                            onClick={() => setShowHowTo(true)}
                            className="relative z-10 mt-4 flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-2 rounded-xl border border-white/30 text-white text-[12px] font-black uppercase tracking-wider hover:bg-white/30 active:scale-95 transition-all"
                        >
                            <HelpCircle className="w-3.5 h-3.5" /> Como ganho mais?
                        </button>
                    </motion.div>

                    {/* 2. Em Destaque (Featured) */}
                    <motion.section
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 }}
                    >
                        <div className="flex items-center gap-2 mb-3">
                            <Sparkles className="w-5 h-5 text-amber-500" />
                            <h2 className="font-extrabold text-[17px] text-gray-800 tracking-tight">Em destaque</h2>
                            <div className="flex items-center gap-1 bg-red-500 px-2 py-0.5 rounded-full ml-auto">
                                <span className="text-white text-[10px] font-black uppercase">-30%</span>
                            </div>
                        </div>

                        <div className={cn("rounded-[2rem] p-5 relative overflow-hidden border border-white/30 shadow-xl bg-gradient-to-br", featured.bgGradient)}>
                            <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/20 rounded-full blur-xl" />
                            <div className="flex items-center gap-3 relative z-10">
                                <div className="w-28 h-28 bg-white/60 rounded-[1.5rem] shadow-lg border border-white/50 shrink-0 overflow-hidden">
                                    <FeaturedScene size={112} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Personagem da semana</p>
                                    <h3 className="font-extrabold text-[20px] text-gray-800 leading-tight">{featured.name}</h3>
                                    <SpeechBubble tailSide="left" tailOffset="top-3" className="mt-1.5 !px-3 !py-2">
                                        <p className="text-[11px] text-gray-600 font-medium leading-snug">
                                            {featured.greeting(user.name)}
                                        </p>
                                    </SpeechBubble>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="text-gray-400 line-through text-[12px] font-bold">{Math.round(featured.cost * 1.3)}</span>
                                        <div className="flex items-center gap-1 bg-amber-100 px-2.5 py-1 rounded-full border border-amber-200">
                                            <Coins className="w-3.5 h-3.5 text-amber-600" />
                                            <span className="text-[14px] font-black text-amber-700">{featured.cost}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => handleSelectCharacter(featured.id, featured.cost, featured.name)}
                                className="w-full mt-4 py-3 bg-white/80 backdrop-blur-sm text-gray-800 font-black rounded-[1.25rem] text-[13px] uppercase tracking-wider active:scale-[0.98] transition-transform border border-white/50 shadow-sm relative z-10"
                            >
                                {featuredOwned ? (user.activeCharacter === featured.id ? "Equipado" : "Equipar") : "Quero esse parceiro"}
                            </button>
                        </div>
                    </motion.section>

                    {/* 3. Power-Ups */}
                    <motion.section
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <div className="flex items-center gap-2 mb-3">
                            <Zap className="w-5 h-5 text-violet-500" />
                            <h2 className="font-extrabold text-[17px] text-gray-800 tracking-tight">Itens que ajudam</h2>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            {POWER_UPS.map(pu => (
                                <button
                                    key={pu.id}
                                    onClick={() => handlePurchasePowerUp(pu.cost, pu.type, pu.name)}
                                    className="bg-white/95 rounded-[1.5rem] p-4 flex flex-col items-center text-center ring-1 ring-black/[0.02] shadow-lg active:scale-[0.97] transition-all cursor-pointer"
                                >
                                    <div className={cn("w-12 h-12 rounded-[1.25rem] flex items-center justify-center mb-2.5", pu.iconBg)}>
                                        <pu.icon className={cn("w-6 h-6", pu.iconColor)} />
                                    </div>
                                    <h4 className="font-extrabold text-[12px] text-gray-800 leading-tight mb-1">{pu.name}</h4>
                                    <p className="text-[10px] text-gray-400 font-medium leading-tight mb-2.5">{pu.desc}</p>
                                    <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1.5 rounded-full border border-amber-100">
                                        <Coins className="w-3 h-3 text-amber-500" />
                                        <span className="text-[12px] font-black text-amber-600">{pu.cost}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </motion.section>

                    {/* 4. Personagens 3D */}
                    <motion.section
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                    >
                        <div className="flex items-center gap-2 mb-3">
                            <Star className="w-5 h-5 text-blue-500" />
                            <h2 className="font-extrabold text-[17px] text-gray-800 tracking-tight">Personagens 3D</h2>
                            <span className="text-[10px] text-gray-400 font-bold ml-auto">Toca pra equipar</span>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            {CHARACTERS.map(c => {
                                const isOwned = user.unlockedCharacters.includes(c.id);
                                const isActive = user.activeCharacter === c.id;
                                const Scene = c.Scene;
                                return (
                                    <button
                                        key={c.id}
                                        onClick={() => handleSelectCharacter(c.id, c.cost, c.name)}
                                        className={cn(
                                            "text-left bg-white/95 rounded-[1.5rem] p-3 ring-1 shadow-sm border active:scale-[0.98] transition-all relative overflow-hidden",
                                            isActive ? "ring-blue-300 border-blue-200 bg-blue-50/40" : isOwned ? "ring-emerald-100 border-emerald-100 bg-emerald-50/20" : "ring-black/[0.02] border-white/50"
                                        )}
                                    >
                                        {isActive && (
                                            <div className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center shadow-md">
                                                <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                                            </div>
                                        )}
                                        <div className={cn("rounded-[1.25rem] bg-gradient-to-br overflow-hidden", c.bgGradient)}>
                                            <Scene size={140} />
                                        </div>
                                        <div className="mt-2 px-1">
                                            <p className="font-extrabold text-[14px] text-gray-800 leading-tight">{c.name}</p>
                                            <p className="text-[10px] text-gray-400 font-medium leading-tight mt-0.5 line-clamp-2">{c.description}</p>
                                            <div className="mt-2 flex items-center justify-between">
                                                {isOwned ? (
                                                    <span className={cn("text-[10px] font-black uppercase tracking-wider", isActive ? "text-blue-600" : "text-emerald-600")}>
                                                        {isActive ? "Equipado" : "Toca pra equipar"}
                                                    </span>
                                                ) : (
                                                    <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-full border border-amber-100">
                                                        <Coins className="w-3 h-3 text-amber-600" />
                                                        <span className="text-[11px] font-black text-amber-700">{c.cost}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </motion.section>

                    {/* 5. Temas — personalização da tela inicial */}
                    <motion.section
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="flex items-center gap-2 mb-3">
                            <Palette className="w-5 h-5 text-pink-500" />
                            <h2 className="font-extrabold text-[17px] text-gray-800 tracking-tight">Personaliza sua tela</h2>
                            <span className="text-[10px] text-gray-400 font-bold ml-auto">Aplica no Home</span>
                        </div>

                        <div className="space-y-2.5">
                            {ARENA_THEMES.map(theme => {
                                const isLocked = user.currentStep < theme.unlockStep;
                                const isOwned = user.unlockedThemes.includes(theme.id);
                                const isActive = user.activeTheme === theme.id;
                                const isFree = theme.cost === 0;
                                return (
                                    <button
                                        key={theme.id}
                                        onClick={() => handleSelectTheme(theme.id, theme.cost, theme.name, isLocked)}
                                        disabled={isLocked}
                                        className={cn(
                                            "w-full text-left flex items-center gap-4 p-4 rounded-[1.5rem] ring-1 shadow-sm transition-all active:scale-[0.98]",
                                            isActive
                                                ? "ring-blue-300 border border-blue-200 bg-blue-50/40"
                                                : isLocked
                                                    ? "bg-gray-50/60 border border-gray-100 opacity-70 ring-black/[0.02] cursor-not-allowed"
                                                    : "bg-white/95 border border-white/50 ring-black/[0.02]"
                                        )}
                                    >
                                        <div className={cn("w-12 h-12 rounded-[1rem] shrink-0 ring-1 ring-black/5", theme.preview)} />
                                        <div className="flex-1">
                                            <p className="font-extrabold text-[14px] text-gray-800">{theme.name}</p>
                                            <p className="text-[11px] text-gray-400 font-medium">{theme.desc}</p>
                                            {isLocked && <p className="text-[10px] text-amber-600 font-black uppercase tracking-wider mt-0.5">Liberado na fase {theme.unlockStep}</p>}
                                        </div>
                                        {isLocked ? (
                                            <Lock className="w-5 h-5 text-gray-300 shrink-0" />
                                        ) : isActive ? (
                                            <span className="text-[11px] font-black text-blue-600 bg-blue-50 px-2.5 py-1.5 rounded-xl border border-blue-100 flex items-center gap-1">
                                                <Check className="w-3 h-3" /> Ativo
                                            </span>
                                        ) : isOwned ? (
                                            <span className="text-[11px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1.5 rounded-xl border border-emerald-100">Aplicar</span>
                                        ) : isFree ? (
                                            <span className="text-[11px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1.5 rounded-xl border border-emerald-100">Grátis</span>
                                        ) : (
                                            <span className="flex items-center gap-1 bg-amber-50 px-3 py-2 rounded-xl border border-amber-100 text-amber-700 font-black text-[12px]">
                                                <Coins className="w-3.5 h-3.5" /> {theme.cost}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </motion.section>

                    {/* 6. Títulos Especiais */}
                    <motion.section
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 }}
                    >
                        <div className="flex items-center gap-2 mb-3">
                            <Crown className="w-5 h-5 text-amber-500" />
                            <h2 className="font-extrabold text-[17px] text-gray-800 tracking-tight">Títulos pra exibir</h2>
                        </div>

                        <div className="space-y-2.5">
                            {SPECIAL_TITLES.map(t => (
                                <div key={t.id} className="bg-white/95 rounded-[1.5rem] p-4 flex items-center gap-4 ring-1 ring-black/[0.02] shadow-sm border border-white/50">
                                    <div className="flex-1">
                                        <p className="font-extrabold text-[15px] text-gray-800">&quot;{t.title}&quot;</p>
                                        <p className="text-[11px] text-gray-400 font-medium mt-0.5">{t.desc}</p>
                                    </div>
                                    <button
                                        onClick={() => handlePurchaseTitle(t.cost, t.title)}
                                        className="flex items-center gap-1.5 bg-amber-50 px-3.5 py-2.5 rounded-[1rem] border border-amber-200 text-amber-700 font-black text-[13px] hover:bg-amber-100 active:scale-95 transition-all shrink-0"
                                    >
                                        <Coins className="w-3.5 h-3.5" /> {t.cost}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </motion.section>

                </main>

                <BottomNav />
            </div>

            {showHowTo && <HowToEarnModal onClose={() => setShowHowTo(false)} />}
        </div>
    );
}
