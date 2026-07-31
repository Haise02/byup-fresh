// Byup Spot — shell principale con sidebar e router

const { useState: useStateApp } = React;

// Nav piatta come nel gestionale: una lista principale + un gruppo "sistema"
// staccato in basso. Niente micro-header maiuscoli (Operatività/Marketing…):
// le icone + label bastano, e la sidebar respira.
const NAV_MAIN = [
  { id: 'dashboard',    label: 'Analisi Dati', icon: 'chartFill' },
  { id: 'locali',       label: 'Locali',       icon: 'storeFill', badge: LOCALI.filter(l=>l.stato==='onboarding').length },
  { id: 'camerieri',    label: 'Staff',        icon: 'staffFill' },
  { id: 'utenti',       label: 'Utenti App',   icon: 'phoneFill' },
  // Una voce sola per l'assistenza. Ticket e chiamate erano due sezioni
  // separate, ma sono lo stesso lavoro fatto su due canali: chi sta al
  // supporto passa dall'una all'altra di continuo, e con due voci di menu non
  // esisteva un posto dove vedere tutto quello che un locale ha aperto con
  // noi. Dentro ci stanno anche le FAQ e le guide, che sono la stessa
  // assistenza scritta una volta per tutte invece che ripetuta al telefono.
  // Il badge somma le due code; il dettaglio lo danno i tab.
  { id: 'assistenza',   label: 'Assistenza', icon: 'headsetFill',
    badge: (SEGNALAZIONI.filter(s=>s.stato==='nuova').length
          + CERTIFICAZIONI.filter(c=>c.stato==='pending').length
          + RICHIAMATE.filter(r=>r.stato==='attesa').length) },
  { id: 'promozioni',   label: 'Promozioni',   icon: 'megaphoneFill' },
];
const NAV_SYSTEM = [
  // La nav di sistema è per la governance, non per l'operatività quotidiana:
  // la conformità si consulta quando serve, come le impostazioni.
  { id: 'economix',     label: 'Economix',           icon: 'euroFill' },
  { id: 'conformita',   label: 'Risk Management',    icon: 'gaugeFill',
    badge: ADEMPIMENTI.filter(a => { const s = cfStatoAdempimento(a); return s.stato === 'scaduto' || s.stato === 'mai'; }).length || null },
  // Chi ha accesso, che cosa ha fatto e come stanno i sistemi sono la stessa
  // domanda vista da tre lati: stanno insieme e non dentro le impostazioni,
  // dove finivano solo perche non c'era un altro posto.
  { id: 'sicurezza',    label: 'Sicurezza e sistemi', icon: 'lockFill' },
  { id: 'team',         label: 'Piattaforma', icon: 'shieldUserFill' },
];

