import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { getAdminSupabase, mercadoPagoRequest } from "@/lib/mercadopago";

export const runtime = "nodejs";

function validSignature(signature: string, requestId: string, dataId: string, secret: string) {
  const parts = Object.fromEntries(signature.split(",").map((part) => part.trim().split("=") as [string, string]));
  const ts = parts.ts;
  const v1 = parts.v1;
  if (!ts || !v1 || !requestId || !dataId) return false;
  const manifest = `id:${dataId.toLowerCase()};request-id:${requestId};ts:${ts};`;
  const expected = createHmac("sha256", secret).update(manifest).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(v1);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  try {
    const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
    if (!secret) return NextResponse.json({ error: "Webhook secret não configurado." }, { status: 503 });

    const url = new URL(request.url);
    const body = await request.json();
    const dataId = url.searchParams.get("data.id") || body?.data?.id;
    const signature = request.headers.get("x-signature") || "";
    const requestId = request.headers.get("x-request-id") || "";
    if (!dataId || !validSignature(signature, requestId, String(dataId), secret)) {
      return NextResponse.json({ error: "Assinatura inválida." }, { status: 401 });
    }

    const type = String(body?.type || url.searchParams.get("type") || "");
    if (type !== "subscription_preapproval") return NextResponse.json({ received: true, ignored: true });

    const detailResponse = await mercadoPagoRequest("/preapproval/" + encodeURIComponent(String(dataId)));
    const detail = await detailResponse.json();
    if (!detailResponse.ok) throw new Error("Não foi possível consultar a assinatura no Mercado Pago.");

    const userId = detail.external_reference;
    if (!userId) return NextResponse.json({ received: true, ignored: "missing external reference" });

    const statusMap: Record<string, string> = {
      authorized: "active",
      pending: "inactive",
      paused: "past_due",
      cancelled: "canceled",
    };
    const status = statusMap[String(detail.status).toLowerCase()] || "inactive";
    const premium = status === "active" || status === "past_due";
    const supabase = getAdminSupabase();
    const { error: subscriptionError } = await supabase.from("subscriptions").upsert({
      user_id: userId,
      plan: premium ? "premium" : "free",
      status,
      provider: "mercadopago",
      provider_subscription_id: String(detail.id),
      current_period_end: detail.next_payment_date || null,
    }, { onConflict: "user_id" });
    if (subscriptionError) throw subscriptionError;

    const { error: profileError } = await supabase.from("profiles").update({ plan: premium ? "premium" : "free" }).eq("id", userId);
    if (profileError) throw profileError;
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Mercado Pago webhook error", error);
    return NextResponse.json({ error: "Falha ao processar webhook." }, { status: 500 });
  }
}
