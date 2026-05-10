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
    {id:'r5', time:'19:30', dur:90, name:'Andrea Bianchi', posti:2, table:3, status:'confermata', phone:'+39 339 12 34 567', note:null, source:'byup'},
    {id:'r6', time:'20:00', dur:120, name:'Famiglia Rossi', posti:4, table:7, status:'confermata', phone:'+39 348 22 33 444', note:{type:'allergia', text:'Allergia glutine'}, source:'byup'},
    {id:'r7', time:'20:15', dur:90, name:'Coppia Verdi', posti:2, table:8, status:'confermata', phone:'+39 333 11 22 333', note:{type:'preferenza', text:'Tavolo finestra'}, source:'tel'},
    {id:'r8', time:'20:30', dur:150, name:'Tavolata Neri', posti:8, table:1, status:'inattesa', phone:'+39 320 99 88 777', note:{type:'compleanno', text:'Compleanno · candelina'}, source:'byup'},
    {id:'r9', time:'20:45', dur:90, name:'Romano', posti:3, table:null, status:'confermata', phone:'+39 347 ...', note:null, source:'tel'},
    {id:'r10', time:'21:00', dur:120, name:'De Luca', posti:3, table:null, status:'confermata', phone:'+39 349 22 33 111', note:null, source:'byup'},
    {id:'r11', time:'21:00', dur:90, name:'Greco', posti:2, table:5, status:'confermata', phone:'+39 333 88 77 666', note:null, source:'tel'},
    {id:'r12', time:'21:15', dur:120, name:'Marini', posti:4, table:12, status:'confermata', phone:'+39 348 ...', note:{type:'aziendale', text:'Cliente VIP'}, source:'tel'},
    {id:'r13', time:'21:30', dur:120, name:'Famiglia Verdi', posti:5, table:11, status:'confermata', phone:'+39 320 ...', note:{type:'bambini', text:'2 bambini'}, source:'byup'},
    {id:'r14', time:'21:30', dur:90, name:'Costa', posti:2, table:6, status:'inattesa', phone:'+39 339 ...', note:null, source:'walkin'},
    {id:'r15', time:'22:00', dur:90, name:'Russo', posti:4, table:9, status:'confermata', phone:'+39 347 ...', note:null, source:'tel'},
    {id:'r16', time:'22:30', dur:90, name:'Esposito', posti:4, table:null, status:'confermata', phone:'+39 348 ...', note:null, source:'byup'},
    {id:'r17', time:'22:30', dur:60, name:'Conti', posti:2, table:4, status:'cancellata', phone:'+39 333 ...', note:null, source:'tel'},
  ];
  return data;
})();

