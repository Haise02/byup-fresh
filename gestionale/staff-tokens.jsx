// byup Staff — Design tokens (mobile / waiter app)
// Estende byup-tokens (BU) con token specifici del touch + stati tavolo.

const ST = {
  // Brand
  PINK:       '#F26B7A',
  PINK_DARK:  '#BE185D',
  PINK_SOFT:  '#FFE0DD',
  PINK_BG:    '#FFF5F8',
  WINE:       '#7C2D3C',
  WINE_SOFT:  '#FCE7F3',

  // Neutrals
  TEXT:       '#0F1115',
  TEXT_SOFT:  '#1F2937',
  MUTED:      '#6B7280',
  MUTED_2:    '#9CA3AF',
  MUTED_3:    '#D1D5DB',
  WHITE:      '#FFFFFF',
  BG:         '#F7F8FA',
  SURF:       '#FAFBFC',
  SURF_ALT:   '#F3F4F6',
  BORDER:     '#E5E7EB',
  BORDER_SOFT:'#F0F2F5',

  // Stati tavolo (semantici)
  ST_FREE:        '#9CA3AF',  // libero
  ST_FREE_BG:     '#F3F4F6',
  ST_BOOKED:      '#D97706',  // prenotato
  ST_BOOKED_BG:   '#FEF3C7',
  ST_BUSY:        '#16A34A',  // occupato in corso
  ST_BUSY_BG:     '#DCFCE7',
  ST_READY:       '#BE185D',  // pronto da servire (urgente)
  ST_READY_BG:    '#FCE7F3',
  ST_BILL:        '#0F1115',  // conto richiesto
  ST_BILL_BG:     '#E5E7EB',

  // Tipografia mobile (più grande di desktop per touch)
  T_XS:   12,
  T_SM:   14,
  T_BASE: 16,
  T_MD:   18,
  T_LG:   22,
  T_XL:   28,
  T_HERO: 36,

  // Spacing
  S_1: 4, S_2: 8, S_3: 12, S_4: 16, S_5: 20, S_6: 24, S_8: 32,

  // Radius
  R_SM: 10, R_MD: 14, R_LG: 18, R_XL: 24, R_PILL: 999,

  // Shadows (mobile, più morbide)
  SH_SM:  '0 1px 2px rgba(15,17,21,0.04), 0 1px 3px rgba(15,17,21,0.04)',
  SH_MD:  '0 2px 8px rgba(15,17,21,0.06), 0 4px 16px rgba(15,17,21,0.04)',
  SH_LG:  '0 8px 24px rgba(15,17,21,0.10), 0 4px 12px rgba(15,17,21,0.06)',
  SH_FAB: '0 6px 18px rgba(190,24,93,0.30), 0 2px 6px rgba(190,24,93,0.18)',

  // Hit target minimo (44pt iOS)
  HIT: 44,
};

// ─── Allergeni: icone + nome standardizzati ──────────────────
const ALLERGENI = {
  glutine:  { name: 'Glutine',     color: '#D97706', bg: '#FEF3C7', icon: '🌾' },
  lattosio: { name: 'Lattosio',    color: '#3B82F6', bg: '#DBEAFE', icon: '🥛' },
  noci:     { name: 'Frutta secca',color: '#92400E', bg: '#FED7AA', icon: '🥜' },
  uova:     { name: 'Uova',        color: '#CA8A04', bg: '#FEF9C3', icon: '🥚' },
  pesce:    { name: 'Pesce',       color: '#0891B2', bg: '#CFFAFE', icon: '🐟' },
  crost:    { name: 'Crostacei',   color: '#DC2626', bg: '#FEE2E2', icon: '🦐' },
  soia:     { name: 'Soia',        color: '#65A30D', bg: '#ECFCCB', icon: '🌱' },
  sedano:   { name: 'Sedano',      color: '#16A34A', bg: '#DCFCE7', icon: '🌿' },
};

// ─── Stato tavolo: helper per styling ─────────────────────────
function statoConfig(stato) {
  const map = {
    libero:    { color: ST.ST_FREE,   bg: ST.ST_FREE_BG,   label: 'Libero' },
    prenotato: { color: ST.ST_BOOKED, bg: ST.ST_BOOKED_BG, label: 'Prenotato' },
    occupato:  { color: ST.ST_BUSY,   bg: ST.ST_BUSY_BG,   label: 'In corso' },
    pronto:    { color: ST.ST_READY,  bg: ST.ST_READY_BG,  label: 'Da servire' },
    conto:     { color: ST.ST_BILL,   bg: ST.ST_BILL_BG,   label: 'Conto richiesto' },
  };
  return map[stato] || map.libero;
}

