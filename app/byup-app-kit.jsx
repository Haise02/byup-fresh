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
// ─── Allergeni: il dizionario unico dei quattordici ────────
// Allegato II del Reg. UE 1169/2011, nell'ordine in cui la norma li elenca.
// È un elenco chiuso e completo: non se ne aggiungono, non se ne tolgono e
// nessuna schermata ne tiene una copia propria. Il profilo, dove la persona
// dichiara che cosa evitare, e il filtro del menù, che dovrebbe proteggerla,
// leggono entrambi da qui. Prima erano due liste diverse, una di otto e una di
// quattordici, con identificativi che non coincidevano: chi era allergico alla
// senape non aveva come dirlo, e chi dichiarava la frutta a guscio nel profilo
// non veniva riconosciuto dal menù, che la chiamava in un altro modo.
//
// `code` è il codice del dizionario `allergens` del modello dati. Serve perché
// quando arriveranno le interfacce applicative la corrispondenza sia già
// scritta e non da indovinare, e perché il filtro è una funzione di sicurezza:
// un identificativo che non si aggancia è un piatto che non viene nascosto.
const ALLERGENI = [
  { id: 'glutine',      code: 'gluten',      label: 'Glutine',         hint: 'Pane, pasta, dolci',           color: '#c8a87a', icon: '🌾' },
  { id: 'crostacei',    code: 'crustaceans', label: 'Crostacei',       hint: 'Gamberi, scampi, granchio',    color: '#e88a5a', icon: '🦐' },
  { id: 'uova',         code: 'eggs',        label: 'Uova',            hint: 'Frittate, dolci, salse',       color: '#f0c14b', icon: '🥚' },
  { id: 'pesce',        code: 'fish',        label: 'Pesce',           hint: 'Acciughe, salse di pesce',     color: '#d96a52', icon: '🐟' },
  { id: 'arachidi',     code: 'peanuts',     label: 'Arachidi',        hint: 'Creme, salse, fritti',         color: '#c89860', icon: '🥜' },
  { id: 'soia',         code: 'soybeans',    label: 'Soia',            hint: 'Tofu, tempeh, salsa di soia',  color: '#9ec27a', icon: '🌱' },
  { id: 'lattosio',     code: 'milk',        label: 'Lattosio',        hint: 'Latte, formaggi, burro',       color: '#f5c2c7', icon: '🥛' },
  { id: 'fruttaguscio', code: 'nuts',        label: 'Frutta a guscio', hint: 'Noci, nocciole, mandorle',     color: '#a07050', icon: '🥜' },
  { id: 'sedano',       code: 'celery',      label: 'Sedano',          hint: 'Brodi, soffritti',             color: '#7ec98a', icon: '🥬' },
  { id: 'senape',       code: 'mustard',     label: 'Senape',          hint: 'Salse, marinature',            color: '#e8c850', icon: '🌶' },
  { id: 'sesamo',       code: 'sesame',      label: 'Sesamo',          hint: 'Pane, hummus, condimenti',     color: '#d4b06a', icon: '⚪' },
  { id: 'solfiti',      code: 'sulphites',   label: 'Solfiti',         hint: 'Vino, frutta secca, conserve', color: '#b07ac0', icon: '🍇' },
  { id: 'lupini',       code: 'lupin',       label: 'Lupini',          hint: 'Farine, sostituti vegetali',   color: '#f0b878', icon: '🫘' },
  { id: 'molluschi',    code: 'molluscs',    label: 'Molluschi',       hint: 'Cozze, vongole, calamari',     color: '#7aa8c8', icon: '🐚' },
];
const ALLERGENI_MAP = ALLERGENI.reduce(function (m, a) { m[a.id] = a; return m; }, {});

// ─── Regimi alimentari: gli otto, e il loro regime giuridico ───
// L'identificativo e il codice del dizionario `dietary_labels` del modello,
// che e condiviso con il catalogo: cosi la dichiarazione della persona
// incontra l'etichetta del piatto. Prima erano due vocabolari, e il profilo
// scriveva `senzaglutine` dove il catalogo scrive `senza_glutine`.
//
// `art9` non e una cautela ma la classificazione che governa il cancello del
// consenso. Vale per la voce DICHIARATA DA UNA PERSONA SU DI SE: un piatto
// vegano non rivela nulla di nessuno, una persona che si dichiara vegana si.
//   conviction — rivela una convinzione religiosa o filosofica
//   health     — rivela una condizione di salute
//   both       — rivela l'una e l'altra
//   null       — non rivela ne l'una ne l'altra: e dato comune
// Il criterio e quello delle linee guida EDPB 01/2021, caso 15: «contrariamente
// ad altre preferenze alimentari, l'intolleranza al lattosio non puo di norma
// essere collegata a convinzioni religiose o filosofiche».
const REGIMI = [
  { id: 'vegetariano',   label: 'Vegetariano',   emoji: '🥗', art9: 'conviction' },
  { id: 'vegano',        label: 'Vegano',        emoji: '🌱', art9: 'conviction' },
  { id: 'pescetariano',  label: 'Pescetariano',  emoji: '🐟', art9: 'conviction' },
  { id: 'halal',         label: 'Halal',         emoji: '🌙', art9: 'conviction' },
  { id: 'kosher',        label: 'Kosher',        emoji: '✡️', art9: 'conviction' },
  { id: 'senza_glutine', label: 'Senza glutine', emoji: '🌾', art9: 'health' },
  { id: 'astemio',       label: 'Astemio',       emoji: '🚫', art9: 'both' },
  { id: 'proteico',      label: 'Proteico',      emoji: '💪', art9: null },
];
const REGIMI_MAP = REGIMI.reduce(function (m, r) { m[r.id] = r; return m; }, {});

