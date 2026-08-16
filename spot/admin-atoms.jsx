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
    // flexWrap: una scheda con molte tab (il dettaglio locale ne ha undici)
    // manda le ultime a capo invece di tagliarle fuori dallo schermo.
    <div style={{display:'flex', gap:4, borderBottom:`1px solid ${ADM.BORDER}`, padding:'0 0', flexWrap:'wrap'}}>
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
    cta:       { bg: 'linear-gradient(180deg, #FF4A78 0%, #C40B45 100%)', fg: '#fff', border: 'transparent', shadow:'0 4px 12px -4px rgba(255,31,90,0.55), 0 1px 0 rgba(255,255,255,0.20) inset' },
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

// ─── Select con popover ─────────────────────────────────────────────────────
// Il <select> nativo apre il menu del SISTEMA OPERATIVO: font di sistema,
// spunta blu, righe attaccate — un pezzo di macOS in mezzo a Hubble. Questo
// componente tiene il guscio di chi lo monta (via `buttonStyle`) e apre un
// pannello nostro: stessa carta bianca dei popover di Hubble, voce attiva in
// pesca come la nav, spunta sulla scelta corrente.
//   · options: [{value, label}] oppure stringhe semplici
//   · block: il select riempie la riga (per i form nei drawer)
//   · align: da che bordo del bottone si apre il pannello
function AdmSelect({ value, onChange, options, buttonStyle = {}, block = false, align = 'left', maxHeight = 320, title }) {
  const [open, setOpen] = React.useState(false);
  // Hover gestito QUI e non da una classe CSS: le voci portano il fondo in
  // stile inline (serve per la voce attiva), e uno stile inline vince sempre
  // su una regola :hover del foglio — la classe c'era e non si vedeva mai.
  const [sopra, setSopra] = React.useState(null);
  // Verso d'apertura: vicino al fondo della finestra il pannello si apre
  // VERSO L'ALTO — aperto in giù finiva sotto la piega dello scroll (o sotto
  // il bordo di una card che clippa) e le voci restavano invisibili.
  const [verso, setVerso] = React.useState('giu');
  const box = React.useRef(null);
  const opts = (options || []).map(o => (o && typeof o === 'object') ? o : { value: o, label: String(o) });
  const current = opts.find(o => String(o.value) === String(value));
  const commuta = () => {
    if (!open && box.current) {
      const r = box.current.getBoundingClientRect();
      const serve = Math.min(maxHeight, opts.length * 38 + 14) + 10;
      const spazioSotto = window.innerHeight - r.bottom;
      setVerso(spazioSotto < serve && r.top > spazioSotto ? 'su' : 'giu');
    }
    setOpen(o => !o);
  };

  React.useEffect(() => {
    if (!open) return;
    const chiudi = () => setOpen(false);
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('pointerdown', chiudi);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('pointerdown', chiudi);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={box} style={{position:'relative', display: block ? 'block' : 'inline-flex', width: block ? '100%' : undefined}}
      onPointerDown={e => e.stopPropagation()}>
      <button type="button" onClick={commuta} title={title}
        style={{
          display:'inline-flex', alignItems:'center', justifyContent:'space-between', gap:8,
          width: block ? '100%' : undefined, minWidth:0, boxSizing:'border-box',
          padding:'7px 10px 7px 12px',
          border:`1px solid ${ADM.BORDER}`, borderRadius:7,
          fontSize:13.7, fontWeight:500, color:ADM.TEXT,
          background:'#fff', cursor:'pointer', fontFamily:'inherit', textAlign:'left',
          ...buttonStyle,
        }}>
        <span style={{minWidth:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{current ? current.label : '—'}</span>
        <span style={{display:'inline-flex', flexShrink:0, color:ADM.MUTED,
          transform: open ? 'rotate(180deg)' : 'none', transition:'transform 0.15s ease'}}>
          <BuIcons.chevronDown size={16}/>
        </span>
      </button>

      {open && (
        <div className="adm-select-pop" onMouseLeave={() => setSopra(null)} style={{
          position:'absolute', zIndex:120,
          top: verso === 'su' ? 'auto' : 'calc(100% + 6px)',
          bottom: verso === 'su' ? 'calc(100% + 6px)' : 'auto',
          left: align === 'right' ? 'auto' : 0,
          right: align === 'right' ? 0 : 'auto',
          minWidth:'100%', maxWidth:340, padding:6, borderRadius:12,
          background:'#fff', border:`1px solid ${ADM.BORDER}`,
          boxShadow:'0 18px 44px -10px rgba(15,17,21,0.22)',
          maxHeight, overflowY:'auto',
        }}>
          {opts.map((o, i) => {
            const attiva = String(o.value) === String(value);
            const hover = sopra === i;
            return (
              <button key={String(o.value)} type="button"
                onClick={() => { onChange(o.value); setOpen(false); }}
                onMouseEnter={() => setSopra(i)}
                style={{
                  display:'flex', alignItems:'center', gap:8, width:'100%', textAlign:'left',
                  padding:'8px 10px', borderRadius:8, border:'none',
                  // Il passaggio del mouse SI VEDE: grigio pieno sulle voci a
                  // riposo, pesca più carico su quella già attiva.
                  background: attiva ? (hover ? '#FFCBD8' : ADM.PINK_SOFT)
                    : hover ? ADM.NEUTRAL_SOFT : 'transparent',
                  color: attiva ? ADM.PINK_DARK : ADM.TEXT,
                  fontSize:13.5, fontWeight: attiva ? 700 : 500,
                  cursor:'pointer', fontFamily:'inherit', whiteSpace:'nowrap',
                  transition:'background 0.1s ease',
                }}>
                <span style={{flex:1, minWidth:0, overflow:'hidden', textOverflow:'ellipsis'}}>{o.label}</span>
                {attiva && <BuIcons.check size={14}/>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

window.AdmBadge = AdmBadge;
window.AdmSelect = AdmSelect;
window.AdmPlanBadge = AdmPlanBadge;
window.AdmStatoBadge = AdmStatoBadge;
window.AdmCard = AdmCard;
window.AdmAvatar = AdmAvatar;
window.AdmTabBar = AdmTabBar;
window.AdmEmpty = AdmEmpty;
window.AdmButton = AdmButton;
window.AdmIconBtn = AdmIconBtn;
window.AdmBarChart = AdmBarChart;
window.AdmStackedBar = AdmStackedBar;
window.AdmSwitch = AdmSwitch;
