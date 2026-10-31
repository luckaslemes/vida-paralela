"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";

export default function SimulatorPage() {
  const [decision, setDecision] = useState("");
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [optionC, setOptionC] = useState("");
  const [show, setShow] = useState(false);

  function compare(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setShow(true);
  }

  return (
    <main style={{minHeight:"100vh",background:"#f7f9fc",padding:"32px 18px",color:"#17253a",fontFamily:"Arial,sans-serif"}}>
      <div style={{maxWidth:980,margin:"0 auto"}}>
        <Link href="/" style={{display:"inline-flex",gap:8,alignItems:"center",color:"#2878d7",textDecoration:"none",fontWeight:700,fontSize:13}}><ArrowLeft size={16}/> Voltar ao painel</Link>
        <div style={{marginTop:34,background:"#fff",border:"1px solid #e8edf4",borderRadius:20,padding:28,boxShadow:"0 12px 35px rgba(30,80,140,.06)"}}>
          <div style={{color:"#2878d7",fontSize:11,fontWeight:800,letterSpacing:".13em",display:"flex",gap:8,alignItems:"center"}}><Sparkles size={15}/> SIMULADOR DE REALIDADES</div>
          <h1 style={{fontSize:34,letterSpacing:"-.04em",margin:"12px 0"}}>Compare caminhos antes de decidir.</h1>
          <p style={{color:"#718096",lineHeight:1.6,maxWidth:700}}>Descreva uma decisão e registre até três caminhos possíveis. Esta primeira versão organiza sua comparação; ainda não usa inteligência artificial nem salva os dados na conta.</p>
          <form onSubmit={compare} style={{display:"grid",gap:16,marginTop:26}}>
            <label style={label}>Qual decisão você está considerando?<textarea required value={decision} onChange={e=>{setDecision(e.target.value);setShow(false);}} placeholder="Ex.: mudar de emprego, começar um negócio, fazer um curso..." style={field}/></label>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:14}}>
              <label style={label}>REALIDADE A — continuar como está<textarea required value={optionA} onChange={e=>{setOptionA(e.target.value);setShow(false);}} placeholder="O que acontece se eu continuar?" style={field}/></label>
              <label style={label}>REALIDADE B — mudar de caminho<textarea required value={optionB} onChange={e=>{setOptionB(e.target.value);setShow(false);}} placeholder="Qual seria a alternativa?" style={field}/></label>
              <label style={label}>REALIDADE C — outra possibilidade<textarea required value={optionC} onChange={e=>{setOptionC(e.target.value);setShow(false);}} placeholder="Existe um terceiro caminho?" style={field}/></label>
            </div>
            <button type="submit" style={{background:"#2878d7",color:"#fff",border:0,borderRadius:10,padding:"14px 18px",fontWeight:800,cursor:"pointer"}}>Comparar minhas possibilidades</button>
          </form>
          {show && <section style={{marginTop:26,borderTop:"1px solid #e8edf4",paddingTop:22}}>
            <h2 style={{fontSize:20}}>Sua comparação</h2>
            <p style={{color:"#718096",fontSize:13}}>Decisão: {decision}</p>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:12}}>
              {[["REALIDADE A",optionA],["REALIDADE B",optionB],["REALIDADE C",optionC]].map(([title,value])=><article key={title} style={{background:"#f7faff",border:"1px solid #e2ecf8",borderRadius:12,padding:16}}><strong style={{color:"#2878d7",fontSize:11}}>{title}</strong><p style={{whiteSpace:"pre-wrap",lineHeight:1.6,fontSize:14}}>{value}</p></article>)}
            </div>
            <p style={{fontSize:12,color:"#718096",marginTop:16}}>Próximo passo: avalie custos, tempo, riscos, benefícios e o que ainda precisa descobrir em cada caminho.</p>
          </section>}
        </div>
      </div>
    </main>
  );
}

const label: React.CSSProperties = {display:"grid",gap:8,fontSize:13,fontWeight:700,color:"#334155"};
const field: React.CSSProperties = {width:"100%",minHeight:105,resize:"vertical",padding:13,border:"1px solid #dbe4f0",borderRadius:10,font:"14px Arial",boxSizing:"border-box",marginTop:4};
