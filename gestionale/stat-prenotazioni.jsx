// Statistiche — sub-tab Prenotazioni

function StatPrenotazioni() {
  const d = STAT_PRENOTAZIONI;

  // Stato prenotazioni e distribuzione tavoli: due ciambelle con la legenda a
  // fianco, come Origine incassi. Stesso componente, quindi anche lo spicchio
  // che cresce sotto il mouse e la legenda che si accende in coppia.
  // Verde/blu/rosa/grigio sono colori di stato, non di serie.
  const [statoSu, setStatoSu] = React.useState(null);
  // Colonna sotto il mouse nei due grafici a barre. Stessa idea del donut:
  // quella puntata resta a colore pieno e si allarga, le altre si spengono.
  // Solo in larghezza — allungarla verso l'alto direbbe un numero che non è
  // quello, e un grafico non deve mentire per farsi guardare.
  const [oraSu, setOraSu] = React.useState(null);
  const [giornoSu, setGiornoSu] = React.useState(null);
  const [tavoliSu, setTavoliSu] = React.useState(null);
  const statoSegs = [
    { id:'confermate', label:'Confermate', ...d.stato.confermate, color: PN.GREEN },
    { id:'inattesa',   label:'In attesa', ...d.stato.inAttesa, color: PN.BLUE },
    { id:'cancellate', label:'Cancellate', ...d.stato.cancellate, color: PN.PINK },
    { id:'noshow',     label:'Assenti', ...d.stato.noShow, color: PN.MUTED_LIGHT },
  ];

  // Occupazione per fascia — colonne invece di una lista di barre. Una lista
  // mette in fila sette percentuali; le colonne mostrano la FORMA della
  // giornata: due gobbe, il pranzo e la cena, separate dalle ore in cui il
  // locale è chiuso. È anche la stessa grammatica di "Coperti per giorno" qui
  // sotto — baseline, soglia tratteggiata, valore sopra la colonna — così le
  // due card della sezione si leggono con lo stesso occhio.
  const capienza = Math.max(...d.fasceOccupazione.map(f => f.max));
  const piena = d.fasceOccupazione.reduce((a, f) => f.tavoli > a.tavoli ? f : a, d.fasceOccupazione[0]);
  // Dove si spezza la giornata: fra due fasce non consecutive c'è il buco fra
  // i servizi, ed è lì che va la riga di stacco.
  const stacco = d.fasceOccupazione.findIndex((f, i) =>
    i > 0 && parseInt(f.ora) - parseInt(d.fasceOccupazione[i-1].ora) > 1);
  const foW = 460, foH = 214, foP = { l: 6, r: 66, t: 26, b: 30 };
  const foPlotH = foH - foP.t - foP.b;
  const foSlot = (foW - foP.l - foP.r) / d.fasceOccupazione.length;
  const foBarW = Math.min(26, Math.round(foSlot * 0.5));
  const foY = (v) => foH - foP.b - (v / capienza) * foPlotH;

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
      {/* KPI — tutti su una riga, quindi nella variante compatta: l'etichetta
          si prende la riga intera e il delta scende accanto al numero. Con la
          pillola di fianco al nome, in quattro colonne a 1280 restavano 72px
          per l'etichetta e si troncavano tutte.
          Nomi corti perché ci stiano accanto alla pillola: a 1280 quella riga
          lascia all'etichetta 89px, misurati, e «Tasso di occupazione» ne
          chiede 143. La forma per esteso sta nel sottotitolo, che ha la
          larghezza intera.
          L'andamento c'è, piccolo, accanto al numero: lì restano 64px anche
          nella card più piena. Di fianco all'etichetta non ci sarebbe stato —
          quella riga la divide già con la pillola. */}
      <div style={{display:'grid', gridTemplateColumns: STG('repeat(4, 1fr)', '1fr 1fr'), gap: 12}}>
        <StatKpiTinto compatto tono="blu" icona="people-customer" label="Coperti"
          valore={d.kpi.coperti.val.toLocaleString('it-IT', {useGrouping: true})}
          delta={d.kpi.coperti.delta} sub="Ospiti serviti nel periodo" trend={d.kpi.coperti.trend}/>
        <StatKpiTinto compatto tono="verde" icona="place-table" label="Occupazione"
          valore={d.kpi.occupazione.val} suffisso="%"
          delta={d.kpi.occupazione.delta} sub="Riempimento medio delle sale" trend={d.kpi.occupazione.trend}/>
        <StatKpiTinto compatto tono="giallo" icona="people-staff-group" label="Per tavolo"
          valore={d.kpi.perTavolo.val.toString().replace('.', ',')}
          delta={d.kpi.perTavolo.delta} sub="Media ospiti per prenotazione" trend={d.kpi.perTavolo.trend}/>
        <StatKpiTinto compatto tono="viola" icona="time-clock" label="Durata media"
          valore={d.kpi.durata.val}
          delta={d.kpi.durata.delta} sub="Permanenza media al tavolo" trend={d.kpi.durata.trend}/>
      </div>

      <div style={{display:'grid', gridTemplateColumns: STG('1fr 1fr'), gap: 16}}>
        {/* Occupazione fasce — un solo colore di serie; il wine scatta
            solo come stato "quasi pieno" (≥85%), non come sfumatura. */}
        <StatCard title="Occupazione tavoli per fascia oraria"
          sub={`Su ${capienza} tavoli · picco alle ${piena.ora} con ${piena.tavoli}`} action={
          // Una sola voce: la seconda avrebbe dovuto chiamarsi "resto", che
          // non è uno stato ma l'assenza dell'altro.
          <span style={{display:'inline-flex', alignItems:'center', gap: 6, fontSize: 14, color: PN.MUTED}}>
            <span style={{width:10, height:10, borderRadius:3, background: PN.WINE}}/> quasi pieno, da 85%
          </span>
        }>
          <svg viewBox={`0 0 ${foW} ${foH}`} style={{width:'100%', display:'block'}}>
            <line x1={foP.l} y1={foH - foP.b} x2={foW - foP.r + 4} y2={foH - foP.b} stroke={PN.BORDER} strokeWidth={1}/>
            {/* La capienza: è il tetto, non una griglia, quindi tratteggiata. */}
            <line x1={foP.l} y1={foY(capienza)} x2={foW - foP.r + 4} y2={foY(capienza)} stroke={PN.TEXT} strokeWidth={1.3} strokeDasharray="5 4" opacity={0.55}/>
            <text x={foW - foP.r + 10} y={foY(capienza) + 4} fontSize="11.5" fontWeight="600" fill={PN.MUTED}>{capienza} tavoli</text>

            {/* Lo stacco fra pranzo e cena: senza, le due gobbe sembrano una
                curva sola con un avvallamento, e non è quello che succede. */}
            {stacco > 0 && (
              <line
                x1={foP.l + stacco * foSlot} y1={foP.t - 6}
                x2={foP.l + stacco * foSlot} y2={foH - foP.b}
                stroke={PN.BORDER} strokeWidth={1} strokeDasharray="3 4"/>
            )}

            {d.fasceOccupazione.map((f, i) => {
              const quasiPieno = f.tavoli / f.max >= 0.85;
              const top = foY(f.tavoli);
              const x = foP.l + i * foSlot + (foSlot - foBarW) / 2;
              const su = oraSu === i, spenta = oraSu != null && !su;
              const cx = x + foBarW / 2;
              return (
                <g key={i}
                  onMouseEnter={() => setOraSu(i)} onMouseLeave={() => setOraSu(null)}>
                  {/* Bersaglio invisibile su tutta la colonna: puntare una
                      barra alta dieci pixel sarebbe un esercizio di mira. */}
                  <rect x={foP.l + i * foSlot} y={foP.t - 10} width={foSlot} height={foH - foP.b - foP.t + 10} fill="transparent"/>
                  <g style={{
                    transformOrigin: `${cx}px 0`,
                    transform: su ? 'scaleX(1.18)' : 'scaleX(1)',
                    opacity: spenta ? 0.45 : 1,
                    transition:'transform 160ms ease, opacity 160ms ease',
                  }}>
                    {/* Il binario mostra quanto NON è stato usato: senza, una
                        colonna bassa non dice se il locale era vuoto o piccolo. */}
                    <path d={colPath(x, foY(capienza), foBarW, (foH - foP.b) - foY(capienza), 4)} fill={PN.WHITE_FROST}/>
                    <path d={colPath(x, top, foBarW, (foH - foP.b) - top, 4)} fill={quasiPieno ? PN.WINE : PN.PINK}/>
                  </g>
                  <text x={cx} y={top - 7} fontSize={su ? 14 : 12.5} fontWeight={su ? 800 : 600}
                    fill={quasiPieno ? PN.WINE : PN.TEXT} textAnchor="middle"
                    stroke={PN.WHITE} strokeWidth={3} paintOrder="stroke"
                    style={{opacity: spenta ? 0.45 : 1, transition:'opacity 160ms ease'}}>{f.tavoli}</text>
                  <text x={cx} y={foH - 10} fontSize="12" fontWeight={su ? 800 : 600}
                    fill={su ? PN.TEXT : PN.MUTED} textAnchor="middle">{f.ora.replace(':00', '')}</text>
                </g>
              );
            })}
          </svg>
        </StatCard>

        {/* Stato prenotazioni — totale come numero guida, proporzioni in
            una barra 100% con gap 2px, righe quiete con dot di stato. */}
        <StatCard title="Stato prenotazioni" sub="Riepilogo del periodo selezionato"
          style={{display:'flex', flexDirection:'column'}}>
          {/* Ciambella più grande e legenda più corposa che in Economici: là
              la card ha anche il bottone in fondo, qui no, e con le misure di
              là restava dell'aria che faceva sembrare tutto piccolo. */}
          <div style={{flex: 1, display:'flex', alignItems:'center', gap: 24, minWidth: 0}}>
            <StatDonut
              voci={statoSegs.map(v => ({ id: v.id, label: v.label, colore: v.color, valore: v.n }))}
              attivo={statoSu} onAttivo={setStatoSu}
              centro={{ et:'Totale', val: d.stato.totale }}
              larghezza="44%" maxLarghezza={236}/>
            <div style={{flex: 1, minWidth: 0, display:'flex', flexDirection:'column', gap: 16}}>
              {statoSegs.map(v => (
                <div key={v.id}
                  onMouseEnter={() => setStatoSu(v.id)} onMouseLeave={() => setStatoSu(null)}
                  style={{
                    display:'flex', alignItems:'center', gap: 10, fontSize: 15.5,
                    opacity: statoSu == null || statoSu === v.id ? 1 : 0.45,
                    transition:'opacity 160ms ease',
                  }}>
                  <span style={{width: 12, height: 12, background: v.color, borderRadius:'50%', flexShrink: 0}}/>
                  <span style={{flex: 1, color: PN.TEXT, minWidth: 0, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{v.label}</span>
                  <strong style={{color: PN.TEXT, flexShrink: 0, fontVariantNumeric:'tabular-nums'}}>{v.n}</strong>
                  <span style={{color: PN.MUTED, fontVariantNumeric:'tabular-nums', width: 52, textAlign:'right'}}>{v.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </StatCard>
      </div>

      <div style={{display:'grid', gridTemplateColumns: STG('1fr 1fr'), gap: 16}}>
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
              const su = giornoSu === i, spenta = giornoSu != null && !su;
              const cx = x + cgBarW / 2;
              return (
                <g key={i}
                  onMouseEnter={() => setGiornoSu(i)} onMouseLeave={() => setGiornoSu(null)}>
                  <rect x={cgP.l + i * cgSlot} y={cgP.t - 10} width={cgSlot} height={cgH - cgP.b - cgP.t + 10} fill="transparent"/>
                  <path d={colPath(x, top, cgBarW, h, 4)} fill={above ? PN.PINK : '#FFB3B5'}
                    style={{
                      transformOrigin: `${cx}px 0`,
                      transform: su ? 'scaleX(1.18)' : 'scaleX(1)',
                      opacity: spenta ? 0.45 : 1,
                      transition:'transform 160ms ease, opacity 160ms ease',
                    }}/>
                  <text x={cx} y={top - 7} fontSize={su ? 14 : 12.5} fontWeight={su ? 800 : 600}
                    fill={PN.TEXT} textAnchor="middle" stroke={PN.WHITE} strokeWidth={3} paintOrder="stroke"
                    style={{opacity: spenta ? 0.45 : 1, transition:'opacity 160ms ease'}}>{g.val}</text>
                  <text x={cx} y={cgH - 8} fontSize="12" fontWeight={su ? 800 : 600}
                    fill={su ? PN.TEXT : PN.MUTED} textAnchor="middle">{g.d}</text>
                </g>
              );
            })}
          </svg>
        </StatCard>

        {/* Distribuzione tavoli — gap bianco 2px tra gli spicchi */}
        <StatCard title="Distribuzione tavoli" sub="Per numero di coperti"
          style={{display:'flex', flexDirection:'column'}}>
          <div style={{flex: 1, display:'flex', alignItems:'center', gap: 24, minWidth: 0}}>
            <StatDonut
              voci={d.distribuzione.map(v => ({ id: v.label, label: v.label, colore: v.color, valore: v.pct, centro: `${v.pct}%` }))}
              attivo={tavoliSu} onAttivo={setTavoliSu}
              centro={{ et:'Totale', val: d.stato.totale }}
              larghezza="44%" maxLarghezza={236}/>
            <div style={{flex: 1, minWidth: 0, display:'flex', flexDirection:'column', gap: 16}}>
              {d.distribuzione.map(v => (
                <div key={v.label}
                  onMouseEnter={() => setTavoliSu(v.label)} onMouseLeave={() => setTavoliSu(null)}
                  style={{
                    display:'flex', alignItems:'center', gap: 10, fontSize: 15.5,
                    opacity: tavoliSu == null || tavoliSu === v.label ? 1 : 0.45,
                    transition:'opacity 160ms ease',
                  }}>
                  <span style={{width: 12, height: 12, background: v.color, borderRadius:'50%', flexShrink: 0}}/>
                  <span style={{flex: 1, color: PN.TEXT, minWidth: 0, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{v.label}</span>
                  <strong style={{color: PN.TEXT, flexShrink: 0, fontVariantNumeric:'tabular-nums'}}>{v.pct}%</strong>
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
