// Sala v3 — Calendario prenotazioni: vista unificata
// Scala (Giorno/Settimana) × View mode (Timeline/Lista/Heatmap) + KPI bar + Cerca slot popover
// Sostituisce le 3 tab (Agenda / Disponibilità / Settimana) con una sola pagina

const SALA_V3_RES_DATA = (() => {
  const data = [
    // Pranzo
    {id:'r1', time:'12:30', dur:90, name:'Famiglia Ferri', posti:4, table:5, status:'arrivata', phone:'+39 348 ...', note:null, source:'byup'},
    {id:'r2', time:'13:00', dur:75, name:'Martina Ciani', posti:2, table:3, status:'arrivata', phone:'+39 333 ...', note:{type:'allergia', text:'Allergia noci'}, source:'tel'},
    {id:'r3', time:'13:15', dur:90, name:'Luca Bianchi', posti:3, table:7, status:'arrivata', phone:'+39 339 ...', note:null, source:'walkin'},
    {id:'r4', time:'13:30', dur:60, name:'Pranzo aziendale', posti:6, table:11, status:'noshow', phone:'+39 02 ...', note:null, source:'tel'},
    {id:'r4b', time:'13:45', dur:75, name:'Coppia Rossi', posti:2, table:6, status:'arrivata', phone:'+39 333 ...', note:null, source:'byup'},
    {id:'r4c', time:'14:00', dur:60, name:'Pellegrini', posti:3, table:9, status:'arrivata', phone:'+39 348 ...', note:null, source:'byup'},
    // Cena
    {id:'r5', time:'19:30', dur:90, name:'Andrea Bianchi', posti:2, table:3, status:'confermata', phone:'+39 339 12 34 567', note:{type:'allergia', text:'Intolleranza glutine'}, source:'byup'},
    {id:'r6', time:'20:00', dur:120, name:'Famiglia Rossi', posti:4, table:7, status:'confermata', phone:'+39 348 22 33 444', note:{type:'allergia', text:'Allergia glutine'}, source:'byup'},
    {id:'r8', time:'20:30', dur:150, name:'Tavolata Neri', posti:8, table:1, status:'inattesa', phone:'+39 320 99 88 777', note:{type:'compleanno', text:'Candelina al dolce'}, source:'byup'},
    {id:'r9', time:'20:45', dur:90, name:'Romano', posti:3, table:3, status:'confermata', phone:'+39 347 ...', note:{type:'allergia', text:'Allergia frutta secca'}, source:'tel'},
    {id:'r10', time:'21:00', dur:120, name:'De Luca', posti:3, table:9, status:'confermata', phone:'+39 349 22 33 111', note:{type:'anniversario', text:'25 anni di matrimonio'}, source:'byup'},
    {id:'r11', time:'21:00', dur:90, name:'Greco', posti:2, table:5, status:'confermata', phone:'+39 333 88 77 666', note:{type:'anniversario', text:'Tavolo romantico'}, source:'tel'},
    {id:'r12', time:'21:15', dur:120, name:'Marini', posti:4, table:12, status:'confermata', phone:'+39 348 ...', note:{type:'aziendale', text:'Cliente VIP'}, source:'tel'},
    {id:'r13', time:'21:30', dur:120, name:'Famiglia Verdi', posti:5, table:11, status:'confermata', phone:'+39 320 ...', note:{type:'bambini', text:'2 bambini'}, source:'byup'},
    {id:'r14', time:'21:30', dur:90, name:'Costa', posti:2, table:6, status:'inattesa', phone:'+39 339 ...', note:null, source:'walkin'},
    {id:'r15', time:'22:00', dur:90, name:'Russo', posti:4, table:9, status:'confermata', phone:'+39 347 ...', note:{type:'bambini', text:'2 seggioloni'}, source:'tel'},
    {id:'r16', time:'22:30', dur:90, name:'Esposito', posti:4, table:3, status:'confermata', phone:'+39 348 ...', note:{type:'compleanno', text:'Torta da portare'}, source:'byup'},
    // Sala piena alle 20:00
    {id:'r18', time:'20:00', dur:120, name:'Fontana', posti:4, table:2, status:'confermata', phone:'+39 333 ...', note:null, source:'byup'},
    {id:'r19', time:'20:00', dur:120, name:'Serra', posti:2, table:4, status:'confermata', phone:'+39 347 ...', note:null, source:'tel'},
    {id:'r20', time:'19:45', dur:120, name:'Cattaneo', posti:4, table:9, status:'confermata', phone:'+39 339 ...', note:null, source:'byup'},
    {id:'r17', time:'22:30', dur:60, name:'Conti', posti:2, table:4, status:'cancellata', phone:'+39 333 ...', note:null, source:'tel'},
    // Turnover: tavolo 5 occupato a pranzo → prenotato a cena
    {id:'r21', time:'19:45', dur:90, name:'Pellegrini', posti:4, table:5, status:'confermata', phone:'+39 347 ...', note:null, source:'byup'},
    // Turnover: tavolo 6 occupato a pranzo → prenotato a cena
    {id:'r22', time:'20:30', dur:90, name:'Mancini', posti:2, table:6, status:'confermata', phone:'+39 333 ...', note:null, source:'tel'},
    // Tavoli uniti: "Tavolata Neri" occupa tavoli 1 + 8 (uniti)
    {id:'r8b', time:'20:30', dur:150, name:'Tavolata Neri', posti:8, table:8, status:'inattesa', phone:'+39 320 99 88 777', note:{type:'compleanno', text:'Compleanno · candelina'}, source:'byup'},
    // Tav. 8 prenotato a pranzo dalle 12:00
    {id:'r24', time:'12:00', dur:90, name:'Esposito', posti:2, table:8, status:'confermata', phone:'+39 347 ...', note:null, source:'tel'},
    // Cluster imminenti 12:00 – 12:30
    {id:'r25', time:'12:00', dur:90,  name:'Borrelli',       posti:3, table:2,    status:'confermata', phone:'+39 345 ...', note:null, source:'tel'},
    {id:'r26', time:'12:00', dur:75,  name:'Mele',           posti:2, table:4,    status:'inattesa',   phone:'+39 347 ...', note:null, source:'byup'},
    {id:'r27', time:'12:15', dur:90,  name:'Gallo azienda',  posti:6, table:11,   status:'confermata', phone:'+39 02 ...',  note:{type:'aziendale', text:'Menù fisso'}, source:'tel'},
    {id:'r28', time:'12:30', dur:90,  name:'Caruso',         posti:2, table:6,    status:'confermata', phone:'+39 340 ...', note:null, source:'byup'},
    {id:'r29', time:'12:30', dur:120, name:'Pellegrini', posti:4, table:12,   status:'confermata', phone:'+39 333 ...', note:{type:'allergia', text:'Allergia lattosio'}, source:'tel'},
  ];
  return data;
})();

