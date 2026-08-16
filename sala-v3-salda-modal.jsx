// Sala v3 — Modale Salda conto v2: layout 2 colonne, no wizard, pre-conto sempre raggiungibile

function SalaV3SaldaModal({ open, tavolo, onClose }) {
  const [groupBy, setGroupBy] = React.useState('flat'); // flat | grouped
  // Map<itemId, qty selezionata> — permette selezione parziale (1 di 3, 2 di 3, tutti)
  const [selectedItems, setSelectedItems] = React.useState(new Map());
  const [collapsedGroups, setCollapsedGroups] = React.useState(new Set());

  // Aggiustamento totale
  const [adjust, setAdjust] = React.useState(null);
  // adjust: null | { type:'sconto-eur', val } | { type:'sconto-pct', val } | { type:'arrotonda', val } | { type:'custom', val }

  const [pay, setPay] = React.useState({ contanti: '', carta: '' });
  const [method, setMethod] = React.useState('contanti'); // contanti | carta | misto
  const [invoice, setInvoice] = React.useState(false);
  const [invoiceData, setInvoiceData] = React.useState({ ragione:'', piva:'', sdi:'' });
  const [invoiceOpen, setInvoiceOpen] = React.useState(false);
  const [adjustOpen, setAdjustOpen] = React.useState(false);

  const [done, setDone] = React.useState(false);
  const [preContoStampato, setPreContoStampato] = React.useState(null); // null | timestamp
  const [toast, setToast] = React.useState(null);

  React.useEffect(() => {
    if (open && tavolo) {
      setSelectedItems(new Map(tavolo.ordini.map(o => [o.id, o.qty])));
      setGroupBy('flat');
      setCollapsedGroups(new Set());
      setAdjust(null);
      setPay({ contanti:'', carta:'' });
      setMethod('contanti');
      setInvoice(false);
      setInvoiceOpen(false);
      setAdjustOpen(false);
      setDone(false);
      setPreContoStampato(null);
      setToast(null);
    }
  }, [open, tavolo]);

  if (!open || !tavolo) return null;

  const allOrdini = tavolo.ordini || [];
  const guests = tavolo.guests || [];
  const guestById = Object.fromEntries(guests.map(g => [g.id, g]));

  const selectedOrdini = allOrdini.filter(o => (selectedItems.get(o.id) || 0) > 0);
  const subtotale = selectedOrdini.reduce((s,o) => s + (selectedItems.get(o.id) || 0) * o.prezzo, 0);

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
      adjustLabel = `Importo personalizzato · ${adjustDelta < 0 ? '−' : '+'}€${Math.abs(adjustDelta).toFixed(2)}`;
    }
  }
  const total = Math.max(0, naturalTotal);

  const contanti = parseFloat(pay.contanti) || 0;
  const carta = parseFloat(pay.carta) || 0;
  const paid = contanti + carta;
  const resto = paid - total;
  const canConfirm = paid >= total - 0.01 && total > 0;

  function toggleItem(id) {
    const o = allOrdini.find(x => x.id === id);
    if (!o) return;
    setSelectedItems(s => {
      const ns = new Map(s);
      if ((ns.get(id) || 0) > 0) ns.delete(id);
      else ns.set(id, o.qty);
      return ns;
    });
  }
  function setItemQty(id, qty) {
    const o = allOrdini.find(x => x.id === id);
    if (!o) return;
    const clamped = Math.max(0, Math.min(qty, o.qty));
    setSelectedItems(s => {
      const ns = new Map(s);
      if (clamped === 0) ns.delete(id);
      else ns.set(id, clamped);
      return ns;
    });
  }
  function toggleGroup(gid) {
    setCollapsedGroups(s => {
      const ns = new Set(s);
      if (ns.has(gid)) ns.delete(gid); else ns.add(gid);
      return ns;
    });
  }
  function selectAll() { setSelectedItems(new Map(allOrdini.map(o => [o.id, o.qty]))); }
  function selectNone() { setSelectedItems(new Map()); }
  function selectGroup(items) {
    setSelectedItems(s => {
      const ns = new Map(s);
      const allIn = items.every(o => (ns.get(o.id) || 0) >= o.qty);
      items.forEach(o => allIn ? ns.delete(o.id) : ns.set(o.id, o.qty));
      return ns;
    });
  }
  function selectOnlyGroup(items) {
    setSelectedItems(new Map(items.map(o => [o.id, o.qty])));
  }

  function stampaPreConto(scope = 'tutto') {
    setPreContoStampato(Date.now());
    setToast({ type:'success', text: scope === 'tutto'
      ? `Pre-conto stampato · €${subtotale.toFixed(2)}`
      : `Pre-conto parziale stampato · ${scope}` });
    setTimeout(() => setToast(null), 2500);
  }

  function chooseMethod(m) {
    setMethod(m);
    if (m === 'contanti') setPay({ contanti: '', carta: '' });
    else if (m === 'carta')    setPay({ contanti: '', carta: total.toFixed(2) });
    else                       setPay({ contanti: '', carta: '' });
  }
  function setTendered(v)  { setPay({ contanti: v, carta: '' }); }
  function setMistoCash(v) { setPay(p => ({ ...p, contanti: v })); }
  function setMistoCard(v) { setPay(p => ({ ...p, carta: v })); }

  // Suggerimenti contanti: esatto + multipli arrotondati al rialzo
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

  // Costruzione gruppi per vista grouped
  const groups = (() => {
    const tavoloItems = allOrdini.filter(o => !o.guestId);
    const byGuest = guests.map(g => ({
      id: `g-${g.id}`,
      type: 'guest',
      title: g.name,
      sub: g.source === 'byup' ? 'App byup' : g.source === 'guest' ? 'Webapp guest' : 'Cameriere',
      items: allOrdini.filter(o => o.guestId === g.id),
      meta: g,
    })).filter(gr => gr.items.length > 0);
    const tavoloGroup = tavoloItems.length > 0 ? [{
      id: 'g-tavolo',
      type: 'tavolo',
      title: 'Tavolo',
      sub: 'Cameriere · gestionale · condivisi',
      items: tavoloItems,
    }] : [];
    return [...byGuest, ...tavoloGroup];
  })();

  return (
    <>
      <div onClick={onClose} style={{
        position:'absolute', inset: 0, background:'rgba(15,17,21,0.55)', zIndex: 60,
      }}/>
      <div style={{
        position:'absolute', top:'50%', left:'50%',
        transform:'translate(-50%, -50%)',
        width: 920, maxWidth:'94%', height: 660, maxHeight:'94%',
        background:'#fff', borderRadius: 16,
        boxShadow:'0 24px 70px rgba(0,0,0,0.28)',
        zIndex: 61, display:'flex', flexDirection:'column', overflow:'hidden',
      }}>
        {done ? (
          <SaldaDoneV2 tavolo={tavolo} total={total} pay={{contanti, carta}} invoice={invoice} onClose={onClose}/>
        ) : (
          <>
            {/* Header */}
            <div style={{
              padding:'14px 20px', borderBottom:'1px solid #F0F2F5',
              display:'flex', alignItems:'center', gap: 12, flexShrink: 0,
            }}>
              <div style={{flex:1}}>
                <div style={{fontSize: 10.5, color:'#6B7280', fontWeight:800, letterSpacing:0.6, textTransform:'uppercase'}}>
                  Salda conto
                </div>
                <div style={{fontSize: 18, fontWeight: 800, color:'#0F1115', marginTop: 1, letterSpacing:-0.2}}>
                  T.{tavolo.id}{tavolo.party ? ` · ${tavolo.party}` : ''}
                  <span style={{fontSize:12, fontWeight:600, color:'#9CA3AF', marginLeft:8}}>
                    · {tavolo.coperti || 1} coperti
                  </span>
                </div>
              </div>
              <button onClick={() => stampaPreConto('tutto')} style={btnGhost}>
                <IconPrinter/>
                {preContoStampato ? 'Ristampa pre-conto' : 'Stampa pre-conto'}
              </button>
              <button onClick={onClose} style={iconBtn}>×</button>
            </div>

            {/* Body 2 colonne */}
            <div style={{flex:1, display:'flex', minHeight: 0}}>
              {/* Sinistra: articoli */}
              <div style={{
                flex: '1.5 1 0', display:'flex', flexDirection:'column',
                borderRight:'1px solid #F0F2F5', minWidth: 0,
              }}>
                {/* Toolbar selezione */}
                <div style={{
                  padding:'10px 18px', borderBottom:'1px solid #F0F2F5',
                  display:'flex', alignItems:'center', gap: 8, flexShrink: 0,
                  background:'#FAFBFC',
                }}>
                  <div style={{display:'inline-flex', borderRadius: 8, overflow:'hidden', background:'#fff', border:'1px solid #E5E7EB'}}>
                    <button onClick={()=>setGroupBy('flat')} style={segBtn(groupBy === 'flat')}>
                      Tutti articoli
                    </button>
                    <button onClick={()=>setGroupBy('grouped')} style={segBtn(groupBy === 'grouped')}>
                      Per ordinante
                    </button>
                  </div>
                  <span style={{flex:1}}/>
                  <button onClick={selectAll} style={miniLink}>Tutto</button>
                  <span style={{color:'#D1D5DB'}}>·</span>
                  <button onClick={selectNone} style={miniLink}>Niente</button>
                </div>

                {/* Lista articoli */}
                <div className="pn-scroll" style={{flex:1, overflow:'auto', padding:'10px 18px 14px'}}>
                  {groupBy === 'flat' ? (
                    <FlatList ordini={allOrdini} selectedItems={selectedItems} toggleItem={toggleItem} setItemQty={setItemQty} guestById={guestById}/>
                  ) : (
                    <GroupedList groups={groups}
                      selectedItems={selectedItems}
                      toggleItem={toggleItem}
                      setItemQty={setItemQty}
                      collapsedGroups={collapsedGroups}
                      toggleGroup={toggleGroup}
                      selectGroup={selectGroup}
                      selectOnlyGroup={selectOnlyGroup}/>
                  )}
                </div>
              </div>

              {/* Destra: riepilogo + pagamento */}
              <div style={{
                flex: '1 1 0', display:'flex', flexDirection:'column',
                background:'#FAFBFC', minWidth: 340,
              }}>
                <div className="pn-scroll" style={{flex:1, overflow:'auto', padding:'18px 22px'}}>

                  {/* RIEPILOGO TOTALE */}
                  <div style={{marginBottom: 18}}>
                    {/* breakdown lines */}
                    <div style={{display:'flex', flexDirection:'column', gap: 5, marginBottom: 12}}>
                      <ReceiptRow
                        label={`Subtotale${selectedOrdini.length < allOrdini.length ? ` · ${selectedOrdini.length} di ${allOrdini.length}` : ''}`}
                        value={`€${subtotale.toFixed(2)}`}/>
                      {adjust && (
                        <ReceiptRow
                          label={adjustLabel.split(' · ')[0]}
                          value={(adjustDelta >= 0 ? '+' : '−') + '€' + Math.abs(adjustDelta).toFixed(2)}
                          tone={adjustDelta < 0 ? 'success' : 'danger'}
                          onRemove={() => setAdjust(null)}/>
                      )}
                    </div>

                    {/* HERO TOTAL */}
                    <div style={{
                      paddingTop: 14, borderTop:'1px solid #E5E7EB',
                      display:'flex', alignItems:'baseline', gap: 8,
                    }}>
                      <span style={{
                        fontSize: 11, fontWeight: 800, color:'#6B7280',
                        letterSpacing: 0.6, textTransform:'uppercase', flex: 1,
                      }}>Totale</span>
                      <span style={{
                        fontSize: 36, fontWeight: 800, color:'#0F1115',
                        letterSpacing:-1, lineHeight: 1,
                        fontVariantNumeric:'tabular-nums',
                      }}>€{total.toFixed(2)}</span>
                    </div>

                    {/* Aggiusta link */}
                    <div style={{textAlign:'right', marginTop: 6}}>
                      <button onClick={() => setAdjustOpen(o => !o)} style={{
                        background:'transparent', border:'none', padding: 0,
                        fontFamily:'inherit', fontSize: 11.5, fontWeight: 700,
                        color: adjustOpen ? '#0F1115' : '#6B7280',
                        cursor:'pointer',
                        display:'inline-flex', alignItems:'center', gap: 4,
                      }}>
                        {adjust ? 'Modifica aggiustamento' : 'Aggiusta totale'}
                        <span style={{
                          display:'inline-block',
                          transform: adjustOpen ? 'rotate(180deg)' : 'none',
                          transition:'transform 0.15s',
                          fontSize: 9,
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

                  <div style={{height: 1, background:'#E5E7EB', margin:'0 -22px 18px'}}/>

                  {/* PAGAMENTO */}
                  <div style={{marginBottom: 18}}>
                    <div style={{...sectionLabel, marginBottom: 10}}>Come paga il cliente?</div>

                    {/* Method tabs */}
                    <div style={{
                      display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap: 6,
                      marginBottom: 14,
                    }}>
                      <MethodTab active={method==='contanti'} onClick={()=>chooseMethod('contanti')}
                        icon={<IconCash/>} label="Contanti"/>
                      <MethodTab active={method==='carta'} onClick={()=>chooseMethod('carta')}
                        icon={<IconCard/>} label="Carta"/>
                      <MethodTab active={method==='misto'} onClick={()=>chooseMethod('misto')}
                        icon={<IconSplit/>} label="Misto"/>
                    </div>

                    {method === 'contanti' && (
                      <CashTendered
                        total={total}
                        value={pay.contanti}
                        onChange={setTendered}
                        chips={smartCashChips(total)}/>
                    )}

                    {method === 'carta' && (
                      <CardPay total={total}/>
                    )}

                    {method === 'misto' && (
                      <MixedPay
                        total={total} pay={pay} contanti={contanti} carta={carta} paid={paid}
                        onCash={setMistoCash} onCard={setMistoCard}/>
                    )}
                  </div>

                  <div style={{height: 1, background:'#E5E7EB', margin:'0 -22px 16px'}}/>

                  {/* FATTURA */}
                  <div>
                    <div style={{
                      display:'flex', alignItems:'center', gap: 10,
                      padding:'4px 0',
                    }}>
                      <div style={{flex:1}}>
                        <div style={{fontSize: 13, fontWeight: 700, color:'#0F1115'}}>Emetti fattura</div>
                        <div style={{fontSize: 11, color:'#9CA3AF', marginTop: 1}}>
                          {invoice && invoiceData.ragione
                            ? `${invoiceData.ragione}${invoiceData.piva ? ' · '+invoiceData.piva : ''}`
                            : 'Solo se richiesta dal cliente'}
                        </div>
                      </div>
                      <SwitchToggle on={invoice} onChange={() => { setInvoice(v => !v); setInvoiceOpen(!invoice); }}/>
                    </div>

                    {invoice && invoiceOpen && (
                      <InvoiceForm data={invoiceData} setData={setInvoiceData}/>
                    )}
                  </div>
                </div>

                {/* Footer di destra: CTA principale */}
                <div style={{
                  padding:'14px 22px', borderTop:'1px solid #F0F2F5',
                  background:'#fff', flexShrink: 0,
                  display:'flex', flexDirection:'column', gap: 8,
                }}>
                  <button onClick={() => setDone(true)}
                    disabled={!canConfirm}
                    style={{
                      width:'100%', padding:'15px 16px', borderRadius: 10,
                      background: canConfirm ? '#0F1115' : '#E5E7EB',
                      color: canConfirm ? '#fff' : '#9CA3AF',
                      border:'none', fontSize: 15, fontWeight: 800,
                      cursor: canConfirm ? 'pointer' : 'not-allowed',
                      fontFamily:'inherit',
                      letterSpacing:-0.2,
                      display:'flex', alignItems:'center', justifyContent:'center', gap: 8,
                    }}>
                    {!canConfirm
                      ? (total === 0 ? 'Nessun articolo selezionato' : `Manca €${(total-paid).toFixed(2)}`)
                      : <>Conferma incasso <span style={{opacity:0.6}}>·</span> €{total.toFixed(2)}</>}
                  </button>
                  {preContoStampato && (
                    <div style={{
                      fontSize: 10.5, color:'#9CA3AF', textAlign:'center',
                      fontWeight: 600,
                    }}>
                      Pre-conto stampato {Math.floor((Date.now() - preContoStampato)/60000) || 'ora'}{Math.floor((Date.now() - preContoStampato)/60000) > 0 ? ' min fa' : ''}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {toast && (
              <div style={{
                position:'absolute', bottom: 80, left:'50%',
                transform:'translateX(-50%)',
                padding:'10px 16px', borderRadius: 999,
                background:'#0F1115', color:'#fff',
                fontSize: 12.5, fontWeight: 700,
                boxShadow:'0 8px 24px rgba(0,0,0,0.2)',
                zIndex: 62,
              }}>{toast.text}</div>
            )}
          </>
        )}
      </div>
    </>
  );
}

// ────────── LISTA ARTICOLI FLAT ──────────
function FlatList({ ordini, selectedItems, toggleItem, setItemQty, guestById }) {
  if (ordini.length === 0) return <EmptyOrdini/>;
  return (
    <div style={{display:'flex', flexDirection:'column', gap: 2}}>
      {ordini.map(o => (
        <ItemRowV2 key={o.id} o={o}
          selectedQty={selectedItems.get(o.id) || 0}
          onToggle={()=>toggleItem(o.id)}
          onSetQty={(q)=>setItemQty(o.id, q)}
          guest={o.guestId ? guestById[o.guestId] : null}/>
      ))}
    </div>
  );
}

// ────────── LISTA ARTICOLI GROUPED ──────────
function GroupedList({ groups, selectedItems, toggleItem, setItemQty, collapsedGroups, toggleGroup, selectGroup, selectOnlyGroup }) {
  if (groups.length === 0) return <EmptyOrdini/>;
  return (
    <div style={{display:'flex', flexDirection:'column'}}>
      {groups.map((g, gi) => {
        const collapsed = collapsedGroups.has(g.id);
        const groupTotal = g.items.reduce((s,o)=>s+o.qty*o.prezzo, 0);
        const allSelected = g.items.every(o => (selectedItems.get(o.id) || 0) >= o.qty);
        const someSelected = g.items.some(o => (selectedItems.get(o.id) || 0) > 0);
        const isLast = gi === groups.length - 1;
        return (
          <div key={g.id} style={{
            borderBottom: isLast ? 'none' : '1px solid #F0F2F5',
            paddingBottom: isLast ? 0 : 8, marginBottom: isLast ? 0 : 8,
          }}>
            {/* Group header */}
            <div style={{
              display:'flex', alignItems:'center', gap: 10,
              padding:'4px 4px 6px',
            }}>
              <button onClick={() => selectGroup(g.items)} title={allSelected ? 'Deseleziona gruppo' : 'Seleziona gruppo'} style={{
                width: 18, height: 18, borderRadius: 4, padding: 0,
                border: allSelected ? '2px solid #0F1115' : someSelected ? '1.5px solid #0F1115' : '1.5px solid #D1D5DB',
                background: allSelected ? '#0F1115' : someSelected ? '#E5E7EB' : '#fff',
                display:'grid', placeItems:'center', flexShrink: 0,
                cursor:'pointer',
              }}>
                {allSelected && (
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 13 L9 17 L19 7"/>
                  </svg>
                )}
                {someSelected && !allSelected && (
                  <span style={{display:'block', width: 8, height: 2, background:'#0F1115', borderRadius:1}}/>
                )}
              </button>

              {g.type === 'guest' ? (
                <GuestAvatarV2 g={g.meta}/>
              ) : (
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background:'#F1F2F5', color:'#6B7280',
                  display:'grid', placeItems:'center', flexShrink: 0,
                }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 11 H21 M5 11 V7 a4 4 0 0 1 8 0 V11 M16 11 V8 a3 3 0 0 1 6 0 V11 M5 11 L7 19 H17 L19 11"/>
                  </svg>
                </div>
              )}

              <button onClick={() => toggleGroup(g.id)} style={{
                flex: 1, padding: 0, border:'none', background:'none',
                cursor:'pointer', textAlign:'left', fontFamily:'inherit',
                display:'flex', alignItems:'center', gap: 6,
              }}>
                <div style={{flex:1, minWidth: 0}}>
                  <div style={{fontSize: 13, fontWeight: 700, color:'#0F1115', display:'flex', alignItems:'center', gap: 6}}>
                    <span style={{whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{g.title}</span>
                    {g.type === 'guest' && g.meta?.source === 'byup' && (
                      <span style={{
                        fontSize: 9, fontWeight: 800, color:'#E04347',
                        background:'#FFE0DD', padding:'1px 5px', borderRadius: 3,
                        letterSpacing: 0.4, textTransform:'uppercase', flexShrink: 0,
                      }}>byup</span>
                    )}
                  </div>
                  <div style={{fontSize: 10.5, color:'#9CA3AF', fontWeight: 600}}>
                    {g.sub} · {g.items.length} articol{g.items.length === 1 ? 'o' : 'i'}
                  </div>
                </div>
                <span style={{fontSize: 13, fontWeight:800, color:'#0F1115', fontVariantNumeric:'tabular-nums'}}>€{groupTotal.toFixed(2)}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{
                  transform: collapsed ? 'rotate(-90deg)' : 'rotate(0)',
                  transition:'transform 0.15s',
                }}>
                  <path d="M6 9 L12 15 L18 9"/>
                </svg>
              </button>
              <button onClick={() => selectOnlyGroup(g.items)} title="Salda solo questo gruppo" style={{
                background:'transparent', border:'none', padding:'2px 6px',
                fontSize: 10.5, color:'#6B7280', fontWeight: 700,
                fontFamily:'inherit', cursor:'pointer', flexShrink: 0,
                borderRadius: 4,
              }}>Solo</button>
            </div>

            {/* Group items */}
            {!collapsed && (
              <div style={{paddingLeft: 38, display:'flex', flexDirection:'column', gap: 1}}>
                {g.items.map(o => (
                  <ItemRowV2 key={o.id} o={o}
                    selectedQty={selectedItems.get(o.id) || 0}
                    onToggle={()=>toggleItem(o.id)}
                    onSetQty={(q)=>setItemQty(o.id, q)}
                    guest={null}
                    hideBayupBadge={g.type === 'guest' && g.meta?.source === 'byup'}/>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function ItemRowV2({ o, selectedQty, onToggle, onSetQty, guest, hideBayupBadge }) {
  const allSel = selectedQty >= o.qty;
  const noneSel = selectedQty === 0;
  const partialSel = !allSel && !noneSel;
  const showStepper = o.qty > 1;
  const stop = (e) => e.stopPropagation();
  return (
    <div onClick={onToggle} style={{
      display:'flex', alignItems:'center', gap: 10,
      padding:'7px 8px', cursor:'pointer',
      background: !noneSel ? '#F8F9FB' : 'transparent',
      borderRadius: 6, transition:'background 0.1s',
    }}>
      <span style={{
        width: 18, height: 18, borderRadius: 4,
        border: allSel ? '2px solid #0F1115' : partialSel ? '1.5px solid #0F1115' : '1.5px solid #D1D5DB',
        background: allSel ? '#0F1115' : partialSel ? '#E5E7EB' : '#fff',
        display:'grid', placeItems:'center', flexShrink: 0,
      }}>
        {allSel && (
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 13 L9 17 L19 7"/>
          </svg>
        )}
        {partialSel && (
          <span style={{display:'block', width: 8, height: 2, background:'#0F1115', borderRadius:1}}/>
        )}
      </span>
      {showStepper && !noneSel ? (
        <div onClick={stop} style={{
          display:'inline-flex', alignItems:'center',
          background:'#fff', border:'1px solid #D1D5DB', borderRadius: 6,
          overflow:'hidden', flexShrink: 0,
        }}>
          <button onClick={() => onSetQty(selectedQty - 1)} style={qtyBtn} title="Togli uno">−</button>
          <span style={{
            fontSize: 12, fontWeight: 800, color:'#0F1115',
            minWidth: 38, textAlign:'center', padding:'0 4px',
            whiteSpace:'nowrap', fontVariantNumeric:'tabular-nums',
          }}>{selectedQty}/{o.qty}</span>
          <button onClick={() => onSetQty(selectedQty + 1)} disabled={selectedQty >= o.qty} style={{...qtyBtn, opacity: selectedQty >= o.qty ? 0.3 : 1}} title="Aggiungi uno">+</button>
        </div>
      ) : (
        <span style={{
          fontSize: 12, fontWeight: 800, color:'#0F1115',
          background:'#F1F2F5', borderRadius: 4,
          padding:'1px 6px', minWidth: 22, textAlign:'center',
          fontVariantNumeric:'tabular-nums',
        }}>{o.qty}×</span>
      )}
      <span style={{flex:1, fontSize: 13, color:'#0F1115'}}>{o.nome}</span>
      {guest && (
        <span style={{fontSize: 10.5, color:'#9CA3AF', fontStyle:'italic'}}>{guest.name.split(' ')[0]}</span>
      )}
      {o.origin === 'byup' && !hideBayupBadge && (
        <span style={{
          fontSize: 9, fontWeight: 800, color:'#E04347',
          background:'#FFE0DD', padding:'1px 5px', borderRadius: 3,
          letterSpacing: 0.4, textTransform:'uppercase',
        }}>byup</span>
      )}
      <span style={{fontSize: 13, fontWeight:700, color:'#0F1115', minWidth: 56, textAlign:'right', fontVariantNumeric:'tabular-nums'}}>
        €{((noneSel ? o.qty : selectedQty) * o.prezzo).toFixed(2)}
      </span>
    </div>
  );
}

const qtyBtn = {
  width: 22, height: 22, padding: 0, border: 'none',
  background: 'transparent', color: '#0F1115',
  fontSize: 14, fontWeight: 800, cursor:'pointer',
  display:'grid', placeItems:'center',
};

function GuestAvatarV2({ g }) {
  const isUser = g.source === 'byup';
  return (
    <div style={{
      width: 28, height: 28, borderRadius: '50%',
      background: isUser ? '#FFE0DD' : g.source === 'guest' ? '#FEF3C7' : '#F1F2F5',
      color: isUser ? '#E04347' : g.source === 'guest' ? '#92400E' : '#6B7280',
      display:'grid', placeItems:'center',
      fontSize: 10.5, fontWeight: 800,
      flexShrink: 0,
    }}>
      {g.name.split(' ').map(s=>s[0]).join('').slice(0,2)}
    </div>
  );
}

function EmptyOrdini() {
  return (
    <div style={{
      padding:'40px 20px', textAlign:'center', color:'#9CA3AF',
      fontSize: 13,
    }}>Nessun articolo ordinato</div>
  );
}

// ────────── RIGHT COLUMN HELPERS ──────────
function ReceiptRow({ label, value, tone, onRemove }) {
  const color = tone === 'success' ? '#16A34A' : tone === 'danger' ? '#DC2626' : '#6B7280';
  return (
    <div style={{display:'flex', alignItems:'center', gap: 8, fontSize: 12.5}}>
      <span style={{color, flex: 1}}>{label}</span>
      {onRemove && (
        <button onClick={onRemove} style={{
          background:'transparent', border:'none', padding: 0,
          fontFamily:'inherit', fontSize: 11, color:'#9CA3AF',
          cursor:'pointer', textDecoration:'underline',
        }}>rimuovi</button>
      )}
      <span style={{color, fontWeight: 700, fontVariantNumeric:'tabular-nums'}}>{value}</span>
    </div>
  );
}

function MethodTab({ active, onClick, icon, label }) {
  return (
    <button onClick={onClick} style={{
      display:'flex', flexDirection:'column', alignItems:'center', gap: 5,
      padding:'12px 6px', borderRadius: 10,
      background: active ? '#0F1115' : '#fff',
      color: active ? '#fff' : '#0F1115',
      border: active ? '1px solid #0F1115' : '1px solid #E5E7EB',
      cursor:'pointer', fontFamily:'inherit',
      fontSize: 12, fontWeight: 700,
      transition:'all 0.15s',
    }}>
      <span style={{opacity: active ? 1 : 0.7}}>{icon}</span>
      {label}
    </button>
  );
}

function CashTendered({ total, value, onChange, chips }) {
  const tendered = parseFloat(value) || 0;
  const enough = tendered >= total - 0.01 && tendered > 0;
  const resto = tendered - total;
  return (
    <div>
      <div style={{
        fontSize: 11, fontWeight: 700, color:'#6B7280',
        marginBottom: 6,
      }}>Importo ricevuto</div>
      <div style={{
        display:'flex', alignItems:'baseline', gap: 4,
        background:'#fff', border:'1.5px solid #E5E7EB',
        borderRadius: 10, padding:'12px 14px',
        marginBottom: 8,
      }}>
        <span style={{fontSize: 18, fontWeight: 700, color:'#9CA3AF'}}>€</span>
        <input type="number" value={value} onChange={e => onChange(e.target.value)}
          placeholder={total.toFixed(2)}
          style={{
            border:'none', outline:'none',
            fontSize: 22, fontWeight: 800, color:'#0F1115',
            width:'100%', padding: 0, fontFamily:'inherit',
            background:'transparent',
            fontVariantNumeric:'tabular-nums',
          }}/>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap: 6, marginBottom: 12}}>
        {chips.map(c => {
          const sel = parseFloat(c.val) === tendered;
          return (
            <button key={c.label} onClick={() => onChange(c.val)} style={{
              padding:'8px 4px', borderRadius: 8,
              background: sel ? '#0F1115' : '#fff',
              color: sel ? '#fff' : '#0F1115',
              border: sel ? '1px solid #0F1115' : '1px solid #E5E7EB',
              fontSize: 12, fontWeight: 700, cursor:'pointer',
              fontFamily:'inherit', whiteSpace:'nowrap',
            }}>{c.label}</button>
          );
        })}
      </div>

      {tendered > 0 && (
        <div style={{
          padding:'10px 14px', borderRadius: 10,
          background: enough ? '#DCFCE7' : '#FEF3C7',
          color: enough ? '#166534' : '#92400E',
          display:'flex', justifyContent:'space-between', alignItems:'center',
        }}>
          <span style={{fontSize: 12, fontWeight: 700}}>
            {enough ? (resto > 0.01 ? 'Resto da dare' : 'Pagamento esatto') : 'Manca ancora'}
          </span>
          <span style={{fontSize: 18, fontWeight: 800, fontVariantNumeric:'tabular-nums'}}>
            €{Math.abs(enough ? resto : total - tendered).toFixed(2)}
          </span>
        </div>
      )}
    </div>
  );
}

function CardPay({ total }) {
  return (
    <div style={{
      padding:'18px 16px', borderRadius: 12,
      background:'#fff', border:'1.5px dashed #D1D5DB',
      textAlign:'center',
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 12,
        background:'#F1F2F5', color:'#0F1115',
        display:'grid', placeItems:'center', margin:'0 auto 10px',
      }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10 H22"/>
        </svg>
      </div>
      <div style={{fontSize: 13, fontWeight: 700, color:'#0F1115', marginBottom: 2}}>
        Inserisci la carta nel POS
      </div>
      <div style={{fontSize: 22, fontWeight: 800, color:'#0F1115', letterSpacing:-0.4, fontVariantNumeric:'tabular-nums'}}>
        €{total.toFixed(2)}
      </div>
      <div style={{fontSize: 11, color:'#9CA3AF', marginTop: 4}}>
        Conferma quando la transazione è completata
      </div>
    </div>
  );
}

function MixedPay({ total, pay, contanti, carta, paid, onCash, onCard }) {
  const remaining = Math.max(0, total - paid);
  const pct = total > 0 ? Math.min(100, (paid / total) * 100) : 0;
  const enough = paid >= total - 0.01;
  return (
    <div>
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap: 8, marginBottom: 10}}>
        <SmallPayInput label="Contanti" icon={<IconCash/>} value={pay.contanti} onChange={onCash}/>
        <SmallPayInput label="Carta" icon={<IconCard/>} value={pay.carta} onChange={onCard}/>
      </div>

      {/* split helpers */}
      <div style={{display:'flex', gap: 6, marginBottom: 12}}>
        <button onClick={() => { onCash((total/2).toFixed(2)); onCard((total/2).toFixed(2)); }} style={miniSplit}>
          Dividi 50/50
        </button>
        {remaining > 0 && contanti > 0 && (
          <button onClick={() => onCard(remaining.toFixed(2))} style={miniSplit}>
            Resto su carta · €{remaining.toFixed(2)}
          </button>
        )}
        {remaining > 0 && carta > 0 && contanti === 0 && (
          <button onClick={() => onCash(remaining.toFixed(2))} style={miniSplit}>
            Resto in contanti · €{remaining.toFixed(2)}
          </button>
        )}
      </div>

      {/* Progress bar */}
      <div style={{
        height: 6, borderRadius: 999,
        background:'#E5E7EB', overflow:'hidden', marginBottom: 8,
      }}>
        <div style={{
          width: `${pct}%`, height:'100%',
          background: enough ? '#16A34A' : '#0F1115',
          transition:'width 0.2s',
        }}/>
      </div>
      <div style={{
        display:'flex', justifyContent:'space-between',
        fontSize: 12, fontWeight: 700,
      }}>
        <span style={{color: enough ? '#166534' : '#6B7280'}}>
          Pagato €{paid.toFixed(2)} / €{total.toFixed(2)}
        </span>
        <span style={{color: enough ? '#166534' : '#DC2626'}}>
          {enough ? '✓ Completo' : `Manca €${remaining.toFixed(2)}`}
        </span>
      </div>
    </div>
  );
}

function SmallPayInput({ label, icon, value, onChange }) {
  return (
    <label style={{
      display:'flex', flexDirection:'column', gap: 4,
      background:'#fff', borderRadius: 10,
      border: parseFloat(value) > 0 ? '1.5px solid #0F1115' : '1.5px solid #E5E7EB',
      padding:'8px 10px', transition:'border 0.15s',
    }}>
      <div style={{display:'flex', alignItems:'center', gap: 5, color:'#6B7280'}}>
        {icon}
        <span style={{fontSize: 11, fontWeight: 700}}>{label}</span>
      </div>
      <div style={{display:'flex', alignItems:'baseline', gap: 3}}>
        <span style={{fontSize: 13, fontWeight: 700, color:'#9CA3AF'}}>€</span>
        <input type="number" value={value} onChange={e => onChange(e.target.value)}
          placeholder="0.00"
          style={{
            border:'none', outline:'none',
            fontSize: 16, fontWeight: 800, color:'#0F1115',
            width:'100%', padding: 0, fontFamily:'inherit',
            background:'transparent',
            fontVariantNumeric:'tabular-nums',
          }}/>
      </div>
    </label>
  );
}

function SwitchToggle({ on, onChange }) {
  return (
    <button onClick={onChange} style={{
      width: 40, height: 22, borderRadius: 999, padding: 0,
      border: 'none', cursor:'pointer', flexShrink: 0,
      background: on ? '#0F1115' : '#D1D5DB',
      position:'relative', transition:'background 0.15s',
    }}>
      <span style={{
        position:'absolute', top: 2, left: on ? 20 : 2,
        width: 18, height: 18, borderRadius:'50%',
        background:'#fff',
        boxShadow:'0 1px 3px rgba(0,0,0,0.2)',
        transition:'left 0.15s',
      }}/>
    </button>
  );
}

function IconSplit() { return (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6 H10 a4 4 0 0 1 4 4 V14 a4 4 0 0 0 4 4 H21 M3 18 H10 a4 4 0 0 0 4 -4"/>
    <path d="M18 3 L21 6 L18 9 M18 15 L21 18 L18 21"/>
  </svg>
); }

const miniSplit = {
  flex: 1, padding:'7px 8px', borderRadius: 8,
  background:'#fff', color:'#0F1115',
  border:'1px solid #E5E7EB', cursor:'pointer',
  fontSize: 11, fontWeight: 700, fontFamily:'inherit',
  whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis',
};

// ────────── PANNELLO AGGIUSTAMENTO ──────────
function AdjustPanel({ subtotale, adjust, setAdjust, onClose }) {
  const [mode, setMode] = React.useState(adjust?.type || 'sconto-eur');
  const [val, setVal] = React.useState(adjust?.val || '');

  React.useEffect(() => {
    if (adjust) { setMode(adjust.type); setVal(adjust.val || ''); }
  }, [adjust]);

  function apply(t, v) {
    if (!v && v !== 0) { setAdjust(null); return; }
    setAdjust({ type: t, val: parseFloat(v) || 0 });
  }

  return (
    <div style={{
      marginTop: 10, padding: 12, borderRadius: 10,
      background:'#fff', border:'1px solid #E5E7EB',
      boxShadow:'0 4px 12px rgba(15,17,21,0.06)',
    }}>
      <div style={{display:'flex', gap: 4, marginBottom: 10}}>
        {[
          { id:'sconto-eur', label:'Sconto €' },
          { id:'sconto-pct', label:'Sconto %' },
          { id:'arrotonda',  label:'Arrotonda' },
          { id:'custom',     label:'Custom' },
        ].map(opt => (
          <button key={opt.id} onClick={()=>{setMode(opt.id); setVal(''); }} style={{
            flex:1, padding:'6px 4px', borderRadius: 6,
            background: mode === opt.id ? '#0F1115' : '#F8F9FB',
            color: mode === opt.id ? '#fff' : '#0F1115',
            border:'none', fontSize: 11, fontWeight: 700,
            cursor:'pointer', fontFamily:'inherit',
          }}>{opt.label}</button>
        ))}
      </div>

      {mode === 'sconto-eur' && (
        <div>
          <div style={{display:'flex', gap: 4, marginBottom: 8}}>
            {[5, 10, 15, 20].map(v => (
              <button key={v} onClick={()=>{setVal(v); apply('sconto-eur', v);}} style={chipQuick}>−€{v}</button>
            ))}
          </div>
          <input type="number" value={val} onChange={e=>{setVal(e.target.value); apply('sconto-eur', e.target.value);}}
            placeholder="Importo sconto in €"
            style={inputV2}/>
        </div>
      )}

      {mode === 'sconto-pct' && (
        <div>
          <div style={{display:'flex', gap: 4, marginBottom: 8}}>
            {[5, 10, 15, 20].map(v => (
              <button key={v} onClick={()=>{setVal(v); apply('sconto-pct', v);}} style={chipQuick}>−{v}%</button>
            ))}
          </div>
          <input type="number" value={val} onChange={e=>{setVal(e.target.value); apply('sconto-pct', e.target.value);}}
            placeholder="Percentuale sconto"
            style={inputV2}/>
        </div>
      )}

      {mode === 'arrotonda' && (
        <button onClick={()=>setAdjust({ type:'arrotonda', val: 0 })} style={{
          width:'100%', padding:'10px 12px', borderRadius: 8,
          background:'#F1F2F5', color:'#0F1115',
          border:'1px solid #E5E7EB', cursor:'pointer',
          fontSize: 13, fontWeight: 700, fontFamily:'inherit',
        }}>
          Arrotonda per difetto a €{Math.floor(subtotale).toFixed(0)}
        </button>
      )}

      {mode === 'custom' && (
        <div>
          <input type="number" value={val} onChange={e=>{setVal(e.target.value); apply('custom', e.target.value);}}
            placeholder={`Naturale: €${subtotale.toFixed(2)}`}
            style={{...inputV2, fontSize: 16, fontWeight: 800}}/>
          <div style={{fontSize: 10.5, color:'#6B7280', marginTop: 4}}>
            Sostituisce il totale naturale di €{subtotale.toFixed(2)}
          </div>
        </div>
      )}
    </div>
  );
}

// ────────── INPUT PAGAMENTO ──────────
function PayInput({ label, icon, value, onChange }) {
  return (
    <label style={{
      display:'flex', flexDirection:'column', gap: 4,
      background:'#fff', borderRadius: 8,
      border:'1px solid #E5E7EB', padding:'8px 10px',
    }}>
      <div style={{display:'flex', alignItems:'center', gap: 6, color:'#6B7280'}}>
        {icon}
        <span style={{fontSize: 11, fontWeight: 700}}>{label}</span>
      </div>
      <div style={{display:'flex', alignItems:'baseline', gap: 4}}>
        <span style={{fontSize: 14, fontWeight: 700, color:'#9CA3AF'}}>€</span>
        <input type="number" value={value} onChange={e=>onChange(e.target.value)}
          placeholder="0.00"
          style={{
            border:'none', outline:'none',
            fontSize: 16, fontWeight: 800, color:'#0F1115',
            width:'100%', padding: 0, fontFamily:'inherit',
            background:'transparent',
          }}/>
      </div>
    </label>
  );
}

// ────────── FATTURA ──────────
function InvoiceForm({ data, setData }) {
  return (
    <div style={{
      marginTop: 8, padding: 12, borderRadius: 10,
      background:'#fff', border:'1px solid #E5E7EB',
      display:'flex', flexDirection:'column', gap: 8,
    }}>
      <input value={data.ragione} onChange={e=>setData({...data, ragione: e.target.value})}
        placeholder="Ragione sociale"
        style={inputV2}/>
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap: 6}}>
        <input value={data.piva} onChange={e=>setData({...data, piva: e.target.value})}
          placeholder="P.IVA" style={inputV2}/>
        <input value={data.sdi} onChange={e=>setData({...data, sdi: e.target.value})}
          placeholder="Codice SDI" style={inputV2}/>
      </div>
    </div>
  );
}

// ────────── DONE ──────────
function SaldaDoneV2({ tavolo, total, pay, invoice, onClose }) {
  return (
    <div style={{
      flex:1, display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center', padding: 30,
    }}>
      <div style={{
        width: 72, height: 72, borderRadius: '50%',
        background:'#DCFCE7', color:'#16A34A',
        marginBottom: 16,
        display:'grid', placeItems:'center',
      }}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 13 L9 17 L19 7"/>
        </svg>
      </div>
      <div style={{fontSize: 22, fontWeight: 800, color:'#0F1115', marginBottom: 4}}>
        Pagamento incassato
      </div>
      <div style={{fontSize: 26, fontWeight: 800, color:'#0F1115', marginBottom: 8, letterSpacing:-0.5}}>
        €{total.toFixed(2)}
      </div>
      <div style={{fontSize: 13, color:'#6B7280', marginBottom: 24, textAlign:'center'}}>
        T.{tavolo.id}
        {pay.contanti > 0 && pay.carta > 0
          ? ` · €${pay.contanti.toFixed(2)} contanti + €${pay.carta.toFixed(2)} carta`
          : pay.contanti > 0 ? ' · Contanti' : ' · Carta'}
        {invoice && ' · Fattura emessa'}
      </div>
      <div style={{display:'flex', gap: 8}}>
        <button onClick={onClose} style={btnSecondaryV2}>Chiudi</button>
        <button onClick={onClose} style={btnPrimaryV2}>
          <IconPrinter/> Stampa scontrino
        </button>
      </div>
    </div>
  );
}

// ────────── ICONE ──────────
function IconPrinter() { return (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9 V3 H18 V9"/><rect x="4" y="9" width="16" height="9" rx="1.5"/><path d="M6 14 H18 V21 H6 Z"/>
  </svg>
); }
function IconPrinterMini() { return (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9 V3 H18 V9"/><rect x="4" y="9" width="16" height="9" rx="1.5"/><path d="M6 14 H18 V21 H6 Z"/>
  </svg>
); }
function IconCash() { return (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="3"/>
  </svg>
); }
function IconCard() { return (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10 H22"/>
  </svg>
); }
function IconAdjust() { return (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5 V19 M5 12 H19"/>
  </svg>
); }

// ────────── STILI ──────────
const btnGhost = {
  display:'inline-flex', alignItems:'center', gap: 6,
  padding:'7px 12px', background:'#F1F2F5', color:'#0F1115',
  border:'none', borderRadius: 8, fontSize: 12, fontWeight: 700,
  cursor:'pointer', fontFamily:'inherit',
};
const iconBtn = {
  width: 32, height: 32, borderRadius: 8,
  background:'#F1F2F5', border:'none', cursor:'pointer',
  fontSize: 18, fontFamily:'inherit', color:'#6B7280',
};
const iconBtnSmall = {
  width: 28, height: 28, borderRadius: 6,
  background:'transparent', border:'none', cursor:'pointer',
  display:'grid', placeItems:'center',
};
const sectionLabel = {
  fontSize: 10.5, fontWeight: 800, color:'#6B7280',
  letterSpacing: 0.6, textTransform:'uppercase',
  marginBottom: 8,
};
const btnPrimaryV2 = {
  display:'inline-flex', alignItems:'center', gap: 6,
  padding:'10px 16px', background:'#0F1115', color:'#fff',
  border:'none', borderRadius: 8, fontSize: 13, fontWeight: 700,
  cursor:'pointer', fontFamily:'inherit',
};
const btnSecondaryV2 = {
  padding:'10px 16px', background:'#fff', color:'#0F1115',
  border:'1px solid #E5E7EB', borderRadius: 8, fontSize: 13, fontWeight: 700,
  cursor:'pointer', fontFamily:'inherit',
};
function segBtn(on) {
  return {
    padding:'6px 12px', background: on ? '#0F1115' : 'transparent',
    color: on ? '#fff' : '#0F1115',
    border:'none', fontSize: 12, fontWeight: 700,
    cursor:'pointer', fontFamily:'inherit',
    whiteSpace:'nowrap',
  };
}
function quickBtn(on) {
  return {
    flex:1, display:'inline-flex', alignItems:'center', justifyContent:'center', gap: 6,
    padding:'8px 8px', borderRadius: 8,
    background: on ? '#FFF7ED' : '#fff',
    color: on ? '#9A3412' : '#0F1115',
    border: on ? '1.5px solid #9A3412' : '1px solid #E5E7EB',
    fontSize: 12, fontWeight: 700,
    cursor:'pointer', fontFamily:'inherit',
  };
}
const miniLink = {
  background:'none', border:'none',
  padding:'2px 4px', color:'#6B7280',
  fontSize: 11.5, fontWeight: 700,
  cursor:'pointer', fontFamily:'inherit',
  display:'inline-flex', alignItems:'center', gap: 4,
};
const chipQuick = {
  flex: 1, padding:'5px 8px', borderRadius: 6,
  background:'#F8F9FB', color:'#0F1115',
  border:'1px solid #E5E7EB', cursor:'pointer',
  fontSize: 11, fontWeight: 700, fontFamily:'inherit',
};
const inputV2 = {
  padding:'8px 10px', border:'1px solid #E5E7EB',
  borderRadius: 6, fontSize: 13,
  fontFamily:'inherit', outline:'none',
  width:'100%', background:'#fff',
  boxSizing:'border-box',
};

window.SalaV3SaldaModal = SalaV3SaldaModal;
