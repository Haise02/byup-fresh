// Statistiche — sub-tab Prenotazioni

function StatPrenotazioni() {
  const d = STAT_PRENOTAZIONI;

  // Stato prenotazioni e distribuzione tavoli: due ciambelle con la legenda a
  // fianco, come Origine incassi. Stesso componente, quindi anche lo spicchio
  // che cresce sotto il mouse e la legenda che si accende in coppia.
  // Verde/blu/rosa/grigio sono colori di stato, non di serie.
  const [statoSu, setStatoSu] = React.useState(null);
  const [tavoliSu, setTavoliSu] = React.useState(null);
  const statoSegs = [
    { id:'confermate', label:'Confermate', ...d.stato.confermate, color: PN.GREEN },
    { id:'inattesa',   label:'In attesa di conferma', ...d.stato.inAttesa, color: PN.BLUE },
    { id:'cancellate', label:'Cancellate', ...d.stato.cancellate, color: PN.PINK },
    { id:'noshow',     label:'Non presentati', ...d.stato.noShow, color: PN.MUTED_LIGHT },
  ];

  // Coperti per giorno — colonne SVG con baseline, cap arrotondato 4px, e la
  // media del periodo come soglia tratteggiata etichettata sul margine destro.
  // Non più un target deciso a tavolino: il riferimento è quello che il locale
  // ha fatto davvero, quindi «sopra» e «sotto» dicono qualcosa di suo.
  const mediaCop = d.copertiGiorno.reduce((s, g) => s + g.val, 0) / d.copertiGiorno.length;
  const maxCop = Math.max(...d.copertiGiorno.map(x => x.val), mediaCop);
  // Margine destro più largo di prima: "media 24,7" è più lunga di
  // "target 25" e finiva tagliata fuori dal riquadro.
  const cgW = 460, cgH = 208, cgP = { l: 6, r: 84, t: 24, b: 26 };
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
      {/* KPI — due per riga e non quattro. Questa disposizione è orizzontale
          e vuole la larghezza che ha in Economici, dove le card sono tre: in
          quattro colonne, a 1280, all'etichetta restano 72px e si troncavano
          tutte. Due per riga è anche il ritmo dei KPI di Ordini, qui accanto. */}
      <div style={{display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap: 12}}>
        <StatKpiTinto tono="blu" icona="people-customer" label="Coperti serviti"
          valore={d.kpi.coperti.val.toLocaleString('it-IT', {useGrouping: true})}
          delta={d.kpi.coperti.delta} sub="Ospiti serviti nel periodo" trend={d.kpi.coperti.trend}/>
        <StatKpiTinto tono="verde" icona="place-table" label="Tasso di occupazione"
          valore={d.kpi.occupazione.val} suffisso="%"
          delta={d.kpi.occupazione.delta} sub="Riempimento medio delle sale" trend={d.kpi.occupazione.trend}/>
        <StatKpiTinto tono="giallo" icona="people-staff-group" label="Coperti per tavolo"
          valore={d.kpi.perTavolo.val.toString().replace('.', ',')}
          delta={d.kpi.perTavolo.delta} sub="Media ospiti per prenotazione" trend={d.kpi.perTavolo.trend}/>
        <StatKpiTinto tono="viola" icona="time-clock" label="Durata media al tavolo"
          valore={d.kpi.durata.val}
          delta={d.kpi.durata.delta} sub="Permanenza media al tavolo" trend={d.kpi.durata.trend}/>
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
        <StatCard title="Stato prenotazioni" sub="Riepilogo del periodo selezionato"
          style={{display:'flex', flexDirection:'column'}}>
          <div style={{flex: 1, display:'flex', alignItems:'center', gap: 18, minWidth: 0}}>
            <StatDonut
              voci={statoSegs.map(v => ({ id: v.id, label: v.label, colore: v.color, valore: v.n }))}
              attivo={statoSu} onAttivo={setStatoSu}
              centro={{ et:'Totale', val: d.stato.totale }}/>
            <div style={{flex: 1, minWidth: 0, display:'flex', flexDirection:'column', gap: 13}}>
              {statoSegs.map(v => (
                <div key={v.id}
                  onMouseEnter={() => setStatoSu(v.id)} onMouseLeave={() => setStatoSu(null)}
                  style={{
                    display:'flex', alignItems:'center', gap: 9, fontSize: 14.5,
                    opacity: statoSu == null || statoSu === v.id ? 1 : 0.45,
                    transition:'opacity 160ms ease',
                  }}>
                  <span style={{width: 11, height: 11, background: v.color, borderRadius:'50%', flexShrink: 0}}/>
                  <span style={{flex: 1, color: PN.TEXT, minWidth: 0}}>{v.label}</span>
                  <strong style={{color: PN.TEXT, fontVariantNumeric:'tabular-nums'}}>{v.n}</strong>
                  <span style={{color: PN.MUTED, fontVariantNumeric:'tabular-nums', width: 48, textAlign:'right'}}>{v.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </StatCard>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap: 16}}>
        {/* Coperti per giorno */}
        <StatCard title="Coperti per giorno" sub={`Confronto con la media del periodo (${mediaCop.toFixed(1).replace('.', ',')})`} action={
          <span style={{display:'inline-flex', alignItems:'center', gap: 12, fontSize: 14, color: PN.MUTED}}>
            <span style={{display:'inline-flex', alignItems:'center', gap:5}}><span style={{width:10, height:10, borderRadius:3, background: PN.PINK}}/> sopra la media</span>
            <span style={{display:'inline-flex', alignItems:'center', gap:5}}><span style={{width:10, height:10, borderRadius:3, background:'#FFB3B5'}}/> sotto</span>
          </span>
        }>
          <svg viewBox={`0 0 ${cgW} ${cgH}`} style={{width:'100%', display:'block'}}>
            {/* Baseline */}
            <line x1={cgP.l} y1={cgH - cgP.b} x2={cgW - cgP.r + 4} y2={cgH - cgP.b} stroke={PN.BORDER} strokeWidth={1}/>
            {/* La media — tratteggiata perché è un riferimento, non griglia.
                Sta sotto le colonne così le etichette dei valori restano leggibili. */}
            <line x1={cgP.l} y1={cgY(mediaCop)} x2={cgW - cgP.r + 4} y2={cgY(mediaCop)} stroke={PN.TEXT} strokeWidth={1.3} strokeDasharray="5 4" opacity={0.55}/>
            <text x={cgW - cgP.r + 10} y={cgY(mediaCop) + 4} fontSize="11.5" fontWeight="600" fill={PN.MUTED}>media {mediaCop.toFixed(1).replace('.', ',')}</text>
            {d.copertiGiorno.map((g, i) => {
              const above = g.val >= mediaCop;
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
        <StatCard title="Distribuzione tavoli" sub="Per numero di coperti"
          style={{display:'flex', flexDirection:'column'}}>
          <div style={{flex: 1, display:'flex', alignItems:'center', gap: 18, minWidth: 0}}>
            <StatDonut
              voci={d.distribuzione.map(v => ({ id: v.label, label: v.label, colore: v.color, valore: v.pct, centro: `${v.pct}%` }))}
              attivo={tavoliSu} onAttivo={setTavoliSu}
              centro={{ et:'Totale', val: d.stato.totale }}/>
            <div style={{flex: 1, minWidth: 0, display:'flex', flexDirection:'column', gap: 13}}>
              {d.distribuzione.map(v => (
                <div key={v.label}
                  onMouseEnter={() => setTavoliSu(v.label)} onMouseLeave={() => setTavoliSu(null)}
                  style={{
                    display:'flex', alignItems:'center', gap: 9, fontSize: 14.5,
                    opacity: tavoliSu == null || tavoliSu === v.label ? 1 : 0.45,
                    transition:'opacity 160ms ease',
                  }}>
                  <span style={{width: 11, height: 11, background: v.color, borderRadius:'50%', flexShrink: 0}}/>
                  <span style={{flex: 1, color: PN.TEXT, minWidth: 0}}>{v.label}</span>
                  <strong style={{color: PN.TEXT, fontVariantNumeric:'tabular-nums'}}>{v.pct}%</strong>
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
