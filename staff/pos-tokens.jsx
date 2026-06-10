// Byup Staff — Design tokens
// I COLORI sono ereditati dalla vecchia app (unica cosa conservata).
// Tutto il resto (componenti, icone) è ripensato per un POS stile SumUp.

const ST = {
  // Brand
  PINK:       '#F26B7A',
  PINK_DARK:  '#BE185D',
  PINK_SOFT:  '#FFE0DD',
  WINE:       '#7C2D3C',

  // Neutrals
  TEXT:       '#0F1115',
  TEXT_SOFT:  '#1F2937',
  MUTED:      '#6B7280',
  MUTED_2:    '#9CA3AF',
  MUTED_3:    '#D1D5DB',
  BG:         '#F7F8FA',
  SURF_ALT:   '#F3F4F6',
  BORDER:     '#E5E7EB',
  BORDER_SOFT:'#F0F2F5',

  // Stati transazione (semantici)
  OK:        '#16A34A',
  OK_BG:     '#DCFCE7',
  FAIL:      '#DC2626',
  FAIL_BG:   '#FEE2E2',
  REFUND:    '#6B7280',
  REFUND_BG: '#F3F4F6',

  // Radius
  R_SM: 10, R_MD: 14, R_LG: 18, R_PILL: 999,

  // Shadows
  SH_SM:  '0 1px 2px rgba(15,17,21,0.04), 0 1px 3px rgba(15,17,21,0.04)',
  SH_FAB: '0 6px 18px rgba(190,24,93,0.30), 0 2px 6px rgba(190,24,93,0.18)',
};

// ─── Stato transazione: helper per styling ────────────────────
function txConfig(stato) {
  const map = {
    ok:       { color: ST.OK,      bg: ST.OK_BG,      label: 'Riuscito' },
    fail:     { color: ST.FAIL,    bg: ST.FAIL_BG,    label: 'Rifiutato' },
    refund:   { color: ST.REFUND,  bg: ST.REFUND_BG,  label: 'Rimborsato' },
  };
  return map[stato] || map.ok;
}

