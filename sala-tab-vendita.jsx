// Sala — Tab Vendita diretta (POS) — redesigned
// Pattern: search/filter sticky, food cards con immagine, click → personalizza,
// carrello con coperti stepper, mods inline, sconto, salva conto.

const SA_CAT_ICONS = {
  list: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
  coffee: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8z"/><line x1="6" y1="2" x2="6" y2="4"/><line x1="10" y1="2" x2="10" y2="4"/><line x1="14" y1="2" x2="14" y2="4"/></svg>,
  leaf: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19.2 2.96c.81 1.92.43 3.81-.4 5.62-1.5 3.34-2.72 5.42-5.7 7.42"/><path d="M2 21c0-3 1.85-5.36 5.08-6"/></svg>,
  pasta: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11h18"/><path d="M3 11a9 9 0 0 0 18 0"/><path d="M7 11V6"/><path d="M11 11V4"/><path d="M15 11V5"/><path d="M19 11V7"/></svg>,
  pizza: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 11h.01"/><path d="M11 15h.01"/><path d="M16 16h.01"/><path d="m2 16 20 6-6-20A20 20 0 0 0 2 16"/><path d="M5.71 17.11a17.04 17.04 0 0 1 11.4-11.4"/></svg>,
  meat: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.5 12.5c-1.5 1.5-2 4.5-2 6 0 .5 0 1 .5 1.5L12 22l1-1 1 1 1-2 1 1 .5-1.5c.5-.5.5-1 .5-1.5 0-1.5-.5-4.5-2-6"/><path d="M15.5 5.5c1 1 2 2 2 4 0 1-.5 1.5-1 2-1 1-2.5 1-3.5.5"/><circle cx="15" cy="5" r="3"/></svg>,
  cake: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8"/><path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1"/><path d="M12 4v3"/><path d="M9 7h6"/></svg>,
  bag: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>,
  utensils: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>,
};

