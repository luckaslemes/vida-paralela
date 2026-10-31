"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [isReset, setIsReset] = useState(false);
  useEffect(() => { setIsReset(new URLSearchParams(window.location.search).get("reset") === "1"); }, []);
  const [mode, setMode] = useState<"login" | "signup" | "reset">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    if (!supabase) {
      setError("O aplicativo ainda não está configurado. Confira as variáveis do Supabase no ambiente de execução.");
      return;
    }
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { display_name: name }, emailRedirectTo: window.location.origin + "/login" },
        });
        if (authError) throw authError;
        setMessage("Cadastro iniciado! Confira seu e-mail para confirmar a conta antes de entrar.");
      } else if (mode === "reset") {
        const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + "/login?reset=1",
        });
        if (authError) throw authError;
        setMessage("Se o endereço estiver cadastrado, você receberá um e-mail com as instruções para redefinir a senha.");
      } else {
        const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
        if (authError) throw authError;
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível concluir. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  async function saveNewPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    if (!supabase) return setError("Supabase não configurado.");
    setLoading(true);
    const { error: authError } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (authError) setError(authError.message);
    else { setMessage("Senha atualizada. Você já pode continuar usando sua conta."); setMode("login"); setPassword(""); }
  }

  return (
    <main style={{minHeight:"100vh",display:"grid",placeItems:"center",padding:24,background:"linear-gradient(135deg,#f7faff,#edf4ff)",fontFamily:"Arial,sans-serif",color:"#172b4d"}}>
      <section style={{width:"100%",maxWidth:440,background:"#fff",padding:32,borderRadius:24,boxShadow:"0 18px 60px rgba(31,75,130,.12)"}}>
        <Link href="/" style={{textDecoration:"none",color:"#2563eb",fontWeight:800,letterSpacing:".08em",fontSize:13}}>← VIDA PARALELA</Link>
        <div style={{marginTop:28,marginBottom:24}}>
          <div style={{fontSize:12,fontWeight:800,color:"#3975d7",letterSpacing:".12em"}}>SUA JORNADA COMEÇA AQUI</div>
          <h1 style={{fontSize:30,margin:"10px 0",letterSpacing:"-.04em"}}>{isReset ? "Crie uma nova senha" : mode === "signup" ? "Crie sua conta" : mode === "reset" ? "Recuperar acesso" : "Bem-vindo de volta"}</h1>
          <p style={{color:"#64748b",lineHeight:1.6,margin:0}}>Acesse seu espaço para organizar ideias, metas e decisões.</p>
        </div>

        {isReset ? (
          <form onSubmit={saveNewPassword} style={{display:"grid",gap:14}}>
            <label style={labelStyle}>Nova senha<input style={inputStyle} type="password" minLength={8} required value={password} onChange={e=>setPassword(e.target.value)} placeholder="Pelo menos 8 caracteres"/></label>
            <button style={buttonStyle} disabled={loading}>{loading ? "Salvando..." : "Atualizar senha"}</button>
          </form>
        ) : (
          <>
            <div style={{display:"flex",gap:8,background:"#f1f5f9",padding:5,borderRadius:12,marginBottom:20}}>
              <button type="button" onClick={()=>{setMode("login");setError("");setMessage("");}} style={tabStyle(mode==="login")}>Entrar</button>
              <button type="button" onClick={()=>{setMode("signup");setError("");setMessage("");}} style={tabStyle(mode==="signup")}>Criar conta</button>
            </div>
            <form onSubmit={handleSubmit} style={{display:"grid",gap:14}}>
              {mode === "signup" && <label style={labelStyle}>Como podemos chamar você?<input style={inputStyle} value={name} onChange={e=>setName(e.target.value)} placeholder="Seu nome" required/></label>}
              <label style={labelStyle}>E-mail<input style={inputStyle} type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="voce@email.com" required/></label>
              {mode !== "reset" && <label style={labelStyle}>Senha<input style={inputStyle} type="password" minLength={8} autoComplete={mode==="signup"?"new-password":"current-password"} value={password} onChange={e=>setPassword(e.target.value)} placeholder="Pelo menos 8 caracteres" required/></label>}
              <button style={buttonStyle} disabled={loading}>{loading ? "Aguarde..." : mode==="signup" ? "Criar minha conta" : "Entrar"}</button>
            </form>
            <button type="button" onClick={()=>{setMode(mode==="reset"?"login":"reset");setError("");setMessage("");}} style={{border:0,background:"transparent",color:"#2563eb",fontWeight:700,cursor:"pointer",padding:"16px 0 0"}}>{mode==="reset"?"Voltar para entrar":"Esqueci minha senha"}</button>
            {mode==="reset" && <p style={{fontSize:13,color:"#64748b"}}>Informe seu e-mail e enviaremos um link para redefinir a senha.</p>}
          </>
        )}
        {message && <p role="status" style={{background:"#ecfdf5",color:"#047857",padding:12,borderRadius:10,fontSize:14,lineHeight:1.5}}>{message}</p>}
        {error && <p role="alert" style={{background:"#fef2f2",color:"#b91c1c",padding:12,borderRadius:10,fontSize:14,lineHeight:1.5}}>{error}</p>}
        <p style={{fontSize:12,color:"#94a3b8",lineHeight:1.5,marginTop:24}}>Seus dados são privados e protegidos por regras de acesso por usuário. Nunca compartilhe sua senha.</p>
      </section>
    </main>
  );
}

const labelStyle: React.CSSProperties = {display:"grid",gap:7,fontSize:13,fontWeight:700,color:"#334155"};
const inputStyle: React.CSSProperties = {width:"100%",boxSizing:"border-box",padding:"13px 14px",border:"1px solid #dbe4f0",borderRadius:10,fontSize:15,outlineColor:"#3b82f6"};
const buttonStyle: React.CSSProperties = {border:0,borderRadius:11,padding:14,background:"#2563eb",color:"#fff",fontSize:15,fontWeight:800,cursor:"pointer",marginTop:4};
const tabStyle = (active:boolean): React.CSSProperties => ({flex:1,border:0,borderRadius:9,padding:11,background:active?"#fff":"transparent",color:active?"#1d4ed8":"#64748b",fontWeight:800,cursor:"pointer",boxShadow:active?"0 1px 4px rgba(15,23,42,.08)":"none"});