const NOW_HHMM = '12:00';
const ALL_TABLES = [{id:1,p:8},{id:2,p:4},{id:3,p:2},{id:4,p:2},{id:5,p:4},{id:6,p:2},{id:7,p:6},{id:8,p:2},{id:9,p:4},{id:11,p:6},{id:12,p:4}];

function timeToMin(t) { const [h,m] = t.split(':').map(Number); return h*60+m; }

const RES_STATUS_META = {
  confermata: { label:'Confermata', color:'#0F1115', dot:'#0F1115' },
  inattesa:   { label:'In attesa', color:'#A16207', dot:'#D97706' },
  arrivata:   { label:'Arrivati', color:'#15803D', dot:'#16A34A' },
  noshow:     { label:'No-show', color:'#6B7280', dot:'#9CA3AF' },
  cancellata: { label:'Cancellata', color:'#9CA3AF', dot:'#D1D5DB' },
};

// ─────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────
function SalaV3Calendario({ tweaks, onNuova, onModifica }) {
  const [dayView, setDayView] = React.useState('timeline'); // timeline | lista

  return (
    <div style={{display:'flex', flexDirection:'column', gap: 14, minWidth: 0, position:'relative'}}>
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
const TOOLBAR_DATES = ['Sab 6','Dom 7','Lun 8','Mar 9','Mer 10','Gio 11','Ven 12','Sab 13','Dom 14'];
const TOOLBAR_TODAY_IDX = 3;

function Toolbar({ dayView, setDayView, onNuova }) {
  const [dayOffset, setDayOffset] = React.useState(0);
  const [fading, setFading] = React.useState(false);

  const idx = Math.max(0, Math.min(TOOLBAR_DATES.length - 1, TOOLBAR_TODAY_IDX + dayOffset));
  const isToday = dayOffset === 0;

  function navigate(dir) {
    const next = idx + dir;
    if (next < 0 || next >= TOOLBAR_DATES.length) return;
    setFading(true);
    setTimeout(() => { setDayOffset(o => o + dir); setFading(false); }, 100);
  }

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

      {/* Destra: navigatore data animato + prenota */}
      <div style={{display:'flex', alignItems:'center', gap: 4}}>
        <NavBtn onClick={() => navigate(-1)} disabled={idx === 0}>‹</NavBtn>
        <div style={{
          padding:'7px 14px', borderRadius: 7, minWidth: 128, textAlign:'center',
          fontSize: 12.5, fontWeight: 700, color:'#0F1115',
          background: PN.WHITE_HUSH, whiteSpace:'nowrap',
          border: `1px solid ${PN.BORDER_HAIR}`,
          boxShadow: 'inset 0 1px 1px rgba(15,17,21,0.04)',
          opacity: fading ? 0 : 1, transition:'opacity 0.1s',
        }}>
          {isToday ? 'Oggi · ' : ''}{TOOLBAR_DATES[idx]} dic
        </div>
        <NavBtn onClick={() => navigate(1)} disabled={idx === TOOLBAR_DATES.length - 1}>›</NavBtn>
      </div>

      <button onClick={onNuova} style={{
        padding:'9px 14px', borderRadius: 8,
        background: PN.BTN_BRAND, color:'#fff',
        border:'1px solid rgba(180,30,35,0.40)',
        fontSize: 13, fontWeight: 700, cursor:'pointer', fontFamily:'inherit',
        display:'inline-flex', alignItems:'center', gap: 6, whiteSpace:'nowrap',
        boxShadow: `${PN.INSET_HIGHLIGHT_BRAND}, 0 1px 3px rgba(255,90,95,0.28)`,
        transition:'background 150ms ease-out',
      }}
        onMouseEnter={e => { e.currentTarget.style.background = PN.BTN_BRAND_HOVER; }}
        onMouseLeave={e => { e.currentTarget.style.background = PN.BTN_BRAND; }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14 M5 12h14"/>
        </svg>
        Prenota
      </button>
    </div>
  );
}

function Segmented({ value, onChange, options, small }) {
  return (
    <div style={{
      display:'inline-flex', background: PN.WHITE_FROST, borderRadius: 9, padding: 3,
      boxShadow: 'inset 0 1px 1px rgba(15,17,21,0.04)',
    }}>
      {options.map(o => (
        <button key={o.id} onClick={()=>onChange(o.id)} style={{
          padding: small ? '6px 11px' : '7px 13px', borderRadius: 7,
          background: value === o.id ? '#fff' : 'transparent',
          border:'none', cursor:'pointer', fontFamily:'inherit',
          fontSize: small ? 12 : 12.5, fontWeight: value === o.id ? 700 : 600,
          color: value === o.id ? '#0F1115' : '#6B7280',
          boxShadow: value === o.id ? '0 1px 0 rgba(255,255,255,0.6) inset, 0 1px 2px rgba(15,17,21,0.08)' : 'none',
          whiteSpace:'nowrap', transition:'all 0.12s',
        }}>{o.label}</button>
      ))}
    </div>
  );
}

function NavBtn({ children, onClick, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width: 28, height: 28, borderRadius: 7,
      background: disabled ? PN.WHITE_HUSH : PN.BTN_NEUTRAL,
      border: `1px solid ${disabled ? PN.BORDER_HAIR : PN.BORDER_LIGHT}`,
      cursor: disabled ? 'default' : 'pointer',
      fontFamily:'inherit', fontSize: 13,
      color: disabled ? '#D1D5DB' : '#6B7280',
      boxShadow: disabled ? 'none' : `${PN.INSET_HIGHLIGHT}, 0 1px 2px rgba(15,17,21,0.04)`,
    }}>{children}</button>
  );
}

// ─────────────────────────────────────────────────────────
// KPI BAR
// ─────────────────────────────────────────────────────────
function computeKpiGiorno() {
  const valid = SALA_V3_RES_DATA.filter(r => r.status !== 'cancellata' && r.status !== 'noshow');
  const coperti = valid.reduce((s,r)=>s+r.posti, 0);
  const tavoliUsati = new Set(valid.filter(r=>r.table).map(r=>r.table)).size;
  const turnover = (valid.length / Math.max(tavoliUsati, 1)).toFixed(1);
  const copertura = Math.round((tavoliUsati / ALL_TABLES.length) * 100);
  const tempoMedio = Math.round(valid.reduce((s,r)=>s+r.dur,0) / Math.max(valid.length,1));
  return { count: valid.length, coperti, turnover, copertura, tempoMedio };
}

