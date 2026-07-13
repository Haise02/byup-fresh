// Sala — Card con SVG icone (no emoji), byup chip, lista articoli realistica
// Inoltre: flow "+ Articolo" inline

// Palette allineata alle tessere della mappa (TT_ACCENTS in sala-table-tile.jsx):
// libero verde, prenotato viola, occupato corallo brand, da pulire ambra.
const SALA_STATE_META = {
  libero:    { dot: '#15803D', label: 'Libero',    plural: 'Liberi',    bg: 'rgba(22, 163, 74, 0.10)',  mapBg: 'rgba(22, 163, 74, 0.10)',  border: 'rgba(22, 163, 74, 0.40)',  mapBorder: 'rgba(22, 163, 74, 0.40)',  accent: '#15803D' },
  prenotato: { dot: '#6D28D9', label: 'Prenotato', plural: 'Prenotati', bg: 'rgba(124, 58, 237, 0.12)', mapBg: 'rgba(124, 58, 237, 0.12)', border: 'rgba(124, 58, 237, 0.38)', mapBorder: 'rgba(124, 58, 237, 0.38)', accent: '#6D28D9' },
  occupato:  { dot: '#E32459', label: 'Occupato',  plural: 'Occupati',  bg: 'rgba(255, 90, 95, 0.18)',  mapBg: 'rgba(255, 90, 95, 0.18)',  border: 'rgba(227, 36, 89, 0.42)',  mapBorder: 'rgba(227, 36, 89, 0.42)',  accent: '#E32459' },
  dapulire:  { dot: '#B45309', label: 'Da liberare', plural: 'Da liberare', bg: 'rgba(217, 119, 6, 0.14)',  mapBg: 'rgba(217, 119, 6, 0.14)',  border: 'rgba(217, 119, 6, 0.42)',  mapBorder: 'rgba(217, 119, 6, 0.42)',  accent: '#B45309' },
};

// Triangolo rosso accanto al dot: prenotato in ritardo >20' OR da pulire da >20'
const ALERT_TRIANGLE_MIN = 20;
function hasAlertTriangle(t) {
  if (t.state === 'prenotato') {
    const m = t.minutiAllaPrenotazione;
    return m != null && m < 0 && Math.abs(m) > ALERT_TRIANGLE_MIN;
  }
  if (t.state === 'dapulire') {
    const m = t.minutiDaPulire != null ? t.minutiDaPulire : t.freedMinAgo;
    return m != null && m > ALERT_TRIANGLE_MIN;
  }
  return false;
}
window.hasAlertTriangle = hasAlertTriangle;

// Cluster note — 3 tipi: allergia (critical, sempre visibile), evento, generica
const NOTE_TYPE_META = {
  allergia: {
    // HeartPulse — medical/health icon, visivamente distinto dagli alert a triangolo
    path: 'M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27',
    color:'#DC2626', bg:'#FEE2E2', label:'Allergia', critical:true,
  },
  evento: {
    // PartyPopper
    path: 'M5.8 11.3 2 22l10.7-3.79 M4 3h.01 M22 8h.01 M15 2h.01 M22 20h.01 M22 2 17 7l3 3 5-5 M9.6 4.6A2 2 0 1 1 11 8L7 13l-2-2 4-4z M12.5 8.5l5.5 5.5',
    color:'#6D28D9', bg:'#EDE9FE', label:'Evento',
  },
  generica: {
    // Sticky note
    path: 'M16 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11l5-5V5a2 2 0 0 0-2-2z M16 21v-5a2 2 0 0 1 2-2h3',
    color:'#6B7280', bg:'#F3F4F6', label:'Nota',
  },
};
// Lettura uniforme delle note vecchio/nuovo schema
function readNote(note) {
  if (!note) return null;
  const tipo = note.tipo || note.type;
  const testo = note.testo || note.text;
  const ospite = note.ospite || null;
  return { tipo, testo, ospite };
}

const ORDINE_STATO_META = {
  ordinato:   { color:'#6B7280', bg:'#F3F4F6', label:'In attesa',         icon:'M12 7v5l3 2' },
  in_cottura: { color:'#A16207', bg:'#FEF3C7', label:'In preparazione', icon:'M12 3 v3 M9 6 c0 2 -3 2 -3 5 c0 4 6 4 6 0 c0 -3 -3 -3 -3 -5 M3 14 H21' },
  pronto:     { color:'#065F46', bg:'#D1FAE5', label:'Servito',         icon:'M5 13 L9 17 L19 7' },
};
const ORDINE_CODA_WARN_META = { color:'#92400E', bg:'#FEF3C7' };

// Open duration helpers (file-scope so all components can reuse)
// MOD 3: Formato tempo uniforme — "Xh Y'" senza "fa". <60' → solo minuti. Minuti=0 → solo ore.
const WARNING_DURATION_MIN = 90;
const CRITICAL_DURATION_MIN = 180;
function formatOpenDuration(totalMinutes) {
  const minutes = Math.max(0, Math.round(totalMinutes));
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  // Format: "5h30'" (NO spazio) · "2h" (minuti=0) · "45'" (ore=0) — NO "fa"
  if (hours === 0) return `${remainder}'`;
  if (remainder === 0) return `${hours}h`;
  return `${hours}h${remainder}'`;
}
// Versione leggibile per la card espansa: "Seduti da 18 minuti" / "da 2 ore" / "da 1h 30min"
function formatSeduti(totalMinutes) {
  const m = Math.max(0, Math.round(totalMinutes));
  if (m < 60) return `Seduti da ${m} minut${m === 1 ? 'o' : 'i'}`;
  const h = Math.floor(m / 60), r = m % 60;
  if (r === 0) return `Seduti da ${h} or${h === 1 ? 'a' : 'e'}`;
  return `Seduti da ${h}h ${r}min`;
}
function getOpenDurationSeverity(totalMinutes) {
  if (totalMinutes > CRITICAL_DURATION_MIN) return 'critical';
  if (totalMinutes >= WARNING_DURATION_MIN) return 'warning';
  return 'normal';
}
function getOpenDurationColor(totalMinutes) {
  const sev = getOpenDurationSeverity(totalMinutes);
  return sev === 'critical' ? '#DC2626' : (sev === 'warning' ? '#D97706' : '#0F1115');
}

