"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  Activity, ArrowRight, Bell, BriefcaseBusiness, CalendarDays, Check,
  ChevronRight, CircleHelp, Compass, CreditCard, Heart, Lightbulb,
  Plus, Sparkles, Target, Wallet, Waves
} from "lucide-react";

const modules = [
  { icon: Compass, title: "Simulador de realidades", desc: "Explore caminhos e compare decisões.", tag: "Principal", color: "blue" },
  { icon: Wallet, title: "Minha vida financeira", desc: "Organize receitas, despesas e objetivos.", tag: "Básico", color: "green" },
  { icon: CalendarDays, title: "Agenda inteligente", desc: "Planeje compromissos e tarefas.", tag: "Básico", color: "violet" },
  { icon: Heart, title: "Inspiração diária", desc: "Reflexões e lembretes no seu ritmo.", tag: "Básico", color: "rose" },
  { icon: BriefcaseBusiness, title: "Carreira e negócios", desc: "Planeje próximos passos profissionais.", tag: "Em estruturação", color: "amber" },
  { icon: Sparkles, title: "Minha inteligência artificial", desc: "Um assistente para conectar seus planos.", tag: "Em estruturação", color: "blue" },
];

const tasks = [
  { time: "08:00", title: "Revisar prioridades do dia", done: true },
  { time: "12:30", title: "Conferir despesas da semana", done: false },
  { time: "19:00", title: "Revisar metas pessoais", done: false },
];

