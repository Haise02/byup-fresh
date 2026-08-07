// Stat shared atoms — redesign UX/UI

// ─── Delta pill (atomic, no wrap) ──────────────────────────────
function StatDelta({ value, size = 'sm' }) {
  if (value == null) return null;
  const up = value >= 0;
  const px = size === 'lg' ? '4px 10px' : '2px 8px';
  const fs = size === 'lg' ? 12 : 11;
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', gap: 3,
      padding: px, borderRadius: 999,
      background: up ? PN.GREEN_SOFT : PN.RED_SOFT,
      color: up ? PN.GREEN : PN.RED,
      fontSize: fs, fontWeight: 700,
      whiteSpace:'nowrap', flexShrink: 0,
      fontVariantNumeric:'tabular-nums',
    }}>
      <span style={{fontSize: fs - 1}}>{up ? '↑' : '↓'}</span>
      {Math.abs(value).toFixed(1)}%
    </span>
  );
}

// ─── Sparkline minimale ────────────────────────────────────────
// `stretch`: invece di una misura fissa riempie il contenitore, in larghezza e
// in altezza — width/height restano solo il sistema di coordinate interno.
// La linea non si ingrassa perché lo stroke è dichiarato non-scaling; `padY`
// tiene il minimo e il massimo staccati dai bordi, così la linea non striscia
// sul filo quando il grafico va a filo della card.
function StatSpark({ data, color = PN.PINK, height = 28, width = 90, stretch = false, padY = 0, stroke = 1.5 }) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const utile = height - padY * 2;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = (height - padY) - ((v - min) / range) * utile;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  // area path
  const areaPts = `0,${height} ${pts} ${width},${height}`;
  const id = React.useId();
  return (
    <svg
      width={stretch ? undefined : width} height={stretch ? undefined : height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio={stretch ? 'none' : undefined}
      style={stretch ? {display:'block', width:'100%', height:'100%'} : {display:'block'}}>
      <defs>
        <linearGradient id={`sg-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <polygon points={areaPts} fill={`url(#sg-${id})`}/>
      <polyline points={pts} fill="none" stroke={color} strokeWidth={stroke}
        strokeLinecap="round" strokeLinejoin="round"
        vectorEffect={stretch ? 'non-scaling-stroke' : undefined}/>
    </svg>
  );
}

// ─── Hover dei box ─────────────────────────────────────────────
// Crescono di un soffio e si staccano dal foglio. L'1,5% è deliberato: di più
// e, in griglia a filo, si vede il box spingere quello accanto. La transizione
// è corta perché sopra i 200ms il movimento sembra molle.
const BOX_TRANSITION = 'transform 150ms ease, box-shadow 150ms ease';
const boxHover = {
  onMouseEnter: e => {
    e.currentTarget.style.transform = 'scale(1.015)';
    e.currentTarget.style.boxShadow = PN.CARD_SHADOW_HOVER;
  },
  onMouseLeave: e => {
    e.currentTarget.style.transform = '';
    e.currentTarget.style.boxShadow = '';
  },
};

// ─── KPI col fondo sfumato ─────────────────────────────────────
// Pastiglia tonda a sinistra, etichetta e delta sulla prima riga, il numero
// grande col suo sottotitolo e l'andamento a destra. Sfumatura a 115°, dalla
// tinta piena in alto a sinistra al bianco in basso a destra, bordo intonato,
// e il bollino dell'icona BIANCO: su un fondo colorato è il bianco a
// staccarsi, non il colore.
const STAT_TONI = {
  verde:  { forte: PN.GREEN, bg:'linear-gradient(115deg, #E6F6EC 0%, #F5FBF7 52%, #FFFFFF 100%)', bordo:'#CFEBD9' },
  rosa:   { forte: PN.PINK,  bg:'linear-gradient(115deg, #FFE6E5 0%, #FFF6F5 52%, #FFFFFF 100%)', bordo:'#FBD3D1' },
  blu:    { forte: PN.BLUE,  bg:'linear-gradient(115deg, #E3ECFC 0%, #F4F8FE 52%, #FFFFFF 100%)', bordo:'#CCDBF6' },
  // Giallo scritto a mano: PN ha solo AMBER (#D97706), che a schermo vira
  // all'arancio. Questo resta leggibile anche a due pixel di linea.
  giallo: { forte: '#CA8A04', bg:'linear-gradient(115deg, #FAF0CD 0%, #FDF9EB 52%, #FFFFFF 100%)', bordo:'#EFDFAC' },
  viola:  { forte: PN.PURPLE, bg:'linear-gradient(115deg, #EDE9FE 0%, #F7F5FF 52%, #FFFFFF 100%)', bordo:'#DDD5FB' },
};

// `glifo` invece di `icona` dove il simbolo È il concetto: per «margine» e
// «ricavo» un % e un € si leggono all'istante, mentre il set non ha una
// percentuale e il ripiego (il cartellino sconto) diceva un'altra cosa.
function StatKpiTinto({ tono, icona, glifo, label, valore, suffisso, sub, delta, trend, compatto }) {
  const t = STAT_TONI[tono] || STAT_TONI.rosa;

  // `compatto`: stessa card, ma l'etichetta si prende tutta la riga e il delta
  // scende accanto al numero. Serve quando le card sono quattro invece di tre:
  // in quattro colonne, a 1280, all'etichetta restano 72px con la pillola di
  // fianco — misurati — e si troncano tutte, anche accorciandole. L'andamento
  // per lo stesso motivo passa in fondo a tutta larghezza.
  if (compatto) {
    // Stessa impaginazione della variante piena — pastiglia a sinistra,
    // etichetta e pillola sulla stessa riga con la pillola all'estrema destra
    // — solo più stretta, perché qui le card sono quattro invece di tre.
    // Pastiglia 38 invece di 44, etichetta 14 invece di 15 e pillola
    // asciugata: sono i pixel che servono perché il nome ci stia accanto al
    // delta anche a 1280, dove alla riga restano 151px in tutto.
    return (
      <div {...boxHover} style={{
        display:'flex', alignItems:'center', gap: 10, minWidth: 0,
        padding: 14, borderRadius: 16,
        background: t.bg, border: `1px solid ${t.bordo}`,
        transition: BOX_TRANSITION,
      }}>
        <span style={{
          width: 38, height: 38, borderRadius:'50%', flexShrink: 0,
          background: PN.WHITE, color: t.forte,
          display:'grid', placeItems:'center',
          boxShadow:'0 1px 3px rgba(15,17,21,0.08)',
        }}>{glifo
          ? <span style={{fontSize: 19, fontWeight: 700, lineHeight: 1}}>{glifo}</span>
          : <Icon name={icona} size={19}/>}</span>

        <div style={{flex: 1, minWidth: 0}}>
          {/* Divario di 6 e non 8: «Occupazione» a 1280 ne chiede 90 e ne
              aveva 89. Due pixel, ma sono la differenza fra un nome intero e
              un nome coi puntini. */}
          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap: 6}}>
            <span title={label} style={{
              fontSize: 14, color: PN.MUTED, fontWeight: 500, minWidth: 0,
              whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis',
            }}>{label}</span>
            <span style={{
              display:'inline-flex', alignItems:'center', gap: 2,
              padding:'2px 6px', borderRadius: 999, flexShrink: 0,
              background: delta >= 0 ? PN.GREEN_SOFT : PN.RED_SOFT,
              color: delta >= 0 ? PN.GREEN : PN.RED,
              fontSize: 10.5, fontWeight: 700, whiteSpace:'nowrap',
              fontVariantNumeric:'tabular-nums',
            }}>
              <span style={{fontSize: 9.5}}>{delta >= 0 ? '↑' : '↓'}</span>
              {Math.abs(delta).toFixed(1)}%
            </span>
          </div>
          {/* L'andamento accanto al numero, non sotto: sulla riga del numero
              restano 64px anche nella card più piena (misurati a 1280), e
              sono lo spazio che una linea piccola chiede. Il sottotitolo sotto
              resta a larghezza intera, quindi va a capo come prima e la card
              non cambia forma. */}
          <div style={{display:'flex', alignItems:'flex-end', justifyContent:'space-between', gap: 8, minWidth: 0}}>
            <div style={{
              fontSize: 25, fontWeight: 700, color: PN.TEXT, letterSpacing: -0.5,
              lineHeight: 1.15, marginTop: 2, whiteSpace:'nowrap',
              fontVariantNumeric:'tabular-nums',
            }}>
              {valore}{suffisso && <span style={{fontSize: 15, fontWeight: 600, color: PN.MUTED, marginLeft: 1}}>{suffisso}</span>}
            </div>
            {trend && trend.length > 1 && (
              <span style={{flexShrink: 0, opacity: 0.9, marginBottom: 2}}>
                <StatSpark data={trend} color={t.forte} width={54} height={22}/>
              </span>
            )}
          </div>
          <div style={{fontSize: 12.5, color: PN.MUTED, marginTop: 2, lineHeight: 1.3}}>{sub}</div>
        </div>
      </div>
    );
  }

  return (
    <div {...boxHover} style={{
      display:'flex', alignItems:'center', gap: 12, minWidth: 0,
      padding: 15, borderRadius: 16,
      background: t.bg, border: `1px solid ${t.bordo}`,
      transition: BOX_TRANSITION,
    }}>
      <span style={{
        width: 44, height: 44, borderRadius:'50%', flexShrink: 0,
        background: PN.WHITE, color: t.forte,
        display:'grid', placeItems:'center',
        boxShadow:'0 1px 3px rgba(15,17,21,0.08)',
      }}>{glifo
        ? <span style={{fontSize: 21, fontWeight: 700, lineHeight: 1}}>{glifo}</span>
        : <Icon name={icona} size={21}/>}</span>

      <div style={{flex: 1, minWidth: 0}}>
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap: 8}}>
          <span title={label} style={{
            fontSize: 15, color: PN.MUTED, fontWeight: 500, minWidth: 0,
            whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis',
          }}>{label}</span>
          <StatDelta value={delta}/>
        </div>
        <div style={{display:'flex', alignItems:'flex-end', justifyContent:'space-between', gap: 12, minWidth: 0}}>
          <div style={{minWidth: 0}}>
            <div style={{
              fontSize: 28, fontWeight: 700, color: PN.TEXT, letterSpacing: -0.6,
              lineHeight: 1.15, marginTop: 2, whiteSpace:'nowrap',
              fontVariantNumeric:'tabular-nums',
            }}>
              {valore}{suffisso && <span style={{fontSize: 16, fontWeight: 600, color: PN.MUTED, marginLeft: 1}}>{suffisso}</span>}
            </div>
            {/* Va a capo invece di troncarsi: in colonna stretta la
                sottodicitura non ci sta su una riga sola. */}
            <div style={{fontSize: 14, color: PN.MUTED, marginTop: 2, lineHeight: 1.35}}>{sub}</div>
          </div>
          {trend && trend.length > 1 && <StatSpark data={trend} color={t.forte} width={82} height={32}/>}
        </div>
      </div>
    </div>
  );
}

