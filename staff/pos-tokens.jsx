// Byup Staff (POS) — Design tokens
//
// SORGENTE DI VERITÀ: `PN` (gestionale/panoramica-tokens.jsx), caricato PRIMA
// di questo file da index.html. Qui NON si ridefiniscono brand, neutri o
// materiali: si ereditano da PN e si adatta solo la SCALA al touch.
// Stesso impianto di cameriere/staff-tokens.jsx — le due app staff devono
// restare gemelle.
//
// Deroghe motivate del POS (non dimenticanze):
//   · hit target 44pt — si incassa col telefono in mano
//   · radius 10/14/18 — superfici grandi su schermo piccolo
//   · CTA a pillola — bersaglio pollice-friendly
//   · le due sfumature brand qui sotto, che il gestionale non ha

if (!window.PN) {
  throw new Error(
    'pos-tokens.jsx richiede PN (gestionale/panoramica-tokens.jsx) caricato prima. ' +
    'Controlla l\'ordine degli <script> in index.html.'
  );
}

const ST = {
  // ─── Brand — ereditato, mai ridefinito ─────────────────────
  PINK:       PN.PINK,          // #FF5A5F corallo byup
  PINK_DARK:  PN.PINK_DARK,     // #E04347
  PINK_SOFT:  PN.PINK_SOFT,     // #FFE0DD
  PINK_BG:    PN.PINK_BG_SOFT,
  WINE:       PN.WINE,

  // ─── Sfumature brand ───────────────────────────────────────
  // Campionate dal logo "byup staff" di riferimento. Sono le UNICHE due
  // sfumature ammesse, e hanno ruoli distinti — non sono intercambiabili:
  //
  //   GRAD_MARK  intensa, escursione lunga (lampone → salmone).
  //              Solo superfici PICCOLE: logo, mark, badge, avatar.
  //              Su area grande diventa pesante.
  //
  //   GRAD_HERO  tenue, escursione corta (rosa polvere → salmone).
  //              Solo superfici GRANDI e SOLO con testo SCURO PIENO.
  //              ATTENZIONE — oggi NON è applicata da nessuna parte, ed è
  //              voluto: ogni superficie grande del POS porta testo pensato
  //              per fondo neutro. Il titolo regge (6,0-8,8:1) ma il testo
  //              secondario ST.MUTED crolla a 1,54:1, e nemmeno un nero al
  //              75% arriva a 4,5:1 sul capo scuro. Per usarla va prima
  //              ridisegnata la gerarchia del testo di quella superficie.
  //              Non applicarla "perché c'è".
  //
  // NON usarle sui CTA: il pulsante d'azione resta quello del gestionale
  // (BTN_BRAND). Su un POS l'unica cosa che deve gridare è "Incassa".
  //
  // VINCOLO DI CONTRASTO — misurato, non stimato. Col bianco:
  //   #E01F5A 4,65:1 ok  ·  #DE6E88 3,14:1 solo testo grande
  //   #EF938A 2,28:1 NO  ·  #EE9C8E 2,15:1 NO
  // Quindi: mai testo bianco piccolo sopra il capo chiaro. Sulle superfici
  // dense di testo (login, schermo pagamento) si usa un fondo pieno scuro,
  // non queste sfumature.
  GRAD_MARK: 'linear-gradient(135deg, #E01F5A 0%, #EF938A 100%)',
  GRAD_HERO: 'linear-gradient(135deg, #DE6E88 0%, #EE9C8E 100%)',
  // Estremi esposti per bordi/ombre coordinati e per il fallback su
  // superfici che non possono portare un gradient (es. color di un'icona).
  // Crema del mark: NON e' bianco puro, e' il colore ufficiale del logo.
  MARK_INK: '#F9E3DE',
  GRAD_MARK_FROM: '#E01F5A',
  GRAD_MARK_TO:   '#EF938A',
  GRAD_HERO_FROM: '#DE6E88',
  GRAD_HERO_TO:   '#EE9C8E',

  // ─── Neutrals — ereditati ──────────────────────────────────
  TEXT:       PN.TEXT,
  TEXT_SOFT:  '#1F2937',
  MUTED:      PN.MUTED,
  MUTED_2:    PN.MUTED_SOFT,
  MUTED_3:    PN.MUTED_LIGHT,
  WHITE:      PN.WHITE,
  BG:         PN.BG,            // #F5F6F8 — stesso canvas del gestionale
  SURF:       PN.WHITE_OFF,
  SURF_ALT:   PN.WHITE_HUSH,
  SURF_DEEP:  PN.WHITE_FROST,

  // ─── Bordi — hairline alpha, non grigi opachi ──────────────
  BORDER:       PN.BORDER_SOFT_A,
  BORDER_SOFT:  PN.BORDER_HAIR,
  BORDER_STRONG:PN.BORDER_MED,

  // ─── Stati transazione (semantici, ereditati) ──────────────
  OK:        PN.GREEN,
  OK_BG:     PN.GREEN_SOFT,
  FAIL:      PN.RED,
  FAIL_BG:   PN.RED_SOFT,
  REFUND:    PN.MUTED,
  REFUND_BG: PN.WHITE_HUSH,

  // ─── Materiali — CTA e vetro, ereditati da PN ──────────────
  BTN_NEUTRAL:       PN.BTN_NEUTRAL,
  BTN_NEUTRAL_PRESS: PN.BTN_NEUTRAL_PRESS,
  BTN_BRAND:         PN.BTN_BRAND,
  BTN_BRAND_PRESS:   PN.BTN_BRAND_PRESS,
  BTN_DARK:          PN.BTN_DARK,
  BTN_DARK_HOVER:    PN.BTN_DARK_HOVER,
  INSET:             PN.INSET_HIGHLIGHT,
  INSET_BRAND:       PN.INSET_HIGHLIGHT_BRAND,
  INSET_DARK:        PN.INSET_HIGHLIGHT_DARK,

  GLASS_BAR:    PN.GLASS_BAR,
  GLASS_STRONG: PN.GLASS_STRONG,

  // ─── Radius (deroga touch) ─────────────────────────────────
  R_SM: 10, R_MD: 14, R_LG: 18, R_PILL: 999,

  // ─── Shadows — due livelli, senza tinta ────────────────────
  SH_SM:  PN.CARD_SHADOW,
  SH_MD:  PN.CARD_SHADOW_HOVER,
  // FAB: ombra NEUTRA. Il gestionale vieta le ombre tinte di brand
  // (era rgba(190,24,93,.30)) — l'elevazione si fa col nero, non col colore.
  SH_FAB: '0 8px 24px rgba(15,17,21,0.16), 0 2px 6px rgba(15,17,21,0.08)',

  // Hit target minimo (44pt iOS)
  HIT: 44,
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

// Btn — geometria touch (pillola, 36/44/52), materiale del gestionale
// (gradient verticale + inset highlight). Volutamente NON usa le sfumature
// brand: il CTA deve leggersi identico qui e nel gestionale.
function Btn({ variant='primary', children, onClick, disabled, style, full, size='md', ...rest }) {
  const [press, setPress] = React.useState(false);
  const sizes = { sm: { h: 36, fs: 13, px: 14 }, md: { h: ST.HIT, fs: 14.5, px: 18 }, lg: { h: 52, fs: 15.5, px: 22 } };
  const sz = sizes[size];
  const variants = {
    primary:  { bg: ST.BTN_BRAND,   press: ST.BTN_BRAND_PRESS,   c: '#fff',  b: 'transparent',           inset: ST.INSET_BRAND },
    dark:     { bg: ST.BTN_DARK,    press: ST.BTN_DARK_HOVER,    c: '#fff',  b: 'transparent',           inset: ST.INSET_DARK },
    secondary:{ bg: ST.BTN_NEUTRAL, press: ST.BTN_NEUTRAL_PRESS, c: ST.TEXT, b: ST.BORDER,               inset: ST.INSET },
    danger:   { bg: ST.BTN_NEUTRAL, press: ST.BTN_NEUTRAL_PRESS, c: ST.FAIL, b: 'rgba(220,38,38,0.28)',  inset: ST.INSET },
    ghost:    { bg: 'transparent',  press: ST.SURF_ALT,          c: ST.TEXT, b: 'transparent',           inset: 'none' },
  };
  const v = variants[variant] || variants.primary;
  const flat = v.bg === 'transparent';
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onPointerDown={() => setPress(true)}
      onPointerUp={() => setPress(false)}
      onPointerLeave={() => setPress(false)}
      style={{
        height: sz.h, padding: `0 ${sz.px}px`, borderRadius: ST.R_PILL,
        background: disabled ? ST.SURF_ALT : (press ? v.press : v.bg),
        color: disabled ? ST.MUTED_2 : v.c,
        border: `1px solid ${disabled ? ST.BORDER : v.b}`,
        boxShadow: disabled || flat ? 'none' : `${v.inset}, ${ST.SH_SM}`,
        fontSize: sz.fs, fontWeight: 700, fontFamily: 'inherit',
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        width: full ? '100%' : 'auto',
        WebkitTapHighlightColor: 'transparent',
        transition: 'background 150ms ease-out, box-shadow 150ms ease-out',
        ...style,
      }}
      {...rest}
    >{children}</button>
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
// Il mark vero, vettorializzato da assets/byup-icon.png (IoU 0,983 con
// l'originale). Il path e' nello spazio 512 del PNG, ma il viewBox e'
// ritagliato sul bounding box del mark (144-367 x, 111-401 y) con il padding
// del logo, non quello dell'icona app: il PNG e' un'icona iOS e ha margini
// molto piu' larghi, che dentro la tile facevano sembrare il mark timido.
// 403 = altezza mark / 0,72, la proporzione del logo di riferimento.
// Superficie piccola → sfumatura intensa (GRAD_MARK).
const BYUP_MARK_D = "M208 111C218.7 110.3 246 110.7 256 111C266 111.3 263.5 111.8 268 113C272.5 114.2 276.8 115 283 118C289.2 121 298.5 125.8 305 131C311.5 136.2 317 142 322 149C327 156 331.8 164.8 335 173C338.2 181.2 340.2 189 341 198C341.8 207 341 219.2 340 227C339 234.8 337.7 238.7 335 245C332.3 251.3 328.8 258.5 324 265C319.2 271.5 310.7 279.7 306 284C301.3 288.3 302 287.7 296 291C290 294.3 279.8 299.8 270 304C260.2 308.2 250.2 312.2 237 316C223.8 319.8 202.3 325 191 327C179.7 329 175.2 329.2 169 328C162.8 326.8 158 324.2 154 320C150 315.8 146.3 328.2 145 303C143.7 277.8 144.3 195.2 146 169C147.7 142.8 151.2 152.7 155 146C158.8 139.3 162.8 134.2 169 129C175.2 123.8 185.5 118 192 115C198.5 112 197.3 111.7 208 111Z M335 294C342.7 290.5 343.5 292.5 348 294C352.5 295.5 358.8 299.3 362 303C365.2 306.7 366.2 309.8 367 316C367.8 322.2 368 332.7 367 340C366 347.3 363.3 354.5 361 360C358.7 365.5 356.5 368.7 353 373C349.5 377.3 344.7 382.3 340 386C335.3 389.7 331.2 392.5 325 395C318.8 397.5 327.7 400 303 401C278.3 402 201.7 402.2 177 401C152.3 399.8 160.2 397 155 394C149.8 391 147.8 386.3 146 383C144.2 379.7 144.2 377.3 144 374C143.8 370.7 143.3 366.2 145 363C146.7 359.8 144.3 357.2 154 355C163.7 352.8 186.5 353.2 203 350C219.5 346.8 236.5 341.8 253 336C269.5 330.2 288.3 322 302 315C315.7 308 327.3 297.5 335 294Z M291 172C293.3 171.3 295.2 172 297 173C298.8 174 300.5 175.7 302 178C303.5 180.3 305.3 182.5 306 187C306.7 191.5 306.8 200.2 306 205C305.2 209.8 302.8 213.5 301 216C299.2 218.5 297 219.3 295 220C293 220.7 291.2 221 289 220C286.8 219 283.8 217 282 214C280.2 211 278.3 207.2 278 202C277.7 196.8 279.2 187.2 280 183C280.8 178.8 281.2 178.8 283 177C284.8 175.2 288.7 172.7 291 172Z";

function Logo({ size = 40, radius }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: radius != null ? radius : ST.R_MD,
      background: ST.GRAD_MARK,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0, overflow: 'hidden', boxShadow: ST.INSET_BRAND,
    }}>
      <svg width={size} height={size} viewBox="54 55 403 403" aria-label="byup" role="img">
        <path fill={ST.MARK_INK} fillRule="evenodd" d={BYUP_MARK_D}/>
      </svg>
    </div>
  );
}

Object.assign(window, { ST, txConfig, eur, I, Btn, Chip, Logo });
