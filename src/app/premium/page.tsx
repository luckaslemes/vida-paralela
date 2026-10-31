"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function PremiumPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function subscribe() {
    setError("");
    if (!supabase) { setError("O serviço de login ainda não está configurado."); return; }
    setLoading(true);
    try {
      const { data } = await supabase.auth.getSession();
      if (!data.session) { router.push("/login"); return; }
      const response = await fetch("/api/mercadopago/subscribe", {
        method: "POST",
        headers: { Authorization: "Bearer " + data.session.access_token },
      });
      const result = await response.json();
      if (!response.ok || !result.checkoutUrl) throw new Error(result.error || "Não foi possível abrir o pagamento.");
      window.location.assign(result.checkoutUrl);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao iniciar assinatura.");
      setLoading(false);
    }
  }

  return <main style={{minHeight:"100vh",background:"#f5f8ff",padding:24,fontFamily:"Arial,sans-serif",color:"#172b4d",display:"grid",placeItems:"center"}}>
    <section style={{width:"100%",maxWidth:560,background:"#fff",padding:32,borderRadius:24,boxShadow:"0 18px 60px rgba(31,75,130,.10)"}}>
      <Link href="/" style={{color:"#2563eb",fontWeight:800,textDecoration:"none"}}>← VIDA PARALELA</Link>
      <div style={{marginTop:28,color:"#3975d7",fontSize:12,fontWeight:800,letterSpacing:".12em"}}>MAIS POSSIBILIDADES PARA VOCÊ</div>
      <h1 style={{fontSize:34,margin:"10px 0"}}>VIDA PARALELA Premium</h1>
      <p style={{color:"#64748b",lineHeight:1.6}}>Acesse recursos avançados para explorar cenários, organizar seus objetivos e acompanhar suas decisões.</p>
      <div style={{border:"1px solid #dbeafe",borderRadius:18,padding:22,margin:"24px 0"}}>
        <div style={{fontSize:14,color:"#64748b"}}>Assinatura mensal</div>
        <div style={{fontSize:38,fontWeight:800,margin:"6px 0"}}>R$ 29,90 <span style={{fontSize:15,fontWeight:500,color:"#64748b"}}>/ mês</span></div>
        <div style={{color:"#047857",fontWeight:700,fontSize:14}}>3 dias de período de teste</div>
      </div>
      <ul style={{color:"#475569",lineHeight:2,paddingLeft:20}}>
        <li>Ferramentas avançadas de planejamento</li>
        <li>Mais recursos para comparar possibilidades</li>
        <li>Experiência Premium em evolução</li>
      </ul>
      <button onClick={subscribe} disabled={loading} style={{width:"100%",border:0,borderRadius:12,padding:15,background:"#2563eb",color:"#fff",fontSize:16,fontWeight:800,cursor:loading?"wait":"pointer",marginTop:14}}>{loading?"Conectando ao Mercado Pago...":"Experimentar Premium"}</button>
      {error && <p role="alert" style={{color:"#b91c1c",background:"#fef2f2",padding:12,borderRadius:10,fontSize:14}}>{error}</p>}
      <p style={{fontSize:12,color:"#94a3b8",lineHeight:1.6,marginTop:18}}>A assinatura será processada pelo Mercado Pago. A cobrança e o acesso dependem da confirmação do provedor. Você poderá revisar as condições antes de autorizar.</p>
    </section>
  </main>;
}