// Se la voce che si sta dichiarando ricada nell'articolo 9. Gli allergeni ci
// ricadono sempre, perche rivelano una condizione di salute. Fra i regimi
// dipende dalla voce: `proteico` e una preferenza nutrizionale e non rivela
// nulla, quindi chiedere per essa il consenso esplicito sarebbe raccolta in
// eccesso e indebolirebbe la granularita del consenso vero.
function richiedeConsensoEsplicito(gruppo, id) {
  if (gruppo === 'allergens') return true;
  const r = REGIMI_MAP[id];
  return !!(r && r.art9);
}

// Allergeni che la persona ha dichiarato nel profilo, letti dalla stessa
// chiave che il profilo scrive. È il collegamento che mancava: la
// dichiarazione esisteva e il menù non la guardava, quindi non proteggeva
// nessuno. Le voci non riconosciute si scartano, perché una preferenza
// salvata con un identificativo vecchio non deve far credere che un filtro
// sia attivo quando non lo è.
function allergeniDichiarati() {
  try {
    const raw = localStorage.getItem('byup_allergens');
    if (!raw) return {};
    const p = JSON.parse(raw) || {};
    const dichiarati = p.allergens || {};
    const out = {};
    Object.keys(dichiarati).forEach(function (id) {
      if (dichiarati[id] && ALLERGENI_MAP[id]) out[id] = true;
    });
    return out;
  } catch (e) { return {}; }
}

window.ByupKit = {
  ASSETS, PALETTE, THEMES, TYPE, RADII, SPRING, EASE_OUT, DUR,
  useByupTheme, haptic, Atmosphere, GlassPanel, PillButton,
  useFirstVisit, resetFirstVisits,
  MascotVisual, MascotMoment, Mascot, Confetti,
  GRAIN_URI,
  ALLERGENI, ALLERGENI_MAP, allergeniDichiarati,
  REGIMI, REGIMI_MAP, richiedeConsensoEsplicito,
};
/* sync */
})();

