// Sidebar — primary nav

const PN_PAGES = {
  panoramica: 'byup Panoramica.html',
  sala: 'byup Sala.html?tab=tavoli',
  vendita: 'byup Sala.html?tab=vendita',
  prenotazioni: 'byup Sala.html?tab=calendar',
  cucina: 'byup Cucina.html',
  statistiche: 'byup Statistiche.html',
  contabilita: 'byup Contabilita.html',
  impostazioni: 'byup Impostazioni.html',
  supporto: 'byup Supporto.html',
  profilo: 'byup Profilo.html',
};

// Moduli abilitati — condivisi via localStorage tra pagine
const BYUP_MODULES_KEY = 'byup_modules_enabled';
window.byupReadModules = function() {
  try {
    const s = localStorage.getItem(BYUP_MODULES_KEY);
    return s ? Object.assign({sala:true, prenotazioni:true}, JSON.parse(s)) : {sala:true, prenotazioni:true};
  } catch(e) { return {sala:true, prenotazioni:true}; }
};
window.byupWriteModules = function(m) {
  try {
    localStorage.setItem(BYUP_MODULES_KEY, JSON.stringify(m));
    // Notifica i listener della stessa pagina (storage event nativo fira solo per altre tab)
    window.dispatchEvent(new Event('byup-modules-change'));
  } catch(e) {}
};

// Locale attivo — quello su cui opera il gestionale; condiviso via localStorage.
// Si cambia da Profilo → I tuoi locali; la sidebar lo mostra sotto il nome utente.
const BYUP_LOCALE_KEY = 'byup_locale_attivo';
window.byupReadLocale = function() {
  try {
    const s = localStorage.getItem(BYUP_LOCALE_KEY);
    if (s) { const v = JSON.parse(s); if (v && v.id && v.nome) return v; }
  } catch(e) {}
  return { id: 'cp', nome: 'Cacio e Pepe' };
};
window.byupWriteLocale = function(l) {
  try {
    localStorage.setItem(BYUP_LOCALE_KEY, JSON.stringify(l));
    window.dispatchEvent(new Event('byup-locale-change'));
  } catch(e) {}
};

