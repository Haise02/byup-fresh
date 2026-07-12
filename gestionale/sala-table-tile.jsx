// Sala — TableTile: tavolo visto dall'alto CON LE SEDIE, in liquid glass.
// Il corpo è la tessera glass (ricetta L2); le sedie sono sedili flat
// traslucidi che riprendono l'hue dello stato. Footprint e sedie si
// RICALCOLANO da seats + shape + orientation.
//
//   <TableTile numero={7} status="occupato" seats={6} shape="rect"
//              orientation="h" badge={['ALLERGIA']} .../>
//
// Geometria: il CORPO riempie la cella della griglia (96px, numero "T3"
// leggibile a scala reale); le SEDIE escono dal corpo nel GUTTER tra le
// celle (overflow:visible, ~6px dal bordo). Il gutter minimo della mappa
// è 2×(gap+profondità sedia) = 38px così le sedie di tavoli adiacenti
// non si toccano. Collisioni/footprint = SOLO corpo (celle).
// round=cerchio Ø92 · square=96 · rect=2u/3u come pezzo unico che copre
// anche il gutter interno. orientation 'v' = rect ruotato 90°.

const TT_UNIT = 96;              // corpo di 1 cella
const TT_RADIUS = 22;
const TT_CHAIR_W = 20;           // larghezza sedile (lato parallelo al tavolo)
const TT_CHAIR_D = 13;           // profondità sedile
const TT_CHAIR_R = 7;
const TT_CHAIR_GAP = 6;          // distanza sedile ↔ bordo corpo
const TT_CHAIR_OUT = TT_CHAIR_D + TT_CHAIR_GAP;  // 19 — sporgenza sedia oltre il corpo
const TT_GUTTER = 2 * TT_CHAIR_OUT + 4;          // 42 — gutter tra celle: 2 sporgenze + 4px d'aria

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
const TT_LABELS = { libero: 'Libero', prenotato: 'Prenotato', occupato: 'Occupato', dapulire: 'Da liberare' };

// Forma derivata dai posti: 2-5 square · 6+ rect.
// (La shape 'round' è stata ritirata: sotto il 120% di zoom la label di
// stato sforava dal cerchio; il quadrato usa tutta la cella.)
function ttSeatShape(seats) {
  return seats <= 5 ? 'square' : 'rect';
}

// Corpo tavolo in px da seats/shape/orientation (solo corpo, sedie escluse).
// `unit` = lato del corpo per 1 cella; `pitch` = passo cella della griglia
// (serve ai rect multi-cella, che sono un pezzo unico e coprono anche i
// gutter interni). Senza argomenti usa la geometria naturale (demo).
function ttBodySize(seats, shape, orientation, unit = TT_UNIT, pitch = null) {
  const p = pitch != null ? pitch : unit + TT_GUTTER * (unit / TT_UNIT);
  if (shape === 'round')  { const d = unit - 4 * (unit / TT_UNIT); return { w: d, h: d }; }
  if (shape === 'square') return { w: unit, h: unit };
  const units = seats > 8 ? 3 : 2;
  const long = (units - 1) * p + unit;
  return orientation === 'v' ? { w: unit, h: long } : { w: long, h: unit };
}

// Metriche sedie: scalano dolcemente col corpo ma con un pavimento (0.55)
// così restano leggibili anche su celle piccole.
function ttChairMetrics(unit = TT_UNIT) {
  const k = Math.max(0.55, Math.min(1, unit / TT_UNIT));
  return {
    cw: TT_CHAIR_W * k,                 // larghezza sedile
    cd: TT_CHAIR_D * k,                 // profondità sedile
    gap: TT_CHAIR_GAP * k,              // distanza dal corpo
    out: TT_CHAIR_OUT * k,              // sporgenza totale oltre il corpo
    r: TT_CHAIR_R * k,
  };
}