// ─── Formattazione importo €1.234,56 ──────────────────────────
function eur(n) {
  return '€' + (n || 0).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ─── Icone (set coerente, stroke 1.8) ─────────────────────────
const I = {
  Back:  (p={}) => <svg width={p.s||20} height={p.s||20} viewBox="0 0 24 24" fill="none" stroke={p.c||ST.TEXT} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 6 9 12 15 18"/></svg>,
  Close: (p={}) => <svg width={p.s||20} height={p.s||20} viewBox="0 0 24 24" fill="none" stroke={p.c||ST.TEXT} strokeWidth="2.2" strokeLinecap="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>,
  Check: (p={}) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke={p.c||ST.OK} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 12 10 18 20 6"/></svg>,
  ChevRight:(p={})=> <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke={p.c||ST.TEXT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 6 15 12 9 18"/></svg>,
  Contactless:(p={})=> <svg width={p.s||22} height={p.s||22} viewBox="0 0 24 24" fill="none" stroke={p.c||ST.TEXT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8.5a8 8 0 010 7"/><path d="M10 6a12 12 0 010 12"/><path d="M14 4a16 16 0 010 16"/></svg>,
  Receipt:(p={})=> <svg width={p.s||20} height={p.s||20} viewBox="0 0 24 24" fill="none" stroke={p.c||ST.TEXT} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 3v18l3-2 3 2 3-2 3 2 3-2V3"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/></svg>,
  Wifi:  (p={}) => <svg width={p.s||34} height={p.s||34} viewBox="0 0 24 24" fill="none" stroke={p.c||ST.TEXT} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.55a11 11 0 0114.08 0"/><path d="M1.42 9a16 16 0 0121.16 0"/><path d="M8.53 16.11a6 6 0 016.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>,
  Delete:(p={})=> <svg width={p.s||24} height={p.s||24} viewBox="0 0 24 24" fill="none" stroke={p.c||ST.TEXT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12l5-5h12a1 1 0 011 1v8a1 1 0 01-1 1H8l-5-5z"/><line x1="18" y1="9" x2="12" y2="15"/><line x1="12" y1="9" x2="18" y2="15"/></svg>,
  Profile:(p={})=> <svg width={p.s||22} height={p.s||22} viewBox="0 0 24 24" fill="none" stroke={p.c||ST.TEXT} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21 C4 16.5 7.5 14 12 14 C16.5 14 20 16.5 20 21"/></svg>,
  Doc:   (p={}) => <svg width={p.s||20} height={p.s||20} viewBox="0 0 24 24" fill="none" stroke={p.c||ST.TEXT} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="13" y2="17"/></svg>,
  Shield:(p={}) => <svg width={p.s||20} height={p.s||20} viewBox="0 0 24 24" fill="none" stroke={p.c||ST.TEXT} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  Lock:  (p={}) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke={p.c||ST.TEXT} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><rect x="3.5" y="11" width="17" height="10" rx="2"/><path d="M7.5 11V7a4.5 4.5 0 019 0v4"/></svg>,
  FaceID:(p={})=> <svg width={p.s||24} height={p.s||24} viewBox="0 0 24 24" fill="none" stroke={p.c||ST.TEXT} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 8.5V6.5A2.5 2.5 0 0 1 6.5 4h2"/><path d="M15.5 4h2A2.5 2.5 0 0 1 20 6.5v2"/><path d="M20 15.5v2a2.5 2.5 0 0 1-2.5 2.5h-2"/><path d="M8.5 20h-2A2.5 2.5 0 0 1 4 17.5v-2"/><path d="M9 9.5v1.2"/><path d="M15 9.5v1.2"/><path d="M12 9.5v3.2h-1.1"/><path d="M9 15c.85.7 1.9 1.05 3 1.05S14.15 15.7 15 15"/></svg>,
  Logout:(p={})=> <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke={p.c||ST.TEXT} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  Mail:  (p={}) => <svg width={p.s||18} height={p.s||18} viewBox="0 0 24 24" fill="none" stroke={p.c||ST.TEXT} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/></svg>,
  Phone: (p={}) => <svg width={p.s||18} height={p.s||18} viewBox="0 0 24 24" fill="none" stroke={p.c||ST.TEXT} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.8 19.8 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.8 19.8 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.13.96.36 1.9.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0122 16.92z"/></svg>,
  Refresh:(p={})=> <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke={p.c||ST.TEXT} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><polyline points="23 20 23 14 17 14"/><path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15"/></svg>,
  Stripe:(p={})=> <svg width={p.s||18} height={p.s||18} viewBox="0 0 24 24" fill={p.c||ST.TEXT}><path d="M13.5 8.6c0-.8.66-1.1 1.74-1.1 1.55 0 3.5.47 5.06 1.31V4.3A13.4 13.4 0 0015.24 3.3C11.2 3.3 8.5 5.41 8.5 8.94c0 5.5 7.57 4.62 7.57 6.99 0 .94-.82 1.24-1.96 1.24-1.69 0-3.86-.7-5.57-1.64v4.6a14.1 14.1 0 005.55 1.16c4.14 0 7-2.05 7-5.62 0-5.94-7.59-4.88-7.59-7.07z"/></svg>,
};

// ─── Componenti atomici ───────────────────────────────────────
function Btn({ variant='primary', children, onClick, disabled, style, full, size='md', ...rest }) {
  const sizes = { sm: { h: 36, fs: 13, px: 14 }, md: { h: 44, fs: 14.5, px: 18 }, lg: { h: 52, fs: 15.5, px: 22 } };
  const sz = sizes[size];
  const variants = {
    primary: { bg: ST.PINK_DARK, c: '#fff', b: 'transparent' },
    secondary:{ bg: '#fff', c: ST.TEXT, b: ST.BORDER },
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

// ─── Logo byup (mark) ─────────────────────────────────────────
function Logo({ size = 40, radius }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: radius != null ? radius : ST.R_MD,
      background: `linear-gradient(135deg, ${ST.PINK} 0%, ${ST.PINK_DARK} 100%)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontSize: size * 0.5, fontWeight: 800, flexShrink: 0,
    }}>b</div>
  );
}

Object.assign(window, { ST, txConfig, eur, I, Btn, Chip, Logo });