// ─── Registro consensi (GDPR) ───────────────────────────────────────────────
// Un solo posto per TUTTI i consensi dell'app (A3 allergeni, A18 offerte su
// preferenze, A6 marketing, dietary_suggestions esigenze alimentari nei
// suggerimenti) e per le opposizioni del legittimo interesse. Suggerimenti e
// analisi d'uso restano legittimo interesse, e dal 2026-09-03 (P-26 · D-28)
// hanno il loro INTERRUTTORE in «I miei dati» — dal 2026-09-04 (P-122)
// dentro il cassetto «Privacy e consensi», con la riga sull'art. 21: non è
// un consenso, è la misura di bilanciamento della LIA — attivo per difetto,
// spegnibile in due tocchi, e ogni cambio lascia in questo stesso log DUE
// righe coi nomi del modello, recommendations e analytics (ByupUso, sotto).
//
// I NOMI DEL MODELLO (P-123, consent_events.consent_type del modello v11):
//   recommendations      suggerimenti, legittimo interesse, attivi per difetto
//   analytics            analisi d'uso, legittimo interesse, attive per difetto
//   dietary_suggestions  esigenze alimentari nei suggerimenti, consenso
//                        esplicito distinto (art. 9.2.a), spento per difetto
// Le altre voci tengono l'id del registro dei trattamenti (A3, A18, A6) e la
// dichiarazione GEN. Hubble legge questo registro dallo stesso dominio, in
// sola lettura: la scheda utente mostra i tre interruttori con lo stato e la
// data dell'ultimo evento. Una voce SENZA stato vale «per difetto»: accesi
// recommendations e analytics, spento dietary_suggestions.
//
// REGOLA DI COMPOSIZIONE (chi può ricevere cosa):
//   promo generiche E su misura sullo storico ordini → basta A6 (che le
//     dichiara entrambe: PROMOP è stato assorbito in A6 il 2026-08-06 —
//     non reintrodurlo; il consenso unico NON copre i dati alimentari)
//   promo su pref. alimentari → A6 && A18 (mai da soli: il dato è sensibile)
//   suggerimenti in-app    → attivi salvo opposizione dall'interruttore di
//                            «I miei dati» (LI, niente consenso; la città
//                            viene dal contesto d'uso corrente, MAI dai log
//                            accesso/sicurezza)
//   esigenze alimentari nei suggerimenti → SOLO con dietary_suggestions
//                            acceso (D-03, LIA §4): a interruttore spento il
//                            motore non legge dieta né allergeni
// Due strutture: lo STATO corrente per voce e il LOG append-only
// (consent_data) — ogni cambio scrive una riga con timestamp e versione
// dell'informativa: è quella la prova, non lo stato.
//   byup_consent_state  { [consent_type]: { ok, action, quando, versione, natura, valore? } }
//   byup_consent_data   [ { id, consent_type, action: 'granted'|'revoked', ok,
//                           natura: 'consenso'|'opposizione'|'dichiarazione',
//                           quando (ISO), versione, valore?, revocato? }, … ]
(function () {
  const K_STATO = 'byup_consent_state';
  const K_LOG = 'byup_consent_data';
  const VERSIONE_INFORMATIVA = '1.0';
  const leggi = (k, fb) => { try { const r = localStorage.getItem(k); return r ? JSON.parse(r) : fb; } catch (e) { return fb; } };
  const scrivi = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const avvisa = () => { try { window.dispatchEvent(new Event('byup-consensi-change')); } catch (e) {} };
  // Le tre voci che Hubble mostra come interruttori, coi nomi del modello.
  const TIPI = {
    recommendations:     { label: 'Suggerimenti',                          base: 'legittimo interesse', difetto: true },
    analytics:           { label: "Analisi d'uso",                         base: 'legittimo interesse', difetto: true },
    dietary_suggestions: { label: 'Esigenze alimentari nei suggerimenti',  base: 'consenso esplicito (art. 9.2.a)', difetto: false },
  };
  const appendi = (riga) => { const log = leggi(K_LOG, []); log.push(riga); scrivi(K_LOG, log); };
  window.ByupConsensi = {
    VERSIONE_INFORMATIVA,
    TIPI,
    // {ok, action, quando, versione} oppure null se mai deciso
    stato(id) { return leggi(K_STATO, {})[id] || null; },
    // Lo stato EFFETTIVO: quello scritto, o il valore per difetto della voce
    // (le opposizioni del legittimo interesse partono accese, il consenso
    // alimentare parte spento; un consenso mai dato è spento).
    attivo(id) { const st = window.ByupConsensi.stato(id); if (st) return !!st.ok; return !!(TIPI[id] && TIPI[id].difetto); },
    // `extra` porta la natura della riga: 'consenso' (difetto), 'opposizione'
    // per le due voci del legittimo interesse, o quel che serve.
    set(id, ok, extra) {
      const quando = new Date().toISOString();
      const action = ok ? 'granted' : 'revoked';
      const natura = (extra && extra.natura) || 'consenso';
      const stato = leggi(K_STATO, {});
      stato[id] = { ok: !!ok, action, quando, versione: VERSIONE_INFORMATIVA, natura };
      scrivi(K_STATO, stato);
      appendi(Object.assign({ id, consent_type: id, action, ok: !!ok, natura, quando, versione: VERSIONE_INFORMATIVA }, extra || {}));
      avvisa();
      return stato[id];
    },
    // Revoca "profonda": azzera anche la decisione (torna "mai chiesto"),
    // ma il log conserva la storia.
    azzera(id) {
      const quando = new Date().toISOString();
      const stato = leggi(K_STATO, {});
      delete stato[id];
      scrivi(K_STATO, stato);
      appendi({ id, consent_type: id, action: 'revoked', ok: false, revocato: true, natura: 'consenso', quando, versione: VERSIONE_INFORMATIVA });
      avvisa();
    },
    // La DICHIARAZIONE di un dato facoltativo (P-84: il genere): non è un
    // consenso, è la traccia della scelta spontanea — con il valore, così si
    // distingue «scelto» da «preselezionato», che qui non esiste più. La
    // revoca è azzera(id): «Preferisco non specificare» che svuota.
    dichiara(id, valore) {
      const quando = new Date().toISOString();
      const stato = leggi(K_STATO, {});
      stato[id] = { ok: true, action: 'granted', quando, versione: VERSIONE_INFORMATIVA, natura: 'dichiarazione', valore };
      scrivi(K_STATO, stato);
      appendi({ id, consent_type: id, action: 'granted', ok: true, valore, natura: 'dichiarazione', quando, versione: VERSIONE_INFORMATIVA });
      avvisa();
      return stato[id];
    },
    log() { return leggi(K_LOG, []); },
    // L'ultimo evento di una voce, per la data a schermo.
    ultimo(id) { const l = leggi(K_LOG, []).filter(r => (r.consent_type || r.id) === id); return l.length ? l[l.length - 1] : null; },
  };
})();

// ─── Registro delle attività (P-122 · D-104, D-107) ────────────────────────
// La modifica dei dati anagrafici non chiede password né assistenza: il dato
// è una dichiarazione della persona e su quella Byup si basa. Il presidio è
// la traccia: ogni modifica scrive una riga con il valore precedente e il
// nuovo, come i recapiti (D-104), sul modello di audit_events (action,
// entity_type, old_value, new_value, created_at). Qui in localStorage; nel
// prodotto è il log immutabile, conservato cinque anni.
(function () {
  const K = 'byup_audit_events';
  const leggi = () => { try { const r = localStorage.getItem(K); return r ? JSON.parse(r) : []; } catch (e) { return []; } };
  window.ByupAttivita = {
    scrivi(action, dettagli) {
      const riga = Object.assign({ action, actor_type: 'user', entity_type: 'user', created_at: new Date().toISOString() }, dettagli || {});
      const log = leggi(); log.push(riga);
      if (log.length > 500) log.splice(0, log.length - 500);
      try { localStorage.setItem(K, JSON.stringify(log)); } catch (e) {}
      return riga;
    },
    eventi: leggi,
  };
})();

