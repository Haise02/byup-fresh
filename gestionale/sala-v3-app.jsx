// Sala v3 — App shell con pannello conti aperti laterale + tweaks soglie

function SvIconV3App({ path, size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={path}/>
    </svg>
  );
}

function SalaV3App() {
  const [tab, setTab] = React.useState('tavoli');
  const [focus, setFocus] = React.useState(false);
  const [modalAdd, setModalAdd] = React.useState(null);
  const [modalConti, setModalConti] = React.useState(false);
  const [modalPay, setModalPay] = React.useState(null);
  const [modalNuova, setModalNuova] = React.useState(null);
  const [datePickerOpen, setDatePickerOpen] = React.useState(false);
  const [contiCollapsed, setContiCollapsed] = React.useState(false);
  const [articoloSheet, setArticoloSheet] = React.useState(null);
  const [cart, setCart] = React.useState({ tableId: null, items: [] });
  const [confirmedToast, setConfirmedToast] = React.useState(null);
  const [, setBump] = React.useState(0);
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
    setBump(b => b + 1);
  }, []);

  function handleConfirmCart() {
    const tableId = cart.tableId;
    const count = cart.items.reduce((s,i)=>s+i.qty,0);
    setCart({ tableId: null, items: [] });
    setArticoloSheet(null);
    setConfirmedToast(`✓ ${count} articol${count===1?'o':'i'} inviati alla cucina · T.${tableId}`);
    setTimeout(()=>setConfirmedToast(null), 2800);
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
      const all = window.SALA_V3_TAVOLI || SALA_V3_TAVOLI;
      const tavolo = all.find(t => t.state === 'occupato') || all[0];
      if (tavolo) setModalPay(tavolo);
    }
  }, []);

  // Mantieni soglie globali sincronizzate
  React.useEffect(() => {
    window.SALA_V3_THRESHOLDS = {
      noOrderWarn: tweaks.noOrderWarn,
      noOrderAlert: tweaks.noOrderAlert,
      overstay: tweaks.overstay,
      oldBillHours: tweaks.oldBillHours,
    };
  }, [tweaks.noOrderWarn, tweaks.noOrderAlert, tweaks.overstay, tweaks.oldBillHours]);

  const tabs = [
    { id: 'tavoli', label: 'Tavoli' },
    { id: 'vendita', label: 'Vendita diretta' },
    { id: 'calendar', label: 'Prenotazioni' },
  ];

  const showContiPanel = tweaks.showContiPanel && tab === 'tavoli' && !focus;

  function detachMergedTables(t) {
    if (!t.mergedTables || t.mergedTables.length === 0) return;
    const all = window.SALA_V3_TAVOLI || SALA_V3_TAVOLI;
    t.mergedTables.forEach(id => {
      const m = all.find(x => x.id === id);
      if (!m) return;
      m.state = 'dapulire';
      m.freedMinAgo = 0; m.minutiDaPulire = 0;
      delete m.mergedWith;
      delete m.party;
      m.coperti = 0; m.byup = 0; m.byupWeb = 0;
      m.ordini = [];
      m.conto = 0; m.contoSaldato = false;
      m.sittingMin = 0;
      m.timeSinceLastOrder = 0;
      m.minutiSenzaOrdine = 0;
    });
    delete t.mergedTables;
  }

  function handleLibera(t) {
    if (t.contoSaldato) {
      t.state = 'dapulire';
      t.freedMinAgo = 0; t.minutiDaPulire = 0;
      detachMergedTables(t);
      setBump(b => b + 1);
      return;
    }
    // Conto aperto → modal di conferma
    const proceed = window.confirm('Il conto è ancora aperto. Salda prima o libera comunque?\n\nOK = Salda prima · Annulla = Libera comunque');
    if (proceed) {
      setModalPay(t);
    } else {
      t.state = 'dapulire';
      t.freedMinAgo = 0; t.minutiDaPulire = 0;
      detachMergedTables(t);
      setBump(b => b + 1);
    }
  }
  function handleMove(t)        { setModalSposta(t); }

  // Sposta: scambia i contenuti tra due tavoli (party, ordini, stato, ecc.) — gli ID restano fissi.
  function handleSpostaConfirm(sourceTavolo, targetId) {
    const all = window.SALA_V3_TAVOLI || SALA_V3_TAVOLI;
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
    setConfirmedToast(`✓ Tav.${sourceTavolo.id} ↔ Tav.${target.id} scambiati`);
    setTimeout(() => setConfirmedToast(null), 2800);
    setBump(b => b + 1);
  }

  // Sgancia un tavolo dal gruppo unito; torna libero.
  function handleDetach(source, mergedId) {
    const all = window.SALA_V3_TAVOLI || SALA_V3_TAVOLI;
    const m = all.find(x => x.id === mergedId);
    if (m) {
      m.state = 'libero';
      m.freedMinAgo = 0; m.minutiDaPulire = 0;
      delete m.mergedWith;
      delete m.party;
      m.coperti = 0; m.byup = 0; m.byupWeb = 0;
      m.ordini = [];
      m.conto = 0; m.contoSaldato = false;
      m.sittingMin = 0;
      m.timeSinceLastOrder = 0;
      m.minutiSenzaOrdine = 0;
      source.coperti = Math.max(0, (source.coperti || 0) - (m.posti || 0));
    }
    source.mergedTables = (source.mergedTables || []).filter(id => id !== mergedId);
    if (source.mergedTables.length === 0) delete source.mergedTables;

    // Ridisponi i tavoli sulla mappa: gli uniti rimanenti tornano affiancati al source,
    // il tavolo appena separato viene spostato nella prima cella libera.
    const POS = window.SALA_V3_POSITIONS;
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

      // 2) Riposiziona il tavolo separato in una cella libera (ricerca a spirale dalla sua posizione attuale)
      if (m && POS[mergedId]) {
        const occupied = Object.entries(POS)
          .filter(([k]) => parseInt(k,10) !== mergedId)
          .map(([k,p]) => ({ x: p.x, y: p.y, w: TILE, h: TILE }));
        const overlaps = (a,b) => !(a.x + a.w <= b.x || b.x + b.w <= a.x || a.y + a.h <= b.y || b.y + b.h <= a.y);
        const startX = POS[mergedId].x;
        const startY = POS[mergedId].y;
        let spot = null;
        outer:
        for (let r = 0; r <= 12; r += 0.5) {
          for (let dx = -r; dx <= r; dx += 0.5) {
            for (let dy = -r; dy <= r; dy += 0.5) {
              if (Math.max(Math.abs(dx), Math.abs(dy)) !== r && r > 0) continue;
              const nx = Math.max(0, Math.min(COLS - TILE, startX + dx));
              const ny = Math.max(0, Math.min(ROWS - TILE, startY + dy));
              const test = { x: nx, y: ny, w: TILE, h: TILE };
              if (!occupied.some(o => overlaps(test, o))) { spot = { x: nx, y: ny }; break outer; }
            }
          }
        }
        if (spot) POS[mergedId] = { ...POS[mergedId], x: spot.x, y: spot.y };
      }
      window.dispatchEvent(new Event('sala-v3-positions-sync'));
    }

    setBump(b => b + 1);
  }
  function handleEdit(t)        { alert(`Modifica Tav.${t.id} (mock)`); }
  function handleAssignOther(t) { alert(`Assegna Tav.${t.id} ad altri (mock)`); }
  function handleNoShow(t)      { t.state = 'libero'; t.nextReservation = null; t.minutiAllaPrenotazione = null; setBump(b => b + 1); }

  function handleUnisciConfirm(sourceTavolo, selectedIds) {
    const all = window.SALA_V3_TAVOLI || SALA_V3_TAVOLI;
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
      if (sourceTavolo.conto == null)              sourceTavolo.conto = 0;
      if (sourceTavolo.contoSaldato == null)       sourceTavolo.contoSaldato = false;
      if (!sourceTavolo.ordini)                    sourceTavolo.ordini = [];
      if (sourceTavolo.byup == null)               sourceTavolo.byup = 0;
      if (sourceTavolo.byupWeb == null)            sourceTavolo.byupWeb = 0;
      if (sourceTavolo.sittingMin == null)         sourceTavolo.sittingMin = dominant.sittingMin || 0;
      if (sourceTavolo.timeSinceLastOrder == null) sourceTavolo.timeSinceLastOrder = 0;
      if (sourceTavolo.minutiSenzaOrdine == null)  sourceTavolo.minutiSenzaOrdine = 0;
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
    const POS = window.SALA_V3_POSITIONS;
    if (POS && POS[sourceTavolo.id]) {
      const COLS = 12, ROWS = 8, TILE = 1;
      const hostIds = [sourceTavolo.id, ...existingMergedIds];

      // Trova la coppia (host tile, guest tile) con gap minimo; a parità di gap, vince la distanza centro-centro minore
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
        const dx = tgx - gp.x;
        const dy = tgy - gp.y;
        // Non applicare il delta se la posizione target è già occupata da una tile host
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
      window.dispatchEvent(new Event('sala-v3-positions-sync'));
    }
    setModalUnisci(null);
    setConfirmedToast(`✓ ${selectedIds.length} tavol${selectedIds.length===1?'o unito':'i uniti'} a T.${sourceTavolo.id}`);
    setTimeout(() => setConfirmedToast(null), 2800);
    setBump(b => b + 1);
  }
  window.SALA_V3_DO_MERGE = handleUnisciConfirm;
  window.SALA_V3_DO_DETACH = handleDetach;
  window.SALA_V3_OPEN_SALDA = (tavolo) => setModalPay(tavolo);
  window.SALA_V3_DO_SPLIT_ALL = (src) => {
    const ids = [...(src.mergedTables || [])];
    ids.forEach(id => handleDetach(src, id));
  };


  return (
    <div style={{display:'flex', flex:1, minHeight:0}}>
      {!focus && <PnSidebar active="sala"/>}

      <main style={{flex:1, display:'flex', flexDirection:'column', minWidth: 0, position:'relative'}}>
        {!focus && (
          <header style={{
            display: 'flex', alignItems: 'center', gap: 16,
            padding: '20px 32px 18px',
            borderBottom: `1px solid ${PN.BORDER_HAIR}`,
            background: PN.WHITE_OFF,
          }}>
            <div style={{flex: 1, minWidth: 0}}>
              <h1 style={{margin: 0, fontSize: 24, fontWeight: 600, color: PN.TEXT, letterSpacing: '-0.02em'}}>
                Sala e prenotazioni
              </h1>
            </div>

            <PnNotifBell/>
          </header>
        )}
        {!focus && <PnUnderlineTabs tabs={tabs} active={tab} onChange={setTab}/>}

        <div style={{flex:1, display:'flex', minHeight:0, minWidth:0, overflow:'hidden'}}>
          <div className="pn-scroll" style={{
            flex: 1, overflow: 'auto',
            padding: focus ? '16px 24px 24px' : '16px 10px 24px 18px',
            background: PN.BG,
            minWidth: 0,
          }}>
            {tab === 'tavoli' && (
              <SalaV3Tavoli
                tweaks={tweaks}
                focus={focus}
                onToggleFocus={() => setFocus(f => !f)}
                contiCollapsed={!showContiPanel || contiCollapsed}
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
                  const t = SALA_V3_TAVOLI.find(x => x.id === id);
                  if (t) {
                    t.posti = n;
                    if ((t.coperti || 0) > n) t.coperti = n;
                    if ((t.byup || 0) > n) t.byup = n;
                    setBump(b => b + 1);
                  }
                }}
                onAdjustReservationPosti={(id, n) => {
                  // Pencil su libero/prenotato espansi: edita la party size della prenotazione.
                  const t = SALA_V3_TAVOLI.find(x => x.id === id);
                  if (t && t.nextReservation) {
                    t.nextReservation.posti = n;
                    setBump(b => b + 1);
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
            {tab === 'calendar' && <SalaV3Calendario tweaks={tweaks}
              onNuova={(data) => setModalNuova(data || true)}
              onModifica={(r) => setModalNuova({
                time: r.time, dur: r.dur || 90, tableId: r.table, coperti: r.posti,
                nome: r.name || '', phone: r.phone || '',
                tag: r.note?.type || null, noteText: r.note?.text || '',
                editMode: true,
              })}
            />}
          </div>

          {/* Pannello conti aperti laterale */}
          {showContiPanel && (
            <div style={{padding: '16px 10px 24px 0', flexShrink: 0, display:'flex', minWidth: 0}}>
              <ContiApertiPanel
                collapsed={contiCollapsed}
                onToggle={() => setContiCollapsed(c => !c)}
                onSalda={(conto) => {
                  const idNum = parseInt(String(conto.tavolo).replace(/\D/g,''), 10);
                  const t = SALA_V3_TAVOLI.find(x => x.id === idNum);
                  if (t) setModalPay(t);
                }}/>
            </div>
          )}
        </div>

        <SalaV3ArticoloSheet
          open={!!articoloSheet} tavolo={articoloSheet}
          cart={cart} onCartChange={setCart}
          onClose={() => setArticoloSheet(null)}
          onConfirm={handleConfirmCart}/>

        {confirmedToast && (
          <div style={{
            position:'absolute', bottom: 24, left: '50%', transform:'translateX(-50%)',
            background:'#0F1115', color:'#fff',
            padding:'12px 22px', borderRadius: 999,
            fontSize: 13, fontWeight: 700, zIndex: 50,
            boxShadow:'0 8px 24px rgba(0,0,0,0.18)',
            animation:'fadeIn 0.2s ease',
          }}>{confirmedToast}</div>
        )}

        <SalaV3AperiModal
          tavolo={modalApri}
          onConfirm={() => { openTable(modalApri); setModalApri(null); }}
          onClose={() => setModalApri(null)}/>

        <SalaV3UnisciModal
          tavolo={modalUnisci}
          onClose={() => setModalUnisci(null)}
          onConfirm={handleUnisciConfirm}
          onDetach={handleDetach}
          onSetCoperti={(t, n) => {
            const all = window.SALA_V3_TAVOLI || SALA_V3_TAVOLI;
            const target = all.find(x => x.id === t.id);
            if (!target) return;
            target.posti = n;
            if ((target.coperti || 0) > n) target.coperti = n;
            if ((target.byup || 0) > n) target.byup = n;
            setBump(b => b + 1);
          }}/>

        <SalaV3SpostaModal
          tavolo={modalSposta}
          onClose={() => setModalSposta(null)}
          onConfirm={handleSpostaConfirm}/>

        <SalaModalAggiungi open={!!modalAdd} onClose={() => setModalAdd(null)} tavolo={modalAdd}/>
        <SalaModalConti open={modalConti} onClose={() => setModalConti(false)}/>
        <SalaV3SaldaModal open={!!modalPay} onClose={() => setModalPay(null)} tavolo={modalPay}
          onConfirm={() => {
            if (modalPay && !modalPay._isBanco) {
              modalPay.daIncassare = 0;
              modalPay.contoSaldato = true;
              setBump(b => b + 1);
            }
            if (modalPay?._isBanco && window.SALA_V3_VENDITA_CLEAR) window.SALA_V3_VENDITA_CLEAR();
          }}/>
        <SalaModalNuova open={!!modalNuova} initData={modalNuova && typeof modalNuova === 'object' ? modalNuova : null} onClose={() => setModalNuova(null)}/>

        <TweaksPanel>
        </TweaksPanel>
      </main>
    </div>
  );
}

function DatePickerPopover({ onClose }) {
  const days = Array.from({length: 35}, (_, i) => i - 6 + 1);
  const today = 9;
  return (
    <div onClick={(e)=>e.stopPropagation()} style={{
      position:'absolute', top:'calc(100% + 8px)', left: 0,
      width: 280, padding: 12,
      background: PN.WHITE, borderRadius: 12,
      boxShadow: '0 12px 36px rgba(0,0,0,0.15)',
      border: `1px solid ${PN.BORDER}`,
      zIndex: 30,
    }}>
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: 10}}>
        <button style={{background:'transparent', border:'none', cursor:'pointer', color: PN.TEXT, fontFamily:'inherit', fontSize: 14}}>‹</button>
        <span style={{fontSize: 13, fontWeight: 700, color: PN.TEXT}}>Dicembre 2025</span>
        <button style={{background:'transparent', border:'none', cursor:'pointer', color: PN.TEXT, fontFamily:'inherit', fontSize: 14}}>›</button>
      </div>
      <div style={{display:'grid', gridTemplateColumns:'repeat(7, 1fr)', gap: 2, fontSize: 10, color: PN.MUTED, textAlign:'center', marginBottom: 4}}>
        {['L','M','M','G','V','S','D'].map((d,i)=><span key={i} style={{padding: 4, fontWeight: 700}}>{d}</span>)}
      </div>
      <div style={{display:'grid', gridTemplateColumns:'repeat(7, 1fr)', gap: 2}}>
        {days.map((d, i) => {
          const valid = d>=1 && d<=31;
          const isToday = d === today;
          const hasReservations = valid && [9,10,12,13,14,16,18,20,23].includes(d);
          return (
            <button key={i} disabled={!valid} style={{
              padding: '6px 0', borderRadius: 6,
              background: isToday ? PN.TEXT : 'transparent',
              color: isToday ? '#fff' : (valid ? PN.TEXT : PN.MUTED_LIGHT),
              border: 'none', fontSize: 12, fontWeight: isToday ? 700 : 500,
              cursor: valid ? 'pointer' : 'default', fontFamily:'inherit',
              position:'relative', opacity: valid ? 1 : 0.3,
            }}>
              {valid ? d : ''}
              {hasReservations && !isToday && (
                <span style={{position:'absolute', bottom: 2, left:'50%', transform:'translateX(-50%)',
                  width: 4, height: 4, borderRadius:'50%', background: PN.PINK_DARK}}/>
              )}
            </button>
          );
        })}
      </div>
      <div style={{marginTop: 10, paddingTop: 10, borderTop: `1px dashed ${PN.BORDER_SOFT}`, display:'flex', gap: 8}}>
        <button style={{flex:1, padding:'7px 10px', borderRadius: 8, background: PN.WHITE, color: PN.TEXT,
          border: `1px solid ${PN.BORDER}`, fontSize: 12, fontWeight: 600, cursor:'pointer', fontFamily:'inherit'}}>Oggi</button>
        <button style={{flex:1, padding:'7px 10px', borderRadius: 8, background: PN.WHITE, color: PN.TEXT,
          border: `1px solid ${PN.BORDER}`, fontSize: 12, fontWeight: 600, cursor:'pointer', fontFamily:'inherit'}}>Domani</button>
      </div>
    </div>
  );
}

