// Notifiche dropdown — campanella + tendina condivisa cross-page

const PN_NOTIFICATIONS = [
  {
    id: 'n1',
    type: 'update',
    icon: 'sparkles',
    title: 'Nuova versione di byup disponibile',
    body: 'Abbiamo migliorato la gestione del calendario prenotazioni e aggiunto i grafici predittivi.',
    time: '2 ore fa',
    unread: true,
  },
  {
    id: 'n2',
    type: 'payment',
    icon: 'commerce-bank-cards',
    title: 'Pagamento ricevuto',
    body: 'Hai ricevuto €1.247,80 sul tuo conto Stripe. Disponibile entro 2 giorni lavorativi.',
    time: 'Ieri',
    unread: true,
  },
  {
    id: 'n3',
    type: 'system',
    icon: 'chart-bar',
    title: 'Report mensile pronto',
    body: 'Il riepilogo di aprile 2026 è disponibile in Statistiche. +12% vs marzo.',
    time: '2 giorni fa',
    unread: true,
  },
  {
    id: 'n4',
    type: 'tip',
    icon: 'status-tip',
    title: 'Suggerimento da byup',
    body: 'Hai 3 piatti senza foto nel menù. Aggiungile per aumentare gli ordini fino al 30%.',
    time: '4 giorni fa',
    unread: false,
  },
  {
    id: 'n5',
    type: 'billing',
    icon: 'commerce-receipt',
    title: 'Fattura del piano Premium',
    body: 'La fattura di aprile (€49,00) è disponibile in Contabilità → Fatture.',
    time: '1 settimana fa',
    unread: false,
  },
  {
    id: 'n6',
    type: 'feature',
    icon: 'status-feature',
    title: 'Promozioni: nuova feature',
    body: 'Ora puoi creare promo a tempo che appaiono in vetrina. Provala in Statistiche.',
    time: '2 settimane fa',
    unread: false,
  },
];

function PnNotifBell({ dropUp = false }) {
  const [open, setOpen] = React.useState(false);
  const [items, setItems] = React.useState(PN_NOTIFICATIONS);
  const ref = React.useRef(null);
  const unreadCount = items.filter(i => i.unread).length;

  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const markAllRead = () => setItems(items.map(i => ({...i, unread: false})));

  return (
    <div ref={ref} style={{position:'relative'}}>
      <button onClick={() => setOpen(o => !o)} style={{
        position:'relative',
        width: 36, height: 36, borderRadius: 10,
        border: `1px solid ${PN.BORDER}`,
        background: open ? PN.SIDE_BG : PN.WHITE, color: PN.TEXT,
        cursor:'pointer',
        display:'grid', placeItems:'center',
      }}>
        <Icon name="bell" size={17} color={PN.TEXT}/>
        {unreadCount > 0 && (
          <span style={{
            position:'absolute', top: 5, right: 5,
            minWidth: 16, height: 16, padding: '0 4px', borderRadius: 999,
            background: PN.PINK, border:`2px solid ${PN.WHITE}`,
            color: '#fff', fontSize: 11.5, fontWeight: 800,
            display:'grid', placeItems:'center', lineHeight: 1,
          }}>{unreadCount}</span>
        )}
      </button>

      {open && (
        // Glass menu Apple Sonoma — il dropdown si sovrappone al main e le card
        // dietro creano vibrancy. blur(24px) saturate(180%) è il setting massimo
        // del nostro design system (vedi PN.GLASS_MENU).
        <div style={{
          position: 'absolute',
          // dropUp: usato dalla sidebar (in basso) — il menu si apre verso l'alto,
          // agganciato a sinistra così si distende sopra il contenuto principale.
          ...(dropUp
            ? { bottom: 'calc(100% + 8px)', left: 0 }
            : { top: 'calc(100% + 8px)', right: 0 }),
          width: 380,
          ...PN.GLASS_MENU,
          zIndex: 120,
          overflow: 'hidden',
          fontFamily: 'inherit',
        }}>
          <div style={{
            display:'flex', alignItems:'center', justifyContent:'space-between',
            padding: '14px 16px', borderBottom: `1px solid ${PN.BORDER_SOFT}`,
          }}>
            <div>
              <div style={{fontSize: 16, fontWeight: 700, color: PN.TEXT}}>Notifiche</div>
              <div style={{fontSize: 13.5, color: PN.MUTED, marginTop: 2}}>
                {unreadCount > 0 ? `${unreadCount} non lette` : 'Tutto letto ✓'}
              </div>
            </div>
            {unreadCount > 0 && (
              <button onClick={markAllRead} style={{
                background:'transparent', border:'none',
                color: PN.PINK, fontSize: 14, fontWeight: 600, fontFamily:'inherit',
                cursor:'pointer', padding: 0,
              }}>Segna come lette</button>
            )}
          </div>

          <div style={{maxHeight: 440, overflowY: 'auto'}} className="pn-scroll">
            {items.map(n => (
              <div key={n.id} style={{
                display:'flex', gap: 12,
                padding: '12px 16px',
                borderBottom: `1px solid ${PN.BORDER_SOFT}`,
                background: n.unread ? '#fff7fa' : PN.WHITE,
                cursor:'pointer',
                position:'relative',
              }}
                onMouseEnter={e => e.currentTarget.style.background = n.unread ? '#ffeef4' : '#fafafa'}
                onMouseLeave={e => e.currentTarget.style.background = n.unread ? '#fff7fa' : PN.WHITE}
              >
                {n.unread && (
                  <span style={{
                    position:'absolute', left: 6, top: 18,
                    width: 6, height: 6, borderRadius: '50%', background: PN.PINK,
                  }}/>
                )}
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: '#f4f4f6', flexShrink: 0,
                  display:'grid', placeItems:'center'
                }}><Icon name={SfIcons[n.icon] ? n.icon : 'bell'} size={16} color="#6B7280"/></div>
                <div style={{flex: 1, minWidth: 0}}>
                  <div style={{fontSize: 15, fontWeight: 600, color: PN.TEXT, marginBottom: 2, lineHeight: 1.35}}>{n.title}</div>
                  <div style={{fontSize: 14, color: PN.MUTED, lineHeight: 1.45, marginBottom: 4}}>{n.body}</div>
                  <div style={{fontSize: 13, color: '#a3a3ad', fontWeight: 500}}>{n.time}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{
            padding: '10px 16px', textAlign:'center',
            borderTop: `1px solid ${PN.BORDER_SOFT}`,
            background: '#fafafa',
          }}>
            <button style={{
              background:'transparent', border:'none',
              color: PN.TEXT, fontSize: 14, fontWeight: 600, fontFamily:'inherit',
              cursor:'pointer', padding: 0,
            }}>Vedi tutte le notifiche →</button>
          </div>
        </div>
      )}
    </div>
  );
}

