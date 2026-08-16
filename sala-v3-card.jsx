// Sala v3 — Card con SVG icone (no emoji), byup chip, lista articoli realistica
// Inoltre: ContiApertiPanel laterale + flow "+ Articolo" inline

const SALA_V3_STATE_META = {
  libero:    { dot: '#16A34A', label: 'Libero',    plural: 'Liberi',    bg: '#fff',    mapBg: '#F0FDF4', border: '#F0F2F5', mapBorder: '#BBF7D0', accent: '#16A34A' },
  prenotato: { dot: '#3B82F6', label: 'Prenotato', plural: 'Prenotati', bg: '#F8FAFE', mapBg: '#F8FAFE', border: '#DBE7F9', mapBorder: '#DBE7F9', accent: '#3B82F6' },
  occupato:  { dot: '#D97706', label: 'Occupato',  plural: 'Occupati',  bg: '#fff',    mapBg: '#FFF7ED', border: '#F0F2F5', mapBorder: '#FED7AA', accent: '#D97706' },
  dapulire:  { dot: '#A16207', label: 'Da pulire', plural: 'Da pulire', bg: '#FEFCE8', mapBg: '#FEFCE8', border: '#FDE68A', mapBorder: '#FDE68A', accent: '#A16207' },
};

// SVG paths Lucide-style per ogni tipo di nota — tratto pulito, simboli riconoscibili
const NOTE_TYPE_META = {
  allergia: {
    // AlertTriangle
    path: 'M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z M12 9v4 M12 17h.01',
    color:'#DC2626', bg:'#FEE2E2', label:'Allergia', critical:true,
  },
  compleanno: {
    // PartyPopper-ish: conetto + stelle
    path: 'M5.8 11.3 2 22l10.7-3.79 M4 3h.01 M22 8h.01 M15 2h.01 M22 20h.01 M22 2 17 7l3 3 5-5 M9.6 4.6A2 2 0 1 1 11 8L7 13l-2-2 4-4z M12.5 8.5l5.5 5.5',
    color:'#7C3AED', bg:'#EDE9FE', label:'Compleanno',
  },
  bambini: {
    // Baby (lucide-inspired): viso con cresta
    path: 'M9 12h.01 M15 12h.01 M10 16c.5.3 1.2.5 2 .5s1.5-.2 2-.5 M19 6.3a9 9 0 0 1 1.8 3.9 2 2 0 0 1 0 3.6 9 9 0 0 1-17.6 0 2 2 0 0 1 0-3.6A9 9 0 0 1 12 3c2 0 3.5 1.1 3.5 2.5s-.9 2.5-2 2.5c-.8 0-1.5-.4-1.5-1',
    color:'#0891B2', bg:'#CFFAFE', label:'Bambini',
  },
  aziendale: {
    // Briefcase (lucide)
    path: 'M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16 M20 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z',
    color:'#475569', bg:'#F1F5F9', label:'Aziendale',
  },
  preferenza: {
    // Star (lucide)
    path: 'M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z',
    color:'#A16207', bg:'#FEF3C7', label:'Preferenza',
  },
  promo: {
    // Tag (lucide)
    path: 'M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z M7 7h.01',
    color:'#E04347', bg:'#FFE0DD', label:'Promo',
  },
};

const ORDINE_STATO_META = {
  ordinato:   { color:'#6B7280', bg:'#F1F2F5', label:'In coda',     icon:'M12 7v5l3 2' },
  in_cottura: { color:'#A16207', bg:'#FEF3C7', label:'In cottura',  icon:'M12 3 v3 M9 6 c0 2 -3 2 -3 5 c0 4 6 4 6 0 c0 -3 -3 -3 -3 -5 M3 14 H21' },
  pronto:     { color:'#065F46', bg:'#D1FAE5', label:'Completato',  icon:'M5 13 L9 17 L19 7' },
};

const PHASE_TONE = {
  neutral: { color:'#6B7280', bg:'#F1F2F5' },
  warn:    { color:'#A16207', bg:'#FEF3C7' },
  alert:   { color:'#991B1B', bg:'#FEE2E2' },
};