// Nav item — stile gestionale: attivo = fondo pesca + testo/coral, icona
// prominente. `muted` per il gruppo sistema (tono più tenue, icona più piccola).
function AdmNavItem({ item, active, onClick, muted, collapsed }) {
  const Icon = BuIcons[item.icon];
  const hasBadge = item.badge !== undefined && item.badge > 0;
  return (
    <button onClick={onClick} className={`adm-nav-item${active ? ' is-active' : ''}`}
      title={collapsed ? item.label : undefined}
      style={{
        width:'100%', display:'flex', alignItems:'center',
        gap: collapsed ? 0 : 12,
        justifyContent: collapsed ? 'center' : 'flex-start',
        padding: collapsed ? '9px' : '9px 10px',
        background: active ? ADM.PINK_SOFT : 'transparent',
        color: active ? ADM.PINK_DARK : (muted ? ADM.MUTED : ADM.TEXT),
        border:'none', borderRadius:10,
        fontSize: muted ? 17.5 : 19.5,
        fontWeight: active ? 600 : 500,
        cursor:'pointer', fontFamily:'inherit', textAlign:'left',
      }}>
      <span style={{position:'relative', display:'inline-flex'}}>
        <Icon size={muted ? 21 : 26} color={active ? ADM.PINK : ADM.MUTED}/>
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
    </button>
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
    { group:'Staff', icon:'staffFill', items: (typeof STAFF !== 'undefined' ? STAFF : []).filter(st => match(st.nome, st.localeNome, st.id)).slice(0,5)
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
  const [route, setRouteRaw] = useStateApp('dashboard');
  const [messageModal, setMessageModal] = useStateApp(null);
  const [localiOpenLocale, setLocaliOpenLocale] = useStateApp(null);
  const [utentiOpen, setUtentiOpen] = useStateApp(null);
  const [staffOpen, setStaffOpen] = useStateApp(null);
  const [commOpen, setCommOpen] = useStateApp(null);
  const [assistenzaTab, setAssistenzaTab] = useStateApp(null); // tab di Chiamata assistenza (ricerca globale, Dashboard)
  const [confTab, setConfTab] = useStateApp(null);   // tab della Conformità aperta da un link esterno
  const [teamTab, setTeamTab] = useStateApp(null);   // idem per Piattaforma
  const [searchOpen, setSearchOpen] = useStateApp(false);
  const [notifOpen, setNotifOpen] = useStateApp(false);
  const [notifRead, setNotifRead] = useStateApp(false);

  // ⌘K / Ctrl+K apre la ricerca globale ovunque
  React.useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setSearchOpen(o => !o); }
      if (e.key === 'Escape') { setSearchOpen(false); setNotifOpen(false); }
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
  // su 'locali' senza opts, il prefill è azzerato.
  //
  // I ticket non hanno più una rotta propria: sono un tab di Assistenza. Qui
  // si traduce `comunicazioni` in `assistenza` + tab, così le notifiche, la
  // striscia della Dashboard e la ricerca globale continuano a puntare dove
  // puntavano senza doverle riscrivere una per una — e senza lasciare in giro
  // una rotta morta che un domani nessuno saprebbe più perché esiste.
  const setRoute = (nextRaw, opts) => {
    const verso = nextRaw === 'comunicazioni' ? 'assistenza' : nextRaw;
    const tab = nextRaw === 'comunicazioni' ? 'ticket' : (opts && opts.tab) || null;
    setLocaliOpenLocale(verso === 'locali' && opts?.openLocale ? opts.openLocale : null);
    setUtentiOpen(verso === 'utenti' && opts?.openUtente ? opts.openUtente : null);
    setStaffOpen(verso === 'camerieri' && opts?.openStaff ? opts.openStaff : null);
    setCommOpen(verso === 'assistenza' && opts?.openComm ? opts.openComm : null);
    setAssistenzaTab(verso === 'assistenza' ? tab : null);
    // Anche Sicurezza e sistemi ha i suoi tab: chi ci arriva da un avviso
    // deve atterrare su quello che l'avviso riguarda, non sul primo.
    if (verso === 'sicurezza' || verso === 'team') setTeamTab(tab || null);
    setRouteRaw(verso);
  };

  const openMessageModal = (type, ids = []) => setMessageModal({ type, ids });
  const closeMessageModal = () => setMessageModal(null);

  const pageTitles = {
    dashboard:    { t:'Analisi Dati', s:'Come sta la piattaforma, letta dai numeri' },
    locali:       { t:'Locali', s:'Ristoranti registrati e relativo onboarding' },
    camerieri:    { t:'Staff', s:'Staff registrato sui locali · camerieri, cassa, proprietari, dispositivi' },
    utenti:       { t:'Utenti App', s:'Clienti finali che usano l\'app byup' },
    assistenza:   { t:'Assistenza', s:'Ticket e chiamate dai ristoratori, FAQ e guide pubblicate nel gestionale' },
    promozioni:   { t:'Promozioni', s:'Campagne e messaggi promozionali inviati' },
    team:         { t:'Piattaforma', s:'Le leve commerciali di byup: piani e prezzi, peso degli ordini, discovery nell\'app' },
    sicurezza:    { t:'Sicurezza e sistemi', s:'Team, permessi, riesame degli accessi, tracce e salute della piattaforma' },
    economix:     { t:'Economix', s:'Costi, conto economico, cassa e patrimonio di Byup' },
    conformita:   { t:'Risk Management', s:'Rischi, adempimenti ed evidenze per ISO/IEC 27001 e ISO 9001' },
    profilo:      { t:'Profilo', s:'Account e sicurezza' },
  };

  const pt = pageTitles[route] || pageTitles.dashboard;

  return (
    <div className="frame" style={{
      display:'flex', overflow:'hidden',
      fontFamily: "'Plus Jakarta Sans', -apple-system, system-ui, sans-serif",
      background: ADM.PANEL_SOFT, color: ADM.TEXT,
    }}>
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
        {/* Logo + pulsante comprimi/espandi (come il gestionale) */}
        {!collapsed ? (
          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'2px 6px 24px'}}>
            <div style={{display:'flex', alignItems:'baseline', gap:9}}>
              <img src="byup.png" alt="byup" style={{height:31, width:'auto', display:'block', transform:'translateY(6px)'}}/>
              <span style={{fontSize:27, fontWeight:800, fontStyle:'italic', color:ADM.PINK, letterSpacing:'-0.01em', lineHeight:1}}>Spot</span>
            </div>
            <button onClick={toggleCollapsed} title="Comprimi menu" className="adm-iconbtn" style={sidebarToggleStyle}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
          </div>
        ) : (
          <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:10, paddingBottom:20}}>
            <img src="byup-mark.png" alt="byup" style={{height:30, width:'auto', display:'block'}}/>
            <button onClick={toggleCollapsed} title="Espandi menu" className="adm-iconbtn" style={sidebarToggleStyle}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
        )}

        <nav style={{flex:1, overflowY:'auto', display:'flex', flexDirection:'column', gap:2}}>
          {NAV_MAIN.map(item => (
            <AdmNavItem key={item.id} item={item} active={route===item.id} onClick={()=>setRoute(item.id)} collapsed={collapsed}/>
          ))}
        </nav>

        {/* Gruppo sistema — staccato in basso, tono più tenue */}
        <div style={{display:'flex', flexDirection:'column', gap:2, paddingTop:10, marginTop:6, borderTop:`1px solid ${ADM.BORDER_SOFT}`}}>
          {NAV_SYSTEM.map(item => (
            <AdmNavItem key={item.id} item={item} active={route===item.id} onClick={()=>setRoute(item.id)} muted collapsed={collapsed}/>
          ))}
        </div>

        {/* Profilo — card a tutta larghezza: avatar a sinistra, testo che
            riempie, freccia ancorata a destra. Niente contenuto "galleggiante". */}
        <button onClick={()=>setRoute('profilo')} title={collapsed ? "Profilo" : undefined} className="adm-card-interactive"
          style={{
            marginTop:10, width:'100%', boxSizing:'border-box',
            padding: collapsed ? '8px 0' : '9px 10px',
            display:'flex', alignItems:'center', justifyContent: collapsed ? 'center' : 'flex-start', gap:10,
            background: route === 'profilo' ? ADM.PINK_SOFT : '#fff',
            border:`1px solid ${route === 'profilo' ? '#FFB3B5' : 'rgba(15,17,21,0.07)'}`,
            borderRadius:12, cursor:'pointer', fontFamily:'inherit', textAlign:'left',
            boxShadow:'0 1px 2px rgba(15,17,21,0.04)',
          }}>
          <div style={{
            width:36, height:36, borderRadius:'50%',
            background:'linear-gradient(135deg, #FF5A5F, #B53338)',
            color:'#fff', display:'grid', placeItems:'center',
            fontWeight:700, fontSize:14, flexShrink:0, letterSpacing:'0.01em',
          }}>MR</div>
          {!collapsed && (
            <React.Fragment>
              <div style={{flex:1, minWidth:0}}>
                <div style={{fontSize:14.5, fontWeight:700, color:ADM.TEXT, letterSpacing:'-0.01em', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', lineHeight:1.2}}>Marco Rinaldi</div>
                <div style={{fontSize:12, color:ADM.MUTED, marginTop:2, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>Super Admin · byup</div>
              </div>
              <span className="adm-open-chip" style={{width:22, height:22}}><BuIcons.chevronRight size={13}/></span>
            </React.Fragment>
          )}
        </button>
      </aside>

      {/* Main */}
      <main style={{flex:1, display:'flex', flexDirection:'column', overflow:'hidden'}}>
        <header style={{
          padding:'15px 28px',
          background:'#ffffff',
          borderBottom:`1px solid ${ADM.BORDER}`,
          display:'flex', alignItems:'center', gap:14, flexShrink:0,
        }}>
          <div style={{flex:1, minWidth:0}}>
            <div style={{fontSize:22, fontWeight:700, color:ADM.TEXT, letterSpacing:'-0.02em', lineHeight:1.2}}>{pt.t}</div>
            <div style={{fontSize:14, color:ADM.MUTED, marginTop:2, letterSpacing:'-0.005em'}}>{pt.s}</div>
          </div>
          {/* Ricerca globale */}
          <button onClick={()=>setSearchOpen(true)} className="adm-pill" style={{
            display:'inline-flex', alignItems:'center', gap:8, padding:'8px 14px',
            background:ADM.PANEL_SOFT, border:`1px solid ${ADM.BORDER}`, borderRadius:99,
            color:ADM.MUTED, fontSize:13.5, fontFamily:'inherit', cursor:'pointer', flexShrink:0,
          }}>
            <BuIcons.search size={16}/> Cerca…
            <span style={{fontSize:11, fontWeight:700, background:'#fff', border:`1px solid ${ADM.BORDER}`, borderRadius:5, padding:'1px 5px', color:ADM.MUTED_SOFT}}>⌘K</span>
          </button>
          {/* Notifiche */}
          <div style={{position:'relative', flexShrink:0}}>
            <button onClick={()=>setNotifOpen(o=>!o)} className="adm-iconbtn" style={{
              width:38, height:38, borderRadius:10, border:`1px solid ${ADM.BORDER}`, background:'#fff',
              color:ADM.MUTED, cursor:'pointer', display:'grid', placeItems:'center', position:'relative',
            }}>
              <BuIcons.bell size={19}/>
              {!notifRead && <span style={{position:'absolute', top:7, right:8, width:8, height:8, borderRadius:'50%', background:ADM.PINK, boxShadow:'0 0 0 2px #fff'}}/>}
            </button>
            {notifOpen && (
              <React.Fragment>
                <div onClick={()=>setNotifOpen(false)} style={{position:'fixed', inset:0, zIndex:69}}/>
                <div style={{position:'absolute', top:'calc(100% + 8px)', right:0, width:360, zIndex:70,
                  background:'#fff', border:`1px solid ${ADM.BORDER}`, borderRadius:14,
                  boxShadow:'0 24px 56px -12px rgba(15,17,21,0.25)', overflow:'hidden'}}>
                  <div style={{padding:'12px 16px', borderBottom:`1px solid ${ADM.BORDER_SOFT}`, display:'flex', alignItems:'center', justifyContent:'space-between'}}>
                    <span style={{fontSize:13.5, fontWeight:700, color:ADM.TEXT}}>Notifiche</span>
                    <button className="adm-textlink" onClick={()=>setNotifRead(true)} style={{background:'none', border:'none', color:ADM.PINK_DARK, fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit'}}>Segna tutte come lette</button>
                  </div>
                  {[
                    { icon:'card', tone:ADM.DANGER, text:`${LOCALI.filter(l=>l.pagamentoFallito).length} addebiti falliti da recuperare`, when:'2 g fa', go:()=>setRoute('locali') },
                    { icon:'shield', tone:ADM.WARN, text:`${CERTIFICAZIONI.filter(c=>c.stato==='pending').length} certificazioni in attesa di revisione`, when:'oggi', go:()=>setRoute('comunicazioni') },
                    { icon:'ticket', tone:ADM.PINK, text:`${SEGNALAZIONI.filter(x=>x.stato==='nuova').length} nuove segnalazioni dai locali`, when:'35 min fa', go:()=>setRoute('comunicazioni') },
                    { icon:'clock', tone:ADM.WARN, text:'13 onboarding fermi da oltre 7 giorni', when:'ieri', go:()=>setRoute('locali') },
                  ].map((n, i) => {
                    const NIcon = BuIcons[n.icon];
                    return (
                      <button key={i} className="adm-actionrow" onClick={()=>{ setNotifOpen(false); n.go(); }} style={{
                        display:'flex', alignItems:'center', gap:11, width:'100%', textAlign:'left',
                        padding:'11px 16px', background:'transparent', border:'none',
                        borderBottom: i === 3 ? 'none' : `1px solid ${ADM.BORDER_SOFT}`,
                        cursor:'pointer', fontFamily:'inherit',
                      }}>
                        <span style={{width:30, height:30, borderRadius:8, background:`${n.tone}18`, color:n.tone, display:'grid', placeItems:'center', flexShrink:0}}><NIcon size={16}/></span>
                        <span style={{flex:1, fontSize:13, color:ADM.TEXT, lineHeight:1.35}}>{n.text}</span>
                        <span style={{fontSize:11.5, color:ADM.MUTED_SOFT, flexShrink:0}}>{n.when}</span>
                      </button>
                    );
                  })}
                </div>
              </React.Fragment>
            )}
          </div>
        </header>

        <div style={{flex:1, overflow:'auto'}}>
          {route === 'dashboard'    && <AdmDashboard onNav={setRoute}/>}
          {route === 'locali'       && <AdmLocaliPage search={''} openLocale={localiOpenLocale}/>}
          {route === 'camerieri'    && <AdmCamerieriPage search={''} openStaff={staffOpen}/>}
          {route === 'utenti'       && <AdmUtentiPage search={''} openUtente={utentiOpen}/>}
          {route === 'assistenza'   && <AdmAssistenzaPage initialTab={assistenzaTab} openTicket={commOpen}/>}
          {/* onNavRoute serve al riesame accessi per portare al Cruscotto degli
              adempimenti, che è dove si cambia la cadenza del riesame. */}
          {route === 'sicurezza'    && <AdmTeamPage search={''} initialTab={teamTab} sezione="sicurezza"
            onNavRoute={(r, t)=>{ setConfTab(t || null); setRoute(r); }}/>}
          {route === 'team'         && <AdmTeamPage search={''} initialTab={teamTab} sezione="impostazioni"/>}
          {route === 'economix'     && (window.Economix ? <Economix/> : null)}
          {route === 'conformita'   && <AdmConformitaPage initialTab={confTab}
            onNavRoute={(r, t)=>{ setTeamTab(t || null); setRoute(r); }}/>}
          {route === 'promozioni'   && <AdmPromozioniPage onNew={()=>openMessageModal('utenti', [])}/>}
          {route === 'profilo'      && <ProfiloPage/>}
        </div>
      </main>

      {searchOpen && <GlobalSearch onClose={()=>setSearchOpen(false)} go={(r, opts)=>setRoute(r, opts)}/>}

      <MessageModal
        open={!!messageModal} onClose={closeMessageModal}
        audienceType={messageModal?.type || 'utenti'}
        presetIds={messageModal?.ids || []}
      />
    </div>
  );
}

// ---------- PROFILO ----------
function ProfiloPage() {
  const [pwd1, setPwd1] = useStateApp('');
  const [pwd2, setPwd2] = useStateApp('');
  const [pwd3, setPwd3] = useStateApp('');
  const [twofa, setTwofa] = useStateApp(false);
  const [showQr, setShowQr] = useStateApp(false);

  const pwdOk = pwd2.length >= 8 && pwd2 === pwd3 && pwd1.length > 0;

  return (
    <div style={{padding:'24px 28px', display:'flex', flexDirection:'column', gap:14}}>
      {/* Header card */}
      <AdmCard padding={22}>
        <div style={{display:'flex', alignItems:'center', gap:18}}>
          <div style={{
            width:52, height:52, borderRadius:'50%',
            background:'linear-gradient(135deg, #FF5A5F, #B53338)',
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
        <div style={{marginTop:16, display:'flex', gap:8}}>
          <AdmButton variant="primary" size="md" icon="check" disabled={!pwdOk}>Aggiorna password</AdmButton>
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
          <AdmSwitch checked={twofa} onChange={(v) => { if (twofa && !v) { setTwofa(false); setShowQr(false); } else if (!twofa && v) { setShowQr(true); } }}/>
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
                <input maxLength={6} placeholder="123 456" style={{
                  flex:1, padding:'9px 12px', border:`1px solid ${ADM.BORDER}`, borderRadius:7,
                  fontSize:15.1, fontFamily:'ui-monospace,monospace', letterSpacing:'0.2em', textAlign:'center', outline:'none',
                }}/>
                <AdmButton variant="primary" size="md" onClick={()=>{ setTwofa(true); setShowQr(false); }}>Attiva 2FA</AdmButton>
                <AdmButton variant="ghost" size="md" onClick={()=>setShowQr(false)}>Annulla</AdmButton>
              </div>
            </div>
          </div>
        )}

        {twofa && (
          <div style={{padding:14, background:ADM.OK_SOFT, borderRadius:8, border:`1px solid #BBF7D0`, display:'flex', gap:10, alignItems:'center'}}>
            <BuIcons.check size={21} color={ADM.OK}/>
            <div style={{flex:1, fontSize:14, color:'#065F46'}}>2FA configurata con app Authenticator. Conserva i codici di recupero in un posto sicuro.</div>
            <AdmButton variant="ghost" size="sm">Codici di recupero</AdmButton>
          </div>
        )}
      </AdmCard>

      {/* Sessioni attive */}
      <AdmCard padding={22}>
        <div style={{fontSize:15.1, fontWeight:600, color:ADM.TEXT, marginBottom:14}}>Sessioni attive</div>
        {[
          { device:'Mac · Chrome', loc:'Milano', when:'In uso ora', current:true },
          { device:'iPhone · Safari', loc:'Milano', when:'2 ore fa', current:false },
          { device:'Mac · Firefox', loc:'Milano', when:'3 giorni fa', current:false },
        ].map((s,i,a) => (
          <div key={i} style={{display:'flex', alignItems:'center', gap:12, padding:'11px 0', borderBottom: i === a.length-1 ? 'none' : `1px solid ${ADM.BORDER_SOFT}`}}>
            <div style={{width:32, height:32, borderRadius:7, background:ADM.PANEL_SOFT, color:ADM.MUTED, display:'grid', placeItems:'center'}}><BuIcons.user size={19}/></div>
            <div style={{flex:1}}>
              <div style={{fontSize:14, fontWeight:600, color:ADM.TEXT}}>{s.device}</div>
              <div style={{fontSize:13.3, color:ADM.MUTED}}>{s.loc} · {s.when}</div>
            </div>
            {s.current ? <AdmBadge color="OK" size="xs">Sessione attuale</AdmBadge> : <button className="adm-textlink" style={{background:'transparent', border:'none', color:ADM.DANGER, fontSize:13.3, fontWeight:600, cursor:'pointer', fontFamily:'inherit'}}>Termina</button>}
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
