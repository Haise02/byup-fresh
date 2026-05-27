// Sala v3 — Tab Tavoli (no timeline, card compatte, mappa+lista)

function SalaV3Tavoli({ tweaks, onOpenAdd, onOpenPay, onAddArticle, cart, onCartChange, onConfirmCart, focus, onToggleFocus, onAdjustCoperti, onAdjustReservationPosti, contiCollapsed, onLibera, onMove, onEdit, onAssignOther, onNoShow, onUnisci, onModificaCoperti }) {
  const [search, setSearch] = React.useState('');
  const [room, setRoom] = React.useState('Sala principale');
  // Filtri multi-select: Set di chiavi KPI. Tutte attive default; vuoto = mostra tutti.
  const [filters, setFilters] = React.useState(() => new Set(['Liberi', 'Prenotati', 'Occupati', 'Da pulire']));
  // Filtro alert: quando attivo, mostra solo le card con triangolo rosso (>20' di ritardo o da pulire)
  const [alertOnly, setAlertOnly] = React.useState(false);
  const [view, setView] = React.useState(tweaks.defaultView || 'mappa');
  const [expandedId, setExpandedId] = React.useState(null);

  // Esclude i tavoli "uniti" (mergedWith): non sono entità autonome, fanno parte del source.
  const tavoliBase = (window.SALA_V3_TAVOLI || SALA_V3_TAVOLI).filter(t => !t.mergedWith);
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

  // Match function: stato (multi-select) + ricerca + alert filter
  const matchTavolo = (t) => {
    if (alertOnly && !(window.hasAlertTriangle && window.hasAlertTriangle(t))) return false;
    const matchState = alertOnly || activeStates.size === 0 || activeStates.has(t.state);
    if (!search.trim()) return matchState;
    const q = search.toLowerCase();
    const inId = String(t.id).includes(q);
    const inParty = (t.party || '').toLowerCase().includes(q);
    const inNext = (t.nextReservation?.name || '').toLowerCase().includes(q);
    return matchState && (inId || inParty || inNext);
  };

  // Senza useMemo: legge window.SALA_V3_TAVOLI fresco ad ogni render (la memo era stale su cambio stato).
  const alertCount = (() => {
    if (!window.hasAlertTriangle) return 0;
    const all = window.SALA_V3_TAVOLI || SALA_V3_TAVOLI;
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
  const isFiltering = activeStates.size > 0 || search.trim();
  const dimmedIds = isFiltering
    ? new Set(tavoliBase.filter(t => !matchTavolo(t)).map(t => t.id))
    : new Set();

  // KPI cards = filtri multi-select della pagina. Click su una card aggiunge/toglie
  // il suo stato dal filtro attivo; più card insieme = unione (OR) degli stati.
  const kpiCards = [
    {key: 'Occupati',  label: 'Occupati',  value: counts.Occupati,     accent: '#172554', soft: '#DBEAFE', icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75'},
    {key: 'Prenotati', label: 'Prenotati', value: counts.Prenotati,    accent: '#7C3AED', soft: '#EDE9FE', icon: 'M3 4h18v18H3z M3 10h18 M8 2v4 M16 2v4'},
    {key: 'Da pulire', label: 'Da pulire', value: counts['Da pulire'], accent: '#D97706', soft: '#FFFBEB', icon: 'M3 6h18 M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6 M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2'},
    {key: 'Liberi',    label: 'Liberi',    value: counts.Liberi,       accent: '#6B7280', soft: '#F3F4F6', icon: 'M5 13l4 4L19 7'},
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
    const next = new Set(prev);
    if (next.has(key)) next.delete(key); else next.add(key);
    if (next.size === 0) return new Set(['Occupati', 'Prenotati', 'Liberi', 'Da pulire']);
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
                border: 'none', fontSize: 12.5, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit',
                transition: 'color 200ms ease-out',
              }}>{v.label}</button>
            ))}
          </div>

          {/* Divider */}
          <div style={{width: 1, height: 20, background: PN.BORDER_HAIR, flexShrink: 0, margin: '0 2px'}}/>

          <SearchExpandable value={search} onChange={setSearch} placeholder="Cerca tavolo o cliente" expandedWidth={220}/>

          <span style={{flex: 1}}/>

          <SaSelect value={room} onChange={setRoom} options={['Sala principale','Sala terrazza','Privé']}/>

          {/* Fullscreen — affiancato al select sala, estrema destra */}
          {onToggleFocus && (
            <button onClick={onToggleFocus} title={focus ? 'Esci schermo intero' : 'Schermo intero'} style={{
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
              <SvIconV3 path={focus
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
                  background: isActive ? kpi.soft : '#F9FAFB',
                  border: `1.5px solid ${isActive ? kpi.accent + '55' : '#E5E7EB'}`,
                  cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0,
                  transition: 'background 150ms ease-out, border-color 150ms ease-out, box-shadow 150ms ease-out',
                  boxShadow: isActive ? `0 1px 4px ${kpi.accent}18` : 'none',
                }}
                onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = '#F3F4F6'; e.currentTarget.style.borderColor = '#D1D5DB'; }}}
                onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = '#F9FAFB'; e.currentTarget.style.borderColor = '#E5E7EB'; }}}
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
                  fontSize: 15, fontWeight: 700, lineHeight: 1,
                  color: isActive ? kpi.accent : '#374151',
                  fontVariantNumeric: 'tabular-nums',
                  letterSpacing: '-0.01em',
                  transition: 'color 150ms ease-out',
                }}>{kpi.value}</span>
                {/* Label */}
                <span style={{
                  fontSize: 12, fontWeight: 500, lineHeight: 1,
                  color: isActive ? kpi.accent : '#9CA3AF',
                  transition: 'color 150ms ease-out',
                }}>{kpi.label}</span>
              </button>
            );
          })}

          {/* Triangolo filtro alert — sempre visibile; disabilitato se nessun alert attivo */}
          <button
            onClick={() => alertCount > 0 && setAlertOnly(v => !v)}
            title={alertCount === 0 ? 'Nessun alert' : (alertOnly ? 'Mostra tutti' : `Mostra solo gli alert (${alertCount})`)}
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
              fontSize: 12.5, fontWeight: 800,
              color: alertCount === 0 ? '#9CA3AF' : '#DC2626',
              fontVariantNumeric:'tabular-nums', lineHeight: 1,
            }}>{alertCount}</span>
          </button>

          {/* Reset parziale — appare solo quando filtro parziale attivo */}
          {filters.size > 0 && filters.size < kpiCards.length && (
            <button
              onClick={() => setFilters(new Set(['Liberi','Prenotati','Occupati','Da pulire']))}
              style={{
                padding: '4px 8px', borderRadius: 6, height: 28,
                background: 'transparent', color: PN.MUTED,
                border: `1px dashed #D1D5DB`,
                fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                display: 'inline-flex', alignItems: 'center', gap: 4,
                flexShrink: 0, transition: 'color 150ms, border-color 150ms',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = PN.TEXT; e.currentTarget.style.borderColor = '#9CA3AF'; }}
              onMouseLeave={e => { e.currentTarget.style.color = PN.MUTED; e.currentTarget.style.borderColor = '#D1D5DB'; }}
            >
              <PnI.X size={9} color="currentColor"/> Tutti
            </button>
          )}

          <span style={{flex: 1}}/>

          {/* Riempimento inline — metrica contestuale, non filtro */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0,
            padding: '4px 10px', borderRadius: 8,
            background: '#F9FAFB', border: `1px solid ${PN.BORDER_HAIR}`,
          }}>
            <span style={{
              fontSize: 12.5, fontWeight: 700, color: PN.TEXT,
              fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.01em',
            }}>{occPct}%</span>
            <span style={{fontSize: 11, color: PN.MUTED}}>
              Riempimento tavoli
            </span>
          </div>
        </div>

      </div>{/* /toolbar */}

      {/* Vista */}
      {view === 'mappa'
        ? <SalaV3FloorPlan tavoli={SALA_V3_TAVOLI} dimmedIds={dimmedIds} onOpenAdd={onOpenAdd} onOpenPay={onOpenPay}
            onAddArticle={onAddArticle} cart={cart} onCartChange={onCartChange} onConfirmCart={onConfirmCart}
            expandedId={expandedId} setExpandedId={setExpandedId} onAdjustCoperti={onAdjustCoperti}
            onAdjustReservationPosti={onAdjustReservationPosti}
            onLibera={onLibera} onMove={onMove} onEdit={onEdit} onAssignOther={onAssignOther} onNoShow={onNoShow}
            onUnisci={onUnisci} onModificaCoperti={onModificaCoperti}/>
        : <SalaV3ListView tavoli={visibili} onOpenAdd={onOpenAdd} onOpenPay={onOpenPay}
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
function SalaV3ListView({ tavoli, onOpenAdd, onOpenPay, onAddArticle, cart, onCartChange, onConfirmCart, expandedId, setExpandedId, onAdjustCoperti, onAdjustReservationPosti, contiCollapsed, onLibera, onMove, onEdit, onAssignOther, onNoShow, onUnisci, onModificaCoperti }) {
  const sorted = tavoli; // ordinamento già applicato dal parent (stato → numero)

  // Griglia responsiva: pannello aperto (contiCollapsed=false) → 3 col, chiuso → 4 col
  const cols = contiCollapsed ? 4 : 3;
  return (
    <div style={{display:'grid', gridTemplateColumns:`repeat(${cols}, 1fr)`, gap: 10, alignItems:'start'}}>
      {sorted.map(t => (
        <SalaV3Card key={t.id} t={t}
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
          color:'#6B7280', fontSize: 14,
          background:'#fff', borderRadius: 12,
          border:'1px dashed #E5E7EB',
        }}>Nessun tavolo trovato.</div>
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
const SALA_V3_FIXTURES = [
  { id: 'bancone', type: 'counter',  x: 0,  y: 0, w: 5, h: 1 },
  { id: 'cucina',  type: 'kitchen',  x: 5,  y: 0, w: 7, h: 1 },
  { id: 'bagno',   type: 'bathroom', x: 10, y: 6, w: 2, h: 2 },
];

const SALA_V3_INITIAL_POSITIONS = {
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

// Dimensione tavolo (in unità di cella): tutti uguali, sempre quadrati.
// `shape` e `posti` sono ignorati per il sizing.
const TABLE_TILE_SCALE = 1.0;
function getTableDims() {
  return { w: TABLE_TILE_SCALE, h: TABLE_TILE_SCALE };
}

function rectsOverlap(a, b) {
  return !(a.x + a.w <= b.x || b.x + b.w <= a.x || a.y + a.h <= b.y || b.y + b.h <= a.y);
}

function rectsGap(a, b) {
  const gx = Math.max(0, Math.max(a.x, b.x) - Math.min(a.x + a.w, b.x + b.w));
  const gy = Math.max(0, Math.max(a.y, b.y) - Math.min(a.y + a.h, b.y + b.h));
  return Math.sqrt(gx * gx + gy * gy);
}

function SalaV3FloorPlan({ tavoli, dimmedIds, onOpenAdd, onOpenPay, onAddArticle, cart, onCartChange, onConfirmCart, expandedId, setExpandedId, onAdjustCoperti, onAdjustReservationPosti, onLibera, onMove, onEdit, onAssignOther, onNoShow, onUnisci, onModificaCoperti }) {
  const isDimmed = (id) => dimmedIds && dimmedIds.has(id);
  const BASE_CELL = 60;
  const COLS = 12, ROWS = 8;
  const [canvasWidth, setCanvasWidth] = React.useState(COLS * BASE_CELL);
  const CELL = canvasWidth / COLS;

  // Posizioni stateful — persistenti tra render via window per sopravvivere a remount
  const [positions, setPositions] = React.useState(() => {
    if (window.SALA_V3_POSITIONS) return window.SALA_V3_POSITIONS;
    const init = {};
    Object.entries(SALA_V3_INITIAL_POSITIONS).forEach(([id, p]) => { init[id] = { x: p.x, y: p.y, shape: p.shape }; });
    window.SALA_V3_POSITIONS = init;
    return init;
  });
  const updatePositions = (updater) => {
    setPositions(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      window.SALA_V3_POSITIONS = next;
      return next;
    });
  };

  // Sync da mutazioni esterne (es. dopo unione tavoli in sala-v3-app)
  React.useEffect(() => {
    const onSync = () => {
      if (!window.SALA_V3_POSITIONS) return;
      setPositions({ ...window.SALA_V3_POSITIONS });
    };
    window.addEventListener('sala-v3-positions-sync', onSync);
    return () => window.removeEventListener('sala-v3-positions-sync', onSync);
  }, []);

  const [hovered, setHovered] = React.useState(null);
  const [drag, setDrag] = React.useState(null);
  const canvasRef = React.useRef(null);
  const justDraggedRef = React.useRef(false);
  const [mergeProposal, setMergeProposal] = React.useState(null);
  const [splitMenu, setSplitMenu] = React.useState(null);
  const justDroppedIdRef = React.useRef(null);

  React.useEffect(() => {
    if (!canvasRef.current) return;
    const ro = new ResizeObserver(entries => {
      const w = entries[0]?.contentRect.width;
      if (w && w > 0) setCanvasWidth(w);
    });
    ro.observe(canvasRef.current);
    return () => ro.disconnect();
  }, []);
  const detailedTable = expandedId ? tavoli.find(t=>t.id===expandedId) : (hovered ? tavoli.find(t=>t.id===hovered) : null);

  // Helpers: bounding box e gruppi
  const tableRect = React.useCallback((id, customPos) => {
    const p = customPos || positions[id];
    if (!p) return null;
    const t = (tavoli.find(x => x.id === id) || (window.SALA_V3_TAVOLI||[]).find(x => x.id === id));
    if (!t) return null;
    const d = getTableDims(p.shape, t.posti);
    return { x: p.x, y: p.y, w: d.w, h: d.h };
  }, [positions, tavoli]);

  // ID di tutti i compagni di gruppo (incluso self): tavoli uniti come source/target
  const groupMatesOf = React.useCallback((id) => {
    const all = window.SALA_V3_TAVOLI || tavoli;
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
    return { x: (clientX - r.left) / CELL, y: (clientY - r.top) / CELL };
  };

  // Cerca prima posizione libera vicino a (tx, ty) per il tavolo "id" senza overlap con "occupied"
  const findFreeSpot = React.useCallback((id, tx, ty, occupied) => {
    const dims = tableRect(id);
    if (!dims) return { x: tx, y: ty };
    // Spirale a passo 0.5
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
      // Soglia di attivazione drag: prima di superarla, il click resta un click.
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
      // Delta in celle dal punto di attivazione del drag.
      const dx = (e.clientX - drag.refX) / CELL;
      const dy = (e.clientY - drag.refY) / CELL;
      const mates = groupMatesOf(drag.id);
      updatePositions(prev => {
        const next = {...prev};
        mates.forEach(mid => {
          const base = drag.basePositions[mid];
          if (!base) return;
          next[mid] = { ...next[mid],
            x: Math.max(0, Math.min(COLS - 1, base.x + dx)),
            y: Math.max(0, Math.min(ROWS - 1, base.y + dy)),
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
            ...SALA_V3_FIXTURES,
          ];
          const myRects = Array.from(mates).map(id => tableRect(id, next[id])).filter(Boolean);
          if (myRects.length === 0) return next;
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
    const all = window.SALA_V3_TAVOLI || tavoli;
    let source = all.find(t => t.id === droppedId);
    if (!source) return;
    // Se l'utente ha trascinato una tile secondaria, risale al primario del gruppo
    if (source.mergedWith) source = all.find(x => x.id === source.mergedWith);
    if (!source) return;
    const srcMates = new Set(groupMatesOf(source.id));
    const srcRects = Array.from(srcMates).map(id => tableRect(id)).filter(Boolean);
    if (srcRects.length === 0) return;
    // Cerca il gruppo/tavolo più vicino (non il primo trovato) per evitare proposte sbagliate
    // quando più tavoli sono in prossimità. Soglia 0.1: solo tile che si toccano.
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

  // UX: Esc chiude la card laterale.
  React.useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') { setExpandedId(null); setSplitMenu(null); } };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [expandedId, setExpandedId]);

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
      }}>
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
            width: '100%', height: ROWS * CELL,
            // Floor: griglia leggera (mostra lo snap)
            background: `
              linear-gradient(rgba(15,17,21,0.05) 1px, transparent 1px) 0 0/${CELL}px ${CELL}px,
              linear-gradient(90deg, rgba(15,17,21,0.05) 1px, transparent 1px) 0 0/${CELL}px ${CELL}px,
              linear-gradient(180deg, #FAFAF8 0%, #F5F5F2 100%)
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
          {SALA_V3_FIXTURES.map(f => {
            const fx = f.x * CELL, fy = f.y * CELL, fw = f.w * CELL, fh = f.h * CELL;
            const base = {
              position: 'absolute', left: fx + 2, top: fy + 2, width: fw - 4, height: fh - 10,
              zIndex: 2, pointerEvents: 'none', overflow: 'hidden',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: 4,
            };
            if (f.type === 'counter') return (
              <div key={f.id} style={{
                ...base,
                background: 'linear-gradient(180deg, #A0785A 0%, #8B6347 100%)',
                borderBottom: '3px solid #6B4C36',
              }}>
                <span style={{
                  color: 'rgba(255,255,255,0.65)', fontSize: 10.5,
                  fontWeight: 800, letterSpacing: 1.4, textTransform: 'uppercase',
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
                  color: 'rgba(255,255,255,0.5)', fontSize: 10.5,
                  fontWeight: 800, letterSpacing: 1.4, textTransform: 'uppercase',
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
                  fontSize: 10, fontWeight: 800, color: '#6B7280',
                  letterSpacing: 1.2, textTransform: 'uppercase', fontFamily: 'inherit',
                }}>Bagno</span>
              </div>
            );
            return null;
          })}


          {/* Cornici unione tavoli — forma reale via SVG */}
          {(() => {
            const groups = tavoli.filter(t => t.mergedTables && t.mergedTables.length > 0);
            if (groups.length === 0) return null;

            const paths = groups.flatMap(t => {
              const ids = [t.id, ...t.mergedTables];

              // Raccoglie celle unitarie occupate dal gruppo
              const occupied = new Set();
              for (const id of ids) {
                const pp = positions[id];
                if (!pp) continue;
                const tt = tavoli.find(x => x.id === id) || (window.SALA_V3_TAVOLI||[]).find(x => x.id === id);
                const dims = getTableDims(pp.shape, tt?.posti);
                for (let cx = pp.x; cx < pp.x + dims.w; cx++)
                  for (let cy = pp.y; cy < pp.y + dims.h; cy++)
                    occupied.add(`${cx},${cy}`);
              }
              if (occupied.size === 0) return [];

              // Spigoli di contorno direzionati (interno alla sinistra)
              const edges = [];
              for (const key of occupied) {
                const [cx, cy] = key.split(',').map(Number);
                const px = cx * CELL, py = cy * CELL;
                if (!occupied.has(`${cx},${cy - 1}`)) edges.push([px, py, px + CELL, py]);
                if (!occupied.has(`${cx + 1},${cy}`)) edges.push([px + CELL, py, px + CELL, py + CELL]);
                if (!occupied.has(`${cx},${cy + 1}`)) edges.push([px + CELL, py + CELL, px, py + CELL]);
                if (!occupied.has(`${cx - 1},${cy}`)) edges.push([px, py + CELL, px, py]);
              }

              // Mappa punto-inizio → indice spigolo
              const startMap = new Map();
              edges.forEach((e, i) => startMap.set(`${e[0]},${e[1]}`, i));

              // Traccia poligoni seguendo la catena di spigoli
              const used = new Uint8Array(edges.length);
              const polygons = [];
              for (let i = 0; i < edges.length; i++) {
                if (used[i]) continue;
                const pts = [];
                let idx = i;
                while (!used[idx]) {
                  used[idx] = 1;
                  pts.push([edges[idx][0], edges[idx][1]]);
                  const next = startMap.get(`${edges[idx][2]},${edges[idx][3]}`);
                  if (next === undefined) break;
                  idx = next;
                }
                if (pts.length > 2) polygons.push(pts);
              }

              const meta = SALA_V3_STATE_META[t.state] || SALA_V3_STATE_META.libero;
              return polygons.map((pts, pi) => (
                <path
                  key={`union-${t.id}-${pi}`}
                  d={'M ' + pts.map(([x, y]) => `${x} ${y}`).join(' L ') + ' Z'}
                  fill={meta.mapBg}
                  stroke={meta.mapBorder}
                  strokeWidth="8"
                  strokeLinejoin="round"
                  style={{ pointerEvents: 'none' }}
                />
              ));
            });

            if (paths.length === 0) return null;
            return (
              <svg style={{
                position: 'absolute', inset: 0,
                width: '100%', height: '100%',
                overflow: 'visible', pointerEvents: 'none', zIndex: 0,
              }}>
                {paths}
              </svg>
            );
          })()}

          {tavoli.map(t => {
            const p = positions[t.id];
            if (!p) return null;
            // Per i tavoli "uniti come secondari" (mergedWith), mostriamo gli stessi colori/stato del source.
            const sourceForMerged = t.mergedWith
              ? (tavoli.find(x => x.id === t.mergedWith) || (window.SALA_V3_TAVOLI||[]).find(x => x.id === t.mergedWith))
              : null;
            const tDisplay = sourceForMerged || t;
            const meta = SALA_V3_STATE_META[tDisplay.state];
            // Dimensione basata sulla capienza fisica del tavolo (posti) — non cambia con merge/coperti.
            const dims = getTableDims(p.shape, t.posti);
            const w = dims.w * CELL;
            const h = dims.h * CELL;
            const left = p.x * CELL;
            const top = p.y * CELL;
            const noteTipo = tDisplay.note?.tipo || tDisplay.note?.type;
            const isAllergia = noteTipo === 'allergia';
            const showTriangle = window.hasAlertTriangle && window.hasAlertTriangle(tDisplay);
            const alert = tDisplay.state === 'occupato' ? getOccupiedAlert(tDisplay) : null;
            const isAlerting = alert?.tone === 'warn';
            const ringColor = showTriangle ? '#DC2626' : (isAlerting ? '#A16207' : meta.dot);

            const dim = isDimmed(t.id) || (sourceForMerged && isDimmed(sourceForMerged.id));
            const isHovered = hovered === t.id;
            const isDragging = drag?.id === t.id || (drag && groupMatesOf(drag.id).includes(t.id));
            // Tile selezionata = quella corrispondente al tavolo aperto nella card laterale
            // (anche i merged secondari si "illuminano" se il loro source è selezionato)
            const selectedTableId = expandedId;
            const isSelected = selectedTableId != null && (
              t.id === selectedTableId || t.mergedWith === selectedTableId ||
              (sourceForMerged && sourceForMerged.id === selectedTableId)
            );
            const isInMergeProposal = !!mergeProposal && (mergeProposal.sourceGroupIds.includes(t.id) || mergeProposal.targetGroupIds.includes(t.id));
            // Per i merged secondari, badge allergia e triangolo li mostriamo solo sulla tile del source
            const showOwnBadges = !t.mergedWith;

            return (
              <div key={t.id}
                onMouseEnter={()=>setHovered(t.id)}
                onMouseLeave={()=>setHovered(null)}
                onPointerDown={(e) => handleTableMouseDown(e, t.id)}
                onClick={(e) => {
                  e.stopPropagation();
                  if (justDraggedRef.current) { justDraggedRef.current = false; return; }
                  // Click su merged secondario → apre il source
                  setExpandedId(t.mergedWith || t.id);
                }}
                style={{
                  position:'absolute',
                  left, top, width: w, height: h,
                  background: dim ? '#F4F5F7' : (meta.mapBg || meta.bg),
                  border: `2px solid ${dim ? '#E5E7EB' : (isInMergeProposal ? '#FF5A5F' : ringColor)}`,
                  borderRadius: 8,
                  cursor: isDragging ? 'grabbing' : 'grab',
                  display:'grid', placeItems:'center',
                  boxShadow: isSelected
                    ? `0 0 0 3px rgba(15,17,21,0.12), 0 10px 24px rgba(15,17,21,0.18)`
                    : (isInMergeProposal
                      ? '0 0 0 3px rgba(255,90,95,0.22), 0 6px 16px rgba(255,90,95,0.18)'
                      : (isDragging
                        ? '0 10px 24px rgba(0,0,0,0.18)'
                        : (isHovered && !dim ? '0 4px 12px rgba(0,0,0,0.12)' : 'none'))),
                  outline: isSelected ? '2px solid #0F1115' : 'none',
                  outlineOffset: isSelected ? 2 : 0,
                  transform: isHovered && !isDragging ? 'scale(1.04)' : 'scale(1)',
                  transition: isDragging ? 'none' : 'box-shadow 0.18s, transform 0.18s, outline 0.18s',
                  zIndex: isSelected ? 6 : (isDragging ? 10 : (isHovered ? 5 : 1)),
                  opacity: dim ? (isHovered ? 0.65 : 0.35) : 1,
                  filter: dim ? 'grayscale(1)' : 'none',
                  userSelect: 'none',
                  touchAction: 'none',
                }}>
                <div style={{
                  fontSize: 14, fontWeight: 800,
                  color: dim ? '#9CA3AF' : '#0F1115',
                  fontVariantNumeric:'tabular-nums',
                }}>{t.id}</div>

                {/* Top-right: solo alert triangolo (ritardo prenotazione, da pulire da troppo) */}
                {showTriangle && !dim && showOwnBadges && (
                  <div title="Attenzione" style={{
                    position: 'absolute', top: -8, right: -8,
                    background: '#DC2626', color: '#fff',
                    width: 18, height: 18, borderRadius: '50%',
                    border: '2px solid #fff',
                    animation: 'pulse 1.5s ease-in-out infinite',
                    display: 'grid', placeItems: 'center',
                    boxShadow: '0 1px 3px rgba(220,38,38,0.4)',
                  }}>
                    <PnI.Alert size={10} color="#fff"/>
                  </div>
                )}

                {/* Bottom-left: tag allergia (chip stile, come tag aziendale) */}
                {isAllergia && !dim && showOwnBadges && (
                  <div title={t.note.testo || t.note.text} style={{
                    position: 'absolute', bottom: -8, left: -6,
                    background: '#DC2626', color: '#fff',
                    padding: '2px 6px 2px 4px', borderRadius: 999,
                    border: '1.5px solid #fff',
                    fontSize: 9, fontWeight: 800, letterSpacing: 0.3,
                    display:'inline-flex', alignItems:'center', gap: 3,
                    boxShadow: '0 1px 3px rgba(220,38,38,0.35)',
                    whiteSpace:'nowrap', zIndex: 6,
                  }}>
                    ALLERGIA
                  </div>
                )}

                {/* Bottom-left (sotto): chip nota non-critica */}
                {!dim && !isAllergia && noteTipo && NOTE_TYPE_META[noteTipo] && showOwnBadges && (
                  <div title={t.note.testo || t.note.text} style={{
                    position: 'absolute', bottom: -7, left: -5,
                    background: NOTE_TYPE_META[noteTipo].bg,
                    color: NOTE_TYPE_META[noteTipo].color,
                    border: '1.5px solid #fff',
                    width: 16, height: 16, borderRadius: '50%',
                    fontSize: 9, fontWeight: 800,
                    display:'grid', placeItems:'center', zIndex: 6,
                  }}>·</div>
                )}
              </div>
            );
          })}


          {/* Chip di proposta unione — appare dopo un drop adiacente su un gruppo/tavolo libero */}
          {mergeProposal && (() => {
            const srcRects = mergeProposal.sourceGroupIds.map(id => tableRect(id)).filter(Boolean);
            const tgtRects = mergeProposal.targetGroupIds.map(id => tableRect(id)).filter(Boolean);
            if (srcRects.length === 0 || tgtRects.length === 0) return null;

            // Stato dei due lati
            const allT = window.SALA_V3_TAVOLI || tavoli;
            const srcPrimary = allT.find(t => t.id === mergeProposal.sourceId);
            const tgtPrimary = allT.find(t => t.id === mergeProposal.targetPrimaryId);
            const srcState = srcPrimary?.state || 'libero';
            const tgtState = tgtPrimary?.state || 'libero';

            // Blocco hard: entrambi prenotati o entrambi occupati
            const bothPrenotati = srcState === 'prenotato' && tgtState === 'prenotato';
            const bothOccupati  = srcState === 'occupato'  && tgtState === 'occupato';
            const isBlocked = bothPrenotati || bothOccupati;

            // Avviso per stati misti
            let warningMsg = null;
            if (!isBlocked) {
              const hasOcc  = srcState === 'occupato'  || tgtState === 'occupato';
              const hasPren = srcState === 'prenotato' || tgtState === 'prenotato';
              const hasPul  = srcState === 'dapulire'  || tgtState === 'dapulire';
              if (hasOcc && hasPren) {
                const prenT = srcState === 'prenotato' ? srcPrimary : tgtPrimary;
                const res = prenT?.nextReservation;
                warningMsg = res
                  ? `Stai usando un tavolo prenotato per ${res.name} alle ${res.time}`
                  : 'Uno dei tavoli è prenotato';
              } else if (hasOcc && hasPul) {
                warningMsg = 'Parte del tavolo è da pulire';
              } else if (hasPren && hasPul) {
                const prenT = srcState === 'prenotato' ? srcPrimary : tgtPrimary;
                const res = prenT?.nextReservation;
                warningMsg = res
                  ? `Il tavolo da pulire è prenotato per ${res.name} alle ${res.time}`
                  : 'Uno dei tavoli è prenotato e da pulire';
              } else if (hasPul) {
                warningMsg = 'Parte del tavolo è da pulire';
              }
            }

            const avg = (rects, axis) => rects.reduce((s, r) => s + r[axis] + r[axis === 'x' ? 'w' : 'h'] / 2, 0) / rects.length;
            const cx = (avg(srcRects, 'x') + avg(tgtRects, 'x')) / 2 * CELL;
            const cy = (avg(srcRects, 'y') + avg(tgtRects, 'y')) / 2 * CELL;
            const srcIds = [...mergeProposal.sourceGroupIds].sort((a, b) => a - b);
            const tgtIds = [...mergeProposal.targetGroupIds].sort((a, b) => a - b);
            const srcLabel = srcIds.length > 1 ? `Tav.${srcIds.join('-')}` : `Tav.${srcIds[0]}`;
            const tgtLabel = tgtIds.length > 1 ? `Tav.${tgtIds.join('-')}` : `Tav.${tgtIds[0]}`;

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
                  <span style={{fontSize: 12.5, fontWeight: 700, color: isBlocked ? '#DC2626' : '#111827'}}>
                    {isBlocked
                      ? (bothPrenotati ? 'Non si possono unire due tavoli prenotati' : 'Non si possono unire due tavoli occupati')
                      : `Unisci ${srcLabel} + ${tgtLabel}?`}
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
                          const all = window.SALA_V3_TAVOLI || tavoli;
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
                          guestIds.forEach(id => {
                            const t = all.find(x => x.id === id);
                            if (t && t.mergedTables) delete t.mergedTables;
                          });
                          setMergeProposal(null);
                          if (hostTable && window.SALA_V3_DO_MERGE) window.SALA_V3_DO_MERGE(hostTable, guestIds);
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
                    fontSize: 11, fontWeight: 600, color: '#92400E',
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
            const all = window.SALA_V3_TAVOLI || tavoli;
            const src = all.find(t => t.id === splitMenu);
            if (!src || !src.mergedTables || src.mergedTables.length === 0) return null;
            const allIds = [src.id, ...src.mergedTables];
            const rects = allIds.map(id => {
              const p = positions[id]; if (!p) return null;
              return { x: p.x * CELL, y: p.y * CELL };
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
                  <span style={{flex:1, fontSize:11.5, fontWeight:700, color:'#374151', letterSpacing:0.2}}>
                    Unione T.{[...allIds].sort((a,b)=>a-b).join('-')}
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
                      <span style={{flex:1, fontSize:13, fontWeight:600, color:'#0F1115'}}>Tav.{id}</span>
                      <button
                        onClick={() => {
                          if (window.SALA_V3_DO_DETACH) window.SALA_V3_DO_DETACH(src, id);
                          if (!src.mergedTables || src.mergedTables.length === 0) setSplitMenu(null);
                        }}
                        style={{
                          padding:'3px 9px', borderRadius:6,
                          background:'#F9FAFB', border:'1px solid #E5E7EB',
                          fontSize:11.5, fontWeight:600, color:'#374151',
                          cursor:'pointer', fontFamily:'inherit', whiteSpace:'nowrap',
                        }}>Separa</button>
                    </div>
                  ))}
                </div>
                {/* Footer — dividi tutto */}
                <div style={{padding:'6px 8px 8px', borderTop:'1px solid #F0F2F5'}}>
                  <button
                    onClick={() => { if (window.SALA_V3_DO_SPLIT_ALL) window.SALA_V3_DO_SPLIT_ALL(src); setSplitMenu(null); }}
                    style={{
                      width:'100%', padding:'7px 0',
                      background:'#FFF5F5', color:'#DC2626',
                      border:'1px solid #FECACA', borderRadius:7,
                      fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit',
                    }}>Dividi tutto</button>
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Card di dettaglio — overlay flottante FUORI dal contenitore bianco della mappa.
          Posizionata sopra (z-index) la mappa ma con elevazione/shadow chiaramente
          separate, così non riduce mai lo spazio del white container. */}
      {detailedTable && (
        <div style={{
          position:'absolute',
          top: 0, right: 0,
          width: 288, maxWidth: '95%',
          zIndex: 20,
          animation: 'salaPanelIn 240ms cubic-bezier(0.32,0.72,0,1)',
          pointerEvents: 'auto',
        }}>
          <div style={{
            position:'relative',
            background:'#fff',
            borderRadius: 14,
            border: '1px solid rgba(15,17,21,0.08)',
            boxShadow: '0 10px 30px rgba(15,17,21,0.18), 0 2px 6px rgba(15,17,21,0.10)',
            overflow:'hidden',
          }}>
            {/* Pulsante chiusura — chiaro affordance per dismissere la card */}
            <button
              onClick={() => setExpandedId(null)}
              title="Chiudi dettaglio"
              aria-label="Chiudi dettaglio tavolo"
              style={{
                position:'absolute', top: 8, right: 8, zIndex: 5,
                width: 28, height: 28, borderRadius: '50%',
                background: '#fff', color: '#6B7280',
                border: '1px solid rgba(15,17,21,0.08)',
                boxShadow: '0 1px 4px rgba(15,17,21,0.08)',
                cursor:'pointer', fontFamily:'inherit',
                display:'grid', placeItems:'center',
                transition:'background 150ms, color 150ms',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#F9FAFB'; e.currentTarget.style.color = '#0F1115'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#6B7280'; }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                <path d="M6 6l12 12 M18 6L6 18"/>
              </svg>
            </button>
            <SalaV3Card t={detailedTable}
              expanded={true}
              onToggle={()=>{}}
              onAdd={()=>onOpenAdd(detailedTable)}
              onPay={()=>onOpenPay(detailedTable)}
              onAddArticle={onAddArticle} cart={cart} onCartChange={onCartChange} onConfirmCart={onConfirmCart}
              onAdjustCoperti={(n) => onAdjustCoperti && onAdjustCoperti(detailedTable.id, n)}
              onAdjustReservationPosti={(n) => onAdjustReservationPosti && onAdjustReservationPosti(detailedTable.id, n)}
              onLibera={onLibera} onMove={onMove} onEdit={onEdit}
              onAssignOther={onAssignOther} onNoShow={onNoShow}
              onUnisci={onUnisci} onModificaCoperti={onModificaCoperti}/>
          </div>
        </div>
      )}
    </div>
  );
}

function FloorPlanIdlePanel() {
  const groups = [
    {state: 'occupato'},
    {state: 'prenotato'},
    {state: 'libero'},
    {state: 'dapulire'},
  ];
  return (
    <div style={{
      background: PN.WHITE, borderRadius: 14,
      border: `1px solid ${PN.BORDER_HAIR}`,
      boxShadow: '0 1px 0 rgba(15,17,21,0.04), 0 6px 20px rgba(15,17,21,0.04)',
      padding: 16,
    }}>
      <div style={{fontSize: 11, fontWeight: 600, color: PN.MUTED, letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 14}}>
        Stati sala
      </div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
        {groups.map(g => {
          const meta = SALA_V3_STATE_META[g.state];
          const count = SALA_V3_TAVOLI.filter(t => t.state === g.state && !t.mergedWith).length;
          return (
            <div key={g.state} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', borderRadius: 9,
              background: meta.mapBg || meta.bg,
              border: `1px solid ${meta.dot}1F`,
              boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.4)',
              transition: 'transform 150ms ease-out, box-shadow 150ms ease-out',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateX(2px)'; e.currentTarget.style.boxShadow = `inset 0 1px 0 rgba(255,255,255,0.4), 0 4px 12px ${meta.dot}1A`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateX(0)'; e.currentTarget.style.boxShadow = 'inset 0 1px 0 rgba(255, 255, 255, 0.4)'; }}
            >
              <span style={{
                width: 10, height: 10, borderRadius: '50%',
                background: meta.dot,
                boxShadow: `0 0 0 3px ${meta.dot}1F`,
              }}/>
              <span style={{flex: 1, fontSize: 13, fontWeight: 500, color: PN.TEXT}}>{meta.plural || meta.label}</span>
              <span style={{
                fontSize: 15, fontWeight: 600, color: meta.accent,
                fontVariantNumeric: 'tabular-nums',
              }}>{count}</span>
            </div>
          );
        })}
      </div>
      <div style={{
        marginTop: 12, padding: 10, borderRadius: 8,
        background: '#F8F9FB', fontSize: 11, color: '#6B7280', lineHeight: 1.5,
        display: 'flex', alignItems: 'center', gap: 6,
      }}>
        <PnI.Idea size={12} color="#6B7280"/> Click su un tavolo per vedere il dettaglio.
      </div>
    </div>
  );
}

function SvIconV3({ path, size = 14 }) {
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
        border: `1px solid ${PN.BORDER}`,
        borderRadius: 10,
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
            fontSize: 13.5, color: PN.TEXT,
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
window.SalaV3Tavoli = SalaV3Tavoli;
