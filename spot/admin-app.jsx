// Byup Spot — shell principale con sidebar e router

const { useState: useStateApp } = React;

// Nav piatta come nel gestionale: una lista principale + un gruppo "sistema"
// staccato in basso. Niente micro-header maiuscoli (Operatività/Marketing…):
// le icone + label bastano, e la sidebar respira.
const NAV_MAIN = [
  { id: 'dashboard',    label: 'Dashboard',    icon: 'home' },
  { id: 'locali',       label: 'Locali',       icon: 'store', badge: LOCALI.filter(l=>l.stato==='onboarding').length },
  { id: 'camerieri',    label: 'Staff',        icon: 'waiter' },
  { id: 'utenti',       label: 'Utenti App',   icon: 'users' },
  { id: 'comunicazioni', label: 'Comunicazioni', icon: 'chat', badge: (SEGNALAZIONI.filter(s=>s.stato==='nuova').length + CERTIFICAZIONI.filter(c=>c.stato==='pending').length) },
  { id: 'promozioni',   label: 'Promozioni',   icon: 'megaphone' },
];
const NAV_SYSTEM = [
  { id: 'team',         label: 'Team admin',   icon: 'shieldUser' },
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

function AdminApp({ tweaks }) {
  const [route, setRouteRaw] = useStateApp('dashboard');
  const [messageModal, setMessageModal] = useStateApp(null);
  const [localiOpenLocale, setLocaliOpenLocale] = useStateApp(null);

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
  const setRoute = (next, opts) => {
    if (next === 'locali' && opts && opts.openLocale) {
      setLocaliOpenLocale(opts.openLocale);
    } else {
      setLocaliOpenLocale(null);
    }
    setRouteRaw(next);
  };

  const openMessageModal = (type, ids = []) => setMessageModal({ type, ids });
  const closeMessageModal = () => setMessageModal(null);

  const pageTitles = {
    dashboard:    { t:'Dashboard', s:'Quadro generale e analytics della piattaforma' },
    locali:       { t:'Locali', s:'Ristoranti registrati e relativo onboarding' },
    camerieri:    { t:'Staff', s:'Staff registrato sui locali · camerieri, cassa, proprietari, dispositivi' },
    utenti:       { t:'Utenti App', s:'Clienti finali che usano l\'app byup' },
    comunicazioni: { t:'Comunicazioni', s:'Email, richieste e segnalazioni dai locali Byup Spot' },
    promozioni:   { t:'Promozioni', s:'Campagne e messaggi promozionali inviati' },
    team:         { t:'Team admin', s:'Membri dello staff byup e relativi permessi' },
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
        </header>

        <div style={{flex:1, overflow:'auto'}}>
          {route === 'dashboard'    && <AdmDashboard onNav={setRoute}/>}
          {route === 'locali'       && <AdmLocaliPage search={''} openLocale={localiOpenLocale}/>}
          {route === 'camerieri'    && <AdmCamerieriPage search={''}/>}
          {route === 'utenti'       && <AdmUtentiPage search={''}/>}
          {route === 'comunicazioni' && <AdmComunicazioniPage search={''}/>}
          {route === 'team'         && <AdmTeamPage search={''}/>}
          {route === 'promozioni'   && <AdmPromozioniPage onNew={()=>openMessageModal('utenti', [])}/>}
          {route === 'profilo'      && <ProfiloPage/>}
        </div>
      </main>

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
    <div style={{padding:28, maxWidth: 860, margin:'0 auto', display:'flex', flexDirection:'column', gap:16}}>
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

      {/* Password */}
      <AdmCard padding={22}>
        <div style={{fontSize:15.1, fontWeight:600, color:ADM.TEXT, marginBottom:4}}>Cambia password</div>
        <div style={{fontSize:13.7, color:ADM.MUTED, marginBottom:16}}>Usa almeno 8 caratteri, con lettere e numeri</div>
        <div style={{display:'flex', flexDirection:'column', gap:12, maxWidth:420}}>
          <ProfField label="Password attuale" type="password" value={pwd1} onChange={setPwd1}/>
          <ProfField label="Nuova password" type="password" value={pwd2} onChange={setPwd2} hint={pwd2.length > 0 && pwd2.length < 8 ? 'Almeno 8 caratteri' : ''}/>
          <ProfField label="Conferma nuova password" type="password" value={pwd3} onChange={setPwd3} hint={pwd3.length > 0 && pwd2 !== pwd3 ? 'Le password non coincidono' : ''}/>
        </div>
        <div style={{marginTop:16, display:'flex', gap:8}}>
          <AdmButton variant="primary" size="md" icon="check" disabled={!pwdOk}>Aggiorna password</AdmButton>
        </div>
      </AdmCard>

      {/* 2FA */}
      <AdmCard padding={22}>
        <div style={{display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:18, marginBottom: twofa || showQr ? 16 : 0}}>
          <div style={{flex:1}}>
            <div style={{display:'flex', alignItems:'center', gap:8}}>
              <div style={{fontSize:15.1, fontWeight:600, color:ADM.TEXT}}>Autenticazione a due fattori (2FA)</div>
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
            {s.current ? <AdmBadge color="OK" size="xs">Sessione attuale</AdmBadge> : <button style={{background:'transparent', border:'none', color:ADM.DANGER, fontSize:13.3, fontWeight:600, cursor:'pointer', fontFamily:'inherit'}}>Termina</button>}
          </div>
        ))}
      </AdmCard>
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
