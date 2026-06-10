// Sala — Modali (aggiungi articolo, conti aperti, pagamento, nuova prenotazione)

function SalaModalAggiungi({ open, onClose, tavolo }) {
  const [search, setSearch] = React.useState('');
  const [cat, setCat] = React.useState('Tutti i piatti');
  const cats = ['Tutti i piatti','Antipasti','Primi piatti','Secondi'];

  return (
    <PnModal open={open} onClose={onClose}
      title={`Aggiungi articolo · Tavolo ${tavolo?.id ?? ''}`}
      width={760}
      footer={(
        <>
          <PnButton variant="ghost">Annulla</PnButton>
          <PnButton variant="primary">Conferma ordine</PnButton>
        </>
      )}
    >
      <div style={{display:'flex', gap: 10, marginBottom: 14}}>
        <PnSearchInput value={search} onChange={setSearch} placeholder="Cerca piatto"/>
        <SaSelect value={cat} onChange={setCat} options={cats}/>
      </div>
      <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap: 12}}>
        {SALA_VENDITA_PIATTI.slice(0, 6).map(p => (
          <SaPiattoCard key={p.id} p={p} qty={0} onAdd={()=>{}} onRem={()=>{}}/>
        ))}
      </div>
    </PnModal>
  );
}

function SalaModalConti({ open, onClose }) {
  return (
    <PnModal open={open} onClose={onClose} title="Conti aperti" width={720}>
      <div style={{
        border: `1px solid ${PN.BORDER_SOFT}`, borderRadius: 10, overflow:'hidden',
      }}>
        <div style={{
          display:'grid', gridTemplateColumns:'80px 110px 1fr 110px 130px 110px',
          padding:'10px 14px',
          background: PN.PINK_SOFT,
          fontSize: 12, fontWeight: 700, color: PN.TEXT,
        }}>
          <span>Tavolo</span><span>Liberato</span><span>Cliente</span>
          <span>Tot. Tavolo</span><span>Tot. da saldare</span><span style={{textAlign:'right'}}>Azione</span>
        </div>
        {SALA_CONTI_APERTI.map((c, i) => (
          <div key={i} style={{
            display:'grid', gridTemplateColumns:'80px 110px 1fr 110px 130px 110px',
            padding:'12px 14px', alignItems:'center',
            borderTop: `1px solid ${PN.BORDER_SOFT}`,
            fontSize: 13, color: PN.TEXT,
          }}>
            <span style={{fontWeight: 700}}>{c.tavolo}</span>
            <span>{c.liberato}</span>
            <span>{c.cliente}</span>
            <span>€{c.totTavolo.toFixed(2)}</span>
            <span style={{color: PN.PINK_DARK, fontWeight: 700}}>€{c.daSaldare.toFixed(2)}</span>
            <button style={{
              padding:'6px 14px', borderRadius: 999,
              background: PN.TEXT, color: PN.WHITE, border:'none',
              fontSize: 12, fontWeight: 600, cursor:'pointer',
              fontFamily:'inherit', marginLeft:'auto',
            }}>Chiudi</button>
          </div>
        ))}
      </div>
    </PnModal>
  );
}

function SalaModalPagamento({ open, onClose, tavolo }) {
  const [method, setMethod] = React.useState('Carta');
  const subtot = 84.00, coperto = 6.00, mancia = 5, total = subtot + coperto + mancia;
  return (
    <PnModal open={open} onClose={onClose}
      title={`Pagamento · Tavolo ${tavolo?.id ?? ''}`} width={520}
      footer={(
        <>
          <PnButton variant="ghost">Annulla</PnButton>
          <PnButton variant="primary">Incassa €{total.toFixed(2)}</PnButton>
        </>
      )}
    >
      <div style={{display:'flex', flexDirection:'column', gap: 8, marginBottom: 16}}>
        <SaRow l="Subtotale" v={`€${subtot.toFixed(2)}`}/>
        <SaRow l="Coperto" v={`€${coperto.toFixed(2)}`}/>
        <SaRow l="Mancia" v={`€${mancia.toFixed(2)}`}/>
        <div style={{
          display:'flex', justifyContent:'space-between',
          fontSize: 15, fontWeight: 800, color: PN.TEXT,
          paddingTop: 10, borderTop: `1px dashed ${PN.BORDER}`,
        }}>
          <span>Totale</span><span>€{total.toFixed(2)}</span>
        </div>
      </div>
      <div style={{fontSize: 12, fontWeight: 700, color: PN.MUTED, marginBottom: 8}}>METODO</div>
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap: 8}}>
        {['Carta','Contanti','byup'].map(m => {
          const on = method === m;
          return (
            <button key={m} onClick={() => setMethod(m)} style={{
              padding: '12px 10px', borderRadius: 10,
              background: on ? PN.PINK_DARK : PN.WHITE,
              color: on ? PN.WHITE : PN.TEXT,
              border: on ? 'none' : `1px solid ${PN.BORDER}`,
              fontSize: 13, fontWeight: 700,
              cursor:'pointer', fontFamily:'inherit',
            }}>{m}</button>
          );
        })}
      </div>
    </PnModal>
  );
}

