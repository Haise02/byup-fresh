// Statistiche — sub-tab Ordini

// ─── Ordini per canale ────────────────────────────────────────────────────
// Erano due card affiancate con due numeri ciascuna. Ma i due canali sono le
// due metà dello stesso totale — 708 e 612 fanno esattamente i 1.320 ordini
// del periodo — e in due riquadri separati quel rapporto non si vede: si
// leggono due cifre e si va oltre. Qui la barra in testa lo mostra prima di
// qualunque numero, e i tempi medi condividono una scala, così il fatto
// interessante (in sala ci vuole quasi il quadruplo) si vede invece di
// doverlo calcolare. La quota la portano le pillole, il totale il sottotitolo.
const CANALI_ORDINI = [
  { id:'sala',    label:'In sala',   sub:'Coperti seduti',              icona:'place-table',       colore: PN.WINE },
  { id:'asporto', label:'Asporto e delivery', sub:'Ritiro o consegna',  icona:'commerce-delivery', colore: PN.PINK },
];

function OrdiniPerCanale({ d }) {
  const [su, setSu] = React.useState(null);
  const canali = CANALI_ORDINI.map(c => ({ ...c, ...d[c.id], minuti: parseInt(d[c.id].tempoMedio, 10) || 0 }));
  const totale = canali.reduce((s, c) => s + c.completati, 0);
  const maxMin = Math.max(...canali.map(c => c.minuti)) || 1;

  return (
    <StatCard title="Ordini per canale"
      sub={`Come si dividono i ${totale.toLocaleString('it-IT', {useGrouping: true})} ordini del periodo`}>
      {/* Niente barra della divisione sopra i due riquadri: la quota la
          dicono già le due pillole, e il sottotitolo dice il totale. */}
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap: 14}}>
        {canali.map(c => {
          const quota = (c.completati / totale) * 100;
          const spento = su != null && su !== c.id;
          return (
            <div key={c.id} {...boxHover}
              onMouseEnter={(e) => { setSu(c.id); boxHover.onMouseEnter(e); }}
              onMouseLeave={(e) => { setSu(null); boxHover.onMouseLeave(e); }}
              style={{
                padding: 16, borderRadius: 14, minWidth: 0,
                background: PN.BG, border:`1px solid ${PN.BORDER}`,
                opacity: spento ? 0.5 : 1,
                transition: `${BOX_TRANSITION}, opacity 160ms ease`,
              }}>
              <div style={{display:'flex', alignItems:'center', gap: 11, minWidth: 0}}>
                <span style={{
                  width: 38, height: 38, borderRadius: 11, flexShrink: 0,
                  background: `${c.colore}18`, color: c.colore,
                  display:'grid', placeItems:'center',
                }}><Icon name={c.icona} size={18}/></span>
                <div style={{flex: 1, minWidth: 0}}>
                  <div style={{fontSize: 15.5, fontWeight: 700, color: PN.TEXT, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{c.label}</div>
                  <div style={{fontSize: 13, color: PN.MUTED_SOFT}}>{c.sub}</div>
                </div>
                <span style={{
                  flexShrink: 0, padding:'3px 10px', borderRadius: 999,
                  background: `${c.colore}18`, color: c.colore,
                  fontSize: 13.5, fontWeight: 800, fontVariantNumeric:'tabular-nums',
                }}>{Math.round(quota)}%</span>
              </div>

              <div style={{display:'flex', alignItems:'baseline', gap: 7, marginTop: 12}}>
                <span style={{
                  fontSize: 28, fontWeight: 700, color: PN.TEXT,
                  letterSpacing: -0.6, lineHeight: 1, fontVariantNumeric:'tabular-nums',
                }}>{c.completati.toLocaleString('it-IT', {useGrouping: true})}</span>
                <span style={{fontSize: 14, color: PN.MUTED}}>ordini completati</span>
              </div>

              {/* I due tempi sulla stessa scala: 52 contro 14 minuti è il
                  fatto che vale la pena vedere, e due numeri in due riquadri
                  lo lasciavano da calcolare. */}
              <div style={{marginTop: 14}}>
                <div style={{display:'flex', alignItems:'baseline', justifyContent:'space-between', gap: 8, marginBottom: 6}}>
                  <span style={{fontSize: 13.5, color: PN.MUTED}}>Tempo medio</span>
                  <strong style={{fontSize: 14.5, color: PN.TEXT, fontVariantNumeric:'tabular-nums'}}>{c.tempoMedio}</strong>
                </div>
                <div style={{height: 8, borderRadius: 999, background: PN.WHITE_FROST, overflow:'hidden'}}>
                  <div style={{
                    height:'100%', width: `${(c.minuti / maxMin) * 100}%`,
                    background: c.colore, borderRadius: 999,
                    transition:'width 400ms ease-out',
                  }}/>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </StatCard>
  );
}


function StatOrdini() {
  const d = STAT_ORDINI;

  // Heatmap max
  const allHeat = d.heatmap.flatMap(r => r.val);
  const maxHeat = Math.max(...allHeat);
  // Rampa sequenziale a tinta unica: dal rosa chiarissimo al wine, chiaro→scuro
  const HEAT_RAMP = ['#FFF3F1', '#FFD9D7', '#FFACAF', '#FF5A5F', '#B53338'];
  const heatBg = (v) => {
    const t = v / maxHeat;
    if (t < 0.18) return HEAT_RAMP[0];
    if (t < 0.35) return HEAT_RAMP[1];
    if (t < 0.55) return HEAT_RAMP[2];
    if (t < 0.75) return HEAT_RAMP[3];
    return HEAT_RAMP[4];
  };
  const heatColor = (v) => v / maxHeat >= 0.55 ? '#fff' : PN.TEXT;
  const days = ['Lun','Mar','Mer','Gio','Ven','Sab','Dom'];
  const [channel, setChannel] = React.useState('Sala');
  // Cella sotto il mouse: serve solo ad accendere la riga e la colonna, che
  // in una griglia 9×7 è quello che aiuta a non perdere il segno. Il numero
  // sta dentro la cella, quindi non c'è niente da mostrare altrove.
  const [cella, setCella] = React.useState(null);
  const picco = d.heatmap.reduce((best, row, ri) => {
    row.val.forEach((v, ci) => { if (v > best.v) best = { v, ri, ci }; });
    return best;
  }, { v: -1, ri: 0, ci: 0 });

  return (
    <div style={{display:'flex', flexDirection:'column', gap: 16}}>
      {/* Lo scontrino medio è passato in Economici → Vendite piatti, fra gli
          altri KPI di valore. Qui resta il suo andamento per canale, che è
          un'altra domanda: non "quanto vale un ordine" ma "da dove arriva". */}
      {/* Stessa card degli altri KPI della sezione: pastiglia a sinistra,
          etichetta e pillola sulla stessa riga, andamento a destra. Qui le
          card sono due, quindi c'è la larghezza per la variante piena — la
          stessa di Economici, senza le strette di Prenotazioni. */}
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap: 12}}>
        <StatKpiTinto tono="rosa" icona="commerce-cart" label="Ordini completati"
          valore={d.kpi.completati.val.toLocaleString('it-IT', {useGrouping: true})}
          delta={d.kpi.completati.delta} sub={d.kpi.completati.sub} trend={d.kpi.completati.trend}/>
        <StatKpiTinto tono="giallo" icona="commerce-receipt" label="Articoli per ordine"
          valore={d.kpi.articoli.val.toString().replace('.', ',')}
          delta={d.kpi.articoli.delta} sub={d.kpi.articoli.sub} trend={d.kpi.articoli.trend}/>
      </div>

      <OrdiniPerCanale d={d}/>

      {/* Heatmap */}
      <StatCard title="Heatmap oraria ordini" sub={`Ordini medi per fascia oraria · canale ${channel}`} action={
        <div style={{display:'inline-flex', gap: 6, padding: 4, background:'#f5f5f7', borderRadius: 999}}>
          {['Sala','Asporto','Delivery','App clienti'].map(ch => (
            <button key={ch} onClick={() => setChannel(ch)} style={{
              padding:'5px 12px', fontSize: 14.5, fontWeight: 600,
              background: channel === ch ? PN.WHITE : 'transparent',
              border:'none', borderRadius: 999,
              color: channel === ch ? PN.PINK_DARK : PN.MUTED,
              cursor:'pointer', fontFamily:'inherit',
              boxShadow: channel === ch ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
            }}>{ch}</button>
          ))}
        </div>
      }>
        {/* La lettura del momento: sotto il mouse la cella puntata, altrimenti
            il picco della settimana, che è la domanda con cui si guarda una
            heatmap oraria — "quando sono pieno". */}
        <div style={{
          display:'flex', alignItems:'baseline', justifyContent:'flex-end',
          gap: 8, marginTop: -6, marginBottom: 12, minHeight: 22,
        }}>
          <span style={{fontSize: 13.5, color: PN.MUTED_SOFT}}>picco della settimana</span>
          <span style={{fontSize: 14.5, color: PN.MUTED}}>{days[picco.ci]} · {d.heatmap[picco.ri].ora}</span>
          <strong style={{fontSize: 16, color: PN.TEXT, fontVariantNumeric:'tabular-nums'}}>{picco.v}</strong>
          <span style={{fontSize: 14, color: PN.MUTED_SOFT}}>ordini</span>
        </div>

        <div
          onMouseLeave={() => setCella(null)}
          style={{display:'grid', gridTemplateColumns:'48px repeat(7, 1fr)', gap: 4}}>
          <div></div>
          {days.map((day, ci) => (
            <div key={day} style={{
              padding:'4px 0 8px', fontSize: 12.5, fontWeight: 700,
              color: cella && cella.ci === ci ? PN.TEXT : PN.MUTED,
              textAlign:'center', textTransform:'uppercase', letterSpacing: 0.4,
              transition:'color 140ms ease',
            }}>{day}</div>
          ))}
          {d.heatmap.map((row, ri) => (
            <React.Fragment key={ri}>
              <div style={{
                padding:'0 10px 0 0', fontSize: 12.5, fontWeight: 600,
                color: cella && cella.ri === ri ? PN.TEXT : PN.MUTED,
                fontVariantNumeric:'tabular-nums', textAlign:'right', alignSelf:'center',
                transition:'color 140ms ease',
              }}>{row.ora}</div>
              {row.val.map((v, ci) => {
                const su = cella && cella.ri === ri && cella.ci === ci;
                const eIlPicco = ri === picco.ri && ci === picco.ci;
                return (
                  <div key={ci}
                    onMouseEnter={() => setCella({ ri, ci })}
                    style={{
                      // 40 e non 34: su una card a tutta pagina le celle sono
                      // larghe 170, e a 34 sembravano strisce invece che caselle.
                      height: 40, borderRadius: 8, background: heatBg(v),
                      color: heatColor(v),
                      display:'grid', placeItems:'center',
                      fontSize: 13.5, fontWeight: 600, fontVariantNumeric:'tabular-nums',
                      position:'relative', cursor:'default',
                      // L'anello sta sul picco sempre e sulla cella puntata
                      // mentre ci sei sopra: due modi di dire "guarda qui" che
                      // non si pestano i piedi, perché il secondo è passeggero.
                      boxShadow: su
                        ? `0 0 0 2px ${PN.WHITE}, 0 0 0 3.5px ${PN.WINE}`
                        : eIlPicco ? `0 0 0 2px ${PN.WHITE}, 0 0 0 3px ${PN.WINE}` : 'none',
                      transform: su ? 'scale(1.08)' : 'scale(1)',
                      zIndex: su || eIlPicco ? 2 : 1,
                      transition:'transform 140ms ease, box-shadow 140ms ease',
                    }}>{v}</div>
                );
              })}
            </React.Fragment>
          ))}
        </div>

        <div style={{display:'flex', alignItems:'center', gap: 7, marginTop: 16, fontSize: 13.5, color: PN.MUTED}}>
          <span style={{fontVariantNumeric:'tabular-nums'}}>0</span>
          {HEAT_RAMP.map(c => (
            <span key={c} style={{width: 26, height: 10, background: c, borderRadius: 3}}/>
          ))}
          <span style={{fontVariantNumeric:'tabular-nums'}}>{maxHeat}</span>
          <span style={{marginLeft: 6, color: PN.MUTED_SOFT}}>ordini in un'ora</span>
        </div>
      </StatCard>
    </div>
  );
}

function Pill({ iconKey, label, value }) {
  const Ico = BuIcons[iconKey];
  return (
    <div style={{
      flex:1, display:'flex', alignItems:'center', gap: 10,
      padding:'10px 12px', background:'#fafafa',
      border:`1px solid ${PN.BORDER_SOFT}`, borderRadius: 10,
    }}>
      {Ico ? <Ico size={14} color={PN.MUTED}/> : null}
      <div style={{flex:1, minWidth: 0}}>
        <div style={{fontSize: 14, color: PN.MUTED}}>{label}</div>
        <div style={{fontSize: 16, fontWeight: 700, color: PN.TEXT, fontVariantNumeric:'tabular-nums'}}>{value}</div>
      </div>
    </div>
  );
}

window.StatOrdini = StatOrdini;
