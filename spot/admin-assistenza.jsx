// Byup Spot — Assistenza
//
// Quattro tab, un solo tema: il rapporto fra byup e il ristoratore quando
// qualcosa non va.
//
//   Chiamate  la coda con l'orologio — chi va chiamato, entro quando
//   Ticket    la posta in arrivo: richieste, segnalazioni, certificazioni
//             (vive in admin-comunicazioni.jsx, qui è solo montata)
//   FAQ       le risposte scritte, pubblicabili una per una
//   Guide     gli articoli con video facoltativo. L'argomento è un campo
//             della guida, non un oggetto a parte: serve a raggrupparle
//
// Chiamate e Ticket erano due sezioni di menu separate. Sono lo stesso lavoro
// fatto su due canali — chi sta al supporto passa dall'una all'altra di
// continuo — e tenerle divise voleva dire non avere nessun posto in cui
// vedere tutto quello che un locale ha aperto con noi. Chiamate viene prima
// perché è l'unica delle due che scade.
//
// I KPI NON stanno qui: vivono solo in Dashboard → Servizio Clienti, che è
// dove si va a guardare i numeri. Il componente che li disegna
// (AdmServizioClientiKPI) resta però in questo file, perché è qui che stanno
// i dati che misura.
//
// ─── Impianto visivo ────────────────────────────────────────────────────────
// La sezione non inventa un proprio linguaggio: prende in prestito i due
// idiomi che Spot ha già.
//
//   Chiamate, Ticket → l'inbox a due pannelli: elenco fitto a sinistra,
//     dettaglio a destra, azioni ancorate in fondo. La versione a card
//     impilate a tutta larghezza costringeva a scorrere per contare la coda e
//     ripeteva su ogni riga informazioni che servono solo su quella aperta.
//
//   FAQ, Guide → le rubriche e i tier della Dashboard. Titoli come
//     SectionLabel (maiuscoletto tenue + descrizione accanto), non come
//     intestazioni nere; contenuto dentro POCHE card grandi divise da filetti,
//     non tante card piccole affiancate.

const { useState: useStateSrv, useMemo: useMemoSrv } = React;

