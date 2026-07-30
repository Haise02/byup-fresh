// Byup Spot — Chiamata assistenza
//
// Quattro tab, un solo tema: il rapporto fra byup e il ristoratore quando
// qualcosa non va.
//
//   Richiamate  la coda operativa — chi va richiamato, entro quando
//   FAQ         le risposte scritte, pubblicabili una per una
//   Guide       gli articoli con video, raggruppati per argomento
//   Andamento   i KPI, gli stessi che il tab «Servizio Clienti» della
//               Dashboard mostra — stessa funzione, non due conti paralleli
//
// Il tab Andamento e il tab della Dashboard renderizzano lo STESSO componente
// (AdmServizioClientiKPI). Duplicarne il calcolo significherebbe, prima o poi,
// due schermate che dicono numeri diversi sulla stessa cosa.
//
// ─── Impianto visivo ────────────────────────────────────────────────────────
// La sezione non inventa un proprio linguaggio: prende in prestito i due
// idiomi che Spot ha già.
//
//   Richiamate → l'inbox a due pannelli di Comunicazioni. È la stessa cosa
//     (una coda di richieste che arrivano dai locali, una alla volta da
//     lavorare), quindi deve avere la stessa forma: elenco fitto a sinistra,
//     dettaglio a destra, azioni ancorate in fondo. La versione a card
//     impilate a tutta larghezza costringeva a scorrere per contare la coda e
//     ripeteva su ogni riga informazioni che servono solo su quella aperta.
//
//   FAQ, Guide, Andamento → le rubriche e i tier della Dashboard. Titoli come
//     SectionLabel (maiuscoletto tenue + descrizione accanto), non come
//     intestazioni nere; contenuto dentro POCHE card grandi divise da filetti,
//     non tante card piccole affiancate.

const { useState: useStateSrv, useMemo: useMemoSrv } = React;

// Chi sta usando la console. Non riuso MY_ID di Comunicazioni: che le due
// sezioni abbiano lo stesso operatore è una coincidenza dei dati demo, non un
// legame da rendere strutturale.
const SRV_IO = 'support1';

const SRV_INP = { width:'100%', padding:'9px 12px', border:`1px solid ${ADM.BORDER}`, borderRadius:9,
  fontSize:13.6, fontFamily:'inherit', color:ADM.TEXT, background:'#fff', outline:'none',
  boxSizing:'border-box', lineHeight:1.4 };
const SRV_TXT = { ...SRV_INP, minHeight:96, resize:'vertical' };
const SRV_SEL = { ...SRV_INP, appearance:'none', WebkitAppearance:'none', MozAppearance:'none',
  paddingRight:34, cursor:'pointer',
  backgroundImage:"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8'%3E%3Cpath d='M1 1.6L6 6.4L11 1.6' stroke='%238A9099' stroke-width='1.9' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")",
  backgroundRepeat:'no-repeat', backgroundPosition:'right 12px center' };
const SRV_SEZ = { fontSize:11.4, color:ADM.MUTED, fontWeight:700, textTransform:'uppercase',
  letterSpacing:'0.06em', marginBottom:12 };
// Etichetta dei riquadri dentro il dettaglio.
const SRV_ETI = { fontSize:10.8, color:ADM.MUTED_SOFT, fontWeight:700, textTransform:'uppercase',
  letterSpacing:'0.07em' };

// A livello di modulo, non dentro i componenti: rimontato a ogni render, un
// campo di input perderebbe il fuoco a ogni carattere digitato.
function SrvCampo({ etichetta, aiuto, span, children }) {
  return (
    <div style={span ? { gridColumn:'1 / -1' } : undefined}>
      <label style={{fontSize:11, color:ADM.MUTED, fontWeight:700, textTransform:'uppercase',
        letterSpacing:'0.05em', display:'block', marginBottom:6}}>{etichetta}</label>
      {children}
      {aiuto && <div style={{fontSize:11.6, color:ADM.MUTED_SOFT, marginTop:5, lineHeight:1.45}}>{aiuto}</div>}
    </div>
  );
}

// Barra di strumenti sopra un elenco: ricerca a sinistra, segmentato, CTA.
function SrvBarraStrumenti({ cerca, onCerca, placeholder, segmenti, attivo, onSegmento, azione }) {
  return (
    <div style={{display:'flex', alignItems:'center', gap:10, flexWrap:'wrap'}}>
      <div style={{position:'relative', width:300}}>
        <span style={{position:'absolute', left:11, top:'50%', transform:'translateY(-50%)',
          color:ADM.MUTED_SOFT, pointerEvents:'none'}}><BuIcons.search size={16}/></span>
        <input value={cerca} onChange={e=>onCerca(e.target.value)} placeholder={placeholder}
          style={{...SRV_INP, paddingLeft:33, borderRadius:99}}/>
      </div>
      {segmenti && <AdmTabBar variant="segmented" tabs={segmenti} active={attivo} onChange={onSegmento}/>}
      <div style={{flex:1}}/>
      {azione}
    </div>
  );
}

function SrvModale({ titolo, nota, larghezza = 700, onChiudi, children, piede }) {
  return (
    <div onClick={onChiudi} style={{position:'fixed', inset:0, zIndex:60, background:'rgba(15,17,21,0.42)',
      display:'flex', alignItems:'center', justifyContent:'center', padding:24,
      backdropFilter:'blur(3px)', WebkitBackdropFilter:'blur(3px)'}}>
      <div onClick={e=>e.stopPropagation()} style={{width:larghezza, maxWidth:'92%', background:'#fff',
        borderRadius:16, boxShadow:'0 24px 64px rgba(15,17,21,0.30)', animation:'admModalIn 0.18s ease',
        maxHeight:'100%', display:'flex', flexDirection:'column'}}>
        <div style={{padding:'20px 26px 15px', borderBottom:`1px solid ${ADM.BORDER}`, flexShrink:0}}>
          <div style={{fontSize:16.5, fontWeight:800, color:ADM.TEXT}}>{titolo}</div>
          {nota && <div style={{fontSize:12.6, color:ADM.MUTED, marginTop:4, lineHeight:1.5}}>{nota}</div>}
        </div>
        <div style={{padding:'20px 26px 24px', overflowY:'auto', flex:1, minHeight:0}}>{children}</div>
        {piede && (
          <div style={{padding:'14px 26px', borderTop:`1px solid ${ADM.BORDER}`, display:'flex',
            alignItems:'center', gap:10, justifyContent:'flex-end', flexShrink:0, background:ADM.PANEL_SOFT,
            borderRadius:'0 0 16px 16px'}}>{piede}</div>
        )}
      </div>
    </div>
  );
}

// Cinque stelle con l'ultima parziale: la media è 4,2 e va vista come 4,2,
// non arrotondata a 4 — l'arrotondamento è esattamente il decimo di voto su
// cui si discute quando il numero peggiora.
function SrvStelle({ valore, size = 15 }) {
  const D = 'M12 3l2.7 5.5 6 .9-4.4 4.3 1 6L12 17l-5.4 2.7 1-6L3.4 9.4l6-.9L12 3z';
  return (
    <span style={{display:'inline-flex', gap:2, verticalAlign:'middle'}}>
      {[0,1,2,3,4].map(i => {
        const q = Math.max(0, Math.min(1, valore - i));
        const gid = `srv-star-${i}-${Math.round(q*100)}`;
        return (
          <svg key={i} width={size} height={size} viewBox="0 0 24 24" style={{display:'block'}}>
            <defs>
              <linearGradient id={gid} x1="0" y1="0" x2="1" y2="0">
                <stop offset={`${q*100}%`} stopColor="#F59E0B"/>
                <stop offset={`${q*100}%`} stopColor="#E6E6EB"/>
              </linearGradient>
            </defs>
            <path d={D} fill={`url(#${gid})`}/>
          </svg>
        );
      })}
    </span>
  );
}

// Conferma di cancellazione in linea. Un modale per «vuoi davvero?» è troppo
// per una FAQ, ma un click secco su un cestino è troppo poco: due click
// consapevoli sulla riga stessa sono la misura giusta.
function SrvEliminaInline({ onElimina }) {
  const [chiesto, setChiesto] = useStateSrv(false);
  if (!chiesto) {
    return <AdmIconBtn icon="trash" label="Elimina" onClick={()=>setChiesto(true)} color={ADM.MUTED_SOFT} size={28}/>;
  }
  return (
    <span style={{display:'inline-flex', alignItems:'center', gap:6}}>
      <button onClick={onElimina} className="adm-btn" style={{padding:'4px 10px', borderRadius:7, border:'none',
        background:ADM.DANGER, color:'#fff', fontSize:12, fontWeight:700, fontFamily:'inherit', cursor:'pointer'}}>Elimina</button>
      <button onClick={()=>setChiesto(false)} className="adm-btn" style={{padding:'4px 9px', borderRadius:7,
        border:`1px solid ${ADM.BORDER}`, background:'#fff', color:ADM.MUTED, fontSize:12, fontWeight:600,
        fontFamily:'inherit', cursor:'pointer'}}>No</button>
    </span>
  );
}

// Miniatura del video: 16:9, piccola, con la durata incisa nell'angolo. Prima
// era una fascia nera a tutta larghezza in cima alla card — occupava il posto
// del titolo e faceva pesare l'elenco come una galleria.
function SrvMiniatura({ video, w = 128 }) {
  const h = Math.round(w * 9 / 16);
  if (!video) {
    return (
      <div style={{width:w, height:h, borderRadius:9, flexShrink:0, background:ADM.NEUTRAL_SOFT,
        border:`1px solid ${ADM.BORDER_SOFT}`, display:'grid', placeItems:'center', color:ADM.MUTED_LIGHT}}>
        <BuIcons.list size={19}/>
      </div>
    );
  }
  return (
    <div style={{width:w, height:h, borderRadius:9, flexShrink:0, position:'relative', overflow:'hidden',
      background:'linear-gradient(140deg, #2B2F37 0%, #14161B 100%)', display:'grid', placeItems:'center'}}>
      <span style={{width:28, height:28, borderRadius:'50%', background:'rgba(255,255,255,0.16)',
        border:'1px solid rgba(255,255,255,0.24)', display:'grid', placeItems:'center'}}>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="#fff"><path d="M8 5.5v13l11-6.5z"/></svg>
      </span>
      <span style={{position:'absolute', right:6, bottom:5, padding:'1px 6px', borderRadius:5,
        background:'rgba(0,0,0,0.66)', color:'#fff', fontSize:10.5, fontWeight:700,
        fontVariantNumeric:'tabular-nums'}}>{srvDurata(video.durataSec)}</span>
    </div>
  );
}

