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

  const items = [
    { id: 'panoramica',   label: 'Panoramica',        icon: 'grid' },
    modules.sala         && { id: 'sala',         label: 'Sala',              icon: 'place-table' },
    { id: 'vendita',      label: 'Vendita diretta',   icon: 'commerce-cart' },
    modules.prenotazioni && { id: 'prenotazioni', label: 'Prenotazioni',      icon: 'time-calendar' },
    { id: 'cucina',       label: 'Cucina',             icon: 'food-flame' },
    { id: 'statistiche',  label: 'Statistiche',        icon: 'chart-bar' },
    { id: 'contabilita',  label: 'Contabilità',        icon: 'commerce-wallet' },
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
      width: collapsed ? 68 : 252,
      flexShrink: 0,
      ...PN.GLASS_VIBRANT,
      display: 'flex', flexDirection: 'column',
      padding: collapsed ? '20px 10px' : '20px 14px',
      height: '100%',
      position: 'relative',
      transition: 'width 220ms cubic-bezier(0.4, 0, 0.2, 1), padding 220ms cubic-bezier(0.4, 0, 0.2, 1)',
      overflow: 'hidden',
    }}>
      <GlassMeshSubstrate/>

      {/* Logo row */}
      <div style={{
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
              <span style={{color:'#fff', fontWeight: 800, fontSize: 13, letterSpacing: '-0.03em'}}>B</span>
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

      {!collapsed && <PnSidebarPlanCard/>}

      {/* System actions */}
      <div style={{
        display: 'flex', gap: collapsed ? 0 : 4,
        flexDirection: collapsed ? 'column' : 'row',
        paddingTop: 10, marginBottom: 10,
      }}>
        {sys.map(it => (
          <PnSysItem key={it.id} {...it} collapsed={collapsed} active={active === it.id} onClick={() => navTo(it.id)} />
        ))}
      </div>

      {/* Profile */}
      <button title="Profilo" onClick={() => { window.location.href = 'byup Profilo.html'; }} style={{
        display: 'flex', alignItems: 'center', gap: collapsed ? 0 : 10,
        justifyContent: collapsed ? 'center' : 'flex-start',
        padding: collapsed ? '10px 0' : '10px 8px',
        border: 'none', background: 'transparent',
        cursor: 'pointer', fontFamily: 'inherit',
        textAlign: 'left', width: '100%',
        borderRadius: 8,
        borderTop: `1px solid ${PN.BORDER}`,
        paddingTop: 14,
      }}
        onMouseEnter={e => { e.currentTarget.style.background = '#f0f1f3'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
      >
        <div style={{
          width: 34, height: 34, borderRadius: '50%',
          background: 'linear-gradient(135deg, #FF5A5F, #B53338)',
          color: '#fff', display: 'grid', placeItems: 'center',
          fontWeight: 700, fontSize: 13, flexShrink: 0,
        }}>MS</div>
        {!collapsed && (
          <div style={{minWidth: 0, flex: 1}}>
            <div style={{fontSize: 13, fontWeight: 600, color: PN.TEXT, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>Marco Silvestri</div>
            <div style={{fontSize: 11, color: PN.MUTED, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>Trattoria del Borgo</div>
          </div>
        )}
      </button>
    </aside>
  );
}

function PnNavItem({ label, icon, badge, active, onClick, collapsed }) {
  const activeStyle = active ? {
    background: 'rgba(255, 224, 221, 0.65)',
    backgroundImage:
      'linear-gradient(to bottom, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0) 100%)',
    backdropFilter: 'blur(10px) saturate(160%)',
    WebkitBackdropFilter: 'blur(10px) saturate(160%)',
    boxShadow:
      'inset 0 1px 0 rgba(255,255,255,0.75), ' +
      'inset 0 0 0 1px rgba(242, 107, 122, 0.20), ' +
      '0 2px 6px -2px rgba(190, 24, 93, 0.10)',
  } : {};

  return (
    <button onClick={onClick}
      className={active ? 'glass-shimmer' : ''}
      title={collapsed ? label : undefined}
      style={{
        display: 'flex', alignItems: 'center',
        gap: collapsed ? 0 : 12,
        justifyContent: collapsed ? 'center' : 'flex-start',
        padding: collapsed ? '9px' : '9px 10px',
        borderRadius: 10,
        border: 'none',
        color: active ? PN.PINK_DARK : PN.TEXT,
        fontWeight: active ? 600 : 500,
        fontSize: 13.5,
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
        <Icon name={icon} size={18}/>
      </span>
      {!collapsed && <span style={{flex: 1, position: 'relative', zIndex: 3}}>{label}</span>}
      {!collapsed && badge != null && (
        <span className={active ? 'glass-pulse-glow' : ''} style={{
          fontSize: 10.5, fontWeight: 700,
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
  const activeStyle = active ? {
    background: 'rgba(255, 224, 221, 0.60)',
    backgroundImage:
      'linear-gradient(to bottom, rgba(255,255,255,0.50) 0%, rgba(255,255,255,0.06) 55%, rgba(255,255,255,0) 100%)',
    backdropFilter: 'blur(8px) saturate(160%)',
    WebkitBackdropFilter: 'blur(8px) saturate(160%)',
    boxShadow:
      'inset 0 1px 0 rgba(255,255,255,0.70), ' +
      'inset 0 0 0 1px rgba(242, 107, 122, 0.18)',
  } : {};

  return (
    <button onClick={onClick} title={label}
      style={{
        flex: collapsed ? 'unset' : 1,
        width: collapsed ? '100%' : 'auto',
        display: 'flex', alignItems: 'center',
        justifyContent: 'center',
        gap: collapsed ? 0 : 6,
        padding: collapsed ? '8px' : '8px 6px',
        borderRadius: 10,
        border: 'none',
        color: active ? PN.PINK_DARK : PN.MUTED,
        fontWeight: active ? 600 : 500,
        fontSize: 11.5,
        cursor: 'pointer',
        fontFamily: 'inherit',
        position: 'relative',
        transition: 'background 160ms ease, color 160ms ease',
        ...activeStyle,
      }}
      onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(15, 17, 21, 0.045)'; e.currentTarget.style.color = PN.TEXT; } }}
      onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = PN.MUTED; } }}
    >
      <Icon name={icon} size={14}/>
      {!collapsed && <span>{label}</span>}
    </button>
  );
}

window.PnSidebar = PnSidebar;
