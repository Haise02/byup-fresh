// Atoms condivisi per Admin: Badge, Pill, Card, KPI, Tooltip, Avatar, ProgressBar

function AdmBadge({ children, color = 'PLAN_FREE', soft = true, size = 'sm' }) {
  const c = ADM[color] || color;
  const bg = soft ? (ADM[color + '_SOFT'] || c + '20') : c;
  const fg = soft ? c : '#fff';
  const px = size === 'xs' ? '2px 7px' : size === 'sm' ? '3px 9px' : '5px 11px';
  const fs = size === 'xs' ? 17 : size === 'sm' ? 18 : 19.5;
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', gap:5,
      background: bg, color: fg,
      padding: px,
      borderRadius: 999,
      fontSize: fs, fontWeight: 600,
      letterSpacing:'-0.005em',
      whiteSpace:'nowrap',
    }}>{children}</span>
  );
}

function AdmDot({ color = 'OK' }) {
  return <span style={{width:6, height:6, background:ADM[color]||color, borderRadius:'50%', display:'inline-block'}}/>;
}

function AdmPlanBadge({ piano }) {
  const p = PIANI.find(x => x.id === piano);
  if (!p) return null;
  return <AdmBadge color={p.color} size="xs">{p.label}</AdmBadge>;
}

function AdmStatoBadge({ stato }) {
  const map = {
    pending:    { label: 'Iscritto', color: 'PLAN_FREE' },
    onboarding: { label: 'In onboarding', color: 'WARN' },
    skipped:    { label: 'Onboarding saltato', color: 'INFO' },
    active:     { label: 'Attivo', color: 'OK' },
    inactive:   { label: 'Inattivo', color: 'PLAN_FREE' },
    churned:    { label: 'Disdetto', color: 'DANGER' },
  };
  const s = map[stato] || map.pending;
  return (
    <span style={{display:'inline-flex', alignItems:'center', gap:6}}>
      <AdmDot color={s.color}/>
      <span style={{fontSize:13.7, color:ADM.TEXT, fontWeight:500}}>{s.label}</span>
    </span>
  );
}

function AdmCard({ children, padding = 20, interactive = false, style = {}, className, ...rest }) {
  return (
    <div className={`${interactive ? 'adm-card-interactive' : ''} ${className||''}`.trim()} style={{
      background: ADM.PANEL,
      border: `1px solid ${ADM.BORDER}`,
      borderRadius: 14,
      padding,
      boxShadow: ADM.CARD_SHADOW,
      ...style,
    }} {...rest}>{children}</div>
  );
}

