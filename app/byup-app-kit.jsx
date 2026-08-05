/* ============================================================
   byup-app-kit.jsx — design system condiviso app consumer
   Espone window.ByupKit. Va caricato PRIMA di ogni altro modulo.
   Contiene: tokens + tema adattivo · atmosfera · font · háptica ·
   useFirstVisit · sistema mascotte (MascotMoment / Mascot) ·
   registry asset · primitive (GlassPanel, PillButton).
   ============================================================ */
(() => {
const { useState, useEffect, useMemo, useRef, useCallback } = React;

/* ---------- 1 · REGISTRY ASSET ---------- */
const asset = (n) => `assets/${n}.png`;
const ASSETS = {
  mascot: {
    confident: asset('mascot-confident'),
    happy:     asset('mascot-happy'),
    wave:      asset('mascot-wave'),
    wink:      asset('mascot-wink'),
    chef:      asset('mascot-chef'),
    waiter:    asset('mascot-waiter'),
    sleep:     asset('mascot-sleep'),
    phone:     asset('mascot-phone'),
  },
  cat: {
    ...Object.fromEntries(['pizza','burger','dolce','vino','aperitivo','panini',
      'birra','poke','taco','torta','brunch','cocktail'].map(k => [k, asset('cat-'+k)])),
    // Nuove icone kawaii (sostituiscono le vecchie 3D)
    cocktail: asset('icon-sushi'),
    dolce:    asset('icon-donut'),
    brunch:   asset('icon-coffee'),
  },
  hero: Object.fromEntries(['coffee','spritz','froyo','burger']
    .map(k => [k, asset('hero-'+k)])),
  bg: Object.fromEntries(['coral','dark','light']
    .map(k => [k, asset('bg-'+k)])),
};

/* ---------- 2 · TOKENS ---------- */
const PALETTE = {
  coral: '#e32459', coralHot: '#ff3d6e',
  wine: '#4d122e', wineLight: '#ae3152',
  cream: '#fae3de', blush: '#ed9b9b',
  lime: '#ceff00', ink: '#141414',
};

const THEMES = {
  light: {
    dark: false,
    bg: '#FBF4F1', surface: '#ffffff', surfaceAlt: '#fdf0ec',
    text: '#1c0f15', textDim: 'rgba(28,15,21,.56)', textFaint: 'rgba(28,15,21,.34)',
    primary: PALETTE.coral, onPrimary: '#ffffff',
    accentSoft: 'rgba(227,36,89,.10)', accentBorder: 'rgba(227,36,89,.18)',
    glass: 'rgba(255,255,255,.62)', glassBorder: 'rgba(255,255,255,.75)',
    line: 'rgba(77,18,46,.10)',
    shadow: '0 18px 40px -24px rgba(227,36,89,.30)',
    shadowSoft: '0 10px 28px -18px rgba(227,36,89,.22)',
    glow: 'rgba(227,36,89,.11)',
    bgImage: ASSETS.bg.light,
  },
  dark: {
    dark: true,
    // Base = nero-brand caldo (espresso-charcoal), NON rosso scuro. Accenti magenta per contrasto.
    bg: '#161514', surface: '#201e1c', surfaceAlt: '#2a2724',
    text: '#f6ece9', textDim: 'rgba(246,236,233,.60)', textFaint: 'rgba(246,236,233,.36)',
    primary: PALETTE.coralHot, onPrimary: '#ffffff',
    accentSoft: 'rgba(255,61,110,.15)', accentBorder: 'rgba(255,61,110,.30)',
    glass: 'rgba(32,30,28,.62)', glassBorder: 'rgba(246,236,233,.12)',
    line: 'rgba(246,236,233,.10)',
    shadow: '0 18px 40px -22px rgba(255,61,110,.34)',
    shadowSoft: '0 12px 30px -16px rgba(0,0,0,.62)',
    glow: 'rgba(255,61,110,.12)',
    bgImage: ASSETS.bg.dark,
  },
};

const TYPE = {
  display: "'Fredoka', -apple-system, sans-serif",
  sans: "'Hanken Grotesk', -apple-system, 'SF Pro Text', system-ui, sans-serif",
  // scala: 34/26/22 · 19 · 16 · 13.5 · 12
  h1: { fontSize: 34, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.08 },
  h2: { fontSize: 26, fontWeight: 600, letterSpacing: '-0.015em', lineHeight: 1.12 },
  h3: { fontSize: 22, fontWeight: 500, letterSpacing: '-0.01em', lineHeight: 1.15 },
  title: { fontSize: 19, fontWeight: 600, lineHeight: 1.25 },
  body: { fontSize: 16, fontWeight: 400, lineHeight: 1.45 },
  small: { fontSize: 13.5, fontWeight: 500, lineHeight: 1.35 },
  micro: { fontSize: 12, fontWeight: 600, lineHeight: 1.3, letterSpacing: '0.02em' },
};

const RADII = { card: 24, cardLg: 28, sheet: 28, pill: 999, chip: 16 };
const SPRING = 'cubic-bezier(.34,1.45,.64,1)';
const EASE_OUT = 'cubic-bezier(.22,.9,.35,1)';
const DUR = { fast: 200, base: 300, slow: 420 };

/* ---------- 3 · FONT + KEYFRAMES (iniettati una volta) ---------- */
(function injectOnce() {
  if (document.getElementById('byup-kit-style')) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600&family=Hanken+Grotesk:wght@400;500;600;700&display=swap';
  document.head.appendChild(link);
  const st = document.createElement('style');
  st.id = 'byup-kit-style';
  st.textContent = `
  @keyframes bkFadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:none; } }
  @keyframes bkPopIn { 0% { opacity:0; transform:scale(.6) translateY(30px); } 60% { transform:scale(1.06) translateY(-4px); } 100% { opacity:1; transform:scale(1) translateY(0); } }
  @keyframes bkMascotIn { 0% { opacity:0; transform:translateY(90%) scale(.7) rotate(6deg); } 55% { opacity:1; transform:translateY(-6%) scale(1.05) rotate(-2deg); } 78% { transform:translateY(2%) scale(.98) rotate(1deg); } 100% { opacity:1; transform:translateY(0) scale(1) rotate(0); } }
  @keyframes bkBob { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-7px); } }
  @keyframes bkWiggle { 0%,100% { transform:rotate(0); } 25% { transform:rotate(-3deg); } 75% { transform:rotate(3deg); } }
  @keyframes bkBubbleIn { 0% { opacity:0; transform:scale(.7) translateY(8px); } 100% { opacity:1; transform:scale(1) translateY(0); } }
  @keyframes bkPulse { 0%,100% { opacity:.55; transform:scale(1); } 50% { opacity:1; transform:scale(1.12); } }
  @keyframes bkConfettiFall { 0% { opacity:1; transform:translateY(-10px) rotate(0); } 100% { opacity:0; transform:translateY(120px) rotate(340deg); } }
  @keyframes bkGrainShift { 0%,100% { transform:translate(0,0); } 50% { transform:translate(-1.5%,1%); } }
  @keyframes bkSpinRing { to { transform: rotate(360deg); } }
  @keyframes bkFloat { 0%,100% { transform: translateY(0) rotate(-4deg); } 50% { transform: translateY(-9px) rotate(4deg); } }
  @keyframes bkKenBurns { 0% { transform: scale(1); } 100% { transform: scale(1.09); } }
  @keyframes bkShimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
  @keyframes bkCtaPulse { 0%,100% { transform:scale(1); box-shadow:0 8px 20px -6px rgba(227,36,89,.55); } 50% { transform:scale(1.05); box-shadow:0 12px 30px -6px rgba(227,36,89,.8); } }
  @keyframes bkShine { 0% { transform:translateX(-170%) skewX(-18deg); } 55%,100% { transform:translateX(280%) skewX(-18deg); } }
  @keyframes bkTitleIn { 0% { opacity:0; transform:translateY(26px) scale(.95); } 60% { opacity:1; transform:translateY(-3px) scale(1.02); } 100% { opacity:1; transform:translateY(0) scale(1); } }
  .bk-press { transition: transform ${DUR.fast}ms ${SPRING}; }
  .bk-press:active { transform: scale(.97); }
  `;
  document.head.appendChild(st);
})();

/* ---------- 4 · TEMA ADATTIVO ---------- */
/* mode: 'auto' | 'light' | 'dark' (persistito). Ritorna [T, mode, setMode] */
function useByupTheme() {
  const [mode, setModeRaw] = useState(() => {
    try { return localStorage.getItem('byup.themeMode') || 'light'; } catch { return 'light'; }
  });
  const [sysDark, setSysDark] = useState(() =>
    window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const fn = (e) => setSysDark(e.matches);
    mq.addEventListener ? mq.addEventListener('change', fn) : mq.addListener(fn);
    return () => { mq.removeEventListener ? mq.removeEventListener('change', fn) : mq.removeListener(fn); };
  }, []);
  const setMode = useCallback((m) => {
    setModeRaw(m);
    try { localStorage.setItem('byup.themeMode', m); } catch {}
  }, []);
  const dark = mode === 'auto' ? sysDark : mode === 'dark';
  const T = dark ? THEMES.dark : THEMES.light;
  return [T, mode, setMode];
}

/* ---------- 5 · HÁPTICA ---------- */
const haptic = {
  selection: () => { try { navigator.vibrate && navigator.vibrate(8); } catch {} },
  light:     () => { try { navigator.vibrate && navigator.vibrate(12); } catch {} },
  success:   () => { try { navigator.vibrate && navigator.vibrate([14, 60, 20]); } catch {} },
  error:     () => { try { navigator.vibrate && navigator.vibrate([40, 40, 40]); } catch {} },
};

/* ---------- 6 · ATMOSFERA ---------- */
/* Fondo vivo obbligatorio: glow coral radiale + grana. Avvolge la schermata. */
const GRAIN_URI = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")";

function Atmosphere({ T, children, style, glowTop = '-12%', glowSize = '78%' }) {
  return (
    <div style={{ position: 'relative', minHeight: '100%', background: T.bg, overflow: 'hidden', ...style }}>
      {/* glow coral d'ambiente */}
      <div aria-hidden style={{
        position: 'absolute', left: '50%', top: glowTop, width: glowSize, aspectRatio: '1',
        transform: 'translateX(-50%)', pointerEvents: 'none',
        background: `radial-gradient(circle, ${T.glow} 0%, transparent 65%)`,
      }}/>
      <div aria-hidden style={{
        position: 'absolute', right: '-18%', bottom: '-10%', width: '55%', aspectRatio: '1',
        pointerEvents: 'none',
        background: `radial-gradient(circle, ${T.glow} 0%, transparent 68%)`, opacity: .7,
      }}/>
      {/* grana sottile */}
      <div aria-hidden style={{
        position: 'absolute', inset: '-2%', pointerEvents: 'none',
        backgroundImage: GRAIN_URI, backgroundSize: 140,
        opacity: T.dark ? .05 : .035, mixBlendMode: T.dark ? 'screen' : 'multiply',
      }}/>
      <div style={{ position: 'relative' }}>{children}</div>
    </div>
  );
}

/* ---------- 7 · PRIMITIVE ---------- */
function GlassPanel({ T, children, style, radius = RADII.card }) {
  return (
    <div style={{
      background: T.glass,
      backdropFilter: 'blur(24px) saturate(160%)', WebkitBackdropFilter: 'blur(24px) saturate(160%)',
      border: `1px solid ${T.glassBorder}`, borderRadius: radius,
      boxShadow: T.shadowSoft, ...style,
    }}>{children}</div>
  );
}

function PillButton({ T, children, onClick, variant = 'primary', style }) {
  const base = variant === 'primary'
    ? { background: T.primary, color: T.onPrimary, boxShadow: T.shadow, border: 'none' }
    : { background: T.accentSoft, color: T.primary, border: `1px solid ${T.accentBorder}`, boxShadow: 'none' };
  return (
    <button className="bk-press" onClick={(e) => { haptic.light(); onClick && onClick(e); }}
      style={{
        fontFamily: TYPE.sans, fontSize: 16, fontWeight: 700, letterSpacing: '0.01em',
        padding: '15px 26px', borderRadius: RADII.pill, cursor: 'pointer', ...base, ...style,
      }}>{children}</button>
  );
}

/* ---------- 8 · PRIMA VISITA ---------- */
function useFirstVisit(pageKey) {
  const KEY = 'byup.seen.' + pageKey;
  const [first] = useState(() => {
    try {
      if (localStorage.getItem(KEY)) return false;
      localStorage.setItem(KEY, String(Date.now()));
      return true;
    } catch { return false; }
  });
  return first;
}
/* utile in dev: ByupKit.resetFirstVisits() */
function resetFirstVisits() {
  try {
    Object.keys(localStorage).filter(k => k.startsWith('byup.seen.')).forEach(k => localStorage.removeItem(k));
  } catch {}
}

/* ---------- 9 · MASCOTTE ---------- */
/* Visual base: PNG + transform CSS. API pronta per Rive:
   sostituire il contenuto di MascotVisual senza toccare i call-site. */
function MascotVisual({ pose = 'happy', size = 120, anim = 'bob', style }) {
  const src = ASSETS.mascot[pose] || ASSETS.mascot.happy;
  const animation = anim === 'bob' ? 'bkBob 2.6s ease-in-out infinite'
    : anim === 'wiggle' ? 'bkWiggle 1.8s ease-in-out infinite'
    : anim === 'none' ? 'none' : anim;
  return (
    <img src={src} alt="" draggable={false} loading="lazy"
      style={{ width: size, height: 'auto', display: 'block', animation,
        filter: 'drop-shadow(0 14px 22px rgba(77,18,46,.28))', userSelect: 'none', ...style }}/>
  );
}

/* Coriandoli per i momenti di celebrazione */
function Confetti({ count = 26 }) {
  const bits = useMemo(() => Array.from({ length: count }, (_, i) => ({
    left: Math.random() * 100,
    delay: Math.random() * .5,
    dur: 1.1 + Math.random() * .9,
    color: [PALETTE.coral, PALETTE.coralHot, PALETTE.cream, PALETTE.lime, PALETTE.blush][i % 5],
    size: 6 + Math.random() * 6,
    round: Math.random() > .5,
  })), [count]);
  return (
    <div aria-hidden style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {bits.map((b, i) => (
        <span key={i} style={{
          position: 'absolute', left: b.left + '%', top: '-12px',
          width: b.size, height: b.size * (b.round ? 1 : .55),
          background: b.color, borderRadius: b.round ? '50%' : 2,
          animation: `bkConfettiFall ${b.dur}s ${b.delay}s ${EASE_OUT} forwards`,
        }}/>
      ))}
    </div>
  );
}

/* MascotMoment — interazione "prima visita" per pagina.
   Props: pose, message, pageKey, T, coachmark? {text}, side? 'right'|'left',
   size?, force? (ignora firstVisit, per success/empty), onDismiss?, confetti? */
function MascotMoment({ pose = 'happy', message, pageKey, T = THEMES.light,
                        coachmark, side = 'right', size = 132, force = false,
                        confetti = false, onDismiss,
                        /* absolute: dentro un frame/telefono (ios-frame) — fixed: full page */
                        absolute = false, bottom = null }) {
  const first = useFirstVisit(pageKey || 'moment.' + pose);
  const show = force || first;
  const [gone, setGone] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const timer = useRef(null);

  const dismiss = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    setLeaving(true);
    setTimeout(() => { setGone(true); onDismiss && onDismiss(); }, 320);
  }, [onDismiss]);

  useEffect(() => {
    if (!show || gone) return;
    haptic.light();
    timer.current = setTimeout(dismiss, 9000); // non fastidiosa: esce da sola
    return () => timer.current && clearTimeout(timer.current);
  }, [show, gone, dismiss]);

  if (!show || gone) return null;
  const horiz = side === 'right' ? { right: 14 } : { left: 14 };
  return (
    <div onClick={dismiss} role="status" aria-live="polite"
      style={{
        position: absolute ? 'absolute' : 'fixed',
        bottom: bottom != null ? bottom : 'calc(96px + env(safe-area-inset-bottom, 0px))', ...horiz,
        zIndex: 9000, display: 'flex', flexDirection: 'column',
        alignItems: side === 'right' ? 'flex-end' : 'flex-start',
        gap: 10, cursor: 'pointer', maxWidth: '78vw',
        opacity: leaving ? 0 : 1,
        transform: leaving ? 'translateY(24px) scale(.85)' : 'none',
        transition: `opacity 300ms ${EASE_OUT}, transform 300ms ${EASE_OUT}`,
      }}>
      {/* fumetto */}
      <div style={{
        background: T.surface, color: T.text,
        fontFamily: TYPE.sans, fontSize: 15, fontWeight: 600, lineHeight: 1.35,
        padding: '12px 16px', borderRadius: 18,
        borderBottomRightRadius: side === 'right' ? 6 : 18,
        borderBottomLeftRadius: side === 'left' ? 6 : 18,
        border: `1px solid ${T.line}`, boxShadow: T.shadow,
        animation: `bkBubbleIn 360ms 340ms ${SPRING} backwards`,
      }}>{message}</div>
      {coachmark && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 7,
          fontFamily: TYPE.sans, fontSize: 12.5, fontWeight: 700,
          color: T.primary, background: T.accentSoft,
          border: `1px solid ${T.accentBorder}`,
          padding: '7px 12px', borderRadius: RADII.pill,
          animation: `bkBubbleIn 360ms 520ms ${SPRING} backwards`,
        }}>
          <span aria-hidden style={{
            width: 8, height: 8, borderRadius: '50%', background: T.primary,
            animation: 'bkPulse 1.4s ease-in-out infinite',
          }}/>
          {coachmark.text || coachmark}
        </div>
      )}
      <div style={{ position: 'relative', animation: `bkMascotIn 620ms ${SPRING} backwards` }}>
        {confetti && <Confetti/>}
        <MascotVisual pose={pose} size={size} anim="bob"/>
      </div>
    </div>
  );
}

