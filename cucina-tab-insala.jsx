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
  if (ageMin <= 8)  return { tone: 'ok',   bg: PN.GREEN_SOFT, dot: PN.GREEN, text: PN.GREEN };
  if (ageMin <= 15) return { tone: 'warn', bg: PN.AMBER_SOFT, dot: PN.AMBER, text: PN.AMBER };
  return                   { tone: 'late', bg: PN.RED_SOFT,   dot: PN.RED,   text: PN.RED   };
}
// Tono urgenza pickup (asporto/delivery): minuti al ritiro
function _urgencyPickup(minToPickup) {
  if (minToPickup > 15) return { tone: 'ok',   bg: PN.GREEN_SOFT, dot: PN.GREEN, text: PN.GREEN };
  if (minToPickup > 5)  return { tone: 'warn', bg: PN.AMBER_SOFT, dot: PN.AMBER, text: PN.AMBER };
  return                       { tone: 'late', bg: PN.RED_SOFT,   dot: PN.RED,   text: PN.RED   };
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
  const [station, setStation]       = React.useState('Tutte');
  const [kindFilter, setKindFilter] = React.useState('Tutti'); // Tutti | Sala | Asporto | Delivery
  const [onlyLate, setOnlyLate]     = React.useState(false);   // KPI "in ritardo" cliccabile
  const [tick, setTick]             = React.useState(0);       // forza re-render
  const [confirmCancel, setConfirmCancel] = React.useState(null); // { ticketId, col, label }
  const [salaToast, setSalaToast]   = React.useState(null);    // { ticketId, courseLabel } per pulse

  // Stato ticket
  const [attivi, setAttivi] = React.useState(() =>
    CUC_TICKETS_ATTIVI.map(t => ({...t, items: t.items.map(i => ({...i})), firedCourses: new Set([1])}))
  );
  const [prep, setPrep] = React.useState(() =>
    CUC_TICKETS_PREP.map(t => ({...t, items: t.items.map(i => ({...i})), firedCourses: new Set([1, 2])}))
  );

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

  const stations = ['Tutte','Pizza','Primi','Secondi','Contorni','Bevande'];

  // KPI live
  const allTickets = [...attivi, ...prep];
  const totItems = allTickets.reduce((s, t) => s + t.items.reduce((a,i) => a + i.qty, 0), 0);
  const inCottura = prep.length;
  const lateCount = allTickets.filter(t => _ageMin(t.time) > 15).length;
  const avgAge = allTickets.length
    ? Math.round(allTickets.reduce((s, t) => s + _ageMin(t.time), 0) / allTickets.length)
    : 0;

  const matchKind = t => kindFilter === 'Tutti'
    || (kindFilter === 'Sala' && t.kind === 'sala')
    || (kindFilter === 'Asporto' && t.kind === 'asporto')
    || (kindFilter === 'Delivery' && t.kind === 'delivery');
  const matchStation = t => station === 'Tutte' || t.station === station;
  const matchLate = t => !onlyLate || _ageMin(t.time) > 15;
  const filteredAttivi = attivi.filter(t => matchKind(t) && matchStation(t) && matchLate(t));
  const filteredPrep   = prep.filter(t => matchKind(t) && matchStation(t) && matchLate(t));

  // Item bump
  // - Attivi: click → l'item ESCE dal ticket attivi e va in un ticket "in preparazione" (stesso id).
  //   Se è l'ultimo item del ticket attivi, il ticket sparisce dagli attivi.
  // - Preparazione: click → l'item SPARISCE. Se è l'ultimo del ticket, anche il ticket sparisce.
  function bumpItem(col, ticketId, itemIdx) {
    if (col === 'attivi') {
      const t = attivi.find(x => x.id === ticketId);
      if (!t) return;
      const item = t.items[itemIdx];
      if (!item) return;

      // Rimuovi item dal ticket attivi
      const newAttivi = attivi.map(x => {
        if (x.id !== ticketId) return x;
        return {...x, items: x.items.filter((_, i) => i !== itemIdx)};
      }).filter(x => x.items.length > 0);
      setAttivi(newAttivi);

      // Aggiungi item al ticket in preparazione (stesso ticketId, oppure crea nuovo)
      const existing = prep.find(x => x.id === ticketId);
      if (existing) {
        setPrep(prev => prev.map(x => x.id === ticketId
          ? {...x, items: [...x.items, {...item, state: 'doing'}]}
          : x
        ));
      } else {
        const fc = new Set(t.firedCourses);
        if (item.course) fc.add(item.course);
        setPrep(prev => [...prev, {...t, items: [{...item, state: 'doing'}], firedCourses: fc}]);
      }
    } else {
      // Prep: rimuovi il piatto. Se ticket vuoto, rimuovi ticket.
      const updated = prep.map(t => {
        if (t.id !== ticketId) return t;
        const items = t.items.filter((_, i) => i !== itemIdx);
        return {...t, items};
      }).filter(t => t.items.length > 0);
      setPrep(updated);
    }
  }

  function startAll(ticketId) {
    const t = attivi.find(x => x.id === ticketId);
    if (!t) return;
    const moved = {...t, items: t.items.map(i => ({...i, state: i.state === 'todo' ? 'doing' : i.state}))};
    setPrep(p => [...p, moved]);
    setAttivi(prev => prev.filter(x => x.id !== ticketId));
  }

  function markReady(ticketId) {
    setPrep(prev => prev.filter(t => t.id !== ticketId));
  }

  function fireCourse(col, ticketId, course) {
    const updater = (list) => list.map(t => {
      if (t.id !== ticketId) return t;
      const fc = new Set(t.firedCourses); fc.add(course);
      const items = t.items.map(i => i.course === course && i.state === 'todo' ? {...i, state: 'doing'} : i);
      return {...t, firedCourses: fc, items};
    });
    if (col === 'attivi') setAttivi(updater);
    else setPrep(updater);
  }

  function simulateFireFromSala() {
    // trova primo ticket course-based con una portata non firata
    const candidates = [...prep, ...attivi].filter(t => t.items.some(i => i.course));
    for (const t of candidates) {
      const courses = [...new Set(t.items.filter(i => i.course).map(i => i.course))].sort();
      const next = courses.find(c => !t.firedCourses.has(c));
      if (next) {
        const col = prep.find(x => x.id === t.id) ? 'prep' : 'attivi';
        fireCourse(col, t.id, next);
        setSalaToast({ ticketId: t.id, courseLabel: COURSE_LABEL[next] });
        return;
      }
    }
  }

  function requestCancel(ticketId, col) {
    const t = (col === 'attivi' ? attivi : prep).find(x => x.id === ticketId);
    if (!t) return;
    const label = t.kind === 'sala' ? `T${t.table}` : t.customer;
    setConfirmCancel({ ticketId, col, label, count: t.items.reduce((a,i)=>a+i.qty,0) });
  }
  function confirmCancelDo() {
    const { ticketId, col } = confirmCancel;
    if (col === 'attivi') setAttivi(prev => prev.filter(t => t.id !== ticketId));
    else setPrep(prev => prev.filter(t => t.id !== ticketId));
    setConfirmCancel(null);
  }

  return (
    <div style={focus ? {height:'100%', display:'flex', flexDirection:'column', position:'relative'} : {position:'relative'}}>
      {/* KPI strip */}
      {!focus && (
        <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap: 14, marginBottom: 18}}>
          <KdsKpi label="Ticket attivi" value={allTickets.length} sub={`${totItems} piatti`} />
          <KdsKpi label="In cottura"    value={inCottura} sub="postazioni attive" />
          <KdsKpi label="Tempo medio"   value={`${avgAge} min`} sub="dall'inserimento" tone={avgAge > 15 ? 'late' : avgAge > 8 ? 'warn' : 'ok'} />
          <KdsKpi
            label="In ritardo" value={lateCount}
            sub={onlyLate ? 'filtro attivo · clicca per togliere' : (lateCount ? 'clicca per filtrare' : 'tutto in linea')}
            tone={lateCount ? 'late' : 'ok'}
            active={onlyLate}
            onClick={lateCount ? () => setOnlyLate(v => !v) : null}
          />
        </div>
      )}

      <div style={{
        background: PN.WHITE,
        borderRadius: focus ? 0 : 12,
        border: focus ? 'none' : `1px solid ${PN.BORDER_HAIR}`,
        boxShadow: focus ? 'none' : '0 1px 0 rgba(15,17,21,0.04), 0 4px 16px rgba(15,17,21,0.03)',
        padding: focus ? '20px 28px' : 22,
        flex: focus ? 1 : 'none',
        display: focus ? 'flex' : 'block',
        flexDirection: focus ? 'column' : 'unset',
        minHeight: focus ? 0 : 'auto',
      }}>
        {/* Header */}
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: 16, gap: 16, flexWrap:'wrap'}}>
          <div style={{display:'flex', alignItems:'center', gap: 12}}>
            <div style={{fontSize: focus ? 18 : 16, fontWeight: 600, color: PN.TEXT, letterSpacing: '-0.01em'}}>Kitchen monitor</div>
            <span style={{
              fontSize: 11, fontWeight: 600, padding:'3px 8px', borderRadius: 999,
              background: PN.GREEN_SOFT, color: PN.GREEN,
              display:'inline-flex', alignItems:'center', gap: 5,
            }}>
              <span style={{width:6, height:6, borderRadius:'50%', background:PN.GREEN, animation:'kdsPulse 1.6s ease-in-out infinite'}}/>
              Live
            </span>
            {focus && (
              <span style={{display:'inline-flex', gap: 14, marginLeft: 6}}>
                <KdsFocusKpi label="Attivi" value={allTickets.length}/>
                <KdsFocusKpi label="Cottura" value={inCottura}/>
                <KdsFocusKpi label="Media" value={`${avgAge}m`} tone={avgAge > 15 ? 'late' : avgAge > 8 ? 'warn' : 'ok'}/>
                <KdsFocusKpi label="Ritardo" value={lateCount} tone={lateCount ? 'late' : 'ok'}/>
              </span>
            )}
          </div>
          <div style={{display:'flex', gap: 10, flexWrap:'wrap', alignItems:'center'}}>
            <KdsSegmented
              options={['Tutti','Sala','Asporto','Delivery']}
              value={kindFilter} onChange={setKindFilter}
            />
            <div style={{width:1, height: 22, background: PN.BORDER}}/>
            {stations.length <= 6 ? (
              <div style={{display:'flex', gap: 6, flexWrap:'wrap'}}>
                {stations.map(f => (
                  <PnPill key={f} active={station === f} onClick={() => setStation(f)}>{f}</PnPill>
                ))}
              </div>
            ) : (
              <select value={station} onChange={e => setStation(e.target.value)} style={{
                padding:'7px 12px', borderRadius: 999, border:`1px solid ${PN.BORDER}`,
                background: PN.WHITE, fontSize: 12.5, fontWeight: 600, color: PN.TEXT, cursor:'pointer',
              }}>
                {stations.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            )}
            <button onClick={onToggleFocus} title={focus ? 'Esci (Esc)' : 'Schermo intero'} style={{
              width: 38, height: 38, borderRadius: 10,
              background: focus ? PN.TEXT : PN.WHITE,
              border: `1px solid ${focus ? PN.TEXT : PN.BORDER}`,
              color: focus ? PN.WHITE : PN.TEXT,
              cursor:'pointer', display:'grid', placeItems:'center', fontFamily:'inherit', marginLeft: 4,
            }}>{focus ? <ExitFullIcon/> : <EnterFullIcon/>}</button>
          </div>
        </div>

        {/* 2 colonne dense */}
        <div style={{
          display:'grid', gridTemplateColumns:'1fr 1fr', gap: focus ? 18 : 16,
          flex: focus ? 1 : 'none', minHeight: focus ? 0 : 'auto',
          overflow: focus ? 'auto' : 'visible',
        }}>
          <KdsColumn title="Attivi" tone={PN.PINK_DARK} toneSoft={PN.PINK_SOFT} count={filteredAttivi.length} empty="Nessun ticket nuovo" bg="#FBFBFC">
            {filteredAttivi.map(t => {
              const sibling = prep.find(x => x.id === t.id);
              return (
              <KdsTicket
                key={t.id} ticket={t} col="attivi"
                onBumpItem={(idx) => bumpItem('attivi', t.id, idx)}
                onPrimary={() => startAll(t.id)}
                primaryLabel="Prendi in carico"
                onCancel={() => requestCancel(t.id, 'attivi')}
                onFireCourse={(c) => fireCourse('attivi', t.id, c)}
                pulseCourse={salaToast?.ticketId === t.id ? salaToast.courseLabel : null}
                splitCount={sibling ? sibling.items.reduce((a,i)=>a+i.qty,0) : 0}
                splitLabel="in cottura"
              />
              );
            })}
          </KdsColumn>

          <KdsColumn title="In preparazione" tone={PN.AMBER} toneSoft={PN.AMBER_SOFT} count={filteredPrep.length} empty="Nessun ticket in cottura" bg="#FFFBF1">
            {filteredPrep.map(t => {
              const allDone = t.items.every(i => i.state === 'done');
              const sibling = attivi.find(x => x.id === t.id);
              return (
                <KdsTicket
                  key={t.id} ticket={t} col="prep"
                  onBumpItem={(idx) => bumpItem('prep', t.id, idx)}
                  onPrimary={() => markReady(t.id)}
                  primaryLabel="Segna come pronto"
                  primaryReady={allDone}
                  onCancel={() => requestCancel(t.id, 'prep')}
                  onFireCourse={(c) => fireCourse('prep', t.id, c)}
                  pulseCourse={salaToast?.ticketId === t.id ? salaToast.courseLabel : null}
                  splitCount={sibling ? sibling.items.reduce((a,i)=>a+i.qty,0) : 0}
                  splitLabel="ancora da iniziare"
                />
              );
            })}
          </KdsColumn>
        </div>
      </div>

      {/* Modal conferma annulla — backdrop blur + glass strong */}
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
      border: `1px solid ${tone}1F`,  // hex alpha ~0.12
      boxShadow: '0 1px 0 rgba(15,17,21,0.04)',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        marginBottom: 14, padding: '2px 4px',
      }}>
        <span style={{fontSize: 13, fontWeight: 600, color: PN.TEXT, letterSpacing: '-0.01em'}}>{title}</span>
        <span style={{
          fontSize: 11, fontWeight: 600, color: tone, background: toneSoft,
          padding: '3px 10px', borderRadius: 999,
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
function KdsTicket({ ticket, col, onBumpItem, onPrimary, primaryLabel, onCancel, onFireCourse, pulseCourse, splitCount = 0, splitLabel = '' }) {
  const age = _ageMin(ticket.time);
  const minToPickup = ticket.pickup ? _toMin(ticket.pickup) - CUC_NOW_MIN : null;
  const u = (ticket.kind === 'asporto' || ticket.kind === 'delivery') && ticket.pickup
    ? _urgencyPickup(minToPickup)
    : _urgencyAge(age);
  const allDone = ticket.items.every(i => i.state === 'done');

  // Glow extra se in ritardo
  const lateGlow = u.tone === 'late';

  // Items raggruppati per portata
  const courseGroups = (() => {
    const courses = [...new Set(ticket.items.map(i => i.course).filter(c => c))].sort();
    if (courses.length === 0) return [{ course: null, items: ticket.items.map((it, i) => ({...it, idx: i})) }];
    return courses.map(c => ({
      course: c,
      items: ticket.items.map((it, i) => ({...it, idx: i})).filter(it => it.course === c),
    }));
  })();

  const kindBadge = (() => {
    if (ticket.kind === 'asporto') return { bg: PN.BLUE_SOFT, fg: PN.BLUE, label: 'ASPORTO', icon: <BagIcon/> };
    if (ticket.kind === 'delivery') return { bg: '#EDE9FE', fg: '#7C3AED', label: 'DELIVERY', icon: <ScooterIcon/> };
    return null;
  })();

  return (
    <div style={{
      background: PN.WHITE, borderRadius: 14,
      border: `1px solid ${lateGlow ? PN.RED : PN.BORDER_HAIR}`,
      borderLeft: `4px solid ${u.dot}`,
      overflow: 'hidden',
      boxShadow: lateGlow
        ? `0 0 0 3px ${PN.RED}22, 0 8px 20px rgba(220, 38, 38, 0.10), 0 1px 2px rgba(15,17,21,0.04)`
        : '0 1px 0 rgba(15,17,21,0.04), 0 6px 18px rgba(15,17,21,0.04)',
      animation: lateGlow ? 'kdsLatePulse 2s ease-in-out infinite' : 'none',
      transition: 'box-shadow 200ms ease-out, transform 200ms ease-out',
    }}>
      <style>{`@keyframes kdsLatePulse { 0%,100% { box-shadow: 0 0 0 3px ${PN.RED}22, 0 8px 20px rgba(220,38,38,0.10); } 50% { box-shadow: 0 0 0 6px ${PN.RED}33, 0 12px 28px rgba(220,38,38,0.16); } }`}</style>
      {/* header — design 2.1: padding 14, border hairline, copy weight 600 */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
        borderBottom: `1px solid ${PN.BORDER_HAIR}`,
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
              <div style={{fontSize: 10.5, color: PN.MUTED, marginTop: 2}}>
                {ticket.orderN} · {ticket.kind === 'delivery' ? 'consegna' : 'ritiro'} {ticket.pickup}
              </div>
            </React.Fragment>
          ) : (
            <React.Fragment>
              <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
                <div style={{fontSize: 22, fontWeight: 600, color: PN.TEXT, lineHeight: 1, letterSpacing: '-0.02em'}}>T{ticket.table}</div>
                {splitCount > 0 && (
                  <span style={{
                    fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 999,
                    background: col === 'attivi' ? PN.AMBER_SOFT : PN.PINK_SOFT,
                    color: col === 'attivi' ? '#92400E' : PN.PINK_DARK,
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                  }}>↔ {splitCount} {splitLabel}</span>
                )}
              </div>
              <div style={{fontSize: 10.5, color: PN.MUTED, marginTop: 4, fontWeight: 500}}>{ticket.orderN}</div>
            </React.Fragment>
          )}
        </div>
        {/* Timer prominente — Apple-style "pill" con tabular-nums e weight 600 */}
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

      {/* items per portata */}
      <div style={{display:'flex', flexDirection:'column'}}>
        {courseGroups.map((g, gi) => {
          if (g.course === null) {
            return g.items.map((it) => (
              <KdsItemRow key={it.idx} item={it} onBump={() => onBumpItem(it.idx)}/>
            ));
          }
          return (
            <CourseGroup
              key={gi} group={g} ticket={ticket}
              onFireCourse={onFireCourse} onBumpItem={onBumpItem}
              pulseCourse={pulseCourse}
            />
          );
        })}
      </div>

      {/* Footer actions — design 2.1: bg WHITE_OFF + hairline border + CTA Apple */}
      <div style={{
        display: 'flex', gap: 8, padding: '10px 14px', alignItems: 'center',
        borderTop: `1px solid ${PN.BORDER_HAIR}`,
        background: PN.WHITE_OFF,
      }}>
        <button onClick={onCancel} style={{
          padding: '6px 12px',
          background: 'transparent', color: PN.MUTED,
          border: `1px solid ${PN.BORDER_HAIR}`,
          borderRadius: 7,
          fontSize: 11, fontWeight: 500,
          cursor: 'pointer', fontFamily: 'inherit',
          transition: 'background 150ms ease-out, color 150ms ease-out',
        }}
          onMouseEnter={e => { e.currentTarget.style.background = PN.WHITE_HUSH; e.currentTarget.style.color = PN.TEXT; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = PN.MUTED; }}
        >Annulla</button>
        <span style={{flex: 1}}/>
        <button
          onClick={onPrimary}
          disabled={col === 'prep' && !allDone}
          style={{
            padding: '7px 14px', borderRadius: 8,
            background: (col === 'prep' && !allDone)
              ? PN.WHITE_HUSH
              : (col === 'attivi' ? PN.BTN_DARK : 'linear-gradient(180deg, #16A34A 0%, #15803D 100%)'),
            color: (col === 'prep' && !allDone) ? PN.MUTED_SOFT : PN.WHITE,
            border: (col === 'prep' && !allDone)
              ? `1px solid ${PN.BORDER_HAIR}`
              : (col === 'attivi' ? '1px solid rgba(0,0,0,0.32)' : '1px solid rgba(15,80,40,0.40)'),
            fontSize: 11.5, fontWeight: 600,
            cursor: (col === 'prep' && !allDone) ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit',
            boxShadow: (col === 'prep' && !allDone)
              ? 'none'
              : 'inset 0 1px 0 rgba(255,255,255,0.30), 0 1px 2px rgba(15,17,21,0.06)',
            display: 'inline-flex', alignItems: 'center', gap: 5,
        }}>
          {col === 'attivi' ? 'Inizia tutti' : 'Segna tutti pronti'}
          {col === 'prep' && allDone && <PnI.Check size={11} color="#fff"/>}
        </button>
      </div>
    </div>
  );
}

// ─── Course group (collassabile se done) ────────────────────
function CourseGroup({ group, ticket, onFireCourse, onBumpItem, pulseCourse }) {
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
        <KdsItemRow key={it.idx} item={it} onBump={() => onBumpItem(it.idx)} disabled={!isFired}/>
      ))}
    </React.Fragment>
  );
}

