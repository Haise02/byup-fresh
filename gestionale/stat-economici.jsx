// Statistiche — sub-tab Dati economici

function StatEconomici() {
  const [sub, setSub] = React.useState('ricavi');
  const e = STAT_ECONOMICI;
  const v = STAT_VENDITE;
  const months = ['Gen','Feb','Mar','Apr','Mag','Giu','Lug','Ago','Set','Ott','Nov','Dic'];

  return (
    <div style={{display:'flex', flexDirection:'column', gap: 16}}>
      <div style={{display:'flex', gap: 14}}>
        <StatSubTab active={sub==='ricavi'} onClick={() => setSub('ricavi')} label="Ricavi e costi" icon="commerce-money"/>
        <StatSubTab active={sub==='vendite'} onClick={() => setSub('vendite')} label="Vendite piatti" icon="food-meal"/>
      </div>

      {sub === 'ricavi' && <RicaviCosti d={e} months={months} onVaiVendite={() => setSub('vendite')}/>}
      {sub === 'vendite' && <VenditePiatti v={v}/>}
    </div>
  );
}

// ─── KPI di testa ──────────────────────────────────────────────────────────
// Tre card affiancate, ognuna con la sua tinta: cerchio dell'icona a sinistra,
// etichetta e delta sulla prima riga, valore grande, sottotitolo, e la
// sparkline a destra a raccontare l'andamento senza occupare una card sua.
const ECON_TONI = {
  ricavi: { bg:'linear-gradient(115deg, #FDEBD9 0%, #FFF7EF 52%, #FFFFFF 100%)', bordo:'#F6DCC2', chip:'#FFFFFF', tinta: PN.AMBER },
  costi:  { bg:'linear-gradient(115deg, #FDE9E9 0%, #FFF6F6 52%, #FFFFFF 100%)', bordo:'#F7D4D4', chip:'#FFFFFF', tinta: PN.RED },
  utile:  { bg:'linear-gradient(115deg, #E6F6EC 0%, #F5FBF7 52%, #FFFFFF 100%)', bordo:'#CFEBD9', chip:'#FFFFFF', tinta: PN.GREEN },
};

function EconKpi({ tono, icona, label, valore, sub, delta, spark }) {
  const t = ECON_TONI[tono];
  return (
    <div style={{
      display:'flex', alignItems:'center', gap: 12, minWidth: 0,
      padding: 15, borderRadius: 16,
      background: t.bg, border: `1px solid ${t.bordo}`,
    }}>
      <span style={{
        width: 44, height: 44, borderRadius:'50%', flexShrink: 0,
        background: t.chip, color: t.tinta,
        display:'grid', placeItems:'center',
        boxShadow:'0 1px 3px rgba(15,17,21,0.08)',
      }}><Icon name={icona} size={21}/></span>

      <div style={{flex: 1, minWidth: 0}}>
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap: 8}}>
          <span style={{fontSize: 15, color: PN.MUTED, fontWeight: 500}}>{label}</span>
          <StatDelta value={delta}/>
        </div>
        <div style={{display:'flex', alignItems:'flex-end', justifyContent:'space-between', gap: 12, minWidth: 0}}>
          <div style={{minWidth: 0}}>
            <div style={{
              fontSize: 28, fontWeight: 700, color: PN.TEXT, letterSpacing: -0.6,
              lineHeight: 1.15, marginTop: 2, whiteSpace:'nowrap',
            }}>{valore}</div>
            {/* Va a capo invece di troncarsi: al minimo del frame (1280)
                "Margine 39,6% sui ricavi" non ci sta su una riga sola. */}
            <div style={{fontSize: 14, color: PN.MUTED, marginTop: 2, lineHeight: 1.35}}>{sub}</div>
          </div>
          {spark && <StatSpark data={spark} color={t.tinta} width={82} height={32}/>}
        </div>
      </div>
    </div>
  );
}

// Bottone di rimando in fondo a una card: pillola quieta, freccia a destra.
// Va SOLO dove porta davvero da qualche parte.
function EconVai({ label, onClick }) {
  return (
    <button onClick={onClick}
      onMouseEnter={e => { e.currentTarget.style.background = PN.WHITE_FROST; }}
      onMouseLeave={e => { e.currentTarget.style.background = PN.WHITE_HUSH; e.currentTarget.style.transform = ''; }}
      onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.97)'; }}
      onMouseUp={e => { e.currentTarget.style.transform = ''; }}
      style={{
        display:'inline-flex', alignItems:'center', justifyContent:'center', gap: 8,
        width:'100%', marginTop: 14, padding:'10px 16px',
        background: PN.WHITE_HUSH, border:'none', borderRadius: 999,
        fontSize: 14.5, fontWeight: 600, color: PN.TEXT,
        cursor:'pointer', fontFamily:'inherit',
        transition:'background 140ms ease, transform 120ms ease',
      }}>
      {label}
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h13M13 6l6 6-6 6"/></svg>
    </button>
  );
}

