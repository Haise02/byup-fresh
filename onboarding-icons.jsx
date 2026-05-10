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
//   • ACCENT_*   — neutri caldi per badge/callout informativi (NON rosa)
//   • Stati hover/pressed sono token, non opacità inline.
const ONB = {
  // ─── Brand ────────────────────────────────────────────────────
  BRAND: '#FF5A5F',
  BRAND_DARK: '#E04347',
  BRAND_HOVER: '#F04A4F',
  BRAND_PRESSED: '#D63A3F',
  BRAND_SOFT: '#FFE0DD',
  BRAND_TINT: '#FFF5F4',     // ~lightest, per backgrounds estesi

  // ─── Action — primary (uses brand) ────────────────────────────
  ACTION_PRIMARY: '#FF5A5F',
  ACTION_PRIMARY_HOVER: '#F04A4F',
  ACTION_PRIMARY_PRESSED: '#D63A3F',

  // ─── Action — secondary (dark neutral with weight) ────────────
  ACTION_SECONDARY: '#1F2229',
  ACTION_SECONDARY_HOVER: '#2A2D36',
  ACTION_SECONDARY_PRESSED: '#15171C',

  // ─── AI — distinct from brand ─────────────────────────────────
  AI: '#7C3AED',
  AI_DARK: '#6D28D9',
  AI_HOVER: '#6D28D9',
  AI_SOFT: '#EDE9FE',
  AI_TINT: '#F5F3FF',
  AI_GRADIENT: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)',

  // ─── Text ─────────────────────────────────────────────────────
  TEXT: '#1A1D24',           // più morbido del nero puro precedente
  TEXT_STRONG: '#0A0A0A',    // disponibile per casi rari
  MUTED: '#6b6b6b',
  MUTED_LIGHT: '#9a9a9a',

  // ─── Surface / borders ────────────────────────────────────────
  BORDER: '#E5E7EB',
  BORDER_SOFT: '#EFF1F4',
  BORDER_HOVER: '#D1D5DB',
  BG: '#F7F8FA',
  BG_SOFT: '#FAFBFC',

  // ─── Accent (per badge / callout informativi NON-brand) ───────
  ACCENT_WARM: '#FAF6F0',    // crema, per pillole "STEP X" neutre
  ACCENT_WARM_TEXT: '#7A6A55',

  // ─── Semantic ─────────────────────────────────────────────────
  GREEN: '#16A34A',
  GREEN_SOFT: '#DCFCE7',
  AMBER: '#D97706',
  AMBER_SOFT: '#FEF3C7',
  RED: '#DC2626',

  // ─── Legacy aliases (NON usare in codice nuovo) ───────────────
  // Mantenuti per non rompere i file esistenti durante la migrazione.
  PINK: '#FF5A5F',
  PINK_DARK: '#E04347',
  PINK_SOFT: '#FFE0DD',
  PURPLE: '#7C3AED',
  PURPLE_SOFT: '#EDE9FE',

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
    // Asset corrente del prodotto: fresh.png (lowercase).
    // height = fontSize × 2 → l'API parametrica permette sizing per contesto
    // (header onboarding = 18 → 36px; login = 22 → 44px).
    <img src="fresh.png" alt="Byup Fresh" style={{
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
  Link: (p) => (
    <svg width={p.size||22} height={p.size||22} viewBox="0 0 24 24" fill="none" stroke={p.color||ONB.TEXT} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 007.5.5l3-3a5 5 0 00-7-7l-1.7 1.7"/>
      <path d="M14 11a5 5 0 00-7.5-.5l-3 3a5 5 0 007 7l1.7-1.7"/>
    </svg>
  ),
  Check: (p) => (
    <svg width={p.size||16} height={p.size||16} viewBox="0 0 24 24" fill="none" stroke={p.color||'#fff'} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  ChevronRight: (p) => (
    <svg width={p.size||16} height={p.size||16} viewBox="0 0 24 24" fill="none" stroke={p.color||ONB.TEXT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  ),
  ChevronDown: (p) => (
    <svg width={p.size||16} height={p.size||16} viewBox="0 0 24 24" fill="none" stroke={p.color||ONB.TEXT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  ),
  Pencil: (p) => (
    <svg width={p.size||14} height={p.size||14} viewBox="0 0 24 24" fill="none" stroke={p.color||ONB.MUTED} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9"/>
      <path d="M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4z"/>
    </svg>
  ),
  Plus: (p) => (
    <svg width={p.size||16} height={p.size||16} viewBox="0 0 24 24" fill="none" stroke={p.color||ONB.TEXT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"/>
      <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  X: (p) => (
    <svg width={p.size||16} height={p.size||16} viewBox="0 0 24 24" fill="none" stroke={p.color||ONB.MUTED} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  AI: (p) => (
    <svg width={p.size||18} height={p.size||18} viewBox="0 0 24 24" fill="none">
      <path d="M12 2 L14 8 L20 10 L14 12 L12 18 L10 12 L4 10 L10 8 Z" fill={p.color||ONB.PINK}/>
      <circle cx="18" cy="5" r="1.5" fill={p.color||ONB.PINK}/>
      <circle cx="5" cy="17" r="1" fill={p.color||ONB.PINK}/>
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
  Building: (p) => (
    <svg width={p.size||16} height={p.size||16} viewBox="0 0 24 24" fill="none" stroke={p.color||ONB.TEXT} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2"/>
      <line x1="9" y1="22" x2="9" y2="18"/><line x1="15" y1="22" x2="15" y2="18"/>
      <line x1="8" y1="6" x2="10" y2="6"/><line x1="14" y1="6" x2="16" y2="6"/>
      <line x1="8" y1="10" x2="10" y2="10"/><line x1="14" y1="10" x2="16" y2="10"/>
      <line x1="8" y1="14" x2="10" y2="14"/><line x1="14" y1="14" x2="16" y2="14"/>
    </svg>
  ),
  CreditCard: (p) => (
    <svg width={p.size||16} height={p.size||16} viewBox="0 0 24 24" fill="none" stroke={p.color||ONB.TEXT} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="2"/>
      <line x1="2" y1="10" x2="22" y2="10"/>
    </svg>
  ),
  Receipt: (p) => (
    <svg width={p.size||16} height={p.size||16} viewBox="0 0 24 24" fill="none" stroke={p.color||ONB.TEXT} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 2v20l3-2 3 2 3-2 3 2 3-2V2"/>
      <line x1="8" y1="8" x2="16" y2="8"/>
      <line x1="8" y1="12" x2="14" y2="12"/>
      <line x1="8" y1="16" x2="12" y2="16"/>
    </svg>
  ),
  Layout: (p) => (
    <svg width={p.size||16} height={p.size||16} viewBox="0 0 24 24" fill="none" stroke={p.color||ONB.TEXT} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <line x1="3" y1="9" x2="21" y2="9"/>
      <line x1="9" y1="21" x2="9" y2="9"/>
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
