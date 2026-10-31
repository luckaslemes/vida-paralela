"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ReturnContent() {
  const params = useSearchParams();
  const status = params.get("status");
  const title = status === "failure" ? "Pagamento não concluído" : status === "pending" ? "Assinatura em análise" : "Retorno recebido";
  const message = status === "failure"
    ? "Você pode voltar e tentar novamente. Nenhuma cobrança foi confirmada nesta tela."
    : "O Mercado Pago recebeu seu retorno. A ativação do Premium acontece somente após a confirmação segura da assinatura pelo servidor.";
  return <main style={{minHeight:"100vh",display:"grid",placeItems:"center",padding:24,background:"#f5f8ff",fontFamily:"Arial,sans-serif",color:"#172b4d"}}>
    <section style={{maxWidth:520,width:"100%",background:"#fff",padding:32,borderRadius:22,boxShadow:"0 18px 60px rgba(31,75,130,.10)"}}>
      <div style={{color:"#3975d7",fontSize:12,fontWeight:800,letterSpacing:".12em"}}>VIDA PARALELA</div>
      <h1 style={{fontSize:30,margin:"12px 0"}}>{title}</h1>
      <p style={{color:"#64748b",lineHeight:1.7}}>{message}</p>
      <Link href="/" style={{display:"inline-block",marginTop:18,background:"#2563eb",color:"#fff",padding:"13px 18px",borderRadius:10,textDecoration:"none",fontWeight:800}}>Voltar ao aplicativo</Link>
    </section>
  </main>;
}

export default function SubscriptionReturnPage() {
  return <Suspense fallback={<main style={{padding:32}}>Carregando...</main>}><ReturnContent /></Suspense>;
}
