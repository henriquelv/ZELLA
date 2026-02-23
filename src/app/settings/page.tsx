"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Moon, Sun, Bell, Shield, Download, Trash2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BottomNav } from "@/components/ui/bottom-nav";
import { useUserStore } from "@/store/useStore";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { PageLoader } from "@/components/ui/page-loader";

const stagger = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
};
const fadeUp = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } };

export default function SettingsPage() {
    const router = useRouter();
    const { theme, setTheme } = useTheme();
    const user = useUserStore(s => s);
    const resetProgress = useUserStore(s => s.resetProgress);
    const [notificationsOn, setNotificationsOn] = useState(true);

    useEffect(() => {
        if (user && !user.hasOnboarded) {
            router.push("/");
        }
    }, [user, router]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        resetProgress();
        router.push("/");
    };

    const handleDeleteAccount = () => {
        // Placeholder - would require confirmation and backend logic
        alert("Para deletar sua conta, entre em contato com o suporte.");
    };

    const SECTIONS = [
        {
            title: "Aparência",
            items: [
                {
                    icon: theme === "dark" ? Moon : Sun,
                    label: theme === "dark" ? "Modo Escuro Ativo" : "Modo Claro Ativo",
                    desc: "Alternar tema do app",
                    action: () => setTheme(theme === "dark" ? "light" : "dark"),
                    rightEl: (
                        <div className={cn(
                            "w-12 h-6 rounded-full transition-all relative shrink-0",
                            theme === "dark" ? "bg-primary" : "bg-muted"
                        )}>
                            <div className={cn(
                                "absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all",
                                theme === "dark" ? "left-6" : "left-0.5"
                            )} />
                        </div>
                    ),
                },
            ],
        },
        {
            title: "Notificações",
            items: [
                {
                    icon: Bell,
                    label: "Notificações Push",
                    desc: "Lembretes e conquistas",
                    action: () => setNotificationsOn(p => !p),
                    rightEl: (
                        <div className={cn(
                            "w-12 h-6 rounded-full transition-all relative shrink-0",
                            notificationsOn ? "bg-primary" : "bg-muted"
                        )}>
                            <div className={cn(
                                "absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all",
                                notificationsOn ? "left-6" : "left-0.5"
                            )} />
                        </div>
                    ),
                },
            ],
        },
        {
            title: "Privacidade & Dados",
            items: [
                {
                    icon: Shield,
                    label: "Política de Privacidade",
                    desc: "Como seus dados são usados",
                    action: () => { },
                    rightEl: <ChevronRight className="w-4 h-4 text-muted-foreground/50" />,
                },
                {
                    icon: Download,
                    label: "Exportar meus dados",
                    desc: "Baixar histórico financeiro (CSV)",
                    action: () => alert("Exportação disponível em breve."),
                    rightEl: <ChevronRight className="w-4 h-4 text-muted-foreground/50" />,
                },
            ],
        },
    ];

    return (
        <div className="min-h-screen bg-background pb-28">
            <header className="px-6 pt-12 pb-4 flex items-center gap-4 sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-border/50">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full shrink-0">
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                    <h1 className="text-xl font-bold font-heading">Configurações</h1>
                    <p className="text-xs text-muted-foreground">Personalize sua experiência</p>
                </div>
            </header>

            <main className="px-6 mt-6 space-y-8">
                <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-6">
                    {SECTIONS.map(section => (
                        <motion.section key={section.title} variants={fadeUp} className="space-y-2">
                            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1">
                                {section.title}
                            </h2>
                            <div className="bg-card border border-border/50 rounded-2xl overflow-hidden divide-y divide-border/50 shadow-sm">
                                {section.items.map(item => (
                                    <button
                                        key={item.label}
                                        onClick={item.action}
                                        className="w-full flex items-center gap-4 p-4 hover:bg-muted/40 transition-colors active:bg-muted text-left"
                                    >
                                        <div className="p-2.5 bg-muted rounded-xl shrink-0">
                                            <item.icon className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-sm">{item.label}</p>
                                            <p className="text-xs text-muted-foreground">{item.desc}</p>
                                        </div>
                                        {item.rightEl}
                                    </button>
                                ))}
                            </div>
                        </motion.section>
                    ))}

                    {/* Danger Zone */}
                    <motion.section variants={fadeUp} className="space-y-2">
                        <h2 className="text-xs font-bold text-destructive uppercase tracking-wider px-1">Zona de Perigo</h2>
                        <div className="bg-card border border-border/50 rounded-2xl overflow-hidden divide-y divide-border/50 shadow-sm">
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-4 p-4 hover:bg-destructive/5 transition-colors text-left"
                            >
                                <div className="p-2.5 bg-destructive/10 rounded-xl shrink-0">
                                    <ArrowLeft className="w-4 h-4 text-destructive" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold text-sm text-destructive">Sair da Conta</p>
                                    <p className="text-xs text-muted-foreground">Encerrar sessão atual</p>
                                </div>
                                <ChevronRight className="w-4 h-4 text-destructive/50 shrink-0" />
                            </button>
                            <button
                                onClick={handleDeleteAccount}
                                className="w-full flex items-center gap-4 p-4 hover:bg-destructive/5 transition-colors text-left"
                            >
                                <div className="p-2.5 bg-destructive/10 rounded-xl shrink-0">
                                    <Trash2 className="w-4 h-4 text-destructive" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold text-sm text-destructive">Excluir Conta</p>
                                    <p className="text-xs text-muted-foreground">Deletar todos os dados permanentemente</p>
                                </div>
                                <ChevronRight className="w-4 h-4 text-destructive/50 shrink-0" />
                            </button>
                        </div>
                    </motion.section>

                    <p className="text-center text-[10px] text-muted-foreground/50 font-medium uppercase tracking-widest pb-2">
                        Zella v1.0 · Made with ♥
                    </p>
                </motion.div>
            </main>

            <BottomNav />
        </div>
    );
}
