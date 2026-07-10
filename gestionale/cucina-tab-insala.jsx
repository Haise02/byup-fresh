// Cucina — Tab "In sala" (kitchen monitor) — KDS layout
// - Item-level state: tap → todo→doing→done. Auto-promote ticket attivi→prep.
// - Course-aware: items raggruppati per portata, "Fire next course" manuale o da sala.
// - Live age timer (re-render ogni 30s).
// - Urgency: sala su età ticket; asporto/delivery su minuti al pickup.
// - Annulla con conferma; Delivery come 3° kind.

function _ageMin(t) {
  return Math.max(0, CUC_NOW_MIN - _toMin(t));
}

// Tono urgenza generico (per sala, basato su età)
function _urgencyAge(ageMin) {
  if (ageMin <= 8)  return { tone: 'ok',   bg: PN.BG,         dot: PN.MUTED,   text: PN.MUTED   };
  if (ageMin <= 15) return { tone: 'warn', bg: PN.AMBER_SOFT, dot: PN.AMBER,   text: PN.AMBER   };
  return                   { tone: 'late', bg: PN.RED,        dot: PN.RED,     text: PN.WHITE   };
}
// Tono urgenza pickup (asporto/delivery): minuti al ritiro
function _urgencyPickup(minToPickup) {
  if (minToPickup > 15) return { tone: 'ok',   bg: PN.BG,         dot: PN.MUTED,   text: PN.MUTED   };
  if (minToPickup > 5)  return { tone: 'warn', bg: PN.AMBER_SOFT, dot: PN.AMBER,   text: PN.AMBER   };
  return                       { tone: 'late', bg: PN.RED_SOFT,   dot: PN.RED,     text: PN.RED     };
}

const COURSE_LABEL = { 1: 'Antipasti', 2: 'Primi', 3: 'Secondi', 4: 'Dessert' };

