import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

export function getAdminSupabase() {
  if (!supabaseUrl || !supabaseSecretKey) throw new Error("Supabase server credentials are not configured.");
  return createClient(supabaseUrl, supabaseSecretKey, { auth: { autoRefreshToken: false, persistSession: false } });
}

export async function getPayPalAccessToken() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error("PayPal Sandbox credentials are missing.");
  const base = process.env.PAYPAL_API_BASE_URL || "https://api-m.sandbox.paypal.com";
  const response = await fetch(base + "/v1/oauth2/token", {
    method: "POST",
    headers: { Authorization: "Basic " + Buffer.from(clientId + ":" + clientSecret).toString("base64"), "Content-Type": "application/x-www-form-urlencoded" },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });
  const data = await response.json();
  if (!response.ok || !data.access_token) throw new Error("Could not authenticate with PayPal.");
  return { accessToken: data.access_token as string, base };
}

export async function getAuthenticatedUser(request: Request) {
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) return null;
  const { data, error } = await getAdminSupabase().auth.getUser(authorization.slice(7));
  if (error || !data.user) return null;
  return data.user;
}
