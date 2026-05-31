// Food illustrations — SVG plate + ingredients per dish kind.
// Exposes <DishArt kind="..." size={...}/> on window.

function DishArt({ kind = 'default', bg, full = false }) {
  // bg = optional override of background color
  // full = if true, fills container; otherwise centered with padding
  const palettes = {
    fritto:    { bg: '#f4d8a8', plate: '#fff8ee', accent: '#c9933a' },
    cozze:     { bg: '#dfe4d6', plate: '#1a1a1a', accent: '#5a3a2a' },
    tagliere:  { bg: '#e9d5b8', plate: '#3a2418', accent: '#b8845c' },
    pasta:     { bg: '#f0d9b8', plate: '#fff', accent: '#d4a04a' },
    carbonara: { bg: '#f0d9b8', plate: '#fff', accent: '#d4a04a' },
    secondo:   { bg: '#e8d3b6', plate: '#fff8ee', accent: '#a05030' },
    dolce:     { bg: '#e8d4c2', plate: '#fff8ee', accent: '#6a3818' },
    acqua:     { bg: '#dfe9ec', plate: '#fff', accent: '#86a8b8' },
    vino:      { bg: '#e8d4d4', plate: '#fff', accent: '#7a2030' },
    default:   { bg: '#e8d9c9', plate: '#fff8ee', accent: '#8a6a48' },
  };
  const p = palettes[kind] || palettes.default;
  const fill = bg || p.bg;

  return (
    <svg viewBox="0 0 200 200" preserveAspectRatio="xMidYMid slice"
      style={{ width: '100%', height: '100%', display: 'block' }}>
      {/* background */}
      <rect width="200" height="200" fill={fill}/>
      {/* subtle texture */}
      <g opacity="0.08">
        {[...Array(20)].map((_, i) => (
          <line key={i} x1={-20 + i * 12} y1="-20" x2={-50 + i * 12} y2="220"
            stroke="#000" strokeWidth="0.6"/>
        ))}
      </g>
      {/* dish content */}
      <g transform="translate(100, 100)">
        {kind === 'fritto' && <FrittoArt c={p}/>}
        {kind === 'cozze' && <CozzeArt c={p}/>}
        {kind === 'tagliere' && <TagliereArt c={p}/>}
        {(kind === 'pasta' || kind === 'carbonara') && <PastaArt c={p} kind={kind}/>}
        {kind === 'secondo' && <SecondoArt c={p}/>}
        {kind === 'dolce' && <DolceArt c={p}/>}
        {kind === 'acqua' && <AcquaArt c={p}/>}
        {kind === 'vino' && <VinoArt c={p}/>}
        {kind === 'default' && <DefaultArt c={p}/>}
      </g>
    </svg>
  );
}

// ── Plate base ───────────────────────────────────────────────
function Plate({ r = 70, color = '#fff8ee', shadow = true }) {
  return (
    <g>
      {shadow && <ellipse cx="0" cy={r * 0.15} rx={r * 1.05} ry={r * 0.15} fill="#000" opacity="0.12"/>}
      <circle cx="0" cy="0" r={r} fill={color}/>
      <circle cx="0" cy="0" r={r - 6} fill="none" stroke="#000" strokeWidth="0.6" opacity="0.1"/>
    </g>
  );
}

function FrittoArt({ c }) {
  return (
    <g>
      <Plate color={c.plate}/>
      {/* fried golden balls */}
      <circle cx="-22" cy="-12" r="14" fill="#d99a3a"/>
      <circle cx="-22" cy="-12" r="14" fill="url(#fritto-tex)" opacity="0.4"/>
      <circle cx="14" cy="-18" r="12" fill="#e0a440"/>
      <circle cx="20" cy="14" r="15" fill="#caa050"/>
      <circle cx="-12" cy="20" r="11" fill="#e8b34a"/>
      <circle cx="-30" cy="12" r="9" fill="#d4933a"/>
      {/* lemon wedge */}
      <path d="M 30,-30 L 45,-22 L 38,-10 Z" fill="#f3d65a"/>
      <line x1="33" y1="-26" x2="42" y2="-15" stroke="#fff" strokeWidth="1" opacity="0.5"/>
      {/* parsley */}
      <circle cx="-10" cy="-25" r="2" fill="#5a8048"/>
      <circle cx="-6" cy="-22" r="1.5" fill="#5a8048"/>
      <defs>
        <radialGradient id="fritto-tex">
          <stop offset="0" stopColor="#fff" stopOpacity="0.4"/>
          <stop offset="1" stopColor="#fff" stopOpacity="0"/>
        </radialGradient>
      </defs>
    </g>
  );
}

