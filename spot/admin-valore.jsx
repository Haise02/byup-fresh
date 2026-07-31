// ════════════════════════════════════════════════════════════════════════════
// VALORE PER IL LOCALE · le viste
// ════════════════════════════════════════════════════════════════════════════
//
// Una domanda sola: byup fa guadagnare chi lo usa? Sotto, in ordine: quanto,
// su cosa, da che punto in poi, a chi, e con chi parlarne domani. Il modello —
// e tutta la discussione sul metodo — sta in admin-valore-data.jsx.

const valNum = (v, dec = 0) => Number(v).toLocaleString('it-IT', { minimumFractionDigits: dec, maximumFractionDigits: dec });
const valEur = (v, dec = 0) => '€ ' + valNum(v, dec);
const valSegno = (v, dec = 1) => {
  const arrotondato = Number(Math.abs(v).toFixed(dec));
  if (arrotondato === 0) return '0%';                       // niente «−0%»
  return (v >= 0 ? '+' : '−') + valNum(arrotondato, dec) + '%';
};
const valConUnita = (v, ind) => ind.unita === '€' ? valEur(v, ind.dec)
  : ind.unita === '%' ? valNum(v, ind.dec) + '%'
  : ind.unita === '×' ? valNum(v, ind.dec) + '×'
  : ind.unita === 'min' ? valNum(v, ind.dec) + '′'
  : valNum(v, ind.dec);
// «Meglio» non è sempre «di più»: sul tempo e sul costo il segno buono è il meno.
const valTono = (d, ind) => Math.abs(d) < 0.5 ? ADM.MUTED_LIGHT
  : (ind.verso === 'su' ? d > 0 : d < 0) ? ADM.OK : ADM.DANGER;

const VAL_MONO = 'ui-monospace, SFMono-Regular, Menlo, monospace';

// Una formula si legge come una formula, quindi va scritta come una formula.
function ValFormula({ children, chiaro }) {
  return (
    <span style={{
      fontFamily: VAL_MONO, fontSize:11.6, letterSpacing:'-0.01em',
      color: chiaro ? ADM.MUTED_SOFT : ADM.MUTED,
      background: chiaro ? 'transparent' : ADM.NEUTRAL_SOFT,
      padding: chiaro ? 0 : '2px 6px', borderRadius:5, whiteSpace:'nowrap',
    }}>{children}</span>
  );
}

function ValCard({ titolo, sotto, destra, children, piede }) {
  return (
    <AdmCard padding={0}>
      <div style={{padding:'15px 22px 13px', borderBottom:`1px solid ${ADM.BORDER}`, display:'flex', justifyContent:'space-between', alignItems:'center', gap:16, flexWrap:'wrap'}}>
        <div style={{minWidth:0}}>
          <div style={{fontSize:14.8, fontWeight:700, color:ADM.TEXT, letterSpacing:'-0.01em'}}>{titolo}</div>
          {sotto && <div style={{fontSize:12.8, color:ADM.MUTED, marginTop:3}}>{sotto}</div>}
        </div>
        {destra}
      </div>
      {children}
      {piede && (
        <div style={{padding:'12px 22px', borderTop:`1px solid ${ADM.BORDER_SOFT}`, background:ADM.PANEL_SOFT, fontSize:12.6, color:ADM.MUTED, lineHeight:1.5}}>
          {piede}
        </div>
      )}
    </AdmCard>
  );
}