// ─── I testi legali dell'app: una proiezione, non un testo (P-80/81/82) ────
//
// QUESTO È UNA PROIEZIONE DEI DOCUMENTI UFFICIALI, sul pattern di TC-01
// (P-83): INF-01 «Informativa privacy consumer» versione 0.6 e TOS-01
// «Termini di servizio utente app» versione 1.1, le stesse che Hubble
// censisce nel catalogo documenti, con codice, versione e data in testa.
// Nessuna copia del testo, nemmeno parziale, può vivere altrove nell'app:
// la pagina legale dell'accesso (auth.jsx) e quella del Profilo (extras.jsx)
// leggono da qui. Prima c'erano quattro copie, due per documento, che si
// contraddicevano — sui cookie (una dichiarava Google Analytics, che non
// esiste), sull'età minima, sulle sezioni presenti — e chi trova due
// risposte diverse nella stessa app conclude che non è vera nessuna.
// Quando esisterà il backend, queste costanti diventano una chiamata.
//
// I tre punti riscritti su ciò che il prodotto fa (rilettura 28/08):
//   · cookie: nessun cookie di terze parti né analisi esterne (P-80);
//   · conservazione: dodici mesi per la cronologia degli accessi, cinque
//     anni per il registro immutabile, ventiquattro mesi per lo storico nel
//     profilo — i termini del piano delle conservazioni, senza «10 anni per
//     obblighi fiscali», che è l'obbligo dell'esercente sui suoi documenti,
//     né «13 mesi» sulla navigazione (P-81);
//   · prenotazioni: annullamento libero finché confermata, nessuna
//     conseguenza per la mancata presentazione — nessuna penale che il
//     prodotto non ha (P-82).
// La sezione sui suggerimenti dice l'interruttore di «I miei dati» (P-26),
// che ora esiste: «scrivendo all'assistenza» non era più vero.
//
// LA REGOLA DEL MOCKUP (P-113 · D-107): il prototipo mostra il
// COMPORTAMENTO dell'app, non riporta l'informativa e le condizioni d'uso
// nella versione depositata — i testi veri entrano nell'app vera. Il testo
// finto resta finto, ma ciò che dice sul comportamento deve essere vero.
// Quattro ritocchi del 2026-09-04, più uno che discende da P-123:
//   · «Dati raccolti» non parla più di «pagine visitate, preferenze,
//     ricerche», che D-31 ha escluso e il modello non ha: dice i tre eventi
//     d'uso e l'interruttore che li governa (P-26);
//   · due sezioni nuove, «Posizione» e «Accesso con Google», perché l'app
//     chiede l'una e offre l'altro;
//   · «Prenotazioni e annullamenti» tiene la regola dei conti lasciati
//     aperti (TOS-01 art. 7): con una quota non saldata non si apre un
//     nuovo tavolo né si prenota;
//   · i dati societari (sede, partita IVA) restano finti ma DICHIARATI
//     tali: fra ⟦ e ⟧, che le due viste rendono con l'evidenziazione da
//     segnaposto dei documenti (D-73), e la riga sotto l'intestazione che
//     dice che cosa sono;
//   · «Suggerimenti personalizzati» e «Preferenze alimentari» dicono il
//     consenso distinto dietary_suggestions (P-123): a interruttore spento
//     il motore non legge la dieta, acceso i piatti compatibili salgono.
const BYUP_LEGAL = {
  INF01: {
    codice: 'INF-01', nome: 'Informativa sulla privacy', versione: '0.6', pubblicata: '2026-08-04',
    sezioni: [
      { h: 'Titolare del trattamento', p: 'byup S.r.l., con sede legale in ⟦Via del Corso 10, 00186 Roma (RM)⟧, C.F. / P.IVA ⟦12345678901⟧, è il titolare del trattamento dei dati personali raccolti tramite questa applicazione. Contatto DPO: privacy@byup.it' },
      { h: 'Dati raccolti', p: 'Raccogliamo i dati che fornisci durante la registrazione (nome, cognome, e-mail, numero di telefono), i dati delle prenotazioni e le preferenze alimentari (allergeni, diete) che scegli di inserire volontariamente. Dell\'uso dell\'app registriamo tre soli eventi — apertura dell\'app, scansione di un QR, menù visto — con la città approssimata del momento, e solo finché tieni acceso l\'interruttore “Suggerimenti e analisi d\'uso” in “I miei dati”; nient\'altro dell\'uso che fai dell\'app.' },
      { h: 'Posizione', p: 'La chiediamo solo per mostrarti i locali vicini e non la conserviamo. Se non la concedi, l\'app resta usabile con il QR e i link.' },
      { h: 'Accesso con Google', p: 'Se entri con Google, usiamo il tuo indirizzo per creare l\'account, nient\'altro.' },
      { h: 'Finalità e base giuridica', p: 'I dati sono trattati per: (a) eseguire il contratto di servizio (art. 6.1.b GDPR); (b) adempiere a obblighi legali (art. 6.1.c GDPR); (c) inviarti comunicazioni promozionali, anche personalizzate sul tuo storico ordini su byup, solo previo tuo consenso (art. 6.1.a GDPR); le offerte basate sulle preferenze alimentari richiedono un consenso separato ed esplicito (art. 9.2.a GDPR).' },
      { h: 'Preferenze alimentari e allergeni', p: 'Allergeni, diete e preferenze alimentari possono rivelare dati su salute o convinzioni religiose (art. 9 GDPR): li trattiamo solo con il tuo consenso esplicito (art. 9.2.a) e solo per filtrare i menù. Con un consenso separato e facoltativo possiamo usarli anche per proporti offerte in linea (es. proposte senza glutine): in quel caso le notifiche hanno testo generico e il dettaglio dell\'offerta è visibile solo in app. Con un altro consenso distinto, l\'interruttore “Usa le mie esigenze alimentari per i suggerimenti” in “Dieta & allergeni”, i piatti compatibili con la tua dieta salgono in cima anche nei suggerimenti. Puoi revocare tutti questi consensi da “I miei dati”: alla revoca del primo, le preferenze salvate vengono cancellate.' },
      { h: 'Conservazione', p: 'I dati dell\'account sono conservati per la durata del rapporto. La cronologia degli accessi è conservata per dodici mesi, il registro immutabile delle operazioni per cinque anni, lo storico nel profilo per ventiquattro mesi.' },
      { h: 'I tuoi diritti', p: 'Hai diritto di accedere, rettificare, cancellare e portare i tuoi dati (artt. 15-20 GDPR). Puoi opporti al trattamento o chiedere la limitazione in qualsiasi momento scrivendo a privacy@byup.it. Hai inoltre il diritto di proporre reclamo al Garante per la Protezione dei Dati Personali (www.garanteprivacy.it).' },
      { h: 'Suggerimenti personalizzati', p: 'Per proporti locali e piatti in linea con i tuoi gusti usiamo, sulla base del nostro legittimo interesse (art. 6.1.f GDPR), i gusti che dichiari nel profilo, il tuo storico ordini su byup e la città del tuo contesto d\'uso corrente (posizione usata al volo o città selezionata). Allergeni e preferenze alimentari non entrano nei suggerimenti, salvo che tu lo chieda con il consenso distinto in “Dieta & allergeni”; mai i log di accesso registrati per sicurezza. Puoi spegnere suggerimenti e analisi d\'uso in qualsiasi momento dall\'interruttore in “I miei dati” → “Privacy e consensi”: torneranno proposte generiche e l\'app smetterà di registrare gli eventi d\'uso.' },
      { h: 'Cookie e tecnologie simili', p: 'L\'app non utilizza cookie di terze parti né strumenti di analisi esterni. Le statistiche su come usi l\'app sono elaborate internamente da byup, come descritto in questa informativa e, se sei autenticato, restano collegate al tuo profilo: puoi opporti in qualsiasi momento dall\'interruttore in “I miei dati” → “Privacy e consensi”.' },
      { h: 'Trasferimenti internazionali', p: 'Alcuni fornitori di servizi (es. infrastruttura cloud) potrebbero trattare dati al di fuori dell\'UE. In tal caso garantiamo adeguate salvaguardie tramite Clausole Contrattuali Standard approvate dalla Commissione Europea.' },
    ],
  },
  TOS01: {
    codice: 'TOS-01', nome: 'Termini di servizio', versione: '1.1', pubblicata: '2026-08-04',
    sezioni: [
      { h: 'Accettazione dei termini', p: 'Utilizzando byup accetti integralmente i presenti Termini e Condizioni. Se non li accetti, ti preghiamo di non utilizzare il servizio. byup si riserva il diritto di modificarli in qualsiasi momento; le modifiche saranno efficaci dalla pubblicazione sull\'app.' },
      { h: 'Descrizione del servizio', p: 'byup è una piattaforma digitale che consente agli utenti di scoprire ristoranti, consultare menu e effettuare prenotazioni. Il servizio è disponibile per utenti che hanno compiuto 14 anni, registrati con un account personale.' },
      { h: 'Prenotazioni e annullamenti', p: 'Puoi annullare una prenotazione dall\'app finché è confermata, senza costi. Se non ti presenti, non ti addebitiamo nulla. Resta la regola dei conti lasciati aperti: finché una quota non è saldata, non puoi aprire un nuovo tavolo né prenotare dall\'app.' },
      { h: 'Responsabilità', p: 'byup funge da intermediario tra utente e ristoratore. Non siamo responsabili di variazioni di menu, prezzi, orari o qualità del servizio reso dai locali partner. In caso di problemi con una prenotazione, contatta il supporto entro 24 ore.' },
      { h: 'Proprietà intellettuale', p: 'Tutti i contenuti presenti su byup (logo, testi, immagini, interfaccia) sono di proprietà di byup S.r.l. o dei rispettivi titolari. È vietata qualsiasi riproduzione o utilizzo non autorizzato.' },
      { h: 'Legge applicabile', p: 'I presenti Termini sono regolati dalla legge italiana. Per qualsiasi controversia è competente in via esclusiva il Foro di Roma.' },
    ],
  },
};
// La riga in testa alle due viste: codice, versione, data — non «Aggiornato
// il 1 gennaio 2025», che non era di nessun documento.
BYUP_LEGAL.intestazione = (doc) => `${doc.codice} · versione ${doc.versione} · pubblicata il ${new Date(doc.pubblicata + 'T00:00:00').toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}`;
// I segnaposto (P-113 · D-73): i tratti fra ⟦ e ⟧ sono dati finti dichiarati
// tali. segmenti() spezza un paragrafo in tratti, Paragrafo li rende con
// l'evidenziazione gialla dei documenti e il titolo «esempio», e le due viste
// (accesso e Profilo) usano QUESTO componente, così il marcatore non arriva
// mai a schermo come carattere. haSegnaposto() decide se mostrare la nota.
BYUP_LEGAL.segmenti = (p) => String(p || '').split(/(⟦[^⟧]*⟧)/g).filter(Boolean).map(t => t.startsWith('⟦') ? { testo: t.slice(1, -1), segnaposto: true } : { testo: t, segnaposto: false });
BYUP_LEGAL.haSegnaposto = (doc) => (doc.sezioni || []).some(s => /⟦/.test(s.p));
BYUP_LEGAL.NOTA_SEGNAPOSTO = 'I dati evidenziati sono un esempio: sede e partita IVA vere entreranno nell\'app vera, non in questo prototipo.';
BYUP_LEGAL.Paragrafo = function Paragrafo({ p, style }) {
  return (
    <div style={style}>
      {BYUP_LEGAL.segmenti(p).map((s, i) => s.segnaposto
        ? <mark key={i} title="Esempio: dato segnaposto" style={{ background: '#FFE97A', color: '#3b2a00', padding: '0 4px', borderRadius: 4, fontWeight: 600, boxDecorationBreak: 'clone', WebkitBoxDecorationBreak: 'clone' }}>{s.testo}<span aria-hidden style={{ fontSize: '0.72em', fontWeight: 800, letterSpacing: .4, marginLeft: 4, textTransform: 'uppercase', opacity: .8 }}>esempio</span></mark>
        : <React.Fragment key={i}>{s.testo}</React.Fragment>)}
    </div>
  );
};
window.ByupLegal = BYUP_LEGAL;