function CucinaInSala({ focus = false, onToggleFocus }) {
  const [station, setStation]       = React.useState([]); // [] = tutte
  const [kindFilter, setKindFilter] = React.useState([]); // [] = tutti
  const [onlyLate, setOnlyLate]     = React.useState(false);   // KPI "in ritardo" cliccabile
  const [tick, setTick]             = React.useState(0);       // forza re-render
  const [confirmCancel, setConfirmCancel] = React.useState(null); // { ticketId, col, label }
  const [salaToast, setSalaToast]   = React.useState(null);    // { ticketId, courseLabel } per pulse
  const [readyTickets, setReadyTickets] = React.useState([]);
  const [prontiCollapsed, setProntiCollapsed] = React.useState(true);

  // Stato ticket
  const [tickets, setTickets] = React.useState(() => [
    ...CUC_TICKETS_ATTIVI.map(t => ({...t, items: t.items.map(i => ({...i, state: 'todo'})), firedCourses: new Set([1])})),
    ...CUC_TICKETS_PREP.map(t => ({...t, items: t.items.map(i => ({...i, state: 'doing'})), firedCourses: new Set([1, 2])})),
  ]);

  // Timer live: re-render ogni 30s (e simula scorrere del tempo)
  React.useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 30000);
    return () => clearInterval(id);
  }, []);

  // Pulse fire-from-sala dopo 4s
  React.useEffect(() => {
    if (!salaToast) return;
    const id = setTimeout(() => setSalaToast(null), 4000);
    return () => clearTimeout(id);
  }, [salaToast]);

  const stations = ['Pizza','Primi','Secondi','Contorni','Bevande'];

  // KPI live
  const allTickets = tickets;
  const totItems = tickets.reduce((s, t) => s + t.items.reduce((a,i) => a + i.qty, 0), 0);
  const inCottura = tickets.filter(t => t.items.some(i => i.state === 'doing')).length;
  const lateCount = tickets.filter(t => _ageMin(t.time) > 15).length;
  const avgAge = tickets.length
    ? Math.round(tickets.reduce((s, t) => s + _ageMin(t.time), 0) / tickets.length)
    : 0;

  const matchKind = t => kindFilter.length === 0
    || (kindFilter.includes('Sala') && t.kind === 'sala')
    || (kindFilter.includes('Asporto') && t.kind === 'asporto')
    || (kindFilter.includes('Delivery') && t.kind === 'delivery');
  const matchStation = t => station.length === 0 || station.includes(t.station);
  const matchLate = t => {
    if (!onlyLate) return true;
    const age = _ageMin(t.time);
    const minToPickup = t.pickup ? _toMin(t.pickup) - CUC_NOW_MIN : null;
    const u = (t.kind === 'asporto' || t.kind === 'delivery') && t.pickup
      ? _urgencyPickup(minToPickup)
      : _urgencyAge(age);
    return u.tone === 'late';
  };
  const matchAll = t => matchKind(t) && matchStation(t) && matchLate(t);
  // Left: nessun piatto attivamente in cottura (todo puro, o done+todo dopo fine cottura). Right: almeno un piatto in cottura.
  const filteredLeft  = tickets.filter(t => matchAll(t) && !t.items.some(i => i.state === 'doing'));
  const filteredRight = tickets.filter(t => matchAll(t) && t.items.some(i => i.state === 'doing'));

  function bumpItem(ticketId, itemIdx) {
    setTickets(prev => {
      const original = prev.find(t => t.id === ticketId);
      const hadDoing = original && original.items.some(i => i.state === 'doing');
      const updated = prev.map(t => {
        if (t.id !== ticketId) return t;
        return {...t, items: t.items.map((it, i) => {
          if (i !== itemIdx) return it;
          return {...it, state: it.state === 'todo' ? 'doing' : it.state === 'doing' ? 'done' : it.state};
        })};
      });
      const ticket = updated.find(t => t.id === ticketId);
      // Coda → Preparazione: va in fondo
      if (!hadDoing && ticket && ticket.items.some(i => i.state === 'doing')) {
        return [...updated.filter(t => t.id !== ticketId), ticket];
      }
      return updated;
    });
  }

  function bumpItems(ticketId, itemIndices) {
    const idxSet = new Set(itemIndices);
    setTickets(prev => {
      const original = prev.find(t => t.id === ticketId);
      const hadDoing = original && original.items.some(i => i.state === 'doing');
      const updated = prev.map(t => {
        if (t.id !== ticketId) return t;
        return {...t, items: t.items.map((it, i) => {
          if (!idxSet.has(i) || it.state !== 'todo') return it;
          return {...it, state: 'doing'};
        })};
      });
      const ticket = updated.find(t => t.id === ticketId);
      if (!hadDoing && ticket && ticket.items.some(i => i.state === 'doing')) {
        return [...updated.filter(t => t.id !== ticketId), ticket];
      }
      return updated;
    });
  }

  function startAll(ticketId) {
    setTickets(prev => {
      const updated = prev.map(t => {
        if (t.id !== ticketId) return t;
        return {...t, items: t.items.map(it => it.state === 'todo' ? {...it, state: 'doing'} : it)};
      });
      // Coda → Preparazione: va in fondo
      const ticket = updated.find(t => t.id === ticketId);
      return [...updated.filter(t => t.id !== ticketId), ticket];
    });
  }

  function markReady(ticketId) {
    const t = tickets.find(x => x.id === ticketId);
    if (!t) return;
    setTickets(prev => prev.filter(x => x.id !== ticketId));
    setReadyTickets(prev => [t, ...prev]);
  }

  function fireCourse(ticketId, course) {
    setTickets(prev => prev.map(t => {
      if (t.id !== ticketId) return t;
      const fc = new Set(t.firedCourses); fc.add(course);
      const items = t.items.map(i => i.course === course && i.state === 'todo' ? {...i, state: 'doing'} : i);
      return {...t, firedCourses: fc, items};
    }));
  }

  function simulateFireFromSala() {
    for (const t of tickets.filter(t => t.items.some(i => i.course))) {
      const courses = [...new Set(t.items.filter(i => i.course).map(i => i.course))].sort();
      const next = courses.find(c => !t.firedCourses.has(c));
      if (next) {
        fireCourse(t.id, next);
        setSalaToast({ ticketId: t.id, courseLabel: COURSE_LABEL[next] });
        return;
      }
    }
  }

  function revertItems(ticketId, itemIndices) {
    const idxSet = new Set(itemIndices);
    setTickets(prev => {
      const updated = prev.map(t => {
        if (t.id !== ticketId) return t;
        return {...t, items: t.items.map((it, i) => {
          if (!idxSet.has(i)) return it;
          if (it.state === 'done')  return {...it, state: 'doing'};
          if (it.state === 'doing') return {...it, state: 'todo'};
          return it;
        })};
      });
      const ticket = updated.find(t => t.id === ticketId);
      // Preparazione → Coda: va in cima
      if (ticket && !ticket.items.some(i => i.state === 'doing')) {
        return [ticket, ...updated.filter(t => t.id !== ticketId)];
      }
      return updated;
    });
  }

  // Auto-promuove in Pronti quando tutti i piatti sono done
  React.useEffect(() => {
    const done = tickets.filter(t => t.items.length > 0 && t.items.every(i => i.state === 'done'));
    if (done.length === 0) return;
    const doneIds = new Set(done.map(t => t.id));
    setTickets(prev => prev.filter(t => !doneIds.has(t.id)));
    setReadyTickets(prev => [...done, ...prev]);
  }, [tickets]);

  function revertReadyItem(ticketId, itemIdx) {
    const ticket = readyTickets.find(t => t.id === ticketId);
    if (!ticket) return;
    const updatedItems = ticket.items.map((it, i) => i === itemIdx ? {...it, state: 'doing'} : it);
    setReadyTickets(prev => prev.filter(t => t.id !== ticketId));
    // Pronti → Preparazione: va in cima
    setTickets(prev => [{...ticket, items: updatedItems}, ...prev]);
  }

  function revertReadyCard(ticketId) {
    const ticket = readyTickets.find(t => t.id === ticketId);
    if (!ticket) return;
    const updatedItems = ticket.items.map(it => ({...it, state: 'doing'}));
    setReadyTickets(prev => prev.filter(t => t.id !== ticketId));
    // Pronti → Preparazione: va in cima
    setTickets(prev => [{...ticket, items: updatedItems}, ...prev]);
  }

  function requestCancel(ticketId) {
    const t = tickets.find(x => x.id === ticketId);
    if (!t) return;
    const label = t.kind === 'sala' ? `Tavolo ${t.table}` : t.customer;
    setConfirmCancel({ ticketId, label, count: t.items.reduce((a,i) => a+i.qty, 0) });
  }
  function confirmCancelDo() {
    setTickets(prev => prev.filter(t => t.id !== confirmCancel.ticketId));
    setConfirmCancel(null);
  }

  return (
    <div style={{
      position: 'relative',
      display: 'flex',
      gap: 12,
      height: focus ? '100%' : 'auto',
    }}>

      <div style={{
        flex: 1, minWidth: 0,
        position: 'relative', isolation: 'isolate',
        // Board LIGHT (W1): il dark resta solo sulle card in ritardo
        background: PN.WHITE,
        borderRadius: focus ? 0 : 20,
        border: focus ? 'none' : `1px solid ${PN.BORDER_HAIR}`,
        boxShadow: focus ? 'none' : '0 1px 0 rgba(15,17,21,0.04), 0 6px 20px rgba(15,17,21,0.04)',
        padding: focus ? '20px 28px' : 22,
        display: focus ? 'flex' : 'block',
        flexDirection: focus ? 'column' : 'unset',
        minHeight: focus ? 0 : 'auto',
      }}>
        {/* Header */}
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: 16, gap: 12}}>
          <div style={{display:'flex', alignItems:'center', gap: 8}}>
            <KdsFilterChip
              label="Canali" selected={kindFilter} defaultLabel="Tutti i canali"
              options={['Sala','Asporto','Delivery']}
              onChange={setKindFilter}
            />
            <KdsFilterChip
              label="Categorie" selected={station} defaultLabel="Tutte le categorie"
              options={stations}
              onChange={setStation}
            />
            {lateCount > 0 && (
              <button onClick={() => setOnlyLate(v => !v)} title="Mostra solo i ritardi" style={{
                height: 36, minWidth: 36, padding: '0 11px', borderRadius: 10, flexShrink: 0,
                background: onlyLate ? 'rgba(220, 38, 38, 0.16)' : 'rgba(220, 38, 38, 0.08)',
                border: 'none',
                boxShadow: `inset 0 0 0 1px rgba(220, 38, 38, ${onlyLate ? 0.55 : 0.35})`,
                color: '#DC2626',
                cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5,
                fontFamily: 'inherit',
                transition: 'background 150ms ease-out, box-shadow 150ms ease-out',
              }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13" stroke="#FFF" strokeWidth="2" strokeLinecap="round"/><line x1="12" y1="17" x2="12.01" y2="17" stroke="#FFF" strokeWidth="2" strokeLinecap="round"/></svg>
                <span style={{fontSize: 15, fontWeight: 700, lineHeight: 1}}>{lateCount}</span>
              </button>
            )}
          </div>
          <button onClick={onToggleFocus} title={focus ? 'Esci da schermo intero' : 'Schermo intero'} style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'rgba(15, 17, 21, 0.04)',
            border: 'none',
            boxShadow: 'inset 0 0 0 1px rgba(15, 17, 21, 0.10)',
            color: PN.TEXT,
            cursor:'pointer', display:'grid', placeItems:'center', fontFamily:'inherit',
            transition: 'background 150ms ease-out',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(15,17,21,0.08)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(15,17,21,0.04)'; }}
          >{focus ? <ExitFullIcon/> : <EnterFullIcon/>}</button>
        </div>

        {/* Colonne fluide — scroll orizzontale morbido quando manca spazio */}
        <div className="pn-scroll" style={{
          display:'flex', gap: focus ? 18 : 16,
          flex: focus ? 1 : 'none', minHeight: focus ? 0 : 'auto',
          overflowX: 'auto', overflowY: focus ? 'auto' : 'visible',
          scrollBehavior: 'smooth',
          alignItems: 'flex-start',
        }}>
          <KdsColumn title="In attesa" toneKey="ok" count={filteredLeft.length} empty="Nessun ordine in attesa">
            {filteredLeft.map(t => (
              <KdsTicket
                key={t.id} ticket={t}
                onBumpItem={(idx) => bumpItem(t.id, idx)}
                onBumpItems={(indices) => bumpItems(t.id, indices)}
                onPrimary={() => startAll(t.id)}
                onMarkReady={() => markReady(t.id)}
                onCancel={() => requestCancel(t.id)}
                onRevertItems={(indices) => revertItems(t.id, indices)}
              />
            ))}
          </KdsColumn>

          <KdsColumn title="In preparazione" toneKey="doing" count={filteredRight.length} empty="Nessun ordine in preparazione">
            {filteredRight.map(t => (
              <KdsTicket
                key={t.id} ticket={t}
                onBumpItem={(idx) => bumpItem(t.id, idx)}
                onBumpItems={(indices) => bumpItems(t.id, indices)}
                onPrimary={() => startAll(t.id)}
                onMarkReady={() => markReady(t.id)}
                onCancel={() => requestCancel(t.id)}
                onRevertItems={(indices) => revertItems(t.id, indices)}
              />
            ))}
          </KdsColumn>
        </div>
      </div>

      {/* Modal conferma annulla — backdrop blur + glass strong */}
      <KdsProntiPanel
        tickets={readyTickets}
        collapsed={prontiCollapsed}
        onToggle={() => setProntiCollapsed(c => !c)}
        onRevertItem={revertReadyItem}
        onRevertCard={revertReadyCard}
      />

      {confirmCancel && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'rgba(15, 17, 21, 0.42)',
          backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
          display: 'grid', placeItems: 'center', zIndex: 50,
          borderRadius: focus ? 0 : 12,
        }} onClick={() => setConfirmCancel(null)}>
          <div onClick={e => e.stopPropagation()} style={{
            ...PN.GLASS_STRONG,
            borderRadius: 14, padding: 22, width: 380,
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12, background: PN.RED_SOFT, color: PN.RED,
              display:'grid', placeItems:'center', marginBottom: 12,
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 9v4M12 17h.01"/><circle cx="12" cy="12" r="10"/>
              </svg>
            </div>
            <div style={{fontSize: 19, fontWeight: 700, color: PN.TEXT, marginBottom: 6}}>Annullare questa comanda?</div>
            <div style={{fontSize: 15, color: PN.MUTED, lineHeight: 1.5, marginBottom: 18}}>
              Stai per annullare <strong style={{color: PN.TEXT}}>{confirmCancel.label}</strong> — {confirmCancel.count} piatti. Non sarà più visibile in cucina.
            </div>
            <div style={{display:'flex', gap: 10, justifyContent:'flex-end'}}>
              <button onClick={() => setConfirmCancel(null)} style={{
                padding:'9px 16px', borderRadius: 999, background: PN.BTN_NEUTRAL, color: PN.TEXT,
                border: `1px solid ${PN.BORDER_LIGHT}`, fontSize: 15, fontWeight: 600, cursor:'pointer', fontFamily:'inherit',
                boxShadow: PN.INSET_HIGHLIGHT,
              }}>No, mantieni</button>
              <button onClick={confirmCancelDo} style={{
                padding:'9px 16px', borderRadius: 999,
                background: 'linear-gradient(180deg, #E94343 0%, #DC2626 100%)', color: PN.WHITE,
                border:'1px solid rgba(124, 14, 14, 0.40)', fontSize: 15, fontWeight: 700, cursor:'pointer', fontFamily:'inherit',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.30), 0 1px 2px rgba(220,38,38,0.18)',
              }}>Sì, annulla</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Pronti panel ────────────────────────────────────────────
function KdsProntiPanel({ tickets, collapsed, onToggle, onRevertItem, onRevertCard }) {
  // Pannello Pronti — light come la board, accento verde menta
  const darkPanel = {
    background: `
      radial-gradient(circle at 80% 6%, rgba(52, 211, 153, 0.08), transparent 50%),
      linear-gradient(${PN.WHITE}, ${PN.WHITE})
    `,
    border: `1px solid ${PN.BORDER_HAIR}`,
    boxShadow: '0 1px 0 rgba(15,17,21,0.04), 0 6px 20px rgba(15,17,21,0.04)',
  };
  if (collapsed) {
    return (
      <div onClick={onToggle} style={{
        width: 40, flexShrink: 0, alignSelf: 'stretch',
        ...darkPanel,
        borderRadius: 16, cursor: 'pointer',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '14px 0', gap: 10,
      }}>
        <span style={{
          writingMode: 'vertical-rl', transform: 'rotate(180deg)',
          fontSize: 13, fontWeight: 700, color: KDS_CL.text,
          letterSpacing: 0.6, textTransform: 'uppercase', whiteSpace: 'nowrap',
        }}>Pronti</span>
        <KdsPill light tone="done" style={{fontSize: 12}}>{tickets.length}</KdsPill>
      </div>
    );
  }

  return (
    <div style={{
      width: 280, flexShrink: 0, alignSelf: 'stretch',
      ...darkPanel,
      borderRadius: 16,
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
    }}>
      <div style={{
        padding: '12px 14px', borderBottom: '1px solid rgba(15, 17, 21, 0.07)',
        display: 'flex', alignItems: 'center', gap: 8,
        flexShrink: 0,
      }}>
        <span style={{fontSize: 17, fontWeight: 700, color: KDS_CL.text, letterSpacing: '-0.01em'}}>Pronti</span>
        <KdsPill light tone="done" style={{fontSize: 12.5, fontVariantNumeric: 'tabular-nums'}}>{tickets.length}</KdsPill>
        <span style={{flex: 1}}/>
        <button onClick={onToggle} title="Comprimi pannello" style={{
          background: 'transparent', border: 'none', cursor: 'pointer',
          color: KDS_CL.mut, fontFamily: 'inherit', fontSize: 22, padding: 4,
          lineHeight: 1, width: 32, height: 32, display: 'grid', placeItems: 'center',
        }}>›</button>
      </div>
      <div style={{flex: 1, overflowY: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 10}}>
        {tickets.map(ticket => (
          <KdsProntiCard
            key={ticket.id}
            ticket={ticket}
            onRevertItem={(idx) => onRevertItem(ticket.id, idx)}
            onRevertCard={() => onRevertCard(ticket.id)}
          />
        ))}
      </div>
    </div>
  );
}

function KdsProntiCard({ ticket, onRevertItem, onRevertCard }) {
  return (
    <div
      style={{
        background: PN.WHITE,
        borderRadius: 16,
        border: 'none',
        overflow: 'hidden',
        boxShadow: [
          'inset 0 0 0 1px rgba(16, 185, 129, 0.28)',
          '0 4px 14px -4px rgba(15, 17, 21, 0.08)',
        ].join(', '),
      }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px',
        borderBottom: '1px solid rgba(15, 17, 21, 0.06)',
      }}>
        <div style={{flex: 1, minWidth: 0}}>
          <div style={{fontSize: 17, fontWeight: 800, color: KDS_CL.text, letterSpacing: '-0.01em'}}>
            {ticket.kind === 'sala'
              ? <React.Fragment><span style={{fontSize: 11.5, fontWeight: 700, color: KDS_CL.mut}}>Tavolo </span>{ticket.table}</React.Fragment>
              : ticket.customer}
          </div>
          {(ticket.kind === 'asporto' || ticket.kind === 'delivery') && ticket.pickup && (
            <div style={{fontSize: 12, color: KDS_CL.mut, marginTop: 1}}>
              {ticket.kind === 'delivery' ? 'Consegna' : 'Ritiro'} {ticket.pickup}
            </div>
          )}
        </div>
        {/* Ritorno esplicito: tutto il ticket torna in preparazione */}
        <button onClick={onRevertCard} title="Riporta il ticket in preparazione" style={{
          padding: '6px 10px', borderRadius: 999, flexShrink: 0,
          background: 'rgba(15, 17, 21, 0.04)',
          border: 'none', boxShadow: 'inset 0 0 0 1px rgba(15, 17, 21, 0.10)',
          color: KDS_CL.sub, cursor: 'pointer', fontFamily: 'inherit',
          fontSize: 12, fontWeight: 700,
          display: 'inline-flex', alignItems: 'center', gap: 4,
        }}>
          <RevertArrowIcon/> Rimanda tutti in cucina
        </button>
      </div>
      {ticket.items.map((it, i) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px',
          borderTop: i > 0 ? '1px solid rgba(15, 17, 21, 0.05)' : 'none',
        }}>
          <span style={{flex: 1, fontSize: 15, fontWeight: 500, color: KDS_CL.mut, textDecoration: 'line-through'}}>{it.name}</span>
          {it.qty > 1 && <span style={{fontSize: 13, fontWeight: 700, color: KDS_CL.mut}}>×{it.qty}</span>}
          <KdsStepBtn dir="back" title="Riporta in preparazione" onClick={() => onRevertItem(i)}/>
        </div>
      ))}
    </div>
  );
}

