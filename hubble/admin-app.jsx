// Hubble — shell principale con sidebar e router
//
// La console si chiamava «byup Spot». Il nome è cambiato, ma soprattutto è
// cambiato il mestiere: non è più solo il posto da cui si guardano i numeri e
// si risponde ai ticket, è il CRM con cui si parla ai locali e agli utenti. La
// nav lo dice: prima la panoramica, poi i contatti, poi quello che si fa ai
// contatti (marketing, workflow, agenti), e in fondo l'assistenza.

const { useState: useStateApp } = React;

// ─── La nav ─────────────────────────────────────────────────────────────────
// Alcune voci hanno dei FIGLI. Passandoci sopra si apre un pannello a fianco
// con le sotto-sezioni, ciascuna con la sua riga di spiegazione: «Elenchi» da
// solo non dice se sono cartelle o segmenti, e una voce di menu che va provata
// per capire cosa fa è una voce di menu scritta male.
// Cliccando la voce madre si va comunque alla prima figlia — il flyout è una
// scorciatoia, non un pedaggio.
const HUB_NAV = [
  { id: 'dashboard', label: 'Analisi Dati', icon: 'chartFill',
    desc: 'Sette letture: locali, valore, utenti, mercato' },
  // Una voce sola per l'anagrafe. Locali, Staff e Utenti App erano tre liste
  // separate, ma chi amministra cerca UNA persona — «di chi è questa mail?» —
  // e non deve sapere in anticipo in quale delle tre vive.
  // Proprietà non è più una figlia: la stessa pagina vive già nel menu del
  // profilo insieme al resto della governance, e due ingressi per la stessa
  // sezione sono un ingresso di troppo.
  { id: 'contatti', label: 'Contatti', icon: 'staffFill', colore: 'PINK',
    figli: [
      { id: 'contatti',  label: 'Contatti',  icon: 'staffFill', desc: 'La rubrica: locali, staff e utenti app insieme' },
      { id: 'elenchi',   label: 'Elenchi',   icon: 'listFill',  desc: 'Segmenti che si aggiornano da soli e liste fisse' },
    ] },
  // «Promozioni» era una sezione sola con tre tab dentro. Ora i canali sono
  // quattro e ognuno ha il suo storico, le sue statistiche e il suo modo di
  // costruire un materiale: stanno a pari livello, non annidati in una tendina.
  { id: 'marketing', label: 'Marketing', icon: 'megaphoneFill', colore: 'HUB_MAGENTA',
    figli: [
      { id: 'mkt-mail', label: 'Mail',  icon: 'mailFill', desc: 'Campagne una tantum e modelli automatici' },
      { id: 'mkt-sms',  label: 'SMS',   icon: 'smsFill',  desc: 'Messaggi brevi, subito o programmati' },
      { id: 'mkt-push', label: 'Push',  icon: 'bellFill', desc: 'Notifiche nell\'app e nel gestionale' },
      { id: 'mkt-form', label: 'Form',  icon: 'formFill', desc: 'Moduli da pubblicare, con la loro automazione' },
    ] },
  { id: 'workflow', label: 'Workflow', icon: 'flowFill', colore: 'HUB_VIOLA',
    desc: 'Le automazioni: cosa succede, e quando' },
  { id: 'agent', label: 'Agent', icon: 'sparkFill', colore: 'HUB_VIOLA',
    desc: 'Agenti che lavorano sui tuoi dati mentre non guardi' },
  // Una voce sola per l'assistenza. Ticket e chiamate sono lo stesso lavoro
  // fatto su due canali. Il badge somma le due code leggendo le STESSE fonti
  // dei tab — i ticket aperti di COMUNICAZIONI, le chiamate in attesa — così
  // la sidebar non può dire un numero diverso dalla pagina che apre.
  { id: 'assistenza', label: 'Assistenza', icon: 'headsetFill',
    desc: 'Ticket, chiamate, FAQ e guide',
    badge: (COMUNICAZIONI.filter(c => c.stato === 'nuova' || c.stato === 'in_corso').length
          + RICHIAMATE.filter(r => r.stato === 'attesa').length) },
];

// Le voci di governance non stanno più nella barra: vivono nel menu del
// profilo, e da lì sono UNA voce — Impostazioni — distinta internamente in
// Sicurezza e sistemi, Proprietà, Domini e mittenti e Piattaforma. Quattro
// voci di menu per la stessa famiglia erano quattro ingressi da ricordare.
// Piattaforma dentro Impostazioni si vede solo perché chi guarda È il Super
// Admin: per chiunque altro non esiste, come non esiste nella matrice dei
// permessi.
const HUB_MENU_PROFILO = [
  { id: 'profilo',      label: 'Il mio profilo', icon: 'user',     desc: 'Password, 2FA, sessioni attive' },
  { id: 'impostazioni', label: 'Impostazioni',   icon: 'settings', desc: 'Sicurezza e sistemi, proprietà, domini e mittenti — e Piattaforma' },
];

// Le voci interne di Impostazioni. Le pagine restano quelle di prima: qui
// vive solo l'ingresso comune, e ognuna continua a presentarsi da sola.
const HUB_IMPOSTAZIONI_VOCI = [
  { id: 'sicurezza',   label: 'Sicurezza e sistemi' },
  { id: 'proprieta',   label: 'Proprietà' },
  { id: 'domini',      label: 'Domini e mittenti' },
  { id: 'piattaforma', label: 'Piattaforma' },
];

function ImpostazioniPage({ sub, teamTab }) {
  const [vista, setVista] = useStateApp(sub || 'sicurezza');
  // Un link esterno (⌘K, un avviso) può cambiare la parte interna mentre la
  // pagina è già montata: la prop comanda, lo stato segue.
  React.useEffect(() => { if (sub) setVista(sub); }, [sub]);
  return (
    <div style={{display:'flex', flexDirection:'column', minHeight:'100%'}}>
      <div style={{padding:'20px 28px 0', display:'flex', alignItems:'center', gap:14}}>
        <HubSegmenti attivo={vista} onCambia={setVista} voci={HUB_IMPOSTAZIONI_VOCI}/>
        <div style={{flex:1}}/>
        <span style={{display:'inline-flex', alignItems:'center', gap:6, fontSize:12.4, color:ADM.MUTED_SOFT, whiteSpace:'nowrap'}}>
          <BuIcons.lock size={13}/> Piattaforma è visibile solo a te (Super Admin)
        </span>
      </div>
      {vista === 'sicurezza'   && <AdmTeamPage search={''} initialTab={teamTab} sezione="sicurezza"/>}
      {vista === 'proprieta'   && <HubProprietaPage/>}
      {vista === 'domini'      && <HubDominiPage/>}
      {vista === 'piattaforma' && <AdmTeamPage search={''} initialTab={teamTab} sezione="impostazioni"/>}
    </div>
  );
}