function SalaVenditaDiretta() {
  const [search, setSearch] = React.useState('');
  const [cat, setCat] = React.useState('Tutti');
  const [lines, setLines] = React.useState([]); // [{id, piatto, qty, mods, lineTotal}]
  const [takeaway, setTakeaway] = React.useState(false);
  const [incassaOpen, setIncassaOpen] = React.useState(false);
  const [personalize, setPersonalize] = React.useState(null); // {piatto}
  const [editLine, setEditLine] = React.useState(null); // line index for editing existing

  const cats = ['Tutti', ...Array.from(new Set(SALA_VENDITA_PIATTI.map(p => p.cat)))];
  const piatti = SALA_VENDITA_PIATTI.filter(p => {
    if (cat !== 'Tutti' && p.cat !== cat) return false;
    if (search.trim() && !p.name.toLowerCase().includes(search.trim().toLowerCase())) return false;
    return true;
  });

  const isCustomizable = (p) => (p.variants?.length || p.ingredients?.length || p.extras?.length);

  // Quick add: piatti senza personalizzazione, o aggiunge un'altra riga base
  const quickAdd = (p) => {
    setLines(prev => {
      // se esiste già una riga base senza mods, incrementa
      const idx = prev.findIndex(l => l.piatto.id === p.id && !l.mods);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = {...next[idx], qty: next[idx].qty + 1};
        return next;
      }
      return [...prev, { piatto: p, qty: 1, mods: null, lineTotal: p.price }];
    });
  };

  const onCardClick = (p) => {
    if (isCustomizable(p)) setPersonalize({ piatto: p });
    else quickAdd(p);
  };

  const addPersonalized = (piatto, qty, mods, lineTotal) => {
    if (editLine !== null) {
      setLines(prev => prev.map((l, i) => i === editLine ? { piatto, qty, mods, lineTotal } : l));
      setEditLine(null);
    } else {
      setLines(prev => [...prev, { piatto, qty, mods, lineTotal }]);
    }
    setPersonalize(null);
  };

  const incLine = (i) => setLines(prev => prev.map((l, idx) => idx === i ? {...l, qty: l.qty + 1} : l));
  const decLine = (i) => setLines(prev => {
    const l = prev[i];
    if (l.qty <= 1) return prev.filter((_, idx) => idx !== i);
    return prev.map((x, idx) => idx === i ? {...x, qty: x.qty - 1} : x);
  });
  const removeLine = (i) => setLines(prev => prev.filter((_, idx) => idx !== i));
  const editExistingLine = (i) => {
    const line = lines[i];
    if (isCustomizable(line.piatto)) {
      setEditLine(i);
      setPersonalize({ piatto: line.piatto, mods: line.mods, qty: line.qty });
    }
  };

  const total = lines.reduce((s, l) => s + l.lineTotal * l.qty, 0);
  const totQty = lines.reduce((s, l) => s + l.qty, 0);

  // pinned: piatti più venduti (mock — primi 4)
  const popolari = SALA_VENDITA_PIATTI.slice(0, 4);

  return (
    <div style={{display:'grid', gridTemplateColumns:'1fr 400px', gap: 18, height:'100%', minHeight: 0}}>
      {/* === GRID PIATTI === */}
      <section style={{
        background: PN.WHITE, borderRadius: 14,
        border: `1px solid ${PN.BORDER_SOFT}`,
        display:'flex', flexDirection:'column', minHeight: 0, overflow:'hidden',
      }}>
        {/* Sticky header */}
        <div style={{
          padding: '14px 18px 0',
          borderBottom: `1px solid ${PN.BORDER_SOFT}`,
          background: PN.WHITE,
        }}>
          <div style={{position:'relative', marginBottom: 12}}>
            <span style={{position:'absolute', left: 13, top:'50%', transform:'translateY(-50%)', color: PN.MUTED, display:'inline-flex'}}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
            </span>
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Cerca un piatto…"
              style={{
                width:'100%', padding: '10px 14px 10px 36px',
                borderRadius: 10, border: `1px solid ${PN.BORDER}`,
                fontSize: 14, fontFamily:'inherit', outline:'none',
                background: '#FAFBFC',
              }}/>
          </div>
          <div style={{display:'flex', gap: 6, paddingBottom: 12, overflowX:'auto'}}>
            {cats.map(c => {
              const on = cat === c;
              return (
                <button key={c} onClick={() => setCat(c)} style={{
                  padding: '7px 14px', borderRadius: 999,
                  border: `1.5px solid ${on ? PN.TEXT : PN.BORDER}`,
                  background: on ? PN.TEXT : PN.WHITE,
                  color: on ? PN.WHITE : PN.TEXT,
                  fontSize: 12.5, fontWeight: 600, cursor:'pointer',
                  fontFamily:'inherit', whiteSpace:'nowrap',
                }}>
                  {c}
                </button>
              );
            })}
          </div>
        </div>

        {/* Grid */}
        <div className="pn-scroll" style={{
          flex: 1, overflow:'auto', padding: 18,
          display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(190px, 1fr))',
          gridAutoRows: 'min-content',
          alignItems: 'start',
          gap: 14, alignContent:'start',
        }}>
          {piatti.length === 0 && (
            <div style={{gridColumn:'1/-1', padding: 60, textAlign:'center', color: PN.MUTED, fontSize: 13.5}}>
              <div style={{fontSize: 32, marginBottom: 8, opacity: 0.5}}>🔍</div>
              Nessun piatto trovato
            </div>
          )}
          {piatti.map(p => {
            const linesQty = lines.filter(l => l.piatto.id === p.id).reduce((s, l) => s + l.qty, 0);
            return (
              <SaPiattoCard
                key={p.id}
                p={p}
                qtyInCart={linesQty}
                customizable={isCustomizable(p)}
                onCardClick={() => onCardClick(p)}
                onQuickAdd={() => quickAdd(p)}
              />
            );
          })}
        </div>
      </section>

      {/* === CARRELLO === */}
      <SaCartPanel
        lines={lines}
        takeaway={takeaway}
        setTakeaway={setTakeaway}
        total={total}
        totQty={totQty}
        onInc={incLine}
        onDec={decLine}
        onRemove={removeLine}
        onEdit={editExistingLine}
        onClear={() => setLines([])}
        onIncassa={() => setIncassaOpen(true)}
      />

      <SaIncassaModal
        open={incassaOpen}
        total={total}
        onClose={() => setIncassaOpen(false)}
        onConfirm={() => setLines([])}
      />

      {personalize && (
        <SaPersonalizzaModal
          piatto={personalize.piatto}
          initialMods={personalize.mods}
          initialQty={personalize.qty}
          onClose={() => { setPersonalize(null); setEditLine(null); }}
          onConfirm={addPersonalized}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Card piatto

function SaPiattoCard({ p, qtyInCart, customizable, onCardClick, onQuickAdd }) {
  const [imgError, setImgError] = React.useState(false);
  const cat = SALA_VENDITA_CATS[p.cat] || { color: PN.MUTED, bg: '#F4F5F7' };
  const inCart = qtyInCart > 0;

  return (
    <div
      onClick={onCardClick}
      style={{
        background: PN.WHITE, borderRadius: 12,
        border: `1px solid ${inCart ? PN.PINK : PN.BORDER_SOFT}`,
        cursor:'pointer',
        transition:'transform .12s, border-color .12s, box-shadow .12s',
        position:'relative',
        display:'block',
        overflow:'hidden',
        alignSelf:'start',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      {/* Image */}
      <div style={{
        height: 100, position:'relative',
        background: imgError ? cat.bg : '#F4F5F7',
        overflow:'hidden', flexShrink: 0,
      }}>
        {!imgError && p.img ? (
          <img
            src={p.img}
            alt=""
            onError={() => setImgError(true)}
            style={{width:'100%', height:'100%', objectFit:'cover', display:'block'}}
          />
        ) : (
          <div style={{
            width:'100%', height:'100%',
            display:'grid', placeItems:'center',
            color: cat.color, fontSize: 30, fontWeight: 800,
            background: cat.bg,
          }}>{p.name.charAt(0)}</div>
        )}

        {/* qty badge */}
        {inCart && (
          <div style={{
            position:'absolute', top: 8, left: 8,
            background: PN.PINK_DARK, color: PN.WHITE,
            padding:'3px 9px', borderRadius: 999,
            fontSize: 11, fontWeight: 800,
            boxShadow: '0 2px 6px rgba(0,0,0,0.18)',
          }}>×{qtyInCart}</div>
        )}

        {customizable && (
          <div style={{
            position:'absolute', bottom: 8, left: 8,
            background: 'rgba(255,255,255,0.95)',
            padding:'3px 9px', borderRadius: 999,
            fontSize: 10, fontWeight: 700, color: PN.TEXT,
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}>Personalizza</div>
        )}
      </div>

      {/* Body */}
      <div style={{padding: '10px 13px 12px', display:'flex', flexDirection:'column', gap: 3}}>
        <div style={{
          fontSize: 9.5, fontWeight: 700, color: cat.color,
          letterSpacing: 0.5, textTransform:'uppercase',
        }}>{p.cat}</div>

        <div style={{
          fontSize: 13.5, fontWeight: 700, color: PN.TEXT,
          lineHeight: 1.25, textWrap:'pretty',
        }}>{p.name}</div>

        <div style={{
          display:'flex', alignItems:'center', justifyContent:'space-between',
          marginTop: 6, gap: 8,
        }}>
          <span style={{fontSize: 14, fontWeight: 800, color: PN.TEXT}}>€{p.price.toFixed(2)}</span>
          <button
            onClick={(e) => { e.stopPropagation(); onQuickAdd(); }}
            aria-label="Aggiungi al conto"
            style={{
              width: 30, height: 30, borderRadius: 8,
              background: PN.TEXT, color: PN.WHITE, border:'none',
              fontSize: 16, fontWeight: 700, cursor:'pointer',
              fontFamily:'inherit', display:'grid', placeItems:'center', lineHeight: 1,
              flexShrink: 0,
            }}>+</button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Personalizzazione

function SaPersonalizzaModal({ piatto, initialMods, initialQty, onClose, onConfirm }) {
  const init = initialMods || {};
  const [variants, setVariants] = React.useState(() => {
    const out = {};
    (piatto.variants || []).forEach(g => {
      out[g.group] = init.variants?.[g.group] ?? (g.required ? null : null);
    });
    return out;
  });
  const [removed, setRemoved] = React.useState(() => init.removed || []);
  const [extras, setExtras] = React.useState(() => {
    const out = {};
    (piatto.extras || []).forEach(e => { out[e.name] = init.extras?.[e.name] || 0; });
    return out;
  });
  const [qty, setQty] = React.useState(initialQty || 1);

  const requiredOk = (piatto.variants || []).filter(g => g.required).every(g => variants[g.group] != null);

  // calcolo extra prezzo
  const variantExtra = Object.entries(variants).reduce((s, [grp, sel]) => {
    if (!sel) return s;
    const g = piatto.variants.find(v => v.group === grp);
    const opt = g?.options.find(o => o.name === sel);
    return s + (opt?.extra || 0);
  }, 0);
  const extraExtra = Object.entries(extras).reduce((s, [name, q]) => {
    const e = piatto.extras.find(x => x.name === name);
    return s + (e?.price || 0) * q;
  }, 0);
  const lineTotal = piatto.price + variantExtra + extraExtra;

  const submit = () => {
    if (!requiredOk) return;
    const mods = {
      variants: Object.fromEntries(Object.entries(variants).filter(([,v]) => v)),
      removed,
      extras: Object.fromEntries(Object.entries(extras).filter(([,v]) => v > 0)),
    };
    const hasMods = Object.keys(mods.variants).length || mods.removed.length || Object.keys(mods.extras).length;
    onConfirm(piatto, qty, hasMods ? mods : null, lineTotal);
  };

  return (
    <div onClick={onClose} style={{
      position:'fixed', inset: 0, background:'rgba(0,0,0,0.45)',
      display:'grid', placeItems:'center', zIndex: 200, padding: 20,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: PN.WHITE, borderRadius: 16,
        width: 480, maxWidth:'100%', maxHeight:'88vh',
        display:'flex', flexDirection:'column', overflow:'hidden',
      }}>
        {/* Header con immagine */}
        <div style={{position:'relative', height: 140, background: '#F4F5F7'}}>
          {piatto.img && (
            <img src={piatto.img} alt={piatto.name} style={{width:'100%', height:'100%', objectFit:'cover'}}/>
          )}
          <button onClick={onClose} style={{
            position:'absolute', top: 12, right: 12,
            width: 32, height: 32, borderRadius:'50%',
            background:'rgba(255,255,255,0.95)', border:'none', cursor:'pointer',
            display:'grid', placeItems:'center',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <div style={{padding: '14px 20px 0'}}>
          <div style={{fontSize: 10, fontWeight: 700, color: PN.MUTED, letterSpacing: 0.5, textTransform:'uppercase'}}>{piatto.cat}</div>
          <div style={{display:'flex', alignItems:'baseline', gap: 10, marginTop: 2}}>
            <span style={{fontSize: 19, fontWeight: 800, color: PN.TEXT}}>{piatto.name}</span>
            <span style={{fontSize: 14, fontWeight: 700, color: PN.MUTED, marginLeft:'auto'}}>€{piatto.price.toFixed(2)}</span>
          </div>
        </div>

        {/* Body scrollabile */}
        <div className="pn-scroll" style={{flex: 1, overflow:'auto', padding: '16px 20px'}}>
          {/* Varianti */}
          {(piatto.variants || []).map(g => (
            <div key={g.group} style={{marginBottom: 18}}>
              <div style={{display:'flex', alignItems:'center', gap: 8, marginBottom: 8}}>
                <span style={{fontSize: 13, fontWeight: 700, color: PN.TEXT}}>{g.group}</span>
                {g.required && variants[g.group] == null && (
                  <span style={{fontSize: 10.5, color: PN.AMBER, fontWeight: 600}}>· Seleziona un'opzione</span>
                )}
              </div>
              <div style={{display:'flex', gap: 6, flexWrap:'wrap'}}>
                {g.options.map(o => {
                  const on = variants[g.group] === o.name;
                  return (
                    <button key={o.name} onClick={() => setVariants(v => ({...v, [g.group]: o.name}))} style={{
                      padding: '8px 12px', borderRadius: 999,
                      border: `1.5px solid ${on ? PN.PINK : PN.BORDER}`,
                      background: on ? PN.PINK_SOFT : PN.WHITE,
                      color: on ? PN.PINK_DARK : PN.TEXT,
                      fontSize: 12.5, fontWeight: 600, cursor:'pointer',
                      fontFamily:'inherit',
                    }}>
                      {o.name}{o.extra ? <span style={{color: PN.MUTED, fontWeight: 500}}> · +€{o.extra.toFixed(2)}</span> : null}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Ingredienti rimovibili */}
          {(piatto.ingredients || []).filter(i => i.removable).length > 0 && (
            <div style={{marginBottom: 18}}>
              <div style={{fontSize: 13, fontWeight: 700, color: PN.TEXT, marginBottom: 8}}>Ingredienti</div>
              <div style={{display:'flex', gap: 6, flexWrap:'wrap'}}>
                {piatto.ingredients.filter(i => i.removable).map(ing => {
                  const isRemoved = removed.includes(ing.name);
                  return (
                    <button key={ing.name} onClick={() => setRemoved(r => isRemoved ? r.filter(x => x !== ing.name) : [...r, ing.name])} style={{
                      padding: '7px 12px', borderRadius: 999,
                      border: `1.5px solid ${isRemoved ? '#FECACA' : PN.GREEN_SOFT}`,
                      background: isRemoved ? '#FEF2F2' : PN.GREEN_SOFT,
                      color: isRemoved ? '#B91C1C' : PN.GREEN,
                      fontSize: 12.5, fontWeight: 600, cursor:'pointer',
                      fontFamily:'inherit',
                      textDecoration: isRemoved ? 'line-through' : 'none',
                      display:'inline-flex', alignItems:'center', gap: 5,
                    }}>
                      <span style={{fontSize: 11}}>{isRemoved ? '×' : '✓'}</span>
                      {ing.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Extras con stepper */}
          {(piatto.extras || []).length > 0 && (
            <div style={{marginBottom: 6}}>
              <div style={{fontSize: 13, fontWeight: 700, color: PN.TEXT, marginBottom: 8}}>Extras</div>
              <div style={{display:'flex', flexDirection:'column', gap: 6}}>
                {piatto.extras.map(e => {
                  const q = extras[e.name] || 0;
                  return (
                    <div key={e.name} style={{
                      display:'flex', alignItems:'center', gap: 10,
                      padding:'8px 12px', borderRadius: 9,
                      background: q > 0 ? PN.PINK_SOFT : '#FAFBFC',
                      border: `1px solid ${q > 0 ? PN.PINK : PN.BORDER_SOFT}`,
                    }}>
                      <span style={{fontSize: 13, fontWeight: 600, color: PN.TEXT, flex: 1}}>{e.name}</span>
                      <span style={{fontSize: 12, color: PN.MUTED, fontWeight: 500}}>+€{e.price.toFixed(2)}</span>
                      <div style={{display:'flex', alignItems:'center', gap: 6, marginLeft: 4}}>
                        <button onClick={() => setExtras(x => ({...x, [e.name]: Math.max(0, q - 1)}))} disabled={q === 0} style={{
                          width: 24, height: 24, borderRadius:'50%',
                          background: q === 0 ? '#F4F5F7' : PN.TEXT,
                          color: q === 0 ? PN.MUTED_LIGHT : PN.WHITE,
                          border:'none', fontSize: 13, fontWeight: 700,
                          cursor: q === 0 ? 'default' : 'pointer', fontFamily:'inherit',
                        }}>−</button>
                        <span style={{minWidth: 16, textAlign:'center', fontSize: 13, fontWeight: 700}}>{q}</span>
                        <button onClick={() => setExtras(x => ({...x, [e.name]: q + 1}))} style={{
                          width: 24, height: 24, borderRadius:'50%',
                          background: PN.TEXT, color: PN.WHITE, border:'none',
                          fontSize: 13, fontWeight: 700, cursor:'pointer', fontFamily:'inherit',
                        }}>+</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer: qty + add */}
        <div style={{
          padding: '14px 20px',
          borderTop: `1px solid ${PN.BORDER_SOFT}`,
          background: '#FAFBFC',
          display:'flex', alignItems:'center', gap: 12,
        }}>
          <div style={{display:'flex', alignItems:'center', gap: 8}}>
            <button onClick={() => setQty(Math.max(1, qty - 1))} style={{
              width: 34, height: 34, borderRadius:'50%',
              background: PN.WHITE, color: PN.TEXT,
              border: `1px solid ${PN.BORDER}`, fontSize: 15, fontWeight: 700,
              cursor:'pointer', fontFamily:'inherit',
            }}>−</button>
            <span style={{minWidth: 22, textAlign:'center', fontSize: 15, fontWeight: 800}}>{qty}</span>
            <button onClick={() => setQty(qty + 1)} style={{
              width: 34, height: 34, borderRadius:'50%',
              background: PN.WHITE, color: PN.TEXT,
              border: `1px solid ${PN.BORDER}`, fontSize: 15, fontWeight: 700,
              cursor:'pointer', fontFamily:'inherit',
            }}>+</button>
          </div>
          <button
            disabled={!requiredOk}
            onClick={submit}
            style={{
              flex: 1,
              padding: '12px 18px', borderRadius: 999,
              background: requiredOk ? PN.TEXT : '#D1D5DB',
              color: PN.WHITE, border:'none',
              fontSize: 13.5, fontWeight: 700,
              cursor: requiredOk ? 'pointer' : 'not-allowed',
              fontFamily:'inherit',
              display:'flex', alignItems:'center', justifyContent:'space-between', gap: 10,
            }}>
            <span>{initialMods != null || initialQty ? 'Aggiorna' : 'Aggiungi'}</span>
            <span style={{fontSize: 13.5, fontWeight: 700}}>€{(lineTotal * qty).toFixed(2)}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Carrello

function SaCartPanel({ lines, takeaway, setTakeaway, total, totQty, onInc, onDec, onRemove, onEdit, onClear, onIncassa }) {
  window.SALA_V3_VENDITA_CLEAR = onClear;
  return (
    <aside style={{
      background: PN.WHITE, borderRadius: 14,
      border: `1px solid ${PN.BORDER_SOFT}`,
      display:'flex', flexDirection:'column', minHeight: 0, overflow:'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '14px 18px',
        borderBottom: `1px solid ${PN.BORDER_SOFT}`,
        display:'flex', alignItems:'center', gap: 10,
      }}>
        <span style={{
          width: 28, height: 28, borderRadius: 8, background: PN.PINK_SOFT,
          display:'grid', placeItems:'center', color: PN.PINK_DARK,
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18l-2 13H5L3 6Z"/><path d="M8 6V4a4 4 0 0 1 8 0v2"/></svg>
        </span>
        <div style={{flex: 1, minWidth: 0}}>
          <div style={{fontSize: 14, fontWeight: 700, color: PN.TEXT, lineHeight: 1.2}}>Ordine</div>
          <div style={{fontSize: 11, color: PN.MUTED, marginTop: 1}}>{totQty} {totQty === 1 ? 'articolo' : 'articoli'}{lines.length > 0 && ` · ${lines.length} righ${lines.length === 1 ? 'a' : 'e'}`}</div>
        </div>
        <button
          onClick={() => setTakeaway(v => !v)}
          title={takeaway ? 'Da asporto — clicca per annullare' : 'Segna come da asporto'}
          style={{
            display:'inline-flex', alignItems:'center', gap: 5,
            padding: '5px 10px', borderRadius: 8,
            border: `1.5px solid ${takeaway ? PN.TEXT : PN.BORDER}`,
            background: takeaway ? PN.TEXT : 'transparent',
            color: takeaway ? PN.WHITE : PN.MUTED,
            fontSize: 11, fontWeight: 700, cursor:'pointer', fontFamily:'inherit',
            transition:'background .12s, color .12s, border-color .12s',
          }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 0 1-8 0"/>
          </svg>
          Da asporto
        </button>
        {lines.length > 0 && (
          <button onClick={onClear} title="Svuota conto" style={{
            padding:'5px 10px', borderRadius: 8, fontSize: 11, fontWeight: 600,
            background:'transparent', color: PN.MUTED, border: `1px solid ${PN.BORDER}`,
            cursor:'pointer', fontFamily:'inherit',
          }}>Svuota</button>
        )}
      </div>


      {/* Lines */}
      <div className="pn-scroll" style={{flex: 1, overflow:'auto', padding: '12px 14px'}}>
        {lines.length === 0 ? (
          <div style={{
            textAlign:'center', padding: '40px 20px',
            color: PN.MUTED,
          }}>
            <div style={{fontSize: 36, marginBottom: 10, opacity: 0.4}}>🛒</div>
            <div style={{fontSize: 13, fontWeight: 600, color: PN.TEXT, marginBottom: 4}}>Conto vuoto</div>
            <div style={{fontSize: 11.5, color: PN.MUTED, lineHeight: 1.5}}>Tocca un piatto per aggiungerlo<br/>o l'icona <strong>+</strong> per aggiungere veloce</div>
          </div>
        ) : (
          <div style={{display:'flex', flexDirection:'column', gap: 6}}>
            {lines.map((l, i) => (
              <SaCartLine key={i} line={l} onInc={() => onInc(i)} onDec={() => onDec(i)} onRemove={() => onRemove(i)} onEdit={() => onEdit(i)}/>
            ))}
          </div>
        )}
      </div>

      {/* Totale + pagamento */}
      <div style={{
        padding: '12px 18px 14px',
        borderTop: `1px solid ${PN.BORDER_SOFT}`,
        background: PN.WHITE,
      }}>
        <div style={{
          display:'flex', justifyContent:'space-between',
          fontSize: 16, fontWeight: 800, color: PN.TEXT,
          paddingBottom: 12,
        }}>
          <span>Totale</span><span>€{total.toFixed(2)}</span>
        </div>

        <div style={{display:'flex', gap: 8, marginTop: 12}}>
          <button
            disabled={lines.length === 0}
            onClick={() => { if (lines.length > 0) onIncassa(); }}
            style={{
              flex: 1,
              padding: '11px 16px', borderRadius: 999,
              background: lines.length === 0 ? '#D1D5DB' : PN.TEXT,
              color: PN.WHITE, border:'none',
              fontSize: 13.5, fontWeight: 700,
              cursor: lines.length === 0 ? 'not-allowed' : 'pointer',
              fontFamily:'inherit',
              display:'flex', alignItems:'center', justifyContent:'space-between', gap: 8,
            }}>
            <span>Procedi al pagamento</span>
            <span>€{total.toFixed(2)}</span>
          </button>
        </div>
      </div>
    </aside>
  );
}

function SaCartLine({ line, onInc, onDec, onRemove, onEdit }) {
  const { piatto, qty, mods, lineTotal } = line;
  const cat = SALA_VENDITA_CATS[piatto.cat] || { color: PN.MUTED, bg: '#F4F5F7' };
  const hasMods = mods && (Object.keys(mods.variants||{}).length || (mods.removed||[]).length || Object.keys(mods.extras||{}).length);
  return (
    <div style={{
      display:'flex', gap: 10,
      padding: 8, borderRadius: 9,
      background: '#FAFBFC',
      border: `1px solid ${PN.BORDER_SOFT}`,
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 8, flexShrink: 0,
        background: cat.bg, overflow:'hidden',
        display:'grid', placeItems:'center',
      }}>
        {piatto.img
          ? <img src={piatto.img} alt="" style={{width:'100%', height:'100%', objectFit:'cover'}}/>
          : <span style={{fontSize: 18}}>{piatto.emoji || '🍽'}</span>}
      </div>
      <div style={{flex: 1, minWidth: 0}}>
        <div style={{display:'flex', alignItems:'baseline', gap: 6}}>
          <span style={{fontSize: 12.5, fontWeight: 700, color: PN.TEXT, flex: 1, minWidth: 0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{piatto.name}</span>
          <span style={{fontSize: 12, fontWeight: 700, color: PN.TEXT}}>€{(lineTotal * qty).toFixed(2)}</span>
        </div>
        {hasMods && (
          <div style={{fontSize: 10.5, color: PN.MUTED, marginTop: 2, lineHeight: 1.4}}>
            {Object.entries(mods.variants || {}).map(([g, v]) => (
              <span key={g} style={{color: PN.TEXT, fontWeight: 600}}>{v} · </span>
            ))}
            {(mods.removed || []).map(r => (
              <span key={r} style={{color: '#B91C1C', fontWeight: 600}}>− {r} · </span>
            ))}
            {Object.entries(mods.extras || {}).map(([n, q]) => (
              <span key={n} style={{color: PN.GREEN, fontWeight: 600}}>+ {q > 1 ? `${q}× ` : ''}{n} · </span>
            ))}
          </div>
        )}
        <div style={{display:'flex', alignItems:'center', gap: 6, marginTop: 4}}>
          <button onClick={onDec} style={{
            width: 22, height: 22, borderRadius:'50%',
            background: PN.PINK_SOFT, color: PN.PINK_DARK, border:'none',
            fontSize: 12, fontWeight: 700, cursor:'pointer', fontFamily:'inherit',
            display:'grid', placeItems:'center',
          }}>−</button>
          <span style={{fontSize: 12, fontWeight: 700, minWidth: 14, textAlign:'center'}}>{qty}</span>
          <button onClick={onInc} style={{
            width: 22, height: 22, borderRadius:'50%',
            background: PN.PINK_SOFT, color: PN.PINK_DARK, border:'none',
            fontSize: 12, fontWeight: 700, cursor:'pointer', fontFamily:'inherit',
            display:'grid', placeItems:'center',
          }}>+</button>
          <span style={{flex:1}}/>
          {hasMods !== undefined && (line.piatto.variants?.length || line.piatto.ingredients?.length || line.piatto.extras?.length) ? (
            <button onClick={onEdit} title="Modifica" style={{
              padding:'2px 6px', borderRadius: 5, fontSize: 10.5, fontWeight: 600,
              background:'transparent', color: PN.MUTED,
              border: `1px solid ${PN.BORDER}`, cursor:'pointer', fontFamily:'inherit',
            }}>✎</button>
          ) : null}
          <button onClick={onRemove} title="Rimuovi" style={{
            background:'transparent', border:'none', color: PN.MUTED,
            cursor:'pointer', fontSize: 14, padding: '0 2px', fontFamily:'inherit', lineHeight: 1,
          }}>×</button>
        </div>
      </div>
    </div>
  );
}

function SaRow({ l, v }) {
  return (
    <div style={{display:'flex', justifyContent:'space-between', fontSize: 12.5, color: PN.MUTED, padding: '2px 0'}}>
      <span>{l}</span><span style={{color: PN.TEXT, fontWeight: 600}}>{v}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Modale incasso semplificato (solo totale + pagamento)

function SaIncassaModal({ open, total: subtotale, onClose, onConfirm }) {
  const [method, setMethod] = React.useState('contanti');
  const [pay, setPay] = React.useState({ contanti: '', carta: '' });
  const [done, setDone] = React.useState(false);
  const [adjust, setAdjust] = React.useState(null);
  const [adjustOpen, setAdjustOpen] = React.useState(false);
  const [confirmedTotal, setConfirmedTotal] = React.useState(0);
  const [confirmedPay, setConfirmedPay] = React.useState({ contanti: 0, carta: 0 });

  React.useEffect(() => {
    if (open) {
      setMethod('contanti');
      setPay({ contanti: '', carta: '' });
      setDone(false);
      setAdjust(null);
      setAdjustOpen(false);
    }
  }, [open]);

  if (!open) return null;

  // Calcolo aggiustamento
  let naturalTotal = subtotale;
  let adjustLabel = null;
  let adjustDelta = 0;
  if (adjust) {
    if (adjust.type === 'sconto-eur') {
      adjustDelta = -Math.min(adjust.val || 0, subtotale);
      naturalTotal = subtotale + adjustDelta;
      adjustLabel = `Sconto · −€${(-adjustDelta).toFixed(2)}`;
    } else if (adjust.type === 'sconto-pct') {
      adjustDelta = -(subtotale * (adjust.val || 0) / 100);
      naturalTotal = subtotale + adjustDelta;
      adjustLabel = `Sconto ${adjust.val}% · −€${(-adjustDelta).toFixed(2)}`;
    } else if (adjust.type === 'arrotonda') {
      naturalTotal = Math.floor(subtotale);
      adjustDelta = naturalTotal - subtotale;
      adjustLabel = `Arrotondato · ${adjustDelta < 0 ? '' : '+'}€${adjustDelta.toFixed(2)}`;
    } else if (adjust.type === 'custom') {
      naturalTotal = adjust.val || 0;
      adjustDelta = naturalTotal - subtotale;
      adjustLabel = `Importo personalizzato`;
    }
  }
  const finalTotal = Math.max(0, naturalTotal);

  const contanti = parseFloat(pay.contanti) || 0;
  const carta = parseFloat(pay.carta) || 0;
  const paid = contanti + carta;
  const canConfirm = paid >= finalTotal - 0.01 && finalTotal > 0;

  function chooseMethod(m) {
    setMethod(m);
    if (m === 'contanti') setPay({ contanti: '', carta: '' });
    else if (m === 'carta') setPay({ contanti: '', carta: finalTotal.toFixed(2) });
    else setPay({ contanti: '', carta: '' });
  }

  function smartCashChips(tot) {
    const chips = [{ label: 'Esatto', val: tot.toFixed(2) }];
    const steps = [5, 10, 20, 50];
    const seen = new Set([Math.round(tot * 100)]);
    for (const s of steps) {
      const v = Math.ceil(tot / s) * s;
      if (v <= tot + 0.01) continue;
      const key = Math.round(v * 100);
      if (seen.has(key)) continue;
      seen.add(key);
      chips.push({ label: '€' + v, val: v.toFixed(2) });
      if (chips.length >= 4) break;
    }
    return chips;
  }

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(15,17,21,0.55)',
      display: 'grid', placeItems: 'center', zIndex: 200, padding: 20,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: '#fff', borderRadius: 16,
        width: 420, maxWidth: '100%',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        boxShadow: '0 24px 70px rgba(0,0,0,0.28)',
      }}>
        {done ? (
          <div style={{
            padding: '36px 28px', textAlign: 'center',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: '#DCFCE7', color: '#16A34A',
              display: 'grid', placeItems: 'center', marginBottom: 16,
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 13 L9 17 L19 7"/>
              </svg>
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#0F1115', marginBottom: 4 }}>
              Pagamento incassato
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#0F1115', marginBottom: 6, letterSpacing: -0.5, fontVariantNumeric: 'tabular-nums' }}>
              €{confirmedTotal.toFixed(2)}
            </div>
            <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 24 }}>
              {confirmedPay.contanti > 0 && confirmedPay.carta > 0
                ? `€${confirmedPay.contanti.toFixed(2)} contanti + €${confirmedPay.carta.toFixed(2)} carta`
                : confirmedPay.contanti > 0 ? 'Contanti' : 'Carta'}
            </div>
            <button onClick={onClose} style={{
              padding: '10px 24px', background: '#0F1115', color: '#fff',
              border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700,
              cursor: 'pointer', fontFamily: 'inherit',
            }}>Chiudi</button>
          </div>
        ) : (
          <>
            <div style={{
              padding: '14px 20px', borderBottom: '1px solid #F0F2F5',
              display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0,
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10.5, color: '#6B7280', fontWeight: 800, letterSpacing: 0.6, textTransform: 'uppercase' }}>
                  Pagamento
                </div>
              </div>
              <button onClick={onClose} style={{
                width: 32, height: 32, borderRadius: 8,
                background: '#F1F2F5', border: 'none', cursor: 'pointer',
                fontSize: 18, fontFamily: 'inherit', color: '#6B7280',
              }}>×</button>
            </div>

            <div className="pn-scroll" style={{ padding: '18px 22px', overflow: 'auto' }}>
              {/* TOTALE */}
              <div style={{ marginBottom: 20 }}>
                {adjust && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 10 }}>
                    <ReceiptRow label="Subtotale" value={`€${subtotale.toFixed(2)}`}/>
                    <ReceiptRow
                      label={adjustLabel.split(' · ')[0]}
                      value={(adjustDelta >= 0 ? '+' : '−') + '€' + Math.abs(adjustDelta).toFixed(2)}
                      tone={adjustDelta < 0 ? 'success' : 'danger'}
                      onRemove={() => setAdjust(null)}/>
                  </div>
                )}
                <div style={{
                  display: 'flex', alignItems: 'baseline', gap: 8,
                  paddingBottom: 6, borderBottom: '1px solid #E5E7EB',
                }}>
                  <span style={{
                    fontSize: 11, fontWeight: 800, color: '#6B7280',
                    letterSpacing: 0.6, textTransform: 'uppercase', flex: 1,
                  }}>Totale</span>
                  <span style={{
                    fontSize: 36, fontWeight: 800, color: '#0F1115',
                    letterSpacing: -1, lineHeight: 1, fontVariantNumeric: 'tabular-nums',
                  }}>€{finalTotal.toFixed(2)}</span>
                </div>
                <div style={{ textAlign: 'right', marginTop: 6 }}>
                  <button onClick={() => setAdjustOpen(o => !o)} style={{
                    background: 'transparent', border: 'none', padding: 0,
                    fontFamily: 'inherit', fontSize: 11.5, fontWeight: 700,
                    color: adjustOpen ? '#0F1115' : '#6B7280', cursor: 'pointer',
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                  }}>
                    {adjust ? 'Modifica aggiustamento' : 'Aggiusta totale'}
                    <span style={{
                      display: 'inline-block', fontSize: 9,
                      transform: adjustOpen ? 'rotate(180deg)' : 'none',
                      transition: 'transform 0.15s',
                    }}>▾</span>
                  </button>
                </div>
                {adjustOpen && (
                  <AdjustPanel
                    subtotale={subtotale}
                    adjust={adjust}
                    setAdjust={setAdjust}
                    onClose={() => setAdjustOpen(false)}/>
                )}
              </div>

              <div style={{ height: 1, background: '#E5E7EB', margin: '0 -22px 20px' }}/>

              {/* PAGAMENTO */}
              <div>
                <div style={{
                  fontSize: 10.5, fontWeight: 800, color: '#6B7280',
                  letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 10,
                }}>Come paga il cliente?</div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, marginBottom: 14 }}>
                  <MethodTab active={method === 'contanti'} onClick={() => chooseMethod('contanti')} icon={<IconCash/>} label="Contanti"/>
                  <MethodTab active={method === 'carta'} onClick={() => chooseMethod('carta')} icon={<IconCard/>} label="Carta"/>
                  <MethodTab active={method === 'misto'} onClick={() => chooseMethod('misto')} icon={<IconSplit/>} label="Misto"/>
                </div>

                {method === 'contanti' && (
                  <CashTendered total={finalTotal} value={pay.contanti}
                    onChange={v => setPay({ contanti: v, carta: '' })}
                    chips={smartCashChips(finalTotal)}/>
                )}
                {method === 'carta' && <CardPay total={finalTotal}/>}
                {method === 'misto' && (
                  <MixedPay
                    total={finalTotal} pay={pay} contanti={contanti} carta={carta} paid={paid}
                    onCash={v => setPay(p => ({ ...p, contanti: v }))}
                    onCard={v => setPay(p => ({ ...p, carta: v }))}/>
                )}
              </div>
            </div>

            <div style={{
              padding: '14px 22px', borderTop: '1px solid #F0F2F5',
              background: '#fff', flexShrink: 0,
            }}>
              <button
                onClick={() => {
                  setConfirmedTotal(finalTotal);
                  setConfirmedPay({ contanti, carta });
                  setDone(true);
                  onConfirm && onConfirm();
                }}
                disabled={!canConfirm}
                style={{
                  width: '100%', padding: '15px 16px', borderRadius: 10,
                  background: canConfirm ? '#0F1115' : '#E5E7EB',
                  color: canConfirm ? '#fff' : '#9CA3AF',
                  border: 'none', fontSize: 15, fontWeight: 800,
                  cursor: canConfirm ? 'pointer' : 'not-allowed',
                  fontFamily: 'inherit', letterSpacing: -0.2,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}>
                {!canConfirm
                  ? (finalTotal === 0 ? 'Nessun articolo' : `Manca €${(finalTotal - paid).toFixed(2)}`)
                  : <>Conferma incasso <span style={{ opacity: 0.6 }}>·</span> €{finalTotal.toFixed(2)}</>}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

window.SalaVenditaDiretta = SalaVenditaDiretta;