function RicaviCosti({ d, months, onVaiVendite }) {
  const [trendRange, setTrendRange] = React.useState('12m');
  const eur = (n) => `€ ${Math.round(n).toLocaleString('it-IT', {useGrouping: true})}`;

  // ── Origine incassi: i tre metodi di pagamento sommano ai ricavi ──────────
  const tr = d.totaleRicavi;
  const totRicavi = tr.byup + tr.contanti + tr.carte;
  const segs = [
    { label:'byup',     val: tr.byup,     color: PN.PINK },
    { label:'Contanti', val: tr.contanti, color: PN.GREEN },
    { label:'Carte',    val: tr.carte,    color: PN.BLUE },
  ];
  let cum = 0; const R = 62, CX = 78, CY = 78;
  const arcs = segs.map(s => {
    const start = cum; cum += s.val;
    const a0 = (start / totRicavi) * 2 * Math.PI - Math.PI/2;
    const a1 = (cum / totRicavi) * 2 * Math.PI - Math.PI/2;
    const x0 = CX + R*Math.cos(a0), y0 = CY + R*Math.sin(a0);
    const x1 = CX + R*Math.cos(a1), y1 = CY + R*Math.sin(a1);
    const big = (s.val / totRicavi) > 0.5 ? 1 : 0;
    return { ...s, path: `M ${CX} ${CY} L ${x0} ${y0} A ${R} ${R} 0 ${big} 1 ${x1} ${y1} Z` };
  });

  // ── Ricavi per canale: le quote vengono dalle serie e si riportano ai
  //    ricavi del periodo, così i tre importi tornano al totale in testa.
  const CANALI = [
    { id:'sala',    label:'Sala',            icona:'place-table',     colore: PN.PINK,  serie: d.origine.sala },
    { id:'asporto', label:'Asporto',         icona:'commerce-bag',    colore: PN.GREEN, serie: d.origine.asporto },
    { id:'diretta', label:'Vendita diretta', icona:'commerce-cart',   colore: PN.BLUE,  serie: d.origine.diretta },
  ].map(c => ({ ...c, somma: c.serie.reduce((s, v) => s + v, 0) }));
  const sommaCanali = CANALI.reduce((s, c) => s + c.somma, 0);
  const canali = CANALI.map(c => ({
    ...c,
    quota: (c.somma / sommaCanali) * 100,
    valore: (c.somma / sommaCanali) * d.ricavi.val,
  }));

  // ── Andamento: area del fatturato sui dodici mesi ─────────────────────────
  // Il grafico è alto quanto serve a riempire la riga: la card accanto (il
  // donut con la sua legenda) è più alta, e il grid le pareggia comunque.
  const fW = 720, fH = 292, fP = { l: 52, r: 16, t: 16, b: 30 };
  const maxF = Math.ceil(Math.max(...d.fatturatoTrend) / 10000) * 10000;
  const fx = (i) => fP.l + i * ((fW - fP.l - fP.r) / (months.length - 1));
  const fy = (val) => fH - fP.b - (val / maxF) * (fH - fP.t - fP.b);
  const linePath = d.fatturatoTrend.map((val, i) => `${i===0?'M':'L'}${fx(i)},${fy(val)}`).join(' ');
  const areaPath = `${linePath} L ${fx(months.length-1)},${fH-fP.b} L ${fP.l},${fH-fP.b} Z`;
  const ultimo = d.fatturatoTrend[d.fatturatoTrend.length - 1];

  // ── Margine ───────────────────────────────────────────────────────────────
  const marginePct = (d.utile.val / d.ricavi.val) * 100;
  const anelloR = 58, anelloC = 2 * Math.PI * anelloR;

  return (
    <div style={{display:'flex', flexDirection:'column', gap: 16}}>
      {/* Riga 1 — i tre numeri del periodo */}
      <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap: 12}}>
        <EconKpi tono="ricavi" icona="commerce-money" label="Ricavi"
          valore={eur(d.ricavi.val)} sub="Entrate del periodo" delta={d.ricavi.delta}
          spark={d.fatturatoTrend}/>
        <EconKpi tono="costi" icona="commerce-wallet" label="Costi"
          valore={eur(d.costi.val)} sub="Uscite del periodo" delta={d.costi.delta}
          spark={d.costiTrend}/>
        <EconKpi tono="utile" icona="chart-bar" label="Utile"
          valore={eur(d.utile.val)} sub={`Margine ${marginePct.toFixed(1).replace('.', ',')}% sui ricavi`}
          delta={d.utile.delta}
          spark={d.fatturatoTrend.map((v, i) => v - d.costiTrend[i])}/>
      </div>

      {/* Riga 2 — andamento a sinistra, da dove arrivano i soldi a destra */}
      <div style={{display:'grid', gridTemplateColumns:'1.9fr 1fr', gap: 16}}>
        <StatCard title="Andamento fatturato" action={
          <div style={{display:'inline-flex', gap: 4, padding: 4, background:'#f5f5f7', borderRadius: 999}}>
            {[['6m','6 mesi'],['12m','12 mesi'],['24m','2 anni']].map(([id, label]) => (
              <button key={id} onClick={() => setTrendRange(id)} style={{
                padding:'6px 14px', fontSize: 14.5, fontWeight: 600,
                background: trendRange === id ? PN.WHITE : 'transparent',
                border:'none', borderRadius: 999,
                color: trendRange === id ? PN.PINK_DARK : PN.MUTED,
                cursor:'pointer', fontFamily:'inherit',
                boxShadow: trendRange === id ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
              }}>{label}</button>
            ))}
          </div>
        }>
          {/* La legenda sotto al titolo porta anche il valore: una serie sola,
              quindi non serve una scatola-legenda, basta dire cosa si guarda. */}
          <div style={{display:'flex', alignItems:'center', gap: 8, marginTop: -8, marginBottom: 14}}>
            <span style={{width: 10, height: 10, borderRadius: 3, background: PN.PINK}}/>
            <span style={{fontSize: 14.5, color: PN.MUTED}}>Fatturato</span>
            <span style={{fontSize: 14.5, fontWeight: 700, color: PN.TEXT, fontVariantNumeric:'tabular-nums'}}>{eur(d.ricavi.val)}</span>
            <span style={{fontSize: 14, color: PN.MUTED_SOFT, marginLeft: 4}}>ultimo mese {eur(ultimo)}</span>
          </div>
          <svg viewBox={`0 0 ${fW} ${fH}`} style={{width:'100%', display:'block'}}>
            <defs>
              <linearGradient id="fatGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={PN.PINK} stopOpacity="0.22"/>
                <stop offset="100%" stopColor={PN.PINK} stopOpacity="0"/>
              </linearGradient>
            </defs>
            {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
              const y = fP.t + (fH - fP.t - fP.b) * t;
              const val = Math.round(maxF * (1 - t));
              return (
                <g key={i}>
                  <line x1={fP.l} y1={y} x2={fW - fP.r} y2={y} stroke={PN.BORDER_SOFT}/>
                  <text x={fP.l - 8} y={y + 4} fontSize="11" fill={PN.MUTED} textAnchor="end">€{(val/1000).toFixed(0)}K</text>
                </g>
              );
            })}
            <path d={areaPath} fill="url(#fatGrad)"/>
            <path d={linePath} fill="none" stroke={PN.PINK} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round"/>
            {/* Un punto solo, quello finale, col suo anello bianco */}
            <circle cx={fx(months.length-1)} cy={fy(ultimo)} r={4.5} fill={PN.PINK} stroke={PN.WHITE} strokeWidth={2}/>
            {months.map((m, i) => <text key={i} x={fx(i)} y={fH - 8} fontSize="11" fill={PN.MUTED} textAnchor="middle">{m}</text>)}
          </svg>
        </StatCard>

        <StatCard title="Origine incassi" sub="Distribuzione metodi di pagamento">
          <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap: 16}}>
            <svg width={156} height={156} viewBox="0 0 156 156">
              {arcs.map((s, i) => <path key={i} d={s.path} fill={s.color} stroke={PN.WHITE} strokeWidth={2.5} strokeLinejoin="round"/>)}
              <circle cx={CX} cy={CY} r={42} fill={PN.WHITE}/>
              <text x={CX} y={CY - 4} textAnchor="middle" fontSize="12" fill={PN.MUTED}>Totale</text>
              <text x={CX} y={CY + 16} textAnchor="middle" fontSize="17" fontWeight="700" fill={PN.TEXT}>{eur(totRicavi)}</text>
            </svg>
            <div style={{width:'100%', display:'flex', flexDirection:'column', gap: 10}}>
              {arcs.map((s, i) => (
                <div key={i} style={{display:'flex', alignItems:'center', gap: 10, fontSize: 14.5}}>
                  <span style={{width: 11, height: 11, background: s.color, borderRadius:'50%', flexShrink: 0}}/>
                  <span style={{flex: 1, color: PN.TEXT, minWidth: 0}}>{s.label}</span>
                  <strong style={{color: PN.TEXT, fontVariantNumeric:'tabular-nums'}}>{Math.round((s.val/totRicavi)*100)}%</strong>
                  <span style={{color: PN.MUTED, fontVariantNumeric:'tabular-nums', minWidth: 66, textAlign:'right'}}>{eur(s.val)}</span>
                </div>
              ))}
            </div>
          </div>
          <EconVai label="Vedi gli incassi in Contabilità"
            onClick={() => { window.location.href = 'byup Contabilita.html?tab=cassa'; }}/>
        </StatCard>
      </div>

      {/* Riga 3 — da quale canale arrivano i ricavi, e quanto margine resta */}
      <div style={{display:'grid', gridTemplateColumns:'1.55fr 1fr', gap: 16}}>
        <StatCard title="Ricavi per canale" sub="Quota di ogni canale sui ricavi del periodo">
          <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap: 12}}>
            {canali.map(c => (
              <div key={c.id} style={{
                padding: 14, borderRadius: 14,
                background: PN.WHITE, border:`1px solid ${PN.BORDER_SOFT}`,
                display:'flex', flexDirection:'column', gap: 2, minWidth: 0,
              }}>
                <span style={{
                  width: 36, height: 36, borderRadius: 10, marginBottom: 8,
                  background: `${c.colore}1A`, color: c.colore,
                  display:'grid', placeItems:'center', flexShrink: 0,
                }}><Icon name={c.icona} size={17}/></span>
                <div style={{fontSize: 14.5, color: PN.MUTED, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{c.label}</div>
                <div style={{fontSize: 26, fontWeight: 700, color: PN.TEXT, letterSpacing:-0.5, lineHeight: 1.15}}>
                  {c.quota.toFixed(0)}%
                </div>
                <div style={{fontSize: 14.5, color: PN.MUTED, fontVariantNumeric:'tabular-nums'}}>{eur(c.valore)}</div>
                <div style={{marginTop: 8}}><StatSpark data={c.serie} color={c.colore} width={150} height={34}/></div>
              </div>
            ))}
          </div>
          <EconVai label="Vedi gli ordini per canale"
            onClick={() => { window.location.href = 'byup Statistiche.html?tab=operazioni&sub=ordini'; }}/>
        </StatCard>

        <StatCard title="Margine medio" sub="Media del periodo">
          <div style={{display:'flex', alignItems:'center', gap: 18, flexWrap:'wrap'}}>
            <svg width={144} height={144} viewBox="0 0 144 144" style={{flexShrink: 0}}>
              <circle cx="72" cy="72" r={anelloR} fill="none" stroke={PN.GREEN_SOFT} strokeWidth="14"/>
              <circle cx="72" cy="72" r={anelloR} fill="none" stroke={PN.GREEN} strokeWidth="14"
                strokeLinecap="round" transform="rotate(-90 72 72)"
                strokeDasharray={`${anelloC * marginePct / 100} ${anelloC}`}/>
              <text x="72" y="70" textAnchor="middle" fontSize="26" fontWeight="700" fill={PN.TEXT}>
                {marginePct.toFixed(1).replace('.', ',')}%
              </text>
              <text x="72" y="90" textAnchor="middle" fontSize="12.5" fill={PN.MUTED}>Margine</text>
            </svg>
            <div style={{flex: 1, minWidth: 150, display:'flex', flexDirection:'column', gap: 10}}>
              {[
                { et:'Ricavi', v: d.ricavi.val, col: PN.GREEN },
                { et:'Costi',  v: d.costi.val,  col: PN.RED },
              ].map((r, i) => (
                <div key={i} style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap: 10, fontSize: 14.5}}>
                  <span style={{color: PN.TEXT}}>{r.et}</span>
                  <span style={{color: r.col, fontWeight: 600, fontVariantNumeric:'tabular-nums'}}>{eur(r.v)}</span>
                </div>
              ))}
              <div style={{height: 1, background: PN.BORDER_SOFT, margin:'2px 0'}}/>
              <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap: 10, fontSize: 15}}>
                <strong style={{color: PN.TEXT}}>Margine lordo</strong>
                <strong style={{color: PN.GREEN, fontVariantNumeric:'tabular-nums'}}>{eur(d.utile.val)}</strong>
              </div>
            </div>
          </div>
          <EconVai label="Vedi il margine per piatto" onClick={() => onVaiVendite && onVaiVendite()}/>
        </StatCard>
      </div>

      {/* Riga 4 — il dettaglio dei costi, a tutta larghezza perché è un elenco */}
      <StatCard title="Totale costi" sub="Suddivisi per tipologia e categoria" action={
        <span style={{display:'inline-flex', alignItems:'center', gap: 12, fontSize: 14, color: PN.MUTED}}>
          <span style={{display:'inline-flex', alignItems:'center', gap:5}}><span style={{width:10, height:10, borderRadius:3, background: PN.PINK}}/> variabili</span>
          <span style={{display:'inline-flex', alignItems:'center', gap:5}}><span style={{width:10, height:10, borderRadius:3, background: PN.PINK_SOFT}}/> fissi</span>
        </span>
      }>
        <div style={{
          display:'flex', alignItems:'center', justifyContent:'space-between',
          padding:'12px 16px', background:'#FAFAFB',
          border:`1px solid ${PN.BORDER_SOFT}`, borderRadius: 12, marginBottom: 16,
        }}>
          <div style={{fontSize: 14.5, color: PN.MUTED}}>Costi totali del periodo</div>
          <div style={{display:'flex', alignItems:'center', gap: 10}}>
            <span style={{fontSize: 22, fontWeight: 700, color: PN.TEXT, fontVariantNumeric:'tabular-nums'}}>{eur(d.costi.val)}</span>
            <span style={{
              padding:'3px 10px', background: PN.GREEN_SOFT, color: PN.GREEN,
              borderRadius: 999, fontSize: 13, fontWeight: 700,
            }}>↓ 4,2% vs mese scorso</span>
          </div>
        </div>
        <div style={{display:'flex', flexDirection:'column', gap: 12}}>
          {d.costiBreakdown.map((c, i) => (
            <div key={i}>
              <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: 5}}>
                <span style={{fontSize: 14.5, fontWeight: 600, color: PN.TEXT}}>{c.cat}</span>
                <div style={{display:'flex', alignItems:'center', gap: 8}}>
                  <span style={{fontSize: 14, color: PN.MUTED}}>{c.fissi}% fissi · {c.var}% variabili</span>
                  <strong style={{fontSize: 14.5, color: PN.TEXT, fontVariantNumeric:'tabular-nums', minWidth: 70, textAlign:'right'}}>€ {c.tot.toLocaleString('it-IT', {useGrouping: true})}</strong>
                  <span style={{
                    padding:'2px 7px', borderRadius: 999,
                    background: c.delta < 0 ? PN.GREEN_SOFT : (c.delta > 5 ? PN.RED_SOFT : '#f3f4f6'),
                    color: c.delta < 0 ? PN.GREEN : (c.delta > 5 ? PN.RED : PN.MUTED),
                    fontSize: 12.5, fontWeight: 700, minWidth: 50, textAlign:'center',
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
        <StatKpi label="Articoli totali venduti" value={v.kpi.venduti.val.toLocaleString('it-IT', {useGrouping: true})} delta={v.kpi.venduti.delta} sub={v.kpi.venduti.sub}/>
      </div>

      <StatCard title="Performance piatti" sub="Ordina per qualsiasi colonna · margine, ricavo, n° venduti" action={
        <div style={{
          display:'flex', alignItems:'center', gap: 8,
          padding:'7px 12px', border:`1px solid ${PN.BORDER}`, borderRadius: 10, background: PN.WHITE,
        }}>
          <BuIcons.search size={13} color={PN.MUTED}/>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cerca piatto…" style={{border:'none', outline:'none', fontSize: 14.5, fontFamily:'inherit', width: 200}}/>
        </div>
      }>
        <div style={{borderRadius: 12, overflow:'hidden', border:`1px solid ${PN.BORDER_SOFT}`}}>
          <div style={{
            display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr 0.8fr 1.2fr 1.2fr 0.9fr',
            padding:'10px 16px', background:'#FAFAFB',
            fontSize: 12.5, fontWeight: 700, color: PN.MUTED,
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
              fontSize: 14.5, color: PN.TEXT,
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
                  fontSize: 14, fontWeight: 700,
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
