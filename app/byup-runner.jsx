/* Byup Runner — il byuppino corre, raccoglie il cibo, schiva la padella.
   Sostituisce il gratta & vinci nella schermata Byuppini → Portafoglio.

   Nota per chi ci mette mano: questo file gira in scope GLOBALE (script
   text/babel non isolato). Niente rest-destructuring né spread negli oggetti:
   Babel genererebbe helper con nomi fissi (_excluded, _extends) che
   collidono con quelli degli altri script. Vedi la nota sulle icone Ic.*. */

const RUN_BASE = 'assets/runner/';

// ── Le sei scene, in ordine. `suolo` è la frazione di banda a cui poggia il piede,
// misurata sulle illustrazioni. `cielo`/`terra` servono da fondale provvisorio
// finché i file delle scene non sono sul disco.
const RUN_SCENE = [
  { nome: 'Cucina',         suolo: 0.95, cielo: '#EAEFF2', terra: '#CBD4DA' },
  { nome: 'Bancone',        suolo: 0.97, cielo: '#F7E2CB', terra: '#C0813F' },
  { nome: 'Sala',           suolo: 0.96, cielo: '#F1DFC6', terra: '#A9743F' },
  { nome: 'Piazza',         suolo: 0.91, cielo: '#F8C68C', terra: '#DBCEB6' },
  { nome: 'Foresta',        suolo: 0.95, cielo: '#C6BEDC', terra: '#77855D' },
  { nome: 'Città neon',     suolo: 0.96, cielo: '#2B0B33', terra: '#4E1454' },
];

// Velocità di crociera per scena (px/s). Cambia solo al cambio scena.
const RUN_VELOCITA = [232, 268, 306, 348, 394, 446];
// Nell'ultima scena non si ricomincia il giro: si accelera a intervalli regolari.
const RUN_ULTIMA_PASSO = 16;      // px/s guadagnati ogni scatto
const RUN_ULTIMA_OGNI = 7.5;      // secondi fra uno scatto e l'altro
const RUN_VEL_MAX = 900;

const RUN_TESSERE = 2;            // quante copie del fondale prima del ponte
const RUN_G = 2000;               // gravità px/s²
const RUN_V0 = 620;               // spinta del salto px/s
const RUN_ORO_DURATA = 8;         // secondi di stato dorato
const RUN_ORO_MULT = 5;
const RUN_PUNTI_CIBO = 10;

const RUN_CIBI = ['pizza', 'panino', 'taco', 'nigiri', 'ramen', 'donut',
  'pancake', 'gelato', 'bubbletea', 'caffe', 'cappuccino', 'succo'];

// ── Geometria del palco ────────────────────────────────────────────────
// Il piede del byuppino sta SEMPRE alla stessa altezza sullo schermo: è la
// banda illustrata che scivola in verticale quando cambia la linea di terra
// della scena. Così il salto si legge sempre uguale e le tessere non si
// scalinano fra loro.
const RUN_TERRA_Y = 0.74;     // dove poggia il piede, frazione del campo
const RUN_BANDA_H = 0.80;     // altezza della banda illustrata
const RUN_ALT_BYUP = 76;      // altezza del personaggio in piedi
const RUN_BYUP_X = 74;        // la sua ascissa fissa sullo schermo

// Quale immagine tocca alla tessera k, e a quale scena appartiene.
function runTessera(k) {
  const passo = RUN_TESSERE + 1;
  const ultimo = (RUN_SCENE.length - 1) * passo;
  if (k >= ultimo) return { scena: RUN_SCENE.length - 1, ponte: false };
  const i = Math.floor(k / passo);
  const r = k % passo;
  return r < RUN_TESSERE ? { scena: i, ponte: false } : { scena: i, ponte: true };
}

function runSrcTessera(t) {
  return RUN_BASE + (t.ponte ? 'ponte-' + (t.scena + 1) : 'scena-' + (t.scena + 1)) + '.webp';
}

// Velocità di una tessera: il ponte corre già al passo della scena che introduce,
// così l'accelerazione la vedi arrivare invece di subirla.
function runVelTessera(t, secondiUltima) {
  const i = t.ponte ? Math.min(t.scena + 1, RUN_SCENE.length - 1) : t.scena;
  let v = RUN_VELOCITA[i];
  if (i === RUN_SCENE.length - 1) {
    v += Math.floor(secondiUltima / RUN_ULTIMA_OGNI) * RUN_ULTIMA_PASSO;
  }
  return Math.min(v, RUN_VEL_MAX);
}