// Footprint in unità di cella della piantina (per il layout, step 3)
function ttFootprintUnits(seats, shape, orientation) {
  if (shape !== 'rect') return { w: 1, h: 1 };
  const units = seats > 8 ? 3 : 2;
  return orientation === 'v' ? { w: 1, h: units } : { w: units, h: 1 };
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
function TTChair({ side, x, y, acc, dim, m }) {
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
      width:  horiz ? m.cw : m.cd,
      height: horiz ? m.cd : m.cw,
      borderRadius: m.r,
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
  hideChairSides = [],        // lati senza sedie (es. lato di contatto nei tavoli uniti)
  left, top,                  // posizione assoluta opzionale (piantina)
  unit = TT_UNIT,             // lato corpo per 1 cella (la piantina lo deriva dal pitch+zoom)
  pitch = null,               // passo cella della griglia (per i rect multi-cella)
  scale = 1,                  // scala via transform (solo usi standalone)
  onEnter, onLeave, onPointerDown, onClick,
  style, children,
}) {
  const acc = TT_ACCENTS[status] || TT_ACCENTS.libero;
  const body = ttBodySize(seats, shape, orientation, unit, pitch);
  const m = ttChairMetrics(unit);
  // Tipografia a dimensione QUASI fissa: non scala con la griglia — è ciò
  // che tiene il numero leggibile anche quando la mappa si adatta allo schermo.
  const numSize = Math.round(Math.min(27, Math.max(17, unit * 0.34)));
  const labelSize = Math.min(12, Math.max(10, unit * 0.165));
  // Il wrapper coincide col CORPO: le sedie sporgono fuori (overflow visibile)
  // e vivono nel gutter riservato dalla griglia.
  const W = body.w;
  const H = body.h;

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

  // Posizioni sedie in px relative al corpo — FUORI dai suoi bordi.
  // I lati in hideChairSides restano senza sedie (lato unito di un gruppo).
  const chairs = ttChairs(seats, shape, orientation)
    .filter(c => !hideChairSides.includes(c.side))
    .map((c, i) => {
    const horiz = c.side === 'top' || c.side === 'bottom';
    const along = horiz ? body.w : body.h;
    const center = c.frac * along;
    let x, y;
    if (c.side === 'top')    { x = center - m.cw / 2; y = -m.out; }
    if (c.side === 'bottom') { x = center - m.cw / 2; y = H + m.gap; }
    if (c.side === 'left')   { x = -m.out;            y = center - m.cw / 2; }
    if (c.side === 'right')  { x = W + m.gap;         y = center - m.cw / 2; }
    return <TTChair key={`${c.side}-${i}`} side={c.side} x={x} y={y} acc={acc} dim={dim} m={m}/>;
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
      {/* Corpo tavolo — tessera glass, riempie la cella */}
      <div style={{
        position: 'absolute', left: 0, top: 0,
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
        {/* Solo il numero, grande in bold — nessun prefisso */}
        <div style={{display: 'flex', alignItems: 'baseline', lineHeight: 1}}>
          <span style={{
            fontSize: numSize, fontWeight: 800,
            color: dim ? '#9CA3AF' : '#0F1115',
            fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em',
          }}>{numero}</span>
        </div>
        {density === 'comfort' && !dim && (
          <div style={{
            fontSize: labelSize, fontWeight: 700, lineHeight: 1,
            letterSpacing: 0.5, textTransform: 'uppercase',
            color: acc.ink, opacity: 0.85, marginTop: 4,
            whiteSpace: 'nowrap',
          }}>{TT_LABELS[status] || status}</div>
        )}
      </div>
      {/* Badge ALLERGIA — chip critico, a cavallo del bordo corpo */}
      {badge.includes('ALLERGIA') && !dim && (
        <div style={{
          position: 'absolute', bottom: -8, left: -6,
          background: '#DC2626', color: '#fff',
          padding: '2px 6px 2px 4px', borderRadius: 999,
          border: '1.5px solid #fff',
          fontSize: 11, fontWeight: 700, letterSpacing: 0.3,
          boxShadow: '0 1px 3px rgba(220,38,38,0.35)',
          whiteSpace: 'nowrap', zIndex: 6,
        }}>Allergie</div>
      )}
      {children}
    </div>
  );
}

window.TableTile = TableTile;
window.ttFootprintUnits = ttFootprintUnits;
window.ttBodySize = ttBodySize;
window.ttChairMetrics = ttChairMetrics;
window.ttSeatShape = ttSeatShape;
window.TT_UNIT = TT_UNIT;
window.TT_GUTTER = TT_GUTTER;
window.TT_CHAIR_OUT = TT_CHAIR_OUT;