// ─── Gusti: la copia del dizionario (P-28 · D-28) ───────────────────────────
// Copia VERBATIM di PN_GUSTI (gestionale/panoramica-tokens.jsx, P-29 · D-28),
// come ALLERGENI: il dizionario è uno, Hubble lo governa, i bundle sono tre —
// finché non sarà servito dalla piattaforma questa è la copia dell'app e si
// riallinea a mano. I gusti che il consumatore può spuntare sono i soli
// food_tag con selectable_by_consumer vero, diciassette: MAI i tre regimi
// (vegano, vegetariano, senza glutine), che sulla persona sono dato art. 9 e
// vivono in «Dieta & allergeni» dietro il consenso A3. Le voci viaggiano come
// codici stabili; l'etichetta si risolve a schermo. Prima c'erano dodici
// stringhe libere (CUISINES) di cui sei soltanto esistevano fra i tag: un
// gusto dichiarato non incontrava alcun locale.
const GUSTI = [
  { id:'ristorante',    kind:'venue_category', label:'Ristorante',     icon:'forkKnife', desc:'Cucina completa con servizio al tavolo, pranzo e cena',   selectable_by_consumer:false, is_dietary_regime:false },
  { id:'pizzeria',      kind:'venue_category', label:'Pizzeria',       icon:'pizza',     desc:'La pizza al centro del menù, al tavolo o d\'asporto',      selectable_by_consumer:false, is_dietary_regime:false },
  { id:'giapponese',    kind:'venue_category', label:'Giapponese',     icon:'fish',      desc:'Sushi, ramen e cucina nipponica',                          selectable_by_consumer:false, is_dietary_regime:false },
  { id:'carne_griglia', kind:'venue_category', label:'Carne e Griglia',icon:'steak',     desc:'Braceria: tagli, grigliate e affumicati',                  selectable_by_consumer:false, is_dietary_regime:false },
  { id:'cucina_etnica', kind:'venue_category', label:'Cucina etnica',  icon:'globe',     desc:'Sapori dal mondo: indiano, messicano, mediorientale',      selectable_by_consumer:false, is_dietary_regime:false },
  { id:'bar',           kind:'venue_category', label:'Bar',            icon:'coffee',    desc:'Caffetteria, colazioni e aperitivi veloci',                selectable_by_consumer:false, is_dietary_regime:false },
  { id:'bistrot',       kind:'venue_category', label:'Bistrot',        icon:'cheers',    desc:'Informale e curato: piatti semplici e buoni vini',         selectable_by_consumer:false, is_dietary_regime:false },
  { id:'enoteca',       kind:'venue_category', label:'Enoteca',        icon:'wine',      desc:'Vini al calice con taglieri e degustazioni',               selectable_by_consumer:false, is_dietary_regime:false },

  { id:'pizza',         kind:'food_tag', label:'Pizza',         selectable_by_consumer:true,  is_dietary_regime:false },
  { id:'sushi',         kind:'food_tag', label:'Sushi',         selectable_by_consumer:true,  is_dietary_regime:false },
  { id:'pasta',         kind:'food_tag', label:'Pasta',         selectable_by_consumer:true,  is_dietary_regime:false },
  { id:'hamburger',     kind:'food_tag', label:'Hamburger',     selectable_by_consumer:true,  is_dietary_regime:false },
  { id:'carne',         kind:'food_tag', label:'Carne',         selectable_by_consumer:true,  is_dietary_regime:false },
  { id:'pesce',         kind:'food_tag', label:'Pesce',         selectable_by_consumer:true,  is_dietary_regime:false },
  { id:'poke',          kind:'food_tag', label:'Poke',          selectable_by_consumer:true,  is_dietary_regime:false },
  { id:'ramen',         kind:'food_tag', label:'Ramen',         selectable_by_consumer:true,  is_dietary_regime:false },
  { id:'vegano',        kind:'food_tag', label:'Vegano',        selectable_by_consumer:false, is_dietary_regime:true  },
  { id:'vegetariano',   kind:'food_tag', label:'Vegetariano',   selectable_by_consumer:false, is_dietary_regime:true  },
  { id:'senza_glutine', kind:'food_tag', label:'Senza glutine', selectable_by_consumer:false, is_dietary_regime:true  },
  { id:'dolci',         kind:'food_tag', label:'Dolci',         selectable_by_consumer:true,  is_dietary_regime:false },
  { id:'gelato',        kind:'food_tag', label:'Gelato',        selectable_by_consumer:true,  is_dietary_regime:false },
  { id:'brunch',        kind:'food_tag', label:'Brunch',        selectable_by_consumer:true,  is_dietary_regime:false },
  { id:'aperitivo',     kind:'food_tag', label:'Aperitivo',     selectable_by_consumer:true,  is_dietary_regime:false },
  { id:'cinese',        kind:'food_tag', label:'Cinese',        selectable_by_consumer:true,  is_dietary_regime:false },
  { id:'indiano',       kind:'food_tag', label:'Indiano',       selectable_by_consumer:true,  is_dietary_regime:false },
  { id:'messicano',     kind:'food_tag', label:'Messicano',     selectable_by_consumer:true,  is_dietary_regime:false },
  { id:'kebab',         kind:'food_tag', label:'Kebab',         selectable_by_consumer:true,  is_dietary_regime:false },
  { id:'frittura',      kind:'food_tag', label:'Frittura',      selectable_by_consumer:true,  is_dietary_regime:false },
];
(function () {
  const K = 'byup_gusti';
  const SCEGLIBILI = GUSTI.filter(g => g.kind === 'food_tag' && g.selectable_by_consumer);
  const leggi = () => { try { const r = localStorage.getItem(K); const v = r ? JSON.parse(r) : []; return Array.isArray(v) ? v.filter(id => SCEGLIBILI.some(g => g.id === id)) : []; } catch (e) { return []; } };
  window.ByupGusti = {
    DIZIONARIO: GUSTI,
    SCEGLIBILI,
    label(id) { const g = GUSTI.find(x => x.id === id); return g ? g.label : id; },
    // I gusti dichiarati: codici, solo fra gli scegliibili — un regime che
    // arrivasse qui per errore non passa.
    leggi,
    scrivi(ids) { const v = [...new Set((ids || []).filter(id => SCEGLIBILI.some(g => g.id === id)))]; try { localStorage.setItem(K, JSON.stringify(v)); } catch (e) {} try { window.dispatchEvent(new Event('byup-gusti-change')); } catch (e) {} return v; },
    commuta(id) { const v = leggi(); return window.ByupGusti.scrivi(v.includes(id) ? v.filter(x => x !== id) : [...v, id]); },
  };
})();