function CozzeArt({ c }) {
  return (
    <g>
      <Plate color={c.plate}/>
      {/* mussels — black shells */}
      {[
        [-25, -20, -25], [-5, -28, 10], [18, -18, 30],
        [25, 5, -20], [10, 22, 40], [-15, 25, 0], [-30, 8, -15], [0, 0, 20],
      ].map(([x, y, rot], i) => (
        <g key={i} transform={`translate(${x},${y}) rotate(${rot})`}>
          <ellipse cx="0" cy="0" rx="13" ry="8" fill="#1f1812"/>
          <ellipse cx="0" cy="-1" rx="10" ry="5" fill="#f7d089"/>
          <ellipse cx="0" cy="-1" rx="6" ry="3" fill="#e89a55"/>
        </g>
      ))}
      {/* parsley flecks */}
      <circle cx="-18" cy="-5" r="1.5" fill="#5a8048"/>
      <circle cx="20" cy="-8" r="1.2" fill="#5a8048"/>
      <circle cx="5" cy="15" r="1.5" fill="#5a8048"/>
    </g>
  );
}

function TagliereArt({ c }) {
  return (
    <g>
      {/* wooden board */}
      <rect x="-65" y="-45" width="130" height="90" rx="6" fill="#6b4226"/>
      <rect x="-65" y="-45" width="130" height="90" rx="6" fill="url(#wood-tex)"/>
      {/* salami slices */}
      <circle cx="-35" cy="-22" r="14" fill="#a83838"/>
      <circle cx="-35" cy="-22" r="14" fill="url(#salami-tex)"/>
      <circle cx="-30" cy="10" r="13" fill="#b04545"/>
      <circle cx="-30" cy="10" r="13" fill="url(#salami-tex)"/>
      {/* prosciutto folded */}
      <path d="M 5,-30 Q 20,-32 32,-22 Q 28,-12 14,-15 Q 0,-18 5,-30 Z" fill="#d8807a"/>
      <path d="M 8,-12 Q 25,-8 35,-2 Q 28,8 12,4 Q 0,0 8,-12 Z" fill="#e29991"/>
      {/* cheese cubes */}
      <rect x="0" y="14" width="14" height="14" rx="1" fill="#f5e2a8"/>
      <rect x="18" y="20" width="12" height="12" rx="1" fill="#e8c878"/>
      <rect x="35" y="14" width="13" height="13" rx="1" fill="#f5e2a8"/>
      <defs>
        <pattern id="wood-tex" width="20" height="90" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="0" y2="90" stroke="#000" strokeWidth="0.4" opacity="0.15"/>
          <line x1="10" y1="0" x2="10" y2="90" stroke="#000" strokeWidth="0.3" opacity="0.1"/>
        </pattern>
        <radialGradient id="salami-tex">
          <stop offset="0" stopColor="#fff" stopOpacity="0"/>
          <stop offset="0.7" stopColor="#fff" stopOpacity="0.15"/>
          <stop offset="1" stopColor="#fff" stopOpacity="0"/>
        </radialGradient>
      </defs>
    </g>
  );
}

function PastaArt({ c, kind }) {
  return (
    <g>
      <Plate color={c.plate}/>
      {/* pasta swirl */}
      {[...Array(28)].map((_, i) => {
        const a = (i / 28) * Math.PI * 2;
        const r = 35 + (i % 3) * 4;
        const x = Math.cos(a) * r;
        const y = Math.sin(a) * r * 0.6;
        return (
          <ellipse key={i} cx={x} cy={y} rx="12" ry="3"
            transform={`rotate(${(a * 180 / Math.PI) + 90}, ${x}, ${y})`}
            fill={i % 2 ? '#f0d488' : '#e8c46a'}/>
        );
      })}
      {/* center mound */}
      <ellipse cx="0" cy="-2" rx="22" ry="14" fill="#e8c46a"/>
      <ellipse cx="-5" cy="-6" rx="14" ry="8" fill="#f5dc94"/>
      {/* pepper / pecorino */}
      {kind === 'carbonara' ? (
        <>
          <rect x="-3" y="-12" width="3" height="3" fill="#5a3818" rx="1"/>
          <rect x="6" y="-4" width="2" height="2" fill="#3a2010" rx="0.5"/>
          <rect x="-10" y="2" width="2.5" height="2.5" fill="#5a3818" rx="0.5"/>
          {/* guanciale */}
          <path d="M -8,-5 Q 2,-8 8,-3 Q 6,3 -3,1 Q -10,-1 -8,-5 Z" fill="#c87060"/>
        </>
      ) : (
        <>
          {[...Array(12)].map((_, i) => (
            <circle key={i}
              cx={Math.cos(i * 1.2) * 18} cy={Math.sin(i * 1.2) * 12 - 3}
              r="1.2" fill="#1a1208"/>
          ))}
        </>
      )}
    </g>
  );
}

