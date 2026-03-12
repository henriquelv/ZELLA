import { Wind, Box, ShieldCheck, Lock, Brain, Trophy } from "lucide-react";

export const steps = [
    {
        id: 1,
        title: "Sobrevivência",
        description: "Pare de cavar o buraco e controle os danos.",
        icon: Wind,
        color: "bg-red-500",
        checkpoints: [
            "Fase 1: Mapear todas as dívidas e custos",
            "Fase 2: Cortar 1 dreno ou gasto fútil",
            "Fase 3: Negociar uma dívida ou fechar o mês no azul"
        ]
    },
    {
        id: 2,
        title: "Organização",
        description: "Saiba exatamente para onde vai seu dinheiro.",
        icon: Box,
        color: "bg-orange-500",
        checkpoints: [
            "Fase 1: Separar gastos fixos e variáveis",
            "Fase 2: Definir teto de gastos semanais",
            "Fase 3: Sobra positiva no fim do mês"
        ]
    },
    {
        id: 3,
        title: "Estabilidade",
        description: "O fim do sufoco mensal.",
        icon: ShieldCheck,
        color: "bg-yellow-500",
        checkpoints: [
            "Fase 1: Juntar R$ 500 de emergência",
            "Fase 2: Criar conta separada para reserva",
            "Fase 3: Atingir 15 dias de custo fixo guardado"
        ]
    },
    {
        id: 4,
        title: "Segurança",
        description: "Proteção contra imprevistos.",
        icon: Lock,
        color: "bg-green-500",
        checkpoints: [
            "Fase 1: Completar 3 meses de reserva",
            "Fase 2: Evitar compras por impulso por 30 dias",
            "Fase 3: Iniciar transição para investimentos"
        ]
    },
    {
        id: 5,
        title: "Liberdade",
        description: "O dinheiro trabalha para você.",
        icon: Trophy,
        color: "bg-blue-500",
        checkpoints: [
            "Fase 1: Abrir conta em corretora e aportar",
            "Fase 2: Renda passiva cobrindo 1 conta",
            "Fase 3: Atingir meta de patrimônio e 6 meses de reserva"
        ]
    }
];