// Nav item — attivo = fondo rosa tenue + testo/rosa, icona prominente.
// Con `figli`, il passaggio del mouse apre il pannello a fianco.
function AdmNavItem({ item, active, onClick, collapsed, onFly, flyAperto }) {
  const Icon = BuIcons[item.icon];
  const hasBadge = item.badge !== undefined && item.badge > 0;
  const acceso = active || flyAperto;
  return (
    <button onClick={onClick} className={`adm-nav-item${active ? ' is-active' : ''}`}
      title={collapsed ? item.label : undefined}
      onMouseEnter={(e) => onFly && onFly(item, e.currentTarget)}
      style={{
        position:'relative',
        width:'100%', display:'flex', alignItems:'center',
        gap: collapsed ? 0 : 12,
        justifyContent: collapsed ? 'center' : 'flex-start',
        padding: collapsed ? '9px' : '9px 10px',
        background: active ? ADM.PINK_SOFT : flyAperto ? 'rgba(0,0,0,0.04)' : 'transparent',
        color: active ? ADM.PINK_DARK : ADM.TEXT,
        border:'none', borderRadius:10,
        fontSize: 19.5,
        fontWeight: active ? 600 : 500,
        cursor:'pointer', fontFamily:'inherit', textAlign:'left',
      }}>
      <span style={{position:'relative', display:'inline-flex'}}>
        <Icon size={26} color={active ? ADM.PINK : ADM.MUTED}/>
        {collapsed && hasBadge && (
          <span style={{position:'absolute', top:-2, right:-3, width:8, height:8, borderRadius:'50%', background:ADM.PINK, boxShadow:'0 0 0 2px #F7F8FA'}}/>
        )}
      </span>
      {!collapsed && <span style={{flex:1}}>{item.label}</span>}
      {!collapsed && hasBadge && (
        <span style={{
          fontSize:12.5, fontWeight:700,
          background: ADM.PINK, color:'#fff',
          padding:'2px 7px', borderRadius:99, minWidth:18, textAlign:'center',
          boxShadow:'0 1px 2px rgba(0,0,0,0.10)',
        }}>{item.badge}</span>
      )}
      {/* Le voci con figli lo dichiarano: un chevron tenue che si accende. Un
          pannello che appare senza che niente lo annunciasse è un pannello che
          si scopre per caso. */}
      {!collapsed && item.figli && !hasBadge && (
        <span style={{display:'inline-flex', color: acceso ? ADM.PINK : ADM.MUTED_LIGHT, transition:'color 0.14s ease'}}>
          <BuIcons.chevronRight size={15}/>
        </span>
      )}
    </button>
  );
}

