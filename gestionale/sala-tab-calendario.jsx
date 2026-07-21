// Sala — Calendario prenotazioni: vista unificata
// Scala (Giorno/Settimana) × View mode (Timeline/Lista/Heatmap) + KPI bar + Cerca slot popover
// Sostituisce le 3 tab (Agenda / Disponibilità / Settimana) con una sola pagina

const SALA_RES_DATA = (() => {
  const data = [
    // Pranzo
    {id:'r1', time:'12:30', dur:90, name:'Famiglia Ferri', posti:4, table:5, status:'arrivata', phone:'+39 348 ...', note:null, source:'walkin'},
    {id:'r2', time:'13:00', dur:75, name:'Martina Ciani', posti:2, table:3, status:'confermata', phone:'+39 333 ...', note:{type:'allergia', text:'Allergia noci'}, notes:'Seduta lontano dalla cucina', source:'tel'},
    {id:'r3', time:'13:15', dur:90, name:'Luca Bianchi', posti:3, table:7, status:'arrivata', phone:'+39 339 ...', note:null, notes:null, source:'byup'},
    {id:'r4', time:'13:30', dur:60, name:'Pranzo aziendale', posti:6, table:11, status:'noshow', phone:'+39 02 ...', note:null, notes:null, source:'tel'},
    {id:'r4b', time:'13:45', dur:75, name:'Coppia Rossi', posti:2, table:6, status:'arrivata', phone:'+39 333 ...', note:null, notes:null, source:'walkin'},
    {id:'r4c', time:'14:00', dur:60, name:'Pellegrini', posti:3, table:9, status:'confermata', phone:'+39 348 ...', note:null, notes:'Pane senza glutine', source:'tel'},
    // Occupati senza nome (walk-in anonimi)
    {id:'occ1', time:'12:15', dur:90, name:'', posti:3, table:1,  status:'arrivata', phone:'', note:null, source:'walkin'},
    {id:'occ2', time:'12:30', dur:75, name:'', posti:2, table:9,  status:'arrivata', phone:'', note:null, source:'walkin'},
    {id:'occ3', time:'12:15', dur:45, name:'', posti:2, table:3,  status:'arrivata', phone:'', note:null, source:'walkin'},
    // Cena — profilo curato per disponibilità leggibile nel modal "Nuova prenotazione":
    // 19:00 → 11 liberi / 0 occupati · 20:00 → 5 liberi / 6 occupati · 21:00 → 0 liberi / 11 occupati · 22:00 → 5 liberi / 6 occupati
    // (Nessuna prenotazione spans 19:00–20:30, primo ingresso alle 20:30.)
    // Slot 20:30 (6 tavoli, dur 90 → terminano alle 22:00)
    {id:'r5',  time:'20:30', dur:90,  name:'Andrea Bianchi',  posti:2, table:3,  status:'confermata', phone:'+39 339 12 34 567', note:{type:'allergia', text:'Intolleranza glutine'}, notes:'Menu fisso concordato', source:'tel'},
    {id:'r18', time:'20:30', dur:90,  name:'Frodo Baggins',         posti:4, table:2,  status:'confermata', phone:'+39 333 ...',       note:null, notes:'Seggiolone bambino', source:'tel'},
    {id:'r19', time:'20:30', dur:90,  name:'Serra',           posti:2, table:4,  status:'confermata', phone:'+39 347 ...',       note:null, notes:null, source:'tel'},
    {id:'r21', time:'20:30', dur:90,  name:'Pellegrini',      posti:4, table:5,  status:'confermata', phone:'+39 347 ...',       note:null, notes:null, source:'tel'},
    {id:'r22', time:'20:30', dur:90,  name:'Mancini',         posti:2, table:6,  status:'confermata', phone:'+39 333 ...',       note:null, notes:'Festeggiamento laurea', source:'tel'},
    {id:'r8',  time:'20:30', dur:90,  name:'Tommy Shelby',   posti:8, table:1,  status:'inattesa',   phone:'+39 320 99 88 777', note:{type:'compleanno', text:'Candelina al dolce'}, notes:null, source:'tel'},
    // Slot 21:30 (5 tavoli, dur 90 → terminano alle 23:00)
    {id:'r6',  time:'21:30', dur:90,  name:'Famiglia Robinson',  posti:4, table:7,  status:'confermata', phone:'+39 348 22 33 444', note:{type:'allergia', text:'Allergia glutine'}, notes:null, source:'tel'},
    {id:'r12', time:'21:30', dur:90,  name:'Marini',          posti:4, table:12, status:'confermata', phone:'+39 348 ...',       note:{type:'aziendale', text:'Cliente VIP'}, notes:'Tavolo riservato lato finestra', source:'tel'},
    {id:'r13', time:'21:30', dur:90,  name:'Famiglia Verdi',  posti:5, table:11, status:'confermata', phone:'+39 320 ...',       note:null, notes:'2 bambini piccoli', source:'tel'},
    {id:'r10', time:'21:30', dur:90,  name:'De Luca',         posti:3, table:9,  status:'confermata', phone:'+39 349 22 33 111', note:{type:'anniversario', text:'25 anni di matrimonio'}, notes:null, source:'tel'},
    {id:'r8b', time:'21:30', dur:90,  name:'Tommy Shelby',   posti:8, table:8,  status:'inattesa',   phone:'+39 320 99 88 777', note:{type:'compleanno', text:'Compleanno · candelina'}, notes:null, source:'tel'},
    // Turnover dopo le 22:00: 1 prenotazione tardiva (compone i 6 occupati a 22:00 con i 5 del 21:30)
    {id:'r14', time:'22:30', dur:60,  name:'Jesse Pinkman',           posti:2, table:1,  status:'inattesa',   phone:'+39 339 ...',       note:null, notes:null, source:'walkin'},
    // Cancellata: non conta nei conteggi ma resta in lista per il flusso "cancellate"
    {id:'r17', time:'22:30', dur:60,  name:'Conti',           posti:2, table:4,  status:'cancellata', phone:'+39 333 ...',       note:null, notes:null, source:'tel'},
    // Tavolo 8 prenotato a pranzo dalle 12:30
    {id:'r24', time:'12:30', dur:75, name:'Esposito', posti:2, table:8, status:'confermata', phone:'+39 347 ...', note:null, notes:'Cliente abituale — posto fisso', source:'tel'},
    // Cluster imminenti 12:30
    {id:'r25', time:'12:30', dur:75,  name:'Borrelli',       posti:3, table:2,    status:'confermata', phone:'+39 345 ...', note:null, notes:'Menu vegano', source:'tel'},
    {id:'r26', time:'12:30', dur:60,  name:'Mele',           posti:2, table:4,    status:'inattesa',   phone:'+39 347 ...', note:null, notes:null, source:'tel'},
    {id:'r27', time:'12:15', dur:90,  name:'Gallo azienda',  posti:6, table:11,   status:'confermata', phone:'+39 02 ...',  note:{type:'aziendale', text:'Menù fisso'}, notes:null, source:'tel'},
    {id:'r28', time:'13:30', dur:90,  name:'Caruso',         posti:2, table:6,    status:'confermata', phone:'+39 340 ...', note:null, notes:null, source:'tel'},
    {id:'r29', time:'12:30', dur:120, name:'Pellegrini', posti:4, table:12,   status:'confermata', phone:'+39 333 ...', note:{type:'allergia', text:'Allergia lattosio'}, notes:null, source:'tel'},
    // In arrivo (seconda parte del pranzo) — cognomi in B
    {id:'r30', time:'13:30', dur:75,  name:'Bellini',        posti:2, table:4,    status:'confermata', phone:'+39 340 ...', note:null, notes:null, source:'byup'},
    {id:'r31', time:'13:45', dur:90,  name:'Barbieri',       posti:4, table:2,    status:'confermata', phone:'+39 348 ...', note:null, notes:'Chiede tavolo tranquillo', source:'byup'},
    {id:'r32', time:'13:45', dur:60,  name:'Battaglia',      posti:2, table:8,    status:'inattesa',   phone:'+39 333 ...', note:null, notes:null, source:'byup'},
    {id:'r33', time:'14:00', dur:90,  name:'Bruni',          posti:6, table:1,    status:'confermata', phone:'+39 347 ...', note:{type:'compleanno', text:'Torta portata da loro'}, notes:null, source:'byup'},
  ];
  return data;
})();

