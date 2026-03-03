import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey || "dummy-key");

const PROMPT = `
Você é um assistente financeiro de elite do app Zella.
Sua tarefa é ler um cupom fiscal, nota fiscal, ou print de aplicativo de banco e extrair as transações.

Regras Estritas de Categorização (Trindade Zella):
A categoria DEVE ser estritamente UMA destas opções (exatamente como escrito):
Para Despesas (type: "expense"):
- "Alimentação": Mercado, padaria, feira, açougue (Sobrevivência).
- "Lazer": Restaurante, bar, cinema, passeio, iFood/delivery (Estilo de Vida).
- "Saúde": Farmácia, médico, dentista (Sobrevivência).
- "Moradia": Aluguel, condomínio, luz, água, internet, gás (Sobrevivência).
- "Transporte": Combustível, Uber, ônibus, pedágio, manutenção (Sobrevivência).
- "Educação": Faculdade, curso, livros, escola (Sobrevivência/Estilo).
- "Roupas": Vestuário, calçados, acessórios (Estilo de Vida).
- "Tecnologia": Eletrônicos, software, jogos (Estilo de Vida).
- "Assinaturas": Netflix, Spotify, Amazon Prime, academia (Estilo de Vida/Drenos).
- "Festas": Balada, eventos noturnos, drinks caros (Drenos).
- "Outros": Apenas se for impossível classificar nas acima.

Para Receitas (type: "income"):
- "Salário", "Freelance", "Investimentos", "Venda", "Presente", "Outros".

Regra Base:
- Ignore descontos pequenos ou troco.
- Foque apenas nos totais pagos ou no item principal.
- Se for uma compra de mercado com vários itens, agrupe no total e classifique como "Alimentação".
- Retorne um JSON válido contendo um array "transactions".
Exemplo de retorno JSON (sem markdown, sem blocos de código):
{
  "transactions": [
    {
      "description": "Mercado Assaí",
      "amount": 150.50,
      "category": "Alimentação",
      "type": "expense",
      "date": "2024-03-02"
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
