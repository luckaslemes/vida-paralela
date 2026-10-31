import { NextResponse } from "next/server";
import { getAdminSupabase, getPayPalAccessToken } from "@/lib/paypal";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const webhookId = process.env.PAYPAL_WEBHOOK_ID;
    if (!webhookId) return NextResponse.json({ error: "Webhook PayPal não configurado." }, { status: 503 });
    const event = await request.json();
    const { accessToken, base } = await getPayPalAccessToken();
    const header = (name: string) => request.headers.get(name) || "";
    const verification = await fetch(base + "/v1/notifications/verify-webhook-signature", {
      method: "POST",
      headers: { Authorization: "Bearer " + accessToken, "Content-Type": "application/json" },
      body: JSON.stringify({
        auth_algo: header("paypal-auth-algo"), cert_url: header("paypal-cert-url"), transmission_id: header("paypal-transmission-id"),
        transmission_sig: header("paypal-transmission-sig"), transmission_time: header("paypal-transmission-time"), webhook_id: webhookId, webhook_event: event,
      }),
      cache: "no-store",
    });
    const verificationData = await verification.json();
    if (!verification.ok || verificationData.verification_status !== "SUCCESS") return NextResponse.json({ error: "Assinatura do webhook inválida." }, { status: 400 });

    const eventId = event.id as string | undefined;
    const eventType = event.event_type as string | undefined;
    const resource = event.resource || {};
    const subscriptionId = (resource.id || resource.billing_agreement_id) as string | undefined;
    if (!eventId || !eventType) return NextResponse.json({ received: true });
    const supabase = getAdminSupabase();
    const { error: logError } = await supabase.from("paypal_webhook_events").insert({ event_id: eventId, event_type: eventType, resource_id: subscriptionId || null });
    if (logError?.code === "23505") return NextResponse.json({ received: true, duplicate: true });
    if (logError) throw logError;

    const supported = ["BILLING.SUBSCRIPTION.ACTIVATED", "BILLING.SUBSCRIPTION.CANCELLED", "BILLING.SUBSCRIPTION.SUSPENDED", "BILLING.SUBSCRIPTION.EXPIRED", "PAYMENT.SALE.COMPLETED", "BILLING.SUBSCRIPTION.PAYMENT.FAILED"];
    if (!supported.includes(eventType) || !subscriptionId) return NextResponse.json({ received: true });
    const detailResponse = await fetch(base + "/v1/billing/subscriptions/" + encodeURIComponent(subscriptionId), { headers: { Authorization: "Bearer " + accessToken }, cache: "no-store" });
    const detail = await detailResponse.json();
    if (!detailResponse.ok) throw new Error("Could not retrieve PayPal subscription details.");
    const ownerId = detail.custom_id as string | undefined;
    if (!ownerId) return NextResponse.json({ received: true, ignored: "missing owner" });

    const statusMap: Record<string, string> = { ACTIVE: "active", APPROVAL_PENDING: "inactive", APPROVED: "inactive", SUSPENDED: "past_due", CANCELLED: "canceled", EXPIRED: "canceled" };
    const status = statusMap[detail.status] || "inactive";
    const isPremium = status === "active" || status === "past_due";
    const { error: subscriptionError } = await supabase.from("subscriptions").upsert({ user_id: ownerId, plan: isPremium ? "premium" : "free", status, provider: "paypal", provider_subscription_id: subscriptionId, current_period_end: detail.billing_info?.next_billing_time || null }, { onConflict: "user_id" });
    if (subscriptionError) throw subscriptionError;
    const { error: profileError } = await supabase.from("profiles").update({ plan: isPremium ? "premium" : "free" }).eq("id", ownerId);
    if (profileError) throw profileError;
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("PayPal webhook error", error);
    return NextResponse.json({ error: "Falha ao processar webhook." }, { status: 500 });
  }
}
