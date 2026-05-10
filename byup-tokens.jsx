// byup — Design tokens unificati
// Single source of truth per radius, type scale, spacing, colors, shadows, button states.
// Caricare prima di qualsiasi altro file JSX della pagina.

const BU = {
  // ─── Color palette ─────────────────────────────────
  // Brand
  PINK:        '#F26B7A',
  PINK_DARK:   '#BE185D',
  PINK_SOFT:   '#FFE0DD',
  PINK_BG:     '#FFF5F8',

  WINE:        '#7C2D3C',
  WINE_SOFT:   '#FCE7F3',

  // Neutrals
  TEXT:        '#0F1115',
  MUTED:       '#6B7280',
  MUTED_SOFT:  '#9CA3AF',
  MUTED_LIGHT: '#D1D5DB',

  WHITE:       '#FFFFFF',
  BG:          '#F7F8FA',
  SURF:        '#FAFBFC',
  SURF_ALT:    '#F3F4F6',

  BORDER:      '#E5E7EB',
  BORDER_SOFT: '#F0F2F5',

  // Semantic
  GREEN:       '#16A34A',
  GREEN_SOFT:  '#DCFCE7',
  RED:         '#DC2626',
  RED_SOFT:    '#FEE2E2',
  AMBER:       '#D97706',
  AMBER_SOFT:  '#FEF3C7',
  BLUE:        '#2563EB',
  BLUE_SOFT:   '#DBEAFE',

  // Table headers (neutral, not branded)
  TH_BG:       '#F9FAFB',
  TH_TEXT:     '#6B7280',

  // ─── Border radius scale (4 step) ──────────────────
  R_SM:        8,    // chips, buttons, inputs, cards interne
  R_MD:        12,   // cards, modali, drawer
  R_LG:        16,   // hero cards, frame
  R_PILL:      999,  // pill/badge

  // ─── Type scale (6 step) ───────────────────────────
  T_XS:        11,   // micro labels, captions UPPERCASE
  T_SM:        13,   // body, table cells, metadata
  T_MD:        15,   // emphasized body, button labels
  T_LG:        18,   // section titles
  T_XL:        24,   // KPI numbers, page titles
  T_XXL:       32,   // hero numbers, big stats

  // Line heights
  LH_TIGHT:    1.2,
  LH_NORMAL:   1.4,
  LH_LOOSE:    1.6,

  // Letter spacing
  LS_TIGHT:    -0.4,
  LS_NORMAL:   0,
  LS_WIDE:     0.4,
  LS_CAPS:     0.6,

  // ─── Spacing (4px base) ─────────────────────────────
  S_1:  4,
  S_2:  8,
  S_3:  12,
  S_4:  16,
  S_5:  20,
  S_6:  24,
  S_8:  32,
  S_10: 40,

  // ─── Shadows ────────────────────────────────────────
  SHADOW_SM: '0 1px 2px rgba(0,0,0,0.04)',
  SHADOW_MD: '0 4px 12px rgba(0,0,0,0.06)',
  SHADOW_LG: '0 12px 36px rgba(0,0,0,0.12)',
  SHADOW_XL: '0 24px 64px rgba(0,0,0,0.18)',

  // ─── Table density ─────────────────────────────────
  TBL_ROW_PAD:    '14px 16px',  // comfortable
  TBL_HEAD_PAD:   '12px 16px',
  TBL_ROW_HEIGHT: 52,

  // ─── Transitions ───────────────────────────────────
  T_FAST:   '120ms ease',
  T_NORM:   '200ms ease',
  T_SLOW:   '320ms ease',
};

