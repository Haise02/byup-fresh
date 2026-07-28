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

// ─── Categorie di rischio ──────────────────────────────────────────────────
// Tassonomia chiusa: un rischio deve poter cadere in una sola casella, e ogni
// rischio futuro deve trovare la sua. Sono otto perché sotto si finisce a
// mettere tutto in «informatico», sopra si ottengono categorie da un elemento
// che come filtro non servono a niente.
//
// «Reputazionale» è deliberatamente assente: la perdita di reputazione è quasi
// sempre la CONSEGUENZA di uno di questi otto, non un rischio a sé. Tenerla
// come categoria porta a censire due volte lo stesso evento.
const CFR_CATEGORIE = [
  { id:'informatico',   label:'Informatico',   nota:'Guasti, indisponibilità, difetti del software' },
  { id:'accessi',       label:'Accessi',       nota:'Credenziali, privilegi, identità' },
  { id:'dati',          label:'Dati personali',nota:'Violazioni e trattamenti non conformi' },
  { id:'fornitori',     label:'Fornitori',     nota:'Dipendenza da terze parti e sub-responsabili' },
  { id:'organizzativo', label:'Organizzativo', nota:'Persone, ruoli, competenze, continuità del presidio' },
  { id:'operativo',     label:'Operativo',     nota:'Erogazione del servizio nei locali' },
  { id:'conformita',    label:'Conformità',    nota:'Obblighi legali, fiscali, contrattuali' },
  { id:'economico',     label:'Economico',     nota:'Ricavi, incassi, sostenibilità' },
];
const cfrCatLabel = (id) => (CFR_CATEGORIE.find(c => c.id === id) || {}).label || id;

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

// ─── Modale del rischio ────────────────────────────────────────────────────
// Un solo componente per due gesti, perché i campi sono gli stessi: rilevare un
// rischio è compilare la valutazione la prima volta, riesaminarlo è rimetterci
// mano. Cambia cosa è obbligatorio e cosa resta scritto nello storico.
// ─── Modale del rischio ────────────────────────────────────────────────────
// Un solo componente per due gesti, perché i campi sono gli stessi: rilevare un
// rischio è compilare la valutazione la prima volta, riesaminarlo è rimetterci
// mano. Cambia cosa è obbligatorio e cosa resta scritto nello storico.
//
// I NUMERI NON SI SCELGONO, SI LEGGONO. Probabilità e impatto si scelgono per
// nome — «Possibile», «Critico» — perché è così che si ragiona e si discute in
// riunione. Il numero resta, ma come RISULTATO: compare nella pastiglia del
// livello, che è la stessa che si vede nella tabella e nella matrice.
const CFR_INP = { width:'100%', padding:'9px 12px', border:`1px solid ${ADM.BORDER}`, borderRadius:9,
  fontSize:13.6, fontFamily:'inherit', color:ADM.TEXT, background:'#fff', outline:'none',
  boxSizing:'border-box', lineHeight:1.4 };

// La freccia è disegnata a mano: la select di sistema ne mette una diversa per
// piattaforma e spezza l'allineamento con gli input accanto.
const CFR_SEL = { ...CFR_INP, appearance:'none', WebkitAppearance:'none', MozAppearance:'none',
  paddingRight:34, cursor:'pointer',
  backgroundImage:"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8'%3E%3Cpath d='M1 1.6L6 6.4L11 1.6' stroke='%238A9099' stroke-width='1.9' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")",
  backgroundRepeat:'no-repeat', backgroundPosition:'right 12px center' };

const CFR_LAB  = { fontSize:11, color:ADM.MUTED, fontWeight:700, textTransform:'uppercase',
  letterSpacing:'0.05em', display:'block', marginBottom:6 };
const CFR_SEZ  = { fontSize:11.4, color:ADM.MUTED, fontWeight:700, textTransform:'uppercase',
  letterSpacing:'0.06em', marginBottom:12 };
const CFR_AIUTO = { fontSize:11.6, color:ADM.MUTED_SOFT, marginTop:5, lineHeight:1.45 };

function CfrCampo({ etichetta, aiuto, span, children }) {
  return (
    <div style={span ? {gridColumn:'1 / -1'} : undefined}>
      <label style={CFR_LAB}>{etichetta}</label>
      {children}
      {aiuto && <div style={CFR_AIUTO}>{aiuto}</div>}
    </div>
  );
}

