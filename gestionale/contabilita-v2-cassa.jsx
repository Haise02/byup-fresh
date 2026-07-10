// Tab Cassa v2 — elenco chiusure cassa (storico quadrature)

// Storico chiusure: per ogni giornata il totale incassato, di cui contanti e non contanti.
const CASH_CLOSURES = [
  { id:'cc-12', date:'12/03/2025', contanti: 642.30, nonContanti: 1180.50, iva10: 142.80, iva22: 38.40 },
  { id:'cc-11', date:'11/03/2025', contanti: 528.00, nonContanti: 1342.10, iva10: 156.20, iva22: 24.10 },
  { id:'cc-10', date:'10/03/2025', contanti: 711.40, nonContanti:  980.75, iva10: 128.50, iva22: 19.80 },
  { id:'cc-09', date:'09/03/2025', contanti: 489.20, nonContanti: 1520.00, iva10:  96.30, iva22: 84.60 },
  { id:'cc-08', date:'08/03/2025', contanti: 856.90, nonContanti: 2104.30, iva10: 214.70, iva22: 52.30 },
  { id:'cc-07', date:'07/03/2025', contanti: 402.10, nonContanti:  765.40, iva10:  61.40, iva22: 71.90 },
];

// gg/mm/aaaa da un Date
function ccFmtDate(d) {
  return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
}

// Calendario a comparsa per selezionare un giorno
function CassaDatePicker({ selected, onPick, onClear }) {
  const init = selected ? new Date(selected.split('/').reverse().join('-')) : new Date();
  const [view, setView] = React.useState(() => { const d = new Date(init); d.setDate(1); return d; });
  const monthLabel = view.toLocaleDateString('it-IT', {month:'long', year:'numeric'});

  const firstDow = (new Date(view.getFullYear(), view.getMonth(), 1).getDay() + 6) % 7;
  const daysInMonth = new Date(view.getFullYear(), view.getMonth()+1, 0).getDate();
  const grid = [];
  for (let i = 0; i < firstDow; i++) grid.push(null);
  for (let n = 1; n <= daysInMonth; n++) grid.push(new Date(view.getFullYear(), view.getMonth(), n));
  while (grid.length % 7 !== 0) grid.push(null);

  const goPrev = () => { const d = new Date(view); d.setMonth(d.getMonth()-1); setView(d); };
  const goNext = () => { const d = new Date(view); d.setMonth(d.getMonth()+1); setView(d); };

  const navBtn = {
    width:28, height:28, borderRadius:6, background:'#fff',
    border:`1px solid ${PN.BORDER}`, cursor:'pointer', fontFamily:'inherit',
    color: PN.TEXT, fontSize:14, display:'flex', alignItems:'center', justifyContent:'center',
  };

  return (
    <div onClick={e=>e.stopPropagation()} style={{
      position:'absolute', top:'100%', right:0, marginTop:8, zIndex:60,
      width:280, padding:14, background:'#fff', borderRadius:12,
      border:`1px solid ${PN.BORDER}`, boxShadow:'0 12px 36px rgba(15,17,21,0.14)',
    }}>
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10}}>
        <button onClick={goPrev} style={navBtn}>‹</button>
        <span style={{fontSize: C.T_SM, fontWeight:700, color: PN.TEXT, textTransform:'capitalize'}}>{monthLabel}</span>
        <button onClick={goNext} style={navBtn}>›</button>
      </div>
      <div style={{display:'grid', gridTemplateColumns:'repeat(7, 1fr)', gap:4, marginBottom:4}}>
        {['L','M','M','G','V','S','D'].map((d,i) => (
          <span key={i} style={{fontSize:10, fontWeight:700, color: PN.MUTED, textAlign:'center', padding:2}}>{d}</span>
        ))}
      </div>
      <div style={{display:'grid', gridTemplateColumns:'repeat(7, 1fr)', gap:4}}>
        {grid.map((day,i) => {
          if (!day) return <span key={i}/>;
          const iso = ccFmtDate(day);
          const isSel = iso === selected;
          return (
            <button key={i} onClick={() => onPick(iso)} style={{
              padding:'7px 0', borderRadius:7, border:'none', fontFamily:'inherit',
              background: isSel ? PN.TEXT : 'transparent',
              color: isSel ? '#fff' : PN.TEXT,
              fontSize: C.T_SM, fontWeight: isSel ? 700 : 500, cursor:'pointer',
            }}>{day.getDate()}</button>
          );
        })}
      </div>
      {selected && (
        <button onClick={onClear} style={{
          width:'100%', marginTop:10, padding:'8px', borderRadius:8,
          background: PN.WHITE, border:`1px solid ${PN.BORDER}`,
          fontSize: C.T_XS, fontWeight:700, color: PN.MUTED, cursor:'pointer', fontFamily:'inherit',
        }}>Mostra tutte</button>
      )}
    </div>
  );
}