// ─── Ciambella ─────────────────────────────────────────────────
// Una sola per tutte le distribuzioni della sezione. Lo spicchio puntato
// cresce con una scala CSS attorno al centro — l'attributo `d` di un path non
// si anima, la trasformazione sì — e resta l'unico a colore pieno: gli altri
// scendono al 40%. Al 7% l'anello arriva a 151 dei 156 del viewBox, quindi ci
// sta senza allargarlo.
// Lo stato dell'evidenziazione sta FUORI: la legenda la disegna chi chiama —
// ogni card mostra colonne diverse — e deve potersi accendere in coppia.
function StatDonut({ voci, attivo, onAttivo, centro, buco = 39, larghezza = '40%', maxLarghezza = 204 }) {
  // Sempre un anello, mai uno spicchio pieno: il testo al centro ha bisogno
  // del buco per essere leggibile, e su una torta piena finisce sul colore.
  const tot = voci.reduce((s, v) => s + v.valore, 0) || 1;
  const R = 68, C = 78;
  let cum = 0;
  const archi = voci.map(v => {
    const a0 = (cum / tot) * 2 * Math.PI - Math.PI/2; cum += v.valore;
    const a1 = (cum / tot) * 2 * Math.PI - Math.PI/2;
    const big = (v.valore / tot) > 0.5 ? 1 : 0;
    const px = (r, a) => `${C + r*Math.cos(a)},${C + r*Math.sin(a)}`;
    const d = `M ${px(R,a0)} A ${R} ${R} 0 ${big} 1 ${px(R,a1)} L ${px(buco,a1)} A ${buco} ${buco} 0 ${big} 0 ${px(buco,a0)} Z`;
    return { ...v, d };
  });
  const acceso = attivo != null ? voci.find(v => v.id === attivo) : null;

  return (
    <svg viewBox="0 0 156 156" onMouseLeave={() => onAttivo && onAttivo(null)}
      style={{width: larghezza, minWidth: 128, maxWidth: maxLarghezza, height:'auto', flexShrink: 0}}>
      {archi.map(a => (
        <path key={a.id} d={a.d} fill={a.colore} stroke={PN.WHITE} strokeWidth={2.5} strokeLinejoin="round"
          onMouseEnter={() => onAttivo && onAttivo(a.id)}
          style={{
            transformOrigin: `${C}px ${C}px`,
            transform: attivo === a.id ? 'scale(1.07)' : 'scale(1)',
            opacity: attivo == null || attivo === a.id ? 1 : 0.4,
            transition:'transform 160ms ease, opacity 160ms ease',
          }}/>
      ))}
      {centro && (
        <>
          {/* Al centro il totale, e sotto il mouse la voce puntata: è il posto
              dove l'occhio è già, e non serve un riquadro che entra ed esce. */}
          <text x={C} y={C - 5} textAnchor="middle" fontSize="11.5"
            fill={acceso ? acceso.colore : PN.MUTED}>
            {acceso ? acceso.label : centro.et}
          </text>
          <text x={C} y={C + 14} textAnchor="middle" fontSize="16" fontWeight="700" fill={PN.TEXT}>
            {acceso ? (acceso.centro != null ? acceso.centro : acceso.valore) : centro.val}
          </text>
        </>
      )}
    </svg>
  );
}

