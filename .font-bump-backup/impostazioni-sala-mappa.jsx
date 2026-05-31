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
  tavoli, furniture, groups, selected,
  onCreateTable, onCreateFurniture,
  onMoveTable, onBulkMoveTables, onMoveFurniture, onResizeFurniture, onDeleteFurniture,
  onMergeTables, onUngroupTables, onSelectTable, onEditTable,
}) {
  const COLS = 10, ROWS = 6;
  const [canvasWidth, setCanvasWidth] = React.useState(COLS * 60);
  const CELL = canvasWidth / COLS;
  const canvasRef = React.useRef(null);
  const [drag, setDrag] = React.useState(null);
  const [hover, setHover] = React.useState(null); // {kind, x, y, w, h}
  const [dragOverTable, setDragOverTable] = React.useState(null);
  const [paletteDrag, setPaletteDrag] = React.useState(null); // {type: 'table' | 'furniture-X'}
  const [selectedFurniture, setSelectedFurniture] = React.useState(null);
  const [mergeProposal, setMergeProposal] = React.useState(null); // {sourceId, targetId, snapPos, originalPos}
  const justDraggedRef = React.useRef(false);

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
    setMergeProposal(null);
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
          // Evidenzia tavoli adiacenti durante il drag (gap ≤ 0.5)
          const myGroup = groupOf(drag.id);
          const srcRect = { x: newX, y: newY, w: 1, h: 1 };
          const gapFn = (a, b) => Math.max(Math.max(a.x-(b.x+b.w), b.x-(a.x+a.w), 0), Math.max(a.y-(b.y+b.h), b.y-(a.y+a.h), 0));
          const adjacent = tavoli.find(t => t.id !== drag.id && !(myGroup?.tableIds.includes(t.id)) && gapFn(srcRect, { x: t.pos.x, y: t.pos.y, w: 1, h: 1 }) <= 0.5);
          setDragOverTable(adjacent ? adjacent.id : null);
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
      // Proposta di unione per tavoli adiacenti (solo tavoli singoli non raggruppati)
      if (drag.kind === 'table' && drag.hasMoved) {
        const myGroup = groupOf(drag.id);
        if (!myGroup) {
          const src = tavoli.find(t => t.id === drag.id);
          if (src) {
            const gapFn = (a, b) => Math.max(Math.max(a.x-(b.x+b.w), b.x-(a.x+a.w), 0), Math.max(a.y-(b.y+b.h), b.y-(a.y+a.h), 0));
            const srcRect = { x: src.pos.x, y: src.pos.y, w: 1, h: 1 };
            let nearest = null, nearestGap = Infinity;
            for (const t of tavoli) {
              if (t.id === drag.id) continue;
              const g = gapFn(srcRect, { x: t.pos.x, y: t.pos.y, w: 1, h: 1 });
              if (g <= 0.5 && g < nearestGap) { nearest = t; nearestGap = g; }
            }
            if (nearest) {
              const srcCx = src.pos.x + 0.5, srcCy = src.pos.y + 0.5;
              const tgtCx = nearest.pos.x + 0.5, tgtCy = nearest.pos.y + 0.5;
              const dx = srcCx - tgtCx, dy = srcCy - tgtCy;
              let snapPos;
              if (Math.abs(dx) >= Math.abs(dy)) {
                snapPos = dx > 0 ? { x: nearest.pos.x + 1, y: nearest.pos.y } : { x: nearest.pos.x - 1, y: nearest.pos.y };
              } else {
                snapPos = dy > 0 ? { x: nearest.pos.x, y: nearest.pos.y + 1 } : { x: nearest.pos.x, y: nearest.pos.y - 1 };
              }
              const originalPos = { x: src.pos.x, y: src.pos.y };
              onMoveTable(drag.id, snapPos);
              setMergeProposal({ sourceId: drag.id, targetId: nearest.id, snapPos, originalPos });
              justDraggedRef.current = true;
              setDrag(null);
              setDragOverTable(null);
              return;
            }
          }
        }
      }
      if (drag.kind === 'table' && drag.hasMoved && onBulkMoveTables) {
        // Risolvi collisioni: spingi i tavoli fuori gruppo che si sovrappongono al gruppo mosso
        const movedIds = new Set(groupMates(drag.id));
        const movedRects = tavoli.filter(t => movedIds.has(t.id)).map(t => ({ id: t.id, ...t.pos, ...tableDims(t) }));
        const others = tavoli.filter(t => !movedIds.has(t.id));
        const updates = {};
        const occupied = [...movedRects];
        others.forEach(o => {
          const orect = { x: o.pos.x, y: o.pos.y, ...tableDims(o) };
          const collide = movedRects.some(mr => overlapRects(mr, orect));
          if (collide) {
            const others2 = others.filter(x => x.id !== o.id).map(x => ({ x: (updates[x.id]?.x ?? x.pos.x), y: (updates[x.id]?.y ?? x.pos.y), ...tableDims(x) }));
            const spot = findFreeSpot(o, o.pos.x, o.pos.y, [...occupied, ...others2]);
            updates[o.id] = { x: spot.x, y: spot.y };
            occupied.push({ id: o.id, ...spot, ...tableDims(o) });
          }
        });
        if (Object.keys(updates).length) onBulkMoveTables(updates);
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
          onCreateTable({ x: snap(x - TABLE_SCALE / 2), y: snap(y - TABLE_SCALE / 2)});
        } else {
          const ft = FURNITURE_TYPES.find(f => f.kind === paletteDrag.kind);
          onCreateFurniture({
            kind: ft.kind, label: ft.label, color: ft.color, textColor: ft.textColor,
            x: snap(x - ft.defaultW/2), y: snap(y - ft.defaultH/2),
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

  return (
    <div style={{display:'grid', gridTemplateColumns:'200px 1fr', gap: 14}}>
      {/* TOOLBOX */}
      <aside style={{
        background: '#FAFBFC', border:`1px solid ${PN.BORDER_SOFT}`,
        borderRadius: 12, padding: 12, alignSelf:'start',
        position:'sticky', top: 80,
      }}>
        <div style={{fontSize: 10.5, fontWeight: 800, color: PN.MUTED, letterSpacing: 0.6, textTransform:'uppercase', marginBottom: 10, padding:'0 4px'}}>
          Trascina sulla mappa
        </div>

        <div style={{fontSize: 11, fontWeight: 700, color: PN.TEXT, marginBottom: 6, padding: '0 4px'}}>Tavoli</div>
        <button
          onClick={() => {
            const tableOverlap = (x, y) => tavoli.some(t => Math.abs(t.x - x) < TABLE_SCALE && Math.abs(t.y - y) < TABLE_SCALE);
            const furnOverlap = (x, y) => furniture.some(f => x < f.x + f.w && x + TABLE_SCALE > f.x && y < f.y + f.h && y + TABLE_SCALE > f.y);
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
            border: `1.5px solid ${PN.PINK}`, background: PN.PINK_SOFT,
            borderRadius: 9, cursor:'pointer', fontFamily:'inherit',
            display:'flex', alignItems:'center', justifyContent:'center', gap: 8,
          }}
        >
          <BuIcons.plus size={16} color={PN.PINK_DARK}/>
          <span style={{fontSize: 11.5, fontWeight: 700, color: PN.PINK_DARK}}>Aggiungi tavolo</span>
        </button>

        <div style={{fontSize: 11, fontWeight: 700, color: PN.TEXT, marginBottom: 6, padding: '0 4px'}}>Arredo e struttura</div>
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
              <span style={{fontSize: 10.5, fontWeight: 600, color: PN.TEXT}}>{ft.label}</span>
            </button>
          ))}
        </div>

        <div style={{
          marginTop: 14, padding: 10,
          background: PN.WHITE, border: `1px solid ${PN.BORDER_SOFT}`, borderRadius: 8,
          fontSize: 11, color: PN.MUTED, lineHeight: 1.5,
        }}>
          <BuIcons.bulb size={12} color={PN.AMBER}/> Avvicina un tavolo a un altro per proporre unione. Trascina un elemento <b>fuori dalla mappa</b> per eliminarlo.
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
                  fontSize: 11, fontWeight: 700,
                  cursor: drag?.id === f.id ? 'grabbing' : 'grab',
                  outline: isSelected ? `2px solid ${PN.PINK}` : 'none',
                  outlineOffset: 2,
                  userSelect:'none',
                  boxShadow: drag?.id === f.id ? '0 8px 20px rgba(0,0,0,0.18)' : 'none',
                  zIndex: 1,
                }}
              >
                {f.h * CELL > 30 && f.w * CELL > 80 && (
                  <span style={{fontSize: 11, fontWeight: 700, padding:'0 8px', textAlign:'center'}}>{f.label}</span>
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
                          cursor:'pointer', fontSize: 11, fontWeight: 700,
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
                        cursor:'pointer', fontSize: 12, fontWeight: 700,
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
                    fontSize: 10, fontWeight: 700, padding:'2px 7px', borderRadius: 4,
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
            const isMergeTarget = dragOverTable === t.id;
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
                  background: t.disabled ? '#F4F5F7' : (isSel ? PN.PINK : PN.PINK_SOFT),
                  border: `2px solid ${isMergeTarget ? PN.GREEN : (isSel ? PN.PINK_DARK : PN.PINK)}`,
                  borderRadius: 8,
                  display:'grid', placeItems:'center',
                  cursor: isDrag ? 'grabbing' : 'grab',
                  fontSize: 13, fontWeight: 800,
                  color: t.disabled ? PN.MUTED : (isSel ? PN.WHITE : PN.PINK_DARK),
                  userSelect:'none',
                  boxShadow: isDrag ? '0 10px 24px rgba(216,118,143,0.4)' : (isMergeTarget ? `0 0 0 4px ${PN.GREEN_SOFT}` : 'none'),
                  zIndex: isDrag ? 10 : 3,
                  opacity: t.disabled ? 0.7 : 1,
                  transition: isDrag ? 'none' : 'box-shadow 0.15s',
                }}
              >
                <div style={{display:'flex', flexDirection:'column', alignItems:'center', lineHeight:1, gap:1}}>
                  <span style={{fontSize:13, fontWeight:800, lineHeight:1}}>
                    {t.coperti}<span style={{fontSize:8, fontWeight:700, opacity:0.7}}>p</span>
                  </span>
                  <span style={{fontSize:8, fontWeight:700, opacity:0.65, letterSpacing:0.2, lineHeight:1, marginTop:1}}>
                    {t.name}
                  </span>
                </div>
                {t.disabled && (
                  <div style={{
                    position:'absolute', bottom: -16,
                    left:'50%', transform:'translateX(-50%)',
                    fontSize: 8.5, fontWeight: 800, letterSpacing: 0.4,
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

          {/* Chip proposta di unione tavoli adiacenti */}
          {mergeProposal && (() => {
            const src = tavoli.find(t => t.id === mergeProposal.sourceId);
            const tgt = tavoli.find(t => t.id === mergeProposal.targetId);
            if (!src || !tgt) return null;
            const midX = ((src.pos.x + tgt.pos.x) / 2 + 0.5) * CELL;
            const midY = ((src.pos.y + tgt.pos.y) / 2 + 0.5) * CELL;
            return (
              <div style={{
                position: 'absolute',
                left: midX, top: midY,
                transform: 'translate(-50%, -50%)',
                background: PN.WHITE,
                border: `1.5px solid ${PN.PINK}`,
                borderRadius: 10,
                padding: '8px 10px',
                display: 'flex', alignItems: 'center', gap: 6,
                boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
                zIndex: 30,
                whiteSpace: 'nowrap',
              }}>
                <span style={{fontSize: 11.5, fontWeight: 600, color: PN.TEXT}}>Unire i tavoli?</span>
                <button
                  onClick={() => {
                    const src = tavoli.find(t => t.id === mergeProposal.sourceId);
                    const tgt = tavoli.find(t => t.id === mergeProposal.targetId);
                    if (src && tgt) {
                      const dx = (src.pos.x + 0.5) - (tgt.pos.x + 0.5);
                      // Trova il bordo esterno del gruppo target nella direzione dell'avvicinamento
                      const tgtGroup = groups.find(g => g.tableIds.includes(mergeProposal.targetId));
                      const groupTables = tgtGroup
                        ? tavoli.filter(t => tgtGroup.tableIds.includes(t.id))
                        : [tgt];
                      let finalPos;
                      if (dx >= 0) {
                        const edge = groupTables.reduce((m, t) => t.pos.x > m.pos.x ? t : m, groupTables[0]);
                        finalPos = { x: edge.pos.x + 1, y: edge.pos.y };
                      } else {
                        const edge = groupTables.reduce((m, t) => t.pos.x < m.pos.x ? t : m, groupTables[0]);
                        finalPos = { x: edge.pos.x - 1, y: edge.pos.y };
                      }
                      onMoveTable(mergeProposal.sourceId, finalPos);
                    }
                    onMergeTables(mergeProposal.sourceId, mergeProposal.targetId);
                    setMergeProposal(null);
                  }}
                  style={{
                    padding: '4px 10px', fontSize: 11, fontWeight: 700,
                    background: PN.PINK, color: PN.WHITE,
                    border: 'none', borderRadius: 6, cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >Unisci</button>
                <button
                  onClick={() => {
                    onMoveTable(mergeProposal.sourceId, mergeProposal.originalPos);
                    setMergeProposal(null);
                  }}
                  style={{
                    padding: '4px 10px', fontSize: 11, fontWeight: 700,
                    background: 'transparent', color: PN.MUTED,
                    border: `1px solid ${PN.BORDER_SOFT}`, borderRadius: 6, cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >Annulla</button>
              </div>
            );
          })()}

          {/* Empty state */}
          {tavoli.length === 0 && furniture.length === 0 && !paletteDrag && (
            <div style={{
              position:'absolute', inset: 0,
              display:'grid', placeItems:'center',
              pointerEvents:'none',
            }}>
              <div style={{textAlign:'center', color: PN.MUTED}}>
                <div style={{display:'inline-flex', marginBottom: 10, color: PN.MUTED_SOFT}}><BuIcons.table size={36}/></div>
                <div style={{fontSize: 14, fontWeight: 700, color: PN.TEXT, marginBottom: 4}}>Inizia a disegnare la tua sala</div>
                <div style={{fontSize: 12.5}}>Trascina un tavolo o un elemento di arredo dal pannello a sinistra</div>
              </div>
            </div>
          )}
        </div>

        {/* Legenda mappa */}
        <div style={{
          marginTop: 10, display:'flex', gap: 16, flexWrap:'wrap',
          fontSize: 11, color: PN.MUTED,
        }}>
          <span style={{display:'inline-flex', alignItems:'center', gap: 5}}><BuIcons.grid size={11}/> Snap a 0.5 unità</span>
          <span style={{display:'inline-flex', alignItems:'center', gap: 5}}><BuIcons.cursor size={11}/> Click sull'arredo per selezionare e ridimensionare</span>
          <span style={{display:'inline-flex', alignItems:'center', gap: 5}}><BuIcons.link size={11}/> Avvicina un tavolo ad un altro per unirli</span>
        </div>
      </div>
    </div>
  );
}

window.FloorPlan = FloorPlan;