// ─── Dati mock per Nuova Prenotazione ───────────────────────────────────────
const NP_CLIENTI = [
  { id:1, nome:'Marco Rossi',       tel:'+39 347 123 4567', visite:8  },
  { id:2, nome:'Giulia Bianchi',    tel:'+39 333 987 6543', visite:3  },
  { id:3, nome:'Luca Verdi',        tel:'+39 320 456 7890', visite:12 },
  { id:4, nome:'Martina Franco',    tel:'+39 348 222 1111', visite:2  },
  { id:5, nome:'Andrea Neri',       tel:'+39 339 333 2222', visite:5  },
  { id:6, nome:'Sofia Romano',      tel:'+39 328 444 5555', visite:1  },
  { id:7, nome:'Famiglia Ferri',    tel:'+39 347 666 7777', visite:6  },
  { id:8, nome:'Bruno Bucciarati',  tel:'+39 347 999 0001', visite:4  },
  { id:9, nome:'Elena Conti',       tel:'+39 333 100 2003', visite:9  },
];

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
function npFmtTavoli(tables) {
  if (!tables || tables.length === 0) return '';
  if (tables.length === 1) return `Tav. ${tables[0].id}`;
  const ids = tables.map(t => t.id).sort((a, b) => a - b);
  return `Tav. ${ids[0]}-${ids[ids.length - 1]}`;
}

// ─── Componenti interni ───────────────────────────────────────────────────────
function NpSection({ label, children }) {
  return (
    <div style={{padding:'16px 0', display:'flex', flexDirection:'column', gap:12}}>
      <div style={{fontSize:11, fontWeight:800, color:'#374151', textTransform:'uppercase', letterSpacing:1.2}}>{label}</div>
      {children}
    </div>
  );
}
function NpField({ label, children }) {
  return (
    <div style={{display:'flex', flexDirection:'column', gap:6}}>
      <div style={{fontSize:12.5, fontWeight:600, color:'#475569'}}>{label}</div>
      {children}
    </div>
  );
}
function NpDivider() {
  return <div style={{height:1, background:'#E2E8F0'}}/>;
}
const npInput = {
  width:'100%', padding:'11px 14px', borderRadius:9,
  border:'1px solid #E5E7EB', background:'#fff',
  fontSize:14, color:'#111827', fontFamily:'inherit',
  outline:'none', boxSizing:'border-box',
};
const npSelInline = {
  width:'100%', border:'none', outline:'none', background:'transparent',
  fontSize:14, color:'#111827', fontFamily:'inherit', cursor:'pointer', padding:0,
};

