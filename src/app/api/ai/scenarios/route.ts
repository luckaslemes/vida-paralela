import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const apiKey = process.env.AI_PROVIDER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "A inteligência artificial ainda não foi configurada. Adicione a chave do provedor no servidor." },
        { status: 503 }
      );
    }

    const body = await request.json();
    const decision = typeof body.decision === "string" ? body.decision.trim() : "";
    const context = typeof body.context === "string" ? body.context.trim() : "";

    if (decision.length < 10 || decision.length > 2000) {
      return NextResponse.json({ error: "Descreva sua decisão com pelo menos 10 e no máximo 2.000 caracteres." }, { status: 400 });
    }
    if (context.length > 2000) {
      return NextResponse.json({ error: "O contexto deve ter no máximo 2.000 caracteres." }, { status: 400 });
    }

    const baseUrl = (process.env.AI_PROVIDER_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, "");
    const model = process.env.AI_MODEL || "gpt-4o-mini";
    const response = await fetch(baseUrl + "/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0.7,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: "Você é o motor de simulação do VIDA PARALELA. Crie três cenários hipotéticos, úteis, realistas e claramente diferentes para a decisão do usuário. A realidade A deve representar manter o caminho atual ou a opção mais conservadora; B deve representar uma mudança ou alternativa principal; C deve representar uma terceira estratégia, intermediária ou ousada. Não peça que o usuário preencha os cenários. Não afirme prever o futuro. Explicite incertezas, premissas e fatores que podem mudar os resultados. Não invente dados pessoais. Responda somente JSON válido com as chaves: title, summary, scenarios. scenarios deve conter objetos A, B e C; cada um com name, description, opportunities (array de strings), risks (array de strings), first_steps (array de strings), short_term, long_term e confidence (texto como baixa, média ou alta)."
          },
          {
            role: "user",
            content: `Decisão: ${decision}\nContexto adicional: ${context || "Não informado"}\nGere as realidades A, B e C para comparação.`
          }
        ]
      }),
      cache: "no-store",
    });

    const data = await response.json();
    if (!response.ok) {
      console.error("AI provider error", response.status, data?.error?.message || "unknown");
      return NextResponse.json({ error: "Não foi possível gerar as realidades agora. Tente novamente em instantes." }, { status: 502 });
    }

    const content = data?.choices?.[0]?.message?.content;
    if (typeof content !== "string") {
      return NextResponse.json({ error: "A IA retornou uma resposta em formato inesperado." }, { status: 502 });
    }

    const result = JSON.parse(content);
    if (!result?.scenarios?.A || !result?.scenarios?.B || !result?.scenarios?.C) {
      return NextResponse.json({ error: "A IA não retornou os três cenários completos. Tente novamente." }, { status: 502 });
    }
    return NextResponse.json(result);
  } catch (error) {
    console.error("Scenario generation error", error);
    return NextResponse.json({ error: "Ocorreu um erro ao gerar as realidades." }, { status: 500 });
  }
}
