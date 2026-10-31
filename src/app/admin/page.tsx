"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ShieldCheck, Users, CreditCard, BarChart3, Settings, LogOut, PackagePlus, RefreshCw } from "lucide-react";

type Profile = { id: string; display_name: string | null; plan: string; role: string; created_at: string };
type Plan = { id: string; name: string; description: string | null; price_monthly: number; trial_days: number; features: unknown; active: boolean };
type Subscription = { id: string; user_id: string; plan: string; status: string; provider: string | null; current_period_end: string | null };
type Tab = "overview" | "users" | "plans" | "subscriptions";

const panel: React.CSSProperties = { background: "#0c1c2b", border: "1px solid #1d3c51", borderRadius: 16, padding: 18 };
const field: React.CSSProperties = { width: "100%", boxSizing: "border-box", padding: "11px 12px", borderRadius: 9, border: "1px solid #315268", background: "#071827", color: "#e8f6ff", marginTop: 6 };
const button: React.CSSProperties = { border: "1px solid #28617c", background: "#123a51", color: "#dff8ff", padding: "10px 14px", borderRadius: 9, cursor: "pointer", fontWeight: 600 };

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [tab, setTab] = useState<Tab>("overview");
  const [users, setUsers] = useState<Profile[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);
  const [planName, setPlanName] = useState("");
  const [planDescription, setPlanDescription] = useState("");
  const [planPrice, setPlanPrice] = useState("29.90");
  const [trialDays, setTrialDays] = useState("3");

  const loadData = useCallback(async () => {
    if (!supabase) { router.replace("/login"); return; }
    setError("");
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) { router.replace("/login"); return; }
    setEmail(auth.user.email || "");
    const { data: me, error: meError } = await supabase.from("profiles").select("role").eq("id", auth.user.id).maybeSingle();
    if (meError || me?.role !== "admin") { router.replace("/"); return; }
    const [u, p, s] = await Promise.all([
      supabase.from("profiles").select("id, display_name, plan, role, created_at").order("created_at", { ascending: false }),
      supabase.from("app_plans").select("id, name, description, price_monthly, trial_days, features, active").order("created_at", { ascending: true }),
      supabase.from("subscriptions").select("id, user_id, plan, status, provider, current_period_end").order("created_at", { ascending: false })
    ]);
    if (u.error || p.error || s.error) setError([u.error?.message, p.error?.message, s.error?.message].filter(Boolean).join(" · "));
    setUsers((u.data || []) as Profile[]);
    setPlans((p.data || []) as Plan[]);
    setSubscriptions((s.data || []) as Subscription[]);
    setLoading(false);
  }, [router]);

  useEffect(() => { void loadData(); }, [loadData]);

  async function createPlan(e: React.FormEvent) {
    e.preventDefault(); if (!supabase) return;
    setSaving(true); setError(""); setNotice("");
    const { error: insertError } = await supabase.from("app_plans").insert({
      name: planName.trim(), description: planDescription.trim() || null,
      price_monthly: Number(planPrice), trial_days: Number(trialDays), features: [], active: true
    });
    setSaving(false);
    if (insertError) { setError(insertError.message); return; }
    setPlanName(""); setPlanDescription(""); setNotice("Plano cadastrado."); await loadData();
  }

  async function togglePlan(plan: Plan) {
    if (!supabase) return;
    const { error: updateError } = await supabase.from("app_plans").update({ active: !plan.active }).eq("id", plan.id);
    if (updateError) setError(updateError.message); else { setNotice("Status do plano atualizado."); await loadData(); }
  }

  async function changeUserPlan(user: Profile, nextPlan: string) {
    if (!supabase || !nextPlan) return;
    const { error: updateError } = await supabase.from("profiles").update({ plan: nextPlan }).eq("id", user.id);
    if (updateError) setError(updateError.message);
    else { setNotice("Plano do usuário atualizado. Isso não registra pagamento."); await loadData(); }
  }

  async function signOut() { await supabase?.auth.signOut(); router.replace("/login"); }

  if (loading) return <main style={{ minHeight: "100vh", background: "#07111f", color: "#78ddfa", display: "grid", placeItems: "center" }}>CARREGANDO ADMINISTRAÇÃO...</main>;

  const nav: { id: Tab; label: string; icon: typeof Users }[] = [
    { id: "overview", label: "Visão geral", icon: BarChart3 }, { id: "users", label: "Contas", icon: Users },
    { id: "plans", label: "Planos", icon: PackagePlus }, { id: "subscriptions", label: "Assinaturas", icon: CreditCard }
  ];
  const money = (v: number) => Number(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const date = (v: string | null) => v ? new Date(v).toLocaleDateString("pt-BR") : "—";

  return <main style={{ minHeight: "100vh", background: "radial-gradient(circle at 15% 0%,#102b43 0,transparent 34%),#07111f", color: "#e8f6ff", fontFamily: "Arial,sans-serif", padding: "24px 18px" }}>
    <div style={{ maxWidth: 1180, margin: "0 auto" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14, flexWrap: "wrap", borderBottom: "1px solid #1d3b50", paddingBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}><div style={{ width: 44, height: 44, borderRadius: 13, display: "grid", placeItems: "center", background: "#123a51", color: "#69dcff" }}><ShieldCheck size={24}/></div><div><div style={{ fontSize: 11, letterSpacing: ".2em", color: "#75dfff" }}>VIDA PARALELA</div><h1 style={{ fontSize: 24, margin: "5px 0 0" }}>Administração</h1></div></div>
        <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}><button style={button} onClick={() => void loadData()}><RefreshCw size={14} style={{ verticalAlign: "middle" }}/> Atualizar</button><button style={button} onClick={signOut}><LogOut size={14} style={{ verticalAlign: "middle" }}/> Sair</button></div>
      </header>
      <p style={{ color: "#9cb7c8", fontSize: 13 }}>Administrador: {email}</p>
      <nav style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "20px 0" }}>{nav.map(n => { const Icon = n.icon; return <button key={n.id} onClick={() => setTab(n.id)} style={{ ...button, background: tab === n.id ? "#126080" : "#0c1c2b" }}><Icon size={15} style={{ verticalAlign: "middle" }}/> {n.label}</button>; })}</nav>
      {error && <div role="alert" style={{ ...panel, borderColor: "#a44", color: "#ffb9b9", marginBottom: 14 }}>Erro: {error}</div>}
      {notice && <div role="status" style={{ ...panel, borderColor: "#28745c", color: "#a5f2d0", marginBottom: 14 }}>{notice}</div>}
      {tab === "overview" && <><div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12 }}>
        {[["Contas cadastradas", users.length], ["Planos ativos", plans.filter(p => p.active).length], ["Assinaturas ativas", subscriptions.filter(s => s.status === "active" || s.status === "trialing").length], ["Contas Premium", users.filter(u => u.plan === "premium").length]].map(([label, value]) => <section key={String(label)} style={panel}><div style={{ color: "#9cb7c8", fontSize: 13 }}>{label}</div><strong style={{ display: "block", fontSize: 30, color: "#73dcff", marginTop: 9 }}>{value}</strong></section>)}
      </div><section style={{ ...panel, marginTop: 14 }}><h2 style={{ marginTop: 0 }}>Atividade recente</h2>{users.slice(0, 5).map(u => <div key={u.id} style={{ padding: "10px 0", borderTop: "1px solid #1d3c51", display: "flex", justifyContent: "space-between", gap: 10 }}><span>{u.display_name || "Usuário sem nome"}</span><span style={{ color: "#91b4c7" }}>{u.plan} · {date(u.created_at)}</span></div>)}</section></>}
      {tab === "users" && <section style={panel}><h2 style={{ marginTop: 0 }}>Contas cadastradas ({users.length})</h2>{users.length === 0 ? <p>Nenhuma conta encontrada.</p> : <div style={{ overflowX: "auto" }}><table style={{ width: "100%", borderCollapse: "collapse", minWidth: 620 }}><thead><tr>{["Nome","Perfil","Plano","Cadastro","Alterar plano"].map(x => <th key={x} style={{ textAlign: "left", padding: 10, color: "#82dff8" }}>{x}</th>)}</tr></thead><tbody>{users.map(u => <tr key={u.id} style={{ borderTop: "1px solid #244257" }}><td style={{ padding: 10 }}>{u.display_name || "—"}</td><td>{u.role}</td><td>{u.plan}</td><td>{date(u.created_at)}</td><td><select aria-label="Alterar plano" value={u.plan} onChange={e => void changeUserPlan(u, e.target.value)} style={{ ...field, minWidth: 115, margin: 0 }}><option value="free">Gratuito</option><option value="premium">Premium</option></select></td></tr>)}</tbody></table></div>}<p style={{ color: "#9cb7c8", fontSize: 12 }}>A troca manual de plano é administrativa e não confirma pagamento.</p></section>}
      {tab === "plans" && <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 14, alignItems: "start" }}><form onSubmit={createPlan} style={panel}><h2 style={{ marginTop: 0 }}>Cadastrar plano</h2><label>Nome<input required value={planName} onChange={e => setPlanName(e.target.value)} style={field} placeholder="Ex.: Premium anual"/></label><label style={{ display: "block", marginTop: 12 }}>Descrição<input value={planDescription} onChange={e => setPlanDescription(e.target.value)} style={field} placeholder="O que o plano oferece"/></label><label style={{ display: "block", marginTop: 12 }}>Preço mensal (R$)<input required type="number" min="0" step="0.01" value={planPrice} onChange={e => setPlanPrice(e.target.value)} style={field}/></label><label style={{ display: "block", marginTop: 12 }}>Dias de teste grátis<input type="number" min="0" step="1" value={trialDays} onChange={e => setTrialDays(e.target.value)} style={field}/></label><button disabled={saving} style={{ ...button, width: "100%", marginTop: 16, opacity: saving ? .6 : 1 }}>{saving ? "Salvando..." : "Cadastrar plano"}</button></form><section style={panel}><h2 style={{ marginTop: 0 }}>Planos existentes</h2>{plans.map(p => <div key={p.id} style={{ padding: "13px 0", borderTop: "1px solid #244257" }}><div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}><strong>{p.name}</strong><span style={{ color: p.active ? "#91e6c1" : "#f0bd7a" }}>{p.active ? "Ativo" : "Inativo"}</span></div><div style={{ color: "#9cb7c8", fontSize: 13, margin: "6px 0" }}>{money(p.price_monthly)} / mês · {p.trial_days} dias de teste</div><p style={{ margin: "4px 0 10px", fontSize: 13 }}>{p.description}</p><button style={button} onClick={() => void togglePlan(p)}>{p.active ? "Desativar" : "Ativar"}</button></div>)}</section></div>}
      {tab === "subscriptions" && <section style={panel}><h2 style={{ marginTop: 0 }}>Assinaturas ({subscriptions.length})</h2>{subscriptions.length === 0 ? <p>Nenhuma assinatura encontrada.</p> : <div style={{ overflowX: "auto" }}><table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}><thead><tr>{["Usuário (ID)","Plano","Status","Provedor","Vencimento"].map(x => <th key={x} style={{ textAlign: "left", padding: 10, color: "#82dff8" }}>{x}</th>)}</tr></thead><tbody>{subscriptions.map(s => <tr key={s.id} style={{ borderTop: "1px solid #244257" }}><td style={{ padding: 10, fontSize: 12 }}>{s.user_id.slice(0, 8)}…</td><td>{s.plan}</td><td>{s.status}</td><td>{s.provider || "—"}</td><td>{date(s.current_period_end)}</td></tr>)}</tbody></table></div>}</section>}
      <p style={{ color: "#7896a8", fontSize: 12, marginTop: 22 }}>A administração consulta dados protegidos por políticas de acesso. O painel não altera cobranças no Mercado Pago.</p>
    </div>
  </main>;
}
