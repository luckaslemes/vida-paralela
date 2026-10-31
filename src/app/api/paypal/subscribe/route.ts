import { NextResponse } from "next/server";
import { getAuthenticatedUser, getPayPalAccessToken } from "@/lib/paypal";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return NextResponse.json({ error: "Faça login para assinar o Premium." }, { status: 401 });
    const planId = process.env.PAYPAL_PLAN_ID;
    if (!planId) return NextResponse.json({ error: "O plano PayPal ainda não foi configurado no servidor." }, { status: 503 });
    const { accessToken, base } = await getPayPalAccessToken();
    const origin = new URL(request.url).origin;
    const response = await fetch(base + "/v1/billing/subscriptions", {
      method: "POST",
      headers: { Authorization: "Bearer " + accessToken, "Content-Type": "application/json", "PayPal-Request-Id": "vida-paralela-" + user.id + "-" + Date.now() },
      body: JSON.stringify({
        plan_id: planId,
        custom_id: user.id,
        application_context: { brand_name: "VIDA PARALELA", user_action: "SUBSCRIBE_NOW", return_url: origin + "/assinatura/retorno", cancel_url: origin + "/assinatura?cancelada=1" },
      }),
      cache: "no-store",
    });
    const data = await response.json();
    if (!response.ok) {
      console.error("PayPal subscription creation failed", response.status);
      return NextResponse.json({ error: "Não foi possível iniciar a assinatura no PayPal." }, { status: 502 });
    }
    const approvalUrl = data.links?.find((link: { rel: string; href: string }) => link.rel === "approve")?.href;
    if (!approvalUrl) return NextResponse.json({ error: "PayPal não retornou o link de aprovação." }, { status: 502 });
    return NextResponse.json({ approvalUrl });
  } catch (error) {
    console.error("Subscription route error", error);
    return NextResponse.json({ error: "Erro interno ao iniciar assinatura." }, { status: 500 });
  }
}
