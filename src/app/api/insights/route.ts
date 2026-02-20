import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
    try {
        const { transactions } = await req.json();

        if (!process.env.OPENAI_API_KEY) {
            return NextResponse.json(
                { error: "OpenAI API Key não configurada" },
                { status: 500 }
            );
        }

        if (!transactions || transactions.length === 0) {
            return NextResponse.json({ insight: "Adicione transações para receber análises." });
        }

        const prompt = `
Você é um consultor financeiro amigável e direto de um app chamado Zella.
Abaixo estão os gastos/receitas recentes do usuário em formato json minimalista:
${JSON.stringify(transactions)} (c = categoria, a = valor, t = tipo 'expense' ou 'income')

Com base nisso, dê uma UNICA dica direta, encorajadora e extremamente curta (máximo de 2 frases curtas).
Não use saudações como "Olá". Fale diretamente sobre o padrão financeiro notado ou dê um encorajamento.
Se o usuário estiver gastando muito em algo específico, alerte-o de forma gentil e positiva.
`;

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
            max_tokens: 80,
        });

        const insight = response.choices[0].message.content?.trim() || "Continue mantendo o controle para atingir sua liberdade financeira.";

        return NextResponse.json({ insight });

    } catch (error: any) {
        console.error("OpenAI Insights API Error:", error);
        return NextResponse.json(
            { error: "Erro interno no servidor ao gerar insight." },
            { status: 500 }
        );
    }
}
