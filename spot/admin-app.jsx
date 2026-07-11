// Byup Spot — shell principale con sidebar e router

const { useState: useStateApp } = React;

const NAV_GROUPS = [
  { title: null, items: [
    { id: 'dashboard', label: 'Dashboard', icon: 'home' },
  ]},
  { title: 'Operatività', items: [
    { id: 'locali', label: 'Locali', icon: 'store', badge: LOCALI.filter(l=>l.stato==='onboarding').length },
    { id: 'camerieri', label: 'Staff', icon: 'waiter' },
    { id: 'utenti', label: 'Utenti App', icon: 'users' },
  ]},
  { title: 'Supporto', items: [
    { id: 'comunicazioni', label: 'Comunicazioni', icon: 'chat', badge: (SEGNALAZIONI.filter(s=>s.stato==='nuova').length + CERTIFICAZIONI.filter(c=>c.stato==='pending').length), badgeColor: 'PINK' },
  ]},
  { title: 'Marketing', items: [
    { id: 'promozioni', label: 'Promozioni', icon: 'megaphone' },
  ]},
  { title: 'Amministrazione', items: [
    { id: 'team', label: 'Team admin', icon: 'shieldUser' },
  ]},
];

function AdminApp({ tweaks }) {
  const [route, setRouteRaw] = useStateApp('dashboard');
  const [messageModal, setMessageModal] = useStateApp(null);
  const [localiOpenLocale, setLocaliOpenLocale] = useStateApp(null);

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
    <div style={{
      display:'flex', height:'100vh', width:'100vw', overflow:'hidden',
      fontFamily: 'Manrope, ui-sans-serif, system-ui, sans-serif',
      background: ADM.PANEL_SOFT, color: ADM.TEXT,
    }}>
      {/* Sidebar */}
      <aside style={{
        width: 288, flexShrink:0,
        background:'rgba(250,250,251,0.85)',
        backdropFilter:'saturate(180%) blur(20px)',
        WebkitBackdropFilter:'saturate(180%) blur(20px)',
        borderRight:`1px solid ${ADM.BORDER}`,
        display:'flex', flexDirection:'column',
      }}>
        <div style={{padding:'18px 18px 14px', display:'flex', alignItems:'center', gap:11}}>
          <div style={{
            width:34, height:34, borderRadius:10,
            background: `linear-gradient(135deg, #FF7074, ${ADM.PINK_DARK})`,
            color:'#fff', display:'grid', placeItems:'center',
            fontWeight:800, fontSize:23, letterSpacing:'-0.04em',
            boxShadow:'0 4px 10px -3px rgba(255,90,95,0.45), inset 0 1px 0 rgba(255,255,255,0.25)',
          }}>B</div>
          <div style={{minWidth:0}}>
            <div style={{fontSize:21.5, fontWeight:700, color:ADM.TEXT, letterSpacing:'-0.02em'}}>byup</div>
            <div style={{fontSize:17, color:ADM.MUTED, fontWeight:600, marginTop:0, letterSpacing:'0.08em', textTransform:'uppercase'}}>Spot</div>
          </div>
        </div>

        <nav style={{flex:1, overflowY:'auto', padding:'6px 10px 14px'}}>
          {NAV_GROUPS.map((group, gi) => (
            <div key={gi} style={{marginTop: gi === 0 ? 0 : 16}}>
              {group.title && (
                <div style={{fontSize:17, fontWeight:700, color:ADM.MUTED_SOFT, textTransform:'uppercase', letterSpacing:'0.08em', padding:'8px 10px 6px'}}>{group.title}</div>
              )}
              {group.items.map(item => {
                const Icon = BuIcons[item.icon];
                const active = route === item.id;
                return (
                  <button key={item.id} onClick={()=>setRoute(item.id)}
                    className={`adm-nav-item${active ? ' is-active' : ''}`}
                    style={{
                      width:'100%', display:'flex', alignItems:'center', gap:10,
                      padding:'8px 10px',
                      background: active ? '#fff' : 'transparent',
                      color: active ? ADM.TEXT : ADM.TEXT,
                      border:'none', borderRadius:8,
                      fontSize:20, fontWeight: active ? 600 : 500,
                      letterSpacing:'-0.01em',
                      cursor:'pointer', fontFamily:'inherit', marginBottom:2, textAlign:'left',
                      boxShadow: active ? '0 1px 2px rgba(15,17,21,0.06), 0 0 0 0.5px rgba(15,17,21,0.04)' : 'none',
                    }}>
                    <Icon size={20} color={active ? ADM.PINK : ADM.MUTED}/>
                    <span style={{flex:1}}>{item.label}</span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span style={{
                        fontSize:17, fontWeight:700,
                        background: item.badgeColor ? ADM[item.badgeColor] : 'rgba(120,120,128,0.18)',
                        color: item.badgeColor ? '#fff' : ADM.MUTED,
                        padding:'1.5px 6px', borderRadius:99, minWidth: 18, textAlign:'center',
                        boxShadow: item.badgeColor ? '0 1px 2px rgba(0,0,0,0.10)' : 'none',
                      }}>{item.badge}</span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        <button onClick={()=>setRoute('profilo')}
          className="adm-nav-item"
          style={{
            margin:'8px 10px 10px', padding:'10px 10px',
            borderTop:'none',
            display:'flex', alignItems:'center', gap:10,
            background: route === 'profilo' ? '#fff' : 'transparent',
            border:'none', borderRadius:10, cursor:'pointer', fontFamily:'inherit', textAlign:'left',
            boxShadow: route === 'profilo' ? '0 1px 2px rgba(15,17,21,0.06), 0 0 0 0.5px rgba(15,17,21,0.04)' : 'none',
          }}>
          <AdmAvatar name="Marco Rinaldi" size={37}/>
          <div style={{flex:1, minWidth:0}}>
            <div style={{fontSize:19.5, fontWeight:600, color:ADM.TEXT, letterSpacing:'-0.01em'}}>Marco Rinaldi</div>
            <div style={{fontSize:17.5, color:ADM.MUTED, marginTop:1}}>Super Admin</div>
          </div>
          <span style={{color: ADM.MUTED_SOFT}}><BuIcons.chevronRight size={18}/></span>
        </button>
      </aside>

      {/* Main */}
      <main style={{flex:1, display:'flex', flexDirection:'column', overflow:'hidden'}}>
        <header style={{
          padding:'18px 32px',
          background:'#ffffff',
          borderBottom:`1px solid ${ADM.BORDER}`,
          display:'flex', alignItems:'center', gap:14, flexShrink:0,
        }}>
          <div style={{flex:1}}>
            <div style={{fontSize:27, fontWeight:700, color:ADM.TEXT, letterSpacing:'-0.025em', lineHeight:1.15}}>{pt.t}</div>
            <div style={{fontSize:19.5, color:ADM.MUTED, marginTop:3, letterSpacing:'-0.005em'}}>{pt.s}</div>
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
          <AdmAvatar name="Marco Rinaldi" size={69}/>
          <div style={{flex:1}}>
            <div style={{fontSize:27, fontWeight:700, color:ADM.TEXT, letterSpacing:'-0.01em'}}>Marco Rinaldi</div>
            <div style={{fontSize:19.5, color:ADM.MUTED, marginTop:3}}>marco.rinaldi@byup.it · Super Admin</div>
            <div style={{fontSize:18.5, color:ADM.MUTED_SOFT, marginTop:4}}>Account creato il 14 gen 2024 · Ultimo accesso oggi alle 09:42</div>
          </div>
        </div>
      </AdmCard>

      {/* Password */}
      <AdmCard padding={22}>
        <div style={{fontSize:21, fontWeight:600, color:ADM.TEXT, marginBottom:4}}>Cambia password</div>
        <div style={{fontSize:19, color:ADM.MUTED, marginBottom:16}}>Usa almeno 8 caratteri, con lettere e numeri</div>
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
              <div style={{fontSize:21, fontWeight:600, color:ADM.TEXT}}>Autenticazione a due fattori (2FA)</div>
              {twofa && <AdmBadge color="OK" size="xs">Attiva</AdmBadge>}
            </div>
            <div style={{fontSize:19, color:ADM.MUTED, marginTop:4, lineHeight:1.5}}>
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
              <div style={{fontSize:20, fontWeight:600, color:ADM.TEXT, marginBottom:4}}>1 · Scansiona il QR code</div>
              <div style={{fontSize:19, color:ADM.MUTED, lineHeight:1.5, marginBottom:14}}>
                Apri la tua app di autenticazione (Google Authenticator, Authy, 1Password) e scansiona il codice qui a sinistra. Oppure inserisci la chiave manualmente:
                <div style={{marginTop:8, padding:'8px 10px', background:'#fff', border:`1px solid ${ADM.BORDER}`, borderRadius:6, fontFamily:'ui-monospace,monospace', fontSize:18.5, color:ADM.TEXT, letterSpacing:'0.06em'}}>JBSW Y3DP EHPK 3PXP</div>
              </div>
              <div style={{fontSize:20, fontWeight:600, color:ADM.TEXT, marginBottom:6}}>2 · Inserisci il codice a 6 cifre</div>
              <div style={{display:'flex', gap:8}}>
                <input maxLength={6} placeholder="123 456" style={{
                  flex:1, padding:'9px 12px', border:`1px solid ${ADM.BORDER}`, borderRadius:7,
                  fontSize:21, fontFamily:'ui-monospace,monospace', letterSpacing:'0.2em', textAlign:'center', outline:'none',
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
            <div style={{flex:1, fontSize:19.5, color:'#065F46'}}>2FA configurata con app Authenticator. Conserva i codici di recupero in un posto sicuro.</div>
            <AdmButton variant="ghost" size="sm">Codici di recupero</AdmButton>
          </div>
        )}
      </AdmCard>

      {/* Sessioni attive */}
      <AdmCard padding={22}>
        <div style={{fontSize:21, fontWeight:600, color:ADM.TEXT, marginBottom:14}}>Sessioni attive</div>
        {[
          { device:'Mac · Chrome', loc:'Milano', when:'In uso ora', current:true },
          { device:'iPhone · Safari', loc:'Milano', when:'2 ore fa', current:false },
          { device:'Mac · Firefox', loc:'Milano', when:'3 giorni fa', current:false },
        ].map((s,i,a) => (
          <div key={i} style={{display:'flex', alignItems:'center', gap:12, padding:'11px 0', borderBottom: i === a.length-1 ? 'none' : `1px solid ${ADM.BORDER_SOFT}`}}>
            <div style={{width:32, height:32, borderRadius:7, background:ADM.PANEL_SOFT, color:ADM.MUTED, display:'grid', placeItems:'center'}}><BuIcons.user size={19}/></div>
            <div style={{flex:1}}>
              <div style={{fontSize:19.5, fontWeight:600, color:ADM.TEXT}}>{s.device}</div>
              <div style={{fontSize:18.5, color:ADM.MUTED}}>{s.loc} · {s.when}</div>
            </div>
            {s.current ? <AdmBadge color="OK" size="xs">Sessione attuale</AdmBadge> : <button style={{background:'transparent', border:'none', color:ADM.DANGER, fontSize:18.5, fontWeight:600, cursor:'pointer', fontFamily:'inherit'}}>Termina</button>}
          </div>
        ))}
      </AdmCard>
    </div>
  );
}

function ProfField({ label, type='text', value, onChange, hint }) {
  return (
    <div>
      <label style={{fontSize:18.5, color:ADM.MUTED, fontWeight:600, display:'block', marginBottom:6, letterSpacing:'-0.005em'}}>{label}</label>
      <input type={type} value={value} onChange={e=>onChange(e.target.value)} style={{
        width:'100%', padding:'10px 13px',
        border:`1px solid ${ADM.BORDER}`,
        background:'#fff',
        borderRadius:9, fontSize:20.5, fontFamily:'inherit', outline:'none', boxSizing:'border-box',
        color:ADM.TEXT, letterSpacing:'-0.005em',
      }}/>
      {hint && <div style={{fontSize:18.5, color:ADM.DANGER, marginTop:5, fontWeight:500}}>{hint}</div>}
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