// ─────────────────────────────────────────────────────────
// Tooltip leggero — appare al hover, dark, non clippato grazie a position:fixed
function Tip({ text, children, position = 'top', delay = 250, disabled, style }) {
  const [show, setShow] = React.useState(false);
  const [coords, setCoords] = React.useState(null);
  const wrapRef = React.useRef(null);
  const timerRef = React.useRef(null);
  if (!text || disabled) return children;
  const onEnter = () => {
    if (!wrapRef.current) return;
    timerRef.current = setTimeout(() => {
      const r = wrapRef.current.getBoundingClientRect();
      setCoords({ x: r.left + r.width/2, y: position === 'bottom' ? r.bottom + 8 : r.top - 8 });
      setShow(true);
    }, delay);
  };
  const onLeave = () => {
    clearTimeout(timerRef.current);
    setShow(false);
  };
  return (
    <span ref={wrapRef} onMouseEnter={onEnter} onMouseLeave={onLeave}
      style={{display:'inline-flex', alignItems:'center', ...style}}>
      {children}
      {show && coords && ReactDOM.createPortal(
        <div style={{
          position:'fixed', left: coords.x, top: coords.y,
          transform: position === 'bottom' ? 'translate(-50%, 0)' : 'translate(-50%, -100%)',
          background:'#0F1115', color:'#fff',
          padding:'6px 10px', borderRadius: 6,
          fontSize: 15, fontWeight: 600, lineHeight: 1.35,
          maxWidth: 240, textAlign:'center',
          whiteSpace: text.length > 32 ? 'normal' : 'nowrap',
          zIndex: 9999, pointerEvents:'none',
          boxShadow:'0 6px 20px rgba(0,0,0,0.18)',
          fontFamily:'inherit',
        }}>
          {text}
          <span style={{
            position:'absolute', left:'50%',
            [position === 'bottom' ? 'top' : 'bottom']: -4,
            transform:'translateX(-50%) rotate(45deg)',
            width: 8, height: 8, background:'#0F1115',
          }}/>
        </div>,
        document.body
      )}
    </span>
  );
}

// Icona generica
function NoteIcon({ type, size = 14 }) {
  const m = NOTE_TYPE_META[type];
  if (!m) return null;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={m.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={m.path}/>
    </svg>
  );
}

// Riga segnali della card espansa: alert operativo (leading) + tag evento
// (es. Compleanno) + note, tutti chip SEMPRE in chiaro su un'unica riga;
// vanno a capo solo se manca lo spazio.
function NoteChipRow({ notes, leading }) {
  const items = (notes || []).filter(Boolean);
  if (!items.length && !leading) return null;
  return (
    <div style={{display:'flex', alignItems:'center', flexWrap:'wrap', gap: 6}}>
      {leading}
      {items.map((n, i) => {
        const m = NOTE_TYPE_META[n.tipo] || NOTE_TYPE_META.generica;
        return (
          <div key={i} style={{
            fontSize: 16, color: m.color, fontWeight: 600,
            background: m.bg, padding:'6px 10px', borderRadius: 8,
            display:'inline-flex', alignItems:'center', gap: 6,
          }}>
            <NoteIcon type={n.tipo} size={12}/>
            {n.testo}
          </div>
        );
      })}
    </div>
  );
}

// Icona sedia (frontale: schienale arrotondato, seduta piena, due gambe) —
// indica i POSTI (capienza); il gruppo di persone (PeopleIcon) i coperti.
function ChairIcon({ size = 13, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 13V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v8"/>
      <rect x="4" y="13" width="16" height="4" rx="1.5"/>
      <path d="M6 17v4"/>
      <path d="M18 17v4"/>
    </svg>
  );
}

// Icona gruppo di persone — indica i COPERTI (chi è seduto);
// la sedia (ChairIcon) indica i POSTI (capienza del tavolo).
function PeopleIcon({ size = 13, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  );
}

// Pencil inline che apre un popover stepper per modificare i COPERTI della
// prenotazione. Usato su libero/prenotato espansi (la capienza non si tocca).
function PostiPencil({ currentPosti, onSave, max = 12, min = 1, withLabel = false }) {
  const [open, setOpen] = React.useState(false);
  const [val, setVal] = React.useState(currentPosti || 1);
  const ref = React.useRef(null);
  React.useEffect(() => { setVal(currentPosti || 1); }, [currentPosti]);
  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);
  const commit = () => { if (val !== currentPosti) onSave && onSave(val); setOpen(false); };
  return (
    <span ref={ref} style={{position:'relative', display:'inline-flex', alignItems:'center'}} onClick={(e)=>e.stopPropagation()}>
      <button onClick={() => setOpen(v => !v)} title="Modifica numero di coperti" style={{
        display:'inline-flex', alignItems:'center', gap: withLabel ? 4 : 0,
        justifyContent:'center',
        height: 18, marginLeft: withLabel ? 0 : 2, padding: withLabel ? '0 2px' : 0,
        background:'transparent', border:'none', cursor:'pointer',
        color:'#6B7280', borderRadius: 4, fontFamily:'inherit',
        fontSize: withLabel ? 16.5 : 'inherit',
        fontWeight: withLabel ? 500 : 'inherit',
        transition:'color 120ms, background 120ms',
      }}
        onMouseEnter={e => { e.currentTarget.style.color = '#0F1115'; e.currentTarget.style.background = '#F4F5F7'; }}
        onMouseLeave={e => { e.currentTarget.style.color = withLabel ? '#6B7280' : '#9CA3AF'; e.currentTarget.style.background = 'transparent'; }}>
        {withLabel && (
          <span style={{display:'inline-flex', alignItems:'center', gap: 4, fontVariantNumeric:'tabular-nums'}}>
            {currentPosti} <PeopleIcon size={13} color="currentColor"/>
          </span>
        )}
        <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
          <path d="M8.5 2.5l1 1-5.5 5.5H3v-1L8.5 2.5z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {open && (
        <div style={{
          position:'absolute', top:'calc(100% + 6px)', left: 0, zIndex: 30,
          background:'#fff', border:'1px solid #E5E7EB', borderRadius: 10,
          boxShadow:'0 12px 28px rgba(15,17,21,0.12), 0 2px 6px rgba(15,17,21,0.06)',
          padding: 12, minWidth: 200, fontFamily:'inherit',
        }}>
          <div style={{fontSize: 14.5, fontWeight: 700, color:'#6B7280', letterSpacing: 0.4, textTransform:'uppercase', marginBottom: 8}}>
            Quanti coperti?
          </div>
          <div style={{display:'flex', alignItems:'center', gap: 8, marginBottom: 10}}>
            <button onClick={() => setVal(v => Math.max(min, v - 1))} disabled={val <= min} style={{
              width: 32, height: 32, borderRadius: 8,
              border:'1px solid #E5E7EB', background: val <= min ? '#FAFBFC' : '#FFFFFF',
              cursor: val <= min ? 'default' : 'pointer',
              fontSize: 22, fontWeight: 600, color: val <= min ? '#D1D5DB' : '#0F1115',
              display:'inline-flex', alignItems:'center', justifyContent:'center',
              fontFamily:'inherit',
            }}>−</button>
            <div style={{flex: 1, textAlign:'center', fontSize: 26, fontWeight: 700, color:'#0F1115', fontVariantNumeric:'tabular-nums'}}>{val}</div>
            <button onClick={() => setVal(v => Math.min(max, v + 1))} disabled={val >= max} style={{
              width: 32, height: 32, borderRadius: 8,
              border:'1px solid #E5E7EB', background: val >= max ? '#FAFBFC' : '#FFFFFF',
              cursor: val >= max ? 'default' : 'pointer',
              fontSize: 22, fontWeight: 600, color: val >= max ? '#D1D5DB' : '#0F1115',
              display:'inline-flex', alignItems:'center', justifyContent:'center',
              fontFamily:'inherit',
            }}>+</button>
          </div>
          <button onClick={commit} style={{
            width:'100%', padding:'8px 12px', borderRadius: 8,
            background: PN.BTN_DARK, color:'#fff',
            border:'1px solid rgba(0,0,0,0.32)',
            fontSize: 16, fontWeight: 700, cursor:'pointer', fontFamily:'inherit',
            boxShadow: PN.INSET_HIGHLIGHT_DARK,
          }}>Salva</button>
        </div>
      )}
    </span>
  );
}

