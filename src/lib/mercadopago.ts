import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

export function getAdminSupabase() {
  if (!supabaseUrl || !supabaseSecretKey) throw new Error("Supabase server credentials are not configured.");
  return createClient(supabaseUrl, supabaseSecretKey, { auth: { autoRefreshToken: false, persistSession: false } });
}

export async function getAuthenticatedUser(request: Request) {
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) return null;
  const { data, error } = await getAdminSupabase().auth.getUser(authorization.slice(7));
  if (error || !data.user) return null;
  return data.user;
}

export async function mercadoPagoRequest(path: string, init: RequestInit = {}) {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!token) throw new Error("Mercado Pago Access Token is not configured.");
  return fetch("https://api.mercadopago.com" + path, {
    ...init,
    headers: { Authorization: "Bearer " + token, "Content-Type": "application/json", ...(init.headers || {}) },
    cache: "no-store",
  });
}
