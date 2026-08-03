// Sala — Flow "+ Articolo": modale centrale con browse + customizza (ingredienti, extras, varianti)

function SalaArticoloSheet({ open, tavolo, cart, onCartChange, onClose, onConfirm }) {
  const [category, setCategory] = React.useState('Antipasti');
  const [search, setSearch] = React.useState('');
  const [customizing, setCustomizing] = React.useState(null); // { item, removed, extras, variants, note, qty }
  const [confirmDiscard, setConfirmDiscard] = React.useState(false);

  if (!open || !tavolo) return null;

  const menu = window.SALA_MENU;
  const categories = Object.keys(menu);
  const items = menu[category].filter(i =>
    !search.trim() || i.nome.toLowerCase().includes(search.toLowerCase())
  );

  const total = cart?.items.reduce((s, i) => s + i.qty * i.prezzo, 0) || 0;
  const itemCount = cart?.items.reduce((s, i) => s + i.qty, 0) || 0;

  function hasCustomization(it) {
    return (it.ingredients?.length || 0) + (it.extras?.length || 0) + (it.variants?.length || 0) > 0;
  }

  function handleClose() {
    if (itemCount > 0) { setConfirmDiscard(true); return; }
    onClose();
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
      <div onClick={handleClose} style={{
        position:'absolute', inset: 0, background:'rgba(15,17,21,0.55)',
        zIndex: 60, animation: 'artFadeIn 0.18s ease',
      }}/>
      {/* Dialog centrale — stessa famiglia della finestra "Salda conto":
          la comanda si prende il centro della sala, non una colonna a destra.
          In browse serve larghezza (categorie + griglia articoli + carrello
          sempre visibile); in personalizza il contenuto si stringe a una
          colonna leggibile invece di stirarsi su tutta la finestra. */}
      <div style={{
        position:'absolute', top:'50%', left:'50%',
        width: 1040, maxWidth:'92%',
        height: 660, maxHeight:'88%',
        background:'#fff', borderRadius: 16,
        boxShadow:'0 24px 70px rgba(0,0,0,0.28)',
        zIndex: 61, display:'flex', flexDirection:'column', overflow:'hidden',
        transform:'translate(-50%, -50%)',
        animation:'artPopIn 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      }}>
        {/* Header */}
        <div style={{
          padding:'16px 22px', borderBottom:'1px solid #F0F2F5',
          display:'flex', alignItems:'center', gap: 12, flexShrink: 0,
        }}>
          {customizing && (
            <button onClick={()=>setCustomizing(null)} style={{
              width: 32, height: 32, borderRadius: 8,
              background:'#F1F2F5', border:'none', cursor:'pointer',
              color:'#0F1115', fontSize: 20, fontFamily:'inherit',
              display:'grid', placeItems:'center',
            }} aria-label="Indietro">‹</button>
          )}
          <div style={{flex:1}}>
            <div style={{fontSize: 15, color:'#6B7280', fontWeight: 700, letterSpacing: 0.5, textTransform:'uppercase'}}>
              {customizing ? 'Personalizza' : 'Aggiungi articolo'}
            </div>
            <div style={{fontSize: 21, fontWeight: 800, color:'#0F1115', marginTop: 2,
              overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>
              {customizing ? customizing.item.nome : `Tavolo ${tavolo.id}${tavolo.party ? ` · ${tavolo.party}` : ''}`}
            </div>
          </div>
          <button onClick={handleClose} style={{
            width: 32, height: 32, borderRadius: 8,
            background:'#F1F2F5', border:'none', cursor:'pointer',
            color:'#0F1115', fontSize: 20, fontFamily:'inherit',
            display:'grid', placeItems:'center',
          }}>×</button>
        </div>

        {customizing ? (
          <CustomizeView c={customizing} setC={setCustomizing} onAdd={commitCustomization}/>
        ) : (
          <div style={{flex:1, display:'flex', minHeight: 0}}>
            <BrowseView
              search={search} setSearch={setSearch}
              categories={categories} category={category} setCategory={setCategory}
              items={items} cart={cart}
              onItemClick={handleItemClick} onQuickAdd={quickAdd}
              hasCustomization={hasCustomization}/>
            {/* Carrello: colonna fissa a destra dentro la finestra — nel
                formato largo il riepilogo sta accanto agli articoli, non
                compresso in un footer da 140px. */}
            <CartPanel
              cart={cart} itemCount={itemCount} total={total}
              onCartChange={onCartChange} onConfirm={onConfirm}/>
          </div>
        )}
      </div>

      {confirmDiscard && (
        <div style={{
          position:'absolute', inset: 0, zIndex: 70,
          background:'rgba(15,17,21,0.48)',
          display:'flex', alignItems:'center', justifyContent:'center',
          padding: 24,
        }}>
          <div style={{
            background:'#fff', borderRadius: 14,
            padding:'24px 22px', maxWidth: 340, width:'100%',
            boxShadow:'0 16px 48px rgba(0,0,0,0.22)',
          }}>
            <div style={{fontSize: 20, fontWeight: 800, color:'#0F1115', marginBottom: 8}}>
              Sei sicuro?
            </div>
            <div style={{fontSize: 17, color:'#6B7280', lineHeight: 1.5, marginBottom: 22}}>
              Se confermi <strong style={{color:'#0F1115'}}>NON</strong> verrà inviato l'ordine e gli articoli selezionati andranno persi.
            </div>
            <div style={{display:'flex', gap: 8}}>
              <button
                onClick={() => setConfirmDiscard(false)}
                style={{
                  flex: 1, padding:'10px 0', borderRadius: 8,
                  background:'#F3F4F6', color:'#0F1115', border:'none',
                  fontSize: 17, fontWeight: 700, cursor:'pointer', fontFamily:'inherit',
                }}>
                Annulla
              </button>
              <button
                onClick={() => { onCartChange({ tableId: null, items: [] }); setConfirmDiscard(false); onClose(); }}
                style={{
                  flex: 1, padding:'10px 0', borderRadius: 8,
                  background:'#DC2626', color:'#fff', border:'none',
                  fontSize: 17, fontWeight: 700, cursor:'pointer', fontFamily:'inherit',
                }}>
                Conferma
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes artFadeIn { from {opacity: 0;} to {opacity: 1;} }
        @keyframes artPopIn {
          from { opacity: 0; transform: translate(-50%, -50%) scale(0.96); }
          to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
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
        <span style={{fontSize: 15, fontWeight: 800, color:'#9A3412', minWidth: 26}}>{it.qty}×</span>
        <span style={{flex:1, fontSize: 16, color:'#0F1115', fontWeight: 600,
          overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{it.nome}</span>
        <span style={{fontSize: 15.5, color:'#6B7280', fontWeight: 600}}>
          €{(it.qty * it.prezzo).toFixed(2)}
        </span>
        <button onClick={onRemove} style={{
          width: 22, height: 22, borderRadius: 4,
          background:'#fff', border:'1px solid #E5E7EB',
          color:'#6B7280', fontSize: 18, fontWeight: 700,
          cursor:'pointer', fontFamily:'inherit', padding: 0,
          display:'grid', placeItems:'center',
        }}>−</button>
      </div>
      {hasMods && (
        <div style={{paddingLeft: 32, fontSize: 14.5, color:'#6B7280', lineHeight: 1.45}}>
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
      {/* Categorie */}
      <div className="pn-scroll" style={{
        width: 176, borderRight:'1px solid #F0F2F5', flexShrink: 0,
        overflow:'auto', padding: '10px 0', background:'#FAFBFC',
      }}>
        {categories.map(c => {
          const on = category === c;
          return (
            <button key={c} onClick={()=>setCategory(c)} style={{
              width:'100%', textAlign:'left',
              padding:'11px 16px', border:'none',
              background: on ? '#fff' : 'transparent',
              color: on ? '#0F1115' : '#6B7280',
              fontSize: 16.5, fontWeight: on ? 700 : 500,
              cursor:'pointer', fontFamily:'inherit',
              borderLeft: on ? '3px solid #E04347' : '3px solid transparent',
            }}>{c}</button>
          );
        })}
      </div>

      {/* Ricerca + griglia articoli */}
      <div style={{flex:1, display:'flex', flexDirection:'column', minWidth: 0, minHeight: 0}}>
        <div style={{padding:'12px 18px', borderBottom:'1px solid #F0F2F5', flexShrink: 0}}>
          <div style={{position:'relative'}}>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Cerca articolo…"
              style={{
                width:'100%', padding:'10px 12px 10px 36px',
                background:'#F8F9FB', border:'1px solid #F0F2F5',
                borderRadius: 8, fontSize: 17, color:'#0F1115',
                outline:'none', fontFamily:'inherit',
              }}/>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B7280"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              style={{position:'absolute', left: 12, top:'50%', transform:'translateY(-50%)'}}>
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
          </div>
        </div>

        <div className="pn-scroll" style={{flex:1, overflow:'auto', padding: 14, minHeight: 0}}>
          {items.length === 0 ? (
            <div style={{padding: 30, textAlign:'center', color:'#9CA3AF', fontSize: 16.5}}>
              Nessun articolo trovato
            </div>
          ) : (
            <div style={{
              display:'grid', gap: 8,
              gridTemplateColumns:'repeat(auto-fill, minmax(240px, 1fr))',
              alignContent:'start',
            }}>
              {items.map(it => {
                const inCart = cart?.items.find(x => x.id === it.id && !x.customized);
                const customizable = hasCustomization(it);
                return (
                  <div key={it.id} onClick={()=>onItemClick(it)} style={{
                    display:'flex', alignItems:'center', gap: 10,
                    padding:'11px 12px',
                    background:'#fff',
                    border:'1px solid #F0F2F5',
                    borderRadius: 10, cursor:'pointer',
                  }}>
                    {/* overflow:hidden anche qui: la riga meta è una inline-flex,
                        non si stringe da sola e senza taglio finirebbe sotto
                        il badge "×N" quando la cella della griglia è stretta. */}
                    <div style={{flex:1, minWidth: 0, overflow:'hidden'}}>
                      <div style={{fontSize: 17, fontWeight: 600, color:'#0F1115',
                        overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{it.nome}</div>
                      <div style={{
                        fontSize: 14, color:'#6B7280', marginTop: 2,
                        display:'flex', alignItems:'center', gap: 4,
                        whiteSpace:'nowrap', overflow:'hidden',
                      }}>
                        <span style={{fontSize: 15.5, fontWeight: 700, color:'#6B7280', flexShrink: 0}}>
                          €{it.prezzo.toFixed(2)}
                        </span>
                        {customizable && (
                          <>
                            <span style={{color:'#D6D9DE', flexShrink: 0}}>·</span>
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink: 0}}>
                              <path d="M12 20h9 M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4z"/>
                            </svg>
                            <span style={{overflow:'hidden', textOverflow:'ellipsis'}}>Personalizzabile</span>
                          </>
                        )}
                      </div>
                    </div>
                    {inCart && (
                      <span style={{
                        fontSize: 15, fontWeight: 700, flexShrink: 0,
                        color:'#6B7280', background:'#F1F2F5',
                        padding:'2px 8px', borderRadius: 999,
                      }}>×{inCart.qty}</span>
                    )}
                    <button onClick={(e)=>{ e.stopPropagation(); onQuickAdd(it); }} style={{
                      width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                      background:'#F1F2F5', color:'#0F1115',
                      border:'none', cursor:'pointer', fontFamily:'inherit',
                      display:'grid', placeItems:'center',
                      fontSize: 18, fontWeight: 800,
                    }}>+</button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ─── Carrello: colonna destra del modale ────────────────────
function CartPanel({ cart, itemCount, total, onCartChange, onConfirm }) {
  return (
    <div style={{
      width: 330, flexShrink: 0, borderLeft:'1px solid #F0F2F5',
      display:'flex', flexDirection:'column', background:'#FAFBFC', minHeight: 0,
    }}>
      <div style={{
        padding:'14px 18px 10px', flexShrink: 0,
        display:'flex', alignItems:'baseline', gap: 8,
      }}>
        <span style={{fontSize: 15, fontWeight: 800, color:'#0F1115', letterSpacing: 0.4, textTransform:'uppercase'}}>
          Comanda
        </span>
        {itemCount > 0 && (
          <span style={{fontSize: 15, color:'#6B7280', fontWeight: 600}}>
            {itemCount} articol{itemCount === 1 ? 'o' : 'i'}
          </span>
        )}
      </div>

      {itemCount === 0 ? (
        <div style={{
          flex:1, display:'grid', placeItems:'center', padding:'0 24px',
          textAlign:'center', fontSize: 16, color:'#9CA3AF', lineHeight: 1.5,
        }}>
          Tap su un articolo per aggiungerlo
        </div>
      ) : (
        <div className="pn-scroll" style={{
          flex:1, overflow:'auto', padding:'0 18px 12px', minHeight: 0,
          display:'flex', flexDirection:'column', gap: 8,
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
      )}

      <div style={{
        borderTop:'1px solid #F0F2F5', padding:'14px 18px',
        background:'#fff', flexShrink: 0,
      }}>
        <div style={{display:'flex', alignItems:'baseline', gap: 8, marginBottom: 10}}>
          <span style={{fontSize: 14, color:'#6B7280', fontWeight: 700, textTransform:'uppercase', letterSpacing: 0.4}}>
            Totale
          </span>
          <span style={{flex:1}}/>
          <span style={{fontSize: 26, fontWeight: 800, color:'#0F1115', letterSpacing: -0.5, lineHeight: 1.1}}>
            €{total.toFixed(2)}
          </span>
        </div>
        <button onClick={onConfirm} disabled={itemCount === 0} style={{
          width:'100%', padding:'12px 22px',
          background: itemCount === 0 ? '#E5E7EB' : '#0F1115',
          color: itemCount === 0 ? '#9CA3AF' : '#fff',
          border:'none', borderRadius: 10, fontSize: 17.5, fontWeight: 700,
          cursor: itemCount === 0 ? 'not-allowed' : 'pointer', fontFamily:'inherit',
          display:'inline-flex', alignItems:'center', justifyContent:'center', gap: 8, minHeight: 46,
        }}>
          Invia ordine
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14 M13 6l6 6-6 6"/>
          </svg>
        </button>
      </div>
    </div>
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
      {/* Colonna centrata: personalizzare un piatto è una lista di scelte,
          non merita 1000px di larghezza. */}
      <div className="pn-scroll" style={{
        flex:1, overflow:'auto', padding: '18px 24px 22px',
        maxWidth: 720, width:'100%', margin:'0 auto', minHeight: 0,
      }}>
        {/* Riepilogo prezzo base */}
        <div style={{
          display:'flex', alignItems:'center', justifyContent:'space-between',
          padding:'10px 12px', background:'#FAFBFC',
          border:'1px solid #F0F2F5', borderRadius: 8, marginBottom: 18,
        }}>
          <span style={{fontSize: 16, color:'#6B7280', fontWeight: 600}}>Prezzo base</span>
          <span style={{fontSize: 18, fontWeight: 800, color:'#0F1115'}}>€{it.prezzo.toFixed(2)}</span>
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
                    fontSize: 16.5, fontWeight: 600, fontFamily:'inherit', cursor:'pointer',
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
                    fontSize: 16.5, fontWeight: 600, fontFamily:'inherit', cursor:'pointer',
                    textDecoration: out ? 'line-through' : 'none',
                    display:'inline-flex', alignItems:'center', gap: 4,
                  }}>
                    <span style={{
                      fontSize: 15, fontWeight: 800,
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
                      <div style={{fontSize: 17, fontWeight: 600, color:'#0F1115'}}>{ex.nome}</div>
                      <div style={{fontSize: 15.5, color:'#6B7280', marginTop: 1}}>
                        {ex.prezzo === 0 ? 'gratis' : `+€${ex.prezzo.toFixed(2)}`}
                      </div>
                    </div>
                    {q === 0 ? (
                      <button onClick={()=>setExtra(ex.id, 1)} style={{
                        width: 30, height: 30, borderRadius: 8,
                        background:'#F1F2F5', border:'none', cursor:'pointer',
                        color:'#0F1115', fontSize: 20, fontWeight: 800, fontFamily:'inherit',
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
                          color:'#fff', fontSize: 18, fontWeight: 800, cursor:'pointer',
                          fontFamily:'inherit', display:'grid', placeItems:'center',
                        }}>−</button>
                        <span style={{fontSize: 16, fontWeight: 800, color:'#fff', minWidth: 14, textAlign:'center'}}>{q}</span>
                        <button onClick={()=>setExtra(ex.id, q+1)} style={{
                          width: 24, height: 24, borderRadius: 999,
                          background:'rgba(255,255,255,0.15)', border:'none',
                          color:'#fff', fontSize: 18, fontWeight: 800, cursor:'pointer',
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

      {/* Footer: qty + add — barra a tutta larghezza, controlli allineati
          alla colonna del contenuto. */}
      <div style={{
        borderTop:'1px solid #F0F2F5', padding:'14px 24px', background:'#fff',
        flexShrink: 0,
      }}>
      <div style={{
        display:'flex', alignItems:'center', gap: 12,
        maxWidth: 672, width:'100%', margin:'0 auto',
      }}>
        <div style={{
          display:'inline-flex', alignItems:'center', gap: 6,
          background:'#F1F2F5', borderRadius: 999, padding: 4,
        }}>
          <button onClick={()=>setC(s=>({...s, qty: Math.max(1, s.qty-1)}))} disabled={c.qty<=1} style={{
            width: 30, height: 30, borderRadius: 999,
            background: c.qty<=1 ? 'transparent' : '#fff', border:'none',
            color: c.qty<=1 ? '#C9CDD3' : '#0F1115', fontSize: 20, fontWeight: 800,
            cursor: c.qty<=1 ? 'default' : 'pointer', fontFamily:'inherit',
            display:'grid', placeItems:'center',
          }}>−</button>
          <span style={{fontSize: 18, fontWeight: 800, color:'#0F1115', minWidth: 18, textAlign:'center'}}>{c.qty}</span>
          <button onClick={()=>setC(s=>({...s, qty: s.qty+1}))} style={{
            width: 30, height: 30, borderRadius: 999,
            background:'#fff', border:'none',
            color:'#0F1115', fontSize: 20, fontWeight: 800,
            cursor:'pointer', fontFamily:'inherit',
            display:'grid', placeItems:'center',
          }}>+</button>
        </div>
        <button onClick={onAdd} disabled={!canAdd} style={{
          flex:1, padding:'12px 16px',
          background: canAdd ? '#0F1115' : '#E5E7EB',
          color: canAdd ? '#fff' : '#9CA3AF',
          border:'none', borderRadius: 10,
          fontSize: 17.5, fontWeight: 700,
          cursor: canAdd ? 'pointer' : 'not-allowed', fontFamily:'inherit',
          display:'inline-flex', alignItems:'center', justifyContent:'center', gap: 8,
          minHeight: 44,
        }}>
          Aggiungi · €{total.toFixed(2)}
        </button>
      </div>
      </div>
    </>
  );
}

function Section({ title, hint, children }) {
  return (
    <div style={{marginBottom: 22}}>
      <div style={{display:'flex', alignItems:'baseline', gap: 6, marginBottom: 10}}>
        <span style={{fontSize: 17, fontWeight: 800, color:'#0F1115', letterSpacing: -0.1}}>{title}</span>
        {hint && <span style={{fontSize: 15, color:'#9CA3AF', marginLeft: 'auto'}}>{hint}</span>}
      </div>
      {children}
    </div>
  );
}

window.SalaArticoloSheet = SalaArticoloSheet;
