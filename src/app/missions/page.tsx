"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BottomNav } from "@/components/ui/bottom-nav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useUserStoreHydrated, useUserStore } from "@/store/useStore";
import { PageLoader } from "@/components/ui/page-loader";
import {
    GamepadIcon, Trophy, Zap, Target, ChevronLeft,
    CheckCircle2, XCircle, Star, Coins, HelpCircle, TrendingUp, ChevronRight, CreditCard, ArrowRight
} from "lucide-react";
import dynamic from "next/dynamic";
import { SwipeCardGame } from "@/components/ui/swipe-card-game";
import Link from "next/link";

const TrophyScene = dynamic(() => import("@/components/ui/3d-scenes").then(m => ({ default: m.TrophyScene })), { ssr: false, loading: () => <div className="w-40 h-40 mx-auto flex items-center justify-center"><Trophy className="w-14 h-14 text-yellow-500 animate-pulse" /></div> });
const CoinScene = dynamic(() => import("@/components/ui/3d-scenes").then(m => ({ default: m.CoinScene })), { ssr: false, loading: () => <div className="w-36 h-36 mx-auto flex items-center justify-center"><Trophy className="w-12 h-12 text-blue-500 animate-pulse" /></div> });


// ───────────────────────────────
// GAME 3: FINANCIAL TRIVIA
// ───────────────────────────────
const TRIVIA_QS = [
    { q: "Qual a regra de ouro do investimento?", opts: ["Comprar barato", "Diversificar", "Investir tudo em um ativo", "Guardar embaixo do colchão"], ans: 1, exp: "Diversificar reduz o risco: não coloque todos os ovos na mesma cesta!" },
    { q: "O que é juros compostos?", opts: ["Juros sobre o principal", "Juros sobre juros", "Multa por atraso", "Taxa de câmbio"], ans: 1, exp: "Einstein chamou de \"8ª maravilha do mundo\". Juros incidem sobre o total acumulado." },
    { q: "Qual a diferença entre CDI e SELIC?", opts: ["São a mesma coisa", "CDI é taxa interbancária; SELIC é taxa básica", "CDI é poupança", "SELIC é inflação"], ans: 1, exp: "SELIC é a taxa básica do Banco Central. CDI segue a SELIC, mas é o referencial interbancário." },
    { q: "Para que serve um fundo de emergência?", opts: ["Viagens", "Cobrir gastos inesperados", "Investir em ações", "Pagar festas"], ans: 1, exp: "O fundo de emergência deve cobrir 3 a 6 meses de despesas para imprevistos." },
    { q: "O que é inflação?", opts: ["Alta de salários", "Queda no preço dos produtos", "Aumento generalizado de preços", "Valorização do real"], ans: 2, exp: "Inflação é o aumento contínuo e generalizado dos preços, que reduz o poder de compra." },
    { q: "Investimento mais seguro no Brasil?", opts: ["Ações na bolsa", "Cripto", "Tesouro Direto", "FIIs"], ans: 2, exp: "Tesouro Direto tem garantia do Governo Federal — o mais seguro para iniciantes." },
];

