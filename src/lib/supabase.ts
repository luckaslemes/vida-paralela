import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && publishableKey);

// A chave publishable/anon é própria para uso no navegador.
// Nunca use a chave secret/service_role neste arquivo.
export const supabase =
  isSupabaseConfigured ? createClient(url!, publishableKey!) : null;
