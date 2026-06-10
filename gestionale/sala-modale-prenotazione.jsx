// Sala — Modale Nuova/Modifica prenotazione (SalaModalNuova + utility NP_*/Np*)

const NP_SALE = [
  { id:'principale', label:'Sala principale', tableIds:[1,2,3,4,5,6,7,8,9] },
  { id:'dehors',     label:'Dehors',           tableIds:[11,12] },
];

const NP_TABLES = [
  {id:1,p:8},{id:2,p:4},{id:3,p:2},{id:4,p:2},{id:5,p:4},
  {id:6,p:2},{id:7,p:6},{id:8,p:2},{id:9,p:4},{id:11,p:6},{id:12,p:4},
];

const NP_ALLERGENI = [
  'Glutine','Crostacei','Uova','Pesce','Arachidi',
  'Soia','Latte','Frutta a guscio','Sedano','Senape',
  'Lupini','Sesamo','Molluschi',
];

const NP_TAG = [
  { id:'compleanno',  label:'Compleanno'  },
  { id:'aziendale',   label:'Aziendale'   },
  { id:'anniversario',label:'Anniversario'},
  { id:'altro',       label:'Altro'       },
];

const NP_ORARI = [
  '12:00','12:15','12:30','12:45','13:00','13:15','13:30','13:45','14:00','14:15','14:30','14:45',
  '19:00','19:15','19:30','19:45','20:00','20:15','20:30','20:45','21:00','21:15','21:30','21:45','22:00','22:15','22:30',
];

function npTimeToMin(t) { const [h,m] = t.split(':').map(Number); return h*60+m; }
function npSmartDur(t) { return npTimeToMin(t) < 17 * 60 ? 90 : 120; }

// Finestre di servizio (apertura–chiusura). Una prenotazione è proponibile solo se
// inizia dopo l'apertura e termina entro la chiusura della stessa fascia: niente
// orari prima dell'apertura, niente prenotazioni che sforano oltre la chiusura.
const NP_SERVICE_WINDOWS = [
  { start: 12*60,      end: 15*60 + 30 }, // pranzo 12:00–15:30
  { start: 19*60,      end: 24*60      }, // cena   19:00–24:00
];
function npServiceWindow(min) {
  return NP_SERVICE_WINDOWS.find(w => min >= w.start && min < w.end) || null;
}
function NpCopertiLabel({ n, color }) {
  return (
    <span style={{display:'inline-flex', alignItems:'center', gap:3, color: color || 'inherit'}}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
      {n}
    </span>
  );
}

function npFmtDur(m) {
  const h = Math.floor(m / 60), mm = m % 60;
  return mm === 0 ? `${h}h` : h === 0 ? `${mm} min` : `${h}h ${mm}m`;
}
const NP_DUR_OPTIONS = [60, 90, 120];
const NP_DUR_EXTRA = [45, 75, 105, 135, 150, 165, 180];

// Trova le combinazioni di tavoli liberi che coprono coperti, max 3 tavoli
function npFindCombinations(freeTables, coperti) {
  const sorted = [...freeTables].sort((a, b) => b.p - a.p);
  const results = [];
  function recurse(startIdx, current, sum) {
    if (sum >= coperti) { results.push({ tables: [...current], total: sum }); return; }
    if (current.length >= 3) return;
    const maxLeft = sorted.slice(startIdx).reduce((s, t) => s + t.p, 0);
    if (sum + maxLeft < coperti) return;
    for (let i = startIdx; i < sorted.length; i++) {
      current.push(sorted[i]);
      recurse(i + 1, current, sum + sorted[i].p);
      current.pop();
    }
  }
  recurse(0, [], 0);
  results.sort((a, b) => a.tables.length !== b.tables.length
    ? a.tables.length - b.tables.length
    : (a.total - coperti) - (b.total - coperti));
  return results.slice(0, 8);
}
// 4 livelli di occupazione (cappato a 100%): libera ≤20% · disponibile ≤50% · quasi piena ≤80% · piena ≤100%
function npOccLevel(ratio) {
  const r = Math.max(0, Math.min(1, ratio || 0));
  if (r >= 0.80) return { level:'piena',       label:'Sala piena',     bg:'#FEF2F2', border:'#FECACA', accent:'#DC2626', accentDeep:'#991B1B', text:'#7F1D1D', barLight:'#FCA5A5', barDeep:'#B91C1C' };
  if (r >= 0.50) return { level:'quasi-piena', label:'Quasi piena',    bg:'#FFFBEB', border:'#FDE68A', accent:'#D97706', accentDeep:'#92400E', text:'#92400E', barLight:'#FCD34D', barDeep:'#B45309' };
  if (r >= 0.20) return { level:'disponibile', label:'Disponibile',    bg:'#F8FAFC', border:'#E2E8F0', accent:'#475569', accentDeep:'#1E293B', text:'#334155', barLight:'#94A3B8', barDeep:'#334155' };
  return                  { level:'libera',     label:'Sala libera',    bg:'#F0FDF4', border:'#BBF7D0', accent:'#16A34A', accentDeep:'#166534', text:'#166534', barLight:'#86EFAC', barDeep:'#166534' };
}

function npFmtTavoli(tables) {
  if (!tables || tables.length === 0) return '';
  if (tables.length === 1) return `Tav. ${tables[0].id}`;
  const ids = tables.map(t => t.id).sort((a, b) => a - b);
  return `Tav. ${ids[0]}-${ids[ids.length - 1]}`;
}