// ─── Item row ───────────────────────────────────────────────
function KdsItemRow({ item, onBump, disabled = false }) {
  const critical = _isCriticalNote(item.note, item.allergen);
  const bigQty = item.qty > 1;
  const [hover, setHover] = React.useState(false);
  return (
    <div
      onClick={disabled ? null : onBump}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display:'flex', alignItems:'center', gap: 10,
        padding: '10px 14px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        background: hover && !disabled ? '#F4F5F7' : 'transparent',
        opacity: disabled ? 0.4 : 1,
        borderTop: `1px solid ${PN.BORDER_SOFT}`,
        transition: 'background 0.12s',
      }}
    >
      {/* Qty badge — più grande se >1 */}
      <span style={{
        minWidth: bigQty ? 34 : 26, height: bigQty ? 34 : 26, borderRadius: 8,
        background: PN.TEXT,
        color: PN.WHITE, fontWeight: 800, fontSize: bigQty ? 16 : 12,
        display:'inline-flex', alignItems:'center', justifyContent:'center',
        flexShrink: 0, padding: '0 6px',
      }}>{item.qty}×</span>

      <div style={{flex: 1, minWidth: 0}}>
        {critical && item.note && (
          <div style={{
            display:'inline-flex', alignItems:'center', gap: 4, marginBottom: 3,
            fontSize: 11, fontWeight: 800, color: PN.WHITE, background: PN.RED,
            padding:'2px 7px', borderRadius: 4, textTransform:'uppercase', letterSpacing: 0.4,
          }}>
            <PnI.Alert size={11} color={PN.WHITE}/> {item.note}
          </div>
        )}
        <div style={{
          fontSize: 16, fontWeight: 700, color: PN.TEXT, lineHeight: 1.25,
        }}>{item.name}</div>
        {item.note && !critical && (
          <div style={{
            display:'inline-flex', alignItems:'center', gap: 4, marginTop: 3,
            fontSize: 11, fontWeight: 600, color: '#92400E', background: PN.AMBER_SOFT,
            padding:'2px 6px', borderRadius: 4,
          }}>{item.note}</div>
        )}
      </div>

      {/* Chevron — visibile solo al hover */}
      <span style={{
        fontSize: 18, color: PN.MUTED, fontWeight: 700, flexShrink: 0,
        opacity: hover && !disabled ? 1 : 0,
        transform: hover && !disabled ? 'translateX(2px)' : 'translateX(-4px)',
        transition: 'opacity 0.15s, transform 0.15s',
      }}>›</span>
    </div>
  );
}