// ─── Column ────────────────────────────────────────────────
// Pannello in vetro scuro leggerissimo: la colonna è un contenitore calmo,
// l'identità di stato sta nella pill del conteggio (toneKey di KDS_TONE).
function KdsColumn({ title, toneKey = 'ok', count, empty, children }) {
  const tm = KDS_TONE_L[toneKey] || KDS_TONE_L.ok;
  return (
    <div style={{
      flex: '1 0 340px', minWidth: 340,
      background: 'rgba(15, 17, 21, 0.025)',
      borderRadius: 18, padding: 14,
      boxShadow: 'inset 0 0 0 1px rgba(15, 17, 21, 0.06)',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        marginBottom: 14, padding: '4px 4px',
      }}>
        <span style={{
          width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
          background: tm.dot, boxShadow: `0 0 0 3px ${tm.tint}`,
        }}/>
        <span style={{fontSize: 19, fontWeight: 700, color: KDS_CL.text, letterSpacing: '-0.01em'}}>{title}</span>
        <KdsPill light tone={toneKey} style={{fontSize: 13, fontVariantNumeric: 'tabular-nums'}}>{count}</KdsPill>
      </div>
      {count === 0 ? (
        <div style={{
          padding: '36px 16px', textAlign: 'center', borderRadius: 14,
          border: '1px dashed rgba(15, 17, 21, 0.15)',
          color: KDS_CL.mut, fontSize: 14.5,
        }}>{empty}</div>
      ) : (
        <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>{children}</div>
      )}
    </div>
  );
}

