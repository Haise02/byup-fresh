// Sezione Utenti App: lista + drawer dettaglio

const { useState: useStateUtn, useMemo: useMemoUtn } = React;

function AdmUtentiPage({ search: searchProp, openUtente }) {
  const [search, setSearch] = useStateUtn(searchProp || '');
  const [sesso, setSesso] = useStateUtn('all');
  const [fascia, setFascia] = useStateUtn('all');
  const [regione, setRegione] = useStateUtn('all');
  const [statoFiltro, setStatoFiltro] = useStateUtn('all');
  const [selected, setSelected] = useStateUtn(null);
  const [restrizioniOpen, setRestrizioniOpen] = useStateUtn(false);
  React.useEffect(() => { if (openUtente) setSelected(openUtente); }, [openUtente && openUtente.id]);
  // Il conteggio si legge dal registro a ogni render: applicare o togliere una
  // restrizione dal drawer lo aggiorna senza passarsi stato avanti e indietro.
  const restrizioniAttive = (window.RESTRIZIONI || []).filter(r => !r.revocataIl).length;

  const filtered = useMemoUtn(() => {
    let r = UTENTI;
    if (sesso !== 'all') r = r.filter(u => u.sesso === sesso);
    if (fascia !== 'all') {
      const [a, b] = fascia.split('-').map(Number);
      r = r.filter(u => u.eta >= a && u.eta <= b);
    }
    if (regione !== 'all') r = r.filter(u => u.regione === regione);
    if (statoFiltro === 'attivi')    r = r.filter(u => u.attivo);
    if (statoFiltro === 'inattivi')  r = r.filter(u => !u.attivo);
    if (search) {
      const q = search.toLowerCase();
      r = r.filter(u => u.nome.toLowerCase().includes(q) || u.citta.toLowerCase().includes(q));
    }
    return r;
  }, [sesso, fascia, regione, statoFiltro, search]);

  const totUtenti = UTENTI.length;

  return (
    <div style={{padding:28, display:'flex', flexDirection:'column', gap:16}}>
      <AdmCard padding={0}>
        <div style={{padding:'14px 18px', display:'flex', alignItems:'center', gap:10, borderBottom:`1px solid ${ADM.BORDER}`, flexWrap:'wrap'}}>
          <div style={{position:'relative', flex:'0 0 240px'}}>
            <span style={{position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:ADM.MUTED_SOFT, pointerEvents:'none'}}><BuIcons.search size={19}/></span>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Cerca per nome o città…" style={{
              width:'100%', padding:'7px 10px 7px 32px', border:`1px solid ${ADM.BORDER}`, borderRadius:7,
              fontSize:14, fontFamily:'inherit', outline:'none', background:'#fff',
            }}/>
          </div>
          <FilterDropdown label="Stato" value={statoFiltro} onChange={setStatoFiltro} options={[
            {value:'all', label:'Tutti gli stati'}, {value:'attivi', label:'Attivi'}, {value:'inattivi', label:'Inattivi'},
          ]}/>
          <FilterDropdown label="Sesso" value={sesso} onChange={setSesso} options={[
            {value:'all', label:'Tutti'}, {value:'F', label:'Donne'}, {value:'M', label:'Uomini'},
          ]}/>
          <FilterDropdown label="Età" value={fascia} onChange={setFascia} options={[
            {value:'all', label:'Tutte le età'}, {value:'18-25', label:'18-25'}, {value:'26-35', label:'26-35'}, {value:'36-45', label:'36-45'}, {value:'46-60', label:'46-60'}, {value:'61-99', label:'60+'},
          ]}/>
          <FilterDropdown label="Regione" value={regione} onChange={setRegione} options={[
            {value:'all', label:'Tutte le regioni'},
            ...REGIONI.map(r => ({value:r, label:r})),
          ]}/>
          {/* Conteggio e restrizioni stanno insieme in coda alla barra: con
              marginLeft:auto restano a destra anche quando i filtri mandano la
              riga a capo, invece di ricomparire a sinistra sotto la ricerca.
              Le restrizioni non sono un filtro della lista — sono un registro a
              parte: chi è ristretto, da quando e per quale recensione. */}
          <div style={{display:'flex', alignItems:'center', gap:10, marginLeft:'auto'}}>
            <span style={{fontSize:13.7, color:ADM.MUTED}}>{filtered.length} di {totUtenti}</span>
            <AdmButton variant="secondary" size="sm" icon="shield" onClick={()=>setRestrizioniOpen(true)}>
              Restrizioni
              {restrizioniAttive > 0 && (
                <span style={{
                  fontSize:12, fontWeight:700, marginLeft:2,
                  background:ADM.WARN_SOFT, color:ADM.WARN,
                  padding:'0 6px', borderRadius:99,
                }}>{restrizioniAttive}</span>
              )}
            </AdmButton>
          </div>
        </div>

        <div style={{
          display:'grid',
          gridTemplateColumns:'minmax(0,2.4fr) 0.7fr 0.6fr 1.3fr 1.1fr 60px',
          padding:'10px 18px',
          borderBottom:`1px solid ${ADM.BORDER}`,
          fontSize:12.6, fontWeight:700, color:ADM.MUTED, textTransform:'uppercase', letterSpacing:'0.06em',
        }}>
          <div>Utente</div>
          <div>Sesso</div>
          <div>Età</div>
          <div>Geografia</div>
          <div>Stato</div>
          <div></div>
        </div>

        <div>
          {filtered.length === 0 && <AdmEmpty title="Nessun utente trovato" desc="Modifica i filtri di ricerca"/>}
          {filtered.map((u, i) => <UtenteRow key={u.id} utente={u} onClick={()=>setSelected(u)} striped={i%2===1}/>)}
        </div>
      </AdmCard>

      {selected && <UtenteDrawer utente={selected} onClose={()=>setSelected(null)}/>}
      {restrizioniOpen && (
        <AdmRestrizioniModal
          onClose={()=>setRestrizioniOpen(false)}
          onOpenUtente={(u)=>setSelected(u)}/>
      )}
    </div>
  );
}

// ─── Spesa media card · period-aware ────────────────────────────────────────
// Risolve l'ambiguità: ogni KPI di spesa ha un orizzonte temporale esplicito.
// Lifetime = somma totale dall'iscrizione; 12 mesi = annualizzata; 30 giorni =
// proiezione mensile basata sull'orizzonte medio dei dati raccolti.
function SpesaMediaCard({ lifetime, anno, mese, horizonDays }) {
  const [periodo, setPeriodo] = useStateUtn('lifetime');
  const opts = [
    { id:'lifetime', label:'Lifetime', shortHelp:`dall'iscrizione (Ø ${horizonDays}gg)`, value:lifetime },
    { id:'anno',     label:'12 mesi',  shortHelp:'annualizzata',                          value:anno },
    { id:'mese',     label:'30 gg',    shortHelp:'mensile media',                          value:mese },
  ];
  const cur = opts.find(o => o.id === periodo) || opts[0];

  return (
    <AdmCard padding={20}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:10}}>
        <div style={{minWidth:0, flex:1}}>
          <div style={{display:'flex', alignItems:'center', gap:6, flexWrap:'wrap'}}>
            <div style={{fontSize:13, color:ADM.MUTED, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em'}}>Spesa media / utente</div>
            <span style={{
              fontSize:13, fontWeight:800, color:ADM.OK, background:ADM.OK_SOFT,
              padding:'2px 6px', borderRadius:4, letterSpacing:'0.06em', textTransform:'uppercase',
            }}>{cur.label}</span>
          </div>
          <div style={{fontSize:26.6, fontWeight:700, color:ADM.TEXT, marginTop:8, letterSpacing:'-0.03em', lineHeight:1.05}}>
            {fmtEur(cur.value)}
          </div>
          <div style={{fontSize:13.3, color:ADM.MUTED, marginTop:8}}>Da ordini in app · {cur.shortHelp}</div>
        </div>
        <div style={{
          width:38, height:38, borderRadius:11,
          background: ADM.OK_SOFT, color: ADM.OK,
          display:'grid', placeItems:'center',
          boxShadow:'inset 0 0 0 1px rgba(255,255,255,0.4)', flexShrink:0,
        }}>
          <BuIcons.card size={23}/>
        </div>
      </div>

      {/* Period switcher · Apple segmented control */}
      <div style={{
        display:'inline-flex', marginTop:12, padding:2,
        background:'#F0F1F3', borderRadius:7,
      }}>
        {opts.map(o => {
          const active = o.id === periodo;
          return (
            <button key={o.id} onClick={()=>setPeriodo(o.id)} style={{
              padding:'4px 10px', fontSize:12.6, fontWeight:700,
              background: active ? '#fff' : 'transparent',
              color: active ? ADM.OK : ADM.MUTED,
              border:'none', borderRadius:5, cursor:'pointer',
              fontFamily:'inherit', letterSpacing:'0.02em',
              boxShadow: active ? '0 1px 2px rgba(15,17,21,0.08)' : 'none',
              transition:'all 0.15s',
            }}>{o.label}</button>
          );
        })}
      </div>
    </AdmCard>
  );
}

