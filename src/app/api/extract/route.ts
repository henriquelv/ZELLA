import { NextResponse } from 'next/dist/server/web/spec-extension/response';
import OpenAI from "openai";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { text } = body;

        if (!text) {
            return NextResponse.json({ error: "No text provided" }, { status: 400 });
        }

        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY || "dummy",
        });

        const prompt = `
        Você é um assistente financeiro de um aplicativo chamado Zella.
        O usuário vai te enviar um texto sujo contendo compras, faturas, extratos ou textos soltos sobre gastos e ganhos.
        Sua missão é extrair essas transações e devolver ÚNICA e EXCLUSIVAMENTE um array JSON contendo os objetos de transação. Nada de markdown, nada de crases, apenas o JSON puro.

        As categorias válidas para Mapeamento são (escolha a que melhor se encaixa):
        - food (Alimentação, ifood, mercado, restaurante, padaria)
        - transport (Transporte, uber, gasolina, ônibus, metrô)
        - home (Casa, aluguel, luz, água, internet, reparos)
        - shopping (Compras, roupas, eletrônicos, presentes)
        - bills (Contas, boletos diversos, assinaturas, Netflix)
        - health (Saúde, farmácia, médico, academia)
        - salary (Salário, pix recebido, pagamento, ganho)
        - other (Outros / não identificado)

        O tipo (type) deve ser:
        - "expense" (se for um gasto/compra)
        - "income" (se for um ganho/salário/recebimento)

        Formato esperado (Exemplo):
        [
            { "amount": 150.50, "category": "food", "type": "expense", "name": "Mercado Assaí" },
            { "amount": 2500.00, "category": "salary", "type": "income", "name": "Salário" }
        ]

        O texto do usuário é o seguinte:
        """
        ${text}
        """
        `;

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.2,
        });

        let jsonString = response.choices[0].message.content || "[]";

        // Limpar possíveis crases de markdown se a IA colocar
        jsonString = jsonString.replace(/```json/g, "").replace(/```/g, "").trim();

        const transactions = JSON.parse(jsonString);

        return NextResponse.json({ transactions });
    } catch (error) {
        console.error("OpenAI Extraction Error:", error);
        return NextResponse.json({ error: "Failed to extract data" }, { status: 500 });
    }
}
