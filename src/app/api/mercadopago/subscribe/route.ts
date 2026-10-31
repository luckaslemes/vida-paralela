import { NextResponse } from "next/server";
import { getAuthenticatedUser, mercadoPagoRequest } from "@/lib/mercadopago";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return NextResponse.json({ error: "Faça login para assinar o Premium." }, { status: 401 });
    if (!user.email) return NextResponse.json({ error: "Sua conta precisa ter um e-mail cadastrado." }, { status: 400 });

    const origin = new URL(request.url).origin;
    const response = await mercadoPagoRequest("/preapproval", {
      method: "POST",
      body: JSON.stringify({
        reason: "VIDA PARALELA Premium",
        external_reference: user.id,
        payer_email: user.email,
        back_url: origin + "/assinatura/retorno",
        auto_recurring: {
          frequency: 1,
          frequency_type: "months",
          transaction_amount: 29.9,
          currency_id: "BRL",
          free_trial: { frequency: 3, frequency_type: "days" },
        },
        status: "pending",
      }),
    });
    const data = await response.json();
    if (!response.ok || !data.init_point || !data.id) {
      console.error("Mercado Pago subscription creation failed", response.status, data);
      return NextResponse.json({ error: "Não foi possível iniciar a assinatura no Mercado Pago." }, { status: 502 });
    }
    return NextResponse.json({ checkoutUrl: data.init_point });
  } catch (error) {
    console.error("Mercado Pago subscription route error", error);
    return NextResponse.json({ error: "Erro interno ao iniciar assinatura." }, { status: 500 });
  }
}