// ─── Design tokens unificati ──────────────────────────────────────────────────
const NP_T = {
  text:'#111827', textMuted:'#4B5563', textSubtle:'#6B7280', textInv:'#FFFFFF',
  bg:'#FFFFFF', bgSoft:'#F6F7F9', bgHush:'#EDEFF2',
  border:'#DFE3E8', borderSoft:'#ECEEF1', borderStrong:'#C4CAD2',
  brand:'#111827', brandHover:'#1F2937',
};
const NP_R = { sm:8, md:10, lg:12, pill:999 };
const NP_FS = { xs:13, sm:14, md:15, base:16, lg:18, xl:24 };

const npInput = {
  width:'100%', padding:'10px 12px', borderRadius: NP_R.md,
  border:`1px solid ${NP_T.border}`, background: NP_T.bg,
  fontSize: NP_FS.base, color: NP_T.text, fontFamily:'inherit',
  outline:'none', boxSizing:'border-box',
  transition:'border-color 160ms ease, box-shadow 160ms ease',
};

function NpFieldLabel({ children, required }) {
  return (
    <div style={{
      fontSize: NP_FS.sm, fontWeight: 700,
      color: NP_T.text, marginBottom: 6, letterSpacing: 0.1,
    }}>{children}{required && <span style={{color:'#DC2626', marginLeft:2}}>*</span>}</div>
  );
}

function NpChevron({ dir = 'down', size = 12, color = NP_T.textMuted }) {
  const points = dir === 'up' ? '18 15 12 9 6 15'
    : dir === 'right' ? '9 6 15 12 9 18'
    : dir === 'left' ? '15 18 9 12 15 6'
    : '6 9 12 15 18 9';
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}
      strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      style={{transition:'transform 200ms ease'}}>
      <polyline points={points}/>
    </svg>
  );
}

