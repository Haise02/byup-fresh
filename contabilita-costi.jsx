// Tab Costi: banner alert + tabella raggruppata per mese + drawer nuovo costo

function ContCosti({ openNewCost }) {
  const [selected, setSelected] = React.useState(new Set());
  const [filterCat, setFilterCat] = React.useState('all');

  const today = new Date('2026-01-12');
  const in7days = new Date('2026-01-19');
  const upcoming = COSTS_DATA.filter(c => {
    const d = new Date(c.next);
    return c.status !== 'paid' && d >= today && d <= in7days;
  });
  const overdue = COSTS_DATA.filter(c => c.status === 'overdue');
  const totalAlert = overdue.reduce((s,c)=>s+c.amount,0) + upcoming.reduce((s,c)=>s+c.amount,0);

  const filtered = COSTS_DATA.filter(c => filterCat==='all' || c.cat===filterCat);
  // group by mese
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
      {/* Alert banner */}
      {(overdue.length > 0 || upcoming.length > 0) && (
        <div style={{
          display:'flex', alignItems:'center', gap: 14,
          padding: '14px 18px',
          background:'#fff7ed', border:'1px solid #fed7aa',
          borderRadius: 12,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background:'#fed7aa', color:'#9a3412',
            display:'grid', placeItems:'center', fontSize: 16,
          }}>⚠</div>
          <div style={{flex:1}}>
            <div style={{fontSize: 13, fontWeight: 700, color:'#9a3412'}}>
              {overdue.length} scaduti · {upcoming.length} in scadenza nei prossimi 7 giorni
            </div>
            <div style={{fontSize: 11.5, color:'#9a3412', marginTop: 2}}>
              Totale da gestire: <strong>€ {totalAlert.toFixed(2)}</strong>
            </div>
          </div>
          <button style={{padding:'8px 16px', background:'#9a3412', color:'#fff', border:'none', borderRadius: 999, fontSize: 12, fontWeight: 700, cursor:'pointer', fontFamily:'inherit'}}>Vedi dettaglio</button>
        </div>
      )}

      {/* Categorie filter chip */}
      <div style={{display:'flex', flexWrap:'wrap', gap: 8}}>
        <CatChip active={filterCat==='all'} onClick={() => setFilterCat('all')} label="Tutte le categorie" count={COSTS_DATA.length}/>
        {COST_CATEGORIES.map(c => (
          <CatChip key={c.id} active={filterCat===c.id} onClick={() => setFilterCat(c.id)}
            label={c.label} icon={c.icon}
            count={COSTS_DATA.filter(x => x.cat===c.id).length}
            color={c.dark} bg={c.color}/>
        ))}
      </div>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div style={{
          display:'flex', alignItems:'center', gap: 12,
          padding: '10px 16px',
          background: PN.PINK, color:'#fff', borderRadius: 12,
          boxShadow:'0 8px 22px rgba(233,30,99,0.28)',
        }}>
          <strong style={{fontSize: 13}}>{selected.size} selezionati</strong>
          <span style={{fontSize: 12, opacity:0.9}}>· €{filtered.filter(c => selected.has(c.id)).reduce((s,c)=>s+c.amount,0).toFixed(2)}</span>
          <div style={{flex:1}}/>
          <button style={{padding:'6px 14px', background:'rgba(255,255,255,0.18)', color:'#fff', border:'1px solid rgba(255,255,255,0.3)', borderRadius: 999, fontSize: 12, fontWeight: 700, cursor:'pointer', fontFamily:'inherit'}}>✓ Segna come pagati</button>
          <button style={{padding:'6px 14px', background:'rgba(255,255,255,0.18)', color:'#fff', border:'1px solid rgba(255,255,255,0.3)', borderRadius: 999, fontSize: 12, fontWeight: 700, cursor:'pointer', fontFamily:'inherit'}}>⬆ Esporta</button>
          <button onClick={() => setSelected(new Set())} style={{padding:'6px 12px', background:'transparent', color:'#fff', border:'none', fontSize: 14, cursor:'pointer', fontFamily:'inherit'}}>✕</button>
        </div>
      )}

      {/* New cost button */}
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <div>
          <div style={{fontSize: 15, fontWeight: 700, color: PN.TEXT}}>Costi della tua attività</div>
          <div style={{fontSize: 12, color: PN.MUTED, marginTop: 2}}>{filtered.length} voci · raggruppate per mese di scadenza</div>
        </div>
        <button onClick={openNewCost} style={{padding:'10px 18px', background:'#0F1115', color:'#fff', border:'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor:'pointer', fontFamily:'inherit', display:'inline-flex', alignItems:'center', gap: 8}}>
          <span style={{fontSize: 16, lineHeight:1}}>+</span> Nuovo costo
        </button>
      </div>

      {/* Grouped lists */}
      {filtered.length === 0 && (
        <div style={{padding:'40px 20px', textAlign:'center', background: PN.WHITE, border:`1px solid ${PN.BORDER}`, borderRadius: 14}}>
          <div style={{fontSize: 36, marginBottom: 8}}>💸</div>
          <div style={{fontSize: 14, fontWeight: 700, color: PN.TEXT}}>Nessun costo in questa categoria</div>
          <div style={{fontSize: 12, color: PN.MUTED, marginTop: 4}}>Aggiungi il primo costo per iniziare a tracciare le spese</div>
        </div>
      )}

      {groupKeys.map(k => {
        const grp = grouped[k];
        const groupTotal = grp.items.reduce((s,c)=>s+c.amount,0);
        return (
          <div key={k} style={{background: PN.WHITE, border:`1px solid ${PN.BORDER}`, borderRadius: 14, overflow:'hidden'}}>
            <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 18px', background:'#fafafa', borderBottom:`1px solid ${PN.BORDER_SOFT}`}}>
              <div style={{fontSize: 13, fontWeight: 700, color: PN.TEXT, textTransform:'capitalize'}}>{grp.label}</div>
              <div style={{fontSize: 12, color: PN.MUTED}}>{grp.items.length} voci · <strong style={{color: PN.TEXT}}>€ {groupTotal.toFixed(2)}</strong></div>
            </div>
            <div style={{display:'grid', gridTemplateColumns:'40px 1.6fr 1fr 1fr 1fr 1fr 80px', padding:'8px 18px', fontSize: 11, fontWeight: 700, color: PN.MUTED, textTransform:'uppercase', letterSpacing: 0.3, borderBottom:`1px solid ${PN.BORDER_SOFT}`}}>
              <span></span><span>Nome</span><span>Categoria</span><span>Tipo</span><span>Prossimo</span><span style={{textAlign:'right'}}>Importo</span><span style={{textAlign:'right'}}>Azioni</span>
            </div>
            {grp.items.map((c,i) => {
              const cat = COST_CATEGORIES.find(x => x.id===c.cat);
              const isSel = selected.has(c.id);
              return (
                <div key={c.id} style={{
                  display:'grid', gridTemplateColumns:'40px 1.6fr 1fr 1fr 1fr 1fr 80px',
                  padding:'12px 18px', alignItems:'center',
                  fontSize: 12.5, color: PN.TEXT,
                  borderTop: i===0 ? 'none' : `1px solid ${PN.BORDER_SOFT}`,
                  background: isSel ? '#fff5f8' : PN.WHITE,
                }}>
                  <input type="checkbox" checked={isSel} onChange={() => toggle(c.id)} style={{width: 16, height: 16, accentColor: PN.PINK, cursor:'pointer'}}/>
                  <div>
                    <div style={{fontWeight: 600, color: PN.TEXT}}>{c.name}</div>
                    {c.supplier && <div style={{fontSize: 11, color: PN.MUTED, marginTop: 2}}>{c.supplier}</div>}
                  </div>
                  <span style={{
                    display:'inline-flex', alignItems:'center', gap: 6,
                    padding: '4px 10px', borderRadius: 999,
                    background: cat?.color, color: cat?.dark,
                    fontSize: 11, fontWeight: 600, alignSelf:'flex-start', width:'fit-content',
                  }}>{cat?.icon} {cat?.label}</span>
                  <span style={{color: PN.MUTED, fontSize: 12}}>
                    {c.type==='recurring' ? `🔄 ${c.freq}` : '📌 Una tantum'}
                  </span>
                  <div style={{display:'flex', flexDirection:'column'}}>
                    <span style={{fontVariantNumeric:'tabular-nums', color: PN.TEXT}}>{fmt(c.next)}</span>
                    <StatusPill status={c.status}/>
                  </div>
                  <span style={{textAlign:'right', fontWeight:700, fontVariantNumeric:'tabular-nums'}}>€ {c.amount.toFixed(2)}</span>
                  <div style={{display:'flex', gap: 6, justifyContent:'flex-end'}}>
                    <button title="Modifica" style={{background:'transparent', border:`1px solid ${PN.BORDER}`, borderRadius: 8, padding: '5px 8px', cursor:'pointer', fontSize: 12, color: PN.TEXT}}>✎</button>
                    <button title="Elimina" style={{background:'transparent', border:`1px solid ${PN.BORDER}`, borderRadius: 8, padding: '5px 8px', cursor:'pointer', fontSize: 12, color:'#dc2626'}}>🗑</button>
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

function CatChip({ active, onClick, label, icon, count, color, bg }) {
  return (
    <button onClick={onClick} style={{
      display:'inline-flex', alignItems:'center', gap: 6,
      padding:'7px 14px',
      background: active ? (bg || PN.PINK_BG_SOFT) : PN.WHITE,
      border: `1px solid ${active ? (color||PN.PINK) : PN.BORDER}`,
      borderRadius: 999, fontSize: 12, fontWeight: 600,
      color: active ? (color||PN.PINK_DARK) : PN.TEXT,
      cursor:'pointer', fontFamily:'inherit',
    }}>
      {icon && <span>{icon}</span>}
      {label}
      <span style={{
        background: active ? 'rgba(0,0,0,0.1)' : '#f3f4f6',
        color: active ? (color||PN.PINK_DARK) : PN.MUTED,
        padding:'1px 8px', borderRadius: 999, fontSize: 11, fontWeight: 700,
      }}>{count}</span>
    </button>
  );
}

function StatusPill({ status }) {
  const map = {
    paid:    { label:'Pagato', color:'#15803d', bg:'#dcfce7' },
    due:     { label:'Da pagare', color:'#9a3412', bg:'#fff7ed' },
    overdue: { label:'Scaduto', color:'#991b1b', bg:'#fee2e2' },
  };
  const s = map[status];
  return (
    <span style={{
      display:'inline-block', marginTop: 2,
      padding:'2px 8px', borderRadius: 999,
      background: s.bg, color: s.color,
      fontSize: 10.5, fontWeight: 700, alignSelf:'flex-start', width:'fit-content',
    }}>{s.label}</span>
  );
}

window.ContCosti = ContCosti;
