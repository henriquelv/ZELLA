import { Zap, ShieldAlert, TrendingUp, BookOpen, Target, CreditCard, Search } from "lucide-react";

export interface Mission {
    id: string;
    title: string;
    description: string;
    xp: number;
    coins: number;
    time: "1 min" | "5 min" | "15 min";
    category: "quick" | "debt" | "future" | "education";
    difficulty: "Fácil" | "Médio" | "Difícil";
    icon: any;
    actionUrl?: string; // Where this mission takes you
}

export const missions: Mission[] = [
    {
        id: "m1",
        title: "Scanner de Sobrevivência",
        description: "Separe o que é luxo do que é vida. Classifique 5 gastos.",
        xp: 150,
        coins: 50,
        time: "1 min",
        category: "quick",
        difficulty: "Fácil",
        icon: Search,
        actionUrl: "/micro-game" // The Swipe Game
    },
    {
        id: "m2",
        title: "Caça-Fantasmas",
        description: "Encontre uma assinatura que você não usa e cancele.",
        xp: 300,
        coins: 100,
        time: "15 min",
        category: "debt",
        difficulty: "Médio",
        icon: ShieldAlert,
    },
    {
        id: "m3",
        title: "O Pote de Ouro",
        description: "Defina sua meta de Reserva de Emergência.",
        xp: 100,
        coins: 20,
        time: "5 min",
        category: "future",
        difficulty: "Fácil",
        icon: Target,
    },
    {
        id: "m4",
        title: "Raio-X da Fatura",
        description: "Analise sua última fatura e circule o maior vilão.",
        xp: 200,
        coins: 60,
        time: "5 min",
        category: "debt",
        difficulty: "Fácil",
        icon: CreditCard,
    },
    {
        id: "m5",
        title: "Minuto de Sabedoria",
        description: "Leia o artigo sobre Juros Compostos (são seus amigos).",
        xp: 150,
        coins: 10,
        time: "5 min",
        category: "education",
        difficulty: "Fácil",
        icon: BookOpen,
    },
    {
        id: "m6",
        title: "Investidor Inicial",
        description: "Abra sua conta em uma corretora taxa zero.",
        xp: 500,
        coins: 200,
        time: "15 min",
        category: "future",
        difficulty: "Difícil",
        icon: TrendingUp,
    }
];