// Chip neutra per i metadati (tempo di lettura, durata video, categoria).
function SrvChip({ children, tono }) {
  const c = tono ? ADM[tono] : ADM.MUTED;
  return (
    <span style={{display:'inline-flex', alignItems:'center', gap:5, padding:'3px 9px', borderRadius:7,
      background: tono ? `${c}12` : ADM.NEUTRAL_SOFT, color: tono ? c : ADM.TEXT,
      fontSize:12, fontWeight:600, whiteSpace:'nowrap'}}>{children}</span>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Pagina
// ═══════════════════════════════════════════════════════════════════════════
function AdmAssistenzaPage({ initialTab }) {
  const [tab, setTab] = useStateSrv(initialTab || 'richiamate');
  // Se si arriva qui dalla ricerca globale mentre la pagina è già montata, lo
  // stato iniziale non basta: il tab va seguito anche dopo il primo render.
  React.useEffect(() => { if (initialTab) setTab(initialTab); }, [initialTab]);

  // Lo stato vive qui e non nei singoli tab: cambiando tab e tornando indietro
  // le modifiche devono esserci ancora, e il tab Andamento deve calcolare i KPI
  // sui dati aggiornati, non su quelli di partenza.
  const [richiamate, setRichiamate] = useStateSrv(RICHIAMATE);
  const [faq, setFaq] = useStateSrv(FAQ_SRV);
  const [argomenti, setArgomenti] = useStateSrv(GUIDE_ARGOMENTI);
  const [guide, setGuide] = useStateSrv(GUIDE_SRV);

  const inAttesa = richiamate.filter(r => r.stato === 'attesa').length;
  const bozze = faq.filter(f => !f.live).length + guide.filter(g => !g.live).length;

  const tabs = [
    { id:'richiamate', label:'Richiamate', badge: inAttesa },
    { id:'faq',        label:'FAQ' },
    { id:'guide',      label:'Guide' },
    { id:'kpi',        label:'Andamento' },
  ];

  // La coda vuole tutta l'altezza (elenco e dettaglio scorrono per conto loro);
  // gli altri tab sono pagine lunghe che scorrono intere.
  const coda = tab === 'richiamate';

  return (
    <div style={{height:'100%', display:'flex', flexDirection:'column', background:ADM.PANEL_SOFT}}>
      <div style={{padding:'0 28px', background:'#fff', borderBottom:`1px solid ${ADM.BORDER}`,
        display:'flex', alignItems:'center', gap:12, flexShrink:0}}>
        <AdmTabBar tabs={tabs} active={tab} onChange={setTab}/>
        <div style={{flex:1}}/>
        {bozze > 0 && (
          <span style={{fontSize:12.5, color:ADM.MUTED, whiteSpace:'nowrap'}}>
            <b style={{color:ADM.TEXT}}>{bozze}</b> {bozze === 1 ? 'contenuto' : 'contenuti'} in bozza
          </span>
        )}
      </div>
      <div style={{flex:1, minHeight:0, display:'flex', flexDirection:'column',
        overflow: coda ? 'hidden' : 'auto'}}>
        {tab === 'richiamate' && <SrvRichiamate richiamate={richiamate} setRichiamate={setRichiamate}/>}
        {tab === 'faq'        && <SrvFaq faq={faq} setFaq={setFaq}/>}
        {tab === 'guide'      && <SrvGuide argomenti={argomenti} setArgomenti={setArgomenti} guide={guide} setGuide={setGuide}/>}
        {tab === 'kpi'        && <AdmServizioClientiKPI richiamate={richiamate} guide={guide}/>}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 1. Richiamate — elenco a sinistra, dettaglio a destra
// ═══════════════════════════════════════════════════════════════════════════
function SrvRichiamate({ richiamate, setRichiamate }) {
  const [vista, setVista] = useStateSrv('attesa');
  const [cerca, setCerca] = useStateSrv('');
  const [selId, setSelId] = useStateSrv(null);

  const nAttesa = richiamate.filter(r => r.stato === 'attesa').length;
  const nFatte  = richiamate.filter(r => r.stato === 'fatta').length;
  const nPerse  = richiamate.filter(r => r.stato === 'persa').length;
  const scadute = richiamate.filter(r => r.stato === 'attesa' && srvMinutiAScadere(r) < 0);
  const piuVecchia = scadute.reduce((o, r) => !o || r.entro < o.entro ? r : o, null);

  const viste = [
    { id:'attesa', label:'Da richiamare', count:nAttesa },
    { id:'fatta',  label:'Richiamate',    count:nFatte },
    { id:'persa',  label:'Non risponde',  count:nPerse },
    { id:'tutte',  label:'Tutte',         count:richiamate.length },
  ];

  const elenco = useMemoSrv(() => {
    const q = cerca.trim().toLowerCase();
    let r = vista === 'tutte' ? richiamate : richiamate.filter(x => x.stato === vista);
    if (q) r = r.filter(x => [x.localeNome, x.titolare, x.tel, x.problema, x.id]
      .some(v => String(v || '').toLowerCase().includes(q)));
    // In coda si ordina per scadenza, non per arrivo: chi ha meno tempo sta
    // in cima anche se ha chiamato dopo. Nelle viste storiche torna il tempo.
    return [...r].sort((a, b) => a.stato === 'attesa' && b.stato === 'attesa'
      ? a.entro - b.entro
      : b.prenotataIl - a.prenotataIl);
  }, [richiamate, vista, cerca]);

  const sel = elenco.find(r => r.id === selId) || elenco[0];

  const segna = (id, esito) => setRichiamate(prev => prev.map(r => {
    if (r.id !== id) return r;
    if (esito === 'persa') return { ...r, stato:'persa', tentativi:(r.tentativi || 0) + 1, operatore: SRV_IO };
    const adesso = new Date();
    return { ...r, stato:'fatta', richiamataIl: adesso, operatore: SRV_IO,
      inTempo: adesso <= r.entro, durataMin: null };
  }));

  return (
    <div style={{flex:1, minHeight:0, display:'flex', flexDirection:'column'}}>
      {/* Barra dei filtri: fondo tenue, non un secondo nastro bianco sotto al
          tab bar. Le scadute sono un avviso in linea, non una fascia a parte. */}
      <div style={{padding:'11px 28px', background:ADM.PANEL_SOFT, borderBottom:`1px solid ${ADM.BORDER}`,
        display:'flex', alignItems:'center', gap:8, flexShrink:0, flexWrap:'wrap'}}>
        {viste.map(v => {
          const attivo = vista === v.id;
          return (
            <button key={v.id} className="adm-pill" onClick={()=>{ setVista(v.id); setSelId(null); }} style={{
              display:'inline-flex', alignItems:'center', gap:7, padding:'6px 13px', borderRadius:99,
              background: attivo ? ADM.TEXT : '#fff', color: attivo ? '#fff' : ADM.TEXT,
              border:`1px solid ${attivo ? ADM.TEXT : ADM.BORDER}`,
              fontSize:13.2, fontWeight:600, fontFamily:'inherit', cursor:'pointer',
            }}>
              {v.id === 'attesa' && scadute.length > 0 && !attivo &&
                <span style={{width:6, height:6, borderRadius:'50%', background:ADM.DANGER}}/>}
              {v.label}
              <span style={{fontWeight:700, fontSize:12.4, color: attivo ? 'rgba(255,255,255,0.75)' : ADM.MUTED_SOFT}}>{v.count}</span>
            </button>
          );
        })}
        <div style={{flex:1}}/>
        {scadute.length > 0 && (
          <button onClick={()=>{ setVista('attesa'); setSelId(piuVecchia.id); }} className="adm-textlink"
            style={{display:'inline-flex', alignItems:'center', gap:7, background:'none', border:'none',
              cursor:'pointer', fontFamily:'inherit', fontSize:12.8, fontWeight:600, color:ADM.DANGER}}>
            <span style={{width:7, height:7, borderRadius:'50%', background:ADM.DANGER,
              boxShadow:`0 0 0 3px ${ADM.DANGER}1F`}}/>
            {scadute.length} oltre la scadenza · la più vecchia da {srvMinuti(-srvMinutiAScadere(piuVecchia))}
            <BuIcons.chevronRight size={13}/>
          </button>
        )}
      </div>

      <div style={{flex:1, display:'flex', minHeight:0}}>
        {/* Elenco */}
        <div style={{width:400, flexShrink:0, borderRight:`1px solid ${ADM.BORDER}`, background:'#fff',
          display:'flex', flexDirection:'column', minHeight:0}}>
          <div style={{padding:'12px 14px 10px', borderBottom:`1px solid ${ADM.BORDER_SOFT}`}}>
            <div style={{position:'relative'}}>
              <span style={{position:'absolute', left:11, top:'50%', transform:'translateY(-50%)',
                color:ADM.MUTED_SOFT, pointerEvents:'none'}}><BuIcons.search size={17}/></span>
              <input value={cerca} onChange={e=>setCerca(e.target.value)} placeholder="Numero, locale, problema…"
                style={{width:'100%', padding:'8px 12px 8px 33px', border:'none', borderRadius:8,
                  fontSize:14, fontFamily:'inherit', outline:'none', background:ADM.PANEL_SOFT,
                  boxSizing:'border-box', color:ADM.TEXT}}/>
            </div>
          </div>
          <div style={{padding:'9px 16px 7px', fontSize:12.8, color:ADM.MUTED, fontWeight:500}}>
            {elenco.length} {elenco.length === 1 ? 'richiamata' : 'richiamate'}
            <span style={{color:ADM.MUTED_SOFT}}> · {viste.find(v=>v.id===vista).label.toLowerCase()}</span>
          </div>
          <div style={{flex:1, overflowY:'auto'}}>
            {elenco.length === 0 && <AdmEmpty icon="phone" title="Nessuna richiamata"
              desc={cerca ? 'Nessun risultato per questa ricerca' : 'La coda è vuota'}/>}
            {elenco.map(r => (
              <SrvVoceCoda key={r.id} r={r} attiva={sel && sel.id === r.id} onClick={()=>setSelId(r.id)}/>
            ))}
          </div>
        </div>

        {/* Dettaglio */}
        <div style={{flex:1, minWidth:0, display:'flex', flexDirection:'column', background:ADM.PANEL_SOFT}}>
          {sel
            ? <SrvDettaglioRichiamata r={sel} tutte={richiamate} onEsito={(e)=>segna(sel.id, e)}/>
            : <AdmEmpty icon="phone" title="Seleziona una richiamata" desc="Dall'elenco a sinistra"/>}
        </div>
      </div>
    </div>
  );
}

// Voce dell'elenco: nome del locale, chi ha chiamato e perché, e il tempo che
// resta. Il numero di telefono NON sta qui — serve una volta sola, quando si
// compone, e nel dettaglio può stare in cifre leggibili invece che compresso.
function SrvVoceCoda({ r, attiva, onClick }) {
  const cat = SRV_CATEGORIE[r.categoria];
  const catCol = ADM[cat.color];
  const mancano = srvMinutiAScadere(r);
  const scaduta = r.stato === 'attesa' && mancano < 0;
  const urgente = r.stato === 'attesa' && mancano >= 0 && mancano <= 15;

  return (
    <button onClick={onClick} className="adm-actionrow" style={{
      display:'block', width:'100%', textAlign:'left', fontFamily:'inherit', cursor:'pointer',
      padding:'11px 16px 12px 13px', border:'none',
      borderBottom:`1px solid ${ADM.BORDER_SOFT}`,
      borderLeft:`3px solid ${attiva ? ADM.PINK : 'transparent'}`,
      background: attiva ? ADM.PINK_BG_SOFT : 'transparent',
    }}>
      <div style={{display:'flex', alignItems:'baseline', gap:8}}>
        <span style={{width:7, height:7, borderRadius:'50%', background:catCol, flexShrink:0,
          transform:'translateY(-1px)'}}/>
        <span style={{flex:1, minWidth:0, fontSize:14.2, fontWeight:700, color:ADM.TEXT,
          letterSpacing:'-0.01em', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>
          {r.localeNome}
        </span>
        {r.stato === 'attesa'
          ? <span style={{flexShrink:0, fontSize:12.4, fontWeight:700, fontVariantNumeric:'tabular-nums',
              color: scaduta ? ADM.DANGER : urgente ? ADM.WARN : ADM.MUTED}}>
              {scaduta ? `−${srvMinuti(-mancano).replace('−','')}` : srvMinuti(mancano)}
            </span>
          : <span style={{flexShrink:0, fontSize:12, color:ADM.MUTED_SOFT}}>{fmtRelative(r.prenotataIl)}</span>}
      </div>
      <div style={{fontSize:12.4, color:ADM.MUTED, marginTop:2, paddingLeft:15, whiteSpace:'nowrap',
        overflow:'hidden', textOverflow:'ellipsis'}}>
        {r.titolare} · {cat.label}
      </div>
      {r.problema && (
        <div style={{fontSize:12.8, color:ADM.MUTED_SOFT, marginTop:4, paddingLeft:15, lineHeight:1.4,
          display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden'}}>
          {r.problema}
        </div>
      )}
      {r.stato === 'fatta' && (
        <div style={{paddingLeft:15, marginTop:5, display:'flex', alignItems:'center', gap:7}}>
          <span style={{fontSize:11.5, fontWeight:700, color: r.inTempo ? ADM.OK : ADM.WARN}}>
            {r.inTempo ? 'In tempo' : 'In ritardo'}
          </span>
          {r.voto != null && <SrvStelle valore={r.voto} size={11}/>}
        </div>
      )}
      {r.stato === 'persa' && (
        <div style={{paddingLeft:15, marginTop:5, fontSize:11.5, fontWeight:700, color:ADM.MUTED_SOFT}}>
          Non risponde · {r.tentativi} {r.tentativi === 1 ? 'tentativo' : 'tentativi'}
        </div>
      )}
    </button>
  );
}

function SrvDettaglioRichiamata({ r, tutte, onEsito }) {
  const cat = SRV_CATEGORIE[r.categoria];
  const catCol = ADM[cat.color];
  const locale = LOCALI.find(l => l.id === r.localeId);
  const mancano = srvMinutiAScadere(r);
  const scaduta = r.stato === 'attesa' && mancano < 0;
  const urgente = r.stato === 'attesa' && mancano >= 0 && mancano <= 15;
  const [copiato, setCopiato] = useStateSrv(false);

  const copia = () => {
    if (navigator.clipboard) navigator.clipboard.writeText(r.tel).catch(()=>{});
    setCopiato(true);
    setTimeout(() => setCopiato(false), 1600);
  };

  const tonoScad = scaduta ? ADM.DANGER : urgente ? ADM.WARN : ADM.TEXT;

  return (
    <div style={{flex:1, minHeight:0, display:'flex', flexDirection:'column'}}>
      {/* Intestazione — come il thread di Comunicazioni: bianca, con chi è e
          da quando aspetta, senza ripetere niente di quello che sta sotto. */}
      <div style={{background:'#fff', borderBottom:`1px solid ${ADM.BORDER}`, padding:'16px 26px 15px', flexShrink:0}}>
        <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:7}}>
          <span style={{fontSize:12, color:ADM.MUTED_LIGHT, fontWeight:600}}>{r.id}</span>
          <span style={{display:'inline-flex', alignItems:'center', gap:6, fontSize:12.2,
            fontWeight:700, color:catCol}}>
            <span style={{width:7, height:7, borderRadius:'50%', background:catCol}}/>{cat.label}
          </span>
        </div>
        <div style={{fontSize:21, fontWeight:700, color:ADM.TEXT, letterSpacing:'-0.02em', lineHeight:1.2}}>
          {r.localeNome}
        </div>
        <div style={{display:'flex', alignItems:'center', gap:9, marginTop:6, flexWrap:'wrap'}}>
          <span style={{fontSize:13.6, color:ADM.TEXT, fontWeight:500}}>{r.titolare}</span>
          {locale && <span style={{fontSize:13.4, color:ADM.MUTED}}>{locale.citta}</span>}
          <AdmPlanBadge piano={r.piano}/>
          <span style={{fontSize:13.4, color:ADM.MUTED_SOFT}}>
            Prenotata {fmtDateTime(r.prenotataIl)} · {fmtRelative(r.prenotataIl)}
          </span>
        </div>
      </div>

      <div style={{flex:1, overflowY:'auto', padding:'20px 26px 24px', display:'flex',
        flexDirection:'column', gap:16}}>

        {/* Il numero e la scadenza, affiancati: sono le due cose che decidono
            cosa fare adesso, e stanno sopra tutto il resto. */}
        <div style={{display:'grid', gridTemplateColumns:'minmax(0,1.15fr) minmax(0,1fr)', gap:14}}>
          <AdmCard padding={0} style={{overflow:'hidden'}}>
            <div style={{padding:'14px 18px 15px'}}>
              <div style={SRV_ETI}>Numero da chiamare</div>
              <div style={{display:'flex', alignItems:'center', gap:12, marginTop:9}}>
                <span style={{flex:1, minWidth:0, fontSize:26, fontWeight:800, color:ADM.TEXT,
                  letterSpacing:'-0.01em', fontVariantNumeric:'tabular-nums'}}>{r.tel}</span>
                <AdmIconBtn icon={copiato ? 'check' : 'copy'} label="Copia il numero"
                  onClick={copia} color={copiato ? ADM.OK : ADM.MUTED} size={32}/>
              </div>
            </div>
            <a href={`tel:${r.tel.replace(/\s/g, '')}`} className="adm-actionrow" style={{
              display:'flex', alignItems:'center', gap:8, padding:'10px 18px',
              borderTop:`1px solid ${ADM.BORDER_SOFT}`, textDecoration:'none',
              color:ADM.PINK_DARK, fontSize:13.4, fontWeight:700}}>
              <BuIcons.phone size={15}/> Chiama dal dispositivo
              <div style={{flex:1}}/>
              <BuIcons.chevronRight size={14} color={ADM.MUTED_LIGHT}/>
            </a>
          </AdmCard>

          {r.stato === 'attesa' && (
            <AdmCard padding={0} style={{overflow:'hidden',
              borderColor: scaduta ? `${ADM.DANGER}55` : urgente ? `${ADM.WARN}55` : ADM.BORDER}}>
              <div style={{padding:'14px 18px 15px'}}>
                <div style={SRV_ETI}>{scaduta ? 'Scaduta da' : 'Da richiamare entro'}</div>
                <div style={{fontSize:26, fontWeight:800, color:tonoScad, letterSpacing:'-0.01em', marginTop:9}}>
                  {scaduta ? srvMinuti(-mancano) : srvMinuti(mancano)}
                </div>
              </div>
              <div style={{padding:'9px 18px 10px', borderTop:`1px solid ${ADM.BORDER_SOFT}`,
                fontSize:12.4, color:ADM.MUTED}}>
                SLA {cat.label.toLowerCase()} · {srvMinuti(cat.slaMin)} dalla prenotazione
              </div>
            </AdmCard>
          )}

          {r.stato === 'fatta' && (
            <AdmCard padding={0} style={{overflow:'hidden'}}>
              <div style={{padding:'14px 18px 15px'}}>
                <div style={SRV_ETI}>Esito</div>
                <div style={{fontSize:19, fontWeight:800, marginTop:9,
                  color: r.inTempo ? ADM.OK : ADM.WARN, letterSpacing:'-0.01em'}}>
                  {r.inTempo ? 'Richiamato in tempo' : 'Richiamato in ritardo'}
                </div>
                <div style={{fontSize:12.8, color:ADM.MUTED, marginTop:4}}>
                  Dopo {srvMinuti(Math.round((r.richiamataIl - r.prenotataIl) / 60000))} · su un SLA di {srvMinuti(cat.slaMin)}
                </div>
              </div>
              <div style={{padding:'9px 18px 10px', borderTop:`1px solid ${ADM.BORDER_SOFT}`,
                fontSize:12.4, color:ADM.MUTED}}>
                {(TEAM.find(t => t.id === r.operatore) || {}).nome || '—'}
                {r.durataMin ? ` · chiamata di ${r.durataMin} min` : ''}
              </div>
            </AdmCard>
          )}

          {r.stato === 'persa' && (
            <AdmCard padding={0} style={{overflow:'hidden'}}>
              <div style={{padding:'14px 18px 15px'}}>
                <div style={SRV_ETI}>Esito</div>
                <div style={{fontSize:19, fontWeight:800, color:ADM.MUTED, marginTop:9, letterSpacing:'-0.01em'}}>
                  Non risponde
                </div>
                <div style={{fontSize:12.8, color:ADM.MUTED, marginTop:4}}>
                  {r.tentativi} {r.tentativi === 1 ? 'tentativo' : 'tentativi'} senza risposta
                </div>
              </div>
              <div style={{padding:'9px 18px 10px', borderTop:`1px solid ${ADM.BORDER_SOFT}`,
                fontSize:12.4, color:ADM.MUTED}}>
                {(TEAM.find(t => t.id === r.operatore) || {}).nome || '—'}
              </div>
            </AdmCard>
          )}
        </div>

        {r.problema && (
          <div>
            <div style={{...SRV_ETI, marginBottom:8}}>Problema dichiarato</div>
            <AdmCard style={{fontSize:14.4, color:ADM.TEXT, lineHeight:1.6}}>{r.problema}</AdmCard>
          </div>
        )}

        {r.voto != null && (
          <div>
            <div style={{...SRV_ETI, marginBottom:8}}>Come è andata, secondo il ristoratore</div>
            <AdmCard>
              <div style={{display:'flex', alignItems:'center', gap:10}}>
                <SrvStelle valore={r.voto} size={18}/>
                <span style={{fontSize:15, fontWeight:800, color:ADM.TEXT}}>{r.voto}<span style={{color:ADM.MUTED_SOFT, fontWeight:600}}>/5</span></span>
              </div>
              {r.recensione && (
                <div style={{fontSize:14, color:ADM.TEXT, lineHeight:1.6, marginTop:11, paddingTop:11,
                  borderTop:`1px solid ${ADM.BORDER_SOFT}`, fontStyle:'italic'}}>«{r.recensione}»</div>
              )}
            </AdmCard>
          </div>
        )}

        {/* Chi si sta per chiamare. Sapere che è un locale da 620 ordini al mese
            che ha già chiamato due volte questa settimana cambia il tono della
            telefonata, e sono dati che l'operatore altrimenti va a cercare
            aprendo un'altra sezione mentre il telefono squilla. */}
        <SrvContesto r={r} locale={locale} tutte={tutte}/>
      </div>

      {/* Azioni ancorate in fondo, come la barra di risposta di Comunicazioni:
          non si scorre per trovarle. */}
      {r.stato !== 'fatta' && (
        <div style={{background:'#fff', borderTop:`1px solid ${ADM.BORDER}`, padding:'13px 26px',
          display:'flex', alignItems:'center', gap:11, flexShrink:0}}>
          <span style={{flex:1, fontSize:12.8, color:ADM.MUTED}}>
            {r.stato === 'attesa'
              ? 'Registra l\'esito appena riagganci: la puntualità si misura da qui.'
              : 'Se stavolta risponde, l\'esito torna fra le richiamate riuscite.'}
          </span>
          {r.stato === 'attesa' && (
            <AdmButton variant="secondary" icon="x" onClick={()=>onEsito('persa')}>Non risponde</AdmButton>
          )}
          <AdmButton variant="success" icon="check" onClick={()=>onEsito('fatta')}>
            {r.stato === 'attesa' ? 'Richiamato' : 'Riprova ora'}
          </AdmButton>
        </div>
      )}
    </div>
  );
}

// Contesto: la scheda del locale e le volte precedenti. Due colonne, così il
// dettaglio non finisce a metà pagina con mezzo pannello vuoto sotto.
function SrvContesto({ r, locale, tutte }) {
  const precedenti = (tutte || RICHIAMATE)
    .filter(x => x.localeId === r.localeId && x.id !== r.id)
    .slice(0, 4);
  const ticketAperti = TICKET_SRV.filter(t => t.localeId === r.localeId && !t.chiusoIl).length;

  const fatti = locale ? [
    ['Ordini al mese', fmtNum(locale.ordiniMese)],
    ['Adozione QR', locale.qrAdoption == null ? '—' : `${locale.qrAdoption}%`],
    ['Abbonamento', fmtEur(locale.mrr) + '/mese'],
    ['Cliente dal', fmtDate(locale.dataIscrizione)],
    ['Ultimo accesso', fmtRelative(locale.lastLogin)],
    ['Ticket aperti', String(ticketAperti)],
  ] : [];

  return (
    <div style={{display:'grid', gridTemplateColumns:'minmax(0,1fr) minmax(0,1fr)', gap:14}}>
      <div>
        <div style={{...SRV_ETI, marginBottom:8}}>Il locale</div>
        <AdmCard padding={0} style={{overflow:'hidden'}}>
          {fatti.length === 0
            ? <div style={{padding:'14px 18px', fontSize:13, color:ADM.MUTED_SOFT}}>Locale non trovato.</div>
            : fatti.map(([k, v], i) => (
              <div key={k} style={{display:'flex', alignItems:'center', gap:12, padding:'9px 18px',
                borderBottom: i === fatti.length - 1 ? 'none' : `1px solid ${ADM.BORDER_SOFT}`}}>
                <span style={{flex:1, fontSize:12.8, color:ADM.MUTED}}>{k}</span>
                <span style={{fontSize:13.2, fontWeight:700, color:ADM.TEXT,
                  fontVariantNumeric:'tabular-nums'}}>{v}</span>
              </div>
            ))}
        </AdmCard>
      </div>

      <div>
        <div style={{...SRV_ETI, marginBottom:8}}>
          Ha già chiamato {precedenti.length > 0 && <span style={{color:ADM.MUTED_LIGHT}}>{precedenti.length} volte</span>}
        </div>
        <AdmCard padding={0} style={{overflow:'hidden'}}>
          {precedenti.length === 0
            ? <div style={{padding:'14px 18px', fontSize:13, color:ADM.MUTED_SOFT}}>
                È la prima richiamata che prenota.
              </div>
            : precedenti.map((p, i) => {
              const c = SRV_CATEGORIE[p.categoria];
              const esito = p.stato === 'attesa' ? { t:'In coda', col:ADM.MUTED }
                : p.stato === 'persa' ? { t:'Non risponde', col:ADM.MUTED_SOFT }
                : p.inTempo ? { t:'In tempo', col:ADM.OK } : { t:'In ritardo', col:ADM.WARN };
              return (
                <div key={p.id} style={{display:'flex', alignItems:'center', gap:11, padding:'9px 18px',
                  borderBottom: i === precedenti.length - 1 ? 'none' : `1px solid ${ADM.BORDER_SOFT}`}}>
                  <span style={{width:6, height:6, borderRadius:'50%', background:ADM[c.color], flexShrink:0}}/>
                  <span style={{flex:1, minWidth:0, fontSize:12.8, color:ADM.TEXT, whiteSpace:'nowrap',
                    overflow:'hidden', textOverflow:'ellipsis'}}>{c.label}</span>
                  <span style={{fontSize:11.8, color:ADM.MUTED_LIGHT, flexShrink:0}}>{fmtRelative(p.prenotataIl)}</span>
                  <span style={{fontSize:11.8, fontWeight:700, color:esito.col, flexShrink:0, width:78,
                    textAlign:'right'}}>{esito.t}</span>
                </div>
              );
            })}
        </AdmCard>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 2. FAQ — una card, righe divise da filetti, raggruppate per categoria
// ═══════════════════════════════════════════════════════════════════════════
function SrvFaq({ faq, setFaq }) {
  const [filtro, setFiltro] = useStateSrv('tutte');
  const [cerca, setCerca] = useStateSrv('');
  const [aperta, setAperta] = useStateSrv(null);
  const [editor, setEditor] = useStateSrv(null); // { nuova:bool, dati }

  const online = faq.filter(f => f.live).length;

  const elenco = useMemoSrv(() => {
    const q = cerca.trim().toLowerCase();
    let r = filtro === 'online' ? faq.filter(f => f.live)
          : filtro === 'bozze'  ? faq.filter(f => !f.live)
          : faq;
    if (q) r = r.filter(f => [f.domanda, f.risposta, f.categoria].some(v => v.toLowerCase().includes(q)));
    return r;
  }, [faq, filtro, cerca]);

  // Il raggruppamento per categoria sostituisce la fila di pastiglie-filtro:
  // le categorie sono sei e servono a orientarsi scorrendo, non a filtrare.
  const gruppi = FAQ_CATEGORIE.map(c => ({ categoria:c, righe: elenco.filter(f => f.categoria === c) }))
    .filter(g => g.righe.length > 0);

  const salva = (dati) => {
    setFaq(prev => dati.id
      ? prev.map(f => f.id === dati.id ? { ...f, ...dati, aggiornataIl:new Date() } : f)
      : [{ ...dati, id:'F-' + String(Date.now()).slice(-5), viste:0, utile:0, nonUtile:0,
           aggiornataIl:new Date() }, ...prev]);
    setEditor(null);
  };

  return (
    <div style={{padding:'22px 28px 28px', display:'flex', flexDirection:'column', gap:14}}>
      <SectionLabel first title="Domande frequenti"
        desc={`${faq.length} risposte · ${online} online nel gestionale, ${faq.length - online} in bozza`}/>

      <SrvBarraStrumenti
        cerca={cerca} onCerca={setCerca} placeholder="Cerca fra domande e risposte…"
        segmenti={[
          { id:'tutte',  label:'Tutte',  badge:faq.length },
          { id:'online', label:'Online', badge:online },
          { id:'bozze',  label:'Bozze',  badge:faq.length - online },
        ]}
        attivo={filtro} onSegmento={setFiltro}
        azione={<AdmButton variant="cta" icon="plus" onClick={()=>setEditor({ nuova:true, dati:{
          categoria: FAQ_CATEGORIE[0], domanda:'', risposta:'', live:false } })}>Nuova FAQ</AdmButton>}
      />

      {gruppi.length === 0
        ? <AdmCard><AdmEmpty icon="help" title="Nessuna FAQ" desc="Cambia filtro o creane una nuova"/></AdmCard>
        : (
          <AdmCard padding={0} style={{overflow:'hidden'}}>
            {gruppi.map((g, gi) => (
              <div key={g.categoria}>
                <div style={{padding:'9px 20px', background:ADM.PANEL_SOFT,
                  borderTop: gi === 0 ? 'none' : `1px solid ${ADM.BORDER}`,
                  borderBottom:`1px solid ${ADM.BORDER_SOFT}`,
                  fontSize:11.2, fontWeight:700, color:ADM.MUTED, textTransform:'uppercase',
                  letterSpacing:'0.06em', display:'flex', alignItems:'center', gap:8}}>
                  {g.categoria}
                  <span style={{color:ADM.MUTED_LIGHT, fontWeight:600}}>{g.righe.length}</span>
                </div>
                {g.righe.map((f, i) => (
                  <SrvRigaFaq key={f.id} f={f}
                    ultima={i === g.righe.length - 1}
                    aperta={aperta === f.id}
                    onApri={()=>setAperta(aperta === f.id ? null : f.id)}
                    onLive={(v)=>setFaq(prev => prev.map(x => x.id === f.id ? { ...x, live:v } : x))}
                    onModifica={()=>setEditor({ nuova:false, dati:{ ...f } })}
                    onElimina={()=>setFaq(prev => prev.filter(x => x.id !== f.id))}/>
                ))}
              </div>
            ))}
          </AdmCard>
        )}

      {editor && <SrvFaqEditor stato={editor} onChiudi={()=>setEditor(null)} onSalva={salva}/>}
    </div>
  );
}

function SrvRigaFaq({ f, ultima, aperta, onApri, onLive, onModifica, onElimina }) {
  const voti = f.utile + f.nonUtile;
  return (
    <div style={{borderBottom: ultima ? 'none' : `1px solid ${ADM.BORDER_SOFT}`,
      background: aperta ? ADM.PANEL_SOFT : 'transparent'}}>
      <div style={{display:'flex', alignItems:'center', gap:14, padding:'12px 20px'}}>
        <button onClick={onApri} style={{flex:1, minWidth:0, display:'flex', alignItems:'center', gap:11,
          textAlign:'left', background:'none', border:'none', padding:0, cursor:'pointer', fontFamily:'inherit'}}>
          <span style={{color:ADM.MUTED_LIGHT, transform: aperta ? 'rotate(90deg)' : 'none',
            transition:'transform 0.16s ease', display:'inline-flex', flexShrink:0}}>
            <BuIcons.chevronRight size={14}/>
          </span>
          <span style={{flex:1, minWidth:0}}>
            <span style={{display:'block', fontSize:14.4, fontWeight:600,
              color: f.live ? ADM.TEXT : ADM.MUTED, lineHeight:1.4}}>{f.domanda}</span>
            <span style={{display:'block', fontSize:11.8, color:ADM.MUTED_LIGHT, marginTop:3}}>
              Aggiornata {fmtRelative(f.aggiornataIl)}
            </span>
          </span>
        </button>

        {/* Numeri allineati a destra in colonne fisse: scorrendo l'elenco si
            confrontano fra loro, e non ballano con la lunghezza del titolo. */}
        <span style={{width:70, textAlign:'right', flexShrink:0}}>
          <span style={{display:'block', fontSize:12.6, color:ADM.TEXT, fontWeight:600,
            fontVariantNumeric:'tabular-nums'}}>{f.viste > 0 ? fmtNum(f.viste) : '—'}</span>
          <span style={{display:'block', fontSize:11.2, color:ADM.MUTED_LIGHT, marginTop:1}}>viste</span>
        </span>
        <span style={{width:56, textAlign:'right', flexShrink:0}}>
          <span style={{display:'block', fontSize:12.6, fontWeight:600, fontVariantNumeric:'tabular-nums',
            color: voti === 0 ? ADM.MUTED_LIGHT : (f.utile / voti) >= 0.9 ? ADM.OK : ADM.WARN}}>
            {voti > 0 ? `${Math.round(f.utile / voti * 100)}%` : '—'}
          </span>
          <span style={{display:'block', fontSize:11.2, color:ADM.MUTED_LIGHT, marginTop:1}}>utile</span>
        </span>

        <span style={{width:52, display:'flex', justifyContent:'flex-end', flexShrink:0}}>
          <AdmSwitch size="sm" checked={f.live} onChange={onLive}/>
        </span>
        <AdmIconBtn icon="pencil" label="Modifica" size={28} onClick={onModifica} color={ADM.MUTED_SOFT}/>
        <SrvEliminaInline onElimina={onElimina}/>
      </div>
      {aperta && (
        <div style={{padding:'0 20px 16px 45px', fontSize:13.8, color:ADM.TEXT, lineHeight:1.65,
          whiteSpace:'pre-line', maxWidth:900}}>{f.risposta}</div>
      )}
    </div>
  );
}

function SrvFaqEditor({ stato, onChiudi, onSalva }) {
  const [d, setD] = useStateSrv(stato.dati);
  const agg = (k, v) => setD(x => ({ ...x, [k]: v }));
  const valida = d.domanda.trim().length > 5 && d.risposta.trim().length > 15;

  return (
    <SrvModale
      titolo={stato.nuova ? 'Nuova domanda frequente' : 'Modifica la domanda'}
      nota="La domanda va scritta come la formulerebbe il ristoratore, non come la classificheremmo noi: è quella che finisce nel motore di ricerca del gestionale."
      onChiudi={onChiudi}
      piede={
        <React.Fragment>
          <AdmButton variant="ghost" onClick={onChiudi}>Annulla</AdmButton>
          <AdmButton variant="primary" icon="check" disabled={!valida} onClick={()=>valida && onSalva(d)}>
            {stato.nuova ? 'Crea' : 'Salva'}
          </AdmButton>
        </React.Fragment>
      }>
      <div style={{display:'flex', flexDirection:'column', gap:18}}>
        <SrvCampo etichetta="Categoria">
          <select value={d.categoria} onChange={e=>agg('categoria', e.target.value)} style={SRV_SEL}>
            {FAQ_CATEGORIE.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </SrvCampo>
        <SrvCampo etichetta="Domanda">
          <input value={d.domanda} onChange={e=>agg('domanda', e.target.value)} style={SRV_INP}
            placeholder="Come riattivo le notifiche di prenotazione?"/>
        </SrvCampo>
        <SrvCampo etichetta="Risposta"
          aiuto="Se la risposta è una procedura, numera i passaggi: chi la legge ha il locale aperto.">
          <textarea value={d.risposta} onChange={e=>agg('risposta', e.target.value)} style={{...SRV_TXT, minHeight:180}}
            placeholder="Nell'ordine: 1) …"/>
        </SrvCampo>
        <SrvInterruttorePubblica live={d.live} onChange={(v)=>agg('live', v)}
          acceso="I ristoratori la vedranno appena salvi."
          spento="Resta visibile solo qui in console."/>
      </div>
    </SrvModale>
  );
}

function SrvInterruttorePubblica({ live, onChange, acceso, spento }) {
  return (
    <div style={{display:'flex', alignItems:'center', gap:12, padding:'12px 14px', borderRadius:10,
      background:ADM.PANEL_SOFT, border:`1px solid ${ADM.BORDER_SOFT}`}}>
      <AdmSwitch checked={live} onChange={onChange}/>
      <div style={{flex:1, minWidth:0}}>
        <div style={{fontSize:13.6, fontWeight:600, color:ADM.TEXT}}>Pubblica nel gestionale</div>
        <div style={{fontSize:12.2, color:ADM.MUTED, marginTop:2}}>{live ? acceso : spento}</div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 3. Guide — un blocco per argomento, righe orizzontali di altezza uniforme
// ═══════════════════════════════════════════════════════════════════════════
function SrvGuide({ argomenti, setArgomenti, guide, setGuide }) {
  const [editorGuida, setEditorGuida] = useStateSrv(null);
  const [editorArg, setEditorArg] = useStateSrv(null);
  const [aperta, setAperta] = useStateSrv(null);
  const [cerca, setCerca] = useStateSrv('');
  const [filtro, setFiltro] = useStateSrv('tutte');

  const online = guide.filter(g => g.live).length;

  const visibili = useMemoSrv(() => {
    const q = cerca.trim().toLowerCase();
    let r = filtro === 'online' ? guide.filter(g => g.live)
          : filtro === 'bozze'  ? guide.filter(g => !g.live)
          : guide;
    if (q) r = r.filter(g => [g.titolo, g.descrizione, g.video && g.video.titolo]
      .some(v => String(v || '').toLowerCase().includes(q)));
    return r;
  }, [guide, filtro, cerca]);

  const salvaGuida = (dati) => {
    setGuide(prev => dati.id
      ? prev.map(g => g.id === dati.id ? { ...g, ...dati, aggiornataIl:new Date() } : g)
      : [...prev, { ...dati, id:'G-' + String(Date.now()).slice(-5), letture:0, aggiornataIl:new Date() }]);
    setEditorGuida(null);
  };
  const salvaArg = (dati) => {
    setArgomenti(prev => dati.id
      ? prev.map(a => a.id === dati.id ? { ...a, ...dati } : a)
      : [...prev, { ...dati, id:'A-' + String(Date.now()).slice(-5) }]);
    setEditorArg(null);
  };
  const nuovaGuida = (argomentoId) => setEditorGuida({ nuova:true, dati:{
    argomentoId, titolo:'', descrizione:'', minLettura:5, live:false, video:null } });

  const conRisultati = argomenti.filter(a => visibili.some(g => g.argomentoId === a.id));
  const mostraTutti = cerca.trim() === '' && filtro === 'tutte';

  return (
    <div style={{padding:'22px 28px 28px', display:'flex', flexDirection:'column', gap:14}}>
      <SectionLabel first title="Guide"
        desc={`${argomenti.length} argomenti · ${guide.length} guide, ${online} online`}/>

      <SrvBarraStrumenti
        cerca={cerca} onCerca={setCerca} placeholder="Cerca fra le guide…"
        segmenti={[
          { id:'tutte',  label:'Tutte',  badge:guide.length },
          { id:'online', label:'Online', badge:online },
          { id:'bozze',  label:'Bozze',  badge:guide.length - online },
        ]}
        attivo={filtro} onSegmento={setFiltro}
        azione={
          <div style={{display:'flex', gap:9}}>
            <AdmButton variant="secondary" icon="plus" onClick={()=>setEditorArg({ nuovo:true, dati:{
              nome:'', descrizione:'', icona:'list' } })}>Argomento</AdmButton>
            <AdmButton variant="cta" icon="plus" disabled={argomenti.length === 0}
              onClick={()=>nuovaGuida(argomenti[0] && argomenti[0].id)}>Nuova guida</AdmButton>
          </div>
        }
      />

      {argomenti.length === 0 && (
        <AdmCard><AdmEmpty icon="list" title="Nessun argomento"
          desc="Le guide vivono dentro un argomento: creane uno per iniziare"/></AdmCard>
      )}
      {argomenti.length > 0 && conRisultati.length === 0 && (
        <AdmCard><AdmEmpty icon="list" title="Nessuna guida" desc="Cambia filtro o cancella la ricerca"/></AdmCard>
      )}

      {(mostraTutti ? argomenti : conRisultati).map(a => {
        const sue = visibili.filter(g => g.argomentoId === a.id);
        const tutte = guide.filter(g => g.argomentoId === a.id);
        const AIcon = BuIcons[a.icona] || BuIcons.list;
        return (
          <div key={a.id} style={{display:'flex', flexDirection:'column', gap:9}}>
            {/* Rubrica dell'argomento: leggera, allineata alle SectionLabel
                della Dashboard. Non è una card dentro una card. */}
            <div style={{display:'flex', alignItems:'center', gap:11, paddingTop:6}}>
              <span style={{width:26, height:26, borderRadius:8, background:ADM.PINK_BG_SOFT,
                color:ADM.PINK_DARK, display:'grid', placeItems:'center', flexShrink:0}}>
                <AIcon size={14}/>
              </span>
              <span style={{fontSize:13, fontWeight:700, color:ADM.TEXT, textTransform:'uppercase',
                letterSpacing:'0.07em'}}>{a.nome}</span>
              <span style={{fontSize:13, color:ADM.MUTED_SOFT, fontWeight:500, flex:1, minWidth:0,
                whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{a.descrizione}</span>
              <AdmButton variant="ghost" size="sm" icon="plus" onClick={()=>nuovaGuida(a.id)}>Guida</AdmButton>
              <AdmIconBtn icon="pencil" label="Modifica argomento" size={28} color={ADM.MUTED_LIGHT}
                onClick={()=>setEditorArg({ nuovo:false, dati:{ ...a } })}/>
              {/* Un argomento con guide dentro non si cancella: la cancellazione
                  porterebbe via articoli che nessuno ha chiesto di eliminare. */}
              {tutte.length === 0
                ? <SrvEliminaInline onElimina={()=>setArgomenti(prev => prev.filter(x => x.id !== a.id))}/>
                : <span title={`Contiene ${tutte.length} guide: spostale o eliminale prima`}
                    style={{width:28, display:'grid', placeItems:'center', color:ADM.MUTED_LIGHT}}>
                    <BuIcons.lock size={14}/>
                  </span>}
            </div>

            {sue.length === 0
              ? <AdmCard style={{fontSize:13, color:ADM.MUTED_SOFT, padding:'14px 20px'}}>
                  Nessuna guida in questo argomento.
                </AdmCard>
              : (
                <AdmCard padding={0} style={{overflow:'hidden'}}>
                  {sue.map((g, i) => (
                    <SrvRigaGuida key={g.id} g={g} ultima={i === sue.length - 1}
                      aperta={aperta === g.id}
                      onApri={()=>setAperta(aperta === g.id ? null : g.id)}
                      onModifica={()=>setEditorGuida({ nuova:false, dati:{ ...g } })}
                      onLive={(v)=>setGuide(prev => prev.map(x => x.id === g.id ? { ...x, live:v } : x))}
                      onElimina={()=>setGuide(prev => prev.filter(x => x.id !== g.id))}/>
                  ))}
                </AdmCard>
              )}
          </div>
        );
      })}

      {editorGuida && <SrvGuidaEditor stato={editorGuida} argomenti={argomenti}
        onChiudi={()=>setEditorGuida(null)} onSalva={salvaGuida}/>}
      {editorArg && <SrvArgomentoEditor stato={editorArg}
        onChiudi={()=>setEditorArg(null)} onSalva={salvaArg}/>}
    </div>
  );
}

function SrvRigaGuida({ g, ultima, aperta, onApri, onModifica, onLive, onElimina }) {
  const v = g.video;
  const voti = v ? v.utile + v.nonUtile : 0;
  const completamento = v ? Math.round(v.tempoMedioSec / v.durataSec * 100) : null;
  return (
    <div style={{borderBottom: ultima ? 'none' : `1px solid ${ADM.BORDER_SOFT}`,
      background: aperta ? ADM.PANEL_SOFT : 'transparent'}}>
      <div style={{display:'flex', alignItems:'center', gap:16, padding:'13px 20px'}}>
        <button onClick={onApri} style={{flex:1, minWidth:0, display:'flex', alignItems:'center', gap:14,
          textAlign:'left', background:'none', border:'none', padding:0, cursor:'pointer', fontFamily:'inherit'}}>
          <SrvMiniatura video={v}/>
          <span style={{flex:1, minWidth:0}}>
            <span style={{display:'block', fontSize:14.6, fontWeight:700,
              color: g.live ? ADM.TEXT : ADM.MUTED, letterSpacing:'-0.01em', lineHeight:1.35}}>{g.titolo}</span>
            <span style={{display:'block', fontSize:12.8, color:ADM.MUTED, marginTop:3, lineHeight:1.45,
              overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{g.descrizione}</span>
            {/* Lettura e video affiancati: sono due modi di consumare la stessa
                guida, e la scelta si fa confrontando i due tempi. */}
            <span style={{display:'flex', alignItems:'center', gap:7, marginTop:7}}>
              <SrvChip><BuIcons.clock size={12} color={ADM.MUTED}/> {g.minLettura} min di lettura</SrvChip>
              {v && <SrvChip tono="INFO">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13l11-6.5z"/></svg>
                {srvDurata(v.durataSec)} di video
              </SrvChip>}
              {v && v.descrizioneSotto && !aperta && (
                <span style={{fontSize:11.8, color:ADM.MUTED_LIGHT}}>+ nota sotto al video</span>
              )}
            </span>
          </span>
        </button>

        <span style={{width:92, textAlign:'right', flexShrink:0}}>
          <span style={{display:'block', fontSize:12.6, color:ADM.TEXT, fontWeight:600,
            fontVariantNumeric:'tabular-nums'}}>{g.letture > 0 ? fmtNum(g.letture) : '—'}</span>
          <span style={{display:'block', fontSize:11.2, color:ADM.MUTED_LIGHT, marginTop:1}}>letture</span>
        </span>
        <span style={{width:92, textAlign:'right', flexShrink:0}}>
          <span style={{display:'block', fontSize:12.6, fontWeight:600, fontVariantNumeric:'tabular-nums',
            color: completamento == null ? ADM.MUTED_LIGHT
              : completamento >= 65 ? ADM.OK : completamento >= 45 ? ADM.WARN : ADM.DANGER}}>
            {completamento != null ? `${completamento}%` : '—'}
          </span>
          <span style={{display:'block', fontSize:11.2, color:ADM.MUTED_LIGHT, marginTop:1}}>video guardato</span>
        </span>
        <span style={{width:76, textAlign:'right', flexShrink:0}}>
          <span style={{display:'block', fontSize:12.6, fontWeight:600, fontVariantNumeric:'tabular-nums',
            color: voti === 0 ? ADM.MUTED_LIGHT : (v.utile / voti) >= 0.9 ? ADM.OK : ADM.WARN}}>
            {voti > 0 ? `${Math.round(v.utile / voti * 100)}%` : '—'}
          </span>
          <span style={{display:'block', fontSize:11.2, color:ADM.MUTED_LIGHT, marginTop:1}}>utile</span>
        </span>

        <span style={{width:52, display:'flex', justifyContent:'flex-end', flexShrink:0}}>
          <AdmSwitch size="sm" checked={g.live} onChange={onLive}/>
        </span>
        <AdmIconBtn icon="pencil" label="Modifica" size={28} onClick={onModifica} color={ADM.MUTED_SOFT}/>
        <SrvEliminaInline onElimina={onElimina}/>
      </div>

      {aperta && (
        <div style={{padding:'0 20px 16px 162px', display:'flex', flexDirection:'column', gap:12, maxWidth:1000}}>
          <div style={{fontSize:13.8, color:ADM.TEXT, lineHeight:1.6}}>{g.descrizione}</div>
          {v && (
            <div style={{display:'flex', flexDirection:'column', gap:7}}>
              <div style={SRV_ETI}>Video · {v.titolo}</div>
              <div style={{fontSize:12.8, color:ADM.MUTED}}>
                {srvDurata(v.durataSec)} · visto in media {srvDurata(v.tempoMedioSec)} su {fmtNum(v.views)} visualizzazioni
                {voti > 0 && ` · ${v.utile} «utile», ${v.nonUtile} «non utile»`}
              </div>
              {v.descrizioneSotto && (
                <div style={{fontSize:13.4, color:ADM.TEXT, lineHeight:1.6, paddingLeft:12,
                  borderLeft:`2px solid ${ADM.BORDER}`}}>{v.descrizioneSotto}</div>
              )}
            </div>
          )}
          <div style={{fontSize:11.8, color:ADM.MUTED_LIGHT}}>Aggiornata {fmtRelative(g.aggiornataIl)}</div>
        </div>
      )}
    </div>
  );
}

// Legge la durata reale dal file scelto. Non serve un server: il browser
// carica i metadati del video locale e la durata la sa lui. Se il codec non è
// leggibile torna null e il campo resta a mano.
function srvDurataDaFile(file) {
  return new Promise(resolve => {
    const url = URL.createObjectURL(file);
    const el = document.createElement('video');
    el.preload = 'metadata';
    el.onloadedmetadata = () => { URL.revokeObjectURL(url); resolve(isFinite(el.duration) ? Math.round(el.duration) : null); };
    el.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
    el.src = url;
  });
}

function SrvGuidaEditor({ stato, argomenti, onChiudi, onSalva }) {
  const [d, setD] = useStateSrv(stato.dati);
  const [durataTesto, setDurataTesto] = useStateSrv(stato.dati.video ? srvDurata(stato.dati.video.durataSec) : '');
  const agg = (k, v) => setD(x => ({ ...x, [k]: v }));
  const aggVideo = (k, v) => setD(x => ({ ...x, video: { ...(x.video || {}), [k]: v } }));

  const valida = d.titolo.trim().length > 4 && d.descrizione.trim().length > 10
    && d.minLettura > 0 && !!d.argomentoId
    && (!d.video || d.video.durataSec > 0);

  const scegliVideo = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const durata = await srvDurataDaFile(file);
    setD(x => ({ ...x, video: {
      titolo: (x.video && x.video.titolo) || file.name.replace(/\.[^.]+$/, ''),
      durataSec: durata || (x.video && x.video.durataSec) || 0,
      descrizioneSotto: (x.video && x.video.descrizioneSotto) || '',
      views: (x.video && x.video.views) || 0,
      tempoMedioSec: (x.video && x.video.tempoMedioSec) || 0,
      utile: (x.video && x.video.utile) || 0,
      nonUtile: (x.video && x.video.nonUtile) || 0,
      file: file.name,
    }}));
    setDurataTesto(durata ? srvDurata(durata) : '');
  };

  // «7:08» → 428 secondi. Accetta anche i secondi secchi.
  const applicaDurata = (testo) => {
    setDurataTesto(testo);
    const p = testo.split(':').map(x => parseInt(x, 10));
    const sec = p.length === 2 && !isNaN(p[0]) && !isNaN(p[1]) ? p[0] * 60 + p[1]
      : p.length === 1 && !isNaN(p[0]) ? p[0] : null;
    if (sec != null) aggVideo('durataSec', sec);
  };

  return (
    <SrvModale
      titolo={stato.nuova ? 'Nuova guida' : 'Modifica la guida'}
      larghezza={780}
      nota="Il tempo di lettura e la durata del video compaiono affiancati sulla scheda: il ristoratore sceglie in base a quanto tempo ha, quindi vanno dichiarati onestamente."
      onChiudi={onChiudi}
      piede={
        <React.Fragment>
          <AdmButton variant="ghost" onClick={onChiudi}>Annulla</AdmButton>
          <AdmButton variant="primary" icon="check" disabled={!valida} onClick={()=>valida && onSalva(d)}>
            {stato.nuova ? 'Crea' : 'Salva'}
          </AdmButton>
        </React.Fragment>
      }>
      <div style={{display:'flex', flexDirection:'column', gap:24}}>

        <div>
          <div style={SRV_SEZ}>L'articolo</div>
          <div style={{display:'grid', gridTemplateColumns:'repeat(2, minmax(0,1fr))', gap:16}}>
            <SrvCampo etichetta="Argomento">
              <select value={d.argomentoId} onChange={e=>agg('argomentoId', e.target.value)} style={SRV_SEL}>
                {argomenti.map(a => <option key={a.id} value={a.id}>{a.nome}</option>)}
              </select>
            </SrvCampo>
            <SrvCampo etichetta="Tempo medio di lettura (minuti)">
              <input type="number" min="1" max="90" value={d.minLettura}
                onChange={e=>agg('minLettura', Math.max(1, parseInt(e.target.value, 10) || 1))} style={SRV_INP}/>
            </SrvCampo>
            <SrvCampo etichetta="Titolo" span>
              <input value={d.titolo} onChange={e=>agg('titolo', e.target.value)} style={SRV_INP}
                placeholder="Costruire il menu digitale"/>
            </SrvCampo>
            <SrvCampo etichetta="Descrizione" span
              aiuto="Due righe: cosa impara chi la legge. È il testo che compare nell'elenco delle guide.">
              <textarea value={d.descrizione} onChange={e=>agg('descrizione', e.target.value)} style={SRV_TXT}/>
            </SrvCampo>
          </div>
        </div>

        <div>
          <div style={SRV_SEZ}>Il video (facoltativo)</div>
          {!d.video ? (
            <label style={{display:'flex', alignItems:'center', gap:13, padding:'16px 18px', borderRadius:12,
              border:`1.5px dashed ${ADM.BORDER}`, background:ADM.PANEL_SOFT, cursor:'pointer'}}>
              <span style={{width:38, height:38, borderRadius:10, background:'#fff', border:`1px solid ${ADM.BORDER}`,
                display:'grid', placeItems:'center', color:ADM.MUTED, flexShrink:0}}>
                <BuIcons.download size={18}/>
              </span>
              <span style={{flex:1, minWidth:0}}>
                <span style={{display:'block', fontSize:13.8, fontWeight:600, color:ADM.TEXT}}>Carica un video</span>
                <span style={{display:'block', fontSize:12.2, color:ADM.MUTED, marginTop:2}}>
                  MP4 o MOV. La durata viene letta dal file e mostrata accanto al tempo di lettura.
                </span>
              </span>
              <input type="file" accept="video/*" onChange={scegliVideo} style={{display:'none'}}/>
            </label>
          ) : (
            <div style={{display:'flex', flexDirection:'column', gap:16}}>
              <div style={{display:'flex', alignItems:'center', gap:13, padding:'12px 14px', borderRadius:11,
                background:ADM.PANEL_SOFT, border:`1px solid ${ADM.BORDER_SOFT}`}}>
                <SrvMiniatura video={d.video} w={92}/>
                <span style={{flex:1, minWidth:0, fontSize:13.4, fontWeight:600, color:ADM.TEXT,
                  whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>
                  {d.video.file || d.video.titolo || 'Video caricato'}
                </span>
                <button onClick={()=>{ agg('video', null); setDurataTesto(''); }} className="adm-btn" style={{
                  padding:'5px 11px', borderRadius:8, border:`1px solid ${ADM.BORDER}`, background:'#fff',
                  color:ADM.DANGER, fontSize:12.3, fontWeight:600, fontFamily:'inherit', cursor:'pointer'}}>
                  Rimuovi
                </button>
              </div>

              <div style={{display:'grid', gridTemplateColumns:'repeat(2, minmax(0,1fr))', gap:16}}>
                <SrvCampo etichetta="Titolo del video">
                  <input value={d.video.titolo || ''} onChange={e=>aggVideo('titolo', e.target.value)} style={SRV_INP}/>
                </SrvCampo>
                <SrvCampo etichetta="Durata (m:ss)"
                  aiuto={d.video.durataSec > 0 ? `Comparirà come «${srvDurata(d.video.durataSec)} di video».` : 'Non è stato possibile leggerla dal file: inseriscila a mano.'}>
                  <input value={durataTesto} onChange={e=>applicaDurata(e.target.value)} style={SRV_INP} placeholder="7:08"/>
                </SrvCampo>
                <SrvCampo etichetta="Descrizione sotto al video" span
                  aiuto="Le avvertenze che servono a chi ha appena guardato: differenze fra dispositivi, passaggi che nel video non si vedono, eccezioni.">
                  <textarea value={d.video.descrizioneSotto || ''} onChange={e=>aggVideo('descrizioneSotto', e.target.value)}
                    style={{...SRV_TXT, minHeight:80}}/>
                </SrvCampo>
              </div>
            </div>
          )}
        </div>

        <SrvInterruttorePubblica live={d.live} onChange={(v)=>agg('live', v)}
          acceso="La guida comparirà nell'argomento appena salvi."
          spento="Resta in bozza: visibile solo qui in console."/>
      </div>
    </SrvModale>
  );
}

function SrvArgomentoEditor({ stato, onChiudi, onSalva }) {
  const [d, setD] = useStateSrv(stato.dati);
  const agg = (k, v) => setD(x => ({ ...x, [k]: v }));
  const valida = d.nome.trim().length > 2;
  const icone = ['store', 'utensils', 'list', 'receipt', 'card', 'chart', 'settings', 'help', 'phone', 'shield'];

  return (
    <SrvModale
      titolo={stato.nuovo ? 'Nuovo argomento' : 'Modifica l\'argomento'}
      nota="L'argomento è il raccoglitore: contiene più guide sullo stesso tema. Se ne serve uno per una guida sola, probabilmente la guida va in un argomento che esiste già."
      onChiudi={onChiudi}
      piede={
        <React.Fragment>
          <AdmButton variant="ghost" onClick={onChiudi}>Annulla</AdmButton>
          <AdmButton variant="primary" icon="check" disabled={!valida} onClick={()=>valida && onSalva(d)}>
            {stato.nuovo ? 'Crea' : 'Salva'}
          </AdmButton>
        </React.Fragment>
      }>
      <div style={{display:'flex', flexDirection:'column', gap:18}}>
        <SrvCampo etichetta="Nome">
          <input value={d.nome} onChange={e=>agg('nome', e.target.value)} style={SRV_INP}
            placeholder="Incassi e contabilità"/>
        </SrvCampo>
        <SrvCampo etichetta="Descrizione">
          <input value={d.descrizione} onChange={e=>agg('descrizione', e.target.value)} style={SRV_INP}
            placeholder="Cassa, corrispettivi, IVA ed esportazioni."/>
        </SrvCampo>
        <SrvCampo etichetta="Icona">
          <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
            {icone.map(nome => {
              const Ico = BuIcons[nome];
              const scelta = d.icona === nome;
              return (
                <button key={nome} onClick={()=>agg('icona', nome)} className="adm-btn" style={{
                  width:40, height:40, borderRadius:10, cursor:'pointer',
                  background: scelta ? ADM.PINK_BG_SOFT : '#fff',
                  border:`1px solid ${scelta ? ADM.PINK : ADM.BORDER}`,
                  color: scelta ? ADM.PINK_DARK : ADM.MUTED,
                  display:'grid', placeItems:'center',
                }}><Ico size={19}/></button>
              );
            })}
          </div>
        </SrvCampo>
      </div>
    </SrvModale>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 4. KPI — condivisi con il tab «Servizio Clienti» della Dashboard
// ═══════════════════════════════════════════════════════════════════════════
function AdmServizioClientiKPI({ richiamate, guide }) {
  const k = useMemoSrv(() => srvKpi(richiamate || RICHIAMATE, TICKET_SRV, guide || GUIDE_SRV),
    [richiamate, guide]);
  const s = k.soddisfazione;
  const maxVoti = Math.max(...s.distribuzione.map(d => d.n), 1);
  // Il tempo di chiusura migliora quando SCENDE: il segno del delta va
  // rovesciato prima di darlo al badge, che colora il positivo di verde.
  const deltaChiusura = k.ticket.chiusuraPrecOre
    ? -(k.ticket.chiusuraMediaOre - k.ticket.chiusuraPrecOre) / k.ticket.chiusuraPrecOre * 100
    : null;

  return (
    <div style={{padding:'24px 28px 28px', display:'flex', flexDirection:'column', gap:20}}>

      {/* ── Richiamate ── */}
      <SectionLabel first title="Richiamate" desc="La coda e la puntualità con cui la smaltiamo"/>
      <div style={{display:'grid', gridTemplateColumns:'repeat(4, minmax(0,1fr))', gap:14}}>
        <DashStatCard label="Richiamate in tempo" accent="OK"
          value={`${k.richiamate.pctInTempo}%`}
          sub={`${k.richiamate.inTempo} su ${k.richiamate.chiuse} entro la scadenza`}
          ratio={{ a:k.richiamate.inTempo, b:k.richiamate.inRitardo, aLabel:'in tempo', bLabel:'in ritardo', aColor:ADM.OK }}/>
        <DashStatCard label="In coda adesso"
          value={k.richiamate.attesa}
          sub={k.richiamate.scadute === 0 ? 'Tutte ancora dentro l\'SLA' : null}
          alertText={k.richiamate.scadute > 0 ? `${k.richiamate.scadute} oltre la scadenza` : null}/>
        <DashStatCard label="Attesa media" accent="INFO"
          value={srvMinuti(k.richiamate.attesaMediaMin)}
          sub="Dalla prenotazione alla chiamata"/>
        <DashStatCard label="Numeri non raggiunti"
          value={k.richiamate.perse}
          sub={`Su ${k.richiamate.totali} richiamate prenotate · contate a parte, non fra le riuscite`}/>
      </div>

      {/* ── Soddisfazione ── */}
      <SectionLabel title="Soddisfazione" desc="Il voto da 1 a 5 chiesto al ristoratore dopo la chiamata"/>
      {/* alignItems:start — la card del voto ha un'altezza naturale corta, e
          stirarla per pareggiare quella delle recensioni le lascerebbe dentro
          un vuoto largo quanto mezza card. */}
      <div style={{display:'grid', gridTemplateColumns:'300px minmax(0,1fr)', gap:14, alignItems:'start'}}>
        <AdmCard padding={0} style={{display:'flex', flexDirection:'column', overflow:'hidden'}}>
          <div style={{padding:'16px 18px 14px'}}>
            <div style={{fontSize:11.5, color:ADM.MUTED, fontWeight:700, textTransform:'uppercase',
              letterSpacing:'0.04em'}}>Voto medio</div>
            <div style={{display:'flex', alignItems:'baseline', gap:9, marginTop:8}}>
              <span style={{fontSize:40, fontWeight:800, color:ADM.TEXT, letterSpacing:'-0.03em', lineHeight:1}}>
                {s.media.toFixed(1).replace('.', ',')}
              </span>
              <span style={{fontSize:14, color:ADM.MUTED_SOFT, fontWeight:600}}>/ 5</span>
            </div>
            <div style={{display:'flex', alignItems:'center', gap:9, marginTop:9}}>
              <SrvStelle valore={s.media} size={17}/>
              <span style={{fontSize:12.5, color:ADM.MUTED}}>su {s.n} risposte</span>
            </div>
          </div>
          <div style={{padding:'13px 18px', borderTop:`1px solid ${ADM.BORDER_SOFT}`,
            display:'flex', flexDirection:'column', gap:7}}>
            {[...s.distribuzione].reverse().map(d => (
              <div key={d.voto} style={{display:'flex', alignItems:'center', gap:9}}>
                <span style={{fontSize:12, color:ADM.MUTED, fontWeight:700, width:10, textAlign:'right'}}>{d.voto}</span>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="#F59E0B" style={{flexShrink:0}}>
                  <path d="M12 3l2.7 5.5 6 .9-4.4 4.3 1 6L12 17l-5.4 2.7 1-6L3.4 9.4l6-.9L12 3z"/>
                </svg>
                <span style={{flex:1, height:6, borderRadius:99, background:ADM.BORDER_SOFT, overflow:'hidden'}}>
                  <span style={{display:'block', width:`${d.n / maxVoti * 100}%`, height:'100%',
                    background: d.voto >= 4 ? ADM.OK : d.voto === 3 ? ADM.WARN : ADM.DANGER, borderRadius:99}}/>
                </span>
                <span style={{fontSize:12, color:ADM.TEXT, fontWeight:600, width:14, textAlign:'right'}}>{d.n}</span>
              </div>
            ))}
          </div>
          <div style={{padding:'10px 18px 12px', borderTop:`1px solid ${ADM.BORDER_SOFT}`,
            fontSize:11.8, color:ADM.MUTED_LIGHT, lineHeight:1.5}}>
            Il sondaggio parte dieci minuti dopo la chiamata e resta aperto un giorno.
          </div>
        </AdmCard>

        <AdmCard padding={0} style={{display:'flex', flexDirection:'column', overflow:'hidden'}}>
          <div style={{padding:'13px 20px', borderBottom:`1px solid ${ADM.BORDER_SOFT}`,
            fontSize:11.5, fontWeight:700, color:ADM.MUTED, textTransform:'uppercase',
            letterSpacing:'0.04em', display:'flex', alignItems:'center', gap:8}}>
            Recensioni <span style={{color:ADM.MUTED_LIGHT}}>{s.recensioni.length}</span>
          </div>
          <div style={{flex:1, minHeight:0, maxHeight:322, overflowY:'auto'}}>
            {s.recensioni.map((r, i) => (
              <div key={r.id} style={{padding:'12px 20px',
                borderBottom: i === s.recensioni.length - 1 ? 'none' : `1px solid ${ADM.BORDER_SOFT}`}}>
                <div style={{display:'flex', alignItems:'center', gap:9, marginBottom:5}}>
                  <SrvStelle valore={r.voto} size={12}/>
                  <span style={{fontSize:13, fontWeight:700, color:ADM.TEXT}}>{r.localeNome}</span>
                  <span style={{fontSize:12, color:ADM.MUTED_SOFT}}>{r.titolare}</span>
                  <div style={{flex:1}}/>
                  <span style={{fontSize:11.5, color:ADM.MUTED_LIGHT}}>{fmtRelative(r.richiamataIl)}</span>
                </div>
                <div style={{fontSize:13.2, color:ADM.TEXT, lineHeight:1.55}}>«{r.recensione}»</div>
              </div>
            ))}
            {s.recensioni.length === 0 && <AdmEmpty icon="star" title="Nessuna recensione" desc="Nessuno ha ancora lasciato un commento"/>}
          </div>
        </AdmCard>
      </div>

      {/* ── Richieste e ticket ── */}
      <SectionLabel title="Richieste di assistenza"
        desc="Quante ne arrivano e quante si chiudono · la finestra «oggi» è bassa per costruzione"/>
      <div style={{display:'grid', gridTemplateColumns:'repeat(4, minmax(0,1fr))', gap:14}}>
        {k.ticket.finestre.map(f => (
          <AdmCard key={f.label} padding={0} style={{display:'flex', flexDirection:'column', overflow:'hidden'}}>
            <div style={{padding:'15px 16px 12px', display:'flex', flexDirection:'column', gap:7, flex:1}}>
              <span style={{fontSize:11.5, color:ADM.MUTED, fontWeight:700, textTransform:'uppercase',
                letterSpacing:'0.04em'}}>{f.label}</span>
              <div style={{display:'flex', alignItems:'baseline', gap:8}}>
                <span style={{fontSize:29, fontWeight:800, color:ADM.TEXT, letterSpacing:'-0.02em', lineHeight:1}}>
                  {fmtNum(f.avviati)}
                </span>
                <span style={{fontSize:12.8, color:ADM.MUTED}}>richieste avviate</span>
              </div>
              <span style={{fontSize:12.5, color:ADM.MUTED}}>
                <b style={{color:ADM.TEXT}}>{fmtNum(f.chiusi)}</b> con ticket chiuso · <b style={{color:ADM.TEXT}}>{f.pct}%</b>
              </span>
            </div>
            <div style={{padding:'0 16px 14px'}}>
              <MiniRatioBar a={f.chiusi} b={f.avviati - f.chiusi} aLabel="chiusi" bLabel="aperti" aColor={ADM.OK}/>
            </div>
          </AdmCard>
        ))}
        <DashStatCard label="Chiusura media di un ticket" accent="INFO"
          value={srvOre(k.ticket.chiusuraMediaOre)}
          trend={deltaChiusura} trendLabel="vs mese precedente"
          sub={`${k.ticket.apertiOra} ticket aperti in questo momento`}
          data={k.ticket.serie} gradId="grad-srv-ticket"/>
      </div>

      {/* ── Video ── */}
      <SectionLabel title="Video delle guide"
        desc="Quanto viene guardato davvero, e chi ha premuto «utile» o «non utile»"/>
      <div style={{display:'grid', gridTemplateColumns:'repeat(3, minmax(0,1fr))', gap:14}}>
        <DashStatCard label="Tempo medio di visualizzazione" accent="INFO"
          value={srvDurata(k.videoMedia.tempoMedioSec)}
          sub={`${k.videoMedia.completamento}% della durata, su ${fmtNum(k.videoMedia.views)} visualizzazioni`}/>
        <DashStatCard label="Video giudicati utili" accent="OK"
          value={k.videoMedia.pctUtile != null ? `${k.videoMedia.pctUtile}%` : '—'}
          sub={`${k.videoMedia.utile} «utile» · ${k.videoMedia.nonUtile} «non utile»`}
          ratio={{ a:k.videoMedia.utile, b:k.videoMedia.nonUtile, aLabel:'utile', bLabel:'non utile', aColor:ADM.OK }}/>
        <DashStatCard label="Video pubblicati"
          value={k.video.length}
          sub={`Su ${(guide || GUIDE_SRV).length} guide in catalogo`}/>
      </div>

      <AdmCard padding={0} style={{overflow:'hidden'}}>
        <div style={{display:'grid', gridTemplateColumns:'minmax(0,1fr) 82px 118px 152px 118px 150px',
          gap:12, padding:'11px 20px', background:ADM.PANEL_SOFT, borderBottom:`1px solid ${ADM.BORDER}`,
          fontSize:11.2, fontWeight:700, color:ADM.MUTED, textTransform:'uppercase', letterSpacing:'0.05em'}}>
          <span>Video</span>
          <span style={{textAlign:'right'}}>Durata</span>
          <span style={{textAlign:'right'}}>Visto in media</span>
          <span>Completamento</span>
          <span style={{textAlign:'right'}}>Visualizzazioni</span>
          <span>Utile / Non utile</span>
        </div>
        {k.video.map((v, i) => (
          <div key={v.guidaId} style={{display:'grid',
            gridTemplateColumns:'minmax(0,1fr) 82px 118px 152px 118px 150px', gap:12,
            padding:'12px 20px', alignItems:'center',
            borderBottom: i === k.video.length - 1 ? 'none' : `1px solid ${ADM.BORDER_SOFT}`}}>
            <div style={{minWidth:0}}>
              <div style={{fontSize:13.6, fontWeight:600, color:ADM.TEXT, whiteSpace:'nowrap',
                overflow:'hidden', textOverflow:'ellipsis'}}>{v.titolo}</div>
              <div style={{fontSize:11.8, color:ADM.MUTED_LIGHT, marginTop:2, whiteSpace:'nowrap',
                overflow:'hidden', textOverflow:'ellipsis'}}>{v.guidaTitolo}</div>
            </div>
            <span style={{textAlign:'right', fontSize:13, color:ADM.MUTED, fontVariantNumeric:'tabular-nums'}}>
              {srvDurata(v.durataSec)}
            </span>
            <span style={{textAlign:'right', fontSize:13.6, fontWeight:700, color:ADM.TEXT,
              fontVariantNumeric:'tabular-nums'}}>{srvDurata(v.tempoMedioSec)}</span>
            <div style={{display:'flex', alignItems:'center', gap:8}}>
              <span style={{flex:1, height:6, borderRadius:99, background:ADM.BORDER_SOFT, overflow:'hidden'}}>
                <span style={{display:'block', width:`${v.completamento}%`, height:'100%', borderRadius:99,
                  background: v.completamento >= 65 ? ADM.OK : v.completamento >= 45 ? ADM.WARN : ADM.DANGER}}/>
              </span>
              <span style={{fontSize:12.3, fontWeight:700, color:ADM.TEXT, width:32, textAlign:'right'}}>{v.completamento}%</span>
            </div>
            <span style={{textAlign:'right', fontSize:13, color:ADM.TEXT, fontVariantNumeric:'tabular-nums'}}>
              {fmtNum(v.views)}
            </span>
            <div style={{display:'flex', alignItems:'center', gap:9}}>
              <span style={{display:'inline-flex', alignItems:'center', gap:5, fontSize:12.5, fontWeight:700, color:ADM.OK}}>
                <BuIcons.thumbUp size={14}/>{v.utile}
              </span>
              <span style={{display:'inline-flex', alignItems:'center', gap:5, fontSize:12.5, fontWeight:700, color:ADM.MUTED}}>
                <BuIcons.thumbDown size={14}/>{v.nonUtile}
              </span>
              {v.pctUtile != null && (
                <span style={{fontSize:12, color:ADM.MUTED_LIGHT, fontWeight:600}}>({v.pctUtile}%)</span>
              )}
            </div>
          </div>
        ))}
        {k.video.length === 0 && <AdmEmpty icon="monitor" title="Nessun video" desc="Nessuna guida ha ancora un video allegato"/>}
      </AdmCard>
    </div>
  );
}

Object.assign(window, { AdmAssistenzaPage, AdmServizioClientiKPI });
