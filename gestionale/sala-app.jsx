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

// Trova la prima cella libera in una griglia COLS×ROWS partendo da (startX, startY),
// escludendo `excludeId`. Espande per "anelli" Chebyshev di raggio r: il check
// `max(|dx|,|dy|) !== r` salta l'interno del quadrato (già testato nelle iterazioni
// precedenti), così ogni candidata viene valutata una sola volta.
function findFreeCellSpiral(POS, startX, startY, excludeId, COLS = 12, ROWS = 8, TILE = 1) {
  const occupied = Object.entries(POS)
    .filter(([k]) => parseInt(k, 10) !== excludeId)
    .map(([, p]) => ({ x: p.x, y: p.y, w: TILE, h: TILE }));
  const overlaps = (a, b) => !(a.x + a.w <= b.x || b.x + b.w <= a.x || a.y + a.h <= b.y || b.y + b.h <= a.y);
  for (let r = 0; r <= 12; r += 0.5) {
    for (let dx = -r; dx <= r; dx += 0.5) {
      for (let dy = -r; dy <= r; dy += 0.5) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) !== r && r > 0) continue;
        const nx = Math.max(0, Math.min(COLS - TILE, startX + dx));
        const ny = Math.max(0, Math.min(ROWS - TILE, startY + dy));
        const test = { x: nx, y: ny, w: TILE, h: TILE };
        if (!occupied.some(o => overlaps(test, o))) return { x: nx, y: ny };
      }
    }
  }
  return null;
}

