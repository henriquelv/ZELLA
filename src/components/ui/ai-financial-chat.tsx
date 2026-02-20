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

// Simple rule-based financial response engine (no API key needed)
function generateResponse(msg: string, state: {
    xp: number;
    coins: number;
    transactions: Array<{ category: string; amount: number; type: string }>;
}): string {
    const lower = msg.toLowerCase();
    const expenses = state.transactions.filter(t => t.type === "expense");
    const income = state.transactions.filter(t => t.type === "income");
    const totalExp = expenses.reduce((a, b) => a + b.amount, 0);
    const totalInc = income.reduce((a, b) => a + b.amount, 0);
    const balance = totalInc - totalExp;

    if (lower.includes("saldo") || lower.includes("balanço") || lower.includes("situação")) {
        return `📊 Sua situação financeira atual:\n• Receitas: R$ ${totalInc.toFixed(2)}\n• Despesas: R$ ${totalExp.toFixed(2)}\n• Saldo: R$ ${balance.toFixed(2)}\n• XP acumulado: ${state.xp}\n\n${balance >= 0 ? "✅ Parabéns! Você está no positivo." : "⚠️ Atenção: seus gastos superam sua renda. Vamos ajustar?"}`;
    }

    if (lower.includes("gastei") || lower.includes("gast") || lower.includes("despesa")) {
        const topCats = expenses
            .reduce((acc: Record<string, number>, t) => {
                acc[t.category] = (acc[t.category] || 0) + t.amount; return acc;
            }, {});
        const sorted = Object.entries(topCats).sort((a, b) => b[1] - a[1]).slice(0, 3);
        const lines = sorted.map(([cat, v]) => `• ${cat}: R$ ${v.toFixed(2)}`).join("\n");
        return `💸 Seus maiores gastos:\n${lines || "Nenhuma despesa registrada ainda."}\n\nDica: Identifique gastos desnecessários e você pode economizar este mês!`;
    }

    if (lower.includes("economiz") || lower.includes("poupar") || lower.includes("reserva")) {
        const saving = balance * 0.2;
        return `💰 Dica de poupança:\n\nSeguindo a regra 50/30/20:\n• 50% para necessidades\n• 30% para desejos\n• 20% para poupança\n\nCom sua renda, você deveria poupar aproximadamente R$ ${saving.toFixed(2)} por mês.\n\nComece pequeno — qualquer valor já é um ótimo começo!`;
    }

    if (lower.includes("invest") || lower.includes("renda fixa") || lower.includes("ações")) {
        return `📈 Dicas de investimento:\n\n1. **Emergência primeiro** — Tenha 6 meses de gastos guardados\n2. **Tesouro Direto** — Seguro, com garantia do governo\n3. **CDB/LCI/LCA** — Acima de 100% do CDI são boas opções\n4. **Ações** — Indicado apenas com perfil moderado ou agressivo\n\nQual é seu objetivo: segurança ou crescimento?`;
    }

    if (lower.includes("dívida") || lower.includes("divid") || lower.includes("débito")) {
        return `⚠️ Gestão de dívidas:\n\n1. Liste todas as dívidas com taxas de juros\n2. Priorize as de **maior juros** para pagar primeiro\n3. Negocie desconto para pagamento à vista\n4. Evite novas dívidas enquanto paga as atuais\n\nO método "bola de neve" é ótimo: pague a menor dívida primeiro e use esse valor para a próxima!`;
    }

    if (lower.includes("oi") || lower.includes("olá") || lower.includes("ola") || lower.includes("bom dia") || lower.includes("boa tarde")) {
        return `👋 Olá! Sou a Zella AI, sua assistente financeira pessoal!\n\nPosso te ajudar com:\n• 📊 Ver seu saldo e despesas\n• 💰 Dicas de poupança\n• 📈 Orientações sobre investimentos\n• ⚠️ Gestão de dívidas\n\nO que você gostaria de saber?`;
    }

    if (lower.includes("obrigado") || lower.includes("valeu")) {
        return `😊 Fico feliz em ajudar! Continue registrando suas finanças e ganhe mais XP!\n\nLembre-se: todo grande patrimônio começou com um pequeno passo. 🚀`;
    }

    return `🤔 Não entendi totalmente, mas posso te ajudar com:\n\n• "Qual meu saldo?"\n• "Onde estou gastando mais?"\n• "Como economizar?"\n• "Como investir?"\n• "Como sair das dívidas?"\n\nTente uma dessas perguntas!`;
}

interface AIChatProps {
    isOpen: boolean;
    onClose: () => void;
}

export function AIFinancialChat({ isOpen, onClose }: AIChatProps) {
    const user = useUserStoreHydrated(s => s);
    const [messages, setMessages] = useState<Message[]>([
        { role: "assistant", content: "👋 Olá! Sou a **Zella AI**, sua conselheira financeira pessoal. Como posso ajudar hoje?" }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const send = () => {
        if (!input.trim() || !user) return;
        const userMsg = input.trim();
        setInput("");
        setMessages(m => [...m, { role: "user", content: userMsg }]);
        setLoading(true);

        setTimeout(() => {
            const response = generateResponse(userMsg, {
                xp: user.xp,
                coins: user.coins,
                transactions: user.transactions,
            });
            setMessages(m => [...m, { role: "assistant", content: response }]);
            setLoading(false);
        }, 600);
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
                                className="flex-1 bg-muted/50 border border-border/50 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
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
