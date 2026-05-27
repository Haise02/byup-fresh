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

// Ritorna note "allergene/critica" se contiene parole chiave
function _isCriticalNote(note, allergen) {
  if (allergen) return true;
  if (!note) return false;
  const s = note.toLowerCase();
  return /senza|no |gluten|lattosio|allerg|celiac/.test(s);
}

function CucinaInSala({ focus = false, onToggleFocus }) {
  const [station, setStation]       = React.useState([]); // [] = tutte
  const [kindFilter, setKindFilter] = React.useState([]); // [] = tutti
  const [onlyLate, setOnlyLate]     = React.useState(false);   // KPI "in ritardo" cliccabile
  const [tick, setTick]             = React.useState(0);       // forza re-render
  const [confirmCancel, setConfirmCancel] = React.useState(null); // { ticketId, col, label }
  const [salaToast, setSalaToast]   = React.useState(null);    // { ticketId, courseLabel } per pulse
  const [readyTickets, setReadyTickets] = React.useState([]);
  const [prontiCollapsed, setProntiCollapsed] = React.useState(true);
  const [draggingId, setDraggingId] = React.useState(null);
  const [dragOverId, setDragOverId] = React.useState(null);

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

  function reorderInColumn(dragId, targetId, isLeft) {
    if (dragId === targetId) return;
    setTickets(prev => {
      const match = isLeft
        ? t => !t.items.some(i => i.state === 'doing')
        : t => t.items.some(i => i.state === 'doing');
      const col = prev.filter(match);
      const di = col.findIndex(t => t.id === dragId);
      const ti = col.findIndex(t => t.id === targetId);
      if (di === -1 || ti === -1) return prev;
      const reordered = [...col];
      const [dragged] = reordered.splice(di, 1);
      reordered.splice(ti, 0, dragged);
      let idx = 0;
      return prev.map(t => match(t) ? reordered[idx++] : t);
    });
  }

  function reorderReady(dragId, targetId) {
    if (dragId === targetId) return;
    setReadyTickets(prev => {
      const di = prev.findIndex(t => t.id === dragId);
      const ti = prev.findIndex(t => t.id === targetId);
      if (di === -1 || ti === -1) return prev;
      const reordered = [...prev];
      const [dragged] = reordered.splice(di, 1);
      reordered.splice(ti, 0, dragged);
      return reordered;
    });
  }

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
    const label = t.kind === 'sala' ? `Tav.${t.table}` : t.customer;
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
        background: PN.WHITE,
        borderRadius: focus ? 0 : 12,
        border: focus ? 'none' : `1px solid ${PN.BORDER_HAIR}`,
        boxShadow: focus ? 'none' : '0 1px 0 rgba(15,17,21,0.04), 0 4px 16px rgba(15,17,21,0.03)',
        padding: focus ? '20px 28px' : 22,
        display: focus ? 'flex' : 'block',
        flexDirection: focus ? 'column' : 'unset',
        minHeight: focus ? 0 : 'auto',
      }}>
        {/* Header */}
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: 16, gap: 12}}>
          <div style={{display:'flex', alignItems:'center', gap: 8}}>
            <KdsFilterChip
              label="Canali" selected={kindFilter} defaultLabel="Tutti"
              options={['Sala','Asporto','Delivery']}
              onChange={setKindFilter}
            />
            <KdsFilterChip
              label="Categorie" selected={station} defaultLabel="Tutte"
              options={stations}
              onChange={setStation}
            />
            {lateCount > 0 && (
              <button onClick={() => setOnlyLate(v => !v)} title="Filtra in ritardo" style={{
                height: 36, minWidth: 36, padding: '0 10px', borderRadius: 8, flexShrink: 0,
                background: onlyLate ? PN.RED : PN.WHITE,
                border: `1px solid ${onlyLate ? PN.RED : 'rgba(0,0,0,0.18)'}`,
                color: onlyLate ? PN.WHITE : PN.RED,
                cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5,
                fontFamily: 'inherit',
              }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13" stroke="white" strokeWidth="2" strokeLinecap="round"/><line x1="12" y1="17" x2="12.01" y2="17" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>
                <span style={{fontSize: 13, fontWeight: 700, lineHeight: 1}}>{lateCount}</span>
              </button>
            )}
          </div>
          <button onClick={onToggleFocus} title={focus ? 'Esci (Esc)' : 'Schermo intero'} style={{
            width: 36, height: 36, borderRadius: 8,
            background: focus ? PN.TEXT : PN.WHITE,
            border: `1px solid ${focus ? PN.TEXT : PN.BORDER}`,
            color: focus ? PN.WHITE : PN.TEXT,
            cursor:'pointer', display:'grid', placeItems:'center', fontFamily:'inherit',
          }}>{focus ? <ExitFullIcon/> : <EnterFullIcon/>}</button>
        </div>

        {/* 2 colonne dense */}
        <div style={{
          display:'grid', gridTemplateColumns:'1fr 1fr', gap: focus ? 18 : 16,
          flex: focus ? 1 : 'none', minHeight: focus ? 0 : 'auto',
          overflow: focus ? 'auto' : 'visible',
        }}>
          <KdsColumn title="In coda" tone={PN.MUTED} toneSoft={PN.BG} count={filteredLeft.length} empty="Nessun ticket in attesa" bg="#FBFBFC">
            {filteredLeft.map(t => (
              <KdsTicket
                key={t.id} ticket={t}
                onBumpItem={(idx) => bumpItem(t.id, idx)}
                onBumpItems={(indices) => bumpItems(t.id, indices)}
                onPrimary={() => startAll(t.id)}
                onMarkReady={() => markReady(t.id)}
                onCancel={() => requestCancel(t.id)}
                onRevertItems={(indices) => revertItems(t.id, indices)}
                dragging={draggingId === t.id}
                dragOver={dragOverId === t.id}
                onDragStart={() => setDraggingId(t.id)}
                onDragEnd={() => { setDraggingId(null); setDragOverId(null); }}
                onDragEnter={() => { if (draggingId && draggingId !== t.id) setDragOverId(t.id); }}
                onDrop={() => { reorderInColumn(draggingId, t.id, true); setDragOverId(null); }}
              />
            ))}
          </KdsColumn>

          <KdsColumn title="In preparazione" tone={'#3B82F6'} toneSoft={'#DBEAFE'} count={filteredRight.length} empty="Nessun ticket in cottura" bg="#EFF6FF">
            {filteredRight.map(t => (
              <KdsTicket
                key={t.id} ticket={t}
                onBumpItem={(idx) => bumpItem(t.id, idx)}
                onBumpItems={(indices) => bumpItems(t.id, indices)}
                onPrimary={() => startAll(t.id)}
                onMarkReady={() => markReady(t.id)}
                onCancel={() => requestCancel(t.id)}
                onRevertItems={(indices) => revertItems(t.id, indices)}
                dragging={draggingId === t.id}
                dragOver={dragOverId === t.id}
                onDragStart={() => setDraggingId(t.id)}
                onDragEnd={() => { setDraggingId(null); setDragOverId(null); }}
                onDragEnter={() => { if (draggingId && draggingId !== t.id) setDragOverId(t.id); }}
                onDrop={() => { reorderInColumn(draggingId, t.id, false); setDragOverId(null); }}
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
        draggingId={draggingId}
        dragOverId={dragOverId}
        onDragStart={setDraggingId}
        onDragEnd={() => { setDraggingId(null); setDragOverId(null); }}
        onDragEnterCard={(id) => { if (draggingId && draggingId !== id) setDragOverId(id); }}
        onDropCard={(targetId) => { reorderReady(draggingId, targetId); setDragOverId(null); }}
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
            <div style={{fontSize: 17, fontWeight: 800, color: PN.TEXT, marginBottom: 6}}>Annullare il ticket?</div>
            <div style={{fontSize: 13, color: PN.MUTED, lineHeight: 1.5, marginBottom: 18}}>
              Stai per annullare <strong style={{color: PN.TEXT}}>{confirmCancel.label}</strong> ({confirmCancel.count} piatti). L'azione non è reversibile dalla cucina.
            </div>
            <div style={{display:'flex', gap: 10, justifyContent:'flex-end'}}>
              <button onClick={() => setConfirmCancel(null)} style={{
                padding:'9px 16px', borderRadius: 999, background: PN.WHITE, color: PN.TEXT,
                border: `1px solid ${PN.BORDER}`, fontSize: 13, fontWeight: 600, cursor:'pointer', fontFamily:'inherit',
              }}>Mantieni ticket</button>
              <button onClick={confirmCancelDo} style={{
                padding:'9px 16px', borderRadius: 999, background: PN.RED, color: PN.WHITE,
                border:'none', fontSize: 13, fontWeight: 700, cursor:'pointer', fontFamily:'inherit',
              }}>Sì, annulla</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Pronti panel ────────────────────────────────────────────
function KdsProntiPanel({ tickets, collapsed, onToggle, onRevertItem, onRevertCard,
  draggingId, dragOverId, onDragStart, onDragEnd, onDragEnterCard, onDropCard }) {
  if (collapsed) {
    return (
      <div onClick={onToggle} style={{
        width: 40, flexShrink: 0, alignSelf: 'stretch',
        background: PN.WHITE, border: `1px solid ${PN.BORDER_HAIR}`,
        borderRadius: 12, cursor: 'pointer',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '14px 0', gap: 10,
        boxShadow: '0 1px 0 rgba(15,17,21,0.04), 0 4px 16px rgba(15,17,21,0.03)',
      }}>
        <span style={{
          writingMode: 'vertical-rl', transform: 'rotate(180deg)',
          fontSize: 11, fontWeight: 800, color: PN.TEXT,
          letterSpacing: 0.6, textTransform: 'uppercase', whiteSpace: 'nowrap',
        }}>Pronti</span>
        <span style={{
          background: '#E5E7EB', color: '#374151',
          fontSize: 12, fontWeight: 800,
          padding: '2px 8px', borderRadius: 999,
        }}>{tickets.length}</span>
      </div>
    );
  }

  return (
    <div style={{
      width: 280, flexShrink: 0, alignSelf: 'stretch',
      background: PN.WHITE,
      border: `1px solid ${PN.BORDER_HAIR}`,
      borderRadius: 12,
      boxShadow: '0 1px 0 rgba(15,17,21,0.04), 0 6px 18px rgba(15,17,21,0.04)',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
    }}>
      <div style={{
        padding: '12px 14px', borderBottom: `1px solid ${PN.BORDER_HAIR}`,
        display: 'flex', alignItems: 'center', gap: 8,
        background: '#FAFBFC', flexShrink: 0,
      }}>
        <span style={{fontSize: 15, fontWeight: 700, color: PN.TEXT, letterSpacing: '-0.01em'}}>Pronti</span>
        <span style={{fontSize: 12, fontWeight: 700, color: PN.MUTED, fontVariantNumeric: 'tabular-nums'}}>{tickets.length}</span>
        <span style={{flex: 1}}/>
        <button onClick={onToggle} title="Comprimi" style={{
          background: 'transparent', border: 'none', cursor: 'pointer',
          color: PN.MUTED, fontFamily: 'inherit', fontSize: 20, padding: 4,
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
            dragging={draggingId === ticket.id}
            dragOver={dragOverId === ticket.id}
            onDragStart={() => onDragStart(ticket.id)}
            onDragEnd={onDragEnd}
            onDragEnter={() => onDragEnterCard(ticket.id)}
            onDrop={() => onDropCard(ticket.id)}
          />
        ))}
      </div>
    </div>
  );
}

function KdsProntiCard({ ticket, onRevertItem, onRevertCard, dragging, dragOver, onDragStart, onDragEnd, onDragEnter, onDrop }) {
  return (
    <div
      draggable={true}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragEnter={onDragEnter}
      onDragOver={e => e.preventDefault()}
      onDrop={e => { e.preventDefault(); onDrop && onDrop(); }}
      style={{
        background: PN.WHITE, borderRadius: 12,
        border: `1.5px solid ${dragOver ? '#3B82F6' : 'rgba(0,0,0,0.10)'}`,
        overflow: 'hidden',
        opacity: dragging ? 0.4 : 1,
        cursor: 'grab',
        transition: 'opacity 0.15s, border-color 0.15s',
      }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px',
        borderBottom: `1px solid ${PN.BORDER_HAIR}`,
        background: '#F9FAFB',
      }}>
        <div style={{flex: 1, minWidth: 0}}>
          <div style={{fontSize: 16, fontWeight: 700, color: PN.TEXT, letterSpacing: '-0.02em'}}>
            {ticket.kind === 'sala' ? `Tav.${ticket.table}` : ticket.customer}
          </div>
          {(ticket.kind === 'asporto' || ticket.kind === 'delivery') && ticket.pickup && (
            <div style={{fontSize: 10.5, color: PN.MUTED, marginTop: 1}}>
              {ticket.kind === 'delivery' ? 'consegna' : 'ritiro'} {ticket.pickup}
            </div>
          )}
        </div>
        <button onClick={onRevertCard} style={{
          padding: '6px 10px', borderRadius: 6, flexShrink: 0,
          background: 'transparent', border: `1px solid ${PN.BORDER}`,
          color: PN.MUTED, cursor: 'pointer', fontFamily: 'inherit',
          fontSize: 11, fontWeight: 600,
          display: 'inline-flex', alignItems: 'center', gap: 4,
        }}>
          <RevertArrowIcon/> Riporta tutti
        </button>
      </div>
      {ticket.items.map((it, i) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '9px 14px',
          borderTop: i > 0 ? `1px solid ${PN.BORDER_SOFT}` : 'none',
          background: '#FAFAFA',
        }}>
          <button onClick={() => onRevertItem(i)} style={{
            width: 36, height: 36, borderRadius: 7, flexShrink: 0,
            background: 'transparent', border: `1px solid ${PN.BORDER}`,
            color: PN.MUTED, cursor: 'pointer',
            display: 'grid', placeItems: 'center',
          }}>
            <RevertArrowIcon/>
          </button>
          <span style={{flex: 1, fontSize: 14, fontWeight: 500, color: '#9CA3AF', textDecoration: 'line-through'}}>{it.name}</span>
          {it.qty > 1 && <span style={{fontSize: 12, fontWeight: 700, color: '#9CA3AF'}}>×{it.qty}</span>}
        </div>
      ))}
    </div>
  );
}

