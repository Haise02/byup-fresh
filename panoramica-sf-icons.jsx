// ╭───────────────────────────────────────────────────────────────────────────╮
// │ Byup Fresh — SF Regular Filled icon system                                │
// │                                                                           │
// │ Single source of truth per le icone di tutta la dashboard (header, tab,   │
// │ sidebar, sub-section). Stile: Apple SF Regular Filled.                    │
// │                                                                           │
// │ Convenzione naming:                                                       │
// │  · UI (azioni/nav)        → slug puro      es. plus, grip, chevron-right  │
// │  · Content (dominio)      → famiglia-slug  es. food-pizza, place-table    │
// │  · Status (feedback)      → status-slug    es. status-success             │
// │                                                                           │
// │ Esposti su window:                                                        │
// │  · SfIcons   registry { name -> ()=>JSX }                                 │
// │  · Icon      <Icon name="..." size="..." color="..." />                   │
// ╰───────────────────────────────────────────────────────────────────────────╯

const SfIcons = {
  // ═══ UI (16) — azioni e navigazione, senza prefisso ═══════════════════════

  'grid': () => (
    <path d="M6 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h3a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H6Zm9 0a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h3a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-3Zm0 8a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h3a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-3Zm-9 4a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h3a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2H6Z"/>
  ),

  'magnifying-glass': () => (
    <path fillRule="evenodd" clipRule="evenodd" d="M3 10.5a7.5 7.5 0 1 1 13.39 4.6l4 4.01a1.4 1.4 0 0 1-2 2l-4-4A7.5 7.5 0 0 1 3 10.5Zm7.5-5a5 5 0 1 0 0 10 5 5 0 0 0 0-10Z"/>
  ),

  'bell': () => (
    <path d="M12 2a7 7 0 0 0-7 7v3.4c0 .65-.2 1.3-.55 1.85L3.1 16.45A1 1 0 0 0 3.95 18h16.1a1 1 0 0 0 .85-1.55l-1.35-2.2A3.5 3.5 0 0 1 19 12.4V9a7 7 0 0 0-7-7Zm-2.45 17.5a2.5 2.5 0 0 0 4.9 0h-4.9Z"/>
  ),

  'gear': () => (
    <>
      {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => (
        <rect key={deg} x="10.6" y="1.5" width="2.8" height="4.5" rx="1.2" transform={`rotate(${deg} 12 12)`}/>
      ))}
      <path fillRule="evenodd" clipRule="evenodd" d="M19 12a7 7 0 1 1-14 0 7 7 0 0 1 14 0Zm-7-3.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z"/>
    </>
  ),

  'plus': () => (
    <path d="M12 4a1.25 1.25 0 0 0-1.25 1.25v5.5h-5.5a1.25 1.25 0 0 0 0 2.5h5.5v5.5a1.25 1.25 0 0 0 2.5 0v-5.5h5.5a1.25 1.25 0 0 0 0-2.5h-5.5v-5.5A1.25 1.25 0 0 0 12 4Z"/>
  ),

  'xmark': () => (
    <path d="M5.65 5.65a1.25 1.25 0 0 1 1.77 0L12 10.23l4.58-4.58a1.25 1.25 0 1 1 1.77 1.77L13.77 12l4.58 4.58a1.25 1.25 0 1 1-1.77 1.77L12 13.77l-4.58 4.58a1.25 1.25 0 0 1-1.77-1.77L10.23 12 5.65 7.42a1.25 1.25 0 0 1 0-1.77Z"/>
  ),

  'grip': () => (
    <path d="M9 4.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 7.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 7.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm9-15a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 7.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 7.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z"/>
  ),

  'check': () => (
    <path d="M19.7 6.3a1.2 1.2 0 0 1 0 1.7l-9.5 9.5a1.2 1.2 0 0 1-1.7 0l-4.5-4.5a1.2 1.2 0 1 1 1.7-1.7l3.65 3.65 8.65-8.65a1.2 1.2 0 0 1 1.7 0Z"/>
  ),

  'pencil': () => (
    <path d="M17.7 2.3a2.8 2.8 0 0 1 4 4l-1.4 1.4-4-4 1.4-1.4Zm-2.45 2.45 4 4L8.6 19.4a2 2 0 0 1-.95.55l-3.65.9a.8.8 0 0 1-.95-.95l.9-3.65a2 2 0 0 1 .55-.95L15.25 4.75Z"/>
  ),

  'chevron-right': () => (
    <path d="M9.3 5.3a1.25 1.25 0 0 1 1.77 0l5.7 5.83a1.25 1.25 0 0 1 0 1.74l-5.7 5.83a1.25 1.25 0 0 1-1.77-1.74L14.25 12 9.3 7.04a1.25 1.25 0 0 1 0-1.74Z"/>
  ),

  'star': () => (
    <path d="M11.1 2.55a1 1 0 0 1 1.8 0l2.5 5.2 5.65.85a1 1 0 0 1 .55 1.7l-4.1 4 1 5.7a1 1 0 0 1-1.45 1.05L12 18.3l-5.05 2.75a1 1 0 0 1-1.45-1.05l1-5.7-4.1-4a1 1 0 0 1 .55-1.7L8.6 7.75l2.5-5.2Z"/>
  ),

  'sparkles': () => (
    <path d="M11 2.2a.5.5 0 0 1 1 0l1.05 4.55a.5.5 0 0 0 .4.4l4.55 1.05a.5.5 0 0 1 0 .95l-4.55 1.05a.5.5 0 0 0-.4.4L12 15.2a.5.5 0 0 1-1 0L9.95 10.6a.5.5 0 0 0-.4-.4L5 9.15a.5.5 0 0 1 0-.95l4.55-1.05a.5.5 0 0 0 .4-.4L11 2.2Zm6.5 12a.4.4 0 0 1 .8 0l.55 2.45c.05.18.18.32.36.36l2.45.55a.4.4 0 0 1 0 .78l-2.45.55a.4.4 0 0 0-.36.36l-.55 2.45a.4.4 0 0 1-.78 0l-.55-2.45a.4.4 0 0 0-.36-.36l-2.45-.55a.4.4 0 0 1 0-.78l2.45-.55a.4.4 0 0 0 .36-.36l.55-2.45Z"/>
  ),

  'headphones': () => (
    <path d="M12 3a9 9 0 0 0-9 9v6a3 3 0 0 0 3 3h1.5a1 1 0 0 0 1-1v-7a1 1 0 0 0-1-1H5v-.5a7 7 0 0 1 14 0v.5h-2.5a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1H18a3 3 0 0 0 3-3v-6a9 9 0 0 0-9-9Z"/>
  ),

  'arrow-up-right': () => (
    <path d="M8.5 5.5a1.25 1.25 0 0 0 0 2.5h5.73L5.4 16.83a1.25 1.25 0 1 0 1.77 1.77L16 9.77v5.73a1.25 1.25 0 0 0 2.5 0V6.75c0-.69-.56-1.25-1.25-1.25H8.5Z"/>
  ),

  'arrow-down-right': () => (
    <path d="M8.5 18.5a1.25 1.25 0 0 1 0-2.5h5.73L5.4 7.17A1.25 1.25 0 1 1 7.17 5.4L16 14.23V8.5a1.25 1.25 0 0 1 2.5 0v8.75c0 .69-.56 1.25-1.25 1.25H8.5Z"/>
  ),

  'download': () => (
    <path d="M12 3a1.25 1.25 0 0 1 1.25 1.25v9.45l2.7-2.7a1.25 1.25 0 1 1 1.77 1.77l-4.83 4.83a1.25 1.25 0 0 1-1.77 0L6.28 12.77a1.25 1.25 0 1 1 1.77-1.77l2.7 2.7V4.25A1.25 1.25 0 0 1 12 3ZM4.25 19a1.25 1.25 0 1 0 0 2.5h15.5a1.25 1.25 0 0 0 0-2.5H4.25Z"/>
  ),

  // ═══ Content · Food (15) ══════════════════════════════════════════════════

  'food-flame': () => (
    <path fillRule="evenodd" clipRule="evenodd" d="M13 2.2c-.4-.5-1.2-.3-1.3.3-.5 2.5-2.3 4-3.7 5.7A6.8 6.8 0 0 0 5.2 13c0 3.8 3 6.8 6.8 6.8 3.8 0 6.8-3 6.8-6.8 0-2.7-1.7-4.5-3.3-6.5-1.1-1.4-2.3-2.8-2.5-4.3Zm-.7 11.5c.5 1 1.7 1.4 2.7.8.4-.2.7.1.5.5a3.3 3.3 0 0 1-3.2 2.3 3.3 3.3 0 0 1-3.2-3.2c0-.6.1-1.3.4-1.8.2-.4.6-.3.6.1 0 .7.4 1.3 1 1.4.4.1.6-.2.5-.5-.2-.4.3-.6.4-.2.1.3.2.5.3.6Z"/>
  ),

  'food-meal': () => (
    <>
      {/* Cloche cover dome */}
      <path d="M12 4a1 1 0 0 1 1 1v.5c4 .4 7 3 7 6v.5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V11.5c0-3 3-5.6 7-6V5a1 1 0 0 1 1-1Z"/>
      {/* Base plate */}
      <rect x="2.5" y="15.5" width="19" height="2.5" rx="1.25"/>
    </>
  ),

  'food-pizza': () => (
    <>
      {/* Triangle slice */}
      <path d="M11.13 2.85a1 1 0 0 1 1.74 0l8 13.85a1 1 0 0 1-.87 1.5H4a1 1 0 0 1-.87-1.5l8-13.85Z"/>
      {/* Holes for "cheese" cut-outs */}
      <circle cx="10" cy="11" r="1" fill="#fff"/>
      <circle cx="14" cy="13" r="1" fill="#fff"/>
      <circle cx="12" cy="16" r=".9" fill="#fff"/>
    </>
  ),

  'food-hamburger': () => (
    <>
      {/* Top bun (dome) */}
      <path d="M4 11a8 8 0 0 1 16 0v.5H4V11Z"/>
      {/* Middle fillings (2 stripes) */}
      <rect x="3" y="12.5" width="18" height="2.5" rx="1.2"/>
      {/* Bottom bun */}
      <path d="M3.5 16.5h17a.5.5 0 0 1 .5.5v.5a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V17a.5.5 0 0 1 .5-.5Z"/>
    </>
  ),

  'food-taco': () => (
    <>
      {/* Taco shell U */}
      <path d="M3 11a9 9 0 0 1 18 0 1 1 0 0 1-1 1h-1.5a7 7 0 0 0-13 0H4a1 1 0 0 1-1-1Z"/>
      {/* Filling lumps */}
      <circle cx="8" cy="14" r="2"/>
      <circle cx="12" cy="15" r="2.2"/>
      <circle cx="16" cy="14" r="2"/>
      <path d="M3 12a1 1 0 0 0-1 1 9 9 0 0 0 20 0 1 1 0 0 0-1-1H3Z" fillOpacity=".25"/>
    </>
  ),

  'food-salad': () => (
    <>
      {/* Bowl */}
      <path d="M3 12h18a.5.5 0 0 1 .5.5v.5a9.5 9.5 0 0 1-19 0v-.5A.5.5 0 0 1 3 12Z"/>
      {/* Leaves */}
      <ellipse cx="9" cy="9" rx="2.5" ry="2"/>
      <ellipse cx="13" cy="8" rx="2.5" ry="2"/>
      <ellipse cx="16" cy="10" rx="2" ry="1.6"/>
      <circle cx="11" cy="11" r="1.2"/>
    </>
  ),

  'food-pasta': () => (
    <>
      {/* Bowl */}
      <path d="M2.5 13h19a.5.5 0 0 1 .5.5v.5a9.5 9.5 0 0 1-20 0v-.5a.5.5 0 0 1 .5-.5Z"/>
      {/* Spaghetti strands */}
      <path d="M5 11c1-1 2-1 3 0s2 1 3 0 2-1 3 0 2 1 3 0 2-1 3 0" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round"/>
      <path d="M5 9c1-1 2-1 3 0s2 1 3 0 2-1 3 0 2 1 3 0 2-1 3 0" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round"/>
      <path d="M5 7c1-1 2-1 3 0s2 1 3 0 2-1 3 0 2 1 3 0 2-1 3 0" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round"/>
    </>
  ),

  'food-sandwich': () => (
    <>
      {/* Top bread slice */}
      <path d="M3 7a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v1H3V7Z"/>
      {/* Stripes (lettuce/meat) */}
      <path d="M3 9h18v2H3V9Zm0 3h18v2H3v-2Z"/>
      {/* Bottom bread */}
      <path d="M3 15h18v2a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3v-2Z"/>
    </>
  ),

  'food-sushi': () => (
    <>
      {/* Rice ring (outer) + filling */}
      <path fillRule="evenodd" clipRule="evenodd" d="M3 12a9 9 0 1 1 18 0 9 9 0 0 1-18 0Zm9-5a5 5 0 1 0 0 10 5 5 0 0 0 0-10Z"/>
      {/* Center filling dot */}
      <circle cx="12" cy="12" r="2.4"/>
      {/* Nori band */}
      <rect x="3" y="11" width="18" height="2"/>
    </>
  ),

  'food-soup': () => (
    <>
      {/* Bowl */}
      <path d="M2.5 12h19a.5.5 0 0 1 .5.5v1a8 8 0 0 1-6.5 7.86V22a1 1 0 0 1-1 1H9.5a1 1 0 0 1-1-1v-.64A8 8 0 0 1 2 13.5v-1a.5.5 0 0 1 .5-.5Z"/>
      {/* Steam */}
      <path d="M8 4c0 1 1 1.5 1 2.5s-1 1.5-1 2.5"/>
      <path d="M12 4c0 1 1 1.5 1 2.5s-1 1.5-1 2.5"/>
      <path d="M16 4c0 1 1 1.5 1 2.5s-1 1.5-1 2.5"/>
      <rect x="7.5" y="4" width="1.4" height="6" rx=".7"/>
      <rect x="11.5" y="4" width="1.4" height="6" rx=".7"/>
      <rect x="15.5" y="4" width="1.4" height="6" rx=".7"/>
    </>
  ),

  'food-steak': () => (
    <>
      {/* Meat blob */}
      <path d="M5 7c3-3 9-3 13 0 3 2 2 6-1 8-3 1-9 1-13-1-3-1.5-2-5 1-7Z"/>
      {/* Bone */}
      <ellipse cx="4.5" cy="7.5" rx="2" ry="1.4"/>
      <ellipse cx="4.5" cy="9" rx="1.5" ry="1"/>
    </>
  ),

  'food-seafood': () => (
    <>
      {/* Fish body */}
      <path d="M3 12c0-3 4-6 9-6 4 0 6 2 7 3.5L20 8a1 1 0 0 1 1.5 1L21 12l.5 3a1 1 0 0 1-1.5 1l-1-1.5C18 16 16 18 12 18c-5 0-9-3-9-6Z"/>
      {/* Eye */}
      <circle cx="8" cy="11" r=".8" fill="#fff"/>
    </>
  ),

  'food-vegetables': () => (
    <>
      {/* Carrot body */}
      <path d="M16.5 7.5 8.7 15.3a3 3 0 0 1-1.4.8l-3.4.8a.8.8 0 0 1-.95-.95l.8-3.4a3 3 0 0 1 .8-1.4L12.5 3.5l4 4Z"/>
      {/* Leaves */}
      <path d="M17 3a1 1 0 0 1 1 1l.2 1.5L20 5a1 1 0 0 1 1 1.5l-1.3.8 1 1a1 1 0 0 1-.7 1.7l-1.5-.2.2 1.5a1 1 0 0 1-1.7.7l-1-1-.8 1.3a1 1 0 0 1-1.5-1l.5-1.5L13 9.5a1 1 0 0 1 0-2l1.5.5L13.7 7a1 1 0 0 1 1-1.5l1 .5.2-1.5A1 1 0 0 1 17 3.5Z"/>
    </>
  ),

  'food-dessert': () => (
    <>
      {/* Cake top with frosting */}
      <path d="M5 11a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-1Z"/>
      {/* Bottom tier */}
      <path d="M4 13h16v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-6Z"/>
      {/* Candle */}
      <rect x="11.4" y="5" width="1.2" height="5" rx=".5"/>
      {/* Flame */}
      <path d="M12 2.5c.3 0 .8.5.6 1-.3.7-.3 1.2.4 1.5.4.2.5.7.2 1-.3.4-.9.5-1.2.1-.3-.4-.4-.8-.2-1.2-.2.5 0 1 .2 1.2.2.2 0 .5-.3.5-.4 0-.7-.3-.7-.7 0-.5.4-.8.5-1.2.1-.4-.2-1 .5-2.2Z"/>
    </>
  ),

  'food-ice-cream': () => (
    <>
      {/* Scoop top */}
      <circle cx="12" cy="7" r="4.5"/>
      <circle cx="12" cy="10" r="4"/>
      {/* Cone */}
      <path d="M7.5 11h9L13 22a1 1 0 0 1-2 0L7.5 11Z"/>
    </>
  ),

  // ═══ Content · Drink (10) ═════════════════════════════════════════════════

  'drink-coffee': () => (
    <>
      {/* Cup */}
      <path d="M4 8h13a1 1 0 0 1 1 1v6a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1Z"/>
      {/* Handle */}
      <path d="M18 10h1.5a2.5 2.5 0 0 1 0 5H18v-2h1.5a.5.5 0 0 0 0-1H18v-2Z"/>
      {/* Steam */}
      <path d="M8 4c0-1 1-1 1-2"/>
      <path d="M12 4c0-1 1-1 1-2"/>
      <rect x="7.5" y="2" width="1.2" height="4" rx=".6"/>
      <rect x="11.5" y="2" width="1.2" height="4" rx=".6"/>
      <rect x="14.5" y="2.5" width="1.2" height="3.5" rx=".6"/>
    </>
  ),

  'drink-coffee-to-go': () => (
    <>
      {/* Lid */}
      <path d="M5 5h14a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z"/>
      {/* Sip hole */}
      <rect x="13" y="6" width="4" height="1" rx=".5" fill="#fff"/>
      {/* Cup tapered */}
      <path d="M6 9h12l-1.5 11a2 2 0 0 1-2 1.8H9.5a2 2 0 0 1-2-1.8L6 9Z"/>
      {/* Brand band */}
      <rect x="7.5" y="13" width="9" height="2.5" rx=".4" fill="#fff"/>
    </>
  ),

  'drink-tea': () => (
    <>
      {/* Teapot body */}
      <path d="M5 9a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v5a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V9Z"/>
      {/* Spout */}
      <path d="M3 11h2v3H3a1 1 0 0 1-1-1v-1a1 1 0 0 1 1-1Z"/>
      {/* Lid knob */}
      <circle cx="12" cy="4" r="1.2"/>
      <rect x="9" y="4.5" width="6" height="1.5" rx=".7"/>
      {/* Steam */}
      <path d="M10 1.5c0 .5.5.7.5 1.2"/>
      <path d="M14 1.5c0 .5.5.7.5 1.2"/>
    </>
  ),

  'drink-cocktail': () => (
    <>
      {/* Glass V */}
      <path d="M3 4h18a1 1 0 0 1 .87 1.5l-8.37 9.3v5.7h2.5a1 1 0 0 1 0 2H8a1 1 0 0 1 0-2h2.5v-5.7L2.13 5.5A1 1 0 0 1 3 4Z"/>
      {/* Olive */}
      <circle cx="14" cy="8" r="1.2" fill="#fff"/>
      {/* Stirrer */}
      <rect x="14.5" y="3" width=".8" height="4" rx=".4" fill="#fff"/>
    </>
  ),

  'drink-wine': () => (
    <>
      {/* Wine glass bowl */}
      <path d="M6 3h12a1 1 0 0 1 1 1v3a7 7 0 0 1-6 6.93V20.5h2.5a1 1 0 0 1 0 2H8.5a1 1 0 0 1 0-2H11v-6.07A7 7 0 0 1 5 7V4a1 1 0 0 1 1-1Z"/>
    </>
  ),

  'drink-beer': () => (
    <>
      {/* Mug body */}
      <path d="M5 6a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6Z"/>
      {/* Handle */}
      <path d="M16 9h1.5a3.5 3.5 0 0 1 0 7H16v-2h1.5a1.5 1.5 0 0 0 0-3H16V9Z"/>
      {/* Foam */}
      <ellipse cx="7" cy="3" rx="1.6" ry="1.2" fill="#fff"/>
      <ellipse cx="10" cy="2.5" rx="1.6" ry="1.2" fill="#fff"/>
      <ellipse cx="13" cy="3" rx="1.6" ry="1.2" fill="#fff"/>
    </>
  ),

  'drink-champagne': () => (
    <>
      {/* Flute bowl - tall narrow */}
      <path d="M9 3h6a1 1 0 0 1 1 1l-1 10a3 3 0 0 1-3 2.93V20.5h2a1 1 0 0 1 0 2H10a1 1 0 0 1 0-2h2v-3.57A3 3 0 0 1 9 14L8 4a1 1 0 0 1 1-1Z"/>
      {/* Bubbles */}
      <circle cx="11" cy="7" r=".6" fill="#fff"/>
      <circle cx="13" cy="9" r=".7" fill="#fff"/>
      <circle cx="11.5" cy="11" r=".5" fill="#fff"/>
    </>
  ),

  'drink-juice': () => (
    <>
      {/* Glass tapered */}
      <path d="M6 5h12l-1 15a2 2 0 0 1-2 1.8H9a2 2 0 0 1-2-1.8L6 5Z"/>
      {/* Straw */}
      <rect x="14" y="2" width="1.5" height="7" rx=".7" transform="rotate(15 14.75 5.5)"/>
      {/* Liquid line */}
      <path d="M7 9h10l-.3 4H7.3L7 9Z" fill="#fff"/>
    </>
  ),

  'drink-water-bottle': () => (
    <>
      {/* Cap */}
      <rect x="9" y="2" width="6" height="3" rx="1"/>
      {/* Neck */}
      <rect x="10" y="5" width="4" height="3"/>
      {/* Bottle body */}
      <path d="M7 9a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3h-4a3 3 0 0 1-3-3V9Z"/>
      {/* Label band */}
      <rect x="7" y="12" width="10" height="3.5" fill="#fff"/>
    </>
  ),

  'drink-milkshake': () => (
    <>
      {/* Glass jar */}
      <path d="M6 6h12l-1 14a2 2 0 0 1-2 1.8H9a2 2 0 0 1-2-1.8L6 6Z"/>
      {/* Whipped cream top */}
      <ellipse cx="9" cy="4" rx="2" ry="1.5"/>
      <ellipse cx="12" cy="3.5" rx="2.2" ry="1.7"/>
      <ellipse cx="15" cy="4" rx="2" ry="1.5"/>
      {/* Cherry */}
      <circle cx="12" cy="2.5" r="1.2"/>
      {/* Straw */}
      <rect x="14.5" y="2" width="1.3" height="8" rx=".6" transform="rotate(20 15.15 6)"/>
    </>
  ),

  // ═══ Content · Commerce (13) ══════════════════════════════════════════════

  'commerce-wallet': () => (
    <path fillRule="evenodd" clipRule="evenodd" d="M5 4a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3v-3h-4.5a2.5 2.5 0 0 1 0-5H22V7a3 3 0 0 0-3-3H5Zm14 7a1.5 1.5 0 0 0 0 3h3v-3h-3Z"/>
  ),

  'commerce-receipt': () => (
    <path fillRule="evenodd" clipRule="evenodd" d="M5 3a1 1 0 0 0-1 1v17a.7.7 0 0 0 1.06.6l2.19-1.3 2.39 1.4a1 1 0 0 0 1 0l2.36-1.4 2.36 1.4a1 1 0 0 0 1 0l2.39-1.4 2.19 1.3A.7.7 0 0 0 20 21V4a1 1 0 0 0-1-1H5Zm3 5.25a.75.75 0 0 0 0 1.5h8a.75.75 0 0 0 0-1.5H8Zm0 4a.75.75 0 0 0 0 1.5h8a.75.75 0 0 0 0-1.5H8Zm0 4a.75.75 0 0 0 0 1.5h5a.75.75 0 0 0 0-1.5H8Z"/>
  ),

  'commerce-bank-cards': () => (
    <path fillRule="evenodd" clipRule="evenodd" d="M5 4a3 3 0 0 0-3 3v1.25h20V7a3 3 0 0 0-3-3H5Zm-3 6.75V17a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3v-6.25H2Zm3 4.5A.75.75 0 0 1 5.75 14.5h3.5a.75.75 0 0 1 0 1.5h-3.5A.75.75 0 0 1 5 15.25Z"/>
  ),

  'commerce-cart': () => (
    <>
      <path d="M2 4a1 1 0 0 0 0 2h1.7l2.55 11.5A2 2 0 0 0 8.2 19h10.6a2 2 0 0 0 1.95-1.5l1.7-6.5A1 1 0 0 0 21.5 10H6.5l-.7-3a1 1 0 0 0-1-1H2Z"/>
      <circle cx="9" cy="21" r="1.5"/>
      <circle cx="18" cy="21" r="1.5"/>
    </>
  ),

  'commerce-bag': () => (
    <path d="M6 8V6a6 6 0 0 1 12 0v2h2a1 1 0 0 1 1 1l-.7 11a3 3 0 0 1-3 2.8H6.7a3 3 0 0 1-3-2.8L3 9a1 1 0 0 1 1-1h2Zm2 0h8V6a4 4 0 0 0-8 0v2Z" fillRule="evenodd" clipRule="evenodd"/>
  ),

  'commerce-coins': () => (
    <>
      <ellipse cx="9" cy="7" rx="6.5" ry="3"/>
      <path d="M2.5 7v3c0 1.66 2.91 3 6.5 3s6.5-1.34 6.5-3V7"/>
      <path d="M2.5 10v3c0 1.66 2.91 3 6.5 3s6.5-1.34 6.5-3v-3"/>
      <ellipse cx="15" cy="14" rx="6.5" ry="3"/>
      <path d="M8.5 14v3c0 1.66 2.91 3 6.5 3s6.5-1.34 6.5-3v-3"/>
    </>
  ),

  'commerce-price-tag': () => (
    <>
      <path d="M3 3h7l11 11a2 2 0 0 1 0 2.8l-4.2 4.2a2 2 0 0 1-2.8 0L3 10V3Z"/>
      <circle cx="7" cy="7" r="1.5" fill="#fff"/>
    </>
  ),

  'commerce-discount': () => (
    <>
      <path d="M3 3h7l11 11a2 2 0 0 1 0 2.8l-4.2 4.2a2 2 0 0 1-2.8 0L3 10V3Z"/>
      <path d="M14.5 9 9 14.5" stroke="#fff" strokeWidth="1.6" strokeLinecap="round"/>
      <circle cx="10" cy="10" r=".8" fill="#fff"/>
      <circle cx="14" cy="14" r=".8" fill="#fff"/>
    </>
  ),

  'commerce-gift': () => (
    <>
      {/* Box bottom */}
      <rect x="3" y="11" width="18" height="11" rx="1.5"/>
      {/* Ribbon vertical */}
      <rect x="11" y="11" width="2" height="11" fill="#fff"/>
      {/* Lid */}
      <rect x="2" y="7" width="20" height="4.5" rx="1"/>
      <rect x="11" y="7" width="2" height="4.5" fill="#fff"/>
      {/* Bow */}
      <path d="M12 7c-2 0-3.5-1.5-3.5-3a1.5 1.5 0 0 1 3 0c0 1.5 0 3 .5 3Zm0 0c2 0 3.5-1.5 3.5-3a1.5 1.5 0 0 0-3 0c0 1.5 0 3-.5 3Z"/>
    </>
  ),

  'commerce-delivery': () => (
    <>
      {/* Truck cab */}
      <path d="M2 7a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v9H2V7Z"/>
      {/* Cargo */}
      <path d="M14 9h4a1 1 0 0 1 .9.55l2.6 5.2a1 1 0 0 1 .1.45V16h-7.6V9Z"/>
      {/* Wheels */}
      <circle cx="6" cy="18" r="2"/>
      <circle cx="18" cy="18" r="2"/>
    </>
  ),

  'commerce-in-transit': () => (
    <>
      {/* Package box */}
      <path d="M11.13 3.13 4.5 6.5v11l6.63 3.37a2 2 0 0 0 1.74 0L19.5 17.5v-11l-6.63-3.37a2 2 0 0 0-1.74 0Z"/>
      <path d="M4.5 6.5 12 10l7.5-3.5" stroke="#fff" strokeWidth="1" fill="none"/>
      <path d="M12 10v10.5" stroke="#fff" strokeWidth="1" fill="none"/>
      {/* Motion arrow */}
      <path d="M3.5 12.5h2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </>
  ),

  'commerce-coupon': () => (
    <>
      <path fillRule="evenodd" clipRule="evenodd" d="M2 8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4V8Zm14 1v6h-1V9h1Z"/>
    </>
  ),

  'commerce-money': () => (
    <>
      <rect x="2" y="6" width="20" height="12" rx="2"/>
      <circle cx="12" cy="12" r="2.8" fill="#fff"/>
      <circle cx="5" cy="12" r=".8" fill="#fff"/>
      <circle cx="19" cy="12" r=".8" fill="#fff"/>
    </>
  ),

  // ═══ Content · People (7) ═════════════════════════════════════════════════

  'people-customer': () => (
    <path d="M12 3a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9Zm-8 17.25a1 1 0 0 0 1 1.05h14a1 1 0 0 0 1-1.05 8 8 0 0 0-16 0Z"/>
  ),

  'people-chef': () => (
    <>
      {/* Chef hat puffy top */}
      <path d="M6 7a4 4 0 0 1 4-4 4 4 0 0 1 4 0 4 4 0 0 1 4 4 3 3 0 0 1-2 2.83V12H8V9.83A3 3 0 0 1 6 7Z"/>
      {/* Hat band */}
      <rect x="7" y="12" width="10" height="2.5" rx="1"/>
      {/* Face (chin) */}
      <path d="M9 15h6v2a3 3 0 0 1-6 0v-2Z"/>
    </>
  ),

  'people-waiter': () => (
    <>
      {/* Head */}
      <circle cx="12" cy="5" r="2.5"/>
      {/* Body with bow tie */}
      <path d="M7 10a5 5 0 0 1 10 0v8a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-8Z"/>
      {/* Bow tie */}
      <path d="M10 11l-1.5-1.5v3L10 11Zm4 0 1.5-1.5v3L14 11Z" fill="#fff"/>
      {/* Tray */}
      <ellipse cx="20" cy="13" rx="3" ry="1"/>
    </>
  ),

  'people-manager': () => (
    <>
      {/* Head */}
      <circle cx="12" cy="6" r="3"/>
      {/* Body with collar */}
      <path d="M5 17a7 7 0 0 1 14 0v3a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-3Z"/>
      {/* Tie */}
      <path d="M11 12l1 5 1-5h-2Z" fill="#fff"/>
    </>
  ),

  'people-staff-group': () => (
    <>
      {/* Center person */}
      <circle cx="12" cy="6" r="3"/>
      <path d="M7 17a5 5 0 0 1 10 0v3a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1v-3Z"/>
      {/* Left person */}
      <circle cx="4.5" cy="8" r="2.2"/>
      <path d="M1 16a3.5 3.5 0 0 1 5.5-2.86A6.5 6.5 0 0 0 5 17v4H2a1 1 0 0 1-1-1v-4Z"/>
      {/* Right person */}
      <circle cx="19.5" cy="8" r="2.2"/>
      <path d="M23 16a3.5 3.5 0 0 0-5.5-2.86A6.5 6.5 0 0 1 19 17v4h3a1 1 0 0 0 1-1v-4Z"/>
    </>
  ),

  'people-female-user': () => (
    <>
      {/* Head with longer hair */}
      <circle cx="12" cy="6" r="3"/>
      {/* Hair flow */}
      <path d="M8 7c-1.5 2-1.5 4 0 5h8c1.5-1 1.5-3 0-5"/>
      {/* Body */}
      <path d="M5 17a7 7 0 0 1 14 0v3a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-3Z"/>
    </>
  ),

  'people-user-circle': () => (
    <>
      <path fillRule="evenodd" clipRule="evenodd" d="M3 12a9 9 0 1 1 18 0 9 9 0 0 1-18 0Zm9-4a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Zm0 6a5 5 0 0 0-4.55 2.93A7 7 0 0 0 12 19a7 7 0 0 0 4.55-1.7A5 5 0 0 0 12 14Z"/>
    </>
  ),

  // ═══ Content · Time (6) ═══════════════════════════════════════════════════

  'time-calendar': () => (
    <path fillRule="evenodd" clipRule="evenodd" d="M7 2.5a1 1 0 0 1 2 0V4h6V2.5a1 1 0 1 1 2 0V4h.5A3.5 3.5 0 0 1 21 7.5V18.5A3.5 3.5 0 0 1 17.5 22h-11A3.5 3.5 0 0 1 3 18.5V7.5A3.5 3.5 0 0 1 6.5 4H7V2.5ZM5 11v7.5A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5V11H5Z"/>
  ),

  'time-clock': () => (
    <>
      <circle cx="12" cy="12" r="9.5"/>
      <path d="M12 6.5a1 1 0 0 0-1 1V13a1 1 0 0 0 .29.7l3 3a1 1 0 1 0 1.42-1.4l-2.71-2.72V7.5a1 1 0 0 0-1-1Z" fill="#fff"/>
    </>
  ),

  'time-stopwatch': () => (
    <>
      {/* Crown */}
      <rect x="10" y="2" width="4" height="2" rx="1"/>
      <rect x="11" y="3" width="2" height="2"/>
      {/* Side button */}
      <rect x="17.5" y="5" width="1.5" height="2" rx=".7" transform="rotate(45 18.25 6)"/>
      {/* Body */}
      <circle cx="12" cy="14" r="8"/>
      {/* Hands */}
      <path d="M12 9.5a.75.75 0 0 0-.75.75v4l-2 2a.75.75 0 1 0 1.05 1.05l2.2-2.2A.75.75 0 0 0 12.75 14v-3.75a.75.75 0 0 0-.75-.75Z" fill="#fff"/>
    </>
  ),

  'time-alarm': () => (
    <>
      {/* Bells on top */}
      <path d="M3 5a3 3 0 0 1 5.5-1.67L6 6.67A3 3 0 0 1 3 5Zm18 0a3 3 0 0 0-5.5-1.67L18 6.67A3 3 0 0 0 21 5Z"/>
      {/* Clock body */}
      <circle cx="12" cy="13" r="8"/>
      {/* Foot */}
      <rect x="6" y="20" width="3" height="2" rx="1" transform="rotate(20 7.5 21)"/>
      <rect x="15" y="20" width="3" height="2" rx="1" transform="rotate(-20 16.5 21)"/>
      {/* Hands */}
      <path d="M12 8.5a.75.75 0 0 0-.75.75V13a.75.75 0 0 0 .22.53l2.5 2.5a.75.75 0 1 0 1.06-1.06l-2.28-2.28V9.25A.75.75 0 0 0 12 8.5Z" fill="#fff"/>
    </>
  ),

  'time-history': () => (
    <>
      {/* Circular arrow */}
      <path d="M12 3a9 9 0 0 1 9 9 9 9 0 0 1-9 9 9 9 0 0 1-6-2.3 1 1 0 1 1 1.3-1.5A7 7 0 1 0 5 12h1.5a.5.5 0 0 1 .35.85l-2.5 2.5a.5.5 0 0 1-.7 0L1.15 12.85A.5.5 0 0 1 1.5 12H3a9 9 0 0 1 9-9Z"/>
      {/* Clock hands inside */}
      <path d="M12 7.5a.75.75 0 0 0-.75.75V12c0 .2.08.39.22.53l2.5 2.5a.75.75 0 1 0 1.06-1.06l-2.28-2.28V8.25A.75.75 0 0 0 12 7.5Z" fill="#fff"/>
    </>
  ),

  'time-schedule': () => (
    <>
      <path fillRule="evenodd" clipRule="evenodd" d="M5 5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5Zm3 3a.75.75 0 0 0 0 1.5h8a.75.75 0 0 0 0-1.5H8Zm0 4a.75.75 0 0 0 0 1.5h8a.75.75 0 0 0 0-1.5H8Zm0 4a.75.75 0 0 0 0 1.5h5a.75.75 0 0 0 0-1.5H8Z"/>
      <circle cx="6" cy="9" r=".8" fill="#fff"/>
      <circle cx="6" cy="13" r=".8" fill="#fff"/>
      <circle cx="6" cy="17" r=".8" fill="#fff"/>
    </>
  ),

  // ═══ Content · Place (6) ══════════════════════════════════════════════════

  'place-table': () => (
    <path d="M3.5 8c0-1.66 3.8-3 8.5-3s8.5 1.34 8.5 3-3.8 3-8.5 3S3.5 9.66 3.5 8Zm7.5 4.5v8a1 1 0 0 0 2 0v-8c-.33.01-.66.01-1 .01s-.67 0-1-.01Z"/>
  ),

  'place-restaurant': () => (
    <>
      {/* Building outline */}
      <path d="M4 9 12 3l8 6v11a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9Z"/>
      {/* Fork (sub-icon) */}
      <rect x="9" y="13" width="1.4" height="6" rx=".4" fill="#fff"/>
      <rect x="8" y="11" width="3.4" height="2" rx=".4" fill="#fff"/>
      {/* Knife */}
      <rect x="13.5" y="13" width="1.4" height="6" rx=".4" fill="#fff"/>
      <rect x="13" y="11" width="2.4" height="3" rx=".4" fill="#fff"/>
    </>
  ),

  'place-food-cart': () => (
    <>
      {/* Cart body */}
      <path d="M3 9a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v7H3V9Z"/>
      {/* Awning */}
      <path d="M2 6h20l-1 2H3L2 6Z"/>
      {/* Wheels */}
      <circle cx="7" cy="19" r="2"/>
      <circle cx="17" cy="19" r="2"/>
      {/* Window stripes */}
      <rect x="5" y="10" width="14" height="1" fill="#fff"/>
    </>
  ),

  'place-building': () => (
    <>
      <path d="M4 4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v17H4V4Z"/>
      <path d="M14 9a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v12h-6V9Z"/>
      <rect x="6" y="6" width="1.5" height="1.5" fill="#fff"/>
      <rect x="9" y="6" width="1.5" height="1.5" fill="#fff"/>
      <rect x="6" y="10" width="1.5" height="1.5" fill="#fff"/>
      <rect x="9" y="10" width="1.5" height="1.5" fill="#fff"/>
      <rect x="6" y="14" width="1.5" height="1.5" fill="#fff"/>
      <rect x="9" y="14" width="1.5" height="1.5" fill="#fff"/>
      <rect x="16" y="11" width="1.5" height="1.5" fill="#fff"/>
      <rect x="16" y="15" width="1.5" height="1.5" fill="#fff"/>
    </>
  ),

  'place-map-pin': () => (
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2a8 8 0 0 0-8 8c0 5.5 7 11.5 7.4 11.7a1 1 0 0 0 1.2 0C13 21.5 20 15.5 20 10a8 8 0 0 0-8-8Zm0 5a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z"/>
  ),

  'place-truck': () => (
    <>
      <path d="M2 7a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v8H2V7Z"/>
      <path d="M14 10h4a1 1 0 0 1 .9.55l2.6 5.2A1 1 0 0 1 21 17v-1.55L21.5 15.65A1 1 0 0 1 21.6 15.65L21.6 15.65V17h-7.6V10Z"/>
      <path d="M14 10h4a1 1 0 0 1 .9.55l2.6 5.2a1 1 0 0 1 .1.45V17h-7.6V10Z"/>
      <circle cx="6" cy="18" r="2"/>
      <circle cx="18" cy="18" r="2"/>
    </>
  ),

  // ═══ Content · Chart (7) ══════════════════════════════════════════════════

  'chart-bar': () => (
    <path d="M5 11a1.5 1.5 0 0 0-1.5 1.5v7A1.5 1.5 0 0 0 5 21h1a1.5 1.5 0 0 0 1.5-1.5v-7A1.5 1.5 0 0 0 6 11H5Zm6.5-4a1.5 1.5 0 0 0-1.5 1.5v11a1.5 1.5 0 0 0 1.5 1.5h1a1.5 1.5 0 0 0 1.5-1.5v-11A1.5 1.5 0 0 0 12.5 7h-1ZM18 3a1.5 1.5 0 0 0-1.5 1.5v15A1.5 1.5 0 0 0 18 21h1a1.5 1.5 0 0 0 1.5-1.5v-15A1.5 1.5 0 0 0 19 3h-1Z"/>
  ),

  'chart-area': () => (
    <>
      <path d="M3 19V8l5 4 4-7 4 3 5-3v14H3Z"/>
    </>
  ),

  'chart-doughnut': () => (
    <>
      <path fillRule="evenodd" clipRule="evenodd" d="M3 12a9 9 0 0 1 17.99-.5A9 9 0 1 1 3 12Zm9-4.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9Z"/>
      {/* Slice highlight */}
      <path d="M12 3v4.5a4.5 4.5 0 0 1 4.5 4.5H21A9 9 0 0 0 12 3Z" fillOpacity=".4"/>
    </>
  ),

  'chart-positive-dynamic': () => (
    <>
      <path d="M3 19V8l5 4 4-7 4 3 5-3v14H3Z"/>
      {/* Up arrow over */}
      <path d="M17 6.5 19.5 4l2.5 2.5h-2v3h-1v-3h-2Z" fill="#fff"/>
    </>
  ),

  'chart-mind-map': () => (
    <>
      <circle cx="5" cy="5" r="2.5"/>
      <circle cx="19" cy="5" r="2.5"/>
      <circle cx="12" cy="12" r="3"/>
      <circle cx="5" cy="19" r="2.5"/>
      <circle cx="19" cy="19" r="2.5"/>
      <path d="M7 7l3 3M14 10l3-3M10 14l-3 3M14 14l3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    </>
  ),

  'chart-flow-chart': () => (
    <>
      <rect x="9" y="2" width="6" height="4" rx="1"/>
      <rect x="2" y="10" width="6" height="4" rx="1"/>
      <rect x="9" y="10" width="6" height="4" rx="1"/>
      <rect x="16" y="10" width="6" height="4" rx="1"/>
      <rect x="9" y="18" width="6" height="4" rx="1"/>
      <path d="M12 6v4M12 14v4M5 14v-1h14v1" stroke="currentColor" strokeWidth="1.4" fill="none"/>
    </>
  ),

  'chart-workflow': () => (
    <>
      <rect x="2" y="3" width="7" height="5" rx="1"/>
      <rect x="15" y="3" width="7" height="5" rx="1"/>
      <rect x="2" y="16" width="7" height="5" rx="1"/>
      <rect x="15" y="16" width="7" height="5" rx="1"/>
      <path d="M9 5.5h6M9 18.5h6M5.5 8v8M18.5 8v8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    </>
  ),

  // ═══ Content · Event (3) ══════════════════════════════════════════════════

  'event-confetti': () => (
    <>
      <path d="M3 21 14 10l4 4-11 11a2 2 0 0 1-1.41.41l-3-.41a1 1 0 0 1-1-1l.41-3A2 2 0 0 1 3 21Z"/>
      <circle cx="17" cy="4" r="1.2"/>
      <circle cx="20" cy="8" r="1"/>
      <circle cx="20" cy="13" r="1"/>
      <circle cx="13" cy="3" r=".9"/>
      <circle cx="9" cy="5" r=".7"/>
      <path d="M15 7l1.5-1.5M19 5l1-1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </>
  ),

  'event-gift-box': () => (
    <>
      <rect x="3" y="11" width="18" height="11" rx="1.5"/>
      <rect x="11" y="11" width="2" height="11" fill="#fff"/>
      <rect x="2" y="7" width="20" height="4.5" rx="1"/>
      <rect x="11" y="7" width="2" height="4.5" fill="#fff"/>
      <path d="M12 7c-2 0-3.5-1.5-3.5-3a1.5 1.5 0 0 1 3 0c0 1.5 0 3 .5 3Zm0 0c2 0 3.5-1.5 3.5-3a1.5 1.5 0 0 0-3 0c0 1.5 0 3-.5 3Z"/>
    </>
  ),

  'event-pumpkin': () => (
    <>
      {/* Body */}
      <ellipse cx="12" cy="14" rx="9" ry="7"/>
      {/* Stem */}
      <path d="M11 4a2 2 0 0 1 2-2h1v3a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1V4Z"/>
      {/* Lines defining segments */}
      <path d="M8 8v12M16 8v12" stroke="#fff" strokeWidth="1" fill="none"/>
      {/* Face */}
      <path d="M8 13l2-2 2 2-2 2-2-2Z" fill="#fff"/>
      <path d="M14 13l2-2 2 2-2 2-2-2Z" fill="#fff"/>
      <path d="M9 17h6l-1 1.5h-4L9 17Z" fill="#fff"/>
    </>
  ),

  // ═══ Status (7) ═══════════════════════════════════════════════════════════

  'status-success': () => (
    <>
      <circle cx="12" cy="12" r="9.5"/>
      <path d="M16.7 9.3a1 1 0 0 1 0 1.4l-5.5 5.5a1 1 0 0 1-1.4 0l-2.5-2.5a1 1 0 1 1 1.4-1.4l1.8 1.8 4.8-4.8a1 1 0 0 1 1.4 0Z" fill="#fff"/>
    </>
  ),

  'status-warning': () => (
    <>
      <path d="M11.13 3.16a1 1 0 0 1 1.74 0l9.5 16.5a1 1 0 0 1-.87 1.5h-19a1 1 0 0 1-.87-1.5l9.5-16.5Z"/>
      <rect x="11" y="9" width="2" height="6" rx="1" fill="#fff"/>
      <circle cx="12" cy="17.5" r="1.1" fill="#fff"/>
    </>
  ),

  'status-error': () => (
    <>
      <circle cx="12" cy="12" r="9.5"/>
      <path d="M8.65 8.65a1 1 0 0 1 1.4 0L12 10.6l1.95-1.95a1 1 0 1 1 1.4 1.4L13.4 12l1.95 1.95a1 1 0 1 1-1.4 1.4L12 13.4l-1.95 1.95a1 1 0 1 1-1.4-1.4L10.6 12 8.65 10.05a1 1 0 0 1 0-1.4Z" fill="#fff"/>
    </>
  ),

  'status-info': () => (
    <>
      <circle cx="12" cy="12" r="9.5"/>
      <circle cx="12" cy="8" r="1.2" fill="#fff"/>
      <rect x="11" y="10.5" width="2" height="7" rx="1" fill="#fff"/>
    </>
  ),

  'status-pending': () => (
    <>
      <circle cx="12" cy="12" r="9.5"/>
      <path d="M12 6.5a1 1 0 0 0-1 1V13a1 1 0 0 0 .29.7l3 3a1 1 0 1 0 1.42-1.4l-2.71-2.72V7.5a1 1 0 0 0-1-1Z" fill="#fff"/>
    </>
  ),

  'status-tip': () => (
    <>
      <path d="M12 2a7 7 0 0 0-4.5 12.4c.95.8 1.5 1.9 1.5 3.1V18h6v-.5c0-1.2.55-2.3 1.5-3.1A7 7 0 0 0 12 2Z"/>
      <rect x="9" y="19" width="6" height="2" rx="1"/>
      <path d="M10.4 22a1.6 1.6 0 0 0 3.2 0h-3.2Z"/>
    </>
  ),

  'status-feature': () => (
    <>
      <path d="M14.5 5.5 5 15a2 2 0 0 0-.5 1l-1.5 5a1 1 0 0 0 1.25 1.25l5-1.5a2 2 0 0 0 1-.5L19.5 11.5l-5-6Zm-7.2 13.6 2.6-2.6-1.65-1.65a.7.7 0 0 0-1.15.25l-.7 3.1.9.9Z" fillRule="evenodd" clipRule="evenodd"/>
      <circle cx="17.5" cy="3" r="1.2"/>
      <circle cx="21" cy="6.5" r="1"/>
      <circle cx="21" cy="11" r=".9"/>
      <circle cx="14" cy="2.5" r=".8"/>
    </>
  ),
};