// Chi sta usando la console. Non riuso MY_ID della sezione Ticket: che le due
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
function AdmAssistenzaPage({ initialTab, openTicket }) {
  // Chiamate prima dei Ticket: è l'unica delle due code che ha un orologio
  // che diventa rosso. Un ticket lo leggi quando puoi, una chiamata scade.
  const [tab, setTab] = useStateSrv(initialTab || 'richiamate');
  // Se si arriva qui dalla ricerca globale o da una notifica mentre la pagina
  // è già montata, lo stato iniziale non basta: il tab va seguito anche dopo
  // il primo render.
  React.useEffect(() => { if (initialTab) setTab(initialTab); }, [initialTab]);
  React.useEffect(() => { if (openTicket) setTab('ticket'); }, [openTicket]);

  // Lo stato vive qui e non nei singoli tab: cambiando tab e tornando indietro
  // le modifiche devono esserci ancora.
  const [richiamate, setRichiamate] = useStateSrv(RICHIAMATE);
  const [faq, setFaq] = useStateSrv(FAQ_SRV);
  const [argomenti, setArgomenti] = useStateSrv(GUIDE_ARGOMENTI);
  const [guide, setGuide] = useStateSrv(GUIDE_SRV);

  const inAttesa = richiamate.filter(r => r.stato === 'attesa').length;
  const ticketAperti = (typeof COMUNICAZIONI !== 'undefined' ? COMUNICAZIONI : [])
    .filter(c => c.stato === 'nuova' || c.stato === 'in_corso').length;

  const tabs = [
    { id:'richiamate', label:'Chiamate', badge: inAttesa },
    { id:'ticket',     label:'Ticket',   badge: ticketAperti },
    { id:'faq',        label:'FAQ' },
    { id:'guide',      label:'Guide' },
  ];

  // Le due code vogliono tutta l'altezza (elenco e dettaglio scorrono per
  // conto loro); FAQ e Guide sono pagine lunghe che scorrono intere.
  const aDuePannelli = tab === 'richiamate' || tab === 'ticket';

  return (
    <div style={{height:'100%', display:'flex', flexDirection:'column', background:ADM.PANEL_SOFT}}>
      <div style={{padding:'0 28px', background:'#fff', borderBottom:`1px solid ${ADM.BORDER}`,
        display:'flex', alignItems:'center', gap:12, flexShrink:0}}>
        <AdmTabBar tabs={tabs} active={tab} onChange={setTab}/>
      </div>
      <div style={{flex:1, minHeight:0, display:'flex', flexDirection:'column',
        overflow: aDuePannelli ? 'hidden' : 'auto'}}>
        {tab === 'richiamate' && <SrvRichiamate richiamate={richiamate} setRichiamate={setRichiamate}/>}
        {tab === 'ticket'     && <AdmComunicazioniPage openId={openTicket}/>}
        {tab === 'faq'        && <SrvFaq faq={faq} setFaq={setFaq}/>}
        {tab === 'guide'      && <SrvGuide argomenti={argomenti} setArgomenti={setArgomenti} guide={guide} setGuide={setGuide}/>}
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

  // Modale di registrazione esito + la conferma che segue una non risposta.
  const [esitoPer, setEsitoPer] = useStateSrv(null);
  const [mailInviata, setMailInviata] = useStateSrv(null);

  const nAttesa = richiamate.filter(r => r.stato === 'attesa').length;
  const nNonRisolto = richiamate.filter(srvNonRisolto).length;
  const scadute = richiamate.filter(r => r.stato === 'attesa' && srvMinutiAScadere(r) < 0);

  // Tre viste sole: quelle da fare, quelle che hanno lasciato un problema
  // aperto, e tutto. Le chiamate andate a buon fine non hanno una vista loro
  // perché non c'è niente da farci — si trovano in «Tutte» quando servono.
  const viste = [
    { id:'attesa',     label:'Da chiamare', count:nAttesa },
    { id:'nonrisolto', label:'Non risolto', count:nNonRisolto },
    { id:'tutte',      label:'Tutte',       count:richiamate.length },
  ];

  const elenco = useMemoSrv(() => {
    const q = cerca.trim().toLowerCase();
    let r = vista === 'attesa'     ? richiamate.filter(x => x.stato === 'attesa')
          : vista === 'nonrisolto' ? richiamate.filter(srvNonRisolto)
          : richiamate;
    if (q) r = r.filter(x => [x.localeNome, x.titolare, x.tel, x.problema, x.noteOperatore, x.id]
      .some(v => String(v || '').toLowerCase().includes(q)));
    // In coda si ordina per scadenza, non per arrivo: chi ha meno tempo sta
    // in cima anche se ha chiamato dopo. Nelle viste storiche torna il tempo.
    return [...r].sort((a, b) => a.stato === 'attesa' && b.stato === 'attesa'
      ? a.entro - b.entro
      : b.prenotataIl - a.prenotataIl);
  }, [richiamate, vista, cerca]);

  const sel = elenco.find(r => r.id === selId) || elenco[0];

  // Un solo punto d'ingresso per l'esito: quello che l'operatore compila nel
  // modale. Niente più scorciatoie che scrivono uno stato senza dire perché.
  const applicaEsito = (id, esito) => {
    const adesso = new Date();
    setRichiamate(prev => prev.map(r => {
      if (r.id !== id) return r;
      if (!esito.risposto) {
        // `inTempo` si conserva anche qui: è la prova che l'impegno l'abbiamo
        // onorato — abbiamo chiamato entro la scadenza — ed è proprio il
        // motivo per cui la pratica non entra fra le non risolte. Resta però
        // fuori dal rapporto sulla puntualità, che si calcola sulle sole
        // chiamate a cui qualcuno ha risposto.
        return { ...r, stato:'persa', risposto:false,
          tentativi:(r.tentativi || 0) + 1, operatore: SRV_IO, richiamataIl: adesso,
          inTempo: adesso <= r.entro,
          noteOperatore: null, problemaCat: null, risolto: null, urgenza: null };
      }
      return { ...r, stato:'fatta', risposto:true, richiamataIl: adesso, operatore: SRV_IO,
        inTempo: adesso <= r.entro,
        problemaCat: esito.problemaCat, risolto: esito.risolto,
        urgenza: esito.risolto ? null : esito.urgenza,
        noteOperatore: esito.note || null };
    }));
    setEsitoPer(null);
    // La mail parte solo quando non ha risposto: è lì che il ristoratore
    // resta senza notizie e va rassicurato.
    if (!esito.risposto) setMailInviata(richiamate.find(x => x.id === id));
  };

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
        {/* La regola di ammissibilità detta in chiaro: senza, un operatore che
            non vede mai un locale Starter qui potrebbe pensare a un filtro
            rotto invece che a una prestazione di piano. */}
        <span style={{display:'inline-flex', alignItems:'center', gap:7, fontSize:12.4, color:ADM.MUTED_SOFT,
          whiteSpace:'nowrap'}}>
          <BuIcons.info size={14} color={ADM.MUTED_LIGHT}/>
          Solo <b style={{color:ADM.MUTED, fontWeight:600}}>Plus</b> e <b style={{color:ADM.MUTED, fontWeight:600}}>Business</b>
          {' '}possono prenotare una chiamata · gli altri piani hanno i ticket
        </span>
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
            {elenco.length} {elenco.length === 1 ? 'chiamata' : 'chiamate'}
            <span style={{color:ADM.MUTED_SOFT}}> · {viste.find(v=>v.id===vista).label.toLowerCase()}</span>
          </div>
          <div style={{flex:1, overflowY:'auto'}}>
            {elenco.length === 0 && <AdmEmpty icon="phone" title="Nessuna chiamata"
              desc={cerca ? 'Nessun risultato per questa ricerca' : 'La coda è vuota'}/>}
            {elenco.map(r => (
              <SrvVoceCoda key={r.id} r={r} attiva={sel && sel.id === r.id} onClick={()=>setSelId(r.id)}/>
            ))}
          </div>
        </div>

        {/* Dettaglio */}
        <div style={{flex:1, minWidth:0, display:'flex', flexDirection:'column', background:ADM.PANEL_SOFT}}>
          {sel
            ? <SrvDettaglioRichiamata r={sel} tutte={richiamate} onRegistra={()=>setEsitoPer(sel)}/>
            : <AdmEmpty icon="phone" title="Seleziona una chiamata" desc="Dall'elenco a sinistra"/>}
        </div>
      </div>

      {esitoPer && (
        <SrvEsitoModale r={esitoPer} onChiudi={()=>setEsitoPer(null)}
          onSalva={(e)=>applicaEsito(esitoPer.id, e)}/>
      )}
      {mailInviata && (
        <SrvMailInviata r={mailInviata} onChiudi={()=>setMailInviata(null)}/>
      )}
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
      {/* Accanto al titolare, la fascia che ha chiesto: senza, il countdown
          dice quanto manca ma non a cosa ci eravamo impegnati, e «−3h» su una
          richiesta «in mattinata» pesa diverso che su una da 30 minuti. */}
      <div style={{fontSize:12.4, color:ADM.MUTED, marginTop:2, paddingLeft:15, whiteSpace:'nowrap',
        overflow:'hidden', textOverflow:'ellipsis'}}>
        {r.titolare}
        {r.stato === 'attesa' && (
          <span style={{color:ADM.MUTED_LIGHT}}> · chiesta {SRV_FASCE[r.fascia].breve}</span>
        )}
      </div>
      {r.problema && (
        <div style={{fontSize:12.8, color:ADM.MUTED_SOFT, marginTop:4, paddingLeft:15, lineHeight:1.4,
          display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden'}}>
          {r.problema}
        </div>
      )}
      {/* Scorrendo il «Non risolto» le due cose che servono per decidere da
          quale ripartire sono l'urgenza e di che problema si tratta: stanno
          qui, non solo nel dettaglio. */}
      {srvNonRisolto(r) && (
        <div style={{paddingLeft:15, marginTop:6, display:'flex', alignItems:'center', gap:7, flexWrap:'wrap'}}>
          {r.urgenza && <SrvPastiglia testo={`Urgenza ${SRV_URGENZE[r.urgenza].label.toLowerCase()}`}
            tono={SRV_URGENZE[r.urgenza].color} piena/>}
          {r.problemaCat && <SrvPastiglia testo={SRV_PROBLEMI[r.problemaCat].label}
            tono={SRV_PROBLEMI[r.problemaCat].color}/>}
        </div>
      )}
      {r.stato === 'fatta' && r.risolto && (
        <div style={{paddingLeft:15, marginTop:5, display:'flex', alignItems:'center', gap:7}}>
          <span style={{fontSize:11.5, fontWeight:700, color:ADM.OK}}>Risolto</span>
          <span style={{fontSize:11.5, color:ADM.MUTED_LIGHT}}>·</span>
          <span style={{fontSize:11.5, fontWeight:600, color: r.inTempo ? ADM.MUTED : ADM.WARN}}>
            {r.inTempo ? 'in tempo' : 'in ritardo'}
          </span>
          {r.voto != null && <SrvStelle valore={r.voto} size={11}/>}
        </div>
      )}
      {/* Non ha risposto: chiusa da parte nostra, quindi non è più una riga
          della coda — ma in «Tutte» va comunque riconosciuta a colpo d'occhio. */}
      {r.stato === 'persa' && (
        <div style={{paddingLeft:15, marginTop:5, fontSize:11.5, fontWeight:700, color:ADM.MUTED_SOFT}}>
          Non ha risposto · {r.tentativi} {r.tentativi === 1 ? 'tentativo' : 'tentativi'} · tocca a lui riprenotare
        </div>
      )}
    </button>
  );
}

// Pastiglia minuta per urgenza e categoria di problema. `piena` la rende a
// fondo colorato: l'urgenza deve battere la categoria a colpo d'occhio.
function SrvPastiglia({ testo, tono, piena }) {
  const c = tono ? (ADM[tono] || tono) : ADM.MUTED;
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', padding:'2px 8px', borderRadius:6,
      background: piena ? c : `${c}14`, color: piena ? '#fff' : c,
      fontSize:11, fontWeight:700, whiteSpace:'nowrap', letterSpacing:'0.01em',
    }}>{testo}</span>
  );
}

