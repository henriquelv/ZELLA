import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey || "dummy-key");

const PROMPT = `
Você é um assistente financeiro de elite do app Zella.
Sua tarefa é ler um cupom fiscal, nota fiscal, ou print de aplicativo de banco (como extratos de conta corrente) e extrair TODAS as transações financeiras reais.

REGRAS ESTritas de Leitura de Extrato/Tabela:
1. Muitas vezes as imagens são tabelas contendo colunas como: Data, Descrição, Débito (Saídas), Crédito (Entradas) e Saldo.
2. NUNCA extraia "Saldo anterior" ou "Saldo atual" como uma transação. Queremos apenas as movimentações reais.
3. Se houver valor na coluna "Débito" (ou se for negativo com '-'), é uma DESPESA (type: "expense").
4. Se houver valor na coluna "Crédito" (ou se for positivo indicando ganho), é uma RECEITA (type: "income").
5. IGNORE a coluna "Saldo", ela é apenas o acumulado da conta e não deve ser somada ou subtraída.

Regras Estritas de Categorização (Trindade Zella):
A categoria DEVE ser estritamente UMA destas opções (exatamente como escrito):
Para Despesas (type: "expense"):
- "Alimentação": Mercado, padaria, feira, açougue, Ifood, Restaurante, Supermercado (Sobrevivência/Estilo).
- "Lazer": Bar, cinema, passeio, assinaturas lúdicas (Estilo de Vida).
- "Saúde": Farmácia, médico, dentista (Sobrevivência).
- "Moradia": Aluguel, condomínio, luz, água, internet, gás, conta de luz (Sobrevivência).
- "Transporte": Combustível, Uber, ônibus, pedágio, manutenção (Sobrevivência).
- "Educação": Faculdade, curso, livros, escola (Sobrevivência/Estilo).
- "Roupas": Vestuário, calçados, acessórios (Estilo de Vida).
- "Tecnologia": Eletrônicos, software, jogos (Estilo de Vida).
- "Outros": Pagamento de boleto genérico, PIX enviado, compras não identificadas, compras online.

Para Receitas (type: "income"):
- "Salário", "Freelance", "Transferência recebida", "Investimentos", "Venda", "Presente", "Outros".

Regra Base Final:
- Ignore descontos pequenos ou troco.
- Retorne um JSON válido contendo um array "transactions".
Exemplo de retorno JSON:
{
  "transactions": [
    {
      "description": "Supermercado",
      "amount": 420.50,
      "category": "Alimentação",
      "type": "expense",
      "date": "2026-02-10"
    }
  ]
}
`;

export async function POST(req: NextRequest) {
    try {
        if (!apiKey) {
            // Se não tiver chave real configurada, simular um recebimento mágico para manter a UI funcional para testes
            await new Promise((resolve) => setTimeout(resolve, 2500));
            return NextResponse.json({
                transactions: [
                    {
                        description: "Mercado Zella Fake",
                        amount: 145.90,
                        category: "Alimentação",
                        type: "expense",
                        date: new Date().toISOString()
                    },
                    {
                        description: "Crédito Dinâmico",
                        amount: 50.00,
                        category: "Outros",
                        type: "income",
                        date: new Date().toISOString()
                    }
                ]
            });
        }

        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json(
                { error: "Nenhum arquivo enviado." },
                { status: 400 }
            );
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64Data = buffer.toString("base64");

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const responseData = await model.generateContent({
            contents: [
                { role: "user", parts: [{ text: PROMPT }] },
                {
                    role: "user",
                    parts: [
                        {
                            inlineData: {
                                data: base64Data,
                                mimeType: file.type || "image/jpeg",
                            },
                        },
                    ],
                },
            ],
            generationConfig: {
                responseMimeType: "application/json",
            },
        });

        const response = await responseData.response;
        const text = response.text();
        if (!text) {
            throw new Error("Resposta vazia da IA");
        }

        const data = JSON.parse(text);

        return NextResponse.json(data);

    } catch (error: any) {
        console.error("Erro no Scanner IA:", error);
        return NextResponse.json(
            { error: "Falha na leitura do documento.", details: error.message },
            { status: 500 }
        );
    }
}