// ─── KPI base — varianti tipologiche ───────────────────────────
// variant: 'default' | 'currency' | 'percent' | 'count'
function StatKpi({ label, value, sub, delta, suffix, spark, sparkColor, variant = 'default', target, glass = false }) {
  // Variante "glass": solo per la card hero scelta (1 sola in Statistiche).
  // Light-coral gradient + testo wine-dark per leggibilità.
  if (glass) {
    return (
      <GlassDarkBox
        borderRadius={14}
        padding={16}
        liftHover
        style={{
          flex: 1, minWidth: 0,
          display:'flex', flexDirection:'column', gap: 10,
        }}>
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap: 8, minHeight: 18}}>
          <div style={{fontSize: 14.5, color: 'rgba(58, 10, 14, 0.65)', fontWeight: 500, letterSpacing: 0.1, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{label}</div>
          <StatDelta value={delta}/>
        </div>
        <div style={{display:'flex', alignItems:'flex-end', justifyContent:'space-between', gap: 12, minWidth: 0}}>
          <div style={{
            fontSize: 32, fontWeight: 700, color: '#3A0A0E',
            letterSpacing: -0.6, fontVariantNumeric:'tabular-nums',
            lineHeight: 1, minWidth: 0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
          }}>
            {value}{suffix && <span style={{fontSize: 16, color: '#7C2D3C', marginLeft: 4, fontWeight: 600}}>{suffix}</span>}
          </div>
          {spark && spark.length > 1 && (
            <StatSpark data={spark} color={sparkColor || (delta >= 0 ? PN.GREEN : PN.RED)}/>
          )}
        </div>
        {variant === 'percent' && typeof value === 'string' && (
          <div style={{height: 4, background: 'rgba(124, 45, 60, 0.18)', borderRadius: 999, overflow:'hidden'}}>
            <div style={{
              height:'100%', width: value.replace(/[^0-9.]/g,'') + '%',
              background: '#7C2D3C', borderRadius: 999,
            }}/>
          </div>
        )}
        {target && (
          <div style={{fontSize: 14, color: 'rgba(58, 10, 14, 0.55)', display:'flex', justifyContent:'space-between'}}>
            <span>obiettivo</span>
            <strong style={{color: '#3A0A0E', fontWeight: 700}}>{target}</strong>
          </div>
        )}
        {sub && <div style={{fontSize: 14.5, color: 'rgba(58, 10, 14, 0.62)', lineHeight: 1.4}}>{sub}</div>}
      </GlassDarkBox>
    );
  }

  // Default: card bianca originale.
  return (
    <div style={{
      flex: 1, minWidth: 0,
      background: PN.WHITE, border:`1px solid ${PN.BORDER}`,
      borderRadius: 14, padding: 16,
      display:'flex', flexDirection:'column', gap: 10,
    }}>
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap: 8, minHeight: 18}}>
        <div style={{fontSize: 14.5, color: PN.MUTED, fontWeight: 500, letterSpacing: 0.1, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{label}</div>
        <StatDelta value={delta}/>
      </div>

      <div style={{display:'flex', alignItems:'flex-end', justifyContent:'space-between', gap: 12, minWidth: 0}}>
        <div style={{
          fontSize: 32, fontWeight: 700, color: PN.TEXT,
          letterSpacing: -0.6, fontVariantNumeric:'tabular-nums',
          lineHeight: 1, minWidth: 0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
        }}>
          {value}{suffix && <span style={{fontSize: 16, color: PN.MUTED, marginLeft: 4, fontWeight: 600}}>{suffix}</span>}
        </div>
        {spark && spark.length > 1 && (
          <StatSpark data={spark} color={sparkColor || (delta >= 0 ? PN.GREEN : PN.RED)}/>
        )}
      </div>

      {variant === 'percent' && typeof value === 'string' && (
        <div style={{height: 4, background:'#F1F2F4', borderRadius: 999, overflow:'hidden'}}>
          <div style={{
            height:'100%', width: value.replace(/[^0-9.]/g,'') + '%',
            background: PN.PINK, borderRadius: 999,
          }}/>
        </div>
      )}
      {target && (
        <div style={{fontSize: 14, color: PN.MUTED, display:'flex', justifyContent:'space-between'}}>
          <span>obiettivo</span>
          <strong style={{color: PN.TEXT, fontWeight: 700}}>{target}</strong>
        </div>
      )}
      {sub && <div style={{fontSize: 14.5, color: PN.MUTED, lineHeight: 1.4}}>{sub}</div>}
    </div>
  );
}