// Select su scala 1-5 che mostra i nomi. Il valore resta il numero.
function CfrScelta({ etichetta, voci, valore, onChange }) {
  return (
    <div style={{marginBottom:10}}>
      <label style={{...CFR_LAB, marginBottom:5}}>{etichetta}</label>
      <select value={valore} onChange={e=>onChange(parseInt(e.target.value, 10))} style={CFR_SEL}>
        {voci.map((v, k) => <option key={v} value={k + 1}>{v}</option>)}
      </select>
    </div>
  );
}

// Il livello calcolato, nella stessa veste che ha nella tabella e nella matrice.
function CfrEsito({ p, i }) {
  const liv = cfrLiv(p, i);
  const alta = cfrFascia(liv) === 'alto';
  return (
    <div style={{display:'flex', alignItems:'center', gap:9, marginTop:12, paddingTop:12,
      borderTop:`1px dashed ${ADM.BORDER}`}}>
      <span style={{display:'inline-flex', alignItems:'baseline', gap:6, padding:'4px 11px', borderRadius:8,
        background: alta ? ADM.PINK : 'rgba(49,53,61,0.09)', color: alta ? '#fff' : ADM.INK, flexShrink:0}}>
        <span style={{fontSize:19, fontWeight:800, letterSpacing:'-0.02em'}}>{liv}</span>
        <span style={{fontSize:11.5, fontWeight:700, opacity:0.75}}>{cfrFascia(liv)}</span>
      </span>
      <span style={{fontSize:11.6, color:ADM.MUTED_SOFT, lineHeight:1.35}}>
        {CFR_PROB[p-1]} × {CFR_IMP[i-1]}
      </span>
    </div>
  );
}

