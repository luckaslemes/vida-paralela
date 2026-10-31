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
        const { data, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { display_name: name } },
        });
        if (authError) throw authError;
        if (data.session) {
          setMessage("Conta criada com sucesso! Entrando no VIDA PARALELA...");
          router.push("/");
          router.refresh();
        } else {
          setMessage("Cadastro recebido, mas a confirmação por e-mail ainda está ativa no Supabase. Desative a confirmação de e-mail nas configurações de autenticação para permitir entrar sem receber mensagem.");
        }
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
    <main className="auth-screen">
      <div className="auth-grid" aria-hidden="true" />
      <div className="auth-glow auth-glow-one" aria-hidden="true" />
      <div className="auth-glow auth-glow-two" aria-hidden="true" />
      <section className="auth-layout">
        <div className="auth-brand-panel">
          <div className="auth-brand"><span className="auth-brand-icon">◈</span><span>VIDA <b>PARALELA</b></span></div>
          <div className="auth-orb" aria-hidden="true"><div className="auth-orb-ring ring-a"/><div className="auth-orb-ring ring-b"/><div className="auth-orb-core"><span>VP</span><i>AI</i></div><span className="auth-orb-point point-a"/><span className="auth-orb-point point-b"/></div>
          <div className="auth-manifesto"><span className="auth-overline">SISTEMA DE POSSIBILIDADES // 2026</span><h1>O futuro não está escrito.<br/><em>Explore o que pode ser.</em></h1><p>Uma nova forma de enxergar decisões, organizar objetivos e construir caminhos com inteligência.</p></div>
          <div className="auth-status"><span className="auth-status-dot"/> SISTEMA ONLINE <span className="auth-status-line"/> EXPERIÊNCIA PESSOAL</div>
        </div>
        <div className="auth-form-panel">
          <div className="auth-mobile-brand"><span className="auth-brand-icon">◈</span> VIDA <b>PARALELA</b></div>
          <div className="auth-form-head"><span className="auth-overline">{isReset ? "RECUPERAÇÃO DE ACESSO" : mode === "signup" ? "INICIAR JORNADA" : mode === "reset" ? "CENTRAL DE ACESSO" : "ACESSO SEGURO"}</span><h2>{isReset ? "Nova senha" : mode === "signup" ? "Crie sua conta." : mode === "reset" ? "Recuperar acesso." : "Entre na sua realidade."}</h2><p>{isReset ? "Defina uma nova senha para continuar." : mode === "signup" ? "Seu espaço pessoal começa com um cadastro simples." : mode === "reset" ? "Informe seu e-mail para receber as instruções." : "Acesse sua jornada e continue de onde parou."}</p></div>
          {isReset ? (
            <form onSubmit={saveNewPassword} className="auth-form">
              <label>Nova senha<input className="auth-input" type="password" minLength={8} required value={password} onChange={e=>setPassword(e.target.value)} placeholder="Mínimo de 8 caracteres"/></label>
              <button className="auth-submit" disabled={loading}>{loading ? "SALVANDO..." : "ATUALIZAR SENHA  →"}</button>
            </form>
          ) : (
            <>
              <div className="auth-tabs"><button type="button" onClick={()=>{setMode("login");setError("");setMessage("");}} className={mode==="login"?"selected":""}>Entrar</button><button type="button" onClick={()=>{setMode("signup");setError("");setMessage("");}} className={mode==="signup"?"selected":""}>Criar conta</button></div>
              <form onSubmit={handleSubmit} className="auth-form">
                {mode === "signup" && <label>Seu nome<input className="auth-input" value={name} onChange={e=>setName(e.target.value)} placeholder="Como podemos chamar você?" required/></label>}
                <label>E-mail<input className="auth-input" type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="voce@email.com" required/></label>
                {mode !== "reset" && <label>Senha<input className="auth-input" type="password" minLength={8} autoComplete={mode==="signup"?"new-password":"current-password"} value={password} onChange={e=>setPassword(e.target.value)} placeholder="Mínimo de 8 caracteres" required/></label>}
                <button className="auth-submit" disabled={loading}>{loading ? "CONECTANDO..." : mode==="signup" ? "CRIAR MINHA CONTA  →" : "ENTRAR NO SISTEMA  →"}</button>
              </form>
              <button type="button" onClick={()=>{setMode(mode==="reset"?"login":"reset");setError("");setMessage("");}} className="auth-forgot">{mode==="reset"?"Voltar para entrar":"Esqueci minha senha"}</button>
            </>
          )}
          {message && <p role="status" className="auth-message">{message}</p>}
          {error && <p role="alert" className="auth-error">{error}</p>}
          <div className="auth-privacy"><span>◇</span> AMBIENTE PRIVADO · SEUS DADOS PROTEGIDOS</div>
        </div>
      </section>
    </main>
  );

}


