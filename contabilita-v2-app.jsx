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
      <PnSidebar active="contabilita"/>
      <main style={{flex:1, display:'flex', flexDirection:'column', overflow:'hidden', position:'relative'}}>
        {/* Header */}
        <header style={{
          display:'flex', alignItems:'flex-start', gap: 16,
          padding:'18px 28px 14px',
          borderBottom:`1px solid ${PN.BORDER_SOFT}`,
          background: PN.WHITE,
        }}>
          <div style={{flex:1}}>
            <h1 style={{margin:0, fontSize: C.T_XL, fontWeight: 700, color: PN.TEXT, letterSpacing:-0.5}}>Contabilità</h1>
            <div style={{fontSize: C.T_SM, color: PN.MUTED, marginTop: 2, textTransform:'capitalize'}}>{dateStr}</div>
          </div>
          <PnNotifBell/>
        </header>

        {/* Body */}
        <div className="pn-scroll" style={{flex:1, overflowY:'auto', padding:'20px 28px 32px', background: C.SURF}}>
          {/* KPI banner — numeri grandi, label sopra, layout arioso */}
          <div style={{
            display:'grid',
            gridTemplateColumns:'repeat(4, minmax(0, 1fr))',
            gap: 1,
            background: PN.BORDER_SOFT,
            border:`1px solid ${PN.BORDER}`,
            borderRadius: C.R_MD,
            overflow:'hidden',
            marginBottom: 20,
          }}>
            <Kpi label="Saldo cassa"     value={cassaSaldo} delta="+12,5%" up   icon={Ic.wallet}    tooltip="vs ieri"/>
            <Kpi label="Costi del mese"  value={totalCosti} delta="−4,2%"  down icon={Ic.trendDown} tooltip="vs mese scorso"/>
            <Kpi label="Fatturato mese"  value={fatturatoMese} delta="+8,3%" up icon={Ic.trendUp}  tooltip="vs mese scorso"/>
            <Kpi label="Saldo IVA"       value={ivaSaldo}    delta="+2,1%" up  icon={Ic.invoice}   tooltip="vs trim. scorso"/>
          </div>

          {/* Primary tabs — underline pattern (più sobrio, meno brand-loaded) */}
          <div style={{
            display:'flex', gap: 4, marginBottom: 22,
            borderBottom: `1px solid ${PN.BORDER}`,
          }}>
            {[
              {id:'cassa', label:'Cassa'},
              {id:'costi', label:'Costi'},
              {id:'iva',   label:'IVA'},
              {id:'export', label:'Export'},
            ].map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                position:'relative',
                padding:'10px 18px',
                background: 'transparent',
                border: 'none',
                color: tab===t.id ? PN.TEXT : PN.MUTED,
                fontSize: C.T_SM, fontWeight: tab===t.id ? 700 : 500,
                cursor:'pointer', fontFamily:'inherit',
                marginBottom: -1,
                borderBottom: `2px solid ${tab===t.id ? PN.PINK : 'transparent'}`,
              }}>{t.label}</button>
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

function Kpi({ label, value, delta, up, down, icon: I, tooltip }) {
  const formatted = (typeof value === 'number')
    ? `€ ${value.toLocaleString('it-IT', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`
    : value;
  return (
    <div style={{
      background: PN.WHITE,
      padding:'18px 22px',
      display:'flex', flexDirection:'column', gap: 10,
      minWidth: 0,
    }}>
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
        <span style={{fontSize: C.T_XS, color: PN.MUTED, fontWeight: 600, letterSpacing: 0.3, textTransform:'uppercase'}}>{label}</span>
        <span style={{color: PN.MUTED_SOFT}}><I size={16}/></span>
      </div>
      <div style={{
        fontSize: C.T_XL, fontWeight: 700, color: PN.TEXT,
        letterSpacing: -0.6, fontVariantNumeric:'tabular-nums',
        lineHeight: 1.1,
      }}>{formatted}</div>
      {delta && (
        <div style={{display:'flex', alignItems:'center', gap: 6, fontSize: C.T_XS}} title={tooltip}>
          <span style={{
            display:'inline-flex', alignItems:'center', gap: 3,
            color: down ? PN.RED : PN.GREEN,
            fontWeight: 700,
          }}>
            {up ? <Ic.arrowUp size={12} stroke={2.4}/> : <Ic.arrowDn size={12} stroke={2.4}/>} {delta}
          </span>
          <span style={{color: PN.MUTED_SOFT}}>{tooltip}</span>
        </div>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<ContabilitaApp/>);