// ─────────────────────────────────────────────────────────
// Tooltip leggero — appare al hover, dark, non clippato grazie a position:fixed
function Tip({ text, children, position = 'top', delay = 250, disabled }) {
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
      style={{display:'inline-flex', alignItems:'center'}}>
      {children}
      {show && coords && ReactDOM.createPortal(
        <div style={{
          position:'fixed', left: coords.x, top: coords.y,
          transform: position === 'bottom' ? 'translate(-50%, 0)' : 'translate(-50%, -100%)',
          background:'#0F1115', color:'#fff',
          padding:'6px 10px', borderRadius: 6,
          fontSize: 11, fontWeight: 600, lineHeight: 1.35,
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
window.SalaTip = Tip;

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

// Indicatore di stato cucina — pill NEUTRA con progress bar segmentata
function PhaseIndicator({ phase, phaseTone, ordini }) {
  const isAlert = phase.id === 'alert';
  if (phase.id === 'corso' && ordini && ordini.length > 0) {
    const totQty = ordini.reduce((s,o) => s + o.qty, 0);
    const prontiQty = ordini.filter(o => o.stato === 'pronto').reduce((s,o) => s + o.qty, 0);
    const cotturaQty = ordini.filter(o => o.stato === 'in_cottura').reduce((s,o) => s + o.qty, 0);
    // Tono pulsante solo se ci sono pronti (azione richiesta)
    const hasPronti = prontiQty > 0;
    const allReady = prontiQty === totQty && totQty > 0;
    const inAttesa = totQty - prontiQty - cotturaQty;
    const tipText = allReady
      ? 'Sono pronti'
      : `${prontiQty} pronti · ${cotturaQty} in cottura${inAttesa > 0 ? ` · ${inAttesa} in coda` : ''}`;
    return (
      <Tip text={tipText}>
        <span style={{
          display:'inline-flex', alignItems:'center', gap: 4,
          fontSize: 10.5, fontWeight: 700,
          color: allReady ? '#16A34A' : (hasPronti ? '#0F1115' : '#6B7280'),
          whiteSpace:'nowrap', cursor:'help',
          fontVariantNumeric:'tabular-nums',
        }}>
          {prontiQty}/{totQty} completati{allReady ? ' ✓' : ''}
        </span>
      </Tip>
    );
  }
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, padding:'2px 7px', borderRadius: 4,
      color: phaseTone.color, background: phaseTone.bg,
      whiteSpace:'nowrap',
      animation: isAlert ? 'pulse 1.6s ease-in-out infinite' : 'none',
    }}>{phase.label}</span>
  );
}

// Avatar group — un colpo d'occhio sui coperti seduti e su chi è collegato a byup
// Rosso brand con "b" = utente byup (ordina dall'app). Grigio chiaro = ospite tradizionale.
// Format "X/Y" = seduti / capacità massima del tavolo.
function GuestAvatars({ coperti, byup, posti, expanded, onAdjust }) {
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
  const tipText = editable
    ? `${coperti}/${posti} coperti · clicca per modificare`
    : (
      `${coperti} ${coperti === 1 ? 'ospite seduto' : 'ospiti seduti'} su ${posti} ${posti === 1 ? 'posto' : 'posti'}` +
      (byup > 0 ? ` · ${byup} ${byup === 1 ? 'collegato' : 'collegati'} all'app byup` : '')
    );
  const Inner = (
    <div style={{display:'inline-flex', alignItems:'center', gap: expanded ? 8 : 6, cursor: editable ? 'pointer' : 'help'}}>
        <div style={{display:'inline-flex', alignItems:'center'}}>
          {avatars.map((isByup, i) => (
            <div key={i} style={{
              width: sz, height: sz, borderRadius: '50%',
              background: isByup ? '#E04347' : '#E5E7EB',
              border: '2px solid #FFFFFF',
              marginLeft: i === 0 ? 0 : -overlap,
              display:'inline-flex', alignItems:'center', justifyContent:'center',
              zIndex: visible - i,
              boxShadow: isByup ? '0 1px 2px rgba(224,67,71,0.25)' : 'none',
            }}>
              {isByup
                ? <ByupB size={expanded ? 13 : 11}/>
                : <span style={{width: expanded ? 7 : 6, height: expanded ? 7 : 6, borderRadius:'50%', background:'#9CA3AF'}}/>
              }
            </div>
          ))}
          {overflow > 0 && (
            <div style={{
              width: sz, height: sz, borderRadius: '50%',
              background: '#6B7280', border: '2px solid #FFFFFF',
              marginLeft: -overlap,
              display:'inline-flex', alignItems:'center', justifyContent:'center',
              color: '#FFFFFF', fontSize: expanded ? 9.5 : 8, fontWeight: 800,
            }}>+{overflow}</div>
          )}
        </div>
        <span style={{
          fontSize: expanded ? 12.5 : 11.5,
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
          <div style={{fontSize: 10.5, fontWeight: 700, color:'#6B7280', letterSpacing: 0.4, textTransform:'uppercase', marginBottom: 8}}>
            Coperti seduti
          </div>
          <div style={{display:'flex', alignItems:'center', gap: 10, marginBottom: 10}}>
            <button onClick={() => onAdjust(Math.max(1, coperti - 1))} disabled={coperti <= 1} style={{
              width: 32, height: 32, borderRadius: 8,
              border:'1px solid #E5E7EB', background: coperti <= 1 ? '#FAFBFC' : '#FFFFFF',
              cursor: coperti <= 1 ? 'default' : 'pointer',
              fontSize: 18, fontWeight: 600, color: coperti <= 1 ? '#D1D5DB' : '#0F1115',
              display:'inline-flex', alignItems:'center', justifyContent:'center',
              fontFamily:'inherit',
            }}>−</button>
            <div style={{flex: 1, textAlign:'center'}}>
              <span style={{fontSize: 22, fontWeight: 800, color:'#0F1115', fontVariantNumeric:'tabular-nums'}}>
                {coperti}
              </span>
              <span style={{fontSize: 13, color:'#6B7280', fontWeight: 600, marginLeft: 4}}>
                / {posti} posti
              </span>
            </div>
            <button onClick={() => onAdjust(Math.min(posti, coperti + 1))} disabled={coperti >= posti} style={{
              width: 32, height: 32, borderRadius: 8,
              border:'1px solid #E5E7EB', background: coperti >= posti ? '#FAFBFC' : '#FFFFFF',
              cursor: coperti >= posti ? 'default' : 'pointer',
              fontSize: 18, fontWeight: 600, color: coperti >= posti ? '#D1D5DB' : '#0F1115',
              display:'inline-flex', alignItems:'center', justifyContent:'center',
              fontFamily:'inherit',
            }}>+</button>
          </div>
          {byup > 0 && (
            <div style={{
              fontSize: 11, color:'#6B7280', lineHeight: 1.4,
              padding:'8px 10px', background:'#FAFBFC', borderRadius: 6,
              display:'flex', alignItems:'center', gap: 6,
            }}>
              <span style={{
                width: 14, height: 14, borderRadius:'50%', background:'#E04347',
                display:'inline-flex', alignItems:'center', justifyContent:'center', flexShrink:0,
              }}><ByupB size={9}/></span>
              <span>{byup} {byup === 1 ? 'connesso' : 'connessi'} a byup · gli altri non hanno scansionato il QR</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
function SalaV3Card({ t, expanded, onToggle, onAdd, onPay, onAddArticle, onConfirmCart, cart, onCartChange, onAdjustCoperti }) {
  const meta = SALA_V3_STATE_META[t.state];
  const phase = t.state === 'occupato' ? getOccupiedPhase(t) : null;
  const phaseTone = phase ? PHASE_TONE[phase.tone] : null;
  const note = t.note;
  const noteMeta = note ? NOTE_TYPE_META[note.type] : null;
  const noteIsCritical = noteMeta?.critical;
  const urgent = t.state === 'prenotato' && t.nextReservation?.inMin <= 15;

  const cta = (() => {
    if (t.state === 'libero')    return { label: t.nextReservation ? 'Apri tavolo' : 'Siedi ospiti', onClick: onAdd };
    if (t.state === 'prenotato') return { label: 'Segna arrivato', onClick: onAdd };
    if (t.state === 'occupato') {
      return { label: 'Salda ora', onClick: onPay };
    }
    if (t.state === 'dapulire')  return { label: 'Segna come pulito', onClick: onAdd };
  })();

  const borderLeftColor = phase?.tone === 'alert' ? '#DC2626'
    : meta.dot;

  // Differenziazione per stato SENZA stroke laterale:
  // - bg leggermente tonalizzato col colore stato (più visibile di prima)
  // - hover shadow tonalizzata col colore stato (firma "categoria")
  // - chip stato in alto a destra
  // - se urgente/alert: alone tonale persistente, non solo bordo
  const stateBg = {
    libero:    'linear-gradient(160deg, #F0FDF4 0%, #FFFFFF 75%)',
    prenotato: 'linear-gradient(160deg, #EFF6FF 0%, #FFFFFF 75%)',
    occupato:  'linear-gradient(160deg, #FFF1EE 0%, #FFFFFF 75%)',
    dapulire:  'linear-gradient(160deg, #FEFCE8 0%, #FFFFFF 75%)',
  }[t.state];
  const [hover, setHover] = React.useState(false);
  const accent = phase?.tone === 'alert' ? '#DC2626' : meta.dot;

  return (
    <div
      onClick={onToggle}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: stateBg,
        borderRadius: 14,
        border: `1px solid ${hover ? accent + '40' : 'rgba(15, 17, 21, 0.06)'}`,
        padding: expanded ? '14px 16px' : '12px 14px',
        cursor: 'pointer',
        transition: 'transform 220ms cubic-bezier(0.32, 0.72, 0, 1), box-shadow 220ms ease-out, border-color 200ms ease-out',
        display: 'flex', flexDirection: 'column', gap: expanded ? 10 : 6,
        boxShadow: expanded
          ? `0 12px 28px ${accent}26, 0 1px 2px rgba(15, 17, 21, 0.04)`
          : (hover
              ? `0 8px 20px ${accent}1F, 0 1px 2px rgba(15, 17, 21, 0.04)`
              : '0 1px 0 rgba(15, 17, 21, 0.04), 0 4px 12px rgba(15, 17, 21, 0.04)'),
        transform: (expanded || hover) ? 'translateY(-2px)' : 'translateY(0)',
        position: 'relative',
        overflow: 'hidden',
      }}>
      {/* Top accent bar — sostituisce il border-left.
          Solo 2px in alto, color accent dello stato. Niente stroke laterale. */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        height: 2,
        background: phase?.tone === 'alert'
          ? 'linear-gradient(90deg, #DC2626 0%, #F87171 100%)'
          : `linear-gradient(90deg, ${meta.dot} 0%, ${meta.dot}66 100%)`,
        opacity: hover || expanded ? 1 : 0.5,
        transition: 'opacity 200ms ease-out',
      }}/>

      {/* === HEADER — gerarchia: T.X numero grande, posti, status pill, dot a dx === */}
      <div style={{display: 'flex', alignItems: 'center', gap: 8, marginTop: 2}}>
        <span style={{
          fontSize: 16, fontWeight: 600, color: '#0F1115',
          letterSpacing: '-0.02em', lineHeight: 1,
        }}>T.{t.id}</span>
        {t.state !== 'occupato' && (
          <span style={{fontSize: 11, color: '#6B7280', fontWeight: 500}}>· {t.posti}p</span>
        )}
        {/* Status pill colorato — vivacizza la card e identifica categoria */}
        {!expanded && (
          <span style={{
            fontSize: 9.5, fontWeight: 600, padding: '2px 7px', borderRadius: 999,
            background: meta.mapBg || meta.bg,
            color: meta.accent,
            border: `1px solid ${meta.dot}1F`,
            letterSpacing: 0.3,
            marginLeft: 4,
          }}>
            {meta.label}
          </span>
        )}

        {/* Note non-critiche → solo icona */}
        {note && !noteIsCritical && (
          <Tip text={`${noteMeta.label}: ${note.text}`}>
            <span style={{display:'inline-flex', cursor:'help'}}>
              <NoteIcon type={note.type} size={13}/>
            </span>
          </Tip>
        )}

        <span style={{flex:1}}/>
        <Tip text={meta.label}>
          <span style={{
            width: 8, height: 8, borderRadius:'50%',
            background: meta.dot,
            boxShadow: urgent || phase?.tone === 'alert' ? `0 0 0 3px ${meta.dot}33` : 'none',
            cursor:'help',
          }}/>
        </Tip>
      </div>

      {/* Allergia: SEMPRE visibile */}
      {note && noteIsCritical && (
        <div style={{
          display:'flex', alignItems:'center', gap: 5,
          fontSize: 11, fontWeight: 700, color: noteMeta.color,
          background: noteMeta.bg, padding: '3px 7px', borderRadius: 4,
          lineHeight: 1.25,
        }}>
          <NoteIcon type="allergia" size={12}/>
          <span style={{whiteSpace: expanded ? 'normal' : 'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>
            {note.text}
          </span>
        </div>
      )}

      {!expanded && <SalaV3CardCompact t={t} phase={phase} phaseTone={phaseTone} urgent={urgent}/>}
      {expanded && <SalaV3CardExpanded t={t} phase={phase} phaseTone={phaseTone} cta={cta} note={note} noteMeta={noteMeta}
        onAddArticle={onAddArticle} onConfirmCart={onConfirmCart} cart={cart} onCartChange={onCartChange}
        onAdjustCoperti={onAdjustCoperti}/>}
    </div>
  );
}

function SalaV3CardCompact({ t, phase, phaseTone, urgent }) {
  if (t.state === 'libero') {
    return t.nextReservation ? (
      <div style={{display:'flex', alignItems:'baseline', gap: 6, fontSize: 11.5, color:'#9CA3AF'}}>
        <span style={{fontWeight: 500}}>Disponibile</span>
        <span>·</span>
        <span style={{overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>
          → <b style={{fontWeight: 600}}>{t.nextReservation.time}</b> {t.nextReservation.name}
        </span>
      </div>
    ) : (
      <div style={{fontSize: 11.5, color: '#16A34A', fontWeight: 600}}>Disponibile</div>
    );
  }
  if (t.state === 'prenotato') {
    return (
      <div style={{display:'flex', flexDirection:'column', gap: 2}}>
        <div style={{fontSize: 10.5, fontWeight: 700, color: '#3B82F6', letterSpacing: 0.3, textTransform:'uppercase'}}>
          Prenotato
        </div>
        <div style={{display:'flex', alignItems:'baseline', gap: 6}}>
          <span style={{fontSize: 14, fontWeight: 800, color: urgent ? '#DC2626' : '#0F1115'}}>
            {t.nextReservation.time}
          </span>
          <span style={{fontSize: 11.5, color: '#0F1115', fontWeight: 600,
            overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>
            {t.nextReservation.name} · {t.nextReservation.posti}p
          </span>
          {urgent && (
            <Tip text={`Arriva tra ${t.nextReservation.inMin} minuti`}>
              <span style={{
                marginLeft:'auto', fontSize: 10, fontWeight: 800,
                color:'#fff', background:'#DC2626',
                padding:'1px 6px', borderRadius: 999,
                cursor:'help',
              }}>{t.nextReservation.inMin}'</span>
            </Tip>
          )}
        </div>
      </div>
    );
  }
  if (t.state === 'occupato') {
    return (
      <>
        <div style={{display:'flex', alignItems:'center', gap: 6}}>
          <span style={{fontSize: 18, fontWeight: 800, color: '#0F1115', letterSpacing: -0.4}}>
            €{t.conto.toFixed(0)}
          </span>
          <Tip text={`Seduti da ${t.sittingMin} minuti`}>
            <span style={{fontSize: 11, color:'#6B7280', fontWeight: 600, cursor:'help'}}>· {t.sittingMin}'</span>
          </Tip>
          <span style={{flex:1}}/>
          <GuestAvatars coperti={t.coperti} byup={t.byup} posti={t.posti}/>
        </div>
        {phase && (
          <div style={{display:'flex', alignItems:'center', gap: 5, flexWrap:'wrap'}}>
            <PhaseIndicator phase={phase} phaseTone={phaseTone} ordini={t.ordini}/>
          </div>
        )}
      </>
    );
  }
  if (t.state === 'dapulire') {
    return (
      <div style={{display:'flex', alignItems:'baseline', gap: 4, fontSize: 11.5}}>
        <span style={{color:'#A16207', fontWeight: 700}}>Liberato {t.freedMinAgo}' fa</span>
        {t.nextReservation && (
          <span style={{color:'#6B7280', marginLeft:'auto', fontSize: 10.5}}>
            → {t.nextReservation.time}
          </span>
        )}
      </div>
    );
  }
  return null;
}

function SalaV3CardExpanded({ t, phase, phaseTone, cta, note, noteMeta, onAddArticle, onConfirmCart, cart, onCartChange, onAdjustCoperti }) {
  const [adding, setAdding] = React.useState(false);

  return (
    <>
      <div style={{display:'flex', flexDirection:'column', gap: 8}}>
        {t.state === 'libero' && t.nextReservation && (
          <div style={{fontSize: 12.5, color:'#0F1115'}}>
            Prossima prenotazione: <b>{t.nextReservation.time}</b><br/>
            {t.nextReservation.name} · {t.nextReservation.posti} posti
            <span style={{color:'#6B7280'}}> · tra {t.nextReservation.inMin}'</span>
          </div>
        )}

        {t.state === 'prenotato' && t.nextReservation && (
          <>
            <div style={{fontSize: 15, fontWeight: 700, color:'#0F1115'}}>
              {t.nextReservation.time} · {t.nextReservation.name}
            </div>
            <div style={{fontSize: 12, color:'#6B7280'}}>
              {t.nextReservation.posti} posti · arriva tra {t.nextReservation.inMin}'
            </div>
            {note && !noteMeta?.critical && (
              <div style={{
                fontSize: 12, color: noteMeta.color, fontWeight: 600,
                background: noteMeta.bg, padding:'5px 9px', borderRadius: 6,
                display:'inline-flex', alignItems:'center', gap: 6, alignSelf:'flex-start',
              }}>
                <NoteIcon type={note.type} size={12}/>
                {note.text}
              </div>
            )}
          </>
        )}

        {t.state === 'occupato' && (
          <>
            {/* Header expanded: importo + party + avatar coperti */}
            <div style={{display:'flex', flexDirection:'column', gap: 6}}>
              <div style={{display:'flex', alignItems:'baseline', gap: 8, flexWrap:'wrap', rowGap: 0}}>
                <span style={{fontSize: 22, fontWeight: 800, color:'#0F1115', letterSpacing: -0.5, lineHeight: 1.1}}>
                  €{t.conto.toFixed(2)}
                </span>
                <Tip text={`Coperti accomodati da ${t.sittingMin} minuti`}>
                  <span style={{fontSize: 11, color:'#6B7280', whiteSpace:'nowrap', cursor:'help'}}>· in tavolo da {t.sittingMin}'</span>
                </Tip>
              </div>
              {t.party && (
                <div style={{fontSize: 13, fontWeight: 700, color:'#0F1115'}}>
                  {t.party}
                </div>
              )}
              <GuestAvatars coperti={t.coperti} byup={t.byup} posti={t.posti} expanded
                onAdjust={onAdjustCoperti}/>
            </div>

            {phase && phase.id !== 'corso' && (
              <div style={{
                fontSize: 11.5, fontWeight: 700,
                color: phaseTone.color, background: phaseTone.bg,
                padding:'6px 10px', borderRadius: 6, alignSelf:'flex-start',
                animation: phase.id === 'alert' ? 'pulse 1.6s ease-in-out infinite' : 'none',
              }}>{phase.label}</div>
            )}

            {/* Lista articoli ordinati */}
            {t.ordini && t.ordini.length > 0 && <OrdiniList ordini={t.ordini}/>}

            {/* Note non critiche */}
            {note && !noteMeta?.critical && (
              <div style={{
                fontSize: 12, color: noteMeta.color, fontWeight: 600,
                background: noteMeta.bg, padding:'5px 9px', borderRadius: 6,
                display:'inline-flex', alignItems:'center', gap: 6, alignSelf:'flex-start',
              }}>
                <NoteIcon type={note.type} size={12}/>
                {note.text}
              </div>
            )}

            {/* Cart in costruzione */}
            {cart && cart.tableId === t.id && cart.items.length > 0 && (
              <CartInline cart={cart} onChange={onCartChange} onConfirm={onConfirmCart}/>
            )}
          </>
        )}

        {t.state === 'dapulire' && (
          <>
            <div style={{fontSize: 13, fontWeight: 700, color:'#0F1115'}}>
              Tavolo liberato {t.freedMinAgo} min fa
            </div>
            {t.nextReservation && (
              <div style={{fontSize: 12, color:'#6B7280'}}>
                Prossima prenotazione: <b>{t.nextReservation.time}</b> · {t.nextReservation.name}
              </div>
            )}
          </>
        )}
      </div>

      {/* CTA + secondaria */}
      <div style={{display:'flex', gap: 6}}>
        <button onClick={(e)=>{e.stopPropagation(); cta.onClick();}} style={{
          flex: 1, padding:'10px 14px',
          background:'#0F1115', color:'#fff', border:'none',
          borderRadius: 8, fontSize: 12.5, fontWeight: 700,
          cursor:'pointer', fontFamily:'inherit', minHeight: 40,
        }}>{cta.label}</button>
        {t.state === 'occupato' && (
          <button onClick={(e)=>{e.stopPropagation(); onAddArticle && onAddArticle(t);}} style={{
            padding:'10px 14px',
            background:'#fff', color:'#0F1115',
            border:'1px solid #E5E7EB', borderRadius: 8,
            fontSize: 12.5, fontWeight: 700,
            cursor:'pointer', fontFamily:'inherit',
            minHeight: 40, whiteSpace:'nowrap',
            display:'inline-flex', alignItems:'center', gap: 5,
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14 M5 12h14"/></svg>
            Articolo
          </button>
        )}
      </div>
    </>
  );
}

// Lista articoli realistica con stato cucina
function OrdiniList({ ordini }) {
  // Ordina: pronto → in_cottura → ordinato
  const order = { pronto: 0, in_cottura: 1, ordinato: 2 };
  const sorted = [...ordini].sort((a,b) => order[a.stato] - order[b.stato]);

  return (
    <div style={{display:'flex', flexDirection:'column', gap: 4,
      background:'#FAFBFC', borderRadius: 8, padding: 8,
      border: '1px solid #F0F2F5',
    }}>
      <div style={{
        fontSize: 9.5, fontWeight: 800, color:'#6B7280',
        letterSpacing: 0.6, textTransform:'uppercase', marginBottom: 2,
      }}>Ordini in cucina</div>
      {sorted.map(o => {
        const s = ORDINE_STATO_META[o.stato];
        const isReady = o.stato === 'pronto';
        const isAlert = o.alert === 'allergia';
        return (
          <div key={o.id} style={{
            display:'flex', alignItems:'center', gap: 8,
            padding:'5px 8px', borderRadius: 6,
            background: '#fff',
            border: isAlert ? '1.5px solid #DC2626' : '1px solid #F0F2F5',
          }}>
            <span style={{
              fontSize: 11, fontWeight: 700, color:'#0F1115',
              minWidth: 18, textAlign:'center',
            }}>{o.qty}×</span>
            <span style={{flex:1, fontSize: 11.5, color:'#0F1115', fontWeight: isAlert ? 700 : 500}}>
              {o.nome}
              {isAlert && (
                <span style={{color: '#DC2626', marginLeft: 6, fontSize: 10, fontWeight: 700, letterSpacing: '0.04em', display: 'inline-flex', alignItems: 'center', gap: 3}}>
                  <PnI.Alert size={10} color="#DC2626"/> ALLERGIA
                </span>
              )}
            </span>
            {/* Status pill */}
            <Tip text={o.stato === 'pronto' ? 'Pronto da servire' : o.stato === 'in_cottura' ? `In cottura · ETA ${o.etaMin}'` : `In coda · inizia tra ${o.etaMin}'`}>
              <span style={{
                fontSize: 9.5, fontWeight: 800,
                color: s.color, background: s.bg,
                padding:'2px 7px', borderRadius: 4,
                display:'inline-flex', alignItems:'center', gap: 3,
                whiteSpace:'nowrap', cursor:'help',
              }}>
                {s.label}{o.etaMin > 0 && o.stato !== 'pronto' ? ` · ${o.etaMin}'` : ''}
              </span>
            </Tip>
            {/* Origin tag */}
            {o.origin === 'byup' && (
              <Tip text="Ordinato dall'app byup dal cliente al tavolo">
                <span style={{
                  fontSize: 8.5, fontWeight: 700, color:'#E04347',
                  background:'#FFE0DD', padding:'1px 5px', borderRadius: 3,
                  letterSpacing: 0.4, textTransform:'uppercase', cursor:'help',
                }}>byup</span>
              </Tip>
            )}
          </div>
        );
      })}
    </div>
  );
}

// Cart inline che mostra gli articoli che lo staff sta per aggiungere
function CartInline({ cart, onChange, onConfirm }) {
  const total = cart.items.reduce((s, i) => s + i.qty * i.prezzo, 0);
  return (
    <div style={{
      background:'#FFF7ED', border:'1.5px solid #FDBA74',
      borderRadius: 8, padding: 10,
      display:'flex', flexDirection:'column', gap: 6,
    }}>
      <div style={{
        fontSize: 10, fontWeight: 800, color:'#9A3412',
        letterSpacing: 0.6, textTransform:'uppercase',
      }}>Da inviare in cucina</div>
      {cart.items.map((it, idx) => (
        <div key={idx} style={{display:'flex', alignItems:'center', gap: 6}}>
          <span style={{fontSize: 11, fontWeight: 700, color:'#0F1115', minWidth: 28}}>{it.qty}×</span>
          <span style={{flex:1, fontSize: 11.5, color:'#0F1115'}}>{it.nome}</span>
          <span style={{fontSize: 11, color:'#6B7280'}}>€{(it.qty * it.prezzo).toFixed(2)}</span>
          <button onClick={(e)=>{e.stopPropagation();
            onChange({...cart, items: cart.items.map((x,i) => i===idx ? {...x, qty: x.qty+1} : x)});
          }} style={btnIconStyle}>+</button>
          <button onClick={(e)=>{e.stopPropagation();
            const items = it.qty > 1
              ? cart.items.map((x,i) => i===idx ? {...x, qty: x.qty-1} : x)
              : cart.items.filter((_,i) => i!==idx);
            onChange({...cart, items});
          }} style={btnIconStyle}>−</button>
        </div>
      ))}
      <div style={{display:'flex', alignItems:'center', gap: 8, marginTop: 4, paddingTop: 6, borderTop:'1px dashed #FDBA74'}}>
        <span style={{fontSize: 11, color:'#6B7280', fontWeight: 600}}>Totale</span>
        <span style={{fontSize: 14, fontWeight: 800, color:'#0F1115'}}>€{total.toFixed(2)}</span>
        <span style={{flex:1}}/>
        <button onClick={(e)=>{e.stopPropagation(); onConfirm();}} style={{
          padding:'8px 14px', background:'#9A3412', color:'#fff', border:'none',
          borderRadius: 6, fontSize: 12, fontWeight: 700, cursor:'pointer',
          fontFamily:'inherit',
        }}>Conferma → cucina</button>
      </div>
    </div>
  );
}

const btnIconStyle = {
  width: 22, height: 22, borderRadius: 4,
  background:'#fff', border:'1px solid #FDBA74',
  color:'#9A3412', fontSize: 14, fontWeight: 800,
  cursor:'pointer', fontFamily:'inherit', padding: 0,
  display:'grid', placeItems:'center',
};

// ─────────────────────────────────────────────────────────
// Pannello Conti Aperti
// ─────────────────────────────────────────────────────────
function ContiApertiPanel({ collapsed, onToggle, onSalda }) {
  const conti = SALA_V3_CONTI_APERTI;
  const totDaSaldare = conti.reduce((s,c)=>s+c.daSaldare, 0);
  const piuVecchio = Math.max(...conti.map(c=>c.oreFa));
  const oldThreshold = (window.SALA_V3_THRESHOLDS || SALA_V3_THRESHOLDS).oldBillHours;

  if (collapsed) {
    return (
      <div onClick={onToggle} style={{
        width: 40, alignSelf:'stretch', flexShrink: 0,
        background:'#fff', border:'1px solid #F0F2F5',
        borderRadius: 12, cursor:'pointer',
        display:'flex', flexDirection:'column', alignItems:'center',
        padding:'14px 0', gap: 10,
      }}>
        <span style={{
          writingMode:'vertical-rl', transform:'rotate(180deg)',
          fontSize: 11, fontWeight: 800, color:'#0F1115',
          letterSpacing: 0.6, textTransform:'uppercase', whiteSpace:'nowrap',
        }}>Conti aperti</span>
        <span style={{
          background:'#E04347', color:'#fff',
          fontSize: 12, fontWeight: 800,
          padding:'2px 8px', borderRadius: 999,
        }}>{conti.length}</span>
      </div>
    );
  }

  return (
    <aside style={{
      width: 260, flexShrink: 0, alignSelf: 'stretch',
      background: '#fff',
      border: '1px solid rgba(15, 17, 21, 0.06)',
      borderRadius: 14,
      boxShadow: '0 1px 0 rgba(15,17,21,0.04), 0 6px 18px rgba(15,17,21,0.04)',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
    }}>
      <div style={{
        padding: '12px 14px', borderBottom: '1px solid rgba(15, 17, 21, 0.06)',
        display: 'flex', alignItems: 'center', gap: 8,
        background: '#FAFBFC',
      }}>
        <span style={{fontSize: 12, fontWeight: 600, color: '#0F1115', letterSpacing: 0.4, textTransform: 'uppercase'}}>
          Conti aperti
        </span>
        <span style={{
          fontSize: 11, fontWeight: 600,
          background: '#FF5A5F', color: '#fff',
          padding: '2px 8px', borderRadius: 999,
          letterSpacing: 0.2,
        }}>{conti.length}</span>
        <span style={{flex: 1}}/>
        <button onClick={onToggle} title="Comprimi" style={{
          background: 'transparent', border: 'none', cursor: 'pointer',
          color: '#6B7280', fontFamily: 'inherit', fontSize: 18, padding: 4,
          lineHeight: 1,
        }}>›</button>
      </div>

      {/* Hero "Da incassare" — fill BRAND magenta in negativo. Niente più gradiente
          viola/rosa: una sola tinta brand piena, scritte bianche, stat-card divise
          da divider bianco semi-trasparente. */}
      <div style={{
        padding: 16,
        background: 'linear-gradient(180deg, #FF6A6F 0%, #E04347 100%)',
        color: '#fff',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Glow ambient — punto accent decorativo top-right */}
        <div style={{
          position: 'absolute', top: -30, right: -30,
          width: 120, height: 120, borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.12)',
          filter: 'blur(20px)',
          pointerEvents: 'none',
        }}/>
        <div style={{
          position: 'relative',
          fontSize: 10.5, fontWeight: 600, color: 'rgba(255, 255, 255, 0.85)',
          letterSpacing: 0.4, textTransform: 'uppercase',
        }}>
          Da incassare
        </div>
        <div style={{
          position: 'relative',
          fontSize: 32, fontWeight: 600, color: '#fff',
          letterSpacing: '-0.02em', lineHeight: 1.1, marginTop: 4,
          fontVariantNumeric: 'tabular-nums',
        }}>
          €{totDaSaldare.toFixed(2)}
        </div>
        <div style={{
          position: 'relative',
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10,
          marginTop: 14, paddingTop: 12,
          borderTop: '1px solid rgba(255, 255, 255, 0.20)',
        }}>
          <div>
            <div style={{fontSize: 10, color: 'rgba(255,255,255,0.78)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.3}}>Più vecchio</div>
            <div style={{
              fontSize: 14, fontWeight: 600, color: '#fff', marginTop: 2,
              fontVariantNumeric: 'tabular-nums',
            }}>
              {piuVecchio.toFixed(1)}h fa
            </div>
          </div>
          <div>
            <div style={{fontSize: 10, color: 'rgba(255,255,255,0.78)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.3}}>Saldati oggi</div>
            <div style={{
              fontSize: 14, fontWeight: 600, color: '#fff', marginTop: 2,
              fontVariantNumeric: 'tabular-nums',
            }}>12 / 17</div>
          </div>
        </div>
      </div>

      {/* Lista conti — card interamente cliccabili (onClick = onSalda).
          Niente più stroke laterale: sfondo tonale + accent halo + hover. */}
      <div className="pn-scroll" style={{flex: 1, overflow: 'auto', padding: 10}}>
        {conti.map((c, i) => (
          <ContoApertoCard
            key={i}
            conto={c}
            isOld={c.oreFa > oldThreshold}
            onSalda={() => onSalda && onSalda(c)}
          />
        ))}
      </div>
    </aside>
  );
}

// Card singolo conto aperto — interamente cliccabile, hover lift, accent tonale.
// Niente più border-left 3px: usa background tonale + halo nei dot urgenza.
function ContoApertoCard({conto, isOld, onSalda}) {
  const [hover, setHover] = React.useState(false);
  const accent = isOld ? '#DC2626' : '#FF5A5F';
  return (
    <div
      onClick={onSalda}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        padding: '12px 12px', borderRadius: 10,
        background: isOld
          ? (hover ? '#FEE2E2' : '#FEF2F2')
          : (hover ? '#FFF1EE' : '#FAFBFC'),
        marginBottom: 8, cursor: 'pointer',
        border: `1px solid ${hover ? accent + '40' : 'rgba(15, 17, 21, 0.06)'}`,
        boxShadow: hover
          ? `0 6px 16px ${accent}1F, 0 1px 2px rgba(15,17,21,0.04)`
          : '0 1px 0 rgba(15, 17, 21, 0.02)',
        transform: hover ? 'translateY(-1px)' : 'translateY(0)',
        transition: 'transform 200ms cubic-bezier(0.32, 0.72, 0, 1), box-shadow 200ms ease-out, background 150ms ease-out, border-color 150ms ease-out',
      }}>
      <div style={{display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6}}>
        {/* Dot urgenza con halo se old */}
        <span style={{
          width: 7, height: 7, borderRadius: '50%',
          background: accent,
          boxShadow: isOld ? `0 0 0 3px ${accent}26` : 'none',
          flexShrink: 0,
        }}/>
        <span style={{fontSize: 12.5, fontWeight: 600, color: '#0F1115', letterSpacing: '-0.01em'}}>{conto.tavolo}</span>
        <span style={{
          fontSize: 11, color: '#6B7280', flex: 1,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          fontWeight: 500,
        }}>
          · {conto.cliente}
        </span>
        <span style={{
          fontSize: 10.5, fontWeight: 600,
          color: isOld ? '#DC2626' : '#6B7280',
          fontVariantNumeric: 'tabular-nums',
        }}>{conto.oreFa.toFixed(1)}h</span>
      </div>
      <div style={{display: 'flex', alignItems: 'baseline', gap: 6}}>
        <span style={{
          fontSize: 18, fontWeight: 600, color: '#0F1115',
          letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums',
        }}>
          €{conto.daSaldare.toFixed(2)}
        </span>
        <span style={{fontSize: 11, color: '#9CA3AF', fontWeight: 500}}>
          / €{conto.totTavolo.toFixed(2)}
        </span>
        <span style={{flex: 1}}/>
        {/* "Salda →" come affordance, l'intera card è già cliccabile */}
        <span style={{
          fontSize: 11, fontWeight: 600,
          color: hover ? accent : '#6B7280',
          display: 'inline-flex', alignItems: 'center', gap: 3,
          transition: 'color 150ms ease-out',
        }}>
          Salda
          <span style={{
            transform: hover ? 'translateX(3px)' : 'translateX(0)',
            transition: 'transform 200ms ease-out',
          }}>→</span>
        </span>
      </div>
    </div>
  );
}

window.SalaV3Card = SalaV3Card;
window.SALA_V3_STATE_META = SALA_V3_STATE_META;
window.NOTE_TYPE_META = NOTE_TYPE_META;
window.NoteIcon = NoteIcon;
window.ContiApertiPanel = ContiApertiPanel;
