"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles, Loader2, RefreshCw } from "lucide-react";

type Scenario = {
  name: string;
  description: string;
  opportunities: string[];
  risks: string[];
  first_steps: string[];
  short_term: string;
  long_term: string;
  confidence: string;
};
type Result = { title: string; summary: string; scenarios: { A: Scenario; B: Scenario; C: Scenario } };

export default function SimulatorPage() {
  const [decision, setDecision] = useState("");
  const [context, setContext] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function generate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const response = await fetch("/api/ai/scenarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision, context }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Não foi possível gerar as realidades.");
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{minHeight:"100vh",background:"#f7f9fc",padding:"32px 18px",color:"#17253a",fontFamily:"Arial,sans-serif"}}>
      <div style={{maxWidth:1050,margin:"0 auto"}}>
        <Link href="/" style={{display:"inline-flex",gap:8,alignItems:"center",color:"#2878d7",textDecoration:"none",fontWeight:700,fontSize:13}}><ArrowLeft size={16}/> Voltar ao painel</Link>
        <div style={{marginTop:34,background:"#fff",border:"1px solid #e8edf4",borderRadius:20,padding:28,boxShadow:"0 12px 35px rgba(30,80,140,.06)"}}>
          <div style={{color:"#2878d7",fontSize:11,fontWeight:800,letterSpacing:".13em",display:"flex",gap:8,alignItems:"center"}}><Sparkles size={15}/> SIMULADOR DE REALIDADES COM IA</div>
          <h1 style={{fontSize:34,letterSpacing:"-.04em",margin:"12px 0"}}>Imagine caminhos antes de decidir.</h1>
          <p style={{color:"#718096",lineHeight:1.6,maxWidth:760}}>Você descreve somente a decisão. A inteligência artificial cria automaticamente as realidades A, B e C, com oportunidades, riscos e primeiros passos. São simulações hipotéticas, não previsões garantidas.</p>
          <form onSubmit={generate} style={{display:"grid",gap:16,marginTop:26}}>
            <label style={label}>Qual decisão você está considerando?
              <textarea required minLength={10} maxLength={2000} value={decision} onChange={e=>setDecision(e.target.value)} placeholder="Ex.: Estou pensando em sair do meu emprego para abrir um pequeno negócio..." style={field}/>
            </label>
            <label style={label}>Quer dar algum contexto? (opcional)
              <textarea maxLength={2000} value={context} onChange={e=>setContext(e.target.value)} placeholder="Ex.: Tenho uma reserva financeira, pago aluguel e tenho pouco tempo livre..." style={{...field,minHeight:75}}/>
            </label>
            <button type="submit" disabled={loading} style={{display:"flex",justifyContent:"center",alignItems:"center",gap:9,background:loading?"#8bb8e8":"#2878d7",color:"#fff",border:0,borderRadius:10,padding:"14px 18px",fontWeight:800,cursor:loading?"wait":"pointer"}}>
              {loading ? <><Loader2 size={17} /> Criando suas realidades...</> : <><Sparkles size={17} /> Gerar realidades A, B e C</>}
            </button>
          </form>
          {error && <p role="alert" style={{marginTop:18,padding:14,background:"#fff4f2",border:"1px solid #ffd5ce",borderRadius:10,color:"#a33b2c",fontSize:14}}>{error}</p>}
          {result && <section style={{marginTop:30,borderTop:"1px solid #e8edf4",paddingTop:24}}>
            <div style={{display:"flex",justifyContent:"space-between",gap:12,alignItems:"center",flexWrap:"wrap"}}>
              <div><div style={{fontSize:11,fontWeight:800,color:"#2878d7",letterSpacing:".1em"}}>ANÁLISE GERADA PELA IA</div><h2 style={{fontSize:24,margin:"8px 0"}}>{result.title || "Suas três realidades"}</h2></div>
              <button onClick={()=>{setResult(null);}} style={{display:"flex",alignItems:"center",gap:7,background:"#eef5ff",color:"#2878d7",border:0,borderRadius:9,padding:"10px 12px",fontWeight:700,cursor:"pointer"}}><RefreshCw size={15}/> Nova simulação</button>
            </div>
            <p style={{color:"#64748b",lineHeight:1.65}}>{result.summary}</p>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(245px,1fr))",gap:14,marginTop:18}}>
              {(["A","B","C"] as const).map(key=>{
                const s=result.scenarios[key];
                return <article key={key} style={{background:"#f8fbff",border:"1px solid #e2ecf8",borderRadius:14,padding:18}}>
                  <div style={{fontSize:11,fontWeight:900,color:"#2878d7",letterSpacing:".1em"}}>REALIDADE {key}</div>
                  <h3 style={{fontSize:19,margin:"8px 0"}}>{s.name}</h3>
                  <p style={{fontSize:14,lineHeight:1.6,color:"#475569"}}>{s.description}</p>
                  <Section title="Oportunidades" items={s.opportunities}/>
                  <Section title="Riscos" items={s.risks}/>
                  <Section title="Primeiros passos" items={s.first_steps}/>
                  <div style={{borderTop:"1px solid #dce8f5",marginTop:14,paddingTop:12,fontSize:13,lineHeight:1.6}}><b>Curto prazo:</b> {s.short_term}<br/><b>Longo prazo:</b> {s.long_term}<br/><b>Confiança da análise:</b> {s.confidence}</div>
                </article>;
              })}
            </div>
            <p style={{fontSize:12,color:"#718096",marginTop:18}}>As realidades são hipóteses construídas a partir das informações fornecidas. Resultados reais dependem de fatores pessoais e externos que podem mudar.</p>
          </section>}
        </div>
      </div>
    </main>
  );
}

function Section({title,items}:{title:string;items:string[]}) {
  return <div style={{marginTop:14}}><strong style={{fontSize:12}}>{title}</strong><ul style={{paddingLeft:18,margin:"7px 0",fontSize:13,lineHeight:1.55,color:"#475569"}}>{(items || []).map((item,i)=><li key={i}>{item}</li>)}</ul></div>;
}

const label: React.CSSProperties = {display:"grid",gap:8,fontSize:13,fontWeight:700,color:"#334155"};
const field: React.CSSProperties = {width:"100%",minHeight:110,resize:"vertical",padding:13,border:"1px solid #dbe4f0",borderRadius:10,font:"14px Arial",boxSizing:"border-box",marginTop:4};
