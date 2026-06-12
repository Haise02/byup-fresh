// Sala — TableTile: tavolo visto dall'alto CON LE SEDIE, in liquid glass.
// Il corpo è la tessera glass (ricetta L2); le sedie sono sedili flat
// traslucidi che riprendono l'hue dello stato. Footprint e sedie si
// RICALCOLANO da seats + shape + orientation.
//
//   <TableTile numero={7} status="occupato" seats={6} shape="rect"
//              orientation="h" badge={['ALLERGIA']} .../>
//
// Geometria (px, scala 1): unità 78, raggio squircle 20, sedia 20×13 r7
// distanziata 5px dal bordo. round=cerchio Ø72 · square=78 · rect=2u (168)
// o 3u (258, >8 posti). orientation 'v' = rect ruotato 90°.

const TT_UNIT = 78;
const TT_RADIUS = 20;
const TT_GAP_UNIT = 12;          // giunto tra unità nei rect multi-unità
const TT_CHAIR_W = 20;           // larghezza sedile (lato parallelo al tavolo)
const TT_CHAIR_D = 13;           // profondità sedile
const TT_CHAIR_R = 7;
const TT_CHAIR_GAP = 5;          // distanza sedile ↔ bordo tavolo
const TT_PAD = TT_CHAIR_D + TT_CHAIR_GAP; // 18 — margine sedie attorno al corpo

const TT_ACCENTS = {
  libero:    { tint: 'rgba(22, 163, 74, 0.10)',  ring: 'rgba(22, 163, 74, 0.40)',  ink: '#15803D',
               seat: 'rgba(22, 163, 74, 0.22)',  back: 'rgba(22, 163, 74, 0.38)' },
  prenotato: { tint: 'rgba(124, 58, 237, 0.12)', ring: 'rgba(124, 58, 237, 0.38)', ink: '#6D28D9',
               seat: 'rgba(124, 58, 237, 0.22)', back: 'rgba(124, 58, 237, 0.36)' },
  occupato:  { tint: 'rgba(255, 90, 95, 0.18)',  ring: 'rgba(227, 36, 89, 0.42)',  ink: '#E32459',
               seat: 'rgba(255, 90, 95, 0.22)',  back: 'rgba(227, 36, 89, 0.36)' },
  dapulire:  { tint: 'rgba(217, 119, 6, 0.14)',  ring: 'rgba(217, 119, 6, 0.42)',  ink: '#B45309',
               seat: 'rgba(217, 119, 6, 0.22)',  back: 'rgba(217, 119, 6, 0.36)' },
};
const TT_LABELS = { libero: 'Libero', prenotato: 'Prenotato', occupato: 'Occupato', dapulire: 'Da pulire' };

// Forma derivata dai posti: 2-3 round · 4-5 square · 6+ rect
function ttSeatShape(seats) {
  return seats <= 3 ? 'round' : seats <= 5 ? 'square' : 'rect';
}

// Corpo tavolo in px da seats/shape/orientation (senza margine sedie)
function ttBodySize(seats, shape, orientation) {
  if (shape === 'round')  return { w: 72, h: 72 };
  if (shape === 'square') return { w: TT_UNIT, h: TT_UNIT };
  const units = seats > 8 ? 3 : 2;
  const long = units * TT_UNIT + (units - 1) * TT_GAP_UNIT; // 168 | 258
  return orientation === 'v' ? { w: TT_UNIT, h: long } : { w: long, h: TT_UNIT };
}

// Footprint in unità di cella della piantina (per il layout, step 3)
function ttFootprintUnits(seats, shape, orientation) {
  if (shape !== 'rect') return { w: 1, h: 1 };
  const units = seats > 8 ? 3 : 2;
  return orientation === 'v' ? { w: 1, h: units } : { w: units, h: 1 };
}

// Ingombro px del componente (corpo + corona sedie). 1 unità = 114px naturali:
// la piantina scala con scale = CELL / TT_UNIT_OUTER.
const TT_UNIT_OUTER = TT_UNIT + 2 * TT_PAD; // 114
function ttOuterSize(seats, shape, orientation) {
  const b = ttBodySize(seats, shape, orientation);
  return { w: b.w + 2 * TT_PAD, h: b.h + 2 * TT_PAD };
}

