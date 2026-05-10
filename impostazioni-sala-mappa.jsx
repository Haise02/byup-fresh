// Mappa sala — versione pro: toolbox elementi a sx, drag-to-place, merge tavoli, arredo con resize

const FURNITURE_TYPES = [
  { kind: 'kitchen', label: 'Cucina', iconKey: 'kitchen', defaultW: 2.5, defaultH: 1.4, color: '#7c2436', textColor: '#FFF' },
  { kind: 'bathroom', label: 'Bagno', iconKey: 'bathroom', defaultW: 1.4, defaultH: 1.2, color: '#85B8CB', textColor: '#FFF' },
  { kind: 'wall', label: 'Muro', iconKey: 'wall', defaultW: 3, defaultH: 0.18, color: '#3F1424', textColor: '#FFF' },
  { kind: 'pillar', label: 'Colonna', iconKey: 'pillar', defaultW: 0.6, defaultH: 0.6, color: '#5A4A52', textColor: '#FFF' },
  { kind: 'door', label: 'Porta', iconKey: 'door', defaultW: 1.2, defaultH: 0.18, color: '#C5A878', textColor: '#FFF' },
];

// Icone illustrative con profondità (axonometric / soft 3D)
// Layered fills usando la stessa color con alpha diverse → leggibili su sfondo chiaro (PN.MUTED)
// e su sfondo scuro (color="#FFF" dentro i blocchi piazzati sulla mappa)
const FurnIcon = ({ kind, size = 20, color = PN.MUTED }) => {
  switch (kind) {
    case 'kitchen': // piano cottura visto dall'alto
      return (
        <svg width={size} height={size} viewBox="0 0 24 24">
          <rect x="3" y="4" width="18" height="17" rx="2.5" fill={color} opacity="0.16"/>
          <rect x="3" y="4" width="18" height="17" rx="2.5" fill="none" stroke={color} strokeWidth="1.3"/>
          <rect x="4.8" y="5.6" width="14.4" height="2.2" rx="0.6" fill={color} opacity="0.55"/>
          <circle cx="8.5" cy="13.5" r="2.2" fill={color} opacity="0.85"/>
          <circle cx="15.5" cy="13.5" r="2.2" fill={color} opacity="0.85"/>
          <circle cx="8.5" cy="18" r="1.3" fill={color} opacity="0.45"/>
          <circle cx="15.5" cy="18" r="1.3" fill={color} opacity="0.45"/>
        </svg>
      );
    case 'bathroom': // wc in pianta
      return (
        <svg width={size} height={size} viewBox="0 0 24 24">
          <rect x="7" y="2.5" width="10" height="6.5" rx="1.4" fill={color} opacity="0.55"/>
          <rect x="7" y="2.5" width="10" height="6.5" rx="1.4" fill="none" stroke={color} strokeWidth="1.2"/>
          <ellipse cx="12" cy="14.5" rx="6" ry="4.6" fill={color} opacity="0.22"/>
          <ellipse cx="12" cy="14.5" rx="6" ry="4.6" fill="none" stroke={color} strokeWidth="1.3"/>
          <ellipse cx="12" cy="14.5" rx="3.6" ry="2.6" fill={color} opacity="0.35"/>
          <line x1="9" y1="20" x2="15" y2="20" stroke={color} strokeWidth="1.4" strokeLinecap="round" opacity="0.7"/>
        </svg>
      );
    case 'wall': // muro 3D (top + front face)
      return (
        <svg width={size} height={size} viewBox="0 0 24 24">
          <polygon points="2,9 6,5 22,5 18,9" fill={color} opacity="0.55"/>
          <polygon points="2,9 18,9 18,20 2,20" fill={color} opacity="0.85"/>
          <polygon points="18,9 22,5 22,16 18,20" fill={color} opacity="0.35"/>
          <polygon points="2,9 6,5 22,5 22,16 18,20 2,20" fill="none" stroke={color} strokeWidth="1.2" strokeLinejoin="round"/>
          <line x1="18" y1="9" x2="2" y2="9" stroke={color} strokeWidth="1.1"/>
          <line x1="18" y1="9" x2="22" y2="5" stroke={color} strokeWidth="1.1"/>
          <line x1="18" y1="9" x2="18" y2="20" stroke={color} strokeWidth="1.1"/>
          <line x1="10" y1="9" x2="10" y2="14" stroke={color} strokeWidth="0.7" opacity="0.5"/>
          <line x1="2" y1="14" x2="18" y2="14" stroke={color} strokeWidth="0.7" opacity="0.5"/>
          <line x1="6" y1="14" x2="6" y2="20" stroke={color} strokeWidth="0.7" opacity="0.5"/>
          <line x1="14" y1="14" x2="14" y2="20" stroke={color} strokeWidth="0.7" opacity="0.5"/>
        </svg>
      );
    case 'pillar': // cilindro 3D
      return (
        <svg width={size} height={size} viewBox="0 0 24 24">
          <ellipse cx="12" cy="20.5" rx="5.5" ry="1.6" fill={color} opacity="0.25"/>
          <path d="M6.5 5 v15 a5.5 1.8 0 0 0 11 0 v-15 z" fill={color} opacity="0.6"/>
          <path d="M6.5 5 a5.5 1.8 0 0 0 11 0 a5.5 1.8 0 0 0 -11 0" fill={color} opacity="0.95"/>
          <path d="M6.5 5 v15 a5.5 1.8 0 0 0 11 0 v-15" fill="none" stroke={color} strokeWidth="1.2"/>
          <path d="M6.5 5 a5.5 1.8 0 0 0 11 0" fill="none" stroke={color} strokeWidth="1.2"/>
        </svg>
      );
    case 'door': // porta con profondità
      return (
        <svg width={size} height={size} viewBox="0 0 24 24">
          <polygon points="6,3 18,3 18,21 6,21" fill={color} opacity="0.22"/>
          <polygon points="18,3 21,5 21,21 18,21" fill={color} opacity="0.5"/>
          <polygon points="6,3 18,3 21,5" fill={color} opacity="0.35"/>
          <polygon points="6,3 18,3 21,5 21,21 18,21 6,21" fill="none" stroke={color} strokeWidth="1.3" strokeLinejoin="round"/>
          <line x1="18" y1="3" x2="18" y2="21" stroke={color} strokeWidth="1.2"/>
          <circle cx="9" cy="13" r="0.95" fill={color}/>
          <line x1="3" y1="21" x2="21" y2="21" stroke={color} strokeWidth="1.2" opacity="0.55"/>
        </svg>
      );
    default: return null;
  }
};