function SrvDettaglioRichiamata({ r, tutte, onRegistra }) {
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
      {/* Intestazione — come il thread di un ticket: bianca, con chi è e
          da quando aspetta, senza ripetere niente di quello che sta sotto. */}
      <div style={{background:'#fff', borderBottom:`1px solid ${ADM.BORDER}`, padding:'16px 26px 15px', flexShrink:0}}>
        <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:7}}>
          <span style={{fontSize:12, color:ADM.MUTED_LIGHT, fontWeight:600}}>{r.id}</span>
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
          {/* Niente link `tel:`: su una console desktop il più delle volte non
              c'è nulla registrato per quel protocollo e il click non fa
              niente, senza dire perché. Il numero grande e il copia bastano —
              chi ha il centralino a parte incolla, chi ha il telefono in mano
              legge. Se un giorno Spot avrà un centralino integrato, quello
              sarà un pulsante che compone davvero e registra la durata. */}
          <AdmCard padding={0} style={{overflow:'hidden'}}>
            <div style={{padding:'14px 18px 16px'}}>
              <div style={SRV_ETI}>Numero da chiamare</div>
              <div style={{display:'flex', alignItems:'center', gap:14, marginTop:10}}>
                <span style={{flex:1, minWidth:0, fontSize:28, fontWeight:800, color:ADM.TEXT,
                  letterSpacing:'-0.01em', fontVariantNumeric:'tabular-nums'}}>{r.tel}</span>
                {/* `border` intero e non `borderColor`: AdmButton imposta già
                    lo shorthand, e mescolare i due fa avvisare React perché
                    al rerender la proprietà lunga viene rimossa. */}
                <AdmButton variant="secondary" icon={copiato ? 'check' : 'copy'} onClick={copia}
                  style={copiato ? { color:ADM.OK, border:`1px solid ${ADM.OK}55` } : undefined}>
                  {copiato ? 'Copiato' : 'Copia'}
                </AdmButton>
              </div>
            </div>
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
              {/* La scadenza è quella che ha chiesto lui, non una che gli
                  abbiamo assegnato noi: vale la pena dirlo, perché cambia il
                  tono con cui si affronta un ritardo. */}
              <div style={{padding:'9px 18px 10px', borderTop:`1px solid ${ADM.BORDER_SOFT}`,
                fontSize:12.4, color:ADM.MUTED}}>
                Ha chiesto: <b style={{color:ADM.TEXT}}>{SRV_FASCE[r.fascia].label.toLowerCase()}</b>
                {SRV_FASCE[r.fascia].tipo === 'finestra'
                  ? ` (${SRV_FASCE[r.fascia].da}:00–${SRV_FASCE[r.fascia].a}:00)`
                  : ' dalla prenotazione'}
              </div>
            </AdmCard>
          )}

          {/* Chiamata fatta: quello che conta non è più la scadenza ma se il
              problema è chiuso. Il rispetto dell'SLA scende a riga di
              servizio — è un dato per il rapporto, non per chi lavora. */}
          {r.stato === 'fatta' && (
            <AdmCard padding={0} style={{overflow:'hidden',
              borderColor: r.risolto ? ADM.BORDER : `${ADM.WARN}55`}}>
              <div style={{padding:'14px 18px 15px'}}>
                <div style={SRV_ETI}>Esito</div>
                <div style={{fontSize:19, fontWeight:800, marginTop:9, letterSpacing:'-0.01em',
                  color: r.risolto ? ADM.OK : ADM.WARN}}>
                  {r.risolto ? 'Problema risolto' : 'Problema ancora aperto'}
                </div>
                <div style={{display:'flex', alignItems:'center', gap:7, marginTop:8, flexWrap:'wrap'}}>
                  {r.problemaCat && <SrvPastiglia testo={SRV_PROBLEMI[r.problemaCat].label}
                    tono={SRV_PROBLEMI[r.problemaCat].color}/>}
                  {!r.risolto && r.urgenza && <SrvPastiglia testo={`Urgenza ${SRV_URGENZE[r.urgenza].label.toLowerCase()}`}
                    tono={SRV_URGENZE[r.urgenza].color} piena/>}
                </div>
              </div>
              <div style={{padding:'9px 18px 10px', borderTop:`1px solid ${ADM.BORDER_SOFT}`,
                fontSize:12.4, color:ADM.MUTED}}>
                {(TEAM.find(t => t.id === r.operatore) || {}).nome || '—'}
                {r.durataMin ? ` · ${r.durataMin} min` : ''}
                {' · '}<span style={{color: r.inTempo ? ADM.MUTED : ADM.WARN, fontWeight:600}}>
                  {r.inTempo ? 'chiamato in tempo' : 'chiamato in ritardo'}</span>
              </div>
            </AdmCard>
          )}

          {/* Non ha risposto: l'impegno preso l'abbiamo mantenuto — chiamato
              entro l'SLA, mail partita. Da parte nostra è chiusa, e il
              riquadro lo dice invece di lasciarla in un limbo ambrato. */}
          {r.stato === 'persa' && (
            <AdmCard padding={0} style={{overflow:'hidden'}}>
              <div style={{padding:'14px 18px 15px'}}>
                <div style={SRV_ETI}>Esito</div>
                <div style={{fontSize:19, fontWeight:800, color:ADM.MUTED, marginTop:9, letterSpacing:'-0.01em'}}>
                  Non ha risposto
                </div>
                <div style={{fontSize:12.8, color:ADM.MUTED, marginTop:4}}>
                  {r.tentativi} {r.tentativi === 1 ? 'tentativo' : 'tentativi'} senza risposta
                  {r.inTempo === false ? ' · fuori SLA' : ''}
                </div>
              </div>
              <div style={{padding:'9px 18px 10px', borderTop:`1px solid ${ADM.BORDER_SOFT}`,
                fontSize:12.4, color:ADM.MUTED}}>
                {(TEAM.find(t => t.id === r.operatore) || {}).nome || '—'}
                {' · mail di riprenotazione inviata'}
              </div>
            </AdmCard>
          )}
        </div>

        {/* Chi la riprende in mano deve trovare scritto cosa è già stato
            fatto, non ricostruirlo dalla voce del ristoratore. */}
        {r.noteOperatore && (
          <div>
            <div style={{...SRV_ETI, marginBottom:8}}>
              Come è stata gestita
              <span style={{textTransform:'none', letterSpacing:0, fontWeight:500, color:ADM.MUTED_LIGHT}}>
                {' — '}{(TEAM.find(t => t.id === r.operatore) || {}).nome || '—'}
                {r.richiamataIl ? `, ${fmtDateTime(r.richiamataIl)}` : ''}
              </span>
            </div>
            <AdmCard style={{fontSize:14.2, color:ADM.TEXT, lineHeight:1.6}}>{r.noteOperatore}</AdmCard>
          </div>
        )}

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

      {/* Azioni ancorate in fondo, come la barra di risposta dei Ticket:
          non si scorre per trovarle. Un solo pulsante, che apre il modale
          dell'esito: «ha risposto?» e «è risolto?» sono due domande diverse e
          due bottoni affiancati le confondevano in una sola. */}
      {(r.stato === 'attesa' || srvNonRisolto(r)) && (
        <div style={{background:'#fff', borderTop:`1px solid ${ADM.BORDER}`, padding:'13px 26px',
          display:'flex', alignItems:'center', gap:11, flexShrink:0}}>
          <span style={{flex:1, fontSize:12.8, color:ADM.MUTED}}>
            {r.stato === 'attesa'
              ? 'Registra l\'esito appena riagganci: la puntualità si misura da qui.'
              : 'Il problema è ancora aperto: quando lo riprendi, registra il nuovo esito.'}
          </span>
          <AdmButton variant="success" icon="check" onClick={onRegistra}>
            {r.stato === 'attesa' ? 'Chiamato' : 'Registra nuovo esito'}
          </AdmButton>
        </div>
      )}

      {/* Nessun pulsante quando non ha risposto: non c'è niente che
          l'operatore debba fare, e mettere un'azione qui vorrebbe dire
          rimettersi in carico un impegno che abbiamo già onorato. */}
      {r.stato === 'persa' && (
        <div style={{background:'#fff', borderTop:`1px solid ${ADM.BORDER}`, padding:'13px 26px',
          display:'flex', alignItems:'center', gap:9, flexShrink:0}}>
          <BuIcons.check size={15} color={ADM.OK}/>
          <span style={{flex:1, fontSize:12.8, color:ADM.MUTED}}>
            Chiusa da parte nostra: l'abbiamo chiamato entro l'SLA e gli è partita la mail.
            Per riparlarne deve riprenotare lui.
          </span>
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
                È la prima chiamata che prenota.
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

// ─── Registrazione dell'esito ───────────────────────────────────────────────
//
// Il modale segue l'ordine in cui l'operatore ha le informazioni in testa
// appena riaggancia: prima «ho parlato con qualcuno?», e solo se sì ha senso
// chiedere di che problema si trattava e se è chiuso. Chiedere la categoria
// prima di sapere se ha risposto vorrebbe dire far compilare campi che
// nella metà dei casi vanno buttati.
function SrvEsitoModale({ r, onChiudi, onSalva }) {
  const [risposto, setRisposto] = useStateSrv(null);
  const [problemaCat, setProblemaCat] = useStateSrv(null);
  const [risolto, setRisolto] = useStateSrv(null);
  const [urgenza, setUrgenza] = useStateSrv(null);
  const [note, setNote] = useStateSrv('');

  // Se non ha risposto non c'è altro da chiedere: la mail è una sola e parte
  // uguale sempre, quindi basta aver scelto «No».
  const valida = risposto === false
    ? true
    : risposto === true
      ? !!problemaCat && risolto != null && (risolto || !!urgenza)
      : false;

  const salva = () => {
    if (!valida) return;
    onSalva(risposto
      ? { risposto:true, problemaCat, risolto, urgenza: risolto ? null : urgenza, note: note.trim() }
      : { risposto:false });
  };

  return (
    <SrvModale
      titolo="Com'è andata la chiamata?"
      larghezza={720}
      nota={`${r.localeNome} · ${r.titolare} · ${r.tel}`}
      onChiudi={onChiudi}
      piede={
        <React.Fragment>
          <AdmButton variant="ghost" onClick={onChiudi}>Annulla</AdmButton>
          <AdmButton variant="primary" icon="check" disabled={!valida} onClick={salva}>Registra l'esito</AdmButton>
        </React.Fragment>
      }>
      <div style={{display:'flex', flexDirection:'column', gap:24}}>

        <div>
          <div style={SRV_SEZ}>Ha risposto?</div>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
            <SrvScelta grande attiva={risposto === true} tono="OK"
              titolo="Sì, ho parlato con lui"
              nota="Registra di che problema si trattava e se è chiuso."
              onClick={()=>setRisposto(true)}/>
            <SrvScelta grande attiva={risposto === false} tono="WARN"
              titolo="No, non ha risposto"
              nota="Parte una mail automatica: non lo lasciamo senza notizie."
              onClick={()=>setRisposto(false)}/>
          </div>
        </div>

        {risposto === true && (
          <React.Fragment>
            <div>
              <div style={SRV_SEZ}>Che problema era davvero</div>
              <div style={{display:'flex', flexWrap:'wrap', gap:8}}>
                {Object.entries(SRV_PROBLEMI).map(([id, p]) => (
                  <button key={id} onClick={()=>setProblemaCat(id)} className="adm-pill"
                    title={p.nota}
                    style={{
                      display:'inline-flex', alignItems:'center', gap:7, padding:'7px 13px', borderRadius:99,
                      background: problemaCat === id ? ADM[p.color] : '#fff',
                      color: problemaCat === id ? '#fff' : ADM.TEXT,
                      border:`1px solid ${problemaCat === id ? ADM[p.color] : ADM.BORDER}`,
                      fontSize:13.2, fontWeight:600, fontFamily:'inherit', cursor:'pointer',
                    }}>
                    <span style={{width:7, height:7, borderRadius:'50%',
                      background: problemaCat === id ? 'rgba(255,255,255,0.8)' : ADM[p.color]}}/>
                    {p.label}
                  </button>
                ))}
              </div>
              {problemaCat && (
                <div style={{fontSize:12, color:ADM.MUTED_SOFT, marginTop:9}}>{SRV_PROBLEMI[problemaCat].nota}</div>
              )}
            </div>

            <div>
              <div style={SRV_SEZ}>Il problema adesso</div>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
                <SrvScelta attiva={risolto === true} tono="OK" titolo="Risolto"
                  nota="Chiuso durante la chiamata, non serve tornarci."
                  onClick={()=>{ setRisolto(true); setUrgenza(null); }}/>
                <SrvScelta attiva={risolto === false} tono="WARN" titolo="Ancora aperto"
                  nota="Resta da lavorare: finisce in «Non risolto»."
                  onClick={()=>setRisolto(false)}/>
              </div>
            </div>

            {risolto === false && (
              <div>
                <div style={SRV_SEZ}>Con quanta urgenza va ripreso</div>
                <div style={{display:'flex', flexWrap:'wrap', gap:8}}>
                  {Object.entries(SRV_URGENZE).map(([id, u]) => (
                    <button key={id} onClick={()=>setUrgenza(id)} className="adm-pill" title={u.nota}
                      style={{
                        padding:'7px 15px', borderRadius:99,
                        background: urgenza === id ? ADM[u.color] : '#fff',
                        color: urgenza === id ? '#fff' : ADM.TEXT,
                        border:`1px solid ${urgenza === id ? ADM[u.color] : ADM.BORDER}`,
                        fontSize:13.2, fontWeight:700, fontFamily:'inherit', cursor:'pointer',
                      }}>{u.label}</button>
                  ))}
                </div>
                {urgenza && (
                  <div style={{fontSize:12, color:ADM.MUTED_SOFT, marginTop:9}}>{SRV_URGENZE[urgenza].nota}</div>
                )}
              </div>
            )}
          </React.Fragment>
        )}


        {/* Le note si chiedono solo se ha risposto. Su un tentativo a vuoto non
            c'è niente da annotare che qualcuno leggerà: la pratica si chiude,
            nessuno la riprende in mano, e un campo che si compila per nessuno
            è solo un attrito in più fra l'operatore e la chiamata dopo. */}
        {risposto === true && (
          <SrvCampo etichetta="Cosa hai fatto e cosa resta da fare"
            aiuto="Lo legge chi riprende in mano la pratica: scrivi cosa hai già provato, non solo il sintomo.">
            <textarea value={note} onChange={e=>setNote(e.target.value)} style={{...SRV_TXT, minHeight:90}}
              placeholder="Regola di instradamento verso la stampante sbagliata. Corretta."/>
          </SrvCampo>
        )}
      </div>
    </SrvModale>
  );
}

// Riquadro di scelta: un titolo, una riga di conseguenza. Le opzioni che
// cambiano dove finisce la pratica meritano più di un radio button.
function SrvScelta({ attiva, tono, titolo, nota, onClick, grande }) {
  const c = ADM[tono] || ADM.PINK;
  return (
    <button onClick={onClick} className="adm-btn" style={{
      textAlign:'left', padding: grande ? '14px 16px' : '12px 14px', borderRadius:12,
      background: attiva ? `${c}10` : '#fff',
      border:`1.5px solid ${attiva ? c : ADM.BORDER}`,
      cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'flex-start', gap:11,
    }}>
      <span style={{
        width:18, height:18, borderRadius:'50%', flexShrink:0, marginTop:1,
        border:`1.5px solid ${attiva ? c : ADM.MUTED_LIGHT}`,
        background: attiva ? c : '#fff',
        display:'grid', placeItems:'center',
      }}>
        {attiva && <BuIcons.check size={11} color="#fff" strokeWidth={3.4}/>}
      </span>
      <span style={{flex:1, minWidth:0}}>
        <span style={{display:'block', fontSize: grande ? 14.6 : 13.8, fontWeight:700,
          color: attiva ? c : ADM.TEXT, letterSpacing:'-0.01em'}}>{titolo}</span>
        <span style={{display:'block', fontSize:12.2, color:ADM.MUTED, marginTop:3, lineHeight:1.45}}>{nota}</span>
      </span>
    </button>
  );
}

// La conferma che segue una non risposta. Fa vedere la mail vera, non una
// descrizione della mail: l'operatore deve sapere con quali parole il
// ristoratore è stato liquidato, perché se quello richiama arrabbiato è a
// quel testo che si riferisce.
function SrvMailInviata({ r, onChiudi }) {
  const m = SRV_MAIL_NON_RISPOSTA;
  const locale = LOCALI.find(l => l.id === r.localeId);
  return (
    <SrvModale
      titolo="Chiamata chiusa, ristoratore avvisato"
      larghezza={540}
      nota="Da parte nostra è chiusa: l'abbiamo chiamato entro la scadenza. Per riparlarne tocca a lui riprenotare."
      onChiudi={onChiudi}
      piede={<AdmButton variant="primary" onClick={onChiudi}>Ho capito</AdmButton>}>
      <div style={{display:'flex', flexDirection:'column', gap:14}}>
        <div style={{display:'flex', alignItems:'center', gap:9, fontSize:12.6, color:ADM.MUTED}}>
          <BuIcons.mail size={15} color={ADM.MUTED_SOFT}/>
          A <b style={{color:ADM.TEXT}}>{locale?.email || r.titolare}</b>
        </div>

        {/* Anteprima della mail: bordo e fondo la staccano dalla console, così
            si legge come un messaggio e non come un'altra scheda dell'admin. */}
        <div style={{border:`1px solid ${ADM.BORDER}`, borderRadius:12, overflow:'hidden',
          background:'#fff'}}>
          <div style={{padding:'11px 16px', borderBottom:`1px solid ${ADM.BORDER_SOFT}`,
            background:ADM.PANEL_SOFT, fontSize:13.2, fontWeight:700, color:ADM.TEXT}}>
            {m.oggetto}
          </div>
          <div style={{padding:'16px 18px 18px', display:'flex', flexDirection:'column', gap:12}}>
            <div style={{fontSize:13.8, color:ADM.TEXT, lineHeight:1.65}}>{m.corpo}</div>
            <div style={{fontSize:13.8, color:ADM.TEXT, lineHeight:1.65}}>{m.chiusura}</div>
            <span style={{alignSelf:'flex-start', marginTop:2, padding:'9px 16px', borderRadius:9,
              background:'linear-gradient(180deg, #FF6F73 0%, #E04347 100%)', color:'#fff',
              fontSize:13.4, fontWeight:700,
              boxShadow:'0 4px 12px -4px rgba(255,90,95,0.55)'}}>{m.cta}</span>
          </div>
        </div>
      </div>
    </SrvModale>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 2. FAQ — una card, righe divise da filetti, raggruppate per categoria
// ═══════════════════════════════════════════════════════════════════════════
function SrvFaq({ faq, setFaq }) {
  const [filtro, setFiltro] = useStateSrv('tutte');
  const [cerca, setCerca] = useStateSrv('');
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
      <SectionLabel first title="Domande frequenti"/>

      <SrvBarraStrumenti
        cerca={cerca} onCerca={setCerca} placeholder="Cerca fra domande e risposte…"
        segmenti={[
          { id:'tutte',  label:'Tutte',  badge:faq.length },
          { id:'online', label:'Online', badge:online },
          { id:'bozze',  label:'Bozze',  badge:faq.length - online },
        ]}
        attivo={filtro} onSegmento={setFiltro}
        azione={<AdmButton variant="cta" icon="plus" onClick={()=>setEditor({ nuova:true, dati:{
          categoria: FAQ_CATEGORIE[0], domanda:'', risposta:'', live:false } })}>Aggiungi FAQ</AdmButton>}
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
                    onApri={()=>setEditor({ nuova:false, dati:{ ...f } })}
                    onLive={(v)=>setFaq(prev => prev.map(x => x.id === f.id ? { ...x, live:v } : x))}/>
                ))}
              </div>
            ))}
          </AdmCard>
        )}

      {editor && <SrvFaqEditor stato={editor} onChiudi={()=>setEditor(null)} onSalva={salva}
        onElimina={(id)=>{ setFaq(prev => prev.filter(x => x.id !== id)); setEditor(null); }}/>}
    </div>
  );
}

