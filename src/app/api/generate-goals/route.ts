import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { transactions, revenue, fixedCosts } = body;

        if (!transactions || !Array.isArray(transactions)) {
            return NextResponse.json({ error: "Transações inválidas fornecidas." }, { status: 400 });
        }

        const prompt = `
Você é o Zella, um consultor financeiro implacável.
Analise os seguintes dados do usuário nos últimos 30 dias:
- Renda Mensal (Revenue): R$ ${revenue}
- Custos Fixos Estimados: R$ ${fixedCosts}
- Transações (Lista JSON):
${JSON.stringify(transactions.slice(0, 50))} // limitando para não estourar o contexto

Contexto:
- "Drenos" são gastos como Festas, Assinaturas, ifood excessivo.

Objetivo:
Identifique o MAIOR problema financeiro dele (ex: gastou muito em Lazer, assinou muita coisa, não sobrou nada da Renda).
Crie UMA única Missão (Meta Dinâmica) super focada para ele resolver isso nesta semana. Seja direto, agressivo mas motivador.
O retorno DEVE ser um JSON estrito seguindo essa interface:
{
  "title": "Título Curto (ex: Cortar Drenos)",
  "description": "Explicação do que ele fez de errado e o que deve fazer agora (ex: Você estourou 40% da renda em Lazer. Fique 5 dias sem pedir iFood).",
  "category": "spending" | "saving" | "habit",
  "xpReward": numero inteiro (ex: 200, quanto mais difícil, maior)
}
Retorne APENAS o JSON, sem markdown.
`;

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini", // usando um modelo mais rápido e barato
            messages: [
                { role: "system", content: "Você responde apenas em JSON." },
                { role: "user", content: prompt }
            ],
            response_format: { type: "json_object" }
        });

        const rawJson = response.choices[0].message.content;
        if (!rawJson) throw new Error("Falha ao gerar missão da IA.");

        const goalData = JSON.parse(rawJson);
        return NextResponse.json(goalData);

    } catch (error: any) {
        console.error("Erro na geração de metas:", error);
        return NextResponse.json(
            { error: error.message || "Erro interno do servidor" },
            { status: 500 }
        );
    }
}
