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
  // Modulo asporto (Impostazioni → Operazioni, scelto in onboarding). Spento,
  // spariscono le code del banco e il toggle "Vai ad asporto": senza asporto
  // non esistono ordini che aspettano di essere ritirati.
  const [asportoOn, setAsportoOn] = React.useState(
    () => (window.byupReadModules ? window.byupReadModules().asporto !== false : true));
  React.useEffect(() => {
    const update = () => setAsportoOn(window.byupReadModules ? window.byupReadModules().asporto !== false : true);
    window.addEventListener('byup-modules-change', update);
    window.addEventListener('storage', update);
    return () => {
      window.removeEventListener('byup-modules-change', update);
      window.removeEventListener('storage', update);
    };
  }, []);
  const [search, setSearch] = React.useState('');
  const [cat, setCat] = React.useState('Tutto');
  const [lines, setLines] = React.useState([]); // [{id, piatto, qty, mods, lineTotal}]
  const [takeaway, setTakeaway] = React.useState(false);
  // Cliente dell'asporto: chi viene a ritirare. Vive solo finché il flag è
  // acceso — spento l'asporto, l'ordine torna anonimo come ogni scontrino.
  const [taCliente, setTaCliente] = React.useState(null);
  React.useEffect(() => { if (!takeaway) setTaCliente(null); }, [takeaway]);
  React.useEffect(() => { if (!asportoOn) setTakeaway(false); }, [asportoOn]);
  const [incassaOpen, setIncassaOpen] = React.useState(false);
  const [personalize, setPersonalize] = React.useState(null); // {piatto}
  const [editLine, setEditLine] = React.useState(null); // line index for editing existing
  const [customOpen, setCustomOpen] = React.useState(false);
  // Ritiri: coda di chi aspetta al banco — asporto dai canali digitali e ordini
  // di cassa con preparazione, che abbiano o no il sacchetto. Drawer laterale +
  // conferma con codice ritiro; "Salda ora" apre l'incasso al banco.
  const [ritiri, setRitiri] = React.useState(() => (window.SALA_ASPORTO_CONTI || []));
  // Coda aperta nel pannello: 'salda' (ancora da incassare) o 'consegna'
  // (pagati, pronti da dare via). Sono i due gesti diversi del banco, quindi
  // due liste diverse — non una sola con dentro due tipi di card.
  const [coda, setCoda] = React.useState(null);
  const [consegnatiOpen, setConsegnatiOpen] = React.useState(false);
  React.useEffect(() => {
    if (!asportoOn) { setCoda(null); setConsegnatiOpen(false); }
  }, [asportoOn]);
  // Dettaglio di un ordine già consegnato, aperto dall'archivio.
  const [dettaglio, setDettaglio] = React.useState(null);
  // Storico del servizio: ordini già chiusi. Cresce man mano che si consegna.
  const [storico, setStorico] = React.useState(() => (window.SALA_ORDINI_STORICO || []));
  const [saldaOrdine, setSaldaOrdine] = React.useState(null); // ordine da saldare al banco (modale incasso)
  const [toast, setToast] = React.useState(null);
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
  };
  // Consegnato: esce dalla coda ed entra nello storico, in cima (il più
  // recente sta sopra: le domande arrivano quasi sempre sull'ultimo ordine).
  const confermaConsegna = (ordine) => {
    setRitiri(prev => {
      const next = prev.filter(r => r.id !== ordine.id);
      if (!next.filter(r => r.pagato).length && coda === 'consegna') setCoda(null);
      return next;
    });
    setStorico(prev => [{...ordine, stato: 'consegnato'}, ...prev]);
    showToast(`✓ Ordine ${ordine.codice} consegnato${ordine.cliente ? ` a ${ordine.cliente}` : ''}`);
  };
  // Incasso confermato: l'ordine diventa pagato e passa nella coda di chi va
  // solo consegnato — lo stesso ordine, l'altro gesto.
  const confermaSaldo = (ordine) => {
    setRitiri(prev => prev.map(r => r.id === ordine.id ? {...r, pagato: true} : r));
    showToast(`✓ Ordine ${ordine.codice} saldato · ora è da consegnare`);
  };

  // Le due code, dalla stessa lista: il pagamento è ciò che le separa.
  const daSaldare = ritiri.filter(r => !r.pagato);
  const daConsegnare = ritiri.filter(r => r.pagato);

  // Creazione ordine al banco. Alla conferma dell'incasso l'ordine viene creato
  // e inviato ai monitor: qui NON si decide cosa passa dalla cucina: si manda
  // tutto ed è il KDS a filtrare per stazione (un caffè semplicemente non
  // comparirà su nessuna postazione). Il numero è la ricevuta dell'invio per
  // l'operatore, l'unico punto del flusso in cui l'ordine diventa una cosa.
  const ordineSeq = React.useRef(1246);
  // Codice ritiro: alfabeto senza I/O/0/1 — va dettato a voce al cliente.
  const nuovoCodiceRitiro = () => Array.from({length: 4}, () =>
    'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 32)]).join('');

  // Un ordine entra nella coda al banco se c'è qualcosa da aspettare, non se è
  // da asporto: chi ordina una lasagna e si siede va richiamato al banco
  // esattamente come chi la porta via. In produzione la risposta arriva a
  // valle dal KDS (una stazione ha preso in carico l'ordine?); qui la
  // approssimiamo con la categoria, che è l'unico segnale disponibile.
  const haPreparazione = (righe) => righe.some(l =>
    l.piatto.cat !== 'Bar' && l.piatto.cat !== 'Personalizzato');

  const creaOrdine = (totale) => {
    const numero = ++ordineSeq.current;
    const ordine = { numero, codice: `#${numero}`, totale, takeaway };
    // In coda: l'ordine non finisce col pagamento, resta in attesa di ritiro.
    // Il flag asporto qui non decide nulla — dice solo se va incartato.
    if (haPreparazione(lines)) {
      ordine.codiceRitiro = nuovoCodiceRitiro();
      const now = new Date();
      const hhmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      setRitiri(prev => [...prev, {
        id: `banco-${numero}`, codice: ordine.codice,
        cliente: takeaway ? taCliente : null, ritiro: hhmm,
        fonte: 'banco', pagato: true, asporto: takeaway, totale,
        codiceRitiro: ordine.codiceRitiro,
        items: lines.map(l => ({
          nome: l.displayName || l.piatto.name, qty: l.qty, prezzo: l.lineTotal,
        })),
      }]);
    }
    setTakeaway(false);
    return ordine;
  };

  const cats = ['Tutto', ...Array.from(new Set(SALA_VENDITA_PIATTI.map(p => p.cat)))];
  const piatti = SALA_VENDITA_PIATTI.filter(p => {
    if (cat !== 'Tutto' && p.cat !== cat) return false;
    if (search.trim() && !p.name.toLowerCase().includes(search.trim().toLowerCase())) return false;
    return true;
  });

  const isCustomizable = (p) => (p.variants?.length || p.ingredients?.length || p.extras?.length);
  // Opzione obbligatoria (variant required): niente aggiunta diretta, serve
  // sempre il popup di personalizzazione — anche dal pulsante + Aggiungi.
  const hasRequiredOptions = (p) => (p.variants || []).some(g => g.required);

  // Quick add: piatti senza personalizzazione, o aggiunge un'altra riga base
  const quickAdd = (p) => {
    if (hasRequiredOptions(p)) { openPersonalizza(p); return; }
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
      <div style={{display:'grid', gridTemplateColumns:'1fr 440px', gap: 18, flex: 1, minHeight: 0}}>
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
          <div style={{display:'flex', gap: 8, marginBottom: 12, alignItems:'stretch'}}>
            {/* La ricerca non si prende più tutta la riga: accanto ci stanno le
                due code del banco, che durante il servizio si guardano molto
                più spesso di quanto si cerchi un piatto per nome. */}
            <div style={{position:'relative', flex: '0 1 260px', minWidth: 150}}>
              <span style={{position:'absolute', left: 12, top:'50%', transform:'translateY(-50%)', color: PN.MUTED, display:'inline-flex'}}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
              </span>
              <input
                id="sa-vd-search"
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Cerca nel menù…"
                style={{
                  width:'100%', boxSizing:'border-box',
                  padding: '9px 12px 9px 34px',
                  borderRadius: 10, border: `1px solid ${PN.BORDER_LIGHT}`,
                  fontSize: 16, fontFamily:'inherit', outline:'none',
                  background: '#FAFBFC',
                  boxShadow: 'inset 0 1px 1px rgba(15,17,21,0.03)',
                }}/>
            </div>

            {/* Le due code del banco e l'archivio: esistono solo se il locale
                fa asporto. Sono stati, non modalità: aprono il pannello degli
                ordini già filtrato su quello che devi fare — incassare, o
                consegnare e basta. */}
            {asportoOn && <>
            <SaCodaBtn
              label="Pronti da saldare"
              count={daSaldare.length}
              tone="amber"
              title="Ordini arrivati da app o webapp, ancora da incassare in cassa"
              onClick={() => setCoda('salda')}
              icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="13" rx="2.5"/><path d="M2 10.5h20"/><path d="M6 15h4"/></svg>}
            />
            <SaCodaBtn
              label="Da consegnare"
              count={daConsegnare.length}
              tone="green"
              title="Ordini pronti e già pagati: vanno solo consegnati"
              onClick={() => setCoda('consegna')}
              icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>}
            />

            {/* Terza voce: non è una coda ma l'archivio del servizio, quindi
                niente contatore che chiama — è dove si va a cercare, non dove
                si lavora. Stessa riga perché la domanda ("l'ordine di prima?")
                nasce proprio mentre si guardano le code. */}
            <button
              onClick={() => setConsegnatiOpen(true)}
              title="Gli ordini già consegnati del servizio"
              style={{
                display:'inline-flex', alignItems:'center', gap: 8, flexShrink: 0,
                padding: '0 13px', borderRadius: 10,
                background: PN.WHITE, color: PN.TEXT,
                border: `1px solid ${PN.BORDER_LIGHT}`,
                fontSize: 16, fontWeight: 700, cursor:'pointer', fontFamily:'inherit',
                whiteSpace:'nowrap',
                boxShadow: `${PN.INSET_HIGHLIGHT}, 0 1px 2px rgba(15,17,21,0.04)`,
                transition: 'border-color 150ms, background 150ms',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#9CA3AF'; e.currentTarget.style.background = '#FAFBFC'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = PN.BORDER_LIGHT; e.currentTarget.style.background = PN.WHITE; }}>
              <span style={{color: PN.MUTED, display:'inline-flex'}}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
              </span>
              Consegnati
            </button>
            </>}
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
                requiresOptions={hasRequiredOptions(p)}
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
        asportoOn={asportoOn}
        onToggleTakeaway={() => setTakeaway(v => !v)}
        cliente={taCliente}
        onCliente={setTaCliente}
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

      <SaIncassaModal
        open={incassaOpen}
        total={total}
        onClose={() => setIncassaOpen(false)}
        onConfirm={(totale) => {
          const ordine = creaOrdine(totale);
          setLines([]);
          return ordine;
        }}
      />

      {/* Popup coda: saldare o consegnare */}
      <SaCodaModal
        open={!!coda}
        modo={coda || 'consegna'}
        ritiri={coda === 'salda' ? daSaldare : daConsegnare}
        onClose={() => setCoda(null)}
        onConsegna={confermaConsegna}
        onSalda={setSaldaOrdine}
      />

      {/* Consegnati — l'archivio del servizio */}
      {consegnatiOpen && (
        <SaConsegnatiModal
          consegnati={storico}
          onClose={() => setConsegnatiOpen(false)}
          onVai={setDettaglio}
        />
      )}

      {/* Ordine già chiuso: non ha più una coda dove andare, si apre e basta */}
      {dettaglio && (
        <SaOrdineDettaglioModal ordine={dettaglio} onClose={() => setDettaglio(null)}/>
      )}
      {/* Salda ora asporto: stessa modale incasso del banco, sul totale dell'ordine */}
      <SaIncassaModal
        open={!!saldaOrdine}
        total={saldaOrdine ? saldaOrdine.totale : 0}
        onClose={() => setSaldaOrdine(null)}
        onConfirm={() => confermaSaldo(saldaOrdine)}
      />

      {toast && (
        <div style={{
          position:'absolute', bottom: 28, left:'50%', transform:'translateX(-50%)',
          background:'#0F1115', color:'#fff',
          padding:'12px 22px', borderRadius: 999,
          fontSize: 17, fontWeight: 700, zIndex: 120,
          whiteSpace:'nowrap',
          boxShadow:'0 8px 24px rgba(0,0,0,0.18)',
        }}>{toast}</div>
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
// Code del banco — due pulsanti accanto alla ricerca, uno per gesto.

// Il numero è l'informazione, non la decorazione: a zero il pulsante si spegne
// (resta cliccabile, da lì si arriva a "tutti gli ordini") e non chiama.
function SaCodaBtn({ label, count, tone, icon, title, onClick }) {
  const vuoto = count === 0;
  const badge = vuoto
    ? { bg: PN.WHITE_FROST, fg: PN.MUTED_SOFT }
    : tone === 'amber' ? { bg: PN.AMBER, fg: '#fff' } : { bg: PN.GREEN, fg: '#fff' };
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        display:'inline-flex', alignItems:'center', gap: 8, flexShrink: 0,
        padding: '0 13px', borderRadius: 10,
        background: PN.WHITE, color: vuoto ? PN.MUTED : PN.TEXT,
        border: `1px solid ${PN.BORDER_LIGHT}`,
        fontSize: 16, fontWeight: 700, cursor:'pointer', fontFamily:'inherit',
        whiteSpace:'nowrap',
        boxShadow: `${PN.INSET_HIGHLIGHT}, 0 1px 2px rgba(15,17,21,0.04)`,
        transition: 'border-color 150ms, background 150ms',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = '#9CA3AF'; e.currentTarget.style.background = '#FAFBFC'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = PN.BORDER_LIGHT; e.currentTarget.style.background = PN.WHITE; }}>
      <span style={{color: vuoto ? PN.MUTED_SOFT : (tone === 'amber' ? PN.AMBER : PN.GREEN), display:'inline-flex'}}>{icon}</span>
      {label}
      <span style={{
        minWidth: 22, padding: '2px 7px', borderRadius: 999,
        background: badge.bg, color: badge.fg,
        fontSize: 14, fontWeight: 800, lineHeight: 1.2, textAlign:'center',
        fontVariantNumeric:'tabular-nums',
      }}>{count}</span>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Coda del banco — popup centrale, stessa anatomia di card per i due modi:
//   'salda'    → arrivati da app/webapp, ancora da incassare (CTA Salda ora)
//   'consegna' → già pagati, pronti da dare via (CTA Segna come consegnato)
// L'archivio dei consegnati sta nella riga in alto, non qui dentro.

const SA_CODA_MODI = {
  salda: {
    titolo: 'Pronti da saldare',
    sotto: 'Ordini arrivati da app e webapp, ancora da incassare. Saldati, passano nella coda di chi va consegnato.',
    vuotoTitolo: 'Niente da saldare',
    vuotoTesto: 'Gli ordini che arrivano già pagati non passano di qui.',
    // Chi si presenta al banco dice un codice o un nome: qui si cerca quello,
    // non si scorre la coda a occhio.
    ricerca: true,
    ricercaPlaceholder: 'Cerca per codice, nome o piatto…',
  },
  consegna: {
    titolo: 'Da consegnare',
    sotto: 'Ordini pronti e già pagati: consegnato l\'ordine, segnalo e esce dalla coda.',
    vuotoTitolo: 'Niente da consegnare',
    vuotoTesto: 'Qui arrivano gli ordini pagati, appena sono pronti al banco.',
  },
};

function SaCodaModal({ open, modo, ritiri, onClose, onConsegna, onSalda }) {
  const testi = SA_CODA_MODI[modo] || SA_CODA_MODI.consegna;
  const [q, setQ] = React.useState('');
  React.useEffect(() => { setQ(''); }, [modo, open]);
  const ql = testi.ricerca ? q.trim().toLowerCase() : '';
  const visibili = !ql ? ritiri : ritiri.filter(r =>
    (r.codice || '').toLowerCase().includes(ql) ||
    (r.cliente || '').toLowerCase().includes(ql) ||
    (r.items || []).some(i => i.nome.toLowerCase().includes(ql))
  );
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;

  return (
    // absolute (ancorato al frame, non alla finestra): dentro il canvas scalato
    // con zoom i fixed si disallineano. Stessa scatola dei "Consegnati": le
    // code sono la stessa materia, guardata da più vicino.
    <div onClick={onClose} style={{
      position:'absolute', inset: 0, background:'rgba(15,17,21,0.42)',
      display:'grid', placeItems:'center', zIndex: 95, padding: 24,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        ...PN.GLASS_STRONG,
        borderRadius: 22, width: 560, maxWidth:'100%', maxHeight:'100%',
        display:'flex', flexDirection:'column', overflow:'hidden',
      }}>
        {/* header */}
        <div style={{padding:'20px 22px 14px', display:'flex', alignItems:'flex-start', gap: 10, flexShrink: 0}}>
          <div style={{flex: 1}}>
            <div style={{fontSize: 20, fontWeight: 700, color: PN.TEXT, letterSpacing:-0.3}}>{testi.titolo}</div>
            <div style={{fontSize: 15, color: PN.MUTED, marginTop: 2, lineHeight: 1.45}}>
              {testi.sotto}
            </div>
          </div>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: 8, flexShrink: 0,
            border:'none', background:'rgba(255,255,255,0.75)', color: PN.TEXT,
            cursor:'pointer', display:'grid', placeItems:'center', fontSize: 18, fontFamily:'inherit',
          }}>×</button>
        </div>

        {testi.ricerca && ritiri.length > 0 && (
          <div style={{padding:'0 22px 12px', flexShrink: 0}}>
            <div style={{position:'relative'}}>
              <span style={{position:'absolute', left: 12, top:'50%', transform:'translateY(-50%)', color: PN.MUTED, display:'inline-flex'}}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
              </span>
              <input
                autoFocus
                value={q} onChange={e => setQ(e.target.value)}
                placeholder={testi.ricercaPlaceholder}
                onKeyDown={e => { if (e.key === 'Escape' && q) { e.stopPropagation(); setQ(''); } }}
                style={{
                  width:'100%', boxSizing:'border-box',
                  padding: '10px 34px 10px 35px',
                  borderRadius: 10, border: `1px solid ${PN.BORDER_LIGHT}`,
                  fontSize: 16, fontFamily:'inherit', outline:'none',
                  background:'rgba(255,255,255,0.78)',
                  boxShadow: 'inset 0 1px 1px rgba(15,17,21,0.03)',
                }}/>
              {q && (
                <button
                  onClick={() => setQ('')}
                  title="Pulisci la ricerca"
                  style={{
                    position:'absolute', right: 5, top:'50%', transform:'translateY(-50%)',
                    width: 24, height: 24, borderRadius:'50%',
                    background:'transparent', border:'none', color: PN.MUTED,
                    fontSize: 16, lineHeight: 1, cursor:'pointer', fontFamily:'inherit',
                  }}>×</button>
              )}
            </div>
          </div>
        )}

        {/* lista ordini — minHeight:0 obbligatorio: senza, il flex item cresce
            quanto il contenuto e la lista non scrolla (card tagliate in basso) */}
        <div className="pn-scroll" style={{flex: 1, minHeight: 0, overflow:'auto', padding: '0 22px 22px', display:'flex', flexDirection:'column', gap: 12}}>
          {ritiri.length === 0 && (
            <div style={{textAlign:'center', padding:'48px 20px', display:'flex', flexDirection:'column', alignItems:'center'}}>
              <div style={{
                width: 60, height: 60, borderRadius:'50%', marginBottom: 14,
                background: PN.WHITE_FROST, color: PN.MUTED_SOFT,
                display:'grid', placeItems:'center',
              }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18l-2 13H5L3 6Z"/><path d="M8 6V4a4 4 0 0 1 8 0v2"/></svg>
              </div>
              <div style={{fontSize: 17.5, fontWeight: 700, color: PN.TEXT, marginBottom: 5}}>{testi.vuotoTitolo}</div>
              <div style={{fontSize: 15.5, color: PN.MUTED, lineHeight: 1.5, maxWidth: 300}}>{testi.vuotoTesto}</div>
            </div>
          )}
          {ritiri.length > 0 && visibili.length === 0 && (
            <div style={{textAlign:'center', padding:'40px 20px', color: PN.MUTED, fontSize: 16}}>
              Nessun ordine in coda corrisponde a "{q.trim()}"
            </div>
          )}
          {visibili.map(r => (
            <div key={r.id}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 2px 0 rgba(15,17,21,0.03), 0 12px 28px rgba(15,17,21,0.10)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
              style={{
              border: `1px solid ${PN.BORDER_HAIR}`, borderRadius: 16,
              background: 'rgba(255,255,255,0.82)',
              boxShadow: '0 1px 0 rgba(15,17,21,0.04), 0 6px 16px rgba(15,17,21,0.05)',
              overflow:'hidden',
              transition:'transform 160ms ease, box-shadow 180ms ease',
              // flexShrink 0 obbligatorio: senza, la colonna flex COMPRIME le card
              // per farcele stare (niente overflow → niente scroll) e il fondo
              // di ogni card — la CTA Consegna — resta clippato da overflow:hidden.
              flexShrink: 0,
            }}>
              {/* Testata: identità + stato; sotto, codice, orario e fonte in
                  una riga di metadati ordinata. Un ordine di cassa non ha un
                  nome: la sua identità è il numero, che sale a titolo — dentro
                  un drawer già intitolato "Ritiri al banco" ripetere "al banco"
                  su ogni card non aggiunge niente. */}
              <div style={{padding:'13px 16px 11px', display:'flex', alignItems:'flex-start', gap: 10}}>
                <div style={{flex: 1, minWidth: 0}}>
                  <div style={{fontSize: 17.5, fontWeight: 800, letterSpacing: -0.2, color: PN.TEXT, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', fontVariantNumeric:'tabular-nums'}}>{r.cliente || r.codice}</div>
                  <div style={{display:'flex', alignItems:'center', gap: 8, marginTop: 5, minWidth: 0}}>
                    {r.cliente && (
                      <span style={{
                        fontSize: 13, fontWeight: 700, color: PN.TEXT,
                        fontVariantNumeric:'tabular-nums',
                        background:'#F4F5F7', border:`1px solid ${PN.BORDER_SOFT}`,
                        padding:'1px 8px', borderRadius: 7, flexShrink: 0,
                      }}>{r.codice}</span>
                    )}
                    <span style={{display:'inline-flex', alignItems:'center', gap: 4, fontSize: 14, color: PN.MUTED, whiteSpace:'nowrap', fontVariantNumeric:'tabular-nums'}}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15.5 14"/></svg>
                      ritiro {r.ritiro}
                    </span>
                    {/* Un solo chip, e solo dove esiste una scelta: un ordine di
                        cassa è da asporto o al banco, e la differenza è un gesto
                        (incartare o no). Il canale non compare più — per gli
                        ordini remoti lo dice già il badge di pagamento, e
                        ripeterlo non cambia cosa fa l'operatore al ritiro. */}
                    {r.fonte === 'banco' && (
                      <span style={{
                        fontSize: 12, fontWeight: 800, letterSpacing: 0.4, textTransform:'uppercase',
                        padding:'2px 8px', borderRadius: 999, flexShrink: 0,
                        background: r.asporto ? PN.AMBER_SOFT : '#F4F5F7',
                        color: r.asporto ? '#92400E' : PN.MUTED,
                      }}>{r.asporto ? 'da asporto' : 'al banco'}</span>
                    )}
                  </div>
                </div>
                {r.pagato ? (
                  <span style={{display:'inline-flex', alignItems:'center', gap: 5, fontSize: 13.5, fontWeight: 700, color:'#15803D', background:'#DCFCE7', padding:'4px 11px', borderRadius: 999, flexShrink: 0}}>
                    ✓ {r.fonte === 'banco' ? 'Pagato in cassa' : 'Pagato in app'}
                  </span>
                ) : (
                  <span style={{display:'inline-flex', alignItems:'center', gap: 5, fontSize: 13.5, fontWeight: 700, color:'#92400E', background: PN.AMBER_SOFT, padding:'4px 11px', borderRadius: 999, flexShrink: 0}}>
                    Da pagare
                  </span>
                )}
              </div>
              {/* Articoli su pannello tinto: respiro e totale in evidenza */}
              <div style={{margin:'0 12px 12px', background:'#FAFBFC', border:`1px solid ${PN.BORDER_SOFT}`, borderRadius: 12, padding:'10px 12px', display:'flex', flexDirection:'column', gap: 4}}>
                {r.items.map((item, i) => (
                  <div key={i} style={{display:'flex', alignItems:'center', gap: 8, fontSize: 15}}>
                    <span style={{fontWeight: 700, color: PN.MUTED_SOFT, minWidth: 24, flexShrink: 0, fontVariantNumeric:'tabular-nums'}}>{item.qty}×</span>
                    <span style={{flex: 1, color: PN.TEXT, fontWeight: 600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{item.nome}</span>
                    <span style={{fontWeight: 700, color: PN.TEXT, fontVariantNumeric:'tabular-nums'}}>€{(item.prezzo * item.qty).toFixed(2)}</span>
                  </div>
                ))}
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', borderTop:`1px solid ${PN.BORDER_SOFT}`, paddingTop: 8, marginTop: 4}}>
                  <span style={{fontSize: 13.5, fontWeight: 700, color: PN.MUTED, textTransform:'uppercase', letterSpacing: 0.4}}>{r.pagato ? 'Totale · pagato' : 'Totale da pagare'}</span>
                  <span style={{fontSize: 18, fontWeight: 800, color: PN.TEXT, fontVariantNumeric:'tabular-nums', letterSpacing:-0.3}}>€{r.totale.toFixed(2)}</span>
                </div>
              </div>
              {/* CTA: mai la consegna su un ordine da saldare — prima l'incasso,
                  poi (l'ordine passa nell'altra coda) la consegna */}
              <div style={{padding:'0 12px 12px', display:'flex', gap: 8}}>
                {!r.pagato ? (
                  <button onClick={() => onSalda(r)} style={{
                    flex: 1, padding:'11px 16px', borderRadius: 999,
                    background: PN.WHITE, color: PN.TEXT,
                    border: `1px solid ${PN.BORDER}`,
                    fontSize: 17, fontWeight: 700, cursor:'pointer', fontFamily:'inherit',
                    transition:'background 150ms ease-out, border-color 150ms ease, transform 150ms cubic-bezier(0.34, 1.45, 0.64, 1), box-shadow 150ms ease',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#F4F5F7'; e.currentTarget.style.borderColor = PN.TEXT; e.currentTarget.style.transform = 'scale(1.03)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(15,17,21,0.12)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = PN.WHITE; e.currentTarget.style.borderColor = PN.BORDER; e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
                    onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.97)'; }}
                    onMouseUp={e => { e.currentTarget.style.transform = 'scale(1.03)'; }}>
                    Salda ora
                  </button>
                ) : (
                  <button onClick={() => onConsegna(r)} style={{
                    flex: 1, padding:'11px 16px', borderRadius: 999,
                    background: SV_SUNSET_BG, color: SV_SUNSET_TEXT,
                    border:'1px solid transparent',
                    fontSize: 17, fontWeight: 700, cursor:'pointer', fontFamily:'inherit',
                    boxShadow: SV_SUNSET_SHADOW,
                    transition:'box-shadow 180ms ease-out, filter 150ms ease-out, transform 150ms cubic-bezier(0.34, 1.45, 0.64, 1)',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.22)'; e.currentTarget.style.transform = 'scale(1.03)'; e.currentTarget.style.boxShadow = 'inset 0 1px 0 rgba(255,200,210,0.22), inset 0 0 0 1px rgba(255,130,150,0.16), 0 12px 30px -8px rgba(80,10,30,0.65), 0 4px 10px -4px rgba(80,10,30,0.35)'; }}
                    onMouseLeave={e => { e.currentTarget.style.filter = ''; e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = SV_SUNSET_SHADOW; }}
                    onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.97)'; }}
                    onMouseUp={e => { e.currentTarget.style.transform = 'scale(1.03)'; }}>
                    Segna come consegnato
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Consegnati — l'archivio del servizio: gli ordini che sono già usciti dalle
// code. Non ha azioni (non c'è più niente da fare), si viene per guardare:
// quant'era, a che ora è passato, da che canale era arrivato.

function SaConsegnatiModal({ consegnati, onClose, onVai }) {
  React.useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Il canale spiega perché quell'ordine ha un nome o un codice al posto suo.
  const CANALE = {
    byup:   { label:'Byup App', bg: PN.PINK_BG_SOFT, fg: PN.PINK_DARK },
    webapp: { label:'Webapp',   bg: PN.BLUE_SOFT,    fg: '#1D4ED8' },
    banco:  { label:'Cassa',    bg: '#F4F5F7',       fg: PN.MUTED },
  };

  return (
    <div onClick={onClose} style={{
      position:'absolute', inset: 0, background:'rgba(15,17,21,0.42)',
      display:'grid', placeItems:'center', zIndex: 110, padding: 24,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        ...PN.GLASS_STRONG,
        borderRadius: 22, width: 700, maxWidth:'100%', maxHeight:'100%',
        display:'flex', flexDirection:'column', overflow:'hidden',
      }}>
        <div style={{padding:'20px 22px 16px', display:'flex', alignItems:'flex-start', gap: 10, flexShrink: 0}}>
          <div style={{flex: 1}}>
            <div style={{fontSize: 20, fontWeight: 700, color: PN.TEXT, letterSpacing:-0.3}}>Consegnati</div>
            <div style={{fontSize: 15, color: PN.MUTED, marginTop: 2}}>
              Gli ordini già chiusi del servizio, dal più recente.
            </div>
          </div>
          <span style={{
            fontSize: 13.5, fontWeight: 800, flexShrink: 0,
            color: PN.MUTED, background:'rgba(255,255,255,0.75)',
            padding:'5px 12px', borderRadius: 999, fontVariantNumeric:'tabular-nums',
          }}>{consegnati.length}</span>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: 8, flexShrink: 0,
            border:'none', background:'rgba(255,255,255,0.75)', color: PN.TEXT,
            cursor:'pointer', display:'grid', placeItems:'center', fontSize: 18, fontFamily:'inherit',
          }}>×</button>
        </div>

        <div className="pn-scroll" style={{
          flex: 1, minHeight: 0, overflow:'auto',
          padding:'0 22px 22px', display:'flex', flexDirection:'column', gap: 8,
        }}>
          {consegnati.length === 0 && (
            <div style={{textAlign:'center', padding:'44px 20px', color: PN.MUTED, fontSize: 16}}>
              Nessun ordine consegnato: il servizio è appena cominciato.
            </div>
          )}
          {consegnati.map(o => {
            const canale = CANALE[o.fonte] || CANALE.banco;
            const nItems = o.items.reduce((s, i) => s + i.qty, 0);
            return (
              <div key={o.id} style={{
                display:'flex', alignItems:'center', gap: 10,
                padding:'11px 14px', borderRadius: 14,
                background:'rgba(255,255,255,0.78)',
                border:`1px solid ${PN.BORDER_HAIR}`,
              }}>
                <span style={{flex: 1, minWidth: 0}}>
                  {/* Identità: il nome se l'ordine ha un account dietro, il
                      codice se è arrivato dalla webapp guest o dalla cassa. */}
                  <span style={{display:'flex', alignItems:'center', gap: 7, minWidth: 0}}>
                    <span style={{fontSize: 16.5, fontWeight: 700, color: PN.TEXT, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', fontVariantNumeric:'tabular-nums'}}>
                      {o.cliente || o.codice}
                    </span>
                    {o.cliente && (
                      <span style={{
                        fontSize: 12.5, fontWeight: 700, color: PN.MUTED,
                        fontVariantNumeric:'tabular-nums', flexShrink: 0,
                        background:'#F4F5F7', border:`1px solid ${PN.BORDER_SOFT}`,
                        padding:'1px 7px', borderRadius: 7,
                      }}>{o.codice}</span>
                    )}
                  </span>
                  <span style={{display:'flex', alignItems:'center', gap: 7, marginTop: 3, minWidth: 0}}>
                    <span style={{
                      fontSize: 12, fontWeight: 800, letterSpacing: 0.3, textTransform:'uppercase',
                      padding:'2px 8px', borderRadius: 999,
                      background: canale.bg, color: canale.fg,
                    }}>{canale.label}</span>
                    <span style={{fontSize: 14, color: PN.MUTED, fontVariantNumeric:'tabular-nums'}}>
                      {o.ritiro} · {nItems} {nItems === 1 ? 'articolo' : 'articoli'}
                    </span>
                  </span>
                </span>
                <span style={{fontSize: 17.5, fontWeight: 800, color: PN.TEXT, fontVariantNumeric:'tabular-nums', minWidth: 70, textAlign:'right', flexShrink: 0}}>
                  €{o.totale.toFixed(2)}
                </span>
                {/* Qui non si agisce: si apre l'ordine per guardarci dentro */}
                <button
                  onClick={() => onVai(o)}
                  title="Apri il dettaglio di questo ordine"
                  style={{
                    display:'inline-flex', alignItems:'center', gap: 6, flexShrink: 0,
                    padding:'7px 13px', borderRadius: 999,
                    background: 'rgba(255,255,255,0.85)', color: PN.TEXT,
                    border: `1px solid ${PN.BORDER_LIGHT}`,
                    fontSize: 14.5, fontWeight: 700, cursor:'pointer', fontFamily:'inherit',
                    whiteSpace:'nowrap',
                  }}>
                  Vedi ordine
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h13"/><path d="m12.5 5.5 6.5 6.5-6.5 6.5"/></svg>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Dettaglio di un ordine già chiuso — sola lettura: non c'è più niente da
// fare, si viene qui per rispondere a una domanda (cosa c'era dentro,
// quant'era, a che ora è passato).
function SaOrdineDettaglioModal({ ordine, onClose }) {
  const CANALE = {
    byup:   'Byup App',
    webapp: 'Webapp guest',
    banco:  'Cassa',
  };
  React.useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div onClick={onClose} style={{
      position:'absolute', inset: 0, background:'rgba(15,17,21,0.42)',
      display:'grid', placeItems:'center', zIndex: 120, padding: 24,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        ...PN.GLASS_STRONG,
        borderRadius: 22, width: 500, maxWidth:'100%', maxHeight:'100%',
        display:'flex', flexDirection:'column', overflow:'hidden',
      }}>
        <div style={{padding:'20px 22px 14px', display:'flex', alignItems:'flex-start', gap: 10, flexShrink: 0}}>
          <div style={{flex: 1, minWidth: 0}}>
            <div style={{fontSize: 20, fontWeight: 700, color: PN.TEXT, letterSpacing:-0.3, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>
              {ordine.cliente || ordine.codice}
            </div>
            <div style={{display:'flex', alignItems:'center', gap: 8, marginTop: 5, flexWrap:'wrap'}}>
              {ordine.cliente && (
                <span style={{
                  fontSize: 13, fontWeight: 700, color: PN.TEXT, fontVariantNumeric:'tabular-nums',
                  background:'rgba(255,255,255,0.75)', border:`1px solid ${PN.BORDER_SOFT}`,
                  padding:'1px 8px', borderRadius: 7,
                }}>{ordine.codice}</span>
              )}
              <span style={{fontSize: 14.5, color: PN.MUTED, fontVariantNumeric:'tabular-nums'}}>
                {CANALE[ordine.fonte] || 'Cassa'} · ritiro {ordine.ritiro}
              </span>
            </div>
          </div>
          <span style={{
            display:'inline-flex', alignItems:'center', gap: 5, flexShrink: 0,
            fontSize: 13.5, fontWeight: 700, color: PN.MUTED,
            background:'rgba(255,255,255,0.75)', padding:'4px 11px', borderRadius: 999,
          }}>✓ Consegnato</span>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: 8, flexShrink: 0,
            border:'none', background:'rgba(255,255,255,0.75)', color: PN.TEXT,
            cursor:'pointer', display:'grid', placeItems:'center', fontSize: 18, fontFamily:'inherit',
          }}>×</button>
        </div>

        <div className="pn-scroll" style={{flex: 1, minHeight: 0, overflow:'auto', padding:'0 22px 22px'}}>
          <div style={{
            background:'rgba(255,255,255,0.72)', border:`1px solid ${PN.BORDER_SOFT}`,
            borderRadius: 14, padding:'12px 14px', display:'flex', flexDirection:'column', gap: 5,
          }}>
            {ordine.items.map((item, i) => (
              <div key={i} style={{display:'flex', alignItems:'center', gap: 9, fontSize: 15.5}}>
                <span style={{fontWeight: 700, color: PN.MUTED_SOFT, minWidth: 26, flexShrink: 0, fontVariantNumeric:'tabular-nums'}}>{item.qty}×</span>
                <span style={{flex: 1, color: PN.TEXT, fontWeight: 600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{item.nome}</span>
                <span style={{fontWeight: 700, color: PN.TEXT, fontVariantNumeric:'tabular-nums'}}>€{(item.prezzo * item.qty).toFixed(2)}</span>
              </div>
            ))}
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', borderTop:`1px solid ${PN.BORDER_SOFT}`, paddingTop: 9, marginTop: 4}}>
              <span style={{fontSize: 13.5, fontWeight: 700, color: PN.MUTED, textTransform:'uppercase', letterSpacing: 0.4}}>Totale · pagato</span>
              <span style={{fontSize: 19, fontWeight: 800, color: PN.TEXT, fontVariantNumeric:'tabular-nums', letterSpacing:-0.3}}>€{ordine.totale.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
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
              placeholder="es. Servizio, Acqua del rubinetto…"
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

function SaPiattoCard({ p, qtyInCart, customizable, requiresOptions, onQuickAdd, onPersonalizza }) {
  const [imgError, setImgError] = React.useState(false);
  const cardRef = React.useRef(null);
  const cat = SALA_VENDITA_CATS[p.cat] || { color: PN.MUTED, bg: '#F4F5F7' };
  const inCart = qtyInCart > 0;

  // Feedback aggiunta: una miniatura del piatto "vola" dalla card al riepilogo
  // (ghost DOM + Web Animations API), poi il riepilogo fa un piccolo bump.
  const flyToCart = () => {
    const from = cardRef.current?.getBoundingClientRect();
    const to = document.getElementById('sa-cart-panel')?.getBoundingClientRect();
    if (!from || !to || !Element.prototype.animate) return;
    const size = 44;
    const startX = from.left + from.width / 2 - size / 2;
    const startY = from.top + 28;
    const dx = (to.left + 24) - startX;
    const dy = (to.top + 18) - startY;
    const ghost = document.createElement('div');
    ghost.style.cssText =
      `position:fixed; left:${startX}px; top:${startY}px; width:${size}px; height:${size}px;` +
      `border-radius:12px; overflow:hidden; z-index:300; pointer-events:none;` +
      `box-shadow:0 6px 18px rgba(15,17,21,0.25); border:2px solid #fff;` +
      `background:${cat.bg}; color:${cat.color}; display:grid; place-items:center;` +
      `font-size:20px; font-weight:700; font-family:inherit;`;
    if (!imgError && p.img) {
      const img = document.createElement('img');
      img.src = p.img;
      img.style.cssText = 'width:100%; height:100%; object-fit:cover; display:block;';
      ghost.appendChild(img);
    } else {
      ghost.textContent = p.name.charAt(0);
    }
    document.body.appendChild(ghost);
    const anim = ghost.animate([
      { transform: 'translate(0, 0) scale(1)', opacity: 1 },
      { transform: `translate(${dx * 0.55}px, ${dy * 0.55 - 46}px) scale(0.85)`, opacity: 1, offset: 0.55 },
      { transform: `translate(${dx}px, ${dy}px) scale(0.3)`, opacity: 0.15 },
    ], { duration: 560, easing: 'cubic-bezier(0.25, 0.1, 0.3, 1)' });
    anim.onfinish = () => {
      ghost.remove();
      window.dispatchEvent(new CustomEvent('sa-cart-bump'));
    };
  };

  const quickAddConFeedback = () => { flyToCart(); onQuickAdd(); };

  return (
    <div
      ref={cardRef}
      onClick={customizable ? onPersonalizza : quickAddConFeedback}
      title={customizable ? 'Personalizza e aggiungi' : 'Aggiungi al conto'}
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
          <div key={qtyInCart} style={{
            position:'absolute', top: 8, left: 8,
            background: PN.PINK_DARK, color: PN.WHITE,
            padding:'3px 9px', borderRadius: 999,
            fontSize: 15, fontWeight: 700,
            boxShadow: '0 2px 6px rgba(0,0,0,0.18)',
            animation: 'svCartBump 260ms ease-out',
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

        <div style={{fontSize: 18, fontWeight: 700, color: PN.TEXT, marginTop: 6}}>€{p.price.toFixed(2)}</div>
        {/* + Aggiungi: aggiunta rapida su OGNI card, a tutta larghezza; il click
            sul piatto personalizza (se personalizzabile) o aggiunge direttamente.
            Con opzioni obbligatorie apre il popup di personalizzazione (senza
            fly-to-cart: non viene aggiunto nulla finché non si conferma). */}
        <button
          onClick={(e) => { e.stopPropagation(); if (requiresOptions) { onPersonalizza(); return; } quickAddConFeedback(); }}
          title={requiresOptions ? 'Scegli le opzioni e aggiungi' : 'Aggiungi al conto'}
          style={{
            marginTop: 9, width:'100%', height: 38, borderRadius: 10,
            background: PN.BTN_NEUTRAL, color: PN.TEXT, border:`1px solid ${PN.BORDER_LIGHT}`,
            fontSize: 16.5, fontWeight: 700, cursor:'pointer',
            fontFamily:'inherit', display:'inline-flex', alignItems:'center', justifyContent:'center', gap: 6,
            boxShadow: `${PN.INSET_HIGHLIGHT}, 0 1px 2px rgba(15,17,21,0.04)`,
            transition:'background 150ms ease-out, border-color 150ms ease-out',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#F4F5F7'; e.currentTarget.style.borderColor = '#9CA3AF'; }}
          onMouseLeave={e => { e.currentTarget.style.background = PN.BTN_NEUTRAL; e.currentTarget.style.borderColor = PN.BORDER_LIGHT; }}
        >
          <span style={{fontSize: 19, lineHeight: 1}}>+</span> Aggiungi
        </button>
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
              <div style={{fontSize: 17, fontWeight: 700, color: PN.TEXT, marginBottom: 8}}>Extra</div>
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
            <span>{initialMods != null || initialQty ? 'Aggiorna' : 'Aggiungi al conto'}</span>
            <span style={{fontSize: 17.5, fontWeight: 700}}>€{(lineTotal * qty).toFixed(2)}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Carrello

function SaCartPanel({ lines, takeaway, asportoOn = true, onToggleTakeaway, cliente, onCliente, total, totQty, onInc, onDec, onRemove, onEdit, onChangeName, onChangePrice, onClear, onIncassa }) {
  window.SALA_VENDITA_CLEAR = onClear;
  // Conferma prima di svuotare: il conto in corso è lavoro, non si butta per un click.
  const [clearConfirm, setClearConfirm] = React.useState(false);
  // Bump dell'icona quando la miniatura del piatto "atterra" (evento da SaPiattoCard)
  const [bump, setBump] = React.useState(0);
  React.useEffect(() => {
    const b = () => setBump(x => x + 1);
    window.addEventListener('sa-cart-bump', b);
    return () => window.removeEventListener('sa-cart-bump', b);
  }, []);
  return (
    <aside id="sa-cart-panel" style={{
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
        <span key={bump} style={{
          width: 28, height: 28, borderRadius: 8, background: PN.PINK_SOFT,
          display:'grid', placeItems:'center', color: PN.PINK_DARK,
          animation: bump ? 'svCartBump 320ms ease-out' : 'none',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18l-2 13H5L3 6Z"/><path d="M8 6V4a4 4 0 0 1 8 0v2"/></svg>
        </span>
        <div style={{flex: 1, minWidth: 0}}>
          <div style={{fontSize: 18, fontWeight: 700, color: PN.TEXT, lineHeight: 1.2, whiteSpace:'nowrap'}}>Ordine</div>
          <div style={{fontSize: 15, color: PN.MUTED, marginTop: 1, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{totQty} {totQty === 1 ? 'articolo' : 'articoli'}</div>
        </div>
        {/* Toggle asporto — c'è solo se il locale fa asporto. Acceso diventa
            la pillola nera piena del mockup.
            L'etichetta dice sempre dove ti porta il tocco, non dove sei: acceso
            è già tutto il pannello a dirlo (vuoto d'asporto, riga cliente,
            metodo di ritiro), quindi il bottone offre la via di ritorno. */}
        {asportoOn && <button
          onClick={onToggleTakeaway}
          title={takeaway ? 'Ordine da asporto. Tocca per riportarlo a vendita diretta' : 'Segna l\'ordine come da asporto. Se spento resta al banco'}
          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.06)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(15, 17, 21, 0.14)'; if (!takeaway) { e.currentTarget.style.background = '#F4F5F7'; e.currentTarget.style.borderColor = PN.TEXT; e.currentTarget.style.color = PN.TEXT; } }}
          onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; e.currentTarget.style.background = takeaway ? PN.TEXT : 'transparent'; e.currentTarget.style.borderColor = takeaway ? PN.TEXT : PN.BORDER; e.currentTarget.style.color = takeaway ? PN.WHITE : PN.MUTED; }}
          onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.94)'; }}
          onMouseUp={e => { e.currentTarget.style.transform = 'scale(1.06)'; }}
          style={{
            display:'inline-flex', alignItems:'center', gap: 6,
            padding: '6px 12px', borderRadius: 10,
            border: `1.5px solid ${takeaway ? PN.TEXT : PN.BORDER}`,
            background: takeaway ? PN.TEXT : 'transparent',
            color: takeaway ? PN.WHITE : PN.MUTED,
            fontSize: 15, fontWeight: 700, cursor:'pointer', fontFamily:'inherit',
            whiteSpace:'nowrap',
            transition:'background .12s, color .12s, border-color .12s, transform 150ms cubic-bezier(0.34, 1.45, 0.64, 1), box-shadow 150ms ease',
          }}>
          {takeaway ? (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9h18l-1.5-4.5A2 2 0 0 0 17.6 3H6.4a2 2 0 0 0-1.9 1.5L3 9Z"/><path d="M4 9v10a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9"/>
            </svg>
          ) : (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18l-2 13H5L3 6Z"/><path d="M8 6V4a4 4 0 0 1 8 0v2"/>
            </svg>
          )}
          {takeaway ? 'Vai a vendita diretta' : 'Vai ad asporto'}
        </button>}
        {lines.length > 0 && (
          <button onClick={() => setClearConfirm(true)} title="Rimuovi tutti gli articoli dal conto" style={{
            width: 32, height: 32, borderRadius: 9, flexShrink: 0,
            background:'transparent', color: PN.MUTED, border: `1px solid ${PN.BORDER}`,
            cursor:'pointer', fontFamily:'inherit',
            display:'grid', placeItems:'center',
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
          </button>
        )}
      </div>

      {/* Popup conferma svuotamento conto */}
      {clearConfirm && (
        <div onClick={() => setClearConfirm(false)} style={{
          position:'absolute', inset: 0, background:'rgba(15,17,21,0.42)',
          display:'grid', placeItems:'center', zIndex: 100, padding: 20,
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            ...PN.GLASS_STRONG,
            borderRadius: 20, width: 380, maxWidth:'100%',
            padding: '22px 22px 20px',
            display:'flex', flexDirection:'column', gap: 16,
          }}>
            <div style={{display:'flex', alignItems:'flex-start', gap: 12}}>
              <div style={{
                width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                background: '#FEE2E2', color: '#DC2626',
                display:'grid', placeItems:'center',
              }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18 M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6 M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </div>
              <div style={{flex: 1}}>
                <div style={{fontSize: 17, fontWeight: 700, color: PN.TEXT}}>Rimuovere tutto?</div>
                <div style={{fontSize: 14.5, color: PN.MUTED, marginTop: 3, lineHeight: 1.5}}>
                  Tutti gli articoli verranno tolti dall'ordine in corso.
                </div>
              </div>
            </div>
            <div style={{display:'flex', gap: 8}}>
              <button
                onClick={() => setClearConfirm(false)}
                style={{
                  flex: 1, padding: '11px 14px', borderRadius: 999,
                  background: 'rgba(255,255,255,0.75)', color: PN.TEXT,
                  border: '1px solid rgba(15,17,21,0.12)',
                  fontSize: 14.5, fontWeight: 600, cursor:'pointer', fontFamily:'inherit',
                }}>
                Annulla
              </button>
              <button
                onClick={() => { setClearConfirm(false); onClear(); }}
                style={{
                  flex: 1, padding: '11px 14px', borderRadius: 999,
                  background: '#DC2626', color: '#fff',
                  border: '1px solid rgba(153,27,27,0.5)',
                  fontSize: 14.5, fontWeight: 700, cursor:'pointer', fontFamily:'inherit',
                }}>
                Rimuovi tutto
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Lines */}
      <div className="pn-scroll" style={{flex: 1, overflow:'auto', padding: '12px 14px'}}>
        {lines.length === 0 ? (
          takeaway ? (
            /* Vuoto in asporto: il vuoto qui non è un errore, è il momento in
               cui si prende la comanda al telefono o al banco — quindi il testo
               ricorda anche cliente e orario, che sono già compilabili sopra. */
            <div style={{
              textAlign:'center', padding: '32px 22px', minHeight:'100%',
              display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
              boxSizing:'border-box',
            }}>
              <div style={{
                width: 76, height: 76, borderRadius: '50%', marginBottom: 16,
                background: PN.PINK_BG_SOFT, color: PN.PINK,
                display:'grid', placeItems:'center',
              }}>
                <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18l-2 13H5L3 6Z"/><path d="M8 6V4a4 4 0 0 1 8 0v2"/></svg>
              </div>
              <div style={{fontSize: 18, fontWeight: 700, color: PN.TEXT, marginBottom: 6}}>Ordine da asporto vuoto</div>
              <div style={{fontSize: 15.5, color: PN.MUTED, lineHeight: 1.55, maxWidth: 320}}>
                Tocca <strong style={{color: PN.PINK, fontWeight: 700}}>+ Aggiungi</strong> per inserire prodotti da preparare per il ritiro.
                Puoi anche assegnare un cliente prima di confermare.
              </div>
            </div>
          ) : (
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
            <div style={{fontSize: 15.5, color: PN.MUTED, lineHeight: 1.5}}>Tocca <strong>+ Aggiungi</strong> per aggiungere un piatto all'ordine,<br/>o clicca sul piatto per personalizzarlo prima di procedere</div>
          </div>
          )
        ) : (
          <div style={{display:'flex', flexDirection:'column', gap: 10}}>
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

      {/* Cliente dell'asporto — chi ritira. Sta in fondo, appoggiato al
          totale: è l'ultima cosa che si compila prima di confermare, non la
          prima che si guarda quando si batte l'ordine. */}
      {takeaway && (
        <div style={{padding: '0 14px 12px'}}>
          <SaClienteBar cliente={cliente} onChange={onCliente}/>
        </div>
      )}

      {/* Totale + pagamento */}
      <div style={{
        padding: '12px 18px 14px',
        borderTop: `1px solid ${PN.BORDER_SOFT}`,
        background: PN.WHITE,
      }}>
        {takeaway && lines.length > 0 ? (
          <>
            {/* Asporto pieno: riepilogo con lo scontrino e CTA rossa brand */}
            <div style={{display:'flex', alignItems:'center', gap: 12, paddingBottom: 12}}>
              <span style={{
                width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                background: PN.PINK_BG_SOFT, color: PN.PINK,
                display:'grid', placeItems:'center',
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="13" y2="17"/></svg>
              </span>
              <span style={{flex: 1, minWidth: 0}}>
                <span style={{display:'block', fontSize: 17.5, fontWeight: 700, color: PN.TEXT}}>Totale ordine</span>
                <span style={{display:'block', fontSize: 14.5, color: PN.MUTED, marginTop: 1}}>{totQty} {totQty === 1 ? 'articolo' : 'articoli'}</span>
              </span>
              <span style={{fontSize: 22, fontWeight: 800, color: PN.TEXT, fontVariantNumeric:'tabular-nums'}}>€{total.toFixed(2)}</span>
            </div>
            <button
              onClick={onIncassa}
              style={{
                width:'100%', padding: '14px 18px', borderRadius: 14,
                background: PN.BTN_BRAND, color: '#fff', border: 'none',
                fontSize: 17.5, fontWeight: 700, cursor:'pointer', fontFamily:'inherit',
                display:'flex', alignItems:'center', justifyContent:'space-between', gap: 10,
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.30), 0 8px 20px -8px rgba(255,90,95,0.55)',
                transition: 'box-shadow 180ms ease-out, filter 150ms ease-out',
              }}>
              <span>Procedi al pagamento</span>
              <span style={{fontVariantNumeric:'tabular-nums'}}>€{total.toFixed(2)}</span>
            </button>
          </>
        ) : (
          <>
            <div style={{
              display:'flex', justifyContent:'space-between',
              fontSize: 20, fontWeight: 700, color: PN.TEXT,
              paddingBottom: takeaway ? 4 : 12,
            }}>
              <span>Totale</span><span>€{total.toFixed(2)}</span>
            </div>
            {takeaway && (
              <div style={{
                display:'flex', alignItems:'center', gap: 6,
                fontSize: 14.5, color: PN.MUTED, paddingBottom: 8,
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9h18l-1.5-4.5A2 2 0 0 0 17.6 3H6.4a2 2 0 0 0-1.9 1.5L3 9Z"/><path d="M4 9v10a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9"/><path d="M9 20v-6h6v6"/></svg>
                Metodo: ritiro in sede
              </div>
            )}

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
                <span style={{display:'inline-flex', alignItems:'center', gap: 8}}>
                  {takeaway && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18l-2 13H5L3 6Z"/><path d="M8 6V4a4 4 0 0 1 8 0v2"/></svg>
                  )}
                  Procedi al pagamento
                </span>
                <span>€{total.toFixed(2)}</span>
              </button>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}

// Cliente dell'asporto: solo un nome, scritto a mano — chi ritira si annuncia
// col nome al banco, non serve un'anagrafica. La CTA apre il campo, Invio
// (o Conferma) assegna, Esc annulla.
function SaClienteBar({ cliente, onChange }) {
  const [editing, setEditing] = React.useState(false);
  const [nome, setNome] = React.useState('');
  const start = () => { setNome(cliente || ''); setEditing(true); };
  const commit = () => { setEditing(false); onChange(nome.trim() || null); };
  const cancel = () => setEditing(false);

  const ctaStyle = {
    padding: '8px 16px', borderRadius: 999, flexShrink: 0,
    background: PN.TEXT, color: PN.WHITE, border: 'none',
    fontSize: 14.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
    whiteSpace: 'nowrap',
  };

  return (
    <div style={{
      border: `1px solid ${PN.BORDER}`, borderRadius: 12,
      background: PN.WHITE,
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8)',
      padding: '10px 12px',
      display: 'flex', alignItems: 'center', gap: 10,
    }}>
      <span style={{
        width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
        background: cliente ? PN.PINK_BG_SOFT : PN.WHITE_FROST,
        color: cliente ? PN.PINK : PN.MUTED_SOFT,
        display: 'grid', placeItems: 'center',
      }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="3.4"/><path d="M5 20c0-3.6 3.1-5.6 7-5.6s7 2 7 5.6"/></svg>
      </span>
      {!editing ? (
        <>
          <span style={{flex: 1, minWidth: 0}}>
            <span style={{display:'block', fontSize: 15, fontWeight: 700, color: PN.TEXT, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>
              {cliente || 'Cliente non assegnato'}
            </span>
            <span style={{display:'block', fontSize: 13, color: PN.MUTED_SOFT, marginTop: 1}}>
              {cliente ? 'Ritira quest\'ordine' : 'Chi viene a ritirare?'}
            </span>
          </span>
          {cliente && (
            <button
              onClick={() => onChange(null)}
              title="Togli il cliente dall'ordine"
              style={{
                padding: '8px 12px', borderRadius: 999, flexShrink: 0,
                background: 'transparent', color: PN.MUTED,
                border: `1px solid ${PN.BORDER}`,
                fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                whiteSpace: 'nowrap',
              }}>Rimuovi</button>
          )}
          <button
            onClick={start}
            title={cliente ? 'Cambia il cliente dell\'ordine' : 'Assegna un cliente all\'ordine'}
            style={ctaStyle}>{cliente ? 'Cambia' : 'Assegna cliente'}</button>
        </>
      ) : (
        <>
          <input
            autoFocus
            value={nome} onChange={e => setNome(e.target.value)}
            placeholder="Nome cliente"
            onBlur={commit}
            onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') cancel(); }}
            style={{
              flex: 1, minWidth: 0,
              fontFamily: 'inherit', fontSize: 15, fontWeight: 600, color: PN.TEXT,
              background: 'transparent', border: 'none',
              borderBottom: `1.5px solid ${PN.TEXT}`, outline: 'none', padding: '0 1px',
            }}/>
          {/* onMouseDown: la conferma deve battere il blur dell'input */}
          <button onMouseDown={e => { e.preventDefault(); commit(); }} title="Assegna questo nome" style={ctaStyle}>Conferma</button>
        </>
      )}
    </div>
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
    fontSize:18, fontWeight:700, color: PN.TEXT, padding:'0 1px',
  };

  // Mods in riga sotto il nome ("Media · Filetto"): le scelte in grigio, le
  // rimozioni in rosso, gli extra in verde — il colore È l'informazione, il
  // separatore è neutro così la riga non diventa una collana di puntini scuri.
  const modParts = !hasMods ? [] : [
    ...Object.entries(mods.variants || {}).map(([g, v]) => ({ key: `v-${g}`, text: v, color: PN.MUTED })),
    ...(mods.removed || []).map(r => ({ key: `r-${r}`, text: `− ${r}`, color: '#B91C1C' })),
    ...Object.entries(mods.extras || {}).map(([n, q]) => ({ key: `e-${n}`, text: `+ ${q > 1 ? `${q}× ` : ''}${n}`, color: PN.GREEN })),
  ];

  return (
    <div style={{
      display:'flex', gap: 13,
      padding: 12, borderRadius: 14,
      background: PN.WHITE,
      border: `1px solid ${PN.BORDER_HAIR}`,
      boxShadow: PN.CARD_SHADOW,
    }}>
      <div style={{
        width: 96, height: 96, borderRadius: 12, flexShrink: 0,
        background: cat.bg, overflow:'hidden',
        display:'grid', placeItems:'center', alignSelf:'flex-start',
      }}>
        {piatto.img
          ? <img src={piatto.img} alt="" style={{width:'100%', height:'100%', objectFit:'cover'}}/>
          : <span style={{fontSize: 40}}>{piatto.emoji || '🍽'}</span>}
      </div>
      <div style={{flex: 1, minWidth: 0, display:'flex', flexDirection:'column'}}>
        <div style={{display:'flex', alignItems:'baseline', gap: 8}}>
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
              style={{fontSize: 18, fontWeight: 700, color: PN.TEXT, flex: 1, minWidth: 0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', cursor:'pointer', userSelect:'none', lineHeight: 1.3}}
            >{displayName}</span>
          )}
          {editingPrice ? (
            <input
              value={priceVal} onChange={e => setPriceVal(e.target.value)}
              onBlur={commitPrice}
              onKeyDown={e => { if (e.key==='Enter') commitPrice(); if (e.key==='Escape') { setPriceVal(lineTotal.toFixed(2)); setEditingPrice(false); } }}
              autoFocus
              inputMode="decimal"
              style={{...inlineInputStyle, fontSize: 19, width: 76, textAlign:'right', fontVariantNumeric:'tabular-nums'}}
            />
          ) : (
            <span
              onClick={() => setEditingPrice(true)}
              title="Clicca per modificare il prezzo"
              style={{fontSize: 19, fontWeight: 700, color: PN.TEXT, cursor:'text', fontVariantNumeric:'tabular-nums', whiteSpace:'nowrap'}}
            >€{(lineTotal * qty).toFixed(2)}</span>
          )}
        </div>
        {modParts.length > 0 && (
          <div style={{fontSize: 15.5, fontWeight: 500, marginTop: 2, lineHeight: 1.4, overflow:'hidden', textOverflow:'ellipsis'}}>
            {modParts.map((p, i) => (
              <React.Fragment key={p.key}>
                {i > 0 && <span style={{color: PN.MUTED_LIGHT}}> · </span>}
                <span style={{color: p.color}}>{p.text}</span>
              </React.Fragment>
            ))}
          </div>
        )}
        <div style={{display:'flex', alignItems:'center', gap: 11, marginTop: 8}}>
          <button onClick={onDec} title={qty <= 1 ? 'Rimuovi dall\'ordine' : 'Diminuisci quantità'} style={{
            width: 30, height: 30, borderRadius:'50%',
            background: PN.PINK_BG_SOFT, color: PN.PINK, border:'none',
            fontSize: 18, fontWeight: 700, cursor:'pointer', fontFamily:'inherit',
            display:'grid', placeItems:'center', lineHeight: 1,
          }}>−</button>
          <span style={{fontSize: 18, fontWeight: 700, minWidth: 18, textAlign:'center'}}>{qty}</span>
          <button onClick={onInc} title="Aumenta quantità" style={{
            width: 30, height: 30, borderRadius:'50%',
            background: PN.PINK_BG_SOFT, color: PN.PINK, border:'none',
            fontSize: 18, fontWeight: 700, cursor:'pointer', fontFamily:'inherit',
            display:'grid', placeItems:'center', lineHeight: 1,
          }}>+</button>
        </div>
        <div style={{display:'flex', alignItems:'flex-end', gap: 8, marginTop: 7}}>
          {/* Stesso slot per tutti: personalizza se il piatto ha opzioni,
              rinomina se è una riga semplice — la card non cambia forma. */}
          <button
            onClick={() => isCustomizable ? onEdit() : setEditingName(true)}
            title={isCustomizable ? 'Modifica le opzioni del piatto' : 'Modifica il nome della riga'}
            style={{
              display:'inline-flex', alignItems:'center', gap: 7,
              background:'transparent', border:'none', padding: '4px 0',
              color: PN.MUTED, fontSize: 15.5, fontWeight: 600,
              cursor:'pointer', fontFamily:'inherit',
            }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
            {isCustomizable ? 'Personalizza' : 'Rinomina'}
          </button>
          <span style={{flex: 1}}/>
          <button onClick={onRemove} title="Rimuovi dall'ordine" style={{
            width: 34, height: 34, borderRadius: 10, flexShrink: 0,
            background: PN.WHITE_FROST, color: PN.MUTED,
            border: `1px solid ${PN.BORDER_HAIR}`,
            cursor:'pointer', fontFamily:'inherit',
            display:'grid', placeItems:'center',
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Finestra Incassa — lingua e pezzi propri.
// Gli importi qui si scrivono all'italiana (14,00): è la cifra che l'operatore
// legge ad alta voce al cliente, non un numero da tabella.

const SVI_INK    = '#0F1729';
const SVI_MUTED  = '#7A8394';
const SVI_BORDER = '#E7EAEF';
const SVI_CORAL  = PN.PINK;
const SVI_TINT   = '#FFF3F2';
const SVI_GREEN  = '#16A34A';
const SVI_LABEL  = {
  fontSize: 13.5, fontWeight: 700, color: SVI_MUTED,
  letterSpacing: 0.7, textTransform: 'uppercase', marginBottom: 11,
};

const svEur = (n, tondo) => '€' + (tondo && Math.abs(n % 1) < 0.005
  ? String(Math.round(n))
  : (n || 0).toFixed(2).replace('.', ','));

// Tagli di cortesia: le banconote che il cliente può realisticamente porgere
// per quella cifra. Niente "esatto" — il campo ci nasce già sopra.
const svTagli = (residuo) => {
  const out = [];
  for (const s of [5, 10, 20, 50, 100]) {
    const v = Math.ceil(residuo / s) * s;
    if (v <= residuo + 0.004 || out.includes(v)) continue;
    out.push(v);
    if (out.length === 3) break;
  }
  return out;
};

// Interruttore da testata: piccolo, in disparte, acceso quando conta.
function SvPillola({ active, onClick, title, icon, label }) {
  return (
    <button onClick={onClick} title={title} style={{
      display: 'inline-flex', alignItems: 'center', gap: 6, flexShrink: 0,
      padding: '8px 12px', borderRadius: 999,
      background: active ? SVI_TINT : '#fff',
      border: `1px solid ${active ? SVI_CORAL : SVI_BORDER}`,
      color: active ? SVI_CORAL : SVI_MUTED,
      fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
      whiteSpace: 'nowrap',
      transition: 'background 150ms ease-out, border-color 150ms ease-out, color 150ms ease-out',
    }}>
      {icon}
      {label}
    </button>
  );
}

function SvMetodoCard({ active, onClick, label, icon }) {
  return (
    <button onClick={onClick} style={{
      position: 'relative',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16,
      padding: '26px 18px', borderRadius: 16,
      background: active ? SVI_TINT : '#fff',
      border: `1.5px solid ${active ? SVI_CORAL : SVI_BORDER}`,
      color: active ? SVI_CORAL : SVI_INK,
      fontSize: 21, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
      transition: 'background 150ms ease-out, border-color 150ms ease-out, color 150ms ease-out',
    }}>
      {active && (
        <span style={{
          position: 'absolute', top: 12, right: 12,
          width: 26, height: 26, borderRadius: '50%',
          background: SVI_CORAL, color: '#fff',
          display: 'grid', placeItems: 'center',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7"/></svg>
        </span>
      )}
      {icon}
      {label}
    </button>
  );
}

const SvIcoPos = () => (
  <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="2" width="14" height="20" rx="2.5"/>
    <rect x="7.5" y="4.5" width="9" height="4.5" rx="1"/>
    <circle cx="9" cy="12.5" r="0.9" fill="currentColor" stroke="none"/><circle cx="12" cy="12.5" r="0.9" fill="currentColor" stroke="none"/><circle cx="15" cy="12.5" r="0.9" fill="currentColor" stroke="none"/>
    <circle cx="9" cy="15.5" r="0.9" fill="currentColor" stroke="none"/><circle cx="12" cy="15.5" r="0.9" fill="currentColor" stroke="none"/><circle cx="15" cy="15.5" r="0.9" fill="currentColor" stroke="none"/>
    <circle cx="9" cy="18.5" r="0.9" fill="currentColor" stroke="none"/><circle cx="12" cy="18.5" r="0.9" fill="currentColor" stroke="none"/><circle cx="15" cy="18.5" r="0.9" fill="currentColor" stroke="none"/>
  </svg>
);

const SvIcoBanconota = () => (
  <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="6" width="20" height="12" rx="2"/>
    <circle cx="8.5" cy="12" r="2.6"/>
    <path d="M7.4 12h2.2M7.6 10.9h1.8"/>
    <circle cx="17.5" cy="12" r="0.9" fill="currentColor" stroke="none"/>
  </svg>
);

const SvIcoMonete = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={SVI_CORAL} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="12" cy="6" rx="7.5" ry="3"/>
    <path d="M4.5 6v4.5c0 1.66 3.36 3 7.5 3s7.5-1.34 7.5-3V6"/>
    <path d="M4.5 10.5V15c0 1.66 3.36 3 7.5 3s7.5-1.34 7.5-3v-4.5"/>
  </svg>
);

// ─────────────────────────────────────────────────────────────────────────────
// Modale incasso semplificato (solo totale + pagamento)

function SaIncassaModal({ open, total: subtotale, onClose, onConfirm }) {
  const [method, setMethod] = React.useState('contanti');
  // Incasso a più riprese: il residuo è quello che manca, non il totale. Chi
  // paga metà in contanti e metà col POS non sceglie un metodo "misto" — fa
  // due incassi, e la finestra tiene il conto.
  // Gli acconti già presi su questo conto, in ordine di arrivo: non un totale
  // ma le righe, perché la domanda al banco è "cosa mi ha già dato?".
  const [pagamenti, setPagamenti] = React.useState([]);
  const [pagamentiOpen, setPagamentiOpen] = React.useState(false);
  const [importoTxt, setImporto] = React.useState('');
  const importoRef = React.useRef(null);
  const [fattura, setFattura] = React.useState(false);
  const [pay, setPay] = React.useState({ contanti: '', carta: '' });
  const [done, setDone] = React.useState(false);
  const [adjust, setAdjust] = React.useState(null);
  const [adjustOpen, setAdjustOpen] = React.useState(false);
  const [confirmedTotal, setConfirmedTotal] = React.useState(0);
  const [confirmedPay, setConfirmedPay] = React.useState({ contanti: 0, carta: 0 });
  // Ordine creato dal commit: lo restituisce onConfirm. Null quando l'incasso
  // non crea un ordine nuovo (es. il "Salda ora" di un asporto già esistente).
  const [ordine, setOrdine] = React.useState(null);
  // Pagamento con carta in volo su Byup Staff. Stessa coda della finestra di
  // saldo in Sala, ma qui l'attesa è BLOCCANTE: al tavolo il conto è attaccato
  // a un tavolo che resta, quindi la cassa può chiudere e tornare a lavorare;
  // al banco il cliente è davanti, il carrello vive solo qui dentro e l'ordine
  // non esiste ancora. Lasciar chiudere significherebbe due vendite in volo su
  // una cassa sola, e un pagamento senza più niente a cui attaccarsi.
  const [attesa, setAttesa] = React.useState(null); // { inviato } | null
  const [, setAttesaTick] = React.useState(0);

  React.useEffect(() => {
    if (open) {
      setMethod('contanti');
      setPagamenti([]);
      setPagamentiOpen(false);
      setImporto('');
      setFattura(false);
      setPay({ contanti: '', carta: '' });
      setDone(false);
      setOrdine(null);
      setAdjust(null);
      setAdjustOpen(false);
      setAttesa(null);
    }
  }, [open]);

  // Il contatore che scorre e il finto esito vivono qui dentro, non fuori come
  // in Sala: lì la finestra può chiudersi e il pagamento le sopravvive, qui la
  // finestra non si chiude finché non è finita, quindi può possederne il ciclo.
  React.useEffect(() => {
    if (!attesa) return;
    const id = setInterval(() => {
      if (Date.now() - attesa.inviato >= PAY_FINE) registraIncasso(attesa.importo, 'carta');
      else setAttesaTick(t => t + 1);
    }, 400);
    return () => clearInterval(id);
  }, [attesa]);

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

  const incassato = pagamenti.reduce((t, p) => t + p.importo, 0);
  const incassatoCarta = pagamenti.reduce((t, p) => t + (p.come === 'carta' ? p.importo : 0), 0);
  const residuo = Math.max(0, finalTotal - incassato);
  // Il campo parte sul residuo: il caso normale è che paghi tutto, e chi paga
  // con un taglio più grande (o addebita solo una parte sulla carta) lo scrive
  // o tocca un pulsante.
  const importo = parseFloat((importoTxt || '').replace(',', '.')) || 0;
  // Quello che entra davvero in cassa: sopra il residuo non si incassa, si
  // rende. Sulla carta l'eccedenza non esiste — si addebita e basta.
  const preso = Math.min(importo, residuo);
  const resto = method === 'carta' ? 0 : Math.max(0, importo - residuo);
  const residuoDopo = Math.max(0, residuo - preso);
  const parziale = preso > 0 && preso < residuo - 0.004;
  // Le scelte rapide sotto "Seleziona importo": col contante sono banconote
  // (sopra il residuo, il resto lo fa la cassa), col POS frazioni del conto
  // (sulla carta non si addebita più del dovuto).
  const scelte = method === 'carta'
    ? [
        { label: 'Intero', val: residuo },
        { label: 'Metà',   val: Math.round(residuo * 50) / 100 },
      ]
    : [
        { label: 'Esatto', val: residuo },
        ...svTagli(residuo).map(v => ({ label: svEur(v, true), val: v })),
      ];

  // Il campo si riallinea al residuo quando cambia la partita: apertura,
  // metodo, acconto incassato, sconto applicato.
  React.useEffect(() => {
    if (!open) return;
    setImporto(residuo > 0 ? residuo.toFixed(2).replace('.', ',') : '');
  }, [open, method, pagamenti.length, finalTotal]);

  // Tutti gli hook sono passati: solo ora si può uscire senza disegnare nulla.
  if (!open) return null;

  function chooseMethod(m) { setMethod(m); }

  // Un incasso registrato: se copre il residuo la vendita si chiude, se no
  // resta aperta e il residuo scende — l'acconto è una riga, non un'altra
  // finestra.
  function registraIncasso(val, come) {
    const quota = Math.min(val, residuo);
    if (quota < residuo - 0.004) {
      const now = new Date();
      setPagamenti(ps => [...ps, {
        id: `p${ps.length + 1}`, come, importo: quota,
        ora: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
      }]);
      return;
    }
    chiudiPagamento(come, quota);
  }

  // Unico punto in cui l'incasso si chiude e l'ordine nasce: ci passano sia la
  // conferma diretta (contanti, misto) sia il ritorno del pagamento con carta.
  function chiudiPagamento(come, quota) {
    const ultima = quota != null ? quota : residuo;
    setConfirmedTotal(finalTotal);
    setConfirmedPay({
      contanti: (incassato - incassatoCarta) + (come === 'carta' ? 0 : ultima),
      carta: incassatoCarta + (come === 'carta' ? ultima : 0),
    });
    setOrdine(onConfirm ? onConfirm(finalTotal) : null);
    setAttesa(null);
    setDone(true);
  }

  return (
    // Con un pagamento in volo il click fuori non chiude: sarebbe l'unico modo
    // di uscire per sbaglio da una transazione che il cliente sta pagando.
    <div onClick={attesa ? undefined : onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(10,14,24,0.62)',
      backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
      display: 'grid', placeItems: 'center', zIndex: 200, padding: 24,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: '#fff',
        borderRadius: 26,
        width: 620, maxWidth: '100%', maxHeight: '100%',
        boxShadow: '0 32px 80px rgba(5,10,25,0.45)',
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
            <div style={{ fontSize: 25, fontWeight: 800, color: SVI_INK, marginBottom: 4, letterSpacing: -0.4 }}>
              Pagamento incassato
            </div>
            <div style={{ fontSize: 36, fontWeight: 800, color: SVI_INK, marginBottom: 6, letterSpacing: -1, fontVariantNumeric: 'tabular-nums' }}>
              {svEur(confirmedTotal)}
            </div>
            <div style={{ fontSize: 17, color: SVI_MUTED, marginBottom: ordine ? 16 : 24 }}>
              {confirmedPay.contanti > 0 && confirmedPay.carta > 0
                ? `${svEur(confirmedPay.contanti)} contanti + ${svEur(confirmedPay.carta)} sul POS`
                : confirmedPay.carta > 0 ? 'Smart POS' : 'Contanti'}
              {fattura ? ' · fattura emessa' : ''}
            </div>
            {/* Conferma della creazione: è l'unico punto in cui l'operatore vede
                che l'ordine esiste ed è partito. Senza, l'incasso sembra
                chiudere la transazione e basta. */}
            {ordine && (
              <div style={{
                width: '100%', marginBottom: 24,
                padding: ordine.codiceRitiro ? '12px 16px' : '10px 16px',
                borderRadius: 12, background: '#F5F6F8',
                border: `1px solid ${SVI_BORDER}`,
              }}>
                <div style={{ fontSize: 17, color: '#0F1115', fontWeight: 600 }}>
                  Ordine <span style={{ fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>{ordine.codice}</span> creato
                </div>
                {/* Asporto: il codice va dettato al cliente, quindi grande e leggibile */}
                {ordine.codiceRitiro && (
                  <div style={{
                    marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(15,17,21,0.08)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                  }}>
                    <span style={{ fontSize: 14.5, fontWeight: 700, color: '#6B7280', letterSpacing: 0.4, textTransform: 'uppercase' }}>
                      Codice ritiro
                    </span>
                    <span style={{
                      fontSize: 24, fontWeight: 800, color: '#0F1115',
                      letterSpacing: 3, fontVariantNumeric: 'tabular-nums',
                    }}>{ordine.codiceRitiro}</span>
                  </div>
                )}
              </div>
            )}
            <button onClick={onClose} style={{
              width: '100%', padding: '15px 24px',
              background: SVI_GREEN, color: '#fff',
              border: 'none', borderRadius: 14, fontSize: 18, fontWeight: 700,
              boxShadow: '0 8px 20px -8px rgba(22,163,74,0.55)',
              cursor: 'pointer', fontFamily: 'inherit',
            }}
            onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.06)'; }}
            onMouseLeave={e => { e.currentTarget.style.filter = 'none'; }}>Chiudi</button>
          </div>
        ) : attesa ? (
          <SvAttesaPagamento
            total={attesa.importo != null ? attesa.importo : finalTotal}
            elapsed={Date.now() - attesa.inviato}
            onRitira={() => setAttesa(null)}/>
        ) : (
          <>
            {/* Testata: il nome della cosa che stai facendo, grande. A destra i
                due interruttori che NON sono la vendita — correggere l'importo
                ed emettere fattura invece della ricevuta: si usano di rado,
                quindi stanno piccoli e in disparte, non in mezzo al flusso. */}
            <div style={{padding: '24px 28px 0', display: 'flex', alignItems: 'center', gap: 8}}>
              <div style={{
                flex: 1, fontSize: 34, fontWeight: 800, letterSpacing: -0.8,
                color: SVI_INK, lineHeight: 1,
              }}>INCASSA</div>
              <SvPillola
                active={adjustOpen || !!adjust}
                onClick={() => setAdjustOpen(o => !o)}
                title="Applica uno sconto o arrotonda l'importo"
                icon={<span style={{fontSize: 13, fontWeight: 800, lineHeight: 1}}>%</span>}
                label={adjust ? svEur(Math.abs(adjustDelta)) : 'Sconto'}/>
              <SvPillola
                active={fattura}
                onClick={() => setFattura(f => !f)}
                title="Emetti fattura invece della ricevuta"
                icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9V3h12v6"/><rect x="3" y="9" width="18" height="7" rx="2"/><path d="M6 16h12v5H6z"/></svg>}
                label="Fattura"/>
              <button onClick={onClose} title="Chiudi" style={{
                width: 36, height: 36, borderRadius: 11, flexShrink: 0, marginLeft: 2,
                background: '#fff', border: `1px solid ${SVI_BORDER}`,
                color: SVI_INK, lineHeight: 1,
                cursor: 'pointer', fontFamily: 'inherit',
                display: 'grid', placeItems: 'center',
              }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
              </button>
            </div>

            <div className="pn-scroll" style={{overflow: 'auto'}}>
              {/* Quanto resta da incassare: è il numero che l'operatore legge
                  al cliente, quindi si prende la riga intera. */}
              <div style={{padding: '18px 28px 0'}}>
                <div style={{
                  fontSize: 13.5, fontWeight: 700, color: SVI_MUTED,
                  letterSpacing: 0.7, textTransform: 'uppercase',
                }}>Totale residuo</div>
                <div style={{
                  display: 'flex', alignItems: 'baseline', gap: 14, flexWrap: 'wrap',
                }}>
                  <span style={{
                    fontSize: 46, fontWeight: 800, color: SVI_INK,
                    letterSpacing: -1.6, lineHeight: 1.15, marginTop: 2,
                    fontVariantNumeric: 'tabular-nums',
                  }}>{svEur(residuo)}</span>
                  {adjust && (
                    <span style={{fontSize: 15, color: SVI_MUTED}}>
                      {adjustLabel.split(' · ')[0]} su {svEur(subtotale)}
                    </span>
                  )}
                </div>
                {/* Già incassato: da chiuso è un totale, da aperto sono le
                    righe. Quando il cliente chiede "quanto ho già dato?" la
                    risposta non è un numero solo, è cosa ha dato e con cosa. */}
                <button
                  onClick={() => { if (pagamenti.length) setPagamentiOpen(o => !o); }}
                  title={pagamenti.length ? 'Vedi i pagamenti già ricevuti' : undefined}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8, marginTop: 4,
                    padding: 0, background: 'transparent', border: 'none',
                    fontSize: 14.5, color: SVI_MUTED, fontFamily: 'inherit',
                    cursor: pagamenti.length ? 'pointer' : 'default',
                  }}>
                  <SvIcoMonete/>
                  Già incassato {svEur(incassato)}
                  {pagamenti.length > 0 && (
                    <span style={{
                      display: 'inline-flex', color: SVI_MUTED,
                      transform: pagamentiOpen ? 'rotate(180deg)' : 'none',
                      transition: 'transform 150ms ease-out',
                    }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                    </span>
                  )}
                </button>

                {pagamentiOpen && pagamenti.length > 0 && (
                  <div style={{
                    marginTop: 10, borderRadius: 12,
                    background: '#F5F6F8', padding: '6px 14px',
                  }}>
                    {pagamenti.map((p, i) => (
                      <div key={p.id} style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '9px 0',
                        borderTop: i === 0 ? 'none' : `1px solid ${SVI_BORDER}`,
                      }}>
                        <span style={{color: SVI_CORAL, display: 'inline-flex', flexShrink: 0}}>
                          {p.come === 'carta'
                            ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2.5"/><path d="M2 10h20"/></svg>
                            : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.6"/></svg>}
                        </span>
                        <span style={{flex: 1, minWidth: 0, fontSize: 15, fontWeight: 600, color: SVI_INK}}>
                          {p.come === 'carta' ? 'Smart POS' : 'Contanti'}
                        </span>
                        <span style={{fontSize: 14, color: SVI_MUTED, fontVariantNumeric: 'tabular-nums'}}>{p.ora}</span>
                        <span style={{fontSize: 15.5, fontWeight: 800, color: SVI_INK, fontVariantNumeric: 'tabular-nums', minWidth: 62, textAlign: 'right'}}>
                          {svEur(p.importo)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {adjustOpen && (
                <div style={{padding: '14px 28px 0'}}>
                  <AdjustPanel
                    subtotale={subtotale}
                    adjust={adjust}
                    setAdjust={setAdjust}
                    onClose={() => setAdjustOpen(false)}/>
                </div>
              )}

              <div style={{height: 1, background: SVI_BORDER, margin: '20px 28px 0'}}/>

              {/* Metodo: due modi di prendere i soldi, due tessere grandi.
                  Al banco si tocca, non si sceglie da una lista. */}
              <div style={{padding: '18px 28px 0'}}>
                <div style={SVI_LABEL}>Scegli metodo di pagamento</div>
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14}}>
                  <SvMetodoCard
                    active={method === 'carta'}
                    onClick={() => chooseMethod('carta')}
                    label="Smart POS"
                    icon={<SvIcoPos/>}/>
                  <SvMetodoCard
                    active={method === 'contanti'}
                    onClick={() => chooseMethod('contanti')}
                    label="Contanti"
                    icon={<SvIcoBanconota/>}/>
                </div>
              </div>

              {/* Prima i tagli, poi la cifra: al banco si guarda la banconota
                  che il cliente porge e si tocca quella — il campo sotto è
                  dove il numero atterra, e resta scrivibile per gli importi
                  che un pulsante non può indovinare. Col POS non c'è niente
                  da scegliere: si addebita il residuo. */}
              <div style={{padding: '18px 28px 0'}}>
                <div style={SVI_LABEL}>Seleziona importo</div>

                {/* Contanti: le banconote che il cliente può porgere, quindi
                    sopra il residuo. POS: sulla carta non si addebita più del
                    dovuto, quindi l'intero e la metà — due carte che dividono
                    il conto sono la cosa che succede davvero al banco. */}
                <div style={{
                  display: 'grid', gap: 10, marginBottom: 12,
                  gridTemplateColumns: `repeat(${scelte.length}, 1fr)`,
                }}>
                  {scelte.map(sc => {
                    const on = Math.abs(importo - sc.val) < 0.004;
                    return (
                      <button key={sc.label}
                        onClick={() => { setImporto(sc.val.toFixed(2).replace('.', ',')); importoRef.current?.focus(); }}
                        style={{
                          padding: '13px 8px', borderRadius: 12,
                          background: on ? SVI_TINT : '#fff',
                          border: `1px solid ${on ? SVI_CORAL : SVI_BORDER}`,
                          color: on ? SVI_CORAL : SVI_INK,
                          fontSize: 16.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                          fontVariantNumeric: 'tabular-nums',
                        }}>{sc.label}</button>
                    );
                  })}
                </div>

                {/* Tutto il riquadro porta al campo: al banco si tocca la
                    cifra, non il cursore alto due millimetri. */}
                <div
                  onClick={() => { importoRef.current?.focus(); importoRef.current?.select(); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                    padding: '14px 18px', borderRadius: 14,
                    background: SVI_TINT, border: `1.5px solid ${SVI_CORAL}`,
                    cursor: 'text',
                  }}>
                  <span style={{fontSize: 32, fontWeight: 800, color: SVI_INK, letterSpacing: -0.8}}>€</span>
                  <input
                    ref={importoRef}
                    value={importoTxt}
                    onChange={e => setImporto(e.target.value.replace(/[^0-9.,]/g, ''))}
                    onFocus={e => e.target.select()}
                    inputMode="decimal"
                    style={{
                      flex: 1, minWidth: 0, border: 'none', outline: 'none',
                      background: 'transparent', fontFamily: 'inherit',
                      fontSize: 32, fontWeight: 800, color: SVI_INK,
                      letterSpacing: -0.8, padding: 0,
                      fontVariantNumeric: 'tabular-nums',
                    }}/>
                  <span style={{color: SVI_MUTED, flexShrink: 0, display: 'inline-flex'}}>
                    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                  </span>
                </div>
              </div>

              {/* Quanto rendo: domanda che esiste solo coi contanti. Sulla
                  carta si addebita la cifra esatta, non c'è resto da dare. */}
              {method === 'contanti' && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12,
                margin: '16px 28px 0', padding: '14px 18px',
                borderRadius: 14, background: '#F5F6F8',
              }}>
                <SvIcoMonete size={22}/>
                <span style={{fontSize: 16.5, color: SVI_MUTED}}>Resto:</span>
                <span style={{
                  fontSize: 20, fontWeight: 800, letterSpacing: -0.3,
                  color: resto > 0.004 ? SVI_INK : SVI_GREEN,
                  fontVariantNumeric: 'tabular-nums',
                }}>{svEur(resto)}</span>
              </div>
              )}
            </div>

            {/* Solo la conferma: il documento si sceglie in testata, e qui
                resta il gesto unico che chiude la vendita. */}
            <div style={{padding: '18px 28px 24px'}}>
              {(() => {
                const inviaSuStaff = method === 'carta';
                const attivo = residuo > 0 && preso >= Math.min(residuo, 0.01);
                return (
                  <button
                    onClick={() => {
                      if (!attivo) return;
                      if (inviaSuStaff) setAttesa({ inviato: Date.now(), importo: preso });
                      else registraIncasso(importo, 'contanti');
                    }}
                    disabled={!attivo}
                    style={{
                      width: '100%', padding: '16px 20px', borderRadius: 14,
                      background: attivo ? SVI_GREEN : '#EFEFF1',
                      color: attivo ? '#fff' : '#9CA3AF',
                      border: 'none', fontSize: 18, fontWeight: 700,
                      cursor: attivo ? 'pointer' : 'not-allowed', fontFamily: 'inherit',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 11,
                      boxShadow: attivo ? '0 8px 20px -8px rgba(22,163,74,0.55)' : 'none',
                      transition: 'filter 150ms ease-out',
                    }}
                    onMouseEnter={e => { if (attivo) e.currentTarget.style.filter = 'brightness(1.06)'; }}
                    onMouseLeave={e => { e.currentTarget.style.filter = 'none'; }}>
                    {attivo && (
                      <span style={{
                        width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                        background: 'rgba(255,255,255,0.22)',
                        display: 'grid', placeItems: 'center',
                      }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7"/></svg>
                      </span>
                    )}
                    {!attivo
                      ? (residuo <= 0 ? 'Nessun articolo nel conto' : 'Inserisci un importo')
                      : inviaSuStaff
                        ? `Addebita ${svEur(preso)} sul POS`
                        : parziale
                          ? `Incassa ${svEur(preso)} in acconto`
                          : `Incassa ed emetti ${fattura ? 'fattura' : 'ricevuta'}`}
                  </button>
                );
              })()}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Attesa del pagamento con carta al banco. Stessa lingua della finestra di
// saldo in Sala — pallino che pulsa, importo, contatore — ma con una sola
// uscita invece di due.
//
// In Sala c'è anche "Chiudi", perché la cassa ha altri tavoli da servire e il
// conto resta in coda per conto suo. Qui non esiste un "intanto faccio altro":
// il cliente è al banco, la vendita è una sola e finisce adesso. Un secondo
// pulsante che libera la cassa lascerebbe un pagamento senza più un carrello
// a cui tornare.
//
// "Ritira" e non "Annulla" perché è lo stesso gesto della Sala e va chiamato
// con la stessa parola: la richiesta torna indietro, il carrello è ancora lì e
// si può correggere e rimandare. Su Byup Staff, se qualcuno l'aveva già
// aperta, se lo vede dire lì.
//
// Resta premibile fino alla fine: se arriva tardi perde la corsa e la finestra
// passa a incassato, che è quello che è successo davvero.
function SvAttesaPagamento({ total, elapsed, onRitira }) {
  const secondi = Math.floor((elapsed || 0) / 1000);
  const mmss = `${Math.floor(secondi / 60)}:${String(secondi % 60).padStart(2, '0')}`;

  return (
    <div style={{
      padding: '36px 28px', textAlign: 'center',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
    }}>
      <div style={{
        width: 64, height: 64, borderRadius: '50%',
        background: PAY_BG, color: PAY_INK,
        display: 'grid', placeItems: 'center', marginBottom: 16,
      }}>
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10 H22"/>
        </svg>
      </div>

      {/* Il pallino dice "è ancora vivo", ma non è mai l'unico segnale: la
          scritta accanto dice la stessa cosa a parole. */}
      <div style={{
        fontSize: 24, fontWeight: 700, color: PAY_INK, marginBottom: 4,
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <span aria-hidden="true" style={{
          width: 11, height: 11, borderRadius: 999, flexShrink: 0,
          background: PAY_INK, animation: 'saldaPayPulse 1.6s ease-in-out infinite',
        }}/>
        In attesa
      </div>

      <div style={{
        fontSize: 32, fontWeight: 700, color: '#0F1115', marginBottom: 6,
        letterSpacing: -0.5, fontVariantNumeric: 'tabular-nums',
      }}>€{total.toFixed(2)}</div>

      {/* Il contatore è l'unica cosa che si muove: senza, una schermata ferma
          non distingue "sta aspettando" da "si è piantata". */}
      <div style={{ fontSize: 17, color: '#6B7280', marginBottom: 24, fontVariantNumeric: 'tabular-nums' }}>
        Richiesta inviata · {mmss}
      </div>

      <button onClick={onRitira} style={{
        padding: '10px 24px', borderRadius: 10,
        background: PN.WHITE_FROST, color: '#0F1115',
        border: `1px solid ${PN.BORDER_SOFT_A}`,
        fontSize: 17, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
      }}>Ritira</button>
    </div>
  );
}

// Animations
if (typeof document !== 'undefined' && !document.getElementById('sv-anims')) {
  const s = document.createElement('style');
  s.id = 'sv-anims';
  s.textContent = `
    @keyframes svCartBump { 0% { transform: scale(1); } 40% { transform: scale(1.22); } 100% { transform: scale(1); } }
  `;
  document.head.appendChild(s);
}

window.SalaVenditaDiretta = SalaVenditaDiretta;
