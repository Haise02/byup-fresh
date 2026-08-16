// Sala v3 — App shell con pannello conti aperti laterale + tweaks soglie

function SvIconV3App({ path, size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={path}/>
    </svg>
  );
}

function SalaV3App() {
  const [tab, setTab] = React.useState('tavoli');
  const [focus, setFocus] = React.useState(false);
  const [modalAdd, setModalAdd] = React.useState(null);
  const [modalConti, setModalConti] = React.useState(false);
  const [modalPay, setModalPay] = React.useState(null);
  const [modalNuova, setModalNuova] = React.useState(false);
  const [datePickerOpen, setDatePickerOpen] = React.useState(false);
  const [contiCollapsed, setContiCollapsed] = React.useState(false);
  const [articoloSheet, setArticoloSheet] = React.useState(null);
  const [cart, setCart] = React.useState({ tableId: null, items: [] });
  const [confirmedToast, setConfirmedToast] = React.useState(null);
  const [, setBump] = React.useState(0);

  function handleConfirmCart() {
    const tableId = cart.tableId;
    const count = cart.items.reduce((s,i)=>s+i.qty,0);
    setCart({ tableId: null, items: [] });
    setArticoloSheet(null);
    setConfirmedToast(`✓ ${count} articol${count===1?'o':'i'} inviati alla cucina · T.${tableId}`);
    setTimeout(()=>setConfirmedToast(null), 2800);
  }

  const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
    "defaultView": "lista",
    "showConflicts": true,
    "noOrderWarn": 15,
    "noOrderAlert": 25,
    "overstay": 90,
    "oldBillHours": 3,
    "showContiPanel": true
  }/*EDITMODE-END*/;
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // Mantieni soglie globali sincronizzate
  React.useEffect(() => {
    window.SALA_V3_THRESHOLDS = {
      noOrderWarn: tweaks.noOrderWarn,
      noOrderAlert: tweaks.noOrderAlert,
      overstay: tweaks.overstay,
      oldBillHours: tweaks.oldBillHours,
    };
  }, [tweaks.noOrderWarn, tweaks.noOrderAlert, tweaks.overstay, tweaks.oldBillHours]);

  const tabs = [
    { id: 'tavoli', label: 'Tavoli', icon: 'place-table' },
    { id: 'vendita', label: 'Vendita diretta', icon: 'commerce-cart' },
    { id: 'calendar', label: 'Calendario prenotazioni', icon: 'time-calendar' },
  ];

  const showContiPanel = tweaks.showContiPanel && tab === 'tavoli' && !focus;

  return (
    <div style={{display:'flex', flex:1, minHeight:0}}>
      {!focus && <PnSidebar active="sala"/>}

      <main style={{flex:1, display:'flex', flexDirection:'column', minWidth: 0, position:'relative'}}>
        {!focus && (
          <header style={{
            display: 'flex', alignItems: 'center', gap: 16,
            padding: '20px 32px 18px',
            borderBottom: `1px solid ${PN.BORDER_HAIR}`,
            background: PN.WHITE_OFF,
          }}>
            <span style={{
              width: 40, height: 40, borderRadius: 11,
              background: PN.PINK_SOFT, color: PN.PINK_DARK,
              display: 'grid', placeItems: 'center', flexShrink: 0,
            }}>
              <Icon name="time-calendar" size={22}/>
            </span>
            <div style={{flex: 1, minWidth: 0}}>
              <h1 style={{margin: 0, fontSize: 24, fontWeight: 600, color: PN.TEXT, letterSpacing: '-0.02em'}}>
                Sala e prenotazioni
              </h1>
              <button onClick={() => setDatePickerOpen(o => !o)} style={{
                marginTop: 4,
                background: 'transparent', border: 'none', padding: 0,
                fontSize: 13, color: PN.MUTED, fontWeight: 500,
                cursor: 'pointer', fontFamily: 'inherit',
                display: 'inline-flex', alignItems: 'center', gap: 6,
                position: 'relative',
              }}>
                <SvIconV3App path="M3 4h18v18H3z M3 10h18 M8 2v4 M16 2v4" size={13}/>
                Martedì 9 Dicembre 2025
                <span style={{fontSize: 10}}>▾</span>
                {datePickerOpen && <DatePickerPopover onClose={() => setDatePickerOpen(false)}/>}
              </button>
            </div>

            <PnNotifBell/>
          </header>
        )}
        {!focus && <PnUnderlineTabs tabs={tabs} active={tab} onChange={setTab}/>}

        <div style={{flex:1, display:'flex', minHeight:0}}>
          <div className="pn-scroll" style={{
            flex: 1, overflow: 'auto',
            padding: focus ? '16px 24px 24px' : '20px 12px 32px 24px',
            background: PN.BG,
            minWidth: 0,
          }}>
            {tab === 'tavoli' && (
              <SalaV3Tavoli
                tweaks={tweaks}
                focus={focus}
                onToggleFocus={() => setFocus(f => !f)}
                onOpenAdd={(t) => {
                  // Siedi ospiti / Segna arrivato / Segna come pulito → trasforma stato del tavolo
                  if (t.state === 'libero' || t.state === 'prenotato') {
                    t.state = 'occupato';
                    t.coperti = t.coperti || (t.nextReservation?.posti || t.posti);
                    t.byup = t.byup || 0;
                    t.party = t.party || t.nextReservation?.name || null;
                    t.sittingMin = 0;
                    t.conto = 0;
                    t.ordini = t.ordini || [];
                  } else if (t.state === 'dapulire') {
                    t.state = 'libero';
                    delete t.freedMinAgo;
                  }
                  setBump(b => b + 1);
                }}
                onOpenPay={(t) => setModalPay(t)}
                onAddArticle={(t) => { setArticoloSheet(t); if (cart.tableId !== t.id) setCart({tableId:t.id, items:[]}); }}
                cart={cart}
                onCartChange={setCart}
                onConfirmCart={handleConfirmCart}
                onAdjustCoperti={(id, n) => {
                  const t = SALA_V3_TAVOLI.find(x => x.id === id);
                  if (t) { t.coperti = n; if (t.byup > n) t.byup = n; setBump(b => b + 1); }
                }}
              />
            )}
            {tab === 'vendita' && <SalaVenditaDiretta/>}
            {tab === 'calendar' && <SalaV3Calendario tweaks={tweaks} onNuova={() => setModalNuova(true)}/>}
          </div>

          {/* Pannello conti aperti laterale */}
          {showContiPanel && (
            <div style={{padding: '20px 12px 32px 0', flexShrink: 0, display:'flex'}}>
              <ContiApertiPanel
                collapsed={contiCollapsed}
                onToggle={() => setContiCollapsed(c => !c)}
                onSalda={(conto) => {
                  const idNum = parseInt(String(conto.tavolo).replace(/\D/g,''), 10);
                  const t = SALA_V3_TAVOLI.find(x => x.id === idNum);
                  if (t) setModalPay(t);
                }}/>
            </div>
          )}
        </div>

        <SalaV3ArticoloSheet
          open={!!articoloSheet} tavolo={articoloSheet}
          cart={cart} onCartChange={setCart}
          onClose={() => setArticoloSheet(null)}
          onConfirm={handleConfirmCart}/>

        {confirmedToast && (
          <div style={{
            position:'absolute', bottom: 24, left: '50%', transform:'translateX(-50%)',
            background:'#0F1115', color:'#fff',
            padding:'12px 22px', borderRadius: 999,
            fontSize: 13, fontWeight: 700, zIndex: 50,
            boxShadow:'0 8px 24px rgba(0,0,0,0.18)',
            animation:'fadeIn 0.2s ease',
          }}>{confirmedToast}</div>
        )}

        <SalaModalAggiungi open={!!modalAdd} onClose={() => setModalAdd(null)} tavolo={modalAdd}/>
        <SalaModalConti open={modalConti} onClose={() => setModalConti(false)}/>
        <SalaV3SaldaModal open={!!modalPay} onClose={() => setModalPay(null)} tavolo={modalPay}/>
        <SalaModalNuova open={modalNuova} onClose={() => setModalNuova(false)}/>

        <TweaksPanel>
        </TweaksPanel>
      </main>
    </div>
  );
}