// La riga non si espande più: cliccarla apre direttamente la modifica. Il
// pannello a fisarmonica mostrava la risposta in sola lettura e poi serviva
// comunque la matita per cambiarla — due gesti per arrivare dove il primo
// poteva già portare. Sparite con lui anche matita e cestino: la modifica è
// il click sulla riga, e la cancellazione vive dentro il modale, che è
// l'unico posto dove hai la domanda davanti mentre decidi di buttarla.
function SrvRigaFaq({ f, ultima, onApri, onLive }) {
  return (
    <div style={{borderBottom: ultima ? 'none' : `1px solid ${ADM.BORDER_SOFT}`,
      display:'flex', alignItems:'center', gap:14, padding:'12px 20px'}}>
      <button onClick={onApri} className="adm-row-open"
        style={{flex:1, minWidth:0, display:'flex', alignItems:'center', gap:11,
          textAlign:'left', background:'none', border:'none', padding:0, cursor:'pointer', fontFamily:'inherit'}}>
        <span style={{flex:1, minWidth:0}}>
          <span style={{display:'block', fontSize:14.4, fontWeight:600,
            color: f.live ? ADM.TEXT : ADM.MUTED, lineHeight:1.4}}>{f.domanda}</span>
          <span style={{display:'block', fontSize:11.8, color:ADM.MUTED_LIGHT, marginTop:3}}>
            Aggiornata {fmtRelative(f.aggiornataIl)}
          </span>
        </span>
        <span className="adm-row-chev" style={{color:ADM.MUTED_LIGHT, flexShrink:0}}>
          <BuIcons.chevronRight size={15}/>
        </span>
      </button>
      <SrvChipStato attivo={f.live} onCambia={()=>onLive(!f.live)}/>
    </div>
  );
}