// Logo "b" byup compatto — usato dentro gli avatar dei coperti collegati all'app
function ByupB({ size = 11 }) {
  return (
    <span style={{
      fontSize: size, fontWeight: 900, color:'#fff',
      lineHeight: 1, letterSpacing: -0.5,
      fontFamily:'-apple-system, system-ui, sans-serif',
      display:'inline-block', transform:'translateY(-0.5px)',
    }}>b</span>
  );
}

// Avatar group — un colpo d'occhio sui coperti seduti e su chi è collegato a byup
// Rosso brand con "b" = utente byup (ordina dall'app). Grigio chiaro = ospite tradizionale.
// Format "X/Y" = seduti / capacità massima del tavolo.
// Avatar utenti CONNESSI (app byup + webapp): il numero accanto agli avatar
// conta SOLO chi ha fatto accesso — del tutto indipendente dai coperti seduti
// (che vivono nel CopertiChip separato). Hover → breakdown byup/webapp.
function GuestAvatars({ byup = 0, byupWeb = 0, expanded }) {
  const connected = byup + byupWeb;
  if (!connected) return null;
  const sz = expanded ? 22 : 18;
  const overlap = expanded ? 6 : 5;
  const max = expanded ? 9 : 6;
  const visible = Math.min(connected, max);
  const overflow = connected - visible;
  // Prima gli utenti app byup (rossi), poi quelli da webapp (blu)
  const avatars = Array.from({length: visible}).map((_, i) => i < byup ? 'byup' : 'web');
  const BreakdownDot = ({ bg }) => (
    <span style={{width: 8, height: 8, borderRadius:'50%', background: bg, flexShrink: 0, display:'inline-block'}}/>
  );
  const breakdown = (
    <div style={{display:'flex', flexDirection:'column', gap: 4, textAlign:'left', padding:'1px 2px'}}>
      {byup > 0 && (
        <div style={{display:'flex', alignItems:'center', gap: 7, whiteSpace:'nowrap'}}>
          <BreakdownDot bg="linear-gradient(135deg, #FF5A5F, #B53338)"/>
          <span>{byup} con app byup</span>
        </div>
      )}
      {byupWeb > 0 && (
        <div style={{display:'flex', alignItems:'center', gap: 7, whiteSpace:'nowrap'}}>
          <BreakdownDot bg="#3B82F6"/>
          <span>{byupWeb} da webapp</span>
        </div>
      )}
    </div>
  );
  return (
    <Tip text={breakdown}>
      <div style={{display:'inline-flex', alignItems:'center', gap: expanded ? 8 : 6, cursor:'help'}}>
        <div style={{display:'inline-flex', alignItems:'center'}}>
          {avatars.map((kind, i) => (
            <div key={i} style={{
              width: sz, height: sz, borderRadius: '50%',
              background: kind === 'byup' ? 'linear-gradient(135deg, #FF5A5F, #B53338)' : 'linear-gradient(135deg, #60A5FA, #2563EB)',
              border: '2px solid #FFFFFF',
              marginLeft: i === 0 ? 0 : -overlap,
              display:'inline-flex', alignItems:'center', justifyContent:'center',
              zIndex: visible - i,
              boxShadow: kind === 'byup' ? '0 1px 2px rgba(255,90,95,0.30)' : '0 1px 2px rgba(37,99,235,0.28)',
            }}>
              {kind === 'byup'
                ? <ByupB size={expanded ? 13 : 11}/>
                : <span style={{width: expanded ? 7 : 6, height: expanded ? 7 : 6, borderRadius:'50%', background:'#FFFFFF'}}/>
              }
            </div>
          ))}
          {overflow > 0 && (
            <div style={{
              width: sz, height: sz, borderRadius: '50%',
              background: '#6B7280', border: '2px solid #FFFFFF',
              marginLeft: -overlap,
              display:'inline-flex', alignItems:'center', justifyContent:'center',
              color: '#FFFFFF', fontSize: expanded ? 13.5 : 12, fontWeight: 700,
            }}>+{overflow}</div>
          )}
        </div>
        <span style={{
          fontSize: expanded ? 16.5 : 15.5,
          color: '#0F1115', fontWeight: 700,
          whiteSpace:'nowrap',
          fontVariantNumeric: 'tabular-nums',
          letterSpacing: -0.2,
        }}>
          {connected}
        </span>
      </div>
    </Tip>
  );
}

