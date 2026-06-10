// Statistiche — sub-tab Dati App

function StatApp() {
  const d = STAT_APP;
  const [search, setSearch] = React.useState('');
  const [sortBy, setSortBy] = React.useState('conv');
  const [order, setOrder] = React.useState('desc');
  const sorted = [...d.conversionePiatti]
    .filter(p => p.piatto.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => (a[sortBy] - b[sortBy]) * (order === 'asc' ? 1 : -1));
  const handleSort = (col) => {
    if (sortBy === col) setOrder(order === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setOrder('desc'); }
  };

  // Funnel KPI riepilogo
  const totV = d.funnel[0].val;
  const last = d.funnel[d.funnel.length - 1].val;
  const dropTotal = totV - last;

  return (
    <div style={{display:'flex', flexDirection:'column', gap: 16}}>
      {/* KPI funnel */}
      <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap: 12}}>
        <StatKpi label="Visite vetrina" value={totV.toLocaleString('it-IT')} delta={14.2} sub="Visualizzazioni totali della tua vetrina"/>
        <StatKpi label="Pagamenti completati" value={last.toLocaleString('it-IT')} delta={9.6} sub="Ordini conclusi con successo"/>
        <StatKpi label="Tasso di conversione" value={`${((last/totV)*100).toFixed(1)}%`} delta={2.4} sub="Vetrina → pagamento"/>
        <StatKpi label="Drop-off totale" value={dropTotal.toLocaleString('it-IT')} delta={-3.1} sub="Utenti persi nel funnel"/>
      </div>

      {/* Funnel viz */}
      <StatCard title="Funnel di conversione" sub="Quanti utenti completano ogni step della journey">
        <div style={{display:'flex', flexDirection:'column', gap: 14}}>
          {d.funnel.map((step, i) => {
            const prev = i > 0 ? d.funnel[i - 1].val : null;
            const dropPct = prev != null ? ((1 - step.val/prev) * 100) : 0;
            return (
              <div key={i}>
                <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: 6}}>
                  <div style={{display:'flex', alignItems:'center', gap: 10}}>
                    <span style={{
                      width: 24, height: 24, borderRadius:'50%',
                      background: PN.WINE, color:'#fff',
                      display:'grid', placeItems:'center',
                      fontSize: 11, fontWeight: 700,
                    }}>{i + 1}</span>
                    <span style={{fontSize: 13, fontWeight: 600, color: PN.TEXT}}>{step.label}</span>
                  </div>
                  <div style={{display:'flex', alignItems:'center', gap: 12}}>
                    {prev != null && dropPct > 0 && (
                      <span style={{fontSize: 11, color: PN.RED, fontWeight: 600}}>↓ {dropPct.toFixed(0)}% drop-off</span>
                    )}
                    <strong style={{fontSize: 14, color: PN.TEXT, fontVariantNumeric:'tabular-nums', minWidth: 80, textAlign:'right'}}>{step.val.toLocaleString('it-IT')}</strong>
                    <span style={{fontSize: 12, color: PN.MUTED, fontWeight: 600, minWidth: 44, textAlign:'right'}}>{step.pct}%</span>
                  </div>
                </div>
                <div style={{height: 14, background:'#f3f4f6', borderRadius: 999, overflow:'hidden'}}>
                  <div style={{
                    width: `${step.pct}%`, height:'100%',
                    background: `linear-gradient(90deg, ${PN.WINE}, ${PN.PINK})`,
                    borderRadius: 999,
                  }}/>
                </div>
              </div>
            );
          })}
        </div>
      </StatCard>

      <StatCard title="Conversione per piatto" sub="Quante volte ogni piatto viene visualizzato e quante volte viene ordinato" action={
        <div style={{
          display:'flex', alignItems:'center', gap: 8,
          padding:'7px 12px', border:`1px solid ${PN.BORDER}`, borderRadius: 10, background: PN.WHITE,
        }}>
          <BuIcons.search size={13} color={PN.MUTED}/>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cerca piatto…" style={{border:'none', outline:'none', fontSize: 12.5, fontFamily:'inherit', width: 200}}/>
        </div>
      }>
        <div style={{borderRadius: 12, overflow:'hidden', border:`1px solid ${PN.BORDER_SOFT}`}}>
          <div style={{
            display:'grid', gridTemplateColumns:'2.4fr 1fr 1fr 1.4fr',
            padding:'12px 16px', background: PN.PINK_SOFT,
            fontSize: 11, fontWeight: 700, color: PN.WINE,
            textTransform:'uppercase', letterSpacing: 0.4,
          }}>
            <SortHead col="piatto" cur={sortBy} order={order} onSort={handleSort}>Piatto</SortHead>
            <SortHead col="view" cur={sortBy} order={order} onSort={handleSort}>Visualizzazioni</SortHead>
            <SortHead col="ord" cur={sortBy} order={order} onSort={handleSort}>Ordini</SortHead>
            <SortHead col="conv" cur={sortBy} order={order} onSort={handleSort}>Tasso conversione</SortHead>
          </div>
          {sorted.map((p, i) => (
            <div key={i} style={{
              display:'grid', gridTemplateColumns:'2.4fr 1fr 1fr 1.4fr',
              padding:'12px 16px', alignItems:'center',
              fontSize: 12.5, color: PN.TEXT,
              borderTop: i === 0 ? 'none' : `1px solid ${PN.BORDER_SOFT}`,
              fontVariantNumeric:'tabular-nums',
            }}>
              <span style={{fontWeight: 600}}>{p.piatto}</span>
              <span>{p.view.toLocaleString('it-IT')}</span>
              <span>{p.ord.toLocaleString('it-IT')}</span>
              <div style={{display:'flex', alignItems:'center', gap: 10}}>
                <div style={{flex: 1}}><StatBar pct={p.conv} color={p.conv >= 60 ? '#16A34A' : (p.conv >= 40 ? PN.PINK : '#dc2626')} height={6}/></div>
                <span style={{
                  padding:'3px 9px', borderRadius: 999,
                  background: p.conv >= 60 ? PN.GREEN_SOFT : (p.conv >= 40 ? PN.AMBER_SOFT : PN.RED_SOFT),
                  color: p.conv >= 60 ? '#15803d' : (p.conv >= 40 ? '#9a3412' : '#991b1b'),
                  fontSize: 11, fontWeight: 700, minWidth: 56, textAlign:'center',
                }}>{p.conv.toFixed(1)}%</span>
              </div>
            </div>
          ))}
        </div>
      </StatCard>
    </div>
  );
}

window.StatApp = StatApp;
