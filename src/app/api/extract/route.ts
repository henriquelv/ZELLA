import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY;
const openai = new OpenAI({ apiKey: apiKey || "dummy-key" });

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
            return NextResponse.json(
                { error: "Scanner IA indisponível — configure OPENAI_API_KEY no ambiente." },
                { status: 500 }
            );
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
        const mimeType = (file.type || "image/jpeg") as "image/jpeg" | "image/png" | "image/gif" | "image/webp";

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: PROMPT },
                        {
                            type: "image_url",
                            image_url: {
                                url: `data:${mimeType};base64,${base64Data}`,
                                detail: "high"
                            }
                        }
                    ]
                }
            ],
            response_format: { type: "json_object" },
            max_tokens: 4096,
        });

        const text = response.choices[0].message.content;
        if (!text) throw new Error("Resposta vazia da IA");

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