function runLerp(a, b, k) { return a + (b - a) * k; }

// ── Precarico: se un fondale non c'è ancora, si usa la tinta provvisoria ──
function useRunImmagini() {
  const [pronte, setPronte] = React.useState({});
  React.useEffect(() => {
    let vivo = true;
    const src = [];
    for (let i = 1; i <= RUN_SCENE.length; i++) src.push(RUN_BASE + 'scena-' + i + '.webp');
    for (let i = 1; i < RUN_SCENE.length; i++) src.push(RUN_BASE + 'ponte-' + i + '.webp');
    src.forEach((s) => {
      const im = new Image();
      im.onload = () => { if (vivo) setPronte((p) => { const n = Object.assign({}, p); n[s] = true; return n; }); };
      im.src = s;
    });
    return () => { vivo = false; };
  }, []);
  return pronte;
}

// ── Il mondo ───────────────────────────────────────────────────────────
function runNuovoMondo() {
  return {
    x: 0,                 // distanza percorsa, px
    vy: 0,                // velocità verticale del byuppino
    y: 0,                 // altezza da terra, px (0 = a terra)
    aria: false,
    giu: false,
    t: 0,                 // tempo di gioco, s
    tUltima: 0,           // tempo passato nell'ultima scena
    passo: 0,             // fase dell'animazione di corsa
    daStacco: 99,         // s dallo stacco
    daAtterra: 99,        // s dall'atterraggio
    oro: 0,               // secondi di dorato rimasti
    lampo: 0,             // secondi di lampo di trasformazione
    punti: 0,
    presi: 0,
    cose: [],             // { tipo, x, y, id, chi }
    prossimo: 900,        // ascissa del prossimo gruppo: la prima padella non
                          // deve arrivare addosso prima che tu abbia capito il gioco
    primo: true,          // il gruppo d'apertura è sempre innocuo
    // Seme dal clock: senza, ogni partita avrebbe la stessa identica pista.
    seme: (Date.now() & 0x7fffffff) || 1,
    morto: false,
    scenaVista: 0,
  };
}

// Generatore pseudo-casuale deterministico: stessa partita, stesse forme,
// e niente Math.random sparso nel loop.
function runCaso(m) {
  m.seme = (m.seme * 1103515245 + 12345) & 0x7fffffff;
  return m.seme / 0x7fffffff;
}

// Distanza minima fra due ostacoli perché il salto basti sempre.
function runGapMinimo(v) {
  const volo = (2 * RUN_V0) / RUN_G;      // durata del salto, s
  return v * volo * 0.92 + 120;
}

// Che cosa può capitare, a seconda di quanta strada hai già fatto.
// Il gioco si apre gentile: la padella sospesa e la doppia arrivano quando
// hai già imparato il salto, non al secondo gruppo.
function runRepertorio(x) {
  const a = ['filotto', 'arco'];
  if (x > 1800) a.push('sospesa');
  if (x > 3200) a.push('arco', 'sospesa');
  if (x > 4200) a.push('doppia');
  if (x > 6000) a.push('doppia', 'sospesa');
  return a;
}

