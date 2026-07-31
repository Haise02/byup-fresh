// ════════════════════════════════════════════════════════════════════════════
// VALORE PER IL LOCALE · le viste
// ════════════════════════════════════════════════════════════════════════════
//
// Due tagli, in ordine di pulizia: lo stesso locale nei suoi mesi bassi contro
// i suoi mesi alti (tolto l'andamento della rete), e lo stesso locale nella
// stessa sera su due canali. Il modello sta in admin-valore-data.jsx.

const valNum = (v, dec = 0) => Number(v).toLocaleString('it-IT', { minimumFractionDigits: dec, maximumFractionDigits: dec });
const valEur = (v, dec = 0) => '€ ' + valNum(v, dec);
const valSegno = (v, dec = 1) => {
  const a = Number(Math.abs(v).toFixed(dec));
  if (a === 0) return '0%';                                  // niente «−0%»
  return (v >= 0 ? '+' : '−') + valNum(a, dec) + '%';
};
const valConUnita = (v, ind) => ind.unita === '€' ? valEur(v, ind.dec)
  : ind.unita === '%' ? valNum(v, ind.dec) + '%'
  : ind.unita === 'min' ? valNum(v, ind.dec) + '′'
  : valNum(v, ind.dec);
// «Meglio» non è sempre «di più»: sul tempo e sui no-show il segno buono è il meno.
const valTono = (d, ind) => Math.abs(d) < 0.5 ? ADM.MUTED_LIGHT
  : (ind.verso === 'su' ? d > 0 : d < 0) ? ADM.OK : ADM.DANGER;

const VAL_MONO = 'ui-monospace, SFMono-Regular, Menlo, monospace';
const VAL_C_ALTO = ADM.OK;           // i mesi ad alta adozione, e il canale digitale
const VAL_C_BASSO = ADM.MUTED_LIGHT; // i mesi bassi, e il cameriere

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
  const C = VAL_CONTO;
  const spesa = VAL_ENTRO.find(i => i.k === 'spesa');
  return (
    <AdmCard padding={0} style={{overflow:'hidden'}}>
      <div style={{display:'grid', gridTemplateColumns:'minmax(300px, 0.82fr) 1.18fr'}}>
        <div style={{padding:'30px 28px', background:`linear-gradient(160deg, ${ADM.PINK_BG_SOFT}, #fff 78%)`, borderRight:`1px solid ${ADM.BORDER_SOFT}`}}>
          <div style={{fontSize:12.2, fontWeight:700, color:ADM.PINK_DARK, textTransform:'uppercase', letterSpacing:'0.07em'}}>
            Spesa per coperto
          </div>
          <div style={{fontSize:70, fontWeight:800, color:ADM.TEXT, letterSpacing:'-0.045em', lineHeight:1, margin:'10px 0 4px'}}>
            {valSegno(spesa.delta)}
          </div>
          <div style={{fontSize:14.4, color:ADM.TEXT, fontWeight:600}}>
            nei mesi ad alta adozione, al netto della rete
          </div>
          <div style={{marginTop:16, paddingTop:14, borderTop:`1px solid ${ADM.PINK_SOFT}`}}>
            <ValFormula>suo {valSegno(spesa.suo)} − rete {valSegno(spesa.rete)}</ValFormula>
            <div style={{fontSize:12.6, color:ADM.MUTED, marginTop:9, lineHeight:1.55}}>
              Ogni locale confrontato <strong style={{color:ADM.TEXT}}>con sé stesso</strong>: i suoi mesi a bassa adozione contro i suoi mesi alti.
              Stessa cucina, stesso quartiere, stesso proprietario. Su <strong style={{color:ADM.TEXT}}>{spesa.n} locali</strong> che hanno fatto
              un salto di almeno {VAL_SALTO_MINIMO} punti, {spesa.concordi} vanno nella stessa direzione.
            </div>
          </div>
        </div>

        <div style={{padding:'26px 28px', display:'flex', flexDirection:'column', gap:18}}>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:20}}>
            <div>
              <div style={{fontSize:12.2, fontWeight:700, color:ADM.MUTED, textTransform:'uppercase', letterSpacing:'0.06em'}}>Margine in più</div>
              <div style={{fontSize:30, fontWeight:800, color:ADM.OK, letterSpacing:'-0.03em', lineHeight:1.1, margin:'5px 0 6px'}}>{valEur(C.margine)}<span style={{fontSize:15, fontWeight:600, color:ADM.MUTED}}>/mese</span></div>
              <ValFormula chiaro>{C.componenti.map(c => `${c.label.toLowerCase()} ${valSegno(c.delta)}`).join(' × ')} × {C.margineLordo}%</ValFormula>
            </div>
            <div>
              <div style={{fontSize:12.2, fontWeight:700, color:ADM.MUTED, textTransform:'uppercase', letterSpacing:'0.06em'}}>Canone</div>
              <div style={{fontSize:30, fontWeight:800, color:ADM.TEXT, letterSpacing:'-0.03em', lineHeight:1.1, margin:'5px 0 6px'}}>{valEur(C.canoneMediano, 2)}</div>
              <ValFormula chiaro>{valNum(C.volte, 0)}× più piccolo di quel margine</ValFormula>
            </div>
          </div>

          <div style={{fontSize:12.6, color:ADM.MUTED, lineHeight:1.55}}>
            Il conto è sul locale mediano, {valNum(C.copertiMese / 28)} coperti al giorno a {valEur(C.spesaOggi, 2)} l'uno; su uno
            da {C.piccolo.coperti} coperti il margine in più è {valEur(C.piccolo.margine)} contro {valEur(C.piccolo.canone, 2)} di Starter.
            {C.esclusi.length > 0 && <> Fuori dal conto: {C.esclusi.map(e => `${e.label.toLowerCase()} (${valSegno(e.delta)}, ma solo ${e.concordi} locali su ${e.n} nella stessa direzione)`).join(', ')}.</>}
          </div>

          <div style={{
            display:'flex', gap:10, alignItems:'flex-start', padding:'12px 14px',
            background:ADM.WARN_SOFT, borderRadius:9, fontSize:12.6, color:ADM.TEXT, lineHeight:1.55,
          }}>
            <span style={{flexShrink:0, marginTop:2}}><BuIcons.info size={14} color={ADM.WARN}/></span>
            <span>
              <strong>Non è un esperimento.</strong> Nessuno ha assegnato l'adozione a caso: un locale che spinge il digitale
              può aver cambiato anche altro nello stesso periodo. Togliere l'andamento della rete elimina la stagionalità,
              non le altre decisioni del proprietario.
            </span>
          </div>
        </div>
      </div>
    </AdmCard>
  );
}

