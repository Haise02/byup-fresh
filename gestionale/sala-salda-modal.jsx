// Sala — Modale Salda conto v2: layout 2 colonne, no wizard, pre-conto sempre raggiungibile

// ── Pagamento carta su Byup Staff ──────────────────────────────────────
// Due soli stati: in attesa, poi saldato. Chi sta in cassa deve decidere
// una cosa sola — se aspettare o no — e per quella "in attesa" basta.
// Raccontare anche che qualcuno l'ha aperto o che la carta è appoggiata
// non cambia niente di quello che può fare.
//
// Il pagamento NON è indirizzato a un dispositivo: chiunque abbia Byup Staff
// può prenderlo. Per questo la schermata non nomina mai un device o una
// persona — finché non è saldato, l'unica cosa vera è che sta aspettando.
//
// PAY_FINE è finto: il telefono non è ancora collegato, quindi il saldo
// arriva a tempo. In produzione lo dice il server (Stripe Terminal).
const PAY_FINE = 16000;

// Voce della coda di incasso. Stessa forma di CODA_INCASSO in
// staff/pos-data.jsx: è il contratto fra cassa e Byup Staff, e va scritto
// con quei nomi da entrambe le parti. `inviato` qui è un timestamp — la
// coda su Staff lo formatta in ora, ma deve restare una data per calcolare
// da quanto si aspetta.
//
// L'id porta il numero del tavolo perché si legga, ma non è il tavolo: un
// conto rimandato indietro e re-inviato è una voce nuova, e due voci dello
// stesso tavolo non devono mai collidere.
// Il pallino "in attesa" respira. Sta fuori dal componente perché lo usa
// anche il contatore in Sala, che vive quando la finestra di saldo è chiusa.
(function saldaInjectPayKeyframes() {
  if (typeof document === 'undefined' || document.getElementById('salda-pay-kf')) return;
  const el = document.createElement('style');
  el.id = 'salda-pay-kf';
  el.textContent = `
@keyframes saldaPayPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.28; } }
@media (prefers-reduced-motion: reduce) {
  [style*="saldaPayPulse"] { animation: none !important; }
}`;
  document.head.appendChild(el);
})();

function nuovaVoceCoda(tavolo, importo) {
  const t = Date.now();
  return {
    id: `c_${String(tavolo.id).padStart(2, '0')}_${t.toString(36)}`,
    tavolo: tavolo.id,
    importo,
    coperti: tavolo.coperti || 1,
    inviato: t,
  };
}

// Ambra = in sospeso. L'inchiostro è #B45309 e non PN.AMBER: su fondo
// chiaro il PN.AMBER sta a 2,86:1.
const PAY_INK = '#B45309';
const PAY_BG  = '#FEF3C7';