export default function Home() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [userName, setUserName] = useState<string | null>(null);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      if (!data.session) { router.replace("/login"); return; }
      setSignedIn(true);
      setCheckingAuth(false);
      setUserName(data.session?.user.user_metadata?.display_name || data.session?.user.email || null);
    });
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) { router.replace("/login"); return; }
      setCheckingAuth(false);
      setSignedIn(true);
      setUserName(session?.user.user_metadata?.display_name || session?.user.email || null);
    });
    return () => { active = false; authListener.subscription.unsubscribe(); };
  }, []);

  async function signOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
    setSignedIn(false);
    setUserName(null);
  }

  if (checkingAuth || !signedIn) return <main style={{minHeight:"100vh",background:"#050b18",display:"grid",placeItems:"center",color:"#70d8f5",fontFamily:"Arial,sans-serif",letterSpacing:".2em",fontSize:11}}>VIDA PARALELA · AUTENTICANDO...</main>;

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#">
          <span className="brand-mark"><Waves size={23} /></span>
          <span><strong>VIDA</strong><b>PARALELA</b></span>
        </a>
        <div className="side-label">MENU PRINCIPAL</div>
        <nav className="nav-list">
          <a className="nav-item active" href="#inicio"><Activity size={18}/> Visão geral</a>
          <a className="nav-item" href="/simulador"><Compass size={18}/> Realidades</a>
          <a className="nav-item" href="#financeiro"><Wallet size={18}/> Financeiro</a>
          <a className="nav-item" href="#agenda"><CalendarDays size={18}/> Agenda</a>
          <a className="nav-item" href="#inspiracao"><Heart size={18}/> Inspiração</a>
          <a className="nav-item" href="#carreira"><BriefcaseBusiness size={18}/> Carreira e negócios</a>
        </nav>
        <div className="sidebar-bottom">
          <div className="help-card">
            <div className="help-icon"><CircleHelp size={18}/></div>
            <strong>Precisa de ajuda?</strong>
            <p>Seu espaço para planejar com mais clareza.</p>
            <a href="mailto:suporte@vidaparalela.app">Fale conosco <ArrowRight size={14}/></a>
          </div>
          <div className="profile-mini"><div className="avatar">{signedIn ? (userName?.[0]?.toUpperCase() || "U") : "VP"}</div><div><strong>{signedIn ? userName : "Minha conta"}</strong><small>{signedIn ? "Conta conectada" : "Plano gratuito"}</small></div><ChevronRight size={16}/></div>
        </div>
      </aside>

      <section className="main-area" id="inicio">
        <header className="topbar">
          <div className="mobile-brand"><span className="brand-mark"><Waves size={20}/></span><strong>VIDA PARALELA</strong></div>
          <div className="breadcrumb">Aplicativo <ChevronRight size={14}/> <strong>Visão geral</strong></div>
          {signedIn ? <div style={{display:"flex",alignItems:"center",gap:12,fontSize:12}}><span>Olá, {userName}</span><button className="account-link" onClick={signOut}>Sair</button></div> : <div style={{display:"flex",alignItems:"center",gap:14}}><a className="account-link" href="/premium">Premium <ArrowRight size={15}/></a><a className="account-link" href="/login">Entrar / Criar conta <ArrowRight size={15}/></a></div>}
        </header>

        <div className="content">
          <div className="welcome-row">
            <div>
              <div className="eyebrow"><span className="pulse"/> SEU ESPAÇO DE POSSIBILIDADES</div>
              <h1>Seu futuro começa<br/><span>nas decisões de hoje.</span></h1>
              <p className="subtitle">Organize o presente, aprenda com o passado e explore novos caminhos.</p>
            </div>
            <div className="welcome-art"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="orbit-core"><Waves size={38}/></div><span className="orbit-dot dot-one"/><span className="orbit-dot dot-two"/></div>
          </div>

          <section className="feature-card" id="realidades">
            <div className="feature-copy">
              <span className="feature-kicker"><Sparkles size={14}/> SIMULADOR DE REALIDADES PESSOAIS</span>
              <h2>E se você escolhesse<br/>um caminho diferente?</h2>
              <p>Descreva uma decisão. Explore possibilidades, consequências, riscos e oportunidades antes de agir.</p>
              <a className="primary-button" href="/simulador">Conhecer o simulador <ArrowRight size={16}/></a>
            </div>
            <div className="path-visual" aria-hidden="true">
              <div className="path-label label-a">REALIDADE A</div><div className="path-label label-b">REALIDADE B</div><div className="path-label label-c">REALIDADE C</div>
              <svg viewBox="0 0 340 210" role="img"><path d="M20 105 C95 105 92 35 160 35 S245 35 320 35" className="path-line line-a"/><path d="M20 105 C95 105 100 105 160 105 S245 105 320 105" className="path-line line-b"/><path d="M20 105 C95 105 92 175 160 175 S245 175 320 175" className="path-line line-c"/><circle cx="20" cy="105" r="8" className="path-start"/><circle cx="320" cy="35" r="7" className="path-end"/><circle cx="320" cy="105" r="7" className="path-end"/><circle cx="320" cy="175" r="7" className="path-end"/></svg>
            </div>
          </section>

          <div className="section-heading"><div><span className="eyebrow">SEU PAINEL</span><h2>Suas ferramentas</h2></div><a className="section-note" href="/premium">Conheça o Premium →</a></div>
          <div className="module-grid">
            {modules.map((m) => { const Icon = m.icon; return (
              <article className="module-card" key={m.title}>
                <div className={`module-icon ${m.color}`}><Icon size={21}/></div>
                <span className="module-tag">{m.tag}</span>
                <h3>{m.title}</h3><p>{m.desc}</p>
                <a href={m.title.includes("financeira") ? "#financeiro" : m.title.includes("Agenda") ? "#agenda" : m.title.includes("Inspiração") ? "#inspiracao" : m.title.includes("Carreira") ? "#carreira" : "/simulador"}>Acessar <ArrowRight size={14}/></a>
              </article>
            ); })}
          </div>

          <div className="lower-grid">
            <section className="panel" id="agenda">
              <div className="panel-head"><div><span className="eyebrow">ORGANIZAÇÃO</span><h2>Meu dia</h2></div><button className="small-action"><Plus size={15}/> Nova tarefa</button></div>
              <div className="task-list">{tasks.map((t) => <div className="task" key={t.title}><span className="task-time">{t.time}</span><span className={`task-check ${t.done ? "checked" : ""}`}>{t.done && <Check size={12}/>}</span><span className={t.done ? "task-done" : ""}>{t.title}</span></div>)}</div>
              <p className="demo-note">Exemplo de organização — suas tarefas serão salvas na sua conta após a conexão do banco de dados.</p>
            </section>
            <section className="panel inspiration" id="inspiracao">
              <div className="inspiration-icon"><Lightbulb size={20}/></div>
              <span className="eyebrow">PAUSA PARA REFLETIR</span>
              <h2>Pequenos passos também levam longe.</h2>
              <p>Você não precisa resolver tudo hoje. Escolha uma atitude possível e comece por ela.</p>
              <span className="inspiration-foot">MENSAGEM INSPIRADORA DE DEMONSTRAÇÃO</span>
            </section>
          </div>

          <div className="lower-grid second-row">
            <section className="panel" id="financeiro"><div className="panel-head"><div><span className="eyebrow">PLANEJAMENTO</span><h2>Minha vida financeira</h2></div><Wallet size={20} className="muted-icon"/></div><p className="panel-description">Em breve: receitas, despesas, orçamento, metas e simulações financeiras.</p><div className="empty-state"><CreditCard size={22}/><span>Adicione seus dados quando o módulo financeiro estiver ativo.</span></div></section>
            <section className="panel" id="carreira"><div className="panel-head"><div><span className="eyebrow">PRÓXIMOS PASSOS</span><h2>Carreira e negócios</h2></div><Target size={20} className="muted-icon"/></div><p className="panel-description">Transforme ideias em objetivos e avalie caminhos profissionais com mais clareza.</p><div className="empty-state"><BriefcaseBusiness size={22}/><span>Este módulo será desenvolvido nas próximas etapas.</span></div></section>
          </div>
          <footer className="footer"><span>© 2026 VIDA PARALELA</span><span>Planeje com consciência. Decida com clareza.</span><a href="mailto:suporte@vidaparalela.app">Ajuda e suporte</a></footer>
        </div>
      </section>
    </main>
  );
}
