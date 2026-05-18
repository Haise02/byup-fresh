// Sidebar — primary nav

const PN_PAGES = {
  panoramica: 'byup Panoramica.html',
  prenotazioni: 'byup Sala v3.html',  // canonical (v1, v2 deprecati e rimossi)
  cucina: 'byup Cucina.html',
  statistiche: 'byup Statistiche.html',
  contabilita: 'byup Contabilita.html',
  impostazioni: 'byup Impostazioni.html',
  supporto: 'byup Supporto.html',
};

function PnSidebar({ active = 'panoramica', onNav }) {
  const items = [
    { id: 'panoramica', label: 'Panoramica', icon: 'grid' },
    { id: 'prenotazioni', label: 'Sala & Prenotazioni', icon: 'time-calendar', badge: 3 },
    { id: 'cucina', label: 'Cucina', icon: 'food-flame' },
    { id: 'statistiche', label: 'Statistiche', icon: 'chart-bar' },
    { id: 'contabilita', label: 'Contabilità', icon: 'commerce-wallet' },
  ];

  // System actions: piccole, in footer sopra il profilo
  const sys = [
    { id: 'supporto', label: 'Supporto', icon: 'headphones' },
    { id: 'impostazioni', label: 'Impostazioni', icon: 'gear' },
  ];

  const navTo = (id) => {
    if (onNav) return onNav(id);
    const url = PN_PAGES[id];
    if (url) window.location.href = url;
  };

  return (
    // Sidebar fissa nel viewport — non scrolla insieme al main content.
    // Se l'altezza del frame è ridotta (laptop 13"), solo la lista nav interna
    // diventa scrollabile (overflow-y auto + min-height 0 sul wrapper flex);
    // logo, plan card, sys, profilo restano sempre visibili.
    //
    // position:relative qui serve a contenere il GlassMeshSubstrate
    // (absolute inset:0) che adesso aggiunge un tessuto caldo dietro al
    // gradient bianco di GLASS_VIBRANT, rendendo i pulsanti glass dell'active
    // state finalmente "leggibili" come vetro su materia colorata.
    <aside style={{
      width: 232,
      flexShrink: 0,
      ...PN.GLASS_VIBRANT,
      display: 'flex', flexDirection: 'column',
      padding: '20px 14px',
      height: '100%',
      position: 'relative',
    }}>
      <GlassMeshSubstrate/>
      <div style={{padding: '2px 6px 24px', flexShrink: 0, position:'relative'}}>
        <PnI.Logo />
      </div>

      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', gap: 2,
        // min-height:0 abilita lo scroll interno quando il contenuto eccede
        // (default flex-item è min-height:auto = blocca lo scroll)
        minHeight: 0,
        overflowY: 'auto',
      }}>
        {items.map(it => <PnNavItem key={it.id} {...it} active={active === it.id} onClick={() => navTo(it.id)} />)}
      </div>

      <PnSidebarPlanCard/>

      {/* System actions: compact, low-emphasis */}
      <div style={{display:'flex', gap: 4, paddingTop: 10, marginBottom: 10}}>
        {sys.map(it => (
          <PnSysItem key={it.id} {...it} active={active === it.id} onClick={() => navTo(it.id)} />
        ))}
      </div>

      <button title="Profilo" onClick={() => { window.location.href = 'byup Profilo.html'; }} style={{
        display:'flex', alignItems:'center', gap: 10,
        padding: '10px 8px',
        border: 'none', background: 'transparent',
        cursor: 'pointer', fontFamily:'inherit',
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
          color:'#fff', display:'grid', placeItems:'center',
          fontWeight:700, fontSize:13, flexShrink: 0,
        }}>MS</div>
        <div style={{minWidth:0, flex: 1}}>
          <div style={{fontSize:13, fontWeight:600, color:PN.TEXT, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>Marco Silvestri</div>
          <div style={{fontSize:11, color:PN.MUTED, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>Trattoria del Borgo</div>
        </div>
      </button>
    </aside>
  );
}

function PnNavItem({ label, icon, badge, active, onClick }) {
  // Active state: glass-subtle pink. NON un colore solido — è una superficie
  // a 4 layer (tint rgba + specular gradient + ring inset + drop shadow soft)
  // che ora ha materia su cui lavorare grazie al GlassMeshSubstrate
  // della sidebar. Un sottile shimmer-sweep continuo lo rende "vivo" senza
  // distogliere l'attenzione dal main content.
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
      style={{
      display:'flex', alignItems:'center', gap:12,
      padding: '9px 10px',
      borderRadius: 10,
      border: 'none',
      color: active ? PN.PINK_DARK : PN.TEXT,
      fontWeight: active ? 600 : 500,
      fontSize: 13.5,
      cursor: 'pointer',
      textAlign:'left',
      fontFamily:'inherit',
      width: '100%',
      position: 'relative',
      transition: 'background 160ms ease, transform 160ms ease',
      ...activeStyle,
    }}
      onMouseEnter={e => {
        if(!active) e.currentTarget.style.background = 'rgba(15, 17, 21, 0.045)';
        else e.currentTarget.style.transform = 'translateX(1px)';
      }}
      onMouseLeave={e => {
        if(!active) e.currentTarget.style.background = 'transparent';
        else e.currentTarget.style.transform = 'translateX(0)';
      }}
    >
      <span style={{display:'inline-flex', color: active ? PN.PINK : PN.MUTED, position:'relative', zIndex: 3}}>
        <Icon name={icon} size={18}/>
      </span>
      <span style={{flex:1, position:'relative', zIndex: 3}}>{label}</span>
      {badge != null && (
        <span className={active ? 'glass-pulse-glow' : ''} style={{
          fontSize: 10.5, fontWeight: 700,
          color: PN.WHITE, background: PN.PINK,
          padding: '2px 7px', borderRadius: 999,
          minWidth: 18, textAlign:'center',
          position: 'relative', zIndex: 3,
        }}>{badge}</span>
      )}
    </button>
  );
}

// Compact pill button for system actions (Settings/Support) in footer.
// Stesso pattern glass dell'active state di PnNavItem, ma più piccolo.
function PnSysItem({ label, icon, active, onClick }) {
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
      flex: 1,
      display:'flex', alignItems:'center', justifyContent:'center', gap: 6,
      padding: '8px 6px',
      borderRadius: 10,
      border: 'none',
      color: active ? PN.PINK_DARK : PN.MUTED,
      fontWeight: active ? 600 : 500,
      fontSize: 11.5,
      cursor: 'pointer',
      fontFamily:'inherit',
      position: 'relative',
      transition: 'background 160ms ease, color 160ms ease',
      ...activeStyle,
    }}
      onMouseEnter={e => { if(!active){ e.currentTarget.style.background = 'rgba(15, 17, 21, 0.045)'; e.currentTarget.style.color = PN.TEXT; } }}
      onMouseLeave={e => { if(!active){ e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = PN.MUTED; } }}
    >
      <Icon name={icon} size={14}/>
      <span>{label}</span>
    </button>
  );
}

window.PnSidebar = PnSidebar;
