// Onboarding — shared design tokens & icons
//
// PALETTE PHILOSOPHY
// ──────────────────
// Brand pink is signature, not a workhorse. Use it for ONE primary CTA per
// screen, the logo, and active-state indicators. Everything else uses neutral
// or semantic tokens.
//
//   • BRAND      — rosa byup, signature only
//   • ACTION_*   — primary (pink) vs. secondary (dark neutral, has weight)
//   • AI_*       — viola distinto, separa l'AI dalle azioni standard
//   • Stati hover sono token, non opacità inline.
const ONB = {
  // ─── Brand ────────────────────────────────────────────────────
  BRAND: '#FF5A5F',
  BRAND_DARK: '#E04347',
  BRAND_SOFT: '#FFE0DD',
  BRAND_TINT: '#FFF5F4',     // ~lightest, per backgrounds estesi

  // ─── Action — primary (uses brand) ────────────────────────────
  ACTION_PRIMARY: '#FF5A5F',
  ACTION_PRIMARY_HOVER: '#F04A4F',

  // ─── Action — secondary (dark neutral with weight) ────────────
  ACTION_SECONDARY: '#1F2229',

  // ─── AI — distinct from brand ─────────────────────────────────
  AI: '#7C3AED',
  AI_DARK: '#6D28D9',
  AI_SOFT: '#EDE9FE',
  AI_TINT: '#F5F3FF',

  // ─── Text ─────────────────────────────────────────────────────
  TEXT: '#1A1D24',           // più morbido del nero puro precedente
  MUTED: '#6b6b6b',
  MUTED_LIGHT: '#9a9a9a',

  // ─── Surface ──────────────────────────────────────────────────
  BG: '#F7F8FA',
  BG_SOFT: '#FAFBFC',

  // ─── Semantic ─────────────────────────────────────────────────
  GREEN: '#16A34A',
  GREEN_SOFT: '#DCFCE7',
  AMBER: '#D97706',
  RED: '#DC2626',

  // ─── Legacy alias (NON usare in codice nuovo) ─────────────────
  // Alias di BRAND, ancora consumato dall'icona Sparkle qui sotto.
  PINK: '#FF5A5F',

  // ─── Room accents — cycling palette per le sale (Step 3) ──────
  // Tinte calde e fredde miste, saturazione moderata. NON includono BRAND
  // (riservato a CTA) né AI (riservato AI features). Cycling 5-elements
  // sulla room index così sale consecutive non collidono visivamente.
  ROOM_ACCENTS: [
    {name: 'Coral',   fg: '#E37161', soft: '#FFF1ED'},
    {name: 'Sage',    fg: '#5B8270', soft: '#EAF1EC'},
    {name: 'Wine',    fg: '#944D5E', soft: '#FBEDF0'},
    {name: 'Saffron', fg: '#C7882B', soft: '#FCF3DF'},
    {name: 'Slate',   fg: '#4A5568', soft: '#EEF0F3'},
  ],
};