function KpiBar({ scala }) {
  if (scala === 'giorno') {
    const k = computeKpiGiorno();
    return (
      <div style={{
        display:'flex', alignItems:'baseline', gap: 28,
        padding:'14px 18px', borderRadius: 12,
        background:'#fff', border:'1px solid #E5E7EB',
        flexWrap:'wrap',
      }}>
        <Kpi big label="Prenotazioni" value={k.count}/>
        <Kpi label="Coperti" value={k.coperti}/>
        <Kpi label="Turnover" value={`${k.turnover}×`} hint={`prenot/tavolo`} accent="#E04347"/>
        <Kpi label="Copertura tavoli" value={`${k.copertura}%`}/>
        <Kpi label="Tempo medio" value={`${Math.floor(k.tempoMedio/60)}h ${k.tempoMedio%60}'`}/>
      </div>
    );
  }
  // settimana
  return (
    <div style={{
      display:'flex', alignItems:'baseline', gap: 28,
      padding:'14px 18px', borderRadius: 12,
      background:'#fff', border:'1px solid #E5E7EB',
      flexWrap:'wrap',
    }}>
      <Kpi big label="Prenotazioni" value={180}/>
      <Kpi label="Coperti" value={612}/>
      <Kpi label="Turnover medio" value="2.1×" accent="#E04347"/>
      <Kpi label="Riempimento" value="78%"/>
      <Kpi label="Picco" value="Sab 20:00"/>
    </div>
  );
}

function Kpi({ label, value, big, hint, accent }) {
  return (
    <div style={{whiteSpace:'nowrap'}}>
      <div style={{fontSize: 10, color:'#6B7280', fontWeight: 700, letterSpacing: 0.4, textTransform:'uppercase'}}>{label}</div>
      <div style={{
        fontSize: big ? 24 : 18, fontWeight: 700,
        color: accent || '#0F1115', letterSpacing:-0.4, lineHeight: 1.1, marginTop: 2,
      }}>{value}{hint && <span style={{fontSize: 10, fontWeight: 600, color:'#9CA3AF', marginLeft: 6}}>{hint}</span>}</div>
    </div>
  );
}