function runGeneraGruppo(m, v, altezzaSalto) {
  const rep = runRepertorio(m.prossimo);
  // una "b" d'oro ogni tanto, e mai prima che il gioco sia entrato nel vivo
  const forma = m.primo ? 'filotto'
    : (m.prossimo > 2600 && runCaso(m) < 0.09) ? 'oro'
    : rep[Math.floor(runCaso(m) * rep.length)];
  m.primo = false;
  const x0 = m.prossimo;
  const gap = runGapMinimo(v);
  let nuovoId = m.cose.length ? m.cose[m.cose.length - 1].id + 1 : 1;
  const spingi = (tipo, x, y, chi) => { m.cose.push({ tipo: tipo, x: x, y: y, id: nuovoId++, chi: chi, preso: false }); };

  const cibo = () => RUN_CIBI[Math.floor(runCaso(m) * RUN_CIBI.length)];

  if (forma === 'arco') {
    // padella a terra, con un arco di cibo che ti obbliga a saltarla per prenderlo.
    // L'arco parte alto abbastanza da non sovrapporsi alla padella: il cibo
    // vicino all'ostacolo dev'essere una scelta, non una trappola.
    spingi('padella', x0, 0);
    const n = 3 + Math.floor(runCaso(m) * 3);
    for (let i = 0; i < n; i++) {
      const k = n === 1 ? 0.5 : i / (n - 1);
      spingi('cibo', x0 - 140 + k * 280, 46 + Math.sin(Math.PI * k) * (altezzaSalto - 52), cibo());
    }
    m.prossimo = x0 + gap + runCaso(m) * 220;
  } else if (forma === 'sospesa') {
    // padella sospesa: qui ci si abbassa e si passa sotto
    spingi('padella', x0, RUN_ALT_BYUP * 0.62);
    for (let i = 0; i < 3; i++) spingi('cibo', x0 - 60 + i * 60, 14, cibo());
    m.prossimo = x0 + gap * 0.95 + runCaso(m) * 200;
  } else if (forma === 'doppia') {
    // due padelle ravvicinate: il cibo sta in mezzo, o lo prendi al volo o niente
    spingi('padella', x0, 0);
    spingi('padella', x0 + gap * 1.05, 0);
    spingi('cibo', x0 + gap * 0.52, 30 + altezzaSalto * 0.55, cibo());
    m.prossimo = x0 + gap * 1.05 + gap + runCaso(m) * 160;
  } else if (forma === 'oro') {
    // il byuppino d'oro: sempre sopra una padella, non è mai gratis
    spingi('padella', x0, 0);
    spingi('oro', x0, 34 + altezzaSalto * 0.72);
    m.prossimo = x0 + gap + 240;
  } else {
    // filotto a terra: il respiro fra due ostacoli
    const n = 4 + Math.floor(runCaso(m) * 3);
    for (let i = 0; i < n; i++) spingi('cibo', x0 + i * 56, 30, cibo());
    m.prossimo = x0 + n * 56 + 180 + runCaso(m) * 160;
  }
}

// ── Sprite del personaggio ─────────────────────────────────────────────
function runSpriteByup(m) {
  const oro = m.oro > 0;
  const car = oro ? 'oro/' : 'byup/';
  if (m.morto) return 'byup/colpito';
  if (m.giu && !m.aria) return car + 'giu';
  if (m.aria) {
    if (m.daStacco < 0.09) return oro ? 'oro/salto' : 'byup/stacco';
    if (m.vy > 40) return oro ? 'oro/salto' : 'byup/salita';
    return car + 'volo';
  }
  if (m.daAtterra < 0.12) return oro ? 'oro/corsa-3' : 'byup/atterra';
  const f = Math.floor(m.passo) % 3;
  return car + 'corsa-' + (f + 1);
}

// ── Riquadri di collisione, un filo generosi verso il giocatore ─────────
function runBoxByup(m) {
  const basso = m.giu && !m.aria;
  const w = basso ? RUN_ALT_BYUP * 0.86 : RUN_ALT_BYUP * 0.42;
  const h = basso ? RUN_ALT_BYUP * 0.46 : RUN_ALT_BYUP * 0.80;
  return { x: RUN_BYUP_X - w / 2, y: m.y, w: w, h: h };
}

function runBoxCosa(c, sx) {
  const lato = c.tipo === 'padella' ? 34 : c.tipo === 'oro' ? 30 : 28;
  return { x: sx - lato / 2, y: c.y + (c.tipo === 'padella' ? 4 : 0), w: lato, h: lato };
}

