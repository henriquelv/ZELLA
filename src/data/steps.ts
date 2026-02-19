import { Wind, Box, ShieldCheck, Lock, Brain, Trophy } from "lucide-react";

export const steps = [
    {
        id: 1,
        title: "Respiração",
        description: "Pare de cavar o buraco.",
        icon: Wind,
        color: "bg-red-500",
        checkpoints: [
            "Mapear todas as dívidas",
            "Cortar 1 gasto desnecessário",
            "Negociar uma dívida atrasada"
        ]
    },
    {
        id: 2,
        title: "Organização",
        description: "Saiba para onde vai seu dinheiro.",
        icon: Box,
        color: "bg-orange-500",
        checkpoints: [
            "Separar gastos fixos e variáveis",
            "Definir teto de gastos semanais",
            "Automatizar pagamento de contas"
        ]
    },
    {
        id: 3,
        title: "Estabilidade",
        description: "O fim do sufoco mensal.",
        icon: ShieldCheck,
        color: "bg-yellow-500",
        checkpoints: [
            "Juntar R$ 500 de emergência",
            "Fechar o mês no azul",
            "Criar conta separada para reserva"
        ]
    },
    {
        id: 4,
        title: "Segurança",
        description: "Proteção contra imprevistos.",
        icon: Lock,
        color: "bg-green-500",
        checkpoints: [
            "Completar 3 meses de reserva",
            "Fazer seguro de vida/celular",
            "Evitar compras por impulso por 30 dias"
        ]
    },
    {
        id: 5,
        title: "Consciência",
        description: "O dinheiro trabalha para você.",
        icon: Brain,
        color: "bg-blue-500",
        checkpoints: [
            "Ler um livro sobre investimentos",
            "Abrir conta em corretora",
            "Fazer o primeiro investimento"
        ]
    },
    {
        id: 6,
        title: "Autonomia",
        description: "Liberdade de escolha.",
        icon: Trophy,
        color: "bg-purple-500",
        checkpoints: [
            "Renda passiva cobrindo 1 conta",
            "Planejar viagem dos sonhos",
            "Atingir meta de patrimônio"
        ]
    }
];