function HistBar({ f, N_TAVOLI }) {
  const [hov, setHov] = React.useState(false);
  const load = f.occ / N_TAVOLI;
  const barH = f.occ > 0 ? Math.max(load * 78, 3) : 0;
  return (
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{flex:1, height:`${barH}%`, alignSelf:'flex-end', cursor:'default', position:'relative', minHeight: f.occ>0?3:0}}>
      <div style={{
        position:'absolute', inset:0,
        background: hov ? '#0F1115' : '#CBD5E1',
        borderRadius:'2px 2px 0 0', transition:'background 0.1s',
      }}/>
      {f.occ > 0 && (
        <span style={{
          position:'absolute', bottom:'100%', left:'50%', transform:'translateX(-50%)',
          fontSize:8.5, fontWeight:700, color: hov?'#0F1115':'#94A3B8',
          lineHeight:1, marginBottom:1, pointerEvents:'none', whiteSpace:'nowrap',
        }}>{f.occ}</span>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// DAY · TIMELINE — table × time grid (mostra il turnover visivamente)
// ─────────────────────────────────────────────────────────
function DayTimeline({ onNuova, onModifica }) {
  const tables = ALL_TABLES;
  const startMin = 12 * 60;
  const endMin = 23 * 60 + 30;
  const totalMin = endMin - startMin;
  const hours = []; for (let h = 12; h <= 23; h++) hours.push(h);

  const valid = SALA_V3_RES_DATA.filter(r => r.status !== 'cancellata' && r.status !== 'noshow' && r.table);
  const nowMin = timeToMin(NOW_HHMM);
  const nowPct = ((nowMin - startMin) / totalMin) * 100;

  const [histCollapsed, setHistCollapsed] = React.useState(false);
  const trackRef = React.useRef(null);
  const dragRef  = React.useRef(null);
  const [drag, setDrag] = React.useState(null);

  function handleTrackMouseDown(e, table) {
    e.preventDefault();
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const min = Math.round((startMin + pct * totalMin) / 15) * 15;

    const tableRes = valid.filter(r => r.table === table.id);
    const onExisting = tableRes.some(r => { const s = timeToMin(r.time); return min >= s && min < s + r.dur; });
    if (onExisting) return;

    const nextStart = tableRes
      .map(r => timeToMin(r.time)).filter(s => s > min).sort((a,b) => a-b)[0] ?? endMin;
    const d = { tableId: table.id, tablePosts: table.p, startMin: min, curMin: Math.min(min + 90, nextStart), maxMin: nextStart };
    dragRef.current = d;
    setDrag({ ...d });
  }

  React.useEffect(() => {
    const onMove = (e) => {
      if (!dragRef.current || !trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const min = Math.round((startMin + pct * totalMin) / 15) * 15;
      const newCurMin = Math.max(dragRef.current.startMin + 30, Math.min(min, dragRef.current.maxMin));
      dragRef.current = { ...dragRef.current, curMin: newCurMin };
      setDrag({ ...dragRef.current });
    };
    const onUp = () => {
      const d = dragRef.current;
      if (!d) return;
      dragRef.current = null;
      setDrag(null);
      const dur = Math.max(30, d.curMin - d.startMin);
      const hh = String(Math.floor(d.startMin / 60)).padStart(2, '0');
      const mm = String(d.startMin % 60).padStart(2, '0');
      if (onNuova) onNuova({ time: `${hh}:${mm}`, dur, tableId: d.tableId, coperti: d.tablePosts });
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, []);

  // Tavoli occupati per fascia 30' — overlap-based
  const N_TAVOLI = ALL_TABLES.length;
  const fasceStep = 30;
  const fasce = [];
  for (let m = startMin; m < endMin; m += fasceStep) {
    const occ = new Set(SALA_V3_RES_DATA
      .filter(r => r.status !== 'cancellata' && r.status !== 'noshow' && r.table)
      .filter(r => { const rs = timeToMin(r.time); return rs < m + fasceStep && rs + (r.dur||90) > m; })
      .map(r => r.table)).size;
    fasce.push({ time: m, occ });
  }
  const piccoFascia = fasce.reduce((b,f) => f.occ > b.occ ? f : b, {occ:0, time:startMin});
  const toHHMM = m => `${Math.floor(m/60).toString().padStart(2,'0')}:${(m%60).toString().padStart(2,'0')}`;

  return (
    <div style={{
      background:'#fff', borderRadius: 14, border:`1px solid ${PN.BORDER_HAIR}`,
      boxShadow: '0 1px 0 rgba(15,17,21,0.04), 0 6px 18px rgba(15,17,21,0.04)',
      overflow:'hidden',
    }}>
      {/* Header con istogramma fasce — collassabile */}
      <div style={{borderBottom:'1px solid #F0F2F5'}}>
            <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 18px 12px'}}>
              <button onClick={()=>setHistCollapsed(c=>!c)} style={{
                display:'flex', alignItems:'baseline', gap:8,
                background:'none', border:'none', cursor:'pointer', fontFamily:'inherit', padding:0,
              }}>
                <span style={{fontSize:12, fontWeight:700, color:'#0F1115'}}>Tavoli occupati per fascia oraria</span>
                <span style={{fontSize:10.5, color:'#9CA3AF', fontWeight:600}}>· 30 min</span>
                <span style={{fontSize:10, color:'#C4C9D4', marginLeft:2, display:'inline-block', transform: histCollapsed ? 'rotate(-90deg)' : 'none', transition:'transform 0.15s'}}>▾</span>
              </button>
              <div style={{display:'flex', alignItems:'center', gap:10}}>
                {piccoFascia.occ > 0 && (
                  <span style={{fontSize:11, fontWeight:600, color:'#6B7280'}}>
                    Picco di <span style={{color:'#0F1115', fontWeight:700}}>{piccoFascia.occ} tavoli prenotati</span>
                    {' '}alle {toHHMM(piccoFascia.time)}
                  </span>
                )}
              </div>
            </div>
            {!histCollapsed && (
              <div style={{padding:'0 18px 14px'}}>
                <div style={{display:'grid', gridTemplateColumns:'90px 1fr', gap:8}}>
                  <div/>
                  <div style={{display:'flex', alignItems:'flex-end', gap:1, height:72, position:'relative'}}>
                    <div style={{position:'absolute', left:0, right:0, top:0, borderTop:'1px dashed #E5E7EB', pointerEvents:'none'}}/>
                    <div style={{position:'absolute', left:0, right:0, top:'50%', borderTop:'1px dashed #F3F4F6', pointerEvents:'none'}}/>
                    {fasce.map((f,i) => <HistBar key={i} f={f} N_TAVOLI={N_TAVOLI}/>)}
                  </div>
                </div>
              </div>
            )}
      </div>

      {/* Hour ruler */}
      <div style={{
        display:'grid', gridTemplateColumns:'90px 1fr', gap: 8,
        padding:'8px 18px 6px',
        position:'sticky', top: 0, background:'#0F1115', zIndex: 2,
      }}>
        <div/>
        <div ref={trackRef} style={{position:'relative', height: 24}}>
          {hours.map(h => {
            const pct = ((h*60 - startMin) / totalMin) * 100;
            return (
              <span key={h} style={{
                position:'absolute', left: `${pct}%`, top: 2,
                fontSize: 12, fontWeight: 700, color:'rgba(255,255,255,0.75)',
                fontVariantNumeric:'tabular-nums',
                transform:'translateX(-50%)', whiteSpace:'nowrap',
              }}>{h}:00</span>
            );
          })}
          {/* Dot ora corrente nel ruler */}
          {nowPct >= 0 && nowPct <= 100 && (
            <div style={{
              position:'absolute', bottom: -5, left:`${nowPct}%`,
              width:8, height:8, borderRadius:'50%',
              background:'#DC2626', zIndex:4,
              transform:'translateX(-50%)',
            }}/>
          )}
        </div>
      </div>

      {/* Rows */}
      <div style={{padding:'0 18px 12px'}}>
        {tables.map((t, ti) => {
          const reservations = valid.filter(r => r.table === t.id).sort((a,b)=>timeToMin(a.time)-timeToMin(b.time));
          return (
            <div key={t.id} style={{
              display:'grid', gridTemplateColumns:'90px 1fr', gap: 8,
              alignItems:'center',
              padding:'5px 0',
              borderBottom: ti < tables.length - 1 ? '1px solid #F0F2F5' : 'none',
              background: ti % 2 === 1 ? '#FAFBFC' : 'transparent',
            }}>
              <div style={{display:'flex', flexDirection:'column', gap: 1, paddingRight: 8, borderRight:'1px solid #EDEEF2'}}>
                <span style={{fontSize: 16, fontWeight: 700, color:'#0F1115', lineHeight:1}}>Tav. {t.id}</span>
                <span style={{fontSize: 11, fontWeight: 500, color:'#9CA3AF', lineHeight:1}}>{t.p} posti</span>
              </div>
              <div
                onMouseDown={(e) => handleTrackMouseDown(e, t)}
                style={{
                  position:'relative', height: 48,
                  background:'repeating-linear-gradient(to right, transparent 0, transparent calc(100%/11.5 - 1px), #EDEEF2 calc(100%/11.5 - 1px), #EDEEF2 calc(100%/11.5))',
                  cursor: drag ? 'col-resize' : 'crosshair',
                  userSelect: 'none',
                }}
              >
                {/* Past zone */}
                {nowPct > 0 && (
                  <div style={{
                    position:'absolute', top:0, bottom:0, left:0,
                    width:`${Math.min(nowPct,100)}%`,
                    background:'rgba(0,0,0,0.028)',
                    pointerEvents:'none', zIndex:1,
                  }}/>
                )}
                {/* Now line per oggi */}
                {nowPct >= 0 && nowPct <= 100 && (
                  <div style={{
                    position:'absolute', top: -6, bottom: -6,
                    left: `${nowPct}%`, width: 2.5,
                    background:'#DC2626', zIndex: 3,
                  }}/>
                )}
                {/* Ghost drag block */}
                {drag && drag.tableId === t.id && (() => {
                  const ghostLeft = ((drag.startMin - startMin) / totalMin) * 100;
                  const ghostWidth = Math.max(((drag.curMin - drag.startMin) / totalMin) * 100, 1);
                  const dur = drag.curMin - drag.startMin;
                  const hh = String(Math.floor(drag.startMin / 60)).padStart(2, '0');
                  const mm = String(drag.startMin % 60).padStart(2, '0');
                  const durLabel = dur >= 60
                    ? `${Math.floor(dur/60)}h${dur%60>0?` ${dur%60}'`:''}`
                    : `${dur}'`;
                  return (
                    <div key="ghost" style={{
                      position:'absolute', left:`${ghostLeft}%`, width:`${ghostWidth}%`,
                      top:5, bottom:5, pointerEvents:'none', zIndex:10,
                      background:'rgba(124,58,237,0.09)',
                      border:'2px dashed #7C3AED',
                      borderRadius:7,
                      display:'flex', alignItems:'center', padding:'0 6px',
                      fontSize:10.5, fontWeight:700, color:'#7C3AED',
                      overflow:'hidden', whiteSpace:'nowrap',
                    }}>{hh}:{mm} · {durLabel}</div>
                  );
                })()}
                {reservations.map(r => {
                  const sMin = timeToMin(r.time);
                  const isOccupato = r.status === 'arrivata';
                  const visualStart = isOccupato ? Math.min(sMin, nowMin) : sMin;
                  const slotEnd = sMin + r.dur;
                  const left = ((visualStart - startMin) / totalMin) * 100;
                  const width = ((slotEnd - visualStart) / totalMin) * 100;
                  const showLabel = (slotEnd - visualStart) >= 30;
                  const meta = RES_STATUS_META[r.status];
                  const past = slotEnd < nowMin;
                  return (
                    <div key={r.id} title={`${r.time} · ${r.name} · ${r.posti}p · ${r.dur}min`}
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={!isOccupato && onModifica ? () => onModifica(r) : undefined}
                      style={{
                      position:'absolute', left: `${left}%`, width: `${width}%`,
                      top: 5, bottom: 5,
                      background: r.status === 'arrivata' ? '#1E40AF' : '#6D28D9',
                      backgroundImage: 'linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 60%)',
                      color: '#FFFFFF',
                      border: r.status === 'arrivata' ? '1px solid #172E75' : '1px solid #4C1D95',
                      borderRadius: 7,
                      padding: showLabel ? '0 7px' : '0',
                      fontSize: 11, fontWeight: 700,
                      display:'flex', alignItems:'center', gap: 4,
                      overflow:'hidden', whiteSpace:'nowrap',
                      opacity: past ? 0.5 : 1,
                      cursor: isOccupato ? 'default' : 'pointer',
                      zIndex: 2,
                      boxShadow: past ? 'none' : '0 1px 2px rgba(15,17,21,0.06)',
                      transition: 'box-shadow 150ms ease-out, transform 150ms ease-out',
                    }}
                      onMouseEnter={e => { if (!isOccupato) { e.currentTarget.style.boxShadow = '0 3px 8px rgba(15,17,21,0.12)'; } }}
                      onMouseLeave={e => { e.currentTarget.style.boxShadow = past ? 'none' : '0 1px 2px rgba(15,17,21,0.06)'; }}>
                      {showLabel && (
                        <span style={{overflow:'hidden', textOverflow:'ellipsis', flex:1, minWidth:0}}>
                          {isOccupato ? 'Occupato' : r.name || r.time}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legenda */}
      <div style={{
        padding:'10px 18px', borderTop:'1px solid #EDEEF2',
        display:'flex', alignItems:'center', gap: 16, flexWrap:'wrap',
        fontSize: 11, color:'#6B7280',
      }}>
        <Legend dot="#6D28D9" label="Prenotato" bg="#6D28D9" border="#4C1D95"/>
        <Legend dot="#1E40AF" label="Occupato" bg="#1E40AF" border="#172E75"/>
        <span style={{flex:1}}/>
        <span style={{fontSize:10.5, color:'#C4C9D4', fontWeight:600}}>Trascina per creare · Clicca per modificare</span>
      </div>
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
// DAY · LISTA (cronologica densa)
// ─────────────────────────────────────────────────────────
function DayList({ onModifica }) {
  const nowMin = timeToMin(NOW_HHMM);
  const [dismissed, setDismissed] = React.useState(new Set());
  const sorted = [...SALA_V3_RES_DATA]
    .filter(r => r.status !== 'cancellata' && r.status !== 'noshow' && !dismissed.has(r.id))
    .sort((a,b) => timeToMin(a.time) - timeToMin(b.time));

  const past       = sorted.filter(r => timeToMin(r.time) + (r.dur || 90) <= nowMin);
  const upcoming   = sorted.filter(r => timeToMin(r.time) + (r.dur || 90) > nowMin);
  const imminenti  = upcoming.filter(r => timeToMin(r.time) - nowMin <= 30);
  const dopo       = upcoming.filter(r => timeToMin(r.time) - nowMin > 30);

  const firstSlot  = upcoming.length > 0 ? Math.floor(timeToMin(upcoming[0].time) / 30) * 30 : null;

  return (
    <div style={{
      background:'#fff', borderRadius:14, border:`1px solid ${PN.BORDER_HAIR}`,
      boxShadow: '0 1px 0 rgba(15,17,21,0.04), 0 6px 18px rgba(15,17,21,0.04)',
      overflow:'hidden',
    }}>
      {past.length > 0 && <PastSection items={past} nowMin={nowMin} onModifica={onModifica} onNoShow={id => setDismissed(s => new Set([...s, id]))}/>}

      {/* ORA marker */}
      <div style={{
        display:'flex', alignItems:'center', gap:8,
        padding:'6px 18px', background:'#FEF2F2',
        borderTop:'2px solid #DC2626', borderBottom:'2px solid #DC2626',
      }}>
        <div style={{width:7, height:7, borderRadius:'50%', background:'#DC2626', flexShrink:0}}/>
        <span style={{fontSize:13, fontWeight:700, color:'#DC2626', letterSpacing:0.5, textTransform:'uppercase'}}>
          Ora
        </span>
        <span style={{marginLeft:'auto', fontSize:13, fontWeight:600, color:'#DC2626', opacity:0.75}}>
          {imminenti.length} prenotazioni imminenti su {sorted.length} totali
        </span>
      </div>

      {upcoming.length === 0 && (
        <div style={{padding:'36px 18px', textAlign:'center', fontSize:13, color:'#9CA3AF', fontWeight:600}}>
          Nessuna prenotazione in programma
        </div>
      )}

      {/* Imminenti — entro 30 min */}
      {imminenti.length > 0 && (
        <div>
          {imminenti.map(r => <ResRow key={r.id} r={r} nowMin={nowMin} onModifica={onModifica} onNoShow={id => setDismissed(s => new Set([...s, id]))}/>)}
        </div>
      )}

      {/* Separatore visivo */}
      {imminenti.length > 0 && dopo.length > 0 && (
        <div style={{height:8, background:'#F4F5F7', borderTop:'1px solid #EDEEF2', borderBottom:'1px solid #EDEEF2'}}/>
      )}

      {/* Resto della giornata — lista piatta */}
      {dopo.map(r => <ResRow key={r.id} r={r} nowMin={nowMin} onModifica={onModifica} onNoShow={id => setDismissed(s => new Set([...s, id]))}/>)}
    </div>
  );
}

function SlotHeader({ slot, count }) {
  const hh = String(Math.floor(slot / 60)).padStart(2, '0');
  const mm = String(slot % 60).padStart(2, '0');
  return (
    <div style={{
      display:'flex', alignItems:'center', gap:8,
      padding:'7px 18px',
      background:'#FAFBFC', borderBottom:'1px solid #F0F2F5',
    }}>
      <span style={{fontSize:12, fontWeight:700, color:'#0F1115', letterSpacing:-0.2}}>{hh}:{mm}</span>
      <span style={{width:3, height:3, borderRadius:'50%', background:'#D1D5DB'}}/>
      <span style={{fontSize:11, color:'#9CA3AF', fontWeight:600}}>
        {count} {count === 1 ? 'prenotazione' : 'prenotazioni'}
      </span>
    </div>
  );
}

function ResRow({ r, nowMin, dim, onModifica, onNoShow }) {
  const [hov, setHov] = React.useState(false);
  const [noShowConfirm, setNoShowConfirm] = React.useState(false);
  const meta = RES_STATUS_META[r.status];
  const minToArrival = timeToMin(r.time) - nowMin;
  const isUrgent = !dim && minToArrival >= 0 && minToArrival <= 15;
  const isImminente = !dim && minToArrival >= 0 && minToArrival <= 30;
  const isCancelled = r.status === 'cancellata' || r.status === 'noshow';
  const durH = Math.floor(r.dur / 60);
  const durM = r.dur % 60;
  const durLabel = durH > 0 ? `${durH}h${durM > 0 ? ` ${durM}'` : ''}` : `${durM}'`;

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={() => !dim && onModifica && onModifica(r)}
      style={{
        display:'flex', alignItems:'center', gap:12,
        padding:'10px 18px',
        background: hov && !dim ? '#F4F5F7' : '#fff',
        borderBottom:'1px solid #F0F2F5',
        borderLeft:`3px solid ${meta.dot}`,
        opacity: dim ? 0.55 : 1,
        transition:'background 0.15s',
        cursor: dim ? 'default' : 'pointer',
      }}
    >
      {/* Ora */}
      <div style={{minWidth:44, flexShrink:0}}>
        <div style={{fontSize: isImminente ? 16 : 14, fontWeight:700, color: isImminente ? '#DC2626' : '#0F1115', letterSpacing:-0.3, lineHeight:1}}>
          {r.time}
        </div>
      </div>

      {/* Nome + Tavolo */}
      <div style={{flex:1, minWidth:0, display:'flex', alignItems:'center', gap:7, overflow:'hidden'}}>
        <span style={{
          fontSize: isImminente ? 15.5 : 13.5, fontWeight: isImminente ? 700 : 500, color:'#0F1115',
          overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
          textDecoration: isCancelled ? 'line-through' : 'none',
        }}>{r.name}</span>
        <span style={{
          fontSize:13, fontWeight:700, color:'#6B7280',
          padding:'2px 7px', borderRadius:5,
          background:'#F1F2F5',
          whiteSpace:'nowrap', flexShrink:0,
        }}>Tav. {r.table}</span>
      </div>

      {/* Coperti */}
      <span style={{fontSize:13.5, color:'#9CA3AF', fontWeight:600, whiteSpace:'nowrap', flexShrink:0}}>
        {r.posti}p
      </span>

      {/* Note pill */}
      {r.note && <NotePill note={r.note}/>}

      {/* Azioni — compaiono su hover a destra, layout stabile */}
      {hov && !dim && (
        <div onClick={e => e.stopPropagation()} style={{display:'flex', alignItems:'center', gap:6, flexShrink:0}}>
          <QuickBtn color="#fff" bg="#16A34A" border="#16A34A" bold>Check-in</QuickBtn>
          <button onClick={() => setNoShowConfirm(true)} style={{
            padding:'5px 10px', borderRadius:6,
            background:'#FEF2F2', border:'1px solid #FECACA',
            color:'#DC2626', fontSize:13, fontWeight:600,
            cursor:'pointer', fontFamily:'inherit', whiteSpace:'nowrap',
          }}>No-show</button>
        </div>
      )}

      {/* Popup conferma no-show */}
      {noShowConfirm && (
        <div onClick={() => setNoShowConfirm(false)} style={{
          position:'fixed', inset:0, background:'rgba(15,17,21,0.45)', zIndex:100,
          display:'grid', placeItems:'center',
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background:'#fff', borderRadius:14, padding:'24px 24px 20px',
            width:320, boxShadow:'0 20px 60px rgba(0,0,0,0.22)',
            display:'flex', flexDirection:'column', gap:16,
          }}>
            <div style={{fontSize:16, fontWeight:700, color:'#0F1115', letterSpacing:-0.3}}>
              Segnare come no-show?
            </div>
            <div style={{fontSize:13, color:'#6B7280', lineHeight:1.5}}>
              <strong style={{color:'#0F1115'}}>{r.name}</strong> · {r.time} · Tav. {r.table}<br/>
              La prenotazione verrà rimossa dalla lista.
            </div>
            <div style={{display:'flex', gap:8}}>
              <button onClick={() => setNoShowConfirm(false)} style={{
                flex:1, padding:'10px 14px', borderRadius:8,
                background: PN.BTN_NEUTRAL, color:'#0F1115',
                border:`1px solid ${PN.BORDER_LIGHT}`,
                fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit',
                boxShadow: PN.INSET_HIGHLIGHT,
              }}>Annulla</button>
              <button onClick={() => { setNoShowConfirm(false); onNoShow && onNoShow(r.id); }} style={{
                flex:1, padding:'10px 14px', borderRadius:8,
                background:'linear-gradient(180deg, #E94343 0%, #DC2626 100%)',
                color:'#fff', border:'1px solid rgba(124, 14, 14, 0.40)',
                fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit',
                boxShadow:'inset 0 1px 0 rgba(255,255,255,0.30), 0 1px 2px rgba(220,38,38,0.18)',
              }}>Sì, no-show</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const NOTE_EVENT_LABELS = { anniversario:'Anniversario', aziendale:'Aziendale', compleanno:'Compleanno' };

function NotePill({ note }) {
  const isEvent = note.type in NOTE_EVENT_LABELS;
  return (
    <React.Fragment>
      {isEvent && (
        <span style={{
          display:'inline-block',
          fontSize:12.5, fontWeight:700, color:'#6D28D9',
          background:'#F5F3FF', border:'1px solid #DDD6FE',
          padding:'2px 8px', borderRadius:999, whiteSpace:'nowrap', flexShrink:0,
        }}>
          {NOTE_EVENT_LABELS[note.type]}
        </span>
      )}
      {note.text && (
        <span style={{
          fontSize:13, fontWeight:500, color:'#9CA3AF',
          whiteSpace:'nowrap', flexShrink:0,
          overflow:'hidden', textOverflow:'ellipsis', maxWidth:160,
        }}>
          {note.text}
        </span>
      )}
    </React.Fragment>
  );
}

function QuickBtn({ children, color, bg, border, bold }) {
  return (
    <button style={{
      padding: bold ? '6px 12px' : '5px 10px', borderRadius:7,
      background:bg,
      backgroundImage:'linear-gradient(180deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0) 100%)',
      border:`1px solid ${border}`,
      color, fontSize: bold ? 13.5 : 13, fontWeight:700,
      cursor:'pointer', fontFamily:'inherit', whiteSpace:'nowrap',
      boxShadow:'inset 0 1px 0 rgba(255,255,255,0.25), 0 1px 2px rgba(15,17,21,0.10)',
    }}>{children}</button>
  );
}

function PastSection({ items, nowMin, onModifica, onNoShow }) {
  const [open, setOpen] = React.useState(false);
  const arrivati = items.filter(r => r.status === 'arrivata').length;
  const noshow   = items.filter(r => r.status === 'noshow').length;
  return (
    <div>
      <button onClick={() => setOpen(o => !o)} style={{
        width:'100%', display:'flex', alignItems:'center', gap:8,
        padding:'11px 18px',
        background:'#FAFBFC', border:'none', borderBottom:'1px solid #F0F2F5',
        cursor:'pointer', fontFamily:'inherit', textAlign:'left',
      }}>
        <span style={{fontSize:11, fontWeight:700, color:'#9CA3AF', letterSpacing:0.4, textTransform:'uppercase'}}>Passati</span>
        <span style={{fontSize:11, color:'#C4C9D4', fontWeight:600}}>
          · {arrivati} serviti{noshow > 0 ? ` · ${noshow} no-show` : ''}
        </span>
        <span style={{flex:1}}/>
        <span style={{fontSize:11, color:'#C4C9D4', transform: open ? 'rotate(90deg)' : 'none', transition:'transform 0.15s'}}>›</span>
      </button>
      {open && items.map(r => <ResRow key={r.id} r={r} nowMin={-9999} dim onModifica={onModifica} onNoShow={onNoShow}/>)}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// WEEK · HEATMAP — fasce orarie × giorni con turnover per turno
// ─────────────────────────────────────────────────────────
function WeekHeatmap() {
  const days = ['Lun 8', 'Mar 9', 'Mer 10', 'Gio 11', 'Ven 12', 'Sab 13', 'Dom 14'];
  const todayIdx = 1;

  // Fasce 30': Pranzo 12:00–15:00, Cena 19:00–23:00
  const fascePranzo = ['12:00','12:30','13:00','13:30','14:00','14:30'];
  const fasceCena   = ['19:00','19:30','20:00','20:30','21:00','21:30','22:00','22:30'];

  // Demo data: tavoli occupati per fascia × giorno
  // Pranzo (su 11 tavoli totali)
  const matPranzo = [
    [1,2,3,3,1,0], // Lun
    [2,3,4,3,1,1], // Mar
    [1,2,3,2,1,0], // Mer
    [1,2,4,3,1,1], // Gio
    [2,4,5,4,2,1], // Ven
    [3,5,7,6,2,1], // Sab
    [3,6,8,7,3,1], // Dom
  ];
  const matCena = [
    [2,3,5,5,3,2,1,1], // Lun
    [2,4,6,5,4,3,2,1], // Mar
    [1,3,5,4,3,2,1,0], // Mer
    [2,4,6,5,4,2,1,1], // Gio
    [3,6,8,9,7,5,3,2], // Ven
    [5,7,10,11,9,7,4,2],// Sab
    [4,7,9,8,7,5,3,1], // Dom
  ];

  const capTot = ALL_TABLES.length;

  // Aggregati: picco tavoli per turno × giorno
  const aggPranzo = matPranzo.map(row => ({ peak: Math.max(...row) }));
  const aggCena   = matCena.map(row   => ({ peak: Math.max(...row) }));

  return (
    <div style={{
      background:'#fff', borderRadius: 12, border:'1px solid #E5E7EB',
      padding: 18, display:'flex', flexDirection:'column', gap: 18,
    }}>
      <FasciaBlock
        title="Pranzo · 12:00 — 15:00"
        accent="#FBBF24"
        accentBg="#FEF3C7"
        days={days} todayIdx={todayIdx}
        fasce={fascePranzo}
        matrix={matPranzo}
        aggregate={aggPranzo}
        cap={capTot}
      />
      <FasciaBlock
        title="Cena · 19:00 — 23:00"
        accent="#E04347"
        accentBg="#FFE0DD"
        days={days} todayIdx={todayIdx}
        fasce={fasceCena}
        matrix={matCena}
        aggregate={aggCena}
        cap={capTot}
      />
    </div>
  );
}

function FasciaBlock({ title, accent, accentBg, days, todayIdx, fasce, matrix, aggregate, cap }) {
  const colW = `repeat(${days.length}, minmax(0, 1fr))`;

  const colorFor = (v) => {
    if (v === 0) return '#FAFBFC';
    const i = v / cap;
    if (i < 0.15) return '#FFF1EE';
    if (i < 0.35) return '#FFD6CF';
    if (i < 0.55) return '#FFB8AC';
    if (i < 0.75) return '#FF8F7F';
    return '#FF6651';
  };

  return (
    <div>
      <div style={{display:'flex', alignItems:'center', gap: 8, marginBottom: 10}}>
        <span style={{
          width: 8, height: 8, borderRadius: 2, background: accent,
        }}/>
        <h4 style={{margin:0, fontSize: 13, fontWeight: 700, color:'#0F1115', letterSpacing:-0.2}}>{title}</h4>
        <span style={{fontSize: 11, color:'#6B7280', fontWeight: 600}}>· tavoli occupati per fascia · su {cap} tavoli</span>
      </div>

      <div style={{display:'grid', gridTemplateColumns:`90px ${colW}`, gap: 4}}>
        {/* header giorni */}
        <div/>
        {days.map((d,i)=>(
          <div key={d} style={{
            padding:'6px 4px', textAlign:'center',
            fontSize: 11, fontWeight: i===todayIdx ? 800 : 700,
            color: i===todayIdx ? '#0F1115' : '#6B7280',
            background: i===todayIdx ? accentBg : 'transparent',
            borderRadius: 6,
          }}>{d}</div>
        ))}

        {/* righe fasce */}
        {fasce.map((f, fi) => (
          <React.Fragment key={f}>
            <div style={{
              display:'flex', alignItems:'center', padding:'0 8px',
              fontSize: 11, fontWeight: 700, color:'#6B7280',
            }}>{f}</div>
            {days.map((d, di) => {
              const v = matrix[di][fi];
              const isToday = di === todayIdx;
              return (
                <button key={d} title={`${d} · ${f} · ${v} tavoli`} style={{
                  aspectRatio:'1.6 / 1',
                  background: colorFor(v),
                  border: isToday ? `1.5px solid ${accent}` : '1px solid transparent',
                  borderRadius: 5,
                  fontSize: 11.5, fontWeight: 700,
                  color: v / cap >= 0.55 ? '#7F1D1D' : v > 0 ? '#0F1115' : '#D1D5DB',
                  cursor:'pointer', fontFamily:'inherit',
                  transition:'transform 0.1s',
                }}
                onMouseEnter={e=>e.currentTarget.style.transform='scale(1.05)'}
                onMouseLeave={e=>e.currentTarget.style.transform='none'}
                >{v || '·'}</button>
              );
            })}
          </React.Fragment>
        ))}

        {/* riga aggregati — picco tavoli per turno */}
        <div style={{
          padding:'8px 8px 0', fontSize: 10.5, fontWeight: 700,
          color:'#6B7280', textTransform:'uppercase', letterSpacing: 0.4,
          display:'flex', alignItems:'flex-end',
        }}>Picco</div>
        {aggregate.map((a, di) => (
          <div key={di} style={{
            padding:'8px 4px 0',
            display:'flex', flexDirection:'column', alignItems:'center', gap: 2,
            borderTop:'1px dashed #E5E7EB',
            marginTop: 6,
          }}>
            <div style={{fontSize: 14, fontWeight: 700, color: accent, letterSpacing:-0.3}}>{a.peak}</div>
            <div style={{fontSize: 10, color:'#9CA3AF', fontWeight: 600}}>/ {cap} tav.</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// CERCA SLOT — popover (ex Disponibilità)
// ─────────────────────────────────────────────────────────
function CercaSlotPopover({ onClose }) {
  const [posti, setPosti] = React.useState(4);
  const [time, setTime] = React.useState('21:00');

  const reqMin = timeToMin(time);
  const reqEnd = reqMin + 90;
  const occupati = SALA_V3_RES_DATA
    .filter(r => r.status !== 'cancellata' && r.status !== 'noshow' && r.table)
    .filter(r => { const s = timeToMin(r.time); const e = s + r.dur; return s < reqEnd && e > reqMin; })
    .map(r => r.table);
  const liberi = ALL_TABLES.filter(t => !occupati.includes(t.id) && t.p >= posti);
  const disponibile = liberi.length > 0;
  const altSlots = ['20:00', '20:30', '21:00', '21:30', '22:00', '22:30'].filter(s => s !== time);

  return (
    <div onClick={onClose} style={{
      position:'fixed', inset: 0, background:'rgba(15,17,21,0.4)',
      display:'grid', placeItems:'center', zIndex: 100,
    }}>
      <div onClick={e=>e.stopPropagation()} style={{
        background:'#fff', borderRadius: 14, padding: 22,
        width: 480, maxWidth:'92vw',
        boxShadow:'0 24px 48px rgba(0,0,0,0.18)',
        display:'flex', flexDirection:'column', gap: 16,
      }}>
        <div style={{display:'flex', alignItems:'center', gap: 10}}>
          <h3 style={{margin:0, fontSize: 16, fontWeight: 700, color:'#0F1115', letterSpacing:-0.3}}>Cerca slot</h3>
          <span style={{flex:1}}/>
          <button onClick={onClose} style={{
            width: 28, height: 28, borderRadius: 6,
            background:'#F1F2F5', border:'none', cursor:'pointer', fontFamily:'inherit',
            fontSize: 14, color:'#6B7280',
          }}>×</button>
        </div>

        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap: 10}}>
          <Field label="Persone">
            <select value={posti} onChange={e=>setPosti(+e.target.value)} style={selectStyle}>
              {[1,2,3,4,5,6,7,8,10,12].map(n=><option key={n} value={n}>{n} {n===1?'persona':'persone'}</option>)}
            </select>
          </Field>
          <Field label="Giorno">
            <select style={selectStyle}>
              <option>Oggi · Mar 9 dic</option>
              <option>Domani · Mer 10 dic</option>
              <option>Gio 11 dic</option>
            </select>
          </Field>
          <Field label="Ora">
            <select value={time} onChange={e=>setTime(e.target.value)} style={selectStyle}>
              {['19:00','19:30','20:00','20:30','21:00','21:30','22:00','22:30'].map(t=><option key={t} value={t}>{t}</option>)}
            </select>
          </Field>
        </div>

        <div style={{
          background: disponibile ? '#F0FDF4' : '#FEF2F2',
          border: `1px solid ${disponibile ? '#86EFAC' : '#FCA5A5'}`,
          borderRadius: 10, padding: 14,
        }}>
          <div style={{display:'flex', alignItems:'center', gap: 9, marginBottom: 6}}>
            <span style={{
              width: 22, height: 22, borderRadius:'50%',
              background: disponibile ? '#16A34A' : '#DC2626',
              display:'grid', placeItems:'center',
            }}>
              {disponibile ? (
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13 L9 17 L19 7"/></svg>
              ) : (
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><path d="M5 5 L19 19 M19 5 L5 19"/></svg>
              )}
            </span>
            <span style={{fontSize: 13.5, fontWeight: 700, color: disponibile ? '#15803D' : '#991B1B'}}>
              {disponibile ? `${liberi.length} ${liberi.length===1?'tavolo libero':'tavoli liberi'}` : 'Nessuna disponibilità'}
            </span>
          </div>
          {disponibile && (
            <div style={{fontSize: 11.5, color:'#15803D', marginLeft: 31}}>
              {liberi.slice(0,5).map(t=>`Tav. ${t.id}`).join(' · ')}
              {liberi.length > 5 && ` · +${liberi.length-5}`}
            </div>
          )}
        </div>

        <div>
          <div style={{fontSize: 10.5, fontWeight: 700, color:'#6B7280', textTransform:'uppercase', letterSpacing: 0.4, marginBottom: 6}}>Altri orari</div>
          <div style={{display:'flex', gap: 6, flexWrap:'wrap'}}>
            {altSlots.map(s => (
              <button key={s} onClick={()=>setTime(s)} style={{
                padding:'7px 12px', borderRadius: 999,
                background:'#fff', border:'1px solid #E5E7EB',
                color:'#0F1115',
                fontSize: 12, fontWeight: 700, cursor:'pointer', fontFamily:'inherit',
              }}>{s}</button>
            ))}
          </div>
        </div>

        <button disabled={!disponibile} style={{
          padding:'11px 16px', borderRadius: 8,
          background: disponibile ? '#0F1115' : '#E5E7EB',
          color: disponibile ? '#fff' : '#9CA3AF',
          border:'none',
          fontSize: 13, fontWeight: 700, cursor: disponibile ? 'pointer' : 'not-allowed',
          fontFamily:'inherit',
        }}>+ Crea prenotazione</button>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <div style={{fontSize: 10.5, fontWeight: 700, color:'#6B7280', textTransform:'uppercase', letterSpacing: 0.4, marginBottom: 5}}>{label}</div>
      {children}
    </div>
  );
}

const selectStyle = {
  width:'100%', padding:'8px 10px', borderRadius: 7,
  border:'1px solid #E5E7EB', background:'#fff',
  fontSize: 12.5, fontWeight: 600, color:'#0F1115',
  fontFamily:'inherit', cursor:'pointer',
};

window.SalaV3Calendario = SalaV3Calendario;
window.SALA_V3_RES_DATA_GLOBAL = SALA_V3_RES_DATA;
