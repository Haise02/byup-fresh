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
  const justDraggedRef = React.useRef(false);
  const [fullscreen, setFullscreen] = React.useState(false);

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

  const tableDims = () => ({ w: TABLE_SCALE, h: TABLE_SCALE });
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
      ...tavoli.filter(t => !skip.has(t.id)).map(t => ({ x: t.pos.x, y: t.pos.y, w: TABLE_SCALE, h: TABLE_SCALE })),
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
            const orect = { x: o.pos.x, y: o.pos.y, ...tableDims(o) };
            if (occupied.some(mr => overlapRects(mr, orect))) {
              const spot = placeFree(o.pos.x, o.pos.y, TABLE_SCALE, TABLE_SCALE, occupied);
              updates[o.id] = { x: spot.x, y: spot.y };
              occupied.push({ x: spot.x, y: spot.y, w: TABLE_SCALE, h: TABLE_SCALE });
            }
          });
          if (Object.keys(updates).length) onBulkMoveTables(updates);
        } else {
          // Tavolo singolo: se collide, riposizionalo nello spazio libero più vicino
          const cur = tavoli.find(t => t.id === drag.id);
          if (cur) {
            const occ = obstacles({ skipTableIds: [drag.id] });
            const me = { x: cur.pos.x, y: cur.pos.y, w: TABLE_SCALE, h: TABLE_SCALE };
            if (occ.some(o => overlapRects(me, o))) {
              const spot = placeFree(cur.pos.x, cur.pos.y, TABLE_SCALE, TABLE_SCALE, occ);
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
            const tableOverlap = (x, y) => tavoli.some(t => overlap(x, y, TABLE_SCALE, TABLE_SCALE, t.pos.x, t.pos.y, TABLE_SCALE, TABLE_SCALE));
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
            background: `
              linear-gradient(${PN.BORDER_SOFT} 1px, transparent 1px) 0 0/${CELL}px ${CELL}px,
              linear-gradient(90deg, ${PN.BORDER_SOFT} 1px, transparent 1px) 0 0/${CELL}px ${CELL}px,
              #FBF8F4
            `,
            border: `1.5px solid ${PN.BORDER}`, borderRadius: 12,
            cursor: paletteDrag ? 'crosshair' : 'default',
            overflow:'hidden',
          }}
          onClick={() => setSelectedFurniture(null)}
        >
          {/* Furniture (sotto i tavoli) */}
          {furniture.map(f => {
            const ft = FURNITURE_TYPES.find(x => x.kind === f.kind) || {};
            const isSelected = selectedFurniture === f.id;
            const canRotate = f.kind === 'pillar' || f.kind === 'wall' || f.kind === 'door';
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
                }}
              >
                {f.h * CELL > 30 && f.w * CELL > 80 && (
                  <span style={{fontSize: 13, fontWeight: 700, padding:'0 8px', textAlign:'center'}}>{f.label}</span>
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

          {/* Gruppi tavoli — contorno SVG edge-tracing (stesso approccio sala v3) */}
          {(() => {
            const activeGroups = groups.filter(g => tavoli.filter(t => g.tableIds.includes(t.id)).length >= 2);
            if (activeGroups.length === 0) return null;
            const allPaths = activeGroups.flatMap(g => {
              const ts = tavoli.filter(t => g.tableIds.includes(t.id));
              const occupied = new Set(ts.map(t => `${t.pos.x},${t.pos.y}`));
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
              const minX = Math.min(...ts.map(t => t.pos.x)) * CELL;
              const minY = Math.min(...ts.map(t => t.pos.y)) * CELL;
              return { g, polygons, minX, minY };
            });
            return (
              <>
                <svg style={{position:'absolute', left:0, top:0, width:'100%', height:'100%', pointerEvents:'none', zIndex:3, overflow:'visible'}}>
                  {allPaths.flatMap(({g, polygons}) => polygons.map((pts, pi) => (
                    <path key={`union-${g.id}-${pi}`}
                      d={'M ' + pts.map(([x,y]) => `${x} ${y}`).join(' L ') + ' Z'}
                      fill="rgba(216,118,143,0.07)"
                      stroke={PN.PINK}
                      strokeWidth="3"
                      strokeDasharray="6 4"
                      strokeLinejoin="round"
                    />
                  )))}
                </svg>
                {allPaths.map(({g, minX, minY}) => (
                  <div key={`label-${g.id}`} style={{
                    position:'absolute', left: minX + 6, top: minY - 11,
                    background: PN.PINK, color: PN.WHITE,
                    fontSize: 12, fontWeight: 700, padding:'2px 7px', borderRadius: 4,
                    pointerEvents:'none', zIndex: 4,
                  }}>
                    Tav.{[...g.tableIds].sort((a,b) => a-b).join('-')}
                  </div>
                ))}
              </>
            );
          })()}

          {/* Tavoli */}
          {tavoli.map(t => {
            const isSel = selected.has(t.id);
            const isDrag = drag?.kind === 'table' && drag?.id === t.id;
            const { w: tw, h: th } = tableDims();
            const inGroup = !!groupOf(t.id);
            return (
              <div
                key={t.id}
                onPointerDown={(e) => handleMouseDown(e, 'table', t.id, tw/2, th/2)}
                onClick={(e) => {
                  e.stopPropagation();
                  if (justDraggedRef.current) { justDraggedRef.current = false; return; }
                  // Click su tavolo → apre edit
                  if (typeof onEditTable === 'function') onEditTable(t.id);
                  else onSelectTable(t.id);
                }}
                style={{
                  position:'absolute',
                  left: t.pos.x * CELL, top: t.pos.y * CELL,
                  width: tw * CELL,
                  height: th * CELL,
                  background: t.disabled ? '#F4F5F7' : (isSel ? '#E5E8EC' : '#F4F5F7'),
                  border: `2px solid ${isSel ? PN.TEXT : '#D5D9DF'}`,
                  borderRadius: 8,
                  display:'grid', placeItems:'center',
                  cursor: isDrag ? 'grabbing' : 'grab',
                  fontSize: 15, fontWeight: 800,
                  color: t.disabled ? PN.MUTED : PN.TEXT,
                  userSelect:'none',
                  boxShadow: isDrag ? '0 10px 24px rgba(0,0,0,0.18)' : 'none',
                  zIndex: isDrag ? 10 : 3,
                  opacity: t.disabled ? 0.7 : 1,
                  transition: isDrag ? 'none' : 'box-shadow 0.15s',
                }}
              >
                {tw * CELL < 46 ? (
                  // Tavolo piccolo: solo il numero, dimensione adattata alla cella
                  <span style={{fontSize: Math.max(8, Math.min(13, tw * CELL * 0.34)), fontWeight:800, lineHeight:1}}>
                    {(t.name.match(/\d+/) || [t.name])[0]}
                  </span>
                ) : (
                  <div style={{display:'flex', flexDirection:'column', alignItems:'center', lineHeight:1, gap:3}}>
                    <span style={{fontSize:15, fontWeight:800, lineHeight:1}}>
                      {t.name.replace(/^Tavolo/i, 'Tav.')}
                    </span>
                    <span style={{display:'inline-flex', alignItems:'center', gap:2, fontSize:10, fontWeight:700, opacity:0.65, lineHeight:1}}>
                      <BuIcons.chair size={10}/> {t.coperti}
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
              </div>
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