// ═══════════ 1 · Il numero ══════════════════════════════════════════════════
function ValHero() {
  const ric = VAL_PREPOST.find(i => i.k === 'ricavoMese');
  const C = VAL_CONTO;
  const vincono = ric.n - ric.senzaEffetto;
  return (
    <AdmCard padding={0} style={{overflow:'hidden'}}>
      <div style={{display:'grid', gridTemplateColumns:'minmax(290px, 0.8fr) 1.2fr'}}>
        {/* Il numero, e basta */}
        <div style={{padding:'30px 28px', background:`linear-gradient(160deg, ${ADM.PINK_BG_SOFT}, #fff 78%)`, borderRight:`1px solid ${ADM.BORDER_SOFT}`}}>
          <div style={{fontSize:12.2, fontWeight:700, color:ADM.PINK_DARK, textTransform:'uppercase', letterSpacing:'0.07em'}}>
            Ricavo mensile
          </div>
          <div style={{fontSize:70, fontWeight:800, color:ADM.TEXT, letterSpacing:'-0.045em', lineHeight:1, margin:'10px 0 4px'}}>
            {valSegno(ric.delta)}
          </div>
          <div style={{fontSize:14.4, color:ADM.TEXT, fontWeight:600}}>
            {valEur(C.ricavoAggiuntivo)} in più al mese
          </div>
          <div style={{marginTop:16, paddingTop:14, borderTop:`1px solid ${ADM.PINK_SOFT}`}}>
            <ValFormula>(dopo − prima) ÷ prima − deriva</ValFormula>
            <div style={{fontSize:12.6, color:ADM.MUTED, marginTop:9, lineHeight:1.55}}>
              Mediana di <strong style={{color:ADM.TEXT}}>{ric.n} locali</strong> misurati prima e dopo aver superato
              il <strong style={{color:ADM.TEXT}}>{VAL_SOGLIA}%</strong> di ordini digitali, su {valEur(C.ricavoMedianoBase)} di partenza.
              La deriva è quanto si è mosso, nello stesso periodo, chi la soglia non l'ha superata.
            </div>
          </div>
        </div>

        {/* Cosa ne resta in tasca, e a quanti */}
        <div style={{padding:'26px 28px', display:'flex', flexDirection:'column', gap:18}}>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:20}}>
            <div>
              <div style={{fontSize:12.2, fontWeight:700, color:ADM.MUTED, textTransform:'uppercase', letterSpacing:'0.06em'}}>Margine</div>
              <div style={{fontSize:30, fontWeight:800, color:ADM.OK, letterSpacing:'-0.03em', lineHeight:1.1, margin:'5px 0 6px'}}>{valEur(C.margineAggiuntivo)}</div>
              <ValFormula chiaro>ricavo in più × {C.margineLordo}% margine lordo</ValFormula>
            </div>
            <div>
              <div style={{fontSize:12.2, fontWeight:700, color:ADM.MUTED, textTransform:'uppercase', letterSpacing:'0.06em'}}>Canone</div>
              <div style={{fontSize:30, fontWeight:800, color:ADM.TEXT, letterSpacing:'-0.03em', lineHeight:1.1, margin:'5px 0 6px'}}>{valEur(C.canoneMediano, 2)}</div>
              <ValFormula chiaro>il {valNum(C.canoneSuMargine, 1)}% di quel margine</ValFormula>
            </div>
          </div>

          {/* Quanti hanno visto il ritorno, uno per barretta */}
          <div>
            <div style={{display:'flex', alignItems:'baseline', gap:8, marginBottom:8}}>
              <span style={{fontSize:19, fontWeight:800, color:ADM.TEXT, letterSpacing:'-0.02em'}}>{vincono} su {ric.n}</span>
              <span style={{fontSize:13, color:ADM.MUTED}}>hanno migliorato il ricavo · {ric.senzaEffetto} no</span>
            </div>
            <div style={{display:'flex', gap:5}}>
              {Array.from({length: ric.n}, (_, i) => (
                <span key={i} style={{
                  flex:1, height:9, borderRadius:3,
                  background: i < vincono ? ADM.OK : ADM.NEUTRAL_SOFT,
                  border: i < vincono ? 'none' : `1px solid ${ADM.BORDER}`,
                }}/>
              ))}
            </div>
          </div>

          <div style={{fontSize:12.6, color:ADM.MUTED, lineHeight:1.55, paddingTop:14, borderTop:`1px solid ${ADM.BORDER_SOFT}`}}>
            Su un locale piccolo il conto si sgonfia ma resta positivo: {valEur(C.piccolo.ricavo)} di ricavo → {valEur(C.piccolo.margine)} di margine
            contro {valEur(C.piccolo.canone, 2)} di Starter, cioè <strong style={{color:ADM.TEXT}}>{valNum(C.piccolo.volte, 1)}×</strong> invece
            di {valNum(C.ritornoPerEuro, 0)}× — la rete di oggi è fatta di locali grandi, e su quelli qualunque canone sparisce.
          </div>
        </div>
      </div>
    </AdmCard>
  );
}