window.PnNotifBell = PnNotifBell;

function PnWifiIcon({ color = '#9CA3AF', size = 15, weak = false }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{flexShrink:0, display:'block'}}>
      <path d="M1.42 9a16 16 0 0 1 21.16 0"
        stroke={color} strokeWidth="2" strokeLinecap="round"
        opacity={weak ? 0.2 : 1}/>
      <path d="M5 12.55a11 11 0 0 1 14.08 0"
        stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <path d="M8.53 16.11a6 6 0 0 1 6.95 0"
        stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <circle cx="12" cy="20" r="1.5" fill={color}/>
    </svg>
  );
}

function PnConnectionStatus() {
  const getStatus = () => {
    if (!navigator.onLine) return 'offline';
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (conn && (conn.effectiveType === 'slow-2g' || conn.effectiveType === '2g' ||
        (conn.downlink !== undefined && conn.downlink < 0.5))) return 'instabile';
    return 'online';
  };

  const [realStatus, setRealStatus] = React.useState(getStatus);
  const [demoOverride, setDemoOverride] = React.useState(null);
  const [showRestored, setShowRestored] = React.useState(false);

  React.useEffect(() => {
    const update = () => {
      setRealStatus(prev => {
        const next = getStatus();
        if (prev === 'offline' && next === 'online') {
          setShowRestored(true);
          setTimeout(() => setShowRestored(false), 2500);
        }
        return next;
      });
    };
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (conn) conn.addEventListener('change', update);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
      if (conn) conn.removeEventListener('change', update);
    };
  }, []);

  const DEMO_CYCLE = ['online', 'instabile', 'offline'];
  const handleDemoClick = () => {
    setDemoOverride(prev => {
      const current = prev ?? realStatus;
      const idx = DEMO_CYCLE.indexOf(current);
      const next = DEMO_CYCLE[(idx + 1) % DEMO_CYCLE.length];
      if (current === 'offline' && next === 'online') {
        setShowRestored(true);
        setTimeout(() => setShowRestored(false), 2500);
      }
      return next;
    });
  };

  const status = demoOverride ?? realStatus;
  const isOffline = status === 'offline';
  const isUnstable = status === 'instabile';

  return (
    <>
      <div
        onClick={handleDemoClick}
        title="Clicca per simulare stati connessione"
        style={{
          display:'flex', alignItems:'center', gap:5,
          padding: isUnstable ? '5px 9px' : '5px 7px',
          borderRadius:8,
          background: isUnstable ? '#FEF3C7' : isOffline ? '#FEE2E2' : 'transparent',
          border: `1px solid ${isUnstable ? '#FDE68A' : isOffline ? '#FECACA' : 'transparent'}`,
          cursor:'pointer',
          transition:'background .2s, border-color .2s',
        }}>
        <PnWifiIcon
          color={isUnstable ? '#D97706' : isOffline ? '#DC2626' : '#C4C9D4'}
          size={15}
          weak={isUnstable}
        />
        {isUnstable && (
          <span style={{fontSize:14, fontWeight:700, color:'#D97706', letterSpacing:0.1}}>
            Instabile
          </span>
        )}
      </div>

      {(isOffline || showRestored) && (
        <div style={{
          position:'fixed', top:0, left:0, right:0, zIndex:9999,
          background: showRestored ? '#15803D' : '#B91C1C',
          color:'#fff',
          display:'flex', alignItems:'center', justifyContent:'center', gap:8,
          padding:'11px 24px',
          fontSize:15.5, fontWeight:600, letterSpacing:0.1,
          boxShadow: showRestored
            ? '0 2px 12px rgba(21,128,61,0.2)'
            : '0 2px 16px rgba(185,28,28,0.25)',
          animation:'pn-banner-in .22s ease-out',
        }}>
          {showRestored
            ? '✓  Connessione ripristinata'
            : '⚠  Connessione assente — verifica la rete'}
        </div>
      )}
      <style>{`
        @keyframes pn-banner-in {
          from { transform: translateY(-100%); opacity: 0; }
          to   { transform: translateY(0);     opacity: 1; }
        }
      `}</style>
    </>
  );
}

window.PnWifiIcon = PnWifiIcon;
window.PnConnectionStatus = PnConnectionStatus;
