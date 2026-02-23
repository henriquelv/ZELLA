import { NextResponse } from "next/server";
import OpenAI from "openai";
import * as pdfParse from "pdf-parse";

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 });
        }

        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY || "dummy",
        });

        const buffer = Buffer.from(await file.arrayBuffer());
        let isImage = false;
        let base64Image = "";
        let textContent = "";

        if (file.type === "application/pdf") {
            const data = await (pdfParse as any)(buffer);
            textContent = data.text;
        } else if (file.type.startsWith("image/")) {
            isImage = true;
            base64Image = buffer.toString("base64");
        } else {
            textContent = buffer.toString("utf-8");
        }

        const systemPrompt = `Você é o Zella Scanner, um assistente inteligente de finanças do app Zella. 
Seu objetivo é analisar o documento (texto de PDF, arquivo de texto ou imagem de recibo/fatura) e extrair os lançamentos financeiros.
Identifique CADA gasto ou entrada detalhadamente e categorize conforme as categorias do app.
- Despesas: Alimentação, Moradia, Transporte, Saúde, Educação, Lazer, Roupas, Tecnologia, Assinaturas, Festas, Outros.
- Receitas: Salário, Freelance, Investimentos, Presente, Venda, Outro.

Ignore valores que não são transações válidas (como taxas de juros genéricas sem valor, códigos de barras, CNPJs ou troco se não for dinheiro recebido de volta liquidado).
Responda ESTRITAMENTE em JSON com a seguinte estrutura e NADA MAIS:
{
  "transactions": [
    {
      "amount": 150.50,
      "category": "Alimentação",
      "type": "expense",
      "name": "Mercado Assaí"
    }
  ]
}
Se não encontrar nada, retorne { "transactions": [] }.`;

        let messages: any[] = [
            { role: "system", content: systemPrompt }
        ];

        if (isImage) {
            messages.push({
                role: "user",
                content: [
                    { type: "text", text: "Analise esta nota ou comprovante detalhadamente." },
                    {
                        type: "image_url",
                        image_url: {
                            url: `data:${file.type};base64,${base64Image}`,
                            detail: "high"
                        }
                    }
                ]
            });
        } else {
            messages.push({
                role: "user",
                content: `Aqui está o texto do extrato/nota:\n\n${textContent.substring(0, 8000)}`
            });
        }

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini", // Model supports vision and text
            response_format: { type: "json_object" },
            messages: messages,
            max_tokens: 1500, // Important for parsing long receipts
        });

        let jsonString = response.choices[0].message.content || '{"transactions": []}';
        const parsed = JSON.parse(jsonString);

        return NextResponse.json({ transactions: parsed.transactions || [] });
    } catch (error: any) {
        console.error("OpenAI Extraction Error:", error.response?.data || error);
        return NextResponse.json({ error: error.message || "Failed to extract data" }, { status: 500 });
    }
}
