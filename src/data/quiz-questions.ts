export interface QuizQuestion {
    question: string;
    options: string[];
    correctIndex: number;
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
    {
        question: "Qual é o ideal pra reserva de emergência?",
        options: ["1 mês de gastos", "3 a 6 meses de gastos", "Valor da maior conta", "Não precisa ter"],
        correctIndex: 1,
    },
    {
        question: "O que é um 'dreno financeiro'?",
        options: ["Conta inativa", "Gasto que não gera valor real", "Investimento arriscado", "Renda extra"],
        correctIndex: 1,
    },
    {
        question: "Qual destes é um gasto de sobrevivência?",
        options: ["Streaming", "Aluguel", "Viagem", "Videogame novo"],
        correctIndex: 1,
    },
    {
        question: "Juros do rotativo do cartão costumam ser...",
        options: ["Baixíssimos", "Os mais altos do mercado", "Iguais ao CDI", "Proibidos no Brasil"],
        correctIndex: 1,
    },
    {
        question: "CDB rende mais quando...",
        options: ["O Ibovespa cai", "A Selic sobe", "O dólar sobe", "Acontece eclipse"],
        correctIndex: 1,
    },
    {
        question: "Qual o primeiro passo do planejamento?",
        options: ["Investir tudo", "Conhecer seus gastos reais", "Cortar tudo", "Pegar empréstimo"],
        correctIndex: 1,
    },
    {
        question: "50/30/20 significa gastar...",
        options: ["50% essenciais, 30% lazer, 20% poupar", "50% lazer", "Apenas 20% do salário", "Investir 50%"],
        correctIndex: 0,
    },
    {
        question: "FGC protege depósitos em bancos até...",
        options: ["R$ 10 mil", "R$ 250 mil por CPF/instituição", "R$ 1 milhão", "Sem limite"],
        correctIndex: 1,
    },
    {
        question: "Diversificar investimentos é...",
        options: ["Concentrar num só", "Espalhar em ativos diferentes", "Só comprar dólar", "Evitar investir"],
        correctIndex: 1,
    },
    {
        question: "Tesouro Selic é indicado pra...",
        options: ["Reserva de emergência", "Longo prazo agressivo", "Curto especulativo", "Aposentadoria só"],
        correctIndex: 0,
    },
    {
        question: "Inflação faz o dinheiro parado...",
        options: ["Render automaticamente", "Perder poder de compra", "Dobrar em 5 anos", "Ficar igual"],
        correctIndex: 1,
    },
    {
        question: "Score de crédito alto dá...",
        options: ["Mais cashback automático", "Melhores condições de crédito", "Imposto menor", "Salário maior"],
        correctIndex: 1,
    },
    {
        question: "Parcelar sem juros é sempre bom?",
        options: ["Sim, sempre", "Não — compromete orçamento futuro", "Só no cartão", "Só em compras grandes"],
        correctIndex: 1,
    },
    {
        question: "Renda passiva é renda que...",
        options: ["Vem sem trabalho ativo", "Só vem do salário", "Vem de empréstimo", "É ilegal"],
        correctIndex: 0,
    },
    {
        question: "Qual NÃO é um investimento em renda fixa?",
        options: ["CDB", "LCI", "Ações", "Tesouro Direto"],
        correctIndex: 2,
    },
    {
        question: "Imposto de Renda incide sobre...",
        options: ["Todos os investimentos", "Alguns sim, outros isentos (LCI, LCA)", "Só ações", "Só poupança"],
        correctIndex: 1,
    },
    {
        question: "Revisar gastos com que frequência?",
        options: ["Anual", "Mensal é o mínimo", "Nunca", "Só quando zerar"],
        correctIndex: 1,
    },
    {
        question: "O que é PGBL?",
        options: ["Tipo de poupança comum", "Previdência com benefício fiscal", "Ação da bolsa", "Empréstimo consignado"],
        correctIndex: 1,
    },
    {
        question: "Meta financeira deve ser...",
        options: ["Vaga e grande", "Específica, mensurável e com prazo", "Sempre agressiva", "Secreta"],
        correctIndex: 1,
    },
    {
        question: "Endividamento saudável não passa de...",
        options: ["80% da renda", "~30% da renda mensal", "100%", "Não existe limite"],
        correctIndex: 1,
    },
];

export function pickRandomQuestions(count: number): QuizQuestion[] {
    const pool = [...QUIZ_QUESTIONS];
    const out: QuizQuestion[] = [];
    for (let i = 0; i < count && pool.length > 0; i++) {
        const idx = Math.floor(Math.random() * pool.length);
        out.push(pool.splice(idx, 1)[0]);
    }
    return out;
}
