// Statistiche — sub-tab Staff

function StatStaff() {
  const [sortBy, setSortBy] = React.useState('scontrino');
  const [order, setOrder] = React.useState('desc');
  const [search, setSearch] = React.useState('');

  const sorted = [...STAFF]
    .filter(s => s.nome.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const dir = order === 'asc' ? 1 : -1;
      return (a[sortBy] - b[sortBy]) * dir;
    });

  const teamAvg = (STAFF.reduce((s, x) => s + x.scontrino, 0) / STAFF.length);
  const totOrdini = STAFF.reduce((s, x) => s + x.ordini, 0);
  const totTip = STAFF.reduce((s, x) => s + x.tip, 0);
  const top = [...STAFF].sort((a, b) => b.scontrino - a.scontrino)[0];

  const sortIcon = (col) => sortBy === col ? (order === 'asc' ? '↑' : '↓') : '↕';
  const handleSort = (col) => {
    if (sortBy === col) setOrder(order === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setOrder('desc'); }
  };

  return (
    <div style={{display:'flex', flexDirection:'column', gap: 16}}>
      {/* Insight narrativa */}
      <StatInsight items={[
        {tone:'positive', title:`Top performer · ${top.nome}`, desc:`Scontrino medio €${top.scontrino.toFixed(2)}, ${(((top.scontrino - teamAvg)/teamAvg)*100).toFixed(1)}% sopra la media team. ${top.ordini} ordini gestiti.`},
        {tone:'neutral', title:'Mance in crescita', desc:`Il team ha raccolto €${totTip.toLocaleString('it-IT')} di mance, +14.1% rispetto al periodo precedente.`},
      ]}/>

      {/* KPI riepilogo */}
      <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap: 12}}>
        <StatKpi label="Membri attivi" value={STAFF.length} sub="Camerieri & maître nel periodo"/>
        <StatKpi label="Scontrino medio team" value={`€ ${teamAvg.toFixed(2)}`} delta={6.4} spark={[42,44,43,46,45,47,48]} sub="Media tra tutti i membri attivi"/>
        <StatKpi label="Ordini gestiti" value={totOrdini.toLocaleString('it-IT')} delta={9.2} spark={[1820,1900,1880,1950,2010,2080,2129]} sub="Totale ordini gestiti dal team"/>
        <StatKpi label="Mance raccolte" value={`€ ${totTip.toLocaleString('it-IT')}`} delta={14.1} spark={[2100,2200,2150,2300,2400,2500,2570]} sub="Totale mance del periodo"/>
      </div>

      <StatCard title="Rendimento personale" sub="Vendite ed efficacia dei membri del tuo team" action={
        <div style={{display:'flex', gap: 8, alignItems:'center'}}>
          <div style={{
            display:'flex', alignItems:'center', gap: 8,
            padding:'7px 12px', border:`1px solid ${PN.BORDER}`, borderRadius: 10, background: PN.WHITE,
          }}>
            <BuIcons.search size={13} color={PN.MUTED}/>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cerca membro…" style={{border:'none', outline:'none', fontSize: 12.5, fontFamily:'inherit', width: 160}}/>
          </div>
          <button style={{padding:'8px 14px', background: PN.TEXT, color:'#fff', border:'none', borderRadius: 10, fontSize: 12, fontWeight: 700, cursor:'pointer', fontFamily:'inherit', display:'inline-flex', alignItems:'center', gap: 6}}><BuIcons.download size={12}/> Esporta</button>
        </div>
      }>
        <div style={{borderRadius: 12, overflow:'hidden', border:`1px solid ${PN.BORDER_SOFT}`}}>
          <div style={{
            display:'grid', gridTemplateColumns:'2.2fr 1fr 1fr 1.2fr 1fr 1fr',
            padding:'10px 16px', background:'#FAFAFB',
            fontSize: 10.5, fontWeight: 700, color: PN.MUTED,
            textTransform:'uppercase', letterSpacing: 0.5,
            borderBottom:`1px solid ${PN.BORDER_SOFT}`,
          }}>
            <span>Nome</span>
            <SortHead col="scontrino" cur={sortBy} order={order} onSort={handleSort}>Scontrino medio</SortHead>
            <span>vs Team</span>
            <SortHead col="ordini" cur={sortBy} order={order} onSort={handleSort}>Ordini gestiti</SortHead>
            <SortHead col="tavoli" cur={sortBy} order={order} onSort={handleSort}>Tavoli</SortHead>
            <SortHead col="tip" cur={sortBy} order={order} onSort={handleSort}>Mance</SortHead>
          </div>
          {sorted.map((s, i) => {
            const vsPct = ((s.scontrino - teamAvg) / teamAvg * 100);
            const isTop = s.nome === top.nome;
            return (
              <div key={i} style={{
                display:'grid', gridTemplateColumns:'2.2fr 1fr 1fr 1.2fr 1fr 1fr',
                padding:'10px 16px', alignItems:'center',
                fontSize: 13, color: PN.TEXT,
                borderTop: i === 0 ? 'none' : `1px solid ${PN.BORDER_SOFT}`,
                background: isTop ? '#FFFCF0' : (i % 2 === 1 ? '#FAFAFB' : PN.WHITE),
              }}>
                <div style={{display:'flex', alignItems:'center', gap: 10}}>
                  <div style={{
                    width: 32, height: 32, borderRadius:'50%',
                    background: s.avatarBg, color:'#fff',
                    display:'grid', placeItems:'center',
                    fontSize: 12, fontWeight: 700, flexShrink: 0,
                  }}>{s.avatar}</div>
                  <div style={{minWidth: 0}}>
                    <div style={{fontWeight: 600, display:'flex', alignItems:'center', gap:6, whiteSpace:'nowrap'}}>
                      <span style={{overflow:'hidden', textOverflow:'ellipsis'}}>{s.nome}</span>
                      {isTop && <span style={{
                        display:'inline-flex', alignItems:'center', gap:3,
                        padding:'1px 6px', borderRadius: 4,
                        background: PN.AMBER_SOFT, color: PN.AMBER,
                        fontSize: 9.5, fontWeight: 800, letterSpacing: 0.4, textTransform:'uppercase',
                        flexShrink: 0,
                      }}><BuIcons.trophy size={10}/> Top</span>}
                    </div>
                    <div style={{fontSize: 11, color: PN.MUTED}}>{s.ruolo}</div>
                  </div>
                </div>
                <span style={{fontVariantNumeric:'tabular-nums', fontWeight: 600}}>€ {s.scontrino.toFixed(2)}</span>
                <span>
                  <span style={{
                    display:'inline-flex', alignItems:'center', gap: 4,
                    padding:'3px 9px', borderRadius: 999,
                    background: vsPct >= 0 ? PN.GREEN_SOFT : PN.RED_SOFT,
                    color: vsPct >= 0 ? PN.GREEN : PN.RED,
                    fontSize: 11, fontWeight: 700,
                  }}>
                    {vsPct >= 0 ? '↑' : '↓'} {Math.abs(vsPct).toFixed(1)}%
                  </span>
                </span>
                <div>
                  <div style={{fontVariantNumeric:'tabular-nums', fontWeight: 600}}>{s.ordini}</div>
                  <div style={{height: 4, background: PN.BORDER_SOFT, borderRadius: 999, marginTop: 4, overflow:'hidden'}}>
                    <div style={{height:'100%', width: `${(s.ordini / 320) * 100}%`, background: PN.PINK, borderRadius: 999}}/>
                  </div>
                </div>
                <span style={{fontVariantNumeric:'tabular-nums'}}>{s.tavoli}</span>
                <span style={{fontVariantNumeric:'tabular-nums', fontWeight: 600, color: PN.GREEN}}>€ {s.tip}</span>
              </div>
            );
          })}
        </div>
      </StatCard>
    </div>
  );
}

function SortHead({ col, cur, order, onSort, children }) {
  const active = col === cur;
  return (
    <button onClick={() => onSort(col)} style={{
      background:'transparent', border:'none', padding: 0,
      fontSize: 10.5, fontWeight: 700, color: PN.MUTED,
      textTransform:'uppercase', letterSpacing: 0.5,
      textAlign:'left', cursor:'pointer', fontFamily:'inherit',
      display:'inline-flex', alignItems:'center', gap: 5,
      opacity: active ? 1 : 0.85,
    }}>
      {children}
      <span style={{fontSize: 10, opacity: active ? 1 : 0.4}}>{active ? (order === 'asc' ? '↑' : '↓') : '↕'}</span>
    </button>
  );
}

window.StatStaff = StatStaff;