// ═══════════ 2 · Il confronto ═══════════════════════════════════════════════
// Un dot plot per riga: la stessa differenza misurata in tre modi, sulla stessa
// scala. Più il pallino vuoto è lontano da quello pieno, più il confronto
// ingenuo — adottanti contro non adottanti — sta esagerando.
const VAL_CHIAVE_PRE = {
  spesa:'spesaPre', coperti:'copertiPre', turni:'turniPre', tempo:'tempoPre',
  revpash:'revpashPre', costoSalaCoperto:'costoSalaCopertoPre', ritorno:'ritornoPre', ricavoMese:'ricavoMesePre',
};
function ValConfronto() {
  const post = (k) => valMediana(VAL_CROSSERS.map(l => l[k]));
  const pre = (k, delta) => post(k) / (1 + delta / 100);
  return (
    <ValCard
      titolo="Gli otto indicatori del conto economico di un locale"
      sotto="Ognuno con la sua formula, e la stessa differenza misurata in tre modi"
      destra={
        <div style={{display:'flex', gap:15, alignItems:'center', fontSize:12.2, color:ADM.MUTED}}>
          <span style={{display:'inline-flex', alignItems:'center', gap:6}}>
            <span style={{width:9, height:9, borderRadius:'50%', border:`1.5px solid ${ADM.MUTED_LIGHT}`, background:'#fff'}}/>grezzo
          </span>
          <span style={{display:'inline-flex', alignItems:'center', gap:6}}>
            <span style={{width:9, height:9, borderRadius:'50%', background:ADM.INK_SOFT}}/>appaiato
          </span>
          <span style={{display:'inline-flex', alignItems:'center', gap:6}}>
            <span style={{width:11, height:11, borderRadius:'50%', background:ADM.TEXT}}/><strong style={{color:ADM.TEXT}}>prima/dopo</strong>
          </span>
        </div>
      }
      piede={<>
        <strong style={{color:ADM.TEXT}}>Pieno</strong> = lo stesso locale prima e dopo, l'unica lettura attribuibile a noi.
        <strong style={{color:ADM.TEXT}}> Appaiato</strong> = adottante contro non adottante di pari volume.
        <strong style={{color:ADM.TEXT}}> Vuoto</strong> = i due gruppi come stanno: sulle grandezze di livello misura soprattutto che chi adotta è
        un locale più grande, e sul ricavo arriva a dire {valSegno(VAL_GREZZA.find(x => x.k === 'ricavoMese').delta, 0)}.
      </>}
    >
      {VAL_GREZZA.map((g, i) => {
        const ap = VAL_APPAIATA.find(x => x.k === g.k);
        const pp = VAL_PREPOST.find(x => x.k === g.k);
        const scala = Math.max(Math.abs(g.delta), Math.abs(ap.delta), Math.abs(pp.delta), 1);
        const x = (d) => 50 + (d / scala) * 46;
        const tono = valTono(pp.delta, g);
        return (
          <div key={g.k} style={{
            display:'grid', gridTemplateColumns:'minmax(0,2.05fr) 0.95fr minmax(140px,1.2fr) 0.58fr', columnGap:18,
            padding:'13px 22px', alignItems:'center',
            borderTop: i === 0 ? 'none' : `1px solid ${ADM.BORDER_SOFT}`,
          }}>
            <div style={{minWidth:0}}>
              <div style={{fontSize:14, color:ADM.TEXT, letterSpacing:'-0.005em', lineHeight:1.35}}>
                <strong style={{fontWeight:700}}>{g.label}</strong>
                <span style={{color:ADM.MUTED_SOFT, fontWeight:500}}> · {g.perche}</span>
              </div>
              <div style={{marginTop:5}}><ValFormula>{g.formula}</ValFormula></div>
            </div>

            {/* prima → dopo, dentro lo stesso locale */}
            <div style={{display:'flex', alignItems:'baseline', gap:7, justifyContent:'flex-end', fontVariantNumeric:'tabular-nums'}}>
              <span style={{fontSize:13.4, color:ADM.MUTED_SOFT}}>{valConUnita(pre(g.k, pp.delta), g)}</span>
              <span style={{fontSize:12, color:ADM.MUTED_LIGHT}}>→</span>
              <span style={{fontSize:15, fontWeight:700, color:ADM.TEXT}}>{valConUnita(post(g.k), g)}</span>
            </div>

            {/* le tre letture, sulla stessa scala */}
            <div style={{position:'relative', height:26}}>
              <div style={{position:'absolute', left:0, right:0, top:'50%', height:1, background:ADM.BORDER}}/>
              <div style={{position:'absolute', left:'50%', top:3, bottom:3, width:1, background:ADM.INK_SOFT}}/>
              <span style={{position:'absolute', left:`${x(g.delta)}%`, top:'50%', width:11, height:11, marginLeft:-5.5, marginTop:-5.5, borderRadius:'50%', background:'#fff', border:`1.5px solid ${ADM.MUTED_LIGHT}`}}/>
              <span style={{position:'absolute', left:`${x(ap.delta)}%`, top:'50%', width:10, height:10, marginLeft:-5, marginTop:-5, borderRadius:'50%', background:ADM.INK_SOFT}}/>
              <span style={{position:'absolute', left:`${x(pp.delta)}%`, top:'50%', width:13, height:13, marginLeft:-6.5, marginTop:-6.5, borderRadius:'50%', background:tono, boxShadow:'0 0 0 3px #fff'}}/>
            </div>

            <div style={{fontSize:17, fontWeight:800, color:tono, textAlign:'right', letterSpacing:'-0.02em', fontVariantNumeric:'tabular-nums'}}>
              {valSegno(pp.delta)}
            </div>
          </div>
        );
      })}
    </ValCard>
  );
}