// ─── Icone (set coerente, stroke 1.8) ─────────────────────────
const I = {
  Bell:  (p={}) => <svg width={p.s||22} height={p.s||22} viewBox="0 0 24 24" fill="none" stroke={p.c||ST.TEXT} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0112 0c0 7 3 9 3 9H3s3-2 3-9z"/><path d="M10.3 21a1.94 1.94 0 003.4 0"/></svg>,
  Search:(p={}) => <svg width={p.s||20} height={p.s||20} viewBox="0 0 24 24" fill="none" stroke={p.c||ST.TEXT} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.5" y2="16.5"/></svg>,
  Sliders:(p={})=> <svg width={p.s||20} height={p.s||20} viewBox="0 0 24 24" fill="none" stroke={p.c||ST.TEXT} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/><circle cx="9" cy="6" r="2.2" fill="#fff"/><circle cx="15" cy="12" r="2.2" fill="#fff"/><circle cx="8" cy="18" r="2.2" fill="#fff"/></svg>,
  Back:  (p={}) => <svg width={p.s||20} height={p.s||20} viewBox="0 0 24 24" fill="none" stroke={p.c||ST.TEXT} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 6 9 12 15 18"/></svg>,
  Plus:  (p={}) => <svg width={p.s||20} height={p.s||20} viewBox="0 0 24 24" fill="none" stroke={p.c||ST.TEXT} strokeWidth="2.4" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Minus: (p={}) => <svg width={p.s||20} height={p.s||20} viewBox="0 0 24 24" fill="none" stroke={p.c||ST.TEXT} strokeWidth="2.4" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Close: (p={}) => <svg width={p.s||20} height={p.s||20} viewBox="0 0 24 24" fill="none" stroke={p.c||ST.TEXT} strokeWidth="2.2" strokeLinecap="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>,
  Check: (p={}) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke={p.c||ST.PINK} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 12 10 18 20 6"/></svg>,
  More:  (p={}) => <svg width={p.s||20} height={p.s||20} viewBox="0 0 24 24" fill={p.c||ST.TEXT}><circle cx="5" cy="12" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="19" cy="12" r="1.8"/></svg>,
  ChevDown:(p={})=> <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke={p.c||ST.TEXT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>,
  ChevRight:(p={})=> <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke={p.c||ST.TEXT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 6 15 12 9 18"/></svg>,
  Clock: (p={}) => <svg width={p.s||14} height={p.s||14} viewBox="0 0 24 24" fill="none" stroke={p.c||ST.MUTED} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/></svg>,
  User:  (p={}) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke={p.c||ST.TEXT} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21 C4 16.5 7.5 14 12 14 C16.5 14 20 16.5 20 21"/></svg>,
  Users: (p={}) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke={p.c||ST.TEXT} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>,
  Alert: (p={}) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke={p.c||ST.PINK_DARK} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.3 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><circle cx="12" cy="17" r="0.5" fill="currentColor"/></svg>,
  Card:  (p={}) => <svg width={p.s||20} height={p.s||20} viewBox="0 0 24 24" fill="none" stroke={p.c||ST.TEXT} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>,
  Receipt:(p={})=> <svg width={p.s||20} height={p.s||20} viewBox="0 0 24 24" fill="none" stroke={p.c||ST.TEXT} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 3v18l3-2 3 2 3-2 3 2 3-2V3"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/></svg>,
  Tables:(p={})=> <svg width={p.s||22} height={p.s||22} viewBox="0 0 24 24" fill="none" stroke={p.c||ST.TEXT} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="8" height="8" rx="1"/><rect x="13" y="4" width="8" height="8" rx="1"/><rect x="3" y="14" width="8" height="6" rx="1"/><rect x="13" y="14" width="8" height="6" rx="1"/></svg>,
  Kitchen:(p={})=> <svg width={p.s||22} height={p.s||22} viewBox="0 0 24 24" fill="none" stroke={p.c||ST.TEXT} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12h16"/><path d="M5 12V8a7 7 0 0114 0v4"/><path d="M3 16h18"/><path d="M5 12v8a1 1 0 001 1h12a1 1 0 001-1v-8"/></svg>,
  Menu:  (p={}) => <svg width={p.s||22} height={p.s||22} viewBox="0 0 24 24" fill="none" stroke={p.c||ST.TEXT} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 4h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2z"/><line x1="8" y1="9" x2="16" y2="9"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="13" y2="17"/></svg>,
  Profile:(p={})=> <svg width={p.s||22} height={p.s||22} viewBox="0 0 24 24" fill="none" stroke={p.c||ST.TEXT} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21 C4 16.5 7.5 14 12 14 C16.5 14 20 16.5 20 21"/></svg>,
  Trash: (p={}) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke={p.c||ST.MUTED} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>,
  Edit:  (p={}) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke={p.c||ST.TEXT} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  Note:  (p={}) => <svg width={p.s||14} height={p.s||14} viewBox="0 0 24 24" fill="none" stroke={p.c||ST.MUTED} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="13" y2="17"/></svg>,
  Wifi:  (p={}) => <svg width={p.s||34} height={p.s||34} viewBox="0 0 24 24" fill="none" stroke={p.c||ST.TEXT} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.55a11 11 0 0114.08 0"/><path d="M1.42 9a16 16 0 0121.16 0"/><path d="M8.53 16.11a6 6 0 016.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>,
  Settings:(p={})=> <svg width={p.s||20} height={p.s||20} viewBox="0 0 24 24" fill="none" stroke={p.c||ST.TEXT} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
  Logout:(p={})=> <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke={p.c||ST.TEXT} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  Split: (p={}) => <svg width={p.s||18} height={p.s||18} viewBox="0 0 24 24" fill="none" stroke={p.c||ST.TEXT} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M16 3h5v5"/><path d="M8 21H3v-5"/><path d="M21 3l-7 7"/><path d="M3 21l7-7"/></svg>,
  Merge: (p={}) => <svg width={p.s||18} height={p.s||18} viewBox="0 0 24 24" fill="none" stroke={p.c||ST.TEXT} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="8 7 12 3 16 7"/><line x1="12" y1="3" x2="12" y2="15"/><path d="M5 21h14"/></svg>,
  Walk:  (p={}) => <svg width={p.s||18} height={p.s||18} viewBox="0 0 24 24" fill="none" stroke={p.c||ST.TEXT} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="13" cy="4" r="2"/><path d="M4 22l4-9 4 5v6"/><path d="M12 12l4-2 4 4-3 3"/><path d="M9 8l-2 4 4 2"/></svg>,
  QR:    (p={}) => <svg width={p.s||20} height={p.s||20} viewBox="0 0 32 32" fill="none" stroke={p.c||ST.TEXT} strokeWidth="2.2"><rect x="4" y="4" width="9" height="9"/><rect x="19" y="4" width="9" height="9"/><rect x="4" y="19" width="9" height="9"/><rect x="19" y="19" width="3" height="3"/><rect x="25" y="19" width="3" height="3"/><rect x="19" y="25" width="3" height="3"/><rect x="25" y="25" width="3" height="3"/></svg>,
  Stats: (p={}) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke={p.c||ST.TEXT} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  Calendar:(p={})=> <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke={p.c||ST.TEXT} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  Refresh:(p={})=> <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke={p.c||ST.TEXT} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><polyline points="23 20 23 14 17 14"/><path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15"/></svg>,
};

// ─── Componenti atomici ───────────────────────────────────────
function Btn({ variant='primary', children, onClick, disabled, style, full, size='md', ...rest }) {
  const sizes = { sm: { h: 36, fs: 13, px: 14 }, md: { h: 44, fs: 14.5, px: 18 }, lg: { h: 52, fs: 15.5, px: 22 } };
  const sz = sizes[size];
  const variants = {
    primary: { bg: ST.PINK_DARK, c: '#fff', b: 'transparent' },
    pink:    { bg: ST.PINK, c: '#fff', b: 'transparent' },
    dark:    { bg: ST.TEXT, c: '#fff', b: 'transparent' },
    secondary:{ bg: '#fff', c: ST.TEXT, b: ST.BORDER },
    soft:    { bg: ST.SURF_ALT, c: ST.TEXT, b: 'transparent' },
    danger:  { bg: '#fff', c: '#DC2626', b: '#FCA5A5' },
    ghost:   { bg: 'transparent', c: ST.TEXT, b: 'transparent' },
  };
  const v = variants[variant] || variants.primary;
  return (
    <button onClick={onClick} disabled={disabled} style={{
      height: sz.h, padding: `0 ${sz.px}px`, borderRadius: ST.R_PILL,
      background: disabled ? ST.BORDER : v.bg, color: disabled ? ST.MUTED : v.c,
      border: `1.5px solid ${disabled ? ST.BORDER : v.b}`,
      fontSize: sz.fs, fontWeight: 600, fontFamily: 'inherit',
      cursor: disabled ? 'not-allowed' : 'pointer',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      width: full ? '100%' : 'auto',
      transition: 'background 120ms ease, transform 80ms',
      ...style,
    }} {...rest}>{children}</button>
  );
}

function Chip({ children, color, bg, style }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      height: 22, padding: '0 8px', borderRadius: ST.R_PILL,
      fontSize: 11.5, fontWeight: 600,
      background: bg || ST.SURF_ALT, color: color || ST.MUTED,
      ...style,
    }}>{children}</span>
  );
}

