// Statistiche — sub-tab Prenotazioni

function StatPrenotazioni() {
  const d = STAT_PRENOTAZIONI;
  const maxCop = Math.max(...d.copertiGiorno.map(x => Math.max(x.val, x.target)));

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

  return (
    <div style={{display:'flex', flexDirection:'column', gap: 16}}>
      {/* KPI */}
      <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap: 12}}>
        <StatKpi label="Coperti serviti" value={d.kpi.coperti.val.toLocaleString('it-IT')} delta={d.kpi.coperti.delta} sub="Totale ospiti serviti nel periodo selezionato"/>
        <StatKpi label="Tasso di occupazione" value={d.kpi.occupazione.val} suffix="%" delta={d.kpi.occupazione.delta} sub="Percentuale media di riempimento delle sale"/>
        <StatKpi label="Coperti per tavolo" value={d.kpi.perTavolo.val} delta={d.kpi.perTavolo.delta} sub="Media ospiti per prenotazione"/>
        <StatKpi label="Durata media visita" value={d.kpi.durata.val} delta={d.kpi.durata.delta} sub="Tempo medio di permanenza al tavolo"/>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap: 16}}>
        {/* Occupazione fasce */}
        <StatCard title="Occupazione tavoli per fascia oraria" sub="Tavoli occupati ordinati per orario · totale 20 tavoli">
          <div style={{display:'flex', flexDirection:'column', gap: 12}}>
            {d.fasceOccupazione.map((f, i) => {
              const pct = Math.round((f.tavoli / f.max) * 100);
              const tone = pct >= 85 ? PN.RED : pct >= 70 ? PN.TEXT : PN.MUTED;
              const barColor = pct >= 85 ? PN.RED : pct >= 70 ? PN.PINK : PN.AMBER;
              return (
                <div key={i} style={{display:'grid', gridTemplateColumns:'56px 1fr 90px 48px', alignItems:'center', gap: 12}}>
                  <span style={{fontSize: 12.5, fontWeight: 700, color: PN.TEXT, fontVariantNumeric:'tabular-nums'}}>{f.ora}</span>
                  <div style={{height: 8, background:'#F1F2F4', borderRadius: 999, overflow:'hidden'}}>
                    <div style={{
                      height:'100%', width: `${Math.min(pct,100)}%`,
                      background: barColor, borderRadius: 999,
                      transition:'width 0.4s ease-out',
                    }}/>
                  </div>
                  <span style={{fontSize: 11.5, color: PN.MUTED, fontVariantNumeric:'tabular-nums', textAlign:'right'}}>{f.tavoli}/{f.max} tavoli</span>
                  <span style={{fontSize: 12.5, fontWeight: 700, color: tone, fontVariantNumeric:'tabular-nums', textAlign:'right'}}>{pct}%</span>
                </div>
              );
            })}
          </div>
        </StatCard>

        {/* Stato prenotazioni */}
        <StatCard title="Stato prenotazioni" sub="Riepilogo del periodo selezionato">
          <div style={{display:'flex', flexDirection:'column', gap: 8}}>
            <StatusRow label="Totale prenotazioni" n={d.stato.totale} bg={PN.WINE} color="#fff" big/>
            <StatusRow label="Confermate" n={d.stato.confermate.n} pct={d.stato.confermate.pct} bg={PN.GREEN_SOFT} color={PN.GREEN}/>
            <StatusRow label="In attesa di conferma" n={d.stato.inAttesa.n} pct={d.stato.inAttesa.pct} bg={PN.BLUE_SOFT} color={PN.BLUE}/>
            <StatusRow label="Cancellate" n={d.stato.cancellate.n} pct={d.stato.cancellate.pct} bg={PN.PINK_SOFT} color={PN.PINK_DARK}/>
            <StatusRow label="No show" n={d.stato.noShow.n} pct={d.stato.noShow.pct} bg="#f3f4f6" color={PN.MUTED}/>
          </div>
        </StatCard>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap: 16}}>
        {/* Coperti per giorno */}
        <StatCard title="Coperti per giorno" sub="Confronto con target settimanale (25)" action={
          <span style={{display:'inline-flex', alignItems:'center', gap: 12, fontSize: 11, color: PN.MUTED}}>
            <span style={{display:'inline-flex', alignItems:'center', gap:5}}><span style={{width:10, height:10, borderRadius:3, background: PN.PINK}}/> coperti</span>
            <span style={{display:'inline-flex', alignItems:'center', gap:5}}><span style={{width:14, height:2, background: PN.TEXT}}/> target</span>
          </span>
        }>
          <div style={{display:'grid', gridTemplateColumns:'repeat(7, 1fr)', gap: 14, alignItems:'end', height: 200, padding:'14px 0 8px', position:'relative'}}>
            {/* Target line */}
            <div style={{
              position:'absolute', left: 0, right: 0,
              bottom: `${(25 / maxCop) * 92 + 28}px`,
              height: 1.5, background: PN.TEXT, opacity: 0.6, zIndex: 1,
              borderTop:`1px dashed ${PN.TEXT}`,
            }}/>
            {d.copertiGiorno.map((g, i) => {
              const above = g.val >= g.target;
              return (
                <div key={i} style={{display:'flex', flexDirection:'column', alignItems:'center', gap: 6}}>
                  <span style={{fontSize: 11, fontWeight: 700, color: above ? PN.GREEN : PN.PINK}}>{g.val}</span>
                  <div style={{
                    width:'100%', height: `${(g.val / maxCop) * 92}%`,
                    background: above ? `linear-gradient(180deg, ${PN.PINK}, ${PN.PINK_DARK})` : PN.PINK,
                    borderRadius:'6px 6px 0 0',
                    position:'relative', zIndex: 2,
                  }}/>
                  <span style={{fontSize: 11, color: PN.MUTED, fontWeight: 600}}>{g.d}</span>
                </div>
              );
            })}
          </div>
        </StatCard>

        {/* Distribuzione tavoli */}
        <StatCard title="Distribuzione tavoli" sub="Per numero di coperti">
          <div style={{display:'flex', alignItems:'center', gap: 24}}>
            <svg width="160" height="160" viewBox="0 0 160 160">
              {donutSegs.map((s, i) => <path key={i} d={s.path} fill={s.color}/>)}
              <circle cx={80} cy={80} r={38} fill={PN.WHITE}/>
              <text x={80} y={76} textAnchor="middle" fontSize="11" fill={PN.MUTED}>Totale</text>
              <text x={80} y={92} textAnchor="middle" fontSize="16" fontWeight="700" fill={PN.TEXT}>{d.stato.totale}</text>
            </svg>
            <div style={{flex: 1, display:'flex', flexDirection:'column', gap: 10}}>
              {donutSegs.map((s, i) => (
                <div key={i} style={{display:'flex', alignItems:'center', gap: 10, fontSize: 12.5}}>
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

function StatusRow({ label, n, pct, bg, color, big }) {
  return (
    <div style={{
      display:'flex', alignItems:'center', justifyContent:'space-between',
      padding: big ? '14px 16px' : '11px 14px',
      background: bg, borderRadius: 10,
    }}>
      <span style={{fontSize: big ? 14 : 13, fontWeight: 700, color}}>{label}</span>
      <span style={{fontSize: big ? 16 : 13, fontWeight: 700, color, fontVariantNumeric:'tabular-nums'}}>
        {n}{pct != null && <span style={{fontWeight: 500, marginLeft: 6, opacity: 0.8}}>({pct}%)</span>}
      </span>
    </div>
  );
}

window.StatPrenotazioni = StatPrenotazioni;
