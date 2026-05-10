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
function StatSpark({ data, color = PN.PINK, height = 28, width = 90 }) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * height;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  // area path
  const areaPts = `0,${height} ${pts} ${width},${height}`;
  const id = React.useId();
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{display:'block'}}>
      <defs>
        <linearGradient id={`sg-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <polygon points={areaPts} fill={`url(#sg-${id})`}/>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// ─── KPI base — varianti tipologiche ───────────────────────────
// variant: 'default' | 'currency' | 'percent' | 'count'
function StatKpi({ label, value, sub, delta, suffix, spark, sparkColor, variant = 'default', target }) {
  return (
    <div style={{
      flex: 1, minWidth: 0,
      background: PN.WHITE, border:`1px solid ${PN.BORDER}`,
      borderRadius: 14, padding: 16,
      display:'flex', flexDirection:'column', gap: 10,
    }}>
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap: 8, minHeight: 18}}>
        <div style={{fontSize: 12, color: PN.MUTED, fontWeight: 500, letterSpacing: 0.1, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{label}</div>
        <StatDelta value={delta}/>
      </div>

      <div style={{display:'flex', alignItems:'flex-end', justifyContent:'space-between', gap: 12, minWidth: 0}}>
        <div style={{
          fontSize: 26, fontWeight: 700, color: PN.TEXT,
          letterSpacing: -0.6, fontVariantNumeric:'tabular-nums',
          lineHeight: 1, minWidth: 0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
        }}>
          {value}{suffix && <span style={{fontSize: 14, color: PN.MUTED, marginLeft: 4, fontWeight: 600}}>{suffix}</span>}
        </div>
        {spark && spark.length > 1 && (
          <StatSpark data={spark} color={sparkColor || (delta >= 0 ? PN.GREEN : PN.RED)}/>
        )}
      </div>

      {/* variant-specific extra */}
      {variant === 'percent' && typeof value === 'string' && (
        <div style={{height: 4, background:'#F1F2F4', borderRadius: 999, overflow:'hidden'}}>
          <div style={{
            height:'100%', width: value.replace(/[^0-9.]/g,'') + '%',
            background: PN.PINK, borderRadius: 999,
          }}/>
        </div>
      )}
      {target && (
        <div style={{fontSize: 11, color: PN.MUTED, display:'flex', justifyContent:'space-between'}}>
          <span>obiettivo</span>
          <strong style={{color: PN.TEXT, fontWeight: 700}}>{target}</strong>
        </div>
      )}
      {sub && <div style={{fontSize: 11.5, color: PN.MUTED, lineHeight: 1.4}}>{sub}</div>}
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
        <div key={i} style={{
          background: PN.WHITE, border:`1px solid ${PN.BORDER}`,
          borderRadius: 12, padding: '12px 14px',
          display:'flex', gap: 11, alignItems:'flex-start',
          borderLeft: `3px solid ${it.tone === 'positive' ? PN.GREEN : it.tone === 'negative' ? PN.RED : PN.TEXT}`,
        }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8, flexShrink: 0,
            display:'grid', placeItems:'center',
            background: it.tone === 'positive' ? PN.GREEN_SOFT : it.tone === 'negative' ? PN.RED_SOFT : '#F1F2F4',
            color: it.tone === 'positive' ? PN.GREEN : it.tone === 'negative' ? PN.RED : PN.TEXT,
          }}>
            {it.tone === 'positive' && <BuIcons.trendUp size={15}/>}
            {it.tone === 'negative' && <BuIcons.trendDown size={15}/>}
            {(!it.tone || it.tone === 'neutral') && <BuIcons.info size={15}/>}
          </div>
          <div style={{flex: 1, minWidth: 0}}>
            <div style={{fontSize: 12, fontWeight: 700, color: PN.TEXT, marginBottom: 2}}>{it.title}</div>
            <div style={{fontSize: 11.5, color: PN.MUTED, lineHeight: 1.45}}>{it.desc}</div>
            {it.cta && (
              <button style={{
                marginTop: 6, padding:'4px 10px',
                background:'transparent', border:`1px solid ${PN.BORDER}`,
                borderRadius: 6, fontSize: 11, fontWeight: 600,
                color: PN.TEXT, cursor:'pointer', fontFamily:'inherit',
              }}>{it.cta} →</button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Card ──────────────────────────────────────────────────────
function StatCard({ title, sub, action, children, padding = 20 }) {
  return (
    <div style={{
      background: PN.WHITE, border:`1px solid ${PN.BORDER}`,
      borderRadius: 14, padding,
    }}>
      {(title || action) && (
        <div style={{display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap: 16, marginBottom: 14}}>
          {title && (
            <div>
              <div style={{fontSize: 14, fontWeight: 700, color: PN.TEXT}}>{title}</div>
              {sub && <div style={{fontSize: 12, color: PN.MUTED, marginTop: 2}}>{sub}</div>}
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
        borderRadius: 10, fontSize: 13, fontWeight: 600,
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
                fontSize: 13, fontWeight: period === o.id ? 700 : 500,
                cursor:'pointer', fontFamily:'inherit',
              }}>{o.label}</button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Macro tab — segmented control single-line ─────────────────
function StatTab({ id, active, onClick, label, hint }) {
  return (
    <button onClick={() => onClick(id)} style={{
      padding:'9px 18px',
      background: active ? PN.TEXT : PN.WHITE,
      border: `1px solid ${active ? PN.TEXT : PN.BORDER}`,
      color: active ? '#fff' : PN.TEXT,
      borderRadius: 10, fontSize: 13, fontWeight: 700,
      cursor:'pointer', fontFamily:'inherit',
      display:'inline-flex', alignItems:'center', gap: 8,
      whiteSpace:'nowrap',
    }}>
      {label}
      {hint && <span style={{fontSize: 11, fontWeight: 500, opacity: 0.6}}>{hint}</span>}
    </button>
  );
}

// ─── Sub-tab — underline neutro ────────────────────────────────
function StatSubTab({ active, onClick, label }) {
  return (
    <button onClick={onClick} style={{
      padding:'10px 4px',
      background: 'transparent',
      border:'none', borderBottom: `2px solid ${active ? PN.TEXT : 'transparent'}`,
      color: active ? PN.TEXT : PN.MUTED,
      fontSize: 13, fontWeight: active ? 700 : 500,
      cursor:'pointer', fontFamily:'inherit',
      transition:'all 0.15s',
      whiteSpace:'nowrap',
    }}>{label}</button>
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
          fontSize: 11, fontWeight: 700, color: pct > 60 ? '#fff' : PN.TEXT,
        }}>{label || `${pct}%`}</span>
      )}
    </div>
  );
}

window.StatKpi = StatKpi;
window.StatDelta = StatDelta;
window.StatSpark = StatSpark;
window.StatInsight = StatInsight;
window.StatCard = StatCard;
window.StatPeriodPicker = StatPeriodPicker;
window.StatTab = StatTab;
window.StatSubTab = StatSubTab;
window.StatBar = StatBar;