function StatusDot({ stato, size = 8 }) {
  const c = statoConfig(stato).color;
  return (
    <span style={{
      width: size, height: size, borderRadius: ST.R_PILL,
      background: c, display: 'inline-block', flexShrink: 0,
      boxShadow: stato === 'pronto' ? `0 0 0 3px ${c}33` : 'none',
    }}/>
  );
}

function AllergeneIcon({ id, size = 22 }) {
  const a = ALLERGENI[id];
  if (!a) return null;
  return (
    <span style={{
      width: size, height: size, borderRadius: ST.R_PILL,
      background: a.bg, display: 'inline-flex',
      alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.55,
    }} title={a.name}>{a.icon}</span>
  );
}

function Stepper({ value, onChange, min = 1, max = 99 }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center',
      border: `1.5px solid ${ST.BORDER}`, borderRadius: ST.R_PILL,
      height: 36, padding: '0 4px', background: '#fff',
    }}>
      <button onClick={() => value > min && onChange(value - 1)} style={{
        width: 28, height: 28, borderRadius: ST.R_PILL, border: 'none', background: 'transparent',
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}><I.Minus s={16} c={ST.TEXT}/></button>
      <span style={{ minWidth: 24, textAlign: 'center', fontSize: 14, fontWeight: 700 }}>{value}</span>
      <button onClick={() => value < max && onChange(value + 1)} style={{
        width: 28, height: 28, borderRadius: ST.R_PILL, border: 'none', background: 'transparent',
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}><I.Plus s={16} c={ST.TEXT}/></button>
    </div>
  );
}