// ─── Icons ────────────────────────────────────────────────
function ClockIcon() { return (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/></svg>); }
function PlayIcon()  { return (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="6 4 20 12 6 20 6 4" fill="currentColor" stroke="none"/></svg>); }
function CheckIcon() { return (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>); }
function BagIcon()   { return (<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>); }
function ScooterIcon() { return (<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="17" r="3"/><circle cx="18" cy="17" r="3"/><path d="M9 17h6M14 6h3l3 8M8 17l3-8h6"/></svg>); }
function BellIcon()    { return (<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10 21a2 2 0 0 0 4 0"/></svg>); }

function KdsFocusKpi({ label, value, tone }) {
  const c = tone === 'late' ? PN.RED : tone === 'warn' ? PN.AMBER : PN.TEXT;
  return (
    <span style={{
      display:'inline-flex', alignItems:'baseline', gap: 5,
      padding: '4px 12px', borderRadius: 999,
      background: PN.BG, border: `1px solid ${PN.BORDER_SOFT}`,
    }}>
      <span style={{fontSize: 11, color: PN.MUTED, fontWeight: 600, textTransform:'uppercase', letterSpacing: 0.4}}>{label}</span>
      <span style={{fontSize: 14, fontWeight: 700, color: c, lineHeight: 1}}>{value}</span>
    </span>
  );
}
function EnterFullIcon() { return (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 9V5a1 1 0 0 1 1-1h4"/><path d="M20 9V5a1 1 0 0 0-1-1h-4"/><path d="M4 15v4a1 1 0 0 0 1 1h4"/><path d="M20 15v4a1 1 0 0 1-1 1h-4"/></svg>); }
function ExitFullIcon()  { return (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 4v4a1 1 0 0 1-1 1H4"/><path d="M15 4v4a1 1 0 0 0 1 1h4"/><path d="M9 20v-4a1 1 0 0 0-1-1H4"/><path d="M15 20v-4a1 1 0 0 1 1-1h4"/></svg>); }

function KdsSegmented({ options, value, onChange }) {
  return (
    <div style={{
      display:'inline-flex', background: PN.BG, padding: 2, borderRadius: 999,
      border: `1px solid ${PN.BORDER_SOFT}`,
    }}>
      {options.map(o => {
        const active = value === o;
        return (
          <button key={o} onClick={() => onChange(o)} style={{
            padding: '5px 10px', fontSize: 11.5, fontWeight: 600,
            background: active ? PN.WHITE : 'transparent',
            color: active ? PN.TEXT : PN.MUTED,
            border: 'none', borderRadius: 999, cursor: 'pointer', fontFamily: 'inherit',
            boxShadow: active ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
          }}>{o}</button>
        );
      })}
    </div>
  );
}

window.CucinaInSala = CucinaInSala;