function SalaApp() {
  const dateStr = new Date().toLocaleDateString('it-IT', {weekday:'long', day:'numeric', month:'long', year:'numeric'});
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
  const [modalUnisci, setModalUnisci] = React.useState(null);
  const [modalSposta, setModalSposta] = React.useState(null);
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
    showToast(`✓ ${count} articol${count===1?'o':'i'} inviati alla cucina · Tavolo ${tableId}`);
  }

  const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
    "defaultView": "lista",
    "showConflicts": true,
    "noOrderWarn": 15,
    "noOrderAlert": 25,
    "overstay": 90,
    "oldBillHours": 3,
    "showContiPanel": true
  }/*EDITMODE-END*/;
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // Apri salda modal se arrivato da contabilità con ?openSalda=1
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('openSalda') === '1') {
      const all = getTavoli();
      const tavolo = all.find(t => t.state === 'occupato') || all[0];
      if (tavolo) setModalPay(tavolo);
    }
  }, []);

  // Mantieni soglie globali sincronizzate
  React.useEffect(() => {
    window.SALA_THRESHOLDS = {
      noOrderWarn: tweaks.noOrderWarn,
      noOrderAlert: tweaks.noOrderAlert,
      overstay: tweaks.overstay,
      oldBillHours: tweaks.oldBillHours,
    };
  }, [tweaks.noOrderWarn, tweaks.noOrderAlert, tweaks.overstay, tweaks.oldBillHours]);


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
  function handleMove(t)        { setModalSposta(t); }

  // Sposta: scambia i contenuti tra due tavoli (party, ordini, stato, ecc.) — gli ID restano fissi.
  function handleSpostaConfirm(sourceTavolo, targetId) {
    const all = getTavoli();
    const target = all.find(x => x.id === targetId);
    if (!target) { setModalSposta(null); return; }
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
    setModalSposta(null);
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
        const spot = findFreeCellSpiral(POS, POS[mergedId].x, POS[mergedId].y, mergedId, COLS, ROWS, TILE);
        if (spot) POS[mergedId] = { ...POS[mergedId], x: spot.x, y: spot.y };
      }
      window.dispatchEvent(new Event('sala-positions-sync'));
    }

    forceUpdate();
  }
  function handleEdit(t)        { setModalModifica(t); }
  function handleAssignOther(t) { alert(`Assegna Tavolo ${t.id} ad altri (mock)`); }
  function handleNoShow(t)      { t.state = 'libero'; t.nextReservation = null; t.minutiAllaPrenotazione = null; forceUpdate(); }

  function handleUnisciConfirm(sourceTavolo, selectedIds) {
    const all = getTavoli();
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
      const COLS = 12, ROWS = 8, TILE = 1;
      const memberIds = [sourceTavolo.id, ...sourceTavolo.mergedTables].filter(id => POS[id]);
      const dimsOf = (id, orientation) => {
        const tt = all.find(x => x.id === id);
        const o = orientation || (POS[id] && POS[id].orientation);
        return typeof getTableDims === 'function'
          ? getTableDims(null, tt?.posti, o)
          : { w: TILE, h: TILE };
      };
      const overlap = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;

      // Asse della fila: mantiene quello del gruppo esistente (verticale se
      // condivide la colonna), poi passa all'altro asse se la fila non entra.
      const prevIds = [sourceTavolo.id, ...existingMergedIds].filter(id => POS[id]);
      let axis = (prevIds.length > 1 && prevIds.every(id => Math.abs(POS[id].x - POS[prevIds[0]].x) < 0.26)) ? 'v' : 'h';
      const lenAlong = (a) => memberIds.reduce((s, id) => s + (a === 'h' ? dimsOf(id, a).w : dimsOf(id, a).h), 0);
      if (axis === 'h' && lenAlong('h') > COLS && lenAlong('v') <= ROWS) axis = 'v';
      else if (axis === 'v' && lenAlong('v') > ROWS && lenAlong('h') <= COLS) axis = 'h';

      // Origine ancorata al source, arretrata quanto basta perché tutta la
      // fila stia nella griglia (i rettangolari si girano lungo l'asse).
      const src = POS[sourceTavolo.id];
      const total = lenAlong(axis);
      let cursor = axis === 'h'
        ? Math.max(0, Math.min(src.x, COLS - total))
        : Math.max(0, Math.min(src.y, ROWS - total));
      const crossMax = Math.max(...memberIds.map(id => axis === 'h' ? dimsOf(id, axis).h : dimsOf(id, axis).w));
      const cross = axis === 'h'
        ? Math.max(0, Math.min(src.y, ROWS - crossMax))
        : Math.max(0, Math.min(src.x, COLS - crossMax));

      const lineRects = [];
      memberIds.forEach(id => {
        const d = dimsOf(id, axis);
        const x = axis === 'h' ? Math.min(cursor, COLS - d.w) : cross;
        const y = axis === 'h' ? cross : Math.min(cursor, ROWS - d.h);
        POS[id] = { ...POS[id], x, y, orientation: axis };
        lineRects.push({ x, y, w: d.w, h: d.h });
        cursor += axis === 'h' ? d.w : d.h;
      });

      // Sgombera i tavoli estranei finiti sotto la fila: prima cella libera vicina.
      Object.keys(POS).map(k => parseInt(k, 10))
        .filter(id => !memberIds.includes(id))
        .forEach(id => {
          const r = { x: POS[id].x, y: POS[id].y, ...dimsOf(id) };
          if (lineRects.some(mr => overlap(mr, r))) {
            const spot = findFreeCellSpiral(POS, POS[id].x, POS[id].y, id, COLS, ROWS, TILE);
            if (spot) POS[id] = { ...POS[id], x: spot.x, y: spot.y };
          }
        });
      window.dispatchEvent(new Event('sala-positions-sync'));
    }
    setModalUnisci(null);
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
  const headerTitle = tab === 'vendita' ? 'Vendita diretta' : tab === 'calendar' ? 'Prenotazioni' : 'Sala';

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
                cart={cart}
                onCartChange={setCart}
                onConfirmCart={handleConfirmCart}
                onAdjustCoperti={(id, n) => {
                  // Lo stepper modifica i COPERTI seduti, mai la capacità:
                  // clamp tra 1 e i posti. Gli utenti connessi (byup/byupWeb)
                  // NON si toccano: quel numero non dipende dai coperti.
                  const t = SALA_TAVOLI.find(x => x.id === id);
                  if (t) {
                    t.coperti = Math.max(1, Math.min(t.posti || n, n));
                    forceUpdate();
                  }
                }}
                onAdjustReservationPosti={(id, n) => {
                  // Pencil su libero/prenotato espansi: edita la party size della prenotazione.
                  const t = SALA_TAVOLI.find(x => x.id === id);
                  if (t && t.nextReservation) {
                    t.nextReservation.posti = n;
                    forceUpdate();
                  }
                }}
                onLibera={handleLibera}
                onMove={handleMove}
                onEdit={handleEdit}
                onAssignOther={handleAssignOther}
                onNoShow={handleNoShow}
                onUnisci={(t) => setModalUnisci(t)}
              />
            )}
            {tab === 'vendita' && <SalaVenditaDiretta/>}
            {tab === 'calendar' && <SalaCalendario tweaks={tweaks}
              onNuova={(data) => setModalNuova(data || true)}
              onModifica={(r) => setModalNuova({
                resId: r.id,
                time: r.time, dur: r.dur || 90, tableId: r.table, coperti: r.posti,
                nome: r.name || '', phone: r.phone || '',
                tag: r.note?.type || null, noteText: r.note?.text || '',
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
            animation:'fadeIn 0.2s ease',
          }}>{confirmedToast}</div>
        )}

        <SalaAperiModal
          tavolo={modalApri}
          onConfirm={() => { openTable(modalApri); setModalApri(null); }}
          onClose={() => setModalApri(null)}/>

        <SalaUnisciModal
          tavolo={modalUnisci}
          onClose={() => setModalUnisci(null)}
          onConfirm={handleUnisciConfirm}
          onDetach={handleDetach}
          onSetCoperti={(t, n) => {
            const all = getTavoli();
            const target = all.find(x => x.id === t.id);
            if (!target) return;
            target.posti = n;
            if ((target.coperti || 0) > n) target.coperti = n;
            if ((target.byup || 0) > n) target.byup = n;
            forceUpdate();
          }}/>

        <SalaSpostaModal
          tavolo={modalSposta}
          onClose={() => setModalSposta(null)}
          onConfirm={handleSpostaConfirm}/>

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
          onConfirm={() => {
            if (modalPay && !modalPay._isBanco) {
              modalPay.daIncassare = 0;
              modalPay.contoSaldato = true;
              forceUpdate();
            }
            if (modalPay?._isBanco && window.SALA_VENDITA_CLEAR) window.SALA_VENDITA_CLEAR();
          }}/>
        <SalaModalNuova open={!!modalNuova} initData={modalNuova && typeof modalNuova === 'object' ? modalNuova : null} onClose={() => setModalNuova(null)}
          onConfirm={(p) => {
            // Scrive nel calendario: update se in modifica, altrimenti una
            // prenotazione per ogni tavolo scelto (pattern tavolata multi-tavolo).
            if (p.editMode && p.resId && window.SALA_RES_UPDATE) {
              window.SALA_RES_UPDATE(p.resId, {
                time: p.time, name: p.nome, posti: p.coperti, phone: p.phone,
                table: p.tavoli[0], note: p.note, notes: p.notes,
              });
            } else if (!p.editMode && window.SALA_RES_ADD) {
              p.tavoli.forEach(tid => window.SALA_RES_ADD({
                time: p.time, dur: p.dur, name: p.nome, posti: p.coperti,
                table: tid, phone: p.phone, note: p.note, notes: p.notes,
              }));
            }
            showToast(`✓ Prenotazione ${p.editMode ? 'aggiornata' : 'confermata'} · ${p.nome} · ore ${p.time} · ${p.coperti} coperti`);
          }}
          onDelete={(resId) => {
            // Cancellazione soft: esce dalla timeline, resta sbarrata nella Lista.
            if (resId && window.SALA_RES_UPDATE) window.SALA_RES_UPDATE(resId, { status: 'cancellata' });
            showToast('✓ Prenotazione cancellata');
          }}/>

        <TweaksPanel>
        </TweaksPanel>
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
