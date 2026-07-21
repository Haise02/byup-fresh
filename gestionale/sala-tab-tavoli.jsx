// Sala — Tab Tavoli (no timeline, card compatte, mappa+lista)

function SalaTavoli({ tweaks, onOpenAdd, onOpenPay, onAddArticle, cart, onCartChange, onConfirmCart, focus, onToggleFocus, onAdjustCoperti, onAdjustReservationPosti, contiCollapsed, onLibera, onMove, onEdit, onAssignOther, onNoShow, onUnisci, onModificaCoperti }) {
  const [search, setSearch] = React.useState('');
  const [room, setRoom] = React.useState('Sala principale');
  // Filtri multi-select: Set di chiavi KPI. Tutte attive default; vuoto = mostra tutti.
  const [filters, setFilters] = React.useState(() => new Set(['Tutti']));
  // Filtro alert: quando attivo, mostra solo le card con triangolo rosso (>20' di ritardo o da pulire)
  const [alertOnly, setAlertOnly] = React.useState(false);
  const [view, setView] = React.useState(tweaks.defaultView || 'mappa');
  const [expandedId, setExpandedId] = React.useState(null);
  // Modalità "Unisci tavoli": selezione multipla sulla mappa → conferma.
  const [mergeMode, setMergeMode] = React.useState(false);
  const [mergeSel, setMergeSel] = React.useState(() => new Set());
  const toggleMergeMode = () => {
    setMergeMode(m => !m);
    setMergeSel(new Set());
    setExpandedId(null);
  };
  const toggleMergeSel = (pid) => setMergeSel(prev => {
    const n = new Set(prev);
    if (n.has(pid)) n.delete(pid); else n.add(pid);
    return n;
  });
  const exitMergeMode = () => { setMergeMode(false); setMergeSel(new Set()); };
  React.useEffect(() => { if (view !== 'mappa' && mergeMode) exitMergeMode(); }, [view]);

  // Esclude i tavoli "uniti" (mergedWith): non sono entità autonome, fanno parte del source.
  const tavoliBase = (window.SALA_TAVOLI || SALA_TAVOLI).filter(t => !t.mergedWith);
  const counts = {
    Tutti: tavoliBase.length,
    Liberi: tavoliBase.filter(t=>t.state==='libero').length,
    Prenotati: tavoliBase.filter(t=>t.state==='prenotato').length,
    Occupati: tavoliBase.filter(t=>t.state==='occupato').length,
    'Da pulire': tavoliBase.filter(t=>t.state==='dapulire').length,
  };
  const filterToState = { 'Liberi':'libero', 'Prenotati':'prenotato', 'Occupati':'occupato', 'Da pulire':'dapulire' };
  const activeStates = new Set();
  filters.forEach(k => { if (filterToState[k]) activeStates.add(filterToState[k]); });

  // Match function: stato (multi-select) + ricerca + alert filter (aggiuntivo)
  const matchTavolo = (t) => {
    const matchState = activeStates.size === 0 || activeStates.has(t.state);
    if (!matchState) return false;
    if (alertOnly && !(window.hasAlertTriangle && window.hasAlertTriangle(t))) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const inId = String(t.id).includes(q);
    const inParty = (t.party || '').toLowerCase().includes(q);
    const inNext = (t.nextReservation?.name || '').toLowerCase().includes(q);
    return inId || inParty || inNext;
  };

  // Senza useMemo: legge window.SALA_TAVOLI fresco ad ogni render (la memo era stale su cambio stato).
  const alertCount = (() => {
    if (!window.hasAlertTriangle) return 0;
    const all = window.SALA_TAVOLI || SALA_TAVOLI;
    return all.filter(t => !t.mergedWith && window.hasAlertTriangle(t)).length;
  })();

  // Se non ci sono più alert, disattiva il filtro alertOnly (così la UI non resta bloccata).
  React.useEffect(() => {
    if (alertCount === 0 && alertOnly) setAlertOnly(false);
  }, [alertCount, alertOnly]);
  const _stateOrder = { occupato: 0, prenotato: 1, dapulire: 2, libero: 3 };
  // Lista: filtra + ordina per stato poi per numero tavolo
  const visibili = tavoliBase.filter(matchTavolo).sort((a, b) => {
    const sd = (_stateOrder[a.state] ?? 99) - (_stateOrder[b.state] ?? 99);
    if (sd !== 0) return sd;
    return (a.id || 0) - (b.id || 0);
  });
  // Mappa: tutti i tavoli sempre visibili (la disposizione fisica è significativa); i non-match sono dimmed
  const isFiltering = activeStates.size > 0 || !!search.trim() || alertOnly;
  const dimmedIds = isFiltering
    ? new Set(tavoliBase.filter(t => !matchTavolo(t)).map(t => t.id))
    : new Set();

  // KPI cards = filtri multi-select della pagina. Click su una card aggiunge/toglie
  // il suo stato dal filtro attivo; più card insieme = unione (OR) degli stati.
  // Accenti allineati alla palette della mappa (TT_ACCENTS in sala-table-tile.jsx)
  const kpiCards = [
    {key: 'Tutti',     label: 'Tutti i tavoli',     value: counts.Tutti,        accent: '#0F1115', soft: '#F3F4F6', icon: 'M4 6h16M4 12h16M4 18h16'},
    {key: 'Occupati',  label: 'Occupati',  value: counts.Occupati,     accent: '#E32459', soft: 'rgba(255, 90, 95, 0.18)',  icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75'},
    {key: 'Prenotati', label: 'Prenotati', value: counts.Prenotati,    accent: '#6D28D9', soft: 'rgba(124, 58, 237, 0.12)', icon: 'M3 4h18v18H3z M3 10h18 M8 2v4 M16 2v4'},
    {key: 'Da pulire', label: 'Da liberare', value: counts['Da pulire'], accent: '#B45309', soft: 'rgba(217, 119, 6, 0.14)',  icon: 'M3 6h18 M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6 M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2'},
    {key: 'Liberi',    label: 'Liberi',    value: counts.Liberi,       accent: '#15803D', soft: 'rgba(22, 163, 74, 0.10)',  icon: 'M5 13l4 4L19 7'},
  ];
  const totale = counts.Tutti;
  // KPI Riempimento: preferisci coperti se disponibili, fallback su numero tavoli
  const totalCoperti = tavoliBase.reduce((s,t) => s + (t.state === 'occupato' ? (t.coperti || 0) : 0), 0);
  const totalPosti   = tavoliBase.reduce((s,t) => s + (t.posti || 0), 0);
  const useCoperti = totalCoperti > 0 && totalPosti > 0;
  const fillNum = useCoperti ? totalCoperti  : counts.Occupati;
  const fillDen = useCoperti ? totalPosti    : totale;
  const fillLabel = useCoperti ? 'coperti'   : 'tavoli';
  const occPct = fillDen ? Math.round((fillNum / fillDen) * 100) : 0;
  const toggleFilter = (key) => setFilters(prev => {
    if (key === 'Tutti') return new Set(['Tutti']);
    const next = new Set(prev);
    next.delete('Tutti');
    if (next.has(key)) next.delete(key); else next.add(key);
    if (next.size === 0) return new Set(['Tutti']);
    if (['Occupati','Prenotati','Da pulire','Liberi'].every(k => next.has(k))) return new Set(['Tutti']);
    return next;
  });

  return (
    <div>
      {/* Toolbar — riga 1: come vedo · riga 2: cosa vedo */}
      <div style={{
        background: PN.WHITE, borderRadius: 14,
        border: `1px solid ${PN.BORDER_HAIR}`,
        boxShadow: '0 1px 0 rgba(15,17,21,0.04), 0 6px 18px rgba(15,17,21,0.04)',
        padding: '11px 14px', marginBottom: 12,
      }}>

        {/* Riga 1 — Vista + Ricerca + Sala + Fullscreen */}
        <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
          {/* Segmented view toggle */}
          <div style={{
            position: 'relative',
            display: 'inline-grid', gridTemplateColumns: '1fr 1fr',
            padding: 3, borderRadius: 9,
            background: PN.WHITE_FROST,
            boxShadow: 'inset 0 1px 1px rgba(15,17,21,0.04)',
            flexShrink: 0,
          }}>
            <span style={{
              position: 'absolute',
              top: 3, left: view === 'lista' ? 3 : 'calc(50% + 0px)',
              width: 'calc(50% - 3px)', height: 'calc(100% - 6px)',
              background: PN.WHITE, borderRadius: 7,
              boxShadow: '0 1px 0 rgba(255,255,255,0.6) inset, 0 1px 2px rgba(15,17,21,0.08)',
              transition: 'left 280ms cubic-bezier(0.32,0.72,0,1)',
              pointerEvents: 'none',
            }}/>
            {[{id:'lista',label:'Lista'},{id:'mappa',label:'Mappa'}].map(v => (
              <button key={v.id} onClick={() => setView(v.id)} style={{
                position: 'relative', zIndex: 1,
                padding: '6px 16px', borderRadius: 7,
                background: 'transparent',
                color: view === v.id ? PN.TEXT : PN.MUTED,
                border: 'none', fontSize: 16.5, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit',
                transition: 'color 200ms ease-out',
              }}>{v.label}</button>
            ))}
          </div>

          {/* Divider */}
          <div style={{width: 1, height: 20, background: PN.BORDER_HAIR, flexShrink: 0, margin: '0 2px'}}/>

          {/* Unisci tavoli — dark sunset glass (D3): base wine-burnt + inset
              ring caldo, mai nero piatto. Attiva la selezione multipla. */}
          {view === 'mappa' && (
            <button onClick={toggleMergeMode} style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              height: 30, padding: '0 13px 0 10px', borderRadius: 9,
              background: `
                radial-gradient(circle at 82% 18%, rgba(255, 96, 102, ${mergeMode ? 0.45 : 0.32}), transparent 62%),
                linear-gradient(180deg, rgba(58, 28, 22, 0.96) 0%, rgba(30, 12, 10, 0.98) 100%)
              `,
              color: '#FFE9E6',
              border: 'none',
              boxShadow: mergeMode
                ? 'inset 0 1px 0 rgba(255,200,210,0.26), inset 0 0 0 1px rgba(255,130,150,0.30), 0 0 0 3px rgba(255,90,95,0.22), 0 8px 22px -8px rgba(80,10,30,0.60)'
                : 'inset 0 1px 0 rgba(255,200,210,0.18), inset 0 0 0 1px rgba(255,130,150,0.12), 0 8px 22px -8px rgba(80,10,30,0.55), 0 3px 8px -4px rgba(80,10,30,0.30)',
              fontSize: 14.5, fontWeight: 700, letterSpacing: '0.01em',
              cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0,
              transition: 'box-shadow 180ms ease-out, filter 150ms ease-out, transform 150ms ease-out',
            }}
              onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.15)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.filter = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                <path d="M12 5v14 M5 12h14"/>
              </svg>
              Unisci tavoli
            </button>
          )}

          <SearchExpandable value={search} onChange={setSearch} placeholder="Cerca tavolo o cliente" expandedWidth={220}/>

          <span style={{flex: 1}}/>

          <SaSelect value={room} onChange={setRoom} options={['Sala principale','Sala terrazza','Privé']}/>

          {/* Fullscreen — affiancato al select sala, estrema destra */}
          {onToggleFocus && (
            <button onClick={onToggleFocus} title={focus ? 'Esci da schermo intero' : 'Schermo intero'} style={{
              width: 30, height: 30, borderRadius: 7,
              background: 'transparent', color: PN.MUTED,
              border: `1px solid ${PN.BORDER_HAIR}`,
              cursor: 'pointer', fontFamily: 'inherit',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, transition: 'background 150ms, color 150ms',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = PN.WHITE_FROST; e.currentTarget.style.color = PN.TEXT; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = PN.MUTED; }}
            >
              <SvIcon path={focus
                ? "M9 9 3 3 M15 9l6-6 M9 15l-6 6 M15 15l6 6"
                : "M3 7V5a2 2 0 0 1 2-2h2 M17 3h2a2 2 0 0 1 2 2v2 M21 17v2a2 2 0 0 1-2 2h-2 M7 21H5a2 2 0 0 1-2-2v-2"} size={13}/>
            </button>
          )}
        </div>

        {/* Divider orizzontale */}
        <div style={{height: 1, background: PN.BORDER_HAIR, margin: '10px -14px'}}/>

        {/* Riga 2 — Chip di stato (filtri) + Riempimento */}
        <div style={{display: 'flex', alignItems: 'center', gap: 6}}>
          {kpiCards.map(kpi => {
            const isActive = filters.has(kpi.key);
            return (
              <button
                key={kpi.key}
                onClick={() => toggleFilter(kpi.key)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 7,
                  padding: '5px 11px 5px 9px', borderRadius: 8, height: 32,
                  background: isActive ? kpi.soft : PN.BTN_NEUTRAL,
                  border: `1.5px solid ${isActive ? kpi.accent + '55' : PN.BORDER_SOFT_A}`,
                  cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0,
                  transition: 'background 150ms ease-out, border-color 150ms ease-out, box-shadow 150ms ease-out',
                  boxShadow: isActive
                    ? `inset 0 1px 0 rgba(255,255,255,0.45), 0 1px 4px ${kpi.accent}1F`
                    : `${PN.INSET_HIGHLIGHT}, 0 1px 2px rgba(15,17,21,0.04)`,
                }}
                onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = PN.BTN_NEUTRAL_HOVER; e.currentTarget.style.borderColor = PN.BORDER_LIGHT; }}}
                onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = PN.BTN_NEUTRAL; e.currentTarget.style.borderColor = PN.BORDER_SOFT_A; }}}
              >
                {/* Dot */}
                <span style={{
                  width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
                  background: isActive ? kpi.accent : '#CBD5E1',
                  transition: 'background 150ms ease-out',
                  boxShadow: isActive ? `0 0 0 2.5px ${kpi.accent}22` : 'none',
                }}/>
                {/* Count */}
                <span style={{
                  fontSize: 19, fontWeight: 700, lineHeight: 1,
                  color: isActive ? kpi.accent : '#374151',
                  fontVariantNumeric: 'tabular-nums',
                  letterSpacing: '-0.01em',
                  transition: 'color 150ms ease-out',
                }}>{kpi.value}</span>
                {/* Label */}
                <span style={{
                  fontSize: 16, fontWeight: 500, lineHeight: 1,
                  color: isActive ? kpi.accent : '#9CA3AF',
                  transition: 'color 150ms ease-out',
                }}>{kpi.label}</span>
              </button>
            );
          })}

          {/* Triangolo filtro alert — sempre visibile; disabilitato se nessun alert attivo */}
          <button
            onClick={() => alertCount > 0 && setAlertOnly(v => !v)}
            title={alertCount === 0 ? 'Nessuna segnalazione' : (alertOnly ? 'Mostra tutti i tavoli' : `Mostra solo le segnalazioni (${alertCount})`)}
            disabled={alertCount === 0}
            style={{
              display:'inline-flex', alignItems:'center', gap: 5,
              padding:'5px 10px 5px 8px', borderRadius: 8, height: 32,
              background: alertOnly ? '#FEE2E2' : '#fff',
              border: `1.5px solid ${alertOnly ? '#DC2626' : (alertCount === 0 ? '#E5E7EB' : '#FCA5A5')}`,
              cursor: alertCount === 0 ? 'default' : 'pointer',
              fontFamily:'inherit', flexShrink: 0,
              opacity: alertCount === 0 ? 0.45 : 1,
              transition: 'background 150ms ease-out, border-color 150ms ease-out, box-shadow 150ms ease-out, opacity 150ms ease-out',
              boxShadow: alertOnly ? '0 1px 4px rgba(220,38,38,0.18)' : 'none',
            }}
            onMouseEnter={e => { if (!alertOnly && alertCount > 0) { e.currentTarget.style.background = '#FEF2F2'; e.currentTarget.style.borderColor = '#DC2626'; } }}
            onMouseLeave={e => { if (!alertOnly && alertCount > 0) { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#FCA5A5'; } }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill={alertCount === 0 ? '#9CA3AF' : '#DC2626'} stroke="none">
              <path d="M12 2 L22 20 H2 Z" fill={alertCount === 0 ? '#9CA3AF' : '#DC2626'}/>
              <path d="M12 9 V14 M12 17 h0.01" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" fill="none"/>
            </svg>
            <span style={{
              fontSize: 16.5, fontWeight: 700,
              color: alertCount === 0 ? '#9CA3AF' : '#DC2626',
              fontVariantNumeric:'tabular-nums', lineHeight: 1,
            }}>{alertCount}</span>
          </button>

          <span style={{flex: 1}}/>

          {/* Conti aperti — stato della sala come il riempimento, ma cliccabile:
              porta in Contabilità col filtro "da saldare" attivo. Nascosto a zero. */}
          {(window.SALA_CONTI_APERTI || []).length > 0 && (
            <button
              onClick={() => { window.location.href = 'byup Contabilita.html?tab=conti&filter=da_saldare'; }}
              title="Apri la Contabilità con il filtro Da saldare attivo"
              style={{
                display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0,
                padding: '4px 10px', borderRadius: 8,
                background: PN.WHITE_HUSH, border: `1px solid ${PN.BORDER_HAIR}`,
                boxShadow: 'inset 0 1px 1px rgba(15,17,21,0.04)',
                cursor: 'pointer', fontFamily: 'inherit',
                transition: 'border-color 150ms, background 150ms',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#9CA3AF'; e.currentTarget.style.background = PN.WHITE; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = PN.BORDER_HAIR; e.currentTarget.style.background = PN.WHITE_HUSH; }}
            >
              <span style={{
                fontSize: 16.5, fontWeight: 700, color: PN.TEXT,
                fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.01em',
              }}>{(window.SALA_CONTI_APERTI || []).length}</span>
              <span style={{fontSize: 15, color: PN.MUTED}}>
                Conti aperti
              </span>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{color: PN.MUTED}}><path d="M7 17 17 7M8 7h9v9"/></svg>
            </button>
          )}

        </div>

      </div>{/* /toolbar */}

      {/* Vista */}
      {view === 'mappa'
        ? <SalaFloorPlan tavoli={SALA_TAVOLI} dimmedIds={dimmedIds}
            mergeMode={mergeMode} mergeSel={mergeSel}
            onToggleMergeSel={toggleMergeSel} onExitMerge={exitMergeMode}
            onOpenAdd={onOpenAdd} onOpenPay={onOpenPay}
            onAddArticle={onAddArticle} cart={cart} onCartChange={onCartChange} onConfirmCart={onConfirmCart}
            expandedId={expandedId} setExpandedId={setExpandedId} onAdjustCoperti={onAdjustCoperti}
            onAdjustReservationPosti={onAdjustReservationPosti}
            onLibera={onLibera} onMove={onMove} onEdit={onEdit} onAssignOther={onAssignOther} onNoShow={onNoShow}
            onUnisci={onUnisci} onModificaCoperti={onModificaCoperti}/>
        : <SalaListView tavoli={visibili} onOpenAdd={onOpenAdd} onOpenPay={onOpenPay}
            onAddArticle={onAddArticle} cart={cart} onCartChange={onCartChange} onConfirmCart={onConfirmCart}
            expandedId={expandedId} setExpandedId={setExpandedId} onAdjustCoperti={onAdjustCoperti}
            onAdjustReservationPosti={onAdjustReservationPosti}
            contiCollapsed={contiCollapsed}
            onLibera={onLibera} onMove={onMove} onEdit={onEdit} onAssignOther={onAssignOther} onNoShow={onNoShow}
            onUnisci={onUnisci} onModificaCoperti={onModificaCoperti}/>
      }
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// List view — griglia di card compatte
// ─────────────────────────────────────────────────────────
function SalaListView({ tavoli, onOpenAdd, onOpenPay, onAddArticle, cart, onCartChange, onConfirmCart, expandedId, setExpandedId, onAdjustCoperti, onAdjustReservationPosti, contiCollapsed, onLibera, onMove, onEdit, onAssignOther, onNoShow, onUnisci, onModificaCoperti }) {
  const sorted = tavoli; // ordinamento già applicato dal parent (stato → numero)

  // Griglia responsiva: pannello aperto (contiCollapsed=false) → 3 col, chiuso → 4 col
  const cols = contiCollapsed ? 4 : 3;
  return (
    <div style={{display:'grid', gridTemplateColumns:`repeat(${cols}, 1fr)`, gap: 10, alignItems:'start'}}>
      {sorted.map(t => (
        <SalaCard key={t.id} t={t}
          expanded={expandedId === t.id}
          onToggle={()=>setExpandedId(id => id === t.id ? null : t.id)}
          onAdd={()=>onOpenAdd(t)} onPay={()=>onOpenPay(t)}
          onAddArticle={onAddArticle} cart={cart} onCartChange={onCartChange} onConfirmCart={onConfirmCart}
          onAdjustCoperti={(n) => onAdjustCoperti && onAdjustCoperti(t.id, n)}
          onAdjustReservationPosti={(n) => onAdjustReservationPosti && onAdjustReservationPosti(t.id, n)}
          onLibera={onLibera} onMove={onMove} onEdit={onEdit}
          onAssignOther={onAssignOther} onNoShow={onNoShow}
          onUnisci={onUnisci} onModificaCoperti={onModificaCoperti}/>
      ))}
      {sorted.length === 0 && (
        <div style={{
          gridColumn:'1/-1', padding: 50, textAlign:'center',
          color:'#6B7280', fontSize: 18,
          background:'#fff', borderRadius: 12,
          border:'1px dashed #E5E7EB',
        }}>Nessun tavolo trovato</div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Floor plan view
// ─────────────────────────────────────────────────────────
// Configurazione iniziale tavoli sulla mappa runtime — shape e posizione di partenza.
// Le posizioni diventano stateful (draggable); le forme sono fisse a setup time.
// Elementi fissi della sala — non draggabili, collisione attiva per i tavoli.
const SALA_FIXTURES = [
  { id: 'bancone', type: 'counter',  x: 0,  y: 0, w: 5, h: 1 },
  { id: 'cucina',  type: 'kitchen',  x: 5,  y: 0, w: 7, h: 1 },
  { id: 'bagno',   type: 'bathroom', x: 10, y: 6, w: 2, h: 2 },
];

const SALA_INITIAL_POSITIONS = {
  1:{x:1, y:1, shape:'round'},   2:{x:3, y:1, shape:'square'},
  3:{x:5, y:1, shape:'rect'},    4:{x:8, y:1, shape:'round'},
  5:{x:10, y:1, shape:'square'},
  6:{x:1, y:3, shape:'round'},   7:{x:3, y:3, shape:'rect'},
  8:{x:6, y:3, shape:'square'},  9:{x:8, y:3, shape:'round'},
  10:{x:10, y:3, shape:'rect'},
  11:{x:1, y:5, shape:'round'},  12:{x:3, y:5, shape:'square'},
  13:{x:5, y:5, shape:'round'},  14:{x:7, y:5, shape:'round'},
  15:{x:9, y:5, shape:'rect'},
  16:{x:1, y:6.5, shape:'square'}, 17:{x:3, y:6.5, shape:'round'},
  18:{x:6, y:6.5, shape:'rect'},
};

// Footprint del tavolo in unità di cella — derivato da posti+orientation.
// Forma da ttSeatShape (sala-table-tile.jsx): 2-3 round, 4-5 square,
// 6-8 rect 2u, >8 rect 3u. Il primo arg (shape legacy) è ignorato.
function getTableDims(shape, posti, orientation) {
  return ttFootprintUnits(posti || 4, ttSeatShape(posti || 4), orientation || 'h');
}

const SALA_GRID_COLS = 12, SALA_GRID_ROWS = 8;

// Posizioni iniziali senza sovrapposizioni: parte da SALA_INITIAL_POSITIONS
// e sposta a spirale i tavoli il cui footprint (ora variabile) collide
// con tavoli già piazzati o fixture.
function salaInitPositions() {
  const all = window.SALA_TAVOLI || [];
  const placed = [...SALA_FIXTURES];
  const init = {};
  Object.entries(SALA_INITIAL_POSITIONS).forEach(([key, p]) => {
    const id = parseInt(key, 10);
    const t = all.find(x => x.id === id);
    const fp = getTableDims(null, t?.posti, 'h');
    let pos = null;
    outer:
    for (let r = 0; r <= 14; r += 0.5) {
      for (let dx = -r; dx <= r; dx += 0.5) {
        for (let dy = -r; dy <= r; dy += 0.5) {
          if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
          const nx = Math.max(0, Math.min(SALA_GRID_COLS - fp.w, Math.round((p.x + dx) * 2) / 2));
          const ny = Math.max(0, Math.min(SALA_GRID_ROWS - fp.h, Math.round((p.y + dy) * 2) / 2));
          const rect = { x: nx, y: ny, w: fp.w, h: fp.h };
          if (!placed.some(o => rectsOverlap(rect, o))) { pos = rect; break outer; }
        }
      }
    }
    if (!pos) pos = { x: p.x, y: p.y, w: fp.w, h: fp.h };
    placed.push(pos);
    init[id] = { x: pos.x, y: pos.y, shape: p.shape, orientation: 'h' };
  });
  return init;
}

// Accenti traslucidi per stato — usati dalla cornice di unione tavoli.
// (Il disegno del tavolo vive in sala-table-tile.jsx → <TableTile/>.)
const SALA_TILE_GLASS = {
  libero:    { tint: 'rgba(22, 163, 74, 0.10)',  ring: 'rgba(22, 163, 74, 0.40)',  ink: '#15803D' },
  prenotato: { tint: 'rgba(124, 58, 237, 0.12)', ring: 'rgba(124, 58, 237, 0.38)', ink: '#6D28D9' },
  occupato:  { tint: 'rgba(255, 90, 95, 0.18)',  ring: 'rgba(227, 36, 89, 0.42)',  ink: '#E32459' },
  dapulire:  { tint: 'rgba(217, 119, 6, 0.14)',  ring: 'rgba(217, 119, 6, 0.42)',  ink: '#B45309' },
};

function rectsOverlap(a, b) {
  return !(a.x + a.w <= b.x || b.x + b.w <= a.x || a.y + a.h <= b.y || b.y + b.h <= a.y);
}

function rectsGap(a, b) {
  const gx = Math.max(0, Math.max(a.x, b.x) - Math.min(a.x + a.w, b.x + b.w));
  const gy = Math.max(0, Math.max(a.y, b.y) - Math.min(a.y + a.h, b.y + b.h));
  return Math.sqrt(gx * gx + gy * gy);
}

function rectsIntersectArea(a, b) {
  const w = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
  const h = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
  return w > 0 && h > 0 ? w * h : 0;
}

function SalaFloorPlan({ tavoli, dimmedIds, mergeMode, mergeSel, onToggleMergeSel, onExitMerge, onOpenAdd, onOpenPay, onAddArticle, cart, onCartChange, onConfirmCart, expandedId, setExpandedId, onAdjustCoperti, onAdjustReservationPosti, onLibera, onMove, onEdit, onAssignOther, onNoShow, onUnisci, onModificaCoperti }) {
  const isDimmed = (id) => dimmedIds && dimmedIds.has(id);
  const COLS = SALA_GRID_COLS, ROWS = SALA_GRID_ROWS;
  // SCHERMATA UNICA: la griglia entra tutta (fit su larghezza E altezza,
  // celle anche rettangolari), niente scroll. Sono i TAVOLI a crescere
  // dentro le celle — zoom 70–130% a passi del 10% — e la tipografia di
  // TableTile non scala con la griglia, così "T3" resta leggibile.
  const PAD = 20;
  const [wrapW, setWrapW] = React.useState(0);
  const [availH, setAvailH] = React.useState(540);
  const [zoom, setZoom] = React.useState(() => window.SALA_MAP_ZOOM || 100); // % dimensione tavoli
  React.useEffect(() => { window.SALA_MAP_ZOOM = zoom; }, [zoom]);
  const ZOOM_MIN = 70, ZOOM_MAX = 130, ZOOM_STEP = 10;
  const wrapRef = React.useRef(null);
  const PX = wrapW > 0 ? (wrapW - 2 * PAD) / COLS : 88; // pitch orizzontale
  const PY = Math.max(54, (availH - 2 * PAD) / ROWS);   // pitch verticale
  const CANVAS_H = ROWS * PY + 2 * PAD;
  const gx = (v) => PAD + v * PX;
  const gy = (v) => PAD + v * PY;
  // Corpo per 1 cella: al 100% riempie ESATTAMENTE il box della griglia;
  // le sedie sporgono fuori dalla cella (sopra le linee), come un disegno
  // attaccato al tavolo. Il tetto (+14px) limita l'invasione dei vicini.
  const minPitch = Math.min(PX, PY);
  const bodyUnit = Math.max(34, Math.min(minPitch + 14, minPitch * zoom / 100));
  const chairOut = ttChairMetrics(bodyUnit).out;

  // Posizioni stateful — persistenti tra render via window per sopravvivere a remount
  const [positions, setPositions] = React.useState(() => {
    if (window.SALA_POSITIONS) {
      // Backfill per posizioni salvate prima del modello orientation
      Object.values(window.SALA_POSITIONS).forEach(p => { if (!p.orientation) p.orientation = 'h'; });
      return window.SALA_POSITIONS;
    }
    const init = salaInitPositions();
    window.SALA_POSITIONS = init;
    return init;
  });
  const updatePositions = (updater) => {
    setPositions(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      window.SALA_POSITIONS = next;
      return next;
    });
  };

  // Sync da mutazioni esterne (es. dopo unione tavoli in sala-app)
  React.useEffect(() => {
    const onSync = () => {
      if (!window.SALA_POSITIONS) return;
      setPositions({ ...window.SALA_POSITIONS });
    };
    window.addEventListener('sala-positions-sync', onSync);
    return () => window.removeEventListener('sala-positions-sync', onSync);
  }, []);

  const [hovered, setHovered] = React.useState(null);
  // Grace period sull'uscita dall'hover: la barra posti/ruota sta SOPRA il
  // tavolo, col clear immediato spariva prima che il mouse potesse
  // raggiungerla. L'ingresso (tile o barra) annulla il timer di uscita.
  const hoverTimer = React.useRef(null);
  const hoverTable = React.useCallback((id) => {
    clearTimeout(hoverTimer.current);
    setHovered(id);
  }, []);
  const unhoverTable = React.useCallback(() => {
    clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => setHovered(null), 300);
  }, []);
  React.useEffect(() => () => clearTimeout(hoverTimer.current), []);
  const [drag, setDrag] = React.useState(null);
  const canvasRef = React.useRef(null);
  const justDraggedRef = React.useRef(false);
  const [mergeProposal, setMergeProposal] = React.useState(null);
  // Conferma per l'unione di due tavoli OCCUPATI (fusione dei conti):
  // { hostId, guestIds, totale } — il merge parte solo dal popup.
  const [confirmMerge, setConfirmMerge] = React.useState(null);
  // Tavolo su cui si è MOLLATO il drag (max sovrapposizione): è lui il
  // target della proposta di unione, non il vicino dove il gruppo viene
  // ricollocato dopo la risoluzione delle collisioni.
  const dropTargetRef = React.useRef(null);
  const [splitMenu, setSplitMenu] = React.useState(null);
  const justDroppedIdRef = React.useRef(null);

  React.useEffect(() => {
    const measure = () => {
      const el = wrapRef.current;
      if (!el) return;
      if (el.clientWidth > 0) setWrapW(el.clientWidth);
      // Altezza disponibile fino al fondo del frame (corretta per lo zoom CSS
      // del frame: rapporto tra px visuali e px CSS).
      const frame = el.closest('.frame');
      if (frame) {
        const fr = frame.getBoundingClientRect();
        const wr = el.getBoundingClientRect();
        const cssPerVisual = frame.clientHeight / fr.height;
        const h = (fr.bottom - wr.top) * cssPerVisual - 40;
        if (h > 0) setAvailH(Math.max(380, h));
      }
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (wrapRef.current) ro.observe(wrapRef.current);
    window.addEventListener('resize', measure);
    return () => { ro.disconnect(); window.removeEventListener('resize', measure); };
  }, []);
  // In modalità unione niente card di dettaglio: il click serve a selezionare.
  // L'anteprima hover è stata rimossa: il dettaglio si apre SOLO al click.
  const clickedTable = mergeMode ? null
    : (expandedId ? tavoli.find(t=>t.id===expandedId) : null);

  // Azioni "launcher" della card cliccata: chiudono la card prima di aprire
  // il flusso successivo (salda, unisci, sposta, sheet articoli…) — la card
  // non deve restare sotto i popup che lancia. Restano in-card solo gli
  // stepper coperti e il carrello.
  const closeAnd = (fn) => (...args) => { setExpandedId(null); fn && fn(...args); };

  // Helpers: bounding box e gruppi
  const tableRect = React.useCallback((id, customPos) => {
    const p = customPos || positions[id];
    if (!p) return null;
    const t = (tavoli.find(x => x.id === id) || (window.SALA_TAVOLI||[]).find(x => x.id === id));
    if (!t) return null;
    const d = getTableDims(p.shape, t.posti, p.orientation);
    return { x: p.x, y: p.y, w: d.w, h: d.h };
  }, [positions, tavoli]);

  // ID di tutti i compagni di gruppo (incluso self): tavoli uniti come source/target
  const groupMatesOf = React.useCallback((id) => {
    const all = window.SALA_TAVOLI || tavoli;
    const t = all.find(x => x.id === id);
    if (!t) return [id];
    if (t.mergedTables && t.mergedTables.length > 0) return [id, ...t.mergedTables];
    if (t.mergedWith) {
      const src = all.find(x => x.id === t.mergedWith);
      if (src) return [src.id, ...(src.mergedTables || [])];
    }
    return [id];
  }, [tavoli]);

  // Snap a 0.5 unità di cella
  const snap = (v) => Math.round(v * 2) / 2;
  const toGrid = (clientX, clientY) => {
    const r = canvasRef.current.getBoundingClientRect();
    const s = r.height / CANVAS_H;  // compensazione zoom CSS del frame
    return { x: ((clientX - r.left) / s - PAD) / PX, y: ((clientY - r.top) / s - PAD) / PY };
  };

  // Cerca prima posizione libera vicino a (tx, ty) per il tavolo "id" senza overlap con "occupied".
  // Stesso algoritmo di findFreeCellSpiral in sala-app.jsx ma con dims variabili e snap a 0.5:
  // espande per "anelli" Chebyshev di raggio r — il check `max(|dx|,|dy|) !== r` salta l'interno
  // del quadrato (già testato nelle iterazioni precedenti), una sola valutazione per candidata.
  const findFreeSpot = React.useCallback((id, tx, ty, occupied) => {
    const dims = tableRect(id);
    if (!dims) return { x: tx, y: ty };
    for (let r = 0; r <= 8; r += 0.5) {
      for (let dx = -r; dx <= r; dx += 0.5) {
        for (let dy = -r; dy <= r; dy += 0.5) {
          if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
          const nx = Math.max(0, Math.min(COLS - dims.w, snap(tx + dx)));
          const ny = Math.max(0, Math.min(ROWS - dims.h, snap(ty + dy)));
          const test = { x: nx, y: ny, w: dims.w, h: dims.h };
          if (!occupied.some(o => rectsOverlap(test, o))) return { x: nx, y: ny };
        }
      }
    }
    return { x: tx, y: ty };
  }, [tableRect]);

  // Dopo un cambio posti/orientamento: se il nuovo footprint collide con
  // vicini o fixture (o sfora la griglia), sposta il tavolo nella posizione
  // libera più vicina (ricerca a spirale). I vicini non si muovono.
  const resolveFootprint = (id) => {
    updatePositions(prev => {
      const next = { ...prev };
      const p = next[id];
      if (!p) return prev;
      const all = window.SALA_TAVOLI || tavoli;
      const t = all.find(x => x.id === id);
      if (!t) return prev;
      const fp = getTableDims(null, t.posti, p.orientation);
      const obstacles = [
        ...Object.keys(next).map(k => parseInt(k, 10))
          .filter(k => k !== id)
          .map(k => {
            const tk = all.find(x => x.id === k);
            const pk = next[k];
            if (!tk || !pk) return null;
            const d = getTableDims(null, tk.posti, pk.orientation);
            return { x: pk.x, y: pk.y, w: d.w, h: d.h };
          }).filter(Boolean),
        ...SALA_FIXTURES,
      ];
      for (let r = 0; r <= 14; r += 0.5) {
        for (let dx = -r; dx <= r; dx += 0.5) {
          for (let dy = -r; dy <= r; dy += 0.5) {
            if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
            const nx = Math.max(0, Math.min(COLS - fp.w, snap(p.x + dx)));
            const ny = Math.max(0, Math.min(ROWS - fp.h, snap(p.y + dy)));
            const rect = { x: nx, y: ny, w: fp.w, h: fp.h };
            if (!obstacles.some(o => rectsOverlap(rect, o))) {
              next[id] = { ...p, x: nx, y: ny };
              return next;
            }
          }
        }
      }
      return next;
    });
  };

  // Drag handlers
  const handleTableMouseDown = (e, id) => {
    e.stopPropagation();
    if (e.preventDefault) e.preventDefault();
    const p = positions[id];
    if (!p) return;
    setMergeProposal(null);
    setSplitMenu(null);
    setDrag({
      id,
      hasMoved: false,
      startX: e.clientX, startY: e.clientY,
      // Snapshot delle posizioni iniziali di tutti i mates al click — usate come baseline.
      basePositions: Object.fromEntries(Object.entries(positions).map(([k,v]) => [k, {...v}])),
      // Mouse di riferimento per il delta — sarà aggiornato all'attivazione del drag.
      refX: e.clientX, refY: e.clientY,
    });
  };

  React.useEffect(() => {
    if (!drag) return;
    const onMove = (e) => {
      if (e.cancelable) e.preventDefault();
      const dist = Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY);
      // Soglia di attivazione drag: 40px = ~mezza cella standard. Sotto questo, il movimento
      // del cursore viene ignorato e il mousedown/up resta un click puro (per non confondere
      // chi vuole espandere una card con chi vuole trascinarla).
      if (!drag.hasMoved && dist < 40) return;
      if (!drag.hasMoved) {
        // Attivazione: il punto di riferimento per il delta diventa il cursore CORRENTE,
        // e la baseline è la posizione attuale dei tavoli. Così il tavolo NON salta.
        setDrag(d => ({
          ...d, hasMoved: true,
          refX: e.clientX, refY: e.clientY,
          basePositions: Object.fromEntries(Object.entries(positions).map(([k,v]) => [k, {...v}])),
        }));
        return;
      }
      // Delta in celle dal punto di attivazione del drag (corretto per lo zoom CSS del frame).
      const sLive = canvasRef.current ? canvasRef.current.getBoundingClientRect().height / CANVAS_H : 1;
      const dx = (e.clientX - drag.refX) / (PX * sLive);
      const dy = (e.clientY - drag.refY) / (PY * sLive);
      const mates = groupMatesOf(drag.id);
      updatePositions(prev => {
        const next = {...prev};
        mates.forEach(mid => {
          const base = drag.basePositions[mid];
          if (!base) return;
          const tm = (window.SALA_TAVOLI || tavoli).find(x => x.id === mid);
          const d = getTableDims(null, tm?.posti, next[mid]?.orientation);
          next[mid] = { ...next[mid],
            x: Math.max(0, Math.min(COLS - d.w, base.x + dx)),
            y: Math.max(0, Math.min(ROWS - d.h, base.y + dy)),
          };
        });
        return next;
      });
    };
    const onUp = () => {
      if (drag.hasMoved) {
        // 1) Snap a 0.5 cella. 2) Se il gruppo rilasciato si sovrappone a tavoli esterni,
        //    sposta il gruppo intero alla posizione libera più vicina (gli altri non si muovono).
        const mates = new Set(groupMatesOf(drag.id));
        updatePositions(prev => {
          const next = {...prev};
          mates.forEach(mid => {
            if (!next[mid]) return;
            next[mid] = { ...next[mid], x: snap(next[mid].x), y: snap(next[mid].y) };
          });
          const otherIds = Object.keys(next).map(k => parseInt(k,10)).filter(id => !mates.has(id));
          const otherRects = [
            ...otherIds.map(id => tableRect(id, next[id])).filter(Boolean),
            ...SALA_FIXTURES,
          ];
          const myRects = Array.from(mates).map(id => tableRect(id, next[id])).filter(Boolean);
          if (myRects.length === 0) return next;
          // Registra il tavolo su cui si è mollato PRIMA della ricollocazione
          let bestArea = 0, bestDropId = null;
          otherIds.forEach(id => {
            const r = tableRect(id, next[id]);
            if (!r) return;
            const area = myRects.reduce((s, mr) => s + rectsIntersectArea(mr, r), 0);
            if (area > bestArea) { bestArea = area; bestDropId = id; }
          });
          dropTargetRef.current = bestDropId;
          const overlapping = myRects.some(mr => otherRects.some(o => rectsOverlap(mr, o)));
          if (!overlapping) return next;
          // Bounds del gruppo
          const minX = Math.min(...myRects.map(r => r.x));
          const minY = Math.min(...myRects.map(r => r.y));
          const maxX = Math.max(...myRects.map(r => r.x + r.w));
          const maxY = Math.max(...myRects.map(r => r.y + r.h));
          const groupW = maxX - minX;
          const groupH = maxY - minY;
          // Cerca un delta che porti il gruppo in un'area libera (ricerca a spirale).
          let bestDelta = null;
          outer:
          for (let r = 0.5; r <= 12; r += 0.5) {
            for (let dx = -r; dx <= r; dx += 0.5) {
              for (let dy = -r; dy <= r; dy += 0.5) {
                if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
                const tx = minX + dx;
                const ty = minY + dy;
                if (tx < 0 || ty < 0 || tx + groupW > COLS || ty + groupH > ROWS) continue;
                const shifted = myRects.map(rr => ({ x: rr.x + dx, y: rr.y + dy, w: rr.w, h: rr.h }));
                const clash = shifted.some(s => otherRects.some(o => rectsOverlap(s, o)));
                if (!clash) { bestDelta = { dx, dy }; break outer; }
              }
            }
          }
          if (bestDelta) {
            mates.forEach(mid => {
              if (!next[mid]) return;
              next[mid] = { ...next[mid], x: next[mid].x + bestDelta.dx, y: next[mid].y + bestDelta.dy };
            });
          }
          return next;
        });
        justDraggedRef.current = true;
        justDroppedIdRef.current = drag.id;
      }
      setDrag(null);
    };
    document.addEventListener('pointermove', onMove, { passive: false });
    document.addEventListener('pointerup', onUp);
    document.addEventListener('pointercancel', onUp);
    return () => {
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
      document.removeEventListener('pointercancel', onUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drag]);

  // Dopo ogni drop: controlla se il gruppo (o tavolo singolo) è adiacente a un altro gruppo/tavolo libero.
  React.useEffect(() => {
    const droppedId = justDroppedIdRef.current;
    if (!droppedId) return;
    justDroppedIdRef.current = null;
    const all = window.SALA_TAVOLI || tavoli;
    let source = all.find(t => t.id === droppedId);
    if (!source) return;
    // Se l'utente ha trascinato una tile secondaria, risale al primario del gruppo
    if (source.mergedWith) source = all.find(x => x.id === source.mergedWith);
    if (!source) return;
    const srcMates = new Set(groupMatesOf(source.id));
    const srcRects = Array.from(srcMates).map(id => tableRect(id)).filter(Boolean);
    if (srcRects.length === 0) return;
    // 1) Se si è mollato SOPRA un tavolo, la proposta è con QUEL tavolo.
    const dropTgt = dropTargetRef.current;
    dropTargetRef.current = null;
    if (dropTgt != null) {
      const td = all.find(x => x.id === dropTgt);
      const primary = td?.mergedWith ? all.find(x => x.id === td.mergedWith) : td;
      if (primary && !srcMates.has(primary.id)) {
        setMergeProposal({
          sourceId: source.id,
          sourceGroupIds: Array.from(srcMates),
          targetPrimaryId: primary.id,
          targetGroupIds: [primary.id, ...(primary.mergedTables || [])],
        });
        return;
      }
    }
    // 2) Fallback: il gruppo/tavolo più vicino tra quelli che si toccano
    //    (soglia 0.1) — per i drop adiacenti senza sovrapposizione.
    const checkedPrimaries = new Set();
    let bestTarget = null;
    let bestGap = Infinity;
    for (const t of all) {
      if (srcMates.has(t.id)) continue;
      const primary = t.mergedWith ? all.find(x => x.id === t.mergedWith) : t;
      if (!primary || checkedPrimaries.has(primary.id)) continue;
      checkedPrimaries.add(primary.id);
      const tGroupIds = [primary.id, ...(primary.mergedTables || [])];
      const tRects = tGroupIds.map(id => tableRect(id)).filter(Boolean);
      let minGap = Infinity;
      srcRects.forEach(sr => tRects.forEach(tr => { const g = rectsGap(sr, tr); if (g < minGap) minGap = g; }));
      if (minGap <= 0.1 && minGap < bestGap) {
        bestGap = minGap;
        bestTarget = {
          sourceId: source.id,
          sourceGroupIds: Array.from(srcMates),
          targetPrimaryId: primary.id,
          targetGroupIds: tGroupIds,
        };
      }
    }
    if (bestTarget) setMergeProposal(bestTarget);
  }, [positions]);

  // UX: Esc chiude card laterale / modalità unione.
  React.useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setExpandedId(null);
        setSplitMenu(null);
        if (mergeMode && onExitMerge) onExitMerge();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [expandedId, setExpandedId, mergeMode, onExitMerge]);

  return (
    <div style={{
      position: 'relative',
      minWidth: 0,
    }}>
      {/* Keyframes per slide-in del pannello */}
      <style>{`@keyframes salaPanelIn {
        from { opacity: 0; transform: translateX(12px); }
        to   { opacity: 1; transform: translateX(0); }
      }
      @keyframes mergeChipIn {
        from { opacity: 0; transform: translate(-50%, -50%) scale(0.78); }
        to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
      }`}</style>
      {/* Container mappa — sempre a piena larghezza, indipendente dalla card */}
      <div style={{
        background: PN.WHITE, borderRadius: 14,
        border: `1px solid ${PN.BORDER_HAIR}`,
        boxShadow: '0 1px 0 rgba(15,17,21,0.04), 0 6px 20px rgba(15,17,21,0.04)',
        padding: 12, minWidth: 0,
        position: 'relative',
      }}>
        {/* Zoom tavoli — [−] % [+] a passi del 10%, solo i tavoli, non la griglia */}
        <div style={{
          position: 'absolute', top: 22, right: 22, zIndex: 15,
          display: 'flex', alignItems: 'center', gap: 2, padding: 3, borderRadius: 10,
          backgroundColor: 'rgba(255,255,255,0.72)',
          backdropFilter: 'blur(20px) saturate(140%)',
          WebkitBackdropFilter: 'blur(20px) saturate(140%)',
          border: '1px solid rgba(255,255,255,0.8)',
          boxShadow: '0 8px 24px rgba(80,40,80,0.12)',
        }}>
          {(() => {
            const zoomBtn = (enabled) => ({
              width: 24, height: 24, borderRadius: 7,
              border: 'none', cursor: enabled ? 'pointer' : 'default',
              fontFamily: 'inherit', fontSize: 16, fontWeight: 700, lineHeight: 1,
              background: 'transparent',
              color: enabled ? '#0F1115' : '#C5C8CE',
              display: 'grid', placeItems: 'center', padding: 0,
              transition: 'color 150ms ease-out',
            });
            return (
              <React.Fragment>
                <button title="Tavoli più piccoli" disabled={zoom <= ZOOM_MIN}
                  onClick={() => setZoom(z => Math.max(ZOOM_MIN, z - ZOOM_STEP))}
                  style={zoomBtn(zoom > ZOOM_MIN)}>−</button>
                <button title="Riporta al 100%" onClick={() => setZoom(100)} style={{
                  border: 'none', background: 'transparent', cursor: 'pointer',
                  fontFamily: 'inherit', fontSize: 13.5, fontWeight: 700,
                  color: '#0F1115', minWidth: 40, textAlign: 'center',
                  fontVariantNumeric: 'tabular-nums', padding: 0,
                }}>{zoom}%</button>
                <button title="Tavoli più grandi" disabled={zoom >= ZOOM_MAX}
                  onClick={() => setZoom(z => Math.min(ZOOM_MAX, z + ZOOM_STEP))}
                  style={zoomBtn(zoom < ZOOM_MAX)}>+</button>
              </React.Fragment>
            );
          })()}
        </div>
        {/* Viewport: nessuno scroll — la griglia entra tutta */}
        <div ref={wrapRef} style={{minWidth: 0}}>
        <div
          ref={canvasRef}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              if (expandedId) setExpandedId(null);
              if (splitMenu) setSplitMenu(null);
            }
          }}
          style={{
            position: 'relative',
            width: '100%', height: CANVAS_H,
            // Floor: griglia ai confini di cella + mesh atmosferica warm —
            // è il substrato che il vetro rifrange.
            background: `
              linear-gradient(rgba(15,17,21,0.06) 1px, transparent 1px) 0 ${PAD}px/100% ${PY}px,
              linear-gradient(90deg, rgba(15,17,21,0.06) 1px, transparent 1px) ${PAD}px 0/${PX}px 100%,
              linear-gradient(180deg, #FAF6F4 0%, #F3EEEF 100%)
            `,
            borderRadius: 12,
            border: `1px solid ${PN.BORDER_HAIR}`,
            overflow: 'hidden',
            boxShadow: 'inset 0 1px 2px rgba(15, 17, 21, 0.04)',
            touchAction: 'none',
          }}>
          {/* Pareti floor */}
          <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 3, background: 'linear-gradient(90deg, transparent, rgba(255, 90, 95, 0.20), transparent)', pointerEvents:'none'}}/>
          <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: 'linear-gradient(180deg, transparent, rgba(255, 90, 95, 0.20), transparent)', pointerEvents:'none'}}/>

          {/* Fixture fissi — bancone, cucina, bagno */}
          {SALA_FIXTURES.map(f => {
            // I fixture arretrano dal lato della sala di (sporgenza sedia + 8):
            // le sedie che escono dalle celle non li toccano mai, a nessuno zoom.
            const fm = chairOut + 8;
            const isBath = f.type === 'bathroom';
            const fx = gx(f.x) + (isBath ? fm : 3);
            const fy = gy(f.y) + (isBath ? fm : 3);
            const fw = f.w * PX - (isBath ? fm + 4 : 6);
            const fh = f.h * PY - (isBath ? fm + 4 : 6 + fm);
            const base = {
              position: 'absolute', left: fx, top: fy, width: fw, height: fh,
              // z 1 ma PRIMA dei tavoli nel DOM: le sedie che sporgono dalla
              // cella restano visibili sopra i fixture adiacenti.
              zIndex: 1, pointerEvents: 'none', overflow: 'hidden',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: 8,
            };
            if (f.type === 'counter') return (
              <div key={f.id} style={{
                ...base,
                background: 'linear-gradient(180deg, #A0785A 0%, #8B6347 100%)',
                borderBottom: '3px solid #6B4C36',
              }}>
                <span style={{
                  color: 'rgba(255,255,255,0.65)', fontSize: 14.5,
                  fontWeight: 700, letterSpacing: 1.4, textTransform: 'uppercase',
                  fontFamily: 'inherit',
                }}>Bancone</span>
              </div>
            );
            if (f.type === 'kitchen') return (
              <div key={f.id} style={{
                ...base,
                background: 'linear-gradient(180deg, #1E2128 0%, #252830 100%)',
                borderBottom: '3px solid #3A3D4A',
              }}>
                <span style={{
                  color: 'rgba(255,255,255,0.5)', fontSize: 14.5,
                  fontWeight: 700, letterSpacing: 1.4, textTransform: 'uppercase',
                  fontFamily: 'inherit',
                }}>Cucina</span>
              </div>
            );
            if (f.type === 'bathroom') return (
              <div key={f.id} style={{
                ...base,
                background: '#EAECF0',
                border: '2px solid #C8CDD8',
                borderRadius: 6,
                flexDirection: 'column', gap: 4,
              }}>
                <span style={{
                  fontSize: 14, fontWeight: 700, color: '#6B7280',
                  letterSpacing: 1.2, textTransform: 'uppercase', fontFamily: 'inherit',
                }}>Bagno</span>
              </div>
            );
            return null;
          })}



          {tavoli.map(t => {
            const p = positions[t.id];
            if (!p) return null;
            // Per i tavoli "uniti come secondari" (mergedWith), mostriamo gli stessi colori/stato del source.
            const sourceForMerged = t.mergedWith
              ? (tavoli.find(x => x.id === t.mergedWith) || (window.SALA_TAVOLI||[]).find(x => x.id === t.mergedWith))
              : null;
            const tDisplay = sourceForMerged || t;
            // Footprint in celle da posti+orientation; il corpo (bodyUnit,
            // funzione dello zoom tavoli) è centrato nel suo footprint.
            const seats = t.posti || 4;
            const shape = ttSeatShape(seats);
            const orient = p.orientation || 'h';
            const dims = getTableDims(p.shape, seats, orient);
            const longPitch = orient === 'v' ? PY : PX;
            const bw = ttBodySize(seats, shape, orient, bodyUnit, longPitch);
            let left = gx(p.x) + (dims.w * PX - bw.w) / 2;
            let top  = gy(p.y) + (dims.h * PY - bw.h) / 2;
            const noteTipo = tDisplay.note?.tipo || tDisplay.note?.type;
            const isAllergia = noteTipo === 'allergia';
            const showTriangle = window.hasAlertTriangle && window.hasAlertTriangle(tDisplay);
            const alert = tDisplay.state === 'occupato' ? getOccupiedAlert(tDisplay) : null;
            const isAlerting = alert?.tone === 'warn';
            const alertTone = showTriangle ? 'alert' : (isAlerting ? 'warn' : null);

            const dim = isDimmed(t.id) || (sourceForMerged && isDimmed(sourceForMerged.id));
            const inGroup = !!(t.mergedWith || (t.mergedTables && t.mergedTables.length > 0));
            // Gruppo = UN tavolo: l'hover su un membro solleva tutte le tile insieme
            const isHovered = inGroup
              ? (hovered != null && groupMatesOf(t.id).includes(hovered))
              : hovered === t.id;
            const isDragging = drag?.id === t.id || (drag && groupMatesOf(drag.id).includes(t.id));
            // Tile selezionata = quella corrispondente al tavolo aperto nella card laterale
            // (anche i merged secondari si "illuminano" se il loro source è selezionato)
            const selectedTableId = expandedId;
            const isSelected = selectedTableId != null && (
              t.id === selectedTableId || t.mergedWith === selectedTableId ||
              (sourceForMerged && sourceForMerged.id === selectedTableId)
            );
            const isInMergeProposal = (!!mergeProposal && (mergeProposal.sourceGroupIds.includes(t.id) || mergeProposal.targetGroupIds.includes(t.id)))
              || (mergeMode && mergeSel && mergeSel.has(t.mergedWith || t.id));
            // Per i merged secondari, badge allergia e triangolo li mostriamo solo sulla tile del source
            const showOwnBadges = !t.mergedWith;

            // Tavoli uniti: niente sedie sui lati a contatto con gli altri
            // membri del gruppo (lato "saldato"), e corpo ESTESO fino al
            // bordo della cella su quei lati — così i corpi si toccano e il
            // gruppo si legge come un tavolo unico.
            const hideChairSides = [];
            const bodyExtend = { left: 0, right: 0, top: 0, bottom: 0 };
            if (inGroup) {
              const EPS = 0.3;
              const allT = window.SALA_TAVOLI || tavoli;
              groupMatesOf(t.id).forEach(mid => {
                if (mid === t.id) return;
                const pm = positions[mid];
                const tm = allT.find(x => x.id === mid);
                if (!pm || !tm) return;
                const dm = getTableDims(null, tm.posti, pm.orientation);
                const overlapY = pm.y < p.y + dims.h - EPS && p.y < pm.y + dm.h - EPS;
                const overlapX = pm.x < p.x + dims.w - EPS && p.x < pm.x + dm.w - EPS;
                if (overlapY && Math.abs(pm.x - (p.x + dims.w)) < EPS) hideChairSides.push('right');
                if (overlapY && Math.abs((pm.x + dm.w) - p.x) < EPS) hideChairSides.push('left');
                if (overlapX && Math.abs(pm.y - (p.y + dims.h)) < EPS) hideChairSides.push('bottom');
                if (overlapX && Math.abs((pm.y + dm.h) - p.y) < EPS) hideChairSides.push('top');
              });
              const gapX = (dims.w * PX - bw.w) / 2;
              const gapY = (dims.h * PY - bw.h) / 2;
              if (hideChairSides.includes('left'))   { bodyExtend.left = gapX;   left -= gapX; }
              if (hideChairSides.includes('right'))  { bodyExtend.right = gapX; }
              if (hideChairSides.includes('top'))    { bodyExtend.top = gapY;    top -= gapY; }
              if (hideChairSides.includes('bottom')) { bodyExtend.bottom = gapY; }
            }

            return (
              <TableTile key={t.id}
                numero={t.id} status={tDisplay.state}
                seats={seats} shape={shape} orientation={orient}
                badge={isAllergia && !dim && showOwnBadges ? ['ALLERGIA'] : []}
                hideChairSides={hideChairSides}
                bodyExtend={bodyExtend}
                // Il gruppo è UN tavolo: le tile non disegnano corpo, numero
                // né stato — il corpo unico (senza linee interne), il nome
                // "3-7-2" e lo stato sono renderizzati sull'insieme (overlay
                // dopo il loop). Restano per-tile solo sedie, hit area e badge.
                hideStatusLabel={inGroup}
                hideNumber={inGroup}
                hideBody={inGroup}
                unit={bodyUnit} pitch={longPitch}
                dim={dim} hovered={isHovered} selected={isSelected}
                dragging={isDragging} mergeHint={isInMergeProposal} alertTone={alertTone}
                left={left} top={top}
                onEnter={()=>hoverTable(t.id)}
                onLeave={unhoverTable}
                onPointerDown={(e) => handleTableMouseDown(e, t.id)}
                onClick={(e) => {
                  e.stopPropagation();
                  if (justDraggedRef.current) { justDraggedRef.current = false; return; }
                  // In modalità unione il click seleziona/deseleziona il gruppo
                  if (mergeMode) { onToggleMergeSel && onToggleMergeSel(t.mergedWith || t.id); return; }
                  // Click su merged secondario → apre il source
                  setExpandedId(t.mergedWith || t.id);
                }}>
                {/* Top-right (angolo corpo): alert triangolo (ritardo prenotazione, da pulire da troppo) */}
                {showTriangle && !dim && showOwnBadges && (
                  <div title="Attenzione" style={{
                    position: 'absolute', top: -7, right: -7,
                    background: '#DC2626', color: '#fff',
                    width: 18, height: 18, borderRadius: '50%',
                    border: '2px solid #fff',
                    animation: 'pulse 1.5s ease-in-out infinite',
                    display: 'grid', placeItems: 'center',
                    boxShadow: '0 1px 3px rgba(220,38,38,0.4)',
                    zIndex: 6,
                  }}>
                    <PnI.Alert size={10} color="#fff"/>
                  </div>
                )}

                {/* Bottom-left (angolo corpo): chip nota non-critica */}
                {!dim && !isAllergia && noteTipo && NOTE_TYPE_META[noteTipo] && showOwnBadges && (
                  <div title={t.note.testo || t.note.text} style={{
                    position: 'absolute', bottom: -6, left: -6,
                    background: NOTE_TYPE_META[noteTipo].bg,
                    color: NOTE_TYPE_META[noteTipo].color,
                    border: '1.5px solid #fff',
                    width: 16, height: 16, borderRadius: '50%',
                    fontSize: 13, fontWeight: 700,
                    display:'grid', placeItems:'center', zIndex: 6,
                  }}>·</div>
                )}
              </TableTile>
            );
          })}

          {/* Gruppo unito = UN tavolo, anche visivamente: corpo UNICO glass
              senza linee di giunzione, nome "3-7-2" e stato centrati. Le
              singole tile disegnano solo sedie, hit area e badge. */}
          {tavoli.filter(t => t.mergedTables && t.mergedTables.length > 0).map(src => {
            const ids = [src.id, ...src.mergedTables];
            const allT = window.SALA_TAVOLI || tavoli;
            // Corpo per membro (stessa metrica delle tile), poi unione dei rect
            const bodies = ids.map(id => {
              const p = positions[id];
              const tt = allT.find(x => x.id === id);
              if (!p || !tt) return null;
              const seats = tt.posti || 4;
              const shape = ttSeatShape(seats);
              const orient = p.orientation || 'h';
              const dims = getTableDims(p.shape, seats, orient);
              const bw = ttBodySize(seats, shape, orient, bodyUnit, orient === 'v' ? PY : PX);
              const bl = gx(p.x) + (dims.w * PX - bw.w) / 2;
              const bt = gy(p.y) + (dims.h * PY - bw.h) / 2;
              return { id, l: bl, t: bt, r: bl + bw.w, b: bt + bw.h };
            }).filter(Boolean);
            if (bodies.length === 0) return null;
            const L = Math.min(...bodies.map(b => b.l));
            const T = Math.min(...bodies.map(b => b.t));
            const R = Math.max(...bodies.map(b => b.r));
            const B = Math.max(...bodies.map(b => b.b));
            const horizontal = (R - L) >= (B - T);
            const ordered = [...bodies].sort((a, b) => horizontal ? a.l - b.l : a.t - b.t).map(x => x.id);

            const dim = isDimmed(src.id);
            const isHov = hovered != null && ids.includes(hovered);
            const isSel = expandedId != null && ids.includes(expandedId);
            const inProposal = (!!mergeProposal && (mergeProposal.sourceGroupIds.some(id => ids.includes(id)) || mergeProposal.targetGroupIds.some(id => ids.includes(id))))
              || (mergeMode && mergeSel && mergeSel.has(src.id));
            const isDrag = !!drag && groupMatesOf(drag.id).includes(src.id);
            const showTri = window.hasAlertTriangle && window.hasAlertTriangle(src);
            const gAlert = src.state === 'occupato' ? getOccupiedAlert(src) : null;
            const acc = TT_ACCENTS[src.state] || TT_ACCENTS.libero;
            const hair = inProposal ? 'rgba(255, 90, 95, 0.60)'
              : showTri ? 'rgba(220, 38, 38, 0.55)'
              : gAlert?.tone === 'warn' ? 'rgba(161, 98, 7, 0.50)'
              : acc.ring;
            const shadow = dim
              ? '0 1px 3px rgba(80, 40, 80, 0.06)'
              : isSel
                ? `inset 0 0 0 1.25px ${hair}, 0 0 0 2px rgba(255, 255, 255, 0.95), 0 0 0 4.5px rgba(255, 90, 95, 0.70), 0 18px 44px rgba(80, 40, 80, 0.20)`
                : inProposal
                  ? `inset 0 0 0 1.25px ${hair}, 0 0 0 3px rgba(255, 90, 95, 0.20), 0 12px 30px rgba(255, 90, 95, 0.16)`
                  : isDrag
                    ? `inset 0 0 0 1.25px ${hair}, 0 22px 48px rgba(80, 40, 80, 0.22)`
                    : isHov
                      ? `inset 0 0 0 1.25px ${hair}, 0 18px 44px rgba(80, 40, 80, 0.16), 0 4px 10px rgba(80, 40, 80, 0.08)`
                      : `inset 0 0 0 1.25px ${hair}, 0 12px 36px rgba(80, 40, 80, 0.10)`;
            const lifted = !isDrag && !dim && (isHov || isSel);
            const numSize = Math.round(Math.min(27, Math.max(17, bodyUnit * 0.34)));
            const labelSize = Math.min(12, Math.max(10, bodyUnit * 0.165));
            return (
              <React.Fragment key={`gbody-${src.id}`}>
                {/* Corpo unico del gruppo */}
                <div style={{
                  position: 'absolute', left: L, top: T,
                  width: R - L, height: B - T,
                  backgroundColor: dim ? 'rgba(255, 255, 255, 0.48)' : 'rgba(255, 255, 255, 0.56)',
                  backgroundImage: dim ? 'none' : [
                    'linear-gradient(180deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.08) 55%, rgba(255,255,255,0) 100%)',
                    `linear-gradient(0deg, ${acc.tint}, ${acc.tint})`,
                  ].join(', '),
                  backdropFilter: 'blur(20px) saturate(140%)',
                  WebkitBackdropFilter: 'blur(20px) saturate(140%)',
                  border: `1px solid rgba(255, 255, 255, ${dim ? 0.6 : 0.8})`,
                  borderRadius: TT_RADIUS,
                  boxShadow: shadow,
                  transform: lifted ? 'translateY(-2px) scale(1.005)' : 'none',
                  transition: isDrag ? 'none' : 'box-shadow 240ms cubic-bezier(0.22,1,0.36,1), transform 240ms cubic-bezier(0.22,1,0.36,1), opacity 180ms ease',
                  opacity: dim ? (isHov ? 0.65 : 0.40) : 1,
                  filter: dim ? 'grayscale(1)' : 'none',
                  zIndex: 0,
                  pointerEvents: 'none',
                }}/>
                {/* Nome unico + stato, centrati sul corpo */}
                <div style={{
                  position: 'absolute', left: (L + R) / 2, top: (T + B) / 2,
                  transform: 'translate(-50%, -50%)',
                  zIndex: 7, pointerEvents: 'none',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                  opacity: dim ? 0.45 : 1,
                  filter: dim ? 'grayscale(1)' : 'none',
                }}>
                  <span style={{
                    fontSize: numSize, fontWeight: 800, lineHeight: 1,
                    color: dim ? '#9CA3AF' : '#0F1115',
                    fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em',
                    whiteSpace: 'nowrap',
                  }}>{ordered.join('-')}</span>
                  {!dim && (
                    <span style={{
                      fontSize: labelSize, fontWeight: 700, lineHeight: 1,
                      letterSpacing: 0.5, textTransform: 'uppercase',
                      color: acc.ink, opacity: 0.85, whiteSpace: 'nowrap',
                    }}>{TT_LABELS[src.state] || src.state}</span>
                  )}
                </div>
              </React.Fragment>
            );
          })}

          {/* Chip di proposta unione — appare dopo un drop adiacente su un gruppo/tavolo libero */}
          {!mergeMode && mergeProposal && (() => {
            const srcRects = mergeProposal.sourceGroupIds.map(id => tableRect(id)).filter(Boolean);
            const tgtRects = mergeProposal.targetGroupIds.map(id => tableRect(id)).filter(Boolean);
            if (srcRects.length === 0 || tgtRects.length === 0) return null;

            // Stato dei due lati
            const allT = window.SALA_TAVOLI || tavoli;
            const srcPrimary = allT.find(t => t.id === mergeProposal.sourceId);
            const tgtPrimary = allT.find(t => t.id === mergeProposal.targetPrimaryId);
            const srcState = srcPrimary?.state || 'libero';
            const tgtState = tgtPrimary?.state || 'libero';

            // Blocco hard solo per doppia prenotazione. Due tavoli OCCUPATI
            // si possono unire: i conti si fondono, previa conferma esplicita
            // (popup "sei sicuro?") al click sulla spunta.
            const bothPrenotati = srcState === 'prenotato' && tgtState === 'prenotato';
            const bothOccupati  = srcState === 'occupato'  && tgtState === 'occupato';
            const isBlocked = bothPrenotati;

            // Avviso per stati misti
            let warningMsg = null;
            if (bothOccupati) {
              warningMsg = 'Entrambi i tavoli sono occupati: i conti verranno uniti';
            } else if (!isBlocked) {
              const hasOcc  = srcState === 'occupato'  || tgtState === 'occupato';
              const hasPren = srcState === 'prenotato' || tgtState === 'prenotato';
              const hasPul  = srcState === 'dapulire'  || tgtState === 'dapulire';
              if (hasOcc && hasPren) {
                const prenT = srcState === 'prenotato' ? srcPrimary : tgtPrimary;
                const res = prenT?.nextReservation;
                warningMsg = res
                  ? `Attenzione: questo tavolo è prenotato per ${res.name} alle ${res.time}`
                  : 'Uno dei tavoli è prenotato';
              } else if (hasOcc && hasPul) {
                warningMsg = 'Parte del tavolo è ancora da liberare';
              } else if (hasPren && hasPul) {
                const prenT = srcState === 'prenotato' ? srcPrimary : tgtPrimary;
                const res = prenT?.nextReservation;
                warningMsg = res
                  ? `Il tavolo è da liberare ed è prenotato per ${res.name} alle ${res.time}`
                  : 'Uno dei tavoli è prenotato ed è da liberare';
              } else if (hasPul) {
                warningMsg = 'Parte del tavolo è ancora da liberare';
              }
            }

            const avg = (rects, axis) => rects.reduce((s, r) => s + r[axis] + r[axis === 'x' ? 'w' : 'h'] / 2, 0) / rects.length;
            const cx = gx((avg(srcRects, 'x') + avg(tgtRects, 'x')) / 2);
            const cy = gy((avg(srcRects, 'y') + avg(tgtRects, 'y')) / 2);
            const srcIds = [...mergeProposal.sourceGroupIds].sort((a, b) => a - b);
            const tgtIds = [...mergeProposal.targetGroupIds].sort((a, b) => a - b);
            // Copy piatto: "Unisci tavoli 9 + 8 + 14?" — tutti i numeri in
            // un'unica sequenza, senza ripetere "Tavolo" né usare trattini.
            const mergeNums = [...srcIds, ...tgtIds].join(' + ');

            const chipBorder = isBlocked ? '#DC2626' : (warningMsg ? '#D97706' : '#FF5A5F');
            const chipShadow = isBlocked ? 'rgba(220,38,38,0.22)' : (warningMsg ? 'rgba(217,119,6,0.18)' : 'rgba(255,90,95,0.22)');

            return (
              <div style={{
                position: 'absolute',
                left: cx, top: cy,
                transform: 'translate(-50%, -50%)',
                zIndex: 25,
                background: '#fff',
                border: `2px solid ${chipBorder}`,
                borderRadius: 12,
                boxShadow: `0 6px 20px ${chipShadow}, 0 2px 6px rgba(0,0,0,0.08)`,
                padding: '7px 10px',
                display: 'flex', flexDirection: 'column', gap: 5,
                whiteSpace: 'nowrap',
                animation: 'mergeChipIn 200ms cubic-bezier(0.32,0.72,0,1)',
                pointerEvents: 'auto',
              }}>
                {/* Riga principale */}
                <div style={{display:'flex', alignItems:'center', gap: 8}}>
                  {isBlocked ? (
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
                    </svg>
                  ) : warningMsg ? (
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                      <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                  ) : (
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#FF5A5F" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                    </svg>
                  )}
                  <span style={{fontSize: 16.5, fontWeight: 700, color: isBlocked ? '#DC2626' : '#111827'}}>
                    {isBlocked
                      ? (bothPrenotati ? 'Non si possono unire due tavoli prenotati' : 'Non si possono unire due tavoli occupati')
                      : `Unisci tavoli ${mergeNums}?`}
                  </span>
                  {isBlocked ? (
                    <button
                      onClick={() => setMergeProposal(null)}
                      title="Chiudi"
                      style={{
                        width: 26, height: 26, borderRadius: 7,
                        background: '#F3F4F6', color: '#6B7280',
                        border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                        display: 'grid', placeItems: 'center', flexShrink: 0,
                      }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M6 6l12 12M18 6L6 18"/>
                      </svg>
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          const all = window.SALA_TAVOLI || tavoli;
                          const srcPrim = all.find(t => t.id === mergeProposal.sourceId);
                          const tgtPrim = all.find(t => t.id === mergeProposal.targetPrimaryId);
                          let hostTable, guestIds;
                          if (tgtPrim && tgtPrim.mergedTables && tgtPrim.mergedTables.length > 0) {
                            hostTable = tgtPrim;
                            guestIds = mergeProposal.sourceGroupIds;
                          } else {
                            hostTable = srcPrim;
                            guestIds = mergeProposal.targetGroupIds;
                          }
                          // Entrambi occupati → serve la conferma esplicita:
                          // i conti verranno fusi in un conto unico.
                          if (bothOccupati) {
                            const totale = [hostTable, ...guestIds.map(id => all.find(x => x.id === id))]
                              .filter(Boolean)
                              .reduce((s, x) => s + (x.conto || 0), 0);
                            setConfirmMerge({ hostId: hostTable.id, guestIds, totale });
                            return;
                          }
                          guestIds.forEach(id => {
                            const t = all.find(x => x.id === id);
                            if (t && t.mergedTables) delete t.mergedTables;
                          });
                          setMergeProposal(null);
                          if (hostTable && window.SALA_DO_MERGE) window.SALA_DO_MERGE(hostTable, guestIds);
                        }}
                        title="Conferma unione"
                        style={{
                          width: 26, height: 26, borderRadius: 7,
                          background: warningMsg ? '#D97706' : '#0F1115', color: '#fff',
                          border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                          display: 'grid', placeItems: 'center', flexShrink: 0,
                        }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 13L9 17L19 7"/>
                        </svg>
                      </button>
                      <button
                        onClick={() => setMergeProposal(null)}
                        title="Ignora"
                        style={{
                          width: 26, height: 26, borderRadius: 7,
                          background: '#F3F4F6', color: '#6B7280',
                          border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                          display: 'grid', placeItems: 'center', flexShrink: 0,
                        }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                          <path d="M6 6l12 12M18 6L6 18"/>
                        </svg>
                      </button>
                    </>
                  )}
                </div>
                {/* Riga avviso — solo per stati misti */}
                {warningMsg && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    fontSize: 15, fontWeight: 600, color: '#92400E',
                    background: '#FEF3C7', borderRadius: 6, padding: '3px 8px',
                  }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                      <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                    {warningMsg}
                  </div>
                )}
              </div>
            );
          })()}

          {/* Menu dividi unione — appare cliccando il badge "Unione T.X-Y" */}
          {splitMenu && (() => {
            const all = window.SALA_TAVOLI || tavoli;
            const src = all.find(t => t.id === splitMenu);
            if (!src || !src.mergedTables || src.mergedTables.length === 0) return null;
            const allIds = [src.id, ...src.mergedTables];
            const rects = allIds.map(id => {
              const p = positions[id]; if (!p) return null;
              return { x: gx(p.x), y: gy(p.y) };
            }).filter(Boolean);
            if (rects.length === 0) return null;
            const pad = 6;
            const menuLeft = Math.min(...rects.map(r => r.x)) - pad + 6;
            const menuTop  = Math.min(...rects.map(r => r.y)) - pad + 10;
            return (
              <div
                onClick={e => e.stopPropagation()}
                style={{
                  position: 'absolute', left: menuLeft, top: menuTop,
                  zIndex: 30, minWidth: 176,
                  background: '#fff',
                  border: '1.5px solid #F0F2F5', borderRadius: 12,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.13), 0 2px 6px rgba(0,0,0,0.06)',
                  overflow: 'hidden', pointerEvents: 'auto',
                  animation: 'mergeChipIn 180ms cubic-bezier(0.32,0.72,0,1)',
                }}>
                {/* Header */}
                <div style={{display:'flex', alignItems:'center', padding:'9px 10px 8px', borderBottom:'1px solid #F0F2F5'}}>
                  <span style={{flex:1, fontSize:15.5, fontWeight:700, color:'#374151', letterSpacing:0.2}}>
                    Unione Tavolo {[...allIds].sort((a,b)=>a-b).join('-')}
                  </span>
                  <button onClick={() => setSplitMenu(null)} style={{
                    width:20, height:20, borderRadius:5, background:'#F3F4F6',
                    border:'none', cursor:'pointer', display:'grid', placeItems:'center',
                    color:'#6B7280', fontFamily:'inherit', flexShrink:0,
                  }}>
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
                  </button>
                </div>
                {/* Righe tavoli */}
                <div style={{padding:'5px 8px'}}>
                  {src.mergedTables.map(id => (
                    <div key={id} style={{display:'flex', alignItems:'center', padding:'4px 2px', gap:8}}>
                      <span style={{flex:1, fontSize:17, fontWeight:600, color:'#0F1115'}}>Tavolo {id}</span>
                      <button
                        onClick={() => {
                          if (window.SALA_DO_DETACH) window.SALA_DO_DETACH(src, id);
                          if (!src.mergedTables || src.mergedTables.length === 0) setSplitMenu(null);
                        }}
                        style={{
                          padding:'3px 9px', borderRadius:6,
                          background:'#F9FAFB', border:'1px solid #E5E7EB',
                          fontSize:15.5, fontWeight:600, color:'#374151',
                          cursor:'pointer', fontFamily:'inherit', whiteSpace:'nowrap',
                        }}>Separa</button>
                    </div>
                  ))}
                </div>
                {/* Footer — dividi tutto */}
                <div style={{padding:'6px 8px 8px', borderTop:'1px solid #F0F2F5'}}>
                  <button
                    onClick={() => { if (window.SALA_DO_SPLIT_ALL) window.SALA_DO_SPLIT_ALL(src); setSplitMenu(null); }}
                    style={{
                      width:'100%', padding:'7px 0',
                      background:'#FFF5F5', color:'#DC2626',
                      border:'1px solid #FECACA', borderRadius:7,
                      fontSize:16, fontWeight:700, cursor:'pointer', fontFamily:'inherit',
                    }}>Dividi tutto</button>
                </div>
              </div>
            );
          })()}

          {/* Barra modalità "Unisci tavoli" — selezione multipla + conferma */}
          {mergeMode && (() => {
            const all = window.SALA_TAVOLI || tavoli;
            const prims = [...(mergeSel || [])].map(id => all.find(t => t.id === id)).filter(Boolean);
            const nOcc = prims.filter(t => t.state === 'occupato').length;
            const nPren = prims.filter(t => t.state === 'prenotato').length;
            // Blocco hard solo per doppia prenotazione (come nel drag-merge):
            // più tavoli occupati si possono unire, previa conferma esplicita.
            const blockMsg = nPren > 1 ? 'Non si possono unire due tavoli prenotati' : null;
            const warnMsg = nOcc > 1 ? 'I conti dei tavoli occupati verranno uniti' : null;
            const canConfirm = prims.length >= 2 && !blockMsg;

            const doMerge = () => {
              if (!canConfirm) return;
              let host = prims.find(t => t.mergedTables && t.mergedTables.length > 0) || prims[0];
              const guests = prims.filter(t => t.id !== host.id);
              const guestIds = guests.flatMap(t => [t.id, ...(t.mergedTables || [])]);
              // 2+ occupati → popup "sei sicuro?": i conti verranno fusi.
              if (nOcc > 1) {
                const totale = prims.reduce((s, x) => s + (x.conto || 0), 0);
                setConfirmMerge({ hostId: host.id, guestIds, totale, nOcc, exitMerge: true });
                return;
              }
              guests.forEach(t => { if (t.mergedTables) delete t.mergedTables; });
              // Il posizionamento fisico lo fa SALA_DO_MERGE: fila retta ancorata
              // all'host + sync delle posizioni. Niente riposizionamento a spirale
              // qui, ammucchierebbe i tavoli attorno all'host invece di allungarli.
              if (window.SALA_DO_MERGE) window.SALA_DO_MERGE(host, guestIds);
              onExitMerge && onExitMerge();
            };

            return (
              <div
                onClick={e => e.stopPropagation()}
                onPointerDown={e => e.stopPropagation()}
                style={{
                  position: 'absolute', left: '50%', top: 10,
                  transform: 'translateX(-50%)',
                  zIndex: 27,
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '7px 8px 7px 14px', borderRadius: 13,
                  backgroundColor: 'rgba(255,255,255,0.78)',
                  backgroundImage: 'linear-gradient(180deg, rgba(255,255,255,0.55), rgba(255,255,255,0) 70%)',
                  backdropFilter: 'blur(20px) saturate(140%)',
                  WebkitBackdropFilter: 'blur(20px) saturate(140%)',
                  border: '1px solid rgba(255,255,255,0.8)',
                  boxShadow: '0 12px 36px rgba(80,40,80,0.16), 0 2px 8px rgba(80,40,80,0.08)',
                  animation: 'mergeChipIn 200ms cubic-bezier(0.32,0.72,0,1)',
                  whiteSpace: 'nowrap',
                }}>
                <span style={{fontSize: 14.5, fontWeight: 700, color: blockMsg ? '#DC2626' : warnMsg ? '#D97706' : '#0F1115'}}>
                  {blockMsg || warnMsg || (prims.length === 0
                    ? 'Tocca i tavoli da unire'
                    : `${prims.length} tavol${prims.length === 1 ? 'o' : 'i'} selezionat${prims.length === 1 ? 'o' : 'i'}`)}
                </span>
                <button onClick={doMerge} disabled={!canConfirm} style={{
                  height: 28, padding: '0 12px', borderRadius: 8,
                  background: canConfirm ? '#0F1115' : 'rgba(15,17,21,0.08)',
                  color: canConfirm ? '#fff' : '#9CA3AF',
                  border: 'none', cursor: canConfirm ? 'pointer' : 'default',
                  fontSize: 14, fontWeight: 700, fontFamily: 'inherit',
                  transition: 'background 150ms, color 150ms',
                }}>Unisci</button>
                <button onClick={() => onExitMerge && onExitMerge()} style={{
                  height: 28, padding: '0 10px', borderRadius: 8,
                  background: 'transparent', color: '#6B7280',
                  border: '1px solid rgba(15,17,21,0.10)',
                  cursor: 'pointer', fontSize: 14, fontWeight: 600, fontFamily: 'inherit',
                }}>Annulla</button>
              </div>
            );
          })()}

          {/* Barra "Ruota" — segue l'HOVER (il click apre il popup di dettaglio).
              Solo rotazione: singoli rettangolari girano il proprio footprint,
              i gruppi girano l'intera fila di 90°. Il modificatore posti vive
              nella card/modale, non più sulla mappa. */}
          {!mergeMode && hovered != null && positions[hovered] && (() => {
            const all = window.SALA_TAVOLI || tavoli;
            const t = all.find(x => x.id === hovered);
            const p = positions[hovered];
            if (!t || !p) return null;
            const isGroup = !!(t.mergedWith || (t.mergedTables && t.mergedTables.length > 0));
            const seats = t.posti || 4;
            const isRect = ttSeatShape(seats) === 'rect';
            // Solo "Ruota": per i singoli ha senso solo sui rettangolari
            if (!isGroup && !isRect) return null;
            // Ancoraggio: il gruppo È un tavolo — la barra sta sempre al
            // centro del suo bounding box, ovunque sia l'hover. I singoli
            // restano ancorati al proprio corpo.
            const anchorIds = isGroup ? groupMatesOf(t.id) : [t.id];
            const aRects = anchorIds.map(id => tableRect(id)).filter(Boolean);
            if (aRects.length === 0) return null;
            const aMinX = gx(Math.min(...aRects.map(r => r.x)));
            const aMaxX = gx(Math.max(...aRects.map(r => r.x + r.w)));
            const aMinY = gy(Math.min(...aRects.map(r => r.y)));
            const aMaxY = gy(Math.max(...aRects.map(r => r.y + r.h)));
            const cx = (aMinX + aMaxX) / 2;
            const aboveTop = aMinY - chairOut - 44;
            const barTop = aboveTop >= 2 ? aboveTop : aMaxY + chairOut + 8;
            const doRotate = () => {
              updatePositions(prev => ({
                ...prev,
                [t.id]: { ...prev[t.id], orientation: prev[t.id].orientation === 'v' ? 'h' : 'v' },
              }));
              resolveFootprint(t.id);
            };
            // Rotazione dell'intero gruppo unito: 90° orari attorno al suo
            // bounding box (una fila orizzontale diventa verticale e viceversa),
            // poi clamp nella griglia e — se il gruppo finisce sopra tavoli
            // estranei — shift rigido del gruppo alla posizione libera più vicina.
            const doRotateGroup = () => {
              const ids = groupMatesOf(t.id);
              updatePositions(prev => {
                const next = { ...prev };
                const rectOf = (id, pp) => {
                  const tt = all.find(x => x.id === id);
                  const d = getTableDims(null, tt?.posti, pp.orientation);
                  return { x: pp.x, y: pp.y, w: d.w, h: d.h };
                };
                const rects = ids.filter(id => next[id]).map(id => ({ id, ...rectOf(id, next[id]) }));
                if (rects.length < 2) return prev;
                const minX = Math.min(...rects.map(r => r.x));
                const minY = Math.min(...rects.map(r => r.y));
                const groupH = Math.max(...rects.map(r => r.y + r.h)) - minY;
                rects.forEach(r => {
                  // (relX, relY, w, h) → 90° CW → (H − relY − h, relX) con footprint girato
                  const newOrient = next[r.id].orientation === 'v' ? 'h' : 'v';
                  next[r.id] = {
                    ...next[r.id],
                    orientation: newOrient,
                    x: minX + groupH - (r.y - minY) - r.h,
                    y: minY + (r.x - minX),
                  };
                });
                // Bounding box post-rotazione + ostacoli esterni al gruppo
                const newRects = ids.filter(id => next[id]).map(id => rectOf(id, next[id]));
                const obstacles = [
                  ...Object.keys(next).map(k => parseInt(k, 10))
                    .filter(k => !ids.includes(k))
                    .map(k => next[k] && rectOf(k, next[k])).filter(Boolean),
                  ...SALA_FIXTURES,
                ];
                // Cerca lo shift (dx,dy) minimo che porta il gruppo in griglia e senza overlap
                const bMinX = Math.min(...newRects.map(r => r.x));
                const bMinY = Math.min(...newRects.map(r => r.y));
                const bMaxX = Math.max(...newRects.map(r => r.x + r.w));
                const bMaxY = Math.max(...newRects.map(r => r.y + r.h));
                for (let r = 0; r <= 10; r += 0.5) {
                  for (let dx = -r; dx <= r; dx += 0.5) {
                    for (let dy = -r; dy <= r; dy += 0.5) {
                      if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
                      if (bMinX + dx < 0 || bMaxX + dx > COLS || bMinY + dy < 0 || bMaxY + dy > ROWS) continue;
                      const ok = newRects.every(nr => !obstacles.some(o =>
                        rectsOverlap({ x: nr.x + dx, y: nr.y + dy, w: nr.w, h: nr.h }, o)));
                      if (ok) {
                        if (dx || dy) ids.forEach(id => {
                          if (next[id]) next[id] = { ...next[id], x: snap(next[id].x + dx), y: snap(next[id].y + dy) };
                        });
                        return next;
                      }
                    }
                  }
                }
                return next; // nessuno spot: lascia la rotazione com'è
              });
            };
            const btnStyle = (enabled) => ({
              width: 26, height: 26, borderRadius: 8,
              background: enabled ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.40)',
              border: '1px solid rgba(15,17,21,0.08)',
              color: enabled ? '#0F1115' : '#C5C8CE',
              cursor: enabled ? 'pointer' : 'default',
              display: 'grid', placeItems: 'center',
              fontFamily: 'inherit', fontSize: 17, fontWeight: 700, lineHeight: 1,
              padding: 0, transition: 'background 150ms ease-out',
            });

            return (
              <div
                onClick={e => e.stopPropagation()}
                onPointerDown={e => e.stopPropagation()}
                // La barra tiene vivo l'hover: senza, spostando il mouse dal
                // tavolo alla barra questa spariva prima di essere raggiunta.
                onMouseEnter={() => hoverTable(t.id)}
                onMouseLeave={unhoverTable}
                style={{
                  position: 'absolute', left: cx, top: barTop,
                  transform: 'translateX(-50%)',
                  zIndex: 26,
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '5px 7px', borderRadius: 13,
                  backgroundColor: 'rgba(255,255,255,0.72)',
                  backgroundImage: 'linear-gradient(180deg, rgba(255,255,255,0.55), rgba(255,255,255,0) 70%)',
                  backdropFilter: 'blur(20px) saturate(140%)',
                  WebkitBackdropFilter: 'blur(20px) saturate(140%)',
                  border: '1px solid rgba(255,255,255,0.8)',
                  boxShadow: '0 12px 36px rgba(80,40,80,0.14), 0 2px 8px rgba(80,40,80,0.08)',
                  animation: 'mergeChipIn 200ms cubic-bezier(0.32,0.72,0,1)',
                }}>
                <button
                  title={isGroup ? 'Ruota il gruppo di 90°' : 'Ruota 90°'}
                  onClick={isGroup ? doRotateGroup : doRotate}
                  style={{
                    ...btnStyle(true), width: 'auto', padding: '0 10px', height: 26,
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    fontSize: 13.5, fontWeight: 700,
                  }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 3v5h-5"/>
                  </svg>
                  Ruota
                </button>
              </div>
            );
          })()}
        </div>{/* /canvas */}
        </div>{/* /viewport */}
      </div>

      {/* Conferma fusione conti — due tavoli occupati che si uniscono */}
      {confirmMerge && (
        <React.Fragment>
          <div onClick={() => setConfirmMerge(null)} style={{
            position: 'fixed', inset: 0, background: 'rgba(15,17,21,0.42)', zIndex: 80,
          }}/>
          <div style={{
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
            width: 420, maxWidth: '92vw', background: '#fff', borderRadius: 16,
            boxShadow: '0 24px 70px rgba(0,0,0,0.28)', zIndex: 81, overflow: 'hidden', fontFamily: 'inherit',
          }}>
            <div style={{padding: '22px 22px 16px', display: 'flex', alignItems: 'flex-start', gap: 14}}>
              <span style={{
                width: 42, height: 42, borderRadius: '50%', background: '#FEF3C7', color: '#D97706',
                display: 'grid', placeItems: 'center', flexShrink: 0,
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              </span>
              <div>
                <div style={{fontSize: 17, fontWeight: 800, color: '#0F1115'}}>
                  {(confirmMerge.nOcc || 2) > 2 ? `Unire ${confirmMerge.nOcc} tavoli occupati?` : 'Unire due tavoli occupati?'}
                </div>
                <div style={{fontSize: 14.5, color: '#6B7280', marginTop: 4, lineHeight: 1.5}}>
                  I conti dei tavoli verranno uniti in un unico conto
                  {confirmMerge.totale > 0 && <> da <strong style={{color: '#0F1115'}}>€{confirmMerge.totale.toFixed(2)}</strong></>}.
                  {' '}Sei sicuro di quello che stai facendo?
                </div>
              </div>
            </div>
            <div style={{display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '14px 22px',
              background: '#F8F9FB', borderTop: '1px solid rgba(15,17,21,0.06)'}}>
              <button onClick={() => setConfirmMerge(null)} style={{
                padding: '9px 16px', background: '#fff', color: '#0F1115',
                border: '1px solid rgba(15,17,21,0.12)', borderRadius: 9,
                fontSize: 14.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
              }}>Annulla</button>
              <button onClick={() => {
                const all = window.SALA_TAVOLI || tavoli;
                const hostTable = all.find(x => x.id === confirmMerge.hostId);
                confirmMerge.guestIds.forEach(id => {
                  const g = all.find(x => x.id === id);
                  if (g && g.mergedTables) delete g.mergedTables;
                });
                setConfirmMerge(null);
                setMergeProposal(null);
                if (hostTable && window.SALA_DO_MERGE) window.SALA_DO_MERGE(hostTable, confirmMerge.guestIds);
                if (confirmMerge.exitMerge && onExitMerge) onExitMerge();
              }} style={{
                padding: '9px 16px', background: '#D97706', color: '#fff',
                border: 'none', borderRadius: 9,
                fontSize: 14.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
              }}>Unisci i conti</button>
            </div>
          </div>
        </React.Fragment>
      )}


      {/* Dettaglio al click — popup grande centrato con sfondo sfocato.
          Portal sul frame: copre tutta l'app, scala coerente con lo zoom. */}
      {clickedTable && ReactDOM.createPortal(
        <div
          onClick={() => setExpandedId(null)}
          style={{
            position:'absolute', inset: 0,
            background:'rgba(15,17,21,0.42)',
            backdropFilter:'blur(8px)', WebkitBackdropFilter:'blur(8px)',
            display:'grid', placeItems:'center',
            zIndex: 200, padding: 28,
          }}>
          <style>{`@keyframes salaDetailIn {
            from { opacity: 0; transform: scale(0.95) translateY(10px); }
            to   { opacity: 1; transform: none; }
          }`}</style>
          <div
            onClick={e => e.stopPropagation()}
            className="pn-scroll"
            style={{
              position:'relative',
              width: 480, maxWidth:'94%', maxHeight:'90%',
              overflowY:'auto',
              borderRadius: 16,
              background:'#fff',
              boxShadow: '0 32px 80px rgba(15,17,21,0.30), 0 4px 12px rgba(15,17,21,0.12)',
              animation: 'salaDetailIn 220ms cubic-bezier(0.32,0.72,0,1)',
            }}>
            <SalaCard t={clickedTable}
              expanded={true}
              onClose={() => setExpandedId(null)}
              onToggle={()=>{}}
              onAdd={closeAnd(()=>onOpenAdd(clickedTable))}
              onPay={closeAnd(()=>onOpenPay(clickedTable))}
              onAddArticle={closeAnd(onAddArticle)} cart={cart} onCartChange={onCartChange} onConfirmCart={onConfirmCart}
              onAdjustCoperti={(n) => onAdjustCoperti && onAdjustCoperti(clickedTable.id, n)}
              onAdjustReservationPosti={(n) => onAdjustReservationPosti && onAdjustReservationPosti(clickedTable.id, n)}
              onLibera={closeAnd(onLibera)} onMove={closeAnd(onMove)} onEdit={closeAnd(onEdit)}
              onAssignOther={closeAnd(onAssignOther)} onNoShow={closeAnd(onNoShow)}
              onUnisci={closeAnd(onUnisci)} onModificaCoperti={closeAnd(onModificaCoperti)}/>
          </div>
        </div>,
        document.querySelector('.frame') || document.body
      )}
    </div>
  );
}