function UtenteRow({ utente: u, onClick, striped }) {
  const [hover, setHover] = useStateUtn(false);
  return (
    <div onClick={onClick} className="adm-row-open"
      onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)}
      style={{
        display:'grid',
        gridTemplateColumns:'minmax(0,2.4fr) 0.7fr 0.6fr 1.3fr 1.1fr 60px',
        padding:'12px 18px',
        borderBottom:`1px solid ${ADM.BORDER_SOFT}`,
        background: hover ? ADM.ROW_HOVER : (striped ? ADM.ROW_STRIPE : 'transparent'),
        cursor:'pointer',
        alignItems:'center',
      }}>
      <div style={{display:'flex', alignItems:'center', gap:11, minWidth:0}}>
        <AdmAvatar name={u.nome} size={39} bg={`hsl(${(u.id.charCodeAt(1)+u.id.charCodeAt(3))*5 % 360}, 45%, 55%)`}/>
        <div style={{minWidth:0}}>
          <div style={{fontSize:14.4, fontWeight:600, color:ADM.TEXT}}>{u.nome}</div>
          <div style={{fontSize:13.3, color:ADM.MUTED, marginTop:1}}>{u.email}</div>
        </div>
      </div>
      <div style={{fontSize:14, color:ADM.TEXT}}>{u.sesso === 'F' ? 'Donna' : 'Uomo'}</div>
      <div style={{fontSize:14, color:ADM.TEXT}}>{u.eta}</div>
      <div>
        <div style={{fontSize:14, color:ADM.TEXT, fontWeight:500}}>{u.citta}</div>
        <div style={{fontSize:13, color:ADM.MUTED}}>{u.regione}</div>
      </div>
      <div>
        {u.attivo
          ? <AdmBadge color="OK" size="xs">● Attivo</AdmBadge>
          : (
            <div>
              <AdmBadge color="PLAN_FREE" size="xs">○ Inattivo</AdmBadge>
              <div style={{fontSize:12.6, color:ADM.MUTED_SOFT, marginTop:3}}>Ultima: {fmtRelative(u.lastSession)}</div>
            </div>
          )}
      </div>
      <div style={{textAlign:'right', color:ADM.MUTED}}><span className="adm-row-chev"><BuIcons.chevronRight size={20}/></span></div>
    </div>
  );
}

// ─── Gli eventi dell'app ────────────────────────────────────────────────────
// Il vocabolario del tracking: quello che l'app emette quando l'utente fa
// qualcosa, ed è ciò che serve a NOI per tracciare l'attività. La tab Log
// li mostra così come arrivano, con la chiave tecnica in chiaro — la stessa
// che si ritrova negli export e in Analisi Dati. Solo l'etichetta, niente
// icone o colori: è un log, si scandisce per testo e data.
const UTN_EVENTI = {
  app_open:        { label: 'Apertura app' },
  qr_scan:         { label: 'QR scansionato' },
  menu_view:       { label: 'Menu sfogliato' },
  order_placed:    { label: 'Ordine inviato' },
  payment_done:    { label: 'Conto pagato in app' },
  reservation_new: { label: 'Prenotazione creata' },
  review_posted:   { label: 'Recensione pubblicata' },
  byuppini_earned: { label: 'Byuppini accreditati' },
  byuppini_spent:  { label: 'Byuppini riscattati' },
  push_opened:     { label: 'Notifica push aperta' },
  consent_update:  { label: 'Consenso aggiornato' },
};

// Le durate si leggono come le dice un umano: secondi fino al minuto, minuti
// con la coda in secondi fino all'ora, poi ore e minuti. «4 min 20 s», non
// «260 s» né «0,07 h».
function utnDurata(sec) {
  if (sec < 60) return Math.round(sec) + ' s';
  if (sec < 3600) {
    const m = Math.floor(sec / 60), s = Math.round(sec % 60);
    return s ? m + ' min ' + s + ' s' : m + ' min';
  }
  const h = Math.floor(sec / 3600), m = Math.round((sec % 3600) / 60);
  return m ? h + ' h ' + m + ' min' : h + ' h';
}

