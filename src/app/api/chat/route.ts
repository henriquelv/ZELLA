import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { messages, userContext } = body;

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json({ error: "Mensagens não informadas ou inválidas" }, { status: 400 });
        }

        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY || "dummy",
        });

        // Calculate balances dynamically from context for better AI grounding
        const expenses = userContext?.transactions?.filter((t: any) => t.type === 'expense') || [];
        const incomes = userContext?.transactions?.filter((t: any) => t.type === 'income') || [];
        const totalExp = expenses.reduce((a: number, b: any) => a + Number(b.amount), 0);
        const totalInc = incomes.reduce((a: number, b: any) => a + Number(b.amount), 0);

        // Analyse spending categories for proactive insights
        const categoryTotals: Record<string, number> = {};
        expenses.forEach((t: any) => {
            categoryTotals[t.category] = (categoryTotals[t.category] || 0) + Number(t.amount);
        });
        const topCategory = Object.entries(categoryTotals).sort(([, a], [, b]) => b - a)[0];
        const topCategoryInsight = topCategory
            ? `Maior gasto identificado: "${topCategory[0]}" — R$ ${topCategory[1].toFixed(2)} (${((topCategory[1] / totalExp) * 100).toFixed(0)}% do total)`
            : "Nenhuma transação registrada ainda.";

        const systemPrompt = `Você é a Zella — a coach financeira mais direta e eficiente do Brasil. Você resolve problemas de verdade, sem firulas.

IDENTIDADE:
- Você é coach, não assistente. Age de forma assertiva e orientada a resultado.
- Linguagem: direta, coloquial, motivadora. Sem jargões bancários.
- Use emojis como acento emocional, nunca como decoração excessiva.
- Formate com **negrito** para destaque e listas curtas. Máximo 4 linhas por resposta.

MISSÃO CENTRAL:
Você NÃO é um categorizador de gastos. Você ajuda o usuário a MUDAR DE VIDA financeiramente.
Cada resposta deve conter: 1 diagnóstico claro + 1 ação concreta + 1 impacto real em R$.

DADOS DO USUÁRIO (use sempre que relevante):
- XP: ${userContext?.xp || 0} | Moedas: ${userContext?.coins || 0}
- Receita Total: R$ ${totalInc.toFixed(2)}
- Despesa Total: R$ ${totalExp.toFixed(2)}
- Saldo: R$ ${(totalInc - totalExp).toFixed(2)}
- ${topCategoryInsight}

REGRAS:
- Se o saldo for negativo, trate com urgência e empatia — isso é uma emergência financeira.
- Sempre termine com uma pergunta ou ação concreta para o próximo passo.
- Se o usuário não tiver transações, oriente-o a registrar o primeiro gasto agora.
- Nunca fale "Posso ajudar?" — você já está ajudando. Seja proativo.
- Responda sempre em português do Brasil.`;


        const apiMessages = [
            { role: "system", content: systemPrompt },
            ...messages.map((m: any) => ({
                role: m.role,
                content: m.content
            }))
        ];

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: apiMessages,
            temperature: 0.7,
            max_tokens: 500,
        });

        const reply = response.choices[0].message.content || "Desculpe, não consegui pensar em uma resposta agora.";

        return NextResponse.json({ reply });

    } catch (error: any) {
        console.error("Chat API Error:", error);
        return NextResponse.json({ error: "Falha na comunicação com a Zella AI" }, { status: 500 });
    }
}