// ─── Modal principale ─────────────────────────────────────────────────────────
function SalaModalNuova({ open, onClose, initData }) {
  const [step, setStep]                       = React.useState(1);
  const [coperti, setCoperti]                 = React.useState(2);
  const [date, setDate]                       = React.useState('oggi');
  const [time, setTime]                       = React.useState('20:00');
  const [dur, setDur]                         = React.useState(npSmartDur('20:00'));
  const [salaFilter, setSalaFilter]           = React.useState(null);
  const [showSalaFilter, setShowSalaFilter]   = React.useState(false);
  const [tavoloOverride, setTavoloOverride]   = React.useState(null);
  const [showTavoloList, setShowTavoloList]   = React.useState(false);
  const [pickerIds, setPickerIds]             = React.useState(new Set());
  const [hoveredBar, setHoveredBar]           = React.useState(null);
  const [confirmedTime, setConfirmedTime]     = React.useState(null);
  const [confirmedTavolo, setConfirmedTavolo] = React.useState(null);
  const [nome, setNome]                       = React.useState('');
  const [phone, setPhone]                     = React.useState('');
  const [tag, setTag]                         = React.useState(null);
  const [tagAltro, setTagAltro]               = React.useState('');
  const [allergeni, setAllergeni]             = React.useState(new Set());
  const [note, setNote]                       = React.useState('');
  const [showExtraDur, setShowExtraDur]       = React.useState(false);

  const prevServiceRef = React.useRef(npTimeToMin('20:00') < 17*60 ? 'pranzo' : 'cena');

  // Reset override tavolo quando cambia lo slot di ricerca
  const skipResetRef = React.useRef(false);
  React.useEffect(() => {
    if (skipResetRef.current) { skipResetRef.current = false; return; }
    setTavoloOverride(null); setShowTavoloList(false); setPickerIds(new Set());
  }, [time, coperti, dur, salaFilter]);

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
      setStep(1);
      setCoperti(initData?.coperti || 2);
      setDate('oggi');
      setTime(initTime);
      setDur(initData?.dur || npSmartDur(initTime));
      setSalaFilter(null); setShowSalaFilter(false);
      setConfirmedTime(null); setConfirmedTavolo(null);
      setShowTavoloList(false); setPickerIds(new Set());
      setNome(initData?.nome || ''); setPhone(initData?.phone || '');
      setTag(initData?.tag || null); setTagAltro('');
      setAllergeni(new Set()); setNote(initData?.noteText || '');
      prevServiceRef.current = npTimeToMin(initTime) < 17*60 ? 'pranzo' : 'cena';
      if (initData?.tableId) {
        const tbl = NP_TABLES.find(t => t.id === initData.tableId);
        if (tbl) { skipResetRef.current = true; setTavoloOverride({ tables:[tbl], total:tbl.p }); }
        else setTavoloOverride(null);
      } else {
        setTavoloOverride(null);
      }
      if (initData?.editMode) {
        const tbl = NP_TABLES.find(t => t.id === initData.tableId);
        const tav = tbl ? { tables:[tbl], total:tbl.p } : null;
        setConfirmedTime(initTime);
        setConfirmedTavolo(tav);
        setStep(2);
      }
    }
  }, [open]);

  const activeIds = React.useMemo(() =>
    salaFilter
      ? (NP_SALE.find(s => s.id === salaFilter)?.tableIds || [])
      : NP_TABLES.map(t => t.id),
    [salaFilter]
  );

  // Mini histogram data: ±2h window around selected time, 30-min slots
  const chartData = React.useMemo(() => {
    const res = window.SALA_V3_RES_DATA_GLOBAL || [];
    const total = activeIds.length;
    const centerMin = npTimeToMin(time);
    const startMin = Math.max(Math.floor((centerMin - 60) / 15) * 15, 11 * 60);
    const endMin = Math.min(centerMin + 61, 23 * 60);
    const fasce = [];
    for (let m = startMin; m < endMin; m += 15) {
      const occ = res
        .filter(r => r.status !== 'cancellata' && r.status !== 'noshow' && r.table)
        .filter(r => activeIds.includes(r.table))
        .filter(r => { const rs = npTimeToMin(r.time); return rs < m + 15 && rs + (r.dur || 90) > m; })
        .length;
      const hh = String(Math.floor(m / 60)).padStart(2, '0');
      const mm = String(m % 60).padStart(2, '0');
      fasce.push({ min: m, label: `${hh}:${mm}`, occ, total });
    }
    return fasce;
  }, [time, activeIds]);

  // Availability analysis for currently selected time + alternatives
  const slotInfo = React.useMemo(() => {
    const res = window.SALA_V3_RES_DATA_GLOBAL || [];
    const total = activeIds.length;
    const reqMin = npTimeToMin(time);
    const reqEnd = reqMin + dur;
    const occupatiAll = res
      .filter(r => r.status !== 'cancellata' && r.status !== 'noshow' && r.table)
      .filter(r => { const rs = npTimeToMin(r.time); return rs < reqEnd && rs + (r.dur || 90) > reqMin; })
      .map(r => r.table);
    const occupatiInSala = occupatiAll.filter(id => activeIds.includes(id));
    const ratio = total > 0 ? occupatiInSala.length / total : 0;
    const almostFull = ratio >= 0.8;
    const freeTables = NP_TABLES.filter(t => activeIds.includes(t.id) && !occupatiAll.includes(t.id));
    const combos = npFindCombinations(freeTables, coperti);
    const suggerito = combos[0] || null; // { tables, total }
    const alts = [];
    for (const t of NP_ORARI) {
      if (t === time) continue;
      const tMin = npTimeToMin(t);
      if (Math.abs(tMin - reqMin) > 180) continue;
      const tEnd = tMin + dur;
      const oAlt = res
        .filter(r => r.status !== 'cancellata' && r.status !== 'noshow' && r.table)
        .filter(r => { const rs = npTimeToMin(r.time); return rs < tEnd && rs + (r.dur || 90) > tMin; })
        .map(r => r.table);
      const ratioAlt = total > 0 ? oAlt.filter(id => activeIds.includes(id)).length / total : 0;
      const freeAlt = NP_TABLES.filter(tt => activeIds.includes(tt.id) && !oAlt.includes(tt.id));
      const comboAlt = npFindCombinations(freeAlt, coperti);
      if (comboAlt.length > 0 && ratioAlt < 0.8) alts.push({ time: t, combo: comboAlt[0], ratio: ratioAlt, dist: Math.abs(tMin - reqMin) });
    }
    alts.sort((a, b) => a.dist - b.dist);
    return { suggerito, almostFull, ratio, available: !!suggerito, alts: alts.slice(0, 3), tavoliIdonei: combos, freeTables };
  }, [time, dur, activeIds, coperti]);

  const toggleAllergene = (a) => setAllergeni(prev => {
    const n = new Set(prev); n.has(a) ? n.delete(a) : n.add(a); return n;
  });

  const effectiveTavolo = tavoloOverride ?? slotInfo?.suggerito ?? null;
  const confirmSlot = (t, tav) => { setConfirmedTime(t); setConfirmedTavolo(tav); setShowTavoloList(false); setStep(2); };

  const selMin = npTimeToMin(time);
  const totalTav = activeIds.length;
  // Bar area: container 88px, labels 22px → bar area = 66px, scaled to 64px height max
  const BAR_AREA = 64;
  const PAD_BOTTOM = 22;

  const renderStep1 = () => {
    const accentColor = slotInfo.almostFull ? '#92400E' : '#166534';
    const salaOpts = [{id:null, label:'Tutte'}, ...NP_SALE.map(s=>({id:s.id, label:s.label}))];
    return (
    <div style={{display:'flex', flexDirection:'column', paddingTop:6}}>
      {/* Parametri — unified card */}
      <div style={{
        border:'1px solid #E5E7EB', borderRadius:12, overflow:'hidden',
        marginBottom:12, background:'#fff',
      }}>
        {/* Riga primaria */}
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 64px'}}>
          <div style={{padding:'11px 13px', borderRight:'1px solid #F3F4F6'}}>
            <div style={{fontSize:10, fontWeight:700, color:'#6B7280', textTransform:'uppercase', letterSpacing:0.5, marginBottom:5}}>Data</div>
            <select value={date} onChange={e=>setDate(e.target.value)} style={npSelInline}>
              <option value="oggi">Ven 23 mag</option>
              <option value="sab">Sab 24 mag</option>
              <option value="dom">Dom 25 mag</option>
              <option value="lun">Lun 26 mag</option>
              <option value="mar">Mar 27 mag</option>
            </select>
          </div>
          <div style={{padding:'11px 13px', borderRight:'1px solid #F3F4F6'}}>
            <div style={{fontSize:10, fontWeight:700, color:'#6B7280', textTransform:'uppercase', letterSpacing:0.5, marginBottom:5}}>Ora</div>
            <select value={time} onChange={e=>setTime(e.target.value)} style={npSelInline}>
              {NP_ORARI.map(t=><option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div style={{padding:'11px 13px'}}>
            <div style={{fontSize:10, fontWeight:700, color:'#6B7280', textTransform:'uppercase', letterSpacing:0.5, marginBottom:5}}>Cop.</div>
            <select value={coperti} onChange={e=>setCoperti(+e.target.value)} style={npSelInline}>
              {[1,2,3,4,5,6,7,8,10,12].map(n=><option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        </div>
        {/* Riga secondaria — Durata */}
        <div style={{
          display:'flex', alignItems:'center', gap:8,
          padding:'9px 13px', borderTop:'1px solid #F3F4F6',
          background:'#F9FAFB', flexWrap:'wrap',
        }}>
          <span style={{fontSize:10, fontWeight:700, color:'#9CA3AF', textTransform:'uppercase', letterSpacing:0.5, marginRight:2}}>Durata</span>
          {(showExtraDur ? [...NP_DUR_OPTIONS, ...NP_DUR_EXTRA].sort((a,b)=>a-b) : NP_DUR_OPTIONS).map(d => (
            <button key={d} onClick={()=>setDur(d)} style={{
              padding:'4px 10px', borderRadius:999,
              fontSize:11.5, fontWeight: dur===d ? 700 : 500,
              cursor:'pointer', fontFamily:'inherit', border:'none',
              background: dur===d ? '#111827' : '#E9EBF0',
              color: dur===d ? '#fff' : '#6B7280',
              transition:'all 0.1s',
            }}>{npFmtDur(d)}</button>
          ))}
          <button onClick={()=>setShowExtraDur(s=>!s)} style={{
            padding:'4px 10px', borderRadius:999,
            fontSize:11.5, fontWeight:500,
            cursor:'pointer', fontFamily:'inherit', border:'none',
            background:'#E9EBF0', color:'#6B7280',
            transition:'all 0.1s',
          }}>{showExtraDur ? 'Meno ↑' : 'Altro ↓'}</button>
        </div>
      </div>
      {/* Sala filter — segmented */}
      <div style={{display:'inline-flex', background:'#F1F2F5', borderRadius:8, padding:3, marginBottom:16, alignSelf:'flex-start'}}>
        {salaOpts.map(opt => {
          const active = salaFilter === opt.id;
          return (
            <button key={String(opt.id)} onClick={()=>setSalaFilter(opt.id)} style={{
              padding:'5px 11px', borderRadius:6,
              background: active ? '#fff' : 'transparent',
              border:'none', cursor:'pointer', fontFamily:'inherit',
              fontSize:12, fontWeight: active ? 700 : 500,
              color: active ? '#111827' : '#6B7280',
              boxShadow: active ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition:'all 0.1s', whiteSpace:'nowrap',
            }}>{opt.label}</button>
          );
        })}
      </div>

      <NpDivider/>

      {/* Histogram */}
      <div style={{padding:'16px 0 10px'}}>
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14}}>
          <span style={{fontSize:14, fontWeight:500, color:'#374151'}}>
            {totalTav - Math.round(slotInfo.ratio * totalTav)} liberi su {totalTav}
            <span style={{marginLeft:6, fontSize:13, fontWeight:800, color: slotInfo.ratio >= 1 ? '#DC2626' : slotInfo.ratio >= 0.8 ? '#B45309' : '#374151'}}>
              {Math.round(slotInfo.ratio * 100)}% occupato
              {slotInfo.ratio >= 1 ? ' · Sala piena' : slotInfo.ratio >= 0.8 ? ' · Sala quasi piena' : ''}
            </span>
          </span>
          {salaFilter && (
            <span style={{fontSize:11, fontWeight:700, color:'#9CA3AF', textTransform:'uppercase', letterSpacing:0.4}}>
              {NP_SALE.find(s=>s.id===salaFilter)?.label}
            </span>
          )}
        </div>
        <div style={{position:'relative', height: BAR_AREA + PAD_BOTTOM, userSelect:'none'}}>
          <div style={{display:'flex', alignItems:'flex-end', height:'100%', gap:2, paddingBottom: PAD_BOTTOM}}>
            {chartData.map((f, i) => {
              const isSel = f.min === selMin;
              const isHov = hoveredBar === i;
              const load = totalTav > 0 ? f.occ / totalTav : 0;
              const barH = totalTav > 0 ? Math.max(load * BAR_AREA, f.occ > 0 ? 4 : 0) : 0;
              const barColor = isSel ? '#0F1115' : isHov ? '#374151' : load >= 0.7 ? '#64748B' : load >= 0.3 ? '#CBD5E1' : '#EAECF0';
              return (
                <div key={i}
                  onMouseEnter={() => setHoveredBar(i)}
                  onMouseLeave={() => setHoveredBar(null)}
                  style={{
                    flex:1, display:'flex', flexDirection:'column', alignItems:'center',
                    cursor:'default', position:'relative', height:'100%', justifyContent:'flex-end',
                  }}>
                  {(isSel || isHov) ? (
                    <div style={{
                      position:'absolute', bottom: Math.min(PAD_BOTTOM + barH + 3, BAR_AREA + PAD_BOTTOM - 14),
                      fontSize:10, fontWeight:800,
                      color: isHov && !isSel ? '#374151' : '#0F1115',
                    }}>{f.occ}</div>
                  ) : null}
                  <div style={{
                    width:'100%', height: Math.max(barH, isSel ? 3 : 0), marginBottom: PAD_BOTTOM,
                    borderRadius:'3px 3px 0 0', background: barColor, transition:'background 0.1s',
                  }}/>
                  <div style={{
                    position:'absolute', bottom:0, left:'50%', transform:'translateX(-50%)',
                    fontSize: isSel || isHov ? 10 : 9, fontWeight: isSel || isHov ? 800 : 400,
                    color: isSel ? '#0F1115' : isHov ? '#374151' : '#D1D5DB', whiteSpace:'nowrap',
                  }}>{f.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <NpDivider/>

      {/* Slot status */}
      <div style={{padding:'16px 0 6px', display:'flex', flexDirection:'column', gap:10}}>
        {slotInfo.available ? (
          <div style={{display:'flex', flexDirection:'column'}}>
            <div style={{
              padding:'14px 16px',
              borderRadius: showTavoloList ? '12px 12px 0 0' : 12,
              background: slotInfo.almostFull ? '#FFFBEB' : '#F0FDF4',
              border: `1px solid ${slotInfo.almostFull ? '#FDE68A' : '#BBF7D0'}`,
            }}>
              <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10}}>
                <div style={{display:'flex', alignItems:'center', gap:10}}>
                  <div style={{
                    width:30, height:30, borderRadius:'50%',
                    background: slotInfo.almostFull ? '#B45309' : '#166534',
                    display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
                  }}>
                    {slotInfo.almostFull
                      ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><path d="M12 9v4M12 17h.01"/></svg>
                      : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13L9 17L19 7"/></svg>
                    }
                  </div>
                  <div>
                    <div style={{fontSize:14, fontWeight:700, color:'#111827', lineHeight:1.2}}>
                      {effectiveTavolo ? npFmtTavoli(effectiveTavolo.tables) : ''} · {time}
                    </div>
                  </div>
                </div>
                <button onClick={()=>confirmSlot(time, effectiveTavolo)} style={{
                  padding:'9px 20px', borderRadius:999,
                  background: slotInfo.almostFull ? '#B45309' : '#166534',
                  color:'#fff', border:'none',
                  fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit', flexShrink:0,
                }}>Conferma →</button>
              </div>
              <div style={{display:'flex', alignItems:'center', gap:8}}>
                <button onClick={()=>{
                  if (!showTavoloList) setPickerIds(new Set((effectiveTavolo?.tables||[]).map(t=>t.id)));
                  setShowTavoloList(p=>!p);
                }} style={{
                  background:'none', border:'none', cursor:'pointer', padding:0,
                  fontSize:12.5, fontWeight:600,
                  color: slotInfo.almostFull ? '#92400E' : '#166534',
                  fontFamily:'inherit',
                }}>
                  {showTavoloList ? 'Chiudi ↑' : 'Cambia tavolo ↓'}
                </button>
              </div>
            </div>
            {showTavoloList && (
              <div style={{
                border:`1px solid ${slotInfo.almostFull ? '#FDE68A' : '#BBF7D0'}`,
                borderTop:'none', borderRadius:'0 0 12px 12px', background:'#fff',
              }}>
                <div style={{padding:'12px 18px 8px', fontSize:11, fontWeight:700, color:'#9CA3AF', textTransform:'uppercase', letterSpacing:0.5}}>
                  Seleziona tavoli
                </div>
                <div style={{display:'flex', flexWrap:'wrap', gap:8, padding:'0 18px 12px'}}>
                  {(slotInfo.freeTables||[]).map(t => {
                    const sel = pickerIds.has(t.id);
                    const chipAccent = slotInfo.almostFull ? '#B45309' : '#166534';
                    return (
                      <button key={t.id} onClick={()=>{
                        setPickerIds(prev => {
                          const n = new Set(prev);
                          n.has(t.id) ? n.delete(t.id) : n.add(t.id);
                          const selTables = (slotInfo.freeTables||[]).filter(x => n.has(x.id));
                          const selTotal = selTables.reduce((s,x)=>s+x.p,0);
                          if (selTables.length > 0 && selTotal >= coperti) setTavoloOverride({tables:selTables, total:selTotal});
                          else if (selTables.length === 0) setTavoloOverride(null);
                          return n;
                        });
                      }} style={{
                        padding:'7px 13px', borderRadius:999,
                        fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit',
                        background: sel ? chipAccent : '#F4F5F7',
                        color: sel ? '#fff' : '#374151',
                        border: sel ? `1.5px solid ${chipAccent}` : '1.5px solid #E5E7EB',
                        transition:'all 0.1s',
                      }}>
                        Tav. {t.id} <span style={{fontWeight:400, opacity:0.6, fontSize:11, marginLeft:3}}>({t.p}p)</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div style={{
            display:'flex', alignItems:'center', gap:12,
            padding:'14px 16px', borderRadius:12,
            background:'#FEF2F2', border:'1px solid #FECACA',
          }}>
            <div style={{
              width:30, height:30, borderRadius:'50%',
              background:'#DC2626',
              display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
            </div>
            <div>
              <div style={{fontSize:14, fontWeight:700, color:'#111827'}}>Sala piena alle {time}</div>
              <div style={{fontSize:12.5, color:'#6B7280', marginTop:2}}>
                Nessun tavolo per {coperti} {coperti===1?'coperto':'coperti'}{slotInfo.alts.length > 0 ? ' — vedi slot alternativi' : ''}
              </div>
            </div>
          </div>
        )}
        {!slotInfo.available && slotInfo.alts.length > 0 && (
          <div style={{display:'flex', flexDirection:'column', gap:6, marginTop:2}}>
            <div style={{fontSize:11, fontWeight:700, color:'#9CA3AF', textTransform:'uppercase', letterSpacing:0.4, marginBottom:2}}>Slot alternativi</div>
            {slotInfo.alts.map((alt, i) => (
              <div key={i} style={{
                display:'flex', alignItems:'center', justifyContent:'space-between',
                padding:'13px 16px', borderRadius:10, border:'1px solid #E5E7EB', background:'#fff',
              }}>
                <div>
                  <div style={{fontSize:14, fontWeight:600, color:'#111827'}}>
                    {alt.time} · {npFmtTavoli(alt.combo.tables)}
                  </div>
                  <div style={{fontSize:12, color:'#9CA3AF', marginTop:2}}>
                    {alt.combo.total} posti · {totalTav - Math.round(alt.ratio * totalTav)} liberi su {totalTav}
                  </div>
                </div>
                <button onClick={()=>{setTime(alt.time);confirmSlot(alt.time,alt.combo);}} style={{
                  padding:'8px 16px', borderRadius:8,
                  background:'#111827', color:'#fff', border:'none',
                  fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit', flexShrink:0,
                }}>Conferma →</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    );
  };

  const renderStep2 = () => (
    <div style={{display:'flex', flexDirection:'column'}}>

      {/* Slot banner */}
      <div style={{
        borderRadius:12, padding:'14px 16px', marginTop:16, marginBottom:20,
        background:'#F0FDF4', border:'1px solid #BBF7D0',
        display:'flex', alignItems:'center', justifyContent:'space-between',
      }}>
        <div style={{display:'flex', alignItems:'center', gap:10}}>
          <div style={{
            width:30, height:30, borderRadius:'50%', background:'#166534', flexShrink:0,
            display:'flex', alignItems:'center', justifyContent:'center',
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13L9 17L19 7"/></svg>
          </div>
          <div>
            <div style={{fontSize:14, fontWeight:700, color:'#111827', lineHeight:1.2}}>{confirmedTime}</div>
            <div style={{fontSize:12.5, color:'#6B7280', marginTop:2}}>
              {confirmedTavolo ? npFmtTavoli(confirmedTavolo.tables) : ''} · {coperti} {coperti===1?'coperto':'coperti'} · {npFmtDur(dur)}
            </div>
          </div>
        </div>
        <button onClick={()=>setStep(1)} style={{
          padding:'7px 14px', borderRadius:8,
          background:'#fff', color:'#374151',
          border:'1px solid #D1FAE5',
          fontSize:12.5, fontWeight:600, cursor:'pointer', fontFamily:'inherit',
        }}>← Modifica</button>
      </div>

      {/* Cliente — iOS list card */}
      <div style={{background:'#fff', borderRadius:12, border:'1px solid #E5E7EB', overflow:'hidden', marginBottom:16}}>
        <div style={{display:'flex', alignItems:'center', minHeight:48, padding:'0 16px', borderBottom:'1px solid #F3F4F6'}}>
          <span style={{fontSize:14, color:'#9CA3AF', width:88, flexShrink:0}}>Nome</span>
          <input value={nome} onChange={e=>setNome(e.target.value)}
            placeholder="Rossi, Famiglia Bianchi..."
            style={{flex:1, border:'none', outline:'none', fontSize:14, color:'#111827', fontFamily:'inherit', background:'transparent', padding:'13px 0'}}
            autoFocus/>
        </div>
        <div style={{display:'flex', alignItems:'center', minHeight:48, padding:'0 16px'}}>
          <span style={{fontSize:14, color:'#9CA3AF', width:88, flexShrink:0}}>Telefono</span>
          <input value={phone} onChange={e=>setPhone(e.target.value)}
            placeholder="+39 ..."
            style={{flex:1, border:'none', outline:'none', fontSize:14, color:'#111827', fontFamily:'inherit', background:'transparent', padding:'13px 0'}}/>
        </div>
      </div>

      {/* Occasione */}
      <div style={{marginBottom:16}}>
        <div style={{fontSize:12, fontWeight:600, color:'#9CA3AF', letterSpacing:0.3, marginBottom:10}}>Occasione</div>
        <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
          {NP_TAG.map(t => (
            <button key={t.id} onClick={()=>setTag(tag===t.id?null:t.id)} style={{
              padding:'8px 16px', borderRadius:999,
              fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit',
              border: tag===t.id ? 'none' : '1px solid #E5E7EB',
              background: tag===t.id ? '#111827' : '#fff',
              color: tag===t.id ? '#fff' : '#374151',
              transition:'all 0.1s',
            }}>{t.label}</button>
          ))}
        </div>
        {tag==='altro' && (
          <input value={tagAltro} onChange={e=>setTagAltro(e.target.value)}
            placeholder="Descrivi l'occasione..."
            style={{...npInput, marginTop:10}}/>
        )}
      </div>

      {/* Allergeni */}
      <div style={{marginBottom:16}}>
        <div style={{fontSize:12, fontWeight:600, color:'#9CA3AF', letterSpacing:0.3, marginBottom:10}}>Allergeni</div>
        <div style={{display:'flex', gap:6, flexWrap:'wrap'}}>
          {NP_ALLERGENI.map(a => {
            const sel = allergeni.has(a);
            return (
              <button key={a} onClick={()=>toggleAllergene(a)} style={{
                padding:'6px 12px', borderRadius:7,
                fontSize:12.5, fontWeight:600, cursor:'pointer', fontFamily:'inherit',
                border:'none', transition:'all 0.1s',
                background: sel ? '#B91C1C' : '#F1F5F9',
                color: sel ? '#fff' : '#374151',
              }}>{a}</button>
            );
          })}
        </div>
      </div>

      {/* Note */}
      <div style={{marginBottom:20}}>
        <div style={{fontSize:12, fontWeight:600, color:'#9CA3AF', letterSpacing:0.3, marginBottom:10}}>Note</div>
        <div style={{background:'#fff', borderRadius:12, border:'1px solid #E5E7EB', overflow:'hidden'}}>
          <textarea value={note} onChange={e=>setNote(e.target.value)}
            placeholder="Note aggiuntive..." rows={3}
            style={{
              display:'block', width:'100%', padding:'14px 16px',
              border:'none', outline:'none', resize:'vertical', minHeight:72,
              fontSize:14, color:'#111827', fontFamily:'inherit', background:'transparent',
              boxSizing:'border-box',
            }}/>
        </div>
      </div>

      {/* Riepilogo — solo se ci sono dati */}
      {(nome.trim()||phone.trim()||tag||allergeni.size>0||note.trim()) && (
        <div style={{
          background:'#F9FAFB', borderRadius:12, border:'1px solid #E5E7EB',
          padding:'14px 16px', marginBottom:4,
          display:'flex', flexDirection:'column', gap:8,
        }}>
          {[
            { label:'Slot',      value: confirmedTavolo ? `${confirmedTime} · ${npFmtTavoli(confirmedTavolo.tables)} · ${coperti} ${coperti===1?'coperto':'coperti'} · ${npFmtDur(dur)}` : '' },
            { label:'Cliente',   value: nome.trim() ? (phone.trim() ? `${nome} · ${phone}` : nome) : (phone.trim()||null) },
            { label:'Occasione', value: tag ? (tag==='altro'?(tagAltro.trim()||'Altro'):NP_TAG.find(t=>t.id===tag)?.label) : null },
            { label:'Allergeni', value: allergeni.size > 0 ? [...allergeni].join(', ') : null },
            { label:'Note',      value: note.trim()||null },
          ].filter(r=>r.value).map(r=>(
            <div key={r.label} style={{display:'flex', gap:10, alignItems:'baseline'}}>
              <span style={{fontSize:11, fontWeight:700, color:'#9CA3AF', minWidth:64, textTransform:'uppercase', letterSpacing:0.5, flexShrink:0}}>{r.label}</span>
              <span style={{fontSize:13, color:'#374151', lineHeight:1.4}}>{r.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <PnModal open={open} onClose={onClose}
      title={initData?.editMode ? 'Modifica prenotazione' : 'Nuova prenotazione'} width={560}
      footer={step === 2 ? (
        <PnButton variant="primary" disabled={!nome.trim()}>
          {initData?.editMode ? 'Salva modifiche' : 'Crea prenotazione'}
        </PnButton>
      ) : null}
    >
      {step === 1 ? renderStep1() : renderStep2()}
    </PnModal>
  );
}

function SaField({ label, children }) {
  return (
    <label style={{display:'flex', flexDirection:'column', gap: 6}}>
      <span style={{fontSize: 11.5, fontWeight: 700, color: PN.MUTED, textTransform:'uppercase', letterSpacing: 0.4}}>{label}</span>
      {children}
    </label>
  );
}
function SaInput({ placeholder }) {
  return (
    <input placeholder={placeholder} style={{
      padding:'10px 12px', borderRadius: 10,
      border:`1px solid ${PN.BORDER}`, background: PN.WHITE,
      fontSize: 13, color: PN.TEXT, fontFamily:'inherit',
      outline:'none',
    }}/>
  );
}

window.SalaModalAggiungi = SalaModalAggiungi;
window.SalaModalConti = SalaModalConti;
window.SalaModalPagamento = SalaModalPagamento;
window.SalaModalNuova = SalaModalNuova;
