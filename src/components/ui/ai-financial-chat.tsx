"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useUserStoreHydrated } from "@/store/useStore";

interface Message {
    role: "user" | "assistant";
    content: string;
}



interface AIChatProps {
    isOpen: boolean;
    onClose: () => void;
}

export function AIFinancialChat({ isOpen, onClose }: AIChatProps) {
    const user = useUserStoreHydrated(s => s);
    const [messages, setMessages] = useState<Message[]>([
        {
            role: "assistant",
            content: user?.transactions && user.transactions.length > 0
                ? `🔥 Olá! Já dei uma olhada nos seus dados. Seu maior gasto está em **${(() => {
                    const cats: Record<string, number> = {};
                    user.transactions.filter(t => t.type === 'expense').forEach(t => { cats[t.category] = (cats[t.category] || 0) + t.amount; });
                    return Object.entries(cats).sort(([, a], [, b]) => b - a)[0]?.[0] || 'alimentação';
                })()} **. Quer que eu te mostre como cortar isso sem sofrer?`
                : `👋 Olá! Sou a **Zella**, sua coach financeira. Antes de qualquer coisa: qual é o seu maior problema com dinheiro hoje — dívidas, gastos descontrolados ou falta de reserva?`
        }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const send = async () => {
        if (!input.trim() || !user) return;
        const userMsg = input.trim();
        setInput("");

        const newMessages: Message[] = [...messages, { role: "user", content: userMsg }];
        setMessages(newMessages);
        setLoading(true);

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: newMessages.slice(-6),
                    userContext: {
                        xp: user.xp,
                        coins: user.coins,
                        transactions: user.transactions,
                        currentStep: user.currentStep,
                    }
                })
            });

            const data = await res.json();

            if (res.ok && data.reply) {
                setMessages(m => [...m, { role: "assistant", content: data.reply }]);
            } else {
                setMessages(m => [...m, { role: "assistant", content: "⚠️ Desculpe, estou com problemas de conexão. Tente novamente em alguns segundos." }]);
            }
        } catch (error) {
            setMessages(m => [...m, { role: "assistant", content: "⚠️ Ocorreu um erro ao conectar com a IA." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-end sm:items-center justify-center"
                    onClick={(e) => e.target === e.currentTarget && onClose()}
                >
                    <motion.div
                        initial={{ y: "100%", opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: "100%", opacity: 0 }}
                        transition={{ type: "spring", damping: 28, stiffness: 200 }}
                        className="w-full max-w-md h-[80vh] bg-card border border-border/50 shadow-2xl rounded-t-3xl sm:rounded-3xl flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-[#1a3fa8] to-[#2563eb] px-5 pt-5 pb-4 flex items-center gap-3 shrink-0">
                            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-white font-heading">Zella AI</h3>
                                <p className="text-blue-200 text-xs">Conselheira financeira pessoal</p>
                            </div>
                            <button onClick={onClose} className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {messages.map((msg, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={cn("flex gap-2.5", msg.role === "user" && "flex-row-reverse")}
                                >
                                    <div className={cn(
                                        "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                                        msg.role === "assistant"
                                            ? "bg-gradient-to-tr from-[#1a3fa8] to-[#2563eb]"
                                            : "bg-primary"
                                    )}>
                                        {msg.role === "assistant"
                                            ? <Bot className="w-4 h-4 text-white" />
                                            : <User className="w-4 h-4 text-white" />}
                                    </div>
                                    <div className={cn(
                                        "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                                        msg.role === "assistant"
                                            ? "bg-muted/50 border border-border/50 text-foreground rounded-tl-sm"
                                            : "bg-primary text-primary-foreground rounded-tr-sm"
                                    )}>
                                        {msg.content.split("\n").map((line, li) => (
                                            <span key={li}>
                                                {line.replace(/\*\*(.*?)\*\*/g, "$1")}
                                                {li < msg.content.split("\n").length - 1 && <br />}
                                            </span>
                                        ))}
                                    </div>
                                </motion.div>
                            ))}

                            {loading && (
                                <div className="flex gap-2.5">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#1a3fa8] to-[#2563eb] flex items-center justify-center">
                                        <Bot className="w-4 h-4 text-white" />
                                    </div>
                                    <div className="bg-muted/50 border border-border/50 rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1.5 items-center">
                                        {[0, 0.15, 0.3].map((d, i) => (
                                            <motion.div
                                                key={i}
                                                animate={{ y: [0, -4, 0] }}
                                                transition={{ repeat: Infinity, duration: 0.8, delay: d }}
                                                className="w-2 h-2 bg-muted-foreground/60 rounded-full"
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                            <div ref={bottomRef} />
                        </div>

                        {/* Input */}
                        <div className="p-4 border-t border-border/50 flex gap-2 shrink-0">
                            <input
                                type="text"
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && send()}
                                placeholder="Pergunte sobre suas finanças..."
                                className="flex-1 bg-background border border-input rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground transition-all shadow-inner"
                            />
                            <Button
                                onClick={send}
                                disabled={!input.trim() || loading}
                                className="w-12 h-12 rounded-2xl p-0 shrink-0 bg-[#1a3fa8] hover:bg-[#1a3fa8]/90"
                            >
                                <Send className="w-4 h-4" />
                            </Button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
