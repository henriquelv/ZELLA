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

const STATS = [
    { label: "Dias Seguidos", icon: Flame, color: "text-orange-500", bg: "bg-orange-500/10", key: "streak" },
    { label: "Nível Atual", icon: Trophy, color: "text-yellow-500", bg: "bg-yellow-500/10", key: "currentStep" },
    { label: "Missões", icon: Target, color: "text-blue-500", bg: "bg-blue-500/10", key: "missions" },
];

const MENU_ITEMS = [
    { icon: Bell, label: "Notificações", href: "/inbox" },
    { icon: Shield, label: "Segurança e Privacidade", href: "/privacy" },
    { icon: HelpCircle, label: "Ajuda e Suporte", href: "/support" },
];

export default function ProfilePage() {
    const router = useRouter();
    const user = useUserStoreHydrated((state) => state);

    if (!user) return <div className="min-h-screen bg-background" />;

    return (
        <div className="min-h-screen bg-background pb-24">
            {/* Header / Banner */}
            <div className="relative h-48 bg-gradient-to-br from-primary via-primary/80 to-secondary/50">
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay" />
                <div className="absolute top-6 right-6">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-white/20 rounded-full"
                        onClick={() => router.push("/settings")}
                    >
                        <Settings className="w-5 h-5" />
                    </Button>
                </div>
            </div>

            <main className="px-6 -mt-16 relative z-10 space-y-8">
                {/* Profile Card */}
                <div className="flex flex-col items-center">
                    <div className="relative mb-4">
                        <div className="w-28 h-28 rounded-full border-4 border-background bg-zinc-800 flex items-center justify-center text-3xl font-bold text-white shadow-xl">
                            {user.name.charAt(0)}
                        </div>
                        <button className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full shadow-lg border-4 border-background hover:scale-110 transition-transform">
                            <Camera className="w-4 h-4" />
                        </button>
                    </div>
                    <h1 className="text-2xl font-bold font-heading">{user.name}</h1>
                    <p className="text-sm text-muted-foreground">Membro desde 2026</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-3">
                    {STATS.map((stat) => (
                        <div
                            key={stat.label}
                            className="bg-card border border-border rounded-2xl p-3 flex flex-col items-center gap-2 text-center shadow-sm"
                        >
                            <div className={cn("p-2 rounded-xl", stat.bg)}>
                                <stat.icon className={cn("w-5 h-5", stat.color)} />
                            </div>
                            <div>
                                <p className="text-lg font-bold">
                                    {stat.key === "streak" ? user.streak : stat.key === "currentStep" ? user.currentStep : "12"}
                                </p>
                                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                                    {stat.label}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Menu */}
                <div className="space-y-2">
                    <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1">
                        Configurações
                    </h2>
                    <div className="bg-card border border-border rounded-2xl overflow-hidden divide-y divide-border">
                        {MENU_ITEMS.map((item) => (
                            <button
                                key={item.label}
                                onClick={() => router.push(item.href)}
                                className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-muted rounded-lg text-foreground">
                                        <item.icon className="w-4 h-4" />
                                    </div>
                                    <span className="font-medium text-sm">{item.label}</span>
                                </div>
                                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Logout */}
                <Button
                    variant="ghost"
                    className="w-full text-destructive hover:text-destructive hover:bg-destructive/10 gap-2 h-12"
                    onClick={() => {
                        user.resetProgress();
                        router.push("/");
                    }}
                >
                    <LogOut className="w-4 h-4" />
                    Sair da Conta
                </Button>
            </main>
        </div>
    );
}
