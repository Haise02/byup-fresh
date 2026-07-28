// App principale Contabilità — v2
// Modifiche: icon set SVG, KPI ridisegnate, tab unificate, responsive, design tokens

const { useState } = React;

// Tokens (C) caricati da contabilita-v2-tokens.jsx

function ContabilitaApp() {
  const params = new URLSearchParams(window.location.search);
  const urlTab = params.get('tab') || 'conti';
  const urlFilter = params.get('filter') || 'all';

  const [tab, setTab] = useState(urlTab);
  const [contiFilter, setContiFilter] = useState(urlFilter);
  const [cassaOpen, setCassaOpen] = useState(false);
  const [newCost, setNewCost] = useState(false);
  const [share, setShare] = useState(false);
  const [ivaMonth, setIvaMonth] = useState(null); // mese selezionato per filtro

  const totalCosti = COSTS_DATA.reduce((s,c) => s+c.amount, 0);
  const cassaSaldo = CASH_MOVEMENTS.reduce((s,m) => s+m.amount, 0) + 500;
  const ivaSaldo = IVA_MONTHLY.reduce((s,m) => s+(m.deb-m.cred), 0);
  const fatturatoMese = 24150;

  return (
    <div className="frame" style={{position:'relative'}}>
      <GlassMeshSubstrate tone="neutral"/>
      <PnSidebar active="contabilita"/>
      <main style={{flex:1, display:'flex', flexDirection:'column', overflow:'hidden', position:'relative'}}>
        {/* Body */}
        <div className="pn-scroll" style={{flex:1, overflowY:'auto', padding:'20px 28px 32px', background: C.SURF}}>
          {/* KPI banner night-glass — slate scuro con accento coral discreto
              sull'angolo (nightAccent), 4 tile interni separati da divider
              sottili bianchi. Il warm coral pieno disturbava su una pagina
              densa di numeri; il night dà sobrietà finance mantenendo
              l'identità Byup. Radius più rounded (20px) per dare carattere
              al banner come oggetto unico, non come grid di 4 card distinte. */}
          <GlassDarkBox
            theme="night"
            nightAccent
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
            <Kpi label="Fatturato del mese"  value={fatturatoMese} delta="+8,3%" up icon={Ic.trendUp}   tooltip="vs mese scorso"     divider/>
            <Kpi label="Saldo IVA"       value={ivaSaldo}    delta="+2,1%" up  icon={Ic.invoice}   tooltip="vs trimestre scorso"/>
          </GlassDarkBox>

          {/* Primary tabs — underline pattern (più sobrio, meno brand-loaded) */}
          <div style={{
            display:'flex', gap: 4, marginBottom: 22,
            borderBottom: `1px solid ${PN.BORDER}`,
          }}>
            {[
              {id:'cassa', label:'Cassa', icon:'commerce-coins'},
              {id:'conti', label:'Conti', icon:'commerce-wallet'},
              {id:'costi', label:'Costi', icon:'commerce-price-tag'},
              {id:'iva',   label:'IVA',   icon:'commerce-receipt'},
              {id:'export', label:'Export', icon:'download'},
            ].map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                onMouseEnter={e => { if (tab !== t.id) { e.currentTarget.style.color = PN.TEXT; e.currentTarget.style.background = '#F4F5F7'; } }}
                onMouseLeave={e => { e.currentTarget.style.color = tab === t.id ? PN.TEXT : PN.MUTED; e.currentTarget.style.background = 'transparent'; e.currentTarget.style.transform = ''; }}
                onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.95)'; }}
                onMouseUp={e => { e.currentTarget.style.transform = ''; }}
                style={{
                position:'relative',
                display:'inline-flex', alignItems:'center', gap: 7,
                padding:'10px 18px',
                background: 'transparent',
                border: 'none',
                borderRadius: '9px 9px 0 0',
                color: tab===t.id ? PN.TEXT : PN.MUTED,
                fontSize: C.T_SM, fontWeight: tab===t.id ? 700 : 500,
                cursor:'pointer', fontFamily:'inherit',
                marginBottom: -1,
                borderBottom: `2px solid ${tab===t.id ? PN.PINK : 'transparent'}`,
                transition: 'color 140ms ease, background 140ms ease, transform 130ms ease',
              }}>
                <Icon name={t.icon} size={14}/>
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {tab==='cassa' && <ContCassa cassaOpen={cassaOpen} setCassaOpen={setCassaOpen}/>}
          {tab==='conti' && <ContConti filter={contiFilter}/>}
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
    ? `€ ${value.toLocaleString('it-IT', {minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: true})}`
    : value;
  // KPI tile interno del banner night. Testo chiaro per leggibilità sopra
  // lo slate scuro; delta in verde/rosso pastello (i toni saturi da light
  // theme sparivano sul fondo scuro). Divider verticale bianco-soft.
  return (
    <div
      onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)'; e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)'; e.currentTarget.style.zIndex = 2; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.background = ''; e.currentTarget.style.zIndex = ''; }}
      style={{
      padding: '20px 22px',
      display:'flex', flexDirection:'column', gap: 10,
      minWidth: 0,
      position: 'relative',
      borderRight: divider ? '1px solid rgba(255, 255, 255, 0.10)' : 'none',
      borderRadius: 12,
      transition: 'transform 180ms cubic-bezier(0.34, 1.45, 0.64, 1), background 150ms ease',
    }}>
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
        <span style={{fontSize: C.T_XS, color: 'rgba(255, 255, 255, 0.60)', fontWeight: 600, letterSpacing: 0.3, textTransform:'uppercase'}}>{label}</span>
        <span style={{
          color: '#F5F5F7',
          display: 'inline-grid', placeItems: 'center',
          width: 28, height: 28, borderRadius: 8,
          background: 'rgba(255, 255, 255, 0.08)',
          boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.12)',
        }}><I size={16}/></span>
      </div>
      <div style={{
        fontSize: C.T_XL, fontWeight: 700, color: '#F5F5F7',
        letterSpacing: -0.6, fontVariantNumeric:'tabular-nums',
        lineHeight: 1.1,
      }}>{formatted}</div>
      {delta && (
        <div style={{display:'flex', alignItems:'center', gap: 6, fontSize: C.T_XS}} title={tooltip}>
          <span style={{
            display:'inline-flex', alignItems:'center', gap: 3,
            color: down ? '#F87171' : '#4ADE80',
            fontWeight: 700,
          }}>
            {up ? <Ic.arrowUp size={12} stroke={2.4}/> : <Ic.arrowDn size={12} stroke={2.4}/>} {delta}
          </span>
          <span style={{color: 'rgba(255, 255, 255, 0.45)'}}>{tooltip}</span>
        </div>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<ContabilitaApp/>);