const NOW_HHMM = '12:00';
const ALL_TABLES = [{id:1,p:8},{id:2,p:4},{id:3,p:2},{id:4,p:2},{id:5,p:4},{id:6,p:2},{id:7,p:6},{id:8,p:2},{id:9,p:4},{id:11,p:6},{id:12,p:4}];

// API runtime per il modal "Nuova prenotazione" (vive in sala-app, fuori dai
// componenti calendario): muta l'array condiviso e notifica via evento same-page.
let SALA_RES_SEQ = 1;
window.SALA_RES_ADD = (res) => {
  const rec = { id: 'live' + (SALA_RES_SEQ++), dur: 90, status: 'confermata', phone: '', note: null, notes: null, source: 'tel', ...res };
  SALA_RES_DATA.push(rec);
  window.dispatchEvent(new CustomEvent('sala-res-change', { detail: { type: 'add', res: rec } }));
  return rec;
};
window.SALA_RES_UPDATE = (id, patch) => {
  const i = SALA_RES_DATA.findIndex(r => r.id === id);
  if (i !== -1) Object.assign(SALA_RES_DATA[i], patch);
  window.dispatchEvent(new CustomEvent('sala-res-change', { detail: { type: 'update', id, patch } }));
};
// Per i componenti che leggono SALA_RES_DATA direttamente nel render:
// re-render quando l'array cambia da fuori.
function useSalaResVersion() {
  const [, bump] = React.useReducer(x => x + 1, 0);
  React.useEffect(() => {
    window.addEventListener('sala-res-change', bump);
    return () => window.removeEventListener('sala-res-change', bump);
  }, []);
}

function timeToMin(t) { const [h,m] = t.split(':').map(Number); return h*60+m; }

// Colori dei segmenti in timeline — gerarchia per priorità visiva, niente tinte da alert
// (rosso/ambra/verde-successo restano riservati a now-line e stati di sistema).
//  occupato → walk-in senza nome: priorità minima, neutro che arretra
//  attivata → prenotazione con nome già seduta (in servizio): neutro
//  byup       → tavolo aperto dalla Byup App: neutro
//  futura     → prenotazione in arrivo (tavolo non ancora attivo): VIOLA sala (stato "prenotato")
//  futuraByup → prenotazione in arrivo dalla Byup App: CORAL brand
// Tavoli già attivi (occupato / attivata / byup) → grigio neutro: arretrano.
// Solo le prenotazioni in arrivo sono colorate: viola come i tavoli prenotati
// in sala, coral riservato a quelle che arrivano dalla Byup App (badge b).
const SLOT_GREY = { bg:'#EDF0F4', border:'#D2D9E2', text:'#6B7685' };
const SLOT_STYLE = {
  occupato:   SLOT_GREY,
  attivata:   SLOT_GREY,
  byup:       SLOT_GREY,
  futura:     { bg:'rgba(124, 58, 237, 0.12)', border:'rgba(124, 58, 237, 0.38)', text:'#6D28D9' },
  futuraByup: { bg:'#FFECEA', border:'#FFA3A6', text:'#B4232F' },
};
function slotCategory(r) {
  if (r.status !== 'arrivata') return r.source === 'byup' ? 'futuraByup' : 'futura';
  if (r.source === 'byup') return 'byup';
  return r.name ? 'attivata' : 'occupato';
}

