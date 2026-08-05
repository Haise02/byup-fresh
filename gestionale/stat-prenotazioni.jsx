// Statistiche — sub-tab Prenotazioni

function StatPrenotazioni() {
  const d = STAT_PRENOTAZIONI;
  const maxCop = Math.max(...d.copertiGiorno.map(x => Math.max(x.val, x.target)));

  // Stato prenotazioni → segmenti della barra 100% e righe legenda.
  // Verde/blu/rosa/grigio sono colori di stato, non di serie.
  const statoSegs = [
    { label:'Confermate', ...d.stato.confermate, color: PN.GREEN },
    { label:'In attesa di conferma', ...d.stato.inAttesa, color: PN.BLUE },
    { label:'Cancellate', ...d.stato.cancellate, color: PN.PINK },
    { label:'Non presentati', ...d.stato.noShow, color: PN.MUTED_LIGHT },
  ];

  // Donut math
  let cumPct = 0;
  const donutR = 60, donutCx = 80, donutCy = 80;
  const donutSegs = d.distribuzione.map(s => {
    const start = cumPct;
    cumPct += s.pct;
    const a0 = (start / 100) * 2 * Math.PI - Math.PI/2;
    const a1 = (cumPct / 100) * 2 * Math.PI - Math.PI/2;
    const x0 = donutCx + donutR * Math.cos(a0), y0 = donutCy + donutR * Math.sin(a0);
    const x1 = donutCx + donutR * Math.cos(a1), y1 = donutCy + donutR * Math.sin(a1);
    const large = (s.pct > 50) ? 1 : 0;
    return { ...s, path: `M ${donutCx} ${donutCy} L ${x0} ${y0} A ${donutR} ${donutR} 0 ${large} 1 ${x1} ${y1} Z` };
  });

  // Coperti per giorno — colonne SVG con baseline, cap arrotondato 4px,
  // target come soglia tratteggiata etichettata sul margine destro.
  const cgW = 460, cgH = 208, cgP = { l: 6, r: 64, t: 24, b: 26 };
  const cgPlotH = cgH - cgP.t - cgP.b;
  const cgSlot = (cgW - cgP.l - cgP.r) / d.copertiGiorno.length;
  const cgBarW = Math.min(24, Math.round(cgSlot * 0.48));
  const cgY = (v) => cgH - cgP.b - (v / maxCop) * cgPlotH;
  // Cap arrotondato solo in alto, base quadrata sulla baseline
  const colPath = (x, top, w, h, r) => {
    const rr = Math.min(r, h);
    return `M${x},${top + rr} Q${x},${top} ${x + rr},${top} H${x + w - rr} Q${x + w},${top} ${x + w},${top + rr} V${top + h} H${x} Z`;
  };

  return (
    <div style={{display:'flex', flexDirection:'column', gap: 16}}>
      {/* KPI */}
      <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap: 12}}>
        <StatKpi label="Coperti serviti" value={d.kpi.coperti.val.toLocaleString('it-IT', {useGrouping: true})} delta={d.kpi.coperti.delta} sub="Totale ospiti serviti nel periodo selezionato"/>
        <StatKpi label="Tasso di occupazione" value={d.kpi.occupazione.val} suffix="%" delta={d.kpi.occupazione.delta} sub="Percentuale media di riempimento delle sale"/>
        <StatKpi label="Coperti per tavolo" value={d.kpi.perTavolo.val} delta={d.kpi.perTavolo.delta} sub="Media ospiti per prenotazione"/>
        <StatKpi label="Durata media al tavolo" value={d.kpi.durata.val} delta={d.kpi.durata.delta} sub="Tempo medio di permanenza al tavolo"/>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap: 16}}>
        {/* Occupazione fasce — un solo colore di serie; il wine scatta
            solo come stato "quasi pieno" (≥85%), non come sfumatura. */}
        <StatCard title="Occupazione tavoli per fascia oraria" sub="Tavoli occupati ordinati per orario · totale 20 tavoli">
          <div style={{display:'flex', flexDirection:'column', gap: 13}}>
            {d.fasceOccupazione.map((f, i) => {
              const pct = Math.round((f.tavoli / f.max) * 100);
              const critical = pct >= 85;
              return (
                <div key={i} style={{display:'grid', gridTemplateColumns:'56px 1fr 90px 48px', alignItems:'center', gap: 12}}>
                  <span style={{fontSize: 14.5, fontWeight: 700, color: PN.TEXT, fontVariantNumeric:'tabular-nums'}}>{f.ora}</span>
                  <div style={{height: 8, background: PN.WHITE_FROST, borderRadius: 999, overflow:'hidden'}}>
                    <div style={{
                      height:'100%', width: `${Math.min(pct,100)}%`,
                      background: critical ? PN.WINE : PN.PINK, borderRadius: 999,
                      transition:'width 0.4s ease-out',
                    }}/>
                  </div>
                  <span style={{fontSize: 14.5, color: PN.MUTED, fontVariantNumeric:'tabular-nums', textAlign:'right'}}>{f.tavoli}/{f.max} tavoli</span>
                  <span style={{fontSize: 14.5, fontWeight: 700, color: critical ? PN.WINE : PN.TEXT, fontVariantNumeric:'tabular-nums', textAlign:'right'}}>{pct}%</span>
                </div>
              );
            })}
          </div>
        </StatCard>

        {/* Stato prenotazioni — totale come numero guida, proporzioni in
            una barra 100% con gap 2px, righe quiete con dot di stato. */}
        <StatCard title="Stato prenotazioni" sub="Riepilogo del periodo selezionato">
          <div style={{display:'flex', alignItems:'baseline', gap: 10, marginBottom: 14}}>
            <span style={{fontSize: 36, fontWeight: 700, color: PN.TEXT, letterSpacing: -0.6, lineHeight: 1}}>{d.stato.totale}</span>
            <span style={{fontSize: 14.5, color: PN.MUTED}}>prenotazioni totali</span>
          </div>
          <div style={{display:'flex', gap: 2, height: 12, borderRadius: 999, overflow:'hidden', marginBottom: 8}}>
            {statoSegs.map((s, i) => (
              <div key={i} style={{width: `${s.pct}%`, background: s.color}}/>
            ))}
          </div>
          <div style={{display:'flex', flexDirection:'column'}}>
            {statoSegs.map((s, i) => (
              <div key={i} style={{
                display:'flex', alignItems:'center', gap: 10, padding:'10px 2px',
                borderTop: i === 0 ? 'none' : `1px solid ${PN.BORDER_SOFT}`,
              }}>
                <span style={{width: 10, height: 10, borderRadius: 3, background: s.color, flexShrink: 0}}/>
                <span style={{flex: 1, fontSize: 15, color: PN.TEXT}}>{s.label}</span>
                <strong style={{fontSize: 15, color: PN.TEXT, fontVariantNumeric:'tabular-nums'}}>{s.n}</strong>
                <span style={{fontSize: 14, color: PN.MUTED, fontVariantNumeric:'tabular-nums', width: 52, textAlign:'right'}}>{s.pct}%</span>
              </div>
            ))}
          </div>
        </StatCard>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap: 16}}>
        {/* Coperti per giorno */}
        <StatCard title="Coperti per giorno" sub="Confronto con target settimanale (25)" action={
          <span style={{display:'inline-flex', alignItems:'center', gap: 12, fontSize: 14, color: PN.MUTED}}>
            <span style={{display:'inline-flex', alignItems:'center', gap:5}}><span style={{width:10, height:10, borderRadius:3, background: PN.PINK}}/> sopra target</span>
            <span style={{display:'inline-flex', alignItems:'center', gap:5}}><span style={{width:10, height:10, borderRadius:3, background:'#FFB3B5'}}/> sotto</span>
          </span>
        }>
          <svg viewBox={`0 0 ${cgW} ${cgH}`} style={{width:'100%', display:'block'}}>
            {/* Baseline */}
            <line x1={cgP.l} y1={cgH - cgP.b} x2={cgW - cgP.r + 4} y2={cgH - cgP.b} stroke={PN.BORDER} strokeWidth={1}/>
            {/* Soglia target — tratteggiata perché è una soglia, non griglia.
                Sta sotto le colonne così le etichette dei valori restano leggibili. */}
            <line x1={cgP.l} y1={cgY(25)} x2={cgW - cgP.r + 4} y2={cgY(25)} stroke={PN.TEXT} strokeWidth={1.3} strokeDasharray="5 4" opacity={0.55}/>
            <text x={cgW - cgP.r + 10} y={cgY(25) + 4} fontSize="11.5" fontWeight="600" fill={PN.MUTED}>target 25</text>
            {d.copertiGiorno.map((g, i) => {
              const above = g.val >= g.target;
              const top = cgY(g.val);
              const x = cgP.l + i * cgSlot + (cgSlot - cgBarW) / 2;
              const h = (cgH - cgP.b) - top;
              return (
                <g key={i}>
                  <path d={colPath(x, top, cgBarW, h, 4)} fill={above ? PN.PINK : '#FFB3B5'}/>
                  <text x={x + cgBarW/2} y={top - 7} fontSize="12.5" fontWeight="600" fill={PN.TEXT} textAnchor="middle" stroke={PN.WHITE} strokeWidth={3} paintOrder="stroke">{g.val}</text>
                  <text x={x + cgBarW/2} y={cgH - 8} fontSize="12" fontWeight="600" fill={PN.MUTED} textAnchor="middle">{g.d}</text>
                </g>
              );
            })}
          </svg>
        </StatCard>

        {/* Distribuzione tavoli — gap bianco 2px tra gli spicchi */}
        <StatCard title="Distribuzione tavoli" sub="Per numero di coperti">
          <div style={{display:'flex', alignItems:'center', gap: 24}}>
            <svg width="160" height="160" viewBox="0 0 160 160">
              {donutSegs.map((s, i) => <path key={i} d={s.path} fill={s.color} stroke={PN.WHITE} strokeWidth={2} strokeLinejoin="round"/>)}
              <circle cx={80} cy={80} r={40} fill={PN.WHITE}/>
              <text x={80} y={75} textAnchor="middle" fontSize="11" fill={PN.MUTED}>Totale</text>
              <text x={80} y={93} textAnchor="middle" fontSize="18" fontWeight="700" fill={PN.TEXT}>{d.stato.totale}</text>
            </svg>
            <div style={{flex: 1, display:'flex', flexDirection:'column', gap: 10}}>
              {donutSegs.map((s, i) => (
                <div key={i} style={{display:'flex', alignItems:'center', gap: 10, fontSize: 14.5}}>
                  <span style={{width: 12, height: 12, background: s.color, borderRadius: 3}}/>
                  <span style={{flex: 1, color: PN.TEXT}}>{s.label}</span>
                  <strong style={{color: PN.TEXT, fontVariantNumeric:'tabular-nums'}}>{s.pct}%</strong>
                </div>
              ))}
            </div>
          </div>
        </StatCard>
      </div>
    </div>
  );
}

window.StatPrenotazioni = StatPrenotazioni;