function NpSelect({ value, onChange, options }) {
  return (
    <div style={{position:'relative'}}>
      <select value={value} onChange={e=>onChange(e.target.value)} style={{
        width:'100%', appearance:'none', WebkitAppearance:'none', MozAppearance:'none',
        padding:'9px 30px 9px 12px', borderRadius: NP_R.md,
        border:`1px solid ${NP_T.border}`, background: NP_T.bg,
        fontSize: NP_FS.md, fontWeight: 600, color: NP_T.text,
        fontFamily:'inherit', outline:'none', cursor:'pointer',
      }}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <div style={{position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', pointerEvents:'none', display:'flex'}}>
        <NpChevron dir="down" size={12}/>
      </div>
    </div>
  );
}

function npToISO(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function npSameDay(a, b) {
  return a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate();
}

function NpDateStrip({ value, onChange, label }) {
  const today = React.useMemo(() => { const d = new Date(); d.setHours(0,0,0,0); return d; }, []);
  const selDate = React.useMemo(() => {
    const d = value ? new Date(value) : new Date(today);
    d.setHours(0,0,0,0); return d;
  }, [value, today]);

  const [showCalendar, setShowCalendar] = React.useState(false);
  const [dayOffset, setDayOffset] = React.useState(0);
  const wrapRef = React.useRef(null);
  const NP_WIN = 4; // giorni visibili prima della freccetta

  // Click-outside chiude il popover
  React.useEffect(() => {
    if (!showCalendar) return;
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setShowCalendar(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showCalendar]);

  // Solo giorni da oggi in avanti (mai passati). La finestra si estende fino alla
  // data scelta dal calendario, così resta sempre raggiungibile scorrendo.
  const days = React.useMemo(() => {
    const last = new Date(today); last.setDate(today.getDate() + 29);
    const end = selDate > last ? selDate : last;
    const arr = [];
    for (const d = new Date(today); d <= end; d.setDate(d.getDate() + 1)) arr.push(new Date(d));
    return arr;
  }, [today, selDate]);

  // Se la data selezionata (es. dal calendario) è fuori dalla finestra visibile,
  // sposta la finestra così da mostrarla.
  React.useEffect(() => {
    const idx = days.findIndex(d => npSameDay(d, selDate));
    if (idx < 0) return;
    if (idx < dayOffset || idx >= dayOffset + NP_WIN) {
      setDayOffset(Math.max(0, Math.min(idx, days.length - NP_WIN)));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const monthLabel = selDate.toLocaleDateString('it-IT', {month:'long', year:'numeric'});
  const canPrevDays = dayOffset > 0;
  const canNextDays = dayOffset + NP_WIN < days.length;
  const visibleDays = days.slice(dayOffset, dayOffset + NP_WIN);

  const dayArrow = (dir, onClick, enabled) => (
    <button onClick={onClick} disabled={!enabled} aria-label={dir==='left'?'Giorni precedenti':'Giorni successivi'}
      style={{
        flex:'0 0 30px', alignSelf:'stretch', borderRadius: NP_R.md,
        background: enabled ? NP_T.bg : 'transparent',
        border:`1px solid ${enabled ? NP_T.border : NP_T.borderSoft}`,
        cursor: enabled ? 'pointer' : 'default', fontFamily:'inherit',
        display:'flex', alignItems:'center', justifyContent:'center',
        color: enabled ? NP_T.text : NP_T.borderStrong, opacity: enabled ? 1 : 0.5,
        transition:'background 140ms ease',
      }}>
      <NpChevron dir={dir} size={13} color={enabled ? NP_T.text : NP_T.borderStrong}/>
    </button>
  );

  return (
    <div ref={wrapRef} style={{position:'relative'}}>
      <div style={{display:'flex', alignItems:'baseline', justifyContent:'center', gap: 10, marginBottom: 8}}>
        {label && <span style={{fontSize: NP_FS.sm, fontWeight: 700, color: NP_T.text, letterSpacing: 0.1}}>{label}</span>}
        <button onClick={()=>setShowCalendar(s=>!s)} style={{
          background:'transparent', border:'none', padding: 0,
          fontSize: NP_FS.sm, fontWeight: 600, color: NP_T.textMuted,
          textTransform:'capitalize', cursor:'pointer', fontFamily:'inherit',
          display:'inline-flex', alignItems:'center', gap: 4,
        }}>
          {monthLabel}
          <NpChevron dir={showCalendar ? 'up' : 'down'} size={11} color={NP_T.textMuted}/>
        </button>
      </div>

      <div style={{display:'flex', alignItems:'stretch', gap: 6}}>
        {dayArrow('left', ()=>setDayOffset(o=>Math.max(0, o - NP_WIN)), canPrevDays)}
        {visibleDays.map(d => {
          const iso = npToISO(d);
          const isSel = npSameDay(d, selDate);
          const isToday = npSameDay(d, today);
          const wd = d.toLocaleDateString('it-IT', {weekday:'short'}).replace('.','');
          return (
            <button key={iso} onClick={()=>onChange(iso)} style={{
              flex:'1 1 0', position:'relative', padding:'7px 0', borderRadius: NP_R.md,
              border: isSel ? '1px solid transparent' : `1px solid ${NP_T.border}`,
              background: isSel ? NP_T.brand : NP_T.bg,
              color: isSel ? NP_T.textInv : NP_T.text,
              cursor:'pointer', fontFamily:'inherit',
              display:'flex', flexDirection:'column', alignItems:'center', gap: 2,
              transition:'background 160ms ease, color 160ms ease, border-color 160ms ease',
            }}>
              <span style={{
                fontSize: 13, fontWeight: 700, lineHeight: 1,
                textTransform:'uppercase', letterSpacing: 0.4,
                color: isSel ? 'rgba(255,255,255,0.85)' : NP_T.textSubtle,
              }}>{wd}</span>
              <span style={{fontSize: 18, fontWeight: 700, lineHeight: 1.1}}>{d.getDate()}</span>
              {isToday && (
                <span style={{
                  position:'absolute', bottom: 4, left:'50%', transform:'translateX(-50%)',
                  width: 4, height: 4, borderRadius:'50%',
                  background: isSel ? 'rgba(255,255,255,0.9)' : NP_T.brand,
                }}/>
              )}
            </button>
          );
        })}
        {dayArrow('right', ()=>setDayOffset(o=>Math.min(days.length - NP_WIN, o + NP_WIN)), canNextDays)}
      </div>

      {showCalendar && (
        <NpMonthCalendar
          today={today}
          selected={selDate}
          onPick={(iso) => { onChange(iso); setShowCalendar(false); }}
        />
      )}
    </div>
  );
}

function NpMonthCalendar({ today, selected, onPick }) {
  const [view, setView] = React.useState(() => { const d = new Date(selected); d.setDate(1); return d; });
  const monthLabel = view.toLocaleDateString('it-IT', {month:'long', year:'numeric'});

  const firstDow = (new Date(view.getFullYear(), view.getMonth(), 1).getDay() + 6) % 7;
  const daysInMonth = new Date(view.getFullYear(), view.getMonth()+1, 0).getDate();
  const grid = [];
  for (let i = 0; i < firstDow; i++) grid.push(null);
  for (let n = 1; n <= daysInMonth; n++) grid.push(new Date(view.getFullYear(), view.getMonth(), n));
  while (grid.length % 7 !== 0) grid.push(null);

  const goPrev = () => { const d = new Date(view); d.setMonth(d.getMonth() - 1); setView(d); };
  const goNext = () => { const d = new Date(view); d.setMonth(d.getMonth() + 1); setView(d); };
  const canPrev = view.getFullYear() > today.getFullYear()
    || (view.getFullYear() === today.getFullYear() && view.getMonth() > today.getMonth());

  const arrowBtn = (disabled) => ({
    width: 28, height: 28, borderRadius: NP_R.sm,
    background: disabled ? 'transparent' : NP_T.bg,
    border: `1px solid ${disabled ? NP_T.borderSoft : NP_T.border}`,
    cursor: disabled ? 'default' : 'pointer', fontFamily:'inherit',
    display:'flex', alignItems:'center', justifyContent:'center',
    opacity: disabled ? 0.5 : 1,
  });

  return (
    <div onClick={e=>e.stopPropagation()} style={{
      position:'absolute', top:'100%', left: 0, right: 0, marginTop: 8, zIndex: 40,
      maxWidth: 340,
      padding: 14, background: NP_T.bg,
      borderRadius: NP_R.lg, border: `1px solid ${NP_T.border}`,
      boxShadow:'0 12px 36px rgba(15,17,21,0.14)',
    }}>
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: 10}}>
        <button onClick={goPrev} disabled={!canPrev} style={arrowBtn(!canPrev)}>
          <NpChevron dir="left" size={12} color={canPrev ? NP_T.text : NP_T.borderStrong}/>
        </button>
        <span style={{
          fontSize: NP_FS.md, fontWeight: 700, color: NP_T.text,
          textTransform:'capitalize',
        }}>{monthLabel}</span>
        <button onClick={goNext} style={arrowBtn(false)}>
          <NpChevron dir="right" size={12} color={NP_T.text}/>
        </button>
      </div>
      <div style={{display:'grid', gridTemplateColumns:'repeat(7, 1fr)', gap: 4, marginBottom: 4}}>
        {['L','M','M','G','V','S','D'].map((d,i)=>(
          <span key={i} style={{
            fontSize: 12, fontWeight: 700, color: NP_T.textSubtle,
            textAlign:'center', padding: 2, letterSpacing: 0.3,
          }}>{d}</span>
        ))}
      </div>
      <div style={{display:'grid', gridTemplateColumns:'repeat(7, 1fr)', gap: 4}}>
        {grid.map((day, i) => {
          if (!day) return <span key={i}/>;
          const isSel = npSameDay(day, selected);
          const isToday = npSameDay(day, today);
          const isPast = day < today;
          return (
            <button key={i} disabled={isPast} onClick={()=>onPick(npToISO(day))} style={{
              padding:'8px 0', borderRadius: NP_R.sm,
              background: isSel ? NP_T.brand : 'transparent',
              color: isSel ? NP_T.textInv : isPast ? NP_T.borderStrong : NP_T.text,
              border:'none', cursor: isPast ? 'default' : 'pointer', fontFamily:'inherit',
              fontSize: NP_FS.md, fontWeight: isSel || isToday ? 700 : 500,
              position:'relative',
              transition:'background 140ms ease, color 140ms ease',
            }}>
              {day.getDate()}
              {isToday && !isSel && (
                <span style={{
                  position:'absolute', bottom: 4, left:'50%', transform:'translateX(-50%)',
                  width: 4, height: 4, borderRadius:'50%', background: NP_T.text,
                }}/>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function npTodayISO() {
  const d = new Date(); d.setHours(0,0,0,0);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function npFmtDateLabel(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('it-IT', {weekday:'long', day:'numeric', month:'long'});
}

// ─── Modal principale ─────────────────────────────────────────────────────────
function SalaModalNuova({ open, onClose, initData }) {
  const [coperti, setCoperti]                 = React.useState(2);
  const [date, setDate]                       = React.useState(npTodayISO());
  const [time, setTime]                       = React.useState('20:00');
  const [dur, setDur]                         = React.useState(npSmartDur('20:00'));
  const [salaFilter, setSalaFilter]           = React.useState(null);
  // Selezione tavolo: null = usa il/i tavolo/i suggerito/i (preselezione) · Set = scelta manuale
  const [tableOverrideIds, setTableOverrideIds] = React.useState(null);
  const [selectedSlot, setSelectedSlot]       = React.useState('20:00');
  const [showExtra, setShowExtra]             = React.useState(false);
  const [showAllergeni, setShowAllergeni]     = React.useState(false);
  const [nome, setNome]                       = React.useState('');
  const [phone, setPhone]                     = React.useState('');
  const [tag, setTag]                         = React.useState(null);
  const [tagAltro, setTagAltro]               = React.useState('');
  const [allergeni, setAllergeni]             = React.useState(new Set());
  const [note, setNote]                       = React.useState('');

  const prevServiceRef = React.useRef(npTimeToMin('20:00') < 17*60 ? 'pranzo' : 'cena');

  // Cambiare i parametri di ricerca azzera l'eventuale scelta manuale del tavolo
  const skipResetRef = React.useRef(false);
  React.useEffect(() => {
    if (skipResetRef.current) { skipResetRef.current = false; return; }
    setTableOverrideIds(null);
    setSelectedSlot(time);
  }, [time, coperti, dur, salaFilter, date]);

  // Aggiorna la durata solo quando si attraversa il confine pranzo/cena
  React.useEffect(() => {
    const newService = npTimeToMin(time) < 17*60 ? 'pranzo' : 'cena';
    if (newService !== prevServiceRef.current) {
      setDur(npSmartDur(time));
      prevServiceRef.current = newService;
    }
  }, [time]);

  React.useEffect(() => {
    if (open) {
      const initTime = initData?.time || '20:00';
      setCoperti(initData?.coperti || 2);
      setDate(npTodayISO());
      setTime(initTime);
      setSelectedSlot(initTime);
      setDur(initData?.dur || npSmartDur(initTime));
      setSalaFilter(null);
      setShowExtra(false);
      setShowAllergeni(false);
      setNome(initData?.nome || ''); setPhone(initData?.phone || '');
      setTag(initData?.tag || null); setTagAltro('');
      setAllergeni(new Set()); setNote(initData?.noteText || '');
      prevServiceRef.current = npTimeToMin(initTime) < 17*60 ? 'pranzo' : 'cena';
      if (initData?.tableId) {
        const tbl = NP_TABLES.find(t => t.id === initData.tableId);
        if (tbl) { skipResetRef.current = true; setTableOverrideIds(new Set([tbl.id])); }
        else setTableOverrideIds(null);
      } else {
        setTableOverrideIds(null);
      }
    }
  }, [open]);

  const activeIds = React.useMemo(() =>
    salaFilter
      ? (NP_SALE.find(s => s.id === salaFilter)?.tableIds || [])
      : NP_TABLES.map(t => t.id),
    [salaFilter]
  );

  // Mini histogram: per ogni slot 15-min, mostra l'occupazione che si avrebbe
  // se la prenotazione (di durata `dur`) iniziasse lì. La barra in corrispondenza
  // dell'ora selezionata combacia col conteggio "X liberi su Y" mostrato sopra.
  // Dedup per tavolo: prenotazioni consecutive sullo stesso tavolo contano una volta.
  const chartData = React.useMemo(() => {
    const res = window.SALA_RES_DATA_GLOBAL || [];
    const total = activeIds.length;
    const centerMin = npTimeToMin(time);
    // Limita alle fasce della stessa apertura dove la prenotazione (durata `dur`)
    // ci sta tutta: inizio ≥ apertura · inizio + durata ≤ chiusura.
    const win = npServiceWindow(centerMin) || { start: centerMin, end: centerMin + dur };
    const startMin = Math.max(Math.floor((centerMin - 60) / 15) * 15, win.start);
    const endMin = Math.min(centerMin + 60, win.end - dur);
    const fasce = [];
    for (let m = startMin; m <= endMin; m += 15) {
      const occSet = new Set(
        res
          .filter(r => r.status !== 'cancellata' && r.status !== 'noshow' && r.table)
          .filter(r => activeIds.includes(r.table))
          .filter(r => { const rs = npTimeToMin(r.time); return rs < m + dur && rs + (r.dur || 90) > m; })
          .map(r => r.table)
      );
      const occ = occSet.size;
      const hh = String(Math.floor(m / 60)).padStart(2, '0');
      const mm = String(m % 60).padStart(2, '0');
      const label = `${hh}:${mm}`;
      fasce.push({ min: m, label, occ, total, selectable: NP_ORARI.includes(label) });
    }
    return fasce;
  }, [time, activeIds, dur]);

  // Availability analysis for currently selected slot + alternatives
  const slotInfo = React.useMemo(() => {
    const res = window.SALA_RES_DATA_GLOBAL || [];
    const total = activeIds.length;
    const reqMin = npTimeToMin(selectedSlot);
    const reqEnd = reqMin + dur;
    const occupatiAll = [...new Set(
      res
        .filter(r => r.status !== 'cancellata' && r.status !== 'noshow' && r.table)
        .filter(r => { const rs = npTimeToMin(r.time); return rs < reqEnd && rs + (r.dur || 90) > reqMin; })
        .map(r => r.table)
    )];
    const occupatiInSala = occupatiAll.filter(id => activeIds.includes(id));
    const ratio = total > 0 ? Math.max(0, Math.min(1, occupatiInSala.length / total)) : 0;
    const freeTables = NP_TABLES.filter(t => activeIds.includes(t.id) && !occupatiAll.includes(t.id));
    const combos = npFindCombinations(freeTables, coperti);
    const suggerito = combos[0] || null; // { tables, total }
    // Alternative ai due poli: l'orario libero più vicino PRIMA e quello più vicino DOPO,
    // nella stessa fascia di servizio, dove la durata ci sta e c'è un tavolo per i coperti.
    const reqWin = npServiceWindow(reqMin);
    let altBefore = null, altAfter = null;
    for (const t of NP_ORARI) {
      if (t === selectedSlot) continue;
      const tMin = npTimeToMin(t);
      const w = npServiceWindow(tMin);
      if (!w || !reqWin || w.start !== reqWin.start) continue; // stessa apertura
      if (tMin + dur > w.end) continue;                        // la durata ci sta
      const tEnd = tMin + dur;
      const oAlt = [...new Set(
        res
          .filter(r => r.status !== 'cancellata' && r.status !== 'noshow' && r.table)
          .filter(r => { const rs = npTimeToMin(r.time); return rs < tEnd && rs + (r.dur || 90) > tMin; })
          .map(r => r.table)
      )];
      const freeAlt = NP_TABLES.filter(tt => activeIds.includes(tt.id) && !oAlt.includes(tt.id));
      const comboAlt = npFindCombinations(freeAlt, coperti);
      if (!comboAlt.length) continue;
      const cand = { time: t, combo: comboAlt[0], free: freeAlt.length };
      if (tMin < reqMin) { if (!altBefore || tMin > npTimeToMin(altBefore.time)) altBefore = cand; }
      else if (tMin > reqMin) { if (!altAfter || tMin < npTimeToMin(altAfter.time)) altAfter = cand; }
    }
    return { suggerito, ratio, available: !!suggerito, altBefore, altAfter, tavoliIdonei: combos, freeTables };
  }, [selectedSlot, dur, activeIds, coperti]);

  const toggleAllergene = (a) => setAllergeni(prev => {
    const n = new Set(prev); n.has(a) ? n.delete(a) : n.add(a); return n;
  });

  const totalTav = activeIds.length;

  // Tavoli effettivamente selezionati: scelta manuale (tableOverrideIds) oppure,
  // di default, il/i tavolo/i suggerito/i (preselezione).
  const suggeritoIds = (slotInfo.suggerito?.tables || []).map(t => t.id);
  const selectedIds = tableOverrideIds ?? new Set(suggeritoIds);
  // Chip selezionabili: i tavoli liberi nello slot + eventuali già selezionati
  // (es. il tavolo della prenotazione in modifica, che è "occupato" da sé stesso).
  const freeIds = new Set((slotInfo.freeTables || []).map(t => t.id));
  const chipTables = NP_TABLES.filter(t => activeIds.includes(t.id) && (freeIds.has(t.id) || selectedIds.has(t.id)));
  const selectedTables = chipTables.filter(t => selectedIds.has(t.id));
  const effectiveTavolo = selectedTables.length
    ? { tables: selectedTables.map(t => ({ id:t.id, p:t.p })), total: selectedTables.reduce((s,t)=>s+t.p,0) }
    : null;
  const canSubmit = !!effectiveTavolo && !!nome.trim() && !!phone.trim();

  const toggleTable = (id) => {
    setTableOverrideIds(prev => {
      const base = prev ?? new Set(suggeritoIds);
      const n = new Set(base);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const handlePickAlt = (alt) => {
    setTableOverrideIds(null); // usa il suggerito della nuova fascia (preselezione)
    setSelectedSlot(alt.time);
  };

  const occInfo = npOccLevel(slotInfo.ratio);

  const renderDettagli = () => {
    const oraOpts = NP_ORARI.map(t => ({value:t, label:t}));
    const coperitOpts = Array.from({length:12}, (_,i)=>i+1).map(n => ({value:String(n), label:String(n)}));
    return (
    <div style={{display:'flex', flexDirection:'column', gap: 18}}>
      {/* Recap prenotazione attuale — solo in edit mode */}
      {initData?.editMode && initData.nome && (
        <div style={{
          display:'flex', alignItems:'center', gap: 10,
          padding:'10px 14px', borderRadius: NP_R.md,
          background:'#F8FAFC', border:`1px solid ${NP_T.border}`,
        }}>
          <div style={{
            width:7, height:7, borderRadius:'50%', background:'#6B7280', flexShrink:0,
          }}/>
          <div style={{minWidth:0, flex:1}}>
            <span style={{fontSize: NP_FS.xs, fontWeight:700, color: NP_T.textSubtle, textTransform:'uppercase', letterSpacing:0.4, marginRight:8}}>Prenotazione attuale</span>
            <span style={{fontSize: NP_FS.sm, fontWeight:600, color: NP_T.textMuted, display:'inline-flex', alignItems:'center', gap:4, flexWrap:'wrap'}}>
              {initData.nome}
              {initData.time ? ` · ${initData.time}` : ''}
              {initData.tableId ? ` · Tav. ${initData.tableId}` : ''}
              {initData.coperti ? <> · <NpCopertiLabel n={initData.coperti}/></> : ''}
              {initData.dur ? ` · ${npFmtDur(initData.dur)}` : ''}
            </span>
          </div>
        </div>
      )}

      {/* Slot — Data (stretta) a sinistra, Ora/Coperti a destra; poi cliente e extra */}
      <section style={{
        borderRadius: NP_R.lg, border: `1px solid ${NP_T.border}`,
        background: NP_T.bg, padding: 16,
        display:'flex', flexDirection:'column', gap: 14,
      }}>
        <div style={{display:'flex', gap: 12, alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap'}}>
          <div style={{flex:'0 0 330px', minWidth: 300}}>
            <NpDateStrip label="Data" value={date} onChange={setDate}/>
          </div>
          <div style={{textAlign:'center', width: 82}}>
            <NpFieldLabel>Ora</NpFieldLabel>
            <NpSelect value={time} onChange={setTime} options={oraOpts}/>
          </div>
          <div style={{textAlign:'center', width: 60}}>
            <NpFieldLabel>Coperti</NpFieldLabel>
            <NpSelect value={String(coperti)} onChange={v=>setCoperti(+v)} options={coperitOpts}/>
          </div>
        </div>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap: 12}}>
          <div>
            <NpFieldLabel required>Nome cliente</NpFieldLabel>
            <input value={nome} onChange={e=>setNome(e.target.value)}
              placeholder="Es. Rossi, Famiglia Bianchi" style={npInput}/>
          </div>
          <div>
            <NpFieldLabel required>Telefono</NpFieldLabel>
            <input value={phone} onChange={e=>setPhone(e.target.value)}
              placeholder="+39 ..." style={npInput}/>
          </div>
        </div>
      </section>

      {/* Dettagli aggiuntivi — accordion fuori dalla card, con occasione, note e allergeni */}
      <div>
        <button onClick={()=>setShowExtra(s=>!s)} style={{
          background:'transparent', border:'none', padding: 0,
          display:'inline-flex', alignItems:'center', gap: 6, cursor:'pointer', fontFamily:'inherit',
          fontSize: NP_FS.sm, fontWeight: 600, color: NP_T.textMuted,
        }}>
          Dettagli aggiuntivi
          <NpChevron dir={showExtra ? 'up' : 'down'} size={12} color={NP_T.textMuted}/>
        </button>
        {showExtra && <div style={{marginTop: 14}}>{renderExtra()}</div>}
      </div>
    </div>
    );
  };

  const renderTavolo = () => {
    return (
    <div style={{display:'flex', flexDirection:'column', gap: 18}}>
      {/* Disponibilità — unica fonte di verità: KPI + grafico nella stessa card */}
      <section style={{
        borderRadius: NP_R.lg, padding: 16,
        background: occInfo.bg, border: `1px solid ${occInfo.border}`,
        transition:'background 220ms ease, border-color 220ms ease',
      }}>
        <div style={{display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom: 14, gap: 12, flexWrap:'wrap'}}>
          <div>
            <div style={{
              fontSize: NP_FS.xs, fontWeight: 700, color: occInfo.text,
              letterSpacing: 0.4, textTransform:'uppercase',
            }}>
              Disponibilità · {selectedSlot}
            </div>
            <div style={{display:'flex', alignItems:'baseline', gap: 6, marginTop: 4}}>
              <span style={{
                fontSize: NP_FS.xl, fontWeight: 700, color: NP_T.text, letterSpacing:'-0.02em', lineHeight: 1,
              }}>{slotInfo.freeTables.length}</span>
              <span style={{fontSize: NP_FS.md, fontWeight: 600, color: NP_T.textMuted}}>/ {totalTav} liberi</span>
            </div>
          </div>
          <span style={{
            display:'inline-flex', alignItems:'center', gap: 6,
            padding:'4px 10px', borderRadius: NP_R.pill,
            background: NP_T.bg, border:`1px solid ${occInfo.border}`,
            color: occInfo.text, fontSize: NP_FS.xs, fontWeight: 700,
            transition:'background 220ms ease, border-color 220ms ease, color 220ms ease',
          }}>
            <span style={{width:6, height:6, borderRadius:'50%', background: occInfo.accent, transition:'background 220ms ease'}}/>
            {Math.round(slotInfo.ratio*100)}% · {occInfo.label}
          </span>
        </div>
        {/* Rail disponibilità — quanti tavoli liberi per fascia, a colpo d'occhio.
            Verde = molti liberi · ambra = pochi · grigio = pieno. Clic per spostarsi. */}
        <div style={{display:'flex', gap: 6, overflowX:'auto', paddingBottom: 2, userSelect:'none',
          scrollbarWidth:'thin'}}>
          {chartData.map((f) => {
            const free = Math.max(0, f.total - f.occ);
            const isSel = f.label === selectedSlot;
            const isReq = f.label === time;
            const isFull = f.total > 0 && free === 0;
            const low = !isFull && f.total > 0 && free / f.total <= 0.25;
            // Una fascia senza tavoli liberi per l'intera durata non è selezionabile:
            // sceglierla non darebbe alcun tavolo da prenotare.
            const clickable = f.selectable && !isFull;
            const c = isFull
              ? { bg:'#F1F3F6', border:'#E2E5EA', num:'#9CA3AF' }
              : low
                ? { bg:'#FFFBEB', border:'#FDE68A', num:'#B45309' }
                : { bg:'#ECFDF5', border:'#A7F3D0', num:'#047857' };
            return (
              <button key={f.label}
                onClick={() => { if (clickable && !isSel) { setTableOverrideIds(null); setSelectedSlot(f.label); } }}
                disabled={!clickable}
                title={isFull ? `${f.label} · nessun tavolo libero` : `${f.label} · ${free} tavoli liberi`}
                style={{
                  flex:'0 0 auto', width: 60, padding:'8px 4px 6px',
                  borderRadius: 10, fontFamily:'inherit', position:'relative',
                  cursor: clickable ? 'pointer' : 'not-allowed',
                  background: c.bg,
                  border: isSel ? `2px solid ${NP_T.brand}` : `1px solid ${c.border}`,
                  boxShadow: isSel ? '0 2px 8px rgba(15,17,21,0.12)' : 'none',
                  opacity: f.selectable ? 1 : 0.45,
                  display:'flex', flexDirection:'column', alignItems:'center', gap: 1,
                  transition:'border-color 140ms ease, box-shadow 140ms ease',
                }}>
                <span style={{fontSize: 20, fontWeight: 700, color: c.num, lineHeight: 1}}>
                  {isFull ? '—' : free}
                </span>
                <span style={{fontSize: 10, fontWeight: 700, color: c.num, opacity: 0.85, lineHeight: 1,
                  textTransform:'uppercase', letterSpacing: 0.4}}>
                  {isFull ? 'pieno' : 'liberi'}
                </span>
                <span style={{fontSize: 13, fontWeight: isSel ? 800 : 600,
                  color: isSel ? NP_T.text : NP_T.textMuted, lineHeight: 1, marginTop: 4}}>
                  {f.label}
                </span>
                {isReq && !isSel && (
                  <span title="Orario richiesto" style={{position:'absolute', top: 4, right: 5,
                    width: 5, height: 5, borderRadius:'50%', background: NP_T.textSubtle}}/>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* Tavolo — il/i suggerito/i è preselezionato; tocca per cambiare. */}
      {slotInfo.available ? (
        <section>
          <div style={{display:'flex', alignItems:'baseline', justifyContent:'space-between', gap: 10, marginBottom: 8, flexWrap:'wrap'}}>
            <NpFieldLabel>Seleziona tavolo</NpFieldLabel>
            <span style={{fontSize: NP_FS.xs, color: NP_T.textSubtle}}>
              {tableOverrideIds ? 'Manuale' : 'Consigliato · tocca'}
            </span>
          </div>
          {/* Tavoli raggruppati per sala: intestazione testuale + chip selezionabili */}
          <div style={{display:'flex', flexDirection:'column', gap: 14}}>
            {NP_SALE.map(sala => {
              const salaTables = chipTables.filter(t => sala.tableIds.includes(t.id));
              if (salaTables.length === 0) return null;
              return (
                <div key={sala.id}>
                  <div style={{
                    fontSize: NP_FS.xs, fontWeight: 700, color: NP_T.textMuted,
                    textTransform:'uppercase', letterSpacing: 0.4, marginBottom: 8,
                  }}>{sala.label}</div>
                  <div style={{display:'flex', flexWrap:'wrap', gap: 6}}>
                    {salaTables.map(t => {
                      const sel = selectedIds.has(t.id);
                      return (
                        <button key={t.id} onClick={()=>toggleTable(t.id)} style={{
                          display:'inline-flex', alignItems:'center', gap: 6,
                          padding:'8px 13px', borderRadius: NP_R.pill,
                          fontSize: NP_FS.md, fontWeight: 700, cursor:'pointer', fontFamily:'inherit',
                          background: sel ? NP_T.brand : NP_T.bg,
                          color: sel ? NP_T.textInv : NP_T.text,
                          border: sel ? '1px solid transparent' : `1px solid ${NP_T.border}`,
                          transition:'background 140ms ease, color 140ms ease, border-color 140ms ease',
                        }}>
                          Tav. {t.id}
                          <span style={{display:'inline-flex', alignItems:'center', gap: 2, fontSize: NP_FS.xs, fontWeight: 600, opacity: sel ? 0.85 : 0.55}}>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                            </svg>
                            {t.p}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ) : (
        <section style={{borderRadius: NP_R.lg, padding: 14, background:'#FEF2F2', border:'1px solid #FECACA'}}>
          <div style={{display:'flex', alignItems:'center', gap: 12, marginBottom: 14}}>
            <div style={{width: 30, height: 30, borderRadius:'50%', background:'#DC2626',
              display:'flex', alignItems:'center', justifyContent:'center', flexShrink: 0}}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
            </div>
            <div>
              <div style={{fontSize: NP_FS.base, fontWeight: 700, color:'#7F1D1D'}}>
                Nessun tavolo libero alle {selectedSlot}
              </div>
              <div style={{fontSize: NP_FS.sm, color:'#9F1239', marginTop: 2, display:'flex', alignItems:'center', gap:4}}>
                per <NpCopertiLabel n={coperti}/> · {npFmtDur(dur)}
              </div>
            </div>
          </div>
          <div style={{fontSize: NP_FS.xs, fontWeight: 700, color:'#9F1239', textTransform:'uppercase', letterSpacing: 0.4, marginBottom: 8}}>
            Prossime disponibilità
          </div>
          <div style={{display:'flex', gap: 8}}>
            {[{ key:'Prima', alt: slotInfo.altBefore }, { key:'Dopo', alt: slotInfo.altAfter }].map(p => (
              p.alt ? (
                <button key={p.key} onClick={()=>handlePickAlt(p.alt)} style={{
                  flex:'1 1 0', minWidth: 0,
                  display:'flex', alignItems:'center', justifyContent:'space-between', gap: 8,
                  padding:'10px 12px', borderRadius: NP_R.md,
                  border:'1px solid #FECACA', background: NP_T.bg,
                  fontFamily:'inherit', cursor:'pointer', textAlign:'left',
                  transition:'background 160ms ease',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = '#FFF7F7'}
                  onMouseLeave={e => e.currentTarget.style.background = NP_T.bg}
                >
                  <div style={{minWidth: 0}}>
                    <div style={{fontSize: NP_FS.xs, fontWeight: 700, color: NP_T.textSubtle, textTransform:'uppercase', letterSpacing: 0.3}}>
                      {p.key}
                    </div>
                    <div style={{fontSize: NP_FS.lg, fontWeight: 700, color: NP_T.text, lineHeight: 1.1, marginTop: 1}}>
                      {p.alt.time}
                    </div>
                  </div>
                  <NpChevron dir="right" size={14}/>
                </button>
              ) : (
                <div key={p.key} style={{
                  flex:'1 1 0', minWidth: 0,
                  padding:'10px 12px', borderRadius: NP_R.md,
                  border:`1px dashed ${NP_T.borderStrong}`, background:'transparent',
                }}>
                  <div style={{fontSize: NP_FS.xs, fontWeight: 700, color: NP_T.textSubtle, textTransform:'uppercase', letterSpacing: 0.3}}>
                    {p.key}
                  </div>
                  <div style={{fontSize: NP_FS.lg, fontWeight: 700, color: NP_T.textSubtle, lineHeight: 1.1, marginTop: 1}}>
                    nessuno
                  </div>
                </div>
              )
            ))}
          </div>
        </section>
      )}
    </div>
    );
  };

  const renderExtra = () => {
    return (
    <div style={{display:'flex', flexDirection:'column', gap: 18}}>
      {/* Occasione */}
      <section>
        <NpFieldLabel>Occasione</NpFieldLabel>
        <div style={{display:'flex', gap: 6, flexWrap:'wrap'}}>
          {NP_TAG.map(t => (
            <button key={t.id} onClick={()=>setTag(tag===t.id?null:t.id)} style={{
              padding:'7px 14px', borderRadius: NP_R.pill,
              fontSize: NP_FS.md, fontWeight: 600, cursor:'pointer', fontFamily:'inherit',
              border: tag===t.id ? '1px solid transparent' : `1px solid ${NP_T.border}`,
              background: tag===t.id ? NP_T.brand : NP_T.bg,
              color: tag===t.id ? NP_T.textInv : NP_T.text,
              transition:'background 160ms ease, color 160ms ease, border-color 160ms ease',
            }}>{t.label}</button>
          ))}
        </div>
        {tag==='altro' && (
          <input value={tagAltro} onChange={e=>setTagAltro(e.target.value)}
            placeholder="Descrivi l'occasione..."
            style={{...npInput, marginTop: 10}}/>
        )}
      </section>

      {/* Note */}
      <section>
        <NpFieldLabel>Note</NpFieldLabel>
        <textarea value={note} onChange={e=>setNote(e.target.value)}
          placeholder="Note aggiuntive..." rows={3}
          style={{
            ...npInput, resize:'vertical', minHeight: 80, padding:'12px 14px',
          }}/>
      </section>

      {/* Allergeni — collassabile */}
      <section>
        <button onClick={()=>setShowAllergeni(s=>!s)} style={{
          width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between',
          padding:'10px 14px', borderRadius: NP_R.md,
          background: NP_T.bg, border:`1px dashed ${NP_T.borderStrong}`,
          cursor:'pointer', fontFamily:'inherit', textAlign:'left',
          transition:'background 160ms ease',
        }}
          onMouseEnter={e => e.currentTarget.style.background = NP_T.bgSoft}
          onMouseLeave={e => e.currentTarget.style.background = NP_T.bg}
        >
          <span style={{fontSize: NP_FS.sm, fontWeight: 600, color: allergeni.size > 0 ? NP_T.text : NP_T.textMuted}}>
            {allergeni.size > 0
              ? `Allergeni · ${allergeni.size} selezionat${allergeni.size===1?'o':'i'}`
              : '+ Aggiungi allergeni'}
          </span>
          <NpChevron dir={showAllergeni ? 'up' : 'down'} size={12}/>
        </button>
        {showAllergeni && (
          <div style={{display:'flex', gap: 6, flexWrap:'wrap', marginTop: 10}}>
            {NP_ALLERGENI.map(a => {
              const sel = allergeni.has(a);
              return (
                <button key={a} onClick={()=>toggleAllergene(a)} style={{
                  padding:'6px 12px', borderRadius: NP_R.sm,
                  fontSize: NP_FS.md, fontWeight: 600, cursor:'pointer', fontFamily:'inherit',
                  border: sel ? '1px solid transparent' : `1px solid ${NP_T.border}`,
                  background: sel ? '#B91C1C' : NP_T.bg,
                  color: sel ? NP_T.textInv : NP_T.text,
                  transition:'background 160ms ease, color 160ms ease, border-color 160ms ease',
                }}>{a}</button>
              );
            })}
          </div>
        )}
      </section>
    </div>
    );
  };

  return (
    <PnModal open={open} onClose={onClose}
      surface="solid"
      title={initData?.editMode ? 'Modifica prenotazione' : 'Nuova prenotazione'}
      width={720}
      footer={
        <PnButton variant="primary" disabled={!canSubmit}>
          {initData?.editMode ? 'Salva modifiche' : 'Crea prenotazione'}
        </PnButton>
      }
    >
      <div style={{display:'flex', flexDirection:'column', gap: 18}}>
        {renderDettagli()}
        {renderTavolo()}
      </div>
    </PnModal>
  );
}

window.SalaModalNuova = SalaModalNuova;
