// Mappa sala — versione pro: toolbox elementi a sx, drag-to-place, merge tavoli, arredo con resize

const FURNITURE_TYPES = [
  { kind: 'counter', label: 'Bancone', iconKey: 'counter', defaultW: 3, defaultH: 1, color: '#A0785A', textColor: '#FFF' },
  { kind: 'kitchen', label: 'Cucina', iconKey: 'kitchen', defaultW: 2.5, defaultH: 1.4, color: '#7c2436', textColor: '#FFF' },
  { kind: 'bathroom', label: 'Bagno', iconKey: 'bathroom', defaultW: 1.4, defaultH: 1.2, color: '#85B8CB', textColor: '#FFF' },
  { kind: 'wall', label: 'Muro', iconKey: 'wall', defaultW: 3, defaultH: 0.18, color: '#3F1424', textColor: '#FFF' },
  { kind: 'pillar', label: 'Colonna', iconKey: 'pillar', defaultW: 0.6, defaultH: 0.6, color: '#5A4A52', textColor: '#FFF' },
  { kind: 'door', label: 'Porta', iconKey: 'door', defaultW: 1.2, defaultH: 0.18, color: '#C5A878', textColor: '#FFF' },
];


const PaletteIcon = ({ kind, size = 22, color = PN.MUTED }) => {
  const s = { fill: 'none', stroke: color, strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (kind) {
    case 'counter': return (
      <svg width={size} height={size} viewBox="0 0 24 24" {...s}>
        <rect x="2" y="8" width="20" height="8" rx="2"/>
        <line x1="2" y1="12" x2="22" y2="12"/>
        <line x1="7" y1="12" x2="7" y2="16"/>
        <line x1="12" y1="12" x2="12" y2="16"/>
        <line x1="17" y1="12" x2="17" y2="16"/>
      </svg>
    );
    case 'kitchen': return (
      <svg width={size} height={size} viewBox="0 0 24 24" {...s}>
        <rect x="3" y="3" width="18" height="18" rx="2"/>
        <circle cx="8" cy="9" r="2"/>
        <circle cx="16" cy="9" r="2"/>
        <circle cx="8" cy="16" r="1.5"/>
        <circle cx="16" cy="16" r="1.5"/>
      </svg>
    );
    case 'bathroom': return (
      <svg width={size} height={size} viewBox="0 0 24 24" {...s}>
        <rect x="7" y="2" width="10" height="7" rx="2"/>
        <path d="M5 9h14v5a7 7 0 0 1-14 0z"/>
        <line x1="9" y1="21" x2="15" y2="21"/>
      </svg>
    );
    case 'wall': return (
      <svg width={size} height={size} viewBox="0 0 24 24" {...s}>
        <rect x="2" y="8" width="20" height="8" rx="1"/>
        <line x1="12" y1="8" x2="12" y2="16"/>
        <line x1="7" y1="12" x2="17" y2="12"/>
      </svg>
    );
    case 'pillar': return (
      <svg width={size} height={size} viewBox="0 0 24 24" {...s}>
        <ellipse cx="12" cy="5" rx="5" ry="2"/>
        <line x1="7" y1="5" x2="7" y2="19"/>
        <line x1="17" y1="5" x2="17" y2="19"/>
        <ellipse cx="12" cy="19" rx="5" ry="2"/>
      </svg>
    );
    case 'door': return (
      <svg width={size} height={size} viewBox="0 0 24 24" {...s}>
        <rect x="6" y="2" width="12" height="20" rx="1"/>
        <circle cx="15" cy="12" r="1" fill={color} stroke="none"/>
      </svg>
    );
    default: return null;
  }
};

const TABLE_SCALE = 1.0;

// Look dei fixture come nella mappa in Sala (sala-tab-tavoli.jsx):
// bancone legno, cucina dark, bagno grigio chiaro — label uppercase spaziate.
const FURN_LOOK = {
  counter:  { box: { background: 'linear-gradient(180deg, #A0785A 0%, #8B6347 100%)', borderBottom: '3px solid #6B4C36', borderRadius: 8 },
              label: { color: 'rgba(255,255,255,0.65)', letterSpacing: 1.4, textTransform: 'uppercase' } },
  kitchen:  { box: { background: 'linear-gradient(180deg, #1E2128 0%, #252830 100%)', borderBottom: '3px solid #3A3D4A', borderRadius: 8 },
              label: { color: 'rgba(255,255,255,0.5)', letterSpacing: 1.4, textTransform: 'uppercase' } },
  bathroom: { box: { background: '#EAECF0', border: '2px solid #C8CDD8', borderRadius: 6 },
              label: { color: '#6B7280', letterSpacing: 1.2, textTransform: 'uppercase' } },
};

function FloorPlan({
  cols, rows,
  tavoli, furniture, groups, selected,
  onCreateTable, onCreateFurniture,
  onMoveTable, onBulkMoveTables, onMoveFurniture, onResizeFurniture, onDeleteFurniture,
  onMergeTables, onUngroupTables, onSelectTable, onEditTable,
}) {
  const COLS = cols || 10, ROWS = rows || 6;
  const [canvasWidth, setCanvasWidth] = React.useState(COLS * 60);
  const CELL = canvasWidth / COLS;
  const canvasRef = React.useRef(null);
  const [drag, setDrag] = React.useState(null);
  const [hover, setHover] = React.useState(null); // {kind, x, y, w, h}
  const [dragOverTable, setDragOverTable] = React.useState(null);
  const [paletteDrag, setPaletteDrag] = React.useState(null); // {type: 'table' | 'furniture-X'}
  const [selectedFurniture, setSelectedFurniture] = React.useState(null);
  const [hoverTable, setHoverTable] = React.useState(null);
  const justDraggedRef = React.useRef(false);
  const [fullscreen, setFullscreen] = React.useState(false);

  // Corpo del tavolo dentro la cella: come in sala il corpo è più piccolo
  // della cella e le sedie vivono nel margine (qui restano dentro la cella,
  // così footprint e collisioni non cambiano).
  const bodyUnit = Math.max(34, CELL - 2 * ttChairMetrics(CELL * 0.72).out);
  const bodyOff = (CELL - bodyUnit) / 2;

  // ESC esce dalla modalità a tutto schermo
  React.useEffect(() => {
    if (!fullscreen) return;
    const onKey = (e) => { if (e.key === 'Escape') setFullscreen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [fullscreen]);

  React.useEffect(() => {
    if (!canvasRef.current) return;
    const ro = new ResizeObserver(entries => {
      const w = entries[0]?.contentRect.width;
      if (w && w > 0) setCanvasWidth(w);
    });
    ro.observe(canvasRef.current);
    return () => ro.disconnect();
  }, []);

  const toGrid = (clientX, clientY) => {
    const r = canvasRef.current.getBoundingClientRect();
    const x = (clientX - r.left) / CELL;
    const y = (clientY - r.top) / CELL;
    return { x: Math.max(0, Math.min(COLS, x)), y: Math.max(0, Math.min(ROWS, y)) };
  };
  const snap = v => Math.round(v * 2) / 2;

  // Footprint in celle da posti+orientation, come in sala (getTableDims):
  // 2-5 posti → 1×1, 6-8 → 2 celle, >8 → 3 celle.
  const tableDims = (t) => {
    const seats = t?.coperti || 4;
    return ttFootprintUnits(seats, ttSeatShape(seats), t?.orientation || 'h');
  };
  const overlapRects = (a, b) =>
    !(a.x + a.w <= b.x || b.x + b.w <= a.x || a.y + a.h <= b.y || b.y + b.h <= a.y);
  const groupOf = (id) => groups.find(g => g.tableIds.includes(id));
  const groupMates = (id) => {
    const g = groupOf(id);
    return g ? g.tableIds : [id];
  };

  // Ostacoli (tavoli + arredo) come rettangoli, con esclusioni opzionali.
  const obstacles = ({ skipTableIds, skipFurnId } = {}) => {
    const skip = skipTableIds instanceof Set ? skipTableIds : new Set(skipTableIds || []);
    return [
      ...tavoli.filter(t => !skip.has(t.id)).map(t => ({ x: t.pos.x, y: t.pos.y, ...tableDims(t) })),
      ...furniture.filter(f => f.id !== skipFurnId).map(f => ({ x: f.x, y: f.y, w: f.w, h: f.h })),
    ];
  };

  // Posizione libera più vicina a (tx,ty) per un rettangolo w×h, senza overlap con `occ`.
  const placeFree = (tx, ty, w, h, occ) => {
    const cx = Math.max(0, Math.min(COLS - w, snap(tx)));
    const cy = Math.max(0, Math.min(ROWS - h, snap(ty)));
    const maxR = Math.max(COLS, ROWS);
    for (let r = 0; r <= maxR; r += 0.5) {
      for (let dx = -r; dx <= r; dx += 0.5) {
        for (let dy = -r; dy <= r; dy += 0.5) {
          if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
          const nx = Math.max(0, Math.min(COLS - w, snap(cx + dx)));
          const ny = Math.max(0, Math.min(ROWS - h, snap(cy + dy)));
          if (!occ.some(o => overlapRects({ x: nx, y: ny, w, h }, o))) return { x: nx, y: ny };
        }
      }
    }
    return { x: cx, y: cy };
  };

  // Cerca spazio libero per il tavolo "moved" senza overlap con "occupied"
  const findFreeSpot = (moved, tx, ty, occupied) => {
    const dims = tableDims(moved);
    for (let r = 0; r <= 8; r += 0.5) {
      for (let dx = -r; dx <= r; dx += 0.5) {
        for (let dy = -r; dy <= r; dy += 0.5) {
          if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
          const nx = Math.max(0, Math.min(COLS - dims.w, snap(tx + dx)));
          const ny = Math.max(0, Math.min(ROWS - dims.h, snap(ty + dy)));
          const test = { x: nx, y: ny, w: dims.w, h: dims.h };
          if (!occupied.some(o => overlapRects(test, o))) return { x: nx, y: ny };
        }
      }
    }
    return { x: tx, y: ty };
  };

  // Drag elemento esistente (pointer events: mouse + touch)
  const handleMouseDown = (e, kind, id, dx = 0, dy = 0) => {
    e.stopPropagation();
    if (e.preventDefault) e.preventDefault();
    setDrag({ kind, id, dx, dy, hasMoved: false, startX: e.clientX, startY: e.clientY });
  };

  React.useEffect(() => {
    if (!drag) return;
    const move = (e) => {
      if (e.cancelable) e.preventDefault();
      // Threshold di 5px per distinguere click da drag
      const dist = Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY);
      if (!drag.hasMoved && dist < 5) return;
      const { x, y } = toGrid(e.clientX, e.clientY);
      const newX = snap(x - drag.dx);
      const newY = snap(y - drag.dy);
      if (!drag.hasMoved) setDrag(d => ({...d, hasMoved: true}));
      if (drag.kind === 'table') {
        // Se il tavolo appartiene a un gruppo, muovi tutti i tavoli del gruppo con stesso delta
        const mates = groupMates(drag.id);
        if (mates.length > 1) {
          const cur = tavoli.find(t => t.id === drag.id);
          if (!cur) return;
          const dx = newX - cur.pos.x;
          const dy = newY - cur.pos.y;
          const updates = {};
          mates.forEach(mid => {
            const m = tavoli.find(t => t.id === mid);
            if (!m) return;
            updates[mid] = {
              x: Math.max(0, Math.min(COLS - 1, snap(m.pos.x + dx))),
              y: Math.max(0, Math.min(ROWS - 1, snap(m.pos.y + dy))),
            };
          });
          if (onBulkMoveTables) onBulkMoveTables(updates);
          else updates && Object.entries(updates).forEach(([id, pos]) => onMoveTable(parseInt(id,10), pos));
          setDragOverTable(null);
        } else {
          onMoveTable(drag.id, { x: newX, y: newY });
          // Sovrapposizione significativa con un altro tavolo → proposta di unione
          const cur = tavoli.find(t => t.id === drag.id);
          if (cur && onMergeTables) {
            const dims = tableDims(cur);
            const rect = { x: newX, y: newY, ...dims };
            const over = tavoli.find(o => {
              if (o.id === drag.id) return false;
              const od = tableDims(o);
              const w = Math.min(rect.x + rect.w, o.pos.x + od.w) - Math.max(rect.x, o.pos.x);
              const h = Math.min(rect.y + rect.h, o.pos.y + od.h) - Math.max(rect.y, o.pos.y);
              return w > 0 && h > 0 && w * h >= 0.3;
            });
            setDragOverTable(over ? over.id : null);
          }
        }
      } else if (drag.kind === 'furniture') {
        onMoveFurniture(drag.id, { x: newX, y: newY });
      } else if (drag.kind === 'resize-furniture') {
        const f = furniture.find(x => x.id === drag.id);
        if (f) {
          const newW = Math.max(0.5, snap(x - f.x));
          const newH = Math.max(0.3, snap(y - f.y));
          onResizeFurniture(drag.id, { w: newW, h: newH });
        }
      }
    };
    const up = () => {
      // Al rilascio: nessuna sovrapposizione. Se l'elemento mosso si sovrappone,
      // viene spostato nello spazio libero più vicino.
      if (drag.kind === 'table' && drag.hasMoved) {
        const mates = groupMates(drag.id);
        if (mates.length > 1 && onBulkMoveTables) {
          // Gruppo: spingi gli altri tavoli che collidono col gruppo mosso
          const movedIds = new Set(mates);
          const movedRects = tavoli.filter(t => movedIds.has(t.id)).map(t => ({ id: t.id, ...t.pos, ...tableDims(t) }));
          const others = tavoli.filter(t => !movedIds.has(t.id));
          const updates = {};
          const occupied = [...movedRects, ...furniture.map(f => ({ x: f.x, y: f.y, w: f.w, h: f.h }))];
          others.forEach(o => {
            const od = tableDims(o);
            const orect = { x: o.pos.x, y: o.pos.y, ...od };
            if (occupied.some(mr => overlapRects(mr, orect))) {
              const spot = placeFree(o.pos.x, o.pos.y, od.w, od.h, occupied);
              updates[o.id] = { x: spot.x, y: spot.y };
              occupied.push({ x: spot.x, y: spot.y, w: od.w, h: od.h });
            }
          });
          if (Object.keys(updates).length) onBulkMoveTables(updates);
        } else {
          const cur = tavoli.find(t => t.id === drag.id);
          const target = dragOverTable != null ? tavoli.find(t => t.id === dragOverTable) : null;
          if (cur && target && onMergeTables) {
            // Unione come in sala (SALA_DO_MERGE): l'intero gruppo viene
            // ridisposto in un'unica FILA ORIZZONTALE ancorata al gruppo
            // target — mai forme a L. Verticale solo se la fila non entra
            // in larghezza ma entra in altezza.
            const existing = groupMates(target.id);
            const memberIds = Array.from(new Set([...existing, drag.id]));
            const members = memberIds.map(id => tavoli.find(x => x.id === id)).filter(Boolean);
            const lenAlong = (a) => members.reduce((s, m) => s + (a === 'h' ? tableDims(m).w : tableDims(m).h), 0);
            let axis = 'h';
            if (lenAlong('h') > COLS && lenAlong('v') <= ROWS) axis = 'v';
            const exMembers = existing.map(id => tavoli.find(x => x.id === id)).filter(Boolean);
            const anchorX = Math.min(...exMembers.map(m => m.pos.x));
            const anchorY = Math.min(...exMembers.map(m => m.pos.y));
            const total = lenAlong(axis);
            const crossMax = Math.max(...members.map(m => axis === 'h' ? tableDims(m).h : tableDims(m).w));
            let cursor = axis === 'h'
              ? Math.max(0, Math.min(anchorX, COLS - total))
              : Math.max(0, Math.min(anchorY, ROWS - total));
            const cross = axis === 'h'
              ? Math.max(0, Math.min(anchorY, ROWS - crossMax))
              : Math.max(0, Math.min(anchorX, COLS - crossMax));
            // In fila: i membri esistenti mantengono il loro ordine, il trascinato va in coda
            const orderedMembers = [
              ...members.filter(m => m.id !== drag.id).sort((a, b) => axis === 'h' ? a.pos.x - b.pos.x : a.pos.y - b.pos.y),
              members.find(m => m.id === drag.id),
            ].filter(Boolean);
            const updates = {};
            const lineRects = [];
            orderedMembers.forEach(m => {
              const d = tableDims(m);
              const x = axis === 'h' ? Math.min(cursor, COLS - d.w) : cross;
              const y = axis === 'h' ? cross : Math.min(cursor, ROWS - d.h);
              updates[m.id] = { x, y };
              lineRects.push({ x, y, w: d.w, h: d.h });
              cursor += axis === 'h' ? d.w : d.h;
            });
            // Sgombera i tavoli estranei finiti sotto la fila
            const memberSet = new Set(memberIds);
            const occupied = [...lineRects, ...furniture.map(f => ({ x: f.x, y: f.y, w: f.w, h: f.h }))];
            tavoli.filter(o => !memberSet.has(o.id)).forEach(o => {
              const od = tableDims(o);
              if (occupied.some(r => overlapRects(r, { x: o.pos.x, y: o.pos.y, ...od }))) {
                const spot = placeFree(o.pos.x, o.pos.y, od.w, od.h, occupied);
                updates[o.id] = { x: spot.x, y: spot.y };
                occupied.push({ x: spot.x, y: spot.y, w: od.w, h: od.h });
              }
            });
            if (onBulkMoveTables) onBulkMoveTables(updates);
            else Object.entries(updates).forEach(([id, pos]) => onMoveTable(parseInt(id, 10), pos));
            onMergeTables(drag.id, target.id);
          } else if (cur) {
            // Tavolo singolo: se collide, riposizionalo nello spazio libero più vicino
            const occ = obstacles({ skipTableIds: [drag.id] });
            const dims = tableDims(cur);
            const me = { x: cur.pos.x, y: cur.pos.y, ...dims };
            if (occ.some(o => overlapRects(me, o))) {
              const spot = placeFree(cur.pos.x, cur.pos.y, dims.w, dims.h, occ);
              onMoveTable(drag.id, spot);
            }
          }
        }
      } else if (drag.kind === 'furniture' && drag.hasMoved) {
        // Arredo: non può sovrapporsi a tavoli né ad altro arredo
        const cur = furniture.find(f => f.id === drag.id);
        if (cur) {
          const occ = obstacles({ skipFurnId: drag.id });
          const me = { x: cur.x, y: cur.y, w: cur.w, h: cur.h };
          if (occ.some(o => overlapRects(me, o))) {
            const spot = placeFree(cur.x, cur.y, cur.w, cur.h, occ);
            onMoveFurniture(drag.id, spot);
          }
        }
      }
      if (drag.hasMoved) justDraggedRef.current = true;
      setDrag(null);
      setDragOverTable(null);
    };
    document.addEventListener('pointermove', move, { passive: false });
    document.addEventListener('pointerup', up);
    document.addEventListener('pointercancel', up);
    return () => {
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerup', up);
      document.removeEventListener('pointercancel', up);
    };
  }, [drag, dragOverTable, tavoli, furniture]);

  // Drag from palette (cursor follow + drop)
  React.useEffect(() => {
    if (!paletteDrag) return;
    const move = (e) => {
      if (!canvasRef.current) return;
      if (e.cancelable) e.preventDefault();
      const r = canvasRef.current.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) {
        setHover(null);
        return;
      }
      const { x, y } = toGrid(e.clientX, e.clientY);
      if (paletteDrag.type === 'table') {
        setHover({ type: 'table', x: snap(x - TABLE_SCALE / 2), y: snap(y - TABLE_SCALE / 2)});
      } else {
        const ft = FURNITURE_TYPES.find(f => f.kind === paletteDrag.kind);
        setHover({ type: 'furniture', kind: ft.kind, x: snap(x - ft.defaultW/2), y: snap(y - ft.defaultH/2), w: ft.defaultW, h: ft.defaultH });
      }
    };
    const up = (e) => {
      if (!canvasRef.current) { setPaletteDrag(null); setHover(null); return; }
      const r = canvasRef.current.getBoundingClientRect();
      const inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
      if (inside) {
        const { x, y } = toGrid(e.clientX, e.clientY);
        if (paletteDrag.type === 'table') {
          const spot = placeFree(x - TABLE_SCALE / 2, y - TABLE_SCALE / 2, TABLE_SCALE, TABLE_SCALE, obstacles());
          onCreateTable(spot);
        } else {
          const ft = FURNITURE_TYPES.find(f => f.kind === paletteDrag.kind);
          const spot = placeFree(x - ft.defaultW/2, y - ft.defaultH/2, ft.defaultW, ft.defaultH, obstacles());
          onCreateFurniture({
            kind: ft.kind, label: ft.label, color: ft.color, textColor: ft.textColor,
            x: spot.x, y: spot.y,
            w: ft.defaultW, h: ft.defaultH,
          });
        }
      }
      setPaletteDrag(null);
      setHover(null);
    };
    document.addEventListener('pointermove', move, { passive: false });
    document.addEventListener('pointerup', up);
    document.addEventListener('pointercancel', up);
    return () => {
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerup', up);
      document.removeEventListener('pointercancel', up);
    };
  }, [paletteDrag, onCreateTable, onCreateFurniture]);

  const expandBtn = (
    <button
      onClick={() => setFullscreen(f => !f)}
      title={fullscreen ? 'Riduci' : 'Espandi a tutto schermo'}
      style={{
        display:'inline-flex', alignItems:'center', gap: 6, padding:'6px 12px',
        background: '#F1F3F5', border:`1px solid ${PN.BORDER}`, borderRadius: 8,
        fontSize: 13.5, fontWeight: 700, color: PN.TEXT, cursor:'pointer', fontFamily:'inherit',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = '#E5E7EB'; }}
      onMouseLeave={e => { e.currentTarget.style.background = '#F1F3F5'; }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {fullscreen
          ? <path d="M9 3v6H3 M21 9h-6V3 M3 15h6v6 M15 21v-6h6"/>
          : <path d="M8 3H3v5 M16 3h5v5 M3 16v5h5 M21 16v5h-5"/>}
      </svg>
      {fullscreen ? 'Riduci' : 'Espandi'}
    </button>
  );

  return (
    <div style={fullscreen ? {
      position:'fixed', inset:0, zIndex:200, background: PN.WHITE,
      padding: 20, overflow:'auto',
    } : {}}>
      <div style={{display:'flex', justifyContent:'flex-end', marginBottom: 4}}>{expandBtn}</div>
      <div style={{display:'grid', gridTemplateColumns:'200px 1fr', gap: 14}}>
      {/* TOOLBOX */}
      <aside style={{
        background: '#FAFBFC', border:`1px solid ${PN.BORDER_SOFT}`,
        borderRadius: 12, padding: 12, alignSelf:'start',
        position:'sticky', top: 80,
      }}>
        <button
          onClick={() => {
            // Sovrapposizione AABB: il nuovo tavolo (TABLE_SCALE×TABLE_SCALE) non deve
            // intersecare nessun tavolo esistente (t.pos) né arredo.
            const overlap = (ax, ay, aw, ah, bx, by, bw, bh) =>
              ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
            const tableOverlap = (x, y) => tavoli.some(t => { const td = tableDims(t); return overlap(x, y, TABLE_SCALE, TABLE_SCALE, t.pos.x, t.pos.y, td.w, td.h); });
            const furnOverlap = (x, y) => furniture.some(f => overlap(x, y, TABLE_SCALE, TABLE_SCALE, f.x, f.y, f.w, f.h));
            const fits = (x, y) => x + TABLE_SCALE <= COLS && y + TABLE_SCALE <= ROWS && !tableOverlap(x, y) && !furnOverlap(x, y);
            let spot = null;
            for (let y = 0; y <= ROWS - TABLE_SCALE && !spot; y += 0.5) {
              for (let x = 0; x <= COLS - TABLE_SCALE && !spot; x += 0.5) {
                if (fits(x, y)) spot = { x, y };
              }
            }
            onCreateTable(spot || { x: 0, y: 0 });
          }}
          style={{
            width: '100%', padding: 12, marginBottom: 12,
            border: `2px solid ${PN.TEXT}`, background: PN.WHITE,
            borderRadius: 9, cursor:'pointer', fontFamily:'inherit',
            display:'flex', alignItems:'center', justifyContent:'center', gap: 8,
          }}
        >
          <BuIcons.plus size={16} color={PN.TEXT}/>
          <span style={{fontSize: 13.5, fontWeight: 700, color: PN.TEXT}}>Aggiungi tavolo</span>
        </button>

        <div style={{fontSize: 12.5, fontWeight: 800, color: PN.MUTED, letterSpacing: 0.6, textTransform:'uppercase', marginBottom: 10, padding:'0 4px'}}>
          Trascina sulla mappa
        </div>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap: 6}}>
          {FURNITURE_TYPES.map(ft => (
            <button
              key={ft.kind}
              onPointerDown={() => setPaletteDrag({type: 'furniture', kind: ft.kind})}
              style={{
                padding: '10px 6px',
                border: `1px solid ${PN.BORDER_SOFT}`, background: PN.WHITE,
                borderRadius: 8, cursor:'grab', fontFamily:'inherit',
                display:'flex', flexDirection:'column', alignItems:'center', gap: 4,
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = PN.PINK}
              onMouseLeave={e => e.currentTarget.style.borderColor = PN.BORDER_SOFT}
            >
              <span style={{display:'inline-flex'}}><PaletteIcon kind={ft.iconKey} size={22} color={ft.color}/></span>
              <span style={{fontSize: 12.5, fontWeight: 600, color: PN.TEXT}}>{ft.label}</span>
            </button>
          ))}
        </div>

        <div style={{
          marginTop: 14, padding: 10,
          background: PN.WHITE, border: `1px solid ${PN.BORDER_SOFT}`, borderRadius: 8,
          fontSize: 13, color: PN.MUTED, lineHeight: 1.5,
        }}>
          <BuIcons.bulb size={12} color={PN.AMBER}/> Trascina un elemento <b>fuori dalla mappa</b> per eliminarlo.
        </div>
      </aside>

      {/* CANVAS */}
      <div>
        <div
          ref={canvasRef}
          style={{
            position:'relative',
            width: '100%', height: ROWS * CELL,
            // Stesso floor della mappa in Sala: griglia hairline su fondo warm
            background: `
              linear-gradient(rgba(15,17,21,0.06) 1px, transparent 1px) 0 0/${CELL}px ${CELL}px,
              linear-gradient(90deg, rgba(15,17,21,0.06) 1px, transparent 1px) 0 0/${CELL}px ${CELL}px,
              linear-gradient(180deg, #FAF6F4 0%, #F3EEEF 100%)
            `,
            border: `1px solid ${PN.BORDER_HAIR}`, borderRadius: 12,
            boxShadow: 'inset 0 1px 2px rgba(15, 17, 21, 0.04)',
            cursor: paletteDrag ? 'crosshair' : 'default',
            overflow:'hidden',
          }}
          onClick={() => setSelectedFurniture(null)}
        >
          {/* Pareti floor — stesso glow coral della sala */}
          <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 3, background: 'linear-gradient(90deg, transparent, rgba(255, 90, 95, 0.20), transparent)', pointerEvents:'none'}}/>
          <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: 'linear-gradient(180deg, transparent, rgba(255, 90, 95, 0.20), transparent)', pointerEvents:'none'}}/>
          {/* Furniture (sotto i tavoli) */}
          {furniture.map(f => {
            const ft = FURNITURE_TYPES.find(x => x.kind === f.kind) || {};
            const isSelected = selectedFurniture === f.id;
            const canRotate = f.kind === 'pillar' || f.kind === 'wall' || f.kind === 'door';
            const look = FURN_LOOK[f.kind];
            return (
              <div
                key={f.id}
                onPointerDown={(e) => {
                  const r = canvasRef.current.getBoundingClientRect();
                  const dx = (e.clientX - r.left) / CELL - f.x;
                  const dy = (e.clientY - r.top) / CELL - f.y;
                  handleMouseDown(e, 'furniture', f.id, dx, dy);
                }}
                onClick={(e) => { e.stopPropagation(); setSelectedFurniture(f.id); }}
                style={{
                  position:'absolute',
                  left: f.x * CELL, top: f.y * CELL,
                  width: f.w * CELL, height: f.h * CELL,
                  background: f.color, color: f.textColor || '#FFF',
                  borderRadius: f.kind === 'pillar' ? (f.w === f.h ? '50%' : 999) : (f.kind === 'wall' || f.kind === 'door') ? 2 : 6,
                  display:'grid', placeItems:'center',
                  fontSize: 13, fontWeight: 700,
                  cursor: drag?.id === f.id ? 'grabbing' : 'grab',
                  outline: isSelected ? `2px solid ${PN.PINK}` : 'none',
                  outlineOffset: 2,
                  userSelect:'none',
                  boxShadow: drag?.id === f.id ? '0 8px 20px rgba(0,0,0,0.18)' : 'none',
                  zIndex: 1,
                  ...(look ? look.box : {}),
                }}
              >
                {f.h * CELL > 30 && f.w * CELL > 80 && (
                  <span style={{fontSize: 13, fontWeight: 700, padding:'0 8px', textAlign:'center', ...(look ? look.label : {})}}>{f.label}</span>
                )}
                {isSelected && (
                  <>
                    {/* Rotate handle (per elementi rettangolari) */}
                    {canRotate && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (typeof onRotateFurniture === 'function') onRotateFurniture(f.id);
                          else onResizeFurniture(f.id, { w: f.h, h: f.w });
                        }}
                        title="Ruota 90°"
                        style={{
                          position:'absolute', top: -10, left: -10,
                          width: 22, height: 22, borderRadius: '50%',
                          background: PN.WHITE, color: PN.TEXT,
                          border: `1.5px solid ${PN.PINK}`,
                          cursor:'pointer', fontSize: 13, fontWeight: 700,
                          display:'grid', placeItems:'center',
                          boxShadow:'0 2px 4px rgba(0,0,0,0.15)',
                        }}
                      >↻</button>
                    )}
                    {/* Resize handle bottom-right */}
                    <div
                      onPointerDown={(e) => { e.stopPropagation(); handleMouseDown(e, 'resize-furniture', f.id); }}
                      style={{
                        position:'absolute', right: -6, bottom: -6,
                        width: 14, height: 14, borderRadius: 4,
                        background: PN.PINK, border: `2px solid ${PN.WHITE}`,
                        cursor: 'nwse-resize',
                        boxShadow:'0 2px 4px rgba(0,0,0,0.2)',
                      }}
                    />
                    {/* Delete */}
                    <button
                      onClick={(e) => { e.stopPropagation(); onDeleteFurniture(f.id); setSelectedFurniture(null); }}
                      style={{
                        position:'absolute', top: -10, right: -10,
                        width: 22, height: 22, borderRadius: '50%',
                        background: PN.PINK_DARK, color: PN.WHITE,
                        border: `2px solid ${PN.WHITE}`,
                        cursor:'pointer', fontSize: 14, fontWeight: 700,
                        display:'grid', placeItems:'center',
                        boxShadow:'0 2px 4px rgba(0,0,0,0.15)',
                      }}
                    >×</button>
                  </>
                )}
              </div>
            );
          })}

          {/* Cornice unione — IDENTICA alla sala: edge-tracing delle celle del
              gruppo, fill bianco 0.45, stroke ring spesso 8, SOTTO le tile. */}
          {(() => {
            const activeGroups = groups.filter(g => tavoli.filter(t => g.tableIds.includes(t.id)).length >= 2);
            if (activeGroups.length === 0) return null;
            const paths = activeGroups.flatMap(g => {
              const ts = tavoli.filter(t => g.tableIds.includes(t.id));
              // Celle occupate = footprint reale di ogni membro (anche multi-cella)
              const occupied = new Set();
              ts.forEach(t => {
                const d = tableDims(t);
                for (let i = 0; i < d.w; i++) for (let j = 0; j < d.h; j++) occupied.add(`${t.pos.x + i},${t.pos.y + j}`);
              });
              const edges = [];
              for (const key of occupied) {
                const [cx, cy] = key.split(',').map(Number);
                const px = cx * CELL, py = cy * CELL;
                if (!occupied.has(`${cx},${cy-1}`)) edges.push([px, py, px+CELL, py]);
                if (!occupied.has(`${cx+1},${cy}`)) edges.push([px+CELL, py, px+CELL, py+CELL]);
                if (!occupied.has(`${cx},${cy+1}`)) edges.push([px+CELL, py+CELL, px, py+CELL]);
                if (!occupied.has(`${cx-1},${cy}`)) edges.push([px, py+CELL, px, py]);
              }
              const startMap = new Map();
              edges.forEach((e, i) => startMap.set(`${e[0]},${e[1]}`, i));
              const used = new Uint8Array(edges.length);
              const polygons = [];
              for (let i = 0; i < edges.length; i++) {
                if (used[i]) continue;
                const pts = []; let idx = i;
                while (!used[idx]) {
                  used[idx] = 1; pts.push([edges[idx][0], edges[idx][1]]);
                  const next = startMap.get(`${edges[idx][2]},${edges[idx][3]}`);
                  if (next === undefined) break; idx = next;
                }
                if (pts.length > 2) polygons.push(pts);
              }
              return polygons.map((pts, pi) => (
                <path key={`union-${g.id}-${pi}`}
                  d={'M ' + pts.map(([x,y]) => `${x} ${y}`).join(' L ') + ' Z'}
                  fill="rgba(255, 255, 255, 0.45)"
                  stroke={TT_ACCENTS.libero.ring}
                  strokeWidth="8"
                  strokeLinejoin="round"
                  style={{ pointerEvents: 'none' }}
                />
              ));
            });
            if (paths.length === 0) return null;
            return (
              <svg style={{position:'absolute', inset:0, width:'100%', height:'100%', overflow:'visible', pointerEvents:'none', zIndex:0}}>
                {paths}
              </svg>
            );
          })()}

          {/* Tavoli */}
          {tavoli.map(t => {
            const isSel = selected.has(t.id);
            const inGroup = !!groupOf(t.id);
            // Gruppo = UN tavolo: hover e drag su un membro coinvolgono tutti (come in sala)
            const isDrag = drag?.kind === 'table' && (drag.id === t.id || (inGroup && groupMates(drag.id).includes(t.id)));
            const isHov = inGroup
              ? (hoverTable != null && groupMates(t.id).includes(hoverTable))
              : hoverTable === t.id;
            const numero = (t.name.match(/\d+/) || [t.name])[0];
            const seats = t.coperti || 4;
            const shape = ttSeatShape(seats);
            const orient = t.orientation || 'h';
            const dims = tableDims(t);
            const bw = ttBodySize(seats, shape, orient, bodyUnit, CELL);
            let left = t.pos.x * CELL + (dims.w * CELL - bw.w) / 2;
            let top  = t.pos.y * CELL + (dims.h * CELL - bw.h) / 2;
            // Come in sala: sedie nascoste sui lati a contatto con gli altri
            // membri del gruppo, corpo esteso fino al bordo cella su quei lati.
            const hideChairSides = [];
            const bodyExtend = { left: 0, right: 0, top: 0, bottom: 0 };
            if (inGroup) {
              const EPS = 0.3;
              groupMates(t.id).forEach(mid => {
                if (mid === t.id) return;
                const m = tavoli.find(x => x.id === mid);
                if (!m) return;
                const dm = tableDims(m);
                const overlapY = m.pos.y < t.pos.y + dims.h - EPS && t.pos.y < m.pos.y + dm.h - EPS;
                const overlapX = m.pos.x < t.pos.x + dims.w - EPS && t.pos.x < m.pos.x + dm.w - EPS;
                if (overlapY && Math.abs(m.pos.x - (t.pos.x + dims.w)) < EPS) hideChairSides.push('right');
                if (overlapY && Math.abs((m.pos.x + dm.w) - t.pos.x) < EPS) hideChairSides.push('left');
                if (overlapX && Math.abs(m.pos.y - (t.pos.y + dims.h)) < EPS) hideChairSides.push('bottom');
                if (overlapX && Math.abs((m.pos.y + dm.h) - t.pos.y) < EPS) hideChairSides.push('top');
              });
              const gapX = (dims.w * CELL - bw.w) / 2;
              const gapY = (dims.h * CELL - bw.h) / 2;
              if (hideChairSides.includes('left'))   { bodyExtend.left = gapX;   left -= gapX; }
              if (hideChairSides.includes('right'))  { bodyExtend.right = gapX; }
              if (hideChairSides.includes('top'))    { bodyExtend.top = gapY;    top -= gapY; }
              if (hideChairSides.includes('bottom')) { bodyExtend.bottom = gapY; }
            }
            return (
              <TableTile
                key={t.id}
                numero={numero}
                status="libero"
                seats={seats}
                shape={shape}
                orientation={orient}
                hideStatusLabel
                hideChairSides={hideChairSides}
                bodyExtend={bodyExtend}
                hideNumber={inGroup}
                hideBody={inGroup}
                dim={t.disabled}
                selected={isSel}
                hovered={isHov && !isDrag}
                dragging={isDrag}
                mergeHint={dragOverTable != null && (t.id === dragOverTable || isDrag)}
                unit={bodyUnit}
                pitch={CELL}
                left={left}
                top={top}
                onEnter={() => setHoverTable(t.id)}
                onLeave={() => setHoverTable(h => (h === t.id ? null : h))}
                onPointerDown={(e) => handleMouseDown(e, 'table', t.id, dims.w/2, dims.h/2)}
                onClick={(e) => {
                  e.stopPropagation();
                  if (justDraggedRef.current) { justDraggedRef.current = false; return; }
                  // Click su tavolo → apre edit
                  if (typeof onEditTable === 'function') onEditTable(t.id);
                  else onSelectTable(t.id);
                }}
              >
                {/* Coperti sotto il numero — al posto della label di stato della sala */}
                {!t.disabled && !inGroup && (
                  <div style={{
                    position:'absolute', left:0, right:0, bottom: Math.max(6, bodyUnit * 0.12),
                    textAlign:'center', pointerEvents:'none', lineHeight:1,
                    fontSize: Math.min(11.5, Math.max(9.5, bodyUnit * 0.15)),
                    fontWeight: 700, letterSpacing: 0.4, color: '#15803D', opacity: 0.85,
                  }}>
                    <span style={{display:'inline-flex', alignItems:'center', gap: 2}}>
                      <BuIcons.chair size={Math.min(11, Math.max(9, bodyUnit * 0.14))}/> {t.coperti}
                    </span>
                  </div>
                )}
                {t.disabled && (
                  <div style={{
                    position:'absolute', bottom: -16,
                    left:'50%', transform:'translateX(-50%)',
                    fontSize: 10.5, fontWeight: 800, letterSpacing: 0.4,
                    color: PN.MUTED, background: '#EEF0F3',
                    padding:'1px 5px', borderRadius: 3,
                    whiteSpace:'nowrap',
                  }}>DISATTIVATO</div>
                )}
              </TableTile>
            );
          })}

          {/* Gruppo unito = UN tavolo, anche visivamente (identico alla sala):
              corpo UNICO glass senza linee di giunzione sul bounding box dei
              corpi, nome "3-4" e coperti centrati. Le tile membri disegnano
              solo sedie e hit area. */}
          {groups.filter(g => tavoli.filter(t => g.tableIds.includes(t.id)).length >= 2).map(g => {
            const members = tavoli.filter(t => g.tableIds.includes(t.id));
            const bodies = members.map(t => {
              const seats = t.coperti || 4;
              const shape = ttSeatShape(seats);
              const orient = t.orientation || 'h';
              const dims = tableDims(t);
              const bw = ttBodySize(seats, shape, orient, bodyUnit, CELL);
              const bl = t.pos.x * CELL + (dims.w * CELL - bw.w) / 2;
              const bt = t.pos.y * CELL + (dims.h * CELL - bw.h) / 2;
              return { id: t.id, l: bl, t: bt, r: bl + bw.w, b: bt + bw.h };
            });
            const L = Math.min(...bodies.map(b => b.l));
            const T = Math.min(...bodies.map(b => b.t));
            const R = Math.max(...bodies.map(b => b.r));
            const B = Math.max(...bodies.map(b => b.b));
            const horizontal = (R - L) >= (B - T);
            const ordered = [...bodies]
              .sort((a, b) => horizontal ? a.l - b.l : a.t - b.t)
              .map(x => { const m = members.find(t => t.id === x.id); return (m.name.match(/\d+/) || [m.name])[0]; });
            const ids = members.map(m => m.id);
            const dim = members.every(m => m.disabled);
            const isHov = hoverTable != null && ids.includes(hoverTable);
            const isSel = ids.some(id => selected.has(id));
            const isDrag = !!drag && drag.kind === 'table' && ids.includes(drag.id);
            const inProposal = dragOverTable != null && ids.includes(dragOverTable);
            const acc = TT_ACCENTS.libero;
            const hair = inProposal ? 'rgba(255, 90, 95, 0.60)' : acc.ring;
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
            const cop = members.reduce((a, m) => a + (m.coperti || 0), 0);
            return (
              <React.Fragment key={`gbody-${g.id}`}>
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
                {/* Nome unico + coperti, centrati sul corpo */}
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
                    }}>{cop} posti</span>
                  )}
                </div>
              </React.Fragment>
            );
          })}

          {/* Hover preview while dragging from palette */}
          {hover && (
            <div style={{
              position:'absolute',
              left: hover.x * CELL, top: hover.y * CELL,
              width: (hover.type === 'table' ? TABLE_SCALE : hover.w) * CELL,
              height: (hover.type === 'table' ? TABLE_SCALE : hover.h) * CELL,
              border: `2px dashed ${PN.PINK}`,
              background: 'rgba(216,118,143,0.18)',
              borderRadius: 8,
              pointerEvents:'none', zIndex: 20,
            }}/>
          )}

          {/* Empty state */}
          {tavoli.length === 0 && furniture.length === 0 && !paletteDrag && (
            <div style={{
              position:'absolute', inset: 0,
              display:'grid', placeItems:'center',
              pointerEvents:'none',
            }}>
              <div style={{textAlign:'center', color: PN.MUTED}}>
                <div style={{display:'inline-flex', marginBottom: 10, color: PN.MUTED_SOFT}}><BuIcons.table size={36}/></div>
                <div style={{fontSize: 16, fontWeight: 700, color: PN.TEXT, marginBottom: 4}}>Inizia a disegnare la tua sala</div>
                <div style={{fontSize: 14.5}}>Trascina un tavolo o un elemento di arredo dal pannello a sinistra</div>
              </div>
            </div>
          )}
        </div>

        {/* Legenda mappa */}
        <div style={{
          marginTop: 10, display:'flex', gap: 16, flexWrap:'wrap',
          fontSize: 13, color: PN.MUTED,
        }}>
          <span style={{display:'inline-flex', alignItems:'center', gap: 5}}><BuIcons.cursor size={11}/> Click sull'arredo per selezionare e ridimensionare</span>
        </div>
      </div>
      </div>
    </div>
  );
}

window.FloorPlan = FloorPlan;