// Il pannello che si apre a fianco della voce. Una card per figlio: icona,
// nome e la riga che dice a cosa serve.
function HubFlyout({ voce, x, y, onVai, onEnter, onLeave, rotta }) {
  if (!voce || !voce.figli) return null;
  const tinta = ADM[voce.colore] || ADM.PINK;
  return (
    <div onMouseEnter={onEnter} onMouseLeave={onLeave}
      style={{
        position:'fixed', left:x, top:y, zIndex:150, width:322,
        background:'#fff', border:`1px solid ${ADM.BORDER}`, borderRadius:16,
        boxShadow:'0 28px 64px -18px rgba(15,17,21,0.30), 0 0 0 1px rgba(15,17,21,0.03)',
        padding:8, animation:'hubFlyIn 0.15s cubic-bezier(0.34,1.2,0.64,1)',
      }}>
      <div style={{
        padding:'8px 10px 9px', display:'flex', alignItems:'center', gap:8,
        borderBottom:`1px solid ${ADM.BORDER_SOFT}`, marginBottom:5,
      }}>
        <span style={{width:5, height:5, borderRadius:2, background:tinta}}/>
        <span style={{fontSize:11.2, fontWeight:800, letterSpacing:'0.09em', textTransform:'uppercase', color:ADM.MUTED_SOFT}}>{voce.label}</span>
      </div>
      {voce.figli.map(f => {
        const Icona = BuIcons[f.icon];
        const attiva = rotta === f.id;
        return (
          <button key={f.id} onClick={() => onVai(f.id)} className="adm-actionrow"
            style={{
              display:'flex', alignItems:'flex-start', gap:11, width:'100%', textAlign:'left',
              padding:'9px 10px', borderRadius:10, border:'none', cursor:'pointer', fontFamily:'inherit',
              background: attiva ? ADM.PINK_BG_SOFT : 'transparent',
            }}>
            <span style={{
              width:32, height:32, borderRadius:9, flexShrink:0, display:'grid', placeItems:'center',
              background: attiva ? ADM.PINK_SOFT : ADM.NEUTRAL_SOFT,
              color: attiva ? ADM.PINK : tinta,
            }}><Icona size={17}/></span>
            <span style={{flex:1, minWidth:0, paddingTop:1}}>
              <span style={{display:'block', fontSize:14.2, fontWeight:700, color: attiva ? ADM.PINK_DARK : ADM.TEXT, letterSpacing:'-0.01em'}}>{f.label}</span>
              <span style={{display:'block', fontSize:12.2, color:ADM.MUTED, marginTop:2, lineHeight:1.4}}>{f.desc}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ─── Ricerca globale (⌘K): locali, utenti, staff, ticket ───────────────────────────────
function GlobalSearch({ onClose, go }) {
  const [q, setQ] = useStateApp('');
  const query = q.trim().toLowerCase();
  const match = (...fields) => fields.some(x => String(x || '').toLowerCase().includes(query));
  const results = query.length < 2 ? [] : [
    { group:'Locali', icon:'storeFill', items: LOCALI.filter(l => match(l.nome, l.citta, l.id, l.titolare)).slice(0,5)
        .map(l => ({ key:l.id, title:l.nome, sub:`${l.tipo} · ${l.citta} · ${l.id}`, go:()=>go('locali',{openLocale:l}) })) },
    { group:'Utenti App', icon:'phoneFill', items: (window.UTENTI||[]).filter(u => match(u.nome, u.citta, u.id, u.email)).slice(0,5)
        .map(u => ({ key:u.id, title:u.nome, sub:`${u.citta} · ${u.id}`, go:()=>go('utenti',{openUtente:u}) })) },
    { group:'Utenti Staff', icon:'staffFill', items: (typeof STAFF !== 'undefined' ? STAFF : []).filter(st => match(st.nome, st.localeNome, st.id)).slice(0,5)
        .map(st => ({ key:st.id, title:st.nome, sub:`${st.localeNome} · ${st.id}`, go:()=>go('camerieri',{openStaff:st}) })) },
    { group:'Ticket', icon:'ticketFill', items: (typeof COMUNICAZIONI !== 'undefined' ? COMUNICAZIONI : []).filter(c => match(c.oggetto, c.senderName, c.id)).slice(0,5)
        .map(c => ({ key:c.id, title:c.oggetto, sub:`${c.senderName} · ${c.id}`, go:()=>go('comunicazioni',{openComm:c.id}) })) },
    // Il numero di telefono è indicizzato apposta: capita di avere il display
    // acceso con un numero che richiama e di dover capire chi è.
    { group:'Chiamate', icon:'headsetFill', items: RICHIAMATE.filter(r => match(r.localeNome, r.titolare, r.tel, r.problema, r.id)).slice(0,5)
        .map(r => ({ key:r.id, title:`${r.localeNome} · ${r.tel}`, sub:`${SRV_CATEGORIE[r.categoria].label} · ${r.id}`, go:()=>go('assistenza',{tab:'richiamate'}) })) },
    { group:'FAQ e guide', icon:'chatFill', items: [
        ...FAQ_SRV.filter(f => match(f.domanda, f.risposta, f.categoria)).slice(0,3)
          .map(f => ({ key:f.id, title:f.domanda, sub:`FAQ · ${f.categoria}`, go:()=>go('assistenza',{tab:'faq'}) })),
        ...GUIDE_SRV.filter(g => match(g.titolo, g.descrizione)).slice(0,3)
          .map(g => ({ key:g.id, title:g.titolo, sub:`Guida · ${(GUIDE_ARGOMENTI.find(a=>a.id===g.argomentoId)||{}).nome || '—'}`, go:()=>go('assistenza',{tab:'guide'}) })),
      ] },
  ].filter(g => g.items.length > 0);
  const flat = results.flatMap(g => g.items);
  return (
    <div onClick={onClose} style={{position:'fixed', inset:0, zIndex:90, background:'rgba(15,17,21,0.40)', backdropFilter:'blur(3px)', WebkitBackdropFilter:'blur(3px)', display:'flex', justifyContent:'center', alignItems:'flex-start', paddingTop:110}}>
      <div onClick={e=>e.stopPropagation()} style={{width:620, maxWidth:'92%', background:'#fff', borderRadius:16, boxShadow:'0 32px 80px rgba(15,17,21,0.35)', overflow:'hidden', animation:'admModalIn 0.18s ease'}}>
        <div style={{display:'flex', alignItems:'center', gap:10, padding:'14px 18px', borderBottom:`1px solid ${ADM.BORDER_SOFT}`}}>
          <BuIcons.search size={19} color={ADM.MUTED}/>
          <input autoFocus value={q} onChange={e=>setQ(e.target.value)}
            onKeyDown={e=>{ if (e.key === 'Enter' && flat[0]) { flat[0].go(); onClose(); } }}
            placeholder="Cerca locali, utenti, staff, ticket…"
            style={{flex:1, border:'none', outline:'none', fontSize:15.5, fontFamily:'inherit', color:ADM.TEXT, background:'transparent'}}/>
          <span style={{fontSize:11, fontWeight:700, background:ADM.PANEL_SOFT, border:`1px solid ${ADM.BORDER}`, borderRadius:5, padding:'2px 6px', color:ADM.MUTED_SOFT}}>ESC</span>
        </div>
        <div style={{maxHeight:420, overflowY:'auto'}}>
          {query.length < 2 && (
            <div style={{padding:'26px 18px', textAlign:'center', fontSize:13, color:ADM.MUTED}}>Digita almeno 2 caratteri · Invio apre il primo risultato</div>
          )}
          {query.length >= 2 && results.length === 0 && (
            <div style={{padding:'26px 18px', textAlign:'center', fontSize:13, color:ADM.MUTED}}>Nessun risultato per "{q}"</div>
          )}
          {results.map(g => {
            const GIcon = BuIcons[g.icon];
            return (
              <div key={g.group}>
                <div style={{padding:'9px 18px 5px', fontSize:11, fontWeight:700, color:ADM.MUTED_SOFT, textTransform:'uppercase', letterSpacing:'0.06em'}}>{g.group}</div>
                {g.items.map(it => (
                  <button key={it.key} className="adm-actionrow" onClick={()=>{ it.go(); onClose(); }} style={{
                    display:'flex', alignItems:'center', gap:11, width:'100%', textAlign:'left',
                    padding:'9px 18px', background:'transparent', border:'none', cursor:'pointer', fontFamily:'inherit',
                  }}>
                    <span style={{width:28, height:28, borderRadius:7, background:ADM.NEUTRAL_SOFT, color:ADM.NEUTRAL, display:'grid', placeItems:'center', flexShrink:0}}><GIcon size={15}/></span>
                    <span style={{flex:1, minWidth:0}}>
                      <span style={{display:'block', fontSize:14, fontWeight:600, color:ADM.TEXT, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{it.title}</span>
                      <span style={{display:'block', fontSize:12, color:ADM.MUTED, marginTop:1}}>{it.sub}</span>
                    </span>
                    <BuIcons.chevronRight size={14} color={ADM.MUTED_LIGHT}/>
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function AdminApp({ tweaks }) {
  const [route, setRouteRaw] = useStateApp('contatti');
  const [contattoOpen, setContattoOpen] = useStateApp(null); // {tipo, ref} → drawer in Contatti
  const [commOpen, setCommOpen] = useStateApp(null);
  const [assistenzaTab, setAssistenzaTab] = useStateApp(null); // tab di Chiamata assistenza (ricerca globale, Dashboard)
  const [teamTab, setTeamTab] = useStateApp(null);   // tab di Sicurezza/Piattaforma aperta da un link esterno
  const [impostazioniSub, setImpostazioniSub] = useStateApp('sicurezza'); // parte interna di Impostazioni
  const [searchOpen, setSearchOpen] = useStateApp(false);
  // Il flyout della nav: {voce, x, y}. Vive qui e non dentro la voce perché
  // deve stare SOPRA la sidebar (position:fixed), e una sidebar con
  // overflow:auto taglierebbe qualunque figlio che ne esce.
  const [fly, setFly] = useStateApp(null);
  const [menuProfilo, setMenuProfilo] = useStateApp(false);
  // «Esci da Hubble»: il logout è finto ma l'esito è vero — la shell sparisce
  // dietro un velo e si rientra da dove si entra sempre, la rubrica.
  const [uscito, setUscito] = useStateApp(false);
  // Il ritardo di chiusura: senza, il pannello sparisce nel millimetro di
  // vuoto tra la voce e la card, e non ci si arriva mai col mouse.
  const flyTimer = React.useRef(null);
  const apriFly = (voce, el) => {
    clearTimeout(flyTimer.current);
    if (!voce.figli) { setFly(null); return; }
    const r = el.getBoundingClientRect();
    // Il frame è scalato con `zoom`: i rect sono pixel VISIVI e il pannello,
    // essendo dentro lo stesso frame, li vuole di LAYOUT. Si divide per lo zoom.
    const z = (() => { const f = document.querySelector('.frame'); const v = f && parseFloat(f.style.zoom); return v > 0 ? v : 1; })();
    setFly({ voce, x: (r.right / z) + 8, y: Math.max(12, (r.top / z) - 6) });
  };
  const chiudiFly = () => { clearTimeout(flyTimer.current); flyTimer.current = setTimeout(() => setFly(null), 160); };
  const tieniFly = () => clearTimeout(flyTimer.current);
  React.useEffect(() => () => clearTimeout(flyTimer.current), []);

  // ⌘K / Ctrl+K apre la ricerca globale ovunque
  React.useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setSearchOpen(o => !o); }
      if (e.key === 'Escape') setSearchOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Sidebar comprimi/espandi — stato persistito, come nel gestionale (68px).
  const [collapsed, setCollapsed] = useStateApp(() => {
    try { return localStorage.getItem('adm_sidebar_collapsed') === '1'; } catch(e) { return false; }
  });
  const toggleCollapsed = () => setCollapsed(c => {
    const n = !c;
    try { localStorage.setItem('adm_sidebar_collapsed', n ? '1' : '0'); } catch(e) {}
    return n;
  });
  const sidebarToggleStyle = {
    width:26, height:26, borderRadius:7, flexShrink:0, padding:0,
    border:'1px solid rgba(15,17,21,0.10)', background:'#F5F5F7',
    color: ADM.MUTED, cursor:'pointer', display:'grid', placeItems:'center',
  };

  // setRoute esteso: setRoute('locali', { openLocale: l }) apre direttamente
  // il drawer di dettaglio sul locale passato. Navigando altrove o tornando
  // sulla rubrica senza opts, il prefill è azzerato.
  //
  // I ticket non hanno più una rotta propria: sono un tab di Assistenza. E
  // locali, camerieri e utenti non hanno più una pagina propria: sono la
  // rubrica Contatti. Qui le rotte vecchie si traducono nelle nuove, così le
  // notifiche, la striscia della Dashboard e la ricerca globale continuano a
  // puntare dove puntavano senza doverle riscrivere una per una — e senza
  // lasciare in giro rotte morte che un domani nessuno saprebbe più perché
  // esistono.
  const setRoute = (nextRaw, opts) => {
    const verso = nextRaw === 'comunicazioni' ? 'assistenza'
      : (nextRaw === 'locali' || nextRaw === 'camerieri' || nextRaw === 'utenti') ? 'contatti'
      // «Marketing» non è una pagina: è una famiglia. Chi ci arriva senza dire
      // quale canale atterra sulla mail, che è quello da cui si parte.
      : nextRaw === 'marketing' ? 'mkt-mail'
      // Campagne di acquisizione non è più una voce: un link rimasto in giro
      // atterra sulla famiglia Marketing, non su una pagina fantasma.
      : nextRaw === 'promozioni' ? 'mkt-mail'
      // La governance è una voce sola: le quattro rotte storiche atterrano
      // dentro Impostazioni, sulla loro parte interna.
      : (nextRaw === 'sicurezza' || nextRaw === 'team' || nextRaw === 'domini' || nextRaw === 'proprieta') ? 'impostazioni'
      : nextRaw;
    setFly(null); setMenuProfilo(false);
    const tab = nextRaw === 'comunicazioni' ? 'ticket' : (opts && opts.tab) || null;
    // Le tre vecchie forme di apertura diretta diventano un {tipo, ref} solo:
    // la rubrica sceglie da lì quale dei tre drawer montare.
    setContattoOpen(verso !== 'contatti' || !opts ? null
      : opts.openLocale ? { tipo: 'locale', ref: opts.openLocale }
      : opts.openStaff ? { tipo: 'staff', ref: opts.openStaff }
      : opts.openUtente ? { tipo: 'utente', ref: opts.openUtente }
      : opts.openContatto || null);
    setCommOpen(verso === 'assistenza' && opts?.openComm ? opts.openComm : null);
    setAssistenzaTab(verso === 'assistenza' ? tab : null);
    // Anche Sicurezza e sistemi ha i suoi tab: chi ci arriva da un avviso
    // deve atterrare su quello che l'avviso riguarda, non sul primo. E la
    // rotta storica dice QUALE parte di Impostazioni aprire: 'team' era
    // Piattaforma, le altre portano il loro nome.
    if (verso === 'impostazioni') {
      setTeamTab(tab || null);
      setImpostazioniSub(nextRaw === 'team' ? 'piattaforma'
        : nextRaw === 'impostazioni' ? ((opts && opts.sub) || 'sicurezza')
        : nextRaw);
    }
    setRouteRaw(verso);
  };

  // Una scorciatoia globale per navigare da dentro le pagine senza passare le
  // callback di mano in mano attraverso cinque livelli di componenti.
  React.useEffect(() => { window.__hubNav = setRoute; return () => { delete window.__hubNav; }; });

  return (
    <div className="frame" style={{
      display:'flex', overflow:'hidden',
      fontFamily: "'Plus Jakarta Sans', -apple-system, system-ui, sans-serif",
      background: ADM.PANEL_SOFT, color: ADM.TEXT,
    }}>
      <HubStile/>
      {/* Sidebar — vetro tenue, logo reale, nav piatta (come il gestionale) */}
      <aside style={{
        width: collapsed ? 68 : 272, flexShrink:0,
        background:'linear-gradient(180deg, rgba(250,251,252,0.92) 0%, rgba(245,245,247,0.92) 100%)',
        backdropFilter:'saturate(180%) blur(24px)',
        WebkitBackdropFilter:'saturate(180%) blur(24px)',
        borderRight:'1px solid rgba(15,17,21,0.06)',
        boxShadow:'inset 0 1px 0 rgba(255,255,255,0.65)',
        display:'flex', flexDirection:'column',
        padding: collapsed ? '20px 10px 56px' : '20px 14px 56px',
        transition:'width 220ms cubic-bezier(0.4,0,0.2,1), padding 220ms cubic-bezier(0.4,0,0.2,1)',
      }}>
        {/* Logo Hubble: il lockup intero da espansa, il solo marchio da
            compressa. Il gradiente è nel file — niente testo colorato a mano
            che poi diverge dal logo vero alla prima revisione del marchio. */}
        {!collapsed ? (
          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'2px 6px 22px'}}>
            <img src="hubble.png" alt="Hubble" style={{height:29, width:'auto', display:'block'}}/>
            <button onClick={toggleCollapsed} title="Comprimi menu" className="adm-iconbtn" style={sidebarToggleStyle}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
          </div>
        ) : (
          <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:10, paddingBottom:20}}>
            <img src="hubble-mark.png" alt="Hubble" style={{height:28, width:'auto', display:'block'}}/>
            <button onClick={toggleCollapsed} title="Espandi menu" className="adm-iconbtn" style={sidebarToggleStyle}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
        )}

        {/* La ricerca globale vive nella barra, non in una testata di pagina:
            la testata non esiste più — ogni pagina si presenta da sola — e la
            barra è l'unico posto che c'è sempre. ⌘K continua a funzionare
            ovunque. */}
        <button onClick={()=>setSearchOpen(true)} title={collapsed ? 'Cerca (⌘K)' : undefined}
          style={{
            display:'flex', alignItems:'center', gap: collapsed ? 0 : 10,
            justifyContent: collapsed ? 'center' : 'flex-start',
            width:'100%', boxSizing:'border-box', marginBottom:12,
            padding: collapsed ? '9px 0' : '8px 12px',
            background:'#fff', border:`1px solid ${ADM.BORDER}`, borderRadius:10,
            color:ADM.MUTED, fontSize:15, fontFamily:'inherit', cursor:'pointer', textAlign:'left',
            boxShadow:'0 1px 2px rgba(15,17,21,0.04)',
          }}>
          <BuIcons.search size={collapsed ? 22 : 17}/>
          {!collapsed && <span style={{flex:1}}>Cerca…</span>}
          {!collapsed && <span style={{fontSize:11, fontWeight:700, background:ADM.PANEL_SOFT, border:`1px solid ${ADM.BORDER}`, borderRadius:5, padding:'1px 5px', color:ADM.MUTED_SOFT}}>⌘K</span>}
        </button>

        <nav onMouseLeave={chiudiFly}
          style={{flex:1, overflowY:'auto', overflowX:'visible', display:'flex', flexDirection:'column', gap:2}}>
          {HUB_NAV.map(item => {
            const figlio = item.figli && item.figli.some(f => f.id === route);
            return (
              <AdmNavItem key={item.id} item={item}
                active={route === item.id || figlio}
                flyAperto={!!fly && fly.voce.id === item.id}
                onClick={() => setRoute(item.figli ? item.figli[0].id : item.id)}
                onFly={apriFly}
                collapsed={collapsed}/>
            );
          })}
        </nav>

        {/* Profilo — la card apre il MENU, non una pagina. Dentro ci stanno
            l'account e Impostazioni, che tiene insieme tutta la governance:
            sicurezza e sistemi, proprietà, domini e mittenti, le leve
            commerciali. Erano voci di barra, ma sono cose che si toccano una
            volta al mese: occupavano lo spazio del lavoro quotidiano. */}
        <div style={{position:'relative', marginTop:10}}>
          <button onClick={()=>setMenuProfilo(m => !m)} title={collapsed ? "Profilo e impostazioni" : undefined}
            className="adm-card-interactive"
            style={{
              width:'100%', boxSizing:'border-box',
              padding: collapsed ? '8px 0' : '9px 10px',
              display:'flex', alignItems:'center', justifyContent: collapsed ? 'center' : 'flex-start', gap:10,
              background: (menuProfilo || HUB_MENU_PROFILO.some(v => v.id === route)) ? ADM.PINK_SOFT : '#fff',
              border:`1px solid ${(menuProfilo || HUB_MENU_PROFILO.some(v => v.id === route)) ? '#FFA9BF' : 'rgba(15,17,21,0.07)'}`,
              borderRadius:12, cursor:'pointer', fontFamily:'inherit', textAlign:'left',
              boxShadow:'0 1px 2px rgba(15,17,21,0.04)',
            }}>
            <div style={{
              width:36, height:36, borderRadius:'50%',
              background: ADM.HUB_GRAD_DIAG,
              color:'#fff', display:'grid', placeItems:'center',
              fontWeight:700, fontSize:14, flexShrink:0, letterSpacing:'0.01em',
            }}>MR</div>
            {!collapsed && (
              <React.Fragment>
                <div style={{flex:1, minWidth:0}}>
                  <div style={{fontSize:14.5, fontWeight:700, color:ADM.TEXT, letterSpacing:'-0.01em', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', lineHeight:1.2}}>Marco Rinaldi</div>
                  <div style={{fontSize:12, color:ADM.MUTED, marginTop:2, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>Super Admin · byup</div>
                </div>
                <span style={{display:'inline-flex', color:ADM.MUTED, transform: menuProfilo ? 'rotate(180deg)' : 'none', transition:'transform 0.16s ease'}}>
                  <BuIcons.chevronUp size={15}/>
                </span>
              </React.Fragment>
            )}
          </button>

          {menuProfilo && (
            <React.Fragment>
              <div onClick={()=>setMenuProfilo(false)} style={{position:'fixed', inset:0, zIndex:140}}/>
              <div style={{
                position:'absolute', bottom:'calc(100% + 8px)', left:0, zIndex:145,
                width: collapsed ? 288 : '100%', minWidth:262,
                background:'#fff', border:`1px solid ${ADM.BORDER}`, borderRadius:14,
                boxShadow:'0 24px 60px -18px rgba(15,17,21,0.32)', padding:7,
                animation:'hubFlyIn 0.15s cubic-bezier(0.34,1.2,0.64,1)',
              }}>
                {HUB_MENU_PROFILO.map(v => {
                  const Icona = BuIcons[v.icon];
                  const attiva = route === v.id;
                  return (
                    <button key={v.id} onClick={()=>setRoute(v.id)} className="adm-actionrow"
                      style={{
                        display:'flex', alignItems:'flex-start', gap:10, width:'100%', textAlign:'left',
                        padding:'8px 9px', borderRadius:9, border:'none', cursor:'pointer', fontFamily:'inherit',
                        background: attiva ? ADM.PINK_BG_SOFT : 'transparent',
                      }}>
                      <span style={{
                        width:28, height:28, borderRadius:8, flexShrink:0, display:'grid', placeItems:'center',
                        background: attiva ? ADM.PINK_SOFT : ADM.NEUTRAL_SOFT, color: attiva ? ADM.PINK : ADM.MUTED,
                      }}><Icona size={15}/></span>
                      <span style={{flex:1, minWidth:0, paddingTop:1}}>
                        <span style={{display:'block', fontSize:13.8, fontWeight:700, color: attiva ? ADM.PINK_DARK : ADM.TEXT}}>{v.label}</span>
                        <span style={{display:'block', fontSize:11.8, color:ADM.MUTED, marginTop:1, lineHeight:1.4}}>{v.desc}</span>
                      </span>
                    </button>
                  );
                })}
                <div style={{borderTop:`1px solid ${ADM.BORDER_SOFT}`, margin:'6px 4px 4px', paddingTop:5}}>
                  <button className="adm-actionrow" onClick={()=>{ setMenuProfilo(false); setUscito(true); }} style={{
                    display:'flex', alignItems:'center', gap:10, width:'100%', textAlign:'left',
                    padding:'8px 9px', borderRadius:9, border:'none', cursor:'pointer',
                    fontFamily:'inherit', background:'transparent',
                  }}>
                    <span style={{width:28, height:28, borderRadius:8, display:'grid', placeItems:'center', color:ADM.MUTED}}>
                      <BuIcons.arrowRight size={15}/>
                    </span>
                    <span style={{fontSize:13.8, fontWeight:600, color:ADM.MUTED}}>Esci da Hubble</span>
                  </button>
                </div>
              </div>
            </React.Fragment>
          )}
        </div>
      </aside>

      {/* Il pannello delle sotto-sezioni, sopra a tutto */}
      {fly && <HubFlyout voce={fly.voce} x={fly.x} y={fly.y} rotta={route}
        onVai={(id)=>setRoute(id)} onEnter={tieniFly} onLeave={chiudiFly}/>}

      {/* Main */}
      {/* Main. L'header non esiste più: la briciola «Hubble / sezione»
          ripeteva quello che sidebar e testate già dicono, e la ricerca è
          scesa nella barra. Ogni pagina si presenta da sola con HubTestata —
          Assistenza compresa — e il contenuto guadagna tutta l'altezza.
          (Qui prima c'era anche la campanella delle notifiche: avvisi finti
          che duplicavano i badge della sidebar — tolta pure lei.) */}
      <main style={{flex:1, display:'flex', flexDirection:'column', overflow:'hidden'}}>
        <div style={{flex:1, overflow:'auto'}}>
          {route === 'dashboard'    && <AdmDashboard onNav={setRoute}/>}
          {route === 'contatti'     && <AdmContattiPage search={''} openContatto={contattoOpen}/>}
          {route === 'elenchi'      && <HubElenchiPage/>}
          {route === 'mkt-mail'     && <HubMailPage/>}
          {route === 'mkt-sms'      && <HubSmsPage/>}
          {route === 'mkt-push'     && <HubPushPage/>}
          {route === 'mkt-form'     && <HubFormPage/>}
          {route === 'workflow'     && <HubWorkflowPage/>}
          {route === 'agent'        && <HubAgentPage/>}
          {route === 'assistenza'   && <AdmAssistenzaPage initialTab={assistenzaTab} openTicket={commOpen}/>}
          {route === 'impostazioni' && <ImpostazioniPage sub={impostazioniSub} teamTab={teamTab}/>}
          {route === 'profilo'      && <ProfiloPage/>}
        </div>
      </main>

      {searchOpen && <GlobalSearch onClose={()=>setSearchOpen(false)} go={(r, opts)=>setRoute(r, opts)}/>}

      {/* La sessione terminata copre tutto: niente login vero nel prototipo,
          ma il rientro riparte pulito dalla rubrica, come un accesso fresco. */}
      {uscito && (
        <div style={{position:'fixed', inset:0, zIndex:200, background:'rgba(15,17,21,0.55)', backdropFilter:'blur(6px)', WebkitBackdropFilter:'blur(6px)', display:'grid', placeItems:'center'}}>
          <div style={{width:360, background:'#fff', borderRadius:16, boxShadow:'0 32px 80px rgba(15,17,21,0.35)', padding:'30px 28px', textAlign:'center', animation:'admModalIn 0.18s ease'}}>
            <img src="hubble-mark.png" alt="Hubble" style={{height:34, width:'auto', margin:'0 auto 14px', display:'block'}}/>
            <div style={{fontSize:17, fontWeight:700, color:ADM.TEXT, letterSpacing:'-0.01em'}}>Sessione terminata</div>
            <div style={{fontSize:13.5, color:ADM.MUTED, marginTop:6, lineHeight:1.5}}>Sei uscito da Hubble. Per riprendere il lavoro accedi di nuovo.</div>
            <div style={{marginTop:18, display:'flex', justifyContent:'center'}}>
              <AdmButton variant="primary" size="md" onClick={()=>{ setUscito(false); setRoute('contatti'); }}>Accedi di nuovo</AdmButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------- PROFILO ----------
function ProfiloPage() {
  const [pwd1, setPwd1] = useStateApp('');
  const [pwd2, setPwd2] = useStateApp('');
  const [pwd3, setPwd3] = useStateApp('');
  const [pwdSalvata, setPwdSalvata] = useStateApp(false);
  const [twofa, setTwofa] = useStateApp(false);
  const [showQr, setShowQr] = useStateApp(false);
  const [codice2fa, setCodice2fa] = useStateApp('');
  const [showCodici, setShowCodici] = useStateApp(false);
  // Le sessioni sono uno stato, non un letterale nel JSX: «Termina» promette
  // un'azione distruttiva e la lista deve accorciarsi davvero.
  const [sessioni, setSessioni] = useStateApp([
    { device:'Mac · Chrome', loc:'Milano', when:'In uso ora', current:true },
    { device:'iPhone · Safari', loc:'Milano', when:'2 ore fa', current:false },
    { device:'Mac · Firefox', loc:'Milano', when:'3 giorni fa', current:false },
  ]);

  const pwdOk = pwd2.length >= 8 && pwd2 === pwd3 && pwd1.length > 0;
  // Stesso metro del cambio password: il codice va letto davvero — sei cifre,
  // gli spazi del formato «123 456» non contano.
  const codice2faOk = /^\d{6}$/.test(codice2fa.replace(/\s/g, ''));

  return (
    <div style={{padding:28, display:'flex', flexDirection:'column', gap:16}}>
      {/* La testata alla maniera di Hubble: la pagina si presenta da sola —
          la shell non ha più un header con titoli o briciole. */}
      <HubTestata titolo="Il mio profilo"
        sotto="Password, autenticazione a due fattori e sessioni attive: la sicurezza del tuo accesso a Hubble."/>
      {/* Header card */}
      <AdmCard padding={22}>
        <div style={{display:'flex', alignItems:'center', gap:18}}>
          <div style={{
            width:52, height:52, borderRadius:'50%',
            background:'linear-gradient(135deg, #FF1F5A, #9E0B3C)',
            color:'#fff', display:'grid', placeItems:'center',
            fontWeight:700, fontSize:20, flexShrink:0, letterSpacing:'0.01em',
          }}>MR</div>
          <div style={{flex:1}}>
            <div style={{fontSize:19.4, fontWeight:700, color:ADM.TEXT, letterSpacing:'-0.01em'}}>Marco Rinaldi</div>
            <div style={{fontSize:14, color:ADM.MUTED, marginTop:3}}>marco.rinaldi@byup.it · Super Admin</div>
            <div style={{fontSize:13.3, color:ADM.MUTED_SOFT, marginTop:4}}>Account creato il 14 gen 2024 · Ultimo accesso oggi alle 09:42</div>
          </div>
        </div>
      </AdmCard>

      <div style={{display:'grid', gridTemplateColumns:'repeat(2, minmax(0,1fr))', gap:14, alignItems:'start'}}>
      {/* Password */}
      <AdmCard padding={22}>
        <div style={{fontSize:15.1, fontWeight:600, color:ADM.TEXT, marginBottom:4}}>Cambia password</div>
        <div style={{fontSize:13.7, color:ADM.MUTED, marginBottom:16}}>Usa almeno 8 caratteri, con lettere e numeri</div>
        <div style={{display:'flex', flexDirection:'column', gap:12}}>
          <ProfField label="Password attuale" type="password" value={pwd1} onChange={setPwd1}/>
          <ProfField label="Nuova password" type="password" value={pwd2} onChange={setPwd2} hint={pwd2.length > 0 && pwd2.length < 8 ? 'Almeno 8 caratteri' : ''}/>
          <ProfField label="Conferma nuova password" type="password" value={pwd3} onChange={setPwd3} hint={pwd3.length > 0 && pwd2 !== pwd3 ? 'Le password non coincidono' : ''}/>
        </div>
        <div style={{marginTop:16, display:'flex', alignItems:'center', gap:10}}>
          {/* Mock: i campi si svuotano — una password salvata non resta sullo
              schermo — e la conferma dura il tempo di leggerla. */}
          <AdmButton variant="primary" size="md" icon="check" disabled={!pwdOk}
            onClick={()=>{ setPwd1(''); setPwd2(''); setPwd3(''); setPwdSalvata(true); setTimeout(()=>setPwdSalvata(false), 2200); }}>Aggiorna password</AdmButton>
          {pwdSalvata && <span style={{fontSize:12.5, color:ADM.OK, fontWeight:700}}>✓ Password aggiornata</span>}
        </div>
      </AdmCard>

      <div style={{display:'flex', flexDirection:'column', gap:14, minWidth:0}}>
      {/* 2FA */}
      <AdmCard padding={22}>
        <div style={{display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:18, marginBottom: twofa || showQr ? 16 : 0}}>
          <div style={{flex:1}}>
            <div style={{display:'flex', alignItems:'center', gap:8}}>
              <div style={{fontSize:15.1, fontWeight:600, color:ADM.TEXT}}>Autenticazione a due fattori (2FA)</div>
              <span style={{padding:'2px 8px', borderRadius:99, background:ADM.WARN_SOFT, color:'#92400E', fontSize:11, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.04em'}}>obbligatoria per gli admin</span>
              {twofa && <AdmBadge color="OK" size="xs">Attiva</AdmBadge>}
            </div>
            <div style={{fontSize:13.7, color:ADM.MUTED, marginTop:4, lineHeight:1.5}}>
              Aggiungi un secondo livello di sicurezza al tuo account. Ad ogni accesso ti verrà richiesto un codice generato da un'app come Google Authenticator o Authy.
            </div>
          </div>
          <AdmSwitch checked={twofa} onChange={(v) => { if (twofa && !v) { setTwofa(false); setShowQr(false); setShowCodici(false); } else if (!twofa && v) { setShowQr(true); } }}/>
        </div>

        {showQr && !twofa && (
          <div style={{padding:18, background:ADM.PANEL_SOFT, borderRadius:10, border:`1px solid ${ADM.BORDER}`, display:'flex', gap:18, alignItems:'flex-start'}}>
            <div style={{
              width:140, height:140, background:'#fff',
              border:`1px solid ${ADM.BORDER}`, borderRadius:8, padding:8,
              display:'grid', placeItems:'center', flexShrink:0,
            }}>
              <QrPlaceholder/>
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:14.4, fontWeight:600, color:ADM.TEXT, marginBottom:4}}>1 · Scansiona il QR code</div>
              <div style={{fontSize:13.7, color:ADM.MUTED, lineHeight:1.5, marginBottom:14}}>
                Apri la tua app di autenticazione (Google Authenticator, Authy, 1Password) e scansiona il codice qui a sinistra. Oppure inserisci la chiave manualmente:
                <div style={{marginTop:8, padding:'8px 10px', background:'#fff', border:`1px solid ${ADM.BORDER}`, borderRadius:6, fontFamily:'ui-monospace,monospace', fontSize:13.3, color:ADM.TEXT, letterSpacing:'0.06em'}}>JBSW Y3DP EHPK 3PXP</div>
              </div>
              <div style={{fontSize:14.4, fontWeight:600, color:ADM.TEXT, marginBottom:6}}>2 · Inserisci il codice a 6 cifre</div>
              <div style={{display:'flex', gap:8}}>
                {/* maxLength 7: sei cifre più lo spazio del formato suggerito
                    dal placeholder. */}
                <input maxLength={7} placeholder="123 456" value={codice2fa} onChange={e=>setCodice2fa(e.target.value)} style={{
                  flex:1, padding:'9px 12px', border:`1px solid ${ADM.BORDER}`, borderRadius:7,
                  fontSize:15.1, fontFamily:'ui-monospace,monospace', letterSpacing:'0.2em', textAlign:'center', outline:'none',
                }}/>
                <AdmButton variant="primary" size="md" disabled={!codice2faOk} onClick={()=>{ setTwofa(true); setShowQr(false); setCodice2fa(''); }}>Attiva 2FA</AdmButton>
                <AdmButton variant="ghost" size="md" onClick={()=>{ setShowQr(false); setCodice2fa(''); }}>Annulla</AdmButton>
              </div>
            </div>
          </div>
        )}

        {twofa && (
          <div style={{padding:14, background:ADM.OK_SOFT, borderRadius:8, border:`1px solid #BBF7D0`, display:'flex', gap:10, alignItems:'center'}}>
            <BuIcons.check size={21} color={ADM.OK}/>
            <div style={{flex:1, fontSize:14, color:'#065F46'}}>2FA configurata con app Authenticator. Conserva i codici di recupero in un posto sicuro.</div>
            <AdmButton variant="ghost" size="sm" onClick={()=>setShowCodici(c=>!c)}>{showCodici ? 'Nascondi codici' : 'Codici di recupero'}</AdmButton>
          </div>
        )}
        {/* Otto codici fissi, stesso registro monospace della chiave manuale:
            il banner li promette, il bottone li deve mostrare. */}
        {twofa && showCodici && (
          <div style={{marginTop:10, padding:14, background:ADM.PANEL_SOFT, border:`1px solid ${ADM.BORDER}`, borderRadius:8}}>
            <div style={{fontSize:12.6, color:ADM.MUTED, marginBottom:8}}>Ogni codice vale un solo accesso. Conservali fuori dal computer.</div>
            <div style={{display:'grid', gridTemplateColumns:'repeat(4, minmax(0,1fr))', gap:6}}>
              {['84KF-2Q1D','7PX3-N9RM','QW52-8ZTC','X0DH-44VE','MJ6B-K3PU','5RTN-YB07','CE91-HL2S','ZK38-06WQ'].map(c => (
                <div key={c} style={{padding:'6px 0', textAlign:'center', background:'#fff', border:`1px solid ${ADM.BORDER}`, borderRadius:6, fontFamily:'ui-monospace,monospace', fontSize:12.6, letterSpacing:'0.05em', color:ADM.TEXT}}>{c}</div>
              ))}
            </div>
          </div>
        )}
      </AdmCard>

      {/* Sessioni attive */}
      <AdmCard padding={22}>
        <div style={{fontSize:15.1, fontWeight:600, color:ADM.TEXT, marginBottom:14}}>Sessioni attive</div>
        {sessioni.map((s,i,a) => (
          <div key={s.device} style={{display:'flex', alignItems:'center', gap:12, padding:'11px 0', borderBottom: i === a.length-1 ? 'none' : `1px solid ${ADM.BORDER_SOFT}`}}>
            <div style={{width:32, height:32, borderRadius:7, background:ADM.PANEL_SOFT, color:ADM.MUTED, display:'grid', placeItems:'center'}}><BuIcons.user size={19}/></div>
            <div style={{flex:1}}>
              <div style={{fontSize:14, fontWeight:600, color:ADM.TEXT}}>{s.device}</div>
              <div style={{fontSize:13.3, color:ADM.MUTED}}>{s.loc} · {s.when}</div>
            </div>
            {s.current ? <AdmBadge color="OK" size="xs">Sessione attuale</AdmBadge> : <button className="adm-textlink" onClick={()=>setSessioni(ss => ss.filter(x => x.device !== s.device))} style={{background:'transparent', border:'none', color:ADM.DANGER, fontSize:13.3, fontWeight:600, cursor:'pointer', fontFamily:'inherit'}}>Termina</button>}
          </div>
        ))}
      </AdmCard>
      </div>{/* /colonna destra */}
      </div>{/* /griglia */}
    </div>
  );
}

function ProfField({ label, type='text', value, onChange, hint }) {
  return (
    <div>
      <label style={{fontSize:13.3, color:ADM.MUTED, fontWeight:600, display:'block', marginBottom:6, letterSpacing:'-0.005em'}}>{label}</label>
      <input type={type} value={value} onChange={e=>onChange(e.target.value)} style={{
        width:'100%', padding:'10px 13px',
        border:`1px solid ${ADM.BORDER}`,
        background:'#fff',
        borderRadius:9, fontSize:14.8, fontFamily:'inherit', outline:'none', boxSizing:'border-box',
        color:ADM.TEXT, letterSpacing:'-0.005em',
      }}/>
      {hint && <div style={{fontSize:13.3, color:ADM.DANGER, marginTop:5, fontWeight:500}}>{hint}</div>}
    </div>
  );
}

function QrPlaceholder() {
  // mock pixel grid
  const grid = [];
  const r = (i,j) => (Math.sin(i * 7.3 + j * 3.1) + Math.cos(i * 2.7 - j * 5.5)) > 0.1;
  for (let i=0; i<11; i++) for (let j=0; j<11; j++) {
    if (r(i,j)) grid.push({i,j});
  }
  return (
    <svg viewBox="0 0 110 110" width="100%" height="100%">
      {grid.map((c,k) => <rect key={k} x={c.j*10} y={c.i*10} width="10" height="10" fill="#0F1115"/>)}
      {/* corners */}
      {[[0,0],[80,0],[0,80]].map(([x,y],k) => (
        <g key={k}>
          <rect x={x} y={y} width="30" height="30" fill="#0F1115"/>
          <rect x={x+5} y={y+5} width="20" height="20" fill="#fff"/>
          <rect x={x+10} y={y+10} width="10" height="10" fill="#0F1115"/>
        </g>
      ))}
    </svg>
  );
}

window.AdminApp = AdminApp;
