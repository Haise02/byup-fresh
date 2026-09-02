// Sala — App shell con pannello conti aperti laterale + tweaks soglie

const getTavoli = () => window.SALA_TAVOLI || SALA_TAVOLI;

// Azzera lo stato applicativo del tavolo (ordini, conto, coperti, byup, sitting)
// e lo porta a `newState` ('libero' o 'dapulire'). Usato in detach/split per
// riportare un tavolo del gruppo unito a stato neutro.
function resetTavolo(t, newState) {
  t.state = newState;
  t.freedMinAgo = 0;
  t.minutiDaPulire = 0;
  delete t.mergedWith;
  delete t.party;
  t.coperti = 0;
  t.byup = 0;
  t.byupWeb = 0;
  t.ordini = [];
  t.conto = 0;
  t.contoSaldato = false;
  t.sittingMin = 0;
  t.timeSinceLastOrder = 0;
  t.minutiSenzaOrdine = 0;
}

// Adattatore sulla geometria condivisa (sala-geometria.jsx): qui i dati sono
// la mappa SALA_POSITIONS e i fixture della sala, di là sono rettangoli.
function findFreeCellSpiral(POS, startX, startY, movedId, COLS = 12, ROWS = 8) {
  const tavoli = window.SALA_TAVOLI || [];
  const ingombroDi = (id) => {
    const t = tavoli.find(x => x.id === id);
    return geoIngombro(t && t.posti, (POS[id] || {}).orientation);
  };
  const mio = ingombroDi(movedId);
  const ostacoli = [
    ...Object.keys(POS).map(k => parseInt(k, 10))
      .filter(id => id !== movedId && POS[id])
      .map(id => ({ x: POS[id].x, y: POS[id].y, ...ingombroDi(id) })),
    ...(window.SALA_FIXTURES || []).map(f => ({ x: f.x, y: f.y, w: f.w, h: f.h })),
  ];
  return geoPostoLibero({ x: startX, y: startY, w: mio.w, h: mio.h, ostacoli, cols: COLS, rows: ROWS });
}

