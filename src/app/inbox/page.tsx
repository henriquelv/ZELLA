"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Bell, Check, Clock, Info, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// --- Types ---
interface Notification {
    id: string;
    title: string;
    message: string;
    time: string;
    read: boolean;
    type: "info" | "success" | "warning" | "alert";
}

// --- Mock Data ---
const MOCK_NOTIFICATIONS: Notification[] = [
    {
        id: "1",
        title: "Você atingiu o Nível 2! 🚀",
        message: "Parabéns! Você desbloqueou novas missões financeiras.",
        time: "Há 2 horas",
        read: false,
        type: "success",
    },
    {
        id: "2",
        title: "Lembrete de Dívida",
        message: "A fatura do Nubank vence em 3 dias. Já se organizou?",
        time: "Ontem",
        read: false,
        type: "warning",
    },
    {
        id: "3",
        title: "Nova Dica Disponível",
        message: "Descubra como montar sua reserva de emergência em 3 passos.",
        time: "Há 2 dias",
        read: true,
        type: "info",
    },
    {
        id: "4",
        title: "Alerta de Gasto",
        message: "Você gastou 80% do orçamento de Lazer este mês.",
        time: "Há 3 dias",
        read: true,
        type: "alert",
    },
];

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const staggerItem = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 },
};

export default function InboxPage() {
    const router = useRouter();
    const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);

    const markAllRead = () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    };

    const markAsRead = (id: string) => {
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
    };

    const unreadCount = notifications.filter((n) => !n.read).length;

    const getIcon = (type: Notification["type"]) => {
        switch (type) {
            case "success": return <Check className="w-4 h-4 text-green-500" />;
            case "warning": return <Clock className="w-4 h-4 text-orange-500" />;
            case "alert": return <AlertTriangle className="w-4 h-4 text-red-500" />;
            default: return <Info className="w-4 h-4 text-blue-500" />;
        }
    };

    return (
        <div className="min-h-screen bg-background pb-24">
            {/* Header */}
            <header className="px-6 pt-12 pb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.back()}
                        className="rounded-full shrink-0"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold font-heading flex items-center gap-2">
                            Inbox
                            {unreadCount > 0 && (
                                <span className="bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">
                                    {unreadCount} novos
                                </span>
                            )}
                        </h1>
                    </div>
                </div>
                {unreadCount > 0 && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={markAllRead}
                        className="text-primary text-xs font-semibold hover:bg-primary/10"
                    >
                        Ler tudo
                    </Button>
                )}
            </header>

            <main className="px-6">
                <AnimatePresence>
                    {notifications.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center justify-center pt-20 text-center space-y-4"
                        >
                            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                                <Bell className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <p className="text-muted-foreground">Tudo limpo por aqui!</p>
                        </motion.div>
                    ) : (
                        <motion.div
                            variants={staggerContainer}
                            initial="hidden"
                            animate="visible"
                            className="space-y-3"
                        >
                            {notifications.map((notif) => (
                                <motion.div
                                    key={notif.id}
                                    variants={staggerItem}
                                    onClick={() => markAsRead(notif.id)}
                                    className={cn(
                                        "p-4 rounded-2xl border flex gap-4 transition-all cursor-pointer relative overflow-hidden",
                                        notif.read
                                            ? "bg-card border-border opacity-60"
                                            : "bg-card border-l-4 border-l-primary shadow-sm"
                                    )}
                                >
                                    <div className={cn(
                                        "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                                        "bg-muted"
                                    )}>
                                        {getIcon(notif.type)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className={cn("text-sm font-semibold", !notif.read && "text-foreground")}>
                                                {notif.title}
                                            </h3>
                                            <span className="text-[10px] text-muted-foreground shrink-0 ml-2">
                                                {notif.time}
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                            {notif.message}
                                        </p>
                                    </div>
                                    {!notif.read && (
                                        <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-primary" />
                                    )}
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}