function ContCassa({ cassaOpen = false, setCassaOpen }) {
  const [pickerOpen, setPickerOpen] = React.useState(false);
  const [selDate, setSelDate] = React.useState(null); // 'gg/mm/aaaa' o null
  const pickerRef = React.useRef(null);

  // Stato apertura/chiusura cassa
  const [apriModal, setApriModal] = React.useState(false);
  const [chiudiModal, setChiudiModal] = React.useState(false);
  const [fondoCassa, setFondoCassa] = React.useState(null);
  const [aperturaOra, setAperturaOra] = React.useState(null);

  function handleCassaClick() {
    if (cassaOpen) { setChiudiModal(true); } else { setApriModal(true); }
  }
  function confermaApertura(amount) {
    setFondoCassa(amount);
    setAperturaOra(new Date().toLocaleTimeString('it-IT', {hour:'2-digit', minute:'2-digit'}));
    setCassaOpen && setCassaOpen(true);
    setApriModal(false);
  }
  function confermaChiusura() {
    setCassaOpen && setCassaOpen(false);
    setFondoCassa(null);
    setAperturaOra(null);
    setChiudiModal(false);
  }

  React.useEffect(() => {
    if (!pickerOpen) return;
    const h = (e) => { if (pickerRef.current && !pickerRef.current.contains(e.target)) setPickerOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [pickerOpen]);

  const allRows = CASH_CLOSURES.map(c => ({ ...c, totale: c.contanti + c.nonContanti }));
  const rows = selDate ? allRows.filter(r => r.date === selDate) : allRows;
  const totIncassato = rows.reduce((s,r)=>s+r.totale,0);

  const cols = '1.1fr 1fr 1fr 1fr 1fr 1fr';

  return (
    <div style={{display:'flex', flexDirection:'column', gap: 16}}>
      {/* Banner stato cassa */}
      <div style={{
        display:'flex', alignItems:'center', gap: 14,
        padding: '14px 18px',
        background: cassaOpen ? '#ECFDF5' : '#FEF2F2',
        border: `1px solid ${cassaOpen ? '#A7F3D0' : '#FECACA'}`,
        borderRadius: C.R_MD,
      }}>
        <span style={{
          width:10, height:10, borderRadius:'50%',
          background: cassaOpen ? PN.GREEN : PN.RED,
          boxShadow: `0 0 0 4px ${cassaOpen ? '#A7F3D055' : '#FECACA55'}`,
        }}/>
        <div style={{flex:1}}>
          <div style={{fontSize: C.T_SM, fontWeight: 700, color: cassaOpen ? '#065F46' : '#991B1B'}}>
            {cassaOpen ? 'Cassa aperta' : 'Cassa chiusa'}
          </div>
          <div style={{fontSize: C.T_XS, color: cassaOpen ? '#047857' : '#B91C1C', marginTop: 2}}>
            {cassaOpen
              ? `Aperta alle ${aperturaOra || '09:30'} · Da: Marco${fondoCassa != null ? ` · Fondo €${fondoCassa.toFixed(2)}` : ''}`
              : 'Quadratura completata correttamente'}
          </div>
        </div>
        <button
          onClick={handleCassaClick}
          className="cassa-btn"
          style={{
            padding:'9px 18px', borderRadius: C.R_PILL,
            background: cassaOpen ? PN.TEXT : '#059669', color:'#fff', border:'none',
            fontSize: C.T_SM, fontWeight: 700, cursor:'pointer', fontFamily:'inherit',
            animation: cassaOpen ? 'none' : 'cassaPulse 2s ease-out infinite',
          }}>{cassaOpen ? 'Chiudi cassa' : 'Apri cassa'}</button>
      </div>

      {/* Popup apertura cassa */}
      <ApriCassaModal
        open={apriModal}
        onClose={() => setApriModal(false)}
        onConfirm={confermaApertura}
      />

      {/* Popup conferma chiusura cassa */}
      <ChiudiCassaModal
        open={chiudiModal}
        fondoCassa={fondoCassa}
        aperturaOra={aperturaOra}
        onClose={() => setChiudiModal(false)}
        onConfirm={confermaChiusura}
      />

      {/* Card chiusure */}
      <div style={{background: PN.WHITE, border:`1px solid ${PN.BORDER}`, borderRadius: C.R_MD, padding: 20}}>
        <div style={{display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom: 16, flexWrap:'wrap', gap: 12}}>
          <div>
            <div style={{fontSize: C.T_MD, fontWeight: 700, color: PN.TEXT}}>Chiusure cassa</div>
            <div style={{fontSize: C.T_SM, color: PN.MUTED, marginTop: 2}}>{rows.length} chiusure · €{totIncassato.toFixed(2)} incassati</div>
          </div>
        </div>

        {/* Search + actions */}
        <div style={{display:'flex', gap: 10, marginBottom: 14, flexWrap:'wrap'}}>
          <div style={{
            flex:'1 1 240px', display:'flex', alignItems:'center', gap: 8,
            padding:'9px 12px', border:`1px solid ${PN.BORDER}`, borderRadius: C.R_SM,
            background: PN.WHITE,
          }}>
            <span style={{color: PN.MUTED}}><Ic.search size={15}/></span>
            <input placeholder="Cerca per data…" style={{
              flex:1, border:'none', outline:'none', fontSize: C.T_SM, fontFamily:'inherit',
            }}/>
          </div>
          <div ref={pickerRef} style={{position:'relative'}}>
            <button onClick={() => setPickerOpen(o => !o)} style={iconBtn}>
              <Ic.calendar size={14}/> {selDate || 'Filtra per data'}
            </button>
            {pickerOpen && (
              <CassaDatePicker
                selected={selDate}
                onPick={(iso) => { setSelDate(iso); setPickerOpen(false); }}
                onClear={() => { setSelDate(null); setPickerOpen(false); }}
              />
            )}
          </div>
        </div>

        {/* Tabella chiusure */}
        <div style={{borderRadius: C.R_SM, overflow:'hidden', border:`1px solid ${PN.BORDER}`}}>
          <div style={{
            display:'grid', gridTemplateColumns: cols,
            padding:'10px 14px', background: C.TH_BG,
            fontSize: C.T_XS, fontWeight: 700, color: C.TH_TEXT,
            textTransform:'uppercase', letterSpacing: 0.5,
          }}>
            <span>Data</span>
            <span style={{textAlign:'right'}}>Totale incassato</span>
            <span style={{textAlign:'right'}}>IVA 10%</span>
            <span style={{textAlign:'right'}}>IVA 22%</span>
            <span style={{textAlign:'right'}}>Contanti</span>
            <span style={{textAlign:'right'}}>Carta e digitale</span>
          </div>
          {rows.map((r,i) => (
            <div key={r.id} style={{
              display:'grid', gridTemplateColumns: cols,
              padding:'12px 14px', alignItems:'center',
              fontSize: C.T_SM, color: PN.TEXT,
              borderTop: i===0 ? 'none' : `1px solid ${PN.BORDER_SOFT}`,
              background: PN.WHITE,
            }}>
              <span style={{display:'flex', alignItems:'center', gap: 8, fontVariantNumeric:'tabular-nums'}}>
                <span style={{color: PN.MUTED}}><Ic.calendar size={14}/></span>
                {r.date}
              </span>
              <span style={{textAlign:'right', fontWeight:700, fontVariantNumeric:'tabular-nums', fontSize: C.T_MD, letterSpacing: -0.2}}>€ {r.totale.toFixed(2)}</span>
              <span style={{textAlign:'right', fontVariantNumeric:'tabular-nums'}}>€ {r.iva10.toFixed(2)}</span>
              <span style={{textAlign:'right', fontVariantNumeric:'tabular-nums'}}>€ {r.iva22.toFixed(2)}</span>
              <span style={{textAlign:'right', fontVariantNumeric:'tabular-nums'}}>€ {r.contanti.toFixed(2)}</span>
              <span style={{textAlign:'right', fontVariantNumeric:'tabular-nums'}}>€ {r.nonContanti.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Reusable styles & components ───────────────────
const iconBtn = {
  padding:'9px 14px', background: PN.WHITE, border:`1px solid ${PN.BORDER}`,
  borderRadius: C.R_SM, fontSize: C.T_SM, fontWeight: 600, color: PN.TEXT,
  cursor:'pointer', fontFamily:'inherit', display:'inline-flex', alignItems:'center', gap: 8,
};
const primaryBtn = {
  padding:'9px 14px', background: PN.TEXT, border:'none',
  borderRadius: C.R_SM, fontSize: C.T_SM, fontWeight: 700, color:'#fff',
  cursor:'pointer', fontFamily:'inherit', display:'inline-flex', alignItems:'center', gap: 8,
};
const iconOnlyBtn = {
  background:'transparent', border:`1px solid ${PN.BORDER}`,
  borderRadius: C.R_SM, padding:'6px 9px', cursor:'pointer',
  color: PN.MUTED, display:'inline-flex', alignItems:'center', justifyContent:'center',
};
window.iconBtn = iconBtn;
window.primaryBtn = primaryBtn;
window.iconOnlyBtn = iconOnlyBtn;

function FilterChip({ active, onClick, label, count }) {
  return (
    <button onClick={onClick} style={{
      display:'inline-flex', alignItems:'center', gap: 6,
      padding:'7px 14px',
      background: active ? PN.TEXT : PN.WHITE,
      border: `1px solid ${active ? PN.TEXT : PN.BORDER}`,
      color: active ? '#fff' : PN.TEXT,
      borderRadius: C.R_PILL, fontSize: C.T_SM, fontWeight: 600,
      cursor:'pointer', fontFamily:'inherit',
    }}>
      {label}
      {count != null && <span style={{
        background: active ? 'rgba(255,255,255,0.2)' : C.SURF_ALT,
        color: active ? '#fff' : PN.MUTED,
        padding:'1px 8px', borderRadius: C.R_PILL, fontSize: C.T_XS, fontWeight: 700,
      }}>{count}</span>}
    </button>
  );
}
window.FilterChip = FilterChip;
window.ContCassa = ContCassa;