// Coperti SEDUTI al tavolo: di default è un DATO quieto ("🪑 6 coperti",
// nessun controllo armato); al tap si trasforma sul posto in [− 6 +] e si
// richiude al click fuori o dopo qualche secondo senza interazioni.
// Clamp 1..posti. Indipendente dagli utenti connessi (GuestAvatars).
function CopertiChip({ coperti, posti, onAdjust }) {
  const [editing, setEditing] = React.useState(false);
  const ref = React.useRef(null);
  const idleTimer = React.useRef(null);
  const armIdle = () => {
    clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => setEditing(false), 4000);
  };
  React.useEffect(() => {
    if (!editing) { clearTimeout(idleTimer.current); return; }
    armIdle();
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setEditing(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => { document.removeEventListener('mousedown', onDoc); clearTimeout(idleTimer.current); };
  }, [editing]);
  if (!coperti) return null;
  const editable = typeof onAdjust === 'function';

  // Stato quieto: testo-dato, affordance solo in hover
  if (!editing || !editable) {
    return (
      <button
        onClick={editable ? (e) => { e.stopPropagation(); setEditing(true); } : undefined}
        title={editable ? 'Tocca per modificare i coperti' : undefined} style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        height: 32, padding: '0 8px', borderRadius: 8,
        background: 'transparent', border: '1px solid transparent',
        fontSize: 15.5, fontWeight: 600, color: '#6B7280',
        cursor: editable ? 'pointer' : 'default', fontFamily: 'inherit',
        whiteSpace: 'nowrap', flexShrink: 0,
        transition: 'background 120ms ease-out, border-color 120ms ease-out',
      }}
        onMouseEnter={e => { if (editable) { e.currentTarget.style.background = '#F4F5F7'; e.currentTarget.style.borderColor = PN.BORDER_HAIR; } }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; }}>
        <span style={{color: '#0F1115', fontWeight: 700, fontVariantNumeric: 'tabular-nums'}}>{coperti}</span>
        <PeopleIcon size={14} color="#6B7280"/>
      </button>
    );
  }

  // Stato editing: lo stesso ingombro si trasforma in stepper [− 🪑6 +]
  const canDec = coperti > 1;
  const canInc = coperti < posti;
  const segBtn = (enabled) => ({
    width: 30, height: 30, border: 'none',
    background: 'transparent',
    color: enabled ? '#0F1115' : '#D1D5DB',
    fontSize: 19, fontWeight: 600, lineHeight: 1,
    cursor: enabled ? 'pointer' : 'default',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: 'inherit', padding: 0,
    transition: 'background 120ms ease-out',
  });
  return (
    <div ref={ref} onClick={(e) => e.stopPropagation()} style={{
      display: 'inline-flex', alignItems: 'center',
      height: 32, borderRadius: 8,
      background: PN.WHITE,
      border: `1px solid ${PN.BORDER_LIGHT}`,
      boxShadow: `${PN.INSET_HIGHLIGHT}, 0 1px 2px rgba(15,17,21,0.05)`,
      overflow: 'hidden', flexShrink: 0,
    }}>
      <button aria-label="Un coperto in meno" disabled={!canDec}
        onClick={() => { if (canDec) { onAdjust(coperti - 1); armIdle(); } }} style={segBtn(canDec)}
        onMouseEnter={e => { if (canDec) e.currentTarget.style.background = PN.BTN_NEUTRAL_HOVER; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>−</button>
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        padding: '0 4px', minWidth: 34, justifyContent: 'center',
        fontSize: 15.5, fontWeight: 700, color: '#0F1115',
        fontVariantNumeric: 'tabular-nums',
        borderLeft: `1px solid ${PN.BORDER_HAIR}`, borderRight: `1px solid ${PN.BORDER_HAIR}`,
        alignSelf: 'stretch',
      }}>
        {coperti}
      </span>
      <button aria-label="Un coperto in più" disabled={!canInc}
        onClick={() => { if (canInc) { onAdjust(coperti + 1); armIdle(); } }} style={segBtn(canInc)}
        onMouseEnter={e => { if (canInc) e.currentTarget.style.background = PN.BTN_NEUTRAL_HOVER; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>+</button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
function SalaCard({ t, expanded, onToggle, onAdd, onPay, onAddArticle, onConfirmCart, cart, onCartChange, onAdjustCoperti, onAdjustReservationPosti, onLibera, onMove, onEdit, onAssignOther, onNoShow, onUnisci, onModificaCoperti }) {
  const meta = SALA_STATE_META[t.state];
  const alert = t.state === 'occupato' ? getOccupiedAlert(t) : null;
  const note = readNote(t.note);
  const noteMeta = note ? NOTE_TYPE_META[note.tipo] : null;
  const noteIsCritical = noteMeta?.critical;
  const extraNote = readNote(t.extraNote);
  const extraNoteMeta = extraNote ? NOTE_TYPE_META[extraNote.tipo] : null;
  // Logica prenotazione: derivata da minutiAllaPrenotazione
  // >30 verde · 0-30 blu (bloccato) · <0 ritardo: 0-15 blu chiaro, >15 ambra no-show
  const minAlla = t.minutiAllaPrenotazione;
  const isLate = t.state === 'prenotato' && minAlla != null && minAlla < 0;
  const lateMin = isLate ? Math.abs(minAlla) : 0;
  const isNoShow = isLate && lateMin > NOSHOW_ALERT_MIN;
  const urgent = t.state === 'prenotato' && !isLate && minAlla != null && minAlla < PRENOTAZIONE_BLOCCO_MIN;
  // Severity tono ordini: 'warn' ambra · 'info' grigio · 'alert' (legacy) → 'warn'
  const isAlerting = alert?.tone === 'warn';

  // CTA primaria contestuale (Prompt 3 §5)
  const occupatoSaldato = t.state === 'occupato' && (t.contoSaldato || (t.daIncassare === 0 && t.conto > 0));
  const cta = (() => {
    if (t.state === 'libero')    return { label: 'Apri tavolo', onClick: onAdd };
    if (t.state === 'prenotato') return { label: 'Apri tavolo', onClick: onAdd };
    if (t.state === 'occupato')  return occupatoSaldato
      ? { label: 'Libera tavolo', onClick: () => onLibera && onLibera(t) }
      : { label: 'Salda ora', onClick: onPay };
    if (t.state === 'dapulire')  return { label: 'Segna come pronto', onClick: onAdd };
  })();
  // Le azioni sul tavolo (sposta / dividi / unisci + azioni di stato) vivono
  // nella modale "Modifica tavolo" aperta dal pulsante Modifica (onEdit).

  // Severity "Da pulire" progressiva
  const pulireSev = t.state === 'dapulire' ? getPulireSeverity(t.minutiDaPulire) : 'normal';
  const [hover, setHover] = React.useState(false);
  // Schiarisce (f>0) o scurisce (f<0) un colore hex — per il gradiente header
  const shade = (hex, f) => {
    const n = parseInt(hex.slice(1), 16);
    const ch = (v) => Math.max(0, Math.min(255, Math.round(f > 0 ? v + (255 - v) * f : v * (1 + f))));
    return `#${(((ch((n >> 16) & 255)) << 16) | ((ch((n >> 8) & 255)) << 8) | ch(n & 255)).toString(16).padStart(6, '0')}`;
  };
  // Accent (border + top bar) per stato. Da pulire: resta sempre grigio, anche in critical.
  let accent = meta.dot;
  if (isAlerting) accent = '#A16207'; // ambra warn — MAI rosso
  const showAlertTriangle = hasAlertTriangle(t);

  return (
    <div
      onClick={onToggle}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        // Corpo BIANCO: il colore di stato vive solo nella banda header
        background: '#FFFFFF',
        borderRadius: 14,
        border: `1px solid ${hover ? accent + '66' : meta.border}`,
        padding: expanded ? '16px 18px' : '12px 14px',
        cursor: 'pointer',
        transition: 'transform 220ms cubic-bezier(0.32, 0.72, 0, 1), box-shadow 220ms ease-out, border-color 200ms ease-out',
        display: 'flex', flexDirection: 'column', gap: expanded ? 14 : 6,
        boxShadow: expanded
          ? `0 12px 28px ${accent}26, 0 1px 2px rgba(15, 17, 21, 0.04)`
          : (hover
              ? `0 8px 20px ${accent}1F, 0 1px 2px rgba(15, 17, 21, 0.04)`
              : '0 1px 0 rgba(15, 17, 21, 0.04), 0 4px 12px rgba(15, 17, 21, 0.04)'),
        transform: (expanded || hover) ? 'translateY(-2px)' : 'translateY(0)',
        position: 'relative',
        overflow: 'hidden',
        minHeight: expanded ? 'auto' : 88,
      }}>
      {/* === HEADER — banda col colore PIENO dello stato (lo stesso accent
          del vecchio bordo superiore, ora ridondante e rimosso), scritte
          BIANCHE, corpo della card bianco. Dentro: Tavolo X ingrandito
          (+ "Seduti da" sotto, se occupato espanso), Modifica a destra
          sull'occupato espanso, triangolo alert. === */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        margin: expanded ? '-16px -18px 0' : '-12px -14px 0',
        padding: expanded ? '15px 18px 12px' : '11px 14px 10px',
        // Gradiente orizzontale sul colore di stato (versione scura):
        // parte dal più SCURO a sinistra e sfuma verso il più chiaro a destra
        background: `linear-gradient(90deg, ${shade(accent, -0.38)} 0%, ${shade(accent, -0.22)} 48%, ${shade(accent, -0.08)} 100%)`,
        borderBottom: '1px solid rgba(15, 17, 21, 0.06)',
      }}>
        <div style={{flex: 1, minWidth: 0}}>
          <div style={{display:'flex', alignItems:'center', gap: 8}}>
            <span style={{
              fontSize: expanded ? 27 : 24, fontWeight: 700, color: '#FFFFFF',
              letterSpacing: '-0.02em', lineHeight: 1,
              textShadow: '0 1px 2px rgba(15,17,21,0.12)',
            }}>Tavolo {[t.id, ...(t.mergedTables || [])].sort((a, b) => a - b).join('-')}</span>
            {/* Capienza in header SOLO per libero/da liberare: sulle occupate la
                dicono i coperti; sulle prenotate i coperti prenotati in riga. */}
            {t.state !== 'occupato' && t.state !== 'prenotato' && (
              <span style={{display:'inline-flex', alignItems:'center', gap: 3, fontSize: 15, color: 'rgba(255,255,255,0.92)', fontWeight: 600, fontVariantNumeric:'tabular-nums'}}>
                {t.posti} <ChairIcon size={17} color="rgba(255,255,255,0.85)"/>
              </span>
            )}
          </div>
          {/* Tempo al tavolo — sotto il nome del tavolo */}
          {expanded && t.state === 'occupato' && t.sittingMin != null && (
            <div style={{fontSize: 14.5, color:'rgba(255,255,255,0.88)', fontWeight: 600, marginTop: 4, lineHeight: 1}}>
              {formatSeduti(t.sittingMin)}
            </div>
          )}
        </div>
        {/* Modifica — in header al posto del tempo, solo occupato espanso */}
        {expanded && t.state === 'occupato' && (
          <button onClick={(e)=>{e.stopPropagation(); onEdit && onEdit(t);}}
            title="Sposta, dividi o unisci il tavolo" style={{
            display:'inline-flex', alignItems:'center', gap: 5,
            height: 32, padding:'0 12px', borderRadius: 8,
            background: PN.BTN_NEUTRAL, color:'#0F1115',
            border:`1px solid ${PN.BORDER_LIGHT}`,
            fontSize: 15, fontWeight: 700, cursor:'pointer', fontFamily:'inherit',
            whiteSpace:'nowrap', flexShrink: 0,
            boxShadow: `${PN.INSET_HIGHLIGHT}, 0 1px 2px rgba(15,17,21,0.05)`,
            transition:'background 150ms ease-out',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = PN.BTN_NEUTRAL_HOVER; }}
            onMouseLeave={e => { e.currentTarget.style.background = PN.BTN_NEUTRAL; }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
            </svg>
            Modifica
          </button>
        )}
        {/* Triangolo alert — bianco con "!" rosso: contrasta sulla banda
            colorata (prenotato in ritardo >20' OR da pulire >20') */}
        {showAlertTriangle && (
          <Tip text={t.state === 'dapulire' ? 'Tavolo non ancora liberato da oltre 20 minuti' : 'Prenotazione in ritardo di oltre 20 minuti'}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#FFFFFF" stroke="none" style={{display:'block', cursor:'help'}}>
              <path d="M12 2 L22 20 H2 Z" fill="#FFFFFF"/>
              <path d="M12 9 V14 M12 17 h0.01" stroke="#DC2626" strokeWidth="2.4" strokeLinecap="round" fill="none"/>
            </svg>
          </Tip>
        )}
      </div>

      {/* Allergia: SEMPRE visibile. Compatta = solo "Allergia". Espansa = "Allergia [testo] · [ospite]". */}
      {note && noteIsCritical && (
        <div style={{
          display:'flex', alignItems:'center', gap: 5,
          fontSize: 15, fontWeight: 700, color: '#DC2626',
          padding: '2px 0', lineHeight: 1.25, textTransform: 'uppercase', letterSpacing: 0.4,
        }}>
          <span style={{whiteSpace: expanded ? 'normal' : 'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>
            {expanded
              ? `${note.testo}${note.ospite ? ` · ${note.ospite}` : ' (1 ospite)'}`
              : 'Allergia'}
          </span>
        </div>
      )}

      {!expanded && <SalaCardCompact t={t} alert={alert} urgent={urgent} isLate={isLate} lateMin={lateMin} cta={cta} pulireSev={pulireSev}/>}
      {expanded && <SalaCardExpanded t={t} alert={alert} cta={cta} note={note} noteMeta={noteMeta}
        extraNote={extraNote} extraNoteMeta={extraNoteMeta}
        onAddArticle={onAddArticle} onConfirmCart={onConfirmCart} cart={cart} onCartChange={onCartChange}
        onAdjustCoperti={onAdjustCoperti}
        onAdjustReservationPosti={onAdjustReservationPosti}
        onEdit={onEdit} occupatoSaldato={occupatoSaldato}
        isLate={isLate} lateMin={lateMin} isNoShow={isNoShow}
        onAssignOther={onAssignOther} onNoShow={onNoShow} pulireSev={pulireSev}/>}
    </div>
  );
}

function SalaCardCompact({ t, alert, urgent, isLate, lateMin, cta, pulireSev }) {
  if (t.state === 'libero') {
    if (!t.nextReservation) {
      return null;
    }
    return (
      <div style={{display:'flex', alignItems:'baseline', gap: 6, fontSize: 15.5, color:'#6B7280'}}>
        <span style={{color:'#9CA3AF', flexShrink: 0}}>→</span>
        <span style={{fontWeight: 700, color:'#0F1115', flexShrink: 0}}>{t.nextReservation.time}</span>
        <span style={{flex: 1, minWidth: 0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>
          {t.nextReservation.name}
        </span>
      </div>
    );
  }
  if (t.state === 'prenotato') {
    if (!t.nextReservation) {
      return (
        <div style={{fontSize: 15, fontWeight: 600, color: '#7C3AED'}}>Prenotato</div>
      );
    }
    const label = isLate ? `In ritardo di ${lateMin} minuti` : `In arrivo fra ${t.minutiAllaPrenotazione ?? t.nextReservation?.inMin} minuti`;
    const accentCol = isLate ? '#A16207' : (urgent ? '#7C3AED' : '#16A34A');
    return (
      <div style={{display:'flex', flexDirection:'column', gap: 2}}>
        <div style={{fontSize: 14.5, fontWeight: 700, color: accentCol, letterSpacing: 0.3, textTransform:'uppercase'}}>
          {label}
        </div>
        <div style={{display:'flex', alignItems:'baseline', gap: 6}}>
          <span style={{fontSize: 18, fontWeight: 700, color: '#0F1115', flexShrink: 0}}>
            {t.nextReservation.time}
          </span>
          <span style={{flex: 1, minWidth: 0, fontSize: 15.5, color: '#0F1115', fontWeight: 600,
            overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>
            {t.nextReservation.name}
          </span>
          {/* Coperti prenotati — sempre leggibili anche a card contratta */}
          {t.nextReservation.posti && (
            <span style={{display:'inline-flex', alignItems:'center', gap: 4, fontSize: 14.5, color: '#6B7280', fontWeight: 600, flexShrink: 0, fontVariantNumeric:'tabular-nums'}}>
              {t.nextReservation.posti} <PeopleIcon size={13} color="#9CA3AF"/>
            </span>
          )}
        </div>
      </div>
    );
  }
  if (t.state === 'occupato') {
    return (
      // marginTop auto: la riga si ancora al FONDO della card (minHeight 88),
      // così i coperti stanno davvero in basso a destra rispetto alla card
      <div style={{display:'flex', alignItems:'center', gap: 8, marginTop:'auto'}}>
        {alert && (
          <div style={{
            fontSize: 15, fontWeight: 700,
            color: alert.tone === 'warn' ? '#92400E' : '#6B7280',
            background: alert.tone === 'warn' ? '#FEF3C7' : '#F3F4F6',
            padding: '3px 7px', borderRadius: 6,
            whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis',
          }}>{alert.label}</div>
        )}
        <span style={{flex: 1}}/>
        {/* Coperti seduti in basso a destra, come sulla card prenotata
            (gli utenti connessi stanno negli avatar della card espansa) */}
        {!!t.coperti && (
          <span style={{display:'inline-flex', alignItems:'center', gap: 5, flexShrink: 0}}>
            <span style={{fontSize: 15.5, fontWeight: 700, color:'#0F1115', fontVariantNumeric:'tabular-nums'}}>{t.coperti}</span>
            <PeopleIcon size={14} color="#9CA3AF"/>
          </span>
        )}
      </div>
    );
  }
  if (t.state === 'dapulire') {
    const pulireColor = pulireSev === 'critical' ? '#DC2626' : (pulireSev === 'warning' ? '#D97706' : '#475569');
    const min = t.minutiDaPulire != null ? t.minutiDaPulire : t.freedMinAgo;
    return (
      <div style={{display:'flex', alignItems:'center', gap: 6, flexWrap:'wrap'}}>
        <span style={{fontSize: 15.5, color: pulireColor, fontWeight: 700, flex: 1, textTransform: 'uppercase', letterSpacing: 0.4}}>
          {pulireSev === 'normal' ? `Liberato ${min} minuti fa` : `Da liberare da ${min} minuti`}
        </span>
        {t.nextReservation && (
          <span style={{color:'#9CA3AF', fontSize: 14.5, fontWeight: 500}}>
            → {t.nextReservation.time}
          </span>
        )}
      </div>
    );
  }
  return null;
}

function SalaCardExpanded({ t, alert, cta, note, noteMeta, extraNote, extraNoteMeta, onAddArticle, onConfirmCart, cart, onCartChange, onAdjustCoperti, onAdjustReservationPosti, onEdit, occupatoSaldato, isLate, lateMin, isNoShow, onAssignOther, onNoShow, pulireSev }) {
  return (
    <>
      <div style={{display:'flex', flexDirection:'column', gap: 14}}>
        {t.state === 'libero' && t.nextReservation && (
          <div style={{display:'flex', flexDirection:'column', gap: 4}}>
            <div style={{fontSize: 14.5, fontWeight: 700, color:'#6B7280', letterSpacing: 0.4, textTransform:'uppercase'}}>
              Prossima prenotazione
            </div>
            <div style={{fontSize: 21, fontWeight: 700, color:'#0F1115', letterSpacing:'-0.01em', lineHeight: 1.2}}>
              {t.nextReservation.time} · {t.nextReservation.name}
            </div>
            <div style={{display:'flex', alignItems:'baseline', gap: 8, fontSize: 16.5, color:'#6B7280'}}>
              <PostiPencil currentPosti={t.nextReservation.posti} onSave={(n) => onAdjustReservationPosti && onAdjustReservationPosti(n)} withLabel/>
            </div>
          </div>
        )}

        {t.state === 'prenotato' && t.nextReservation && (
          <>
            <div style={{display:'flex', flexDirection:'column', gap: 4}}>
              {(() => {
                const minAlla = t.minutiAllaPrenotazione ?? t.nextReservation.inMin;
                const tag = isLate ? `In ritardo di ${lateMin} minuti` : `In arrivo fra ${minAlla} minuti`;
                // In ritardo: SOLO il testo è giallo
                const tagColor = isLate ? '#A16207' : (minAlla < PRENOTAZIONE_BLOCCO_MIN ? '#7C3AED' : '#16A34A');
                return (
                  <div style={{fontSize: 14.5, fontWeight: 700, color: tagColor, letterSpacing: 0.4, textTransform:'uppercase'}}>
                    {tag}
                  </div>
                );
              })()}
              <div style={{fontSize: 22, fontWeight: 700, color:'#0F1115', letterSpacing:'-0.01em', lineHeight: 1.2,
                overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>
                {t.nextReservation.time} · {t.nextReservation.name}
              </div>
              <div style={{fontSize: 16.5, color:'#6B7280', display:'flex', alignItems:'baseline', gap: 6}}>
                <PostiPencil currentPosti={t.nextReservation.posti} onSave={(n) => onAdjustReservationPosti && onAdjustReservationPosti(n)} withLabel/>
              </div>
            </div>
            <NoteChipRow notes={[
              note && !noteMeta?.critical ? note : null,
              extraNote && extraNoteMeta && !extraNoteMeta.critical ? extraNote : null,
            ]}/>
          </>
        )}

        {t.state === 'occupato' && (
          <>
            <div style={{display:'flex', flexDirection:'column', gap: 8}}>
              {/* Riga identità: nome party a sinistra, coperti seduti in alto
                  a destra (testo quieto → stepper al tap) — lontani dal numero
                  degli utenti connessi che sta nella riga sotto */}
              <div style={{display:'flex', alignItems:'center', gap: 8}}>
                {t.party ? (
                  <div style={{flex: 1, minWidth: 0, fontSize: 19, fontWeight: 700, color:'#0F1115', letterSpacing:'-0.01em', lineHeight: 1.2,
                    overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>
                    {t.party}
                  </div>
                ) : <span style={{flex: 1}}/>}
                <CopertiChip coperti={t.coperti} posti={t.posti} onAdjust={onAdjustCoperti}/>
              </div>
              {/* Utenti connessi (avatar + numero, fisso) — Modifica è
                  salito nell'header della card */}
              <GuestAvatars byup={t.byup} byupWeb={t.byupWeb} expanded/>
            </div>

            {/* Segnali su UNA riga: alert operativo + tag evento + note */}
            <NoteChipRow
              leading={alert && (
                <div style={{
                  fontSize: 15.5, fontWeight: 700,
                  color: alert.tone === 'warn' ? '#92400E' : '#6B7280',
                  background: alert.tone === 'warn' ? '#FEF3C7' : '#F3F4F6',
                  padding:'6px 10px', borderRadius: 8,
                  display:'inline-flex', alignItems:'center',
                }}>{alert.label}</div>
              )}
              notes={[
                note && !noteMeta?.critical ? note : null,
                extraNote && extraNoteMeta && !extraNoteMeta.critical ? extraNote : null,
              ]}/>

            {t.ordini && t.ordini.length > 0 && <OrdiniList ordini={t.ordini}/>}

            {/* Aggiungi articolo — link testuale sottolineato subito sotto
                l'elenco degli ordini: niente sfondo, si ingrandisce in hover */}
            <button onClick={(e)=>{e.stopPropagation(); onAddArticle && onAddArticle(t);}}
              title="Aggiungi articolo al conto" style={{
              display:'inline-flex', alignItems:'center', gap: 5, alignSelf:'center',
              background:'transparent', border:'none', padding:'5px 8px',
              fontSize: 15.5, fontWeight: 700, color:'#0F1115',
              textDecoration:'underline', textUnderlineOffset: 3,
              cursor:'pointer', fontFamily:'inherit', whiteSpace:'nowrap',
              transition:'transform 140ms ease-out', transformOrigin:'center',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14 M5 12h14"/></svg>
              Aggiungi articolo
            </button>

            {/* Blocco conto a scontrino: etichette a sinistra, importi
                incolonnati a destra (tabular); righe informative mute sopra,
                separatore tratteggiato, riga operativa grande in chiusura,
                adiacente alla CTA. Se non c'è nulla di pagato in app, resta
                solo la riga grande (niente righe ridondanti). */}
            {(() => {
              const daInc = t.daIncassare != null ? t.daIncassare : (t.conto || 0);
              const pagatoInApp = Math.max(0, (t.conto || 0) - daInc);
              const row = {display:'flex', alignItems:'baseline', justifyContent:'space-between', gap: 12};
              const label = {fontSize: 15, fontWeight: 600, color:'#9CA3AF'};
              const amount = {fontSize: 15.5, fontWeight: 600, color:'#6B7280', fontVariantNumeric:'tabular-nums'};
              if (occupatoSaldato) {
                return (
                  <div style={{paddingTop: 12, marginTop: 2, borderTop:'1px solid rgba(15, 17, 21, 0.08)'}}>
                    <div style={row}>
                      <span style={{fontSize: 16.5, fontWeight: 700, color:'#16A34A', display:'inline-flex', alignItems:'center', gap: 6}}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13 L9 17 L19 7"/></svg>
                        Conto saldato
                      </span>
                      <span style={{fontSize: 28, fontWeight: 700, lineHeight: 1, letterSpacing:'-0.02em', fontVariantNumeric:'tabular-nums', color:'#065F46'}}>
                        €{(t.conto || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                );
              }
              return (
                <div style={{display:'flex', flexDirection:'column', gap: 5, paddingTop: 12, marginTop: 2, borderTop:'1px solid rgba(15, 17, 21, 0.08)'}}>
                  {pagatoInApp > 0 && (
                    <>
                      <div style={row}>
                        <span style={label}>Totale conto</span>
                        <span style={amount}>€{(t.conto || 0).toFixed(2)}</span>
                      </div>
                      <div style={row}>
                        <span style={label}>Pagato in app</span>
                        <span style={amount}>−€{pagatoInApp.toFixed(2)}</span>
                      </div>
                      <div style={{borderTop:'1px dashed #D1D5DB', margin:'3px 0 2px'}}/>
                    </>
                  )}
                  <div style={row}>
                    <span style={{fontSize: 16, fontWeight: 700, color:'#6B7280'}}>Da incassare</span>
                    <span style={{fontSize: 28, fontWeight: 700, lineHeight: 1, letterSpacing:'-0.02em', fontVariantNumeric:'tabular-nums', color:'#0F1115'}}>
                      €{daInc.toFixed(2)}
                    </span>
                  </div>
                </div>
              );
            })()}
          </>
        )}

        {t.state === 'dapulire' && (
          <div style={{display:'flex', flexDirection:'column', gap: 4}}>
            <div style={{fontSize: 18, fontWeight: 700,
              color: pulireSev === 'critical' ? '#DC2626' : (pulireSev === 'warning' ? '#D97706' : '#0F1115'),
              letterSpacing:'-0.01em'}}>
              {pulireSev === 'normal'
                ? `Tavolo liberato ${t.minutiDaPulire ?? t.freedMinAgo} minuti fa`
                : `Da liberare da ${t.minutiDaPulire ?? t.freedMinAgo} minuti`}
            </div>
            {t.nextReservation && (
              <div style={{fontSize: 16.5, color:'#6B7280'}}>
                Prossima prenotazione: <b style={{color:'#0F1115'}}>{t.nextReservation.time}</b>
                {t.nextReservation.posti && (
                  <span style={{display:'inline-flex', alignItems:'center', gap: 4}}>
                    {' '}· {t.nextReservation.posti} <PeopleIcon size={13} color="#9CA3AF"/>
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* CTA contestuali — primaria nera + Modifica (apre la modale sposta/
          dividi/unisci). Sulla card occupata Modifica sta in alto, nella riga
          degli avatar, al posto che aveva Aggiungi articolo. */}
      <ExpandedCTARow t={t} cta={cta} onEdit={onEdit} showEdit={t.state !== 'occupato'}/>
    </>
  );
}

function ExpandedCTARow({ t, cta, onEdit, showEdit = true }) {
  return (
    <div style={{display:'flex', gap: 8, alignItems:'center'}}>
      <button onClick={(e)=>{e.stopPropagation(); cta.onClick && cta.onClick();}} style={{
        flex: 1, padding:'11px 14px',
        background: PN.BTN_DARK, color:'#fff',
        border:'1px solid rgba(0,0,0,0.32)',
        borderRadius: 10, fontSize: 16.5, fontWeight: 700,
        cursor:'pointer', fontFamily:'inherit', minHeight: 42,
        letterSpacing: 0.1, whiteSpace: 'nowrap',
        boxShadow: `${PN.INSET_HIGHLIGHT_DARK}, 0 1px 2px rgba(15,17,21,0.16)`,
        transition:'background 150ms ease-out',
      }}
        onMouseEnter={e => { e.currentTarget.style.background = PN.BTN_DARK_HOVER; }}
        onMouseLeave={e => { e.currentTarget.style.background = PN.BTN_DARK; }}
      >{cta.label}</button>
      {showEdit && <button onClick={(e)=>{e.stopPropagation(); onEdit && onEdit(t);}}
        title="Sposta, dividi o unisci il tavolo" style={{
        padding:'11px 16px', minHeight: 42,
        background: PN.BTN_NEUTRAL, color:'#0F1115',
        border:`1px solid ${PN.BORDER_LIGHT}`, borderRadius: 10,
        fontSize: 16.5, fontWeight: 700,
        cursor:'pointer', fontFamily:'inherit', whiteSpace:'nowrap',
        display:'inline-flex', alignItems:'center', justifyContent:'center', gap: 6,
        boxShadow: `${PN.INSET_HIGHLIGHT}, 0 1px 2px rgba(15,17,21,0.05)`,
        transition:'background 150ms ease-out',
      }}
        onMouseEnter={e => { e.currentTarget.style.background = PN.BTN_NEUTRAL_HOVER; }}
        onMouseLeave={e => { e.currentTarget.style.background = PN.BTN_NEUTRAL; }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
        </svg>
        Modifica
      </button>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Badge stato + riga ordine — componenti CONDIVISI.
// Contratto anti-overflow (vale per ogni card conto/ordini):
//   riga = flex SENZA wrap, SEMPRE su una sola riga per ogni
//   articolo e stato: [qty] [nome → ellissi] [badge inline].
//   A cedere è sempre il nome del piatto; il badge tiene la sua
//   etichetta intera e solo in estremis si tronca (ellissi interna),
//   mai a capo, mai oltre il bordo della card.
// ─────────────────────────────────────────────────────────
function StatoPill({ color, bg, label, tip }) {
  return (
    <Tip text={tip} style={{maxWidth: '100%', minWidth: 0}}>
      <span style={{
        fontSize: 15, fontWeight: 700,
        color, background: bg,
        padding: '2px 7px', borderRadius: 4,
        display: 'inline-block',
        maxWidth: '100%', boxSizing: 'border-box',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        cursor: tip ? 'help' : 'default',
      }}>{label}</span>
    </Tip>
  );
}

function OrdineRow({ qty, nome, nomeExtra, alert, pill, style }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      columnGap: 8,
      padding: '5px 8px', borderRadius: 6,
      background: '#fff',
      border: alert ? '1.5px solid #DC2626' : '1px solid #F0F2F5',
      ...style,
    }}>
      <span style={{
        fontSize: 15, fontWeight: 700, color: '#0F1115',
        minWidth: 28, textAlign: 'center', flexShrink: 0,
      }}>{qty}×</span>
      {/* È sempre il nome a cedere spazio (ellissi): il badge resta
          inline sulla stessa riga, per ogni articolo e stato. */}
      <span style={{
        flex: '1 1 0%', minWidth: 0,
        fontSize: 15.5, color: '#0F1115', fontWeight: alert ? 700 : 500,
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {nome}{nomeExtra}
      </span>
      <span style={{
        flex: '0 1 auto', marginLeft: 'auto',
        maxWidth: '100%', minWidth: 0,
        display: 'inline-flex',
      }}>
        {pill}
      </span>
    </div>
  );
}

// Lista articoli realistica con stato cucina — contraibile, chiusa di
// default: l'header riepiloga i conteggi per stato (pallini colorati),
// il click la espande/contrae.
function OrdiniList({ ordini }) {
  const [open, setOpen] = React.useState(false);
  // Raggruppa per nome + status, somma qty, prende max dei due timer
  const grouped = {};
  ordini.forEach(o => {
    const key = `${o.nome}|${o.stato}`;
    if (!grouped[key]) {
      grouped[key] = { ...o, qty: 0, minutiInPreparazione: 0, minutiInCoda: 0 };
    }
    grouped[key].qty += o.qty;
    grouped[key].minutiInPreparazione = Math.max(grouped[key].minutiInPreparazione, o.minutiInPreparazione || 0);
    grouped[key].minutiInCoda = Math.max(grouped[key].minutiInCoda, o.minutiInCoda || 0);
  });

  const groupedList = Object.values(grouped);

  // Ordina: pronto → in_cottura → ordinato
  const order = { pronto: 0, in_cottura: 1, ordinato: 2 };
  const sorted = groupedList.sort((a, b) => order[a.stato] - order[b.stato]);

  const totQty = ordini.reduce((s, o) => s + (o.qty || 0), 0);

  return (
    <div style={{display:'flex', flexDirection:'column', gap: 4,
      background:'#FAFBFC', borderRadius: 8, padding: 8,
      border: '1px solid #F0F2F5',
    }}>
      <button onClick={(e) => { e.stopPropagation(); setOpen(v => !v); }} style={{
        display:'flex', alignItems:'center', gap: 8,
        background:'transparent', border:'none', padding:'2px 2px',
        cursor:'pointer', fontFamily:'inherit', width:'100%',
        borderRadius: 6,
      }}>
        <span style={{
          fontSize: 13.5, fontWeight: 700, color:'#6B7280',
          letterSpacing: 0.6, textTransform:'uppercase',
        }}>Ordini · {totQty}</span>
        <span style={{flex: 1}}/>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF"
          strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          style={{transform: open ? 'rotate(180deg)' : 'none', transition:'transform 160ms ease-out', flexShrink: 0}}>
          <path d="m6 9 6 6 6-6"/>
        </svg>
      </button>
      {open && sorted.map((o, idx) => {
        const s = ORDINE_STATO_META[o.stato];
        const isAlert = o.alert === 'allergia';
        // Pill state — label + minuti per stato
        let pillColor = s.color, pillBg = s.bg, pillLabel = s.label, tipText = '';
        if (o.stato === 'pronto') {
          tipText = 'Servito';
        } else if (o.stato === 'in_cottura') {
          pillLabel = o.minutiInPreparazione > 0 ? `In preparazione · ${o.minutiInPreparazione}min` : 'In preparazione';
          tipText = o.minutiInPreparazione > 0 ? `In cucina da ${o.minutiInPreparazione} minuti` : 'In cucina';
        } else if (o.stato === 'ordinato') {
          const sev = getCodaSeverity(o.minutiInCoda);
          if (sev === 'warning') {
            pillColor = ORDINE_CODA_WARN_META.color;
            pillBg    = ORDINE_CODA_WARN_META.bg;
          }
          pillLabel = `In attesa · ${o.minutiInCoda || 0}min`;
          tipText = `In attesa da ${o.minutiInCoda || 0} minuti`;
        }
        return (
          <OrdineRow key={idx}
            qty={o.qty}
            nome={o.nome}
            alert={isAlert}
            nomeExtra={isAlert && (
              <span style={{color: '#DC2626', marginLeft: 6, fontSize: 14, fontWeight: 700, letterSpacing: '0.04em', display: 'inline-flex', alignItems: 'center', gap: 3}}>
                <NoteIcon type="allergia" size={10}/> Allergie
              </span>
            )}
            pill={<StatoPill color={pillColor} bg={pillBg} label={pillLabel} tip={tipText}/>}
          />
        );
      })}
    </div>
  );
}

window.SalaCard = SalaCard;
window.StatoPill = StatoPill;
window.OrdineRow = OrdineRow;
window.SALA_STATE_META = SALA_STATE_META;
window.NOTE_TYPE_META = NOTE_TYPE_META;
window.NoteIcon = NoteIcon;