// ═══════════ 3 · La curva ═══════════════════════════════════════════════════
function ValCurva() {
  const f = VAL_FASCE.filter(x => x.n > 0);
  const W = 820, H = 220, padX = 52, padY = 30;
  const serie = [
    { k:'ricavoMese', label:'Ricavo', colore:ADM.OK, dy:-13 },
    { k:'tempo', label:'Tempo di servizio', colore:ADM.INFO, dy:19 },
  ];
  const vals = serie.flatMap(s => f.map(b => b[s.k]));
  const lo = Math.min(...vals, 0) - 2, hi = Math.max(...vals, 0) + 3;
  const range = (hi - lo) || 1;
  const xFor = (i) => padX + (i / Math.max(1, f.length - 1)) * (W - padX * 2);
  const yFor = (v) => padY + (1 - (v - lo) / range) * (H - padY * 2);
  const iSoglia = f.findIndex(b => b.min >= VAL_SOGLIA);
  return (
    <ValCard
      titolo="Da che punto in poi il ritorno si vede"
      sotto="Variazione di ogni locale rispetto a sé stesso, mediana per fascia · così la taglia esce dal conto"
      destra={
        <div style={{display:'flex', gap:15}}>
          {serie.map(s => (
            <span key={s.k} style={{display:'inline-flex', alignItems:'center', gap:6, fontSize:12.4, color:ADM.TEXT, fontWeight:600}}>
              <span style={{width:16, height:3, borderRadius:2, background:s.colore}}/>{s.label}
            </span>
          ))}
        </div>
      }
      piede={<>L'effetto <strong style={{color:ADM.TEXT}}>satura</strong>: i primi punti di adozione valgono molto, dal 30% in su si guadagna poco altro.
        Per questo la soglia commerciale sta al {VAL_SOGLIA}% e non al 40% — è lì che il salto è quasi tutto fatto, ed è un obiettivo raggiungibile.</>}
    >
      <div style={{padding:'16px 22px 24px'}}>
        <svg viewBox={`0 0 ${W} ${H + 14}`} style={{width:'100%', height:250}}>
          {iSoglia > 0 && (() => {
            const x0 = (xFor(iSoglia - 1) + xFor(iSoglia)) / 2;
            return <g>
              <rect x={x0} y={padY - 12} width={W - padX / 2 - x0} height={H - padY * 2 + 24} fill={ADM.PINK} opacity="0.05"/>
              <line x1={x0} x2={x0} y1={padY - 12} y2={H - padY + 12} stroke={ADM.PINK_SOFT} strokeWidth="1.5" strokeDasharray="4 4"/>
              <text x={x0 + 8} y={padY - 2} fontSize="11.5" fill={ADM.PINK_DARK} fontWeight="700">soglia {VAL_SOGLIA}%</text>
            </g>;
          })()}
          <line x1={padX - 14} x2={W - padX / 2} y1={yFor(0)} y2={yFor(0)} stroke={ADM.BORDER} strokeDasharray="3 4"/>
          <text x={padX - 20} y={yFor(0) + 4} textAnchor="end" fontSize="11" fill={ADM.MUTED_SOFT} fontWeight="600">0%</text>
          {serie.map(s => (
            <g key={s.k}>
              <path d={f.map((b, i) => `${i === 0 ? 'M' : 'L'} ${xFor(i)} ${yFor(b[s.k])}`).join(' ')}
                fill="none" stroke={s.colore} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/>
              {f.map((b, i) => (
                <g key={i}>
                  <circle cx={xFor(i)} cy={yFor(b[s.k])} r="4.6" fill="#fff" stroke={s.colore} strokeWidth="2.4"/>
                  <text x={xFor(i)} y={yFor(b[s.k]) + s.dy} textAnchor="middle" fontSize="12" fill={s.colore} fontWeight="700">
                    {valSegno(b[s.k], 1)}
                  </text>
                </g>
              ))}
            </g>
          ))}
          {f.map((b, i) => (
            <g key={i}>
              <text x={xFor(i)} y={H - 2} textAnchor="middle" fontSize="12.5" fill={ADM.TEXT} fontWeight="700">{b.label}</text>
              <text x={xFor(i)} y={H + 12} textAnchor="middle" fontSize="11" fill={ADM.MUTED_SOFT}>{b.n} locali</text>
            </g>
          ))}
        </svg>
      </div>
    </ValCard>
  );
}