function SalaSaldaModal({ open, tavolo, onClose, onConfirm }) {
  const [groupBy, setGroupBy] = React.useState('flat'); // flat | grouped
  // Map<itemId, qty selezionata> — permette selezione parziale (1 di 3, 2 di 3, tutti)
  const [selectedItems, setSelectedItems] = React.useState(new Map());
  const [collapsedGroups, setCollapsedGroups] = React.useState(new Set());
  // Copia locale degli ordini editabile (prezzo, nome, delete, add) — non muta tavolo.ordini
  const [editedOrdini, setEditedOrdini] = React.useState([]);
  const [addQuery, setAddQuery] = React.useState('');
  const [addOpen, setAddOpen] = React.useState(false);

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
  // Com'è andato l'incasso, fotografato quando si preme: la schermata di
  // conferma vive dopo che il conto è chiuso e non può ricalcolarselo.
  const [esito, setEsito] = React.useState(null);
  const [preContoStampato, setPreContoStampato] = React.useState(null); // null | timestamp
  const [toast, setToast] = React.useState(null);

  // Conto messo in coda di incasso su Byup Staff. La voce vive sul TAVOLO,
  // non qui: chiudere la finestra non la ritira, e riaprendola si ritrova
  // allo stato in cui era. `payTick` serve solo a far ridisegnare.
  const [payTick, setPayTick] = React.useState(0);
  const inCoda = tavolo?.incasso || null;
  const payElapsed = inCoda ? Date.now() - inCoda.inviato : 0;
  const paying = !!inCoda;

  React.useEffect(() => {
    if (!inCoda) return;
    const id = setInterval(() => setPayTick(t => t + 1), 400);
    return () => clearInterval(id);
  }, [inCoda?.inviato]);

  // Chi chiude il pagamento è la Sala, non questa finestra: qui si guarda
  // solo se il conto è ancora in coda. Se la finestra tenesse un suo timer,
  // i due si farebbero la gara e il risultato dipenderebbe da chi arriva
  // prima — a volte la conferma, a volte un salto secco al conto.
  const eraInCoda = React.useRef(false);
  React.useEffect(() => {
    if (inCoda) { eraInCoda.current = true; return; }
    if (!eraInCoda.current) return;
    eraInCoda.current = false;
    // Uscito dalla coda: o l'ha incassato un telefono, o l'abbiamo ritirato
    // noi. Nel secondo caso si torna al conto, che è di nuovo modificabile.
    if (tavolo && tavolo.contoSaldato) { setDone(true); onConfirm && onConfirm(); }
  }, [inCoda]);

  React.useEffect(() => {
    if (open && tavolo) {
      const cloned = (tavolo.ordini || []).map(o => ({...o}));
      const gById = Object.fromEntries((tavolo.guests || []).map(g => [g.id, g]));
      const pagati = new Set((tavolo.pagamenti || []).map(p => String(p.chi || '').trim().toLowerCase()));
      const giaPagato = (o) => !!o.guestId && gById[o.guestId]
        && pagati.has(String(gById[o.guestId].name || '').trim().toLowerCase());
      setEditedOrdini(cloned);
      setSelectedItems(new Map(cloned.filter(o => !giaPagato(o)).map(o => [o.id, o.qty])));
      setGroupBy('flat');
      setCollapsedGroups(new Set());
      setAdjust(null);
      setPay({ contanti:'', carta:'' });
      // Riaprendo un conto con un pagamento ancora in volo si torna dov'era:
      // ripartire da "Contanti" nasconderebbe la transazione in corso e
      // l'unico modo per annullarla.
      setMethod(tavolo.incasso ? 'carta' : 'contanti');
      setInvoice(false);
      setInvoiceOpen(false);
      setAdjustOpen(false);
      setDone(false);
      setEsito(null);
      setPreContoStampato(null);
      setToast(null);
      setAddQuery('');
      setAddOpen(false);
    }
  }, [open, tavolo]);

  if (!open || !tavolo) return null;

  const allOrdini = editedOrdini;
  const guests = tavolo.guests || [];
  const guestById = Object.fromEntries(guests.map(g => [g.id, g]));

  // Chi ha già pagato la sua parte dall'app: i suoi piatti non si incassano
  // una seconda volta. Prima restavano in elenco selezionabili e il totale
  // chiedeva alla cassa soldi già arrivati — la riga «Già incassato» diceva la
  // stessa cosa in fondo alla colonna, da mettere in relazione a mente.
  const nomiPagati = new Set((tavolo.pagamenti || []).map(p => String(p.chi || '').trim().toLowerCase()));
  const guestPagato = (gid) => {
    const g = guestById[gid];
    return !!g && nomiPagati.has(String(g.name || '').trim().toLowerCase());
  };
  const isPagato = (o) => !!o.guestId && guestPagato(o.guestId);

  // Quello che la cassa può ancora incassare: i piatti già pagati non sono
  // «deselezionati», sono fuori dal conto — se contassero, il riepilogo
  // direbbe «4 di 6» a chi non ha toccato niente.
  const incassabili = allOrdini.filter(o => !isPagato(o));
  const selectedOrdini = allOrdini.filter(o => (selectedItems.get(o.id) || 0) > 0);
  const subtotale = selectedOrdini.reduce((s,o) => s + (selectedItems.get(o.id) || 0) * o.prezzo, 0);

  // Calcolo aggiustamento — una strategia per ciascun type; restituisce { total, delta, label }.
  // Lo sconto in euro è clampato al subtotale per non generare totali negativi.
  const ADJUST_STRATEGIES = {
    'sconto-eur': (sub, val) => {
      const delta = -Math.min(val || 0, sub);
      return { total: sub + delta, delta, label: `Sconto · −€${(-delta).toFixed(2)}` };
    },
    'sconto-pct': (sub, val) => {
      const delta = -(sub * (val || 0) / 100);
      return { total: sub + delta, delta, label: `Sconto ${val}% · −€${(-delta).toFixed(2)}` };
    },
    'arrotonda': (sub) => {
      const total = Math.floor(sub);
      const delta = total - sub;
      return { total, delta, label: `Arrotondato · ${delta < 0 ? '' : '+'}€${delta.toFixed(2)}` };
    },
    'custom': (sub, val) => {
      const total = val || 0;
      const delta = total - sub;
      return { total, delta, label: `Importo personalizzato · ${delta < 0 ? '−' : '+'}€${Math.abs(delta).toFixed(2)}` };
    },
  };
  const adjustResult = adjust ? ADJUST_STRATEGIES[adjust.type]?.(subtotale, adjust.val) : null;
  const naturalTotal = adjustResult?.total ?? subtotale;
  const adjustDelta = adjustResult?.delta ?? 0;
  const adjustLabel = adjustResult?.label ?? null;
  const total = Math.max(0, naturalTotal);

  // Contanti col campo vuoto = ESATTO: segue il totale senza che nessuno
  // scriva niente. Prima la CTA partiva spenta («Manca €65») finché non si
  // toccava un chip — un tocco obbligato per il caso più comune alla cassa.
  const contantiEsatto = method === 'contanti' && pay.contanti === '';
  const contanti = contantiEsatto ? total : parseFloat(pay.contanti) || 0;
  const carta = parseFloat(pay.carta) || 0;
  const paid = contanti + carta;
  const resto = paid - total;
  // Epsilon 0.01€ (1 centesimo) per tollerare rounding di float su somme parziali — es. 33.33 + 66.67.
  const canConfirm = paid >= total - 0.01 && total > 0;

  function toggleItem(id) {
    const o = allOrdini.find(x => x.id === id);
    if (!o || isPagato(o)) return;
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
  function selectAll() { setSelectedItems(new Map(allOrdini.filter(o => !isPagato(o)).map(o => [o.id, o.qty]))); }
  function selectNone() { setSelectedItems(new Map()); }
  function selectGroup(items) {
    setSelectedItems(s => {
      const ns = new Map(s);
      const allIn = items.every(o => (ns.get(o.id) || 0) >= o.qty);
      items.forEach(o => allIn ? ns.delete(o.id) : ns.set(o.id, o.qty));
      return ns;
    });
  }

  function updateItem(id, patch) {
    setEditedOrdini(arr => arr.map(o => o.id === id ? { ...o, ...patch } : o));
  }
  function deleteItem(id) {
    setEditedOrdini(arr => arr.filter(o => o.id !== id));
    setSelectedItems(s => { const ns = new Map(s); ns.delete(id); return ns; });
  }
  function addItemFromMenu(menuItem) {
    const newItem = {
      id: `new-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      nome: menuItem.nome,
      prezzo: menuItem.prezzo,
      qty: 1,
      stato: 'pronto',
      minutiInPreparazione: 0,
      minutiInCoda: 0,
      origin: 'cameriere',
      guestId: null,
      _added: true,
    };
    setEditedOrdini(arr => [...arr, newItem]);
    setSelectedItems(s => { const ns = new Map(s); ns.set(newItem.id, 1); return ns; });
    setAddQuery('');
    setAddOpen(false);
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

  // Il conto entra nella coda di incasso, visibile a tutti i Byup Staff
  // collegati. Scrivere la voce sul tavolo (e non nello stato della
  // finestra) è ciò che le permette di sopravvivere alla chiusura: la cassa
  // resta libera di lavorare altrove.
  function avviaPagamento() {
    tavolo.incasso = nuovaVoceCoda(tavolo, total);
    setPayTick(t => t + 1);
  }
  // Ritiro dalla coda — non è una cancellazione: il conto torna
  // modificabile qui in cassa. Su Byup Staff la voce sparisce; se qualcuno
  // la stava già guardando, se lo vede dire lì.
  function ritiraDallaCoda() {
    tavolo.incasso = null;
    setPayTick(t => t + 1);
    setToast({ type:'info', text:'Conto ritirato dalla coda' });
    setTimeout(() => setToast(null), 2500);
  }

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
      {/* Dialog, non takeover: a 920×660 fissi con tetto al 94% il pannello
          copriva ~3/4 dell'area contenuti a ogni risoluzione (la shell scala
          tutto con uno zoom guidato dall'altezza, quindi la proporzione non
          cambiava mai) e leggeva come una schermata piena — con in più un bel
          vuoto sotto la lista articoli quando il conto è corto.
          Altezza ora guidata dal contenuto e tetto all'88%: si accorcia sui
          conti brevi, cresce e scrolla su quelli lunghi, e lascia sempre
          respirare la pagina sotto.
          Attesa e conferma non hanno una lista da mostrare: sei righe
          centrate in una finestra da 880 leggevano come un errore di
          layout. Lì si stringe a 420 — la stessa misura della finestra di
          incasso in Vendita diretta. */}
      <div style={{
        position:'absolute', top:'50%', left:'50%',
        transform:'translate(-50%, -50%)',
        width: (paying || done) ? 420 : 1080,
        maxWidth:'93%', height:'auto', maxHeight:'92%',
        background:'#fff', borderRadius: 20,
        boxShadow:'0 24px 70px rgba(0,0,0,0.28)',
        zIndex: 61, display:'flex', flexDirection:'column', overflow:'hidden',
        transition:'width 220ms cubic-bezier(0.4, 0, 0.2, 1)',
      }}>
        {done ? (
          <SaldaDoneV2 tavolo={tavolo} esito={esito || {
            // Incassato da un telefono mentre la finestra era in attesa: qui
            // il resto non esiste, la carta ha pagato l'importo esatto.
            total, contanti, carta, resto: 0, metodo: 'carta', invoice, invoiceData,
          }} onClose={onClose}/>
        ) : paying ? (
          <SaldaAttesaPagamento
            tavolo={tavolo}
            total={inCoda.importo}
            elapsed={payElapsed}
            onRitira={ritiraDallaCoda}
            onClose={onClose}/>
        ) : (
          <>
            {/* Header */}
            <div style={{
              padding:'20px 24px 16px',
              display:'flex', alignItems:'flex-start', gap: 12, flexShrink: 0,
            }}>
              <div style={{flex:1, minWidth: 0}}>
                <div style={{fontSize: 14, color:'#6B7280', fontWeight:800, letterSpacing:0.8, textTransform:'uppercase'}}>
                  Salda conto
                </div>
                <div style={{fontSize: 27, fontWeight: 800, color:'#0F1115', marginTop: 2, letterSpacing:-0.6, display:'flex', alignItems:'baseline', gap: 10, flexWrap:'wrap'}}>
                  <span>Tavolo {tavolo.id}{tavolo.party ? ` · ${tavolo.party}` : ''}</span>
                  <span style={{fontSize:16, fontWeight:600, color:'#9CA3AF', letterSpacing: 0}}>
                    {tavolo.coperti || 1} coperti
                  </span>
                </div>
              </div>
              <button onClick={() => stampaPreConto('tutto')} style={btnGhost}>
                <IconPrinter/>
                {preContoStampato ? 'Ristampa pre-conto' : 'Stampa pre-conto'}
              </button>
              <button onClick={onClose} title="Chiudi" style={saldaIconBtn}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
              </button>
            </div>

            {/* Body 2 colonne */}
            <div style={{flex:1, display:'flex', minHeight: 0}}>
              {/* Sinistra: articoli */}
              <div style={{
                flex: '1.5 1 0', display:'flex', flexDirection:'column',
                minWidth: 0,
              }}>
                {/* Toolbar selezione */}
                <div style={{
                  padding:'0 24px 12px',
                  display:'flex', alignItems:'center', gap: 8, flexShrink: 0,
                }}>
                  <div style={{display:'inline-flex', borderRadius: 12, overflow:'hidden', background:'#fff', border:'1px solid #E5E7EB', padding: 3, gap: 3}}>
                    <button onClick={()=>setGroupBy('flat')} style={segBtn(groupBy === 'flat')}>
                      Tutti articoli
                    </button>
                    <button onClick={()=>setGroupBy('grouped')} style={segBtn(groupBy === 'grouped')}>
                      Per ordinante
                    </button>
                  </div>
                  <span style={{flex:1}}/>
                  {(() => {
                    const allSel = incassabili.length > 0 && incassabili.every(o => (selectedItems.get(o.id) || 0) >= o.qty);
                    const someSel = !allSel && selectedItems.size > 0;
                    return (
                      <button
                        onClick={allSel ? selectNone : selectAll}
                        style={{...miniLink, gap: 6, color: '#374151'}}
                      >
                        <span style={{
                          width: 20, height: 20, borderRadius: 6, flexShrink: 0,
                          border: `1.5px solid ${allSel || someSel ? SALDA_BRAND : '#D1D5DB'}`,
                          background: allSel ? SALDA_BRAND : '#fff',
                          display: 'grid', placeItems: 'center', position: 'relative',
                        }}>
                          {allSel && (
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                          )}
                          {someSel && (
                            <span style={{width: 9, height: 2.5, background: SALDA_BRAND, borderRadius: 2, display:'block'}}/>
                          )}
                        </span>
                        Seleziona tutti
                      </button>
                    );
                  })()}
                </div>

                {/* Add-article search bar */}
                <AddArticleBar
                  query={addQuery} setQuery={setAddQuery}
                  open={addOpen} setOpen={setAddOpen}
                  onPick={addItemFromMenu}/>

                {/* Lista articoli */}
                <div className="pn-scroll" style={{flex:1, overflow:'auto', padding:'10px 18px 14px'}}>
                  {groupBy === 'flat' ? (
                    <FlatList ordini={allOrdini} selectedItems={selectedItems} toggleItem={toggleItem} setItemQty={setItemQty} guestById={guestById}
                      isPagato={isPagato}
                      onUpdate={updateItem} onDelete={deleteItem}/>
                  ) : (
                    <GroupedList groups={groups}
                      selectedItems={selectedItems}
                      toggleItem={toggleItem}
                      setItemQty={setItemQty}
                      collapsedGroups={collapsedGroups}
                      toggleGroup={toggleGroup}
                      selectGroup={selectGroup}
                      isPagato={isPagato}
                      onUpdate={updateItem} onDelete={deleteItem}/>
                  )}
                </div>
              </div>

              {/* Destra: riepilogo + pagamento */}
              <div style={{
                flex: '1 1 0', display:'flex', flexDirection:'column',
                background:'#fff', minWidth: 380, maxWidth: 460,
                borderLeft:'1px solid #EDEFF2',
              }}>
                <div className="pn-scroll" style={{flex:1, overflow:'auto', padding:'0 0 18px'}}>

                  {/* RIEPILOGO TOTALE — un blocco in tinta brand: è il numero
                      per cui questa finestra esiste, e prima era una riga di
                      testo su fondo grigio come tutto il resto. */}
                  <div style={{background: SALDA_BRAND_SOFT, padding:'18px 22px 14px'}}>
                    {/* Il dettaglio (subtotale, sconto) compare SOLO quando
                        racconta qualcosa che il Totale da solo non dice:
                        selezione parziale o aggiustamento. Nel caso normale
                        il primo numero che leggi è l'unico. */}
                    {(adjust || selectedOrdini.length < incassabili.length) && (
                    <div style={{display:'flex', flexDirection:'column', gap: 5, marginBottom: 12}}>
                      <ReceiptRow
                        label={`Subtotale${selectedOrdini.length < incassabili.length ? ` · ${selectedOrdini.length} di ${incassabili.length}` : ''}`}
                        value={`€${subtotale.toFixed(2)}`}/>
                      {adjust && (
                        <ReceiptRow
                          label={adjustLabel.split(' · ')[0]}
                          value={(adjustDelta >= 0 ? '+' : '−') + '€' + Math.abs(adjustDelta).toFixed(2)}
                          tone={adjustDelta < 0 ? 'success' : 'danger'}
                          onRemove={() => setAdjust(null)}/>
                      )}
                    </div>
                    )}

                    {/* HERO TOTAL */}
                    <div style={{
                      paddingTop: (adjust || selectedOrdini.length < incassabili.length) ? 14 : 0,
                      borderTop: (adjust || selectedOrdini.length < incassabili.length) ? '1px solid rgba(15,17,21,0.08)' : 'none',
                      display:'flex', alignItems:'baseline', gap: 8,
                    }}>
                      <span style={{
                        fontSize: 15, fontWeight: 800, color:'#6B7280',
                        letterSpacing: 0.6, textTransform:'uppercase', flex: 1,
                      }}>Totale</span>
                      <span style={{
                        fontSize: 42, fontWeight: 800, color:'#0F1115',
                        letterSpacing:-1.4, lineHeight: 1,
                        fontVariantNumeric:'tabular-nums',
                      }}>€{total.toFixed(2)}</span>
                    </div>

                    {/* «Aggiusta totale» non diceva cosa succede al conto:
                        quello che si fa da qui è uno sconto o una correzione
                        dell'importo, e il pulsante lo chiama col suo nome. */}
                    <div style={{textAlign:'right', marginTop: 6}}>
                      <button onClick={() => setAdjustOpen(o => !o)} style={{
                        background:'transparent', border:'none', padding: 0,
                        fontFamily:'inherit', fontSize: 15.5, fontWeight: 700,
                        color: SALDA_BRAND, cursor:'pointer',
                        display:'inline-flex', alignItems:'center', gap: 4,
                        textDecoration:'underline', textUnderlineOffset: 3,
                      }}>
                        {adjust ? 'Modifica la correzione' : 'Sconto o correzione'}
                        <span style={{
                          display:'inline-block',
                          transform: adjustOpen ? 'rotate(90deg)' : 'none',
                          transition:'transform 0.15s',
                          fontSize: 15,
                        }}>›</span>
                      </button>
                    </div>

                    {adjustOpen && (
                      <AdjustPanel
                        subtotale={subtotale}
                        adjust={adjust}
                        setAdjust={setAdjust}/>
                    )}
                  </div>

                  {/* Quello che è già arrivato su questo conto. I piatti che
                      queste quote coprono sono spenti nell'elenco a sinistra,
                      quindi il totale qui sopra è già al netto: non c'è più
                      niente da mettere in relazione a mente. */}
                  <PagamentiConto pagamenti={tavolo.pagamenti} />

                  <div style={{padding:'18px 22px 0'}}>

                  {/* PAGAMENTO — la sola domanda a cui l'operatore deve
                      rispondere in questa colonna. Era un'etichetta maiuscola
                      come tutte le altre e si perdeva in mezzo a loro: una
                      domanda si scrive come una domanda. */}
                  <div style={{marginBottom: 18}}>
                    <div style={{
                      fontSize: 17.5, fontWeight: 800, color:'#0F1115',
                      letterSpacing:-0.2, marginBottom: 10,
                    }}>Come paga il cliente?</div>

                    {/* Method tabs */}
                    <div style={{
                      display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap: 6,
                      marginBottom: 12,
                    }}>
                      <MethodTab active={method==='contanti'} onClick={()=>chooseMethod('contanti')}
                        icon={<IconCash/>} label="Contanti"/>
                      <MethodTab active={method==='carta'} onClick={()=>chooseMethod('carta')}
                        icon={<IconCard/>} label="Carta"/>
                      <MethodTab active={method==='misto'} onClick={()=>chooseMethod('misto')}
                        icon={<IconSplit/>} label="Misto"/>
                    </div>

                    {/* Cosa succede scegliendo questo metodo. Con la carta il
                        pulsante non incassa — manda il conto sul telefono — e
                        finora non lo diceva nessuno: lo si scopriva premendo,
                        con il cliente davanti. */}
                    {method !== 'contanti' && (
                      <div style={{
                        display:'flex', gap: 8, marginBottom: 12,
                        padding:'10px 12px', borderRadius: 10,
                        background: method === 'carta' ? PAY_BG : '#F3F4F6',
                        color: method === 'carta' ? PAY_INK : '#4B5563',
                        fontSize: 15.5, lineHeight: 1.4,
                      }}>
                        <span style={{flexShrink: 0, marginTop: 1}}>
                          {method === 'carta' ? <IconCard/> : <IconSplit/>}
                        </span>
                        <span>
                          {method === 'carta'
                            ? <>La carta si passa da <b>Byup Staff</b>: il conto entra in coda sul telefono e si chiude appena il pagamento va a buon fine.</>
                            : <>Scrivi quanto ti dà in contanti e quanto sulla carta: la somma deve arrivare al totale.</>}
                        </span>
                      </div>
                    )}

                    {method === 'contanti' && (
                      <CashTendered
                        total={total}
                        value={pay.contanti}
                        onChange={setTendered}
                        chips={smartCashChips(total)}/>
                    )}

                    {/* Carta: nessun campo. Non c'è niente da inserire —
                        l'importo è già scritto qui sopra e sul pulsante. */}

                    {method === 'misto' && (
                      <MixedPay
                        total={total} pay={pay} contanti={contanti} carta={carta} paid={paid}
                        onCash={setMistoCash} onCard={setMistoCard}/>
                    )}
                  </div>

                  <div style={{height: 1, background:'#EDEFF2', margin:'0 -22px 16px'}}/>

                  {/* FATTURA */}
                  <div>
                    <div style={{
                      display:'flex', alignItems:'center', gap: 10,
                      padding:'4px 0',
                    }}>
                      <div style={{flex:1}}>
                        <div style={{fontSize: 17, fontWeight: 700, color:'#0F1115'}}>Emetti fattura</div>
                        <div style={{fontSize: 15, color:'#9CA3AF', marginTop: 1}}>
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
                </div>

                {/* Footer di destra: CTA principale */}
                <div style={{
                  padding:'16px 22px 20px', borderTop:'1px solid #EDEFF2',
                  background:'#fff', flexShrink: 0,
                  display:'flex', flexDirection:'column', gap: 8,
                }}>
                  {/* Il pulsante dice il gesto che compie, non «conferma»:
                      con i contanti incassa qui, con la carta manda il conto
                      su Byup Staff e la finestra passa in attesa. Sono due
                      cose diverse e ora si leggono diverse. */}
                  {(() => {
                    const inviaSuStaff = method === 'carta';
                    const attivo = inviaSuStaff ? total > 0 : canConfirm;
                    const manca = total - paid;
                    return (
                      <button onClick={() => {
                          if (!attivo) return;
                          if (inviaSuStaff) avviaPagamento();
                          else {
                            // Fotografia del momento in cui si incassa: la
                            // schermata di conferma deve poter dire quanto
                            // resto dare anche dopo che il conto è chiuso.
                            setEsito({
                              total, contanti, carta, resto: Math.max(0, resto),
                              metodo: method, invoice, invoiceData,
                            });
                            setDone(true); onConfirm && onConfirm();
                          }
                        }}
                        disabled={!attivo}
                        style={{
                          width:'100%', padding:'18px 16px', borderRadius: 14,
                          background: attivo ? SALDA_BRAND : '#EDEFF2',
                          color: attivo ? '#fff' : '#9CA3AF',
                          border:'none',
                          boxShadow: attivo ? '0 10px 22px -10px rgba(255,59,65,0.65)' : 'none',
                          // "Invia a Byup Staff · €65.00" è più lunga di
                          // "Incassa": mezzo punto in meno la tiene su una
                          // riga sola invece di spezzarla in due.
                          fontSize: inviaSuStaff ? 18 : 19, fontWeight: 800,
                          cursor: attivo ? 'pointer' : 'not-allowed',
                          fontFamily:'inherit',
                          letterSpacing:-0.2, whiteSpace:'nowrap',
                          display:'flex', alignItems:'center', justifyContent:'center', gap: 8,
                        }}>
                        {!attivo
                          ? (total === 0 ? 'Scegli cosa saldare' : `Mancano €${manca.toFixed(2)}`)
                          : inviaSuStaff
                            ? <>Invia a Byup Staff <span style={{opacity:0.6}}>·</span> €{total.toFixed(2)}</>
                            : <>Incassa <span style={{opacity:0.6}}>·</span> €{total.toFixed(2)}</>}
                      </button>
                    );
                  })()}

                  {/* Il resto NON si ripete qui: è già scritto grande accanto
                      alla cifra ricevuta, che è dove lo si legge mentre si
                      conta. Due volte nella stessa colonna era una delle due
                      di troppo. Torna dopo, sulla schermata di conferma, che
                      è l'unico posto dove serve di nuovo. */}
                  {preContoStampato && (
                    <div style={{
                      fontSize: 14.5, color:'#9CA3AF', textAlign:'center',
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
                fontSize: 16.5, fontWeight: 700,
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
function FlatList({ ordini, selectedItems, toggleItem, setItemQty, guestById, isPagato, onUpdate, onDelete }) {
  if (ordini.length === 0) return <EmptyOrdini/>;
  return (
    <div style={{display:'flex', flexDirection:'column', gap: 8}}>
      {ordini.map(o => (
        <ItemRowV2 key={o.id} o={o}
          selectedQty={selectedItems.get(o.id) || 0}
          onToggle={()=>toggleItem(o.id)}
          onSetQty={(q)=>setItemQty(o.id, q)}
          guest={o.guestId ? guestById[o.guestId] : null}
          pagato={!!isPagato && isPagato(o)}
          onUpdate={onUpdate} onDelete={onDelete}/>
      ))}
    </div>
  );
}

// ────────── LISTA ARTICOLI GROUPED ──────────
function GroupedList({ groups, selectedItems, toggleItem, setItemQty, collapsedGroups, toggleGroup, selectGroup, isPagato, onUpdate, onDelete }) {
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
                  <div style={{fontSize: 17, fontWeight: 700, color:'#0F1115', display:'flex', alignItems:'center', gap: 6}}>
                    <span style={{whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{g.title}</span>
                    {g.type === 'guest' && g.meta?.source === 'byup' && (
                      <span style={{
                        fontSize: 13, fontWeight: 800, color:'#E04347',
                        background:'#FFE0DD', padding:'1px 5px', borderRadius: 3,
                        letterSpacing: 0.4, textTransform:'uppercase', flexShrink: 0,
                      }}>byup</span>
                    )}
                  </div>
                  <div style={{fontSize: 14.5, color:'#9CA3AF', fontWeight: 600}}>
                    {g.sub} · {g.items.length} articol{g.items.length === 1 ? 'o' : 'i'}
                  </div>
                </div>
                <span style={{fontSize: 17, fontWeight:800, color:'#0F1115', fontVariantNumeric:'tabular-nums'}}>€{groupTotal.toFixed(2)}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{
                  transform: collapsed ? 'rotate(-90deg)' : 'rotate(0)',
                  transition:'transform 0.15s',
                }}>
                  <path d="M6 9 L12 15 L18 9"/>
                </svg>
              </button>
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
                    hideBayupBadge={g.type === 'guest' && g.meta?.source === 'byup'}
                    pagato={!!isPagato && isPagato(o)}
                    onUpdate={onUpdate} onDelete={onDelete}/>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function ItemRowV2({ o, selectedQty, onToggle, onSetQty, guest, hideBayupBadge, pagato, onUpdate, onDelete }) {
  const allSel = selectedQty >= o.qty;
  const noneSel = selectedQty === 0;
  const partialSel = !allSel && !noneSel;
  const showStepper = o.qty > 1;
  const stop = (e) => e.stopPropagation();
  const [editingName, setEditingName] = React.useState(false);
  const [editingPrice, setEditingPrice] = React.useState(false);
  const [nameDraft, setNameDraft] = React.useState(o.nome);
  const [priceDraft, setPriceDraft] = React.useState(o.prezzo);
  const [hover, setHover] = React.useState(false);
  const clickTimer = React.useRef(null);

  React.useEffect(() => () => { if (clickTimer.current) clearTimeout(clickTimer.current); }, []);
  React.useEffect(() => { setNameDraft(o.nome); }, [o.nome]);
  React.useEffect(() => { setPriceDraft(o.prezzo); }, [o.prezzo]);

  const commitName = () => {
    const v = nameDraft.trim();
    if (v && v !== o.nome) onUpdate && onUpdate(o.id, { nome: v });
    setEditingName(false);
  };
  const commitPrice = () => {
    const v = parseFloat(priceDraft);
    if (!isNaN(v) && v >= 0 && v !== o.prezzo) onUpdate && onUpdate(o.id, { prezzo: v });
    setEditingPrice(false);
  };

  // Si sceglie cliccando la card, tutta: la spunta dice se è dentro, non è un
  // bersaglio a parte da centrare col mouse mentre si ha il cliente davanti.
  return (
    <div
      onClick={(editingName || editingPrice || pagato) ? undefined : onToggle}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      title={pagato ? 'Già pagato dall\u2019app: non si incassa di nuovo' : undefined}
      style={{
        display:'flex', alignItems:'center', gap: 12,
        padding:'12px 14px',
        cursor: (editingName || editingPrice) ? 'default' : (pagato ? 'not-allowed' : 'pointer'),
        background: pagato ? '#F7F8FA' : (allSel || partialSel ? SALDA_BRAND_SOFT : (hover ? '#FAFBFC' : '#fff')),
        border: `1px solid ${pagato ? '#EDEFF2' : (allSel || partialSel ? '#FFD4D4' : '#EDEFF2')}`,
        borderRadius: 12, transition:'background 0.12s, border-color 0.12s',
        opacity: pagato ? 0.72 : 1,
      }}>
      {/* La spunta: stato, non comando — il click lo prende la card */}
      <span aria-hidden="true" style={{
        width: 22, height: 22, borderRadius: 6, flexShrink: 0, pointerEvents:'none',
        display:'grid', placeItems:'center',
        background: pagato ? '#D6D9DE' : (noneSel ? '#fff' : SALDA_BRAND),
        border: `1.5px solid ${pagato ? '#D6D9DE' : (noneSel ? '#D1D5DB' : SALDA_BRAND)}`,
        transition:'background 0.12s, border-color 0.12s',
      }}>
        {(allSel || pagato) && (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        )}
        {partialSel && <span style={{width: 10, height: 2.5, background:'#fff', borderRadius: 2}}/>}
      </span>

      {showStepper && !noneSel && !pagato ? (
        <div onClick={stop} style={{
          display:'inline-flex', alignItems:'center',
          background:'#fff', border:'1px solid #E5E7EB', borderRadius: 9,
          overflow:'hidden', flexShrink: 0,
        }}>
          <button onClick={() => onSetQty(selectedQty - 1)} style={qtyBtn} title="Togli uno">−</button>
          <span style={{
            fontSize: 16, fontWeight: 800, color:'#0F1115',
            minWidth: 30, textAlign:'center', padding:'0 2px',
            whiteSpace:'nowrap', fontVariantNumeric:'tabular-nums',
          }}>{selectedQty}</span>
          <button onClick={() => onSetQty(selectedQty + 1)} disabled={selectedQty >= o.qty} style={{...qtyBtn, opacity: selectedQty >= o.qty ? 0.3 : 1}} title="Aggiungi uno">+</button>
        </div>
      ) : (
        <span style={{
          fontSize: 16, fontWeight: 800, color: pagato ? '#9CA3AF' : '#0F1115',
          background:'#fff', border:'1px solid #E5E7EB', borderRadius: 9,
          padding:'6px 0', minWidth: 40, textAlign:'center',
          fontVariantNumeric:'tabular-nums', flexShrink: 0,
        }}>{o.qty}</span>
      )}

      {/* NOME — display o editing inline */}
      <span style={{flex:1, minWidth: 0, display:'inline-flex', alignItems:'center', gap: 4}}>
        {editingName ? (
          <input
            autoFocus
            value={nameDraft}
            onChange={e => setNameDraft(e.target.value)}
            onBlur={commitName}
            onKeyDown={e => { if (e.key==='Enter') commitName(); if (e.key==='Escape') { setNameDraft(o.nome); setEditingName(false); } }}
            onClick={stop}
            style={{
              flex:1, minWidth: 0, padding:'3px 6px',
              border:'1px solid #0F1115', borderRadius: 4,
              fontSize: 17, color:'#0F1115', outline:'none',
              fontFamily:'inherit', background:'#fff',
            }}
          />
        ) : (
          <span
            onClick={(e) => {
              e.stopPropagation();
              if (clickTimer.current) clearTimeout(clickTimer.current);
              clickTimer.current = setTimeout(() => { onToggle(); clickTimer.current = null; }, 280);
            }}
            onDoubleClick={(e) => {
              e.stopPropagation();
              if (clickTimer.current) { clearTimeout(clickTimer.current); clickTimer.current = null; }
              setEditingName(true);
            }}
            title="Doppio click per modificare il nome"
            style={{
              fontSize: 17, color:'#0F1115', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
              cursor:'default', borderRadius: 3, padding:'1px 3px', marginLeft: -3,
            }}
          >
            {o.nome}{o._added && <span style={{marginLeft: 6, fontSize: 13, color:'#16A34A', fontWeight: 800, letterSpacing: 0.4}}>NUOVO</span>}
          </span>
        )}
      </span>

      {/* Di chi è il piatto, e se quella parte è già stata pagata: una
          pastiglia sola invece del nome in corsivo più il marchio staccato. */}
      {guest && (
        <span style={{
          display:'inline-flex', alignItems:'center', gap: 6, flexShrink: 0,
          padding:'5px 10px', borderRadius: 999,
          background: pagato ? '#EEF0F3' : (o.origin === 'byup' && !hideBayupBadge ? '#FFE9E9' : '#F4F5F7'),
          fontSize: 14, fontWeight: 600,
          color: pagato ? '#9CA3AF' : '#6B7280',
        }}>
          {guest.name.split(' ')[0]}
          <span style={{color:'#C7CBD1'}}>·</span>
          {pagato ? (
            <span style={{fontWeight: 700}}>Pagato</span>
          ) : (o.origin === 'byup' && !hideBayupBadge) ? (
            <span style={{fontWeight: 800, color: SALDA_BRAND, letterSpacing: 0.3, textTransform:'uppercase', fontSize: 12.5}}>byup</span>
          ) : (
            <span style={{fontWeight: 600}}>{o.origin === 'guest' ? 'Webapp' : 'Cameriere'}</span>
          )}
        </span>
      )}
      {!guest && o.origin === 'byup' && o.guestId && !hideBayupBadge && (
        <span style={{
          fontSize: 12.5, fontWeight: 800, color: SALDA_BRAND,
          background:'#FFE9E9', padding:'3px 8px', borderRadius: 999,
          letterSpacing: 0.3, textTransform:'uppercase', flexShrink: 0,
        }}>byup</span>
      )}

      {/* PREZZO — click to edit */}
      {editingPrice ? (
        <input
          autoFocus type="number" step="0.5" min="0"
          value={priceDraft}
          onChange={e => setPriceDraft(e.target.value)}
          onBlur={commitPrice}
          onKeyDown={e => { if (e.key==='Enter') commitPrice(); if (e.key==='Escape') { setPriceDraft(o.prezzo); setEditingPrice(false); } }}
          onClick={stop}
          style={{
            width: 72, padding:'3px 6px',
            border:'1px solid #0F1115', borderRadius: 4,
            fontSize: 17, color:'#0F1115', outline:'none',
            fontFamily:'inherit', background:'#fff',
            textAlign:'right', fontVariantNumeric:'tabular-nums', fontWeight: 700,
          }}
        />
      ) : (
        <button
          onClick={(e) => { e.stopPropagation(); setEditingPrice(true); }}
          title="Modifica prezzo unitario"
          style={{
            fontSize: 17, fontWeight: 700, color: pagato ? '#9CA3AF' : '#0F1115',
            minWidth: 66, textAlign:'right', fontVariantNumeric:'tabular-nums',
            background:'transparent', border:'none', cursor:'pointer',
            padding:'2px 4px', borderRadius: 4, fontFamily:'inherit',
            transition:'background 120ms',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#F1F2F5'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
        >
          €{((noneSel ? o.qty : selectedQty) * o.prezzo).toFixed(2)}
        </button>
      )}

      {/* DELETE — non su un piatto già pagato: quella riga è la prova di un
          incasso, e toglierla farebbe sparire i soldi dal conto. */}
      <button
        disabled={pagato}
        onClick={(e) => { e.stopPropagation(); if (!pagato && onDelete) onDelete(o.id); }}
        title="Elimina articolo"
        style={{
          width: 22, height: 22, padding: 0, borderRadius: 4,
          background:'transparent', border:'none', cursor:'pointer',
          color: (hover && !pagato) ? '#9CA3AF' : 'transparent',
          display:'inline-flex', alignItems:'center', justifyContent:'center',
          fontFamily:'inherit', transition:'color 120ms, background 120ms',
          flexShrink: 0,
        }}
        onMouseEnter={e => { if (pagato) return; e.currentTarget.style.color = '#DC2626'; e.currentTarget.style.background = '#FEE2E2'; }}
        onMouseLeave={e => { e.currentTarget.style.color = (hover && !pagato) ? '#9CA3AF' : 'transparent'; e.currentTarget.style.background = 'transparent'; }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 6h18 M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2 M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6 M10 11v6 M14 11v6"/>
        </svg>
      </button>
    </div>
  );
}

const qtyBtn = {
  width: 22, height: 22, padding: 0, border: 'none',
  background: 'transparent', color: '#0F1115',
  fontSize: 18, fontWeight: 800, cursor:'pointer',
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
      fontSize: 14.5, fontWeight: 800,
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
      fontSize: 17,
    }}>Nessun articolo ordinato</div>
  );
}

// ────────── RIGHT COLUMN HELPERS ──────────
function ReceiptRow({ label, value, tone, onRemove }) {
  const color = tone === 'success' ? '#16A34A' : tone === 'danger' ? '#DC2626' : '#6B7280';
  return (
    <div style={{display:'flex', alignItems:'center', gap: 8, fontSize: 16.5}}>
      <span style={{color, flex: 1}}>{label}</span>
      {onRemove && (
        <button onClick={onRemove} style={{
          background:'transparent', border:'none', padding: 0,
          fontFamily:'inherit', fontSize: 15, color:'#9CA3AF',
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
      display:'flex', flexDirection:'column', alignItems:'center', gap: 7,
      padding:'14px 6px', borderRadius: 12,
      background: active ? SALDA_BRAND_SOFT : '#fff',
      color: active ? SALDA_BRAND : '#0F1115',
      border: `1.5px solid ${active ? SALDA_BRAND : '#E5E7EB'}`,
      cursor:'pointer', fontFamily:'inherit',
      fontSize: 16, fontWeight: 700,
      transition:'background 0.15s, border-color 0.15s, color 0.15s',
    }}>
      <span style={{opacity: active ? 1 : 0.65}}>{icon}</span>
      {label}
    </button>
  );
}

// Contante ricevuto — stesso disegno dell'INCASSA di Vendita diretta: una
// fila sola (Esatto, i tagli, la casella «Altro»), campo vuoto = Esatto, e
// il resto compare SOLO quando esiste. Prima c'era un campo grande che
// duplicava il totale e una striscia che diceva «Pagamento esatto» — cioè
// il caso normale — con una cifra in più da ignorare.
function CashTendered({ total, value, onChange, chips }) {
  const esatto = value === '';
  const tendered = esatto ? total : parseFloat(value) || 0;
  const enough = tendered >= total - 0.01 && tendered > 0;
  const resto = tendered - total;
  const custom = !esatto && !chips.some(c => parseFloat(c.val) === tendered);
  return (
    <div>
      <div style={{
        fontSize: 15, fontWeight: 700, color:'#6B7280',
        marginBottom: 6,
      }}>Contante ricevuto</div>

      <div style={{display:'grid', gridTemplateColumns:`repeat(${chips.length + 1}, 1fr)`, gap: 6}}>
        {chips.map((c, i) => {
          // Il primo chip è «Esatto»: torna a SEGUIRE il totale (campo
          // vuoto), così resta giusto anche se il totale cambia dopo.
          const sel = i === 0 ? esatto : (!esatto && parseFloat(c.val) === tendered);
          return (
            <button key={c.label} onClick={() => onChange(i === 0 ? '' : c.val)} style={{
              padding:'11px 4px', borderRadius: 10,
              background: sel ? SALDA_BRAND : '#fff',
              color: sel ? '#fff' : '#0F1115',
              border: `1px solid ${sel ? SALDA_BRAND : '#E5E7EB'}`,
              fontSize: 16, fontWeight: 700, cursor:'pointer',
              fontFamily:'inherit', whiteSpace:'nowrap',
              transition:'background 0.14s, border-color 0.14s, color 0.14s',
            }}>{c.label}</button>
          );
        })}
        {/* La cifra libera è l'ultimo posto della fila, non un campo a
            parte: vuota finché non serve. */}
        <div style={{
          display:'flex', alignItems:'center', justifyContent:'center', gap: 3,
          padding:'11px 4px', borderRadius: 10,
          background: custom ? SALDA_BRAND : '#fff',
          border: `1px solid ${custom ? SALDA_BRAND : '#E5E7EB'}`,
          cursor:'text',
        }}>
          {custom && <span style={{fontSize: 16, fontWeight: 700, color:'#fff'}}>€</span>}
          <input
            value={esatto ? '' : value}
            onChange={e => onChange(e.target.value.replace(/[^0-9.,]/g, '').replace(',', '.'))}
            inputMode="decimal"
            placeholder="Altro"
            aria-label="Contante ricevuto"
            style={{
              width:'100%', minWidth: 0, border:'none', outline:'none',
              background:'transparent', fontFamily:'inherit', textAlign:'center',
              fontSize: 16, fontWeight: 700,
              color: custom ? '#fff' : '#0F1115',
              padding: 0, fontVariantNumeric:'tabular-nums',
            }}/>
        </div>
      </div>

      {!esatto && (resto > 0.01 || !enough) && tendered > 0 && (
        <div style={{
          marginTop: 10, padding:'10px 14px', borderRadius: 10,
          background: enough ? '#DCFCE7' : '#FEF3C7',
          color: enough ? '#166534' : '#92400E',
          display:'flex', justifyContent:'space-between', alignItems:'center',
        }}>
          <span style={{fontSize: 16, fontWeight: 700}}>
            {enough ? 'Resto da dare' : 'Manca ancora'}
          </span>
          <span style={{fontSize: 22, fontWeight: 800, fontVariantNumeric:'tabular-nums'}}>
            €{Math.abs(enough ? resto : total - tendered).toFixed(2)}
          </span>
        </div>
      )}
    </div>
  );
}

// Attesa del pagamento su Byup Staff — sostituisce tutto il contenuto
// della finestra, che intanto si stringe. È il modo più semplice di dire
// "adesso non si tocca niente": invece di spegnere lista, metodi e
// pulsante uno per uno, non c'è proprio nient'altro sullo schermo.
//
// Due uscite, che fanno cose opposte e vanno tenute distinte: "Ritira"
// toglie il conto dalla coda e lo riporta modificabile qui, "Chiudi" lo
// lascia in coda e libera la cassa. Con il solo Ritira, chi vuole solo
// andarsene lo premerebbe per sbaglio.
//
// "Ritira" e non "Annulla" perché non è una cancellazione: il conto torna
// indietro, si corregge e si rimanda. È la stessa parola del pannello in
// Sala, ed è lo stesso gesto.
//
// Resta premibile fino alla fine. Se arriva tardi — carta già passata —
// non lo diciamo con un terzo stato: perde la corsa e la finestra passa a
// saldato, che è quello che è successo davvero.
function SaldaAttesaPagamento({ tavolo, total, elapsed, onRitira, onClose }) {
  const secondi = Math.floor((elapsed || 0) / 1000);
  const mmss = `${Math.floor(secondi / 60)}:${String(secondi % 60).padStart(2, '0')}`;

  return (
    <div style={{
      flex:1, display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center', padding: 30,
    }}>
      <div style={{
        width: 72, height: 72, borderRadius:'50%',
        background: PAY_BG, color: PAY_INK,
        marginBottom: 16, display:'grid', placeItems:'center',
      }}>
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10 H22"/>
        </svg>
      </div>

      {/* Il pallino pulsa per dire "e' ancora vivo", ma non e' mai l'unico
          segnale: la scritta dice la stessa cosa a parole. */}
      <div style={{
        fontSize: 25, fontWeight: 800, color: PAY_INK, marginBottom: 4,
        display:'flex', alignItems:'center', gap: 10, letterSpacing:-0.3,
      }}>
        <span aria-hidden="true" style={{
          width: 11, height: 11, borderRadius: 999, flexShrink: 0,
          background: PAY_INK, animation:'saldaPayPulse 1.6s ease-in-out infinite',
        }}/>
        In coda su Byup Staff
      </div>

      <div style={{fontSize: 34, fontWeight: 800, color:'#0F1115', marginBottom: 6, letterSpacing:-0.8, fontVariantNumeric:'tabular-nums'}}>
        €{total.toFixed(2)}
      </div>

      {/* Il contatore e' l'unica cosa che si muove: senza, una schermata
          ferma non distingue "sta aspettando" da "si e' piantata". */}
      <div style={{fontSize: 16.5, color:'#6B7280', marginBottom: 14, textAlign:'center'}}>
        Tavolo {tavolo.id} · in attesa da {mmss}
      </div>

      {/* Cosa deve succedere adesso, e per mano di chi: la cassa qui non
          incassa niente, la carta si passa dal telefono. Senza questa riga
          si resta a guardare un contatore aspettando qualcosa che nessuno
          ha ancora fatto. */}
      <div style={{
        padding:'11px 14px', borderRadius: 12, background: PAY_BG, color: PAY_INK,
        fontSize: 16, lineHeight: 1.45, textAlign:'center', marginBottom: 20,
      }}>
        Apri <b>Byup Staff</b> sul telefono e passa la carta.<br/>
        Il conto si chiude da solo appena il pagamento va a buon fine.
      </div>

      <div style={{display:'flex', gap: 8}}>
        <button onClick={onRitira} style={btnSecondaryV2}>Ritira il conto</button>
        <button onClick={onClose} style={btnPrimaryV2}>Chiudi</button>
      </div>

      {/* Le due uscite fanno cose opposte e finora si distinguevano solo dal
          verbo: qui si dice quale conseguenza ha ciascuna. */}
      <div style={{
        fontSize: 14.5, color:'#9CA3AF', marginTop: 10,
        textAlign:'center', lineHeight: 1.45, maxWidth: 320,
      }}>
        «Ritira» riporta il conto in cassa e lo rende di nuovo modificabile.
        «Chiudi» lo lascia in coda: il telefono può incassarlo lo stesso.
      </div>
    </div>
  );
}

// Canali già incassati su questo conto — stessi colori della sezione conti
// in Contabilità, così un pagamento con l'app si riconosce a colpo d'occhio
// in tutti e due i posti.
const PAG_META = {
  contanti: { label:'Contanti', ink:'#0F766E', bg:'#CCFBF1' },
  carta:    { label:'Carta',    ink:'#1D4ED8', bg:'#DBEAFE' },
  byup:     { label:'Byup app', ink:'#7C3AED', bg:'#EDE9FE' },
};

function PagamentiConto({ pagamenti }) {
  // Niente pagamenti, niente blocco: uno stato vuoto qui sarebbe solo
  // un'altra cosa da leggere in una schermata già piena.
  if (!pagamenti || pagamenti.length === 0) return null;
  const totale = pagamenti.reduce((s, p) => s + p.amount, 0);

  return (
    <>
      <div style={{
        display:'flex', alignItems:'center', justifyContent:'space-between',
        gap: 10, padding:'14px 22px', borderTop:'1px solid #EDEFF2', borderBottom:'1px solid #EDEFF2',
      }}>
        <span style={{
          fontSize: 14.5, color:'#6B7280', fontWeight: 800,
          letterSpacing: 0.8, textTransform:'uppercase',
        }}>Già incassato</span>
        <span style={{
          fontSize: 17, fontWeight: 800, color:'#0F1115',
          fontVariantNumeric:'tabular-nums',
        }}>€{totale.toFixed(2)}</span>
      </div>

      <div style={{padding:'12px 22px 0'}}>
        <div style={{display:'flex', flexDirection:'column', gap: 6}}>
          {pagamenti.map(p => {
            const meta = PAG_META[p.method] || PAG_META.contanti;
            return (
              <div key={p.id} style={{
                display:'flex', alignItems:'center', gap: 10,
                padding:'9px 12px', background:'#fff',
                border:'1px solid #F0F2F5', borderRadius: 10,
              }}>
                <span style={{
                  padding:'3px 9px', borderRadius: 999, flexShrink: 0,
                  background: meta.bg, color: meta.ink,
                  fontSize: 14, fontWeight: 700,
                }}>{meta.label}</span>
                <span style={{
                  flex: 1, minWidth: 0, fontSize: 15, color:'#9CA3AF',
                  overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
                }}>{[p.chi, p.ora].filter(Boolean).join(' · ')}</span>
                <span style={{
                  fontSize: 16, fontWeight: 700, color:'#0F1115',
                  fontVariantNumeric:'tabular-nums',
                }}>€{p.amount.toFixed(2)}</span>
              </div>
            );
          })}
        </div>

        {/* Niente scorciatoia a Contabilità: sarebbe un cambio di pagina a
            conto aperto, con il cliente al tavolo che aspetta. Il rimborso
            si fa da lì quando è il suo momento — qui basta vedere che quei
            soldi sono già arrivati. */}
      </div>
    </>
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
        fontSize: 16, fontWeight: 700,
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
        <span style={{fontSize: 15, fontWeight: 700}}>{label}</span>
      </div>
      <div style={{display:'flex', alignItems:'baseline', gap: 3}}>
        <span style={{fontSize: 17, fontWeight: 700, color:'#9CA3AF'}}>€</span>
        <input type="number" value={value} onChange={e => onChange(e.target.value)}
          placeholder="0.00"
          style={{
            border:'none', outline:'none',
            fontSize: 20, fontWeight: 800, color:'#0F1115',
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
  fontSize: 15, fontWeight: 700, fontFamily:'inherit',
  whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis',
};

// ────────── PANNELLO AGGIUSTAMENTO ──────────
function AdjustPanel({ subtotale, adjust, setAdjust}) {
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
            border:'none', fontSize: 15, fontWeight: 700,
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
          fontSize: 17, fontWeight: 700, fontFamily:'inherit',
        }}>
          Arrotonda per difetto a €{Math.floor(subtotale).toFixed(0)}
        </button>
      )}

      {mode === 'custom' && (
        <div>
          <input type="number" value={val} onChange={e=>{setVal(e.target.value); apply('custom', e.target.value);}}
            placeholder={`Naturale: €${subtotale.toFixed(2)}`}
            style={{...inputV2, fontSize: 20, fontWeight: 800}}/>
          <div style={{fontSize: 14.5, color:'#6B7280', marginTop: 4}}>
            Sostituisce il totale naturale di €{subtotale.toFixed(2)}
          </div>
        </div>
      )}
    </div>
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
// Fra il tocco sul pulsante e la mano nel cassetto passano dei secondi, e
// questa è la schermata che si ha davanti in quei secondi: prima di tutto
// quanto va restituito, poi com'è stato pagato. Prima diceva solo il totale
// e il metodo — il resto lo si ricordava a memoria, o lo si andava a
// ricalcolare riaprendo il conto che intanto era chiuso.
// Stessa lingua e stessi colori della conferma d'incasso in Vendita diretta:
// è lo stesso gesto, fatto dalla stessa persona dietro allo stesso bancone.
function SaldaDoneV2({ tavolo, esito, onClose }) {
  const { total, contanti, carta, resto, invoice, invoiceData } = esito;
  const misto = contanti > 0 && carta > 0;
  const comeHaPagato = misto
    ? `€${contanti.toFixed(2)} in contanti + €${carta.toFixed(2)} con la carta`
    : carta > 0 ? 'Con la carta, su Byup Staff' : 'In contanti, alla cassa';
  const [stampato, setStampato] = React.useState(false);

  return (
    <div style={{
      flex:1, display:'flex', flexDirection:'column',
      alignItems:'center', padding:'30px 26px 24px',
    }}>
      <div style={{
        width: 64, height: 64, borderRadius: '50%',
        background:'#DCFCE7', color:'#16A34A',
        marginBottom: 14,
        display:'grid', placeItems:'center',
      }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 13 L9 17 L19 7"/>
        </svg>
      </div>
      <div style={{fontSize: 25, fontWeight: 800, color:'#0F1115', marginBottom: 3, letterSpacing:-0.4}}>
        Conto saldato
      </div>
      <div style={{fontSize: 36, fontWeight: 800, color:'#0F1115', marginBottom: 4, letterSpacing:-1, fontVariantNumeric:'tabular-nums'}}>
        €{total.toFixed(2)}
      </div>
      <div style={{fontSize: 16.5, color:'#6B7280', marginBottom: 18, textAlign:'center'}}>
        Tavolo {tavolo.id} · {comeHaPagato}
      </div>

      {/* Il numero che serve adesso, e che nessun altro schermo ha */}
      {resto > 0.004 && (
        <div style={{
          width:'100%', marginBottom: 14,
          display:'flex', alignItems:'center', justifyContent:'center', gap: 10,
          padding:'12px 16px', borderRadius: 12, background: PAY_BG,
        }}>
          <span style={{color: PAY_INK, display:'inline-flex'}}><IconCash/></span>
          <span style={{fontSize: 16.5, color: PAY_INK}}>Da restituire al cliente</span>
          <span style={{
            fontSize: 20, fontWeight: 800, letterSpacing:-0.3, color: PAY_INK,
            fontVariantNumeric:'tabular-nums',
          }}>€{resto.toFixed(2)}</span>
        </div>
      )}

      {/* La fattura è partita: si dice qui perché è l'ultimo momento in cui
          l'operatore ha ancora il cliente davanti per correggere i dati. */}
      {invoice && (
        <div style={{
          width:'100%', marginBottom: 14, padding:'11px 16px',
          borderRadius: 12, background:'#F5F6F8', border:'1px solid #E5E7EB',
          display:'flex', alignItems:'center', gap: 12, textAlign:'left',
        }}>
          <div style={{flex:1, minWidth: 0}}>
            <div style={{fontSize: 16.5, fontWeight: 700, color:'#0F1115'}}>Fattura emessa</div>
            <div style={{
              fontSize: 15, color:'#9CA3AF', marginTop: 1,
              overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
            }}>{(invoiceData && invoiceData.ragione) || 'Dati inseriti al momento dell’incasso'}</div>
          </div>
        </div>
      )}

      <span style={{flex: 1, minHeight: 10}}/>

      {/* Lo scontrino è ciò che si fa subito dopo, non un'alternativa al
          chiudere: sta davanti, e quando è uscito lo dice. */}
      <div style={{display:'flex', gap: 8, width:'100%'}}>
        <button onClick={onClose} style={{...btnSecondaryV2, flex: 1}}>Chiudi</button>
        <button onClick={() => setStampato(true)} style={{...btnPrimaryV2, flex: 1.4, justifyContent:'center'}}>
          {stampato
            ? <>✓ Scontrino stampato</>
            : <><IconPrinter/> Stampa scontrino</>}
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
// ────────── STILI ──────────
// Corallo del marchio: qui è il colore di ciò che è scelto e di ciò che
// incassa. Sta in una costante perché lo portano otto punti di questa
// finestra e devono essere lo stesso.
const SALDA_BRAND = '#FF3B41';
const SALDA_BRAND_SOFT = '#FFF1F1';
const btnGhost = {
  display:'inline-flex', alignItems:'center', gap: 8,
  padding:'11px 16px', background:'#fff', color:'#0F1115',
  border:'1px solid #E5E7EB', borderRadius: 11, fontSize: 16, fontWeight: 700,
  cursor:'pointer', fontFamily:'inherit', flexShrink: 0,
};
const saldaIconBtn = {
  width: 42, height: 42, borderRadius: 11, flexShrink: 0,
  background:'#fff', border:'1px solid #E5E7EB', cursor:'pointer',
  fontFamily:'inherit', color:'#6B7280',
  display:'grid', placeItems:'center',
};
const sectionLabel = {
  fontSize: 14.5, fontWeight: 800, color:'#6B7280',
  letterSpacing: 0.6, textTransform:'uppercase',
  marginBottom: 8,
};
const btnPrimaryV2 = {
  display:'inline-flex', alignItems:'center', gap: 6,
  padding:'10px 16px', background:'#0F1115', color:'#fff',
  border:'none', borderRadius: 8, fontSize: 17, fontWeight: 700,
  cursor:'pointer', fontFamily:'inherit',
};
const btnSecondaryV2 = {
  padding:'10px 16px', background:'#fff', color:'#0F1115',
  border:'1px solid #E5E7EB', borderRadius: 8, fontSize: 17, fontWeight: 700,
  cursor:'pointer', fontFamily:'inherit',
};
// Il segmento acceso è in tinta brand, non nero: in questa finestra il nero
// resta ai numeri, e il corallo dice cosa è selezionato — le spunte, i chip
// del contante, il pulsante che incassa.
function segBtn(on) {
  return {
    padding:'9px 16px', borderRadius: 9,
    background: on ? SALDA_BRAND : 'transparent',
    color: on ? '#fff' : '#0F1115',
    border:'none', fontSize: 16, fontWeight: 700,
    cursor:'pointer', fontFamily:'inherit',
    whiteSpace:'nowrap', transition:'background 140ms ease, color 140ms ease',
  };
}
const miniLink = {
  background:'none', border:'none',
  padding:'2px 4px', color:'#6B7280',
  fontSize: 15.5, fontWeight: 700,
  cursor:'pointer', fontFamily:'inherit',
  display:'inline-flex', alignItems:'center', gap: 4,
};
const chipQuick = {
  flex: 1, padding:'5px 8px', borderRadius: 6,
  background:'#F8F9FB', color:'#0F1115',
  border:'1px solid #E5E7EB', cursor:'pointer',
  fontSize: 15, fontWeight: 700, fontFamily:'inherit',
};
const inputV2 = {
  padding:'8px 10px', border:'1px solid #E5E7EB',
  borderRadius: 6, fontSize: 17,
  fontFamily:'inherit', outline:'none',
  width:'100%', background:'#fff',
  boxSizing:'border-box',
};

// ────────── ADD ARTICLE BAR ──────────
function AddArticleBar({ query, setQuery, open, setOpen, onPick }) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open, setOpen]);

  // Flatten SALA_MENU in lista piatto per ricerca
  const allMenu = React.useMemo(() => {
    const m = window.SALA_MENU || {};
    const out = [];
    Object.keys(m).forEach(cat => {
      (m[cat] || []).forEach(item => out.push({...item, categoria: cat}));
    });
    return out;
  }, []);

  const q = (query || '').trim().toLowerCase();
  const matches = q ? allMenu.filter(m => m.nome.toLowerCase().includes(q)).slice(0, 8) : [];

  return (
    <div ref={ref} style={{
      padding:'10px 18px 8px', borderBottom:'1px solid #F0F2F5',
      background:'#fff', position:'relative',
    }}>
      <div style={{
        display:'flex', alignItems:'center', gap: 8,
        padding:'8px 10px', borderRadius: 8,
        background:'#FAFBFC', border:'1px solid #E5E7EB',
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" style={{flexShrink:0}}>
          <path d="M12 5v14 M5 12h14"/>
        </svg>
        <input
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => { if (query.trim()) setOpen(true); }}
          placeholder="Aggiungi articolo dal menù…"
          style={{
            flex:1, border:'none', outline:'none',
            background:'transparent', fontSize: 17,
            color:'#0F1115', fontFamily:'inherit',
          }}
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setOpen(false); }}
            style={{
              width: 18, height: 18, padding: 0, borderRadius: 4,
              background:'transparent', border:'none', cursor:'pointer',
              color:'#9CA3AF', fontSize: 18, fontFamily:'inherit',
              display:'inline-flex', alignItems:'center', justifyContent:'center',
            }}>×</button>
        )}
      </div>

      {open && q && (
        <div style={{
          position:'absolute', top:'calc(100% - 4px)', left: 18, right: 18,
          background:'#fff', border:'1px solid #E5E7EB', borderRadius: 8,
          boxShadow:'0 12px 28px rgba(15,17,21,0.12), 0 2px 6px rgba(15,17,21,0.06)',
          zIndex: 70, maxHeight: 280, overflow:'auto', padding: 4,
        }}>
          {matches.length === 0 ? (
            <div style={{padding:'14px 12px', fontSize: 16.5, color:'#9CA3AF', textAlign:'center'}}>
              Nessun articolo trovato. <button
                onClick={() => onPick({ nome: query.trim(), prezzo: 0 })}
                style={{
                  marginLeft: 4, padding:'2px 6px',
                  background:'#0F1115', color:'#fff', border:'none',
                  borderRadius: 4, fontSize: 15, fontWeight: 700,
                  cursor:'pointer', fontFamily:'inherit',
                }}>Crea "{query.trim()}"</button>
            </div>
          ) : (
            matches.map(m => (
              <button
                key={m.id}
                onClick={() => onPick(m)}
                style={{
                  display:'flex', alignItems:'center', gap: 10,
                  width:'100%', padding:'8px 10px', borderRadius: 6,
                  background:'transparent', border:'none', cursor:'pointer',
                  fontFamily:'inherit', textAlign:'left',
                  transition:'background 120ms',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#F8F9FB'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
              >
                <span style={{flex:1, fontSize: 17, color:'#0F1115'}}>{m.nome}</span>
                <span style={{fontSize: 15, color:'#9CA3AF'}}>{m.categoria}</span>
                <span style={{fontSize: 17, fontWeight: 700, color:'#0F1115', fontVariantNumeric:'tabular-nums', minWidth: 50, textAlign:'right'}}>
                  €{m.prezzo.toFixed(2)}
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

window.SalaSaldaModal = SalaSaldaModal;
