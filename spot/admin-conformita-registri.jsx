// Conformità — i due registri "anagrafici": rischi (§6.1) e fornitori (A.5.19–5.23 · §8.4).
//
// Sono i primi due documenti che un auditor apre. Il registro dei rischi dice se
// l'azienda sa dove può farsi male e cosa ha fatto per rimediare; il registro dei
// fornitori dice a chi ha messo in mano i propri dati e con quale contratto.
// In entrambi la domanda non è "esiste il registro?" ma "è vivo?": la data di
// riesame è la prova, e dove manca il registro vale meno di zero.

const { useState: useStateCfr } = React;

// ─── Scala del rischio ─────────────────────────────────────────────────────
// Livello = probabilità × impatto su scala 1-5. Le soglie sono quelle della
// metodologia dichiarata: 1-6 basso, 8-12 medio, 15-25 alto.
const CFR_PROB = ['Raro', 'Improbabile', 'Possibile', 'Probabile', 'Quasi certo'];
const CFR_IMP  = ['Trascurabile', 'Minore', 'Moderato', 'Grave', 'Critico'];

const cfrLiv    = (p, i) => (p || 0) * (i || 0);
const cfrFascia = (n) => (n >= 15 ? 'alto' : n >= 8 ? 'medio' : 'basso');
const cfrCoord  = (r, vista) => (vista === 'residuo'
  ? { p: r.residuoProb, i: r.residuoImpatto }
  : { p: r.prob, i: r.impatto });

// Rampa monocromatica: lo sfondo della cella dice quanto è severa quella
// posizione, non a quale categoria appartiene. Il coral è riservato alla fascia
// alta — un accento solo, non un arcobaleno. La rampa si distende su 1-12
// perché sopra il 12 il colore lo prende il coral: usare tutta la scala 1-25
// renderebbe indistinguibili basso e medio.
const cfrRampa = (liv) => `rgba(49,53,61,${(0.04 + (Math.min(liv, 12) / 12) * 0.16).toFixed(3)})`;

const CFR_TRATT = { mitigare:'Mitigare', accettare:'Accettare', trasferire:'Trasferire', evitare:'Evitare' };
const CFR_STATO = {
  nuovo:     { tono:'WARN',    label:'Nuovo' },
  aperto:    { tono:'WARN',    label:'Aperto' },
  trattato:  { tono:'OK',      label:'Trattato' },
  accettato: { tono:'NEUTRAL', label:'Accettato' },
};
const CFR_CRIT_RANK = { alta:3, media:2, bassa:1 };
const cfrCap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '—');

const cfrMesiFa = (d) => (d ? Math.max(0, Math.round((Date.now() - d.getTime()) / 2629800000)) : null);
const cfrQuandoFa = (d) => {
  const m = cfrMesiFa(d);
  if (m == null) return '';
  if (m === 0) return 'questo mese';
  if (m === 1) return '1 mese fa';
  return `${m} mesi fa`;
};

// ─── Chip riusabili ────────────────────────────────────────────────────────
// Definiti a livello di modulo, mai dentro un componente: un sotto-componente
// dichiarato nel corpo di un altro viene rimontato a ogni render.

function CfrChips({ items, titolo }) {
  if (!items || !items.length) return <span style={{fontSize:12, color:ADM.MUTED_SOFT}}>—</span>;
  return (
    <span style={{display:'flex', flexWrap:'wrap', gap:4}} title={titolo}>
      {items.map(c => (
        <span key={c} style={{fontSize:11, fontWeight:700, color:ADM.INK, background:'rgba(49,53,61,0.07)',
          padding:'2px 6px', borderRadius:5, whiteSpace:'nowrap', letterSpacing:'0.01em'}}>{c}</span>
      ))}
    </span>
  );
}

// Blocco livello: numero grande + la moltiplicazione che lo genera, così il
// numero è verificabile a occhio e non è un voto calato dall'alto.
function CfrLivello({ p, i, forte, nota, notaTono }) {
  const liv = cfrLiv(p, i);
  const alta = cfrFascia(liv) === 'alto';
  return (
    <span style={{display:'inline-flex', flexDirection:'column', alignItems:'flex-start', gap:2}}>
      <span style={{display:'inline-flex', alignItems:'baseline', gap:5, padding:'2px 8px', borderRadius:6,
        background: alta ? ADM.PINK : forte ? 'rgba(49,53,61,0.10)' : 'rgba(49,53,61,0.05)',
        color: alta ? '#fff' : ADM.INK}}>
        <span style={{fontSize:14.5, fontWeight:800, letterSpacing:'-0.01em'}}>{liv}</span>
        <span style={{fontSize:10.5, fontWeight:700, opacity:0.7}}>{cfrFascia(liv)}</span>
      </span>
      {/* La nota sta sulla stessa riga di "p × i" così i due blocchi inerente e
          residuo restano alti uguali e le pastiglie si allineano fra loro. */}
      <span style={{display:'inline-flex', alignItems:'baseline', gap:6, whiteSpace:'nowrap'}}>
        <span style={{fontSize:11, color:ADM.MUTED_SOFT}}>{p} × {i}</span>
        {nota && <span style={{fontSize:11, fontWeight:700, color: notaTono || ADM.MUTED_SOFT}}>{nota}</span>}
      </span>
    </span>
  );
}