// ─── Insight banner narrativo ──────────────────────────────────
function StatInsight({ items = [] }) {
  if (!items.length) return null;
  return (
    <div style={{
      display:'grid', gridTemplateColumns: `repeat(${items.length}, 1fr)`, gap: 10,
      marginBottom: 16,
    }}>
      {items.map((it, i) => (
        // Sunset-theme insight tile (D3): warm-dark, identità Byup. Border-left
        // colorato dà segnale di tonalità (positive/negative/neutral).
        <GlassDarkBox
          key={i}
          theme="sunset"
          padding="12px 14px"
          borderRadius={12}
          style={{
            display:'flex', gap: 11, alignItems:'flex-start',
            borderLeft: `3px solid ${it.tone === 'positive' ? '#34D399' : it.tone === 'negative' ? '#F87171' : '#FF8B90'}`,
          }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8, flexShrink: 0,
            display:'grid', placeItems:'center',
            background: it.tone === 'positive' ? 'rgba(52, 211, 153, 0.18)' : it.tone === 'negative' ? 'rgba(248, 113, 113, 0.18)' : 'rgba(255, 255, 255, 0.08)',
            color: it.tone === 'positive' ? '#34D399' : it.tone === 'negative' ? '#FCA5A5' : '#FFFFFF',
            boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.10)',
          }}>
            {it.tone === 'positive' && <BuIcons.trendUp size={15}/>}
            {it.tone === 'negative' && <BuIcons.trendDown size={15}/>}
            {(!it.tone || it.tone === 'neutral') && <BuIcons.info size={15}/>}
          </div>
          <div style={{flex: 1, minWidth: 0}}>
            <div style={{fontSize: 15.5, fontWeight: 700, color: '#F5F5F7', marginBottom: 2}}>{it.title}</div>
            <div style={{fontSize: 14.5, color: 'rgba(255,255,255,0.65)', lineHeight: 1.45}}>{it.desc}</div>
            {it.cta && (
              <button style={{
                marginTop: 6, padding:'4px 10px',
                background:'rgba(255,255,255,0.08)',
                border:'1px solid rgba(255,255,255,0.18)',
                borderRadius: 6, fontSize: 14.5, fontWeight: 600,
                color: '#F5F5F7', cursor:'pointer', fontFamily:'inherit',
              }}>{it.cta} →</button>
            )}
          </div>
        </GlassDarkBox>
      ))}
    </div>
  );
}

