// byup Staff — Design tokens (mobile / waiter app)
//
// SORGENTE DI VERITÀ: `PN` (gestionale/panoramica-tokens.jsx), caricato PRIMA
// di questo file da cameriereweb.html. Qui NON si ridefiniscono brand, neutri,
// stati o materiali: si ereditano da PN e si adatta solo la SCALA al touch.
//
// Regola: se un colore cambia nel gestionale, deve cambiare qui da solo.
// Se stai per scrivere un hex di brand in questo file, stai sbagliando —
// aggiungilo a PN e referenzialo.
//
// Cosa resta specifico del cameriere (deroghe motivate, non dimenticanze):
//   · scala tipografica maggiorata — si legge in sala, in piedi, di corsa
//   · hit target 44pt (iOS HIG) — si tocca col pollice, non col mouse
//   · radius più morbidi (10/14/18/24 vs 8/10/12) — superfici grandi su schermo piccolo
//   · CTA a pillola — bersaglio pollice-friendly, non rettangolo desktop

if (!window.PN) {
  throw new Error(
    'staff-tokens.jsx richiede PN (gestionale/panoramica-tokens.jsx) caricato prima. ' +
    'Controlla l\'ordine degli <script> in cameriereweb.html.'
  );
}

const ST = {
  // ─── Brand — ereditato, mai ridefinito ─────────────────────
  PINK:       PN.PINK,          // #FF5A5F corallo byup
  PINK_DARK:  PN.PINK_DARK,     // #E04347
  PINK_SOFT:  PN.PINK_SOFT,     // #FFE0DD
  PINK_BG:    PN.PINK_BG_SOFT,  // #FFF1EF
  WINE:       PN.WINE,
  WINE_SOFT:  PN.WINE_SOFT,

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
  // Il gestionale ha abbandonato i bordi solidi: su superficie bianca un
  // rgba(15,17,21,.08) si legge uguale ma non "stacca" come una riga grigia.
  BORDER:       PN.BORDER_SOFT_A,  // rgba(15,17,21,0.08) — default
  BORDER_SOFT:  PN.BORDER_HAIR,    // rgba(15,17,21,0.06) — divider interni
  BORDER_GHOST: PN.BORDER_GHOST,
  BORDER_STRONG:PN.BORDER_MED,     // rgba(15,17,21,0.16) — input focus, selezione

  // ─── Semantic — ereditati ──────────────────────────────────
  GREEN:      PN.GREEN,
  GREEN_SOFT: PN.GREEN_SOFT,
  AMBER:      PN.AMBER,
  AMBER_SOFT: PN.AMBER_SOFT,
  RED:        PN.RED,
  RED_SOFT:   PN.RED_SOFT,
  BLUE:       PN.BLUE,
  BLUE_SOFT:  PN.BLUE_SOFT,
  PURPLE:     PN.PURPLE,
  PURPLE_SOFT:PN.PURPLE_SOFT,

  // ─── Materiali — CTA e vetro, ereditati da PN ──────────────
  BTN_NEUTRAL:       PN.BTN_NEUTRAL,
  BTN_NEUTRAL_HOVER: PN.BTN_NEUTRAL_HOVER,
  BTN_NEUTRAL_PRESS: PN.BTN_NEUTRAL_PRESS,
  BTN_BRAND:         PN.BTN_BRAND,
  BTN_BRAND_HOVER:   PN.BTN_BRAND_HOVER,
  BTN_BRAND_PRESS:   PN.BTN_BRAND_PRESS,
  BTN_DARK:          PN.BTN_DARK,
  BTN_DARK_HOVER:    PN.BTN_DARK_HOVER,
  INSET:             PN.INSET_HIGHLIGHT,
  INSET_BRAND:       PN.INSET_HIGHLIGHT_BRAND,
  INSET_DARK:        PN.INSET_HIGHLIGHT_DARK,

  // Vetro: ammesso su barre sticky, tab bar, sheet e modali — superfici che
  // stanno SOPRA contenuto che scorre. Vietato su card statiche: senza niente
  // da rifrangere il glass diventa una pillola grigina (vedi byup-glass.jsx).
  GLASS_BAR:    PN.GLASS_BAR,
  GLASS_STRONG: PN.GLASS_STRONG,
  GLASS_MENU:   PN.GLASS_MENU,
  GLASS_LIGHT:  PN.GLASS_LIGHT,

  // ─── Tipografia mobile (deroga: più grande del desktop) ────
  T_XS:   12,
  T_SM:   14,
  T_BASE: 16,
  T_MD:   18,
  T_LG:   22,
  T_XL:   28,
  T_HERO: 36,

  // ─── Spacing — stessa base 4px del gestionale ──────────────
  S_1: 4, S_2: 8, S_3: 12, S_4: 16, S_5: 20, S_6: 24, S_8: 32,

  // ─── Radius (deroga touch: più morbidi del desktop) ────────
  R_SM: 10, R_MD: 14, R_LG: 18, R_XL: 24, R_PILL: 999,

  // ─── Shadows — allineate ai due livelli del gestionale ─────
  // PN ne ammette due, senza tinta. Qui li ereditiamo e aggiungiamo solo
  // il livello "sheet" per i pannelli che salgono dal basso.
  SH_SM:  PN.CARD_SHADOW,
  SH_MD:  PN.CARD_SHADOW_HOVER,
  SH_LG:  '0 8px 24px rgba(15,17,21,0.08)',
  SH_SHEET: '0 -8px 32px rgba(15,17,21,0.10)',

  // Hit target minimo (44pt iOS)
  HIT: 44,

  // ─── Alias legacy — da ritirare ────────────────────────────
  // Nomi ereditati dalla prima versione dell'app, ancora usati in giro.
  // NON descrivono più lo stato tavolo (per quello c'è statoConfig): erano
  // di fatto usati come colori semantici, e qui li rimappiamo su quelli veri.
  // Non usarli in codice nuovo — usa GREEN / AMBER / PINK / statoConfig().
  ST_FREE:      PN.GREEN,        // "salvato", conferma
  ST_OK:        PN.GREEN,        // idem
  ST_BUSY:      PN.GREEN,        // conferma positiva (non "occupato")
  ST_BUSY_BG:   PN.GREEN_SOFT,
  ST_BOOKED:    PN.AMBER,        // avviso "da inviare" (non "prenotato")
  ST_BOOKED_BG: PN.AMBER_SOFT,
  ST_READY:     PN.PINK,         // urgenza "pronto da consegnare"

  // FAB: ombra NEUTRA. Il gestionale vieta le ombre tinte di brand
  // (era rgba(190,24,93,.30)) — l'elevazione si fa col nero, non col colore.
  SH_FAB: '0 8px 24px rgba(15,17,21,0.16), 0 2px 6px rgba(15,17,21,0.08)',
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

// ─── Stato tavolo: allineato 1:1 al gestionale ────────────────
// Stessi valori di TT_ACCENTS (sala-table-tile.jsx) e SALA_STATI (sala-card.jsx):
// chi passa dal tablet in sala al gestionale in cassa vede gli stessi colori
// per lo stesso stato. Se cambiano di là, vanno cambiati anche qui.
//
//   libero    verde  #15803D    occupato   corallo #E32459
//   prenotato viola  #6D28D9    da-pulire  ambra   #B45309
//
// Nota: 'occupato' è vicino al corallo del brand. È voluto — nel gestionale
// occupato è lo stato "caldo". Per non confonderlo con le CTA, sulle card lo
// stato si porta come tint+ring, mai come fill pieno di un pulsante.
function statoConfig(stato) {
  const map = {
    libero:      { color: '#15803D', bg: 'rgba(22, 163, 74, 0.10)',  ring: 'rgba(22, 163, 74, 0.40)',  label: 'Libero' },
    occupato:    { color: '#E32459', bg: 'rgba(255, 90, 95, 0.18)',  ring: 'rgba(227, 36, 89, 0.42)',  label: 'Occupato' },
    prenotato:   { color: '#6D28D9', bg: 'rgba(124, 58, 237, 0.12)', ring: 'rgba(124, 58, 237, 0.38)', label: 'Prenotato' },
    'da-pulire': { color: '#B45309', bg: 'rgba(217, 119, 6, 0.14)',  ring: 'rgba(217, 119, 6, 0.42)',  label: 'Da pulire' },
  };
  return map[stato] || map.libero;
}

// ─── Icone (set coerente, stroke 1.8) ─────────────────────────
const I = {
  Search:(p={}) => <svg width={p.s||20} height={p.s||20} viewBox="0 0 24 24" fill="none" stroke={p.c||ST.TEXT} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.5" y2="16.5"/></svg>,
  Back:  (p={}) => <svg width={p.s||20} height={p.s||20} viewBox="0 0 24 24" fill="none" stroke={p.c||ST.TEXT} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 6 9 12 15 18"/></svg>,
  Plus:  (p={}) => <svg width={p.s||20} height={p.s||20} viewBox="0 0 24 24" fill="none" stroke={p.c||ST.TEXT} strokeWidth="2.4" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Minus: (p={}) => <svg width={p.s||20} height={p.s||20} viewBox="0 0 24 24" fill="none" stroke={p.c||ST.TEXT} strokeWidth="2.4" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Close: (p={}) => <svg width={p.s||20} height={p.s||20} viewBox="0 0 24 24" fill="none" stroke={p.c||ST.TEXT} strokeWidth="2.2" strokeLinecap="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>,
  Check: (p={}) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke={p.c||ST.PINK} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 12 10 18 20 6"/></svg>,
  ChevDown:(p={})=> <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke={p.c||ST.TEXT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>,
  ChevRight:(p={})=> <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke={p.c||ST.TEXT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 6 15 12 9 18"/></svg>,
  Clock: (p={}) => <svg width={p.s||14} height={p.s||14} viewBox="0 0 24 24" fill="none" stroke={p.c||ST.MUTED} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/></svg>,
  Users: (p={}) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke={p.c||ST.TEXT} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>,
  Alert: (p={}) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke={p.c||ST.PINK_DARK} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.3 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><circle cx="12" cy="17" r="0.5" fill="currentColor"/></svg>,
  Card:  (p={}) => <svg width={p.s||20} height={p.s||20} viewBox="0 0 24 24" fill="none" stroke={p.c||ST.TEXT} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>,
  Receipt:(p={})=> <svg width={p.s||20} height={p.s||20} viewBox="0 0 24 24" fill="none" stroke={p.c||ST.TEXT} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 3v18l3-2 3 2 3-2 3 2 3-2V3"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/></svg>,
  // ─── Icone della tab bar ──────────────────────────────────────────────────
  // Disegnate nel linguaggio della Byup App consumer: viewBox 24, tratto 1.8,
  // giunzioni tonde e geometrie morbide (niente wireframe spigoloso). Accettano
  // `f` = fill per lo stato attivo, come le icone della tab bar dell'app.
  //
  // Sala: tavolo visto dall'alto con quattro coperti intorno. Prima erano
  // quattro rettangoli affiancati, che leggevano come una griglia, non una sala.
  Tables:(p={})=> {
    const c = p.c || ST.TEXT;
    return (
      <svg width={p.s||22} height={p.s||22} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="6.6" y="6.6" width="10.8" height="10.8" rx="3.4" fill={p.f || 'none'}/>
        <path d="M9.4 3.4h5.2M9.4 20.6h5.2M3.4 9.4v5.2M20.6 9.4v5.2"/>
      </svg>
    );
  },
  // Profilo: stessa geometria di Icon.User dell'app consumer, spalle arrotondate.
  Profile:(p={})=> {
    const c = p.c || ST.TEXT;
    return (
      <svg width={p.s||22} height={p.s||22} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8.2" r="3.6" fill={p.f || 'none'}/>
        <path d="M5.3 20.2a6.9 6.9 0 0 1 13.4 0v.9H5.3z" fill={p.f || 'none'}/>
      </svg>
    );
  },
  Trash: (p={}) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke={p.c||ST.MUTED} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>,
  Edit:  (p={}) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke={p.c||ST.TEXT} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  Note:  (p={}) => <svg width={p.s||14} height={p.s||14} viewBox="0 0 24 24" fill="none" stroke={p.c||ST.MUTED} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="13" y2="17"/></svg>,
  Wifi:  (p={}) => <svg width={p.s||34} height={p.s||34} viewBox="0 0 24 24" fill="none" stroke={p.c||ST.TEXT} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.55a11 11 0 0114.08 0"/><path d="M1.42 9a16 16 0 0121.16 0"/><path d="M8.53 16.11a6 6 0 016.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>,
  Settings:(p={})=> <svg width={p.s||20} height={p.s||20} viewBox="0 0 24 24" fill="none" stroke={p.c||ST.TEXT} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
  Logout:(p={})=> <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke={p.c||ST.TEXT} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  Split: (p={}) => <svg width={p.s||18} height={p.s||18} viewBox="0 0 24 24" fill="none" stroke={p.c||ST.TEXT} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M16 3h5v5"/><path d="M8 21H3v-5"/><path d="M21 3l-7 7"/><path d="M3 21l7-7"/></svg>,
  Merge: (p={}) => <svg width={p.s||18} height={p.s||18} viewBox="0 0 24 24" fill="none" stroke={p.c||ST.TEXT} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="8 7 12 3 16 7"/><line x1="12" y1="3" x2="12" y2="15"/><path d="M5 21h14"/></svg>,
  // Tavolo unito: due piani-tavolo accostati in un'unica superficie, con la
  // giuntura al centro. Letterale e leggibile anche piccolo (badge).
  Joined:(p={})=> <svg width={p.s||18} height={p.s||18} viewBox="0 0 24 24" fill="none" stroke={p.c||ST.TEXT} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2.5" y="7" width="19" height="10" rx="2.5"/><line x1="12" y1="7" x2="12" y2="17"/></svg>,
  // Walk = "sposta / attiva tavolo": la usano sette punti fra modali e CTA, NON
  // la tab bar. Ridisegnata più tonda e continua (prima erano quattro tratti
  // slegati che a 15px si leggevano come uno scarabocchio), ma resta un omino
  // che cammina: il significato è quello.
  Walk:  (p={}) => {
    const c = p.c || ST.TEXT;
    return (
      <svg width={p.s||18} height={p.s||18} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="13.2" cy="4.6" r="2.1" fill={p.f || 'none'}/>
        <path d="M13.4 9.1 10.2 11l-1.4 4.1"/>
        <path d="M13.4 9.1c1.6.3 2.4 1.3 2.8 2.7l2.4 1.6"/>
        <path d="M12.6 13.6 14 17l1 4.4"/>
        <path d="m8.8 15.1-2.4 2.6-1.1 3.7"/>
      </svg>
    );
  },
  // Tray = "da consegnare": vassoio col coperchio, per la tab bar. Dice
  // "questi piatti vanno portati in tavola", cosa che un omino non diceva.
  Tray:  (p={}) => {
    const c = p.c || ST.TEXT;
    return (
      <svg width={p.s||20} height={p.s||20} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4.2 16.2a7.8 7.8 0 0 1 15.6 0z" fill={p.f || 'none'}/>
        <path d="M2.6 16.2h18.8"/>
        <circle cx="12" cy="6.5" r="1.15" fill={p.f ? c : c}/>
      </svg>
    );
  },
  QR:    (p={}) => <svg width={p.s||20} height={p.s||20} viewBox="0 0 32 32" fill="none" stroke={p.c||ST.TEXT} strokeWidth="2.2"><rect x="4" y="4" width="9" height="9"/><rect x="19" y="4" width="9" height="9"/><rect x="4" y="19" width="9" height="9"/><rect x="19" y="19" width="3" height="3"/><rect x="25" y="19" width="3" height="3"/><rect x="19" y="25" width="3" height="3"/><rect x="25" y="25" width="3" height="3"/></svg>,
  Refresh:(p={})=> <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke={p.c||ST.TEXT} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><polyline points="23 20 23 14 17 14"/><path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15"/></svg>,
  Chair: (p={}) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke={p.c||ST.TEXT} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 2h6"/><path d="M9 2v9M15 2v9"/><path d="M5 11h14"/><path d="M8 11v9M16 11v9"/><path d="M8 16h8"/></svg>,
};

// ─── Componenti atomici ───────────────────────────────────────

// Btn — geometria touch (pillola, 36/44/52), materiale del gestionale
// (gradient verticale + inset highlight). Il gradient non è decorazione:
// è quello che fa leggere il pulsante come superficie premibile.
function Btn({ variant='primary', children, onClick, disabled, style, full, size='md', ...rest }) {
  const [press, setPress] = React.useState(false);
  const sizes = { sm: { h: 36, fs: 13, px: 14 }, md: { h: ST.HIT, fs: 14.5, px: 18 }, lg: { h: 52, fs: 15.5, px: 22 } };
  const sz = sizes[size];
  const variants = {
    // CTA principale = corallo brand. Una sola per schermata.
    primary:  { bg: ST.BTN_BRAND,   press: ST.BTN_BRAND_PRESS,   c: '#fff',     b: 'transparent',      inset: ST.INSET_BRAND },
    pink:     { bg: ST.BTN_BRAND,   press: ST.BTN_BRAND_PRESS,   c: '#fff',     b: 'transparent',      inset: ST.INSET_BRAND },
    dark:     { bg: ST.BTN_DARK,    press: ST.BTN_DARK_HOVER,    c: '#fff',     b: 'transparent',      inset: ST.INSET_DARK },
    secondary:{ bg: ST.BTN_NEUTRAL, press: ST.BTN_NEUTRAL_PRESS, c: ST.TEXT,    b: ST.BORDER,          inset: ST.INSET },
    soft:     { bg: ST.SURF_ALT,    press: ST.SURF_DEEP,         c: ST.TEXT,    b: 'transparent',      inset: 'none' },
    danger:   { bg: ST.BTN_NEUTRAL, press: ST.BTN_NEUTRAL_PRESS, c: ST.RED,     b: 'rgba(220,38,38,0.28)', inset: ST.INSET },
    ghost:    { bg: 'transparent',  press: ST.SURF_ALT,          c: ST.TEXT,    b: 'transparent',      inset: 'none' },
  };
  const v = variants[variant] || variants.primary;
  const flat = v.bg === 'transparent' || variant === 'soft';
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
      border: `1px solid ${ST.BORDER}`, borderRadius: ST.R_PILL,
      height: 36, padding: '0 4px', background: ST.BTN_NEUTRAL,
      boxShadow: ST.INSET,
    }}>
      <button onClick={() => value > min && onChange(value - 1)} style={{
        width: 28, height: 28, borderRadius: ST.R_PILL, border: 'none', background: 'transparent',
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}><I.Minus s={16} c={ST.TEXT}/></button>
      <span style={{ minWidth: 24, textAlign: 'center', fontSize: ST.T_SM, fontWeight: 700 }}>{value}</span>
      <button onClick={() => value < max && onChange(value + 1)} style={{
        width: 28, height: 28, borderRadius: ST.R_PILL, border: 'none', background: 'transparent',
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}><I.Plus s={16} c={ST.TEXT}/></button>
    </div>
  );
}

// ─── Prezzo unitario editabile (box bordato con € a sinistra) ─
// Riutilizzato ovunque si corregga un prezzo (conto, riepilogo ordine).
function PrezzoInput({ value, onChange, width = 52 }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 2,
      border: `1px solid ${ST.BORDER}`, borderRadius: ST.R_SM, padding: '5px 8px', background: ST.WHITE,
    }}>
      <span style={{ fontSize: 13, color: ST.MUTED, fontWeight: 700 }}>€</span>
      <input
        type="number" inputMode="decimal" value={value}
        onChange={e => onChange(e.target.value === '' ? 0 : Number(e.target.value))}
        style={{
          width, border: 'none', outline: 'none', background: 'transparent',
          fontSize: 13.5, fontWeight: 700, color: ST.TEXT, fontFamily: 'inherit', textAlign: 'right',
        }}/>
    </div>
  );
}