// ─── L'interruttore e il registro d'uso (P-26 · D-28, P-38 · D-31) ─────────
// Suggerimenti e analisi d'uso stanno sotto un interruttore SOLO, perché
// senza misurare non si sa se i consigli siano buoni. Attivo per difetto:
// la base è il legittimo interesse, l'interruttore non è un consenso e non
// va chiamato così — è la misura di bilanciamento su cui la LIA fonda
// l'opposizione facile. Spegnerlo scrive nel log consent_data DUE righe coi
// nomi del modello (P-122 · P-123), recommendations e analytics, action
// 'revoked' e natura 'opposizione'; riaccenderlo ne scrive due 'granted'.
// (Fino al 2026-09-04 era una riga sola, LI-SUGG: le righe vecchie restano
// nel log come storia.) Gli eventi d'uso (app_usage_events) sono tre e basta —
// app_open, qr_scan, menu_view — e si scrivono solo con l'interruttore
// acceso; allo spegnimento non si scrive più. Mai indirizzo di rete,
// coordinate, impronta del dispositivo: l'unica informazione di luogo è la
// città approssimata del momento d'uso, che nel prototipo è quella
// dell'header («Roma», senza «centro»), mai dai log di accesso.
(function () {
  const K_SUGG = 'byup_suggerimenti';   // 'on' | 'off'; assente = on
  const K_USO = 'byup_usage_events';
  const TIPI = ['app_open', 'qr_scan', 'menu_view'];
  const leggi = (k, fb) => { try { const r = localStorage.getItem(k); return r ? JSON.parse(r) : fb; } catch (e) { return fb; } };
  const scrivi = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  window.ByupUso = {
    TIPI,
    // La città approssimata del contesto d'uso: nel mock è quella dell'header.
    citta() { return 'Roma'; },
    suggerimenti() { return leggi(K_SUGG, 'on') !== 'off'; },
    imposta(on) {
      scrivi(K_SUGG, on ? 'on' : 'off');
      // La traccia dell'opposizione (o della riattivazione) nel log dei
      // consensi: stesso registro, due voci coi nomi del modello, natura
      // 'opposizione' — NON è un consenso. Hubble le legge da lì.
      if (window.ByupConsensi) {
        window.ByupConsensi.set('recommendations', !!on, { natura: 'opposizione' });
        window.ByupConsensi.set('analytics', !!on, { natura: 'opposizione' });
      }
      try { window.dispatchEvent(new Event('byup-suggerimenti-change')); } catch (e) {}
      return !!on;
    },
    // L'emissione: tre tipi, la città, il momento. Con l'interruttore spento
    // non scrive, e non scrive nient'altro in nessun caso.
    emetti(tipo, venue) {
      if (!TIPI.includes(tipo)) return null;
      if (!window.ByupUso.suggerimenti()) return null;
      const log = leggi(K_USO, []);
      const riga = { tipo, quando: new Date().toISOString(), citta: window.ByupUso.citta(), venue: venue || null };
      log.push(riga);
      if (log.length > 500) log.splice(0, log.length - 500);
      scrivi(K_USO, log);
      return riga;
    },
    eventi() { return leggi(K_USO, []); },
  };
})();