function PnSidebar({ active = 'panoramica', onNav }) {
  const [collapsed, setCollapsed] = React.useState(() => {
    try { return localStorage.getItem('pn_sidebar_collapsed') === '1'; } catch(e) { return false; }
  });

  const toggle = () => setCollapsed(c => {
    const next = !c;
    try { localStorage.setItem('pn_sidebar_collapsed', next ? '1' : '0'); } catch(e) {}
    return next;
  });

  // Moduli abilitati — reattivi a cambi di localStorage (stessa pagina + cross-tab)
  const [modules, setModulesState] = React.useState(() => window.byupReadModules());
  React.useEffect(() => {
    const update = () => setModulesState(window.byupReadModules());
    window.addEventListener('byup-modules-change', update);
    window.addEventListener('storage', update);
    return () => {
      window.removeEventListener('byup-modules-change', update);
      window.removeEventListener('storage', update);
    };
  }, []);

  // Locale attivo — mostrato sotto il nome utente, reattivo al cambio da Profilo
  const [localeAttivo, setLocaleAttivo] = React.useState(() => window.byupReadLocale());

  React.useEffect(() => {
    const update = () => setLocaleAttivo(window.byupReadLocale());
    window.addEventListener('byup-locale-change', update);
    window.addEventListener('storage', update);
    return () => {
      window.removeEventListener('byup-locale-change', update);
      window.removeEventListener('storage', update);
    };
  }, []);

  const items = [
    { id: 'panoramica',   label: 'Panoramica',        icon: 'grid' },
    modules.sala         && { id: 'sala',         label: 'Sala',              icon: 'place-table' },
    { id: 'vendita',      label: 'Vendita diretta',   icon: 'commerce-register' },
    modules.prenotazioni && { id: 'prenotazioni', label: 'Prenotazioni',      icon: 'time-calendar' },
    { id: 'cucina',       label: 'Cucina',             icon: 'food-flame' },
    { id: 'statistiche',  label: 'Statistiche',        icon: 'chart-bar' },
    { id: 'contabilita',  label: 'Contabilità',        icon: 'commerce-piggy-bank' },
  ].filter(Boolean);

  const sys = [
    { id: 'supporto',     label: 'Supporto',    icon: 'headphones' },
    { id: 'impostazioni', label: 'Impostazioni', icon: 'gear' },
  ];

  const navTo = (id) => {
    if (onNav) return onNav(id);
    const url = PN_PAGES[id];
    if (url) window.location.href = url;
  };

  return (
    <aside style={{
      width: collapsed ? 68 : 272,
      flexShrink: 0,
      ...PN.GLASS_VIBRANT,
      display: 'flex', flexDirection: 'column',
      padding: collapsed ? '20px 10px' : '20px 14px',
      height: '100%',
      position: 'relative',
      transition: 'width 220ms cubic-bezier(0.4, 0, 0.2, 1), padding 220ms cubic-bezier(0.4, 0, 0.2, 1)',
      // overflow visibile + zIndex: il menu notifiche (in basso) deve potersi
      // distendere sopra il contenuto principale senza essere clippato.
      overflow: 'visible',
      zIndex: 60,
    }}>
      <GlassMeshSubstrate/>

      {/* Logo row — doppio click: demo stati connessione (online → instabile → offline) */}
      <div
        onDoubleClick={() => window.dispatchEvent(new Event('byup-conn-demo'))}
        style={{
        display: 'flex', alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
        paddingBottom: 24, flexShrink: 0, position: 'relative',
      }}>
        {!collapsed && (
          <div style={{paddingLeft: 6}}>
            <PnI.Logo />
          </div>
        )}
        {collapsed && (
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8}}>
            <div style={{
              width: 32, height: 32, borderRadius: 9,
              background: 'linear-gradient(135deg, #FF5A5F, #B53338)',
              display: 'grid', placeItems: 'center', flexShrink: 0,
            }}>
              <span style={{color:'#fff', fontWeight: 800, fontSize: 15, letterSpacing: '-0.03em'}}>B</span>
            </div>
            <button onClick={toggle} title="Espandi menu" style={{
              width: 26, height: 26, borderRadius: 7,
              border: `1px solid ${PN.BORDER_LIGHT}`,
              background: PN.WHITE_HUSH,
              color: PN.MUTED, cursor: 'pointer',
              display: 'grid', placeItems: 'center',
              flexShrink: 0,
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          </div>
        )}
        {!collapsed && (
          <button onClick={toggle} title="Comprimi menu" style={{
            width: 26, height: 26, borderRadius: 7,
            border: `1px solid ${PN.BORDER_LIGHT}`,
            background: PN.WHITE_HUSH,
            color: PN.MUTED, cursor: 'pointer',
            display: 'grid', placeItems: 'center',
            flexShrink: 0,
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
        )}
      </div>

      {/* Nav items */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', gap: 2,
        minHeight: 0, overflowY: 'auto',
      }}>
        {items.map(it => (
          <PnNavItem key={it.id} {...it} collapsed={collapsed} active={active === it.id} onClick={() => navTo(it.id)} />
        ))}
      </div>

      {/* Stato connessione — event-driven, sopra la plan card: quando compare
          ruba spazio solo alla nav scrollabile, tutto ciò che sta sotto
          (piano, Supporto, Impostazioni, Notifiche, profilo) resta immobile. */}
      {window.PnConnectionStatus && <window.PnConnectionStatus variant="mini" collapsed={collapsed}/>}

      {!collapsed && <PnSidebarPlanCard/>}

      {/* System actions */}
      <div style={{
        display: 'flex', gap: collapsed ? 0 : 2,
        flexDirection: 'column',
        paddingTop: 10, marginBottom: 10,
      }}>
        {sys.map(it => (
          <PnSysItem key={it.id} {...it} collapsed={collapsed} active={active === it.id} onClick={() => navTo(it.id)} />
        ))}
      </div>

      {/* Notifiche — voce di sistema con badge (l'header è stato eliminato). */}
      <div style={{
        display: 'flex', flexDirection: 'column',
        marginBottom: 10,
        position: 'relative',
      }}>
        {window.PnNotifBell && <window.PnNotifBell sidebar collapsed={collapsed}/>}
      </div>

      {/* Profile — click: pagina Profilo */}
      <div title="Profilo" onClick={() => navTo('profilo')} style={{
        display: 'flex', alignItems: 'center', gap: collapsed ? 0 : 10,
        justifyContent: collapsed ? 'center' : 'flex-start',
        padding: collapsed ? '10px 0' : '10px 8px',
        cursor: 'pointer', fontFamily: 'inherit',
        textAlign: 'left', width: '100%', boxSizing: 'border-box',
        borderRadius: 8,
        borderTop: `1px solid ${PN.BORDER}`,
        paddingTop: 14,
        transition: 'background 160ms ease',
      }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(15, 17, 21, 0.045)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
      >
        <div style={{
          width: 34, height: 34, borderRadius: '50%',
          background: 'linear-gradient(135deg, #FF5A5F, #B53338)',
          color: '#fff', display: 'grid', placeItems: 'center',
          fontWeight: 700, fontSize: 15, flexShrink: 0,
        }}>MR</div>
        {!collapsed && (
          <div style={{minWidth: 0, flex: 1}}>
            <div style={{fontSize: 15, fontWeight: 600, color: PN.TEXT, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>Mario Rossi</div>
            <div style={{fontSize: 13, color: PN.MUTED, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{localeAttivo.nome}</div>
          </div>
        )}
      </div>
    </aside>
  );
}

function PnNavItem({ label, icon, badge, active, onClick, collapsed }) {
  // Attivo = tinta brand piatta. Niente gloss verticale, bevel o shimmer:
  // il 2.5D sui bottoni è fuori dal design system.
  const activeStyle = active ? {
    background: PN.SIDE_ACTIVE_BG,
  } : {};

  return (
    <button onClick={onClick}
      title={collapsed ? label : undefined}
      style={{
        display: 'flex', alignItems: 'center',
        gap: collapsed ? 0 : 12,
        justifyContent: collapsed ? 'center' : 'flex-start',
        padding: collapsed ? '9px' : '9px 10px',
        borderRadius: 10,
        border: 'none',
        // Base esplicita: senza, i <button> mostrano il grigio UA al load
        background: 'transparent',
        color: active ? PN.PINK_DARK : PN.TEXT,
        fontWeight: active ? 600 : 500,
        fontSize: 19.5,
        cursor: 'pointer',
        textAlign: 'left',
        fontFamily: 'inherit',
        width: '100%',
        position: 'relative',
        transition: 'background 160ms ease, transform 160ms ease',
        ...activeStyle,
      }}
      onMouseEnter={e => {
        if (!active) e.currentTarget.style.background = 'rgba(15, 17, 21, 0.045)';
        else e.currentTarget.style.transform = 'translateX(1px)';
      }}
      onMouseLeave={e => {
        if (!active) e.currentTarget.style.background = 'transparent';
        else e.currentTarget.style.transform = 'translateX(0)';
      }}
    >
      <span style={{display: 'inline-flex', color: active ? PN.PINK : PN.MUTED, position: 'relative', zIndex: 3}}>
        {/* Icone più grandi a menu esteso; 22px quando è contratto */}
        <Icon name={icon} size={collapsed ? 22 : 26}/>
      </span>
      {!collapsed && <span style={{flex: 1, position: 'relative', zIndex: 3}}>{label}</span>}
      {!collapsed && badge != null && (
        <span className={active ? 'glass-pulse-glow' : ''} style={{
          fontSize: 12.5, fontWeight: 700,
          color: PN.WHITE, background: PN.PINK,
          padding: '2px 7px', borderRadius: 999,
          minWidth: 18, textAlign: 'center',
          position: 'relative', zIndex: 3,
        }}>{badge}</span>
      )}
      {collapsed && badge != null && (
        <span style={{
          position: 'absolute', top: 7, right: 7,
          width: 7, height: 7, borderRadius: '50%',
          background: PN.PINK,
          boxShadow: '0 0 0 1.5px white',
        }}/>
      )}
    </button>
  );
}

function PnSysItem({ label, icon, active, onClick, collapsed }) {
  // Flat come i nav item principali.
  const activeStyle = active ? {
    background: PN.SIDE_ACTIVE_BG,
  } : {};

  return (
    <button onClick={onClick} title={label}
      style={{
        flex: 'unset',
        width: '100%',
        display: 'flex', alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'flex-start',
        gap: collapsed ? 0 : 12,
        padding: collapsed ? '8px' : '9px 10px',
        borderRadius: 10,
        border: 'none',
        background: 'transparent',
        color: active ? PN.PINK_DARK : PN.MUTED,
        fontWeight: active ? 600 : 500,
        fontSize: 17.5,
        cursor: 'pointer',
        fontFamily: 'inherit',
        position: 'relative',
        transition: 'background 160ms ease, color 160ms ease',
        ...activeStyle,
      }}
      onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(15, 17, 21, 0.045)'; e.currentTarget.style.color = PN.TEXT; } }}
      onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = PN.MUTED; } }}
    >
      <Icon name={icon} size={collapsed ? 18 : 21}/>
      {!collapsed && <span>{label}</span>}
    </button>
  );
}

window.PnSidebar = PnSidebar;