// ─── KPI ────────────────────────────────────────────────────
// Design 2.1: card con border hairline + shadow doppia, padding 16,
// hover lift soft (translateY -1) per aumentare interattività.
function KdsKpi({ label, value, sub, tone, active, onClick }) {
  const toneColor = tone === 'late' ? PN.RED : tone === 'warn' ? PN.AMBER : PN.TEXT;
  const clickable = !!onClick;
  const [hover, setHover] = React.useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: active ? PN.RED_SOFT : PN.WHITE,
        border: `1px solid ${active ? PN.RED : PN.BORDER_HAIR}`,
        borderRadius: 12, padding: '16px 18px',
        cursor: clickable ? 'pointer' : 'default',
        boxShadow: clickable && hover
          ? '0 8px 20px rgba(15, 17, 21, 0.06), 0 1px 2px rgba(15, 17, 21, 0.04)'
          : '0 1px 0 rgba(15, 17, 21, 0.04), 0 4px 12px rgba(15, 17, 21, 0.03)',
        transform: clickable && hover ? 'translateY(-1px)' : 'translateY(0)',
        transition: 'background 150ms ease-out, border-color 150ms ease-out, box-shadow 150ms ease-out, transform 150ms ease-out',
      }}>
      <div style={{fontSize: 11, color: PN.MUTED, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 8}}>{label}</div>
      <div style={{fontSize: 26, fontWeight: 600, color: toneColor, lineHeight: 1, marginBottom: 4, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums'}}>{value}</div>
      <div style={{fontSize: 11.5, color: PN.MUTED_SOFT}}>{sub}</div>
    </div>
  );
}