function CfrModaleRischio({ modo, rischio, onChiudi, onSalva }) {
  const nuovo = modo === 'nuovo';
  const [b, setB] = useStateCfr(() => ({
    titolo:        rischio ? rischio.titolo : '',
    categoria:     rischio ? rischio.categoria : 'informatico',
    responsabile:  rischio ? rischio.responsabile : '',
    prob:          rischio ? rischio.prob : 3,
    impatto:       rischio ? rischio.impatto : 3,
    residuoProb:   rischio ? rischio.residuoProb : 3,
    residuoImpatto:rischio ? rischio.residuoImpatto : 3,
    trattamento:   rischio ? rischio.trattamento : 'mitigare',
    stato:         rischio ? rischio.stato : 'nuovo',
    controlli:     rischio ? (rischio.controlli || []).join(', ') : '',
    misure:        rischio ? rischio.misure : '',
    nota:          '',
  }));
  const agg = (k, v) => setB(x => ({ ...x, [k]: v }));

  const livI = cfrLiv(b.prob, b.impatto);
  const livR = cfrLiv(b.residuoProb, b.residuoImpatto);
  // Nel riesame la nota è obbligatoria: un riesame senza una riga di esito è la
  // firma di cortesia che la norma non accetta come evidenza.
  const puoSalvare = nuovo
    ? b.titolo.trim().length > 2 && b.misure.trim().length > 2 && b.responsabile.trim().length > 1
    : b.nota.trim().length > 2;

  const storico = (rischio && rischio.riesami) || [];
  const cat = CFR_CATEGORIE.find(c => c.id === b.categoria) || {};

  return (
    <div onClick={onChiudi} style={{position:'absolute', inset:0, zIndex:60,
      background:'rgba(15,17,21,0.42)', backdropFilter:'blur(3px)'}}>
      <div style={{position:'sticky', top:'50%', display:'flex', justifyContent:'center'}}>
      <div style={{transform:'translateY(-50%)'}}>
      <div onClick={e=>e.stopPropagation()} style={{width:740, maxWidth:'92%', background:'#fff', borderRadius:16,
        boxShadow:'0 24px 64px rgba(15,17,21,0.30)', animation:'admModalIn 0.18s ease',
        maxHeight:'80vh', display:'flex', flexDirection:'column'}}>

        <div style={{padding:'20px 26px 16px', borderBottom:`1px solid ${ADM.BORDER}`, flexShrink:0}}>
          <div style={{fontSize:17, fontWeight:800, color:ADM.TEXT, letterSpacing:'-0.01em'}}>
            {nuovo ? 'Rilevare un nuovo rischio' : `Riesame di ${rischio.id}`}
          </div>
          <div style={{fontSize:12.8, color:ADM.MUTED, marginTop:4, lineHeight:1.5}}>
            {nuovo
              ? 'La valutazione va compilata adesso: un rischio censito senza probabilità, impatto e misure non è un rischio valutato.'
              : 'Correggi ciò che è cambiato e scrivi l’esito. La data di oggi diventa l’ultimo riesame e la nota resta nello storico.'}
          </div>
        </div>

        <div style={{padding:'20px 26px 24px', overflowY:'auto', flex:1, minHeight:0,
          display:'flex', flexDirection:'column', gap:24}}>

          {/* 1 — che cosa può andare storto */}
          <div>
            <div style={CFR_SEZ}>Il rischio</div>
            <div style={{display:'grid', gridTemplateColumns:'repeat(2, minmax(0,1fr))', gap:16}}>
              <CfrCampo etichetta="Descrizione" span>
                <input value={b.titolo} onChange={e=>agg('titolo', e.target.value)} style={CFR_INP}
                  placeholder="Che cosa può andare storto, in una riga"/>
              </CfrCampo>
              <CfrCampo etichetta="Categoria" aiuto={cat.nota}>
                <select value={b.categoria} onChange={e=>agg('categoria', e.target.value)} style={CFR_SEL}>
                  {CFR_CATEGORIE.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
              </CfrCampo>
              <CfrCampo etichetta="Responsabile" aiuto="Chi risponde di questo rischio, non chi lo ha scritto">
                <input value={b.responsabile} onChange={e=>agg('responsabile', e.target.value)} style={CFR_INP}
                  placeholder="Nome e cognome"/>
              </CfrCampo>
            </div>
          </div>

          {/* 2 — la valutazione, per nome */}
          <div>
            <div style={CFR_SEZ}>Valutazione</div>
            <div style={{border:`1px solid ${ADM.BORDER}`, borderRadius:12, padding:'16px 18px', background:'#FCFCFD'}}>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:0}}>
                <div style={{paddingRight:20}}>
                  <div style={{fontSize:13.4, fontWeight:800, color:ADM.TEXT}}>Inerente</div>
                  <div style={{fontSize:11.6, color:ADM.MUTED_SOFT, marginTop:2, marginBottom:12}}>
                    prima del trattamento
                  </div>
                  <CfrScelta etichetta="Probabilità" voci={CFR_PROB} valore={b.prob} onChange={v=>agg('prob', v)}/>
                  <CfrScelta etichetta="Impatto" voci={CFR_IMP} valore={b.impatto} onChange={v=>agg('impatto', v)}/>
                  <CfrEsito p={b.prob} i={b.impatto}/>
                </div>
                <div style={{paddingLeft:20, borderLeft:`1px solid ${ADM.BORDER}`}}>
                  <div style={{fontSize:13.4, fontWeight:800, color:ADM.TEXT}}>Residuo</div>
                  <div style={{fontSize:11.6, color:ADM.MUTED_SOFT, marginTop:2, marginBottom:12}}>
                    dopo le misure attuate
                  </div>
                  <CfrScelta etichetta="Probabilità" voci={CFR_PROB} valore={b.residuoProb} onChange={v=>agg('residuoProb', v)}/>
                  <CfrScelta etichetta="Impatto" voci={CFR_IMP} valore={b.residuoImpatto} onChange={v=>agg('residuoImpatto', v)}/>
                  <CfrEsito p={b.residuoProb} i={b.residuoImpatto}/>
                </div>
              </div>

              <div style={{marginTop:14, paddingTop:12, borderTop:`1px solid ${ADM.BORDER}`,
                fontSize:12.4, lineHeight:1.5, color: livR > livI ? ADM.DANGER : ADM.MUTED}}>
                {livR > livI
                  ? 'Il residuo è più alto dell’inerente: un trattamento non aggrava un rischio. Uno dei due valori è sbagliato.'
                  : livR === livI
                    ? 'Livello invariato: se il trattamento non sposta nulla va spiegato nelle misure, oppure il rischio va accettato formalmente.'
                    : `Il trattamento vale −${livI - livR}: è questo scarto a rendere giustificabili i controlli nella Dichiarazione di Applicabilità.`}
              </div>
            </div>
          </div>

          {/* 3 — che cosa si fa */}
          <div>
            <div style={CFR_SEZ}>Trattamento</div>
            <div style={{display:'grid', gridTemplateColumns:'repeat(2, minmax(0,1fr))', gap:16}}>
              <CfrCampo etichetta="Strategia">
                <select value={b.trattamento} onChange={e=>agg('trattamento', e.target.value)} style={CFR_SEL}>
                  {Object.entries(CFR_TRATT).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </CfrCampo>
              <CfrCampo etichetta="Stato">
                <select value={b.stato} onChange={e=>agg('stato', e.target.value)} style={CFR_SEL}>
                  {Object.entries(CFR_STATO).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </CfrCampo>
              <CfrCampo etichetta="Controlli Annex A" span
                aiuto="Separati da virgola. Sono i controlli che giustificherai nella Dichiarazione di Applicabilità.">
                <input value={b.controlli} onChange={e=>agg('controlli', e.target.value)} style={CFR_INP}
                  placeholder="A.5.15, A.8.13"/>
              </CfrCampo>
              <CfrCampo etichetta="Misure attuate" span>
                <textarea value={b.misure} onChange={e=>agg('misure', e.target.value)} rows={3}
                  style={{...CFR_INP, resize:'vertical'}}
                  placeholder="Che cosa è stato fatto concretamente per abbassare il livello"/>
              </CfrCampo>
            </div>
          </div>

          {/* 4 — solo nel riesame */}
          {!nuovo && (
            <div>
              <div style={CFR_SEZ}>Esito del riesame</div>
              <textarea value={b.nota} onChange={e=>agg('nota', e.target.value)} rows={3}
                style={{...CFR_INP, resize:'vertical'}}
                placeholder="Che cosa hai verificato e che cosa è cambiato dall’ultima volta"/>

              {storico.length > 0 && (
                <div style={{marginTop:18}}>
                  <div style={CFR_SEZ}>Riesami precedenti</div>
                  <div style={{display:'flex', flexDirection:'column', gap:8}}>
                    {storico.slice().reverse().map((v, k) => (
                      <div key={k} style={{padding:'11px 13px', borderRadius:10, background:ADM.NEUTRAL_SOFT}}>
                        <div style={{display:'flex', alignItems:'baseline', gap:9, flexWrap:'wrap'}}>
                          <span style={{fontSize:12.6, fontWeight:700, color:ADM.TEXT}}>{cfFmt(v.data)}</span>
                          <span style={{fontSize:12.2, color:ADM.MUTED}}>{v.chi}</span>
                          <span style={{fontSize:11.4, color:ADM.MUTED_SOFT}}>
                            {CFR_PROB[v.prob-1]} × {CFR_IMP[v.impatto-1]} · residuo {cfrLiv(v.residuoProb, v.residuoImpatto)}
                          </span>
                        </div>
                        <div style={{fontSize:12.6, color:ADM.TEXT, marginTop:5, lineHeight:1.5}}>{v.nota}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div style={{padding:'15px 26px', borderTop:`1px solid ${ADM.BORDER}`, display:'flex',
          alignItems:'center', gap:12, flexShrink:0}}>
          <span style={{fontSize:12.2, color:ADM.MUTED, flex:1, lineHeight:1.45}}>
            {puoSalvare
              ? (nuovo ? 'Il rischio entra nel registro con la data di oggi come prima valutazione.'
                       : 'La data di oggi diventa l’ultimo riesame.')
              : (nuovo ? 'Servono almeno descrizione, responsabile e misure attuate.'
                       : 'Serve l’esito del riesame: senza, non è evidenza.')}
          </span>
          <AdmButton variant="secondary" size="sm" onClick={onChiudi}>Annulla</AdmButton>
          <AdmButton variant="primary" size="sm" disabled={!puoSalvare} onClick={()=>onSalva(b)}>
            {nuovo ? 'Aggiungi al registro' : 'Registra il riesame'}
          </AdmButton>
        </div>
      </div>
      </div>
      </div>
    </div>
  );
}


// ─── Registro dei rischi ───────────────────────────────────────────────────
function CfRischi() {
  const [vista, setVista]     = useStateCfr('inerente');  // la matrice mostra prima o dopo il trattamento
  const [sel, setSel]         = useStateCfr(null);        // cella selezionata { p, i }
  const [cat, setCat]         = useStateCfr(null);        // categoria filtrata
  const [aperto, setAperto]   = useStateCfr(null);        // riga espansa
  const [modale, setModale]   = useStateCfr(null);        // { modo, rischio }
  const [, forza]             = useStateCfr(0);           // i dati sono mutati in place: qui si forza il render

  // La matrice conta sempre TUTTI i rischi: se contasse solo la categoria
  // filtrata, il filtro nasconderebbe proprio il quadro d'insieme che la
  // matrice esiste per dare.
  const celle = {};
  RISCHI.forEach(r => {
    const c = cfrCoord(r, vista);
    const k = c.p + '-' + c.i;
    (celle[k] = celle[k] || []).push(r);
  });

  // Solo le categorie che hanno almeno un rischio: un filtro che porta a zero
  // risultati è una promessa non mantenuta.
  const categorieVive = CFR_CATEGORIE
    .map(c => ({ ...c, n: RISCHI.filter(r => r.categoria === c.id).length }))
    .filter(c => c.n > 0);

  // Ordinamento per livello inerente decrescente: l'elenco deve aprirsi su ciò
  // che fa più male, non sull'ordine in cui i rischi sono stati scritti.
  const righe = RISCHI
    .filter(r => {
      if (cat && r.categoria !== cat) return false;
      if (!sel) return true;
      const c = cfrCoord(r, vista);
      return c.p === sel.p && c.i === sel.i;
    })
    .slice()
    .sort((a, b) => cfrLiv(b.prob, b.impatto) - cfrLiv(a.prob, a.impatto)
      || cfrLiv(b.residuoProb, b.residuoImpatto) - cfrLiv(a.residuoProb, a.residuoImpatto)
      || a.id.localeCompare(b.id));

  const salva = (b) => {
    const controlli = b.controlli.split(',').map(s => s.trim()).filter(Boolean);
    const oggi = new Date();
    if (modale.modo === 'nuovo') {
      const num = RISCHI.reduce((m, r) => Math.max(m, parseInt(r.id.slice(1), 10) || 0), 0) + 1;
      RISCHI.push({
        id: 'R' + String(num).padStart(2, '0'),
        titolo:b.titolo.trim(), categoria:b.categoria, responsabile:b.responsabile.trim(),
        prob:b.prob, impatto:b.impatto, residuoProb:b.residuoProb, residuoImpatto:b.residuoImpatto,
        trattamento:b.trattamento, stato:b.stato, controlli, misure:b.misure.trim(),
        // La rilevazione È la prima valutazione: datarla oggi è corretto, ed
        // evita che un rischio appena censito compaia subito come mai riesaminato.
        ultimoRiesame: oggi,
        riesami:[{ data:oggi, chi:'Marco Rinaldi', esito:'rilevato',
          nota:'Rischio rilevato e valutato per la prima volta.',
          prob:b.prob, impatto:b.impatto, residuoProb:b.residuoProb, residuoImpatto:b.residuoImpatto }],
      });
    } else {
      const r = modale.rischio;
      Object.assign(r, {
        titolo:b.titolo.trim(), categoria:b.categoria, responsabile:b.responsabile.trim(),
        prob:b.prob, impatto:b.impatto, residuoProb:b.residuoProb, residuoImpatto:b.residuoImpatto,
        trattamento:b.trattamento, stato:b.stato, controlli, misure:b.misure.trim(),
        ultimoRiesame: oggi,
      });
      r.riesami = (r.riesami || []).concat([{
        data:oggi, chi:'Marco Rinaldi', esito:'riesaminato', nota:b.nota.trim(),
        prob:b.prob, impatto:b.impatto, residuoProb:b.residuoProb, residuoImpatto:b.residuoImpatto,
      }]);
    }
    setModale(null);
    forza(n => n + 1);
  };

  const GRID = 'minmax(0,2.1fr) 96px 116px 0.95fr 1.1fr 1.3fr 1.35fr 30px';

  return (
    <div style={{padding:'20px 22px', display:'flex', flexDirection:'column', gap:20, position:'relative'}}>

      {/* Matrice */}
      <div>
        <div style={{display:'flex', alignItems:'center', gap:12, marginBottom:12}}>
          <div style={{...CF_H, marginBottom:0}}>Matrice probabilità × impatto</div>
          {/* Solo lo stato del filtro, non l'istruzione per attivarlo: le celle
              piene sono già interattive al passaggio del mouse. */}
          {sel && (
            <span style={{fontSize:12.4, color:ADM.MUTED}}>
              filtro attivo: {CFR_PROB[sel.p-1]} × {CFR_IMP[sel.i-1]}
            </span>
          )}
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
          <div style={{flex:1}}/>
          <AdmButton variant="primary" size="sm" onClick={()=>setModale({ modo:'nuovo', rischio:null })}>
            Rileva un rischio
          </AdmButton>
        </div>

        {/* Filtro per categoria. Le pastiglie portano il conteggio: si vede
            quanto pesa una categoria prima ancora di cliccarla. */}
        <div style={{display:'flex', alignItems:'center', gap:6, flexWrap:'wrap', marginBottom:10}}>
          {[{ id:null, label:'Tutte', n:RISCHI.length }].concat(categorieVive).map(c => {
            const attiva = cat === c.id;
            return (
              <button key={c.id || 'tutte'} onClick={()=>setCat(c.id)}
                style={{padding:'5px 11px', borderRadius:999, fontFamily:'inherit', fontSize:12.4,
                  fontWeight:700, cursor:'pointer', display:'inline-flex', alignItems:'center', gap:6,
                  border:`1px solid ${attiva ? ADM.TEXT : ADM.BORDER}`,
                  background: attiva ? ADM.TEXT : '#fff', color: attiva ? '#fff' : ADM.TEXT}}
                title={c.nota || undefined}>
                {c.label}
                <span style={{fontSize:11.2, fontWeight:700, opacity: attiva ? 0.75 : 0.5}}>{c.n}</span>
              </button>
            );
          })}
        </div>

        <div style={CF_CARD}>
          <div style={{...CF_TH, display:'grid', gridTemplateColumns:GRID, gap:10}}>
            <div>Rischio</div><div>Inerente</div><div>Residuo</div><div>Trattamento</div>
            <div>Responsabile</div><div>Controlli Annex A</div><div>Stato</div><div/>
          </div>

          {/* I due filtri si sommano: categoria e cella possono non avere
              intersezione, e allora va detto quale dei due togliere. */}
          {righe.length === 0 && (
            <div style={{padding:'26px 16px', textAlign:'center'}}>
              <div style={{fontSize:13.4, color:ADM.TEXT, fontWeight:600}}>Nessun rischio con questi filtri</div>
              <div style={{fontSize:12.4, color:ADM.MUTED, marginTop:4}}>
                {cat && sel
                  ? `Nessun rischio della categoria ${cfrCatLabel(cat)} sta nella cella ${CFR_PROB[sel.p-1]} × ${CFR_IMP[sel.i-1]}.`
                  : cat ? `La categoria ${cfrCatLabel(cat)} non ha rischi.` : 'La cella selezionata è vuota.'}
              </div>
            </div>
          )}

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
                    <div style={{fontSize:11.6, color:ADM.MUTED_SOFT, marginTop:3}}>{cfrCatLabel(r.categoria)}</div>
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
                          <CfrVoce k="Categoria" v={cfrCatLabel(r.categoria)}/>
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
                          <AdmButton variant="secondary" size="sm" onClick={()=>setModale({ modo:'riesame', rischio:r })}>Riesamina</AdmButton>
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

      {/* La chiave forza il rimontaggio a ogni apertura: la bozza della modale
          nasce da useState(init), che gira SOLO al mount. Senza, passare da un
          rischio all'altro riproporrebbe i valori del precedente. */}
      {modale && (
        <CfrModaleRischio key={`${modale.modo}:${modale.rischio ? modale.rischio.id : 'nuovo'}`}
          modo={modale.modo} rischio={modale.rischio}
          onChiudi={()=>setModale(null)} onSalva={salva}/>
      )}
    </div>
  );
}

// ─── Registro dei fornitori ────────────────────────────────────────────────
function CfFornitori() {
  const [aperto, setAperto]   = useStateCfr(null);
  const [conferma, setConferma] = useStateCfr(null);
  const [, forza]             = useStateCfr(0);

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
  // Nessun cappello: né KPI né striscia di riepilogo. Su sette righe contare le
  // righe non è un dato, e riassumere le eccezioni sopra una tabella che le
  // mette già in cima, colorate e con la nota, è dire due volte la stessa cosa.
  // Lo spazio va al registro.

  return (
    <div style={{padding:'20px 22px', display:'flex', flexDirection:'column', gap:20, position:'relative'}}>

      <div>
        {/* Nessuna intestazione di sezione: la tab si chiama già Fornitori, e
            l'ordinamento si vede — i due con un buco sono le prime due righe. */}
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
