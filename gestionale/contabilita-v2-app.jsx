// App principale Contabilità — v2
// Modifiche: icon set SVG, KPI ridisegnate, tab unificate, responsive, design tokens

const { useState } = React;

// Tokens (C) caricati da contabilita-v2-tokens.jsx

function ContabilitaApp() {
  const params = new URLSearchParams(window.location.search);
  const urlTab = params.get('tab') || 'conti';
  const urlFilter = params.get('filter') || 'all';

  const [tab, setTab] = useState(urlTab);
  // Il filtro arriva dall'URL e non cambia più: non è stato, è una costante.
  const contiFilter = urlFilter;
  // Rimando da Cassa: la giornata e lo stato di trasmissione da mostrare in
  // Conti. Cassa riepiloga, Conti tiene la lista — una sola.
  const [contiFisc, setContiFisc] = useState(() => {
    const d = params.get('fiscData'), st = params.get('fiscStato');
    return d ? { data: d, stato: st || null } : null;
  });
  const [cassaOpen, setCassaOpen] = useState(false);
  const [newCost, setNewCost] = useState(false);
  const [share, setShare] = useState(false);
  const [ivaMonth, setIvaMonth] = useState(null); // mese selezionato per filtro

  // Scarti fiscali non gestiti: accendono il pallino sulla voce Contabilità.
  // Si spengono solo quando lo scarto è gestito — mai col tempo, mai per il
  // fatto di aver aperto la pagina.
  const [scartiFisc, setScartiFisc] = useState(() => window.byupScartiAperti ? window.byupScartiAperti() : 0);
  React.useEffect(() => {
    const agg = () => setScartiFisc(window.byupScartiAperti ? window.byupScartiAperti() : 0);
    window.addEventListener('byup-fisc-change', agg);
    window.addEventListener('storage', agg);
    return () => {
      window.removeEventListener('byup-fisc-change', agg);
      window.removeEventListener('storage', agg);
    };
  }, []);

  const totalCosti = COSTS_DATA.reduce((s,c) => s+c.amount, 0);
  const cassaSaldo = CASH_MOVEMENTS.reduce((s,m) => s+m.amount, 0) + 500;
  const ivaSaldo = IVA_MONTHLY.reduce((s,m) => s+(m.deb-m.cred), 0);
  const fatturatoMese = 24150;

  return (
    <div className="frame" style={{position:'relative'}}>
      <GlassMeshSubstrate tone="neutral"/>
      <PnSidebar active="contabilita" badges={{contabilita: scartiFisc}}/>
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
            {/* PnSectionTab: il linguaggio unico delle tab di sezione — la
                ricetta è nata qui e ora vive nei token, condivisa. */}
            {[
              {id:'cassa', label:'Cassa', icon:'commerce-coins'},
              {id:'conti', label:'Conti', icon:'commerce-wallet'},
              {id:'costi', label:'Costi', icon:'commerce-price-tag'},
              {id:'iva',   label:'IVA',   icon:'commerce-receipt'},
              {id:'fatture', label:'Fatture', icon:'commerce-register'},
              {id:'export', label:'Export', icon:'download'},
            ].map(t => (
              <PnSectionTab key={t.id} id={t.id} active={tab === t.id} onClick={setTab} label={t.label} icon={t.icon}/>
            ))}
          </div>

          {/* Tab content */}
          {tab==='cassa' && <ContCassa cassaOpen={cassaOpen} setCassaOpen={setCassaOpen}
            onApriConti={(data, stato) => { setContiFisc({ data, stato }); setTab('conti'); }}/>}
          {tab==='conti' && <ContConti filter={contiFilter} fisc={contiFisc} onFiscClear={() => setContiFisc(null)}/>}
          {tab==='costi' && <ContCosti openNewCost={() => setNewCost(true)}/>}
          {tab==='iva'   && <ContIva month={ivaMonth} setMonth={setIvaMonth}/>}
          {tab==='fatture' && <ContFatture/>}
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