// ─────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────
function SalaCalendario({ tweaks, onNuova, onModifica }) {
  const [dayView, setDayView] = React.useState('timeline'); // timeline | lista

  return (
    <div style={{display:'flex', flexDirection:'column', gap: 14, minWidth: 0, maxWidth:'100%', overflow:'hidden', position:'relative'}}>
      <Toolbar
        dayView={dayView} setDayView={setDayView}
        onNuova={onNuova}
      />

      {dayView === 'timeline' && <DayTimeline onNuova={onNuova} onModifica={onModifica}/>}
      {dayView === 'lista' && <DayList onModifica={onModifica}/>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// TOOLBAR
// ─────────────────────────────────────────────────────────
const CAL_DOW = ['L','M','M','G','V','S','D'];
const calISO = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const calSameDay = (a,b) => a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate();

function Toolbar({ dayView, setDayView, onNuova }) {
  const today = React.useMemo(() => { const d = new Date(); d.setHours(0,0,0,0); return d; }, []);
  const [selISO, setSelISO] = React.useState(() => calISO(today));
  const [showCal, setShowCal] = React.useState(false);
  const wrapRef = React.useRef(null);

  const selDate = React.useMemo(() => { const d = new Date(selISO); d.setHours(0,0,0,0); return d; }, [selISO]);
  const isToday = calSameDay(selDate, today);

  React.useEffect(() => {
    if (!showCal) return;
    const h = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setShowCal(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [showCal]);

  const btnLabel = isToday
    ? 'Oggi'
    : selDate.toLocaleDateString('it-IT', {weekday:'short', day:'numeric', month:'short'});

  return (
    <div style={{display:'flex', alignItems:'center', gap: 10, flexWrap:'wrap'}}>
      {/* Sinistra: toggle vista */}
      <Segmented
        value={dayView}
        onChange={setDayView}
        options={[{id:'timeline', label:'Timeline'}, {id:'lista', label:'Lista'}]}
        small
      />

      <span style={{flex:1}}/>

      {/* Destra: pulsante data (apre il calendario) + prenota */}
      <div ref={wrapRef} style={{position:'relative'}}>
        <button onClick={()=>setShowCal(s=>!s)} style={{
          padding:'8px 13px', borderRadius: 8,
          background:'#F1F2F5', border:'1px solid transparent',
          fontSize: 16.5, fontWeight: 700, color:'#0F1115',
          cursor:'pointer', fontFamily:'inherit', whiteSpace:'nowrap', textTransform:'capitalize',
          display:'inline-flex', alignItems:'center', gap: 7,
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          {btnLabel}
        </button>
        {showCal && (
          <ToolbarCalendar today={today} selected={selDate}
            onPick={(iso)=>{ setSelISO(iso); setShowCal(false); }}/>
        )}
      </div>

      {/* Prenota — dark sunset glass (D3): base wine-burnt + inset ring caldo */}
      <button onClick={onNuova} style={{
        padding:'9px 15px 9px 12px', borderRadius: 9,
        background: `
          radial-gradient(circle at 82% 18%, rgba(255, 96, 102, 0.32), transparent 62%),
          linear-gradient(180deg, rgba(58, 28, 22, 0.96) 0%, rgba(30, 12, 10, 0.98) 100%)
        `,
        color:'#FFE9E6', border:'none',
        fontSize: 16, fontWeight: 700, letterSpacing:'0.01em',
        cursor:'pointer', fontFamily:'inherit',
        display:'inline-flex', alignItems:'center', gap: 6, whiteSpace:'nowrap',
        boxShadow: 'inset 0 1px 0 rgba(255,200,210,0.18), inset 0 0 0 1px rgba(255,130,150,0.12), 0 8px 22px -8px rgba(80,10,30,0.55), 0 3px 8px -4px rgba(80,10,30,0.30)',
        transition:'filter 150ms ease-out, transform 150ms ease-out',
      }}
        onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.15)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
        onMouseLeave={e => { e.currentTarget.style.filter = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14 M5 12h14"/>
        </svg>
        Prenota
      </button>
    </div>
  );
}

function ToolbarCalendar({ today, selected, onPick }) {
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

  const navBtn = (disabled) => ({
    width: 26, height: 26, borderRadius: 6,
    background: disabled ? 'transparent' : '#fff',
    border: `1px solid ${disabled ? '#F0F2F5' : '#E5E7EB'}`,
    cursor: disabled ? 'default' : 'pointer', fontFamily:'inherit',
    color: disabled ? '#D1D5DB' : '#0F1115', fontSize: 18,
    display:'flex', alignItems:'center', justifyContent:'center', opacity: disabled ? 0.5 : 1,
  });

  return (
    <div onClick={e=>e.stopPropagation()} style={{
      position:'absolute', top:'100%', right: 0, marginTop: 8, zIndex: 60,
      width: 280, padding: 14, background:'#fff', borderRadius: 12,
      border:`1px solid ${PN.BORDER_SOFT_A}`,
      boxShadow:'inset 0 1px 0 rgba(255,255,255,0.75), 0 16px 36px rgba(15,17,21,0.16), 0 2px 6px rgba(15,17,21,0.06)',
    }}>
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: 10}}>
        <button onClick={goPrev} disabled={!canPrev} style={navBtn(!canPrev)}>‹</button>
        <span style={{fontSize: 17, fontWeight: 700, color:'#0F1115', textTransform:'capitalize'}}>{monthLabel}</span>
        <button onClick={goNext} style={navBtn(false)}>›</button>
      </div>
      <div style={{display:'grid', gridTemplateColumns:'repeat(7, 1fr)', gap: 4, marginBottom: 4}}>
        {CAL_DOW.map((d,i) => (
          <span key={i} style={{fontSize: 14, fontWeight: 700, color:'#9CA3AF', textAlign:'center', padding: 2}}>{d}</span>
        ))}
      </div>
      <div style={{display:'grid', gridTemplateColumns:'repeat(7, 1fr)', gap: 4}}>
        {grid.map((day, i) => {
          if (!day) return <span key={i}/>;
          const isSel = calSameDay(day, selected);
          const isToday = calSameDay(day, today);
          const isPast = day < today;
          return (
            <button key={i} disabled={isPast} onClick={()=>onPick(calISO(day))} style={{
              padding:'7px 0', borderRadius: 7, position:'relative',
              background: isSel ? '#0F1115' : 'transparent',
              color: isSel ? '#fff' : isPast ? '#D1D5DB' : '#0F1115',
              border:'none', cursor: isPast ? 'default' : 'pointer', fontFamily:'inherit',
              fontSize: 16.5, fontWeight: isSel || isToday ? 700 : 500,
            }}>
              {day.getDate()}
              {isToday && !isSel && (
                <span style={{position:'absolute', bottom: 3, left:'50%', transform:'translateX(-50%)',
                  width: 4, height: 4, borderRadius:'50%', background:'#0F1115'}}/>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Segmented({ value, onChange, options, small }) {
  return (
    <div style={{
      display:'inline-flex', background:'#F1F2F5', borderRadius: 8, padding: 3,
    }}>
      {options.map(o => (
        <button key={o.id} onClick={()=>onChange(o.id)} style={{
          padding: small ? '6px 11px' : '7px 13px', borderRadius: 6,
          background: value === o.id ? '#fff' : 'transparent',
          border:'none', cursor:'pointer', fontFamily:'inherit',
          fontSize: small ? 16 : 16.5, fontWeight: value === o.id ? 700 : 600,
          color: value === o.id ? '#0F1115' : '#6B7280',
          boxShadow: value === o.id ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
          whiteSpace:'nowrap', transition:'all 0.12s',
        }}>{o.label}</button>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// DAY · TIMELINE — table × time grid (mostra il turnover visivamente)
// ─────────────────────────────────────────────────────────
const TURNI = [
  { id:'pranzo', label:'Pranzo', start:12*60, end:15*60+30 },
  { id:'cena',   label:'Cena',   start:19*60, end:24*60    },
];
const T_PRANZO_DUR = TURNI[0].end - TURNI[0].start; // 210 min

function DayTimeline({ onNuova, onModifica }) {
  const tables = ALL_TABLES;

  const [resData, setResData] = React.useState(() => SALA_RES_DATA);
  // Prenotazioni aggiunte/modificate dal modal (fuori da questo componente):
  // merge nello stato locale senza perdere gli spostamenti fatti col drag.
  React.useEffect(() => {
    const onChange = (e) => {
      const d = e.detail || {};
      if (d.type === 'add') setResData(prev => [...prev, d.res]);
      else if (d.type === 'update') setResData(prev => prev.map(r => r.id === d.id ? { ...r, ...d.patch } : r));
    };
    window.addEventListener('sala-res-change', onChange);
    return () => window.removeEventListener('sala-res-change', onChange);
  }, []);
  const valid = resData.filter(r => r.status !== 'cancellata' && r.status !== 'noshow' && r.table);
  const nowMin = timeToMin(NOW_HHMM);

  // Misura la larghezza disponibile dal .pn-scroll (ancestor stabile, non cresce col contenuto)
  // e applica una WIDTH ESPLICITA in pixel sull'outerRef. Così l'outerRef non può
  // esplodere oltre l'area utile quando contentMinW diventa wide a L4 (15min).
  const outerRef = React.useRef(null);
  const [availW, setAvailW] = React.useState(900);
  React.useEffect(() => {
    const measure = () => {
      let p = outerRef.current?.parentElement;
      while (p && !p.classList?.contains('pn-scroll')) p = p.parentElement;
      const ref = p || outerRef.current?.parentElement;
      if (!ref) return;
      const cs = window.getComputedStyle(ref);
      const pl = parseFloat(cs.paddingLeft) || 0;
      const pr = parseFloat(cs.paddingRight) || 0;
      const w = ref.clientWidth - pl - pr;
      if (w > 100) setAvailW(w);
    };
    measure();
    const t1 = setTimeout(measure, 50);
    const t2 = setTimeout(measure, 200);
    window.addEventListener('resize', measure);
    return () => {
      clearTimeout(t1); clearTimeout(t2);
      window.removeEventListener('resize', measure);
    };
  }, []);
  // Cena 19:00–24:00. Dopo mezzanotte il locale è chiuso: una banda fissa "Chiuso"
  // (stessa larghezza del gap pranzo–cena, CLOSED_W) chiude la timeline a destra.
  const cenaExt = TURNI[1];
  const T_CENA_EXT = TURNI[1].end - TURNI[1].start;

  // Larghezza delle bande "Chiuso" (gap pranzo–cena e post-cena), uguali tra loro.
  const CLOSED_W = 130;
  // FIXED_PX: label(90) + 2 bande Chiuso(CLOSED_W) + 4 gap griglia(8) + padding(18)·2
  const FIXED_PX = 90 + CLOSED_W + CLOSED_W + 4 * 8 + 2 * 18;
  const basePxPerMin = Math.max((availW - FIXED_PX) / (T_PRANZO_DUR + T_CENA_EXT), 1.2);

  // Vista fissa a 15min
  const zoomLevel = 4;

  // Scrollbar orizzontale custom (sempre visibile, cross-browser/OS)
  const scrollContainerRef = React.useRef(null);
  const customScrollbarRef = React.useRef(null);
  const [scrollMetrics, setScrollMetrics] = React.useState({ left: 0, width: 1, client: 1 });
  React.useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const update = () => setScrollMetrics({ left: el.scrollLeft, width: el.scrollWidth, client: el.clientWidth });
    update();
    el.addEventListener('scroll', update, { passive: true });
    // Osservo sia il wrapper sia il figlio interno (scrollWidth dipende dal figlio)
    const ro = new ResizeObserver(update);
    ro.observe(el);
    const inner = el.firstElementChild;
    if (inner) ro.observe(inner);
    return () => { el.removeEventListener('scroll', update); ro.disconnect(); };
  }, []);
  React.useEffect(() => {
    const t = setTimeout(() => {
      const el = scrollContainerRef.current;
      if (el) setScrollMetrics({ left: el.scrollLeft, width: el.scrollWidth, client: el.clientWidth });
    }, 60);
    return () => clearTimeout(t);
  }, [zoomLevel]);
  const hasScrollOverflow = scrollMetrics.width > scrollMetrics.client + 1;
  const thumbWPct = Math.min(100, (scrollMetrics.client / scrollMetrics.width) * 100);
  const maxScroll = Math.max(0, scrollMetrics.width - scrollMetrics.client);
  const scrollProgress = maxScroll > 0 ? scrollMetrics.left / maxScroll : 0;
  const thumbLPct = scrollProgress * (100 - thumbWPct);
  function handleThumbDrag(e) {
    if (!hasScrollOverflow) return;
    e.preventDefault();
    const startX = e.clientX;
    const startScroll = scrollContainerRef.current?.scrollLeft || 0;
    const trackW = customScrollbarRef.current?.clientWidth || 1;
    const scrollableTrack = trackW * (1 - thumbWPct / 100);
    const onMove = (ev) => {
      const dx = ev.clientX - startX;
      const ratio = scrollableTrack > 0 ? dx / scrollableTrack : 0;
      const next = startScroll + ratio * maxScroll;
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollLeft = Math.max(0, Math.min(maxScroll, next));
      }
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }

  // PX_PER_MIN: basePxPerMin è misurato dal parent stabile (non loop).
  // A L3 default (30min, zoomMul=1) la timeline fitta l'area disponibile.
  // A L4 (15min, zoomMul=2) è 2× wide → scroll dentro la timeline (outerRef ha width esplicita).
  const gridInterval = zoomLevel === 1 ? 60 : zoomLevel === 2 ? 45 : zoomLevel === 3 ? 30 : 15;
  const zoomMul = 30 / gridInterval;
  const PX_PER_MIN = basePxPerMin * zoomMul;
  const pranzoW = Math.round(T_PRANZO_DUR * PX_PER_MIN);
  const cenaW   = Math.round(T_CENA_EXT   * PX_PER_MIN);
  const contentMinW = 90 + pranzoW + CLOSED_W + cenaW + CLOSED_W + 4 * 8 + 2 * 18;
  const hasFill = availW > contentMinW;
  const dynGrid  = `90px ${pranzoW}px ${CLOSED_W}px ${cenaW}px ${CLOSED_W}px`;
  const innerW = hasFill ? availW : contentMinW;

  function turnoForMin(min) {
    if (min >= TURNI[0].start && min < TURNI[0].end) return TURNI[0];
    if (min >= cenaExt.start && min <= cenaExt.end) return cenaExt;
    return null;
  }
  function pctInTurno(min, turno) { return ((min - turno.start) / (turno.end - turno.start)) * 100; }
  function nowPctInTurno(turno) {
    if (nowMin < turno.start || nowMin > turno.end) return null;
    return pctInTurno(nowMin, turno);
  }
  function pastPctInTurno(turno) {
    if (nowMin <= turno.start) return 0;
    if (nowMin >= turno.end) return 100;
    return pctInTurno(nowMin, turno);
  }

  const [conflictWarning, setConflictWarning] = React.useState(false);

  // Ref sempre aggiornato: hasConflict è chiamato dal mouseup registrato una
  // volta sola (deps []) — con resData diretto vedrebbe le posizioni del primo
  // render e lascerebbe sovrapporre gli slot spostati/aggiunti dopo.
  const resDataRef = React.useRef(resData);
  resDataRef.current = resData;

  function hasConflict(resId, tableId, newStart, dur) {
    const newEnd = newStart + dur;
    return resDataRef.current.some(r => {
      if (r.id === resId) return false;
      if (r.table !== tableId) return false;
      if (r.status === 'cancellata' || r.status === 'noshow') return false;
      const s = timeToMin(r.time);
      return newStart < s + r.dur && newEnd > s;
    });
  }
  const pranzoTrackRef = React.useRef(null);
  const cenaTrackRef   = React.useRef(null);
  function getTRef(turno) { return turno?.id === 'cena' ? cenaTrackRef : pranzoTrackRef; }
  function minInTrack(clientX, turno) {
    const ref = getTRef(turno);
    if (!ref.current) return turno.start;
    const rect = ref.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return Math.round((turno.start + pct * (turno.end - turno.start)) / 15) * 15;
  }
  const dragRef     = React.useRef(null);
  const [drag, setDrag] = React.useState(null);
  const slotDragRef = React.useRef(null);
  const [slotDrag, setSlotDrag] = React.useState(null);
  const rowRefsMap  = React.useRef({});
  const resizeRef   = React.useRef(null);
  const [resizeDrag, setResizeDrag] = React.useState(null);

  function handleResizeMouseDown(e, r, edge) {
    e.preventDefault(); e.stopPropagation();
    const rStartMin = timeToMin(r.time);
    const rEndMin = rStartMin + r.dur;
    const turno = turnoForMin(rStartMin);
    if (!turno) return;
    const d = { resId:r.id, edge, turno, origStartMin:rStartMin, origEndMin:rEndMin, curStartMin:rStartMin, curEndMin:rEndMin };
    resizeRef.current = d;
    setResizeDrag({...d});
  }

  function handleSlotMouseDown(e, r) {
    e.preventDefault(); e.stopPropagation();
    const sMin = timeToMin(r.time);
    const turno = turnoForMin(sMin);
    if (!turno) return;
    const clickMin = minInTrack(e.clientX, turno);
    // Il drag parte solo oltre una soglia di movimento: sotto, è un click
    // che apre la prenotazione in modifica (vedi onUp). Niente setSlotDrag
    // qui, così un click semplice non fa nemmeno lampeggiare lo slot.
    const d = { resId:r.id, res:r, dur:r.dur, turno, offsetMin:clickMin - sMin, curMin:sMin, curTableId:r.table,
      startX:e.clientX, startY:e.clientY, moved:false };
    slotDragRef.current = d;
  }

  function handleTrackMouseDown(e, table, turno) {
    e.preventDefault();
    const min = minInTrack(e.clientX, turno);
    const tableRes = valid.filter(r => r.table === table.id);
    const onExisting = tableRes.some(r => { const s = timeToMin(r.time); return min >= s && min < s + r.dur; });
    if (onExisting) return;
    const nextStart = tableRes.map(r => timeToMin(r.time)).filter(s => s > min).sort((a,b)=>a-b)[0] ?? turno.end;
    const d = { tableId:table.id, tablePosts:table.p, turno, startMin:min, curMin:Math.min(min+90, nextStart), maxMin:nextStart };
    dragRef.current = d;
    setDrag({...d});
  }

  React.useEffect(() => {
    const onMove = (e) => {
      if (dragRef.current) {
        const d = dragRef.current;
        const min = minInTrack(e.clientX, d.turno);
        const newCurMin = Math.max(d.startMin + 30, Math.min(min, d.maxMin));
        dragRef.current = {...d, curMin: newCurMin};
        setDrag({...dragRef.current});
      }
      if (slotDragRef.current) {
        const sd = slotDragRef.current;
        // Soglia anti-click: micro-movimenti (≤5px) non avviano il drag
        if (!sd.moved && Math.abs(e.clientX - sd.startX) + Math.abs(e.clientY - sd.startY) <= 5) return;
        const rawMin = minInTrack(e.clientX, sd.turno);
        const newStart = Math.max(sd.turno.start, Math.min(rawMin - sd.offsetMin, sd.turno.end - sd.dur));
        let curTableId = sd.curTableId;
        for (const [tid, el] of Object.entries(rowRefsMap.current)) {
          if (!el) continue;
          const rb = el.getBoundingClientRect();
          if (e.clientY >= rb.top && e.clientY <= rb.bottom) { curTableId = parseInt(tid); break; }
        }
        slotDragRef.current = {...sd, moved:true, curMin: newStart, curTableId};
        setSlotDrag({...slotDragRef.current});
      }
      if (resizeRef.current) {
        const rd = resizeRef.current;
        const rawMin = minInTrack(e.clientX, rd.turno);
        const curStartMin = rd.edge === 'left'  ? Math.min(rd.origEndMin - 30, Math.max(rawMin, rd.turno.start)) : rd.curStartMin;
        const curEndMin   = rd.edge === 'right' ? Math.max(rd.origStartMin + 30, Math.min(rawMin, rd.turno.end)) : rd.curEndMin;
        resizeRef.current = {...rd, curStartMin, curEndMin};
        setResizeDrag({...resizeRef.current});
      }
    };
    const onUp = () => {
      const d = dragRef.current;
      if (d) {
        dragRef.current = null; setDrag(null);
        const dur = Math.max(30, d.curMin - d.startMin);
        const hh = String(Math.floor(d.startMin / 60)).padStart(2, '0');
        const mm = String(d.startMin % 60).padStart(2, '0');
        if (onNuova) onNuova({ time:`${hh}:${mm}`, dur, tableId:d.tableId, coperti:d.tablePosts });
      }
      const sd = slotDragRef.current;
      if (sd) {
        slotDragRef.current = null; setSlotDrag(null);
        if (!sd.moved) {
          // Click senza trascinamento: apre la prenotazione in modifica
          if (onModifica) onModifica(sd.res);
        } else if (hasConflict(sd.resId, sd.curTableId, sd.curMin, sd.dur)) {
          setConflictWarning(true);
        } else {
          const hh = String(Math.floor(sd.curMin / 60)).padStart(2, '0');
          const mm = String(sd.curMin % 60).padStart(2, '0');
          // Scrive nello store globale (il listener sala-res-change aggiorna
          // resData): così modale e Lista vedono sempre le posizioni vere.
          window.SALA_RES_UPDATE(sd.resId, { time:`${hh}:${mm}`, table:sd.curTableId });
        }
      }
      const rd = resizeRef.current;
      if (rd) {
        resizeRef.current = null; setResizeDrag(null);
        if (hasConflict(rd.resId, resDataRef.current.find(r => r.id === rd.resId)?.table, rd.curStartMin, rd.curEndMin - rd.curStartMin)) {
          setConflictWarning(true);
        } else {
          const hh = String(Math.floor(rd.curStartMin / 60)).padStart(2, '0');
          const mm = String(rd.curStartMin % 60).padStart(2, '0');
          window.SALA_RES_UPDATE(rd.resId, { time:`${hh}:${mm}`, dur:rd.curEndMin - rd.curStartMin });
        }
      }
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, []);


  // Render one turno track for a table row
  function renderTurnoTrack(t, turno) {
    const tDur = turno.end - turno.start;
    const np = nowPctInTurno(turno);
    const pp = pastPctInTurno(turno);
    const rsvInTurno = valid.filter(r => {
      const s = timeToMin(r.time);
      return r.table === t.id && s >= turno.start && s < turno.end;
    });
    const isDragging = slotDrag || resizeDrag || drag;
    return (
      <div
        onMouseDown={(e) => handleTrackMouseDown(e, t, turno)}
        style={{
          position:'relative', height:72,
          background:`repeating-linear-gradient(to right, #EDEEF2 0, #EDEEF2 1px, transparent 1px, transparent calc(100%/${tDur/gridInterval}))`,
          // Cena: −1px nasconde la prima linea (sotto le 19:00); il clip a destra rimuove
          // l'ultima linea (a sinistra di 00:00). Restano solo le linee interne.
          backgroundPosition: turno.id === 'cena' ? '-1px 0' : '0 0',
          clipPath: turno.id === 'cena' ? 'inset(0 1px 0 0)' : 'none',
          cursor: slotDrag ? 'grabbing' : drag ? 'col-resize' : 'crosshair',
          userSelect:'none',
        }}
      >
        {/* Past zone */}
        {pp > 0 && (
          <div style={{position:'absolute', top:0, bottom:0, left:0, width:`${Math.min(pp,100)}%`,
            background:'rgba(0,0,0,0.028)', pointerEvents:'none', zIndex:1}}/>
        )}
        {/* Now line */}
        {np !== null && (
          <div style={{position:'absolute', top:-6, bottom:-6, left:`${np}%`, width:2.5,
            background:'#DC2626', zIndex:3}}/>
        )}
        {/* Ghost resize */}
        {resizeDrag && resizeDrag.turno?.id === turno.id && (() => {
          const res = valid.find(r => r.id === resizeDrag.resId);
          if (!res || res.table !== t.id) return null;
          const gLeft  = ((resizeDrag.curStartMin - turno.start) / tDur) * 100;
          const gWidth = ((resizeDrag.curEndMin - resizeDrag.curStartMin) / tDur) * 100;
          const sHH = String(Math.floor(resizeDrag.curStartMin/60)).padStart(2,'0');
          const sMM = String(resizeDrag.curStartMin%60).padStart(2,'0');
          const eHH = String(Math.floor(resizeDrag.curEndMin/60)).padStart(2,'0');
          const eMM = String(resizeDrag.curEndMin%60).padStart(2,'0');
          const durMin = resizeDrag.curEndMin - resizeDrag.curStartMin;
          const dLbl = durMin >= 60 ? `${Math.floor(durMin/60)}h${durMin%60>0?`${durMin%60}'`:''}` : `${durMin}'`;
          return (
            <div key="rg" style={{position:'absolute', left:`${gLeft}%`, width:`${gWidth}%`,
              top:3, bottom:3, pointerEvents:'none', zIndex:10,
              background:'rgba(16,185,129,0.13)', border:'2px dashed #10B981', borderRadius:7,
              display:'flex', alignItems:'center', justifyContent:'space-between',
              padding:'0 7px', fontSize:14.5, fontWeight:700, color:'#059669',
              overflow:'hidden', whiteSpace:'nowrap'}}>
              <span>{sHH}:{sMM}</span><span style={{opacity:0.7}}>{dLbl}</span><span>{eHH}:{eMM}</span>
            </div>
          );
        })()}
        {/* Ghost slot move */}
        {slotDrag && slotDrag.turno?.id === turno.id && slotDrag.curTableId === t.id && (() => {
          const gLeft  = ((slotDrag.curMin - turno.start) / tDur) * 100;
          const gWidth = (slotDrag.dur / tDur) * 100;
          const hh = String(Math.floor(slotDrag.curMin/60)).padStart(2,'0');
          const mm = String(slotDrag.curMin%60).padStart(2,'0');
          return (
            <div key="sg" style={{position:'absolute', left:`${gLeft}%`, width:`${gWidth}%`,
              top:3, bottom:3, pointerEvents:'none', zIndex:10,
              background:'rgba(16,185,129,0.13)', border:'2px dashed #10B981', borderRadius:7,
              display:'flex', alignItems:'center', padding:'0 7px',
              fontSize:14.5, fontWeight:700, color:'#059669',
              overflow:'hidden', whiteSpace:'nowrap'}}>{hh}:{mm}</div>
          );
        })()}
        {/* Ghost drag-to-create */}
        {drag && drag.turno?.id === turno.id && drag.tableId === t.id && (() => {
          const ghostLeft  = ((drag.startMin - turno.start) / tDur) * 100;
          const ghostWidth = Math.max(((drag.curMin - drag.startMin) / tDur) * 100, 1);
          const dur = drag.curMin - drag.startMin;
          const hh = String(Math.floor(drag.startMin/60)).padStart(2,'0');
          const mm = String(drag.startMin%60).padStart(2,'0');
          const dLbl = dur >= 60 ? `${Math.floor(dur/60)}h${dur%60>0?` ${dur%60}'`:''}` : `${dur}'`;
          return (
            <div key="dg" style={{position:'absolute', left:`${ghostLeft}%`, width:`${ghostWidth}%`,
              top:5, bottom:5, pointerEvents:'none', zIndex:10,
              background:'rgba(255,90,95,0.09)', border:'2px dashed #FF5A5F', borderRadius:7,
              display:'flex', alignItems:'center', padding:'0 6px',
              fontSize:14.5, fontWeight:700, color:'#E32459',
              overflow:'hidden', whiteSpace:'nowrap'}}>{hh}:{mm} · {dLbl}</div>
          );
        })()}
        {/* Slots */}
        {rsvInTurno.map(r => {
          const sMin = timeToMin(r.time);
          const isOccupato = r.status === 'arrivata';
          const sty = SLOT_STYLE[slotCategory(r)];
          const visualStart = isOccupato ? nowMin : sMin;
          const slotEnd = visualStart + r.dur;
          const left  = ((Math.max(visualStart, turno.start) - turno.start) / tDur) * 100;
          const width = ((Math.min(slotEnd, turno.end) - Math.max(visualStart, turno.start)) / tDur) * 100;
          const showLabel = (Math.min(slotEnd, turno.end) - Math.max(visualStart, turno.start)) >= 30;
          const past = slotEnd < nowMin;
          return (
            <div key={r.id} title={`${r.time} · ${r.name} · ${r.posti}p · ${r.dur}min`}
              onMouseDown={!isOccupato ? (e) => handleSlotMouseDown(e,r) : (e) => e.stopPropagation()}
              style={{
                position:'absolute', left:`${left}%`, width:`${width}%`,
                top:5, bottom:5,
                background: sty.bg,
                color: sty.text,
                border: `1.5px solid ${sty.border}`,
                borderRadius:7,
                padding: showLabel ? '6px 8px 0' : '0',
                fontSize:20, fontWeight:700,
                display:'flex', alignItems:'flex-start', gap:4,
                overflow:'hidden', whiteSpace:'nowrap',
                opacity: (slotDrag && slotDrag.resId===r.id) || (resizeDrag && resizeDrag.resId===r.id) ? 0.3 : past ? 0.5 : 1,
                cursor: isOccupato ? 'default' : isDragging ? 'grabbing' : 'grab',
                zIndex:2,
                transition: isDragging ? 'none' : 'opacity 150ms',
              }}>
              {!isOccupato && <div onMouseDown={(e)=>handleResizeMouseDown(e,r,'left')}
                style={{position:'absolute', left:0, top:0, bottom:0, width:8, cursor:'ew-resize', zIndex:5, borderRadius:'7px 0 0 7px'}}/>}
              {showLabel && (
                <>
                  <span style={{overflow:'hidden', textOverflow:'ellipsis', flex:1, minWidth:0, paddingLeft:6, display:'flex', alignItems:'center', gap:4}}>
                    <span style={{overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>
                      {r.name || (isOccupato ? 'Occupato' : r.time)}
                    </span>
                    {r.source === 'byup' && (
                      <span style={{
                        width:18, height:18, borderRadius:'50%', background:'linear-gradient(135deg, #FF5A5F, #B53338)',
                        display:'inline-flex', alignItems:'center', justifyContent:'center', flexShrink:0,
                      }}>
                        <span style={{fontSize:16, fontWeight:900, color:'#fff', lineHeight:1, letterSpacing:-0.5,
                          fontFamily:'-apple-system,system-ui,sans-serif', display:'inline-block', transform:'translateY(-0.5px)',
                        }}>b</span>
                      </span>
                    )}
                  </span>
                  <span title={`${r.posti} ${r.posti===1?'coperto':'coperti'}`} style={{opacity:0.55, flexShrink:0, paddingRight:6, fontSize:18, fontWeight:700, display:'inline-flex', alignItems:'center', gap:3}}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                    {r.posti}
                  </span>
                </>
              )}
              {!isOccupato && <div onMouseDown={(e)=>handleResizeMouseDown(e,r,'right')}
                style={{position:'absolute', right:0, top:0, bottom:0, width:8, cursor:'ew-resize', zIndex:5, borderRadius:'0 7px 7px 0'}}/>}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div ref={outerRef} style={{background:'#fff', borderRadius:14, border:`1px solid ${PN.BORDER_HAIR}`, boxShadow:'0 1px 0 rgba(15,17,21,0.04), 0 6px 18px rgba(15,17,21,0.04)', overflow:'hidden', width: availW + 'px', maxWidth:'100%'}}>

      {/* Wrapper scrollabile orizzontalmente — scrollbar nativa nascosta, gestita dal custom sotto */}
      <div ref={scrollContainerRef} className="byup-tl-scroll" style={{
        overflowX:'auto', overflowY:'hidden',
        width:'100%', minWidth:0,
      }}>
        <div style={{minWidth: innerW + 'px', width: innerW + 'px'}}>

          {/* Righello ore — sticky, resta visibile durante lo scroll delle righe */}
          <div style={{position:'sticky', top:0, zIndex:2, background:'#fff',
            boxShadow:'0 2px 8px rgba(0,0,0,0.05)'}}>

          {/* Hour ruler */}
          <div style={{display:'grid', gridTemplateColumns: dynGrid, gap:8,
            padding:'6px 18px 4px', borderBottom:'1px solid #E9EBF0', background:'#fff'}}>
            <div style={{borderRight:'1px solid #EDEEF2'}}/>
            <div ref={pranzoTrackRef} style={{position:'relative', height:24}}>
              {(() => {
                const turno = TURNI[0]; const tDur = T_PRANZO_DUR;
                const ticks = [];
                for (let m = Math.ceil(turno.start / gridInterval) * gridInterval; m <= turno.end; m += gridInterval) {
                  const isHour = m % 60 === 0;
                  const pct = ((m - turno.start) / tDur) * 100;
                  if (pct < 0 || pct > 100) continue;
                  // L'ultimo tick (15:30) si centra sul bordo della cella "Chiuso" (+8px di gap griglia)
                  const isLast = pct >= 99;
                  const left = isLast ? `calc(${pct}% + 8px)` : `${pct}%`;
                  const tx = pct <= 1 ? 'translateX(0)' : 'translateX(-50%)';
                  const h = Math.floor(m / 60); const min = m % 60;
                  const label = min === 0 ? `${h}:00` : `${String(min).padStart(2,'0')}`;
                  ticks.push(<span key={m} style={{position:'absolute', left,
                    top: isHour ? 2 : 8, fontSize: isHour ? 16 : 13.5,
                    fontWeight: isHour ? 800 : 500, color: isHour ? '#6B7280' : '#B0B7C3',
                    transform:tx, whiteSpace:'nowrap'}}>{label}</span>);
                }
                return ticks;
              })()}
              {nowPctInTurno(TURNI[0]) !== null && (
                <div style={{position:'absolute', bottom:-5, left:`${nowPctInTurno(TURNI[0])}%`,
                  width:8, height:8, borderRadius:'50%', background:'#DC2626', zIndex:4,
                  transform:'translateX(-50%)'}}/>
              )}
            </div>
            <div style={{display:'flex', alignItems:'center', justifyContent:'center', height:'100%'}}>
              <span style={{fontSize:13, fontWeight:600, color:'#AEB4BE', letterSpacing:1.2,
                textTransform:'uppercase', whiteSpace:'nowrap'}}>Chiuso</span>
            </div>
            <div ref={cenaTrackRef} style={{position:'relative', height:24}}>
              {(() => {
                const turno = cenaExt; const tDur = T_CENA_EXT;
                const ticks = [];
                for (let m = Math.ceil(turno.start / gridInterval) * gridInterval; m <= turno.end; m += gridInterval) {
                  if (m > 24*60) continue;
                  const isHour = m % 60 === 0;
                  const pct = ((m - turno.start) / tDur) * 100;
                  if (pct < 0 || pct > 100) continue;
                  const isFirst = pct <= 1;
                  // Ultimo tick (24:00 → "00:00") centrato sul bordo della 2ª banda "Chiuso" (+8px di gap)
                  const isLast = m === 24*60;
                  const tx = 'translateX(-50%)';
                  // Primo tick (19:00) centrato sul bordo della 1ª banda "Chiuso" (−8px di gap griglia)
                  const left = isFirst ? `calc(${pct}% - 8px)` : isLast ? `calc(${pct}% + 8px)` : `${pct}%`;
                  const h = Math.floor(m / 60); const min = m % 60;
                  const label = isLast ? '00:00' : min === 0 ? `${h}:00` : `${String(min).padStart(2,'0')}`;
                  ticks.push(<span key={m} style={{position:'absolute', left,
                    top: isHour ? 2 : 8, fontSize: isHour ? 16 : 13.5,
                    fontWeight: isHour ? 800 : 500, color: isHour ? '#6B7280' : '#B0B7C3',
                    transform:tx, whiteSpace:'nowrap', zIndex:1}}>{label}</span>);
                }
                return ticks;
              })()}
              {nowPctInTurno(cenaExt) !== null && (
                <div style={{position:'absolute', bottom:-5, left:`${nowPctInTurno(cenaExt)}%`,
                  width:8, height:8, borderRadius:'50%', background:'#DC2626', zIndex:4,
                  transform:'translateX(-50%)'}}/>
              )}
            </div>
            {/* Chiuso post-mezzanotte — stessa larghezza del gap pranzo–cena */}
            <div style={{display:'flex', alignItems:'center', justifyContent:'center', height:'100%'}}>
              <span style={{fontSize:13, fontWeight:600, color:'#AEB4BE', letterSpacing:1.2,
                textTransform:'uppercase', whiteSpace:'nowrap'}}>Chiuso</span>
            </div>
          </div>
          </div>{/* fine intestazione turni + righello sticky */}

          {/* Rows */}
          <div style={{padding:'0 18px 12px', position:'relative'}}>
            {/* Linee verticali continue ai bordi delle bande "Chiuso" — solo sulle righe
                (non sul righello), stesso stile delle linee di griglia delle colonne */}
            {(() => {
              const PAD = 18, GAP = 8, LABEL = 90;
              const c1L = PAD + LABEL + GAP + pranzoW + GAP;          // bordo sx Chiuso pranzo–cena
              const c1R = c1L + CLOSED_W;                              // bordo dx
              const c2L = c1R + GAP + cenaW + GAP;                     // bordo sx Chiuso post-cena
              const c2R = c2L + CLOSED_W;                              // bordo dx
              return [c1L, c1R, c2L, c2R].map((x, i) => (
                <div key={`cl-${i}`} style={{
                  position:'absolute', top:0, bottom:0, left:`${x}px`, width:1,
                  background:'#EDEEF2', pointerEvents:'none', zIndex:0,
                }}/>
              ));
            })()}
            {tables.map((t, ti) => (
              <div key={t.id} ref={el => rowRefsMap.current[t.id] = el} style={{
                display:'grid', gridTemplateColumns: dynGrid, gap:8,
            alignItems:'center', padding:'5px 0',
            borderBottom: ti < tables.length-1 ? '1px solid #F0F2F5' : 'none',
            background: ti%2===1 ? '#FAFBFC' : 'transparent',
          }}>
            <div style={{display:'flex', flexDirection:'column', gap:1, paddingRight:8, borderRight:'1px solid #EDEEF2'}}>
              <span style={{fontSize:20, fontWeight:700, color:'#0F1115', lineHeight:1}}>Tavolo {t.id}</span>
              <span style={{fontSize:15, fontWeight:500, color:'#9CA3AF', lineHeight:1}}>{t.p} posti</span>
            </div>
            {renderTurnoTrack(t, TURNI[0])}
            {/* Gap — chiuso: banda incassata quieta tra pranzo e cena */}
            <div style={{height:72, borderRadius:5, background:'#F1F3F6'}}/>
            {renderTurnoTrack(t, cenaExt)}
            {/* Chiuso post-mezzanotte — stessa larghezza del gap pranzo–cena */}
            <div style={{height:72, borderRadius:5, background:'#F1F3F6'}}/>
          </div>
        ))}
      </div>

        </div>{/* fine inner fixed-width */}
      </div>{/* fine wrapper scrollabile */}

      {/* Scrollbar orizzontale custom — sempre visibile, in fondo alla timeline */}
      <div ref={customScrollbarRef} style={{
        position:'relative', height:14,
        background:'#F1F3F5',
        borderTop:'1px solid #E5E7EB',
        userSelect:'none',
      }}>
        <div
          onMouseDown={handleThumbDrag}
          title={hasScrollOverflow ? 'Trascina per scorrere la timeline' : 'Nessun contenuto da scorrere'}
          style={{
            position:'absolute',
            left:`${thumbLPct}%`,
            width:`${Math.max(8, thumbWPct)}%`,
            top:3, bottom:3,
            background: hasScrollOverflow ? '#94A3B8' : '#D1D5DB',
            borderRadius:5,
            cursor: hasScrollOverflow ? 'grab' : 'default',
            transition: hasScrollOverflow ? 'background 0.12s' : 'none',
          }}
          onMouseEnter={e => { if (hasScrollOverflow) e.currentTarget.style.background = '#64748B'; }}
          onMouseLeave={e => { if (hasScrollOverflow) e.currentTarget.style.background = '#94A3B8'; }}
        />
      </div>

      {/* Legenda */}
      <div style={{padding:'10px 18px', borderTop:'1px solid #EDEEF2',
        display:'flex', alignItems:'center', gap:16, flexWrap:'wrap',
        fontSize:15, color:'#6B7280'}}>
        <Legend label="In arrivo" bg="rgba(124, 58, 237, 0.12)" border="rgba(124, 58, 237, 0.38)"/>
        <Legend label="In arrivo da Byup App" bg="#FFECEA" border="#FFA3A6"/>
        <Legend label="Tavolo attivo" bg="#EDF0F4" border="#D2D9E2"/>
        <span style={{flex:1}}/>
        <span style={{fontSize:14.5, color:'#C4C9D4', fontWeight:600}}>Trascina per creare · Clicca per modificare</span>
      </div>

      {/* Popup sovrapposizione */}
      {conflictWarning && (
        <div onClick={() => setConflictWarning(false)} style={{
          position:'fixed', inset:0, background:'rgba(15,17,21,0.45)', zIndex:200,
          display:'grid', placeItems:'center',
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background:'#fff', borderRadius:14, padding:'24px 24px 20px',
            width:320, boxShadow:'0 20px 60px rgba(0,0,0,0.22)',
            display:'flex', flexDirection:'column', gap:14,
          }}>
            <div style={{display:'flex', alignItems:'center', gap:10}}>
              <div style={{width:36, height:36, borderRadius:10, background:'#FEF2F2',
                display:'grid', placeItems:'center', flexShrink:0}}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              </div>
              <div style={{fontSize:19, fontWeight:700, color:'#0F1115', letterSpacing:-0.3}}>
                Sovrapposizione non consentita
              </div>
            </div>
            <div style={{fontSize:17, color:'#6B7280', lineHeight:1.5}}>
              Lo slot si sovrappone a una prenotazione esistente sullo stesso tavolo. La modifica è stata annullata.
            </div>
            <button onClick={() => setConflictWarning(false)} style={{
              padding:'10px 14px', borderRadius:8,
              background: PN.BTN_DARK, color:'#fff',
              border:'1px solid rgba(0,0,0,0.32)',
              fontSize:17, fontWeight:700, cursor:'pointer', fontFamily:'inherit',
              boxShadow: PN.INSET_HIGHLIGHT_DARK,
            }}>Ok, capito</button>
          </div>
        </div>
      )}
    </div>
  );
}

function Legend({ dot, label, bg, border }) {
  return (
    <span style={{display:'inline-flex', alignItems:'center', gap: 5}}>
      <span style={{
        width: 14, height: 10, borderRadius: 2,
        background: bg || dot,
        border: border ? `1px solid ${border}` : 'none',
      }}/>
      <span>{label}</span>
    </span>
  );
}

// ─────────────────────────────────────────────────────────
// DAY · LISTA — timeline verticale a fasce orarie, righe-card in vetro
// (PrenotazioneRow, sala-prenotazione-row.jsx). L'ora corrente è una
// linea coral sottile inserita nel flusso cronologico.
// ─────────────────────────────────────────────────────────
function DayList({ onModifica }) {
  const nowMin = timeToMin(NOW_HHMM);
  const [dismissed, setDismissed] = React.useState(new Set());
  useSalaResVersion();
  const sorted = [...SALA_RES_DATA]
    .filter(r => !dismissed.has(r.id))
    .sort((a,b) => timeToMin(a.time) - timeToMin(b.time));

  const isPastRes = (r) => timeToMin(r.time) + (r.dur || 90) <= nowMin;
  const past = sorted.filter(isPastRes);
  const rest = sorted.filter(r => !isPastRes(r));
  const onDismiss = (id) => setDismissed(s => new Set([...s, id]));

  // Fasce orarie: una banda per ora piena, in ordine cronologico
  const bands = [];
  rest.forEach(r => {
    const h = Math.floor(timeToMin(r.time) / 60);
    let b = bands[bands.length - 1];
    if (!b || b.hour !== h) { b = { hour: h, items: [] }; bands.push(b); }
    b.items.push(r);
  });

  // Flusso: header di fascia + righe; la linea ORA si inserisce prima del
  // primo elemento futuro rispetto a NOW.
  const flow = [];
  let nowInserted = nowMin < (bands[0] ? bands[0].hour * 60 : Infinity) && past.length === 0;
  if (nowInserted) flow.push(<CalNowLine key="now-top" hhmm={NOW_HHMM}/>);
  bands.forEach(b => {
    if (!nowInserted && b.hour * 60 > nowMin) {
      nowInserted = true;
      flow.push(<CalNowLine key={`now-b${b.hour}`} hhmm={NOW_HHMM}/>);
    }
    flow.push(<CalBandHeader key={`h${b.hour}`} hh={`${String(b.hour).padStart(2,'0')}:00`}/>);
    b.items.forEach(r => {
      if (!nowInserted && timeToMin(r.time) > nowMin) {
        nowInserted = true;
        flow.push(<CalNowLine key={`now-${r.id}`} hhmm={NOW_HHMM}/>);
      }
      flow.push(<CalResRow key={r.id} r={r} nowMin={nowMin} onModifica={onModifica} onDismiss={onDismiss}/>);
    });
  });
  if (!nowInserted) flow.push(<CalNowLine key="now-end" hhmm={NOW_HHMM}/>);

  return (
    <div style={{
      position: 'relative', isolation: 'isolate',
      borderRadius: 20,
      padding: '16px 18px 20px',
      border: `1px solid ${PN.BORDER_HAIR}`,
      boxShadow: '0 1px 0 rgba(15,17,21,0.04), 0 6px 20px rgba(15,17,21,0.04)',
      // Mesh atmosferica: il substrato che le righe di vetro rifrangono
      background: `
        radial-gradient(circle at 10% 10%, rgba(242, 107, 122, 0.16), transparent 40%),
        radial-gradient(circle at 85% 6%, rgba(167, 139, 250, 0.13), transparent 36%),
        radial-gradient(circle at 70% 92%, rgba(37, 99, 235, 0.08), transparent 46%),
        radial-gradient(circle at 18% 80%, rgba(251, 146, 60, 0.09), transparent 40%),
        linear-gradient(180deg, #FAF6F4 0%, #F4EFEF 100%)
      `,
      overflow: 'hidden',
    }}>
      {/* Dorsale della timeline */}
      <div style={{position:'absolute', top: 20, bottom: 20, left: 30, width: 1, background:'rgba(15,17,21,0.07)'}}/>

      {past.length > 0 && <CalPastSection items={past} onModifica={onModifica} onDismiss={onDismiss}/>}

      {rest.length === 0 && (
        <div style={{padding:'36px 18px', textAlign:'center', fontSize:16, color:'#9CA3AF', fontWeight:600}}>
          Nessuna prenotazione in programma
        </div>
      )}

      <div style={{display:'flex', flexDirection:'column', gap: 8, position:'relative'}}>
        {flow}
      </div>
    </div>
  );
}

// Header di fascia oraria — dot sulla dorsale + ora + hairline
function CalBandHeader({ hh }) {
  return (
    <div style={{display:'flex', alignItems:'center', gap: 10, padding:'10px 0 2px'}}>
      <span style={{
        width: 9, height: 9, borderRadius:'50%', flexShrink: 0,
        background:'#fff', marginLeft: 8,
        boxShadow:'inset 0 0 0 2px rgba(15,17,21,0.22)',
      }}/>
      <span style={{fontSize: 14, fontWeight: 800, color:'#6B7280', fontVariantNumeric:'tabular-nums', letterSpacing:'0.02em'}}>{hh}</span>
      <span style={{flex: 1, height: 1, background:'rgba(15,17,21,0.06)'}}/>
    </div>
  );
}

// Linea ORA — coral, sottile
function CalNowLine({ hhmm }) {
  return (
    <div style={{display:'flex', alignItems:'center', gap: 8, padding:'2px 0'}}>
      <span style={{
        display:'inline-flex', alignItems:'center', gap: 5,
        padding:'2px 9px', borderRadius: 999, flexShrink: 0,
        background:'rgba(255, 90, 95, 0.12)',
        boxShadow:'inset 0 0 0 1px rgba(255, 90, 95, 0.45)',
        color:'#E32459', fontSize: 12.5, fontWeight: 800, letterSpacing:'0.06em',
      }}>
        <span style={{width: 5, height: 5, borderRadius:'50%', background:'#FF5A5F'}}/>
        ORA · {hhmm}
      </span>
      <span style={{flex: 1, height: 1.5, borderRadius: 1, background:'linear-gradient(90deg, rgba(255,90,95,0.65), rgba(255,90,95,0.10))'}}/>
    </div>
  );
}

// Riga prenotazione nel flusso — PrenotazioneRow glass + azione cancella
function CalResRow({ r, nowMin, dim, onModifica, onDismiss }) {
  const [cancelConfirm, setCancelConfirm] = React.useState(false);
  const ghost = r.status === 'noshow' || r.status === 'cancellata';
  const minTo = timeToMin(r.time) - (nowMin != null ? nowMin : 0);
  const urgent = !dim && !ghost && minTo >= 0 && minTo <= 30 && (r.status === 'inattesa' || r.status === 'confermata');
  return (
    <div style={{marginLeft: 28, position:'relative'}}>
      <PrenotazioneRow r={r} urgent={urgent}
        onClick={!dim && !ghost && onModifica ? () => onModifica(r) : undefined}
        style={dim ? {opacity: 0.55} : undefined}
      >
        {!dim && !ghost && (
          <button title="Cancella prenotazione"
            onClick={e => { e.stopPropagation(); setCancelConfirm(true); }}
            style={{
              width: 26, height: 26, borderRadius: 8, flexShrink: 0,
              background:'transparent', border:'1px solid rgba(15,17,21,0.08)',
              color:'#B6BCC6', cursor:'pointer', fontFamily:'inherit',
              display:'grid', placeItems:'center',
              transition:'color 150ms, border-color 150ms, background 150ms',
            }}
            onMouseEnter={e => { e.currentTarget.style.background='rgba(220,38,38,0.08)'; e.currentTarget.style.borderColor='rgba(220,38,38,0.35)'; e.currentTarget.style.color='#DC2626'; }}
            onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.borderColor='rgba(15,17,21,0.08)'; e.currentTarget.style.color='#B6BCC6'; }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/>
            </svg>
          </button>
        )}
      </PrenotazioneRow>

      {cancelConfirm && (
        <div onClick={() => setCancelConfirm(false)} style={{
          position:'fixed', inset:0, background:'rgba(15,17,21,0.42)', zIndex:100,
          backdropFilter:'blur(8px)', WebkitBackdropFilter:'blur(8px)',
          display:'grid', placeItems:'center',
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            ...PN.GLASS_STRONG,
            borderRadius: 20, padding:'24px 24px 20px',
            width: 330,
            display:'flex', flexDirection:'column', gap: 16,
          }}>
            <div style={{fontSize: 19, fontWeight: 700, color:'#0F1115', letterSpacing:-0.3}}>
              Cancellare la prenotazione?
            </div>
            <div style={{fontSize: 16, color:'#6B7280', lineHeight: 1.5}}>
              <strong style={{color:'#0F1115'}}>{r.name}</strong> · {r.time} · T{r.table}<br/>
              L'operazione non può essere annullata.
            </div>
            <div style={{display:'flex', gap: 8}}>
              <button onClick={() => setCancelConfirm(false)} style={{
                flex: 1, padding:'10px 14px', borderRadius: 10,
                background:'rgba(255,255,255,0.75)', color:'#0F1115',
                border:'1px solid rgba(15,17,21,0.10)',
                fontSize: 16, fontWeight: 700, cursor:'pointer', fontFamily:'inherit',
              }}>Indietro</button>
              <button onClick={() => { setCancelConfirm(false); onDismiss && onDismiss(r.id); }} style={{
                flex: 1, padding:'10px 14px', borderRadius: 10,
                background:'linear-gradient(180deg, #DC2626 0%, #B91C1C 100%)', color:'#fff',
                border:'1px solid rgba(124,14,14,0.40)',
                boxShadow:'inset 0 1px 0 rgba(255,255,255,0.30)',
                fontSize: 16, fontWeight: 700, cursor:'pointer', fontFamily:'inherit',
              }}>Cancella</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Sezione "Passate" — collassabile, righe ghost
function CalPastSection({ items, onModifica, onDismiss }) {
  const [open, setOpen] = React.useState(false);
  const servite = items.filter(r => r.status === 'arrivata').length;
  const noshow  = items.filter(r => r.status === 'noshow').length;
  return (
    <div style={{marginBottom: 10, marginLeft: 28}}>
      <button onClick={() => setOpen(o => !o)} style={{
        width:'100%', display:'flex', alignItems:'center', gap: 8,
        padding:'8px 12px', borderRadius: 12,
        backgroundColor:'rgba(255,255,255,0.42)',
        backdropFilter:'blur(12px) saturate(140%)',
        WebkitBackdropFilter:'blur(12px) saturate(140%)',
        border:'1px solid rgba(255,255,255,0.65)',
        cursor:'pointer', fontFamily:'inherit', textAlign:'left',
      }}>
        <span style={{fontSize: 13, fontWeight: 700, color:'#9CA3AF', letterSpacing: 0.5, textTransform:'uppercase'}}>Passate</span>
        <span style={{fontSize: 14, color:'#B6BCC6', fontWeight: 600}}>
          · {servite} servite{noshow > 0 ? ` · ${noshow} no-show` : ''}
        </span>
        <span style={{flex: 1}}/>
        <span style={{fontSize: 15, color:'#B6BCC6', transform: open ? 'rotate(90deg)' : 'none', transition:'transform 0.15s'}}>›</span>
      </button>
      {open && (
        <div style={{display:'flex', flexDirection:'column', gap: 8, marginTop: 8, marginLeft: -28}}>
          {items.map(r => <CalResRow key={r.id} r={r} dim onModifica={onModifica} onDismiss={onDismiss}/>)}
        </div>
      )}
    </div>
  );
}

window.SalaCalendario = SalaCalendario;
window.SALA_RES_DATA_GLOBAL = SALA_RES_DATA;