function runTocca(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

// ── Componente ─────────────────────────────────────────────────────────
function BypRunnerSheet({ onClose, onWin }) {
  const pronte = useRunImmagini();
  const boxRef = React.useRef(null);
  const mondoRef = React.useRef(runNuovoMondo());
  const [dim, setDim] = React.useState({ w: 402, h: 780 });
  const [fase, setFase] = React.useState('pronto');   // pronto | corsa | morto
  const [, batti] = React.useReducer((n) => n + 1, 0);
  const [record, setRecord] = React.useState(() => {
    try { return parseInt(localStorage.getItem('byup.runner.record') || '0', 10) || 0; } catch (e) { return 0; }
  });
  const [nuovoRecord, setNuovoRecord] = React.useState(false);
  const [salta, setSalta] = React.useState(false);    // animazione del tap sul byuppino
  const [cartello, setCartello] = React.useState(null);
  const faseRef = React.useRef(fase);
  faseRef.current = fase;

  // Il campo va rimisurato davvero, non solo al montaggio: fra "pronto" e
  // "corsa" cambiano gli ingombri intorno e una misura vecchia sfasa la
  // linea di terra di decine di pixel.
  React.useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const misura = () => {
      const w = el.clientWidth, h = el.clientHeight;
      if (w > 0 && h > 0) setDim((d) => (d.w === w && d.h === h ? d : { w: w, h: h }));
    };
    misura();
    let ro = null;
    if (typeof ResizeObserver !== 'undefined') { ro = new ResizeObserver(misura); ro.observe(el); }
    window.addEventListener('resize', misura);
    return () => { if (ro) ro.disconnect(); window.removeEventListener('resize', misura); };
  }, []);

  const bandaH = dim.h * RUN_BANDA_H;
  const tessW = Math.max(320, bandaH * 16 / 9);
  const altezzaSalto = (RUN_V0 * RUN_V0) / (2 * RUN_G);

  // Sotto quale tessera sta il byuppino, e a che quota è la terra lì.
  const infoQui = React.useCallback((x) => {
    const assoluto = x + RUN_BYUP_X;
    const k = Math.floor(assoluto / tessW);
    const f = (assoluto % tessW) / tessW;
    const t = runTessera(k);
    const s0 = RUN_SCENE[t.scena].suolo;
    const s1 = RUN_SCENE[Math.min(t.scena + 1, RUN_SCENE.length - 1)].suolo;
    const suolo = t.ponte ? runLerp(s0, s1, f) : s0;
    return { t: t, suolo: suolo, k: k };
  }, [tessW]);

  const avvia = () => {
    mondoRef.current = runNuovoMondo();
    setNuovoRecord(false);
    setCartello(null);
    setFase('corsa');
  };

  const spingiSu = React.useCallback(() => {
    const m = mondoRef.current;
    if (faseRef.current !== 'corsa' || m.morto) return;
    if (m.aria) return;
    m.vy = RUN_V0;
    m.aria = true;
    m.giu = false;
    m.daStacco = 0;
    if (window.BK && BK.haptic) BK.haptic.selection();
  }, []);

  const tieniGiu = React.useCallback((v) => {
    const m = mondoRef.current;
    if (faseRef.current !== 'corsa' || m.morto) return;
    m.giu = v;
    if (v && m.aria) { m.vy = Math.min(m.vy, -520); }  // in aria, giù accorcia il salto
  }, []);

  // ── Il ciclo ─────────────────────────────────────────────────────────
  React.useEffect(() => {
    if (fase !== 'corsa') return;
    let raf, prec = null, morto = false;
    const passo = (ts) => {
      if (morto) return;
      if (prec === null) prec = ts;
      let dt = (ts - prec) / 1000;
      prec = ts;
      if (dt > 0.05) dt = 0.05;              // niente salti dopo un blocco del thread
      const m = mondoRef.current;
      const info = infoQui(m.x);
      const v = runVelTessera(info.t, m.tUltima);

      m.t += dt;
      if (info.t.scena === RUN_SCENE.length - 1 && !info.t.ponte) m.tUltima += dt;
      m.x += v * dt;
      m.passo += dt * (v / 34);

      // verticale
      if (m.aria) {
        m.vy -= RUN_G * dt;
        m.y += m.vy * dt;
        if (m.y <= 0) { m.y = 0; m.vy = 0; m.aria = false; m.daAtterra = 0; }
      }
      m.daStacco += dt;
      m.daAtterra += dt;
      if (m.oro > 0) m.oro = Math.max(0, m.oro - dt);
      if (m.lampo > 0) m.lampo = Math.max(0, m.lampo - dt);

      // cartello del cambio scena
      if (info.t.scena !== m.scenaVista && !info.t.ponte) {
        m.scenaVista = info.t.scena;
        setCartello(RUN_SCENE[info.t.scena].nome);
        setTimeout(() => setCartello(null), 1700);
        if (window.BK && BK.haptic) BK.haptic.light();
      }

      // popolamento
      let guardia = 0;
      while (m.prossimo < m.x + dim.w + tessW && guardia++ < 12) {
        runGeneraGruppo(m, v, altezzaSalto);
      }
      // pulizia di quello che è uscito da sinistra
      if (m.cose.length > 90) m.cose = m.cose.filter((c) => c.x > m.x - 200);

      // collisioni
      const bB = runBoxByup(m);
      for (let i = 0; i < m.cose.length; i++) {
        const c = m.cose[i];
        if (c.preso) continue;
        const sx = c.x - m.x;
        if (sx < -80 || sx > dim.w + 80) continue;
        if (!runTocca(bB, runBoxCosa(c, sx))) continue;
        if (c.tipo === 'cibo') {
          c.preso = true;
          m.presi += 1;
          m.punti += RUN_PUNTI_CIBO * (m.oro > 0 ? RUN_ORO_MULT : 1);
          if (window.BK && BK.haptic) BK.haptic.light();
        } else if (c.tipo === 'oro') {
          c.preso = true;
          m.oro = RUN_ORO_DURATA;
          m.lampo = 0.45;
          if (window.BK && BK.haptic) BK.haptic.success();
        } else if (m.oro <= 0) {
          m.morto = true;
        }
      }

      if (m.morto) {
        morto = true;
        if (window.BK && BK.haptic) BK.haptic.error();
        const p = m.punti;
        if (p > record) {
          setRecord(p);
          setNuovoRecord(true);
          try { localStorage.setItem('byup.runner.record', String(p)); } catch (e) {}
          if (onWin) onWin();
        }
        setTimeout(() => setFase('morto'), 620);
        batti();
        return;
      }
      batti();
      raf = requestAnimationFrame(passo);
    };
    raf = requestAnimationFrame(passo);
    return () => { morto = true; cancelAnimationFrame(raf); };
  }, [fase, dim.w, tessW, altezzaSalto, infoQui, record, onWin]);

  // ── Tastiera ─────────────────────────────────────────────────────────
  React.useEffect(() => {
    const giu = (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        e.preventDefault();
        if (faseRef.current === 'corsa') spingiSu(); else avvia();
      } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        e.preventDefault(); tieniGiu(true);
      } else if (e.code === 'Escape') { onClose(); }
    };
    const su = (e) => { if (e.code === 'ArrowDown' || e.code === 'KeyS') tieniGiu(false); };
    window.addEventListener('keydown', giu);
    window.addEventListener('keyup', su);
    return () => { window.removeEventListener('keydown', giu); window.removeEventListener('keyup', su); };
  }, [spingiSu, tieniGiu, onClose]);

  const m = mondoRef.current;
  const info = infoQui(m.x);
  const terra = dim.h * RUN_TERRA_Y;
  // La banda si alza o si abbassa perché il piede resti su quella riga.
  const bandaTop = terra - bandaH * info.suolo;
  const oro = m.oro > 0;

  // Tessere di fondale visibili
  const tessere = [];
  const k0 = Math.floor(m.x / tessW);
  for (let k = k0; k <= k0 + Math.ceil(dim.w / tessW) + 1; k++) {
    const t = runTessera(k);
    const src = runSrcTessera(t);
    tessere.push({ k: k, left: k * tessW - m.x, src: pronte[src] ? src : null, scena: RUN_SCENE[t.scena], ponte: t.ponte });
  }

  // Fondale provvisorio: cielo fino alla linea di terra della scena, poi pavimento.
  const fondoBanda = (s) => {
    const p = (s.suolo * 100).toFixed(1) + '%';
    return 'linear-gradient(180deg,' + s.cielo + ' 0%,' + s.cielo + ' ' + p + ',' + s.terra + ' ' + p + ',' + s.terra + ' 100%)';
  };

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 80, background: '#120A14',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
      animation: 'fade .2s ease', userSelect: 'none', WebkitUserSelect: 'none',
    }}>
      <style>{`
@keyframes runSalta{0%{transform:translateY(0) scaleY(1)}25%{transform:translateY(0) scaleY(.86) scaleX(1.1)}55%{transform:translateY(-34px) scaleY(1.08) scaleX(.94)}100%{transform:translateY(0) scaleY(1)}}
@keyframes runLampo{0%{opacity:0;transform:translate(-50%,50%) scale(.3)}30%{opacity:1;transform:translate(-50%,50%) scale(1.15)}100%{opacity:0;transform:translate(-50%,50%) scale(1.7)}}
@keyframes runCartello{0%{opacity:0;transform:translateY(-10px)}18%{opacity:1;transform:translateY(0)}80%{opacity:1}100%{opacity:0}}
@keyframes runPulsa{0%,100%{opacity:.55}50%{opacity:1}}
@keyframes runSu{from{opacity:0;transform:translateY(14px) scale(.96)}to{opacity:1;transform:none}}
.runNoTap{-webkit-tap-highlight-color:transparent;touch-action:none}
`}</style>

      {/* ── Barra in alto ── */}
      <div style={{
        position: 'relative', zIndex: 6, paddingTop: 52, paddingLeft: 16, paddingRight: 16,
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: 1.6, textTransform: 'uppercase', color: 'rgba(255,255,255,.42)' }}>Punti</div>
          <div style={{ fontFamily: BK.TYPE.display, fontWeight: 700, fontSize: 30, lineHeight: 1, color: '#fff', display: 'flex', alignItems: 'baseline', gap: 8 }}>
            {m.punti}
            {oro && (
              <span style={{ fontSize: 13, fontWeight: 800, color: '#FFCB2E', fontFamily: 'inherit', animation: 'runPulsa 1s ease-in-out infinite' }}>×{RUN_ORO_MULT}</span>
            )}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: 1.6, textTransform: 'uppercase', color: 'rgba(255,255,255,.42)' }}>Record</div>
          <div style={{ fontFamily: BK.TYPE.display, fontWeight: 700, fontSize: 20, lineHeight: 1.1, color: 'rgba(255,255,255,.72)' }}>{record}</div>
        </div>
        <button onClick={onClose} aria-label="Chiudi" style={{
          marginLeft: 6, width: 34, height: 34, borderRadius: 999, cursor: 'pointer',
          border: '1px solid rgba(255,255,255,.18)', background: 'rgba(255,255,255,.08)',
          color: '#fff', fontSize: 17, lineHeight: 1, fontFamily: 'inherit', padding: 0,
        }}>✕</button>
      </div>

      {/* barra dello stato dorato */}
      <div style={{ position: 'relative', zIndex: 6, height: 3, margin: '10px 16px 0', borderRadius: 999, background: 'rgba(255,255,255,.10)', overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: (oro ? (m.oro / RUN_ORO_DURATA) * 100 : 0) + '%',
          background: 'linear-gradient(90deg,#FFD54A,#FF9A2E)', borderRadius: 999,
          transition: 'width .1s linear',
        }}/>
      </div>

      {/* ── Il campo ── */}
      <div
        ref={boxRef}
        className="runNoTap"
        onPointerDown={(e) => {
          if (fase === 'corsa') {
            const r = e.currentTarget.getBoundingClientRect();
            if (e.clientY - r.top > r.height * 0.72) tieniGiu(true); else spingiSu();
          }
        }}
        onPointerUp={() => tieniGiu(false)}
        onPointerCancel={() => tieniGiu(false)}
        onPointerLeave={() => tieniGiu(false)}
        style={{ position: 'relative', flex: 1, overflow: 'hidden', cursor: fase === 'corsa' ? 'pointer' : 'default' }}
      >
        {/* cielo dietro alla banda */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,#160D19 0%,#241428 55%,#160D19 100%)' }}/>

        {/* fondali affiancati */}
        <div style={{ position: 'absolute', left: 0, right: 0, top: bandaTop, height: bandaH, overflow: 'hidden' }}>
          {tessere.map((t) => (
            <div key={t.k} style={{
              position: 'absolute', top: 0, left: t.left, width: tessW, height: bandaH,
              backgroundImage: t.src ? 'url(' + t.src + ')' : fondoBanda(t.scena),
              backgroundSize: t.src ? '100% 100%' : 'auto',
              backgroundRepeat: 'no-repeat',
            }}>
              {!t.src && (
                <div style={{ position: 'absolute', left: 0, right: 0, top: bandaH * t.scena.suolo - 2, height: 3, background: 'rgba(0,0,0,.16)' }}/>
              )}
            </div>
          ))}
        </div>

        {/* zoccolo sotto la banda */}
        <div style={{
          position: 'absolute', left: 0, right: 0, top: bandaTop + bandaH, bottom: 0,
          background: 'linear-gradient(180deg,rgba(0,0,0,.55),#120A14 60%)',
        }}/>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: bandaTop, background: 'linear-gradient(180deg,#120A14,rgba(18,10,20,.2))' }}/>

        {/* cose in scena */}
        {m.cose.map((c) => {
          if (c.preso) return null;
          const sx = c.x - m.x;
          if (sx < -90 || sx > dim.w + 90) return null;
          if (c.tipo === 'padella') {
            return (
              <img key={c.id} src={RUN_BASE + 'padella.webp'} alt="" style={{
                position: 'absolute', left: sx, bottom: dim.h - terra + c.y,
                height: 46, transform: 'translateX(-50%)', pointerEvents: 'none',
                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,.45))' + (info.t.scena === 5 ? ' drop-shadow(0 0 6px rgba(255,120,180,.9))' : ''),
              }}/>
            );
          }
          if (c.tipo === 'oro') {
            return (
              <img key={c.id} src={RUN_BASE + 'b-oro.webp'} alt="" style={{
                position: 'absolute', left: sx, bottom: dim.h - terra + c.y,
                height: 40, transform: 'translateX(-50%)', pointerEvents: 'none',
                filter: 'drop-shadow(0 0 12px rgba(255,200,60,.85))',
              }}/>
            );
          }
          return (
            <img key={c.id} src={RUN_BASE + 'cibo/' + c.chi + '.webp'} alt="" style={{
              position: 'absolute', left: sx, bottom: dim.h - terra + c.y,
              height: 32, transform: 'translateX(-50%)', pointerEvents: 'none',
              filter: 'drop-shadow(0 3px 6px rgba(0,0,0,.35))',
            }}/>
          );
        })}

        {/* il byuppino */}
        <div style={{
          position: 'absolute', left: RUN_BYUP_X, bottom: dim.h - terra + m.y,
          transform: 'translateX(-50%)', pointerEvents: 'none', zIndex: 4,
        }}>
          {m.lampo > 0 && (
            <img src={RUN_BASE + 'oro/lampo.webp'} alt="" style={{
              position: 'absolute', left: '50%', bottom: 0, height: 130,
              animation: 'runLampo .45s ease-out forwards', pointerEvents: 'none',
            }}/>
          )}
          <img
            src={RUN_BASE + runSpriteByup(m) + '.webp'}
            alt=""
            style={{
              display: 'block', height: (m.giu && !m.aria) ? RUN_ALT_BYUP * 0.62 : RUN_ALT_BYUP,
              width: 'auto',
              filter: oro ? 'drop-shadow(0 0 10px rgba(255,200,60,.75))' : 'drop-shadow(0 6px 8px rgba(0,0,0,.35))',
              animation: salta ? 'runSalta .55s cubic-bezier(.3,.9,.4,1.2)' : 'none',
              transformOrigin: 'bottom center',
            }}
          />
        </div>

        {/* cartello del cambio scena */}
        {cartello && (
          <div style={{
            position: 'absolute', left: '50%', top: bandaTop + 14, transform: 'translateX(-50%)',
            padding: '7px 16px', borderRadius: 999, whiteSpace: 'nowrap',
            background: 'rgba(10,6,12,.62)', backdropFilter: 'blur(6px)',
            border: '1px solid rgba(255,255,255,.16)', color: '#fff',
            fontSize: 12, fontWeight: 800, letterSpacing: .8,
            animation: 'runCartello 1.7s ease forwards', pointerEvents: 'none', zIndex: 5,
          }}>{cartello}</div>
        )}

        {/* ── Schermata iniziale ── */}
        {fase === 'pronto' && (
          <div style={{
            position: 'absolute', inset: 0, zIndex: 8, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 4, textAlign: 'center',
            background: 'radial-gradient(120% 70% at 50% 46%, rgba(18,10,20,.35), rgba(18,10,20,.88))',
            padding: 24,
          }}>
            <button
              onClick={() => { setSalta(true); if (window.BK && BK.haptic) BK.haptic.light(); setTimeout(() => setSalta(false), 560); }}
              aria-label="Fai saltare il byuppino"
              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', marginBottom: 6 }}>
              <img src={RUN_BASE + 'byup/corsa-2.webp'} alt="" style={{
                display: 'block', height: 128, width: 'auto',
                filter: 'drop-shadow(0 12px 18px rgba(0,0,0,.5))',
                animation: salta ? 'runSalta .55s cubic-bezier(.3,.9,.4,1.2)' : 'none',
                transformOrigin: 'bottom center',
              }}/>
            </button>
            <div style={{ fontFamily: BK.TYPE.display, fontWeight: 700, fontSize: 28, color: '#fff', letterSpacing: -.4 }}>Byuppino Run</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,.66)', maxWidth: 260, lineHeight: 1.5, marginTop: 2 }}>
              Raccogli tutto quello che puoi. La padella non perdona.
            </div>
            <div style={{ display: 'flex', gap: 18, marginTop: 16, marginBottom: 18, color: 'rgba(255,255,255,.6)', fontSize: 11.5, fontWeight: 700 }}>
              <span>Tocca per saltare</span>
              <span style={{ opacity: .4 }}>·</span>
              <span>Tieni giù per abbassarti</span>
            </div>
            <button onClick={avvia} className="bk-press" style={{
              border: 'none', cursor: 'pointer', fontFamily: 'inherit', color: '#fff',
              background: 'linear-gradient(122deg,#E32459,#B81C47)', fontSize: 16, fontWeight: 800,
              padding: '15px 52px', borderRadius: 999,
              boxShadow: '0 16px 34px -12px rgba(227,36,89,.75)',
            }}>Si parte</button>
          </div>
        )}

        {/* ── Sconfitta ── */}
        {fase === 'morto' && (
          <div style={{
            position: 'absolute', inset: 0, zIndex: 8, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 24,
            background: 'radial-gradient(120% 70% at 50% 46%, rgba(18,10,20,.4), rgba(18,10,20,.92))',
            animation: 'runSu .3s ease',
          }}>
            <img src={RUN_BASE + 'byup/ko.webp'} alt="" style={{ height: 138, width: 'auto', filter: 'drop-shadow(0 12px 18px rgba(0,0,0,.5))' }}/>
            <div style={{ fontFamily: BK.TYPE.display, fontWeight: 700, fontSize: 25, color: '#fff', marginTop: 10 }}>
              {nuovoRecord ? 'Record!' : 'Padellata'}
            </div>
            <div style={{ display: 'flex', gap: 26, marginTop: 16, marginBottom: 22 }}>
              <div>
                <div style={{ fontFamily: BK.TYPE.display, fontWeight: 700, fontSize: 30, color: '#fff', lineHeight: 1 }}>{m.punti}</div>
                <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.4, textTransform: 'uppercase', color: 'rgba(255,255,255,.45)', marginTop: 5 }}>Punti</div>
              </div>
              <div>
                <div style={{ fontFamily: BK.TYPE.display, fontWeight: 700, fontSize: 30, color: '#fff', lineHeight: 1 }}>{m.presi}</div>
                <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.4, textTransform: 'uppercase', color: 'rgba(255,255,255,.45)', marginTop: 5 }}>Raccolti</div>
              </div>
              <div>
                <div style={{ fontFamily: BK.TYPE.display, fontWeight: 700, fontSize: 30, color: '#fff', lineHeight: 1 }}>{Math.round(m.x / 10)}</div>
                <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.4, textTransform: 'uppercase', color: 'rgba(255,255,255,.45)', marginTop: 5 }}>Metri</div>
              </div>
            </div>
            <button onClick={avvia} className="bk-press" style={{
              border: 'none', cursor: 'pointer', fontFamily: 'inherit', color: '#fff',
              background: 'linear-gradient(122deg,#E32459,#B81C47)', fontSize: 16, fontWeight: 800,
              padding: '15px 52px', borderRadius: 999,
              boxShadow: '0 16px 34px -12px rgba(227,36,89,.75)',
            }}>Riprova</button>
            <button onClick={onClose} style={{
              marginTop: 10, background: 'none', border: 'none', color: 'rgba(255,255,255,.55)',
              fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', padding: 8,
            }}>Chiudi</button>
          </div>
        )}
      </div>

      {/* ── Comando "abbassati" ──
          La riga c'è sempre, anche a gioco fermo: se comparisse solo durante la
          corsa accorcerebbe il campo e sposterebbe la linea di terra. */}
      <div style={{ position: 'relative', zIndex: 6, display: 'flex', justifyContent: 'center', padding: '10px 0 16px' }}>
        <button
          className="runNoTap"
          onPointerDown={(e) => { e.stopPropagation(); tieniGiu(true); }}
          onPointerUp={() => tieniGiu(false)}
          onPointerCancel={() => tieniGiu(false)}
          onPointerLeave={() => tieniGiu(false)}
          aria-label="Abbassati"
          disabled={fase !== 'corsa'}
          style={{
            width: 78, height: 44, borderRadius: 999, fontFamily: 'inherit',
            cursor: fase === 'corsa' ? 'pointer' : 'default',
            border: '1px solid rgba(255,255,255,.2)', color: '#fff', fontSize: 18,
            background: m.giu ? 'rgba(255,255,255,.22)' : 'rgba(255,255,255,.08)',
            opacity: fase === 'corsa' ? 1 : 0,
            transition: 'opacity .2s ease',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}>⌄</button>
      </div>
    </div>
  );
}

window.BypRunnerSheet = BypRunnerSheet;
