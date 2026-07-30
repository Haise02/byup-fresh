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

// Intestazione di blocco dentro una pagina lunga.
function SrvTitoloSezione({ titolo, nota, azione }) {
  return (
    <div style={{display:'flex', alignItems:'flex-end', gap:14, marginBottom:2}}>
      <div style={{flex:1, minWidth:0}}>
        <div style={{fontSize:16.5, fontWeight:700, color:ADM.TEXT, letterSpacing:'-0.015em'}}>{titolo}</div>
        {nota && <div style={{fontSize:13, color:ADM.MUTED, marginTop:3, lineHeight:1.45}}>{nota}</div>}
      </div>
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

// Cinque stelle con l'ultima parziale: la media è 4,3 e va vista come 4,3,
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

// Pastiglia di stato pubblicazione. Online / Bozza è una distinzione che vale
// sia per le FAQ sia per le guide, ed è la sola informazione che deve saltare
// all'occhio scorrendo un elenco lungo.
function SrvStatoPub({ live }) {
  return (
    <span style={{display:'inline-flex', alignItems:'center', gap:6, padding:'3px 10px', borderRadius:99,
      background: live ? ADM.OK_SOFT : ADM.NEUTRAL_SOFT, color: live ? ADM.OK : ADM.MUTED,
      fontSize:11.8, fontWeight:700, whiteSpace:'nowrap'}}>
      <span style={{width:6, height:6, borderRadius:'50%', background:'currentColor'}}/>
      {live ? 'Online' : 'Bozza'}
    </span>
  );
}

// Conferma di cancellazione in linea. Un modale per «vuoi davvero?» è troppo
// per una FAQ, ma un click secco su un cestino è troppo poco: due click
// consapevoli sulla riga stessa sono la misura giusta.
function SrvEliminaInline({ onElimina, etichetta = 'Eliminare?' }) {
  const [chiesto, setChiesto] = useStateSrv(false);
  if (!chiesto) {
    return <AdmIconBtn icon="trash" label="Elimina" onClick={()=>setChiesto(true)} color={ADM.MUTED_SOFT} size={28}/>;
  }
  return (
    <span style={{display:'inline-flex', alignItems:'center', gap:7, fontSize:12.5, color:ADM.DANGER, fontWeight:600}}>
      {etichetta}
      <button onClick={onElimina} className="adm-btn" style={{padding:'3px 10px', borderRadius:7, border:'none',
        background:ADM.DANGER, color:'#fff', fontSize:12, fontWeight:700, fontFamily:'inherit', cursor:'pointer'}}>Sì</button>
      <button onClick={()=>setChiesto(false)} className="adm-btn" style={{padding:'3px 10px', borderRadius:7,
        border:`1px solid ${ADM.BORDER}`, background:'#fff', color:ADM.TEXT, fontSize:12, fontWeight:600,
        fontFamily:'inherit', cursor:'pointer'}}>No</button>
    </span>
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
  const bozzeFaq = faq.filter(f => !f.live).length;
  const bozzeGuide = guide.filter(g => !g.live).length;

  const tabs = [
    { id:'richiamate', label:'Richiamate', badge: inAttesa },
    { id:'faq',        label:'FAQ' },
    { id:'guide',      label:'Guide' },
    { id:'kpi',        label:'Andamento' },
  ];

  return (
    <div style={{display:'flex', flexDirection:'column'}}>
      <div style={{padding:'0 28px', background:'#fff', borderBottom:`1px solid ${ADM.BORDER}`,
        display:'flex', alignItems:'center', gap:12}}>
        <AdmTabBar tabs={tabs} active={tab} onChange={setTab}/>
        <div style={{flex:1}}/>
        {(bozzeFaq > 0 || bozzeGuide > 0) && (
          <span style={{fontSize:12.5, color:ADM.MUTED, whiteSpace:'nowrap'}}>
            {bozzeFaq > 0 && <React.Fragment><b style={{color:ADM.TEXT}}>{bozzeFaq}</b> FAQ in bozza</React.Fragment>}
            {bozzeFaq > 0 && bozzeGuide > 0 && ' · '}
            {bozzeGuide > 0 && <React.Fragment><b style={{color:ADM.TEXT}}>{bozzeGuide}</b> {bozzeGuide === 1 ? 'guida' : 'guide'} in bozza</React.Fragment>}
          </span>
        )}
      </div>
      {tab === 'richiamate' && <SrvRichiamate richiamate={richiamate} setRichiamate={setRichiamate}/>}
      {tab === 'faq'        && <SrvFaq faq={faq} setFaq={setFaq}/>}
      {tab === 'guide'      && <SrvGuide argomenti={argomenti} setArgomenti={setArgomenti} guide={guide} setGuide={setGuide}/>}
      {tab === 'kpi'        && <AdmServizioClientiKPI richiamate={richiamate} guide={guide}/>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 1. Richiamate
// ═══════════════════════════════════════════════════════════════════════════
function SrvRichiamate({ richiamate, setRichiamate }) {
  const [vista, setVista] = useStateSrv('attesa');
  const [cerca, setCerca] = useStateSrv('');
  const [copiato, setCopiato] = useStateSrv(null);

  const nAttesa = richiamate.filter(r => r.stato === 'attesa').length;
  const nFatte  = richiamate.filter(r => r.stato === 'fatta').length;
  const nPerse  = richiamate.filter(r => r.stato === 'persa').length;
  const scadute = richiamate.filter(r => r.stato === 'attesa' && srvMinutiAScadere(r) < 0);

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

  const segna = (id, esito) => setRichiamate(prev => prev.map(r => {
    if (r.id !== id) return r;
    if (esito === 'persa') return { ...r, stato:'persa', tentativi:(r.tentativi || 0) + 1, operatore: SRV_IO };
    const adesso = new Date();
    return { ...r, stato:'fatta', richiamataIl: adesso, operatore: SRV_IO,
      inTempo: adesso <= r.entro, durataMin: null };
  }));

  const copia = (r) => {
    if (navigator.clipboard) navigator.clipboard.writeText(r.tel).catch(()=>{});
    setCopiato(r.id);
    setTimeout(() => setCopiato(c => c === r.id ? null : c), 1600);
  };

  return (
    <div style={{padding:'24px 28px', display:'flex', flexDirection:'column', gap:18}}>
      {scadute.length > 0 && (
        <AttentionStrip items={[{
          tone:'DANGER',
          label: `${scadute.length} ${scadute.length === 1 ? 'richiamata scaduta' : 'richiamate scadute'} · la più vecchia da ${srvMinuti(-srvMinutiAScadere(scadute.reduce((o, r) => !o || r.entro < o.entro ? r : o, null)))}`,
          onClick: ()=>setVista('attesa'),
        }]}/>
      )}

      <div style={{display:'flex', alignItems:'center', gap:10, flexWrap:'wrap'}}>
        {viste.map(v => {
          const attivo = vista === v.id;
          return (
            <button key={v.id} className="adm-pill" onClick={()=>setVista(v.id)} style={{
              display:'inline-flex', alignItems:'center', gap:7, padding:'7px 13px', borderRadius:99,
              background: attivo ? ADM.TEXT : '#fff', color: attivo ? '#fff' : ADM.TEXT,
              border:`1px solid ${attivo ? ADM.TEXT : ADM.BORDER}`,
              fontSize:13.5, fontWeight:600, fontFamily:'inherit', cursor:'pointer',
            }}>
              {v.label}
              <span style={{fontWeight:700, fontSize:12.5, color: attivo ? 'rgba(255,255,255,0.75)' : ADM.MUTED_SOFT}}>{v.count}</span>
            </button>
          );
        })}
        <div style={{flex:1}}/>
        <div style={{position:'relative', width:280}}>
          <span style={{position:'absolute', left:11, top:'50%', transform:'translateY(-50%)', color:ADM.MUTED_SOFT, pointerEvents:'none'}}>
            <BuIcons.search size={16}/>
          </span>
          <input value={cerca} onChange={e=>setCerca(e.target.value)} placeholder="Numero, locale, problema…"
            style={{...SRV_INP, paddingLeft:33, borderRadius:99}}/>
        </div>
      </div>

      {elenco.length === 0
        ? <AdmEmpty icon="phone" title="Nessuna richiamata" desc={cerca ? 'Nessun risultato per questa ricerca' : 'La coda è vuota'}/>
        : (
          <div style={{display:'flex', flexDirection:'column', gap:10}}>
            {elenco.map(r => (
              <SrvRigaRichiamata key={r.id} r={r} copiato={copiato === r.id}
                onCopia={()=>copia(r)} onEsito={(e)=>segna(r.id, e)}/>
            ))}
          </div>
        )}
    </div>
  );
}

function SrvRigaRichiamata({ r, copiato, onCopia, onEsito }) {
  const cat = SRV_CATEGORIE[r.categoria];
  const catCol = ADM[cat.color];
  const mancano = srvMinutiAScadere(r);
  const scaduta = r.stato === 'attesa' && mancano < 0;
  // Sotto i 15 minuti la pastiglia diventa ambra anche se il tempo c'è ancora:
  // è la soglia oltre la quale mettersi al telefono non è più rimandabile.
  const urgente = r.stato === 'attesa' && mancano >= 0 && mancano <= 15;
  const bordo = scaduta ? ADM.DANGER : urgente ? ADM.WARN : ADM.BORDER;

  return (
    <AdmCard padding={0} style={{overflow:'hidden', borderColor:bordo,
      boxShadow: scaduta ? `0 0 0 3px ${ADM.DANGER}14` : ADM.CARD_SHADOW}}>
      <div style={{display:'flex', alignItems:'stretch'}}>
        <div style={{width:4, background:catCol, flexShrink:0}}/>
        <div style={{flex:1, minWidth:0, padding:'14px 18px', display:'flex', flexDirection:'column', gap:10}}>

          {/* Riga 1 — chi, che categoria, che piano */}
          <div style={{display:'flex', alignItems:'center', gap:10, flexWrap:'wrap'}}>
            <span style={{display:'inline-flex', alignItems:'center', gap:6, padding:'3px 9px', borderRadius:7,
              background:`${catCol}14`, color:catCol, fontSize:11.5, fontWeight:700, whiteSpace:'nowrap'}}>
              {cat.label}
            </span>
            <span style={{fontSize:15, fontWeight:700, color:ADM.TEXT, letterSpacing:'-0.01em'}}>{r.localeNome}</span>
            <span style={{fontSize:13.3, color:ADM.MUTED}}>{r.titolare}</span>
            <AdmPlanBadge piano={r.piano}/>
            <div style={{flex:1}}/>
            <span style={{fontSize:11.8, color:ADM.MUTED_LIGHT, fontWeight:600}}>{r.id}</span>
          </div>

          {/* Riga 2 — il numero da comporre. È il dato per cui l'operatore apre
              questa schermata: sta in cifre grandi, cliccabile e copiabile. */}
          <div style={{display:'flex', alignItems:'center', gap:12, flexWrap:'wrap'}}>
            <a href={`tel:${r.tel.replace(/\s/g, '')}`} className="adm-pill" style={{
              display:'inline-flex', alignItems:'center', gap:9, padding:'7px 14px', borderRadius:10,
              background:ADM.PANEL_SOFT, border:`1px solid ${ADM.BORDER}`, textDecoration:'none',
              color:ADM.TEXT, fontSize:17, fontWeight:700, letterSpacing:'0.01em',
              fontVariantNumeric:'tabular-nums',
            }}>
              <BuIcons.phone size={17} color={ADM.MUTED}/>{r.tel}
            </a>
            <button onClick={onCopia} className="adm-btn" style={{
              display:'inline-flex', alignItems:'center', gap:6, padding:'6px 11px', borderRadius:8,
              background:'#fff', border:`1px solid ${ADM.BORDER}`, cursor:'pointer', fontFamily:'inherit',
              fontSize:12.5, fontWeight:600, color: copiato ? ADM.OK : ADM.MUTED,
            }}>
              {copiato ? <BuIcons.check size={14}/> : <BuIcons.copy size={14}/>}
              {copiato ? 'Copiato' : 'Copia'}
            </button>
            <span style={{fontSize:12.8, color:ADM.MUTED}}>
              prenotata alle <b style={{color:ADM.TEXT, fontVariantNumeric:'tabular-nums'}}>
                {r.prenotataIl.toLocaleTimeString('it-IT', {hour:'2-digit', minute:'2-digit'})}</b>
              {' · '}{fmtRelative(r.prenotataIl)}
            </span>
          </div>

          {/* Riga 3 — il problema dichiarato */}
          {r.problema && (
            <div style={{fontSize:13.6, color:ADM.TEXT, lineHeight:1.5, paddingLeft:12,
              borderLeft:`2px solid ${ADM.BORDER}`}}>{r.problema}</div>
          )}

          {/* Riga 4 — scadenza ed esito */}
          <div style={{display:'flex', alignItems:'center', gap:10, flexWrap:'wrap', paddingTop:2}}>
            {r.stato === 'attesa' && (
              <React.Fragment>
                <span style={{display:'inline-flex', alignItems:'center', gap:7, padding:'6px 12px', borderRadius:99,
                  background: scaduta ? ADM.DANGER : urgente ? ADM.WARN : ADM.NEUTRAL_SOFT,
                  color: (scaduta || urgente) ? '#fff' : ADM.TEXT,
                  fontSize:13, fontWeight:700, whiteSpace:'nowrap'}}>
                  <BuIcons.clock size={14}/>
                  {scaduta ? `Scaduta da ${srvMinuti(-mancano)}` : `Da richiamare entro ${srvMinuti(mancano)}`}
                </span>
                <span style={{fontSize:12.2, color:ADM.MUTED_SOFT}}>
                  SLA {cat.label.toLowerCase()} · {srvMinuti(cat.slaMin)}
                </span>
                <div style={{flex:1}}/>
                <AdmButton variant="secondary" size="sm" icon="x" onClick={()=>onEsito('persa')}>Non risponde</AdmButton>
                <AdmButton variant="success" size="sm" icon="check" onClick={()=>onEsito('fatta')}>Richiamato</AdmButton>
              </React.Fragment>
            )}

            {r.stato === 'fatta' && (
              <React.Fragment>
                <span style={{display:'inline-flex', alignItems:'center', gap:7, padding:'5px 11px', borderRadius:99,
                  background: r.inTempo ? ADM.OK_SOFT : ADM.WARN_SOFT, color: r.inTempo ? ADM.OK : ADM.WARN,
                  fontSize:12.6, fontWeight:700, whiteSpace:'nowrap'}}>
                  {r.inTempo ? <BuIcons.check size={13}/> : <BuIcons.clock size={13}/>}
                  {r.inTempo ? 'Richiamato in tempo' : 'Richiamato in ritardo'}
                  {' · '}{srvMinuti(Math.round((r.richiamataIl - r.prenotataIl) / 60000))}
                </span>
                <span style={{fontSize:12.6, color:ADM.MUTED}}>
                  {(TEAM.find(t => t.id === r.operatore) || {}).nome || '—'}
                  {r.durataMin ? ` · chiamata di ${r.durataMin} min` : ''}
                </span>
                <div style={{flex:1}}/>
                {r.voto != null
                  ? <span style={{display:'inline-flex', alignItems:'center', gap:7}}>
                      <SrvStelle valore={r.voto}/>
                      <span style={{fontSize:12.6, color:ADM.MUTED, fontWeight:600}}>{r.voto}/5</span>
                    </span>
                  : <span style={{fontSize:12.4, color:ADM.MUTED_LIGHT}}>Sondaggio non compilato</span>}
              </React.Fragment>
            )}

            {r.stato === 'persa' && (
              <React.Fragment>
                <span style={{display:'inline-flex', alignItems:'center', gap:7, padding:'5px 11px', borderRadius:99,
                  background:ADM.NEUTRAL_SOFT, color:ADM.MUTED, fontSize:12.6, fontWeight:700}}>
                  <BuIcons.x size={13}/> Non risponde · {r.tentativi} {r.tentativi === 1 ? 'tentativo' : 'tentativi'}
                </span>
                <div style={{flex:1}}/>
                <AdmButton variant="secondary" size="sm" icon="phone" onClick={()=>onEsito('fatta')}>Riprova ora</AdmButton>
              </React.Fragment>
            )}
          </div>

          {r.recensione && (
            <div style={{marginTop:2, padding:'10px 13px', borderRadius:10, background:ADM.PANEL_SOFT,
              border:`1px solid ${ADM.BORDER_SOFT}`, fontSize:13.2, color:ADM.TEXT, lineHeight:1.5, fontStyle:'italic'}}>
              «{r.recensione}»
            </div>
          )}
        </div>
      </div>
    </AdmCard>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 2. FAQ
// ═══════════════════════════════════════════════════════════════════════════
function SrvFaq({ faq, setFaq }) {
  const [filtro, setFiltro] = useStateSrv('tutte');
  const [aperta, setAperta] = useStateSrv(null);
  const [editor, setEditor] = useStateSrv(null); // { nuova:bool, dati }

  const online = faq.filter(f => f.live).length;
  const elenco = filtro === 'tutte' ? faq
    : filtro === 'bozze' ? faq.filter(f => !f.live)
    : faq.filter(f => f.categoria === filtro);

  const salva = (dati) => {
    setFaq(prev => dati.id
      ? prev.map(f => f.id === dati.id ? { ...f, ...dati, aggiornataIl:new Date() } : f)
      : [{ ...dati, id:'F-' + String(Date.now()).slice(-5), viste:0, utile:0, nonUtile:0,
           aggiornataIl:new Date() }, ...prev]);
    setEditor(null);
  };

  return (
    <div style={{padding:'24px 28px', display:'flex', flexDirection:'column', gap:16}}>
      <SrvTitoloSezione
        titolo="Domande frequenti"
        nota={`${faq.length} risposte · ${online} online nel gestionale, ${faq.length - online} in bozza. Mettere una risposta in bozza la toglie dal gestionale senza cancellarla: si corregge e si ripubblica.`}
        azione={<AdmButton variant="cta" icon="plus" onClick={()=>setEditor({ nuova:true, dati:{
          categoria: FAQ_CATEGORIE[0], domanda:'', risposta:'', live:false } })}>Nuova FAQ</AdmButton>}
      />

      <div style={{display:'flex', gap:6, flexWrap:'wrap'}}>
        {[{ id:'tutte', label:'Tutte', n:faq.length },
          { id:'bozze', label:'In bozza', n:faq.length - online },
          ...FAQ_CATEGORIE.map(c => ({ id:c, label:c, n:faq.filter(f => f.categoria === c).length }))
        ].filter(p => p.n > 0 || p.id === 'tutte').map(p => {
          const attivo = filtro === p.id;
          return (
            <button key={p.id} className="adm-pill" onClick={()=>setFiltro(p.id)} style={{
              display:'inline-flex', alignItems:'center', gap:6, padding:'6px 12px', borderRadius:99,
              background: attivo ? ADM.TEXT : '#fff', color: attivo ? '#fff' : ADM.TEXT,
              border:`1px solid ${attivo ? ADM.TEXT : ADM.BORDER}`,
              fontSize:13, fontWeight:600, fontFamily:'inherit', cursor:'pointer',
            }}>
              {p.label}
              <span style={{fontWeight:700, fontSize:12, color: attivo ? 'rgba(255,255,255,0.75)' : ADM.MUTED_SOFT}}>{p.n}</span>
            </button>
          );
        })}
      </div>

      {elenco.length === 0
        ? <AdmEmpty icon="help" title="Nessuna FAQ in questo filtro" desc="Cambia filtro o creane una nuova"/>
        : (
          <div style={{display:'flex', flexDirection:'column', gap:8}}>
            {elenco.map(f => {
              const apertaOra = aperta === f.id;
              const votiTot = f.utile + f.nonUtile;
              return (
                <AdmCard key={f.id} padding={0} style={{overflow:'hidden', opacity: f.live ? 1 : 0.82}}>
                  <div style={{display:'flex', alignItems:'flex-start', gap:12, padding:'14px 18px'}}>
                    <button onClick={()=>setAperta(apertaOra ? null : f.id)} style={{
                      flex:1, minWidth:0, display:'flex', alignItems:'flex-start', gap:11, textAlign:'left',
                      background:'none', border:'none', padding:0, cursor:'pointer', fontFamily:'inherit',
                    }}>
                      <span style={{marginTop:2, color:ADM.MUTED_SOFT, transform: apertaOra ? 'rotate(90deg)' : 'none',
                        transition:'transform 0.16s ease', display:'inline-flex'}}>
                        <BuIcons.chevronRight size={15}/>
                      </span>
                      <span style={{flex:1, minWidth:0}}>
                        <span style={{display:'block', fontSize:14.6, fontWeight:600, color:ADM.TEXT, lineHeight:1.4}}>{f.domanda}</span>
                        <span style={{display:'block', fontSize:12.2, color:ADM.MUTED_SOFT, marginTop:4}}>
                          {f.categoria} · aggiornata {fmtRelative(f.aggiornataIl)}
                          {f.viste > 0 && ` · ${fmtNum(f.viste)} viste`}
                          {votiTot > 0 && ` · ${Math.round(f.utile / votiTot * 100)}% utile su ${votiTot} voti`}
                        </span>
                      </span>
                    </button>
                    <div style={{display:'flex', alignItems:'center', gap:10, flexShrink:0}}>
                      <SrvStatoPub live={f.live}/>
                      <AdmSwitch size="sm" checked={f.live}
                        onChange={(v)=>setFaq(prev => prev.map(x => x.id === f.id ? { ...x, live:v } : x))}/>
                      <AdmIconBtn icon="pencil" label="Modifica" size={28}
                        onClick={()=>setEditor({ nuova:false, dati:{ ...f } })}/>
                      <SrvEliminaInline onElimina={()=>setFaq(prev => prev.filter(x => x.id !== f.id))}/>
                    </div>
                  </div>
                  {apertaOra && (
                    <div style={{padding:'0 18px 16px 44px', borderTop:`1px solid ${ADM.BORDER_SOFT}`, paddingTop:14}}>
                      <div style={{fontSize:13.8, color:ADM.TEXT, lineHeight:1.62, whiteSpace:'pre-line'}}>{f.risposta}</div>
                    </div>
                  )}
                </AdmCard>
              );
            })}
          </div>
        )}

      {editor && <SrvFaqEditor stato={editor} onChiudi={()=>setEditor(null)} onSalva={salva}/>}
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
        <div style={{display:'flex', alignItems:'center', gap:12, padding:'12px 14px', borderRadius:10,
          background:ADM.PANEL_SOFT, border:`1px solid ${ADM.BORDER_SOFT}`}}>
          <AdmSwitch checked={d.live} onChange={(v)=>agg('live', v)}/>
          <div style={{flex:1, minWidth:0}}>
            <div style={{fontSize:13.6, fontWeight:600, color:ADM.TEXT}}>Pubblica nel gestionale</div>
            <div style={{fontSize:12.2, color:ADM.MUTED, marginTop:2}}>
              {d.live ? 'I ristoratori la vedranno appena salvi.' : 'Resta visibile solo qui in console.'}
            </div>
          </div>
        </div>
      </div>
    </SrvModale>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 3. Guide
// ═══════════════════════════════════════════════════════════════════════════
function SrvGuide({ argomenti, setArgomenti, guide, setGuide }) {
  const [editorGuida, setEditorGuida] = useStateSrv(null);
  const [editorArg, setEditorArg] = useStateSrv(null);

  const online = guide.filter(g => g.live).length;

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

  return (
    <div style={{padding:'24px 28px', display:'flex', flexDirection:'column', gap:22}}>
      <SrvTitoloSezione
        titolo="Guide"
        nota={`${argomenti.length} argomenti · ${guide.length} guide, ${online} online. L'argomento raccoglie le guide di uno stesso tema; la guida è l'articolo che il ristoratore apre.`}
        azione={
          <div style={{display:'flex', gap:9}}>
            <AdmButton variant="secondary" icon="plus" onClick={()=>setEditorArg({ nuovo:true, dati:{
              nome:'', descrizione:'', icona:'list' } })}>Nuovo argomento</AdmButton>
            <AdmButton variant="cta" icon="plus" onClick={()=>setEditorGuida({ nuova:true, dati:{
              argomentoId: argomenti[0]?.id, titolo:'', descrizione:'', minLettura:5, live:false, video:null } })}
              disabled={argomenti.length === 0}>Nuova guida</AdmButton>
          </div>
        }
      />

      {argomenti.length === 0 && (
        <AdmEmpty icon="list" title="Nessun argomento" desc="Le guide vivono dentro un argomento: creane uno per iniziare"/>
      )}

      {argomenti.map(a => {
        const sue = guide.filter(g => g.argomentoId === a.id);
        const AIcon = BuIcons[a.icona] || BuIcons.list;
        return (
          <div key={a.id} style={{display:'flex', flexDirection:'column', gap:12}}>
            <div style={{display:'flex', alignItems:'center', gap:13, paddingBottom:11,
              borderBottom:`1px solid ${ADM.BORDER}`}}>
              <span style={{width:36, height:36, borderRadius:10, background:ADM.PINK_BG_SOFT, color:ADM.PINK_DARK,
                display:'grid', placeItems:'center', flexShrink:0}}><AIcon size={19}/></span>
              <div style={{flex:1, minWidth:0}}>
                <div style={{fontSize:15.5, fontWeight:700, color:ADM.TEXT, letterSpacing:'-0.01em'}}>{a.nome}</div>
                <div style={{fontSize:12.8, color:ADM.MUTED, marginTop:2}}>
                  {a.descrizione}{a.descrizione ? ' · ' : ''}{sue.length} {sue.length === 1 ? 'guida' : 'guide'}
                </div>
              </div>
              <AdmButton variant="ghost" size="sm" icon="plus" onClick={()=>setEditorGuida({ nuova:true, dati:{
                argomentoId:a.id, titolo:'', descrizione:'', minLettura:5, live:false, video:null } })}>Guida</AdmButton>
              <AdmIconBtn icon="pencil" label="Modifica argomento" size={28}
                onClick={()=>setEditorArg({ nuovo:false, dati:{ ...a } })}/>
              {/* Un argomento con guide dentro non si cancella: la cancellazione
                  porterebbe via articoli che nessuno ha chiesto di eliminare. */}
              {sue.length === 0
                ? <SrvEliminaInline onElimina={()=>setArgomenti(prev => prev.filter(x => x.id !== a.id))}/>
                : <span title="Sposta o elimina prima le guide" style={{fontSize:11.8, color:ADM.MUTED_LIGHT, whiteSpace:'nowrap'}}>
                    contiene {sue.length}
                  </span>}
            </div>

            {sue.length === 0
              ? <div style={{fontSize:13, color:ADM.MUTED_SOFT, padding:'2px 0 6px 49px'}}>Nessuna guida in questo argomento.</div>
              : (
                <div style={{display:'grid', gridTemplateColumns:'repeat(2, minmax(0,1fr))', gap:14}}>
                  {sue.map(g => (
                    <SrvCardGuida key={g.id} g={g}
                      onModifica={()=>setEditorGuida({ nuova:false, dati:{ ...g } })}
                      onLive={(v)=>setGuide(prev => prev.map(x => x.id === g.id ? { ...x, live:v } : x))}
                      onElimina={()=>setGuide(prev => prev.filter(x => x.id !== g.id))}/>
                  ))}
                </div>
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

function SrvCardGuida({ g, onModifica, onLive, onElimina }) {
  const v = g.video;
  const voti = v ? v.utile + v.nonUtile : 0;
  return (
    <AdmCard padding={0} style={{overflow:'hidden', display:'flex', flexDirection:'column', opacity: g.live ? 1 : 0.82}}>
      {/* Il posto del video. Non c'è un file vero da riprodurre in un
          prototipo, ma lo spazio che occuperebbe sì — e la durata va vista
          prima di aprire, non dopo. */}
      {v && (
        <div style={{position:'relative', height:104, background:'linear-gradient(135deg, #23262D 0%, #0F1115 100%)',
          display:'grid', placeItems:'center'}}>
          <span style={{width:42, height:42, borderRadius:'50%', background:'rgba(255,255,255,0.14)',
            border:'1px solid rgba(255,255,255,0.22)', display:'grid', placeItems:'center'}}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="#fff"><path d="M8 5.5v13l11-6.5z"/></svg>
          </span>
          <span style={{position:'absolute', right:10, bottom:9, padding:'2px 8px', borderRadius:6,
            background:'rgba(0,0,0,0.62)', color:'#fff', fontSize:11.5, fontWeight:700,
            fontVariantNumeric:'tabular-nums'}}>{srvDurata(v.durataSec)}</span>
          <span style={{position:'absolute', left:11, bottom:9, fontSize:11.8, color:'rgba(255,255,255,0.72)',
            fontWeight:600, maxWidth:'62%', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>
            {v.titolo}
          </span>
        </div>
      )}

      <div style={{padding:'14px 16px', display:'flex', flexDirection:'column', gap:9, flex:1}}>
        <div style={{display:'flex', alignItems:'flex-start', gap:10}}>
          <div style={{flex:1, minWidth:0, fontSize:14.8, fontWeight:700, color:ADM.TEXT, lineHeight:1.35,
            letterSpacing:'-0.01em'}}>{g.titolo}</div>
          <SrvStatoPub live={g.live}/>
        </div>

        <div style={{fontSize:13, color:ADM.MUTED, lineHeight:1.5}}>{g.descrizione}</div>

        {/* Lettura e video affiancati: sono due modi di consumare la stessa
            guida, e la scelta si fa confrontando i due tempi. */}
        <div style={{display:'flex', alignItems:'center', gap:8, flexWrap:'wrap'}}>
          <span style={{display:'inline-flex', alignItems:'center', gap:6, padding:'4px 10px', borderRadius:99,
            background:ADM.NEUTRAL_SOFT, color:ADM.TEXT, fontSize:12.3, fontWeight:600}}>
            <BuIcons.clock size={13} color={ADM.MUTED}/> {g.minLettura} min di lettura
          </span>
          {v && (
            <span style={{display:'inline-flex', alignItems:'center', gap:6, padding:'4px 10px', borderRadius:99,
              background:ADM.INFO_SOFT, color:ADM.INFO, fontSize:12.3, fontWeight:600}}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13l11-6.5z"/></svg>
              {srvDurata(v.durataSec)} di video
            </span>
          )}
        </div>

        {v && v.descrizioneSotto && (
          <div style={{fontSize:12.4, color:ADM.MUTED, lineHeight:1.5, paddingLeft:11,
            borderLeft:`2px solid ${ADM.BORDER}`}}>{v.descrizioneSotto}</div>
        )}

        <div style={{flex:1}}/>

        <div style={{display:'flex', alignItems:'center', gap:10, paddingTop:10,
          borderTop:`1px solid ${ADM.BORDER_SOFT}`, flexWrap:'wrap'}}>
          <span style={{fontSize:12, color:ADM.MUTED_SOFT, flex:1, minWidth:0}}>
            {g.letture > 0 ? `${fmtNum(g.letture)} letture` : 'Mai letta'}
            {v && ` · ${fmtNum(v.views)} visualizzazioni · ${Math.round(v.tempoMedioSec / v.durataSec * 100)}% guardato`}
            {voti > 0 && ` · ${Math.round(v.utile / voti * 100)}% utile`}
          </span>
          <AdmSwitch size="sm" checked={g.live} onChange={onLive}/>
          <AdmIconBtn icon="pencil" label="Modifica" size={28} onClick={onModifica}/>
          <SrvEliminaInline onElimina={onElimina}/>
        </div>
      </div>
    </AdmCard>
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
              <div style={{display:'flex', alignItems:'center', gap:12, padding:'12px 14px', borderRadius:11,
                background:ADM.PANEL_SOFT, border:`1px solid ${ADM.BORDER_SOFT}`}}>
                <span style={{width:34, height:34, borderRadius:9, background:'#0F1115', display:'grid',
                  placeItems:'center', flexShrink:0}}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="#fff"><path d="M8 5.5v13l11-6.5z"/></svg>
                </span>
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

        <div style={{display:'flex', alignItems:'center', gap:12, padding:'12px 14px', borderRadius:10,
          background:ADM.PANEL_SOFT, border:`1px solid ${ADM.BORDER_SOFT}`}}>
          <AdmSwitch checked={d.live} onChange={(v)=>agg('live', v)}/>
          <div style={{flex:1, minWidth:0}}>
            <div style={{fontSize:13.6, fontWeight:600, color:ADM.TEXT}}>Pubblica nel gestionale</div>
            <div style={{fontSize:12.2, color:ADM.MUTED, marginTop:2}}>
              {d.live ? 'La guida comparirà nell\'argomento appena salvi.' : 'Resta in bozza: visibile solo qui in console.'}
            </div>
          </div>
        </div>
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
    <div style={{padding:'24px 28px', display:'flex', flexDirection:'column', gap:22}}>

      {/* ── Richiamate ── */}
      <div style={{display:'flex', flexDirection:'column', gap:12}}>
        <SrvTitoloSezione titolo="Richiamate"
          nota="La puntualità si misura solo sulle richiamate effettuate: le chiamate a vuoto sono contate a parte, altrimenti gonfierebbero la percentuale invece di pesarla."/>
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
            sub={`Su ${k.richiamate.totali} richiamate prenotate`}/>
        </div>
      </div>

      {/* ── Soddisfazione ── */}
      <div style={{display:'flex', flexDirection:'column', gap:12}}>
        <SrvTitoloSezione titolo="Soddisfazione del cliente"
          nota="Voto da 1 a 5 chiesto al ristoratore dopo la chiamata, con il commento quando lo lascia."/>
        <div style={{display:'grid', gridTemplateColumns:'320px minmax(0,1fr)', gap:14}}>
          <AdmCard>
            <div style={{display:'flex', flexDirection:'column', gap:14, height:'100%'}}>
              <div style={{display:'flex', alignItems:'baseline', gap:12}}>
                <span style={{fontSize:46, fontWeight:800, color:ADM.TEXT, letterSpacing:'-0.03em', lineHeight:1}}>
                  {s.media.toFixed(1).replace('.', ',')}
                </span>
                <span style={{fontSize:15, color:ADM.MUTED_SOFT, fontWeight:600}}>/ 5</span>
              </div>
              <div style={{display:'flex', alignItems:'center', gap:9}}>
                <SrvStelle valore={s.media} size={19}/>
                <span style={{fontSize:12.8, color:ADM.MUTED}}>su {s.n} risposte</span>
              </div>
              <div style={{display:'flex', flexDirection:'column', gap:6, paddingTop:4,
                borderTop:`1px solid ${ADM.BORDER_SOFT}`}}>
                {[...s.distribuzione].reverse().map(d => (
                  <div key={d.voto} style={{display:'flex', alignItems:'center', gap:9}}>
                    <span style={{fontSize:12, color:ADM.MUTED, fontWeight:700, width:12, textAlign:'right'}}>{d.voto}</span>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="#F59E0B" style={{flexShrink:0}}>
                      <path d="M12 3l2.7 5.5 6 .9-4.4 4.3 1 6L12 17l-5.4 2.7 1-6L3.4 9.4l6-.9L12 3z"/>
                    </svg>
                    <span style={{flex:1, height:7, borderRadius:99, background:ADM.BORDER_SOFT, overflow:'hidden'}}>
                      <span style={{display:'block', width:`${d.n / maxVoti * 100}%`, height:'100%',
                        background: d.voto >= 4 ? ADM.OK : d.voto === 3 ? ADM.WARN : ADM.DANGER, borderRadius:99}}/>
                    </span>
                    <span style={{fontSize:12, color:ADM.TEXT, fontWeight:600, width:16}}>{d.n}</span>
                  </div>
                ))}
              </div>
              <div style={{flex:1}}/>
              <div style={{fontSize:12.2, color:ADM.MUTED_SOFT, lineHeight:1.5, paddingTop:10,
                borderTop:`1px solid ${ADM.BORDER_SOFT}`}}>
                Il sondaggio parte dieci minuti dopo la chiamata e resta aperto un giorno.
                {' '}{s.recensioni.length} su {s.n} hanno lasciato anche un commento.
              </div>
            </div>
          </AdmCard>

          <AdmCard padding={0} style={{display:'flex', flexDirection:'column', overflow:'hidden'}}>
            <div style={{padding:'13px 18px', borderBottom:`1px solid ${ADM.BORDER_SOFT}`,
              fontSize:12.5, fontWeight:700, color:ADM.MUTED, textTransform:'uppercase', letterSpacing:'0.05em'}}>
              Recensioni · {s.recensioni.length}
            </div>
            <div style={{maxHeight:290, overflowY:'auto'}}>
              {s.recensioni.map((r, i) => (
                <div key={r.id} style={{padding:'13px 18px',
                  borderBottom: i === s.recensioni.length - 1 ? 'none' : `1px solid ${ADM.BORDER_SOFT}`}}>
                  <div style={{display:'flex', alignItems:'center', gap:9, marginBottom:5}}>
                    <SrvStelle valore={r.voto} size={13}/>
                    <span style={{fontSize:13.2, fontWeight:700, color:ADM.TEXT}}>{r.localeNome}</span>
                    <span style={{fontSize:12.2, color:ADM.MUTED_SOFT}}>{r.titolare}</span>
                    <div style={{flex:1}}/>
                    <span style={{fontSize:11.8, color:ADM.MUTED_LIGHT}}>{fmtRelative(r.richiamataIl)}</span>
                  </div>
                  <div style={{fontSize:13.2, color:ADM.TEXT, lineHeight:1.55}}>«{r.recensione}»</div>
                </div>
              ))}
              {s.recensioni.length === 0 && <AdmEmpty icon="star" title="Nessuna recensione" desc="Nessuno ha ancora lasciato un commento"/>}
            </div>
          </AdmCard>
        </div>
      </div>

      {/* ── Richieste e ticket ── */}
      <div style={{display:'flex', flexDirection:'column', gap:12}}>
        <SrvTitoloSezione titolo="Richieste di assistenza"
          nota="Quanti ristoratori hanno aperto una richiesta nella finestra e quanti di quelli hanno già il ticket chiuso. La finestra «oggi» ha per forza una percentuale bassa: molti ticket di oggi sono ancora aperti."/>
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
      </div>

      {/* ── Video ── */}
      <div style={{display:'flex', flexDirection:'column', gap:12}}>
        <SrvTitoloSezione titolo="Video delle guide"
          nota="Quanto di ogni video viene effettivamente guardato, e cosa ha risposto chi ha premuto «utile» o «non utile». Un video con molte visualizzazioni ma poco guardato è un video troppo lungo, non un video di successo."/>
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
          <div style={{display:'grid', gridTemplateColumns:'minmax(0,1fr) 90px 130px 150px 130px 170px',
            gap:12, padding:'11px 18px', background:ADM.PANEL_SOFT, borderBottom:`1px solid ${ADM.BORDER}`,
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
              gridTemplateColumns:'minmax(0,1fr) 90px 130px 150px 130px 170px', gap:12,
              padding:'12px 18px', alignItems:'center',
              borderBottom: i === k.video.length - 1 ? 'none' : `1px solid ${ADM.BORDER_SOFT}`,
              background: i % 2 ? ADM.ROW_STRIPE : 'transparent'}}>
              <div style={{minWidth:0}}>
                <div style={{fontSize:13.6, fontWeight:600, color:ADM.TEXT, whiteSpace:'nowrap',
                  overflow:'hidden', textOverflow:'ellipsis'}}>{v.titolo}</div>
                <div style={{fontSize:11.8, color:ADM.MUTED_SOFT, marginTop:2, whiteSpace:'nowrap',
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
                  <span style={{fontSize:12, color:ADM.MUTED_SOFT, fontWeight:600}}>({v.pctUtile}%)</span>
                )}
              </div>
            </div>
          ))}
          {k.video.length === 0 && <AdmEmpty icon="monitor" title="Nessun video" desc="Nessuna guida ha ancora un video allegato"/>}
        </AdmCard>
      </div>
    </div>
  );
}

Object.assign(window, { AdmAssistenzaPage, AdmServizioClientiKPI });
