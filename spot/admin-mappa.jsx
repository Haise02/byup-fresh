// ════════════════════════════════════════════════════════════════════════════
// MAPPA DELLA RETE · una carta, due strati
// ════════════════════════════════════════════════════════════════════════════
//
// Le tabelle dicono quanti locali ci sono a Milano. Non dicono che la Puglia è
// un buco, che la dorsale adriatica è vuota, che due città vicine si coprono a
// vicenda. Quella è una domanda di forma, e la forma si guarda.
//
// Lo switch cambia strato, non filtro:
//   Locali   → dov'è la rete (un punto per locale, grande quanto il suo volume)
//   Accessi  → dove la usano (aree calde per intensità di sessioni)
//
// Le due mappe non coincidono, ed è il motivo per cui stanno insieme: dove c'è
// calore senza punti c'è domanda scoperta; dove ci sono punti senza calore c'è
// rete che non viene usata.

const MAP_STATI = {
  active:     { label: 'Attivo',     colore: ADM.OK },
  onboarding: { label: 'In apertura', colore: ADM.WARN },
  inactive:   { label: 'Fermo',      colore: ADM.MUTED_LIGHT },
  churned:    { label: 'Uscito',     colore: ADM.DANGER },
};

// Scala del calore: dal corallo tenue al corallo pieno. Un solo colore che si
// satura — due tinte diverse direbbero "due cose diverse", e qui la cosa è una
// sola misurata di più o di meno.
const mapCalore = (t) => {
  const a = 0.12 + Math.pow(t, 0.65) * 0.62;
  return `rgba(255, 90, 95, ${a.toFixed(3)})`;
};

