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
  const [tab, setTab] = React.useState(initialTab);
  const [focus, setFocus] = React.useState(false);
  const [modalPay, setModalPay] = React.useState(null);
  const [modalNuova, setModalNuova] = React.useState(null);
  const [datePickerOpen, setDatePickerOpen] = React.useState(false);
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
    showToast(`✓ ${count} articol${count===1?'o':'i'} inviati alla cucina · T.${tableId}`);
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
    showToast(`✓ Tav.${sourceTavolo.id} ↔ Tav.${target.id} scambiati`);
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

      // 1) Ricompatta gli uniti rimanenti accanto al source
      const remaining = source.mergedTables || [];
      let cx = src.x + TILE;
      let cy = src.y;
      remaining.forEach(id => {
        if (!POS[id]) return;
        if (cx + TILE > COLS) { cx = src.x; cy += TILE; }
        if (cy + TILE > ROWS) { cy = Math.max(0, src.y - TILE); cx = src.x; }
        POS[id] = { ...POS[id], x: cx, y: cy };
        cx += TILE;
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
  function handleEdit(t)        { alert(`Modifica Tav.${t.id} (mock)`); }
  function handleAssignOther(t) { alert(`Assegna Tav.${t.id} ad altri (mock)`); }
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
    selectedIds.forEach(id => {
      const t = all.find(x => x.id === id);
      if (!t) return;
      addedPosti += t.posti || 0;
      t.state = targetState;
      t.party = dominant.party || sourceTavolo.party || `Tav.${sourceTavolo.id}`;
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
    // Snap al punto di contatto: snappa i nuovi tavoli a fianco del gruppo host,
    // H o V in base alla direzione tra la tile host più vicina e quella guest più vicina.
    const POS = window.SALA_POSITIONS;
    if (POS && POS[sourceTavolo.id]) {
      const COLS = 12, ROWS = 8, TILE = 1;
      const hostIds = [sourceTavolo.id, ...existingMergedIds];

      // STEP 1 — Trova la coppia (host tile, guest tile) con gap minimo;
      // a parità di gap, vince la distanza centro-centro minore.
      let bestHost = null, bestGuest = null, bestGap = Infinity, bestCenterDist = Infinity;
      hostIds.forEach(hid => {
        const hp = POS[hid]; if (!hp) return;
        selectedIds.forEach(gid => {
          const gp = POS[gid]; if (!gp) return;
          const gx = Math.max(0, Math.max(hp.x, gp.x) - Math.min(hp.x + TILE, gp.x + TILE));
          const gy = Math.max(0, Math.max(hp.y, gp.y) - Math.min(hp.y + TILE, gp.y + TILE));
          const gap = Math.sqrt(gx * gx + gy * gy);
          const cdx = (gp.x + TILE / 2) - (hp.x + TILE / 2);
          const cdy = (gp.y + TILE / 2) - (hp.y + TILE / 2);
          const cd = Math.sqrt(cdx * cdx + cdy * cdy);
          if (gap < bestGap || (gap === bestGap && cd < bestCenterDist)) {
            bestGap = gap; bestCenterDist = cd; bestHost = hid; bestGuest = gid;
          }
        });
      });

      if (bestHost !== null && bestGuest !== null) {
        // STEP 2 — Determina la cella target per la guest: asse dominante (H o V)
        // dalla differenza centro-centro, e direzione (avanti o indietro) dal segno.
        const hp = POS[bestHost];
        const gp = POS[bestGuest];
        const dxC = (gp.x + TILE / 2) - (hp.x + TILE / 2);
        const dyC = (gp.y + TILE / 2) - (hp.y + TILE / 2);
        let tgx, tgy;
        if (Math.abs(dxC) >= Math.abs(dyC)) {
          tgx = dxC >= 0 ? hp.x + TILE : hp.x - TILE;
          tgy = hp.y;
        } else {
          tgx = hp.x;
          tgy = dyC >= 0 ? hp.y + TILE : hp.y - TILE;
        }
        // STEP 3 — Calcola il delta da applicare a tutte le guest e applicalo con clamping;
        // niente delta se la cella target è già occupata da un host (collisione invalidante).
        const dx = tgx - gp.x;
        const dy = tgy - gp.y;
        const occupied = hostIds.some(hid => {
          const h2 = POS[hid];
          return h2 && h2.x === tgx && h2.y === tgy;
        });
        if (!occupied && (dx !== 0 || dy !== 0)) {
          selectedIds.forEach(id => {
            if (!POS[id]) return;
            POS[id] = {
              ...POS[id],
              x: Math.max(0, Math.min(COLS - TILE, POS[id].x + dx)),
              y: Math.max(0, Math.min(ROWS - TILE, POS[id].y + dy)),
            };
          });
        }
      }
      window.dispatchEvent(new Event('sala-positions-sync'));
    }
    setModalUnisci(null);
    showToast(`✓ ${selectedIds.length} tavol${selectedIds.length===1?'o unito':'i uniti'} a T.${sourceTavolo.id}`);
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
                  // Lo stepper ora modifica la capacità (posti). Coperti seduti e connessi byup
                  // vengono clampati alla nuova capacità se necessario.
                  const t = SALA_TAVOLI.find(x => x.id === id);
                  if (t) {
                    t.posti = n;
                    if ((t.coperti || 0) > n) t.coperti = n;
                    if ((t.byup || 0) > n) t.byup = n;
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