function DatePickerPopover({ onClose }) {
  const days = Array.from({length: 35}, (_, i) => i - 6 + 1);
  const today = 9;
  return (
    <div onClick={(e)=>e.stopPropagation()} style={{
      position:'absolute', top:'calc(100% + 8px)', left: 0,
      width: 280, padding: 12,
      background: PN.WHITE, borderRadius: 12,
      boxShadow: '0 12px 36px rgba(0,0,0,0.15)',
      border: `1px solid ${PN.BORDER}`,
      zIndex: 30,
    }}>
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: 10}}>
        <button style={{background:'transparent', border:'none', cursor:'pointer', color: PN.TEXT, fontFamily:'inherit', fontSize: 14}}>‹</button>
        <span style={{fontSize: 13, fontWeight: 700, color: PN.TEXT}}>Dicembre 2025</span>
        <button style={{background:'transparent', border:'none', cursor:'pointer', color: PN.TEXT, fontFamily:'inherit', fontSize: 14}}>›</button>
      </div>
      <div style={{display:'grid', gridTemplateColumns:'repeat(7, 1fr)', gap: 2, fontSize: 10, color: PN.MUTED, textAlign:'center', marginBottom: 4}}>
        {['L','M','M','G','V','S','D'].map((d,i)=><span key={i} style={{padding: 4, fontWeight: 700}}>{d}</span>)}
      </div>
      <div style={{display:'grid', gridTemplateColumns:'repeat(7, 1fr)', gap: 2}}>
        {days.map((d, i) => {
          const valid = d>=1 && d<=31;
          const isToday = d === today;
          const hasReservations = valid && [9,10,12,13,14,16,18,20,23].includes(d);
          return (
            <button key={i} disabled={!valid} style={{
              padding: '6px 0', borderRadius: 6,
              background: isToday ? PN.TEXT : 'transparent',
              color: isToday ? '#fff' : (valid ? PN.TEXT : PN.MUTED_LIGHT),
              border: 'none', fontSize: 12, fontWeight: isToday ? 700 : 500,
              cursor: valid ? 'pointer' : 'default', fontFamily:'inherit',
              position:'relative', opacity: valid ? 1 : 0.3,
            }}>
              {valid ? d : ''}
              {hasReservations && !isToday && (
                <span style={{position:'absolute', bottom: 2, left:'50%', transform:'translateX(-50%)',
                  width: 4, height: 4, borderRadius:'50%', background: PN.PINK_DARK}}/>
              )}
            </button>
          );
        })}
      </div>
      <div style={{marginTop: 10, paddingTop: 10, borderTop: `1px dashed ${PN.BORDER_SOFT}`, display:'flex', gap: 8}}>
        <button style={{flex:1, padding:'7px 10px', borderRadius: 8, background: PN.WHITE, color: PN.TEXT,
          border: `1px solid ${PN.BORDER}`, fontSize: 12, fontWeight: 600, cursor:'pointer', fontFamily:'inherit'}}>Oggi</button>
        <button style={{flex:1, padding:'7px 10px', borderRadius: 8, background: PN.WHITE, color: PN.TEXT,
          border: `1px solid ${PN.BORDER}`, fontSize: 12, fontWeight: 600, cursor:'pointer', fontFamily:'inherit'}}>Domani</button>
      </div>
    </div>
  );
}

const salaV3Root = ReactDOM.createRoot(document.getElementById('root'));
salaV3Root.render(
  <div className="frame" data-screen-label="Sala v3">
    <GlassMeshSubstrate/>
    <SalaV3App/>
  </div>
);