// ═══════════ 4 · La coda ════════════════════════════════════════════════════
function ValCoda() {
  const pp = VAL_PREPOST.find(i => i.k === 'ricavoMese');
  const dati = VAL_CROSSERS.map(l => ({
    id: l.id, nome: l.nome, adozione: l.adozione,
    delta: l.ricavoMesePre ? ((l.ricavoMese - l.ricavoMesePre) / l.ricavoMesePre) * 100 - pp.deriva : 0,
    euro: (l.ricavoMese - l.ricavoMesePre) * (VAL_CONTO.margineLordo / 100),
    canone: l.canone,
  })).sort((a, b) => b.delta - a.delta);
  const mx = Math.max(...dati.map(d => Math.abs(d.delta)), 1);
  const coprono = dati.filter(d => d.euro >= d.canone).length;
  return (
    <ValCard
      titolo="Locale per locale"
      sotto="La mediana, aperta · un numero da solo non si difende"
      destra={
        <div style={{display:'flex', alignItems:'center', gap:8, fontSize:12.4, color:ADM.MUTED}}>
          <span style={{width:8, height:8, borderRadius:'50%', background:ADM.OK}}/>
          <span><strong style={{color:ADM.TEXT}}>{coprono}</strong> coprono il canone</span>
          <span style={{width:8, height:8, borderRadius:'50%', background:ADM.WARN, marginLeft:8}}/>
          <span><strong style={{color:ADM.TEXT}}>{dati.length - coprono}</strong> no</span>
        </div>
      }
      piede={<>La cifra in euro è il <strong style={{color:ADM.TEXT}}>margine</strong> aggiuntivo mensile — quella da confrontare col canone, non il ricavo.</>}
    >
      <div style={{padding:'14px 22px 18px', display:'flex', flexDirection:'column', gap:7}}>
        {dati.map(d => {
          const copre = d.euro >= d.canone;
          return (
            <div key={d.id} style={{display:'flex', alignItems:'center', gap:12}}>
              <span style={{fontSize:13.2, color:ADM.TEXT, fontWeight:500, width:200, flexShrink:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{d.nome}</span>
              <span style={{fontSize:12.2, color:ADM.MUTED_SOFT, width:44, flexShrink:0, textAlign:'right', fontVariantNumeric:'tabular-nums'}}>{valNum(d.adozione, 0)}%</span>
              <div style={{flex:1, height:16, position:'relative'}}>
                <div style={{position:'absolute', left:'50%', top:0, bottom:0, width:1, background:ADM.BORDER}}/>
                <div style={{
                  position:'absolute', top:3, bottom:3, borderRadius:3,
                  background: d.delta >= 0 ? ADM.OK : ADM.DANGER,
                  opacity: Math.abs(d.delta) < 1 ? 0.4 : 1,
                  left: d.delta >= 0 ? '50%' : `${50 - (Math.abs(d.delta) / mx) * 50}%`,
                  width: `${Math.max(0.5, (Math.abs(d.delta) / mx) * 50)}%`,
                }}/>
              </div>
              <span style={{fontSize:13.4, fontWeight:700, color: d.delta >= 0 ? ADM.OK : ADM.DANGER, width:50, textAlign:'right', fontVariantNumeric:'tabular-nums'}}>{valSegno(d.delta, 0)}</span>
              <span style={{fontSize:12.8, color:ADM.MUTED, width:78, textAlign:'right', fontVariantNumeric:'tabular-nums'}}>{valEur(d.euro)}</span>
              <span style={{width:8, height:8, borderRadius:'50%', flexShrink:0, background: copre ? ADM.OK : ADM.WARN}}/>
            </div>
          );
        })}
      </div>
    </ValCard>
  );
}

// ═══════════ 5 · Il legame con l'abbandono ══════════════════════════════════
function ValChurn() {
  const C = VAL_CHURN;
  const barre = [
    { label:'Chi è attivo', v: C.adozioneMedianaAttivi, colore: ADM.OK },
    { label:'Chi si è fermato', v: C.adozioneMedianaInattivi, colore: ADM.WARN },
  ];
  const mx = Math.max(...barre.map(b => b.v), VAL_SOGLIA) * 1.2;
  return (
    <ValCard
      titolo="Lo stesso numero, letto come rischio"
      sotto="Adozione mediana · chi se ne va non ha quasi mai superato la soglia"
      piede={<>Con {C.churnedTot} disdette osservate la freccia potrebbe puntare al contrario: un locale che sta chiudendo smette anche di spingere il QR.
        Indizio forte, non ancora prova.</>}
    >
      <div style={{padding:'18px 22px 16px', display:'flex', flexDirection:'column', gap:14}}>
        <div style={{display:'flex', alignItems:'baseline', gap:10}}>
          <span style={{fontSize:32, fontWeight:800, color:ADM.DANGER, letterSpacing:'-0.03em', lineHeight:1}}>{C.motivoPct}%</span>
          <span style={{fontSize:13, color:ADM.MUTED, lineHeight:1.4}}>degli abbandoni dice <strong style={{color:ADM.TEXT}}>«scarse prenotazioni / ordini»</strong></span>
        </div>
        {barre.map(b => (
          <div key={b.label} style={{display:'flex', alignItems:'center', gap:12}}>
            <span style={{fontSize:13.4, color:ADM.TEXT, fontWeight:500, width:132, flexShrink:0}}>{b.label}</span>
            <div style={{flex:1, height:22, background:ADM.PANEL_SOFT, borderRadius:6, position:'relative', overflow:'hidden'}}>
              <div style={{position:'absolute', left:0, top:0, bottom:0, width:`${(b.v / mx) * 100}%`, background:b.colore, borderRadius:6}}/>
              <div style={{position:'absolute', left:`${(VAL_SOGLIA / mx) * 100}%`, top:0, bottom:0, width:2, background:ADM.INK}}/>
            </div>
            <span style={{fontSize:14.4, fontWeight:800, color:b.colore, width:48, textAlign:'right', fontVariantNumeric:'tabular-nums'}}>{valNum(b.v, 1)}%</span>
          </div>
        ))}
        <div style={{fontSize:12.4, color:ADM.MUTED, display:'flex', alignItems:'center', gap:8, paddingLeft:144}}>
          <span style={{width:2, height:12, background:ADM.INK, display:'inline-block', flexShrink:0}}/>
          soglia {VAL_SOGLIA}% · {C.inattiviSottoSoglia} dei {C.inattiviTot} locali fermi non l'hanno mai raggiunta
        </div>
      </div>
    </ValCard>
  );
}

// ═══════════ 6 · Con chi parlarne ═══════════════════════════════════════════
function ValPotenziale() {
  const tutti = VAL_POTENZIALE.filter(l => l.stato === 'active');
  const lista = tutti.slice(0, 8);
  const totale = tutti.reduce((s, l) => s + l.deltaMargine, 0);
  const mx = Math.max(...lista.map(l => l.deltaMargine), 1);
  return (
    <ValCard
      titolo="Con chi parlarne domani"
      sotto={`Attivi sotto il ${VAL_SOGLIA}%, in ordine di quanto guadagnerebbero a superarlo`}
      piede={<>La stima porta ciascuno al <strong style={{color:ADM.TEXT}}>18%</strong>, appena sopra soglia — non al 40%.
        È una priorità di chiamata, non un impegno da scrivere al cliente.</>}
    >
      <div style={{padding:'18px 22px 18px', display:'flex', flexDirection:'column', gap:9}}>
        <div style={{display:'flex', alignItems:'baseline', gap:10, marginBottom:4}}>
          <span style={{fontSize:32, fontWeight:800, color:ADM.OK, letterSpacing:'-0.03em', lineHeight:1}}>{valEur(totale)}</span>
          <span style={{fontSize:13, color:ADM.MUTED}}>di margine al mese in gioco, su {tutti.length} locali</span>
        </div>
        {lista.map(l => (
          <div key={l.id} style={{display:'flex', alignItems:'center', gap:11}}>
            <div style={{width:172, flexShrink:0, minWidth:0}}>
              <div style={{fontSize:13.2, fontWeight:600, color:ADM.TEXT, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{l.nome}</div>
              <div style={{fontSize:11.6, color:ADM.MUTED_SOFT}}>{l.tipo} · {l.citta}</div>
            </div>
            <span style={{fontSize:12.6, fontWeight:700, color: l.adozione < 5 ? ADM.DANGER : ADM.WARN, width:38, textAlign:'right', fontVariantNumeric:'tabular-nums'}}>{valNum(l.adozione, 0)}%</span>
            <span style={{fontSize:11.6, color:ADM.MUTED_LIGHT, flexShrink:0}}>→18%</span>
            <div style={{flex:1, height:10, background:ADM.PANEL_SOFT, borderRadius:99, overflow:'hidden'}}>
              <div style={{width:`${(l.deltaMargine / mx) * 100}%`, height:'100%', background:`linear-gradient(90deg, ${ADM.OK}88, ${ADM.OK})`, borderRadius:99}}/>
            </div>
            <span style={{fontSize:13.4, fontWeight:800, color:ADM.TEXT, width:74, textAlign:'right', fontVariantNumeric:'tabular-nums'}}>{valEur(l.deltaMargine)}</span>
          </div>
        ))}
      </div>
    </ValCard>
  );
}

// ═══════════ 7 · I limiti ═══════════════════════════════════════════════════
function ValLimiti() {
  const voci = [
    ['Non è un esperimento', 'l’adozione non è stata assegnata a caso: resta un’inferenza, per quanto solida'],
    ['I numeri sono piccoli', `${VAL_CROSSERS.length} locali con un prima/dopo, ${VAL_COPPIE.length} coppie appaiate`],
    ['Il margine è una media', 'il 68% è di rete: un locale con food cost al 42% ne vede meno'],
    ['Il passo che manca', 'attivare la soglia a scaglioni su locali simili e confrontare i due gruppi: un trimestre, e diventa prova'],
  ];
  return (
    <ValCard titolo="Cosa non dimostra" sotto="Da sapere prima di portarla dove qualcuno fa domande">
      <div style={{padding:'16px 22px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px 26px'}}>
        {voci.map(([t, d]) => (
          <div key={t} style={{display:'flex', gap:9, alignItems:'flex-start'}}>
            <span style={{width:5, height:5, borderRadius:'50%', background:ADM.MUTED_LIGHT, marginTop:7, flexShrink:0}}/>
            <div style={{fontSize:12.8, color:ADM.MUTED, lineHeight:1.5}}>
              <strong style={{color:ADM.TEXT}}>{t}:</strong> {d}
            </div>
          </div>
        ))}
      </div>
    </ValCard>
  );
}

// ═══════════ La tab ═════════════════════════════════════════════════════════
function DashValore() {
  return (
    <div style={{padding:'24px 28px', display:'flex', flexDirection:'column', gap:20}}>
      <SectionLabel first title="Il ritorno" desc={`Quanto guadagna in più un locale che porta gli ordini digitali oltre il ${VAL_SOGLIA}%`}/>
      <ValHero/>

      <SectionLabel title="Su cosa" desc="Gli indicatori, la formula di ciascuno, e di quanto si muovono"/>
      <ValConfronto/>

      <SectionLabel title="La curva" desc="Da che punto in poi si vede"/>
      <ValCurva/>

      <SectionLabel title="La coda" desc="Chi ci guadagna, chi no, e di quanto"/>
      <ValCoda/>

      <SectionLabel title="L'altra faccia" desc="Lo stesso numero come antidoto all'abbandono, e come lista di chiamate"/>
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, alignItems:'start'}}>
        <ValChurn/>
        <ValPotenziale/>
      </div>

      <ValLimiti/>
    </div>
  );
}

window.DashValore = DashValore;
