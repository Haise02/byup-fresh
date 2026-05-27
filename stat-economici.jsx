// Statistiche — sub-tab Dati economici

function StatEconomici() {
  const [sub, setSub] = React.useState('ricavi');
  const e = STAT_ECONOMICI;
  const v = STAT_VENDITE;
  const months = ['Gen','Feb','Mar','Apr','Mag','Giu','Lug','Ago','Set','Ott','Nov','Dic'];

  return (
    <div style={{display:'flex', flexDirection:'column', gap: 16}}>
      <div style={{display:'flex', gap: 22, borderBottom:`1px solid ${PN.BORDER_SOFT}`, marginBottom: -8}}>
        <StatSubTab active={sub==='ricavi'} onClick={() => setSub('ricavi')} label="Ricavi e costi"/>
        <StatSubTab active={sub==='vendite'} onClick={() => setSub('vendite')} label="Vendite piatti"/>
      </div>

      {sub === 'ricavi' && <RicaviCosti d={e} months={months}/>}
      {sub === 'vendite' && <VenditePiatti v={v}/>}
    </div>
  );
}

function RicaviCosti({ d, months }) {
  const [trendRange, setTrendRange] = React.useState('12m');
  const totRicavi = d.totaleRicavi.byup + d.totaleRicavi.contanti + d.totaleRicavi.carte;
  const segs = [
    { label:'byup', val: d.totaleRicavi.byup, color: PN.PINK },
    { label:'Contanti', val: d.totaleRicavi.contanti, color: PN.GREEN },
    { label:'Carte', val: d.totaleRicavi.carte, color: PN.BLUE },
  ];
  let cum = 0; const R = 60, CX = 80, CY = 80;
  const arcs = segs.map(s => {
    const start = cum; cum += s.val;
    const a0 = (start / totRicavi) * 2 * Math.PI - Math.PI/2;
    const a1 = (cum / totRicavi) * 2 * Math.PI - Math.PI/2;
    const x0 = CX + R*Math.cos(a0), y0 = CY + R*Math.sin(a0);
    const x1 = CX + R*Math.cos(a1), y1 = CY + R*Math.sin(a1);
    const big = (s.val / totRicavi) > 0.5 ? 1 : 0;
    return { ...s, path: `M ${CX} ${CY} L ${x0} ${y0} A ${R} ${R} 0 ${big} 1 ${x1} ${y1} Z` };
  });

  // Trend area
  const fW = 740, fH = 220, fP = { l: 50, r: 16, t: 16, b: 28 };
  const maxF = Math.ceil(Math.max(...d.fatturatoTrend) / 10000) * 10000;
  const fx = (i) => fP.l + i * ((fW - fP.l - fP.r) / (months.length - 1));
  const fy = (val) => fH - fP.b - (val / maxF) * (fH - fP.t - fP.b);
  const linePath = d.fatturatoTrend.map((val, i) => `${i===0?'M':'L'}${fx(i)},${fy(val)}`).join(' ');
  const areaPath = `${linePath} L ${fx(months.length-1)},${fH-fP.b} L ${fP.l},${fH-fP.b} Z`;

  return (
    <div style={{display:'flex', flexDirection:'column', gap: 16}}>
      <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap: 12}}>
        {/* Ricavi è la UNICA card Statistiche con il light-coral gradient
            (hero del sub-tab Economici). Le altre 21 restano white. */}
        <StatKpi label="Ricavi" value={`€ ${d.ricavi.val.toLocaleString('it-IT')}`} delta={d.ricavi.delta} sub="Entrate del periodo" glass/>
        <StatKpi label="Costi" value={`€ ${d.costi.val.toLocaleString('it-IT')}`} delta={d.costi.delta} sub="Uscite del periodo"/>
        <StatKpi label="Utile" value={`€ ${d.utile.val.toLocaleString('it-IT')}`} delta={d.utile.delta} sub={`Margine ${((d.utile.val/d.ricavi.val)*100).toFixed(1)}% sui ricavi`}/>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'1.3fr 1fr', gap: 16}}>
        <StatCard title="Origine incassi" sub="Confronto canali ultimi 7 giorni" action={
          <span style={{display:'inline-flex', alignItems:'center', gap: 12, fontSize: 11, color: PN.MUTED}}>
            <span style={{display:'inline-flex', alignItems:'center', gap:5}}><span style={{width:10, height:10, borderRadius:3, background: PN.PINK}}/> sala</span>
            <span style={{display:'inline-flex', alignItems:'center', gap:5}}><span style={{width:10, height:10, borderRadius:3, background: PN.GREEN}}/> asporto</span>
            <span style={{display:'inline-flex', alignItems:'center', gap:5}}><span style={{width:10, height:10, borderRadius:3, background: PN.BLUE}}/> diretta</span>
          </span>
        }>
          <svg viewBox="0 0 460 200" style={{width:'100%', height: 200}}>
            {[0, 0.5, 1].map((t, i) => {
              const y = 16 + 156 * t;
              return <line key={i} x1={36} y1={y} x2={460} y2={y} stroke={PN.BORDER_SOFT}/>;
            })}
            {[
              {arr: d.origine.sala, col: PN.PINK},
              {arr: d.origine.asporto, col: PN.GREEN},
              {arr: d.origine.diretta, col: PN.BLUE},
            ].map((line, k) => {
              const max = 8000;
              const path = line.arr.map((val, i) => `${i===0?'M':'L'}${36 + i * (424/(line.arr.length-1))},${172 - (val/max)*156}`).join(' ');
              return <path key={k} d={path} fill="none" stroke={line.col} strokeWidth={2}/>;
            })}
            {months.slice(0, 12).map((m, i) => <text key={i} x={36 + i*(424/11)} y={194} fontSize="9" fill={PN.MUTED} textAnchor="middle">{m}</text>)}
          </svg>
          <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap: 8, marginTop: 12}}>
            <Mini label="Sala" pct={43} val="34.020 €"/>
            <Mini label="Asporto" pct={28} val="22.120 €"/>
            <Mini label="Diretta" pct={12} val="9.480 €"/>
          </div>
        </StatCard>

        <StatCard title="Totale ricavi" sub="Distribuzione metodi di pagamento">
          <div style={{display:'flex', alignItems:'center', gap: 16}}>
            <svg width={160} height={160} viewBox="0 0 160 160">
              {arcs.map((s, i) => <path key={i} d={s.path} fill={s.color}/>)}
              <circle cx={80} cy={80} r={38} fill={PN.WHITE}/>
              <text x={80} y={76} textAnchor="middle" fontSize="10" fill={PN.MUTED}>Totale</text>
              <text x={80} y={92} textAnchor="middle" fontSize="14" fontWeight="700" fill={PN.TEXT}>€{(totRicavi/1000).toFixed(0)}K</text>
            </svg>
            <div style={{flex: 1, display:'flex', flexDirection:'column', gap: 8}}>
              {arcs.map((s, i) => (
                <div key={i} style={{display:'flex', alignItems:'center', gap: 10, fontSize: 12.5}}>
                  <span style={{width: 12, height: 12, background: s.color, borderRadius: 3}}/>
                  <span style={{flex: 1, color: PN.TEXT}}>{s.label}</span>
                  <strong style={{color: PN.TEXT, fontVariantNumeric:'tabular-nums'}}>{Math.round((s.val/totRicavi)*100)}%</strong>
                  <span style={{color: PN.MUTED, fontSize: 11, fontVariantNumeric:'tabular-nums', minWidth: 60, textAlign:'right'}}>€{s.val.toLocaleString('it-IT')}</span>
                </div>
              ))}
            </div>
          </div>
        </StatCard>
      </div>

      <StatCard title="Andamento fatturato" sub="Visualizza il trend del fatturato negli ultimi 12 mesi" action={
        <div style={{display:'inline-flex', gap: 4, padding: 4, background:'#f5f5f7', borderRadius: 999}}>
          {[['6m','6 mesi'],['12m','12 mesi'],['24m','2 anni']].map(([id, label]) => (
            <button key={id} onClick={() => setTrendRange(id)} style={{
              padding:'6px 14px', fontSize: 11.5, fontWeight: 600,
              background: trendRange === id ? PN.WHITE : 'transparent',
              border:'none', borderRadius: 999,
              color: trendRange === id ? PN.PINK_DARK : PN.MUTED,
              cursor:'pointer', fontFamily:'inherit',
              boxShadow: trendRange === id ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
            }}>{label}</button>
          ))}
        </div>
      }>
        <svg viewBox={`0 0 ${fW} ${fH}`} style={{width:'100%', height: 220}}>
          <defs>
            <linearGradient id="fatGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={PN.PINK} stopOpacity="0.35"/>
              <stop offset="100%" stopColor={PN.PINK} stopOpacity="0"/>
            </linearGradient>
          </defs>
          {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
            const y = fP.t + (fH - fP.t - fP.b) * t;
            const val = Math.round(maxF * (1 - t));
            return (
              <g key={i}>
                <line x1={fP.l} y1={y} x2={fW - fP.r} y2={y} stroke={PN.BORDER_SOFT}/>
                <text x={fP.l - 8} y={y + 4} fontSize="10" fill={PN.MUTED} textAnchor="end">€{(val/1000).toFixed(0)}K</text>
              </g>
            );
          })}
          <path d={areaPath} fill="url(#fatGrad)"/>
          <path d={linePath} fill="none" stroke={PN.PINK} strokeWidth={2.6}/>
          {d.fatturatoTrend.map((val, i) => <circle key={i} cx={fx(i)} cy={fy(val)} r={3.5} fill={PN.PINK}/>)}
          {months.map((m, i) => <text key={i} x={fx(i)} y={fH - 6} fontSize="11" fill={PN.MUTED} textAnchor="middle">{m}</text>)}
        </svg>
      </StatCard>

      <StatCard title="Totale costi" sub="Suddivisi per tipologia e categoria" action={
        <span style={{display:'inline-flex', alignItems:'center', gap: 12, fontSize: 11, color: PN.MUTED}}>
          <span style={{display:'inline-flex', alignItems:'center', gap:5}}><span style={{width:10, height:10, borderRadius:3, background: PN.PINK}}/> variabili</span>
          <span style={{display:'inline-flex', alignItems:'center', gap:5}}><span style={{width:10, height:10, borderRadius:3, background: PN.PINK_SOFT}}/> fissi</span>
        </span>
      }>
        <div style={{padding:'12px 16px', background: PN.WINE, borderRadius: 12, marginBottom: 16, color:'#fff', display:'flex', alignItems:'center', justifyContent:'space-between'}}>
          <div>
            <div style={{fontSize: 12, opacity: 0.85}}>Costi totali del periodo</div>
            <div style={{fontSize: 22, fontWeight: 700, marginTop: 2, fontVariantNumeric:'tabular-nums'}}>€ {STAT_ECONOMICI.costi.val.toLocaleString('it-IT')}</div>
          </div>
          <span style={{
            padding:'5px 12px', background:'rgba(255,255,255,0.2)',
            borderRadius: 999, fontSize: 12, fontWeight: 700,
          }}>↓ 4.2% vs mese scorso</span>
        </div>
        <div style={{display:'flex', flexDirection:'column', gap: 12}}>
          {STAT_ECONOMICI.costiBreakdown.map((c, i) => (
            <div key={i}>
              <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: 5}}>
                <span style={{fontSize: 12.5, fontWeight: 600, color: PN.TEXT}}>{c.cat}</span>
                <div style={{display:'flex', alignItems:'center', gap: 8}}>
                  <span style={{fontSize: 11, color: PN.MUTED}}>{c.fissi}% fissi · {c.var}% variabili</span>
                  <strong style={{fontSize: 12.5, color: PN.TEXT, fontVariantNumeric:'tabular-nums', minWidth: 70, textAlign:'right'}}>€ {c.tot.toLocaleString('it-IT')}</strong>
                  <span style={{
                    padding:'2px 7px', borderRadius: 999,
                    background: c.delta < 0 ? PN.GREEN_SOFT : (c.delta > 5 ? PN.RED_SOFT : '#f3f4f6'),
                    color: c.delta < 0 ? PN.GREEN : (c.delta > 5 ? PN.RED : PN.MUTED),
                    fontSize: 10.5, fontWeight: 700, minWidth: 50, textAlign:'center',
                  }}>{c.delta > 0 ? '+' : ''}{c.delta.toFixed(1)}%</span>
                </div>
              </div>
              <div style={{display:'flex', height: 6, borderRadius: 999, overflow:'hidden', background: PN.BORDER_SOFT}}>
                {c.fissi > 0 && <div style={{width: `${c.fissi}%`, background: PN.PINK_SOFT}}/>}
                {c.var > 0 && <div style={{width: `${c.var}%`, background: PN.PINK}}/>}
              </div>
            </div>
          ))}
        </div>
      </StatCard>
    </div>
  );
}