// ─── Sospensione delle recensioni (P-88) ─────────────────────────────────────
// Nell'app la sospensione arriva dal backend; qui è un mock in byup_sospensione
// con gli stessi campi del registro di Hubble: da quando, fino a quando, il
// motivo, cosa è stato deciso sulle recensioni già pubblicate. La
// comunicazione compare in Posta una volta sola: comunicataIl dice se è già
// stata mostrata. Demo: ?sospensione=1 la accende, ?sospensione=0 la spegne.
(function () {
  const K = 'byup_sospensione';
  const leggi = () => { try { return JSON.parse(localStorage.getItem(K) || 'null'); } catch { return null; } };
  const scrivi = (v) => { try { if (v) localStorage.setItem(K, JSON.stringify(v)); else localStorage.removeItem(K); } catch {} return v; };
  window.ByupSospensione = {
    leggi,
    attiva() { const r = leggi(); return !!r && new Date(r.fine) > new Date(); },
    segnaComunicata() { const r = leggi(); if (r && !r.comunicataIl) scrivi({ ...r, comunicataIl: new Date().toISOString() }); },
    azzera() { scrivi(null); },
    demo() {
      const dal = new Date(Date.now() - 3 * 86400000);
      return scrivi({ dal: dal.toISOString(), fine: new Date(dal.getTime() + 30 * 86400000).toISOString(), durataGiorni: 30,
        motivo: 'Recensioni a una stella in serie sullo stesso locale, senza un ordine collegato', esistenti: 'restano', motivoRimozione: null, comunicataIl: null });
    },
  };
  try {
    const q = new URLSearchParams(window.location.search).get('sospensione');
    if (q === '1') window.ByupSospensione.demo(); else if (q === '0') window.ByupSospensione.azzera();
  } catch {}
})();

