// ─── Status-aware character speech engine (Duolingo-style) ────────────────────
//
// Returns short, contextual speech lines based on the user's current state.
// Each character has a slightly different voice, but the trigger logic is shared.

import type { UserState, Transaction } from "@/store/useStore";

export type SpeechContext =
    | "welcome"
    | "no_data"
    | "first_transaction_today"
    | "no_activity_today"
    | "streak_strong"
    | "streak_broken"
    | "streak_milestone"
    | "level_up_close"
    | "low_balance"
    | "negative_balance"
    | "good_efficiency"
    | "bad_efficiency"
    | "high_drains"
    | "no_revenue"
    | "step_advance"
    | "default_morning"
    | "default_afternoon"
    | "default_evening"
    | "default_night";

interface VoicePack {
    [key: string]: string;
}

// Each character has its own voice for each context
const VOICES: Record<string, VoicePack> = {
    panda: {
        welcome: "Oi {name}! Que bom te ver hoje 🐼",
        no_data: "{name}, vamos começar? Adiciona um gastinho aí pra eu te conhecer.",
        first_transaction_today: "Boa, {name}! Já registrou o primeiro gasto do dia 🌱",
        no_activity_today: "Ei {name}, ainda não vi nada hoje. Bora registrar?",
        streak_strong: "{streak} dias seguidos, {name}! Tô orgulhoso de você 🎋",
        streak_broken: "Calma {name}, recomeça hoje. Devagar a gente chega lá.",
        streak_milestone: "{streak} dias! Isso é hábito de verdade 💚",
        level_up_close: "Falta pouquinho pro nível {nextLevel}, {name}!",
        low_balance: "{name}, o saldo tá apertado essa semana. Cuidado.",
        negative_balance: "Ó {name}, tá no vermelho. Vamos respirar e ajustar.",
        good_efficiency: "{ie}% de sobra, {name}! Tá no caminho 🌿",
        bad_efficiency: "{name}, quase tudo escapou esse mês. Bora cortar uma coisinha?",
        high_drains: "Vi vazamento aqui, {name}. Olha as assinaturas.",
        no_revenue: "{name}, me conta quanto entra por mês? Aí eu te ajudo melhor.",
        step_advance: "Você subiu de fase, {name}! 🎉",
        default_morning: "Bom dia, {name}! Pronto pra cuidar da grana hoje?",
        default_afternoon: "Boa tarde, {name}! Como tá o dia?",
        default_evening: "Boa noite, {name}! Vamos fechar o dia bem?",
        default_night: "Tarde já hein {name}? Dá uma olhadinha rápida e descansa.",
    },
    fox: {
        welcome: "Eaí {name}! Vamos farejar oportunidades 🦊",
        no_data: "Tá vazio aqui, {name}. Manda os primeiros gastos!",
        first_transaction_today: "Achei o primeiro do dia, {name}! Continua.",
        no_activity_today: "{name}, nada hoje? Bora botar pra correr.",
        streak_strong: "{streak} dias, {name}! Tô impressionado 🔥",
        streak_broken: "Perdeu a sequência, {name}. Sem drama, recomeça.",
        streak_milestone: "{streak} dias! Você é craque, {name}.",
        level_up_close: "Tá quase no nível {nextLevel}, vai lá!",
        low_balance: "{name}, atenção: a grana tá curta.",
        negative_balance: "Vermelho detectado, {name}. Plano B?",
        good_efficiency: "{ie}% de sobra! Tá esperto, {name} 🦊",
        bad_efficiency: "{name}, gastou demais. Hora de revisar.",
        high_drains: "Cheirei vazamento, {name}. Olha esse extrato.",
        no_revenue: "Me conta a renda, {name}? Sem isso eu chuto.",
        step_advance: "Avançou de fase, {name}! 🚀",
        default_morning: "Bom dia, {name}! Bora caçar uns ganhos hoje?",
        default_afternoon: "Tarde produtiva, {name}? Vamos lá.",
        default_evening: "Fechou o dia? Manda os números pra mim.",
        default_night: "Tarde, hein {name}? Cinco minutinhos só.",
    },
    lion: {
        welcome: "Saudações, {name}. O reino te espera 🦁",
        no_data: "Ainda não vi seus gastos, {name}. Mostre seu domínio.",
        first_transaction_today: "Primeiro registro do dia, {name}. Excelente.",
        no_activity_today: "{name}, ainda nada hoje? Lembra: o rei não dorme.",
        streak_strong: "{streak} dias de disciplina, {name}. Magnífico.",
        streak_broken: "{name}, todo rei tropeça. Levanta e segue.",
        streak_milestone: "{streak} dias. Você é nobreza, {name} 👑",
        level_up_close: "Nível {nextLevel} ao alcance, {name}.",
        low_balance: "{name}, o tesouro tá escasso. Atenção.",
        negative_balance: "{name}, dívida no horizonte. Vamos cortar.",
        good_efficiency: "{ie}% de margem. Reinado próspero, {name}.",
        bad_efficiency: "{name}, o reino sangra. Reduza os luxos.",
        high_drains: "Drenos no tesouro, {name}. Identifique e elimine.",
        no_revenue: "{name}, qual o tributo mensal? Me informe.",
        step_advance: "Subiu de fase, {name}. Honra ao trono! 👑",
        default_morning: "Bom dia, {name}. Hoje você reina.",
        default_afternoon: "Boa tarde, {name}. Mantenha o foco.",
        default_evening: "Anoitece. Como foi o reinado hoje, {name}?",
        default_night: "Tarde da noite, {name}. Descanse logo.",
    },
    robot: {
        welcome: "Olá {name}. Sistemas iniciados 🤖",
        no_data: "{name}: dados insuficientes. Insira primeira transação.",
        first_transaction_today: "Primeira transação registrada. Calculando, {name}.",
        no_activity_today: "{name}: zero atividade hoje. Recomendo registrar.",
        streak_strong: "Sequência: {streak} dias. Eficiência alta, {name}.",
        streak_broken: "Sequência interrompida. Reiniciando contador, {name}.",
        streak_milestone: "Marco atingido: {streak} dias. Excelente, {name}.",
        level_up_close: "Próximo nível em processamento: {nextLevel}.",
        low_balance: "{name}: saldo abaixo do ideal. Alerta.",
        negative_balance: "{name}: saldo negativo detectado. Ação necessária.",
        good_efficiency: "Eficiência: {ie}%. Status: ótimo, {name}.",
        bad_efficiency: "Eficiência baixa, {name}. Otimize os gastos.",
        high_drains: "Detectado vazamento financeiro, {name}.",
        no_revenue: "{name}: receita não informada. Forneça os dados.",
        step_advance: "Fase atualizada. Parabéns, {name}.",
        default_morning: "Bom dia, {name}. Sistemas prontos.",
        default_afternoon: "Boa tarde, {name}. Aguardando comandos.",
        default_evening: "Boa noite, {name}. Encerrando o dia.",
        default_night: "Hora avançada, {name}. Recomendo descanso.",
    },
    dragon: {
        welcome: "Eu te aguardava, {name} 🐉",
        no_data: "Seu tesouro está vazio, {name}. Me mostre o que tem.",
        first_transaction_today: "Anotei seu primeiro registro do dia, {name}.",
        no_activity_today: "Silêncio hoje, {name}? Acorda esse dragão.",
        streak_strong: "{streak} dias guardados. Você é digno, {name} 🔥",
        streak_broken: "A chama vacilou, {name}. Reacenda hoje.",
        streak_milestone: "{streak} dias. O tesouro cresce, {name}.",
        level_up_close: "Nível {nextLevel} próximo. Não pare, {name}.",
        low_balance: "{name}, o ouro escasseia. Cuidado.",
        negative_balance: "Sombra no cofre, {name}. Vamos limpar.",
        good_efficiency: "{ie}% guardado. Tesouro cresce, {name} 💰",
        bad_efficiency: "{name}, vazou ouro hoje. Tape as fendas.",
        high_drains: "Ladrões no cofre, {name}. Cace os drenos.",
        no_revenue: "Quanto ouro entra, {name}? Me diga.",
        step_advance: "Você ascendeu, {name}! 🔥👑",
        default_morning: "Bom dia, guardião {name}. O cofre te espera.",
        default_afternoon: "Tarde, {name}. Vigilância constante.",
        default_evening: "Anoitece. Conte o ouro de hoje, {name}.",
        default_night: "Madrugada, {name}. Até o dragão descansa.",
    },
};