// ─── Card ──────────────────────────────────────────────────────
// `style`: override del contenitore — le card che stanno in una riga con una
// vicina più alta lo usano per diventare colonne flex e distribuire l'altezza
// invece di lasciare un vuoto in fondo.
function StatCard({ title, sub, action, children, padding = 20, style }) {
  return (
    <div style={{
      background: PN.WHITE, border:`1px solid ${PN.BORDER}`,
      borderRadius: 14, padding,
      ...style,
    }}>
      {(title || action) && (
        <div style={{display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap: 16, marginBottom: 14}}>
          {title && (
            <div>
              <div style={{fontSize: 17, fontWeight: 700, color: PN.TEXT}}>{title}</div>
              {sub && <div style={{fontSize: 14.5, color: PN.MUTED, marginTop: 2}}>{sub}</div>}
            </div>
          )}
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

// ─── Period picker (icon SVG) ──────────────────────────────────
function StatPeriodPicker({ period, setPeriod }) {
  const options = [
    {id:'oggi', label:'Oggi'},
    {id:'7g', label:'Ultimi 7 giorni'},
    {id:'mese', label:'Questo mese'},
    {id:'trim', label:'Questo trimestre'},
    {id:'anno', label:'Quest\'anno'},
  ];
  const cur = options.find(o => o.id === period) || options[2];
  const [open, setOpen] = React.useState(false);
  return (
    <div style={{position:'relative'}}>
      <button onClick={() => setOpen(!open)} style={{
        display:'inline-flex', alignItems:'center', gap: 8,
        padding:'8px 14px',
        background: PN.WHITE, border:`1px solid ${PN.BORDER}`,
        borderRadius: 10, fontSize: 15, fontWeight: 600,
        color: PN.TEXT, cursor:'pointer', fontFamily:'inherit',
        whiteSpace:'nowrap',
      }}>
        <BuIcons.calendar size={14} stroke={PN.MUTED}/>
        {cur.label}
        <BuIcons.chevronDown size={12} stroke={PN.MUTED}/>
      </button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{position:'fixed', inset: 0, zIndex: 30}}/>
          <div style={{
            position:'absolute', top:'calc(100% + 6px)', right: 0, zIndex: 31,
            background: PN.WHITE, border:`1px solid ${PN.BORDER}`,
            borderRadius: 12, boxShadow:'0 12px 32px rgba(0,0,0,0.12)',
            padding: 6, minWidth: 220,
          }}>
            {options.map(o => (
              <button key={o.id} onClick={() => { setPeriod(o.id); setOpen(false); }} style={{
                display:'block', width:'100%', textAlign:'left',
                padding:'9px 12px',
                background: period === o.id ? '#F1F2F4' : 'transparent',
                color: period === o.id ? PN.TEXT : PN.TEXT,
                border:'none', borderRadius: 8,
                fontSize: 15, fontWeight: period === o.id ? 700 : 500,
                cursor:'pointer', fontFamily:'inherit',
              }}>{o.label}</button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Macro tab — PnSectionTab su filo, come Contabilità ──────────────────
// Il linguaggio unico delle tab di sezione (underline rosa), niente scatole:
// la navigazione si ritira, i dati dominano. `action` (il period picker)
// siede sullo stesso filo, allineato a destra.
function StatTabs({ tabs, active, onChange, action }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-end', gap: 4,
      borderBottom: `1px solid ${PN.BORDER}`,
    }}>
      {tabs.map(t => (
        <PnSectionTab key={t.id} id={t.id} active={active === t.id} onClick={onChange} label={t.label} icon={t.icon}/>
      ))}
      {action && <div style={{marginLeft: 'auto', marginBottom: 8}}>{action}</div>}
    </div>
  );
}

// ─── Sub-tab — card larghe con icona, a tutta riga (scelta di Fabio) ─────
// L'attiva è rossa su fondo tenue; le altre card bianche appena rialzate.
// Le macro sopra sono underline rosa: qui le card danno peso alle viste.
function StatSubTab({ active, onClick, label, icon }) {
  return (
    <button onClick={onClick} style={{
      flex: 1, minWidth: 0,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 12,
      padding: '17px 14px', borderRadius: 14,
      background: active ? '#FFF7F6' : PN.WHITE,
      border: `1.5px solid ${active ? 'rgba(255, 90, 95, 0.55)' : PN.BORDER_SOFT}`,
      boxShadow: active ? '0 2px 10px rgba(255, 90, 95, 0.10)' : '0 1px 2px rgba(15,17,21,0.04)',
      color: active ? PN.PINK_DARK : PN.TEXT,
      fontSize: 18, fontWeight: active ? 700 : 600,
      cursor: 'pointer', fontFamily: 'inherit',
      transition: 'color 140ms ease, background 140ms ease, border-color 140ms ease',
      whiteSpace: 'nowrap',
    }}>
      {icon && <Icon name={icon} size={18}/>}
      {label}
    </button>
  );
}

function StatBar({ pct, color = PN.PINK, height = 8, showLabel, label, animated = true }) {
  return (
    <div style={{position:'relative'}}>
      <div style={{height, background:'#f3f4f6', borderRadius: 999, overflow:'hidden'}}>
        <div style={{
          width: `${Math.min(pct, 100)}%`, height: '100%',
          background: color, borderRadius: 999,
          transition: animated ? 'width 0.4s ease-out' : 'none',
        }}/>
      </div>
      {showLabel && (
        <span style={{
          position:'absolute', right: 8, top: '50%', transform:'translateY(-50%)',
          fontSize: 13, fontWeight: 700, color: pct > 60 ? '#fff' : PN.TEXT,
        }}>{label || `${pct}%`}</span>
      )}
    </div>
  );
}

window.StatKpi = StatKpi;
window.StatDelta = StatDelta;
window.StatSpark = StatSpark;
window.StatKpiTinto = StatKpiTinto;
window.StatDonut = StatDonut;
window.StatInsight = StatInsight;
window.StatCard = StatCard;
window.StatPeriodPicker = StatPeriodPicker;
window.StatTabs = StatTabs;
window.StatSubTab = StatSubTab;
window.StatBar = StatBar;