/* Mascot inline — per empty / loading / success / errore dentro il layout */
function Mascot({ pose = 'sleep', size = 110, message, T = THEMES.light, anim = 'bob', style }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
      padding: 24, textAlign: 'center', animation: `bkFadeUp 420ms ${EASE_OUT} backwards`, ...style,
    }}>
      <MascotVisual pose={pose} size={size} anim={anim}/>
      {message && <div style={{
        fontFamily: TYPE.sans, fontSize: 15, fontWeight: 600,
        color: T.textDim, maxWidth: 240, lineHeight: 1.4,
      }}>{message}</div>}
    </div>
  );
}

/* ---------- EXPORT ---------- */
window.ByupKit = {
  ASSETS, PALETTE, THEMES, TYPE, RADII, SPRING, EASE_OUT, DUR,
  useByupTheme, haptic, Atmosphere, GlassPanel, PillButton,
  useFirstVisit, resetFirstVisits,
  MascotVisual, MascotMoment, Mascot, Confetti,
  GRAIN_URI,
};
/* sync */
})();

// ─── Registro consensi (GDPR) ───────────────────────────────────────────────
// Un solo posto per TUTTI i consensi dell'app (A3 allergeni, A18 offerte su
// preferenze, A6 marketing) e per l'opt-out SUGG (suggerimenti
// personalizzati, legittimo interesse: stato assente = ATTIVO).
//
// REGOLA DI COMPOSIZIONE (chi può ricevere cosa):
//   promo generiche E su misura sullo storico ordini → basta A6 (che le
//     dichiara entrambe: PROMOP è stato assorbito in A6 il 2026-08-06 —
//     non reintrodurlo; il consenso unico NON copre i dati alimentari)
//   promo su pref. alimentari → A6 && A18 (mai da soli: il dato è sensibile)
//   suggerimenti in-app    → SUGG non disattivato (niente consenso: LI con
//                            opt-out; la città viene dal contesto d'uso
//                            corrente, MAI dai log di accesso/sicurezza)
// Due strutture: lo STATO corrente per consenso e il LOG append-only
// (consent_data) — ogni cambio scrive una riga con timestamp e versione
// dell'informativa: è quella la prova, non lo stato.
(function () {
  const K_STATO = 'byup_consent_state';
  const K_LOG = 'byup_consent_data';
  const VERSIONE_INFORMATIVA = '1.0';
  const leggi = (k, fb) => { try { const r = localStorage.getItem(k); return r ? JSON.parse(r) : fb; } catch (e) { return fb; } };
  const scrivi = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  window.ByupConsensi = {
    VERSIONE_INFORMATIVA,
    // {ok, quando, versione} oppure null se mai deciso
    stato(id) { return leggi(K_STATO, {})[id] || null; },
    set(id, ok) {
      const quando = new Date().toISOString();
      const stato = leggi(K_STATO, {});
      stato[id] = { ok: !!ok, quando, versione: VERSIONE_INFORMATIVA };
      scrivi(K_STATO, stato);
      const log = leggi(K_LOG, []);
      log.push({ id, ok: !!ok, quando, versione: VERSIONE_INFORMATIVA });
      scrivi(K_LOG, log);
      return stato[id];
    },
    // Revoca "profonda": azzera anche la decisione (torna "mai chiesto"),
    // ma il log conserva la storia.
    azzera(id) {
      const quando = new Date().toISOString();
      const stato = leggi(K_STATO, {});
      delete stato[id];
      scrivi(K_STATO, stato);
      const log = leggi(K_LOG, []);
      log.push({ id, ok: false, revocato: true, quando, versione: VERSIONE_INFORMATIVA });
      scrivi(K_LOG, log);
    },
    log() { return leggi(K_LOG, []); },
  };
})();