function CfrCriticita({ liv }) {
  const alta = liv === 'alta';
  return (
    <span style={{display:'inline-flex', alignItems:'center', padding:'2px 9px', borderRadius:6,
      background: alta ? ADM.PINK : liv === 'media' ? 'rgba(49,53,61,0.10)' : 'rgba(49,53,61,0.05)',
      color: alta ? '#fff' : ADM.INK, fontSize:11.6, fontWeight:700, textTransform:'capitalize'}}>{liv}</span>
  );
}

// Coppia etichetta/valore per le fasce di dettaglio in linea.
function CfrVoce({ k, v, tono }) {
  return (
    <div>
      <div style={{fontSize:11.2, color:ADM.MUTED, textTransform:'uppercase', letterSpacing:'0.05em', fontWeight:700}}>{k}</div>
      <div style={{fontSize:12.8, fontWeight:600, color: tono ? CF_TONO(tono) : ADM.TEXT, marginTop:3, lineHeight:1.4}}>{v}</div>
    </div>
  );
}

// ─── Matrice probabilità × impatto ─────────────────────────────────────────
// Non è decorazione: è il modo in cui la norma chiede di mostrare che i rischi
// sono stati pesati con un criterio unico. Le celle contano, e cliccandole
// filtrano l'elenco sotto — la matrice e la tabella sono la stessa cosa.
function CfrMatrice({ celle, sel, onSel }) {
  const cella = (p, i) => {
    const dentro = celle[p + '-' + i] || [];
    const n = dentro.length;
    const liv = cfrLiv(p, i);
    const alta = cfrFascia(liv) === 'alto';
    const attiva = !!sel && sel.p === p && sel.i === i;
    const cliccabile = n > 0;
    return (
      <div key={p + '-' + i}
        className={cliccabile ? 'adm-card-interactive' : undefined}
        onClick={cliccabile ? () => onSel(attiva ? null : { p, i }) : undefined}
        title={cliccabile ? `${n} ${n === 1 ? 'rischio' : 'rischi'} · ${CFR_PROB[p-1]} × ${CFR_IMP[i-1]} · livello ${liv}` : undefined}
        style={{
          height:50, borderRadius:8, display:'flex', flexDirection:'column',
          alignItems:'center', justifyContent:'center', gap:1,
          border:`1px solid ${alta && !n ? 'rgba(255,90,95,0.22)' : 'transparent'}`,
          background: alta ? (n ? ADM.PINK : 'rgba(255,90,95,0.09)') : cfrRampa(liv),
          boxShadow: attiva ? `inset 0 0 0 2px ${ADM.TEXT}` : 'none',
        }}>
        <span style={{fontSize: n ? 16 : 12.5, fontWeight: n ? 800 : 600, lineHeight:1,
          color: n ? (alta ? '#fff' : ADM.TEXT) : ADM.MUTED_LIGHT}}>{n || '·'}</span>
        {n > 0 && (
          <span style={{fontSize:10, fontWeight:700, letterSpacing:'0.02em',
            color: alta ? 'rgba(255,255,255,0.82)' : ADM.MUTED_SOFT}}>liv {liv}</span>
        )}
      </div>
    );
  };

  const GRIGLIA = { display:'grid', gridTemplateColumns:'128px repeat(5, minmax(0,1fr))', gap:5, alignItems:'center' };

  return (
    <div>
      {[5, 4, 3, 2, 1].map(i => (
        <div key={i} style={{...GRIGLIA, marginBottom:5}}>
          <div style={{textAlign:'right', paddingRight:8}}>
            <div style={{fontSize:12, fontWeight:700, color:ADM.TEXT}}>{CFR_IMP[i-1]}</div>
            <div style={{fontSize:10.8, color:ADM.MUTED_SOFT}}>impatto {i}</div>
          </div>
          {[1, 2, 3, 4, 5].map(p => cella(p, i))}
        </div>
      ))}
      <div style={GRIGLIA}>
        <div style={{textAlign:'right', paddingRight:8, fontSize:11, color:ADM.MUTED_SOFT,
          textTransform:'uppercase', letterSpacing:'0.05em', fontWeight:700}}>probabilità →</div>
        {[1, 2, 3, 4, 5].map(p => (
          <div key={p} style={{textAlign:'center'}}>
            <div style={{fontSize:11.6, fontWeight:700, color:ADM.TEXT}}>{CFR_PROB[p-1]}</div>
            <div style={{fontSize:10.8, color:ADM.MUTED_SOFT}}>{p}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Registro dei rischi ───────────────────────────────────────────────────
function CfRischi() {
  const [vista, setVista]     = useStateCfr('inerente');  // la matrice mostra prima o dopo il trattamento
  const [sel, setSel]         = useStateCfr(null);        // cella selezionata { p, i }
  const [aperto, setAperto]   = useStateCfr(null);        // riga espansa
  const [riesame, setRiesame] = useStateCfr(null);        // rischio in attesa di conferma
  const [, forza]             = useStateCfr(0);           // i dati sono mutati in place: qui si forza il render

  const celle = {};
  RISCHI.forEach(r => {
    const c = cfrCoord(r, vista);
    const k = c.p + '-' + c.i;
    (celle[k] = celle[k] || []).push(r);
  });

  const conta = (f, chiave) => RISCHI.filter(r => cfrFascia(chiave === 'residuo'
    ? cfrLiv(r.residuoProb, r.residuoImpatto)
    : cfrLiv(r.prob, r.impatto)) === f).length;

  const alti = conta('alto', 'inerente');
  const altiResidui = conta('alto', 'residuo');
  const daTrattare = RISCHI.filter(r => r.stato === 'aperto' || r.stato === 'nuovo').length;
  const maiRiesaminati = RISCHI.filter(r => !r.ultimoRiesame).length;

  const somma = (chiave) => RISCHI.reduce((s, r) => s + (chiave === 'residuo'
    ? cfrLiv(r.residuoProb, r.residuoImpatto) : cfrLiv(r.prob, r.impatto)), 0);
  const riduzione = somma('inerente') ? Math.round(((somma('inerente') - somma('residuo')) / somma('inerente')) * 100) : 0;

  // Ordinamento per livello inerente decrescente: l'elenco deve aprirsi su ciò
  // che fa più male, non sull'ordine in cui i rischi sono stati scritti.
  const righe = RISCHI
    .filter(r => {
      if (!sel) return true;
      const c = cfrCoord(r, vista);
      return c.p === sel.p && c.i === sel.i;
    })
    .slice()
    .sort((a, b) => cfrLiv(b.prob, b.impatto) - cfrLiv(a.prob, a.impatto)
      || cfrLiv(b.residuoProb, b.residuoImpatto) - cfrLiv(a.residuoProb, a.residuoImpatto)
      || a.id.localeCompare(b.id));

  const confermaRiesame = () => {
    if (!riesame) return;
    riesame.ultimoRiesame = new Date();
    if (riesame.stato === 'nuovo') riesame.stato = 'aperto';
    setRiesame(null);
    forza(n => n + 1);
  };

  const GRID = 'minmax(0,2.1fr) 96px 116px 0.95fr 1.1fr 1.3fr 1.35fr 30px';
  const sintesi = [
    // Le tre fasce contano sempre il livello inerente, anche quando la matrice
    // sotto è impostata su «residuo»: dirlo evita di leggere due numeri diversi
    // come se fossero lo stesso.
    { n:alti,            label:'a livello alto',    nota:'15-25 · inerente', coral:alti > 0 },
    { n:conta('medio', 'inerente'), label:'a livello medio', nota:'8-12 · inerente' },
    { n:conta('basso', 'inerente'), label:'a livello basso', nota:'1-6 · inerente' },
    { n:daTrattare,      label:'da trattare',       nota:'aperti o nuovi', tono: daTrattare ? 'WARN' : 'OK' },
    { n:maiRiesaminati,  label:'mai riesaminati',   nota:'senza data',     tono: maiRiesaminati ? 'DANGER' : 'OK' },
  ];

  return (
    <div style={{padding:'20px 22px', display:'flex', flexDirection:'column', gap:20, position:'relative'}}>

      {/* Profilo di rischio — la sintesi che l'auditor vuole in una riga */}
      <div style={{display:'flex', alignItems:'center', gap:16, padding:'14px 16px', borderRadius:10,
        background: daTrattare || maiRiesaminati ? '#FFF7E6' : ADM.OK_SOFT,
        border:`1px solid ${daTrattare || maiRiesaminati ? '#FDE68A' : '#BBF7D0'}`}}>
        <div style={{flex:1, minWidth:0}}>
          <div style={{fontSize:14.5, fontWeight:800, color: daTrattare || maiRiesaminati ? '#78350F' : '#065F46'}}>
            {daTrattare || maiRiesaminati
              ? `${daTrattare} rischi da trattare${maiRiesaminati ? ` · ${maiRiesaminati} mai riesaminati` : ''}`
              : 'Tutti i rischi trattati e riesaminati'}
          </div>
          <div style={{fontSize:12.8, color:ADM.MUTED, marginTop:3}}>
            {RISCHI.length} rischi valutati · livello = probabilità × impatto su scala 1-5 · la fascia alta parte da 15
          </div>
        </div>
        <div style={{textAlign:'right', flexShrink:0}}>
          <div style={{fontSize:21, fontWeight:800, color:ADM.TEXT, letterSpacing:'-0.02em', lineHeight:1}}>
            {alti}<span style={{fontSize:14, fontWeight:700, color:ADM.MUTED}}> → {altiResidui}</span>
          </div>
          <div style={{fontSize:11.6, color:ADM.MUTED, marginTop:3}}>rischi alti dopo il trattamento</div>
        </div>
        <div style={{textAlign:'right', flexShrink:0, paddingLeft:16, borderLeft:`1px solid rgba(15,17,21,0.10)`}}>
          <div style={{fontSize:21, fontWeight:800, color:ADM.TEXT, letterSpacing:'-0.02em', lineHeight:1}}>−{riduzione}%</div>
          <div style={{fontSize:11.6, color:ADM.MUTED, marginTop:3}}>esposizione complessiva</div>
        </div>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'repeat(5, minmax(0,1fr))', gap:10}}>
        {sintesi.map(s => (
          <div key={s.label} style={{...CF_CARD, padding:'13px 15px'}}>
            <div style={{fontSize:23, fontWeight:800, letterSpacing:'-0.02em', lineHeight:1,
              color: s.tono ? (s.n ? CF_TONO(s.tono) : ADM.TEXT) : s.coral ? ADM.PINK : ADM.TEXT}}>{s.n}</div>
            <div style={{fontSize:12.2, color:ADM.MUTED, marginTop:6}}>{s.label}</div>
            <div style={{fontSize:11, color:ADM.MUTED_SOFT, marginTop:2}}>{s.nota}</div>
          </div>
        ))}
      </div>

      {/* Matrice */}
      <div>
        <div style={{display:'flex', alignItems:'center', gap:12, marginBottom:12}}>
          <div style={{...CF_H, marginBottom:0}}>Matrice probabilità × impatto</div>
          <span style={{fontSize:12.4, color:ADM.MUTED}}>
            {sel
              ? `filtro attivo: ${CFR_PROB[sel.p-1]} × ${CFR_IMP[sel.i-1]}`
              : 'clicca una cella piena per filtrare l’elenco'}
          </span>
          <div style={{flex:1}}/>
          {sel && <AdmButton variant="ghost" size="sm" onClick={()=>setSel(null)}>Togli il filtro</AdmButton>}
          <AdmTabBar variant="segmented" active={vista} onChange={(v)=>{ setVista(v); setSel(null); }}
            tabs={[{ id:'inerente', label:'Inerente' }, { id:'residuo', label:'Residuo' }]}/>
        </div>

        <div style={{...CF_CARD, padding:'16px 18px'}}>
          <CfrMatrice celle={celle} sel={sel} onSel={setSel}/>
          <div style={{display:'flex', alignItems:'center', gap:16, marginTop:14, paddingTop:12,
            borderTop:`1px dashed ${ADM.BORDER_SOFT}`, flexWrap:'wrap'}}>
            {[['1-6 basso', cfrRampa(4)], ['8-12 medio', cfrRampa(10)], ['15-25 alto', ADM.PINK]].map(([lab, bg]) => (
              <span key={lab} style={{display:'inline-flex', alignItems:'center', gap:6, fontSize:11.8, color:ADM.MUTED}}>
                <span style={{width:22, height:12, borderRadius:3, background:bg, border:`1px solid ${ADM.BORDER}`}}/>{lab}
              </span>
            ))}
            <span style={{fontSize:11.8, color:ADM.MUTED_SOFT}}>
              {vista === 'inerente'
                ? 'Posizione prima del trattamento: è la fotografia grezza, quella da cui discende la Dichiarazione di Applicabilità.'
                : 'Posizione dopo le misure attuate: lo scarto fra le due viste è la prova che il trattamento ha prodotto un effetto.'}
            </span>
          </div>
        </div>
      </div>

      {/* Elenco */}
      <div>
        <div style={{display:'flex', alignItems:'baseline', gap:10, marginBottom:10}}>
          <div style={{...CF_H, marginBottom:0}}>Registro dei rischi</div>
          <span style={{fontSize:12.4, color:ADM.MUTED}}>
            {righe.length === RISCHI.length ? 'ordinati per livello inerente decrescente' : `${righe.length} su ${RISCHI.length} rischi`}
          </span>
        </div>

        <div style={CF_CARD}>
          <div style={{...CF_TH, display:'grid', gridTemplateColumns:GRID, gap:10}}>
            <div>Rischio</div><div>Inerente</div><div>Residuo</div><div>Trattamento</div>
            <div>Responsabile</div><div>Controlli Annex A</div><div>Stato</div><div/>
          </div>

          {righe.map((r, idx) => {
            const livI = cfrLiv(r.prob, r.impatto);
            const livR = cfrLiv(r.residuoProb, r.residuoImpatto);
            const delta = livI - livR;
            const st = CFR_STATO[r.stato] || { tono:'NEUTRAL', label:r.stato };
            const espanso = aperto === r.id;
            const ultimo = idx === righe.length - 1;
            return (
              <div key={r.id} style={{borderBottom: !ultimo || espanso ? `1px solid ${ADM.BORDER_SOFT}` : 'none'}}>
                <div className="adm-row-open" onClick={()=>setAperto(espanso ? null : r.id)}
                  style={{display:'grid', gridTemplateColumns:GRID, gap:10, alignItems:'center',
                    padding:'12px 16px', cursor:'pointer',
                    background: espanso ? ADM.PANEL_SOFT : !r.ultimoRiesame ? '#FFFBFB' : '#fff'}}>
                  <div style={{minWidth:0}}>
                    <div style={{display:'flex', alignItems:'baseline', gap:7}}>
                      <span style={{fontSize:11.2, fontWeight:700, color:ADM.MUTED_SOFT,
                        fontFamily:'ui-monospace, SFMono-Regular, Menlo, monospace'}}>{r.id}</span>
                      <span style={{fontSize:13.4, fontWeight:700, color:ADM.TEXT, lineHeight:1.3}}>{r.titolo}</span>
                    </div>
                    <div style={{fontSize:11.6, color:ADM.MUTED_SOFT, marginTop:3}}>{r.categoria}</div>
                  </div>

                  <div><CfrLivello p={r.prob} i={r.impatto} forte/></div>

                  <div>
                    <CfrLivello p={r.residuoProb} i={r.residuoImpatto}
                      nota={delta > 0 ? `−${delta}` : r.trattamento === 'accettare' ? 'accettato' : 'invariato'}
                      notaTono={delta > 0 ? ADM.OK : r.trattamento === 'accettare' ? ADM.MUTED_SOFT : ADM.WARN}/>
                  </div>

                  <div style={{fontSize:12.8, color:ADM.TEXT, fontWeight:600}}>{CFR_TRATT[r.trattamento] || r.trattamento}</div>

                  <div style={{fontSize:12.6, color:ADM.MUTED, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{r.responsabile}</div>

                  <div><CfrChips items={r.controlli}/></div>

                  <div>
                    <CfPill tono={st.tono}>{st.label}</CfPill>
                    <div style={{fontSize:11.4, marginTop:4, whiteSpace:'nowrap',
                      color: r.ultimoRiesame ? ADM.MUTED : ADM.DANGER, fontWeight: r.ultimoRiesame ? 500 : 700}}>
                      {r.ultimoRiesame ? `riesame ${cfFmt(r.ultimoRiesame)}` : 'mai riesaminato'}
                    </div>
                  </div>

                  <BuIcons.chevronRight size={15} color={ADM.MUTED_SOFT} className="adm-row-chev"/>
                </div>

                {espanso && (
                  <div style={{padding:'16px 18px', background:ADM.PANEL_SOFT}}>
                    <div style={{display:'grid', gridTemplateColumns:'minmax(0,2fr) minmax(0,1.25fr)', gap:24}}>
                      <div>
                        <div style={{fontSize:11.2, color:ADM.MUTED, textTransform:'uppercase', letterSpacing:'0.05em', fontWeight:700}}>
                          Misure attuate
                        </div>
                        <div style={{fontSize:13.2, color:ADM.TEXT, lineHeight:1.6, marginTop:5}}>{r.misure}</div>

                        <div style={{fontSize:11.2, color:ADM.MUTED, textTransform:'uppercase', letterSpacing:'0.05em',
                          fontWeight:700, marginTop:14}}>Controlli Annex A applicati</div>
                        <div style={{marginTop:6}}><CfrChips items={r.controlli}/></div>

                        <div style={{fontSize:12.2, color:ADM.MUTED, lineHeight:1.55, marginTop:14,
                          paddingTop:12, borderTop:`1px dashed ${ADM.BORDER}`}}>
                          {delta > 0
                            ? `Il trattamento porta il livello da ${livI} a ${livR}: è questo scarto che rende il controllo giustificabile nella Dichiarazione di Applicabilità.`
                            : r.trattamento === 'accettare'
                              ? `Livello invariato a ${livI} per scelta: il rischio è accettato formalmente, con il razionale scritto sopra e il responsabile che lo sottoscrive.`
                              : `Livello invariato a ${livI} nonostante il trattamento dichiarato: o le misure non sono ancora efficaci, o la valutazione va rifatta.`}
                        </div>
                      </div>

                      <div>
                        <div style={{display:'grid', gridTemplateColumns:'repeat(2, minmax(0,1fr))', gap:12}}>
                          <CfrVoce k="Categoria" v={r.categoria}/>
                          <CfrVoce k="Trattamento" v={CFR_TRATT[r.trattamento] || r.trattamento}/>
                          <CfrVoce k="Responsabile" v={r.responsabile}/>
                          <CfrVoce k="Stato" v={st.label}/>
                          <CfrVoce k="Inerente" v={`${livI} · ${r.prob} × ${r.impatto}`}/>
                          <CfrVoce k="Residuo" v={`${livR} · ${r.residuoProb} × ${r.residuoImpatto}`}/>
                          <CfrVoce k="Ultimo riesame"
                            v={r.ultimoRiesame ? `${cfFmt(r.ultimoRiesame)} · ${cfrQuandoFa(r.ultimoRiesame)}` : 'mai riesaminato'}
                            tono={r.ultimoRiesame ? null : 'DANGER'}/>
                          <CfrVoce k="Cadenza" v="ogni 6 mesi"/>
                        </div>
                        <div style={{display:'flex', justifyContent:'flex-end', marginTop:16}}>
                          <AdmButton variant="secondary" size="sm" onClick={()=>setRiesame(r)}>Riesamina</AdmButton>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div style={{fontSize:12, color:ADM.MUTED, marginTop:10, lineHeight:1.55}}>
          Il riesame non è una firma di cortesia: è la verifica che probabilità, impatto e misure
          siano ancora quelli di sei mesi fa. Un rischio senza data di riesame vale come non valutato.
        </div>
      </div>

      {/* Popup riesame — azione sensibile, quindi conferma esplicita */}
      {riesame && (
        <div onClick={()=>setRiesame(null)} style={{position:'absolute', inset:0, zIndex:60,
          background:'rgba(15,17,21,0.42)', backdropFilter:'blur(3px)'}}>
          {/* La tab è più alta della finestra: centrare sul contenitore manderebbe
              la modale fuori campo. La fascia sticky la tiene al centro di ciò che si vede. */}
          <div style={{position:'sticky', top:'50%', display:'flex', justifyContent:'center'}}>
          <div style={{transform:'translateY(-50%)'}}>
          <div onClick={e=>e.stopPropagation()} style={{width:480, maxWidth:'90%', background:'#fff', borderRadius:14,
            padding:'20px 22px', boxShadow:'0 24px 64px rgba(15,17,21,0.30)', animation:'admModalIn 0.18s ease'}}>
            <div style={{fontSize:16, fontWeight:800, color:ADM.TEXT, marginBottom:6}}>
              Registrare il riesame di {riesame.id}?
            </div>
            <div style={{fontSize:13, color:ADM.MUTED, lineHeight:1.55, marginBottom:14}}>
              Stai attestando che probabilità, impatto e misure di questo rischio sono ancora
              quelli scritti nel registro. La data di oggi diventa l&rsquo;ultimo riesame: se qualcosa è
              cambiato, va prima corretta la valutazione.
            </div>
            <div style={{padding:'12px 14px', borderRadius:10, background:ADM.NEUTRAL_SOFT, marginBottom:16}}>
              {[
                ['Rischio', riesame.titolo],
                ['Livello inerente', `${cfrLiv(riesame.prob, riesame.impatto)} · ${riesame.prob} × ${riesame.impatto}`],
                ['Livello residuo', `${cfrLiv(riesame.residuoProb, riesame.residuoImpatto)} · ${riesame.residuoProb} × ${riesame.residuoImpatto}`],
                ['Riesame precedente', riesame.ultimoRiesame ? cfFmt(riesame.ultimoRiesame) : 'mai eseguito'],
              ].map(([k, v]) => (
                <div key={k} style={{display:'flex', gap:10, fontSize:12.8, marginBottom:5}}>
                  <span style={{color:ADM.MUTED, width:132, flexShrink:0}}>{k}</span>
                  <span style={{color:ADM.TEXT, fontWeight:600}}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{display:'flex', justifyContent:'flex-end', gap:8}}>
              <AdmButton variant="secondary" size="sm" onClick={()=>setRiesame(null)}>Annulla</AdmButton>
              <AdmButton variant="primary" size="sm" onClick={confermaRiesame}>Registra il riesame</AdmButton>
            </div>
          </div>
          </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Registro dei fornitori ────────────────────────────────────────────────
function CfFornitori() {
  const [aperto, setAperto]   = useStateCfr(null);
  const [conferma, setConferma] = useStateCfr(null);
  const [, forza]             = useStateCfr(0);

  const senzaDpa   = FORNITORI.filter(f => !f.dpa).length;
  const maiRiesam  = FORNITORI.filter(f => !f.ultimoRiesame).length;
  const critiche   = FORNITORI.filter(f => f.criticita === 'alta').length;
  const buchi      = FORNITORI.filter(f => !f.dpa || !f.ultimoRiesame).length;

  // I problemi vanno in cima, e fra i problemi prima chi è più critico: un
  // fornitore senza contratto che tratta dati di pagamento non può stare
  // in fondo alla lista solo perché la lista è in ordine alfabetico.
  const peso = (f) => (f.dpa ? 0 : 2) + (f.ultimoRiesame ? 0 : 1);
  const righe = FORNITORI.slice().sort((a, b) =>
    peso(b) - peso(a)
    || (CFR_CRIT_RANK[b.criticita] || 0) - (CFR_CRIT_RANK[a.criticita] || 0)
    || a.nome.localeCompare(b.nome));

  const confermaFornitore = () => {
    if (!conferma) return;
    conferma.ultimoRiesame = new Date();
    conferma.esito = 'confermato';
    setConferma(null);
    forza(n => n + 1);
  };

  const GRID = 'minmax(0,2fr) minmax(0,1.7fr) 96px minmax(0,1.6fr) 1.25fr 1.15fr 1.05fr 30px';
  const sintesi = [
    { n:FORNITORI.length, label:'fornitori nel registro', nota:'trattano dati per conto di Byup' },
    { n:critiche,   label:'ad alta criticità', nota:'un loro guasto è un guasto nostro', coral:critiche > 0 },
    { n:senzaDpa,   label:'senza DPA',         nota:'art. 28 GDPR · A.5.20', tono: senzaDpa ? 'DANGER' : 'OK' },
    { n:maiRiesam,  label:'mai riesaminati',   nota:'A.5.22 · §8.4',         tono: maiRiesam ? 'WARN' : 'OK' },
  ];

  return (
    <div style={{padding:'20px 22px', display:'flex', flexDirection:'column', gap:20, position:'relative'}}>

      <div style={{display:'flex', alignItems:'center', gap:16, padding:'14px 16px', borderRadius:10,
        background: senzaDpa ? ADM.DANGER_SOFT : maiRiesam ? '#FFF7E6' : ADM.OK_SOFT,
        border:`1px solid ${senzaDpa ? '#FECACA' : maiRiesam ? '#FDE68A' : '#BBF7D0'}`}}>
        <div style={{flex:1, minWidth:0}}>
          <div style={{fontSize:14.5, fontWeight:800, color: senzaDpa ? '#7F1D1D' : maiRiesam ? '#78350F' : '#065F46'}}>
            {buchi
              ? `${buchi} fornitori con un buco da chiudere`
              : 'Registro dei fornitori completo e riesaminato'}
          </div>
          <div style={{fontSize:12.8, color:ADM.MUTED, marginTop:3}}>
            {buchi
              ? 'Senza DPA non esiste la base contrattuale al trattamento; senza riesame non esiste la prova che il controllo sia ancora attivo. Sono i due rilievi che un auditor trova nei primi cinque minuti.'
              : `${FORNITORI.length} fornitori, tutti con accordo sul trattamento e riesame registrato.`}
          </div>
        </div>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'repeat(4, minmax(0,1fr))', gap:10}}>
        {sintesi.map(s => (
          <div key={s.label} style={{...CF_CARD, padding:'13px 15px'}}>
            <div style={{fontSize:23, fontWeight:800, letterSpacing:'-0.02em', lineHeight:1,
              color: s.tono ? (s.n ? CF_TONO(s.tono) : ADM.TEXT) : s.coral ? ADM.PINK : ADM.TEXT}}>{s.n}</div>
            <div style={{fontSize:12.2, color:ADM.MUTED, marginTop:6}}>{s.label}</div>
            <div style={{fontSize:11, color:ADM.MUTED_SOFT, marginTop:2}}>{s.nota}</div>
          </div>
        ))}
      </div>

      <div>
        <div style={{display:'flex', alignItems:'baseline', gap:10, marginBottom:10}}>
          <div style={{...CF_H, marginBottom:0}}>Fornitori e sub-responsabili</div>
          <span style={{fontSize:12.4, color:ADM.MUTED}}>prima i buchi, poi per criticità decrescente</span>
        </div>

        <div style={CF_CARD}>
          <div style={{...CF_TH, display:'grid', gridTemplateColumns:GRID, gap:10}}>
            <div>Fornitore</div><div>Dati trattati</div><div>Criticità</div><div>DPA e documento</div>
            <div>Certificazioni</div><div>Paese</div><div>Ultimo riesame</div><div/>
          </div>

          {righe.map((f, idx) => {
            const espanso = aperto === f.id;
            const ultimo = idx === righe.length - 1;
            const extraUe = /SCC/.test(f.paese || '');
            const problema = !f.dpa || !f.ultimoRiesame;
            const nota = !f.dpa && !f.ultimoRiesame
              ? 'Nessun accordo sul trattamento e nessun riesame: oggi questo fornitore è fuori controllo sulla carta, qualunque cosa faccia in pratica.'
              : !f.dpa
                ? 'Nessun accordo sul trattamento dei dati: l’art. 28 GDPR lo pretende per chiunque tratti dati per conto di Byup, e A.5.20 chiede che i requisiti di sicurezza siano scritti nel contratto.'
                : 'Mai riesaminato: A.5.22 chiede di verificare periodicamente che servizio, dati trattati e certificazioni siano ancora quelli concordati.';
            return (
              <div key={f.id} style={{borderBottom: !ultimo || espanso ? `1px solid ${ADM.BORDER_SOFT}` : 'none'}}>
                <div className="adm-row-open" onClick={()=>setAperto(espanso ? null : f.id)}
                  style={{padding:'12px 16px', cursor:'pointer',
                    background: espanso ? ADM.PANEL_SOFT : problema ? '#FFFBFB' : '#fff'}}>
                  <div style={{display:'grid', gridTemplateColumns:GRID, gap:10, alignItems:'center'}}>
                    <div style={{minWidth:0}}>
                      <div style={{fontSize:13.4, fontWeight:700, color:ADM.TEXT}}>{f.nome}</div>
                      <div style={{fontSize:11.8, color:ADM.MUTED, marginTop:3, lineHeight:1.35}}>{f.servizio}</div>
                    </div>

                    <div style={{fontSize:12, color:ADM.MUTED, lineHeight:1.4}}>{f.dati}</div>

                    <div><CfrCriticita liv={f.criticita}/></div>

                    <div style={{minWidth:0}}>
                      <CfPill tono={f.dpa ? 'OK' : 'DANGER'}>{f.dpa ? 'DPA firmato' : 'Nessun DPA'}</CfPill>
                      {/* In riga solo il nome del file: il percorso intero sta nella
                          fascia di dettaglio, dove c'è lo spazio per leggerlo. */}
                      <div style={{marginTop:5, overflow:'hidden', whiteSpace:'nowrap'}}>
                        <CfDoc doc={f.doc ? String(f.doc).split('/').pop() : null}/>
                      </div>
                    </div>

                    <div><CfrChips items={f.certificazioni}/></div>

                    <div>
                      <div style={{fontSize:12.2, color:ADM.TEXT, lineHeight:1.35}}>{f.paese}</div>
                      {extraUe && <div style={{fontSize:11, color:ADM.MUTED_SOFT, marginTop:2}}>trasferimento extra-UE</div>}
                    </div>

                    <div>
                      {f.ultimoRiesame ? (
                        <>
                          <div style={{fontSize:12.6, color:ADM.TEXT}}>{cfFmt(f.ultimoRiesame)}</div>
                          <div style={{fontSize:11.2, color:ADM.MUTED_SOFT, marginTop:2}}>{cfrQuandoFa(f.ultimoRiesame)}</div>
                        </>
                      ) : (
                        <div style={{fontSize:12.6, color:ADM.WARN, fontWeight:700}}>mai</div>
                      )}
                    </div>

                    <BuIcons.chevronRight size={15} color={ADM.MUTED_SOFT} className="adm-row-chev"/>
                  </div>

                  {problema && (
                    <div style={{display:'flex', alignItems:'flex-start', gap:8, marginTop:9, padding:'8px 11px',
                      borderRadius:8, background: !f.dpa ? ADM.DANGER_SOFT : ADM.WARN_SOFT}}>
                      <span style={{width:6, height:6, borderRadius:'50%', marginTop:5, flexShrink:0,
                        background: !f.dpa ? ADM.DANGER : ADM.WARN}}/>
                      <span style={{fontSize:12, lineHeight:1.5, color: !f.dpa ? '#7F1D1D' : '#78350F'}}>{nota}</span>
                    </div>
                  )}
                </div>

                {espanso && (
                  <div style={{padding:'16px 18px', background:ADM.PANEL_SOFT}}>
                    <div style={{display:'grid', gridTemplateColumns:'repeat(4, minmax(0,1fr))', gap:14}}>
                      <CfrVoce k="Fornitore" v={`${f.nome} · ${f.id}`}/>
                      <CfrVoce k="Servizio" v={f.servizio}/>
                      <CfrVoce k="Criticità" v={cfrCap(f.criticita)}/>
                      <CfrVoce k="Paese e trasferimento" v={f.paese}/>
                      <CfrVoce k="Dati trattati" v={f.dati}/>
                      <CfrVoce k="Accordo sul trattamento" v={f.dpa ? 'DPA firmato' : 'assente'} tono={f.dpa ? null : 'DANGER'}/>
                      <CfrVoce k="Certificazioni" v={(f.certificazioni || []).join(' · ') || '—'}/>
                      <CfrVoce k="Ultimo riesame"
                        v={f.ultimoRiesame ? `${cfFmt(f.ultimoRiesame)} · esito ${f.esito || '—'}` : 'mai riesaminato'}
                        tono={f.ultimoRiesame ? null : 'WARN'}/>
                    </div>

                    <div style={{display:'flex', alignItems:'center', gap:10, marginTop:14, paddingTop:12,
                      borderTop:`1px dashed ${ADM.BORDER}`}}>
                      <CfDoc doc={f.doc}/>
                      <div style={{flex:1}}/>
                      <AdmButton variant="secondary" size="sm" onClick={()=>setConferma(f)}>Conferma il fornitore</AdmButton>
                    </div>

                    <div style={{fontSize:12.2, color:ADM.MUTED, lineHeight:1.55, marginTop:12}}>
                      {extraUe
                        ? 'Il trasferimento fuori dall’Unione regge sulle clausole contrattuali standard: al riesame va verificato che siano ancora quelle in vigore e che il fornitore non abbia spostato la regione di elaborazione.'
                        : 'Elaborazione dentro l’Unione: nessuna garanzia aggiuntiva per il trasferimento da mantenere aggiornata.'}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div style={{fontSize:12, color:ADM.MUTED, marginTop:10, lineHeight:1.55}}>
          Il riesame annuale serve a rispondere a una domanda sola: questo fornitore fa ancora
          quello che c&rsquo;è scritto qui, con gli stessi dati e le stesse certificazioni? I documenti
          restano su Drive, il registro ci punta.
        </div>
      </div>

      {/* Popup conferma fornitore */}
      {conferma && (
        <div onClick={()=>setConferma(null)} style={{position:'absolute', inset:0, zIndex:60,
          background:'rgba(15,17,21,0.42)', backdropFilter:'blur(3px)'}}>
          <div style={{position:'sticky', top:'50%', display:'flex', justifyContent:'center'}}>
          <div style={{transform:'translateY(-50%)'}}>
          <div onClick={e=>e.stopPropagation()} style={{width:500, maxWidth:'90%', background:'#fff', borderRadius:14,
            padding:'20px 22px', boxShadow:'0 24px 64px rgba(15,17,21,0.30)', animation:'admModalIn 0.18s ease'}}>
            <div style={{fontSize:16, fontWeight:800, color:ADM.TEXT, marginBottom:6}}>
              Confermare {conferma.nome} come fornitore?
            </div>
            <div style={{fontSize:13, color:ADM.MUTED, lineHeight:1.55, marginBottom:14}}>
              Stai attestando che servizio, dati trattati, certificazioni e paese di elaborazione
              sono ancora quelli scritti nel registro. La data di oggi diventa l&rsquo;ultimo riesame e
              fa ripartire la cadenza annuale.
            </div>
            <div style={{padding:'12px 14px', borderRadius:10, background:ADM.NEUTRAL_SOFT, marginBottom:14}}>
              {[
                ['Servizio', conferma.servizio],
                ['Dati trattati', conferma.dati],
                ['Criticità', cfrCap(conferma.criticita)],
                ['Paese', conferma.paese],
                ['Riesame precedente', conferma.ultimoRiesame ? cfFmt(conferma.ultimoRiesame) : 'mai eseguito'],
              ].map(([k, v]) => (
                <div key={k} style={{display:'flex', gap:10, fontSize:12.8, marginBottom:5}}>
                  <span style={{color:ADM.MUTED, width:132, flexShrink:0}}>{k}</span>
                  <span style={{color:ADM.TEXT, fontWeight:600}}>{v}</span>
                </div>
              ))}
            </div>
            {!conferma.dpa && (
              <div style={{display:'flex', alignItems:'flex-start', gap:8, padding:'10px 12px', borderRadius:10,
                background:ADM.DANGER_SOFT, marginBottom:16}}>
                <span style={{width:6, height:6, borderRadius:'50%', background:ADM.DANGER, marginTop:5, flexShrink:0}}/>
                <span style={{fontSize:12.2, color:'#7F1D1D', lineHeight:1.5}}>
                  Manca il DPA. Confermare il fornitore aggiorna la data ma non chiude il rilievo:
                  finché il contratto non è firmato, il riesame certifica un rapporto senza base.
                </span>
              </div>
            )}
            <div style={{display:'flex', justifyContent:'flex-end', gap:8}}>
              <AdmButton variant="secondary" size="sm" onClick={()=>setConferma(null)}>Annulla</AdmButton>
              <AdmButton variant="primary" size="sm" onClick={confermaFornitore}>Registra il riesame</AdmButton>
            </div>
          </div>
          </div>
          </div>
        </div>
      )}
    </div>
  );
}

window.CfRischi = CfRischi;
window.CfFornitori = CfFornitori;