// ─── Column ────────────────────────────────────────────────
// Bg colorato leggero coerente con il tono (Attivi pink soft, Prep amber soft).
// Border tonalizzato 1px alpha per dare identità a ogni colonna.
function KdsColumn({ title, tone, toneSoft, count, empty, children, bg }) {
  return (
    <div style={{
      background: bg || PN.WHITE,
      borderRadius: 12, padding: 14,
      border: `3px solid ${tone}`,
      boxShadow: '0 1px 0 rgba(15,17,21,0.04)',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        marginBottom: 14, padding: '4px 4px',
      }}>
        <span style={{fontSize: 17, fontWeight: 700, color: PN.TEXT, letterSpacing: '-0.01em'}}>{title}</span>
        <span style={{
          fontSize: 14, fontWeight: 700, color: tone,
          fontVariantNumeric: 'tabular-nums',
        }}>{count}</span>
      </div>
      {count === 0 ? (
        <div style={{
          padding: '36px 16px', textAlign: 'center', borderRadius: 10,
          border: `1px dashed ${PN.BORDER_LIGHT}`, color: PN.MUTED_SOFT, fontSize: 13,
          background: PN.WHITE,
        }}>{empty}</div>
      ) : (
        <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>{children}</div>
      )}
    </div>
  );
}