function SalaV3AperiModal({ tavolo, onConfirm, onClose }) {
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
          fontSize: 11.5, fontWeight: 700,
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
          </svg>
          {badgeLabel}
        </div>
        <div style={{fontSize: 18, fontWeight: 700, color:'#0F1115', marginBottom: 6, letterSpacing:'-0.02em'}}>
          Vuoi aprire il tavolo lo stesso?
        </div>
        {res && (
          <div style={{fontSize: 13, color:'#6B7280', marginBottom: 20, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>
            {res.time} · {res.name} · {res.posti} posti
          </div>
        )}
        <div style={{display:'flex', gap: 8}}>
          <button onClick={onClose} style={{
            flex:1, padding:'11px 14px',
            background: PN.BTN_NEUTRAL, color:'#0F1115',
            border:`1px solid ${PN.BORDER_LIGHT}`,
            borderRadius:10, fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit',
            boxShadow: PN.INSET_HIGHLIGHT,
          }}>Annulla</button>
          <button onClick={onConfirm} style={{
            flex:1, padding:'11px 14px',
            background: PN.BTN_DARK, color:'#fff',
            border:'1px solid rgba(0,0,0,0.32)',
            borderRadius:10, fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit',
            boxShadow: PN.INSET_HIGHLIGHT_DARK,
          }}>Apri tavolo</button>
        </div>
      </div>
    </>
  );
}



const salaV3Root = ReactDOM.createRoot(document.getElementById('root'));
salaV3Root.render(
  <div className="frame" data-screen-label="Sala v3">
    <SalaV3App/>
  </div>
);