// Lista sedie: [{side:'top|bottom|left|right', frac}] — frac = posizione
// del centro lungo quel lato (0..1). Si ricalcola da seats+shape+orientation.
function ttChairs(seats, shape, orientation) {
  if (shape === 'round') {
    return [{ side: 'left', frac: 0.5 }, { side: 'right', frac: 0.5 }];
  }
  if (shape === 'square') {
    return [
      { side: 'top', frac: 0.5 }, { side: 'bottom', frac: 0.5 },
      { side: 'left', frac: 0.5 }, { side: 'right', frac: 0.5 },
    ];
  }
  // rect: lati corti 1 sedia, lati lunghi (seats-2)/2 a spaziatura uniforme
  const nLong = Math.max(1, Math.ceil((seats - 2) / 2));
  const longSides  = orientation === 'v' ? ['left', 'right'] : ['top', 'bottom'];
  const shortSides = orientation === 'v' ? ['top', 'bottom'] : ['left', 'right'];
  const chairs = [];
  longSides.forEach(side => {
    for (let i = 0; i < nLong; i++) chairs.push({ side, frac: (i + 0.5) / nLong });
  });
  shortSides.forEach(side => chairs.push({ side, frac: 0.5 }));
  return chairs;
}

// Sedile visto dall'alto: rounded-rect flat, lineetta schienale sul lato esterno
function TTChair({ side, x, y, acc, dim }) {
  const horiz = side === 'top' || side === 'bottom';
  const back = dim ? 'rgba(15,17,21,0.14)' : acc.back;
  const backrest = {
    top:    { borderTop:    `1.5px solid ${back}` },
    bottom: { borderBottom: `1.5px solid ${back}` },
    left:   { borderLeft:   `1.5px solid ${back}` },
    right:  { borderRight:  `1.5px solid ${back}` },
  }[side];
  return (
    <div style={{
      position: 'absolute', left: x, top: y,
      width:  horiz ? TT_CHAIR_W : TT_CHAIR_D,
      height: horiz ? TT_CHAIR_D : TT_CHAIR_W,
      borderRadius: TT_CHAIR_R,
      backgroundColor: 'rgba(255, 255, 255, 0.55)',
      backgroundImage: dim ? 'none' : `linear-gradient(0deg, ${acc.seat}, ${acc.seat})`,
      transition: 'left 230ms cubic-bezier(0.34, 1.45, 0.64, 1), top 230ms cubic-bezier(0.34, 1.45, 0.64, 1)',
      pointerEvents: 'none',
      ...backrest,
    }}/>
  );
}