// ─── Ticket ────────────────────────────────────────────────
function KdsTicket({ ticket, onBumpItem, onBumpItems, onPrimary, onMarkReady, onCancel, onRevertItems,
  dragging, dragOver, onDragStart, onDragEnd, onDragEnter, onDrop }) {
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
  const kindBadge = (() => {
    if (ticket.kind === 'asporto') return { bg: PN.BLUE_SOFT, fg: PN.BLUE, label: 'ASPORTO', icon: <BagIcon/> };
    if (ticket.kind === 'delivery') return { bg: '#EDE9FE', fg: '#7C3AED', label: 'DELIVERY', icon: <ScooterIcon/> };
    return null;
  })();

  return (
    <div
      draggable={true}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragEnter={onDragEnter}
      onDragOver={e => e.preventDefault()}
      onDrop={e => { e.preventDefault(); onDrop && onDrop(); }}
      style={{
        background: PN.WHITE, borderRadius: 14,
        border: `2px solid ${dragOver ? '#3B82F6' : lateGlow ? PN.RED : 'rgba(0,0,0,0.32)'}`,
        overflow: 'hidden',
        boxShadow: lateGlow
          ? `0 0 0 3px ${PN.RED}22, 0 8px 20px rgba(220, 38, 38, 0.10), 0 1px 2px rgba(15,17,21,0.04)`
          : '0 1px 0 rgba(15,17,21,0.04), 0 6px 18px rgba(15,17,21,0.04)',
        animation: lateGlow ? 'kdsLatePulse 2s ease-in-out infinite' : 'none',
        opacity: dragging ? 0.4 : 1,
        cursor: 'grab',
        transition: 'opacity 0.15s, border-color 0.15s',
      }}>
      <style>{`@keyframes kdsLatePulse { 0%,100% { box-shadow: 0 0 0 3px ${PN.RED}22, 0 8px 20px rgba(220,38,38,0.10); } 50% { box-shadow: 0 0 0 6px ${PN.RED}33, 0 12px 28px rgba(220,38,38,0.16); } }`}</style>

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
        borderBottom: `1px solid ${lateGlow ? PN.RED + '22' : PN.BORDER_HAIR}`,
        background: PN.WHITE_OFF,
      }}>
        <div style={{flex: 1, minWidth: 0}}>
          {kindBadge ? (
            <React.Fragment>
              <div style={{display:'flex', alignItems:'center', gap: 6, marginBottom: 2}}>
                <span style={{
                  fontSize: 9.5, fontWeight: 800, padding:'2px 6px', borderRadius: 4,
                  background: kindBadge.bg, color: kindBadge.fg,
                  letterSpacing: 0.5, display:'inline-flex', alignItems:'center', gap: 3,
                }}>{kindBadge.icon} {kindBadge.label}</span>
              </div>
              <div style={{fontSize: 16, fontWeight: 800, color: PN.TEXT, lineHeight: 1.1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>
                {ticket.customer}
              </div>
            </React.Fragment>
          ) : (
            <React.Fragment>
              <div style={{fontSize: 22, fontWeight: 600, color: PN.TEXT, lineHeight: 1, letterSpacing: '-0.02em'}}>Tav.{ticket.table}</div>
            </React.Fragment>
          )}
        </div>
        {hasTodo && (
          <button onClick={onPrimary} style={{
            padding: '7px 11px', borderRadius: 7, flexShrink: 0,
            background: 'transparent', color: PN.MUTED,
            border: '1px solid rgba(0,0,0,0.18)',
            fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
            whiteSpace: 'nowrap', transition: 'color 0.12s, border-color 0.12s',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = PN.TEXT; e.currentTarget.style.borderColor = PN.TEXT; }}
          onMouseLeave={e => { e.currentTarget.style.color = PN.MUTED; e.currentTarget.style.borderColor = 'rgba(0,0,0,0.18)'; }}
          >Inizia tutti</button>
        )}
        <div style={{
          textAlign: 'center', padding: '8px 14px', borderRadius: 10,
          background: u.bg, color: u.text, minWidth: 64, flexShrink: 0,
          border: `1px solid ${u.dot}1F`,
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.5)',
        }}>
          <div style={{fontSize: 19, fontWeight: 600, lineHeight: 1, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.01em'}}>
            {(ticket.kind === 'asporto' || ticket.kind === 'delivery') && ticket.pickup ? minToPickup : age}m
          </div>
          <div style={{fontSize: 9, fontWeight: 600, marginTop: 3, textTransform: 'uppercase', letterSpacing: 0.4, opacity: 0.85}}>
            {(ticket.kind === 'asporto' || ticket.kind === 'delivery') && ticket.pickup ? 'al ritiro' : 'attesa'}
          </div>
        </div>
      </div>

      {/* FASCIA 1 — Serviti (done): priorità minima, collassata di default */}
      {doneItems.length > 0 && (
        <div style={{borderBottom: `1px solid ${PN.BORDER_SOFT}`}}>
          <style>{`@keyframes servedFade { 0% { background: #DCFCE7; } 100% { background: #F3F4F6; } }`}</style>
          <div onClick={() => setDoneCollapsed(c => !c)} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 14px', cursor: 'pointer',
            background: '#F3F4F6',
            animation: servedFlash ? 'servedFade 1.8s ease-out forwards' : 'none',
          }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontSize: 12, fontWeight: 700, color: '#6B7280',
              textTransform: 'uppercase', letterSpacing: 0.5,
            }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              Serviti · {doneItems.length}
            </span>
            <span style={{fontSize: 10, color: '#9CA3AF'}}>{doneCollapsed ? '▾' : '▴'}</span>
          </div>
          {!doneCollapsed && doneItems.map(it => (
            <div key={it.idx} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px',
              background: '#F8F9FA', borderTop: `1px solid ${PN.BORDER_SOFT}`,
            }}>
              <button onClick={() => onRevertItems([it.idx])} style={{
                width: 44, height: 44, borderRadius: 8, flexShrink: 0,
                background: 'transparent', border: `1px solid ${PN.BORDER}`,
                color: PN.MUTED, cursor: 'pointer',
                display: 'grid', placeItems: 'center', marginLeft: -6,
              }}>
                <RevertArrowIcon/>
              </button>
              <span style={{flex:1, fontSize: 15, fontWeight: 500, color: '#9CA3AF', textDecoration: 'line-through'}}>{it.name}</span>
            </div>
          ))}
        </div>
      )}

      {/* FASCIA 2 — In preparazione (doing): tap → selezione → CTA "Servi" */}
      {doingItems.length > 0 && (
        <div style={{borderBottom: todoItems.length > 0 ? `1px solid ${PN.BORDER_SOFT}` : 'none'}}>
          {doingItems.map(it => (
            <KdsItemRow
              key={it.idx} item={it}
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
                padding: '12px 14px', background: PN.WHITE,
                borderBottom: !todoCollapsed ? `1px solid ${PN.BORDER_SOFT}` : 'none',
                cursor: 'pointer',
              }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  fontSize: 12, fontWeight: 700, color: PN.TEXT,
                  textTransform: 'uppercase', letterSpacing: 0.5,
                }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/></svg>
                  In coda · {todoItems.length}
                </span>
                <span style={{fontSize: 10, color: PN.MUTED}}>{todoCollapsed ? '▾' : '▴'}</span>
              </div>
              {!todoCollapsed && todoItems.map(it => (
                <KdsItemRow key={it.idx} item={it} onBump={() => handleTodoTap(it.idx)} selected={pendingTodo.has(it.idx)}/>
              ))}
            </React.Fragment>
          ) : (
            todoItems.map(it => (
              <KdsItemRow key={it.idx} item={it} onBump={() => handleTodoTap(it.idx)} selected={pendingTodo.has(it.idx)}/>
            ))
          )}
        </div>
      )}

      {/* Debounce countdown banner */}
      {pendingTodo.size > 0 && pendingCountdown > 0 && (
        <div style={{
          padding: '10px 14px', background: '#FFF7ED',
          borderTop: `1px solid #FED7AA`,
        }}>
          <span style={{fontSize: 12, fontWeight: 600, color: '#92400E'}}>
            Invio in {pendingCountdown}s · {pendingTodo.size} piatt{pendingTodo.size === 1 ? 'o' : 'i'}
          </span>
        </div>
      )}

      {/* Footer */}
      {!allDone && (
        <div style={{
          display: 'flex', gap: 8, padding: '12px 14px', alignItems: 'center',
          borderTop: `1px solid ${PN.BORDER_HAIR}`,
          background: PN.WHITE_OFF,
        }}/>
      )}
    </div>
  );
}

