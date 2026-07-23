// Statistiche aggregate: dati di tutti i ristoranti

const { useState: useStateStat } = React;

function AdmStatistichePage() {
  const [periodo, setPeriodo] = useStateStat('30g');
  const periodi = [{id:'7g',l:'7 giorni'},{id:'30g',l:'30 giorni'},{id:'90g',l:'90 giorni'},{id:'12m',l:'12 mesi'}];

  const totOrdini = LOCALI.reduce((s,l)=>s+l.ordiniMese,0);
  const totPreno = LOCALI.reduce((s,l)=>s+l.prenotazioniMese,0);
  const totFatturato = LOCALI.reduce((s,l)=>s+l.ordiniMese * l.ticketMedio,0);
  const totRecensioni = Math.round(totOrdini * 0.08);

  return (
    <div style={{padding:28, display:'flex', flexDirection:'column', gap:18}}>
      {/* Period selector */}
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <div style={{display:'flex', gap:6, background:'#fff', padding:4, borderRadius:9, border:`1px solid ${ADM.BORDER}`}}>
          {periodi.map(p => (
            <button key={p.id} onClick={()=>setPeriodo(p.id)} style={{
              padding:'6px 14px',
              background: periodo===p.id ? ADM.TEXT : 'transparent',
              color: periodo===p.id ? '#fff' : ADM.MUTED,
              border:'none', borderRadius:6,
              fontSize:13.7, fontWeight:600, cursor:'pointer', fontFamily:'inherit',
            }}>{p.l}</button>
          ))}
        </div>
        <div style={{display:'flex', gap:8}}>
          <AdmButton variant="secondary" size="sm" icon="calendar">Confronta con periodo precedente</AdmButton>
          <AdmButton variant="secondary" size="sm" icon="download">Esporta report</AdmButton>
        </div>
      </div>

      {/* KPIs */}
      <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:14}}>
        <AdmKpiCard label="Ordini" value={fmtNum(totOrdini)} sub={`${fmtNum(Math.round(totOrdini/30))}/giorno`} trend={+14} icon="receipt" accent="PINK"/>
        <AdmKpiCard label="Prenotazioni" value={fmtNum(totPreno)} sub={`${fmtNum(Math.round(totPreno/30))}/giorno`} trend={+8} icon="calendar" accent="INFO"/>
        <AdmKpiCard label="Fatturato totale" value={fmtEur(totFatturato)} sub={fmtEur(Math.round(totFatturato/30)) + '/giorno'} trend={+11} icon="money" accent="OK"/>
        <AdmKpiCard label="Recensioni" value={fmtNum(totRecensioni)} sub="Media 4.6 stelle" trend={+22} icon="star" accent="PURPLE"/>
      </div>

      {/* Big chart + breakdown */}
      <div style={{display:'grid', gridTemplateColumns:'2fr 1fr', gap:14}}>
        <AdmCard padding={22}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:18}}>
            <div>
              <div style={{fontSize:15.1, fontWeight:600, color:ADM.TEXT}}>Ordini & Prenotazioni · ultimi 30 giorni</div>
              <div style={{fontSize:13.7, color:ADM.MUTED, marginTop:2}}>Aggregato di tutti i locali</div>
            </div>
            <div style={{display:'flex', gap:14}}>
              <Legend color={ADM.PINK} label="Ordini"/>
              <Legend color={ADM.INFO} label="Prenotazioni"/>
            </div>
          </div>
          <DualLineChart height={220}/>
        </AdmCard>

        <AdmCard padding={22}>
          <div style={{fontSize:15.1, fontWeight:600, color:ADM.TEXT, marginBottom:14}}>Distribuzione oraria</div>
          <div style={{fontSize:13.3, color:ADM.MUTED, marginBottom:12}}>Ordini per fascia oraria</div>
          <div style={{display:'flex', flexDirection:'column', gap:7}}>
            {[
              {h:'07-10', v:8, l:'Colazione'},
              {h:'10-12', v:3, l:''},
              {h:'12-15', v:42, l:'Pranzo'},
              {h:'15-18', v:6, l:''},
              {h:'18-21', v:28, l:'Aperitivo'},
              {h:'21-24', v:13, l:'Cena'},
            ].map(s => (
              <div key={s.h} style={{display:'flex', alignItems:'center', gap:10}}>
                <div style={{width:48, fontSize:13, color:ADM.MUTED, fontFamily:'ui-monospace,monospace'}}>{s.h}</div>
                <div style={{flex:1, height:18, background:'#F4F5F7', borderRadius:4, position:'relative', overflow:'hidden'}}>
                  <div style={{width:`${s.v*2}%`, height:'100%', background:ADM.PINK, borderRadius:4}}/>
                </div>
                <div style={{width:40, fontSize:13, color:ADM.TEXT, fontWeight:600, textAlign:'right'}}>{s.v}%</div>
              </div>
            ))}
          </div>
        </AdmCard>
      </div>

      {/* Top piatti + Top locali */}
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:14}}>
        <AdmCard padding={22}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14}}>
            <div style={{fontSize:15.1, fontWeight:600, color:ADM.TEXT}}>Piatti più ordinati</div>
            <span style={{fontSize:13.3, color:ADM.MUTED}}>Top 8 di {fmtNum(2840)}</span>
          </div>
          <div style={{display:'flex', flexDirection:'column', gap:9}}>
            {TOP_PIATTI.map((p, i) => (
              <div key={i} style={{display:'flex', alignItems:'center', gap:12, padding:'4px 0'}}>
                <div style={{width:18, textAlign:'center', fontSize:13.7, color:ADM.MUTED_SOFT, fontWeight:700}}>{i+1}</div>
                <div style={{flex:1, minWidth:0}}>
                  <div style={{fontSize:14, color:ADM.TEXT, fontWeight:500, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{p.nome}</div>
                  <div style={{fontSize:13, color:ADM.MUTED}}>{p.categoria} · {p.locali} locali</div>
                </div>
                <div style={{fontSize:14.4, fontWeight:600, color:ADM.TEXT, minWidth:60, textAlign:'right'}}>{fmtNum(p.ordini)}</div>
                <div style={{minWidth:46, textAlign:'right'}}>
                  <span style={{fontSize:13, fontWeight:600, color: p.trend>=0 ? ADM.OK : ADM.DANGER, display:'inline-flex', alignItems:'center', gap:2}}>
                    {p.trend>=0 ? '↑' : '↓'} {Math.abs(p.trend)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </AdmCard>

        <AdmCard padding={22}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14}}>
            <div style={{fontSize:15.1, fontWeight:600, color:ADM.TEXT}}>Locali con più ordini</div>
            <span style={{fontSize:13.3, color:ADM.MUTED}}>Mese corrente</span>
          </div>
          <div style={{display:'flex', flexDirection:'column', gap:9}}>
            {[...LOCALI].filter(l=>l.stato==='active').sort((a,b)=>b.ordiniMese-a.ordiniMese).slice(0,8).map((l, i) => (
              <div key={l.id} style={{display:'flex', alignItems:'center', gap:12, padding:'4px 0'}}>
                <div style={{width:18, textAlign:'center', fontSize:13.7, color:ADM.MUTED_SOFT, fontWeight:700}}>{i+1}</div>
                <div style={{
                  width:28, height:28, borderRadius:7,
                  background:`hsl(${(l.id.charCodeAt(1)+l.id.charCodeAt(3))*3 % 360}, 35%, 55%)`,
                  color:'#fff', display:'grid', placeItems:'center', fontWeight:700, fontSize:13,
                }}>{l.nome.split(' ').slice(0,2).map(s=>s[0]).join('').toUpperCase()}</div>
                <div style={{flex:1, minWidth:0}}>
                  <div style={{fontSize:14, color:ADM.TEXT, fontWeight:500, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{l.nome}</div>
                  <div style={{fontSize:13, color:ADM.MUTED}}>{l.citta}</div>
                </div>
                <div style={{textAlign:'right'}}>
                  <div style={{fontSize:14.4, fontWeight:600, color:ADM.TEXT}}>{fmtNum(l.ordiniMese)}</div>
                  <div style={{fontSize:12.6, color:ADM.MUTED}}>{fmtEur(l.ordiniMese * l.ticketMedio)}</div>
                </div>
              </div>
            ))}
          </div>
        </AdmCard>
      </div>

      {/* Schermate + Distribuzione geografica */}
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:14}}>
        <AdmCard padding={22}>
          <div style={{fontSize:15.1, fontWeight:600, color:ADM.TEXT, marginBottom:14}}>Schermate più utilizzate · gestionale</div>
          <div style={{display:'flex', flexDirection:'column', gap:11}}>
            {SCREENS_USAGE.map((s, i) => (
              <div key={i}>
                <div style={{display:'flex', justifyContent:'space-between', marginBottom:5}}>
                  <span style={{fontSize:14, color:ADM.TEXT, fontWeight:500}}>{s.nome}</span>
                  <span style={{fontSize:13.3, color:ADM.MUTED}}>
                    <span style={{fontWeight:600, color:ADM.TEXT}}>{fmtNum(s.visite)}</span> visite · {s.pct}% utenti
                  </span>
                </div>
                <div style={{height:6, background:'#F4F5F7', borderRadius:99, overflow:'hidden'}}>
                  <div style={{width:`${s.pct}%`, height:'100%', background:`linear-gradient(90deg, ${ADM.PINK}, ${ADM.PINK_DARK})`, borderRadius:99}}/>
                </div>
              </div>
            ))}
          </div>
        </AdmCard>

        <AdmCard padding={22}>
          <div style={{fontSize:15.1, fontWeight:600, color:ADM.TEXT, marginBottom:14}}>Distribuzione per regione</div>
          <div style={{display:'flex', flexDirection:'column', gap:8}}>
            {REGIONI.map((r, i) => {
              const n = LOCALI.filter(l=>l.regione===r).length;
              const pct = (n/LOCALI.length) * 100;
              return (
                <div key={r} style={{display:'flex', alignItems:'center', gap:10}}>
                  <div style={{width:120, fontSize:13.7, color:ADM.TEXT, fontWeight:500}}>{r}</div>
                  <div style={{flex:1, height:16, background:'#F4F5F7', borderRadius:4, overflow:'hidden'}}>
                    <div style={{width:`${pct*3}%`, height:'100%', background: i%2===0 ? ADM.INFO : ADM.PURPLE, borderRadius:4}}/>
                  </div>
                  <div style={{width:50, fontSize:13.3, color:ADM.TEXT, fontWeight:600, textAlign:'right'}}>{n} loc.</div>
                  <div style={{width:42, fontSize:12.6, color:ADM.MUTED, textAlign:'right'}}>{Math.round(pct)}%</div>
                </div>
              );
            })}
          </div>
        </AdmCard>
      </div>
    </div>
  );
}

function Legend({ color, label }) {
  return (
    <div style={{display:'inline-flex', alignItems:'center', gap:6, fontSize:13.3, color:ADM.MUTED, fontWeight:500}}>
      <span style={{width:9, height:9, borderRadius:'50%', background:color}}/>
      {label}
    </div>
  );
}

function DualLineChart({ height = 200 }) {
  const ordini = [120, 135, 142, 138, 155, 168, 174, 182, 195, 188, 210, 225, 218, 240, 232, 245, 258, 251, 270, 282, 275, 290, 305, 298, 312, 325, 318, 340, 335, 350];
  const preno = [35, 40, 38, 42, 48, 52, 55, 50, 58, 62, 65, 60, 68, 72, 70, 75, 78, 72, 80, 85, 82, 88, 92, 88, 95, 98, 92, 105, 100, 110];
  const max = Math.max(...ordini);
  const W = 700, H = height;
  const pathOrdini = ordini.map((v,i)=>`${i===0?'M':'L'} ${(i/(ordini.length-1))*W} ${H-(v/max)*H}`).join(' ');
  const pathPreno = preno.map((v,i)=>`${i===0?'M':'L'} ${(i/(preno.length-1))*W} ${H-(v/max)*H}`).join(' ');
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{width:'100%', height, display:'block'}}>
      <defs>
        <linearGradient id="gradOrd" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={ADM.PINK} stopOpacity="0.15"/>
          <stop offset="100%" stopColor={ADM.PINK} stopOpacity="0"/>
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75, 1].map(y => (
        <line key={y} x1={0} x2={W} y1={H*y} y2={H*y} stroke="#F0F1F3" strokeDasharray="3 3"/>
      ))}
      <path d={`${pathOrdini} L ${W} ${H} L 0 ${H} Z`} fill="url(#gradOrd)"/>
      <path d={pathOrdini} fill="none" stroke={ADM.PINK} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round"/>
      <path d={pathPreno} fill="none" stroke={ADM.INFO} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round"/>
    </svg>
  );
}

window.AdmStatistichePage = AdmStatistichePage;
