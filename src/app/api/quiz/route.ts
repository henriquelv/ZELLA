import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function GET(request: Request) {
    try {
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY || "dummy_key",
        });

        const { searchParams } = new URL(request.url);
        const level = searchParams.get('level') || '1';

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini", // fast and cheap for this usecase
            response_format: { type: "json_object" },
            messages: [
                {
                    role: "system",
                    content: `Você é um educador financeiro carismático de um app gamificado. 
Gere UMA pergunta de múltipla escolha focada em economia doméstica prática, mudança de hábitos e organização financeira do dia a dia (foco em lidar com contas, mercado, gastos invisíveis, e criar fôlego).
Nível do usuário atual: Degrau ${level}. (Se 1: foco em sair das dívidas e cortes básicos. Se > 1: foco em construção de reservas).

Regras obrigatórias:
- A pergunta deve ser engajadora e fazer o usuário refletir sobre seus hábitos.
- Retorne um JSON ESTRITAMENTE neste formato:
{
  "question": "O texto da pergunta",
  "options": ["Opção 1", "Opção 2", "Opção 3", "Opção 4"],
  "correctIndex": <int 0 a 3 indicando qual opção é a correta>,
  "explanation": "Explicação amigável de 1 a 2 frases do porquê a resposta está correta"
}`
                }
            ]
        });

        const data = JSON.parse(completion.choices[0].message.content || '{}');
        return NextResponse.json(data);
    } catch (error) {
        console.error("OpenAI Quiz Error:", error);
        return NextResponse.json(
            { error: "Erro ao gerar quiz" },
            { status: 500 }
        );
    }
}