// Chip cliccabile al posto dell'interruttore: dice a parole in che stato sei
// — «Attivo» / «Disattivo» — invece di chiedere di dedurlo da un pallino
// spostato a destra o a sinistra.
function SrvChipStato({ attivo, onCambia }) {
  const c = attivo ? ADM.OK : ADM.MUTED;
  return (
    <button onClick={onCambia} className="adm-pill"
      title={attivo ? 'Clicca per disattivarla' : 'Clicca per attivarla'}
      style={{
        display:'inline-flex', alignItems:'center', gap:7, flexShrink:0,
        padding:'5px 13px', borderRadius:99, cursor:'pointer', fontFamily:'inherit',
        background: attivo ? ADM.OK_SOFT : ADM.NEUTRAL_SOFT,
        color: c, border:`1px solid ${attivo ? `${ADM.OK}33` : ADM.BORDER}`,
        fontSize:12.4, fontWeight:700, whiteSpace:'nowrap',
      }}>
      <span style={{width:7, height:7, borderRadius:'50%', background:c}}/>
      {attivo ? 'Attivo' : 'Disattivo'}
    </button>
  );
}

function SrvFaqEditor({ stato, onChiudi, onSalva, onElimina }) {
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
          {/* Cancellare si fa da qui, non dall'elenco: è l'unico posto in cui
              hai la domanda e la risposta davanti agli occhi mentre decidi di
              buttarle. Sta a sinistra, staccata dalle azioni di conferma. */}
          {!stato.nuova && (
            <React.Fragment>
              <SrvEliminaInline onElimina={()=>onElimina(d.id)}/>
              <div style={{flex:1}}/>
            </React.Fragment>
          )}
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
//
// Si crea UNA cosa sola: la guida. L'argomento non è un oggetto da creare e
// cancellare a parte — è un campo della guida, e l'elenco lo usa per
// raggruppare. Quindi un argomento esiste finché almeno una guida lo usa e
// sparisce da solo quando l'ultima se ne va: non esistono argomenti vuoti da
// riempire, né argomenti pieni che non si possono cancellare.
function SrvGuide({ argomenti, setArgomenti, guide, setGuide }) {
  const [editorGuida, setEditorGuida] = useStateSrv(null);
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

  // Salvare la guida può portare con sé un argomento nuovo: l'editor lo passa
  // per nome in `argomentoNuovo` e l'id nasce qui, dove vive l'elenco.
  const salvaGuida = ({ argomentoNuovo, ...dati }) => {
    let argId = dati.argomentoId;
    const nome = String(argomentoNuovo || '').trim();
    if (nome) {
      const esistente = argomenti.find(a => a.nome.toLowerCase() === nome.toLowerCase());
      if (esistente) argId = esistente.id;
      else {
        argId = 'A-' + String(Date.now()).slice(-5);
        setArgomenti(prev => [...prev, { id:argId, nome, descrizione:'', icona:'list' }]);
      }
    }
    const g = { ...dati, argomentoId: argId };
    setGuide(prev => g.id
      ? prev.map(x => x.id === g.id ? { ...x, ...g, aggiornataIl:new Date() } : x)
      : [...prev, { ...g, id:'G-' + String(Date.now()).slice(-5), letture:0, aggiornataIl:new Date() }]);
    setEditorGuida(null);
  };
  const nuovaGuida = () => setEditorGuida({ nuova:true, dati:{
    argomentoId: conGuide[0] ? conGuide[0].id : '', argomentoNuovo:'',
    titolo:'', descrizione:'', minLettura:5, live:false, video:null } });

  // Un argomento senza nemmeno una guida non è una riga vuota da mostrare:
  // non esiste più.
  const conGuide = argomenti.filter(a => guide.some(g => g.argomentoId === a.id));
  const conRisultati = conGuide.filter(a => visibili.some(g => g.argomentoId === a.id));

  return (
    <div style={{padding:'22px 28px 28px', display:'flex', flexDirection:'column', gap:14}}>
      <SectionLabel first title="Guide"/>

      <SrvBarraStrumenti
        cerca={cerca} onCerca={setCerca} placeholder="Cerca fra le guide…"
        segmenti={[
          { id:'tutte',  label:'Tutte',  badge:guide.length },
          { id:'online', label:'Online', badge:online },
          { id:'bozze',  label:'Bozze',  badge:guide.length - online },
        ]}
        attivo={filtro} onSegmento={setFiltro}
        azione={
          /* L'unica cosa che si crea. L'argomento si scrive dentro la guida. */
          <AdmButton variant="cta" icon="plus" onClick={nuovaGuida}>Aggiungi guida</AdmButton>
        }
      />

      {guide.length === 0 && (
        <AdmCard><AdmEmpty icon="list" title="Nessuna guida"
          desc="Crea la prima: l'argomento lo scegli mentre la scrivi"/></AdmCard>
      )}
      {guide.length > 0 && conRisultati.length === 0 && (
        <AdmCard><AdmEmpty icon="list" title="Nessuna guida" desc="Cambia filtro o cancella la ricerca"/></AdmCard>
      )}

      {conRisultati.map(a => {
        const sue = visibili.filter(g => g.argomentoId === a.id);
        const AIcon = BuIcons[a.icona] || BuIcons.list;
        return (
          <div key={a.id} style={{display:'flex', flexDirection:'column', gap:9}}>
            {/* Rubrica dell'argomento: leggera, allineata alle SectionLabel
                della Dashboard. Non è una card dentro una card, e non ha
                azioni: l'argomento si cambia dalla guida che lo usa. */}
            <div style={{display:'flex', alignItems:'center', gap:11, paddingTop:6}}>
              <span style={{width:26, height:26, borderRadius:8, background:ADM.PINK_BG_SOFT,
                color:ADM.PINK_DARK, display:'grid', placeItems:'center', flexShrink:0}}>
                <AIcon size={14}/>
              </span>
              <span style={{fontSize:13, fontWeight:700, color:ADM.TEXT, textTransform:'uppercase',
                letterSpacing:'0.07em'}}>{a.nome}</span>
              <span style={{fontSize:13, color:ADM.MUTED_SOFT, fontWeight:500, flex:1, minWidth:0,
                whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{a.descrizione}</span>
              <span style={{fontSize:12.4, color:ADM.MUTED_LIGHT, fontWeight:500, flexShrink:0}}>
                {sue.length === 1 ? '1 guida' : `${sue.length} guide`}
              </span>
            </div>

            <AdmCard padding={0} style={{overflow:'hidden'}}>
              {sue.map((g, i) => (
                <SrvRigaGuida key={g.id} g={g} ultima={i === sue.length - 1}
                  aperta={aperta === g.id}
                  onApri={()=>setAperta(aperta === g.id ? null : g.id)}
                  onModifica={()=>setEditorGuida({ nuova:false, dati:{ ...g, argomentoNuovo:'' } })}
                  onLive={(v)=>setGuide(prev => prev.map(x => x.id === g.id ? { ...x, live:v } : x))}
                  onElimina={()=>setGuide(prev => prev.filter(x => x.id !== g.id))}/>
              ))}
            </AdmCard>
          </div>
        );
      })}

      {editorGuida && <SrvGuidaEditor stato={editorGuida} argomenti={conGuide}
        onChiudi={()=>setEditorGuida(null)} onSalva={salvaGuida}/>}
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

// ─── Il video allegato alla guida ───────────────────────────────────────────
//
// Il video finisce nel gestionale, in Supporto → Centro assistenza, e lo
// guardano dei ristoratori spesso in sala col telefono sotto rete mobile.
// Quindi due vincoli, non uno:
//
//   formato  MP4 con video H.264 e audio AAC. È l'unica combinazione che parte
//            su tutti i browser senza transcodifica lato nostro. MOV e WebM
//            non li accettiamo più: il primo su Chrome Android non parte, il
//            secondo su Safari nemmeno.
//   peso     50 MB. Sono ~3-4 minuti di schermo registrato a 1080p con bitrate
//            2 Mbps, che è la durata giusta per un tutorial. Il tetto non
//            serve a risparmiare disco — costa poco — ma banda a ogni
//            visualizzazione e attesa a chi guarda: un catalogo di venti
//            guide da 200 MB si carica una volta e si paga per sempre.
const SRV_VIDEO_MAX_MB = 50;
const SRV_VIDEO_FORMATO = 'MP4 · H.264 + AAC · 1080p · max ' + SRV_VIDEO_MAX_MB + ' MB';

const srvPeso = (byte) => byte >= 1024 * 1024
  ? (byte / 1024 / 1024).toFixed(byte >= 10 * 1024 * 1024 ? 0 : 1) + ' MB'
  : Math.max(1, Math.round(byte / 1024)) + ' KB';

// Legge la durata reale dal file scelto. Non serve un server: il browser
// carica i metadati del video locale e la durata la sa lui. Se il codec non è
// leggibile torna null — e allora il file non ci serve: un video di cui non
// sappiamo la durata non può dichiararla al ristoratore.
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
  // Senza argomenti in elenco — prima guida in assoluto — l'unica strada è
  // scriverne uno: la tendina non avrebbe niente da offrire.
  const [nuovoArg, setNuovoArg] = useStateSrv(argomenti.length === 0);
  const [erroreVideo, setErroreVideo] = useStateSrv(null);
  const [leggendo, setLeggendo] = useStateSrv(false);
  const agg = (k, v) => setD(x => ({ ...x, [k]: v }));
  const aggVideo = (k, v) => setD(x => ({ ...x, video: { ...(x.video || {}), [k]: v } }));

  const argOk = nuovoArg ? d.argomentoNuovo.trim().length > 2 : !!d.argomentoId;
  const valida = d.titolo.trim().length > 4 && d.descrizione.trim().length > 10
    && d.minLettura > 0 && argOk
    && (!d.video || d.video.durataSec > 0);

  // Il file va controllato prima di prenderlo: formato, peso e — solo se
  // quelli passano — durata. Un errore qui non lascia mezzo video attaccato
  // alla guida, il video di prima resta dov'è.
  const scegliVideo = async (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = '';               // così riscegliere lo stesso file rifà il controllo
    if (!file) return;
    setErroreVideo(null);
    const estensione = (file.name.split('.').pop() || '').toLowerCase();
    if (file.type !== 'video/mp4' && estensione !== 'mp4') {
      setErroreVideo(`Serve un MP4: questo è un .${estensione || 'file sconosciuto'}. Riesportalo in MP4 (H.264 + AAC), è l'unico formato che parte su tutti i browser.`);
      return;
    }
    if (file.size > SRV_VIDEO_MAX_MB * 1024 * 1024) {
      setErroreVideo(`Pesa ${srvPeso(file.size)}, il tetto è ${SRV_VIDEO_MAX_MB} MB. Riesporta a 1080p con bitrate 2 Mbps, oppure taglialo in due guide più corte.`);
      return;
    }
    setLeggendo(true);
    const durata = await srvDurataDaFile(file);
    setLeggendo(false);
    if (!durata) {
      setErroreVideo('Non riusciamo a leggere la durata di questo file: il browser non lo sa aprire, e senza durata la guida non può dichiararla. Riesportalo in MP4 (H.264 + AAC).');
      return;
    }
    setD(x => ({ ...x, video: {
      titolo: (x.video && x.video.titolo) || file.name.replace(/\.[^.]+$/, ''),
      durataSec: durata,
      descrizioneSotto: (x.video && x.video.descrizioneSotto) || '',
      views: (x.video && x.video.views) || 0,
      tempoMedioSec: (x.video && x.video.tempoMedioSec) || 0,
      utile: (x.video && x.video.utile) || 0,
      nonUtile: (x.video && x.video.nonUtile) || 0,
      file: file.name, pesoByte: file.size,
    }}));
  };

  return (
    <SrvModale
      titolo={stato.nuova ? 'Nuova guida' : 'Modifica la guida'}
      larghezza={780}
      nota="Il tempo di lettura lo dichiari tu, la durata del video la leggiamo dal file: sulla scheda compaiono affiancati e il ristoratore sceglie in base a quanto tempo ha."
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
            {/* L'argomento è un campo di QUESTA guida: o uno di quelli in uso,
                o uno nuovo scritto qui. Non c'è un posto separato dove si
                creano — nasce con la prima guida che lo nomina. */}
            <SrvCampo etichetta="Argomento"
              aiuto={nuovoArg ? 'Raggruppa le guide nel Centro assistenza del gestionale.' : null}>
              {nuovoArg ? (
                <div style={{display:'flex', gap:8}}>
                  <input value={d.argomentoNuovo} onChange={e=>agg('argomentoNuovo', e.target.value)}
                    style={{...SRV_INP, flex:1}} placeholder="Incassi e contabilità" autoFocus/>
                  {argomenti.length > 0 && (
                    <button onClick={()=>{ setNuovoArg(false); agg('argomentoNuovo', ''); }} className="adm-btn"
                      style={{padding:'0 12px', borderRadius:9, border:`1px solid ${ADM.BORDER}`, background:'#fff',
                        color:ADM.MUTED, fontSize:12.6, fontWeight:600, fontFamily:'inherit', cursor:'pointer',
                        whiteSpace:'nowrap'}}>Annulla</button>
                  )}
                </div>
              ) : (
                <select value={d.argomentoId}
                  onChange={e=>{
                    if (e.target.value === '__nuovo') { setNuovoArg(true); return; }
                    agg('argomentoId', e.target.value);
                  }} style={SRV_SEL}>
                  {argomenti.map(a => <option key={a.id} value={a.id}>{a.nome}</option>)}
                  <option value="__nuovo">＋ Nuovo argomento…</option>
                </select>
              )}
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
            <div style={{display:'flex', flexDirection:'column', gap:9}}>
              <label style={{display:'flex', alignItems:'center', gap:13, padding:'16px 18px', borderRadius:12,
                border:`1.5px dashed ${erroreVideo ? ADM.DANGER : ADM.BORDER}`,
                background:ADM.PANEL_SOFT, cursor: leggendo ? 'progress' : 'pointer'}}>
                <span style={{width:38, height:38, borderRadius:10, background:'#fff', border:`1px solid ${ADM.BORDER}`,
                  display:'grid', placeItems:'center', color:ADM.MUTED, flexShrink:0}}>
                  <BuIcons.download size={18}/>
                </span>
                <span style={{flex:1, minWidth:0}}>
                  <span style={{display:'block', fontSize:13.8, fontWeight:600, color:ADM.TEXT}}>
                    {leggendo ? 'Stiamo leggendo il file…' : 'Carica un video'}
                  </span>
                  {/* Il formato non è un consiglio: è quello che parte sul
                      telefono del ristoratore quando apre il Centro
                      assistenza del gestionale. Scritto qui, prima della
                      scelta, non dentro un errore dopo. */}
                  <span style={{display:'block', fontSize:12.2, color:ADM.MUTED, marginTop:2}}>
                    {SRV_VIDEO_FORMATO} — la durata la leggiamo dal file, non c'è da scriverla.
                  </span>
                </span>
                <input type="file" accept="video/mp4" onChange={scegliVideo} style={{display:'none'}}/>
              </label>
              {erroreVideo
                ? <div style={{fontSize:12.6, color:ADM.DANGER, lineHeight:1.5, fontWeight:500}}>{erroreVideo}</div>
                : <div style={{fontSize:12.2, color:ADM.MUTED_LIGHT, lineHeight:1.5}}>
                    Il tetto di {SRV_VIDEO_MAX_MB} MB sono ~3-4 minuti di schermo registrato a 1080p: pesa su chi
                    guarda da rete mobile, non sul nostro disco. Una guida più lunga di così conviene spezzarla in due.
                  </div>}
            </div>
          ) : (
            <div style={{display:'flex', flexDirection:'column', gap:16}}>
              <div style={{display:'flex', alignItems:'center', gap:13, padding:'12px 14px', borderRadius:11,
                background:ADM.PANEL_SOFT, border:`1px solid ${ADM.BORDER_SOFT}`}}>
                <SrvMiniatura video={d.video} w={92}/>
                <span style={{flex:1, minWidth:0}}>
                  <span style={{display:'block', fontSize:13.4, fontWeight:600, color:ADM.TEXT,
                    whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>
                    {d.video.file || d.video.titolo || 'Video caricato'}
                  </span>
                  {/* Durata e peso: due numeri che non si scrivono a mano, si
                      leggono dal file. Stanno qui perché sono il resoconto di
                      cosa è stato caricato. */}
                  <span style={{display:'block', fontSize:12.2, color:ADM.MUTED, marginTop:2}}>
                    {d.video.pesoByte
                      ? `${srvDurata(d.video.durataSec)} di video · ${srvPeso(d.video.pesoByte)} · letti dal file`
                      : `${srvDurata(d.video.durataSec)} di video · letta dal file`}
                  </span>
                </span>
                <button onClick={()=>{ agg('video', null); setErroreVideo(null); }} className="adm-btn" style={{
                  padding:'5px 11px', borderRadius:8, border:`1px solid ${ADM.BORDER}`, background:'#fff',
                  color:ADM.DANGER, fontSize:12.3, fontWeight:600, fontFamily:'inherit', cursor:'pointer'}}>
                  Rimuovi
                </button>
              </div>

              <div style={{display:'grid', gridTemplateColumns:'repeat(2, minmax(0,1fr))', gap:16}}>
                <SrvCampo etichetta="Titolo del video" span>
                  <input value={d.video.titolo || ''} onChange={e=>aggVideo('titolo', e.target.value)} style={SRV_INP}/>
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

      {/* ── Chiamate ── */}
      <SectionLabel first title="Chiamate" desc="La coda e la puntualità con cui la smaltiamo"/>
      <div style={{display:'grid', gridTemplateColumns:'repeat(4, minmax(0,1fr))', gap:14}}>
        <DashStatCard label="Chiamate in tempo" accent="OK"
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
          sub={`Su ${k.richiamate.totali} chiamate prenotate · contate a parte, non fra le riuscite`}/>
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
      {/* Il conteggio è più largo della sezione Ticket: là ci sono le richieste
          scritte, qui tutte quelle che aprono una pratica, da qualunque canale
          arrivino. Detto esplicitamente, altrimenti i due numeri sembrano lo
          stesso dato sbagliato. */}
      <SectionLabel title="Richieste di assistenza"
        desc="Da tutti i canali — ticket scritti, chat, chiamate, gestionale · la finestra «oggi» è bassa per costruzione"/>
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

      {/* ── Pressione per locale ── */}
      <SectionLabel title="Per locale"
        desc="Quanto pesa l'assistenza sul singolo cliente · le medie sono su chi ha davvero aperto qualcosa"/>
      <div style={{display:'grid', gridTemplateColumns:'repeat(3, minmax(0,1fr))', gap:14}}>
        <DashStatCard label="Chiamate per locale" accent="INFO"
          value={k.perLocale.chiamateMedie.toFixed(1).replace('.', ',')}
          sub={`${k.perLocale.localiCheChiamano} su ${k.perLocale.localiAmmessi} locali Plus e Business hanno prenotato almeno una chiamata`}
          ratio={{ a:k.perLocale.localiCheChiamano, b:k.perLocale.localiAmmessi - k.perLocale.localiCheChiamano,
            aLabel:'hanno chiamato', bLabel:'mai', aColor:ADM.INFO }}/>
        <DashStatCard label="Ticket aperti per locale" accent="WARN"
          value={k.perLocale.apertiMedi.toFixed(1).replace('.', ',')}
          sub={`${k.ticket.apertiOra} ticket aperti su ${k.perLocale.localiConAperti} locali · il più carico ne ha ${k.perLocale.maxAperti}`}
          ratio={{ a:k.perLocale.localiConAperti, b:k.perLocale.localiTotali - k.perLocale.localiConAperti,
            aLabel:'con ticket aperti', bLabel:'puliti', aColor:ADM.WARN }}/>

        {/* Il terzo riquadro non è una media: è il nome. Una media alta non
            dice su chi intervenire, la classifica sì — e un locale che chiama
            tre volte in una settimana è un problema di prodotto, non di coda. */}
        <AdmCard padding={0} style={{display:'flex', flexDirection:'column', overflow:'hidden'}}>
          <div style={{padding:'15px 16px 10px'}}>
            <span style={{fontSize:11.5, color:ADM.MUTED, fontWeight:700, textTransform:'uppercase',
              letterSpacing:'0.04em'}}>Chi chiama di più</span>
          </div>
          <div style={{flex:1}}>
            {k.perLocale.topChiamate.length === 0
              ? <div style={{padding:'0 16px 16px', fontSize:12.8, color:ADM.MUTED_SOFT}}>Nessuna chiamata.</div>
              : k.perLocale.topChiamate.map((t, i) => (
                <div key={t.localeId} style={{display:'flex', alignItems:'center', gap:10, padding:'7px 16px',
                  borderTop: i === 0 ? 'none' : `1px solid ${ADM.BORDER_SOFT}`}}>
                  <span style={{fontSize:11.5, fontWeight:700, color:ADM.MUTED_LIGHT, width:12}}>{i + 1}</span>
                  <span style={{flex:1, minWidth:0, fontSize:13.2, fontWeight:600, color:ADM.TEXT,
                    whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{t.nome}</span>
                  <span style={{fontSize:13, fontWeight:700, color: t.n >= 3 ? ADM.DANGER : ADM.TEXT,
                    fontVariantNumeric:'tabular-nums'}}>{t.n}</span>
                </div>
              ))}
          </div>
          <div style={{padding:'9px 16px 12px', fontSize:11.8, color:ADM.MUTED_LIGHT}}>
            Chiamate prenotate negli ultimi 7 giorni
          </div>
        </AdmCard>
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