const NOW_HHMM = '19:55';
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
function SalaV3Calendario({ tweaks, onNuova }) {
  const [scala, setScala] = React.useState('giorno'); // giorno | settimana
  const [dayView, setDayView] = React.useState('timeline'); // timeline | lista
  const [showCerca, setShowCerca] = React.useState(false);

  return (
    <div style={{display:'flex', flexDirection:'column', gap: 14, minWidth: 0, position:'relative'}}>
      <Toolbar
        scala={scala} setScala={setScala}
        dayView={dayView} setDayView={setDayView}
        onCerca={()=>setShowCerca(true)}
        onNuova={onNuova}
      />

      <KpiBar scala={scala}/>

      {scala === 'giorno' && dayView === 'timeline' && <DayTimeline/>}
      {scala === 'giorno' && dayView === 'lista' && <DayList/>}
      {scala === 'settimana' && <WeekHeatmap/>}

      {showCerca && <CercaSlotPopover onClose={()=>setShowCerca(false)}/>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// TOOLBAR
// ─────────────────────────────────────────────────────────
function Toolbar({ scala, setScala, dayView, setDayView, onCerca, onNuova }) {
  return (
    <div style={{display:'flex', alignItems:'center', gap: 10, flexWrap:'wrap'}}>
      {/* Scala */}
      <Segmented
        value={scala}
        onChange={setScala}
        options={[
          {id:'giorno', label:'Giorno'},
          {id:'settimana', label:'Settimana'},
        ]}
      />

      {/* Date navigator */}
      <div style={{display:'flex', alignItems:'center', gap: 4}}>
        <NavBtn>‹</NavBtn>
        <span style={{
          padding:'7px 12px', borderRadius: 7,
          fontSize: 12.5, fontWeight: 700, color:'#0F1115',
          background:'#F1F2F5',
          whiteSpace:'nowrap',
        }}>{scala === 'giorno' ? 'Oggi · Mar 9 dic' : 'Sett. 8 — 14 dic'}</span>
        <NavBtn>›</NavBtn>
      </div>

      <span style={{flex:1}}/>

      {/* View mode (solo per giorno) */}
      {scala === 'giorno' && (
        <Segmented
          value={dayView}
          onChange={setDayView}
          options={[
            {id:'timeline', label:'Timeline'},
            {id:'lista', label:'Lista'},
          ]}
          small
        />
      )}

      <button onClick={onCerca} style={{
        padding:'9px 14px', borderRadius: 8,
        background:'#fff', color:'#0F1115',
        border:'1px solid #E5E7EB',
        fontSize: 12.5, fontWeight: 700, cursor:'pointer', fontFamily:'inherit',
        display:'inline-flex', alignItems:'center', gap: 6, whiteSpace:'nowrap',
      }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>
        </svg>
        Cerca slot
      </button>

      <button onClick={onNuova} style={{
        padding:'9px 14px', borderRadius: 8,
        background:'#0F1115', color:'#fff', border:'none',
        fontSize: 12.5, fontWeight: 700, cursor:'pointer', fontFamily:'inherit',
        display:'inline-flex', alignItems:'center', gap: 6, whiteSpace:'nowrap',
      }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14 M5 12h14"/>
        </svg>
        Nuova prenotazione
      </button>
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
          fontSize: small ? 12 : 12.5, fontWeight: value === o.id ? 700 : 600,
          color: value === o.id ? '#0F1115' : '#6B7280',
          boxShadow: value === o.id ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
          whiteSpace:'nowrap', transition:'all 0.12s',
        }}>{o.label}</button>
      ))}
    </div>
  );
}