const OnbIcon = {
  Logo: (p) => (
    // Asset corrente del prodotto: Fresh.png (capitalized, case-sensitive).
    // height = fontSize × 2 → l'API parametrica permette sizing per contesto
    // (header onboarding = 18 → 36px; login = 22 → 44px).
    <img src="Fresh.png" alt="Byup Fresh" style={{
      height: (p.fontSize || 24) * 2, width:'auto', display:'block',
    }}/>
  ),
  Sparkle: (p) => (
    <svg width={p.size||20} height={p.size||20} viewBox="0 0 24 24" fill={p.color||ONB.PINK}>
      <path d="M12 2 L13.5 9 L20 10.5 L13.5 12 L12 19 L10.5 12 L4 10.5 L10.5 9 Z"/>
      <path d="M19 4 L19.7 6 L21.5 6.5 L19.7 7 L19 9 L18.3 7 L16.5 6.5 L18.3 6 Z"/>
    </svg>
  ),
  Upload: (p) => (
    <svg width={p.size||24} height={p.size||24} viewBox="0 0 24 24" fill="none" stroke={p.color||ONB.TEXT} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
      <polyline points="17 8 12 3 7 8"/>
      <line x1="12" y1="3" x2="12" y2="15"/>
    </svg>
  ),
  PDF: (p) => (
    <svg width={p.size||22} height={p.size||22} viewBox="0 0 24 24" fill="none" stroke={p.color||ONB.TEXT} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
    </svg>
  ),
  Image: (p) => (
    <svg width={p.size||22} height={p.size||22} viewBox="0 0 24 24" fill="none" stroke={p.color||ONB.TEXT} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <circle cx="8.5" cy="8.5" r="1.5"/>
      <polyline points="21 15 16 10 5 21"/>
    </svg>
  ),
  Camera: (p) => (
    <svg width={p.size||22} height={p.size||22} viewBox="0 0 24 24" fill="none" stroke={p.color||ONB.TEXT} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
      <circle cx="12" cy="13" r="4"/>
    </svg>
  ),
  Check: (p) => (
    <svg width={p.size||16} height={p.size||16} viewBox="0 0 24 24" fill="none" stroke={p.color||'#fff'} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  ChevronDown: (p) => (
    <svg width={p.size||16} height={p.size||16} viewBox="0 0 24 24" fill="none" stroke={p.color||ONB.TEXT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  ),
  Plus: (p) => (
    <svg width={p.size||16} height={p.size||16} viewBox="0 0 24 24" fill="none" stroke={p.color||ONB.TEXT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"/>
      <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  Eye: (p) => (
    <svg width={p.size||16} height={p.size||16} viewBox="0 0 24 24" fill="none" stroke={p.color||ONB.MUTED} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ),
  Trash: (p) => (
    <svg width={p.size||14} height={p.size||14} viewBox="0 0 24 24" fill="none" stroke={p.color||ONB.MUTED} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
      <path d="M10 11v6M14 11v6"/>
    </svg>
  ),
  EyeOff: (p) => (
    <svg width={p.size||16} height={p.size||16} viewBox="0 0 24 24" fill="none" stroke={p.color||ONB.MUTED} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  ),
  ArrowRight: (p) => (
    <svg width={p.size||14} height={p.size||14} viewBox="0 0 24 24" fill="none" stroke={p.color||ONB.TEXT} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"/>
      <polyline points="12 5 19 12 12 19"/>
    </svg>
  ),
  ArrowLeft: (p) => (
    <svg width={p.size||14} height={p.size||14} viewBox="0 0 24 24" fill="none" stroke={p.color||ONB.TEXT} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12"/>
      <polyline points="12 19 5 12 12 5"/>
    </svg>
  ),
};

Object.assign(window, { ONB, OnbIcon });


// ─── Feedback universale del cliccabile (regola globale del gestionale) ─────
// TUTTO ciò che è pensato per essere cliccato reagisce al passaggio e al
// click: <button>, <select>, link e qualunque elemento con cursore pointer
// (tab, chip, righe, tile, opzioni). I feedback custom inline restano
// prioritari. Sui contenitori si usano solo ombre/outline: filter e
// transform creerebbero containing block e romperebbero i modali interni.
(function () {
  if (typeof document === 'undefined' || document.getElementById('pn-btn-feedback')) return;
  const st = document.createElement('style');
  st.id = 'pn-btn-feedback';
  st.textContent = `
    button { transition: transform 120ms ease, filter 140ms ease, box-shadow 150ms ease; }
    button:not(:disabled) { cursor: pointer; }
    button:not(:disabled):hover { filter: brightness(0.95); box-shadow: 0 3px 10px rgba(15, 17, 21, 0.14); }
    button[style*="background: rgb(15, 17, 21)"]:not(:disabled):hover,
    button[style*="background-color: rgb(15, 17, 21)"]:not(:disabled):hover,
    button[style*="background: rgb(0, 0, 0)"]:not(:disabled):hover,
    button[style*="background-color: rgb(0, 0, 0)"]:not(:disabled):hover,
    button[style*="background: rgb(17, 17, 17)"]:not(:disabled):hover,
    button[style*="rgb(42, 45, 54)"]:not(:disabled):hover,
    button[style*="background: rgb(124, 45, 60)"]:not(:disabled):hover {
      transform: scale(1.05);
    }
    button:not(:disabled):active { transform: scale(0.96); filter: brightness(0.90); }
    select:not(:disabled) { cursor: pointer; transition: filter 140ms ease; }
    select:not(:disabled):hover { filter: brightness(0.96); }
    select:not(:disabled):active { filter: brightness(0.92); }
    [style*="cursor: pointer"]:not(button):not(select):not([data-no-fx]),
    [style*="cursor:pointer"]:not(button):not(select):not([data-no-fx]),
    a[href] {
      transition: box-shadow 150ms ease;
    }
    [style*="cursor: pointer"]:not(button):not(select):not([data-no-fx]):hover,
    [style*="cursor:pointer"]:not(button):not(select):not([data-no-fx]):hover,
    a[href]:hover {
      box-shadow: 0 0 0 1.5px rgba(15, 17, 21, 0.10), 0 6px 16px rgba(15, 17, 21, 0.08);
    }
    [style*="cursor: pointer"]:not(button):not(select):not([data-no-fx]):active,
    [style*="cursor:pointer"]:not(button):not(select):not([data-no-fx]):active,
    a[href]:active {
      box-shadow: 0 0 0 2px rgba(15, 17, 21, 0.16), 0 2px 6px rgba(15, 17, 21, 0.10);
    }
  `;
  document.head.appendChild(st);
})();
