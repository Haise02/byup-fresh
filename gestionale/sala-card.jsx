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

// Il vocabolario degli stati dei piatti (In attesa / In preparazione /
// Pronto / Consegnato) vive in sala-salda-modal.jsx, SALDA_STATO_META: la
// card non elenca più i piatti — il conto sì, ed è lì che si leggono.

// Open duration helpers (file-scope so all components can reuse)
// MOD 3: Formato tempo uniforme — "Xh Y'" senza "fa". <60' → solo minuti. Minuti=0 → solo ore.
function formatOpenDuration(totalMinutes) {
  const minutes = Math.max(0, Math.round(totalMinutes));
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  // Format: "5h30'" (NO spazio) · "2h" (minuti=0) · "45'" (ore=0) — NO "fa"
  if (hours === 0) return `${remainder}'`;
  if (remainder === 0) return `${hours}h`;
  return `${hours}h${remainder}'`;
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

// Marchio byup compatto dentro gli avatar dei coperti collegati all'app —
// non piu la lettera "b" col font di sistema, ma il segno vero sbiancato.
// Vive in PnI.MarkWhite perche lo stesso bollino torna in Contabilita e nel
// calendario delle prenotazioni.
function ByupB({ size = 9 }) {
  return <PnI.MarkWhite size={size}/>;
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
                ? <ByupB size={expanded ? 11 : 9}/>
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
// onClose: se presente la card vive in un POPUP (dettaglio mappa) — la X di
// chiusura entra nella riga dell'header come fratello di Modifica (niente
// overlay in absolute) e la card diventa statica: cursore normale, nessun
// hover di bordo, il click sul corpo non fa toggle.
// ─── Card "Quadrante" — curva spring condivisa (stessa delle tessere mappa) ───
const SALA_EASE = 'cubic-bezier(0.32, 0.72, 0, 1)';
const SALA_POP  = 'cubic-bezier(0.34, 1.56, 0.64, 1)'; // apertura elastica "giocosa"

// Riga info della card "Costa colorata" — un solo testo per stato
function salaInfoText(t, { alert, isLate, lateMin }) {
  if (t.state === 'occupato') {
    if (alert) return { text: alert.label, color: alert.tone === 'warn' ? '#92400E' : '#6B7280' };
    return { text: t.sittingMin != null ? `Al tavolo da ${formatOpenDuration(t.sittingMin)}` : 'Al tavolo', color: '#6B7280' };
  }
  if (t.state === 'prenotato') {
    const res = t.nextReservation;
    if (!res) return { text: 'Prenotato', color: '#6B7280' };
    // Ora e nome sono un dato quieto, sempre in nero: il ritardo lo dice il
    // testo ("· ritardo X'"), non la tinta della riga.
    return { text: `${res.time} · ${res.name}` + (isLate ? ` · ritardo ${lateMin}'` : ''), color: '#0F1115' };
  }
  if (t.state === 'dapulire') {
    // Il tempo trascorso dalla liberazione non si mostra mai, nemmeno da
    // aperta: a dettare la fretta è la prossima prenotazione, non i minuti.
    // L'orario è un dato quieto e sta in nero: a segnalare l'urgenza sono
    // l'etichetta di stato e il triangolo sul badge, non l'ora in sé.
    return {
      text: t.nextReservation ? `poi ${t.nextReservation.time}` : '',
      color: '#0F1115',
    };
  }
  const res = t.nextReservation;
  return { text: res ? `Prossima ${res.time} · ${res.name}` : 'Nessuna prenotazione', color: '#6B7280' };
}

function SalaCard({ t, expanded, onToggle, onAdd, onPay, onAddArticle, onAdjustReservationPosti, onLibera, onEdit, onClose }) {
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
  // Severity tono ordini: 'warn' ambra · 'info' grigio · 'alert' (legacy) → 'warn'
  const isAlerting = alert?.tone === 'warn';

  // CTA primaria contestuale (Prompt 3 §5)
  const occupatoSaldato = t.state === 'occupato' && (t.contoSaldato || (t.daIncassare === 0 && t.conto > 0));
  const cta = (() => {
    if (t.state === 'libero')    return { label: 'Apri tavolo', onClick: onAdd };
    if (t.state === 'prenotato') return { label: 'Apri tavolo', onClick: onAdd };
    if (t.state === 'occupato')  return occupatoSaldato
      ? { label: 'Libera tavolo', onClick: () => onLibera && onLibera(t) }
      // «Vai al conto», non più «Salda ora»: quel pulsante apre il CONTO —
      // riepilogo e correzioni — e l'incasso è un passo dopo. Promettere il
      // saldo su un tasto che porta a un riepilogo era una promessa sbagliata.
      : { label: 'Vai al conto', onClick: onPay };
    if (t.state === 'dapulire')  return { label: 'Segna come pronto', onClick: onAdd };
  })();
  // Le azioni sul tavolo (sposta / dividi / unisci + azioni di stato) vivono
  // nella modale "Modifica tavolo" aperta dal pulsante Modifica (onEdit).

  // Severity "Da pulire" progressiva
  const pulireSev = t.state === 'dapulire' ? getPulireSeverity(t.minutiDaPulire ?? t.freedMinAgo) : 'normal';
  const isPopup = !!onClose;
  const [hover, setHover] = React.useState(false);
  // Schiarisce (f>0) o scurisce (f<0) un colore hex — per il gradiente header
  // Accent (border + top bar) per stato. Da pulire: resta sempre grigio, anche in critical.
  let accent = meta.dot;
  if (isAlerting) accent = '#A16207'; // ambra warn — MAI rosso
  const showAlertTriangle = hasAlertTriangle(t);

  const info = salaInfoText(t, { alert, isLate, lateMin });
  // Numero mostrato in testata: i seduti (o prenotati) dove ci sono, altrimenti
  // la capienza come ripiego su libero / da liberare. Mai i due insieme.
  const capienza = t.posti;
  const seduti = t.state === 'occupato' ? t.coperti : (t.state === 'prenotato' ? (t.nextReservation && t.nextReservation.posti) : null);

  return (
    <div
      onClick={isPopup ? undefined : onToggle}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        // Card "Badge tondo": cerchio col numero del tavolo che si ACCENDE
        // del colore di stato all'apertura (da sbiadito a pieno).
        background: '#FFFFFF',
        borderRadius: 16,
        border: `1px solid ${expanded ? meta.border : 'rgba(15, 17, 21, 0.06)'}`,
        cursor: isPopup ? 'default' : 'pointer',
        overflow: 'hidden',
        boxShadow: expanded
          ? `0 16px 36px -10px ${accent}35, 0 2px 6px rgba(15, 17, 21, 0.05)`
          : (hover && !isPopup
              ? '0 8px 20px rgba(15, 17, 21, 0.08), 0 1px 3px rgba(15, 17, 21, 0.04)'
              : '0 1px 0 rgba(15, 17, 21, 0.03), 0 5px 14px rgba(15, 17, 21, 0.05)'),
        transform: expanded ? 'scale(1.012)' : (!isPopup && hover ? 'translateY(-2px)' : 'none'),
        transition: `transform 520ms ${SALA_POP}, box-shadow 380ms ${SALA_EASE}, border-color 260ms ease-out`,
        position: 'relative',
      }}>

      {/* === RIGA PRINCIPALE — badge tondo · stato+info · azioni === */}
      <div style={{display:'flex', alignItems:'center', gap: 12, padding:'14px 16px', minHeight: 104}}>
        {/* Badge: solo il numero, centrato. Da sbiadito ad ACCESO all'apertura. */}
        <div style={{position:'relative', flexShrink: 0}}>
          {expanded && <style>{`@keyframes salaBadgePop {
            0%   { transform: scale(1) rotate(0deg); }
            45%  { transform: scale(1.18) rotate(-7deg); }
            100% { transform: scale(1.08) rotate(-3deg); }
          }`}</style>}
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: expanded ? accent : meta.bg,
            boxShadow: expanded
              ? `0 8px 18px -6px ${accent}80`
              : `inset 0 0 0 2px ${accent}55`,
            display: 'grid', placeItems: 'center',
            animation: expanded ? `salaBadgePop 620ms ${SALA_POP} both` : 'none',
            transition: 'background 340ms ease-out, box-shadow 340ms ease-out, transform 400ms ease-out',
          }}>
            {(() => { const ids = [t.id, ...(t.mergedTables || [])].sort((a, b) => a - b).join('-'); return (
              <span style={{
                fontSize: String(ids).length > 2 ? 16 : 23, fontWeight: 900, lineHeight: 1,
                color: expanded ? '#FFFFFF' : '#0F1115',
                letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums',
                transition: 'color 340ms ease-out',
              }}>{ids}</span>
            ); })()}
          </div>
          {/* Triangolo urgenza — prenotato in ritardo >20' OR da pulire >20'.
              Stessa sagoma dell'icona Alert del design system (PnI.Alert):
              angoli arrotondati, mai spigoli. Qui pieno, col bordo bianco che
              lo stacca dal badge come faceva il pallino. */}
          {showAlertTriangle && (
            <Tip text={t.state === 'dapulire' ? 'Tavolo non ancora liberato da oltre 20 minuti' : 'Prenotazione in ritardo di oltre 20 minuti'}>
              <span style={{position:'absolute', top: -4, right: -4, cursor:'help', display:'block', lineHeight: 0}}>
                <svg width="17" height="17" viewBox="0 0 24 24" style={{display:'block'}}>
                  <path d="M10.3 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
                    fill="#DC2626" stroke="#FFFFFF" strokeWidth="3" strokeLinejoin="round" paintOrder="stroke"/>
                  <path d="M12 9.6 V13.4 M12 16.7 h0.01" stroke="#FFFFFF" strokeWidth="2.2"
                    strokeLinecap="round" fill="none"/>
                </svg>
              </span>
            </Tip>
          )}
        </div>

        {/* Centro: stato + tempo + riga info — sempre visibili
            (Modifica vive nel dettaglio, accanto alla CTA) */}
        <div style={{flex: 1, minWidth: 0, display:'flex', flexDirection:'column', gap: 4}}>
          <div style={{display:'flex', alignItems:'baseline', gap: 6, minWidth: 0}}>
            <span style={{fontSize: 15, fontWeight: 800, color: accent, whiteSpace:'nowrap'}}>{meta.label}</span>
          </div>
          {/* Riga info — sull'occupato CONTRATTO non si mostra nulla: né il
              tempo al tavolo né l'alert operativo ("Non ordina da X'"), che
              si leggono aprendo la card. Resta solo l'allergia, sempre.
              (Il da liberare contratto si riduce da sé alla sola prossima
              prenotazione: vedi salaInfoText.) */}
          {(() => {
            // Occupato: la riga info (tempo al tavolo / alert) si legge solo da
            // APERTA. Prenotato: l'opposto — da aperta "ora · nome" sta già
            // grande nel dettaglio, e ripeterla qui è solo rumore.
            const showInfo = !!info.text && (
              t.state === 'occupato'  ? expanded  :
              t.state === 'prenotato' ? !expanded :
              true
            );
            // "Allergia" in testata serve solo a card CHIUSA: da aperta il
            // testo completo (piatto · ospite) sta già in cima al dettaglio,
            // e ripeterlo qui ruberebbe spazio alla riga info.
            const showAllergia = noteIsCritical && !expanded;
            if (!showInfo && !showAllergia) return null;
            return (
              <div style={{fontSize: 13.5, fontWeight: 600, color: info.color, lineHeight: 1.4,
                overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>
                {showAllergia && <strong style={{color:'#DC2626'}}>Allergia{showInfo ? ' · ' : ''}</strong>}
                {showInfo && info.text}
              </div>
            );
          })()}
        </div>
        {/* Coperti — SEMPRE solo il numero, contratta o aperta: a colpo d'occhio
            conta chi è seduto, non su quanti posti. A dire per esteso cosa sia
            quel numero è il tooltip, che si apre senza attesa. */}
        {(seduti != null || capienza != null) && (
          <Tip delay={0} style={{flexShrink: 0}}
            text={seduti != null
              ? `${seduti} ${seduti === 1 ? 'coperto' : 'coperti'}`
              : `${capienza} ${capienza === 1 ? 'posto' : 'posti'}`}>
            <span style={{display:'inline-flex', alignItems:'center', gap: 4, flexShrink: 0}}>
              <span style={{fontSize: 14.5, fontWeight: 800, color:'#0F1115', fontVariantNumeric:'tabular-nums', whiteSpace:'nowrap'}}>
                {seduti != null ? seduti : capienza}
              </span>
              {/* Sedia dove non c'è nessuno seduto (libero / da liberare): lì il
                  numero è la CAPIENZA. Persone dove il numero sono i COPERTI. */}
              {seduti == null
                ? <ChairIcon size={14} color="#9CA3AF"/>
                : <PeopleIcon size={14} color="#9CA3AF"/>}
            </span>
          </Tip>
        )}
        {/* X di chiusura (solo popup) / chevron (lista) */}
        {isPopup ? (
          <button
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            title="Chiudi dettaglio"
            aria-label="Chiudi dettaglio tavolo"
            style={{
              width: 30, height: 30, borderRadius: '50%',
              background: 'rgba(15,17,21,0.04)', color: '#6B7280',
              border: '1px solid rgba(15,17,21,0.10)',
              cursor: 'pointer', fontFamily: 'inherit',
              display: 'grid', placeItems: 'center', flexShrink: 0,
              transition: 'background 150ms ease-out',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(15,17,21,0.08)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(15,17,21,0.04)'; }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
              <path d="M6 6l12 12 M18 6L6 18"/>
            </svg>
          </button>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.4"
            strokeLinecap="round" strokeLinejoin="round"
            style={{transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition:`transform 480ms ${SALA_POP}`, flexShrink: 0}}>
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        )}
      </div>

      {/* === DETTAGLIO — apertura elastica con rimbalzo === */}
      <div style={{
        display:'grid',
        gridTemplateRows: expanded ? '1fr' : '0fr',
        transition: `grid-template-rows 480ms ${expanded ? SALA_POP : SALA_EASE}`,
        borderTop: expanded ? '1px solid rgba(15,17,21,0.07)' : '1px solid rgba(15,17,21,0)',
      }}>
        <div style={{
          overflow:'hidden', minHeight: 0,
          opacity: expanded ? 1 : 0,
          transform: expanded ? 'translateY(0) scale(1)' : 'translateY(-8px) scale(0.97)',
          transformOrigin: 'top center',
          transition: `opacity 260ms ease-out ${expanded ? '90ms' : '0ms'}, transform 520ms ${SALA_POP} ${expanded ? '40ms' : '0ms'}`,
        }}>
          <div style={{padding:'12px 14px 14px', display:'flex', flexDirection:'column', gap: 14}}>
            {/* Allergia — testo completo, solo nel dettaglio (in card chiusa
                sta nella cella NOTA del bento) */}
            {note && noteIsCritical && (
              <div style={{
                fontSize: 15, fontWeight: 700, color: '#DC2626',
                lineHeight: 1.3, textTransform: 'uppercase', letterSpacing: 0.4,
              }}>
                {`${note.testo}${note.ospite ? ` · ${note.ospite}` : ' (1 ospite)'}`}
              </div>
            )}
            <SalaCardExpanded t={t} alert={alert} cta={cta} note={note} noteMeta={noteMeta}
              extraNote={extraNote} extraNoteMeta={extraNoteMeta}
              onAddArticle={onAddArticle}
              onAdjustReservationPosti={onAdjustReservationPosti}
              onEdit={onEdit} occupatoSaldato={occupatoSaldato}
              isLate={isLate} lateMin={lateMin} pulireSev={pulireSev}/>
          </div>
        </div>
      </div>

    </div>
  );
}

function SalaCardExpanded({ t, alert, cta, note, noteMeta, extraNote, extraNoteMeta, onAddArticle, onAdjustReservationPosti, onEdit, occupatoSaldato, isLate, lateMin, pulireSev }) {
  return (
    <>
      <div style={{display:'flex', flexDirection:'column', gap: 14}}>
        {t.state === 'libero' && t.nextReservation && (
          <div style={{display:'flex', flexDirection:'column', gap: 4}}>
            <div style={{fontSize: 14.5, fontWeight: 700, color:'#6B7280', letterSpacing: 0.4, textTransform:'uppercase'}}>
              Prossima prenotazione
            </div>
            {/* Ora · nome e coperti sulla STESSA riga: i coperti a destra del
                nome, non su una riga propria sotto. A cedere è il nome. */}
            <div style={{display:'flex', alignItems:'center', gap: 8, minWidth: 0}}>
              <div style={{flex: 1, minWidth: 0, fontSize: 21, fontWeight: 700, color:'#0F1115', letterSpacing:'-0.01em', lineHeight: 1.2,
                overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>
                {t.nextReservation.time} · {t.nextReservation.name}
              </div>
              {/* Stepper inline — niente popover che finisce tagliato */}
              <CopertiChip coperti={t.nextReservation.posti} posti={t.posti || 12} onAdjust={(n) => onAdjustReservationPosti && onAdjustReservationPosti(n)}/>
            </div>
          </div>
        )}

        {t.state === 'prenotato' && t.nextReservation && (
          <>
            <div style={{display:'flex', flexDirection:'column', gap: 4}}>
              {/* Prima la prenotazione, poi (solo se in ritardo) il tag sotto:
                  niente "In arrivo fra X minuti" */}
              {/* Ora · nome e coperti sulla STESSA riga: i coperti a destra del
                  nome, non su una riga propria sotto. A cedere è il nome. */}
              <div style={{display:'flex', alignItems:'center', gap: 8, minWidth: 0}}>
                <div style={{flex: 1, minWidth: 0, fontSize: 22, fontWeight: 700, color:'#0F1115', letterSpacing:'-0.01em', lineHeight: 1.2,
                  overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>
                  {t.nextReservation.time} · {t.nextReservation.name}
                </div>
                {/* Stepper inline — niente popover che finisce tagliato */}
                <CopertiChip coperti={t.nextReservation.posti} posti={t.posti || 12} onAdjust={(n) => onAdjustReservationPosti && onAdjustReservationPosti(n)}/>
              </div>
              {isLate && (
                <div style={{fontSize: 14.5, fontWeight: 700, color: '#A16207', letterSpacing: 0.4, textTransform:'uppercase'}}>
                  In ritardo di {lateMin} minuti
                </div>
              )}
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
              {/* Riga identità: solo il nome di chi è al tavolo. I coperti si
                  leggono dal numero in testata; per cambiarli c'è lo stepper
                  in Modifica, così qui niente controllo accanto al nome. */}
              {t.party && (
                <div style={{fontSize: 19, fontWeight: 700, color:'#0F1115', letterSpacing:'-0.01em', lineHeight: 1.2,
                  overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>
                  {t.party}
                </div>
              )}
              {/* Utenti connessi (avatar + numero, fisso) — Modifica è
                  salito nell'header della card */}
              <GuestAvatars byup={t.byup} byupWeb={t.byupWeb} expanded/>
            </div>

            {/* Segnali su UNA riga: alert operativo (solo testo, senza
                sfondo) + tag evento + note */}
            <NoteChipRow
              leading={alert && (
                <div style={{
                  fontSize: 15.5, fontWeight: 700,
                  color: alert.tone === 'warn' ? '#92400E' : '#6B7280',
                  display:'inline-flex', alignItems:'center',
                }}>{alert.label}</div>
              )}
              notes={[
                note && !noteMeta?.critical ? note : null,
                extraNote && extraNoteMeta && !extraNoteMeta.critical ? extraNote : null,
              ]}/>

            {/* Qui stava l'elenco «Ordini · N» richiudibile, con lo stato di
                ogni piatto. Da quando «Vai al conto» apre il riepilogo del
                conto — stessi piatti, stessi stati, più le correzioni — era
                una seconda copia della stessa lista a un tocco dall'originale:
                la card dice lo stato del TAVOLO, il dettaglio vive nel conto. */}

            {/* Crea ordine — link testuale: niente sfondo, si
                ingrandisce in hover */}
            <button onClick={(e)=>{e.stopPropagation(); onAddArticle && onAddArticle(t);}}
              title="Crea un ordine sul conto" style={{
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
              Crea ordine
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
            {/* Niente "Tavolo liberato X minuti fa": compare solo l'urgenza */}
            {pulireSev !== 'normal' && (
              <div style={{fontSize: 15, fontWeight: 700, color: '#DC2626',
                letterSpacing: '0.4px', textTransform: 'uppercase'}}>
                Da liberare
              </div>
            )}
            {t.nextReservation && (
              /* Stessa forma del libero: etichetta su una riga, ora · nome in
                 grande e coperti modificabili a destra. La prossima
                 prenotazione si aggiusta da qui, senza aspettare che il
                 tavolo torni libero. */
              <>
                <div style={{fontSize: 14.5, fontWeight: 700, color:'#6B7280', letterSpacing: 0.4, textTransform:'uppercase'}}>
                  Prossima prenotazione
                </div>
                <div style={{display:'flex', alignItems:'center', gap: 8, minWidth: 0}}>
                  <div style={{flex: 1, minWidth: 0, fontSize: 21, fontWeight: 700, color:'#0F1115', letterSpacing:'-0.01em', lineHeight: 1.2,
                    overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>
                    {t.nextReservation.time} · {t.nextReservation.name}
                  </div>
                  {/* Stepper inline — niente popover che finisce tagliato */}
                  <CopertiChip coperti={t.nextReservation.posti} posti={t.posti || 12} onAdjust={(n) => onAdjustReservationPosti && onAdjustReservationPosti(n)}/>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* CTA contestuale — primaria nera + Modifica ghost accanto */}
      <ExpandedCTARow t={t} cta={cta} onEdit={onEdit}/>
    </>
  );
}

function ExpandedCTARow({ t, cta, onEdit }) {
  return (
    <div style={{display:'flex', gap: 8, alignItems:'stretch'}}>
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
      {/* Modifica — qui ha sempre spazio, mai sopra le scritte dell'header */}
      <button onClick={(e)=>{e.stopPropagation(); onEdit && onEdit(t);}}
        title="Sposta, dividi o unisci il tavolo" style={{
        display:'inline-flex', alignItems:'center', gap: 5,
        padding:'0 14px', borderRadius: 10,
        background:'#fff', color:'#0F1115',
        border:'1px solid rgba(15,17,21,0.12)',
        fontSize: 14.5, fontWeight: 700, cursor:'pointer', fontFamily:'inherit',
        whiteSpace:'nowrap', flexShrink: 0,
        transition:'background 150ms ease-out',
      }}
        onMouseEnter={e => { e.currentTarget.style.background = '#F5F5F7'; }}
        onMouseLeave={e => { e.currentTarget.style.background = '#fff'; }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
        </svg>
        Modifica
      </button>
    </div>
  );
}

window.SalaCard = SalaCard;
// StatoPill e OrdineRow non esistono più: servivano solo all'elenco
// «Ordini · N» della card, e nessun'altra superficie li leggeva.
window.SALA_STATE_META = SALA_STATE_META;
window.NOTE_TYPE_META = NOTE_TYPE_META;
window.NoteIcon = NoteIcon;
