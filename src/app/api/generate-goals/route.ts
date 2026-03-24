import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const apiKey = process.env.OPENAI_API_KEY;
const openai = new OpenAI({ apiKey: apiKey || 'dummy-key' });

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { transactions, revenue, fixedCosts } = body;

        if (!transactions || !Array.isArray(transactions)) {
            return NextResponse.json({ error: "Transações inválidas." }, { status: 400 });
        }

        // --- Análise local para gerar missão rastreável (funciona sem IA também) ---
        const expenses = transactions.filter((t: any) => t.type === 'expense');
        const spendByCategory: Record<string, number> = {};
        for (const t of expenses) {
            spendByCategory[t.category] = (spendByCategory[t.category] || 0) + t.amount;
        }
        const sorted = Object.entries(spendByCategory).sort((a, b) => b[1] - a[1]);
        const worstCategory = sorted[0]?.[0] || 'Lazer';
        const worstAmount = sorted[0]?.[1] || 0;

        // Sem chave: gera missão localmente
        if (!apiKey) {
            return NextResponse.json(buildLocalGoal(worstCategory, worstAmount, revenue));
        }

        const recentTxs = transactions.slice(0, 30);
        const prompt = `
Você é o Zella, um assistente financeiro próximo e humano — como um amigo que entende muito de dinheiro.
Analise os dados do usuário nos últimos 30 dias:
- Renda Mensal: R$ ${revenue}
- Custos Fixos: R$ ${fixedCosts}
- Transações: ${JSON.stringify(recentTxs)}

Análise já detectou que a categoria com MAIOR gasto é: "${worstCategory}" (R$ ${worstAmount.toFixed(2)}).

Crie UMA única missão semanal para o usuário resolver esse problema.
Use linguagem afetiva, próxima e encorajadora — como se estivesse conversando com um amigo.
Seja direto mas gentil.

Retorne APENAS um JSON válido com este formato exato (sem markdown):
{
  "title": "título curto e motivador",
  "description": "explicação afetiva do problema e o que fazer agora (2-3 frases)",
  "category": "spending" | "saving" | "habit",
  "xpReward": número inteiro entre 100 e 300,
  "targetCategory": "${worstCategory}",
  "targetAmount": número (limite de gasto sugerido em R$),
  "conditionType": "spending_limit" | "no_spending" | "register_income"
}
`;

        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: 'Você responde apenas em JSON válido.' },
                { role: 'user', content: prompt }
            ],
            response_format: { type: 'json_object' },
        });

        const text = response.choices[0].message.content;
        if (!text) throw new Error("Resposta vazia da IA.");

        const goalData = JSON.parse(text);
        return NextResponse.json(goalData);

    } catch (error: any) {
        console.error("Erro ao gerar meta:", error);
        // Fallback robusto
        return NextResponse.json({
            title: "Controle seus gastos essa semana",
            description: "Você tem alguns gastos que merecem atenção. Que tal ficar de olho nas saídas nos próximos 7 dias e registrar tudo aqui?",
            category: "habit",
            xpReward: 150,
            targetCategory: "Outros",
            targetAmount: null,
            conditionType: "register_income",
        });
    }
}

function buildLocalGoal(worstCategory: string, worstAmount: number, revenue: number) {
    const pct = revenue > 0 ? Math.round((worstAmount / revenue) * 100) : 0;
    const suggestedLimit = Math.round(worstAmount * 0.7);

    const messages: Record<string, { title: string; description: string; conditionType: string }> = {
        'Lazer': {
            title: `Domar o Lazer essa semana 🎯`,
            description: `Você gastou R$ ${worstAmount.toFixed(0)} com Lazer (${pct}% da sua renda). Sem drama — mas que tal segurar um pouquinho essa semana? Tente ficar abaixo de R$ ${suggestedLimit}.`,
            conditionType: 'spending_limit',
        },
        'Alimentação': {
            title: `Cozinhar mais, gastar menos 🥗`,
            description: `Alimentação consumiu R$ ${worstAmount.toFixed(0)} (${pct}% da renda). Tenta preparar pelo menos 3 refeições em casa essa semana. Você vai ver a diferença!`,
            conditionType: 'spending_limit',
        },
        'Transporte': {
            title: `Movimentação inteligente 🚌`,
            description: `Você gastou R$ ${worstAmount.toFixed(0)} com Transporte. Que tal planejar melhor os deslocamentos e tentar reduzir para R$ ${suggestedLimit} essa semana?`,
            conditionType: 'spending_limit',
        },
    };

    const msg = messages[worstCategory] || {
        title: `Reduzir gastos em ${worstCategory} 💪`,
        description: `Seus gastos em "${worstCategory}" chegaram a R$ ${worstAmount.toFixed(0)} (${pct}% da renda). Tente ficar abaixo de R$ ${suggestedLimit} nos próximos 7 dias!`,
        conditionType: 'spending_limit',
    };

    return {
        ...msg,
        category: 'spending',
        xpReward: Math.min(300, Math.max(100, pct * 3)),
        targetCategory: worstCategory,
        targetAmount: suggestedLimit,
    };
}