// ─── Ticket ────────────────────────────────────────────────
function KdsTicket({ ticket, onBumpItem, onBumpItems, onPrimary, onMarkReady, onCancel, onRevertItems }) {
  const age = _ageMin(ticket.time);
  const minToPickup = ticket.pickup ? _toMin(ticket.pickup) - CUC_NOW_MIN : null;
  const u = (ticket.kind === 'asporto' || ticket.kind === 'delivery') && ticket.pickup
    ? _urgencyPickup(minToPickup)
    : _urgencyAge(age);

  const todoItems  = ticket.items.map((it, i) => ({...it, idx: i})).filter(it => it.state === 'todo');
  const doingItems = ticket.items.map((it, i) => ({...it, idx: i})).filter(it => it.state === 'doing');
  const doneItems  = ticket.items.map((it, i) => ({...it, idx: i})).filter(it => it.state === 'done');
  const allDone    = ticket.items.length > 0 && ticket.items.every(i => i.state === 'done');
  const hasTodo    = todoItems.length > 0;

  const [doneCollapsed, setDoneCollapsed] = React.useState(true);
  const [todoCollapsed, setTodoCollapsed] = React.useState(true);
  const [servedFlash, setServedFlash] = React.useState(false);
  const prevDoneLen = React.useRef(doneItems.length);

  // Debounce 10s — accumula tap sui piatti in coda se ce ne sono più di uno
  const [pendingTodo, setPendingTodo] = React.useState(new Set());
  const [pendingCountdown, setPendingCountdown] = React.useState(0);
  const pendingTimer = React.useRef(null);
  const countdownInterval = React.useRef(null);

  const isInQueue = !ticket.items.some(i => i.state === 'doing');

  const flushPending = (pending) => {
    clearTimeout(pendingTimer.current);
    clearInterval(countdownInterval.current);
    if (pending.size > 0) onBumpItems(Array.from(pending));
    setPendingTodo(new Set());
    setPendingCountdown(0);
  };

  const handleTodoTap = (idx) => {
    if (!isInQueue || todoItems.length <= 1) {
      onBumpItem(idx);
      return;
    }
    setPendingTodo(prev => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
    // Reset timer debounce 10s
    clearTimeout(pendingTimer.current);
    clearInterval(countdownInterval.current);
    setPendingCountdown(10);
    let remaining = 10;
    countdownInterval.current = setInterval(() => {
      remaining -= 1;
      setPendingCountdown(remaining);
      if (remaining <= 0) clearInterval(countdownInterval.current);
    }, 1000);
    pendingTimer.current = setTimeout(() => {
      setPendingTodo(prev => { flushPending(prev); return new Set(); });
    }, 10000);
  };

  React.useEffect(() => () => {
    clearTimeout(pendingTimer.current);
    clearInterval(countdownInterval.current);
  }, []);

  // Auto-espande i todo quando l'ultimo piatto in cottura viene segnato servito
  React.useEffect(() => {
    if (doneItems.length > prevDoneLen.current) {
      setServedFlash(true);
      const id = setTimeout(() => setServedFlash(false), 1800);
      prevDoneLen.current = doneItems.length;
      return () => clearTimeout(id);
    }
    prevDoneLen.current = doneItems.length;
  }, [doneItems.length]);

  React.useEffect(() => {
    if (doingItems.length === 0 && doneItems.length > 0 && todoItems.length > 0) {
      setTodoCollapsed(false);
    }
  }, [doingItems.length]);

const lateGlow = u.tone === 'late';
  const toneKey = u.tone === 'late' ? 'late' : u.tone === 'warn' ? 'warn' : 'ok';
  // La card in RITARDO resta in vetro scuro sunset: è il segnale d'urgenza.
  // Tutte le altre sono light.
  const dark = lateGlow;
  const C = dark ? KDS_C : KDS_CL;
  const tm = (dark ? KDS_TONE : KDS_TONE_L)[toneKey];
  const isPickupKind = (ticket.kind === 'asporto' || ticket.kind === 'delivery') && ticket.pickup;
  const kindBadge = ticket.kind === 'asporto' ? { label: 'ASPORTO', icon: <BagIcon/> }
    : ticket.kind === 'delivery' ? { label: 'DELIVERY', icon: <ScooterIcon/> }
    : null;
  const totQty  = ticket.items.reduce((s, i) => s + i.qty, 0);
  const doneQty = ticket.items.reduce((s, i) => s + (i.state === 'done' ? i.qty : 0), 0);
  const progressPct = totQty > 0 ? (doneQty / totQty) * 100 : 0;

  // Ring interno: specular caldo (dark) o hairline neutra (light); si scalda
  // (ambra/coral traslucido) con l'urgenza — mai fondi rossi pieni.
  const innerRing = toneKey === 'ok'
    ? (dark ? 'inset 0 0 0 1px rgba(255, 130, 150, 0.12)' : 'inset 0 0 0 1px rgba(15, 17, 21, 0.08)')
    : `inset 0 0 0 1px ${tm.ring}`;

  return (
    <div
      style={{
        position: 'relative',
        borderRadius: 20,
        // In ritardo: vetro scuro D3 + inset specular caldo. Altrimenti: carta light W1.
        background: dark
          ? `radial-gradient(circle at 82% 12%, rgba(255, 96, 102, 0.20), transparent 60%),
             linear-gradient(180deg, #2C0C10 0%, #1A0708 100%)`
          : PN.WHITE,
        border: 'none',
        overflow: 'hidden',
        boxShadow: dark ? [
          'inset 0 1px 0 rgba(255, 200, 210, 0.18)',
          innerRing,
          '0 0 0 3px rgba(255, 90, 95, 0.18)',
          '0 14px 36px -10px rgba(80, 10, 30, 0.55)',
          '0 4px 10px -4px rgba(80, 10, 30, 0.30)',
        ].join(', ') : [
          innerRing,
          '0 4px 14px -4px rgba(15, 17, 21, 0.08)',
          '0 1px 2px rgba(15, 17, 21, 0.04)',
        ].join(', '),
        animation: lateGlow ? 'kdsLatePulse 2.4s ease-in-out infinite' : 'none',
        color: C.text,
        transition: 'box-shadow 0.2s',
      }}>
      <style>{`@keyframes kdsLatePulse {
        0%,100% { outline: 3px solid rgba(255,90,95,0.16); outline-offset: 0; }
        50%     { outline: 3px solid rgba(255,90,95,0.34); outline-offset: 1px; }
      }`}</style>

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px',
        borderBottom: `1px solid ${C.hair}`,
      }}>
        <div style={{flex: 1, minWidth: 0}}>
          {kindBadge ? (
            <React.Fragment>
              <div style={{display:'flex', alignItems:'center', gap: 6, marginBottom: 4}}>
                <span style={{
                  fontSize: 10, fontWeight: 700, padding:'2px 8px', borderRadius: 999,
                  background: dark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(15, 17, 21, 0.04)',
                  boxShadow: `inset 0 0 0 1px ${dark ? 'rgba(255, 255, 255, 0.10)' : 'rgba(15, 17, 21, 0.10)'}`,
                  color: C.sub,
                  letterSpacing: '0.07em', display:'inline-flex', alignItems:'center', gap: 4,
                }}>{kindBadge.icon} {kindBadge.label}</span>
              </div>
              <div style={{fontSize: 19, fontWeight: 800, color: C.text, lineHeight: 1.1, letterSpacing: '-0.01em', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>
                {ticket.customer}
              </div>
            </React.Fragment>
          ) : (
            <div style={{fontSize: 24, fontWeight: 800, color: C.text, lineHeight: 1, letterSpacing: '-0.02em'}}>
              <span style={{fontSize: 14, fontWeight: 700, color: C.mut, letterSpacing: '0.02em'}}>Tavolo </span>{ticket.table}
            </div>
          )}
        </div>
        {isInQueue && hasTodo && (
          <button onClick={onPrimary} title="Avvia tutti i piatti" style={{
            padding: '7px 12px', borderRadius: 999, flexShrink: 0,
            background: dark ? 'rgba(245, 158, 11, 0.18)' : 'rgba(245, 158, 11, 0.14)',
            boxShadow: 'inset 0 0 0 1px rgba(245, 158, 11, 0.50)',
            border: 'none', color: dark ? '#FFC964' : '#B45309',
            fontSize: 12.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
            whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: 5,
            transition: 'background 150ms ease-out',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = dark ? 'rgba(245,158,11,0.28)' : 'rgba(245,158,11,0.22)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = dark ? 'rgba(245,158,11,0.18)' : 'rgba(245,158,11,0.14)'; }}
          >Inizia tutto <ForwardArrowIcon/></button>
        )}
        {!isInQueue && (
          <React.Fragment>
            {/* Secondaria: rimette in coda tutti i piatti in cottura */}
            <button
              onClick={() => onRevertItems(doingItems.map(it => it.idx))}
              title="Rimetti in coda"
              style={{
                width: 30, height: 30, borderRadius: 999, flexShrink: 0,
                background: dark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 17, 21, 0.04)',
                boxShadow: `inset 0 0 0 1px ${dark ? 'rgba(255, 255, 255, 0.14)' : 'rgba(15, 17, 21, 0.10)'}`,
                border: 'none', color: C.sub, cursor: 'pointer', fontFamily: 'inherit',
                display: 'grid', placeItems: 'center',
                transition: 'background 150ms ease-out, color 150ms ease-out',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = dark ? 'rgba(255,255,255,0.14)' : 'rgba(15,17,21,0.08)'; e.currentTarget.style.color = C.text; }}
              onMouseLeave={e => { e.currentTarget.style.background = dark ? 'rgba(255,255,255,0.08)' : 'rgba(15,17,21,0.04)'; e.currentTarget.style.color = C.sub; }}
            ><RevertArrowIcon/></button>
            {/* Primaria: tutto il ticket passa in Pronti */}
            <button onClick={onMarkReady} title="Sposta il ticket in Pronti" style={{
              padding: '7px 12px', borderRadius: 999, flexShrink: 0,
              background: dark ? 'rgba(52, 211, 153, 0.16)' : 'rgba(16, 185, 129, 0.10)',
              boxShadow: 'inset 0 0 0 1px rgba(16, 185, 129, 0.45)',
              border: 'none', color: dark ? '#6EE7B7' : '#059669',
              fontSize: 12.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
              whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: 5,
              transition: 'background 150ms ease-out',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = dark ? 'rgba(52,211,153,0.24)' : 'rgba(16,185,129,0.16)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = dark ? 'rgba(52,211,153,0.16)' : 'rgba(16,185,129,0.10)'; }}
            >Tutto pronto <ForwardArrowIcon/></button>
          </React.Fragment>
        )}
        {/* Tempo — accento traslucido, il segnale d'urgenza */}
        <div style={{
          textAlign: 'center', padding: '7px 12px', borderRadius: 13,
          background: tm.tint,
          boxShadow: `inset 0 0 0 1px ${tm.ring}`,
          color: tm.ink, minWidth: 58, flexShrink: 0,
        }}>
          <div style={{fontSize: 20, fontWeight: 800, lineHeight: 1, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em'}}>
            {isPickupKind ? (minToPickup <= 0 ? 'ora' : `${minToPickup}′`) : `${age}′`}
          </div>
          <div style={{fontSize: 8.5, fontWeight: 700, marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.7}}>
            {isPickupKind ? 'al ritiro' : 'attesa'}
          </div>
        </div>
      </div>

      {/* FASCIA 1 — Serviti (done): priorità minima, collassata di default */}
      {doneItems.length > 0 && (
        <div style={{borderBottom: `1px solid ${C.hair}`}}>
          <style>{`@keyframes servedFade { 0% { background: rgba(52,211,153,0.16); } 100% { background: ${dark ? 'rgba(255,255,255,0.04)' : 'rgba(15,17,21,0.03)'}; } }`}</style>
          <div onClick={() => setDoneCollapsed(c => !c)} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '11px 14px', cursor: 'pointer',
            background: dark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(15, 17, 21, 0.03)',
            animation: servedFlash ? 'servedFade 1.8s ease-out forwards' : 'none',
          }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontSize: 12.5, fontWeight: 700, color: dark ? '#6EE7B7' : '#059669',
              textTransform: 'uppercase', letterSpacing: '0.06em',
            }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              Serviti · {doneItems.length}
            </span>
            <span style={{fontSize: 12, color: C.mut}}>{doneCollapsed ? '▾' : '▴'}</span>
          </div>
          {!doneCollapsed && doneItems.map(it => (
            <div key={it.idx} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
              borderTop: `1px solid ${C.hair}`,
            }}>
              <span style={{flex:1, fontSize: 16, fontWeight: 500, color: C.mut, textDecoration: 'line-through'}}>{it.name}</span>
              <KdsStepBtn dir="back" dark={dark} title="Riporta in preparazione" onClick={() => onRevertItems([it.idx])}/>
            </div>
          ))}
        </div>
      )}

      {/* FASCIA 2 — In preparazione (doing): tap → selezione → CTA "Servi" */}
      {doingItems.length > 0 && (
        <div style={{borderBottom: todoItems.length > 0 ? `1px solid ${C.hair}` : 'none'}}>
          {doingItems.map(it => (
            <KdsItemRow
              key={it.idx} item={it} dark={dark}
              onBump={() => onBumpItem(it.idx)}
              onRevert={() => onRevertItems([it.idx])}
              selected={false}
              inSelectionMode={false}
            />
          ))}
        </div>
      )}

      {/* FASCIA 3 — In coda (todo): collassata di default nella colonna preparazione */}
      {todoItems.length > 0 && (
        <div>
          {doingItems.length > 0 ? (
            <React.Fragment>
              <div onClick={() => setTodoCollapsed(c => !c)} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '11px 14px',
                borderBottom: !todoCollapsed ? `1px solid ${C.hair}` : 'none',
                cursor: 'pointer',
              }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  fontSize: 12.5, fontWeight: 700, color: C.sub,
                  textTransform: 'uppercase', letterSpacing: '0.06em',
                }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/></svg>
                  In attesa · {todoItems.length}
                </span>
                <span style={{fontSize: 12, color: C.mut}}>{todoCollapsed ? '▾' : '▴'}</span>
              </div>
              {!todoCollapsed && todoItems.map(it => (
                <KdsItemRow key={it.idx} item={it} dark={dark} onBump={() => handleTodoTap(it.idx)} selected={pendingTodo.has(it.idx)}/>
              ))}
            </React.Fragment>
          ) : (
            todoItems.map(it => (
              <KdsItemRow key={it.idx} item={it} dark={dark} onBump={() => handleTodoTap(it.idx)} selected={pendingTodo.has(it.idx)}/>
            ))
          )}
        </div>
      )}

      {/* Debounce countdown banner — ambra traslucida */}
      {pendingTodo.size > 0 && pendingCountdown > 0 && (
        <div style={{
          padding: '9px 14px',
          background: dark ? 'rgba(245, 158, 11, 0.12)' : 'rgba(245, 158, 11, 0.10)',
          borderTop: `1px solid rgba(245, 158, 11, ${dark ? 0.30 : 0.35})`,
        }}>
          <span style={{fontSize: 13, fontWeight: 700, color: dark ? '#FFC964' : '#B45309'}}>
            Avvio in {pendingCountdown}s · {pendingTodo.size} piatt{pendingTodo.size === 1 ? 'o' : 'i'}
          </span>
        </div>
      )}

      {/* Avanzamento — barra sottile, mai blocchi saturi */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 16px 12px',
        borderTop: `1px solid ${C.hair}`,
      }}>
        <div style={{flex: 1, height: 3, borderRadius: 2, background: dark ? 'rgba(255,255,255,0.08)' : 'rgba(15,17,21,0.08)', overflow: 'hidden'}}>
          <div style={{
            width: `${progressPct}%`, height: '100%', borderRadius: 2,
            background: doneQty === totQty && totQty > 0
              ? 'linear-gradient(90deg, #34D399, #6EE7B7)'
              : 'linear-gradient(90deg, #FF5A5F, #FB923C)',
            transition: 'width 320ms cubic-bezier(0.22, 1, 0.36, 1)',
          }}/>
        </div>
        <span style={{fontSize: 11.5, fontWeight: 700, color: C.mut, fontVariantNumeric: 'tabular-nums', flexShrink: 0}}>
          {doneQty}/{totQty}
        </span>
      </div>
    </div>
  );
}

