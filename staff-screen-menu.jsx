// byup Staff — Menu (catalogo per ordinare) + Piatto Detail

const { useState: useStateM, useMemo: useMemoM } = React;

// ═══════════════════════════════════════════════════════════
// MENU — selezione piatti per creare ordine
// ═══════════════════════════════════════════════════════════
function ScreenMenu({ nav, openModal, tavoloId, cart, setCart }) {
  const [cat, setCat] = useStateM('antipasti');
  const [q, setQ] = useStateM('');
  const items = useMemoM(() => {
    return PIATTI.filter(p => p.cat === cat && (!q || p.nome.toLowerCase().includes(q.toLowerCase())));
  }, [cat, q]);

  const tavolo = TAVOLI.find(x => x.id === tavoloId);
  const totale = cart.reduce((s, c) => s + c.prezzo * c.qty, 0);
  const cartCount = cart.reduce((s, c) => s + c.qty, 0);

  return (
    <div style={{ background: ST.BG, minHeight: '100%', paddingBottom: cart.length > 0 ? 200 : 100 }}>
      {/* Header */}
      <div style={{ background: '#fff', padding: '54px 16px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <button onClick={() => nav.pop()} style={{
            width: 40, height: 40, borderRadius: ST.R_PILL, border: 'none',
            background: ST.SURF_ALT, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}><I.Back s={18}/></button>
          <div style={{ textAlign: 'center', flex: 1, padding: '0 12px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: ST.MUTED, letterSpacing: 0.5, textTransform: 'uppercase' }}>
              {tavolo ? `Tavolo ${tavolo.n} · ${tavolo.coperti} cop.` : 'Menu'}
            </div>
            <div style={{ fontSize: 17, fontWeight: 800, color: ST.TEXT, letterSpacing: -0.3 }}>
              Crea ordine
            </div>
          </div>
          <button onClick={() => openModal({ kind: 'piatto-custom', tavoloId })} style={{
            width: 40, height: 40, borderRadius: ST.R_PILL,
            border: `1.5px solid ${ST.PINK_DARK}`, background: '#fff', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }} title="Piatto personalizzato"><I.Plus s={18} c={ST.PINK_DARK}/></button>
        </div>

        {/* Search bar + filtri */}
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{
            flex: 1, height: 44, borderRadius: ST.R_PILL,
            border: `1.5px solid ${ST.BORDER}`, background: '#fff',
            display: 'flex', alignItems: 'center', padding: '0 14px', gap: 10,
          }}>
            <I.Search s={16} c={ST.MUTED}/>
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Cerca per tipologia"
              style={{ flex: 1, border: 'none', outline: 'none', fontSize: 14, fontFamily: 'inherit', background: 'transparent' }}/>
          </div>
          <button onClick={() => openModal({ kind: 'filtri', cat })} style={{
            width: 44, height: 44, borderRadius: ST.R_PILL,
            background: ST.TEXT, border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative',
          }}>
            <I.Sliders s={18} c="#fff"/>
            <span style={{
              position: 'absolute', top: -2, right: -2,
              minWidth: 18, height: 18, padding: '0 5px', borderRadius: ST.R_PILL,
              background: ST.PINK_DARK, color: '#fff',
              fontSize: 10, fontWeight: 800,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '2px solid #fff',
            }}>2</span>
          </button>
        </div>
      </div>

      {/* Categoria scroll */}
      <div style={{
        display: 'flex', gap: 6, padding: '14px 16px 12px',
        overflowX: 'auto', scrollbarWidth: 'none',
        background: '#fff', borderBottom: `1px solid ${ST.BORDER_SOFT}`,
      }}>
        {CATEGORIE.map(c => (
          <button key={c.id} onClick={() => setCat(c.id)} style={{
            flexShrink: 0, height: 36, padding: '0 16px', borderRadius: ST.R_PILL,
            border: 'none',
            background: cat === c.id ? ST.TEXT : ST.SURF_ALT,
            color: cat === c.id ? '#fff' : ST.TEXT,
            fontSize: 13, fontWeight: cat === c.id ? 700 : 600,
            cursor: 'pointer', fontFamily: 'inherit',
          }}>{c.label}</button>
        ))}
      </div>

      {/* Piatti */}
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {items.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: ST.MUTED, fontSize: 14 }}>
            Nessun piatto trovato.
          </div>
        )}
        {items.map(p => {
          const inCart = cart.find(c => c.piattoId === p.id);
          return (
            <div key={p.id} onClick={() => nav.push({ s: 'piatto', piattoId: p.id, tavoloId })} style={{
              background: '#fff', borderRadius: ST.R_LG, padding: 12,
              boxShadow: ST.SH_SM, border: `1px solid ${ST.BORDER_SOFT}`,
              display: 'flex', gap: 12, cursor: 'pointer',
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{
                width: 70, height: 70, borderRadius: ST.R_MD, overflow: 'hidden', flexShrink: 0,
              }}>
                <DishImage name={p.nome}/>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 700, color: ST.TEXT, lineHeight: 1.25 }}>
                    {p.nome}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: ST.TEXT, flexShrink: 0 }}>€{p.prezzo}</div>
                </div>
                <div style={{ fontSize: 11.5, color: ST.MUTED, marginTop: 4, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {p.descr}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6 }}>
                  {p.allergeni.slice(0, 5).map(a => <AllergeneIcon key={a} id={a} size={18}/>)}
                  {p.allergeni.length === 0 && (
                    <span style={{ fontSize: 10.5, color: '#16A34A', fontWeight: 600 }}>● Senza allergeni</span>
                  )}
                </div>
              </div>
              <button onClick={(e) => {
                e.stopPropagation();
                if (inCart) {
                  setCart(cart.map(c => c.piattoId === p.id ? { ...c, qty: c.qty + 1 } : c));
                } else {
                  setCart([...cart, { piattoId: p.id, nome: p.nome, prezzo: p.prezzo, qty: 1, extras: [], note: '' }]);
                }
              }} style={{
                position: 'absolute', right: 12, bottom: 12,
                width: 32, height: 32, borderRadius: ST.R_PILL,
                background: inCart ? ST.PINK_DARK : ST.TEXT, color: '#fff', border: 'none',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: ST.SH_SM,
              }}>
                {inCart
                  ? <span style={{ fontSize: 11, fontWeight: 800 }}>{inCart.qty}</span>
                  : <I.Plus s={16} c="#fff"/>}
              </button>
            </div>
          );
        })}
      </div>

      {/* Cart bar */}
      {cart.length > 0 && (
        <div style={{
          position: 'absolute', left: 0, right: 0, bottom: 34, zIndex: 30,
          padding: '12px 16px',
          background: 'linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.95) 30%, #fff 100%)',
        }}>
          <div style={{
            background: ST.TEXT, borderRadius: ST.R_LG, padding: 12,
            boxShadow: ST.SH_LG,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.6)', letterSpacing: 0.4, textTransform: 'uppercase' }}>
                  {tavolo ? `Tavolo ${tavolo.n}` : 'Riepilogo'}
                </div>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#fff', marginTop: 2 }}>
                  {cartCount} articol{cartCount === 1 ? 'o' : 'i'} · €{totale.toFixed(2)}
                </div>
              </div>
              <button onClick={() => openModal({ kind: 'cart-detail', cart, setCart })} style={{
                background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff',
                height: 32, padding: '0 12px', borderRadius: ST.R_PILL,
                fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
              }}>Vedi dettaglio</button>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => openModal({ kind: 'send-success', tavoloId })} style={{
                flex: 1, height: 46, borderRadius: ST.R_PILL, border: 'none',
                background: ST.PINK_DARK, color: '#fff',
                fontSize: 14, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer',
              }}>Invia in cucina</button>
              <button onClick={() => setCart([])} style={{
                width: 46, height: 46, borderRadius: ST.R_PILL,
                background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}><I.Trash s={16} c="#fff"/></button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// PIATTO DETAIL — personalizza piatto
// ═══════════════════════════════════════════════════════════
function ScreenPiatto({ nav, tavoloId, piattoId, cart, setCart }) {
  const piatto = PIATTI.find(p => p.id === piattoId) || PIATTI[1];
  const [qty, setQty] = useStateM(1);
  const [extras, setExtras] = useStateM({});
  const [cottura, setCottura] = useStateM(piatto.cottura?.[0] || piatto.livello?.[0]);
  const [note, setNote] = useStateM('');
  const [showFull, setShowFull] = useStateM(false);

  const extrasTotal = (piatto.extras || []).reduce((s, e) => s + (extras[e.id] || 0) * e.prezzo, 0);
  const total = (piatto.prezzo + extrasTotal) * qty;

  return (
    <div style={{ background: '#fff', minHeight: '100%', paddingBottom: 100 }}>
      {/* Foto */}
      <div style={{ position: 'relative', width: '100%', height: 280 }}>
        <DishImage name={piatto.nome}/>
        <button onClick={() => nav.pop()} style={{
          position: 'absolute', top: 54, left: 16,
          width: 40, height: 40, borderRadius: ST.R_PILL,
          background: 'rgba(255,255,255,0.95)', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: ST.SH_SM,
        }}><I.Back s={18}/></button>
      </div>

      <div style={{ padding: '20px 20px 0' }}>
        {/* Nome + prezzo */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: ST.TEXT, letterSpacing: -0.4, lineHeight: 1.2 }}>
              {piatto.nome}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
              {piatto.allergeni.length === 0
                ? <span style={{ fontSize: 11.5, color: '#16A34A', fontWeight: 600 }}>● Senza allergeni</span>
                : piatto.allergeni.map(a => <AllergeneIcon key={a} id={a} size={20}/>)}
            </div>
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: ST.TEXT }}>€{piatto.prezzo}</div>
        </div>

        {/* Descr */}
        <div style={{ fontSize: 13.5, color: ST.MUTED, marginTop: 12, lineHeight: 1.55 }}>
          {showFull ? piatto.descr : piatto.descr.slice(0, 90) + (piatto.descr.length > 90 ? '…' : '')}
          {piatto.descr.length > 90 && (
            <span onClick={() => setShowFull(!showFull)} style={{ color: ST.PINK_DARK, fontWeight: 700, marginLeft: 4, cursor: 'pointer' }}>
              {showFull ? 'nascondi' : 'altro'}
            </span>
          )}
        </div>

        {/* Extras */}
        {piatto.extras?.length > 0 && (
          <div style={{ marginTop: 22 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: ST.MUTED, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 10 }}>
              Aggiungi alla lista
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {piatto.extras.map((e, i) => (
                <div key={e.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 0',
                  borderTop: i === 0 ? `1px solid ${ST.BORDER_SOFT}` : 'none',
                  borderBottom: `1px solid ${ST.BORDER_SOFT}`,
                }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{e.nome}</div>
                    <div style={{ fontSize: 12.5, color: ST.MUTED, marginTop: 2 }}>€{e.prezzo}</div>
                  </div>
                  <Stepper value={extras[e.id] || 0} onChange={v => setExtras({ ...extras, [e.id]: v })} min={0}/>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cottura / livello */}
        {(piatto.cottura || piatto.livello) && (
          <div style={{ marginTop: 22 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: ST.MUTED, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 10 }}>
              {piatto.cottura ? 'Cottura pasta' : 'Livello cocktail'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {(piatto.cottura || piatto.livello).map((opt, i, arr) => (
                <div key={opt} onClick={() => setCottura(opt)} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 0',
                  borderTop: i === 0 ? `1px solid ${ST.BORDER_SOFT}` : 'none',
                  borderBottom: `1px solid ${ST.BORDER_SOFT}`,
                  cursor: 'pointer',
                }}>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{opt}</span>
                  <span style={{
                    width: 22, height: 22, borderRadius: ST.R_PILL,
                    border: `2px solid ${cottura === opt ? ST.PINK_DARK : ST.MUTED_3}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {cottura === opt && <span style={{ width: 10, height: 10, borderRadius: ST.R_PILL, background: ST.PINK_DARK }}/>}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Note + qty */}
        <div style={{ marginTop: 22 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: ST.MUTED, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 10 }}>
            Note per la cucina
          </div>
          <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Es. Senza glutine, poco sale..." rows={2}
            style={{
              width: '100%', padding: 12, borderRadius: ST.R_MD,
              border: `1.5px solid ${ST.BORDER}`, background: ST.SURF,
              fontSize: 14, fontFamily: 'inherit', resize: 'none',
              outline: 'none',
            }}/>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 22 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: ST.MUTED }}>Quantità</div>
          <Stepper value={qty} onChange={setQty}/>
        </div>
      </div>

      {/* Bottom CTA */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 34, zIndex: 30,
        padding: '12px 16px', background: 'linear-gradient(180deg, transparent 0%, #fff 30%)',
      }}>
        <button onClick={() => {
          setCart([...cart, { piattoId: piatto.id, nome: piatto.nome, prezzo: piatto.prezzo, qty, extras: Object.entries(extras).filter(([_,v]) => v > 0), note, cottura }]);
          nav.pop();
        }} style={{
          width: '100%', height: 52, borderRadius: ST.R_PILL, border: 'none',
          background: ST.PINK_DARK, color: '#fff',
          fontSize: 15, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          boxShadow: ST.SH_FAB,
        }}>
          <span>Aggiungi al piatto</span>
          <span style={{ width: 1, height: 18, background: 'rgba(255,255,255,0.3)' }}/>
          <span style={{ fontWeight: 800 }}>€{total.toFixed(2)}</span>
        </button>
      </div>
    </div>
  );
}

Object.assign(window, { ScreenMenu, ScreenPiatto });
