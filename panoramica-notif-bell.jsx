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

function PnNotifBell() {
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
            color: '#fff', fontSize: 9.5, fontWeight: 800,
            display:'grid', placeItems:'center', lineHeight: 1,
          }}>{unreadCount}</span>
        )}
      </button>

      {open && (
        // Glass menu Apple Sonoma — il dropdown si sovrappone al main e le card
        // dietro creano vibrancy. blur(24px) saturate(180%) è il setting massimo
        // del nostro design system (vedi PN.GLASS_MENU).
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', right: 0,
          width: 380,
          ...PN.GLASS_MENU,
          zIndex: 50,
          overflow: 'hidden',
          fontFamily: 'inherit',
        }}>
          <div style={{
            display:'flex', alignItems:'center', justifyContent:'space-between',
            padding: '14px 16px', borderBottom: `1px solid ${PN.BORDER_SOFT}`,
          }}>
            <div>
              <div style={{fontSize: 14, fontWeight: 700, color: PN.TEXT}}>Notifiche</div>
              <div style={{fontSize: 11.5, color: PN.MUTED, marginTop: 2}}>
                {unreadCount > 0 ? `${unreadCount} non lette` : 'Tutto letto ✓'}
              </div>
            </div>
            {unreadCount > 0 && (
              <button onClick={markAllRead} style={{
                background:'transparent', border:'none',
                color: PN.PINK, fontSize: 12, fontWeight: 600, fontFamily:'inherit',
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
                  <div style={{fontSize: 13, fontWeight: 600, color: PN.TEXT, marginBottom: 2, lineHeight: 1.35}}>{n.title}</div>
                  <div style={{fontSize: 12, color: PN.MUTED, lineHeight: 1.45, marginBottom: 4}}>{n.body}</div>
                  <div style={{fontSize: 11, color: '#a3a3ad', fontWeight: 500}}>{n.time}</div>
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
              color: PN.TEXT, fontSize: 12, fontWeight: 600, fontFamily:'inherit',
              cursor:'pointer', padding: 0,
            }}>Vedi tutte le notifiche →</button>
          </div>
        </div>
      )}
    </div>
  );
}

window.PnNotifBell = PnNotifBell;