function AdmKpiCard({ label, value, sub, trend, icon, accent = 'PINK' }) {
  const Icon = icon ? BuIcons[icon] : null;
  return (
    <AdmCard padding={20}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
        <div>
          <div style={{fontSize:12, color:ADM.MUTED, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em'}}>{label}</div>
          <div style={{fontSize:29, fontWeight:800, color:ADM.TEXT, marginTop:8, letterSpacing:'-0.025em', lineHeight:1.05}}>{value}</div>
          {(sub || trend != null) && (
            <div style={{display:'flex', alignItems:'center', gap:8, marginTop:8}}>
              {trend != null && (
                <span style={{
                  display:'inline-flex', alignItems:'center', gap:3,
                  fontSize:12, fontWeight:700,
                  padding:'2px 7px',
                  borderRadius:99,
                  background: trend >= 0 ? ADM.OK_SOFT : ADM.DANGER_SOFT,
                  color: trend >= 0 ? ADM.OK : ADM.DANGER,
                }}>
                  {trend >= 0 ? <BuIcons.trendUp size={14}/> : <BuIcons.trendDown size={14}/>}
                  {Math.abs(trend)}%
                </span>
              )}
              {sub && <span style={{fontSize:13.3, color:ADM.MUTED}}>{sub}</span>}
            </div>
          )}
        </div>
        {Icon && (
          <div style={{
            width:38, height:38, borderRadius:11,
            background: ADM.NEUTRAL_SOFT,
            color: ADM.NEUTRAL,
            display:'grid', placeItems:'center',
          }}>
            <Icon size={23}/>
          </div>
        )}
      </div>
    </AdmCard>
  );
}

function AdmAvatar({ name, bg, size = 32 }) {
  const ini = name ? name.split(' ').slice(0,2).map(s=>s[0]).join('').toUpperCase() : '?';
  const bgFinal = bg || `hsl(${(name||'').charCodeAt(0)*7 % 360}, 50%, 55%)`;
  return (
    <div style={{
      width:size, height:size, borderRadius:'50%',
      background: bgFinal, color:'#fff',
      display:'grid', placeItems:'center',
      fontWeight:700, fontSize: size*0.4,
      flexShrink:0,
    }}>{ini}</div>
  );
}

function AdmTabBar({ tabs, active, onChange, variant = 'underline' }) {
  // segmented = iOS-style pill segmented control
  if (variant === 'segmented') {
    return (
      <div style={{
        display:'inline-flex', gap:2, padding:3,
        background:'rgba(120,120,128,0.12)',
        borderRadius:10,
      }}>
        {tabs.map(t => {
          const isActive = active === t.id;
          return (
            <button key={t.id} onClick={()=>onChange(t.id)} style={{
              padding:'6px 14px',
              background: isActive ? '#fff' : 'transparent',
              border:'none', borderRadius:8,
              color: isActive ? ADM.TEXT : ADM.MUTED,
              fontWeight: 600, fontSize:14,
              cursor:'pointer', fontFamily:'inherit',
              boxShadow: isActive ? '0 1px 3px rgba(15,17,21,0.10), 0 1px 0 rgba(255,255,255,0.5) inset' : 'none',
              transition:'background 0.2s, color 0.2s, box-shadow 0.2s',
              display:'inline-flex', alignItems:'center', gap:6,
            }}>
              {t.label}
              {t.badge != null && t.badge > 0 && (
                <span style={{
                  fontSize:12.2, fontWeight:700,
                  background: isActive ? ADM.PINK : 'rgba(120,120,128,0.2)',
                  color: isActive ? '#fff' : ADM.MUTED,
                  padding:'1px 6px', borderRadius:99, minWidth:14, textAlign:'center',
                }}>{t.badge}</span>
              )}
            </button>
          );
        })}
      </div>
    );
  }
  return (
    <div style={{display:'flex', gap:4, borderBottom:`1px solid ${ADM.BORDER}`, padding:'0 0'}}>
      {tabs.map(t => {
        const isActive = active === t.id;
        return (
          <button
            key={t.id}
            className={`adm-tab-btn${isActive ? ' is-active' : ''}`}
            onClick={()=>onChange(t.id)}
            style={{
              padding:'11px 14px',
              background: 'transparent',
              border:'none',
              borderRadius:'8px 8px 0 0',
              borderBottom: isActive ? `2px solid ${ADM.PINK}` : '2px solid transparent',
              marginBottom:-1,
              color: isActive ? ADM.TEXT : ADM.MUTED,
              fontWeight: isActive ? 600 : 500,
              fontSize:14.4,
              letterSpacing:'-0.005em',
              cursor:'pointer',
              fontFamily:'inherit',
              display:'flex', alignItems:'center', gap:7,
            }}>
            {t.label}
            {t.badge != null && t.badge > 0 && (
              <span style={{
                fontSize:12.2, fontWeight:700,
                background: isActive ? ADM.PINK : 'rgba(120,120,128,0.15)',
                color: isActive ? '#fff' : ADM.MUTED,
                padding:'1px 7px', borderRadius:999, minWidth:16, textAlign:'center',
              }}>{t.badge}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function AdmEmpty({ icon = 'eye', title, desc }) {
  const Icon = BuIcons[icon];
  return (
    <div style={{padding:'48px 32px', textAlign:'center', color:ADM.MUTED}}>
      <div style={{display:'inline-grid', placeItems:'center', width:48, height:48, background:'#F3F4F6', borderRadius:12, marginBottom:14}}>
        <Icon size={27}/>
      </div>
      <div style={{fontSize:15.8, fontWeight:600, color:ADM.TEXT, marginBottom:4}}>{title}</div>
      <div style={{fontSize:14.4, color:ADM.MUTED}}>{desc}</div>
    </div>
  );
}

function AdmButton({ children, onClick, variant = 'primary', size = 'md', icon, disabled, style = {}, className }) {
  const styles = {
    primary:   { bg: 'linear-gradient(180deg, #1F2229 0%, #0F1115 100%)', fg: '#fff', border: 'transparent', shadow:'0 1px 2px rgba(15,17,21,0.20), 0 1px 0 rgba(255,255,255,0.06) inset' },
    cta:       { bg: 'linear-gradient(180deg, #FF6F73 0%, #E04347 100%)', fg: '#fff', border: 'transparent', shadow:'0 4px 12px -4px rgba(255,90,95,0.55), 0 1px 0 rgba(255,255,255,0.20) inset' },
    ghost:     { bg: 'transparent', fg: ADM.TEXT, border: ADM.BORDER },
    secondary: { bg: '#fff', fg: ADM.TEXT, border: ADM.BORDER, shadow:'0 1px 2px rgba(15,17,21,0.04)' },
    danger:    { bg: 'linear-gradient(180deg, #EF4444 0%, #DC2626 100%)', fg: '#fff', border: 'transparent', shadow:'0 1px 2px rgba(220,38,38,0.30)' },
    success:   { bg: 'linear-gradient(180deg, #22C55E 0%, #16A34A 100%)', fg: '#fff', border: 'transparent', shadow:'0 1px 2px rgba(22,163,74,0.30)' },
    quiet:     { bg: 'transparent', fg: ADM.MUTED, border: 'transparent' },
  };
  const s = styles[variant];
  const pad = size === 'sm' ? '6px 12px' : size === 'lg' ? '12px 20px' : '8px 16px';
  const fs = size === 'sm' ? 19 : size === 'lg' ? 21 : 19.5;
  const radius = size === 'sm' ? 7 : 9;
  const Icon = icon ? BuIcons[icon] : null;
  return (
    <button onClick={onClick} disabled={disabled}
      className={`adm-btn adm-btn-${variant} ${className||''}`.trim()}
      style={{
        display:'inline-flex', alignItems:'center', justifyContent:'center', gap:7,
        padding: pad,
        background: s.bg, color: s.fg,
        border: `1px solid ${s.border}`,
        borderRadius: radius,
        fontSize: fs, fontWeight: 600,
        letterSpacing:'-0.005em',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily:'inherit',
        opacity: disabled ? 0.45 : 1,
        boxShadow: s.shadow || 'none',
        ...style,
      }}>
      {Icon && <Icon size={size==='sm'?13:14}/>}
      {children}
    </button>
  );
}

function AdmIconBtn({ icon, onClick, label, color = ADM.MUTED, size = 30 }) {
  const Icon = BuIcons[icon];
  const [h, setH] = React.useState(false);
  return (
    <button onClick={onClick} title={label}
      className="adm-iconbtn"
      onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
      style={{
        display:'grid', placeItems:'center',
        width:size, height:size, borderRadius: Math.round(size * 0.3),
        background: h ? 'rgba(120,120,128,0.12)' : 'transparent',
        border:'none', cursor:'pointer', color,
      }}>
      <Icon size={Math.round(size * 0.5)}/>
    </button>
  );
}

// Sparkline minimale
function AdmSparkline({ data = [], color = '#FF5A5F', height = 36, width = 120 }) {
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i/(data.length-1)) * width;
    const y = height - ((v - min)/range) * height;
    return `${x},${y}`;
  }).join(' ');
  const area = `0,${height} ${pts} ${width},${height}`;
  return (
    <svg width={width} height={height} style={{display:'block'}}>
      <polygon points={area} fill={color} fillOpacity={0.08}/>
      <polyline points={pts} fill="none" stroke={color} strokeWidth={1.6} strokeLinejoin="round" strokeLinecap="round"/>
    </svg>
  );
}

// BarChart semplice
function AdmBarChart({ data = [], labels = [], color, height = 160 }) {
  // Schema "inchiostro + un accento": barre snelle, periodi passati attenuati,
  // l'ultimo pieno. Il colore di default è l'ink dei grafici.
  const c = color || ADM.INK;
  const max = Math.max(...data, 1);
  return (
    <div style={{display:'flex', alignItems:'flex-end', gap:8, height, padding:'0 4px'}}>
      {data.map((v, i) => {
        const last = i === data.length - 1;
        return (
          <div key={i} style={{flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:6, height:'100%', minWidth:0}}>
            <div style={{flex:1, width:'100%', maxWidth:34, display:'flex', alignItems:'flex-end', opacity: last ? 1 : 0.55, margin:'0 auto'}}>
              <div style={{
                width:'100%',
                height: `${(v/max)*100}%`,
                background: c,
                borderRadius:'4px 4px 0 0',
                minHeight: 2,
              }}/>
            </div>
            {labels[i] && <div style={{fontSize:12, color: last ? ADM.TEXT : ADM.MUTED_SOFT, fontWeight: last ? 700 : 500}}>{labels[i]}</div>}
          </div>
        );
      })}
    </div>
  );
}

// Stacked horizontal bar (per breakdown piani, ecc.)
function AdmStackedBar({ segments = [], height = 8 }) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  return (
    <div style={{display:'flex', width:'100%', height, borderRadius:99, overflow:'hidden', background:'#F0F1F3'}}>
      {segments.map((s, i) => (
        <div key={i} title={s.label}
          style={{width:`${(s.value/total)*100}%`, background: s.color}}/>
      ))}
    </div>
  );
}

function AdmCheckbox({ checked, onChange, label, size = 'sm' }) {
  const sz = size === 'sm' ? 22 : 24;
  return (
    <label style={{display:'inline-flex', alignItems:'center', gap:8, cursor:'pointer', userSelect:'none'}}>
      <span onClick={() => onChange && onChange(!checked)} style={{
        width:sz, height:sz, borderRadius:5,
        border: checked ? `1.5px solid ${ADM.PINK}` : `1.5px solid ${ADM.MUTED_LIGHT}`,
        background: checked ? `linear-gradient(180deg, #FF6F73 0%, ${ADM.PINK_DARK} 100%)` : '#fff',
        boxShadow: checked ? '0 1px 2px rgba(255,90,95,0.25)' : 'inset 0 1px 1px rgba(0,0,0,0.02)',
        display:'grid', placeItems:'center',
        transition:'all 0.18s cubic-bezier(0.34,1.56,0.64,1)',
        flexShrink:0,
      }}>
        {checked && <BuIcons.check size={sz*0.7} color="#fff"/>}
      </span>
      {label && <span style={{fontSize:14, color:ADM.TEXT}}>{label}</span>}
    </label>
  );
}

// iOS-style switch
function AdmSwitch({ checked, onChange, size = 'md', disabled }) {
  const dim = size === 'sm'
    ? { w: 38, h: 22, thumb: 18, off: 2 }
    : { w: 48, h: 28, thumb: 24, off: 2 };
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange && onChange(!checked)}
      className="adm-switch"
      style={{
        position:'relative', width:dim.w, height:dim.h, borderRadius:99,
        background: checked ? ADM.OK : 'rgba(120,120,128,0.22)',
        border:'none', cursor: disabled ? 'not-allowed' : 'pointer',
        padding:0, flexShrink:0,
        boxShadow: checked ? '0 0 0 1px rgba(22,163,74,0.10) inset' : '0 0 0 1px rgba(0,0,0,0.04) inset',
        opacity: disabled ? 0.5 : 1,
      }}>
      <span className="adm-switch-thumb" style={{
        position:'absolute', top:dim.off,
        left: checked ? dim.w - dim.thumb - dim.off : dim.off,
        width:dim.thumb, height:dim.thumb, borderRadius:'50%', background:'#fff',
        boxShadow:'0 3px 8px rgba(0,0,0,0.15), 0 1px 1px rgba(0,0,0,0.06), 0 0 0 0.5px rgba(0,0,0,0.04)',
      }}/>
    </button>
  );
}

window.AdmBadge = AdmBadge;
window.AdmDot = AdmDot;
window.AdmPlanBadge = AdmPlanBadge;
window.AdmStatoBadge = AdmStatoBadge;
window.AdmCard = AdmCard;
window.AdmKpiCard = AdmKpiCard;
window.AdmAvatar = AdmAvatar;
window.AdmTabBar = AdmTabBar;
window.AdmEmpty = AdmEmpty;
window.AdmButton = AdmButton;
window.AdmIconBtn = AdmIconBtn;
window.AdmSparkline = AdmSparkline;
window.AdmBarChart = AdmBarChart;
window.AdmStackedBar = AdmStackedBar;
window.AdmCheckbox = AdmCheckbox;
window.AdmSwitch = AdmSwitch;