// ─── Button styles with full hover/active/focus states ──
const BU_BTN = {
  // Primary (dark fill)
  primary: {
    base: {
      padding: '10px 16px',
      background: BU.TEXT,
      color: BU.WHITE,
      border: 'none',
      borderRadius: BU.R_SM,
      fontSize: BU.T_SM,
      fontWeight: 700,
      cursor: 'pointer',
      fontFamily: 'inherit',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      transition: `background ${BU.T_FAST}, transform ${BU.T_FAST}, box-shadow ${BU.T_FAST}`,
      lineHeight: 1,
    },
    hoverBg:  '#1F2937',
    activeBg: '#0B0E13',
    focusRing: `0 0 0 3px ${BU.TEXT}22`,
  },
  // Pink (brand CTA)
  brand: {
    base: {
      padding: '10px 16px',
      background: BU.PINK,
      color: BU.WHITE,
      border: 'none',
      borderRadius: BU.R_SM,
      fontSize: BU.T_SM,
      fontWeight: 700,
      cursor: 'pointer',
      fontFamily: 'inherit',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      transition: `background ${BU.T_FAST}, transform ${BU.T_FAST}`,
      lineHeight: 1,
    },
    hoverBg:  '#E55A6A',
    activeBg: '#C9485A',
    focusRing: `0 0 0 3px ${BU.PINK}33`,
  },
  // Secondary (outline)
  secondary: {
    base: {
      padding: '10px 16px',
      background: BU.WHITE,
      color: BU.TEXT,
      border: `1px solid ${BU.BORDER}`,
      borderRadius: BU.R_SM,
      fontSize: BU.T_SM,
      fontWeight: 600,
      cursor: 'pointer',
      fontFamily: 'inherit',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      transition: `background ${BU.T_FAST}, border-color ${BU.T_FAST}`,
      lineHeight: 1,
    },
    hoverBg: BU.SURF,
    hoverBorder: BU.MUTED_LIGHT,
    activeBg: BU.SURF_ALT,
  },
  // Ghost (no border)
  ghost: {
    base: {
      padding: '8px 12px',
      background: 'transparent',
      color: BU.TEXT,
      border: 'none',
      borderRadius: BU.R_SM,
      fontSize: BU.T_SM,
      fontWeight: 600,
      cursor: 'pointer',
      fontFamily: 'inherit',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      transition: `background ${BU.T_FAST}`,
    },
    hoverBg: BU.SURF_ALT,
  },
  // Danger
  danger: {
    base: {
      padding: '10px 16px',
      background: BU.RED,
      color: BU.WHITE,
      border: 'none',
      borderRadius: BU.R_SM,
      fontSize: BU.T_SM,
      fontWeight: 700,
      cursor: 'pointer',
      fontFamily: 'inherit',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
    },
    hoverBg: '#B91C1C',
  },
  // Disabled style (apply over any variant)
  disabled: {
    background: BU.BORDER,
    color: BU.MUTED,
    cursor: 'not-allowed',
    opacity: 1,
  },
};

// ─── React Button component with hover/active/focus baked in ───
function BuButton({ variant = 'primary', disabled, children, style, ...rest }) {
  const cfg = BU_BTN[variant] || BU_BTN.primary;
  const [hover, setHover] = React.useState(false);
  const [active, setActive] = React.useState(false);
  const [focus, setFocus] = React.useState(false);

  const dynamicStyle = disabled ? BU_BTN.disabled : {
    ...(hover && cfg.hoverBg ? { background: cfg.hoverBg } : {}),
    ...(hover && cfg.hoverBorder ? { borderColor: cfg.hoverBorder } : {}),
    ...(active && cfg.activeBg ? { background: cfg.activeBg, transform: 'translateY(0.5px)' } : {}),
    ...(focus && cfg.focusRing ? { boxShadow: cfg.focusRing, outline: 'none' } : {}),
  };

  return (
    <button
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setActive(false); }}
      onMouseDown={() => setActive(true)}
      onMouseUp={() => setActive(false)}
      onFocus={() => setFocus(true)}
      onBlur={() => setFocus(false)}
      style={{ ...cfg.base, ...dynamicStyle, ...style }}
      {...rest}
    >
      {children}
    </button>
  );
}

window.BU = BU;
window.BU_BTN = BU_BTN;
window.BuButton = BuButton;