// ─── Coperto e servizio (P-103) ──────────────────────────────────────────────
// Copia guardata di byupReadCoperto / byupCopertoRiga (gestionale/panoramica-
// tokens.jsx): stesso registro byup_coperto sullo stesso dominio, stesso
// default (coperto, fisso a persona, e importo ZERO: la cifra la sceglie il
// ristorante, e a zero la voce è spenta e non compare), stessa riga. Nell'app la voce si
// mostra PRIMA della conferma dell'ordine, col nome scelto dall'esercente e
// l'importo o l'aliquota, e il conto la ripete con lo stesso nome.
(function () {
  const K = 'byup_coperto';
  const DEF = { qualificazione: 'coperto', forma: 'fissa', importo: 0, aliquota: 0 };
  const NOMI = { coperto: 'Coperto', servizio: 'Servizio' };
  const leggi = () => { try { const s = localStorage.getItem(K); return s ? Object.assign({}, DEF, JSON.parse(s)) : { ...DEF }; } catch { return { ...DEF }; } };
  window.ByupCoperto = {
    leggi,
    riga(subtotale, coperti, cfg) {
      const c = cfg || leggi();
      const nome = NOMI[c.qualificazione] || 'Coperto';
      if (c.forma === 'percentuale') {
        const aliquota = Number(c.aliquota) || 0;
        return { nome, attiva: aliquota > 0, forma: 'percentuale', aliquota, etichetta: `${nome} · ${aliquota}% sul totale`, dettaglio: `${nome} ${aliquota}%`, valore: Math.round((subtotale || 0) * aliquota) / 100 };
      }
      const importo = Number(c.importo) || 0; const n = Math.max(1, coperti || 1);
      return { nome, attiva: importo > 0, forma: 'fissa', importo, etichetta: `${nome} · ${importo.toFixed(2).replace('.', ',')} € a persona`, dettaglio: `${nome} × ${n}`, valore: Math.round(importo * n * 100) / 100 };
    },
  };
})();