// ─── Item row ───────────────────────────────────────────────
function KdsItemRow({ item, onBump, onRevert, dark = false, disabled = false, selected = false, inSelectionMode = false }) {
  const [hover, setHover] = React.useState(false);
  const [hoverBtn, setHoverBtn] = React.useState(false); // hover sulle frecce: sospende il feedback della riga
  const C = dark ? KDS_C : KDS_CL;
  const noteLower = (item.note || '').toLowerCase();
  const isRemove = !item.allergen && noteLower.startsWith('senza ');
  const isAdd    = !item.allergen && (noteLower.startsWith('aggiungi ') || noteLower.startsWith('extra '));
  const noteDisplay = isRemove ? item.note.slice(6)
    : noteLower.startsWith('aggiungi ') ? item.note.slice(9)
    : noteLower.startsWith('extra ')    ? item.note.slice(6)
    : item.note;
  return (
    <div
      onClick={disabled ? null : onBump}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display:'flex', alignItems:'center', gap: 10,
        padding: '12px 16px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        background: selected
          ? 'rgba(16, 185, 129, 0.10)'
          : (hover && !hoverBtn && !disabled ? (dark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(15, 17, 21, 0.03)') : 'transparent'),
        boxShadow: selected ? `inset 0 0 0 1px rgba(16, 185, 129, ${dark ? 0.35 : 0.32})` : 'none',
        opacity: disabled ? 0.4 : 1,
        borderTop: `1px solid ${C.hair}`,
        transition: 'background 0.12s',
      }}
    >
      {/* Selection indicator */}
      {inSelectionMode && (
        <div style={{
          width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
          background: selected ? '#34D399' : 'transparent',
          border: `2px solid ${selected ? '#34D399' : (dark ? 'rgba(255,255,255,0.25)' : 'rgba(15,17,21,0.20)')}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.12s',
        }}>
          {selected && (
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#10261D" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          )}
        </div>
      )}

      <div style={{flex: 1, minWidth: 0}}>
        {item.allergen && item.note && (
          <div style={{
            display:'inline-flex', alignItems:'center', gap: 4, marginBottom: 4,
            fontSize: 11.5, fontWeight: 800,
            color: /glutin/i.test(item.note) ? (dark ? '#FDBA74' : '#C2410C') : (dark ? '#FF9A9E' : '#DC2626'),
            background: /glutin/i.test(item.note) ? (dark ? 'rgba(234, 88, 12, 0.16)' : 'rgba(234, 88, 12, 0.10)') : (dark ? 'rgba(255, 90, 95, 0.16)' : 'rgba(220, 38, 38, 0.08)'),
            boxShadow: `inset 0 0 0 1px ${/glutin/i.test(item.note) ? 'rgba(234, 88, 12, 0.45)' : (dark ? 'rgba(255, 90, 95, 0.45)' : 'rgba(220, 38, 38, 0.40)')}`,
            padding:'2px 8px', borderRadius: 999, textTransform:'uppercase', letterSpacing: '0.05em',
          }}>
            {item.note}
          </div>
        )}
        <div style={{
          fontSize: 21, fontWeight: 700, color: C.text, lineHeight: 1.25, letterSpacing: '-0.01em',
        }}>
          {item.qty > 1 && <span style={{fontWeight: 800, color: dark ? '#FF9A9E' : '#E32459', fontVariantNumeric: 'tabular-nums', marginRight: 7}}>{item.qty}×</span>}
          {item.name}
        </div>
        {!item.allergen && item.note && (() => {
          const style = isRemove
            ? (dark ? { bg: 'rgba(255, 90, 95, 0.12)',   ring: 'rgba(255, 90, 95, 0.30)',   color: '#FF9A9E' }
                    : { bg: 'rgba(220, 38, 38, 0.07)',   ring: 'rgba(220, 38, 38, 0.28)',   color: '#DC2626' })   // togli ingrediente
            : isAdd
            ? (dark ? { bg: 'rgba(129, 140, 248, 0.14)', ring: 'rgba(129, 140, 248, 0.32)', color: '#B9BCF9' }
                    : { bg: 'rgba(99, 102, 241, 0.08)',  ring: 'rgba(99, 102, 241, 0.30)',  color: '#4F46E5' })   // aggiungi ingrediente
            : (dark ? { bg: 'rgba(255, 255, 255, 0.07)', ring: 'rgba(255, 255, 255, 0.12)', color: KDS_C.sub }
                    : { bg: 'rgba(15, 17, 21, 0.04)',    ring: 'rgba(15, 17, 21, 0.10)',    color: KDS_CL.sub }); // nota generica
          return (
            <div style={{
              display:'inline-flex', alignItems:'center', gap: 4, marginTop: 4,
              fontSize: 14, fontWeight: 600, color: style.color,
              background: style.bg,
              boxShadow: `inset 0 0 0 1px ${style.ring}`,
              padding:'3px 9px', borderRadius: 999,
            }}>
              {isRemove && <NoteRemoveIcon/>}
              {isAdd    && <NoteAddIcon/>}
              {noteDisplay}
            </div>
          );
        })()}
      </div>

      {/* Frecce stato — ← indietro / → avanti, azioni esplicite sul piatto */}
      {!disabled && (
        <div style={{display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0}}>
          {onRevert && item.state !== 'todo' && (
            <KdsStepBtn dir="back" dark={dark} onClick={onRevert} onHoverChange={setHoverBtn}
              title={item.state === 'done' ? 'Riporta in preparazione' : 'Rimetti in coda'}/>
          )}
          {item.state !== 'done' && (
            <KdsStepBtn dir="fwd" dark={dark} onClick={onBump} onHoverChange={setHoverBtn}
              title={item.state === 'todo' ? 'Inizia preparazione' : 'Segna pronto'}/>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Step button ────────────────────────────────────────────
// Freccia compatta (← indietro / → avanti) per far avanzare o retrocedere
// un singolo piatto di uno stato. Sempre visibile, stopPropagation sulla riga.
function KdsStepBtn({ dir, onClick, dark = false, title, onHoverChange }) {
  const [hover, setHover] = React.useState(false);
  const C = dark ? KDS_C : KDS_CL;
  const setH = v => { setHover(v); onHoverChange && onHoverChange(v); };
  return (
    <button
      onClick={e => { e.stopPropagation(); onClick(); }}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      onTouchStart={() => setH(true)}
      onTouchEnd={() => setH(false)}
      title={title}
      style={{
        width: 24, height: 24, borderRadius: 7, flexShrink: 0, padding: 0,
        background: hover ? (dark ? 'rgba(255,255,255,0.12)' : 'rgba(15,17,21,0.06)') : 'transparent',
        border: 'none',
        boxShadow: `inset 0 0 0 1px ${dark ? 'rgba(255, 255, 255, 0.14)' : 'rgba(15, 17, 21, 0.12)'}`,
        color: hover ? C.text : C.mut,
        cursor: 'pointer',
        display: 'grid', placeItems: 'center',
        transition: 'background 0.12s, color 0.12s',
      }}>
      {dir === 'back' ? <RevertArrowIcon/> : <ForwardArrowIcon/>}
    </button>
  );
}

// ─── Icons ────────────────────────────────────────────────
function BagIcon()   { return (<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>); }
function ScooterIcon() { return (<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="17" r="3"/><circle cx="18" cy="17" r="3"/><path d="M9 17h6M14 6h3l3 8M8 17l3-8h6"/></svg>); }
function RevertArrowIcon() { return (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg>); }
function ForwardArrowIcon() { return (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><polyline points="12 5 19 12 12 19"/></svg>); }
function NoteRemoveIcon() { return (<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><line x1="8" y1="12" x2="16" y2="12"/></svg>); }
function NoteAddIcon()    { return (<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>); }

function EnterFullIcon() { return (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 9V5a1 1 0 0 1 1-1h4"/><path d="M20 9V5a1 1 0 0 0-1-1h-4"/><path d="M4 15v4a1 1 0 0 0 1 1h4"/><path d="M20 15v4a1 1 0 0 1-1 1h-4"/></svg>); }
function ExitFullIcon()  { return (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 4v4a1 1 0 0 1-1 1H4"/><path d="M15 4v4a1 1 0 0 0 1 1h4"/><path d="M9 20v-4a1 1 0 0 0-1-1H4"/><path d="M15 20v-4a1 1 0 0 1 1-1h4"/></svg>); }

function KdsFilterChip({ label, selected, defaultLabel, options, onChange }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  const isActive = selected.length > 0;

  const displayValue = selected.length === 0 ? defaultLabel
    : selected.length === 1 ? selected[0]
    : `${selected.length} selezionate`;

  function toggle(opt) {
    if (selected.includes(opt)) {
      onChange(selected.filter(x => x !== opt));
    } else {
      onChange([...selected, opt]);
    }
  }

  React.useEffect(() => {
    if (!open) return;
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={ref} style={{position: 'relative'}}>
      <button onClick={() => setOpen(o => !o)} style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        padding: '7px 12px', borderRadius: 10, height: 36,
        background: isActive ? `
          radial-gradient(circle at 82% 18%, rgba(255, 96, 102, 0.32), transparent 62%),
          linear-gradient(180deg, rgba(58, 28, 22, 0.96) 0%, rgba(30, 12, 10, 0.98) 100%)
        ` : 'rgba(15, 17, 21, 0.04)',
        border: 'none',
        boxShadow: isActive
          ? 'inset 0 1px 0 rgba(255,200,210,0.18), inset 0 0 0 1px rgba(255,130,150,0.12), 0 8px 22px -8px rgba(80,10,30,0.55)'
          : 'inset 0 0 0 1px rgba(15, 17, 21, 0.10)',
        color: isActive ? '#FFE9E6' : PN.TEXT,
        fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
        whiteSpace: 'nowrap',
        transition: 'background 150ms ease-out, color 150ms ease-out',
      }}>
        <span style={{fontSize: 13, fontWeight: 500, opacity: isActive ? 0.65 : 0.5}}>{label}:</span>
        <span>{displayValue}</span>
        <span style={{fontSize: 11, opacity: 0.55, marginLeft: 1}}>▾</span>
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 200,
          background: PN.WHITE, border: `1px solid ${PN.BORDER_HAIR}`,
          borderRadius: 10, padding: 4,
          boxShadow: '0 8px 24px rgba(15,17,21,0.12), 0 1px 4px rgba(15,17,21,0.06)',
          minWidth: 160,
        }}>
          {/* Voce "Tutti/Tutte" — resetta selezione */}
          <button onClick={() => { onChange([]); setOpen(false); }} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            width: '100%', padding: '9px 12px', borderRadius: 7,
            background: !isActive ? PN.BG : 'transparent',
            color: !isActive ? PN.TEXT : PN.MUTED,
            border: 'none', fontSize: 15, fontWeight: !isActive ? 700 : 500,
            cursor: 'pointer', fontFamily: 'inherit',
          }}>
            {defaultLabel}
            {!isActive && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
          </button>
          {/* Separatore */}
          <div style={{height: 1, background: PN.BORDER_SOFT, margin: '3px 4px'}}/>
          {options.map(o => {
            const checked = selected.includes(o);
            return (
              <button key={o} onClick={() => toggle(o)} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                width: '100%', padding: '9px 12px', borderRadius: 7,
                background: checked ? PN.BG : 'transparent',
                color: PN.TEXT,
                border: 'none', fontSize: 15, fontWeight: checked ? 700 : 500,
                cursor: 'pointer', fontFamily: 'inherit',
              }}>
                {/* Checkbox */}
                <span style={{
                  width: 16, height: 16, borderRadius: 4, flexShrink: 0,
                  border: `2px solid ${checked ? PN.TEXT : PN.BORDER}`,
                  background: checked ? PN.TEXT : 'transparent',
                  display: 'grid', placeItems: 'center',
                }}>
                  {checked && <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                </span>
                {o}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

window.CucinaInSala = CucinaInSala;
