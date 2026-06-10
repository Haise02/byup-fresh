// Widget content components — each is a self-contained body that fits inside PnWidgetShell.
// Sizes: w∈{1,2,3,4} cols (of 4-col grid), h∈{1,2,3} rows (of ~140px each)

// ─── shared bits ────────────────────────────────────────────────────────────

function WMetric({ label, value, sub, trend, trendColor, big }) {
  return (
    <div>
      <div style={{fontSize: 11.5, color: PN.MUTED, fontWeight: 600, letterSpacing: 0.3, textTransform:'uppercase', marginBottom: 6}}>{label}</div>
      <div style={{display:'flex', alignItems:'baseline', gap: 12, marginBottom: 4, flexWrap:'wrap'}}>
        <div style={{fontSize: big ? 56 : 38, fontWeight: 700, color: PN.TEXT, letterSpacing:-1.4, lineHeight: 1}}>{value}</div>
        {trend && (
          <div style={{
            display:'inline-flex', alignItems:'center', gap: 3,
            fontSize: 14, fontWeight: 700,
            color: trendColor || PN.GREEN,
          }}>
            {trend.startsWith('+') ? <Icon name="arrow-up-right" size={14}/> : trend.startsWith('-') ? <Icon name="arrow-down-right" size={14}/> : null}
            {trend}
          </div>
        )}
      </div>
      {sub && <div style={{fontSize:12.5, color: PN.MUTED}}>{sub}</div>}
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
  const max = Math.max(...data), min = Math.min(...data);
  const range = max - min || 1;

  const pts = data.map((v, i) => {
    const x = PAD + (i / (data.length - 1)) * usableW;
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
    <div style={{width: '100%', height: '100%', overflow: 'hidden', display: 'block'}}>
      <svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        preserveAspectRatio="none"
        // overflow:hidden sul tag SVG impedisce a circle/path di sbordare:
        // `preserveAspectRatio="none"` stira la geometria, ma elementi con
        // raggio fisso (circle r=2.4) potevano "uscire" dai margini visuali.
        // Combinato col wrapper overflow:hidden taglia in modo netto.
        style={{width: '100%', height: '100%', display: 'block', overflow: 'hidden'}}
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={color} stopOpacity="0.28"/>
            <stop offset="100%" stopColor={color} stopOpacity="0"/>
          </linearGradient>
          {/* clipPath per garantire che TUTTO (linea + pallino) sia clippato
              dentro l'area utile, anche durante l'animazione di drawing. */}
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
            pathLength="1"
            style={animated ? {
              strokeDasharray: 1,
              strokeDashoffset: 1,
              animation: 'spark-draw 1.4s ease-out forwards',
            } : undefined}
            vectorEffect="non-scaling-stroke"
          />
          {animated && (
            // Il pallino appare SOLO dopo che il draw del path è completato
            // (delay 1.4s = durata di spark-draw). Senza, il punto sembrava
            // "scollegato" alla fine della linea — la linea ancora si
            // disegnava ma il pallino era già a destinazione → effetto
            // "linea rotta con dot orfano".
            <circle
              cx={last[0].toFixed(2)} cy={last[1].toFixed(2)}
              r="2.4" fill={color}
              style={{
                opacity: 0,
                transformOrigin: `${last[0]}px ${last[1]}px`,
                animation: 'spark-pulse 1.6s ease-in-out 1.4s infinite, spark-dot-in 240ms ease-out 1.30s forwards',
              }}
            />
          )}
        </g>
        <style>{`
          @keyframes spark-draw   { to { stroke-dashoffset: 0; } }
          @keyframes spark-dot-in { from { opacity: 0; } to { opacity: 1; } }
          @keyframes spark-pulse  { 0%,100% { opacity: 1; r: 2.4; } 50% { opacity: 0.55; r: 3.4; } }
        `}</style>
      </svg>
    </div>
  );
}

// ─── 1. Incassi (toggle Oggi / Settimana / Mese) ───────────────────────────

function WidgetIncassi() {
  const [period, setPeriod] = React.useState('oggi');

  // Spark più movimentate: invece di curve smooth crescenti,
  // andamento "vivo" con peaks e valleys realistiche di un servizio.
  const data = {
    oggi: {
      total: '€ 1.247',
      trend: '+18%',
      sub: 'vs media giovedì',
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

  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 14, height: '100%'}}>
      <PnPeriodToggle period={period} setPeriod={setPeriod}/>
      <WMetric label={`Incassi ${period}`} value={d.total} trend={d.trend} sub={d.sub} big/>
      <div style={{flex: 1, minHeight: 36, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end'}}>
        <WSparkline data={d.spark} color={PN.PINK} animated/>
        <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 10.5, color: PN.MUTED_SOFT, marginTop: 4}}>
          {d.labels.map((l,i) => <span key={i}>{l}</span>)}
        </div>
      </div>
    </div>
  );
}

// Piccolo toggle riusabile per oggi/settimana/mese
function PnPeriodToggle({ period, setPeriod }) {
  return (
    <div style={{display:'flex', gap: 4, padding: 3, background:'#F4F5F7', borderRadius: 8, alignSelf:'flex-start'}}>
      {['oggi', 'settimana', 'mese'].map(p => (
        <button key={p} onClick={() => setPeriod(p)} style={{
          padding:'4px 10px',
          background: period === p ? PN.WHITE : 'transparent',
          color: period === p ? PN.TEXT : PN.MUTED,
          border:'none', borderRadius: 6,
          fontSize: 11.5, fontWeight: 600, fontFamily:'inherit',
          cursor: 'pointer',
          textTransform:'capitalize',
          boxShadow: period === p ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
        }}>{p}</button>
      ))}
    </div>
  );
}

// ─── KPI di vendita (scontrino + coperti per periodo) ──────────────────────

function WidgetKpiVendita() {
  const [period, setPeriod] = React.useState('oggi');
  const [paused, setPaused] = React.useState(false);
  const periods = ['oggi', 'settimana', 'mese'];

  // Auto-switch ogni 2s tra oggi → settimana → mese → oggi.
  // pause-on-hover: l'utente può "fermare" il carosello mettendo il mouse sopra.
  React.useEffect(() => {
    if (paused) return;
    const t = setInterval(() => {
      setPeriod(p => periods[(periods.indexOf(p) + 1) % periods.length]);
    }, 2000);
    return () => clearInterval(t);
  }, [paused]);

  const data = {
    oggi:      { scontrino: '€ 29,70', sDelta: '+€ 0,80',  coperti: '42',  cDelta: '+5%',
                 sTrend:[28.4,29.1,28.8,30.2,29.6,30.5,29.7], cTrend:[5,8,6,9,7,8,7] },
    settimana: { scontrino: '€ 31,90', sDelta: '+€ 1,10',  coperti: '264', cDelta: '+9%',
                 sTrend:[30.1,31.2,30.8,32.0,31.4,32.6,31.9], cTrend:[34,38,32,42,38,45,35] },
    mese:      { scontrino: '€ 32,40', sDelta: '+€ 1,20',  coperti: '753', cDelta: '+8%',
                 sTrend:[30.5,31.0,31.8,32.2,31.6,32.8,32.4], cTrend:[95,108,98,118,105,128,101] },
  };
  const d = data[period];

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      style={{display: 'flex', flexDirection: 'column', height: '100%', gap: 14}}
    >
      <PnPeriodToggle period={period} setPeriod={(p) => { setPeriod(p); setPaused(true); }}/>

      <div key={period} style={{
        flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 22,
        animation: 'kpi-fade-in 320ms ease-out',
      }}>
        <KpiRow label="Scontrino medio" value={d.scontrino} delta={d.sDelta} trend={d.sTrend} variant="line"/>
        <KpiRow label={`Coperti ${period}`} value={d.coperti} delta={d.cDelta} trend={d.cTrend} variant="bar"/>
      </div>
      <style>{`
        @keyframes kpi-fade-in {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

function KpiRow({ label, value, delta, trend, variant }) {
  return (
    <div style={{display:'flex', alignItems:'center', gap: 16}}>
      <div style={{flex:'0 0 auto', minWidth: 0}}>
        <div style={{fontSize:11.5, color: PN.MUTED, fontWeight:600, marginBottom: 6, textTransform:'uppercase', letterSpacing: 0.5}}>{label}</div>
        <div style={{display:'flex', alignItems:'baseline', gap: 10}}>
          <div style={{fontSize: 38, fontWeight: 700, color: PN.TEXT, letterSpacing:-0.8, lineHeight: 1}}>{value}</div>
          <div style={{fontSize: 13, color: PN.GREEN, fontWeight: 700}}>{delta}</div>
        </div>
      </div>
      <div style={{flex:1, minWidth: 80, height: 48, display:'flex', alignItems:'flex-end', justifyContent:'flex-end'}}>
        {variant === 'line'
          ? <div style={{width:'100%', maxWidth: 160}}><WSparkline data={trend} color={PN.PINK}/></div>
          : <KpiBars data={trend}/>
        }
      </div>
    </div>
  );
}

function KpiBars({ data }) {
  const max = Math.max(...data);
  const labels = ['L','M','M','G','V','S','D'];
  return (
    <div style={{display:'flex', alignItems:'flex-end', gap: 4, width:'100%', maxWidth: 160, height: 44}}>
      {data.map((v,i) => (
        <div key={i} style={{flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap: 3, height:'100%'}}>
          <div style={{flex:1, width:'100%', display:'flex', alignItems:'flex-end'}}>
            <div style={{
              width:'100%',
              height: `${(v/max)*100}%`, minHeight: 4,
              background: i === data.length-1 ? PN.PINK : PN.PINK_SOFT,
              borderRadius: 2,
            }}/>
          </div>
          <div style={{fontSize: 8.5, color: PN.MUTED, fontWeight: 600}}>{labels[i]}</div>
        </div>
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

  // Layout adattivo: in WIDE (w>=2, h=1) → % grande a sinistra + grafico a
  // destra, side-by-side. In tutti gli altri casi (tall, square, full) →
  // stacked verticale come prima.
  const wW = (size && size.w) || 1;
  const wH = (size && size.h) || 1;
  const sideBySide = wW >= 2 && wH === 1;

  return (
    <div style={{
      display:'flex',
      flexDirection: sideBySide ? 'row' : 'column',
      height:'100%', minHeight: 0,
      gap: sideBySide ? 18 : 14,
      alignItems: sideBySide ? 'stretch' : 'stretch',
    }}>
      {/* Block A: PnPeriodToggle + % grande */}
      <div style={{
        display:'flex', flexDirection:'column',
        gap: 10,
        flexShrink: 0,
        flexBasis: sideBySide ? '38%' : 'auto',
        minWidth: 0,
        justifyContent: sideBySide ? 'center' : 'flex-start',
      }}>
        <PnPeriodToggle period={period} setPeriod={setPeriod}/>
        <div>
          <div style={{fontSize:11, color: PN.MUTED, fontWeight:600, marginBottom: 4, textTransform:'uppercase', letterSpacing: 0.5}}>Riempimento {period}</div>
          <div style={{display:'flex', alignItems:'baseline', gap: sideBySide ? 8 : 14, flexWrap: 'wrap'}}>
            <div style={{fontSize: sideBySide ? 44 : 56, fontWeight: 700, color: PN.TEXT, letterSpacing:-1.2, lineHeight: 1}}>{d.pct}%</div>
            <div style={{fontSize: 14, color: isPos ? PN.GREEN : PN.RED, fontWeight: 700}}>{d.delta}</div>
          </div>
          <div style={{fontSize: 12, color: PN.MUTED, marginTop: 4}}>{d.sub}</div>
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
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom: 10}}>
          <div style={{fontSize:10.5, color: PN.MUTED, fontWeight:600, textTransform:'uppercase', letterSpacing: 0.5}}>Occupazione per fascia oraria</div>
          <div style={{fontSize:10, color: PN.MUTED}}>0–100%</div>
        </div>
        <div style={{flex:1, display:'flex', alignItems:'stretch', gap: 8, paddingTop: 4, position:'relative'}}>
          {/* Gridlines orizzontali */}
          <div style={{position:'absolute', inset:'4px 0 18px 0', display:'flex', flexDirection:'column', justifyContent:'space-between', pointerEvents:'none'}}>
            {[100,50,0].map(v => (
              <div key={v} style={{borderTop:`1px dashed ${PN.BORDER_SOFT}`, position:'relative'}}>
                <span style={{position:'absolute', right: 0, top:-7, fontSize: 9, color: PN.MUTED, background: PN.WHITE, padding:'0 3px'}}>{v}</span>
              </div>
            ))}
          </div>
          {d.fasce.map((f, i) => {
            const colorBar = f.v >= 90 ? PN.PINK : f.v >= 70 ? PN.WINE : f.v >= 50 ? PN.AMBER : PN.MUTED_LIGHT;
            return (
              <div key={i} style={{flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap: 4, position:'relative', zIndex:1}}>
                <div style={{flex:1, width:'100%', display:'flex', flexDirection:'column', justifyContent:'flex-end', alignItems:'center'}}>
                  <div style={{fontSize: 10, fontWeight: 700, color: PN.TEXT, marginBottom: 3}}>{f.v}%</div>
                  <div style={{
                    width: '100%', maxWidth: 26,
                    height: `${(f.v/100)*100}%`, minHeight: 6,
                    background: colorBar,
                    borderRadius: '4px 4px 2px 2px',
                  }}/>
                </div>
                <div style={{fontSize: 10, color: PN.MUTED, fontWeight: 600}}>{f.h}:00</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── 2. Prenotazioni di oggi (lista con timeline) ───────────────────────────

function WidgetPrenotazioniOggi() {
  // Lista più lunga per giustificare l'auto-scroll continuo (overflow vero).
  // tag: chip colorato che vivacizza la riga (compleanno/allergia/vip/walkin/finestra).
  const items = [
    { time: '19:30', name: 'Famiglia Rossi',   covers: 4, table: 'T7',  tag: 'compleanno', note: 'compleanno · torta' },
    { time: '20:00', name: 'Bianchi M.',       covers: 2, table: 'T3' },
    { time: '20:15', name: 'Conte (regular)',  covers: 6, table: 'T12', vip: true },
    { time: '20:30', name: 'Walk-in attesa',   covers: 2, table: '—',   tag: 'walkin' },
    { time: '21:00', name: 'Greco',            covers: 3, table: 'T5' },
    { time: '21:30', name: 'De Luca',          covers: 2, table: 'T9',  tag: 'allergia', note: 'allergia noci' },
    { time: '21:45', name: 'Marini',           covers: 4, table: 'T2' },
    { time: '22:00', name: 'Rinaldi',          covers: 2, table: 'T11', vip: true },
    { time: '22:15', name: 'Esposito',         covers: 5, table: 'T4',  tag: 'finestra', note: 'tavolo finestra' },
  ];

  const tagStyle = {
    compleanno: { bg: '#EDE9FE', fg: '#7C3AED', label: 'Compleanno' },
    allergia:   { bg: '#FEE2E2', fg: '#DC2626', label: 'Allergia' },
    walkin:     { bg: '#FEF3C7', fg: '#92400E', label: 'Walk-in' },
    finestra:   { bg: '#DBEAFE', fg: '#1E40AF', label: 'Finestra' },
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
      <div style={{display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 12, flexShrink: 0}}>
        <div style={{fontSize: 22, fontWeight: 600, color: PN.TEXT, letterSpacing: '-0.02em'}}>23 prenotazioni</div>
        <div style={{fontSize: 12, color: PN.MUTED}}>· 67 coperti · 84% riempimento</div>
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
          margin: '0 -4px', padding: '0 4px',
        }}
      >
        <div style={{
          display: 'flex', flexDirection: 'column', gap: 6,
        }}>
          {/* render duplicato per loop seamless */}
          {[...items, ...items].map((it, i) => {
            const tag = it.tag ? tagStyle[it.tag] : null;
            return (
              <div key={i} style={{
                display: 'grid', gridTemplateColumns: '48px 1fr auto', gap: 12, alignItems: 'center',
                padding: '10px 12px',
                borderRadius: 10,
                background: PN.WHITE,
                border: `1px solid ${PN.BORDER_HAIR}`,
                boxShadow: '0 1px 0 rgba(15, 17, 21, 0.02)',
                flexShrink: 0,
              }}>
                <div style={{fontSize: 13, fontWeight: 600, color: PN.TEXT, fontVariantNumeric: 'tabular-nums'}}>{it.time}</div>
                <div style={{minWidth: 0}}>
                  <div style={{display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 500, color: PN.TEXT, flexWrap: 'wrap'}}>
                    {it.name}
                    {it.vip && (
                      <span style={{
                        fontSize: 9.5, fontWeight: 600, padding: '2px 6px', borderRadius: 999,
                        background: PN.WINE_SOFT, color: PN.WINE,
                        letterSpacing: 0.4,
                      }}>VIP</span>
                    )}
                    {tag && (
                      <span style={{
                        fontSize: 9.5, fontWeight: 600, padding: '2px 7px', borderRadius: 999,
                        background: tag.bg, color: tag.fg,
                        letterSpacing: 0.2,
                      }}>{tag.label}</span>
                    )}
                  </div>
                  {it.note && <div style={{fontSize: 11.5, color: PN.MUTED, marginTop: 2}}>{it.note}</div>}
                </div>
                <div style={{display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: PN.MUTED, fontWeight: 600}}>
                  <Icon name="people-customer" size={12} color={PN.MUTED}/> {it.covers} · {it.table}
                </div>
              </div>
            );
          })}
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

// ─── 3. Tavoli stato ────────────────────────────────────────────────────────

function WidgetTavoliStato() {
  // Stessi stati di Sala: libero | prenotato | occupato | dapulire
  const tables = [
    { id:'T1', s:'libero' },
    { id:'T2', s:'occupato', t:'45m' },
    { id:'T3', s:'occupato', t:'12m' },
    { id:'T4', s:'prenotato', t:'20:30' },
    { id:'T5', s:'prenotato', t:'21:00' },
    { id:'T6', s:'occupato', t:'1h10' },
    { id:'T7', s:'occupato', t:'48m' },
    { id:'T8', s:'libero' },
    { id:'T9', s:'occupato', t:'12m' },
    { id:'T10', s:'prenotato', t:'20:45' },
    { id:'T11', s:'dapulire' },
    { id:'T12', s:'libero' },
  ];
  // Palette allineata a Sala
  const colors = {
    libero:    { bg:'#F4F5F7',     fg: PN.MUTED,     label:'Libero' },
    occupato:  { bg:'#FFE0DD',     fg: PN.PINK_DARK, label:'Occupato' },
    prenotato: { bg: PN.BLUE_SOFT, fg: PN.BLUE,      label:'Prenotato' },
    dapulire:  { bg: PN.PURPLE_SOFT, fg: PN.PURPLE,  label:'Da pulire' },
  };
  const occupati = tables.filter(t => t.s === 'occupato').length;

  return (
    <div style={{display:'flex', flexDirection:'column', height:'100%', minHeight: 0}}>
      <div style={{display:'flex', alignItems:'baseline', gap: 10, marginBottom: 10, flexShrink: 0}}>
        <div style={{fontSize: 22, fontWeight: 700, color: PN.TEXT, letterSpacing:-0.4}}>{occupati}/{tables.length} occupati</div>
        <div style={{fontSize: 12, color: PN.MUTED}}>Sala principale</div>
      </div>

      {/* Grid auto-fill: in 660px ~10 col, in 330px ~5 col. Tile più
          piccoli per stare anche in 1×1. flex:1 + minHeight:0 + overflow-y
          auto consentono scroll quando l'altezza non basta a mostrare
          tutti i 12 tavoli (wide 2×1 → solo 1-2 righe visibili). */}
      <div style={{
        flex: 1, minHeight: 0, overflowY: 'auto',
        display:'grid',
        gridTemplateColumns:'repeat(auto-fill, minmax(54px, 1fr))',
        gridAutoRows: 'min-content',
        gap: 6, marginBottom: 10,
      }}>
        {tables.map(t => {
          const c = colors[t.s];
          return (
            <div key={t.id} style={{
              padding: '8px 6px',
              background: c.bg,
              borderRadius: 7,
              textAlign:'center',
              minHeight: 42,
              display:'flex', flexDirection:'column', justifyContent:'center',
            }}>
              <div style={{fontSize: 12, fontWeight: 700, color: c.fg, lineHeight: 1.2}}>{t.id}</div>
              {t.t && <div style={{fontSize: 10, color: c.fg, fontWeight: 500, opacity: 0.85, lineHeight: 1.2, marginTop: 1}}>{t.t}</div>}
            </div>
          );
        })}
      </div>

      <div style={{
        display:'flex', flexWrap:'wrap', gap: 8,
        flexShrink: 0,
        paddingTop: 8, borderTop:`1px solid ${PN.BORDER_SOFT}`,
      }}>
        {Object.entries(colors).map(([k, c]) => (
          <div key={k} style={{display:'flex', alignItems:'center', gap: 5, fontSize: 11, color: PN.MUTED, whiteSpace: 'nowrap'}}>
            <span style={{width: 8, height: 8, borderRadius: 2, background: c.fg}}/>
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
      <div style={{display:'flex', alignItems:'baseline', gap: 10, marginBottom: 14}}>
        <div style={{fontSize: 15, fontWeight: 700, color: '#F5F5F7'}}>Top piatti questa settimana</div>
      </div>
      {/* Lista responsive: ogni dish ha flex:1 0 auto + minHeight → gli item
          crescono uniformemente quando il widget è alto (h≥2), restano compatti
          quando il widget è 1×1 con scroll se servono.
          gap proporzionale: più aria tra dish in widget grande. */}
      <div style={{flex:1, display:'flex', flexDirection:'column', gap: 10, minHeight: 0, overflowY: 'auto'}}>
        {dishes.map((d, i) => (
          <div key={i} style={{
            flex: '1 0 auto',
            minHeight: 38,
            display:'flex', flexDirection:'column', justifyContent:'center',
            gap: 5,
          }}>
            <div style={{display:'flex', justifyContent:'space-between'}}>
              <div style={{display:'flex', alignItems:'center', gap: 8, fontSize:13, color: '#F5F5F7', fontWeight: 600}}>
                <span style={{
                  width: 18, height: 18, borderRadius: 5,
                  background: i === 0 ? '#FF6066' : 'rgba(255,255,255,0.08)',
                  color: i === 0 ? '#fff' : 'rgba(255,255,255,0.70)',
                  display:'grid', placeItems:'center',
                  fontSize: 10.5, fontWeight: 700,
                  boxShadow: i === 0 ? '0 0 10px rgba(255, 96, 102, 0.50)' : 'inset 0 0 0 1px rgba(255,255,255,0.10)',
                  flexShrink: 0,
                }}>{i+1}</span>
                {d.name}
              </div>
              <div style={{display:'flex', alignItems:'center', gap: 8, fontSize: 12}}>
                <span style={{color: 'rgba(255,255,255,0.55)'}}>{d.sales}× · </span>
                <span style={{color: '#F5F5F7', fontWeight: 600}}>€{d.rev.toLocaleString('it')}</span>
                <span style={{color: d.up ? '#86EFAC' : '#FCA5A5', fontWeight: 600, minWidth: 36, textAlign:'right'}}>{d.trend}</span>
              </div>
            </div>
            <div style={{height: 4, background:'rgba(255,255,255,0.08)', borderRadius: 99, overflow:'hidden'}}>
              <div style={{height:'100%', width: `${(d.sales/max)*100}%`, background: i === 0 ? '#FF6066' : 'rgba(255,255,255,0.30)', borderRadius: 99, boxShadow: i === 0 ? '0 0 8px rgba(255, 96, 102, 0.40)' : 'none'}}/>
            </div>
          </div>
        ))}
      </div>
    </GlassDarkBox>
  );
}

// ─── 5. Recensioni recenti ──────────────────────────────────────────────────

function WidgetRecensioni() {
  const reviews = [
    { name: 'Laura M.', stars: 5, when:'2h fa', text:'Cacio e pepe stellare, servizio impeccabile. Torneremo!', source:'Google' },
    { name: 'Andrea P.', stars: 4, when:'5h fa', text:'Tutto buono, ma sala un po\' rumorosa di sabato sera.', source:'TheFork' },
    { name: 'Sofia R.', stars: 5, when:'1g fa', text:'Personale gentilissimo, tagliata cotta perfetta. Top.', source:'Google' },
  ];

  return (
    <div style={{display:'flex', flexDirection:'column', height:'100%'}}>
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: 12}}>
        <div>
          <div style={{fontSize: 15, fontWeight: 700, color: PN.TEXT}}>Recensioni recenti</div>
          <div style={{display:'flex', alignItems:'center', gap: 6, marginTop: 4}}>
            <div style={{display:'flex', gap: 2}}>
              {[1,2,3,4,5].map(i => (
                <Icon name="star" key={i} size={13} color={i <= 4 ? '#F59E0B' : '#E5E7EB'}/>
              ))}
            </div>
            <span style={{fontSize: 13, fontWeight: 700, color: PN.TEXT}}>4,7</span>
            <span style={{fontSize: 12, color: PN.MUTED}}>· 312 recensioni</span>
          </div>
        </div>
        <div style={{
          fontSize: 11, fontWeight: 600, color: PN.GREEN,
          background: PN.GREEN_SOFT, padding: '4px 8px', borderRadius: 6,
        }}>+8 questa settimana</div>
      </div>

      <div style={{flex:1, display:'flex', flexDirection:'column', gap: 10, minHeight: 0, overflow:'auto'}}>
        {reviews.map((r,i) => (
          // Soft-glass tile per ogni recensione: warm tint + specular highlight
          // + lift on hover. Pattern tipo B. flex:1 0 auto + minHeight per
          // distribuire l'altezza uniformemente quando widget è alto.
          <div key={i} className="glass-lift-hover" style={{
            flex: '1 0 auto',
            minHeight: 64,
            display: 'flex', flexDirection: 'column', justifyContent: 'center',
            padding: 12, borderRadius: 10,
            background: 'rgba(255, 245, 248, 0.55)',
            backgroundImage:
              'linear-gradient(to bottom, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.10) 45%, rgba(255,255,255,0) 100%)',
            backdropFilter: 'blur(12px) saturate(160%)',
            WebkitBackdropFilter: 'blur(12px) saturate(160%)',
            boxShadow:
              'inset 0 1px 0 rgba(255,255,255,0.70), ' +
              'inset 0 0 0 1px rgba(242, 107, 122, 0.08), ' +
              '0 1px 2px rgba(15, 17, 21, 0.03)',
          }}>
            <div style={{display:'flex', alignItems:'center', gap: 8, marginBottom: 5}}>
              <div style={{fontSize: 12.5, fontWeight: 600, color: PN.TEXT}}>{r.name}</div>
              <div style={{display:'flex', gap: 1}}>
                {[1,2,3,4,5].map(i => (
                  <Icon name="star" key={i} size={10} color={i <= r.stars ? '#F59E0B' : '#E5E7EB'}/>
                ))}
              </div>
              <div style={{fontSize: 11, color: PN.MUTED, marginLeft:'auto'}}>{r.when} · {r.source}</div>
            </div>
            <div style={{fontSize: 12.5, color: PN.TEXT, lineHeight: 1.5}}>{r.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 6. Azioni rapide ───────────────────────────────────────────────────────

function WidgetAzioni({ size }) {
  // 8 shortcut "app launcher" desktop. Layout adattivo in 2 modalità:
  //  • FULL banner (w=4, h=2): grid fissa 4×2 con icona + LABEL — il
  //    pattern "homepage premium". 4 sopra + 4 sotto, come Launchpad.
  //  • Tutto il resto (w=1/2, qualunque h, o w=4 con h=1): grid auto-fit
  //    SOLO icone, niente label. Le shortcut diventano una toolbar compatta
  //    quando il widget è ridotto.
  const actions = [
    { label: 'Nuova prenotazione', icon: 'time-calendar',       color: '#FB7185' },
    { label: 'Aggiungi piatto',    icon: 'food-meal',           color: '#F472B6' },
    { label: 'Apri cassa',         icon: 'commerce-wallet',     color: '#34D399' },
    { label: 'Stampa QR tavolo',   icon: 'place-table',         color: '#60A5FA' },
    { label: 'Invita staff',       icon: 'people-staff-group',  color: '#A78BFA' },
    { label: 'Fine turno',         icon: 'time-history',        color: '#FBBF24' },
    { label: 'Esporta giornaliero',icon: 'download',            color: '#22D3EE' },
    { label: 'Promo flash',        icon: 'sparkles',            color: '#FF6066' },
  ];

  const w = (size && size.w) || 1;
  const h = (size && size.h) || 1;
  const isFullBanner = w === 4 && h === 2;
  const showLabels = isFullBanner;

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
      <div style={{display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom: 12, flexShrink: 0}}>
        <div style={{fontSize: 15, fontWeight: 700, color: '#F5F5F7', letterSpacing:'-0.01em'}}>
          Azioni rapide
        </div>
        <div style={{fontSize: 11.5, color: 'rgba(255,255,255,0.50)'}}>
          {actions.length} shortcut
        </div>
      </div>

      <div style={{
        flex: 1, minHeight: 0, overflowY: 'auto',
        display: 'grid',
        gridTemplateColumns: isFullBanner
          ? 'repeat(4, 1fr)'
          : 'repeat(auto-fit, minmax(54px, 1fr))',
        gridTemplateRows: isFullBanner ? 'repeat(2, 1fr)' : 'none',
        gridAutoRows: isFullBanner ? undefined : 'minmax(54px, 1fr)',
        gap: isFullBanner ? 10 : 6,
        alignContent: 'start',
      }}>
        {actions.map((a, i) => (
          <button key={i}
            className="glass-lift-hover"
            title={a.label}
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
                fontSize: 10.5, fontWeight: 600, textAlign: 'center', lineHeight: 1.2,
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

function WidgetCopertiSettimana() {
  const days = [
    {d:'L', v:38}, {d:'M', v:42}, {d:'M', v:51}, {d:'G', v:67, today:true},
    {d:'V', v:0, future:true}, {d:'S', v:0, future:true}, {d:'D', v:0, future:true},
  ];
  const max = Math.max(...days.map(d=>d.v), 80);
  return (
    <div style={{display:'flex', flexDirection:'column', height:'100%'}}>
      <WMetric label="Coperti questa settimana" value="198" sub="prev. fine sett: 412" trend="+11%"/>
      <div style={{flex:1, display:'flex', alignItems:'flex-end', gap: 8, marginTop: 18, paddingBottom: 24, position:'relative'}}>
        {days.map((d,i) => (
          <div key={i} style={{flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap: 6}}>
            <div style={{
              fontSize: 10.5, color: d.today ? PN.PINK_DARK : PN.MUTED,
              fontWeight: d.today ? 700 : 600,
              opacity: d.future ? 0 : 1,
            }}>{d.v || ''}</div>
            <div style={{
              width: '100%', height: d.future ? 6 : `${(d.v/max)*100}%`, minHeight: 6,
              background: d.today ? PN.PINK : d.future ? '#F0F2F5' : '#D4D6DB',
              borderRadius: 4,
              border: d.future ? `1px dashed ${PN.MUTED_LIGHT}` : 'none',
            }}/>
            <div style={{fontSize: 11, color: d.today ? PN.PINK_DARK : PN.MUTED, fontWeight: d.today ? 700 : 500, position:'absolute', bottom: 0, left:`calc(${i*100/7}% + ${100/14}%)`, transform:'translateX(-50%)'}}>{d.d}</div>
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
  const orders = [
    { table: '7',  items: 3, time: "8' 20\"",  status: 'amber', label: 'In prep' },
    { table: '12', items: 2, time: "2' 10\"",  status: 'green', label: 'Pronto' },
    { table: '3',  items: 5, time: "12' 40\"", status: 'red',   label: 'Ritardo' },
    { table: '9',  items: 4, time: "6' 45\"",  status: 'amber', label: 'In prep' },
    { table: '14', items: 1, time: "1' 30\"",  status: 'green', label: 'Pronto' },
    { table: '5',  items: 3, time: "4' 10\"",  status: 'green', label: 'Pronto' },
    { table: '11', items: 6, time: "10' 15\"", status: 'red',   label: 'Ritardo' },
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
        marginBottom: 4,
      }}>
        <span style={{
          fontSize: 13, fontWeight: 600, color: '#F3F4F6',
          letterSpacing: '-0.01em',
        }}>Cucina · live</span>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          fontSize: 11, fontWeight: 500, color: '#9CA3AF',
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: 999, background: '#F87171',
          }}/>
          {orders.length} in coda
        </span>
      </div>

      {/* Rows — kitchen-row del preview, padding 8/10, radius 9, gap 6 tra righe */}
      <div style={{
        display: 'flex', flexDirection: 'column', gap: 6,
        flex: 1, minHeight: 0, overflowY: 'auto', marginTop: 4,
      }}>
        {orders.map((o, i) => {
          const s = statusStyles[o.status];
          return (
            <div key={i} style={{
              display: 'grid', gridTemplateColumns: 'auto 1fr auto',
              gap: 10, alignItems: 'center',
              padding: '8px 10px', borderRadius: 9,
              background: 'rgba(255, 255, 255, 0.06)',
              boxShadow:
                'inset 0 1px 0 rgba(255, 255, 255, 0.10), ' +
                'inset 0 0 0 1px rgba(255, 255, 255, 0.06)',
            }}>
              <span style={{
                fontSize: 12, fontWeight: 700,
                fontVariantNumeric: 'tabular-nums',
                color: '#F3F4F6',
                background: 'rgba(255, 255, 255, 0.10)',
                padding: '2px 7px', borderRadius: 6,
                minWidth: 22, textAlign: 'center',
              }}>{o.table}</span>
              <span style={{fontSize: 11.5, color: '#9CA3AF'}}>
                {o.items} portate · <span style={{color: s.fg, fontWeight: 600, fontVariantNumeric: 'tabular-nums'}}>{o.time}</span>
              </span>
              <span style={{
                fontSize: 10, fontWeight: 700,
                padding: '2px 7px', borderRadius: 5,
                letterSpacing: '0.02em',
                background: s.bg, color: s.fg,
              }}>{o.label}</span>
            </div>
          );
        })}
      </div>
    </GlassDarkBox>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// WidgetFinancials — UNIONE di Incassi + Scontrino medio + Coperti.
// Auto-switch oggi → settimana → mese ogni 2.4s. Layout: incasso totale (top
// con sparkline animata) + 2 mini-card laterali (scontrino + coperti).
// Pause-on-hover comune. Pattern Apple "live activity": tutto scorre insieme.
// ─────────────────────────────────────────────────────────────────────────

function WidgetFinancials() {
  const [period, setPeriod] = React.useState('oggi');
  const [paused, setPaused] = React.useState(false);
  const periods = ['oggi', 'settimana', 'mese'];

  React.useEffect(() => {
    if (paused) return;
    const t = setInterval(() => {
      setPeriod(p => periods[(periods.indexOf(p) + 1) % periods.length]);
    }, 2400);
    return () => clearInterval(t);
  }, [paused]);

  const data = {
    oggi: {
      total: '€ 1.247', trend: '+18%', sub: 'vs media giovedì',
      spark: [12, 28, 45, 78, 92, 64, 38, 22, 18, 35, 88, 142, 178, 165, 198, 152],
      scontrino: '€ 29,70', sDelta: '+€ 0,80',
      coperti: '42', cDelta: '+5%',
    },
    settimana: {
      total: '€ 8.420', trend: '+12%', sub: 'vs settimana scorsa',
      spark: [620, 740, 580, 1100, 880, 1340, 1820, 1247, 968, 1450, 1180, 1620],
      scontrino: '€ 31,90', sDelta: '+€ 1,10',
      coperti: '264', cDelta: '+9%',
    },
    mese: {
      total: '€ 24.380', trend: '+11%', sub: 'vs mese scorso',
      spark: [380, 480, 320, 690, 540, 840, 720, 1100, 980, 1340, 1180, 1620, 1480, 1820, 2100, 1820, 2280, 1980],
      scontrino: '€ 32,40', sDelta: '+€ 1,20',
      coperti: '753', cDelta: '+8%',
    },
  };
  const d = data[period];

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      style={{display: 'flex', flexDirection: 'column', height: '100%', gap: 12}}
    >
      <PnPeriodToggle period={period} setPeriod={(p) => { setPeriod(p); setPaused(true); }}/>

      {/* Top: incassi + sparkline animata */}
      <div key={period + '-top'} style={{
        animation: 'fin-fade-in 320ms ease-out',
      }}>
        <div style={{fontSize: 11, color: PN.MUTED, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 4}}>
          Incassi {period}
        </div>
        <div style={{display: 'flex', alignItems: 'baseline', gap: 10}}>
          <span style={{fontSize: 30, fontWeight: 600, color: PN.TEXT, lineHeight: 1, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums'}}>
            {d.total}
          </span>
          <span style={{fontSize: 12, color: PN.GREEN, fontWeight: 600}}>{d.trend}</span>
          <span style={{fontSize: 11, color: PN.MUTED, marginLeft: 'auto'}}>{d.sub}</span>
        </div>
        <div style={{marginTop: 8, height: 56, overflow: 'hidden', borderRadius: 8}}>
          <WSparkline data={d.spark} color={PN.PINK} animated/>
        </div>
      </div>

      {/* Bottom: 2 mini-card scontrino + coperti */}
      <div key={period + '-bot'} style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10,
        animation: 'fin-fade-in 320ms ease-out 60ms both',
        marginTop: 'auto',
      }}>
        <FinMiniCard label="Scontrino" value={d.scontrino} delta={d.sDelta}/>
        <FinMiniCard label={`Coperti ${period}`} value={d.coperti} delta={d.cDelta}/>
      </div>

      <style>{`
        @keyframes fin-fade-in {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

function FinMiniCard({label, value, delta}) {
  return (
    <div style={{
      padding: '10px 12px',
      background: PN.WHITE_OFF,
      border: `1px solid ${PN.BORDER_HAIR}`,
      borderRadius: 10,
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6)',
    }}>
      <div style={{fontSize: 10.5, color: PN.MUTED, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 4}}>
        {label}
      </div>
      <div style={{display: 'flex', alignItems: 'baseline', gap: 6}}>
        <span style={{
          fontSize: 17, fontWeight: 600, color: PN.TEXT, lineHeight: 1,
          letterSpacing: '-0.01em', fontVariantNumeric: 'tabular-nums',
        }}>{value}</span>
        <span style={{fontSize: 11, color: PN.GREEN, fontWeight: 600}}>{delta}</span>
      </div>
    </div>
  );
}

window.PnWidgets = {
  WidgetFinancials,
  WidgetIncassi, WidgetKpiVendita, WidgetRiempimento,
  WidgetPrenotazioniOggi, WidgetTavoliStato, WidgetTopPiatti,
  WidgetRecensioni, WidgetAzioni, WidgetCopertiSettimana,
  WidgetCucinaLive,
};