function AnMappa() {
  const [strato, setStrato] = React.useState('locali');
  const [hover, setHover] = React.useState(null);   // {x, y, titolo, righe[]}

  const locali = window.GEO_LOCALI || [];
  const accessi = window.GEO_ACCESSI || [];
  const W = window.GEO_W || 85;
  const H = window.GEO_H || 100;
  const paths = window.GEO_PATHS || [];

  const perCitta = React.useMemo(() => {
    const m = {};
    locali.forEach(l => {
      if (!m[l.citta]) m[l.citta] = { citta: l.citta, n: 0, attivi: 0, ordini: 0 };
      m[l.citta].n += 1;
      m[l.citta].ordini += l.ordiniMese;
      if (l.stato === 'active') m[l.citta].attivi += 1;
    });
    return Object.values(m).sort((a, b) => b.n - a.n);
  }, [locali]);

  const totAccessi = accessi.reduce((s, a) => s + a.accessi, 0);
  // Città con accessi e nessun locale: la riga che giustifica la mappa.
  const scoperte = accessi.filter(a => a.localiQui === 0);

  const classifica = strato === 'locali'
    ? perCitta.slice(0, 6).map(c => ({
        k: c.citta, primo: c.citta,
        secondo: `${c.n} ${c.n === 1 ? 'locale' : 'locali'} · ${c.attivi} attivi`,
        valore: admNumIt(c.ordini) + ' ord/mese',
      }))
    : accessi.slice(0, 6).map(a => ({
        k: a.citta, primo: a.citta,
        secondo: `${a.localiQui} ${a.localiQui === 1 ? 'locale' : 'locali'} · ${a.utenti} ${a.utenti === 1 ? 'utente registrato' : 'utenti registrati'}`,
        valore: admNumIt(a.accessi) + ' accessi',
      }));

  return (
    <AnCard
      titolo="Mappa della rete"
      sotto={strato === 'locali'
        ? 'Un punto per locale, dove si trova. Il diametro è il volume di ordini del mese.'
        : 'Dove gli utenti aprono l’app: più l’area è satura, più sessioni ci sono state.'}
      destra={
        <div style={{display:'flex', gap:6, background:ADM.NEUTRAL_SOFT, padding:3, borderRadius:9}}>
          {[['locali', 'Locali'], ['accessi', 'Accessi utenti']].map(([id, label]) => {
            const on = strato === id;
            return (
              <button key={id} onClick={() => { setStrato(id); setHover(null); }} style={{
                padding:'6px 13px', borderRadius:7, border:'none',
                background: on ? ADM.WHITE : 'transparent',
                color: on ? ADM.TEXT : ADM.MUTED,
                fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit',
                boxShadow: on ? '0 1px 2px rgba(15,17,21,0.10)' : 'none',
                transition:'background 150ms ease-out, color 150ms ease-out',
              }}>{label}</button>
            );
          })}
        </div>
      }
    >
      <div style={{display:'grid', gridTemplateColumns:'minmax(0,1fr) 260px', gap:20, alignItems:'start'}}>

        {/* ─── La carta ─────────────────────────────────────────────── */}
        <div style={{position:'relative'}}>
          <svg viewBox={`-4 -3 ${W + 8} ${H + 6}`} style={{width:'100%', maxHeight:430, display:'block'}}>
            <defs>
              <radialGradient id="mapHeat">
                <stop offset="0%" stopColor="#FF5A5F" stopOpacity="0.85"/>
                <stop offset="45%" stopColor="#FF5A5F" stopOpacity="0.35"/>
                <stop offset="100%" stopColor="#FF5A5F" stopOpacity="0"/>
              </radialGradient>
            </defs>

            {/* Il paese: fondo quieto, mai protagonista */}
            {paths.map((d, i) => (
              <path key={i} d={d}
                fill={ADM.NEUTRAL_SOFT}
                stroke={ADM.BORDER}
                strokeWidth="0.35"
                strokeLinejoin="round"/>
            ))}

            {strato === 'accessi' && accessi.map(a => (
              <g key={a.citta}
                onMouseEnter={() => setHover({
                  x: a.x, y: a.y, titolo: a.citta,
                  righe: [
                    `${admNumIt(a.accessi)} accessi · ${admPctIt(a.accessi / (totAccessi || 1) * 100)} del totale`,
                    `${a.utenti} utenti registrati qui, ${a.attivi} attivi`,
                    a.localiQui === 0 ? 'Nessun locale in città' : `${a.localiQui} ${a.localiQui === 1 ? 'locale' : 'locali'} in città`,
                  ],
                })}
                onMouseLeave={() => setHover(null)}>
                {/* L'alone dice l'intensità, il cerchietto dice dov'è il centro */}
                <circle cx={a.x} cy={a.y} r={3.5 + a.intensita * 9} fill="url(#mapHeat)"
                  opacity={0.35 + a.intensita * 0.65} style={{cursor:'pointer'}}/>
                <circle cx={a.x} cy={a.y} r={0.9 + a.intensita * 1.0}
                  fill={mapCalore(a.intensita)} stroke={ADM.WHITE} strokeWidth="0.3"/>
              </g>
            ))}

            {strato === 'locali' && locali.map(l => {
              const s = MAP_STATI[l.stato] || MAP_STATI.inactive;
              const r = 0.55 + Math.min(1, (l.ordiniMese || 0) / 900) * 1.05;
              return (
                <circle key={l.id} cx={l.x} cy={l.y} r={r}
                  fill={s.colore} fillOpacity="0.85"
                  stroke={ADM.WHITE} strokeWidth="0.28"
                  style={{cursor:'pointer'}}
                  onMouseEnter={() => setHover({
                    x: l.x, y: l.y, titolo: l.nome,
                    righe: [
                      `${l.tipo} · ${l.citta}`,
                      `${s.label} · piano ${l.piano}`,
                      `${admNumIt(l.ordiniMese)} ordini nel mese`,
                    ],
                  })}
                  onMouseLeave={() => setHover(null)}/>
              );
            })}
          </svg>

          {/* Etichetta al passaggio: ancorata al punto, in coordinate carta */}
          {hover && (
            <div style={{
              position:'absolute', left:`${(hover.x + 4) / (W + 8) * 100}%`, top:`${(hover.y + 3) / (H + 6) * 100}%`,
              transform:'translate(-50%, calc(-100% - 10px))',
              background:ADM.TEXT, color:ADM.WHITE,
              padding:'8px 11px', borderRadius:9, pointerEvents:'none',
              boxShadow:'0 8px 22px rgba(15,17,21,0.28)', whiteSpace:'nowrap', zIndex:2,
            }}>
              <div style={{fontSize:13, fontWeight:700}}>{hover.titolo}</div>
              {hover.righe.map((r, i) => (
                <div key={i} style={{fontSize:12, opacity:0.75, marginTop:2}}>{r}</div>
              ))}
            </div>
          )}

          {/* Legenda: cosa vuol dire quello che si vede */}
          <div style={{display:'flex', alignItems:'center', gap:16, flexWrap:'wrap', marginTop:10}}>
            {strato === 'locali' ? (
              Object.keys(MAP_STATI).map(k => (
                <span key={k} style={{display:'inline-flex', alignItems:'center', gap:7, fontSize:12.4, color:ADM.MUTED}}>
                  <span style={{width:9, height:9, borderRadius:'50%', background:MAP_STATI[k].colore}}/>
                  {MAP_STATI[k].label}
                </span>
              ))
            ) : (
              <span style={{display:'inline-flex', alignItems:'center', gap:9, fontSize:12.4, color:ADM.MUTED}}>
                Pochi accessi
                <span style={{
                  width:96, height:9, borderRadius:999,
                  background:`linear-gradient(90deg, ${mapCalore(0.05)}, ${mapCalore(0.45)}, ${mapCalore(1)})`,
                }}/>
                Molti
              </span>
            )}
          </div>
        </div>

        {/* ─── La colonna dei numeri ────────────────────────────────── */}
        <div>
          <div style={{fontSize:11.6, fontWeight:700, color:ADM.MUTED, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:10}}>
            {strato === 'locali' ? 'Città per numero di locali' : 'Città per accessi'}
          </div>
          <div style={{display:'flex', flexDirection:'column'}}>
            {classifica.map((r, i) => (
              <div key={r.k} style={{
                display:'flex', alignItems:'center', gap:10, padding:'9px 0',
                borderTop: i === 0 ? 'none' : `1px solid ${ADM.BORDER_SOFT}`,
              }}>
                <span style={{flex:1, minWidth:0}}>
                  <span style={{display:'block', fontSize:13.4, fontWeight:700, color:ADM.TEXT}}>{r.primo}</span>
                  <span style={{display:'block', fontSize:12.2, color:ADM.MUTED, marginTop:1}}>{r.secondo}</span>
                </span>
                <span style={{fontSize:12.8, fontWeight:700, color:ADM.TEXT, whiteSpace:'nowrap'}}>{r.valore}</span>
              </div>
            ))}
          </div>

          {/* La lettura: quello che la mappa dice e la tabella no */}
          <div style={{
            marginTop:14, padding:'11px 13px', borderRadius:10,
            background: scoperte.length ? ADM.WARN_SOFT : ADM.NEUTRAL_SOFT,
            fontSize:12.6, color:ADM.TEXT, lineHeight:1.5,
          }}>
            {strato === 'locali'
              ? <>La rete è concentrata al nord e su Roma. {perCitta.length} città coperte su {(window.GEO_ACCESSI || []).length + perCitta.length} in cui ci sono utenti o locali: il resto della penisola è bianco.</>
              : scoperte.length
                ? <><b>{scoperte.map(s => s.citta).join(', ')}</b>: utenti che aprono l’app dove non c’è ancora un locale. È domanda già in casa, e non ha dove atterrare.</>
                : <>Il calore cade dove la rete c’è già: gran parte degli accessi arriva dal QR al tavolo, quindi una piazza si scalda quando i suoi locali lavorano — non quando ci abitano utenti registrati.</>}
          </div>
        </div>
      </div>
    </AnCard>
  );
}

// Numeri all'italiana: la pagina Analisi li scrive così ovunque.
function admNumIt(v, dec = 0) {
  return Number(v || 0).toLocaleString('it-IT', { minimumFractionDigits: dec, maximumFractionDigits: dec });
}
function admPctIt(v, dec = 0) {
  return admNumIt(v, dec) + '%';
}

window.AnMappa = AnMappa;
