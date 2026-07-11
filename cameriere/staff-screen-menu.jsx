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
    <div style={{ background: ST.BG, minHeight: '100%', paddingBottom: cart.length > 0 ? 230 : 100 }}>
      {/* Header */}
      <div style={{ background: '#fff', padding: 'calc(16px + env(safe-area-inset-top)) 16px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <button onClick={() => nav.pop()} style={{
            width: 40, height: 40, borderRadius: ST.R_PILL, border: 'none',
            background: ST.SURF_ALT, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}><I.Back s={18}/></button>
          <div style={{ textAlign: 'center', flex: 1, padding: '0 12px' }}>
            {/* Identità tavolo: nome + coperti con icona 👥 (niente parola "cop"). */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 16, fontWeight: 800, color: ST.TEXT, letterSpacing: -0.3 }}>
              {tavolo ? <>Tavolo {tavolo.n} · {tavolo.coperti}<I.Users s={16} c={ST.TEXT}/></> : 'Menu'}
            </div>
          </div>
          {/* Spacer per tenere il titolo centrato (il "+" custom è ora in fondo lista). */}
          <div style={{ width: 40, flexShrink: 0 }}/>
        </div>

        {/* Ricerca a tutta larghezza: il cameriere cerca per nome. Via il bottone
            filtri col badge finto — categorie + ricerca bastano per ordinare. */}
        <div style={{
          height: 44, borderRadius: ST.R_PILL, background: ST.SURF_ALT,
          display: 'flex', alignItems: 'center', padding: '0 14px', gap: 10,
        }}>
          <I.Search s={16} c={ST.MUTED}/>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Cerca un piatto…"
            style={{ flex: 1, border: 'none', outline: 'none', fontSize: 14, fontFamily: 'inherit', background: 'transparent', color: ST.TEXT }}/>
          {q && (
            <button onClick={() => setQ('')} style={{
              width: 22, height: 22, borderRadius: ST.R_PILL, border: 'none',
              background: 'rgba(0,0,0,0.08)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}><I.Close s={11}/></button>
          )}
        </div>
      </div>

      {/* Categoria scroll — tab a sottolineatura (stile menu byup) */}
      <div style={{
        display: 'flex', gap: 4, padding: '8px 12px 0',
        overflowX: 'auto', scrollbarWidth: 'none',
        background: '#fff', borderBottom: `1px solid ${ST.BORDER_SOFT}`,
      }}>
        {CATEGORIE.map(c => {
          const active = cat === c.id;
          return (
            <button key={c.id} onClick={() => setCat(c.id)} style={{
              flexShrink: 0, background: 'none', border: 'none',
              padding: '10px 14px 12px',
              borderBottom: `2.5px solid ${active ? ST.PINK_DARK : 'transparent'}`,
              fontSize: 15, fontWeight: active ? 700 : 500,
              color: active ? ST.PINK_DARK : ST.MUTED,
              cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap', letterSpacing: -0.1,
            }}>{c.label}</button>
          );
        })}
      </div>

      {/* Piatti — righe DENSE da ordine, non vetrina: foto piccola (riconoscimento),
          nome + prezzo + allergeni, e lo stepper inline per fare le quantità senza
          lasciare la lista. Tap su foto/nome → dettaglio per personalizzare. In
          comanda = accento rosa a sinistra (stessa lingua delle card di sala). */}
      <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {items.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: ST.MUTED, fontSize: 14 }}>
            Nessun piatto trovato.
          </div>
        )}
        {items.map(p => {
          // Personalizzabile = ha aggiunte / cottura / intensità: il "+" apre la
          // scheda dove si scelgono opzioni E quantità (ogni aggiunta è una riga a
          // sé). Senza personalizzazione resta lo stepper inline rapido.
          const personalizzabile = (p.extras && p.extras.length > 0) || !!p.cottura || !!p.livello;
          const inCart = cart.find(c => c.piattoId === p.id);
          const inCartCount = cart.filter(c => c.piattoId === p.id).reduce((s, c) => s + (c.qty || 0), 0);
          const qty = inCart?.qty || 0;
          const setQty = (nq) => {
            if (nq <= 0) setCart(cart.filter(c => c.piattoId !== p.id));
            else if (inCart) setCart(cart.map(c => c.piattoId === p.id ? { ...c, qty: nq } : c));
            else setCart([...cart, { piattoId: p.id, nome: p.nome, prezzo: p.prezzo, qty: nq, extras: [], note: '' }]);
          };
          // Personalizzazione come bottom sheet (scorre su sopra il menu): fluido e
          // leggero, niente cambio di schermata. Aggiunge una riga al carrello.
          const apri = () => openModal({ kind: 'piatto', piattoId: p.id, tavoloId, onAdd: (line) => setCart(prev => [...prev, line]) });
          return (
            <div key={p.id} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              background: '#fff', borderRadius: ST.R_MD, padding: '8px 10px',
              boxShadow: ST.SH_SM,
              border: `1px solid ${ST.BORDER_SOFT}`,
              borderLeft: `3px solid ${inCartCount > 0 ? ST.PINK_DARK : ST.BORDER_SOFT}`,
            }}>
              <div onClick={apri} style={{ width: 52, height: 52, borderRadius: 11, overflow: 'hidden', flexShrink: 0, cursor: 'pointer' }}>
                <DishImage name={p.nome} img={p.img}/>
              </div>
              <div onClick={apri} style={{ flex: 1, minWidth: 0, cursor: 'pointer' }}>
                <div style={{ fontSize: 14.5, fontWeight: 700, color: ST.TEXT, letterSpacing: -0.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {p.nome}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 3, minHeight: 17 }}>
                  <span style={{ fontSize: 13.5, fontWeight: 800, color: ST.TEXT }}>€{p.prezzo}</span>
                  {p.allergeni.length > 0 && (
                    <span style={{ display: 'inline-flex', gap: 3 }}>{p.allergeni.slice(0, 4).map(a => <AllergeneIcon key={a} id={a} size={15}/>)}</span>
                  )}
                </div>
              </div>
              <div style={{ flexShrink: 0 }}>
                {/* STESSA logica per tutti: "+" con badge (sola lettura) del numero
                    in ordine. Sui personalizzabili apre la scheda, sugli altri
                    aggiunge un'unità. Niente counter inline: la quantità si gestisce
                    nel riepilogo. */}
                <button onClick={personalizzabile ? apri : () => setQty(qty + 1)}
                  title={personalizzabile ? 'Personalizza e aggiungi' : 'Aggiungi'} style={{
                    position: 'relative',
                    width: 40, height: 40, borderRadius: ST.R_PILL,
                    border: `1.5px solid ${inCartCount > 0 ? ST.PINK_DARK : ST.BORDER}`,
                    background: inCartCount > 0 ? ST.PINK_SOFT : '#fff', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                  <I.Plus s={20} c={inCartCount > 0 ? ST.PINK_DARK : ST.TEXT}/>
                  {inCartCount > 0 && (
                    <span style={{
                      position: 'absolute', top: -6, right: -6, minWidth: 18, height: 18, padding: '0 4px',
                      borderRadius: ST.R_PILL, background: ST.PINK_DARK, color: '#fff', fontSize: 10, fontWeight: 800,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fff',
                    }}>{inCartCount}</span>
                  )}
                </button>
              </div>
            </div>
          );
        })}

        {/* Crea personalizzato — ultimo elemento della categoria (come nel gestionale):
            un piatto non a menu, con prezzo e note. */}
        {!q && (
          <button onClick={() => openModal({ kind: 'piatto-custom', tavoloId })} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            background: 'transparent', borderRadius: ST.R_MD, padding: '8px 10px',
            border: `1px dashed ${ST.BORDER}`,
            cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
          }}>
            <div style={{
              width: 52, height: 52, borderRadius: 11, flexShrink: 0,
              background: ST.SURF_ALT, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}><I.Plus s={20} c={ST.MUTED}/></div>
            <div style={{ fontSize: 14, fontWeight: 600, color: ST.MUTED }}>Crea personalizzato</div>
          </button>
        )}
      </div>

      {/* Barra ordine — lean: una riga. Il riepilogo (tappabile) apre il dettaglio
          dove si modifica/rimuove/svuota; a destra l'unica azione: invia. */}
      {cart.length > 0 && (
        <div style={{
          // Sopra la BottomNav (~80px): altrimenti la nav coprirebbe la barra.
          position: 'absolute', left: 0, right: 0, bottom: 'calc(80px + env(safe-area-inset-bottom))', zIndex: 40,
          padding: '12px 16px',
          background: 'linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.95) 30%, #fff 100%)',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: '#fff', borderRadius: ST.R_LG, padding: '10px 12px 10px 16px',
            boxShadow: ST.SH_LG, border: `1px solid ${ST.BORDER_SOFT}`,
          }}>
            <button onClick={() => openModal({ kind: 'cart-detail', cart, setCart, tavoloId })} style={{
              flex: 1, minWidth: 0, textAlign: 'left', background: 'none', border: 'none',
              cursor: 'pointer', fontFamily: 'inherit',
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: ST.MUTED, letterSpacing: 0.3, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                {cartCount} articol{cartCount === 1 ? 'o' : 'i'}
                <I.ChevDown s={13} c={ST.MUTED} style={{ transform: 'rotate(180deg)' }}/>
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, color: ST.TEXT, marginTop: 1 }}>€{totale.toFixed(2)}</div>
            </button>
            <button onClick={() => openModal({ kind: 'send-success', tavoloId })} style={{
              flexShrink: 0, height: 46, padding: '0 18px', borderRadius: ST.R_PILL, border: 'none',
              background: ST.PINK_DARK, color: '#fff',
              fontSize: 14.5, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 8,
            }}>Crea ordine</button>
          </div>
        </div>
      )}
    </div>
  );
}


Object.assign(window, { ScreenMenu });
