// App principale Contabilità — v2
// Modifiche: icon set SVG, KPI ridisegnate, tab unificate, responsive, design tokens

const { useState } = React;

// Tokens (C) caricati da contabilita-v2-tokens.jsx

function ContabilitaApp() {
  const [tab, setTab] = useState('cassa');
  const [cassaOpen, setCassaOpen] = useState(false);
  const [newCost, setNewCost] = useState(false);
  const [share, setShare] = useState(false);
  const [ivaMonth, setIvaMonth] = useState(null); // mese selezionato per filtro

  const today = new Date();
  const dateStr = today.toLocaleDateString('it-IT', {weekday:'long', day:'numeric', month:'long', year:'numeric'});

  const totalCosti = COSTS_DATA.reduce((s,c) => s+c.amount, 0);
  const cassaSaldo = CASH_MOVEMENTS.reduce((s,m) => s+m.amount, 0) + 500;
  const ivaSaldo = IVA_MONTHLY.reduce((s,m) => s+(m.deb-m.cred), 0);
  const fatturatoMese = 24150;

  return (
    <div className="frame" style={{position:'relative'}}>
      <GlassMeshSubstrate tone="neutral"/>
      <PnSidebar active="contabilita"/>
      <main style={{flex:1, display:'flex', flexDirection:'column', overflow:'hidden', position:'relative'}}>
        {/* Header */}
        <header style={{
          display:'flex', alignItems:'center', gap: 14,
          padding:'18px 28px 14px',
          borderBottom:`1px solid ${PN.BORDER_SOFT}`,
          background: PN.WHITE,
        }}>
          <span style={{
            width: 38, height: 38, borderRadius: 10,
            background: PN.PINK_SOFT, color: PN.PINK_DARK,
            display: 'grid', placeItems: 'center', flexShrink: 0,
          }}>
            <Icon name="commerce-receipt" size={20}/>
          </span>
          <div style={{flex:1}}>
            <h1 style={{margin:0, fontSize: C.T_XL, fontWeight: 700, color: PN.TEXT, letterSpacing:-0.5}}>Contabilità</h1>
            <div style={{fontSize: C.T_SM, color: PN.MUTED, marginTop: 2, textTransform:'capitalize'}}>{dateStr}</div>
          </div>
          <PnNotifBell/>
        </header>

        {/* Body */}
        <div className="pn-scroll" style={{flex:1, overflowY:'auto', padding:'20px 28px 32px', background: C.SURF}}>
          {/* KPI banner dark-glass — UN solo gradient Byup applicato all'intero
              banner, 4 tile interni separati da divider sottili bianchi.
              Radius più rounded (20px) per dare carattere al banner come oggetto
              unico, non come grid di 4 card distinte. */}
          <GlassDarkBox
            borderRadius={20}
            padding={0}
            style={{
              display:'grid',
              gridTemplateColumns:'repeat(4, minmax(0, 1fr))',
              marginBottom: 20,
              overflow: 'hidden',
            }}>
            <Kpi label="Saldo cassa"     value={cassaSaldo} delta="+12,5%" up   icon={Ic.receipt}   tooltip="vs ieri"            divider/>
            <Kpi label="Costi del mese"  value={totalCosti} delta="−4,2%"  down icon={Ic.trendDown} tooltip="vs mese scorso"     divider/>
            <Kpi label="Fatturato mese"  value={fatturatoMese} delta="+8,3%" up icon={Ic.trendUp}   tooltip="vs mese scorso"     divider/>
            <Kpi label="Saldo IVA"       value={ivaSaldo}    delta="+2,1%" up  icon={Ic.invoice}   tooltip="vs trim. scorso"/>
          </GlassDarkBox>

          {/* Primary tabs — underline pattern (più sobrio, meno brand-loaded) */}
          <div style={{
            display:'flex', gap: 4, marginBottom: 22,
            borderBottom: `1px solid ${PN.BORDER}`,
          }}>
            {[
              {id:'cassa', label:'Cassa', icon:'commerce-coins'},
              {id:'costi', label:'Costi', icon:'commerce-price-tag'},
              {id:'iva',   label:'IVA',   icon:'commerce-receipt'},
              {id:'export', label:'Export', icon:'download'},
            ].map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                position:'relative',
                display:'inline-flex', alignItems:'center', gap: 7,
                padding:'10px 18px',
                background: 'transparent',
                border: 'none',
                color: tab===t.id ? PN.TEXT : PN.MUTED,
                fontSize: C.T_SM, fontWeight: tab===t.id ? 700 : 500,
                cursor:'pointer', fontFamily:'inherit',
                marginBottom: -1,
                borderBottom: `2px solid ${tab===t.id ? PN.PINK : 'transparent'}`,
              }}>
                <Icon name={t.icon} size={14}/>
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {tab==='cassa' && <ContCassa open={cassaOpen} setOpen={setCassaOpen}/>}
          {tab==='costi' && <ContCosti openNewCost={() => setNewCost(true)}/>}
          {tab==='iva'   && <ContIva month={ivaMonth} setMonth={setIvaMonth}/>}
          {tab==='export' && <ContExport openShare={() => setShare(true)}/>}
        </div>

        <ContNuovoCosto open={newCost} onClose={() => setNewCost(false)}/>
        <ContShareModal open={share} onClose={() => setShare(false)}/>
      </main>
    </div>
  );
}

function Kpi({ label, value, delta, up, down, icon: I, tooltip, divider }) {
  const formatted = (typeof value === 'number')
    ? `€ ${value.toLocaleString('it-IT', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`
    : value;
  // KPI tile interno del banner light-coral. Testo DARK WINE per leggibilità
  // sopra il gradient salmone chiaro. Divider verticale wine-soft.
  return (
    <div style={{
      padding: '20px 22px',
      display:'flex', flexDirection:'column', gap: 10,
      minWidth: 0,
      position: 'relative',
      borderRight: divider ? '1px solid rgba(124, 45, 60, 0.18)' : 'none',
    }}>
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
        <span style={{fontSize: C.T_XS, color: 'rgba(58, 10, 14, 0.70)', fontWeight: 600, letterSpacing: 0.3, textTransform:'uppercase'}}>{label}</span>
        <span style={{
          color: '#7C2D3C',
          display: 'inline-grid', placeItems: 'center',
          width: 28, height: 28, borderRadius: 8,
          background: 'rgba(255, 255, 255, 0.45)',
          boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.55), 0 1px 2px rgba(124, 45, 60, 0.10)',
        }}><I size={16}/></span>
      </div>
      <div style={{
        fontSize: C.T_XL, fontWeight: 700, color: '#3A0A0E',
        letterSpacing: -0.6, fontVariantNumeric:'tabular-nums',
        lineHeight: 1.1,
      }}>{formatted}</div>
      {delta && (
        <div style={{display:'flex', alignItems:'center', gap: 6, fontSize: C.T_XS}} title={tooltip}>
          <span style={{
            display:'inline-flex', alignItems:'center', gap: 3,
            color: down ? '#B91C1C' : '#15803D',
            fontWeight: 700,
          }}>
            {up ? <Ic.arrowUp size={12} stroke={2.4}/> : <Ic.arrowDn size={12} stroke={2.4}/>} {delta}
          </span>
          <span style={{color: 'rgba(58, 10, 14, 0.55)'}}>{tooltip}</span>
        </div>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<ContabilitaApp/>);
