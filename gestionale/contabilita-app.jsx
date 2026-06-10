// App principale Contabilità

const { useState } = React;

function ContabilitaApp() {
  const [tab, setTab] = useState('cassa');
  const [cassaOpen, setCassaOpen] = useState(false);
  const [newCost, setNewCost] = useState(false);
  const [share, setShare] = useState(false);

  const today = new Date();
  const dateStr = today.toLocaleDateString('it-IT', {weekday:'long', day:'numeric', month:'long', year:'numeric'});

  // Stat globali
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
          display:'flex', alignItems:'flex-start', gap: 16,
          padding:'18px 28px 14px',
          borderBottom:`1px solid ${PN.BORDER_SOFT}`,
          background: PN.WHITE,
        }}>
          <div style={{flex:1}}>
            <h1 style={{margin:0, fontSize: 20, fontWeight: 700, color: PN.TEXT, letterSpacing:-0.3}}>Contabilità</h1>
            <div style={{fontSize: 12.5, color: PN.MUTED, marginTop: 2, textTransform:'capitalize'}}>{dateStr}</div>
          </div>
          <PnNotifBell/>
        </header>

        {/* Body */}
        <div className="pn-scroll" style={{flex:1, overflowY:'auto', padding:'18px 28px 32px', background:'#fafafa'}}>
          {/* Stat cards globali — sempre visibili */}
          <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap: 12, marginBottom: 16}}>
            <Stat label="Saldo cassa" value={`€ ${cassaSaldo.toFixed(2)}`} delta="+12,5%" up icon={<BuIcons.money size={18}/>}/>
            <Stat label="Costi del mese" value={`€ ${totalCosti.toFixed(2)}`} delta="−4,2%" down icon={<BuIcons.trendDown size={18}/>}/>
            <Stat label="Fatturato mese" value={`€ ${fatturatoMese.toFixed(2)}`} delta="+8,3%" up icon={<BuIcons.trendUp size={18}/>}/>
            <Stat label="Saldo IVA" value={`€ ${ivaSaldo.toFixed(2)}`} delta="+2,1%" up icon={<BuIcons.receipt size={18}/>}/>
          </div>

          {/* Tabs pill */}
          <div style={{display:'flex', gap: 8, marginBottom: 18}}>
            {[
              {id:'cassa', label:'Cassa'},
              {id:'costi', label:'Costi'},
              {id:'iva',   label:'IVA'},
              {id:'export', label:'Export'},
            ].map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                padding:'9px 22px',
                background: tab===t.id ? '#0F1115' : PN.WHITE,
                border: `1px solid ${tab===t.id ? '#0F1115' : PN.BORDER}`,
                color: tab===t.id ? '#fff' : PN.TEXT,
                borderRadius: 999, fontSize: 13, fontWeight: 700,
                cursor:'pointer', fontFamily:'inherit',
                transition:'all 0.15s',
              }}>{t.label}</button>
            ))}
          </div>

          {/* Tab content */}
          {tab==='cassa' && <ContCassa open={cassaOpen} setOpen={setCassaOpen}/>}
          {tab==='costi' && <ContCosti openNewCost={() => setNewCost(true)}/>}
          {tab==='iva'   && <ContIva/>}
          {tab==='export' && <ContExport openShare={() => setShare(true)}/>}
        </div>

        <ContNuovoCosto open={newCost} onClose={() => setNewCost(false)}/>
        <ContShareModal open={share} onClose={() => setShare(false)}/>
      </main>
    </div>
  );
}

function Stat({ label, value, delta, up, down, icon }) {
  return (
    <div style={{
      background: PN.WHITE, border:`1px solid ${PN.BORDER}`,
      borderRadius: 12, padding: 14,
      display:'flex', alignItems:'center', gap: 12,
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 10,
        background: PN.SIDE_BG, color: PN.MUTED, display:'grid', placeItems:'center',
      }}>{icon}</div>
      <div style={{flex:1, minWidth:0}}>
        <div style={{fontSize: 11.5, color: PN.MUTED, marginBottom: 2, fontWeight: 500}}>{label}</div>
        <div style={{display:'flex', alignItems:'baseline', gap: 8}}>
          <strong style={{fontSize: 16, fontWeight: 700, color: PN.TEXT, letterSpacing: -0.3, fontVariantNumeric:'tabular-nums'}}>{value}</strong>
          {delta && <span style={{
            fontSize: 11, fontWeight: 700,
            color: down ? PN.RED : PN.GREEN,
          }}>{up?'↑':'↓'} {delta}</span>}
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<ContabilitaApp/>);