function NavBtn({ children }) {
  return (
    <button style={{
      width: 28, height: 28, borderRadius: 6,
      background:'#fff', border:'1px solid #E5E7EB',
      cursor:'pointer', fontFamily:'inherit', fontSize: 13, color:'#6B7280',
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
        fontSize: big ? 24 : 18, fontWeight: 800,
        color: accent || '#0F1115', letterSpacing:-0.4, lineHeight: 1.1, marginTop: 2,
      }}>{value}{hint && <span style={{fontSize: 10, fontWeight: 600, color:'#9CA3AF', marginLeft: 6}}>{hint}</span>}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// DAY · TIMELINE — table × time grid (mostra il turnover visivamente)
// ─────────────────────────────────────────────────────────
function DayTimeline() {
  const tables = ALL_TABLES;
  const startMin = 12 * 60;     // 12:00
  const endMin = 23 * 60 + 30;  // 23:30
  const totalMin = endMin - startMin;
  const hours = []; for (let h = 12; h <= 23; h++) hours.push(h);

  const valid = SALA_V3_RES_DATA.filter(r => r.status !== 'cancellata' && r.table);
  const nowMin = timeToMin(NOW_HHMM);
  const nowPct = ((nowMin - startMin) / totalMin) * 100;

  // Coperti per fascia 30'
  const fasceStep = 30;
  const fasce = [];
  for (let m = startMin; m < endMin; m += fasceStep) {
    const cop = SALA_V3_RES_DATA
      .filter(r => r.status !== 'cancellata' && r.status !== 'noshow')
      .filter(r => timeToMin(r.time) >= m && timeToMin(r.time) < m + fasceStep)
      .reduce((s,r)=>s+r.posti, 0);
    fasce.push({ time: m, cop });
  }
  const maxCop = Math.max(...fasce.map(f=>f.cop), 1);

  return (
    <div style={{
      background:'#fff', borderRadius: 12, border:'1px solid #E5E7EB',
      overflow:'hidden',
    }}>
      {/* Header con istogramma fasce */}
      <div style={{padding:'14px 18px 6px', borderBottom:'1px solid #F0F2F5'}}>
        <div style={{display:'flex', alignItems:'baseline', gap: 8, marginBottom: 10}}>
          <div style={{fontSize: 12, fontWeight: 700, color:'#0F1115'}}>Coperti per fascia oraria</div>
          <span style={{fontSize: 10.5, color:'#9CA3AF', fontWeight: 600}}>· step 30 minuti</span>
        </div>
        <div style={{display:'grid', gridTemplateColumns:'70px 1fr', gap: 8}}>
          <div/>
          <div style={{position:'relative', height: 44}}>
            <div style={{
              position:'absolute', inset: 0,
              display:'grid', gridTemplateColumns: `repeat(${fasce.length}, 1fr)`,
              alignItems:'end', gap: 1,
            }}>
              {fasce.map((f,i)=>{
                const intensity = f.cop / maxCop;
                const isPranzo = f.time < 17 * 60;
                return (
                  <div key={i} style={{
                    height: f.cop > 0 ? `${Math.max(intensity * 100, 8)}%` : 2,
                    background: isPranzo ? '#FBBF24' : '#E04347',
                    opacity: f.cop > 0 ? 0.4 + intensity * 0.6 : 0.2,
                    borderRadius:'2px 2px 0 0',
                  }} title={`${Math.floor(f.time/60).toString().padStart(2,'0')}:${(f.time%60).toString().padStart(2,'0')} · ${f.cop} coperti`}/>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Hour ruler */}
      <div style={{
        display:'grid', gridTemplateColumns:'70px 1fr', gap: 8,
        padding:'6px 18px', borderBottom:'1px solid #F0F2F5',
        position:'sticky', top: 0, background:'#fff', zIndex: 2,
      }}>
        <div/>
        <div style={{position:'relative', height: 22}}>
          {hours.map(h => {
            const pct = ((h*60 - startMin) / totalMin) * 100;
            return (
              <span key={h} style={{
                position:'absolute', left: `${pct}%`, top: 0,
                fontSize: 10.5, fontWeight: 700, color:'#9CA3AF',
                transform:'translateX(-50%)', whiteSpace:'nowrap',
              }}>{h}:00</span>
            );
          })}
        </div>
      </div>

      {/* Rows */}
      <div style={{maxHeight: 440, overflow:'auto', padding:'6px 18px 14px'}}>
        {tables.map(t => {
          const reservations = valid.filter(r => r.table === t.id).sort((a,b)=>timeToMin(a.time)-timeToMin(b.time));
          const turni = reservations.length;
          return (
            <div key={t.id} style={{
              display:'grid', gridTemplateColumns:'70px 1fr', gap: 8,
              alignItems:'center',
              padding:'4px 0',
              borderBottom:'1px dashed #F0F2F5',
            }}>
              <div style={{display:'flex', alignItems:'center', gap: 6}}>
                <span style={{fontSize: 12, fontWeight: 800, color:'#0F1115'}}>T.{t.id}</span>
                <span style={{fontSize: 10, fontWeight: 600, color:'#9CA3AF'}}>{t.p}p</span>
                {turni >= 2 && (
                  <span title={`${turni} turni`} style={{
                    fontSize: 9, fontWeight: 800, color:'#E04347',
                    background:'#FFE0DD', padding:'1px 4px', borderRadius: 3,
                    letterSpacing: 0.3,
                  }}>{turni}T</span>
                )}
              </div>
              <div style={{
                position:'relative', height: 32,
                background:'repeating-linear-gradient(to right, transparent 0, transparent calc(100%/11.5 - 1px), #F4F5F7 calc(100%/11.5 - 1px), #F4F5F7 calc(100%/11.5))',
              }}>
                {/* Now line per oggi */}
                {nowPct >= 0 && nowPct <= 100 && (
                  <div style={{
                    position:'absolute', top: -2, bottom: -2,
                    left: `${nowPct}%`, width: 1.5,
                    background:'#DC2626', zIndex: 1,
                  }}/>
                )}
                {reservations.map(r => {
                  const sMin = timeToMin(r.time);
                  const left = ((sMin - startMin) / totalMin) * 100;
                  const width = (r.dur / totalMin) * 100;
                  const meta = RES_STATUS_META[r.status];
                  const past = sMin + r.dur < nowMin;
                  return (
                    <div key={r.id} title={`${r.time} · ${r.name} · ${r.posti}p · ${r.dur}min`} style={{
                      position:'absolute', left: `${left}%`, width: `${width}%`,
                      top: 4, bottom: 4,
                      background: r.status === 'inattesa' ? '#FEF3C7' :
                                  r.status === 'arrivata' ? '#DCFCE7' :
                                  r.status === 'noshow' ? '#F3F4F6' : '#0F1115',
                      color: r.status === 'inattesa' ? '#A16207' :
                             r.status === 'arrivata' ? '#15803D' :
                             r.status === 'noshow' ? '#9CA3AF' : '#fff',
                      border: r.status === 'inattesa' ? '1px solid #FCD34D' :
                              r.status === 'arrivata' ? '1px solid #86EFAC' : 'none',
                      borderRadius: 5,
                      padding:'0 6px',
                      fontSize: 10.5, fontWeight: 700,
                      display:'flex', alignItems:'center', gap: 4,
                      overflow:'hidden', whiteSpace:'nowrap',
                      opacity: past ? 0.5 : 1,
                      cursor:'pointer',
                      zIndex: 2,
                    }}>
                      <span style={{flexShrink: 0}}>{r.time}</span>
                      <span style={{overflow:'hidden', textOverflow:'ellipsis', flex: 1, minWidth: 0}}>{r.name}</span>
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
        padding:'10px 18px', borderTop:'1px solid #F0F2F5',
        display:'flex', alignItems:'center', gap: 14, flexWrap:'wrap',
        fontSize: 11, color:'#6B7280',
      }}>
        <Legend dot="#0F1115" label="Confermata"/>
        <Legend dot="#FBBF24" label="In attesa" bg="#FEF3C7" border="#FCD34D"/>
        <Legend dot="#16A34A" label="Arrivati" bg="#DCFCE7" border="#86EFAC"/>
        <Legend dot="#9CA3AF" label="No-show" bg="#F3F4F6"/>
        <span style={{flex:1}}/>
        <span style={{fontWeight: 600}}><span style={{color:'#E04347', fontWeight: 800}}>2T</span> = tavolo con 2+ turni</span>
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
// DAY · LISTA (cronologica)
// ─────────────────────────────────────────────────────────
function DayList() {
  const nowMin = timeToMin(NOW_HHMM);
  const all = SALA_V3_RES_DATA;
  const past = all.filter(r => timeToMin(r.time) < nowMin);
  const future = all.filter(r => timeToMin(r.time) >= nowMin);
  const trapocoEnd = nowMin + 60;
  const seraEnd = 21 * 60 + 30;
  const trapoco = future.filter(r => timeToMin(r.time) <= trapocoEnd);
  const sera = future.filter(r => timeToMin(r.time) > trapocoEnd && timeToMin(r.time) <= seraEnd);
  const tarda = future.filter(r => timeToMin(r.time) > seraEnd);

  return (
    <div style={{display:'flex', flexDirection:'column', gap: 12}}>
      {past.length > 0 && <PastSection items={past}/>}

      <div style={{display:'flex', alignItems:'center', gap: 10, padding:'2px 0'}}>
        <div style={{flex:1, height: 1, background:'#DC2626'}}/>
        <span style={{
          fontSize: 11, fontWeight: 800, color:'#fff', background:'#DC2626',
          padding:'3px 10px', borderRadius: 999, letterSpacing: 0.4,
          whiteSpace:'nowrap',
        }}>ORA · {NOW_HHMM}</span>
        <div style={{flex:1, height: 1, background:'#DC2626'}}/>
      </div>

      {trapoco.length > 0 && <ResGroup title="Tra poco" subtitle={`${trapoco.length} ${trapoco.length === 1 ? 'arrivo' : 'arrivi'} entro 1h`} accent="#DC2626" items={trapoco} showUrgency/>}
      {sera.length > 0 && <ResGroup title="Dopo le 21" subtitle={`${sera.length} prenotazioni`} accent="#0F1115" items={sera}/>}
      {tarda.length > 0 && <ResGroup title="Tarda sera" subtitle={`${tarda.length} prenotazioni`} accent="#6B7280" items={tarda}/>}
    </div>
  );
}

function PastSection({ items }) {
  const [open, setOpen] = React.useState(false);
  const arrivati = items.filter(r=>r.status==='arrivata').length;
  return (
    <div style={{borderRadius: 12, background:'#FAFBFC', border:'1px solid #F0F2F5'}}>
      <button onClick={()=>setOpen(o=>!o)} style={{
        width:'100%', display:'flex', alignItems:'center', gap: 10,
        padding:'12px 16px', background:'transparent', border:'none',
        cursor:'pointer', fontFamily:'inherit', textAlign:'left',
      }}>
        <span style={{fontSize: 12, fontWeight: 700, color:'#6B7280', letterSpacing: 0.3, textTransform:'uppercase'}}>Stamattina</span>
        <span style={{fontSize: 11, color:'#9CA3AF'}}>· {arrivati} servite{items.length - arrivati > 0 ? ` · ${items.length - arrivati} no-show` : ''}</span>
        <span style={{flex:1}}/>
        <span style={{fontSize: 12, color:'#6B7280', transform: open ? 'rotate(90deg)' : 'none', transition:'transform 0.15s'}}>›</span>
      </button>
      {open && (
        <div style={{padding:'4px 8px 10px', display:'flex', flexDirection:'column', gap: 6}}>
          {items.map(r => <ResCard key={r.id} r={r} dim/>)}
        </div>
      )}
    </div>
  );
}

function ResGroup({ title, subtitle, accent, items, showUrgency }) {
  return (
    <section>
      <div style={{display:'flex', alignItems:'baseline', gap: 8, marginBottom: 8, padding:'0 4px'}}>
        <span style={{width: 4, height: 16, background: accent, borderRadius: 2, alignSelf:'center'}}/>
        <h3 style={{margin:0, fontSize: 14, fontWeight: 800, color:'#0F1115', letterSpacing: -0.2}}>{title}</h3>
        <span style={{fontSize: 11.5, color:'#6B7280', fontWeight: 600}}>· {subtitle}</span>
      </div>
      <div style={{display:'flex', flexDirection:'column', gap: 6}}>
        {items.map(r => <ResCard key={r.id} r={r} showUrgency={showUrgency}/>)}
      </div>
    </section>
  );
}

function ResCard({ r, dim, showUrgency }) {
  const [expanded, setExpanded] = React.useState(false);
  const meta = RES_STATUS_META[r.status];
  const minToArrival = timeToMin(r.time) - timeToMin(NOW_HHMM);
  const isUrgent = showUrgency && minToArrival >= 0 && minToArrival <= 15;
  const noteIsCritical = r.note && r.note.type === 'allergia';

  return (
    <div onClick={()=>setExpanded(e=>!e)} style={{
      background:'#fff', borderRadius: 10,
      border: `1px solid ${isUrgent ? '#FCA5A5' : '#E5E7EB'}`,
      borderLeft: `3px solid ${isUrgent ? '#DC2626' : meta.dot}`,
      padding: expanded ? '14px 16px' : '10px 14px',
      cursor:'pointer', opacity: dim ? 0.65 : 1,
      transition:'all 0.15s', position:'relative',
      textDecoration: r.status === 'cancellata' ? 'line-through' : 'none',
    }}>
      <div style={{display:'flex', alignItems:'center', gap: 12, flexWrap:'wrap'}}>
        <div style={{minWidth: 56}}>
          <div style={{fontSize: 16, fontWeight: 800, color: isUrgent ? '#991B1B' : '#0F1115', letterSpacing:-0.3, lineHeight: 1}}>{r.time}</div>
          {isUrgent && <div style={{fontSize: 10, fontWeight: 700, color:'#DC2626', marginTop: 2}}>tra {minToArrival}'</div>}
        </div>
        <div style={{flex:1, minWidth: 140}}>
          <div style={{display:'flex', alignItems:'baseline', gap: 8, flexWrap:'wrap'}}>
            <span style={{fontSize: 14, fontWeight: 700, color:'#0F1115'}}>{r.name}</span>
            <span style={{fontSize: 11.5, color:'#6B7280', fontWeight: 600}}>{r.posti}p · {r.dur}min</span>
            {r.source === 'byup' && (
              <span style={{
                fontSize: 9, fontWeight: 800, color:'#E04347',
                background:'#FFE0DD', padding:'1px 5px', borderRadius: 3,
                letterSpacing: 0.4, textTransform:'uppercase',
              }}>byup</span>
            )}
          </div>
          {r.note && !expanded && (
            <div style={{
              fontSize: 11.5, fontWeight: 600,
              color: noteIsCritical ? '#991B1B' : '#6B7280',
              marginTop: 2,
            }}>{r.note.text}</div>
          )}
        </div>
        <span style={{
          fontSize: 12, fontWeight: 800, color: r.table ? '#0F1115' : '#9CA3AF',
          padding:'5px 10px', borderRadius: 6,
          background: r.table ? '#F1F2F5' : '#F9FAFB',
          border: r.table ? 'none' : '1px dashed #D1D5DB',
        }}>{r.table ? `T.${r.table}` : 'Non assegnato'}</span>
      </div>
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

  // Demo data: coperti per fascia × giorno (riempito plausibilmente)
  // Pranzo
  const matPranzo = [
    [4,8,12,10,2,0],   // Lun
    [6,10,14,8,4,2],   // Mar
    [2,6,10,8,2,0],    // Mer
    [4,8,12,10,4,2],   // Gio
    [8,14,18,14,6,2],  // Ven
    [10,18,24,20,8,4], // Sab
    [12,20,26,22,10,4],// Dom
  ];
  const matCena = [
    [6,12,18,16,12,8,4,2],   // Lun
    [8,14,20,18,14,10,6,2],  // Mar
    [4,10,16,14,10,6,2,0],   // Mer
    [6,14,20,16,14,8,4,2],   // Gio
    [12,20,28,30,24,18,10,6],// Ven
    [16,26,36,38,32,24,14,8],// Sab
    [14,24,32,28,24,16,10,4],// Dom
  ];

  const tavoli = ALL_TABLES.length;

  // Aggregati per turno × giorno
  const aggPranzo = matPranzo.map(row => {
    const cop = row.reduce((a,b)=>a+b,0);
    const prenot = Math.round(cop / 2.8); // demo: media 2.8 coperti per prenot
    const turnover = (prenot / tavoli).toFixed(1);
    return { cop, prenot, turnover };
  });
  const aggCena = matCena.map(row => {
    const cop = row.reduce((a,b)=>a+b,0);
    const prenot = Math.round(cop / 2.8);
    const turnover = (prenot / tavoli).toFixed(1);
    return { cop, prenot, turnover };
  });

  const maxP = Math.max(...matPranzo.flat(), 1);
  const maxC = Math.max(...matCena.flat(), 1);

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
        max={maxP}
      />
      <FasciaBlock
        title="Cena · 19:00 — 23:00"
        accent="#E04347"
        accentBg="#FFE0DD"
        days={days} todayIdx={todayIdx}
        fasce={fasceCena}
        matrix={matCena}
        aggregate={aggCena}
        max={maxC}
      />
    </div>
  );
}

function FasciaBlock({ title, accent, accentBg, days, todayIdx, fasce, matrix, aggregate, max }) {
  const colW = `repeat(${days.length}, minmax(0, 1fr))`;

  const colorFor = (v) => {
    if (v === 0) return '#FAFBFC';
    const i = v / max;
    if (i < 0.2) return '#FFF1EE';
    if (i < 0.4) return '#FFD6CF';
    if (i < 0.6) return '#FFB8AC';
    if (i < 0.8) return '#FF8F7F';
    return '#FF6651';
  };

  return (
    <div>
      <div style={{display:'flex', alignItems:'center', gap: 8, marginBottom: 10}}>
        <span style={{
          width: 8, height: 8, borderRadius: 2, background: accent,
        }}/>
        <h4 style={{margin:0, fontSize: 13, fontWeight: 800, color:'#0F1115', letterSpacing:-0.2}}>{title}</h4>
        <span style={{fontSize: 11, color:'#6B7280', fontWeight: 600}}>· coperti per fascia · {fasce.length} slot di 30'</span>
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
                <button key={d} title={`${d} · ${f} · ${v} coperti`} style={{
                  aspectRatio:'1.6 / 1',
                  background: colorFor(v),
                  border: isToday ? `1.5px solid ${accent}` : '1px solid transparent',
                  borderRadius: 5,
                  fontSize: 11.5, fontWeight: 800,
                  color: v > max * 0.6 ? '#7F1D1D' : v > 0 ? '#0F1115' : '#D1D5DB',
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

        {/* riga aggregati turnover */}
        <div style={{
          padding:'8px 8px 0', fontSize: 10.5, fontWeight: 800,
          color:'#6B7280', textTransform:'uppercase', letterSpacing: 0.4,
          display:'flex', alignItems:'flex-end',
        }}>Turno</div>
        {aggregate.map((a, di) => (
          <div key={di} style={{
            padding:'8px 4px 0',
            display:'flex', flexDirection:'column', alignItems:'center', gap: 2,
            borderTop:'1px dashed #E5E7EB',
            marginTop: 6,
          }}>
            <div style={{fontSize: 14, fontWeight: 800, color: accent, letterSpacing:-0.3}}>{a.turnover}×</div>
            <div style={{fontSize: 10, color:'#6B7280', fontWeight: 600}}>{a.cop} cop · {a.prenot} pr.</div>
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
          <h3 style={{margin:0, fontSize: 16, fontWeight: 800, color:'#0F1115', letterSpacing:-0.3}}>Cerca slot</h3>
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
            <span style={{fontSize: 13.5, fontWeight: 800, color: disponibile ? '#15803D' : '#991B1B'}}>
              {disponibile ? `${liberi.length} ${liberi.length===1?'tavolo libero':'tavoli liberi'}` : 'Nessuna disponibilità'}
            </span>
          </div>
          {disponibile && (
            <div style={{fontSize: 11.5, color:'#15803D', marginLeft: 31}}>
              {liberi.slice(0,5).map(t=>`T.${t.id}`).join(' · ')}
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
          fontSize: 13, fontWeight: 800, cursor: disponibile ? 'pointer' : 'not-allowed',
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