function SalaApp() {
  const initialTab = (() => {
    try {
      const t = new URLSearchParams(window.location.search).get('tab');
      return ['tavoli','vendita','calendar'].includes(t) ? t : 'tavoli';
    } catch(e) { return 'tavoli'; }
  })();
  const [tab] = React.useState(initialTab);
  const [focus, setFocus] = React.useState(false);
  const [modalPay, setModalPay] = React.useState(null);
  const [modalNuova, setModalNuova] = React.useState(null);
  const [articoloSheet, setArticoloSheet] = React.useState(null);
  const [cart, setCart] = React.useState({ tableId: null, items: [] });
  const [confirmedToast, setConfirmedToast] = React.useState(null);
  const showToast = React.useCallback((msg, ms = 2800) => {
    setConfirmedToast(msg);
    setTimeout(() => setConfirmedToast(null), ms);
  }, []);
  // Re-render trigger: i tavoli sono mutati per riferimento, non c'è state slice osservabile da React.
  const [, setBump] = React.useState(0);
  const forceUpdate = React.useCallback(() => setBump(b => b + 1), []);
  const [modalApri, setModalApri] = React.useState(null); // tavolo con prenotazione imminente
  const [modalModifica, setModalModifica] = React.useState(null); // hub Sposta/Dividi/Unisci

  const openTable = React.useCallback((t) => {
    if (t.state === 'libero' || t.state === 'prenotato') {
      t.state = 'occupato';
      t.coperti = t.coperti || (t.nextReservation?.posti || t.posti);
      t.byup = t.byup || 0;
      t.byupWeb = t.byupWeb || 0;
      t.party = t.party || t.nextReservation?.name || null;
      t.sittingMin = 0;
      t.conto = 0;
      t.contoSaldato = false;
      t.ordini = t.ordini || [];
    } else if (t.state === 'dapulire') {
      t.state = 'libero';
      delete t.freedMinAgo; delete t.minutiDaPulire;
    }
    forceUpdate();
  }, []);

  function handleConfirmCart() {
    const tableId = cart.tableId;
    const count = cart.items.reduce((s,i)=>s+i.qty,0);
    setCart({ tableId: null, items: [] });
    setArticoloSheet(null);
    showToast(`✓ ${count} articol${count===1?'o':'i'} inviati · Tavolo ${tableId}`);
  }

  const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
    "defaultView": "lista",
    "noOrderWarn": 15,
    "noOrderAlert": 25,
    "overstay": 90,
    "oldBillHours": 3
  }/*EDITMODE-END*/;
  const tweaks = TWEAK_DEFAULTS;

  // Apri salda modal se arrivato da contabilità con ?openSalda=1.
  // Con anche &tavolo=<id> apre QUEL tavolo: serve ai controlli headless, che
  // senza un aggancio diretto devono attraversare la griglia a click.
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('openSalda') === '1') {
      const all = getTavoli();
      const wanted = parseInt(params.get('tavolo'), 10);
      const tavolo = all.find(t => t.id === wanted)
        || all.find(t => t.state === 'occupato') || all[0];
      if (tavolo) setModalPay(tavolo);
    }
  }, []);

  function detachMergedTables(t) {
    if (!t.mergedTables || t.mergedTables.length === 0) return;
    const all = getTavoli();
    t.mergedTables.forEach(id => {
      const m = all.find(x => x.id === id);
      if (!m) return;
      resetTavolo(m, 'dapulire');
    });
    delete t.mergedTables;
  }

  function handleLibera(t) {
    if (t.contoSaldato) {
      t.state = 'dapulire';
      t.freedMinAgo = 0; t.minutiDaPulire = 0;
      detachMergedTables(t);
      forceUpdate();
      return;
    }
    // Conto aperto → conferma. Convenzione invertita: OK = path conservativo (salda),
    // Annulla = libera comunque. Sfrutta il default browser (Enter = OK) per evitare libere accidentali.
    const proceed = window.confirm('Il conto è ancora aperto. Salda prima o libera comunque?\n\nOK = Salda prima · Annulla = Libera comunque');
    if (proceed) {
      setModalPay(t);
    } else {
      t.state = 'dapulire';
      t.freedMinAgo = 0; t.minutiDaPulire = 0;
      detachMergedTables(t);
      forceUpdate();
    }
  }
  // Sposta: scambia i contenuti tra due tavoli (party, ordini, stato, ecc.) — gli ID restano fissi.
  function handleSpostaConfirm(sourceTavolo, targetId) {
    const all = getTavoli();
    const target = all.find(x => x.id === targetId);
    if (!target) return;
    const FIELDS = [
      'state','coperti','byup','byupWeb','party','sittingMin','conto','contoSaldato',
      'ordini','minutiSenzaOrdine','timeSinceLastOrder','note',
      'nextReservation','minutiAllaPrenotazione',
      'freedMinAgo','minutiDaPulire',
      'mergedTables','mergedWith','guests',
    ];
    FIELDS.forEach(k => {
      const tmp = sourceTavolo[k];
      sourceTavolo[k] = target[k];
      target[k] = tmp;
    });
    showToast(`✓ Tavolo ${sourceTavolo.id} ↔ Tavolo ${target.id} scambiati`);
    forceUpdate();
  }

  // Sgancia un tavolo dal gruppo unito; torna libero.
  function handleDetach(source, mergedId) {
    const all = getTavoli();
    const m = all.find(x => x.id === mergedId);
    if (m) {
      resetTavolo(m, 'libero');
      source.coperti = Math.max(0, (source.coperti || 0) - (m.posti || 0));
    }
    source.mergedTables = (source.mergedTables || []).filter(id => id !== mergedId);
    if (source.mergedTables.length === 0) delete source.mergedTables;

    // Ridisponi i tavoli sulla mappa: gli uniti rimanenti tornano affiancati al source,
    // il tavolo appena separato viene spostato nella prima cella libera.
    const POS = window.SALA_POSITIONS;
    if (POS && POS[source.id]) {
      const COLS = 12, ROWS = 8, TILE = 1;
      const src = POS[source.id];

      // 1) Ricompatta gli uniti rimanenti accanto al source, SEMPRE in linea
      //    retta sulla stessa riga: prima a destra, poi a sinistra se la
      //    griglia finisce (mai a capo su un'altra riga).
      const remaining = source.mergedTables || [];
      let right = src.x + TILE;
      let left = src.x;
      remaining.forEach(id => {
        if (!POS[id]) return;
        if (right + TILE <= COLS) {
          POS[id] = { ...POS[id], x: right, y: src.y };
          right += TILE;
        } else {
          left = Math.max(0, left - TILE);
          POS[id] = { ...POS[id], x: left, y: src.y };
        }
      });

      // 2) Riposiziona il tavolo separato nella prima cella libera vicina.
      if (m && POS[mergedId]) {
        const spot = findFreeCellSpiral(POS, POS[mergedId].x, POS[mergedId].y, mergedId, COLS, ROWS);
        if (spot) POS[mergedId] = { ...POS[mergedId], x: spot.x, y: spot.y };
      }
      window.dispatchEvent(new Event('sala-positions-sync'));
    }

    forceUpdate();
  }
  function handleEdit(t)        { setModalModifica(t); }
  function handleNoShow(t)      { t.state = 'libero'; t.nextReservation = null; t.minutiAllaPrenotazione = null; forceUpdate(); }

  function handleUnisciConfirm(sourceTavolo, guestIds) {
    const all = getTavoli();
    // Un tavolo scelto può essere già dentro un gruppo — da capo o da membro:
    // in quel caso si porta dietro tutti i suoi. Prendendo solo l'id scelto, i
    // compagni restavano fuori dal calcolo della fila e finivano a fare massa
    // sotto o sopra: da lì i gruppi «quadrati» unendo due gruppi già uniti.
    const gruppoDi = (id) => {
      const t = all.find(x => x.id === id);
      if (!t) return [];
      if (t.mergedTables && t.mergedTables.length) return [id, ...t.mergedTables];
      const capo = all.find(x => x.mergedTables && x.mergedTables.includes(id));
      return capo ? [capo.id, ...capo.mergedTables] : [id];
    };
    const selectedIds = Array.from(new Set(guestIds.flatMap(gruppoDi)))
      .filter(id => id !== sourceTavolo.id && !(sourceTavolo.mergedTables || []).includes(id));
    // Cattura i secondari già esistenti prima dell'update (serve per la direzione del gruppo)
    const existingMergedIds = [...(sourceTavolo.mergedTables || [])];
    // Stato dominante: occupato > prenotato > libero > dapulire.
    const allInGroup = [
      sourceTavolo,
      ...(sourceTavolo.mergedTables || []).map(id => all.find(x => x.id === id)),
      ...selectedIds.map(id => all.find(x => x.id === id)),
    ].filter(Boolean);
    const targetState = allInGroup.some(t => t.state === 'occupato') ? 'occupato'
      : allInGroup.some(t => t.state === 'prenotato') ? 'prenotato'
      : allInGroup.some(t => t.state === 'libero') ? 'libero'
      : 'dapulire';
    const dominant = allInGroup.find(t => t.state === targetState) || sourceTavolo;
    let addedPosti = 0;
    // Fusione dei conti: se un tavolo che entra nel gruppo è occupato, il suo
    // conto/ordini confluiscono nel conto unico del source (i campi del membro
    // vengono azzerati più sotto, quindi la cattura avviene PRIMA del reset).
    let mergedConto = 0, mergedByup = 0, mergedByupWeb = 0;
    const mergedOrdini = [];
    selectedIds.forEach(id => {
      const t = all.find(x => x.id === id);
      if (!t) return;
      if (t.state === 'occupato') {
        mergedConto += t.conto || 0;
        mergedByup += t.byup || 0;
        mergedByupWeb += t.byupWeb || 0;
        if (Array.isArray(t.ordini)) mergedOrdini.push(...t.ordini);
      }
      addedPosti += t.posti || 0;
      t.state = targetState;
      t.party = dominant.party || sourceTavolo.party || `Tavolo ${sourceTavolo.id}`;
      if (targetState === 'prenotato') {
        t.nextReservation = dominant.nextReservation;
        t.minutiAllaPrenotazione = dominant.minutiAllaPrenotazione ?? null;
      }
      t.coperti = t.posti || 1;
      t.byup = 0; t.byupWeb = 0;
      t.ordini = [];
      t.conto = 0;
      t.contoSaldato = false;
      t.sittingMin = dominant.sittingMin || 0;
      t.timeSinceLastOrder = 0;
      t.minutiSenzaOrdine = 0;
      t.mergedWith = sourceTavolo.id;
      // Se entrava da capo di un altro gruppo, smette di esserlo: i suoi
      // membri sono già passati sotto al source qui sopra, e un capo dentro
      // un capo lascerebbe due gruppi sovrapposti.
      delete t.mergedTables;
    });
    // Allinea source e tavoli già uniti al targetState
    sourceTavolo.state = targetState;
    if (targetState === 'prenotato' && dominant.id !== sourceTavolo.id) {
      sourceTavolo.nextReservation = dominant.nextReservation;
      sourceTavolo.minutiAllaPrenotazione = dominant.minutiAllaPrenotazione ?? null;
    }
    if (targetState === 'occupato') {
      // Inizializza i campi solo se mancanti: sourceTavolo può essere già occupato
      // (campi presenti, da preservare) o entrare per la prima volta nel gruppo (campi undefined).
      const defaults = {
        conto: 0, contoSaldato: false, ordini: [],
        byup: 0, byupWeb: 0,
        sittingMin: dominant.sittingMin || 0,
        timeSinceLastOrder: 0, minutiSenzaOrdine: 0,
      };
      for (const [k, v] of Object.entries(defaults)) {
        if (sourceTavolo[k] == null) sourceTavolo[k] = v;
      }
      sourceTavolo.party = sourceTavolo.party || dominant.party || null;
      // Conto unico del gruppo: somma dei conti e concatenazione degli ordini
      // dei tavoli occupati appena uniti.
      if (mergedConto > 0 || mergedOrdini.length > 0) {
        sourceTavolo.conto = (sourceTavolo.conto || 0) + mergedConto;
        sourceTavolo.ordini = [...(sourceTavolo.ordini || []), ...mergedOrdini];
        sourceTavolo.byup = (sourceTavolo.byup || 0) + mergedByup;
        sourceTavolo.byupWeb = (sourceTavolo.byupWeb || 0) + mergedByupWeb;
      }
    }
    (sourceTavolo.mergedTables || []).forEach(id => {
      const t = all.find(x => x.id === id);
      if (!t) return;
      t.state = targetState;
      if (targetState === 'prenotato') {
        t.nextReservation = dominant.nextReservation;
        t.minutiAllaPrenotazione = dominant.minutiAllaPrenotazione ?? null;
      }
    });
    sourceTavolo.coperti = (sourceTavolo.coperti || 0) + addedPosti;
    sourceTavolo.mergedTables = [...(sourceTavolo.mergedTables || []), ...selectedIds];
    // Accorpamento fisico SEMPRE in linea retta: l'intero gruppo viene
    // ridisposto in un'unica fila (orizzontale o verticale) ancorata al
    // source — anche unendo 4+ tavoli in un colpo solo, mai forme a L.
    // L'accodamento incrementale alle estremità non basta: quando un capo
    // della fila esce dalla griglia il tavolo resterebbe dov'era, spezzando
    // la linea; qui invece si arretra l'origine e la fila resta intera.
    const POS = window.SALA_POSITIONS;
    if (POS && POS[sourceTavolo.id]) {
      const COLS = 12, ROWS = 8;
      const memberIds = [sourceTavolo.id, ...sourceTavolo.mergedTables].filter(id => POS[id]);
      const postiDi = (id) => (all.find(x => x.id === id) || {}).posti;

      // Le scelte di QUESTA schermata, che la geometria non conosce:
      //  · l'asse lo detta il gruppo che c'era già — verticale se i suoi
      //    membri condividevano la colonna — e si gira solo se non ci sta;
      //  · la fila si ancora al tavolo su cui si è unito;
      //  · l'ordine è quello con cui i tavoli sono entrati nel gruppo.
      const prevIds = [sourceTavolo.id, ...existingMergedIds].filter(id => POS[id]);
      const assePreferito = (prevIds.length > 1 &&
        prevIds.every(id => Math.abs(POS[id].x - POS[prevIds[0]].x) < 0.26)) ? 'v' : 'h';

      const fila = geoFila({
        membri: memberIds.map(id => ({ id, posti: postiDi(id) })),
        ancora: { x: POS[sourceTavolo.id].x, y: POS[sourceTavolo.id].y },
        cols: COLS, rows: ROWS, assePreferito,
      });
      fila.forEach(f => { POS[f.id] = { ...POS[f.id], x: f.x, y: f.y, orientation: f.orientation }; });

      const estranei = Object.keys(POS).map(k => parseInt(k, 10))
        .filter(id => !memberIds.includes(id) && POS[id])
        .map(id => ({ id, x: POS[id].x, y: POS[id].y, ...geoIngombro(postiDi(id), POS[id].orientation) }));
      const spostati = geoSgombera({
        fila: fila.map(f => ({ x: f.x, y: f.y, w: f.w, h: f.h })),
        estranei,
        ostacoli: (window.SALA_FIXTURES || []).map(f => ({ x: f.x, y: f.y, w: f.w, h: f.h })),
        cols: COLS, rows: ROWS,
      });
      Object.entries(spostati).forEach(([id, pos]) => { POS[id] = { ...POS[id], x: pos.x, y: pos.y }; });
      window.dispatchEvent(new Event('sala-positions-sync'));
    }
    showToast(`✓ ${selectedIds.length} tavol${selectedIds.length===1?'o unito':'i uniti'} a Tavolo ${sourceTavolo.id}`);
    forceUpdate();
  }
  window.SALA_DO_MERGE = handleUnisciConfirm;
  window.SALA_DO_DETACH = handleDetach;
  window.SALA_OPEN_SALDA = (tavolo) => setModalPay(tavolo);
  window.SALA_DO_SPLIT_ALL = (src) => {
    const ids = [...(src.mergedTables || [])];
    ids.forEach(id => handleDetach(src, id));
  };


  const sidebarActive = tab === 'vendita' ? 'vendita' : tab === 'calendar' ? 'prenotazioni' : 'sala';

  return (
    <div style={{display:'flex', flex:1, minHeight:0, minWidth:0}}>
      {!focus && <PnSidebar active={sidebarActive}/>}

      <main style={{flex:1, display:'flex', flexDirection:'column', minWidth: 0, position:'relative'}}>
        <div style={{flex:1, display:'flex', minHeight:0, minWidth:0, overflow:'hidden'}}>
          <div className="pn-scroll" style={{
            flex: 1, overflow: 'auto',
            padding: focus ? '16px 24px 24px' : '16px 10px 24px 18px',
            background: PN.BG,
            minWidth: 0,
            // Gutter scrollbar sempre riservato: se compare/scompare lo scroll
            // la larghezza non cambia e la mappa non rifluisce.
            scrollbarGutter: 'stable',
          }}>
            {tab === 'tavoli' && (
              <SalaTavoli
                tweaks={tweaks}
                focus={focus}
                onToggleFocus={() => setFocus(f => !f)}
                contiCollapsed={true}
                onOpenAdd={(t) => {
                  if (t.state === 'prenotato' || (t.state === 'libero' && t.nextReservation)) {
                    setModalApri(t);
                    return;
                  }
                  openTable(t);
                }}
                onOpenPay={(t) => setModalPay(t)}
                onAddArticle={(t) => { setArticoloSheet(t); if (cart.tableId !== t.id) setCart({tableId:t.id, items:[]}); }}
                onAdjustReservationPosti={(id, n) => {
                  // Pencil su libero/prenotato espansi: edita la party size della prenotazione.
                  const t = SALA_TAVOLI.find(x => x.id === id);
                  if (t && t.nextReservation) {
                    t.nextReservation.posti = n;
                    forceUpdate();
                  }
                }}
                onLibera={handleLibera}
                onEdit={handleEdit}
              />
            )}
            {tab === 'vendita' && <SalaVenditaDiretta/>}
            {tab === 'calendar' && <SalaCalendario
              onNuova={(data) => setModalNuova(data || true)}
              onModifica={(r) => setModalNuova({
                resId: r.id,
                time: r.time, dur: r.dur || 90, tableId: r.table, coperti: r.posti,
                nome: r.name || '', phone: r.phone || '',
                tag: r.note?.type || null, noteText: r.note?.text || '',
                allergens: r.allergens || [],
                editMode: true,
              })}
            />}
          </div>

        </div>

        <SalaArticoloSheet
          open={!!articoloSheet} tavolo={articoloSheet}
          cart={cart} onCartChange={setCart}
          onClose={() => setArticoloSheet(null)}
          onConfirm={handleConfirmCart}/>

        {confirmedToast && (
          <div style={{
            position:'absolute', bottom: 24, left: '50%', transform:'translateX(-50%)',
            background:'#0F1115', color:'#fff',
            padding:'12px 22px', borderRadius: 999,
            fontSize: 17, fontWeight: 700, zIndex: 50,
            boxShadow:'0 8px 24px rgba(0,0,0,0.18)',
            animation:'salaToastIn 0.2s ease',
          }}>{confirmedToast}
            <style>{`@keyframes salaToastIn { from {opacity: 0;} to {opacity: 1;} }`}</style>
          </div>
        )}

        <SalaAperiModal
          tavolo={modalApri}
          onConfirm={() => { openTable(modalApri); setModalApri(null); }}
          onClose={() => setModalApri(null)}/>

        <SalaModificaModal
          tavolo={modalModifica}
          onClose={() => setModalModifica(null)}
          onSposta={handleSpostaConfirm}
          onUnisciConfirm={handleUnisciConfirm}
          onDetach={handleDetach}
          onLibera={handleLibera}
          onNoShow={handleNoShow}
          onAdjustCoperti={(n) => {
            // Stessa regola dello stepper in card: coperti seduti, mai la
            // capacità — clamp tra 1 e i posti. Gli utenti connessi non si toccano.
            const t = modalModifica;
            if (t) {
              t.coperti = Math.max(1, Math.min(t.posti || n, n));
              forceUpdate();
            }
          }}/>

        <SalaSaldaModal open={!!modalPay} onClose={() => setModalPay(null)} tavolo={modalPay}
          onConfirm={(esito) => {
            // Un incasso può chiudere il conto o coprirne una parte: nel
            // secondo caso il tavolo resta occupato e porta il residuo, che è
            // quello che la sala legge sulla card.
            const parziale = esito && esito.saldato === false;
            if (modalPay && !modalPay._isBanco) {
              if (parziale) {
                modalPay.daIncassare = esito.residuo;
              } else {
                modalPay.daIncassare = 0;
                modalPay.contoSaldato = true;
              }
              forceUpdate();
            }
            // Il carrello del banco si svuota solo se il conto è chiuso: con un
            // incasso parziale resta un conto da saldare, come l'acconto in
            // Vendita diretta lascia la sua voce in coda.
            if (modalPay?._isBanco && !parziale && window.SALA_VENDITA_CLEAR) window.SALA_VENDITA_CLEAR();
          }}/>
        <SalaModalNuova open={!!modalNuova} initData={modalNuova && typeof modalNuova === 'object' ? modalNuova : null} onClose={() => setModalNuova(null)}
          onConfirm={(p) => {
            // Scrive nel calendario: update se in modifica, altrimenti una
            // prenotazione per ogni tavolo scelto (pattern tavolata multi-tavolo).
            // P-24: gli allergeni viaggiano sulla struttura dedicata della
            // prenotazione (codici + dichiarazione), mai dentro la nota.
            if (p.editMode && p.resId && window.SALA_RES_UPDATE) {
              window.SALA_RES_UPDATE(p.resId, {
                time: p.time, name: p.nome, posti: p.coperti, phone: p.phone,
                table: p.tavoli[0], note: p.note, notes: p.notes,
                allergens: p.allergens, allergensDeclaredAt: p.allergensDeclaredAt,
                allergensDeclaredBy: p.allergensDeclaredBy,
              });
            } else if (!p.editMode && window.SALA_RES_ADD) {
              p.tavoli.forEach(tid => window.SALA_RES_ADD({
                time: p.time, dur: p.dur, name: p.nome, posti: p.coperti,
                table: tid, phone: p.phone, note: p.note, notes: p.notes,
                allergens: p.allergens, allergensDeclaredAt: p.allergensDeclaredAt,
                allergensDeclaredBy: p.allergensDeclaredBy,
              }));
            }
            showToast(`✓ Prenotazione ${p.editMode ? 'aggiornata' : 'confermata'} · ${p.nome} · ore ${p.time} · ${p.coperti} coperti`);
          }}
          onDelete={(resId) => {
            // Cancellazione soft: esce dalla timeline, resta sbarrata nella Lista.
            if (resId && window.SALA_RES_UPDATE) window.SALA_RES_UPDATE(resId, { status: 'cancellata' });
            showToast('✓ Prenotazione cancellata');
          }}/>
      </main>
    </div>
  );
}