// ─── Course group (collassabile se done) ────────────────────
function CourseGroup({ group, ticket, onFireCourse, onBumpItem, pulseCourse, inSelectionMode = false, selectedItems }) {
  const isFired = ticket.firedCourses.has(group.course);
  const allCourseDone = group.items.every(i => i.state === 'done');
  const isPulsing = pulseCourse === COURSE_LABEL[group.course];
  const [collapsed, setCollapsed] = React.useState(false);

  // Auto-collapse quando portata done (lascia possibilità di espandere)
  React.useEffect(() => { if (allCourseDone) setCollapsed(true); }, [allCourseDone]);

  const headerBg = isFired
    ? (allCourseDone ? PN.GREEN_SOFT : PN.WHITE)
    : '#F4F5F7';

  return (
    <React.Fragment>
      <div
        onClick={allCourseDone ? () => setCollapsed(c => !c) : null}
        style={{
          display:'flex', alignItems:'center', justifyContent:'space-between', gap: 8,
          padding: isFired && !allCourseDone ? '10px 14px 6px' : '7px 14px',
          background: headerBg,
          borderTop: `1px solid ${PN.BORDER_SOFT}`,
          cursor: allCourseDone ? 'pointer' : 'default',
          animation: isPulsing ? 'kdsFirePulse 0.6s ease-in-out 4' : 'none',
        }}
      >
        <style>{`@keyframes kdsFirePulse { 0%,100% { background:#F4F5F7; } 50% { background:${PN.PINK_SOFT}; } }`}</style>
        <span style={{
          fontSize: 11, fontWeight: 800,
          color: isFired ? (allCourseDone ? PN.GREEN : PN.TEXT) : PN.MUTED,
          textTransform:'uppercase', letterSpacing: 0.6,
          display:'inline-flex', alignItems:'center', gap: 6,
        }}>
          <span style={{
            width: 17, height: 17, borderRadius: '50%',
            background: isFired ? (allCourseDone ? PN.GREEN : PN.PINK) : PN.MUTED_LIGHT,
            color: PN.WHITE, display:'inline-flex', alignItems:'center', justifyContent:'center',
            fontSize: 9.5, fontWeight: 800,
          }}>{group.course}</span>
          {COURSE_LABEL[group.course]}
          {allCourseDone && (
            <span style={{fontSize: 10, fontWeight: 700, color: PN.GREEN, opacity: 0.85}}>
              · {collapsed ? `▾ ${group.items.length} pronti` : '▴ chiudi'}
            </span>
          )}
          {isPulsing && (
            <span style={{
              fontSize: 9.5, color: PN.PINK_DARK, fontWeight: 700,
              display:'inline-flex', alignItems:'center', gap: 3,
            }}>
              <BellIcon/> Sala
            </span>
          )}
        </span>
        {isFired && !allCourseDone && (
          <span style={{fontSize: 9.5, fontWeight: 700, color: PN.AMBER}}>in cottura</span>
        )}
      </div>

      {/* Fire button full-width per portata non firata */}
      {!isFired && (
        <button onClick={() => onFireCourse(group.course)} style={{
          padding:'10px 14px', background: PN.PINK, color: PN.WHITE,
          border:'none', borderTop: `1px solid ${PN.BORDER_SOFT}`,
          fontSize: 13, fontWeight: 700, cursor:'pointer', fontFamily:'inherit',
          display:'flex', alignItems:'center', justifyContent:'center', gap: 7,
        }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 4 20 12 6 20"/></svg>
          Inizia {COURSE_LABEL[group.course].toLowerCase()}
        </button>
      )}

      {/* Items (nascosti se collapsed) */}
      {!collapsed && group.items.map((it) => (
        <KdsItemRow key={it.idx} item={it} onBump={() => onBumpItem(it.idx)} disabled={!isFired}
          selected={selectedItems ? selectedItems.has(it.idx) : false} inSelectionMode={inSelectionMode && isFired}/>
      ))}
    </React.Fragment>
  );
}

// ─── Item row ───────────────────────────────────────────────
function KdsItemRow({ item, onBump, onRevert, disabled = false, selected = false, inSelectionMode = false }) {
  const [hover, setHover] = React.useState(false);
  const [hoverRevert, setHoverRevert] = React.useState(false);
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
        padding: '13px 16px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        background: selected ? '#F0FDF4' : (hover && !hoverRevert && !disabled ? '#F4F5F7' : 'transparent'),
        opacity: disabled ? 0.4 : 1,
        borderTop: `1px solid ${PN.BORDER_SOFT}`,
        transition: 'background 0.12s',
      }}
    >
      {/* Revert arrow — sinistra, azione secondaria */}
      {onRevert && (
        <button
          onClick={e => { e.stopPropagation(); onRevert(); }}
          onMouseEnter={() => setHoverRevert(true)}
          onMouseLeave={() => setHoverRevert(false)}
          onTouchStart={() => setHoverRevert(true)}
          onTouchEnd={() => setHoverRevert(false)}
          style={{
            width: 44, height: 44, borderRadius: 8, flexShrink: 0,
            background: hoverRevert ? '#EBEBEB' : hover ? PN.WHITE : 'transparent',
            border: `1px solid ${PN.BORDER}`,
            color: hover || hoverRevert ? PN.TEXT : PN.MUTED,
            cursor: 'pointer',
            display: 'grid', placeItems: 'center', marginLeft: -6,
            transition: 'background 0.12s',
          }}>
          <RevertArrowIcon/>
        </button>
      )}

      {/* Selection indicator */}
      {inSelectionMode && (
        <div style={{
          width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
          background: selected ? PN.GREEN : 'transparent',
          border: `2px solid ${selected ? PN.GREEN : '#D1D5DB'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.12s',
        }}>
          {selected && (
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          )}
        </div>
      )}

      <div style={{flex: 1, minWidth: 0}}>
        {item.allergen && item.note && (
          <div style={{
            display:'inline-flex', alignItems:'center', gap: 4, marginBottom: 3,
            fontSize: 11, fontWeight: 800, color: PN.WHITE,
            background: /glutin/i.test(item.note) ? '#EA580C' : PN.RED,
            padding:'2px 7px', borderRadius: 4, textTransform:'uppercase', letterSpacing: 0.4,
          }}>
            {item.note}
          </div>
        )}
        <div style={{
          fontSize: 20, fontWeight: 700, color: PN.TEXT, lineHeight: 1.25,
        }}>{item.name}</div>
        {!item.allergen && item.note && (() => {
          const style = isRemove
            ? { bg: '#FFF0F2', color: '#A0405B' }   // rose — togli ingrediente
            : isAdd
            ? { bg: '#EEEFFE', color: '#5255A0' }   // indigo — aggiungi ingrediente
            : { bg: '#F1F5F9', color: '#475569' };  // slate — nota generica
          return (
            <div style={{
              display:'inline-flex', alignItems:'center', gap: 4, marginTop: 3,
              fontSize: 14, fontWeight: 600, color: style.color, background: style.bg,
              padding:'3px 8px', borderRadius: 4,
            }}>
              {isRemove && <NoteRemoveIcon/>}
              {isAdd    && <NoteAddIcon/>}
              {noteDisplay}
            </div>
          );
        })()}
      </div>

      {/* Chevron avanzamento */}
      {!inSelectionMode && !onRevert && (
        <span style={{
          fontSize: 18, color: PN.MUTED, fontWeight: 700, flexShrink: 0,
          opacity: hover && !disabled ? 1 : 0,
          transform: hover && !disabled ? 'translateX(2px)' : 'translateX(-4px)',
          transition: 'opacity 0.15s, transform 0.15s',
        }}>›</span>
      )}
    </div>
  );
}

// ─── Icons ────────────────────────────────────────────────
function ClockIcon() { return (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/></svg>); }
function PlayIcon()  { return (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="6 4 20 12 6 20 6 4" fill="currentColor" stroke="none"/></svg>); }
function CheckIcon() { return (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>); }
function BagIcon()   { return (<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>); }
function ScooterIcon() { return (<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="17" r="3"/><circle cx="18" cy="17" r="3"/><path d="M9 17h6M14 6h3l3 8M8 17l3-8h6"/></svg>); }
function BellIcon()      { return (<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10 21a2 2 0 0 0 4 0"/></svg>); }
function RevertArrowIcon() { return (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg>); }
function UndoIcon() { return (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>); }
function NoteRemoveIcon() { return (<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><line x1="8" y1="12" x2="16" y2="12"/></svg>); }
function NoteAddIcon()    { return (<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>); }

function KdsFocusKpi({ label, value, tone, active, onClick }) {
  const c = tone === 'late' ? PN.RED : tone === 'warn' ? PN.AMBER : PN.TEXT;
  return (
    <span onClick={onClick} style={{
      display:'inline-flex', alignItems:'baseline', gap: 5,
      padding: '8px 14px', borderRadius: 999,
      background: active ? PN.RED_SOFT : PN.BG,
      border: `1px solid ${active ? PN.RED : PN.BORDER_SOFT}`,
      cursor: onClick ? 'pointer' : 'default',
    }}>
      <span style={{fontSize: 11, color: PN.MUTED, fontWeight: 600, textTransform:'uppercase', letterSpacing: 0.4}}>{label}</span>
      <span style={{fontSize: 14, fontWeight: 700, color: c, lineHeight: 1}}>{value}</span>
    </span>
  );
}
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
        padding: '7px 11px', borderRadius: 8, height: 36,
        background: isActive ? PN.TEXT : PN.WHITE,
        border: `1px solid ${isActive ? PN.TEXT : 'rgba(0,0,0,0.18)'}`,
        color: isActive ? PN.WHITE : PN.TEXT,
        fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
        whiteSpace: 'nowrap',
      }}>
        <span style={{fontSize: 11, fontWeight: 500, opacity: isActive ? 0.65 : 0.5}}>{label}:</span>
        <span>{displayValue}</span>
        <span style={{fontSize: 9, opacity: 0.55, marginLeft: 1}}>▾</span>
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
            border: 'none', fontSize: 13, fontWeight: !isActive ? 700 : 500,
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
                border: 'none', fontSize: 13, fontWeight: checked ? 700 : 500,
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

function KdsSegmented({ options, value, onChange, colorMap = {} }) {
  return (
    <div style={{
      display:'inline-flex', background: PN.BG, padding: 2, borderRadius: 999,
      border: `1px solid ${PN.BORDER_SOFT}`,
    }}>
      {options.map(o => {
        const active = value === o;
        const custom = colorMap[o];
        return (
          <button key={o} onClick={() => onChange(o)} style={{
            padding: '10px 14px', fontSize: 13, fontWeight: 600,
            background: active ? (custom ? custom.bg : PN.WHITE) : 'transparent',
            color: active ? (custom ? custom.color : PN.TEXT) : PN.MUTED,
            border: 'none', borderRadius: 999, cursor: 'pointer', fontFamily: 'inherit',
            boxShadow: active ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
          }}>{o}</button>
        );
      })}
    </div>
  );
}

window.CucinaInSala = CucinaInSala;
