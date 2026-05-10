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
    { id: 'panoramica', label: 'Panoramica', icon: 'Panoramica' },
    { id: 'prenotazioni', label: 'Sala & Prenotazioni', icon: 'Calendar', badge: 3 },
    { id: 'cucina', label: 'Cucina', icon: 'Kitchen' },
    { id: 'statistiche', label: 'Statistiche', icon: 'Stats' },
    { id: 'contabilita', label: 'Contabilità', icon: 'Money' },
  ];

  // System actions: piccole, in footer sopra il profilo
  const sys = [
    { id: 'supporto', label: 'Supporto', icon: 'Headset' },
    { id: 'impostazioni', label: 'Impostazioni', icon: 'Settings' },
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
    <aside style={{
      width: 232,
      flexShrink: 0,
      // Vibrancy macOS-style: gradient verticale sottile dal canvas off-white
      // a un grigio molto chiaro. Crea separazione visiva dal main bianco senza
      // un border solido pesante. Pattern preso dalla sidebar di Sonoma.
      ...PN.GLASS_VIBRANT,
      display: 'flex', flexDirection: 'column',
      padding: '20px 14px',
      height: '100%',
    }}>
      <div style={{padding: '2px 6px 24px', flexShrink: 0}}>
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
  const Icon = PnI[icon];
  return (
    <button onClick={onClick} style={{
      display:'flex', alignItems:'center', gap:12,
      padding: '9px 10px',
      borderRadius: 8,
      border: 'none',
      background: active ? PN.SIDE_ACTIVE_BG : 'transparent',
      color: active ? PN.PINK_DARK : PN.TEXT,
      fontWeight: active ? 600 : 500,
      fontSize: 13.5,
      cursor: 'pointer',
      textAlign:'left',
      fontFamily:'inherit',
      width: '100%',
      transition: 'background 0.12s',
    }}
      onMouseEnter={e => { if(!active) e.currentTarget.style.background = '#f0f1f3'; }}
      onMouseLeave={e => { if(!active) e.currentTarget.style.background = 'transparent'; }}
    >
      <span style={{display:'inline-flex', color: active ? PN.PINK : PN.MUTED}}>
        <Icon size={18}/>
      </span>
      <span style={{flex:1}}>{label}</span>
      {badge != null && (
        <span style={{
          fontSize: 10.5, fontWeight: 700,
          color: PN.WHITE, background: PN.PINK,
          padding: '2px 7px', borderRadius: 999,
          minWidth: 18, textAlign:'center',
        }}>{badge}</span>
      )}
    </button>
  );
}

// Compact pill button for system actions (Settings/Support) in footer
function PnSysItem({ label, icon, active, onClick }) {
  const Icon = PnI[icon];
  return (
    <button onClick={onClick} title={label} style={{
      flex: 1,
      display:'flex', alignItems:'center', justifyContent:'center', gap: 6,
      padding: '8px 6px',
      borderRadius: 8,
      border: 'none',
      background: active ? PN.SIDE_ACTIVE_BG : 'transparent',
      color: active ? PN.PINK_DARK : PN.MUTED,
      fontWeight: active ? 600 : 500,
      fontSize: 11.5,
      cursor: 'pointer',
      fontFamily:'inherit',
      transition: 'background 0.12s, color 0.12s',
    }}
      onMouseEnter={e => { if(!active){ e.currentTarget.style.background = '#f0f1f3'; e.currentTarget.style.color = PN.TEXT; } }}
      onMouseLeave={e => { if(!active){ e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = PN.MUTED; } }}
    >
      <Icon size={14}/>
      <span>{label}</span>
    </button>
  );
}

window.PnSidebar = PnSidebar;