// ─── Trigger logic — picks the most relevant context ─────────────────────────
export function pickSpeechContext(user: Partial<UserState> | null | undefined): SpeechContext {
    if (!user) return "default_morning";

    const hour = new Date().getHours();
    const today = new Date().toISOString().slice(0, 10);
    const txs = (user.transactions || []) as Transaction[];
    const txsToday = txs.filter((t) => t.date?.slice(0, 10) === today);

    // Highest priority: hard situations
    if (txs.length === 0) return "no_data";
    if ((user.totalBalance ?? 0) < 0) return "negative_balance";
    if ((user.revenue ?? 0) === 0) return "no_revenue";
    if ((user.idMetric ?? 0) > 15) return "high_drains";

    // Streak situations
    if ((user.streak ?? 0) > 0 && (user.streak ?? 0) % 7 === 0) return "streak_milestone";
    if ((user.streak ?? 0) >= 7) return "streak_strong";
    if (user.lastLoginDate && user.lastLoginDate !== today && (user.streak ?? 0) === 0) {
        return "streak_broken";
    }

    // Activity situations
    if (txsToday.length > 0 && txsToday.length <= 1) return "first_transaction_today";
    if (txsToday.length === 0 && hour > 12) return "no_activity_today";

    // Performance feedback
    if ((user.ie ?? 0) >= 15) return "good_efficiency";
    if ((user.ie ?? 0) > 0 && (user.ie ?? 0) < 5) return "bad_efficiency";

    // Default by time of day
    if (hour < 6) return "default_night";
    if (hour < 12) return "default_morning";
    if (hour < 18) return "default_afternoon";
    return "default_evening";
}

// ─── Public API ───────────────────────────────────────────────────────────────
export function getCharacterSpeech(
    characterId: string,
    user: Partial<UserState> | null | undefined,
    forceContext?: SpeechContext
): { text: string; context: SpeechContext } {
    const voice = VOICES[characterId] || VOICES.panda;
    const context = forceContext || pickSpeechContext(user);
    const template = voice[context] || voice.default_morning;

    const name = user?.name || "amigo";
    const streak = String(user?.streak ?? 0);
    const ie = String(Math.round(user?.ie ?? 0));
    const nextLevel = String((user?.level ?? 1) + 1);

    const text = template
        .replace(/\{name\}/g, name)
        .replace(/\{streak\}/g, streak)
        .replace(/\{ie\}/g, ie)
        .replace(/\{nextLevel\}/g, nextLevel);

    return { text, context };
}
