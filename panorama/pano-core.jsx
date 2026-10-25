// ═══════════════════════════════════════════════════════════════════════
// Panorama · core — spazio dei nomi, immagini, formati italiani, icone,
// piccolo store condiviso e hook. Ogni file è un IIFE che si appoggia a
// window.Pano: niente nomi globali sciolti (regola di Desk).
// ═══════════════════════════════════════════════════════════════════════
(function () {
  const Pano = (window.Pano = window.Pano || {});
  const { useState, useEffect, useRef, useCallback, useSyncExternalStore } = React;

  // ─── Immagini (il build le sostituisce con data URI) ────────────────────
  Pano.IMG = {
    logoInk: 'img/panorama-logo-ink.png',
    logoIride: 'img/panorama-logo-iride.png',
    logoWhite: 'img/panorama-logo-white.png',
    markIride: 'img/panorama-mark-iride.png',
    markInk: 'img/panorama-mark-ink.png',
    markWhite: 'img/panorama-mark-white.png',
    byuppino: 'img/byuppino-panorama.webp',
    byuppinoViso: 'img/byuppino-panorama-viso.webp',
    byuppinoAi: 'img/byuppino-ai.webp', // Byuppino AI (con cacciavite e tablet), dal 25 ottobre
    carbonara: 'img/dish-carbonara.webp',
    bruschette: 'img/dish-bruschette.webp',
    tagliere: 'img/dish-tagliere.webp',
    polpo: 'img/dish-polpo.webp',
    lasagna: 'img/dish-lasagna.webp',
    fritto: 'img/dish-fritto.webp',
    tiramisu: 'img/dessert-tiramisu.webp',
    spritz: 'img/drink-spritz.webp',
    negroni: 'img/drink-negroni.webp',
    vino: 'img/drink-vino.webp',
    venueTrattoria: 'img/venue-trattoria.webp',
    venueRistorante: 'img/venue-ristorante.webp',
    // foto dell'app byup (le stesse del prototipo dell'app, da Unsplash): per le anteprime
    app: {
      carbonara: 'img/app/carbonara.webp',
      trattoria: 'img/app/trattoria.webp',
      gente: 'img/app/gente.webp',
      pub: 'img/app/pub.webp',
      notte: 'img/app/notte.webp',
      terrazza: 'img/app/terrazza.webp',
      penne: 'img/app/penne.webp',
      cocktail: 'img/app/cocktail.webp',
      cocktails: 'img/app/cocktails.webp',
      sala: 'img/app/sala.webp',
      salabuia: 'img/app/salabuia.webp',
      pizza: 'img/app/pizza.webp',
      sushi: 'img/app/sushi.webp',
      vino: 'img/app/vino.webp',
      tiramisu: 'img/app/tiramisu.webp',
      cena: 'img/app/cena.webp',
      // icone dell'app (momento e categorie), rimpicciolite
      icOra: 'img/app/ic-ora.webp',
      icCena: 'img/app/ic-cena.webp',
      icPasta: 'img/app/ic-pasta.webp',
      catBurger: 'img/app/cat-burger.webp',
      catAperitivo: 'img/app/cat-aperitivo.webp',
      catPoke: 'img/app/cat-poke.webp',
      catPanini: 'img/app/cat-panini.webp',
      catBirra: 'img/app/cat-birra.webp',
      offer: 'img/app/offer.webp',
    },
  };

  // ─── Data demo: sabato 24 ottobre 2026 ──────────────────────────────────
  Pano.TODAY = new Date(2026, 9, 24, 13, 40);
  const GIORNI = ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'];
  const GG = ['dom', 'lun', 'mar', 'mer', 'gio', 'ven', 'sab'];
  const MESI = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];
  const MM = ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic'];
  Pano.GIORNI = GIORNI; Pano.GG = GG; Pano.MESI = MESI; Pano.MM = MM;
  Pano.addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
  Pano.fmtDay = (d) => `${GG[d.getDay()]} ${d.getDate()} ${MM[d.getMonth()]}`;
  Pano.fmtDayLong = (d) => `${GIORNI[d.getDay()]} ${d.getDate()} ${MESI[d.getMonth()]}`;
  Pano.sameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  Pano.cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  // ─── Numeri all'italiana ────────────────────────────────────────────────
  // Separatore delle migliaia sempre (Intl in italiano lo toglie sotto 10.000)
  const grp = (s) => s.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const fx = (v, d) => { const neg = v < 0; const t = Math.abs(v).toFixed(d).split('.'); return (neg ? '-' : '') + grp(t[0]) + (d ? ',' + t[1] : ''); };
  const nf0 = { format: (v) => fx(Math.round(v), 0) };
  const nf1 = { format: (v) => fx(v, 1) };
  const nf2 = { format: (v) => fx(v, 2) };
  Pano.n = (v) => nf0.format(Math.round(v));
  Pano.n1 = (v) => nf1.format(v);
  Pano.n2 = (v) => nf2.format(v);
  // «€ 1.940» o «€ 1.940,50»
  Pano.eur = (v, dec) => {
    const d = dec === undefined ? Math.abs(v % 1) > 0.004 : dec;
    return '€ ' + (d ? nf2.format(v) : nf0.format(Math.round(v)));
  };
  Pano.eurSigned = (v) => (v >= 0 ? '+' : '−') + Pano.eur(Math.abs(v), true);
  Pano.pct = (v, d = 0) => (d ? nf1.format(v) : nf0.format(Math.round(v))) + '%';
  Pano.roas = (v) => nf1.format(v) + '×';
  Pano.compact = (v) => {
    if (Math.abs(v) >= 1000000) return nf1.format(v / 1000000).replace(',0', '') + ' mln';
    if (Math.abs(v) >= 10000) return nf0.format(Math.round(v / 1000)) + 'k';
    if (Math.abs(v) >= 1000) return nf1.format(v / 1000).replace(',0', '') + 'k';
    return nf0.format(Math.round(v));
  };
  Pano.splitMoney = (v) => {
    const s = nf2.format(v);
    const i = s.lastIndexOf(',');
    return { int: s.slice(0, i), dec: s.slice(i) };
  };
  Pano.clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  Pano.lerp = (a, b, t) => a + (b - a) * t;
  Pano.cx = (...a) => a.filter(Boolean).join(' ');
  // Generatore pseudo-casuale con seme (dati demo stabili)
  Pano.rng = (seed) => { let s = seed >>> 0; return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };

  // ─── Icone (tratto 1.8, angoli arrotondati) ─────────────────────────────
  const P = {
    globe: <><circle cx="12" cy="12" r="9" /><path d="M3.6 9h16.8M3.6 15h16.8M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></>,
    panorama: <><path d="M3 18.5V6.2c0-.8.8-1.3 1.5-1 4.9 2 10.1 2 15 0 .7-.3 1.5.2 1.5 1v12.3c0 .8-.8 1.3-1.5 1-4.9-2-10.1-2-15 0-.7.3-1.5-.2-1.5-1Z" /><path d="m6.5 15 3-3.5 2.5 2.5 2-2 3.5 3.5" /><circle cx="15.5" cy="8.6" r="1.1" /></>,
    megaphone: <><path d="M4 10.5v3a1.5 1.5 0 0 0 1.5 1.5H7l5 4V5L7 9H5.5A1.5 1.5 0 0 0 4 10.5Z" /><path d="M16 8.5a5 5 0 0 1 0 7M18.8 6a8.5 8.5 0 0 1 0 12" /></>,
    bell: <><path d="M6 9.5a6 6 0 0 1 12 0c0 4.5 1.8 6 1.8 6H4.2S6 14 6 9.5Z" /><path d="M10 19a2.2 2.2 0 0 0 4 0" /></>,
    push: <><rect x="6.5" y="2.8" width="11" height="18.4" rx="2.6" /><path d="M10.5 17.8h3" /><circle cx="17.6" cy="5.4" r="3" fill="currentColor" stroke="none" /></>,
    users: <><circle cx="9" cy="8.5" r="3.5" /><path d="M2.8 19.5c.6-3.3 3.1-5.3 6.2-5.3s5.6 2 6.2 5.3" /><path d="M15.5 5.3a3.4 3.4 0 0 1 0 6.4M17.6 14.6c1.9.6 3.2 2.3 3.6 4.9" /></>,
    chart: <><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></>,
    chartUp: <><path d="M3 17l5.5-5.5 4 4L21 7" /><path d="M15 7h6v6" /></>,
    wallet: <><path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H18v3" /><path d="M4 7.5v10A2.5 2.5 0 0 0 6.5 20H20V8H6.5A2.5 2.5 0 0 1 4 5.5" /><circle cx="16" cy="14" r="1.2" fill="currentColor" /></>,
    plus: <path d="M12 5v14M5 12h14" />,
    minus: <path d="M5 12h14" />,
    sparkle: <><path d="M12 3.5 13.9 9a1.6 1.6 0 0 0 1.1 1.1l5.5 1.9-5.5 1.9a1.6 1.6 0 0 0-1.1 1.1L12 20.5 10.1 15A1.6 1.6 0 0 0 9 13.9L3.5 12 9 10.1A1.6 1.6 0 0 0 10.1 9Z" /></>,
    sparkles: <><path d="M10 4 11.5 8.5a1 1 0 0 0 .7.7L16.6 10.6l-4.4 1.4a1 1 0 0 0-.7.7L10 17.2l-1.5-4.5a1 1 0 0 0-.7-.7L3.4 10.6l4.4-1.4a1 1 0 0 0 .7-.7Z" /><path d="M18 3v4M16 5h4M18.5 15.5v3M17 17h3" /></>,
    search: <><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4.2-4.2" /></>,
    x: <path d="M6 6l12 12M18 6 6 18" />,
    check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
    chevR: <path d="m9 5 7 7-7 7" />,
    chevL: <path d="m15 5-7 7 7 7" />,
    chevD: <path d="m5 9 7 7 7-7" />,
    chevU: <path d="m5 15 7-7 7 7" />,
    arrowUR: <path d="M7 17 17 7M8 7h9v9" />,
    arrowR: <path d="M4 12h16M14 6l6 6-6 6" />,
    arrowL: <path d="M20 12H4M10 6l-6 6 6 6" />,
    up: <path d="M12 19V5M6 11l6-6 6 6" />,
    down: <path d="M12 5v14M6 13l6 6 6-6" />,
    calendar: <><rect x="3.5" y="5" width="17" height="15.5" rx="3" /><path d="M3.5 10h17M8 3v4M16 3v4" /></>,
    clock: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>,
    sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2.5v2M12 19.5v2M4.6 4.6 6 6M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4" /></>,
    sunset: <><path d="M17 17a5 5 0 0 0-10 0" /><path d="M12 4v5M4.2 10.2l1.4 1.4M2 17h2M20 17h2M18.4 11.6l1.4-1.4M3 21h18M9 6.5 12 4l3 2.5" /></>,
    moon: <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z" />,
    pin: <><path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0C18.5 15.4 12 21 12 21Z" /><circle cx="12" cy="10" r="2.4" /></>,
    eye: <><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" /><circle cx="12" cy="12" r="3" /></>,
    tap: <><path d="M9 11V5.5a1.5 1.5 0 0 1 3 0V11" /><path d="M12 10.5V9.8a1.5 1.5 0 0 1 3 0v1.7M15 11a1.5 1.5 0 0 1 3 0v3.5A6.5 6.5 0 0 1 11.5 21h-.3a6 6 0 0 1-4.6-2.2l-2.9-3.6a1.6 1.6 0 0 1 2.4-2.1L9 15" /></>,
    cutlery: <><path d="M7 3v8M4.5 3v5a2.5 2.5 0 0 0 5 0V3M7 11v10" /><path d="M17 21V3c-2.2 1.2-3.5 3.6-3.5 6.5V13H17" /></>,
    euro: <><path d="M17.5 6.5A7 7 0 1 0 17.5 17.5" /><path d="M4 10h9M4 14h9" /></>,
    zap: <path d="M13 2.5 4.5 13.5H12l-1 8 8.5-11H12l1-8Z" />,
    lock: <><rect x="5" y="10.5" width="14" height="10" rx="2.5" /><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" /></>,
    shield: <><path d="M12 3 4.5 6v5.5c0 4.6 3.1 8.2 7.5 9.5 4.4-1.3 7.5-4.9 7.5-9.5V6Z" /><path d="m9 12 2.2 2.2L15.5 10" /></>,
    info: <><circle cx="12" cy="12" r="8.5" /><path d="M12 11v5.5M12 7.8v.2" /></>,
    alert: <><path d="M10.3 4.2 2.8 17.5A2 2 0 0 0 4.5 20.5h15a2 2 0 0 0 1.7-3L13.7 4.2a2 2 0 0 0-3.4 0Z" /><path d="M12 9.5v4.5M12 17.2v.2" /></>,
    alertCircle: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5v5.5M12 16.3v.2" /></>,
    checkCircle: <><circle cx="12" cy="12" r="8.5" /><path d="m8.2 12.3 2.6 2.6 5-5.4" /></>,
    pause: <><rect x="6.5" y="5" width="3.6" height="14" rx="1.2" /><rect x="13.9" y="5" width="3.6" height="14" rx="1.2" /></>,
    play: <path d="M7.5 5.5v13a1 1 0 0 0 1.5.9l10.5-6.5a1 1 0 0 0 0-1.8L9 4.6a1 1 0 0 0-1.5.9Z" />,
    edit: <><path d="M4 20h4.5L19.3 9.2a2.1 2.1 0 0 0 0-3l-1.5-1.5a2.1 2.1 0 0 0-3 0L4 15.5Z" /><path d="m13.5 6.5 4 4" /></>,
    copy: <><rect x="8" y="8" width="12" height="12" rx="2.5" /><path d="M16 8V6.5A2.5 2.5 0 0 0 13.5 4h-7A2.5 2.5 0 0 0 4 6.5v7A2.5 2.5 0 0 0 6.5 16H8" /></>,
    more: <><circle cx="5.5" cy="12" r="1.4" fill="currentColor" /><circle cx="12" cy="12" r="1.4" fill="currentColor" /><circle cx="18.5" cy="12" r="1.4" fill="currentColor" /></>,
    filter: <path d="M4 5.5h16l-6.2 7.3V19l-3.6-1.8v-4.4Z" />,
    layers: <><path d="m12 3.5 9 4.8-9 4.8-9-4.8Z" /><path d="m3 12.3 9 4.8 9-4.8M3 16.3l9 4.8 9-4.8" /></>,
    target: <><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="3.5" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" /></>,
    phone: <><rect x="6.5" y="2.8" width="11" height="18.4" rx="2.6" /><path d="M10.5 17.8h3" /></>,
    image: <><rect x="3.5" y="4.5" width="17" height="15" rx="3" /><circle cx="9" cy="10" r="1.8" /><path d="m4 17.5 4.5-4.5 3.5 3.5 2.5-2.5 5.5 5" /></>,
    tag: <><path d="M3.5 12.3V4.5a1 1 0 0 1 1-1h7.8a1 1 0 0 1 .7.3l7.5 7.5a1 1 0 0 1 0 1.4l-7.8 7.8a1 1 0 0 1-1.4 0l-7.5-7.5a1 1 0 0 1-.3-.7Z" /><circle cx="8.3" cy="8.3" r="1.5" /></>,
    ticket: <><path d="M3.5 8.5a2 2 0 0 0 0 4v0a2 2 0 0 1 0 4V19a1.5 1.5 0 0 0 1.5 1.5h14a1.5 1.5 0 0 0 1.5-1.5v-2.5a2 2 0 0 1 0-4v0a2 2 0 0 0 0-4V6A1.5 1.5 0 0 0 19 4.5H5A1.5 1.5 0 0 0 3.5 6Z" /><path d="M14 5v15" strokeDasharray="2 2.4" /></>,
    star: <path d="m12 3.5 2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.2-4.1 5.8-.8Z" />,
    gear: <><circle cx="12" cy="12" r="3" /><path d="M19.4 13.5a7.6 7.6 0 0 0 0-3l2-1.6-2-3.4-2.4.9a7.5 7.5 0 0 0-2.6-1.5L14 2.5h-4l-.4 2.4A7.5 7.5 0 0 0 7 6.4l-2.4-.9-2 3.4 2 1.6a7.6 7.6 0 0 0 0 3l-2 1.6 2 3.4 2.4-.9a7.5 7.5 0 0 0 2.6 1.5l.4 2.4h4l.4-2.4a7.5 7.5 0 0 0 2.6-1.5l2.4.9 2-3.4Z" /></>,
    logout: <><path d="M15 4.5h2.5A2.5 2.5 0 0 1 20 7v10a2.5 2.5 0 0 1-2.5 2.5H15" /><path d="M10 16.5 14.5 12 10 7.5M14.5 12H4" /></>,
    external: <><path d="M14 4.5h5.5V10M19.5 4.5 11 13" /><path d="M18 14v3.5A2.5 2.5 0 0 1 15.5 20h-9A2.5 2.5 0 0 1 4 17.5v-9A2.5 2.5 0 0 1 6.5 6H10" /></>,
    card: <><rect x="3" y="5.5" width="18" height="13" rx="2.5" /><path d="M3 10h18M7 15h3" /></>,
    bolt: <path d="M13 2.5 4.5 13.5H12l-1 8 8.5-11H12l1-8Z" />,
    receipt: <><path d="M6 3.5h12v17l-2.5-1.5-2 1.5-1.5-1.5-1.5 1.5-2-1.5L6 20.5Z" /><path d="M9 8h6M9 11.5h6M9 15h3.5" /></>,
    history: <><path d="M4 12a8 8 0 1 0 2.3-5.7L4 8.5" /><path d="M4 4v4.5h4.5M12 8v4.3l3 1.8" /></>,
    list: <path d="M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01" />,
    grid: <><rect x="4" y="4" width="6.5" height="6.5" rx="1.6" /><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.6" /><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.6" /><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.6" /></>,
    heart: <path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7a4.3 4.3 0 0 1 7.5 2.8C19.5 15.4 12 20 12 20Z" />,
    repeat: <><path d="M17 2.5 20.5 6 17 9.5" /><path d="M3.5 11.5v-1A4.5 4.5 0 0 1 8 6h12.5M7 21.5 3.5 18 7 14.5" /><path d="M20.5 12.5v1A4.5 4.5 0 0 1 16 18H3.5" /></>,
    userPlus: <><circle cx="9.5" cy="8.5" r="3.5" /><path d="M3.3 19.5c.6-3.3 3.1-5.3 6.2-5.3s5.6 2 6.2 5.3M18.5 8v6M15.5 11h6" /></>,
    store: <><path d="M4 9.5 5.5 4h13L20 9.5" /><path d="M4 9.5a2.7 2.7 0 0 0 5.3 0 2.7 2.7 0 0 0 5.4 0 2.7 2.7 0 0 0 5.3 0" /><path d="M5.5 11.5V20h13v-8.5M10 20v-5h4v5" /></>,
    map: <><path d="M9 4.5 3.5 6.5v13L9 17.5l6 2 5.5-2v-13L15 6.5Z" /><path d="M9 4.5v13M15 6.5v13" /></>,
    send: <><path d="M20.5 3.5 10 14" /><path d="m20.5 3.5-6.5 17-4-6.5-6.5-4Z" /></>,
    timer: <><circle cx="12" cy="13.5" r="7.5" /><path d="M12 9.5v4l2.5 1.5M9.5 2.5h5" /></>,
    flag: <><path d="M5 21V4" /><path d="M5 4.5c5-2.5 8 2.5 14 0v9c-6 2.5-9-2.5-14 0" /></>,
    wand: <><path d="m4 20 11-11M14.5 4.5l1-2 1 2 2 1-2 1-1 2-1-2-2-1ZM19 11l.6-1.2L20.8 9.2 19.6 8.6 19 7.4l-.6 1.2-1.2.6 1.2.6Z" /></>,
    percent: <><path d="M19 5 5 19" /><circle cx="7" cy="7" r="2.3" /><circle cx="17" cy="17" r="2.3" /></>,
    help: <><circle cx="12" cy="12" r="8.5" /><path d="M9.6 9.3a2.5 2.5 0 0 1 4.8.9c0 1.7-2.4 2.2-2.4 3.6M12 16.8v.2" /></>,
    wine: <><path d="M8 3h8l-.5 5.5a3.5 3.5 0 0 1-7 0Z" /><path d="M12 12v8.5M8.5 20.5h7" /></>,
    rocket: <><path d="M14.5 4.5c2.5-1 4.5-1 5-.5s.5 2.5-.5 5c-1.4 3.4-4.6 6.4-6.9 7.9l-3.5-3.5c1.5-2.3 4.5-5.5 5.9-8.9Z" /><path d="M8.6 13.4 5 13l2.5-3.5h3.2M10.6 15.4l.4 3.6 3.5-2.5v-3.2" /><circle cx="15.5" cy="8.5" r="1.4" /><path d="M5.5 18.5 4 20" /></>,
    hourglass: <path d="M6.5 3.5h11M6.5 20.5h11M7.5 3.5c0 4 4.5 5.2 4.5 8.5s-4.5 4.5-4.5 8.5M16.5 3.5c0 4-4.5 5.2-4.5 8.5s4.5 4.5 4.5 8.5" />,
    ban: <><circle cx="12" cy="12" r="8.5" /><path d="m6 6 12 12" /></>,
    inbox: <><path d="M3.5 13.5 6 5.5h12l2.5 8V18a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2Z" /><path d="M3.5 13.5H8l1.5 2.5h5l1.5-2.5h4.5" /></>,
    pizza: <><path d="M12 21 3.5 6.5a17 17 0 0 1 17 0Z" /><path d="M5.2 9.4a14 14 0 0 1 13.6 0" /><circle cx="10" cy="11.5" r="1" fill="currentColor" /><circle cx="13.5" cy="14.5" r="1" fill="currentColor" /></>,
    fish: <><path d="M3 12s3.5-5 9-5c4 0 6.5 2.5 7.5 5-1 2.5-3.5 5-7.5 5-5.5 0-9-5-9-5Z" /><path d="M19.5 12 22 9v6Z" /><circle cx="15" cy="11" r=".9" fill="currentColor" /></>,
    glass: <><path d="M6 3.5h12l-1.4 7.2a4.7 4.7 0 0 1-9.2 0Z" /><path d="M12 15.5v5M8.5 20.5h7M6.7 7h10.6" /></>,
    coffee: <><path d="M4.5 8.5h12V14a5 5 0 0 1-5 5h-2a5 5 0 0 1-5-5Z" /><path d="M16.5 9.5h1.5a2.5 2.5 0 0 1 0 5h-1.6M8 3v2.5M11 3v2.5" /></>,
    sun2: <><circle cx="12" cy="12" r="4.5" /><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2" /></>,
    route: <><circle cx="6" cy="18" r="2.5" /><circle cx="18" cy="6" r="2.5" /><path d="M8.5 18H15a3.5 3.5 0 0 0 0-7H9a3.5 3.5 0 0 1 0-7h6.5" /></>,
    gift: <><rect x="3.5" y="8.5" width="17" height="4" rx="1" /><path d="M5 12.5V20h14v-7.5M12 8.5V20M12 8.5S10.5 4 8 4.5 7 8.5 12 8.5ZM12 8.5S13.5 4 16 4.5 17 8.5 12 8.5Z" /></>,
    bookmark: <path d="M6.5 3.5h11V21L12 17l-5.5 4Z" />,
    party: <><path d="M4 20 8.5 7.5 16.5 15.5Z" /><path d="M13 3.5c.5 1.5 0 2.5-1 3M20.5 11c-1.5-.5-2.5 0-3 1M15 5.5l.5-.5M18.5 9l.5-.5M17 3.5v1M20.5 7h-1" /></>,
    expand: <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />,
    compass: <><circle cx="12" cy="12" r="8.5" /><path d="m15.5 8.5-2 5-5 2 2-5Z" /></>,
    dots6: <><circle cx="9" cy="6" r="1.2" fill="currentColor" /><circle cx="15" cy="6" r="1.2" fill="currentColor" /><circle cx="9" cy="12" r="1.2" fill="currentColor" /><circle cx="15" cy="12" r="1.2" fill="currentColor" /><circle cx="9" cy="18" r="1.2" fill="currentColor" /><circle cx="15" cy="18" r="1.2" fill="currentColor" /></>,
  };
  Pano.Icon = function Icon({ n, size, style, className, strokeWidth = 1.8, title }) {
    const p = P[n] || P.info;
    return (
      <svg viewBox="0 0 24 24" width={size || undefined} height={size || undefined} fill="none" stroke="currentColor"
        strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}
        aria-hidden={title ? undefined : 'true'} role={title ? 'img' : undefined} aria-label={title}>
        {p}
      </svg>
    );
  };
  // Il marchio byup (il file ufficiale byuploghi-16 a, stessi tracciati): icona
  // dell'app nelle anteprime push e nel digest. Colore libero, forma mai.
  Pano.BYUP_PINK = '#FF1F5A';
  Pano.ByupGlyph = function ByupGlyph({ size = 20, color = '#fff', className }) {
    return (
      <svg viewBox="45 58 450 583" width={size} height={Math.round((size * 583) / 450)} aria-hidden="true" className={className}>
        <g transform="translate(0 700) scale(0.1 -0.1)" fill={color}>
          <path d="M1775 6409 c-317 -37 -619 -179 -849 -399 -222 -213 -348 -435 -427 -750 l-24 -95 0 -1305 0 -1305 24 -74 c77 -235 301 -408 551 -428 86 -6 194 9 495 69 962 192 1822 538 2232 897 338 296 553 698 618 1152 19 133 19 404 0 537 -116 818 -668 1453 -1431 1646 -207 52 -270 58 -704 61 -223 2 -441 -1 -485 -6z m1744 -1248 c72 -37 135 -128 172 -251 19 -61 24 -98 24 -200 0 -74 -6 -147 -14 -180 -53 -211 -186 -337 -317 -300 -94 26 -185 149 -220 296 -21 84 -23 256 -5 339 28 127 94 238 170 287 56 35 132 38 190 9z" />
          <path d="M4358 2740 c-95 -16 -151 -44 -301 -144 -448 -302 -858 -498 -1501 -715 -646 -219 -1009 -295 -1601 -335 -231 -16 -312 -34 -382 -85 -48 -35 -86 -83 -102 -130 -19 -57 -14 -260 8 -330 50 -160 175 -273 376 -340 205 -67 156 -65 1455 -69 1223 -3 1309 -1 1480 39 304 70 521 189 731 398 230 228 367 506 410 828 15 115 6 415 -15 501 -20 78 -63 164 -110 219 -101 117 -299 189 -448 163z" />
        </g>
      </svg>
    );
  };

  // ─── Store condiviso (stato del prototipo) ──────────────────────────────
  function createStore(init) {
    let state = init;
    const subs = new Set();
    return {
      get: () => state,
      set: (patch) => {
        const next = typeof patch === 'function' ? patch(state) : patch;
        state = Object.assign({}, state, next);
        subs.forEach((f) => f());
      },
      sub: (f) => { subs.add(f); return () => subs.delete(f); },
    };
  }
  Pano.createStore = createStore;
  Pano.store = createStore({});
  Pano.useStore = function useStore(sel) {
    const s = Pano.store;
    return useSyncExternalStore(s.sub, () => sel(s.get()));
  };

  // ─── Avvisi in basso (toast) con «Annulla» ──────────────────────────────
  let toastId = 0;
  Pano.toast = (text, opts = {}) => {
    const id = ++toastId;
    const t = { id, text, undo: opts.undo, icon: opts.icon || 'checkCircle' };
    Pano.store.set((s) => ({ toasts: [...(s.toasts || []), t] }));
    setTimeout(() => Pano.store.set((s) => ({ toasts: (s.toasts || []).filter((x) => x.id !== id) })), opts.ms || 4800);
  };

  // ─── Hook ───────────────────────────────────────────────────────────────
  Pano.useMedia = function useMedia(q) {
    const get = () => (typeof window !== 'undefined' && window.matchMedia ? window.matchMedia(q).matches : false);
    const [m, setM] = useState(get);
    useEffect(() => {
      const mq = window.matchMedia(q);
      const f = () => setM(mq.matches);
      mq.addEventListener ? mq.addEventListener('change', f) : mq.addListener(f);
      return () => (mq.removeEventListener ? mq.removeEventListener('change', f) : mq.removeListener(f));
    }, [q]);
    return m;
  };
  Pano.useInterval = function useInterval(fn, ms) {
    const ref = useRef(fn);
    ref.current = fn;
    useEffect(() => {
      if (ms == null) return;
      const id = setInterval(() => ref.current(), ms);
      return () => clearInterval(id);
    }, [ms]);
  };
  // Conta da 0 al valore (una volta, al primo disegno)
  Pano.useCountUp = function useCountUp(target, ms = 900) {
    const [v, setV] = useState(target);
    const first = useRef(true);
    useEffect(() => {
      const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!first.current || reduce) { setV(target); return; }
      first.current = false;
      const t0 = performance.now();
      let raf;
      const step = (t) => {
        const k = Math.min(1, (t - t0) / ms);
        const e = 1 - Math.pow(1 - k, 3);
        setV(target * e);
        if (k < 1) raf = requestAnimationFrame(step);
      };
      setV(0);
      raf = requestAnimationFrame(step);
      return () => cancelAnimationFrame(raf);
    }, [target]);
    return v;
  };
  Pano.useOutside = function useOutside(ref, onOut, active = true) {
    useEffect(() => {
      if (!active) return;
      const f = (e) => { if (ref.current && !ref.current.contains(e.target)) onOut(e); };
      const k = (e) => { if (e.key === 'Escape') onOut(e); };
      setTimeout(() => document.addEventListener('pointerdown', f), 0);
      document.addEventListener('keydown', k);
      return () => { document.removeEventListener('pointerdown', f); document.removeEventListener('keydown', k); };
    }, [active]);
  };
  Pano.useEscape = function useEscape(onEsc, active = true) {
    useEffect(() => {
      if (!active) return;
      const k = (e) => { if (e.key === 'Escape') onEsc(e); };
      document.addEventListener('keydown', k);
      return () => document.removeEventListener('keydown', k);
    }, [active, onEsc]);
  };
  Pano.safeStorage = {
    get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* niente: preferenza solo locale */ } },
  };
})();