// ╭───────────────────────────────────────────────────────────────────────────╮
// │ <Icon name="..." size="md" className="..." style={{...}} />               │
// │   size: 'sm' (16) | 'md' (20) | 'lg' (24) | 'xl' (32) | <number>          │
// │   color: imposta CSS color (eredita su currentColor)                      │
// │                                                                           │
// │ Per accessibilità: di default aria-hidden="true". Se l'icona è l'unico    │
// │ contenuto di un button, mettere aria-label SUL BUTTON, non sull'icona.    │
// ╰───────────────────────────────────────────────────────────────────────────╯

const SF_SIZE_MAP = { sm: 16, md: 20, lg: 24, xl: 32 };

function Icon({ name, size = 'md', color, className, style, ...rest }) {
  const Path = SfIcons[name];
  if (!Path) {
    console.warn(`<Icon>: nome "${name}" non presente in SfIcons.`);
    return null;
  }
  const px = typeof size === 'number' ? size : (SF_SIZE_MAP[size] || 20);
  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ flexShrink: 0, display: 'inline-block', verticalAlign: 'middle', color, ...style }}
      aria-hidden="true"
      {...rest}
    >
      <Path />
    </svg>
  );
}

// Famiglie per la pagina di preview (e per i consumer che vogliono raggruppare)
const SfIconFamilies = {
  ui: ['grid','magnifying-glass','bell','gear','plus','xmark','grip','check','pencil','chevron-right','star','sparkles','headphones','arrow-up-right','arrow-down-right','download'],
  food: ['food-flame','food-meal','food-pizza','food-hamburger','food-taco','food-salad','food-pasta','food-sandwich','food-sushi','food-soup','food-steak','food-seafood','food-vegetables','food-dessert','food-ice-cream'],
  drink: ['drink-coffee','drink-coffee-to-go','drink-tea','drink-cocktail','drink-wine','drink-beer','drink-champagne','drink-juice','drink-water-bottle','drink-milkshake'],
  commerce: ['commerce-wallet','commerce-receipt','commerce-bank-cards','commerce-cart','commerce-bag','commerce-coins','commerce-price-tag','commerce-discount','commerce-gift','commerce-delivery','commerce-in-transit','commerce-coupon','commerce-money'],
  people: ['people-customer','people-chef','people-waiter','people-manager','people-staff-group','people-female-user','people-user-circle'],
  time: ['time-calendar','time-clock','time-stopwatch','time-alarm','time-history','time-schedule'],
  place: ['place-table','place-restaurant','place-food-cart','place-building','place-map-pin','place-truck'],
  chart: ['chart-bar','chart-area','chart-doughnut','chart-positive-dynamic','chart-mind-map','chart-flow-chart','chart-workflow'],
  event: ['event-confetti','event-gift-box','event-pumpkin'],
  status: ['status-success','status-warning','status-error','status-info','status-pending','status-tip','status-feature'],
};

window.SfIcons = SfIcons;
window.SfIconFamilies = SfIconFamilies;
window.Icon = Icon;