function SecondoArt({ c }) {
  return (
    <g>
      <Plate color={c.plate}/>
      {/* meat slice */}
      <path d="M -38,-8 Q -20,-25 10,-22 Q 35,-15 38,5 Q 30,22 -5,20 Q -35,15 -38,-8 Z"
        fill="#9a4530"/>
      <path d="M -32,-5 Q -18,-18 5,-16 Q 28,-10 30,5 Q 22,18 -3,15 Q -30,10 -32,-5 Z"
        fill="#b25538"/>
      {/* sage leaves */}
      <ellipse cx="-15" cy="-10" rx="8" ry="3" fill="#6a805a" transform="rotate(-20, -15, -10)"/>
      <ellipse cx="12" cy="-2" rx="7" ry="2.5" fill="#7a8e6a" transform="rotate(15, 12, -2)"/>
      {/* prosciutto wrap */}
      <path d="M -20,-2 Q 0,-5 18,2 Q 22,8 8,10 Q -15,12 -20,-2 Z"
        fill="#d8807a" opacity="0.7"/>
    </g>
  );
}

function DolceArt({ c }) {
  return (
    <g>
      {/* glass / ramekin */}
      <rect x="-38" y="-32" width="76" height="64" rx="6" fill="#f5ede0"/>
      <rect x="-38" y="-32" width="76" height="64" rx="6" fill="none"
        stroke="#000" strokeWidth="1" opacity="0.15"/>
      {/* tiramisu layers */}
      <rect x="-36" y="-30" width="72" height="14" fill="#e8c890"/>
      <rect x="-36" y="-16" width="72" height="3" fill="#5a3818"/>
      <rect x="-36" y="-13" width="72" height="14" fill="#fdf6e8"/>
      <rect x="-36" y="1" width="72" height="3" fill="#5a3818"/>
      <rect x="-36" y="4" width="72" height="14" fill="#e8c890"/>
      <rect x="-36" y="18" width="72" height="3" fill="#5a3818"/>
      <rect x="-36" y="21" width="72" height="9" fill="#fdf6e8"/>
      {/* cocoa dust on top */}
      {[...Array(20)].map((_, i) => (
        <circle key={i} cx={-32 + i * 3.5} cy="-30" r="0.8" fill="#3a1a08"/>
      ))}
      {/* mint leaf */}
      <ellipse cx="-15" cy="-32" rx="6" ry="3" fill="#5a8048" transform="rotate(-20, -15, -32)"/>
    </g>
  );
}

function AcquaArt({ c }) {
  return (
    <g>
      {/* bottle */}
      <path d="M -15,-50 L -15,-32 Q -22,-30 -22,-20 L -22,40 Q -22,48 -14,48 L 14,48 Q 22,48 22,40 L 22,-20 Q 22,-30 15,-32 L 15,-50 Z"
        fill="#cfe4eb" opacity="0.85"/>
      <path d="M -15,-50 L -15,-32 Q -22,-30 -22,-20 L -22,40 Q -22,48 -14,48 L 14,48 Q 22,48 22,40 L 22,-20 Q 22,-30 15,-32 L 15,-50 Z"
        fill="none" stroke="#5a7a8a" strokeWidth="1.5" opacity="0.5"/>
      {/* label */}
      <rect x="-18" y="-5" width="36" height="22" fill="#fff" stroke="#5a7a8a" strokeWidth="0.5"/>
      <line x1="-15" y1="0" x2="15" y2="0" stroke="#86a8b8" strokeWidth="1"/>
      <line x1="-12" y1="6" x2="12" y2="6" stroke="#86a8b8" strokeWidth="1"/>
      <line x1="-10" y1="12" x2="10" y2="12" stroke="#86a8b8" strokeWidth="1"/>
      {/* cap */}
      <rect x="-15" y="-55" width="30" height="8" fill="#5a7a8a"/>
      {/* bubbles */}
      <circle cx="0" cy="35" r="2" fill="#fff" opacity="0.6"/>
      <circle cx="-8" cy="25" r="1.5" fill="#fff" opacity="0.5"/>
      <circle cx="8" cy="20" r="1.2" fill="#fff" opacity="0.5"/>
    </g>
  );
}