// ─── Image placeholder per piatto (gradient generato) ────────
function DishImage({ name, img, kind = 'piatto', style }) {
  // Se c'è una foto reale la mostriamo sopra; altrimenti (o se non carica) resta
  // il gradiente deterministico col nome — così la UI non si rompe mai.
  const [imgErr, setImgErr] = React.useState(false);
  // Gradient deterministico dal nome
  const hash = (name || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const palettes = [
    ['#FED7AA', '#F97316'],   // arancio
    ['#FEE2E2', '#DC2626'],   // rosso
    ['#DCFCE7', '#16A34A'],   // verde
    ['#FEF3C7', '#D97706'],   // ambra
    ['#FFE0DD', '#FF5A5F'],   // corallo brand
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
      {img && !imgErr && (
        <img src={img} alt={name} onError={() => setImgErr(true)} style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
        }}/>
      )}
    </div>
  );
}

// ─── Riga "da inviare" ──────────────────────────────────────
// Usata identica nel dettaglio tavolo e nella striscia "Da inviare" della Sala.
//
// Ogni riga porta la propria azione "lo porto io": l'articolo esce dai da-inviare
// e diventa disponibile in "Da consegnare". NON consegnato — al momento della
// comanda il cameriere non ce l'ha ancora in mano: se si distrae resta tracciato.
//
// L'azione è per riga e non una seconda CTA accanto a "Invia tutti", perché il
// caso reale è "una bottiglia su quattro portate": una CTA globale costringerebbe
// a selezionare prima, e due bottoni affiancati metterebbero sullo stesso piano
// un'azione sempre sicura (invia) e una che, sbagliata, lascia un piatto senza
// nessuno che lo prepari.
//
// Swipe in entrambe le direzioni: la mano che tiene il tablet non deve pensare
// da che parte tirare. Niente affordance visibile sulla riga; il tap continua
// a selezionare, quindi la riga non ha comandi propri.
// Pointer events, non touch: così funziona anche col mouse nel frame iOS.
function SwipeDaInviare({ it, on, accent, bg, rowBg, onTap, onPortaIo }) {
  const SOGLIA = 72;   // oltre questa distanza il gesto vale
  const MAX    = 108;  // resistenza oltre: non si trascina all'infinito
  const [dx, setDx] = React.useState(0);
  const [uscita, setUscita] = React.useState(false);
  const drag = React.useRef(null);
  const uscito = React.useRef(false);

  // Il guard è su una ref, non su `uscita`: lo stato si legge dalla closure del
  // render e due invocazioni nello stesso tick (gesto + tap, o un pointercancel
  // che segue il pointerup) lo vedrebbero entrambe a false, sganciando due volte
  // onPortaIo. La seconda si porterebbe via la riga successiva, perché gli
  // indici si ricompattano dopo la prima.
  // La riga esce dal lato verso cui è stata tirata.
  const esci = (verso) => {
    if (uscito.current) return;
    uscito.current = true;
    setUscita(true); setDx(verso * MAX); setTimeout(onPortaIo, 180);
  };

  const giu = (e) => {
    if (uscito.current) return;
    drag.current = { x0: e.clientX, y0: e.clientY, mosso: false, attivo: false };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const muovi = (e) => {
    const d = drag.current;
    if (!d) return;
    const ddx = e.clientX - d.x0, ddy = e.clientY - d.y0;
    // Finché non è chiaro che è orizzontale, lascio scorrere la lista.
    if (!d.attivo) {
      if (Math.abs(ddx) < 8 || Math.abs(ddx) <= Math.abs(ddy)) return;
      d.attivo = true;
    }
    d.mosso = true;
    setDx(Math.max(-MAX, Math.min(MAX, ddx)));
  };
  const su = () => {
    const d = drag.current;
    drag.current = null;
    if (!d) return;
    if (Math.abs(dx) >= SOGLIA) { esci(Math.sign(dx)); return; }
    setDx(0);
    if (!d.mosso) onTap();
  };

  const armato = Math.abs(dx) >= SOGLIA;
  // L'etichetta sta dal lato da cui la riga si sta scoprendo: tiro a sinistra e
  // spunta a destra, e viceversa. A riposo (dx 0) è nascosta comunque.
  const verso = dx > 0 ? 1 : -1;

  return (
    <div style={{
      position: 'relative', margin: '0 -4px', borderRadius: ST.R_SM, overflow: 'hidden',
      maxHeight: uscita ? 0 : 44, opacity: uscita ? 0 : 1,
      transition: uscita ? 'max-height 180ms ease-in, opacity 140ms ease-in' : 'none',
    }}>
      {/* Pannello rivelato dallo scorrimento */}
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0, borderRadius: ST.R_SM,
        background: armato ? ST.ST_READY : 'rgba(190, 24, 93, 0.14)',
        display: 'flex', alignItems: 'center',
        justifyContent: verso > 0 ? 'flex-start' : 'flex-end',
        padding: '0 14px',
        transition: 'background 120ms ease-out',
      }}>
        <span style={{
          fontSize: 12.5, fontWeight: 800, whiteSpace: 'nowrap',
          color: armato ? '#fff' : ST.ST_READY,
        }}>Lo porto io</span>
      </div>

      {/* Riga vera */}
      <div
        onPointerDown={giu} onPointerMove={muovi} onPointerUp={su} onPointerCancel={su}
        style={{
          position: 'relative', touchAction: 'pan-y',
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '7px 10px', borderRadius: ST.R_SM,
          background: on ? bg : rowBg, cursor: 'pointer',
          transform: `translateX(${dx}px)`,
          transition: drag.current ? 'none' : 'transform 180ms cubic-bezier(0.2, 0, 0, 1)',
        }}>
        <span style={{
          minWidth: 26, height: 22, padding: '0 6px', borderRadius: 6,
          background: on ? accent : '#fff', color: on ? '#fff' : accent,
          border: `1px solid ${accent}`,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11.5, fontWeight: 800, flexShrink: 0,
        }}>{it.qty}×</span>
        <span style={{ flex: 1, minWidth: 0, fontWeight: on ? 800 : 600, fontSize: 13, color: ST.TEXT }}>{it.nome}</span>
      </div>
    </div>
  );
}

Object.assign(window, { ST, ALLERGENI, statoConfig, I, Btn, StatusDot, AllergeneIcon, Stepper, DishImage, SwipeDaInviare });
