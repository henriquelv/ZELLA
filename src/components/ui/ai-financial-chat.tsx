"use client";

import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Send, Bot, User, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Message {
    role: "assistant" | "user";
    content: string;
}

export function AIFinancialChat({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [messages, setMessages] = useState<Message[]>([
        { role: "assistant", content: "Olá! Sou a Zella AI. Posso te ajudar a entender seus gastos, planejar economias e tomar decisões financeiras melhores. O que gostaria de saber?" }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const endRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, loading]);

    async function send() {
        if (!input.trim() || loading) return;
        const userMsg: Message = { role: "user", content: input.trim() };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setLoading(true);

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: [...messages, userMsg] })
            });
            const data = await res.json();
            setMessages(prev => [...prev, { role: "assistant", content: data.reply || "Sem resposta disponível." }]);
        } catch {
            setMessages(prev => [...prev, { role: "assistant", content: "Erro de conexão. Tente novamente." }]);
        } finally {
            setLoading(false);
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm flex flex-col justify-end sm:items-center sm:justify-center"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ y: "100%", opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: "100%", opacity: 0 }}
                        transition={{ type: "spring", damping: 28, stiffness: 200 }}
                        className="w-full max-w-md h-[80vh] bg-white border border-black/[0.06] shadow-2xl rounded-t-3xl sm:rounded-3xl flex flex-col overflow-hidden"
                        onClick={(e: React.MouseEvent) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-[#2563eb] to-[#1e40af] px-5 pt-5 pb-4 flex items-center gap-3 shrink-0">
                            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                                <h2 className="text-[16px] font-bold text-white">Zella AI</h2>
                                <p className="text-[11px] text-white/70">Sua assistente financeira</p>
                            </div>
                            <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
                                <X className="w-4 h-4 text-white" />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 p-4 space-y-4 overflow-y-auto overscroll-contain">
                            {messages.map((msg, i) => (
                                <div key={i} className={cn("flex gap-2.5", msg.role === "user" && "flex-row-reverse")}>
                                    <div className={cn(
                                        "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                                        msg.role === "assistant"
                                            ? "bg-gradient-to-tr from-[#2563eb] to-[#16a34a]"
                                            : "bg-gray-200"
                                    )}>
                                        {msg.role === "assistant"
                                            ? <Bot className="w-4 h-4 text-white" />
                                            : <User className="w-4 h-4 text-gray-600" />}
                                    </div>
                                    <div className={cn(
                                        "max-w-[80%] rounded-2xl px-4 py-3 text-[14px] leading-relaxed",
                                        msg.role === "assistant"
                                            ? "bg-gray-50 border border-gray-100 rounded-tl-sm text-gray-700"
                                            : "bg-[#2563eb] text-white rounded-tr-sm"
                                    )}>
                                        {msg.content}
                                    </div>
                                </div>
                            ))}

                            {loading && (
                                <div className="flex gap-2.5">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#2563eb] to-[#16a34a] flex items-center justify-center">
                                        <Bot className="w-4 h-4 text-white" />
                                    </div>
                                    <div className="bg-gray-50 border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1.5 items-center">
                                        <span className="w-2 h-2 bg-gray-300 rounded-full animate-pulse" />
                                        <span className="w-2 h-2 bg-gray-300 rounded-full animate-pulse [animation-delay:0.15s]" />
                                        <span className="w-2 h-2 bg-gray-300 rounded-full animate-pulse [animation-delay:0.3s]" />
                                    </div>
                                </div>
                            )}
                            <div ref={endRef} />
                        </div>

                        {/* Input */}
                        <div className="px-4 py-3 border-t border-gray-100 flex gap-2.5 bg-white shrink-0">
                            <input
                                type="text"
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && send()}
                                placeholder="Pergunte sobre suas finanças..."
                                className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-900 placeholder:text-gray-400 transition-all"
                            />
                            <Button
                                onClick={send}
                                disabled={!input.trim() || loading}
                                className="w-12 h-12 rounded-xl p-0 shrink-0 bg-gradient-to-r from-[#2563eb] to-[#1e40af] hover:opacity-90 border-0"
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
