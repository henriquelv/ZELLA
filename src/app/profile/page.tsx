"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    Settings,
    Bell,
    Shield,
    HelpCircle,
    LogOut,
    ChevronRight,
    Camera,
    Trophy,
    Flame,
    Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useUserStoreHydrated } from "@/store/useStore";
import { BottomNav } from "@/components/ui/bottom-nav";
import dynamic from "next/dynamic";
import { PageLoader } from "@/components/ui/page-loader";

const XPOrbScene = dynamic(
    () => import("@/components/ui/3d-scenes").then((mod) => mod.XPOrbScene),
    { ssr: false }
);

const STATS = [
    { label: "Dias Seguidos", icon: Flame, color: "text-orange-500", bg: "bg-orange-500/10", key: "streak" },
    { label: "Nível Atual", icon: Trophy, color: "text-yellow-500", bg: "bg-yellow-500/10", key: "currentStep" },
    { label: "Missões", icon: Target, color: "text-blue-500", bg: "bg-blue-500/10", key: "missions" },
];

const MENU_ITEMS = [
    { icon: Bell, label: "Notificações", href: "/inbox" },
    { icon: Shield, label: "Segurança e Privacidade", href: "/#privacy" },
    { icon: HelpCircle, label: "Ajuda e Suporte", href: "/#support" },
];

export default function ProfilePage() {
    const router = useRouter();
    const user = useUserStoreHydrated((state) => state);

    if (!user) return <PageLoader message="Carregando perfil..." />;

    return (
        <div className="min-h-screen bg-background pb-32 overflow-x-hidden selection:bg-primary/20">
            {/* Header / Banner */}
            <div className="relative h-48 bg-gradient-to-br from-primary via-primary/80 to-secondary/50 overflow-hidden">
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay" />

                {/* 3D Orb Background Accent */}
                <div className="absolute -right-10 -bottom-10 opacity-50 z-0">
                    <XPOrbScene size={200} />
                </div>

                <div className="absolute top-6 right-6 z-10 flex gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-white/20 rounded-full backdrop-blur-md transition-transform active:scale-95"
                        onClick={() => router.push("/settings")}
                    >
                        <Settings className="w-5 h-5" />
                    </Button>
                </div>
            </div>

            <main className="px-6 -mt-16 relative z-10 space-y-8">
                {/* Profile Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center"
                >
                    <div className="relative mb-4">
                        <div className="w-28 h-28 rounded-full border-4 border-background bg-zinc-800 flex items-center justify-center text-4xl font-bold font-heading text-white shadow-xl ring-2 ring-primary/20">
                            {user.name ? user.name.charAt(0).toUpperCase() : "T"}
                        </div>
                        <button className="absolute bottom-0 right-0 p-2.5 bg-primary text-white rounded-full shadow-lg border-4 border-background hover:scale-110 active:scale-95 transition-transform">
                            <Camera className="w-4 h-4" />
                        </button>
                    </div>
                    <h1 className="text-2xl font-bold font-heading">{user.name || "Testador"}</h1>
                    <p className="text-sm font-medium text-muted-foreground bg-muted px-3 py-1 rounded-full mt-2">Membro Beta</p>
                </motion.div>

                {/* Stats Grid */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-3 gap-3"
                >
                    {STATS.map((stat, i) => (
                        <motion.div
                            whileTap={{ scale: 0.95 }}
                            key={stat.label}
                            className="bg-card border border-border/50 rounded-2xl p-3 flex flex-col items-center gap-2 text-center shadow-lg shadow-black/5"
                        >
                            <div className={cn("p-2.5 rounded-xl", stat.bg)}>
                                <stat.icon className={cn("w-5 h-5", stat.color)} />
                            </div>
                            <div>
                                <p className="text-lg font-bold font-heading">
                                    {stat.key === "streak" ? user.streak : stat.key === "currentStep" ? user.currentStep : "12"}
                                </p>
                                <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider mt-0.5">
                                    {stat.label}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Menu */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-3"
                >
                    <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1">
                        Ajustes & Configurações
                    </h2>
                    <div className="bg-card border border-border/50 rounded-2xl overflow-hidden shadow-lg shadow-black/5 divide-y divide-border/50">
                        {MENU_ITEMS.map((item) => (
                            <button
                                key={item.label}
                                onClick={() => router.push(item.href)}
                                className="w-full flex items-center justify-between p-4 hover:bg-muted/50 active:bg-muted transition-colors group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-2.5 bg-muted rounded-xl text-foreground group-hover:scale-110 transition-transform">
                                        <item.icon className="w-4 h-4" />
                                    </div>
                                    <span className="font-bold text-sm text-foreground/90">{item.label}</span>
                                </div>
                                <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-primary transition-colors group-hover:translate-x-1" />
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* Logout */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <Button
                        variant="ghost"
                        className="w-full text-destructive hover:text-destructive hover:bg-destructive/10 gap-2 h-14 rounded-2xl font-bold text-base transition-colors"
                        onClick={() => {
                            user.resetProgress();
                            router.push("/");
                        }}
                    >
                        <LogOut className="w-5 h-5" />
                        Sair da Conta
                    </Button>
                </motion.div>
            </main>

            <BottomNav />
        </div>
    );
}