// ═══════════ 2 · La storia di un locale ═════════════════════════════════════
// La pagina si capisce guardando un locale solo: la sua curva di adozione con
// le due fasi ritagliate sopra, e cosa hanno fatto i suoi numeri.
function ValStoria() {
  const s = VAL_ESEMPIO;
  const [ind, setInd] = useStateDash(VAL_PERNO.k);
  const conf = VAL_INDICATORI.find(i => i.k === ind);
  const d = s.per[ind];
  const W = 780, H = 150, padX = 34, padY = 20;
  const maxAd = Math.max(...s.mesi.map(m => m.adozione), 10) * 1.2;
  const xFor = (t) => padX + (t / 11) * (W - padX * 2);
  const yFor = (v) => padY + (1 - v / maxAd) * (H - padY * 2);
  const setBassi = new Set(s.bassi.map(m => m.t));
  const setAlti = new Set(s.alti.map(m => m.t));
  const larghezza = (W - padX * 2) / 12;
  return (
    <ValCard
      titolo={`${s.nome} · dal ${valNum(s.adBassa, 0)}% al ${valNum(s.adAlta, 0)}% di ordini digitali`}
      sotto="Un locale solo, per vedere com'è fatto il conto · stessa cucina, stesso quartiere, stesso proprietario"
      destra={
        <div style={{display:'flex', gap:6, flexWrap:'wrap'}}>
          {VAL_INDICATORI.map(i2 => (
            <button key={i2.k} onClick={()=>setInd(i2.k)} className="adm-btn" style={{
              padding:'6px 11px', borderRadius:99, cursor:'pointer', fontFamily:'inherit', fontSize:12.6, fontWeight:600,
              border:`1px solid ${ind === i2.k ? ADM.PINK_DARK : ADM.BORDER}`,
              background: ind === i2.k ? ADM.PINK_BG_SOFT : '#fff',
              color: ind === i2.k ? ADM.PINK_DARK : ADM.MUTED,
            }}>{i2.label}</button>
          ))}
        </div>
      }
      piede={<>Le due fasi non sono scelte a mano: sono il terzo di mesi con l'adozione più bassa e il terzo con la più alta,
        <em> di questo locale</em>. In mezzo non è cambiato nient'altro — stessa cucina, stesso quartiere, stesso proprietario.</>}
    >
      <div style={{padding:'18px 22px 6px'}}>
        <svg viewBox={`0 0 ${W} ${H + 16}`} style={{width:'100%', height:172}}>
          {s.mesi.map(m => (
            (setBassi.has(m.t) || setAlti.has(m.t)) ? (
              <rect key={m.t} x={xFor(m.t) - larghezza / 2} y={padY - 12}
                width={larghezza} height={H - padY * 2 + 26}
                fill={setAlti.has(m.t) ? VAL_C_ALTO : ADM.INK} opacity={setAlti.has(m.t) ? 0.10 : 0.05}/>
            ) : null
          ))}
          <path d={s.mesi.map((m, t) => `${t === 0 ? 'M' : 'L'} ${xFor(t)} ${yFor(m.adozione)}`).join(' ')}
            fill="none" stroke={ADM.PINK} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/>
          {s.mesi.map(m => (
            <circle key={m.t} cx={xFor(m.t)} cy={yFor(m.adozione)} r="3.6" fill="#fff" stroke={ADM.PINK} strokeWidth="2"/>
          ))}
          {s.mesi.map(m => (
            <text key={m.t} x={xFor(m.t)} y={H + 6} textAnchor="middle" fontSize="11" fontWeight="600"
              fill={setAlti.has(m.t) ? VAL_C_ALTO : setBassi.has(m.t) ? ADM.TEXT : ADM.MUTED_SOFT}>{m.nome}</text>
          ))}
          <text x={xFor(0)} y={yFor(s.mesi[0].adozione) - 11} textAnchor="start" fontSize="11.5" fill={ADM.PINK_DARK} fontWeight="700">{valNum(s.mesi[0].adozione, 0)}%</text>
          <text x={xFor(11)} y={yFor(s.mesi[11].adozione) - 11} textAnchor="end" fontSize="11.5" fill={ADM.PINK_DARK} fontWeight="700">{valNum(s.mesi[11].adozione, 0)}%</text>
        </svg>
      </div>

      <div style={{padding:'8px 22px 20px', display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1.15fr', gap:14}}>
        {[
          { l:'Mesi a bassa adozione', v: valConUnita(d.basso, conf), sotto:`adozione mediana ${valNum(s.adBassa, 0)}%`, c: ADM.TEXT, bg: ADM.PANEL_SOFT, bd: ADM.BORDER_SOFT },
          { l:'Mesi ad alta adozione', v: valConUnita(d.alto, conf), sotto:`adozione mediana ${valNum(s.adAlta, 0)}%`, c: VAL_C_ALTO, bg: ADM.OK_SOFT, bd: ADM.OK_SOFT },
          { l:'La rete, stessi mesi', v: valSegno(d.rete), sotto:'stagionalità e listini', c: ADM.MUTED, bg: ADM.PANEL_SOFT, bd: ADM.BORDER_SOFT },
        ].map(b => (
          <div key={b.l} style={{padding:'13px 15px', background:b.bg, border:`1px solid ${b.bd}`, borderRadius:10}}>
            <div style={{fontSize:11.8, fontWeight:700, color:ADM.MUTED, textTransform:'uppercase', letterSpacing:'0.05em'}}>{b.l}</div>
            <div style={{fontSize:25, fontWeight:800, color:b.c, letterSpacing:'-0.03em', marginTop:5, lineHeight:1}}>{b.v}</div>
            <div style={{fontSize:12.2, color:ADM.MUTED, marginTop:5}}>{b.sotto}</div>
          </div>
        ))}
        <div style={{padding:'13px 15px', background:ADM.PINK_BG_SOFT, border:`1px solid ${ADM.PINK_SOFT}`, borderRadius:10}}>
          <div style={{fontSize:11.8, fontWeight:700, color:ADM.PINK_DARK, textTransform:'uppercase', letterSpacing:'0.05em'}}>Suo, meno la rete</div>
          <div style={{fontSize:25, fontWeight:800, color: valTono(d.netto, conf), letterSpacing:'-0.03em', marginTop:5, lineHeight:1}}>{valSegno(d.netto)}</div>
          <div style={{fontSize:12.2, color:ADM.MUTED, marginTop:5}}>{valSegno(d.suo)} suo − {valSegno(d.rete)} rete</div>
        </div>
      </div>
    </ValCard>
  );
}

// ═══════════ 3 · I quattro indicatori ═══════════════════════════════════════
function ValIndicatori() {
  return (
    <ValCard
      titolo="Lo stesso conto su tutti i locali che hanno fatto il salto"
      sotto={`${VAL_STORIE_VALIDE.length} locali su ${VAL_PANEL.length} attivi · gli altri non hanno ancora due fasi da confrontare`}
      piede={<>
        <strong style={{color:ADM.TEXT}}>Suo</strong> = quanto si è mosso il locale fra le sue due fasi.
        <strong style={{color:ADM.TEXT}}> Rete</strong> = quanto si è mossa la mediana della piattaforma negli stessi mesi: è la stagionalità, e va tolta.
        <strong style={{color:ADM.TEXT}}> Netto</strong> = la differenza fra le due. Ogni pallino è un locale, la barra chiara è dove sta la metà centrale.
      </>}
    >
      {VAL_ENTRO.map((e, i) => {
        const tono = e.solido ? valTono(e.delta, e) : ADM.MUTED_LIGHT;
        const mx = Math.max(...e.netti.map(Math.abs), 1);
        const pos = (v) => 50 + (v / mx) * 44;
        return (
          <div key={e.k} style={{
            display:'grid', gridTemplateColumns:'minmax(0,1.5fr) 0.9fr minmax(170px,1.5fr) 0.72fr', columnGap:18,
            padding:'14px 22px', alignItems:'center',
            borderTop: i === 0 ? 'none' : `1px solid ${ADM.BORDER_SOFT}`,
            background: e.perno ? ADM.PINK_BG_SOFT : 'transparent',
          }}>
            <div style={{minWidth:0}}>
              <div style={{fontSize:14, color:ADM.TEXT, lineHeight:1.35}}>
                <strong style={{fontWeight:700}}>{e.label}</strong>
                <span style={{color:ADM.MUTED_SOFT, fontWeight:500}}> · {e.perche}</span>
              </div>
              <div style={{marginTop:5}}><ValFormula>{e.formula}</ValFormula></div>
            </div>

            <div style={{textAlign:'right', fontVariantNumeric:'tabular-nums'}}>
              <div style={{fontSize:13.4, color:ADM.TEXT, fontWeight:600}}>{valSegno(e.suo)} <span style={{fontSize:11.6, color:ADM.MUTED_SOFT, fontWeight:500}}>suo</span></div>
              <div style={{fontSize:13.4, color:ADM.MUTED}}>{valSegno(e.rete)} <span style={{fontSize:11.6, color:ADM.MUTED_SOFT}}>rete</span></div>
            </div>

            {/* La nuvola dei locali, con la metà centrale in evidenza */}
            <div style={{position:'relative', height:30}}>
              <div style={{position:'absolute', left:0, right:0, top:'50%', height:1, background:ADM.BORDER}}/>
              <div style={{position:'absolute', left:'50%', top:3, bottom:3, width:1, background:ADM.INK_SOFT}}/>
              <div style={{
                position:'absolute', top:'50%', height:6, marginTop:-3, borderRadius:3, background:`${tono}33`,
                left:`${Math.min(pos(e.q1), pos(e.q3))}%`, width:`${Math.max(1, Math.abs(pos(e.q3) - pos(e.q1)))}%`,
              }}/>
              {e.netti.map((v, j) => (
                <span key={j} style={{
                  position:'absolute', left:`${pos(v)}%`, top:'50%', width:8, height:8, marginLeft:-4, marginTop:-4,
                  borderRadius:'50%', background: (e.verso === 'su' ? v > 0 : v < 0) ? tono : ADM.MUTED_LIGHT,
                  opacity:0.6, border:'1px solid #fff',
                }}/>
              ))}
              <span style={{position:'absolute', left:`${pos(e.delta)}%`, top:2, bottom:2, width:2.5, marginLeft:-1.25, background:tono, borderRadius:2}}/>
            </div>

            <div style={{textAlign:'right'}}>
              <div style={{fontSize:18, fontWeight:800, color:tono, letterSpacing:'-0.02em', fontVariantNumeric:'tabular-nums'}}>{valSegno(e.delta)}</div>
              <div style={{fontSize:11.6, color: e.solido ? ADM.MUTED : ADM.WARN, fontWeight:700}}>{e.concordi}/{e.n} locali</div>
            </div>
          </div>
        );
      })}
    </ValCard>
  );
}

// ═══════════ 4 · Due canali, stessa sera ════════════════════════════════════
function ValCanale() {
  const C = VAL_CANALE;
  const mx = Math.max(C.scontrinoDig, C.scontrinoCam) * 1.05;
  return (
    <ValCard
      titolo="Stessa sera, stessi tavoli, due canali"
      sotto="Il valore degli ordini via QR e app contro quelli passati dal cameriere · qui l'unica variabile è il canale"
      piede={<>Il confronto è a parità di <strong style={{color:ADM.TEXT}}>numero di commensali</strong> e <strong style={{color:ADM.TEXT}}>fascia oraria</strong>:
        un tavolo da sei alle nove non è una coppia a mezzogiorno. Quello che resta fuori è <em>chi</em> sceglie il QR — una parte del premio
        è il tipo di tavolo, non il canale, e per separarli servirebbe assegnare il canale a caso dentro lo stesso servizio.</>}
    >
      <div style={{padding:'20px 22px 10px', display:'grid', gridTemplateColumns:'1.25fr 1fr', gap:26, alignItems:'center'}}>
        <div style={{display:'flex', flexDirection:'column', gap:13}}>
          {[
            { l:'Ordine da QR o app', v: C.scontrinoDig, c: VAL_C_ALTO },
            { l:'Ordine dal cameriere', v: C.scontrinoCam, c: VAL_C_BASSO },
          ].map(b => (
            <div key={b.l}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:6}}>
                <span style={{fontSize:13.4, color:ADM.TEXT, fontWeight:600}}>{b.l}</span>
                <span style={{fontSize:16, fontWeight:800, color:ADM.TEXT, fontVariantNumeric:'tabular-nums'}}>{valEur(b.v, 2)}</span>
              </div>
              <div style={{height:14, background:ADM.PANEL_SOFT, borderRadius:4, overflow:'hidden'}}>
                <div style={{width:`${(b.v / mx) * 100}%`, height:'100%', background:b.c, borderRadius:4}}/>
              </div>
            </div>
          ))}
          <div style={{fontSize:12.6, color:ADM.MUTED, lineHeight:1.5, marginTop:2}}>
            Il premio nasce quasi tutto dal secondo giro: <strong style={{color:ADM.TEXT}}>{valSegno(C.portateDelta)}</strong> di portate per coperto —
            il dolce e l'ultimo bicchiere che al cameriere non chiedi.
          </div>
        </div>

        <div style={{textAlign:'center'}}>
          <div style={{fontSize:12.2, fontWeight:700, color:ADM.MUTED, textTransform:'uppercase', letterSpacing:'0.06em'}}>Premio del canale</div>
          <div style={{fontSize:52, fontWeight:800, color:VAL_C_ALTO, letterSpacing:'-0.04em', lineHeight:1.05, margin:'6px 0 6px'}}>{valSegno(C.mediano)}</div>
          <div style={{fontSize:12.6, color:ADM.MUTED, lineHeight:1.5}}>
            mediana su {C.n} locali · metà centrale fra {valSegno(C.q1, 0)} e {valSegno(C.q3, 0)}
            <br/><strong style={{color:ADM.TEXT}}>{C.concordi} locali su {C.n}</strong> hanno il canale digitale più alto
          </div>
        </div>
      </div>

      <div style={{padding:'10px 22px 20px', display:'flex', flexDirection:'column', gap:6}}>
        {C.righe.slice(0, 10).map(r => (
          <div key={r.id} style={{display:'flex', alignItems:'center', gap:12}}>
            <span style={{fontSize:12.8, color:ADM.TEXT, width:172, flexShrink:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{r.nome}</span>
            <span style={{fontSize:11.8, color:ADM.MUTED_SOFT, width:38, textAlign:'right', flexShrink:0, fontVariantNumeric:'tabular-nums'}}>{valNum(r.adozione, 0)}%</span>
            <div style={{flex:1, height:9, background:ADM.PANEL_SOFT, borderRadius:99, overflow:'hidden'}}>
              <div style={{width:`${(r.premio / (C.righe[0].premio || 1)) * 100}%`, height:'100%', background:VAL_C_ALTO, borderRadius:99, opacity:0.85}}/>
            </div>
            <span style={{fontSize:12.6, color:ADM.MUTED, width:136, textAlign:'right', fontVariantNumeric:'tabular-nums', whiteSpace:'nowrap'}}>
              {valEur(r.cameriere, 2)} → <strong style={{color:ADM.TEXT}}>{valEur(r.digitale, 2)}</strong>
            </span>
            <span style={{fontSize:13.2, fontWeight:800, color:VAL_C_ALTO, width:46, textAlign:'right', fontVariantNumeric:'tabular-nums'}}>{valSegno(r.premio, 0)}</span>
          </div>
        ))}
      </div>
    </ValCard>
  );
}

// ═══════════ 5 · Il legame con l'abbandono ══════════════════════════════════
function ValChurn() {
  const C = VAL_CHURN;
  const barre = [
    { label:'Chi è attivo', v: C.adozioneMedianaAttivi, colore: VAL_C_ALTO },
    { label:'Chi si è fermato', v: C.adozioneMedianaInattivi, colore: ADM.WARN },
  ];
  const mx = Math.max(...barre.map(b => b.v), VAL_SOGLIA) * 1.2;
  return (
    <ValCard
      titolo="Lo stesso numero, letto come rischio"
      sotto="Adozione mediana · chi si ferma non ha quasi mai fatto il salto"
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
  const lista = VAL_POTENZIALE.slice(0, 8);
  const totale = VAL_POTENZIALE.reduce((s, l) => s + l.deltaMargine, 0);
  const mx = Math.max(...lista.map(l => l.deltaMargine), 1);
  return (
    <ValCard
      titolo="Con chi parlarne domani"
      sotto={`Chi è ancora sotto il ${VAL_SOGLIA}%, in ordine di quanto varrebbe il salto sul suo volume`}
      piede={<>È una <strong style={{color:ADM.TEXT}}>proiezione</strong>: applica ai loro numeri di oggi la variazione mediana di chi il salto l'ha già fatto.
        Serve a decidere chi chiamare per primo, non a scriverlo al cliente.</>}
    >
      <div style={{padding:'18px 22px', display:'flex', flexDirection:'column', gap:9}}>
        <div style={{display:'flex', alignItems:'baseline', gap:10, marginBottom:4}}>
          <span style={{fontSize:32, fontWeight:800, color:ADM.OK, letterSpacing:'-0.03em', lineHeight:1}}>{valEur(totale)}</span>
          <span style={{fontSize:13, color:ADM.MUTED}}>di margine al mese in gioco, su {VAL_POTENZIALE.length} locali</span>
        </div>
        {lista.map(l => (
          <div key={l.id} style={{display:'flex', alignItems:'center', gap:11}}>
            <div style={{width:172, flexShrink:0, minWidth:0}}>
              <div style={{fontSize:13.2, fontWeight:600, color:ADM.TEXT, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{l.nome}</div>
              <div style={{fontSize:11.6, color:ADM.MUTED_SOFT}}>{l.tipo} · {l.citta}</div>
            </div>
            <span style={{fontSize:12.6, fontWeight:700, color: l.adozioneOggi < 5 ? ADM.DANGER : ADM.WARN, width:38, textAlign:'right', fontVariantNumeric:'tabular-nums'}}>{valNum(l.adozioneOggi, 0)}%</span>
            <span style={{fontSize:11.6, color:ADM.MUTED_LIGHT, flexShrink:0}}>+{valNum(l.puntiDaFare, 0)}pt</span>
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
    ['Nessun «prima di byup»', 'i dati cominciano quando il locale si iscrive: il confronto è fra i suoi mesi bassi e i suoi mesi alti, non fra prima e dopo di noi'],
    ['Non è un esperimento', 'l’adozione non è stata assegnata a caso: togliere l’andamento della rete elimina la stagionalità, non le altre decisioni del proprietario'],
    ['Chi sceglie il QR', 'nel confronto fra canali resta dentro il tipo di tavolo: sei ragazzi ordinano diversamente da una coppia'],
    ['Il passo che manca', 'spingere il digitale a scaglioni su locali simili — metà adesso, metà fra due mesi — e confrontare i due gruppi: un trimestre, e da associazione diventa prova'],
  ];
  return (
    <ValCard titolo="Cosa non dimostra" sotto={`${VAL_STORIE_VALIDE.length} locali con due fasi confrontabili · da sapere prima di portarla dove qualcuno fa domande`}>
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
      <SectionLabel first title="Il ritorno" desc="Ogni locale confrontato con sé stesso: i suoi mesi a bassa adozione contro i suoi mesi alti, tolto l'andamento della rete"/>
      <ValHero/>

      <SectionLabel title="Com'è fatto il conto" desc="Un locale solo, mese per mese"/>
      <ValStoria/>

      <SectionLabel title="Su tutti gli altri" desc="Gli stessi quattro indicatori su chi ha fatto il salto"/>
      <ValIndicatori/>

      <SectionLabel title="Il taglio più pulito" desc="Stessa sera, stessi tavoli: l'unica variabile è il canale"/>
      <ValCanale/>

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
