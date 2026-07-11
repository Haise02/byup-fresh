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

// Icona sedia — usata nelle card occupate per indicare il tempo seduti (con tooltip on hover)
function ChairIcon({ size = 13, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v3"/>
      <path d="M2 11v5a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v2H6v-2a2 2 0 0 0-4 0z"/>
      <path d="M6 18v2"/>
      <path d="M18 18v2"/>
    </svg>
  );
}

// Pencil inline che apre un popover stepper per modificare un numero di posti.
// Usato per editare la party size della prenotazione su libero/prenotato espansi.
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
      <button onClick={() => setOpen(v => !v)} title="Modifica numero di posti" style={{
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
        {withLabel && <span>{currentPosti} posti</span>}
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
            Quanti posti?
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
function GuestAvatars({ coperti, byup, byupWeb = 0, posti, expanded, onAdjust }) {
  const [editing, setEditing] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (!editing) return;
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setEditing(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [editing]);
  if (!coperti || coperti === 0) return null;
  const sz = expanded ? 22 : 18;
  const overlap = expanded ? 6 : 5;
  const max = expanded ? 9 : 6;
  const visible = Math.min(coperti, max);
  const overflow = coperti - visible;
  const avatars = Array.from({length: visible}).map((_, i) => i < byup);
  const editable = expanded && typeof onAdjust === 'function';
  // Tooltip: "X ospiti su Y · Z app byup, W web app"
  const conn = [];
  if (byup > 0)    conn.push(`${byup} app byup`);
  if (byupWeb > 0) conn.push(`${byupWeb} web app`);
  const tipText = editable
    ? `${coperti}/${posti} coperti · tocca per modificare i posti`
    : `${coperti} ospiti su ${posti}${conn.length ? ' · ' + conn.join(', ') : ''}`;
  const Inner = (
    <div style={{display:'inline-flex', alignItems:'center', gap: expanded ? 8 : 6, cursor: editable ? 'pointer' : 'help'}}>
        <div style={{display:'inline-flex', alignItems:'center'}}>
          {avatars.map((isByup, i) => (
            <div key={i} style={{
              width: sz, height: sz, borderRadius: '50%',
              background: isByup ? 'linear-gradient(135deg, #FF5A5F, #B53338)' : '#E5E7EB',
              border: '2px solid #FFFFFF',
              marginLeft: i === 0 ? 0 : -overlap,
              display:'inline-flex', alignItems:'center', justifyContent:'center',
              zIndex: visible - i,
              boxShadow: isByup ? '0 1px 2px rgba(255,90,95,0.30)' : 'none',
            }}>
              {isByup
                ? <ByupB size={expanded ? 13 : 11}/>
                : <span style={{width: expanded ? 7 : 6, height: expanded ? 7 : 6, borderRadius:'50%', background:'#9CA3AF'}}/>
              }
            </div>
          ))}
          {overflow > 0 && (
            <Tip text={`${overflow} coperti in più`}>
              <div style={{
                width: sz, height: sz, borderRadius: '50%',
                background: '#6B7280', border: '2px solid #FFFFFF',
                marginLeft: -overlap,
                display:'inline-flex', alignItems:'center', justifyContent:'center',
                color: '#FFFFFF', fontSize: expanded ? 13.5 : 12, fontWeight: 700,
                cursor:'help',
              }}>+{overflow}</div>
            </Tip>
          )}
        </div>
        <span style={{
          fontSize: expanded ? 16.5 : 15.5,
          color: '#0F1115', fontWeight: 700,
          whiteSpace:'nowrap',
          fontVariantNumeric: 'tabular-nums',
          letterSpacing: -0.2,
        }}>
          {coperti}<span style={{color:'#9CA3AF', fontWeight: 600, margin:'0 1px'}}>/</span>{posti}
        </span>
        {editable && (
          <span style={{
            display:'inline-flex', alignItems:'center', justifyContent:'center',
            width: 16, height: 16, borderRadius: 4,
            color:'#9CA3AF', marginLeft: -2,
          }} aria-hidden>
            <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
              <path d="M8.5 2.5l1 1-5.5 5.5H3v-1L8.5 2.5z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
        )}
      </div>
  );
  if (!editable) {
    return <Tip text={tipText}>{Inner}</Tip>;
  }
  return (
    <div ref={ref} style={{position:'relative', display:'inline-flex'}}>
      <button onClick={(e) => { e.stopPropagation(); setEditing(v => !v); }} style={{
        background: editing ? '#F4F5F7' : 'transparent',
        border:'none', padding: '2px 6px 2px 2px', margin:'-2px -6px -2px -2px',
        borderRadius: 8, cursor:'pointer', fontFamily:'inherit',
        transition:'background .12s',
      }} onMouseEnter={(e)=>{ if(!editing) e.currentTarget.style.background='#FAFBFC'; }}
         onMouseLeave={(e)=>{ if(!editing) e.currentTarget.style.background='transparent'; }}>
        {Inner}
      </button>
      {editing && (
        <div onClick={(e)=>e.stopPropagation()} style={{
          position:'absolute', top:'calc(100% + 6px)', right: 0, zIndex: 30,
          background:'#FFFFFF', border:'1px solid #E5E7EB',
          borderRadius: 10, boxShadow:'0 12px 28px rgba(15,17,21,0.12), 0 2px 6px rgba(15,17,21,0.06)',
          padding: 12, minWidth: 220,
          fontFamily:'inherit',
        }}>
          <div style={{fontSize: 14.5, fontWeight: 700, color:'#6B7280', letterSpacing: 0.4, textTransform:'uppercase', marginBottom: 8}}>
            Posti del tavolo
          </div>
          <div style={{display:'flex', alignItems:'center', gap: 10, marginBottom: 10}}>
            <button onClick={() => onAdjust(Math.max(coperti || 1, posti - 1))} disabled={posti <= (coperti || 1)} style={{
              width: 32, height: 32, borderRadius: 8,
              border:'1px solid #E5E7EB', background: posti <= (coperti || 1) ? '#FAFBFC' : '#FFFFFF',
              cursor: posti <= (coperti || 1) ? 'default' : 'pointer',
              fontSize: 22, fontWeight: 600, color: posti <= (coperti || 1) ? '#D1D5DB' : '#0F1115',
              display:'inline-flex', alignItems:'center', justifyContent:'center',
              fontFamily:'inherit',
            }}>−</button>
            <div style={{flex: 1, textAlign:'center'}}>
              <span style={{fontSize: 26, fontWeight: 700, color:'#0F1115', fontVariantNumeric:'tabular-nums'}}>
                {posti}
              </span>
              <span style={{fontSize: 17, color:'#6B7280', fontWeight: 600, marginLeft: 4}}>
                posti
              </span>
            </div>
            <button onClick={() => onAdjust(Math.min(20, posti + 1))} disabled={posti >= 20} style={{
              width: 32, height: 32, borderRadius: 8,
              border:'1px solid #E5E7EB', background: posti >= 20 ? '#FAFBFC' : '#FFFFFF',
              cursor: posti >= 20 ? 'default' : 'pointer',
              fontSize: 22, fontWeight: 600, color: posti >= 20 ? '#D1D5DB' : '#0F1115',
              display:'inline-flex', alignItems:'center', justifyContent:'center',
              fontFamily:'inherit',
            }}>+</button>
          </div>
          {coperti > 0 && (
            <div style={{fontSize: 14.5, color:'#9CA3AF', marginBottom: 8, lineHeight: 1.4}}>
              Coperti seduti: <b style={{color:'#0F1115', fontWeight: 700}}>{coperti}</b>
            </div>
          )}
          {byup > 0 && (
            <div style={{
              fontSize: 15, color:'#6B7280', lineHeight: 1.4,
              padding:'8px 10px', background:'#FAFBFC', borderRadius: 6,
              display:'flex', alignItems:'center', gap: 6,
            }}>
              <span style={{
                width: 14, height: 14, borderRadius:'50%', background:'linear-gradient(135deg, #FF5A5F, #B53338)',
                display:'inline-flex', alignItems:'center', justifyContent:'center', flexShrink:0,
              }}><ByupB size={9}/></span>
              <span>{byup} {byup === 1 ? 'connesso' : 'connessi'} a byup · gli altri non hanno ancora scansionato il QR</span>
            </div>
          )}
        </div>
      )}
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
  // Sfumatura identica alle tessere della mappa: velo bianco sfumato verticale
  // sopra la tinta di stato (SALA_STATE_META.bg), su base bianca.
  const stateBg = `linear-gradient(180deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.08) 55%, rgba(255,255,255,0) 100%), linear-gradient(0deg, ${meta.bg}, ${meta.bg}) #FFFFFF`;
  const [hover, setHover] = React.useState(false);
  // Accent (border + top bar) per stato. Da pulire: resta sempre grigio, anche in critical.
  let accent = meta.dot;
  if (isAlerting) accent = '#A16207'; // ambra warn — MAI rosso
  // Dot stato (header). Da pulire: resta grigio (#64748B) per qualsiasi severity.
  let dotColor = meta.dot;
  if (t.state === 'prenotato') {
    dotColor = '#6D28D9'; // sempre viola (tono mappa) — lo stato è prenotazione, l'urgenza è nel triangolo
  }
  const showAlertTriangle = hasAlertTriangle(t);

  return (
    <div
      onClick={onToggle}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: stateBg,
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
      {/* Top accent bar — color accent dello stato (mai rosso su contabili, ok rosso pulire critical) */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        height: 3,
        background: `linear-gradient(90deg, ${accent} 0%, ${accent}59 100%)`,
        opacity: hover || expanded ? 1 : 0.85,
        transition: 'opacity 200ms ease-out',
      }}/>

      {/* === HEADER — Tav.X numero, posti, dot stato a dx (tooltip on hover) === */}
      <div style={{display: 'flex', alignItems: 'center', gap: 8, marginTop: 2}}>
        <span style={{
          fontSize: 20, fontWeight: 600, color: '#0F1115',
          letterSpacing: '-0.02em', lineHeight: 1,
        }}>Tav.{[t.id, ...(t.mergedTables || [])].sort((a, b) => a - b).join('-')}</span>
        {t.state === 'occupato' && (
          <Tip text={`Al tavolo da ${formatOpenDuration(t.sittingMin)}`}>
            <span style={{
              display:'inline-flex', alignItems:'center', gap: 3,
              fontSize: 15, color:'#6B7280', fontWeight: 600, cursor:'help',
              lineHeight: 1,
            }}>
              <ChairIcon size={12}/>
              {formatOpenDuration(t.sittingMin)}
            </span>
          </Tip>
        )}
        {t.state !== 'occupato' && (
          <span style={{fontSize: 15, color: '#6B7280', fontWeight: 500}}>· {t.posti}p</span>
        )}

        <span style={{flex:1}}/>
        {/* Triangolo rosso statico accanto al dot — prenotato in ritardo >20' OR da pulire >20' */}
        {showAlertTriangle && (
          <Tip text={t.state === 'dapulire' ? 'Tavolo non ancora liberato da oltre 20 minuti' : 'Prenotazione in ritardo di oltre 20 minuti'}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="#DC2626" stroke="none" style={{display:'block', cursor:'help'}}>
              <path d="M12 2 L22 20 H2 Z" fill="#DC2626"/>
              <path d="M12 9 V14 M12 17 h0.01" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" fill="none"/>
            </svg>
          </Tip>
        )}
        <Tip text={meta.label}>
          <span style={{
            width: 9, height: 9, borderRadius:'50%',
            background: dotColor,
            boxShadow: (urgent || isLate || isAlerting) ? `0 0 0 3px ${dotColor}33` : 'none',
            cursor:'help',
          }}/>
        </Tip>
      </div>

      {/* + Aggiungi articolo — riga dedicata sotto l'header, allineata a destra:
          resta in alto ma non collide con la X di chiusura del popup mappa */}
      {expanded && t.state === 'occupato' && (
        <div style={{display:'flex', justifyContent:'flex-end', margin:'-4px 0 -6px'}}>
          <button onClick={(e)=>{e.stopPropagation(); onAddArticle && onAddArticle(t);}}
            title="Aggiungi articolo al conto" style={{
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
              strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14 M5 12h14"/></svg>
            Aggiungi articolo
          </button>
        </div>
      )}

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
        </div>
      </div>
    );
  }
  if (t.state === 'occupato') {
    return (
      <div style={{display:'flex', alignItems:'center', gap: 8, flexWrap:'wrap'}}>
        <GuestAvatars coperti={t.coperti} byup={t.byup} byupWeb={t.byupWeb} posti={t.posti}/>
        {alert && (
          <div style={{
            fontSize: 15, fontWeight: 700,
            color: alert.tone === 'warn' ? '#92400E' : '#6B7280',
            background: alert.tone === 'warn' ? '#FEF3C7' : '#F3F4F6',
            padding: '3px 7px', borderRadius: 6,
            whiteSpace:'nowrap',
          }}>{alert.label}</div>
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
            {note && !noteMeta?.critical && (
              <div style={{
                fontSize: 16, color: noteMeta.color, fontWeight: 600,
                background: noteMeta.bg, padding:'6px 10px', borderRadius: 8,
                display:'inline-flex', alignItems:'center', gap: 6, alignSelf:'flex-start',
              }}>
                <NoteIcon type={note.tipo} size={12}/>
                {note.testo}
              </div>
            )}
            {extraNote && extraNoteMeta && !extraNoteMeta.critical && (
              <div style={{
                fontSize: 16, color: extraNoteMeta.color, fontWeight: 600,
                background: extraNoteMeta.bg, padding:'6px 10px', borderRadius: 8,
                display:'inline-flex', alignItems:'center', gap: 6, alignSelf:'flex-start',
              }}>
                <NoteIcon type={extraNote.tipo} size={12}/>
                {extraNote.testo}
              </div>
            )}
          </>
        )}

        {t.state === 'occupato' && (
          <>
            <div style={{display:'flex', flexDirection:'column', gap: 8}}>
              {t.party && (
                <div style={{fontSize: 19, fontWeight: 700, color:'#0F1115', letterSpacing:'-0.01em', lineHeight: 1.2,
                  overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>
                  {t.party}
                </div>
              )}
              <GuestAvatars coperti={t.coperti} byup={t.byup} byupWeb={t.byupWeb} posti={t.posti} expanded onAdjust={onAdjustCoperti}/>
            </div>

            {alert && (
              <div style={{
                fontSize: 15.5, fontWeight: 700,
                color: alert.tone === 'warn' ? '#92400E' : '#6B7280',
                background: alert.tone === 'warn' ? '#FEF3C7' : '#F3F4F6',
                padding:'6px 10px', borderRadius: 8, alignSelf:'flex-start',
              }}>{alert.label}</div>
            )}

            {note && !noteMeta?.critical && (
              <div style={{
                fontSize: 16, color: noteMeta.color, fontWeight: 600,
                background: noteMeta.bg, padding:'6px 10px', borderRadius: 8,
                display:'inline-flex', alignItems:'center', gap: 6, alignSelf:'flex-start',
              }}>
                <NoteIcon type={note.tipo} size={12}/>
                {note.testo}
              </div>
            )}
            {extraNote && extraNoteMeta && !extraNoteMeta.critical && (
              <div style={{
                fontSize: 16, color: extraNoteMeta.color, fontWeight: 600,
                background: extraNoteMeta.bg, padding:'6px 10px', borderRadius: 8,
                display:'inline-flex', alignItems:'center', gap: 6, alignSelf:'flex-start',
              }}>
                <NoteIcon type={extraNote.tipo} size={12}/>
                {extraNote.testo}
              </div>
            )}

            {t.ordini && t.ordini.length > 0 && <OrdiniList ordini={t.ordini}/>}

            <div style={{
              display:'flex', flexDirection:'column', alignItems:'flex-start',
              paddingTop: 12, marginTop: 2, gap: 2,
              borderTop:'1px solid rgba(15, 17, 21, 0.08)',
            }}>
              <div style={{display:'flex', alignItems:'baseline', gap: 8}}>
                <span style={{
                  fontSize: 32, fontWeight: 700, lineHeight: 1,
                  letterSpacing:'-0.02em', fontVariantNumeric:'tabular-nums',
                  color: occupatoSaldato ? '#065F46' : '#0F1115',
                }}>
                  €{occupatoSaldato ? t.conto.toFixed(2) : (t.daIncassare != null ? t.daIncassare : t.conto).toFixed(2)}
                </span>
                <span style={{
                  fontSize: 16, fontWeight: 700,
                  color: occupatoSaldato ? '#16A34A' : '#6B7280',
                }}>
                  {occupatoSaldato ? 'saldato' : 'da incassare'}
                </span>
              </div>
              {!occupatoSaldato && (
                <div style={{fontSize: 15, color:'#9CA3AF', fontWeight: 500, fontVariantNumeric:'tabular-nums'}}>
                  Totale conto €{t.conto.toFixed(2)}
                </div>
              )}
            </div>
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
                {t.nextReservation.posti && <span> · {t.nextReservation.posti} posti</span>}
              </div>
            )}
          </div>
        )}
      </div>

      {/* CTA contestuali — primaria nera + Modifica (apre la modale sposta/dividi/unisci) */}
      <ExpandedCTARow t={t} cta={cta} onEdit={onEdit}/>
    </>
  );
}

function ExpandedCTARow({ t, cta, onEdit }) {
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
      <button onClick={(e)=>{e.stopPropagation(); onEdit && onEdit(t);}}
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
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Badge stato + riga ordine — componenti CONDIVISI.
// Contratto anti-overflow (vale per ogni card conto/ordini):
//   riga = flex con wrap: [qty] [nome → ellissi] [badge];
//   il badge non supera MAI il padding della card (maxWidth:100%
//   + ellissi interna) e se non c'è spazio sulla riga va a capo
//   sotto il piatto invece di sforare dal bordo.
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
      display: 'flex', alignItems: 'center', flexWrap: 'wrap',
      columnGap: 8, rowGap: 3,
      padding: '5px 8px', borderRadius: 6,
      background: '#fff',
      border: alert ? '1.5px solid #DC2626' : '1px solid #F0F2F5',
      ...style,
    }}>
      <span style={{
        fontSize: 15, fontWeight: 700, color: '#0F1115',
        minWidth: 28, textAlign: 'center', flexShrink: 0,
      }}>{qty}×</span>
      {/* Il nome cede spazio fino al 45% della riga (ellissi); oltre,
          è il badge a passare alla riga sotto, mai a sforare. */}
      <span style={{
        flex: '1 1 0%', minWidth: '45%',
        fontSize: 15.5, color: '#0F1115', fontWeight: alert ? 700 : 500,
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {nome}{nomeExtra}
      </span>
      <span style={{
        flex: '0 0 auto', marginLeft: 'auto',
        maxWidth: '100%', minWidth: 0,
        display: 'inline-flex',
      }}>
        {pill}
      </span>
    </div>
  );
}

// Lista articoli realistica con stato cucina
function OrdiniList({ ordini }) {
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

  return (
    <div style={{display:'flex', flexDirection:'column', gap: 4,
      background:'#FAFBFC', borderRadius: 8, padding: 8,
      border: '1px solid #F0F2F5',
    }}>
      <div style={{
        fontSize: 13.5, fontWeight: 700, color:'#6B7280',
        letterSpacing: 0.6, textTransform:'uppercase', marginBottom: 2,
      }}>Ordini</div>
      {sorted.map((o, idx) => {
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