function VinoArt({ c }) {
  return (
    <g>
      {/* glass stem */}
      <rect x="-1" y="0" width="2" height="50" fill="#3a1a20" opacity="0.6"/>
      <ellipse cx="0" cy="50" rx="20" ry="3" fill="#3a1a20" opacity="0.4"/>
      {/* glass bowl */}
      <path d="M -28,-50 Q -28,-10 0,5 Q 28,-10 28,-50 Z"
        fill="#fff" opacity="0.5" stroke="#3a1a20" strokeWidth="1.5"/>
      {/* wine */}
      <path d="M -25,-30 Q -25,-12 0,2 Q 25,-12 25,-30 Z" fill="#7a2030"/>
      <path d="M -22,-25 Q -22,-15 0,-2 Q 22,-15 22,-25 Z" fill="#9a2840" opacity="0.7"/>
      {/* highlight */}
      <ellipse cx="-12" cy="-30" rx="4" ry="10" fill="#fff" opacity="0.3"/>
    </g>
  );
}

function DefaultArt({ c }) {
  return (
    <g>
      <Plate color={c.plate}/>
      <circle cx="0" cy="0" r="30" fill={c.accent} opacity="0.6"/>
      <circle cx="-10" cy="-8" r="12" fill={c.accent} opacity="0.8"/>
      <circle cx="14" cy="6" r="14" fill={c.accent}/>
    </g>
  );
}

// ── Restaurant hero (warm interior vibe) ─────────────────────
function RestaurantArt({ tone = 'a' }) {
  const palettes = {
    a: { bg: '#3a1f1f', warm: '#d97a3a', soft: '#f0c878', accent: '#e8a050' }, // candle-lit
    b: { bg: '#1f2a3a', warm: '#e8a850', soft: '#f0d090', accent: '#d8b070' }, // evening blue
    c: { bg: '#2a1a30', warm: '#d870a0', soft: '#f0c0d8', accent: '#e890c0' }, // moody pink
    d: { bg: '#2a3a1f', warm: '#d8a040', soft: '#f0d090', accent: '#a8c060' }, // garden
  };
  const p = palettes[tone] || palettes.a;
  return (
    <svg viewBox="0 0 200 140" preserveAspectRatio="xMidYMid slice"
      style={{ width: '100%', height: '100%', display: 'block' }}>
      <defs>
        <radialGradient id={`vignette-${tone}`} cx="50%" cy="40%" r="80%">
          <stop offset="0" stopColor={p.warm} stopOpacity="0.6"/>
          <stop offset="0.5" stopColor={p.bg} stopOpacity="0.4"/>
          <stop offset="1" stopColor={p.bg}/>
        </radialGradient>
      </defs>
      <rect width="200" height="140" fill={p.bg}/>
      <rect width="200" height="140" fill={`url(#vignette-${tone})`}/>
      {/* ceiling beams */}
      <rect x="0" y="0" width="200" height="18" fill="#000" opacity="0.3"/>
      {/* hanging lights */}
      {[40, 100, 160].map((x, i) => (
        <g key={i}>
          <line x1={x} y1="0" x2={x} y2="22" stroke={p.bg} strokeWidth="1" opacity="0.5"/>
          <circle cx={x} cy="26" r="6" fill={p.soft}/>
          <circle cx={x} cy="26" r="11" fill={p.warm} opacity="0.3"/>
          <circle cx={x} cy="26" r="20" fill={p.warm} opacity="0.12"/>
        </g>
      ))}
      {/* tables silhouette */}
      <ellipse cx="50" cy="105" rx="32" ry="6" fill="#000" opacity="0.5"/>
      <ellipse cx="150" cy="100" rx="28" ry="5" fill="#000" opacity="0.5"/>
      <ellipse cx="100" cy="115" rx="40" ry="7" fill="#000" opacity="0.6"/>
      {/* plates on tables */}
      <ellipse cx="50" cy="100" rx="8" ry="2" fill={p.soft} opacity="0.7"/>
      <ellipse cx="150" cy="96" rx="7" ry="2" fill={p.soft} opacity="0.7"/>
      {/* glass with reflection */}
      <ellipse cx="65" cy="98" rx="2" ry="4" fill={p.accent} opacity="0.6"/>
      <ellipse cx="160" cy="94" rx="1.5" ry="3" fill={p.accent} opacity="0.6"/>
      {/* people silhouettes — abstract */}
      <ellipse cx="50" cy="90" rx="6" ry="9" fill="#000" opacity="0.4"/>
      <circle cx="50" cy="80" r="4" fill="#000" opacity="0.4"/>
      <ellipse cx="150" cy="86" rx="5" ry="8" fill="#000" opacity="0.4"/>
      <circle cx="150" cy="77" r="3.5" fill="#000" opacity="0.4"/>
    </svg>
  );
}

Object.assign(window, { DishArt, RestaurantArt });
