// Tab Costi v2 — icone SVG, header tabella neutro, chip categorie unificate

function ContCosti({ openNewCost }) {
  const [selected, setSelected] = React.useState(new Set());
  const [filterCat, setFilterCat] = React.useState('all');
  const [costs, setCosts] = React.useState(COSTS_DATA);
  const [pendingDelete, setPendingDelete] = React.useState(null); // array di id in attesa di conferma
  const [alertOnly, setAlertOnly] = React.useState(false); // mostra solo scaduti + in scadenza

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
  const upcoming = costs.filter(c => {
    const d = new Date(c.next);
    return c.status !== 'paid' && d >= today && d <= in7days;
  });
  const overdue = costs.filter(c => c.status === 'overdue');
  const totalAlert = overdue.reduce((s,c)=>s+c.amount,0) + upcoming.reduce((s,c)=>s+c.amount,0);

  const alertIds = new Set([...overdue, ...upcoming].map(c => c.id));
  const filtered = costs.filter(c => alertOnly
    ? alertIds.has(c.id)
    : (filterCat==='all' || c.cat===filterCat));
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

  // Stato dei costi selezionati: tutti pagati, tutti da saldare, o misti.
  const selectedCosts = costs.filter(c => selected.has(c.id));
  const allPaid = selectedCosts.length > 0 && selectedCosts.every(c => c.status === 'paid');
  const allUnpaid = selectedCosts.length > 0 && selectedCosts.every(c => c.status !== 'paid');

  // Segna pagati i costi selezionati.
  const markSelectedPaid = () => {
    setCosts(prev => prev.map(c => selected.has(c.id) ? { ...c, status: 'paid' } : c));
    setSelected(new Set());
  };
  // Rimette "non pagato": scaduto se la data è passata, altrimenti da pagare.
  const markSelectedUnpaid = () => {
    setCosts(prev => prev.map(c => selected.has(c.id)
      ? { ...c, status: new Date(c.next) < today ? 'overdue' : 'due' }
      : c));
    setSelected(new Set());
  };

  // Apertura del popup di conferma (selezione multipla o singola riga)
  const askDeleteSelected = () => { if (selected.size) setPendingDelete([...selected]); };
  // Conferma: elimina davvero i costi in attesa
  const confirmDelete = () => {
    const ids = new Set(pendingDelete || []);
    setCosts(prev => prev.filter(c => !ids.has(c.id)));
    setSelected(prev => { const n = new Set(prev); ids.forEach(i => n.delete(i)); return n; });
    setPendingDelete(null);
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
              {overdue.length} scaduti · {upcoming.length} in scadenza entro 7 giorni
            </div>
            <div style={{fontSize: C.T_XS, color:'#92400E', marginTop: 2}}>
              Da saldare: <strong style={{fontVariantNumeric:'tabular-nums'}}>€ {totalAlert.toFixed(2)}</strong>
            </div>
          </div>
          <button onClick={() => setAlertOnly(a => !a)} style={{
            padding:'8px 16px', background: alertOnly ? '#fff' : PN.AMBER,
            color: alertOnly ? PN.AMBER : '#fff',
            border: alertOnly ? `1px solid ${PN.AMBER}` : 'none',
            borderRadius: C.R_PILL, fontSize: C.T_SM, fontWeight: 700, cursor:'pointer',
            fontFamily:'inherit', display:'inline-flex', alignItems:'center', gap: 6, whiteSpace:'nowrap',
          }}>{alertOnly ? 'Mostra tutti i costi' : 'Mostra solo questi'} <Ic.chevronR size={12} stroke={2.4}/></button>
        </div>
      )}

      {/* Categorie filter — pattern chip unificato */}
      <div style={{display:'flex', flexWrap:'wrap', gap: 8}}>
        <FilterChip active={filterCat==='all' && !alertOnly} onClick={() => { setFilterCat('all'); setAlertOnly(false); }} label="Tutte" count={costs.length}/>
        {COST_CATEGORIES.map(c => {
          const m = catMeta[c.id];
          const I = m.icon;
          const active = filterCat===c.id && !alertOnly;
          return (
            <button key={c.id} onClick={() => { setFilterCat(c.id); setAlertOnly(false); }} style={{
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
              }}>{costs.filter(x => x.cat===c.id).length}</span>
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
          {selected.size === 1 && (
            <button onClick={openNewCost} style={{padding:'6px 14px', background:'rgba(255,255,255,0.12)', color:'#fff', border:'1px solid rgba(255,255,255,0.2)', borderRadius: C.R_PILL, fontSize: C.T_XS, fontWeight: 700, cursor:'pointer', fontFamily:'inherit', display:'inline-flex', alignItems:'center', gap: 6}}><Ic.edit size={12}/> Modifica</button>
          )}
          {allUnpaid && (
            <button onClick={markSelectedPaid} style={{padding:'6px 14px', background:'rgba(16,185,129,0.22)', color:'#fff', border:'1px solid rgba(16,185,129,0.55)', borderRadius: C.R_PILL, fontSize: C.T_XS, fontWeight: 700, cursor:'pointer', fontFamily:'inherit', display:'inline-flex', alignItems:'center', gap: 6}}><Ic.check size={12} stroke={2.6}/> Segna come pagati</button>
          )}
          {allPaid && (
            <button onClick={markSelectedUnpaid} style={{padding:'6px 14px', background:'rgba(255,255,255,0.12)', color:'#fff', border:'1px solid rgba(255,255,255,0.2)', borderRadius: C.R_PILL, fontSize: C.T_XS, fontWeight: 700, cursor:'pointer', fontFamily:'inherit', display:'inline-flex', alignItems:'center', gap: 6}}><Ic.recurring size={12}/> Segna come da pagare</button>
          )}
          <button onClick={askDeleteSelected} style={{padding:'6px 14px', background:'rgba(239,68,68,0.22)', color:'#fff', border:'1px solid rgba(239,68,68,0.5)', borderRadius: C.R_PILL, fontSize: C.T_XS, fontWeight: 700, cursor:'pointer', fontFamily:'inherit', display:'inline-flex', alignItems:'center', gap: 6}}><Ic.trash size={12}/> Elimina</button>
          <button onClick={() => setSelected(new Set())} style={{padding:'6px 8px', background:'transparent', color:'#fff', border:'none', cursor:'pointer', fontFamily:'inherit', display:'flex'}}><Ic.close size={14}/></button>
        </div>
      )}

      {/* Section header + new cost button */}
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap: 12}}>
        <div>
          <div style={{fontSize: C.T_MD, fontWeight: 700, color: PN.TEXT}}>Costi della tua attività</div>
          <div style={{fontSize: C.T_SM, color: PN.MUTED, marginTop: 2}}>{filtered.length} voci · per mese di scadenza</div>
        </div>
        <button onClick={openNewCost} style={{
          padding:'10px 18px', background: PN.TEXT, color:'#fff', border:'none',
          borderRadius: C.R_SM, fontSize: C.T_SM, fontWeight: 700, cursor:'pointer',
          fontFamily:'inherit', display:'inline-flex', alignItems:'center', gap: 8,
        }}>
          <Ic.plus size={14} stroke={2.4}/> Aggiungi costo
        </button>
      </div>

      {filtered.length === 0 && (
        <div style={{padding:'40px 20px', textAlign:'center', background: PN.WHITE, border:`1px solid ${PN.BORDER}`, borderRadius: C.R_MD}}>
          <div style={{display:'inline-flex', padding: 14, borderRadius:'50%', background: C.SURF_ALT, color: PN.MUTED, marginBottom: 10}}>
            <Ic.invoice size={28}/>
          </div>
          <div style={{fontSize: C.T_SM, fontWeight: 700, color: PN.TEXT}}>Nessun costo trovato</div>
          <div style={{fontSize: C.T_XS, color: PN.MUTED, marginTop: 4}}>Aggiungi il primo costo per tracciare le spese</div>
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
            <div style={{display:'grid', gridTemplateColumns:'repeat(5, 1fr)', gap: 16, padding:'10px 18px', fontSize: C.T_XS, fontWeight: 700, color: C.TH_TEXT, textTransform:'uppercase', letterSpacing: 0.5, borderBottom:`1px solid ${PN.BORDER_SOFT}`}}>
              <span>Nome</span><span>Categoria</span><span>Tipo</span><span>Prossima scadenza</span><span>Importo</span>
            </div>
            {grp.items.map((c,i) => {
              const m = catMeta[c.cat];
              const I = m.icon;
              const cat = COST_CATEGORIES.find(x => x.id===c.cat);
              const isSel = selected.has(c.id);
              return (
                <div key={c.id} onClick={() => toggle(c.id)}
                  onMouseEnter={e => { if (!isSel) e.currentTarget.style.background = C.SURF_ALT; }}
                  onMouseLeave={e => { e.currentTarget.style.background = isSel ? '#FFF6F4' : PN.WHITE; }}
                  style={{
                  display:'grid', gridTemplateColumns:'repeat(5, 1fr)', gap: 16,
                  padding:'12px 18px', alignItems:'center', cursor:'pointer',
                  fontSize: C.T_SM, color: PN.TEXT,
                  borderTop: i===0 ? 'none' : `1px solid ${PN.BORDER_SOFT}`,
                  background: isSel ? '#FFF6F4' : PN.WHITE,
                  boxShadow: isSel ? `inset 3px 0 0 ${PN.PINK}` : 'none',
                  transition:'background 120ms ease',
                }}>
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
                  <span style={{fontWeight:700, fontVariantNumeric:'tabular-nums', fontSize: C.T_SM}}>€ {c.amount.toFixed(2)}</span>
                </div>
              );
            })}
          </div>
        );
      })}

      {/* Popup di conferma eliminazione */}
      {pendingDelete && (
        <React.Fragment>
          <div onClick={() => setPendingDelete(null)} style={{
            position:'fixed', inset:0, background:'rgba(15,17,21,0.42)', zIndex:60,
          }}/>
          <div style={{
            position:'fixed', top:'50%', left:'50%', transform:'translate(-50%,-50%)',
            width:400, maxWidth:'92vw', background:'#fff', borderRadius:16,
            boxShadow:'0 24px 70px rgba(0,0,0,0.28)', zIndex:61, overflow:'hidden', fontFamily:'inherit',
          }}>
            <div style={{padding:'22px 22px 18px', display:'flex', alignItems:'flex-start', gap:14}}>
              <span style={{width:42, height:42, borderRadius:'50%', background:'#FEE2E2', color: PN.RED,
                display:'grid', placeItems:'center', flexShrink:0}}><Ic.trash size={19}/></span>
              <div>
                <div style={{fontSize: C.T_MD, fontWeight: 800, color: PN.TEXT}}>
                  Eliminare {pendingDelete.length} cost{pendingDelete.length===1?'o':'i'}?
                </div>
                <div style={{fontSize: C.T_SM, color: PN.MUTED, marginTop: 4}}>
                  Questa azione non può essere annullata.
                </div>
              </div>
            </div>
            <div style={{display:'flex', justifyContent:'flex-end', gap:10, padding:'14px 22px',
              background: C.SURF_ALT, borderTop:`1px solid ${PN.BORDER_SOFT}`}}>
              <button onClick={() => setPendingDelete(null)} style={{padding:'9px 16px', background:'#fff', color: PN.TEXT,
                border:`1px solid ${PN.BORDER}`, borderRadius: C.R_SM, fontSize: C.T_SM, fontWeight: 700, cursor:'pointer', fontFamily:'inherit'}}>Annulla</button>
              <button onClick={confirmDelete} style={{padding:'9px 16px', background: PN.RED, color:'#fff', border:'none',
                borderRadius: C.R_SM, fontSize: C.T_SM, fontWeight: 700, cursor:'pointer', fontFamily:'inherit',
                display:'inline-flex', alignItems:'center', gap:6}}><Ic.trash size={13}/> Elimina</button>
            </div>
          </div>
        </React.Fragment>
      )}
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
      fontSize: 12.5, fontWeight: 700, alignSelf:'flex-start', width:'fit-content',
    }}>{s.label}</span>
  );
}

window.ContCosti = ContCosti;
window.StatusPill = StatusPill;
