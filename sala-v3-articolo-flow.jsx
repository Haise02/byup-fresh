// Sala v3 — Flow "+ Articolo": sheet con browse + customizza (ingredienti, extras, varianti)

function SalaV3ArticoloSheet({ open, tavolo, cart, onCartChange, onClose, onConfirm }) {
  const [category, setCategory] = React.useState('Antipasti');
  const [search, setSearch] = React.useState('');
  const [customizing, setCustomizing] = React.useState(null); // { item, removed, extras, variants, note, qty }

  if (!open || !tavolo) return null;

  const menu = window.SALA_V3_MENU;
  const categories = Object.keys(menu);
  const items = menu[category].filter(i =>
    !search.trim() || i.nome.toLowerCase().includes(search.toLowerCase())
  );

  const total = cart?.items.reduce((s, i) => s + i.qty * i.prezzo, 0) || 0;
  const itemCount = cart?.items.reduce((s, i) => s + i.qty, 0) || 0;

  function hasCustomization(it) {
    return (it.ingredients?.length || 0) + (it.extras?.length || 0) + (it.variants?.length || 0) > 0;
  }

  function quickAdd(it) {
    const existing = cart?.items.find(x => x.id === it.id && !x.customized);
    const items = existing
      ? cart.items.map(x => (x.id === it.id && !x.customized) ? {...x, qty: x.qty + 1} : x)
      : [...(cart?.items || []), {...it, qty: 1}];
    onCartChange({ tableId: tavolo.id, items });
  }

  function handleItemClick(it) {
    if (hasCustomization(it)) {
      setCustomizing({
        item: it, removed: {}, extras: {}, variants: {}, note: '', qty: 1,
      });
    } else {
      quickAdd(it);
    }
  }

  function commitCustomization() {
    const c = customizing;
    const it = c.item;
    const extrasArr = Object.entries(c.extras).filter(([_,q])=>q>0).map(([id,qty])=>{
      const ex = it.extras.find(x=>x.id===id);
      return { id, nome: ex.nome, prezzo: ex.prezzo, qty };
    });
    const removedArr = Object.keys(c.removed).filter(k=>c.removed[k]);
    const variantsArr = Object.entries(c.variants).map(([vid,opt])=>{
      const v = it.variants.find(x=>x.id===vid);
      return { id: vid, label: v.label, value: opt };
    });
    const extrasPrice = extrasArr.reduce((s,e)=>s+e.prezzo*e.qty,0);
    const lineItem = {
      id: it.id, nome: it.nome,
      prezzo: it.prezzo + extrasPrice,
      qty: c.qty,
      customized: true,
      mods: { removed: removedArr, extras: extrasArr, variants: variantsArr, note: c.note?.trim() || '' },
      lineKey: `${it.id}-${Date.now()}`,
    };
    onCartChange({ tableId: tavolo.id, items: [...(cart?.items || []), lineItem] });
    setCustomizing(null);
  }

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{
        position:'absolute', inset: 0, background:'rgba(15,17,21,0.32)',
        zIndex: 40, animation: 'fadeIn 0.18s ease',
      }}/>
      {/* Sheet */}
      <div style={{
        position:'absolute', top: 0, right: 0, bottom: 0, width: 460,
        background:'#fff', boxShadow:'-8px 0 32px rgba(0,0,0,0.12)',
        zIndex: 41, display:'flex', flexDirection:'column',
        animation:'slideInRight 0.24s cubic-bezier(0.4, 0, 0.2, 1)',
      }}>
        {/* Header */}
        <div style={{
          padding:'16px 20px', borderBottom:'1px solid #F0F2F5',
          display:'flex', alignItems:'center', gap: 12,
        }}>
          {customizing && (
            <button onClick={()=>setCustomizing(null)} style={{
              width: 32, height: 32, borderRadius: 8,
              background:'#F1F2F5', border:'none', cursor:'pointer',
              color:'#0F1115', fontSize: 16, fontFamily:'inherit',
              display:'grid', placeItems:'center',
            }} aria-label="Indietro">‹</button>
          )}
          <div style={{flex:1}}>
            <div style={{fontSize: 11, color:'#6B7280', fontWeight: 700, letterSpacing: 0.5, textTransform:'uppercase'}}>
              {customizing ? 'Personalizza' : 'Aggiungi articolo'}
            </div>
            <div style={{fontSize: 17, fontWeight: 800, color:'#0F1115', marginTop: 2,
              overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>
              {customizing ? customizing.item.nome : `T.${tavolo.id}${tavolo.party ? ` · ${tavolo.party}` : ''}`}
            </div>
          </div>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: 8,
            background:'#F1F2F5', border:'none', cursor:'pointer',
            color:'#0F1115', fontSize: 16, fontFamily:'inherit',
            display:'grid', placeItems:'center',
          }}>×</button>
        </div>

        {customizing ? (
          <CustomizeView c={customizing} setC={setCustomizing} onAdd={commitCustomization}/>
        ) : (
          <BrowseView
            search={search} setSearch={setSearch}
            categories={categories} category={category} setCategory={setCategory}
            items={items} cart={cart}
            onItemClick={handleItemClick} onQuickAdd={quickAdd}
            hasCustomization={hasCustomization}/>
        )}

        {/* Footer cart summary — solo nel browse */}
        {!customizing && (
          <div style={{borderTop:'1px solid #F0F2F5', padding:'14px 20px', background:'#fff'}}>
            {itemCount === 0 ? (
              <div style={{textAlign:'center', fontSize: 12, color:'#9CA3AF', padding:'8px 0'}}>
                Tap su un articolo per aggiungerlo
              </div>
            ) : (
              <>
                <div className="pn-scroll" style={{
                  maxHeight: 140, overflow:'auto', marginBottom: 10,
                  display:'flex', flexDirection:'column', gap: 6,
                }}>
                  {cart.items.map((it, idx) => (
                    <CartLine key={it.lineKey || `${it.id}-${idx}`} it={it} onRemove={()=>{
                      const items = it.qty > 1
                        ? cart.items.map((x,i) => i===idx ? {...x, qty: x.qty-1} : x)
                        : cart.items.filter((_,i) => i!==idx);
                      onCartChange({...cart, items});
                    }}/>
                  ))}
                </div>
                <div style={{display:'flex', alignItems:'center', gap: 10}}>
                  <div>
                    <div style={{fontSize: 10, color:'#6B7280', fontWeight: 700, textTransform:'uppercase', letterSpacing: 0.4}}>
                      {itemCount} articol{itemCount === 1 ? 'o' : 'i'}
                    </div>
                    <div style={{fontSize: 20, fontWeight: 800, color:'#0F1115', letterSpacing: -0.4, lineHeight: 1.1}}>
                      €{total.toFixed(2)}
                    </div>
                  </div>
                  <span style={{flex:1}}/>
                  <button onClick={onConfirm} style={{
                    padding:'12px 22px',
                    background:'#0F1115', color:'#fff', border:'none',
                    borderRadius: 10, fontSize: 13.5, fontWeight: 700,
                    cursor:'pointer', fontFamily:'inherit',
                    display:'inline-flex', alignItems:'center', gap: 8, minHeight: 44,
                  }}>
                    Invia in cucina
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14 M13 6l6 6-6 6"/>
                    </svg>
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideInRight { from {transform: translateX(100%);} to {transform: translateX(0);} }
        @keyframes fadeIn { from {opacity: 0;} to {opacity: 1;} }
      `}</style>
    </>
  );
}

// ─── Cart line: mostra mods se presenti ─────────────────────
function CartLine({ it, onRemove }) {
  const m = it.mods;
  const hasMods = m && ((m.removed?.length||0)+(m.extras?.length||0)+(m.variants?.length||0) > 0 || m.note);
  return (
    <div style={{display:'flex', flexDirection:'column', gap: 2}}>
      <div style={{display:'flex', alignItems:'center', gap: 6}}>
        <span style={{fontSize: 11, fontWeight: 800, color:'#9A3412', minWidth: 26}}>{it.qty}×</span>
        <span style={{flex:1, fontSize: 12, color:'#0F1115', fontWeight: 600,
          overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{it.nome}</span>
        <span style={{fontSize: 11.5, color:'#6B7280', fontWeight: 600}}>
          €{(it.qty * it.prezzo).toFixed(2)}
        </span>
        <button onClick={onRemove} style={{
          width: 22, height: 22, borderRadius: 4,
          background:'#fff', border:'1px solid #E5E7EB',
          color:'#6B7280', fontSize: 14, fontWeight: 700,
          cursor:'pointer', fontFamily:'inherit', padding: 0,
          display:'grid', placeItems:'center',
        }}>−</button>
      </div>
      {hasMods && (
        <div style={{paddingLeft: 32, fontSize: 10.5, color:'#6B7280', lineHeight: 1.45}}>
          {m.variants?.map(v => <div key={v.id}>· {v.label}: <b>{v.value}</b></div>)}
          {m.removed?.length > 0 && <div style={{color:'#DC2626'}}>− senza {m.removed.join(', ')}</div>}
          {m.extras?.map(e => <div key={e.id} style={{color:'#15803D'}}>+ {e.qty}× {e.nome}</div>)}
          {m.note && <div style={{fontStyle:'italic'}}>“{m.note}”</div>}
        </div>
      )}
    </div>
  );
}

// ─── Browse: categorie + articoli ───────────────────────────
function BrowseView({ search, setSearch, categories, category, setCategory, items, cart, onItemClick, onQuickAdd, hasCustomization }) {
  return (
    <>
      {/* Search */}
      <div style={{padding:'12px 20px', borderBottom:'1px solid #F0F2F5'}}>
        <div style={{position:'relative'}}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Cerca articolo…"
            style={{
              width:'100%', padding:'10px 12px 10px 36px',
              background:'#F8F9FB', border:'1px solid #F0F2F5',
              borderRadius: 8, fontSize: 13, color:'#0F1115',
              outline:'none', fontFamily:'inherit',
            }}/>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B7280"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            style={{position:'absolute', left: 12, top:'50%', transform:'translateY(-50%)'}}>
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
        </div>
      </div>

      {/* Body: categorie + articoli */}
      <div style={{flex:1, display:'flex', minHeight: 0}}>
        <div className="pn-scroll" style={{
          width: 130, borderRight:'1px solid #F0F2F5',
          overflow:'auto', padding: '8px 0', background:'#FAFBFC',
        }}>
          {categories.map(c => {
            const on = category === c;
            return (
              <button key={c} onClick={()=>setCategory(c)} style={{
                width:'100%', textAlign:'left',
                padding:'10px 14px', border:'none',
                background: on ? '#fff' : 'transparent',
                color: on ? '#0F1115' : '#6B7280',
                fontSize: 12.5, fontWeight: on ? 700 : 500,
                cursor:'pointer', fontFamily:'inherit',
                borderLeft: on ? '3px solid #E04347' : '3px solid transparent',
              }}>{c}</button>
            );
          })}
        </div>

        <div className="pn-scroll" style={{flex:1, overflow:'auto', padding: 12}}>
          {items.length === 0 ? (
            <div style={{padding: 30, textAlign:'center', color:'#9CA3AF', fontSize: 12.5}}>
              Nessun articolo trovato
            </div>
          ) : items.map(it => {
            const inCart = cart?.items.find(x => x.id === it.id && !x.customized);
            const customizable = hasCustomization(it);
            return (
              <div key={it.id} onClick={()=>onItemClick(it)} style={{
                display:'flex', alignItems:'center', gap: 10,
                padding:'10px 12px', marginBottom: 6,
                background:'#fff',
                border:'1px solid #F0F2F5',
                borderRadius: 8, cursor:'pointer',
              }}>
                <div style={{flex:1, minWidth: 0}}>
                  <div style={{fontSize: 13, fontWeight: 600, color:'#0F1115',
                    overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{it.nome}</div>
                  {customizable && (
                    <div style={{fontSize: 10, color:'#6B7280', marginTop: 2,
                      display:'inline-flex', alignItems:'center', gap: 4}}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 20h9 M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4z"/>
                      </svg>
                      Personalizzabile
                    </div>
                  )}
                </div>
                <span style={{fontSize: 12.5, fontWeight: 700, color:'#6B7280', minWidth: 44, textAlign:'right'}}>
                  €{it.prezzo.toFixed(2)}
                </span>
                {inCart && (
                  <span style={{
                    fontSize: 11, fontWeight: 700,
                    color:'#6B7280', background:'#F1F2F5',
                    padding:'2px 8px', borderRadius: 999,
                  }}>×{inCart.qty}</span>
                )}
                <button onClick={(e)=>{ e.stopPropagation(); onQuickAdd(it); }} style={{
                  width: 28, height: 28, borderRadius: 8,
                  background:'#F1F2F5', color:'#0F1115',
                  border:'none', cursor:'pointer', fontFamily:'inherit',
                  display:'grid', placeItems:'center',
                  fontSize: 14, fontWeight: 800,
                }}>+</button>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

// ─── Customize: ingredienti / extras / varianti / note ──────
function CustomizeView({ c, setC, onAdd }) {
  const it = c.item;
  const extrasPrice = Object.entries(c.extras).reduce((s,[id,q])=>{
    const ex = it.extras?.find(x=>x.id===id);
    return s + (ex ? ex.prezzo * q : 0);
  }, 0);
  const unit = it.prezzo + extrasPrice;
  const total = unit * c.qty;
  const variantsRequired = (it.variants || []).filter(v => !c.variants[v.id]);
  const canAdd = variantsRequired.length === 0;

  const toggleRemove = (ing) => setC(s => ({...s, removed: {...s.removed, [ing]: !s.removed[ing]}}));
  const setExtra = (id, q) => setC(s => {
    const e = {...s.extras};
    if (q <= 0) delete e[id]; else e[id] = q;
    return {...s, extras: e};
  });
  const setVariant = (vid, opt) => setC(s => ({...s, variants: {...s.variants, [vid]: opt}}));

  return (
    <>
      <div className="pn-scroll" style={{flex:1, overflow:'auto', padding: '14px 20px 20px'}}>
        {/* Riepilogo prezzo base */}
        <div style={{
          display:'flex', alignItems:'center', justifyContent:'space-between',
          padding:'10px 12px', background:'#FAFBFC',
          border:'1px solid #F0F2F5', borderRadius: 8, marginBottom: 18,
        }}>
          <span style={{fontSize: 12, color:'#6B7280', fontWeight: 600}}>Prezzo base</span>
          <span style={{fontSize: 14, fontWeight: 800, color:'#0F1115'}}>€{it.prezzo.toFixed(2)}</span>
        </div>

        {/* Varianti */}
        {(it.variants || []).map(v => (
          <Section key={v.id} title={v.label} hint={!c.variants[v.id] ? 'Seleziona un\'opzione' : null}>
            <div style={{display:'flex', flexWrap:'wrap', gap: 6}}>
              {v.options.map(opt => {
                const sel = c.variants[v.id] === opt;
                return (
                  <button key={opt} onClick={()=>setVariant(v.id, opt)} style={{
                    padding:'8px 14px', borderRadius: 999,
                    border: sel ? '1.5px solid #0F1115' : '1.5px solid #E5E7EB',
                    background: sel ? '#0F1115' : '#fff',
                    color: sel ? '#fff' : '#0F1115',
                    fontSize: 12.5, fontWeight: 600, fontFamily:'inherit', cursor:'pointer',
                  }}>{opt}</button>
                );
              })}
            </div>
          </Section>
        ))}

        {/* Ingredienti da togliere */}
        {(it.ingredients?.length || 0) > 0 && (
          <Section title="Ingredienti" hint="Tocca per togliere">
            <div style={{display:'flex', flexWrap:'wrap', gap: 6}}>
              {it.ingredients.map(ing => {
                const out = !!c.removed[ing];
                return (
                  <button key={ing} onClick={()=>toggleRemove(ing)} style={{
                    padding:'7px 12px', borderRadius: 999,
                    border: out ? '1.5px solid #E5E7EB' : '1.5px solid #15803D',
                    background: out ? '#F8F9FB' : '#fff',
                    color: out ? '#9CA3AF' : '#0F1115',
                    fontSize: 12.5, fontWeight: 600, fontFamily:'inherit', cursor:'pointer',
                    textDecoration: out ? 'line-through' : 'none',
                    display:'inline-flex', alignItems:'center', gap: 4,
                  }}>
                    <span style={{
                      fontSize: 11, fontWeight: 800,
                      color: out ? '#9CA3AF' : '#15803D',
                    }}>{out ? '×' : '✓'}</span>
                    {ing}
                  </button>
                );
              })}
            </div>
          </Section>
        )}

        {/* Extras */}
        {(it.extras?.length || 0) > 0 && (
          <Section title="Aggiungi extra">
            <div style={{display:'flex', flexDirection:'column'}}>
              {it.extras.map(ex => {
                const q = c.extras[ex.id] || 0;
                return (
                  <div key={ex.id} style={{
                    display:'flex', alignItems:'center', gap: 10,
                    padding:'10px 0', borderBottom:'1px solid #F0F2F5',
                  }}>
                    <div style={{flex:1, minWidth: 0}}>
                      <div style={{fontSize: 13, fontWeight: 600, color:'#0F1115'}}>{ex.nome}</div>
                      <div style={{fontSize: 11.5, color:'#6B7280', marginTop: 1}}>
                        {ex.prezzo === 0 ? 'gratis' : `+€${ex.prezzo.toFixed(2)}`}
                      </div>
                    </div>
                    {q === 0 ? (
                      <button onClick={()=>setExtra(ex.id, 1)} style={{
                        width: 30, height: 30, borderRadius: 8,
                        background:'#F1F2F5', border:'none', cursor:'pointer',
                        color:'#0F1115', fontSize: 16, fontWeight: 800, fontFamily:'inherit',
                        display:'grid', placeItems:'center',
                      }}>+</button>
                    ) : (
                      <div style={{
                        display:'inline-flex', alignItems:'center', gap: 6,
                        background:'#0F1115', borderRadius: 999, padding: '3px 4px',
                      }}>
                        <button onClick={()=>setExtra(ex.id, q-1)} style={{
                          width: 24, height: 24, borderRadius: 999,
                          background:'rgba(255,255,255,0.15)', border:'none',
                          color:'#fff', fontSize: 14, fontWeight: 800, cursor:'pointer',
                          fontFamily:'inherit', display:'grid', placeItems:'center',
                        }}>−</button>
                        <span style={{fontSize: 12, fontWeight: 800, color:'#fff', minWidth: 14, textAlign:'center'}}>{q}</span>
                        <button onClick={()=>setExtra(ex.id, q+1)} style={{
                          width: 24, height: 24, borderRadius: 999,
                          background:'rgba(255,255,255,0.15)', border:'none',
                          color:'#fff', fontSize: 14, fontWeight: 800, cursor:'pointer',
                          fontFamily:'inherit', display:'grid', placeItems:'center',
                        }}>+</button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Section>
        )}

        {/* Note cucina removed — solo varianti/extras strutturate */}
      </div>

      {/* Footer: qty + add */}
      <div style={{
        borderTop:'1px solid #F0F2F5', padding:'14px 20px', background:'#fff',
        display:'flex', alignItems:'center', gap: 12,
      }}>
        <div style={{
          display:'inline-flex', alignItems:'center', gap: 6,
          background:'#F1F2F5', borderRadius: 999, padding: 4,
        }}>
          <button onClick={()=>setC(s=>({...s, qty: Math.max(1, s.qty-1)}))} disabled={c.qty<=1} style={{
            width: 30, height: 30, borderRadius: 999,
            background: c.qty<=1 ? 'transparent' : '#fff', border:'none',
            color: c.qty<=1 ? '#C9CDD3' : '#0F1115', fontSize: 16, fontWeight: 800,
            cursor: c.qty<=1 ? 'default' : 'pointer', fontFamily:'inherit',
            display:'grid', placeItems:'center',
          }}>−</button>
          <span style={{fontSize: 14, fontWeight: 800, color:'#0F1115', minWidth: 18, textAlign:'center'}}>{c.qty}</span>
          <button onClick={()=>setC(s=>({...s, qty: s.qty+1}))} style={{
            width: 30, height: 30, borderRadius: 999,
            background:'#fff', border:'none',
            color:'#0F1115', fontSize: 16, fontWeight: 800,
            cursor:'pointer', fontFamily:'inherit',
            display:'grid', placeItems:'center',
          }}>+</button>
        </div>
        <button onClick={onAdd} disabled={!canAdd} style={{
          flex:1, padding:'12px 16px',
          background: canAdd ? '#0F1115' : '#E5E7EB',
          color: canAdd ? '#fff' : '#9CA3AF',
          border:'none', borderRadius: 10,
          fontSize: 13.5, fontWeight: 700,
          cursor: canAdd ? 'pointer' : 'not-allowed', fontFamily:'inherit',
          display:'inline-flex', alignItems:'center', justifyContent:'center', gap: 8,
          minHeight: 44,
        }}>
          Aggiungi · €{total.toFixed(2)}
        </button>
      </div>
    </>
  );
}

function Section({ title, hint, children }) {
  return (
    <div style={{marginBottom: 22}}>
      <div style={{display:'flex', alignItems:'baseline', gap: 6, marginBottom: 10}}>
        <span style={{fontSize: 13, fontWeight: 800, color:'#0F1115', letterSpacing: -0.1}}>{title}</span>
        {hint && <span style={{fontSize: 11, color:'#9CA3AF', marginLeft: 'auto'}}>{hint}</span>}
      </div>
      {children}
    </div>
  );
}

window.SalaV3ArticoloSheet = SalaV3ArticoloSheet;
