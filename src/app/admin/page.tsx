"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ShieldCheck, Users, CreditCard, BarChart3, Settings, LogOut, LockKeyhole } from "lucide-react";

type Profile = { role: string; display_name: string | null; plan: string };

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [email, setEmail] = useState("");

  useEffect(() => {
    let alive = true;
    async function checkAdmin() {
      if (!supabase) { router.replace("/login"); return; }
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) { router.replace("/login"); return; }
      const { data, error } = await supabase.from("profiles").select("role, display_name, plan").eq("id", auth.user.id).maybeSingle();
      if (!alive) return;
      if (error || data?.role !== "admin") { router.replace("/"); return; }
      setProfile(data as Profile);
      setEmail(auth.user.email || "");
      setLoading(false);
    }
    checkAdmin();
    return () => { alive = false; };
  }, [router]);

  async function signOut() {
    await supabase?.auth.signOut();
    router.replace("/login");
  }

  if (loading) return <main style={{minHeight:"100vh",background:"#07111f",color:"#78ddfa",display:"grid",placeItems:"center",fontFamily:"Arial"}}>VERIFICANDO ACESSO ADMINISTRATIVO...</main>;

  const items = [
    { icon: Users, title: "Usuários", detail: "Gestão de contas e acessos" },
    { icon: CreditCard, title: "Planos e assinaturas", detail: "Acompanhamento de pagamentos e Premium" },
    { icon: BarChart3, title: "Indicadores", detail: "Crescimento e utilização do aplicativo" },
    { icon: Settings, title: "Configurações", detail: "Parâmetros gerais do VIDA PARALELA" },
  ];

  return (
    <main style={{minHeight:"100vh",background:"radial-gradient(circle at 15% 0%,#102b43 0,transparent 34%),#07111f",color:"#e8f6ff",fontFamily:"Arial,sans-serif",padding:"28px 20px"}}>
      <div style={{maxWidth:1100,margin:"0 auto"}}>
        <header style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:16,flexWrap:"wrap",borderBottom:"1px solid #1d3b50",paddingBottom:22}}>
          <div style={{display:"flex",alignItems:"center",gap:13}}>
            <div style={{width:46,height:46,borderRadius:14,display:"grid",placeItems:"center",background:"#123a51",color:"#69dcff"}}><ShieldCheck size={25}/></div>
            <div><div style={{fontSize:11,letterSpacing:".2em",color:"#75dfff"}}>VIDA PARALELA</div><h1 style={{fontSize:25,margin:"5px 0 0"}}>Painel administrativo</h1></div>
          </div>
          <button onClick={signOut} style={{display:"flex",alignItems:"center",gap:8,border:"1px solid #315268",background:"#102438",color:"#d9f3ff",padding:"10px 14px",borderRadius:10,cursor:"pointer"}}><LogOut size={16}/> Sair</button>
        </header>
        <section style={{marginTop:28,padding:22,border:"1px solid #24516a",borderRadius:18,background:"linear-gradient(120deg,#102b40,#0b1a2a)"}}>
          <div style={{display:"flex",alignItems:"center",gap:9,color:"#6ce0ff",fontSize:12,letterSpacing:".12em"}}><LockKeyhole size={16}/> ACESSO DE ADMINISTRADOR CONFIRMADO</div>
          <h2 style={{fontSize:23,margin:"12px 0 6px"}}>Bem-vindo à administração.</h2>
          <p style={{margin:0,color:"#a8c2d2",lineHeight:1.6}}>Conta: <strong style={{color:"#effaff"}}>{email}</strong> · Perfil: <strong style={{color:"#7de4ff"}}>{profile?.role}</strong> · Plano: {profile?.plan}</p>
        </section>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(230px,1fr))",gap:16,marginTop:22}}>
          {items.map(({icon:Icon,title,detail})=><article key={title} style={{border:"1px solid #1d3c51",background:"#0c1c2b",borderRadius:16,padding:20,minHeight:140}}>
            <div style={{width:38,height:38,borderRadius:11,display:"grid",placeItems:"center",background:"#12344a",color:"#78dfff"}}><Icon size={20}/></div>
            <h3 style={{fontSize:17,margin:"15px 0 6px"}}>{title}</h3>
            <p style={{fontSize:13,color:"#a6bfce",margin:0}}>Em preparação: {detail.toLowerCase()}.</p>
          </article>)}
        </div>
        <p style={{color:"#7896a8",fontSize:12,lineHeight:1.6,marginTop:24}}>Área administrativa privada. As operações sobre outras contas serão liberadas após a conexão de verificações de permissão no servidor.</p>
      </div>
    </main>
  );
}
