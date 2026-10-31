import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const authorization = request.headers.get("authorization");
    const token = authorization?.startsWith("Bearer ") ? authorization.slice(7) : "";
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!token || !supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "Entre na sua conta para usar o simulador." }, { status: 401 });
    }
    const authClient = createClient(supabaseUrl, supabaseKey, { auth: { autoRefreshToken: false, persistSession: false } });
    const { data: authData, error: authError } = await authClient.auth.getUser(token);
    if (authError || !authData.user) {
      return NextResponse.json({ error: "Sua sessão expirou. Entre novamente." }, { status: 401 });
    }

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
            content: "Você é o consultor de decisões do VIDA PARALELA. A pessoa informa somente a decisão; você deve criar automaticamente três caminhos possíveis, sem pedir que ela preencha as realidades. A é manter o caminho atual ou uma alternativa conservadora; B é uma mudança principal; C é uma terceira estratégia plausível, intermediária ou ousada. Cada realidade deve funcionar como um conselho prático e equilibrado, não como uma previsão. Analise o que pode acontecer, explique por que, apresente vantagens e desvantagens concretas, riscos e oportunidades, consequências no curto e longo prazo e passos prudentes antes de agir. Inclua estimativas de probabilidade em faixas (por exemplo 30–45%), separando chance de resultado favorável, desfavorável e intermediário. Essas faixas são julgamentos aproximados condicionados às premissas, NÃO estatísticas comprovadas nem promessa; não use falsa precisão, explique os fatores que poderiam aumentar ou reduzir as chances e reduza a confiança quando faltarem dados. Se a decisão envolver saúde, lei ou finanças, recomende confirmação com profissional qualificado quando apropriado. Não invente dados pessoais ou fontes. Responda somente JSON válido com: title, summary, scenarios. scenarios deve conter A, B e C; cada um com name, description, pros (array), cons (array), opportunities (array), risks (array), first_steps (array), short_term, long_term, probability_favorable, probability_unfavorable, probability_mixed, probability_basis, confidence."
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