// ─── Image placeholder per piatto (gradient generato) ────────
function DishImage({ name, kind = 'piatto', style }) {
  // Gradient deterministico dal nome
  const hash = (name || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const palettes = [
    ['#FED7AA', '#F97316'],   // arancio
    ['#FEE2E2', '#DC2626'],   // rosso
    ['#DCFCE7', '#16A34A'],   // verde
    ['#FEF3C7', '#D97706'],   // ambra
    ['#FCE7F3', '#BE185D'],   // rosa
    ['#E0E7FF', '#6366F1'],   // viola
    ['#CFFAFE', '#0891B2'],   // ciano
  ];
  const [c1, c2] = palettes[hash % palettes.length];
  return (
    <div style={{
      width: '100%', height: '100%',
      background: `linear-gradient(135deg, ${c1} 0%, ${c2} 130%)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden',
      ...style,
    }}>
      {/* circle decoration */}
      <div style={{
        position: 'absolute', width: '60%', height: '60%',
        borderRadius: ST.R_PILL, background: 'rgba(255,255,255,0.18)',
        top: '20%', left: '20%',
      }}/>
      <div style={{
        position: 'absolute', width: '40%', height: '40%',
        borderRadius: ST.R_PILL, background: 'rgba(255,255,255,0.25)',
        top: '30%', left: '30%',
      }}/>
      <span style={{
        position: 'relative', fontSize: 11, fontWeight: 700,
        color: 'rgba(255,255,255,0.95)', letterSpacing: 0.5,
        textTransform: 'uppercase', textAlign: 'center', padding: '0 8px',
        textShadow: '0 1px 2px rgba(0,0,0,0.2)',
      }}>{name}</span>
    </div>
  );
}

Object.assign(window, { ST, ALLERGENI, statoConfig, I, Btn, Chip, StatusDot, AllergeneIcon, Stepper, DishImage });