// Una spesa MEDIA si legge al centesimo (fmtEur taglia i decimali, e una
// media da «€ 23» non è una media).
const utnEur2 = (n) => n == null ? '—'
  : '€ ' + new Intl.NumberFormat('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

// `pieno`: stessa scheda ma a pagina intera, senza velo né finestra centrata
// — riempie il posto che la rotta Contatti le dà, e a chiudere ci pensa la
// barra «torna» del chiamante.
function UtenteDrawer({ utente: u, onClose, pieno }) {
  const [tab, setTab] = useStateUtn('anagrafica');

  // ── Mock stabili derivati dal seed utente (campi non ancora nel dataset) ──
  // Il seme è l'hash dell'ID INTERO (hubSeme): la vecchia formula leggeva due
  // caratteri soli, e sugli id 'U20xx' uno dei due è uguale per tutti —
  // restavano cinque semi in croce, utenti fotocopia ogni dieci, e certi rami
  // derivati (il consenso A3, per dire) non uscivano MAI per nessuno.
  const seed = hubSeme(u.id) % 1000;
  const rnd = (n) => ((seed * (n+1) * 9301 + 49297) % 233280) / 233280;
  if (u.byuppini === undefined) u.byuppini = 20 + (seed % 380);
  if (u.dataNascita === undefined) {
    const y = new Date().getFullYear() - u.eta;
    u.dataNascita = `${y}-${String(1 + (seed % 12)).padStart(2,'0')}-${String(1 + (seed % 28)).padStart(2,'0')}`;
  }
  if (u.verificato === undefined) u.verificato = seed % 3 !== 0;

  // ── Form anagrafica (editabile con salvataggio) ──
  const [form, setForm] = useStateUtn({
    nome: u.nome, email: u.email, tel: u.tel, citta: u.citta, regione: u.regione,
    dataNascita: u.dataNascita, sesso: u.sesso, verificato: u.verificato,
  });
  const dirty = form.nome !== u.nome || form.email !== u.email || form.tel !== u.tel
    || form.citta !== u.citta || form.regione !== u.regione || form.dataNascita !== u.dataNascita
    || form.sesso !== u.sesso || form.verificato !== u.verificato;
  const [saved, setSaved] = useStateUtn(false);
  const etaCalcolata = (() => {
    const d = new Date(form.dataNascita);
    if (isNaN(d)) return null;
    return Math.max(0, Math.floor((Date.now() - d.getTime()) / (365.25 * 86400000)));
  })();
  const saveForm = () => {
    // L'età resta il campo derivato usato da lista e filtri: la teniamo in sync.
    Object.assign(u, { ...form, eta: etaCalcolata ?? u.eta });
    setSaved(true); setTimeout(()=>setSaved(false), 2200);
  };
  const F = (k) => (e) => { setSaved(false); setForm(prev => ({ ...prev, [k]: e.target ? e.target.value : e })); };

  // ── Azioni sensibili / byuppini / reset password ──
  const [resetSent, setResetSent] = useStateUtn(false);
  const [byupPopup, setByupPopup] = useStateUtn(null); // 'add' | 'sub' | null
  const [byupAmount, setByupAmount] = useStateUtn('');
  const [byupFeedback, setByupFeedback] = useStateUtn(null);
  const [deletePopup, setDeletePopup] = useStateUtn(false);
  const [banPopup, setBanPopup] = useStateUtn(null); // 'ban' | 'unban' | 'shadow' | 'unshadow' | null
  const [banned, setBanned] = useStateUtn(!!u.bannato);
  const [shadow, setShadow] = useStateUtn(!!u.shadowban);
  React.useEffect(() => { setBanned(!!u.bannato); setShadow(!!u.shadowban); setBanPopup(null); }, [u.id]);
  const confirmBan = () => {
    // Ogni applicazione e ogni revoca passa anche dal registro restrizioni:
    // è quello che alimenta l'elenco in Utenti app.
    if (banPopup === 'ban' || banPopup === 'unban') {
      u.bannato = banPopup === 'ban'; setBanned(u.bannato);
      if (u.bannato) admAggiungiRestrizione(u, 'ban');
      else admRevocaPerUtente(u.id, 'ban');
    }
    if (banPopup === 'shadow' || banPopup === 'unshadow') {
      u.shadowban = banPopup === 'shadow'; setShadow(u.shadowban);
      if (u.shadowban) admAggiungiRestrizione(u, 'shadowban');
      else admRevocaPerUtente(u.id, 'shadowban');
    }
    setBanPopup(null);
  };

  // ── Recensioni dell'utente (mock deterministico) + rimozione con motivo ──
  const REV_TESTI = [
    'Esperienza ottima, servizio veloce e piatti curati. Torneremo di sicuro!',
    'Buono ma non eccezionale: attesa un po\' lunga, però la qualità c\'è.',
    'Location carina e personale gentile. Prezzi onesti per la zona.',
    'Deludente: ordine sbagliato e tavolo prenotato non pronto all\'arrivo.',
    'Il migliore della città per rapporto qualità/prezzo. Consigliato!',
    'Menu ricco e ben spiegato nell\'app, il QR al tavolo funziona benissimo.',
  ];
  const [recensioni, setRecensioni] = useStateUtn([]);
  React.useEffect(() => {
    const attivi = LOCALI.filter(l => l.stato === 'active');
    const n = 2 + Math.floor(rnd(31) * 3); // 2-4 recensioni
    setRecensioni(Array.from({length: n}).map((_, i) => {
      const l = attivi[Math.floor(rnd(40 + i) * attivi.length)] || attivi[0];
      return {
        id: u.id + '-R' + i,
        locale: l,
        rating: 2 + Math.floor(rnd(50 + i) * 4),
        testo: REV_TESTI[Math.floor(rnd(60 + i) * REV_TESTI.length)],
        data: new Date(Date.now() - Math.floor(rnd(70 + i) * 200 + 3) * 86400000),
        rimossa: null,
      };
    }));
  }, [u.id]);
  const [revPopup, setRevPopup] = useStateUtn(null); // recensione da rimuovere
  const [revMotivo, setRevMotivo] = useStateUtn('');
  const confirmRimuoviRev = () => {
    if (!revMotivo.trim()) return;
    setRecensioni(prev => prev.map(r => r.id === revPopup.id ? { ...r, rimossa: revMotivo.trim() } : r));
    setRevPopup(null); setRevMotivo('');
  };
  const byupN = parseInt(byupAmount, 10) || 0;
  const byupValid = byupPopup === 'sub' ? (byupN > 0 && byupN <= u.byuppini) : byupN > 0;
  const confirmByup = () => {
    if (!byupValid) return;
    if (byupPopup === 'sub') {
      u.byuppini -= byupN;
      setByupFeedback(`−${byupN} byuppini stornati`);
    } else {
      u.byuppini += byupN;
      setByupFeedback(`+${byupN} byuppini caricati`);
    }
    setByupPopup(null); setByupAmount('');
    setTimeout(()=>setByupFeedback(null), 2500);
  };

  // ── Log (tab 2): gli eventi che l'app ha emesso per questo utente ──
  // Deterministici sul seme, dal più recente. Il sacchetto dei tipi è PESATO:
  // le aperture e i menu sfogliati capitano più spesso di una recensione,
  // e un log verosimile lo deve far vedere.
  const eventi = (() => {
    const attivi = LOCALI.filter(l => l.stato === 'active');
    const pool = ['app_open', 'app_open', 'app_open', 'menu_view', 'menu_view', 'qr_scan', 'qr_scan',
      'order_placed', 'order_placed', 'payment_done', 'byuppini_earned', 'reservation_new',
      'push_opened', 'review_posted', 'byuppini_spent', 'consent_update'];
    const n = 14 + Math.floor(rnd(80) * 10);
    const out = [];
    let ore = 1 + Math.floor(rnd(81) * 30);
    for (let i = 0; i < n; i++) {
      const tipo = pool[Math.floor(rnd(90 + i * 4) * pool.length)];
      const l = attivi[Math.floor(rnd(91 + i * 4) * attivi.length)] || attivi[0];
      const r = rnd(92 + i * 4);
      const dettagli = {
        app_open:        `Sessione di ${2 + Math.floor(r * 22)} min`,
        qr_scan:         `Tavolo ${1 + Math.floor(r * 14)} · ${l.nome}`,
        menu_view:       `${l.nome} · ${3 + Math.floor(r * 14)} piatti visti`,
        order_placed:    `${l.nome} · € ${(9 + r * 46).toFixed(2).replace('.', ',')}`,
        payment_done:    r < 0.4 ? `${l.nome} · conto diviso in ${2 + Math.floor(r * 5)}` : `${l.nome} · conto intero`,
        reservation_new: `${l.nome} · ${2 + Math.floor(r * 6)} persone · ${19 + Math.floor(r * 3)}:${r < 0.5 ? '30' : '00'}`,
        review_posted:   `${l.nome} · ${2 + Math.floor(r * 4)} stelle`,
        byuppini_earned: `+${5 + Math.floor(r * 40)} byuppini · ordine da ${l.nome}`,
        byuppini_spent:  `−${10 + Math.floor(r * 60)} byuppini · premio riscattato`,
        push_opened:     `«${['Menu della settimana', 'Beta prenotazioni', 'C\'è un nuovo locale vicino a te'][Math.floor(r * 3)]}»`,
        // La prova del consenso: l'evento scrive nel registro consent_data,
        // ed è quello che si esibisce quando qualcuno chiede «quando ha
        // detto sì?».
        consent_update:  `Marketing → ${r < 0.5 ? 'Sì' : 'No'} · scritto in consent_data`,
      };
      out.push({ id: u.id + '-E' + i, tipo, quando: new Date(Date.now() - ore * 3600000), dettaglio: dettagli[tipo] });
      ore += 2 + Math.floor(rnd(93 + i * 4) * 88);
    }
    return out;
  })();
  // Il filtro per data del log: due estremi, entrambi facoltativi. L'«al» è
  // compreso — chi scrive una data intende quel giorno, non la sua mezzanotte.
  const [logDal, setLogDal] = useStateUtn('');
  const [logAl, setLogAl] = useStateUtn('');
  const eventiFiltrati = eventi.filter(e =>
    (!logDal || e.quando >= new Date(logDal)) &&
    (!logAl || e.quando < new Date(new Date(logAl).getTime() + 86400000)));

  // ── Statistiche (tab 2): le abitudini d'uso della piattaforma ──
  // Deterministiche sul seme. Le sessioni si estraggono UNA volta — quelle
  // dell'anno — e gli altri orizzonti si dividono da lì: cinque numeri
  // estratti a caso non starebbero mai in colonna tra loro.
  const sessioniAnno = 60 + Math.floor(rnd(300) * 420);
  const sessioni = {
    settimana: Math.max(1, Math.round(sessioniAnno / 52)),
    mese: Math.round(sessioniAnno / 12),
    trimestre: Math.round(sessioniAnno / 4),
    semestre: Math.round(sessioniAnno / 2),
    anno: sessioniAnno,
  };
  const tempoSessione = (6 + rnd(301) * 18) * 60;      // 6–24 min per sessione
  const tempoOrdine = (2 + rnd(302) * 6) * 60;         // 2–8 min dal menu all'invio
  // A quest'ordine di grandezza i secondi sono rumore («49 min 59 s» si
  // legge come un glitch): minuti interi.
  const tempoPagamento = Math.round(25 + rnd(303) * 70) * 60;  // 25–95 min dall'ordine al conto
  const tempoPrenotazione = 40 + rnd(304) * 140;       // 40 s – 3 min in sessione
  const refLocali = Math.floor(rnd(305) * 9);          // inviti a ristoranti
  const refUtenti = Math.floor(rnd(306) * 15);         // inviti ad altri utenti
  const refTotali = refLocali + refUtenti;
  const refRiscattati = Math.round(refTotali * (0.2 + rnd(307) * 0.5));
  const refConversione = refTotali ? Math.round((refRiscattati / refTotali) * 100) : null;

  // ── Prenotazioni: l'anno, il ritmo mensile, e quante volte non s'è visto ──
  // Le annue si ricavano dal totale VERO del dataset riportato a 12 mesi
  // sull'età dell'account; la media mensile ne è un dodicesimo, con una
  // cifra decimale perché il ritmo si veda. Il no show è pescato basso
  // (rnd·rnd): quasi tutti onorano, qualcuno è recidivo.
  const etaGiorniAccount = Math.max(1, (Date.now() - u.dataRegistrazione.getTime()) / 86400000);
  const prenAnno = etaGiorniAccount > 365 ? Math.round(u.prenotazioni * (365 / etaGiorniAccount)) : u.prenotazioni;
  const prenMese = Math.round((prenAnno / 12) * 10) / 10;
  const noShow = prenAnno ? Math.round(rnd(420) * rnd(421) * 25) : null;

  // ── Consensi (tab): lo specchio di ByupConsensi dell'app ──
  // Tre codici, gli stessi del registro vero: A3 (dato alimentare nel
  // profilo), A18 (offerte sul dato alimentare — vale solo INSIEME ad A6,
  // mai da sola: il dato è sensibile), A6 (marketing, che dal 2026-08-06 ha
  // assorbito PROMOP). Ogni consenso porta {ok, quando, versione}: la
  // versione è il documento contro cui è stato espresso. Qualcuno non è mai
  // stato interpellato: quello è un terzo stato, non un «no».
  const consensi = [
    { id: 'A3',  label: 'Preferenze alimentari nel profilo',
      desc: 'Salvataggio di dieta e allergie per filtrare i menu — dato sensibile' },
    { id: 'A18', label: 'Offerte su preferenze alimentari',
      desc: 'Promozioni costruite sul dato alimentare — vale solo insieme ad A6' },
    { id: 'A6',  label: 'Marketing',
      desc: 'Comunicazioni promozionali, generiche e su misura sullo storico ordini' },
  ].map((c, i) => {
    const deciso = rnd(400 + i * 3) > 0.15;
    const ok = deciso && rnd(401 + i * 3) > 0.35;
    const quando = new Date(Math.min(Date.now() - 86400000,
      u.dataRegistrazione.getTime() + Math.floor(rnd(402 + i * 3) * 200) * 86400000));
    return { ...c, deciso, ok, quando: deciso ? quando : null, versione: '1.0' };
  });
  const consensoA3 = consensi.find(c => c.id === 'A3');

  // ── Preferenze alimentari (tab Statistiche): SOLO col consenso A3 ──
  // Senza consenso il dato non si mostra — non «non c'è»: non si guarda.
  const dietaOpz = ['Vegetariano', 'Vegano', 'Senza glutine', 'Halal', 'Kosher', 'Pescetariano'];
  const allergOpz = ['Glutine', 'Lattosio', 'Frutta a guscio', 'Uova', 'Crostacei', 'Pesce', 'Soia', 'Sedano'];
  const dieta = rnd(410) < 0.45 ? dietaOpz[Math.floor(rnd(411) * dietaOpz.length)] : null;
  const allergie = allergOpz.filter((_, i) => rnd(412 + i) < 0.18);

  const inputStyle = {
    width:'100%', padding:'8px 11px', border:`1px solid ${ADM.BORDER}`, borderRadius:8,
    fontSize:13.5, fontFamily:'inherit', color:ADM.TEXT, background:'#fff',
    outline:'none', boxSizing:'border-box',
  };
  const labelStyle = {fontSize:11.5, color:ADM.MUTED, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em', display:'block', marginBottom:5};

  return (
    <div onClick={pieno ? undefined : onClose} style={pieno ? {} : {
      position:'fixed', inset:0, zIndex:50,
      display:'grid', placeItems:'center', padding:24,
      background:'rgba(15,17,21,0.45)',
      backdropFilter:'blur(3px)', WebkitBackdropFilter:'blur(3px)',
    }}>
      <div onClick={e=>e.stopPropagation()} style={pieno ? {
        width:'100%', background:'#fff',
        display:'flex', flexDirection:'column', position:'relative',
      } : {
        width:760, maxWidth:'94%', background:'#fff', maxHeight:'88%',
        borderRadius:18, overflow:'hidden',
        display:'flex', flexDirection:'column',
        boxShadow:'0 32px 80px rgba(15,17,21,0.30)',
        animation:'admModalIn 0.22s cubic-bezier(0.22,0.9,0.35,1)',
        position:'relative',
      }}>
        {/* Header — titolo popup + identità essenziale (la meta vive in Anagrafica) */}
        <div style={{padding:'16px 24px 0', borderBottom:`1px solid ${ADM.BORDER}`, flexShrink:0}}>
          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10}}>
            <span style={{fontSize:11.5, fontWeight:700, color:ADM.MUTED_SOFT, textTransform:'uppercase', letterSpacing:'0.07em'}}>Dettaglio utente</span>
            {!pieno && <AdmIconBtn icon="x" onClick={onClose}/>}
          </div>
          <div style={{display:'flex', alignItems:'center', gap:12, marginBottom:14}}>
            <AdmAvatar name={form.nome} size={46} bg={`hsl(${(u.id.charCodeAt(1)+u.id.charCodeAt(3))*5 % 360}, 45%, 55%)`}/>
            {/* SOLO il nome: stato e verifica sono anagrafe e vivono nella
                tab Anagrafica — la testata presenta, non riassume. */}
            <div style={{
              flex:1, minWidth:0,
              fontSize:19, fontWeight:700, color:ADM.TEXT, letterSpacing:'-0.01em',
              whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis',
            }}>{form.nome}</div>
          </div>
          {/* Tabs */}
          <div style={{display:'flex', gap:2}}>
            {[{id:'anagrafica', label:'Anagrafica'},{id:'account', label:'Account'},{id:'statistiche', label:'Statistiche'},{id:'consensi', label:'Consensi'},{id:'log', label:`Log (${eventi.length})`},{id:'recensioni', label:`Recensioni (${recensioni.length})`}].map(t => (
              <button key={t.id} className="adm-pill" onClick={()=>setTab(t.id)} style={{
                padding:'9px 14px', background:'transparent', border:'none',
                borderBottom:`2px solid ${tab === t.id ? ADM.PINK : 'transparent'}`,
                color: tab === t.id ? ADM.TEXT : ADM.MUTED,
                fontSize:13.5, fontWeight: tab === t.id ? 700 : 500,
                cursor:'pointer', fontFamily:'inherit', marginBottom:-1,
              }}>{t.label}</button>
            ))}
          </div>
        </div>

        {/* ═══ TAB ANAGRAFICA ═══ */}
        {tab === 'anagrafica' && (
          <div style={{flex:1, overflow:'auto', padding:'20px 24px', display:'flex', flexDirection:'column', gap:14, background:ADM.PANEL_SOFT}}>
            <AdmCard padding={20}>
              <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14}}>
                <div style={{fontSize:14.4, fontWeight:700, color:ADM.TEXT}}>Informazioni account</div>
                {saved && <span style={{fontSize:12.5, color:ADM.OK, fontWeight:700}}>✓ Salvato</span>}
              </div>
              {/* La verifica sta IN CIMA: è la prima cosa che si guarda su
                  un account, prima ancora di com'è compilato. */}
              <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:14, paddingBottom:14, borderBottom:`1px solid ${ADM.BORDER_SOFT}`}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:13.5, fontWeight:600, color:ADM.TEXT}}>Account verificato</div>
                  <div style={{fontSize:12.5, color:ADM.MUTED, marginTop:1}}>Identità confermata via documento o pagamento</div>
                </div>
                <AdmSwitch checked={form.verificato} onChange={(v)=>{ setSaved(false); setForm(prev=>({...prev, verificato:v})); }}/>
              </div>
              <div style={{display:'grid', gridTemplateColumns:'repeat(2, minmax(0,1fr))', gap:'12px 14px'}}>
                <div style={{gridColumn:'1 / -1'}}>
                  <label style={labelStyle}>Nome e cognome</label>
                  <input value={form.nome} onChange={F('nome')} style={inputStyle}/>
                </div>
                <div>
                  <label style={labelStyle}>Email</label>
                  <input value={form.email} onChange={F('email')} style={{...inputStyle, fontFamily:'ui-monospace,monospace', fontSize:12.5}}/>
                </div>
                <div>
                  <label style={labelStyle}>Telefono</label>
                  <input value={form.tel} onChange={F('tel')} style={{...inputStyle, fontFamily:'ui-monospace,monospace', fontSize:12.5}}/>
                </div>
                <div>
                  <label style={labelStyle}>Luogo principale</label>
                  <input value={form.citta} onChange={F('citta')} style={inputStyle}/>
                </div>
                <div>
                  <label style={labelStyle}>Regione</label>
                  <input value={form.regione} onChange={F('regione')} style={inputStyle}/>
                </div>
                <div>
                  <label style={labelStyle}>Data di nascita</label>
                  <input type="date" value={form.dataNascita} onChange={F('dataNascita')} style={inputStyle}/>
                  {etaCalcolata !== null && <div style={{fontSize:11.5, color:ADM.MUTED_SOFT, marginTop:4}}>{etaCalcolata} anni</div>}
                </div>
                <div>
                  <label style={labelStyle}>Genere</label>
                  <AdmSelect value={form.sesso} onChange={F('sesso')} block
                    buttonStyle={{padding:'8px 11px', borderRadius:8, fontSize:13.5}}
                    options={[
                      {value:'F', label:'Donna'},
                      {value:'M', label:'Uomo'},
                      {value:'X', label:'Altro / N.D.'},
                    ]}/>
                </div>
                <div>
                  <label style={labelStyle}>Codice utente</label>
                  <div style={{...inputStyle, background:ADM.PANEL_SOFT, color:ADM.MUTED, fontFamily:'ui-monospace,monospace', fontSize:12.5, display:'flex', alignItems:'center', justifyContent:'space-between'}}>
                    {u.id}
                    <span style={{fontSize:10.5, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em', color:ADM.MUTED_SOFT}}>non modificabile</span>
                  </div>
                </div>
                <div>
                  {/* Lo stato che prima stava appiccicato al nome in testata:
                      è anagrafe, si legge qui — restrizioni comprese. */}
                  <label style={labelStyle}>Stato</label>
                  <div style={{display:'flex', alignItems:'center', minHeight:34}}>
                    {banned
                      ? <AdmBadge color="DANGER" size="xs">Bannato</AdmBadge>
                      : shadow
                      ? <AdmBadge color="WARN" size="xs">Shadowban</AdmBadge>
                      : u.attivo
                      ? <AdmBadge color="OK" size="xs">Attivo</AdmBadge>
                      : <AdmBadge color="PLAN_FREE" size="xs">Inattivo</AdmBadge>}
                  </div>
                </div>
              </div>
              <div style={{display:'flex', justifyContent:'flex-end', gap:8, marginTop:14}}>
                <AdmButton variant="primary" size="md" icon="check" disabled={!dirty} onClick={saveForm}>Salva modifiche</AdmButton>
              </div>
            </AdmCard>

          </div>
        )}

        {/* ═══ TAB ACCOUNT — la gestione dell'utenza ═══ */}
        {/* Le AZIONI sull'account — saldo fedeltà, credenziali, restrizioni —
            stavano in coda all'anagrafica, ma l'anagrafica dice chi è la
            persona: qui c'è quello che si può FARE al suo account, con la
            zona sensibile per ultima, sobria com'era. */}
        {tab === 'account' && (
          <div style={{flex:1, overflow:'auto', padding:'20px 24px', display:'flex', flexDirection:'column', gap:14, background:ADM.PANEL_SOFT}}>
            {/* Byuppini */}
            <AdmCard padding={20}>
              <div style={{display:'flex', alignItems:'center', gap:14}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:14.4, fontWeight:700, color:ADM.TEXT}}>Byuppini</div>
                  <div style={{fontSize:12.5, color:ADM.MUTED, marginTop:2}}>Saldo attuale del programma fedeltà</div>
                  {byupFeedback && <div style={{fontSize:12.5, color: byupFeedback.startsWith('−') ? ADM.DANGER : ADM.OK, fontWeight:700, marginTop:4}}>✓ {byupFeedback}</div>}
                </div>
                <div style={{fontSize:26, fontWeight:800, color:ADM.TEXT, letterSpacing:'-0.02em'}}>{fmtNum(u.byuppini)}</div>
                <AdmButton variant="secondary" size="md" icon="plus" onClick={()=>setByupPopup('add')}>Carica</AdmButton>
                <AdmButton variant="ghost" size="md" onClick={()=>setByupPopup('sub')}>Storna…</AdmButton>
              </div>
            </AdmCard>

            {/* Sicurezza */}
            <AdmCard padding={20}>
              <div style={{display:'flex', alignItems:'center', gap:14}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:14.4, fontWeight:700, color:ADM.TEXT}}>Reset password</div>
                  <div style={{fontSize:12.5, color:ADM.MUTED, marginTop:2}}>
                    {resetSent ? <span style={{color:ADM.OK, fontWeight:700}}>✓ Email di reset inviata a {form.email}</span> : `Invia un link di reimpostazione a ${form.email}`}
                  </div>
                </div>
                <AdmButton variant="secondary" size="md" icon="mail" disabled={resetSent} onClick={()=>setResetSent(true)}>Invia email di reset</AdmButton>
              </div>
            </AdmCard>

            {/* Zona sensibile — volutamente sobria e in fondo */}
            <div style={{display:'flex', alignItems:'center', gap:10, padding:'4px 6px 10px'}}>
              <span style={{fontSize:12, color:ADM.MUTED_SOFT, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em'}}>Zona sensibile</span>
              <div style={{flex:1, height:1, background:ADM.BORDER_SOFT}}/>
              <button className="adm-textlink" onClick={()=>setBanPopup(shadow ? 'unshadow' : 'shadow')} style={{
                background:'transparent', border:'none', color: shadow ? ADM.MUTED : ADM.WARN, fontSize:12.5, fontWeight:600,
                cursor:'pointer', fontFamily:'inherit', textDecoration:'underline', textUnderlineOffset:3,
              }}>{shadow ? 'Rimuovi shadowban…' : 'Shadowban…'}</button>
              <button className="adm-textlink" onClick={()=>setBanPopup(banned ? 'unban' : 'ban')} style={{
                background:'transparent', border:'none', color: banned ? ADM.MUTED : ADM.DANGER, fontSize:12.5, fontWeight:600,
                cursor:'pointer', fontFamily:'inherit', textDecoration:'underline', textUnderlineOffset:3,
              }}>{banned ? 'Rimuovi ban…' : 'Banna utente…'}</button>
              <button className="adm-textlink" onClick={()=>setDeletePopup(true)} style={{
                background:'transparent', border:'none', color:ADM.DANGER, fontSize:12.5, fontWeight:600,
                cursor:'pointer', fontFamily:'inherit', textDecoration:'underline', textUnderlineOffset:3,
              }}>Elimina account…</button>
            </div>
          </div>
        )}

        {/* ═══ TAB STATISTICHE — le abitudini d'uso della piattaforma ═══ */}
        {tab === 'statistiche' && (
          <div style={{flex:1, overflow:'auto', padding:'20px 24px', display:'flex', flexDirection:'column', gap:14, background:ADM.PANEL_SOFT}}>
            {/* Quanto sta nell'app e con che ritmo torna: il tempo di una
                sessione e le sessioni sui cinque orizzonti, divise da un
                unico numero annuale perché stiano in colonna tra loro. */}
            <AdmCard padding={0}>
              <div style={{padding:'16px 20px 4px'}}>
                <div style={{fontSize:14.4, fontWeight:600, color:ADM.TEXT}}>Abitudini di utilizzo</div>
                <div style={{fontSize:13, color:ADM.MUTED, marginTop:2}}>Quanto sta nell'app e con che ritmo ci torna.</div>
              </div>
              <div style={{display:'grid', gridTemplateColumns:'repeat(3, minmax(0,1fr))'}}>
                <MiniStat first label="Tempo medio di utilizzo" value={utnDurata(tempoSessione)} sub="Per sessione"/>
                <MiniStat label="Sessioni settimanali" value={fmtNum(sessioni.settimana)} sub="Media a settimana"/>
                <MiniStat label="Sessioni mensili" value={fmtNum(sessioni.mese)} sub="Media al mese"/>
              </div>
              <div style={{display:'grid', gridTemplateColumns:'repeat(3, minmax(0,1fr))', borderTop:`1px solid ${ADM.BORDER_SOFT}`}}>
                <MiniStat first label="Sessioni trimestrali" value={fmtNum(sessioni.trimestre)} sub="Media a trimestre"/>
                <MiniStat label="Sessioni semestrali" value={fmtNum(sessioni.semestre)} sub="Media a semestre"/>
                <MiniStat label="Sessioni annuali" value={fmtNum(sessioni.anno)} sub="Ultimi 12 mesi"/>
              </div>
            </AdmCard>

            {/* La spesa: la media al centesimo, col totale accanto che le fa
                da ancora — una media da sola non dice se pesa. I numeri sono
                quelli veri del dataset (spesa totale / ordini totali). */}
            <AdmCard padding={0}>
              <div style={{padding:'16px 20px 4px'}}>
                <div style={{fontSize:14.4, fontWeight:600, color:ADM.TEXT}}>Spesa</div>
                <div style={{fontSize:13, color:ADM.MUTED, marginTop:2}}>Quanto vale, in media, un suo ordine.</div>
              </div>
              <div style={{display:'grid', gridTemplateColumns:'repeat(2, minmax(0,1fr))'}}>
                <MiniStat first label="Spesa media" value={utnEur2(u.ordini ? u.spesaTotale / u.ordini : null)} sub="Per ordine pagato in app"/>
                <MiniStat label="Spesa totale" value={fmtEur(u.spesaTotale)} sub={`${fmtNum(u.ordini)} ordini dall'iscrizione`}/>
              </div>
            </AdmCard>

            {/* Le prenotazioni: quante in un anno, con che ritmo, e quante
                volte ha prenotato senza presentarsi. */}
            <AdmCard padding={0}>
              <div style={{padding:'16px 20px 4px'}}>
                <div style={{fontSize:14.4, fontWeight:600, color:ADM.TEXT}}>Prenotazioni</div>
                <div style={{fontSize:13, color:ADM.MUTED, marginTop:2}}>Quanto prenota, e quanto ci si può contare.</div>
              </div>
              <div style={{display:'grid', gridTemplateColumns:'repeat(3, minmax(0,1fr))'}}>
                <MiniStat first label="Prenotazioni annue" value={fmtNum(prenAnno)} sub="Ultimi 12 mesi"/>
                <MiniStat label="Media mensile" value={String(prenMese).replace('.', ',')} sub="Prenotazioni al mese"/>
                <MiniStat label="Tasso di no show" value={noShow == null ? '—' : noShow + '%'} sub="Prenotazioni non onorate"/>
              </div>
            </AdmCard>

            {/* I tempi dentro i tre flussi principali: quanto ci mette a
                mandare un ordine, a pagarlo, a prendere una prenotazione. */}
            <AdmCard padding={0}>
              <div style={{padding:'16px 20px 4px'}}>
                <div style={{fontSize:14.4, fontWeight:600, color:ADM.TEXT}}>Tempi medi</div>
                <div style={{fontSize:13, color:ADM.MUTED, marginTop:2}}>Quanto ci mette, in media, dentro i tre flussi principali.</div>
              </div>
              <div style={{display:'grid', gridTemplateColumns:'repeat(3, minmax(0,1fr))'}}>
                <MiniStat first label="Ordine inviato" value={utnDurata(tempoOrdine)} sub="Dal menu aperto all'invio"/>
                <MiniStat label="Pagamento dopo l'ordine" value={utnDurata(tempoPagamento)} sub="Dall'ordine al conto pagato"/>
                <MiniStat label="Prenotazione presa" value={utnDurata(tempoPrenotazione)} sub="Dentro una sessione"/>
              </div>
            </AdmCard>

            {/* I referral: quanti inviti ha mandato, a chi, e quanti sono
                diventati qualcosa. */}
            <AdmCard padding={0}>
              <div style={{padding:'16px 20px 4px'}}>
                <div style={{fontSize:14.4, fontWeight:600, color:ADM.TEXT}}>Referral</div>
                <div style={{fontSize:13, color:ADM.MUTED, marginTop:2}}>Gli inviti che ha mandato e quanti sono stati riscattati.</div>
              </div>
              <div style={{display:'grid', gridTemplateColumns:'repeat(4, minmax(0,1fr))'}}>
                <MiniStat first label="Inviati a ristoranti" value={fmtNum(refLocali)} sub="Locali invitati su byup"/>
                <MiniStat label="Inviati a utenti" value={fmtNum(refUtenti)} sub="Amici invitati in app"/>
                <MiniStat label="Riscattati" value={fmtNum(refRiscattati)} sub={`Su ${fmtNum(refTotali)} inviati`}/>
                <MiniStat label="Conversione" value={refConversione == null ? '—' : refConversione + '%'} sub="Riscattati su inviati"/>
              </div>
            </AdmCard>

            {/* Il dato alimentare si guarda SOLO col consenso A3: senza,
                la card non dice «niente allergie» — dice che non si guarda.
                È la differenza tra un dato assente e un dato non nostro. */}
            <AdmCard padding={20}>
              <div style={{display:'flex', alignItems:'center', gap:8}}>
                <div style={{fontSize:14.4, fontWeight:600, color:ADM.TEXT}}>Preferenze alimentari</div>
                <span style={{fontFamily:'ui-monospace,monospace', fontSize:11.5, fontWeight:700, padding:'2px 7px', borderRadius:5, background: consensoA3.ok ? ADM.OK_SOFT : ADM.NEUTRAL_SOFT, color: consensoA3.ok ? ADM.OK : ADM.MUTED}}>A3 {consensoA3.ok ? '✓' : '—'}</span>
              </div>
              {consensoA3.ok ? (
                <React.Fragment>
                  <div style={{fontSize:13, color:ADM.MUTED, marginTop:3, marginBottom:14}}>Quello che ha attivato nel profilo, col consenso al trattamento del dato.</div>
                  <div style={{display:'flex', alignItems:'baseline', gap:10, marginBottom:10}}>
                    <span style={{width:70, flexShrink:0, fontSize:11.5, color:ADM.MUTED, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em'}}>Dieta</span>
                    {dieta
                      ? <span style={{padding:'3px 10px', borderRadius:999, background:ADM.OK_SOFT, color:ADM.OK, fontSize:13, fontWeight:700}}>{dieta}</span>
                      : <span style={{fontSize:13.5, color:ADM.MUTED_LIGHT}}>Nessuna dieta attiva</span>}
                  </div>
                  <div style={{display:'flex', alignItems:'baseline', gap:10}}>
                    <span style={{width:70, flexShrink:0, fontSize:11.5, color:ADM.MUTED, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em'}}>Allergie</span>
                    {allergie.length
                      ? <div style={{display:'flex', flexWrap:'wrap', gap:6}}>
                          {allergie.map(a => <span key={a} style={{padding:'3px 10px', borderRadius:999, background:ADM.WARN_SOFT, color:'#92400E', fontSize:13, fontWeight:700}}>{a}</span>)}
                        </div>
                      : <span style={{fontSize:13.5, color:ADM.MUTED_LIGHT}}>Nessuna allergia attiva</span>}
                  </div>
                </React.Fragment>
              ) : (
                <div style={{fontSize:13.5, color:ADM.MUTED, marginTop:8, lineHeight:1.5}}>
                  Non ha espresso il consenso al salvataggio delle preferenze alimentari (A3):
                  il dato non si raccoglie e non si mostra. Lo stato del consenso è nella tab Consensi.
                </div>
              )}
            </AdmCard>
          </div>
        )}

        {/* ═══ TAB CONSENSI — a cosa ha detto sì, e su quale documento ═══ */}
        {tab === 'consensi' && (
          <div style={{flex:1, overflow:'auto', padding:'20px 24px', display:'flex', flexDirection:'column', gap:14, background:ADM.PANEL_SOFT}}>
            {/* Lo stato corrente per codice. La PROVA non è questa: è il log
                append-only consent_data, riga per riga nella tab Log. */}
            <AdmCard padding={0}>
              <div style={{padding:'16px 20px 12px', borderBottom:`1px solid ${ADM.BORDER}`}}>
                <div style={{fontSize:14.4, fontWeight:600, color:ADM.TEXT}}>Consensi espressi</div>
                <div style={{fontSize:13, color:ADM.MUTED, marginTop:2}}>Lo stato corrente per ciascun codice. La prova è il log consent_data: ogni cambio è una riga nella tab Log.</div>
              </div>
              {consensi.map((c, i) => (
                <div key={c.id} style={{display:'flex', alignItems:'center', gap:12, padding:'12px 20px', borderBottom:`1px solid ${ADM.BORDER_SOFT}`}}>
                  <span style={{fontFamily:'ui-monospace,monospace', fontSize:12.5, fontWeight:700, color:ADM.TEXT, width:34, flexShrink:0}}>{c.id}</span>
                  <div style={{flex:1, minWidth:0}}>
                    <div style={{fontSize:13.8, fontWeight:600, color:ADM.TEXT}}>{c.label}</div>
                    <div style={{fontSize:12.8, color:ADM.MUTED, marginTop:1}}>{c.desc}</div>
                  </div>
                  <div style={{textAlign:'right', flexShrink:0}}>
                    {c.deciso
                      ? <span style={{padding:'3px 10px', borderRadius:5, background: c.ok ? ADM.OK_SOFT : ADM.NEUTRAL_SOFT, color: c.ok ? ADM.OK : ADM.MUTED, fontSize:13, fontWeight:700}}>{c.ok ? 'Sì' : 'No'}</span>
                      : <span style={{padding:'3px 10px', borderRadius:5, background:ADM.NEUTRAL_SOFT, color:ADM.MUTED_SOFT, fontSize:13, fontWeight:700}}>Mai chiesto</span>}
                    {c.deciso && <div style={{fontSize:12, color:ADM.MUTED, marginTop:3}}>{fmtDate(c.quando)} · Informativa v{c.versione}</div>}
                  </div>
                </div>
              ))}
              <div style={{padding:'11px 20px', fontSize:12.5, color:ADM.MUTED_SOFT, lineHeight:1.5}}>
                Suggerimenti in-app e analisi d'uso corrono su legittimo interesse: nessun toggle
                — l'opposizione passa dall'assistenza e si registra lato backend.
              </div>
            </AdmCard>

            {/* I documenti: le versioni contro cui i consensi valgono. I
                Termini non sono un consenso — sono il contratto — ma è qui
                che si viene a cercare che cosa ha firmato. */}
            <AdmCard padding={0}>
              <div style={{padding:'16px 20px 12px', borderBottom:`1px solid ${ADM.BORDER}`}}>
                <div style={{fontSize:14.4, fontWeight:600, color:ADM.TEXT}}>Documenti sottoscritti</div>
                <div style={{fontSize:13, color:ADM.MUTED, marginTop:2}}>Le versioni contro cui valgono i consensi qui sopra.</div>
              </div>
              {[
                { nome: 'Informativa privacy', versione: '1.0', nota: 'Presa visione alla registrazione · è la versione scritta accanto a ogni consenso', rif: consensi.filter(c => c.deciso).map(c => c.id).join(', ') || '—' },
                { nome: 'Termini e condizioni', versione: '1.0', nota: 'Accettati alla registrazione · base contrattuale, non un consenso', rif: 'Contratto' },
              ].map((d, i, arr) => (
                <div key={d.nome} style={{display:'flex', alignItems:'center', gap:12, padding:'12px 20px', borderBottom: i === arr.length - 1 ? 'none' : `1px solid ${ADM.BORDER_SOFT}`}}>
                  <div style={{width:34, height:34, borderRadius:8, background:ADM.PINK_SOFT, color:ADM.PINK, display:'grid', placeItems:'center', flexShrink:0}}>
                    <BuIcons.filePdf size={18}/>
                  </div>
                  <div style={{flex:1, minWidth:0}}>
                    <div style={{fontSize:13.8, fontWeight:600, color:ADM.TEXT}}>{d.nome} <span style={{fontFamily:'ui-monospace,monospace', fontSize:12, color:ADM.MUTED, fontWeight:600}}>v{d.versione}</span></div>
                    <div style={{fontSize:12.8, color:ADM.MUTED, marginTop:1}}>{d.nota}</div>
                  </div>
                  <div style={{textAlign:'right', flexShrink:0}}>
                    <div style={{fontSize:12.6, color:ADM.MUTED}}>{fmtDate(u.dataRegistrazione)}</div>
                    <div style={{fontFamily:'ui-monospace,monospace', fontSize:11.5, color:ADM.MUTED_SOFT, marginTop:2}}>{d.rif}</div>
                  </div>
                </div>
              ))}
            </AdmCard>
          </div>
        )}

        {/* ═══ TAB LOG — gli eventi che l'app emette ═══ */}
        {tab === 'log' && (
          <div style={{flex:1, overflow:'auto', padding:'20px 24px', display:'flex', flexDirection:'column', gap:14, background:ADM.PANEL_SOFT}}>
            {/* L'inquadratura del tracciato: da quando esiste l'account e
                quando si è visto l'ultima volta. Stava nella tab delle spese;
                è attività, e l'attività ora vive qui. */}
            <AdmCard padding={20}>
              <div style={{fontSize:14.4, fontWeight:600, color:ADM.TEXT, marginBottom:14}}>Attività account</div>
              <DataRow label="Registrato il" value={fmtDate(u.dataRegistrazione)}/>
              <DataRow label="Ultima sessione" value={fmtRelative(u.lastSession)} last/>
            </AdmCard>

            {/* Il log così come arriva dal tracking: un evento per riga, la
                chiave tecnica in chiaro accanto al racconto — è la stessa
                che si ritrova negli export e in Analisi Dati. Nessun
                riassunto: la risposta a «che cosa ha fatto in app?» sono gli
                eventi stessi, dal più recente. Niente icone: è un log, e un
                log si scandisce per testo e data, non per figurine. */}
            <AdmCard padding={0}>
              <div style={{padding:'14px 20px', borderBottom:`1px solid ${ADM.BORDER}`, display:'flex', alignItems:'center', gap:10, flexWrap:'wrap'}}>
                <div style={{fontSize:14.4, fontWeight:600, color:ADM.TEXT}}>Eventi tracciati</div>
                <div style={{fontSize:13, color:ADM.MUTED}}>
                  {(logDal || logAl) ? `${eventiFiltrati.length} di ${eventi.length}` : `${eventi.length} eventi dal ${fmtDate(eventi[eventi.length - 1].quando)}`}
                </div>
                <div style={{flex:1}}/>
                {/* Il filtro per data: due estremi, entrambi facoltativi. */}
                <span style={{fontSize:11.5, color:ADM.MUTED, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em'}}>Dal</span>
                <input type="date" value={logDal} onChange={e=>setLogDal(e.target.value)} style={{
                  padding:'6px 9px', border:`1px solid ${ADM.BORDER}`, borderRadius:7,
                  fontSize:12.8, fontFamily:'inherit', color:ADM.TEXT, background:'#fff', outline:'none',
                }}/>
                <span style={{fontSize:11.5, color:ADM.MUTED, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em'}}>Al</span>
                <input type="date" value={logAl} onChange={e=>setLogAl(e.target.value)} style={{
                  padding:'6px 9px', border:`1px solid ${ADM.BORDER}`, borderRadius:7,
                  fontSize:12.8, fontFamily:'inherit', color:ADM.TEXT, background:'#fff', outline:'none',
                }}/>
                {(logDal || logAl) && (
                  <button className="adm-textlink" onClick={()=>{ setLogDal(''); setLogAl(''); }} style={{
                    background:'transparent', border:'none', color:ADM.PINK_DARK, fontSize:12.5, fontWeight:700,
                    cursor:'pointer', fontFamily:'inherit', textDecoration:'underline', textUnderlineOffset:3,
                  }}>Azzera</button>
                )}
              </div>
              {eventiFiltrati.length === 0 && (
                <div style={{padding:'26px 0', textAlign:'center', fontSize:13.5, color:ADM.MUTED}}>
                  Nessun evento tra le date scelte.
                </div>
              )}
              {eventiFiltrati.map((e, i) => (
                <div key={e.id} style={{
                  display:'flex', alignItems:'center', gap:12, padding:'11px 20px',
                  borderBottom: i === eventiFiltrati.length - 1 ? 'none' : `1px solid ${ADM.BORDER_SOFT}`,
                  background: i % 2 === 1 ? ADM.ROW_STRIPE : 'transparent',
                }}>
                  <div style={{flex:1, minWidth:0}}>
                    <div style={{fontSize:13.8, fontWeight:600, color:ADM.TEXT}}>{UTN_EVENTI[e.tipo].label}</div>
                    <div style={{fontSize:12.8, color:ADM.MUTED, marginTop:1, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{e.dettaglio}</div>
                  </div>
                  <div style={{textAlign:'right', flexShrink:0}}>
                    <div style={{fontFamily:'ui-monospace,monospace', fontSize:11.5, color:ADM.MUTED_SOFT}}>{e.tipo}</div>
                    <div style={{fontSize:12.6, color:ADM.MUTED, marginTop:2}}>{fmtDateTime(e.quando)}</div>
                  </div>
                </div>
              ))}
            </AdmCard>
          </div>
        )}

        {/* ═══ TAB RECENSIONI ═══ */}
        {tab === 'recensioni' && (
          <div style={{flex:1, overflow:'auto', padding:'20px 24px', display:'flex', flexDirection:'column', gap:12, background:ADM.PANEL_SOFT}}>
            {shadow && (
              <div style={{padding:'11px 14px', background:'#FFF7E6', border:'1px solid #FDE68A', borderRadius:10, fontSize:13, color:'#78350F', display:'flex', alignItems:'center', gap:8}}>
                <BuIcons.shield size={17}/>
                <span><strong>Shadowban attivo</strong> — queste recensioni sono visibili solo all'utente, non compaiono sulle schede dei locali.</span>
              </div>
            )}
            {recensioni.map(r => (
              <AdmCard key={r.id} padding={16}>
                <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:9, flexWrap:'wrap'}}>
                  <div style={{minWidth:0}}>
                    <div style={{fontSize:14, fontWeight:700, color:ADM.TEXT}}>{r.locale.nome}</div>
                    <div style={{fontSize:12.3, color:ADM.MUTED}}>{r.locale.citta} · {fmtDate(r.data)}</div>
                  </div>
                  <div style={{flex:1}}/>
                  <span style={{fontSize:14.4, letterSpacing:1, color:'#F5A623'}}>{'★'.repeat(r.rating)}<span style={{color:ADM.BORDER}}>{'★'.repeat(5 - r.rating)}</span></span>
                  {!r.rimossa && (
                    <button className="adm-textlink" onClick={()=>{ setRevPopup(r); setRevMotivo(''); }} style={{
                      background:'transparent', border:'none', color:ADM.DANGER, fontSize:12.5, fontWeight:600,
                      cursor:'pointer', fontFamily:'inherit', textDecoration:'underline', textUnderlineOffset:3,
                    }}>Rimuovi…</button>
                  )}
                </div>
                {r.rimossa ? (
                  <div style={{padding:'10px 13px', background:ADM.DANGER_SOFT, borderRadius:8, fontSize:13, color:'#7F1D1D', display:'flex', alignItems:'center', gap:8}}>
                    <BuIcons.x size={16}/>
                    <span><strong>Recensione rimossa</strong> · “{r.rimossa}” · registrata nell'audit log</span>
                  </div>
                ) : (
                  <div style={{padding:'10px 13px', background:ADM.PANEL_SOFT, borderLeft:`3px solid ${ADM.INK_SOFT}`, borderRadius:'0 8px 8px 0', fontSize:13.5, color:ADM.TEXT, lineHeight:1.5, fontStyle:'italic'}}>
                    “{r.testo}”
                  </div>
                )}
              </AdmCard>
            ))}
            {recensioni.length === 0 && (
              <div style={{padding:'30px 0', textAlign:'center', fontSize:13.5, color:ADM.MUTED}}>Nessuna recensione pubblicata da questo utente.</div>
            )}
          </div>
        )}

        {/* ═══ Popup conferma: rimozione recensione ═══ */}
        {revPopup && (
          <div style={{position:'fixed', inset:0, zIndex:20, display:'grid', placeItems:'center', padding:24, background:'rgba(15,17,21,0.35)'}} onClick={()=>setRevPopup(null)}>
            <div onClick={e=>e.stopPropagation()} style={{width:430, maxWidth:'90%', background:'#fff', borderRadius:14, padding:'20px 22px', boxShadow:'0 24px 64px rgba(15,17,21,0.30)', animation:'admModalIn 0.18s ease'}}>
              <div style={{fontSize:15.5, fontWeight:700, color:ADM.TEXT, marginBottom:4}}>Rimuovere la recensione su {revPopup.locale.nome}?</div>
              <div style={{fontSize:13, color:ADM.MUTED, lineHeight:1.5, marginBottom:12}}>La recensione sparisce dalla scheda del locale. {form.nome} riceve una notifica con il motivo. L'azione viene registrata nell'audit log.</div>
              <textarea autoFocus value={revMotivo} onChange={e=>setRevMotivo(e.target.value)} placeholder="Motivo della rimozione (obbligatorio) — es. viola le linee guida della community"
                style={{width:'100%', minHeight:74, padding:'9px 12px', border:`1px solid ${ADM.BORDER}`, borderRadius:8, fontSize:13.3, fontFamily:'inherit', outline:'none', resize:'vertical', boxSizing:'border-box', marginBottom:12}}/>
              <div style={{display:'flex', justifyContent:'flex-end', gap:8}}>
                <AdmButton variant="ghost" size="md" onClick={()=>setRevPopup(null)}>Annulla</AdmButton>
                <AdmButton variant="danger" size="md" icon="x" disabled={!revMotivo.trim()} onClick={confirmRimuoviRev}>Rimuovi recensione</AdmButton>
              </div>
            </div>
          </div>
        )}

        {/* ═══ Popup conferma: carica / storna byuppini ═══ */}
        {byupPopup && (
          <div style={{position:'fixed', inset:0, zIndex:20, display:'grid', placeItems:'center', padding:24, background:'rgba(15,17,21,0.35)'}} onClick={()=>setByupPopup(null)}>
            <div onClick={e=>e.stopPropagation()} style={{width:380, maxWidth:'90%', background:'#fff', borderRadius:14, padding:'20px 22px', boxShadow:'0 24px 64px rgba(15,17,21,0.30)', animation:'admModalIn 0.18s ease'}}>
              <div style={{fontSize:15.5, fontWeight:700, color:ADM.TEXT, marginBottom:4}}>{byupPopup === 'sub' ? 'Storna byuppini' : 'Carica byuppini'}</div>
              <div style={{fontSize:13, color:ADM.MUTED, marginBottom:14}}>
                {byupPopup === 'sub' ? 'Storno manuale dal saldo di ' : 'Accredito manuale sul saldo di '}{form.nome} (attuale: <strong style={{color:ADM.TEXT}}>{fmtNum(u.byuppini)}</strong>)
              </div>
              <label style={labelStyle}>{byupPopup === 'sub' ? 'Quantità da stornare' : 'Quantità da accreditare'}</label>
              <input type="number" min="1" max={byupPopup === 'sub' ? u.byuppini : undefined} autoFocus value={byupAmount} onChange={e=>setByupAmount(e.target.value)}
                onKeyDown={e=>{ if (e.key === 'Enter') confirmByup(); }}
                placeholder="Es. 100" style={{...inputStyle, marginBottom: byupPopup === 'sub' && byupN > u.byuppini ? 6 : 14}}/>
              {byupPopup === 'sub' && byupN > u.byuppini && (
                <div style={{fontSize:12.5, color:ADM.DANGER, fontWeight:600, marginBottom:10}}>Massimo stornabile: {fmtNum(u.byuppini)} (il saldo non può andare sotto zero)</div>
              )}
              <div style={{display:'flex', justifyContent:'flex-end', gap:8}}>
                <AdmButton variant="ghost" size="md" onClick={()=>{ setByupPopup(null); setByupAmount(''); }}>Annulla</AdmButton>
                {byupPopup === 'sub'
                  ? <AdmButton variant="danger" size="md" icon="x" disabled={!byupValid} onClick={confirmByup}>Conferma storno</AdmButton>
                  : <AdmButton variant="primary" size="md" icon="check" disabled={!byupValid} onClick={confirmByup}>Conferma accredito</AdmButton>}
              </div>
            </div>
          </div>
        )}

        {/* ═══ Popup conferma: ban / rimozione ban ═══ */}
        {banPopup && (
          <div style={{position:'fixed', inset:0, zIndex:20, display:'grid', placeItems:'center', padding:24, background:'rgba(15,17,21,0.35)'}} onClick={()=>setBanPopup(null)}>
            <div onClick={e=>e.stopPropagation()} style={{width:410, maxWidth:'90%', background:'#fff', borderRadius:14, padding:'20px 22px', boxShadow:'0 24px 64px rgba(15,17,21,0.30)', animation:'admModalIn 0.18s ease'}}>
              {banPopup === 'shadow' ? (<>
                <div style={{fontSize:15.5, fontWeight:700, color:ADM.TEXT, marginBottom:4}}>Shadowban per {form.nome}?</div>
                <div style={{fontSize:13, color:ADM.MUTED, lineHeight:1.5, marginBottom:16}}>
                  Le sue recensioni diventano <strong>invisibili a tutti tranne che a lui</strong>: non riceve notifiche e non se ne accorge. Reversibile in qualsiasi momento. L'azione viene registrata nell'audit log.
                </div>
                <div style={{display:'flex', justifyContent:'flex-end', gap:8}}>
                  <AdmButton variant="ghost" size="md" onClick={()=>setBanPopup(null)}>Annulla</AdmButton>
                  <AdmButton variant="primary" size="md" icon="shield" onClick={confirmBan}>Attiva shadowban</AdmButton>
                </div>
              </>) : banPopup === 'unshadow' ? (<>
                <div style={{fontSize:15.5, fontWeight:700, color:ADM.TEXT, marginBottom:4}}>Rimuovere lo shadowban a {form.nome}?</div>
                <div style={{fontSize:13, color:ADM.MUTED, lineHeight:1.5, marginBottom:16}}>
                  Le sue recensioni tornano visibili a tutti. Anche questa azione viene registrata nell'audit log.
                </div>
                <div style={{display:'flex', justifyContent:'flex-end', gap:8}}>
                  <AdmButton variant="ghost" size="md" onClick={()=>setBanPopup(null)}>Annulla</AdmButton>
                  <AdmButton variant="primary" size="md" icon="check" onClick={confirmBan}>Rimuovi shadowban</AdmButton>
                </div>
              </>) : banPopup === 'ban' ? (<>
                <div style={{fontSize:15.5, fontWeight:700, color:ADM.TEXT, marginBottom:4}}>Bannare {form.nome}?</div>
                <div style={{fontSize:13, color:ADM.MUTED, lineHeight:1.5, marginBottom:16}}>
                  L'account <strong style={{fontFamily:'ui-monospace,monospace'}}>{u.id}</strong> viene <strong style={{color:ADM.DANGER}}>bloccato</strong>: niente più accesso all'app, ordini, prenotazioni o recensioni. L'azione è reversibile e viene registrata nell'audit log.
                </div>
                <div style={{display:'flex', justifyContent:'flex-end', gap:8}}>
                  <AdmButton variant="ghost" size="md" onClick={()=>setBanPopup(null)}>Annulla</AdmButton>
                  <AdmButton variant="danger" size="md" icon="lock" onClick={confirmBan}>Banna utente</AdmButton>
                </div>
              </>) : (<>
                <div style={{fontSize:15.5, fontWeight:700, color:ADM.TEXT, marginBottom:4}}>Rimuovere il ban a {form.nome}?</div>
                <div style={{fontSize:13, color:ADM.MUTED, lineHeight:1.5, marginBottom:16}}>
                  L'account torna pienamente operativo: accesso, ordini e recensioni. Anche questa azione viene registrata nell'audit log.
                </div>
                <div style={{display:'flex', justifyContent:'flex-end', gap:8}}>
                  <AdmButton variant="ghost" size="md" onClick={()=>setBanPopup(null)}>Annulla</AdmButton>
                  <AdmButton variant="primary" size="md" icon="check" onClick={confirmBan}>Rimuovi ban</AdmButton>
                </div>
              </>)}
            </div>
          </div>
        )}

        {/* ═══ Popup conferma: eliminazione account ═══ */}
        {deletePopup && (
          <div style={{position:'fixed', inset:0, zIndex:20, display:'grid', placeItems:'center', padding:24, background:'rgba(15,17,21,0.35)'}} onClick={()=>setDeletePopup(false)}>
            <div onClick={e=>e.stopPropagation()} style={{width:400, maxWidth:'90%', background:'#fff', borderRadius:14, padding:'20px 22px', boxShadow:'0 24px 64px rgba(15,17,21,0.30)', animation:'admModalIn 0.18s ease'}}>
              <div style={{fontSize:15.5, fontWeight:700, color:ADM.TEXT, marginBottom:4}}>Eliminare l'account di {form.nome}?</div>
              <div style={{fontSize:13, color:ADM.MUTED, lineHeight:1.5, marginBottom:16}}>
                L'account <strong style={{fontFamily:'ui-monospace,monospace'}}>{u.id}</strong> e tutti i suoi dati (ordini, byuppini, preferenze) verranno rimossi in modo <strong style={{color:ADM.DANGER}}>irreversibile</strong>.
              </div>
              <div style={{display:'flex', justifyContent:'flex-end', gap:8}}>
                <AdmButton variant="ghost" size="md" onClick={()=>setDeletePopup(false)}>Annulla</AdmButton>
                <AdmButton variant="danger" size="md" icon="x" onClick={()=>{ setDeletePopup(false); onClose(); }}>Elimina definitivamente</AdmButton>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

window.AdmUtentiPage = AdmUtentiPage;
