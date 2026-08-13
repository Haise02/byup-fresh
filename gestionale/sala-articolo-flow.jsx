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
      <div className="sala-art-modal" style={{
        position:'absolute', top:'50%', left:'50%',
        width: 1040, maxWidth:'92%',
        height: 660, maxHeight:'88%',
        background:'#fff', borderRadius: 22,
        border: `1px solid ${PN.BORDER_HAIR}`,
        boxShadow:'0 32px 80px rgba(15,17,21,0.24), 0 2px 6px rgba(15,17,21,0.08)',
        zIndex: 61, display:'flex', flexDirection:'column', overflow:'hidden',
        transform:'translate(-50%, -50%)',
        animation:'artPopIn 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      }}>
        {/* Header */}
        <div style={{
          padding:'18px 24px', borderBottom:`1px solid ${PN.BORDER_SOFT}`,
          display:'flex', alignItems:'center', gap: 14, flexShrink: 0,
        }}>
          {customizing ? (
            <button onClick={()=>setCustomizing(null)} style={{
              width: 42, height: 42, borderRadius: 12, flexShrink: 0,
              background: PN.BTN_NEUTRAL, border:`1px solid ${PN.BORDER_LIGHT}`,
              boxShadow: PN.INSET_HIGHLIGHT, cursor:'pointer',
              color: PN.TEXT, fontFamily:'inherit',
              display:'grid', placeItems:'center',
            }} aria-label="Indietro">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6"/>
              </svg>
            </button>
          ) : (
            <div style={{
              width: 42, height: 42, borderRadius: 12, flexShrink: 0,
              background: PN.PINK_BG_SOFT, color: PN.PINK_DARK,
              boxShadow: PN.INSET_HIGHLIGHT,
              display:'grid', placeItems:'center',
            }}>
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14 M5 12h14"/>
              </svg>
            </div>
          )}
          <div style={{flex:1, minWidth: 0}}>
            <div style={{fontSize: 14.5, color: PN.MUTED, fontWeight: 700, letterSpacing: 0.6, textTransform:'uppercase'}}>
              {/* Lo stesso nome del link nella card che apre questa finestra:
                  un gesto, un nome. */}
              {customizing ? 'Personalizza' : 'Crea ordine'}
            </div>
            <div style={{fontSize: 21, fontWeight: 800, color: PN.TEXT, marginTop: 1, letterSpacing:-0.3,
              overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>
              {customizing ? customizing.item.nome : `Tavolo ${tavolo.id}${tavolo.party ? ` · ${tavolo.party}` : ''}`}
            </div>
          </div>
          <button onClick={handleClose}
            onMouseEnter={e => { e.currentTarget.style.background = PN.WHITE_HUSH; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
            style={{
            width: 36, height: 36, borderRadius: 10,
            background:'transparent', border:'none', cursor:'pointer',
            color: PN.MUTED, fontFamily:'inherit',
            display:'grid', placeItems:'center',
            transition:'background 130ms ease',
          }} aria-label="Chiudi">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18 M6 6l12 12"/>
            </svg>
          </button>
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
            background:'#fff', borderRadius: 18,
            border:`1px solid ${PN.BORDER_HAIR}`,
            padding:'26px 24px', maxWidth: 360, width:'100%',
            boxShadow:'0 32px 80px rgba(15,17,21,0.28), 0 2px 6px rgba(15,17,21,0.08)',
            animation:'artPopSmall 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
          }}>
            <div style={{
              width: 42, height: 42, borderRadius: 12, marginBottom: 14,
              background: PN.RED_SOFT, color: PN.RED,
              boxShadow: PN.INSET_HIGHLIGHT,
              display:'grid', placeItems:'center',
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 9v5 M12 17.5v.01 M10.3 3.9 2.6 17a1.9 1.9 0 0 0 1.7 2.9h15.4a1.9 1.9 0 0 0 1.7-2.9L13.7 3.9a1.9 1.9 0 0 0-3.4 0z"/>
              </svg>
            </div>
            <div style={{fontSize: 20, fontWeight: 800, color: PN.TEXT, marginBottom: 8, letterSpacing:-0.3}}>
              Sei sicuro?
            </div>
            <div style={{fontSize: 17, color: PN.MUTED, lineHeight: 1.5, marginBottom: 22}}>
              Se confermi <strong style={{color: PN.TEXT}}>NON</strong> verrà inviato l'ordine e gli articoli selezionati andranno persi.
            </div>
            <div style={{display:'flex', gap: 8}}>
              <button
                onClick={() => setConfirmDiscard(false)}
                onMouseEnter={e => { e.currentTarget.style.background = PN.BTN_NEUTRAL_HOVER; }}
                onMouseLeave={e => { e.currentTarget.style.background = PN.BTN_NEUTRAL; }}
                style={{
                  flex: 1, padding:'11px 0', borderRadius: 11,
                  background: PN.BTN_NEUTRAL, color: PN.TEXT,
                  border:`1px solid ${PN.BORDER_LIGHT}`, boxShadow: PN.INSET_HIGHLIGHT,
                  fontSize: 17, fontWeight: 700, cursor:'pointer', fontFamily:'inherit',
                  transition:'background 130ms ease',
                }}>
                Annulla
              </button>
              <button
                onClick={() => { onCartChange({ tableId: null, items: [] }); setConfirmDiscard(false); onClose(); }}
                onMouseEnter={e => { e.currentTarget.style.background = PN.BTN_DANGER_HOVER; }}
                onMouseLeave={e => { e.currentTarget.style.background = PN.BTN_DANGER; }}
                style={{
                  flex: 1, padding:'11px 0', borderRadius: 11,
                  background: PN.BTN_DANGER, color:'#fff', border:'none',
                  boxShadow:`${PN.INSET_HIGHLIGHT_BRAND}, 0 4px 14px rgba(220,38,38,0.28)`,
                  fontSize: 17, fontWeight: 700, cursor:'pointer', fontFamily:'inherit',
                  transition:'background 130ms ease',
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
        @keyframes artPopSmall {
          from { opacity: 0; transform: scale(0.96) translateY(6px); }
          to   { opacity: 1; transform: none; }
        }
        .sala-art-modal input:focus {
          border-color: ${PN.PINK};
          box-shadow: 0 0 0 3px rgba(255, 90, 95, 0.14);
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
      <div style={{display:'flex', alignItems:'center', gap: 8}}>
        <span style={{fontSize: 15, fontWeight: 800, color: PN.PINK_DARK, minWidth: 26, fontVariantNumeric:'tabular-nums'}}>{it.qty}×</span>
        <span style={{flex:1, fontSize: 16, color: PN.TEXT, fontWeight: 600,
          overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{it.nome}</span>
        <span style={{fontSize: 15.5, color: PN.MUTED, fontWeight: 600, fontVariantNumeric:'tabular-nums'}}>
          €{(it.qty * it.prezzo).toFixed(2)}
        </span>
        <button onClick={onRemove} aria-label={`Togli ${it.nome}`}
          onMouseEnter={e => { e.currentTarget.style.background = PN.RED_SOFT; e.currentTarget.style.color = PN.RED; e.currentTarget.style.borderColor = PN.RED_SOFT; }}
          onMouseLeave={e => { e.currentTarget.style.background = PN.WHITE; e.currentTarget.style.color = PN.MUTED_SOFT; e.currentTarget.style.borderColor = PN.BORDER_LIGHT; }}
          style={{
          width: 24, height: 24, borderRadius: 7,
          background: PN.WHITE, border:`1px solid ${PN.BORDER_LIGHT}`,
          color: PN.MUTED_SOFT,
          cursor:'pointer', fontFamily:'inherit', padding: 0,
          display:'grid', placeItems:'center',
          transition:'background 130ms ease, color 130ms ease, border-color 130ms ease',
        }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="3" strokeLinecap="round"><path d="M5 12h14"/></svg>
        </button>
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
      {/* Categorie — pill attiva come la voce accesa della sidebar,
          non un bordino colorato appiccicato al lato. */}
      <div className="pn-scroll" style={{
        width: 182, borderRight:`1px solid ${PN.BORDER_SOFT}`, flexShrink: 0,
        overflow:'auto', padding: '12px 10px', background: PN.WHITE_OFF,
      }}>
        {categories.map(c => {
          const on = category === c;
          return (
            <button key={c} onClick={()=>setCategory(c)}
              onMouseEnter={e => { if (!on) e.currentTarget.style.background = PN.WHITE_HUSH; }}
              onMouseLeave={e => { if (!on) e.currentTarget.style.background = 'transparent'; }}
              style={{
              width:'100%', textAlign:'left', marginBottom: 2,
              padding:'10px 14px', borderRadius: 10,
              border: on ? `1px solid ${PN.PINK_SOFT}` : '1px solid transparent',
              background: on ? PN.PINK_BG_SOFT : 'transparent',
              color: on ? PN.PINK_DARK : PN.MUTED,
              fontSize: 16.5, fontWeight: on ? 700 : 500,
              cursor:'pointer', fontFamily:'inherit',
              transition:'background 130ms ease, color 130ms ease',
            }}>{c}</button>
          );
        })}
      </div>

      {/* Ricerca + griglia articoli */}
      <div style={{flex:1, display:'flex', flexDirection:'column', minWidth: 0, minHeight: 0}}>
        <div style={{padding:'14px 18px', borderBottom:`1px solid ${PN.BORDER_SOFT}`, flexShrink: 0}}>
          <div style={{position:'relative'}}>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Cerca articolo…"
              style={{
                width:'100%', padding:'11px 14px 11px 38px',
                background: PN.WHITE, border:`1px solid ${PN.BORDER}`,
                borderRadius: 10, fontSize: 17, color: PN.TEXT,
                outline:'none', fontFamily:'inherit',
                transition:'border-color 130ms ease, box-shadow 150ms ease',
              }}/>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={PN.MUTED_SOFT}
              strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
              style={{position:'absolute', left: 13, top:'50%', transform:'translateY(-50%)'}}>
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
            // Colonne da 300: nello spazio che resta tra rail e comanda ne
            // entra una sola, e la riga piena col prezzo incolonnato a destra
            // legge meglio di due celle strette che troncano i nomi. Su shell
            // più larghe la griglia passa da sé a due colonne.
            <div style={{
              display:'grid', gap: 10,
              gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))',
              alignContent:'start',
            }}>
              {items.map(it => {
                const inCart = cart?.items.find(x => x.id === it.id && !x.customized);
                const customizable = hasCustomization(it);
                return (
                  <div key={it.id} onClick={()=>onItemClick(it)}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = PN.BORDER_MED; e.currentTarget.style.boxShadow = PN.CARD_SHADOW_HOVER; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = PN.BORDER_LIGHT; e.currentTarget.style.boxShadow = PN.CARD_SHADOW; }}
                    style={{
                    display:'flex', alignItems:'center', gap: 10,
                    padding:'12px 13px',
                    background: PN.WHITE,
                    border:`1px solid ${PN.BORDER_LIGHT}`,
                    boxShadow: PN.CARD_SHADOW,
                    borderRadius: 12, cursor:'pointer',
                    transition:'border-color 130ms ease, box-shadow 150ms ease',
                  }}>
                    {/* Prezzo a destra, incolonnato: sulla riga larga tiene
                        l'occhio su un asse solo. overflow:hidden sul blocco
                        testo perché la riga meta è una flex e senza taglio
                        finirebbe sotto il badge "×N". */}
                    <div style={{flex:1, minWidth: 0, overflow:'hidden'}}>
                      <div style={{fontSize: 17, fontWeight: 600, color: PN.TEXT,
                        overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{it.nome}</div>
                      {customizable && (
                        <div style={{
                          fontSize: 14, color: PN.MUTED_SOFT, marginTop: 3,
                          display:'flex', alignItems:'center', gap: 5,
                          whiteSpace:'nowrap', overflow:'hidden',
                        }}>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink: 0}}>
                            <path d="M12 20h9 M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4z"/>
                          </svg>
                          <span style={{overflow:'hidden', textOverflow:'ellipsis'}}>Personalizzabile</span>
                        </div>
                      )}
                    </div>
                    <span style={{fontSize: 16.5, fontWeight: 700, color: PN.TEXT, flexShrink: 0, fontVariantNumeric:'tabular-nums'}}>
                      €{it.prezzo.toFixed(2)}
                    </span>
                    {inCart && (
                      <span style={{
                        fontSize: 15, fontWeight: 700, flexShrink: 0,
                        color: PN.PINK_DARK, background: PN.PINK_BG_SOFT,
                        padding:'2px 8px', borderRadius: 999,
                      }}>×{inCart.qty}</span>
                    )}
                    <button onClick={(e)=>{ e.stopPropagation(); onQuickAdd(it); }} aria-label={`Aggiungi ${it.nome}`} style={{
                      width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                      background: PN.BTN_NEUTRAL, color: PN.TEXT,
                      border:`1px solid ${PN.BORDER_LIGHT}`, boxShadow: PN.INSET_HIGHLIGHT,
                      cursor:'pointer', fontFamily:'inherit',
                      display:'grid', placeItems:'center',
                    }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 5v14 M5 12h14"/>
                      </svg>
                    </button>
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
      width: 330, flexShrink: 0, borderLeft:`1px solid ${PN.BORDER_SOFT}`,
      display:'flex', flexDirection:'column', background: PN.WHITE_OFF, minHeight: 0,
    }}>
      <div style={{
        padding:'16px 18px 12px', flexShrink: 0,
        display:'flex', alignItems:'baseline', gap: 8,
      }}>
        <span style={{fontSize: 13.5, fontWeight: 700, color: PN.MUTED_SOFT, letterSpacing: 0.7, textTransform:'uppercase'}}>
          Comanda
        </span>
        {itemCount > 0 && (
          <span style={{fontSize: 15, color: PN.MUTED, fontWeight: 600}}>
            {itemCount} articol{itemCount === 1 ? 'o' : 'i'}
          </span>
        )}
      </div>

      {itemCount === 0 ? (
        <div style={{
          flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
          gap: 12, padding:'0 26px', textAlign:'center',
        }}>
          <div style={{
            width: 46, height: 46, borderRadius: 14,
            background: PN.WHITE, border:`1px solid ${PN.BORDER_LIGHT}`,
            boxShadow: PN.CARD_SHADOW, color: PN.MUTED_LIGHT,
            display:'grid', placeItems:'center',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 4h13l-1.5 9H7.5L6 4z M6 4L5.4 2H3 M8 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2z M17 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/>
            </svg>
          </div>
          <div style={{fontSize: 16, color: PN.MUTED_SOFT, lineHeight: 1.5}}>
            Tap su un articolo per aggiungerlo
          </div>
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
        borderTop:`1px solid ${PN.BORDER_SOFT}`, padding:'16px 18px',
        background: PN.WHITE, flexShrink: 0,
      }}>
        <div style={{display:'flex', alignItems:'baseline', gap: 8, marginBottom: 12}}>
          <span style={{fontSize: 13.5, color: PN.MUTED_SOFT, fontWeight: 700, textTransform:'uppercase', letterSpacing: 0.7}}>
            Totale
          </span>
          <span style={{flex:1}}/>
          <span style={{fontSize: 27, fontWeight: 800, color: PN.TEXT, letterSpacing: -0.6, lineHeight: 1.1, fontVariantNumeric:'tabular-nums'}}>
            €{total.toFixed(2)}
          </span>
        </div>
        <button onClick={onConfirm} disabled={itemCount === 0}
          onMouseEnter={e => { if (itemCount) e.currentTarget.style.background = PN.BTN_DARK_HOVER; }}
          onMouseLeave={e => { if (itemCount) e.currentTarget.style.background = PN.BTN_DARK; }}
          style={{
          width:'100%', padding:'12px 22px',
          background: itemCount === 0 ? PN.WHITE_FROST : PN.BTN_DARK,
          color: itemCount === 0 ? PN.MUTED_SOFT : '#fff',
          border:'none', borderRadius: 12, fontSize: 17.5, fontWeight: 700,
          boxShadow: itemCount === 0 ? 'none' : `${PN.INSET_HIGHLIGHT_DARK}, 0 4px 14px rgba(15,17,21,0.20)`,
          cursor: itemCount === 0 ? 'not-allowed' : 'pointer', fontFamily:'inherit',
          display:'inline-flex', alignItems:'center', justifyContent:'center', gap: 8, minHeight: 46,
          transition:'background 130ms ease, box-shadow 150ms ease',
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

  // Le scelte vive, nell'ordine in cui si leggono nel riepilogo.
  const chosenVariants = (it.variants || []).filter(v => c.variants[v.id])
    .map(v => ({ id: v.id, label: v.label, value: c.variants[v.id] }));
  const removedList = Object.keys(c.removed).filter(k => c.removed[k]);
  const chosenExtras = Object.entries(c.extras).filter(([_,q]) => q > 0)
    .map(([id, qty]) => { const ex = it.extras.find(x => x.id === id); return { id, nome: ex.nome, prezzo: ex.prezzo, qty }; });
  const hasChoices = chosenVariants.length + removedList.length + chosenExtras.length > 0;

  // Le opzioni vanno su due colonne solo se c'è roba da mettere in
  // entrambe: scelte del piatto (varianti + ingredienti) da una parte,
  // extra dall'altra. Con un gruppo solo resta una colonna sola, larga.
  const hasPiatto = (it.variants?.length || 0) + (it.ingredients?.length || 0) > 0;
  const hasExtras = (it.extras?.length || 0) > 0;
  const twoCols = hasPiatto && hasExtras;

  return (
    <div style={{flex:1, display:'flex', minHeight: 0}}>
      {/* Opzioni — prendono la larghezza della finestra invece di stare in
          una colonna centrata con due vuoti ai lati. */}
      <div className="pn-scroll" style={{
        flex:1, overflow:'auto', padding: '20px 24px 24px', minWidth: 0, minHeight: 0,
      }}>
      <div style={{
        display:'grid', alignItems:'start',
        gridTemplateColumns: twoCols ? '1fr 1fr' : '1fr',
        gap:'0 28px',
        maxWidth: twoCols ? 'none' : 620,
      }}>
        <div>
        {/* Varianti */}
        {(it.variants || []).map(v => (
          <Section key={v.id} title={v.label}
            hint={!c.variants[v.id]
              ? <span style={{color: PN.PINK_DARK, fontWeight: 600}}>Obbligatorio</span>
              : null}>
            <div style={{display:'flex', flexWrap:'wrap', gap: 6}}>
              {v.options.map(opt => {
                const sel = c.variants[v.id] === opt;
                return (
                  <button key={opt} onClick={()=>setVariant(v.id, opt)} style={{
                    padding:'9px 16px', borderRadius: 999,
                    border: sel ? '1px solid transparent' : `1px solid ${PN.BORDER_LIGHT}`,
                    background: sel ? PN.BTN_DARK : PN.BTN_NEUTRAL,
                    boxShadow: sel ? PN.INSET_HIGHLIGHT_DARK : PN.INSET_HIGHLIGHT,
                    color: sel ? '#fff' : PN.TEXT,
                    fontSize: 16.5, fontWeight: 600, fontFamily:'inherit', cursor:'pointer',
                    transition:'background 130ms ease, color 130ms ease',
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
                    padding:'8px 13px', borderRadius: 999,
                    border: out ? `1px solid ${PN.BORDER_LIGHT}` : `1px solid ${PN.GREEN_SOFT}`,
                    background: out ? PN.WHITE_HUSH : PN.GREEN_SOFT,
                    color: out ? PN.MUTED_SOFT : '#14532D',
                    fontSize: 16.5, fontWeight: 600, fontFamily:'inherit', cursor:'pointer',
                    textDecoration: out ? 'line-through' : 'none',
                    display:'inline-flex', alignItems:'center', gap: 5,
                    transition:'background 130ms ease, color 130ms ease, border-color 130ms ease',
                  }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      {out ? <path d="M18 6L6 18 M6 6l12 12"/> : <path d="M20 6L9 17l-5-5"/>}
                    </svg>
                    {ing}
                  </button>
                );
              })}
            </div>
          </Section>
        )}
        </div>

        <div>
        {/* Extras */}
        {(it.extras?.length || 0) > 0 && (
          <Section title="Aggiungi extra">
            <div style={{display:'flex', flexDirection:'column'}}>
              {it.extras.map(ex => {
                const q = c.extras[ex.id] || 0;
                return (
                  <div key={ex.id} style={{
                    display:'flex', alignItems:'center', gap: 10,
                    padding:'11px 0', borderBottom:`1px solid ${PN.BORDER_SOFT}`,
                  }}>
                    <div style={{flex:1, minWidth: 0}}>
                      <div style={{fontSize: 17, fontWeight: 600, color: PN.TEXT}}>{ex.nome}</div>
                      <div style={{fontSize: 15.5, color: ex.prezzo === 0 ? PN.GREEN : PN.MUTED, marginTop: 1, fontVariantNumeric:'tabular-nums'}}>
                        {ex.prezzo === 0 ? 'gratis' : `+€${ex.prezzo.toFixed(2)}`}
                      </div>
                    </div>
                    {q === 0 ? (
                      <button onClick={()=>setExtra(ex.id, 1)} aria-label={`Aggiungi ${ex.nome}`} style={{
                        width: 32, height: 32, borderRadius: 10,
                        background: PN.BTN_NEUTRAL, border:`1px solid ${PN.BORDER_LIGHT}`,
                        boxShadow: PN.INSET_HIGHLIGHT, cursor:'pointer',
                        color: PN.TEXT, fontFamily:'inherit',
                        display:'grid', placeItems:'center',
                      }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                          strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 5v14 M5 12h14"/>
                        </svg>
                      </button>
                    ) : (
                      <div style={{
                        display:'inline-flex', alignItems:'center', gap: 6,
                        background: PN.BTN_DARK, borderRadius: 999, padding: '3px 4px',
                        boxShadow: PN.INSET_HIGHLIGHT_DARK,
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
      </div>
      </div>

      {/* Riepilogo — sta dove in browse c'è la comanda: passando da un passo
          all'altro la finestra non cambia anatomia, e mentre scegli vedi
          crescere il piatto invece di una barra col solo totale. */}
      <div style={{
        width: 330, flexShrink: 0, borderLeft:`1px solid ${PN.BORDER_SOFT}`,
        display:'flex', flexDirection:'column', background: PN.WHITE_OFF, minHeight: 0,
      }}>
        <div style={{padding:'16px 18px 12px', flexShrink: 0}}>
          <span style={{fontSize: 13.5, fontWeight: 700, color: PN.MUTED_SOFT, letterSpacing: 0.7, textTransform:'uppercase'}}>
            Il piatto
          </span>
        </div>

        <div className="pn-scroll" style={{flex:1, overflow:'auto', padding:'0 18px 12px', minHeight: 0}}>
          <div style={{
            display:'flex', alignItems:'center', justifyContent:'space-between',
            paddingBottom: 12, borderBottom:`1px solid ${PN.BORDER_SOFT}`,
          }}>
            <span style={{fontSize: 16, color: PN.MUTED, fontWeight: 600}}>Prezzo base</span>
            <span style={{fontSize: 17, fontWeight: 700, color: PN.TEXT, fontVariantNumeric:'tabular-nums'}}>€{it.prezzo.toFixed(2)}</span>
          </div>

          {!hasChoices ? (
            <div style={{padding:'22px 6px', fontSize: 15.5, color: PN.MUTED_SOFT, lineHeight: 1.5}}>
              Le scelte che fai compaiono qui.
            </div>
          ) : (
            <div style={{display:'flex', flexDirection:'column', gap: 9, paddingTop: 12}}>
              {chosenVariants.map(v => (
                <div key={v.id} style={{display:'flex', alignItems:'baseline', gap: 8, fontSize: 15.5}}>
                  <span style={{color: PN.MUTED}}>{v.label}</span>
                  <span style={{flex:1}}/>
                  <span style={{color: PN.TEXT, fontWeight: 700}}>{v.value}</span>
                </div>
              ))}
              {removedList.map(ing => (
                <div key={ing} style={{display:'flex', alignItems:'center', gap: 7, fontSize: 15.5, color: PN.RED}}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="3" strokeLinecap="round" style={{flexShrink:0}}><path d="M5 12h14"/></svg>
                  <span style={{overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>senza {ing}</span>
                </div>
              ))}
              {chosenExtras.map(e => (
                <div key={e.id} style={{display:'flex', alignItems:'center', gap: 7, fontSize: 15.5, color: PN.GREEN}}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="3" strokeLinecap="round" style={{flexShrink:0}}><path d="M12 5v14 M5 12h14"/></svg>
                  <span style={{flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{e.qty}× {e.nome}</span>
                  <span style={{fontWeight: 600, fontVariantNumeric:'tabular-nums'}}>
                    {e.prezzo === 0 ? 'gratis' : `+€${(e.prezzo * e.qty).toFixed(2)}`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{
          borderTop:`1px solid ${PN.BORDER_SOFT}`, padding:'16px 18px',
          background: PN.WHITE, flexShrink: 0,
        }}>
          <div style={{display:'flex', alignItems:'center', gap: 10, marginBottom: 12}}>
            <div style={{
              display:'inline-flex', alignItems:'center', gap: 4,
              background: PN.WHITE, border:`1px solid ${PN.BORDER_LIGHT}`,
              boxShadow: PN.INSET_HIGHLIGHT, borderRadius: 999, padding: 3,
            }}>
              <button onClick={()=>setC(s=>({...s, qty: Math.max(1, s.qty-1)}))} disabled={c.qty<=1} aria-label="Meno" style={{
                width: 30, height: 30, borderRadius: 999,
                background: c.qty<=1 ? 'transparent' : PN.WHITE_HUSH, border:'none',
                color: c.qty<=1 ? PN.MUTED_LIGHT : PN.TEXT,
                cursor: c.qty<=1 ? 'default' : 'pointer', fontFamily:'inherit',
                display:'grid', placeItems:'center',
              }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="3" strokeLinecap="round"><path d="M5 12h14"/></svg>
              </button>
              <span style={{fontSize: 17, fontWeight: 800, color: PN.TEXT, minWidth: 20, textAlign:'center', fontVariantNumeric:'tabular-nums'}}>{c.qty}</span>
              <button onClick={()=>setC(s=>({...s, qty: s.qty+1}))} aria-label="Più" style={{
                width: 30, height: 30, borderRadius: 999,
                background: PN.WHITE_HUSH, border:'none',
                color: PN.TEXT, cursor:'pointer', fontFamily:'inherit',
                display:'grid', placeItems:'center',
              }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="3" strokeLinecap="round"><path d="M12 5v14 M5 12h14"/></svg>
              </button>
            </div>
            <span style={{flex:1}}/>
            <span style={{fontSize: 25, fontWeight: 800, color: PN.TEXT, letterSpacing:-0.6, lineHeight: 1.1, fontVariantNumeric:'tabular-nums'}}>
              €{total.toFixed(2)}
            </span>
          </div>
          {!canAdd && (
            <div style={{fontSize: 14.5, color: PN.PINK_DARK, fontWeight: 600, marginBottom: 8}}>
              Scegli prima: {variantsRequired.map(v => v.label).join(', ')}
            </div>
          )}
          <button onClick={onAdd} disabled={!canAdd}
            onMouseEnter={e => { if (canAdd) e.currentTarget.style.background = PN.BTN_DARK_HOVER; }}
            onMouseLeave={e => { if (canAdd) e.currentTarget.style.background = PN.BTN_DARK; }}
            style={{
            width:'100%', padding:'12px 16px',
            background: canAdd ? PN.BTN_DARK : PN.WHITE_FROST,
            color: canAdd ? '#fff' : PN.MUTED_SOFT,
            border:'none', borderRadius: 12,
            boxShadow: canAdd ? `${PN.INSET_HIGHLIGHT_DARK}, 0 4px 14px rgba(15,17,21,0.20)` : 'none',
            fontSize: 17.5, fontWeight: 700,
            cursor: canAdd ? 'pointer' : 'not-allowed', fontFamily:'inherit',
            display:'inline-flex', alignItems:'center', justifyContent:'center', gap: 8,
            minHeight: 46, fontVariantNumeric:'tabular-nums',
            transition:'background 130ms ease, box-shadow 150ms ease',
          }}>
            Aggiungi al conto
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({ title, hint, children }) {
  return (
    <div style={{marginBottom: 24}}>
      <div style={{display:'flex', alignItems:'baseline', gap: 6, marginBottom: 11}}>
        <span style={{fontSize: 17, fontWeight: 800, color: PN.TEXT, letterSpacing: -0.2}}>{title}</span>
        {hint && <span style={{fontSize: 15, color: PN.MUTED_SOFT, marginLeft: 'auto'}}>{hint}</span>}
      </div>
      {children}
    </div>
  );
}

window.SalaArticoloSheet = SalaArticoloSheet;
