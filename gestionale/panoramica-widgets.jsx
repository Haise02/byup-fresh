// Widget content components — each is a self-contained body that fits inside PnWidgetShell.
// Sizes: w∈{1,2,3,4} cols (of 4-col grid), h∈{1,2,3} rows (of ~140px each)

// ─── shared bits ────────────────────────────────────────────────────────────

function WMetric({ label, value, sub, trend, trendColor, big }) {
  // minWidth:0 + ellipsis su label/sub: dopo il font bump le etichette lunghe
  // ("Coperti questa settimana"…) sbordavano oltre il bordo card a w=1.
  // Il valore numerico non va MAI spezzato → whiteSpace nowrap.
  return (
    <div style={{minWidth: 0}}>
      {label && (
        <div style={{fontSize: 12.5, color: PN.MUTED, fontWeight: 700, letterSpacing: 0.5, textTransform:'uppercase', marginBottom: 6, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{label}</div>
      )}
      <div style={{display:'flex', alignItems:'baseline', gap: 12, marginBottom: 4, flexWrap:'wrap', minWidth: 0}}>
        <div style={{fontSize: big ? 58 : 40, fontWeight: 700, color: PN.TEXT, letterSpacing:-1.4, lineHeight: 1, whiteSpace:'nowrap'}}>{value}</div>
        {trend && (
          <div style={{
            display:'inline-flex', alignItems:'center', gap: 3,
            fontSize: 16, fontWeight: 700,
            color: trendColor || PN.GREEN,
            whiteSpace:'nowrap', flexShrink: 0,
          }}>
            {trend.startsWith('+') ? <Icon name="arrow-up-right" size={14}/> : trend.startsWith('-') ? <Icon name="arrow-down-right" size={14}/> : null}
            {trend}
          </div>
        )}
      </div>
      {sub && <div style={{fontSize:14.5, color: PN.MUTED, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{sub}</div>}
    </div>
  );
}

// Sparkline solido: viewBox 200×60, padding interno 4px così il path
// non tocca mai i bordi. preserveAspectRatio "none" per stretch su width 100%
// MA con overflow:hidden sul wrapper — niente più overflow fuori dalla card.
// pathLength="1" normalizza la lunghezza del path → dasharray 1 / dashoffset 1
// funziona sempre indipendentemente dalla forma della curva.
function WSparkline({ data, color = PN.PINK, animated }) {
  const VB_W = 200, VB_H = 60, PAD = 4;
  const usableW = VB_W - PAD * 2;
  const usableH = VB_H - PAD * 2;

  // La linea è SEMPRE completa: niente ridisegno da zero a ogni cambio dati
  // (per il 60% del tempo si vedeva una linea mozzata a metà). I dati vengono
  // ricampionati a N punti fissi e il cambio periodo è un MORPH animato in
  // JS (rAF): i valori correnti si interpolano verso i nuovi — visibile e
  // fluido su qualunque browser, senza dipendere dalla transition CSS su `d`.
  const N = 24;
  const target = React.useMemo(() => {
    if (data.length === N) return data;
    return Array.from({ length: N }, (_, i) => {
      const t = (i / (N - 1)) * (data.length - 1);
      const lo = Math.floor(t), hi = Math.min(data.length - 1, Math.ceil(t));
      return data[lo] + (data[hi] - data[lo]) * (t - lo);
    });
  }, [data]);
  const [vals, setVals] = React.useState(target);
  const valsRef = React.useRef(target);
  const rafRef = React.useRef(null);
  React.useEffect(() => {
    const from = valsRef.current;
    const to = target;
    const t0 = performance.now();
    const DUR = 900;
    const ease = (x) => x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; // easeInOutCubic
    cancelAnimationFrame(rafRef.current);
    const step = (now) => {
      const k = Math.min(1, (now - t0) / DUR);
      const e = ease(k);
      const cur = to.map((v, i) => from[i] + (v - from[i]) * e);
      valsRef.current = cur;
      setVals(cur);
      if (k < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target]);

  const max = Math.max(...vals), min = Math.min(...vals);
  const range = max - min || 1;

  const pts = vals.map((v, i) => {
    const x = PAD + (i / (N - 1)) * usableW;
    const y = PAD + usableH - ((v - min) / range) * usableH;
    return [x, y];
  });

  // Smooth curve: cubic Bezier con control points orizzontali a metà segmento.
  let path = `M ${pts[0][0].toFixed(2)} ${pts[0][1].toFixed(2)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const [x1, y1] = pts[i];
    const [x2, y2] = pts[i + 1];
    const cx = (x1 + x2) / 2;
    path += ` C ${cx.toFixed(2)} ${y1.toFixed(2)}, ${cx.toFixed(2)} ${y2.toFixed(2)}, ${x2.toFixed(2)} ${y2.toFixed(2)}`;
  }
  const fillPath = path + ` L ${(VB_W - PAD).toFixed(2)} ${(VB_H - PAD).toFixed(2)} L ${PAD} ${(VB_H - PAD).toFixed(2)} Z`;
  const gradId = `spark-grad-${color.replace('#', '')}`;
  const last = pts[pts.length - 1];

  return (
    <div style={{width: '100%', height: '100%', display: 'block', position: 'relative'}}>
      <svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        preserveAspectRatio="none"
        style={{width: '100%', height: '100%', display: 'block', overflow: 'hidden'}}
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={color} stopOpacity="0.28"/>
            <stop offset="100%" stopColor={color} stopOpacity="0"/>
          </linearGradient>
          <clipPath id={`spark-clip-${gradId}`}>
            <rect x="0" y="0" width={VB_W} height={VB_H}/>
          </clipPath>
        </defs>
        <g clipPath={`url(#spark-clip-${gradId})`}>
          <path d={fillPath} fill={`url(#${gradId})`}/>
          <path
            d={path} fill="none"
            stroke={color} strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        </g>
      </svg>
      {/* Punto finale in HTML: resta un cerchio perfetto qualunque sia lo
          stretch dell'svg (il circle SVG diventava un'ellisse schiacciata).
          Alone morbido che si espande e svanisce. */}
      {animated && (
        <span style={{
          position: 'absolute',
          left: `${(last[0] / VB_W) * 100}%`,
          top: `${(last[1] / VB_H) * 100}%`,
          width: 7, height: 7, borderRadius: '50%',
          background: color,
          boxShadow: '0 0 0 2px rgba(255, 255, 255, 0.9), 0 1px 4px rgba(15, 17, 21, 0.20)',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
        }}>
          <span style={{
            position: 'absolute', inset: -3, borderRadius: '50%',
            background: color,
            animation: 'spark-halo 1.8s ease-out infinite',
            pointerEvents: 'none',
          }}/>
        </span>
      )}
      <style>{`
        @keyframes spark-halo {
          0%   { transform: scale(0.5); opacity: 0.45; }
          70%  { transform: scale(1.9); opacity: 0; }
          100% { transform: scale(1.9); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

// ─── 1. Incassi (toggle Oggi / Settimana / Mese) ───────────────────────────

function WidgetIncassi({ size }) {
  const [period, setPeriod] = React.useState('oggi');

  // Spark più movimentate: invece di curve smooth crescenti,
  // andamento "vivo" con peaks e valleys realistiche di un servizio.
  const data = {
    oggi: {
      total: '€ 1.247',
      trend: '+18%',
      sub: 'vs media giornaliera',
      // 16 punti — picco pranzo (12-14h), calo pomeriggio, esplosione cena (19-22h)
      spark: [12, 28, 45, 78, 92, 64, 38, 22, 18, 35, 88, 142, 178, 165, 198, 152],
      labels: ['12:00', '17:00', '21:00'],
    },
    settimana: {
      total: '€ 8.420',
      trend: '+12%',
      sub: 'vs settimana scorsa',
      spark: [620, 740, 580, 1100, 880, 1340, 1820, 1247, 968, 1450, 1180, 1620],
      labels: ['Lun', 'Mer', 'Ven', 'Dom'],
    },
    mese: {
      total: '€ 24.380',
      trend: '+11%',
      sub: 'vs mese scorso',
      spark: [380, 480, 320, 690, 540, 840, 720, 1100, 980, 1340, 1180, 1620, 1480, 1820, 2100, 1820, 2280, 1980],
      labels: ['1', '10', '20', '30'],
    },
  };
  const d = data[period];

  // Layout adattivo (stesso pattern sideBySide di WidgetRiempimento):
  // a h=1 il contenuto stacked (toggle + metrica 58px + sparkline) supera
  // di molto i ~108px utili della cella → metrica a sinistra, toggle +
  // sparkline a destra. A h≥2 resta lo stacked classico.
  const compact = ((size && size.h) || 1) === 1;

  if (compact) {
    return (
      <div data-no-fx onClick={() => { window.location.href = 'byup Statistiche.html?tab=economici'; }}
        title="Apri le statistiche economiche"
        style={{display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, gap: 8, cursor: 'pointer'}}>
        {/* Convenzione widget: nome a sinistra, filtro periodo a destra */}
        <WidgetHead name="Incassi" right={<PnPeriodToggle period={period} setPeriod={setPeriod}/>}/>
        <div style={{display: 'flex', flex: 1, minHeight: 0, gap: 18}}>
          <div style={{flex: '0 1 auto', minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
            <WMetric value={d.total} trend={d.trend} sub={d.sub} big/>
          </div>
          <div style={{flex: 1, minWidth: 0, minHeight: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', overflow: 'hidden'}}>
            <div style={{flex: '1 1 auto', minHeight: 0}}>
              <WSparkline data={d.spark} color={PN.PINK} animated/>
            </div>
            <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: PN.MUTED_SOFT, marginTop: 4, flexShrink: 0}}>
              {d.labels.map((l,i) => <span key={i}>{l}</span>)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div data-no-fx onClick={() => { window.location.href = 'byup Statistiche.html?tab=economici'; }}
      title="Apri le statistiche economiche"
      style={{display: 'flex', flexDirection: 'column', gap: 14, height: '100%', minHeight: 0, cursor: 'pointer'}}>
      <WidgetHead name="Incassi" right={<PnPeriodToggle period={period} setPeriod={setPeriod}/>}/>
      <WMetric value={d.total} trend={d.trend} sub={d.sub} big/>
      <div style={{flex: 1, minHeight: 36, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', overflow: 'hidden'}}>
        <div style={{flex: '1 1 auto', minHeight: 0}}>
          <WSparkline data={d.spark} color={PN.PINK} animated/>
        </div>
        <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: PN.MUTED_SOFT, marginTop: 4, flexShrink: 0}}>
          {d.labels.map((l,i) => <span key={i}>{l}</span>)}
        </div>
      </div>
    </div>
  );
}

// Header standard dei widget: nome in alto a sinistra, filtri a destra.
// Nei widget stretti il nome non si schiaccia: il filtro va a capo e resta
// allineato a destra sulla sua riga.
function WidgetHead({ name, right, dark }) {
  return (
    <div style={{display:'flex', alignItems:'center', gap: '6px 10px', flexWrap:'wrap', flexShrink: 0, minWidth: 0}}>
      <div style={{fontSize: 12.5, color: dark ? 'rgba(255,255,255,0.65)' : PN.MUTED, fontWeight: 700, textTransform:'uppercase', letterSpacing: 0.5, whiteSpace:'nowrap', flexShrink: 0}}>{name}</div>
      <div style={{marginLeft: 'auto', flexShrink: 0, minWidth: 0}}>{right}</div>
    </div>
  );
}

// Piccolo toggle riusabile per oggi/settimana/mese
function PnPeriodToggle({ period, setPeriod }) {
  return (
    <div style={{display:'flex', gap: 4, padding: 3, background:'#F4F5F7', borderRadius: 8, alignSelf:'flex-start', flexShrink: 0}}>
      {['oggi', 'settimana', 'mese'].map(p => (
        <button key={p} onClick={(e) => { e.stopPropagation(); setPeriod(p); }} style={{
          padding:'4px 10px',
          background: period === p ? PN.WHITE : 'transparent',
          color: period === p ? PN.TEXT : PN.MUTED,
          border:'none', borderRadius: 6,
          fontSize: 13.5, fontWeight: 600, fontFamily:'inherit',
          cursor: 'pointer',
          textTransform:'capitalize',
          whiteSpace:'nowrap',
          boxShadow: period === p ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
        }}>{p}</button>
      ))}
    </div>
  );
}

// ─── Riempimento (% grande + grafico per fascia) ───────────────────────────

function WidgetRiempimento({ size }) {
  const [period, setPeriod] = React.useState('mese');
  const data = {
    oggi: {
      pct: 84, delta: '+6%', sub: 'sera in corso',
      fasce: [{h:'12', v:62},{h:'13',v:78},{h:'14',v:55},{h:'19',v:88},{h:'20',v:96},{h:'21',v:91},{h:'22',v:64}],
    },
    settimana: {
      pct: 76, delta: '+3%', sub: 'media 7 giorni',
      fasce: [{h:'12',v:58},{h:'13',v:74},{h:'14',v:60},{h:'19',v:81},{h:'20',v:92},{h:'21',v:88},{h:'22',v:65}],
    },
    mese: {
      pct: 78, delta: '-2%', sub: 'media 30 giorni',
      fasce: [{h:'12',v:65},{h:'13',v:88},{h:'14',v:72},{h:'19',v:78},{h:'20',v:95},{h:'21',v:92},{h:'22',v:71}],
    },
  };
  const d = data[period];
  const isPos = !d.delta.startsWith('-');

  // Layout adattivo: a h=1 (qualunque larghezza) → % grande a sinistra +
  // grafico a destra, side-by-side: lo stacked non entra mai nei ~108px
  // utili. In tutti gli altri casi (tall, square, full) → stacked verticale.
  const wH = (size && size.h) || 1;
  const sideBySide = wH === 1;

  return (
    <div data-no-fx
      onClick={() => { window.location.href = 'byup Statistiche.html?tab=operazioni&sub=prenotazioni'; }}
      title="Apri le statistiche di occupazione"
      style={{display:'flex', flexDirection:'column', height:'100%', minHeight: 0, gap: 8, cursor: 'pointer'}}>
      {/* Convenzione widget: nome a sinistra, filtro periodo a destra */}
      <WidgetHead name="Percentuale tavoli occupati per fascia oraria"
        right={<PnPeriodToggle period={period} setPeriod={setPeriod}/>}/>
      <div style={{
        display:'flex',
        flexDirection: sideBySide ? 'row' : 'column',
        flex: 1, minHeight: 0,
        gap: sideBySide ? 18 : 14,
        alignItems: 'stretch',
      }}>
      {/* Block A: % grande + delta + sub, centrato nel suo terzo. */}
      <div style={{
        display:'flex', flexDirection:'column',
        gap: sideBySide ? 6 : 10,
        flexShrink: 0,
        flexBasis: sideBySide ? '38%' : 'auto',
        minWidth: 0, minHeight: 0, overflow:'hidden',
        justifyContent: 'center',
      }}>
        <div style={{minWidth: 0}}>
          <div style={{display:'flex', alignItems:'baseline', gap: sideBySide ? 8 : 14, minWidth: 0}}>
            <div style={{fontSize: sideBySide ? 42 : 58, fontWeight: 700, color: PN.TEXT, letterSpacing:-1.2, lineHeight: 1, whiteSpace:'nowrap'}}>{d.pct}%</div>
            <div style={{fontSize: 14, color: isPos ? PN.GREEN : PN.RED, fontWeight: 700, whiteSpace:'nowrap', flexShrink: 0}}>{d.delta}</div>
          </div>
          <div style={{fontSize: 13, color: PN.MUTED, marginTop: 3, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{d.sub}</div>
        </div>
      </div>

      {/* Grafico fasce — flex:1 prende tutta l'altezza/larghezza residua */}
      <div style={{
        flex: 1, minWidth: 0, minHeight: 0,
        display:'flex', flexDirection:'column',
        borderTop: sideBySide ? 'none' : `1px solid ${PN.BORDER_SOFT}`,
        borderLeft: sideBySide ? `1px solid ${PN.BORDER_SOFT}` : 'none',
        paddingTop: sideBySide ? 0 : 10,
        paddingLeft: sideBySide ? 18 : 0,
      }}>
        <div style={{flex:1, display:'flex', alignItems:'stretch', gap: 6}}>
          {(() => {
            const peakV = Math.max(...d.fasce.map(f => f.v));
            return d.fasce.map((f, i) => {
              const isPeak = f.v === peakV;
              const colorBar = isPeak ? PN.PINK : f.v >= 70 ? PN.WINE : f.v >= 50 ? PN.AMBER : PN.MUTED_LIGHT;
              return (
                <div key={i} style={{flex:1, minWidth: 0, display:'flex', flexDirection:'column', alignItems:'center', gap: 4}}>
                  <div style={{flex:1, minHeight: 0, width:'100%', display:'flex', flexDirection:'column', justifyContent:'flex-end', alignItems:'center', overflow:'hidden'}}>
                    <div style={{
                      fontSize: 11, fontWeight: isPeak ? 800 : 600,
                      color: isPeak ? PN.PINK_DARK : PN.MUTED,
                      marginBottom: 3, whiteSpace:'nowrap',
                    }}>{f.v}%</div>
                    <div style={{
                      width: '100%', maxWidth: 26,
                      height: `${(f.v/100)*100}%`, minHeight: 6, flexShrink: 1,
                      background: colorBar,
                      borderRadius: '4px 4px 2px 2px',
                    }}/>
                  </div>
                  {/* Fascia completa su due righe: "12:00-" sopra, "13:00"
                      sotto — compatta in orizzontale, niente inclinazioni. */}
                  <div style={{
                    fontSize: 10, lineHeight: 1.3, textAlign: 'center',
                    fontVariantNumeric: 'tabular-nums',
                    color: isPeak ? PN.TEXT : PN.MUTED,
                    fontWeight: isPeak ? 800 : 600,
                    whiteSpace: 'nowrap', flexShrink: 0,
                  }}>{f.h}:00-<br/>{Number(f.h) + 1}:00</div>
                </div>
              );
            });
          })()}
        </div>
      </div>
      </div>
    </div>
  );
}

// ─── 2. Prenotazioni di oggi (lista con timeline) ───────────────────────────

function WidgetPrenotazioniOggi() {
  // Lista più lunga per giustificare l'auto-scroll continuo (overflow vero).
  // tag: chip Compleanno/Aziendale, mostrato sotto il nome.
  // I tag prenotazione sono SOLO due: Compleanno e Aziendale.
  // Tutto il resto (allergie, preferenze tavolo…) vive come nota testuale.
  // Voci allineate a SALA_RES_DATA (sala-tab-calendario): l'id è il deep-link
  // che apre la prenotazione vera nel calendario della Sala.
  const items = [
    { id: 'r5',  time: '20:30', name: 'Andrea Bianchi',    covers: 2, table: 'Tavolo 3',  note: 'menu fisso' },
    { id: 'r8',  time: '20:30', name: 'Tommy Shelby',      covers: 8, table: 'Tavolo 1',  tag: 'compleanno' },
    { id: 'r22', time: '20:30', name: 'Mancini',           covers: 2, table: 'Tavolo 6',  note: 'laurea' },
    { id: 'r6',  time: '21:30', name: 'Famiglia Robinson', covers: 4, table: 'Tavolo 7',  note: 'allergia glutine' },
    { id: 'r12', time: '21:30', name: 'Marini',            covers: 4, table: 'Tavolo 12', tag: 'aziendale' },
    { id: 'r10', time: '21:30', name: 'De Luca',           covers: 3, table: 'Tavolo 9',  note: 'anniversario' },
    { id: 'r13', time: '21:30', name: 'Famiglia Verdi',    covers: 5, table: 'Tavolo 11', note: '2 bambini' },
    { id: 'r14', time: '22:30', name: 'Jesse Pinkman',     covers: 2, table: 'Tavolo 1' },
  ];

  // Entrambe le etichette in viola, per esteso accanto al nome.
  const tagStyle = {
    compleanno: { bg: '#EDE9FE', fg: '#7C3AED', label: 'Compleanno' },
    aziendale:  { bg: '#EDE9FE', fg: '#7C3AED', label: 'Aziendale' },
  };

  const [interacting, setInteracting] = React.useState(false);
  const scrollRef = React.useRef(null);

  // Auto-scroll via scrollTop con accumulatore float: el.scrollTop accetta
  // solo integer, quindi il delta sub-pixel (22px/s × 16ms ≈ 0.37px) verrebbe
  // arrotondato a 0 ogni frame e l'animazione non scorrerebbe. Accumulo in
  // posFloat e applico el.scrollTop = Math.round(posFloat).
  // Su mouseenter/hover: rAF pausato, overflow:auto consente scroll manuale.
  // Su mouseleave: riprende dal punto corrente (sync da el.scrollTop).
  React.useEffect(() => {
    if (interacting) return;
    const el = scrollRef.current;
    if (!el) return;
    let raf;
    let last = performance.now();
    let posFloat = el.scrollTop;
    const SPEED = 28; // px/s — abbastanza percepibile, ~16s per scrollare metà
    const tick = (now) => {
      const dt = Math.min((now - last) / 1000, 0.1); // clamp first-frame jump
      last = now;
      const halfH = el.scrollHeight / 2;
      if (halfH > 0) {
        posFloat += SPEED * dt;
        if (posFloat >= halfH) posFloat -= halfH;
        el.scrollTop = Math.round(posFloat);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [interacting]);

  return (
    <div style={{display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0}}>
      <div style={{marginBottom: 10, flexShrink: 0, minWidth: 0}}>
        <WidgetHead name="Prenotazioni oggi"
          right={<span style={{fontSize: 13, fontWeight: 700, color: PN.TEXT, whiteSpace: 'nowrap'}}>23 <span style={{color: PN.MUTED, fontWeight: 600}}>in totale</span></span>}/>
      </div>

      {/* Auto-scroll wrapper — overflow:auto sempre attivo. Lista duplicata
          2x per loop seamless. Pause-on-hover via interacting flag.
          Scrollbar overlay-style (vedi .prenot-list in panoramica-grid.jsx). */}
      <div
        ref={scrollRef}
        className="prenot-list"
        onMouseEnter={() => setInteracting(true)}
        onMouseLeave={() => setInteracting(false)}
        style={{
          flex: 1, minHeight: 0,
          overflowY: 'auto', overflowX: 'hidden',
          position: 'relative',
          margin: '0 -7px', padding: '3px 7px',
        }}
      >
        <div style={{
          display: 'flex', flexDirection: 'column', gap: 6,
        }}>
          {/* render duplicato per loop seamless. Ogni riga si illumina in
              hover e al click apre la prenotazione nel calendario Sala. */}
          {[...items, ...items].map((it, i) => (
            <PrenRow key={i} it={it} tag={it.tag ? tagStyle[it.tag] : null}/>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes prenot-scroll {
          from { transform: translateY(0); }
          to   { transform: translateY(-50%); }
        }
      `}</style>
    </div>
  );
}

// Riga prenotazione: si illumina in hover, si comprime al click e apre la
// prenotazione nel calendario della Sala (?pren=<id>).
function PrenRow({ it, tag }) {
  const [hover, setHover] = React.useState(false);
  const [pressed, setPressed] = React.useState(false);
  return (
    <div
      onClick={() => { window.location.href = `byup Sala.html?tab=calendar&pren=${it.id}`; }}
      title={`Apri la prenotazione di ${it.name}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setPressed(false); }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      style={{
        display: 'grid', gridTemplateColumns: '48px minmax(0, 1fr)', gap: 10,
        alignItems: 'start',
        padding: '9px 10px',
        borderRadius: 10,
        background: PN.WHITE,
        border: `1px solid ${hover ? '#7C3AED' : PN.BORDER_HAIR}`,
        boxShadow: hover
          ? '0 8px 20px rgba(15, 17, 21, 0.08)'
          : '0 1px 0 rgba(15, 17, 21, 0.02)',
        flexShrink: 0, cursor: 'pointer',
        transform: pressed ? 'scale(0.99)' : hover ? 'scale(1.012)' : 'scale(1)',
        position: 'relative', zIndex: hover ? 2 : 1,
        transition: 'transform 160ms cubic-bezier(0.34, 1.45, 0.64, 1), background 150ms ease, border-color 150ms ease, box-shadow 170ms ease',
      }}>
      {/* Orario in chip: colonna fissa, sempre allineata */}
      <div style={{
        fontSize: 13.5, fontWeight: 700, color: PN.TEXT, fontVariantNumeric: 'tabular-nums',
        background: PN.WHITE_OFF, border: `1px solid ${PN.BORDER_HAIR}`,
        borderRadius: 8, padding: '4px 0', textAlign: 'center', marginTop: 1,
      }}>{it.time}</div>
      <div style={{minWidth: 0}}>
        {/* Il tag è un'etichetta per esteso accanto al nome */}
        <div style={{display: 'flex', alignItems: 'center', gap: 7, minWidth: 0}}>
          <span style={{fontSize: 14.5, fontWeight: 600, color: PN.TEXT, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
            {it.name}
          </span>
          {tag && (
            <span style={{
              fontSize: 11, fontWeight: 700, letterSpacing: 0.2,
              padding: '2px 8px', borderRadius: 999, flexShrink: 0,
              background: tag.bg, color: tag.fg, whiteSpace: 'nowrap',
            }}>{tag.label}</span>
          )}
        </div>
        <div style={{
          fontSize: 12.5, color: PN.MUTED, fontWeight: 500, marginTop: 3,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          <span style={{fontWeight: 600, color: it.table ? PN.MUTED : PN.WINE}}>
            {it.table || 'Da assegnare'}
          </span>
          {' · '}{it.covers} coperti{it.note ? ` · ${it.note}` : ''}
        </div>
      </div>
    </div>
  );
}

// ─── 3. Tavoli stato ────────────────────────────────────────────────────────

// Palette identica alla Sala (STATE_STYLE di sala-card / sala-table-tile):
// tint di riposo, tinta intensa per l'hover, ring e inchiostro per stato.
const WTAV_STATES = {
  libero:    { tint:'rgba(22, 163, 74, 0.10)',  hot:'rgba(22, 163, 74, 0.20)',  ring:'rgba(22, 163, 74, 0.40)',  ink:'#15803D', label:'Libero' },
  occupato:  { tint:'rgba(255, 90, 95, 0.18)',  hot:'rgba(255, 90, 95, 0.32)',  ring:'rgba(227, 36, 89, 0.42)',  ink:'#E32459', label:'Occupato' },
  prenotato: { tint:'rgba(124, 58, 237, 0.12)', hot:'rgba(124, 58, 237, 0.24)', ring:'rgba(124, 58, 237, 0.38)', ink:'#6D28D9', label:'Prenotato' },
  dapulire:  { tint:'rgba(217, 119, 6, 0.14)',  hot:'rgba(217, 119, 6, 0.26)',  ring:'rgba(217, 119, 6, 0.42)',  ink:'#B45309', label:'Da liberare' },
};

// Tile-tavolo: hover come in Sala (tinta più intensa, hairline di stato,
// lift con ombra) + scale; il click apre la Sala col tavolo espanso.
function WTavTile({ t }) {
  const [hover, setHover] = React.useState(false);
  const S = WTAV_STATES[t.s];
  return (
    <button
      onClick={() => { window.location.href = `byup Sala.html?tavolo=${t.id}`; }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      title={`Apri Tavolo ${t.id} in Sala`}
      style={{
        padding: 4, minHeight: 0, border: 'none', fontFamily: 'inherit', cursor: 'pointer',
        background: hover ? S.hot : S.tint,
        borderRadius: 10,
        boxShadow: hover
          ? `inset 0 0 0 1.25px ${S.ring}, 0 10px 24px rgba(80, 40, 80, 0.18)`
          : `inset 0 0 0 1px ${S.ring}`,
        display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap: 2,
        transform: hover ? 'scale(1.06)' : 'scale(1)',
        transition: 'transform 200ms cubic-bezier(0.34, 1.45, 0.64, 1), background 150ms ease, box-shadow 200ms ease',
        position: 'relative', zIndex: hover ? 2 : 1,
      }}>
      <div style={{fontSize: 14.5, fontWeight: 700, color: S.ink, lineHeight: 1.1, whiteSpace:'nowrap'}}>Tavolo {t.id}</div>
      <div style={{fontSize: 11.5, color: S.ink, fontWeight: 600, opacity: 0.8, lineHeight: 1.1, whiteSpace:'nowrap'}}>
        {t.t || S.label}
      </div>
    </button>
  );
}

function WidgetTavoliStato() {
  // Specchio dei primi 12 tavoli della Sala principale (sala-data.jsx):
  // stessi id, stessi stati, stessi tempi — il widget dice la verità di Sala.
  const tables = [
    { id: 1,  s:'occupato',  t:'32m' },
    { id: 2,  s:'libero' },
    { id: 3,  s:'occupato',  t:'18m' },
    { id: 4,  s:'prenotato', t:'20:30' },
    { id: 5,  s:'occupato',  t:'1h05' },
    { id: 6,  s:'dapulire' },
    { id: 7,  s:'occupato',  t:'48m' },
    { id: 8,  s:'libero' },
    { id: 9,  s:'occupato',  t:'12m' },
    { id: 10, s:'prenotato', t:'20:45' },
    { id: 11, s:'occupato',  t:'1h35' },
    { id: 12, s:'libero' },
  ];
  const occupati = tables.filter(t => t.s === 'occupato').length;

  return (
    <div style={{display:'flex', flexDirection:'column', height:'100%', minHeight: 0}}>
      <div style={{marginBottom: 10, flexShrink: 0, minWidth: 0}}>
        <WidgetHead name="Stato tavoli"
          right={<span style={{fontSize: 13, color: PN.MUTED, fontWeight: 600, whiteSpace: 'nowrap'}}><b style={{color: PN.TEXT}}>{occupati} su {tables.length}</b> occupati</span>}/>
      </div>

      {/* Mappa 4×3 fissa che riempie tutta l'altezza del 2×2: i 12 tavoli si
          vedono sempre tutti, senza scroll — è una minimappa della sala.
          Seconda riga del tile: il tempo se c'è, altrimenti lo stato. */}
      <div style={{
        flex: 1, minHeight: 0,
        display:'grid',
        gridTemplateColumns:'repeat(4, 1fr)',
        gridTemplateRows:'repeat(3, 1fr)',
        gap: 8, marginBottom: 12,
      }}>
        {tables.map(t => <WTavTile key={t.id} t={t}/>)}
      </div>

      <div style={{
        display:'flex', flexWrap:'wrap', gap: 8,
        flexShrink: 0,
        paddingTop: 8, borderTop:`1px solid ${PN.BORDER_SOFT}`,
      }}>
        {Object.entries(WTAV_STATES).map(([k, c]) => (
          <div key={k} style={{display:'flex', alignItems:'center', gap: 5, fontSize: 13, color: PN.MUTED, whiteSpace: 'nowrap'}}>
            <span style={{width: 8, height: 8, borderRadius: 2, background: c.ink}}/>
            {c.label}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 4. Top piatti settimana ────────────────────────────────────────────────

function WidgetTopPiatti() {
  const dishes = [
    { name: 'Cacio e pepe', sales: 142, rev: 1988, trend:'+12%', up:true },
    { name: 'Tagliata di manzo', sales: 89, rev: 2225, trend:'+8%', up:true },
    { name: 'Tiramisù della casa', sales: 76, rev: 532, trend:'+24%', up:true },
    { name: 'Carbonara', sales: 68, rev: 952, trend:'-3%', up:false },
    { name: 'Bruschetta mista', sales: 54, rev: 432, trend:'+5%', up:true },
  ];
  const max = Math.max(...dishes.map(d => d.sales));

  // Sunset-theme ranking (D3): leaderboard premium dark warm. Posizione #1 in
  // coral, altre in grigio neutro. La sunset palette accende il pattern "top X"
  // con la stessa gravitas del night ma allineato al sistema 80/15/10.
  return (
    <GlassDarkBox
      theme="sunset"
      style={{
        margin: '-18px -18px -16px -18px',
        height: 'calc(100% + 34px)',
        display:'flex', flexDirection:'column',
      }}>
      <div style={{display:'flex', alignItems:'baseline', gap: 10, marginBottom: 14, minWidth: 0}}>
        <div style={{fontSize: 12.5, fontWeight: 700, color: 'rgba(255,255,255,0.65)', textTransform:'uppercase', letterSpacing: 0.5, minWidth: 0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>Top piatti questa settimana</div>
      </div>
      {/* Lista responsive: ogni dish ha flex:1 0 auto + minHeight → gli item
          crescono uniformemente quando il widget è alto (h≥2), restano compatti
          quando il widget è 1×1 con scroll se servono.
          gap proporzionale: più aria tra dish in widget grande. */}
      {/* Respiro laterale e verticale dentro l'area scrollabile: la riga che
          si ingrandisce in hover non tocca mai il bordo di clipping. */}
      <div style={{flex:1, display:'flex', flexDirection:'column', gap: 6, minHeight: 0, overflowY: 'auto', margin: '0 -14px', padding: '3px 14px'}}>
        {dishes.map((d, i) => (
          <TopDishRow key={i} d={d} i={i} max={max}/>
        ))}
      </div>
    </GlassDarkBox>
  );
}

// Riga del top piatto: si accende e si ingrandisce in hover, al click porta
// alle statistiche degli ordini (dove vivono i numeri dei piatti).
function TopDishRow({ d, i, max }) {
  const [hover, setHover] = React.useState(false);
  const [pressed, setPressed] = React.useState(false);
  return (
    <div
      onClick={() => { window.location.href = 'byup Statistiche.html?tab=operazioni&sub=ordini'; }}
      title={`Statistiche di ${d.name}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setPressed(false); }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      style={{
        flex: '1 0 auto',
        minHeight: 38,
        display:'flex', flexDirection:'column', justifyContent:'center',
        gap: 5,
        padding: '6px 8px', margin: '0 -8px', borderRadius: 10,
        background: hover ? 'rgba(255,255,255,0.08)' : 'transparent',
        boxShadow: hover ? 'inset 0 0 0 1px rgba(255,255,255,0.12)' : 'none',
        cursor: 'pointer',
        transform: pressed ? 'scale(0.99)' : hover ? 'scale(1.015)' : 'scale(1)',
        transition: 'transform 160ms cubic-bezier(0.34, 1.45, 0.64, 1), background 150ms ease, box-shadow 150ms ease',
      }}>
            {/* Due righe: il nome ha la riga 1 (con rank e trend), i numeri la
                riga 2 — a colonna 1× nome e numeri insieme troncavano il nome
                a due lettere. */}
            <div style={{display:'flex', alignItems:'center', gap: 8, minWidth: 0}}>
              <span style={{
                width: 18, height: 18, borderRadius: 5,
                background: i === 0 ? '#FF6066' : 'rgba(255,255,255,0.08)',
                color: i === 0 ? '#fff' : 'rgba(255,255,255,0.70)',
                display:'grid', placeItems:'center',
                fontSize: 12.5, fontWeight: 700,
                boxShadow: i === 0 ? '0 0 10px rgba(255, 96, 102, 0.50)' : 'inset 0 0 0 1px rgba(255,255,255,0.10)',
                flexShrink: 0,
              }}>{i+1}</span>
              <span style={{flex: 1, fontSize: 15, color: '#F5F5F7', fontWeight: 600, minWidth: 0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{d.name}</span>
              <span style={{fontSize: 13.5, color: d.up ? '#86EFAC' : '#FCA5A5', fontWeight: 600, flexShrink: 0}}>{d.trend}</span>
            </div>
            <div style={{paddingLeft: 26, fontSize: 13, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>
              <span style={{color: 'rgba(255,255,255,0.55)'}}>{d.sales} ordini · </span>
              <span style={{color: '#F5F5F7', fontWeight: 600}}>€{d.rev.toLocaleString('it-IT', {useGrouping: true})}</span>
            </div>
            <div style={{height: 4, background:'rgba(255,255,255,0.08)', borderRadius: 99, overflow:'hidden'}}>
              <div style={{height:'100%', width: `${(d.sales/max)*100}%`, background: i === 0 ? '#FF6066' : 'rgba(255,255,255,0.30)', borderRadius: 99, boxShadow: i === 0 ? '0 0 8px rgba(255, 96, 102, 0.40)' : 'none'}}/>
            </div>
    </div>
  );
}

// ─── 5. Recensioni recenti ──────────────────────────────────────────────────

function WidgetRecensioni() {
  const reviews = [
    { name: 'Laura M.', stars: 5, when:'2h fa', text:'Cacio e pepe stellare, servizio impeccabile. Torneremo!', source:'Google' },
    { name: 'Andrea P.', stars: 4, when:'5h fa', text:'Tutto buono, ma sala un po\' rumorosa di sabato sera.', source:'byup' },
    { name: 'Sofia R.', stars: 5, when:'1g fa', text:'Personale gentilissimo, tagliata cotta perfetta. Top.', source:'Google' },
  ];

  return (
    <div style={{display:'flex', flexDirection:'column', height:'100%'}}>
      {/* flexWrap: a w=1 titolo + badge verde non entrano su una riga —
          il badge scende sotto invece di sbordare dalla card. */}
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: 12, gap: '6px 10px', flexWrap:'wrap', minWidth: 0, flexShrink: 0}}>
        <div style={{minWidth: 0}}>
          <div style={{fontSize: 12.5, fontWeight: 700, color: PN.MUTED, textTransform:'uppercase', letterSpacing: 0.5, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>Recensioni recenti</div>
          <div style={{display:'flex', alignItems:'center', gap: 6, marginTop: 4, minWidth: 0}}>
            <div style={{display:'flex', gap: 2, flexShrink: 0}}>
              {[1,2,3,4,5].map(i => (
                <Icon name="star" key={i} size={13} color={i <= 4 ? '#F59E0B' : '#E5E7EB'}/>
              ))}
            </div>
            <span style={{fontSize: 15, fontWeight: 700, color: PN.TEXT, whiteSpace:'nowrap'}}>4,7</span>
            <span style={{fontSize: 14, color: PN.MUTED, minWidth: 0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>· 312 recensioni</span>
          </div>
        </div>
        <div style={{
          fontSize: 13, fontWeight: 600, color: PN.GREEN,
          background: PN.GREEN_SOFT, padding: '4px 8px', borderRadius: 6,
          whiteSpace:'nowrap', flexShrink: 0,
        }}>+8 questa settimana</div>
      </div>

      <div style={{flex:1, display:'flex', flexDirection:'column', gap: 10, minHeight: 0, overflow:'auto', margin: '0 -6px', padding: '3px 6px'}}>
        {reviews.map((r,i) => <ReviewTile key={i} r={r}/>)}
      </div>
    </div>
  );
}

// Tile recensione: soft-glass che si ingrandisce in hover; al click porta
// alla sezione recensioni (Statistiche · Clienti · Valutazioni).
function ReviewTile({ r }) {
  const [hover, setHover] = React.useState(false);
  const [pressed, setPressed] = React.useState(false);
  return (
    <div
      onClick={() => { window.location.href = 'byup Statistiche.html?tab=clienti&sub=fidelizzazione'; }}
      title="Vai alle recensioni"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setPressed(false); }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      style={{
        flex: '1 0 auto',
        minHeight: 64,
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: 12, borderRadius: 10,
        background: 'rgba(255, 245, 248, 0.55)',
        backgroundImage:
          'linear-gradient(to bottom, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.10) 45%, rgba(255,255,255,0) 100%)',
        backdropFilter: 'blur(12px) saturate(160%)',
        WebkitBackdropFilter: 'blur(12px) saturate(160%)',
        boxShadow: hover
          ? 'inset 0 1px 0 rgba(255,255,255,0.70), inset 0 0 0 1px rgba(242, 107, 122, 0.18), 0 10px 24px rgba(15, 17, 21, 0.10)'
          : 'inset 0 1px 0 rgba(255,255,255,0.70), inset 0 0 0 1px rgba(242, 107, 122, 0.08), 0 1px 2px rgba(15, 17, 21, 0.03)',
        cursor: 'pointer',
        transform: pressed ? 'scale(0.99)' : hover ? 'scale(1.02)' : 'scale(1)',
        position: 'relative', zIndex: hover ? 2 : 1,
        transition: 'transform 170ms cubic-bezier(0.34, 1.45, 0.64, 1), box-shadow 170ms ease',
      }}>
      <div style={{display:'flex', alignItems:'center', gap: 8, marginBottom: 5, minWidth: 0}}>
        <div style={{fontSize: 14.5, fontWeight: 600, color: PN.TEXT, whiteSpace:'nowrap', flexShrink: 0}}>{r.name}</div>
        <div style={{display:'flex', gap: 1, flexShrink: 0}}>
          {[1,2,3,4,5].map(i => (
            <Icon name="star" key={i} size={10} color={i <= r.stars ? '#F59E0B' : '#E5E7EB'}/>
          ))}
        </div>
        {/* ellipsis: a w=1 "2h fa · Google" sbordava dal tile glass */}
        <div style={{fontSize: 13, color: PN.MUTED, marginLeft:'auto', minWidth: 0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{r.when} · {r.source}</div>
      </div>
      <div style={{fontSize: 14.5, color: PN.TEXT, lineHeight: 1.5}}>{r.text}</div>
    </div>
  );
}

// ─── 6. Azioni rapide ───────────────────────────────────────────────────────

function WidgetAzioni({ size }) {
  // Shortcut "app launcher" desktop. Layout adattivo in 2 modalità:
  //  • FULL banner (w=4, h=2): grid fissa 4×2 con icona + LABEL — il
  //    pattern "homepage premium". 4 sopra + 4 sotto, come Launchpad.
  //  • Tutto il resto (w=1/2, qualunque h, o w=4 con h=1): grid auto-fit
  //    SOLO icone, niente label. Le shortcut diventano una toolbar compatta
  //    quando il widget è ridotto.
  // Ogni azione atterra sulla funzione vera nella sua sezione (deep-link).
  const actions = [
    { label: 'Nuova prenotazione', icon: 'time-calendar',       color: '#FB7185', href: 'byup Sala.html?tab=calendar&nuova=1' },
    { label: 'Aggiungi piatto',    icon: 'food-meal',           color: '#F472B6', href: 'byup Impostazioni.html?page=menu-cucina&sub=libreria&add=1' },
    // Due azioni sul menù e due destinazioni diverse: «Aggiungi piatto» apre la
    // libreria dei piatti, questa il compositore dei menù — dove si decide
    // quali piatti stanno in quale menù e in che categoria.
    { label: 'Modifica menu',      icon: 'pencil',              color: '#FBBF24', href: 'byup Impostazioni.html?page=menu-cucina&sub=menu' },
    { label: 'Apri cassa',         icon: 'commerce-wallet',     color: '#34D399', href: 'byup Contabilita.html?tab=cassa' },
    { label: 'Stampa QR tavolo',   icon: 'place-table',         color: '#60A5FA', href: 'byup Impostazioni.html?page=sala' },
    { label: 'Invita membro del team', icon: 'people-staff-group',  color: '#A78BFA', href: 'byup Impostazioni.html?page=personale&invita=1' },
    { label: 'Esporta dati del giorno', icon: 'download',            color: '#22D3EE', href: 'byup Contabilita.html?tab=export' },
    // Il referral vive in Profilo → Piani, dove il premio si incassa. Qui c'è
    // solo la porta: nei tab dell'account non ci va a curiosare nessuno.
    { label: 'Invita un ristorante', icon: 'place-restaurant',     color: '#F0ABFC', href: 'byup Profilo.html?tab=piani&invita=1' },
  ];

  const w = (size && size.w) || 1;
  const h = (size && size.h) || 1;
  // Misura fissa 4×2 dal catalogo → sempre full banner; il ramo compatto
  // resta per robustezza se la griglia clampa le colonne su schermi stretti.
  const isFullBanner = w === 4 && h >= 2;
  const showLabels = isFullBanner;
  // Colonne scelte per far stare tutto in due righe: 3 fino a sei azioni,
  // 4 da sette in poi.
  const colonne = actions.length > 6 ? 4 : 3;

  return (
    <GlassDarkBox
      theme="night"
      nightAccent
      style={{
        margin: '-18px -18px -16px -18px',
        height: 'calc(100% + 34px)',
        display:'flex', flexDirection:'column',
        minHeight: 0,
      }}>
      <div style={{display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom: 12, flexShrink: 0, gap: 10, minWidth: 0}}>
        <div style={{fontSize: 12.5, fontWeight: 700, color: 'rgba(255,255,255,0.65)', textTransform:'uppercase', letterSpacing: 0.5, minWidth: 0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>
          Azioni rapide
        </div>
        <div style={{fontSize: 13.5, color: 'rgba(255,255,255,0.50)', whiteSpace:'nowrap', flexShrink: 0}}>
          {actions.length} azioni
        </div>
      </div>

      <div style={{
        flex: 1, minHeight: 0, overflowY: 'auto',
        // Respiro dentro l'area scrollabile: il lift in hover (translateY -2px
        // + ombra) della prima riga non viene tagliato dal margine superiore.
        margin: '-6px -8px -4px', padding: '6px 8px 4px',
        display: 'grid',
        // Launcher esteso: le colonne si scelgono per stare in DUE righe, che è
        // l'altezza del widget a catalogo. Con sei azioni sono tre (3×2, il
        // bilanciamento originale); da sette in poi diventano quattro (4+3),
        // altrimenti la settima resterebbe sola in una terza riga — l'orfano
        // che le tre colonne erano state scelte per evitare.
        gridTemplateColumns: isFullBanner
          ? `repeat(${colonne}, 1fr)`
          : 'repeat(auto-fit, minmax(54px, 1fr))',
        gridTemplateRows: isFullBanner ? `repeat(${Math.max(2, Math.ceil(actions.length / colonne))}, 1fr)` : 'none',
        gridAutoRows: isFullBanner ? undefined : 'minmax(54px, 1fr)',
        gap: isFullBanner ? 10 : 6,
        alignContent: 'start',
      }}>
        {actions.map((a, i) => (
          <button key={i}
            className="glass-lift-hover"
            title={a.label}
            onClick={() => { window.location.href = a.href; }}
            onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.95)'; }}
            onMouseUp={e => { e.currentTarget.style.transform = ''; }}
            style={{
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: showLabels ? 6 : 0,
              background: 'rgba(255,255,255,0.04)',
              border: 'none',
              borderRadius: showLabels ? 14 : 10,
              padding: showLabels ? '8px 6px' : '6px',
              cursor: 'pointer',
              fontFamily: 'inherit',
              color: '#F5F5F7',
              boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.06)',
              transition: 'background 180ms ease, transform 220ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 220ms ease',
              minHeight: 0,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = `${a.color}1A`;
              e.currentTarget.style.boxShadow = `inset 0 0 0 1px ${a.color}40, 0 8px 20px -6px ${a.color}55`;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
              e.currentTarget.style.boxShadow = 'inset 0 0 0 1px rgba(255,255,255,0.06)';
              e.currentTarget.style.transform = '';
            }}
          >
            <span style={{
              width: showLabels ? 42 : 36,
              height: showLabels ? 42 : 36,
              borderRadius: showLabels ? 12 : 10,
              background: `linear-gradient(135deg, ${a.color}DD 0%, ${a.color}88 100%)`,
              color: '#fff',
              display: 'grid', placeItems: 'center',
              flexShrink: 0,
              boxShadow:
                `inset 0 1px 0 rgba(255,255,255,0.30), ` +
                `0 4px 12px -2px ${a.color}77`,
            }}>
              <Icon name={a.icon} size={showLabels ? 20 : 18} color="#fff"/>
            </span>
            {showLabels && (
              <span style={{
                fontSize: 12.5, fontWeight: 600, textAlign: 'center', lineHeight: 1.2,
                color: 'rgba(255,255,255,0.92)',
                maxWidth: '100%',
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              }}>{a.label}</span>
            )}
          </button>
        ))}
      </div>
    </GlassDarkBox>
  );
}

// ─── 7. Coperti settimana (bar chart) ────────────────────────────────────────

function WidgetCopertiSettimana({ size }) {
  const days = [
    {d:'L', v:38}, {d:'M', v:42}, {d:'M', v:51}, {d:'G', v:42, today:true},
    {d:'V', v:0, future:true}, {d:'S', v:0, future:true}, {d:'D', v:0, future:true},
  ];
  const max = Math.max(...days.map(d=>d.v), 80);
  // Layout adattivo: a h=1 la metrica (~85px) + bar chart stacked non entrano
  // nei ~108px utili → metrica a sinistra, chart a destra (stesso pattern
  // sideBySide di Riempimento). A h≥2 resta lo stacked classico.
  const compact = ((size && size.h) || 1) === 1;
  return (
    <div data-no-fx onClick={() => { window.location.href = 'byup Statistiche.html?tab=operazioni&sub=prenotazioni'; }}
      title="Apri le statistiche dei coperti"
      style={{
      display:'flex', flexDirection: compact ? 'row' : 'column',
      height:'100%', minHeight: 0, gap: compact ? 18 : 0, cursor: 'pointer',
    }}>
      <div style={{flexShrink: 0, minWidth: 0, maxWidth: compact ? '46%' : 'none', display:'flex', flexDirection:'column', justifyContent: compact ? 'center' : 'flex-start'}}>
        <WMetric label="Spaccato coperti questa settimana" value="173" trend="+11%"/>
      </div>
      <div style={{flex:1, minWidth: 0, minHeight: 0, display:'flex', alignItems:'stretch', gap: 8, marginTop: compact ? 0 : 18}}>
        {days.map((d,i) => (
          // Colonna a piena altezza + barra con flexBasis % (shrinkabile):
          // il vecchio height % si risolveva su un parent auto → barre sempre
          // collassate a 6px; ora la barra prende v/max dell'altezza reale
          // e si comprime senza sbordare quando la cella è bassa.
          // Etichetta giorno IN FLUSSO sotto la barra: l'assoluto col calc si
          // disallineava dalle colonne reali (gap escluso dal conto).
          <div key={i} style={{flex:1, minWidth: 0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'flex-end', gap: 6, minHeight: 0}}>
            <div style={{
              fontSize: 12.5, color: d.today ? PN.PINK_DARK : PN.MUTED,
              fontWeight: d.today ? 700 : 600,
              opacity: d.future ? 0 : 1,
              flexShrink: 0, whiteSpace:'nowrap',
            }}>{d.v || ''}</div>
            <div style={{
              width: '100%',
              flex: d.future ? '0 0 6px' : `0 1 ${(d.v/max)*100}%`,
              minHeight: 6,
              background: d.today ? PN.PINK : d.future ? '#F0F2F5' : '#D4D6DB',
              borderRadius: 4,
              border: d.future ? `1px dashed ${PN.MUTED_LIGHT}` : 'none',
            }}/>
            <div style={{
              fontSize: 12.5, color: d.today ? PN.PINK_DARK : PN.MUTED,
              fontWeight: d.today ? 700 : 500, flexShrink: 0, whiteSpace:'nowrap',
            }}>{d.d}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── (rimosso WidgetPerformanceMese, ora sostituito da KpiVendita + Riempimento) ──

// ─── 10. Cucina live ────────────────────────────────────────────────────────

function WidgetCucinaLive() {
  // Dati + struttura allineati al kitchen-box della variant D3 in
  // byup Login Themes.html (preview reference). Status derivato dal minutaggio:
  //   < 5'  → green (pronto / quasi pronto)
  //   5-10' → amber (in prep)
  //   > 10' → red   (ritardo)
  // Il NUMERO MINUTI viene colorato come il pill status, così l'occhio capisce
  // urgenza scansionando la colonna centrale senza dover leggere la pill.
  // Tavoli allineati ai ticket veri di cucina-data: il click apre la Cucina
  // con il ticket del tavolo evidenziato (?tavolo=N).
  const orders = [
    { table: '9',  items: 3, time: "8' 20\"",  status: 'amber', label: 'In preparazione' },
    { table: '12', items: 2, time: "2' 10\"",  status: 'green', label: 'Pronto' },
    { table: '15', items: 5, time: "12' 40\"", status: 'red',   label: 'In ritardo' },
    { table: '8',  items: 4, time: "6' 45\"",  status: 'amber', label: 'In preparazione' },
    { table: '4',  items: 1, time: "1' 30\"",  status: 'green', label: 'Pronto' },
    { table: '6',  items: 3, time: "4' 10\"",  status: 'green', label: 'Pronto' },
    { table: '11', items: 6, time: "10' 15\"", status: 'red',   label: 'In ritardo' },
  ];
  const statusStyles = {
    amber: { bg: 'rgba(251, 146, 60, 0.18)', fg: '#FDBA74' },
    green: { bg: 'rgba(52, 211, 153, 0.18)', fg: '#86EFAC' },
    red:   { bg: 'rgba(248, 113, 113, 0.18)', fg: '#FCA5A5' },
  };

  return (
    <GlassDarkBox
      theme="sunset"
      style={{
        margin: '-18px -18px -16px -18px',
        height: 'calc(100% + 34px)',
        padding: '14px 16px',
        display: 'flex', flexDirection: 'column',
      }}>
      {/* Header — kitchen-head del preview */}
      <div style={{
        display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
        marginBottom: 4, gap: 8, minWidth: 0, flexShrink: 0,
      }}>
        <span style={{
          fontSize: 12.5, fontWeight: 700, color: 'rgba(255,255,255,0.65)',
          textTransform: 'uppercase', letterSpacing: 0.5,
          minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>Cucina · in diretta</span>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          fontSize: 13, fontWeight: 500, color: '#9CA3AF',
          whiteSpace: 'nowrap', flexShrink: 0,
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: 999, background: '#F87171',
          }}/>
          {orders.length} in attesa
        </span>
      </div>

      {/* Rows — kitchen-row del preview. Margine negativo + padding uguali:
          le righe scalate in hover non vengono tagliate dai bordi. */}
      <div style={{
        display: 'flex', flexDirection: 'column', gap: 6,
        flex: 1, minHeight: 0, overflowY: 'auto',
        margin: '4px -8px 0', padding: '2px 8px',
      }}>
        {orders.map((o, i) => (
          <KitchenLiveRow key={i} o={o} s={statusStyles[o.status]}/>
        ))}
      </div>
    </GlassDarkBox>
  );
}

// Riga della cucina in diretta: si ingrandisce e si accende in hover, al
// click apre la Cucina con il ticket del tavolo evidenziato.
function KitchenLiveRow({ o, s }) {
  const [hover, setHover] = React.useState(false);
  const [pressed, setPressed] = React.useState(false);
  return (
    <div
      onClick={() => { window.location.href = `byup Cucina.html?tavolo=${o.table}`; }}
      title={`Apri la Cucina sul Tavolo ${o.table}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setPressed(false); }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      style={{
        display: 'grid', gridTemplateColumns: 'auto 1fr auto',
        gap: 10, alignItems: 'center',
        padding: '8px 10px', borderRadius: 9,
        background: hover ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.06)',
        boxShadow: hover
          ? 'inset 0 1px 0 rgba(255, 255, 255, 0.14), inset 0 0 0 1px rgba(255, 255, 255, 0.16), 0 8px 20px rgba(0, 0, 0, 0.25)'
          : 'inset 0 1px 0 rgba(255, 255, 255, 0.10), inset 0 0 0 1px rgba(255, 255, 255, 0.06)',
        cursor: 'pointer',
        transform: pressed ? 'scale(0.985)' : hover ? 'scale(1.02)' : 'scale(1)',
        position: 'relative', zIndex: hover ? 2 : 1,
        transition: 'transform 160ms cubic-bezier(0.34, 1.45, 0.64, 1), background 150ms ease, box-shadow 160ms ease',
      }}>
              <span style={{
                fontSize: 14, fontWeight: 700,
                fontVariantNumeric: 'tabular-nums',
                color: '#F3F4F6',
                background: 'rgba(255, 255, 255, 0.10)',
                padding: '2px 7px', borderRadius: 6,
                minWidth: 22, textAlign: 'center',
                whiteSpace: 'nowrap',
              }}>{o.table}</span>
              {/* minWidth:0: la colonna 1fr può stringersi sotto il contenuto
                  — il testo va a capo dentro la riga invece di sbordare. */}
              <span style={{fontSize: 13.5, color: '#9CA3AF', minWidth: 0}}>
                {o.items} {o.items === 1 ? 'portata' : 'portate'} · <span style={{color: s.fg, fontWeight: 600, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap'}}>{o.time}</span>
              </span>
              <span style={{
                fontSize: 12, fontWeight: 700,
                padding: '2px 7px', borderRadius: 5,
                letterSpacing: '0.02em',
                background: s.bg, color: s.fg,
                whiteSpace: 'nowrap',
              }}>{o.label}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// WidgetAndamento — andamento di un singolo KPI (coperti o scontrino medio).
// Auto-switch oggi → settimana → mese ogni 2.4s, pause-on-hover, sparkline
// ambient sul fondo. Header standard: nome a sinistra, filtro a destra.
// ─────────────────────────────────────────────────────────────────────────

const ANDAMENTO_DATA = {
  coperti: {
    oggi:      { total: '42',  trend: '+5%',  sub: 'vs media giornaliera',
                 spark: [2, 5, 9, 14, 18, 12, 6, 3, 2, 6, 16, 26, 34, 30, 38, 28],
                 labels: ['12:00', '17:00', '21:00'] },
    settimana: { total: '173', trend: '+11%', sub: 'vs settimana scorsa',
                 spark: [26, 34, 22, 44, 38, 52, 64, 42, 36, 48, 40, 58],
                 labels: ['Lun', 'Mer', 'Ven', 'Dom'] },
    mese:      { total: '753', trend: '+8%',  sub: 'vs mese scorso',
                 spark: [18, 24, 16, 32, 26, 38, 33, 46, 41, 54, 48, 62, 57, 68, 74, 66, 80, 72],
                 labels: ['1', '10', '20', '30'] },
  },
  scontrino: {
    oggi:      { total: '€ 29,70', trend: '+€ 0,80', sub: 'vs media giornaliera',
                 spark: [27.8, 28.6, 28.1, 29.4, 28.9, 30.1, 29.3, 30.6, 29.8, 30.9, 30.2, 31.1, 30.4, 29.9, 30.8, 29.7],
                 labels: ['12:00', '17:00', '21:00'] },
    settimana: { total: '€ 31,90', trend: '+€ 1,10', sub: 'vs settimana scorsa',
                 spark: [29.8, 31.0, 30.2, 32.1, 31.2, 32.8, 31.6, 33.0, 32.2, 31.4, 32.5, 31.9],
                 labels: ['Lun', 'Mer', 'Ven', 'Dom'] },
    mese:      { total: '€ 32,40', trend: '+€ 1,20', sub: 'vs mese scorso',
                 spark: [29.4, 30.2, 29.8, 31.0, 30.4, 31.6, 30.9, 32.0, 31.2, 32.4, 31.8, 32.8, 32.0, 33.1, 32.2, 33.4, 32.6, 32.4],
                 labels: ['1', '10', '20', '30'] },
  },
};

function WidgetAndamento({ size, name, metric }) {
  // Click sul widget → la sezione di Statistiche dove vive la metrica.
  const statsHref = metric === 'scontrino'
    ? 'byup Statistiche.html?tab=economici'
    : 'byup Statistiche.html?tab=operazioni&sub=prenotazioni';
  const [period, setPeriod] = React.useState('oggi');
  const [paused, setPaused] = React.useState(false);
  const periods = ['oggi', 'settimana', 'mese'];
  const compact = ((size && size.h) || 1) === 1;

  React.useEffect(() => {
    if (paused) return;
    const t = setInterval(() => {
      setPeriod(p => periods[(periods.indexOf(p) + 1) % periods.length]);
    }, 2400);
    return () => clearInterval(t);
  }, [paused]);

  const d = ANDAMENTO_DATA[metric][period];

  const keyframes = (
    <style>{`
      @keyframes fin-fade-in {
        from { opacity: 0; transform: translateY(4px); }
        to   { opacity: 1; transform: translateY(0); }
      }
    `}</style>
  );

  if (compact) {
    // Stesso impianto del widget Incassi: numero grande a sinistra,
    // sparkline a destra con le etichette dell'asse sotto.
    return (
      <div data-no-fx
        onClick={() => { window.location.href = statsHref; }}
        title="Apri le statistiche"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        style={{display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, gap: 8, cursor: 'pointer'}}
      >
        <WidgetHead name={name} right={<PnPeriodToggle period={period} setPeriod={(p) => { setPeriod(p); setPaused(true); }}/>}/>
        <div style={{display: 'flex', flex: 1, minHeight: 0, gap: 18}}>
          <div key={period} style={{flex: '0 1 auto', minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', animation: 'fin-fade-in 320ms ease-out'}}>
            <WMetric value={d.total} trend={d.trend} sub={d.sub} big/>
          </div>
          <div style={{flex: 1, minWidth: 0, minHeight: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', overflow: 'hidden'}}>
            <div style={{flex: '1 1 auto', minHeight: 0}}>
              <WSparkline data={d.spark} color={PN.PINK} animated/>
            </div>
            <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: PN.MUTED_SOFT, marginTop: 4, flexShrink: 0}}>
              {d.labels.map((l, i) => <span key={i}>{l}</span>)}
            </div>
          </div>
        </div>
        {keyframes}
      </div>
    );
  }

  // Variante alta: numero in alto, sparkline piena sotto (come Incassi).
  return (
    <div data-no-fx
      onClick={() => { window.location.href = statsHref; }}
      title="Apri le statistiche"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      style={{display: 'flex', flexDirection: 'column', gap: 14, height: '100%', minHeight: 0, cursor: 'pointer'}}
    >
      <WidgetHead name={name} right={<PnPeriodToggle period={period} setPeriod={(p) => { setPeriod(p); setPaused(true); }}/>}/>
      <div key={period} style={{animation: 'fin-fade-in 320ms ease-out', minWidth: 0}}>
        <WMetric value={d.total} trend={d.trend} sub={d.sub} big/>
      </div>
      <div style={{flex: 1, minHeight: 36, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', overflow: 'hidden'}}>
        <div style={{flex: '1 1 auto', minHeight: 0}}>
          <WSparkline data={d.spark} color={PN.PINK} animated/>
        </div>
        <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: PN.MUTED_SOFT, marginTop: 4, flexShrink: 0}}>
          {d.labels.map((l, i) => <span key={i}>{l}</span>)}
        </div>
      </div>
      {keyframes}
    </div>
  );
}

function WidgetAndamentoCoperti({ size }) {
  return <WidgetAndamento size={size} name="Coperti" metric="coperti"/>;
}

function WidgetAndamentoScontrino({ size }) {
  return <WidgetAndamento size={size} name="Scontrino medio" metric="scontrino"/>;
}

window.PnWidgets = {
  WidgetAndamentoCoperti, WidgetAndamentoScontrino,
  WidgetIncassi, WidgetRiempimento,
  WidgetPrenotazioniOggi, WidgetTavoliStato, WidgetTopPiatti,
  WidgetRecensioni, WidgetAzioni, WidgetCopertiSettimana,
  WidgetCucinaLive,
};