function FloorPlan({
  tavoli, furniture, groups, selected,
  onCreateTable, onCreateFurniture,
  onMoveTable, onMoveFurniture, onResizeFurniture, onDeleteFurniture,
  onMergeTables, onUngroupTables, onSelectTable, onEditTable,
}) {
  const COLS = 10, ROWS = 6, CELL = 60;
  const W = COLS * CELL, H = ROWS * CELL;
  const canvasRef = React.useRef(null);
  const [drag, setDrag] = React.useState(null);
  const [hover, setHover] = React.useState(null); // {kind, x, y, w, h}
  const [dragOverTable, setDragOverTable] = React.useState(null);
  const [paletteDrag, setPaletteDrag] = React.useState(null); // {type: 'table' | 'furniture-X'}
  const [selectedFurniture, setSelectedFurniture] = React.useState(null);
  const justDraggedRef = React.useRef(false);

  const toGrid = (clientX, clientY) => {
    const r = canvasRef.current.getBoundingClientRect();
    const x = (clientX - r.left) / CELL;
    const y = (clientY - r.top) / CELL;
    return { x: Math.max(0, Math.min(COLS, x)), y: Math.max(0, Math.min(ROWS, y)) };
  };
  const snap = v => Math.round(v * 2) / 2;

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
        onMoveTable(drag.id, { x: newX, y: newY });
        // Verifica overlap con altro tavolo per merge
        const overlap = tavoli.find(t => t.id !== drag.id && Math.abs(t.pos.x - newX) < 1 && Math.abs(t.pos.y - newY) < 1);
        setDragOverTable(overlap?.id || null);
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
      if (drag.kind === 'table' && dragOverTable !== null) {
        onMergeTables(drag.id, dragOverTable);
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
        setHover({ type: 'table', x: snap(x - 0.4), y: snap(y - 0.4) });
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
          onCreateTable({ x: snap(x - 0.4), y: snap(y - 0.4) });
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
          onPointerDown={() => setPaletteDrag({type: 'table'})}
          style={{
            width: '100%', padding: 12, marginBottom: 12,
            border: `1.5px dashed ${PN.PINK}`, background: PN.PINK_SOFT,
            borderRadius: 9, cursor:'grab', fontFamily:'inherit',
            display:'flex', flexDirection:'column', alignItems:'center', gap: 6,
          }}
        >
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: PN.PINK, color: PN.WHITE,
            display:'grid', placeItems:'center',
            fontSize: 11, fontWeight: 800,
          }}>4</div>
          <span style={{fontSize: 11.5, fontWeight: 700, color: PN.PINK_DARK}}>Nuovo tavolo</span>
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
              <span style={{display:'inline-flex'}}><FurnIcon kind={ft.iconKey} size={22} color={ft.color}/></span>
              <span style={{fontSize: 10.5, fontWeight: 600, color: PN.TEXT}}>{ft.label}</span>
            </button>
          ))}
        </div>

        <div style={{
          marginTop: 14, padding: 10,
          background: PN.WHITE, border: `1px solid ${PN.BORDER_SOFT}`, borderRadius: 8,
          fontSize: 11, color: PN.MUTED, lineHeight: 1.5,
        }}>
          <BuIcons.bulb size={12} color={PN.AMBER}/> Trascina un tavolo <b>sopra un altro</b> per unirli. Trascina un elemento <b>fuori dalla mappa</b> per eliminarlo.
        </div>
      </aside>

      {/* CANVAS */}
      <div>
        <div
          ref={canvasRef}
          style={{
            position:'relative',
            width: W, height: H, maxWidth:'100%',
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
                {f.h * CELL > 30 && <span style={{display:'flex', alignItems:'center', gap: 4, padding:'0 8px', textAlign:'center'}}>
                  <span style={{display:'inline-flex'}}><FurnIcon kind={ft.iconKey} size={14} color={f.textColor || '#FFF'}/></span>
                  {f.w * CELL > 80 && <span style={{fontSize: 11, fontWeight: 700}}>{f.label}</span>}
                </span>}
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

          {/* Gruppi tavoli (sfondo tratteggiato) */}
          {groups.map(g => {
            const ts = tavoli.filter(t => g.tableIds.includes(t.id));
            if (ts.length < 2) return null;
            const minX = Math.min(...ts.map(t => t.pos.x)) - 0.15;
            const minY = Math.min(...ts.map(t => t.pos.y)) - 0.15;
            const maxX = Math.max(...ts.map(t => t.pos.x)) + 0.95;
            const maxY = Math.max(...ts.map(t => t.pos.y)) + 0.95;
            const totalCop = ts.reduce((a,t) => a + t.coperti, 0);
            return (
              <div key={g.id} style={{
                position:'absolute',
                left: minX * CELL, top: minY * CELL,
                width: (maxX - minX) * CELL, height: (maxY - minY) * CELL,
                border: `2px dashed ${PN.PINK}`, borderRadius: 12,
                background: 'rgba(216,118,143,0.06)',
                pointerEvents:'none',
                zIndex: 2,
              }}>
                <div style={{
                  position:'absolute', top: -11, left: 8,
                  background: PN.PINK, color: PN.WHITE,
                  fontSize: 10, fontWeight: 700, padding:'2px 7px', borderRadius: 4,
                  pointerEvents:'auto', display:'flex', alignItems:'center', gap: 5,
                }}>
                  Unione · {totalCop} cop
                  <button
                    onClick={() => onUngroupTables(g.id)}
                    title="Separa"
                    style={{
                      background:'rgba(255,255,255,0.25)', border:'none',
                      color: PN.WHITE, cursor:'pointer',
                      width: 16, height: 16, borderRadius: 3,
                      display:'grid', placeItems:'center', fontSize: 10,
                    }}
                  ><BuIcons.split size={11} color={PN.WHITE}/></button>
                </div>
              </div>
            );
          })}

          {/* Tavoli */}
          {tavoli.map(t => {
            const isSel = selected.has(t.id);
            const isDrag = drag?.kind === 'table' && drag?.id === t.id;
            const isMergeTarget = dragOverTable === t.id;
            return (
              <div
                key={t.id}
                onPointerDown={(e) => handleMouseDown(e, 'table', t.id, 0.4, 0.4)}
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
                  width: t.shape === 'rect' ? CELL * 1.4 : CELL * 0.85,
                  height: t.shape === 'rect' ? CELL * 0.7 : CELL * 0.85,
                  background: t.disabled ? '#F4F5F7' : (isSel ? PN.PINK : PN.PINK_SOFT),
                  border: `2px solid ${isMergeTarget ? PN.GREEN : (isSel ? PN.PINK_DARK : PN.PINK)}`,
                  borderRadius: t.shape === 'round' ? '50%' : 8,
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
                {t.coperti}
                <div style={{
                  position:'absolute', top: t.shape === 'rect' ? -16 : -18,
                  left:'50%', transform:'translateX(-50%)',
                  fontSize: 10, fontWeight: 700,
                  color: PN.TEXT,
                  whiteSpace:'nowrap', pointerEvents:'none',
                  background: PN.WHITE, padding: '1px 6px', borderRadius: 4,
                  border: `1px solid ${PN.BORDER_SOFT}`,
                }}>
                  {t.name}
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
              width: (hover.type === 'table' ? 0.85 : hover.w) * CELL,
              height: (hover.type === 'table' ? 0.85 : hover.h) * CELL,
              border: `2px dashed ${PN.PINK}`,
              background: 'rgba(216,118,143,0.18)',
              borderRadius: hover.type === 'table' ? '50%' : 8,
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
          <span style={{display:'inline-flex', alignItems:'center', gap: 5}}><BuIcons.link size={11}/> Trascina tavolo su tavolo per unirli</span>
        </div>
      </div>
    </div>
  );
}

window.FloorPlan = FloorPlan;
