// Sala — Tab Vendita diretta (POS) — liquid glass
// Pattern: search/filter sticky, food cards con immagine, click → personalizza,
// carrello con coperti stepper, mods inline, sconto, salva conto.

// Dark sunset glass (D3) — stessa ricetta del bottone "Unisci tavoli":
// base wine-burnt + highlight coral + inset ring caldo, mai nero piatto.
const SV_SUNSET_BG = `
  radial-gradient(circle at 82% 18%, rgba(255, 96, 102, 0.32), transparent 62%),
  linear-gradient(180deg, rgba(58, 28, 22, 0.96) 0%, rgba(30, 12, 10, 0.98) 100%)
`;
const SV_SUNSET_SHADOW = 'inset 0 1px 0 rgba(255,200,210,0.18), inset 0 0 0 1px rgba(255,130,150,0.12), 0 8px 22px -8px rgba(80,10,30,0.55), 0 3px 8px -4px rgba(80,10,30,0.30)';
const SV_SUNSET_TEXT = '#FFE9E6';
const svSunsetHoverIn  = e => { e.currentTarget.style.filter = 'brightness(1.15)'; };
const svSunsetHoverOut = e => { e.currentTarget.style.filter = 'none'; };

function SalaVenditaDiretta() {
  const [search, setSearch] = React.useState('');
  const [cat, setCat] = React.useState('Tutti');
  const [lines, setLines] = React.useState([]); // [{id, piatto, qty, mods, lineTotal}]
  const [takeaway, setTakeaway] = React.useState(false);
  const [incassaOpen, setIncassaOpen] = React.useState(false);
  const [personalize, setPersonalize] = React.useState(null); // {piatto}
  const [editLine, setEditLine] = React.useState(null); // line index for editing existing
  const [customOpen, setCustomOpen] = React.useState(false);
  // Sezione: 'ordine' = POS classico, 'asporto' = conti asporto da app da saldare.
  const [sezione, setSezione] = React.useState('ordine');
  const [asportoConti, setAsportoConti] = React.useState(() => (window.SALA_ASPORTO_CONTI || []));
  const [asportoPay, setAsportoPay] = React.useState(null);

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

  const openPersonalizza = (p) => setPersonalize({ piatto: p });

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
  const editLineName = (i, name) => setLines(prev => prev.map((l, idx) => idx === i ? {...l, displayName: name} : l));
  const editLinePrice = (i, price) => setLines(prev => prev.map((l, idx) => idx === i ? {...l, lineTotal: price} : l));
  const addCustomLine = (name, price) => {
    setLines(prev => [...prev, {
      piatto: { id: `custom_${Date.now()}`, name, price, cat: 'Personalizzato', emoji: '✏️' },
      qty: 1, mods: null, lineTotal: price,
    }]);
  };
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
    <div style={{display:'flex', flexDirection:'column', gap: 14, height:'100%', minHeight: 0}}>
      {/* Switch sezione: Nuovo ordine (POS) / Asporto (conti app da saldare al ritiro) */}
      <div style={{display:'flex', gap: 6, flexShrink: 0}}>
        {[
          {key:'ordine',  label:'Nuovo ordine'},
          {key:'asporto', label:'Asporto' + (asportoConti.length ? ` · ${asportoConti.length}` : '')},
        ].map(s => {
          const on = sezione === s.key;
          return (
            <button key={s.key} onClick={() => setSezione(s.key)} style={{
              padding: '8px 18px', borderRadius: 999,
              border: `1px solid ${on ? 'transparent' : PN.BORDER_LIGHT}`,
              background: on ? SV_SUNSET_BG : PN.BTN_NEUTRAL,
              color: on ? SV_SUNSET_TEXT : PN.TEXT,
              fontSize: 17, fontWeight: 700, cursor:'pointer',
              fontFamily:'inherit', whiteSpace:'nowrap',
              boxShadow: on ? SV_SUNSET_SHADOW : `${PN.INSET_HIGHLIGHT}, 0 1px 2px rgba(15,17,21,0.04)`,
              transition: 'background 150ms ease-out, color 150ms ease-out, box-shadow 150ms ease-out',
            }}>{s.label}</button>
          );
        })}
      </div>

      {sezione === 'asporto' ? (
        <SaAsportoBoard conti={asportoConti} onPay={setAsportoPay}/>
      ) : (
      <div style={{display:'grid', gridTemplateColumns:'1fr 400px', gap: 18, flex: 1, minHeight: 0}}>
      {/* === GRID PIATTI === */}
      <section style={{
        background: PN.WHITE, borderRadius: 14,
        border: `1px solid ${PN.BORDER_HAIR}`,
        boxShadow: '0 1px 0 rgba(15,17,21,0.04), 0 6px 18px rgba(15,17,21,0.04)',
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
                borderRadius: 10, border: `1px solid ${PN.BORDER_LIGHT}`,
                fontSize: 18, fontFamily:'inherit', outline:'none',
                background: '#FAFBFC',
                boxShadow: 'inset 0 1px 1px rgba(15,17,21,0.03)',
              }}/>
          </div>
          <div style={{display:'flex', gap: 6, paddingBottom: 12, overflowX:'auto'}}>
            {cats.map(c => {
              const on = cat === c;
              return (
                <button key={c} onClick={() => setCat(c)} style={{
                  padding: '7px 14px', borderRadius: 999,
                  border: `1px solid ${on ? 'transparent' : PN.BORDER_LIGHT}`,
                  background: on ? SV_SUNSET_BG : PN.BTN_NEUTRAL,
                  color: on ? SV_SUNSET_TEXT : PN.TEXT,
                  fontSize: 16.5, fontWeight: 600, cursor:'pointer',
                  fontFamily:'inherit', whiteSpace:'nowrap',
                  boxShadow: on
                    ? SV_SUNSET_SHADOW
                    : `${PN.INSET_HIGHLIGHT}, 0 1px 2px rgba(15,17,21,0.04)`,
                  transition: 'background 150ms ease-out, color 150ms ease-out, box-shadow 150ms ease-out',
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
            <div style={{gridColumn:'1/-1', padding: 60, textAlign:'center', color: PN.MUTED, fontSize: 17.5}}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%', margin: '0 auto 10px',
                background: PN.WHITE_FROST, color: PN.MUTED_SOFT,
                display:'grid', placeItems:'center',
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
              </div>
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
                onQuickAdd={() => quickAdd(p)}
                onPersonalizza={() => openPersonalizza(p)}
              />
            );
          })}

          {/* Articolo custom — tessera in coda alla griglia, apre la modale nome+prezzo */}
          <button
            onClick={() => setCustomOpen(true)}
            style={{
              display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
              gap:8, padding:'18px 12px', minHeight:100,
              borderRadius:12, cursor:'pointer', fontFamily:'inherit',
              border:`2px dashed ${PN.BORDER}`,
              background:'transparent', color:PN.MUTED,
              transition:'border-color 150ms ease-out, color 150ms ease-out, background 150ms ease-out',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor=PN.TEXT; e.currentTarget.style.color=PN.TEXT; e.currentTarget.style.background=PN.WHITE_FROST; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor=PN.BORDER; e.currentTarget.style.color=PN.MUTED; e.currentTarget.style.background='transparent'; }}
          >
            <span style={{
              width:36, height:36, borderRadius:'50%',
              border:'2px dashed currentColor',
              display:'grid', placeItems:'center',
              fontSize:24, lineHeight:1,
            }}>+</span>
            <span style={{fontSize:15, fontWeight:600, textAlign:'center', lineHeight:1.3}}>Articolo custom</span>
          </button>
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
        onChangeName={editLineName}
        onChangePrice={editLinePrice}
        onClear={() => setLines([])}
        onIncassa={() => setIncassaOpen(true)}
      />
      </div>
      )}

      <SaIncassaModal
        open={incassaOpen}
        total={total}
        onClose={() => setIncassaOpen(false)}
        onConfirm={() => setLines([])}
      />

      {/* Pagamento conto asporto — riusa il modale incasso col totale del conto */}
      {asportoPay && (
        <SaIncassaModal
          open={true}
          total={asportoPay.daSaldare}
          onClose={() => setAsportoPay(null)}
          onConfirm={() => setAsportoConti(cs => cs.filter(c => c.id !== asportoPay.id))}
        />
      )}

      {personalize && (
        <SaPersonalizzaModal
          piatto={personalize.piatto}
          initialMods={personalize.mods}
          initialQty={personalize.qty}
          onClose={() => { setPersonalize(null); setEditLine(null); }}
          onConfirm={addPersonalized}
        />
      )}

      {customOpen && (
        <SaCustomModal
          onClose={() => setCustomOpen(false)}
          onConfirm={(name, price) => { addCustomLine(name, price); setCustomOpen(false); }}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sezione Asporto — conti aperti da Byup App, da saldare al ritiro

function SaAsportoBoard({ conti, onPay }) {
  if (!conti.length) {
    return (
      <div style={{
        flex: 1, minHeight: 0,
        background: PN.WHITE, borderRadius: 14,
        border: `1px solid ${PN.BORDER_HAIR}`,
        boxShadow: '0 1px 0 rgba(15,17,21,0.04), 0 6px 18px rgba(15,17,21,0.04)',
        display:'grid', placeItems:'center', padding: 40,
      }}>
        <div style={{textAlign:'center', color: PN.MUTED}}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%', margin: '0 auto 12px',
            background: PN.WHITE_FROST, color: PN.MUTED_SOFT,
            display:'grid', placeItems:'center',
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
          </div>
          <div style={{fontSize: 17, fontWeight: 600, color: PN.TEXT, marginBottom: 4}}>Nessun conto asporto aperto</div>
          <div style={{fontSize: 15.5, lineHeight: 1.5}}>Gli ordini da asporto effettuati dai clienti<br/>tramite Byup App compariranno qui.</div>
        </div>
      </div>
    );
  }
  return (
    <div className="pn-scroll" style={{
      flex: 1, minHeight: 0, overflow:'auto',
      display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(320px, 1fr))',
      gap: 14, alignContent:'start',
    }}>
      {conti.map(c => (
        <div key={c.id} style={{
          background: PN.WHITE, borderRadius: 14,
          border: `1px solid ${PN.BORDER_HAIR}`,
          boxShadow: '0 1px 0 rgba(15,17,21,0.04), 0 6px 18px rgba(15,17,21,0.04)',
          display:'flex', flexDirection:'column', overflow:'hidden',
        }}>
          {/* Header conto */}
          <div style={{
            padding: '12px 16px',
            borderBottom: `1px solid ${PN.BORDER_SOFT}`,
            display:'flex', alignItems:'center', gap: 10,
          }}>
            <div style={{flex: 1, minWidth: 0}}>
              <div style={{display:'flex', alignItems:'center', gap: 8}}>
                <span style={{fontSize: 17.5, fontWeight: 700, color: PN.TEXT, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{c.cliente}</span>
                <span style={{
                  fontSize: 13, fontWeight: 800, letterSpacing: 0.4, textTransform:'uppercase',
                  padding: '2px 8px', borderRadius: 999,
                  background: PN.PINK_SOFT, color: PN.PINK_DARK, flexShrink: 0,
                }}>byup app</span>
              </div>
              <div style={{fontSize: 15, color: PN.MUTED, marginTop: 1, fontVariantNumeric:'tabular-nums'}}>{c.codice} · ritiro ore {c.ritiro}</div>
            </div>
          </div>

          {/* Piatti ordinati */}
          <div style={{padding: '10px 16px', flex: 1, display:'flex', flexDirection:'column', gap: 3}}>
            {c.items.map((item, i) => (
              <div key={i} style={{display:'flex', alignItems:'center', gap: 8, fontSize: 15.5}}>
                <span style={{fontWeight: 700, color: PN.MUTED_SOFT, minWidth: 22, flexShrink: 0}}>{item.qty}×</span>
                <span style={{flex: 1, color: PN.TEXT, fontWeight: 600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{item.nome}</span>
                <span style={{fontWeight: 700, color: PN.TEXT, fontVariantNumeric:'tabular-nums'}}>€{(item.prezzo * item.qty).toFixed(2)}</span>
              </div>
            ))}
          </div>

          {/* Footer: totale + pagamento */}
          <div style={{padding: '12px 16px 14px', borderTop: `1px solid ${PN.BORDER_SOFT}`}}>
            <button
              onClick={() => onPay(c)}
              style={{
                width:'100%', padding: '11px 16px', borderRadius: 999,
                background: SV_SUNSET_BG, color: SV_SUNSET_TEXT,
                border: '1px solid transparent',
                fontSize: 17, fontWeight: 700, cursor:'pointer', fontFamily:'inherit',
                display:'flex', alignItems:'center', justifyContent:'space-between', gap: 8,
                boxShadow: SV_SUNSET_SHADOW,
                transition: 'box-shadow 180ms ease-out, filter 150ms ease-out',
              }}
              onMouseEnter={svSunsetHoverIn}
              onMouseLeave={svSunsetHoverOut}>
              <span>Procedi al pagamento</span>
              <span style={{fontVariantNumeric:'tabular-nums'}}>€{c.daSaldare.toFixed(2)}</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Modal articolo custom — voce libera (nome + prezzo) aggiunta al conto

function SaCustomModal({ onClose, onConfirm }) {
  const [name, setName] = React.useState('');
  const [price, setPrice] = React.useState('');
  const nameRef = React.useRef(null);

  React.useEffect(() => { nameRef.current?.focus(); }, []);

  const parsedPrice = parseFloat(price.replace(',', '.'));
  const valid = name.trim().length > 0 && !isNaN(parsedPrice) && parsedPrice > 0;

  const handleConfirm = () => {
    if (!valid) return;
    onConfirm(name.trim(), parsedPrice);
  };

  const handleKey = (e) => { if (e.key === 'Enter' && valid) handleConfirm(); if (e.key === 'Escape') onClose(); };

  const inputStyle = {
    padding: '10px 12px', borderRadius: 10,
    border: '1px solid rgba(15,17,21,0.14)', outline: 'none',
    background: 'rgba(255,255,255,0.75)',
    fontSize: 16.5, fontFamily: 'inherit', color: PN.TEXT,
    boxShadow: 'inset 0 1px 1px rgba(15,17,21,0.03)',
    transition: 'border-color 120ms ease-out',
  };

  return (
    <div onClick={onClose} style={{
      position:'fixed', inset: 0, background:'rgba(15,17,21,0.42)',
      backdropFilter:'blur(8px)', WebkitBackdropFilter:'blur(8px)',
      display:'grid', placeItems:'center', zIndex: 200, padding: 20,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        ...PN.GLASS_STRONG,
        borderRadius: 20,
        width: 380, maxWidth:'100%',
        padding: '22px 22px 20px',
        display:'flex', flexDirection:'column', gap: 18,
      }}>
        {/* Header */}
        <div style={{display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap: 10}}>
          <div>
            <div style={{fontSize: 19, fontWeight: 700, color: PN.TEXT}}>Articolo custom</div>
            <div style={{fontSize: 15, color: PN.MUTED, marginTop: 2}}>Aggiungi un articolo non in menù</div>
          </div>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius:'50%', flexShrink: 0,
            background:'rgba(255,255,255,0.95)', border:'none', cursor:'pointer',
            display:'grid', placeItems:'center',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>

        {/* Inputs */}
        <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
          <div style={{display:'flex', flexDirection:'column', gap:5}}>
            <label style={{fontSize: 14, fontWeight: 700, color: PN.MUTED, textTransform:'uppercase', letterSpacing: 0.5}}>Nome articolo</label>
            <input
              ref={nameRef}
              value={name} onChange={e => setName(e.target.value)} onKeyDown={handleKey}
              placeholder="es. Coperto, Acqua del rubinetto…"
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'rgba(15,17,21,0.45)'}
              onBlur={e => e.target.style.borderColor = 'rgba(15,17,21,0.14)'}
            />
          </div>
          <div style={{display:'flex', flexDirection:'column', gap:5}}>
            <label style={{fontSize: 14, fontWeight: 700, color: PN.MUTED, textTransform:'uppercase', letterSpacing: 0.5}}>Prezzo (€)</label>
            <input
              value={price} onChange={e => setPrice(e.target.value)} onKeyDown={handleKey}
              placeholder="0.00"
              inputMode="decimal"
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'rgba(15,17,21,0.45)'}
              onBlur={e => e.target.style.borderColor = 'rgba(15,17,21,0.14)'}
            />
          </div>
        </div>

        {/* Bottone conferma */}
        <button
          onClick={handleConfirm}
          disabled={!valid}
          style={{
            padding: '12px 18px', borderRadius: 999,
            background: valid ? SV_SUNSET_BG : PN.WHITE_FROST,
            color: valid ? SV_SUNSET_TEXT : PN.MUTED_SOFT,
            border: `1px solid ${valid ? 'transparent' : PN.BORDER_SOFT_A}`,
            fontSize: 17.5, fontWeight: 700,
            cursor: valid ? 'pointer' : 'not-allowed',
            fontFamily:'inherit',
            display:'flex', alignItems:'center', justifyContent:'space-between', gap: 10,
            boxShadow: valid ? SV_SUNSET_SHADOW : 'none',
            transition: 'box-shadow 180ms ease-out, filter 150ms ease-out',
          }}
          onMouseEnter={e => { if (valid) svSunsetHoverIn(e); }}
          onMouseLeave={svSunsetHoverOut}>
          <span>Aggiungi al conto</span>
          <span style={{fontSize: 17.5, fontWeight: 700}}>{valid ? `€${parsedPrice.toFixed(2)}` : ''}</span>
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Card piatto

function SaPiattoCard({ p, qtyInCart, customizable, onQuickAdd, onPersonalizza }) {
  const [imgError, setImgError] = React.useState(false);
  const cat = SALA_VENDITA_CATS[p.cat] || { color: PN.MUTED, bg: '#F4F5F7' };
  const inCart = qtyInCart > 0;

  return (
    <div
      onClick={onQuickAdd}
      title="Aggiungi al conto"
      style={{
        background: PN.WHITE, borderRadius: 12,
        border: `1px solid ${inCart ? PN.PINK : PN.BORDER_SOFT_A}`,
        cursor:'pointer',
        transition:'transform 150ms ease-out, border-color 150ms ease-out, box-shadow 150ms ease-out',
        position:'relative',
        display:'block',
        overflow:'hidden',
        alignSelf:'start',
        boxShadow: inCart
          ? '0 4px 14px rgba(255,90,95,0.14), 0 1px 2px rgba(15,17,21,0.04)'
          : '0 1px 2px rgba(15,17,21,0.05)',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(15,17,21,0.09), 0 1px 2px rgba(15,17,21,0.04)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = inCart ? '0 4px 14px rgba(255,90,95,0.14), 0 1px 2px rgba(15,17,21,0.04)' : '0 1px 2px rgba(15,17,21,0.05)'; }}
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
            color: cat.color, fontSize: 34, fontWeight: 700,
            background: cat.bg,
          }}>{p.name.charAt(0)}</div>
        )}

        {/* qty badge */}
        {inCart && (
          <div style={{
            position:'absolute', top: 8, left: 8,
            background: PN.PINK_DARK, color: PN.WHITE,
            padding:'3px 9px', borderRadius: 999,
            fontSize: 15, fontWeight: 700,
            boxShadow: '0 2px 6px rgba(0,0,0,0.18)',
          }}>×{qtyInCart}</div>
        )}

      </div>

      {/* Body */}
      <div style={{padding: '10px 13px 12px', display:'flex', flexDirection:'column', gap: 3}}>
        <div style={{
          fontSize: 13.5, fontWeight: 700, color: cat.color,
          letterSpacing: 0.5, textTransform:'uppercase',
        }}>{p.cat}</div>

        <div style={{
          fontSize: 17.5, fontWeight: 700, color: PN.TEXT,
          lineHeight: 1.25, textWrap:'pretty',
        }}>{p.name}</div>

        <div style={{
          display:'flex', alignItems:'center', justifyContent:'space-between',
          marginTop: 6, gap: 8,
        }}>
          <span style={{fontSize: 18, fontWeight: 700, color: PN.TEXT}}>€{p.price.toFixed(2)}</span>
          {customizable && (
            <button
              onClick={(e) => { e.stopPropagation(); onPersonalizza(); }}
              style={{
                height: 30, padding:'0 12px', borderRadius: 8,
                background: PN.BTN_NEUTRAL, color: PN.TEXT, border:`1px solid ${PN.BORDER_LIGHT}`,
                fontSize: 15, fontWeight: 700, cursor:'pointer',
                fontFamily:'inherit', display:'inline-flex', alignItems:'center', gap: 5,
                flexShrink: 0,
                boxShadow: `${PN.INSET_HIGHLIGHT}, 0 1px 2px rgba(15,17,21,0.04)`,
              }}>
              <span style={{fontSize: 17, lineHeight: 1}}>+</span> Personalizza
            </button>
          )}
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
      position:'fixed', inset: 0, background:'rgba(15,17,21,0.42)',
      backdropFilter:'blur(8px)', WebkitBackdropFilter:'blur(8px)',
      display:'grid', placeItems:'center', zIndex: 200, padding: 20,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        ...PN.GLASS_STRONG,
        borderRadius: 20,
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
          <div style={{fontSize: 14, fontWeight: 700, color: PN.MUTED, letterSpacing: 0.5, textTransform:'uppercase'}}>{piatto.cat}</div>
          <div style={{display:'flex', alignItems:'baseline', gap: 10, marginTop: 2}}>
            <span style={{fontSize: 23, fontWeight: 700, color: PN.TEXT}}>{piatto.name}</span>
            <span style={{fontSize: 18, fontWeight: 700, color: PN.MUTED, marginLeft:'auto'}}>€{piatto.price.toFixed(2)}</span>
          </div>
        </div>

        {/* Body scrollabile */}
        <div className="pn-scroll" style={{flex: 1, overflow:'auto', padding: '16px 20px'}}>
          {/* Varianti */}
          {(piatto.variants || []).map(g => (
            <div key={g.group} style={{marginBottom: 18}}>
              <div style={{display:'flex', alignItems:'center', gap: 8, marginBottom: 8}}>
                <span style={{fontSize: 17, fontWeight: 700, color: PN.TEXT}}>{g.group}</span>
                {g.required && variants[g.group] == null && (
                  <span style={{fontSize: 14.5, color: PN.AMBER, fontWeight: 600}}>· Seleziona un'opzione</span>
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
                      fontSize: 16.5, fontWeight: 600, cursor:'pointer',
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
              <div style={{fontSize: 17, fontWeight: 700, color: PN.TEXT, marginBottom: 8}}>Ingredienti</div>
              <div style={{display:'flex', gap: 6, flexWrap:'wrap'}}>
                {piatto.ingredients.filter(i => i.removable).map(ing => {
                  const isRemoved = removed.includes(ing.name);
                  return (
                    <button key={ing.name} onClick={() => setRemoved(r => isRemoved ? r.filter(x => x !== ing.name) : [...r, ing.name])} style={{
                      padding: '7px 12px', borderRadius: 999,
                      border: `1.5px solid ${isRemoved ? '#FECACA' : PN.GREEN_SOFT}`,
                      background: isRemoved ? '#FEF2F2' : PN.GREEN_SOFT,
                      color: isRemoved ? '#B91C1C' : PN.GREEN,
                      fontSize: 16.5, fontWeight: 600, cursor:'pointer',
                      fontFamily:'inherit',
                      textDecoration: isRemoved ? 'line-through' : 'none',
                      display:'inline-flex', alignItems:'center', gap: 5,
                    }}>
                      <span style={{fontSize: 15}}>{isRemoved ? '×' : '✓'}</span>
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
              <div style={{fontSize: 17, fontWeight: 700, color: PN.TEXT, marginBottom: 8}}>Extras</div>
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
                      <span style={{fontSize: 17, fontWeight: 600, color: PN.TEXT, flex: 1}}>{e.name}</span>
                      <span style={{fontSize: 16, color: PN.MUTED, fontWeight: 500}}>+€{e.price.toFixed(2)}</span>
                      <div style={{display:'flex', alignItems:'center', gap: 6, marginLeft: 4}}>
                        <button onClick={() => setExtras(x => ({...x, [e.name]: Math.max(0, q - 1)}))} disabled={q === 0} style={{
                          width: 24, height: 24, borderRadius:'50%',
                          background: q === 0 ? '#F4F5F7' : PN.TEXT,
                          color: q === 0 ? PN.MUTED_LIGHT : PN.WHITE,
                          border:'none', fontSize: 17, fontWeight: 700,
                          cursor: q === 0 ? 'default' : 'pointer', fontFamily:'inherit',
                        }}>−</button>
                        <span style={{minWidth: 16, textAlign:'center', fontSize: 17, fontWeight: 700}}>{q}</span>
                        <button onClick={() => setExtras(x => ({...x, [e.name]: q + 1}))} style={{
                          width: 24, height: 24, borderRadius:'50%',
                          background: PN.TEXT, color: PN.WHITE, border:'none',
                          fontSize: 17, fontWeight: 700, cursor:'pointer', fontFamily:'inherit',
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
          borderTop: '1px solid rgba(15,17,21,0.08)',
          background: 'rgba(255,255,255,0.35)',
          display:'flex', alignItems:'center', gap: 12,
        }}>
          <div style={{display:'flex', alignItems:'center', gap: 8}}>
            <button onClick={() => setQty(Math.max(1, qty - 1))} style={{
              width: 34, height: 34, borderRadius:'50%',
              background: 'rgba(255,255,255,0.75)', color: PN.TEXT,
              border: '1px solid rgba(15,17,21,0.10)', fontSize: 19, fontWeight: 700,
              cursor:'pointer', fontFamily:'inherit',
            }}>−</button>
            <span style={{minWidth: 22, textAlign:'center', fontSize: 19, fontWeight: 700}}>{qty}</span>
            <button onClick={() => setQty(qty + 1)} style={{
              width: 34, height: 34, borderRadius:'50%',
              background: 'rgba(255,255,255,0.75)', color: PN.TEXT,
              border: '1px solid rgba(15,17,21,0.10)', fontSize: 19, fontWeight: 700,
              cursor:'pointer', fontFamily:'inherit',
            }}>+</button>
          </div>
          <button
            disabled={!requiredOk}
            onClick={submit}
            style={{
              flex: 1,
              padding: '12px 18px', borderRadius: 999,
              background: requiredOk ? SV_SUNSET_BG : PN.WHITE_FROST,
              color: requiredOk ? SV_SUNSET_TEXT : PN.MUTED_SOFT,
              border: `1px solid ${requiredOk ? 'transparent' : PN.BORDER_SOFT_A}`,
              fontSize: 17.5, fontWeight: 700,
              cursor: requiredOk ? 'pointer' : 'not-allowed',
              fontFamily:'inherit',
              display:'flex', alignItems:'center', justifyContent:'space-between', gap: 10,
              boxShadow: requiredOk ? SV_SUNSET_SHADOW : 'none',
              transition: 'box-shadow 180ms ease-out, filter 150ms ease-out',
            }}
            onMouseEnter={e => { if (requiredOk) svSunsetHoverIn(e); }}
            onMouseLeave={svSunsetHoverOut}>
            <span>{initialMods != null || initialQty ? 'Aggiorna' : 'Aggiungi'}</span>
            <span style={{fontSize: 17.5, fontWeight: 700}}>€{(lineTotal * qty).toFixed(2)}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Carrello

function SaCartPanel({ lines, takeaway, setTakeaway, total, totQty, onInc, onDec, onRemove, onEdit, onChangeName, onChangePrice, onClear, onIncassa }) {
  window.SALA_VENDITA_CLEAR = onClear;
  return (
    <aside style={{
      background: PN.WHITE, borderRadius: 14,
      border: `1px solid ${PN.BORDER_HAIR}`,
      boxShadow: '0 1px 0 rgba(15,17,21,0.04), 0 6px 18px rgba(15,17,21,0.04)',
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
          <div style={{fontSize: 18, fontWeight: 700, color: PN.TEXT, lineHeight: 1.2}}>Ordine</div>
          <div style={{fontSize: 15, color: PN.MUTED, marginTop: 1}}>{totQty} {totQty === 1 ? 'articolo' : 'articoli'}{lines.length > 0 && ` · ${lines.length} righ${lines.length === 1 ? 'a' : 'e'}`}</div>
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
            fontSize: 15, fontWeight: 700, cursor:'pointer', fontFamily:'inherit',
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
            padding:'5px 10px', borderRadius: 8, fontSize: 15, fontWeight: 600,
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
            <div style={{
              width: 48, height: 48, borderRadius: '50%', margin: '0 auto 12px',
              background: PN.WHITE_FROST, color: PN.MUTED_SOFT,
              display:'grid', placeItems:'center',
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18l-2 13H5L3 6Z"/><path d="M8 6V4a4 4 0 0 1 8 0v2"/></svg>
            </div>
            <div style={{fontSize: 17, fontWeight: 600, color: PN.TEXT, marginBottom: 4}}>Conto vuoto</div>
            <div style={{fontSize: 15.5, color: PN.MUTED, lineHeight: 1.5}}>Tocca un piatto per aggiungerlo<br/>o l'icona <strong>+</strong> per aggiungere veloce</div>
          </div>
        ) : (
          <div style={{display:'flex', flexDirection:'column', gap: 6}}>
            {lines.map((l, i) => (
              <SaCartLine key={i} line={l}
                onInc={() => onInc(i)} onDec={() => onDec(i)}
                onRemove={() => onRemove(i)} onEdit={() => onEdit(i)}
                onChangeName={(name) => onChangeName(i, name)}
                onChangePrice={(price) => onChangePrice(i, price)}/>
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
          fontSize: 20, fontWeight: 700, color: PN.TEXT,
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
              background: lines.length === 0 ? PN.WHITE_FROST : SV_SUNSET_BG,
              color: lines.length === 0 ? PN.MUTED_SOFT : SV_SUNSET_TEXT,
              border: `1px solid ${lines.length === 0 ? PN.BORDER_SOFT_A : 'transparent'}`,
              fontSize: 17.5, fontWeight: 700,
              cursor: lines.length === 0 ? 'not-allowed' : 'pointer',
              fontFamily:'inherit',
              display:'flex', alignItems:'center', justifyContent:'space-between', gap: 8,
              boxShadow: lines.length === 0 ? 'none' : SV_SUNSET_SHADOW,
              transition: 'box-shadow 180ms ease-out, filter 150ms ease-out',
            }}
            onMouseEnter={e => { if (lines.length > 0) svSunsetHoverIn(e); }}
            onMouseLeave={svSunsetHoverOut}>
            <span>Procedi al pagamento</span>
            <span>€{total.toFixed(2)}</span>
          </button>
        </div>
      </div>
    </aside>
  );
}

function SaCartLine({ line, onInc, onDec, onRemove, onEdit, onChangeName, onChangePrice }) {
  const { piatto, qty, mods, lineTotal } = line;
  const cat = SALA_VENDITA_CATS[piatto.cat] || { color: PN.MUTED, bg: '#F4F5F7' };
  const displayName = line.displayName || piatto.name;
  const isCustomizable = !!(piatto.variants?.length || piatto.ingredients?.length || piatto.extras?.length);
  const hasMods = mods && (Object.keys(mods.variants||{}).length || (mods.removed||[]).length || Object.keys(mods.extras||{}).length);

  // Editing inline nome/prezzo: click sul testo, Enter conferma, Esc annulla.
  const [editingName, setEditingName] = React.useState(false);
  const [editingPrice, setEditingPrice] = React.useState(false);
  const [nameVal, setNameVal] = React.useState(displayName);
  const [priceVal, setPriceVal] = React.useState(lineTotal.toFixed(2));

  React.useEffect(() => { if (!editingName) setNameVal(displayName); }, [displayName, editingName]);
  React.useEffect(() => { if (!editingPrice) setPriceVal(lineTotal.toFixed(2)); }, [lineTotal, editingPrice]);

  const commitName = () => {
    setEditingName(false);
    const v = nameVal.trim();
    if (v && v !== displayName) onChangeName(v);
    else setNameVal(displayName);
  };
  const commitPrice = () => {
    setEditingPrice(false);
    const v = parseFloat(priceVal.replace(',', '.'));
    if (!isNaN(v) && v >= 0) onChangePrice(v);
    else setPriceVal(lineTotal.toFixed(2));
  };

  const inlineInputStyle = {
    border:'none', borderBottom:`1.5px solid ${PN.TEXT}`, outline:'none',
    background:'transparent', fontFamily:'inherit',
    fontSize:16.5, fontWeight:700, color: PN.TEXT, padding:'0 1px',
  };

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
          : <span style={{fontSize: 22}}>{piatto.emoji || '🍽'}</span>}
      </div>
      <div style={{flex: 1, minWidth: 0}}>
        <div style={{display:'flex', alignItems:'baseline', gap: 6}}>
          {editingName ? (
            <input
              value={nameVal} onChange={e => setNameVal(e.target.value)}
              onBlur={commitName}
              onKeyDown={e => { if (e.key==='Enter') commitName(); if (e.key==='Escape') { setNameVal(displayName); setEditingName(false); } }}
              autoFocus
              style={{...inlineInputStyle, flex: 1, minWidth: 0, width:'100%'}}
            />
          ) : (
            <span
              onClick={() => isCustomizable ? onEdit() : setEditingName(true)}
              title={isCustomizable ? 'Clicca per personalizzare' : 'Clicca per modificare il nome'}
              style={{fontSize: 16.5, fontWeight: 700, color: PN.TEXT, flex: 1, minWidth: 0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', cursor:'pointer', userSelect:'none'}}
            >{displayName}</span>
          )}
          {editingPrice ? (
            <input
              value={priceVal} onChange={e => setPriceVal(e.target.value)}
              onBlur={commitPrice}
              onKeyDown={e => { if (e.key==='Enter') commitPrice(); if (e.key==='Escape') { setPriceVal(lineTotal.toFixed(2)); setEditingPrice(false); } }}
              autoFocus
              inputMode="decimal"
              style={{...inlineInputStyle, fontSize: 16, width: 60, textAlign:'right', fontVariantNumeric:'tabular-nums'}}
            />
          ) : (
            <span
              onClick={() => setEditingPrice(true)}
              title="Clicca per modificare il prezzo"
              style={{fontSize: 16, fontWeight: 700, color: PN.TEXT, cursor:'text', fontVariantNumeric:'tabular-nums'}}
            >€{(lineTotal * qty).toFixed(2)}</span>
          )}
        </div>
        {hasMods && (
          <div style={{fontSize: 14.5, color: PN.MUTED, marginTop: 2, lineHeight: 1.4}}>
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
            fontSize: 16, fontWeight: 700, cursor:'pointer', fontFamily:'inherit',
            display:'grid', placeItems:'center',
          }}>−</button>
          <span style={{fontSize: 16, fontWeight: 700, minWidth: 14, textAlign:'center'}}>{qty}</span>
          <button onClick={onInc} style={{
            width: 22, height: 22, borderRadius:'50%',
            background: PN.PINK_SOFT, color: PN.PINK_DARK, border:'none',
            fontSize: 16, fontWeight: 700, cursor:'pointer', fontFamily:'inherit',
            display:'grid', placeItems:'center',
          }}>+</button>
          <span style={{flex:1}}/>
          {hasMods !== undefined && (line.piatto.variants?.length || line.piatto.ingredients?.length || line.piatto.extras?.length) ? (
            <button onClick={onEdit} title="Modifica" style={{
              padding:'2px 6px', borderRadius: 5, fontSize: 14.5, fontWeight: 600,
              background:'transparent', color: PN.MUTED,
              border: `1px solid ${PN.BORDER}`, cursor:'pointer', fontFamily:'inherit',
            }}>✎</button>
          ) : null}
          <button onClick={onRemove} title="Rimuovi" style={{
            background:'transparent', border:'none', color: PN.MUTED,
            cursor:'pointer', fontSize: 18, padding: '0 2px', fontFamily:'inherit', lineHeight: 1,
          }}>×</button>
        </div>
      </div>
    </div>
  );
}

function SaRow({ l, v }) {
  return (
    <div style={{display:'flex', justifyContent:'space-between', fontSize: 16.5, color: PN.MUTED, padding: '2px 0'}}>
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
      position: 'fixed', inset: 0, background: 'rgba(15,17,21,0.42)',
      backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
      display: 'grid', placeItems: 'center', zIndex: 200, padding: 20,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        ...PN.GLASS_STRONG,
        borderRadius: 20,
        width: 420, maxWidth: '100%',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
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
            <div style={{ fontSize: 24, fontWeight: 700, color: '#0F1115', marginBottom: 4 }}>
              Pagamento incassato
            </div>
            <div style={{ fontSize: 32, fontWeight: 700, color: '#0F1115', marginBottom: 6, letterSpacing: -0.5, fontVariantNumeric: 'tabular-nums' }}>
              €{confirmedTotal.toFixed(2)}
            </div>
            <div style={{ fontSize: 17, color: '#6B7280', marginBottom: 24 }}>
              {confirmedPay.contanti > 0 && confirmedPay.carta > 0
                ? `€${confirmedPay.contanti.toFixed(2)} contanti + €${confirmedPay.carta.toFixed(2)} carta`
                : confirmedPay.contanti > 0 ? 'Contanti' : 'Carta'}
            </div>
            <button onClick={onClose} style={{
              padding: '10px 24px', background: SV_SUNSET_BG, color: SV_SUNSET_TEXT,
              border: 'none', borderRadius: 10, fontSize: 17, fontWeight: 700,
              boxShadow: SV_SUNSET_SHADOW,
              cursor: 'pointer', fontFamily: 'inherit',
            }}
            onMouseEnter={svSunsetHoverIn} onMouseLeave={svSunsetHoverOut}>Chiudi</button>
          </div>
        ) : (
          <>
            <div style={{
              padding: '14px 20px', borderBottom: '1px solid #F0F2F5',
              display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0,
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14.5, color: '#6B7280', fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase' }}>
                  Pagamento
                </div>
              </div>
              <button onClick={onClose} style={{
                width: 32, height: 32, borderRadius: 8,
                background: 'rgba(255,255,255,0.65)', border: '1px solid rgba(15,17,21,0.08)',
                cursor: 'pointer',
                fontSize: 22, fontFamily: 'inherit', color: '#6B7280',
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
                    fontSize: 15, fontWeight: 700, color: '#6B7280',
                    letterSpacing: 0.6, textTransform: 'uppercase', flex: 1,
                  }}>Totale</span>
                  <span style={{
                    fontSize: 40, fontWeight: 700, color: '#0F1115',
                    letterSpacing: -1, lineHeight: 1, fontVariantNumeric: 'tabular-nums',
                  }}>€{finalTotal.toFixed(2)}</span>
                </div>
                <div style={{ textAlign: 'right', marginTop: 6 }}>
                  <button onClick={() => setAdjustOpen(o => !o)} style={{
                    background: 'transparent', border: 'none', padding: 0,
                    fontFamily: 'inherit', fontSize: 15.5, fontWeight: 700,
                    color: adjustOpen ? '#0F1115' : '#6B7280', cursor: 'pointer',
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                  }}>
                    {adjust ? 'Modifica aggiustamento' : 'Aggiusta totale'}
                    <span style={{
                      display: 'inline-block', fontSize: 13,
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

              <div style={{ height: 1, background: 'rgba(15,17,21,0.08)', margin: '0 -22px 20px' }}/>

              {/* PAGAMENTO */}
              <div>
                <div style={{
                  fontSize: 14.5, fontWeight: 700, color: '#6B7280',
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
              padding: '14px 22px', borderTop: '1px solid rgba(15,17,21,0.08)',
              background: 'rgba(255,255,255,0.35)', flexShrink: 0,
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
                  background: canConfirm ? SV_SUNSET_BG : PN.WHITE_FROST,
                  color: canConfirm ? SV_SUNSET_TEXT : '#9CA3AF',
                  border: `1px solid ${canConfirm ? 'transparent' : PN.BORDER_SOFT_A}`,
                  fontSize: 19, fontWeight: 700,
                  cursor: canConfirm ? 'pointer' : 'not-allowed',
                  fontFamily: 'inherit', letterSpacing: -0.2,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  boxShadow: canConfirm ? SV_SUNSET_SHADOW : 'none',
                  transition: 'box-shadow 180ms ease-out, filter 150ms ease-out',
                }}
                onMouseEnter={e => { if (canConfirm) svSunsetHoverIn(e); }}
                onMouseLeave={svSunsetHoverOut}>
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