function TableTile({
  numero, status = 'libero', seats = 4, shape = 'square', orientation = 'h',
  badge = [],
  density = (window.SALA_TILE_DENSITY || 'comfort'),
  dim, hovered, selected, dragging, mergeHint, alertTone,
  left, top,                  // posizione assoluta opzionale (piantina)
  scale = 1,                  // la piantina scala il disegno a CELL/TT_UNIT_OUTER
  onEnter, onLeave, onPointerDown, onClick,
  style, children,
}) {
  const acc = TT_ACCENTS[status] || TT_ACCENTS.libero;
  const body = ttBodySize(seats, shape, orientation);
  const W = body.w + 2 * TT_PAD;
  const H = body.h + 2 * TT_PAD;

  // Hairline interna: accento di stato; vira su coral in merge, rosso/ambra in alert
  const hair = mergeHint ? 'rgba(255, 90, 95, 0.60)'
    : alertTone === 'alert' ? 'rgba(220, 38, 38, 0.55)'
    : alertTone === 'warn'  ? 'rgba(161, 98, 7, 0.50)'
    : acc.ring;

  const shadow = dim
    ? '0 1px 3px rgba(80, 40, 80, 0.06)'
    : selected
      ? `inset 0 0 0 1.25px ${hair}, 0 0 0 2px rgba(255, 255, 255, 0.95), 0 0 0 4.5px rgba(255, 90, 95, 0.70), 0 18px 44px rgba(80, 40, 80, 0.20)`
      : mergeHint
        ? `inset 0 0 0 1.25px ${hair}, 0 0 0 3px rgba(255, 90, 95, 0.20), 0 12px 30px rgba(255, 90, 95, 0.16)`
        : dragging
          ? `inset 0 0 0 1.25px ${hair}, 0 22px 48px rgba(80, 40, 80, 0.22)`
          : hovered
            ? `inset 0 0 0 1.25px ${hair}, 0 18px 44px rgba(80, 40, 80, 0.16), 0 4px 10px rgba(80, 40, 80, 0.08)`
            : `inset 0 0 0 1.25px ${hair}, 0 12px 36px rgba(80, 40, 80, 0.10)`;

  const lifted = !dragging && !dim && (hovered || selected);
  const spring = 'cubic-bezier(0.34, 1.45, 0.64, 1)';

  // Posizioni sedie in px nel wrapper (corpo a TT_PAD,TT_PAD)
  const chairs = ttChairs(seats, shape, orientation).map((c, i) => {
    const horiz = c.side === 'top' || c.side === 'bottom';
    const along = horiz ? body.w : body.h;
    const center = TT_PAD + c.frac * along;
    let x, y;
    if (c.side === 'top')    { x = center - TT_CHAIR_W / 2; y = 0; }
    if (c.side === 'bottom') { x = center - TT_CHAIR_W / 2; y = H - TT_CHAIR_D; }
    if (c.side === 'left')   { x = 0;                       y = center - TT_CHAIR_W / 2; }
    if (c.side === 'right')  { x = W - TT_CHAIR_D;          y = center - TT_CHAIR_W / 2; }
    return <TTChair key={`${c.side}-${i}`} side={c.side} x={x} y={y} acc={acc} dim={dim}/>;
  });

  return (
    <div
      onMouseEnter={onEnter} onMouseLeave={onLeave}
      onPointerDown={onPointerDown} onClick={onClick}
      style={{
        position: left != null ? 'absolute' : 'relative',
        ...(left != null ? { left, top } : {}),
        width: W, height: H,
        transform: scale !== 1 ? `scale(${scale})` : undefined,
        transformOrigin: 'top left',
        transition: dragging ? 'none'
          : `width 230ms ${spring}, height 230ms ${spring}, left 230ms ${spring}, top 230ms ${spring}`,
        cursor: onClick || onPointerDown ? (dragging ? 'grabbing' : 'grab') : 'default',
        zIndex: selected ? 6 : (dragging ? 10 : (hovered ? 5 : 1)),
        userSelect: 'none', touchAction: 'none',
        ...style,
      }}>
      {chairs}
      {/* Corpo tavolo — tessera glass */}
      <div style={{
        position: 'absolute', left: TT_PAD, top: TT_PAD,
        width: body.w, height: body.h,
        backgroundColor: dim ? 'rgba(255, 255, 255, 0.48)' : 'rgba(255, 255, 255, 0.56)',
        backgroundImage: dim ? 'none' : [
          'linear-gradient(180deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.08) 55%, rgba(255,255,255,0) 100%)',
          `linear-gradient(0deg, ${acc.tint}, ${acc.tint})`,
        ].join(', '),
        backdropFilter: 'blur(20px) saturate(140%)',
        WebkitBackdropFilter: 'blur(20px) saturate(140%)',
        border: `1px solid rgba(255, 255, 255, ${dim ? 0.6 : 0.8})`,
        borderRadius: shape === 'round' ? '50%' : TT_RADIUS,
        boxShadow: shadow,
        transform: lifted ? 'translateY(-2px) scale(1.02)' : 'translateY(0) scale(1)',
        transition: dragging ? 'none' : [
          `width 230ms ${spring}`, `height 230ms ${spring}`,
          `border-radius 230ms ${spring}`,
          'box-shadow 240ms cubic-bezier(0.22, 1, 0.36, 1)',
          'transform 240ms cubic-bezier(0.22, 1, 0.36, 1)',
          'opacity 180ms ease',
        ].join(', '),
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        opacity: dim ? (hovered ? 0.65 : 0.40) : 1,
        filter: dim ? 'grayscale(1)' : 'none',
        overflow: 'hidden',
      }}>
        <div style={{
          fontSize: 16, fontWeight: 800, lineHeight: 1,
          color: dim ? '#9CA3AF' : '#0F1115',
          fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.01em',
        }}>{numero}</div>
        {density === 'comfort' && !dim && (
          <div style={{
            fontSize: 9.5, fontWeight: 700, lineHeight: 1,
            letterSpacing: 0.5, textTransform: 'uppercase',
            color: acc.ink, opacity: 0.85, marginTop: 3,
            whiteSpace: 'nowrap',
          }}>{TT_LABELS[status] || status}</div>
        )}
      </div>
      {/* Badge ALLERGIA — chip critico, fuori dal corpo */}
      {badge.includes('ALLERGIA') && !dim && (
        <div style={{
          position: 'absolute', bottom: TT_PAD - 10, left: TT_PAD - 8,
          background: '#DC2626', color: '#fff',
          padding: '2px 6px 2px 4px', borderRadius: 999,
          border: '1.5px solid #fff',
          fontSize: 9, fontWeight: 700, letterSpacing: 0.3,
          boxShadow: '0 1px 3px rgba(220,38,38,0.35)',
          whiteSpace: 'nowrap', zIndex: 6,
        }}>ALLERGIA</div>
      )}
      {children}
    </div>
  );
}

window.TableTile = TableTile;
window.ttFootprintUnits = ttFootprintUnits;
window.ttBodySize = ttBodySize;
window.ttOuterSize = ttOuterSize;
window.ttSeatShape = ttSeatShape;
window.TT_UNIT_OUTER = TT_UNIT_OUTER;