function Mini({ label, pct, val }) {
  return (
    <div style={{padding: 10, background:'#fafafa', borderRadius: 10, border:`1px solid ${PN.BORDER_SOFT}`}}>
      <div style={{fontSize: 11, color: PN.MUTED}}>{label}</div>
      <div style={{display:'flex', alignItems:'baseline', gap: 6, marginTop: 2}}>
        <strong style={{fontSize: 16, color: PN.TEXT, fontVariantNumeric:'tabular-nums'}}>{pct}%</strong>
        <span style={{fontSize: 11, color: PN.MUTED, fontVariantNumeric:'tabular-nums'}}>{val}</span>
      </div>
    </div>
  );
}

function VenditePiatti({ v }) {
  const [sortBy, setSortBy] = React.useState('ricavoTot');
  const [order, setOrder] = React.useState('desc');
  const [search, setSearch] = React.useState('');
  const sorted = [...v.piatti]
    .filter(p => p.nome.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const dir = order === 'asc' ? 1 : -1;
      const av = a[sortBy], bv = b[sortBy];
      if (typeof av === 'number') return (av - bv) * dir;
      return String(av).localeCompare(String(bv)) * dir;
    });
  const handleSort = (col) => {
    if (sortBy === col) setOrder(order === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setOrder('desc'); }
  };

  return (
    <div style={{display:'flex', flexDirection:'column', gap: 16}}>
      <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap: 12}}>
        <StatKpi label="N. articoli per ordine" value={v.kpi.articoli.val} delta={v.kpi.articoli.delta} sub={v.kpi.articoli.sub}/>
        <StatKpi label="Margine medio" value={v.kpi.margine.val} suffix="%" delta={v.kpi.margine.delta} sub={v.kpi.margine.sub}/>
        <StatKpi label="Articoli totali venduti" value={v.kpi.venduti.val.toLocaleString('it-IT')} delta={v.kpi.venduti.delta} sub={v.kpi.venduti.sub}/>
      </div>

      <StatCard title="Performance piatti" sub="Ordina per qualsiasi colonna · margine, ricavo, n° venduti" action={
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
            display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr 0.8fr 1.2fr 1.2fr 0.9fr',
            padding:'10px 16px', background:'#FAFAFB',
            fontSize: 10.5, fontWeight: 700, color: PN.MUTED,
            textTransform:'uppercase', letterSpacing: 0.5,
            borderBottom:`1px solid ${PN.BORDER_SOFT}`,
          }}>
            <SortHead col="nome" cur={sortBy} order={order} onSort={handleSort}>Piatto</SortHead>
            <SortHead col="costo" cur={sortBy} order={order} onSort={handleSort}>Costo</SortHead>
            <SortHead col="ricavo" cur={sortBy} order={order} onSort={handleSort}>Prezzo</SortHead>
            <SortHead col="margine" cur={sortBy} order={order} onSort={handleSort}>Margine €</SortHead>
            <SortHead col="n" cur={sortBy} order={order} onSort={handleSort}>Venduti</SortHead>
            <SortHead col="costiTot" cur={sortBy} order={order} onSort={handleSort}>Costi tot.</SortHead>
            <SortHead col="ricavoTot" cur={sortBy} order={order} onSort={handleSort}>Ricavo tot.</SortHead>
            <SortHead col="marginePct" cur={sortBy} order={order} onSort={handleSort}>Margine %</SortHead>
          </div>
          {sorted.map((p, i) => (
            <div key={i} style={{
              display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr 0.8fr 1.2fr 1.2fr 0.9fr',
              padding:'9px 16px', alignItems:'center',
              fontSize: 12.5, color: PN.TEXT,
              background: i % 2 === 1 ? '#FAFAFB' : PN.WHITE,
              borderTop: i === 0 ? 'none' : `1px solid ${PN.BORDER_SOFT}`,
              fontVariantNumeric:'tabular-nums',
            }}>
              <span style={{fontWeight: 600}}>{p.nome}</span>
              <span style={{color: PN.MUTED}}>€ {p.costo.toFixed(2)}</span>
              <span>€ {p.ricavo.toFixed(2)}</span>
              <span style={{fontWeight: 600}}>€ {p.margine.toFixed(2)}</span>
              <span>{p.n}</span>
              <span style={{color: PN.MUTED}}>€ {p.costiTot.toFixed(0)}</span>
              <span style={{fontWeight: 600}}>€ {p.ricavoTot.toFixed(0)}</span>
              <span>
                <span style={{
                  display:'inline-flex', alignItems:'center',
                  padding:'3px 9px', borderRadius: 999,
                  background: p.marginePct >= 65 ? PN.GREEN_SOFT : (p.marginePct >= 55 ? PN.AMBER_SOFT : PN.RED_SOFT),
                  color: p.marginePct >= 65 ? PN.GREEN : (p.marginePct >= 55 ? PN.AMBER : PN.RED),
                  fontSize: 11, fontWeight: 700,
                }}>{p.marginePct}%</span>
              </span>
            </div>
          ))}
        </div>
      </StatCard>
    </div>
  );
}

window.StatEconomici = StatEconomici;