function SalaAperiModal({ tavolo, onConfirm, onClose }) {
  if (!tavolo) return null;
  const minAlla = tavolo.minutiAllaPrenotazione ?? tavolo.nextReservation?.inMin;
  const isLate = minAlla != null && minAlla < 0;
  const lateMin = isLate ? Math.abs(minAlla) : 0;
  const res = tavolo.nextReservation;
  const badgeLabel = isLate
    ? `Prenotazione in ritardo di ${lateMin}'`
    : (minAlla != null ? `Prenotazione in arrivo fra ${minAlla}'` : 'Prenotazione imminente');
  return (
    <>
      <div onClick={onClose} style={{
        position:'absolute', inset:0, background:'rgba(15,17,21,0.45)', zIndex:55,
      }}/>
      <div style={{
        position:'absolute', top:'50%', left:'50%',
        transform:'translate(-50%,-50%)',
        width: 360, background:'#fff', borderRadius: 16,
        boxShadow:'0 20px 60px rgba(0,0,0,0.22)',
        zIndex: 56, padding:'24px 24px 20px',
        fontFamily:'inherit',
      }}>
        <div style={{
          display:'inline-flex', alignItems:'center', gap: 6,
          background:'#EFF6FF', color:'#1E40AF',
          padding:'4px 10px', borderRadius:999, marginBottom:14,
          fontSize: 15.5, fontWeight: 700,
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
          </svg>
          {badgeLabel}
        </div>
        <div style={{fontSize: 22, fontWeight: 700, color:'#0F1115', marginBottom: 6, letterSpacing:'-0.02em'}}>
          Vuoi aprire il tavolo lo stesso?
        </div>
        {res && (
          <div style={{fontSize: 17, color:'#6B7280', marginBottom: 20, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>
            {res.time} · {res.name} · {res.posti} posti
          </div>
        )}
        <div style={{display:'flex', gap: 8}}>
          <button onClick={onClose} style={{
            flex:1, padding:'11px 14px',
            background: PN.BTN_NEUTRAL, color:'#0F1115',
            border:`1px solid ${PN.BORDER_LIGHT}`,
            borderRadius:10, fontSize:17, fontWeight:700, cursor:'pointer', fontFamily:'inherit',
            boxShadow: PN.INSET_HIGHLIGHT,
          }}>Annulla</button>
          <button onClick={onConfirm} style={{
            flex:1, padding:'11px 14px',
            background: PN.BTN_DARK, color:'#fff',
            border:'1px solid rgba(0,0,0,0.32)',
            borderRadius:10, fontSize:17, fontWeight:700, cursor:'pointer', fontFamily:'inherit',
            boxShadow: PN.INSET_HIGHLIGHT_DARK,
          }}>Apri tavolo</button>
        </div>
      </div>
    </>
  );
}



const salaRoot = ReactDOM.createRoot(document.getElementById('root'));
salaRoot.render(
  <div className="frame" data-screen-label="Sala">
    <SalaApp/>
  </div>
);