function SvIcon({ path, size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={path}/>
    </svg>
  );
}

function SearchExpandable({ value, onChange, placeholder, expandedWidth = 240 }) {
  const [expanded, setExpanded] = React.useState(false);
  const inputRef = React.useRef(null);

  React.useEffect(() => {
    if (expanded) {
      inputRef.current?.focus();
    }
  }, [expanded]);

  const handleBlur = () => {
    if (!value) setExpanded(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onChange('');
      setExpanded(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div style={{
      width: expandedWidth,
      display: 'flex', alignItems: 'center', justifyContent: 'flex-start',
    }}>
      <div style={{
        position: 'relative',
        height: 38,
        width: expanded ? '100%' : 38,
        background: PN.WHITE,
        border: `1px solid ${PN.BORDER_LIGHT}`,
        borderRadius: 10,
        boxShadow: '0 1px 2px rgba(15,17,21,0.04)',
        transition: 'width 200ms ease',
        overflow: 'hidden',
      }}>
        <button
          type="button"
          onClick={() => setExpanded(true)}
          tabIndex={expanded ? -1 : 0}
          aria-label="Cerca"
          style={{
            position: 'absolute', left: 0, top: 0,
            width: 38, height: 38,
            background: 'transparent', border: 'none',
            cursor: expanded ? 'default' : 'pointer',
            display: 'grid', placeItems: 'center',
            color: PN.MUTED, fontFamily: 'inherit',
            pointerEvents: expanded ? 'none' : 'auto',
          }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
            <circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.6" y2="16.6"/>
          </svg>
        </button>
        <input
          ref={inputRef}
          value={value || ''}
          onChange={e => onChange?.(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          style={{
            width: '100%', height: '100%',
            padding: '0 14px 0 38px',
            border: 'none',
            background: 'transparent',
            fontSize: 17.5, color: PN.TEXT,
            outline: 'none', fontFamily: 'inherit',
            opacity: expanded ? 1 : 0,
            transition: 'opacity 200ms ease',
            pointerEvents: expanded ? 'auto' : 'none',
          }}
        />
      </div>
    </div>
  );
}

window.SearchExpandable = SearchExpandable;
window.SalaTavoli = SalaTavoli;