function FinancialTrivia({ onFinish }: { onFinish: (s: number, t: number) => void }) {
    const [qIdx, setQIdx] = useState(0);
    const [score, setScore] = useState(0);
    const [chosen, setChosen] = useState<number | null>(null);
    const [showExp, setShowExp] = useState(false);
    const q = TRIVIA_QS[qIdx];

    const handleAnswer = (i: number) => {
        if (chosen !== null) return;
        setChosen(i);
        setShowExp(true);
        if (i === q.ans) setScore(s => s + 1);
    };

    const handleNext = () => {
        if (qIdx === TRIVIA_QS.length - 1) {
            onFinish(score + (chosen === q.ans ? 1 : 0), TRIVIA_QS.length);
        } else {
            setQIdx(i => i + 1);
            setChosen(null);
            setShowExp(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1 font-bold uppercase tracking-wider">{qIdx + 1} / {TRIVIA_QS.length}</p>
                <div className="w-full bg-muted/50 h-2 rounded-full overflow-hidden">
                    <motion.div className="h-full bg-primary rounded-full" animate={{ width: `${((qIdx + 1) / TRIVIA_QS.length) * 100}%` }} />
                </div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div key={qIdx} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-3">
                    <Card className="border-primary/20 bg-primary/5">
                        <CardContent className="p-5">
                            <p className="font-bold text-base leading-snug">{q.q}</p>
                        </CardContent>
                    </Card>

                    {q.opts.map((opt, i) => (
                        <button
                            key={i}
                            onClick={() => handleAnswer(i)}
                            disabled={chosen !== null}
                            className={cn(
                                "w-full text-left p-4 rounded-2xl border-2 font-medium text-sm transition-all cursor-pointer",
                                chosen === null ? "border-border/50 bg-card hover:border-primary/40 hover:bg-primary/5" :
                                    i === q.ans ? "border-emerald-500 bg-emerald-500/10 text-emerald-700" :
                                        i === chosen ? "border-destructive bg-destructive/10 text-destructive" :
                                            "border-border/30 bg-muted/30 opacity-50"
                            )}
                        >
                            <span className="font-bold mr-2 text-muted-foreground">{String.fromCharCode(65 + i)}.</span> {opt}
                        </button>
                    ))}

                    {showExp && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                            className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-4 flex gap-3"
                        >
                            <HelpCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                            <p className="text-sm font-medium text-blue-700 dark:text-blue-300">{q.exp}</p>
                        </motion.div>
                    )}

                    {chosen !== null && (
                        <Button onClick={handleNext} className="w-full h-12 font-bold rounded-xl">
                            {qIdx === TRIVIA_QS.length - 1 ? "Ver Resultado" : "Próxima"} <ChevronRight className="w-4 h-4" />
                        </Button>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}

// ───────────────────────────────
// GAME 4: INVESTMENT SIMULATOR
// ───────────────────────────────
const INVEST_ROUNDS = [
    {
        title: "Você tem R$ 5.000 para investir. Mercado em alta. Onde coloca?",
        options: [
            { label: "Tesouro Direto", risk: "baixo", return12m: 12 },
            { label: "CDB 110% CDI", risk: "baixo", return12m: 13 },
            { label: "Ações de tech", risk: "alto", return12m: 35 },
            { label: "Cripto (BTC)", risk: "muito_alto", return12m: 80 },
        ]
    },
    {
        title: "Mercado caiu 15%. O que você faz com seus investimentos?",
        options: [
            { label: "Vendo tudo — pânico!", risk: "erro", return12m: -15 },
            { label: "Mantenho a posição", risk: "baixo", return12m: 10 },
            { label: "Compro mais na queda", risk: "médio", return12m: 25 },
            { label: "Coloco tudo na poupança", risk: "erro", return12m: 6 },
        ]
    },
    {
        title: "Você tem 20 anos de horizonte de investimento. Melhor estratégia?",
        options: [
            { label: "100% renda fixa", risk: "baixo", return12m: 12 },
            { label: "Mix: 70% RF + 30% RV", risk: "médio", return12m: 18 },
            { label: "100% ações globais", risk: "alto", return12m: 14 },
            { label: "Só poupança", risk: "erro", return12m: 6 },
        ]
    },
];

const RISK_COLOR: Record<string, string> = {
    baixo: "text-emerald-600 bg-emerald-500/10 border-emerald-500/40",
    médio: "text-yellow-600 bg-yellow-500/10 border-yellow-500/40",
    alto: "text-orange-600 bg-orange-500/10 border-orange-500/40",
    muito_alto: "text-red-600 bg-red-500/10 border-red-500/40",
    erro: "text-destructive bg-destructive/10 border-destructive/40",
};

function InvestmentSimulator({ onFinish }: { onFinish: (s: number, t: number) => void }) {
    const [round, setRound] = useState(0);
    const [chosen, setChosen] = useState<number | null>(null);
    const [score, setScore] = useState(0);
    const r = INVEST_ROUNDS[round];

    const handlePick = (i: number) => {
        if (chosen !== null) return;
        setChosen(i);
        const opt = r.options[i];
        if (opt.risk !== "erro" && opt.return12m >= 12) setScore(s => s + 1);
    };

    const handleNext = () => {
        if (round === INVEST_ROUNDS.length - 1) {
            onFinish(score, INVEST_ROUNDS.length);
        } else {
            setRound(r => r + 1);
            setChosen(null);
        }
    };

    return (
        <div className="space-y-4">
            <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1 font-bold uppercase tracking-wider">Rodada {round + 1} / {INVEST_ROUNDS.length}</p>
                <div className="w-full bg-muted/50 h-2 rounded-full overflow-hidden">
                    <motion.div className="h-full bg-emerald-500 rounded-full" animate={{ width: `${((round + 1) / INVEST_ROUNDS.length) * 100}%` }} />
                </div>
            </div>

            <Card className="border-emerald-500/20 bg-emerald-500/5">
                <CardContent className="p-5">
                    <p className="font-bold text-base leading-snug">{r.title}</p>
                </CardContent>
            </Card>

            <div className="space-y-2">
                {r.options.map((opt, i) => (
                    <button
                        key={i}
                        onClick={() => handlePick(i)}
                        disabled={chosen !== null}
                        className={cn(
                            "w-full text-left p-4 rounded-2xl border-2 font-medium text-sm transition-all cursor-pointer flex justify-between items-center",
                            chosen === null ? "border-border/50 bg-card hover:border-emerald-500/40 hover:bg-emerald-500/5" :
                                i === chosen ? RISK_COLOR[opt.risk] :
                                    "border-border/30 bg-muted/30 opacity-40"
                        )}
                    >
                        <span>{opt.label}</span>
                        {chosen !== null && (
                            <span className={cn(
                                "text-xs font-bold px-2 py-1 rounded-lg",
                                opt.return12m > 0 ? "bg-emerald-500/20 text-emerald-600" : "bg-destructive/20 text-destructive"
                            )}>
                                {opt.return12m > 0 ? "+" : ""}{opt.return12m}% / ano
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {chosen !== null && (
                <Button onClick={handleNext} className="w-full h-12 font-bold rounded-xl">
                    {round === INVEST_ROUNDS.length - 1 ? "Ver Resultado" : "Próxima Rodada"} <ChevronRight className="w-4 h-4" />
                </Button>
            )}
        </div>
    );
}

// ───────────────────────────────
// GAME 1: SPENDING SORTER
// ───────────────────────────────
const SORTER_ITEMS = [
    { label: "Aluguel", correct: "Necessidade" },
    { label: "Streaming (Netflix)", correct: "Desejo" },
    { label: "Festa / Balada", correct: "Desperdício" },
    { label: "Remédio", correct: "Necessidade" },
    { label: "Roupa de marca nova", correct: "Desejo" },
    { label: "Comida por delivery todo dia", correct: "Desperdício" },
    { label: "Conta de água", correct: "Necessidade" },
    { label: "Jogo novo no celular", correct: "Desejo" },
];

const CATEGORIES = ["Necessidade", "Desejo", "Desperdício"];

function SpendingSorter({ onFinish }: { onFinish: (score: number, total: number) => void }) {
    const [currentIdx, setCurrentIdx] = useState(0);
    const [score, setScore] = useState(0);
    const [feedback, setFeedback] = useState<null | "correct" | "wrong">(null);
    const [chosen, setChosen] = useState<string | null>(null);

    const item = SORTER_ITEMS[currentIdx];
    const isLast = currentIdx === SORTER_ITEMS.length - 1;

    const handleChoice = (cat: string) => {
        if (feedback) return;
        setChosen(cat);
        const correct = cat === item.correct;
        setFeedback(correct ? "correct" : "wrong");
        if (correct) setScore(s => s + 1);

        setTimeout(() => {
            setFeedback(null);
            setChosen(null);
            if (isLast) {
                onFinish(score + (correct ? 1 : 0), SORTER_ITEMS.length);
            } else {
                setCurrentIdx(i => i + 1);
            }
        }, 1000);
    };

    return (
        <div className="space-y-6">
            <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1 font-bold uppercase tracking-wider">{currentIdx + 1} / {SORTER_ITEMS.length}</p>
                <div className="w-full bg-muted/50 h-2 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-primary rounded-full"
                        animate={{ width: `${((currentIdx + 1) / SORTER_ITEMS.length) * 100}%` }}
                    />
                </div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIdx}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                >
                    <Card className={cn(
                        "border-2 transition-all",
                        feedback === "correct" ? "border-emerald-500 bg-emerald-500/5" :
                            feedback === "wrong" ? "border-destructive bg-destructive/5" :
                                "border-border/50"
                    )}>
                        <CardContent className="p-6 text-center">
                            {feedback === "correct" && <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />}
                            {feedback === "wrong" && <XCircle className="w-8 h-8 text-destructive mx-auto mb-2" />}
                            <p className="text-2xl font-bold">{item.label}</p>
                            {feedback === "wrong" && (
                                <p className="text-sm text-muted-foreground mt-2">Resposta correta: <strong className="text-foreground">{item.correct}</strong></p>
                            )}
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-3 gap-3 mt-4">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat}
                                onClick={() => handleChoice(cat)}
                                disabled={!!feedback}
                                className={cn(
                                    "py-3 px-2 rounded-2xl font-bold text-sm transition-all border-2 cursor-pointer",
                                    cat === "Necessidade" ? "border-emerald-500/50 text-emerald-600 bg-emerald-500/10 hover:bg-emerald-500/20" :
                                        cat === "Desejo" ? "border-yellow-500/50 text-yellow-600 bg-yellow-500/10 hover:bg-yellow-500/20" :
                                            "border-destructive/50 text-destructive bg-destructive/10 hover:bg-destructive/20",
                                    feedback && chosen === cat && feedback === "correct" && "scale-105 ring-2 ring-emerald-500",
                                    feedback && chosen === cat && feedback === "wrong" && "scale-95 opacity-70"
                                )}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}

// ───────────────────────────────
// GAME 2: BUDGET CHALLENGE
// ───────────────────────────────
const BUDGET_GAME = {
    income: 3000,
    items: [
        { label: "Aluguel", ideal: 900, max: 1200 },
        { label: "Alimentação", ideal: 500, max: 800 },
        { label: "Transporte", ideal: 300, max: 500 },
        { label: "Lazer", ideal: 200, max: 600 },
        { label: "Economias", ideal: 600, max: 999 },
    ]
};

function BudgetChallenge({ onFinish }: { onFinish: (score: number, total: number) => void }) {
    const [values, setValues] = useState<Record<string, number>>({
        Aluguel: 900, Alimentação: 500, Transporte: 300, Lazer: 200, Economias: 600
    });

    const total = Object.values(values).reduce((a, b) => a + b, 0);
    const remaining = BUDGET_GAME.income - total;

    const handleSubmit = () => {
        let score = 0;
        BUDGET_GAME.items.forEach(item => {
            const val = values[item.label];
            if (val >= item.ideal * 0.8 && val <= item.max) score++;
        });
        onFinish(score, BUDGET_GAME.items.length);
    };

    return (
        <div className="space-y-4">
            <div className={cn(
                "p-4 rounded-2xl text-center border-2 transition-colors",
                remaining < 0 ? "border-destructive/50 bg-destructive/10" :
                    remaining === 0 ? "border-emerald-500/50 bg-emerald-500/10" :
                        "border-primary/30 bg-primary/5"
            )}>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Disponível</p>
                <p className={cn("text-2xl font-bold", remaining < 0 ? "text-destructive" : "text-foreground")}>
                    R$ {remaining.toFixed(0)} <span className="text-sm text-muted-foreground font-normal">de R$ {BUDGET_GAME.income.toLocaleString()}</span>
                </p>
            </div>

            <div className="space-y-3">
                {BUDGET_GAME.items.map(item => (
                    <div key={item.label} className="bg-card border border-border/50 rounded-2xl p-4">
                        <div className="flex justify-between items-center mb-2">
                            <span className="font-bold text-sm">{item.label}</span>
                            <span className="text-sm font-bold text-primary">R$ {values[item.label]}</span>
                        </div>
                        <input
                            type="range"
                            min={0}
                            max={item.max}
                            step={50}
                            value={values[item.label]}
                            onChange={e => setValues(v => ({ ...v, [item.label]: Number(e.target.value) }))}
                            className="w-full accent-primary"
                        />
                        <p className="text-[10px] text-muted-foreground mt-1">Ideal: R$ {item.ideal} — Máx: R$ {item.max}</p>
                    </div>
                ))}
            </div>

            <Button
                onClick={handleSubmit}
                className="w-full h-12 font-bold rounded-xl"
                disabled={remaining < 0}
            >
                Confirmar Orçamento
            </Button>
        </div>
    );
}

// ───────────────────────────────
// GAME RESULT
// ───────────────────────────────
const GOAL_SUGGESTIONS: Array<{ title: string; description: string; category: "saving" | "spending" | "investing" | "habit"; xpReward: number }> = [
    { title: "Cortar um gasto desnecessário", description: "Identifique e elimine ao menos 1 desperdício esta semana.", category: "spending", xpReward: 50 },
    { title: "Criar fundo de emergência", description: "Guardar 3 meses de despesas em conta reserva.", category: "saving", xpReward: 100 },
    { title: "Fazer meu primeiro investimento", description: "Investir qualquer valor no Tesouro Direto.", category: "investing", xpReward: 80 },
    { title: "Controlar gastos por 7 dias", description: "Registrar todas as despesas durante uma semana completa.", category: "habit", xpReward: 60 },
];

function GameResult({ score, total, onBack }: { score: number; total: number; onBack: () => void }) {
    const pct = score / total;
    const xp = Math.round(pct * 80);
    const { addXp, addCoins, addGoal, goals } = useUserStore.getState();

    useEffect(() => {
        addXp(xp);
        addCoins(Math.round(pct * 20));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Pick a random goal suggestion that the user doesn't already have
    const suggestion = GOAL_SUGGESTIONS.find(sg => !goals.some(g => g.title === sg.title));

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8 space-y-6"
        >
            {/* 3D Trophy or Coin based on score */}
            {pct >= 0.7 ? (
                <TrophyScene size={160} />
            ) : (
                <CoinScene size={140} />
            )}

            <div>
                <h2 className="text-3xl font-bold font-heading">
                    {score}/{total}
                </h2>
                <p className="text-muted-foreground mt-1">
                    {pct >= 0.9 ? "Perfeito! Você domina as finanças!" :
                        pct >= 0.7 ? "Muito bom! Continue assim!" :
                            pct >= 0.5 ? "Bom começo, mas ainda há espaço para melhorar." :
                                "Não desanime! Cada errro é uma lição."}
                </p>
            </div>

            <div className="flex justify-center gap-6">
                <div className="text-center">
                    <div className="flex items-center gap-1 font-bold text-yellow-500"><Star className="w-4 h-4" />+{xp} XP</div>
                    <p className="text-xs text-muted-foreground">Conquistado</p>
                </div>
                <div className="text-center">
                    <div className="flex items-center gap-1 font-bold text-amber-500"><Coins className="w-4 h-4" />+{Math.round(pct * 20)}</div>
                    <p className="text-xs text-muted-foreground">Moedas</p>
                </div>
            </div>

            <Button onClick={onBack} className="w-full h-12 font-bold rounded-xl">
                Jogar Outro Game
            </Button>

            {/* Goal suggestion */}
            {suggestion && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 text-left space-y-2">
                    <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">💡 Meta sugerida</p>
                    <p className="font-bold text-sm">{suggestion.title}</p>
                    <p className="text-xs text-muted-foreground">{suggestion.description}</p>
                    <div className="flex gap-2 mt-2">
                        <button
                            onClick={() => addGoal({ id: crypto.randomUUID(), ...suggestion, createdAt: new Date().toISOString(), completed: false })}
                            className="flex-1 py-2 rounded-xl bg-emerald-500 text-white text-xs font-bold hover:bg-emerald-600 transition-colors"
                        >
                            ✅ Adicionar às Metas
                        </button>
                        <Link href="/metas" className="flex items-center gap-1 text-xs font-bold text-primary px-3">
                            Ver Metas <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>
                </div>
            )}
        </motion.div>
    );
}

// ───────────────────────────────
// MAIN MISSIONS PAGE
// ───────────────────────────────
const GAMES = [
    {
        id: "sorter",
        title: "Classifique os Gastos",
        subtitle: "Necessidade, Desejo ou Desperdício?",
        icon: Target,
        color: "bg-violet-500",
        bg: "bg-violet-500/10",
        colorText: "text-violet-500",
        xp: "até 80 XP",
        coins: "até 20 moedas"
    },
    {
        id: "budget",
        title: "Desafio de Orçamento",
        subtitle: "Distribua R$ 3.000 de forma inteligente",
        icon: Zap,
        color: "bg-emerald-500",
        bg: "bg-emerald-500/10",
        colorText: "text-emerald-500",
        xp: "até 80 XP",
        coins: "até 20 moedas"
    },
    {
        id: "trivia",
        title: "Trivia Financeira",
        subtitle: "Teste seus conhecimentos financeiros!",
        icon: HelpCircle,
        color: "bg-blue-500",
        bg: "bg-blue-500/10",
        colorText: "text-blue-500",
        xp: "até 80 XP",
        coins: "até 20 moedas"
    },
    {
        id: "invest",
        title: "Simulador de Investimento",
        subtitle: "Escolha os melhores ativos para lucrar",
        icon: TrendingUp,
        color: "bg-orange-500",
        bg: "bg-orange-500/10",
        colorText: "text-orange-500",
        xp: "até 80 XP",
        coins: "até 20 moedas"
    },
    {
        id: "swipe",
        title: "Arraste & Classifique",
        subtitle: "Arraste os cartões: Necessidade ou Desejo?",
        icon: CreditCard,
        color: "bg-pink-500",
        bg: "bg-pink-500/10",
        colorText: "text-pink-500",
        xp: "até 80 XP",
        coins: "até 20 moedas"
    },
];

export default function MissionsPage() {
    const user = useUserStoreHydrated(s => s);
    const [activeGame, setActiveGame] = useState<string | null>(null);
    const [result, setResult] = useState<{ score: number; total: number } | null>(null);

    if (!user) return <PageLoader message="Carregando missões..." />;

    const handleFinish = (score: number, total: number) => {
        setResult({ score, total });
    };

    const handleBack = () => {
        setActiveGame(null);
        setResult(null);
    };

    return (
        <div className="min-h-screen bg-background pb-28">
            {/* Header */}
            <header className="px-6 pt-12 pb-4 bg-background/80 backdrop-blur-md sticky top-0 z-40 border-b border-border/50">
                <div className="flex items-center gap-3">
                    {activeGame && (
                        <button onClick={handleBack} className="p-2 rounded-full hover:bg-muted transition-colors -ml-2">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                    )}
                    <div>
                        <h1 className="text-xl font-bold font-heading">
                            {activeGame ? GAMES.find(g => g.id === activeGame)?.title ?? "Missões" : "Missões & Games"}
                        </h1>
                        {!activeGame && <p className="text-xs text-muted-foreground font-medium">Aprenda brincando e ganhe XP</p>}
                    </div>
                </div>
            </header>

            <main className="px-6 mt-6">
                <AnimatePresence mode="wait">
                    {/* RESULT */}
                    {result ? (
                        <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <GameResult score={result.score} total={result.total} onBack={handleBack} />
                        </motion.div>
                    ) : activeGame === "sorter" ? (
                        <motion.div key="sorter" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <SpendingSorter onFinish={handleFinish} />
                        </motion.div>
                    ) : activeGame === "budget" ? (
                        <motion.div key="budget" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <BudgetChallenge onFinish={handleFinish} />
                        </motion.div>
                    ) : activeGame === "trivia" ? (
                        <motion.div key="trivia" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <FinancialTrivia onFinish={handleFinish} />
                        </motion.div>
                    ) : activeGame === "invest" ? (
                        <motion.div key="invest" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <InvestmentSimulator onFinish={handleFinish} />
                        </motion.div>
                    ) : activeGame === "swipe" ? (
                        <motion.div key="swipe" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <SwipeCardGame onFinish={handleFinish} />
                        </motion.div>
                    ) : (
                        /* GAME LIST */
                        <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0">
                                    <GamepadIcon className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-bold text-sm">Aprenda jogando!</p>
                                    <p className="text-xs text-muted-foreground">Complete missões para ganhar XP, moedas, e evoluir na Jornada.</p>
                                </div>
                            </div>

                            {GAMES.map((game, i) => (
                                <motion.div
                                    key={game.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                >
                                    <button
                                        onClick={() => setActiveGame(game.id)}
                                        className="w-full text-left"
                                    >
                                        <Card className="border-border/50 hover:border-primary/30 hover:shadow-md transition-all cursor-pointer active:scale-[0.99]">
                                            <CardContent className="p-5 flex items-center gap-4">
                                                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shrink-0", game.bg)}>
                                                    <game.icon className={cn("w-7 h-7", game.colorText)} />
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-bold text-base">{game.title}</h3>
                                                    <p className="text-xs text-muted-foreground mt-0.5">{game.subtitle}</p>
                                                    <div className="flex gap-3 mt-2">
                                                        <p className="text-xs font-bold text-yellow-500 flex items-center gap-1">
                                                            <Star className="w-3 h-3" /> {game.xp}
                                                        </p>
                                                        <p className="text-xs font-bold text-amber-500 flex items-center gap-1">
                                                            <Coins className="w-3 h-3" /> {game.coins}
                                                        </p>
                                                    </div>
                                                </div>
                                                <ChevronLeft className="w-5 h-5 text-muted-foreground rotate-180" />
                                            </CardContent>
                                        </Card>
                                    </button>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            <BottomNav />
        </div>
    );
}
