// Tab Costi v2 — icone SVG, header tabella neutro, chip categorie unificate

function ContCosti({ openNewCost }) {
  const [selected, setSelected] = React.useState(new Set());
  const [filterCat, setFilterCat] = React.useState('all');

  // Mapping categorie → SVG icon (no emoji)
  const catMeta = {
    affitti:   { icon: Ic.home,    bg:'#FEF3C7', fg:'#92400E' },
    personale: { icon: Ic.users,   bg:'#DBEAFE', fg:'#1E40AF' },
    materie:   { icon: Ic.package, bg:'#FECACA', fg:'#991B1B' },
    servizi:   { icon: Ic.tools,   bg:'#E0E7FF', fg:'#3730A3' },
    altro:     { icon: Ic.list,    bg:'#E5E7EB', fg:'#374151' },
  };

  const today = new Date('2026-01-12');
  const in7days = new Date('2026-01-19');
  const upcoming = COSTS_DATA.filter(c => {
    const d = new Date(c.next);
    return c.status !== 'paid' && d >= today && d <= in7days;
  });
  const overdue = COSTS_DATA.filter(c => c.status === 'overdue');
  const totalAlert = overdue.reduce((s,c)=>s+c.amount,0) + upcoming.reduce((s,c)=>s+c.amount,0);

  const filtered = COSTS_DATA.filter(c => filterCat==='all' || c.cat===filterCat);
  const grouped = {};
  filtered.forEach(c => {
    const d = new Date(c.next);
    const k = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
    if (!grouped[k]) grouped[k] = { label: d.toLocaleDateString('it-IT', {month:'long', year:'numeric'}), items: [] };
    grouped[k].items.push(c);
  });
  const groupKeys = Object.keys(grouped).sort();

  const toggle = (id) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  const fmt = (d) => {
    const dt = new Date(d);
    return `${String(dt.getDate()).padStart(2,'0')}/${String(dt.getMonth()+1).padStart(2,'0')}/${dt.getFullYear()}`;
  };

  return (
    <div style={{display:'flex', flexDirection:'column', gap: 16}}>
      {/* Smart insight + Alert banner */}
      {(overdue.length > 0 || upcoming.length > 0) && (
        <div style={{
          display:'flex', alignItems:'center', gap: 14,
          padding: '14px 18px',
          background:'#FFFBEB', border:`1px solid ${PN.AMBER_SOFT}`,
          borderRadius: C.R_MD,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: C.R_SM,
            background: PN.AMBER_SOFT, color: PN.AMBER,
            display:'grid', placeItems:'center',
          }}><Ic.warn size={18}/></div>
          <div style={{flex:1}}>
            <div style={{fontSize: C.T_SM, fontWeight: 700, color: '#78350F'}}>
              {overdue.length} scaduti · {upcoming.length} in scadenza nei prossimi 7 giorni
            </div>
            <div style={{fontSize: C.T_XS, color:'#92400E', marginTop: 2}}>
              Totale da gestire: <strong style={{fontVariantNumeric:'tabular-nums'}}>€ {totalAlert.toFixed(2)}</strong>
            </div>
          </div>
          <button style={{
            padding:'8px 16px', background: PN.AMBER, color:'#fff', border:'none',
            borderRadius: C.R_PILL, fontSize: C.T_SM, fontWeight: 700, cursor:'pointer',
            fontFamily:'inherit', display:'inline-flex', alignItems:'center', gap: 6,
          }}>Vedi dettaglio <Ic.chevronR size={12} stroke={2.4}/></button>
        </div>
      )}

      {/* Categorie filter — pattern chip unificato */}
      <div style={{display:'flex', flexWrap:'wrap', gap: 8}}>
        <FilterChip active={filterCat==='all'} onClick={() => setFilterCat('all')} label="Tutte" count={COSTS_DATA.length}/>
        {COST_CATEGORIES.map(c => {
          const m = catMeta[c.id];
          const I = m.icon;
          const active = filterCat===c.id;
          return (
            <button key={c.id} onClick={() => setFilterCat(c.id)} style={{
              display:'inline-flex', alignItems:'center', gap: 6,
              padding:'7px 14px',
              background: active ? PN.TEXT : PN.WHITE,
              border: `1px solid ${active ? PN.TEXT : PN.BORDER}`,
              color: active ? '#fff' : PN.TEXT,
              borderRadius: C.R_PILL, fontSize: C.T_SM, fontWeight: 600,
              cursor:'pointer', fontFamily:'inherit',
            }}>
              <span style={{color: active ? '#fff' : m.fg}}><I size={13}/></span>
              {c.label}
              <span style={{
                background: active ? 'rgba(255,255,255,0.2)' : C.SURF_ALT,
                color: active ? '#fff' : PN.MUTED,
                padding:'1px 8px', borderRadius: C.R_PILL, fontSize: C.T_XS, fontWeight: 700,
              }}>{COSTS_DATA.filter(x => x.cat===c.id).length}</span>
            </button>
          );
        })}
      </div>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div style={{
          display:'flex', alignItems:'center', gap: 12,
          padding: '10px 16px',
          background: PN.TEXT, color:'#fff', borderRadius: C.R_MD,
          boxShadow:'0 8px 22px rgba(15,17,21,0.18)',
        }}>
          <strong style={{fontSize: C.T_SM}}>{selected.size} selezionati</strong>
          <span style={{fontSize: C.T_XS, opacity:0.7}}>· €{filtered.filter(c => selected.has(c.id)).reduce((s,c)=>s+c.amount,0).toFixed(2)}</span>
          <div style={{flex:1}}/>
          <button style={{padding:'6px 14px', background:'rgba(255,255,255,0.12)', color:'#fff', border:'1px solid rgba(255,255,255,0.2)', borderRadius: C.R_PILL, fontSize: C.T_XS, fontWeight: 700, cursor:'pointer', fontFamily:'inherit', display:'inline-flex', alignItems:'center', gap: 6}}><Ic.check size={12} stroke={2.4}/> Segna come pagati</button>
          <button style={{padding:'6px 14px', background:'rgba(255,255,255,0.12)', color:'#fff', border:'1px solid rgba(255,255,255,0.2)', borderRadius: C.R_PILL, fontSize: C.T_XS, fontWeight: 700, cursor:'pointer', fontFamily:'inherit', display:'inline-flex', alignItems:'center', gap: 6}}><Ic.upload size={12}/> Esporta</button>
          <button onClick={() => setSelected(new Set())} style={{padding:'6px 8px', background:'transparent', color:'#fff', border:'none', cursor:'pointer', fontFamily:'inherit', display:'flex'}}><Ic.close size={14}/></button>
        </div>
      )}

      {/* Section header + new cost button */}
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap: 12}}>
        <div>
          <div style={{fontSize: C.T_MD, fontWeight: 700, color: PN.TEXT}}>Costi della tua attività</div>
          <div style={{fontSize: C.T_SM, color: PN.MUTED, marginTop: 2}}>{filtered.length} voci · raggruppate per mese di scadenza</div>
        </div>
        <button onClick={openNewCost} style={{
          padding:'10px 18px', background: PN.TEXT, color:'#fff', border:'none',
          borderRadius: C.R_SM, fontSize: C.T_SM, fontWeight: 700, cursor:'pointer',
          fontFamily:'inherit', display:'inline-flex', alignItems:'center', gap: 8,
        }}>
          <Ic.plus size={14} stroke={2.4}/> Nuovo costo
        </button>
      </div>

      {filtered.length === 0 && (
        <div style={{padding:'40px 20px', textAlign:'center', background: PN.WHITE, border:`1px solid ${PN.BORDER}`, borderRadius: C.R_MD}}>
          <div style={{display:'inline-flex', padding: 14, borderRadius:'50%', background: C.SURF_ALT, color: PN.MUTED, marginBottom: 10}}>
            <Ic.invoice size={28}/>
          </div>
          <div style={{fontSize: C.T_SM, fontWeight: 700, color: PN.TEXT}}>Nessun costo in questa categoria</div>
          <div style={{fontSize: C.T_XS, color: PN.MUTED, marginTop: 4}}>Aggiungi il primo costo per iniziare a tracciare le spese</div>
        </div>
      )}

      {groupKeys.map(k => {
        const grp = grouped[k];
        const groupTotal = grp.items.reduce((s,c)=>s+c.amount,0);
        return (
          <div key={k} style={{background: PN.WHITE, border:`1px solid ${PN.BORDER}`, borderRadius: C.R_MD, overflow:'hidden'}}>
            <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 18px', background: C.TH_BG, borderBottom:`1px solid ${PN.BORDER_SOFT}`}}>
              <div style={{fontSize: C.T_SM, fontWeight: 700, color: PN.TEXT, textTransform:'capitalize'}}>{grp.label}</div>
              <div style={{fontSize: C.T_XS, color: PN.MUTED}}>{grp.items.length} voci · <strong style={{color: PN.TEXT, fontVariantNumeric:'tabular-nums'}}>€ {groupTotal.toFixed(2)}</strong></div>
            </div>
            <div style={{display:'grid', gridTemplateColumns:'40px 1.6fr 1fr 1fr 1fr 1fr 80px', padding:'10px 18px', fontSize: C.T_XS, fontWeight: 700, color: C.TH_TEXT, textTransform:'uppercase', letterSpacing: 0.5, borderBottom:`1px solid ${PN.BORDER_SOFT}`}}>
              <span></span><span>Nome</span><span>Categoria</span><span>Tipo</span><span>Prossimo</span><span style={{textAlign:'right'}}>Importo</span><span style={{textAlign:'right'}}>Azioni</span>
            </div>
            {grp.items.map((c,i) => {
              const m = catMeta[c.cat];
              const I = m.icon;
              const cat = COST_CATEGORIES.find(x => x.id===c.cat);
              const isSel = selected.has(c.id);
              return (
                <div key={c.id} style={{
                  display:'grid', gridTemplateColumns:'40px 1.6fr 1fr 1fr 1fr 1fr 80px',
                  padding:'12px 18px', alignItems:'center',
                  fontSize: C.T_SM, color: PN.TEXT,
                  borderTop: i===0 ? 'none' : `1px solid ${PN.BORDER_SOFT}`,
                  background: isSel ? '#FFF6F4' : PN.WHITE,
                }}>
                  <input type="checkbox" checked={isSel} onChange={() => toggle(c.id)} style={{width: 16, height: 16, accentColor: PN.PINK, cursor:'pointer'}}/>
                  <div>
                    <div style={{fontWeight: 600, color: PN.TEXT}}>{c.name}</div>
                    {c.supplier && <div style={{fontSize: C.T_XS, color: PN.MUTED, marginTop: 2}}>{c.supplier}</div>}
                  </div>
                  <span style={{
                    display:'inline-flex', alignItems:'center', gap: 6,
                    padding: '4px 10px', borderRadius: C.R_PILL,
                    background: m.bg, color: m.fg,
                    fontSize: C.T_XS, fontWeight: 600, alignSelf:'flex-start', width:'fit-content',
                  }}><I size={12}/> {cat?.label}</span>
                  <span style={{color: PN.MUTED, fontSize: C.T_XS, display:'inline-flex', alignItems:'center', gap: 6}}>
                    {c.type==='recurring'
                      ? <><Ic.recurring size={12}/> {c.freq}</>
                      : <><Ic.pin size={12}/> Una tantum</>}
                  </span>
                  <div style={{display:'flex', flexDirection:'column'}}>
                    <span style={{fontVariantNumeric:'tabular-nums', color: PN.TEXT, fontSize: C.T_SM}}>{fmt(c.next)}</span>
                    <StatusPill status={c.status}/>
                  </div>
                  <span style={{textAlign:'right', fontWeight:700, fontVariantNumeric:'tabular-nums', fontSize: C.T_SM}}>€ {c.amount.toFixed(2)}</span>
                  <div style={{display:'flex', gap: 6, justifyContent:'flex-end'}}>
                    <button title="Modifica" style={iconOnlyBtn}><Ic.edit size={13}/></button>
                    <button title="Elimina" style={{...iconOnlyBtn, color: PN.RED}}><Ic.trash size={13}/></button>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

function StatusPill({ status }) {
  const map = {
    paid:    { label:'Pagato',     color:'#065F46', bg:'#D1FAE5' },
    due:     { label:'Da pagare',  color:'#92400E', bg:'#FEF3C7' },
    overdue: { label:'Scaduto',    color:'#991B1B', bg:'#FEE2E2' },
  };
  const s = map[status];
  return (
    <span style={{
      display:'inline-block', marginTop: 3,
      padding:'2px 8px', borderRadius: C.R_PILL,
      background: s.bg, color: s.color,
      fontSize: 10.5, fontWeight: 700, alignSelf:'flex-start', width:'fit-content',
    }}>{s.label}</span>
  );
}

window.ContCosti = ContCosti;
window.StatusPill = StatusPill;
